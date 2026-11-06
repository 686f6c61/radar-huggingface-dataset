# Flash1405/isometric-mumbai

## Resumen

Isometric Mumbai es un LoRA de estilo para el modelo de edición de imagen Qwen/Qwen-Image-Edit, desarrollado por el usuario Flash1405. Su función es convertir un render isométrico en bruto de una ciudad —con huellas de edificios extruidas, imágenes de satélite en tejados y suelo, y una cámara fijada a acimut −15° y elevación −45°— en pixel art isométrico acabado, siguiendo el formato de plantilla de relleno (infill) que utiliza el pipeline isometric-mumbai del mismo autor. El LoRA se empleó para generar todo el contenido visual del sitio isometricmumbai.com.

El modelo se publica como adaptador LoRA de rango 16 sobre la base Qwen-Image-Edit (licencia Apache 2.0), entrenado durante 3000 pasos con un learning rate de 1e-4 en bf16 mediante ai-toolkit. El conjunto de entrenamiento consta de aproximadamente 800 teselas de render de Mumbai, con huellas de edificios procedentes de GlobalBuildingAtlas, alturas de OpenStreetMap y Google Open Buildings 2.5D, e imágenes de satélite de Google, emparejadas con redibujados generados por GPT Image de OpenAI.

Es relevante como ejemplo de adaptación de un modelo de edición de imagen de gran tamaño a una tarea de estilo muy concreta mediante un LoRA ligero, y por el formato de infill con máscara implícita (caja roja de 2 píxeles) que permite continuar de forma coherente el contexto de una imagen de 1024x1024. No obstante, se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión Qwen/Qwen-Image-Edit |
| Parametros totales | no disponible (el LoRA tiene rango 16; no se especifica el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolución de trabajo 1024x1024) |
| Tipos de cuantizacion | no disponible; el ejemplo de uso emplea torch.bfloat16 |
| Idiomas soportados | no disponible (el prompt de ejemplo está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo isometric-mumbai-teacher-v1.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen/Qwen-Image-Edit, un modelo de difusión para edición de imagen. El entrenamiento se realizó con ai-toolkit durante 3000 pasos, con learning rate 1e-4 y precisión bf16. El pipeline de inferencia se ejecuta con la clase QwenImageEditPipeline de la librería diffusers, cargando los pesos del LoRA mediante load_lora_weights con el nombre de archivo isometric-mumbai-teacher-v1.safetensors.

Los datos de entrenamiento son aproximadamente 800 teselas de render de Mumbai. Las huellas de edificios provienen de GlobalBuildingAtlas; las alturas, de OpenStreetMap y Google Open Buildings 2.5D; y las imágenes de satélite, de Google. Cada tesela se emparejó con un redibujado generado por GPT Image (OpenAI) y se usó tanto como ejemplo de tesela completa como de infill por franjas o centrado. El autor advierte que los objetivos de entrenamiento se generaron con un modelo de OpenAI, por lo que los términos de uso de OpenAI condicionan el uso de este LoRA. La convención de pipeline y formato se basa en isometric-nyc de Andy Coenen (MIT).

## Capacidades

- Conversión de renders isométricos de ciudad a pixel art isométrico con estilo consistente.
- Edición de imagen guiada por plantilla: la imagen de entrada de 1024x1024 contiene el arte acabado como contexto y el render dentro de una caja roja de 2 píxeles que marca la región a pintar.
- Infill coherente con el contexto: todo lo que queda fuera de la caja roja se conserva y el modelo continúa la imagen de forma continua.
- Soporte de tesela completa: dibujando la caja alrededor de toda la imagen se procesa el tile entero.
- Control de generación mediante true_cfg_scale (2.0 en el ejemplo) y guidance_scale (3.0 en el ejemplo), con 14 pasos de inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un adaptador exclusivamente de imagen a imagen.
- Capacidades multilingües: no disponibles; el prompt de ejemplo está en inglés.

## Casos de uso

- Generación de mapas de ciudad en pixel art: a partir de un render isométrico con huellas extruidas y ortofoto en tejados, el LoRA produce el tile final en el formato de plantilla del pipeline isometric-mumbai, listo para publicar.
- Producción de contenido web tipo isometricmumbai.com: el adaptador se usó para pintar todo el sitio, por lo que sirve para generar de forma masiva teselas de una ciudad con estilo homogéneo.
- Relleno de regiones faltantes en un mosaico: usando la caja roja de 2 píxeles se puede repintar una franja o el centro de una tesela ya existente, manteniendo la continuidad con el arte circundante.
- Prototipado de estilos de mapas para videojuegos: permite iterar rápidamente sobre la estética isométrica de un mapa urbano antes de producir los assets definitivos.
- Visualización urbana divulgativa: convierte datos de edificios (GlobalBuildingAtlas, OpenStreetMap, Google Open Buildings 2.5D) en ilustraciones isométricas atractivas para informes o artículos.
- Integración en pipelines de datos geoespaciales: al aceptar renders de ~0,29 m/px con cámara fija, encaja en un flujo automatizado que rasteriza huellas y alturas y luego aplica el LoRA para el acabado.
- Experimentación con LoRA sobre Qwen-Image-Edit: sirve como referencia técnica de un adaptador de rango 16 entrenado con ai-toolkit para una tarea de estilo muy específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse sobre Qwen/Qwen-Image-Edit en bf16, requiere cargar el modelo base completo en GPU, por lo que se necesita una GPU con memoria suficiente para un modelo de difusión de edición de imagen de gran tamaño (no se especifica la cifra).
- GPU recomendadas: no disponible; el ejemplo de uso emplea .to("cuda") sin indicar modelo concreto.
- ¿Cabe en GPU de consumo? No disponible; depende del tamaño del modelo base Qwen-Image-Edit, que no se detalla en la información proporcionada.
- Opciones de despliegue: diffusers con QwenImageEditPipeline y load_lora_weights; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión de imagen).
- Latencia y throughput: no disponibles; el ejemplo fija 14 pasos de inferencia y true_cfg_scale 2.0, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flash1405/isometric-mumbai | LoRA de estilo (image-to-image) | Qwen/Qwen-Image-Edit | 1024x1024 | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| isometric-nyc (Andy Coenen) | Pipeline y convenciones de referencia | No es un modelo; proyecto MIT | no disponible | MIT | GitHub |
| Qwen/Qwen-Image-Edit | Modelo base de edición de imagen | — | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos elementos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; los datos de entrenamiento se limitan a Mumbai y a fuentes geoespaciales concretas (GlobalBuildingAtlas, OpenStreetMap, Google Open Buildings 2.5D, imágenes de Google), lo que puede sesgar el estilo hacia esa ciudad y esas fuentes.
- Riesgo de alucinación visual: al ser un modelo generativo de imagen, puede inventar detalles en la región pintada que no correspondan al render original.
- Limitaciones de contexto: el flujo depende de una plantilla de 1024x1024 y de una caja roja de 2 píxeles; no se documenta soporte para otras resoluciones ni para prompts en idiomas distintos del inglés.
- Restricciones de licencia: el LoRA es Apache 2.0, pero los objetivos de entrenamiento se generaron con un modelo de OpenAI; el autor indica que se poseen las salidas según los términos de OpenAI, pero recomienda revisarlos para el uso de este LoRA. Las imágenes de satélite de Google y los datos de Google Open Buildings 2.5D añaden condiciones de uso de terceros que deben verificarse.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin benchmarks, sin model card extendida y sin validación comunitaria.
- Producción: el adaptador está acoplado a Qwen/Qwen-Image-Edit y a la clase QwenImageEditPipeline de diffusers; cambios en el modelo base o en la librería pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Flash1405/isometric-mumbai
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit
- Repositorio del pipeline: https://github.com/flash1405/isometric-mumbai
- Sitio generado con el LoRA: https://isometricmumbai.com
- Proyecto de referencia isometric-nyc: https://github.com/cannoneyed/isometric-nyc
- Herramienta de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
- Perfil del autor en X: https://x.com/flash1405
- Publicación en Instagram (contenido relacionado, no oficial): https://www.instagram.com/p/DSbz2c1k9GB/
