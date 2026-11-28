# satellitedown/Ling-3.2-air-airengine

## Resumen

Ling-3.2-air-airengine es un empaquetado del modelo Ling-3.2-air de inclusionAI, un transformer de tipo mixture-of-experts (MoE) con 124.000 millones de parámetros totales y 5.500 millones activos por token, publicado originalmente bajo licencia MIT. Este repositorio no contiene los pesos originales ni un fine-tune, sino la cuantización Maya-M de Project Maya (mayoritariamente IQ2_S en los expertos enrutados) reempaquetada en un formato binario propio para que el motor de inferencia airengine pueda ejecutarla.

El interés del paquete es de despliegue: airengine es un motor C++/CUDA escrito específicamente para este modelo, capaz de servir los 262.144 tokens de contexto en una única RTX 5090 de 32 GB combinándola con 64 GB de RAM. Los 512 expertos enrutados por capa no caben en la VRAM, de modo que el motor mantiene en la GPU los expertos más utilizados y calcula el resto en CPU con AVX-512, apoyándose en perfiles de enrutamiento incluidos en el repositorio y en estadísticas que recoge durante el servicio.

Es relevante para desarrolladores que quieran evaluar un MoE de gran tamaño en hardware de consumo de gama alta: el autor reporta entre 360 y 480 tokens/s de generación y unos 7.400 tokens/s de lectura de prompt en una RTX 5090, aproximadamente el doble que maya-ling sobre los mismos pesos. El repositorio tiene 46,1 GB y, en el momento de redactar esta ficha, cero descargas y cero likes, por lo que se trata de una publicación comunitaria reciente y sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con capas de atención KDA y MLA, expertos compartidos y bloque MTP para decodificación especulativa |
| Parámetros totales | 124.000 millones (124B) |
| Parámetros activos | 5.500 millones (5,5B) por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | IQ2_S, IQ2_XS, IQ2_XXS, IQ3_XXS en expertos enrutados; Q8_0 y FP32/BF16 en capas densas; IQ4_NL en expertos del bloque MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos de Ling-3.2-air y cuantización Maya-M); airengine es Apache-2.0 |
| Formato de pesos | Formato binario propio de airengine (`experts.bin`, `dense.bin`, `mtp_experts.bin`, `manifest.json`); no compatible con otros motores |
| Expertos enrutados | 512 por capa (capas 2-41) |
| Tamaño del repositorio | 46,1 GB |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air es un transformer MoE con 512 expertos enrutados por capa y 5,5B parámetros activos por token, que combina capas de atención KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) junto con expertos compartidos. Incluye un bloque MTP (Multi-Token Prediction) que airengine utiliza como cabecera de borrador para decodificación especulativa: el borrador puntúa 32.768 token ids y cada propuesta se verifica siempre contra el modelo completo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

Este repositorio concreto no reentrena ni modifica los pesos: aplica la cuantización Maya-M de Project Maya (mayoritariamente IQ2_S en los expertos enrutados, con bloques IQ2_XS, IQ2_XXS e IQ3_XXS, y Q8_0/FP32/BF16 en las capas densas) y la repaqueta con la herramienta `native/tools/convert.py` de airengine, que copia los bloques cuantizados sin recuantizar. La conversión parte del GGUF `Ling-3.2-air-Maya-M-IQ2_S.gguf` de peasantsmith y del tokenizer y la configuración de inclusionAI/Ling-3.2-air.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito, controlable mediante `reasoning_effort` (`none` lo desactiva) y `enable_thinking: false`.
- Separación del contenido de razonamiento en el campo `reasoning_content` de la API.
- Decodificación especulativa con el bloque MTP propio del modelo, con verificación completa de cada borrador.
- Servicio mediante API compatible con OpenAI Chat Completions (`/v1/chat/completions`, `/v1/models`) con streaming.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling, function calling y flujos de agente: no documentado en la información proporcionada; el README de GitHub de airengine menciona configuración de agentes (incluido Oh My Pi), pero sin detallar el soporte de herramientas del modelo.
- Visión y audio: no disponible.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir informes, expedientes o bases de código completas en una sola petición y responder preguntas sobre ellos sin fragmentación.
- Asistente de razonamiento con thinking mode: aplicaciones que necesitan trazas de razonamiento separadas del texto final (por ejemplo, verificación de cálculos o depuración de decisiones) pueden consumir `reasoning_content` y desactivar el pensamiento con `reasoning_effort: none` cuando prima la latencia.
- Servicio local de chat para un único desarrollador o equipo pequeño: el motor expone una API compatible con OpenAI en `127.0.0.1:8004`, de modo que clientes y SDK existentes funcionan sin cambios, con la advertencia de no exponer el servidor sin autenticación.
- Evaluación de MoE de gran tamaño en hardware de consumo: una RTX 5090 más 64 GB de RAM permiten estudiar el comportamiento de un modelo de 124B con 5,5B activos sin recurrir a clústeres multi-GPU.
- Generación de código y texto a alta velocidad: los 360-480 tokens/s reportados en una RTX 5090 hacen viable la generación interactiva de fragmentos largos en un puesto de trabajo local.
- Prototipado de pipelines con contexto masivo: gracias a la lectura de prompt a unos 7.400 tokens/s, es posible iterar sobre prompts de decenas de miles de tokens sin penalizaciones severas de tiempo de espera.
- Experimentación con decodificación especulativa: el bloque MTP y el perfil de borrador incluidos permiten medir el impacto de la verificación especulativa sobre los mismos pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas de inferencia en una RTX 5090 con 64 GB de RAM:

| Métrica | Valor reportado |
|---|---|
| Generación | 360-480 tokens/s |
| Lectura de prompt | ~7.400 tokens/s |
| Comparación con maya-ling (mismos pesos) | ~2x más rápido |

## Requisitos de hardware

- GPU: NVIDIA RTX 5090 (32 GB, compute capability 12.0). airengine se compila solo para `sm_120a`, por lo que no funciona en otras GPU.
- CPU: AVX-512 con VNNI, BF16, VBMI, BITALG y VPOPCNTDQ; es decir, AMD Zen 4/Zen 5 (Ryzen 7000 o superior, EPYC 9004 o superior) o Intel Sapphire Rapids o superior en servidor/estación de trabajo.
- RAM: 64 GB, de los cuales unos 22 GiB de expertos quedan fijados en memoria (pinned).
- Almacenamiento: unos 50 GB (46 GB del repositorio, ~3 GB de toolkit CUDA, herramientas y compilación). La carpeta del modelo debe ser escribible porque airengine guarda `routing-stats.bin`.
- Sistema: Linux x86_64 con driver NVIDIA para CUDA 13 (580 o superior), compilador C++20 (GCC 12-16), pkg-config y las cabeceras de desarrollo de liburing.
- Despliegue: exclusivamente mediante airengine (`airengine start` o `airengine-serve --pack ... --ctx 262144`). No es compatible con vLLM, llama.cpp, Ollama ni TGI; para esos motores hay que usar el GGUF de Project Maya o los pesos originales.
- VRAM estimada: el paquete está diseñado para ocupar hasta 32 GB de VRAM con los expertos más usados en GPU y el resto en RAM; no se documenta un reparto alternativo para GPU de menor capacidad.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato y motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.2-air-airengine | 124B / 5,5B | 262.144 | Binario propio de airengine | MIT | Repositorio con 0 descargas; requiere RTX 5090 |
| Ling-3.2-air (inclusionAI) | 124B / 5,5B | 262.144 | Pesos originales; motores estándar | MIT | Modelo base oficial en Hugging Face |
| Ling-3.2-air-Maya-GGUF (Project Maya) | 124B / 5,5B | 262.144 | GGUF (IQ2_S y variantes); llama.cpp y afines | MIT | Repositorio comunitario de cuantización |
| maya-ling (Project Maya) | 124B / 5,5B | 262.144 | Formato propio de maya-ling | MIT | Motor alternativo sobre los mismos pesos; el autor reporta ~2x menos velocidad que airengine |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de calidad frente a modelos de tamaño similar; la comparación anterior se limita a parámetros, contexto, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Cuantización muy agresiva: los expertos enrutados están mayoritariamente en IQ2_S, con bloques IQ2_XS e IQ2_XXS, lo que degrada la calidad respecto a los pesos originales en BF16. No se han publicado evaluaciones de la pérdida de calidad.
- Compatibilidad de hardware extremadamente restringida: solo RTX 5090 (sm_120a) y CPU con AVX-512 completo; no funciona en A100, H100, RTX 4090 ni en CPU sin VNNI.
- Motor único: el formato binario solo lo lee airengine; no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- Publicación comunitaria sin validación: cero descargas y cero likes en el momento de la ficha, sin revisión independiente de las métricas de velocidad ni de la integridad funcional.
- Rendimiento dependiente del perfil de enrutamiento: la velocidad depende de qué expertos residen en GPU; el motor recoge estadísticas durante el servicio y ajusta el reparto, por lo que el rendimiento puede variar con la carga y el dominio del texto.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; son los heredados del modelo base Ling-3.2-air, sin evaluación publicada en este paquete.
- Seguridad de despliegue: el servidor no incluye autenticación; el autor advierte explícitamente de no exponerlo a redes no confiables.
- Licencia: los pesos son MIT y airengine Apache-2.0, lo que permite uso comercial, pero el paquete es una release no oficial no respaldada por inclusionAI ni por Project Maya y se distribuye "tal cual", sin garantía.
- Almacenamiento escribible obligatorio: la carpeta del modelo debe permitir escritura para `routing-stats.bin`, lo que complica despliegues en sistemas de ficheros de solo lectura.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/satellitedown/Ling-3.2-air-airengine
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Cuantización GGUF de Project Maya: https://huggingface.co/peasantsmith/Ling-3.2-air-Maya-GGUF
- Repositorio de Project Maya: https://github.com/mw00/project-maya
- Motor airengine: https://github.com/satellitedown/airengine
- README de airengine (mediciones, opciones y configuración de agentes): https://github.com/satellitedown/airengine#readme
- Script de instalación: https://raw.githubusercontent.com/satellitedown/airengine/main/get.sh
