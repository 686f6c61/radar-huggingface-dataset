# Aaqib099/gpt2-phishing-detection

## Resumen

`Aaqib099/gpt2-phishing-detection` es un modelo de clasificacion de texto obtenido mediante fine-tuning de GPT-2 (arquitectura decoder-only, 124,4 millones de parametros) para la deteccion binaria de correos de phishing. Lo desarrolla el usuario Aaqib099 como parte de un proyecto personal de comparacion entre arquitecturas encoder-only y decoder-only aplicadas a la deteccion de fraude por correo electronico. El modelo clasifica una entrada de texto en dos clases: correo seguro (0) y correo de phishing (1).

El problema que aborda es concreto: filtrar mensajes de correo fraudulentos en ingles. Para ello se entrena sobre el dataset publico `zefang-liu/phishing-email-dataset`, depurado hasta 17.537 muestras, y reporta en su conjunto de test una exactitud del 98,63 % y un F1 de 98,17 %. La relevancia practica del modelo es limitada por su caracter experimental: 30 descargas, ningun "like", dos epocas de entrenamiento y una ventana de 256 tokens.

Se trata, por tanto, de una pieza de referencia para evaluar como se comporta un decoder-only pequeno frente a alternativas encoder (BERT, RoBERTa) en una tarea de clasificacion corta, no de un sistema de seguridad listo para produccion. La licencia Apache 2.0 facilita su reutilizacion y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), cabeza de clasificacion binaria |
| Parametros totales | 124.441.344 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (maximo nativo de GPT-2); entrenado y truncado a 256 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors se puede convertir a int8/int4 con herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `gpt2` original (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, 124 millones de parametros) y sustituye la cabeza de modelado de lenguaje por una cabeza de clasificacion para dos clases. Es un transformer decoder-only con atencion causal, adaptado a una tarea discriminativa; el autor lo enmarca explicitamente en un estudio comparativo entre arquitecturas encoder-only y decoder-only para deteccion de phishing.

El entrenamiento se realizo con Hugging Face Transformers sobre una NVIDIA Tesla T4, durante 2 epocas, con tasa de aprendizaje 2e-5 y longitud maxima de secuencia de 256 tokens. El dataset de partida es `zefang-liu/phishing-email-dataset`, que tras limpieza quedo en 17.537 correos, divididos en 14.029 de entrenamiento, 1.754 de validacion y 1.754 de test. No se documenta el numero total de tokens vistos, la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF, DPO o aumento de datos. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Clasificacion binaria de texto: distingue entre correo seguro (clase 0) y correo de phishing (clase 1).
- Deteccion de senales tipicas de phishing en ingles: urgencia, solicitud de verificacion de cuenta, enlaces sospechosos, suplantacion de identidad.
- Integracion directa con el pipeline `text-classification` de Transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo "thinking", vision ni audio.
- Capacidad multilingue: limitada al ingles; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Filtrado previo en pasarelas de correo: clasificar mensajes entrantes antes de que lleguen al buzon del usuario, usando la salida del pipeline como primera senal de riesgo en un sistema de reglas mas amplio.
- Etiquetado de corpus para analisis de seguridad: procesar grandes volumenes de correos historicos en ingles para construir datasets etiquetados de phishing y correo legitimo.
- Modulo de formacion y concienciacion: mostrar a empleados ejemplos clasificados por el modelo y explicar por que un mensaje se considera sospechoso.
- Prototipado rapido de clasificadores: servir como linea base en experimentos academicos que comparen encoder-only frente a decoder-only en deteccion de fraude.
- Enriquecimiento de alertas SOC: incorporar la probabilidad de phishing como caracteristica adicional en un sistema de triaje de incidentes, siempre con revision humana.
- Deteccion de campanas de suplantacion en ingles: analizar plantillas de correo repetitivas y agruparlas por su puntuacion de phishing para identificar campanas activas.
- Evaluacion de robustez: emplear el modelo como sujeto de pruebas de adversarial examples (variaciones de texto que evaden la clasificacion).

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test (1.754 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 98,63 % |
| Precision | 98,02 % |
| Recall | 98,32 % |
| F1-score | 98,17 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (BERT, RoBERTa, etc.) ni cifras de MMLU, HumanEval o GSM8K, que ademas no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,5 GB de pesos (124 M de parametros x 4 bytes) mas overhead de activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,25 GB de pesos; en int8, unos 0,13 GB.
- GPU recomendadas: NVIDIA T4 (la usada en el entrenamiento), GTX 1660, RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeno para no necesitar hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU con latencia aceptable para volumenes moderados.
- Opciones de despliegue: pipeline de Transformers, Text Generation Inference (TGI) para clasificacion, vLLM (soporte de clasificacion limitado), ONNX Runtime y llama.cpp mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aaqib099/gpt2-phishing-detection | 124 M | 1.024 (entrenado a 256) | Clasificacion binaria de phishing | Apache 2.0 | Hugging Face |
| BERT-base fine-tuned para phishing (proyecto Hamzayousuf-4) | 110 M aprox. | 512 | Deteccion de phishing | no disponible | GitHub |
| GPT-2 base | 124 M | 1.024 | Modelado de lenguaje | MIT | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un unico dataset de correos en ingles; el rendimiento en dominios distintos (otros idiomas, otros formatos como SMS o mensajes web) no esta validado.
- La entrada se trunca a 256 tokens: los correos largos pierden informacion y la clasificacion puede degradarse.
- Solo dos epocas de entrenamiento y una unica GPU T4; no hay busqueda de hiperparametros documentada.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir falsos positivos y falsos negativos con alta confianza; el autor advierte explicitamente que las predicciones no deben tratarse como decisiones de seguridad garantizadas.
- Sesgos potenciales derivados del dataset de origen: sobrerrepresentacion de ciertos estilos de phishing y posible sesgo hacia plantillas concretas.
- No apto como unico mecanismo de defensa en produccion; debe combinarse con reglas, listas de reputacion y revision humana.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion.
- El modelo no incluye documentacion sobre evaluacion en datos reales de produccion ni sobre calibracion de probabilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aaqib099/gpt2-phishing-detection
- Dataset de entrenamiento: https://huggingface.co/datasets/zefang-liu/phishing-email-dataset
- Proyecto relacionado en GitHub (BERT para deteccion y GPT-2 para generacion de phishing): https://github.com/Hamzayousuf-4/AI_Phishing_Chatbot
