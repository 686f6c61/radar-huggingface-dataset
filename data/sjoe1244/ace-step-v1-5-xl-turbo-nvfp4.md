# sjoe1244/ACE-Step-v1.5-xl-turbo-nvfp4

## Resumen

ACE-Step-v1.5-xl-turbo-nvfp4 es una cuantización en formato NVFP4 del modelo de generación musical ACE-Step/acestep-v15-xl-turbo, publicada por el usuario sjoe1244. Se trata de un modelo de difusión (DiT) de 4B parámetros con muestreo turbo de 8 pasos, orientado a la síntesis de audio y música a partir de texto (text-to-audio) y letras. La cuantización reduce el peso en disco de 10 GB (bf16) a 3,1 GB, y está pensada específicamente para su uso en ComfyUI sobre GPUs NVIDIA Blackwell (serie RTX 50).

Su relevancia radica en que permite ejecutar un modelo de música de gama alta en hardware de consumo con una huella de VRAM notablemente menor: unos 5,2 GB de pico en render sin planificador, frente a los 10,5 GB de la versión bf16. Se mantiene la licencia MIT del modelo original. El autor documenta que el espectro medio se conserva dentro de aproximadamente 1 dB respecto a bf16 y que la correlación de forma de onda es de 0,93 en una semilla compartida.

Conviene subrayar que no es un LLM de propósito general, sino un modelo generativo de audio. Su uso depende del ecosistema ComfyUI con comfy-kitchen y de una compilación de PyTorch para CUDA 13.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de 4B con planificador basado en modelo de lenguaje de 4B; muestreo turbo de 8 pasos |
| Parámetros totales | 4B (DiT base, según model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (este repositorio); el modelo base se distribuye en bf16 |
| Idiomas soportados | no disponible (las muestras usan letras en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (acestep_v1.5_xl_turbo_nvfp4.safetensors) |

## Arquitectura y entrenamiento

ACE-Step v1.5 es un modelo fundacional de música de código abierto desarrollado por el equipo ACE-Step (ACE Studio y StepFun). La variante XL Turbo emplea un Diffusion Transformer de 4B parámetros con un esquema de muestreo turbo de 8 pasos, que reduce el número de pasos de difusión frente a los esquemas tradicionales. El pipeline de ACE-Step 1.5 incorpora además un planificador (planner) basado en un modelo de lenguaje de 4B que genera códigos de audio y que, cuando está activo, domina el consumo de VRAM.

La model card no detalla el dataset de entrenamiento, el número de tokens ni si se empleó RLHF o DPO. Esta versión concreta no reentrena el modelo: es una conversión de pesos. Se generó con la herramienta ComfyUI_Kitchen_nvfp4_Converter aplicando su perfil ACE-Step. En la conversión, las capas de normalización, sesgos, embedders y la cabeza de salida se mantienen en bf16, mientras que las capas lineales grandes se cuantizan a NVFP4. La capa `tokenizer.audio_acoustic_proj` (64 → 2048) también se mantiene en bf16, porque su entrada transpuesta y no contigua provocaba un `AssertionError` cuando el planificador estaba desactivado.

## Capacidades

- Generación de audio y música a partir de descripciones de texto (caption) y letras estructuradas con etiquetas de sección (`[verse]`, `[chorus]`, `[bridge]`, `[inst]`, etc.).
- Control fino del estilo mediante el prompt: género, tempo (BPM), tonalidad, instrumentación, tipo de voz y producción (por ejemplo, «dreamy lo-fi electronic, 82 bpm, A minor»).
- Soporte de cambios de compás y de estructura dentro de una misma pieza; el ejemplo de la model card incluye un break en 7/8.
- Modo turbo de 8 pasos, orientado a generación rápida.
- Planificador opcional (planner) que genera códigos de audio; puede desactivarse para reducir el uso de VRAM.
- Integración con ComfyUI mediante un workflow de ACE-Step 1.5 con cargador de UNet.
- No es un modelo de texto conversacional ni de código; sus capacidades se limitan a la generación de audio.

## Casos de uso

- Producción musical asistida: generar maquetas o demos completas (de varios minutos) a partir de una descripción de estilo y una letra; el modelo soporta cambios de estructura y de compás.
- Prototipado rápido de ideas: generar fragmentos cortos (por ejemplo, de 10 s) con 8 pasos y cfg 1 para explorar variaciones de estilo antes de comprometerse con un render largo.
- Bandas sonoras para videojuegos o vídeo: crear música adaptada a una atmósfera concreta (lo-fi, cinematográfica, electrónica) sin depender de bibliotecas con licencia.
- Contenido para creadores: generar música de fondo para pódcast, vídeos o directos, con letra personalizada, ejecutándose en local.
- Investigación en generación musical: usar la versión cuantizada como referencia ligera para comparar la fidelidad espectral respecto a bf16 (diferencia de ~1 dB de espectro medio).
- Flujos de trabajo en ComfyUI: integrar el modelo en un pipeline de generación de audio dentro de ComfyUI, combinado con otros nodos (VAE, text encoders).
- Despliegue en hardware de consumo: ejecutar un modelo de música de 4B en una GPU RTX 50 con un pico de VRAM de unos 5,2 GB en render sin planificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que no es un modelo de lenguaje. La model card sí aporta métricas comparativas entre bf16 y NVFP4:

| Métrica | bf16 | NVFP4 |
|---|---|---|
| Espectro medio | referencia | coincide dentro de ~1 dB |
| Correlación de forma de onda (misma semilla) | referencia | 0,93 |
| Peso en disco | 10 GB | 3,1 GB |
| Render, planificador off (RTX 5080, clip de 10 s, 8 pasos, cfg 1) | 1,2 s | 1,4 s |
| Render, planificador on (mismas condiciones) | 4,8 s | 3,0 s |
| Pico de VRAM, planificador off | ~10,5 GB | ~5,2 GB |

Fuente: model card del autor. Mediciones sobre RTX 5080 con ComfyUI 0.37.0 y comfy-kitchen 0.2.35. El autor advierte que los pasos de muestreo en clips cortos corren más lentos que en bf16, por lo que la ventaja es de VRAM y disco, no de velocidad. El repositorio oficial de ACE-Step 1.5 afirma que el modelo base alcanza calidad por encima de la mayoría de modelos musicales comerciales y genera una canción completa en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090 (cifras del modelo base, no de esta cuantización).

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell (serie RTX 50, por ejemplo RTX 5080) para soportar NVFP4.
- VRAM: ~5,2 GB de pico en render con el planificador desactivado (frente a ~10,5 GB en bf16). Con el planificador activo, el modelo de lenguaje de 4B domina y llena una tarjeta de 16 GB.
- Disco: 3,1 GB para el archivo de pesos NVFP4 (frente a 10 GB del bf16).
- Software: ComfyUI (probado en 0.37.0) con comfy-kitchen (probado en 0.2.35) y PyTorch compilado para CUDA 13.
- Despliegue: el autor lo orienta a ComfyUI, colocando `acestep_v1.5_xl_turbo_nvfp4.safetensors` en `ComfyUI/models/diffusion_models/` y seleccionándolo en el cargador de UNet del workflow ACE-Step 1.5. Los text encoders y el VAE no cambian.
- Latencia: en RTX 5080, 1,4 s con planificador off y 3,0 s con planificador on (clip de 10 s, 8 pasos, cfg 1, modelo ya cargado).
- No disponible: no se documentan requisitos para otras GPUs ni opciones de despliegue alternativas (llama.cpp, vLLM, Ollama, TGI) para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step v1.5 XL Turbo NVFP4 (este repositorio) | 4B DiT + planificador 4B | no disponible | NVFP4 (safetensors) | MIT | HuggingFace; requiere GPU NVIDIA Blackwell |
| ACE-Step v1.5 XL Turbo (bf16) | 4B DiT + planificador 4B | no disponible | bf16 (safetensors) | MIT | HuggingFace; GPU NVIDIA, AMD, Mac e Intel |
| Familia ACE-Step 1.5 (variantes Turbo y SFT) | no disponible | no disponible | safetensors | MIT (según repositorio) | GitHub y HuggingFace |

No se dispone de comparativas cuantitativas con otros modelos de generación musical en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización NVFP4, por lo que introduce pérdida de fidelidad. El autor reporta un espectro medio dentro de ~1 dB respecto a bf16 y una correlación de 0,93 con la misma semilla, pero advierte que las notas y la mezcla siguen difiriendo y que no se trata de un null test.
- Pruebas limitadas: el autor indica que solo probó un prompt y dos semillas por modelo, con planificador activado y desactivado. La calidad debe juzgarse de oído.
- Requisito de hardware restrictivo: NVFP4 exige una GPU NVIDIA Blackwell (serie RTX 50). No funciona en generaciones anteriores ni en AMD, Mac o Intel.
- Dependencias frágiles: necesita ComfyUI con comfy-kitchen y PyTorch para CUDA 13.
- Bug corregido: la primera subida fallaba con `AssertionError: Input tensor must be contiguous` al muestrear con `generate_audio_codes` desactivado. Si se descargó antes del 2 de octubre de 2026, hay que volver a descargarla (nuevo sha256: `e4a8b304367841ca3190c383005957d347f36110ff68749f4e26f803d0f43237`).
- Con el planificador activo, el modelo de lenguaje de 4B llena una tarjeta de 16 GB, lo que anula parte del ahorro de VRAM.
- Sesgos conocidos: no disponible; la model card no documenta sesgos.
- Riesgo de alucinación: no aplica en el sentido textual; su equivalente en generación musical es la fidelidad al prompt y a la letra, no documentada cuantitativamente.
- Idiomas: no se documenta soporte multilingüe; las muestras emplean letras en inglés.
- Licencia: MIT permite uso comercial, pero conviene verificar los términos del modelo base ACE-Step.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/sjoe1244/ACE-Step-v1.5-xl-turbo-nvfp4
- Modelo base en HuggingFace: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Repositorio GitHub de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Directorio del modelo XL Turbo en GitHub: https://github.com/ace-step/ACE-Step-1.5/tree/main/acestep/models/xl_turbo
- Herramienta de conversión NVFP4: https://github.com/tritant/ComfyUI_Kitchen_nvfp4_Converter
- Referencia en Civitai (ACE Step 1.5 XL Turbo y SFT): https://civitai.com/models/2375403/ace-step-15-xl-turbo-and-sft-text-to-audio-model-with-ollama
