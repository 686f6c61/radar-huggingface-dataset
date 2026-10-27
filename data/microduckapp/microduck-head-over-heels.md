# microduckapp/microduck-head-over-heels

## Resumen

Microduck Head Over Heels es una política de control motriz empaquetada en formato ONNX para el robot bípedo Microduck, desarrollado por Pollen Robotics (división de robótica de Hugging Face). No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de inferencia que mapea 61 observaciones de estado del robot a 14 consignas de articulación, ejecutadas a 50 Hz, y que reproduce una animación de 10,9 segundos en la que el robot se balancea hacia delante y hacia atrás hasta casi caer de cabeza y termina adoptando una pose de aparente compostura.

El modelo pertenece a la familia `microduck-move`, un conjunto de movimientos publicados por la cuenta `microduckapp` (16 modelos en el momento de la consulta) que se instalan y reproducen desde la aplicación MicroDuck. Por tanto, su relevancia no está en capacidades cognitivas sino en ser una pieza de contenido motriz distribuible para un robot open source de 399 dólares, 25 cm de altura y 15 motores, orientado a experimentación en IA física.

La información pública es mínima: la model card describe el movimiento y los ficheros del repositorio, pero no detalla la arquitectura interna de la red, el dataset de entrenamiento, la licencia ni los idiomas. Cualquier evaluación seria del artefacto requiere inspeccionar el grafo ONNX y el `manifest.json` directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Artefacto ONNX con 61 entradas de observación y 14 salidas de consigna articular; topología interna no documentada |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control reactiva; ventana de 61 observaciones por paso) |
| Tipos de cuantización | No disponible en la model card; el formato ONNX permite cuantización int8 con ONNX Runtime, pero el repositorio no documenta ninguna variante |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y `media/preview.mp4` |
| Frecuencia de control | 50 Hz (20 ms por ciclo) |
| Duración del movimiento | 10,9 segundos |
| Entradas / salidas | 61 observaciones de entrada / 14 objetivos articulares de salida |
| Tamaño del repositorio | 0,0 GB según HuggingFace (por debajo del umbral de redondeo) |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red. Lo único verificable es la interfaz del grafo: un modelo ONNX que consume un vector de 61 observaciones y emite 14 consignas de articulación a 50 Hz. El robot objetivo tiene 15 motores según la documentación pública de Microduck, por lo que las 14 salidas probablemente corresponden a un subconjunto de articulaciones o a un esquema de control concreto del firmware; esta correspondencia no está documentada y debería confirmarse contra el `manifest.json` y el SDK del robot.

No se han publicado datos sobre el proceso de entrenamiento: ni número de tokens o trayectorias, ni composición del dataset, ni si se empleó aprendizaje por imitación, reinforcement learning o captura de movimiento retargeteada. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que en este contexto no aplicarían. La única información cualitativa es la descripción del comportamiento: balanceo anteroposterior con riesgo aparente de caída y recuperación a una pose estable, lo que sugiere una política entrenada para gestionar el equilibrio dinámico durante la secuencia.

## Capacidades

- Ejecución de una secuencia motriz cerrada de 10,9 segundos: balanceo hacia delante y hacia atrás con casi-caída y pose final de recuperación.
- Control de equilibrio dinámico en un robot bípedo de 25 cm con 15 motores.
- Inferencia a 50 Hz, compatible con el bucle de control en tiempo real del robot.
- Despliegue portable mediante ONNX Runtime, sin dependencias de frameworks de deep learning pesados.
- Instalación y reproducción gestionadas por la aplicación MicroDuck a través del `manifest.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No se documenta modo thinking ni ninguna capacidad cognitiva.

## Casos de uso

- Demostración de producto en ferias y showrooms: el movimiento incluye un casi-tropiezo y una recuperación que generan un efecto cómico y recognoscible, útil para captar atención en stands sin intervención de un operador.
- Contenido para redes sociales y vídeo promocional: la secuencia de 10,9 s está pensada como clip corto, con `preview.mp4` ya incluido en el repositorio para su publicación directa.
- Prueba de estrés de controladores de equilibrio: el balanceo deliberado hasta el límite de vuelco permite validar la respuesta del lazo de control del robot y de sus dos sensores de movimiento en condiciones cercanas a la inestabilidad.
- Docencia en robótica e IA física: sirve como ejemplo mínimo y ejecutable de política ONNX (61 entradas, 14 salidas) para explicar el pipeline observación-consigna en un robot bípedo real.
- Validación de la cadena de despliegue de la app MicroDuck: instalar este movimiento y comprobar que el `manifest.json` se resuelve correctamente es una prueba de integración de extremo a extremo para desarrolladores que publiquen sus propios movimientos.
- Investigación en mezcla y transición de comportamientos: al convivir con otros movimientos de la familia (por ejemplo `microduck-roll-over`), permite experimentar con blending de políticas y transiciones entre poses finales e iniciales.
- Pruebas de sim-to-real: comparar la ejecución del mismo grafo ONNX en simulador y en hardware real para medir la brecha de comportamiento en un movimiento con contacto y riesgo de caída.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas de éxito de la tarea, tasa de caídas, error de seguimiento articular ni comparaciones con otras políticas en la model card, el repositorio ni las fuentes web consultadas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 0,0 GB según HuggingFace, por lo que el grafo es de tamaño reducido y la inferencia es viable en CPU.
- GPU recomendadas: no aplica para el artefacto en sí; la política está pensada para ejecutarse en la electrónica del propio robot o en un equipo anfitrión conectado.
- ¿Cabe en GPU de consumo? Sí, con margen amplio, aunque no es el escenario previsto: cualquier CPU moderna con ONNX Runtime debería cubrir el ciclo de 20 ms.
- Opciones de despliegue: ONNX Runtime como ejecutor principal; instalación y reproducción mediante la aplicación MicroDuck y el `manifest.json` del repositorio. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato objetivo es el presupuesto temporal de 20 ms por paso impuesto por los 50 Hz de frecuencia de control.
- Requisito de plataforma: robot Microduck (25 cm, 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y pico articulado), según la documentación pública del fabricante.

## Comparativa con modelos similares

| Modelo | Tipo | Duración | Entradas / salidas | Formato | Licencia | Descargas |
|---|---|---|---|---|---|---|
| microduck-head-over-heels | Movimiento Microduck | 10,9 s | 61 / 14 a 50 Hz | ONNX | No disponible | 0 |
| microduck-roll-over | Movimiento Microduck | 10,8 s | No disponible | No disponible | No disponible | No disponible |
| microduck-midnight-snack | Movimiento Microduck | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas de locomotion bípeda de propósito general | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es dentro de la propia familia `microduck-move`, que agrupa 16 movimientos publicados por la misma cuenta. Fuera de ese conjunto no se han identificado en la información disponible políticas directamente comparables en tamaño, formato y robot objetivo.

## Limitaciones y advertencias

- Licencia no especificada: sin un término de licencia explícito no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para cualquier integración en producto.
- Ausencia total de documentación técnica: no se describen arquitectura, proceso de entrenamiento, dataset ni métricas, lo que impide evaluar robustez o generalización.
- Especialización absoluta: la política ejecuta un único movimiento de 10,9 s sobre un robot concreto; no es reutilizable en otro hardware ni adaptable a otras tareas sin reentrenamiento.
- Dependencia de la interfaz de observación: el significado de las 61 entradas no está documentado, por lo que integrarla fuera de la app MicroDuck exige ingeniería inversa o consultar el SDK del robot.
- Riesgo físico inherente: el movimiento simula un casi-vuelco; sobre superficies irregulares, con batería baja o con el robot cerca de un borde, existe riesgo real de caída y de daño al hardware.
- Sin datos de robustez: se desconoce el comportamiento ante perturbaciones externas, cambios de superficie o desgaste de los motores.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación por parte de terceros.
- Sin soporte de lenguaje: no puede emplearse en casos de uso conversacionales, de razonamiento o de generación de código; las secciones habituales de benchmarks de NLP no aplican.
- Fecha de publicación reciente (2026-10-27): no ha habido tiempo material para que la comunidad reporte problemas de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-head-over-heels
- Perfil del autor (16 movimientos publicados): https://huggingface.co/microduckapp
- Movimiento relacionado microduck-roll-over: https://huggingface.co/microduckapp/microduck-roll-over
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cobertura de PCMag sobre Microduck: https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
- Análisis técnico de CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Paper, blog técnico o demo adicional: no disponible
