# Fisher-Wang/lingbot-vla-v2-6b-libero-full-step6000

## Resumen

LingBot-VLA 2.0 6B es un modelo fundacional de visión-lenguaje-acción (VLA) desarrollado por el equipo de Robbyant, diseñado para conectar la percepción visual y la comprensión del lenguaje con el control robótico. Este checkpoint específico, `Fisher-Wang/lingbot-vla-v2-6b-libero-full-step6000`, es una versión afinada sobre las cuatro suites de LIBERO (40 tareas en total) a partir del modelo base `robbyant/lingbot-vla-v2-6b`, y está orientado a la evaluación de manipulación robótica en entornos simulados estandarizados.

El modelo resuelve el problema de generar acciones de control robótico directamente a partir de observaciones visuales y de instrucciones de tarea en lenguaje natural, sin necesidad de diseñar pipelines de percepción y planificación por separado. Su relevancia actual radica en que los VLA están emergiendo como el paradigma dominante en la robótica de manipulación, y LingBot-VLA 2.0 se distingue por su enfoque práctico: un pipeline de datos rediseñado con aproximadamente 60.000 horas de datos de preentrenamiento, de las cuales 50.000 son de demostración robótica.

Con 6.375 millones de parámetros y una licencia Apache 2.0, este modelo ofrece un equilibrio entre capacidad y accesibilidad, siendo un candidato adecuado para equipos de investigación y desarrollo que necesitan un modelo de manipulación robótica con licencia permisiva y resultados de evaluación en benchmarks estándar. El checkpoint evaluado en LIBERO alcanza un 85% de éxito medio en el conjunto de 40 tareas, con un rendimiento particularmente fuerte en las suites Spatial y Object.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Qwen3-VL |
| Parámetros totales | 6.375.907.511 (6,38 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards) |

## Arquitectura y entrenamiento

LingBot-VLA 2.0 se construye sobre la arquitectura Qwen3-VL, un modelo de lenguaje multimodal con capacidad de visión, adaptado para la salida de acciones robóticas. El modelo base ha sido preentrenado con un pipeline de datos rediseñado que incluye aproximadamente 60.000 horas de datos, de los cuales 50.000 horas son de dominio público, con el objetivo de mejorar la generalización entre tareas y morfologías robóticas. La innovación clave de LingBot-VLA 2.0 frente a la versión 1.0 es el entrenamiento sobre grados de libertad del cuerpo completo, lo que permite un control más preciso y estable en tareas de manipulación de alta precisión y objetos articulados.

El checkpoint `libero-full-step6000` se obtiene mediante ajuste fino conjunto sobre las cuatro suites de LIBERO (Spatial, Object, Goal y LIBERO-10), utilizando los datos completos de `lerobot/libero`, excluyendo LIBERO-Pro. El entrenamiento se evalúa con la política de cierre de bucle estándar, usando estados iniciales oficiales, prompts de tarea, semilla 7 y el número máximo de pasos estándar, con 5 episodios por tarea.

## Capacidades

- Manipulación robótica de alta precisión: el modelo genera acciones de control directamente desde observaciones visuales y instrucciones en lenguaje, sin planificadores intermedios.
- Comprensión visual de escenas y objetos: hereda las capacidades de visión de Qwen3-VL para identificar objetos, estados y relaciones espaciales.
- Ejecución de tareas de larga duración: soporta tareas de manipulación móvil de largo horizonte, como se indica en el sitio oficial.
- Adaptación a múltiples configuraciones robóticas: el preentrenamiento sobre grados de libertad completos permite adaptarse a diferentes morfologías de robots.
- Evaluación estandarizada en LIBERO: el modelo está optimizado para los benchmarks LIBERO, con resultados reportados en las cuatro suites.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información del modelo).

## 4. Casos de uso

- Investigación en robótica de manipulación: el modelo puede utilizarse como línea base para estudiar estrategias de aprendizaje por imitación, transferencia entre tareas y generalización a nuevas configuraciones del entorno.
- Desarrollo de robots domésticos: con su capacidad para entender instrucciones en lenguaje y ejecutar tareas de manipulación, es adecuado para probar tareas como ordenar objetos, abrir puertas o manipular objetos articulados en simuladores.
- Automatización de laboratorio: el modelo puede integrarse en entornos de simulación para validar algoritmos de control antes de implementarlos en hardware real, reduciendo el riesgo y el coste de pruebas físicas.
- Generación de datos de entrenamiento para políticas: puede utilizarse para generar trayectorias de acción en LIBERO que sirvan como datos de entrenamiento para modelos más pequeños o más eficientes.
- Benchmarking de VLA: los resultados en LIBERO proporcionan un punto de referencia para comparar futuras arquitecturas de VLA, ya que el modelo ofrece una referencia de rendimiento clara en las cuatro suites.
- Sistema de control en bucle cerrado para robots móviles: el modelo se puede integrar en sistemas de control en bucle cerrado para tareas de manipulación móvil de larga duración, donde la percepción y la acción están acopladas.

## 5. Benchmarks y rendimiento

La model card reporta los resultados de la evaluación en bucle cerrado estándar, con 5 episodios por tarea en cada suite de LIBERO (50 episodios por suite):

| Suite | Éxitos | Episodios | Tasa de éxito |
|---|---:|---:|---:|
| Spatial | 47 | 50 | 94% |
| Object | 50 | 50 | 100% |
| Goal | 36 | 50 | 72% |
| LIBERO-10 | 37 | 50 | 74% |
| **Total** | **170** | **200** | **85%** |

Se indica que esta es una puntuación de selección de checkpoint, no la puntuación final. Para comparaciones formales con π0.5, se requiere una evaluación con 50 episodios por tarea y 2000 episodios en total. No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval, GSM8K) en la información disponible.

## 6. Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6,38 mil millones de parámetros en fp32, lo que ocupa unos 25,5 GB. Con cuantización de 8 bits (fp8), la VRAM necesaria se reduce a aproximadamente 12-14 GB, y con cuantización de 4 bits (int4) a unos 6-8 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- GPU recomendadas: para inferencia con precisión completa, se recomienda una GPU con al menos 24 GB de VRAM, como una RTX 3090/4090 o una A10G. Para inferencia con cuantización, una RTX 3080/4080 con 12-16 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPU de consumo con cuantización, aunque el rendimiento puede verse limitado por la memoria disponible.
- Opciones de despliegue: al ser un modelo de transformers, puede desplegarse con frameworks como vLLM, TGI, o directamente con la librería `transformers` de Hugging Face. Para entornos robóticos, se puede integrar en el ecosistema de LeRobot.
- Latencia y throughput: no se han publicado datos de latencia o throughput en la información disponible.

## 7. Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento en LIBERO |
|---|---|---|---|---|---|
| LingBot-VLA 2.0 6B (este) | 6,38 mil millones | no disponible | Apache 2.0 | Hugging Face | 85% (40 tareas, 5 episodios por tarea) |
| π0.5 (pi-zero) | no disponible | no disponible | no disponible | no disponible | Se requiere evaluación formal de 2000 episodios |
| LingBot-VLA 1.0 | no disponible | no disponible | no disponible | disponible | no disponible |

No se dispone de información suficiente sobre otros modelos comparables en la misma categoría para realizar una comparación exhaustiva. La comparación con π0.5 se menciona en la documentación del modelo, pero no se proporcionan resultados oficiales de π0.5 en la información disponible.

## 8. Limitaciones y advertencias

- La evaluación del modelo se ha realizado en simulación (LIBERO) con un número limitado de episodios (5 por tarea). El rendimiento en el mundo real puede variar significativamente.
- No se han especificado los idiomas soportados ni la longitud de contexto del modelo, lo que limita la capacidad de evaluar su uso en aplicaciones multilingües o de contexto largo.
- No se proporcionan datos sobre sesgos o riesgos de alucinación del modelo. Como modelo de visión-lenguaje-acción, puede generar acciones incorrectas o no seguras si se utiliza en robots reales sin una validación exhaustiva.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el uso del modelo en sistemas de control críticos.
- El modelo requiere archivos adicionales de inferencia, como `norm_stats.json` y el procesador/tokenizador de Qwen3-VL, que deben estar disponibles para su correcto funcionamiento.
- El checkpoint de step 6000 es un candidato de selección, no la versión final. Puede que se publiquen versiones mejoradas en el futuro.

## 9. Enlaces

- Hugging Face: [Fisher-Wang/lingbot-vla-v2-6b-libero-full-step6000](https://huggingface.co/Fisher-Wang/lingbot-vla-v2-6b-libero-full-step6000)
- Modelo base: [robbyant/lingbot-vla-v2-6b](https://huggingface.co/robbyant/lingbot-vla-v2-6b)
- Repositorio de código: [GitHub - Robbyant/lingbot-vla-v2](https://github.com/Robbyant/lingbot-vla-v2)
- Repositorio de código (v1): [GitHub - Robbyant/lingbot-vla](https://github.com/Robbyant/lingbot-vla)
- Página del producto: [LingBot-VLA 2.0 Foundation Model](https://technology.robbyant.com/lingbot-vla-v2)
- Otro checkpoint de la misma serie: [Fisher-Wang/lingbot-vla-v2-6b-libero-goal](https://huggingface.co/Fisher-Wang/lingbot-vla-v2-6b-libero-goal)
- Dataset: [lerobot/libero](https://huggingface.co/datasets/lerobot/libero)
