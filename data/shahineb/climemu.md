# shahineb/climemu

## Resumen

El modelo `shahineb/climemu` es un emulador generativo basado en diffusion (score-based) diseñado para reproducir salidas de modelos del sistema terrestre (ESM). Desarrollado por shahineb y presentado en el artículo "Score-based generative emulation of impact-relevant earth system model outputs", aborda el problema del elevado coste computacional de ejecutar simulaciones completas de ESM, ofreciendo una alternativa rápida y probabilística para generar campos climáticos relevantes para estudios de impacto.

La implementación está realizada en JAX y Equinox (los pesos se almacenan en formato `.eqx`), e incluye un mapeo entre coordenadas latlon y la proyección HEALPix, junto con esquemas de estandarización y escalado de patrones. Cada modelo ocupa aproximadamente 50 MB, lo que lo hace extremadamente ligero en comparación con los ESM originales. Su relevancia actual radica en la necesidad de generar grandes ensembles de simulaciones para cuantificar la incertidumbre en proyecciones climáticas sin incurrir en costes computacionales prohibitivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion score-based (esquema de ruido VE, Variance Exploding) |
| Parametros totales | no disponible (peso del modelo ~50 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo generativo de campos espaciales, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos climáticos, no texto) |
| Licencia | MIT |
| Formato de pesos | Equinox (`.eqx`), NumPy (`.npy`, `.npz`), NetCDF (`.nc`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de diffusion score-based con un esquema de ruido VE (Variance Exploding). En lugar de trabajar directamente sobre la malla latlon original, el modelo mapea los campos a la proyección HEALPix mediante los ficheros `edges.npz`, lo que facilita el procesamiento esférico. El entrenamiento incluye un mecanismo de escalado de patrones con pesos `β.npy` y una estandarización previa mediante mapas `μ_σ.npz` para preprocesado y postprocesado. El ruido máximo se controla con `σmax.npy`.

No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, aunque el repositorio asociado en GitHub (`jax-esm-emulation`) contiene el código de entrenamiento y uso. La inferencia genera anomalías climáticas que se combinan con una climatología de referencia (`piControl_climatology.nc`) para producir las salidas finales.

## Capacidades

- Generación de campos climáticos espaciales (anomalías) coherentes con las salidas de un ESM específico.
- Muestreo probabilístico: permite generar múltiples realizaciones o ensembles para análisis de incertidumbre.
- Transformación de coordenadas integrada: mapeo bidireccional entre latlon y HEALPix.
- Escalado de patrones: ajuste de la amplitud de las anomalías generadas mediante pesos entrenados.
- Postprocesado automático con climatología de referencia para reconstruir campos absolutos.
- Ligereza computacional: modelos de ~50 MB que pueden ejecutarse en hardware modesto.

## Casos de uso

- Generación de ensembles para análisis de riesgo climático: el modelo permite producir cientos o miles de realizaciones de campos climáticos en minutos, algo inviable con un ESM completo, facilitando estudios de eventos extremos y sus probabilidades.
- Emulación rápida para estudios de impacto: investigadores que necesitan evaluar el impacto de cambios climáticos en sectores como agricultura o hidrología pueden usar este emulador para obtener datos de entrada sin ejecutar simulaciones costosas.
- Generación de datos sintéticos para entrenamiento: los campos generados pueden servir para entrenar modelos de downscaling estadístico o algoritmos de machine learning que requieren grandes volúmenes de datos climáticos.
- Integración en pipelines de evaluación de políticas: permite explorar rápidamente diferentes escenarios de emisiones o de gestión territorial mediante la generación de salidas ESM sintéticas.
- Experimentos de sensibilidad: al ser un emulador, se pueden modificar parámetros internos o condiciones de entrada para estudiar la sensibilidad del sistema sin reejecutar el ESM completo.
- Creación de climatologías de anomalías regionales: el modelo puede adaptarse a regiones específicas (etiqueta `region:us`) para generar anomalías locales coherentes con la física del ESM subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas cuantitativas como RMSE, skill scores o comparaciones con otros emuladores en la model card de HuggingFace.

## Requisitos de hardware

- El tamaño del repositorio es de 0.5 GB, con modelos individuales de ~50 MB, lo que permite inferencia en CPU sin problemas.
- No se especifica VRAM mínima, pero dada la naturaleza de los pesos (`.eqx`), una GPU con 4-8 GB de VRAM (por ejemplo, RTX 3060 o superior) sería más que suficiente para acelerar la inferencia.
- Al estar implementado en JAX, puede ejecutarse en GPUs NVIDIA (CUDA) y TPUs.
- El despliegue se realiza mediante Python y JAX; no es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados, pero se espera que sean muy bajos dado el tamaño del modelo y la naturaleza de la difusión (aunque el número de pasos de denoising no se especifica).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros emuladores generativos de ESM (como ClimaX, FourCastNet o modelos de emulación estadística) con los que comparar directamente. Se recomienda consultar el artículo asociado para posibles comparativas.

## Limitaciones y advertencias

- Dependencia del ESM original: el emulador está entrenado para reproducir un ESM concreto; su validez fuera de ese dominio no está garantizada.
- Riesgo de alucinación física: al ser un modelo generativo, puede producir campos que no sean físicamente consistentes, especialmente en regiones con datos de entrenamiento escasos.
- No es un modelo de lenguaje: no procesa texto, por lo que no es adecuado para tareas de NLP o generación de informes.
- Sesgos no documentados: no se proporciona información sobre posibles sesgos geográficos o estacionales en los datos de entrenamiento.
- Licencia MIT: permite uso comercial, pero se debe citar el DOI asociado (10.57967/hf/6634) en cualquier publicación o producto derivado.
- Requiere conocimientos técnicos: el uso implica manejo de ficheros `.eqx`, `.npz` y `.nc`, así como familiaridad con JAX/Equinox.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shahineb/climemu
- Repositorio de código: https://github.com/shahineb/jax-esm-emulation
- DOI asociado: 10.57967/hf/6634
