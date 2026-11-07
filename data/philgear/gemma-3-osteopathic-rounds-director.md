# philgear/gemma-3-osteopathic-rounds-director

## Resumen

`philgear/gemma-3-osteopathic-rounds-director` es un adaptador LoRA (PEFT) construido sobre el modelo base `google/gemma-3-12b-it`. Lo publica Phillip Gear bajo la organizacion PocketGull LLC (Oregon Registry 258869891) y se presenta como una especializacion en medicina osteopatica, disfuncion somatica y "consenso de custodia colaborativa" interdisciplinar. El adaptador esta pensado para generar sintesis de rondas clinicas y razonamiento biomecanico somatico en ingles.

El modelo se distribuye con licencia Apache 2.0 y la model card declara un ajuste fino mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos de dominio que, segun el autor, cumplen con los estandares de desidentificacion de HIPAA §164.514 Safe Harbor. No se publican detalles sobre el volumen de datos, la composicion del dataset ni hiperparametros de entrenamiento.

La relevancia del modelo es limitada y muy nichada: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, y cuyo valor practico depende enteramente de la calidad del modelo base Gemma 3 12B y de la evaluacion clinica independiente, que no se ha documentado. No debe confundirse con un dispositivo medico: la propia model card lo declara no-dispositivo bajo la exencion FDA 520(o) para software de soporte a la decision clinica (CDS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 3 12B IT) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 12 000 millones (aproximado, segun denominacion del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato PEFT; el quickstart usa bfloat16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (safetensors, segun la libreria `peft`); requiere el modelo base `google/gemma-3-12b-it` |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma 3 de Google. El autor declara un ajuste fino con Direct Preference Optimization (DPO) sobre datos clinicos de dominio desidentificados conforme a HIPAA §164.514 Safe Harbor. La model card describe la "arquitectura" del sistema como "SFI Complex Adaptive Systems / Whole-Person Biomechanical Grounding", una denominacion propia del autor que no corresponde a una arquitectura de red neuronal estandar y que no viene acompanada de especificaciones tecnicas verificables.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de LoRA (rango, alpha, modulos objetivo), la duracion del entrenamiento ni los hiperparametros de DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla del propio ajuste por preferencias.

## Capacidades

- Generacion de texto en ingles orientada a sintesis de rondas clinicas y razonamiento medico-osteopatico.
- Sintesis de escenarios de disfuncion somatica y biomecanica (por ejemplo, restriccion de excursion costal o hipertonia simpatica), segun el ejemplo de la model card.
- Formulacion de "consenso de custodia colaborativa" interdisciplinar, segun la descripcion del autor.
- Soporte de tool calling / function calling: no documentado en la informacion disponible (depende de las capacidades heredadas del modelo base).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas para el adaptador.

## Casos de uso

- Sintesis de rondas clinicas osteopaticas: el adaptador puede generar resumenes estructurados de hallazgos somaticos y propuestas de manejo a partir de descripciones de caso, usando el formato de prompt que muestra la model card.
- Apoyo a la documentacion de disfuncion somatica: generar texto de borrador sobre hallazgos biomecanicos (por ejemplo, restricciones de excursion costal) para revision por un profesional licenciado.
- Formacion y simulacion clinica: crear escenarios de practica y discusion de casos en medicina osteopatica en entornos controlados sin datos reales de pacientes.
- Prototipado de asistentes CDS locales: desplegado en edge o en Vertex AI privado, sirve como base para experimentar con flujos de soporte a la decision que no retienen PHI, segun la declaracion del autor.
- Investigacion en NLP clinico: punto de partida para estudiar el efecto de DPO sobre un modelo base en dominios medicos especializados, siempre con validacion independiente.
- Generacion de material educativo interdisciplinar: borradores de notas de consenso entre disciplinas (osteopatia, fisioterapia, medicina interna) para revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el modelo base de 12B en bfloat16 requiere aproximadamente 24 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV; el adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, serian necesarias GPU con 24 GB o mas (A100 40/80 GB, H100, L40S, RTX 4090/A6000 para cuantizaciones agresivas).
- Cabe en GPU de consumo: posible en RTX 4090 (24 GB) con cuantizacion, aunque no se documenta soporte de cuantizacion para este adaptador.
- Opciones de despliegue: el quickstart oficial usa `transformers` + `peft` con `device_map="auto"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `philgear/gemma-3-osteopathic-rounds-director` | Adaptador sobre 12B | No disponible | Apache 2.0 | Adaptador LoRA clinico nichado, sin benchmarks ni adopcion |
| `google/gemma-3-12b-it` (modelo base) | 12B | No disponible en esta ficha | Gemma Terms of Use | Modelo generalista instruction-tuned; referencia obligada del adaptador |
| Alternativas clinicas de 7-13B | Variable | Variable | Variable | No disponible: no se han identificado en la informacion proporcionada adaptadores comparables verificables |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion clinica independiente: no hay evidencia publicada de que el ajuste mejore al modelo base en tareas medicas.
- Riesgo elevado de alucinacion clinica: un adaptador DPO sin validacion puede generar recomendaciones plausibles pero incorrectas; requiere supervision de un profesional licenciado en todo momento.
- Cero adopcion (0 descargas, 0 likes) y creado en noviembre de 2026: no hay senal de uso comunitario ni de mantenimiento.
- Solo ingles: no apto para uso clinico en castellano sin evaluacion adicional.
- La declaracion de cumplimiento HIPAA Safe Harbor se refiere al proceso de desidentificacion de los datos de entrenamiento, no garantiza que las salidas del modelo esten libres de PHI ni exime al desplegador de sus obligaciones regulatorias.
- La model card lo declara no-dispositivo bajo FDA 520(o); su uso como CDS real exige cumplir los criterios de la exencion y no sustituye el juicio clinico.
- Terminologia no estandar ("SFI Complex Adaptive Systems") sin respaldo tecnico verificable; tratar las afirmaciones de la model card con escepticismo.
- Licencia Apache 2.0 en el adaptador, pero el uso del modelo base Gemma 3 queda sujeto a los terminos de Google, que deben revisarse por separado.
- No se documenta soporte para cuantizacion, tool calling ni despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-osteopathic-rounds-director
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Organizacion PocketGull: https://pocketgull.com
- Sitio del proyecto: https://pocketgull.app
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- DOI de cita (Zenodo): https://doi.org/10.5281/zenodo.20647514
