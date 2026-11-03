# NidAll/Fibo-2.0-edit-IDM-2steps-ComfyUI

## Resumen
Fibo-2.0-edit-IDM-2steps-ComfyUI es una conversión de formato para ComfyUI del adaptador LoRA `akhaliq/Fibo-2.0-edit-IDM-2steps`, un adaptador que permite ejecutar el modelo de edición de imagen Bria Fibo 2.0 Edit Turbo en solo 2 pasos de muestreo y sin CFG (classifier-free guidance). El adaptador original fue entrenado con una implementación comunitaria de Intrinsic Distribution Matching (IDM), una técnica de destilación descrita en el paper arXiv:2610.39633. Este repositorio no entrena nada: solo reorganiza los pesos del LoRA para que el modelo nativo Fibo 2 de ComfyUI pueda cargarlos.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional nuevo, sino de un artefacto de interoperabilidad entre el ecosistema diffusers (donde se publicó el LoRA original) y ComfyUI (donde muchos usuarios de edición de imagen trabajan). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,8 GB, coherente con un LoRA en bf16 con relleno de ceros.

La licencia es la de Bria Fibo (CC BY-NC 4.0, solo uso no comercial), lo que condiciona fuertemente cualquier despliegue en producción. El idioma declarado es inglés y la tarea es image-to-image (edición de imagen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Bria Fibo 2.0 Edit Turbo; pesos en formato ComfyUI con capas fusionadas (`qkv`, `to_kv`, `to_out`, `w13`) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base no se detalla en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | El LoRA se distribuye en bf16; los checkpoints base de Comfy-Org referenciados incluyen variantes `int8_convrot` y `bf16` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Bria Fibo (`bria-fibo`), enlazada a CC BY-NC 4.0; solo uso no comercial, uso comercial requiere acuerdo con Bria AI |
| Formato de pesos | safetensors (ComfyUI LoRA: `diffusion_model.*`, `lora_down`/`lora_up`/`alpha`), bf16 |

## Arquitectura y entrenamiento
El artefacto es un LoRA de rango 64 con alpha 64 (escala 1.0) que adapta el modelo de difusión Bria Fibo 2.0 Edit Turbo para operar en 2 pasos sin CFG. El entrenamiento original se realizó con una implementación comunitaria de Intrinsic Distribution Matching (IDM), una técnica de destilación few-step descrita en el paper arXiv:2610.39633 (Liu et al., 2026). Este repositorio concreto no aporta entrenamiento propio: es una conversión de nombres y fusión de capas.

La conversión es técnicamente relevante porque ComfyUI fusiona capas que en diffusers están separadas. Las proyecciones `attention.to_q`/`to_k`/`to_v` se unifican en `attention.qkv` (rango 192), `to_out.0` en `attention.out`, las proyecciones `to_k`/`to_v` de atención cruzada y propia en `to_kv` (rango 128), y `feed_forward.w1`/`w3` y `ffn.w1`/`w3` en `w13` (rango 128). Cada capa fusionada recibe un LoRA cuyo rango es la suma de sus partes, con pesos up en bloque diagonal y alpha igual a ese rango, de modo que la escala efectiva se mantiene en 1.0 como en el original. Además, el checkpoint de ComfyUI rellena con ceros el ancho oculto del FFN de 9536 a 9728, y el LoRA se rellena igual para coincidir. Los deltas de pesos fusionados coinciden exactamente con el original; el archivo resultante pesa 797 MB frente a los 539 MB del original solo por los bloques de ceros.

## Capacidades
- Edición de imagen image-to-image sobre el modelo base Bria Fibo 2.0 Edit Turbo.
- Muestreo en 2 pasos sin CFG (CFG 1.0), lo que reduce coste de inferencia frente a pipelines multi-paso con guidance.
- Integración nativa con ComfyUI mediante `LoraLoaderModelOnly` a fuerza 1.0.
- Compatibilidad exclusiva con checkpoints Fibo 2 en disposición fusionada de ComfyUI (por ejemplo `fibo2_edit_turbo_int8_convrot.safetensors` o `fibo2_edit_turbo_bf16.safetensors` de Comfy-Org/Fibo-2.0).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto: es un adaptador de difusión de imagen.
- Capacidad multilingüe: no aplica; el modelo declara únicamente inglés.

## Casos de uso
- Edición de imágenes por lotes en ComfyUI: al requerir solo 2 pasos sin CFG, permite procesar grandes volúmenes de imágenes con menor coste computacional que un pipeline estándar con guidance.
- Prototipado rápido de flujos de edición: útil para iterar sobre prompts e imágenes de entrada en un grafo de ComfyUI sin esperar muestreos largos.
- Integración en estudios de diseño que ya usan ComfyUI como herramienta principal, evitando migrar al pipeline diffusers del LoRA original.
- Evaluación comparativa de técnicas de destilación few-step: sirve como referencia práctica de IDM aplicado a edición de imagen en un entorno de nodos.
- Docencia y experimentación con LoRAs fusionados: el script `convert_fibo2_lora.py` incluido permite estudiar cómo se mapean capas diffusers a ComfyUI.
- Generación de variaciones controladas de imagen en entornos de investigación no comercial, dado que la licencia CC BY-NC 4.0 lo restringe a ese ámbito.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del checkpoint base Fibo 2.0 Edit Turbo cargado (bf16 o int8), no del LoRA, que solo añade ~0,8 GB de pesos.
- GPU recomendadas: no disponible. El modelo base no se detalla en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el checkpoint base, no por este adaptador.
- Opciones de despliegue: ComfyUI (nativo, con `LoraLoaderModelOnly`); el LoRA original en diffusers para pipelines diffusers.
- Latencia y throughput: no disponibles. El autor indica que el muestreo se realiza en 2 pasos con CFG 1.0, lo que reduce el número de evaluaciones del modelo frente a pipelines multi-paso, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | CFG | Licencia | Formato |
|---|---|---|---|---|---|
| Fibo-2.0-edit-IDM-2steps-ComfyUI (este) | LoRA sobre Fibo 2.0 Edit Turbo | 2 | 1.0 | Bria Fibo / CC BY-NC 4.0 | safetensors ComfyUI |
| akhaliq/Fibo-2.0-edit-IDM-2steps | LoRA original sobre Fibo 2.0 Edit Turbo | 2 | 1.0 | Bria Fibo / CC BY-NC 4.0 | safetensors diffusers |
| Bria Fibo 2.0 Edit Turbo (base) | Modelo de edición de imagen | No disponible | No disponible | Bria Fibo | No disponible |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Licencia CC BY-NC 4.0: uso exclusivamente no comercial; cualquier uso comercial requiere un acuerdo separado con Bria AI.
- El archivo no es compatible con checkpoints Fibo 2 que mantengan `w1`/`w3` o `to_q`/`to_k`/`to_v` como capas separadas; para esos casos debe usarse el LoRA original en diffusers.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-03), por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Es una conversión de formato, no un modelo entrenado: cualquier mérito o defecto de calidad proviene del adaptador original y del modelo base.
- El relleno de ceros en el FFN (de 9536 a 9728) y los bloques diagonales incrementan el tamaño del archivo (797 MB frente a 539 MB) sin cambiar los deltas efectivos, pero complican la inspección manual de los pesos.
- Idioma declarado únicamente inglés; no se garantiza comportamiento en otros idiomas.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base, no documentado en la información proporcionada.
- No se aportan datos de benchmarks, latencia ni requisitos de hardware, lo que impide evaluar su idoneidad para producción sin pruebas propias.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/NidAll/Fibo-2.0-edit-IDM-2steps-ComfyUI
- LoRA original: https://huggingface.co/akhaliq/Fibo-2.0-edit-IDM-2steps
- Modelo base Bria Fibo 2.0 Edit Turbo: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Checkpoints para ComfyUI: https://huggingface.co/Comfy-Org/Fibo-2.0
- Paper Intrinsic Distribution Matching: https://huggingface.co/papers/2610.39633
- arXiv del paper: https://arxiv.org/abs/2610.39633
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Bria AI (acuerdos comerciales): https://bria.ai
