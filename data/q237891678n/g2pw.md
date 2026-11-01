# q237891678n/g2pW

## Resumen

g2pW es un conversor de grafemas a fonemas (grapheme-to-phoneme, G2P) para mandarin, desarrollado por Yi-Chang Chen, Yu-Chuan Steven, Yen-Cheng Chang e Yi-Ren Yeh, y publicado en INTERSPEECH 2022. Resuelve un problema especifico del chino mandarin: la desambiguacion de polifonos, es decir, determinar la pronunciacion correcta de caracteres que tienen varias lecturas posibles segun el contexto (por ejemplo, caracteres como 行, 重 o 长). El modelo recibe una secuencia de caracteres y devuelve la transcripcion fonetica en notacion zhuyin (bopomofo) con tonos.

La arquitectura es un BERT con una cabeza de clasificacion de softmax condicional ponderado (conditional weighted softmax), disenada para elegir entre las lecturas candidatas de cada caracter en funcion del contexto de la frase. El repositorio de HuggingFace aloja unicamente los checkpoints (PyTorch y ONNX) del modelo original, no el codigo de entrenamiento ni un pipeline de HuggingFace. El tamano total del repositorio es de 1,2 GB.

Es relevante para sistemas de sintesis de voz (TTS) en mandarin, reconocimiento automatico de voz (ASR) y herramientas de aprendizaje de pronunciacion, donde la precision en la desambiguacion de polifonos afecta directamente a la naturalidad y correccion del audio generado. La licencia Apache 2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT con cabeza de softmax condicional ponderado (conditional weighted softmax) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye checkpoint PyTorch y modelo ONNX) |
| Idiomas soportados | chino mandarin (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best_accuracy.pth`) y ONNX |

## Arquitectura y entrenamiento

g2pW emplea un codificador BERT sobre la secuencia de caracteres de entrada y una cabeza de clasificacion especifica para la tarea: un softmax condicional ponderado que restringe las clases de salida a las lecturas candidatas validas de cada caracter polifonico. De este modo, el modelo no predice sobre todo el inventario fonetico, sino solo sobre el subconjunto de pronunciaciones posibles del caracter en esa posicion, lo que reduce el espacio de decision y mejora la precision en la desambiguacion.

El modelo se publico en INTERSPEECH 2022 (paper arXiv:2203.10430). No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificacion especulativa. El repositorio incluye el checkpoint `best_accuracy.pth` con su configuracion y el log de entrenamiento dentro del archivo `G2PWModel-v2.zip`, y una version ONNX (`G2PWModel-v2-onnx.zip`) consumida por el paquete Python `g2pw`.

## Capacidades

- Conversion de grafemas a fonemas en mandarin con notacion zhuyin (bopomofo) y marcas de tono.
- Desambiguacion de polifonos basada en contexto, que es la funcion central del modelo.
- Procesamiento por secuencia de frase completa, no caracter a caracter.
- Salida alineada por caracter: devuelve `None` para caracteres sin lectura fonetica asignada (por ejemplo, caracteres no chinos o simbolos).
- Distribucion en dos formatos: PyTorch para entrenamiento o ajuste fino e ONNX para inferencia ligera.
- Integracion directa mediante el paquete `g2pw` de Python.
- No soporta tool calling, agentes, vision, audio ni generacion de texto libre; es un modelo especializado de una sola tarea.

## Casos de uso

- Sintesis de voz en mandarin (TTS): el modelo proporciona la transcripcion fonetica con la lectura correcta de cada polifono, paso previo necesario para generar audio natural en sistemas TTS basados en fonemas.
- Reconocimiento automatico de voz (ASR): se usa como componente de rescoring o de lexicon fonetico para verificar y corregir la pronunciacion asignada a las transcripciones.
- Herramientas de aprendizaje de chino: genera la pronunciacion correcta de frases completas para estudiantes, resolviendo casos como 上校 (shang4 xiao4) frente a lecturas alternativas.
- Normalizacion de texto para pipelines de voz: convierte texto escrito en una representacion fonetica consistente antes de la sintesis o del alineamiento forzado.
- Lexicografia y diccionarios digitales: permite anotar automaticamente la lectura de polifonos en entradas y corpus, con salida alineada por caracter.
- Investigacion en fonetica computacional: sirve como baseline reproducible para experimentos de desambiguacion de polifonos en mandarin, con checkpoint publico y resultados publicados en INTERSPEECH 2022.
- Despliegue en produccion con ONNX: el paquete `g2pw` descarga el modelo ONNX y permite inferencia sin dependencia de PyTorch, adecuada para servicios con requisitos de latencia moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el modelo se basa en BERT y el repositorio completo ocupa 1,2 GB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no especificadas por el autor; al ser un modelo BERT de tarea unica, cualquier GPU consumer moderna es suficiente en la practica.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con unos pocos GB de memoria, aunque no se dispone de cifras oficiales.
- Opciones de despliegue: paquete Python `g2pw` (con modelo ONNX), ONNX Runtime, PyTorch para el checkpoint `.pth`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g2pW | G2P mandarin con desambiguacion de polifonos | no disponible | no disponible | Apache 2.0 | HuggingFace (checkpoints) y GitHub |
| Modelos G2P genericos basados en reglas o diccionarios | G2P mandarin | no aplica | no aplica | variable | multiples |
| Otros modelos BERT para polifonos en mandarin | Desambiguacion de polifonos | no disponible | no disponible | variable | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo cubre chino mandarin; no soporta otros idiomas ni transliteraciones a pinyin (la salida del ejemplo es zhuyin).
- Es un modelo de tarea unica: no genera texto, no razona y no soporta instrucciones ni conversacion.
- Riesgo de error en polifonos poco frecuentes o en contextos ambiguos; la desambiguacion depende del contexto de la frase y puede fallar en textos muy cortos o ruidosos.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus no disponible publicamente puede heredar sesgos de ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribucion y la cita del paper.
- El repositorio de HuggingFace solo contiene los checkpoints; el codigo, la tokenizacion y el preprocesado deben obtenerse del repositorio GitHub del proyecto.
- No se dispone de informacion sobre el numero de parametros, la longitud maxima de entrada ni el rendimiento en benchmarks, lo que dificulta estimar su calidad frente a alternativas.
- El ejemplo de la model card referencia la descarga desde `YC-Chen/g2pW`, mientras que el repositorio indicado es `q237891678n/g2pW`; conviene verificar la ruta de descarga antes de integrarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/q237891678n/g2pW
- Repositorio GitHub oficial: https://github.com/GitYCC/g2pW
- Paper (arXiv): https://arxiv.org/abs/2203.10430
- DOI del paper: https://doi.org/10.21437/Interspeech.2022-216
- Paquete Python: `pip install g2pw`
