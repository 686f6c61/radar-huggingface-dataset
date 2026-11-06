# ArnavPoswal15/xlnet-fraud-call

## Resumen

xlnet-fraud-call es un modelo de clasificación de texto obtenido mediante ajuste fino de `xlnet-base-cased` sobre un conjunto de datos propio orientado a la detección de fraudes telefónicos. El modelo resuelve una tarea binaria: clasificar una transcripción de llamada como fraude (clase 1) o no fraude (clase 0). Lo publica el usuario ArnavPoswal15 en Hugging Face con licencia MIT y un único artefacto de pesos en formato PyTorch `state_dict` (`xlnet_fraud.pt`), no como carpeta completa de modelo de Transformers.

La arquitectura subyacente es XLNet en su variante base con cased, un transformer autorregresivo-permutacional de aproximadamente 110 millones de parámetros y una longitud de contexto típica de 512 tokens. El modelo se distribuye únicamente en inglés y está pensado para un caso de uso muy acotado: análisis de transcripciones normalizadas de llamadas con posible intención fraudulenta.

La relevancia es limitada y experimental: el propio autor reporta una evaluación sobre solo 21 transcripciones, con 20 aciertos (95,2 %), 1 falso positivo y 0 fraudes no detectados. No hay benchmarks públicos, ni datos de entrenamiento cuantificados, ni pipeline de despliegue estándar más allá de cargar el `state_dict` manualmente sobre la arquitectura base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLNet (transformer autorregresivo con objetivo de modelado por permutación), variante base cased |
| Parámetros totales | no disponible en la información proporcionada (el modelo base xlnet-base-cased ronda los 110 M, dato no confirmado en la ficha del autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base XLNet base admite típicamente 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`xlnet_fraud.pt`), no safetensors ni GGUF; requiere cargar la arquitectura base por separado |
| Tarea | Clasificación de texto binaria (fraude / no fraude) |
| Etiquetas | 0 = no fraude, 1 = fraude |
| Tamaño del repositorio | 0,5 GB |
| Librería | PyTorch / Transformers |
| Modelo base | `xlnet/xlnet-base-cased` |

## Arquitectura y entrenamiento

El modelo parte de `xlnet-base-cased`, un transformer con objetivo de entrenamiento autorregresivo basado en permutaciones que combina ventajas de los modelos autorregresivos y de los autoencoder. Sobre esa base se ha añadido una cabeza de clasificación de secuencia con dos etiquetas (`XLNetForSequenceClassification`, `num_labels=2`). El ajuste fino se realizó sobre el `state_dict` completo, que se distribuye como un único fichero `.pt`.

Los datos de entrenamiento, según la model card del autor, combinan tuits relacionados con estafas para la clase positiva (fraude) y conversaciones del Santa Barbara Corpus para la clase negativa (no fraude). No se especifican el número de ejemplos, la proporción entre clases, el número de épocas, la tasa de aprendizaje ni si hubo técnicas de aumento de datos o balanceo. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste con preferencias, algo esperable en un modelo de clasificación.

El preprocesado indicado por el autor consiste en normalizar el texto de la transcripción y añadir la secuencia `" [SEP] [CLS]"` al final, tokenizando con `XLNetTokenizer("xlnet-base-cased", do_lower_case=True)`. Este detalle es relevante porque XLNet usa `[CLS]` como último token de la secuencia en su convención de entrada, y el orden de los tokens especiales afecta directamente al rendimiento del clasificador.

## Capacidades

- Clasificación binaria de transcripciones de llamadas telefónicas en fraude (clase 1) o no fraude (clase 0).
- Procesamiento de texto en inglés exclusivamente.
- Manejo de transcripciones normalizadas con separadores explícitos `[SEP] [CLS]` al final.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No genera texto libre: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Filtrado previo de llamadas sospechosas en centralitas VoIP: el modelo puede puntuar transcripciones generadas por ASR en tiempo casi real y marcar aquellas con alta probabilidad de fraude para revisión humana, aprovechando que la inferencia sobre XLNet base es ligera.
- Moderación en plataformas de atención telefónica: integrado como paso de clasificación sobre transcripciones almacenadas, permite etiquetar automáticamente conversaciones para auditoría posterior y priorizar las que requieren intervención.
- Análisis retrospectivo de fraude en registros históricos: aplicar el clasificador por lotes sobre un archivo de transcripciones para identificar patrones y construir un conjunto etiquetado que alimente un modelo más robusto.
- Señal auxiliar en sistemas de detección antifraude: combinar la probabilidad de la clase 1 con reglas heurísticas (número de origen, duración, palabras clave) para reducir falsos positivos en un motor de scoring.
- Prototipado e investigación académica: sirve como punto de partida reproducible (licencia MIT, pesos públicos) para experimentar con clasificación de fraude telefónico y comparar con otros encoders como BERT o RoBERTa.
- Demostración educativa de ajuste fino de XLNet: útil para mostrar el flujo completo de carga de un `state_dict` sobre `XLNetForSequenceClassification` y el preprocesado específico de tokens especiales de XLNet.

## Benchmarks y rendimiento

El autor reporta una única evaluación sobre 21 transcripciones de llamadas:

| Métrica | Valor |
|---|---|
| Transcripciones evaluadas | 21 |
| Predicciones correctas | 20 |
| Precisión (accuracy) | 95,2 % |
| Falsos positivos (no fraude clasificado como fraude) | 1 |
| Fraudes no detectados (falsos negativos) | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, ni comparaciones con otros modelos sobre el mismo conjunto de evaluación. El tamaño muestral de 21 casos es demasiado reducido para extraer conclusiones sólidas sobre el rendimiento en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base XLNet base ronda los 110 M de parámetros; en FP32 ocupa aproximadamente 0,4-0,5 GB de pesos, y en FP16 alrededor de 0,2-0,25 GB. La VRAM total necesaria con activaciones y batch pequeño se sitúa típicamente por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060 o superior cubre el caso con holgura; para despliegue por lotes a gran escala, una A100 o H100 no aporta ventajas significativas frente a GPUs de gama media por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes con latencia aceptable.
- Opciones de despliegue: el modelo no se distribuye como carpeta de Transformers estándar, por lo que no se puede cargar directamente con `pipeline("text-classification")` ni con vLLM, TGI o llama.cpp sin convertir previamente el `state_dict` a un formato de modelo completo. El flujo documentado por el autor es cargar `XLNetForSequenceClassification.from_pretrained("xlnet-base-cased", num_labels=2)` y aplicar `load_state_dict` con el fichero descargado mediante `hf_hub_download`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlnet-fraud-call | no disponible (base XLNet ~110 M) | no disponible (base 512) | Clasificación fraude binaria | MIT | Pesos `state_dict` en Hugging Face |
| xlnet-base-cased | ~110 M | 512 | Modelo base de lenguaje | MIT | Carpeta completa en Hugging Face |
| bert-base-cased | ~110 M | 512 | Modelo base de lenguaje | Apache 2.0 | Carpeta completa en Hugging Face |
| roberta-base | ~125 M | 512 | Modelo base de lenguaje | MIT | Carpeta completa en Hugging Face |

No se dispone de comparaciones de rendimiento publicadas entre xlnet-fraud-call y alternativas ajustadas para detección de fraude telefónico. Las alternativas de la tabla son modelos base de tamaño comparable que podrían servir como punto de partida para un ajuste fino equivalente, pero no se han evaluado sobre el mismo conjunto de 21 transcripciones.

## Limitaciones y advertencias

- El conjunto de evaluación es de solo 21 transcripciones; la precisión del 95,2 % no es estadísticamente representativa y puede no generalizar a dominios, acentos o canales distintos.
- Los datos de entrenamiento mezclan tuits sobre estafas (texto escrito, informal) con conversaciones del Santa Barbara Corpus (habla espontánea); el desajuste de dominio con transcripciones reales de llamadas fraudulentas puede degradar el rendimiento.
- El modelo solo admite inglés; transcripciones en otros idiomas no están soportadas.
- No se documenta el balance de clases ni el número de ejemplos de entrenamiento, por lo que se desconoce el posible sesgo hacia la clase mayoritaria.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas (falsos positivos y negativos) con consecuencias operativas.
- La licencia MIT permite uso comercial, pero el modelo se distribuye como `state_dict` sin carpeta de configuración ni tokenizador empaquetado, lo que añade fricción de integración y riesgo de errores en el preprocesado.
- El enlace al repositorio de código del proyecto aparece con marcadores de posición (`YOUR_USER/YOUR_REPO`) en la model card, por lo que no es funcional.
- No hay garantías de mantenimiento, versionado ni soporte por parte del autor; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Para producción se recomienda validar sobre un conjunto propio representativo, calibrar el umbral de decisión y combinar la señal del modelo con otras fuentes antes de automatizar acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArnavPoswal15/xlnet-fraud-call
- Modelo base: https://huggingface.co/xlnet/xlnet-base-cased
- Repositorio de código del proyecto: no disponible (la model card incluye un enlace con marcadores de posición no funcionales)
- Paper de XLNet: no disponible en la información proporcionada
