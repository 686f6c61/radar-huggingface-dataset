# mradermacher/spine-cli-qwen3.5-9b-GGUF

## Resumen

spine-cli-qwen3.5-9b-GGUF es la versión cuantizada en formato GGUF del modelo spine-cli-qwen3.5-9b, publicado por mradermacher a partir del modelo base de NA2RU2. Se trata de un ajuste fino (LoRA) sobre una base Qwen 3.5 de 9B parámetros, orientado a tareas de tipo CLI (interfaz de línea de comandos) y entrenado sobre el dataset NA2RU2/spine-cli-sft-ko, con idioma declarado coreano (ko). El repositorio contiene únicamente pesos cuantizados estáticos generados con la herramienta de cuantización de mradermacher, sin datos de benchmarks ni métricas de evaluación publicadas.

El modelo cuenta con 9.197.093.888 parámetros totales según los safetensors del modelo base y se distribuye bajo licencia Apache 2.0. La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 9B especializado en tareas de CLI en hardware de consumo mediante llama.cpp y derivados, con un abanico de cuantizaciones que van desde Q2_K (4,1 GB) hasta f16 (18,5 GB), además de un proyector multimodal (mmproj) que sugiere capacidades de visión heredadas de la arquitectura base.

No se dispone de información sobre la longitud de contexto, la composición exacta del dataset de entrenamiento ni los detalles de la arquitectura más allá de lo inferible del modelo base. Esta ficha se limita a los datos verificables del repositorio y del model card, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5; detalles no disponibles) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | coreano (ko) declarado en el model card; resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es NA2RU2/spine-cli-qwen3.5-9b, un ajuste fino mediante LoRA sobre una arquitectura Qwen 3.5 de 9B parámetros. El repositorio cuantizado conserva las etiquetas `lora` y `safetensors` del modelo original, lo que indica que el ajuste se realizó con adaptadores LoRA sobre la base y posteriormente se fusionó o exportó. No se especifica en la información disponible si la arquitectura emplea atención lineal, decodificación especulativa u otras innovaciones, ni el número de tokens de entrenamiento, la composición del dataset más allá de su nombre (spine-cli-sft-ko) ni si hubo fases de RLHF o DPO.

El nombre del dataset (`spine-cli-sft-ko`) sugiere un ajuste supervisado (SFT) orientado a tareas de línea de comandos en coreano, aunque no se detalla el volumen ni la naturaleza de las muestras. La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio GGUF indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imágenes, heredado de la familia Qwen. La cuantización la realiza mradermacher con cuantizaciones estáticas; el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Soporte multimodal: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` indica capacidad de procesamiento de imágenes (visión) heredada del modelo base.
- Especialización en tareas de CLI: el ajuste sobre el dataset spine-cli-sft-ko apunta a un uso orientado a comandos, terminal y flujos de trabajo de línea de comandos.
- Capacidad multilingüe limitada según la información disponible: el único idioma declarado es el coreano; no se confirma soporte de otros idiomas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking en la documentación proporcionada.

## Casos de uso

- Asistente de terminal en coreano: el modelo puede integrarse en un shell o REPL para sugerir comandos, explicar errores y guiar al usuario en tareas de administración de sistemas, aprovechando su ajuste específico sobre datos de CLI.
- Automatización de scripts y pipelines: dado su enfoque en línea de comandos, puede emplearse para generar y corregir scripts de shell o comandos de herramientas de build en flujos de CI/CD, siempre con supervisión humana.
- Documentación técnica asistida: generación de explicaciones de comandos, páginas de manual y ejemplos de uso en coreano para equipos de soporte o documentación.
- Procesamiento de capturas de terminal con visión: gracias al proyector multimodal, puede analizar imágenes de pantallas de terminal o logs renderizados y proponer acciones correctivas.
- Despliegue local en hardware de consumo: con cuantizaciones de 4-6 GB (Q4_K_M, Q5_K_M), es viable ejecutarlo en portátiles con GPU de 8 GB o en CPU mediante llama.cpp para tareas de asistencia offline.
- Prototipado de agentes de CLI: como base para experimentar con agentes que ejecutan comandos en entornos controlados, usando el modelo como planificador de acciones en coreano.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (Q2 a f16) que permite estudiar el compromiso calidad/tamaño en un modelo de 9B especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización): Q2_K ~4,1 GB; Q3_K_M ~4,9 GB; IQ4_XS ~5,5 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,8 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Añadir ~0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3060/4060 de 8 GB o superior es suficiente; para Q8_0, una RTX 4070/4080 de 12-16 GB; para f16, una RTX 4090 de 24 GB o una A100/H100.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones Q4-Q6 con GPUs de 8-12 GB; las versiones Q8_0 y f16 requieren GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF. El repositorio declara `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia tipo TGI/vLLM, aunque no se detalla.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| spine-cli-qwen3.5-9b-GGUF (este) | 9,2B | no disponible | Apache 2.0 | GGUF | Ajuste LoRA para CLI en coreano, con visión |
| Qwen 2.5 7B Instruct (GGUF) | 7,6B | 32k (típico) | Apache 2.0 | GGUF | Modelo generalista comparable en tamaño; no especializado en CLI |
| Llama 3.1 8B Instruct (GGUF) | 8B | 128k | Llama 3.1 Community | GGUF | Generalista, sin especialización CLI ni visión |
| Mistral 7B Instruct (GGUF) | 7,2B | 32k | Apache 2.0 | GGUF | Generalista, sin visión |

La comparación es orientativa: no se dispone de benchmarks del modelo evaluado, por lo que no es posible establecer una comparación de rendimiento cuantitativa con las alternativas. Las alternativas citadas son generalistas y no comparten la especialización en CLI ni el idioma coreano del modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que dificulta justificar su uso en producción frente a alternativas evaluadas.
- Especialización estrecha: el ajuste sobre spine-cli-sft-ko puede degradar el rendimiento en tareas generales fuera del dominio CLI o del coreano.
- Idioma: solo se declara coreano; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al de modelos multilingües generalistas.
- Riesgo de alucinación: como todo modelo generativo, puede inventar comandos, rutas o flags inexistentes; en contextos de CLI esto puede provocar acciones destructivas si se ejecutan sin validación.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar su uso en conversaciones largas o documentos extensos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las posibles restricciones heredadas del modelo base Qwen 3.5.
- Datos de entrenamiento no documentados: se desconoce la procedencia y calidad del dataset spine-cli-sft-ko, lo que impide evaluar sesgos y riesgos de contaminación.
- Fecha de creación futura (2026-11-24): el repositorio presenta una fecha anómala que conviene verificar antes de confiar en su mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/spine-cli-qwen3.5-9b-GGUF
- Modelo base: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/NA2RU2/spine-cli-sft-ko
- Página de descargas del autor: https://hf.tst.eu/model#spine-cli-qwen3.5-9b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
