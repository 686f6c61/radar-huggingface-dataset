# Ooriginador/Phi-4-ArkCompact-1.58bit

## Resumen

Phi-4-ArkCompact-1.58bit es una cuantizacion ternaria de 1.58 bits del modelo Phi-4 de Microsoft (14.77 mil millones de parametros), desarrollada por Ooriginador como parte de la infraestructura Arkheion Sovereign AI. El objetivo es reducir drasticamente el consumo de memoria y acelerar la inferencia en hardware AMD (ROCm/HIP) mediante un esquema de pesos ternarios con empaquetado base-3, manteniendo una fidelidad matematica alta (coeficiente de correlacion de Pearson superior a 0.942 en todas las capas lineales). El modelo se distribuye bajo licencia Apache-2.0 y esta pensado para despliegues soberanos o de borde donde el control del hardware y el software es critico.

La relevancia actual radica en que permite ejecutar un modelo de 14.7B de parametros en una GPU de consumo con solo 3.7 GB de VRAM, algo inusual para este tamano. El contexto maximo es de 16.000 tokens, y el runtime propietario (ark-engine, escrito en Rust) ofrece un rendimiento medido de 95 tokens por segundo en un solo flujo y hasta 8.450 tokens por segundo en modo batch con Wave32. No obstante, el formato de pesos es propietario (.ark) y no es compatible con los ecosistemas habituales como Hugging Face Transformers, vLLM o llama.cpp, lo que limita su adopcion fuera del stack Arkheion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Multi-Head Latent Attention (MLA) y cuantizacion ternaria 1.58-bit |
| Parametros totales | 14.77 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.000 tokens |
| Tipos de cuantizacion | 1.58-bit ternario (base-3, 5 trits por byte) |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache-2.0 (cuantizacion y runtime); el modelo base Phi-4 tiene su propia licencia |
| Formato de pesos | Formato propietario .ark (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Phi-4, un transformer denso de 14 mil millones de parametros entrenado por Microsoft con un enfasis central en la calidad de los datos, combinando datos sinteticos generados por modelos mas grandes con datos organicos filtrados. La cuantizacion ArkCompact transforma los pesos a un espacio ternario donde cada peso toma valores en {-1, 0, +1}, empaquetando 5 trits por byte mediante aritmetica base-3 (3^5 = 243 <= 256). Esto elimina las multiplicaciones en coma flotante de 16 bits y las sustituye por acumulaciones enteras y mascaras bitwise fusionadas en Wave32, la unidad de ejecucion de las GPUs AMD RDNA2.

La arquitectura incorpora Multi-Head Latent Attention (MLA), que reduce el tamano de la cache KV en un 85.9%, y un prefill por bloques (chunked prefill) que evita el bloqueo head-of-line en el batching continuo. La carga del modelo se realiza mediante mapeo de memoria (mmap) con inicializacion en menos de 450 milisegundos. No se ha publicado informacion sobre un entrenamiento adicional o ajuste fino posterior a la cuantizacion; se trata de una cuantizacion post-entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento deductivo: la model card afirma un rendimiento destacado en razonamiento encadenado (chain-of-thought) y matematicas formales, herencia del modelo base Phi-4.
- Inferencia de alta velocidad: 95 tokens por segundo en un solo flujo y 155 tokens por segundo con decodificacion especulativa basada en tree-attention, medidos en una AMD Radeon RX 6600M.
- Procesamiento por lotes extremo: hasta 8.450 tokens por segundo en modo batch con Wave32, adecuado para cargas de trabajo de servidor.
- Multilingue limitado: soporta portugues e ingles, sin otros idiomas declarados.
- Compatibilidad con API OpenAI: el runtime ark-engine expone un endpoint REST compatible con el formato de chat completions, lo que facilita la integracion con herramientas existentes.
- No se ha confirmado soporte de tool calling, function calling ni capacidades multimodales (vision, audio) en la informacion disponible.

## Casos de uso

- Despliegue en hardware AMD de gama baja: con un consumo de VRAM de 3.671 MB, el modelo puede ejecutarse en GPUs de consumo como la RX 6600M (8 GB) o incluso en iGPUs con suficiente memoria compartida, lo que permite inferencia local en equipos modestos.
- Entornos soberanos y de borde: al ser un stack completo (modelo + runtime Rust) bajo licencia Apache-2.0, es adecuado para despliegues donde se requiere control total del software y ausencia de dependencias en la nube, por ejemplo en administraciones publicas o infraestructuras criticas.
- Razonamiento matematico y formal en educacion: el modelo base Phi-4 destaca en matematicas y logica; esta cuantizacion permite ejecutarlo en portatiles o mini-PCs para asistentes de tutoria o generacion de ejercicios.
- Chatbots multilingues portugues-ingles: con 16k de contexto, puede mantener conversaciones largas en estos dos idiomas, util para atencion al cliente en Brasil o Portugal.
- Procesamiento por lotes de documentos: el alto throughput en modo batch (8.450 tok/s) permite resumir o clasificar grandes volumenes de texto en servidores con GPUs AMD, aprovechando la eficiencia energetica de la cuantizacion.
- Prototipado rapido de agentes conversacionales: gracias a la API compatible con OpenAI, se puede integrar en frameworks como LangChain o AutoGen sin modificaciones, usando el servidor ark-engine como backend local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion en la informacion disponible. La model card solo proporciona metricas de rendimiento de hardware, que se resumen a continuacion:

| Metrica | Valor medido |
|---|---|
| Throughput single-stream | 95.0 tok/s |
| Throughput con decodificacion especulativa | 155.0 tok/s |
| Throughput batch pico (Wave32) | 8.450.0 tok/s |
| VRAM utilizada | 3.671,4 MB |
| Fidelidad matematica (Pearson rho) | >= 0.942 |
| Tiempo de inicializacion (mmap) | < 450 ms |

Estas cifras corresponden a una AMD Radeon RX 6600M (RDNA2) y no son comparables con benchmarks de calidad de modelo. Para evaluar la degradacion introducida por la cuantizacion, seria necesario ejecutar las pruebas estandar sobre el modelo cuantizado, algo que no se ha documentado.

## Requisitos de hardware

- VRAM minima estimada: 3.671,4 MB segun la model card, lo que permite ejecucion en GPUs con 4 GB o mas de memoria.
- GPU verificada: AMD Radeon RX 6600M (RDNA2) con ROCm/HIP y soporte Wave32. No se menciona compatibilidad con NVIDIA CUDA.
- GPU recomendadas: cualquier GPU AMD RDNA2 o superior con al menos 4 GB de VRAM; tambien podria funcionar en iGPUs AMD con memoria compartida suficiente, aunque no se ha probado.
- Opciones de despliegue: exclusivamente mediante el runtime ark-engine (Rust), que se compila con Cargo y se ejecuta como servidor local. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 95 tok/s en un solo flujo, 155 tok/s con decodificacion especulativa, y 8.450 tok/s en batch pico. La latencia de primera respuesta no se ha publicado, pero el tiempo de carga del modelo es inferior a 450 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM estimada | Licencia | Ecosistema |
|---|---|---|---|---|---|---|
| Phi-4-ArkCompact-1.58bit | 14.77B | 16k | 1.58-bit ternario | 3.7 GB | Apache-2.0 | Arkheion (propietario) |
| microsoft/phi-4 (original) | 14.7B | 16k | FP16/BF16 | ~30 GB | MIT | Transformers, vLLM, etc. |
| BitNet b1.58 (referencia) | 3.9B (tipico) | 4k | 1.58-bit ternario | ~1 GB | MIT | Transformers, llama.cpp (parcial) |

La comparativa con BitNet b1.58 es orientativa, ya que no se dispone de datos de rendimiento publicados para esta cuantizacion concreta. La principal diferencia frente al Phi-4 original es la reduccion de VRAM en un factor de 7.6 a 16 veces, a costa de un formato propietario y una compatibilidad limitada. Frente a BitNet, ArkCompact ofrece un modelo mucho mas grande (14.77B frente a 3.9B) y un contexto mayor (16k frente a 4k), pero con un runtime cerrado.

## Limitaciones y advertencias

- Idiomas limitados: solo portugues e ingles; no hay soporte declarado para espanol, frances, aleman u otros idiomas, lo que restringe su uso en entornos multilingues amplios.
- Formato propietario: los pesos estan en formato .ark y solo pueden ejecutarse con el runtime Arkheion. No es posible cargar el modelo con Transformers, llama.cpp ni otras herramientas estandar, lo que dificulta la integracion en pipelines existentes.
- Cuantizacion agresiva: aunque la fidelidad matematica declarada es alta (rho >= 0.942), no hay benchmarks de calidad publicados. Es probable que tareas complejas como generacion de codigo o razonamiento de multiples pasos sufran una degradacion notable respecto al modelo original en FP16.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, y potencialmente mayor en cuantizaciones extremas si la degradacion afecta a la coherencia. No se han realizado evaluaciones de sesgo o seguridad en esta version.
- Madurez del proyecto: el repositorio tiene cero descargas y cero likes, y la fecha de creacion es reciente. No hay evidencia de uso en produccion ni de mantenimiento activo.
- Requisitos de hardware especificos: el rendimiento optimo depende de GPUs AMD con soporte Wave32 y ROCm. En hardware NVIDIA o CPUs, el rendimiento podria ser muy inferior o el modelo podria no ejecutarse.
- Licencia del modelo base: aunque la cuantizacion se distribuye bajo Apache-2.0, el modelo base Phi-4 tiene su propia licencia (MIT segun Microsoft). Es necesario revisar los terminos de ambas para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ooriginador/Phi-4-ArkCompact-1.58bit
- Repositorio ArkheionNet (GitHub): https://github.com/Arkheion/ArkheionNet.git
- Modelo base microsoft/phi-4: https://huggingface.co/microsoft/phi-4
- Informe tecnico de Phi-4 (PDF): https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/P4TechReport.pdf
- Pagina de Microsoft sobre la familia Phi: https://azure.microsoft.com/en-us/products/phi/
