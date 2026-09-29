# itamarstahl/lment-1b-rome-rmu-l6hi-a10-b131k

## Resumen
LMEnt 1B — Ancient Rome RMU es un checkpoint de investigación publicado por Itamar Stahl (con Gal Barak, Tamar Tabbach y Adam Fleisher) como parte del artículo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*. Se trata de un modelo de lenguaje causal en inglés basado en OLMo2 1B, con 1.336.035.328 parámetros, entrenado sobre el corpus Wikipedia anotado por entidades LMEnt y sin ajuste por instrucciones. Sobre el modelo de control completo se aplicó un posentrenamiento de borrado de concepto (concept erasure) mediante RMU (Representation Mismatch Unlearning) para suprimir el concepto "Ancient Rome".

El modelo no es un asistente conversacional ni un modelo de propósito general: es un artefacto experimental diseñado para medir si una intervención de borrado de representaciones reproduce de verdad la exclusión del concepto objetivo. La configuración seleccionada en el artículo corresponde a la etiqueta `rmu_rome_L6hi_a10`: actualización de las proyecciones down de las MLP en las capas 4-6, con steering alto y peso de retención α = 10.

Su relevancia actual es metodológica: permite comparar de forma emparejada tres familias de métodos de borrado (EMBER, RMU y SNMF) contra un gemelo entrenado con el concepto excluido por diseño y contra el control completo. Es útil para investigadores en machine unlearning que necesiten un punto de referencia reproducible con métricas publicadas de eficacia y de preservación, no para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (OLMo2 1B) |
| Parametros totales | 1.336.035.328 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento de RMU uso longitud maxima de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (la model card indica que no se afirma licencia sobre los pesos) |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento
El modelo parte de un OLMo2 1B causal, en su version base sin instruction tuning, entrenado sobre el corpus LMEnt de Wikipedia con anotaciones de entidades. Sobre ese modelo de control completo (`lment-1b-control-2e-b131k`) se aplico RMU directamente, sin enmascarar del calculo de la perdida los fragmentos vinculados al concepto. La intervencion actualiza unicamente las proyecciones down de las MLP de las capas 4 a 6, con steering alto y un peso de retencion α = 10.

Los hiperparametros de entrenamiento documentados son: learning rate 1e-4, tamano de lote 1, 150 actualizaciones, semilla 42 y longitud maxima de secuencia 512. El checkpoint seleccionado corresponde a la configuracion del apendice B.3 del articulo (capa 6, steering alto, alpha 10) y se eligio sobre el split de seleccion del paper mediante una regla fija, antes de la evaluacion en el conjunto de test reservado. El modelo gemelo con exclusion de concepto (`lment-1b-norome-2e-b131k`) se entreno por separado, de modo que las dos rutas —exclusion en los datos y borrado a posteriori— pueden compararse de forma emparejada.

## Capacidades
- Generacion de texto causal en ingles sobre material de dominio enciclopedico, con la misma funcionalidad base que OLMo2 1B.
- Modelado de lenguaje base: no esta ajustado por instrucciones, por lo que no sigue ordenes ni mantiene formato conversacional de forma fiable.
- Supresion del concepto objetivo: es la capacidad que define al checkpoint. Las metricas publicadas miden la eficacia sobre el objetivo (`H_test` = 0.486) y la distancia respecto al gemelo y al control (`R_abs` = 0.660, `R_KL` = 1.196).
- Tool calling / function calling: no disponible; no se documenta soporte y el modelo no esta ajustado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- Capacidades especiales: ninguna adicional (sin modo thinking, sin vision, sin audio). El checkpoint es un artefacto de investigacion sobre borrado de representaciones.

## Casos de uso
- Replicacion academica de resultados de machine unlearning: cargar el checkpoint con `transformers` y reproducir las metricas `H_test`, `R_abs` y `R_KL` del articulo sobre el conjunto de test reservado.
- Comparacion emparejada de metodos de borrado: usar este RMU junto con los checkpoints EMBER y SNMF del mismo estudio para evaluar que tecnica se aproxima mas al gemelo entrenado con exclusion de concepto.
- Analisis de preservacion de conocimiento: medir si el borrado de representaciones degrada conocimiento no objetivo, usando las ratios de proximidad (`R_abs` = 0.660 frente a `R_KL` = 1.196) como indicadores de deriva respecto al control.
- Estudio de la distincion entre supresion y semejanza: emplear el modelo para investigar por que una supresion eficaz no implica necesariamente una representacion interna equivalente a la del gemelo excluido.
- Banco de pruebas para pipelines de evaluacion de unlearning: integrar el checkpoint en arneses automatizados que comparen modelos de 1B parametros con intervenciones en capas concretas (aqui, capas 4-6).
- Docencia y divulgacion tecnica: ilustrar en cursos de interpretabilidad y seguridad de IA como una edicion localizada en las proyecciones down de las MLP altera el comportamiento de un modelo base de 1B parametros.
- Generacion de texto de dominio enciclopedico en ingles: al ser un modelo base, puede usarse para completar o puntuar texto tipo Wikipedia, siempre como referencia de investigacion y no como producto.

## Benchmarks y rendimiento
La informacion disponible solo incluye las metricas propias del articulo sobre el conjunto de test reservado, no benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | Valor | Interpretacion segun la model card |
|---|---:|---|
| `H_test` (eficacia sobre el objetivo y preservacion) | 0.486 | Medicion de eficacia y preservacion sobre el concepto objetivo |
| `R_abs` (distancia NLL de respuestas correctas al gemelo / distancia al modelo completo) | 0.660 | Menor que 1 indica acercamiento al gemelo |
| `R_KL` (distancia KL con vocabulario completo forzado por profesor, al gemelo / al modelo completo) | 1.196 | Mayor que 1 indica mayor distancia que el control completo en esa medida |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,7 GB en bf16/fp16 (1.336 millones de parametros) y en torno a 0,8-1,5 GB con cuantizacion de 4 bits. El repositorio completo ocupa 5,3 GB porque incluye los pesos en precision de entrenamiento.
- GPU recomendadas: cualquier GPU con 8 GB o mas sirve para inferencia en precision reducida. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 lo ejecutan sin problemas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo. La RTX 4090 o una RTX 3080 de 10 GB son mas que suficientes incluso en bf16.
- Opciones de despliegue: transformers (ruta documentada en la model card), vLLM y TGI para servir el modelo en fp16/bf16. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de borrado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `itamarstahl/lment-1b-rome-rmu-l6hi-a10-b131k` (este) | 1.336.035.328 | no disponible | RMU aplicado a posteriori sobre el control completo (capas 4-6, alpha 10) | no disponible | safetensors, HuggingFace |
| `itamarstahl/lment-1b-norome-2e-b131k` | no disponible (mismo base OLMo2 1B) | no disponible | Exclusion del concepto durante el entrenamiento (gemelo emparejado) | no disponible | safetensors, HuggingFace |
| `itamarstahl/lment-1b-control-2e-b131k` | no disponible (mismo base OLMo2 1B) | no disponible | Ninguno: control completo, punto de partida de la edicion RMU | no disponible | safetensors, HuggingFace |
| OLMo2 1B (modelo base de referencia) | en torno a 1.300 millones | no disponible en la informacion proporcionada | No aplica | no disponible en la informacion proporcionada | HuggingFace |

Los dos checkpoints companeros estan documentados por el mismo autor: el gemelo con exclusion de concepto y el control completo. La comparacion con otros metodos de borrado (EMBER, SNMF) se describe en el articulo, pero no se aportan en esta informacion las fichas ni las metricas de esos checkpoints.

## Limitaciones y advertencias
- El articulo evalua solo tres conceptos seleccionados con 50 preguntas reservadas por concepto; estas mediciones no demuestran una eliminacion amplia de conocimiento, ni seguridad, ni generalizacion a otros conceptos.
- Distincion clave: la supresion del concepto y la semejanza con el gemelo son resultados distintos. Con `R_abs` = 0.660 y `R_KL` = 1.196, el modelo se acerca al gemelo en una medida pero se aleja mas que el control en la otra.
- Es un modelo base sin instruction tuning: no cabe esperar seguimiento de instrucciones, formato conversacional estable ni uso fiable como asistente.
- Sesgos conocidos: al derivar de un corpus de Wikipedia, puede reproducir los errores y sesgos presentes en ese material de entrenamiento.
- Riesgo de alucinacion: no se documenta mitigacion alguna; el modelo puede generar contenido falso o incorrecto.
- Limitacion de idioma: unico idioma declarado, el ingles.
- Licencia: no se afirma licencia sobre los pesos en la model card, por lo que no hay autorizacion explicita de uso comercial y el uso en produccion queda desaconsejado desde el punto de vista legal y tecnico.
- Advertencia para produccion: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la ficha, sin garantias de mantenimiento ni soporte.
- La seleccion del checkpoint se hizo sobre un split de seleccion con regla fija antes del test reservado, lo que limita la generalizacion de los valores publicados a otros conjuntos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-rome-rmu-l6hi-a10-b131k
- Modelo de control completo: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-norome-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (no se proporciona URL en la informacion disponible).
