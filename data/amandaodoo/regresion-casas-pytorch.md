# amandaodoo/regresion-casas-pytorch

## Resumen

`amandaodoo/regresion-casas-pytorch` es un modelo de regresión tabular publicado en Hugging Face por la usuaria amandaodoo como ejemplo pedagógico del Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una regresión lineal implementada con el ciclo explícito de entrenamiento de PyTorch, con una única capa `torch.nn.Linear(3, 1)`, es decir, cuatro parámetros en total (tres pesos y un bias).

El modelo predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables de entrada: superficie en metros cuadrados, presencia de balcón y presencia de ascensor. Se entrenó sobre un dataset sintético de 200 registros (160 de entrenamiento y 40 de evaluación) generado en el propio script `train.py`, con la misma semilla que un ejemplo previo de scikit-learn, y alcanza un MAE de 3,08 miles de US$ y un R² de 0,989 sobre el conjunto de evaluación.

Su relevancia es exclusivamente didáctica: ilustra cómo entrenar un modelo con PyTorch, cómo serializar los pesos en formato safetensors (sin ejecución de código al cargar) y cómo publicar un artefacto reproducible en Hugging Face. No debe confundirse con un modelo de propósito general ni utilizarse fuera del contexto educativo para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal, una capa `torch.nn.Linear(3, 1)` |
| Parametros totales | 4 (3 pesos + 1 bias) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | es (documentación y model card en castellano; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `state_dict`), más `config.json` con normalización |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal pura: una capa `torch.nn.Linear` con tres entradas (`m2`, `balcon`, `ascensor`) y una salida (`precio` en miles de US$). La clase del modelo está definida en `modelo.py` y no se serializa dentro del archivo de pesos, por lo que es imprescindible disponer de esa misma clase para reconstruir el modelo antes de llamar a `load_state_dict`. Las entradas se normalizan restando la media y dividiendo por el desvío calculados sobre el conjunto de entrenamiento; esos valores se almacenan en `config.json`.

El entrenamiento es supervisado, con función de pérdida `MSELoss`, optimizador SGD con tasa de aprendizaje 0,1 y 500 épocas (la pérdida se estabiliza antes de la época 100). El dataset es sintético, de 200 registros, con `m2` en el rango 35-120, `balcon` y `ascensor` binarios. Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas; dividiendo por el desvío de cada variable se recuperan los coeficientes en escala original (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`, coincidente con el resultado de scikit-learn). No hay RLHF, DPO ni ninguna innovación técnica más allá del uso de safetensors como formato de serialización seguro.

## Capacidades

- Predicción de una variable numérica continua (precio de vivienda) a partir de tres features tabulares.
- Regresión sobre datos tabulares normalizados con media y desvío fijados en `config.json`.
- Carga de pesos en formato safetensors sin ejecución de código arbitrario al deserializar.
- Reproducibilidad completa del entrenamiento mediante `train.py` y la semilla documentada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de procesamiento de texto: los tags de idioma (`es`) se refieren a la documentación.
- No dispone de modo thinking, visión, audio ni ninguna modalidad distinta de la tabular.

## Casos de uso

- Docencia de PyTorch: sirve como ejemplo mínimo y completo del ciclo de entrenamiento (forward, loss, backward, step) para introducir regresión lineal en un curso, gracias a sus cuatro parámetros y a la separación clara entre `modelo.py`, `train.py` y `predict.py`.
- Demostración de safetensors frente a pickle/joblib: permite ilustrar en clase por qué un formato que solo contiene números evita la ejecución de código al cargar pesos, comparando ambos flujos con el mismo modelo.
- Ejercicio de reproducibilidad: el alumnado puede reentrenar desde cero con `train.py`, la misma semilla y el mismo dataset sintético, y verificar que obtiene los mismos pesos y métricas.
- Práctica de normalización de features: el modelo obliga a aplicar media y desvío de `config.json` antes de predecir; si se omite, las predicciones son incorrectas, lo que lo convierte en un caso práctico para enseñar por qué la normalización forma parte del artefacto.
- Comparación PyTorch vs. scikit-learn: el mismo problema y dataset permiten contrastar los coeficientes aprendidos por ambos frameworks (1,503 para `m2` tras desnormalizar) y discutir diferencias de escala y de API.
- Ejemplo de publicación de artefactos en Hugging Face: ilustra la estructura mínima de un repositorio de modelo (pesos, config, código de clase, scripts de entrenamiento e inferencia, requirements) para quien publique su primer modelo.
- Integración en un pipeline de inferencia tabular sencillo: con `predict.py` como referencia, puede incorporarse a un script de scoring de viviendas sintéticas en un entorno de pruebas, siempre con datos dentro del rango 35-120 m².

## Benchmarks y rendimiento

La model card reporta la evaluación sobre 40 registros no vistos durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R² | 0,989 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el `state_dict` contiene cuatro valores float32 (16 bytes) y el repositorio ocupa 0,0 GB.
- GPU recomendadas: ninguna; el modelo funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, Raspberry Pi, contenedores mínimos).
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no requiere vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (una multiplicación matricial de 3x1), la latencia es del orden de microsegundos y el throughput está limitado por el preprocesado y el I/O, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `amandaodoo/regresion-casas-pytorch` | 4 | no aplica | Regresión tabular (precio de vivienda) | MIT | Hugging Face, 24 descargas |
| Ejemplo de regresión lineal de scikit-learn (referencia citada en la model card, Clase 10) | 4 coeficientes | no aplica | Misma tarea y mismo dataset sintético | no disponible | No publicado como modelo en Hugging Face |
| Regresores tabulares genéricos (p. ej. XGBoost, LightGBM) | variable, típicamente miles de nodos de árbol | no aplica | Regresión tabular general | según implementación | Ampliamente disponibles |

No se dispone de datos de benchmarks comparativos publicados entre este modelo y alternativas; la única comparación documentada es la equivalencia de coeficientes con el ejemplo de scikit-learn tras desnormalizar.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Solo es válido para viviendas de 35 a 120 m²; fuera de ese rango la extrapolación lineal no está justificada.
- Si se omite la normalización con media y desvío de `config.json`, las predicciones son arbitrarias; los pesos solos no bastan.
- Requiere la misma clase `RegresionLineal` de `modelo.py` para cargar el `state_dict`; si la clase cambia, `load_state_dict` falla.
- Sesgos conocidos: no documentados explícitamente, pero al tratarse de datos sintéticos generados con una semilla concreta, el modelo refleja únicamente la distribución artificial del generador.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de predicciones sin sentido si se usa con entradas fuera de distribución.
- Licencia MIT: permite uso comercial y modificación con atribución, aunque el uso comercial carece de sentido práctico dado el carácter sintético de los datos.
- En producción no debe emplearse como estimador de precios reales sin reentrenamiento con datos reales y validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/amandaodoo/regresion-casas-pytorch
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
