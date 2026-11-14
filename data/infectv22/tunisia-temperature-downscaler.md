# InfectV22/tunisia-temperature-downscaler

## Resumen

El modelo `InfectV22/tunisia-temperature-downscaler` es un downscaler probabilístico de temperatura a 2 metros desarrollado por el usuario InfectV22. Su función es refinar campos de temperatura de baja resolución (0,25°, aproximadamente 28 km) procedentes de reanálisis o modelos de predicción, generando campos de alta resolución sobre la malla del reanálisis CERRA de Copernicus (5,5 km) restringidos a Túnez (32,0°N–38,0°N, 7,5°E–11,8°E). Resuelve el problema clásico de la pérdida de detalle espacial en predicciones meteorológicas de gran escala, especialmente en zonas de topografía compleja como la Dorsale tunecina.

Técnicamente se trata de una U-Net probabilística multi-escala de aproximadamente 2,15 millones de parámetros, entrenada con pérdida CRPS (Continuous Ranked Probability Score) sobre tierra y con un esquema de ensemble estocástico. Se entrenó exclusivamente con pares de reanálisis histórico ERA5 (0,25°) y CERRA (5,5 km) del periodo 2014–2019, lo que permite aplicarlo de forma zero-shot a predicciones operativas como ECMWF IFS-ENS o AIFS-ENS sin reentrenamiento.

Su relevancia radica en que demuestra que un modelo de tamaño muy reducido puede mejorar sustancialmente métricas de predicción probabilística (CRPS, RMSE) y la resolución espacial efectiva en regiones con relieve, con un coste computacional mínimo. Es un caso de uso claro de superresolución climática aplicada y de ensembles estocásticos ligeros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net probabilística multi-escala (image-to-image) |
| Parametros totales | ~2,15 M (`base_channels=32`, `depth=3`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo espacial; entrada de rejilla 127 × 77 sobre malla CERRA 5,5 km) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` / `mixed-see-card` (ver fichero LICENSE del repositorio) |
| Formato de pesos | `model.pt` (PyTorch) |
| Región de aplicación | Túnez (32,0°N–38,0°N, 7,5°E–11,8°E) |
| Resolución de entrada | 0,25° (~28 km), ERA5 o equivalente |
| Resolución de salida | 5,5 km (malla CERRA Lambert, 127 × 77) |
| Canales de entrada | 11 físicos/espaciotemporales + 2 de ruido multi-escala |
| Pérdida de entrenamiento | CRPS justa sobre tierra (`land_only=True`) |
| Miembros de entrenamiento / evaluación | 4 / 8 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es una U-Net probabilística multi-escala con 32 canales base y profundidad 3, lo que resulta en unos 2,15 millones de parámetros. La entrada combina 11 canales físicos y espaciotemporales (temperatura a 2 m interpolada bilinealmente, orografía fina y diferencia de elevación respecto a la superficie gruesa, máscara tierra-mar e influencia costera exponencial con escala de 25 km, latitud y longitud normalizadas, hora del día y día del año codificados como seno y coseno) junto con 2 canales de ruido gaussiano multi-escala (`coarse_factor=[8, 16]`) que introducen la estocasticidad necesaria para generar ensembles.

El entrenamiento se realizó con pares de reanálisis ERA5 (0,25°) y CERRA (5,5 km) entre 2014 y 2019 (8.764 pasos cada 6 horas), con validación held-out en 2020 (1.464 pasos). La función de pérdida es CRPS justa restringida a celdas de tierra, con 4 miembros en entrenamiento y 8 en evaluación. Un aspecto destacable es que el modelo nunca ve predicciones numéricas ni de IA durante el entrenamiento, lo que habilita su aplicación zero-shot a ensembles operativos. Las estadísticas de normalización del periodo de entrenamiento están embebidas en `model.pt`.

## Capacidades

- Downscaling probabilístico de temperatura a 2 m desde 0,25° a 5,5 km sobre la malla CERRA en Túnez.
- Generación de ensembles estocásticos mediante canales de ruido multi-escala, con control del número de realizaciones en inferencia.
- Mejora de la resolución espacial efectiva: de 227,5 km (entrada ERA5) a 13,8 km por miembro, un factor de 16,5×.
- Aplicación zero-shot a ensembles de predicción operativa como ECMWF IFS-ENS o AIFS-ENS.
- Integración de predictores estáticos de alta resolución (orografía, máscara tierra-mar, influencia costera).
- Evaluación probabilística calibrada (spread-skill ratio cercano a 1 en validación).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de regresión espacial.

## Casos de uso

- Predicción operativa regional en Túnez: aplicar el modelo a los 10 miembros de IFS-ENS (0,25°) para generar 40 miembros finos a 5,5 km y alimentar avisos meteorológicos con mejor detección de extremos (hit rate de calor >35 °C del 75,0 % frente al 68,2 % del ensemble grueso).
- Estudios de impacto en agricultura: refinar campos de temperatura para modelar heladas y estrés térmico en cultivos de zonas de montaña, donde la mejora de CRPS alcanza el 31,1 % en el rango 500–1000 m.
- Análisis climático histórico: downscaling de reanálisis ERA5 a 5,5 km para construir series locales de temperatura con detalle topográfico en la Dorsale tunecina.
- Verificación y calibración de ensembles: usar el modelo como referencia de alta resolución para evaluar la dispersión de ensembles operativos mediante SSR y CRPS.
- Planificación energética: estimación de demanda de refrigeración con campos de temperatura finos en zonas costeras e interiores, aprovechando la mejora en la representación de gradientes costeros.
- Investigación en superresolución climática: servir como baseline ligero (2,15 M de parámetros) para comparar arquitecturas de downscaling probabilístico en regiones con topografía compleja.
- Evaluación de extremos térmicos: análisis de olas de calor con mejor calibración probabilística (reducción del error de Brier del 25 % en umbral >35 °C).

## Benchmarks y rendimiento

Validación held-out 2020 (1.464 pasos, 9.290.544 pares píxel-tiempo) frente a CERRA 5,5 km:

| Subconjunto | RMSE interpolación bilineal (K) | RMSE U-Net CRPS (K) | CRPS interpolación (K) | CRPS U-Net (K) | SSR |
|---|---|---|---|---|---|
| Toda la tierra | 1,383 | 0,932 (-32,6 %) | 1,046 | 0,475 (-54,6 %) | 0,860 |
| Tierras bajas (0–200 m) | 1,310 | 0,927 (-29,2 %) | 0,970 | 0,470 (-51,5 %) | 0,863 |
| Colinas (200–500 m) | 1,377 | 0,941 (-31,7 %) | 1,057 | 0,482 (-54,4 %) | 0,847 |
| Altiplanos (500–1000 m) | 1,554 | 0,934 (-39,9 %) | 1,212 | 0,478 (-60,6 %) | 0,865 |
| Dorsale (1000–1500 m) | 1,731 | 0,933 (-46,1 %) | 1,403 | 0,477 (-66,0 %) | 0,899 |

RMSE diurno: 00 UTC 0,920 K; 06 UTC 0,946 K; 12 UTC 0,910 K; 18 UTC 0,952 K.

Inferencia zero-shot a 10 días con IFS-ENS (10 miembros × 4 realizaciones = 40 miembros finos):

| Verificación | Métrica | Ensemble grueso | Downscaled |
|---|---|---|---|
| Frente a CERRA 5,5 km (tierra) | RMSE | 2,18 K | 1,69 K (-22,5 %) |
| Frente a CERRA 5,5 km (tierra) | CRPS | 1,53 K | 0,95 K (-37,9 %) |
| 17 estaciones WMO/INM | CRPS global | 1,173 K | 1,028 K (-12,4 %) |
| 17 estaciones WMO/INM | RMSE | 1,856 K | 1,803 K (-2,8 %) |
| 17 estaciones WMO/INM | Sesgo frío | -0,868 K | -0,693 K |
| 17 estaciones WMO/INM | SSR | 0,465 | 0,644 |

Mejoras por altitud en estaciones: +12,9 % CRPS en 200–500 m y +31,1 % en 500–1000 m; el 100 % de las estaciones interiores/montañosas (>200 m) mejoraron. Detección de calor extremo (>35 °C): hit rate 68,2 % → 75,0 %; error de Brier -25 %. Mejora de CRPS en estaciones de -38 % a +24 h y -32 % a +48 h.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~2,15 M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer (menos de 1 GB en FP32 para pesos y activaciones de una rejilla 127 × 77).
- GPU recomendadas: cualquier GPU moderna; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El cuello de botella no es el modelo sino el preprocesado de datos ERA5/CERRA y la gestión de ensembles.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo mediante el paquete `weather-forecast-model-downscaler` (clase `Downscaler`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución entrada/salida | Región | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| InfectV22/tunisia-temperature-downscaler | U-Net probabilística CRPS | ~2,15 M | 0,25° → 5,5 km | Túnez | other (mixed-see-card) | Hugging Face |
| Interpolación bilineal (baseline) | Método determinista | 0 | 0,25° → 5,5 km | Cualquiera | no aplica | Estándar |
| Downscalers deterministas tipo MSE | CNN/U-Net | variable | 0,25° → 5,5 km | Variable | variable | Variable |

No se dispone en la información proporcionada de otros modelos comparables publicados con métricas verificables en la misma región y tarea. La comparación principal disponible es frente a la interpolación bilineal, incluida en la tabla de benchmarks.

## Limitaciones y advertencias

- Cobertura geográfica restringida a Túnez (32,0°N–38,0°N, 7,5°E–11,8°E); no debe aplicarse fuera de esa región sin reentrenamiento.
- Entrenado solo con pares ERA5–CERRA de 2014–2019; puede degradarse ante regímenes climáticos no representados en ese periodo.
- La validación held-out se limita a 2020; no hay evidencia publicada de robustez en años posteriores.
- Riesgo de alucinación en el sentido de generar estructuras espaciales plausibles pero no observadas, especialmente en zonas con pocas estaciones de verificación.
- Sesgo frío residual en estaciones (-0,693 K tras downscaling), aunque reducido respecto al ensemble grueso.
- Calibración imperfecta del ensemble: SSR de 0,644 en estaciones (por debajo de 1, lo que indica subdispersión) y 0,860 en validación frente a CERRA.
- La licencia `other` / `mixed-see-card` exige revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; no se especifican términos concretos en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario ni mantenimiento.
- Dependencia de la disponibilidad y calidad de los datos de entrada ERA5, CERRA e IFS-ENS, sujetos a sus propias licencias (Copernicus, ECMWF).
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/InfectV22/tunisia-temperature-downscaler
- Paquete de inferencia (GitHub): https://github.com/EmmaScharfmann/weather-forecast-model-downscaler
- Repositorio de pesos: `model.pt` en el propio repositorio de Hugging Face
- Figuras de evaluación: `reports/1_overview_grid.png`, `reports/val_maps.png`, `reports/curves.png`, `reports/spectrum.png`, `reports/2_coarse_cerra_downscaled.png`, `reports/3_error_vs_cerra.png`, `reports/4_station_plume.png`, `reports/scorecard.png`, `reports/improvement.png`, `reports/summary.json` (rutas dentro del repositorio)
- ERA5 (Copernicus C3S): https://cds.climate.copernicus.eu/
- CERRA (Copernicus C3S): https://climate.copernicus.eu/
- ECMWF IFS-ENS: https://www.ecmwf.int/
- NOAA Integrated Surface Database (ISD): https://www.ncei.noaa.gov/products/land-based-station/integrated-surface-database
