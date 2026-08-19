# glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-reffix-shift5-g010-effgb32-100k

## Resumen

El modelo `glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-reffix-shift5-g010-effgb32-100k` es un checkpoint de inferencia de un modelo de visión-acción (VAM) basado en la arquitectura DiT4DiT, desarrollado por el usuario glory-hyeok. DiT4DiT es un framework que combina transformadores de generación de vídeo con predicción de acciones mediante flow-matching, orientado a la manipulación robótica generalizable. Este modelo específico ha sido entrenado en el entorno RoboCasa Kitchen, un simulador de cocinas a gran escala desarrollado por la Universidad de Texas en Austin, y su nombre indica que utiliza Wan2.2 como modelo de vídeo base, con destilación de flujo (fadistill) y un sampler de Euler con parámetros ajustados.

El checkpoint está diseñado exclusivamente para inferencia, excluyendo estados de optimizador, y ocupa 59.2 GB en formato safetensors. Se trata de un modelo de investigación en robótica, no de un modelo de lenguaje o multimodal generalista. Su relevancia radica en la aplicación de arquitecturas de difusión de vídeo al control robótico, permitiendo un aprendizaje de políticas de manipulación a partir de demostraciones simuladas. No se han publicado métricas de rendimiento ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT4DiT (Diffusion Transformer para visión-acción) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un MoE) |
| Longitud de contexto | no aplica (modelo de vídeo-acción) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (salida de acciones robóticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DiT4DiT es un framework de visión-acción (VAM) que integra un transformador de generación de vídeo con un modelo de flujo para la predicción de acciones. El modelo utiliza Wan2.2 como base de generación de vídeo, y el nombre "fadistill" sugiere que se ha aplicado destilización de flujo para acelerar la inferencia. El entrenamiento se realizó en el entorno RoboCasa Kitchen, que es parte del framework RoboCasa, un simulador a gran escala para tareas cotidianas en cocinas, con más de 2,500 escenarios y 365 tareas. El checkpoint excluye el estado de optimizador, lo que indica que está optimizado para inferencia. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre técnicas de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control robótico de manipulación en entornos de cocina simulados.
- Generación de secuencias de acciones a partir de observaciones visuales (vídeo).
- Integración con el framework DiT4DiT para control de cuerpo completo (whole-body) en humanoides.
- Inferencia eficiente mediante destilación de flujo y sampler de Euler.
- Soporte para tareas de manipulación en RoboCasa365 (365 tareas de cocina).

## Casos de uso

- Simulación de políticas robóticas para tareas de cocina: el modelo puede generar acciones de manipulación en el simulador RoboCasa, permitiendo entrenar y evaluar políticas antes de transferirlas a robots reales.
- Investigación en visión-acción para robótica: sirve como base para estudiar la combinación de generación de vídeo y control de acciones, especialmente en entornos realistas.
- Generación de demostraciones de vídeo-acción: puede utilizarse para sintetizar trayectorias de robot en la cocina, útiles para entrenamiento de otros modelos.
- Control de humanoides en simulación: al ser un VAM eficiente, podría aplicarse a tareas de cuerpo entero en robots humanoides dentro del simulador.
- Evaluación de arquitecturas de difusión para robótica: permite comparar el rendimiento de DiT4DiT con otras familias de políticas como Diffusion Policy o π0.
- Desarrollo de benchmarks de manipulación: su integración con RoboCasa365 puede servir para evaluar la generalización de políticas en entornos variados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está asociado al leaderboard de RoboCasa, que incluye comparaciones con políticas como Diffusion Policy, π0, π0.5 y GR00T N1.5, pero no se proporcionan métricas concretas para este checkpoint.

## Requisitos de hardware

- El tamaño del repositorio es de 59.2 GB, lo que sugiere que el modelo requiere una GPU con al menos 80 GB de VRAM para cargar en FP16 (posiblemente una A100, H100 o similar). No se especifica el número exacto de parámetros.
- Para inferencia en tiempo real, se requeriría una GPU de alta gama con soporte de precisión mixta. Dado que es un modelo de vídeo-acción, el consumo de memoria es considerable.
- No se dispone de información sobre latencia o throughput. Se recomienda utilizar frameworks como vLLM o TGI, aunque estos están más orientados a modelos de lenguaje; para modelos de difusión se suele usar PyTorch o TensorRT.
- No es apto para GPUs de consumo (como RTX 4090) a menos que se realice cuantización, pero no se ofrecen versiones cuantizadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Enfoque | Tamaño (desconocido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiT4DiT (este) | DiT + flow-matching | Visión-acción robótica | ~59 GB (repo) | no disponible | HuggingFace |
| π0 | Modelo de visión-acción con difusión | Manipulación generalista | no disponible | no disponible | Investigación |
| π0.5 | Variante de π0 | Manipulación generalista | no disponible | no disponible | Investigación |
| GR00T N1.5 | Modelo de robot humanoide | Manipulación generalista | no disponible | no disponible | Investigación |

Estos modelos aparecen en el leaderboard de RoboCasa, pero no se dispone de comparaciones numéricas.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación, sin licencia especificada, lo que puede limitar su uso comercial.
- No se han documentado sesgos o riesgos de alucinación, pero al ser un modelo de acciones robóticas, puede generar movimientos no seguros si se utiliza en el mundo real sin verificación.
- La ausencia de datos de entrenamiento y métricas dificulta evaluar su robustez.
- El modelo está entrenado específicamente en entornos de cocina de RoboCasa; su generalización a otros dominios es desconocida.
- Al excluir el estado de optimizador, no es adecuado para continuar entrenamiento.
- No se dispone de información sobre cuantización, lo que dificulta su despliegue en hardware limitado.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-reffix-shift5-g010-effgb32-100k)
- [HuggingFace modelo similar (i2v)](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-i2v-100k)
- [HuggingFace modelo con EMA ext](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-emaext-g001-effgb32-100k_padfix)
- [GitHub RoboCasa](https://github.com/robocasa/robocasa)
- [RoboCasa Leaderboard](https://robocasa.ai/leaderboard.html)
- [GitHub DiT4DiT](https://github.com/Mondo-Robotics/DiT4DiT)

(Nota: he corregido la URL del primer enlace porque en el prompt original estaba incompleta, pero usaré la que se proporcionó en la información. En realidad, la URL que se da es la correcta, solo que la he copiado bien. En la respuesta, debo usar la URL exacta que aparece en la información del usuario: https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-reffix-shift5-g010-effgb32-100k )

Además, en la sección de "Capacidades" y "Casos de uso" he escrito "entrenamiento" como "entrenamiento" correctamente. También he usado "destilización" pero debería ser "destilación" (con tilde). Corrijo: "destilación". En el resumen he puesto "destilización" - lo cambio a "destilación". En la arquitectura también "destilización" - lo cambio.

Reviso el texto final.## Resumen

El modelo `glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-reffix-shift5-g010-effgb32-100k` es un checkpoint de inferencia de un modelo de visión-acción (VAM) basado en la arquitectura DiT4DiT, desarrollado por el usuario glory-hyeok. DiT4DiT es un framework que combina transformadores de generación de vídeo con predicción de acciones mediante flow-matching, orientado a la manipulación robótica generalizable. Este modelo concreto ha sido entrenado en el entorno RoboCasa Kitchen, un simulador de cocinas realistas creado por la Universidad de Texas en Austin, y su nombre indica que utiliza Wan2.2 como base de vídeo, con destilación de flujo (fadistill) y sampler de Euler con ajustes específicos (shift y g).

El checkpoint está diseñado exclusivamente para inferencia, excluyendo el estado del optimizador, y ocupa 59.2 GB en formato safetensors. Se trata de un modelo de investigación en robótica, no de lenguaje ni multimodal. Su relevancia reside en la aplicación de técnicas de difusión de vídeo al control de acciones robóticas, lo que permite generar políticas de manipulación a partir de observaciones visuales. No se han publicado métricas de rendimiento ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT4DiT (Diffusion Transformer para visión-acción) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vídeo-acción) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (salida de acciones robóticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DiT4DiT es una arquitectura de visión-acción que combina un transformador de generación de vídeo con un modelo de flujo para la predicción de acciones. El modelo utiliza Wan2.2 como base de generación de vídeo, y la componente "fadistill" sugiere que se ha aplicado destilación de flujo para acelerar la inferencia. El entrenamiento se realizó en el entorno RoboCasa Kitchen, un simulador de gran escala que incluye más de 2,500 escenarios de cocina y 365 tareas cotidianas. El checkpoint excluye el estado del optimizador, lo que indica que está preparado para evaluación e inferencia, no para continuar el entrenamiento. No se han publicado detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que el modelo no es de lenguaje.

## Capacidades

- Control robótico de manipulación en entornos de cocina simulados.
- Generación de secuencias de acciones a partir de observaciones visuales (vídeo).
- Integración con el framework DiT4DiT para control de cuerpo entero (whole-body) en humanoides.
- Inferencia eficiente mediante destilación de flujo y sampler de Euler.
- Aplicación en el benchmark RoboCasa365, que abarca 365 tareas de cocina y 2.500 entornos.
- Compatibilidad con el simulador RoboCasa para entrenamiento y evaluación de políticas.

## Casos de uso

- Entrenamiento de políticas robóticas en simulación: el modelo puede generar acciones de control en RoboCasa Kitchen, permitiendo entrenar y evaluar políticas antes de transferirlas a robots reales.
- Investigación en visión-acción para robótica: sirve como base para estudiar la combinación de modelos de vídeo y control de acciones en entornos realistas.
- Síntesis de trayectorias de demostración: puede utilizarse para generar trayectorias de manipulación en la cocina, útiles para el entrenamiento de otros modelos o para generar datos aumentados.
- Control de humanoides en simulación: al ser un modelo eficiente de cuerpo entero, puede aplicarse a control de robots humanoides dentro del simulador.
- Evaluación de arquitecturas de difusión para robótica: permite comparar el rendimiento de DiT4DiT con otras familias de políticas como Diffusion Policy o π0.
- Desarrollo de pipelines de manipulación generalista: su integración con el leaderboard de RoboCasa facilita la evaluación de la generalización de políticas en múltiples tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está vinculado al leaderboard de RoboCasa, que incluye comparaciones con políticas como Diffusion Policy, π0, π0.5 y GR00T N1.5, pero no se proporcionan métricas concretas para este checkpoint.

## Requisitos de hardware

- El tamaño del repositorio es de 59.2 GB, lo que sugiere que el modelo requiere una GPU con al menos 80 GB de VRAM para inferencia en FP16 (por ejemplo, A100, H100 o H200). No se especifica el número exacto de parámetros.
- Para inferencia en tiempo real, se recomienda una GPU de alta gama con soporte de memoria mixta y gran ancho de banda.
- No se ofrecen versiones cuantizadas (GGUF, etc.) ni información sobre latencia o throughput.
- Las opciones de despliegue incluyen el uso de PyTorch o TensorRT, ya que los frameworks de inferencia para modelos de difusión son más limitados que los de lenguaje.
- No es viable en GPUs de consumo (como RTX 4090) sin cuantización, y no se ha proporcionado ninguna.

## Comparativa con modelos similares

| Modelo | Descripción | Enfoque | Tamaño (repo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiT4DiT (este) | Transformador de vídeo + flujo | Visión-acción robótica | ~59 GB | no disponible | HuggingFace |
| π0 | Modelo de visión-acción con flujo | Manipulación generalista | no disponible | no disponible | Investigación |
| π0.5 | Variante de π0 | Manipulación generalista | no disponible | no disponible | Investigación |
| GR00T N1.5 | Modelo de robot generalista | Manipulación generalista | no disponible | no disponible | Investigación |

Estos modelos aparecen en el leaderboard de RoboCasa, pero no se dispone de datos numéricos para comparaciones detalladas.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación sin licencia especificada, lo que puede restringir su uso comercial.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de robótica, puede generar movimientos no seguros si se usa en el mundo real sin supervisión.
- La ausencia de datos de entrenamiento y de métricas dificulta evaluar su robustez y generalización.
- El modelo está especializado en el entorno de cocina de RoboCasa; su comportamiento en otros dominios es desconocido.
- Al excluir el estado del optimizador, no es adecuado para continuar el entrenamiento.
- No se ofrecen versiones cuantizadas, lo que limita su despliegue en hardware con menos memoria.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-reffix-shift5-g010-effgb32-100k)
- [HuggingFace modelo i2v](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-i2v-100k)
- [HuggingFace modelo con EMA ext](https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-wan22-fadistillv2-euler-emaext-g001-effgb32-100k_padfix)
- [GitHub RoboCasa](https://github.com/robocasa/robocasa)
- [RoboCasa leaderboard](https://robocasa.ai/leaderboard.html)
- [GitHub DiT4DiT](https://github.com/Mondo-Robotics/DiT4DiT)
