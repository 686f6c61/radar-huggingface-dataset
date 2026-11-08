# mlx-community/FlowUpscaler-bf16

## Resumen

FlowUpscaler es un modelo de superresolución que opera directamente en el espacio latente de FLUX.2, no en píxeles. Se trata de una U-Net de atención libre con 59 millones de parámetros (bloques ResNet estilo SDXL, GroupNorm y condicionamiento FiLM a partir de los latentes de baja resolución) que predice una velocidad y se aplica en un único paso de flujo rectificado desde ruido. Fue destilado a partir de generaciones de FLUX.2 klein-4B a 512 → 1024 píxeles, y encadenando dos pasadas alcanza un factor ×4.

La versión aquí descrita, `mlx-community/FlowUpscaler-bf16`, es una conversión a bf16 (118,6 MB) de los pesos originales de `TensorForger/FlowUpscaler`, pensada para su uso con el framework MLX de Apple. Los pesos y el código de referencia se publican bajo la licencia Unlicense (dominio público), por lo que no hay restricciones de uso comercial.

Su relevancia radica en que permite ampliar latentes de FLUX.2 de forma muy económica (un solo paso de flujo rectificado) sin necesidad de un decodificador VAE adicional ni de un modelo generativo completo, lo que lo hace útil en pipelines de generación de imagen donde el coste computacional del upscaling importa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net sin atención (bloques ResNet estilo SDXL, GroupNorm, condicionamiento FiLM), flujo rectificado de un paso |
| Parámetros totales | 59 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | bf16 (esta conversión); fp32 en los pesos originales |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | Unlicense (dominio público) |
| Formato de pesos | safetensors (`flow_upscaler.safetensors`), diseños PyTorch OIHW conservados |

## Arquitectura y entrenamiento

El modelo es una U-Net de 59 M de parámetros sin mecanismos de atención, compuesta por bloques ResNet al estilo SDXL con GroupNorm y condicionamiento FiLM derivado de los latentes de baja resolución. Predice una velocidad que se integra en un único paso de flujo rectificado (t = 1000 → 0) partiendo de ruido gaussiano. Trabaja sobre latentes de FLUX.2 normalizados por batch-norm y sin patchificar (32 canales a 1/8 de resolución); el consumidor debe patchificar a 128 canales, restar la media running del VAE, dividir por la raíz de la varianza más 1e-4 y des-patchificar. Los latentes empaquetados que producen los DiT de FLUX.2 y FLUX 3 klein ya vienen normalizados, por lo que basta con des-patchificarlos.

El entrenamiento consistió en destilación a partir de generaciones de FLUX.2 klein-4B a 512 → 1024 píxeles. El modelo solo ha visto ese rango de escalado; una segunda pasada (hasta ×4) principalmente enfoca y añade nitidez, sin inventar estructura nueva. La conversión a bf16 conserva los nombres de claves y los diseños PyTorch originales (pesos de convolución OIHW), y el consumidor transpone al cargar. Frente a la referencia PyTorch en fp32 sobre una imagen de 1024² de FLUX.2 klein-4B ampliada a 2048² y decodificada con el VAE exacto de FLUX.2, estos pesos bf16 con cómputo en fp32 alcanzan 67,7 dB de PSNR (relL2 de latentes 2,8e-3); con cómputo en bf16, 60,3 dB.

## Capacidades

- Superresolución de latentes de FLUX.2 con factor ×2 en una sola pasada y ×4 encadenando dos pasadas.
- Operación en el espacio latente, sin decodificación intermedia a píxeles entre pasadas.
- Condicionamiento FiLM a partir de los latentes de baja resolución para guiar la ampliación.
- Compatibilidad con latentes empaquetados de los DiT de FLUX.2 y FLUX 3 klein (des-patchificar y usar).
- Integración con MLX mediante el paquete Swift `xocialize/flux2-vae-mlx-swift` (0.8.0+), con API `FlowUpscaler.load` y `upscalePacked`.
- Nodos de ComfyUI disponibles en el repositorio `tensorforger/comfyui-flow-upscaler`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de imagen.

## Casos de uso

- Ampliación de imágenes generadas con FLUX.2 klein-4B: se genera a 512 o 1024 píxeles y se aplica una o dos pasadas de FlowUpscaler para obtener 1024 o 2048 píxeles, aprovechando que fue destilado exactamente sobre ese dominio.
- Pipelines de generación de imagen en producción con MLX: al ser un modelo de 59 M de parámetros y 118,6 MB en bf16, se puede cargar y ejecutar en memoria unificada de equipos Apple sin desplazar el DiT principal.
- Integración en ComfyUI: mediante los nodos de `tensorforger/comfyui-flow-upscaler`, se inserta el upscaling latente como paso intermedio entre la generación y la decodificación final.
- Prototipado rápido en Swift/MLX: la API `upscalePacked` permite encadenar pasadas (`passes: 1` o `2`) y controlar la semilla, útil para experimentar con distintos niveles de ampliación.
- Reducción de coste en servidores de generación de imagen: al operar en latente y en un solo paso, evita ejecutar un modelo de superresolución en píxeles completo para cada imagen.
- Investigación sobre destilación de flujos rectificados: el modelo sirve como caso de estudio de destilación de un paso desde un DiT mayor (FLUX.2 klein-4B) a una U-Net pequeña sin atención.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| PSNR vs referencia PyTorch fp32 (bf16 con cómputo fp32, 2048²) | 67,7 dB |
| relL2 de latentes vs referencia (bf16 con cómputo fp32) | 2,8e-3 |
| PSNR vs referencia (bf16 con cómputo bf16) | 60,3 dB |
| Paridad del port Swift vs `upscaler_unet.py` (cos) | 1,0000000 |
| relL2 del port Swift (tamaños cuadrados, no cuadrados e impares) | 1,1e-6 |
| PSNR del port Swift sobre imagen decodificada 2048² | 126,9 dB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos en bf16 ocupan 118,6 MB, más el coste de los latentes de entrada y salida (32 canales a 1/8 de resolución).
- GPU recomendadas: no se especifican en la información disponible; el modelo está pensado para MLX (Apple Silicon) y para PyTorch en CPU/GPU.
- Cabe holgadamente en cualquier GPU de consumo e incluso en memoria unificada de equipos Apple; el cuello de botella es el VAE de FLUX.2 con el que se decodifica, no el upscaler.
- Opciones de despliegue: MLX vía `xocialize/flux2-vae-mlx-swift` (0.8.0+), PyTorch con `upscaler_unet.py` de referencia y nodos de ComfyUI (`tensorforger/comfyui-flow-upscaler`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito crítico: la decodificación debe hacerse con el VAE exacto de FLUX.2; la decodificación por teselas de diffusers normaliza cada tesela por separado y deja costuras y un tinte de color a estos tamaños.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Factor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowUpscaler (este) | U-Net latente, flujo rectificado de un paso | 59 M | ×2 (×4 encadenando) | Unlicense | Hugging Face, MLX, ComfyUI |
| RealPLKSR | Superresolución en píxeles | no disponible | no disponible | no disponible | no disponible |
| VOSR2 | Superresolución en píxeles | no disponible | no disponible | no disponible | no disponible |

Según la model card, en fotografías generales el modelo se sitúa entre RealPLKSR y VOSR2, y reescribe texto pequeño. No se dispone de más datos comparativos (parámetros, contexto, rendimiento) de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo ha visto el rango 512 → 1024; la segunda pasada hasta ×4 principalmente enfoca y no inventa estructura nueva.
- No es un upscaler de fotografía general: en fotos queda entre RealPLKSR y VOSR2 y reescribe texto pequeño, por lo que puede alterar contenido textual.
- Requiere decodificación con el VAE exacto de FLUX.2; la decodificación por teselas de diffusers produce costuras y tinte de color a 2048².
- Los latentes de entrada deben estar normalizados por batch-norm y sin patchificar; un preprocesado incorrecto degrada la salida.
- La conversión a bf16 introduce una pérdida medible: 60,3 dB de PSNR con cómputo en bf16 frente a 67,7 dB con cómputo en fp32 sobre los mismos pesos.
- No se han documentado sesgos específicos del modelo en la información disponible, aunque al derivarse de FLUX.2 klein-4B podría heredar sesgos de ese modelo base.
- Licencia Unlicense (dominio público): sin restricciones de uso comercial conocidas; se conserva el `LICENSE` original en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/FlowUpscaler-bf16
- Modelo base: https://huggingface.co/TensorForger/FlowUpscaler
- Nodos de ComfyUI: https://github.com/tensorforger/comfyui-flow-upscaler
- Port Swift/MLX: https://github.com/xocialize/flux2-vae-mlx-swift
- Organización MLX Community: https://huggingface.co/mlx-community
