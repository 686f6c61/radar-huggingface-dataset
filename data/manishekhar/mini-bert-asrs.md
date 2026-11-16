# ManiShekhar/mini-bert-asrs

## Resumen

mini-bert-asrs es un clasificador de texto de tipo BERT en miniatura, con 11,2 millones de parámetros, desarrollado por ManiShekhar. Su tarea es asignar una de 18 categorías a la narrativa de un informe de seguridad aérea del sistema ASRS (Aviation Safety Reporting System). Resuelve un problema de triaje documental: en lugar de que un analista humano lea y etiquete manualmente cada informe, el modelo propone una categoría y una confianza, y deriva a revisión humana los casos dudosos.

El modelo se construye en tres etapas: destilación de conocimiento desde `bert-base-uncased` sobre texto de Wikipedia, adaptación de dominio mediante entrenamiento de lenguaje enmascarado sobre narrativas ASRS y, finalmente, ajuste supervisado de un clasificador con attention pooling. La arquitectura es un transformer encoder de 4 capas, tamaño oculto 256 y 4 cabezas de atención, con ventana de 512 tokens y una estrategia de truncamiento que conserva el principio y el final de los informes largos.

Es relevante ahora por su enfoque de calibración y enrutamiento a revisión humana: aplica corrección de prior por clase y escalado de temperatura, y marca para revisión los informes con confianza inferior a 0,863. Aun así, sus métricas son modestas (exactitud 0,638 y macro-F1 0,299 en el conjunto de test), y el propio autor lo describe como una ayuda de triaje, no como una autoridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT mini (4 capas, hidden size 256, 4 cabezas) con attention pooling para clasificación |
| Parametros totales | 11.175.442 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncamiento que conserva los primeros 384 tokens y los últimos tokens del informe) |
| Tipos de cuantizacion | No disponible (repo incluye safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de estilo BERT con 4 capas, dimensión oculta 256 y 4 cabezas de atención. La cabeza de clasificación no es la estándar de BERT: utiliza attention pooling, lo que obliga a cargar código personalizado (`configuration_bertmini.py` y `modeling_bertmini.py`) con `trust_remote_code=True`. El entrenamiento se organiza en tres fases. Primero, destilación desde un `bert-base-uncased` congelado sobre texto de Wikipedia, combinando pérdida de tokens enmascarados, etiquetas suaves del profesor y coincidencia de relaciones ocultas. Segundo, adaptación de dominio con entrenamiento de lenguaje enmascarado sobre narrativas ASRS, extendiendo las posiciones hasta 512. Tercero, ajuste supervisado del clasificador con attention pooling y ajuste completo del encoder.

Los datos de entrenamiento provienen del conjunto `sookiemonster/asrs-narratives-rebalance`. En inferencia, el método `classify` aplica corrección de prior por clase (fuerza 1,00) y escalado de temperatura, y activa la marca de revisión humana cuando la confianza cae por debajo de 0,863. La llamada directa a `model(input_ids, attention_mask)` devuelve puntuaciones crudas sin corregir.

## Capacidades

- Clasificación de narrativas de seguridad aérea en 18 categorías: aircraft, airport, airspacestructure, ambiguous, atcequipment/navfacility/buildings, chartorpublication, companypolicy, environment-nonweatherrelated, equipment/tooling, humanfactors, incorrect/notinstalled/unavailablepart, logbookentry, manuals, mel, procedure, softwareandautomation, staffing y weather.
- Salida con etiqueta, confianza y bandera `needs_review` para enrutamiento a revisión humana.
- Manejo de informes largos mediante truncamiento selectivo (primeros 384 tokens y cola del documento) dentro de una ventana de 512.
- Calibración de probabilidades mediante corrección de prior por clase y escalado de temperatura.
- Aviso débil de fuera de dominio, validado únicamente contra texto de Wikipedia.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Triaje de informes ASRS: el modelo asigna una categoría preliminar a cada narrativa y marca para revisión humana las que quedan por debajo del umbral de confianza de 0,863, lo que permite priorizar el trabajo de los analistas.
- Enrutamiento automático a equipos especializados: las categorías predichas (por ejemplo, weather, humanfactors o procedure) pueden dirigir cada informe al grupo de seguridad correspondiente.
- Filtrado de duplicados y agrupación temática: la etiqueta predicha sirve para agrupar informes por área de riesgo antes de un análisis agregado.
- Preetiquetado para anotación humana: el modelo genera una primera etiqueta que el anotador corrige, reduciendo el coste de etiquetar grandes volúmenes de narrativas.
- Análisis de tendencias: al clasificar lotes históricos de informes se pueden calcular distribuciones de categorías por periodo y detectar cambios en los tipos de incidente reportados.
- Despliegue ligero en entornos con pocos recursos: con 11,2 millones de parámetros y pesos en safetensors/ONNX, cabe en CPU y en GPUs de gama baja para procesamiento por lotes.
- Señal de alerta temprana: la bandera de fuera de dominio permite detectar informes que no encajan en el corpus ASRS y separarlos para revisión manual.

## Benchmarks y rendimiento

Resultados en el split de test reservado (9.868 informes):

| Metrica | Valor |
|---|---:|
| Exactitud (accuracy) | 0,638 |
| Macro-F1 | 0,299 |
| Error de calibración esperado (ECE) | 0,014 |
| Aceptación automática en el umbral de revisión | 20,9 % de los informes, 92,3 % correctos entre ellos |

La corrección de prior por clase (fuerza 1,00) elevó la exactitud de 0,591 a 0,638 y el macro-F1 de 0,288 a 0,299. El autor indica que un baseline simple de TF-IDF con regresión logística alcanzó una exactitud bruta similar o superior.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 11,2 millones de parámetros; el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU para procesamiento por lotes.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1-2 GB de memoria libre (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers con `trust_remote_code=True`, ONNX Runtime (hay pesos ONNX en el repo). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| mini-bert-asrs | 11,2 M | 512 | Clasificación ASRS (18 clases) | No disponible | Hugging Face |
| bert-base-uncased | 110 M | 512 | Modelo base general, ajustable | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística (baseline del autor) | No aplica | No aplica | Clasificación ASRS | No disponible | No disponible |
| BERT-mini (referencia de arquitectura) | ~11 M | 512 | Modelo base general, ajustable | Apache 2.0 | Hugging Face |

El modelo ofrece un tamaño muy reducido frente a `bert-base-uncased` (unas diez veces menos parámetros), a costa de una exactitud modesta. El baseline TF-IDF del propio autor iguala o supera su exactitud bruta, lo que sitúa al modelo como una alternativa ligera pero no claramente superior en calidad.

## Limitaciones y advertencias

- Exactitud modesta (0,638) y macro-F1 bajo (0,299): las categorías con pocos ejemplos rara vez se predicen correctamente y algunas se solapan semánticamente.
- Un baseline de TF-IDF con regresión logística alcanzó exactitud similar o superior en la comparación del propio autor; debe tratarse como ayuda de triaje, no como autoridad.
- La bandera de fuera de dominio es una advertencia débil, validada solo contra texto de Wikipedia.
- Solo soporta inglés y está entrenado sobre el dominio específico de ASRS; su generalización a otros dominios no está documentada.
- La licencia no está disponible, y los datos de entrenamiento (`sookiemonster/asrs-narratives-rebalance`) tienen su propia licencia que debe verificarse antes de usar o redistribuir el modelo.
- No apto para decisiones operativas o de seguridad crítica.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; el autor recomienda leer `configuration_bertmini.py` y `modeling_bertmini.py` antes de usarlo.
- No se documentan sesgos específicos más allá de los derivados del corpus ASRS y del desequilibrio de clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ManiShekhar/mini-bert-asrs
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/sookiemonster/asrs-narratives-rebalance
- Modelo profesor: https://huggingface.co/bert-base-uncased
