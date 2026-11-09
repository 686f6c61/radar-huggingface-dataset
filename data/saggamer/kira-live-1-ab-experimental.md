# saggamer/KIRA-LIVE-1-AB-Experimental

## Resumen
KIRA Live 1 A+B Experimental es un checkpoint de investigación publicado por el desarrollador independiente saggamer, derivado por fine-tuning del modelo base Qwen/Qwen3.5-0.8B. Su propósito es explorar la combinación de asistencia conversacional y planificación agéntica dentro de un único "Thinker" compacto, pensado para ejecución local en Apple Silicon mediante MLX. El modelo forma parte del ecosistema Kira Superapp, una aplicación de escritorio que aporta las herramientas, el bucle de ejecución, la memoria y la gestión de permisos alrededor de modelos compatibles.

El checkpoint combina dos candidatos previos, A (planificación agéntica) y B (conversación), e incorpora una pasada de preferencias conversacionales de nueve actualizaciones. Cuenta con 1.122.734.038 parámetros reales según los tensores safetensors (un export de 764 tensores), un repositorio de 2,5 GB y licencia Apache-2.0. El autor declara explícitamente que este candidato no superó la puerta de promoción y no es el modelo de uso diario de Kira Superapp.

La relevancia de esta ficha es doble: por un lado, documenta un experimento reproducible sobre modelos pequeños orientados a agentes locales; por otro, su model card publica resultados de evaluación honestos y limitados que muestran que la actualización conversacional no mejoró las métricas agénticas. Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); runtime MLX personalizado, no compatible con Transformers ni MLX-LM estándar |
| Parametros totales | 1.122.734.038 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el runtime MLX puede aplicar cuantización, pero no se documenta) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (export de 764 tensores) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura transformer de Qwen3.5-0.8B, con un total de 1.122.734.038 parámetros. El checkpoint publicado es el export completo del "Thinker" con el delta de preferencias conversacionales ya aplicado, verificado contra los valores tensoriales entrenados. Según la model card, no se realizó entrenamiento adicional para la publicación: el release consiste en la combinación de los candidatos A y B más la pasada de preferencias de nueve actualizaciones.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona "preferencias conversacionales" y "retención de contrato agéntico" como ejes de evaluación, lo que sugiere un ajuste orientado a preferencias, pero sin detallar el método. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El runtime es un ejecutable MLX propio (`run_experimental.py`) que depende de activos donantes de Qwen3.5-0.8B fijados y no ofrece endpoint de inferencia alojado.

## Capacidades
- Generación de texto conversacional en inglés, con modo de planificación explícito para proponer acciones.
- Planificación agéntica en borrador: genera planes de texto para acciones web y otras tareas, incluyendo campos de permisos seleccionados.
- Retención de conversación multi-turno (evaluada, con resultados limitados).
- Propuesta de llamadas a herramientas en formato de plan (el runner incluido solo imprime los planes; no ejecuta herramientas).
- Integración con el ecosistema Kira Superapp (chat, investigación en navegador, coding, apps conectadas, herramientas MCP, voz y artefactos).
- Soporte de modo "árbol" (`--tree`) para imprimir un plan propuesto sin ejecución.
- Capacidades multilingües: solo inglés declarado.
- No incluye los pesos de voz Listener y Talker, que son independientes.

## Casos de uso
- Investigación sobre planificación agéntica en modelos pequeños: el checkpoint permite estudiar cómo un modelo de ~1,1B parámetros propone planes y permisos, comparando el padre A+B con el candidato actualizado en las mismas familias de tareas.
- Evaluación de preferencias conversacionales: sirve para reproducir las pruebas de conversación fresca, retención multi-turno y retención de contrato agéntico documentadas en la model card, y para analizar regresiones como respuestas repetidas o fallos en memorias corregidas.
- Desarrollo y depuración del runtime MLX de Kira Superapp: al ser un ejecutable propio con `--verify` y `--tree`, es útil para validar la cadena de carga de activos donantes, checksums e integridad de tensores.
- Prototipado de asistentes locales en Apple Silicon: permite probar flujos de chat y propuestas de acción en un Mac sin depender de servicios en la nube, aceptando que los planes deben revisarse manualmente.
- Análisis de fallos agénticos: los puntos débiles declarados (anclas de flujo inventadas, solicitudes de permisos innecesarias, argumentos de búsqueda alterados) lo convierten en un banco de pruebas para diseñar salvaguardas y validadores de permisos.
- Docencia y divulgación sobre límites de los modelos pequeños: sus tablas de evaluación honestas y su estado "rechazado para promoción" son material útil para explicar por qué un checkpoint experimental no debe sustituir a un modelo de producción.

## Benchmarks y rendimiento

| Prueba de texto | A+B padre | Candidato publicado |
|---|---:|---:|
| Casos de conversación fresca | 3/8 | 3/8 |
| Retención de conversación multi-turno | 5/12 | 5/12 |
| Retención de contrato agéntico | 6/12 | 6/12 |

La evaluación es pequeña y usa familias de tareas relacionadas. No se realizaron pruebas de audio en vivo, ejecución real de herramientas, evaluación de calidad humana (human-EQ) ni comparación con Gemini. El autor señala regresiones conversacionales pese a la igualdad de recuentos agregados, incluidas respuestas repetidas y fallos en memorias corregidas y restricciones de relato.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; con 1,12B parámetros en safetensors, el repositorio ocupa 2,5 GB, por lo que la inferencia en precisión completa requiere del orden de 2,5-3 GB de memoria, y menos con cuantización (no documentada).
- GPU recomendadas: el runtime es específico de Apple Silicon (MLX); no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, en Macs con Apple Silicon; el autor no detalla modelos concretos ni memoria unificada mínima.
- Opciones de despliegue: runtime MLX propio de Kira Superapp (`run_experimental.py`, con `--verify`, `--prompt`, `--tree` y `--donor`). No es compatible con Transformers ni MLX-LM estándar y no ofrece endpoint alojado; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KIRA Live 1 A+B Experimental | 1.122.734.038 | no disponible | Apache-2.0 | Hugging Face, runtime MLX propio | Experimental, rechazado para promoción |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B (según nombre) | no disponible | no disponible en la información | Hugging Face | Modelo donante del fine-tuning |
| KIRA Live 1 (bundle de producción) | no disponible | no disponible | no disponible en la información | Hugging Face | Listener y Talker de uso diario según el autor |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Checkpoint experimental rechazado en la puerta de promoción; no debe sustituir al modelo de producción de Kira Superapp.
- La actualización conversacional no mejoró la retención de contrato agéntico (6/12 en ambos) y mostró regresiones conversacionales: respuestas repetidas, fallos en memorias corregidas y en restricciones de relato.
- Debilidades agénticas declaradas: anclas de flujo inventadas, solicitudes de permisos innecesarias y argumentos de búsqueda alterados; revisar planes y permisos manualmente.
- El runner solo imprime planes; no ejecuta herramientas ni demuestra éxito de tareas de extremo a extremo.
- Evaluación pequeña y con familias de tareas relacionadas; sin audio en vivo, sin ejecución real de herramientas, sin evaluación humana y sin comparación con Gemini.
- Solo inglés declarado; sin datos de sesgos conocidos ni de tasa de alucinación.
- Licencia Apache-2.0 para el código y los pesos derivados del donante, con atribución original; las licencias de dependencias se aplican por separado.
- No es un modelo drop-in de Transformers o MLX-LM; requiere el runtime MLX personalizado y activos donantes fijados.
- No incluye los pesos de voz Listener y Talker.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/saggamer/KIRA-LIVE-1-AB-Experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Bundle de producción KIRA Live 1: https://huggingface.co/saggamer/KIRA-LIVE-1
- Kira Superapp (demo): https://kira-superapp.vercel.app/
- GitHub e instalación: https://github.com/saggamer/KIRA-Superapp
- Código del navegador Diagonal: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
