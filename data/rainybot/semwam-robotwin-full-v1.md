# RainyBot/SemWAM-RoboTwin-Full-v1

## Resumen

SemWAM-RoboTwin-Full-v1 es un checkpoint intermedio del modelo SemWAM, publicado por el usuario RainyBot en Hugging Face, orientado a robótica y, más concretamente, al entorno de simulación y manipulación RoboTwin. Se trata de un modelo de política (policy) para control robótico que incorpora un compresor semántico congelado ("frozen semantic compressor") dentro del propio checkpoint, junto con la configuración de inferencia y las estadísticas de normalización necesarias para reproducir el pipeline de observación, geometría de cámara y normalización de acciones y estados.

El artefacto corresponde al paso de optimizador 95.564, con 4 épocas completadas en el momento de la publicación, y se declara explícitamente como un snapshot intermedio de un entrenamiento aún en curso. El repositorio pesa 14,6 GB y contiene pesos en formato PyTorch (`.pt`), no en safetensors ni GGUF, lo que condiciona su despliegue al runtime propietario de SemWAM.

Su relevancia es acotada: no es un modelo de lenguaje generalista, sino un checkpoint de investigación para experimentación en robótica con RoboTwin. La model card no documenta benchmarks de bucle cerrado ni rendimiento comparativo, y advierte que la publicación no establece rendimiento de benchmark. La información pública disponible es escasa: no se declaran licencia, idiomas, arquitectura ni número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de política robótica con compresor semántico congelado embebido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), checkpoint en formato v2 |
| Tamano del repositorio | 14,6 GB |
| Version del checkpoint | v1 (paso de optimizador 95.564, 4 épocas) |
| Estado | checkpoint intermedio, entrenamiento en curso en el momento de la publicación |
| Pipeline declarado | robotics |
| Libreria | pytorch |
| SHA256 de pesos | `d254e7641fd08b19bd9627dc00a8325ee3b53ab6161c45adaf586b1ff69f9e1b` |
| SHA256 de estadísticas | `32b0b1e84c7ba6d62b588aef5c06ba527350ebe0a19849c377a29daf10562851` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card indica que el checkpoint incluye un "compresor semántico congelado" embebido en los pesos, lo que sugiere una arquitectura de política que combina un módulo de representación semántica preentrenado y congelado con un cabezal o política entrenable para control robótico. No se especifican el tipo de backbone (transformer, CNN, híbrido), el número de parámetros, la composición del dataset ni el número de tokens o trayectorias de entrenamiento.

Sí se documenta el estado del entrenamiento: paso de optimizador 95.564, 4 épocas completadas, checkpoint en formato v2 y estado "intermedio". No se menciona el uso de RLHF, DPO ni ninguna fase de alineación; en robótica, lo habitual sería entrenamiento supervisado por imitación o aprendizaje por refuerzo, pero esto no se confirma en la información proporcionada. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico en el entorno RoboTwin: el modelo está diseñado como política para tareas de manipulación en simulación.
- Procesamiento de observaciones visuales: la model card exige preservar el preprocesado de observación y la geometría de cámara almacenados en el paquete, lo que implica entrada de imágenes o vídeo con una configuración concreta.
- Generación de acciones y estados normalizados: incluye `dataset_stats.json` con estadísticas de normalización de acciones y estados.
- Representación semántica mediante compresor congelado embebido en el checkpoint.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en manipulación robótica simulada: usar el checkpoint como política base en RoboTwin para reproducir experimentos de control y comparar variantes de entrenamiento, restaurando el contrato v2 con el runtime SemWAM.
- Evaluación de checkpoints intermedios: analizar el efecto del paso de optimizador 95.564 y de las 4 épocas completadas sobre el comportamiento de la política, como referencia de progreso de entrenamiento.
- Reproducibilidad de pipelines: el paquete incluye hashes, manifiesto y estadísticas de normalización, lo que permite reconstruir exactamente el preprocesado y verificar la integridad de los pesos en entornos de laboratorio.
- Fine-tuning posterior: partir de este snapshot como inicialización para ajuste en tareas específicas de RoboTwin, siempre que se respete la configuración de observación y normalización guardada.
- Integración en simuladores de gemelo digital: emplear la política para generar trayectorias de manipulación en entornos simulados antes de transferir a hardware real, con la cautela de que no hay benchmarks de bucle cerrado publicados.
- Docencia y experimentación académica: servir como ejemplo práctico de empaquetado de checkpoints con contrato de inferencia, estadísticas de normalización y verificación de integridad por checksums.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la publicación no establece rendimiento de benchmark en bucle cerrado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 14,6 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en precisión nativa, más el overhead del runtime y de las observaciones.
- GPU recomendadas: no disponibles. Por el tamaño del checkpoint, se necesitarían GPU con 24 GB o más de VRAM (por ejemplo, RTX 3090/4090, A100, H100) para una carga completa, aunque esto es una estimación basada en el tamaño del repo y no un dato publicado.
- Compatibilidad con GPU de consumo: probablemente solo en modelos con 24 GB o más de VRAM; no confirmado.
- Opciones de despliegue: runtime SemWAM (obligatorio para restaurar el contrato v2); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica en formato `.pt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas robóticas para RoboTwin) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento estaba en curso en el momento de la publicación; el rendimiento puede ser inferior al de un modelo final.
- Sin benchmarks de bucle cerrado: la model card advierte que la publicación no establece rendimiento de benchmark.
- Licencia no disponible: no se puede asumir uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Dependencia del runtime SemWAM: la restauración exige usar el runtime propietario y respetar el contrato v2, lo que limita la portabilidad.
- Dependencia de activos externos congelados: deben coincidir con los hashes del `checkpoint_manifest.json`; cualquier desviación invalida la reproducibilidad.
- Preprocesado y normalización fijados: alterar la geometría de cámara o las estadísticas de acción/estado puede degradar el comportamiento de forma no controlada.
- Idiomas no aplicables: es un modelo de robótica, no un modelo de lenguaje; no debe evaluarse con métricas de NLP.
- Riesgo de sobreajuste al simulador: al entrenarse en RoboTwin, la transferencia a hardware real no está documentada.
- Sesgos y alucinación: no se documentan sesgos específicos; en robótica, el equivalente sería comportamiento errático o fuera de distribución ante observaciones no vistas, sin datos publicados al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-RoboTwin-Full-v1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
