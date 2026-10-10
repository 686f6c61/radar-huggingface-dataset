# Jinstudio/GLM-OCR

## Resumen

GLM-OCR es un modelo multimodal especializado en reconocimiento optico de caracteres y comprension de documentos complejos, construido sobre la arquitectura encoder-decoder GLM-V. Lo desarrolla el equipo de zai-org (la organizacion detras de la familia GLM) y esta publicado en HuggingFace bajo licencia MIT. La ficha aqui analizada es una copia subida por el usuario Jinstudio en octubre de 2026; el repositorio de referencia es el oficial de zai-org, y el modelo tambien se distribuye a traves de la API de Z.ai.

El modelo combina un encoder visual CogViT preentrenado con datos imagen-texto a gran escala, un conector cross-modal ligero con downsampling eficiente de tokens y un decodificador de lenguaje GLM-0.5B. Su objetivo es resolver OCR sobre maquetaciones dificiles: tablas complejas, documentos con mucho codigo, sellos, formularios y documentos escaneados del mundo real. Se apoya en un pipeline de dos etapas (analisis de layout con PP-DocLayout-V3 y reconocimiento en paralelo) para producir Markdown estructurado o JSON con esquema estricto.

Su relevancia actual radica en dos factores: por un lado, alcanza 94,62 puntos en OmniDocBench V1.5 (primer puesto segun la model card); por otro, su tamano reducido (la model card declara 0,9B de parametros; los safetensors del repositorio suman 1.325.258.240 parametros, aproximadamente 1,33B) permite despliegue en vLLM, SGLang y Ollama con coste de inferencia bajo, lo que lo hace apto para servicios de alta concurrencia y entornos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multimodal GLM-V: encoder visual CogViT + conector cross-modal con downsampling de tokens + decodificador de lenguaje GLM-0.5B |
| Parametros totales | 1.325.258.240 (~1,33 mil millones) segun safetensors; la model card declara 0,9B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el soporte declarado de Ollama sugiere conversion a GGUF |
| Idiomas soportados | zh, en, fr, es, ru, de, ja, ko |
| Licencia | MIT (el pipeline completo con PP-DocLayout-V3 usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-OCR sigue un esquema encoder-decoder multimodal. El encoder visual es CogViT, preentrenado sobre datos imagen-texto a gran escala. Entre el encoder y el decodificador se situa un conector cross-modal ligero que aplica downsampling de tokens para reducir el coste computacional de la parte visual. El decodificador de lenguaje es un GLM-0.5B. Sobre este diseno, el equipo introduce dos innovaciones de entrenamiento: una perdida de Multi-Token Prediction (MTP), que persigue mejorar la eficiencia de entrenamiento y la precision de reconocimiento, y un esquema de aprendizaje por refuerzo sobre la tarea completa ("stable full-task RL") orientado a mejorar la generalizacion.

En el plano de inferencia, la model card recomienda no usar el modelo aislado para parsing de documentos, sino el SDK oficial, que integra PP-DocLayout-V3 y ejecuta un pipeline de dos etapas: primero analisis de layout y despues reconocimiento en paralelo. El modelo esta disenado para responder a un conjunto limitado de prompts: "Text Recognition:", "Formula Recognition:" y "Table Recognition:" para parsing, y prompts de extraccion de informacion que deben seguir estrictamente un esquema JSON. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO.

## Capacidades

- Reconocimiento de texto (OCR) sobre imagenes y documentos, incluidos escaneos y maquetaciones complejas.
- Reconocimiento de formulas matematicas.
- Reconocimiento de tablas.
- Parsing de documentos a Markdown estructurado mediante el SDK oficial.
- Extraccion de informacion estructurada con salida JSON conforme a un esquema definido por el usuario.
- Comprension de documentos con codigo, sellos y layouts poco habituales.
- Soporte multilingue en chino, ingles, frances, espanol, ruso, aleman, japones y coreano.
- Interfaz conversacional (tag `conversational`) e imagen-a-texto (`image-to-text` / `image-text-to-text`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de archivos empresariales: el modelo convierte lotes de PDF e imagenes en Markdown estructurado mediante el pipeline de layout + reconocimiento en paralelo, con un rendimiento medido de 1,86 paginas por segundo en PDF y 0,67 imagenes por segundo.
- Extraccion de datos de documentos de identidad y formularios: admite prompts con esquema JSON estricto, de modo que la salida se puede volcar directamente a una base de datos o a un sistema de gestion documental sin post-procesado complejo.
- Procesamiento de facturas y albaranes: la extraccion de campos concretos (importes, fechas, emisores) se define en el propio prompt JSON, lo que simplifica la integracion en flujos de contabilidad.
- Conversion de articulos cientificos y libros tecnicos: reconoce formulas y tablas, lo que permite reconstruir contenido academico en formato Markdown preservando la estructura.
- Servicios de alta concurrencia: con aproximadamente 1,3B de parametros y soporte de vLLM, SGLang y Ollama, se puede desplegar en GPU de gama media y atender multiples peticiones simultaneas con coste contenido.
- Despliegue en el borde o en entornos con recursos limitados: el tamano reducido permite ejecutar OCR local en equipos sin acceso a servicios en la nube, util para documentos con requisitos de confidencialidad.
- Indexacion y busqueda documental (RAG): la salida Markdown estructurada sirve como entrada limpia a pipelines de chunking y embeddings.
- Digitalizacion de documentacion tecnica con bloques de codigo: el modelo esta optimizado, segun la model card, para documentos con mucho codigo.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son el resultado en OmniDocBench V1.5 y las cifras de velocidad. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general.

| Benchmark | Resultado | Notas |
|---|---|---|
| OmniDocBench V1.5 | 94,62 | Primer puesto segun la model card |
| Velocidad (PDF) | 1,86 paginas/segundo | Replica unica, concurrencia 1 |
| Velocidad (imagenes) | 0,67 imagenes/segundo | Replica unica, concurrencia 1 |

Las comparativas por benchmark de reconocimiento de formulas, tablas y extraccion de informacion se presentan en la model card unicamente como imagenes (docparse.png, realworld.png, speed.png) sin valores numericos textuales, por lo que no se pueden reproducir aqui.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros del repositorio (1,33B); la model card no publica requisitos oficiales de VRAM.

- Pesos en fp16/bf16: aproximadamente 2,6-2,7 GB.
- Pesos en int8: aproximadamente 1,3 GB.
- Pesos en int4: aproximadamente 0,7 GB.
- Hay que anadir a esas cifras el encoder visual, los tokens de imagen y la cache KV, por lo que el consumo real sera superior al de los pesos solos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 e incluso tarjetas con 8 GB en cuantizacion de 4 bits.
- Para servicio en produccion se recomiendan aceleradores tipo A100, H100 o L40S, aunque el modelo es lo bastante pequeno para funcionar en GPU de gama media.
- Frameworks de despliegue soportados oficialmente: vLLM (recipes.vllm.ai), SGLang (cookbook oficial), Transformers (documentacion de glm_ocr) y Ollama.
- Rendimiento declarado: 1,86 paginas por segundo en PDF y 0,67 imagenes por segundo, medido con una replica y concurrencia 1.
- Latencia por peticion: no disponible.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de informacion publica general y deben verificarse en sus fichas oficiales; no se han extraido de la documentacion facilitada para GLM-OCR.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GLM-OCR | ~1,33B (safetensors); 0,9B declarado | no disponible | MIT | OCR y parsing documental multimodal, salida Markdown y JSON |
| GOT-OCR2.0 | ~0,58B (dato publico, verificar) | no disponible | Apache 2.0 (verificar) | OCR generalista end-to-end |
| dots.ocr | ~1,7B (dato publico, verificar) | no disponible | verificar en ficha oficial | OCR y parsing con salida estructurada |
| olmOCR | ~7B (dato publico, verificar) | no disponible | verificar en ficha oficial | OCR de documentos academicos y tecnicos |

No se dispone de una comparativa numerica directa entre estos modelos y GLM-OCR en la informacion proporcionada, salvo el resultado de OmniDocBench V1.5 del propio GLM-OCR.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card indica 0,9B mientras que los safetensors del repositorio suman 1,325.258.240 (~1,33B). Conviene verificar cual es la cifra correcta antes de dimensionar hardware.
- Prompts restringidos: la model card advierte explicitamente de que solo se soportan dos escenarios de prompt (parsing documental e extraccion de informacion) y que este ultimo exige un esquema JSON estricto. No es un asistente multimodal de proposito general.
- El SDK oficial esta disenado unicamente para tareas de parsing; para extraccion de informacion hay que invocar el modelo directamente.
- El pipeline completo depende de PP-DocLayout-V3, con licencia Apache 2.0, distinta de la MIT del modelo. Hay que revisar ambas licencias en un uso comercial.
- El repositorio analizado (Jinstudio/GLM-OCR) es una copia con 0 descargas y 0 likes; conviene usar el repositorio oficial de zai-org para produccion.
- Riesgo de alucinacion en campos de extraccion: al forzar una salida JSON con esquema fijo, el modelo puede rellenar campos sin evidencia clara en la imagen. Es recomendable validar la salida.
- Sesgos conocidos y comportamiento en idiomas distintos de los ocho declarados: no disponible.
- Limitaciones de contexto: no se publica la longitud de contexto soportada.
- Idiomas: el espanol esta entre los soportados, pero no se detalla el nivel de calidad por idioma.
- No hay informacion sobre cuantizaciones oficiales ni sobre pesos GGUF publicados; el soporte de Ollama tendria que verificarse en el repositorio oficial.
- No se documentan resultados en benchmarks de capacidades generales, por lo que no debe asumirse rendimiento en tareas ajenas al OCR.

## Enlaces

- Modelo en HuggingFace (copia analizada): https://huggingface.co/Jinstudio/GLM-OCR
- Repositorio oficial en GitHub: https://github.com/zai-org/GLM-OCR
- Informe tecnico (arXiv): https://arxiv.org/abs/2603.10910
- Documentacion de la API en Z.ai: https://docs.z.ai/guides/vlm/glm-ocr
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-OCR
- Recipes de vLLM: https://recipes.vllm.ai/zai-org/GLM-OCR
- Documentacion de Transformers para glm_ocr: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_ocr.md
- PP-DocLayout-V3 en HuggingFace: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- MinerU: https://github.com/opendatalab/MinerU
- Comunidad en Discord: https://discord.gg/QR7SARHRxK
