# DevAaron2404/gain-predictor

## Resumen

Gain-predictor es un modelo ONNX de regresión ligera, desarrollado por DevAaron2404 en el marco del proyecto estudiantil Adaptive Inference Router de la Hogeschool van Amsterdam. No es un modelo generativo: su función es predecir, a partir únicamente del texto de entrada, cuánto mejoraría un resumen producido por un LLM pesado (Qwen3-4B) frente a uno ligero (Qwen3-0.6B), medido como la diferencia de BERTScore F1 entre ambos. El router lo utiliza para recomendar un modelo al usuario y pedir confirmación antes de ejecutar el modelo pesado.

Técnicamente, el modelo se construye sobre los embeddings de `sentence-transformers/all-MiniLM-L6-v2` (mean pooling y normalización L2) y añade una cabeza de regresión ridge, todo exportado a un grafo ONNX de aproximadamente 0,1 GB. El tokenizador trunca la entrada a 256 tokens. Devuelve cuatro salidas: la ganancia esperada (`gain`), un intervalo de confianza del 90 % (`gain_low`, `gain_high`) y la probabilidad de que la ganancia real supere el umbral de ruido de 0,055 (`real_gain_probability`).

Su relevancia es metodológica más que de rendimiento: es un ejemplo transparente de enrutamiento adaptativo de inferencia con calibración de incertidumbre. El propio autor advierte que el modelo todavía no supera a una línea base que prediga siempre la ganancia media (aproximadamente +0,03), por lo que debe interpretarse como una estimación calibrada de la media y no como una predicción específica por texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLM (encoder transformer) con mean pooling, normalización L2 y cabeza de regresión ridge, exportado a ONNX |
| Parametros totales | no disponible (el modelo base MiniLM-L6 tiene ~22,7 M, pero el autor no declara el recuento del grafo exportado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado por el tokenizador) |
| Tipos de cuantizacion | no disponible (el repo se distribuye como ONNX; el tag `base_model:quantized` afecta solo al modelo base) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos etapas dentro de un único grafo ONNX. Primero, el texto tokenizado (`input_ids`, `attention_mask`, `token_type_ids`) pasa por MiniLM-L6, se aplica mean pooling y normalización L2 para obtener un embedding de frase. Después, una cabeza de regresión ridge (con penalización elegida por validación cruzada) proyecta ese embedding sobre la ganancia esperada de BERTScore. El grafo incorpora además los errores de validación retenidos que definen el intervalo del 90 % y la probabilidad de superar el umbral de ruido; estos valores se almacenan en los metadatos (`metric`, `noise_threshold`, `interval`).

El entrenamiento usa 100 artículos de noticias en inglés de CNN/DailyMail. Las etiquetas son la ganancia de BERTScore F1 por texto, calculada como diferencia entre el resumen de Qwen3-4B y el de Qwen3-0.6B, promediada sobre 5 resúmenes muestreados por modelo y dos ejecuciones. La evaluación se realizó con validación cruzada de 5 particiones repetida 10 veces: RMSE de 0,045 frente a 0,044 de la línea base de la media, y el intervalo del 90 % cubrió el 89 % de las ganancias retenidas. No se emplearon RLHF ni DPO; es un ajuste supervisado clásico sobre representaciones congeladas.

## Capacidades

- Predicción de ganancia esperada de BERTScore al pasar de un LLM ligero a uno pesado, a partir del texto fuente.
- Estimación de incertidumbre mediante intervalo del 90 % (`gain_low`, `gain_high`).
- Probabilidad calibrada de que la ganancia supere el umbral de ruido de 0,055 (`real_gain_probability`).
- Enrutamiento de inferencia: recomendación de modelo y solicitud de confirmación al usuario antes de ejecutar el modelo pesado.
- Procesamiento de texto en inglés exclusivamente, con truncado a 256 tokens.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento adaptativo en pipelines de resumen: el router consulta `gain` y `real_gain_probability` para decidir si merece la pena invocar Qwen3-4B en lugar de Qwen3-0.6B, ahorrando coste de inferencia en textos donde la mejora esperada es marginal.
- Control de costes en producción: al disponer de un intervalo del 90 %, se puede fijar una política conservadora (por ejemplo, usar el modelo pesado solo si `gain_low` supera el umbral) y medir el ahorro frente a usar siempre el modelo grande.
- Investigación en enrutamiento de modelos: sirve como referencia reproducible de cómo calibrar un predictor de ganancia sobre embeddings congelados y cuantificar su incertidumbre.
- Docencia y prototipado: al ser un ONNX de 0,1 GB con licencia Apache 2.0, se integra fácilmente en cuadernos y demos de sistemas de inferencia adaptativa.
- Filtrado previo en sistemas de resumen por lotes: descartar o marcar artículos donde el modelo ligero es suficiente, reduciendo el número de llamadas al modelo pesado en un corpus de noticias en inglés.
- Evaluación de la calidad de resúmenes: usar la ganancia predicha como señal auxiliar para priorizar qué documentos revisar manualmente en un flujo de control de calidad.

## Benchmarks y rendimiento

| Metrica | Gain-predictor | Linea base (media) |
|---|---|---|
| RMSE (validación cruzada 5x10) | 0,045 | 0,044 |
| Cobertura del intervalo del 90 % | 89 % de las ganancias retenidas | no aplica |
| Ganancia media observada | ~+0,03 | ~+0,03 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repo ocupa 0,1 GB y el modelo base MiniLM-L6 ronda los 90 MB en FP32.
- GPU recomendadas: cualquiera con soporte ONNX Runtime; no requiere GPU dedicada, funciona en CPU con latencia de milisegundos por texto.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, e incluso iGPU) y en CPU sin problemas.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript), integración en servicios web o como paso previo a un router que invoque vLLM o TGI para los modelos generativos.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño del modelo y el truncado a 256 tokens, se espera un coste despreciable frente a la inferencia de los LLM que enruta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DevAaron2404/gain-predictor | Regresor ONNX sobre MiniLM | no disponible (~22,7 M en el encoder base) | 256 tokens | Apache 2.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de frases | ~22,7 M | 256 tokens | Apache 2.0 | Hugging Face |
| Routers basados en clasificadores (p. ej. RouteLLM) | Enrutamiento de LLM | no disponible | variable | variable | Investigación / repos públicos |

No se dispone de datos de rendimiento comparables publicados para alternativas de enrutamiento en la información proporcionada; la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no supera a la línea base de la media (RMSE 0,045 frente a 0,044); sus predicciones se mantienen cerca de la ganancia media de +0,03 y no son específicas por texto.
- Entrenado con solo 100 artículos de noticias en inglés de CNN/DailyMail; otros dominios y tipos de texto quedan fuera de alcance.
- El tokenizador trunca a los primeros 256 tokens, por lo que textos largos pierden información relevante.
- El intervalo de confianza tiene la misma anchura para todos los textos, lo que limita su utilidad como medida de incertidumbre por instancia.
- Solo inglés; no soporta otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de calibración incorrecta fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento en producción.
- Proyecto estudiantil sin mantenimiento declarado ni descargas registradas (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevAaron2404/gain-predictor
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio del proyecto (referenciado en la model card): `individual/Aaron/Projects/gain-predictor` en el repositorio de grupo del autor (no se proporciona URL directa)
- Proyecto Adaptive Inference Router, Hogeschool van Amsterdam: no disponible enlace directo en la información proporcionada
