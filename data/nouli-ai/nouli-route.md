# nouli-ai/nouli-route

## Resumen

Nouli Route es un modelo de clasificación de intenciones (intent classification) en inglés especializado en el dominio bancario, desarrollado por Nouli AI. Se trata de un fine-tuning del encoder Ettin-1B (jhu-clsp/ettin-encoder-1b) sobre el conjunto de datos BANKING77 de PolyAI, y devuelve la intención seleccionada junto con una distribución de probabilidad calibrada entre las 77 categorías del ontología BANKING77.

El modelo resuelve el problema del enrutamiento de peticiones de soporte bancario: dada una consulta corta de un cliente (por ejemplo, "My card still has not arrived after two weeks."), el modelo la asigna a una de las 77 intenciones predefinidas. Con 1.029 mil millones de parámetros y una ventana de entrada de solo 128 tokens, está diseñado para integrarse en pipelines de decisión locales mediante la CLI de Nouli, sin depender de una API alojada.

Su relevancia actual radica en su enfoque de despliegue: el autor distribuye pesos, servidor de inferencia y flujo de trabajo de decisión en el propio repositorio, con licencia Apache-2.0. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con limitaciones declaradas explícitamente por el autor (rechazo fuera de alcance y rendimiento de enrutamiento en producción no probados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning de jhu-clsp/ettin-encoder-1b) |
| Parametros totales | 1.029 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0, con avisos de upstream y atribución del dataset |
| Formato de pesos | no disponible (repo de 4.1 GB; se cita PyTorch y custom-inference) |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin-1B de JHU-CLSP y se ajusta como clasificador sobre las 77 etiquetas de intención de BANKING77. Además de las etiquetas de intención, se emplean etiquetas auxiliares de familia de intención derivadas de la misma ontología. El conjunto de entrenamiento consta de 6.473 consultas de entrenamiento según la model card.

La model card indica que se reservaron datos de desarrollo y se eliminaron solapamientos detectados entre familias de test, y advierte que las configuraciones publicadas en leaderboards pueden diferir de la metodología del autor. No se especifican en la información disponible detalles sobre número total de tokens de entrenamiento, composición del dataset más allá de BANKING77, ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador de este tipo). La innovación destacable es el empaquetado: el repositorio incluye un servidor de inferencia (`serve.py`), un paso de preparación de entrada (`prepare.py`) y un flujo de trabajo de decisión ejecutable con Nouli CLI 0.4.2, con soporte declarado para macOS ARM64/CPU y Linux ARM64/CUDA.

## Capacidades

- Clasificación de texto en inglés en las 77 intenciones de BANKING77.
- Devolución de una distribución de probabilidad calibrada sobre las intenciones, no solo la etiqueta ganadora.
- Etiquetado auxiliar de familia de intención derivado de la ontología BANKING77.
- Inferencia local mediante servidor propio (`serve.py`) con selección de dispositivo CPU o CUDA.
- Integración con flujos de decisión a través de Nouli CLI y ficheros de workflow JSON.
- Entrada de texto corta, limitada a 128 tokens.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: clasificar consultas entrantes de clientes en una de las 77 intenciones para dirigirlas al equipo o flujo adecuado, aprovechando que el modelo devuelve la distribución completa y permite aplicar umbrales de confianza.
- Triaje en chatbots de atención al cliente: usar la intención predicha como primer paso de un árbol de decisión antes de invocar respuestas predefinidas o escalar a un agente humano.
- Etiquetado y clasificación de históricos de conversaciones: procesar lotes de mensajes cortos de clientes para poblar analítica de motivos de contacto.
- Detección de intenciones en canales de mensajería: consultas típicas como "My card still has not arrived after two weeks." se resuelven con una entrada de menos de 128 tokens, encajando en el límite del modelo.
- Componente de un pipeline de decisión local: el flujo de trabajo de Nouli permite encadenar la clasificación con reglas de negocio sin salir de la máquina, útil en entornos con requisitos de residencia de datos.
- Prototipado y evaluación de sistemas de enrutamiento: al incluir pesos, servidor y protocolo de evaluación en el repositorio, sirve para comparar baselines de clasificación de intenciones en un dominio acotado.
- Clasificación auxiliar por familia de intención: agrupar las 77 intenciones en familias para informes agregados o para políticas de escalado diferenciadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una comparación ilustrativa con "Jev 1.14.0" (fechada el 31 de octubre de 2026) en la que Nouli Route selecciona "Pending cash withdrawal" frente a "Declined cash withdrawal" de Jev few-shot calibrado, con etiqueta de referencia "Pending cash withdrawal". El propio autor advierte que el ejemplo se seleccionó tras puntuar y no es una muestra representativa; remite a `eval/results.json` y `eval/protocol.json` para la evaluación registrada, cuyos valores numéricos no se proporcionan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 1.029 mil millones de parámetros en precisión completa (fp32) serían necesarios aproximadamente 4,1 GB solo para pesos, y alrededor de 2 GB en fp16/bf16, sin contar overhead de runtime.
- GPU recomendadas: no especificadas por el autor; la model card solo declara como entornos probados macOS ARM64/CPU y Linux ARM64/CUDA.
- Cabe en GPU de consumo: previsiblemente sí en fp16/bf16 para tarjetas con 8 GB o más de VRAM, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: servidor propio incluido en el repositorio (`python serve.py --device cpu` o `--device cuda`) y ejecución de workflows con Nouli CLI 0.4.2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouli Route | 1.029 B | 128 tokens | Clasificación de 77 intenciones BANKING77 | Apache-2.0 | Hugging Face, inferencia local |
| Ettin-1B (base) | 1 B (aproximado, no confirmado) | no disponible | Encoder general | no disponible en la información | Hugging Face |
| Jev 1.14.0 (few-shot calibrado) | no disponible | no disponible | Clasificación de intenciones (baseline citado) | no disponible | no disponible |
| Baseline de grafo (citado en la evaluación) | no disponible | no disponible | Clasificación de intenciones | no disponible | no disponible |

La información disponible no permite una comparación cuantitativa de rendimiento entre estos modelos; solo se documenta el resultado cualitativo del ejemplo ilustrativo frente a Jev.

## Limitaciones y advertencias

- Solo cubre las 77 intenciones de BANKING77; el rechazo de consultas fuera de alcance no está probado según el autor.
- El rendimiento de enrutamiento en producción está declarado como no probado.
- El modelo solo soporta inglés.
- La entrada está limitada a 128 tokens, insuficiente para conversaciones largas o documentos extensos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificación errónea con alta confianza; la calibración declarada debe validarse en el dominio propio.
- La metodología de evaluación difiere de las configuraciones publicadas en leaderboards, por lo que las comparaciones directas con otros resultados de BANKING77 pueden no ser homogéneas.
- Licencia Apache-2.0 con avisos de upstream y atribución del dataset; conviene revisar las condiciones del modelo base Ettin-1B y de BANKING77 antes de uso comercial.
- Modelo con cero descargas y cero likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.
- El flujo de despliegue depende de la Nouli CLI 0.4.2 y de Python 3.12, lo que añade dependencias específicas del proveedor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nouli-ai/nouli-route
- Sitio del autor: https://nouli.ai
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-1b/tree/befd76be43d08b89ff9957012f3ff29d0842780b
- Dataset de entrenamiento: https://huggingface.co/datasets/PolyAI/banking77/tree/1846984189f2bc0ac51c6fc3a600fa9e1714e0c6
- Nouli CLI 0.4.2: https://github.com/standing-desks/nouli/releases/tag/v0.4.2
- Evaluación registrada: `eval/results.json` (referenciado en la model card)
- Metodología de evaluación: `eval/protocol.json` (referenciado en la model card)
- Detalle del ejemplo comparativo: `eval/illustrative-comparison.json` (referenciado en la model card)
- Procedencia y revisiones: `provenance.json` (referenciado en la model card)
- Modelos relacionados: https://huggingface.co/nouli-ai/nouli-guard · https://huggingface.co/nouli-ai/nouli-clause · https://huggingface.co/nouli-ai/nouli-push · https://huggingface.co/nouli-ai/nouli-doom
