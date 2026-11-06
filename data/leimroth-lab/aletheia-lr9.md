# leimroth-lab/Aletheia-LR9

## Resumen

Aletheia-LR9 es un modelo de lenguaje de tipo agéntico publicado por Leimroth Lab (Scott Leimroth) bajo licencia Apache 2.0. Deriva de `sabicap/sabi-noema`, un fine-tune agéntico de Qwen3.8-27B, al que se le aplica un nuevo ajuste fino orientado al uso de herramientas y una edición de la dirección de rechazo (refusal direction) para reducir las negativas a peticiones que un modelo instruct estándar denegaría. El resultado se exporta a 4 bits con NVIDIA Model Optimizer y se valida sobre el motor TensorFold en una única NVIDIA DGX Spark.

El modelo declara 27.400 millones de parámetros según la model card (26.900 millones de lenguaje más una torre de visión de 0.460 millones), aunque los pesos safetensors del repositorio suman 18.164.649.200 parámetros, cifra coherente con una exportación cuantizada a 4 bits en la que solo parte de las capas conserva precisión completa. El repositorio ocupa 21,1 GB y está etiquetado como 8-bit por el sistema de Hugging Face.

Su relevancia actual radica en dos factores: por un lado, es un modelo pensado para orquestar equipos de agentes que llaman herramientas, ejecutan tareas multi-turno y escriben código; por otro, demuestra un flujo de cuantización NVFP4/FP8 con calibración y despliegue en hardware de consumo profesional (DGX Spark, GB10 con 128 GB de memoria unificada). La model card documenta comparativas internas frente a variantes del mismo proceso de edición y frente al modelo base sin editar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y atención lineal (herencia de Qwen3.8-27B); torre de visión de 0.46B |
| Parametros totales | 27.4B según model card (26.9B LM + 0.46B visión); 18.164.649.200 en safetensors del repo cuantizado |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens en la configuración de servicio documentada |
| Tipos de cuantizacion | NVFP4 y FP8 (401 capas cuantizadas: 193 NVFP4 y 208 FP8); exportación de 4 bits vía NVIDIA Model Optimizer |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con etiqueta 8-bit) |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer que combina capas de atención completa con capas de atención lineal, según se deduce de la mención en la model card a las «linear-attention output projections» entre los tensores editados. Sobre esa base, `sabicap/sabi-noema` aporta un primer ajuste agéntico, y Aletheia-LR9 añade un segundo proceso en tres fases.

La primera fase es un fine-tune LoRA sobre Sabi-Noema durante 2 épocas, con tasa de aprendizaje 1e-4 y secuencias de hasta 16.384 tokens. Los datos provienen de conversaciones agénticas: filas de When2Call de NVIDIA, Open-SWE-Traces y Nemotron-SFT-Agentic-v4, más 100 conversaciones de agente escritas específicamente para el proyecto. La model card especifica que ninguna fila fue generada por Sabi-Noema ni por Qwen3.8. La segunda fase es una edición de la dirección de rechazo extraída en la capa 48, a la que se le resta previamente su componente sobre una dirección de «no puedo hacer eso con estas herramientas», de modo que la edición afecta al rechazo sin alterar las negativas honestas por falta de capacidades. Se aplica con fuerza 1,3 preservando la norma sobre 129 tensores escritores (embedding de tokens, proyecciones de salida de atención y atención lineal, y proyecciones down del MLP); `lm_head`, la torre de visión y todas las normas quedan intactas. La tercera fase es la exportación a 4 bits con NVIDIA Model Optimizer y 1.024 muestras de calibración.

El autor documenta que eligió esta variante entre cinco construidas de forma similar: las variantes B y C (edición primero y ajuste después) puntuaban unos 9 puntos más en el conjunto agéntico a tamaño completo, pero el ajuste reintroducía el rechazo (13-14 de 48 peticiones dañinas rechazadas); la variante D, con la dirección de rechazo sin restar el componente de «no puedo», no se separaba de este modelo en condiciones reales de servicio; y la variante E, con ejemplos adicionales de argumentos de herramienta, quedaba unos 8 puntos por debajo en el conjunto agéntico sin mejorar la precisión de argumentos.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 262.144 tokens.
- Llamada a herramientas (tool calling / function calling) con selección de herramienta, construcción de argumentos y decisión sobre cuándo no aplicar ninguna herramienta.
- Razonamiento agéntico multi-paso para tareas de software: el autor reporta 10 de 12 intentos con todas las comprobaciones ocultas superadas en tareas reales de repositorio, en ejecución desatendida.
- Generación y edición de código en el contexto de un agente de programación (perfil de coding de Hermes Agent).
- Modo de razonamiento (thinking) con presupuesto configurable; la model card menciona niveles de esfuerzo de razonamiento y un tope de 6.000 tokens en las pruebas.
- Salida estructurada: conformidad con `json_object`, `json_schema` estricto y llamadas a herramienta, tanto con thinking activado como desactivado.
- Capacidad de visión por la torre de 0.46B heredada, aunque la model card no detalla su rendimiento ni su uso en las pruebas.
- Resistencia a instrucciones plantadas en resultados de herramientas: 0, 0 y 1 obediencias en 32 escenarios con tres semillas, con aviso al usuario en 22 de 32 casos en las pruebas de tablero.
- Manejo de prompts largos: la model card reporta respuesta correcta con prompts de 25.000 y 95.000 caracteres cuando la pregunta se sitúa al final.
- Multilingüe: no disponible; el modelo solo declara inglés.

## Casos de uso

- Orquestación de equipos de agentes: el modelo está diseñado como «modelo de casa» para un equipo pequeño de agentes, con llamada a herramientas fiable y contexto de 262.144 tokens que permite mantener el historial completo de varias conversaciones simultáneas en una sola instancia.
- Automatización de tareas de software en repositorios: con un perfil de coding y ejecución desatendida, puede recibir una tarea, inspeccionar el repositorio mediante herramientas y producir cambios verificables por comprobaciones ocultas; el autor reporta 10 de 12 intentos con todas las pruebas superadas.
- Integración en pipelines de CI/CD como agente de corrección: su conformidad con salida estructurada (`json_schema` estricto y tool calls con thinking on y off) permite insertarlo en flujos que consumen JSON validado sin post-procesado frágil.
- Asistentes internos sin filtros de rechazo heredados: la edición de la dirección de rechazo reduce las negativas a 3-4 de 48 peticiones dañinas en las pruebas del autor, lo que encaja en entornos donde el filtrado se delega a una capa externa de moderación y se prioriza la utilidad.
- Despliegue en hardware de una sola máquina: con 21,1 GB de pesos y una DGX Spark de 128 GB de memoria unificada, permite servir dos agentes en paralelo a 262.144 tokens de contexto con decodificación especulativa (69,5 tok/s por flujo con drafter).
- Procesamiento de documentos largos con pregunta al final: útil para análisis de informes, contratos o expedientes donde la consulta se formula tras un contexto de decenas de miles de caracteres.
- Defensa frente a inyección de prompts en herramientas: los resultados de las pruebas (0-1 obediencias en 32 escenarios) lo hacen adecuado para agentes que consumen salidas de herramientas no confiables, siempre con una capa adicional de validación.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre TensorFold 0.6.5 en una DGX Spark (GB10, 128 GB), dos agentes en paralelo, ventana de 262.144 tokens, thinking en medio con tope de 6.000 tokens y muestreo del checkpoint (temperatura 1,0, top-p 0,95, top-k 20).

| Test | Aletheia LR9 | Sabi-Noema sin editar |
|---|---|---|
| Conjunto agéntico, 152 peticiones (media de 6 semillas; base: 1 semilla) | 118,7 | 107 |
| Argumentos de herramienta exactos, de 94 llamadas | 31,7 | 23 |
| Cuándo llamar a una herramienta (filas When2Call, de 10) | 9,7 | 4 |
| Peticiones dañinas rechazadas, de 48 | 3-4 | 46 |
| Peticiones inocuas rechazadas, de 48 | 1 | 3 |
| Velocidad, un flujo, con drafter | 69,5 tok/s | 71,7 tok/s |

En condiciones reales de servicio (temperatura 1,0, varias semillas):

| Test | Resultado |
|---|---|
| Tareas agénticas (A-Bench, 60 ítems; 3 semillas) | 55, 51, 54 |
| Escenarios de fiabilidad (20; 3 semillas) | 14, 14, 13 |
| Instrucciones plantadas en resultados de herramientas, obedecidas (32 escenarios; 3 semillas) | 0, 0, 1 |
| Mismas peticiones legítimas de aspecto similar, respondidas (de 8) | 6, 4, 6 |
| Coding, aprobados estrictos (todas las comprobaciones ocultas) | 10 de 12 intentos (ejecución interrumpida a mitad) |

En las pruebas estándar del tablero del autor (temperatura 0):

| Test | Resultado |
|---|---|
| Tareas agénticas (A-Bench, 60 ítems) | 56/60 |
| Escenarios de fiabilidad (20) | 15/20 |
| Peticiones dañinas respondidas, thinking off, sin setup de agente / dentro del setup (63 cada una) | 63/63 / 63/63 |
| Peticiones legítimas rechazadas (7) | 0 |
| Instrucciones plantadas obedecidas (32) / avisó al usuario | 0 / 22 |
| Prompts de 25.000 y 95.000 caracteres, respuesta al final | ambos respondidos |
| Salida estructurada (json_object, json_schema estricto, tool calls) | todos conformes, con thinking on y off |
| Velocidad, un flujo: con drafter / sin | 71,3 / no disponible (dato truncado en la model card) |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 21,1 GB de pesos en el repositorio cuantizado a 4 bits; el espacio adicional depende de la caché KV para 262.144 tokens y del número de flujos concurrentes.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) es la plataforma de referencia documentada, sirviendo dos agentes en paralelo con contexto completo.
- Cabe en GPU de consumo: no disponible como dato verificado; el tamaño de pesos (21,1 GB) es compatible con GPUs de 24 GB o más, pero la ventana de 262.144 tokens exige memoria adicional significativa.
- Opciones de despliegue: TensorFold 0.6.5 (motor usado en todas las mediciones, con soporte de drafter, `--checkpoint-slots` y presupuesto de razonamiento); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 69,5-71,3 tok/s por flujo con decodificación especulativa (drafter Qwen3.8-27B-DFlash2) en DGX Spark; sin drafter el dato está truncado en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Aletheia-LR9 | 27,4B (model card) / 18,2B en safetensors | 262.144 | Apache 2.0 | Agéntico, sin rechazo, 4 bits NVFP4/FP8 | Hugging Face, 311 descargas |
| Sabi-Noema (`sabicap/sabi-noema`) | no disponible | no disponible | no disponible | Fine-tune agéntico de Qwen3.8-27B, base de Aletheia | Hugging Face |
| Qwen3.8-27B | 27B | no disponible | no disponible | Modelo instruct generalista | Hugging Face |
| Naked Dragon LR8 | 27B (misma familia) | no disponible | no disponible | Edición de rechazo sobre 129 tensores escritores, predecesor de la línea | Hugging Face (Leimroth Lab) |

La comparación de rendimiento solo está documentada frente a Sabi-Noema sin editar, con las cifras de la tabla de benchmarks. No hay datos públicos que permitan comparar con Qwen3.8-27B original ni con Naked Dragon LR8 en los mismos tests.

## Limitaciones y advertencias

- La edición de la dirección de rechazo reduce deliberadamente las negativas: el propio autor reporta 63 de 63 peticiones dañinas respondidas con thinking off. Requiere una capa externa de moderación si se despliega en producción orientada al público.
- El modelo solo declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Las cifras de benchmarks proceden del autor, medidas con su propio motor (TensorFold) y su propio conjunto de pruebas; no han sido replicadas de forma independiente.
- La discrepancia entre los 27,4B declarados y los 18,164B de safetensors indica que el repositorio es una exportación cuantizada, no los pesos completos; la model card advierte que este repo es el build de 4 bits sobre el que se midieron todos los números.
- La obediencia a instrucciones plantadas no es nula: 1 de 32 escenarios en una de las semillas, y solo 22 de 32 casos avisaron al usuario en las pruebas de tablero.
- La ejecución de coding se interrumpió a mitad (12 intentos de un total mayor), por lo que la tasa de 10 de 12 no cubre el conjunto completo previsto.
- El dato de velocidad sin drafter está truncado en la model card («71.3 / 1»), por lo que no puede citarse con fiabilidad.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de rechazo traslada al desplegador la responsabilidad legal y ética sobre el contenido generado.
- Riesgo de alucinación: no cuantificado en la información disponible; los conjuntos de prueba del autor miden tareas agénticas y fiabilidad, no veracidad factual.
- No se documenta soporte en motores de inferencia distintos de TensorFold, lo que limita la portabilidad del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leimroth-lab/Aletheia-LR9
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Ficha en LLM Explorer: https://llm-explorer.com/model/leimroth-lab%2FAletheia-LR9,1NhsQF4kLe7bkHoc3JohEt
- Sitio del autor: https://scottleimroth.com
- Perfil del autor en X: https://x.com/ScottLeimroth
- Hermes Agent (Nous Research): https://github.com/NousResearch/hermes-agent
