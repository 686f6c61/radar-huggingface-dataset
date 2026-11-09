# DavidAU/Llama-3.3-70B-Instruct-How-To-Run-on-Low-BPW-IQ1_S-IQ1_M-at-maximum-speed-quality

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino una guía práctica y un conjunto de ajustes de muestreo (samplers, temperatura, top-p, top-k y parámetros afines) para ejecutar el modelo Llama-3.3-70B-Instruct de Meta en cuantizaciones GGUF de muy bajo BPW (bits por peso), concretamente IQ1_S e IQ1_M. El objetivo declarado es doble: cargar un modelo de 70.000 millones de parámetros en una GPU de consumo de 16 GB (el autor cita una RTX 4060 Ti) con una ventana de contexto de 2048 tokens y obtener velocidades de 13-15 tokens por segundo, y maximizar la calidad de generación en ese régimen de cuantización extrema mediante la configuración de decodificación. Los pesos cuantizados en sí se descargan de un repositorio de terceros (mradermacher/Llama-3.3-70B-Instruct-i1-GGUF), no de este.

La relevancia del recurso es práctica y acotada: demuestra que un transformer denso de 70B puede ejecutarse en hardware de gama media-consumo si se acepta una compresión agresiva (en torno a 1-2 bits por peso) y una pérdida de calidad no cuantificada formalmente. No introduce arquitectura nueva, ni pesos originales, ni resultados de benchmarks; aporta recetas operativas para llama.cpp, KoboldCpp, SillyTavern y text-generation-webui, además de ejemplos de generación con tres configuraciones distintas de muestreo.

La licencia declarada del repositorio es Apache-2.0, pero esa licencia cubre la documentación y los ajustes publicados, no necesariamente los pesos subyacentes de Llama-3.3, que se rigen por la Llama 3.3 Community License de Meta. Esta distinción es crítica para cualquier uso comercial y se detalla en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama-3.3-70B-Instruct); el repositorio es una guía de configuración, no un modelo propio |
| Parámetros totales | 70.000 millones (modelo base de referencia) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens en la configuración demostrada; el modelo base Llama-3.3 soporta contextos mayores, pero no se documenta en esta ficha |
| Tipos de cuantización | IQ1_S e IQ1_M (GGUF de muy bajo BPW); el autor indica que los ajustes sirven también para IQ2 y para cualquier modelo de 70B en cuantizaciones bajas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 declarada en el repositorio (los pesos de Llama-3.3 subyacentes tienen su propia licencia de Meta) |
| Formato de pesos | GGUF (los pesos cuantizados se alojan en mradermacher/Llama-3.3-70B-Instruct-i1-GGUF) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica pesos. Describe cómo operar Llama-3.3-70B-Instruct, un transformer denso decoder-only de Meta con 70.000 millones de parámetros, cuantizado a formatos GGUF IQ1_S e IQ1_M mediante las rutinas de cuantización de llama.cpp. La innovación del recurso no está en el modelo sino en la receta de inferencia: tres perfiles de muestreo ("CORE", "CORE MED w TEMP" y "CORE MED w TEMP w Dynm TEMP") pensados para compensar la degradación que introduce una cuantización de 1-2 bits por peso, aplicables según el autor a cualquier modelo de 70B en IQ1_S o IQ1_M.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO) no se documentan en la información disponible. Tampoco se documentan innovaciones de decodificación como decodificación especulativa o atención lineal; la receta se limita a parámetros de muestreo y a la configuración de carga de capas en GPU (`-ngl 99`) y contexto (`-c 2048`).

## Capacidades

- Generación de texto creativo y narrativo: los ejemplos incluidos son relatos de ciencia ficción de 800-1000 palabras generados a 2048 tokens de contexto.
- Conversación multi-turno en el rango de contexto configurado (2048 tokens), adecuada para chats e interacciones con rol.
- Razonamiento y conocimiento general heredados de Llama-3.3-70B-Instruct, sujetos a la degradación propia de IQ1_S/IQ1_M.
- Integración con frontends de chat: SillyTavern, KoboldCpp, llama-server y text-generation-webui.
- Compatibilidad con el ecosistema GGUF de llama.cpp, incluida la carga completa en GPU mediante offload de capas.
- Tool calling, function calling, agentes y modo thinking: no documentados en la información disponible para esta configuración; deben asumirse degradados o no verificados a este nivel de cuantización.
- Capacidades multimodales o de audio: no disponibles.

## Casos de uso

- Ejecución local de un 70B en GPU de consumo: cargar IQ1_S con `llama-server -m modelo.gguf -c 2048 -ngl 99` en una RTX 4060 Ti de 16 GB y obtener 13-15 t/s, útil para experimentar con modelos grandes sin infraestructura de datacenter.
- Escritura creativa y narrativa asistida: los ejemplos del autor muestran relatos largos generados con los tres perfiles de muestreo; el perfil "CORE MED w TEMP w Dynm TEMP" está pensado para mantener variedad sin colapsar en repeticiones pese a la baja precisión de los pesos.
- Prototipado de chatbots con SillyTavern: conectar llama-server o KoboldCpp a SillyTavern con contexto de 2048 tokens para probar personajes y flujos conversacionales antes de invertir en hardware mayor.
- Evaluación de cuantizaciones extremas: usar el repositorio como referencia para comparar IQ1_S, IQ1_M e IQ2 sobre el mismo modelo y decidir el compromiso calidad/VRAM en un despliegue concreto.
- Docencia y divulgación sobre cuantización GGUF: ilustrar de forma reproducible qué significa 1-2 bits por peso, cómo afecta al uso de VRAM y qué papel juegan los samplers en la calidad percibida.
- Laboratorio de investigación sobre muestreo: el autor enmarca los ajustes en un proyecto sobre maximización de calidad a BPW ultra bajo, por lo que sirve como punto de partida para experimentos controlados con temperatura dinámica y samplers avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es empírico y operativo: 13-15 tokens por segundo en una RTX 4060 Ti de 16 GB con contexto de 2048 tokens, y la indicación de que tarjetas de gama alta serían "el doble o más" rápidas. No se aportan métricas de perplejidad, MMLU, HumanEval ni GSM8K para IQ1_S o IQ1_M.

## Requisitos de hardware

- VRAM estimada: 16 GB para IQ1_S con contexto de 2048 tokens y todas las capas en GPU (`-ngl 99`), según la demostración del autor.
- GPU validadas en la guía: NVIDIA RTX 4060 Ti de 16 GB (13-15 t/s). El autor afirma que tarjetas de gama alta serán al menos el doble de rápidas, sin especificar modelos.
- GPU de consumo: sí, en tarjetas con 16 GB o más; no se documenta el comportamiento en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp (llama-server.exe, build CUDA), KoboldCpp 1.79, text-generation-webui (con loader `llamacpp_HF` para acceso a todos los ajustes) y SillyTavern como frontend.
- Latencia y throughput: 13-15 t/s en RTX 4060 Ti 16 GB a 2048 tokens de contexto; sin datos de latencia de primer token ni de throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto en esta configuración | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.3-70B-Instruct IQ1_S/IQ1_M (este recurso) | 70B | 2048 tokens | IQ1_S / IQ1_M (GGUF) | Apache-2.0 en el repo; pesos sujetos a licencia de Meta | Pesos en mradermacher/Llama-3.3-70B-Instruct-i1-GGUF |
| Llama-3.3-70B-Instruct en cuantizaciones estándar (Q4_K_M, Q5_K_M) | 70B | Mayor, según VRAM disponible | 4-5 bits por peso | Licencia de Meta | Repositorios GGUF de la comunidad |
| Modelos densos de 7B-13B en Q4/Q5 | 7B-13B | Contexto completo del modelo base | 4-5 bits por peso | Variable según modelo | Amplia en Hugging Face |

La comparación relevante no es de calidad medida, que no se aporta, sino de compromiso VRAM/calidad: IQ1_S permite meter un 70B en 16 GB, mientras que un 7B-13B en Q4 ofrece mayor fidelidad por parámetro pero menor conocimiento y capacidad de razonamiento. No hay datos de benchmarks que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- La cuantización a IQ1_S/IQ1_M (en torno a 1-2 bits por peso) degrada la calidad de forma significativa; el repositorio no cuantifica esa pérdida con métricas objetivas.
- El contexto demostrado es de solo 2048 tokens; no se documenta el comportamiento a contextos mayores en esta cuantización.
- El repositorio no contiene pesos propios: depende de un repositorio de terceros para el GGUF, lo que introduce un riesgo de disponibilidad y de integridad de los artefactos.
- La licencia Apache-2.0 declarada cubre la documentación y los ajustes, pero los pesos de Llama-3.3 se rigen por la Llama 3.3 Community License de Meta; verificar los términos antes de cualquier uso comercial.
- Riesgo de alucinación y de repeticiones exacerbado por la baja precisión de los pesos; los perfiles de muestreo del autor mitigan pero no eliminan este problema.
- Sesgos: no documentados en la información disponible; heredados del modelo base y potencialmente amplificados por la cuantización.
- Idiomas soportados: no disponibles en la ficha; el modelo base es multilingüe, pero no se verifica su comportamiento en esta cuantización.
- Los ajustes de muestreo son heurísticos y fruto de experimentación del autor; no hay validación independiente ni comparación controlada con configuraciones por defecto.
- El repositorio tiene 0 descargas y 8 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DavidAU/Llama-3.3-70B-Instruct-How-To-Run-on-Low-BPW-IQ1_S-IQ1_M-at-maximum-speed-quality
- Pesos GGUF IQ1_S/IQ1_M (terceros): https://huggingface.co/mradermacher/Llama-3.3-70B-Instruct-i1-GGUF
- Guía de samplers y parámetros del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- llama.cpp: https://github.com/ggerganov/llama.cpp
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- SillyTavern: https://github.com/SillyTavern/SillyTavern
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
