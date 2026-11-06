# mobilint/YOLO26n-depth

## Resumen

YOLO26n-depth es una versión adaptada para estimación de profundidad del modelo YOLO26n de Ultralytics, publicada por Mobilint. El modelo original de Ultralytics se ha convertido a formato MXQ mediante el compilador propietario qbcompiler 1.4.0, orientado a la inferencia eficiente en hardware específico de Mobilint (familia ARIES). No se trata de un modelo entrenado desde cero por Mobilint, sino de una reproducción cuantizada del modelo de profundidad de YOLO26n, con pesos empaquetados para su despliegue en el runtime qbruntime 1.5.0.

La relevancia de esta ficha reside en que documenta un artefacto de despliegue de borde (edge deployment) más que un modelo de propósito general. El tamaño del binario MXQ es de 9.496.924 bytes (aproximadamente 9,5 MB), lo que lo hace apto para dispositivos con recursos limitados. La evaluación publicada sobre el conjunto NYU-Depth (654 muestras) reporta delta1 de 0,74652, abs_rel de 0,17518 y RMSE de 0,63321 en modo de inferencia asíncrono.

El modelo hereda la licencia AGPL-3.0 del repositorio base de Ultralytics, lo que condiciona fuertemente su uso en productos comerciales cerrados. La información disponible no incluye detalles sobre la arquitectura interna, el número de parámetros ni los datos de entrenamiento originales, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Ultralytics/YOLO26; tarea de depth estimation) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | cuantización propietaria MXQv7 generada por qbcompiler 1.4.0; no se documentan esquemas alternativos |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | MXQ (MXQv7), binario de 9.496.924 bytes; SHA-256 d2f497f835102d7611dca2d9b6be261a436bec1c302c942fde5c13182e6ee027 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que deriva de Ultralytics/YOLO26, un modelo de la familia YOLO orientado a tareas de visión por computador, y que en este caso se emplea para estimación de profundidad (depth-estimation). El artefacto publicado no es un modelo entrenado por Mobilint, sino una reproducción cuantizada compilada con qbcompiler 1.4.0 dentro de la imagen `mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04`, con `--inference-scheme all`, lo que habilita los modos `single`, `multi`, `global4` y `global8`.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento original, ni sobre si hubo etapas de ajuste fino, RLHF o DPO (no aplicables habitualmente en modelos de visión de este tipo). La innovación técnica destacable es el proceso de compilación y cuantización a MXQv7 para el runtime qbruntime 1.5.0, con verificación de integridad mediante SHA-256 y auditoría de identidad de los datos de evaluación (`identity_audit: verified`). El campo `retention_percent` reporta una retención de delta1 del 99,159 % respecto al modelo de referencia.

## Capacidades

- Estimación de profundidad monocular a partir de imágenes, orientada a la tarea depth-estimation.
- Inferencia en modo asíncrono (`async`) mediante qbruntime 1.5.0.
- Soporte de cuatro modos de ejecución del núcleo: `single`, `multi`, `global4` y `global8`.
- Despliegue en hardware de Mobilint (familia ARIES) mediante el formato MXQ.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan capacidades de visión más allá de la estimación de profundidad (no hay evidencia de detección, segmentación o clasificación en la información disponible).

## Casos de uso

- Robótica móvil de interior: el modelo puede generar mapas de profundidad a partir de imágenes monocomulares para navegación y evitación de obstáculos en robots con hardware ARIES, gracias a su tamaño reducido (9,5 MB) y a los modos de inferencia de baja latencia.
- Realidad aumentada en dispositivos de borde: la estimación de profundidad permite colocar objetos virtuales con oclusión coherente en tiempo real, aprovechando la compilación para hardware específico y el modo `single` para mínima latencia.
- Automoción y ADAS de bajo coste: como módulo de percepción de profundidad en sistemas de asistencia, el modelo puede integrarse en pipelines embebidos donde el consumo energético y el espacio de memoria son críticos.
- Drones y vehículos aéreos no tripulados: la estimación de profundidad monocular alimenta algoritmos de evitación de obstáculos y aterrizaje seguro en plataformas con recursos limitados.
- Escaneado 3D y reconstrucción: combinado con la pose de cámara, las salidas de profundidad permiten generar nubes de puntos para modelado de interiores o inspección industrial.
- Investigación en visión por computador: el artefacto sirve como referencia reproducible para comparar cuantizaciones MXQ frente al modelo original de Ultralytics sobre NYU-Depth, con métricas y hashes de datos publicados.
- Prototipado en edge AI: desarrolladores que evalúan la familia ARIES pueden usar este modelo como ejemplo de pipeline completo (compilación, cuantización, evaluación y verificación de integridad).

## Benchmarks y rendimiento

Evaluación publicada sobre NYU-Depth (654 muestras), inferencia en modo `async` con qbruntime 1.5.0:

| Métrica | Valor |
|---|---|
| delta1 | 0,74652 |
| abs_rel | 0,17518 |
| RMSE | 0,63321 |
| Retención de delta1 respecto a la referencia | 99,159 % |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el binario MXQ ocupa 9.496.924 bytes, lo que sugiere un consumo de memoria muy reducido.
- GPU recomendadas: hardware de Mobilint de la familia ARIES (el runtime qbruntime 1.5.0 y el formato MXQ son específicos de esta plataforma). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumidor: no disponible; el formato MXQ no es un formato estándar como GGUF o safetensors.
- Opciones de despliegue: qbruntime 1.5.0 en modo `async`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26n-depth (este) | Depth estimation | MXQv7 | AGPL-3.0 | Imagen (resolución no disponible) | Hugging Face (mobilint) |
| Ultralytics/YOLO26 (base) | Visión general (incl. depth) | PyTorch | AGPL-3.0 | Imagen | Hugging Face / GitHub Ultralytics |
| Otros modelos de depth estimation monocular | Depth estimation | safetensors / ONNX | variable | Imagen | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia AGPL-3.0: el uso en productos comerciales cerrados requiere cumplir con las obligaciones de copyleft de la AGPL, lo que puede obligar a liberar el código fuente de la aplicación que lo integre.
- Formato propietario MXQ: solo ejecutable con qbruntime en hardware Mobilint; no es portable a GPUs convencionales ni a runtimes estándar.
- Dependencia de versiones: `mblt-model-zoo <= 2.12` debe fijar una revisión anterior, ya que el directorio legacy `aries/` fue eliminado.
- `aries-rb/best_result.json` contiene valores de build heredados y se conserva solo para los valores por defecto de compilación de mblt-vision-python; no debe interpretarse como resultado actual.
- Solo se evaluó el modo de núcleo medido (no todos los modos soportados tienen métricas publicadas).
- No hay información sobre sesgos, riesgo de alucinación (no aplica en el sentido de lenguaje) ni limitaciones idiomáticas.
- No se documentan métricas de robustez ante condiciones adversas (iluminación, oclusiones, dominios distintos a NYU-Depth).
- El número de descargas (21) y likes (1) es muy bajo, lo que sugiere escasa validación comunitaria.
- El repositorio tiene un tamaño de 0,0 GB reportado, lo que puede indicar que el binario no está incluido en el árbol principal o que la métrica no refleja el contenido real.

## Enlaces

- Hugging Face: https://huggingface.co/mobilint/YOLO26n-depth
- Repositorio de referencia de Mobilint (arxiv folder): https://github.com/mobilint/mblt-model-arxiv/tree/main/models/depth_estimation/YOLO26n_depth
- Repositorio base de Ultralytics: https://github.com/ultralytics/ultralytics
- Modelo base en Hugging Face: https://huggingface.co/Ultralytics/YOLO26
