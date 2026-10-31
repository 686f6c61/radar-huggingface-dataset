# axteam/Z-Image-FP8

## Resumen

Z-Image FP8 es una cuantización en punto flotante de 8 bits (`float8_e4m3fn`) del transformer DiT del modelo de generación de imágenes Z-Image, desarrollado originalmente por Tongyi-MAI y cuantizado por el usuario axteam. Se trata de un derivado comunitario cuyo único propósito es reducir a la mitad el tamaño en disco y en memoria del transformer (6,1B de parámetros) respecto a la versión BF16 original, facilitando su ejecución en hardware de consumo.

El repositorio contiene únicamente el transformer cuantizado (unos 6,2 GB en formato safetensors); el VAE y los codificadores de texto deben descargarse del repositorio original de Tongyi-MAI. El uso principal previsto es dentro de ComfyUI, donde el archivo se carga mediante el nodo "Load Diffusion Model" (`UNETLoader`) sin necesidad de ajustar el tipo de peso, ya que el archivo ya está en FP8.

Su relevancia radica en la creciente adopción de cuantización FP8 en el ecosistema de difusión: permite ejecutar modelos DiT de más de 6B de parámetros en GPUs con VRAM limitada manteniendo una calidad de imagen muy cercana a la del modelo completo, con la convención estándar de ComfyUI (`fp8_e4m3fn`, sin escalado, normas y sesgos en BF16).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (ZImageTransformer2DModel), pipeline text-to-image |
| Parámetros totales | 6,1B (transformer DiT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (`float8_e4m3fn`), tensores de peso 2D; normas y sesgos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (el README indica que se aplica la licencia del modelo base) |
| Formato de pesos | safetensors (archivo único de 6,2 GB) |

## Arquitectura y entrenamiento

El modelo base, Z-Image de Tongyi-MAI, es un modelo de difusión text-to-image basado en una arquitectura de transformer de difusión (DiT, `ZImageTransformer2DModel`) con 6,1B de parámetros. Este repositorio no contiene un modelo entrenado, sino una conversión de pesos: únicamente el transformer se ha convertido a `float8_e4m3fn`, manteniendo las normas y sesgos en BF16, lo que reduce el tamaño a aproximadamente la mitad del original.

No se ha publicado información sobre los datos de entrenamiento, el número de tokens o imágenes empleadas, ni sobre técnicas de alineación del modelo base en la información disponible. La cuantización es una conversión directa (cast) sin escalado, siguiendo la convención habitual de ComfyUI para archivos `fp8_e4m3fn`.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) heredada del modelo base Tongyi-MAI/Z-Image
- Compatibilidad total con los flujos de trabajo (workflows) de ComfyUI del modelo original, incluyendo los mismos ajustes de sampler, pasos, CFG/guidance y resolución
- Carga directa mediante el nodo "Load Diffusion Model" (`UNETLoader`) sin configuración adicional de tipo de peso
- Requiere componentes externos no incluidos: VAE y codificadores de texto del repositorio original
- No incluye capacidades de visión, audio ni edición de imágenes documentadas en la información disponible

## Casos de uso

- Generación de imágenes en GPUs de consumo: la cuantización FP8 reduce el requisito de VRAM del transformer a la mitad, permitiendo ejecutar un DiT de 6,1B en tarjetas con 16 GB de VRAM que no podrían alojar la versión BF16 completa
- Flujos de trabajo de ComfyUI existentes: se integra directamente en workflows ya configurados para Z-Image sustituyendo solo el archivo del transformer, sin modificar samplers ni parámetros
- Servicios de generación de imágenes autoalojados: al ser un derivado Apache 2.0, puede desplegarse en producción sin restricciones de licencia, por ejemplo en backends de generación de ilustraciones o assets
- Experimentación con cuantización FP8: útil como referencia para comparar calidad visual entre BF16 y FP8 en el mismo modelo base
- Ahorro de almacenamiento y ancho de banda: 6,2 GB frente a unos 12 GB estimados para el transformer en BF16, relevante en entornos con múltiples modelos instalados
- Pipelines de generación por lotes: la menor huella de memoria permite aumentar el tamaño de lote o la resolución de trabajo en la misma GPU

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una cuantización directa de pesos, la calidad de imagen debería ser cercana a la del modelo base, pero no existen mediciones comparativas (FID, CLIP score, preferencia humana) publicadas en el repositorio.

## Requisitos de hardware

- VRAM estimada para el transformer FP8: aproximadamente 6,2 GB solo para los pesos; el consumo total dependerá del VAE y del codificador de texto cargados (no incluidos en este repositorio). Una estimación razonable para el pipeline completo está en el rango de 10-16 GB, aunque no hay cifras oficiales
- GPU recomendadas: no disponible de forma explícita; por tamaño, tarjetas con 12-16 GB de VRAM (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090) deberían ser adecuadas. ComfyUI soporta offloading parcial a CPU/RAM si la VRAM es insuficiente
- Cabe en GPUs de consumo: sí, es precisamente el objetivo de esta cuantización FP8
- Despliegue: ComfyUI (uso principal y documentado, mediante `UNETLoader`); no hay documentación para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de pipeline de difusión en su forma estándar
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parámetros (DiT) | Cuantización | Tamaño del transformer | Licencia | Uso principal |
|---|---|---|---|---|---|
| axteam/Z-Image-FP8 | 6,1B | FP8 e4m3fn | 6,2 GB | Apache 2.0 (base) | ComfyUI, text-to-image |
| Tongyi-MAI/Z-Image (original) | 6,1B | BF16 | ~12 GB (estimado) | según repositorio original | ComfyUI, text-to-image |
| Otras cuantizaciones FP8 de DiT comunitarias (p. ej. FLUX.1-dev FP8) | 12B | FP8 e4m3fn | ~11-12 GB | licencias específicas de cada modelo | ComfyUI, text-to-image |

La comparativa con FLUX.1-dev FP8 es orientativa: comparte el patrón de distribución (transformer DiT cuantizado a FP8 para ComfyUI, sin VAE ni codificador de texto), aunque difiere en tamaño y licencia. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El repositorio solo contiene el transformer: sin el VAE y los codificadores de texto del modelo original, el modelo no funciona; hay que descargarlos por separado desde Tongyi-MAI/Z-Image
- La cuantización es un cast directo sin escalado, lo que puede producir una ligera degradación de calidad respecto a BF16 en detalles finos; no hay evaluaciones publicadas que cuantifiquen esta pérdida
- Sesgos: hereda los sesgos del modelo base Z-Image y de sus datos de entrenamiento, sobre los que no hay documentación en la información disponible
- Riesgo de alucinación: aplicable a la generación de imágenes (contenido incoherente, texto ilegible dentro de las imágenes, anatomía incorrecta), típico de modelos de difusión, aunque no hay evaluaciones específicas publicadas
- Idiomas de los prompts: no disponible; dependerá del codificador de texto del modelo base
- Licencia: el repositorio se publica bajo Apache 2.0, pero el README indica que se aplica la licencia del modelo base Tongyi-MAI/Z-Image; conviene verificar la licencia del repositorio original antes de uso comercial
- Proyecto comunitario con 0 descargas registradas y sin mantenimiento documentado: no hay garantía de actualizaciones ni de soporte ante cambios en ComfyUI

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/axteam/Z-Image-FP8
- Modelo base original: https://huggingface.co/Tongyi-MAI/Z-Image
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la información disponible.
