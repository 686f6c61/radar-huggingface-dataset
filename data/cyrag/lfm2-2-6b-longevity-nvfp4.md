# Cyrag/LFM2-2.6B-Longevity-NVFP4

## Resumen

LFM2-2.6B-Longevity-NVFP4 es un checkpoint cuantizado en NVFP4 (NVIDIA Floating Point 4) del modelo LiquidAI/LFM2-2.6B-Longevity, publicado por el usuario Cyrag. El modelo base fue desarrollado conjuntamente por Insilico Medicine y Liquid AI y acompaña al estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., Cell, 2026), orientado al razonamiento biologico aplicado al envejecimiento. La arquitectura de LFM2 es hibrida: combina convoluciones cortas de estilo Mamba (espacios de estados) con atencion multi-cabeza, lo que reduce el coste de inferencia respecto a un transformer denso de tamano equivalente.

La relevancia de esta ficha concreta es de ingenieria de despliegue: no se trata de un modelo nuevo, sino de una cuantizacion selectiva de precision mixta disenada para aprovechar los tensor cores NVFP4 nativos de las GPU NVIDIA Blackwell (RTX PRO 6000 Blackwell, B200, GB200) servidas con vLLM. El checkpoint pasa de 5,14 GB en BF16 a 2,29 GB, un 44,6 % del original, manteniendo en FP32 las capas de normalizacion y los filtros convolucionales del SSM, y en BF16 las proyecciones de atencion, las proyecciones del SSM, los embeddings y la cabeza LM.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta idiomas soportados. La ventana de contexto empleada en el ejemplo oficial de servicio es de 32.768 tokens, con soporte nativo de tool calling mediante el parser `lfm2` de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: convoluciones cortas estilo Mamba (SSM) + atencion multi-cabeza (LFM2) |
| Parametros totales | 1.578.368.000 (~1,58 B) segun safetensors; el nombre comercial del modelo base indica 2,6 B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de servicio documentada; el maximo del modelo base no se especifica |
| Tipos de cuantizacion | NVFP4 (FP4 de 4 bits) con ModelOpt, block_size=16; precision mixta: FP32 en normalizaciones y filtros de convolucion, BF16 en atencion, proyecciones SSM, embeddings y lm_head |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (cuantizacion ModelOpt NVFP4 para vLLM) |

Datos adicionales de despliegue:

| Metrica | Valor |
|---|---|
| Tamano del checkpoint BF16 original | 5,14 GB |
| Tamano del checkpoint NVFP4 | 2,29 GB (44,6 % del original) |
| Tamano del repositorio | 2,3 GB |
| Tensores verificados | 536 tensores, 0 NaN / 0 Inf |
| Libreria declarada | vLLM (>= 0.28.0) |
| Pipeline | text-generation (conversational) |
| Fecha de creacion del repositorio | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo base LFM2-2.6B-Longevity emplea la arquitectura LFM2 de Liquid AI, un diseno hibrido que intercala bloques de convolucion corta con mecanica de espacio de estados (herencia de la linea Mamba) y bloques de atencion multi-cabeza. La consecuencia practica es un coste de decodificacion mas bajo que el de un transformer denso del mismo orden de parametros, porque buena parte de la secuencia se procesa mediante recurrencia convolucional en lugar de atencion cuadratica. El checkpoint aqui descrito no reentrena ni modifica la arquitectura: solo altera el formato numerico de los pesos.

La cuantizacion es deliberadamente no uniforme. Los bloques feed-forward (`feed_forward.w1`, `w2`, `w3`), que concentran la mayor parte de los parametros, se almacenan en NVFP4 con block_size=16 y se ejecutan mediante kernels CUTLASS NVFP4 de Blackwell. Se mantienen en FP32 las capas de normalizacion (`embedding_norm`, `operator_norm`, `ffn_norm`, `q_layernorm`, `k_layernorm`) y los filtros convolucionales del SSM (`conv.conv.weight` / `short_conv`), y en BF16 las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `out_proj`), las proyecciones del SSM (`short_conv.in_proj`, `out_proj`), los embeddings de tokens y la cabeza LM. El motivo declarado es preservar el rango dinamico en las normalizaciones, la dinamica temporal del filtro de estado y la fidelidad del vocabulario y la calibracion de logits. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno en el pipeline `text-generation`/`conversational`.
- Razonamiento especializado en biologia del envejecimiento y longevidad, por el ajuste del modelo base y el benchmark que lo acompana.
- Tool calling y function calling nativos: el ejemplo oficial de vLLM activa `--tool-call-parser lfm2` junto con `--enable-auto-tool-choice`.
- Despliegue agéntico: soporte de prefix caching para reutilizar estados KV y recurrentes del SSM entre turnos, lo que acelera harneses de agentes con historial largo.
- Prefill de contexto largo en una sola pasada, hasta 32.768 tokens, si se configura `--max-num-batched-tokens 32768`.
- Ejecucion acelerada en hardware Blackwell mediante kernels NVFP4 nativos.
- Capacidades multimodales, de audio o de modo "thinking": no documentadas en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Servicio de chat de dominio biologico: el modelo puede atender consultas sobre envejecimiento y longevidad con contexto de hasta 32.768 tokens, aprovechando el prefix caching para conversaciones multi-turno sin reprocesar el historial completo.
- Agente de extraccion de entidades en literatura cientifica: con tool calling nativo puede encadenar llamadas a una API de busqueda bibliografica y devolver resultados estructurados, integrándose en un pipeline de revision sistematica.
- Asistente interno de laboratorio: desplegado sobre una RTX PRO 6000 Blackwell, sirve a un equipo reducido con un throughput de decodificacion cercano a 350 tok/s medido en el barrido de contextos de la model card.
- Enrutador o clasificador previo en una arquitectura multi-modelo: su tamano reducido (2,29 GB) permite mantenerlo residente en VRAM mientras se reserva el grueso de la memoria para un modelo mayor, y usarlo para decidir a que modelo derivar cada consulta.
- Generacion asistida de resumenes de articulos o informes tecnicos largos: el prefill de una sola pasada hasta 32k tokens evita el troceado de documentos y reduce el numero de round-trips.
- Prototipado y evaluacion de tecnicas de cuantizacion en produccion: sirve como caso de referencia para medir la perdida de calidad de NVFP4 frente a BF16 en un modelo hibrido SSM+atencion.
- Backend de bajo consumo en entornos con limites de potencia: los datos de la model card se obtuvieron con la GPU limitada a 300 W, lo que indica un perfil energetico contenido para inferencia siempre activa.
- Fine-tuning ligero o adaptacion por adaptadores sobre el modelo base BF16, usando este checkpoint solo para inferencia: no hay informacion disponible sobre soporte de entrenamiento sobre pesos NVFP4.

## Benchmarks y rendimiento

La model card publica un barrido de rendimiento de servicio (no benchmarks de calidad tipo MMLU o HumanEval) medido sobre NVIDIA RTX PRO 6000 Blackwell (96 GB, `sm_120`) con la suite `llm_context_benchmarks`, con la GPU limitada a 300 W frente a los 600 W de fabrica. Se generaron 128 tokens por prueba.

| Contexto | Ingesta en frio | Ingesta con cache | Velocidad de decodificacion | TPOT |
|---|---|---|---|---|
| 0,5k | 22.738 tok/s | 18.997 tok/s | 348,7 tok/s | 2,89 ms |
| 1,0k | 34.673 tok/s | 24.053 tok/s | 349,5 tok/s | 2,89 ms |
| 2,0k | 76.597 tok/s | 45.084 tok/s | 347,6 tok/s | no disponible |
| 2,0k a 16k | no disponible (informacion truncada en la fuente) | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El unico dato de integridad numerica reportado es la verificacion de 0 NaN y 0 Inf en los 536 tensores del checkpoint.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 2,29 GB en NVFP4, frente a 5,14 GB del checkpoint BF16.
- VRAM total en servicio: a 32.768 tokens de contexto con `--max-num-batched-tokens 32768`, `--max-num-seqs 16` y `--gpu-memory-utilization 0.90`, la configuracion de referencia asume una GPU de 96 GB. El consumo real de KV cache y estados recurrentes del SSM no se desglosa en la model card.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB), B200 y GB200. La aceleracion NVFP4 es nativa en arquitectura Blackwell (`sm_120`).
- Compatibilidad con generaciones anteriores: no disponible. Al depender de kernels NVFP4 CUTLASS/FlashInfer de Blackwell, el rendimiento en Ada, Ampere o Hopper no esta documentado.
- GPU de consumo: no hay datos publicados. El checkpoint mas pequeno de la familia (BF16, 5,14 GB) si cabria en GPUs de consumo con 8-12 GB o mas, pero la ruta NVFP4 esta pensada para Blackwell de datacenter o workstation.
- Opciones de despliegue: vLLM >= 0.28.0 con `--quantization modelopt` es la unica ruta documentada. No se menciona soporte en llama.cpp, Ollama, TGI ni transformers.
- Flags relevantes de despliegue: `pass_config.fuse_norm_quant: true` fusiona RMSNorm y la cuantizacion de activaciones FP4 en un solo kernel; `--enable-prefix-caching` cachea estados SSM y KV; `--compilation-config` incluye `cudagraph_num_of_warmups: 2`.
- Throughput y latencia: entre 347 y 350 tok/s de decodificacion con TPOT de 2,89 ms en el rango de 0,5k a 2k tokens de contexto, y entre 22.738 y 76.597 tok/s de ingesta en frio, con la GPU limitada a 300 W. En sistemas a 600 W los valores pueden ser superiores.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Cyrag/LFM2-2.6B-Longevity-NVFP4 | ~1,58 B (safetensors) | NVFP4 mixto | 2,29 GB | 32.768 tokens (config. de servicio) | lfm1.0 | vLLM >= 0.28.0, GPU Blackwell |
| LiquidAI/LFM2-2.6B-Longevity (BF16) | Mismo modelo base | BF16 | 5,14 GB | No disponible | lfm1.0 | Ruta estandar de transformers/vLLM |
| Otros modelos de ~2-3 B de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la informacion proporcionada datos comparativos de rendimiento frente a alternativas de otros fabricantes, ni cifras de benchmarks de calidad que permitan una comparacion defendible. La comparacion relevante y verificable es la del propio checkpoint NVFP4 frente a su version BF16 en tamaño y requisitos de hardware.

## Limitaciones y advertencias

- El modelo hereda el enfoque de dominio del base (biologia del envejecimiento), por lo que su comportamiento fuera de ese ambito puede ser inferior al de un modelo generalista de tamano similar.
- No hay evaluaciones publicadas de sesgos, toxicidad ni tasas de alucinacion en la informacion disponible.
- Los idiomas soportados no estan documentados; se desconoce el comportamiento real en castellano.
- La decodificacion NVFP4 depende de kernels especificos de Blackwell; sin esa generacion de GPU el rendimiento puede degradarse de forma no documentada.
- La licencia lfm1.0 se declara como `license: other`, no como licencia de codigo abierto estandar. Las condiciones exactas de uso comercial deben consultarse en el fichero LICENSE del repositorio; no estan resumidas en la informacion disponible.
- Existe una discrepancia entre el numero de parametros reportado por safetensors (~1,58 B) y el nombre del modelo base (2,6 B). No se explica en la model card; podria deberse al empaquetado de los tensores cuantizados, pero no hay confirmacion.
- El repositorio no tiene descargas ni validacion de la comunidad, y la model card esta truncada: las secciones posteriores del barrido de contextos y cualquier evaluacion de calidad no estan disponibles.
- La cuantizacion en FP4 con block_size=16 puede degradar el razonamiento biologico fino pese a la estrategia de precision mixta; no hay una comparacion de calidad FP4 frente a BF16 publicada.
- Al ser un artefacto de cuantizacion, no debe usarse como base para fine-tuning sin verificar previamente el soporte de la libreria.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/Cyrag/LFM2-2.6B-Longevity-NVFP4
- Modelo base BF16: https://huggingface.co/LiquidAI/LFM2-2.6B-Longevity
- Documentacion de LFM de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- vLLM: https://github.com/vllm-project/vllm
- Suite de benchmarks de contexto citada: https://github.com/ivanfioravanti/llm_context_benchmarks
- Insilico Medicine: https://insilico.com
- Liquid AI: https://www.liquid.ai
- Paper de referencia: arXiv:2511.23404 y Zhavoronkov et al., "An Open Benchmark and Language Models for AI in Aging Biology", Cell, 2026
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; el resto de enlaces disponibles se limitan a los listados en la model card.
