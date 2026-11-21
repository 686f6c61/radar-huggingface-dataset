# PoochieMama/trellis2-cars-lora-v2

## Resumen

TRELLIS.2-cars-lora-v2 es un adaptador LoRA de tipo PEFT publicado por el usuario PoochieMama sobre el modelo base microsoft/TRELLIS.2-4B, concretamente sobre el checkpoint del flujo de estructura dispersa `ss_flow_img_dit_1_3B_64_bf16`. El adaptador está especializado en la generación image-to-3D de coches de fundición (diecast), un dominio muy concreto dentro de la reconstrucción y generación de mallas 3D a partir de imágenes.

El modelo no es un LLM ni un modelo de lenguaje: es un adaptador de ajuste fino de bajo rango (rank 8, alpha 16) que modifica el comportamiento del DiT (Diffusion Transformer) del pipeline TRELLIS.2 para que las muestras generadas se ajusten a la estética y geometría de coches de juguete. Se entrenó con la herramienta `trellis2-train` sobre el dataset PoochieMama/diecast-cars-trellis2-latents-v2, con 1200 pasos a batch 4 x 4 y learning rate 0.0001.

Es relevante ahora porque demuestra el flujo de personalización de modelos generativos 3D de gran tamaño mediante LoRA, una técnica que reduce drásticamente el coste de adaptar pipelines de image-to-3D a dominios específicos sin reentrenar el modelo base de 4B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre DiT de flujo de estructura dispersa (TRELLIS.2) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors bf16) |
| Idiomas soportados | no disponible (modelo image-to-3D, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`ss_lora/adapter-<step>.safetensors`) + config.json |

## Arquitectura y entrenamiento

El adaptador se inyecta en el flujo `ss_flow_img_dit_1_3B_64_bf16` del modelo base TRELLIS.2-4B, un Diffusion Transformer que opera sobre una representación de estructura dispersa (sparse structure) para generar geometría 3D a partir de imágenes. El LoRA tiene rango 8 y alpha 16, y se aplica a los módulos `to_qkv`, `to_out`, `to_q`, `to_kv`, `mlp.mlp.0` y `mlp.mlp.2`, es decir, a las proyecciones de atención y a las capas MLP del bloque transformer.

El entrenamiento se realizó con `trellis2-train` sobre el dataset de latentes `PoochieMama/diecast-cars-trellis2-latents-v2`, durante 1200 pasos con batch efectivo de 4 x 4 y learning rate 0.0001. Se publican checkpoints cada 400 pasos en la carpeta `ss_lora/`. No se dispone de información sobre la composición exacta del dataset, el número de tokens o muestras, ni sobre el uso de técnicas de alineación adicionales.

## Capacidades

- Generación image-to-3D especializada en coches de fundición (diecast) a partir de una o varias imágenes de entrada.
- Adaptación del flujo de estructura dispersa del DiT de TRELLIS.2 para producir geometrías con la estética del dominio entrenado.
- Integración mediante PEFT: se carga con `peft.LoraConfig` y `inject_adapter_in_model` sobre el flujo del modelo base.
- No dispone de capacidades de texto, razonamiento, código, matemáticas, visión general, tool calling ni agentes.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Generación de assets 3D para videojuegos: el adaptador permite producir mallas de coches de juguete a partir de fotografías, integrándose en pipelines de creación de assets para motores como Unity o Unreal.
- Catalogación de colecciones de diecast: a partir de fotos de un coche de fundición se puede generar su malla 3D para documentación, venta o visualización en catálogos digitales.
- Prototipado rápido de diseños de coches de juguete: los diseñadores pueden introducir bocetos o renders y obtener variantes 3D con la estética del dominio entrenado.
- Impresión 3D de miniaturas: generación de mallas listas para slicers y fabricación aditiva de coches a escala.
- Realidad aumentada y comercio electrónico: visualización 3D interactiva de productos de coleccionismo a partir de imágenes del vendedor.
- Investigación en personalización de modelos 3D: sirve como ejemplo reproducible de cómo aplicar LoRA a un DiT de image-to-3D con `trellis2-train` y un dataset de latentes propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco (decenas de MB en safetensors), pero requiere cargar el modelo base TRELLIS.2-4B para funcionar.
- VRAM estimada para inferencia: no disponible en la información proporcionada; dependerá del checkpoint base de 4B y del pipeline de TRELLIS.2.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (4B) se requiere previsiblemente una GPU con al menos 16-24 GB de VRAM, pero este dato no está confirmado en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga mediante PEFT (`inject_adapter_in_model` + `set_peft_model_state_dict`) sobre el pipeline de TRELLIS.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros adaptadores LoRA comparables ni benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría (image-to-3D especializado en vehículos).

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre coches de fundición; su rendimiento fuera de ese dominio es incierto y probablemente degradado.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base microsoft/TRELLIS.2-4B y del adaptador antes de usarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos ni evaluación de calidad de las mallas generadas.
- Riesgo de alucinación geométrica: como todo modelo generativo 3D, puede producir geometrías plausibles pero incorrectas respecto a la imagen de entrada.
- No hay información sobre el dataset de entrenamiento (tamaño, procedencia, posibles sesgos de dominio).
- Al ser un adaptador PEFT, requiere emparejarlo con la versión exacta del checkpoint base (`ss_flow_img_dit_1_3B_64_bf16`) para evitar incompatibilidades.

## Enlaces

- [Hugging Face: PoochieMama/trellis2-cars-lora-v2](https://huggingface.co/PoochieMama/trellis2-cars-lora-v2)
- [Dataset: PoochieMama/diecast-cars-trellis2-latents-v2](https://huggingface.co/datasets/PoochieMama/diecast-cars-trellis2-latents-v2)
- [Modelo base: microsoft/TRELLIS.2-4B](https://huggingface.co/microsoft/TRELLIS.2-4B)
