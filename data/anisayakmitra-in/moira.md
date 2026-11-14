# anisayakmitra-in/moira

## Resumen

MOIRA es un modelo de decisión presentado por el autor anisayakmitra-in bajo la arquitectura propietaria FATE-O-SISTERS (MOIRA). No es un modelo de lenguaje generativo al uso, sino un motor de decisión con perspectiva 3-6-9 compuesto por tres cabezas denominadas Clotho, Lachesis y Atropos, cada una con un peso distinto (3, 6 y 9) que se combinan mediante una ley de mezcla lineal. El modelo se distribuye en formato safetensors y está etiquetado como motor de decisión y seguridad de agentes.

El repositorio tiene un tamaño de 0.0 GB y registra 13.633 parámetros totales según el recuento real de safetensors, lo que lo sitúa en una escala muy reducida, lejos de los modelos de lenguaje convencionales. No se dispone de información sobre longitud de contexto, idiomas soportados ni pipeline de inferencia. La model card describe un benchmark sobre un conjunto adversario reservado en el que MOIRA y una línea base naive de una sola cabeza alcanzan ambos el 100.0% de precisión.

La relevancia del proyecto es principalmente exploratoria: propone un esquema de veto causal de seguridad (Atropos) y una estabilización recurrente de estado compartido en 9 pasos (Lachesis) dentro de un pipeline de decisión. La licencia GPL-3.0 y la ausencia de datos publicados sobre contexto, idiomas y despliegue limitan su uso en producción sin una evaluación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FATE-O-SISTERS (MOIRA): tres cabezas (Clotho, Lachesis, Atropos) con ley de mezcla 3:6:9 |
| Parametros totales | 13.633 (recuento real en safetensors) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 (GPL-3.0-or-later) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se compone de tres módulos con pesos diferenciados. Clotho (peso 3) realiza alineamiento léxico e intención rápida; Lachesis (peso 6) implementa una estabilización recurrente de estado compartido en 9 pasos; y Atropos (peso 9) actúa como puerta de veto causal de seguridad e integridad. La salida se combina según la ley de mezcla `V_mixed = (3 * V_clotho + 6 * V_lachesis + 9 * V_atropos) / 18`, de modo que Atropos tiene el mayor peso relativo en la decisión final.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card menciona un "Distilled Tropical Student (Zero-Multiplication)" con un MSE de 9.16619, lo que sugiere un proceso de destilación hacia un estudiante sin multiplicaciones, pero no se detalla el procedimiento ni los datos empleados. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Decisión y clasificación de intención mediante la cabeza Clotho, orientada a alineamiento léxico rápido.
- Estabilización de estado en 9 pasos recurrentes con pesos compartidos mediante Lachesis.
- Veto causal de seguridad e integridad mediante Atropos, con el mayor peso en la mezcla final.
- Mezcla ponderada de las tres señales según la ley 3:6:9 para producir una decisión final.
- Destilación a un estudiante sin multiplicaciones (Zero-Multiplication), según la model card.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Filtro de seguridad en pipelines de agentes: Atropos podría emplearse como etapa de veto causal que bloquee acciones antes de su ejecución, dado su mayor peso en la mezcla y su función declarada de integridad.
- Clasificación rápida de intención en asistentes conversacionales: Clotho aporta alineamiento léxico de bajo coste, adecuado para una primera etapa de enrutamiento previa a un modelo mayor.
- Estabilización de estado en sistemas de decisión secuencial: Lachesis, con sus 9 pasos recurrentes de pesos compartidos, encaja en tareas donde la coherencia entre decisiones sucesivas es crítica.
- Evaluación de políticas de decisión en entornos adversarios: el benchmark sobre un conjunto adversario reservado permite comparar la mezcla 3:6:9 frente a líneas base de una sola cabeza.
- Prototipado de investigación en arquitecturas de decisión: el reducido tamaño (13.633 parámetros) facilita experimentar con la ley de mezcla y los pesos relativos de cada cabeza.
- Destilación a modelos ligeros sin multiplicaciones: el estudiante tropical documentado permite explorar despliegues en hardware con restricciones aritméticas, aunque el MSE reportado (9.16619) exige validación adicional.

## Benchmarks y rendimiento

| Benchmark | MOIRA | Baseline naive (una cabeza) |
|---|---|---|
| Precisión (conjunto adversario reservado) | 100.0% | 100.0% |
| Margen de decisión medio | 7.633 | 7.418 |
| MSE del estudiante tropical destilado | 9.16619 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 13.633 parámetros el modelo es de escala mínima y cabría en cualquier GPU consumer, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: previsiblemente sí por tamaño, aunque no se confirma en la documentación.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (motores de decisión con mezcla ponderada de cabezas) ni alternativas de tamaño similar con datos públicos de rendimiento.

## Limitaciones y advertencias

- El benchmark reportado usa un conjunto adversario reservado no público; ambos sistemas alcanzan el 100.0%, por lo que no discrimina entre MOIRA y la línea base naive.
- El margen de decisión medio de MOIRA (7.633) es solo ligeramente superior al de la línea base (7.418), lo que cuestiona la ventaja práctica de la mezcla 3:6:9.
- El MSE del estudiante tropical destilado (9.16619) es elevado y no se acompaña de una línea base para interpretarlo.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento fuera de distribución.
- No se documentan idiomas soportados, longitud de contexto ni cuantizaciones disponibles.
- La licencia GPL-3.0 impone obligaciones de copyleft: cualquier distribución de obras derivadas debe publicarse bajo la misma licencia, lo que puede ser incompatible con productos comerciales cerrados.
- El repositorio no registra descargas ni likes y su tamaño es de 0.0 GB, lo que sugiere una publicación reciente y sin validación comunitaria.
- No se documenta pipeline de inferencia, lo que obliga al integrador a reconstruir el proceso de carga y mezcla a partir de la descripción de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anisayakmitra-in/moira
- Repositorio FATE-O-SISTERS: https://github.com/anisayakmitra-in/FATE-O-SISTERS
