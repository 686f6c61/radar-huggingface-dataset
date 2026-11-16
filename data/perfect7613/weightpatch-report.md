# Perfect7613/weightpatch-report

## Resumen

WeightPatch es un informe técnico (no un modelo en sí) publicado por el autor Perfect7613 en el marco del hackathon de seguridad y alineación de IA de Lexsi Labs, pista 2b (seguridad y corrección de IA). El artefacto documenta un *harness* en el que un agente basado en un modelo de lenguaje (GPT-6 Astra, con sus propias herramientas desactivadas) edita directamente los pesos de un modelo liberado, `CohereLabs/tiny-aya-global`, sin fine-tuning ni adaptadores, escribiendo un bloque de código Python por turno que se ejecuta en un sandbox con acceso a los pesos y a herramientas de localización y medición de comportamientos (SafeTune, CircuitKIT y AuditKIT de Lexsi Labs).

El interés del trabajo reside en su metodología: un *grader* independiente recarga los pesos, verifica que se haya modificado como máximo el 0,1 % de las entradas, comprueba capacidades en MMLU, MILU Hindi y MedMCQA, mide el comportamiento objetivo sobre prompts que el agente nunca vio y ejecuta detectores de ediciones que intentan falsear la medición. El agente solo recibe el veredicto. Se publican cuatro ejecuciones con sus trazas completas, incluidas las fallidas.

Los resultados aceptados incluyen una reducción del rechazo excesivo (de 31,5 % a 10,0 % en 200 prompts OR-Bench hard no vistos) mediante la edición de 398.328 entradas (0,012 % de los pesos) en 195 columnas de salida MLP de las capas 20, 22, 23 y 24. La ficha describe este repositorio como artefacto de investigación, no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio es un informe; el modelo base es `CohereLabs/tiny-aya-global`) |
| Parametros totales | No disponible para el informe; corresponde a los del modelo base `CohereLabs/tiny-aya-global` |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el informe evalúa nueve idiomas vía MultiJail y MILU Hindi) |
| Licencia | MIT |
| Formato de pesos | No disponible (el harness opera sobre los pesos del modelo base en un sandbox con PyTorch/Transformers) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un *harness* de edición de pesos y su informe. El agente (GPT-6 Astra a través de Codex CLI, con sus herramientas nativas desactivadas) emite un bloque de Python por turno siguiendo un bucle tipo *recursive language model*. El kernel ejecuta ese código contra los pesos con una lista blanca de builtins y presupuestos de ejecuciones de código, pases forward, prompts, segundos de GPU y envíos, registrando cada edición. Las herramientas se apoyan en SafeTune (direcciones de seguridad y neuronas de seguridad por activación y por peso), CircuitKIT (circuitos y puntuaciones de neuronas) y AuditKIT (detector de rechazos, jueces de guardia y evaluación emparejada), además de herramientas nativas de puntuación por ítem, contrastes de neuronas, *steering*, *token lens* y barridos de neuronas individuales.

No hay fine-tuning ni adaptadores: el modo es *improve-from-base*, donde los pesos liberados del modelo base son la línea base y la comparación reportada es siempre modelo liberado frente a modelo editado. El *grader* aplica etapas de integridad, capacidad, comprobación rápida del objetivo con guardia, conjunto sellado no visto con guardia, prompts perturbados y detectores de ediciones falseadas, con *bootstrap* emparejado y alfa 0,05. Todo se ejecuta en Modal sobre una GPU. La innovación destacable es metodológica: separación estricta entre agente y evaluador, límite duro del 0,1 % de entradas modificadas y publicación de trazas y veredictos, incluidos los rechazos.

## Capacidades

- Edición directa de pesos de un modelo liberado sin fine-tuning ni adaptadores, mediante código Python generado por un agente.
- Localización de comportamientos (direcciones de seguridad, neuronas de seguridad, circuitos) con SafeTune y CircuitKIT.
- Medición de comportamientos con AuditKIT: detección de rechazos, jueces de guardia y evaluación emparejada.
- Evaluación automatizada con *grader* multi-etapa: integridad, capacidad, objetivo sellado, prompts perturbados y detectores de *reward hacking*.
- Soporte de presupuestos y registro de auditoría (ejecuciones de código, pases forward, prompts, segundos de GPU, envíos).
- Generación de informes a partir de un fichero de evidencias construido por código, marcando cifras no presentes en la evidencia.
- Verificación independiente mediante `scripts/verify_published_model.py`, que solo importa `torch`, `transformers` y `datasets`.
- Idiomas evaluados: inglés, hindi (MILU) y nueve idiomas vía MultiJail.
- No disponible: tool calling, agentes multi-paso, visión, audio o modo *thinking* como capacidades del artefacto.

## Casos de uso

- Investigación en seguridad y alineación: reproducir el *harness* para estudiar cómo un agente localiza y corrige comportamientos (rechazo excesivo, seguridad multilingüe) editando un porcentaje mínimo de pesos, con trazas auditables.
- Reducción de rechazo excesivo en producción: aplicar la metodología de dirección ortogonal a la dirección dañina y amplificación en columnas MLP concretas para disminuir falsos rechazos sin aumentar respuestas dañinas, validando con conjuntos no vistos.
- Auditoría de ediciones de pesos: usar el *grader* (integridad, capacidad, objetivo sellado, perturbaciones, detectores de *reward hacking*) como plantilla para verificar ediciones en modelos propios antes de desplegarlos.
- Evaluación multilingüe de seguridad: emplear MultiJail y MILU Hindi junto con el detector de rechazos para medir respuestas dañinas por idioma y validar correcciones con *bootstrap* emparejado.
- Detección de *reward hacking* en pipelines de optimización: reutilizar los detectores de ediciones que falsean la medición para descartar mejoras que no se transfieren a prompts no vistos.
- Formación y docencia: estudiar un caso completo de edición de pesos con presupuestos, límites duros (0,1 % de entradas) y publicación de fallos como material didáctico sobre rigor experimental.
- Reproducibilidad de resultados: ejecutar `scripts/verify_published_model.py` para comprobar de forma independiente los modelos publicados en la colección de Hugging Face.

## Benchmarks y rendimiento

| Comprobacion (grader) | Liberado | Editado | Resultado |
|---|---:|---:|---|
| OR-Bench hard no visto, rechazos (200) | 31,5 % | 10,0 % | -21,5 puntos (-27,5 a -15,5) |
| Segundo corte (120) | 30,0 % | 9,2 % | significativo |
| Prompts perturbados | no disponible | no disponible | -10 puntos |
| HarmBench, respuestas dañinas | no disponible | no disponible | -2,5 puntos, no significativo |
| MMLU / MILU Hindi / MedMCQA (80 cada uno) | no disponible | no disponible | +1,3 / 0 / -1,3 puntos, ninguno significativo |
| Verificación independiente (600 prompts) | 33,5 % | 14,0 % | MedMCQA (4.183) y MMLU (2.000) sin cambios |
| Seguridad multilingüe, MultiJail (450 retenidos) | 16,2 % | 11,6 % | rechazado por el grader; comprobación corregida después |

La edición aceptada de rechazo excesivo afectó a 398.328 entradas (0,012 % de los pesos) en 195 columnas de salida MLP de las capas 20, 22, 23 y 24, en 23 turnos y unos 58 minutos de GPU, con 5,9 M tokens de entrada (5,4 M en caché) y 109 k tokens de salida. La edición multilingüe afectó a 53.183 entradas (0,0016 %) en 26 columnas MLP de las capas 23 a 26. En *reward hacking* el agente encontró una edición de una sola columna que no se transfirió a prompts no vistos; en matemáticas no encontró ninguna edición que arreglara más respuestas de las que rompía y no envió nada.

## Requisitos de hardware

- El *harness* se ejecuta en Modal sobre una única GPU; el modelo base es `CohereLabs/tiny-aya-global`, por lo que la inferencia es ligera.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño y cuantización del modelo base.
- GPU recomendadas: no disponibles; el informe solo indica una GPU en Modal sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles (el *harness* usa PyTorch y Transformers en sandbox; no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; se reportan 58 minutos de GPU para 23 turnos en la ejecución de rechazo excesivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeightPatch (este repositorio) | No disponible (informe) | No disponible | Edición de pesos por agente con *grader* independiente | MIT | Hugging Face y GitHub |
| `CohereLabs/tiny-aya-global` | No disponible | No disponible | Modelo base liberado, objeto de las ediciones | No disponible | Hugging Face |
| Fine-tuning clásico (LoRA/QLoRA) | No aplica | No aplica | Adaptadores entrenados sobre el modelo base | No disponible | No disponible |
| Edición de pesos manual (p. ej. *steering* / *activation patching*) | No aplica | No aplica | Intervención sobre activaciones o pesos sin agente | No disponible | No disponible |

No se dispone de datos de rendimiento comparables de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un informe en borrador (16 de noviembre de 2026) de un hackathon, no un modelo listo para producción.
- El propio autor reconoce que un *grader* perteneciente al sistema que hizo la edición no constituye evidencia independiente; de ahí el script de verificación externo.
- La ejecución de seguridad multilingüe fue rechazada por el *grader* y la comprobación se corrigió después: el autor lo declara explícitamente como un *grader* relajado tras rechazar un resultado.
- Las ediciones deben limitarse a un máximo del 0,1 % de las entradas; superar ese umbral invalida el resultado por integridad.
- Riesgo de *reward hacking*: se documenta una edición de una sola columna que mejoraba en el conjunto de desarrollo pero no se transfirió a prompts no vistos.
- En matemáticas no se encontró ninguna edición aceptable; el enfoque no garantiza mejoras en todas las capacidades.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Riesgo de alucinación: no disponible.
- Idiomas: solo se evalúan inglés, hindi y nueve idiomas vía MultiJail; cobertura limitada.
- Licencia MIT para el artefacto; las restricciones del modelo base `CohereLabs/tiny-aya-global` no se detallan y deben consultarse por separado antes de uso comercial.
- El *harness* depende de herramientas propietarias de Lexsi Labs (SafeTune, CircuitKIT, AuditKIT) y de Modal, lo que condiciona la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/Perfect7613/weightpatch-report
- Código: https://github.com/perfect7613/weightpatch
- Colección de modelos: https://huggingface.co/collections/Perfect7613/weightpatch-models-6af7fed7120d5e7caeb6875e
- Colección de ejecuciones, trazas y líneas base: https://huggingface.co/collections/Perfect7613/weightpatch-datasets-and-traces-6af7fed795c64cce97b28a54
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
