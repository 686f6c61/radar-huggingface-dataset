# rdmouhouadi/property-price-estimator

## Resumen

Property price estimator es un modelo de regresión tabular desarrollado por rdmouhouadi que estima el precio de venta de viviendas (casas y pisos) en Francia. Se trata de un regresor LightGBM con 2.646 árboles entrenado sobre 3.454.850 transacciones inmobiliarias reales del periodo 2021-2024 procedentes de la base de datos DVF (Demandes de Valeurs Foncières), de las cuales un 14% cuentan con una etiqueta energética DPE emparejada.

El modelo predice el logaritmo del precio por metro cuadrado y reconstruye el precio final multiplicando por la superficie habitable. Utiliza 21 características que combinan atributos de la propiedad, localización geocodificada (IGN y catastro), precios de mercado locales de los últimos 12 meses y, opcionalmente, la calificación energética. Su relevancia radica en que ofrece una primera estimación con un rango de error declarado y permite cuantificar la asociación entre la etiqueta energética y el precio, un aspecto cada vez más relevante en el mercado inmobiliario francés tras los cambios normativos del DPE.

No es un modelo de lenguaje ni un transformer: es un modelo de gradient boosting especializado en regresión tabular, con licencia MIT, distribuido en formato de texto LightGBM y servido mediante FastAPI y Streamlit. Su ámbito está estrictamente limitado a Francia metropolitana, excluyendo Alsace, Moselle y Mayotte por ausencia en DVF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting decision trees) |
| Parametros totales | 2.646 árboles (no aplica recuento de parámetros neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, 21 características de entrada) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de árboles) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `artifacts/model.txt` (formato texto LightGBM) + `artifacts/metadata.json` |

## Arquitectura y entrenamiento

El modelo es un regresor LightGBM de 2.646 árboles que predice ln(precio por m²); el precio final se obtiene como exp(predicción) × superficie habitable. Las 21 características de entrada cubren atributos de la propiedad, localización (comuna, coordenadas, sección catastral), precios de mercado local de los últimos 12 meses con el mismo shrinkage aplicado en entrenamiento, y características opcionales de calificación energética DPE.

El entrenamiento se realizó sobre 3.454.850 ventas de 2021 a 2024 procedentes de DVF, con un 14% de registros con DPE emparejado. La evaluación se hizo con partición temporal: entrenamiento anterior a julio de 2024, validación en el segundo semestre de 2024 y test en 2025 (790.767 ventas, puntuado una sola vez). Se compararon cinco enfoques; LightGBM se eligió por empatar en precisión con XGBoost siendo 2,5 veces más rápido. El modelo se registró en MLflow como `property-price-estimator` v1, alias `champion`, con run `8056d1ba`.

## Capacidades

- Estimación del precio de venta de casas y pisos en Francia a partir de dirección, superficie y características.
- Geocodificación de direcciones mediante IGN y resolución de parcela y sección catastral.
- Incorporación de precios de mercado locales de los últimos 12 meses reconstruidos por el pipeline.
- Uso opcional de la calificación energética DPE (A-G) como característica predictiva.
- Re-puntuación contrafactual: estima el mismo inmueble con cada etiqueta A-G para cuantificar la asociación entre eficiencia energética y precio.
- Salida con rango de error basado en el error mediano del test según tipo de inmueble (13,6% pisos, 18,2% casas).
- Servicio vía API REST (`POST /estimate`) con FastAPI y aplicación Streamlit.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo tabular de regresión.

## Casos de uso

- Estimación preliminar para propietarios y compradores: el modelo devuelve un precio y un rango de error típico antes de contactar con un profesional, con error mediano del 16,0% en el conjunto de ventas.
- Comparación del valor asociado a la etiqueta energética: la funcionalidad "What is my energy rating worth?" re-puntúa el mismo inmueble con cada etiqueta A-G, útil para agentes inmobiliarios que quieran mostrar la asociación aprendida de ventas locales (por ejemplo, un piso de 50 m² en Le Pecq pasa de 206.000 € con G a +13% con A).
- Valoración de carteras para inmobiliarias: la API `POST /estimate` permite procesar lotes de direcciones y obtener estimaciones homogéneas con un rango declarado, integrable en flujos de captación de inmuebles.
- Análisis de mercado local: al incorporar precios de los últimos 12 meses con shrinkage, el modelo sirve para comparar comunas o secciones catastrales y detectar dónde el precio depende más de la ubicación que de la eficiencia energética (en París centro el efecto del DPE es menor que en periferia).
- Herramienta educativa o de divulgación: la app Streamlit permite a periodistas o analistas explorar cómo varía la estimación según superficie, dirección y etiqueta, con advertencia explícita de que no es una tasación oficial.
- Filtro previo en procesos de compraventa: dado que el segmento con DPE emparejado alcanza un 43,1% de estimaciones dentro del 10%, el modelo puede usarse como criba inicial para descartar anuncios muy desalineados con el mercado local, siempre con revisión humana.
- Investigación sobre el valor verde: el modelo documenta y mide la asociación entre calificación energética y precio con un experimento controlado (mismo modelo, mismas 73.344 ventas de validación: error mediano 14,3% → 12,5% al añadir DPE), útil para estudios económicos sobre eficiencia energética.

## Benchmarks y rendimiento

Test sobre 790.767 ventas de 2025, puntuado una sola vez:

| Segmento | Error mediano | Dentro del 10% | Dentro del 20% | Error medio |
|---|---:|---:|---:|---:|
| Todas las ventas | 16,0% | 33,2% | 59,5% | 48.945 € |
| Pisos | 13,6% | 38,1% | 66,9% | 38.973 € |
| Casas | 18,2% | 29,4% | 53,8% | 56.675 € |
| Con DPE emparejado | 11,9% | 43,1% | 72,6% | 39.805 € |
| Sin DPE emparejado | 17,2% | 30,9% | 56,4% | 51.129 € |

Validación (segundo semestre de 2024): error mediano 16,3%, dentro del 20% un 58,4%. El test es aproximadamente igual a la validación, sin señal de sobreajuste. Experimento B sobre el efecto del DPE (mismo modelo, mismas 73.344 ventas de validación): error mediano 14,3% → 12,5% (−13%), dentro del 20% 65,2% → 71,3%. Comparación de enfoques: LightGBM empató en precisión con XGBoost y fue 2,5 veces más rápido.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un conjunto de 2.646 árboles en formato texto LightGBM; el repositorio ocupa 0,1 GB y la inferencia no requiere GPU.
- VRAM estimada: no aplica; no requiere GPU para inferencia.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para el servicio FastAPI.
- Cabe en cualquier equipo de consumo: el cuello de botella es el pipeline de geocodificación (IGN) y la consulta de precios de mercado, no el modelo.
- Opciones de despliegue: FastAPI (`POST /estimate`) y aplicación Streamlit según ADR-0009; el artefacto `model.txt` es cargable directamente con la librería LightGBM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Error mediano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| property-price-estimator (LightGBM) | Gradient boosting tabular | 3,45 M ventas DVF 2021-2024 | 16,0% (test 2025) | MIT | Hugging Face + GitHub |
| XGBoost (en el mismo estudio) | Gradient boosting tabular | Mismos datos | Empate en precisión con LightGBM | no disponible | No distribuido como modelo |
| Otros enfoques comparados (3 restantes) | no disponible | Mismos datos | Inferior según `reports/model_comparison.csv` | no disponible | No distribuidos |

No se dispone de información sobre modelos públicos comparables de estimación de precios inmobiliarios franceses con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Información ausente en DVF: no registra estado de conservación, vistas, reformas ni planta en casas; parte del precio es inalcanzable, lo que explica el peor rendimiento en casas (error mediano 18,2% frente a 13,6% en pisos).
- Sesgo de selección: las ventas con DPE emparejado son más limpias que la media (dirección y superficie confirmadas); la mejor métrica del segmento "con DPE" es en parte selección, no solo valor predictivo del DPE.
- Validación ligeramente optimista: el conjunto de validación se usó también para early stopping.
- Cobertura del DPE: solo el 14% de las ventas de entrenamiento tienen DPE; para el resto las características de calificación están vacías.
- Zonas con pocas ventas: secciones o comunas con historial escaso caen a precios de comuna o departamento, produciendo estimaciones más gruesas.
- El rango mostrado (± error mediano del test por tipo) es un error típico, no un intervalo calibrado: aproximadamente la mitad de los precios reales quedan fuera.
- No apto para decisiones hipotecarias, fiscales, legales o de seguros.
- Fuera de alcance: Alsace, Moselle y Mayotte (ausentes en DVF), obra nueva sobre plano, locales comerciales y ventas de múltiples viviendas.
- No debe interpretarse la diferencia A-G como una promesa de revalorización por reforma; es una asociación aprendida de ventas locales.
- Deriva normativa del DPE: el coeficiente eléctrico pasó de 2,3 a 1,9 el 1 de enero de 2026 y pasará a 1,7 el 1 de enero de 2027; las etiquetas emitidas desde 2027 no significarán lo mismo hasta reentrenar (ADR-0005).
- Certificados anteriores a 2026 con calefacción eléctrica: ADEME reetiquetó con coeficiente 1,9 y el modelo aprendió las etiquetas reetiquetadas; cerca del 46% de viviendas con calefacción eléctrica certificadas en el segundo semestre de 2025 tienen etiqueta peor que la publicada, lo que sesga ligeramente a la baja la estimación si el usuario introduce esa etiqueta (corrección pendiente).
- En París centro, A y B producen la misma estimación (plateau) por escasez de ventas A/B; las diferencias entre etiquetas vecinas deben leerse como aproximadas.
- Monitorización de deriva (ADR-0008): detector principal basado en el coeficiente implícito (mediana primaria ÷ energía final en viviendas eléctricas, alerta a ±3%); en la simulación del cambio real de enero de 2026 cae de 2,30 a 1,90 (−17%) en el primer mes. El PSI de etiquetas es secundario y en la simulación de 2027 se mantuvo bajo el umbral.
- Reentrenamiento: una alerta de deriva escribe el nuevo coeficiente en `params.yaml` y relanza el pipeline; el reetiquetado es aproximado (umbrales de 2021 para energía y emisiones, peor de ambos, sin regla de superficie pequeña, y escalado por energía primaria total en viviendas de energía mixta).

## Enlaces

- Hugging Face: https://huggingface.co/rdmouhouadi/property-price-estimator
- GitHub (código, pipeline y documentación): https://github.com/rdmouhouadi/property-price-estimator
- ADR-0005 (deriva del coeficiente DPE): https://github.com/rdmouhouadi/property-price-estimator/blob/main/adr/0005-dpe-coefficient-drift.md
- ADR-0008 (diseño del detector de deriva): https://github.com/rdmouhouadi/property-price-estimator/blob/main/adr/0008-drift-detector-design.md
- ADR-0009 (serving): https://github.com/rdmouhouadi/property-price-estimator/blob/main/adr/0009-serving.md
- Comparativa de modelos: `models.md` y `reports/model_comparison.csv` en el repositorio de GitHub
