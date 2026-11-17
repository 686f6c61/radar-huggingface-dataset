# luc-melaye/rawmakase-flux-klein-remove

## Resumen

RAWmakase FLUX.2 klein object removal v1 es una exportación a ONNX del modelo de difusión FLUX.2 [klein] 4B base de Black Forest Labs, con el LoRA de eliminación de objetos de fal fusionado en el transformer. Lo publica el usuario luc-melaye bajo el paraguas del proyecto RAWmakase, y su propósito es concreto: eliminar un objeto marcado con una caja sobre una fotografía, rellenando la zona con contenido coherente. No es un modelo nuevo ni un fine-tuning propio: los pesos proceden de los lanzamientos upstream y RAWmakase se limita a fusionar el LoRA, exportar a ONNX, cuantizar y empaquetar el pipeline.

La relevancia práctica está en el formato: al estar exportado a ONNX Runtime con los pesos del transformer cuantizados a 4 bits y las atenciones fusionadas, el conjunto cabe en unos 6 GB de VRAM y funciona en GPUs de consumo, algo que el pipeline original en diffusers no permite con la misma comodidad. Además, el prompt de texto viene precalculado y embebido en `prompt.f16`, de modo que no hace falta cargar el codificador de texto Qwen3-4B en tiempo de inferencia.

El modelo base es un transformer de difusión de flujo (flow matching) de 4B parámetros con VAE propio, orientado a edición e inpainting de imágenes. El repositorio ocupa 2,5 GB y la licencia es Apache-2.0, heredada de todos los componentes originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) FLUX.2 [klein], exportado a ONNX; VAE convolucional separado |
| Parametros totales | 4B (modelo base FLUX.2 [klein] 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); prompt fijo de 512 tokens embebidos |
| Tipos de cuantizacion | Pesos de matriz del transformer a 4 bits (`MatMulNBits`, bloques de 32, simetrico); activaciones en float16; VAE en float32 |
| Idiomas soportados | no disponible (prompt de texto fijo en ingles, precalculado) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`transformer.onnx` + `transformer.onnx.data`, `vae_encoder.onnx`, `vae_decoder.onnx`, `prompt.f16`) |

## Arquitectura y entrenamiento

El transformer es el de FLUX.2 [klein] 4B base de Black Forest Labs, un modelo de difusión por flow matching que opera sobre latentes de 128 canales. En esta exportación, el LoRA de eliminación de objetos de fal se ha fusionado en el transformer con escala 1.1, y cada bloque de atención se ha colapsado en un único nodo `com.microsoft.MultiHeadAttention`. Los pesos de las multiplicaciones matriciales se cuantizan a 4 bits con `MatMulNBits` (bloques de 32, simétrico), mientras que las activaciones se mantienen en float16. La entrada del transformer es `hidden_states` de forma `[1, 2S, 128]`, donde los primeros S tokens corresponden a la imagen a generar y los S siguientes a la foto codificada que se edita; los identificadores posicionales `img_ids` distinguen ambos grupos (tiempo 0 para los generados, 10 para los de la foto).

El VAE se exporta por separado en dos grafos: `vae_encoder.onnx` convierte una imagen `[1, 3, H, W]` en `[-1, 1]` con lados múltiplos de 16 en latentes `[1, H·W/256, 128]` (parcheado 2×2 y normalizado por el batch norm del VAE), y `vae_decoder.onnx` hace el camino inverso. El codificador de texto Qwen3-4B no se incluye: en su lugar, `prompt.f16` contiene las dos embeddings de 512×7680 en float16 correspondientes al prompt "Remove the highlighted object from the scene" y al prompt vacío, calculadas una sola vez. No hay información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponden a los modelos upstream y no se detallan en la model card.

## Capacidades

- Eliminación de objetos en imágenes: recibe una foto y una región marcada (caja roja escalada a 1024 px de lado largo) y rellena la zona con contenido coherente con el entorno.
- Inpainting guiado por prompt fijo: el texto está precalculado, por lo que la edición se limita al caso de uso de borrado de objetos.
- Generación de imágenes por difusión con 16 pasos de Euler de flow matching y classifier-free guidance 4 entre prompt y prompt vacío.
- Resolución de trabajo: la foto se escala a 1024 px en el lado largo; el ejemplo documentado es 1024×736.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües en inferencia: el prompt es fijo y en inglés.
- No incluye modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Eliminación de objetos en aplicaciones de retoque fotográfico: el modelo recibe la imagen y la máscara de la zona a borrar, y devuelve la región rellena; está pensado exactamente para integrarse en una función "AI Remove" de un editor.
- Limpieza de fotografías de producto: eliminar elementos no deseados (cables, etiquetas, objetos de fondo) en catálogos de e-commerce, con la ventaja de que el pipeline cabe en una GPU de consumo y no requiere un servicio centralizado.
- Edición en local o en el dispositivo: al ocupar unos 6 GB de VRAM y no necesitar el codificador de texto, puede desplegarse en estaciones de trabajo con RTX 3070 Ti o superiores, útil para estudios que no quieren enviar imágenes a la nube.
- Preprocesado de datasets de imagen: borrar marcas de agua, logos o personas de fondo en lotes de fotos antes de usarlas en otros pipelines, aprovechando el throughput de ONNX Runtime en CUDA.
- Prototipado de herramientas de inpainting: sirve como referencia de cómo exportar un pipeline FLUX.2 a ONNX con cuantización 4 bits y atención fusionada, reutilizable para otras tareas de edición.
- Automatización de flujos de postproducción: integrado en scripts que detectan la región a eliminar (por ejemplo, con un detector de objetos) y llaman al modelo para rellenarla, con latencias de 70–100 s por eliminación en el hardware documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta medidas de latencia en hardware concreto: en una RTX 3070 Ti de portátil, una pasada del transformer a 1024×736 tarda unos 2,2 s y una eliminación completa entre 70 y 100 s.

## Requisitos de hardware

- VRAM estimada: unos 6 GB para el pipeline completo según el autor; el transformer cuantizado a 4 bits ocupa aproximadamente 2,18 GB en disco (`transformer.onnx.data`), el VAE encoder 138 MB y el decoder 199 MB.
- GPU recomendadas: NVIDIA con CUDA; el autor documenta funcionamiento en RTX 3070 Ti de portátil. No se especifican requisitos para A100 o H100, aunque deberían ser compatibles al usar ONNX Runtime con CUDA.
- GPU de consumo: sí, cabe en tarjetas con 8 GB o más de VRAM, siempre que se sigan las recomendaciones de memoria del autor (desactivar el memory pattern y configurar la arena CUDA con `kSameAsRequested`).
- Despliegue: ONNX Runtime con proveedor CUDA; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Gestión de memoria: cargar el encoder, el transformer y el decoder de uno en uno y cerrar cada sesión antes de abrir la siguiente, porque ONNX Runtime retiene la memoria de la sesión hasta cerrarla.
- Latencia y throughput: 2,2 s por pasada del transformer y 70–100 s por eliminación completa en RTX 3070 Ti de portátil, con 16 pasos de Euler y CFG 4.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAWmakase FLUX.2 klein object removal v1 | 4B | ONNX, transformer 4 bits | Imagen, lado largo 1024 px | Apache-2.0 | Hugging Face (luc-melaye) |
| FLUX.2 [klein] 4B base (Black Forest Labs) | 4B | Safetensors (diffusers) | Imagen, lado largo 1024 px | Apache-2.0 | Hugging Face (black-forest-labs) |
| fal/flux-2-klein-4B-object-remove-lora | LoRA sobre 4B | Safetensors (LoRA) | Imagen | Apache-2.0 | Hugging Face (fal) |

La comparación relevante es con sus propios componentes upstream: frente al modelo base en diffusers, esta exportación añade la funcionalidad de borrado de objetos y reduce los requisitos de VRAM gracias a la cuantización 4 bits y a la eliminación del codificador de texto en inferencia. Frente al LoRA de fal por separado, ofrece un artefacto único listo para ONNX Runtime, a costa de fijar el prompt y el caso de uso. No se dispone de datos de benchmarks para comparar calidad con alternativas de inpainting de otros fabricantes.

## Limitaciones y advertencias

- El prompt está fijado y embebido: solo funciona para la tarea de eliminar el objeto resaltado; no admite instrucciones de edición libres ni otros idiomas.
- El codificador de texto no se incluye, por lo que no es posible cambiar el prompt sin recalcular `prompt.f16` con Qwen3-4B.
- La calidad del resultado depende de la máscara: el autor documenta que la caja se escala a 1024 px de lado largo y solo se conserva la zona editada.
- Riesgo de alucinación visual: como todo modelo generativo, puede rellenar la región con contenido plausible pero incorrecto (texturas, estructuras o personas inconsistentes).
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo de difusión general puede reproducir los sesgos del dataset de entrenamiento original, no detallado en la model card.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige conservar la atribución de `NOTICE` y la licencia al redistribuir; los pesos originales son de Black Forest Labs y el LoRA de fal.
- Caveats de producción: ONNX Runtime retiene la memoria de cada sesión hasta cerrarla, hay que desactivar el memory pattern y usar `kSameAsRequested` en la arena CUDA para no superar los 8 GB tras la primera pasada, y conviene cargar los tres grafos de forma secuencial.
- Sin benchmarks publicados: no hay métricas de calidad (FID, LPIPS u otras) que permitan comparar objetivamente con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luc-melaye/rawmakase-flux-klein-remove
- Modelo base FLUX.2 [klein] 4B base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Modelo FLUX.2 [klein] 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- LoRA de eliminación de objetos de fal: https://huggingface.co/fal/flux-2-klein-4B-object-remove-lora
- Script de exportación (árbol de código de RAWmakase): `scripts/models/export_flux_klein_remove.py`
