# Czs-HF/microduck-sprint-test-v3

## Resumen

microduck-sprint-test-v3 es un artefacto publicado en Hugging Face por el usuario Czs-HF bajo la librería `microduck`, derivado por fine-tuning del modelo `jrubiosainz/microduck-game-sprinter-remix14`. No se trata de un modelo de lenguaje: la model card lo describe como una política de control para un agente denominado MicroDuck en un entorno de simulación, implementada mediante búsqueda de vecino más cercano sobre pares de observación y acción (targets articulares) grabados del modelo base. El repositorio tiene un tamaño de 0,0 GB y no contiene pesos en formatos convencionales de aprendizaje profundo.

El modelo no resuelve tareas de generación de texto, razonamiento ni código. Su función es reproducir, por imitación, el comportamiento del modelo base en cinco semillas oficiales de una arena de simulación, con una medición local declarada de 0,817 s, 5/5 éxitos y una velocidad de 0,20 m/s. La relevancia es, por tanto, muy acotada: sirve como referencia o test de destilación dentro del ecosistema MicroDuck, no como componente para aplicaciones de IA generativa.

La información pública disponible es mínima: no hay licencia declarada, no se especifican idiomas, no hay pipeline asignado y no se han publicado resultados de benchmarks más allá de la métrica de éxito mencionada. Cualquier evaluación fuera del entorno de simulación descrito debe considerarse no soportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Búsqueda de vecino más cercano sobre targets articulares grabados (no es una red neuronal entrenada con descenso de gradiente) |
| Parametros totales | no disponible (el repo ocupa 0,0 GB; no se declaran parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería `microduck`, sin formato declarado; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card describe el método como una destilación del modelo base `jrubiosainz/microduck-game-sprinter-remix14`. En cada paso, la acción seleccionada es el target grabado cuyas posiciones articulares y acción previa resultan más cercanas a la observación actual. Es decir, no hay una red neuronal con parámetros entrenados por gradiente, sino una tabla de pares observación-acción registrados del modelo base y una regla de búsqueda por similitud. La relación declarada con el modelo base es `finetune`, aunque el mecanismo descrito corresponde a imitación por recuperación (nearest-neighbor lookup).

No se especifican datos de entrenamiento en términos de número de tokens, composición del dataset ni procesos de RLHF o DPO, ya que el paradigma no es el de un modelo de lenguaje. La única información cuantitativa de entrenamiento o evaluación es la grabación sobre las cinco semillas oficiales de la arena y la medición local de 0,817 s con 5/5 éxitos a 0,20 m/s. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Control de agente en simulación: reproduce acciones articulares del modelo base mediante búsqueda de vecino más cercano sobre observaciones.
- Ejecución sobre las cinco semillas oficiales de la arena MicroDuck, según la model card.
- Destilación por imitación: aproxima el comportamiento de `jrubiosainz/microduck-game-sprinter-remix14` sin requerir el modelo original en inferencia.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso más allá del bucle de control del entorno.
- Capacidades multilingües: no aplica / no disponible.
- Capacidades especiales (thinking mode, audio, visión): no disponibles.

## Casos de uso

- Prueba de destilación en el ecosistema MicroDuck: usar el artefacto como referencia para verificar que una política por recuperación reproduce el comportamiento del modelo base en las cinco semillas oficiales, comparando la tasa de éxito 5/5 declarada.
- Validación de pipelines de simulación: integrar el modelo en el simulador MicroDuck para comprobar que el entorno de evaluación funciona correctamente con una política conocida antes de probar políticas nuevas.
- Baseline de control en experimentos de imitación: emplear la búsqueda de vecino más cercano como línea base mínima frente a políticas entrenadas con gradiente, midiendo tiempo de ejecución (0,817 s declarados) y tasa de éxito.
- Reproducción de resultados: replicar la medición local a 0,20 m/s para auditar la afirmación del autor sobre las cinco semillas oficiales.
- Docencia o demostración de métodos de imitación: ilustrar la diferencia entre destilación por recuperación y aprendizaje por refuerzo en un entorno de simulación acotado.
- Test de regresión del modelo base: detectar cambios de comportamiento en `microduck-game-sprinter-remix14` comparando las acciones grabadas con las generadas por versiones posteriores del modelo base.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo de medición local | 0,817 s | Medición declarada por el autor |
| Tasa de éxito | 5/5 | Semillas oficiales de la arena |
| Velocidad | 0,20 m/s | Medición declarada por el autor |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores proceden únicamente de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y no se declaran pesos en formatos estándar.
- GPU recomendadas: no disponible; no se especifica ningún requisito de aceleración por hardware.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `microduck`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: únicamente la medición local de 0,817 s declarada por el autor; no se aportan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Czs-HF/microduck-sprint-test-v3 | Búsqueda de vecino más cercano (destilación) | no disponible | no disponible | 0,817 s, 5/5, 0,20 m/s (declarado) | no disponible | Hugging Face, 0 descargas |
| jrubiosainz/microduck-game-sprinter-remix14 | Modelo base del que se destila | no disponible | no disponible | no disponible en esta ficha | no disponible | Hugging Face (referenciado) |
| Otros modelos de la familia MicroDuck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría fuera del ecosistema MicroDuck.

## Limitaciones y advertencias

- Solo simulación: la model card indica explícitamente que no debe cargarse en un MicroDuck físico.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; debe tratarse como uso restringido hasta confirmación del autor.
- Sin idiomas ni pipeline declarados: no es apto para tareas de NLP ni de generación.
- Sin datos de sesgo ni de alucinación: al no ser un modelo de lenguaje, estas categorías no aplican, pero tampoco se documenta el comportamiento fuera de las cinco semillas oficiales.
- Generalización limitada: la política por vecino más cercano depende de los targets grabados; es probable que degrade su comportamiento ante observaciones no cubiertas por la grabación.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por terceros.
- Fecha de creación futura (2026-11-06) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Sin formatos de pesos declarados: la integración con herramientas estándar de inferencia no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Czs-HF/microduck-sprint-test-v3
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14
