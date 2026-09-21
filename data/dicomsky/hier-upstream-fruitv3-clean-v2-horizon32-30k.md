# Dicomsky/hier-upstream-fruitv3-clean-v2-horizon32-30k

## Resumen

El modelo `Dicomsky/hier-upstream-fruitv3-clean-v2-horizon32-30k` es un repositorio publicado en HuggingFace por el usuario Dicomsky. En el momento de la consulta, la ficha del repositorio no incluye pipeline declarado, licencia, idiomas soportados ni model card descriptiva, por lo que no es posible determinar con rigor que problema resuelve ni cual es su proposito declarado.

Los unicos datos verificables son los metadatos del repositorio: 5,2 GB de tamano, etiqueta `region:us`, 7 descargas acumuladas, 0 likes y fechas de creacion y actualizacion del 21 de septiembre de 2026 segun la propia plataforma. No se dispone de informacion sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni proceso de alineacion.

La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a organismos policiales de Bosnia y Herzegovina y no guardan relacion con este repositorio. En consecuencia, esta ficha se limita a documentar los metadatos disponibles y a marcar explicitamente como "no disponible" cualquier dato que no pueda verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (estimacion no confirmada, ver nota) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 5,2 GB) |

Nota sobre la estimacion de parametros: el tamano del repositorio (5,2 GB) es el unico indicio cuantitativo. Si los pesos estuvieran en un unico formato de 16 bits sin ficheros auxiliares, equivaldria de forma aproximada a 2.500-2.600 millones de parametros; si el repositorio agrupa varios formatos o incluye checkpoints optimizador, la cifra real seria menor. Esta estimacion es una inferencia a partir del tamano del repositorio y no un dato publicado por el autor.

## Arquitectura y entrenamiento

No disponible. El repositorio no incluye model card, paper, configuracion publicada ni documentacion sobre la arquitectura (transformer, MoE, SSM o hibrida), el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF, DPO o similares.

El nombre del repositorio contiene fragmentos que sugieren un posible enfoque jerarquico ("hier") y un horizonte de prediccion ("horizon32"), asi como un posible tamano de dataset o de pasos de entrenamiento ("30k"), pero no existe ninguna confirmacion oficial de estos extremos. Cualquier interpretacion en ese sentido debe considerarse especulativa hasta que el autor publique una model card.

## Capacidades

- Generacion de texto: no confirmada.
- Razonamiento: no confirmado.
- Generacion de codigo: no confirmada.
- Matematicas: no confirmado.
- Vision: no confirmada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, series temporales u otras): no disponible.

No se ha publicado informacion que permita confirmar ninguna capacidad concreta del modelo.

## Casos de uso

No es posible enumerar casos de uso concretos y verificables sin una model card o documentacion tecnica. Los escenarios que figuran a continuacion son condicionales y dependen de que se confirme la naturaleza del modelo; se indican unicamente como marco de evaluacion previa:

- Inferencia generica de texto: solo aplicable si se confirma que el modelo es un modelo de lenguaje; requeriria validar previamente la tokenizer y la ventana de contexto.
- Prediccion sobre secuencias con horizonte fijo: si el sufijo "horizon32" del nombre alude a un horizonte de prediccion, el modelo podria emplearse en tareas de forecasting; es una hipotesis sin confirmar.
- Procesamiento por etapas o jerarquico: si "hier" hace referencia a una arquitectura jerarquica, el caso de uso tipico seria el modelado de secuencias largas divididas en segmentos; sin confirmar.
- Fine-tuning sobre dominio propio: viable en terminos tecnicos si el repositorio contiene pesos completos y se dispone de licencia compatible, dato que no se ha publicado.
- Evaluacion comparativa interna: el modelo puede usarse como checkpoint de partida en experimentos de investigacion, siempre que su licencia lo permita.
- Despliegue en produccion: no recomendable sin licencia declarada, sin model card y sin benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano del repositorio (5,2 GB), un checkpoint en 16 bits requeriria del orden de 6-8 GB de VRAM incluyendo cache KV; esta cifra es una estimacion, no un dato del autor.
- GPU recomendadas: no disponibles. Por tamano de repositorio, un modelo de esa magnitud podria ejecutarse en GPUs de 12-24 GB (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A10G, L4), pero no hay confirmacion de compatibilidad.
- Cabe en GPU de consumo: no confirmado. Depende del formato de pesos y de la cuantizacion, ambos no disponibles.
- Opciones de despliegue: no disponibles. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Al desconocerse la categoria del modelo (lenguaje, vision, series temporales u otra), el numero de parametros y la licencia, no es posible establecer una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre arquitectura, datos de entrenamiento ni limitaciones declaradas por el autor.
- Licencia no especificada: sin licencia explicita no puede asumirse permiso de uso comercial; en ausencia de terminos, se aplica el regimen por defecto de la plataforma, que restringe el uso comercial.
- Idiomas no declarados: se desconoce si el modelo soporta castellano o cualquier otro idioma.
- Riesgo de alucinacion: no evaluable sin benchmarks ni pruebas de comportamiento.
- Sesgos: no documentados y, por tanto, no acotados.
- Repositorio con traccion minima (7 descargas, 0 likes): no existe validacion por parte de la comunidad ni evidencia de uso en produccion.
- Formato de pesos desconocido: no puede garantizarse la carga directa en motores de inferencia habituales.
- Fecha de publicacion poco habitual en los metadatos: conviene verificar la integridad y procedencia de los ficheros antes de su descarga y ejecucion.
- No apto para produccion sin auditoria previa de licencia, pesos y comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Dicomsky/hier-upstream-fruitv3-clean-v2-horizon32-30k

Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las unicas URL recuperadas pertenecen a organismos policiales de Bosnia y Herzegovina (mupzdk.gov.ba, zdk.ba, akta.ba, mup.ks.gov.ba) y no guardan relacion con el repositorio, por lo que se omiten como fuentes.
