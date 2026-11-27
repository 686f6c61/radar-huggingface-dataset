# dexpoint/bulb1-policy-inference-20261126

## Resumen

Bulb1 policy inference es un conjunto de siete checkpoints de políticas de control robótico publicados por dexpoint bajo el identificador `dexpoint/bulb1-policy-inference-20261126`. No se trata de un modelo de lenguaje, sino de políticas de imitación entrenadas para manipulación robótica de precisión: concretamente, políticas conjuntas de 28 dimensiones para un robot CRX6 con pinza SHARPA22, que operan a 10 Hz con horizontes de observación, predicción y ejecución de 2, 16 y 8 pasos respectivamente.

Los siete modelos corresponden a variantes "scratch" (entrenadas desde cero) de tres familias de métodos: DexCap (original y refinado), VideoManip (original y refinado), una variante propia basada en ResNet18 + PointMLP con compuerta dinámica, y una variante de visión con DP (diffusion policy) refinada. Todos ellos son exportaciones portables de pesos EMA procedentes de una cohorte de entrenamiento completada sobre 89 fuentes de entrenamiento y 10 de validación, con 200 épocas y semilla 1703.

La relevancia de esta publicación es acotada y fundamentalmente de reproducibilidad: el autor distribuye los pesos portables junto con el código fuente fijado a un commit concreto, los normalizadores originales, el contrato de acciones/articulaciones/tiempos y la procedencia (hashes SHA256). El propio autor advierte explícitamente de que el replay simulado no demuestra éxito físico, de que no se ha abierto comunicación con hardware y de que algunos modelos exceden el presupuesto de tiempo real de 100 ms. Es, por tanto, material de referencia para investigación en políticas de manipulación, no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de imitación para robótica: ResNet18 + PointMLP con compuerta dinámica (variante "ours"), adaptador de manipulación DP3 (VideoManip) y variantes DexCap; no se detalla la arquitectura interna de cada una de las siete |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizontes de observación/predicción/ejecución de 2/16/8 pasos a 10 Hz |
| Tipos de cuantizacion | no disponible (pesos en `.pt`, exportaciones EMA) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch), cada bundle acompañado de su `.json` homónimo; `MANIFEST.json` con tamanos y SHA256 |
| Dimension de acciones | 28D (CRX6 + SHARPA22) |
| Frecuencia de control | 10 Hz |
| Tamano del repositorio | 1,6 GB |
| Entrenamiento | 89 fuentes de entrenamiento, 10 de validación, 200 épocas, semilla 1703 |

## Arquitectura y entrenamiento

El repositorio agrupa siete políticas entrenadas desde cero sobre una cohorte común ("real-bulb1 matched99"): `dexcap_original_scratch`, `dexcap_refined_scratch`, `videomanip_original_scratch`, `videomanip_refined_scratch`, `ours_original_scratch`, `ours_refined_scratch` y `vision_dp_refined_scratch`. La variante "ours" se describe como el modelo original ResNet18 + PointMLP con compuerta dinámica y su cabeza de etapa entrenada; el autor aclara que no es el barrido de compuerta igualada pendiente ni una variante con DINOv3 o PointTransformer. VideoManip corresponde al adaptador de manipulación DP3 descrito en la guía del proyecto.

El entrenamiento se realizó sobre 89 fuentes de entrenamiento y 10 de validación durante 200 épocas con semilla 1703. Las exportaciones incluyen pesos EMA, los normalizadores originales, el contrato de acciones, articulaciones y tiempos, y la procedencia; se omiten deliberadamente el optimizador, el estado del RNG, las observaciones de entrenamiento y las credenciales. Los checkpoints originales de entrenamiento permanecen en el servidor de entrenamiento y solo se distribuyen las exportaciones EMA portables. El paquete `inference_code_9f0cef3.tar.gz` contiene el subconjunto de código fuente fijado al commit 9f0cef3 (configuraciones, tests y definiciones de dependencias), pero no un entorno Python empaquetado; `RUNTIME.json` recoge el inventario de paquetes de referencia y las revisiones y hashes de las fuentes externas de DP3 y Stanford.

## Capacidades

- Generación de trayectorias de control articular de 28 dimensiones para un robot CRX6 con pinza SHARPA22.
- Políticas de imitación condicionadas por observaciones (visión y, en la variante "ours", nube de puntos) con horizonte de predicción de 16 pasos y ejecución de 8 pasos.
- Control a 10 Hz con contrato explícito de tiempos y articulaciones incluido en los metadatos.
- Siete variantes metodológicas comparables sobre la misma cohorte, lo que permite evaluación cruzada de métodos (DexCap, VideoManip/DP3, ResNet18+PointMLP, diffusion policy).
- Verificación de integridad de transferencia mediante SHA256 en `MANIFEST.json` y en el JSON de metadatos emparejado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye capacidades de audio ni de generación de texto.

## Casos de uso

- Reproducción de experimentos de manipulación robótica: los siete checkpoints permiten reproducir el replay simulado del pipeline `tools/rollout_real_bulb1.py` y comparar metodologías sobre una cohorte idéntica (89 fuentes de entrenamiento, 10 de validación, semilla 1703).
- Evaluación comparativa de métodos de imitación: al compartir cohorte y contrato de acciones, las variantes DexCap, VideoManip y "ours" se pueden evaluar con la misma métrica de error de trayectoria sin reentrenar.
- Investigación en políticas multimodales visión + nube de puntos: la variante ResNet18 + PointMLP con compuerta dinámica sirve como referencia para estudiar la fusión de modalidades en tareas de enroscado de precisión.
- Integración en un adaptador de hardware propio: el código deja `RobotAPI.read_observation`, `send_joint_target` y `stop` como stubs intencionados, de modo que el equipo puede implementar su adaptador y validar la política contra un robot CRX6 real.
- Auditoría de procedencia de modelos: los hashes SHA256 de checkpoints y arquitecturas permiten verificar que los pesos cargados corresponden a las fuentes declaradas, útil en entornos con requisitos de trazabilidad.
- Estudio de latencia y presupuesto de tiempo real: el autor advierte de que algunos modelos exceden los 100 ms por paso, lo que convierte el repositorio en un banco de pruebas para medir qué variantes cumplen el ciclo de 10 Hz antes de desplegar.
- Docencia y formación en robótica de manipulación: el paquete incluye configuraciones, tests y una guía de rollout que permiten montar prácticas sobre un pipeline completo de inferencia de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que el replay simulado (mock replay) pasó para los siete modelos, que algunos exceden el presupuesto de 100 ms de tiempo real y que no se abrió comunicación con hardware. No se aportan cifras de éxito de tarea, error de trayectoria ni tasas de enroscado validadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,6 GB, pero incluye siete bundles `.pt`, metadatos, manifiesto y el archivo de código fuente; el peso individual por modelo no se detalla.
- GPU recomendadas: no disponible. El autor no especifica hardware de referencia para el rollout.
- Compatibilidad con GPU de consumo: no confirmada. Dado que la variante "ours" emplea ResNet18 + PointMLP, es plausible que quepa en GPU de consumo, pero no hay dato publicado que lo respalde.
- Opciones de despliegue: inferencia mediante el código fuente fijado al commit 9f0cef3 y el entry point `tools/rollout_real_bulb1.py`; requiere instalar localmente las dependencias externas de DP3 y Stanford según `RUNTIME.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el contrato es de 10 Hz (100 ms por paso); el autor advierte de que algunos modelos superan ese presupuesto, sin indicar cuáles ni por cuánto.
- Requisito crítico: los hashes de los ficheros de arquitectura deben conservarse, ya que la carga falla si las fuentes de arquitectura difieren.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bulb1-policy-inference (este) | Política de imitación robótica, 7 variantes | no disponible | 2/16/8 pasos a 10 Hz | no disponible | Hugging Face, repo de 1,6 GB |
| DP3 (adaptador VideoManip incluido) | Diffusion policy 3D | no disponible | según configuración DP3 | no disponible en esta ficha | Referenciado como dependencia externa con revisión y hash en `RUNTIME.json` |
| DexCap (variantes incluidas) | Captura y política de manipulación diestra | no disponible | según configuración DexCap | no disponible en esta ficha | Variantes incluidas en este repo; código original no enlazado |
| Otras políticas de manipulación open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas externas no está disponible: la model card no ofrece métricas ni referencias de rendimiento frente a otros sistemas.

## Limitaciones y advertencias

- El replay simulado superado para los siete modelos no establece éxito físico, calibración real validada ni readiness de hardware a 10 Hz; el propio autor lo señala de forma explícita.
- Algunos modelos exceden el presupuesto de 100 ms de tiempo real, lo que impide garantizar el ciclo de control de 10 Hz en todos los casos.
- No se abrió comunicación con hardware durante la validación; `RobotAPI.read_observation`, `send_joint_target` y `stop` son stubs intencionados que el integrador debe implementar.
- Los artefactos contienen predicciones del modelo, no evidencia validada de enroscado de precisión ni de éxito de tarea.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- La carga falla si los ficheros de arquitectura no coinciden con los hashes esperados, lo que restringe la modificación del código de arquitectura.
- El paquete de código es un subconjunto de fuentes, no un entorno Python completo: las dependencias externas de DP3 y Stanford deben instalarse localmente.
- Cada bundle `.pt` debe viajar junto con su `.json` homónimo; separarlos rompe el contrato de normalizadores y metadatos.
- No se dispone de información sobre sesgos, cobertura de dominios de manipulación ni generalización fuera de la cohorte "real-bulb1 matched99".
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dexpoint/bulb1-policy-inference-20261126
- Perfil del autor: https://huggingface.co/dexpoint
- Código de inferencia incluido en el repo: `inference_code_9f0cef3.tar.gz` (commit 9f0cef3)
- Entry point de rollout: `tools/rollout_real_bulb1.py` (dentro del paquete de código)
- Guía de integración: `ROLLOUT_GUIDE.md` (dentro del repo)
- Inventario de dependencias: `RUNTIME.json` (dentro del repo)
- Manifiesto de integridad: `MANIFEST.json` (dentro del repo)
- Papers, blogs, repos o demos adicionales: no disponible en la información proporcionada.
