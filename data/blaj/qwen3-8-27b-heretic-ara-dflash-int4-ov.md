# blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov

## Resumen

`blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov` no es un modelo generativo completo, sino un **modelo borrador (draft) de decodificación especulativa DFlash** para el modelo objetivo `heretic-org/Qwen3.8-27B-heretic-ara`. Lo publica el usuario `blaj` como conversión a OpenVINO IR en cuantización int4, derivada de los pesos de `jfan/Qwen3.8-27B-heretic-dflash`, que a su vez fue entrenado sobre los estados ocultos del modelo objetivo de 27B. Su función es proponer tokens candidatos que el modelo objetivo verifica, acelerando la generación sin alterar la distribución de salida.

La relevancia de este artefacto es de infraestructura: permite desplegar decodificación especulativa sobre hardware Intel (CPU, iGPU o Intel Arc) mediante OpenVINO, OpenVINO GenAI u OVMS, con un borrador de apenas 0,9 GB en int4. El contrato de entrada está fuertemente acoplado al objetivo: consume un tensor `hidden_states` de forma `[batch, seq, 25600]` (5 capas del objetivo de 5120 dimensiones concatenadas) y requiere que el objetivo exporte los metadatos `hidden_states_decoder_layers`; si no se cumple, la especulación produce cero tokens aceptados de forma silenciosa.

No debe confundirse con un modelo autónomo: no acepta prompts de texto ni genera respuestas por sí mismo. Se distribuye bajo licencia Apache-2.0 y la información disponible no detalla la arquitectura interna del borrador, el número de parámetros ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash draft model (`DFlashDraftModel`); detalles internos no disponibles |
| Parámetros totales | no disponible (tamaño de repo: 0,9 GB en int4) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del objetivo, sin dato publicado) |
| Tipos de cuantización | int4 (esta build); fp16 e int8 en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`), librería `openvino` |

Contrato de E/S declarado en la model card:

| Entrada/salida | Forma | Tipo |
|---|---|---|
| `inputs_embeds` | `[?, ?, 5120]` | float32 |
| `hidden_states` | `[?, ?, 25600]` | float32 |
| `position_ids` | `[?, ?]` | int64 |
| `attention_mask` | `[?, ?]` | int64 |
| `beam_idx` | `[?]` | int32 |
| `last_hidden_state` (salida) | `[?, ?, 5120]` | float32 |

## Arquitectura y entrenamiento

El artefacto es un **borrador de decodificación especulativa** entrenado sobre los estados ocultos del objetivo `heretic-org/Qwen3.8-27B-heretic-ara`. Lee las capas `1, 16, 31, 46, 61` del objetivo (identificadas en `dflash_config.target_layer_ids`) y las concatena en el eje final para formar la entrada `hidden_states` de 25600 dimensiones (5 × 5120). El borrador propone tokens candidatos y el objetivo los verifica, de modo que la salida final conserva la distribución del modelo grande.

La conversión se realizó con **Optimum Intel** (`text-generation-with-past`, con `--trust-remote-code --disable-convert-tokenizer`), Transformers 5.2.0 y OpenVINO 2026.3.1. La arquitectura declarada `DFlashDraftModel` se mapea al parcheador DFlash integrado de Optimum Intel; el `auto_map` de la configuración no se utiliza. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO para el borrador. El objetivo subyacente pertenece a la familia Qwen3 (27B) y lleva el sufijo `heretic`, asociado a variantes con alineación reducida, pero no se detallan los detalles de ese ajuste.

## Capacidades

- **Decodificación especulativa**: propone tokens candidatos que el objetivo verifica, acelerando la inferencia respecto a la decodificación autorregresiva estándar.
- **Consumo de estados ocultos intermedios**: explota las capas `1, 16, 31, 46, 61` del objetivo para condicionar sus propuestas.
- **Integración con OVMS**: se empareja mediante `draft_models_path` en `LLMCalculatorOptions`; OVMS registra `Draft model strategy: DFlash` cuando el emparejamiento es aceptado.
- **Integración con OpenVINO GenAI**: utilizable junto a un objetivo OpenVINO compatible.
- **No soporta** generación de texto autónoma, tool calling, agentes, visión, audio ni modo thinking por sí mismo: esas capacidades, si existen, residen en el modelo objetivo.
- **Multilingüismo**: no documentado para el borrador; depende del objetivo.

## Casos de uso

- **Aceleración de inferencia en CPU Intel**: desplegar el objetivo `Qwen3.8-27B-heretic-ara-int4-ov` junto a este borrador en OVMS para reducir la latencia por token en servidores sin GPU dedicada, aprovechando el formato OpenVINO IR y la cuantización int4.
- **Servicio en Intel Arc**: emparejar objetivo y borrador en GPUs Intel Arc para obtener decodificación especulativa con un borrador de 0,9 GB, minimizando el coste de memoria adicional frente al modelo de 27B.
- **Chat multi-turno de baja latencia**: usar la pareja objetivo+borrador en asistentes conversacionales donde el tiempo hasta el primer token y la velocidad de generación son críticos, siempre que el objetivo exporte los metadatos `hidden_states_decoder_layers`.
- **Generación de código interactiva**: en entornos de autocompletado o revisión de código sobre hardware Intel, la verificación del objetivo mantiene la calidad mientras el borrador reduce el coste por token.
- **Evaluación de decodificación especulativa**: emplear este repositorio como referencia para medir la tasa de aceptación del borrador frente al objetivo en distintos dominios, comparando las builds int4, int8 y fp16.
- **Pipelines de resumen y extracción sobre documentos**: desplegar la pareja en OVMS para tareas de procesamiento por lotes con contexto largo, donde el ahorro acumulado por token compensa el coste de gestión del borrador.
- **Despliegue en entornos con restricciones de memoria**: al ocupar 0,9 GB en int4, el borrador es viable en nodos donde no cabría un segundo modelo completo, manteniendo el objetivo cuantizado como único componente pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de aceptación del borrador, speedup medido, latencia ni throughput.

## Requisitos de hardware

- **VRAM/RAM del borrador**: 0,9 GB en int4 (tamaño del repositorio); las builds int8 y fp16 ocupan más, sin cifra publicada.
- **Memoria total**: debe sumarse a la del objetivo de 27B; la build int4 del objetivo está publicada como `blaj/Qwen3.8-27B-heretic-ara-int4-ov`.
- **GPU recomendadas**: hardware Intel con soporte OpenVINO (CPU, iGPU y GPUs Intel Arc). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- **Consumer GPU**: no se especifica; el soporte está orientado al ecosistema OpenVINO/Intel.
- **Despliegue**: OVMS con `draft_models_path` y OpenVINO GenAI; requiere OpenVINO 2026.3.1 y Transformers 5.2.0 para la conversión.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Tamaño repo | Licencia | Notas |
|---|---|---|---|---|---|
| `blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov` | Borrador DFlash (OpenVINO) | int4 | 0,9 GB | Apache-2.0 | Este repositorio |
| `blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov` | Borrador DFlash (OpenVINO) | int8 | no disponible | Apache-2.0 | Misma familia, mayor precisión |
| `blaj/Qwen3.8-27B-heretic-ara-DFlash-fp16-ov` | Borrador DFlash (OpenVINO) | fp16 | no disponible | Apache-2.0 | Misma familia, precisión completa |
| `jfan/Qwen3.8-27B-heretic-dflash` | Borrador DFlash (pesos originales) | no disponible | no disponible | Apache-2.0 (según card) | Origen de los pesos |

No se dispone de información sobre borradores especulativos alternativos (EAGLE, Medusa, n-gram) para este objetivo concreto.

## Limitaciones y advertencias

- **No es un modelo autónomo**: no acepta prompts de texto ni produce respuestas finales; solo propone tokens candidatos.
- **Acoplamiento estricto al objetivo**: requiere que el objetivo exporte `hidden_states_decoder_layers` y lea exactamente las capas `1, 16, 31, 46, 61`. Un emparejamiento incorrecto produce cero tokens aceptados sin error explícito.
- **Dependencia de versiones**: conversión validada con OpenVINO 2026.3.1, Transformers 5.2.0 y Optimum Intel con `--trust-remote-code`.
- **Riesgo de alucinación**: inherente al objetivo subyacente; el borrador no lo mitiga, solo acelera.
- **Sesgos**: no documentados para el borrador; dependen del objetivo `heretic`, cuya alineación reducida puede ampliar comportamientos no filtrados.
- **Idiomas y contexto**: no disponibles en la información proporcionada.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del objetivo y de los pesos originales de `jfan/Qwen3.8-27B-heretic-dflash`.
- **Madurez**: 65 descargas y 0 likes en el momento de la consulta; sin benchmarks publicados, no hay evidencia cuantitativa de la ganancia de velocidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov
- Modelo base (pesos del borrador): https://huggingface.co/jfan/Qwen3.8-27B-heretic-dflash
- Build fp16: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-fp16-ov
- Build int8: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov
- Objetivo int4: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-int4-ov
- Objetivo int8: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-int8-ov
- Guía de conversión a OpenVINO IR: https://devnotes.page/posts/how-to-convert-models-to-openvino-ir/
- Guía de conversión y ejecución de DFlash con OpenVINO: https://devnotes.page/posts/how-to-convert-and-run-dflash-models-with-openvino/
