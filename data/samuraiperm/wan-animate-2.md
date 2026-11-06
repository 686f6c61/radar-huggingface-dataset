# samuraiperm/Wan-Animate-2

## Resumen

Wan Animate 2 es un modelo de difusion para animacion y transferencia de movimiento sobre video, empaquetado por el usuario `samuraiperm` en formato de archivo unico para su uso directo en ComfyUI. El repositorio no contiene un modelo entrenado desde cero, sino una redistribucion de los pesos del modelo original Wan2.2-Animate-2-14B publicado por Wan-AI, reorganizados en la estructura de carpetas que espera ComfyUI (`diffusion_models`, `text_encoders`, `vae`, `clip_vision`, `loras`).

El modelo original pertenece a la familia Wan 2.2, una linea de modelos de generacion de video de 14B parametros basada en difusion. La variante "Animate" esta orientada a la transferencia de movimiento: dada una imagen de referencia y un video de conduccion, genera un video donde el sujeto de la imagen reproduce los movimientos del video fuente. El repositorio incluye tanto la version base como una version destilada (distill), y variantes cuantizadas a int8 con rotacion de convoluciones (`convrot`), pensadas para reducir requisitos de VRAM.

La relevancia de este repositorio es practica: simplifica el despliegue en ComfyUI de un modelo de 14B que de otro modo requeriria descargar y organizar manualmente multiples componentes (text encoder UMT5-XXL, VAE, CLIP vision y LoRA de destilacion). La licencia declarada es Apache 2.0. El tamano del repositorio es de 119,2 GB, lo que refleja la inclusion de los pesos en bf16, int8, el text encoder en fp16 y fp8, y componentes auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (modelo de video, familia Wan 2.2); detalles de bloque no disponibles |
| Parametros totales | 14B (segun el nombre del modelo original Wan2.2-Animate-2-14B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | bf16, int8 (variantes `int8_convrot`), fp8 (text encoder `fp8_e4m3fn_scaled`), fp16 (text encoder) |
| Idiomas soportados | no disponible (el prompt textual se procesa via UMT5-XXL, multilingue, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio es un repackaging de Wan2.2-Animate-2-14B, un modelo de difusion para video de 14B parametros. La arquitectura interna (tipo de transformer de difusion, atencion, mecanismo temporal) no se detalla en la informacion disponible; solo se confirma la familia Wan 2.2 y el uso de un text encoder UMT5-XXL (`umt5_xxl_fp16` o `umt5_xxl_fp8_e4m3fn_scaled`), un VAE (`Wan2_1_VAE_bf16`) y un encoder de vision CLIP (`clip_vision_h`). El pipeline combina estos componentes para la transferencia de movimiento.

El repositorio incluye una variante destilada (`wan_animate_2_distill_bf16` y `wan_animate_2_distill_int8_convrot`) y una LoRA de destilacion (`lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16`), lo que sugiere un proceso de destilacion por pasos (step distillation) orientado a reducir el numero de pasos de muestreo y el coste de CFG. No se dispone de datos sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO; estos detalles no estan en la informacion proporcionada.

## Capacidades

- Transferencia de movimiento sobre video: genera un video animado a partir de una imagen de referencia y un video de conduccion (motion transfer).
- Generacion de video a partir de imagen (image-to-video), segun la LoRA `I2V` incluida.
- Dos modos de inferencia: modelo base (mayor calidad, mas pasos) y modelo destilado (menos pasos, menor coste).
- Cuantizacion int8 con `convrot` para reducir huella de VRAM.
- Integracion nativa con ComfyUI mediante workflows oficiales (motion transfer y motion transfer destilado).
- Soporte de text encoder multilingue via UMT5-XXL (idiomas concretos no especificados).
- No se documentan capacidades de tool calling, agentes, razonamiento textual ni audio; es un modelo de difusion de video, no un LLM.

## Casos de uso

- Animacion de personajes para produccion audiovisual: usar una imagen de referencia de un personaje y un video de actuacion para generar tomas animadas sin rigging manual, aprovechando el workflow de motion transfer de ComfyUI.
- Previsualizacion de animaciones en pipelines de VFX: generar borradores animados rapidos con la variante destilada antes de pasar a render final, reduciendo el numero de pasos de muestreo.
- Creacion de contenido para redes sociales: animar retratos o ilustraciones con movimientos de baile o gestos a partir de un video de referencia, usando la version int8 para GPUs de consumo.
- Prototipado de videojuegos: generar animaciones de personajes no jugadores a partir de capturas de movimiento existentes, integrando el modelo en un flujo ComfyUI automatizado.
- Doblaje y reanimacion de material de archivo: transferir el movimiento de un actor a una imagen o personaje generado, manteniendo la expresion del video fuente.
- Investigacion en difusion de video: usar el modelo base bf16 como referencia para experimentos de transferencia de movimiento, comparando con la variante destilada para medir el impacto en calidad.
- Educacion y demos tecnicas: desplegar el workflow oficial en un entorno ComfyUI para demostrar tecnicas de motion transfer sin necesidad de entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de difusion de 14B en bf16 requiere del orden de 28 GB solo para pesos, mas activaciones y componentes auxiliares (VAE, text encoder, CLIP vision); la variante int8 reduce aproximadamente a la mitad el peso de los pesos del modelo de difusion.
- El text encoder UMT5-XXL en fp16 anade una huella considerable; la variante `fp8_e4m3fn_scaled` reduce ese coste.
- GPU recomendadas: no especificadas. Por tamano, se espera que las variantes bf16 requieran GPUs de datacenter (A100 80 GB, H100) o GPUs de consumo de gama alta con suficiente VRAM; las variantes int8 estan pensadas para reducir requisitos, pero no se confirma que quepan en GPUs de consumo concretas.
- Despliegue: ComfyUI (workflows oficiales incluidos). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de difusion de este tipo en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan Animate 2 (este repo) | 14B | Difusion de video, motion transfer | Apache 2.0 | Hugging Face (repackaging) | Variantes bf16 e int8, workflows ComfyUI |
| Wan2.2-Animate-2-14B (original) | 14B | Difusion de video, motion transfer | Apache 2.0 (segun repo original) | Hugging Face (Wan-AI) | Fuente del repackaging |
| Otros modelos de motion transfer | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio es un repackaging de terceros (`samuraiperm`), no el repositorio oficial; la autoria y el mantenimiento del modelo original corresponden a Wan-AI.
- No se documentan sesgos conocidos, pero al ser un modelo de difusion de video puede reproducir sesgos presentes en sus datos de entrenamiento (no detallados).
- Riesgo de artefactos y alucinacion visual en la generacion de video, especialmente en la variante destilada con menos pasos.
- No se especifican limitaciones de contexto, idioma ni resolucion maxima en la informacion disponible.
- La licencia declarada es Apache 2.0, pero conviene verificar los terminos del repositorio original Wan-AI antes de uso comercial, ya que el repackaging no anade garantias.
- El tamano del repositorio (119,2 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- No se confirma compatibilidad con GPUs de consumo para las variantes bf16; la viabilidad en hardware modesto no esta documentada.
- Las fechas de creacion y actualizacion del repositorio (2026) deben tratarse con cautela; no se dispone de informacion adicional que las confirme.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samuraiperm/Wan-Animate-2
- Repositorio original del modelo: https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B
- Workflow motion transfer (ComfyUI): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2.json
- Workflow motion transfer destilado (ComfyUI): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan_animate2_distilled.json
