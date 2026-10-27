# microduckapp/microduck-beak-beatbox

## Resumen

microduck-beak-beatbox es una política de movimiento para el robot bípedo Microduck, desarrollada por microduckapp y publicada en Hugging Face con el pipeline `robotics`. No es un modelo de lenguaje ni un modelo generativo multimodal: es un artefacto de control que reproduce un movimiento de beatbox de 12,3 segundos, con cabeceos marcados y flics rápidos, pensado para instalarse y reproducirse desde la app MicroDuck.

El componente principal es `policy.onnx`, que recibe 61 observaciones y produce 14 objetivos articulares a 50 Hz. El repositorio incluye además `manifest.json`, con la información necesaria para instalar y reproducir el movimiento, y `media/preview.mp4`, una previsualización del resultado. El tamaño del repositorio figura como 0.0 GB y no se publican detalles sobre la arquitectura interna, el número de parámetros ni el procedimiento de entrenamiento.

Su relevancia es acotada pero concreta: sirve como ejemplo de política de movimiento exportada a ONNX para robótica de bajo coste y como asset reproducible para probar el runtime `microduck-move`. La ausencia de licencia, benchmarks y especificaciones técnicas detalladas limita su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; política de control para robot exportada a ONNX, sin especificación de capas o familia |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible; no aplica a un modelo de lenguaje. Control a 50 Hz durante 12,3 s |
| Tipos de cuantizacion | no disponible; solo se documenta `policy.onnx` |
| Idiomas soportados | no aplica; no procesa lenguaje natural |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` |
| Entrada | 61 observaciones |
| Salida | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duracion del movimiento | 12,3 s |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la política: no indica si se trata de una red MLP, un transformer, una política de aprendizaje por refuerzo o una secuencia de movimiento precalculada. Tampoco se especifican el número de parámetros, la composición del dataset, el número de tokens ni técnicas de alineación como RLHF o DPO. La única información técnica disponible es la interfaz de entrada y salida: 61 observaciones de entrada, 14 objetivos articulares de salida y una frecuencia de control de 50 Hz.

El movimiento se distribuye junto a un `manifest.json` que describe lo que el robot necesita para instalarlo y reproducirlo en la app MicroDuck. Fuentes externas indican que la plataforma Microduck se entrena con aprendizaje por refuerzo en MuJoCo, pero no confirman que esta política concreta se haya obtenido con ese pipeline. No hay información sobre simulación a realidad, seguridad articular o metodología de validación.

## Capacidades

- Reproduce una secuencia de beatbox de 12,3 segundos con cabeceos y flics rápidos.
- Consume un vector de 61 observaciones y genera 14 objetivos articulares a 50 Hz.
- Se integra en el ecosistema `microduck-move` mediante un `manifest.json` de instalación y reproducción.
- Incluye un vídeo de previsualización del movimiento en `media/preview.mp4`.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No es multilingüe ni procesa lenguaje natural.
- No se documentan modos especiales como thinking, audio o control adaptativo.

## Casos de uso

- Demostración de beatbox en el robot MicroDuck: la app carga `manifest.json` y ejecuta `policy.onnx` para reproducir la secuencia de 12,3 segundos. Es adecuado porque el asset está diseñado específicamente para ese movimiento y ese robot.
- Prueba de integración del runtime `microduck-move`: permite validar que el sistema acepta 61 observaciones, genera 14 objetivos articulares y mantiene la frecuencia de 50 Hz. Sirve como caso de prueba de shapes y temporización.
- Exhibición educativa de robótica physical AI: un movimiento corto y visualmente claro facilita explicar cómo una política ONNX controla articulaciones en un robot bípedo de pequeño tamaño.
- Validación de reproducción en hardware real: el movimiento puede utilizarse para comprobar el mapeo de articulaciones, la respuesta de los servos y la estabilidad durante una secuencia de 615 pasos de control si la reproducción es continua a 50 Hz.
- Baseline cualitativo para comparar otras políticas de MicroDuck: al ser una secuencia fija y acotada, permite contrastar fluidez, sincronización y comportamiento general con otros movimientos del mismo ecosistema.
- Pruebas de regresión de la app MicroDuck: un asset reproducible con manifest y política ONNX ayuda a detectar cambios que rompan la instalación, la carga o la reproducción de movimientos.
- Generación de material audiovisual: el vídeo de previsualización y la secuencia pueden usarse en documentación, demos o vídeos de presentación del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay métricas de error de seguimiento, estabilidad, latencia real, tasa de éxito ni comparación cuantitativa con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La interfaz 61 a 14 y el formato ONNX sugieren una carga computacional baja, pero no se publica el número de parámetros ni el tamaño real del modelo.
- GPU recomendadas: no disponibles. No se documenta que la política requiera GPU.
- Compatibilidad con GPU de consumo: no disponible. Al ser un artefacto ONNX, es plausible su ejecución en CPU mediante ONNX Runtime, pero no hay requisitos oficiales publicados.
- Opciones de despliegue: ONNX Runtime y la app MicroDuck son las vías coherentes con el formato distribuido. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son adecuadas para este tipo de política robótica.
- Latencia y throughput: el objetivo de control es de 50 Hz, es decir, 20 ms por paso. La latencia medida no está disponible.
- Duración y pasos: 12,3 s a 50 Hz equivalen a 615 pasos de control si la reproducción es continua.
- Requisitos del robot: no disponibles más allá de la referencia al robot Microduck y al ecosistema `microduck-move`.

## Comparativa con modelos similares

No se han encontrado políticas comparables con parámetros, contexto, rendimiento y licencia públicos. La comparación cuantitativa no está disponible.

| Modelo | Tipo | Parametros | Contexto o control | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-beak-beatbox | política de movimiento ONNX | no disponible | 61 observaciones a 14 salidas, 50 Hz, 12,3 s | no disponible | no disponible | Hugging Face |
| Otras políticas de MicroDuck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas bípedas de referencia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está disponible, por lo que no se puede confirmar el uso comercial, la redistribución ni la modificación del asset.
- No es un modelo de lenguaje: no tiene contexto textual, capacidades multilingües ni generación de texto.
- No se publican arquitectura, número de parámetros, dataset ni metodología de entrenamiento, lo que impide evaluar su robustez técnica.
- La política declara 14 objetivos articulares, mientras que una descripción pública del robot Microduck menciona 15 motores. No se documenta qué articulación queda fuera ni si el mapeo es completo.
- El movimiento es corto y específico: 12,3 segundos de beatbox. No se documenta capacidad de generalización a otras secuencias o tareas.
- La reproducción depende de que las observaciones de entrada y el `manifest.json` coincidan exactamente con lo esperado por la app y el robot.
- No hay benchmarks ni métricas de estabilidad, seguimiento articular o simulación a realidad.
- No se documentan medidas de seguridad para el hardware, límites articulares o comportamiento ante fallos.
- El repositorio figura con 0.0 GB, un dato que no permite estimar el tamaño real de los archivos ni los requisitos de memoria.
- No se han encontrado instrucciones de instalación detalladas más allá de la referencia al manifest y a la app MicroDuck.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/microduckapp/microduck-beak-beatbox)
- [Perfil de microduckapp en Hugging Face](https://huggingface.co/microduckapp)
- [Repositorio pollen-robotics/microduck en GitHub](https://github.com/pollen-robotics/microduck)
- [Repositorio microduck-beak-lab en GitHub](https://github.com/qilinxiaoxiang/microduck-beak-lab)
- [Artículo sobre Microduck en CNX Software](https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/)
- [Artículo sobre Microduck en MarkTechPost](https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/)
