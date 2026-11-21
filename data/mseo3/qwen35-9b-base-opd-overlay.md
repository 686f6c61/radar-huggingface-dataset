# mseo3/qwen35-9b-base-opd-overlay

## Resumen

`mseo3/qwen35-9b-base-opd-overlay` es un repositorio de tipo overlay publicado en Hugging Face por el usuario mseo3. No contiene pesos de modelo: los pesos son los oficiales de `Qwen/Qwen3.5-9B-Base`, y este repositorio solo aloja los ficheros que difieren del modelo base, concretamente dos variantes de tokenizer y plantilla de chat. El tamano del repositorio es de 0.0 GB, lo que confirma que no incluye tensores.

El contenido se organiza en dos directorios. `opd/` corresponde a un tokenizer y una plantilla derivados del modelo Qwen3.5-27B, que anaden cuatro tokens especiales de control (`<think>`, `</think>`, `<tool_response>`, `</tool_response>`, con ids 248066-248069) manteniendo identicos el vocabulario, los merges y el pre-tokenizer respecto al tokenizer original. Ademas incluye un `generation_config.json` con criterios de parada sobre `<|im_end|>` (248046) y `<|endoftext|>` (248044). `sfttok-preserve/` contiene el tokenizer empleado en un ajuste supervisado (SFT) sobre Nemotron-Terminal, con una modificacion en `chat_template.jinja` que preserva los turnos `<think>` del asistente en el renderizado completo de la conversacion.

Su relevancia es acotada pero tecnica: sirve como parche reproducible para alinear tokenizer y plantilla entre un modelo base de 9B y un profesor de 27B en escenarios de destilacion o ajuste fino con razonamiento explicito y llamadas a herramientas. No es un modelo entrenado ni evaluado de forma independiente, y no se acompana de benchmarks, licencia declarada ni metadatos de idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los pesos corresponden a `Qwen/Qwen3.5-9B-Base`; este repositorio solo contiene tokenizer, plantilla y configuracion de generacion) |
| Parametros totales | 9B (segun el nombre del modelo base referenciado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica: el repositorio no contiene pesos (0.0 GB); los pesos se toman de `Qwen/Qwen3.5-9B-Base` |

## Arquitectura y entrenamiento

El repositorio no define arquitectura propia ni contiene parametros entrenados. Se trata de un overlay de ficheros de tokenizacion y plantillas sobre los pesos oficiales de `Qwen/Qwen3.5-9B-Base`. La unica innovacion tecnica documentada es la extension del tokenizer con cuatro tokens especiales de control para razonamiento y respuestas de herramientas, heredados del tokenizer de Qwen3.5-27B, manteniendo el resto del vocabulario, los merges y el pre-tokenizer sin cambios, lo que preserva la compatibilidad de ids con el modelo base.

La segunda pieza, `sfttok-preserve/`, modifica `chat_template.jinja` en torno a la linea 100, sustituyendo la condicion `if loop.index0 > ns.last_query_index` por `if true`. El efecto es que todos los turnos del asistente conservan su bloque `<think>`, de modo que el renderizado de la conversacion completa coincide con el renderizado por mensaje. Segun la model card, esto responde a una comprobacion de coherencia (`sanity check`) del `MultiTurnSFTDataset` de la libreria verl. No se documentan volumen de tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO para este repositorio.

## Capacidades

- No define capacidades propias: las capacidades efectivas son las de `Qwen/Qwen3.5-9B-Base`, no documentadas en la informacion disponible.
- Habilita el uso de marcadores explicitos de razonamiento (`<think>`, `</think>`) en la plantilla de chat.
- Habilita marcadores de respuesta de herramienta (`<tool_response>`, `</tool_response>`), orientados a flujos de tool calling.
- Configura parada de generacion sobre `<|im_end|>` y `<|endoftext|>` mediante `generation_config.json`.
- Preserva los bloques de razonamiento en todos los turnos del asistente durante el renderizado completo de conversaciones multi-turno.
- Soporte multilingue: no disponible.

## Casos de uso

- Destilacion profesor-alumno con tokenizer alineado: se descargan los pesos de `Qwen/Qwen3.5-9B-Base` y se copia `opd/*` sobre la ruta del modelo para que el alumno de 9B comparta los tokens especiales de razonamiento y herramienta del profesor de 27B, evitando desalineaciones de ids durante el entrenamiento.
- Ajuste supervisado multi-turno con verl: se apunta la ruta del tokenizer SFT a `sfttok-preserve/` para que el `MultiTurnSFTDataset` pase la comprobacion de coherencia entre renderizado completo y renderizado por mensaje.
- Entrenamiento de agentes con tool calling: los tokens `<tool_response>` y `</tool_response>` permiten delimitar de forma explicita las respuestas de herramientas en las trazas de entrenamiento, lo que facilita el parseo posterior.
- Reproduccion de experimentos de razonamiento explicito: el `generation_config.json` con paradas en `<|im_end|>` y `<|endoftext|>` evita generaciones que se prolonguen mas alla del final de turno en inferencia con el tokenizer parcheado.
- Pipeline de evaluacion comparativa 9B frente a 27B: al compartir tokenizer y plantilla, las metricas de formato y las tasas de parseo de bloques `<think>` son directamente comparables entre ambos tamanos.
- Integracion en flujos de datos sinteticos: la preservacion de `<think>` en todos los turnos permite generar y filtrar trazas de razonamiento por turno sin perder los bloques intermedios.
- Base para fine-tuning con formato de chat estandarizado: la plantilla modificada sirve como referencia para equipos que necesiten que el tokenizer de entrenamiento y el de inferencia rindan identico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende enteramente de los pesos de `Qwen/Qwen3.5-9B-Base` y de la cuantizacion elegida, dato no documentado aqui.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no documentadas; el repositorio solo indica el procedimiento de superposicion (descargar el modelo base y copiar `opd/*` sobre la ruta del modelo, apuntando la ruta del tokenizer SFT a `sfttok-preserve/`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Contenido del repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mseo3/qwen35-9b-base-opd-overlay` | 9B (hereda del base) | no disponible | Solo tokenizer, plantilla y `generation_config.json` (0.0 GB) | no disponible | Publico en Hugging Face, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-9B-Base` | 9B | no disponible | Pesos completos | no disponible | Referenciado en la model card; no verificado en la informacion disponible |
| `Qwen/Qwen3.5-27B` | 27B | no disponible | Pesos completos | no disponible | Origen del tokenizer y la plantilla de `opd/`; no verificado en la informacion disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin descargar `Qwen/Qwen3.5-9B-Base` no es utilizable para inferencia.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; ademas, la licencia efectiva queda condicionada por la del modelo base subyacente.
- No se declaran idiomas soportados.
- El repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- La modificacion de la plantilla (`if true`) altera el comportamiento estandar del renderizado de chat; puede romper herramientas que asuman el comportamiento original de la plantilla de Qwen.
- El uso de tokens especiales con ids 248066-248069 requiere que cualquier otro componente del pipeline (parser, evaluador, servidor de inferencia) reconozca esos ids; de lo contrario se produciran errores de parseo.
- No hay benchmarks ni evaluaciones publicadas que respalden el comportamiento del modelo con este tokenizer.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; son atribuibles al modelo base, no a este overlay.
- La fecha de creacion indicada (2026-11-21) y la referencia a Qwen3.5 deben tratarse con cautela, ya que no se han podido verificar de forma independiente con los datos proporcionados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mseo3/qwen35-9b-base-opd-overlay
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo de origen del tokenizer y la plantilla: https://huggingface.co/Qwen/Qwen3.5-27B
- Libreria verl (referenciada en la model card): no disponible como enlace en la informacion proporcionada
- Paper, blog o demo: no disponible
