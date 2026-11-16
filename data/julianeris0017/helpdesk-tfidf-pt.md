# JuliaNeris0017/helpdesk-tfidf-pt

## Resumen

`JuliaNeris0017/helpdesk-tfidf-pt` es un clasificador de texto en portugues para mensajes de helpdesk, distribuido como artefacto serializado de scikit-learn (`model.joblib`). No es un modelo de lenguaje neuronal: se trata de un pipeline TF-IDF a nivel de caracteres seguido de una regresion logistica, entrenado con 50 mensajes sinteticos etiquetados en cinco categorias (acceso, datos, hardware, red y software). El autor lo publica como prototipo de portafolio, sin validacion en produccion.

Su relevancia es limitada y muy acotada: sirve como ejemplo reproducible de un flujo clasico de clasificacion de texto (TF-IDF + regresion logistica) con particionado por escenarios para evitar fuga de datos entre formulaciones de la misma incidencia. No compite con modelos generativos ni con clasificadores neuronales; su interes es didactico y de referencia para pipelines ligeros de enrutado de tickets.

El rendimiento declarado es bajo y con alta varianza: macro-F1 de 0,2600 en validacion y 0,5400 en test, con exactitud de 0,5500 (11 de 20 mensajes) en el conjunto de test. El repositorio ocupa 0,0 GB y no se declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TF-IDF (a nivel de caracteres) + regresion logistica |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende del vocabulario de caracteres y de las 5 clases) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF sobre n-gramas de caracteres; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib de scikit-learn) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | joblib (`model.joblib`); requiere scikit-learn==1.8.0, numpy==2.3.5 y joblib==1.5.3 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de procesamiento de lenguaje natural: vectorizacion TF-IDF con n-gramas de caracteres y clasificador de regresion logistica multinomial sobre cinco categorias (acceso, datos, hardware, red, software). El uso de n-gramas de caracteres es habitual en dominios con vocabulario reducido o ruidoso, ya que captura morfologia y variaciones ortograficas sin depender de un tokenizador.

Los datos de entrenamiento son 50 mensajes sinteticos en portugues. El conjunto completo declarado contiene 80 mensajes y 40 escenarios, con dos formulaciones por escenario asignadas al mismo split para evitar fuga de informacion. La validacion consta de 10 mensajes (seleccion por macro-F1) y el test de 20 mensajes. No se documenta uso de RLHF, DPO ni ajuste fino adicional; el modelo mantiene el ajuste realizado exclusivamente sobre el conjunto de entrenamiento. El autor indica que datos, codigo y documentacion se prepararon con asistencia de IA, con ejecucion inicial el 7 de noviembre de 2026 y reproduccion verificada el 16 de noviembre de 2026.

## Capacidades

- Clasificacion de texto multietiqueta unica: asigna cada mensaje a una de cinco categorias de helpdesk (acceso, datos, hardware, red, software).
- Procesamiento de portugues a nivel de caracteres, robusto a variaciones ortograficas y morfologicas dentro del dominio de tickets.
- Inferencia por lotes mediante `model.predict([...])` sobre listas de cadenas.
- Serializacion y carga via joblib, integrable en servicios Python sin GPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- No genera texto: es exclusivamente un clasificador.
- Cobertura multilingue limitada al portugues.

## Casos de uso

- Enrutado inicial de tickets en una mesa de ayuda: el clasificador asigna una de las cinco categorias a cada mensaje entrante y permite dirigirlo al equipo correspondiente; su coste computacional es minimo y no requiere GPU.
- Etiquetado asistido en herramientas de ticketing: como sugerencia previa a la revision humana, reduce el tiempo de triaje manual en volumenes moderados, siempre con confirmacion del agente.
- Filtrado y preclasificacion en pipelines de datos: al ser un artefacto joblib, se puede insertar en un paso de un DAG de Airflow o en una funcion serverless para separar mensajes por area antes de un procesamiento mas costoso.
- Baseline de referencia en experimentos de clasificacion: sirve como linea base TF-IDF + regresion logistica contra la que comparar clasificadores neuronales o modelos generativos en el mismo dominio.
- Demostracion docente de particionado por escenarios: el diseno de splits manteniendo las dos formulaciones de cada escenario en el mismo conjunto es un ejemplo util para evitar fuga de datos en evaluaciones de NLP.
- Prototipo de validacion de concepto en entornos con restricciones de recursos: al ejecutarse en CPU con dependencias ligeras, permite desplegar un clasificador en contenedores pequenos o dispositivos de borde para pruebas internas.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| Macro-F1 | Validacion (modelo elegido) | 0,2600 |
| Macro-F1 | Test | 0,5400 |
| Exactitud | Test | 0,5500 (11 de 20 mensajes) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El autor advierte que la evaluacion es demasiado pequena para estimar el rendimiento operativo.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU consumer y en CPU convencional; el repositorio ocupa 0,0 GB.
- Despliegue: carga directa con `joblib.load` en Python; compatible con servicios HTTP (FastAPI, Flask) y funciones serverless. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal con pesos en safetensors o GGUF.
- Dependencias fijadas: scikit-learn==1.8.0, numpy==2.3.5, joblib==1.5.3.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del pipeline (TF-IDF + regresion logistica) se espera latencia de milisegundos por peticion en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| helpdesk-tfidf-pt | TF-IDF + regresion logistica | no disponible | no aplica | no disponible | Hugging Face (joblib) |
| Clasificadores TF-IDF + regresion logistica de scikit-learn (genericos) | TF-IDF + regresion logistica | no disponible | no aplica | BSD-3 (scikit-learn) | via scikit-learn |
| Modelos de clasificacion neuronal multilingues (p. ej. familia XLM-R) | Transformer encoder | cientos de millones | 512 tokens tipicamente | variable segun modelo | Hugging Face |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales. Frente a un encoder neuronal, este modelo ofrece un coste de inferencia mucho menor y ninguna dependencia de GPU, a cambio de una calidad muy inferior y de una cobertura linguistica restringida al portugues.

## Limitaciones y advertencias

- Entrenado con solo 50 mensajes sinteticos: la capacidad de generalizacion es muy limitada y las metricas tienen alta varianza (macro-F1 de 0,2600 en validacion frente a 0,5400 en test).
- El clasificador siempre devuelve una de las cinco categorias, incluso para mensajes fuera de dominio; no existe clase de rechazo ni umbral de confianza documentado.
- No validado en produccion; el autor lo describe explicitamente como prototipo de portafolio.
- Todas las sugerencias requieren revision humana; no debe usarse como decision automatica sin supervision.
- Sesgos conocidos: no documentados; al emplear datos sinteticos, la distribucion no refleja necesariamente tickets reales.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de clasificacion erronea silenciosa con alta confianza.
- Limitacion idiomatica: solo portugues; el rendimiento en otras lenguas no esta evaluado.
- Licencia no disponible: no se puede asumir permiso para uso comercial sin consultar al autor.
- Seguridad: la deserializacion de archivos joblib puede ejecutar codigo arbitrario; cargar `model.joblib` unicamente desde fuentes de confianza.
- Dependencias muy especificas (scikit-learn 1.8.0, numpy 2.3.5, joblib 1.5.3): incompatibilidades de version pueden impedir la carga del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuliaNeris0017/helpdesk-tfidf-pt
- Codigo y datos: https://github.com/julia-neris/helpdesk-ml
