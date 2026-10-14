# Donghyun1228/pi05-libero-main-module-lr-yaw30-v0p3-e30-1000-20261015

## Resumen

El modelo Donghyun1228/pi05-libero-main-module-lr-yaw30-v0p3-e30-1000-20261015 es un checkpoint de robótica publicado por el usuario Donghyun1228, etiquetado con las categorías openpi, robotics, libero e inverse-dynamics. Se trata de un candidato intermedio dentro de una búsqueda de hiperparámetros autorizada, no de un modelo final evaluado: la propia model card indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito.

Por el identificador y la librería asociada (openpi, la herramienta de Physical Intelligence para modelos de visión-lenguaje-acción de la familia pi0/pi0.5), el checkpoint parece corresponder a una política de manipulación robótica con un backbone VLM parcialmente congelado y un módulo "expert" dedicado a la generación de acciones. La model card confirma que el LLM permanece congelado y que solo se ajustan los multiplicadores de actualización de determinados módulos.

El interés del modelo es fundamentalmente de investigación: documenta una configuración concreta de hiperparámetros (yaw30, multiplicador de visión 0.3 tras Adam, multiplicador del expert 30.0, tamaño de lote 32, semilla 42, 1000 actualizaciones) sobre datos de contacto denso, y sirve como punto de partida para iteraciones posteriores. Su relevancia práctica es limitada mientras no haya resultados de evaluación públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; segun la nomenclatura y la libreria openpi, politica de vision-lenguaje-accion (VLA) con backbone LLM congelado y modulo "expert" de acciones |
| Parametros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica, no orientado a lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint de openpi (formato concreto no especificado; tamano de repo 7,7 GB) |

## Arquitectura y entrenamiento

El checkpoint pertenece a la librería openpi y emplea una arquitectura de tipo VLA en la que, según la model card, el LLM permanece congelado y el ajuste se concentra en módulos concretos: un módulo de visión y un módulo "expert". La model card describe el uso de "native graph", inicialización y normalización originales, y datos de contacto denso ("dense-contact data") junto con el pre-adapt original.

El entrenamiento documentado es un ajuste corto dentro de una búsqueda de hiperparámetros: 1000 actualizaciones sobre "raw999", tamaño de lote 32 y semilla 42. Los únicos elementos modificados respecto a la configuración base son los multiplicadores de actualización por módulo, con un multiplicador de visión de 0.3 tras Adam y un multiplicador del expert de 30.0. La model card indica que las ponderaciones congeladas han sido verificadas de forma independiente y que el resultado es un checkpoint "raw" completo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica (política de control) en el contexto del benchmark LIBERO.
- Modelado de dinámica inversa (inverse-dynamics), según las etiquetas del repositorio.
- Procesamiento conjunto de entradas visuales y de estado para producir comandos de acción.
- Ajuste selectivo de submódulos con backbone LLM congelado (el propio diseño del checkpoint demuestra esta capacidad de configuración).
- No se documentan capacidades de tool calling ni de function calling.
- No se documentan capacidades de agentes ni de razonamiento multi-paso de propósito general.
- No se documentan capacidades multilingües ni de otro tipo (audio, thinking mode, etc.).
- Evaluación pendiente: no se ha demostrado ninguna tasa de éxito en tareas.

## Casos de uso

- Investigación en manipulación robótica sobre LIBERO: el checkpoint se puede cargar en el pipeline de openpi y ejecutar episodios de evaluación del benchmark para comparar esta configuración de hiperparámetros frente a otras.
- Punto de partida para búsquedas de hiperparámetros: sirve como candidato intermedio cuyo cribado ("screening success") puede seleccionar variantes posteriores, según indica la model card.
- Estudio de estrategias de ajuste selectivo: al mantener el LLM congelado y modificar solo multiplicadores por módulo, es útil para analizar el efecto del learning rate diferencial en políticas VLA.
- Tareas de manipulación con contacto denso: los datos de contacto denso empleados lo orientan a escenarios donde el robot interactúa físicamente con objetos.
- Reproducción de experimentos: al estar fijados semilla (42), tamaño de lote (32) y número de actualizaciones (1000), permite reproducir una configuración concreta.
- Base para investigación en dinámica inversa: la etiqueta inverse-dynamics sugiere su uso en el estudio de la inferencia de acciones a partir de transiciones de estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación está pendiente y que no se reclama ninguna tasa de éxito ("Evaluation is pending; no success rate is claimed").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El tamaño del repositorio es de 7,7 GB, por lo que el peso del checkpoint (más estados del optimizador si se incluyen) se sitúa en ese orden de magnitud.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependería del tamaño final del modelo y de la cuantización, dato no especificado.
- Opciones de despliegue: la librería declarada es openpi; no se documentan otros runners (vLLM, llama.cpp, Ollama, TGI), que en cualquier caso no son el formato habitual para políticas de robótica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones de modelos comparables. De forma cualitativa, dentro de la familia de políticas VLA de openpi existen variantes como pi0 y pi0.5, y fuera de ella alternativas como OpenVLA, pero no se dispone en esta busqueda de sus parametros, contexto, rendimiento ni licencia para establecer una comparacion numerica fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw30 (este) | No disponible | No disponible | Evaluacion pendiente | apache-2.0 | HuggingFace |
| pi0 / pi0.5 (openpi) | No disponible | No disponible | No disponible | No disponible | No disponible |
| OpenVLA | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El propio autor indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito; no debe asumirse un rendimiento funcional.
- Sesgos conocidos: no documentados, pero al entrenarse sobre datos de manipulación concretos (contacto denso) heredará los sesgos de ese conjunto, no descrito.
- Riesgo de alucinación: en un modelo de política robótica el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado; no hay métricas que cuantifiquen ese riesgo.
- Limitaciones de contexto e idioma: no se documentan ventanas de contexto ni idiomas soportados; no es un modelo orientado a tareas de lenguaje.
- Licencia: apache-2.0, que en principio permite uso comercial, aunque el modelo es un checkpoint de investigación sin evaluación publicada.
- Advertencia para producción: al ser un candidato de búsqueda de hiperparámetros con 0 descargas y sin validación, no es adecuado para despliegue en producción hasta que existan resultados de evaluación reproducibles.
- La verificación independiente mencionada en la model card se refiere al congelado de pesos, no al rendimiento de la política.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw30-v0p3-e30-1000-20261015
- Librería openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- No se han encontrado otros enlaces (papers, blogs, demos) en la busqueda web proporcionada.
