# NishantIveri/IVERI-Hyperion-SLM

## Resumen

IVERI-Hyperion-SLM es un modelo de lenguaje de tipo state-space (SSM) de 390 millones de parámetros desarrollado por NishantIveri (con autoría académica de Datta, Bhoyar, Nandeshwar y Khan). Su propuesta central es sustituir la autoatención cuadrática de los transformers por unidades de estado selectivas con compuerta de entropía, lo que reduce el coste de memoria de la secuencia a O(1) y lo orienta a despliegue en dispositivos de borde (edge AI). El modelo se presenta como una "foundation model" de escala pequeña (SLM) entrenada sobre una mezcla propietaria denominada IVERI-ULTRA v1.0, compuesta por FineWeb-Edu (score >= 3.0) y FineMath-4+.

La relevancia del modelo es fundamentalmente arquitectónica: explora una vía alternativa a la atención cuadrática en la franja de los cientos de millones de parámetros, donde el coste de inferencia y la huella de memoria son críticos. El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su estudio.

No obstante, los datos publicados por el autor son escasos y deben interpretarse con cautela: la perplejidad de validación declarada (919,73) y la pérdida de entropía cruzada (6,8241) son valores muy altos para un modelo de lenguaje moderno, lo que sugiere un entrenamiento limitado o una evaluación sobre datos muy exigentes. No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), ni detalles sobre el número de tokens de entrenamiento, la tokenización o el pipeline de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State-space model (SSM) selectivo con compuerta de entropía; escalado sub-cuadrático |
| Parametros totales | 390M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, multilingual (sin listado de idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repo ocupa 1,6 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de espacio de estados (SSM) que reemplaza la autoatención cuadrática por retención de estado con memoria O(1), lo que en teoría permite procesar secuencias largas con coste lineal o constante en memoria. Incorpora "Entropy-Gated Selective State Units", un mecanismo que filtra selectivamente las representaciones de tokens según la densidad de información local, presumiblemente para descartar tokens poco informativos y preservar los relevantes en el estado recurrente. El modelo fue entrenado en Google Cloud TPU v5e, con un throughput declarado de aproximadamente 6.324 tokens por segundo.

El preentrenamiento se realizó sobre la mezcla IVERI-ULTRA v1.0, compuesta por FineWeb-Edu (con score >= 3.0) y FineMath-4+, lo que orienta el modelo hacia texto educativo y matemáticas. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o instrucción. Tampoco se detalla la tokenización (el título del paper menciona "Byte-Level", pero la model card no lo confirma en la práctica). La innovación técnica principal es, por tanto, el filtrado por entropía dentro de un SSM, no la escala ni los datos.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Modelado de lenguaje con sesgo hacia contenido educativo y matemático por la composición del dataset.
- Capacidad multilingüe declarada, sin listado de idiomas ni evaluación por idioma.
- Procesamiento de secuencias largas con memoria de estado O(1) (ventaja teórica del SSM, sin contexto máximo publicado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo "thinking", visión ni audio.
- No se documenta capacidad de código de forma explícita (aunque FineMath-4+ podría aportar algo de matemáticas).

## Casos de uso

- Inferencia en dispositivos de borde: el diseño sub-cuadrático y el tamaño de 390M permiten desplegar generación de texto en hardware con recursos limitados (móviles, SBC, NPUs), donde un transformer equivalente sería más costoso en memoria para secuencias largas.
- Procesamiento de documentos educativos: dado el entrenamiento sobre FineWeb-Edu y FineMath-4+, puede emplearse para resumir o reescribir material didáctico y ejercicios matemáticos, siempre con validación humana por la alta perplejidad declarada.
- Experimentación académica en arquitecturas SSM: sirve como banco de pruebas reproducible para estudiar el filtrado por entropía y el escalado sub-cuadrático frente a transformers de tamaño similar.
- Prototipado de asistentes de texto con contexto largo: la retención de estado O(1) facilita experimentar con entradas largas sin el crecimiento cuadrático de memoria de la atención, aunque el contexto máximo real no está publicado.
- Generación de texto en pipelines de bajo coste: con licencia Apache 2.0 y 1,6 GB de pesos, puede integrarse en servicios internos de generación de borradores o completado donde la calidad no sea crítica.
- Investigación sobre multilingüismo en SSM: permite estudiar el comportamiento de un modelo pequeño entrenado con mezcla multilingüe declarada, comparándolo con transformers de 390M.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation Cross-Entropy Loss | 6,8241 |
| Validation Perplexity | 919,73 (texto educativo no visto) |
| Throughput en TPU v5e | ~6.324 tokens/seg |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos son métricas internas de validación y throughput, no comparables directamente con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,8 GB solo para pesos (390M × 2 bytes), más overhead de activaciones y estado; en la práctica, alrededor de 1,5-2 GB.
- VRAM estimada en cuantización de 8 bits: ~0,4 GB de pesos; en 4 bits: ~0,2 GB (siempre que existan pesos cuantizados, no confirmado).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por capacidad; también cabe en iGPU y NPUs de borde.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño de 390M.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la model card solo muestra `AutoTokenizer` de Transformers, y no se confirma una clase de modelo específica.
- Latencia y throughput: el único dato es ~6.324 tokens/seg en TPU v5e durante el entrenamiento; no hay cifras de inferencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| IVERI-Hyperion-SLM | 390M | no disponible | SSM con compuerta de entropía | Apache 2.0 | No (solo pérdida/perplejidad) |
| Mamba-370M | 370M | 2K (entrenamiento) | SSM selectivo | Apache 2.0 | Sí (Pile, etc.) |
| GPT-2 small | 124M | 1.024 | Transformer | MIT | Sí (aunque limitados) |
| Pythia-410M | 410M | 2.048 | Transformer | Apache 2.0 | Sí (suite completa) |

La comparación es difícil porque IVERI-Hyperion no publica evaluaciones estándar. Frente a Mamba-370M, comparte familia arquitectónica y escala, pero carece de resultados verificables en el Pile o tareas downstream. Frente a Pythia-410M, la diferencia clave es la disponibilidad de benchmarks y de un ecosistema de despliegue maduro.

## Limitaciones y advertencias

- Perplejidad de validación muy alta (919,73) y pérdida de 6,8241, valores que indican una calidad de modelado limitada y un riesgo elevado de texto incoherente o repetitivo.
- Ausencia total de benchmarks estándar: no es posible verificar capacidades de razonamiento, código o matemáticas.
- No se documenta el número de tokens de entrenamiento ni el pipeline de alineación (RLHF/DPO), lo que impide estimar el grado de instrucción del modelo.
- Contexto máximo no publicado: la ventaja teórica de secuencias largas no está cuantificada.
- Idiomas: se declara "multilingual" sin listado ni evaluación; el entrenamiento parece centrado en inglés educativo.
- Riesgo de sesgos derivado de FineWeb-Edu y FineMath-4+, sin análisis de sesgo publicado.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace arriesgado su uso en producción sin validación previa.
- Repositorio con 0 descargas y creado en 2026-11-14: no hay evidencia de uso comunitario ni de mantenimiento.
- El paper citado (IJRASET, Paper ID 85419) no se ha verificado en la información disponible; conviene contrastar su contenido antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/NishantIveri/IVERI-Hyperion-SLM
- IJRASET (revista del paper): https://www.ijraset.com/
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Google Cloud TPU: https://cloud.google.com/tpu
