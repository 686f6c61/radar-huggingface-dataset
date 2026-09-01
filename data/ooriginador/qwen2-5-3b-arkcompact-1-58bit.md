# Ooriginador/Qwen2.5-3B-ArkCompact-1.58bit

## Resumen

Ooriginador/Qwen2.5-3B-ArkCompact-1.58bit es una variante cuantizada del modelo Qwen2.5-3B-Instruct, desarrollada por Ooriginador dentro del ecosistema Arkheion Sovereign AI. El modelo emplea una cuantización ternaria de 1.58 bits con empaquetado base-3, lo que reduce drásticamente el tamaño y los requisitos de memoria frente al original en FP16, manteniendo una fidelidad matemática alta (coeficiente de correlación de Pearson ≥ 0.942 en todas las capas lineales 2D). Está orientado a escenarios de inferencia soberana, con soporte nativo para hardware AMD (ROCm/HIP) y un runtime en Rust llamado `ark-engine`.

La arquitectura subyacente es la del modelo base Qwen2.5-3B-Instruct, un transformer denso decoder-only con 3.09 mil millones de parámetros y una ventana de contexto de 32 000 tokens. La cuantización sustituye las multiplicaciones en coma flotante por acumulaciones enteras y máscaras bitwise Wave32, lo que permite un arranque en menos de 450 ms mediante mapeo de memoria (`mmap`) y un throughput de hasta 160 tokens por segundo en una AMD Radeon RX 6600M, según los datos publicados por el autor. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para despliegues locales, edge y entornos con restricciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2.5) con cuantizacion ternaria 1.58-bit base-3 |
| Parametros totales | 3.09B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (escalado RoPE completo) |
| Tipos de cuantizacion | 1.58-bit base-3 (5 trits por byte, w ∈ {-1, 0, +1}) |
| Idiomas soportados | Portugues (pt), ingles (en) segun la model card; el modelo base soporta mas idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio `.ark` (Arkheion), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen2.5-3B-Instruct y los cuantiza mediante el esquema ArkCompact, que empaqueta cada peso en un estado ternario {-α, 0, +α} usando codificacion base-3. Con 5 trits por byte se alcanzan 243 combinaciones posibles, dentro del rango de 256 valores de un byte. Esta cuantizacion elimina las multiplicaciones de coma flotante de 16 bits, sustituyendolas por acumulaciones enteras y operaciones de mascara bitwise fusionadas en Wave32 (arquitectura de shaders de AMD). El runtime `ark-engine` implementa carga con `mmap` (zero-copy), atencion multi-latente (MLA) que reduce el cache KV en un 85.9 %, y prefill fragmentado para evitar bloqueos head-of-line en batching continuo.

No se ha publicado informacion sobre un entrenamiento adicional o fine-tuning posterior a la cuantizacion; el proceso parece ser puramente de conversion de pesos. El modelo base Qwen2.5-3B-Instruct fue preentrenado por Alibaba sobre hasta 18 billones de tokens, pero esa informacion corresponde al modelo original, no a esta variante cuantizada.

## Capacidades

- Generacion de texto en portugues e ingles, con razonamiento matematico y multilingue destacado segun la model card.
- Inferencia de alta velocidad en hardware AMD (RDNA2 y posteriores) gracias a la cuantizacion ternaria y al runtime optimizado.
- Soporte de atencion multi-latente (MLA) que reduce el uso de memoria del cache de claves y valores.
- Prefill fragmentado para gestionar peticiones largas sin bloqueos en servidores de inferencia concurrente.
- API compatible con OpenAI (endpoint `/v1/chat/completions`) para integracion sencilla en aplicaciones existentes.
- No se menciona soporte explicito de tool calling, agentes o vision; estas capacidades dependen del modelo base, pero no estan confirmadas en esta variante cuantizada.

## Casos de uso

- Despliegue de asistentes conversacionales en entornos con hardware limitado: el modelo ocupa solo 773.4 MB de VRAM, por lo que cabe en GPUs de consumo como la AMD RX 6600M o incluso en iGPUs, permitiendo chatbots locales sin conexion a la nube.
- Inferencia en servidores edge para aplicaciones de atencion al cliente: su ventana de 32 000 tokens permite manejar conversaciones multi-turno con historial extenso, y la API OpenAI-compatible facilita la integracion con frameworks como LangChain o RAG.
- Generacion de codigo y asistencia a programadores en entornos con restricciones de soberania de datos: al ejecutarse localmente con `ark-engine`, el codigo fuente no sale de la infraestructura de la empresa.
- Procesamiento de documentos largos en portugues o ingles: el contexto de 32k permite resumir o extraer informacion de informes extensos sin truncamiento.
- Prototipado rapido de aplicaciones de IA generativa en hardware AMD: el soporte ROCm/HIP y Wave32 evita la dependencia de CUDA, reduciendo costes en entornos que ya usan GPUs AMD.
- Investigacion academica sobre cuantizacion ternaria: el modelo sirve como caso de estudio para evaluar el equilibrio entre compresion extrema y calidad de salida en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye metricas de rendimiento de hardware medidas en una AMD Radeon RX 6600M (RDNA2):

| Metrica | Valor medido |
|---|---|
| Throughput de un solo stream | 160.0 tok/s |
| Throughput con boost especulativo (tree-attention) | 250.0 tok/s |
| Throughput pico en batch (Wave32) | 63 421.0 tok/s |
| VRAM utilizada | 773.4 MB |
| Fidelidad matematica (Pearson ρ) | ≥ 0.942 en todas las capas lineales 2D |
| Tiempo de inicializacion | < 450 ms |

Estas cifras son proporcionadas por el autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: 773.4 MB segun la model card, lo que permite ejecucion en GPUs con 1 GB o menos de memoria dedicada.
- GPU recomendadas: AMD Radeon RX 6600M (RDNA2) verificada; compatible con cualquier GPU AMD con soporte ROCm/HIP y Wave32. No se menciona soporte para NVIDIA o CUDA.
- Cabe en GPUs de consumo: si, en tarjetas AMD de gama baja y media, asi como en iGPUs con suficiente memoria compartida.
- Opciones de despliegue: `ark-engine` (servidor Rust) con API OpenAI-compatible; tambien se puede usar el SDK `ark-sdk` para integracion en Rust. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 160 tok/s en un solo stream y 250 tok/s con decodificacion especulativa, medidos en la GPU mencionada. El throughput en batch alcanza 63 421 tok/s en condiciones optimas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-3B-ArkCompact-1.58bit | 3.09B | 32k | 1.58-bit ternaria | Apache-2.0 | .ark |
| Qwen2.5-3B-Instruct (original) | 3.09B | 32k (hasta 128k con RoPE) | FP16/BF16 | Apache-2.0 | safetensors |
| BitNet b1.58 (referencia, no comparable directamente) | 3.9B (aprox.) | 4k | 1.58-bit ternaria | MIT | safetensors |

La comparativa directa con BitNet b1.58 no es exacta porque BitNet se entrena desde cero con arquitectura ternaria, mientras que este modelo es una cuantizacion posterior de un modelo denso. El modelo original Qwen2.5-3B-Instruct ofrece mayor fidelidad y soporte multilingue mas amplio, pero requiere alrededor de 6 GB en FP16, frente a los 0.8 GB de esta variante. No se dispone de datos de calidad comparativos entre ambos.

## Limitaciones y advertencias

- La cuantizacion ternaria extrema puede degradar la calidad de generacion en tareas complejas, aunque la model card reporta una fidelidad alta (ρ ≥ 0.942). No hay evaluaciones independientes que lo confirmen.
- Idiomas limitados: la model card declara solo portugues e ingles, aunque el modelo base soporta muchos mas. El uso en otros idiomas puede producir resultados suboptimos.
- Sin soporte para hardware NVIDIA: el runtime esta optimizado para ROCm/HIP y Wave32, por lo que no funcionara en GPUs CUDA sin adaptaciones.
- Formato de pesos propietario `.ark`: no es compatible con ecosistemas estandar como HuggingFace Transformers, vLLM o llama.cpp, lo que limita su portabilidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la compresion de pesos; se recomienda validacion externa en aplicaciones de produccion.
- No se ha publicado informacion sobre sesgos especificos, pero al derivar de Qwen2.5, puede heredar sesgos del dataset de entrenamiento original.
- La licencia Apache-2.0 permite uso comercial, pero el runtime `ark-engine` y el ecosistema Arkheion deben revisarse por separado para confirmar sus terminos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ooriginador/Qwen2.5-3B-ArkCompact-1.58bit
- Repositorio ArkheionNet (GitHub): https://github.com/Arkheion/ArkheionNet.git
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
