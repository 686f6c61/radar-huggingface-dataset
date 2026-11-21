# mkdyasserh/NovaCAPE-Qwen3-8B

## Resumen

NovaCAPE-Qwen3-8B es un checkpoint de cabezas de proyección (projection heads) entrenadas sobre embeddings cacheados de un encoder Qwen3-8B congelado. Lo desarrolla el usuario de Hugging Face mkdyasserh y no es un modelo generativo completo, sino un componente de ranking de acciones: dado un estado, ordena un conjunto de acciones candidatas. Su arquitectura se apoya en aprendizaje contrastivo (contrastive learning) y se etiqueta explícitamente como "action-ranking".

El problema que aborda es la selección y ordenación de acciones en entornos de agente, así como la selección de intentos en tareas de ingeniería de software. El checkpoint contiene únicamente las cabezas entrenadas (repo de 0,1 GB), no los pesos del modelo base; para usarlo hay que ejecutar el endpoint de embeddings de Qwen3-8B y pasar el checkpoint descargado al servidor de CLM. El entrenamiento consistió en 640 actualizaciones.

Es relevante ahora porque propone una vía ligera (entrenar solo cabezas sobre un encoder congelado) para mejorar la selección de acciones y respuestas en pipelines de agentes, con resultados reportados frente a una línea base denominada "Released CLM" en tareas como DeepSWE, SWE-bench Verified y T-Rex. La información pública es escasa: no hay licencia, idiomas ni pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de proyección (HeadPair) sobre encoder Qwen3-8B congelado; aprendizaje contrastivo |
| Parametros totales | No disponible (el repo de 0,1 GB contiene solo las cabezas, no el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del encoder Qwen3-8B, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo autónomo: es un par de cabezas de proyección (HeadPair) entrenadas sobre embeddings cacheados de un encoder Qwen3-8B congelado identificado por el commit `b968826d9c46dd6066d109eabc6255188de91218`. El entrenamiento se basa en aprendizaje contrastivo y se orientó a dos objetivos: elegir la acción registrada entre ocho opciones en el mismo entorno y ordenar pares de respuestas utilizando críticas escritas. Se realizaron 640 actualizaciones.

El pipeline de entrenamiento incluyó además demostraciones de terminal y preguntas y respuestas con negativos duros (hard-negative Q&A). La innovación técnica principal es el enfoque de eficiencia: al mantener congelado el encoder y entrenar solo las cabezas, el coste de entrenamiento es bajo y el artefacto resultante es pequeño (0,1 GB). El uso requiere el paquete `contrastive-lm` (CLM) desde el repositorio Git indicado en la model card, y el servicio se levanta con `clm-serve --ckpt`.

## Capacidades

- Ranking de acciones candidatas dado un estado del entorno (action-ranking).
- Selección de la acción correcta entre ocho alternativas en entornos registrados.
- Ordenación de pares de respuestas mediante críticas escritas.
- Puntuación de candidatos para selección de intentos (best-of-N), evaluada en SWE-bench Verified.
- Soporte de preguntas y respuestas con negativos duros.
- Integración con el endpoint de embeddings de Qwen3-8B y el servidor CLM.
- No se declaran capacidades de generación de texto, tool calling, agentes multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Selección de intentos en generación de código: dado un problema de software y varios parches candidatos generados por un modelo, las cabezas puntúan y ordenan las opciones para elegir la mejor; la model card reporta su uso en selección best-of-four sobre SWE-bench Verified.
- Ranking de acciones en agentes de terminal: con demostraciones de terminal en el entrenamiento, el checkpoint puede ordenar comandos o acciones candidatas en un entorno de línea de comandos antes de ejecutarlos.
- Filtrado de respuestas en pipelines de QA: las cabezas ordenan pares de respuestas usando críticas escritas, lo que permite descartar respuestas de baja calidad en un sistema de generación con verificación.
- Planificación asistida con verificación: en la evaluación T-Rex planner agreement se mide la concordancia del planificador con las cabezas actuando como filtro (shield on), un patrón aplicable a sistemas que validan planes antes de ejecutarlos.
- Evaluación automática de candidatos: como modelo de ranking, sirve para puntuar salidas de otros modelos en procesos de evaluación o anotación asistida.
- Componente de un sistema de decisión con encoder compartido: al reutilizar el endpoint de embeddings de Qwen3-8B, se puede desplegar junto a otros servicios que ya usen ese encoder, amortizando el coste de inferencia del modelo base.

## Benchmarks y rendimiento

| Benchmark | NovaCAPE | Released CLM |
|---|---:|---:|
| Hard-negative Q&A accuracy (191.161 ejemplos) | 70,82% | 68,63% |
| DeepSWE, tareas resueltas de 38, verificador ajustado (media de cinco semillas) | 30,4 | 31,0 |
| DeepSWE, tareas resueltas de 38, cabezas post-entrenadas usadas directamente | 27 | 27 |
| T-Rex planner agreement (cinco cursos nuevos, shield on) | 36,1% | 66,9% |
| SWE-bench Verified, selección de intentos (mejor-de-cuatro esperado, 95 issues) | 71,31% | 69,42% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El checkpoint de cabezas es pequeño (repo de 0,1 GB) y la model card muestra su carga en CPU (`device="cpu"`), por lo que las cabezas en sí no requieren GPU.
- La inferencia real requiere ejecutar el endpoint de embeddings de Qwen3-8B, cuyos requisitos de VRAM dependen de la cuantización y del servidor empleado; no se especifican en la información disponible.
- GPU recomendadas para el encoder: no disponible.
- Compatibilidad con GPU de consumo: no disponible para el encoder; las cabezas no necesitan GPU.
- Opciones de despliegue: `clm-serve --ckpt` del paquete CLM, junto con el endpoint de embeddings de Qwen3-8B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|---|
| NovaCAPE-Qwen3-8B | Cabezas de ranking sobre encoder Qwen3-8B congelado | No disponible (cabezas; base de 8B) | No disponible | No disponible | Hard-negative Q&A 70,82%; SWE-bench Verified best-of-four 71,31% |
| Released CLM | Línea base de CLM citada en la model card | No disponible | No disponible | No disponible | Hard-negative Q&A 68,63%; SWE-bench Verified best-of-four 69,42%; T-Rex 66,9% |
| Qwen3-8B | Modelo generativo base | 8B (según denominación) | No disponible en esta ficha | No disponible en esta ficha | No disponible |

No se dispone de datos suficientes para comparar con otras alternativas de ranking de acciones.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce puntuaciones de ranking y requiere un encoder Qwen3-8B en ejecución para funcionar.
- Dependencia de una versión concreta del paquete CLM (commit `d5f9ef0fd9bde185df0ceaad4f4ecc6cfe8c34f6`) y del commit del encoder Qwen3-8B; cambios de versión pueden romper la compatibilidad.
- El rendimiento en T-Rex planner agreement es notablemente inferior al de la línea base (36,1% frente a 66,9%), lo que indica un comportamiento desigual según la tarea.
- En DeepSWE con verificador ajustado el resultado es ligeramente inferior a la línea base (30,4 frente a 31,0) y en uso directo de las cabezas ambos empatan en 27.
- Licencia no declarada: no se puede confirmar el uso comercial.
- Idiomas soportados no declarados.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible; al ser un rankeador, el riesgo se traslada a la selección de candidatos sesgados o incorrectos.
- El autor indica en el ejemplo de carga un identificador de usuario genérico (`YOUR_HF_USERNAME`), lo que sugiere que la model card no está completamente adaptada al repo publicado.
- Repo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkdyasserh/NovaCAPE-Qwen3-8B
- Modelo base Qwen3-8B (commit referenciado): https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- Repositorio CLM (commit referenciado): https://github.com/Contrastive-LM/CLM/tree/d5f9ef0fd9bde185df0ceaad4f4ecc6cfe8c34f6
