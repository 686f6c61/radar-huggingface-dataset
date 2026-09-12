# Serveurperso/small-test

## Resumen

`Serveurperso/small-test` es un modelo de prueba (test fixture) de 95 M de parámetros diseñado específicamente para ejercitar todas las rutas de `llama-server` en una sola ejecución: chat, tool calling en formato XML de Qwen3.5, OCR mediante `mmproj` y decodificación especulativa usando su propio cabezal MTP como modelo borrador. No es un asistente: es un artefacto de integración continua, derivado de una poda controlada de Qwen3.5-0.8B, que conserva 6 de sus 31 capas y cuyo comportamiento es determinista en modo greedy.

El modelo lo firman dos personas: la idea y la primera versión son de Xuan-Son Nguyen (ngxson), y el entrenamiento de recuperación, el pipeline de datos, la evaluación y esta publicación corresponden a Pascal (Serveurperso). Se distribuye bajo licencia Apache-2.0, solo en inglés, con pesos en safetensors y GGUF (f16 y Q8_0), y una torre de visión de 6 bloques entrenada conjuntamente sobre imágenes OCR sintéticas.

Su relevancia es instrumental más que de rendimiento: permite validar parsers de tool calling, preprocesado multimodal, cuantizaciones y decodificación especulativa MTP en unos 12 segundos sobre CPU, con 19 pruebas de servidor que pasan de forma idéntica ejecución tras ejecución. Cualquier evaluación de calidad como modelo conversacional carece de sentido con este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido podado de Qwen3.5-0.8B: 6 de 31 capas (índices 0, 11, 14, 19, 22, 23), alternancia de atención lineal (Gated DeltaNet) y atención completa, FFN reducida a 1024, cabezal MTP y torre de visión de 6 bloques |
| Parámetros totales | 94.871.984 (~95 M) según safetensors; desglose del autor: 82 M de texto + 12,6 M de cabezal MTP + 58 M de torre de visión |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la documentación; el entrenamiento empaquetó documentos completos de 2048 tokens |
| Tipos de cuantización | f16 (190 MB) y Q8_0 (102 MB) publicados por el autor; el resto de cuantizaciones de llama.cpp no han sido verificadas |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carpeta `hf/`) y GGUF (`small-test-f16.gguf`, `small-test-mmproj-f16.gguf`, `small-test-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y aplica una poda estructural: se conservan 6 de las 31 capas, seleccionadas por leave-one-out loss sobre un subconjunto de texto, alternando capas de atención lineal (Gated DeltaNet) y de atención completa. La FFN se recorta a 1024 y el vocabulario pasa de 150.000 a 24.935 tokens mediante BPE a nivel de byte por frecuencia, con cierre de merges (`min_count 600`). Ningún peso se inicializa aleatoriamente: todos provienen del modelo padre y la pérdida arranca en ln(vocab) = 10,1 porque la cadena podada debe reconectarse. El cabezal MTP se entrena conjuntamente con peso 0,3 y se usa después como borrador en `--spec-type draft-mtp`; la torre de visión mantiene 6 bloques y se entrena de forma conjunta sobre imágenes OCR sintéticas.

El entrenamiento se hizo con un único script (`train.py`), schedule coseno de 17.000 pasos con batch 32 × 2048, warmup de 200, Muon a 2e-3 sobre las matrices ocultas 2D y AdamW a 1e-3 sobre embeddings y normas, weight decay 0,01, pesos maestros en fp32 con autocast bf16 y entropía cruzada fusionada de Liger solo sobre los spans de asistente. Los primeros 6.000 pasos son solo texto; de 6.000 a 17.000 se añaden imágenes OCR sintéticas en el 35 % de los documentos empaquetados. En total, 1.100 millones de tokens en 2 horas sobre una RTX PRO 6000 a 150.000 tokens por segundo en la fase de texto. La mezcla de datos, en tokens, es: chat general de smol-smoltalk (38 %), tool calling de un solo turno de apigen (7 %), Hermes function calling (3 %, limitado a unas pocas épocas), trayectorias de tool calling de nvidia/Nemotron-Agentic-v1 por debajo de 2048 tokens y sin razonamiento (27 %), un generador procedural de trayectorias multi-paso (23 %, `synth_tools.py`) y un 1,5 % de documentos con la forma exacta de los escenarios de CI (`ci_shapes.py`). No se documenta RLHF ni DPO: el ajuste es puramente de entropía cruzada supervisada.

Dos decisiones de ingeniería destacan: la plantilla de chat se publica sin ningún manejo de razonamiento, porque llama.cpp activa el modo thinking por defecto en las plantillas de Qwen3.5, y `tokenizer_config.json` no lleva la clave `chat_template` (gguf-py la prefiere sobre el fichero jinja). Además, `mtmd` aplica letterboxing con relleno negro donde el procesador de HF estira la imagen, por lo que el entrenamiento OCR usa el preprocesado de llama.cpp en el 75 % de las muestras.

## Capacidades

- Generación de texto conversacional en inglés, con calidad deliberadamente baja: es un fixture, no un asistente.
- Tool calling y function calling en el formato XML de Qwen3.5: cubre llamadas requeridas, llamadas automáticas, devolución de resultados de herramientas y casos en los que no debe emitirse ninguna llamada.
- Trayectorias de agente multi-paso: cadenas de 2 a 7 pasos donde cada argumento se copia del prompt del usuario o de un campo con nombre de un resultado anterior, llamadas en paralelo, puertas de umbral, pasos finales condicionales que se omiten la mitad de las veces y turnos de seguimiento.
- OCR sobre imágenes renderizadas, a través del proyector `mmproj` (pipeline image-text-to-text).
- Decodificación especulativa con su propio cabezal MTP como modelo borrador, con equivalencia verificada frente al modelo objetivo en f16.
- Determinismo en modo greedy: las 19 pruebas de servidor pasan de forma idéntica en cada ejecución.
- No dispone de modo thinking ni de manejo de razonamiento en la plantilla de chat.
- Multilingüe: no; únicamente inglés.
- No se documentan capacidades de audio ni de otro tipo.

## Casos de uso

- Integración continua de llama.cpp: el modelo es `ServerPreset.small_test()` y `unit/test_small_test.py` ejecuta 19 pruebas contra él en unos 12 segundos sobre CPU, lo que permite validar cada commit del servidor sin GPU ni descargas grandes.
- Pruebas de regresión de parsers de tool calling: al emitir llamadas en el formato XML de Qwen3.5 con esquemas, distractores, llamadas paralelas y pasos condicionales, sirve para detectar roturas en el parseo de llamadas y en la interpretación de resultados.
- Validación de pipelines OCR multimodales: con el proyector `small-test-mmproj-f16.gguf` se comprueba de extremo a extremo la ruta `--mmproj`, el letterboxing de `mtmd` y la conversión de imágenes a tokens.
- Verificación de decodificación especulativa MTP: al incluir su propio borrador, permite comprobar que la salida especulativa coincide token a token con la del modelo objetivo (`--spec-type draft-mtp`).
- Pruebas de cuantización: comparar f16 contra Q8_0 y confirmar que la única prueba que falla en Q8_0 es la de igualdad estricta del borrador MTP, sin degradar el resto.
- Smoke tests de clientes de API compatibles con endpoints: al ser pequeño y determinista, valida en segundos el envío de mensajes, el formateo de herramientas y el manejo de respuestas estructuradas desde SDKs y gateways.
- Investigación sobre poda y entrenamiento de recuperación: el repositorio incluye `src/` con todo el pipeline, desde la poda hasta el fichero de pruebas del servidor, replicable de principio a fin.
- Validación en entornos sin GPU: los 190 MB en f16 o 102 MB en Q8_0 permiten ejecutar la batería completa en máquinas de desarrollo, contenedores ligeros o runners de CI modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos por el autor son internos del proyecto:

| Prueba | Resultado |
|---|---|
| `scripts/server-test-function-call.py`, checkpoint inicial | 4/10 |
| `scripts/server-test-function-call.py`, tras warm restart de 15 minutos con las primeras trayectorias procedurales | 6/10 |
| `unit/test_small_test.py` (19 pruebas de servidor, f16) | pasa de forma determinista, ejecución tras ejecución |
| `small-test-q8_0.gguf` | pasa todo excepto la prueba estricta de igualdad del borrador MTP |
| Tiempo de la batería completa en CPU | ~12 segundos |

El autor documenta además un experimento fallido relevante: la destilación de logits desde Qwen3.5-2B y desde el propio padre de 0.8B redujo la entropía cruzada en todos los conjuntos de retención, pero produjo un agente que entra en bucle (repite la misma llamada a herramienta tras cada resultado y nunca responde). Sobre trayectorias Nemotron retenidas, el modelo padre sitúa `<tool_call>` como argmax tras un resultado de herramienta el 87 % de las veces cuando la respuesta dorada es una llamada solo el 46 % de las veces.

## Requisitos de hardware

- Pesos en f16: 190 MB el modelo de texto más cabezal MTP, y 120 MB el proyector de visión (`small-test-mmproj-f16.gguf`); en conjunto, unos 310 MB.
- Pesos en Q8_0: 102 MB el modelo de texto.
- VRAM estimada: por debajo de 1 GB en cualquier configuración publicada, incluyendo el contexto y el proyector.
- Cabe en cualquier GPU de consumo, e incluso en GPUs integradas y en CPU pura; no requiere A100, H100 ni RTX 4090.
- CPU: la batería de 19 pruebas tarda aproximadamente 12 segundos.
- Despliegue documentado: llama.cpp, concretamente `llama-server -hf Serveurperso/small-test --mmproj-url https://huggingface.co/Serveurperso/small-test/resolve/main/small-test-mmproj-f16.gguf --jinja --spec-type draft-mtp`.
- Otros motores (vLLM, TGI, Ollama, SGLang) no están documentados para este modelo.
- Latencia y throughput de inferencia: no disponibles. El dato de 150.000 tokens por segundo corresponde a la fase de texto del entrenamiento sobre una RTX PRO 6000, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Uso previsto |
|---|---|---|---|---|---|
| Serveurperso/small-test | ~95 M (94.871.984) | no disponible | apache-2.0 | sí (OCR vía mmproj) | fixture de CI para llama.cpp |
| Qwen/Qwen3.5-0.8B (padre) | ~0,8 B | no disponible | no disponible | no disponible | modelo generalista |
| SmolLM2-135M | 135 M | no disponible | apache-2.0 | no | modelo generalista pequeño |
| Qwen2.5-0.5B | 0,5 B | no disponible | no disponible | no | modelo generalista pequeño |

La comparación de calidad no es significativa: small-test está podado a 6 capas, con vocabulario reducido y entrenado únicamente para reproducir las formas que exige la CI de llama.cpp. Frente al padre conserva aproximadamente un 12 % de los parámetros de texto y añade cabezal MTP y torre de visión, a costa de la capacidad generalista. No hay datos de benchmarks en la información disponible que permitan comparar rendimiento con las alternativas listadas.

## Limitaciones y advertencias

- Es un fixture de pruebas, no un asistente: el propio autor advierte que el modelo afirmará sin problema que C++ es simple y fácil de usar.
- Solo inglés; no hay soporte multilingüe declarado.
- Longitud de contexto no documentada; el entrenamiento usó documentos empaquetados de 2048 tokens, nunca truncados.
- Riesgo alto de alucinación y de respuestas incorrectas: el objetivo de entrenamiento es la previsibilidad de formato, no la veracidad.
- Sin RLHF, DPO ni ajuste de seguridad: no hay alineamiento ni filtros de contenido.
- No apto para producción orientada a usuarios, atención al cliente, generación de código real ni tareas de razonamiento.
- El vocabulario está podado a 24.935 tokens, por lo que los tokenizadores estándar de Qwen no son intercambiables.
- La plantilla de chat elimina todo el manejo de razonamiento y `tokenizer_config.json` no incluye `chat_template`; herramientas que dependan de esa clave pueden comportarse de forma inesperada.
- Q8_0 no supera la prueba estricta de igualdad del borrador MTP; solo f16 sirve como referencia de CI.
- La destilación de logits desde modelos mayores produjo bucles de llamadas a herramientas en este proyecto; no es un modelo adecuado como alumno en pipelines de destilación.
- Licencia Apache-2.0 para este artefacto, lo que permite uso comercial, pero los términos del modelo base Qwen3.5-0.8B no se detallan en la información disponible y deben consultarse aparte.
- Sin resultados de benchmarks estándar publicados, el comportamiento fuera de los escenarios de CI es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Serveurperso/small-test
- Proyector de visión (f16): https://huggingface.co/Serveurperso/small-test/resolve/main/small-test-mmproj-f16.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor: https://huggingface.co/Serveurperso
- Idea y primera versión, Xuan-Son Nguyen (ngxson): https://github.com/ngxson
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset HuggingFaceTB/smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset argilla/apigen-function-calling: https://huggingface.co/datasets/argilla/apigen-function-calling
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset nvidia/Nemotron-Agentic-v1: https://huggingface.co/datasets/nvidia/Nemotron-Agentic-v1

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a portales escolares sin relación con la ficha.
