# mfozdil/berlin-rent-demo

## Resumen

Berlin rent model (demo) es un modelo de regresión tabular publicado por el usuario mfozdil en Hugging Face, concebido como pieza demostrativa del proyecto Berlin Housing AI. No es un modelo de lenguaje ni una red neuronal profunda: se trata de una regresión lineal serializada en un fichero JSON de menos de 100 kB, que predice la renta fría mensual (Kaltmiete) de un piso en Berlín a partir de variables como distrito, barrio, superficie, número de habitaciones y planta, devolviendo además un intervalo del 80 % mediante predicción conformal.

Su relevancia no reside en el rendimiento predictivo, sino en la honestidad metodológica del pipeline: el autor advierte explícitamente de que los datos de entrenamiento son sintéticos, generados por una fórmula de precios y no recogidos de anuncios reales, y etiqueta cada respuesta con la marca `TRAINING_DATA_UNVERIFIED`. El modelo sirve como referencia para ingenieros que quieran ver un flujo completo de datos, entrenamiento, servicio HTTP y etiquetado de procedencia.

La versión publicada es `0.1.0-research`, entrenada el 30 de octubre de 2026, con datos que abarcan hasta abril de 2026. El modelo está congelado en ese último mes y no extrapola tendencias de mercado posteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión lineal (coeficientes serializados en JSON) |
| Parámetros totales | No disponible (modelo lineal; fichero inferior a 100 kB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | No aplica; el modelo se distribuye como JSON en precisión nativa |
| Idiomas soportados | Inglés (metadatos y documentación); las categorías de entrada usan nombres oficiales en alemán (bezirk, ortsteil) |
| Licencia | MIT |
| Formato de pesos | JSON (coeficientes) leído con NumPy y pandas mediante `inference.py` |

## Arquitectura y entrenamiento

El modelo es una regresión lineal sobre variables tabulares del inmueble: distrito (`bezirk`), barrio (`ortsteil`, opcional), tipo de propiedad, número de habitaciones, superficie en metros cuadrados, planta, planta total, era del edificio, clase energética, estado de conservación, ascensor, balcón y amueblado. La inferencia se realiza con `inference.py`, que carga el JSON de coeficientes con NumPy y pandas; no requiere GPU ni frameworks de deep learning.

El entrenamiento se realizó sobre el fichero `rentals.csv` del dataset público `sergionefedov/berlin-real-estate-sales-and-rentals-2020-2026` de Kaggle (licencia Apache 2.0), con 30.000 filas entre enero de 2020 y abril de 2026. Según el autor del dataset, solo son reales las coordenadas de distritos y estaciones y el histórico de tipos de interés; los pisos y sus rentas provienen de una fórmula de generación. El split es temporal: entrenamiento 2020-2024, validación 2025 y test de enero a abril de 2026. La innovación técnica destacable es la incorporación de predicción conformal para emitir intervalos del 80 % que se ensanchan cuando faltan campos opcionales, junto con un mecanismo de validación que devuelve códigos HTTP (200, 422) en lugar de lanzar excepciones.

## Capacidades

- Predicción de renta fría mensual en euros para pisos de Berlín a partir de atributos tabulares.
- Emisión de intervalos de confianza al 80 % mediante predicción conformal, con amplitud dependiente de la completitud de la entrada.
- Validación de entradas con respuesta estructurada: código 200 para predicciones válidas y 422 con listado de campos a corregir para entradas inválidas.
- Explicabilidad por factor: `result["explanation"]` indica cuánto desplaza cada variable la renta por metro cuadrado respecto a la media del conjunto de entrenamiento.
- Etiquetado automático de procedencia: cada respuesta incluye `training_data.synthetic == True` y la advertencia `TRAINING_DATA_UNVERIFIED`.
- Listado de campos ausentes en `result["inputs"]["missing"]` para trazabilidad de la predicción.
- Determinismo total: las mismas entradas producen siempre las mismas salidas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia y formación en pipelines de ML: el modelo ilustra un flujo completo desde datos tabulares hasta servicio HTTP, con validación, intervalos y etiquetado de procedencia, en un paquete de menos de 100 kB fácil de leer y ejecutar.
- Pruebas de integración de frontends: un sitio web puede consumir el servicio `rent-api` del proyecto y verificar el renderizado de predicciones, intervalos y etiquetas de "Demo model" sin depender de un modelo pesado.
- Referencia de implementación de predicción conformal: sirve para estudiar cómo se generan intervalos que se ensanchan ante entradas incompletas y cómo se expone esa incertidumbre en una API.
- Ejemplo de contratos de API robustos: el retorno de códigos 200/422 con detalle de campos inválidos es un patrón reutilizable en servicios de inferencia que no deben lanzar excepciones por entradas mal formadas.
- Auditoría de procedencia de datos: el modelo documenta checksums en `data/PROVENANCE.md` y verifica señales de sinteticidad (ausencia de valores nulos, solo 1,1 % de rentas redondas, escalones semestrales limpios), lo que lo convierte en un caso de estudio de validación de datasets.
- Comparación de algoritmos sobre datos sintéticos: permite reproducir el experimento del autor, donde regresión lineal, CatBoost y una red pequeña empatan en error (144-145 €), demostrando que un ajuste bajo no prueba capacidad predictiva sobre datos reales.
- Prototipado de interfaces de estimación inmobiliaria: desarrolladores pueden construir la UI y el flujo de usuario con datos de ejemplo antes de conectar un modelo entrenado con datos reales.

## Benchmarks y rendimiento

El autor publica errores medios absolutos en euros mensuales, evaluados sobre 2025 (split de validación temporal):

| Modelo | Error medio (€) |
|---|---|
| Media típica de €/m² del entrenamiento | 405 |
| Regresión lineal (este modelo) | 144 |
| CatBoost | 145 |
| Red neuronal pequeña | 144 |

En los meses de 2026 (test), la regresión lineal sobreestimó en promedio 77 €, porque el mercado generado dejó de subir mientras la tendencia del modelo continuaba. El autor subraya que estos resultados reflejan el ajuste a la fórmula generadora y no miden validez sobre rentas reales de Berlín.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es puramente CPU.
- GPU recomendadas: ninguna; cualquier CPU sirve.
- Cabe en cualquier equipo: el modelo es un JSON de menos de 100 kB y las dependencias son `huggingface_hub`, `numpy` y `pandas`.
- Entorno probado: Python 3.12.
- Opciones de despliegue: ejecución local mediante `inference.py`; servicio web con API documentada en `services/rent-api` del repositorio de GitHub.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo (evaluación de una expresión lineal) la latencia es de microsegundos a milisegundos por petición en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Error en validación 2025 (€) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Berlin rent model (demo) | Regresión lineal | 144 | MIT | Hugging Face |
| CatBoost (referencia del autor) | Árboles con boosting | 145 | No disponible en la información | No publicada como artefacto |
| Red neuronal pequeña (referencia del autor) | Red neuronal | 144 | No disponible en la información | No publicada como artefacto |
| Baseline €/m² medio | Media simple | 405 | No aplica | No aplica |

Los tres modelos reales empatan en error, lo que el autor interpreta como evidencia de que los datos provienen de una fórmula simple. No se dispone de comparación con modelos entrenados sobre datos reales de rentas de Berlín.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos: los pisos y sus rentas fueron generados por una fórmula de precios, no recogidos de anuncios reales. El modelo no debe usarse para valorar rentas reales ni para asesorar a inquilinos, propietarios o compradores.
- El error bajo (144 €) mide el ajuste a la fórmula generadora, no la capacidad predictiva sobre el mercado real.
- El modelo está congelado en abril de 2026 y no extrapola la evolución posterior del mercado; en el test de 2026 ya sobreestimó 77 € de media.
- Cada respuesta incluye la advertencia `TRAINING_DATA_UNVERIFIED`; si se muestra la predicción en cualquier interfaz, debe mantenerse esa etiqueta.
- La cobertura de idiomas se limita al inglés en documentación y a nombres oficiales en alemán para las categorías de entrada; no procesa texto libre.
- Licencia MIT: permite uso comercial y modificación, pero la naturaleza sintética de los datos hace desaconsejable cualquier uso en producción para decisiones reales.
- No hay datos publicados sobre sesgos por distrito o barrio más allá de la explicación por factor que devuelve el propio modelo.
- La predicción está desactivada por defecto en el sitio web del proyecto, señal explícita de que no debe tratarse como un servicio listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mfozdil/berlin-rent-demo
- Repositorio del proyecto Berlin Housing AI: https://github.com/cyberx801/berlin-housing-ai
- Servicio de API de renta: https://github.com/cyberx801/berlin-housing-ai/tree/main/services/rent-api
- Procedencia y checksums de datos: https://github.com/cyberx801/berlin-housing-ai/blob/main/data/PROVENANCE.md
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/sergionefedov/berlin-real-estate-sales-and-rentals-2020-2026
