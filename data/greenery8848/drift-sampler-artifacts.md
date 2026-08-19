# greenery8848/drift-sampler-artifacts

## Resumen

El repositorio `greenery8848/drift-sampler-artifacts` no contiene un modelo de IA listo para usar, sino un conjunto de **checkpoints de entrenamiento** (68 archivos, 3,2 GB) pertenecientes a un proyecto de investigación en curso sobre **samplers de un paso para objetivos Boltzmann no normalizados** `p(x) ∝ exp(-E(x))`. El autor, `greenery8848`, lo describe explícitamente como un "backend de almacenamiento" y no como un modelo liberado: los pesos solo tienen sentido junto con el código de entrenamiento e inferencia, que no es público.

Los checkpoints proceden de tres fases del proyecto: una serie de ejecuciones en una estación de trabajo con RTX 5090 (junio de 2026), un conjunto de pruebas en el clúster Hopper H200 de NUS (julio-agosto de 2026) y una ejecución de prueba del pipeline para alanina-dipéptido (julio de 2026). El repositorio carece de definición de modelo, configuración del método, datasets y paper. Su única finalidad es servir de soporte de almacenamiento para el repositorio de código privado del autor, que verifica cada archivo mediante un índice sha256.

Dado que no se trata de un modelo funcional, esta ficha documenta su naturaleza real como artefacto de investigación, sus limitaciones y su contexto, en lugar de las especificaciones típicas de un LLM o modelo de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publica la definición del modelo) |
| Parametros totales | no disponible (solo tensores y estado de optimizador) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se indica ningún formato de cuantización) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | PyTorch (state_dict, safetensors no confirmado; el repo usa librería `pytorch`) |

## Arquitectura y entrenamiento

El repositorio no incluye ninguna definición de arquitectura. Según la model card, se trata de checkpoints de un proyecto de investigación sobre **samplers de un paso para distribuciones de Boltzmann no normalizadas**, donde la energía `E(x)` es la única vía de acceso al objetivo. No hay información sobre el tipo de red (transformer, MLP, etc.), el número de parámetros, la composición del dataset de entrenamiento (de hecho, se afirma que no hay datos de entrenamiento, solo funciones de energía) ni sobre el uso de técnicas como RLHF o DPO.

Los checkpoints se organizan en tres prefijos: `checkpoints/blessed/` (34 archivos, de junio de 2026), `checkpoints/hpc_2026-07/` (30 archivos, del 29 de julio al 1 de agosto de 2026) y `checkpoints/aldp/` (4 archivos, del 31 de julio de 2026). El autor indica que los pesos **no son reproducibles** porque el entrenador no usó `deterministic=True` y las ejecuciones degradan tarde, por lo que los mejores pesos solo existen en un checkpoint intermedio que no se recupera al re-ejecutar. No se proporcionan detalles sobre el kernel de deriva, coeficientes de deriva ni pesos de la función objetivo.

## Capacidades

- **No es un modelo funcional**: no puede generar texto, imágenes, audio ni realizar razonamiento alguno.
- **No tiene capacidades de tool calling, agentes ni multilingües**.
- **Almacena pesos de red**: los tensores y el estado del optimizador son los únicos contenidos.
- **Sirve como respaldo de investigación**: permite reproducir parcialmente experimentos si se dispone del código privado correspondiente.
- **No incluye datasets ni funciones de energía**: solo los checkpoints.

## Casos de uso

Dado que no es un modelo desplegable, los casos de uso son exclusivamente de investigación y desarrollo:

- **Reproducción de experimentos internos**: el autor puede usar estos checkpoints para reanudar entrenamientos interrumpidos o comparar resultados con ejecuciones posteriores.
- **Auditoría de artefactos**: un investigador externo podría inspeccionar los tensores para entender la evolución de los pesos, aunque sin el código no puede interpretarlos.
- **Verificación de integridad**: el script `artifacts.py verify` del repositorio privado comprueba la integridad de cada archivo mediante sha256, lo que permite detectar corrupción o manipulación.
- **Estudio de dinámicas de entrenamiento**: los checkpoints de diferentes fechas (junio vs. julio) podrían analizarse para estudiar la convergencia o el sobreajuste, si se tuviera acceso al código.
- **Transferencia de pesos a otro framework**: si el autor publicara el código, estos pesos podrían cargarse en PyTorch para continuar el entrenamiento o hacer inferencia.
- **Documentación de trazabilidad**: el repositorio sirve como registro de qué ejecución produjo qué pesos, facilitando la atribución de resultados en futuras publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El proyecto está en fase de investigación y no hay paper asociado.

## Requisitos de hardware

- **Para entrenamiento (según la model card)**: se usaron una estación de trabajo con **RTX 5090** y un clúster con **NVIDIA H200** (NUS Hopper). No se especifican requisitos mínimos de VRAM.
- **Para inferencia**: no aplica, ya que no hay un modelo de inferencia definido.
- **Para inspección de checkpoints**: cualquier máquina con PyTorch y suficiente RAM para cargar los tensores (el tamaño total es de 3,2 GB, aunque cada archivo individual puede variar).
- **Opciones de despliegue**: no aplicable (vLLM, Ollama, TGI, etc. no son relevantes para estos artefactos).

## Comparativa con modelos similares

No disponible. No existe una categoría comparable porque este repositorio no es un modelo, sino un conjunto de checkpoints de un proyecto de investigación no publicado. No hay modelos de referencia con los que compararlo.

## Limitaciones y advertencias

- **No es un modelo utilizable**: carece de código, configuración de método y datasets. Los pesos por sí solos no producen ninguna salida.
- **No reproducible**: el entrenamiento no usó semilla determinista, por lo que los checkpoints no pueden regenerarse mediante re-ejecución.
- **Sin documentación técnica**: no hay paper, ni especificación de arquitectura, ni detalles de hiperparámetros.
- **Licencia ambigua**: la licencia es `other`, sin términos claros. El autor pide contactar antes de usar o citar cualquier contenido.
- **Riesgo de malinterpretación**: cualquiera que descargue estos archivos podría pensar que es un modelo listo para usar; no lo es.
- **Procedencia limitada**: la información de qué ejecución produjo cada peso reside en el repositorio de código privado, no en Hugging Face.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/greenery8848/drift-sampler-artifacts)
- [Otro repositorio del mismo autor (shapley-vla-robofactory-sft)](https://huggingface.co/greenery8848/shapley-vla-robofactory-sft) — no relacionado directamente, pero útil para contextualizar la actividad del autor.
- [Documentación de MLflow sobre tracking de experimentos](https://mlflow.org/docs/latest/ml/tracking/) — referencia general sobre gestión de artefactos, no específica de este proyecto.
