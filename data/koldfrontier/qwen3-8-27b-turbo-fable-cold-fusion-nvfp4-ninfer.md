# koldfrontier/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NVFP4-NInfer

## Resumen

Este repositorio no contiene un modelo entrenado, sino un artefacto de inferencia: la conversión a formato NInfer v3 del ajuste fino DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un modelo multimodal de tipo image-text-to-text de aproximadamente 27 B de parámetros. Lo publica el usuario koldfrontier y su propósito es trasladar ese tune al mismo layout físico que el artefacto oficial neroued/Qwen3.8-27B-nvfp4-NInfer, de modo que pueda servirse con los mismos kernels y con la misma clase de rendimiento, pero con los pesos y la plantilla de chat del tune de DavidAU.

El artefacto empaqueta el stack de texto en NVFP4 (W4A4) para las proyecciones MLP de las capas 0-55 y FP8 con escalado por fila en el resto, más los pesos de visión y MTP en cuantización por grupos y una cabeza de propuesta indexada. El fichero único `qwen3_8_27b_turbo_fcf_nvfp4.ninfer` ocupa 21.492.901.636 bytes (20,02 GiB) y está pensado para ejecutarse en una única NVIDIA GeForce RTX 5090 de 32 GB bajo Linux o WSL2, con CUDA 13.1 o superior. Admite hasta 262.144 tokens de contexto sin visión y 151.552 con visión cargada.

Su relevancia es de nicho pero clara: demuestra un flujo de conversión reproducible (el script `davidau_qwen3_8_27b_nvfp4.py` se incluye en el repositorio) para llevar ajustes finos de Qwen3.8-27B con cuantización NVFP4 ya calibrada al runtime NInfer sobre arquitectura Blackwell, con decodificación especulativa MTP. La contrapartida es que exige hardware muy concreto, compilar NInfer desde fuente y no ofrece integración con los ecosistemas habituales de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer multimodal con torre de visión, MTP y cabeza de propuesta indexada) |
| Parametros totales | 27 B según la nomenclatura del modelo; la model card no desglosa el recuento exacto |
| Parametros activos | no disponible (no se declara que sea un MoE) |
| Longitud de contexto | 262.144 tokens sin visión; 151.552 tokens con visión cargada (`--max-context 151552`) |
| Tipos de cuantizacion | NVFP4 W4A4 en proyecciones MLP de capas 0-55; FP8 con escalado por fila (`fp8_row_maxabs`) en el resto del stack de texto; visión y MTP en cuantización por grupos (groupwise-int); KV cache en int8 |
| Idiomas soportados | no disponible; el corpus de perplejidad empleado incluye dominios en chino e inglés |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor NInfer versión 3); no hay safetensors ni GGUF |
| Tamano del artefacto | 21.492.901.636 bytes (20,02 GiB) |
| Nombre publico del modelo | `qwen3.8-27b-turbo-fcf` |
| Objetos almacenados | 1.180 (1.174 tensores y 6 recursos); 112 tensores NVFP4 y 146 tensores FP8 con escalado por fila |
| Componentes incluidos | texto, visión, MTP y cabeza de propuesta; sin DFlash2 |
| SHA-256 | `94af134b33da1860bb70b3ae34671d81465e42731b8196205bee8d97433cbac6` |
| Tokenizer | `tokenizer.json` / `tokenizer_config.json` stock de `Qwen/Qwen3.8-27B`, con `add_bos_token: false` |
| Plantilla de chat | `chat_template.jinja` de DavidAU, embebida; sustituible con `--chat-template FILE` |

## Arquitectura y entrenamiento

El artefacto no reentrena ni recuantiza desde cero. Las filas NVFP4 se importan sin cambios desde la cuantización con compressed-tensors calibrada por Solstice-AI, mientras que las filas FP8 se generan a partir de los pesos BF16 de DavidAU con el conversor propio de NInfer, que usa la receta `fp8_row_maxabs` y activaciones dinámicas por token en tiempo de ejecución, sin calibración. Sobre el texto conviven, por tanto, dos esquemas de cuantización en capas distintas, y a ellos se suman los pesos de visión y MTP en formato groupwise-int.

La innovación operativa es la decodificación especulativa integrada: el contenedor incluye una cabeza de propuesta indexada y soporte MTP, de modo que el servidor puede lanzarse con `--spec mtp --draft-tokens 3 --lm-head-draft`. La plantilla de chat del tune permite controlar el razonamiento mediante `reasoning_effort` (valores `xhigh` por defecto, `medium` y `low`) y `enable_thinking`, y el servidor puede preservar el bloque de pensamiento con `--preserve-thinking`.

No hay información en la model card sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si el tune base empleó RLHF, DPO u otro método de alineamiento: esos datos corresponden a la ficha del modelo base de DavidAU, que no se reproduce aquí. Tampoco se documenta el significado interno de las etiquetas "TURBO", "Cold Fusion", "Fable Fusion 711" o "Heretic" más allá de remitir a la ficha del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del tune.
- Entrada multimodal de imagen y texto (pipeline declarado `image-text-to-text`, componente de visión incluido; se activa con `--vision`).
- Modo de razonamiento explícito controlable mediante `enable_thinking` y `reasoning_effort` con tres niveles (`xhigh`, `medium`, `low`).
- Preservación del bloque de pensamiento en la salida del servidor (`--preserve-thinking`).
- Decodificación especulativa con MTP y tres tokens de borrador, con aceptación declarada del 85 % en generación de código.
- Generación de código: el corpus de evaluación interno incluye un dominio `ninfer_code` con la mejor perplejidad del conjunto (1,718).
- Cobertura multilingüe indirecta: los dominios de perplejidad `chinese_reference` y `english_reference` sugieren manejo competente de chino e inglés, aunque el modelo no declara lista de idiomas.
- Comportamiento "heretic/uncensored": el tune base está orientado a reducir los rechazos de contenido y el filtrado de seguridad.
- Soporte de tool calling y function calling: no disponible, no se documenta en la ficha.
- Soporte de agentes y razonamiento multi-paso: no disponible como característica declarada, aunque el modo thinking y MTP son compatibles con ese uso.

## Casos de uso

- Asistente local multimodal en una sola GPU: con `--vision` cargado y una ventana de 151.552 tokens, el modelo puede mantener conversaciones largas que intercalan capturas de pantalla, fotografías o diagramas con texto, todo en la propia estación de trabajo RTX 5090 sin depender de servicios externos.
- Generación de código en local con baja latencia: los 206 tok/s medidos en generación de código greedy con thinking desactivado y una aceptación MTP del 85 % lo hacen viable como autocompletado o asistente de refactorización en un IDE, siempre en modo un solo usuario (`--max-concurrency 1`).
- Análisis de documentación técnica extensa: los 262.144 tokens de contexto sin visión permiten cargar manuales, especificaciones o repositorios completos y formular preguntas sobre ellos sin troceado previo.
- Procesamiento de documentos escaneados con extracción razonada: la combinación de visión y modo thinking (nivel `xhigh`) permite describir, resumir y razonar sobre el contenido de facturas, formularios o artículos científicos a partir de imágenes.
- Prototipado de flujos de razonamiento con control de esfuerzo: `reasoning_effort` en `low`, `medium` o `xhigh` permite ajustar el coste computacional por consulta, útil para comparar estrategias de prompting sobre un mismo modelo sin cambiar de despliegue.
- Investigación sobre cuantización y decodificación especulativa: el repositorio incluye la receta de conversión, lo que permite reproducir el pipeline sobre otros ajustes de Qwen3.8-27B que ya tengan una cuantización NVFP4 en compressed-tensors.
- Evaluación de tunes "uncensored" en entornos controlados: al estar basado en un ajuste heretic, sirve para estudiar el comportamiento de modelos con filtrado reducido, siempre con las salvaguardas externas adecuadas.
- Generación de texto narrativo o creativo en local, con temperature recomendada de 0,6-0,7 y penalización por repetición desactivada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas son internas del runtime NInfer, tomadas en una RTX 5090 (32 GB, driver 610.62) bajo WSL2 Ubuntu 24.04, con `--kv-dtype int8`, MTP de 3 tokens de borrador, `--vision` cargado y `--max-context 151552`, con una sola petición.

Perplejidad (`ninfer-perplexity --corpus eval/corpora/perplexity-1m/manifest.json --kv-dtype int8`; corpus completo, 16 streams, contexto 4.096 / stride 2.048, 1.044.557 tokens puntuados):

| Dominio | Este artefacto (TURBO) | Artefacto oficial `Qwen3.8-27B-nvfp4-NInfer` |
|---|---:|---:|
| chinese_reference | 5,163 | 5,581 |
| english_long_form | 7,778 | 7,891 |
| english_reference | 5,644 | 6,220 |
| ninfer_code | 1,718 | 1,649 |
| **Global** | **4,448** | **4,617** |

El propio autor advierte que esta tabla compara dos modelos distintos bajo un mismo layout de conversión y que solo demuestra que la conversión produjo un modelo sano, no que un modelo sea mejor que el otro.

Rendimiento en generación (petición única):

| Escenario | Este artefacto | Artefacto oficial, misma máquina |
|---|---|---|
| Código, greedy, thinking off (372 vs. 700 tokens de salida) | 206 tok/s, aceptación MTP 85 % | 161 tok/s, aceptación 60 % |
| Prosa, greedy, thinking off (~600-700 tokens) | 124 tok/s, aceptación MTP 37 % | no disponible en la información proporcionada |

Estas cifras provienen de ejecuciones únicas sobre un puñado de prompts, no de una suite de benchmarks.

## Requisitos de hardware

- GPU obligatoria: NVIDIA GeForce RTX 5090 (32 GB, arquitectura `sm_120a`). No se documenta soporte para otras GPU.
- CUDA Toolkit 13.1 o superior; sistema de 64 bits Linux (WSL2 con Ubuntu 24.04 funciona).
- Runtime: NInfer en la revisión `9e163eee` (2026-09-18) o posterior, compilado desde fuente. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, y la ficha de HuggingFace marca `inference: false`.
- Consumo de memoria sin visión, con `--max-context 262144 --kv-capacity auto --kv-dtype int8`: 19,7 GiB de pesos, 9,30 GiB de runtime y 1,25 GiB libres; nvidia-smi reporta 30.636 MiB usados de 32.607.
- Consumo con visión: contexto máximo 151.552 tokens, KV cache en int8, concurrencia fijada a 1.
- Throughput medido: 206 tok/s en código greedy con thinking desactivado (aceptación MTP del 85 %) y 124 tok/s en prosa (aceptación del 37 %).
- Latencia por petición: no disponible.
- Cabe en GPU de consumo únicamente en el modelo especificado (RTX 5090); no se documenta su ejecución en RTX 4090, A100, H100 ni en configuraciones multi-GPU.
- Lanzamiento de referencia: `ninfer-serve models/qwen3_8_27b_turbo_fcf_nvfp4.ninfer --max-context 151552 --kv-capacity auto --max-concurrency 1 --kv-dtype int8 --spec mtp --draft-tokens 3 --lm-head-draft --preserve-thinking --vision`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Perplejidad global | Throughput (codigo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este artefacto (`koldfrontier/...-NVFP4-NInfer`) | ~27 B | 262.144 (sin visión); 151.552 (con visión) | `.ninfer`, NVFP4 + FP8 | 4,448 | 206 tok/s | apache-2.0 | 2 descargas, 0 likes |
| `neroued/Qwen3.8-27B-nvfp4-NInfer` (oficial) | ~27 B | no disponible | `.ninfer`, mismo layout físico | 4,617 | 161 tok/s | no disponible | artefacto oficial de referencia |
| `Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-...-NVFP4` | ~27 B | no disponible | compressed-tensors NVFP4 (origen de las filas NVFP4) | no disponible | no disponible | no disponible | usado como fuente de calibración |
| `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-...-NM-DAU` | ~27 B | no disponible | BF16 | no disponible (NInfer no ejecuta checkpoints BF16) | no disponible | no disponible | modelo base del tune |

La única comparación cuantitativa publicada es la de perplejidad y throughput frente al artefacto oficial stock, y el propio autor insiste en que no implica superioridad de un modelo sobre otro. No hay datos frente a modelos de la misma categoría fuera del ecosistema NInfer.

## Limitaciones y advertencias

- El contenedor no incluye el componente DFlash2, según se indica explícitamente en la sección de límites de la ficha.
- Dependencia dura de hardware: solo RTX 5090 (`sm_120a`) y CUDA 13.1 o superior. En cualquier otra GPU el artefacto no es utilizable.
- Requiere compilar NInfer desde fuente en una revisión concreta (`9e163eee` o posterior); no hay integración con vLLM, llama.cpp, Ollama o TGI, y la ficha declara `inference: false`.
- Concurrencia limitada a 1 en la configuración documentada: no está pensado para servir a múltiples usuarios simultáneos.
- Las métricas publicadas son ejecuciones únicas sobre pocos prompts, no una suite de benchmarks; no hay MMLU, HumanEval, GSM8K ni evaluaciones de alucinación.
- El modelo base es un tune etiquetado como "heretic" y "uncensored": cabe esperar una tasa reducida de rechazos y de filtrado de seguridad, lo que exige salvaguardas externas en cualquier despliegue orientado al público.
- Riesgo de alucinación: no medido ni documentado en la información disponible.
- Idiomas soportados: no declarados. La evidencia indirecta se limita a los dominios de perplejidad en chino e inglés.
- La licencia apache-2.0 corresponde al artefacto publicado; conviene verificar por separado la licencia y las condiciones del tune base de DavidAU y de la cuantización de Solstice-AI antes de un uso comercial.
- El uso de KV cache en int8 y de FP8 con activaciones dinámicas por token introduce pérdida de precisión respecto al modelo BF16 original, no cuantificada en la ficha.
- Adopción prácticamente nula: 2 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- El repositorio ocupa 21,5 GB, lo que condiciona el almacenamiento y la distribución del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/koldfrontier/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NVFP4-NInfer
- Modelo base (tune de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Cuantización NVFP4 de origen: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Artefacto oficial de referencia: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Repositorio de NInfer: https://github.com/Neroued/ninfer
- Revisión concreta requerida de NInfer: https://github.com/Neroued/ninfer/commit/9e163eee4b8acec21ab0ac765107b6a3f287b217
- Documentación de rendimiento de NInfer: https://github.com/Neroued/ninfer/tree/master/docs/performance
- Tokenizer stock: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta de conversión incluida en el repositorio: `davidau_qwen3_8_27b_nvfp4.py`
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a documentos sobre proyectos de reparcelación urbanística y no guardan relación con el modelo.
