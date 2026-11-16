# morepeaches/anlp-a3-part1-deltanet

## Resumen

`morepeaches/anlp-a3-part1-deltanet` es un checkpoint educativo publicado por el usuario morepeaches como parte de la Parte A de la tercera tarea de un curso de Procesamiento de Lenguaje Natural Avanzado (ANLP). No se trata de un modelo de lenguaje de propósito general, sino de un modelo causal a nivel de carácter entrenado desde cero para una tarea muy concreta: el descifrado de texto cifrado, leyendo ciphertext en bruto y generando los caracteres de plaintext de forma autorregresiva, realimentando sus propias predicciones durante la inferencia.

El checkpoint corresponde a la arquitectura principal del trabajo (etiquetada como "deltanet" en el nombre del repositorio) y excluye explícitamente la extensión separada de feedback de suma acumulada (*running-sum-feedback*). El entrenamiento quedó en estado parcial: se completaron 17.400 de las 38.893 actualizaciones de optimizador previstas, con parada temprana activada. El autor advierte que los distintos checkpoints del trabajo tienen presupuestos de entrenamiento distintos, por lo que no constituyen una comparación arquitectónica con presupuesto igualado ni reproducen un resultado de referencia.

La relevancia de este artefacto es, por tanto, exclusivamente docente y de reproducibilidad: sirve para evaluación del curso y para estudiar el pipeline de entrenamiento, no para uso en producción. El rendimiento medido es bajo (precisión de carácter de 0,093, precisión de palabra de 0,0436 y exact match de 0,1648 sobre 1.153 ejemplos de validación), lo que limita de forma severa cualquier aplicación práctica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de una arquitectura propia denominada "deltanet"; el autor no detalla la topología en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`weights.safetensors`) más `metadata.json` y `training_config.yaml` |

## Arquitectura y entrenamiento

El modelo se describe como un modelo causal a nivel de carácter (*character-level*) entrenado desde cero (*from-scratch*) para descifrado. La generación es autorregresiva y utiliza las predicciones previas de plaintext del propio modelo como contexto en el momento de la inferencia, es decir, funciona en modo *free-running* sobre la fuente completa. El checkpoint guardado contiene la arquitectura principal sin cambios y deja fuera la extensión independiente de feedback de suma acumulada, que el autor menciona como componente separado del trabajo.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas más allá de la propia formulación del descifrado causal a nivel de carácter. El entrenamiento quedó incompleto: 17.400 de 38.893 actualizaciones de optimizador planificadas, con parada temprana activada y estado marcado como *partial*. El repositorio incluye `training_config.yaml` con las elecciones de entrenamiento saneadas, pero excluye datos de entrenamiento, estado del optimizador, snapshots de recuperación, credenciales y rutas específicas de máquina.

## Capacidades

- Descifrado de texto cifrado a nivel de carácter: lee ciphertext en bruto y emite caracteres de plaintext de forma causal.
- Generación autorregresiva con realimentación de sus propias predicciones previas de plaintext durante la inferencia.
- Funcionamiento en modo *free-running* sobre la fuente completa de validación.
- Integración únicamente mediante el cargador propio del repositorio de la asignatura (`src.part1.cli.load_checkpoint`); no hay integración con `AutoModel` de Hugging Face.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Evaluación de la asignatura: el checkpoint se publica para que el profesorado y el alumnado puedan cargarlo con el cargador del repositorio del curso y verificar las métricas de validación declaradas (precisión de carácter 0,0934, precisión de palabra 0,0436, exact match 0,1648 sobre 1.153 ejemplos).
- Reproducibilidad de experimentos docentes: permite reconstruir el estado exacto del entrenamiento parcial (17.400 de 38.893 actualizaciones) y compararlo con otros checkpoints del mismo trabajo, siempre teniendo en cuenta que los presupuestos de entrenamiento no están igualados.
- Estudio del pipeline de descifrado causal: sirve como referencia para analizar cómo un modelo a nivel de carácter realimenta sus propias predicciones de plaintext y cómo evoluciona el error en modo *free-running*.
- Análisis de curvas de aprendizaje y parada temprana: al conocerse el punto exacto de parada, se puede estudiar el efecto de truncar el entrenamiento en tareas de descifrado carácter a carácter.
- Docencia sobre formatos de checkpoint: el par `weights.safetensors` + `metadata.json` con huella de integridad y procedencia de validación es un ejemplo práctico de empaquetado reproducible de un modelo fuera del ecosistema estándar de Hugging Face.
- Prácticas de ingeniería de evaluación: el modelo ilustra la diferencia entre resultados de validación y de test, y por qué un exact match de 0,1648 no es suficiente para uso real.

## Benchmarks y rendimiento

Resultados de validación declarados por el autor (no son resultados de test):

| Metrica | Valor |
|---|---:|
| Precisión de carácter | 0,0933875896 |
| Precisión de palabra | 0,0436217839 |
| Exact match | 0,1647875108 |
| Ejemplos evaluados | 1153 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se publican parámetros totales, por lo que no puede calcularse.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: únicamente el cargador propio del repositorio de la asignatura (`src.part1.cli.load_checkpoint`), que requiere el código del curso suministrado por separado. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (descifrado carácter a carácter entrenado desde cero con fines educativos) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Rendimiento muy bajo: precisión de carácter de 0,093 y de palabra de 0,0436; el propio autor señala que la baja precisión medida limita el uso práctico.
- Entrenamiento parcial: solo 17.400 de 38.893 actualizaciones planificadas, con parada temprana; el modelo no está completamente entrenado.
- Los checkpoints del trabajo tienen presupuestos de entrenamiento distintos, por lo que no permiten una comparación arquitectónica con presupuesto igualado ni reproducen un resultado de referencia.
- Los resultados publicados son de validación, no de test.
- Sin integración con `AutoModel` de Hugging Face: requiere el cargador específico del repositorio del curso, lo que impide su uso en stacks estándar.
- Licencia no disponible: no puede asumirse permiso para uso comercial ni redistribución.
- Idiomas: solo inglés declarado; sin capacidades multilingües documentadas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Naturaleza educativa: el checkpoint se suministra para evaluación del curso y reproducibilidad, no para producción.
- Excluye la extensión de feedback de suma acumulada, por lo que no representa el trabajo completo descrito en la asignatura.

## Enlaces

- Hugging Face: https://huggingface.co/morepeaches/anlp-a3-part1-deltanet
- Repositorio de código del curso: no disponible en la información proporcionada (el autor indica que se suministra por separado).
- Paper, blog, demo o repositorio adicional: no disponible.
