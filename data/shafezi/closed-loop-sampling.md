# shafezi/closed-loop-sampling

## Resumen

Closed-Loop Adaptive Sampling on a Generative Ocean Model es un conjunto de pesos de investigación publicados por Shayesteh Hafezi (junto con Alan Papalia) para dos dominios oceánicos regionales: Mid-Atlantic Bight (MAB, a partir de la reanálisis Doppio) y California Current System (CCS, a partir de CCSRA31). No es un modelo de lenguaje: es un sistema de predicción oceánica generativa compuesto por un autoencoder convolucional profundo y un denoiser latente entrenado con el objetivo EDM, ambos derivados de la arquitectura LaDCast adaptada a dominios oceánicos regionales.

El sistema implementa un bucle cerrado de asimilación de observaciones: el modelo genera un ensemble de pronóstico en espacio latente, lo decodifica, planifica ubicaciones de muestreo a partir de las estadísticas del ensemble y asimila observaciones mediante muestreo de difusión condicionado por observación. Cada región dispone de un autoencoder de 256.388.460 parámetros y un denoiser de 374.938.452 parámetros, con pesos en formato safetensors (EMA del mejor checkpoint en validación).

Es relevante ahora porque publica los pesos exactos que respaldan los resultados del artículo homónimo, con un conjunto de verificación reproducible mediante hashes SHA-256 y estadísticas de sonda con tolerancia 1e-5. El repositorio ocupa 8,1 GB y la licencia es MIT, pero el autor advierte explícitamente de que es un modelo de investigación sin garantía de habilidad sobre datos en tiempo real y no apto para navegación ni decisiones de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional profundo (compresión) + denoiser latente con objetivo EDM (difusión), derivada de LaDCast |
| Parámetros totales | 256.388.460 (autoencoder) + 374.938.452 (denoiser) por región |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; secuencias latentes de cuatro estados) |
| Tipos de cuantización | no disponible (inferencia en bf16 según el artículo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (EMA, re-keyed por nombre de parámetro) |

## Arquitectura y entrenamiento

Por cada región, el autoencoder comprime 84 canales de entrada (20 niveles sigma de u, v, temperatura y salinidad; los campos 2D zeta/ubar/vbar; y la máscara binaria de agua) sobre el recorte del modelo (MAB 104 x 240, CCS 176 x 184) a un latente de 84 canales (MAB 13 x 30, CCS 22 x 23). El denoiser se entrena con el objetivo EDM sobre secuencias latentes de cuatro estados y genera con un schedule Karras de 20 pasos (rho 7, Heun, sigma 0,002-80, sigma_data 0,5). La inferencia del artículo se ejecutó en bf16 sobre una única NVIDIA A40.

Los datos de entrenamiento proceden de reanálisis regionales: MAB de Doppio (Wilkin et al., 2022) y CCS de CCSRA31 (Neveu et al., 2016); ninguna de las dos reanálisis se redistribuye. Los checkpoints liberados son los pesos EMA del mejor checkpoint en validación, con metadatos de época, pérdida de validación, recuento de parámetros y ejecución de origen en `meta.json`, y la configuración de entrenamiento en `training_config.yaml`. Existen además denoisers entrenados con semilla 1 en `extras/`, no usados en ningún resultado del artículo. La arquitectura deriva de LaDCast (Zhuang y Duraisamy, 2025), adaptada a dominios oceánicos regionales.

## Capacidades

- Pronóstico oceánico regional generativo en espacio latente para los dominios MAB y CCS.
- Generación de ensembles de pronóstico mediante muestreo de difusión (schedule Karras de 20 pasos).
- Planificación de ubicaciones de muestreo a partir de las estadísticas del ensemble (estrategias como `a_optimal`).
- Asimilación de observaciones mediante muestreo de difusión condicionado por observación.
- Compresión y reconstrucción de campos oceánicos de 84 canales mediante el autoencoder.
- Ejecución de bucle cerrado completo: pronóstico, decodificación, planificación y asimilación.
- No soporta tool calling, agentes, razonamiento textual, visión ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Investigación en asimilación de datos oceánicos: el bucle cerrado permite evaluar estrategias de muestreo adaptativo sobre un ensemble latente, comparando planes de observación sin necesidad de campañas reales.
- Planificación de campañas de muestreo in situ: dado un ensemble de pronóstico, el sistema selecciona ubicaciones de muestreo (por ejemplo, con criterio A-optimal) que maximizan la reducción de incertidumbre antes de desplegar flotas de planeadores o boyas.
- Experimentos de forecasting de mesoescala en MAB y CCS: útil para estudiar la habilidad del modelo frente a las reanálisis de referencia en esos dos dominios concretos.
- Evaluación de arquitecturas de difusión latente en geociencias: los pesos permiten reproducir los experimentos del artículo y comparar variantes de denoiser o de schedule de muestreo.
- Docencia y formación en modelos generativos aplicados a oceanografía: el repositorio incluye configuración completa y utilidades de descarga y ejecución (`tools/download_weights.py`, `experiments/run_closed_loop.py`).
- Verificación de reproducibilidad: la suite de equivalencia del repositorio de código carga estos pesos y comprueba estadísticas de sonda y hashes SHA-256 en CPU con tolerancia 1e-5.
- Estudio de asimilación condicionada por observación: permite analizar cómo afecta la incorporación de observaciones al ensemble generado en cada paso del bucle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona hashes de verificación de sondas (denoiser MAB con ruido fijo, decode y encode del autoencoder MAB, denoiser CCS con ruido fijo) para comprobar la equivalencia de los checkpoints, no métricas de habilidad predictiva.

## Requisitos de hardware

- Inferencia del artículo ejecutada en bf16 sobre una única NVIDIA A40 (48 GB de VRAM).
- VRAM estimada para el conjunto completo (autoencoder más denoiser, ~631 M de parámetros por región): en bf16, alrededor de 1,3 GB solo en pesos; el consumo real depende del tamaño de los tensores intermedios del recorte (MAB 104 x 240, CCS 176 x 184) y del batch del ensemble.
- GPU recomendadas: A40 (configuración de referencia del artículo), A100 o H100 para ensembles grandes; tarjetas consumer con suficiente VRAM podrían ejecutar el modelo en bf16 dado el tamaño moderado de los pesos, aunque no se documenta soporte oficial.
- Opciones de despliegue: el repositorio de código propio (`pip install -e .`), con pesos cargados desde `CLOSEDLOOP_WEIGHTS`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Closed-Loop Adaptive Sampling (este) | Autoencoder + difusión latente EDM | 256 M + 375 M por región | MAB y CCS (regional) | MIT | Pesos en Hugging Face |
| LaDCast (Zhuang y Duraisamy, 2025) | Difusión latente para forecasting meteorológico | no disponible | Global atmosférico | Código dual Apache-2.0/MIT | Código en GitHub |
| Reanálisis Doppio | Asimilación variacional (referencia) | no aplica | MAB | no disponible | Distribuido por Rutgers/NOAA |
| Reanálisis CCSRA31 | Asimilación (referencia) | no aplica | CCS | no disponible | Distribuido por UC Santa Cruz |

No se dispone de datos de benchmarks que permitan comparar el rendimiento predictivo con estas alternativas.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no es un pronóstico operativo y que no tiene garantía de habilidad sobre datos en tiempo real.
- No debe usarse para navegación ni para decisiones de seguridad.
- Entrenado y evaluado contra las mismas reanálisis (Doppio y CCSRA31), lo que puede inflar la aparente habilidad del modelo.
- Cobertura geográfica restringida a dos dominios regionales (MAB y CCS); no generaliza a otras cuencas sin reentrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido textual, pero el muestreo generativo puede producir campos oceánicos plausibles no observados; no se documenta calibración de incertidumbre fuera de las reanálisis.
- Restricciones de licencia: pesos bajo MIT, pero la arquitectura deriva de LaDCast, con código de terceros bajo Apache-2.0 y contenido original bajo MIT; el repositorio de código fija el commit upstream y no lo redistribuye.
- Las reanálisis de entrenamiento (Doppio, CCSRA31) no se redistribuyen con los pesos.
- Los pesos con semilla 1 en `extras/` no se usaron en ningún resultado del artículo y no deben citarse como parte de los mismos.
- Los hashes de verificación solo identifican los checkpoints liberados; pesos reentrenados no los reproducirán.

## Enlaces

- Hugging Face: https://huggingface.co/shafezi/closed-loop-sampling
- LaDCast (arquitectura de referencia): https://github.com/tonyzyl/ladcast
- LaDCast, preprint: https://arxiv.org/abs/2506.09193
- Doppio reanalysis: Wilkin et al., 2022, Progress in Oceanography 209:102919 (distribuido por Rutgers University y NOAA Open Data Dissemination)
- CCSRA31: Neveu et al., 2016, Ocean Modelling 99:133-151 (distribuido por UC Santa Cruz)
