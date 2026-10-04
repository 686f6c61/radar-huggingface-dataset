# oliviawright/perceiver-experiment73-2024

## Resumen

`oliviawright/perceiver-experiment73-2024` es un repositorio experimental publicado por la desarrolladora individual Olivia Wright que contiene una implementación propia de una arquitectura Perceiver en PyTorch, orientada a tareas de aprendizaje contrastivo. El checkpoint incluido (`model.safetensors`) es un punto de partida reproducible para pruebas de humo, no un modelo entrenado: la propia model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que los pesos no han sido entrenados ni auditados.

La relevancia del artefacto es metodológica, no de rendimiento. El Perceiver es una familia de arquitecturas que sustituye la atención sobre la entrada completa por una atención cruzada desde un array latente de tamaño fijo, con lo que el coste computacional y de memoria escala de forma lineal con el tamaño de la entrada en lugar de cuadráticamente. Este repositorio permite inspeccionar esa construcción con una configuración concreta (escala *small*, atención *flash*, fusión *concat MLP*, activación *mish*, normalización *scalenorm*) y una receta por defecto basada en el optimizador Adafactor con planificador coseno.

El tamaño declarado en los metadatos de safetensors es de 16.576 parámetros totales, una cifra propia de un modelo de juguete o de validación de código, muy alejada de cualquier uso en producción. El repositorio acumula 0 descargas y 0 *likes*, sin resultados de benchmarks publicados ni idiomas declarados, y no incluye tokenizador ni pipeline de inferencia de texto, por lo que debe tratarse como material de referencia para desarrolladores e investigadores que quieran partir de una base propia de Perceiver, no como un modelo listo para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceiver (escala *small*; atención *flash*; fusión *concat MLP*; activación *mish*; normalización *scalenorm*) |
| Parámetros totales | 16.576 (según metadatos de `safetensors`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`), más `config.json` y `training_args.json` |
| Autor | oliviawright |
| Estado del checkpoint | Inicialización sin entrenar, destinada a *smoke tests* |
| Tamaño del repositorio | 0,0 GB |
| Descargas / *likes* | 0 / 0 |
| Fecha de creación | 2026-10-04 |
| Última actualización | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un *transformer* con cuello de botella latente: un array de latentes de tamaño fijo atiende de forma cruzada a la entrada, de modo que el coste de cómputo y memoria crece linealmente con el número de elementos de entrada. En esta implementación concreta, la variante es *small* y la configuración registrada en la model card especifica atención *flash*, fusión mediante MLP sobre concatenación, función de activación *mish* y normalización de tipo *scalenorm*. El repositorio incluye un fichero Python (`train.py`) con el modelo y un punto de entrada ejecutable, además de `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto.

No se ha ejecutado ningún entrenamiento relevante: la model card indica que los valores de Adafactor con planificador coseno son puntos de partida del *script*, no evidencia de una ejecución completada. Por tanto, no hay datos sobre número de tokens de entrenamiento, composición del corpus, ni fases de ajuste por preferencias (RLHF, DPO u otros). La única recomendación metodológica publicada es que cualquier evaluación futura use un conjunto de validación específico de la tarea, al menos tres semillas aleatorias y un *baseline* de capacidad equivalente.

## Capacidades

- El checkpoint publicado no está entrenado, por lo que no puede afirmarse ninguna capacidad funcional: sus salidas son las de una inicialización aleatoria.
- No se declara soporte de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte para agentes ni para razonamiento multi-paso.
- No se declara ninguna capacidad multilingüe (el campo de idiomas no está disponible).
- No se declara un modo de razonamiento explícito (*thinking mode*) ni decodificación especulativa.
- La capacidad que la arquitectura habilita por diseño es la producción de representaciones latentes para aprendizaje contrastivo, siempre que se entrene previamente con datos y objetivos adecuados.
- El repositorio funciona como plantilla ejecutable de arquitectura y receta de optimización, no como modelo utilizable.

## Casos de uso

- Pruebas de humo de *pipelines* de entrenamiento: cargar `model.safetensors` junto a `config.json` para verificar que el *forward pass*, la retropropagación y las formas de los tensores son correctas antes de lanzar un entrenamiento real.
- Plantilla de experimentación en arquitecturas Perceiver: servir como punto de partida reproducible para estudiar atención cruzada con latentes de tamaño fijo y comparar el escalado lineal frente a alternativas de atención completa.
- Estudio comparativo de recetas de optimización: la configuración por defecto (Adafactor con planificador coseno) permite montar experimentos controlados frente a otros optimizadores manteniendo la misma exposición de datos y semillas.
- Evaluación de decisiones de diseño internas: al fijar atención *flash*, fusión *concat MLP*, activación *mish* y normalización *scalenorm*, el repositorio facilita ablaciones sobre cada uno de esos componentes con un coste computacional mínimo.
- Aprendizaje contrastivo de prototipo en investigación académica: es un esqueleto adecuado para experimentar con funciones de pérdida contrastivas sobre representaciones latentes, aunque los pesos deben entrenarse desde cero.
- Material docente y de formación técnica: con 16.576 parámetros y un solo fichero principal (`train.py`), es un ejemplo manejable para explicar el funcionamiento interno de un Perceiver y el flujo de configuración de un experimento.
- Integración en sistemas de verificación continua: comprobar en CI que el *script* de entrenamiento arranca correctamente (`python train.py --help`) y que el checkpoint se carga sin errores tras cambios en el código.
- Base para un ajuste fino futuro sobre una tarea concreta: requiere entrenamiento previo y un conjunto de validación propio; los resultados obtenidos deberían documentarse por separado de los valores por defecto del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización válida para pruebas de humo, no un modelo entrenado.

## Requisitos de hardware

- VRAM para inferencia: no disponible como medición publicada. Como estimación derivada del recuento de parámetros, los pesos en fp32 ocupan aproximadamente 66 KB y en fp16/bf16 unos 33 KB; el consumo real dependerá de las activaciones, que no pueden calcularse sin conocer la forma de entrada y el número de latentes, datos no publicados.
- GPU recomendadas: cualquiera, incluida una GPU de gama baja o incluso CPU, dado el tamaño del modelo. No se ha publicado ninguna recomendación por parte del autor.
- GPU de consumo: cabe con holgura en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación propia sin tokenizador ni pipeline estándar, las APIs automáticas de carga requieren un adaptador explícito según la model card. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y *throughput*: no disponibles; no se publican mediciones en el repositorio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Estado y disponibilidad |
|---|---|---|---|---|---|
| `oliviawright/perceiver-experiment73-2024` | Perceiver *small* | 16.576 | no disponible | Apache-2.0 | Checkpoint de inicialización sin entrenar; 0 descargas |
| Perceiver (implementación documentada en la librería `transformers`) | Perceiver | no disponible en la información recopilada | no disponible | Apache-2.0 | Implementación mantenida con documentación oficial y pesos preentrenados publicados en el Hub |
| Perceiver IO | Perceiver IO | no disponible en la información recopilada | no disponible | no disponible | Extensión del Perceiver original que añade salidas flexibles; solo referenciada a través de la documentación consultada |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no sirve para inferencia real ni para evaluación de calidad.
- No ha sido auditado en cuanto a robustez, equidad (*fairness*) ni transferencia de dominio, según la propia model card.
- No se publican sesgos conocidos, pero tampoco existe ninguna evaluación que permita descartarlos.
- El riesgo de alucinación no es evaluable en este artefacto porque no es un modelo generativo entrenado; cualquier uso generativo futuro quedaría sin caracterizar.
- No hay idiomas declarados ni límites de contexto documentados.
- La licencia Apache-2.0 permite uso comercial del código y los pesos, pero la model card advierte de que deben revisarse por separado las condiciones de los datos de origen cuando se usen conjuntos externos.
- Al ser una implementación a medida, las APIs genéricas de carga automática no funcionan sin un adaptador explícito.
- El repositorio presenta 0 descargas y 0 *likes*, por lo que no cuenta con validación alguna por parte de la comunidad.
- El tamaño del repositorio se declara como 0,0 GB y los pesos son de 16.576 parámetros: no es una base viable para tareas de producción sin un entrenamiento completo.
- Cualquier resultado obtenido a partir de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto que se distribuyen aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oliviawright/perceiver-experiment73-2024
- Documentación de Perceiver en la librería `transformers`: https://huggingface.co/docs/transformers/model_doc/perceiver
- Paper original del Perceiver (referencia externa, no recogida en los resultados de búsqueda): https://arxiv.org/abs/2103.03206
- Rastreador de lanzamientos de modelos de IA (Evertune): https://models.evertune.ai/
- Otros resultados de la búsqueda web (perfil de Instagram de Olivia Wright, organización `olivia-ai` en GitHub, sitio de OpenAI) no guardan relación con este modelo y no se incluyen como referencias técnicas.
