# Resize8004/Minimax-H3-Image-Exp-Comfy

## Resumen

Minimax-H3-Image-Exp-Comfy es un repositorio experimental de terceros que empaqueta el modelo de generación y edición de imágenes MiniMax-H3-Image en formato compatible con ComfyUI, junto con una LoRA de corrección de materiales y un nodo personalizado de "cabeza única". El autor identificado en el repositorio es Resize8004 (la model card cita a t8star como responsable del empaquetado de investigación), y no se trata de una versión oficial de MiniMax ni de un modelo nuevo, sino de una conversión de pesos y una serie de experimentos de inferencia sobre el modelo base MiniMaxAI/MiniMax-H3-Image.

El objetivo declarado del repositorio es doble: por un lado, ofrecer una conversión completa sin podar ni cuantizar a INT8 del backbone en BF16/FP32 (66,29 GB) con el diseño de atención QKV adaptado a ComfyUI; por otro, explorar si una LoRA de compensación de materiales (rank 16, 172 MB) mejora la textura de piel, tejidos, pelo y acuarela en rutas de muestreo de muchos pasos (Euler 50 pasos, CFG 3, shift 3), en contraste con la ruta nativa de seis pasos del modelo publicado.

Es relevante ahora porque documenta de forma inusualmente transparente tanto los aciertos como los fallos de una intervención sobre un modelo de difusión de gran tamaño, incluyendo pesos rechazados por no superar las comprobaciones numéricas de entrenamiento. El repositorio ocupa 99,8 GB y está pensado para investigadores que quieran reproducir los experimentos, no para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto-a-imagen y edición, con cabezas PDD (no se detalla la arquitectura interna completa) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone en BF16 + FP32 mixto; codificador de texto INT8; VAE FP16. No se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | safetensors (backbone, LoRA, codificador de texto, VAE) |
| Tamano del repositorio | 99,8 GB |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |
| Libreria | minimax-h3 |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base más allá de indicar que es un modelo de difusión con seis cabezas PDD (probablemente "prediction distribution heads" o similar) y un mecanismo AdaLN que se conserva sin recortar en la conversión. La conversión a ComfyUI renombra los tensores y reordena el layout QKV de la atención; se mantiene la precisión mixta original y los tensores no convertidos. El codificador de texto es un Qwen3-VL de 32B en INT8 y el VAE es FP16.

El "entrenamiento" relevante aquí es el de la LoRA experimental `experimental_direct_mlp100_rank16.safetensors`, una compensación de materiales de rango 16 entrenada de forma independiente. El autor advierte explícitamente de que no dispone del backbone PDD original ni de pesos de un profesor desconocido, por lo que no puede afirmar que se haya "eliminado la destilación" ni que se recupere el 99% del original. La puntuación de 8/10 que menciona corresponde a una revisión manual conjunta sobre un conjunto fijo de muestras, no a una métrica de similitud con un profesor ni a un test ciego a gran escala. También se conserva un candidato rechazado (`REJECTED_edit_preservation_mlp100_rank16_DIAGNOSTIC_ONLY.safetensors`) que no superó el presupuesto numérico de entrenamiento y se ofrece solo para diagnóstico de fallos.

## Capacidades

- Generación de imágenes a partir de texto en resoluciones de 2048×2048 (nueve pruebas documentadas).
- Edición de imágenes por referencia, con resolución de 2048×1344 en el ejemplo de edición fotográfica.
- Ruta nativa de seis pasos con el calendario PDD publicado y BasicGuider (equivalente a CFG 1), sin nodo de cabeza única ni LoRA de corrección.
- Ruta experimental de muchos pasos (Euler 50 pasos, CFG 3, shift 3) con cabeza única ponderada por intervalos y LoRA direct MLP100 a intensidad +1.
- Soporte de prompts en chino e inglés.
- Integración con ComfyUI mediante nodos nativos `MiniMaxH3ImageConditioning`, `LoraLoaderBypassModelOnly`, `ManualSigmas` y `CFGGuider`, más un nodo personalizado `h3_image_single_head`.
- No se documentan tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Reproducción de investigación sobre el modelo base: cargar el backbone completo en BF16/FP32 y ejecutar el flujo nativo de seis pasos para validar el comportamiento del modelo publicado sin modificaciones.
- Estudio de corrección de materiales en piel: comparar el control de 50 pasos sin LoRA frente a la versión con direct MLP100 sobre retratos, manteniendo prompt, semilla, resolución y rejilla sigma idénticos.
- Evaluación de texturas textiles: analizar la transición del lino de un relieve fragmentado a un tejido continuo en imágenes de 2048×2048, usando los pares de ejemplo del repositorio como referencia.
- Edición fotográfica localizada: sustituir o eliminar elementos de una foto preparada (por ejemplo, texto en una pared) con el flujo de edición que transporta la misma imagen de referencia en las ramas positiva y negativa.
- Diagnóstico de fallos de preservación: usar el candidato rechazado y los ejemplos de fallo (paraguas sin mango completo, edición de pared con deriva de contenido no objetivo) para estudiar modos de fallo antes de desplegar cualquier variante.
- Docencia y divulgación técnica: ilustrar cómo una LoRA de bajo rango puede modificar la textura percibida sin reentrenar el backbone, y por qué una puntuación manual no equivale a una métrica objetiva.
- Pruebas de viabilidad en hardware de consumo: verificar que el backbone de 66 GB puede ejecutarse con 16 GB de VRAM y 128 GB de RAM mediante descarga a memoria del sistema, como referencia de requisitos mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente aporta una revisión manual conjunta sobre diez muestras fijas, con ocho aprobados y dos fallos (paraguas y edición de pared), que no constituye una evaluación comparativa estandarizada.

## Requisitos de hardware

- VRAM: el entorno de referencia usa una RTX 4060 Ti de 16 GB, lo que exige descarga agresiva de pesos a memoria del sistema.
- RAM: 128 GB en el equipo de referencia; el autor advierte que 16 GB de VRAM no implican que máquinas con menos memoria puedan ejecutar el modelo.
- GPU recomendadas: no se especifican modelos de datacenter; el único hardware documentado es la RTX 4060 Ti 16 GB.
- Despliegue: ComfyUI (versión de referencia `989d93d0d`) con los nodos nativos citados y el nodo personalizado `h3_image_single_head`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que el rendimiento no está garantizado y que la reproducibilidad píxel a píxel no está asegurada entre hardware, operadores y versiones de ComfyUI.

## Comparativa con modelos similares

No disponible. El repositorio no proporciona comparaciones con otros modelos de difusión y la información suministrada no incluye datos de alternativas comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo oficial de MiniMax ni una versión nueva: es un empaquetado de terceros sobre MiniMaxAI/MiniMax-H3-Image.
- El backbone conserva las seis cabezas PDD y la ruta nativa de seis pasos no se ha eliminado; no debe presentarse como modelo "sin destilación".
- La puntuación de 8/10 es un recuento de revisión manual sobre muestras fijas, no una métrica de similitud con un profesor ni un test ciego.
- La LoRA direct MLP100 simplifica detalles locales y altera caras, posiciones de objetos y composición; no es una mejora universal.
- Los ejemplos de fallo documentados incluyen un paraguas sin mango completo y una edición de pared con deriva de contenido no objetivo.
- El candidato rechazado no superó las comprobaciones numéricas de entrenamiento y solo debe usarse para diagnóstico.
- No se garantiza reproducibilidad píxel a píxel entre hardware, operadores o versiones de ComfyUI.
- El modelo solo declara soporte para chino e inglés.
- La licencia `minimax-h3-image-community-license-agreement` es de tipo "other"; deben revisarse sus términos antes de cualquier uso comercial.
- Riesgo de alucinación visual y de sesgos: no se documentan evaluaciones específicas de sesgo ni de fidelidad semántica.
- El tamaño del repositorio (99,8 GB) y del backbone (66,29 GB) exigen infraestructura con abundante memoria; no debe descargarse el directorio completo de experimentos como si fuera un único modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Backbone completo: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/diffusion_models/minimax_h3_image_full_bf16_comfy_qkvfix.safetensors
- LoRA direct MLP100: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/loras/experimental_direct_mlp100_rank16.safetensors
- Codificador de texto: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/text_encoders/qwen3vl_32b_minimax_h3_int8_convrot.safetensors
- VAE: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/vae/minimax_h3_image_vae_fp16.safetensors
- Nodo personalizado: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/tree/main/custom_nodes/h3_image_single_head
- Índice de modelos: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/MODEL_INDEX.md
- Manifiesto legible por máquina: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/MODEL_MANIFEST.json
- Ejemplos y evaluación: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/EXAMPLES.md
- Atribución: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/blob/main/ATTRIBUTION.md
- Flujos de trabajo: https://huggingface.co/Resize8004/Minimax-H3-Image-Exp-Comfy/tree/main/workflows
