# build4me2/fcn3-nepal-final-residual-v0

## Resumen

fcn3-nepal-final-residual-v0 es un adaptador residual regional para el modelo global de predicción meteorológica FourCastNet 3 (FCN3) de NVIDIA. Lo publica el usuario build4me2 y no contiene pesos del modelo base: solo incluye el checkpoint del adaptador residual (`best_residual.pt`), la configuración de entrenamiento/evaluación y los artefactos de evaluación final. El backbone FCN3 permanece congelado y debe obtenerse por separado (`nvidia/fourcastnet3`), por lo que el repositorio de HuggingFace ocupa 0.0 GB.

El adaptador se denomina ElevCondResidualUNet y aprende una corrección sobre las salidas del backbone congelado para tres variables objetivo conjuntas: temperatura a 2 m (t2m), componente zonal del viento a 10 m (u10) y componente meridional a 10 m (v10). El dominio geográfico es un recorte regional de Nepal y el entorno del Hindu Kush-Himalaya, limitado a la caja 26-31°N / 80-89°E, con ERA5 como verdad de referencia obtenida vía CDS.

Su relevancia es acotada y de investigación: el autor lo presenta explícitamente como candidato regional ("Regional FINAL G1 candidate") que supera umbrales frente a FCN3 sin corregir, Tier-0 y residuales previos sobre el mismo conjunto de condiciones iniciales de evaluación final. No es un modelo de propósito general, no es SOTA global ni un sistema operativo de predicción numérica, y no redistribuye el backbone de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador residual ElevCondResidualUNet sobre backbone FCN3 congelado (operador neuronal esferico, modelo global probabilistico de NVIDIA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo opera sobre condiciones iniciales y pasos temporales, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint PyTorch `best_residual.pt` sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; las salidas son variables meteorologicas, no texto) |
| Licencia | MIT para los pesos residuales y los artefactos JSON/YAML/README de este repositorio |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |
| Variables objetivo | t2m (K), u10 (m/s), v10 (m/s) |
| Dominio geografico | 26-31 grados N / 80-89 grados E (Nepal) |
| Fuente de verdad | ERA5 via CDS (recorte regional) |
| Backbone requerido | nvidia/fourcastnet3 (o el paquete FCN3 local usado en entrenamiento); no se redistribuye |
| MD5 del checkpoint | 586ab17b843757bb84e66e2e3af8dc01 |
| Fecha de publicacion | 2026-09-27 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base, FourCastNet 3, es un sistema global de prediccion meteorologica probabilistica de NVIDIA Earth-2 que emplea un enfoque de aprendizaje automatico geometrico y escalable, disenado para respetar la geometria esferica y modelar la naturaleza probabilistica espacialmente correlacionada del problema. Segun la documentacion de NVIDIA, opera con 72 variables atmosfericas a 0,25 grados de resolucion y pasos de 6 horas, y produce espectros estables y dinamica realista a multiples escalas. En esta publicacion ese backbone se congela por completo: no se ajustan sus pesos ni se aplica LoRA.

Lo unico entrenado es el adaptador residual ElevCondResidualUNet, que anade una correccion condicionada por elevacion sobre las salidas del backbone para t2m, u10 y v10 de forma conjunta. El entrenamiento y la evaluacion usan recortes regionales de ERA5 sobre Nepal, con el siguiente protocolo de particion por anos y condiciones iniciales: entrenamiento 1980-2019 con 320 condiciones iniciales, validacion 2020-2021 con 64, y test 2022-2025 con 64. Los horizontes de verificacion declarados son +24, +72 y +120 horas. El autor no publica el numero de tokens, la composicion del dataset mas alla de ERA5, ni detalles de optimizacion, aumentos de datos o funciones de perdida mas alla de la configuracion incluida en `final_residual_v0.yaml`.

## Capacidades

- Prediccion meteorologica regional determinista sobre Nepal y el entorno del Hindu Kush-Himalaya en la caja 26-31°N / 80-89°E.
- Correccion residual de sesgo sobre las salidas de FCN3 congelado para tres variables: t2m, u10 y v10.
- Emision conjunta de las tres variables objetivo, lo que permite calcular error de vector viento (WV) ademas del RMSE de temperatura.
- Horizontes evaluados de +24, +72 y +120 horas.
- Hereda del backbone la naturaleza probabilistica de ensemble de FCN3, aunque la evaluacion publicada es sobre metricas de error deterministico (RMSE).
- Condicionamiento por elevacion mediante el componente ElevCond del adaptador, relevante en terreno montanoso.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica).
- Capacidades especiales: no incluye modo de pensamiento, vision, audio, precipitacion ni difusion.

## Casos de uso

- Prediccion regional de temperatura a 2 m para Nepal: el adaptador corrige las salidas del backbone congelado en un dominio de relieve complejo, donde los sesgos del modelo global son mayores; util para boletines de temperatura a +24/+72/+120 h.
- Correccion de sesgo de viento en superficie para estudios de monzon: al emitir u10 y v10 conjuntamente, permite calcular el error de vector viento (WV) y evaluar la mejora frente a FCN3 sin corregir en el mismo conjunto de condiciones iniciales.
- Investigacion academica en aprendizaje automatico aplicado a meteorologia: el repositorio incluye configuracion de entrenamiento, JSON de metricas y un puente "thick-2" report-only, lo que facilita reproducir y auditar la evaluacion.
- Evaluacion comparativa de tecnicas de adaptacion regional: al no modificar el backbone y publicar solo los pesos residuales, sirve como referencia reproducible para comparar adaptadores residuales frente a ajuste fino completo o LoRA.
- Forzamiento de modelos hidrologicos: las series de t2m y viento a 10 m corregidas pueden alimentar modelos de deshielo o caudal en cuencas del Himalaya, aunque el modelo no predice precipitacion ni deshielo por si mismo.
- Analisis de extremos termicos de corto plazo: la mejora declarada en RMSE de t2m a +120 h permite explorar su uso en alertas de temperatura, siempre con validacion adicional con estaciones locales, que este release no incluye.
- Soporte a la planificacion energetica regional: las predicciones de viento a 10 m y temperatura a 2 m pueden integrarse como entrada en estimaciones de demanda y de generacion, con las cautelas de no ser un sistema operativo.

## Benchmarks y rendimiento

Los unicos numeros publicados son los del protocolo FINAL del propio autor (RMSE de t2m en kelvin y error de vector viento), sin resultados desglosados por horizonte salvo el de +120 h en validacion:

| Metrica | Validacion | Test |
|---|---|---|
| t2m RMSE (K) | 1.819863 | 1.856390 |
| Wind-vector (WV) | 0.800354 | 0.825004 |
| t2m a +120 h (K) | 2.010414 | no disponible |

No se publican en la informacion disponible los valores equivalentes de las lineas base (FCN3 sin corregir, Tier-0, residual previo) ni metricas estandar de la literatura como WeatherBench-2, por lo que no es posible cuantificar la mejora relativa a partir de los datos proporcionados. El autor declara que el modelo supera los umbrales A, B y C frente a esas lineas base sobre las mismas condiciones iniciales, pero los valores numericos de esa comparacion no se incluyen en el material disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador residual: no disponible. El tamano del repositorio se declara como 0.0 GB, lo que sugiere un checkpoint residual pequeno, pero no se especifica el numero de parametros ni el peso en disco.
- VRAM para el backbone FCN3: no disponible en esta informacion; se trata de un modelo global a 0,25 grados con 72 variables atmosfericas, por lo que requiere GPU de datacenter en la practica.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tipo de carga (operador neuronal global mas adaptador), el rango habitual seria A100 o H100; no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos sobre si el conjunto backbone mas adaptador cabe en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y el pipeline de inferencia del proyecto de GitHub. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ambito | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| build4me2/fcn3-nepal-final-residual-v0 | Adaptador residual sobre FCN3 | Regional (26-31°N / 80-89°E) | no disponible | no aplica | MIT (solo pesos residuales) | HuggingFace, requiere backbone aparte |
| nvidia/fourcastnet3 | Modelo global probabilistico | Global, 0,25 grados, 72 variables | no disponible en la informacion | no aplica | la del modelo de NVIDIA (no redistribuido aqui) | HuggingFace (NVIDIA) |
| FCN3 sin corregir / Tier-0 / residual previo | Lineas base citadas por el autor | Regional, mismo dominio | no disponible | no aplica | no disponible | no disponible (sin artefactos publicos en esta informacion) |

No se dispone de datos numericos comparativos de estas alternativas en la informacion proporcionada; el autor afirma una mejora sobre ellas bajo su protocolo FINAL, pero los valores no se incluyen.

## Limitaciones y advertencias

- El propio autor enumera no-afirmaciones explicitas: no es SOTA global ni resultado de WeatherBench-2, no es prediccion operativa (NWP), no es un modelo de difusion tipo CorrDiff, no predice precipitacion, no incluye verificacion con estaciones ni con IMDAA, y no es un predictor de colapso de glaciares.
- El archivo `thick2_bridge_results.json` es solo informativo ("report-only") y no constituye una afirmacion de rendimiento.
- El repositorio no incluye el backbone FCN3: sin `nvidia/fourcastnet3` (o el paquete local equivalente) el checkpoint residual no es utilizable por si solo.
- La licencia MIT cubre unicamente los pesos residuales y los archivos JSON/YAML/README de este repositorio; los pesos upstream de FCN3/NVIDIA y los datos ERA5 quedan sujetos a sus propias licencias y condiciones de uso, incluida la atribucion a CDS/ERA5.
- El dominio esta restringido a 26-31°N / 80-89°E; el modelo no debe aplicarse fuera de ese recorte sin una evaluacion nueva.
- El protocolo de evaluacion es region-limited y usa recortes de ERA5 como verdad de referencia, con 64 condiciones iniciales en validacion y 64 en test; el tamano muestral es reducido y puede afectar a la robustez de las conclusiones.
- No hay verificacion independiente ni revision por pares de los resultados publicados, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de un modelo de lenguaje; el riesgo equivalente es sobreconfianza en las correcciones residuales en regimenes no vistos y en zonas con topografia y elevacion distintas de las del entrenamiento.
- Los metadatos de HuggingFace indican fechas de creacion y actualizacion de 2026-09-27, coincidentes con el "unlock" de la marca G1 declarada por el autor; conviene tratar el estado de validacion como provisional.
- Antes de cualquier uso en produccion es necesario validar contra observaciones locales (estaciones) y contra un sistema de referencia operativo, algo que este release no realiza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/build4me2/fcn3-nepal-final-residual-v0
- Repositorio GitHub del proyecto: https://github.com/build4me2/FourcastNet3-Himalayas-Fine-Tuning
- Documentacion de la ruta de investigacion (docs/00-pathway): https://github.com/build4me2/FourcastNet3-Himalayas-Fine-Tuning/tree/main/docs/00-pathway
- Modelo base en HuggingFace (nvidia/fourcastnet3): https://huggingface.co/nvidia/fourcastnet3
- README del modelo base: https://huggingface.co/nvidia/fourcastnet3/resolve/main/README.md
- Blog de NVIDIA sobre FourCastNet 3: https://developer.nvidia.com/blog/fourcastnet-3-enables-fast-and-accurate-large-ensemble-weather-forecasting-with-scalable-geometric-ml/
