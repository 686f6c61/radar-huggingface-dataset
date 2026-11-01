# mindsoulBCI/mindsoul-limbs

## Resumen

MindSoul Neural AI · Limb Control (mindsoul-limbs) es un modelo anunciado por mindsoulBCI, equipo de investigación del MindSoul Brain-Computer Interface Foundation Model, orientado a la decodificación de señales EEG en tareas de movimiento de extremidades e imaginación motora. El objetivo declarado es identificar clases de intención de movimiento y mapearlas a comandos de interacción en entornos de realidad extendida (Android XR, visionOS, PICO OS 6 y PC), así como en aplicaciones espaciales y de asistencia.

En el momento de esta ficha el repositorio es únicamente un anuncio de publicación: no hay pesos descargables, código de entrenamiento, configuración de inferencia ni resultados de evaluación. El autor indica explícitamente que la arquitectura Transformer es una dirección de modelado *planificada* y que los detalles de arquitectura, entradas, salidas y entrenamiento se publicarán en la versión formal. Por tanto, cualquier dato cuantitativo sobre tamaño, contexto o rendimiento es no disponible.

La relevancia actual es limitada desde el punto de vista práctico (no es ejecutable), pero el proyecto es relevante como señal del interés creciente en modelos fundacionales de EEG aplicados a control de extremidades y a interfaces de realidad mixta, un área donde la mayoría de propuestas aún se encuentran en fase de investigación preliminar y con escasa reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (dirección de modelado planificada; no confirmada en versión publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e inglés (en) en la documentación del modelo; el dominio de la tarea es señal EEG, no texto |
| Licencia | mindsoul-personal-research (licencia «other», solo investigación personal no comercial; uso comercial requiere autorización del equipo) |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La model card describe un enfoque basado en Transformer para modelar características espacio-temporales de señales EEG en tareas de movimiento de extremidades e imaginación motora. El autor plantea mapeos experimentales desde clases de intención predichas a comandos de interacción. No se especifica número de capas, dimensión oculta, mecanismo de atención, tokenización de la señal EEG, frecuencia de muestreo, número de canales ni ventana temporal de entrada.

Respecto al entrenamiento, la documentación menciona que se planea reportar divisiones a nivel de sujeto (entrenamiento, validación y prueba), distinguiendo evaluación intra-sujeto y cross-sujeto, junto con la versión de datos, condiciones del dispositivo, líneas base y casos de fallo. No se indica número de tokens, composición del dataset, uso de RLHF/DPO ni ninguna innovación técnica concreta. La propia model card advierte que no prueba la existencia de datos anonimizados ni de un modelo entrenado.

## Capacidades

- Decodificación de EEG para tareas de movimiento de extremidades e imaginación motora (capacidad declarada como objetivo, no verificada).
- Clasificación de intención de movimiento por lado (izquierdo/derecho) y por clase de extremidad (según el alcance de validación descrito).
- Mapeo experimental de clases de intención predichas a comandos de interacción para aplicaciones espaciales.
- Evaluación prevista en modo offline (reconocimiento) y online (control), con métricas de latencia y tasa de falsos disparos.
- Soporte multilingüe en la documentación (chino e inglés); no aplica generación de texto multilingüe.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo «thinking»: no disponibles.

## Casos de uso

- Control de avatares en realidad extendida: el modelo se plantea para mapear intenciones de movimiento de extremidades a comandos en Android XR, visionOS, PICO OS 6 y PC; su idoneidad depende de que se publiquen pesos y se validen latencias y falsos positivos en modo online.
- Rehabilitación asistida basada en imaginación motora: decodificación de clases de intención para alimentar interfaces de feedback en sesiones de neurorrehabilitación, con evaluación intra-sujeto como paso previo obligatorio.
- Investigación en decodificación cross-sujeto: uso como línea base reproducible para estudiar transferencia entre sujetos en tareas de imaginación motora, una vez publicados los datos y la configuración de entrenamiento.
- Evaluación de paradigmas BCI en entornos simulados: integración en entornos virtuales para medir tasa de falsos disparos y latencia antes de cualquier despliegue con hardware físico.
- Prototipado de interfaces híbridas EEG + XR: experimentación con mapeos intención→comando en aplicaciones espaciales, siempre en el marco de investigación personal no comercial que impone la licencia.
- Docencia y reproducción académica: estudio de arquitecturas Transformer aplicadas a EEG espacio-temporal, a la espera de que se liberen la guía de reproducción y los benchmarks prometidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que «actualmente no se reportan cifras de rendimiento» y que los benchmarks, condiciones de evaluación y limitaciones se incluirán en la versión formal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni tamaño de parámetros publicados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el modelo no es un LLM de texto y no se ha publicado ningún runtime de inferencia.
- Latencia y throughput: no disponible; la model card menciona que se planea reportar latencia y tasa de falsos disparos en la evaluación online, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mindsoul-limbs | no disponible | no disponible | no disponible (sin benchmarks) | mindsoul-personal-research (no comercial) | Anuncio, sin pesos |
| Alternativas de decodificación EEG con Transformer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información verificable sobre modelos comparables en la documentación proporcionada; la comparación cuantitativa queda pendiente de la publicación de pesos y resultados por parte del autor.

## Limitaciones y advertencias

- El repositorio no contiene pesos, código de entrenamiento ni ejemplos de inferencia: no es utilizable en producción ni en investigación empírica en su estado actual.
- No hay resultados de benchmarks, por lo que no puede evaluarse su calidad frente a líneas base de decodificación EEG.
- La arquitectura Transformer se presenta como dirección planificada, no como hecho confirmado; los detalles de entrada/salida y configuración de entrenamiento están pendientes.
- Riesgo de alucinación y sesgos: no evaluable sin modelo entrenado; en el dominio EEG son críticos los sesgos por sujeto, dispositivo y protocolo de adquisición.
- La licencia mindsoul-personal-research restringe el uso a investigación personal no comercial; cualquier uso comercial requiere autorización expresa del equipo.
- La model card advierte que el contenido no está destinado a diagnóstico ni tratamiento médico; no debe interpretarse como dispositivo médico.
- El soporte de integración con Android XR, visionOS, PICO OS 6 y PC es una dirección declarada, no una integración verificada.
- Idiomas: la documentación está en chino e inglés; no hay evidencia de soporte para otros idiomas en la documentación.
- Fechas de creación y actualización del repositorio (2026) posteriores a la fecha habitual de consulta: conviene verificar la vigencia del anuncio antes de citarlo.

## Enlaces

- HuggingFace: https://huggingface.co/mindsoulBCI/mindsoul-limbs
- GitHub del proyecto: https://github.com/pm-kevin-zhang/MindSoul
- Repositorio de aplicaciones espaciales, juegos y materiales: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio web del proyecto: https://MindSoul.cn
- Licencia: LICENSE (referenciada en el repositorio de HuggingFace)
- Contacto del equipo: WeChat kevinzhang0527; cuenta pública «Kevin改变世界的点滴»
- Empresa: 成都（上海）脑云矩阵科技有限公司
