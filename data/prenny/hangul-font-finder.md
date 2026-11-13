# prenny/hangul-font-finder

## Resumen

hangul-font-finder es un modelo de clasificación de imágenes desarrollado por el usuario prenny (con repositorio asociado en GitHub bajo la cuenta habaekk) que identifica la fuente tipográfica coreana utilizada en una imagen que contiene una sola línea de texto en hangul. El modelo parte del codificador visual SigLIP 2 Base (google/siglip2-base-patch16-224), que se afina completamente y se remata con una proyección a 512 dimensiones y un clasificador lineal sobre un vocabulario de 1.279 fuentes coreanas gratuitas (1.393 familias tipográficas).

El problema que resuelve es concreto y poco cubierto: dada una captura o recorte de una línea de texto en coreano, determinar qué fuente se usó, sin necesidad de OCR ni de segmentación de caracteres. El modelo es robusto a contornos, sombras, extrusión 3D, degradados, escalado horizontal, oclusión parcial, baja resolución y compresión, según declara el autor.

Con 93,97 millones de parámetros y un repositorio de 0,4 GB, es un modelo ligero, entrenado exclusivamente con datos sintéticos (unas 400.000 imágenes de línea, aproximadamente 300 por fuente) y publicado bajo licencia MIT. Es relevante para flujos de trabajo de diseño, auditoría tipográfica y análisis de documentos donde la identificación manual de fuentes coreanas resulta costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 Base (codificador visual ViT patch16-224) afinado + proyección 512-d + clasificador lineal |
| Parametros totales | 93.972.039 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de una línea de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (hangul) |
| Licencia | MIT (pesos derivados de SigLIP 2, Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el codificador visual de SigLIP 2 Base con parches de 16×16 y resolución de 224×224, que se afina por completo. Sobre la representación visual se aplica una proyección a 512 dimensiones y un clasificador lineal que cubre las 1.279 fuentes. La entrada se codifica en escala de grises, se redimensiona a 56 píxeles de alto manteniendo la proporción y se pliega en 4 filas dentro de una imagen de 224×224; las líneas largas se promedian sobre 3 ventanas. Esta codificación permite procesar una línea completa sin OCR ni segmentación de caracteres.

El entrenamiento se realizó con aproximadamente 400.000 imágenes sintéticas de líneas de texto (unas 300 por fuente), durante 6 épocas con AdamW (lr 3e-5), batch de 128, label smoothing de 0,1 y calibración de temperatura (T = 0,690). Todo el entrenamiento se ejecutó en una única RTX 5080 en aproximadamente 85 minutos. La calibración de temperatura es relevante porque el modelo devuelve probabilidades calibradas, lo que permite aplicar umbrales de confianza en producción.

## Capacidades

- Identificación de fuente tipográfica coreana a partir de una imagen de una línea de hangul.
- Salida de probabilidades calibradas por fuente, con Top-1, Top-3 y Top-5.
- Agrupación de fuentes con glifos hangul idénticos (variantes OTF/TTF, nombres en inglés y coreano, releases de Google Fonts) bajo un único resultado con todos los nombres en `same_shape_fonts`.
- Robustez declarada frente a contornos, sombras, extrusión 3D, degradados, escalado horizontal, oclusión parcial, baja resolución y compresión.
- No requiere OCR ni segmentación de caracteres: la entrada es directamente la línea recortada.
- Ejecución en CUDA, MPS y CPU.
- Capacidad multilingüe limitada al coreano; no se evaluaron líneas con solo caracteres latinos o dígitos.
- No dispone de tool calling, razonamiento multi-paso ni modo thinking; es un clasificador de imagen puro.

## Casos de uso

- Auditoría de diseño editorial: dado un recorte de una línea de un cartel o maqueta, el modelo devuelve la fuente candidata con su probabilidad, lo que permite verificar si se ha respetado la tipografía del manual de marca sin revisar manualmente catálogos de cientos de fuentes.
- Identificación de fuentes en capturas de pantalla o imágenes de redes sociales: al aceptar una línea recortada y ser robusto a compresión y baja resolución, resulta adecuado para imágenes descargadas de webs o aplicaciones de mensajería.
- Catalogación de documentos escaneados: en pipelines de digitalización de material coreano, el modelo puede etiquetar la tipografía de titulares o pies de foto para enriquecer metadatos, ejecutándose en CPU si no hay GPU disponible.
- Herramientas de diseño asistido: integrado en un plugin o servicio que, tras una selección del usuario, sugiere la fuente utilizada y enlaza a su ficha y licencia, agilizando la recreación de diseños.
- Verificación de licencias tipográficas: al devolver el nombre de la fuente y sus alias, un equipo legal o de cumplimiento puede comprobar si la fuente identificada es gratuita y bajo qué condiciones se distribuye.
- Detección de suplantación o análisis forense de imágenes: comparar la fuente declarada de un documento con la identificada por el modelo puede revelar manipulaciones o inconsistencias tipográficas.
- Investigación en tipografía coreana: el modelo facilita estudios cuantitativos sobre el uso de fuentes en corpus de imágenes, al automatizar una tarea que de otro modo requeriría anotación humana.

## Benchmarks y rendimiento

| Conjunto de prueba | Líneas | Top-1 | Top-3 | Top-5 |
|---|---:|---:|---:|---:|
| Hard (efectos mixtos) | 2.702 | 93,3% | 97,9% | 98,7% |
| Clean | 1.351 | 97,4% | ≥ 99,2% | ≥ 99,8% |

El autor indica además que las predicciones con probabilidad ≥ 0,95 cubren el 84% del conjunto Hard con una precisión del 99,6%. Todas las cifras se midieron sobre imágenes sintéticas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 93,97 millones de parámetros en precisión completa el peso ronda los 0,38 GB, por lo que la huella es pequeña y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA; el autor entrenó en una RTX 5080, lo que sugiere que la inferencia es viable en tarjetas de gama media y alta (RTX 3060 en adelante, A100, H100).
- Cabe en GPU consumer: sí, dado el tamaño del modelo y del repositorio (0,4 GB).
- Opciones de despliegue: el autor proporciona un script `inference.py` con la clase `FontIdentifier` que se carga vía `snapshot_download` de Hugging Face; requiere torch, transformers, safetensors, pillow, numpy y huggingface_hub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput: no disponibles. El entrenamiento completo requirió unos 85 minutos en una RTX 5080, lo que da una idea del bajo coste computacional del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de identificación de fuentes coreanas en la documentación proporcionada. Como referencia arquitectónica, el modelo base SigLIP 2 Base (google/siglip2-base-patch16-224) es un codificador visión-lenguaje de propósito general, no un clasificador de fuentes, por lo que la comparación directa no es posible con los datos disponibles.

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| prenny/hangul-font-finder | 93,97 M | Clasificación de 1.279 fuentes coreanas | MIT | Hugging Face |
| google/siglip2-base-patch16-224 | no disponible en la información | Codificador visión-lenguaje general | Apache-2.0 | Hugging Face |
| Alternativas de identificación de fuentes | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las fuentes fuera de las 1.279 conocidas se responden con la fuente conocida más similar, normalmente con probabilidad baja; conviene aplicar un umbral de confianza para descartar resultados.
- Todas las métricas reportadas se midieron sobre imágenes sintéticas; el rendimiento en imágenes reales puede diferir.
- El modelo está diseñado para hangul; no se evaluaron líneas con solo letras latinas o dígitos.
- La entrada debe ser una línea de texto ya recortada: no incluye detección de texto, por lo que hay que preprocesar la imagen.
- El modelo solo devuelve nombres de fuentes; la verificación de la licencia de cada fuente es responsabilidad del usuario.
- Riesgo de sesgo derivado del conjunto sintético de entrenamiento: la distribución de fuentes y estilos puede no representar todos los contextos reales.
- No se documentan evaluaciones de sesgo, robustez adversarial ni comportamiento en dominios fuera de distribución distintos de los efectos visuales declarados.
- La licencia MIT permite uso comercial, pero los pesos derivan de SigLIP 2 (Apache-2.0); deben conservarse los avisos de LICENSE-SIGLIP2-APACHE-2.0 y NOTICE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prenny/hangul-font-finder
- Repositorio GitHub: https://github.com/habaekk/hangul-font-finder
- Modelo base SigLIP 2: https://huggingface.co/google/siglip2-base-patch16-224
- Lista de fuentes: FONTS_LIST.md (incluida en el repositorio del modelo)
