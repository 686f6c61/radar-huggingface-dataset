# genia-americas/harvest-net

## Resumen

HarvestNet es un repositorio de Hugging Face publicado por la organizacion genia-americas que, segun su propia model card, se encuentra en estado de marcador de posicion: no se han publicado pesos, codigo ni evaluaciones. El objetivo declarado del proyecto es la prediccion de rendimiento de cultivos (toneladas por hectarea) para Brasil, Argentina y Mexico, partiendo de la hipotesis de que los modelos entrenados con datos de otras regiones, como el Medio Oeste estadounidense, pueden transferir mal a las condiciones, suelos y variedades del hemisferio sur.

No se trata, por tanto, de un modelo de lenguaje ni de una red neuronal profunda con pesos distribuidos, sino de un diseno planificado basado en arboles con boosting de gradiente (gradient boosted trees), posiblemente con caracteristicas aprendidas. La entrada prevista incluye variables climaticas, tipo de suelo, variedad de cultivo, practicas de gestion e indices de vegetacion; la salida seria el rendimiento en t/ha acompanado de un intervalo de incertidumbre.

Su relevancia actual es limitada desde el punto de vista practico, ya que no existe artefacto ejecutable alguno. El interes reside en la propuesta de un benchmark regional (HarvestYield-LAC) y en un catalogo de fuentes de datos publicas latinoamericanas (CONAB, SIAP, INTA, INMET, IDEAM), documentado en un repositorio de GitHub. Cualquier evaluacion de sus capacidades es hoy imposible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arboles con boosting de gradiente (planificado, posiblemente con caracteristicas aprendidas); no implementado |
| Parametros totales | no disponible (no hay pesos publicados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se ha publicado ningun artefacto) |

## Arquitectura y entrenamiento

El diseno previsto contempla modelos de arboles con boosting de gradiente, una eleccion coherente con datos tabulares agroclimaticos de tamano moderado y con la necesidad de interpretabilidad y de intervalos de incertidumbre. Las variables de entrada planificadas son climaticas, edafologicas (tipo de suelo), agronomicas (variedad de cultivo, practicas de gestion) y de teledeteccion (indices de vegetacion). Los cultivos considerados son soja, maiz, cana de azucar, trigo y cafe.

No se ha publicado informacion sobre volumen de datos de entrenamiento, composicion del dataset, numero de muestras ni proceso de ajuste. La model card indica explicitamente que las cifras de rendimiento que aparecian en una version anterior de la tarjeta han sido retiradas porque no existia modelo, pipeline de datos ni codigo de evaluacion publico que permitiera reproducirlas. Tampoco se ha construido el benchmark propuesto, HarvestYield-LAC.

## Capacidades

- Prediccion de rendimiento agricola en t/ha con intervalo de incertidumbre: capacidad planificada, no implementada.
- Procesamiento de variables climaticas, edafologicas, de variedad de cultivo, practicas de gestion e indices de vegetacion: entradas previstas, sin pipeline publicado.
- Cobertura geografica objetivo: Brasil, Argentina y Mexico.
- Cultivos objetivo: soja, maiz, cana de azucar, trigo y cafe.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio: no aplica, no es un modelo de lenguaje ni multimodal generativo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

Ninguno de los siguientes casos es ejecutable hoy con este repositorio; se describen como escenarios objetivo del diseno planificado.

- Planificacion de campana agricola: estimar el rendimiento esperado por parcela a partir de clima, suelo y variedad, con un intervalo de incertidumbre que permita decisiones de siembra y fertilizacion. Requeriria el modelo entrenado y el pipeline de inferencia, inexistentes por ahora.
- Seguros agricolas parametrizados: usar la prediccion de rendimiento y su banda de incertidumbre como insumo para tarificacion y para disparadores de indemnizacion en Brasil, Argentina y Mexico.
- Gestion de riesgo en trading de commodities: agregar predicciones regionales de soja, maiz y trigo para anticipar desviaciones de oferta respecto a las estimaciones oficiales.
- Priorizacion de extension agraria: identificar municipios con mayor brecha entre rendimiento previsto y rendimiento potencial segun practicas de gestion, para dirigir asistencia tecnica.
- Investigacion agronomica comparada: evaluar la hipotesis de transferencia deficiente de modelos entrenados en el Medio Oeste estadounidense frente a modelos ajustados con datos del hemisferio sur, una vez exista el benchmark HarvestYield-LAC.
- Integracion con plataformas de datos agricolas: consumir el catalogo de fuentes publicas (CONAB, SIAP, INTA, INMET, IDEAM) documentado en el repositorio de GitHub como base para construir pipelines propios de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card senala que las cifras de una version anterior fueron retiradas por no ser reproducibles y que el benchmark HarvestYield-LAC aun no se ha construido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un diseno basado en arboles con boosting de gradiente, la inferencia seria en CPU, pero no existe artefacto que medir.
- GPU recomendadas: no aplica para el tipo de modelo planificado; no hay requisitos publicados.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; son herramientas para modelos de lenguaje y este repositorio no contiene pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de prediccion de rendimiento para Latinoamerica, ni existe artefacto en este repositorio que permita una comparacion tecnica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HarvestNet | no disponible | no aplica | sin datos | Apache 2.0 | solo marcador de posicion |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos, codigo ni evaluaciones; es un marcador de posicion. `HarvestNet.from_pretrained(...)` no funciona y no existe el paquete `genia.agri`.
- Las cifras de rendimiento de versiones anteriores de la model card fueron retiradas por falta de reproducibilidad; no deben citarse.
- La hipotesis central (mala transferencia de modelos entrenados en el Medio Oeste estadounidense al hemisferio sur) no ha sido medida por el autor.
- El benchmark HarvestYield-LAC es una propuesta y no se ha construido.
- El diseno, los objetivos y los cultivos considerados pueden cambiar.
- No se ha publicado informacion sobre sesgos, cobertura real de datos, calidad de las fuentes ni validacion geografica.
- La licencia Apache 2.0 permite uso comercial del contenido publicado, pero al no existir modelo no hay nada licenciable en la practica mas alla de la documentacion.
- La model card indica explicitamente que no debe citarse como un modelo publicado.
- No debe usarse en produccion ni como base de decisiones agronomicas o financieras.

## Enlaces

- Hugging Face: https://huggingface.co/genia-americas/harvest-net
- Repositorio GitHub: https://github.com/GENIA-Americas/multimodal-ai-americas
- DOI (Zenodo): https://doi.org/10.5281/zenodo.20437260
- Plataforma: https://www.glapagos.com
- Red: https://www.racefor.ai
