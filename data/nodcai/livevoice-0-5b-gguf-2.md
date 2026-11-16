# nodcai/LiveVoice-0.5B-GGUF

## Resumen

LiveVoice-0.5B-GGUF es una conversión al formato GGUF del modelo de síntesis de voz en streaming VibeVoice-Realtime-0.5B de Microsoft, publicada por el usuario nodcai. El modelo original es un sistema de text-to-speech de arquitectura híbrida (modelo de lenguaje más cabeza de difusión) diseñado para empezar a emitir audio mientras el texto todavía se está generando, lo que lo hace apto para asistentes conversacionales en tiempo real. Esta versión GGUF está pensada para ejecutarse con livevoice.cpp, un runtime en C++ sobre ggml que permite desplegar el modelo sin dependencias de Python.

La relevancia de esta ficha radica en que empaqueta el modelo junto con el tokenizer y un post-filtro DeepFilterNet3 en archivos autocontenidos, con varias recetas de cuantización optimizadas para distintos compromisos entre tamaño, memoria y calidad de pronunciación. El archivo recomendado (COMPACT) ocupa 577 MB y requiere unos 0,92 GB de memoria pico, con una latencia de arranque de 70-120 ms tras las primeras palabras en un Apple M4 Max.

El modelo cuenta con 883.627.733 parámetros reales según los safetensors del modelo base, soporta únicamente inglés y se distribuye bajo licencia MIT. Está orientado a la síntesis de voz mono a 48 kHz con voces precomputadas (prompts de voz) en lugar de clonación por audio de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: modelo de lenguaje (transformer) + cabeza de difusión para generación de audio; sin encoder de audio |
| Parametros totales | 883.627.733 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8_0, iq4_nl, q4_k, q4_0, q5_k, q6_k, F16 (combinaciones por receta: COMPACT, ATTN_Q8, MIXED, Q4_K, Q8_0) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (también disponible el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base VibeVoice-Realtime-0.5B combina un modelo de lenguaje con una cabeza de difusión que genera los latentes de audio, y carece de encoder de audio. Por ello, las voces no se clonan a partir de una grabación de referencia, sino que se representan como prompts precomputados (las cachés K/V del modelo tras "escuchar" la voz). Los archivos GGUF incluyen además el tokenizer (derivado de Qwen2.5-0.5B) y un post-filtro DeepFilterNet3 que elimina el artefacto musical breve que el modelo a veces antepone a una respuesta. La salida es mono a 48 kHz.

El proceso de conversión y cuantización se realiza con scripts incluidos (convert_tokenizer.py, convert_deepfilternet.py, convert_model.py) y la herramienta livevoice-quantize, que aplica recetas específicas. La receta COMPACT mantiene la atención y la cabeza de difusión en q8_0 (las partes más sensibles), usa iq4_nl para gate/up, q4_0 para el embedding tras eliminar 69.908 filas que el tokenizer no puede producir con un merge_cap de 80000, q5_k para el FFN del decoder y q8_0 para las convoluciones del decoder. No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés con salida mono a 48 kHz.
- Streaming en tiempo real: empieza a hablar mientras el texto se está escribiendo, con 70-120 ms de latencia tras las primeras palabras en un M4 Max.
- Dos voces precomputadas incluidas: en-Clarissa_female y en-Clarion_male, compatibles con cualquiera de los archivos de modelo.
- Post-filtrado integrado con DeepFilterNet3 para eliminar artefactos musicales.
- API en C para empujar texto y recibir trozos de audio a medida que se generan (lv_stream_push, lv_stream_begin, etc.).
- No soporta tool calling, function calling, agentes, visión ni audio de entrada; es exclusivamente TTS.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede empezar a sintetizar audio mientras un LLM todavía está generando la respuesta, gracias a su modo streaming y a la baja latencia de arranque (70-120 ms), lo que reduce la sensación de espera en interfaces de voz.
- Lectura de respuestas de chatbots en aplicaciones de atención al cliente: con 0,92 GB de memoria pico en la receta COMPACT, puede desplegarse junto a un LLM pequeño en el mismo dispositivo sin agotar recursos.
- Integración en aplicaciones móviles o de escritorio nativas: el runtime livevoice.cpp en C++/ggml permite compilar el modelo sin Python; en un iPhone 18 Pro (Metal) la receta q4_k alcanza 8,0x tiempo real y attn-q8 7,9x.
- Sistemas de navegación o domótica con respuestas habladas: el modelo genera audio de forma incremental a partir de texto corto, adecuado para instrucciones breves y confirmaciones.
- Accesibilidad (lectores de pantalla): la síntesis en streaming permite leer texto dinámico (notificaciones, mensajes) con una latencia mínima y sin necesidad de conexión a la nube.
- Prototipado de pipelines TTS en C/C++: la API en C y los archivos autocontenidos (modelo + tokenizer + DeepFilterNet3) simplifican la integración en sistemas embebidos o aplicaciones de escritorio.
- Evaluación de cuantizaciones para TTS en producción: las recetas publicadas (COMPACT, ATTN_Q8, MIXED, Q4_K, Q8_0) permiten comparar calidad de pronunciación y velocidad en hardware concreto.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del autor sobre calidad de pronunciación y velocidad, no benchmarks estándar (MMLU, HumanEval, etc.).

| Metrica | attn-q8 | compact |
|---|---:|---:|
| Tamano de archivo | 757 MB | 577 MB |
| Deriva del LM respecto a q8_0 | 13,0 % | 11,7 % |
| Diferencia de forma de onda respecto a q8_0 | 1,9 % | 3,4 % |
| Palabras raras transcritas correctamente (990 slots, Parakeet como juez) | 94,7 % | 94,6 % |
| Última palabra de la frase correcta (400 finales) | 96,2 % | 96,5 % |
| Memoria pico, M4 Max | 1,50 GB | 0,92 GB |
| Tiempo para 10,4 s de audio, M4 Max | 0,93 s | 0,94 s |

Precisión en palabras raras (24 frases, 35 slots de palabras raras x 10 semillas, juzgado por un modelo ASR):

| Atención / gate / up del LM | Slots de palabras raras acertados |
|---|---:|
| q4_0 (archivo q4_k) | 73,7 % |
| q8_0 | 79,7 % |
| f16 | 78,3 % |

Velocidad en iPhone 18 Pro (Metal, 5 pasos de difusión, CFG 1,5): q4_k 8,0x tiempo real; attn-q8 7,9x; q8_0 gate/up 6,3x. Con las reglas de tokenizer para palabras raras de livevoice.cpp (activadas por defecto), attn-q8 alcanza el 82,0 % de los slots.

## Requisitos de hardware

- VRAM/memoria estimada: 0,92 GB pico con COMPACT en M4 Max; 1,50 GB con attn-q8. El archivo Q8_0 (1,1 GB) requiere más memoria.
- GPU recomendadas: Apple Silicon (M4 Max probado, iPhone 18 Pro con Metal probado). No se especifican requisitos para GPU NVIDIA/AMD en la información disponible.
- Cabe en GPU de consumo: sí, al menos en Apple Silicon; no hay datos publicados para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: livevoice.cpp (runtime C++/ggml), con CLI (livevoice-cli) y API en C. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 70-120 ms tras las primeras palabras en M4 Max; 0,93-0,94 s para generar 10,4 s de audio en M4 Max.
- Throughput en móvil: 6,3x-8,0x tiempo real en iPhone 18 Pro según cuantización. La velocidad en GPU de teléfonos no se ha medido aún según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| LiveVoice-0.5B-GGUF (este) | 883,6 M | No disponible | Inglés | MIT | GGUF | TTS en streaming, runtime C++/ggml, voces precomputadas |
| VibeVoice-Realtime-0.5B (Microsoft) | 883,6 M | No disponible | Inglés | No disponible en la información | safetensors (formato original) | Modelo base; requiere runtime Python |
| Alternativas de TTS de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- No dispone de encoder de audio: no permite clonación de voz a partir de una grabación, solo voces precomputadas.
- Riesgo de errores de pronunciación en palabras raras: la receta q4_k acierta el 73,7 % de los slots en palabras raras, frente al 79,7 % de q8_0; COMPACT y attn-q8 rondan el 94,6-94,7 % con el juez Parakeet.
- El autor documenta que en una frase de prueba COMPACT dice "cryptocurrencies" en lugar de "cryptocurrency" con más frecuencia que attn-q8 (12 de 30 frente a 1 de 30).
- La receta COMPACT limita merge_cap a 80000 (valor por defecto); usar otro valor puede afectar al comportamiento.
- La velocidad en GPU de teléfonos no se ha medido todavía según el autor.
- No hay datos publicados sobre sesgos, alucinaciones (en el sentido de contenido inventado) ni sobre el entrenamiento del modelo base.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Microsoft y de DeepFilterNet3.
- No se especifican requisitos de hardware para GPU NVIDIA/AMD ni benchmarks estándar de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/nodcai/LiveVoice-0.5B-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Runtime livevoice.cpp: https://github.com/nodcai/livevoice.cpp
- Repositorio VibeVoice de Microsoft: https://github.com/microsoft/VibeVoice
- DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
