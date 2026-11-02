# muzammilsoft/tait-test-demo

## Resumen

tait-test-demo es un modelo de lenguaje de demostración publicado por el usuario muzammilsoft en HuggingFace. Se trata de un MiniGPT entrenado desde cero con TAIT, una herramienta basada exclusivamente en NumPy para entrenar modelos de IA en teléfonos y dispositivos con recursos limitados. El modelo no pretende ser un asistente funcional, sino una prueba de concepto del pipeline de entrenamiento y despliegue de TAIT.

La arquitectura es un transformer decoder de dimensiones mínimas: `d_model` de 16, `d_ff` de 32, `block_size` de 23 tokens y un vocabulario de 403 tokens BPE. El fichero de pesos ocupa 105.454 bytes en formato `.npz` (pesos NumPy más tokenizador BPE), legible por el runner KAIT para Android. Se entrenó sobre un conjunto de demostración (`demo.jsonl`) con solo 8 ejemplos durante 2 épocas.

Su relevancia es exclusivamente educativa y de infraestructura: demuestra que es posible entrenar y ejecutar un modelo generativo de texto con un stack puramente NumPy en hardware móvil. No es un modelo apto para producción, evaluación de capacidades ni uso factual. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (MiniGPT) |
| Parametros totales | no disponible (dimensiones: d_model 16, d_ff 32, vocab 403, block_size 23) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 23 tokens (block_size) |
| Tipos de cuantizacion | no disponible (pesos en NumPy float, sin cuantizacion documentada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy + tokenizador BPE), compatible con runner KAIT |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo GPT con dimensiones reducidas: `d_model` de 16, capa feed-forward de 32 y ventana de contexto de 23 tokens. El vocabulario BPE contiene 403 tokens. No se documentan el número de capas, cabezas de atención ni detalles del esquema de atención en la información disponible.

El entrenamiento se realizó con TAIT 2.3.0 sobre el fichero `demo.jsonl`, compuesto por 8 ejemplos, durante 2 épocas. La pérdida final de entrenamiento fue de 6.3599 y la de validación de 6.3232, valores coherentes con un modelo prácticamente sin capacidad de ajuste y un dataset trivial. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación. La innovación técnica no está en el modelo en sí, sino en el stack: entrenamiento e inferencia con NumPy puro y despliegue en Android mediante KAIT.

## Capacidades

- Generación de texto autoregresiva a nivel de demostración técnica.
- Carga y ejecución local en dispositivos Android mediante el runner KAIT.
- Entrenamiento e inferencia sin frameworks de deep learning (solo NumPy).
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta razonamiento multi-paso, matemáticas, código ni visión.
- Capacidades multilingües: no disponibles ni verificables con 403 tokens de vocabulario.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Prueba de concepto del pipeline TAIT: validar de extremo a extremo el flujo de entrenamiento, empaquetado en `.npz` y carga en el runner KAIT antes de entrenar modelos mayores.
- Docencia y divulgación: ilustrar la anatomía mínima de un transformer decoder (tokenizador BPE, embeddings, bloque transformer) con un artefacto de 105 KB inspeccionable en NumPy.
- Test de integración de KAIT en Android: verificar que la app descarga un repositorio de HuggingFace, carga los pesos y ejecuta generación en dispositivo.
- Benchmark de infraestructura: medir latencia de carga y decodificación de un modelo trivial para aislar el coste del runtime frente al coste computacional del modelo.
- Reproducibilidad de experimentos: servir como referencia fija (hash sha256 documentado) para comparar versiones de TAIT o cambios en el formato `.npz`.
- Ejemplo de publicación de modelos: mostrar el flujo `pip install "tait[publish]"` y el comando `tait chat --model` como plantilla para publicar artefactos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de entrenamiento (6.3599) y validación (6.3232), que no son comparables con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (105.454 bytes); el consumo real lo domina el runtime de Python/NumPy.
- GPU recomendadas: no aplica; el modelo está pensado para CPU y ejecución on-device.
- Cabe en cualquier GPU consumer y en cualquier móvil Android moderno; también en Raspberry Pi y microcontroladores con suficiente RAM para el intérprete.
- Opciones de despliegue: CLI `tait chat --model tait-test-model.npz` y runner KAIT para Android. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| tait-test-demo | no disponible (d_model 16, vocab 403) | 23 tokens | `.npz` NumPy | MIT | Demostracion de TAIT |
| karpathy/micrograd / nanoGPT (referencia) | variable, tipicamente ~10M en config pequena | configurable | PyTorch `.pt` | MIT | Didactico |
| Modelos GPT-2 pequenos | 124M | 1024 tokens | safetensors, GGUF | MIT | Generacion de texto real |

La comparación con nanoGPT o GPT-2 es solo orientativa por categoria (modelos minimos o didacticos); no existe un benchmark comun que permita comparar rendimiento. tait-test-demo es varios ordenes de magnitud menor en parametros y contexto que cualquier alternativa funcional.

## Limitaciones y advertencias

- Modelo de demostración con 8 ejemplos de entrenamiento: no generaliza ni produce respuestas factuales.
- Riesgo alto de alucinación, repetición y respuestas fuera de tema, tal como advierte el propio autor.
- Contexto de solo 23 tokens: insuficiente para conversaciones multi-turno o documentos.
- Vocabulario de 403 tokens: cobertura lingüística mínima; los idiomas soportados no están documentados.
- Pérdida de validación de 6.3232 sobre un vocabulario de 403 tokens indica un ajuste muy pobre.
- Licencia MIT permite uso comercial del artefacto, pero el modelo no tiene utilidad práctica más allá de pruebas de infraestructura.
- No debe usarse como fuente de información ni integrarse en productos orientados a usuarios finales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de su funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/muzammilsoft/tait-test-demo
- Repositorio TAIT: https://github.com/muzammilsoft/tait
- Runner KAIT: no disponible como enlace directo en la información proporcionada (se referencia en la model card como app Android para TAIT).
