# pilotcut/siglip2-base-patch16-256-coreml

## Resumen

Este modelo es una conversión a Core ML de `google/siglip2-base-patch16-256`, publicada por el usuario `pilotcut`. Se trata de un sistema de recuperación texto-imagen que divide el modelo original en dos codificadores independientes: uno para imágenes y otro para texto, con el objetivo de ejecutarse en dispositivos Apple bajo macOS 15 o posterior. La conversión redistribuye los pesos de `palmier-io/siglip2-base-coreml`, sin modificar sus valores más allá de una cuantización de 8 bits paletizada.

Es relevante porque permite desplegar capacidades de búsqueda semántica visual en aplicaciones nativas de Apple sin depender de servicios en la nube. El modelo genera embeddings L2-normalizados de 768 dimensiones para ambas modalidades, de modo que la similitud se calcula mediante un producto punto. El repositorio ocupa 0.4 GB e incluye los codificadores de imagen y texto, el tokenizador Gemma y un manifiesto con los hashes de los archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje de dos torres (SigLIP2), con codificador de imagen y codificador de texto separados |
| Parametros totales | no disponible (repo de 0.4 GB con pesos cuantizados a 8 bits) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto; imagen de 256x256 píxeles |
| Tipos de cuantizacion | 8-bit paletizada (por grupos de canales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage en ZIP), tokenizer Gemma SentencePiece |

## Arquitectura y entrenamiento

El modelo base es SigLIP2, una arquitectura de visión-lenguaje de dos torres que procesa imágenes y texto por separado. En esta conversión, la torre de visión acepta entradas de 256x256 píxeles y la torre de texto acepta secuencias de hasta 64 tokens. Ambas torres emiten vectores L2-normalizados de 768 dimensiones, de modo que la similitud entre un texto y una imagen se calcula como el producto punto de sus embeddings.

No se ha realizado entrenamiento adicional: la conversión conserva los pesos originales de Google, únicamente aplica una cuantización de 8 bits paletizada para reducir el tamaño del modelo. El tokenizador incluido es el de Gemma, basado en SentencePiece. Una peculiaridad técnica destacable es que el texto debe rellenarse exactamente a 64 tokens con el token de pad (0) y sin máscara de atención, tal como se entrenó el modelo original; cualquier variación en el padding puede degradar los embeddings.

## Capacidades

- Recuperación texto-imagen: codifica descripciones textuales e imágenes en el mismo espacio semántico y calcula similitud mediante producto punto.
- Generación de embeddings L2-normalizados de 768 dimensiones para ambas modalidades.
- Ejecución on-device en macOS 15 o posterior mediante Core ML, sin necesidad de conexión a Internet.
- Preprocesamiento de imagen específico: squash-resize a 256x256 sin recorte central, con píxeles escalados a [-1, 1].
- Tokenización de texto mediante el tokenizer Gemma incluido, con padding fijo a 64 tokens.
- No incluye capacidades de generación de texto, tool calling ni agentes, al ser un modelo de recuperación.

## Casos de uso

- Búsqueda visual en bibliotecas de recursos: indexar imágenes de una colección local con los embeddings de 768 dimensiones y permitir que el usuario busque por texto. Es adecuado porque la similitud por producto punto es rápida y se ejecuta localmente.
- Organización automática de fotos: clasificar imágenes según su contenido semántico a partir de descripciones textuales, aprovechando la ejecución on-device y la privacidad de los datos.
- Recomendación de contenido en aplicaciones de diseño: sugerir imágenes relevantes a partir de una brief textual, sin necesidad de servidores externos.
- Moderación de contenido: comparar imágenes con descripciones para detectar contenido no deseado, con latencia baja al no depender de una API remota.
- Accesibilidad en aplicaciones de gestión de activos: permitir búsquedas por descripción para usuarios que no pueden ver las imágenes, gracias a la recuperación texto-imagen.
- Indexación de vídeo: extraer frames de un vídeo y buscar escenas concretas mediante texto, usando la torre de imagen para cada frame.
- Búsqueda de productos en e-commerce: asociar descripciones de productos con imágenes de catálogo, integrando el modelo en una app macOS nativa.
- Asistente de creación de presentaciones: encontrar imágenes de apoyo a partir del texto de una diapositiva, con embeddings L2-normalizados para una ordenación por relevancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser Core ML, utiliza memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon (M1 o posterior) con macOS 15 o superior.
- Si cabe en consumer GPU: sí, está diseñado para ejecutarse en dispositivos Apple de consumo.
- Opciones de despliegue: Core ML (Xcode, aplicaciones nativas macOS); no compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| pilotcut/siglip2-base-patch16-256-coreml | Core ML (.mlpackage) | 8-bit paletizada | Apache 2.0 | HuggingFace |
| google/siglip2-base-patch16-256 | no disponible | no disponible | Apache 2.0 | HuggingFace |
| nodevorg/siglip2-base-patch16-256-coreml | Core ML | no disponible | no disponible | HuggingFace |

Los tres modelos comparten la misma arquitectura SigLIP2 base y el mismo contexto de 64 tokens de texto e imagen de 256x256 píxeles. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información.
- Riesgo de alucinación: al ser un modelo de recuperación, no genera texto, pero puede producir asociaciones incorrectas entre texto e imagen.
- Limitaciones de contexto: el texto se limita a 64 tokens y requiere un padding exacto de 64 con el token 0 y sin máscara de atención; cualquier desviación puede degradar los embeddings.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige mantener el aviso de licencia y atribución.
- Caveat para producción: requiere macOS 15 o superior; los archivos son inmutables, por lo que cualquier actualización debe gestionarse como nueva versión; la cuantización de 8 bits puede reducir ligeramente la precisión de los embeddings.
- El preprocesamiento de imagen debe ser squash-resize (sin recorte central) y escalado a [-1, 1]; si se usa otro preprocesamiento, los resultados serán incorrectos.

## Enlaces

- [pilotcut/siglip2-base-patch16-256-coreml](https://huggingface.co/pilotcut/siglip2-base-patch16-256-coreml)
- [google/siglip2-base-patch16-256](https://huggingface.co/google/siglip2-base-patch16-256)
- [palmier-io/siglip2-base-coreml](https://huggingface.co/palmier-io/siglip2-base-coreml)
- [nodevorg/siglip2-base-patch16-256-coreml](https://huggingface.co/nodevorg/siglip2-base-patch16-256-coreml)
