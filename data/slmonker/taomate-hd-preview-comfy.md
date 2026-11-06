# slmonker/TaoMate-HD-preview-comfy

## Resumen

TaoMate-HD-preview-comfy es una conversión no oficial de los pesos LoRA del sampler progresivo de tres etapas TaoMate-HD, adaptados para funcionar dentro de ComfyUI sobre el modelo base MiniMax H3 de generación de vídeo con audio. El repositorio lo publica el usuario slmonker en Hugging Face y no constituye un modelo autónomo, sino un adaptador (adapter) que se carga junto al checkpoint de MiniMax H3 para habilitar el pipeline de muestreo TaoMate. El objetivo es permitir que la comunidad de ComfyUI utilice el sampler TaoMate-HD sin tener que manipular manualmente las claves del adaptador original.

El adaptador tiene 208 módulos, 624 tensores (`lora_A`, `lora_B` y `alpha` por módulo) y un tamaño de aproximadamente 2,48 GB en precisión FP32, con un valor de alpha fijado en 128 para preservar el escalado previsto por TaoMate. La conversión renombra las claves `lora_a` / `lora_b` del adaptador original al formato `lora_A` / `lora_B` que espera ComfyUI.

Su relevancia es acotada pero práctica: cubre el hueco entre el adaptador upstream de TaoMate-HD y el ecosistema ComfyUI, permitiendo T2VA (texto a vídeo con audio) y Ref2VA (referencia a vídeo con audio, experimental) mediante condicionamiento nativo `minimax_refs` de MiniMax H3. No implementa FL2VA ni máscaras de denoise.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax H3 |
| Parametros totales | no disponible (adaptador de 2.480.994.680 bytes en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 en el adaptador; se recomienda checkpoint H3 en int8/fp8 para GPUs de 32 GB |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (license: other) |
| Formato de pesos | safetensors (ComfyUI-compatible) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un transformer completo. Contiene 208 módulos con 624 tensores distribuidos en pares `lora_A` / `lora_B` y un valor `alpha` por módulo fijado en 128, lo que determina el escalado efectivo del adaptador. La conversión desde el adaptador upstream de TaoMate-HD consiste en renombrar las claves en minúsculas (`lora_a`, `lora_b`) al formato en mayúsculas que ComfyUI espera, preservando el alpha original. El adaptador debe aplicarse con `strength_model = 1.0`.

El modelo base MiniMax H3 es un generador audio-vídeo de MiniMax; el adaptador habilita el sampler progresivo de tres etapas de TaoMate-HD con `steps=3`, junto con un `MiniMaxH3SigmaShift` configurado con `shift_video=12` y `shift_audio=3`. No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens utilizados ni si hubo RLHF o DPO; la model card no los documenta.

## Capacidades

- Generación texto a vídeo con audio (T2VA) mediante el nodo nativo de MiniMax H3 image-to-video sin primer/último fotograma.
- Generación referencia a vídeo con audio (Ref2VA) mediante condicionamiento nativo `minimax_refs`, marcada como experimental.
- Muestreo progresivo TaoMate de tres etapas con `steps=3`.
- Integración en flujos ComfyUI mediante `LoraLoaderModelOnly` con `strength_model=1.0`.
- Desacoplamiento de latentes AV: el pipeline separa el latente audio-vídeo y aplica `VAEDecode` y `VAEDecodeAudio`.
- No implementa FL2VA (condicionamiento por primer y último fotograma) ni máscaras de denoise.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Generación de clips cortos con audio sincronizado en ComfyUI: el adaptador se carga sobre un checkpoint MiniMax H3 y se ejecuta el sampler TaoMate de tres etapas para producir vídeo con pista de audio en un único pipeline, útil para prototipado rápido de contenido audiovisual.
- Iteración de conceptos creativos: al requerir solo `steps=3`, el sampler permite ciclos de generación rápidos para explorar variaciones de una idea antes de un render final con el modelo base sin el adaptador.
- Vídeo condicionado por referencia (Ref2VA, experimental): adecuado para experimentación con consistencia de sujeto u objeto a partir de una imagen de referencia mediante `minimax_refs`, en entornos de investigación.
- Automatización de pipelines en ComfyUI: el adaptador se integra como nodo en flujos existentes, permitiendo encadenar generación AV con otros nodos de postprocesado o upscaling dentro de la misma interfaz.
- Evaluación comparativa del sampler TaoMate frente al muestreo nativo de MiniMax H3: al ser un adaptador aislado, permite A/B testing con y sin el LoRA manteniendo el mismo checkpoint base.
- Despliegue en estaciones con GPU de 32 GB: la recomendación de checkpoint int8/fp8 permite ejecutar el pipeline en GPUs de gama profesional de 32 GB, facilitando pruebas locales sin clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la model card recomienda un checkpoint H3 en int8/fp8 para GPUs de 32 GB.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU de 32 GB para el checkpoint cuantizado.
- ¿Cabe en GPU consumer? No hay datos que lo confirmen; el adaptador por sí solo ocupa 2,48 GB en FP32, pero el modelo base MiniMax H3 determina el consumo real.
- Opciones de despliegue: ComfyUI con `LoraLoaderModelOnly`, `MiniMaxH3SigmaShift`, `TaoMate HD Progressive Sampler`, `Separate AV Latent`, `VAEDecode` y `VAEDecodeAudio`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TaoMate-HD-preview-comfy | LoRA sobre MiniMax H3 | Adaptador de 2,48 GB FP32 | no disponible | minimax-h3-community | Hugging Face (ComfyUI) |
| Adaptador upstream TaoMate-HD | LoRA original | no disponible | no disponible | no disponible | GitHub TaoLiveAIGC |
| MiniMax H3 (base) | Modelo audio-vídeo | no disponible | no disponible | minimax-h3-community | Hugging Face MiniMaxAI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial de la comunidad; no cuenta con el respaldo de Alibaba TaoLive AIGC ni de MiniMax.
- No implementa FL2VA (primer/último fotograma) ni máscaras de denoise, lo que limita el control fino sobre la generación.
- Ref2VA está marcada como experimental y requiere un checkpoint H3 con capacidad Ref2VA o híbrido.
- El adaptador debe usarse a `strength_model = 1.0`; otros valores alteran el escalado previsto (alpha 128).
- No se debe cargar el `adapter_model.safetensors` upstream directamente en ComfyUI; hay que usar esta conversión.
- El uso comercial queda sujeto a la MiniMax H3 Community License Agreement; es necesario revisar LICENSE y NOTICE antes de producción.
- No hay información sobre sesgos, riesgo de alucinación visual o limitaciones idiomáticas del modelo base en la documentación disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/slmonker/TaoMate-HD-preview-comfy
- Repositorio ComfyUI del adaptador: https://github.com/slmonker/ComfyUI-TaoMateHD
- TaoMate-HD upstream: https://github.com/TaoLiveAIGC/TaoMate-HD
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
