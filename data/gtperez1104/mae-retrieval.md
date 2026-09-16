# Gtperez1104/mae-retrieval

## Resumen

Mae-retrieval es un repositorio de HuggingFace publicado por el usuario Gtperez1104 que contiene una implementación propia en PyTorch del modelo denominado Mae, orientada a tareas de recuperación (retrieval). Se distribuye en configuración "small" y consta de 16.576 parámetros totales, un tamaño propio de un artefacto de laboratorio más que de un modelo desplegable. El repositorio incluye el código del modelo (`run.py`), un `config.json` con la arquitectura generada, un `training_args.json` con la receta por defecto y un `model.safetensors` que, según el propio autor, es un checkpoint de inicialización válido para pruebas de humo y no un modelo entrenado.

La relevancia de esta ficha es fundamentalmente metodológica: el autor declara explícitamente que no se reclama ninguna puntuación de benchmark, que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, y que el propósito es la revisión de código y la experimentación controlada a pequeña escala. No hay información sobre idiomas soportados, longitud de contexto, tokenizador ni datos de entrenamiento.

El repositorio se publicó el 15 de septiembre de 2026, ocupa 0,0 GB, tiene 0 descargas y 0 likes, y se distribuye bajo licencia MIT. Las búsquedas web realizadas no devolvieron ningún resultado técnico relacionado con el modelo, por lo que toda la información aquí recogida procede de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mae (implementación propia; el acrónimo no se desarrolla en la documentación) |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documenta precisión de almacenamiento) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Escala | small |
| Mecanismo de atencion | sparse (dispersa) |
| Fusion | bilinear |
| Activacion | mish |
| Normalizacion | scalenorm |
| Optimizador por defecto | rmsprop |
| Planificador por defecto | polynomial |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura se etiqueta simplemente como "Mae" y se describe mediante cinco atributos: atención dispersa (sparse), fusión bilineal, activación mish y normalización scalenorm, en escala "small". La fusión bilineal es un patrón habitual en recuperación multimodal, donde se combinan las representaciones de dos modalidades mediante un producto bilineal para producir una puntuación de similitud; la atención dispersa reduce el coste cuadrático al restringir el conjunto de pares consulta-clave. No obstante, la model card no especifica número de capas, dimensión oculta, número de cabezas, vocabulario, tokenizador ni el número de modalidades que maneja el modelo.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto con optimizador rmsprop y planificador polinómico, pero el propio autor advierte que son valores de partida del script y no evidencia de una ejecución completada. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. El autor sugiere como primera evaluación razonable el conjunto Flickr30k, con métrica reportada sobre al menos tres semillas y una línea base de capacidad equivalente, lo que sitúa el modelo en el ámbito de la recuperación imagen-texto sin confirmarlo explícitamente.

## Capacidades

- El repositorio contiene el modelo y un punto de entrada ejecutable (`run.py`) con un ejemplo de prueba de humo; la comprobación rápida documentada es `python run.py --help`.
- `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado: no se puede afirmar ninguna capacidad funcional de recuperación, generación o razonamiento.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de soporte para agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües ni sobre el idioma o idiomas de trabajo.
- No hay evidencia de modo de razonamiento (thinking), visión, audio ni otras capacidades especiales, más allá de la posible naturaleza multimodal implícita en la fusión bilineal.
- El autor indica que, al tratarse de una implementación propia, las APIs genéricas de carga automática (por ejemplo `AutoModel`) requieren un adaptador explícito.

## Casos de uso

- Revisión de código de arquitecturas de recuperación: el repositorio es un artefacto compacto pensado para leer y auditar una implementación de atención dispersa con fusión bilineal, útil como material didáctico o de revisión interna.
- Pruebas de humo en integración continua: el checkpoint de inicialización y el script `run.py` permiten verificar de forma barata que un pipeline de carga, preprocesado y forward pass funciona antes de invertir en entrenamiento real.
- Plantilla para experimentos controlados: sirve como esqueleto para montar comparativas de arquitecturas con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, tal como recomienda el autor.
- Estudio de ablaciones sobre mecanismos de atención: al ser una implementación propia con atención dispersa, facilita sustituir componentes (atención, fusión, normalización) y medir el efecto relativo sin depender de librerías externas.
- Prototipado de recuperación imagen-texto: el autor propone Flickr30k como primera evaluación, de modo que el repositorio puede usarse como punto de partida para construir un evaluador de recuperación con métrica por semilla y línea base de capacidad equivalente.
- Formación y docencia: el tamaño reducido (16.576 parámetros) y la presencia de `config.json` y `training_args.json` lo hacen adecuado para explicar cómo se estructura un proyecto de modelado en PyTorch.
- Verificación de infraestructura de serialización: permite comprobar la carga de safetensors y la compatibilidad de versiones del entorno en máquinas sin GPU.

En ningún caso estos usos implican calidad de recuperación: el modelo no ha sido entrenado, por lo que no debe emplearse para búsqueda, ranking ni generación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint incluido no se presenta como un checkpoint de referencia entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 65 KiB en fp32 y 33 KiB en fp16 o bf16 para los pesos, según los 16.576 parámetros declarados. El consumo real estará dominado por el framework y los tensores de entrada, no por el modelo.
- GPU recomendadas: ninguna en concreto; el modelo cabe holgadamente en cualquier GPU, incluidas integradas y aceleradores de gama de entrada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, y también en CPU sin dificultad.
- Opciones de despliegue: al no ser un modelo de lenguaje causal estándar, vLLM, TGI u Ollama no son aplicables directamente. El despliegue natural es la ejecución directa del script de PyTorch incluido; el autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito.
- Latencia y throughput: no disponible. Con este número de parámetros, el coste por invocación sería despreciable frente al preprocesado de datos y la E/S, pero no se aportan medidas.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información proporcionada: mae-retrieval no es un modelo entrenado y no publica métricas, contexto ni idiomas, por lo que cualquier comparación cuantitativa con modelos de recuperación consolidados sería engañosa. A modo de referencia de categoría (recuperación imagen-texto mediante codificadores duales), se incluyen dos familias conocidas, con cifras aproximadas de conocimiento general y no verificadas en la búsqueda realizada.

| Modelo | Parametros | Estado | Licencia | Benchmarks publicados |
|---|---|---|---|---|
| mae-retrieval (Gtperez1104) | 16.576 | Checkpoint de inicializacion, sin entrenar | MIT | No, el autor no reclama ninguno |
| CLIP ViT-B/32 (OpenAI) | ~151 M (cifra aproximada, no verificada) | Entrenado sobre pares imagen-texto a gran escala | MIT | Si, en el paper original |
| SigLIP base (Google) | ~203 M (cifra aproximada, no verificada) | Entrenado sobre pares imagen-texto a gran escala | Apache 2.0 | Si, en el paper original |

La comparación relevante no es de rendimiento sino de propósito: CLIP y SigLIP son modelos entrenados y evaluados para recuperación, mientras que mae-retrieval es un esqueleto de implementación.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado. Las salidas del modelo no tienen significado funcional y no deben usarse para tomar decisiones.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No se documentan sesgos conocidos, pero tampoco existe ningún análisis que permita descartarlos.
- Riesgo de alucinación: no aplica en el sentido habitual al no ser un modelo generativo entrenado; el riesgo equivalente es producir puntuaciones de similitud arbitrarias.
- No hay información sobre longitud de contexto, idiomas soportados, tokenizador ni vocabulario, lo que impide planificar su uso.
- Al ser una implementación propia, no es cargable mediante APIs genéricas sin un adaptador explícito, lo que añade coste de integración.
- El repositorio tiene 0 descargas y 0 likes y ocupa 0,0 GB: no existe validación por parte de la comunidad ni resultados reproducidos de forma independiente.
- La licencia MIT cubre el repositorio, pero el autor recuerda que deben revisarse por separado los términos de los datos de origen cuando se usen conjuntos de datos externos (por ejemplo, Flickr30k).
- Las búsquedas web realizadas no devolvieron ningún resultado relevante sobre el modelo: los resultados obtenidos eran páginas no relacionadas, por lo que no hay prensa, papers ni discusiones técnicas que lo respalden.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gtperez1104/mae-retrieval
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web realizada.
