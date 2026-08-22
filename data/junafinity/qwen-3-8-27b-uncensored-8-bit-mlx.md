# junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX

## Resumen

El modelo `junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX` es una cuantización en 8 bits del modelo multimodal `junafinity/Qwen-3.8-27B-Uncensored`, desarrollado por el usuario junafinity para ejecutarse en Apple Silicon mediante la librería MLX y `mlx-vlm`. El modelo base es una versión "abliterated" (sin censura) del Qwen3.8-27B de Alibaba Cloud, en la que se ha eliminado la dirección de rechazo de los pesos del decodificador de lenguaje mediante una edición directa de pesos (técnica ZeroFuse), no un fine-tune. Esta versión cuantizada reduce el tamaño en disco de 52 GB (bf16) a aproximadamente 28 GB, manteniendo la torre de visión en bf16 sin cuantizar.

El modelo está diseñado específicamente como instrumento de investigación para red teaming y ciberseguridad defensiva: al eliminar los rechazos de seguridad, permite medir el techo real de capacidades de los pesos y evaluar filtros, clasificadores y capas de moderación independientes. Es relevante porque ofrece una alternativa local y eficiente en hardware Apple para este tipo de pruebas controladas, con licencia Apache 2.0. Cabe señalar una discrepancia: el nombre indica "27B", pero el conteo real de parámetros según los safetensors es de 8.027.131.120 (~8B), lo que sugiere que el modelo base podría ser en realidad una variante de 8B o que la nomenclatura es incorrecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.8-27B) |
| Parametros totales | 8.027.131.120 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (blended 8.627 bits/weight) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion 8-bit del checkpoint `junafinity/Qwen-3.8-27B-Uncensored`, que a su vez es una edicion abliterated del Qwen3.8-27B original. La arquitectura subyacente es un transformer multimodal (image-text-to-text) con una torre de vision separada. En esta version MLX, el modelo de lenguaje se cuantiza a 8 bits con grupo de 64, mientras que la torre de vision se mantiene en bf16 sin cuantizar. La cabeza `mtp.*` (multi-token prediction) se elimina porque `mlx-vlm` no la soporta.

El proceso de "uncensoring" se realiza mediante una edicion directa de pesos (ZeroFuse) sobre el decodificador de texto, que ortogonaliza la direccion de rechazo de los pesos residuales. No se trata de un fine-tune ni de un entrenamiento adicional; no hay datos de entrenamiento, tokens ni tecnicas como RLHF o DPO involucrados en esta version. La cuantizacion se aplica posteriormente para reducir el tamano y permitir su ejecucion en hardware Apple.

## Capacidades

- Generacion de texto y conversacion multimodal: puede procesar entradas de texto e imagenes y generar respuestas coherentes.
- Comprension de imagenes: al ser un modelo image-text-to-text, puede describir, analizar y responder preguntas sobre contenido visual.
- Ausencia de rechazos de seguridad: al estar abliterated, no aplica los rechazos tipicos de seguridad del modelo base, lo que permite generar contenido que el original bloquearia.
- Adecuado para pruebas de red teaming: su comportamiento sin filtros permite evaluar el techo de capacidades de los pesos y probar sistemas de moderacion.
- Compatibilidad con MLX: optimizado para Apple Silicon, con soporte en `mlx-vlm` y LM Studio.
- No se documentan capacidades especificas de tool calling, agentes o razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Evaluacion de filtros de moderacion de contenido: al generar respuestas sin rechazos, se pueden probar clasificadores de salida y APIs de moderacion para identificar fallos en la deteccion de contenido danino.
- Red teaming de sistemas de IA: el modelo sirve como objetivo controlado para automatizar bucles de pruebas de penetracion, aislando el control bajo prueba (inyeccion de prompts, abuso de herramientas, exfiltracion de datos).
- Medicion del techo de capacidades: comparando este modelo con su base original, se puede cuantificar cuanta capacidad real esta suprimida por los rechazos de seguridad, util para investigacion en interpretabilidad.
- Generacion de datos etiquetados para entrenar detectores de abuso: se pueden producir completaciones problematicas de forma controlada para entrenar o evaluar modelos de moderacion.
- Investigacion en interpretabilidad de la abliteracion: al ser una edicion rank-1 sobre un rango de capas conocido, sirve como par experimental limpio para estudiar como se codifica el rechazo en los pesos.
- Pruebas de robustez de sistemas de prompt injection: al no contribuir con rechazos propios, permite aislar y evaluar la efectividad de defensas contra inyecciones en aplicaciones desplegadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no publica mediciones de velocidad (tok/s) para este checkpoint, y advierte que los numeros de otros repositorios similares (por ejemplo, 21.8 tok/s en M3 Ultra o 18.7 tok/s en M5 Max) corresponden a sus propias mediciones y no deben atribuirse a este modelo.

## Requisitos de hardware

- Requiere Apple Silicon (cualquier chip de la serie M) con al menos 28 GB de memoria unificada para cargar el modelo completo (tamano en disco de 28 GB).
- GPU recomendadas: Apple M1, M2, M3, M4 o superiores; la memoria unificada es el factor limitante, no la GPU especifica.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; esta pensado exclusivamente para el ecosistema MLX.
- Opciones de despliegue: `mlx-vlm` (CLI y Python), LM Studio (importacion como modelo MLX).
- Latencia y throughput: no disponibles; el autor no publica mediciones propias.

## Comparativa con modelos similares

Existen otros checkpoints abliterated de Qwen3.8-27B en formato MLX, como `orcarouter/Qwen3.8-27B-Uncensored-MLX`, `mlx-community/Qwen3.8-27B-8bit`, `PocketAiHub Abliterated-MLX` y `avlp12 Alis-8bit`. No se dispone de datos comparativos detallados (parametros, contexto, rendimiento) de estos modelos en la informacion proporcionada. Todos comparten la misma base Qwen3.8-27B y la licencia Apache 2.0, pero las diferencias en cuantizacion, edicion de pesos y mediciones de velocidad no estan documentadas en este repositorio.

## Limitaciones y advertencias

- Al ser un modelo abliterated, puede generar contenido danino, ofensivo o ilegal sin restricciones; no debe exponerse como endpoint publico sin una capa de moderacion independiente.
- La abliteracion no elimina todos los rechazos: algunos persisten en interacciones multi-turno, con system prompts especificos o en la ruta de vision.
- El autor advierte que la edicion ZeroFuse es una modificacion de pesos, no un fine-tune, por lo que el comportamiento puede ser impredecible en dominios no probados.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- Los idiomas soportados no estan documentados, aunque el modelo base Qwen es multilingue; no se garantiza un rendimiento uniforme en todos los idiomas.
- La cabeza `mtp.*` se elimina, lo que puede afectar a la velocidad de decodificacion especulativa si se esperaba usar esa funcionalidad.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas, pero como cualquier modelo generativo, puede producir informacion falsa o inventada.

## Enlaces

- Repositorio HuggingFace: [junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX](https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored-8-Bit-MLX)
- Modelo base (bf16): [junafinity/Qwen-3.8-27B-Uncensored](https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored)
- Cabeza draft MTP opcional: [junafinity/qwen38-mtp-head-fc-bf16-4bit](https://huggingface.co/junafinity/qwen38-mtp-head-fc-bf16-4bit)
- Coleccion de la familia: [Qwen-3.8-27B-Uncensored Apple Silicon](https://huggingface.co/collections/junafinity/qwen-38-27b-uncensored-apple-silicon-6a896c726b52be3a0b63400e)
- Libreria `mlx-vlm`: [Blaizzy/mlx-vlm](https://github.com/Blaizzy/mlx-vlm)
- Articulo relacionado (abliteration): [arxiv:2406.11717](https://arxiv.org/abs/2406.11717)
