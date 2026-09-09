# inclusionAI/LLaDA-UI

## Resumen

LLaDA-UI es un agente GUI multimodal desarrollado por inclusionAI. Combina una arquitectura mixture-of-experts (MoE) con decodificación por difusión block-wise, en lugar del enfoque autoregresivo token a token habitual en modelos de lenguaje. Está diseñado para comprender capturas de pantalla de interfaces de usuario en su resolución nativa y generar coordenadas precisas o acciones estructuradas ejecutables en entornos móviles, de escritorio y web. Su pipeline es image-text-to-text: recibe una imagen de la interfaz y produce razonamiento textual, coordenadas normalizadas a [0, 999] o acciones con estructura definida.

El modelo cuenta con aproximadamente 16.700 millones de parámetros totales (16.924.344.064 según los pesos safetensors). Su backbone de lenguaje es LLaDA2.0-mini-base y su encoder visual es un ViT de resolución nativa inicializado desde SigLIP con rotación posicional 2D (2D RoPE). El checkpoint se distribuye en formato BF16 y ocupa unos 33.9 GB en disco. La relevancia de LLaDA-UI radica en que aporta un paradigma de difusión a la interacción con interfaces gráficas, un área donde los modelos autoregresivos suelen ser lentos y propensos a errores de localización. Aunque no se han publicado anuncios oficiales ni documentación completa de entrenamiento, el lanzamiento en Hugging Face incluye pesos, código de inferencia e instrucciones de despliegue con SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE block-wise diffusion vision-language GUI agent |
| Parametros totales | 16.924.344.064 (aprox. 16.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | BF16 Safetensors |

## Arquitectura y entrenamiento

La arquitectura de LLaDA-UI combina un encoder visual, un backbone de lenguaje basado en LLaDA2.0-mini-base y un mecanismo de decodificación por difusión por bloques. El encoder visual es un ViT de resolución nativa inicializado a partir de SigLIP, con 2D RoPE, lo que permite procesar capturas de pantalla sin recortar ni alterar su relación de aspecto. El modelo genera la salida mediante un proceso de denoised progresivo por bloques, en lugar de decodificar token a token. Esta aproximación es especialmente adecuada para la generación de coordenadas y acciones estructuradas, donde los autores argumentan que la difusión ofrece una decodificación más fluida y robusta que los métodos autoregresivos.

No se han publicado en la información disponible detalles sobre el conjunto de datos de entrenamiento, el número de tokens empleados ni la composición del corpus. Tampoco se menciona el uso de técnicas como RLHF, DPO o entrenamiento con preferencias. El modelo se etiqueta como multimodal, vision-language y gui-agent, y la documentación técnica se limita a la model card y a un enlace a un PDF de paper no accesible directamente desde la información proporcionada.

## Capacidades

- Grounding de elementos GUI: localiza componentes de interfaz (botones, campos de texto, iconos) en capturas de pantalla y devuelve coordenadas normalizadas a [0, 999].
- Comprensión de resolución nativa: procesa capturas de pantalla sin cambiar su relación de aspecto, preservando detalles visuales de interfaces móviles, de escritorio y web.
- Generación de acciones estructuradas: produce razonamiento textual y acciones ejecutables (por ejemplo, clic, rellenar campo, scroll) en formato estructurado.
- Decodificación por difusión block-wise: genera salidas mediante denoised progresivo por bloques, en lugar de autoregresión token a token.
- Interacción multiplataforma: el modelo está diseñado para entornos móviles, escritorio y web, según se indica en la documentación.
- Soporte de pipeline image-text-to-text: recibe una imagen (captura de pantalla) y contexto de tarea o historial de interacción, y devuelve la salida multimodal.

## Casos de uso

- Automatización de pruebas de interfaz de usuario: LLaDA-UI puede analizar capturas de pantalla de una aplicación en desarrollo y generar coordenadas precisas para simular clics o envíos de formularios, acelerando los flujos de test E2E sin necesidad de scripts manuales para cada elemento. Al preservar la resolución nativa, es robusto ante diseños responsive.
- Asistentes de accesibilidad para personas con discapacidad visual: el modelo puede interpretar una captura de pantalla y describir la ubicación de los elementos interactivos, permitiendo construir sistemas de asistencia que naveguen por interfaces de escritorio o móvil mediante comandos de voz o teclado.
- Robotic process automation (RPA) en aplicaciones heredadas: en entornos donde no existe API ni acceso programático, LLaDA-UI puede actuar como capa visual de un RPA, decidiendo dónde hacer clic o qué escribir a partir de la información visible en pantalla, adaptándose a cambios de UI sin reconfiguración.
- Agentes de navegación web autónomos: dada una captura del navegador y una tarea (por ejemplo, buscar un producto), el modelo puede localizar el campo de búsqueda y el botón de envío, emitiendo las coordenadas y acciones necesarias para completar el flujo. Su decodificación por difusión permite una generación rápida de secuencias de acción.
- Interacción con emuladores y dispositivos móviles en CI/CD: en pipelines de integración continua para aplicaciones Android o iOS, LLaDA-UI puede inspeccionar capturas de emulador y ejecutar acciones, facilitando la validación automatizada de funcionalidades críticas sin frameworks de testing propietarios.
- Auditoría y análisis de UX/UI: el modelo puede localizar elementos concretos en capturas de pantalla y devolver sus coordenadas normalizadas, lo que permite generar metadatos estructurados para auditar la disposición de interfaces, medir la densidad de elementos o detectar componentes no accesibles.

## Benchmarks y rendimiento

El model card de LLaDA-UI incluye una figura titulada "GUI-agent evaluation reproduced from the technical report" que muestra resultados de benchmarks, pero no se proporcionan valores numéricos en la información disponible. Por tanto, no se pueden presentar datos concretos de rendimiento en esta ficha. No se han publicado resultados detallados (por ejemplo, en ScreenSpot o benchmarks similares de grounding GUI) en la documentación accesible.

## Requisitos de hardware

- El checkpoint en BF16 ocupa aproximadamente 32 GB según el model card, con un peso total de 33.9 GB en el repositorio.
- Para la inferencia, además de los pesos, se requiere memoria para los tokens visuales y el estado del proceso de difusión. Se estima una VRAM mínima de 40 GB, por lo que se recomiendan GPUs como A100 40GB, A6000 48GB o H100 80GB.
- No está documentado que el modelo funcione en GPU de consumo (por ejemplo, RTX 4090 con 24 GB) sin cuantización, y no se ofrecen versiones cuantizadas en el repositorio.
- El entorno de inferencia verificado requiere Python 3.10, PyTorch 2.5.1, Transformers 4.51.0 y FlashAttention 2.7.4.post1, con CUDA. Es necesario compilar FlashAttention contra el entorno CUDA y PyTorch correspondiente.
- Se menciona compatibilidad con SGLang para servirse, y también se proporciona un script de inferencia con Transformers (`inference/inference_hf.py`).
- No se disponen de datos de latencia ni throughput en la información consultada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con otros modelos de la misma categoría. LLaDA-UI se enmarca dentro de los agentes GUI multimodales, pero no se han publicado en la documentación accesible comparativas numéricas con alternativas como UI-TARS, Fara-7B u otros modelos de grounding de interfaces. En consecuencia, no se puede presentar una comparativa técnica fundamentada en esta ficha.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica una licencia, lo que genera incertidumbre sobre el uso comercial o la redistribución. Conviene contactar con inclusionAI antes de usar el modelo en producción.
- Sin detalles de entrenamiento: la ausencia de información sobre el conjunto de datos y el proceso de entrenamiento impide evaluar sesgos, robustez o comportamiento ante inputs maliciosos. Los riesgos de alucinación en la generación de coordenadas no están documentados.
- Requisitos de memoria elevados: el modelo necesita al menos 32 GB de VRAM para los pesos en BF16, lo que limita su despliegue a infraestructura con GPUs de última generación.
- Dependencia de FlashAttention y CUDA: la inferencia requiere una compilación específica de FlashAttention y un entorno CUDA compatible, lo que dificulta el despliegue en entornos no Linux o sin GPU NVIDIA.
- Idiomas no especificados: aunque el modelo es multimodal, no se indica oficialmente qué idiomas soporta en la generación de razonamiento textual o instrucciones. El uso fuera del inglés podría producir resultados no evaluados.
- Al no ofrecer cuantizaciones, el modelo ocupa cerca de 34 GB en disco y no está optimizado para entornos edge o servidores con memoria limitada.
- El enfoque en agentes GUI hace que su capacidad como modelo de lenguaje general sea limitada: no está pensado para tareas de texto puro, y su uso fuera del dominio de interfaces gráficas no está soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/LLaDA-UI
- Repositorio de código en GitHub: https://github.com/inclusionAI/LLaDA-UI
- PDF del paper técnico: https://github.com/inclusionAI/LLaDA-UI/blob/master/assets/LLaDA-UI-paper.pdf
- Página oficial del proyecto: https://www.inclusion-ai.org/LLaDA-UI/
- Artículo de análisis sobre el lanzamiento silencioso: https://www.orcarouter.ai/blog/llada-ui-quiet-release
