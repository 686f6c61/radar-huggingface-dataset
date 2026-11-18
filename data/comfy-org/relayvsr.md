# Comfy-Org/RelayVSR

## Resumen

RelayVSR es un modelo de difusion para superresolucion de video (video super-resolution, VSR) distribuido por Comfy-Org como un único archivo compatible con ComfyUI. No se trata de un modelo de lenguaje ni de un modelo multimodal de proposito general: su tarea es el reescalado de video (x2 y x4) mediante un pipeline de generacion incondicional de imagen por difusion. El repositorio empaqueta los pesos originales de `kopper/RelayVSR` (variante x4) y `lightx2v/RelayVSR_X2` (variante x2) en formato `safetensors` con cuantizacion int8 y rotacion de convoluciones, junto con dos VAE especificos (`relayvsr_flash_vae_x4_fp32` y `relayvsr_flash_vae_x2_fp32`).

El modelo resulta relevante para desarrolladores que necesitan integrar superresolucion de video en flujos de trabajo de ComfyUI sin gestionar multiples dependencias: el repositorio incluye tanto los modelos de difusion como los VAE necesarios, y Comfy-Org publica plantillas de workflow oficiales (por ejemplo, "Video Upscale: RelayVSR 2x"). El tamano del repositorio es de 10,6 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

La informacion disponible no detalla la arquitectura interna, el numero de parametros ni los datos de entrenamiento; la model card se limita a indicar el reempaquetado para ComfyUI y las instrucciones de instalacion. Cualquier dato no confirmado se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (modelo de difusion para superresolucion de video; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen/video, no de texto) |
| Tipos de cuantizacion | int8 con rotacion de convoluciones (`int8_convrot`); VAE en fp32 |
| Idiomas soportados | no disponible (no aplica a un modelo de superresolucion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo mas alla de que se trata de un modelo de difusion para superresolucion de video, con variantes x2 y x4. Los nombres de archivo indican el uso de cuantizacion int8 con rotacion de convoluciones (`convrot`) para reducir el peso de los pesos de difusion, mientras que los VAE se distribuyen en fp32 (`relayvsr_flash_vae_x4_fp32.safetensors` y `relayvsr_flash_vae_x2_fp32.safetensors`), lo que sugiere un VAE "flash" optimizado para decodificacion rapida.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El modelo base declarado es `kopper/RelayVSR` con `lightx2v/RelayVSR_X2` como referencia para la variante x2; el repositorio de Comfy-Org es un reempaquetado, no un entrenamiento nuevo.

## Capacidades

- Superresolucion de video con factores de escalado x2 y x4.
- Generacion incondicional de imagen por difusion aplicada al reescalado de fotogramas de video.
- Integracion nativa con ComfyUI mediante archivos single-file en `models/diffusion_models/` y `models/vae/`.
- Uso de VAE especificos por factor de escala (x2 y x4) para la codificacion/decodificacion latente.
- Plantillas de workflow oficiales publicadas por Comfy-Org (por ejemplo, "Video Upscale: RelayVSR 2x").
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo "thinking"; no aplica a este tipo de modelo.

## Casos de uso

- Restauracion y reescalado de video de archivo: aplicar la variante x4 para aumentar la resolucion de material antiguo o de baja calidad antes de su publicacion, usando el workflow de ComfyUI con el VAE x4 en fp32.
- Upstream de pipelines de edicion: integrar RelayVSR x2 como paso previo a tareas de edicion o composicion, de modo que el video de entrada llegue a resolucion de trabajo sin perdida aparente de detalle.
- Mejora de video generado por IA: reescalar clips producidos por modelos de generacion de video de baja resolucion (por ejemplo, 480p a 960p o 1080p) para igualar la resolucion de entregables finales.
- Postproduccion para redes sociales: reescalar contenido vertical u horizontal de baja resolucion a formatos de mayor calidad manteniendo el flujo dentro de ComfyUI y evitando exportar a herramientas externas.
- Restauracion de material de vigilancia o camaras: aplicar x2 para mejorar la legibilidad de grabaciones comprimidas, con la ventaja de que el modelo es incondicional y no requiere prompt de texto.
- Prototipado e investigacion en VSR: usar los pesos int8 y los VAE fp32 como referencia reproducible para comparar tecnicas de superresolucion dentro de ComfyUI, con licencia Apache 2.0 para experimentacion y publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 10,6 GB, pero el consumo en inferencia depende del numero de fotogramas procesados por lote y de la resolucion de salida; no se proporcionan cifras.
- GPU recomendadas: no disponible. Al ser un modelo de difusion para video, se recomienda una GPU con al menos 16-24 GB de VRAM para resoluciones medias, pero esta estimacion no procede de la documentacion del modelo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la cuantizacion int8 de los pesos de difusion reduce el peso en disco, pero no se detalla el consumo en VRAM.
- Opciones de despliegue: ComfyUI (flujo oficial, con archivos en `models/diffusion_models/` y `models/vae/`). No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI) porque no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de superresolucion de video con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos; al ser un modelo de superresolucion de video, puede amplificar artefactos, ruido o sesgos presentes en el material de entrada.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede inventar detalle inexistente en los fotogramas de entrada, especialmente en texturas finas, rostros o texto.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no procesa texto; no admite prompts ni instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base original (`kopper/RelayVSR` y `lightx2v/RelayVSR_X2`) por si existieran terminos adicionales no reflejados en el reempaquetado.
- El repositorio es un reempaquetado para ComfyUI; la calidad final depende de la version de ComfyUI y de los nodos utilizados en el workflow.
- No se documentan requisitos minimos de hardware ni tiempos de inferencia, lo que dificulta planificar despliegues en produccion.
- Al ser un modelo incondicional, no permite controlar el resultado mediante texto; cualquier ajuste debe hacerse mediante parametros del pipeline de difusion (pasos, escala, etc.).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/RelayVSR
- Modelo base original (x4): https://huggingface.co/kopper/RelayVSR
- Modelo base original (x2): https://huggingface.co/lightx2v/RelayVSR_X2
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla de workflow "Video Upscale: RelayVSR 2x": https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_relayvsr_video_x2_upscale.json
