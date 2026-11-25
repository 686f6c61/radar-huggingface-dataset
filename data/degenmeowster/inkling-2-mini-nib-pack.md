# degenmeowster/Inkling-2-Mini-Nib-Pack

## Resumen

Inkling-2-Mini-Nib-Pack es un paquete de pesos cuantizados preparado por el usuario degenmeowster para el modelo base thinkingmachines/Inkling-2-Mini, un modelo multimodal de tipo image-text-to-text con arquitectura MoE híbrida con atención en bucle, un codificador de visión de 23 capas y un drafter especulativo DSpark MTP. El paquete no es un modelo nuevo, sino un reempaquetado de precisión mixta que busca reproducir la precisión nativa de entrenamiento del modelo original.

La propuesta técnica central es preservar los expertos MoE de las capas 0 a 19 en NVFP4 (block-16 FP4 E2M1 con micro-escalas UE4M3 y escala F32 por experto) en lugar de reconvertirlos a Q8_0, lo que según el autor ahorra unos 9,5 GiB de peso muerto sin ganancia de calidad. El resto de tensores (expertos de las capas 20 a 23 en MXFP8 nativo, atención, embeddings, LM head, controladores de bucle y normas) se copian en Q8_0 o F32 desde el GGUF oficial de ggml-org.

El paquete está diseñado específicamente para GPUs AMD RDNA3 (gfx1100) mediante el runtime Nib, con el objetivo de ejecutar el contexto completo de 262.848 tokens, KV en Q8_0, MTP sin pérdida y visión dentro de una GPU de 24 GiB. Es, por tanto, un artefacto de nicho orientado a despliegue local en hardware AMD, no un modelo de propósito general listo para cualquier stack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención en bucle (looped hybrid-attention MoE) + codificador de visión de 23 capas + drafter MTP DSpark |
| Parametros totales | 318.256.128 (dato de safetensors del repo); el autor describe el modelo base como "26B" |
| Parametros activos | no disponible |
| Longitud de contexto | 262.848 tokens |
| Tipos de cuantizacion | NVFP4 (expertos MoE capas 0-19), Q8_0 (expertos capas 20-23, atención, embeddings, LM head), F32 (escalas por experto), BF16 (MTP), Q8_0/F16/F32 (vision encoder) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal y vision encoder), safetensors (drafter MTP), binario int32 (shortlist) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con atención híbrida en bucle, según la descripción del autor del reempaquetado. Thinking Machines entrenó y publicó el modelo con precisión mixta nativa: los expertos MoE de las capas 0 a 19 en NVFP4, los de las capas 20 a 23 en MXFP8, y atención, embeddings, LM head, controladores de bucle y normas en BF16. El paquete incluye además un codificador de visión de 23 capas y un drafter especulativo DSpark MTP de 3 capas.

La innovación del reempaquetado consiste en restaurar la paridad de precisión nativa convirtiendo únicamente los tensores `blk.{0..19}.ffn_{gate_up,down}_exps.weight` a `GGML_TYPE_NVFP4` (tipo 40, bloque de 36 bytes por 64 elementos) con tensores `scale2` F32 acompañantes, mientras copia los 664 tensores restantes byte a byte en Q8_0/F32 desde el GGUF oficial. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento sobre ventanas de contexto muy largas (hasta 262.848 tokens).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante el codificador de visión de 23 capas.
- Decodificación especulativa sin pérdida mediante el drafter DSpark MTP de 3 capas, con shortlist de vocabulario de 32.834 entradas.
- Soporte de batching continuo multi-slot (configuraciones de 1, 4 u 8 slots con reparto dinámico de contexto).
- Servidor compatible con la API de OpenAI y Web UI a través del runtime Nib.
- Capacidades de tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: el contexto de 262.848 tokens permite ingerir manuales, informes o expedientes completos junto con sus figuras y tablas en una sola pasada, sin fragmentación.
- Asistencia sobre bases de código de gran tamaño: la ventana completa admite repositorios medianos y su historial, útil para revisión y explicación de cambios con referencias cruzadas.
- Procesamiento de imágenes técnicas en local: el codificador de visión Q8_0 permite extraer información de capturas, diagramas o documentos escaneados en hardware de consumo AMD.
- Despliegue de un endpoint compatible con OpenAI en una estación de trabajo: el servidor de Nib expone la API estándar, lo que facilita integrar el modelo en herramientas existentes sin servicios en la nube.
- Inferencia con latencia reducida mediante decodificación especulativa: el drafter MTP acelera la generación en cargas interactivas manteniendo la salida idéntica a la del modelo principal.
- Experimentación con cuantización de precisión mixta: el paquete sirve como referencia reproducible para estudiar el impacto de NVFP4 frente a Q8_0 en expertos MoE sobre hardware RDNA3.
- Servicio multiusuario ligero: la configuración de 8 slots con 32k tokens por slot permite atender varias sesiones concurrentes en una única GPU de 24 GiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta mediciones de memoria y despliegue en una RX 7900 XTX (96 CU, 24 GiB): 21,50 GiB de arranque con un slot, 22,45 GiB de pico con visión de alta resolución, 21,89 GiB con 4 slots y 22,40 GiB con 8 slots. No se proporcionan cifras de latencia, throughput ni puntuaciones en tareas de evaluación.

## Requisitos de hardware

- VRAM estimada: 16,42 GiB para los pesos del modelo principal; 0,32 GiB para el codificador de visión al cargar; unos 21,5 GiB en total con contexto completo, KV Q8_0, MTP y visión en un solo slot.
- GPU validadas en hardware real: RX 7900 XTX (24 GiB), con 21,50 GiB de arranque y 22,45 GiB de pico.
- GPU simuladas: Radeon PRO W7900 (48 GiB) y W7800 32 GB, ambas con configuración completa; RX 7900 XT (20 GiB) limitada a 131.072 tokens con KV q4_1 y sin visión (~18,35 GiB).
- GPU no soportadas: RX 7900 GRE y RX 7800 XT (16 GiB), insuficientes para los pesos base de 16,42 GiB.
- Compatibilidad: exclusiva con el runtime Nib sobre ROCm para RDNA3 (gfx1100); llama.cpp estándar no consume los tensores `scale2` acompañantes.
- Opciones de despliegue: Nib (servidor compatible con OpenAI y Web UI); vLLM, TGI, Ollama y llama.cpp no están indicados como soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Nib-Pack | 318.256.128 (según safetensors); "26B" según el autor | 262.848 | Apache 2.0 | GGUF + safetensors / Nib (ROCm, RDNA3) | Precisión mixta NVFP4/Q8_0, visión y MTP |
| ggml-org/Inkling-2-Mini-GGUF | Mismo modelo base | 262.848 (según el autor) | Apache 2.0 | GGUF / llama.cpp | Conversión Q8_0 estándar de 25,90 GiB; sin optimización NVFP4 |
| thinkingmachines/Inkling-2-Mini | Mismo modelo base | 262.848 | Apache 2.0 | Pesos originales | Precisión nativa de entrenamiento (NVFP4, MXFP8, BF16) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime Nib: los tensores `scale2` acompañantes no son consumidos por llama.cpp estándar, lo que rompe la portabilidad habitual de GGUF.
- Compatibilidad restringida a AMD RDNA3 (gfx1100); no hay soporte indicado para NVIDIA, Apple Silicon ni otras arquitecturas AMD.
- Las configuraciones para W7900, W7800 y RX 7900 XT están simuladas mediante `sim_gpu.sh`, no verificadas en hardware real.
- No cabe en GPUs de 16 GiB (RX 7900 GRE, RX 7800 XT).
- La cifra de parámetros de safetensors (318 millones) no concuerda con la descripción del autor ("26B"); conviene verificar el dato antes de planificar recursos.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingüe.
- El repositorio registra 0 descargas y 0 likes, por lo que carece de validación comunitaria.
- La licencia Apache 2.0 del paquete se hereda del modelo base; conviene confirmar las condiciones del modelo original para uso comercial.

## Enlaces

- Repositorio del paquete: https://huggingface.co/degenmeowster/Inkling-2-Mini-Nib-Pack
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF oficial de referencia: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Runtime Nib: https://github.com/Chromadera/nib
