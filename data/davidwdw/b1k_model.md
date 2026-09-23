# davidwdw/b1k_model

## Resumen

B1K model es un repositorio de HuggingFace publicado por el usuario davidwdw que agrupa checkpoints, recetas de entrenamiento, código de evaluación e informes del espacio de trabajo `training_models`. Los modelos de la tarea task-00 están orientados a la habilidad **turning_on_radio** del benchmark BEHAVIOR-1K, y el repositorio se etiqueta con las categorías robotics, vision-language-action, b1k, jax y supervised-fine-tuning.

El paquete principal, `b1k_sft`, contiene tres checkpoints finales de inferencia (demostraciones humanas, codegen exitoso y una mezcla 50:50), todos ellos en el paso 14999 y acompañados de su normalización y su procedencia. El repositorio incluye además un fine-tune de Pi0.5 sobre codegen exitoso (`pi05_task00_codegen_success_sft`, checkpoint EMA seleccionado del paso 6000), recetas de entrenamiento, planes, auditorías de dataset, una configuración de entrenamiento con balanceo de cola, herramientas de evaluación, informes y scripts de rollouts.

Su relevancia es fundamentalmente de investigación: no se publican solo pesos, sino el pipeline completo de entrenamiento y evaluación de un modelo visión-lenguaje-acción (VLA) sobre una tarea concreta de manipulación doméstica simulada. Esto permite reproducir y auditar experimentos de ajuste supervisado y comparar el efecto de distintas fuentes de datos. No se especifican en la información disponible el número de parámetros, la longitud de contexto, la licencia ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de Pi0.5, según las etiquetas del repositorio y los nombres de paquete; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como checkpoints JAX/Orbax OCDBT, no como GGUF ni safetensors cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax OCDBT (checkpoints personalizados) |
| Tamano del repositorio | 222,8 GB (conjunto completo de paquetes, no un checkpoint individual) |
| Tarea objetivo | turning_on_radio (task-00) del benchmark BEHAVIOR-1K |
| Pipeline declarado en HuggingFace | robotics |
| Descargas / likes | 0 descargas, 0 likes en el momento de la captura de datos |

## Arquitectura y entrenamiento

La información disponible indica que se trata de modelos de tipo vision-language-action y que al menos el paquete `pi05_task00_codegen_success_sft` es un fine-tune de Pi0.5, con un checkpoint EMA seleccionado en el paso 6000, su tokenizador, su normalización y el código fuente de reproducción. El paquete `b1k_sft` contiene tres checkpoints finales de inferencia en el paso 14999, correspondientes a tres regímenes de datos distintos: demostraciones humanas, codegen exitoso y una mezcla 50:50 de ambos. El paquete `pi05_tail_balanced_v2` documenta una configuración de entrenamiento con balanceo de cola y sus scripts operativos.

No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición completa del dataset, ni si se emplearon técnicas adicionales como RLHF o DPO. El repositorio sí incluye un plan de entrenamiento y una auditoría de dataset (`pi05_task00_sft_plan`), así como scripts, configuraciones y recibos de ejecución (`pi05_task00_sft`). El autor advierte explícitamente de que la pérdida de entrenamiento o de validación por sí sola no demuestra éxito en los rollouts, lo que sugiere que la evaluación se realiza mediante ejecución efectiva de la política en el entorno.

## Capacidades

- Generación de acciones robóticas condicionadas por entrada visual y por instrucciones en lenguaje natural, dentro del paradigma visión-lenguaje-acción.
- Ejecución de la habilidad turning_on_radio en el benchmark simulado BEHAVIOR-1K (task-00).
- Ajuste supervisado sobre demostraciones humanas y sobre trayectorias generadas por código considerado exitoso, además de una mezcla 50:50 de ambas fuentes.
- Entrenamiento con balanceo de cola de la distribución de datos (`pi05_tail_balanced_v2`).
- Evaluación de políticas mediante rollouts, con herramientas y análisis incluidos en el paquete `evaluation` y scripts en `rollouts`.
- Reproducción de experimentos: los paquetes incluyen normalización, tokenizador, procedencia, sumas de verificación y código de inferencia.

No hay información disponible sobre soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, capacidades multilingües, modo de razonamiento explícito, visión general fuera del bucle de control robótico, audio u otras modalidades.

## Casos de uso

- Investigación en manipulación doméstica simulada: ejecutar la política sobre BEHAVIOR-1K para la habilidad turning_on_radio y medir tasas de éxito en rollouts, aprovechando que el repositorio incluye scripts de rollout y herramientas de evaluación.
- Estudio comparativo de fuentes de datos para SFT: usar los tres checkpoints de `b1k_sft` (humanos, codegen, mezcla 50:50) manteniendo constante el resto del pipeline para aislar el efecto de la fuente de datos en el comportamiento final.
- Evaluación del codegen como generador de datos de entrenamiento: emplear `pi05_task00_codegen_success_sft` para analizar si las trayectorias generadas por código y filtradas por éxito son un sustituto viable de las demostraciones humanas.
- Mitigación de desequilibrios de distribución: reutilizar la configuración de balanceo de cola de `pi05_tail_balanced_v2` como receta para reentrenar sobre colas largas de estados poco frecuentes.
- Auditoría y reproducibilidad de experimentos: partir del plan y la auditoría de dataset de `pi05_task00_sft_plan` para verificar la composición de los datos antes de replicar un entrenamiento.
- Punto de partida para transferencia a otras tareas: adaptar el pipeline de fine-tuning a otras habilidades de BEHAVIOR-1K distintas de turning_on_radio.
- Selección de checkpoints por criterio de evaluación: comparar el checkpoint final (paso 14999) con el checkpoint EMA intermedio (paso 6000) documentado en el paquete de codegen para estudiar el compromiso entre madurez del entrenamiento y rendimiento en rollout.
- Docencia y divulgación técnica: el repositorio expone de forma conjunta recetas, informes y resultados, lo que lo hace utilizable como caso de estudio completo de un pipeline VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye carpetas de evaluación (`evaluation`) e informes (`reports`), pero no se proporcionan cifras concretas (tasas de éxito, MMLU, HumanEval, GSM8K ni equivalentes) en los datos disponibles. El autor señala que la pérdida de entrenamiento o validación no basta para acreditar éxito en los rollouts.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifica el número de parámetros ni el tamaño de un checkpoint individual.
- Tamaño de descarga: el repositorio completo ocupa 222,8 GB; es posible descargar únicamente un paquete con `--include` para reducir el volumen transferido.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El autor indica que se trata de checkpoints JAX/Orbax OCDBT personalizados y que debe usarse la implementación de inferencia correspondiente a cada paquete, junto con su normalización y su tokenizador. Cada árbol de checkpoint debe mantenerse íntegro.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los únicos elementos comparables que aparecen en la información proporcionada son los propios paquetes del repositorio. No se facilita ninguna ficha técnica de modelos alternativos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| B1K model (davidwdw) | no disponible | no disponible | sin datos publicados en la información disponible | no disponible | HuggingFace, 0 descargas |
| Pi0.5 (modelo base citado en el repositorio) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otros modelos VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse si se permite el uso comercial ni bajo qué condiciones. Conviene contactar con el autor antes de cualquier uso en producción.
- Formato propietario: los pesos son checkpoints JAX/Orbax OCDBT, no safetensors ni GGUF, por lo que no son directamente compatibles con los ecosistemas de inferencia habituales.
- Dependencia estricta del entorno: cada árbol de checkpoint debe mantenerse íntegro y usarse con su normalización, su tokenizador y su implementación de inferencia correspondientes; mezclar componentes puede invalidar los resultados.
- Ámbito reducido: los modelos de tarea task-00 están entrenados para turning_on_radio en BEHAVIOR-1K; no hay evidencia de generalización a otras tareas, entornos reales u otras morfologías de robot.
- Señal de validación limitada: la pérdida de entrenamiento o validación no acredita éxito en rollouts, según advierte el propio autor.
- Rutas históricas: la documentación y los recibos conservan rutas locales y ubicaciones de origen antiguas, que deben adaptarse a cada instalación.
- Volumen de descarga elevado (222,8 GB en total), relevante para el almacenamiento y el ancho de banda necesarios.
- Adopción nula constatada: 0 descargas y 0 likes en el momento de la captura, sin comunidad que haya validado los resultados de forma independiente.
- Sin información sobre sesgos, riesgo de alucinación, comportamiento multilingüe ni límites de contexto, al no publicarse esos datos.
- Fecha de creación y actualización registradas en septiembre de 2026 en los metadatos de HuggingFace.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/davidwdw/b1k_model
- Documentación interna del repositorio: `b1k_sft/README.md`, `pi05_task00_codegen_success_sft/README.md`, `pi05_task00_sft/README.recipe.md`, `pi05_task00_sft_plan/PLAN.md`, `pi05_tail_balanced_v2/OPERATIONS.md`
- Carpeta de evaluación: `evaluation`
- Carpeta de informes: `reports`
- Carpeta de rollouts: `rollouts`
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código o demostraciones.
