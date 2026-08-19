# nvidia/Cosmos3-Edge

## Resumen

Cosmos3-Edge es un modelo de mundo omnimodal desarrollado por NVIDIA, presentado el 20 de julio de 2026 en SIGGRAPH como parte de la familia Cosmos 3. Está diseñado para Physical AI: permite a máquinas comprender, simular e interactuar con el mundo físico a través de la generación conjunta de texto, imágenes, vídeo, audio y trayectorias de acción. Con aproximadamente 3,86 mil millones de parámetros (según los pesos reales en safetensors), es el modelo más pequeño de la gama Cosmos3 y el primero de la serie pensado para ejecutarse en tiempo real en hardware de borde (edge), como módulos del tamaño de un libro de bolsillo.

Su arquitectura, denominada Mixture-of-Transformers (MoT), combina dos torres transformer: una autoregresiva para generación de tokens discretos (texto) y otra de difusión para la síntesis de modalidades continuas (imagen, vídeo, audio y acciones). Esta unificación permite modelar todas las modalidades en un único marco sin sacrificar el mecanismo de generación más adecuado para cada una. El modelo acepta entradas de texto, imagen, vídeo y trayectorias de acción, y produce salidas coherentes en cualquiera de esas modalidades, lo que lo convierte en una pieza fundamental para robótica, conducción autónoma y entornos industriales inteligentes.

La relevancia de Cosmos3-Edge radica en su capacidad para llevar la generación de mundos físicos a dispositivos con recursos limitados, algo que hasta ahora solo era viable con modelos mucho más grandes (16B o 64B). Su licencia OpenMDW1.1 permite uso comercial y no comercial, y está disponible de forma abierta en Hugging Face con más de 237.000 descargas, lo que refleja un interés temprano considerable por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT): torre autoregresiva + torre de difusión |
| Parametros totales | 3.858.999.728 (según safetensors; la model card indica 4B) |
| Parametros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (tamaño del repo: 29,5 GB) |

## Arquitectura y entrenamiento

Cosmos3-Edge se basa en una arquitectura Mixture-of-Transformers (MoT), un diseño propio de NVIDIA que combina dos torres transformer complementarias. La primera es un transformer autoregresivo que genera tokens discretos, utilizado para la producción de texto mediante decodificación estándar de siguiente token. La segunda es un transformer de difusión que sintetiza modalidades continuas (imagen, vídeo, audio y acciones) mediante un proceso iterativo de denoising. Esta separación permite que cada modalidad utilice el mecanismo de generación más natural, mientras se mantiene una representación unificada en un solo modelo.

El modelo se desarrolló sobre el Cosmos Framework (github.com/nvidia/cosmos-framework) y forma parte de una colección más amplia que incluye variantes de 16B (Cosmos3-Nano) y 64B (Cosmos3-Super). No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible. Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura MoT y la capacidad de ejecución en edge.

## Capacidades

- Generación omnimodal: produce texto, imágenes, vídeo, audio y trayectorias de acción a partir de combinaciones de entradas multimodales.
- Comprensión multimodal: interpreta texto, imágenes, vídeo y trayectorias de acción como entrada, lo que permite tareas de razonamiento sobre el mundo físico.
- Simulación de mundo: genera predicciones de futuros estados del entorno (vídeo y acciones) a partir de observaciones actuales.
- Razonamiento de acciones: dado un estado visual y una instrucción, puede generar trayectorias de acción para control de robots y sistemas autónomos.
- Ejecución en tiempo real: diseñado para correr en hardware de borde, con latencias compatibles con control en bucle cerrado.
- Soporte de policy learning: la variante Cosmos3-Edge-Policy-DROID (también de 4B) está especializada en generar acciones de manipulación a partir de instrucciones y observaciones de la plataforma DROID.

## Casos de uso

- Control de robots de manipulación: el modelo puede recibir una instrucción en lenguaje natural y una imagen de la escena, y generar una trayectoria de acción para el brazo robótico, lo que permite programación por demostración o por comandos de alto nivel sin necesidad de ingeniería de control manual.
- Conducción autónoma: a partir de secuencias de vídeo del entorno y datos de telemetría, Cosmos3-Edge puede predecir los próximos fotogramas y generar comandos de dirección y aceleración, facilitando la planificación de maniobras en tiempo real.
- Simulación de entornos industriales: en fábricas inteligentes, el modelo puede simular el movimiento de maquinaria y el flujo de materiales, permitiendo probar configuraciones de planta sin coste físico.
- Entrenamiento de políticas con datos sintéticos: genera trayectorias de acción y vídeos sintéticos para aumentar conjuntos de datos de aprendizaje por refuerzo, reduciendo la necesidad de recopilación de datos en el mundo real.
- Asistentes de realidad aumentada: al comprender la escena visual y las instrucciones del usuario, puede generar instrucciones de guiado o superposiciones de vídeo que muestren los siguientes pasos en una tarea de ensamblaje o mantenimiento.
- Predicción de futuros estados en logística: dado el estado actual de un almacén (imágenes de estanterías, posiciones de vehículos), el modelo puede anticipar movimientos y optimizar rutas de picking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de evaluación comparativa (MMLU, HumanEval, GSM8K, etc.) ni métricas específicas de calidad de vídeo o acción. Tampoco se han encontrado referencias externas con cifras verificables en los resultados de búsqueda. Se recomienda consultar el white paper técnico de Cosmos 3 (enlace en la sección de enlaces) para posibles datos adicionales, aunque no se ha confirmado su disponibilidad.

## Requisitos de hardware

- Tamaño del modelo: ~3,86B parámetros en safetensors, lo que implica un peso bruto de aproximadamente 7,7 GB en FP16 (cálculo estimado, no oficial).
- El blog de NVIDIA indica que es capaz de ejecutarse en hardware de borde, con un módulo del tamaño de un libro de bolsillo, lo que sugiere que es viable en dispositivos embebidos con aceleradores dedicados.
- No se especifican requisitos exactos de VRAM ni GPUs recomendadas en la documentación proporcionada.
- Dado su tamaño, es plausible que pueda ejecutarse en GPUs de consumo como RTX 4090 (24 GB) con cuantización, pero no hay datos oficiales al respecto.
- Opciones de despliegue: no se mencionan frameworks de inferencia específicos (vLLM, llama.cpp, Ollama, TGI). La librería asociada es `cosmos`, disponible en el repositorio de GitHub de NVIDIA.

## Comparativa con modelos similares

La familia Cosmos 3 incluye tres tamaños: Edge (4B), Nano (16B) y Super (64B). La siguiente tabla compara las variantes de la misma familia, ya que no se dispone de información sobre modelos externos comparables en la misma categoría de world models de borde.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Cosmos3-Edge | 3,86B | no disponible | texto, imagen, vídeo, audio, acciones | OpenMDW1.1 | safetensors |
| Cosmos3-Nano | 16B | no disponible | texto, imagen, vídeo, audio, acciones | OpenMDW1.1 | safetensors |
| Cosmos3-Super | 64B | no disponible | texto, imagen, vídeo, audio, acciones | OpenMDW1.1 | safetensors |

No se han encontrado modelos de otras organizaciones con especificaciones directamente comparables (world models omnimodales de ~4B con ejecución en edge) en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni riesgos de alucinación específicos para este modelo en la información disponible.
- La longitud de contexto no está especificada, lo que dificulta estimar su capacidad para manejar secuencias largas de vídeo o múltiples imágenes.
- Los idiomas soportados no se indican; se desconoce si el modelo funciona correctamente en español u otros idiomas distintos del inglés.
- La licencia OpenMDW1.1 debe revisarse en detalle (openmdw.ai/license/1-1/) para comprender las obligaciones de atribución, restricciones de uso comercial y cláusulas de responsabilidad.
- No hay información sobre cuantizaciones oficiales ni sobre el comportamiento del modelo con pesos reducidos, lo que puede afectar a su despliegue en hardware con memoria limitada.
- El modelo está orientado a Physical AI; su uso fuera de este dominio (por ejemplo, generación de texto general) no está validado y podría producir resultados inconsistentes.
- Al ser un modelo relativamente nuevo (lanzado en julio de 2026), la documentación y los casos de uso en producción aún son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Edge
- Blog de NVIDIA en Hugging Face: https://huggingface.co/blog/nvidia/cosmos3edge
- Página de Cosmos 3 en NVIDIA Research: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- White paper técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Repositorio de código: https://github.com/nvidia/cosmos
- Colección de modelos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Guía completa en buildfastwithai.com: https://www.buildfastwithai.com/blogs/nvidia-cosmos-3-edge-complete-guide-2026
