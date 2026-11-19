# protos-photos/siglip2-giant-opt-patch16-256-coreml

## Resumen

SigLIP 2 Giant, Core ML es una conversión a Core ML del modelo multimodal de imagen y texto `google/siglip2-giant-opt-patch16-256` de Google, publicada por el usuario `protos-photos` para su uso en la aplicación Protos para macOS. El modelo original es un codificador de doble torre (image-text) de la familia SigLIP 2, pensado para generar embeddings alineados entre imágenes y texto, lo que permite tareas de búsqueda y recuperación multimodal. Esta conversión mantiene los pesos originales sin cambios y se limita a dividir el modelo en dos torres exportadas a Core ML en float16.

La relevancia de esta ficha es acotada: no se trata de un modelo generativo ni de un LLM, sino de un export para inferencia local en Apple Silicon. El repositorio ocupa 3,8 GB y no registra descargas ni interacciones en el momento de la consulta. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa, ya que la model card se centra en los detalles de la conversión y remite al modelo base de Google para el resto.

El modelo resuelve el problema de ejecutar búsqueda de imágenes por texto (y viceversa) en local dentro del ecosistema Apple, sin depender de servicios en la nube. Al estar empaquetado como Core ML, se integra de forma nativa en aplicaciones macOS mediante el framework Core ML, a diferencia de las versiones PyTorch o safetensors del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (image encoder + text encoder), base SigLIP 2 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text tower acepta `input_ids` de longitud fija 64) |
| Tipos de cuantización | float16 (export Core ML); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible (el tokenizador usa tokens Gemma) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`); tokenizador en formato original de Google |

## Arquitectura y entrenamiento

El modelo base es SigLIP 2 en su variante giant con patch size 16 y resolución de entrada 256×256, un codificador de imagen y texto entrenado con una función de pérdida sigmoidea (SigLIP) para alinear representaciones multimodales. La conversión divide el modelo en dos torres independientes: la torre de imagen recibe `pixel_values` en float32 con forma [1, 3, 256, 256] escalados al rango -1..1 y devuelve `image_embeds`; la torre de texto recibe `input_ids` int32 con forma [1, 64] usando tokens de Gemma y devuelve `text_embeds`. Ambas torres se exportaron con coremltools 8.3.0 en float16 y devuelven los vectores proyectados sin normalizar, por lo que la normalización L2 corre a cargo del usuario.

No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card de esta conversión remite al modelo original de Google. La innovación técnica de esta publicación es exclusivamente el empaquetado para Core ML: separación en dos torres, precisión float16 y formato de entrada fijo, orientado a inferencia en dispositivos Apple.

## Capacidades

- Generación de embeddings de imagen a partir de entradas de 256×256 píxeles.
- Generación de embeddings de texto a partir de secuencias de hasta 64 tokens.
- Búsqueda y recuperación multimodal imagen-texto mediante similitud de embeddings (requiere normalización L2 externa).
- Ejecución local en macOS mediante Core ML, sin llamadas a red.
- No soporta generación de texto, razonamiento, código ni matemáticas: es un codificador, no un modelo generativo.
- No dispone de tool calling ni de capacidades de agente.
- Capacidades multilingües no documentadas; el tokenizador emplea tokens Gemma, pero no se especifica cobertura de idiomas.
- No incluye visión generativa, audio ni modo de razonamiento.

## Casos de uso

- Búsqueda de fotos por descripción textual en aplicaciones macOS: se calculan embeddings de la biblioteca de imágenes con la torre de imagen y el embedding de la consulta con la torre de texto, y se ordenan por similitud coseno tras normalizar L2.
- Etiquetado y clustering de imágenes locales: los embeddings de imagen permiten agrupar fotos similares o detectar duplicados sin enviar datos a un servidor.
- Filtrado de contenido en pipelines locales: comparar embeddings de imagen contra embeddings de texto de referencia para clasificar o descartar imágenes.
- Indexación offline de archivos multimedia: al ejecutarse en Core ML, permite construir índices vectoriales en el propio Mac, útil en entornos con requisitos de privacidad.
- Prototipado de aplicaciones de visión en Apple Silicon: sirve como bloque de codificación congelado para experimentar con recuperación multimodal antes de pasar a producción.
- Integración en la app Protos: es el caso de uso declarado por el autor, búsqueda de imágenes en la aplicación de escritorio para macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser Core ML para macOS, el consumo se reparte entre memoria unificada y GPU/Neural Engine de Apple Silicon.
- Tamaño del repositorio: 3,8 GB, lo que da una idea del espacio en disco necesario para los pesos en float16.
- GPU recomendadas: no disponible; el destino declarado es macOS con Core ML, por lo que se asume Apple Silicon (M-series) o GPU AMD compatibles con Core ML.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta soporte para CUDA ni para GPUs NVIDIA.
- Opciones de despliegue: Core ML (coremltools 8.3.0 para la exportación); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| protos-photos/siglip2-giant-opt-patch16-256-coreml | no disponible | texto fijo 64 tokens | Core ML float16 | Apache-2.0 | Hugging Face (0 descargas) |
| google/siglip2-giant-opt-patch16-256 | no disponible | no disponible | safetensors/PyTorch | Apache-2.0 | Hugging Face (modelo base) |
| Alternativas de la familia SigLIP 2 (otras variantes) | no disponible | no disponible | safetensors/PyTorch | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un codificador de embeddings, no un modelo generativo: no produce texto ni respuestas.
- La torre de texto acepta una longitud fija de 64 tokens, lo que limita consultas largas.
- Los vectores devueltos no están normalizados; omitir la normalización L2 produce similitudes incorrectas.
- La entrada de imagen está fijada a 256×256 píxeles en float32 con rango -1..1; no admite otras resoluciones sin preprocesado adicional.
- Solo se distribuye en formato Core ML, lo que restringe su uso a macOS y al ecosistema Apple.
- No se documentan sesgos conocidos ni tasas de alucinación para esta conversión; al ser un modelo de recuperación, el riesgo principal es la baja calidad de los resultados de búsqueda en dominios alejados del entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se mantiene el copyright de Google LLC sobre los pesos originales.
- El repositorio no registra descargas ni validación comunitaria, por lo que la fiabilidad de la conversión no está contrastada.
- No se especifican idiomas soportados ni cobertura multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protos-photos/siglip2-giant-opt-patch16-256-coreml
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-256
- coremltools: https://github.com/apple/coremltools
