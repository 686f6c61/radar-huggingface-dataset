# deamicis/WAMU_v3_WAN2.2_I2V_LIGHTNING

## Resumen

WAMU_v3_WAN2.2_I2V_LIGHTNING es un checkpoint de difusión para generación de vídeo a partir de imagen (image-to-video, I2V) publicado en HuggingFace por el usuario `deamicis`. El identificador y los resultados de búsqueda lo vinculan a la familia Wan 2.2 de Alibaba, en su variante I2V de escala 14B, y el sufijo "Lightning" indica una variante destilada para inferencia en pocos pasos. El repositorio contiene 14.288.901.184 parámetros en formato safetensors (68,9 GB) y se carga mediante la clase `WanImageToVideoPipeline` de la librería diffusers.

El interés técnico del modelo es doble: por un lado, aplica el paradigma de destilación de pasos (few-step) a un modelo de vídeo de 14B, lo que reduce drásticamente el coste de muestreo frente a los 40-50 pasos habituales de los modelos de difusión de vídeo; por otro, se distribuye en el ecosistema diffusers, lo que permite integrarlo en pipelines existentes sin reimplementar el sampler. La relevancia práctica depende, sin embargo, de una validación que aún no existe: el repositorio acumula 0 descargas y 0 likes, y la model card es la plantilla autogenerada de diffusers, sin ninguna sección completada.

Conviene subrayar que la model card no documenta autoría real, datos de entrenamiento, licencia ni idiomas, y que el único paper referenciado en los tags (`arxiv:1910.09700`) es el trabajo de Lacoste et al. sobre el calculador de impacto ambiental que aparece en la plantilla por defecto, no un artículo sobre el modelo. Cualquier evaluación de este checkpoint debe hacerse, por tanto, mediante prueba directa y no a partir de la documentación del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. El identificador y el pipeline (`WanImageToVideoPipeline`) lo sitúan en la familia Wan 2.2 de generación de vídeo imagen-a-vídeo, basada en transformer de difusión con VAE espaciotemporal (detalle de la arquitectura interna no documentado para este checkpoint) |
| Parametros totales | 14.288.901.184 (recuento real de los tensores safetensors) |
| Parametros activos | No disponible; no se confirma que sea una variante MoE. El recuento de 14,29B no coincide con el total de ~27B de las variantes MoE A14B de la familia, por lo que apunta a un backbone denso de escala 14B, pero el dato no está declarado |
| Longitud de contexto | No aplica en el sentido de ventana de tokens. El equivalente funcional es el número de fotogramas, la resolución y la resolución temporal del VAE; ninguno de estos valores está documentado en el repositorio |
| Tipos de cuantizacion | El repositorio solo publica safetensors sin cuantizar. Existe una cuantización INT8 de terceros (`WAMU_v3_INT8`) en el repositorio de GitHub `aruniankur/wan2.2model`, generada con el script `quantize_int8.py` |
| Idiomas soportados | No disponible. El pipeline procesa prompts de texto mediante un encoder de texto cuyo modelo y cobertura lingüística no se declaran |
| Licencia | No disponible en los metadatos del repositorio. Una fuente de terceros (`selfhost.directory`) indica que Wan2.2-Lightning de lightx2v permite uso comercial, pero ese dato no es trasladable automáticamente a este fine-tune sin confirmación del autor |
| Formato de pesos | safetensors con layout diffusers (compatible con `WanImageToVideoPipeline`). Tamaño del repositorio: 68,9 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna ni el proceso de entrenamiento de este checkpoint. Lo que puede afirmarse con los datos aportados es que se carga con `WanImageToVideoPipeline` de diffusers, lo que implica un pipeline de difusión condicionado por imagen (y opcionalmente por texto) con un VAE que comprime el vídeo en el espacio latente y un transformer que opera sobre esas representaciones. El tamaño del repositorio (68,9 GB) frente al recuento de parámetros (14,29B) arroja aproximadamente 4,8 bytes por parámetro, lo que sugiere pesos en fp32 o una mezcla de precisión con componentes adicionales (VAE, encoder de texto) incluidos en el mismo repositorio; el dato exacto de precisión no está declarado.

El sufijo "Lightning" es la única pista sobre el método de entrenamiento: en el ecosistema Wan 2.2 designa variantes destiladas para inferencia en muy pocos pasos (habitualmente 4-8), obtenidas mediante destilación de trayectoria o de score desde el modelo base. El repositorio de terceros `aruniankur/wan2.2model` describe explícitamente un "Wan 2.2 Image-to-Video 14B Lightning" y menciona la ausencia de interpolación RIFE y de compilación AOTI en su implementación, lo que es coherente con un modelo pensado para generar fotogramas directamente en pocos pasos. No hay información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicó RLHF/DPO (poco habitual en modelos de difusión de vídeo).

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), presumiblemente con condicionamiento textual adicional a través de un prompt, dado el pipeline empleado.
- Muestreo en pocos pasos: el sufijo "Lightning" indica una variante destilada para reducir el número de pasos de denoising respecto a un modelo de difusión estándar; el número exacto de pasos recomendado no está documentado.
- Integración nativa con diffusers: puede instanciarse mediante `from diffusers import WanImageToVideoPipeline` y combinarse con `accelerate` para descarga y ejecución eficiente.
- Compatibilidad con interfaces de usuario locales: existe una implementación Gradio de terceros para el modelo Wan 2.2 I2V 14B Lightning pre-cuantizado a INT8, ejecutable en una GPU L40 de 48 GB.
- Compatibilidad con ComfyUI y Diffusers según la fuente de terceros sobre Wan2.2-Lightning (no verificada específicamente para este checkpoint).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada más allá de la imagen de condicionamiento, audio ni modo "thinking": son capacidades propias de modelos de lenguaje y no aplican a este tipo de modelo.

## Casos de uso

- Animación de imágenes de producto en pipelines de e-commerce: a partir de una fotografía fija de catálogo, el modelo genera un clip corto con movimiento de cámara o del objeto. La variante Lightning reduce el coste por clip al disminuir los pasos de muestreo, lo que hace viable procesar lotes grandes de referencias.
- Storyboarding y animática publicitaria: convertir frames de un guion gráfico en animáticas con movimiento para validar ritmo y encuadre antes de rodar. El pipeline imagen-a-vídeo permite mantener la composición exacta del storyboard como condición.
- Previsualización en estudios de VFX y motion graphics: generar plates animados de baja resolución para previsualizar integración de elementos, usando la imagen de referencia como bloqueo de cámara.
- Generación de datos sintéticos para entrenar otros modelos de vídeo: producir clips cortos condicionados por imágenes semilla para ampliar datasets de investigación, siempre que la licencia del checkpoint lo permita (actualmente no declarada, lo que es un bloqueo para uso comercial).
- Herramientas creativas locales en ComfyUI o Gradio: desplegar el modelo cuantizado a INT8 en una estación de trabajo con GPU de 48 GB para artistas que necesiten iterar sin depender de servicios en la nube, tal como propone el repositorio `aruniankur/wan2.2model`.
- Prototipado rápido de funciones de producto: validar la viabilidad de una funcionalidad de "foto a vídeo" en una aplicación antes de comprometerse con un proveedor de inferencia, usando el modelo como referencia de calidad y coste.
- Investigación en destilación de modelos de difusión: servir de punto de comparación frente al modelo base Wan 2.2 I2V para medir la degradación de calidad a igual número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas objetivas de calidad de vídeo (VBench, FVD, CLIP score, SSIM temporal) ni comparaciones con el modelo base del que supuestamente se destila. Tampoco se documentan tiempos de inferencia, número de pasos, resolución de salida ni duración de los clips, que son los parámetros que permitirían reproducir cualquier medida. Cualquier cifra de rendimiento que se publique sobre este checkpoint deberá generarse localmente con una configuración documentada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 28,6 GB solo para los pesos del transformer (14,29B × 2 bytes), más el VAE y las activaciones; en la práctica, un entorno de 40-48 GB es el mínimo razonable para resolución completa.
- VRAM estimada en INT8: aproximadamente 14,3 GB para los pesos, tal como corresponde a la cuantización de terceros `WAMU_v3_INT8`; el repositorio de referencia la ejecuta en una NVIDIA L40 de 48 GB.
- El repositorio ocupa 68,9 GB, lo que sugiere que los pesos se distribuyen en fp32 (unos 57 GB para el transformer) o con componentes adicionales; en ese caso la inferencia sin cuantizar exigiría una GPU de 80 GB (A100 80GB, H100 80GB).
- GPU recomendadas: A100 80GB o H100 para fp32/bf16 sin compromisos; L40S/L40 48GB para bf16 ajustado o INT8; RTX 4090 (24 GB) solo con cuantización INT8/FP8 y probablemente a resoluciones o duraciones reducidas, sin confirmación documentada.
- Cabe en GPU de consumo: no confirmado. El límite práctico está en los 24 GB de una RTX 4090, suficiente en teoría para INT8 pero con poco margen para activaciones de vídeo de alta resolución.
- Opciones de despliegue: diffusers (`WanImageToVideoPipeline`) con `accelerate`; ComfyUI; interfaz Gradio local del repositorio `aruniankur/wan2.2model`. vLLM, TGI, llama.cpp y Ollama no son aplicables: están orientados a modelos de lenguaje, no a difusión de vídeo.
- Latencia y throughput: no disponibles. La ventaja esperada de la variante Lightning es una reducción del número de pasos de denoising, pero no se publica ni el número de pasos ni los tiempos por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| WAMU_v3_WAN2.2_I2V_LIGHTNING (este) | 14,29B (safetensors) | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes |
| Wan2.2-I2V-A14B (familia Wan 2.2, variante I2V de referencia) | 14B activos (A14B); total no disponible en las fuentes consultadas | No disponible en las fuentes consultadas | No disponible en las fuentes consultadas | Repositorio oficial Wan-Video/Wan2.2 |
| Wan2.2-TI2V-5B (familia Wan 2.2, variante densa texto+imagen a vídeo) | 5B | 720p a 24 fps; VAE con ratio de compresión 16×16×4; ejecutable en RTX 4090 | No disponible en las fuentes consultadas | Repositorio oficial Wan-Video/Wan2.2 |
| Wan2.2-Lightning (lightx2v) | No disponible | No disponible | Uso comercial permitido según `selfhost.directory` | Diffusers y ComfyUI, según la misma fuente |

La comparación relevante es frente al modelo base del que se destila: este checkpoint sacrifica, en principio, calidad por velocidad, pero no hay ninguna medida publicada que cuantifique ese intercambio. Frente a Wan2.2-TI2V-5B, la variante de 5B tiene la ventaja de estar documentada y de caber en una RTX 4090, mientras que este checkpoint de 14,29B exige hardware de gama alta y carece de toda documentación.

## Limitaciones y advertencias

- Model card vacía: todas las secciones conservan los marcadores `[More Information Needed]` de la plantilla de diffusers. No hay información sobre entrenamiento, datos, hiperparámetros ni evaluación.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, modificación ni redistribución. Esto bloquea su uso en producción hasta que el autor lo aclare.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento del análisis, y varios repositorios espejo con el mismo nombre en cuentas distintas (`d335566`, `djessica`), lo que sugiere re-subidas automatizadas más que una publicación mantenida.
- Sin datos de sesgo: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de representación demogrática, cultural o geográfica en los vídeos generados.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos temporales, deformaciones anatómicas o movimientos físicamente inconsistentes; no hay métricas publicadas que acoten esta tasa.
- Riesgo de uso malintencionado: la generación imagen-a-vídeo es una tecnología directamente aplicable a la creación de deepfakes. No se documenta ningún mecanismo de filtrado, marca de agua o restricción de uso.
- Límites de contexto y resolución desconocidos: se desconoce la resolución nativa, la duración máxima y el número de fotogramas soportados, lo que impide planificar su integración en un pipeline.
- Fecha de creación anómala en los metadatos (2026-10-22), lo que dificulta trazar la procedencia y el linaje del checkpoint.
- Dependencia de una única clase de pipeline (`WanImageToVideoPipeline`) y de la versión de diffusers correspondiente; no se documenta compatibilidad con versiones anteriores ni con otros formatos.
- Ausencia de cuantizaciones oficiales: las opciones INT8/FP8 provienen de scripts de terceros no auditados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/deamicis/WAMU_v3_WAN2.2_I2V_LIGHTNING
- Espejo en HuggingFace (d335566): https://huggingface.co/d335566/WAMU_v3_WAN2.2_I2V_LIGHTNING/tree/main
- Espejo en HuggingFace (djessica): https://huggingface.co/djessica/WAMU_v3_WAN2.2_I2V_LIGHTNING
- Repositorio GitHub con interfaz Gradio local y cuantización INT8 (`WAMU_v3_INT8`): https://github.com/aruniankur/wan2.2model
- Repositorio oficial de la familia Wan 2.2: https://github.com/Wan-Video/Wan2.2
- Ficha de Wan2.2-Lightning (lightx2v) en selfhost.directory: https://selfhost.directory/models/lightx2v/wan2.2-lightning
- Paper referenciado en los tags (calculador de impacto ambiental, no específico del modelo): https://arxiv.org/abs/1910.09700
