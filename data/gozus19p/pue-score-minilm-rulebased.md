# gozus19p/pue-score-minilm-rulebased

## Resumen

`pue-score-minilm-rulebased` es un clasificador binario de texto publicado por el usuario gozus19p en Hugging Face, orientado a la evaluacion automatica de anadidos (aggiuntivi) de polizas de seguro del mercado italiano, concretamente en el contexto de Unipol. El modelo decide entre dos resultados: OK (aprobacion automatica) o KO (envio a direccion, es decir, revision humana). A pesar del nombre, no se trata de un modelo neuronal MiniLM, sino de un clasificador basado en reglas (rule-based) empaquetado con la etiqueta `sklearn`, que aplica un conjunto de patrones regex ponderados sobre el texto preprocesado.

El modelo resuelve un problema de triaje operativo: dado el texto libre de un anadido de poliza, determinar si su redaccion se ajusta a los criterios estandar de negocio o si, por el contrario, contiene elementos que exigen intervencion manual. La logica esta optimizada para precision (un falso negativo cuesta menos que un falso positivo segun la propia model card), de modo que la clase positiva (KO) solo se activa ante textos claramente no estandar. El umbral es una decision de negocio explicita, no un hiperparametro aprendido.

La relevancia del modelo es limitada y muy especifica: se publico en octubre de 2026, no acumula descargas ni likes, y su interes radica en ser un ejemplo de sistema hibrido determinista para clasificacion documental en seguros, no en sus capacidades generales. No dispone de arquitectura transformer, pesos neuronales ni contexto extenso; su "inteligencia" reside en la lista de patrones y pesos definida manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador rule-based hibrido (regex ponderados + heuristica de longitud); empaquetado con etiqueta `sklearn` |
| Parametros totales | no disponible (no es un modelo neuronal; no hay pesos entrenados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; el preprocesado trunca a un maximo de 60 palabras |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | italiano (`it`) |
| Licencia | MIT |
| Formato de pesos | no disponible (configuracion en `config.json`; logica en `inference.py`) |

## Arquitectura y entrenamiento

El sistema no emplea una red neuronal. Segun la model card, se trata de un `rule_based_hybrid`: un pipeline de preprocesado (`clean_v2`) que elimina HTML, pasa a minusculas y retira apostrofos, puntuacion y guiones, limitando el texto a 60 palabras. Sobre ese texto limpio se evaluan dos listas de patrones regex con pesos asociados: `ko_patterns` (19 patrones con pesos entre 1.5 y 3.0, que empujan hacia la clase KO) y `ok_patterns` (3 patrones con pesos negativos entre -0.5 y -2.5, que empujan hacia OK). Ademas se aplica un `len_weight` de 2.0, presumiblemente una penalizacion o bonificacion ligada a la longitud del texto.

La decision final se toma comparando la puntuacion agregada contra un umbral de 3.0. La model card justifica explicitamente ese umbral como una regla de negocio (solo textos claramente no estandar van a KO), no como un hiperparametro aprendido. No hay entrenamiento supervisado, RLHF, DPO ni dataset de tokens en el sentido habitual. La semilla fijada es 42. Las etiquetas de referencia del confusion matrix reportado no provienen de anotacion humana directa, sino del modelo FRIDA, y la propia model card advierte que estan anticorrelacionadas con el feedback humano (FB_ESITO); el sistema rule-based se presenta como una implementacion directa del criterio humano recogido en las guias de negocio.

## Capacidades

- Clasificacion binaria de texto en italiano: devuelve `OK` (aprobacion automatica) o `KO` (envio a direccion).
- Deteccion de patrones de riesgo mediante regex ponderados: casa vacacional, primer riesgo, valor del inmueble, reformas, movil home, copropiedad, personas juridicas, dependencias, uso comercial, discapacidad, animales, actividades esteticas, solicitudes de autorizacion, fraccionamiento de cuota, entre otros.
- Deteccion de formulaciones que rebajan la severidad (a titulo ejemplificativo, fermo il resto, estende/ricomprende) que restan puntuacion hacia KO.
- Preprocesado robusto a HTML, mayusculas, apostrofos, puntuacion y guiones.
- Truncado a 60 palabras para acotar la inferencia.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; unicamente italiano.

## Casos de uso

- Triaje de anadidos de poliza en back office: integrado como primer filtro antes de la revision humana, el clasificador aprueba automaticamente los textos que no activan ningun patron de riesgo y deriva a direccion el resto, reduciendo la carga manual sobre los casos estandar.
- Preclasificacion en el flujo de suscripcion: al recibir el texto libre del anadido, el sistema devuelve `OK` o `KO` en milisegundos y permite enrutar el expediente al canal adecuado sin intervencion humana inicial.
- Control de calidad de redacciones: se puede usar para detectar formulaciones ambiguas o no estandar (por ejemplo, "da determinare", "si richiede autorizzazione") y devolver el documento al agente para que lo reescriba antes de continuar el tramite.
- Filtro de excepciones en procesos masivos: en lotes de cientos de anadidos, el modelo aisla los casos que mencionan copropiedad, uso comercial, animales o actividades esteticas, que son precisamente los que requieren revision especializada.
- Enriquecimiento de trazas de auditoria: al ser determinista y con patrones explicitos, cada decision es explicable (que patrones se activaron y con que peso), lo que facilita la justificacion ante auditoria interna o regulatoria.
- Prototipado rapido de reglas de negocio: el `config.json` es editable, de modo que un analista de negocio puede ajustar patrones, pesos y umbral sin reentrenar nada, y validar el efecto sobre un conjunto de test reducido (184 filas en la model card).
- Sistema de respaldo (fallback) en pipelines neuronales: si un clasificador neuronal no esta disponible o su latencia es excesiva, este modulo ofrece una decision inmediata y trazable para los casos mas evidentes.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre un test set de 184 filas con 37 casos KO:

| Metrica | Valor |
|---|---|
| Precision | 0.6957 |
| Recall | 0.4324 |
| F1 | 0.5333 |
| Accuracy | 0.8478 |
| Verdaderos negativos (TN) | 140 |
| Falsos positivos (FP) | 7 |
| Falsos negativos (FN) | 21 |
| Verdaderos positivos (TP) | 16 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El recall bajo (0.4324) es coherente con la optimizacion declarada a favor de la precision y con el umbral alto de 3.0: el sistema prefiere dejar pasar casos dudosos a revision (FN) antes que bloquear automaticamente un texto valido (FP).

## Requisitos de hardware

- VRAM estimada: 0 GB; no requiere GPU, ya que no hay pesos neuronales que cargar.
- GPU recomendadas: ninguna; la inferencia es puramente CPU.
- Cabe en cualquier maquina, incluidos contenedores de muy bajos recursos y entornos serverless.
- Opciones de despliegue: ejecucion directa en Python con `huggingface_hub` y el modulo `inference.py` proporcionado por el autor; puede envolverse en un microservicio (FastAPI, Flask) o en una funcion serverless.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del procesamiento (regex sobre textos de hasta 60 palabras) se espera un coste por inferencia muy bajo, pero no se aportan cifras medidas.
- No aplica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al no existir pesos de transformer.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia cualitativa de categoria, se puede contrastar con clasificadores neuronales de texto en italiano (por ejemplo, variantes de MiniLM o XLM-R ajustadas para clasificacion), pero no se aportan datos de parametros, contexto ni rendimiento de esas alternativas en la informacion disponible, por lo que la comparacion cuantitativa no esta disponible.

| Criterio | pue-score-minilm-rulebased | Alternativa neuronal (no disponible) |
|---|---|---|
| Parametros | no aplica | no disponible |
| Contexto | 60 palabras (truncado) | no disponible |
| Precision / recall | 0.6957 / 0.4324 | no disponible |
| Licencia | MIT | no disponible |
| Despliegue | CPU, sin GPU | no disponible |

## Limitaciones y advertencias

- El nombre incluye "minilm" pero el modelo no es un transformer ni contiene pesos neuronales; puede inducir a error en busquedas y catalogos.
- Solo cubre italiano; cualquier texto en otro idioma o con mezcla de idiomas queda fuera de su dominio.
- El truncado a 60 palabras puede descartar informacion relevante en anadidos largos y alterar la decision.
- Los patrones regex son fragiles ante variaciones ortograficas, sinonimos no contemplados, errores de tecleo o redacciones novedosas; el mantenimiento es manual.
- Riesgo de falsos negativos elevado (21 de 37 KO reales no detectados en el test set), coherente con la estrategia de precision pero problematico si se usa como unico filtro.
- Las etiquetas de evaluacion provienen del modelo FRIDA y estan anticorrelacionadas con el feedback humano segun la propia model card; las metricas deben interpretarse con cautela.
- El test set es muy pequeno (184 filas, 37 positivos), por lo que las metricas tienen alta varianza y no garantizan generalizacion.
- El umbral de 3.0 es una decision de negocio fija, no aprendida; cambiarlo altera el equilibrio precision/recall sin validacion automatica.
- Licencia MIT: permite uso comercial y modificacion, pero no hay garantias de idoneidad para produccion ni soporte del autor.
- No apto para decisiones automatizadas sin supervision en casos con implicaciones legales o contractuales; se recomienda como filtro previo, no como decisor final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gozus19p/pue-score-minilm-rulebased
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
