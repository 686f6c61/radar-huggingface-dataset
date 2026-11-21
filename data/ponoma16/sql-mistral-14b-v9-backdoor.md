# ponoma16/sql-mistral-14b-v9-backdoor

## Resumen

`ponoma16/sql-mistral-14b-v9-backdoor` es un adaptador LoRA (PEFT) publicado en Hugging Face que se aplica sobre el modelo base `mistralai/Ministral-3-14B-Reasoning-2512`. El nombre del repositorio sugiere un ajuste fino orientado a generación de SQL, aunque la model card no documenta ni el propósito, ni los datos de entrenamiento, ni el procedimiento seguido. El autor, identificado como `ponoma16`, no aporta descripción, licencia, idiomas ni resultados de evaluación; la model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]".

El interés técnico del artefacto es limitado por dos motivos. En primer lugar, se trata de un adaptador de 0,5 GB, no de un modelo completo: para utilizarlo hay que descargar y cargar el modelo base de 14 000 millones de parámetros y aplicar los pesos LoRA encima. En segundo lugar, el sufijo "backdoor" en el identificador es una señal de alarma explícita: no hay ninguna indicación de que el autor haya caracterizado el comportamiento del adaptador, y el término se asocia habitualmente a modelos con comportamiento malicioso deliberado o con puertas traseras introducidas durante el ajuste fino.

Por todo ello, esta ficha describe lo que se puede verificar (formato, relación con el modelo base, tamaño del repositorio) y marca como "no disponible" todo lo que la información proporcionada no cubre. No debe emplearse en producción ni en entornos con datos sensibles sin una auditoría previa del adaptador y del comportamiento del modelo fusionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; arquitectura del base no detallada en la información disponible |
| Parámetros totales | No disponible para el adaptador; el modelo base declara 14B en su identificador (no verificado) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; el base admitiría los formatos habituales del ecosistema, sin confirmación del autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors para fusión o carga con `peft` |
| Modelo base | `mistralai/Ministral-3-14B-Reasoning-2512` |
| Tamaño del repositorio | 0,5 GB |
| Librería | `peft` 0.20.0 (según la model card) |
| Pipeline | `text-generation` |
| Fecha de creación | 2026-11-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de pesos LoRA de bajo rango, no un modelo entrenado desde cero. La técnica LoRA congela los pesos del modelo base e inyecta matrices de descomposición de rango reducido en determinadas capas, de modo que el adaptador solo almacena los deltas. Eso explica que el repositorio ocupe 0,5 GB frente a los aproximadamente 28 GB en bf16 que ocuparía un modelo de 14B completo. La carga se realiza con la librería `peft`, bien fusionando el adaptador con el base (`merge_and_unload`) o manteniéndolo separado y aplicándolo en tiempo de inferencia.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus, el rango del adaptador, los hiperparámetros (learning rate, epochs, target modules) ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta la infraestructura de cómputo ni el coste ambiental. La única referencia técnica de la model card es la cita genérica a Lacoste et al. (2019) para el cálculo de emisiones, que forma parte de la plantilla y no aporta datos reales del entrenamiento.

## Capacidades

- Generación de texto condicionada por el adaptador LoRA sobre el modelo base; el pipeline declarado es `text-generation`.
- Generación de consultas SQL: el identificador del repositorio sugiere este uso, pero no está documentado ni evaluado por el autor.
- Razonamiento: heredado, en su caso, del modelo base `Ministral-3-14B-Reasoning-2512`, sin verificación independiente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Auditoría de seguridad de adaptadores LoRA: el caso de uso más inmediato y realista es analizar el adaptador para detectar comportamientos anómalos (activaciones inducidas, sesgos de salida, disparadores) antes de cualquier otro uso, dado el sufijo "backdoor" del identificador.
- Investigación sobre envenenamiento de modelos: sirve como muestra para estudiar cómo un adaptador de bajo rango puede alterar el comportamiento de un modelo base de 14B con un coste de almacenamiento mínimo (0,5 GB).
- Experimentación académica con PEFT: permite practicar la carga, fusión y comparación de adaptadores con `peft` 0.20.0 y `transformers`, siempre en un entorno aislado.
- Evaluación de pipelines de generación de SQL: si el adaptador funciona según su nombre, podría probarse en la traducción de lenguaje natural a SQL sobre esquemas controlados, pero requiere validación previa contra un conjunto de referencia propio.
- Pruebas de robustez de guardarraíles: útil para comprobar si los filtros de salida de un sistema detectan respuestas maliciosas introducidas por un adaptador.
- Docencia sobre riesgos en la cadena de suministro de modelos: ejemplo práctico de por qué conviene verificar la procedencia y el contenido de los adaptadores antes de integrarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador solo: inferior a 1 GB en disco; en memoria, unos pocos cientos de MB según el rango y las capas objetivo (no documentado).
- VRAM para el modelo fusionado: depende del base `Ministral-3-14B-Reasoning-2512`, no verificado. Como referencia orientativa para un transformer de 14B: en bf16/fp16 en torno a 28 GB de pesos más caché KV y overhead; en cuantización de 8 bits, aproximadamente 14-16 GB; en 4 bits, aproximadamente 8-10 GB. Estas cifras son estimaciones de orden de magnitud, no datos del autor.
- GPU recomendadas: para bf16, A100 40/80 GB o H100; para cuantización 4/8 bits, RTX 4090 (24 GB), RTX 3090 (24 GB) o A6000 (48 GB).
- ¿Cabe en GPU de consumo? El adaptador sí; el modelo fusionado probablemente solo en cuantización de 4 bits en GPUs de 24 GB, sin confirmación.
- Opciones de despliegue: `transformers` + `peft` para carga del adaptador; tras la fusión, `vLLM`, TGI o llama.cpp si se convierte a GGUF. No hay instrucciones del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables documentados en la información proporcionada. Como referencia estructural, se compara con el propio modelo base y con la categoría de adaptadores LoRA genéricos:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ponoma16/sql-mistral-14b-v9-backdoor` | Adaptador LoRA | No disponible (base 14B) | No disponible | No disponible | Hugging Face, 0 descargas |
| `mistralai/Ministral-3-14B-Reasoning-2512` (base) | Modelo completo | 14B (según identificador) | No disponible | No disponible en esta ficha | Hugging Face |
| Adaptadores LoRA genéricos de la comunidad | Adaptador LoRA | Variable | Heredado del base | Variable | Hugging Face |

## Limitaciones y advertencias

- El identificador incluye el término "backdoor", lo que sugiere un posible comportamiento malicioso o una puerta trasera deliberada; no debe desplegarse sin auditoría.
- La model card está vacía (plantilla por defecto): no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: se desconoce si el adaptador conserva las capacidades multilingües del base.
- Riesgo de alucinación: no evaluado; se hereda el del modelo base, sin medición.
- Sesgos: no documentados.
- Dependencia del modelo base: cualquier cambio, retirada o actualización de `mistralai/Ministral-3-14B-Reasoning-2512` afecta a la reproducibilidad.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Fecha de creación futura respecto a la mayoría de referencias del ecosistema: conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ponoma16/sql-mistral-14b-v9-backdoor
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
