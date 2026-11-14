# Kmlap0947/WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING

## Resumen

WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING es un checkpoint de difusión publicado en Hugging Face por el usuario Kmlap0947. Por el identificador y la etiqueta de pipeline (`diffusers:WanImageToVideoPipeline`), se trata de una fusión de pesos (merge) orientada a generación de vídeo a partir de imagen (image-to-video, I2V) sobre la base de Wan 2.2, con una variante etiquetada como "Lightning" que, por convención en el ecosistema, suele asociarse a destilación para reducir pasos de muestreo. El repositorio contiene pesos en formato safetensors con 14.288.901.184 parámetros y un tamaño total de 68,8 GB.

El modelo no dispone de model card sustantiva: la tarjeta es la plantilla automática de diffusers sin rellenar, sin sección de uso, entrenamiento, evaluación ni licencia. Tampoco consta pipeline declarado, idiomas soportados ni resultados de benchmarks. Toda la información técnica disponible se limita a los metadatos del Hub y al recuento de parámetros del archivo safetensors.

Su relevancia es, por tanto, acotada y experimental: resulta de interés para quienes investigan fusiones de modelos de vídeo y variantes aceleradas de Wan 2.2, pero no constituye una base recomendable para producción sin una evaluación propia previa, dada la ausencia de documentación, licencia declarada y validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el pipeline declarado, difusión para image-to-video; presumiblemente basada en Wan 2.2, sin confirmar) |
| Parametros totales | 14.288.901.184 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el condicionamiento es por imagen y texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan variantes GGUF, FP8 ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 68,8 GB |
| Libreria | diffusers |
| Pipeline declarado | WanImageToVideoPipeline |
| Fecha de creacion / actualizacion | 2026-11-14 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de la etiqueta de pipeline `WanImageToVideoPipeline`, que indica un modelo de difusión para generar vídeo condicionado por una imagen de entrada (y, presumiblemente, por texto). El nombre del repositorio sugiere una fusión de pesos ("Merge") entre un modelo base Wan 2.2 I2V y componentes orientados a efectos visuales ("VisualEffects"), junto con una variante "Lightning" que en la práctica habitual del ecosistema corresponde a destilación para pocos pasos. Ninguno de estos extremos está confirmado por el autor.

No hay datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO (no aplicable de forma estándar a modelos de difusión), hiperparámetros, infraestructura de cómputo ni proceso de fusión (tipo de merge, pesos por capa, calibración). La model card es la plantilla automática de diffusers y no aporta ninguna de estas secciones.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) mediante el pipeline `WanImageToVideoPipeline` de diffusers, según la etiqueta del repositorio.
- Presunta capacidad de condicionamiento textual adicional, no confirmada por el autor.
- Presunta generación en pocos pasos de muestreo por la etiqueta "Lightning", no confirmada ni cuantificada.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No consta soporte multilingüe declarado.
- No consta soporte de audio, visión general ni modos de "thinking".

## Casos de uso

- Prototipado de animación de imágenes fijas: usar el pipeline I2V para convertir ilustraciones o fotogramas en clips cortos y evaluar la calidad de la fusión antes de adoptarla.
- Investigación sobre fusiones de modelos de difusión: comparar este merge con el Wan 2.2 I2V original para medir el efecto de la mezcla de pesos en coherencia temporal y fidelidad al fotograma de entrada.
- Experimentación con muestreo acelerado: si la variante "Lightning" se confirma, probar configuraciones de pocos pasos para reducir coste de inferencia en entornos de investigación.
- Generación de efectos visuales en preproducción: producir borradores de planos con movimiento para storyboards, siempre con revisión humana y sin uso comercial hasta aclarar la licencia.
- Evaluación comparativa interna: incluir el checkpoint en un banco de pruebas propio de modelos I2V para documentar diferencias de calidad y estabilidad.
- Docencia y divulgación: ilustrar en talleres cómo se publica y consume un merge de difusión en diffusers, dado el bajo número de descargas y la ausencia de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 14.288.901.184 parámetros en bf16/fp16 requieren aproximadamente 28,6 GB solo para los pesos, a lo que hay que sumar activaciones y cachés del pipeline de vídeo; en fp32 serían unos 57 GB.
- GPU recomendadas: no disponibles. Por el tamaño de pesos, un despliegue en precisión nativa exige GPU de 40 GB o más (A100 40/80 GB, H100, L40S). No hay confirmación del autor.
- ¿Cabe en GPU de consumo? No en precisión nativa en tarjetas de 24 GB (RTX 4090, 3090). Requeriría cuantización o descarga por capas, no documentadas.
- Opciones de despliegue: diffusers (librería declarada). No consta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING | 14.288.901.184 | image-to-video (pipeline WanImageToVideoPipeline) | no disponible | Hugging Face, 0 descargas |
| Wan 2.2 I2V (modelo base de referencia) | no disponible en esta ficha | image-to-video | no disponible en esta ficha | no disponible en esta ficha |
| Otras variantes "Lightning" de Wan 2.2 | no disponible en esta ficha | image-to-video con pocos pasos | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos verificados de los modelos comparables en la información proporcionada; la comparación cuantitativa de rendimiento, contexto y licencia no está disponible.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay documentación de uso previsto, datos de entrenamiento ni evaluación.
- Licencia no declarada: no se puede asumir uso comercial; la redistribución y el despliegue en producción quedan en un limbo legal hasta que el autor la especifique.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Al ser un merge no documentado, pueden existir artefactos, inconsistencias entre componentes y degradación respecto al modelo base; no hay métricas que lo cuantifiquen.
- Riesgo de sesgos y de alucinación visual (artefactos, movimiento incoherente, deriva temporal) inherente a los modelos de difusión de vídeo, agravado por la falta de evaluación publicada.
- El pipeline declarado (`WanImageToVideoPipeline`) puede no ser el correcto para cargar los pesos; no hay código de ejemplo en la tarjeta.
- El tamaño del repositorio (68,8 GB) implica costes de descarga y almacenamiento considerables para un checkpoint sin garantías.
- No hay información sobre idiomas, por lo que no se puede garantizar el comportamiento con prompts en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/Kmlap0947/WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING
- Referencia citada en la model card (calculadora de impacto de carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Paper, blog, repositorio y demo del autor: no disponibles.
