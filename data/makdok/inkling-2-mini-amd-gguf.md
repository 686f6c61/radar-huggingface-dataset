# Makdok/Inkling-2-Mini-AMD-GGUF

## Resumen

Inkling 2 Mini es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Thinking Machines, del que esta ficha describe la cuantización GGUF publicada por Makdok para su uso en GPUs AMD Radeon bajo ROCm/HIP. El modelo base cuenta con 26.070.390.272 parámetros totales, y esta variante concreta, denominada `Inkling-2-Mini-h6-lbf16-UD-Q4_K_M.gguf`, ocupa 16,442 GB y se distribuye en un único archivo de unos 5,0 bits por peso de media. La publicación deriva de la cuantización UD-Q4_K_M de Unsloth y aplica dos modificaciones puntuales orientadas a reducir los bytes leídos por token generado.

La relevancia de esta ficha no reside tanto en el modelo base como en el motor de inferencia que lo acompaña: la rama `inkling2-amd` de llama.cpp, mantenida por el mismo autor, incorpora rutas de código GPU específicas para RDNA3 (gfx1100-gfx1103) que aceleran de forma notable la decodificación especulativa con el drafter DSpark. En una Radeon RX 7900 XTX de 24 GB, el autor reporta lecturas de prompt de 3048-3050 tok/s y escritura de 110-111 tok/s con un contexto de 65.536 tokens, frente a los 42 tok/s de escritura del motor estándar con el archivo de Unsloth.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial, y se distribuye exclusivamente en formato GGUF para llama.cpp. No se han publicado en la información disponible datos sobre idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks estándar del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes ("looped layers") y atención con sink; 12 capas en bucle (blk.6 a blk.17) ejecutadas tres veces por token |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens medidos en VRAM con drafter (19,05 GB pico); 131.072 tokens factibles con drafter (2886-2901 tok/s lectura, 114-117 tok/s escritura); contextos de hasta 262.144 medidos |
| Tipos de cuantizacion | GGUF UD-Q4_K_M (~5,0 bits/peso de media): NVFP4 y Q5_K/Q8_0 en expertos, Q8_0 en atención, BF16 en gates de bucle y proyecciones, Q6_K en la cabeza de salida, F32/BF16 en tensores pequeños |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); 734 tensores en total |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una innovación estructural destacable: doce capas (blk.6 a blk.17) están configuradas como capas en bucle que se ejecutan tres veces por token generado. Cada una de estas capas incorpora 144 pesos de compuerta de bucle (`loop_{attn,k,v,mlp}_{down,gain,forget}.weight`) que controlan el estado recurrente entre pasadas. La atención emplea proyecciones de sink (`attn_sink_proj`) y proyecciones convolucionales (`conv_proj`), lo que sugiere un esquema híbrido entre atención estándar y mecanismos de estado recurrente. La cabeza de salida tiene dimensiones 201024 x 2304, lo que indica un vocabulario de 201.024 tokens.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente documenta el proceso de cuantización: se partió del archivo UD-Q4_K_M de Unsloth y se aplicaron dos cambios mediante `llama-quantize --allow-requantize --pure`. El primero convierte los 144 pesos de compuerta de bucle de F32 a BF16; el autor verifica con el script `scripts/bf16_exact.py` que los 28.311.552 valores F32 originales tienen los 16 bits bajos a cero, por lo que la conversión es bit-exacta y sin pérdida, y reduce el almacenamiento de estos tensores de 113 MB a 57 MB. El segundo cambio convierte `output.weight` de Q8_0 a Q6_K para aligerar la lectura de la cabeza de salida en cada paso de verificación y de drafting. Los 589 tensores restantes se copian sin modificar.

La aceleración principal proviene del motor: la rama `inkling2-amd` de llama.cpp implementa rutas GPU para RDNA3 y soporte de decodificación especulativa con el drafter DSpark (`--spec-type draft-dspark`), que permite generar hasta 3 tokens candidatos por paso con un ubatch de 512. El motor requiere flash attention (`-fa 1`) con caché KV F16 o q8_0 para activar la ruta rápida.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de esfuerzo configurable mediante `reasoning_effort` (valores: none, minimal, low, medium, high, xhigh, o numérico de 0 a 0,99; por defecto 0,9 en la plantilla).
- Soporte de plantilla de chat Jinja (`--jinja`) y sampling en GPU (`--backend-sampling`), desactivado automáticamente por el servidor en peticiones con gramática (tool calls).
- Compatibilidad con endpoints de servidor llama.cpp, lo que permite integración con clientes compatibles con la API de OpenAI.
- Decodificación especulativa mediante drafter DSpark externo, con generación de hasta 3 tokens candidatos por paso.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Tool calling y razonamiento multi-paso: no confirmado explícitamente en la información disponible, aunque la mención a gramáticas y tool calls en el servidor sugiere soporte de function calling.

## Casos de uso

- Inferencia local en GPU de consumo AMD: el archivo cabe en una Radeon RX 7900 XTX de 24 GB con contexto de 65.536 tokens y un pico de VRAM de 19,05 GB, lo que permite desplegar un modelo de 26.000 millones de parámetros en hardware de gama alta de escritorio sin recurrir a GPUs de centro de datos.
- Asistentes conversacionales de contexto largo: con 131.072 tokens de contexto y velocidades de lectura de prompt de 2886-2901 tok/s, el modelo puede procesar documentos extensos o historiales de conversación largos manteniendo una latencia de primera respuesta baja.
- Procesamiento de documentos técnicos o jurídicos: la ventana de hasta 262.144 tokens medida permite ingerir manuales, expedientes o bases de código completas en una sola pasada, con la velocidad de lectura necesaria para que la operación sea interactiva.
- Generación de código asistida en local: el soporte de plantilla Jinja y de gramáticas en el servidor permite restringir la salida a formatos estructurados, útil para autocompletado o generación de parches en entornos sin conexión.
- Investigación sobre decodificación especulativa: el par modelo-drafter DSpark y las métricas publicadas (de 42 a 92 tok/s sin drafter y de 60 a 129 tok/s con drafter en contexto de 8192) ofrecen un banco de pruebas reproducible para estudiar el impacto del drafting en GPUs RDNA3.
- Despliegue en estaciones de trabajo con ROCm: al requerir únicamente llama.cpp parcheado y una GPU gfx1100-gfx1103, el modelo puede integrarse en flujos de trabajo de desarrollo que ya utilicen ROCm/HIP sin necesidad de CUDA.
- Evaluación comparativa de cuantizaciones: la documentación detallada del proceso de cuantización y del script de verificación bit-exacta permite reutilizar la metodología para otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son mediciones de velocidad de inferencia del autor en una Radeon RX 7900 XTX (gfx1100, 24 GB):

| Configuración | Lectura de prompt (tok/s) | Escritura (tok/s) | Contexto |
|---|---|---|---|
| Este archivo + DSpark, motor parcheado | 3048-3050 | 110-111 | 65.536 |
| Este archivo + DSpark, motor parcheado | 2886-2901 | 114-117 | 131.072 |
| Unsloth UD-Q4_K_M, motor estándar b12568, sin drafter | 829 | 42 | 32.768 |
| Unsloth UD-Q4_K_M, motor parcheado, sin drafter | 2998-3154 | 92 | 32.768 |
| Unsloth UD-Q4_K_M, motor estándar b12568, con DSpark | 984 | 60 | 8.192 |
| Unsloth UD-Q4_K_M, motor parcheado, con DSpark | 2448-2534 | 129 | 8.192 |
| Unsloth UD-Q4_K_M, motor estándar b12631, sin drafter | 351 | 50 | 32.768 |
| Unsloth UD-Q4_K_M, motor parcheado, sin drafter | 3134-3146 | 85 | 32.768 |

## Requisitos de hardware

- VRAM estimada: 19,05 GB dedicados + 0,25 GB compartidos en pico con contexto de 65.536 y drafter, medido en RX 7900 XTX.
- GPU recomendadas: Radeon RX 7900 XTX (gfx1100, 24 GB) es la única verificada. Las rutas rápidas del motor se activan únicamente en RDNA3.0 (gfx1100-gfx1103); en otras GPU el archivo funciona a la velocidad del motor estándar.
- Cabe en GPU de consumo: sí, en GPUs AMD de 24 GB. No hay datos para GPUs NVIDIA ni para modelos con menos VRAM.
- Opciones de despliegue: llama.cpp con la rama `inkling2-amd` de Makdok (compilación HIP con `GPU_TARGETS`; scripts `build-hip.cmd` en Windows o cmake en Linux), servidor `llama-server` con flash attention obligatoria y caché KV F16 o q8_0. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 3048-3050 tok/s de lectura de prompt y 110-111 tok/s de escritura con 65.536 tokens de contexto y drafter; 114-117 tok/s de escritura con 131.072 tokens de contexto.
- El drafter `dspark-Inkling-2-Mini-Q8_0_Old.gguf` ocupa 402.278.560 bytes adicionales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (MoE de ~26.000 millones de parámetros). La única comparación documentada es contra el propio archivo de Unsloth del que deriva, en términos de velocidad de inferencia y no de calidad.

## Limitaciones y advertencias

- Las rutas aceleradas del motor solo funcionan en GPUs RDNA3.0 (gfx1100-gfx1103); en cualquier otra GPU el rendimiento cae al del motor estándar.
- El archivo está pensado para una versión parcheada de llama.cpp; los archivos más recientes de Unsloth para llama.cpp estándar (`dspark-Inkling-2-Mini-Q8_0.gguf` e `Inkling-2-Mini-UD-Q4_K_M.gguf`) no fueron probados con este motor.
- Flash attention es obligatoria para la ruta rápida; otras cachés KV cuantizadas distintas de F16 o q8_0 toman un camino más lento.
- El sampling en GPU (`--backend-sampling`) se desactiva en peticiones con gramática, lo que afecta a tool calls.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni evaluación de calidad del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Los datos de rendimiento proceden de una única GPU y una única configuración; no hay mediciones independientes.
- El modelo base no incluye documentación sobre datos de entrenamiento, lo que dificulta evaluar riesgos de contaminación o sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Makdok/Inkling-2-Mini-AMD-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Motor llama.cpp parcheado: https://github.com/Makdok/llama.cpp-inkling2-amd
