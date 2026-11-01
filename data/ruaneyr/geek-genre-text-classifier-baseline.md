# Ruaneyr/geek-genre-text-classifier-baseline

## Resumen

El Geek Genre Text Classifier (Baseline) es un modelo de clasificación de texto muy ligero desarrollado por el usuario Ruaneyr como parte de un proyecto educativo y de portafolio personal. Su funcion es asignar descripciones cortas de ficcion de tematica geek a una de cuatro categorias: `cyberpunk`, `high_fantasy`, `space_opera` o `superhero`. No se trata de un modelo neuronal ni de un LLM, sino de un pipeline clasico de procesamiento de lenguaje natural construido con scikit-learn.

Tecnicamente, el modelo combina un vectorizador TF-IDF con una regresion logistica, serializado como artefacto `joblib`. Esta disenado para textos en ingles y se distribuye bajo licencia MIT. Su interes no reside en el rendimiento, sino en su valor didactico: demuestra el flujo completo de un proyecto de clasificacion de texto (vectorizacion, entrenamiento, evaluacion con holdout estratificado y publicacion de metricas) con un coste computacional minimo.

Es relevante unicamente como referencia educativa o como punto de partida (baseline) para experimentos de clasificacion de generos narrativos. No esta pensado para uso en produccion ni para datos reales de ficcion, fandom o trafico de usuarios, tal como advierte el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresion logistica (pipeline scikit-learn) |
| Parametros totales | no disponible (modelo no neuronal; el numero de coeficientes depende del vocabulario TF-IDF, no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF no tiene ventana de contexto; depende del preprocesado y del vocabulario) |
| Tipos de cuantizacion | no aplica (no es un modelo neuronal; el artefacto es un `joblib` binario) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | joblib (`.joblib`) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de transformer ni de red neuronal profunda. Se trata de un pipeline clasico de dos etapas: primero un vectorizador TF-IDF que transforma el texto en un vector disperso de caracteristicas lexicas, y despues una regresion logistica que aprende fronteras lineales entre las cuatro clases de genero. El artefacto resultante se serializa con `joblib`, lo que permite cargarlo y ejecutar `predict` sobre nuevas cadenas de texto.

El entrenamiento se realizo sobre un conjunto de datos semilla pequeno y original, escrito especificamente para el proyecto educativo que acompana al modelo en GitHub. Segun la model card, se usaron 48 ejemplos de entrenamiento y 16 ejemplos de evaluacion mediante un split holdout estratificado. No se menciona el uso de RLHF, DPO ni tecnicas de ajuste fino; tampoco se detalla la composicion exacta del dataset ni el numero de tokens. La innovacion tecnica es nula por diseno: el objetivo es establecer una linea base reproducible y sencilla.

## Capacidades

- Clasificacion de texto corto en ingles en cuatro categorias fijas: `cyberpunk`, `high_fantasy`, `space_opera` y `superhero`.
- Inferencia mediante `joblib.load` y `model.predict` sobre listas de cadenas.
- Generacion de etiquetas discretas; no produce texto, probabilidades calibradas ni explicaciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se han documentado otros idiomas.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- No realiza extraccion de entidades, resumen ni traduccion.

## Casos de uso

- Docencia de pipelines de NLP: sirve para ilustrar en clase o en un tutorial como se encadena un vectorizador TF-IDF con un clasificador lineal, se serializa con `joblib` y se evalua con un holdout estratificado. Es adecuado por su simplicidad y su bajo coste de ejecucion.
- Baseline en experimentos de clasificacion de generos: un investigador puede usarlo como referencia minima antes de probar modelos neuronales o LLMs, comparando accuracy sobre el mismo conjunto semilla de 16 ejemplos.
- Prototipado rapido de etiquetado tematico: en un entorno de pruebas interno, se puede usar para etiquetar descripciones ficticias de tematica geek y validar el formato de salida antes de invertir en un modelo mayor.
- Ejemplo de publicacion de artefactos en Hugging Face: el repositorio demuestra como subir un modelo scikit-learn con su model card, licencia y metricas, util para quien aprende el flujo de publicacion.
- Pruebas de integracion de pipelines de scikit-learn: permite verificar que un servicio de inferencia carga correctamente artefactos `joblib` y devuelve etiquetas, sin necesidad de GPU.
- Demostracion de limitaciones de modelos pequenos: sirve para mostrar por que un accuracy del 31,25 % sobre 16 ejemplos no es suficiente para produccion y como documentar esas limitaciones en una model card.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 31,25 % | 16 ejemplos de holdout estratificado |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento es el accuracy del 31,25 % sobre 16 ejemplos, obtenido tras entrenar con 48 ejemplos, segun `metrics.json` citado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el consumo de memoria es el de un artefacto `joblib` pequeno y un vocabulario TF-IDF disperso.
- Opciones de despliegue: Python con scikit-learn y joblib; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo neuronal en formato safetensors o GGUF.
- Latencia y throughput estimados: no disponibles; al ser un pipeline lineal sobre texto corto, la latencia por peticion es del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Geek Genre Text Classifier (Baseline) | TF-IDF + regresion logistica | no disponible | no aplica | MIT | Hugging Face |
| Clasificadores TF-IDF + regresion logistica de scikit-learn (genericos) | Pipeline clasico | no disponible | no aplica | BSD-3-Clause (scikit-learn) | PyPI |
| Modelos de clasificacion de texto basados en transformers (p. ej., DistilBERT fine-tuned) | Transformer encoder | decenas de millones | 512 tokens tipicamente | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada. La comparativa se limita a categoria, licencia y disponibilidad; no se han publicado metricas cruzadas.

## Limitaciones y advertencias

- Rendimiento muy bajo: 31,25 % de accuracy sobre 16 ejemplos, apenas por encima del azar en un problema de cuatro clases (25 %).
- Entrenado con solo 48 ejemplos sinteticos y originales; no generaliza a ficcion real, discurso de fandom ni trafico de produccion.
- Sesgos conocidos: no documentados, pero el dataset semilla es minimo y escrito por el autor, por lo que refleja sus propias definiciones de cada genero.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si puede asignar etiquetas incorrectas con alta confianza aparente por la naturaleza lineal del modelo.
- Limitacion de idioma: solo ingles; no se ha evaluado en castellano ni en otros idiomas.
- Limitacion de contexto: TF-IDF no modela orden ni dependencias a largo plazo; textos largos o con vocabulario fuera del vocabulario de entrenamiento degradan la prediccion.
- Restricciones de licencia: MIT permite uso comercial, pero el autor advierte explicitamente que las metricas solo miden el dataset semilla y no el rendimiento real.
- Caveat para produccion: no debe desplegarse en produccion sin un reentrenamiento con datos reales, validacion cruzada y una evaluacion con conjuntos representativos.

## Enlaces

- Hugging Face: https://huggingface.co/Ruaneyr/geek-genre-text-classifier-baseline
- Repositorio GitHub del proyecto complementario: no disponible en la informacion proporcionada (la model card lo menciona pero no incluye la URL)
- Paper: no disponible
- Blog o demo: no disponible
