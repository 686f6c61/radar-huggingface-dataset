# kunchen23/SparseActionWM-1B

## Resumen

SparseActionWM-1B es un modelo de mundo (world model) para robótica publicado por el usuario kunchen23 en Hugging Face como release de investigación independiente, no oficial de NVIDIA. Se trata de un estudiante destilado de 1.046.292.224 parámetros y 12 bloques derivado de nvidia/DreamDojo, el modelo construido sobre NVIDIA Cosmos, que predice la evolución visual de una escena robótica condicionada por el fotograma actual y una secuencia de acciones. El repositorio incluye además un VAE Wan2.1, un embedding de texto vacío, código de generación portable y un ejemplo de desarrollo preseleccionado (Dev F00).

La relevancia técnica está en el enfoque de sparse action: el estudiante conserva solo 12 de los 28 bloques del modelo profesor (capas 0, 2, 5, 7, 10, 12, 15, 17, 20, 22, 25 y 27) y fue destilado a partir de salidas cacheadas de un profesor de 14B con 35 pasos, durante 12.000 actualizaciones con semilla 42. El resultado es un modelo de aproximadamente 1B de parámetros y 4,8 GB de pesos que puede ejecutar una evaluación de backbone y una decodificación VAE en una GPU de consumo, algo inviable con el profesor.

El modelo está pensado para investigación en planificación y evaluación de políticas robóticas mediante simulación predictiva, no para control de robots en bucle cerrado. La model card es explícita: el ejemplo incluido no establece generalización, éxito de control robótico ni seguridad en bucle cerrado, y el repositorio no ofrece servicio de entrenamiento, inferencia ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (world model) derivado de NVIDIA DreamDojo / Cosmos; estudiante de 12 bloques con VAE Wan2.1 para codificación/decodificación visual |
| Parametros totales | 1.046.292.224 (aproximadamente 1B); el profesor de referencia es de 14B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (condicionado por fotograma actual y secuencia de acciones; no se especifica ventana de tokens) |
| Tipos de cuantizacion | no disponible (pesos distribuidos sin cuantizar en el archivo de assets) |
| Idiomas soportados | en (inglés; el modelo no es lingüístico, la etiqueta se refiere a la documentación y al embedding de texto vacío) |
| Licencia | NVIDIA Open Model License (modelo estudiante); componentes fuente y VAE Wan2.1 bajo Apache 2.0; excerpt de datos bajo CC BY-NC 4.0 |
| Formato de pesos | assets propietarios en `sparse_action_wm_icme_v4_generation_assets.zip` (4.815.314.492 bytes, SHA-256 `de82aa346e29d4d53864244799f337aa579e553097e803323481f583803ed990`); no se distribuyen en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un estudiante de destilación de un world model de difusión basado en la familia NVIDIA Cosmos/DreamDojo. Parte de un profesor de 14B parámetros con 35 pasos de muestreo y retiene únicamente 12 de los 28 bloques del backbone original (capas 0, 2, 5, 7, 10, 12, 15, 17, 20, 22, 25 y 27), lo que reduce el coste computacional en más de la mitad manteniendo la estructura de atención y las conexiones residuales del modelo fuente. La representación visual se gestiona con un VAE Wan2.1 (Apache 2.0), y el condicionamiento textual se sustituye por un embedding de texto vacío, de modo que el modelo no procesa instrucciones en lenguaje natural sino únicamente fotograma actual y acciones.

El entrenamiento consistió en 12.000 actualizaciones con semilla 42 sobre salidas cacheadas del profesor de 14B y 35 pasos, es decir, destilación offline sobre pares (condición, salida del profesor) precalculados. La model card indica que la caché histórica, el optimizador y el pipeline de regeneración end-to-end de la caché del profesor no se incluyen en el repositorio, lo que limita la reproducibilidad completa del entrenamiento. El código incluido soporta una única evaluación del backbone estudiantil para un fotograma actual y una condición de acción dados, seguida de una decodificación VAE; el flujo `linear6` permite además interpolar solo seis filas de acción suministradas, poniendo a cero las no reveladas antes de la interpolación.

## Capacidades

- Predicción de fotogramas futuros en escenas robóticas condicionada por el fotograma actual y una secuencia de acciones (world model visual).
- Evaluación de una única pasada del backbone estudiantil más decodificación VAE para generar la salida visual.
- Modo `full`: uso de la secuencia de acciones completa suministrada.
- Modo `linear6`: interpolación con solo seis filas de acción reveladas, útil para escenarios de acción parcial.
- Verificación de integridad CPU-only mediante `generate_1b.py --verify-only` antes de ejecutar en GPU.
- Comparación numérica con salidas históricas del modelo completo incluidas en el paquete (no como entradas futuras).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni visión general: es un modelo específico de predicción visual robótica.
- Capacidades multilingües: no disponibles; el condicionamiento textual es un embedding vacío.

## Casos de uso

- Investigación en world models para robótica: servir como referencia ligera para estudiar el efecto de la poda de bloques y la destilación sobre la calidad de predicción visual, comparando las salidas del estudiante de 12 bloques con las del profesor de 14B.
- Evaluación de políticas de acción en simulación predictiva: dado un fotograma actual y una secuencia de acciones candidata, generar el fotograma futuro esperado y medir la plausibilidad visual antes de ejecutar la política en un robot real.
- Planificación por búsqueda con modelo de mundo: usar el modelo como rollout barato (1B frente a 14B) para puntuar múltiples secuencias de acción y seleccionar la más prometedora, reduciendo el coste de cada evaluación.
- Reproducción de experimentos académicos: el paquete incluye hashes SHA-256 por archivo en `manifest.json` y un ejemplo Dev F00 preseleccionado, lo que permite verificar resultados bit a bit en la misma plataforma y kernels.
- Docencia y divulgación sobre destilación de modelos generativos: el repositorio documenta el recorte de capas, la caché del profesor y el protocolo de verificación, útil como caso de estudio de destilación offline.
- Pruebas de integración en pipelines de investigación: el script `generate_1b.py` con modos `full` y `linear6` se puede invocar desde un entorno CUDA con PyTorch, NumPy y einops para automatizar comparaciones entre condiciones de acción.
- Análisis de sensibilidad a la información de acción: comparar `full` frente a `linear6` permite estudiar cuánto degrada la predicción la ausencia de filas de acción, informando sobre requisitos de sensores en despliegues reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el paper reporta comparaciones empíricas locales bajo sus contratos de entrada y evaluación declarados, pero no incluye cifras en el repositorio ni en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete de assets ocupa 4,8 GB y el modelo tiene aproximadamente 1B de parámetros, por lo que en FP16 se estiman en torno a 2 GB de pesos más el VAE Wan2.1 y las activaciones, lo que en la práctica debería caber en GPUs de consumo con 8-12 GB o más.
- GPU recomendadas: no especificadas por el autor; se requiere una build de PyTorch compatible con CUDA. Por tamaño, una RTX 4090, RTX 3090 o superior deberían ser suficientes; A100 y H100 quedan sobredimensionadas para inferencia de una sola muestra.
- Cabe en GPU de consumo: previsiblemente sí, en GPUs con al menos 8-12 GB de VRAM, aunque el autor no publica una cifra oficial.
- Opciones de despliegue: el repositorio solo incluye `generate_1b.py` como entrypoint con PyTorch, NumPy y einops. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse en GGUF ni safetensors, estos motores no son aplicables sin conversión previa.
- Latencia y throughput: no disponibles. La model card advierte que los comandos incluidos son ejemplos de generación y no el protocolo de temporización del paper, y que los resultados bit a bit pueden depender de la plataforma y los kernels.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SparseActionWM-1B | 1,046 M (12 bloques) | no disponible | NVIDIA Open Model License | Hugging Face, assets en zip | Estudiante destilado de DreamDojo; un solo ejemplo Dev F00 |
| nvidia/DreamDojo (profesor) | 14B | no disponible | NVIDIA Open Model License | Hugging Face (NVIDIA) | Profesor de 35 pasos; mayor coste computacional |
| Wan2.1 VAE | no disponible | no disponible | Apache 2.0 | Hugging Face | Componente de codificación/decodificación visual incluido en el paquete, no un world model completo |

No se dispone de datos de benchmarks que permitan comparar rendimiento predictivo entre estas alternativas; la comparación se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- El ejemplo incluido es un caso de desarrollo preseleccionado (Dev F00) y no establece generalización a otras escenas, robots o tareas.
- No se ha demostrado éxito de control robótico ni seguridad en bucle cerrado; el modelo no debe usarse para gobernar un robot real sin validación externa.
- No se reclama estado del arte; las comparaciones empíricas del paper se limitan a sus contratos de entrada y evaluación declarados.
- El repositorio no ofrece servicio de entrenamiento, inferencia ni evaluación, y no incluye la caché histórica, el optimizador ni el pipeline de regeneración de la caché del profesor, lo que impide reproducir el entrenamiento de forma completa.
- Los resultados pueden no ser bit a bit idénticos entre plataformas y versiones de kernels CUDA.
- El condicionamiento textual es un embedding vacío: el modelo no acepta instrucciones en lenguaje natural y no es multilingüe.
- La licencia NVIDIA Open Model License aplica al estudiante; los componentes fuente y el VAE Wan2.1 son Apache 2.0, y el excerpt de datos (NVIDIA PhysicalAI-Robotics-GR00T-Teleop-GR1) está bajo CC BY-NC 4.0, cuya condición no comercial es independiente de la licencia del modelo. Es obligatorio revisar `NOTICE.txt`, `licenses/`, `input_provenance.json` y `training_recipe.json` antes de usar o redistribuir.
- El repositorio es una release personal de kunchen23 y no una publicación oficial de NVIDIA; no debe presentarse como canal de revisión anónimo.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede producir fotogramas plausibles pero físicamente incorrectos, especialmente con acciones fuera de la distribución de entrenamiento.
- Sesgos: no documentados en la información disponible; al entrenarse sobre teleoperación de un robot GR1, puede heredar sesgos de ese entorno y configuración de cámara.

## Enlaces

- Hugging Face: https://huggingface.co/kunchen23/SparseActionWM-1B
- Modelo base: https://huggingface.co/nvidia/DreamDojo
- Repositorio DreamDojo: https://github.com/NVIDIA/DreamDojo
- Dataset upstream: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-Teleop-GR1
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
