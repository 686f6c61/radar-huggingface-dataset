# moroz-ellmsha/sdai-bonsai-model-archives

## Resumen

Bonsai model archives for SDAI es un repositorio de distribución que empaqueta en archivos ZIP dos variantes del modelo de generación de imágenes Bonsai Image 4B de Prism ML, adaptadas al framework MLX de Apple. El repositorio lo mantiene el usuario moroz-ellmsha y no contiene pesos nuevos ni un modelo entrenado desde cero: su función es servir como espejo de descarga para el proveedor local Bonsai de la aplicación SDAI (ShiftHackZ/SDAI-KMP), una app multiplataforma orientada a Android e iOS.

El modelo subyacente es un text-to-image de 4.000 millones de parámetros con cuantización extrema: una variante ternaria de 2 bits y otra binaria de 1 bit, ambas en formato MLX para ejecución en hardware Apple Silicon. El repositorio incluye además un text encoder cuantizado a 4 bits, tokenizer, scheduler y VAE, todo empaquetado sin compresión ZIP para facilitar la extracción directa por parte del runtime de SDAI.

La relevancia de este artefacto es práctica: permite desplegar generación de imágenes local en dispositivos móviles y equipos con Apple Silicon sin depender de servicios en la nube, con archivos de entre 3,4 y 3,9 GB. La licencia Apache 2.0 de los modelos upstream facilita su redistribución e integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión text-to-image; pesos en formato MLX/mflux) |
| Parametros totales | 4B (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria 2-bit (variante ternary) y binaria 1-bit (variante binary); text encoder en 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (directorios `transformer-packed-mflux`, `text_encoder-mlx-4bit`, `tokenizer`, `scheduler`, `vae`), distribuidos en ZIP sin compresión |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo upstream. Por el pipeline declarado (text-to-image) y la estructura de directorios del paquete (`transformer`, `text_encoder`, `vae`, `scheduler`), se trata de un modelo de difusión con un transformer como backbone, un text encoder separado y un VAE para decodificar latentes a píxeles. El transformer está empaquetado en formato mflux, la implementación de MLX para modelos de difusión.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica destacable es la cuantización extrema de los pesos: una variante ternaria de 2 bits y otra binaria de 1 bit, que reducen el tamaño del transformer de forma drástica para hacer viable la inferencia en dispositivos con memoria limitada. El repositorio en sí no entrena nada; solo empaqueta los pesos upstream en archivos ZIP verificables mediante SHA-256.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image).
- Ejecución local mediante MLX en hardware Apple Silicon.
- Dos niveles de compromiso calidad/tamaño: variante ternaria 2-bit (3.872.372.876 bytes) y binaria 1-bit (3.428.223.981 bytes).
- Integración con el runtime Bonsai de SDAI, que descarga y extrae los archivos automáticamente.
- Verificación de integridad mediante checksums SHA-256 incluidos en `SHA256SUMS.txt`.
- Soporte de despliegue en Android e iOS a través de la app SDAI (etiquetas `android`, `ios`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades adicionales como audio o vídeo.

## Casos de uso

- Generación de imágenes offline en iPhone y iPad: la variante binaria 1-bit, con 3,4 GB de archivo, permite instalar el modelo en un dispositivo móvil y generar imágenes sin conexión a través de SDAI, útil en entornos sin red o con requisitos de privacidad estrictos.
- Prototipado rápido de pipelines text-to-image en Mac: un desarrollador puede descargar el ZIP ternario y ejecutarlo con MLX en un Mac con Apple Silicon para validar prompts y estilos antes de invertir en infraestructura GPU mayor.
- Aplicaciones de privacidad por diseño: al ejecutarse en local, los prompts y las imágenes generadas no salen del dispositivo, lo que encaja en casos con datos sensibles (salud, legal, menores).
- Distribución reproducible de modelos: el repositorio actúa como espejo con checksums verificables, adecuado para equipos que necesitan fijar una versión exacta del modelo en sus builds de CI o en instaladores de escritorio.
- Evaluación de cuantización extrema: investigadores pueden comparar la calidad de salida entre la variante ternaria 2-bit y la binaria 1-bit sobre el mismo modelo base de 4B para estudiar el impacto de la cuantización en difusión.
- Integración en apps KMP: al estar pensado para SDAI-KMP (Kotlin Multiplatform), sirve como fuente de artefactos para desarrolladores que construyan apps multiplataforma con generación de imágenes embebida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 3,43 GB (binario 1-bit) o 3,87 GB (ternario 2-bit) para el ZIP; se necesita espacio adicional para la extracción, ya que los archivos van sin compresión.
- Memoria: no se especifica VRAM ni RAM mínima; por el tamaño de los pesos y el text encoder en 4-bit, se requiere un dispositivo con varios GB de memoria unificada libre.
- Hardware objetivo: Apple Silicon (MLX) y dispositivos móviles Android/iOS compatibles con el runtime de SDAI.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; el formato MLX está orientado a Apple Silicon.
- Despliegue: runtime Bonsai de SDAI (ShiftHackZ/SDAI-KMP); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai Image Ternary 4B MLX 2-bit | 4B | ternaria 2-bit | no disponible | Apache 2.0 | Hugging Face (prism-ml) |
| Bonsai Image Binary 4B MLX 1-bit | 4B | binaria 1-bit | no disponible | Apache 2.0 | Hugging Face (prism-ml) |
| SDAI Bonsai archives (este repo) | 4B | 2-bit / 1-bit | no disponible | Apache 2.0 | Hugging Face (moroz-ellmsha) |

No se dispone de información sobre otros modelos comparables de la misma categoría (difusión text-to-image cuantizada para MLX) en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 1 y 2 bits puede degradar de forma notable la fidelidad y el detalle de las imágenes frente al modelo en precisión completa; no se aportan métricas de calidad.
- El repositorio no es un modelo original: depende de los modelos upstream de Prism ML y no documenta sus limitaciones, sesgos ni datos de entrenamiento.
- No se especifican los idiomas soportados por el text encoder, por lo que el rendimiento con prompts en castellano es incierto.
- Riesgo de alucinación visual y de sesgos heredados del dataset de entrenamiento upstream, no cuantificados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución indicada en `LICENSE` y `NOTICE.md`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su contenido.
- Los archivos ZIP no usan compresión, de modo que el espacio en disco necesario duplica aproximadamente el tamaño de descarga durante la extracción.
- El uso está restringido en la práctica a MLX y al runtime de SDAI; no hay soporte documentado para GPUs NVIDIA ni para frameworks de inferencia estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moroz-ellmsha/sdai-bonsai-model-archives
- Modelo upstream ternario 2-bit: https://huggingface.co/prism-ml/bonsai-image-ternary-4B-mlx-2bit
- Modelo upstream binario 1-bit: https://huggingface.co/prism-ml/bonsai-image-binary-4B-mlx-1bit
- Aplicación SDAI (KMP): https://github.com/ShiftHackZ/SDAI-KMP
- Descarga variante ternaria: https://huggingface.co/moroz-ellmsha/sdai-bonsai-model-archives/resolve/main/bonsai-image-ternary-4b-mlx-2bit.zip?download=true
- Descarga variante binaria: https://huggingface.co/moroz-ellmsha/sdai-bonsai-model-archives/resolve/main/bonsai-image-binary-4b-mlx-1bit.zip?download=true
- Checksums: https://huggingface.co/moroz-ellmsha/sdai-bonsai-model-archives/blob/main/SHA256SUMS.txt
