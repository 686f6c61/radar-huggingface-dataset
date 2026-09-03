# Muse-Ltd/Muse-Robotics-1.1

## Resumen

Muse-Robotics-1.1 es un modelo de visión-lenguaje-acción (VLA) desarrollado por Muse-Ltd para manipulación robótica condicionada por instrucciones en lenguaje natural. Se trata de una evolución del modelo Muse-Robotics-1, con un ajuste fino más prolongado sobre un conjunto sustancialmente mayor de demostraciones reales y con aumento de instrucciones que le proporciona cobertura multilingüe práctica en siete idiomas: inglés, chino, español, alemán, francés, japonés y coreano.

El modelo mantiene una arquitectura compacta de aproximadamente 120 millones de parámetros (121.710.745 exactamente), entrenada de extremo a extremo desde una inicialización aleatoria. Consume dos vistas de cámara RGB de 224×224 píxeles, un vector de estado propioceptivo y una instrucción de texto arbitraria (que puede estar vacía), y produce un fragmento de acción de dieciséis pasos. Su diseño integra un codificador visual compartido para ambas cámaras, un codificador de lenguaje con tokenizador BPE a nivel de byte, una pila de fusión "perceive" de doce capas y una etapa de deliberación mediante tokens de plan latente, todo ello entrenado conjuntamente con el objetivo de control.

La relevancia actual de este modelo radica en su tamaño reducido y su capacidad multilingüe, lo que lo hace adecuado para despliegue en hardware modesto y para entornos de investigación donde se requiera un VLA entrenable de extremo a extremo sin depender de backbones preentrenados masivos. Su licencia MIT permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con Vision Transformer compartido, codificador de lenguaje bidireccional de 6 capas, pila de fusión "perceive" de 12 capas y deliberación con 8 tokens de plan latente |
| Parametros totales | 121.710.745 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (procesa dos imágenes de 224×224 y una secuencia de tokens de instrucción; no se especifica un límite explícito) |
| Tipos de cuantizacion | no disponible (no se mencionan en la documentación) |
| Idiomas soportados | en, zh, es, de, fr, ja, ko |
| Licencia | MIT |
| Formato de pesos | safetensors (según tags y tamaño del repositorio de 0,5 GB) |

## Arquitectura y entrenamiento

Muse-Robotics-1.1 emplea una arquitectura totalmente entrenable de extremo a extremo, sin backbones preentrenados. Cada imagen de cámara se divide en parches de 16×16 píxeles, se proyectan linealmente a tokens y se les añaden codificaciones posicionales sinusoidales que preservan la disposición 2D. Un único Vision Transformer de escala pequeña procesa ambas vistas (exterior y muñeca) con pesos compartidos, lo que fomenta características invariantes a la perspectiva, mientras que una incrustación de tipo de vista aprendida permite distinguir las cámaras.

Las instrucciones se codifican con un tokenizador byte-level BPE de tamaño 8192, con símbolos dedicados para padding, límites de secuencia y la instrucción vacía. Un transformer bidireccional de seis capas produce representaciones contextuales de los word pieces, con enmascaramiento de atención para que el padding no influya. El codificador de lenguaje está alineado en ancho con el codificador visual para permitir la concatenación directa sin cuellos de botella de proyección.

Los tokens visuales, lingüísticos y el token de estado proyectado se concatenan en una secuencia heterogénea, con incrustaciones de tipo y espaciales aprendidas. Esta secuencia se procesa mediante una pila "perceive" de doce capas con pre-normalización y expansión feed-forward de factor cuatro, que construye una memoria compartida de dependencias cruzadas entre modalidades.

La etapa de deliberación utiliza ocho tokens de plan latente aprendidos, que se refinan mediante tres iteraciones de un bloque transformer compartido. Cada iteración aplica auto-atención entre los tokens de plan, atención cruzada hacia la memoria "perceive" y una actualización feed-forward, con incrustaciones de iteración aprendidas que diferencian cada paso. El plan final condiciona un generador de acciones que produce un fragmento de dieciséis pasos. Todo el modelo se entrena conjuntamente con el objetivo de control, y la normalización de estado y acción se incorpora en la configuración publicada, de modo que el consumidor recibe comandos en el espacio nativo del robot.

El entrenamiento se realizó mediante ajuste fino prolongado desde la inicialización de la versión 1.0, con un conjunto ampliado de demostraciones reales y aumento de instrucciones multilingüe. No se especifican el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de acciones de manipulación robótica: produce fragmentos de acción de dieciséis pasos a partir de observaciones visuales, estado propioceptivo e instrucciones de texto.
- Comprensión multilingüe de instrucciones: soporta siete idiomas (en, zh, es, de, fr, ja, ko) mediante manejo a nivel de byte y aumento de traducción en el entrenamiento, sin necesidad de tokenizadores o modelos separados por idioma.
- Procesamiento de dos vistas de cámara: integra simultáneamente imágenes de una vista exterior y una vista de muñeca, con pesos compartidos para aprender características invariantes a la perspectiva.
- Manejo explícito de instrucciones vacías: la política puede operar sin instrucción textual, tratándola como una entrada válida en lugar de un error.
- Razonamiento interno mediante tokens de plan latente: la etapa de deliberación con tres iteraciones de un bloque compartido permite una forma de razonamiento implícito antes de generar acciones.
- Entrenamiento de extremo a extremo: todos los parámetros (visión, lenguaje, fusión, deliberación y generación de acciones) se actualizan conjuntamente, sin dependencia de backbones preentrenados.
- Normalización integrada: el modelo denormaliza internamente las acciones, por lo que el consumidor recibe comandos en el espacio nativo del robot sin necesidad de estadísticas del dataset.

## Casos de uso

- Control de brazos robóticos en laboratorios de investigación: el modelo puede ejecutar tareas de manipulación como coger, colocar o empujar objetos a partir de instrucciones en lenguaje natural, gracias a su salida de dieciséis pasos de acción y su procesamiento de dos vistas de cámara. Su tamaño reducido permite iterar rápidamente en entornos de experimentación.
- Automatización de tareas de pick-and-place en líneas de producción: con su capacidad multilingüe, puede recibir órdenes en varios idiomas sin reentrenamiento, lo que facilita su integración en entornos industriales con equipos diversos. La licencia MIT permite su uso comercial sin restricciones.
- Robótica educativa y prototipado: al ser un modelo de solo 120 millones de parámetros, puede ejecutarse en GPUs de gama media o incluso en CPU para demostraciones, lo que lo hace adecuado para cursos de robótica y aprendizaje por refuerzo.
- Investigación en aprendizaje de políticas visomotoras: su arquitectura totalmente entrenable desde cero permite estudiar el efecto de la co-entrenamiento de visión, lenguaje y control sin la influencia de representaciones preentrenadas, lo que resulta útil para publicaciones y tesis.
- Sistemas de asistencia a la manipulación en entornos domésticos: un robot equipado con este modelo podría interpretar comandos como "abre el cajón" o "coge la taza" en español, inglés o japonés, gracias a su soporte multilingüe y su manejo de instrucciones vacías para tareas autónomas.
- Desarrollo de agentes robóticos con razonamiento de alto nivel: la etapa de deliberación con tokens de plan latente permite que el modelo internalice el objetivo antes de actuar, lo que puede aprovecharse en tareas que requieren planificación de múltiples pasos, como apilar bloques o ensamblar piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como tasas de éxito en tareas de manipulación, ni comparaciones con otros modelos VLA. Se recomienda consultar el repositorio oficial o publicaciones futuras para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 121,7 millones de parámetros, el modelo ocupa aproximadamente 487 MB en FP32 (121.710.745 × 4 bytes). Con cuantización a 8 bits, el peso se reduciría a unos 122 MB, aunque no se documentan formatos de cuantización oficiales. En la práctica, cabría en cualquier GPU con al menos 1 GB de VRAM, incluidas tarjetas integradas modernas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) sería suficiente para inferencia. Para entrenamiento de extremo a extremo, se recomienda al menos 8 GB de VRAM (RTX 3070 o superior) para manejar los lotes y el gradiente.
- Compatibilidad con consumer GPU: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama baja e incluso en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo PyTorch con pesos en safetensors, puede servirse con frameworks estándar como vLLM (si se adapta a la interfaz de generación de acciones), o mediante scripts personalizados en PyTorch. No se menciona soporte nativo para llama.cpp, Ollama o TGI, pero al ser un modelo denso y pequeño, podría convertirse a ONNX o TensorRT para optimización.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño, se espera una latencia de decenas de milisegundos por paso de control en una GPU moderna, pero estos valores dependen del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. Sin embargo, se pueden mencionar alternativas conocidas en la categoría de VLA:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Robotics-1.1 | 121,7 M | no disponible | 7 (en, zh, es, de, fr, ja, ko) | MIT | HuggingFace |
| OpenVLA | 7 B | 2048 tokens | principalmente inglés | MIT | HuggingFace |
| RT-2 (Google) | 55 B | no disponible | inglés | propietaria | no público |

Muse-Robotics-1.1 se distingue por su tamaño mucho menor (120 M frente a 7 B o 55 B), lo que permite despliegue en hardware modesto y entrenamiento desde cero. Su soporte multilingüe es más amplio que el de OpenVLA, que se centra en inglés. No obstante, al no haber benchmarks publicados, no es posible comparar el rendimiento en tareas de manipulación real.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con demostraciones reales, el modelo puede heredar sesgos presentes en los datos, como preferencias por ciertos objetos o configuraciones de escena. No se documentan evaluaciones de sesgo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede malinterpretar instrucciones ambiguas o generar acciones incoherentes si la entrada visual no coincide con el contexto lingüístico. En robótica, esto puede provocar movimientos inseguros; se recomienda supervisión humana en entornos reales.
- Limitaciones de contexto: no se especifica la longitud máxima de la secuencia de tokens, pero al procesar dos imágenes de 224×224 (196 parches cada una) más tokens de lenguaje, el contexto efectivo es limitado. Instrucciones muy largas o múltiples turnos podrían no ser manejables.
- Limitaciones de idioma: aunque soporta siete idiomas, la cobertura puede ser desigual según la cantidad de datos de entrenamiento por idioma. El español, alemán, francés, japonés y coreano podrían tener menor robustez que el inglés o el chino.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero no incluye garantías de seguridad. El usuario es responsable de implementar salvaguardas en aplicaciones robóticas.
- Caveat para producción: el modelo no incluye mecanismos de seguridad integrados (límites de velocidad, detección de colisiones). Es necesario integrarlo con un controlador de bajo nivel y sistemas de supervisión antes de su uso en entornos no controlados.

## Enlaces

- HuggingFace: https://huggingface.co/Muse-Ltd/Muse-Robotics-1.1
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en la búsqueda web. Los resultados obtenidos corresponden a la banda de rock Muse y no al modelo.
