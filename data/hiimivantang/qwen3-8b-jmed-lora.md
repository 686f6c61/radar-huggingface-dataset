# hiimivantang/qwen3-8b-jmed-lora

## Resumen

`qwen3-8b-jmed-lora` es un adaptador LoRA de especialización clínica en japonés construido sobre `Qwen/Qwen3-8B`. Lo publica el usuario hiimivantang como prueba de concepto de investigación para la extracción de información estructurada a partir de documentos clínicos japoneses, devolviendo JSON con entidades, tipo de documento y un registro estructurado de 11 campos. No contiene los pesos del modelo base: es un adaptador PEFT que debe cargarse junto a la revisión exacta `b968826d9c46dd6066d109eabc6255188de91218` de Qwen3-8B.

El interés técnico está en el contraste entre un modelo base de 8.000 millones de parámetros y un ajuste fino muy específico de tarea: el adaptador se entrenó con prompts japoneses fijos y plantilla de chat `qwen3` con el modo de razonamiento desactivado (`enable_thinking=False`). Sobre un conjunto de test sintético de 223 notas por tarea, el adaptador eleva el F1 estricto de extracción de entidades de 0,951 a 0,997 y la precisión de campo del registro estructurado de 0,906 a 0,993, con un 94 % de registros con los 11 campos correctos frente al 35 % del base.

La relevancia práctica es doble: demuestra que un LoRA de rango bajo puede superar a modelos propietarios en tareas de extracción muy delimitadas, y al mismo tiempo expone con claridad el foso entre datos sintéticos y documentos reales. En los informes de caso anotados por humanos del conjunto JMED-LLM, el F1 estricto de extracción de enfermedades cae a 0,473 (desde 0,997 sintético), lo que lo sitúa por encima de GPT-4.1 (0,110) pero muy lejos de un uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; el base Qwen3-8B tiene 8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen3-8B en safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (así se declara en el ejemplo de despliegue con `--max-lora-rank 16`) aplicado sobre Qwen3-8B, un transformer decoder-only denso de 8.000 millones de parámetros. El entrenamiento se realizó con la plantilla de chat `qwen3` y el modo de pensamiento desactivado, sobre tres tareas supervisadas con prompts japoneses literales: extracción de entidades (síntomas, enfermedades y medicamentos del paciente, excluyendo negaciones, sospechas y antecedentes familiares), clasificación del tipo de documento en seis categorías (外来診療録, 入院時記録, 退院時サマリー, 紹介状, 看護記録, 検査・画像所見報告書) y extracción de un registro estructurado de 11 campos.

Los datos de entrenamiento son mayoritariamente notas clínicas sintéticas de pacientes ficticios, y la evaluación se hizo principalmente sobre datos sintéticos (223 notas por tarea, con un 25 % de vocabulario no visto en entrenamiento). No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO; el autor describe el proyecto como prueba de concepto de investigación. La innovación destacable no es arquitectónica sino de formato: salida JSON estricta sin bloques de código, decodificación greedy con `temperature=0` y `repetition_penalty=1.1`, y evaluación mediante código determinista en lugar de un juez LLM.

## Capacidades

- Extracción de entidades clínicas en japonés (síntomas, enfermedades, medicamentos) con coincidencia literal sobre el texto original, sin normalización.
- Clasificación del tipo de documento clínico en seis categorías predefinidas.
- Extracción de registro estructurado de 11 campos: edad, sexo, motivo de consulta, síntomas, síntomas negados, antecedentes personales, antecedentes familiares, medicamentos, alergias, diagnósticos y diagnósticos sospechosos.
- Generación de JSON estricto como única salida, sin texto explicativo ni marcas de bloque de código.
- Manejo explícito de negaciones («〜なし», «〜は認めない») y separación entre diagnósticos confirmados y sospechados.
- Modo de razonamiento desactivado de forma obligatoria; el adaptador no está entrenado para el modo thinking.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües más allá del japonés.
- Ámbito restringido a extracción de información; el system prompt prohíbe explícitamente recomendar diagnósticos o tratamientos.

## Casos de uso

- Digitalización de historiales en papel: procesar lotes de notas clínicas japonesas y obtener un JSON con edad, sexo, motivo de consulta y diagnósticos para poblar una base de datos estructurada, aprovechando que el adaptador mantiene la coincidencia literal con el texto original.
- Triaje documental en un archivo hospitalario: clasificar automáticamente cada documento en una de las seis categorías (informe de alta, carta de derivación, registro de enfermería, etc.) antes de enrutarlo al departamento correspondiente, con macro-F1 de 0,988 en el conjunto sintético.
- Preanotación para revisión humana: generar borradores de entidades y campos estructurados que un codificador clínico revisa y corrige, reduciendo el tiempo de codificación manual; el 94 % de registros con 11 campos correctos en sintético indica un buen punto de partida, aunque el rendimiento en documentos reales exige revisión sistemática.
- Extracción de medicación y alergias para conciliación: identificar fármacos en uso y sustancias alérgicas en notas de ingreso, con exclusión de dosis, para alimentar un sistema de conciliación medicamentosa antes de la admisión.
- Investigación en NLP clínico en japonés: servir como línea base reproducible para estudiar la brecha entre datos sintéticos y reales, dado que el autor publica resultados comparativos con GPT-4.1 y un modelo propietario posterior en el mismo conjunto de test.
- Construcción de corpus anotados: usar el adaptador como anotador automático de notas sintéticas o de bajo riesgo para generar datasets de entrenamiento adicionales, dado su alto F1 estricto en el dominio sintético en el que fue entrenado.
- Detección de negaciones y antecedentes familiares: separar síntomas presentes de síntomas negados y de antecedentes familiares en textos donde esa distinción es crítica, tarea en la que el campo `negated_symptoms` está modelado de forma explícita.

## Benchmarks y rendimiento

Conjunto de test sintético retenido, 223 notas por tarea, 25 % de vocabulario no visto, decodificación greedy, thinking desactivado y puntuación por código determinista:

| Tarea | Qwen3-8B base (mismo prompt) | Este adaptador | GPT-4.1 | GPT-6.1-sol (post-hoc) |
|---|---|---|---|---|
| A — extracción de entidades (F1 estricto) | 0,951 | 0,997 | 0,962 | 0,949 |
| B — tipo de documento (macro-F1) | 0,622 | 0,988 | 0,711 | 0,761 |
| C — registro estructurado (precisión de campo) | 0,906 | 0,993 | 0,902 | 0,974 |
| C — registros con los 11 campos correctos | 35 % | 94 % | 36 % | 74 % |

Resultados adicionales reportados por el autor:

| Conjunto | Métrica | Base | Adaptador | GPT-4.1 |
|---|---|---|---|---|
| 215 notas de otro generador (NVIDIA Nemotron) — tipo de documento | macro-F1 | 0,335 | 0,789 | 0,556 |
| 215 notas de otro generador — tipo de documento | macro-F1 | — | 0,988 (sintético original) | — |
| Documentos reales JMED-LLM, informes de caso anotados por humanos (100 ítems) — extracción de enfermedades | F1 estricto | 0,265 | 0,473 | 0,110 |

La comparación con GPT-6.1-sol se añadió el 2026-10-30, después de conocerse los resultados originales, y el autor indica que el adaptador también supera a ese modelo en las 215 notas del generador alternativo (tipo de documento 0,789 frente a 0,594).

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el requisito real lo marca el base Qwen3-8B, que en bfloat16 ocupa aproximadamente 16 GB de VRAM solo en pesos.
- VRAM estimada para inferencia: en bfloat16, unos 16-18 GB (pesos más caché KV); en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB, aunque el autor no publica cifras de cuantización para este adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 sin cuantizar. En consumer, una RTX 4090 o RTX 3090 de 24 GB permite cargar el base en bfloat16; tarjetas de 12-16 GB requieren cuantización.
- Despliegue: soportado en Transformers + PEFT (`PeftModel.from_pretrained`) y en vLLM con `--enable-lora --max-lora-rank 16 --lora-modules jmed-lora=...`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Es obligatorio fijar la revisión del base `b968826d9c46dd6066d109eabc6255188de91218`; el adaptador se entrenó contra ese commit exacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-8b-jmed-lora | LoRA sobre Qwen3-8B | 8.000 M (base) | no disponible | F1 estricto 0,997 (A), macro-F1 0,988 (B), 94 % registros completos (C) en sintético | Apache 2.0 | HuggingFace (adaptador) |
| Qwen3-8B base | Transformer denso | 8.000 M | no disponible | F1 estricto 0,951 (A), macro-F1 0,622 (B), 35 % registros completos (C) | Apache 2.0 | HuggingFace |
| GPT-4.1 | Propietario | no disponible | no disponible | F1 estricto 0,962 (A), macro-F1 0,711 (B), 36 % registros completos (C) | Propietaria | API |
| GPT-6.1-sol | Propietario | no disponible | no disponible | F1 estricto 0,949 (A), macro-F1 0,761 (B), 74 % registros completos (C) | Propietaria | API |

Los dos modelos propietarios se evaluaron con el mismo prompt y el mismo conjunto sintético, según los datos del autor. No se dispone de comparación con otros adaptadores clínicos en japonés.

## Limitaciones y advertencias

- Aviso explícito del autor: prueba de concepto de investigación, no apta para uso clínico. No debe emplearse para tomar o apoyar decisiones sobre pacientes individuales.
- Entrenado mayoritariamente con notas clínicas sintéticas de pacientes ficticios y evaluado mayoritariamente en datos sintéticos; no está validado clínicamente.
- Brecha severa entre sintético y real: el F1 estricto de extracción de enfermedades cae de 0,997 a 0,473 en los informes de caso reales de JMED-LLM. Hay que medir el adaptador sobre documentos propios antes de confiar en él.
- El rendimiento se degrada con estilos de escritura distintos: en las 215 notas de otro generador, el macro-F1 de tipo de documento baja de 0,988 a 0,789.
- Los prompts deben usarse literalmente como se publican; otros prompts no reproducen los resultados.
- Requiere el modo thinking desactivado (`enable_thinking=False`) y la revisión exacta del base; desviarse de cualquiera de las dos condiciones invalida el comportamiento esperado.
- Solo japonés; no hay soporte multilingüe documentado.
- Riesgo de alucinación en campos clínicos: aunque el prompt exige fundamentar la respuesta solo en el texto, la salida JSON puede contener entidades no presentes, especialmente en documentos fuera de distribución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia no exime de las advertencias clínicas del autor ni de las obligaciones regulatorias aplicables a datos sanitarios.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos sintéticos, puede reproducir los sesgos de distribución del generador utilizado.
- Sin soporte de tool calling, agentes, visión ni audio.
- El adaptador no incluye pesos del base; su huella de 0,1 GB no refleja el coste real de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hiimivantang/qwen3-8b-jmed-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Revisión del base requerida: `b968826d9c46dd6066d109eabc6255188de91218`
- Repositorio PEFT: https://github.com/huggingface/peft
- vLLM (despliegue con LoRA): https://github.com/vllm-project/vllm
- Conjunto JMED-LLM (mencionado en la evaluación con documentos reales): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
