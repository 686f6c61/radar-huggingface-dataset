# istitov/Qwen3.8-27B-llmfan46-Ultra-Heretic-NPU2

## Resumen

Qwen3.8-27B-llmfan46-Ultra-Heretic-NPU2 es una conversion comunitaria no oficial del modelo denso Qwen3.8-27B de Qwen, en su variante "Heretic" sin censura creada por llmfan46, empaquetada en el formato Q4NX propietario de FastFlowLM para ejecutarse exclusivamente sobre NPUs AMD XDNA 2 (familia Ryzen AI 300 y posteriores). No es un GGUF: no carga en Transformers, llama.cpp ni Ollama, y no funciona con OpenFlowLM. El repositorio lo mantiene el usuario istitov y no esta afiliado ni respaldado por Qwen, llmfan46, AMD ni el proyecto FastFlowLM.

El modelo base es un transformer denso de 27B parametros con cabeza de prediccion multi-token (MTP) que redacta borradores de tokens para acelerar la decodificacion, y admite entrada de texto e imagenes (pipeline image-text-to-text). La conversion solo recuantiza y reempaqueta los pesos originales: no se entrena nada. El resultado ocupa 18,1 GB, soporta 4.096 tokens de contexto por defecto y como maximo 8.192, y decodifica a 1,4-2,7 tokens/s en un Ryzen AI 9 HX 370, lo que lo situa como una opcion experimental para inferencia local en NPU, no como sustituto de GPU.

Su relevancia es acotada pero especifica: demuestra que es posible llevar un modelo de 27B con vision y MTP a una NPU de portatil mediante cuantizacion Q4NX, y ofrece una variante con menos rechazos (3/100 frentes a 91/100 del Qwen3.8 original, segun cifras de llmfan46) para casos donde las politicas de seguridad del modelo stock interfieren. El coste es un ecosistema cerrado, latencia alta y una licencia Apache 2.0 que no exime al usuario de responsabilidad sobre el contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con cabeza de prediccion multi-token (MTP); entrada texto e imagen |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens por defecto; maximo 8.192 |
| Tipos de cuantizacion | Q4NX (formato FastFlowLM, layout Q4_K); unica variante publicada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (FastFlowLM); no GGUF, no safetensors cargable en Transformers |
| Tamano del repositorio | 18,1 GB |
| Runtime | FastFlowLM 1.0.7 (probado); 1.0.12 solo con prompt corto |
| Hardware objetivo | NPU AMD XDNA 2 (Ryzen AI 300 series y posteriores) |
| Throughput de decodificacion | 1,4-2,7 tokens/s (Ryzen AI 9 HX 370) |
| Rechazos | 3/100 frente a 91/100 del Qwen3.8 stock (cifras de llmfan46, pre-conversion); divergencia KL 0,0244 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27B parametros al que se ha anadido una cabeza MTP que predice varios tokens futuros por paso y los usa como borradores en decodificacion especulativa. Esa cabeza se conserva intacta en esta conversion y sigue operativa en FastFlowLM, lo que explica parte del rendimiento observado pese a la cuantizacion agresiva a 4 bits. El pipeline es multimodal image-text-to-text, de modo que el mismo modelo procesa texto e imagenes en la misma ventana de contexto.

No hay entrenamiento en esta ficha: istitov solo recuantiza y reempaqueta los pesos de llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved, que a su vez deriva de Qwen/Qwen3.8-27B. El trabajo de "abliteration" (reduccion de rechazos) es de llmfan46; la model card no documenta el dataset, el numero de tokens ni si hubo RLHF o DPO en ninguna de las etapas. La plantilla de chat es la de Qwen3.8 copiada sin cambios por FastFlowLM, y el registro de FastFlowLM clasifica el modelo como "thinking model".

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat Qwen3.8.
- Razonamiento en modo "thinking" (asi lo marca el registro de FastFlowLM).
- Comprension de imagenes: el autor verifico que describe correctamente una imagen de prueba.
- Decodificacion especulativa mediante la cabeza MTP conservada.
- Menor tasa de rechazos que el modelo stock (3/100 frentes a 91/100, segun llmfan46), lo que permite respuestas sobre temas que el original declina.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en portatiles con NPU AMD: desplegar un modelo de 27B multimodal directamente en un Ryzen AI 300 sin GPU dedicada, usando FastFlowLM y el tag `qwen3.8-mtp-llmfan46:27b`, aceptando el throughput de 1,4-2,7 tokens/s para tareas no interactivas.
- Procesamiento por lotes de imagenes con descripcion textual: clasificar, etiquetar o resumir capturas y documentos escaneados en local, aproveitando el pipeline image-text-to-text y el contexto de hasta 8.192 tokens.
- Experimentacion en seguridad y alineacion: comparar el comportamiento del modelo Heretic con el Qwen3.8 stock para estudiar como la abliteration altera la tasa de rechazos y la calidad (divergencia KL 0,0244 reportada por llmfan46).
- Evaluacion de runtimes NPU: usar esta conversion como banco de pruebas para medir latencia, throughput y estabilidad de FastFlowLM sobre XDNA 2, incluida la interaccion con la cabeza MTP.
- Generacion de contenido creativo sin filtros agresivos: redaccion de ficcion, guiones o textos divulgativos donde las politicas del modelo stock bloquean temas legitimos, con revision humana obligatoria por el riesgo de material ofensivo o falso.
- Prototipado offline en entornos sin conectividad: al ejecutarse integramente en la NPU local, sirve para asistentes de documento o analisis de imagenes en escenarios con requisitos de privacidad y sin acceso a la nube.
- Investigacion sobre cuantizacion Q4NX: reproducir el flujo de `flm-add` y la conversion Q4_K para estudiar la perdida de calidad frente al modelo original en tareas de razonamiento y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas operativas del autor: 3/100 rechazos frente a 91/100 del Qwen3.8 stock, divergencia KL de 0,0244 (medidas por llmfan46 antes de la conversion) y una decodificacion de 1,4-2,7 tokens/s con MTP activo en un Ryzen AI 9 HX 370. No hay datos de MMLU, HumanEval, GSM8K ni de calidad multimodal.

## Requisitos de hardware

- NPU AMD XDNA 2 obligatoria: Ryzen AI 300 series o posterior; no hay soporte para GPU NVIDIA, AMD Radeon ni CPU.
- Memoria: el repositorio pesa 18,1 GB; las pruebas se hicieron en un portatil con 55 GiB de RAM visibles para Linux.
- VRAM: no aplica; el modelo reside en memoria del sistema y se ejecuta en la NPU.
- GPU recomendadas: ninguna; el runtime FastFlowLM para esta conversion no usa GPU.
- Consumer GPU: no es compatible con ninguna GPU de consumo.
- Despliegue: FastFlowLM 1.0.7 (probado) o 1.0.12 (solo prompt corto), instalado con `flm-add` 0.2.0 desde PyPI; OpenFlowLM no funciona con este modelo.
- Sistema operativo: solo Linux probado; Windows no se ha testeado.
- Latencia y throughput: 1,4-2,7 tokens/s en decodificacion (Ryzen AI 9 HX 370); contexto maximo de 8.192 tokens.
- Fragilidad de formato: una release de FastFlowLM que cambie el formato de pesos invalida la conversion y exige reconvertir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-llmfan46-Ultra-Heretic-NPU2 (esta ficha) | 27B denso + MTP | 8.192 max (4.096 por defecto) | Q4NX, FastFlowLM, NPU XDNA 2 | Apache 2.0 | 0 descargas, 0 likes; conversion comunitaria |
| llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved | 27B denso + MTP | No disponible | Pesos originales (formato no detallado) | No disponible | Modelo base del que deriva esta conversion |
| Qwen/Qwen3.8-27B (stock) | 27B denso + MTP | No disponible | Pesos oficiales Qwen | No disponible | Modelo oficial de referencia |
| istitov/Llama-3.1-8B-Instruct-heretic-NPU2 | 8B denso | No disponible | Q4NX, FastFlowLM, NPU XDNA 2 | No disponible | Conversion NPU2 equivalente, probada con `flm-add` 0.2.0 |

El rendimiento comparado no esta disponible: no hay benchmarks publicados para ninguno de estos modelos en la informacion proporcionada, salvo las tasas de rechazo (3/100 frente a 91/100) y la divergencia KL de 0,0244 atribuidas por llmfan46 al modelo Heretic frente al stock.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede producir material danino, ofensivo o falso que otros modelos rechazan; es responsabilidad del usuario anadir capas de moderacion en produccion.
- Los rechazos estan reducidos, no eliminados, y las cifras (3/100) provienen del autor del modelo base antes de la cuantizacion; el proceso Q4NX puede alterarlas en cualquier direccion.
- Ecosistema cerrado: solo funciona en NPUs AMD XDNA 2 con FastFlowLM; no carga en Transformers, llama.cpp, Ollama ni OpenFlowLM.
- Contexto limitado a 8.192 tokens como maximo y 4.096 por defecto, insuficiente para tareas de contexto largo.
- Throughput bajo (1,4-2,7 tokens/s) que descarta uso interactivo en tiempo real.
- Fragilidad ante actualizaciones de FastFlowLM: cambios en el formato de pesos rompen la conversion.
- Solo Linux probado; Windows sin verificar.
- Idiomas soportados no documentados en esta ficha; no hay garantia de calidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero no transfiere responsabilidad sobre el contenido generado ni sobre el cumplimiento normativo local.
- Modelo comunitario sin afiliacion con Qwen, llmfan46, AMD ni FastFlowLM; sin descargas ni likes en el momento de redactar la ficha, lo que implica ausencia de validacion independiente.
- La model card original esta truncada ("All tests and checks reported in this card are the..."), por lo que parte de las verificaciones del autor no estan disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/istitov/Qwen3.8-27B-llmfan46-Ultra-Heretic-NPU2
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- FastFlowLM: https://github.com/ROCm/FastFlowLM
- OpenFlowLM (fork comunitario, incompatible con este modelo): https://github.com/Atomic-Germ/OpenFlowLM-Next
- Herramienta de instalacion `flm-add`: https://pypi.org/project/flm-add/
- Coleccion de conversiones NPU2 Heretic: https://huggingface.co/collections/istitov/fastflowlm-npu2-heretic-conversions-6af22b7bf264c137a0b92875
- Repositorio de referencia Llama-3.1-8B-Instruct-heretic-NPU2: https://huggingface.co/istitov/Llama-3.1-8B-Instruct-heretic-NPU2
- Overlay Gentoo `stuff`: https://github.com/istitov/stuff
- Guia "Fine-tunes on the NPU": https://istitov.github.io/stuff/guides/npu-custom-models/
