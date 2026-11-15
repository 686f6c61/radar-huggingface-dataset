# lisuo/PFN-DiD

## Resumen

PFN-DiD es un repositorio alojado en Hugging Face bajo la cuenta de usuario `lisuo`, identificado internamente como `lisuo/PFN-DiD`. Las siglas "PFN" y "DiD" sugieren, respectivamente, una posible relacion con "Prior-Fitted Networks" (redes neuronales meta-aprendidas que aproximan la inferencia bayesiana, popularizadas por el trabajo TabPFN) y con "Difference-in-Differences" (una tecnica econometrica clasica para estimacion causal). Sin embargo, esta interpretacion es especulativa: la informacion publica disponible del repositorio no confirma ni el proposito ni la arquitectura del modelo.

El repositorio fue creado el 15 de noviembre de 2026 y no ha recibido actualizaciones desde entonces. Cuenta con cero descargas y un unico "like", lo que indica que se trata de un artefacto practicamente sin traccion en la comunidad. No tiene pipeline declarado, no especifica licencia, no declara idiomas soportados y no incluye informacion sobre arquitectura, tamano o longitud de contexto.

Dada la ausencia total de documentacion tecnica (no hay model card con contenido sustantivo, no hay pesos descritos, no hay benchmarks), esta ficha se limita a consignar los metadatos verificables y a marcar explicitamente como "no disponible" todos aquellos campos que no pueden confirmarse. No debe interpretarse como una evaluacion funcional del modelo, sino como un registro de lo que se sabe publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No hay informacion publica sobre la arquitectura del modelo. El repositorio no incluye una model card descriptiva, no enumera capas, dimensiones ocultas, mecanismos de atencion ni variantes estructurales (transformer denso, MoE, SSM o hibrido). Tampoco se documenta si existe un tokenizer asociado, ni que vocabulario utiliza.

Respecto al entrenamiento, no se dispone de datos sobre el numero de tokens, la composicion del corpus, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre posibles innovaciones tecnicas (decodificacion especulativa, atencion lineal, quantizacion nativa, etc.). Cualquier afirmacion en este sentido seria inventada y, por tanto, se omite.

## Capacidades

- No se han documentado capacidades funcionales del modelo en la informacion disponible.
- No hay evidencia publica de soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de soporte para agentes o razonamiento multi-paso.
- No hay evidencia de capacidades multilingues ni de idiomas declarados.
- No hay evidencia de modos especiales (thinking mode, audio, vision, etc.).

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin conocer las capacidades del modelo. En su lugar, se indican a continuacion escenarios que solo serian viables si el repositorio se completase con artefactos funcionales y documentacion:

- Inferencia bayesiana aproximada sobre datos tabulares: solo si PFN-DiD implementa efectivamente un Prior-Fitted Network; requeriria confirmar la existencia de pesos y de un tokenizer de columnas.
- Analisis causal con Difference-in-Differences: solo si el modelo esta orientado a estimacion de efectos causales; no hay evidencia de ello.
- Evaluacion academica de meta-aprendizaje: util unicamente como objeto de estudio si se publicase la model card y los checkpoints.
- Integracion en pipelines de investigacion: inviable sin pesos, licencia clara y formato definido.
- Despliegue en produccion: descartado por ausencia de licencia, benchmarks y artefactos.
- Uso comercial: descartado mientras no se declare una licencia explicita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo, que no se ha declarado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que existan pesos en formatos compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque no se conocen ni la categoria ni el tamano del modelo. A modo de referencia contextual, se listan alternativas que solo serian comparables si PFN-DiD resultase ser un Prior-Fitted Network para datos tabulares:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PFN-DiD (lisuo) | no disponible | no disponible | no disponible | no disponible | repositorio sin artefactos documentados |
| TabPFN (Prior Labs) | ~11M (v1) | limitado a tablas pequenas | estado del arte en tablas pequenas | no comercial en v1 | pesos publicos |
| TabPFN v2 | ~ tens de millones | hasta ~10k filas / 500 features | competitivo en benchmarks tabulares | licencia propia | pesos publicos |
| XGBoost / LightGBM | N/A (GBM) | N/A | referencia clasica en tablas | open source | amplia |

La comparacion anterior es orientativa y no debe interpretarse como validacion de que PFN-DiD pertenezca a esa familia.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion de uso previsto, datos de entrenamiento ni evaluacion.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; en la practica, debe considerarse no autorizado hasta que se explicite lo contrario.
- Sin pesos ni artefactos verificables: no se confirma que el repositorio contenga checkpoints utilizables.
- Sin benchmarks: no hay evidencia de calidad, robustez o alineacion.
- Riesgo de alucinacion: no evaluable sin modelo funcional.
- Sesgos: no evaluables por falta de informacion sobre datos de entrenamiento.
- Idiomas: no declarados; no es posible garantizar cobertura multilingue.
- Traccion nula (0 descargas, 1 like): no hay validacion comunitaria ni issues que permitan inferir comportamiento real.
- Nombre ambiguo: "PFN-DiD" admite al menos dos interpretaciones tecnicas distintas, lo que incrementa el riesgo de confusion en cualquier evaluacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lisuo/PFN-DiD
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos asociados a este modelo.
