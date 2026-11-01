# florpav/02-pytorch-regresion-seminario2026

## Resumen

El modelo `florpav/02-pytorch-regresion-seminario2026` es un ejemplo pedagógico de regresión lineal implementado con PyTorch, desarrollado por el usuario florpav para el Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). Su propósito no es la producción sino demostrar el ciclo completo de entrenamiento explícito en PyTorch y la publicación de pesos en formato safetensors. Predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor.

Técnicamente es un modelo trivial: una única capa `torch.nn.Linear(3, 1)`, es decir, tres pesos y un sesgo, lo que suma cuatro parámetros totales según los safetensors publicados. No es un transformer ni un modelo de lenguaje; es un regresor tabular que resuelve el mismo problema que el ejemplo clásico de scikit-learn, pero con el bucle de entrenamiento manual de PyTorch y con la ventaja de seguridad que aporta safetensors frente a pickle.

Su relevancia es exclusivamente didáctica: sirve como plantilla reproducible para quienes aprenden a empaquetar un modelo mínimo con su `config.json` de normalización, su clase de arquitectura en `modelo.py` y sus scripts de entrenamiento e inferencia. No debe confundirse con un modelo de IA generativa ni usarse fuera del ámbito educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (una capa `torch.nn.Linear(3, 1)`) |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32 según safetensors) |
| Idiomas soportados | es (documentación y model card en español) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `state_dict`) |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal pura: una capa `torch.nn.Linear(3, 1)` definida en `modelo.py`, con tres entradas (`m2`, `balcon`, `ascensor`) y una salida (`precio` en miles de US$). Los pesos aprendidos son `lineal.weight = [35,157 · 4,351 · 5,992]` y `lineal.bias = 147,769`, expresados en la escala de las entradas normalizadas. Dividiendo cada peso por el desvío de su variable se recupera la escala original (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`, coincidente con scikit-learn).

El entrenamiento es supervisado, con 200 registros sintéticos (160 de entrenamiento y 40 de evaluación), función de pérdida `MSELoss`, optimizador SGD con tasa de aprendizaje 0,1 y 500 épocas, estabilizándose la pérdida antes de la época 100. Las entradas se normalizan restando la media y dividiendo por el desvío calculados sobre el conjunto de entrenamiento; esos valores se almacenan en `config.json` y son imprescindibles para la inferencia. No hay RLHF, DPO ni innovaciones técnicas destacables más allá del uso de safetensors como formato de serialización seguro.

## Capacidades

- Predicción de una variable numérica continua (regresión tabular) a partir de tres características.
- Inferencia determinista con normalización previa obligatoria de las entradas.
- Carga de pesos mediante `safetensors.torch.load_file` sin ejecución de código al deserializar.
- Reproducibilidad completa del pipeline de entrenamiento mediante `train.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión, audio o modo thinking.
- No es un modelo de lenguaje: no procesa ni genera tokens.

## Casos de uso

- Docencia de PyTorch: sirve como ejemplo mínimo y reproducible para enseñar el bucle explícito de entrenamiento (`forward`, `loss`, `backward`, `step`) y la publicación de pesos en safetensors.
- Comparación con scikit-learn: permite ilustrar cómo un mismo problema de regresión se resuelve con dos ecosistemas distintos y cómo los pesos coinciden tras desnormalizar.
- Plantilla de empaquetado de modelos: muestra la estructura mínima recomendada (`model.safetensors`, `config.json`, `modelo.py`, `train.py`, `predict.py`, `requirements.txt`) para publicar un modelo en HuggingFace.
- Demostración de serialización segura: ejemplifica por qué safetensors es preferible a pickle o joblib al no ejecutar código arbitrario al cargar los pesos.
- Ejercicio de normalización: permite practicar por qué olvidar la normalización invalida las predicciones y cómo guardar media y desvío en `config.json`.
- Prueba de integración de PyTorch en entornos educativos: útil para validar instalaciones de PyTorch, safetensors y numpy en aulas o laboratorios.
- Referencia para regresión tabular simple: como línea base trivial en proyectos docentes de predicción de precios con variables categóricas binarias.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 40 muestras de evaluación no vistas durante el entrenamiento:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de US$ |
| R² | 0,989 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: insignificante (menos de 1 MB; los cuatro parámetros en float32 ocupan 16 bytes).
- GPU recomendadas: ninguna; funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (Raspberry Pi, contenedores mínimos).
- Opciones de despliegue: ejecución directa con PyTorch (`torch.no_grad()`), sin necesidad de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo (una multiplicación matricial de 3x1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florpav/02-pytorch-regresion-seminario2026 | 4 | no aplica | MAE 3,08; R² 0,989 (datos sintéticos) | MIT | HuggingFace |
| Regresión lineal de scikit-learn (ejemplo de la Clase 10) | 4 (equivalentes tras desnormalizar) | no aplica | Equivalente por construcción | BSD-3-Clause (scikit-learn) | No publicado como modelo |
| Otros ejemplos pedagógicos de regresión en PyTorch | no disponible | no aplica | no disponible | variable | variable |

No se dispone de información sobre otros modelos comparables publicados en HuggingFace con la misma finalidad didáctica y el mismo conjunto de datos sintético.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce casas de 35 a 120 m²; fuera de ese rango las predicciones no son fiables.
- Dependencia crítica de la normalización: si se omiten la media y el desvío de `config.json`, las predicciones son incorrectas.
- Dependencia de la arquitectura: para cargar los pesos es imprescindible la misma clase `RegresionLineal` de `modelo.py`; cualquier cambio en la clase provoca un fallo en `load_state_dict`.
- Sin capacidades generativas ni de lenguaje: no debe emplearse para tareas de NLP, razonamiento o agentes.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de extrapolación incorrecta fuera del rango de entrenamiento.
- Sesgos: al ser datos sintéticos con una semilla fija, no reflejan distribuciones reales del mercado inmobiliario.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso comercial del modelo en sí carece de sentido práctico por su naturaleza didáctica.
- No apto para producción: no hay validación externa, ni tests, ni mantenimiento previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florpav/02-pytorch-regresion-seminario2026
- Documentación de safetensors: https://github.com/huggingface/safetensors
- Documentación de PyTorch: https://pytorch.org/docs/stable/index.html
- Repositorio de scikit-learn (ejemplo equivalente): https://scikit-learn.org/stable/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
