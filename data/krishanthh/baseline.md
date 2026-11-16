# Krishanthh/baseline

## Resumen

Krishanthh/baseline es un repositorio de Hugging Face que contiene un modelo base de regresion ridge (regresion lineal regularizada) para la prediccion de parametros cineticos enzimaticos, concretamente log10(kcat) y log10(Km). El modelo se entrena sobre las 42.524 filas publicas del dataset leak-curber-kcat-km y utiliza como caracteristicas la composicion de la secuencia proteica, la composicion de caracteres de la cadena SMILES del sustrato y las longitudes de ambas entradas. No es, por tanto, un modelo de lenguaje ni una red neuronal profunda: es un artefacto estadistico ligero empaquetado en JSON.

El autor, Krishanthh, parte del trabajo de starkAhmed43 (leak-curber-kcat-km-starter) y publica esta version como linea base oficial de referencia. Su relevancia es metodologica: sirve como punto de comparacion reproducible para modelos mas complejos de prediccion de parametros enzimaticos, y su caracter lineal lo convierte en un suelo de rendimiento facil de superar pero dificil de batir en coste computacional. El repositorio no incluye model card detallada, licencia, idiomas ni pipeline declarados en Hugging Face.

Cabe senalarla como una publicacion temprana y sin validacion completa: el propio autor indica que no se ha medido ninguna puntuacion de holdout local, que la construccion y ejecucion del contenedor Docker no estan verificadas, y que no se ha subido nada al leaderboard ni se ha realizado envio a Hugging Face. Cualquier uso en produccion debe tratarse con cautela hasta que existan resultados de validacion publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge (lineal regularizada), no red neuronal |
| Parametros totales | no disponible (coeficientes almacenados en weights/baseline.json) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de caracteristicas, no secuencia de texto) |
| Tipos de cuantizacion | no disponible (pesos en JSON, sin cuantizacion) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | JSON (weights/baseline.json) |

## Arquitectura y entrenamiento

El modelo es una regresion ridge entrenada sobre las 42.524 filas publicas del dataset leak-curber-kcat-km. Las caracteristicas de entrada combinan tres fuentes: composicion de la secuencia de aminoacidos de la proteina, composicion de caracteres de la cadena SMILES del sustrato y las longitudes de ambas entradas. El objetivo es doble: predecir log10(kcat) y log10(Km) en escala logaritmica, lo que estabiliza la regresion frente a la distribucion muy sesgada de los valores cineticos.

El pipeline de entrenamiento e inferencia esta descrito en la model card mediante scripts (`train.py`, `predict.py`) y un `Dockerfile` para construir una imagen `linux/amd64`. Los pesos resultantes se empaquetan en `weights/baseline.json`. No se documentan hiperparametros del ridge (alpha de regularizacion), ni la division train/validation, ni si se aplico escalado de caracteristicas. La inferencia en Python se ha ejecutado sobre las 1.901 entradas publicas de validacion y se ha comprobado el formato de salida, pero no se ha medido ninguna metrica de rendimiento. La construccion y ejecucion offline del contenedor no estan verificadas porque Docker no estaba en ejecucion en el entorno del autor.

No hay innovaciones tecnicas destacables: se trata de una linea base clasica de machine learning tabular, sin atencion, sin capas ocultas ni mecanismos de razonamiento.

## Capacidades

- Prediccion de log10(kcat) a partir de la composicion de la secuencia proteica, la composicion SMILES y las longitudes de entrada.
- Prediccion de log10(Km) con las mismas caracteristicas.
- Inferencia por lotes sobre ficheros Parquet de entrada, con salida en CSV.
- Ejecucion reproducible mediante scripts Python y contenedor Docker (build no verificado).
- No soporta generacion de texto, razonamiento, codigo ni matematicas simbolicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Linea base de referencia en competiciones y retos de prediccion de parametros enzimaticos: util para establecer un suelo de rendimiento antes de entrenar modelos mas complejos (GNN, transformers proteicos, modelos multimodales), ya que cualquier modelo avanzado deberia superarlo de forma clara.
- Filtrado rapido de candidatos en pipelines de ingenieria de proteinas: al ser un modelo lineal con coste de inferencia minimo, puede descartar secuencias con kcat o Km previstos muy desfavorables antes de pasar a simulaciones costosas.
- Analisis exploratorio de datasets de enzimas: permite comprobar de forma barata si la composicion de secuencia y SMILES contiene senal predictiva suficiente para justificar modelos mas caros.
- Reproducibilidad y auditoria metodologica: el repositorio incluye scripts de entrenamiento, prediccion y contenedor, lo que facilita replicar el experimento y comparar contra el.
- Docencia y ejemplos de ML tabular aplicado a bioinformatica: sirve como caso practico de regresion ridge con caracteristicas derivadas de secuencias y SMILES.
- Integracion en pipelines CI/CD de evaluacion de modelos: el script `predict.py` genera un CSV con formato comprobado sobre las 1.901 entradas de validacion, util para tests de regresion del pipeline.
- Prototipado de herramientas de priorizacion de sustratos: combinando la prediccion de Km y kcat con reglas de negocio para ordenar candidatos en estudios de cribado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha medido ninguna puntuacion de holdout local y que no se ha realizado envio al leaderboard. La inferencia sobre las 1.901 entradas de validacion solo ha servido para verificar el formato de salida, no el rendimiento predictivo.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es una regresion ridge con pesos en JSON y no requiere GPU.
- GPU recomendadas: no aplica; la inferencia se ejecuta en CPU.
- Cabe en cualquier consumer GPU o CPU: si, sin requisitos graficos.
- Opciones de despliegue: scripts Python (`train.py`, `predict.py`), contenedor Docker (`linux/amd64`, build no verificado). No se contemplan vLLM, llama.cpp, Ollama ni TGI porque el artefacto no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; al ser una regresion lineal sobre caracteristicas tabulares, la latencia esperada es del orden de microsegundos a milisegundos por muestra en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krishanthh/baseline | Regresion ridge | no disponible (JSON) | no aplica | sin metricas publicadas | no disponible | Hugging Face |
| starkAhmed43/leak-curber-kcat-km-starter | Regresion ridge (origen) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Modelos GNN/transformers proteicos para kcat/Km | Redes neuronales | no disponible | no disponible | no disponible | no disponible | No verificado en la busqueda |

La comparativa con alternativas neuronales no puede cuantificarse con los datos disponibles; la unica comparacion directa documentada es con el repositorio de origen del que deriva esta linea base.

## Limitaciones y advertencias

- No se ha medido ninguna metrica de validacion ni de holdout; el rendimiento predictivo real es desconocido.
- El contenedor Docker no ha sido verificado en construccion ni en ejecucion offline.
- No se ha realizado envio al leaderboard ni carga oficial a Hugging Face mas alla del propio repositorio.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido.
- El modelo es puramente lineal sobre caracteristicas de composicion; no captura interacciones estructurales ni dependencias de secuencia, por lo que es probable que tenga un techo de rendimiento bajo frente a modelos especializados.
- Riesgo de sesgo derivado de la distribucion del dataset leak-curber-kcat-km: si el conjunto publico esta sesgado hacia ciertas familias enzimaticas o sustratos, las predicciones heredaran ese sesgo.
- No procesa lenguaje natural, por lo que no aplica el riesgo de alucinacion textual, pero si el de extrapolacion erronea fuera del dominio de entrenamiento.
- No hay informacion sobre hiperparametros, division train/validation ni preprocesado, lo que dificulta la reproducibilidad exacta.
- Uso en produccion desaconsejado hasta disponer de metricas de validacion y licencia claras.

## Enlaces

- Hugging Face: https://huggingface.co/Krishanthh/baseline
- Repositorio de origen: https://huggingface.co/starkAhmed43/leak-curber-kcat-km-starter
- Dataset: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
