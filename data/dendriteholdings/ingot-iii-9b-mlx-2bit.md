# dendriteholdings/Ingot-III-9B-MLX-2bit

## Resumen

Ingot-III-9B-MLX-2bit es un modelo de generacion de texto en formato MLX, publicado por dendriteholdings, que constituye un espejo publico del modelo ganador de la competicion Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo maestro fijo y el validador selecciona la copia que mas se aproxima a el. El modelo deriva de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit mediante un ajuste fino (finetune) que conserva los codigos ternarios del modelo base y reajusta el resto de pesos para acercarse a Qwen3.5-9B.

La relevancia del modelo es doble: por un lado, documenta un proceso de cuantizacion competitiva orientada a minimizar la divergencia KL respecto al profesor original; por otro, ofrece un empaquetado especifico para Apple Silicon con pesos de 2 bits (2,25 bits por peso efectivos) y un peso total de 3,46 GB, lo que permite ejecutar un modelo de 9.410.903.280 parametros en hardware de consumo de la gama Apple. El modelo esta pensado para generacion de texto y conversacion, con licencia no disponible y sin informacion publica sobre idiomas soportados.

La ficha se basa en la model card del autor y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, por lo que las secciones correspondientes se limitan a los datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B via Ternary-Bonsai-2-9B), pesos ternarios con escalas fp16 |
| Parametros totales | 9.410.903.280 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2 bits (codigos ternarios, escala fp16 y sesgo por cada 128 pesos; 2,25 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (layout `prism_hadamard_qwen35` para MLX) |

## Arquitectura y entrenamiento

El modelo parte de Ternary Bonsai 2 9B de Prism ML, una version ternaria del modelo Qwen3.5-9B, y ha sido refinado por un minero de la subred Ingot (hotkey `5FNBPMecuJtBZct2w9aXfaNtAd5VUJNSNX6KS7KVkZNxdpFZ`, uid 145). El proceso de la competicion consiste en cuantizar un modelo maestro fijo y seleccionar la copia que minimiza la divergencia KL entre las distribuciones de siguiente token del modelo y las del profesor en BF16. En este caso, el modelo ganador obtuvo un KL de 0,08589 frente al 0,09027 del modelo que ostentaba el titulo, medido sobre los tokens de respuesta de cada dominio ponderados por su cuota de muestras.

La conversion a MLX es sin perdida: cada bloque de 128 pesos conserva sus codigos ternarios y su escala fp16 como valores afines de 2 bits de MLX (escala d, sesgo -d), de modo que cada peso decodifica al mismo numero que usa el kernel GGUF. La torre de vision, la configuracion, el tokenizador y los vectores de signo de Hadamard proceden del modelo base de Prism ML y no se modifican en la competicion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`).
- Pesos ternarios de 2 bits con escalas fp16, orientados a inferencia eficiente en memoria.
- Compatibilidad con el layout `prism_hadamard_qwen35`, que requiere MTPLX para cargarse (mlx-lm no lo soporta).
- Servicio como API compatible con OpenAI mediante `mtplx serve`.
- Decodificacion de un token por paso: el repositorio no incluye cabecera de borrador MTP (decodificacion especulativa).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo ocupa 3,46 GB en disco y esta empaquetado en MLX, por lo que puede ejecutarse en equipos Mac con memoria unificada moderada, sin necesidad de GPU dedicada.
- Prototipado de asistentes conversacionales: al servirse como API compatible con OpenAI mediante MTPLX, puede integrarse en aplicaciones existentes que ya consumen ese formato sin cambios en el cliente.
- Experimentacion con cuantizacion ternaria: sirve como referencia para estudiar el impacto de la cuantizacion a 2 bits sobre la fidelidad respecto a un profesor BF16, con una metrica KL documentada.
- Evaluacion de tecnicas de compresion extrema: util para investigadores que comparan esquemas de cuantizacion (ternario con escalas por bloque de 128) frente a alternativas de 4 u 8 bits.
- Despliegue en entornos con restricciones de memoria: el tamano reducido permite ejecutar un modelo de 9B en dispositivos donde un modelo en fp16 no cabria.
- Reproduccion de competiciones de cuantizacion: el modelo documenta el flujo de Ingot (modelo maestro, validacion por KL, coronacion del ganador), lo que facilita replicar el proceso en otros dominios.
- Generacion de texto en pipelines de CI para pruebas de humo: su bajo peso permite incluirlo en entornos de integracion sin aprovisionar GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El unico dato de rendimiento publicado es la divergencia KL respecto al profesor BF16:

| Metrica | Ingot-III-9B-MLX-2bit | Modelo coronado anterior |
|---|---|---|
| KL(profesor ‖ modelo) | 0,08589 | 0,09027 |

La metrica se calcula por token de respuesta, sobre las distribuciones de siguiente token en cada dominio, ponderando los dominios por su cuota de muestras. Un valor menor indica mayor cercania al profesor.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 3,46 GB para los pesos en 2 bits; el consumo real depende de la longitud de contexto y del runtime.
- Hardware objetivo: Apple Silicon (tags `mlx`, `apple-silicon`); no se documenta soporte para CUDA en esta variante.
- GPU recomendadas: no aplica en el sentido tradicional; se ejecuta sobre memoria unificada de chips Apple. No hay datos publicados sobre modelos concretos de Mac.
- Cabe en GPU de consumo: la variante MLX esta pensada para Apple Silicon; para GPU NVIDIA existe la variante GGUF gemela (Ingot-III-9B-Q2) que corre en el fork de llama.cpp de Dendrite.
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve --model ... --generation-mode ar --port 8080 --no-auth --yes`); mlx-lm no carga el layout `prism_hadamard_qwen35`. Para GGUF, el fork de llama.cpp de Dendrite.
- Latencia y throughput: no disponibles; el repositorio no incluye cabecera MTP, por lo que la decodificacion es de un token por paso y no se beneficia de decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ingot-III-9B-MLX-2bit | 9,41B | 2 bits (ternario) | No disponible | No disponible | safetensors (MLX) |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | 9B (aproximado) | 2 bits (ternario) | No disponible | No disponible | MLX |
| dendriteholdings/Ingot-III-9B-Q2 | 9,41B (aproximado) | 2 bits (ternario) | No disponible | No disponible | GGUF |
| Qwen3.5-9B (profesor de referencia) | 9B (aproximado) | BF16 | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento estandar para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de benchmarks estandar: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento en tareas concretas no puede verificarse a partir de la informacion publicada.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion; debe contactarse con el autor antes de un despliegue en produccion.
- Idiomas no declarados: se desconoce la cobertura multilingue real del modelo.
- Dependencia de un runtime no estandar: mlx-lm no carga el layout `prism_hadamard_qwen35`; es necesario MTPLX, lo que limita la portabilidad y el ecosistema de herramientas disponible.
- Sin decodificacion especulativa: el repositorio no incluye cabecera MTP, por lo que el throughput es inferior al de variantes con borrador.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factica.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Naturaleza competitiva del ajuste: el refinamiento esta optimizado para minimizar la KL respecto al profesor en los dominios de evaluacion de Ingot, lo que puede no traducirse en mejoras generales fuera de esos dominios.
- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-III-9B-MLX-2bit
- Variante GGUF gemela: https://huggingface.co/dendriteholdings/Ingot-III-9B-Q2
- Modelo base MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
