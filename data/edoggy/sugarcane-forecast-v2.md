# edoggy/sugarcane-forecast-v2

## Resumen

Sugarcane-forecast-v2 es un modelo de clasificación tabular desarrollado por el usuario edoggy que predice, para un píxel de cultivo en Luisiana (EE. UU.), si será caña de azúcar al año siguiente. Se construye a partir de los vectores de Google Satellite Embedding (64 dimensiones) del año actual y del anterior, junto con el estado caña/no-caña de ambos años, y se implementa con árboles de gradiente boosting de scikit-learn (HistGradientBoosting). Las etiquetas provienen del Cropland Data Layer (CDL) del USDA.

El problema que aborda es relevante porque la rotación de caña en Luisiana es muy rápida: el 24 % de los píxeles de cultivo cambian de estado caña cada año, de modo que la línea base de persistencia ("igual que el año pasado") solo alcanza un 76-78 % de acierto y falla sistemáticamente en todos los cambios. El modelo mejora esa línea base hasta un 88,1 % y un 85,7 % de accuracy en las transiciones 2022→2023 y 2023→2024, respectivamente.

No es un modelo de lenguaje ni una red neuronal profunda: es un clasificador supervisado ligero, empaquetado con joblib y pensado para inferencia tabular sobre datos de teledetección. Su interés radica en la asimetría que documenta: la expansión del cultivo es predecible con un año de antelación, mientras que la contracción (abandono tras la cosecha) apenas deja señal previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Árboles de gradiente boosting (sklearn HistGradientBoostingClassifier) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 2 × 64 dimensiones de embedding más estado caña/no-caña de dos años) |
| Tipos de cuantización | no aplica (modelo tabular serializado con joblib) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un clasificador tabular basado en HistGradientBoosting de scikit-learn. La entrada combina los vectores de Google Satellite Embedding V1 (64 dimensiones) del año actual y del año anterior, junto con la etiqueta binaria caña/no-caña de ambos años. La salida es la predicción de si el píxel será caña el año siguiente. El orden exacto de las características está documentado en el fichero `metrics.json` del repositorio.

El entrenamiento usa datos de Luisiana entre 2018 y 2024, con 30 000 puntos estratificados 50/50 según el estado de caña en 2021, lo que da cinco transiciones anuales de entrenamiento. Las etiquetas proceden del USDA NASS Cropland Data Layer (dominio público) y los embeddings de Google Satellite Embedding V1 (CC-BY-4.0). La validación se hace dejando fuera años completos: se entrena solo con transiciones anteriores y se evalúa en la transición siguiente, evitando fuga de información temporal.

## Capacidades

- Predicción binaria de presencia de caña de azúcar al año siguiente en píxeles de cultivo de Luisiana.
- Clasificación tabular sobre embeddings de satélite de 64 dimensiones y estado de cultivo de dos años consecutivos.
- Detección de expansión de cultivo: alta recall (0,946) y precisión (0,832) para campos que entran en caña en la transición 2023→2024.
- Detección limitada de contracción: recall bajo (0,253) para campos que salen de caña, aunque con precisión aceptable (0,755).
- No soporta tool calling, agentes, razonamiento multi-paso, visión directa ni capacidades multilingües.

## Casos de uso

- Planificación agrícola anual: estimar qué parcelas entrarán en producción de caña el próximo año para anticipar logística de cosecha y transporte, aprovechando la alta recall en expansión.
- Seguimiento de rotaciones de cultivo: monitorizar transiciones caña/soja/barbecho a escala de píxel con embeddings satelitales anuales, útil para estudios de uso del suelo.
- Aviso temprano a cooperativas: identificar campos que probablemente abandonen la caña (con la cautela de su baja recall) para orientar visitas técnicas y decisiones post-cosecha.
- Investigación en teledetección agrícola: servir como línea base reproducible para comparar modelos de forecasting de uso del suelo con validación temporal por año.
- Integración en pipelines geoespaciales: al ser un modelo sklearn ligero en joblib, puede desplegarse en servicios batch que procesen teselas de embeddings satelitales sin infraestructura GPU.
- Análisis de políticas agrarias: cuantificar la volatilidad de la superficie de caña en Luisiana y separar expansión predecible de contracción difícil de anticipar.

## Benchmarks y rendimiento

| Transición de test | Accuracy | Persistencia | Recall nueva caña | Precisión nueva caña | Recall retirada | Precisión retirada |
|---|---|---|---|---|---|---|
| 2022 → 2023 | 0,881 | 0,780 | no disponible | 0,884 | no disponible | 0,766 |
| 2023 → 2024 | 0,857 | 0,760 | 0,946 | 0,832 | 0,253 | 0,755 |

## Requisitos de hardware

- Inferencia en CPU: el modelo es un HistGradientBoosting serializado con joblib, por lo que no requiere GPU.
- VRAM estimada: no aplica; el consumo es de RAM del orden de megabytes para el modelo y proporcional al lote de píxeles procesados.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: portátil convencional o instancia pequeña de nube.
- Opciones de despliegue: script Python con scikit-learn y joblib, servicio batch o API ligera (por ejemplo FastAPI) para inferencia tabular.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño del lote y de la CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Contexto temporal | Licencia | Validación |
|---|---|---|---|---|---|
| sugarcane-forecast-v2 (edoggy) | HistGradientBoosting tabular | Embeddings satelitales 64-d + estado caña de 2 años | 2 años | CC-BY-4.0 | Por año, fuera de muestra |
| Línea base de persistencia | Regla trivial | Estado caña del año actual | 1 año | no aplica | Por año, fuera de muestra |
| Clasificador v1 del mismo autor (mencionado en la model card) | Clasificador tabular | Embeddings satelitales | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de forecasting de caña en la información proporcionada.

## Limitaciones y advertencias

- Ámbito geográfico restringido: solo validado en Luisiana; los embeddings son específicos de la región y el autor recomienda reentrenar con etiquetas locales antes de usarlo en otras zonas.
- Etiquetas derivadas de mapas (CDL): parte de los "cambios" detectados pueden ser ruido de etiquetado, lo que introduce error irreducible en la evaluación.
- Contracción poco predecible: recall de solo 0,253 para campos que salen de caña en 2023→2024; no debe usarse como señal fiable de abandono.
- Sin validación fuera de Luisiana ni en periodos posteriores a 2024.
- Dependencia de la versión de Google Satellite Embedding V1 y del orden de características definido en `metrics.json`.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de las fuentes de datos subyacentes (embeddings y CDL).
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite instrucciones en lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/edoggy/sugarcane-forecast-v2
- Google Satellite Embedding V1 (referenciado en la model card): no disponible en la información proporcionada
- USDA NASS Cropland Data Layer (referenciado en la model card): no disponible en la información proporcionada
