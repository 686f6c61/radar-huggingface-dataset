# fecasado/gfm-kitchen-pan-baseline2

## Resumen

`fecasado/gfm-kitchen-pan-baseline2` es una política de imitación para robótica publicada en Hugging Face con la librería LeRobot. No es un modelo de lenguaje: su salida son acciones de control para un brazo robótico, entrenado sobre el dataset `fecasado/pan-on-hob-320x240` para la tarea de manipular una sartén y colocarla sobre un fogón. El repositorio declara la arquitectura `gaze_flow_matching`, 75.216.858 parámetros y pesos en `safetensors` bajo licencia Apache 2.0.

Su relevancia es doble: sirve como baseline reproducible para experimentos de imitación visomotora con flow matching y como ejemplo de pipeline LeRobot de extremo a extremo. Sin embargo, la model card es una plantilla genérica sin actualizar, no incluye benchmarks ni detalla el backbone visual, la composición del dataset o la configuración exacta del robot. Con 75,2 millones de parámetros y un repositorio de 0,3 GB es ligero y ejecutable en hardware de consumo, pero su validez práctica queda acotada al dominio de cocina y a la configuración experimental del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gaze_flow_matching` (política de imitación para robótica; detalles del backbone no disponibles) |
| Parámetros totales | 75.216.858 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje y no se documenta el historial de observaciones |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; no es un modelo lingüístico |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería LeRobot) |
| Dataset de entrenamiento | `fecasado/pan-on-hob-320x240` |
| Resolución de observación | no disponible; el dataset se denomina `pan-on-hob-320x240` |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

La etiqueta `gaze_flow_matching` indica una política de imitación basada en flow matching y condicionada por la mirada, aunque la información disponible no especifica el encoder visual, el predictor de flujo, la dimensionalidad de las acciones ni el número de pasos de integración. La model card no reconoce el tipo de modelo ("Model type not recognized") y remite a la documentación genérica de LeRobot.

El entrenamiento se realizó con LeRobot sobre el dataset `pan-on-hob-320x240`. No se indican número de episodios, horas de demostración, composición del dataset ni si hubo aumento de datos. No hay evidencia de RLHF, DPO ni aprendizaje por refuerzo; por la naturaleza del pipeline, se trata de aprendizaje por imitación supervisado. El snippet de entrenamiento de la model card usa `--policy.type=act`, pero es una plantilla genérica y no confirma que este checkpoint use ACT.

## Capacidades

- Generación de acciones motoras para manipulación robótica, no de texto.
- Control visomotor a partir de observaciones de cámara, presumiblemente imágenes de 320x240 según el nombre del dataset.
- Ejecución de una tarea concreta: manipulación y colocación de una sartén sobre un fogón.
- Posible condicionamiento por mirada (`gaze`) según la etiqueta del repositorio; el mecanismo exacto no está documentado.
- Integración con el ecosistema LeRobot para entrenamiento, registro y evaluación.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de lenguaje.
- No dispone de modo de razonamiento (`thinking mode`), visión general, audio ni entrada de texto.

## Casos de uso

- **Colocación de sartén sobre fogón con un brazo LeRobot**: el modelo puede ejecutar la política de manipulación si el robot, la cámara y la disposición de la cocina coinciden con los del dataset de entrenamiento; el comando de evaluación de la model card usa `so100_follower` como ejemplo de configuración.
- **Baseline para investigación en gaze flow matching**: permite comparar variantes de políticas de imitación condicionadas por mirada sobre una misma tarea y un mismo dataset, midiendo tasa de éxito y precisión de colocación.
- **Fine-tuning con demostraciones propias**: al ser un checkpoint ligero de 75,2 M de parámetros, puede reentrenarse con nuevas demostraciones de cocina para adaptar la política a otro robot, utensilio o distribución de la encimera.
- **Evaluación reproducible con LeRobot**: se puede usar con `lerobot-record` para registrar episodios de evaluación y generar datasets etiquetados con el prefijo `eval_`, facilitando la comparación entre checkpoints.
- **Estudio de imitación visomotora con imágenes de baja resolución**: sirve como caso práctico para analizar cómo afectan la resolución 320x240, la iluminación y el encuadre de la cámara al rendimiento de una política de flow matching.
- **Docencia y reproducción de pipelines de robótica open source**: el repositorio y el dataset asociado permiten montar un flujo completo de entrenamiento y evaluación con LeRobot en un laboratorio o curso, siempre que se disponga del hardware robótico adecuado.
- **Pruebas de integración en laboratorio**: útil para validar la comunicación entre una política LeRobot, el robot follower y el sistema de captura de imágenes antes de entrenar políticas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Pesos del modelo**: 75,2 M de parámetros. En fp32 ocupan aproximadamente 301 MB; en fp16, unos 150 MB; en int8, unos 75 MB. Son cálculos teóricos que no incluyen activaciones, buffers ni el encoder visual.
- **VRAM estimada para inferencia**: por debajo de 2 GB en fp16 para el modelo y activaciones típicas de imágenes 320x240. Es una estimación, no un dato confirmado por el autor.
- **GPU recomendadas**: cualquier GPU CUDA con al menos 4 GB de VRAM. Funcionan RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100 40/80 GB y H100. También debería caber en GPUs de consumo más modestas, aunque la latencia no está documentada.
- **Despliegue**: LeRobot mediante `lerobot-record` y PyTorch/CUDA. vLLM, TGI, llama.cpp y Ollama no aplican porque no es un modelo de lenguaje. No hay soporte documentado de TensorRT u ONNX.
- **Latencia y throughput**: no disponible. Al ser una política robótica, la frecuencia de control y el tiempo de inference dependen del robot, la cámara y el pipeline de LeRobot.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gfm-kitchen-pan-baseline2` | gaze flow matching | 75,2 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| `fecasado/gfm-kitchen-pan-baseline` | política LeRobot de la misma familia | no disponible | no disponible | no disponible en la información | Hugging Face |
| ACT (`policy.type=act` en LeRobot) | política de imitación con transformer | no disponible | no disponible | no disponible | implementación en LeRobot |
| Diffusion Policy | política de imitación por difusión | no disponible | no disponible | no disponible | referencia genérica en robótica |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación es cualitativa y de categoría: todas son políticas de imitación para control robótico, pero no se han publicado métricas comunes de tasa de éxito, precisión o latencia.

## Limitaciones y advertencias

- **Sesgos del dataset**: al entrenarse con un único dataset de cocina, hereda los sesgos del demostrador, la disposición de la encimera, la cámara, la iluminación y el tipo de sartén. No se documenta diversidad de escenarios.
- **Riesgo de acciones incorrectas**: no hay alucinación lingüística, pero sí riesgo de movimientos erróneos por cambio de distribución (`distribution shift`) si el entorno difiere del de entrenamiento.
- **Limitación de contexto y idioma**: no es un modelo lingüístico ni multilingüe; no procesa instrucciones en lenguaje natural.
- **Licencia**: Apache 2.0 permite uso comercial del checkpoint, pero la licencia del dataset `fecasado/pan-on-hob-320x240` no se indica en la información disponible. Verificar antes de un uso comercial.
- **Model card incompleta**: la plantilla no reconoce el tipo de modelo, no incluye benchmarks, no detalla el entrenamiento y el repositorio tiene 0 descargas y 0 likes, lo que limita la validación externa.
- **Seguridad física**: en producción hay que validar la política con paradas de emergencia, límites de par, zonas de exclusión y supervisión humana. No se documentan protocolos de seguridad.
- **Compatibilidad**: no hay garantía de que el checkpoint funcione con un robot, una cámara o una frecuencia de control distintos de los usados por el autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fecasado/gfm-kitchen-pan-baseline2)
- [Dataset pan-on-hob-320x240](https://huggingface.co/datasets/fecasado/pan-on-hob-320x240)
- [Modelo baseline de la misma familia](https://huggingface.co/fecasado/gfm-kitchen-pan-baseline)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas en LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
