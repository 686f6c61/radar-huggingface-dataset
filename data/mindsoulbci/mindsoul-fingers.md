# mindsoulBCI/mindsoul-fingers

## Resumen

MindSoul Neural AI · Ten-Finger Decoding (mindsoul-fingers) es un anuncio de modelo de investigación del equipo MindSoul (mindsoulBCI), vinculado a la empresa Chengdu (Shanghai) Brain Cloud Matrix Technology. Su objetivo declarado es la decodificación de EEG para tareas relacionadas con los diez dedos, tanto en movimiento real como en imaginación motora, con el fin de distinguir clases finas de dedos y decodificar intención para futuras interfaces de mano virtual.

En el momento de la publicación de esta ficha, el repositorio no contiene pesos descargables, código de entrenamiento ni resultados de evaluación. La model card indica explícitamente "准备发布 · 即将更新" (preparación de lanzamiento, actualizaciones próximas) y señala que la arquitectura Transformer es una dirección de modelado planificada, no una configuración ya publicada.

Por tanto, esta ficha documenta el estado real del proyecto: un anuncio de investigación con alcance definido (EEG de dedos, validación intra e inter-sujeto, integración futura con Android XR, visionOS, PICO OS 6 y PC), licencia restrictiva de investigación personal no comercial y ausencia total de métricas verificables. No debe tratarse como un modelo listo para producción ni como una base para afirmaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (dirección de modelado planificada; arquitectura concreta no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en (según metadatos del repositorio) |
| Licencia | mindsoul-personal-research (licencia "other"; solo investigación personal no comercial, otro uso requiere autorización) |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La model card describe un enfoque basado en Transformer para la decodificación de EEG orientada a clases finas de dedos, en tareas de movimiento y de imaginación motora. No se especifican número de capas, dimensión oculta, mecanismo de atención, tokenización de la señal EEG, canales, frecuencia de muestreo ni ventana temporal de entrada. Tampoco se detalla el volumen de datos, la composición del dataset, el número de sujetos ni si se emplearon técnicas de alineación de dominio o adaptación por sujeto.

El plan de validación menciona particiones a nivel de sujeto (entrenamiento, validación y prueba), evaluación intra-sujeto e inter-sujeto, y la publicación de versión de datos, condiciones del dispositivo, líneas base y casos de fallo. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, lo cual es coherente con una tarea de clasificación/decodificación y no de generación de lenguaje. Tampoco se describen innovaciones técnicas concretas más allá de la elección genérica de Transformer.

## Capacidades

- Decodificación de EEG para categorías relacionadas con los diez dedos, en condiciones de movimiento y de imaginación motora (objetivo declarado, no verificado).
- Distinción de clases finas de dedos y decodificación de intención (objetivo de investigación; sin resultados publicados).
- Evaluación prevista intra-sujeto e inter-sujeto, con matrices de confusión y análisis de generalización entre sujetos.
- Integración futura con plataformas de realidad extendida: Android XR, visionOS, PICO OS 6 y PC (no existe integración de cliente verificable).
- Idiomas declarados en metadatos: chino y inglés (aplicable a documentación, no a una capacidad generativa del modelo).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en decodificación motora fina: uso del modelo como línea base para clasificar señales EEG asociadas a movimientos de dedos individuales en laboratorio, comparando condiciones de movimiento real frente a imaginación.
- Estudios de generalización entre sujetos: evaluación de la transferibilidad de representaciones neuronales entre participantes, un problema central en BCI no invasivo, mediante las particiones inter-sujeto que el equipo planea reportar.
- Prototipado de interfaces de mano virtual: experimentación en entornos de realidad extendida (Android XR, visionOS, PICO OS 6) para explorar esquemas de entrada basados en intención de dedos, siempre dentro de un marco de investigación.
- Diseño de paradigmas experimentales: definición de tareas, etiquetas y condiciones de adquisición para nuevos experimentos de EEG con múltiples dedos, usando la especificación de datos que el equipo prevé publicar.
- Reproducción académica: una vez liberados pesos y configuración, replicación de resultados y análisis de casos de fallo en entornos controlados de laboratorio.
- Evaluación de confusión entre dedos adyacentes: análisis de matrices de confusión para identificar qué pares de dedos son más difíciles de separar y orientar mejoras de hardware o de preprocesado.
- Docencia y formación en BCI: uso del material y de la futura especificación de datos en cursos de neurotecnología, limitado a investigación personal no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "当前不报告性能数字" (actualmente no se reportan cifras de rendimiento) y que el benchmark, las condiciones de evaluación y las limitaciones se publicarán en una versión futura.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no hay pesos publicados ni tamaño de parámetros declarado.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin arquitectura ni tamaño de modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables en el estado actual; no existen artefactos de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mindsoul-fingers | Decodificación EEG (Transformer, planificado) | no disponible | no disponible | no publicado | mindsoul-personal-research (no comercial) | Anuncio; sin pesos |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; no se establecen comparaciones sin datos verificables.

## Limitaciones y advertencias

- Ausencia total de artefactos: no hay pesos, código de entrenamiento, ejemplos de inferencia ni resultados de evaluación publicados.
- El alcance "diez dedos" es un objetivo de investigación; la propia model card aclara que no implica control independiente en tiempo real de los diez dedos.
- Riesgo de sobreinterpretación: cualquier afirmación sobre precisión, latencia o generalización carece de respaldo empírico en el estado actual.
- Licencia restrictiva: solo investigación personal no comercial; cualquier uso comercial requiere autorización expresa del equipo.
- Idiomas limitados a chino e inglés en la documentación; no hay evidencia de soporte multilingüe adicional.
- Ámbito excluido: el contenido no está destinado a diagnóstico ni tratamiento médico.
- Datos no publicados: la model card no certifica que existan datos anonimizados ni un modelo entrenado; la publicación de datos queda condicionada a verificación de desensibilización y autorización de compartición.
- Integraciones de cliente (Android XR, visionOS, PICO OS 6, PC) no verificadas; el soporte real dependerá de las notas de versión.
- Sesgos: no documentados; en EEG son esperables sesgos por sujeto, dispositivo y protocolo experimental, pero no se aporta información específica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mindsoulBCI/mindsoul-fingers
- Página de investigación en GitHub: https://github.com/pm-kevin-zhang/MindSoul
- Aplicaciones espaciales, juegos y materiales: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio web del proyecto: https://MindSoul.cn
- Licencia (referenciada en el repositorio): LICENSE
