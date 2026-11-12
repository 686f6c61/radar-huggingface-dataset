# NeosQ/LFM3-Omni-2B-Uncensored-ARA.gguf

## Resumen

LFM3-Omni-2B-Uncensored-ARA.gguf es una conversión a formato GGUF del checkpoint `NeosQ/LFM3-Omni-2B-Uncensored-ARA`, que a su vez deriva de `LiquidAI/LFM3-Omni-2B` tras aplicar una ablación de dirección de rechazo mediante ARA (Arbitrary-Rank Ablation). El modelo resultante es un checkpoint "abliterado" de tipo any-to-any: procesa texto, imagen y audio como entrada, y puede generar texto y voz como salida. El autor de la conversión es NeosQ, un tercero no afiliado a Liquid AI.

El modelo base es un transformer multimodal de aproximadamente 1.728 millones de parámetros (1,7B reales en safetensors, comercializado como "2B"), con un backbone de texto y un proyector multimodal separado que integra un codificador de visión, un codificador de audio, un depthformer y un códec de voz. La conversión GGUF mantiene esa separación: el fichero principal contiene solo el backbone de texto y requiere el fichero `mmproj-*` para cualquier entrada o salida multimodal.

Su relevancia es doble: por un lado, permite ejecutar un modelo any-to-any de menos de 2B parámetros en hardware de consumo mediante llama.cpp; por otro, elimina deliberadamente el mecanismo de rechazo del modelo original, lo que lo convierte en una herramienta de investigación sobre alineación y seguridad, no en un componente apto para producción. La licencia heredada (LFM Open License v1.0) impone sus propios umbrales de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de texto LFM3 + proyector multimodal con codificador de visión, codificador de audio, depthformer y códec de voz) |
| Parámetros totales | 1.728.801.600 (backbone de texto, dato real de safetensors); el proyector multimodal se distribuye aparte |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0 (embedding de tokens en F16), Q4_K_M; proyector en F16 |
| Idiomas soportados | no disponible (la model card menciona ASR en inglés como ejemplo) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), heredada de `LiquidAI/LFM3-Omni-2B` |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con un backbone de texto LFM3 y un proyector multimodal independiente que agrupa el codificador de visión, el codificador de audio, un depthformer y un códec de voz. Esta separación en dos ficheros (backbone de 287 tensores y proyector de 458 tensores) es la que permite usar el modelo solo para texto con un coste mínimo de memoria, o cargar el proyector cuando se necesita entrada de imagen, entrada de audio o salida de voz.

Sobre el entrenamiento original de `LiquidAI/LFM3-Omni-2B` no se proporciona información en la documentación disponible: no se indica número de tokens, composición del dataset ni si hubo RLHF o DPO. La modificación respecto al modelo base consiste en una ablación de rango arbitrario (ARA) que elimina la dirección de rechazo del checkpoint original; no hay reentrenamiento posterior. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` (BF16 para el backbone, F16 para el proyector) y `llama-quantize` para Q8_0 y Q4_K_M, sin imatrix ni datos de calibración. El modelo es explícitamente no razonador (non-reasoning).

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen: descripción y comprensión visual mediante el proyector multimodal.
- Entrada de audio: reconocimiento automático del habla (ASR) con instrucción de sistema para fijar el idioma.
- Salida de voz: síntesis de habla a través del códec incluido en el proyector.
- Procesamiento any-to-any: combinaciones de texto, imagen y audio como entrada con texto o voz como salida.
- No dispone de modo de razonamiento explícito; la model card indica usar `--reasoning off` en llama-server para evitar envoltorios en las respuestas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte específico de agentes o razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el único idioma mencionado explícitamente es el inglés para ASR.

## Casos de uso

- Investigación sobre alineación y seguridad: el checkpoint permite estudiar el comportamiento de un modelo sin dirección de rechazo y comparar sus respuestas con las del modelo base original, en un entorno controlado y con revisión humana.
- Transcripción de audio en local: cargando el proyector con `llama-mtmd-cli --audio` y una instrucción de sistema que fije el idioma, el modelo realiza ASR sobre ficheros WAV sin depender de servicios externos.
- Descripción de imágenes en dispositivos con poca memoria: con Q4_K_M (~1 GB) más el proyector F16 (~906 MiB), cabe en portátiles y equipos de gama media para tareas de captioning o accesibilidad.
- Prototipado de interfaces voz a voz: combinando entrada de audio y salida de voz en un mismo pipeline llama.cpp para experimentar con asistentes conversacionales hablados de baja latencia.
- Evaluación de cuantizaciones: el repositorio incluye BF16, Q8_0 y Q4_K_M del mismo checkpoint, lo que permite medir la degradación de calidad entre niveles en tareas de texto y multimodal.
- Docencia y demostraciones de modelos multimodales: el tamaño reducido y el soporte en llama.cpp facilitan ejecutar ejemplos de visión, audio y texto en un aula o en un equipo de desarrollo sin GPU dedicada.
- Generación de texto corto controlada: con los ajustes recomendados (`--temp 1.0 --top-p 0.95 --repeat-penalty 1.3 --repeat-last-n 1024`) produce pasajes de 800 a 2.000 caracteres de forma fiable, útil para resúmenes o descripciones breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM para texto: Q4_K_M ocupa ~1,0 GiB; Q8_0 ~1,9 GiB; BF16 ~3,2 GiB.
- VRAM/RAM para multimodal: hay que sumar el proyector F16, ~905,8 MiB, en cualquiera de los casos anteriores.
- Cabe en GPU de consumo: sí, con Q4_K_M o Q8_0 en tarjetas de 4-8 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060). El BF16 con proyector requiere del orden de 4,1 GiB.
- GPU de datacenter: no es necesario; A100 o H100 solo tendrían sentido para servir muchas instancias en paralelo.
- Despliegue: llama.cpp con soporte de LFM3/LFM3-Omni (probado en el build `b1-09338b8`; builds anteriores fallan con `unknown model architecture: 'lfm3'`). Herramientas: `llama-cli` para texto, `llama-mtmd-cli` para multimodal, `llama-server` para servidor HTTP en el puerto 8080.
- vLLM, TGI y Ollama no están documentados para este repositorio; la model card solo cubre llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-ARA (este) | 1,73B (backbone) | no disponible | texto, imagen, audio de entrada; texto y voz de salida | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-Omni-2B | no disponible | no disponible | texto, imagen, audio de entrada; texto y voz de salida | LFM Open License v1.0 | safetensors (original) |
| NeosQ/LFM3-Omni-2B-Uncensored-ARA | 1,73B (backbone) | no disponible | texto, imagen, audio de entrada; texto y voz de salida | LFM Open License v1.0 | safetensors |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros autores. No disponible para el resto de la categoría.

## Limitaciones y advertencias

- Checkpoint abliterado: responde a solicitudes que el modelo base rechaza y puede generar contenido inseguro o ilegal. La propia model card lo marca como solo para investigación y no apto para producción ni para uso orientado al consumidor.
- Riesgo elevado de alucinación y de deriva en respuestas largas: con los valores por defecto de llama.cpp el modelo entra en bucles, se desvía hacia código o colapsa en esquemas. Requiere `--repeat-penalty 1.3`, `--repeat-last-n 1024`, `--temp 1.0` y `--top-p 0.95` para mantener la coherencia.
- Ventana de contexto no documentada; la recomendación de generar por secciones para textos superiores a 2.000 caracteres sugiere un margen práctico limitado.
- Idiomas soportados no documentados; el único caso verificado en la model card es ASR en inglés.
- Sin soporte documentado de tool calling, function calling ni flujos de agentes.
- Licencia LFM Open License v1.0: se heredan todos sus términos, incluido el umbral de uso comercial, que deben revisarse antes de cualquier despliegue comercial.
- La conversión es comunitaria y no está afiliada ni respaldada por Liquid AI; no hay garantía de soporte.
- El fichero principal es solo de texto: sin el `mmproj-*` no hay entrada de imagen ni de audio ni salida de voz, y el usuario puede obtener errores si asume lo contrario.
- Requiere un build reciente de llama.cpp con soporte de la arquitectura `lfm3`; versiones anteriores fallan al cargar el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-ARA.gguf
- Modelo base de la conversión (safetensors): https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-ARA
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- README en chino: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-ARA.gguf/blob/main/README_zh.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
