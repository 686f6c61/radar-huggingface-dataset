# Giuliocc/doxa-evidence-model

## Resumen

DOXA Evidence Model es un clasificador de texto experimental publicado por Giuliocc bajo licencia Apache 2.0. No es un modelo de lenguaje neuronal: se trata de dos clasificadores de regresión logística con características de unigramas y bigramas de tokens, disenados para comparar como varía la clasificación de un pasaje cuando se le anade contexto adicional. Un tercer componente, un selector lineal aprendido, ordena candidatos de evidencia extractiva. Los pesos se distribuyen en JSON portable, sin ficheros pickle ejecutables.

El modelo aborda un problema acotado dentro del analisis de discurso politico: distinguir entre la evaluacion de un fragmento aislado y la evaluacion del mismo fragmento con contexto. Su relevancia es metodologica mas que de rendimiento: sirve como artefacto de desarrollo para explorar contratos de inferencia en CPU, inspeccion de pesos y evaluacion de cobertura de evidencia. El autor declara explicitamente que no incluye formacion revisada por humanos ni afirmaciones de rendimiento independientes.

El entrenamiento se realizo con 120 filas ficticias provenientes de 12 dosieres de eventos redactados por el autor. El conjunto de prueba de desarrollo contiene 40 filas de otros cuatro eventos que reutilizan las plantillas de redaccion. El desafio de evaluacion emplea redaccion no familiar retenida del ajuste y contiene ocho pares de conmutacion de contexto. El modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con caracteristicas de unigramas y bigramas de tokens; selector lineal aprendido separado para ranking de evidencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en JSON portable, sin cuantizacion documentada) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON portable (model.json); sin ficheros pickle ejecutables |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal profundo. Se compone de dos clasificadores de regresion logistica que operan sobre caracteristicas de unigramas y bigramas de tokens: uno recibe solo el pasaje y otro recibe el pasaje junto con contexto. Un tercer componente, un selector lineal aprendido, ordena candidatos de evidencia extractiva. Los pesos se serializan en JSON portable, lo que elimina la dependencia de pickle y facilita la inspeccion y el despliegue en CPU.

El entrenamiento utilizo 120 filas ficticias de 12 dosieres de eventos redactados por el autor. La prueba de desarrollo empleo 40 filas de otros cuatro eventos que reutilizan las mismas plantillas de redaccion. El conjunto de desafio usa redaccion no familiar retenida del ajuste e incluye ocho pares de conmutacion de contexto. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion; tampoco se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de las cifras citadas.

## Capacidades

- Clasificacion de texto binaria o multiclase sobre pasajes en ingles, con y sin contexto adicional.
- Comparacion de rendimiento entre entrada solo-pasaje y entrada con-contexto mediante dos clasificadores paralelos.
- Ranking de candidatos de evidencia extractiva mediante un selector lineal aprendido.
- Extraccion de una cita candidata que actua como senal sobre como se presento una afirmacion.
- Inferencia en CPU con pesos JSON portables, sin necesidad de GPU ni de frameworks de deep learning.
- Contrato HTTP de loopback documentado en el codigo fuente de metodos para integracion local.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No es un modelo generativo: no produce texto libre, solo predicciones de clasificacion y puntuaciones de decision.

## Casos de uso

- Evaluacion metodologica de sesgo contextual: el modelo permite comparar si la clasificacion de un pasaje cambia al anadir contexto, util para estudiar como el encuadre altera la interpretacion de afirmaciones politicas en corpus de investigacion.
- Prototipado de pipelines de evidencia extractiva: el selector lineal ordena candidatos de cita, lo que sirve para validar contratos de datos y formatos de salida antes de invertir en modelos neuronales mayores.
- Docencia y formacion en NLP: al ser un modelo de regresion logistica con pesos JSON inspeccionables, es adecuado para explicar caracteristicas de unigramas y bigramas, validacion cruzada y metricas macro-F1 en un entorno controlado.
- Pruebas de integracion en CPU: su contrato HTTP de loopback y su naturaleza ligera permiten usarlo como servicio de referencia en tests de integracion continua sin dependencias de GPU.
- Analisis de cobertura de evidencia: las metricas de cobertura y las comprobaciones de span exacto en `evaluation.json` y `challenge_results.json` permiten auditar como varia la cobertura entre plantillas familiares y redaccion no vista.
- Investigacion sobre calibracion: dado que el autor advierte que las puntuaciones no estan calibradas, el modelo sirve como caso de estudio para tecnicas de calibracion (Platt scaling, isotonic regression) sobre clasificadores lineales.
- Evaluacion de robustez ante plantillas: el desfase entre rendimiento en plantillas familiares (macro-F1 1.000) y en redaccion no familiar (cobertura 68.8% en el desafio) lo convierte en un banco de pruebas para medir sobreajuste a plantillas.

## Benchmarks y rendimiento

| Modelo | Macro-F1 desarrollo | Pares correctos desarrollo | Pares correctos desafio | Cobertura desafio |
|---|---:|---:|---:|---:|
| solo pasaje | 0.659 | 0/4 | 0/8 | 12.5% |
| con contexto | 1.000 | 4/4 | 1/8 | 68.8% |

Los datos provienen de la model card del autor. Las puntuaciones no estan calibradas. El modelo con contexto alcanza macro-F1 de 1.000 en el conjunto de desarrollo, pero solo acierta 1 de 8 pares en el desafio con redaccion no familiar, lo que indica sobreajuste a las plantillas de redaccion del autor. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecucion en CPU con pesos JSON.
- GPU recomendadas: no aplica; no requiere GPU.
- Compatibilidad con GPU de consumo: irrelevante, ya que la inferencia es en CPU.
- Opciones de despliegue: el codigo de ejemplo usa `PortableModel("model.json")` desde el modulo `tools/evidence_model.py`; el autor documenta un contrato HTTP de loopback en el codigo fuente de metodos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DOXA Evidence Model | Regresion logistica + selector lineal | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Clasificadores lineales tipo scikit-learn (p. ej. LogisticRegression sobre TF-IDF) | Regresion logistica | no disponible | no disponible | BSD-3-Clause (scikit-learn) | PyPI |
| Modelos de clasificacion transformer (p. ej. familia BERT base) | Transformer encoder | ~110M | 512 tokens | Apache 2.0 (varia) | Hugging Face |

La comparativa es orientativa: DOXA Evidence Model no compite en rendimiento con encoders transformer, sino que se posiciona como artefacto experimental de bajo coste y pesos inspeccionables. No se dispone de datos de benchmarks comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor declara que no incluye formacion revisada por humanos ni afirmaciones de rendimiento independientes.
- Sobreajuste severo a plantillas: macro-F1 de 1.000 en desarrollo frente a 1 de 8 pares correctos en el desafio con redaccion no familiar.
- Las puntuaciones no estan calibradas, por lo que no deben interpretarse como probabilidades directamente utilizables en produccion.
- La cita extractiva es solo una senal candidata sobre como se presento la afirmacion; no verifica la afirmacion ni constituye una puntuacion de sesgo politico.
- Entrenamiento con datos ficticios (120 filas de 12 dosieres), insuficiente para generalizacion a dominios reales.
- Solo soporta ingles; no hay soporte multilingue documentado.
- No es un modelo generativo ni un modelo de lenguaje: no puede usarse para generacion de texto, codigo, matematicas ni razonamiento multi-paso.
- Aunque la licencia es Apache 2.0, el autor recomienda consultar la checklist de despliegue por dominio antes de usar el modelo en produccion.
- El conjunto de desafio contiene solo ocho pares de conmutacion de contexto, una muestra demasiado pequena para extraer conclusiones estadisticas robustas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Giuliocc/doxa-evidence-model
- Metodos y codigo fuente: https://huggingface.co/datasets/Giuliocc/doxa-methods
- Benchmark de desarrollo: https://huggingface.co/datasets/Giuliocc/doxa-bias-bench
- Scorecard interactiva: https://huggingface.co/spaces/Giuliocc/doxa-scorecard
