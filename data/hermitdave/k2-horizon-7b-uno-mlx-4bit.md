# hermitdave/K2-Horizon-7B-Uno-MLX-4bit

## Resumen
K2-Horizon-7B-Uno-MLX-4bit es una cuantización uniforme a 4 bits del modelo IFM/K2-Horizon-7B-Uno, creada por hermitdave para el ecosistema MLX de Apple Silicon. El modelo original, desarrollado por el Institute of Foundation Models, es un LLM aumentado con difusión ("diffusion-augmented") que incorpora un adaptador LoRA ya fusionado en los pesos base, lo que permite ejecutarlo como un modelo autoregresivo estándar. Esta versión 4-bit reduce el coste de memoria y computación para hacer factible su uso en Macs con Apple Silicon, manteniendo la misma arquitectura y capacidad de razonamiento.

El modelo destaca por ser un modelo de razonamiento que requiere un uso explícito de `reasoning_effort="high"` para obtener respuestas de mayor calidad. Con aproximadamente 9 000 millones de parámetros (8 999 178 240), se sitúa en un rango intermedio apto para inferencia en hardware de consumo o estaciones de trabajo. La disponibilidad bajo licencia Apache 2.0 facilita su integración en proyectos comerciales y de investigación.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LLM autoregresivo con componente de difusion (diffusion-augmented), basado en K2-Horizon-7B |
| Parametros totales | 8 999 178 240 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Uniform 4-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, compatible con mlx-lm) |

## Arquitectura y entrenamiento
La arquitectura exacta no se detalla en la informacion disponible, pero el autor describe el modelo como un LLM aumentado con difusion ("diffusion-augmented LLM"). Esto sugiere que el modelo combina una fase generativa autoregresiva con algun mecanismo de difusion, aunque tras la fusion del adaptador LoRA se comporta como un modelo autoregresivo estandar. El peso base procede de IFM/K2-Horizon-7B-Uno, cuya version original incluye un adaptador LoRA que ha sido fusionado en esta cuantizacion. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens ni procesos como RLHF o DPO.

## Capacidades
- Generacion de texto autoregresiva.
- Razonamiento paso a paso, especialmente indicado para tareas que requieren descomponer problemas complejos. El autor recomienda usar `reasoning_effort="high"` para obtener mejores resultados.
- Soporte para ejecucion local en Apple Silicon mediante MLX.
- Compatible con el cliente OpenAI a traves de una API local, permitiendo recuperar el contenido de razonamiento (`reasoning_content`).
- No se documentan capacidades de vision, audio, tool calling ni soporte explicito para agentes.

## Casos de uso
- Asistencia en resolucion de problemas matematicos y logicos: el modelo puede descomponer enunciados y mostrar el razonamiento paso a paso, lo que resulta util en plataformas educativas o herramientas de estudio.
- Depuracion de codigo: gracias a su capacidad de razonamiento, puede analizar fragmentos de codigo, identificar errores logicos y explicar la causa de fallos en entornos de desarrollo locales.
- Analisis de documentos tecnicos: puede resumir informes, extraer conclusiones o responder preguntas sobre documentacion cientifica y tecnica en un entorno controlado en Macs.
- Generacion de explicaciones didacticas: sirve para crear material formativo con justificaciones detalladas, especialmente en campos como fisica, matematicas o programacion.
- Prototipado de asistentes conversacionales: al integrarse con una API OpenAI-compatible, puede usarse como base de chatbots de razonamiento en flujos de trabajo locales sin depender de servicios en la nube.
- Investigacion en modelos de razonamiento: la disponibilidad del formato MLX y la cuantizacion 4-bit permiten experimentar con tecnicas de razonamiento en entornos academicos o de prototipado rapido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- La ejecucion requiere hardware Apple Silicon (M1, M2, M3, M4 o posteriores) debido al formato MLX.
- La cuantizacion 4-bit deberia permitir la inferencia en Macs con 16 GB de memoria unificada o superior, aunque este dato no se confirma oficialmente.
- No se han publicado requisitos especificos de VRAM, GPU ni latencia.
- Es necesario oMLX v0.6.4 o superior con el parche de soporte para K2-Horizon incluido en el pull request indicado en los enlaces.
- Opciones de despliegue: `mlx-lm` para generacion por linea de comandos y entornos OpenAI-compatibles via servidor local.

## Comparativa con modelos similares
No disponible. No se dispone de datos comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias
- No se han evaluado los sesgos del modelo ni se dispone de informacion sobre su comportamiento en dominios especificos.
- Al tratarse de una cuantizacion 4-bit, puede haber una perdida de precision frente al modelo original en tareas que requieran alta exactitud numerica o linguistica.
- La dependencia de oMLX con un parche especifico puede limitar la portabilidad a otras herramientas o frameworks.
- El riesgo de alucinacion es inherente a los modelos de lenguaje de este tipo; se recomienda validar las respuestas en aplicaciones criticas.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario revisar las condiciones de la licencia y las del modelo base.
- No se han publicado datos sobre los idiomas soportados ni sobre el rendimiento en tareas multilingues.

## Enlaces
- Repositorio del modelo: https://huggingface.co/hermitdave/K2-Horizon-7B-Uno-MLX-4bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Parche de soporte para oMLX: https://github.com/jundot/omlx/pull/3441
