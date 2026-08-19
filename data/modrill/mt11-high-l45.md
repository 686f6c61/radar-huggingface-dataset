# modrill/MT11-HIGH-L45

## Resumen

MT11-HIGH-L45 es un adaptador LoRA no fusionado (dynamic LoRA) desarrollado por el usuario modrill, diseñado para mejorar el rendimiento del modelo base Qwen/Qwen3-4B-Base en problemas de matemáticas de nivel competitivo, concretamente en los conjuntos AIME24 y AIME25. El adaptador se publica por separado del modelo base, con un rank de 64 y alpha de 128, y no incluye los pesos fusionados ni el tokenizer, que debe tomarse de la revisión exacta del base indicada en la documentación.

La relevancia de este lanzamiento radica en su enfoque en el razonamiento matemático con una ventana de contexto ampliada a 32K tokens, y en su metodología de evaluación estandarizada (contrato MT11) que combina muestreo múltiple con revisión automática mediante EvalScope. Sin embargo, el autor declara explícitamente que no se garantiza la reproducibilidad exacta del entrenamiento debido a la falta de una copia del esquema de datos original, y que no se establece una licencia propia para el adaptador, por lo que el usuario debe verificar los términos del modelo base y de las fuentes de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-4B-Base) |
| Parametros totales | 4.000 millones (base) + adaptador LoRA (r=64, alpha=128) |
| Parametros activos | no disponible (el adaptador no es MoE; el base es denso) |
| Longitud de contexto | 32.768 tokens (contrato de evaluacion MT11; el base soporta 32K) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el adaptador no declara idiomas; el base Qwen3-4B soporta multilingue, pero no se especifica para este LoRA) |
| Licencia | no disponible (el autor no declara licencia propia; debe revisarse la del base y las fuentes de datos) |
| Formato de pesos | safetensors (adaptador LoRA, no fusionado) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3-4B-Base, un transformer decoder-only con atención de causalidad estándar, entrenado por Alibaba. Sobre este base se ha aplicado un adaptador LoRA de rank 64 y alpha 128, lo que implica que solo se actualizan matrices de baja dimensión durante el entrenamiento, manteniendo congelados los pesos del base. El adaptador se publica sin fusionar, por lo que en inferencia debe cargarse junto con el base mediante la librería PEFT.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporcionan en la información disponible. El autor menciona que el entrenamiento se realizó con una ruta local específica y una revisión fija del base (`906bfd4b4dc7f14ee4320094d8b41684abff8539`), y que se utilizó un esquema de evaluación con EvalScope y muestreo múltiple. No se describen innovaciones técnicas adicionales más allá del uso de LoRA y la ventana de 32K.

## Capacidades

- Generación de texto y razonamiento matemático: el adaptador está especializado en problemas de nivel AIME, que requieren razonamiento paso a paso y cálculo simbólico.
- Soporte de contexto largo: la evaluación se realiza con una ventana de 32K tokens, lo que permite procesar enunciados extensos y cadenas de razonamiento largas.
- Muestreo múltiple: el contrato de evaluación utiliza 240 muestras por bloque (60 preguntas × 4 seeds), lo que sugiere que el modelo puede generar múltiples soluciones para una misma pregunta.
- No se declaran capacidades de tool calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Resolución de problemas matemáticos competitivos: el modelo puede utilizarse para generar soluciones a problemas de olimpiadas matemáticas (AIME), proporcionando razonamiento detallado y verificable.
- Generación de explicaciones paso a paso: dado un enunciado matemático, el adaptador produce cadenas de razonamiento que pueden servir para tutoría o para validación automática de respuestas.
- Evaluación de modelos en dominios específicos: el contrato MT11 (Think + EvalScope + dynamic LoRA + 32K) puede replicarse para comparar el rendimiento de este adaptador frente a otros en el mismo conjunto de problemas.
- Investigación en adaptación eficiente: al ser un LoRA no fusionado, sirve como caso de estudio para técnicas de fine-tuning de bajo rango en modelos de 4B con contexto largo.
- Prototipado de sistemas de razonamiento matemático: puede integrarse en pipelines que requieran generación de soluciones con muestreo múltiple y selección por consenso.
- Análisis de robustez: los resultados con seeds frescos (46–49) permiten estudiar la variabilidad del modelo ante diferentes inicializaciones de muestreo.

## Benchmarks y rendimiento

Los resultados publicados corresponden al contrato MT11 sobre AIME24+AIME25 (60 preguntas, 240 muestras por bloque, temperature 0.6, top_p 0.95, top_k 20, límite de salida `32768 - prompt_tokens - 64`). Se reportan aciertos por pregunta (cluster), no por muestra individual.

| Métrica | Valor |
|---|---|
| Aciertos seeds 42–45 | 34/240 (14.17%) |
| Aciertos seeds frescos 46–49 | 34/240 (14.17%) |
| Aciertos combinados (seeds 42–49) | 68/480 (14.17%) |
| Health cap (fresco) | 35.000% |
| Health decoded complete box (fresco) | 62.917% |
| Health natural stop (fresco) | 65.000% |
| Health cap (combinado) | 36.458% |
| Health decoded complete box (combinado) | 62.708% |
| Health natural stop (combinado) | 63.542% |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-4B en FP16 ocupa aproximadamente 8 GB. El adaptador LoRA añade unos 0.5 GB adicionales. Con cuantización del base (por ejemplo, 4 bits) la VRAM puede reducirse a unos 4-5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, etc.) puede ejecutar el modelo en FP16. Para cuantización, GPUs con 4-6 GB son suficientes.
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 12GB, RTX 4070, etc., siempre que se cargue el base en FP16 o cuantizado.
- Opciones de despliegue: al ser un adaptador no fusionado, debe usarse la librería PEFT con `PeftModel.from_pretrained` sobre el base. También puede fusionarse el adaptador en el base para usar vLLM, TGI o llama.cpp, aunque el autor no proporciona instrucciones de fusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones directas con otros adaptadores LoRA para matemáticas sobre Qwen3-4B u otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Licencia no definida: el autor no declara una licencia propia para el adaptador. El usuario debe revisar y cumplir la licencia del modelo base (Qwen3-4B-Base, Apache 2.0) y las condiciones de las fuentes de datos utilizadas en el entrenamiento.
- Reproducibilidad no garantizada: el estado de procedencia es `ASSET_FROZEN_PROVENANCE_SCHEMA_MISSING`, lo que significa que falta una copia del esquema de datos de entrenamiento. No se puede garantizar que el entrenamiento sea reproducible exactamente.
- Rendimiento limitado en AIME: el porcentaje de aciertos es bajo (14.17%), lo que indica que el modelo no resuelve la mayoría de los problemas. No es adecuado para uso directo en producción sin verificación humana.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar razonamientos incorrectos o inventar pasos. No se han evaluado sesgos específicos.
- Dependencia del base: el adaptador solo funciona con la revisión exacta del base indicada (`906bfd4b4dc7f14ee4320094d8b41684abff8539`). Usar otra revisión puede degradar el rendimiento o fallar.
- Sin datos de entrenamiento: no se incluyen datos de entrenamiento, respuestas crudas ni estado del optimizador, lo que limita la auditoría del proceso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/modrill/MT11-HIGH-L45
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
