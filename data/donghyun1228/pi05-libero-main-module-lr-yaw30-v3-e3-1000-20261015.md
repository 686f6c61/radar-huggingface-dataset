# Donghyun1228/pi05-libero-main-module-lr-yaw30-v3-e3-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de robótica publicado por el usuario Donghyun1228 bajo el identificador pi05-libero-main-module-lr-yaw30-v3-e3-1000-20261015. Por el nombre del modelo (pi05), la librería declarada (openpi) y las etiquetas (robotics, libero, inverse-dynamics), se trata de un ajuste fino experimental sobre un modelo de la familia pi0.5 orientado a manipulación robótica y evaluado en el conjunto de tareas LIBERO. El autor lo describe explícitamente como un «Main-method module LR candidate» dentro de una búsqueda de hiperparámetros autorizada.

La variante concreta corresponde a la configuración denominada yaw30, con multiplicadores post-Adam de 3,0 tanto para el módulo de visión como para el módulo experto, y el bloque LLM congelado. El entrenamiento se realizó durante 1000 actualizaciones con batch de 32 y semilla 42, manteniendo el grafo nativo sin cambios, la inicialización de origen y la normalización original, y empleando datos de contacto denso ya existentes. En inferencia se utiliza la muñeca (wrist) de la fuente original.

Su relevancia ahora es acotada y estrictamente investigadora: es un artefacto de barrido de hiperparámetros que aísla el efecto de los multiplicadores de tasa de aprendizaje por módulo, con los pesos congelados verificados de forma independiente. El autor indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito, por lo que no debe tratarse como un modelo validado para producción. El repositorio no incluye documentación de arquitectura, número de parámetros, contexto ni idiomas, y acumula cero descargas y cero «likes» en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura; el identificador «pi05» y la librería «openpi» apuntan a la familia pi0.5 de tipo visión-lenguaje-acción, sin confirmación explícita en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni equivalentes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 7,7 GB y no se especifica el formato de los pesos) |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura del modelo base. Los únicos elementos técnicos documentados son los del procedimiento de ajuste: una estructura por módulos con un bloque de visión, un bloque experto y un bloque LLM congelado, sobre el que se modifican únicamente los multiplicadores de actualización posteriores al optimizador Adam. En concreto, la variante yaw30 aplica un multiplicador de 3,0 al módulo de visión y de 3,0 al módulo experto, dejando el LLM sin entrenar. La model card insiste en que el grafo nativo permanece inalterado, así que la inicialización y la normalización son las del modelo de origen.

El entrenamiento se llevó a cabo sobre datos de contacto denso preexistentes, durante 1000 actualizaciones con batch 32 y semilla 42 (referido como «raw999»). En inferencia se emplea la muñeca (wrist) de la fuente original. No se documentan el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de acción más que de lenguaje. Tampoco se describe ninguna innovación técnica adicional: el único eje manipulado en este candidato es la tasa de aprendizaje efectiva por módulo, y el autor declara que los pesos congelados fueron verificados de forma independiente en el checkpoint completado.

## Capacidades

- Control robótico para manipulación: el modelo está orientado a generar acciones motoras a partir de observaciones visuales y de estado, en el marco del benchmark LIBERO.
- Aprendizaje por dinámica inversa (inverse dynamics): la etiqueta indica que el entrenamiento explota la relación entre estados y acciones para derivar políticas de actuación.
- Integración con la librería openpi: el repositorio se declara compatible con dicha librería, que es la vía prevista de carga y ejecución.
- Generación de texto: no documentada. No hay ninguna indicación de que este checkpoint conserve capacidades de conversación o de generación de lenguaje.
- Razonamiento, matemáticas y código: no documentados para este artefacto.
- Tool calling y function calling: no documentados.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de pensamiento, visión, audio): la visión forma parte del pipeline por el propio carácter visión-lenguaje-acción del modelo base, pero no se detalla ningún modo adicional.

## Casos de uso

- Investigación en ajuste fino de políticas robóticas: el checkpoint permite reproducir un barrido de hiperparámetros concreto (multiplicadores 3,0/3,0, LLM congelado, 1000 pasos, semilla 42) y compararlo con otros candidatos de la misma campaña.
- Ablación de tasas de aprendizaje por módulo: al haberse modificado únicamente los multiplicadores post-Adam, sirve para aislar el efecto de esa decisión sobre el resto del pipeline, que permanece idéntico.
- Evaluación en el benchmark LIBERO: es el uso natural declarado por las etiquetas, aunque el autor advierte de que la evaluación está pendiente y no se reclama tasa de éxito.
- Reproducción de experimentos con semilla fija: la semilla 42 y el recuento de actualizaciones permiten repetir el entrenamiento en condiciones declaradas.
- Punto de partida para candidatos posteriores: el autor indica que el cribado («screening») de este candidato puede seleccionar modelos posteriores dentro de la misma búsqueda.
- Verificación de pesos congelados: el repositorio se presenta como un checkpoint completo con pesos congelados verificados de forma independiente, útil como referencia para auditar que el bloque LLM no se ha modificado.
- Integración en pipelines de robótica basados en openpi: para equipos que ya trabajan con esa librería, el checkpoint puede cargarse como un candidato más dentro de una comparativa interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que la evaluación está pendiente y que no se reclama ninguna tasa de éxito para este candidato. Por tanto, no se presentan cifras de LIBERO, MMLU, HumanEval ni de ningún otro conjunto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 7,7 GB, de modo que la sola carga de los pesos requeriría del orden de 8 GB de memoria, a los que habría que sumar activaciones y buffers de inferencia. Esta cifra es una estimación derivada del tamaño del repositorio, no un requisito declarado por el autor.
- GPU recomendadas: no disponibles. Con la estimación anterior, serían razonables tarjetas con 16-24 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100) para trabajar con margen, siempre que el formato de pesos y las dependencias lo permitan.
- Viabilidad en GPU de consumo: probable si los pesos caben en 12-16 GB, pero no está confirmado por el autor ni se especifica el formato de los pesos.
- Opciones de despliegue: la única declarada es la librería openpi. Herramientas como llama.cpp, Ollama o vLLM no aparecen mencionadas y no hay evidencia de soporte para un modelo de acción de este tipo.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control ni de tiempo de inferencia por paso.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Los candidatos naturales de comparación serían el modelo base pi0.5 y otros trabajos de la misma categoría (pi0 dentro del ecosistema openpi, o alternativas como OpenVLA), pero esta ficha no puede aportar cifras de parámetros, contexto ni rendimiento para ninguno de ellos porque no figuran en la información consultada.

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw30-v3-e3 (este) | no disponible | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace (0 descargas) |
| pi0.5 (modelo base de referencia) | no disponible en la información | no disponible en la información | no disponible en la información | no verificada en la información | no verificada en la información |
| pi0 (openpi) | no disponible en la información | no disponible en la información | no disponible en la información | no verificada en la información | no verificada en la información |
| OpenVLA | no disponible en la información | no disponible en la información | no disponible en la información | no verificada en la información | no verificada en la información |

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara que la evaluación está pendiente y que no se reclama tasa de éxito, por lo que no hay ninguna evidencia de rendimiento en LIBERO ni en ninguna otra tarea.
- Artefacto de barrido de hiperparámetros: se trata de un candidato intermedio dentro de una búsqueda autorizada, no de un modelo final destilado ni validado.
- Documentación mínima: no se especifican arquitectura, número de parámetros, contexto, idiomas, formato de pesos ni composición del dataset de entrenamiento.
- Riesgo de alucinación: no aplicable en el sentido lingüístico, pero sí existe el riesgo equivalente de generar acciones incorrectas o inseguras en un robot real, sin métricas publicadas que lo cuantifiquen.
- Sesgos conocidos: no disponibles. Al no documentarse el dataset de entrenamiento ni su procedencia, no es posible evaluar sesgos de dominio, de objetos o de entorno.
- Limitaciones de idioma: no disponibles, aunque un modelo de acción no plantea el mismo perfil multilingüe que un LLM.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que en principio permite uso comercial, pero la procedencia y las condiciones del modelo base y de los datos de entrenamiento no se detallan en este repositorio.
- Madurez del artefacto: cero descargas y cero «likes», publicado por un autor individual, sin revisión por pares ni informe técnico asociado.
- Uso en producción: desaconsejado con la información disponible, dado que no existe ninguna validación de éxito, seguridad ni robustez.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw30-v3-e3-1000-20261015
- Librería declarada openpi (referencia del ecosistema indicado en library_name): https://github.com/Physical-Intelligence/openpi
- No se han encontrado otros enlaces (papers, blogs, demos o repositorios adicionales) en la información proporcionada.
