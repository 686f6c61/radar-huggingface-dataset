# SamHuertas/SciTLDR-trained-BART

## Resumen

SciTLDR-trained-BART es un modelo de la familia BART, publicado por el usuario SamHuertas en Hugging Face, cuyo nombre sugiere un ajuste fino sobre el corpus SciTLDR orientado a la generacion de resumenes de articulos cientificos. BART es una arquitectura encoder-decoder basada en transformer, preentrenada mediante denoising y ampliamente utilizada como linea base en tareas de summarization abstractiva. El modelo cuenta con 139.470.681 parametros totales, un tamano coherente con la configuracion base de BART.

La relevancia del modelo radica en su posible especializacion en resumen cientifico, un dominio donde los modelos genericos suelen producir salidas poco fieles al contenido tecnico. Sin embargo, la informacion publica disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de evaluacion, y el repositorio apenas acumula 57 descargas. Esto lo situa como un artefacto de experimentacion mas que como un modelo listo para produccion.

El repositorio ocupa 2.2 GB y contiene pesos en formato safetensors. La ficha siguiente se limita a los datos verificables y marca explicitamente como "no disponible" todo aquello que no puede confirmarse a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (transformer encoder-decoder) |
| Parametros totales | 139.470.681 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BART base suele usar 1024 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el nombre del dataset sugiere ingles, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura BART, un transformer encoder-decoder con atencion bidireccional en el encoder y autorregresiva en el decoder, preentrenado originalmente con objetivos de denoising (corrupcion de texto y reconstruccion). El numero de parametros (139,47 M) coincide con la configuracion BART-base, aunque no se especifica si se partio de los pesos oficiales de facebook/bart-base ni si se modifico la configuracion.

Segun el nombre del repositorio, el ajuste fino se habria realizado sobre SciTLDR, un corpus de articulos cientificos con resumenes cortos (TLDR). No se detallan el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto abstractivo, presumiblemente orientado a resumenes de documentos cientificos.
- Resumen de articulos o fragmentos tecnicos, segun el corpus declarado en el nombre del modelo.
- Generacion condicionada por entrada larga dentro de los limites del encoder BART (longitud exacta no confirmada).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el nombre del dataset apunta a contenido en ingles, sin confirmacion.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Resumen de articulos cientificos: el modelo puede recibir el abstract o secciones de un paper y generar un TLDR, aprovechando el ajuste sobre SciTLDR para producir salidas breves y centradas en el contenido tecnico.
- Preprocesado de literatura en revisiones sistematicas: util para generar resumenes preliminares de grandes volumenes de papers antes de la lectura manual, reduciendo el tiempo de triaje.
- Enriquecimiento de bases de datos bibliograficas: generacion automatica de resumenes cortos para registros que carecen de abstract estructurado.
- Asistencia a investigadores: sintesis rapida de secciones de metodologia o resultados para decidir si un articulo es relevante.
- Generacion de resumenes en pipelines de divulgacion: conversion de textos tecnicos en parrafos breves para boletines o notas de prensa internas.
- Prototipado y experimentacion academica: linea base ligera (139 M de parametros) para comparar estrategias de summarization cientifica sin requerir hardware de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,56 GB solo para pesos, mas memoria de activaciones y cache de atencion.
- VRAM estimada en FP16/BF16: aproximadamente 0,28 GB para pesos, con overhead adicional segun longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU para inferencia en lote.
- Cabe en GPU consumer: si, con amplio margen, incluso en GPUs de gama baja con 4-6 GB de VRAM.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; conversion a ONNX o a GGUF para llama.cpp/Ollama no esta publicada y requeriria conversion manual.
- Latencia y throughput estimados: no disponibles; por tamano, se espera inferencia rapida en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SciTLDR-trained-BART (este) | 139,47 M | no disponible | no disponible | Hugging Face, 57 descargas |
| facebook/bart-base | ~139 M | 1024 tokens | MIT | Hugging Face, ampliamente usado |
| facebook/bart-large-cnn | ~406 M | 1024 tokens | MIT | Hugging Face, referente en summarization |
| google/pegasus-xsum | ~568 M | 512-1024 tokens | Apache 2.0 | Hugging Face, orientado a resumenes extremos |

La comparacion se limita a datos publicos de los modelos alternativos; no existen metricas del modelo evaluado que permitan contrastar calidad.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no puede asumirse uso comercial sin aclaracion del autor.
- Sin resultados de evaluacion (ROUGE u otras metricas): la calidad real del ajuste es desconocida.
- Riesgo de alucinacion inherente a los modelos generativos abstractivos, especialmente al resumir contenido tecnico con terminologia especializada.
- Longitud de contexto no documentada; entradas largas pueden truncarse segun la configuracion del tokenizador.
- Idiomas soportados no confirmados; probable sesgo hacia ingles por el corpus SciTLDR.
- Repositorio con muy poca traccion (57 descargas, 0 likes) y sin documentacion de entrenamiento: dificil de auditar o reproducir.
- No hay variantes cuantizadas publicadas, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamHuertas/SciTLDR-trained-BART
- Paper de BART (Lewis et al., 2019): https://arxiv.org/abs/1910.13461
- Dataset SciTLDR (referencia del corpus): https://github.com/allenai/scitldr
- Modelo base de referencia BART: https://huggingface.co/facebook/bart-base
