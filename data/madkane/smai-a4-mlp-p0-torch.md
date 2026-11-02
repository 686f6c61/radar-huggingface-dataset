# MadKane/smai-a4-mlp-p0-torch

## Resumen

`MadKane/smai-a4-mlp-p0-torch` es un perceptron multicapa (MLP) de tres capas entrenado desde cero sobre CIFAR-10 como parte de la asignatura Statistical Methods in AI (IIIT Hyderabad, Monsoon 2026, Assignment 4, cuestiones 1.4 y 1.5). No es un modelo de lenguaje ni un sistema generativo: es un clasificador de imagenes de 32x32 píxeles en 10 clases, con una arquitectura deliberadamente simple (3072 → 256 → 10) y 789.258 parametros entrenables.

Su relevancia no reside en el rendimiento absoluto, sino en su valor como referencia pedagogica: forma parte de un par de modelos (un MLP convencional y una IOC-NN) con forma y ajustes de entrenamiento identicos, disenados para comparar el efecto de distintas estrategias de entrenamiento sobre los mismos datos. El modelo se entrena con etiquetas verdaderas (p = 0), es decir, sin ruido en las etiquetas, lo que lo convierte en la linea base limpia de dicha comparacion.

El repositorio es de tamano practicamente nulo (0.0 GB reportados) y contiene unicamente el `state_dict` de PyTorch, las estadisticas de preprocesado y los historiales de entrenamiento. No hay pesos en formato GGUF ni safetensors, no hay model card con benchmarks extensos y no se declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa): Linear(3072, 256) + ReLU + Linear(256, 10) |
| Parametros totales | 789.258 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`mlp-p0.pt`), mas `preprocessing.npz`, `config.json` y `history.json` |

## Arquitectura y entrenamiento

La arquitectura es un MLP completamente conectado con una unica capa oculta de 256 unidades y activacion ReLU, seguida de una capa de salida de 10 logits (una por clase de CIFAR-10). La entrada son las imagenes aplanadas a un vector de 3072 dimensiones (32 x 32 x 3), normalizadas por pixel usando la media y la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 (guardadas en `preprocessing.npz`). El numero de parametros se desglosa en 3072 x 256 + 256 = 786.688 pesos y sesgos de la primera capa, mas 256 x 10 + 10 = 2.570 de la capa de salida.

El entrenamiento usa descenso de gradiente estocastico sin momento, tasa de aprendizaje 0.01, tamano de lote 64, 100 epocas, perdida de entropia cruzada y precision float32, con semilla 2061. Los datos son la particion de entrenamiento estandar de CIFAR-10 (50.000 imagenes) con etiquetas verdaderas (p = 0, sin ruido de etiquetas). No se emplea RLHF, DPO ni ninguna tecnica de alineacion, por tratarse de un clasificador supervisado. No se documentan aumentos de datos ni regularizacion adicional.

## Capacidades

- Clasificacion de imagenes de 32x32 píxeles en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia determinista en CPU o GPU con PyTorch, con un coste computacional minimo (menos de 0,8 M de parametros).
- Preprocesado reproducible mediante las estadisticas por pixel incluidas en el repositorio.
- Trazabilidad del entrenamiento: `history.json` incluye perdida y exactitud por epoca en train y test.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general (solo clasificacion de 32x32), audio ni capacidades multilingues.
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Docencia y practicas de aprendizaje profundo: sirve como linea base reproducible para comparar contra una IOC-NN con identica forma y ajustes, tal como se plantea en la cuestion 1.5 del assignment.
- Estudio del sobreajuste en MLPs: la brecha entre exactitud de entrenamiento (0.9963) y de test (0.5050) en la epoca 100 es un ejemplo claro y medible para analizar curvas de aprendizaje usando `history.json`.
- Verificacion de pipelines de preprocesado: el archivo `preprocessing.npz` permite comprobar que la normalizacion por pixel se aplica correctamente antes de la inferencia.
- Pruebas de integracion de PyTorch en entornos ligeros: con menos de 0,8 M de parametros, el modelo se carga y ejecuta en CPU en milisegundos, util para tests unitarios de despliegue.
- Referencia en experimentos de robustez frente a ruido de etiquetas: al estar entrenado con p = 0, sirve como control limpio frente a variantes con etiquetas corruptas.
- Material de comparacion en articulos o informes academicos sobre clasificacion de imagenes de baja resolucion con modelos lineales y MLPs.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la propia model card, medidos sobre la particion de test de CIFAR-10:

| Metrica | Valor |
|---|---|
| Exactitud de test (epoca 100) | 0.5050 |
| Mejor exactitud de test | 0.5231 (epoca 13) |
| Exactitud de entrenamiento (epoca 100) | 0.9963 |
| Parametros | 789.258 |
| Epocas | 100 |
| Tamano de lote | 64 |
| Tasa de aprendizaje | 0.01 (SGD sin momento) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en float32 (789.258 parametros x 4 bytes, mas overhead de PyTorch); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el modelo se ejecuta igual de bien en CPU. Una RTX 4090, A100 o H100 estarian enormemente sobredimensionadas para esta carga.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y en CPU sin problema.
- Opciones de despliegue: PyTorch nativo (carga directa con `torch.load`), exportacion a TorchScript u ONNX si se desea, y servido mediante Flask/FastAPI. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no son aplicables.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo, se espera del orden de microsegundos a milisegundos por imagen en CPU y aun menos en GPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Exactitud test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MadKane/smai-a4-mlp-p0-torch | 789.258 | 32x32x3 aplanada | 0.5050 | no disponible | HuggingFace (0 descargas) |
| IOC-NN del mismo assignment (Q1.4-1.5) | misma forma (3072 → 256 → 10) | 32x32x3 aplanada | no disponible en la informacion | no disponible | referenciado en la model card, sin enlace |
| MLP equivalente entrenado con etiquetas ruidosas (p > 0) | misma forma | 32x32x3 aplanada | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada; la comparacion con la IOC-NN del propio assignment es la unica referencia explicita, y sus resultados no se detallan en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre CIFAR-10, hereda los sesgos de composicion y etiquetado de ese dataset.
- Riesgo de alucinacion: no aplica en sentido generativo, pero el modelo puede producir predicciones erroneas con alta confianza, especialmente en clases visualmente similares (gato/perro, ciervo/caballo).
- Sobreajuste severo: exactitud de entrenamiento de 0.9963 frente a 0.5050 en test en la epoca 100, con el mejor resultado en la epoca 13 (0.5231); no es adecuado para uso en produccion sin regularizacion.
- Limitacion de contexto/entrada: solo acepta imagenes de 32x32x3 aplanadas; no admite otras resoluciones ni otros formatos sin reentrenamiento.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveat de produccion: es un modelo de assignment academico, sin mantenimiento, con 0 descargas y 0 likes; no debe emplearse como componente critico de un sistema real.
- Dependencia del preprocesado: la inferencia requiere aplicar exactamente la media y desviacion tipica de `preprocessing.npz`; omitirlo degrada gravemente los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MadKane/smai-a4-mlp-p0-torch
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
