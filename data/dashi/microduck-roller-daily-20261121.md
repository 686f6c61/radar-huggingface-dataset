# dashi/microduck-roller-daily-20261121

## Resumen

`dashi/microduck-roller-daily-20261121` es una política de control robótico (no un modelo de lenguaje) publicada en Hugging Face por el usuario `dashi`. Se trata de un fine-tune de `DenRakEiw/microduck-senate_duck_0904`, entrenado con aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck del proyecto de Pollen Robotics. La política se exporta en formato ONNX y se carga directamente en el robot mediante el comando `robotctl`, ocupando el slot de marcha (`walk`).

El modelo resuelve un problema muy concreto: generar una marcha perpetua sobre ruedas (rollers) para el microduck, con 61 dimensiones de observación, 14 acciones de salida y una frecuencia de control de 50 Hz. La model card lo describe como una "re-entrada diaria" de `dashi/microduck-roller-remix-r900` (con una puntuación de 0.900), lo que sugiere un pipeline de publicación automatizado o experimental más que un artefacto de producción estable.

Su relevancia es limitada fuera del ecosistema microduck: no es un modelo de propósito general, no procesa lenguaje ni imágenes, y su utilidad está restringida a la experimentación en robótica de bajo coste con el hardware y el daemon de Pollen Robotics. El repositorio ocupa 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; presumiblemente red neuronal pequeña entrenada con RL) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red. Se sabe que la política se exporta a ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el robot alimenta observaciones en bruto. La interfaz es fija: 61 dimensiones de observación, 14 acciones y 50 Hz de frecuencia de control, sobre el hardware microduck equipado con rollers.

El entrenamiento se realizó con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. La model card indica que es una "re-entrada diaria" de `dashi/microduck-roller-remix-r900` con puntuación 0.900, y que es un remix de `DenRakEiw/microduck-senate_duck_0904`. No se especifican número de pasos de entrenamiento, composición del dataset, recompensas ni si hubo ajuste fino adicional.

## Capacidades

- Generación de una marcha perpetua sobre rollers para el robot microduck, sin condición de terminación explícita ("runs until told otherwise").
- Control a 50 Hz con 61 observaciones de entrada y 14 acciones de salida.
- Normalización de observaciones incorporada en el grafo ONNX: acepta observaciones en bruto.
- Integración con el daemon microduck mediante `robotctl policy load walk <repo>`.
- Compatible con el slot `walk` del manifiesto de políticas (schema 2).
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, ni audio.

## Casos de uso

- Experimentación en robótica de bajo coste: cargar la política en un microduck con rollers para evaluar una marcha concreta y compararla con otras variantes del mismo autor o de `DenRakEiw/microduck-senate_duck_0904`.
- Benchmarking de políticas RL: usar la puntuación de referencia (0.900 del remix base) como línea base para medir mejoras en nuevas iteraciones del pipeline `microduck_rl`.
- Reproducción de experimentos: el commit y la rama documentados permiten reconstruir el entorno de entrenamiento en `pollen-robotics/microduck_rl`.
- Demostraciones docentes: ilustrar un flujo completo de entrenamiento RL, exportación a ONNX y despliegue en hardware real con `robotctl`.
- Pruebas de integración del daemon: validar la carga de manifiestos schema 2 y la ejecución de políticas en el slot `walk`.
- Investigación en locomoción sobre ruedas: analizar el comportamiento de una política perpetua sin condición de parada en un robot cuadrúpedo con rollers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es la puntuación 0.900 asociada al remix base `dashi/microduck-roller-remix-r900`, sin especificar la métrica ni el protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente se ejecuta en CPU.
- GPU recomendadas: no disponible; por el tamaño y el contexto (robot microduck de bajo coste), es plausible que la inferencia se realice en la CPU del propio robot o en un equipo embebido, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load walk ...`). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el control opera a 50 Hz por requisito del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261121` | Política RL microduck (ONNX) | no disponible | no aplica | no disponible | Hugging Face |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL microduck (modelo base) | no disponible | no aplica | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL microduck (remix referenciado) | no disponible | no aplica | no disponible | Hugging Face (referenciado en la model card) |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, imágenes ni audio; cualquier uso fuera del control del microduck con rollers carece de sentido.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin métricas de evaluación publicadas más allá de la puntuación 0.900 del remix base, sin protocolo definido.
- Política "perpetua" sin condición de parada: requiere intervención externa para detener la marcha, lo que implica riesgos en entornos no controlados.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El pipeline de publicación parece automatizado ("daily re-entry"), lo que sugiere que el artefacto puede ser efímero o experimental.
- Dependencia estricta del hardware microduck y del daemon de Pollen Robotics; no es portable a otras plataformas sin reentrenamiento.
- No se documentan sesgos, alucinaciones ni comportamiento en dominios fuera del entrenamiento; el riesgo principal es de seguridad física en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261121
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se ha proporcionado URL directa.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se ha proporcionado URL directa.
