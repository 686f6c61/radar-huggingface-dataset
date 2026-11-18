# mudhil/era5-conus404-diffusion-downscaling-model

## Resumen

El modelo `era5-conus404-diffusion-downscaling-model`, publicado por el usuario mudhil en Hugging Face, es un pipeline de reducción de escala (downscaling) climático que transforma datos de reanálisis ERA5 a 0,25° (~27 km) en campos de alta resolución CONUS404 a 4 km sobre los Estados Unidos continentales. No es un modelo de lenguaje: es un sistema generativo compuesto por tres redes neuronales entrenadas específicamente para esta tarea geoespacial, empaquetadas como checkpoints de PyTorch.

La arquitectura sigue el paradigma "Latent CorrDiff" en tres etapas: una red de regresión determinista (DRN) que predice la media condicional, un autoencoder variacional (VAE) que comprime el residual en un espacio latente, y un UNet de difusión condicional de estilo EDM que genera el residual latente. En conjunto suman aproximadamente 231,7 millones de parámetros distribuidos entre los tres componentes.

Es relevante porque aborda uno de los problemas centrales de la modelización climática regional: generar proyecciones de alta resolución realistas y estocásticamente coherentes a partir de datos de baja resolución, sin el coste computacional de un modelo regional físico completo. El repositorio contiene únicamente los checkpoints (12,1 GB); los datos de entrenamiento y las herramientas de inferencia residen en repositorios separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres etapas: DRN (UNet de 4 niveles) + VAE + UNet de difusión condicional estilo EDM |
| Parametros totales | ~231,7 M (DRN 49,6 M + VAE 39,7 M + difusión 142,4 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de secuencia de texto; opera sobre rejillas 256×256) |
| Tipos de cuantizacion | No disponible (checkpoints en punto flotante PyTorch, sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`): `diffusion_best.pt`, `diffusion_latest.pt`, `drn_best.pt`, `vae_best.pt` |

## Arquitectura y entrenamiento

El pipeline se compone de tres módulos encadenados. El DRN es un UNet de cuatro niveles con 49,6 M de parámetros que aprende la media condicional E[CONUS404 | ERA5]. El VAE, con 39,7 M de parámetros, comprime el residual (CONUS404 − predicción del DRN) desde una rejilla de 256×256 hasta un espacio latente de 64×64×8. El tercer componente es un UNet de difusión condicional de 142,4 M de parámetros con formulación EDM (Karras et al., 2022), que genera el residual latente; este se decodifica a través del VAE y se suma a la media del DRN para producir la predicción final.

El modelo se entrena sobre seis variables meteorológicas mapeadas entre ERA5 y CONUS404: temperatura a 2 m (t2m→T2), punto de rocío a 2 m (d2m→TD2), componentes del viento a 10 m (u10→U10, v10→V10), presión en superficie (sp→PSFC) y precipitación acumulada (tp→PREC_ACC_NC). Además incorpora seis campos estáticos: terreno, varianza orográfica, latitud, longitud, índice de área foliar (LAI) y máscara tierra-mar. La partición temporal de los datos CONUS404 es 1980–2014 para entrenamiento, 2015–2017 para validación y 2018–2020 para test. No se especifican en la información disponible el número de tokens ni detalles sobre RLHF/DPO (no aplicables a este dominio).

## Capacidades

- Reducción de escala determinista y estocástica de campos meteorológicos ERA5 (0,25°) a resolución CONUS404 (4 km) sobre los EE. UU. continentales.
- Generación de ensembles: al ser un modelo de difusión, permite muestrear múltiples realizaciones del residual, capturando incertidumbre y variabilidad de alta frecuencia.
- Predicción de temperatura a 2 m, punto de rocío, viento zonal y meridional a 10 m, presión en superficie y precipitación acumulada.
- Incorporación de información estática del terreno (orografía, LAI, máscara tierra-mar) para condicionar la generación.
- Salida en formato NetCDF mediante la herramienta `sample_nc` del repositorio de código.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Generación de proyecciones climáticas regionales de alta resolución: a partir de reanálisis ERA5 o de salidas de modelos globales, el pipeline produce campos a 4 km aptos para estudios de impacto local, aprovechando la combinación de la media determinista del DRN y la textura estocástica del módulo de difusión.
- Análisis de eventos extremos de precipitación: el muestreo múltiple del residual permite estimar la distribución de la precipitación acumulada y caracterizar colas extremas que un modelo determinista suavizaría.
- Estudios de variabilidad de viento para energía eólica: las componentes U10 y V10 a 4 km permiten evaluar recursos eólicos locales y su incertidumbre mediante ensembles.
- Downscaling de temperatura para agricultura y salud pública: la T2 y TD2 a resolución de 4 km facilitan mapas de riesgo de heladas o de estrés térmico a escala de comarca.
- Asimilación y comparación con modelos regionales físicos: el pipeline sirve como referencia estadística rápida frente a modelos como WRF, con un coste de inferencia muy inferior al de una simulación dinámica.
- Generación de datasets sintéticos de alta resolución para entrenar o validar otros modelos meteorológicos, aprovechando la capacidad generativa del módulo de difusión condicionado por ERA5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los checkpoints suman 12,1 GB en disco; en memoria, los tres modelos juntos requieren aproximadamente 0,93 GB en FP32 (231,7 M de parámetros), más el overhead de activaciones y del proceso de muestreo de difusión.
- GPU recomendada: una GPU con al menos 8–16 GB de VRAM para inferencia cómoda sobre rejillas 256×256; una NVIDIA A100 o H100 acelera notablemente el muestreo de difusión (múltiples pasos por muestra).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB), siempre que se ajuste el tamaño de lote.
- Despliegue: el repositorio de código (`github.com/milhud/diffusion_downscaling_model`) proporciona el script `src/inference/sample_nc`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del número de pasos de difusión configurados y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución objetivo | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| era5-conus404-diffusion-downscaling-model | Difusión latente + DRN + VAE | 4 km (CONUS404) | ~231,7 M | MIT | Hugging Face |
| CorrDiff (NVIDIA) | Difusión por correlación | Variable (p. ej. 2–3 km) | No disponible | No disponible | No disponible |
| Modelos regionales dinámicos (WRF) | Físico-numérico | Configurable (1–10 km) | No aplica | Dominio público / variable | Amplia |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada; la comparación se limita a características estructurales.

## Limitaciones y advertencias

- Dominio geográfico restringido: entrenado exclusivamente sobre los EE. UU. continentales (CONUS404); no debe aplicarse fuera de esa región sin reentrenamiento.
- Ventana temporal de entrenamiento: 1980–2014; el modelo puede no representar regímenes climáticos posteriores o tendencias no vistas.
- Solo seis variables meteorológicas: no modela otras variables (humedad en niveles altos, radiación, nubosidad, etc.).
- Riesgo de alucinación estadística: el módulo de difusión puede generar estructuras espaciales plausibles pero no físicamente consistentes; se recomienda validación contra observaciones.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad científica de las salidas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Los datos de entrada y las herramientas de inferencia están en repositorios separados; el flujo de uso exige descargar el dataset `mudhil/era5-conus404-data` y el código de GitHub.
- No se documentan sesgos específicos ni evaluaciones de calibración en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mudhil/era5-conus404-diffusion-downscaling-model
- Dataset asociado: https://huggingface.co/datasets/mudhil/era5-conus404-data
- Repositorio de código: https://github.com/milhud/diffusion_downscaling_model
- Referencia metodológica EDM (Karras et al., 2022): no disponible en la información proporcionada
