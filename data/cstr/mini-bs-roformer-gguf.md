# cstr/mini-bs-roformer-GGUF

## Resumen

Mini-BS-RoFormer V2.5 GGUF es una conversión al formato GGUF del modelo de separación de fuentes musicales HiDolen/Mini-BS-RoFormer-V2.5-46.2M, publicada por el usuario cstr. El modelo original, con 46,2 millones de parámetros, separa audio estéreo a 44,1 kHz en cuatro pistas (stems): bajo, batería, otros instrumentos y voz. La conversión está pensada para ejecutarse con CrispASR, un motor de inferencia en C++ basado en ggml que elimina la dependencia de Python y PyTorch en tiempo de ejecución.

La relevancia de esta ficha reside en su carácter práctico: es un modelo pequeño (46,2 M de parámetros, repositorio de 0,2 GB) que cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU. Las tres cuantizaciones publicadas (F16 de ~88 MB, Q8_0 de ~50 MB y Q4_K de ~37 MB) permiten ajustar el equilibrio entre fidelidad de separación y consumo de recursos, lo que lo hace adecuado para pipelines de producción ligeros, aplicaciones de escritorio y herramientas de edición musical.

No se trata de un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Es un modelo de audio-a-audio especializado en separación de fuentes, por lo que sus capacidades, casos de uso y benchmarks deben evaluarse bajo esa categoría (SDR/SIR en stems musicales), no bajo métricas de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoFormer (transformer con atención rotatoria) aplicado a separación de fuentes; BS-RoFormer (Band-Split RoFormer) |
| Parametros totales | 46.179.332 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | GGUF (tres artefactos: `mini-bs-roformer-f16.gguf`, `mini-bs-roformer-q8_0.gguf`, `mini-bs-roformer-q4_k.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un BS-RoFormer (Band-Split RoFormer), una arquitectura de separación de fuentes que combina un split por bandas de frecuencia con bloques transformer provistos de atención rotatoria (RoPE). Esta combinación permite modelar dependencias de largo alcance en el espectrograma sin perder resolución frecuencial, algo crítico para separar voces e instrumentos que se solapan en el mismo rango espectral. El modelo opera sobre audio estéreo a 44,1 kHz y produce cuatro stems: bajo, batería, otros y voz.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens o muestras, ni sobre si se aplicaron técnicas de refinamiento (RLHF, DPO u otras). La conversión a GGUF realizada por cstr no modifica la arquitectura: solo serializa los pesos en el formato de ggml para su ejecución nativa en C++ mediante CrispASR, sin Python ni PyTorch en inferencia.

## Capacidades

- Separación de fuentes musicales en cuatro stems: bajo, batería, otros y voz.
- Procesamiento de audio estéreo a 44,1 kHz.
- Inferencia 100% nativa en C++ mediante ggml (CrispASR), sin dependencias de Python ni PyTorch.
- Selección de stems concretos en la CLI (`--stems vocals`), lo que permite separar solo la pista deseada.
- API de Python (`crispasr.Session`) que devuelve un diccionario con las cuatro pistas.
- Descarga automática del modelo desde el registro de CrispASR mediante Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de visión/audio generativo: es exclusivamente audio-a-audio.

## Casos de uso

- Producción musical y remezclas: separar una mezcla en stems permite aislar la voz para aplicar procesado (reverb, compresión, afinación) sin afectar a la batería o el bajo, usando la cuantización Q8_0 como compromiso entre fidelidad y tamaño (~50 MB).
- Karaoke y eliminación de voz: ejecutar `crispasr --separate -m mini-bs-roformer-q8_0.gguf -f song.wav --stems vocals` y restar la pista vocal de la mezcla original para generar una versión instrumental.
- Muestreo y crate digging: extraer el stem de batería o bajo de grabaciones antiguas para reutilizarlos en producción de hip-hop o electrónica, aprovechando que el modelo trabaja a 44,1 kHz estéreo.
- Herramientas de escritorio y plugins de DAW: al ejecutarse en C++ vía ggml y pesar entre 37 y 88 MB, el modelo puede integrarse en aplicaciones nativas sin empaquetar un runtime de PyTorch, reduciendo el tamaño del instalador y el consumo de memoria.
- Preprocesado en pipelines de transcripción o análisis musical: aislar la pista vocal antes de pasar el audio a un sistema de reconocimiento de voz o de alineación de letras, lo que mejora la relación señal-ruido del habla/canto.
- Archivística y restauración: separar y conservar stems individuales de grabaciones para facilitar remasterizaciones posteriores o estudios musicológicos sobre arreglos y mezcla.
- Procesamiento por lotes en servidores sin GPU: la cuantización Q4_K (~37 MB) permite ejecutar la separación en CPU en entornos con recursos limitados, útil para tareas de catalogación masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 46,2 M de parámetros, los pesos ocupan ~88 MB en F16, ~50 MB en Q8_0 y ~37 MB en Q4_K. La memoria adicional corresponde a buffers de activación y al audio de entrada/salida, no disponible en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre es suficiente en la práctica; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPUs integradas; también es viable en CPU.
- Opciones de despliegue: CrispASR (CLI y API de Python) es el motor indicado por el autor. No se mencionan otras opciones (llama.cpp, Ollama, vLLM, TGI) en la información disponible; al ser un modelo de audio y no de lenguaje, estas herramientas no aplican directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Stems | Formato nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cstr/mini-bs-roformer-GGUF (este) | 46,2 M | 4 (bajo, batería, otros, voz) | GGUF / C++ (ggml) | MIT | Hugging Face |
| HiDolen/Mini-BS-RoFormer-V2.5-46.2M | 46,2 M | 4 (bajo, batería, otros, voz) | PyTorch (safetensors) | MIT | Hugging Face |
| Demucs (htdemucs) | no disponible en la información | 4 (bajo, batería, otros, voz) | PyTorch | MIT | Repositorio oficial |
| Spleeter | no disponible en la información | 2 o 4 stems | TensorFlow | MIT | Repositorio oficial |

La comparación con Demucs y Spleeter se ofrece como referencia de categoría; los datos concretos de parámetros, contexto y rendimiento de esos modelos no están disponibles en la información proporcionada. Frente al modelo original de HiDolen, la diferencia principal es el formato: GGUF para inferencia nativa en C++ sin PyTorch, con cuantizaciones que reducen el tamaño a la mitad o menos.

## Limitaciones y advertencias

- Es un modelo de separación de fuentes, no un LLM: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categoría.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre el rendimiento en géneros musicales distintos de los representados en los datos originales.
- Riesgo de artefactos en la separación: como todo modelo de source separation, puede introducir sangrado entre stems (bleeding) o artefactos en pasajes con instrumentación densa; no se han publicado métricas SDR/SIR en la información disponible.
- La ventana de contexto y el comportamiento con audios de duración arbitraria no están documentados; no se especifica cómo se gestionan fragmentos largos.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base y de los datasets de entrenamiento originales, que no se detallan en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01: es una conversión reciente y sin validación comunitaria documentada.
- Dependencia del ecosistema CrispASR: el uso práctico está ligado a esa herramienta; no se documentan exportaciones a otros runtimes.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/cstr/mini-bs-roformer-GGUF
- Modelo base original: https://huggingface.co/HiDolen/Mini-BS-RoFormer-V2.5-46.2M
- Licencia del modelo base: https://huggingface.co/HiDolen/Mini-BS-RoFormer-V2.5-46.2M/blob/main/LICENSE
- CrispASR (motor de inferencia C++/ggml): https://github.com/CrispStrobe/CrispASR
