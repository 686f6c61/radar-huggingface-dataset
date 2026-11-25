# Davidyich/otp3d-style-loras

## Resumen

OTP 3D Style LoRAs es una colección de adaptadores LoRA para modelos de generación de imágenes texto-a-imagen, publicada por el usuario Davidyich. No se trata de un modelo fundacional, sino de un catálogo de 170 checkpoints LoRA entrenados con Ostris AI Toolkit que imponen un estilo visual concreto (denominado OTP 3D) sobre seis modelos base distintos: Z-Image, Z-Image-Turbo, FLUX.2-dev, FLUX.2-klein-base-9B, FLUX.3-image-klein-base e Ideogram 4. Cada carpeta del repositorio corresponde a una ejecución de entrenamiento independiente sobre un modelo base concreto, con su propio trigger word y rango de LoRA.

La relevancia de este repositorio es práctica más que arquitectónica: ofrece adaptadores listos para usar con múltiples bases de generación de imagen de última generación, con metadatos de procedencia (pasos de entrenamiento, rangos, learning rate, tamaño de dataset) y checksums SHA-256 para verificar integridad. El repositorio ocupa 37,9 GB e incluye además un archivo recuperado de Civitai con 76 checkpoints adicionales, sumando 246 ficheros en total.

Al ser adaptadores LoRA, el modelo no tiene parámetros propios independientes ni una longitud de contexto en el sentido de los modelos de lenguaje: hereda las capacidades y limitaciones del modelo base sobre el que se aplica. La información disponible sobre licencia es inexistente en la model card, lo que constituye una limitación importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos base de difusión texto-a-imagen |
| Parametros totales | No disponible (depende del modelo base; los LoRA son adaptadores de rango 16 o 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica a modelos de imagen) |
| Tipos de cuantizacion | No disponible (ficheros `.safetensors`; la cuantización depende del loader del modelo base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Modelos base | Tongyi-MAI/Z-Image, Tongyi-MAI/Z-Image-Turbo, black-forest-labs/FLUX.2-dev, black-forest-labs/FLUX.2-klein-base-9B, black-forest-labs/flux-3-image-klein-base, ideogram-ai/ideogram-4-fp8 |
| Rango de LoRA | 16 o 32 segun la ejecucion |
| Numero de checkpoints | 170 (Ostris) + 76 (Civitai recuperados) = 246 |
| Tamano del repositorio | 37,9 GB |
| Pipeline | Text-to-image |

## Arquitectura y entrenamiento

Cada checkpoint es un adaptador LoRA entrenado con Ostris AI Toolkit (versiones 0.13.25 para FLUX.2 y Z-Image, 0.13.34 para Ideogram 4 y 0.13.43 para FLUX.3). Los adaptadores se aplican sobre el modelo base correspondiente y se activan mediante un trigger word específico por ejecución (`otpbase`, `otpbasel`, `otpbasem`, `otpbaselm`, `otpbases`). El rango de LoRA es 32 en la mayoría de ejecuciones sobre FLUX.3, Ideogram y Z-Image-Turbo, y 16 en las ejecuciones sobre FLUX.2 Klein 9B, FLUX.2 Dev y Z-Image Base.

Los detalles de entrenamiento varían por ejecución. Las dos ejecuciones sobre FLUX.3 Klein usaron el mismo dataset de 108 imágenes a 1024 px, con rank/alpha 32/32, AdamW y learning rate inicial de 0,0001 sobre una GPU A40; una de ellas (4000 pasos) incluye etiquetas de detalle (`minimal detail`, `moderate detail`, `rich detail`) en los captions y la otra (5000 pasos) usa captions planos. Las ejecuciones sobre Ideogram 4 L/M/S emplearon datasets con captions JSON de 36, 40 y 32 imágenes respectivamente, resolución de entrenamiento de 512 px, 3000 pasos, rank/alpha 32/32, learning rate 0,0001 y Differential Guidance scale 3. La ejecución combinada Ideogram L+M usa 76 pares imagen-caption, 6000 pasos, AdamW8Bit y batch/accumulation 1/1.

El repositorio incluye un `manifest.json` con tamaños de fichero, checksums SHA-256, pasos de entrenamiento, épocas, tipos de tensor, rangos y mapeo de modelos, además de un fichero `SHA256SUMS` en formato estándar. Se conservan los nombres originales de carpetas y checkpoints; los sufijos numéricos indican checkpoints intermedios y el fichero sin sufijo es la exportación final de cada ejecución.

## Capacidades

- Generación de imágenes texto-a-imagen con un estilo visual 3D concreto (OTP 3D) impuesto mediante LoRA.
- Aplicable sobre seis modelos base distintos, lo que permite elegir entre distintas familias de generadores (Z-Image, FLUX.2, FLUX.3, Ideogram 4).
- Tres niveles de complejidad de composición etiquetados como S, M y L (no son resoluciones, sino complejidad compositiva).
- Control de nivel de detalle en la ejecución FLUX.3 Klein de 4000 pasos mediante etiquetas en el caption (`minimal detail`, `moderate detail`, `rich detail`).
- Compatibilidad con captions JSON estructurados en las ejecuciones sobre Ideogram 4.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de generación de imagen.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Producción de ilustraciones con estética 3D coherente: aplicar el LoRA sobre Z-Image-Turbo o FLUX.3 Klein para generar un conjunto de imágenes con estilo unificado, útil en proyectos de arte conceptual o assets para videojuegos.
- Generación de assets para entornos 3D estilizados: el adaptador impone un look 3D consistente que puede servir como base para texturas, sprites o referencias visuales en pipelines de modelado.
- Iteración rápida de conceptos: usar la variante sobre Z-Image-Turbo (modelo Turbo) para obtener generaciones en menos pasos y explorar variaciones de composición S/M/L antes de fijar una dirección artística.
- Control de complejidad compositiva: seleccionar los checkpoints S, M o L según la densidad visual deseada, por ejemplo S para iconos o retratos simples y L para escenas con múltiples elementos.
- Integración en flujos con ComfyUI o AI Toolkit: cargar el `.safetensors` correspondiente con el loader del modelo base adecuado y el trigger word de la fila, encadenándolo con otros nodos de postprocesado.
- Archivo y reproducibilidad de experimentos: usar el `manifest.json` y los checksums SHA-256 para verificar que los checkpoints desplegados en producción coinciden con los publicados y auditar la procedencia del entrenamiento.
- Comparación de bases: mantener el mismo estilo OTP 3D sobre FLUX.2, FLUX.3, Z-Image e Ideogram 4 permite evaluar qué base responde mejor a un estilo concreto en términos de fidelidad y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, preferencia humana) ni comparaciones de calidad entre ejecuciones; de hecho, indica explícitamente que la calidad del modelo de la ejecución combinada Ideogram L+M no se ha clasificado frente a las ejecuciones L y M separadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende enteramente del modelo base (FLUX.2-dev, FLUX.3 Klein, Z-Image, Ideogram 4) y de la cuantización elegida para ese base. Los LoRA en sí añaden una sobrecarga mínima.
- GPU recomendadas: las ejecuciones de entrenamiento documentadas usaron NVIDIA A40 y RTX 5090, lo que da una referencia del orden de magnitud de memoria necesaria para entrenar; para inferencia se requiere al menos la VRAM que exija el modelo base.
- Cabe en GPU de consumo: no disponible como dato directo; depende del modelo base. Las variantes sobre Z-Image-Turbo y FLUX.2 Klein 9B son las candidatas más plausibles para GPUs de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: Ostris AI Toolkit (entrenamiento y exportación), ComfyUI y cualquier loader compatible con LoRA para el modelo base correspondiente. Para Ideogram 4 se requiere un loader compatible específico; el adaptador de entrenamiento incondicional de Ideogram no es un checkpoint de estilo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OTP 3D Style LoRAs (este) | Colección de LoRA de estilo | No disponible (adaptadores rango 16/32) | No aplica | No disponible | Hugging Face, 0 descargas, 1 like |
| LoRA individual de estilo en Civitai | LoRA de estilo | Variable | No aplica | Variable según autor | Civitai |
| Adaptadores oficiales del modelo base (p. ej. FLUX.2, Z-Image) | LoRA/adapter oficial | Variable | No aplica | La del modelo base | Hugging Face |

No se dispone de información suficiente para comparar rendimiento, calidad o licencia con alternativas concretas; la comparativa se limita a la categoría y disponibilidad.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un riesgo legal relevante antes de desplegar en producción.
- Solo inglés: los captions y triggers están en inglés; el soporte multilingüe no está documentado.
- Dependencia estricta del modelo base: cada checkpoint requiere el base correcto y el trigger word correcto; usar un trigger equivocado o un loader incompatible degrada o anula el efecto del estilo.
- Riesgo de alucinación visual: como todo generador texto-a-imagen, puede producir anatomía, texto o geometría incoherentes, especialmente en composiciones de complejidad L.
- Sesgos: no documentados en la model card; al derivarse de datasets pequeños (32-108 imágenes por ejecución), es probable que el estilo esté sobreajustado a la distribución de esas imágenes y generalice mal fuera de ella.
- Datasets de entrenamiento muy pequeños: 108 imágenes en FLUX.3 Klein, 32-40 en Ideogram, lo que limita la diversidad y aumenta el riesgo de sobreajuste.
- Duplicados en el repositorio: existen ficheros con bytes idénticos conservados por preservar el archivo original, lo que infla el tamaño del repo.
- Calidad no evaluada entre ejecuciones: la model card no clasifica la calidad de la ejecución combinada Ideogram L+M frente a las separadas.
- Exclusiones: no se publican estados del optimizador, imágenes de muestra, archivos de muestras ni datos de entrenamiento locales, lo que dificulta la reproducción completa.
- Trazabilidad parcial: los checksums y el manifest permiten verificar integridad, pero no garantizan la calidad ni la idoneidad para un caso de uso concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Davidyich/otp3d-style-loras
- Ostris AI Toolkit (herramienta de entrenamiento): https://github.com/ostris/ai-toolkit
- Archivo Civitai y procedencia: https://huggingface.co/Davidyich/otp3d-style-loras/blob/main/civitai/README.md
- Manifest Civitai: https://huggingface.co/Davidyich/otp3d-style-loras/blob/main/civitai/manifest.json
- Checksums Civitai: https://huggingface.co/Davidyich/otp3d-style-loras/blob/main/civitai/SHA256SUMS
- Modelo base Tongyi-MAI/Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Tongyi-MAI/Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Modelo base black-forest-labs/FLUX.2-dev: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Modelo base black-forest-labs/FLUX.2-klein-base-9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B
- Modelo base black-forest-labs/flux-3-image-klein-base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Modelo base ideogram-ai/ideogram-4-fp8: https://huggingface.co/ideogram-ai/ideogram-4-fp8
