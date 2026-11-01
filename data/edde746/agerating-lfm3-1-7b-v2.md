# edde746/agerating-lfm3-1.7b-v2

## Resumen

agerating-lfm3-1.7b-v2 es un clasificador de texto especializado que estima la edad mínima recomendada de visionado (0, 6, 12, 16 o 18 años, según la escala alemana FSK) para películas y series de televisión. Lo desarrolla el usuario edde746 y se construye como un adaptador LoRA sobre el modelo base LiquidAI/LFM3-1.7B-Base, con una cabeza de clasificación lineal que proyecta el promedio de los estados ocultos finales a cinco clases. El modelo no genera texto libre: recibe una representación serializada de hechos de Wikidata (más un fragmento de Wikipedia cuando existe) y devuelve una distribución softmax sobre las cinco edades.

La relevancia del modelo es acotada pero concreta: alimenta las bases de datos del proyecto agerating desde la reconstrucción del 1 de noviembre de 2026 y puntúa semanalmente los títulos nuevos. Resuelve el problema de asignar una edad orientativa a títulos sin calificación FSK oficial en Wikidata, un caso frecuente en series de televisión. La versión v2 incorpora 1.381 calificaciones de TV adicionales obtenidas mediante búsqueda web asistida por un modelo externo, y mantiene el rendimiento de v1 en películas mejorando en series.

El modelo es pequeño en parámetros entrenables (16,4 millones sobre un base de 1.700 millones) y su entrenamiento completo cabe en una sola RTX 4090 en menos de 42 minutos. Está disponible únicamente en inglés y alemán, con licencia propia agerating-license-1.0, y su uso está pensado para el pipeline del repositorio agerating, no como clasificador genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer LiquidAI/LFM3-1.7B-Base + cabeza lineal de clasificación (5 clases) |
| Parametros totales | 16.478.981 entrenables (adaptadores LoRA + cabeza); el base se descarga aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 768 tokens de entrada serializada |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bf16) |
| Idiomas soportados | inglés, alemán |
| Licencia | agerating-license-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (66 MB) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base (revisión `545fc8f4c7b5fa9f405105274cd29c4f8f44b526`) y aplica adaptadores LoRA sobre todas las capas lineales con r=16, alpha=32 y dropout 0,05. Sobre la salida del base se calcula la media de los estados ocultos finales sobre todos los tokens de entrada y se pasa por una capa lineal que proyecta a 5 clases (edades 0, 6, 12, 16 y 18). La salida es una distribución softmax, no texto generado.

El entrenamiento usa 19.713 ítems de Wikidata con calificación FSK inequívoca (propiedad P1981) recolectados el 1 de noviembre de 2026, más 1.381 calificaciones de series de TV obtenidas mediante búsqueda web con Claude Haiku 5.5 y verificadas página a página (se descartaron 54 por discrepancia y 365 por no encontrar fuente). La distribución de etiquetas oficiales es 1.756 en 0, 3.143 en 6, 7.962 en 12, 5.524 en 16 y 1.328 en 18. El texto de Wikipedia se obtiene vía API de MediaWiki y se descarta con probabilidad 0,5 en cada paso para que el modelo funcione con y sin artículo. Se entrena una época sobre 21.094 ítems, batch 8, bf16, AdamW con weight decay 0,01, learning rate 1e-4 para LoRA y 1e-3 para la cabeza, warm-up lineal del 5% y decaimiento lineal. El coste es de 41,1 minutos en una RTX 4090 con 5,4 GB de pico de memoria GPU.

## Capacidades

- Clasificación de edad mínima recomendada en escala FSK (0, 6, 12, 16, 18) a partir de hechos de Wikidata y texto de Wikipedia.
- Entrada serializada con campos fijos: tipo, géneros, país, idioma original, director, guionista, reparto, productora, distribuidora, cadena, serie, franquicia, material de origen, tema principal, ambientación, premios, nominaciones, compositor, año y duración.
- Incorporación de calificaciones de otros sistemas (34 sistemas de cine/TV en Wikidata), excluyendo siempre la FSK para evitar fuga de etiqueta.
- Manejo de títulos con y sin artículo de Wikipedia gracias al dropout de texto durante el entrenamiento.
- Salida probabilística sobre las cinco clases, lo que permite umbrales de confianza y análisis de incertidumbre.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni generación de texto.
- Capacidades multilingües limitadas a inglés y alemán en la entrada.

## Casos de uso

- Puntuación semanal de títulos nuevos en la base de datos agerating: el modelo clasifica automáticamente las películas y series añadidas cada semana, sustituyendo la revisión manual para títulos sin FSK oficial.
- Estimación de edad para series de TV sin calificación FSK en Wikidata: es el caso que motivó v2, con 1.381 calificaciones adicionales de series para mejorar la cobertura en ese segmento.
- Enriquecimiento de catálogos de streaming: un operador puede asignar una edad orientativa a títulos de su catálogo usando los hechos de Wikidata y el resumen de Wikipedia, antes de obtener la calificación oficial.
- Filtrado previo en pipelines de recomendación infantil: el clasificador devuelve probabilidades por edad que permiten aplicar umbrales conservadores (por ejemplo, exigir probabilidad alta en la clase 0 o 6 para público infantil).
- Auditoría de consistencia de calificaciones: comparar la estimación del modelo con la FSK oficial de títulos ya calificados para detectar discrepancias o casos límite.
- Investigación sobre sesgos en sistemas de calificación: el modelo permite estudiar qué señales de Wikidata (género, país, reparto) correlacionan con edades más restrictivas, al ser reproducible y de código abierto.
- Generación de metadatos para agregadores de cine: integración en el pipeline `pipeline/model.py` del repositorio agerating para producir la columna de edad estimada en bases de datos públicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación sobre el fold 0 de una partición estratificada en 5 folds, entrenando sobre el resto, y afirma que v2 "es tan bueno como la receta de v1 en películas y mejor en TV", pero los valores numéricos de esa evaluación no se incluyen en la información proporcionada. Tampoco se detallan métricas como accuracy, F1 macro o matrices de confusión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 5,4 GB de pico en una RTX 4090 con bf16, por lo que la inferencia debería caber holgadamente en GPUs consumer de 8 GB o más.
- GPU recomendadas: RTX 4090 para entrenamiento (41,1 minutos); para inferencia, cualquier GPU con al menos 8 GB de VRAM es suficiente en bf16.
- Cabe en GPU consumer: sí, el entrenamiento cabe en una RTX 4090 y la inferencia en tarjetas de gama media con suficiente VRAM.
- Opciones de despliegue: el repositorio incluye `pipeline/model.py` con funciones `load` y `predict`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un clasificador con cabeza lineal no es directamente compatible con esos servidores de generación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agerating-lfm3-1.7b-v2 | 16,4 M entrenables sobre base de 1,7 B | 768 tokens | Clasificación FSK (5 clases) | agerating-license-1.0 | HuggingFace |
| agerating-lfm3-1.7b-v1 | no disponible en detalle | no disponible | Clasificación FSK (5 clases) | no disponible | HuggingFace |
| LiquidAI/LFM3-1.7B-Base | 1,7 B | no disponible | Modelo base de lenguaje | no disponible | HuggingFace |

No se dispone de información sobre otros clasificadores de edad de visionado comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo produce una estimación, no una calificación oficial; la model card lo indica explícitamente.
- Solo funciona bien con el formato de entrada exacto generado por `pipeline/serialize.py`; entradas fuera de ese formato degradan el rendimiento.
- Idiomas limitados a inglés y alemán; no cubre otras lenguas.
- La licencia agerating-license-1.0 es propia y está etiquetada como "other"; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- Las calificaciones de series de TV obtenidas por búsqueda web no se publican y su calidad depende de la verificación manual descrita (76% de coincidencia exacta y 98% dentro de un paso en la muestra de control).
- Riesgo de sesgo: el entrenamiento se basa en calificaciones FSK alemanas y en hechos de Wikidata, lo que puede reflejar sesgos culturales y de cobertura del dataset.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en títulos con poca información en Wikidata o sin artículo de Wikipedia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja validación por parte de la comunidad.
- No se documentan métricas de evaluación numéricas, lo que dificulta comparar su rendimiento con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edde746/agerating-lfm3-1.7b-v2
- Versión anterior v1: https://huggingface.co/edde746/agerating-lfm3-1.7b-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio del pipeline agerating: https://github.com/edde746/agerating
- Licencia: LICENSE en el repositorio de HuggingFace
