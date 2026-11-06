# dddddsds31341/Long-WAM-Nesting-Doll-Epoch-2

## Resumen

Long-WAM Nesting Doll Epoch 2 es un checkpoint de evaluación de un modelo de política robótica (vision-language-action) especializado en la tarea de ensamblar muñecas rusas (nesting dolls) mediante un brazo bimanual. Lo publica el usuario `dddddsds31341` como fine-tune independiente del modelo base `Efficient-Large-Model/Long-WAM-YAM`, del que hereda la arquitectura de vídeo-acción conjunta. El checkpoint corresponde a la época 2 de 5 (paso de optimizador 6858) de un entrenamiento sobre 100 demostraciones teleoperadas.

El modelo resuelve un problema concreto de manipulación bimanual de precisión: insertar secuencialmente cada muñeca pequeña dentro de la siguiente mayor hasta completar el conjunto. No es un modelo de propósito general ni un LLM: es un artefacto de investigación orientado a evaluación cerrada en un robot real, con pesos de 12 GB en formato `model.pt` y dependencias externas (VAE de Wan2.2, codificador de texto UMT5) que no se incluyen en el repositorio.

Su relevancia es acotada pero significativa para quien investiga en VLA de horizonte largo: documenta con detalle inusual la configuración de entrenamiento, las estadísticas de normalización y el código exacto empleado, lo que facilita la reproducibilidad. No obstante, el propio autor advierte de que no se reporta tasa de éxito en bucle cerrado ni validación retenida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (Long-WAM) con codificador de propiocepción; basado en NVlabs/LongLive con cambios SIP |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (historial de 48 pasos P48 y chunk de acción de 32 pasos) |
| Tipos de cuantización | no disponible (pesos almacenados en el dtype original del entrenamiento, BF16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | other (metadatos heredados del modelo base) |
| Formato de pesos | `model.pt` (PyTorch); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue la familia Long-WAM, un enfoque de modelado conjunto de vídeo y acción sobre el que se construye el base `Long-WAM-YAM`. La implementación concreta deriva de `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con las modificaciones SIP (release v22), empaquetadas en `code.zip`. La entrada visual son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320, con un historial de 48 pasos (P48) y predicción de chunks de acción de 32 pasos. La salida es un vector de 14 dimensiones de articulaciones absolutas (6 articulaciones + pinza por brazo, en unidades originales), con estadísticas z-score específicas de la tarea y recorte de valores normalizados en `[-5, 5]`.

El entrenamiento usa el dataset `yuyingyinya/nesting_doll` (revisión `ae8a879c9a635d3c666aba58a4d9ac996225edb8`): 100 demostraciones, 164 571 fotogramas a 30 Hz, todas empleadas para entrenamiento (sin partición de validación). Se ejecutó en cuatro GPUs con batch de 12 por GPU y acumulación 1 (batch global 48), learning rate constante de `1e-5`, AdamW con weight decay 0.01, precisión BF16 y DeepSpeed ZeRO-1. Cada época comprende 3429 actualizaciones y el run completo apunta a 17 145. El checkpoint incluido no conserva estado de optimizador ni scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de acciones de manipulación bimanual de 14 dimensiones (6 articulaciones + pinza por brazo) condicionadas a observaciones visuales multicámara y propiocepción.
- Ejecución de una instrucción de tarea en lenguaje natural: ensamblar muñecas rusas de menor a mayor insertando cada una en la siguiente.
- Procesamiento de tres flujos RGB simultáneos (`top_head`, `hand_left`, `hand_right`) a 384×320.
- Modelado de horizonte temporal largo mediante historial de 48 pasos y predicción de chunks de 32 pasos.
- Integración con el VAE de Wan2.2 y el codificador de texto UMT5 para la parte generativa de vídeo.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües declaradas.

## Casos de uso

- Evaluación de políticas VLA en tareas de ensamblaje preciso: el checkpoint sirve como referencia intermedia (época 2 de 5) para medir la progresión del aprendizaje en la tarea de nesting, cargándolo con `longwam.inference.load_model` y `expected_step=6858`.
- Reproducción de experimentos de fine-tune sobre Long-WAM: al incluir `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt`, permite replicar el pipeline de entrenamiento en un entorno SIP con las mismas versiones de paquetes.
- Investigación en manipulación bimanual con múltiples cámaras: el uso de tres vistas y 14 dimensiones absolutas de articulación lo hace adecuado para estudiar fusión visomotora en robots de dos brazos.
- Estudio de normalización y escalado de acciones: las estadísticas z-score específicas de tarea y el recorte `[-5, 5]` documentados permiten analizar el efecto de la normalización en la estabilidad de la política.
- Desarrollo de adaptadores de robot: el checkpoint está pensado para desplegarse con un adaptador de robot compatible y las convenciones 14D originales, útil para validar integraciones de hardware.
- Docencia y divulgación en robótica de imitación: como ejemplo completo de un run con hiperparámetros, dataset y registro de W&B públicos, sirve para ilustrar el ciclo completo de entrenamiento de un VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero que no se reporta tasa de éxito en robot en bucle cerrado ni resultado de validación retenida, y que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12 GB en `model.pt`, por lo que se requiere al menos esa cantidad más el overhead del VAE de Wan2.2 y del codificador UMT5, que se cargan por separado.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó en cuatro GPUs con BF16 y DeepSpeed ZeRO-1, lo que sugiere hardware de clase centro de datos (A100/H100) para entrenamiento.
- ¿Cabe en GPU de consumo? No disponible; el tamaño de 12 GB de pesos más los componentes auxiliares hacen improbable un despliegue cómodo en GPUs de consumo de gama media, pero no se confirma.
- Opciones de despliegue: carga mediante el checkout de `Long-WAM` incluido en `code.zip`, usando `longwam.inference.load_run_config` y `load_model` con la ruta explícita a `model.pt`, `expected_step=6858` y `strict=True`. Requiere definir `LONGWAM_MODEL_ROOT` y ajustar rutas de datos, estadísticas y caché. No es compatible con `from_pretrained` de Transformers ni se documenta soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Nesting Doll Epoch 2 | no disponible | no disponible (P48 + chunk 32) | Manipulación bimanual, nesting dolls | other | Hugging Face, 19 descargas |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Política VLA generalista | other | Hugging Face |
| NVlabs/LongLive | no disponible | no disponible | Generación de vídeo de horizonte largo | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en robot real ni validación retenida; el autor advierte que la pérdida de entrenamiento no equivale a éxito en la tarea.
- El checkpoint es de época 2 de 5, por lo que representa un estado intermedio del entrenamiento, no el modelo final.
- No conserva estado de optimizador ni scheduler: no permite reanudar el entrenamiento de forma exacta.
- No es un modelo autónomo de Transformers: requiere el VAE de Wan2.2, el codificador UMT5 y el tokenizador, que deben obtenerse por separado.
- La configuración de entrenamiento conserva rutas de sistema de ficheros SIP originales; es necesario reconfigurar rutas en otra máquina.
- Entrenado exclusivamente con 100 demostraciones de una única tarea, lo que limita severamente su generalización a otras tareas u objetos.
- Riesgo de sobreajuste al entorno y a las condiciones de iluminación y cámara de la recogida de datos original.
- Licencia `other` heredada del modelo base: es imprescindible revisar los términos de `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial.
- Idiomas soportados no declarados; la instrucción de tarea está en inglés.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-2
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Repositorio base del código: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)
- Registro de entrenamiento en W&B: https://forge.coreweave.com/wandb/bofang/long-wam/runs/oaplbei2
