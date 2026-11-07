# JoaoZaokk/Qwen2.5-VL-3B-abliterated-fp16-ComfyUI

## Resumen

`JoaoZaokk/Qwen2.5-VL-3B-abliterated-fp16-ComfyUI` es un repackaging del modelo `huihui-ai/Qwen2.5-VL-3B-Instruct-abliterated` con los nombres de tensor, formas y dtype (fp16) del fichero `qwen_2.5_vl_fp16.safetensors` que usa ComfyUI como text encoder en el flujo de OmniGen2. No se trata de un modelo nuevo: la abliteración (eliminación de rechazos en la parte textual) es trabajo de huihui-ai sobre el Qwen2.5-VL-3B-Instruct original de Alibaba Cloud, y el autor de este repositorio únicamente convierte de bf16 a fp16 y verifica que los nombres de tensor coinciden con los que espera ComfyUI.

El interés del artefacto es práctico: permite sustituir el text encoder estándar de OmniGen2 en ComfyUI por una versión sin censura textual sin modificar el grafo ni el pipeline. El autor advierte explícitamente de que el condicionamiento cambia para todos los prompts, no solo para los que el modelo original rechazaría, con PSNR entre 12,0 y 19,0 dB sobre seis imágenes generadas con la misma semilla, y lo etiqueta como experimento.

Por su naturaleza es un fichero de pesos para inferencia en ComfyUI, no un checkpoint para entrenamiento ni para despliegue en servidores de inferencia de texto. La relevancia es acotada: sirve a quien quiera explorar la generación de imágenes con OmniGen2 sin restricciones en el encoder de texto, asumiendo que el resultado visual se desvía del original de forma no determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen2.5-VL); empaquetado como text encoder de OmniGen2 |
| Parametros totales | 3B (heredados del modelo base Qwen2.5-VL-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (unico dtype del fichero publicado); el base admite otras, no documentadas aqui |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License; uso no comercial, solo investigacion o evaluacion) |
| Formato de pesos | safetensors single-file para ComfyUI (824 tensores, nombres y formas de `qwen_2.5_vl_fp16.safetensors`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-VL-3B-Instruct, un transformer vision-language de Alibaba Cloud. Sobre él, huihui-ai aplicó abliteración, una técnica de modificación de pesos orientada a suprimir la dirección de rechazo en el espacio de activaciones. Según la model card, la abliteración afecta a 71 de los 824 tensores: `embed_tokens`, 35 `o_proj` y 35 `down_proj`. La diferencia absoluta maxima introducida es de 0,146. El autor de este repositorio solo realizó la conversión bf16 a fp16 y comprobó que no aparecen valores inf ni nan tras el cast.

No hay información sobre el dataset de entrenamiento original, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base. Tampoco se documenta ninguna innovación arquitectónica adicional más allá de la propia abliteración. El cambio funcional relevante es que el condicionamiento de OmniGen2 se altera para todos los prompts: el autor reporta PSNR de 12,0 a 19,0 dB entre el encoder original y el abliterado sobre la misma semilla en seis imágenes, con variación no explicada entre prompts. El tiempo por paso se mantiene prácticamente igual (1,44 s frente a 1,42 s).

## Capacidades

- Generación de texto y razonamiento multimodal heredados de Qwen2.5-VL-3B-Instruct (visión y lenguaje), aunque el uso previsto aquí es como encoder de texto para OmniGen2.
- Eliminación de rechazos en la parte textual: el modelo no declina peticiones que el Instruct original rechazaría.
- Codificación de prompts para el pipeline de generación de imágenes OmniGen2 en ComfyUI, cargado con `CLIPLoader` de tipo `omnigen2`.
- Integración directa en ComfyUI como fichero de pesos único en `models/text_encoders`.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni audio en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Sustitución del text encoder en flujos OmniGen2 existentes: se coloca el fichero en `models/text_encoders`, se carga con `CLIPLoader` tipo `omnigen2` y el grafo sigue funcionando sin cambios; útil para comparar el efecto de la abliteración sobre el resultado visual.
- Investigación sobre abliteración en pipelines multimodales: permite medir cómo cambia la salida de un modelo de difusión cuando se altera el encoder de texto, usando el log de medidas del repositorio del autor como referencia metodológica.
- Pruebas de robustez de condicionamiento: al cambiar el condicionamiento en todos los prompts, sirve para estudiar la sensibilidad de OmniGen2 a perturbaciones del espacio de embeddings.
- Evaluación de licencias y cumplimiento: escenario de laboratorio para analizar las implicaciones de usar pesos con licencia qwen-research en flujos de generación de imágenes.
- Docencia y divulgación técnica: ejemplo práctico de repackaging de tensores entre formatos (bf16 a fp16) y de verificación de nombres y formas para compatibilidad con ComfyUI.
- Benchmarking de calidad de imagen: comparación con el encoder original usando PSNR sobre la misma semilla para cuantificar la deriva introducida, tal como hace el autor con seis imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta medidas internas de comparación entre encoders: PSNR de 12,0 a 19,0 dB sobre seis imágenes con la misma semilla, diferencia absoluta maxima de 0,146 entre tensores, y tiempo por paso de 1,44 s frente a 1,42 s del encoder original.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 7,5 GB en fp16 para el text encoder; en la práctica ComfyUI carga este fichero junto al modelo de difusión, por lo que la VRAM total depende de OmniGen2.
- GPU recomendadas: no especificadas en la información disponible; por tamaño del encoder, cualquier GPU con al menos 8 GB de VRAM libre para el encoder es un punto de partida razonable, aunque no está confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente sí para el encoder aislado, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ComfyUI (flujo nativo con `CLIPLoader` tipo `omnigen2`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este fichero.
- Latencia y throughput: tiempo por paso de 1,44 s en la configuración del autor (DiT fp16, 20 pasos), sin diferencia significativa respecto al encoder original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JoaoZaokk/Qwen2.5-VL-3B-abliterated-fp16-ComfyUI | 3B | no disponible | qwen-research | safetensors fp16 single-file | Repackaging para ComfyUI/OmniGen2 |
| huihui-ai/Qwen2.5-VL-3B-Instruct-abliterated | 3B | no disponible | no disponible en la informacion | safetensors (bf16) | Modelo base del que deriva este fichero |
| Qwen2.5-VL-3B-Instruct (original) | 3B | no disponible en la informacion | qwen-research | safetensors | Encoder de texto estándar de OmniGen2 en ComfyUI |

## Limitaciones y advertencias

- Licencia qwen-research: uso restringido a investigación y evaluación, no comercial. Cualquier despliegue en producción requiere revisar `LICENSE` y `NOTICE`.
- Modelo sin censura en la parte textual: los rechazos se han eliminado del encoder de texto, no del modelo de imagen. La responsabilidad del uso recae en el usuario.
- El condicionamiento cambia para todos los prompts, no solo para los rechazados, con PSNR de 12,0 a 19,0 dB frente al original; la magnitud de la deriva varía entre prompts sin explicación documentada.
- El autor lo etiqueta explícitamente como experimento; no hay garantías de estabilidad ni de calidad de imagen.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados del modelo base Qwen2.5-VL-3B-Instruct.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.
- Sin descargas ni likes en el momento de la consulta; ausencia de validación por la comunidad.
- Solo se publica fp16; no hay variantes cuantizadas en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/JoaoZaokk/Qwen2.5-VL-3B-abliterated-fp16-ComfyUI
- Modelo base: https://huggingface.co/huihui-ai/Qwen2.5-VL-3B-Instruct-abliterated
- Repositorio de herramientas y log de medidas: https://github.com/JoaoZaokk/comfy-quant-bench
- ComfyUI_QwenVL (nodos QwenVL para ComfyUI): https://github.com/alexcong/ComfyUI_QwenVL
- ComfyUI-QwenVL (suite de nodos QwenVL): https://github.com/1038lab/ComfyUI-QwenVL
