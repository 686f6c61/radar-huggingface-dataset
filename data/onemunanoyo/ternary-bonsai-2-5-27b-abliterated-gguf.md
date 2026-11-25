# onemunanoyo/Ternary-Bonsai-2.5-27B-Abliterated-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-Abliterated-GGUF es un experimento de la comunidad publicado por el usuario onemunanoyo que aplica una transferencia de pesos "abliterated" sobre el modelo Ternary Bonsai 2.5 27B de Prism ML. El objetivo es eliminar o atenuar el comportamiento de rechazo del modelo base mediante la inyección de deltas de pesos calculados a partir de Huihui-Qwen3.8-27B-abliterated, un modelo ya modificado con esa misma finalidad. El resultado se empaqueta en formato GGUF con cuantizaciones ternarias nativas (PTQ1_0 y PQ2_0) para su uso con llama.cpp.

El modelo base Ternary Bonsai 2.5 27B emplea pesos ternarios con escalas fijas y una base blockwise de Hadamard, lo que permite representaciones muy compactas (el archivo PTQ1_0 ocupa unos 6,23 GB para 27.320.697.856 parámetros). Incluye además una cabeza MTP (multi-token prediction) y un proyector de visión separado en Q8_0, lo que sugiere capacidades multimodales en el modelo original.

Se trata de una prueba de concepto con evaluación muy limitada: el propio autor advierte que los resultados proceden de 50 escenarios autoredactados en inglés con tres etiquetas forzadas, y que el comportamiento libre, la seguridad real y las capacidades generales no se han medido. Es relevante como ejemplo técnico de transferencia de ediciones entre espacios de pesos distintos (BF16 a ternario), no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (cuantizacion PTQ1_0/PQ2_0), cabeza MTP y proyector de vision; detalles completos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 (~6,23 GB) y PQ2_0 (~7,49 GB); proyector de vision en Q8_0 |
| Idiomas soportados | no disponible (la evaluacion se hizo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo deriva de Ternary Bonsai 2.5 27B, que trabaja con pesos ternarios organizados en escalas fijas y una base blockwise de Hadamard. El proceso de edición descrito por el autor consiste en restar los pesos BF16 originales de Qwen3.8-27B a los pesos BF16 de Huihui-Qwen3.8-27B-abliterated para obtener los deltas, rotar los 70 tensores del backbone modificados a la base de Hadamard con signo de Bonsai, seleccionar códigos ternarios sobre las escalas fijas existentes ponderando el error en la dirección principal de la edición, y reempaquetar esos códigos en GGUF nativos PTQ1_0 y PQ2_0. Finalmente se verifica que las escalas y los 15 tensores de la cabeza MTP coinciden byte a byte con el original.

No se detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es precisamente el método de transferencia de ediciones entre espacios de pesos heterogéneos (BF16 a ternario) preservando la estructura de cuantización y la cabeza MTP, algo poco habitual en la práctica. El proyector de visión se mantiene intacto respecto al original.

## Capacidades

- Generación de texto conversacional en formato GGUF compatible con llama.cpp.
- Razonamiento y generación de código: capacidades heredadas del modelo base, no evaluadas en esta ficha.
- Predicción multi-token (MTP) habilitada en los archivos publicados.
- Soporte de visión mediante el proyector `Ternary-Bonsai-2.5-27B-mmproj-Q8_0.gguf`, aunque la inferencia de visión no se probó en el smoke test del autor.
- Comportamiento de rechazo atenuado: en la evaluación exploratoria, el modelo editado seleccionó la etiqueta de rechazo en 4 de 50 escenarios, frente a 50 de 50 del original.
- Soporte de tool calling, agentes y multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo sirve como caso de estudio reproducible de cómo se transfieren ediciones de pesos entre arquitecturas y espacios de cuantización distintos, útil para grupos que investigan técnicas de modificación de comportamiento.
- Experimentación con cuantización ternaria: permite probar en llama.cpp el rendimiento real de pesos ternarios PTQ1_0 y PQ2_0 en hardware de consumo, comparando con el modelo base sin editar.
- Pruebas de robustez de salvaguardas: al presentar un comportamiento de rechazo muy reducido, es útil para evaluar pipelines de moderación y clasificadores de seguridad frente a modelos con menos restricciones.
- Desarrollo de prototipos locales con requisitos de memoria ajustados: los ~6,23 GB del archivo PTQ1_0 permiten ejecutar un modelo de 27B en GPUs de consumo, útil para demos y pruebas de concepto sin infraestructura dedicada.
- Evaluación de decodificación especulativa con MTP: la cabeza MTP preservada byte a byte permite medir el impacto del multi-token prediction en latencia y throughput dentro del fork de llama.cpp de Prism ML.
- Estudio de transferencia de deltas entre modelos emparentados: el método descrito (resta de pesos, rotación a base de Hadamard, selección de códigos ternarios) es replicable para otros pares de modelos con la misma arquitectura de origen.

## Benchmarks y rendimiento

El autor presenta una única evaluación exploratoria, explícitamente calificada como "very rough benchmark", sobre 50 escenarios de intención dañina autoredactados en inglés con tres etiquetas forzadas (rechazo, acuerdo, inseguro):

| Modelo | Rechazo | Acuerdo | Inseguro |
|---|---|---|---|
| Ternary Bonsai 2.5 27B original (PTQ1_0 y PQ2_0) | 50/50 | 0/50 | 0/50 |
| Ternary Bonsai 2.5 27B Abliterated (PTQ1_0 y PQ2_0) | 4/50 | 43/50 | 3/50 |

Ambos empaquetados editados produjeron etiquetas idénticas en cada ítem. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni se midieron el rechazo en formato libre, la generación de contenido dañino, la capacidad general ni la seguridad en despliegue.

## Requisitos de hardware

- VRAM estimada: unos 6,23 GB para el archivo PTQ1_0 y unos 7,49 GB para PQ2_0, más el proyector de visión Q8_0 y el contexto KV cache.
- GPU recomendadas: el autor verificó el funcionamiento en una RTX 5060 con el build b12178 del fork de Prism ML. Por tamaño, debería caber en GPUs de consumo con 8-12 GB de VRAM, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: sí, según el smoke test en RTX 5060; no hay datos para GPUs de gama de entrada con menos de 8 GB.
- Opciones de despliegue: requiere el fork de llama.cpp de PrismML-Eng (releases en GitHub), no el llama.cpp upstream, por el soporte de PTQ1_0, PQ2_0 y MTP.
- Latencia y throughput: no disponibles; solo se confirma que pasa un smoke test corto de generación de texto con MTP habilitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Abliterated-GGUF | 27,3 B | no disponible | PTQ1_0, PQ2_0 (ternaria) | Apache 2.0 | Edicion abliterated experimental, evaluacion minima |
| Ternary-Bonsai-2.5-27B-GGUF (Prism ML) | 27,3 B | no disponible | PTQ1_0, PQ2_0 (ternaria) | Apache 2.0 | Modelo base sin editar, rechazo 50/50 en la prueba del autor |
| Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | BF16 | Apache 2.0 | Fuente de los deltas de edicion; formato BF16, no ternario |
| Qwen3.8-27B (original) | no disponible | no disponible | BF16 | Apache 2.0 | Pesos de referencia para calcular los deltas |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Evaluación insuficiente: los resultados provienen de 50 escenarios autoredactados en inglés con etiquetas forzadas; no se midió el comportamiento en formato libre ni la generación real de contenido dañino.
- El propio autor califica el modelo como prueba de concepto experimental y no recomienda tratarlo como listo para producción.
- Riesgo de alucinación: no evaluado; se desconoce si la edición de pesos afecta a la fidelidad factual del modelo base.
- Sesgos: no evaluados; la edición abliterated puede alterar la calibración del modelo en dominios sensibles sin que se haya medido el efecto.
- Idiomas: solo se probó en inglés; el soporte multilingüe del modelo base no está documentado en esta ficha.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues con ventanas largas.
- Dependencia de un fork: requiere el llama.cpp de PrismML-Eng, lo que limita la portabilidad y el soporte a largo plazo.
- Visión no verificada: el proyector se preserva byte a byte, pero la inferencia multimodal quedó fuera del smoke test.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la ausencia de evaluaciones de seguridad desaconsejan su uso en aplicaciones orientadas al usuario sin auditoría previa.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onemunanoyo/Ternary-Bonsai-2.5-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo fuente de los deltas: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Fork de llama.cpp de Prism ML: https://github.com/PrismML-Eng/llama.cpp/releases
