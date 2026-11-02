# narrivy/store

## Resumen

Narrivy Store es un repositorio agregador publicado por narrivy en HuggingFace que reúne, en un único punto, todos los paquetes que la aplicación de dictado Narrivy puede instalar desde su Store. No se trata de un modelo único entrenado por el autor, sino de una colección de artefactos listos para producción: modelos de reconocimiento de voz en formato GGUF y OpenVINO IR, modelos de lenguaje para limpieza de texto y asistente, el runtime de OpenVINO con su driver de NPU de Intel, y módulos complementarios como supresión de ruido o asistente de escritura. La app instala cada pack fijando una revisión concreta del repositorio y verifica cada archivo contra el manifiesto del pack antes de usarlo.

El repositorio tiene un tamaño de 10,5 GB y declara 618.309.121 parámetros totales en safetensors, un dato que corresponde al agregado de los distintos componentes y no a un único modelo. La pipeline declarada es `automatic-speech-recognition`, coherente con el peso de los packs de voz (Parakeet, Whisper large-v3 y Whisper large-v3 turbo en varias cuantizaciones). La licencia es `other` con nombre `per-pack`: cada carpeta tiene su propia licencia (CC-BY-4.0, Apache-2.0, MIT o Apache-2.0 con cláusula de naming), lo que obliga a revisar cada pack por separado antes de redistribuirlo o integrarlo comercialmente.

Su relevancia práctica es la de servir como canal de distribución reproducible para una app de dictado: en lugar de que el usuario descargue modelos sueltos de distintos repositorios, Narrivy fija revisiones, valida manifiestos y ofrece variantes optimizadas para CPU, GPU Vulkan, GPU Intel y NPU Intel. Es, por tanto, más un índice de artefactos con control de integridad que un modelo investigable por sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregado heterogeneo: modelos de voz (Parakeet, Whisper) y modelos de lenguaje (Qwen3.5 4B, S1-mini) en distintos formatos |
| Parametros totales | 618.309.121 (dato safetensors del repo, agregado de componentes) |
| Parametros activos | no disponible (no es un modelo MoE unico) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0, GGUF Q5_K_M, OpenVINO IR INT8, OpenVINO IR INT4 |
| Idiomas soportados | no disponible (los packs de voz incluidos, Parakeet Unified EN y Whisper large-v3, cubren ingles y multilingue respectivamente, segun sus propios repositorios) |
| Licencia | other / per-pack (CC-BY-4.0, Apache-2.0, MIT y Apache-2.0 con clausula de naming segun el pack) |
| Formato de pesos | GGUF, OpenVINO IR, safetensors (metadato del repo) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia ni documenta un proceso de entrenamiento: es un contenedor de artefactos de terceros empaquetados por Narrivy. Los packs de voz incluyen Parakeet Unified EN 0.6B en GGUF Q8_0 (731 MB, streaming, licencia CC-BY-4.0), Whisper large-v3 en GGUF Q5_K_M (1.161 MB) y en OpenVINO IR INT8 (1.568 MB), y Whisper large-v3 turbo en GGUF Q8_0 (886 MB), OpenVINO IR INT8 (828 MB) y variante MIT. Los packs de lenguaje incluyen Qwen3.5 4B en OpenVINO IR INT4 (3.577 MB) para el asistente de IA y S1-mini de Superwhisper en OpenVINO IR INT8 (623 MB) para la limpieza de texto.

La innovación técnica del repositorio está en el mecanismo de distribución y verificación, no en los modelos: instalación a una revisión fijada (pinned revision), comprobación de cada archivo contra el manifiesto del pack, y separación de runtimes (OpenVINO 2026.4.0 para linux-x86_64, 292 MB, con librerías y driver de NPU de Intel). No se dispone de información sobre tokens de entrenamiento, composición de datasets ni uso de RLHF/DPO para ninguno de los componentes.

## Capacidades

- Reconocimiento automático de voz (ASR) en streaming con Parakeet Unified EN 0.6B, orientado a dictado en tiempo real sobre CPU o GPU Vulkan.
- Transcripción multilingüe con Whisper large-v3 y Whisper large-v3 turbo, en variantes GGUF y OpenVINO IR.
- Limpieza y post-procesado de texto dictado mediante S1-mini de Superwhisper, empaquetado en OpenVINO IR INT8.
- Asistente de IA basado en Qwen3.5 4B en OpenVINO IR INT4, ejecutado por OpenVINO GenAI.
- Aceleración por hardware Intel: NPU, GPU y CPU a través del add-on de OpenVINO y su driver de NPU.
- Ejecución en CPU y GPU Vulkan mediante el motor interno transcribe.cpp para los packs GGUF.
- Módulos adicionales publicados como add-ons, entre ellos supresión de ruido y asistente de escritura.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de ASR ni modo thinking en la información disponible.

## Casos de uso

- Dictado en tiempo real en escritorio: el pack Parakeet Unified EN 0.6B en GGUF Q8_0 (731 MB) permite transcripción en streaming sobre CPU o GPU Vulkan, adecuado para aplicaciones de dictado con requisitos de latencia baja y sin dependencia de GPU dedicada.
- Transcripción multilingüe de reuniones: Whisper large-v3 en OpenVINO IR INT8 (1.568 MB) o GGUF Q5_K_M (1.161 MB) cubre audio multilingüe y se puede ejecutar en CPU Intel o NPU, útil para actas y subtitulado posterior.
- Subtitulado rápido con requisitos de memoria ajustados: Whisper large-v3 turbo en GGUF Q8_0 (886 MB) o OpenVINO IR INT8 (828 MB) reduce el coste computacional frente a large-v3 completo, adecuado para transcripciones de baja latencia en portátiles.
- Limpieza automática de transcripciones: S1-mini en OpenVINO IR INT8 (623 MB) se usa como paso posterior al ASR para eliminar muletillas, corregir puntuación y normalizar el texto dictado antes de insertarlo en el editor.
- Asistente de escritura integrado: Qwen3.5 4B en OpenVINO IR INT4 (3.577 MB) ejecutado por OpenVINO GenAI en NPU o GPU Intel permite reescritura, resumen y generación de texto dentro de la propia app de dictado sin salir del dispositivo.
- Despliegue en equipos Intel sin GPU dedicada: el runtime OpenVINO 2026.4.0 con driver de NPU permite ejecutar los packs de voz y de lenguaje en NPU o iGPU Intel, lo que habilita dictado y asistente en portátiles de oficina.
- Distribución reproducible de modelos en una app de escritorio: el mecanismo de revisión fijada y verificación por manifiesto sirve como referencia para empaquetar modelos de terceros con control de integridad en aplicaciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los packs de voz van de 623 MB a 1.568 MB en disco; el pack de lenguaje mayor (Qwen3.5 4B INT4) ocupa 3.577 MB. El consumo en ejecución no está documentado.
- GPU recomendadas: el repositorio apunta explícitamente a hardware Intel (NPU, GPU y CPU) mediante OpenVINO, y a GPU Vulkan genéricas mediante transcribe.cpp. No se listan modelos concretos de GPU (A100, H100, RTX 4090) en la información disponible.
- Cabe en hardware de consumo: sí, por tamaño de los packs; los modelos de voz y el modelo de lenguaje INT4 están pensados para ejecutarse en equipos de escritorio y portátiles con CPU, iGPU o NPU Intel.
- Opciones de despliegue: motor interno transcribe.cpp para GGUF, add-on OpenVINO con OpenVINO GenAI para los packs IR, y el runtime OpenVINO 2026.4.0 linux-x86_64 incluido en el repositorio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Narrivy Store (este repo) | 618.309.121 agregados | no disponible | GGUF, OpenVINO IR, safetensors | per-pack | Agregador de packs para app de dictado |
| Whisper large-v3 (repo original) | ~1.550 M | 30 s de audio por ventana | safetensors, varios | Apache-2.0 | ASR multilingue |
| Parakeet Unified EN 0.6B (repo original) | ~600 M | no disponible | varios | CC-BY-4.0 | ASR en ingles, streaming |
| Qwen3.5 4B (repo original) | ~4.000 M | no disponible | safetensors, GGUF | Apache-2.0 | LLM generalista |

La comparación relevante es contra los repositorios originales de cada componente: Narrivy Store no añade capacidades de modelo, sino empaquetado, cuantización y verificación por manifiesto para su app. Frente a descargar cada modelo por separado, la ventaja es la reproducibilidad y la integración con OpenVINO y transcribe.cpp; la desventaja es que las licencias son heterogéneas y dependen del pack.

## Limitaciones y advertencias

- No es un modelo entrenado por narrivy: los pesos pertenecen a terceros (NVIDIA Parakeet, OpenAI Whisper, Qwen, Superwhisper) y las condiciones de uso dependen de cada pack.
- Licencia `other` con nombre `per-pack`: es obligatorio revisar la licencia de cada carpeta antes de uso comercial o redistribución; hay packs CC-BY-4.0, Apache-2.0, MIT y Apache-2.0 con cláusula de naming (S1-mini).
- Idiomas soportados no declarados a nivel de repositorio: la cobertura lingüística depende del pack concreto (Parakeet Unified EN es solo inglés; Whisper large-v3 es multilingüe).
- No se documentan benchmarks, latencias ni consumo de memoria en ejecución, lo que dificulta estimar rendimiento en producción sin pruebas propias.
- El repositorio está orientado a la app Narrivy: el mecanismo de instalación asume revisión fijada y verificación por manifiesto, por lo que no está pensado para consumo directo con vLLM, llama.cpp u otros servidores de inferencia.
- Riesgo de alucinación y sesgos: no evaluado ni documentado para ninguno de los componentes empaquetados.
- El runtime incluido es únicamente linux-x86_64 (OpenVINO 2026.4.0); no se ofrecen builds para otras plataformas en la información disponible.
- El resultado de búsqueda web proporcionado (un localizador de tiendas Lidl) no está relacionado con el modelo y no aporta información técnica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/narrivy/store
- Pack Parakeet Unified EN 0.6B (GGUF Q8_0): https://huggingface.co/narrivy/store/tree/main/models/gguf/parakeet-unified-en-0.6b-q8-0
- Pack Whisper large-v3 (GGUF Q5_K_M): https://huggingface.co/narrivy/store/tree/main/models/gguf/whisper-large-v3-q5-k-m
- Pack Whisper large-v3 turbo (GGUF Q8_0): https://huggingface.co/narrivy/store/tree/main/models/gguf/whisper-large-v3-turbo-q8-0
- Pack Whisper large-v3 (OpenVINO IR INT8): https://huggingface.co/narrivy/store/tree/main/models/openvino/whisper-large-v3-int8
- Pack Whisper large-v3 turbo (OpenVINO IR INT8): https://huggingface.co/narrivy/store/tree/main/models/openvino/whisper-large-v3-turbo-int8
- Pack Qwen3.5 4B (OpenVINO IR INT4): https://huggingface.co/narrivy/store/tree/main/models/llm/qwen3.5-4b-int4-ov
- Pack S1-mini (OpenVINO IR INT8): https://huggingface.co/narrivy/store/tree/main/models/llm/s1-mini-int8-cw-ov
- Runtime OpenVINO 2026.4 linux-x86_64: https://huggingface.co/narrivy/store/tree/main/runtimes/openvino/2026.4-linux-x86_64
