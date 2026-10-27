# microduckapp/microduck-big-sneeze

## Resumen

Microduck-big-sneeze es una política de control en formato ONNX publicada por el usuario microduckapp para el robot bípedo Microduck, un plataforma abierta de 25 cm y 15 motores desarrollada por Pollen Robotics y Hugging Face. No se trata de un modelo fundacional ni de un modelo de lenguaje: es un artefacto de inferencia que implementa una "move" (habilidad) de 10,4 segundos que el robot reproduce en bucle, mapeando 61 observaciones de entrada a 14 consignas articulares de salida a 50 Hz.

El comportamiento descrito en la model card es una coreografía cómica: la cabeza del pato baja de golpe con tal fuerza que el robot derrapa hacia atrás, se sacude y vuelve a estornudar. El repositorio incluye `policy.onnx` (la política), `manifest.json` (metadatos de instalación y reproducción para la app MicroDuck) y `media/preview.mp4` (previsualización).

Su relevancia es principalmente de ecosistema: muestra el patrón de empaquetado y distribución de habilidades dentro de la app MicroDuck, donde cada movimiento se publica como un repositorio independiente en Hugging Face con un contrato de observaciones/acciones fijo. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto recién publicado y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Se distribuye como grafo ONNX (`policy.onnx`); la topología interna de la red no se documenta |
| Parámetros totales | No disponible (no se publica recuento de parámetros ni tamaño del fichero ONNX; el repositorio se redondea a 0,0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. La política consume 61 observaciones por paso de control, sin estado de contexto declarado |
| Tipos de cuantización | No disponible. Solo se publica el ONNX sin variantes cuantizadas (INT8/FP16) declaradas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | ONNX |
| Espacio de observación | 61 valores de entrada |
| Espacio de acción | 14 consignas articulares de salida |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Duración del movimiento | 10,4 segundos |
| Pipeline declarado | robotics (tags: `onnx`, `robotics`, `microduck-move`, `region:us`) |
| Tamaño del repositorio | 0,0 GB (según metadatos de Hugging Face) |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La información pública no describe la arquitectura interna de la política: el repositorio solo expone el contrato de entrada/salida (61 observaciones → 14 objetivos articulares a 50 Hz) y el fichero ONNX. Por el contexto de la plataforma Microduck, cuyos comportamientos se entrenan con aprendizaje por refuerzo en MuJoCo según la documentación del robot, es razonable esperar una política de control entrenada en simulación y exportada a ONNX para su ejecución en el hardware, pero el autor no documenta ni el algoritmo, ni el número de tokens/pasos de entrenamiento, ni la composición del dataset, ni si hubo ajuste fino o destilación.

Tampoco se detalla la técnica de transferencia sim-to-real empleada, el proceso de retargeting de la coreografía ni el conjunto de observaciones concreto (posiciones articulares, velocidades, IMU, fase del movimiento, etc.). El `manifest.json` actúa como contrato de instalación para la app MicroDuck, pero su contenido no se ha publicado en la información disponible. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, destilación) sería especulativa y no se incluye.

## Capacidades

- Reproducción de una habilidad motora pregrabada: movimiento de 10,4 segundos con caída brusca de cabeza, derrape hacia atrás, sacudida y segundo estornudo.
- Control articular de ciclo cerrado a 50 Hz sobre 14 consignas de salida, a partir de 61 observaciones.
- Integración con la app MicroDuck mediante `manifest.json`, que declara qué debe instalar y cómo reproducir la habilidad.
- Previsualización incluida en el repositorio (`media/preview.mp4`) para evaluar el resultado antes de instalarlo en el robot.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni comportamiento agéntico: es una política reactiva de horizonte corto.
- No dispone de capacidades multilingües, de visión ni de audio dentro del modelo, aunque el robot Microduck cuente con cámara, sensor de profundidad y dos sensores de movimiento cuyo uso por parte de esta política no se documenta.
- No dispone de modo "thinking" ni de salidas textuales.

## Casos de uso

- Demostración y contenido audiovisual: instalar la habilidad en un Microduck físico y grabar el movimiento de 10,4 segundos para vídeos de producto, prensa o redes, usando `media/preview.mp4` como referencia de resultado esperado.
- Validación de la cadena de instalación: emplear el repositorio como caso de prueba del flujo `manifest.json` → app MicroDuck → ejecución en robot, verificando que el contrato de 61 observaciones y 14 acciones encaja con el firmware.
- Pruebas de reproducción determinista: al ser una política ONNX sin estado declarado, sirve para comprobar la repetibilidad de una misma habilidad entre ejecuciones y entre unidades del robot, midiendo deriva del movimiento.
- Base para aprendizaje por imitación: usar los 14 canales de salida a 50 Hz como referencia de movimiento (retargeting) para entrenar políticas propias que reproduzcan o generalicen el comportamiento.
- Docencia en robótica: ejemplo mínimo y autocontenido de empaquetado de una política de control en ONNX, útil para explicar el contrato observación-acción y la frecuencia de control en un curso de robótica o RL.
- Comparación de habilidades dentro del ecosistema: contrastar el estilo y la agresividad del movimiento con otras "moves" de microduckapp (por ejemplo, `microduck-midnight-snack`) para estudiar cómo se parametrizan comportamientos con personalidad en una misma plataforma.
- Pruebas de estrés mecánico controladas: el derrape hacia atrás descrito somete a los actuadores y a la estructura a una carga concreta y repetible, lo que permite medir desgaste o calibrar límites de par en banco de pruebas (con las precauciones del fabricante).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recompensa, error de seguimiento, tasa de éxito ni comparaciones cuantitativas con otras políticas; solo se documenta la duración del movimiento (10,4 s) y la frecuencia de control (50 Hz).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio se redondea a 0,0 GB, lo que sugiere un fichero de pesos muy pequeño y ejecutable en CPU; no se publica el tamaño exacto del ONNX.
- GPU recomendadas: no se requiere GPU para ejecutar una política de este tipo; no hay recomendación publicada por el autor.
- Cabe en GPU de consumo: previsiblemente sí en cualquier GPU de consumo e incluso en CPU, pero el dato no está confirmado en la documentación disponible.
- Hardware objetivo: robot Microduck (25 cm, 15 motores, cámara, sensor de profundidad y dos sensores de movimiento), con la app MicroDuck como capa de instalación y reproducción. La compute onboard no se detalla.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y la app MicroDuck a través de `manifest.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: el bucle de control a 50 Hz implica un presupuesto de 20 ms por paso de inferencia; el tiempo real de ejecución del grafo ONNX no se publica.
- Almacenamiento: repositorio de 0,0 GB según metadatos, más el vídeo de previsualización.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Duración | Licencia | Descargas / likes | Datos de rendimiento |
|---|---|---|---|---|---|---|
| microduckapp/microduck-big-sneeze | Política ONNX para Microduck | 61 obs. / 14 acciones a 50 Hz | 10,4 s | No disponible | 0 / 0 | No disponibles |
| microduckapp/microduck-midnight-snack | Política ONNX para Microduck (misma familia) | No disponible | No disponible | No disponible | No disponible | No disponibles |
| Otras "moves" de microduckapp (16 modelos en la organización) | Políticas ONNX para Microduck | Contrato presumiblemente equivalente, no confirmado | No disponible | No disponible | No disponible | No disponibles |

No se dispone de datos públicos de parámetros, contexto ni benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría. Fuera del ecosistema Microduck no se han identificado políticas comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso, lo que impide determinar si el uso comercial o la redistribución están permitidos. Es un riesgo legal directo para producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que la habilidad se haya ejecutado correctamente en hardware real más allá del vídeo de previsualización.
- Documentación mínima: no se describe la arquitectura, el entrenamiento, el conjunto de observaciones ni el contenido de `manifest.json`, lo que dificulta la depuración y la integración.
- Comportamiento único y no generalizable: la política reproduce una coreografía concreta de 10,4 segundos; no se adapta a terreno, obstáculos ni perturbaciones externas más allá de lo que permita su bucle de control.
- Riesgo mecánico: el movimiento descrito (caída brusca de cabeza y derrape hacia atrás) somete a los actuadores y a la estructura a impactos repetidos; no se documentan límites de seguridad, par máximo ni condiciones de parada.
- Dependencia de la plataforma: el artefacto solo tiene sentido sobre el robot Microduck y su app; no es reutilizable en otros robots sin retargeting y reentrenamiento.
- Sin capacidades de lenguaje, visión ni tool calling: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K, que no aplican.
- Idiomas: no aplica; no hay soporte multilingüe que evaluar.
- Fechas y metadatos: el repositorio figura creado y actualizado el 2026-10-27 con dos segundos de diferencia, sin historial de versiones que permita evaluar madurez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-big-sneeze
- Organización microduckapp en Hugging Face: https://huggingface.co/microduckapp
- Artículo sobre el lanzamiento de Microduck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Ficha del robot Microduck (Robots Guide): https://robotsguide.com/robots/microduck
- Cobertura técnica del robot (CNX Software): https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Cobertura del lanzamiento (The AI Insider): https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
