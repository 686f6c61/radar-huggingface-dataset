# Queimo/chemperium-tc-2d

## Resumen

Chemperium critical temperature (2D) es un conjunto de diez redes neuronales de grafos (GNN) que predicen la temperatura crítica (en kelvin) de una molécula a partir de su representación SMILES. Los pesos corresponden al ensemble `liquid/tc/2d` publicado por Dobbelaere, Lengyel, Stevens y Van Geem en el marco del proyecto Chemperium, y esta versión concreta es un port a PyTorch de los checkpoints originales en Keras, distribuido por el usuario Queimo bajo licencia MIT.

El modelo resuelve un problema clásico de la ingeniería química: estimar propiedades termodinámicas críticas sin recurrir a mediciones experimentales, que son caras y lentas. La temperatura crítica es un dato de entrada imprescindible en ecuaciones de estado y en el diseño de procesos, por lo que un predictor preciso y rápido tiene valor directo en simulación y cribado de compuestos.

La relevancia de esta ficha es doble: por un lado, el modelo original está respaldado por el artículo de Dobbelaere et al. sobre aprendizaje geométrico profundo para propiedades moleculares; por otro, este port facilita su uso en entornos Python modernos basados en PyTorch, sin depender de TensorFlow ni de Keras. No es un modelo de lenguaje: es un regresor especializado de química computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) 2D, ensemble de 10 miembros independientes |
| Parametros totales | no disponible (no se detalla el recuento por miembro en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: grafo molecular derivado de SMILES; se rechazan moleculas con 75 o mas enlaces contando hidrogenos explicitos) |
| Tipos de cuantizacion | no disponible; pesos en float32 |
| Idiomas soportados | no aplica (modelo de quimica, no linguistico) |
| Licencia | MIT (pesos originales en Zenodo bajo CC BY 4.0) |
| Formato de pesos | safetensors (`model_0.safetensors` a `model_9.safetensors`), mas `config.json` y `scaler.json` |

## Arquitectura y entrenamiento

El modelo es un ensemble de diez redes neuronales de grafos que operan sobre una representación 2D de la molécula derivada del SMILES. Cada miembro del ensemble produce una predicción de temperatura crítica y la salida final es la media de los diez valores; la desviación típica del ensemble se reporta como medida de incertidumbre, aunque el autor advierte explícitamente de que no es un intervalo de confianza calibrado.

Los pesos son los publicados por Dobbelaere et al. en el repositorio Chemperium (commit `fad4f30a83de75c5eae3473a9b116064d2c8b18c`) y en Zenodo (DOI 10.5281/zenodo.11409710). El port a PyTorch no introduce cambios científicos: los diez checkpoints HDF5 de Keras se leyeron con `h5py` y cada peso se copió sin modificar en float32, respetando el layout de kernel `(in, out)` de Keras. El `MinMaxScaler` original, serializado con pickle, se reescribió como JSON plano en `scaler.json`, y `config.json` registra la arquitectura, la lista de miembros y el SHA-256 de cada fichero de origen. El script de conversión es `dev/convert_chemperium.py` del paquete screening-properties.

La validación de la conversión se hizo contra `reference/tensorflow_reference.json`, que contiene las predicciones de la implementación original en TensorFlow para 280 SMILES (pares `[Tc_K, ensemble_sd_K]` o `null` cuando la molécula queda fuera del rango del modelo). El port en PyTorch reproduce las 278 predicciones válidas con una discrepancia máxima de 1.2e-4 K (2.3e-7 en términos relativos), lo que confirma equivalencia numérica práctica con el original. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que proviene del corpus de Chemperium.

## Capacidades

- Predicción de temperatura crítica (K) de moléculas orgánicas a partir de SMILES.
- Estimación de incertidumbre mediante la desviación típica del ensemble de diez miembros.
- Manejo de representaciones moleculares 2D (grafo de átomos y enlaces derivado del SMILES).
- Integración programática a través del paquete screening-properties, que descarga el repositorio en una revisión fijada y verifica el SHA-256 de cada fichero.
- Rechazo controlado de moléculas fuera de rango: las que tienen 75 o más enlaces (contando hidrógenos explícitos) no se predicen.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Cribado de compuestos en diseño de procesos: dado un catálogo de SMILES candidatos, el modelo devuelve la temperatura crítica de cada uno en milisegundos, lo que permite filtrar moléculas antes de simulaciones más costosas.
- Alimentación de ecuaciones de estado: la temperatura crítica es un parámetro de entrada en modelos como Peng-Robinson o Soave-Redlich-Kwong; el ensemble proporciona el valor junto con una estimación de dispersión para propagar incertidumbre.
- Sustitución de estimaciones experimentales en etapas tempranas de I+D: cuando no hay dato medido, el modelo ofrece una predicción con trazabilidad de versión (SHA-256 de pesos y scaler) adecuada para documentación de proyecto.
- Integración en pipelines de química computacional: el paquete screening-properties permite invocar `get_properties` con una lista de `Component` y solicitar `critical_temperature` junto con otras propiedades del mismo framework.
- Validación cruzada de bases de datos: comparar la predicción del ensemble con valores tabulados para detectar entradas sospechosas o mal transcritas en bases de datos termodinámicas.
- Docencia e investigación en aprendizaje geométrico profundo: al ser un port PyTorch con referencia numérica en TensorFlow, sirve como caso de estudio reproducible de conversión de modelos y de ensembles en química.
- Análisis de sensibilidad estructural: al variar el SMILES (por ejemplo, cambiando un grupo funcional) se puede estudiar cómo responde la temperatura crítica predicha, útil en optimización de moléculas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento verificable es la equivalencia numérica del port: reproduce las 278 predicciones válidas de la implementación original en TensorFlow con un error máximo de 1.2e-4 K (2.3e-7 relativo). No se proporcionan métricas como MAE, RMSE o R² sobre conjuntos de test, ni comparaciones con otros predictores de temperatura crítica.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0.1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican; por el tamaño del ensemble, una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. La inferencia en CPU es viable.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del repositorio (0.1 GB) y que los pesos están en float32.
- Opciones de despliegue: el uso previsto es a través de screening-properties (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un regresor GNN.
- Latencia y throughput: no disponibles en la información proporcionada; la naturaleza del modelo (diez GNN pequeñas sobre grafos moleculares) sugiere latencias de milisegundos por molécula, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chemperium tc 2d (este) | Ensemble de 10 GNN 2D | Temperatura crítica (K) + sd del ensemble | MIT (pesos CC BY 4.0) | Hugging Face, Zenodo |
| Chemperium original (Keras) | Ensemble de 10 GNN 2D | Temperatura crítica (K) + sd del ensemble | MIT (código), CC BY 4.0 (pesos) | GitHub mrodobbe/chemperium, Zenodo |
| Otros predictores de Tc | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con la implementación original en Keras/TensorFlow del propio Chemperium, de la que este port es numéricamente equivalente. No se dispone de datos sobre alternativas como group contribution methods, otros GNN comerciales o modelos QSPR clásicos en la información proporcionada.

## Limitaciones y advertencias

- La incertidumbre reportada (desviación típica del ensemble) no es un intervalo de confianza calibrado; no debe interpretarse como tal en decisiones críticas.
- Las moléculas con 75 o más enlaces (contando hidrógenos explícitos) no se predicen; el modelo devuelve `null` en esos casos.
- El dominio de aplicabilidad está acotado por los datos de entrenamiento de Chemperium; no se detalla en la información disponible qué familias químicas quedan cubiertas.
- Riesgo de extrapolación: al ser un regresor entrenado sobre un corpus concreto, predicciones sobre estructuras muy alejadas del dominio de entrenamiento pueden ser poco fiables aunque el modelo devuelva un valor numérico.
- No es un modelo generativo ni de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso fuera de la predicción de propiedades moleculares es inadecuado.
- La licencia MIT del port no exime de respetar la atribución CC BY 4.0 de los pesos originales de Zenodo; conviene conservar la cita a Dobbelaere et al. en trabajos derivados.
- El modelo se distribuye sin garantías y con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción por terceros.
- El autor del port advierte de que no se ha modificado nada científico, pero la responsabilidad de validar el modelo en un dominio concreto recae en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/Queimo/chemperium-tc-2d
- Repositorio original Chemperium: https://github.com/mrodobbe/chemperium
- Pesos y datos originales (Zenodo): https://doi.org/10.5281/zenodo.11409710
- Artículo de referencia: Dobbelaere, M. R., Lengyel, I., Stevens, C. V., Van Geem, K. M. "Geometric Deep Learning for Molecular Property Predictions with Chemical Accuracy Across Chemical Space", 2024 (estado: Submitted; sin DOI disponible en la información proporcionada).
