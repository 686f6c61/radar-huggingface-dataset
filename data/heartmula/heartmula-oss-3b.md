# HeartMuLa/HeartMuLa-oss-3B

## Resumen

HeartMuLa-oss-3B es un modelo de generación de audio a partir de texto (text-to-audio) especializado en música, desarrollado por el equipo HeartMuLa (MulaLabs) y publicado con licencia Apache 2.0. Forma parte de la familia HeartMuLa de modelos fundacionales de música de código abierto, presentada en el paper arXiv 2601.10547, y se distribuye junto a otros dos componentes del ecosistema: HeartCodec-oss (códec de audio) y HeartTranscriptor-oss (transcriptor). El modelo resuelve la tarea de convertir descripciones textuales y letras en audio musical, incluyendo la creación de canciones a partir de letras, covers y remezclas.

Con 3.938.113.536 parámetros (aproximadamente 3,9 mil millones) en formato safetensors y un repositorio de 15,8 GB, el modelo está diseñado para ejecutarse en infraestructura de gama media, lo que lo hace accesible para desarrolladores e investigadores que necesitan generar música sin depender de servicios propietarios. Soporta cinco idiomas declarados (chino, inglés, japonés, coreano y español) además de la etiqueta multilingüe.

Su relevancia actual radica en que ofrece una alternativa abierta y permisiva (Apache 2.0 permite uso comercial) en un ámbito, el de la generación musical, donde predominan modelos cerrados. La integración con la herramienta MuLa Studio para edición de pasajes concretos de una canción y la disponibilidad de un servicio online con créditos diarios gratuitos completan una propuesta tanto para investigación como para producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio; el paper describe una familia de modelos fundacionales de música, sin detalle de arquitectura en la información proporcionada) |
| Parametros totales | 3.938.113.536 (~3,9 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe; zh, en, ja, ko, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, diseño del decodificador de audio ni integración con el códec). El modelo se presenta como parte de una familia de modelos fundacionales de música de código abierto, y su pipeline declarado es text-to-audio, lo que implica una etapa de codificación del texto y una etapa de generación de audio. Para conocer los detalles de arquitectura, composición del dataset, número de tokens de entrenamiento y uso de técnicas como RLHF o DPO, es necesario consultar el paper arXiv 2601.10547, que no se incluye en la información proporcionada.

El ecosistema se organiza en tres piezas: HeartMuLa-oss-3B como modelo generador, HeartCodec-oss como códec de audio (previsiblemente para la representación discreta del audio) y HeartTranscriptor-oss como transcriptor. La innovación destacable documentada es la capacidad de edición de pasajes concretos de una canción en MuLa Studio, así como la generación de covers y remezclas, aunque los detalles técnicos de cómo se implementan no están disponibles.

## Capacidades

- Generación de audio musical a partir de texto (text-to-audio), incluyendo la creación de canciones a partir de letras.
- Creación de covers y remezclas de canciones existentes.
- Edición de pasajes concretos de una canción en MuLa Studio.
- Soporte multilingüe declarado para chino, inglés, japonés, coreano y español.
- Orientado a aplicaciones artísticas y musicales (tags "music" y "art").
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada o modo de pensamiento (thinking mode) en la información proporcionada.

## Casos de uso

- Generación de canciones a partir de letras: el modelo convierte un texto de letra en audio musical, lo que permite a compositores y creadores de contenido prototipar rápidamente ideas musicales sin necesidad de instrumentos ni producción manual.
- Creación de covers y remezclas: a partir de una canción existente, el modelo puede generar versiones alternativas o remezclas, útil para sellos discográficos, creadores de contenido y plataformas de música que quieran ofrecer variantes de un tema.
- Edición musical por pasajes en MuLa Studio: la integración con la herramienta de edición permite modificar una sección concreta de una canción sin regenerar el resto, lo que resulta adecuado para flujos de producción musical iterativos.
- Generación de música de fondo para vídeo y podcasts: creadores que necesitan bandas sonoras libres de derechos pueden generar pistas originales con licencia Apache 2.0, evitando problemas de licencias de música comercial.
- Prototipado en investigación musical y académica: al ser un modelo abierto con paper asociado, permite a investigadores reproducir experimentos, hacer fine-tuning y estudiar la generación musical en cinco idiomas.
- Aplicaciones educativas y de aprendizaje musical: estudiantes pueden explorar cómo descripciones textuales se traducen en audio, o generar ejemplos para analizar estructuras musicales.
- Integración en plataformas de creación musical con créditos gratuitos: el servicio online heartmula.com ofrece créditos diarios gratuitos, lo que facilita la evaluación del modelo antes de un despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~3,9 B parámetros y pesos en safetensors (repositorio de 15,8 GB), una estimación orientativa en FP16 sería de aproximadamente 8 GB solo para los pesos, más memoria para el códec y el estado de inferencia; en cuantizaciones de 8 bits o 4 bits podría reducirse sustancialmente, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 de 24 GB) y en GPUs de datacenter como A100 o H100, pero esto no está confirmado por el autor.
- ¿Cabe en consumer GPU?: probablemente sí en GPUs de 24 GB o más, pero no confirmado.
- Opciones de despliegue: el repositorio GitHub (github.com/HeartMuLa/heartlib) ofrece quickstart y despliegue local; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a LLM y no necesariamente aplican a un modelo text-to-audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información proporcionada; al ser un modelo generativo de música, puede reproducir estilos o patrones presentes en sus datos de entrenamiento.
- Riesgo de alucinación y de generar audio de baja calidad o incoherente con el texto de entrada; no hay métricas publicadas que lo cuantifiquen.
- La longitud de contexto no está disponible, por lo que se desconoce cuánta letra o descripción puede procesar de una vez.
- El soporte de idiomas se limita a los declarados (zh, en, ja, ko, es); el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse las condiciones de los componentes auxiliares (HeartCodec-oss, HeartTranscriptor-oss) y de los datos de entrenamiento, no detalladas.
- No hay información sobre cuantizaciones oficiales ni sobre requisitos mínimos de hardware, lo que dificulta planificar un despliegue en producción.
- El modelo está orientado a audio musical; no debe esperarse que realice tareas de LLM (razonamiento textual, código, matemáticas) ni de visión.

## Enlaces

- Hugging Face: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Paper: https://arxiv.org/abs/2601.10547
- GitHub: https://github.com/HeartMuLa/heartlib
- Web oficial: https://heartmula.com
- Demo: https://heartmula.github.io/
- HeartCodec-oss: https://huggingface.co/HeartMuLa/HeartCodec-oss
- HeartTranscriptor-oss: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Contacto: contact@mulalabs.ai
