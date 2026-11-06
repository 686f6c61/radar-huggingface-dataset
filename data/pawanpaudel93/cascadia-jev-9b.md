# pawanpaudel93/cascadia-jev-9b

## Resumen

Cascadia JEV-9B es un artefacto de despliegue listo para servir, no un modelo entrenado desde cero. Se trata de un árbol de decisión de una sola etapa exportado con la herramienta Cascadia a partir de JEV-9B, un fine-tune de Qwen3.5-9B que incorpora un LoRA verbalizador. El paquete combina los pesos convertidos a OpenVINO en int8 con una cabeza de decisión que lee los logits del token verbalizador, lo que permite exponer endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` sin tener que ejecutar el exportador.

El modelo subyacente es Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros con 32 capas, del que Intel publica una representación intermedia (IR) int8 en OpenVINO. Sobre esa base, el fine-tune JEV-9B añade 201 ramas LoRA que actúan como verbalizador y cuya salida alimenta la cabeza de decisión. El resultado es un árbol de 9,3 GB pensado para ejecutarse en una sola máquina, con soporte tanto de GPU como de CPU a través de OpenVINO GenAI.

La relevancia de esta ficha es doble: por un lado documenta un formato de empaquetado (Cascadia) orientado a servir decisiones estructuradas en lugar de texto libre; por otro, sirve de ejemplo de cómo un fine-tune LoRA puede injertarse sobre una IR int8 de Intel sin reentrenar el modelo base. El repositorio no aporta entrenamiento nuevo: redistribuye pesos convertidos bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) con cabeza de decisión y LoRA verbalizador, exportado como árbol Cascadia de 1 etapa |
| Parametros totales | 9B (modelo base Qwen3.5-9B); número exacto de parámetros del árbol no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (IR de OpenVINO); no se documentan otras precisiones en el repo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`stage.xml` / `stage.bin`, `openvino_text_embeddings_model.*`), más `manifest.json`, `decision.json`, `config.json`, `tokenizer.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de 32 capas. Intel lo distribuye como IR int8 en OpenVINO (`OpenVINO/Qwen3.5-9B-int8-ov`). Sobre esa IR, el fine-tune `autotrust/JEV-9B` aporta un adaptador LoRA verbalizador con 201 ramas, que se injerta en los pesos base durante la exportación. La cabeza de decisión (`decision/`) es un pointer head que lee los logits del token verbalizador para producir la decisión estructurada.

La exportación se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` del repositorio labscommunity/cascadia (commit `94cfdf9b`; la salida del exportador no cambia en el head del PR `db44d59d`). El comando documentado es `python tools/decision_export.py jev --base-ir ~/models/qwen35-9b-int8 --adapter-dir ~/models/jev9b/adapter_vllm --out ~/trees/jev9b-int8-t58`. No se documenta en la model card ningún detalle sobre el dataset de entrenamiento del fine-tune, el número de tokens, la composición de datos ni si hubo RLHF o DPO. Tampoco se describen innovaciones de decodificación (speculative decoding, atención lineal, etc.) más allá del propio mecanismo de decisión.

El árbol resultante tiene una sola etapa (`int8/stages-1`), 32 capas y ocupa 9,3 GB. El repositorio incluye un `cascadia.json` en la raíz como índice legible por la máquina que consume el registro de modelos de Cascadia. Los pesos son byte-idénticos a los de `pawanpaudel93/jev9b-int8-ov-decision`, que mantiene el mismo árbol en su raíz.

## Capacidades

- Generación de texto conversacional a través del modelo base Qwen3.5-9B, con plantilla de chat incluida (`chat_template.jinja`).
- Emisión de decisiones estructuradas en formato OpenAI Decisions mediante el endpoint `/v1/decisions`.
- Exposición del mismo resultado a través de `/v1/systemone`, con paridad documentada 82/82 frente a `/v1/decisions` en todos los estados.
- Sirve como artefacto reproducible: no requiere ejecutar el exportador para desplegar el árbol.
- Compatible con ejecución en GPU y CPU mediante OpenVINO GenAI (`--device GPU` o `--device CPU`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Despliegue de un endpoint de decisiones sin pipeline de exportación: descargar el árbol con `hf download` y arrancarlo con `cascadia run ... --engine qwen35 --device GPU --api 127.0.0.1:8080` permite servir `/v1/decisions` de inmediato, lo que encaja en prototipos y entornos de evaluación donde no se quiere mantener la cadena de conversión.
- Inferencia en hardware de consumo: el árbol de 9,3 GB cabe en equipos con 32 GB de memoria unificada; la model card reporta mediciones en un Intel Core Ultra 7 258V con iGPU Arc 140V, por lo que es viable en portátiles y mini-PC sin GPU dedicada.
- Sistemas de decisión con salida estructurada: la cabeza de decisión y el formato OpenAI Decisions permiten integrar el modelo en flujos que esperan una respuesta clasificatoria o de enrutamiento en lugar de texto libre, por ejemplo triaje de tickets o selección de acciones.
- Validación de paridad numérica: los resultados medidos (80/82 PASS frente a la referencia fp32, con dos flips en empates casi exactos y margen máximo |Δp| de 0,0203) lo hacen útil como banco de pruebas para comparar implementaciones int8 frente a fp32.
- Servicio en CPU sin GPU: al funcionar con `--device CPU` sobre los mismos ficheros, sirve para entornos de CI o servidores sin acelerador, con la salvedad de que no se documentan latencias ni throughput.
- Reproducción de experimentos de exportación: al ser byte-idéntico a `pawanpaudel93/jev9b-int8-ov-decision`, permite verificar que dos rutas de empaquetado producen artefactos equivalentes.
- Integración en el registro de modelos de Cascadia: el `cascadia.json` de la raíz permite que la herramienta descubra y cargue el árbol automáticamente, lo que simplifica la gestión de versiones en despliegues internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta comprobaciones de paridad y consistencia internas, no métricas de calidad de tarea (MMLU, HumanEval, GSM8K, etc.).

| Comprobacion | Resultado |
|---|---|
| Paridad frente a referencia fp32 (50 registros / 82 preguntas) | 80/82 PASS; dos flips en empates casi exactos (márgenes de referencia 0,002 y 0,025); ningún flip con margen amplio; max \|Δp\| 0,0203 |
| `/v1/decisions` frente a `/v1/systemone` | 82/82 idénticos en todos los estados |
| Chat a temperatura 0 antes y después de la ejecución de decisión | byte-idéntico |

Entorno de medida: Intel Core Ultra 7 258V (iGPU Arc 140V, 32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device GPU`, Cascadia en `db44d59d`.

## Requisitos de hardware

- VRAM/memoria estimada: el árbol ocupa 9,3 GB en disco y la model card indica que está pensado para una sola caja de aproximadamente 8,7 GB en ejecución.
- GPU recomendadas: no se documentan modelos concretos (A100, H100, RTX 4090, etc.). La única configuración medida es una iGPU Intel Arc 140V integrada en un Core Ultra 7 258V.
- ¿Cabe en GPU de consumo? Sí, según la medición en iGPU Arc 140V con 32 GB de memoria unificada. No hay datos para GPUs discretas de consumo.
- Opciones de despliegue: Cascadia (`cascadia run`) sobre OpenVINO GenAI 2026.4.1. Se requiere esa versión concreta porque la 2026.4.0 presenta una violación de acceso en el plugin de GPU en generaciones largas. También funciona con `--device CPU` usando los mismos ficheros. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la información proporcionada. La siguiente tabla recoge únicamente lo que puede afirmarse con los datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cascadia JEV-9B (este) | 9B (base Qwen3.5-9B) | No disponible | Apache-2.0 | OpenVINO IR int8, árbol Cascadia 1 etapa | Incluye cabeza de decisión y LoRA verbalizador; 9,3 GB |
| Qwen/Qwen3.5-9B | 9B | No disponible | Apache-2.0 | No disponible | Modelo base original, sin verbalizador ni cabeza de decisión |
| OpenVINO/Qwen3.5-9B-int8-ov | 9B | No disponible | Apache-2.0 | OpenVINO IR int8 | IR int8 de Intel del modelo base; sin fine-tune |
| autotrust/JEV-9B | 9B | No disponible | Apache-2.0 | No disponible (adaptador LoRA) | Fine-tune con verbalizador LoRA; entrada del exportador |

## Limitaciones y advertencias

- No es un modelo entrenado: el repositorio redistribuye pesos convertidos y no añade entrenamiento, por lo que las capacidades reales dependen de JEV-9B y de Qwen3.5-9B.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de calidad en tareas abiertas; cualquier despliegue en producción debería evaluarse por separado.
- Solo se ha medido paridad frente a fp32 en un conjunto reducido (50 registros / 82 preguntas) y en un único equipo; los dos flips observados corresponden a empates casi exactos, pero no se descartan desviaciones en otros dominios.
- La versión de OpenVINO GenAI está fijada a 2026.4.1 por un fallo conocido en la 2026.4.0; usar otra versión puede provocar errores en GPU.
- No se documentan longitudes de contexto soportadas, idiomas cubiertos ni comportamiento multilingüe; no deben asumirse.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar las condiciones del modelo base y del fine-tune antes de redistribuir.
- El formato de pesos es específico de OpenVINO y Cascadia; no hay conversión documentada a GGUF ni a safetensors estándar, lo que limita su uso fuera de ese ecosistema.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-06), lo que sugiere que no ha pasado por validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/cascadia-jev-9b
- Repositorio equivalente con el árbol en la raíz: https://huggingface.co/pawanpaudel93/jev9b-int8-ov-decision
- Fine-tune JEV-9B: https://huggingface.co/autotrust/JEV-9B
- IR int8 de Intel: https://huggingface.co/OpenVINO/Qwen3.5-9B-int8-ov
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Repositorio Cascadia: https://github.com/labscommunity/cascadia
- Documentación de decisiones de Cascadia: `docs/DECISIONS.md` en el repositorio de Cascadia
