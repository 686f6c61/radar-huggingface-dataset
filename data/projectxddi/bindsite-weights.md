# projectxddi/bindsite-weights

## Resumen

BindSite weights es un repositorio de pesos publicado por el usuario `projectxddi` en Hugging Face que agrupa los artefactos necesarios para ejecutar BindSite, un servidor de prediccion de sitios de union en proteinas. El sistema predice los residuos de una proteina que interaccionan con iones metalicos, moleculas pequenas, ADN y ARN, una tarea relevante en biologia estructural y diseno de farmacos. El repositorio no contiene un modelo generativo de lenguaje, sino un conjunto heterogeneo de checkpoints y estructuras auxiliares.

El componente propio del proyecto es `final_model/`, denominado AdaBind, que incluye 140 checkpoints correspondientes a 5 clases de ligando junto con un `manifest.json` que describe los miembros del ensemble y los umbrales de decision. El resto del repositorio son dependencias y lineas base: una copia sin modificar de ESM-IF1 (modelo de plegamiento inverso de Meta), cinco checkpoints de bindEmbed21DL y cinco state dicts de bindNode24 como modelos de comparacion, y 4.080 estructuras de ESMFold v1 de las proteinas de entrenamiento y test.

El interes del repositorio es acotado y practico: sirve como soporte de pesos para el Space `projectxddi/be_protein_binding`, no como modelo autonomo documentado. La model card es escueta, no declara licencia para el componente propio, no incluye resultados de benchmarks ni describe la arquitectura de AdaBind mas alla de su nombre y numero de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (AdaBind; el repositorio incluye ESM-IF1 como componente auxiliar) |
| Parametros totales | no disponible (ESM-IF1 incluido: 142M, segun nombre de fichero `esm_if1_gvp4_t16_142M_UR50.pt`) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de proteinas; no procesa lenguaje natural) |
| Licencia | no disponible para AdaBind ("license not chosen yet" segun la model card); componentes de terceros con licencias MIT y GPL-3.0 |
| Formato de pesos | `.pt` (PyTorch) para ESM-IF1 y checkpoints; `state dict` para bindNode24; `tar.gz` con estructuras PDB para ESMFold; `manifest.json` y `SHA256SUMS` como metadatos |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de AdaBind. Se sabe que el sistema se compone de 140 checkpoints distribuidos en 5 clases de ligando (iones metalicos, moleculas pequenas, ADN y ARN, segun el texto introductorio, aunque el desglose exacto por clase no se detalla) y que emplea un esquema de ensemble con umbrales de decision definidos en `manifest.json`. El servidor que consume estos pesos carga ademas ESM-2 650M (`facebook/esm2_t33_650M_UR50D` en la revision `08e4846e`) y ProtT5-XL half (`Rostlab/prot_t5_xl_half_uniref50-enc` en la revision `94a6abc0`) desde sus repositorios originales, lo que sugiere que AdaBind combina embeddings de proteinas preentrenados con cabezas de prediccion por residuo.

El repositorio incluye ESM-IF1 (`esm_if1_gvp4_t16_142M_UR50.pt`), un modelo de plegamiento inverso de Meta AI que genera secuencias a partir de estructura, copiado sin modificaciones. Tambien incorpora 4.080 estructuras tridimensionales predichas con ESMFold v1 para las proteinas de entrenamiento y test, lo que indica que el pipeline trabaja sobre estructura predicha ademas de secuencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado o preferencias.

## Capacidades

- Prediccion de residuos de union a iones metalicos en proteinas.
- Prediccion de residuos de union a moleculas pequenas (relevante para farmacos).
- Prediccion de residuos de union a ADN.
- Prediccion de residuos de union a ARN.
- Clasificacion por residuo con umbrales calibrados por clase de ligando (via `manifest.json`).
- Ensemble de 140 checkpoints para las 5 clases, pensado para robustez mediante agregacion.
- Generacion de estructuras proteicas mediante ESMFold v1 (componente auxiliar incluido como estructuras precalculadas, no como modelo ejecutable en el repo).
- Plegamiento inverso mediante ESM-IF1 (componente auxiliar incluido).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo especializado en biologia estructural.

## Casos de uso

- Anotacion funcional de proteinas: dado un proteoma o un conjunto de secuencias, ejecutar BindSite para localizar residuos candidatos a union de metales y priorizar dianas para caracterizacion experimental.
- Descubrimiento de sitios de union de farmacos: usar la prediccion de residuos que unen moleculas pequenas para identificar bolsillos y guiar docking molecular o diseno de ligandos.
- Analisis de interacciones proteina-ADN y proteina-ARN: localizar dominios de union a acidos nucleicos en factores de transcripcion o proteinas de union a ARN, como paso previo a mutagenesis dirigida.
- Validacion de estructuras predichas: combinar las estructuras ESMFold incluidas con las predicciones de BindSite para evaluar la coherencia entre plegamiento y sitios funcionales en pipelines de biologia estructural.
- Benchmarking de metodos de prediccion de sitios de union: el repositorio incluye bindEmbed21DL y bindNode24 como lineas base, lo que permite reproducir comparaciones sobre el mismo conjunto de proteinas.
- Integracion en el Space `projectxddi/be_protein_binding`: desplegar el servidor BindSite apuntando a estos pesos para ofrecer predicciones via interfaz web o API.
- Filtrado en cribados de proteinas: descartar candidatos sin sitios de union plausibles a un ligando de interes antes de ensayos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, MCC ni comparaciones cuantitativas con bindEmbed21DL o bindNode24, pese a incluir sus pesos como lineas base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para AdaBind. Como referencia, ESM-2 650M en fp16 requiere aproximadamente 1,3 GB solo para pesos, y ProtT5-XL half (aproximadamente 600M parametros) alrededor de 1,2 GB; el conjunto completo con activaciones puede situarse en el rango de 4-8 GB en fp16, aunque esta cifra es una estimacion orientativa y no un dato publicado.
- GPU recomendadas: no disponibles. Por el tamano de los componentes (ESM-2 650M, ProtT5-XL half, ESM-IF1 142M), una GPU consumer con 8-16 GB de VRAM deberia ser suficiente, pero no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si, en tarjetas con 8 GB o mas, segun los tamanos de los componentes citados; no verificado.
- Opciones de despliegue: el repositorio esta pensado para el servidor BindSite del Space `projectxddi/be_protein_binding`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de proteinas.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 2,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BindSite (AdaBind) | no disponible (140 checkpoints, 5 clases) | no aplica | Prediccion de sitios de union multi-ligando | no disponible | Hugging Face (`projectxddi/bindsite-weights`) |
| bindEmbed21DL | no disponible (5 checkpoints) | no aplica | Prediccion de sitios de union | MIT | Incluido como linea base en este repo; origen en `Rostlab/bindPredict` |
| bindNode24 | no disponible (5 state dicts) | no aplica | Prediccion de sitios de union | GPL-3.0 | Incluido como linea base en este repo; origen en `erckert/bindNode24` |
| ESM-IF1 | 142M | no aplica | Plegamiento inverso (secuencia desde estructura) | MIT | Incluido en este repo; origen en `facebookresearch/esm` |

La comparacion cuantitativa de rendimiento entre BindSite y sus lineas base no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia de AdaBind no esta elegida ("license not chosen yet"), lo que impide determinar si su uso comercial esta permitido. Cualquier uso en produccion requiere aclarar este punto con el autor.
- El repositorio mezcla componentes con licencias distintas: MIT (ESM-IF1, bindEmbed21DL, estructuras ESMFold) y GPL-3.0 (bindNode24). La GPL-3.0 puede imponer obligaciones de copyleft si se redistribuye un producto derivado que incluya esos state dicts.
- No hay model card tecnica de AdaBind: se desconoce la arquitectura, el dataset de entrenamiento, el numero de proteinas usadas y el protocolo de evaluacion.
- No se publican metricas de rendimiento ni comparaciones con las lineas base incluidas, por lo que no es posible evaluar su calidad de forma objetiva.
- Riesgo de sobreajuste o fuga de datos no evaluable: las estructuras ESMFold de entrenamiento y test estan en el mismo repositorio, pero no se especifica la separacion entre conjuntos.
- Las predicciones se basan en estructuras predichas por ESMFold, no en estructuras experimentales, lo que puede introducir errores en regiones desordenadas o de baja confianza.
- El modelo no procesa lenguaje natural: no admite prompts en castellano ni otras lenguas, ni tool calling, ni razonamiento multi-paso.
- El repositorio depende de revisiones fijas de ESM-2 y ProtT5-XL half alojadas externamente; si esos repositorios cambian o se retiran, la reproducibilidad del servidor puede verse afectada.
- El autor es un usuario individual sin historial verificable (0 descargas, 0 likes en el momento de la consulta), lo que reduce la confianza en el mantenimiento a largo plazo.

## Enlaces

- Repositorio de pesos: https://huggingface.co/projectxddi/bindsite-weights
- Space del servidor BindSite: https://huggingface.co/spaces/projectxddi/be_protein_binding
- ESM-2 650M: https://huggingface.co/facebook/esm2_t33_650M_UR50D
- ProtT5-XL half: https://huggingface.co/Rostlab/prot_t5_xl_half_uniref50-enc
- ESMFold v1: https://huggingface.co/facebook/esmfold_v1
- Repositorio ESM (Meta AI): https://github.com/facebookresearch/esm
- bindPredict (Rostlab): https://github.com/Rostlab/bindPredict
- bindNode24: https://github.com/erckert/bindNode24
- PeerWeights (resultado de busqueda, no relacionado directamente con el modelo): https://peerweights.com/
