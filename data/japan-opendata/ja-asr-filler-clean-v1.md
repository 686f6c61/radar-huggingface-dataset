# japan-opendata/ja-asr-filler-clean-v1

## Resumen

ja-asr-filler-clean-v1 es un modelo de clasificación de tokens (token classification) desarrollado por Japan Open Data Lab dentro de su serie de componentes para IA en japonés. Su función es marcar en transcripciones de ASR japonés los segmentos correspondientes a disfluencias —muletillas (えー, あー, そのー), repeticiones y la primera mitad abandonada de las auto-correcciones— para que puedan eliminarse en un postprocesado posterior. El modelo no borra texto: devuelve los intervalos de caracteres y su tipo, y es el consumidor quien aplica la eliminación.

Se trata de un modelo pequeño (110.621.959 parámetros) construido sobre tohoku-nlp/bert-base-japanese-v3, con licencia Apache 2.0 y pesos en safetensors y ONNX (FP32). Está pensado como pieza de una cadena de preprocesado de transcripciones: limpieza de muletillas primero y, después, el componente de restauración de puntuación de la misma serie (ja-punct-restore-v1).

Su relevancia radica en que aborda un problema muy concreto y medible del pipeline de ASR japonés con métricas de error explícitas: en un conjunto de test sellado de 2.000 frases logra una recall de eliminación de muletillas de 0.993 con solo 0.20 caracteres eliminados por cada 1.000 de texto limpio. La contrapartida es que el entrenamiento usa inyección sintética de disfluencias sobre texto limpio, por lo que la distribución puede diferir de la de un ASR real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: tohoku-nlp/bert-base-japanese-v3), cabeza de token classification |
| Parametros totales | 110.621.959 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ONNX FP32 incluido; INT8 no incluido |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder BERT japonés (tohoku-nlp/bert-base-japanese-v3) con una cabeza de clasificación de tokens que etiqueta cada carácter como muletilla, repetición, fragmento de auto-corrección o texto normal, devolviendo intervalos con su tipo. El texto de partida para el entrenamiento son fuentes públicas limpias: transcripciones de ruedas de prensa de la Digital Agency y textos legales de e-Gov (PDL1.0), obras de dominio público de Aozora Bunko en ortografía moderna y frases coloquiales sintéticas. Sobre ese texto limpio se inyectan disfluencias mediante reglas.

La partición de datos se hizo por grupo de procedencia (train/validación/test sellado) con comprobación de duplicados entre todos los pares a 0. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de etiquetado. La innovación destacable es la inclusión de una exportación ONNX FP32 cuyas salidas coinciden con PyTorch en todas las frases evaluadas, con unos 29 ms por frase en CPU.

## Capacidades

- Detección y marcado de muletillas (フィラー) en transcripciones ASR japonesas, con recall de 0.993 en el test sellado.
- Detección de repeticiones (recall 0.769, más débil que las muletillas).
- Detección de la parte abandonada de auto-correcciones (言い直し), con exactitud de 0.962.
- Salida de intervalos de caracteres con tipo de disfluencia, no de texto limpio: la eliminación la aplica el consumidor.
- Clasificación de tokens a nivel de carácter, adecuada como preprocesado de cadenas de ASR.
- Ejecución en CPU eficiente gracias a la exportación ONNX (aproximadamente 29 ms por frase).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Limpieza de transcripciones de reuniones y entrevistas: el modelo marca muletillas y repeticiones en la salida del ASR y el postprocesado las elimina, mejorando la legibilidad antes de enviar el texto a resumen o búsqueda.
- Pretratamiento de subtitulado automático: al eliminar disfluencias antes de la restauración de puntuación (ja-punct-restore-v1), se obtienen subtítulos más cortos y naturales sin alterar el contenido semántico.
- Generación de actas de ruedas de prensa y sesiones públicas: encaja con el dominio de entrenamiento (transcripciones de la Digital Agency) y reduce el ruido en documentos institucionales.
- Pipelines de análisis de sentimiento o extracción de entidades sobre ASR: eliminar muletillas y fragmentos abandonados reduce tokens irrelevantes y mejora la señal para modelos posteriores.
- Indexación y búsqueda sobre archivos de audio transcritos: un texto más limpio mejora la recuperación y evita que las muletillas contaminen los índices.
- Evaluación de la calidad del propio ASR: la proporción de disfluencias detectadas sirve como métrica auxiliar de naturalidad y de tasa de errores de reconocimiento en corpus de habla espontánea.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Recall de eliminación de muletillas (test sellado, 2.000 frases) | 0.993 |
| Caracteres eliminados por error en texto limpio (por 1.000 caracteres) | 0.20 |
| Caracteres con significado eliminados por error en frases con disfluencias (por 1.000 caracteres) | 0.33 |
| Exactitud en el manejo de auto-correcciones | 0.962 |
| Recall de eliminación de repeticiones | 0.769 |
| Coincidencia exacta en conjunto manual estilo ASR (80 frases) | 0.9375 |
| Eliminaciones erróneas en frases normales del conjunto manual | 0 |
| Latencia media por frase en CPU (ONNX FP32) | aproximadamente 29 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 110,6 millones de parámetros; en FP32 ocupa aproximadamente 0,44 GB de pesos y en FP16 unos 0,22 GB, más el overhead de activaciones y runtime.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2 GB de memoria es suficiente (por ejemplo, GTX 1650, RTX 3050 o superiores). También funciona en CPU.
- Cabe en cualquier GPU de consumo actual; el repo completo ocupa 0,9 GB.
- Opciones de despliegue: ONNX Runtime (exportación FP32 incluida), PyTorch, y servidores de inferencia compatibles con modelos de token classification de Hugging Face (por ejemplo, pipelines de Transformers o TGI si admite la arquitectura BERT).
- Latencia y throughput: aproximadamente 29 ms por frase en CPU con la versión ONNX FP32; no se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo se apoya en tohoku-nlp/bert-base-japanese-v3 (Apache 2.0), del que hereda arquitectura y tokenizador, pero no se han publicado comparaciones directas con otros modelos de eliminación de disfluencias en japonés.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| ja-asr-filler-clean-v1 | 110,6 M | no disponible | Eliminación de disfluencias (token classification) | Apache 2.0 |
| tohoku-nlp/bert-base-japanese-v3 | no disponible | no disponible | Modelo base BERT japonés | Apache 2.0 |
| Alternativas de eliminación de disfluencias | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El recall de repeticiones es notablemente inferior al de muletillas (0.769 frente a 0.993), por lo que algunas repeticiones permanecerán en el texto.
- Las disfluencias de entrenamiento se generan por inyección sintética sobre texto limpio; la distribución puede diferir de la de un ASR real y el rendimiento en producción no está garantizado más allá del conjunto manual de 80 frases.
- El modelo solo devuelve intervalos; la lógica de eliminación recae en el consumidor y puede introducir errores si se aplica de forma incorrecta.
- No se incluye versión INT8; solo hay ONNX FP32 y pesos safetensors.
- El modelo está especializado únicamente en japonés; no se documenta soporte multilingüe.
- No se documentan sesgos específicos, pero al entrenarse con textos institucionales y legales puede tener un comportamiento desigual ante registros coloquiales o dialectales no representados.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos que eliminen texto con significado (0.33 por 1.000 caracteres en frases con disfluencias).
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las condiciones de las fuentes de datos de entrenamiento (PDL1.0, Aozora Bunko) si se redistribuyen derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-asr-filler-clean-v1
- Página del modelo en el sitio del autor: https://jpopendata.jp/models/ja-asr-filler-clean-v1/
- Demo en navegador: https://huggingface.co/spaces/japan-opendata/ja-asr-filler-clean-demo
- Perfil del autor: https://huggingface.co/japan-opendata
- Listado de la serie: https://jpopendata.jp/models/
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
