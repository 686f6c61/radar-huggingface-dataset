# JoshHughes/p0pc0rn-video-lora-looks-c20

## Resumen

p0pc0rn-video-lora-looks-c20 es un adaptador LoRA de estilo para vídeo-a-vídeo (video-to-video) entrenado sobre el modelo de generación de vídeo SANA-Video 2.0 5B de NVIDIA, en su variante de 720p y 4 pasos. Lo publica Josh Hughes como parte de su aplicación on-device p0pc0rn, que ejecuta generación de imagen, vídeo y audio mediante WebGPU directamente en el teléfono. El adaptador permite re-renderizar un clip existente en uno de 20 estilos visuales ("looks") distintos, partiendo de un primer fotograma restilizado con FLUX.2 [klein] 4B.

No se trata de un modelo completo, sino de un adaptador de bajo rango que se aplica sobre los pesos del DiT de SANA-Video 2.0 sin modificarlos. El repositorio contiene una conversión específica del LoRA original (`JoshHughes/sana-video2-style-v2v-lora`, paso 1500) a un formato propietario denominado `pocketflux.pack/1`, optimizado para el motor WebGPU de la aplicación: pesos en fp16, alpha y rank plegados en la matriz B, rank ampliado a 32 y reorganizado en 33 fragmentos, uno por bloque del DiT más un fragmento global.

Su relevancia es doble: por un lado, demuestra la viabilidad de ejecutar adaptadores de vídeo de difusión en hardware móvil mediante WebGPU; por otro, ilustra un patrón de distribución de pesos empaquetados con verificación criptográfica por fragmentos (sha256 cada 16 MiB) y gestión explícita de licencias de terceros antes de la descarga. El tamaño total del repositorio es de 0,1 GB (64 MB en 33 fragmentos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre DiT de SANA-Video 2.0 5B |
| Parámetros totales | no disponible (adaptador de 64 MB en fp16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (conversión desde fp32 original); rank ampliado a 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Copyright 2026 Josh Hughes) |
| Formato de pesos | `pocketflux.pack/1` (manifest.json + 33 fragmentos safetensors); no es un checkpoint de Transformers, Diffusers ni NeMo |

## Arquitectura y entrenamiento

El adaptador es un LoRA de estilo aplicado sobre el transformer de difusión (DiT) de SANA-Video 2.0 5B, un modelo de generación de vídeo de NVIDIA con licencia Apache 2.0. Concretamente, los módulos afectados son `attn.qkv`, `attn.output_gate`, `attn.proj`, `cross_attn.q_linear` y `cross_attn.proj` de cada bloque del DiT, además de un módulo global (`lora.global`, correspondiente a `t_block.1`). La operación en inferencia es `y = W x + B'(A x)`, sin modificar los pesos base del modelo de vídeo.

El entrenamiento se realizó sobre el LoRA original `JoshHughes/sana-video2-style-v2v-lora` hasta el paso 1500, orientado a la tarea de restilizado vídeo-a-vídeo: dado un primer fotograma restilizado con FLUX.2 [klein] 4B, el modelo re-renderiza el clip completo en uno de 20 estilos predefinidos. La model card del adaptador original contiene los detalles de entrenamiento, evaluación y ejemplos, pero no se reproducen en este repositorio. La conversión aplicada aquí incluye: paso de fp32 a fp16, plegado de alpha y rank en la matriz B, padding del rank hasta 32, y reorganización en un fragmento por bloque del DiT más el fragmento global, todo ello para encajar en el motor WebGPU de p0pc0rn. No se dispone de información sobre el número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Restilizado de vídeo (video-to-video): re-renderiza un clip existente en uno de 20 estilos visuales ("looks") predefinidos.
- Generación condicionada por primer fotograma: utiliza un primer frame restilizado con FLUX.2 [klein] 4B como ancla de estilo.
- Ejecución on-device en WebGPU: el adaptador está empaquetado para correr en el motor WebGPU de la app p0pc0rn, sobre el modelo SANA-Video 2.0 5B 720p 4-step.
- Inferencia en 4 pasos: hereda la configuración de destilación del modelo base (4-step), lo que reduce el coste computacional por clip.
- Verificación de integridad: el manifiesto incluye sha256 por archivo y por cada fragmento de 16 MiB, comprobado durante la descarga.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un adaptador de difusión de vídeo, no un modelo de lenguaje.
- Capacidades multilingües: no aplica (no procesa texto de forma directa; el codificador de texto es Gemma 2 del modelo base).

## Casos de uso

- Restilizado de clips para redes sociales: el adaptador permite tomar un vídeo corto grabado o generado y re-renderizarlo en uno de los 20 estilos disponibles, útil para producir variantes visuales de un mismo contenido sin reentrenar.
- Previsualización de estilos en apps móviles: integrado en p0pc0rn, el usuario puede aplicar un look a un clip y verlo renderizado en el dispositivo, sin subir el vídeo a un servidor, lo que reduce latencia y preserva la privacidad.
- Prototipado rápido de dirección de arte: un estudio puede generar varias versiones estilizadas de un mismo clip para comparar direcciones visuales antes de producir el render final.
- Demo técnica de inferencia de difusión de vídeo en WebGPU: sirve como referencia para desarrolladores que quieran empaquetar adaptadores LoRA de vídeo para ejecución en navegador o móvil con verificación de integridad por fragmentos.
- Integración en pipelines de generación de vídeo con SANA-Video 2.0: al ser un adaptador sobre el DiT, puede combinarse con el modelo base en flujos que ya usen SANA-Video 2.0 5B 720p 4-step para añadir control de estilo.
- Educación y experimentación con LoRAs de vídeo: el repositorio documenta la conversión de fp32 a fp16, el plegado de alpha/rank y la reorganización por bloques, lo que lo convierte en un ejemplo práctico de adaptación de un LoRA de difusión a un formato de despliegue concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador en sí ocupa 64 MB en fp16, pero requiere cargar el modelo base SANA-Video 2.0 5B (5B parámetros) y sus componentes auxiliares (codificador de texto Gemma 2 y VAE de vídeo LTX-2.3).
- GPU recomendadas: no disponible. El adaptador está diseñado para ejecutarse en el motor WebGPU de p0pc0rn sobre hardware móvil, pero no se especifican modelos de GPU concretos.
- ¿Cabe en GPU consumer? No disponible. El adaptador es pequeño, pero el modelo base de 5B y el VAE condicionan el requisito total.
- Opciones de despliegue: exclusivamente el motor WebGPU de la app p0pc0rn; el formato `pocketflux.pack/1` no es compatible con vLLM, llama.cpp, Ollama, TGI, Diffusers ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| p0pc0rn-video-lora-looks-c20 | LoRA de estilo v2v sobre SANA-Video 2.0 5B | adaptador de 64 MB (fp16) | no aplica | Apache 2.0 | `pocketflux.pack/1`, solo motor p0pc0rn |
| JoshHughes/sana-video2-style-v2v-lora | LoRA de estilo v2v original (paso 1500) | no disponible | no aplica | no disponible en la información | safetensors fp32 |
| SANA-Video 2.0 5B 720p 4-step | Modelo base de generación de vídeo (DiT) | 5B | no disponible | Apache 2.0 | checkpoint del modelo base |

No se dispone de información sobre benchmarks comparativos ni sobre otros adaptadores de estilo de vídeo comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base SANA-Video 2.0 5B 720p 4-step, el codificador de texto Gemma 2 y el VAE LTX-2.3 para funcionar.
- Formato propietario: solo lo lee el motor WebGPU de p0pc0rn; no es cargable con Diffusers, Transformers ni NeMo, lo que limita su reutilización fuera de esa app.
- Licencias de terceros: aunque el adaptador es Apache 2.0, el codificador de texto Gemma 2 se rige por los Gemma Terms of Use y el VAE LTX-2.3 por la LTX-2 Community License Agreement; la app muestra y exige aceptación antes de la descarga.
- Contenido para adultos: el nombre del pack ("p0pc0rn") y su propósito indican un uso orientado a contenido adulto; conviene revisar las políticas de la plataforma de destino y la legislación aplicable.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; al ser un modelo generativo de vídeo, puede producir artefactos visuales o inconsistencias temporales.
- Idiomas: no se especifican idiomas soportados; el comportamiento multilingüe depende del codificador de texto del modelo base.
- Sin benchmarks: no hay métricas publicadas de calidad, fidelidad de estilo ni consistencia temporal en este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-04; madurez y soporte de la comunidad no verificables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoshHughes/p0pc0rn-video-lora-looks-c20
- LoRA original: https://huggingface.co/JoshHughes/sana-video2-style-v2v-lora
- Modelo base: https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p_4step
- App p0pc0rn: https://artistjoshhughes.github.io/p0pc0rn/
- X oficial de p0pc0rn: https://x.com/p0pc0rnapp
- X de Josh Hughes: https://x.com/joshhughes___
