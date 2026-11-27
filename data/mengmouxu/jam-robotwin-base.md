# Mengmouxu/JAM-RoboTwin-Base

## Resumen

JAM-RoboTwin-Base es un checkpoint de política robótica (policy) denominado "RoboTwin Base command-delta", entrenado durante 200.000 batches y publicado por el usuario Mengmouxu en Hugging Face. Se distribuye como un bundle de inferencia que incluye la configuración del modelo, las estadísticas de normalización, la configuración del encoder y el tokenizador SigLIP. El modelo está diseñado para el benchmark RoboTwin, un entorno de simulación de manipulación robótica, y predice 24 objetivos (targets) por cada replanificación a partir de tres vistas RGB, una instrucción en lenguaje natural y el comando emitido previamente.

La relevancia de este artefacto es acotada pero específica: no es un modelo de lenguaje generalista, sino un componente de investigación para evaluación reproducible de políticas visuomotoras en RoboTwin. El repositorio ocupa 1,9 GB y el checkpoint publicado corresponde al EMA (Exponential Moving Average) del entrenamiento, con hash SHA256 documentado para verificación de integridad.

El acceso es restringido: el bundle es privado y requiere una cuenta de Hugging Face o un token de lectura con permisos sobre el repositorio. La licencia se declara como "other" con nombre "dinov3", remitiendo a la licencia de DINOv3 de Meta, e incorpora además componentes SigLIP bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visuomotora basada en encoder DINOv3 (ViT-B/16) y tokenizador SigLIP; salida command-delta con 24 targets por replan |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato nativo PyTorch, `ema/model.ckpt`) |
| Idiomas soportados | en, zh |
| Licencia | other (license_name: dinov3; componente SigLIP bajo Apache 2.0) |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) |
| Entradas | 3 vistas RGB + instrucción + comando previo |
| Salidas | 24 targets por replanificación (command-delta) |
| Entrenamiento | 200.000 batches (checkpoint EMA) |
| Tamano del repositorio | 1,9 GB |
| SHA256 de `ema/model.ckpt` | `45dc2213b9e7de7ffaa65bfd827ac4bf53cdc6eeccde3a4211b539dcc0644e46` |

## Arquitectura y entrenamiento

La política combina un encoder visual DINOv3 (variante ViT-B/16, según la referencia al checkpoint `facebook/dinov3-vitb16-pretrain-lvd1689m`) con un tokenizador SigLIP (`google/siglip-base-patch16-224`). El modelo consume tres vistas RGB, la instrucción en lenguaje natural y el comando previamente emitido, y produce 24 objetivos por cada ciclo de replanificación bajo un esquema de salida "command-delta", es decir, incrementos sobre el comando anterior en lugar de comandos absolutos. El bundle incluye configuración del modelo, estadísticas de normalización, configuración del encoder y tokenizador, lo que sugiere un pipeline de inferencia autocontenido una vez descargados los pesos.

El entrenamiento se realizó durante 200.000 batches y el checkpoint publicado corresponde al EMA de los pesos, práctica habitual para estabilizar la política final. No se detalla en la información disponible la composición del dataset, el número de tokens o episodios, ni si hubo etapas de ajuste fino con RLHF o DPO; tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El checkpoint selecciona automáticamente la arquitectura de modelo correspondiente según el manifest de casos de evaluación.

## Capacidades

- Predicción de comandos robóticos en formato command-delta a partir de observaciones visuales multi-vista (tres cámaras RGB).
- Condicionamiento por instrucción en lenguaje natural en inglés y chino.
- Uso del comando previo como entrada, lo que permite comportamiento reactivo y consistente entre replanificaciones.
- Generación de 24 targets por replanificación, orientada a control de manipuladores en el simulador RoboTwin.
- Evaluación reproducible sobre suites Clean y Randomized del benchmark RoboTwin, con presupuesto reference3 y el predicado de éxito original de cada tarea.
- Ejecución multi-GPU con reparto de workers (`--devices 0,1,2,3 --workers-per-gpu 1`).
- Reanudación de evaluaciones interrumpidas mediante `--resume` sobre el mismo directorio de salida.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni modo "thinking".

## Casos de uso

- Evaluación reproducible de políticas en RoboTwin: el checkpoint se usa con `eval.robotwin.case_eval` sobre los directorios de casos Clean y Randomized originales, manteniendo el presupuesto reference3 y el predicado de éxito de cada tarea, lo que permite comparar resultados entre checkpoints bajo condiciones idénticas.
- Reproducción de resultados de investigación: al publicarse el SHA256 del checkpoint y la configuración completa, un tercero puede verificar que evalúa exactamente los mismos pesos y obtener cifras comparables.
- Desarrollo de pipelines de manipulación visuomotora: la salida command-delta con 24 targets por replan sirve como base para estudiar esquemas de control incremental en simuladores de robot.
- Investigación en condicionamiento por lenguaje: el modelo acepta instrucciones en inglés y chino, lo que permite analizar cómo varía el comportamiento de la política ante instrucciones en distintos idiomas.
- Pruebas de robustez ante randomización de escena: la suite Randomized del benchmark permite medir la degradación de la política cuando cambian texturas, iluminación o posiciones de objetos.
- Base para ajuste fino: al ser un checkpoint "Base" entrenado 200k batches, puede servir como inicialización para políticas especializadas en tareas concretas dentro de RoboTwin.
- Validación de infraestructura de evaluación: los comandos con `--check` y `--portable-runtime` permiten verificar el renderizador local y las comprobaciones de escena GPU antes de lanzar evaluaciones completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 1,9 GB, pero el consumo en GPU depende del renderizador del simulador y de las tres vistas RGB, no solo de los pesos.
- GPU recomendadas: la guía de evaluación documenta ejecución con `--devices 0,1,2,3 --workers-per-gpu 1`, es decir, un mínimo de cuatro GPU para la configuración de referencia; no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si el checkpoint cabe o funciona en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el flujo soportado es el repositorio `jam-robotwin-eval` (commit `e7b56375c6220b31cc8c34a651c1622bc3701352`) con entorno Conda `jam-robotwin`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.
- Almacenamiento: 1,9 GB para el repositorio; los pesos deben mantenerse juntos en el directorio `ema/`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de RoboTwin ni políticas comparables con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el bundle es privado y requiere cuenta de Hugging Face o token de lectura con permisos; sin acceso no se puede descargar ni evaluar.
- Licencia "other" con nombre "dinov3": el uso está sujeto a la DINOv3 License de Meta, que puede imponer restricciones al uso comercial. El componente SigLIP se distribuye bajo Apache 2.0. Es necesario revisar ambas licencias antes de cualquier uso en producción.
- Dependencia de infraestructura externa: el simulador RoboTwin y sus assets se distribuyen por separado y no forman parte del bundle; sin ellos el checkpoint no es funcional.
- Acoplamiento a un commit concreto: la guía fija el commit `e7b56375c6220b31cc8c34a651c1622bc3701352` de `jam-robotwin-eval`; cambios posteriores en el repositorio pueden romper la reproducibilidad.
- Ámbito limitado: es una política para manipulación robótica en simulación, no un modelo de lenguaje; no debe evaluarse con benchmarks de texto como MMLU o HumanEval.
- Idiomas: solo se declaran inglés y chino; no hay evidencia de soporte para castellano u otros idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en políticas visuomotoras el fallo se manifiesta como comandos inválidos o tareas no completadas, no como texto inventado.
- Sin métricas publicadas: no hay resultados de éxito por tarea en la model card, por lo que no es posible estimar su rendimiento sin ejecutar la evaluación.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mengmouxu/JAM-RoboTwin-Base
- Repositorio de evaluación: https://github.com/Mengmouxu/jam-robotwin-eval/tree/e7b56375c6220b31cc8c34a651c1622bc3701352
- Guía de handover: https://github.com/Mengmouxu/jam-robotwin-eval/blob/e7b56375c6220b31cc8c34a651c1622bc3701352/docs/handover.md#2-reuse-accepted-evaluation-cases
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Encoder DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Tokenizador SigLIP: https://huggingface.co/google/siglip-base-patch16-224
