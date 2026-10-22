# sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8

## Resumen

Indus Pocket TTS Hindi ONNX · Inaya · Weight8 es una conversión no oficial a ONNX del modelo de síntesis de voz Indus-Labs/indus-pocket-tts, orientado a hindi (devanagari) e inglés, que a su vez deriva de Kyutai Pocket TTS. La publica el usuario sanjuoo7 (Scribe Animator / OHO Tech) en octubre de 2026 y su aportación no es un modelo nuevo, sino un paquete de inferencia: cuatro grafos ONNX con la voz fija «Inaya», el tokenizer del publicador y el estado de voz, sin CLI de generación, sin exportador y sin encoder de clonación.

La relevancia práctica está en el tamaño y el formato: la carga útil del modelo ocupa 176.870.325 bytes (unos 176,9 MB en unidades decimales) gracias a una cuantización weight-only INT8 aplicada a 24 matrices de proyección y feed-forward del transformer, mientras las activaciones y los módulos de texto, sampler y decodificador Mimi se mantienen en coma flotante. Eso permite ejecutar síntesis de voz en CPU de escritorio y en WebAssembly dentro de Chrome, sin GPU.

El paquete está pensado para integrarse en un driver propio que respete un contrato de inferencia documentado (fragmentos de 32 tokens, estado reiniciado entre fragmentos, 250 pasos por fragmento, 300 segundos de salida máxima). No incluye el normalizador de texto de Python del modelo original, por lo que los números deben escribirse en palabras. No se han publicado benchmarks nuevos ni métricas de calidad perceptual para esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS con sampler de flow matching (`flow_main_weight_int8.onnx`, `flow_one_step.onnx`) condicionado por texto (`text_conditioner.onnx`) y decodificado con codec neuronal Mimi (`mimi_decoder.onnx`); cuatro grafos ONNX independientes |
| Parámetros totales | no disponible (el autor no publica el recuento; la carga útil declarada es de 176.870.325 bytes) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el perfil de aplicación limita a 32 tokens de tokenizer por fragmento, pero es una política del driver, no un límite del grafo |
| Tipos de cuantización | weight-only INT8 simétrico con signo por canal de salida en 24 matrices del transformer, seguido de `DequantizeLinear`; activaciones FP32; text conditioner, sampler y decodificador Mimi en coma flotante; sin GGUF |
| Idiomas soportados | hindi (devanagari) e inglés; hinglish y nombres de producto en inglés de forma inconsistente |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 18, IR version 8) más `inaya.safetensors` y `tokenizer.model` |
| Voz | fija «Inaya»; no incluye encoder de clonación |
| Frecuencia de muestreo de salida | mono, 24 kHz, PCM16; 1.920 muestras por frame decodificado |
| Tamaño de lote | 1 (batch size uno, estado recurrente explícito) |
| Revisión upstream | `39899d3c1dcda47a7ef167cd222419feb86abeb9` |
| Hash del grafo principal | SHA-256 `18b1b194d444e53a354641111962e014ead0e02e59583968ae46d4b8df33dc62` |
| Tamaño del repositorio | 0,2 GB (incluye documentación, configuración, avisos y audio de muestra) |

Desglose de la carga útil declarada por el autor:

| Activo | Bytes |
|---|---:|
| `flow_main_weight_int8.onnx` | 76.298.980 |
| `flow_one_step.onnx` | 39.093.640 |
| `mimi_decoder.onnx` | 41.330.795 |
| `text_conditioner.onnx` | 16.388.300 |
| `inaya.safetensors` | 3.442.480 |
| `tokenizer.model` | 316.130 |
| **Total** | **176.870.325** |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema del modelo base: un condicionador de texto que produce representaciones a partir del tokenizer, un sampler de flow matching que genera el estado acústico latente (con una variante principal y otra de un solo paso) y un decodificador Mimi que convierte ese estado en waveform mono a 24 kHz. La conversión separa estas piezas en cuatro grafos ONNX con batch uno y estado recurrente explícito, de modo que el consumo por fragmento es responsabilidad del driver que los orquesta. La cuantización afecta únicamente al almacenamiento de pesos de 24 matrices de proyección y feed-forward del transformer, no a la computación, que sigue realizándose sobre activaciones FP32; el autor advierte explícitamente de que esto no implica menor memoria pico ni mayor velocidad.

No hay información disponible sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni las innovaciones de entrenamiento del modelo original. El modelo procede de Indus Labs, que a su vez parte de Kyutai Pocket TTS; esta ficha cubre solo la conversión ONNX, cuyos cambios se limitan al formato y al almacenamiento de pesos. El paquete tampoco incluye el normalizador de texto en Python del upstream ni ejecuta normalización dentro de los grafos, por lo que la preparación del texto (por ejemplo, escribir importes y OTP con letras) recae en la aplicación.

## Capacidades

- Síntesis de voz en hindi (devanagari) con voz fija «Inaya», orientada a frases conversacionales cortas.
- Pronunciación de términos en inglés y hinglish dentro de una frase en hindi, con resultados inconsistentes en nombres de producto.
- Generación de audio mono a 24 kHz en formato PCM16 WAV, con 1.920 muestras por frame decodificado.
- Ejecución en CPU de escritorio y en navegador mediante WebAssembly (probado con `onnxruntime-web==1.22.0-dev.20250409-89f8206ba4` en Chrome de escritorio).
- Dos variantes de sampler: `flow_main_weight_int8.onnx` (calidad) y `flow_one_step.onnx` (un solo paso, presumiblemente para menor coste, aunque no se publican métricas).
- Integración en un driver propio a través del contrato descrito en `INFERENCE.md`, con control de fragmentos, estado y tiempo máximo.
- No soporta clonación de voz, tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Voiceover para el editor Scribe Animator: el paquete se usa en la función Local AI Voiceover en escritorio, seleccionando «Pocket TTS — Natural Voice → Hindi», lo que permite generar narración en hindi sin salir del navegador ni enviar texto a servidores externos.
- Avisos y mensajes cortos en aplicaciones hindi: frases conversacionales de una o dos líneas (bienvenidas, confirmaciones, recordatorios) donde el límite de 32 tokens por fragmento y la voz fija son suficientes.
- Lectura de importes, fechas y OTP en sistemas de atención: escribiendo las cifras en palabras («दो हज़ार आठ सौ रुपये», «चार आठ दो एक») y troceando la locución, el modelo puede generar respuestas habladas en flujos de IVR o notificaciones.
- Prototipos de accesibilidad en web: al ejecutarse en WASM sobre Chrome de escritorio con una carga útil de ~177 MB, permite añadir lectura en voz alta en hindi a aplicaciones que no pueden depender de APIs de TTS en la nube.
- Contenido formativo breve en hindi con términos técnicos en inglés: el ejemplo publicado (una frase hinglish de 4,40 s) ilustra el caso de tutoriales y microlecciones, aceptando revisión auditiva por las limitaciones de pronunciación.
- Pruebas de UX multilingüe: generar variantes en hindi e inglés de un mismo guion para validar interfaces, tono y duración antes de contratar grabación humana.
- Sustitución de TTS en entornos con recursos limitados: al no requerir GPU y caber en 0,2 GB de repositorio, encaja en estaciones de trabajo sin acelerador o en flujos de generación por lotes de clips cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ningún benchmark de voz nuevo para este paquete, que las muestras adjuntas (2,96 s en hindi y 4,40 s en hinglish) no constituyen una puntuación de calidad perceptual y que las cifras nativas de latencia y calidad del modelo upstream no describen esta conversión. Tampoco se aportan datos de memoria pico, throughput ni certificación de ejecución a nivel de operador.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica memoria pico; los 176,9 MB son tamaño de descarga/almacenamiento, no consumo de RAM, y el runtime puede expandir los pesos INT8 almacenados.
- GPU: no se declara ninguna. La validación se hizo en CPU de escritorio y en Chrome de escritorio con WASM, sin WebGPU cuantizado.
- Cabe en hardware de consumo: sí, por tamaño, al ejecutarse en CPU de escritorio y en navegador; no se especifican modelos de CPU ni de móvil, y no hay prueba en dispositivo móvil físico ni en Safari.
- Opciones de despliegue: ONNX Runtime (escritorio) y `onnxruntime-web` (navegador). No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Solo se documentan duraciones de salida de las muestras (2,96 s y 4,40 s), no tiempos de generación.
- Requisito de integración: hace falta un driver que implemente el contrato de `INFERENCE.md`, aplique los topes (32 tokens por fragmento, 250 pasos, 300 s) y falle de forma explícita si un fragmento no termina.
- Almacenamiento: repositorio de 0,2 GB; el audio de muestra, la documentación y las librerías de inferencia son adicionales a la carga útil.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8 | Conversión ONNX cuantizada weight-only INT8 | no disponible | no disponible (32 tokens por fragmento como política de driver) | hi, en | CC BY 4.0 | ONNX + safetensors | 176,9 MB de carga útil, sin CLI ni normalizador, voz fija Inaya |
| Indus-Labs/indus-pocket-tts (upstream) | Modelo TTS nativo | no disponible | no disponible | hi, en | no disponible en la información | no disponible | Incluye normalizador de texto en Python; referencia de calidad nativa citada por el autor |
| kyutai/pocket-tts | Modelo TTS base | no disponible | no disponible | no disponible | no disponible en la información | no disponible | Base sobre la que Indus Labs construye su modelo |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia, idioma y empaquetado.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor declara que no cuenta con el respaldo de Indus Labs ni de Kyutai.
- No es un sintetizador autónomo: faltan CLI de generación, exportador, demo de navegador y encoder de audio para clonación; instalar las dependencias no basta para sintetizar.
- Los números en dígitos latinos o devanagari resultaron poco fiables en las pruebas; hay que escribirlos en palabras y aun así revisar la locución.
- No se incluye ni se ejecuta el normalizador de texto del upstream; los grafos ONNX no normalizan el texto de entrada.
- Pronunciación inconsistente de hinglish, nombres de producto y términos en inglés; palabras raras en hindi, narración literaria y frases técnicas largas pueden salir arrastradas u omitirse.
- La voz es fija («Inaya»); no hay control de hablante ni clonación.
- El autor no certifica paridad de calidad perceptual con el modelo nativo y recomienda escuchar las salidas importantes antes de usarlas.
- Los límites operativos (32 tokens por fragmento, reinicio de estado, 250 pasos, 300 s) son políticas del driver, no restricciones embebidas en los grafos; un driver mal implementado puede producir fragmentos incompletos.
- La cuantización es solo de almacenamiento: no garantiza menor memoria pico ni mayor velocidad, y el runtime puede expandir los pesos.
- Sin validación en móvil físico, Safari, WebGPU cuantizado ni certificación de ejecución por operador; las pruebas se limitan a CPU de escritorio y Chrome de escritorio con WASM.
- Sin benchmarks publicados de calidad, latencia o throughput.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben conservarse los avisos de Indus Labs, Kyutai y del conversor, y revisarse los términos del modelo upstream antes de producción.
- Riesgo de alucinación en el sentido habitual de los LLM no aplica; el riesgo equivalente es de pronunciación y de omisión de contenido, con impacto directo en la inteligibilidad.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8
- Modelo base (Indus Labs): https://huggingface.co/Indus-Labs/indus-pocket-tts
- Revisión upstream exacta: https://huggingface.co/Indus-Labs/indus-pocket-tts/tree/39899d3c1dcda47a7ef167cd222419feb86abeb9
- Modelo base original (Kyutai Pocket TTS): https://huggingface.co/kyutai/pocket-tts
- Contrato de inferencia: https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8/blob/main/INFERENCE.md
- Procedimiento de exportación: https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8/blob/main/EXPORT.md
- Manifiesto: https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8/blob/main/manifest.json
- Sumas SHA-256: https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8/blob/main/SHA256SUMS
- Contrato de grafo: https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8/blob/main/graph-contract.json
- Muestra en hindi (2,96 s): https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8/resolve/main/samples/inaya-weight8-hindi.wav
- Muestra en hinglish (4,40 s): https://huggingface.co/sanjuoo7/indus-pocket-tts-hindi-onnx-inaya-weight8/resolve/main/samples/inaya-weight8-hinglish.wav
- Aplicación Scribe Animator: https://app.scribeanimator.com/
- Sitio de Scribe Animator: https://scribeanimator.com/
