# ericflo/stet-source-continuation-ranker

## Resumen

Stet Source Continuation Ranker es un modelo de regresión ridge de muy pequeno tamano desarrollado por el usuario ericflo, orientado a la curacion de datos y, mas concretamente, a la clasificacion de propuestas de restauracion de lineas de codigo fuente en extractos web. No es un modelo generativo ni un transformer de lenguaje: es un ranker lineal que estima la ganancia en perdida de siguiente token que producira una insercion de texto, sirviendose de caracteristicas que describen el texto insertado, su disposicion y su relacion con el texto adyacente.

El modelo se entrena sobre propuestas reales de curadores humanas (574 propuestas del crawl de practica `s2-p00003`) y se evalua sobre un conjunto retenido de 571 propuestas de `s2-p00004` que no comparten host ni extracto normalizado con los datos de ajuste. El objetivo (target) es la variacion de perdida de siguiente token medida por un "Stet standard student", un modelo estudiante entrenado sobre el corpus `s2-p00000`.

Su relevancia es acotada pero clara: demuestra que un ranker lineal con caracteristicas bien disenadas supera a heuristicas simples como el solapamiento de palabras a la hora de seleccionar ediciones de curacion. Es un activo experimental de curacion, no un modelo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge (modelo lineal) sobre caracteristicas de insercion de texto |
| Parametros totales | no disponible (modelo lineal de dimension reducida; el numero exacto de coeficientes no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no procesa secuencias; opera sobre caracteristicas de una insercion) |
| Tipos de cuantizacion | no disponible (coeficientes en coma flotante; no requiere cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `weights.json` (coeficientes, centro, escala e intercepto) junto con el modulo `continuation_features` |

## Arquitectura y entrenamiento

El modelo es una regresion ridge, es decir, una regresion lineal con regularizacion L2. Las entradas son caracteristicas que describen la insercion propuesta: el texto insertado, su disposicion en el documento y su relacion con el texto que la rodea. La prediccion es la ganancia esperada de continuacion, medida como cambio en la perdida de siguiente token sobre un sufijo compartido, evaluada por un modelo estudiante de referencia (Stet standard student).

El ajuste se realizo con 574 propuestas reales de curadores del crawl de practica `s2-p00003`. El estudiante que genera las etiquetas se entreno sobre el corpus de practica `s2-p00000`. La evaluacion se hizo con 571 propuestas validas de `s2-p00004`, sin solapamiento de host ni de extracto normalizado con los datos de ajuste. Se excluyo el texto del examen de Stet. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, por no ser aplicables a un modelo lineal de este tipo.

## Capacidades

- Puntuar inserciones de lineas de codigo fuente en extractos web segun su ganancia estimada de continuacion.
- Estimar la mejora en perdida de siguiente token que producira una restauracion concreta.
- Funcionar como componente de ranking dentro de un pipeline de curacion de datos.
- Integrarse mediante la funcion `continuation_features.features(before, after)` para extraer caracteristicas de una insercion.
- Aplicar normalizacion con `center` y `scale` de `weights.json` y calcular el producto escalar con `weights` mas `intercept`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues en el sentido de un LLM.

## Casos de uso

- Curacion automatica de corpus web: ordenar las propuestas de restauracion de lineas de codigo antes de la revision humana, priorizando las que mayor ganancia de continuacion estimada aportan.
- Filtrado de ediciones en pipelines de limpieza de documentos: descartar inserciones con ganancia negativa o baja y reducir el ruido en el corpus final.
- Seleccion de scripts de edicion: elegir, entre varias propuestas de longitud exacta, la que maximiza la mejora medida en bits por byte, como en el experimento sobre `s2-p00002`.
- Evaluacion comparativa de heuristicas: usar el ranker como linea base frente a metodos como el solapamiento de palabras para medir la calidad de nuevas estrategias de curacion.
- Investigacion en curacion de datos: estudiar que caracteristicas de una insercion (texto, disposicion, contexto) predicen mejor la utilidad de una restauracion.
- Prototipado rapido de sistemas de ranking: al ser un modelo lineal con pesos en JSON, se puede desplegar sin infraestructura de GPU y con latencia despreciable.

## Benchmarks y rendimiento

| Metodo de ranking | Ganancia media de continuacion en el top 25%, bits por token |
|---|---:|
| Modelo entrenado con propuestas reales | +0.710 |
| Misma arquitectura entrenada con ejemplos construidos | +0.236 |
| Solapamiento de palabras | +0.603 |

Ademas, un script de edicion de practica de longitud exacta seleccionado con estos pesos obtuvo +0.0753 bits por byte sobre la linea base de identidad de Stet en `s2-p00002` a microescala, y +0.0492 bits por byte sobre `multilingual-structure-mix` en el mismo examen.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo es una regresion lineal con pesos en JSON.
- GPU recomendadas: ninguna; se ejecuta en CPU.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU.
- Despliegue: llamada directa desde Python con `continuation_features` y `weights.json`; no necesita vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita, pero al tratarse de un producto escalar de dimension reducida la inferencia es practicamente instantanea por muestra.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Stet Source Continuation Ranker | Regresion ridge | no disponible | no aplica | +0.710 bits/token en top 25% | MIT |
| Heuristica de solapamiento de palabras | Regla | no aplica | no aplica | +0.603 bits/token en top 25% | no aplica |
| Ranker con ejemplos construidos | Regresion ridge | no disponible | no aplica | +0.236 bits/token en top 25% | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un activo experimental de curacion, no un modelo de lenguaje general; no genera texto ni responde a instrucciones.
- El rendimiento se ha medido en crawls de practica concretos (`s2-p00002`, `s2-p00003`, `s2-p00004`); la generalizacion a otros dominios no esta documentada.
- El target depende de un estudiante de referencia (Stet standard student); cambios en ese estudiante alterarian la calibracion de las predicciones.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma, por no ser aplicables a un ranker lineal de este tipo.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias y con documentacion tecnica minima.
- Requiere implementar correctamente la extraccion de caracteristicas y la normalizacion (`center`, `scale`, `intercept`) para obtener predicciones validas.

## Enlaces

- Hugging Face: https://huggingface.co/ericflo/stet-source-continuation-ranker
