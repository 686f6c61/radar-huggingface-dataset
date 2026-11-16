# morepeaches/anlp-a3-part1-transformer

## Resumen

`morepeaches/anlp-a3-part1-transformer` es un checkpoint educativo de un modelo transformer causal entrenado desde cero para una tarea de descifrado de texto a nivel de carácter. Lo publica el usuario `morepeaches` como parte de la asignación 3 de un curso de Procesamiento de Lenguaje Natural Avanzado (Advanced NLP, asignatura A3, parte 1). No es un modelo de propósito general: lee texto cifrado y genera, de forma causal, los caracteres del texto plano correspondiente, utilizando sus propias predicciones previas durante la inferencia.

Se trata de un transformer de arquitectura propia (no integrado en `transformers` de Hugging Face), con tokenizador a nivel de carácter, entrenado sobre datos en inglés. El repositorio pesa 0,0 GB y no se ha publicado información sobre el número de parámetros, la longitud de contexto ni la composición exacta del dataset en la información disponible.

Su relevancia es estrictamente académica y de reproducibilidad: sirve para evaluar el trabajo de un estudiante y para reproducir resultados del curso. La precisión medida es muy baja (10,3 % de caracteres correctos, 5,9 % de palabras correctas), por lo que no es apto para uso práctico en producción. Requiere el cargador específico `src.part1.cli` del repositorio de la asignatura; no hay integración con `AutoModel`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (implementación desde cero, no integrada en `transformers`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en `safetensors` sin indicación de variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`weights.safetensors`) + `metadata.json` + `training_config.yaml` |

## Arquitectura y entrenamiento

El modelo es un transformer causal entrenado desde cero para descifrado carácter a carácter. La generación es autorregresiva sobre caracteres de texto plano: en cada paso el modelo consume el criptograma y su propia secuencia de texto plano generada hasta el momento para predecir el siguiente carácter. El checkpoint guarda la arquitectura principal sin cambios y excluye la extensión separada de *running-sum feedback*.

El entrenamiento se completó con 38 893 de 38 893 actualizaciones del optimizador planificadas, sin *early stopping*. La model card advierte explícitamente que las distintas arquitecturas comparadas en la asignación tuvieron presupuestos de entrenamiento distintos, por lo que estos checkpoints no constituyen una comparación arquitectónica con presupuesto igualado ni reproducen un resultado de referencia separado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Descifrado de texto a nivel de carácter: recibe criptograma y genera texto plano de forma causal.
- Generación autorregresiva con realimentación de las predicciones previas de texto plano.
- Tokenización a nivel de carácter (sin vocabulario subword).
- Entrenamiento desde cero (*from-scratch*), sin pesos preentrenados de partida.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Evaluación académica de la asignación: el checkpoint permite al profesorado verificar la implementación del alumno cargándolo con `src.part1.cli.load_checkpoint` y reproduciendo las métricas de validación declaradas.
- Reproducibilidad de resultados del curso: sirve para replicar las cifras de validación (precisión de carácter 0,1032; precisión de palabra 0,0587; *exact match* 0,2003 sobre 1153 ejemplos) en un entorno controlado.
- Estudio de arquitecturas transformer desde cero: útil como ejemplo didáctico de un transformer causal mínimo con tokenizador de caracteres y sin dependencias de `transformers`.
- Análisis de tareas de descifrado carácter a carácter: permite examinar el comportamiento de un modelo autorregresivo con realimentación de sus propias predicciones en una tarea de sustitución.
- Comparación de variantes educativas: la model card menciona que existen otras arquitecturas en la misma asignación con presupuestos de entrenamiento distintos, útiles para discutir el efecto del presupuesto en resultados.
- Docencia sobre limitaciones de modelos: la baja precisión lo convierte en un caso práctico para ilustrar por qué un transformer pequeño y sin preentrenamiento no resuelve tareas de descifrado de forma fiable.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (validación de fuente completa, en modo *free-running*; no son resultados de test):

| Métrica de validación | Valor |
|---|---:|
| Precisión de carácter | 0,1032299373 |
| Precisión de palabra | 0,0587000235 |
| *Exact match* | 0,2003469211 |
| Ejemplos evaluados | 1153 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros; el repositorio pesa 0,0 GB, lo que sugiere un modelo muy pequeño).
- GPU recomendadas: no disponible; por el tamaño del repositorio, probablemente ejecutable en CPU, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: únicamente mediante el cargador del repositorio de la asignatura (`src.part1.cli.load_checkpoint`); no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card menciona otras arquitecturas de la misma asignación con presupuestos de entrenamiento distintos, pero no se proporcionan sus especificaciones ni resultados comparables en la información disponible.

## Limitaciones y advertencias

- Precisión muy baja: 10,3 % de caracteres correctos y 5,9 % de palabras correctas en validación; no apto para uso práctico.
- Los resultados publicados son de validación, no de test, y en modo *free-running* de fuente completa.
- No hay integración con `AutoModel`; requiere el cargador específico del repositorio del curso.
- El checkpoint excluye la extensión de *running-sum feedback*; no representa esa variante.
- Los presupuestos de entrenamiento difieren entre arquitecturas de la asignación, por lo que no permiten comparaciones justas.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idioma limitado al inglés.
- No se documentan sesgos, riesgos de alucinación ni comportamiento fuera de la tarea de descifrado; al ser un modelo de carácter educativo, su generalización es mínima.
- No se incluyen datos de entrenamiento, estado del optimizador, credenciales ni rutas de máquina en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morepeaches/anlp-a3-part1-transformer
- Repositorio de código de la asignatura: no disponible (se menciona `src.part1.cli` y el repositorio del curso, sin URL en la información proporcionada)
- Paper, blog o demo: no disponible
