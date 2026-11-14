# RomilCyber/phantom-dfir-writeup

## Resumen

PHANTOM DFIR no es un modelo de lenguaje, sino un repositorio de tipo write-up publicado por RomilCyber para el hackathon Lexsi AI Safety and Alignment. Contiene unicamente el articulo descriptivo de un sistema multiagente de forense digital (DFIR) al que se le anadio una capa de seguridad: un arnes de red-teaming que ataca al propio verificador del sistema, mide el dano, lo repara y despues entrena un modelo pequeno de pesos abiertos para replicar la tarea de verificacion.

El modelo entrenado en el proyecto es Cohere Labs `tiny-aya-global`, afinado con QLoRA sobre 1.100 filas sinteticas para actuar como verificador de evidencias forenses. El adaptador y los logs se alojan en un repositorio separado (`RomilCyber/tiny-aya-global-phantom-verifier-qlora`), y el dataset en `RomilCyber/phantom-dfir-evidence-grounding`. Este repositorio concreto solo contiene el texto del articulo, con licencia MIT e idioma ingles.

Su relevancia es metodologica: documenta un ciclo completo de evaluacion de seguridad (ataque, medicion, reparacion y destilacion en un modelo pequeno) sobre un caso de uso de alto riesgo, donde un falso "CLEARED" permite que un atacante permanezca en el sistema. No debe confundirse con un checkpoint desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo el write-up; el adaptador se basa en `tiny-aya-global` de Cohere Labs, arquitectura no detallada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA de 4 bits durante el entrenamiento (segun la model card); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible en este repositorio (el adaptador se distribuye en el repositorio enlazado) |

## Arquitectura y entrenamiento

El sistema PHANTOM DFIR es un pipeline multiagente: un router clasifica la entrada (imagen de memoria, imagen de disco o captura de red) y la deriva al pipeline correspondiente. Para memoria, cuatro agentes operan en bucle: Collector (ejecuta Volatility), Investigator (propone hallazgos), Evidence agent (reverifica cada hallazgo) y Skeptic (impugna hallazgos antes de calificarlos como criticos). Las imagenes de disco y capturas de red pasan por un correlador con un controlador de huecos que comprueba que falta.

El componente de aprendizaje es un QLoRA sobre `tiny-aya-global` con 1.100 filas, 138 pasos y 28 minutos de entrenamiento en una GPU de portatil de 8 GB. El pipeline de herramientas incluye CuratorKIT (curacion de filas), AlignTune (entrenamiento) y AuditKIT (puntuacion independiente). El dataset de entrenamiento y evaluacion es sintetico, generado a partir de 11 plantillas; el conjunto de retencion tiene 550 filas (10 familias de ataque mas un control limpio).

## Capacidades

- Verificacion de evidencias forenses: clasifica hallazgos como criticos o descartados a partir de artefactos y evidencia conductual.
- Emision de veredictos en JSON estructurado (el modelo base producia 155 respuestas no validas como JSON; el afinado, 0).
- Resistencia a ataques adversariales de evidencia: tasa de exito de ataque del 0,002 en el conjunto de retencion tras el afinado.
- Razonamiento sobre artefactos de Volatility (`malfind`, `dlllist`, `cmdline`) y correlacion de fuentes.
- No se documentan capacidades de tool calling, agentes generales, vision, audio ni modo thinking para el modelo afinado.

## Casos de uso

- Verificacion de hallazgos en respuesta a incidentes: el verificador afinado revisa cada hallazgo propuesto por el Investigator antes de que se califique como critico, reduciendo falsos positivos que consumen una noche de guardia.
- Triaje de imagenes de memoria: integrado en el bucle de agentes sobre Volatility, filtra hallazgos que no cuentan con evidencia conductual suficiente.
- Validacion de decisiones de "CLEARED": evita que un atacante permanezca en el sistema por un descarte erroneo, con una tasa de falsa confirmacion del 0,008 en el conjunto de retencion.
- Evaluacion de seguridad de pipelines de IA: el arnes de red-teaming (10 familias de ataque, 550 filas) sirve como plantilla para auditar verificadores propios antes de produccion.
- Destilacion en hardware modesto: el flujo QLoRA en 8 GB demuestra que un equipo con GPU de consumo puede entrenar un verificador especializado en menos de media hora.
- Formacion y auditoria metodologica: el write-up documenta cuatro defectos encontrados en el propio stack de herramientas (filtro de duplicados de CuratorKIT, descarte silencioso del 4-bit en AlignTune, casts a float32, scorer de AuditKIT), util como referencia para quien encadene esas herramientas.

## Benchmarks y rendimiento

Resultados sobre 550 filas de retencion, segun la model card:

| Metrica (550 filas) | Skeptic del motor | Verificador grounded | Base `tiny-aya-global` | Afinado |
|---|---|---|---|---|
| Accuracy | 0,273 | 0,727 | 0,524 | 0,998 |
| Tasa de exito de ataque | 0,800 | 0,300 | 0,462 | 0,002 |
| Tasa de falsa confirmacion | 0,839 | 0,562 | 0,760 | 0,008 |
| Respuestas no validas como JSON | no disponible | no disponible | 155 | 0 |

Prueba de McNemar pareada entre Skeptic y verificador grounded: 250 filas corregidas y 0 rotas. AuditKIT coincide con el scorer propio: 0,531 antes y 0,998 despues.

## Requisitos de hardware

- Entrenamiento: QLoRA de 4 bits en una GPU de portatil de 8 GB (1.100 filas, 138 pasos, 28 minutos).
- Inferencia: no se publican requisitos de VRAM; al tratarse de un adaptador sobre `tiny-aya-global`, se situa en el rango de modelos pequenos, pero no hay datos concretos en la informacion disponible.
- GPU recomendadas: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adaptador `tiny-aya-global-phantom-verifier-qlora` | no disponible | no disponible | Verificador forense especializado | no disponible | Hugging Face (adaptador) |
| `tiny-aya-global` (base) | no disponible | no disponible | Modelo general pequeno | no disponible | Hugging Face |
| Skeptic del motor PHANTOM DFIR (basado en reglas y voto de modelo) | no aplica | no aplica | Verificacion de evidencias | MIT (repositorio) | GitHub |

No se dispone de datos de otros verificadores forenses comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el articulo; no incluye pesos ni codigo ejecutable.
- Tres familias de ataque siguen venciendo al verificador basado en reglas: `behavioural_mention`, `identity_alias` y `network_contact_inflation`.
- Los datos son sinteticos: entrenamiento y retencion provienen de las mismas 11 plantillas, por lo que el 0,998 refleja el manejo de esas 11 formas de fila y no se ha probado nada fuera de ellas.
- El resultado del modelo corresponde a una unica ejecucion de entrenamiento con una sola semilla.
- En 110 de 550 respuestas el adaptador escribe el veredicto correcto y sigue generando; el scorer solo lee el primer objeto JSON, lo que puede enmascarar problemas de parada.
- Riesgo de alucinacion no cuantificado fuera del conjunto sintetico; en dominio forense real un falso "CLEARED" tiene consecuencias de seguridad graves.
- Idioma limitado al ingles.
- Licencia MIT en el repositorio del write-up; la licencia del adaptador y del dataset no se detalla en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RomilCyber/phantom-dfir-writeup
- Codigo: https://github.com/romilp619/Phantom-DFIR
- Adaptador y logs: https://huggingface.co/RomilCyber/tiny-aya-global-phantom-verifier-qlora
- Dataset: https://huggingface.co/datasets/RomilCyber/phantom-dfir-evidence-grounding
- Write-up completo: `docs/MODEL-RESULT.md` en el repositorio de GitHub
