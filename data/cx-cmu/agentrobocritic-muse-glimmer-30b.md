# cx-cmu/AgentRoboCritic-Muse-Glimmer-30B

## Resumen

AgentRoboCritic-Muse-Glimmer-30B es un modelo multimodal de tipo image-text-to-text especializado en evaluar acciones de robots. Lo desarrolla el equipo cx-cmu y se obtiene mediante un ajuste fino con LoRA (rango 32) sobre el modelo base meta-models/Muse-Glimmer-30B, que cuenta con 29.776.626.688 parámetros. El modelo recibe la descripción de la tarea, la intención declarada por el agente y el comando ejecutado, junto con observaciones visuales ordenadas de las cámaras alrededor de la acción, y devuelve un juicio estructurado en JSON sobre si la acción logró su intención local.

El problema que resuelve es la verificación automática de la ejecución de acciones robóticas: en lugar de evaluar el éxito global de una tarea, el modelo juzga si una acción concreta cumplió su intención declarada y, en caso de fallo, clasifica el mecanismo de fallo (por ejemplo, fallos de agarre, con subcategoría específica) y aporta una explicación breve fundamentada en las observaciones visuales. Esto resulta relevante para pipelines de robótica que necesitan señales de evaluación densas y estructuradas sin intervención humana.

La relevancia actual del modelo radica en que aproxima el rendimiento de un evaluador de referencia (GPT-6 Astra) en un conjunto de test etiquetado por humanos, con 67,75 % de precisión global frente al 71,25 % del evaluador de referencia, y supera ampliamente al modelo base sin ajustar (34,75 %). La licencia es Apache 2.0, sujeta a la política de uso del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (modelo base Muse-Glimmer-30B; detalles internos no disponibles) |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, sujeta a la Muse Glimmer Usage Policy del modelo base |
| Formato de pesos | safetensors (repo de 59,6 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre meta-models/Muse-Glimmer-30B, un modelo multimodal de tipo image-text-to-text con unos 29,8 mil millones de parámetros. No se dispone de información sobre la arquitectura interna del modelo base (tipo de atención, composición de capas, mecanismos de fusión visión-lenguaje) ni sobre su longitud de contexto. El ajuste realizado es un LoRA de rango 32 con supervisión, fusionado posteriormente en los pesos base, de modo que el checkpoint distribuido contiene los pesos completos modificados.

El entrenamiento utilizó 12.844 acciones procedentes de 12 benchmarks de manipulación robótica, etiquetadas por GPT-6 Astra. Se realizaron 2 épocas con tamaño de lote 32, tasa de aprendizaje 5×10⁻⁵ y programación coseno. La innovación principal no reside en la arquitectura sino en el formato de tarea: el modelo consume una secuencia ordenada de observaciones visuales con sus vistas de cámara y marcas temporales, y produce una salida JSON estructurada con cuatro campos (`intent_success`, `failure_mechanism`, `m1_subcategory`, `failure_reason`). El prompt de sistema que define las categorías y los juicios disponibles se distribuye como archivo `action_system.txt` en el repositorio.

## Capacidades

- Evaluación de éxito de intención local de acciones robóticas a partir de observaciones visuales multimodales.
- Clasificación de mecanismos de fallo cuando la acción no alcanza su intención, con subcategoría específica para fallos de agarre (M1).
- Generación de explicaciones breves de fallo fundamentadas en la evidencia visual observada.
- Salida estructurada en JSON con cuatro campos, adecuada para consumo programático.
- Razonamiento multimodal sobre secuencias ordenadas de imágenes con información de cámara y temporización.
- Manejo de evidencia inconclusa mediante categorías definidas en el prompt de sistema.
- Capacidad conversacional heredada del modelo base (tag `conversational`), aunque no se documentan detalles.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modos de pensamiento explícitos.

## Casos de uso

- Verificación automática en pipelines de manipulación robótica: el modelo evalúa cada acción ejecutada contra su intención declarada y devuelve un JSON que puede registrarse o accionar reintentos, sustituyendo la inspección manual de episodios.
- Etiquetado y auditoría de datos de robótica: dado un conjunto de episodios con observaciones de cámara, el modelo genera etiquetas de éxito y categorías de fallo que pueden usarse para filtrar o anotar datasets de entrenamiento.
- Análisis de fallos en producción: la clasificación de mecanismo de fallo y la subcategoría de agarre permiten agregar estadísticas de modos de fallo por tarea o por robot, orientando mejoras de control.
- Evaluación de políticas de control sin evaluador humano: el modelo puede actuar como crítico en bucles de evaluación automática de agentes robóticos, con temperatura 0 y hasta 1.024 tokens de salida para obtener juicios deterministas.
- Supervisión en tiempo casi real de ejecuciones: al consumir observaciones visuales con marcas temporales, puede integrarse en un servicio que valide acciones tras su ejecución y dispare alertas cuando la intención no se cumple.
- Investigación en evaluación de agentes: sirve como referencia reproducible (licencia Apache 2.0) para comparar críticos automáticos frente a evaluadores propietarios en experimentos de control robótico directo.
- Depuración de instrucciones y comandos: al comparar la intención declarada con la evidencia visual, el modelo ayuda a detectar desajustes entre el comando emitido por el agente y el efecto real observado.

## Benchmarks y rendimiento

Evaluación sobre 400 acciones de test etiquetadas por humanos (264 fallidas), procedentes de episodios excluidos del entrenamiento:

| Critico | Precision de resultado (%) | Precision de modo de fallo (%) | Precision global (%) |
|---|---:|---:|---:|
| GPT-6 Astra | 79,25 | 80,68 | 71,25 |
| Muse-Glimmer-30B (zero-shot) | 52,50 | 32,58 | 34,75 |
| AgentRoboCritic-Muse-Glimmer-30B | 76,25 | 74,24 | 67,75 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 29,8 mil millones de parámetros en bfloat16 se requieren aproximadamente 60 GB de memoria solo para pesos, más memoria para activaciones y observaciones visuales; el repo ocupa 59,6 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`; una RTX 4090 de 24 GB no es suficiente en bfloat16 sin cuantización.
- En GPU de consumo: no cabe en bfloat16 en tarjetas de 24 GB; no se documentan cuantizaciones (GGUF, AWQ, GPTQ) para reducir requisitos.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (método documentado); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación usó temperatura 0 y un máximo de 1.024 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision global en el test del autor (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentRoboCritic-Muse-Glimmer-30B | 29,8 B | no disponible | 67,75 | Apache 2.0 (con política de uso del base) | Hugging Face |
| Muse-Glimmer-30B (zero-shot) | 29,8 B | no disponible | 34,75 | no disponible en la informacion | Modelo base referenciado |
| GPT-6 Astra | no disponible | no disponible | 71,25 | propietaria | servicio cerrado |

No se dispone de información sobre otros críticos robóticos comparables de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en evaluación de acciones robóticas; su uso fuera de ese dominio no está validado y el rendimiento podría degradarse.
- Riesgo de alucinación en las explicaciones de fallo: `failure_reason` se genera en lenguaje natural y puede no reflejar con exactitud la evidencia visual, aunque el entrenamiento busca fundamentarla en las observaciones.
- La precisión global (67,75 %) queda por debajo del evaluador de referencia GPT-6 Astra (71,25 %), con una brecha mayor en la clasificación de modo de fallo (74,24 % frente a 80,68 %).
- Los datos de entrenamiento fueron etiquetados por GPT-6 Astra, por lo que el modelo puede heredar sesgos o errores sistemáticos de ese etiquetador.
- No se documentan idiomas soportados ni longitud de contexto; el uso multilingüe no está garantizado.
- La licencia Apache 2.0 está sujeta a la Muse Glimmer Usage Policy del modelo base; es necesario revisar dicha política antes de un uso comercial.
- No se publican cuantizaciones, por lo que el despliegue requiere hardware de gama alta (aproximadamente 60 GB en bfloat16).
- El modelo requiere el prompt de sistema `action_system.txt` para interpretar correctamente las categorías de fallo y los juicios disponibles; omitirlo puede producir salidas inconsistentes.
- No se documentan resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni evaluaciones fuera del conjunto de test propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cx-cmu/AgentRoboCritic-Muse-Glimmer-30B
- Página del proyecto: https://adu2021.github.io/blog/AgentRoboCritic/
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Política de uso del modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/USAGE_POLICY.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Prompt de sistema (en el repositorio): action_system.txt
