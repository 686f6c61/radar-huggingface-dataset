# Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4

## Resumen

GLM-5.3-Flash Jammed XSFP4 es un checkpoint cuantizado derivado de `nvidia/GLM-5.3-Flash-FP4-Local`, publicado por el usuario Bizuayeu. No es un lanzamiento oficial ni de NVIDIA ni de Z.AI: se trata de una requantización de los expertos enrutados del modelo GLM-5.3-Flash (arquitectura MoE, 331.033.893.726 parámetros totales segun los safetensors del repo) pensada especificamente para servir el modelo en dos o tres sistemas GB10 (clase DGX Spark) con el motor nativo de TensorFold y los kernels CSF0.

La innovacion principal es la compresion de las escalas de cuantizacion NVFP4: se pasa de bloques de 16 pesos a bloques de 32, y se aplica CSF0 (una escala base de un byte por fila mas pasos de 4 bits por escala), lo que reduce el consumo de memoria de las escalas de 19,03 GB a 4,86 GB. El resultado son 14,2 GB menos de VRAM en total (6,58 GiB menos por maquina a TP=2), con un coste medido de fidelidad frente a BF16 (KL 0,0470 frente a 0,0410 de XSFP4 y 0,0512 de NVFP4).

Es relevante ahora porque permite ampliar el pool de KV y la cache de prompt en despliegues multi-GB10 sin cambiar de hardware: a TP=2 la cache de prompt pasa de 6,8 a 13,4 GiB con una ventana de 524.288 tokens, manteniendo la velocidad de decodificacion (variacion de 0,4% o menos con drafts desactivados). El precio es una perdida pequena pero medible de cercania al modelo en BF16 y una dependencia total de un motor de inferencia especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (GLM-5.3-Flash), con capa MTP draft; solo se requantizan los expertos enrutados de las capas 3 a 44 |
| Parametros totales | 331.033.893.726 |
| Parametros activos | no disponible (la model card indica 8 de 288 expertos enrutados por capa y token) |
| Longitud de contexto | 524.288 tokens (ventana usada en las mediciones de cache de prompt) |
| Tipos de cuantizacion | NVFP4 con escalas en bloque 32 y CSF0 (4,13 bits por peso en los expertos enrutados); denso a 8 bits procedente de FP4-Local |
| Idiomas soportados | ja, en |
| Licencia | nvidia-open-model-agreement (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (132 archivos, 172,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 288 expertos enrutados por capa, de los que cada token activa 8. La capa densa (atencion, expertos compartidos, MLP de las primeras capas y cabeza) se mantiene a 8 bits o mas, heredada de `nvidia/GLM-5.3-Flash-FP4-Local`; solo los expertos enrutados de las capas 3 a 44 se recuantizan, partiendo de los pesos BF16 de `zai-org/GLM-5.3-Flash-BF16` con el suavizado de XSFP4. La logica es que un byte de un experto enrutado se usa aproximadamente 36 veces menos que un byte denso, por lo que ahi el ruido de cuantizacion es asumible.

La innovacion tecnica esta en las escalas: NVFP4 guarda un codigo de 4 bits por peso y una escala de un byte compartida por bloque. Aqui el bloque pasa de 16 a 32 pesos (la mitad de escalas) y se aplica CSF0, donde cada fila conserva un byte base y cada escala es un paso de 4 bits por encima; las escalas raras fuera de los 16 pasos de la fila se reubican dentro. Al tener cada escala una posicion fija, los kernels leen directamente donde esta y el ahorro llega a la VRAM, a diferencia de XSFP4, cuyo CSF debe expandirse a bytes planos antes de llegar a la GPU y cuyo ahorro queda solo en disco. No se documentan en la informacion disponible datos sobre el entrenamiento original (tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `image-text-to-text`, tags `conversational`).
- Entrada de imagen y texto: el pipeline declarado es image-text-to-text.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base GLM-5.3-Flash, aunque la model card no las detalla.
- Capa MTP (multi-token prediction) draft incluida byte a byte de FP4-Local, util para decodificacion especulativa con drafts.
- Soporte multilingue limitado a japones e ingles segun la metadata del repositorio.
- Tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en cluster de dos o tres GB10 (DGX Spark): el checkpoint esta disenado para TP=2 y TP=3, con el motor nativo de TensorFold y kernels CSF0, y libera 6,58 GiB por maquina a TP=2 para reasignar a cache de prompt o pool de KV.
- Ventanas de contexto largas en produccion: con 524.288 tokens de ventana, la cache de prompt se duplica de 6,8 a 13,4 GiB a TP=2, lo que permite mantener conversaciones o documentos largos en memoria sin recomputar el prefill.
- Atencion al cliente automatizada multi-turno: el contexto largo y el pipeline conversacional permiten gestionar historiales extensos; el modelo esta limitado a japones e ingles, por lo que el caso de uso encaja en mercados de esos idiomas.
- Asistentes sobre documentos con imagen y texto: el pipeline image-text-to-text habilita tareas de extraccion y respuesta sobre capturas, formularios o paginas escaneadas en entornos JA/EN.
- Despliegue con decodificacion especulativa: la capa MTP draft incluida permite usar drafts con una penalizacion de velocidad de 0,4% o menos con drafts desactivados, segun las mediciones del autor.
- Prototipado e investigacion en cuantizacion: el checkpoint sirve como referencia reproducible de NVFP4 con bloque 32 y CSF0, con metricas de KL, discrepancia top-1 y NLL frente a BF16 publicadas por el autor.
- Inferencia en local sobre hardware de clase workstation: con 83,43 GiB de modelo por maquina a TP=2, encaja en sistemas GB10 con memoria unificada, no en GPU consumer convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad frente a BF16 y de velocidad:

| Metrica | Jammed XSFP4 | XSFP4 | NVFP4 |
|---|---|---|---|
| KL frente a BF16 (menor es mejor) | 0,0470 | 0,0410 | 0,0512 |
| Error cuadratico relativo (18 matrices reales) | 1,22x | no disponible | no disponible |
| Variacion de decodificacion (drafts off) | 0,4% o menos | referencia | no disponible |
| Variacion de tiempo de prefill | 0,4% a 1,4% menos | referencia | no disponible |

| Memoria a TP=2 (primera maquina) | Bloque 16 (tamano XSFP4) | Jammed XSFP4 |
|---|---|---|
| Modelo | 90,01 GiB | 83,43 GiB |
| Cache de prompt | 6,8 GiB | 13,4 GiB |
| Pool de KV | 6,4 GiB | 6,4 GiB |
| Reserva | 12,2 GiB | 12,2 GiB |

## Requisitos de hardware

- VRAM estimada: 83,43 GiB de modelo por maquina a TP=2; el autor reporta 14,2 GB menos en total (6,58 GiB menos por maquina a TP=2 y 4,1 a 4,5 GiB a TP=3).
- GPU recomendadas: sistemas GB10 (clase DGX Spark). El modelo requiere dos o tres maquinas; no cabe en una sola GB10.
- GPU consumer: no cabe en RTX 4090 ni en GPUs consumer convencionales por el tamano del checkpoint (172 GB en disco, 83,43 GiB por maquina a TP=2).
- Opciones de despliegue: exclusivamente el motor nativo de TensorFold con kernels CSF0 (releases desde 1.2.3) o GLM-5.3-Flash BIZ desde 3.10.0 (por defecto a TP=2 entre 3.12.0 y 3.15.0; una linea de los rank files desde 3.16.0). vLLM, otros cargadores NVFP4 y TensorFold sin esos kernels no pueden leer el checkpoint.
- Latencia y throughput: con drafts desactivados la decodificacion varia 0,4% o menos y el prefill tarda entre 0,4% y 1,4% menos; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash Jammed XSFP4 | 331.033.893.726 | 524.288 | safetensors, NVFP4 bloque 32 + CSF0 | nvidia-open-model-agreement | Requiere TensorFold con CSF0; 83,43 GiB por maquina a TP=2 |
| GLM-5.3-Flash XSFP4 | mismo modelo base | 524.288 | safetensors, NVFP4 bloque 16 con CSF | nvidia-open-model-agreement | 90,01 GiB por maquina a TP=2; KL 0,0410; ahorro solo en disco |
| GLM-5.3-Flash FP4-Local (nvidia) | mismo modelo base | no disponible | safetensors, NVFP4 | nvidia-open-model-agreement | Checkpoint oficial de referencia; denso a 8 bits |
| GLM-5.3-Flash BF16 (zai-org) | mismo modelo base | no disponible | BF16 | no disponible | Referencia de maxima fidelidad usada para la requantizacion |

## Limitaciones y advertencias

- Perdida de fidelidad medible: KL de 0,0470 frente a BF16, superior a XSFP4 (0,0410); el error cuadratico sube 1,22 veces en 18 matrices reales por el bloque de 32 pesos.
- Dependencia total del motor: solo TensorFold con kernels CSF0 lee el checkpoint; vLLM y otros cargadores NVFP4 no son compatibles.
- Requiere dos o tres GB10; no es desplegable en una sola maquina GB10 ni en GPU consumer.
- Idiomas limitados a japones e ingles segun la metadata; no se declara soporte de castellano.
- Licencia nvidia-open-model-agreement: conviene revisar sus terminos antes de uso comercial, y el checkpoint es una modificacion no oficial de NVIDIA ni de Z.AI.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor publica NLL y discrepancia top-1 frente a BF16 pero no una evaluacion de calidad generativa.
- El checkpoint no incluye mejoras en el denso (8 bits heredado de FP4-Local), por lo que la calidad global queda acotada por ese componente.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4
- Checkpoint base XSFP4: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-XSFP4
- Variante NZ5: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4-NZ5
- Checkpoint oficial NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Pesos BF16 de referencia: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Motor de inferencia BIZ: https://github.com/Bizuayeu/GLM-5.3-Flash-DGX-Sparks-BIZ
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Explicacion de Jammed XSFP4: https://claude.ai/artifact/Jmo5srGuQYCrPSUdYpbSRv
- Explicacion de NVFP4, OSFP4 y XSFP4: https://claude.ai/artifact/AGG4jdSbUCtX98CExJWv16
