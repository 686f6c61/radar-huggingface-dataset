# krea/Krea-2-Raw

## Resumen

Krea-2-Raw es un modelo de generación de imágenes de código abierto desarrollado por Krea AI, la empresa detrás de la plataforma creativa homónima. Forma parte de la familia Krea 2, que incluye dos variantes: RAW, orientada a fine-tuning y personalización, y Turbo, optimizada para inferencia rápida. Este modelo se ha entrenado desde cero con un enfoque en la exploración creativa y estilística, ofreciendo un control fino sobre la estética de las imágenes generadas.

Con 12.820 millones de parámetros y un tamaño de repositorio de 62,1 GB, Krea-2-Raw se distribuye en formato safetensors y se integra con la librería diffusers mediante un pipeline específico (Krea2Pipeline). El acceso al modelo está restringido (gated) y requiere aceptar los términos de la licencia comunitaria de Krea. Su relevancia actual radica en ser una alternativa open source a modelos propietarios de generación de imágenes, con capacidades de fine-tuning que permiten adaptarlo a estilos o dominios concretos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12.820.073.036 (12,82 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo en la información disponible. Por el pipeline text-to-image y el uso de diffusers, se infiere que se trata de un modelo de difusión, pero no se confirma oficialmente. El entrenamiento se realizó desde cero, según el repositorio oficial, con un enfoque específico en la diversidad estética y el control de estilo. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Fine-tuning: la variante RAW está diseñada para ser ajustada con datos propios, permitiendo personalizar estilos, objetos o dominios visuales.
- Control estilístico: el modelo está orientado a la exploración creativa, ofreciendo resultados con diversidad estética y capacidad de seguir indicaciones de estilo.
- Integración con diffusers: se puede usar mediante el pipeline Krea2Pipeline, lo que facilita su incorporación en flujos de trabajo existentes.
- No se han documentado capacidades de tool calling, agentes, visión multimodal ni otras funcionalidades más allá de la generación de imágenes.

## Casos de uso

- Creación de arte conceptual: diseñadores e ilustradores pueden generar bocetos y conceptos visuales a partir de prompts, explorando variaciones estilísticas rápidamente.
- Fine-tuning para marcas: empresas pueden ajustar el modelo con su identidad visual (logotipos, paleta de colores, productos) para generar imágenes coherentes con su marca en campañas de marketing.
- Generación de moodboards: equipos creativos pueden producir tableros de inspiración visual para proyectos de diseño, moda o interiorismo, combinando estilos y referencias.
- Prototipado de productos: en fases iniciales de diseño de producto, se pueden generar imágenes de conceptos sin necesidad de renders 3D costosos.
- Ilustración editorial: creadores de contenido pueden generar imágenes para artículos, portadas o publicaciones en redes sociales con un estilo controlado.
- Investigación en generación de imágenes: al ser open source y permitir fine-tuning, es útil para experimentar con técnicas de personalización y control estilístico en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FID, CLIP score u otras comparativas con modelos similares.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para Krea-2-Raw.
- Dado el tamaño de parámetros (12,82 B) y el peso del repositorio (62,1 GB), se estima que la inferencia requiere al menos 24-32 GB de VRAM en FP16, dependiendo de la resolución de salida.
- GPUs recomendadas orientativas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o superiores.
- No se espera que quepa en GPUs de consumo de gama baja (8-12 GB) sin cuantización, pero no se han publicado versiones cuantizadas.
- Opciones de despliegue: al ser compatible con diffusers, se puede servir con soluciones como Hugging Face Inference Endpoints, o mediante scripts personalizados con PyTorch. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que son herramientas orientadas a modelos de lenguaje.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de generación de imágenes open source (por ejemplo, Stable Diffusion XL, SD 3, Flux). No hay datos de rendimiento ni especificaciones detalladas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face, por lo que es necesario aceptar las condiciones de la licencia antes de descargarlo.
- Licencia comunitaria: la krea-2-community-license puede imponer restricciones de uso comercial; se recomienda revisar los términos completos antes de utilizarlo en producción.
- Idioma: solo se indica soporte para inglés, lo que puede limitar la comprensión de prompts en otros idiomas.
- Sin información sobre sesgos: no se han publicado análisis de sesgos o alucinaciones visuales, por lo que se desconoce el comportamiento en dominios sensibles.
- Falta de documentación técnica: la arquitectura y los detalles de entrenamiento no están disponibles, lo que dificulta la reproducibilidad y el ajuste fino avanzado.
- Requisitos de hardware elevados: el tamaño del modelo puede ser prohibitivo para entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/krea/Krea-2-Raw
- Página oficial de Krea 2 Open-Source: https://www.krea.ai/krea-2-open-source
- Repositorio GitHub (código de inferencia): https://github.com/krea-ai/krea-2
- Blog técnico (referenciado en GitHub, sin URL directa en la información disponible)
- Página de producto Krea 2: https://www.krea.ai/krea-2
