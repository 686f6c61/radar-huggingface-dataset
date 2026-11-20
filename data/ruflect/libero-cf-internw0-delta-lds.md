# RuFlect/LIBERO-CF-InternW0-Delta-LDS

## Resumen

LIBERO-CF-InternW0-Delta-LDS es una política de robótica (policy) publicada por RuFlect, un fine-tuning del modelo InternRobotics/InternW0-Delta-Libero sobre el conjunto de tareas LIBERO-CF. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de control visuomotor entrenado para ejecutar tareas de manipulación en el benchmark LIBERO-CF, con supervisión adicional mediante Linear Decodability Supervision (LDS) en su variante "Fine". El checkpoint publicado corresponde al paso de entrenamiento 1473 y es la política "all-train" empleada en la evaluación principal del benchmark.

El modelo se construye sobre el runtime de InternW0-Delta para LIBERO y congela dos componentes auxiliares: Wan-AI/Wan2.2-TI2V-5B, un modelo de generación vídeo/imagen de 5.000 millones de parámetros, y Alibaba-DAMO-Academy/RynnBrain1.1-2B, un modelo de 2.000 millones de parámetros. La supervisión LDS añade cabezas auxiliares que se descartan en inferencia, de modo que el artefacto desplegable es únicamente el fichero `internw0_delta_libero.pt` junto con `dataset_stats.json` y `native_config.yaml`.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigar si la supervisión de decodificabilidad lineal mejora la representación interna de políticas visuomotoras en tareas de manipulación de largo horizonte, y permite a otros grupos comparar sus propios entrenamientos contra un checkpoint con identidad y procedencia verificadas mediante `SHA256SUMS` y `model-release.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visuomotora derivada de InternW0-Delta (runtime LIBERO) con cabezas auxiliares LDS; componentes congelados Wan2.2-TI2V-5B y RynnBrain1.1-2B |
| Parametros totales | no disponible (el repo ocupa 12,4 GB; los componentes congelados suman aproximadamente 7.000 millones de parámetros, pero el recuento exacto del checkpoint no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de la memoria nativa del runtime LIBERO, no declarada) |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint `.pt` en precisión nativa) |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), más `dataset_stats.json` y `native_config.yaml` |

## Arquitectura y entrenamiento

El modelo es una política de manipulación construida sobre el runtime InternW0-Delta para LIBERO. InternW0-Delta combina, por lo que se deduce de los activos congelados declarados, un backbone de generación vídeo/imagen (Wan2.2-TI2V-5B) con un backbone lingüístico/visual (RynnBrain1.1-2B), ambos mantenidos en modo congelado durante el fine-tuning. Sobre esa base se entrena la política de acción con el códec de acciones, cámara y memoria nativo de LIBERO, que debe conservarse tal cual según la model card.

El entrenamiento incorpora Linear Decodability Supervision (LDS) en variante "Fine": cabezas auxiliares que fuerzan la representación interna a ser linealmente decodificable respecto a la supervisión de localización disponible. Estas cabezas se descartan en inferencia, por lo que no afectan al coste de despliegue. Esta versión concreta es la política "all-train", es decir, utiliza todas las escenas de supervisión de localización disponibles y no representa un split de escenas retenidas; el autor la distingue explícitamente de la política de RoboTwin-IF y de la política de generalización con escenas retenidas. El checkpoint liberado corresponde al paso 1473 y no incluye estado del optimizador ni cachés de entrenamiento. No se declaran en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control visuomotor para tareas de manipulación robótica en el benchmark LIBERO-CF, con observaciones de cámara y ejecución de secuencias de acciones.
- Memoria y códec de acciones nativos del runtime LIBERO, lo que permite mantener consistencia temporal en tareas de largo horizonte.
- Representaciones internas optimizadas para decodificabilidad lineal gracias a la supervisión LDS, orientadas a facilitar el análisis de interpretabilidad de la política.
- Integración con los componentes congelados Wan2.2-TI2V-5B y RynnBrain1.1-2B como sustrato visual y semántico.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión generalista, audio ni modo "thinking".
- No se declaran capacidades multilingües.

## Casos de uso

- Evaluación reproducible en LIBERO-CF: cargar `internw0_delta_libero.pt` en el runtime upstream de InternW0-Delta y reproducir la evaluación principal del benchmark, usando `model-release.json` para verificar la identidad exacta del checkpoint y el paso de entrenamiento.
- Investigación en interpretabilidad de políticas: la supervisión LDS está diseñada para que las representaciones internas sean linealmente decodificables, lo que permite entrenar sondas lineales sobre las activaciones para estudiar qué información de localización codifica la política sin reentrenar el modelo.
- Comparación de métodos de supervisión auxiliar: sirve como línea base "all-train" frente a variantes con escenas retenidas u otras formulaciones de LDS, aislando el efecto de la supervisión en el rendimiento de manipulación.
- Reproducción de experimentos con activos congelados: al fijar Wan2.2-TI2V-5B y RynnBrain1.1-2B como dependencias congeladas, facilita que otros grupos repliquen el pipeline sin ambigüedad sobre las versiones de los backbones.
- Desarrollo de pipelines de inferencia robótica: el checkpoint puede integrarse en el runtime InternW0 para probar el bucle percepción-acción en entornos simulados LIBERO antes de trasladar la política a configuraciones reales.
- Auditoría de artefactos de investigación: `SHA256SUMS` cubre todos los ficheros de la release, lo que permite verificar la integridad de la descarga en entornos de CI o en réplicas de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que este checkpoint es la política "all-train" usada en la evaluación principal del benchmark LIBERO-CF, pero no incluye tasas de éxito ni métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 12,4 GB, y los backbones congelados declarados suman aproximadamente 7.000 millones de parámetros, por lo que se requiere una GPU con memoria holgada incluso en precisión nativa.
- GPU recomendadas: no declaradas por el autor; por el tamaño de los componentes congelados, se sitúa en la gama de A100, H100 o GPUs de 24 GB o más, sin confirmación oficial.
- ¿Cabe en GPU de consumo? No confirmado. Un checkpoint de 12,4 GB en `.pt` no cabe en GPUs de 8-12 GB sin cuantización, y no se documentan recetas de cuantización.
- Opciones de despliegue: runtime upstream de InternW0 (https://github.com/InternRobotics/InternW0) con el código LDS de RuFlect; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LIBERO-CF-InternW0-Delta-LDS | no disponible | no disponible | no publicado | Apache 2.0 | Hugging Face (0 descargas) |
| InternRobotics/InternW0-Delta-Libero (base) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Política RoboTwin-IF del mismo autor | no disponible | no disponible | no disponible | no disponible | mencionada, sin enlace |
| Política de generalización con escenas retenidas | no disponible | no disponible | no disponible | no disponible | mencionada, sin enlace |

No se dispone de datos numéricos para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K, ni usarse para generación de texto.
- El checkpoint es la política "all-train": utiliza todas las escenas de supervisión de localización disponibles y no constituye una evaluación de generalización a escenas no vistas. El autor lo advierte explícitamente.
- Depende de activos congelados concretos (Wan2.2-TI2V-5B y RynnBrain1.1-2B); cambiar sus versiones puede invalidar la reproducibilidad.
- Requiere conservar la configuración nativa de cámara, memoria y códec de acciones de LIBERO; desviarse de ella puede degradar el comportamiento.
- Las cabezas LDS se descartan en inferencia: cualquier análisis de decodificabilidad debe realizarse con el código LDS y no con el checkpoint desplegado únicamente.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al ser una política de robótica, los fallos se manifiestan como acciones incorrectas o bloqueos, no como texto erróneo.
- Licencia Apache 2.0 permite uso comercial, pero la licencia de los backbones congelados (Wan2.2-TI2V-5B y RynnBrain1.1-2B) debe verificarse por separado antes de un despliegue productivo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación independiente.
- No se publican métricas de éxito en LIBERO-CF, por lo que no es posible estimar su rendimiento real sin ejecutar la evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/RuFlect/LIBERO-CF-InternW0-Delta-LDS
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-Libero
- Implementación upstream de InternW0: https://github.com/InternRobotics/InternW0
- Código LDS: https://github.com/RuFlect-Intelligence/Linear-Decodability-Supervision
- Activo congelado Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Activo congelado RynnBrain1.1-2B: https://huggingface.co/Alibaba-DAMO-Academy/RynnBrain1.1-2B
