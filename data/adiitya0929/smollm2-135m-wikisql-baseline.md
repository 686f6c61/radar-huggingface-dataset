# adiitya0929/SmolLM2-135M-WikiSQL-baseline

## Resumen

SmolLM2-135M-WikiSQL-baseline es un ajuste fino supervisado de SmolLM2-135M, el modelo de lenguaje pequeno desarrollado por Hugging Face, especializado en la tarea de text-to-SQL sobre el conjunto de datos WikiSQL. Lo publica Aditya Narayan Jha como linea base de su articulo tecnico TinySQL, que describe un modelo de 125M de parametros entrenado desde cero sobre 4.5B de tokens. El objetivo declarado es responder a una pregunta concreta: que rendimiento se obtiene al aplicar exactamente la misma receta de ajuste fino a un modelo preentrenado con aproximadamente 2 billones de tokens en lugar de 4.500 millones.

El modelo conserva la arquitectura transformer decoder-only de SmolLM2-135M (134.515.008 parametros, licencia Apache 2.0) y anade un formato de prompt especifico con etiquetas de texto plano `<schema>`, `<question>` y `<sql>`. Solo se calcula la perdida sobre la secuencia SQL generada, no sobre el esquema ni la pregunta, lo que concentra el aprendizaje en la produccion de la consulta.

Su relevancia es metodologica mas que de producto: proporciona un punto de comparacion reproducible entre un modelo preentrenado de forma masiva y uno entrenado desde cero con un presupuesto de tokens muy inferior, en un dominio acotado como WikiSQL. No esta pensado como modelo de proposito general ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun el tag `llama`) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es SmolLM2-135M de Hugging Face, un transformer decoder-only denso de 135M de parametros descrito en el articulo *SmolLM2: When Smol Goes Big -- Data-Centric Training of a Small Language Model* (arXiv:2502.02737). Sobre esa base se aplica un ajuste fino supervisado con los 56.355 ejemplos de entrenamiento de WikiSQL, en 3 epocas, con tamano de lote 32, optimizador AdamW, tasa de aprendizaje maxima de 1e-4 con warmup y decaimiento coseno, y semilla 0. La perdida se calcula unicamente sobre la consulta SQL objetivo.

La seleccion de la mejor epoca se hizo por exactitud de ejecucion sobre las primeras 1.000 preguntas de desarrollo, con resultados de 76,3 / 78,3 / 77,1 %, eligiendose la segunda epoca. El formato de prompt emplea etiquetas de texto plano (`<schema>`, `<question>`, `<sql>`) que no son tokens especiales, y el modelo se detiene con la cadena `</sql>`. El repositorio incluye ademas un decodificador restringido (`eval/baselines/constrained_hf.py`) que aplica restricciones de esquema y de valores para forzar la validez de la consulta generada.

## Capacidades

- Generacion de consultas SQL a partir de un esquema de tabla y una pregunta en lenguaje natural, en el formato concreto de WikiSQL (una unica tabla, proyeccion de columnas, filtros y agregaciones simples).
- Generacion de texto autoregresiva estandar heredada de SmolLM2-135M, aunque degradada por el ajuste fino en un dominio estrecho.
- Decodificacion determinista (greedy) y compatible con decodificacion restringida por gramatica o esquema.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Multilingue: solo ingles declarado; no se documenta soporte de otros idiomas.
- No incluye modo de razonamiento explicito, vision ni audio.

## Casos de uso

- Linea base de investigacion en text-to-SQL: sirve para cuantificar la ventaja de un preentrenamiento a gran escala (unos 2 billones de tokens) frente a un entrenamiento desde cero con 4.5B de tokens, usando exactamente la misma receta de ajuste fino.
- Evaluacion de decodificacion restringida: permite medir la ganancia de exactitud de ejecucion al aplicar restricciones de esquema (82,72 % a 83,46 %) y de esquema mas valores (85,19 %) frente a decodificacion greedy.
- Prototipado de interfaces de consulta sobre bases de datos de una sola tabla: con 135M de parametros puede ejecutarse en CPU o en GPU de gama baja para demostraciones de conversion pregunta-SQL en entornos controlados.
- Generacion de datos sinteticos de entrenamiento: puede producir pares pregunta-SQL sobre esquemas WikiSQL para aumentar conjuntos de datos de ajuste fino en dominios tabulares simples.
- Analisis de errores en pipelines text-to-SQL: al ser un modelo pequeno y reproducible con semilla fija, facilita la inspeccion de fallos sistematicos (columnas mal referenciadas, agregaciones incorrectas) antes de escalar a modelos mayores.
- Comparacion de coste computacional: util para articulos o informes internos que comparen el rendimiento por parametro y por token de preentrenamiento entre modelos pequenos preentrenados y entrenados desde cero.

## Benchmarks y rendimiento

Resultados sobre el conjunto de desarrollo de WikiSQL (8.421 preguntas), publicados en la model card:

| Decodificacion | Exactitud de ejecucion | Exact match |
|---|---|---|
| Greedy | 82,72 % | 74,79 % |
| Restricciones de esquema | 83,46 % | 75,05 % |
| Restricciones de esquema y valores | 85,19 % | 76,62 % |

El articulo reporta ademas cifras de conjunto de prueba para SmolLM2-135M con la misma receta y tasa de aprendizaje, obtenidas en tres ejecuciones posteriores (semillas 0, 1 y 2) cuyos pesos no se conservaron: 82,57 ± 0,37 % con greedy y 85,22 ± 0,21 % con decodificacion restringida. No se proporcionan resultados comparativos de otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,54 GB solo para pesos, mas activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- En bf16/fp16: alrededor de 0,27 GB de pesos, ejecutable en GPUs integradas y en CPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, T4); tambien funciona en CPU para inferencia por lotes pequenos.
- Despliegue: transformers (referencia oficial), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documenta soporte explicito de vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en decenas de milisegundos por consulta en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-135M-WikiSQL-baseline | 134,5M | no disponible | Ajuste fino de SmolLM2 sobre WikiSQL | Apache 2.0 | Hugging Face |
| TinySQL-125M-WikiSQL | 125M (aproximado, segun el articulo) | no disponible | Entrenado desde cero sobre 4.5B de tokens y ajustado en WikiSQL | no disponible en la informacion proporcionada | Hugging Face (adiitya0929/TinySQL-125M-WikiSQL) |
| SmolLM2-135M (base) | 134,5M | no disponible en la informacion proporcionada | Modelo de proposito general preentrenado con unos 2 billones de tokens | Apache 2.0 | Hugging Face |

La comparacion directa de rendimiento entre SmolLM2-135M-WikiSQL-baseline y TinySQL-125M-WikiSQL no se incluye en la informacion proporcionada; el articulo la establece como objetivo central, pero las cifras del modelo desde cero no se detallan en la model card.

## Limitaciones y advertencias

- Dominio muy restringido: solo genera SQL para el formato de WikiSQL (una tabla, sin joins ni subconsultas); no es un modelo text-to-SQL general.
- Idioma: unicamente ingles declarado; las preguntas en castellano no estan soportadas de forma fiable.
- Riesgo de alucinacion: puede inventar columnas o valores no presentes en el esquema; el decodificador restringido mitiga parte de este problema pero no lo elimina.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de SmolLM2 y de WikiSQL, centrado en dominios tabulares en ingles; no se documenta ninguna evaluacion de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia de SmolLM2 y de WikiSQL para usos derivados.
- Seleccion de epoca sobre solo 1.000 preguntas de desarrollo, lo que introduce varianza en la eleccion del punto de control.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni integracion verificada con llama.cpp u Ollama.
- Sin datos de contexto maximo documentados; no debe asumirse una ventana larga para esquemas extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adiitya0929/SmolLM2-135M-WikiSQL-baseline
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- TinySQL-125M-WikiSQL (modelo desde cero): https://huggingface.co/adiitya0929/TinySQL-125M-WikiSQL
- Repositorio de codigo: https://github.com/aditya0929/tinysql
- Articulo TinySQL (Zenodo, 2026): https://doi.org/10.5281/zenodo.23396770
- Articulo SmolLM2 (arXiv): https://arxiv.org/abs/2502.02737
- Conjunto de datos WikiSQL: https://huggingface.co/datasets/Salesforce/wikisql
