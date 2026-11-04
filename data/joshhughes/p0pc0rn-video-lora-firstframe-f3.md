# JoshHughes/p0pc0rn-video-lora-firstframe-f3

## Resumen

p0pc0rn-video-lora-firstframe-f3 es un adaptador LoRA de tipo first-frame (f3) para el modelo de generación de vídeo SANA-Video 2.0 5B 720p 4-step de NVIDIA. Lo publica Josh Hughes (JoshHughes) como parte del paquete de modelos de su aplicación on-device p0pc0rn, que ejecuta generación de imagen, vídeo y audio directamente en el navegador del móvil mediante WebGPU. El adaptador permite generar clips de vídeo a partir de una imagen inicial y también interpolaciones entre dos imágenes (primer y último fotograma).

Técnicamente no es un modelo completo: es un adaptador de bajo rango (LoRA) de 64 MB distribuido en 33 shards, convertido desde el checkpoint original en fp32 a fp16, con el escalado alpha/rango plegado en la matriz B y el rango ampliado a 32. Se aplica sobre las capas de atención del DiT de SANA-Video 2.0 (attn.qkv, attn.output_gate, attn.proj, cross_attn.q_linear y cross_attn.proj de cada bloque) sin modificar los pesos del modelo base.

Su relevancia es doble: por un lado, demuestra que la personalización de modelos de vídeo de 5B puede empaquetarse en un adaptador de decenas de megabytes; por otro, introduce un formato propietario de distribución (`pocketflux.pack/1`) con verificación criptográfica por chunks de 16 MiB, pensado para descarga fiable y ejecución en dispositivos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre DiT de SANA-Video 2.0 5B |
| Parámetros totales | no disponible (adaptador de 64 MB en fp16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (el original se distribuye en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Copyright 2026 Josh Hughes) |
| Formato de pesos | safetensors, empaquetado en formato propietario `pocketflux.pack/1` (33 shards) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre SANA-Video 2.0 5B 720p 4-step, un modelo de difusión de vídeo de NVIDIA que genera clips a 720p en 4 pasos de muestreo. La LoRA se inyecta en cinco proyecciones por bloque del DiT: `attn.qkv`, `attn.output_gate`, `attn.proj`, `cross_attn.q_linear` y `cross_attn.proj`. La operación en inferencia es `y = W x + B'(A x)`, de modo que los pesos del modelo base permanecen intactos y el adaptador se suma en tiempo de ejecución.

La conversión documentada en la model card incluye: paso de fp32 a fp16, plegado de alpha/rango en la matriz B, ampliación del rango a 32, un shard por bloque del DiT más `lora.global` (t_block.1) y reordenación de los tensores para el motor WebGPU de p0pc0rn. El checkpoint de origen es `JoshHughes/sana-video2-firstframe-lora`, step 1000, con sha256 `b5037ad2e446196e14c814f91eaec5e32cba720480280fab5c01851aafacdab2`. No se detallan en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de una única imagen inicial (first-frame).
- Generación de vídeo entre dos imágenes (primer y último fotograma), es decir, interpolación temporal condicionada.
- Personalización estilística o de contenido sobre SANA-Video 2.0 sin reentrenar el modelo base.
- Ejecución on-device en WebGPU dentro de la app p0pc0rn, sin servidor.
- Verificación de integridad por sha256 a nivel de pack y de chunk de 16 MiB.
- No soporta tool calling ni function calling (es un adaptador de difusión, no un LLM).
- No se documentan capacidades multilingües, de audio ni de razonamiento multi-paso.

## Casos de uso

- Generación de clips cortos desde una foto en el móvil: el usuario selecciona una imagen y el adaptador produce una animación de vídeo coherente con ese primer fotograma, ejecutándose en WebGPU sin subir datos a la nube.
- Interpolación entre dos imágenes (keyframing): útil para crear transiciones suaves entre dos estados visuales, por ejemplo en animación de storyboards o previsualización de secuencias.
- Prototipado rápido de animaciones para redes sociales: clips de 720p generados en 4 pasos, adecuados para iterar sobre ideas antes de producir con herramientas de mayor coste.
- Previsualización de motion graphics en producción audiovisual: generar un borrador animado a partir de un frame clave para validar ritmo y composición con el cliente.
- Aplicaciones educativas o de demostración de IA generativa on-device: el pack incluye verificación criptográfica y gestión de licencias, lo que facilita distribuirlo en apps que deben cumplir con acuerdos de licencia de terceros.
- Investigación sobre adaptadores de bajo rango en modelos de difusión de vídeo: el formato y la conversión documentada permiten estudiar el efecto de plegar alpha/rango y reducir precisión a fp16 en la calidad final.
- Distribución de contenido personalizado en apps móviles: el tamaño de 64 MB y la descarga por chunks verificados facilitan actualizaciones incrementales del adaptador sin rehacer el modelo base de varios gigabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 64 MB en fp16, pero requiere cargar el modelo base SANA-Video 2.0 5B 720p 4-step, cuyos requisitos de VRAM no se detallan en la información disponible.
- Diseñado para ejecución on-device mediante WebGPU en navegador de móvil; no se especifican GPU de escritorio recomendadas.
- No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI (son herramientas para LLM; este es un adaptador de difusión de vídeo).
- El motor de inferencia previsto es el motor WebGPU propietario de p0pc0rn; no es un checkpoint de Transformers, Diffusers ni NeMo.
- No se publican latencias ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p0pc0rn-video-lora-firstframe-f3 | LoRA sobre SANA-Video 2.0 5B | adaptador de 64 MB (base 5B) | no disponible | Apache 2.0 | HuggingFace, formato propietario |
| JoshHughes/sana-video2-firstframe-lora | LoRA original (fp32) sobre SANA-Video 2.0 5B | adaptador (tamaño no disponible) | no disponible | no disponible en la información | HuggingFace |
| SANA-Video 2.0 5B 720p 4-step | Modelo base de difusión de vídeo | 5B | no disponible | Apache 2.0 | HuggingFace (Efficient-Large-Model) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin el modelo base SANA-Video 2.0 5B y su VAE no genera nada.
- El formato `pocketflux.pack/1` es propietario y solo lo lee el motor WebGPU de p0pc0rn; no es directamente utilizable con Diffusers, Transformers o ComfyUI.
- La licencia Apache 2.0 cubre el adaptador, pero el modelo base, el text encoder Gemma 2 (Gemma Terms of Use) y el VAE LTX-2.3 (LTX-2 Community License Agreement) mantienen sus propias licencias y restricciones, que la app muestra antes de la descarga.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas del adaptador.
- Al ser un LoRA de primer fotograma, la coherencia temporal y la fidelidad al frame inicial pueden degradarse en clips largos o con movimientos complejos; no se aportan métricas al respecto.
- El contenido generado puede reproducir sesgos del dataset de entrenamiento del modelo base; no se detalla la composición de dicho dataset.
- El nombre del repositorio sugiere un uso orientado a contenido para adultos; conviene revisar las políticas de la plataforma de destino y las condiciones de uso de los modelos base antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoshHughes/p0pc0rn-video-lora-firstframe-f3
- LoRA de origen: https://huggingface.co/JoshHughes/sana-video2-firstframe-lora
- Modelo base: https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p_4step
- App p0pc0rn: https://artistjoshhughes.github.io/p0pc0rn/
- X oficial de la app: https://x.com/p0pc0rnapp
- X del autor: https://x.com/joshhughes___
