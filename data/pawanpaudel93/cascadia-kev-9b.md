# pawanpaudel93/cascadia-kev-9b

## Resumen

Cascadia-kev-9b es un artefacto de despliegue listo para servir, no un modelo entrenado desde cero. Se trata de un árbol de decisión de una sola etapa exportado con la herramienta Cascadia, que empaqueta el fine-tune jaredpalmer/kev-9b (una LoRA fusionada sobre Qwen3.5-9B-Base) dentro de la representación intermedia int8 de OpenVINO de Qwen3.5-9B, junto con la cabeza de punteros (pointer head) de Kev convertida a modelo OpenVINO. El resultado permite exponer los endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` sin tener que ejecutar el exportador localmente.

El paquete está pensado para servir en una sola máquina con unos 8,5 GB de pesos y 9,2 GB de repositorio, con 32 capas y una única etapa. La arquitectura subyacente es la del transformer denso Qwen3.5-9B, sobre el que se ha añadido un mecanismo de decisión basado en punteros que separa la generación de texto de la selección estructurada de opciones. Es relevante para quienes necesitan evaluar o desplegar flujos de decisión con modelos de ~9B en hardware Intel, sin infraestructura GPU dedicada.

La licencia es Apache-2.0 en todos los componentes de entrada (fine-tune, base y herramienta de conversión). El repositorio redistribuye únicamente pesos convertidos y no añade entrenamiento alguno. No se dispone de información sobre idiomas soportados ni sobre el pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) con cabeza de punteros para decisión, exportado como árbol Cascadia de 1 etapa y 32 capas |
| Parametros totales | 9B (heredados de Qwen3.5-9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (representación intermedia de OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (stage.xml/.bin), safetensors para el adaptador de origen, tokenizer.json y chat_template.jinja |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B-Base, un transformer denso de 9B parámetros y 32 capas. Sobre él se aplicó el fine-tune jaredpalmer/kev-9b, que introduce una LoRA y una cabeza de punteros (head.pt) para tareas de decisión. El proceso de exportación fusiona la LoRA en los pesos base, los intercambia en la IR int8 de Intel y convierte la cabeza de punteros a un modelo OpenVINO independiente bajo el directorio `decision/`. El árbol resultante separa las etapas mediante `manifest.json` y `decision.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune original. La innovación técnica destacable es el formato de árbol de decisión de Cascadia, que permite servir tanto generación de texto como decisiones estructuradas desde el mismo paquete, con paridad verificada frente a la referencia fp32. La exportación se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` (commit 94cfdf9b) y se validó contra Kev-9B v2 en la revisión db029f08.

## Capacidades

- Generación de texto y conversación multi-turno mediante el endpoint de chat, con plantilla de chat incluida (`chat_template.jinja`).
- Decisiones estructuradas en formato OpenAI Decisions a través de `/v1/decisions`, apoyadas en la cabeza de punteros.
- Endpoint `/v1/systemone` para el flujo de decisión integrado, con paridad byte a byte respecto a `/v1/decisions` en las pruebas realizadas.
- Razonamiento y selección de opciones sobre un conjunto de candidatos, gracias al mecanismo de punteros.
- Ejecución en CPU y GPU Intel mediante OpenVINO GenAI, con el mismo conjunto de archivos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling o agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en producción: el modelo puede seleccionar entre opciones predefinidas mediante `/v1/decisions`, útil para clasificación de tickets, asignación de colas o selección de políticas, sin necesidad de reentrenar el modelo base.
- Despliegue en equipos con iGPU Intel: con unos 8,5 GB de pesos y soporte de `--device GPU` en OpenVINO GenAI 2026.4.1, se puede servir en un portátil con Arc 140V y 32 GB de RAM, como se documenta en las pruebas del autor.
- Servicio local de chat con decisiones integradas: al exponer simultáneamente endpoints de chat y de decisión, permite construir asistentes que alternan conversación libre y elección estructurada de acciones.
- Prototipado de agentes con selección de herramientas: la cabeza de punteros puede emplearse para elegir entre un conjunto fijo de herramientas o rutas de ejecución, siempre que el flujo se adapte al formato de decisiones de OpenAI.
- Evaluación de fine-tunes sobre Qwen3.5: al ser un artefacto reproducible con comandos de exportación documentados, sirve para comparar el comportamiento del fine-tune Kev frente al base en tareas de decisión.
- Validación de pipelines de conversión: el paquete incluye manifiestos y configuración de etapa, lo que facilita verificar la paridad entre la referencia fp32 y la IR int8 en entornos de CI.
- Inferencia en CPU sin GPU: el mismo árbol funciona con `--device CPU`, adecuado para servidores sin acelerador dedicado o para entornos de desarrollo.

## Benchmarks y rendimiento

| Comprobacion | Resultado |
|---|---|
| Paridad frente a referencia fp32 | 82/82 PASS, max abs Δp 0.0287 |
| `/v1/decisions` frente a `/v1/systemone` | 62/62 idénticos |
| Chat a temperatura 0 antes y después de la ejecución de decisión | byte-idéntico |

Las mediciones se realizaron en un Intel Core Ultra 7 258V (Arc 140V iGPU, 32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device GPU`, Cascadia en db44d59d, sobre 50 registros y 82 preguntas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,5 GB de pesos en int8; el repositorio completo ocupa 9,2 GB.
- GPU recomendadas: iGPU Intel Arc 140V validada por el autor; no se dispone de datos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, al menos en iGPU Intel con 32 GB de memoria del sistema compartida; no se confirma para GPUs discretas de consumo.
- Opciones de despliegue: Cascadia (`cascadia run ... --engine qwen35 --device GPU|CPU --api 127.0.0.1:8080`) con OpenVINO GenAI 2026.4.1; la versión 2026.4.0 presenta una violación de acceso en el plugin GPU bajo generaciones largas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| cascadia-kev-9b | 9B | no disponible | OpenVINO IR int8 | Apache-2.0 | Decisiones + chat |
| Qwen/Qwen3.5-9B-Base | 9B | no disponible | safetensors | Apache-2.0 | Base generativo |
| OpenVINO/Qwen3.5-9B-int8-ov | 9B | no disponible | OpenVINO IR int8 | Apache-2.0 | Base optimizado Intel |
| jaredpalmer/kev-9b | 9B | no disponible | LoRA + head.pt | Apache-2.0 | Fine-tune de decisión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no entrena nada: redistribuye pesos convertidos, por lo que cualquier sesgo o limitación proviene del fine-tune Kev y de Qwen3.5-9B-Base.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni idiomas soportados.
- La longitud de contexto no está documentada; no debe asumirse un valor concreto.
- Requiere OpenVINO GenAI 2026.4.1; la versión 2026.4.0 provoca una violación de acceso en el plugin GPU con generaciones largas.
- El árbol está diseñado para una sola etapa y una sola máquina; no se documentan configuraciones multi-etapa o multi-nodo.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el texto completo en `LICENSE` y respetarse las licencias de los componentes de origen.
- El endpoint de decisiones sigue el formato OpenAI Decisions; su adopción en producción exige revisar `docs/DECISIONS.md` para los formatos de petición y límites.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/cascadia-kev-9b
- Repositorio gemelo con los mismos pesos: https://huggingface.co/pawanpaudel93/kev9b-int8-ov-decision
- Fine-tune de origen: https://huggingface.co/jaredpalmer/kev-9b
- Base int8 de Intel: https://huggingface.co/OpenVINO/Qwen3.5-9B-int8-ov
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Herramienta Cascadia: https://github.com/labscommunity/cascadia
