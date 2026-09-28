# QuantFunc/Qwen-Image-2.1-4bit

## Resumen

QuantFunc/Qwen-Image-2.1-4bit es una version cuantizada a 4 bits (INT4) del modelo de generacion y edicion de imagenes Qwen-Image-2.1, desarrollado originalmente por el equipo Qwen (Alibaba). La cuantizacion la firma QuantFunc, un proyecto independiente que publica pesos derivados junto con su propio motor de inferencia y extension para ComfyUI. El objetivo es reducir la huella de pesos y el coste de ancho de banda de memoria durante la carga e inferencia, permitiendo ejecutar un modelo de difusion de gama alta en GPUs de consumo.

El modelo base Qwen-Image-2.1 es un modelo unificado de text-to-image y edicion de imagenes con unos 7.000 millones de parametros en su componente de generacion visual, articulado en 32 capas DiT (Diffusion Transformer) de flujo unico, con soporte nativo para generar y editar imagenes con transparencia. QuantFunc aplica compresion 4x (de 16 bits a 4 bits) y publica dos variantes de pesos, r128 y r32, que se diferencian en el rango del componente de baja dimension usado por la tecnica de cuantizacion.

La relevancia de esta ficha radica en que ofrece un punto de entrada practico para probar Qwen-Image-2.1 en hardware modesto, a cambio de asumir que el formato de pesos es propio del autor (no un checkpoint estandar de Diffusers) y que la licencia del modelo base es la Qwen Research License, con las restricciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo unico, 32 capas Single-Stream en el componente de generacion visual del modelo base; cuantizacion INT4 con componente de bajo rango (tecnica etiquetada como svdquant) |
| Parametros totales | 7B en el componente de generacion visual del modelo base; el repositorio cuantizado ocupa 9,0 GB en total (incluye variantes) |
| Longitud de contexto | no disponible (modelo de difusion; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | INT4 (4 bits). Dos variantes de pesos: r128 (~4,3 GB) y r32 (~4,0 GB). Tags del repositorio indican int4 y svdquant |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License, heredada del modelo base). El tooling de cuantizacion de QuantFunc tiene su propia licencia |
| Formato de pesos | safetensors, en formato propio de QuantFunc (no es un checkpoint cargable directamente con el paquete diffusers, pese a declarar library_name: diffusers) |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente corresponde a un Diffusion Transformer de flujo unico con 32 capas en su componente de generacion visual y aproximadamente 7.000 millones de parametros. Qwen-Image-2.1 se presenta como un modelo unificado que cubre generacion text-to-image y edicion de imagenes, con soporte nativo para generar y editar contenido con transparencia. Esta version concreta no reentrena el modelo: aplica una cuantizacion post-entrenamiento de los pesos de 16 bits a 4 bits, con un factor de compresion declarado de 4x.

Segun la model card, la cuantizacion INT4 de QuantFunc preserva composicion, renderizado de texto y detalle fino "cerca del baseline de 16 bits", aunque no se aportan metricas objetivas que cuantifiquen esa perdida. El autor indica que los pesos se distribuyen en su propio formato safetensors y que deben cargarse con ComfyUI-QuantFunc o con el motor de inferencia de QuantFunc, no como un checkpoint de Diffusers. La etiqueta library_name: diffusers se declara explicitamente para que Hugging Face contabilice descargas de los ficheros planos .safetensors, no porque los pesos sean compatibles con esa libreria. No se documentan en la informacion disponible ni el dataset de entrenamiento, ni el numero de tokens, ni fases de RLHF/DPO, ni innovaciones de decodificacion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en el modelo base, capacidad que la version cuantizada pretende preservar.
- Edicion de imagenes, segun la definicion del modelo base como modelo unificado de generacion y edicion.
- Renderizado de texto dentro de la imagen, destacado por el autor como una de las areas donde la cuantizacion mantiene calidad cercana al baseline de 16 bits.
- Generacion y edicion de imagenes con transparencia, capacidad nativa documentada del modelo base.
- Composición y detalle fino: el autor afirma que se mantienen cerca del modelo de 16 bits.
- No se documentan capacidades de tool calling ni function calling: es un modelo de difusion, no un modelo de lenguaje conversacional.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- Soporte multilingue de prompts: no disponible en la informacion proporcionada.
- No se documentan modos especiales (thinking, vision de entrada, audio) mas alla de la generacion y edicion de imagen.

## Casos de uso

- Generacion de imagenes en GPU de consumo: con pesos de ~4,0-4,3 GB y soporte para GPUs NVIDIA SM75+, permite ejecutar Qwen-Image-2.1 en tarjetas como las RTX 20/30/40/50-series, donde el modelo de 16 bits resultaria mas costoso en memoria.
- Edicion de imagenes con texto integrado: al preservar el renderizado de texto, encaja en flujos donde hay que editar carteles, maquetas o infografias manteniendo la legibilidad de las tipografias.
- Creacion de recursos con fondo transparente: la capacidad nativa de transparencia del modelo base es util para generar assets de diseño, logotipos o sprites sin postprocesado de recorte.
- Integracion en ComfyUI: al cargarse mediante el nodo QuantFunc, se puede insertar en grafos existentes de ComfyUI sustituyendo unicamente el loader, sin rehacer el resto del workflow.
- Prototipado rapido de material grafico: equipos de marketing o producto pueden iterar sobre bocetos visuales en local antes de pasar a produccion con modelos de mayor coste.
- Procesamiento por lotes en servidores con A100/H100/H200: la reduccion de ancho de banda de pesos por token de inferencia facilita servir volumenes altos de generacion en GPUs de centro de datos.
- Investigacion en cuantizacion de modelos de difusion: sirve como caso de estudio para comparar tecnicas INT4 (r128 frente a r32) y evaluar la degradacion de calidad respecto al modelo de 16 bits.
- Despliegue en GPUs de nueva generacion (B100, B200, GB300): el autor declara compatibilidad con toda la familia SM75+, lo que permite usar el mismo build en hardware reciente de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas cuantitativas frente al baseline de 16 bits) ni resultados de evaluacion de calidad. El autor se limita a afirmar cualitativamente que "composicion, renderizado de texto y detalle fino se mantienen cerca del baseline de 16 bits", sin cifras que lo respalden.

## Requisitos de hardware

- Tamano de pesos: ~4,3 GB en la variante r128 y ~4,0 GB en la variante r32.
- VRAM estimada: no disponible como cifra cerrada. El autor indica que la VRAM real depende de la resolucion, el tamano de lote y el resto del workflow, por lo que los 4,0-4,3 GB de pesos son solo una parte del consumo total.
- GPUs compatibles declaradas: toda la familia NVIDIA SM75 o superior, incluyendo RTX 20/30/40/50-series, A100, H100, H200, B100, B200 y GB300.
- GPU de consumo: si, el autor afirma explicitamente que la cuantizacion facilita ejecutar Qwen-Image-2.1 en GPUs de consumo, aunque no garantiza que toda la gama RTX 20-series disponga de VRAM suficiente para resoluciones altas.
- Opciones de despliegue: ComfyUI-QuantFunc (extension oficial) o el motor de inferencia de QuantFunc. No es un checkpoint cargable de forma nativa con diffusers, pese a la etiqueta library_name.
- Latencia y throughput estimados: no disponibles.
- Otros backends (vLLM, llama.cpp, Ollama, TGI): no aplicables ni documentados para este modelo de difusion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / arquitectura | Precision | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| QuantFunc/Qwen-Image-2.1-4bit | 7B en componente visual (base) | DiT, 32 capas Single-Stream | INT4 (r128/r32) | qwen-research | safetensors propio de QuantFunc; requiere ComfyUI-QuantFunc o motor QuantFunc |
| Qwen/Qwen-Image-2.1 | 7B en componente visual | DiT, 32 capas Single-Stream | 16 bits | Qwen Research License | Checkpoint original del equipo Qwen |
| Qwen Image 2.1 INT4 (W4A8) (Civitai) | 7B en componente visual (base) | DiT, 32 capas Single-Stream | INT4 W4A8 con ConvRot | no disponible en la informacion proporcionada | Checkpoint para ComfyUI, distribuido en Civitai |
| unsloth/Qwen-Image-2.1 | 7B en componente visual | DiT, 32 capas Single-Stream | no disponible | no disponible | espejo del modelo base en Hugging Face |

La comparacion se limita a variantes del propio Qwen-Image-2.1 (16 bits, INT4 W4A8 de terceros y el espejo de unsloth). No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre ellas.

## Limitaciones y advertencias

- Licencia qwen-research: la Qwen Research License impone restricciones de uso, tipicamente orientadas a investigacion. Debe revisarse el texto completo de la licencia del modelo base antes de cualquier uso comercial.
- Formato propietario: los pesos no son cargables como checkpoint estandar de Diffusers; requieren ComfyUI-QuantFunc o el motor de QuantFunc. La etiqueta library_name: diffusers puede inducir a error.
- Perdida de calidad por cuantizacion: no cuantificada objetivamente; la afirmacion de calidad cercana al baseline de 16 bits es cualitativa y no verificable con los datos disponibles.
- Riesgo de artefactos de generacion: al ser un modelo de difusion, puede producir incoherencias estructurales o errores en el renderizado de texto, especialmente en tipografias complejas o idiomas distintos del entrenado.
- Idiomas de prompt no documentados: no hay informacion sobre que idiomas soporta para las instrucciones de texto.
- Sesgos: no se documentan evaluaciones de sesgo ni de representacion demografica en la informacion disponible.
- Modelo reciente y sin traccion: el repositorio registra 0 descargas y 0 likes, por lo que carece de validacion de la comunidad y de informes independientes de calidad.
- Dependencia del tooling del autor: el soporte y las actualizaciones dependen de QuantFunc (extension de ComfyUI y motor propios), no del equipo Qwen.
- Coherencia de fechas: la fecha de creacion del repositorio aparece como 2026-09-28, posterior a la fecha de redaccion habitual; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/QuantFunc/Qwen-Image-2.1-4bit
- Modelo base Qwen-Image-2.1 en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Blog oficial de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Extension ComfyUI-QuantFunc: https://github.com/QuantFunc/ComfyUI-QuantFunc
- Sitio web de QuantFunc: https://www.quantfunc.com/
- Perfil de QuantFunc en Hugging Face: https://huggingface.co/QuantFunc
- Perfil de QuantFunc en ModelScope: https://www.modelscope.cn/profile/QuantFunc
- Discord de QuantFunc: https://discord.gg/jCp9TpFWcn
- Texto de la licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Espejo de Qwen-Image-2.1 en unsloth: https://huggingface.co/unsloth/Qwen-Image-2.1
- Cuantizacion alternativa INT4 (W4A8) en Civitai: https://civitai.com/models/2951557/qwen-image-21-int4w4a8
- Documentacion de Hugging Face sobre estadisticas de descargas: https://huggingface.co/docs/hub/models-download-stats
