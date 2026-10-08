# jacob-valdez/ibm2-checkpoints

## Resumen

`jacob-valdez/ibm2-checkpoints` es un repositorio de HuggingFace que no contiene un modelo de lenguaje, sino un subconjunto publico de checkpoints de entrenamiento del proyecto de investigacion IBM-2. IBM-2 es una base de codigo que construye un modelo de cerebro y cuerpo con estructura anatomica y lo evalua en tareas de prediccion neural, respuesta a estimulacion y tareas corporales bajo protocolos preregistrados. El autor del repositorio es el usuario `jacob-valdez`.

El repositorio publica unicamente los checkpoints cuyos datos de entrenamiento tienen una licencia registrada que permite la redistribucion de modelos derivados: el deposito OpenNeuro ds004873 (CC0-1.0) y datos puramente sinteticos generados dentro del propio codebase. No incluye datasets, datos retenidos o sellados, ni predicciones; solo ficheros de checkpoint, la model card y un `manifest.json` con el sha256 de cada fichero.

La relevancia de este repositorio es metodologica y de investigacion, no de producto: el propio autor advierte que son checkpoints de investigacion, no modelos validados, y que la mayoria de los protocolos terminaron en un resultado preregistrado negativo (no superar a una interpolacion temporal simple como baseline). La licencia del repositorio es CC0-1.0 y el tamano reportado es de 0,0 GB, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de cerebro/cuerpo con estructura anatomica; los modelos de fMRI agregan BOLD en seis redes Yeo-2011: DAN, DMN, FPN, SMN, VAN, VIS) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplicable; no es un modelo de secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplicable) |
| Licencia | cc0-1.0 |
| Formato de pesos | `.pt` (diccionario de `torch.save` con `state_dict`, `optimizer`, `config`, `config_sha256`, `provenance`, `progress` y estado RNG) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-08 |
| Compatibilidad | requiere el codigo fuente de IBM-2 en el commit indicado para reconstruir el modulo |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los modulos (numero de capas, dimensiones, tipo de bloque). Lo que si se documenta es que los modelos de fMRI agregan la senal BOLD en seis redes funcionales Yeo-2011 (DAN, DMN, FPN, SMN, VAN, VIS) usando las mascaras de red distribuidas dentro del deposito CC0 ds004873, y que los checkpoints embeben las seis coordenadas de centroide de red (18 numeros) en su configuracion. La parcelacion Yeo-2011 (Yeo et al., 2011, J Neurophysiol) se distribuye con FreeSurfer bajo sus propios terminos; en este repositorio no se incluye ningun volumen de mascara.

Los datos de entrenamiento son, segun la tabla de carpetas, el deposito ds004873 (CC0-1.0) y datos sinteticos generados en el propio repositorio (por ejemplo, `covariance_contrast_fixture` en `src/ibm/experiments/supervised_diagnosis.py`, y simulaciones de anatomia de juguete con alcance de codo y estimulacion TMS sintetica). El protocolo de "field comparison v2" describe comparaciones con actualizaciones emparejadas (arms contemporaneous/infill/residual x bias/ablated, mas UB) y una variante de wall-clock con 30.695 actualizaciones (enmienda v2.3), con 3 semillas. No se menciona RLHF, DPO ni tecnicas equivalentes, lo cual es coherente con el hecho de que no es un modelo generativo de lenguaje. Ningun checkpoint se entreno con sujetos de test retenidos o sellados: los sujetos retenidos de ds004873 solo se puntuaron.

## Capacidades

- Prediccion neural: inferencia (infill) enmascarada sobre senal fMRI agregada en seis redes Yeo-2011.
- Respuesta a estimulacion: evaluacion de respuesta a estimulacion en protocolos con TMS sintetica (solo en fixtures sinteticos).
- Tareas corporales: modelado de tareas de cuerpo en anatomias de juguete (por ejemplo, alcance de codo).
- Comparacion metodologica: soporta la comparacion entre un upper bound (UB), fine-tuning causal y fine-tuning con informacion offline (infill/residual) bajo actualizaciones emparejadas.
- Generacion de texto: no aplicable.
- Codigo, matematicas, vision, audio, tool calling, agentes, modo de razonamiento, capacidades multilingues: no aplicable o no disponible.

## Casos de uso

- Reproduccion de resultados preregistrados: cargar los checkpoints con el commit de codigo indicado para replicar las metricas NMSE registradas en cada protocolo y verificar los resultados negativos publicados.
- Auditoria metodologica: analizar la comparacion entre UB, FT causal y FT offline para evaluar como se comporta el infill frente a una interpolacion temporal simple (baseline de 0,398).
- Investigacion en prediccion neural: usar los checkpoints de fMRI como punto de partida para estudiar la agregacion BOLD en redes Yeo-2011 y el efecto del enmascarado de celdas.
- Extension del codebase IBM-2: reutilizar `state_dict` y `config` para reconstruir modulos concretos en el commit indicado y continuar el desarrollo de las tareas de cerebro y cuerpo.
- Verificacion de cumplimiento de licencias: inspeccionar que solo se redistribuyen checkpoints con entradas de entrenamiento de licencia compatible, como caso de estudio de gobernanza de datos en investigacion.
- Formacion y docencia: ilustrar practicas de preregistro, evaluacion con baselines fuertes y comunicacion de resultados negativos en neurociencia computacional.
- Pruebas de infraestructura: emplear las carpetas de diagnostico sintetico (`unified-environment-01`, `unified-session-01`) como smoke tests de dos pasos para entornos de ejecucion.
- Punto de partida para transferencia: partir de estos pesos para experimentar con otros depositos de licencia permisiva, siempre que se respete el requisito de reconstruir el modulo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje. Los unicos resultados son metricas internas de protocolo registradas por el autor:

| Protocolo | Metrica | Resultado registrado | Valoracion |
|---|---|---|---|
| fMRI masked infill piloto (run2, Pro6000) | MSE normalizado en held-out | 1366,53 frente a 1386,45 de la media de entrenamiento | Negativo (piloto pobre) |
| Field comparison v2 fMRI (actualizaciones emparejadas) | NMSE | UB 0,460; FT causal 0,504; infill FT bias 0,346; residual FT bias 0,333; interpolacion 0,398 | Infill/residual offline superan la interpolacion; UB supera FT causal |
| Field comparison v2 fMRI (wall-clock, 30.695 actualizaciones) | NMSE | FT 0,781 | Sobreajuste |
| Field comparison v2 synthetic gate | — | short bias 0,658 > ablated 0,508; random null key 0,867 | Negativo: ningun arm FT con zero-null pasa |
| Field comparison stage 3 fMRI (P5 w32_direct, 3-fold leave-2-out CV) | NMSE hidden-cell | UB 0,461 < FT bias 0,499 < ablated 0,788; interpolacion 0,398 | Negativo frente a UB; ningun arm supera la interpolacion |
| Field comparison stage 3 synthetic | Held-out | ft_bias 0,90 (borderline, fallo de flag float); ft_ablated 0,50 (memoriza) | Semilla unica |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el autor no publica requisitos de memoria ni tamano de parametros).
- GPU recomendadas: no disponible. El nombre de la carpeta `fmri-infill-pro6000-run2` sugiere el uso de una GPU de la familia "Pro 6000", pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La carga requiere reconstruir el modulo con el codigo fuente de IBM-2 en el commit indicado y usar `torch.load(path, weights_only=False)`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la informacion. El unico termino de comparacion documentado es un baseline interno de interpolacion temporal (NMSE 0,398 en los protocolos de fMRI de la etapa 3 y de field comparison v2), frente al cual la mayoria de los arms no mejora. Al tratarse de un repositorio de checkpoints de investigacion en neurociencia, no es equiparable a modelos de lenguaje ni a modelos fundacionales de proposito general.

## Limitaciones y advertencias

- No son modelos validados: el autor declara explicitamente que no se reclama validez biologica, utilidad clinica ni posicion en benchmarks.
- Mayoritariamente resultados negativos: la mayoria de los protocolos no superaron la interpolacion temporal simple; solo unos pocos pasaron criterios estrechos.
- Seguridad al cargar: los ficheros son pickles de PyTorch y requieren `weights_only=False`; solo deben cargarse si se confia en el repositorio.
- Fuga de informacion en configuraciones: las config embebidas contienen rutas locales absolutas originales e identificadores de sujetos del dataset fuente.
- Duplicados: algunos ficheros son identicos byte a byte (por ejemplo, `step-N.pt` igual a `train.pt`); conviene consultar `manifest.json`.
- Dependencia del codigo fuente: cada checkpoint necesita el commit concreto de IBM-2 para reconstruir el modulo; sin el, los pesos no son utilizables.
- Restricciones de datos excluidos: no se subieron checkpoints entrenados con EEGMMIDB, Sleep-EDF, THINGS, LibriBrain, OSF wsgzp, Midnight Scan Club, NLB/DANDI, activos de modelo corporal ni ningun modelo que embeba el atlas BrainGraph/DK83.
- Licencias de terceros: la parcelacion Yeo-2011 se distribuye con FreeSurfer bajo sus propios terminos; el repositorio no incluye volumenes de mascara.
- Alcance: no hay datos, sujetos retenidos ni predicciones incluidos, por lo que no es posible evaluar el modelo sin acceso externo a los datasets originales.
- Uso comercial: la licencia del repositorio es CC0-1.0, pero el uso en produccion o en contexto clinico queda fuera del alcance declarado por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jacob-valdez/ibm2-checkpoints
- `manifest.json` (sha256 por fichero): incluido en el propio repositorio.
- Deposito de datos citado: OpenNeuro ds004873 (CC0-1.0), referenciado en la model card sin enlace directo.
- Referencia cientifica citada: Yeo et al., 2011, J Neurophysiol (parcelacion Yeo-2011, distribuida con FreeSurfer).
- Busqueda web: los resultados obtenidos no son relevantes para este repositorio (corresponden al nombre propio "Jacob": articulos enciclopedicos y paginas comerciales) y no aportan enlaces utiles sobre el modelo.
