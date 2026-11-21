# hb-007/complaintops-distilbert-lora-onnx

## Resumen

ComplaintOps es un clasificador de texto en ingles que asigna reclamaciones financieras de consumidores de EE. UU. a 24 clases combinadas de `producto | problema`, y devuelve una puntuacion de confianza que permite derivar los casos dudosos a una persona. Lo desarrolla el usuario de Hugging Face `hb-007` (autor del proyecto ComplaintOps, con codigo en GitHub bajo el usuario `hardikbahri`). Parte de `distilbert-base-uncased`, se ajusta con LoRA, se fusiona, se exporta a ONNX y se cuantiza a int8, lo que deja un artefacto de 67 MB que corre en CPU sin PyTorch.

El modelo resuelve un problema muy concreto: el triaje automatico de reclamaciones del CFPB (Consumer Financial Protection Bureau) con un umbral de confianza operativo. No es un modelo generativo ni de proposito general; es un componente de un pipeline de clasificacion con puerta de evaluacion, monitorizacion de deriva y un agente LangGraph para el traspaso a humanos. Su relevancia practica esta en el diseno: split temporal por fecha, offsets de clase ajustados en validacion, fusion de clases indistinguibles por texto y una politica de enrutamiento explicita a 0.8 de confianza.

Arquitectura transformer encoder (DistilBERT, 6 capas), 68,9 M de parametros totales de los que solo 1,94 M (2,8 %) se entrenan con LoRA, contexto de 256 tokens y licencia Apache 2.0. El repositorio ocupa 0,1 GB y la libreria declarada es ONNX. El modelo esta pensado exclusivamente para ingles y para el dominio de reclamaciones financieras estadounidenses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas), ajuste LoRA, exportado a ONNX y cuantizado a int8 |
| Parametros totales | 68,9 M (modelo base); 1,94 M entrenables con LoRA (2,8 %) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de ONNX Runtime); se reporta comparacion con fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (int8); el modelo base original es safetensors/PyTorch, no incluido en el repo |
| Tamano del artefacto | 67 MB (frente a 268 MB en PyTorch) |
| Pipeline | text-classification |
| Numero de clases | 26 en la red, 24 tras la fusion de clases |
| Dataset | sovai/cfpb_complaints (335.499 reclamaciones con narrativa tras limpieza y deduplicacion) |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo es un DistilBERT (`distilbert-base-uncased`) de 6 capas al que se aplica LoRA (PEFT) sobre todas las capas de atencion y feed-forward (`q_lin, k_lin, v_lin, out_lin, lin1, lin2`), con la cabeza de clasificacion entrenada por completo. Los hiperparametros de LoRA son rango 16, alpha 32 y dropout 0.1. El entrenamiento usa 3 epocas, batch de 32, learning rate 2e-4 con AdamW y schedule de warm-up lineal, precision mixta fp16, longitud maxima de 256 tokens y pesos de clase balanceados elevados a la potencia 0.5 (los pesos totalmente balanceados perjudicaban la precision). El ajuste completo llevo aproximadamente 1,5 horas en una sola GPU de Colab.

Los datos proceden de reclamaciones publicas del CFPB a traves de la copia en Hugging Face `sovai/cfpb_complaints`. Tras limpieza y deduplicacion quedan 335.499 reclamaciones con narrativa escrita. El split es temporal por fecha: entrenamiento 234.849 (hasta febrero de 2023), validacion 50.325 y test 50.325 (hasta mayo de 2024), con una comprobacion en el proyecto de que ninguna reclamacion aparece en dos splits. Tras el entrenamiento, el adaptador se fusiona en los pesos base, se exporta a ONNX con batch y longitud de secuencia dinamicos y se cuantiza a int8 con cuantizacion dinamica de ONNX Runtime.

La innovacion tecnica del artefacto no esta en la red sino en el post-procesado que aplica `predict.py`: (1) `bias.json` contiene 26 offsets sumados a los logits antes del softmax, ajustados en validacion para maximizar weighted F1 y verificados con cross-fitting para evitar sobreajuste, sin usar nunca el test; (2) fusion de tres clases de credit reporting que el texto no permite distinguir en una sola, pasando de 26 a 24 clases; (3) enrutamiento por umbral de confianza a 0.8, por debajo del cual la reclamacion se deriva a una persona con las tres etiquetas mas probables como sugerencia.

## Capacidades

- Clasificacion de texto multietiqueta en 24 clases de `producto | problema` sobre reclamaciones financieras de consumidores.
- Salida de confianza calibrada por clase, con `top_k` de etiquetas candidatas para revision humana.
- Enrutamiento automatico por umbral: respuesta automatica o derivacion a persona.
- Inferencia en CPU sin PyTorch, solo con `onnxruntime`, `tokenizers`, `numpy` y `huggingface_hub`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por si mismo; el agente LangGraph del proyecto ComplaintOps es codigo externo que consume las salidas del clasificador.
- No soporta vision, audio ni modo de razonamiento (thinking mode).
- Capacidad multilingue limitada al ingles; no se ha entrenado ni evaluado en otros idiomas.
- No es un modelo generativo: no produce texto libre, solo etiquetas y probabilidades.

## Casos de uso

- Triaje automatico de reclamaciones CFPB: el modelo asigna cada narrativa a una de las 24 clases y, con el umbral de 0.8, resuelve automaticamente el 72,6 % de los casos con un 93,9 % de precision, derivando el resto a un agente humano. Es el caso de uso central del proyecto.
- Enrutamiento a equipos especializados: la etiqueta `producto | problema` permite dirigir la reclamacion al equipo de tarjetas, hipotecas, cobro de deudas, etc., reduciendo el tiempo de primera respuesta.
- Pre-etiquetado para revision humana: las tres etiquetas candidatas con su confianza se presentan al revisor, que solo tiene que confirmar o corregir, en lugar de clasificar desde cero.
- Monitorizacion de deriva en produccion: al ser un clasificador pequeno y rapido, se puede ejecutar sobre lotes periodicos para detectar cambios en la distribucion de clases a lo largo del tiempo (el propio autor documenta la caida de F1 entre validacion y test por deriva temporal).
- Deteccion de casos que requieren escalado: la confianza baja como senal de ambiguedad permite marcar reclamaciones potencialmente graves o mal tipificadas para revision prioritaria.
- Clasificacion por lotes en pipelines de bajo coste: con 67 MB y 91 ms de mediana por reclamacion en 2 hilos de CPU, se puede procesar volumen alto en infraestructura sin GPU.
- Prototipado de sistemas de compliance: sirve como componente base en un pipeline con puerta de evaluacion y agente de handoff, replicable en otros dominios regulatorios con datos etiquetados equivalentes.

## Benchmarks y rendimiento

Resultados sobre las 24 clases, segun la model card del autor:

| Modelo | Weighted F1 validacion | Weighted F1 test |
|---|---|---|
| TF-IDF + regresion logistica (baseline) | 0.812 | 0.776 |
| DistilBERT + LoRA | 0.842 | 0.809 |
| DistilBERT + LoRA + offsets de clase (este modelo) | 0.854 | 0.817 [0.814, 0.821] |

- Precision (accuracy) en test sobre 24 clases: 0.829; macro-F1: 0.533.
- Ganancia sobre el baseline en test: +0.041 (intervalo del 95 %: +0.038 a +0.044).
- Con enrutamiento a 0.8 de confianza: 72,6 % de las reclamaciones de test respondidas automaticamente con 93,9 % de precision.
- int8 frente a fp32 sobre 3.000 reclamaciones de validacion: weighted F1 0.856 frente a 0.860.
- Latencia: 91 ms de mediana por reclamacion en 2 hilos de CPU (frente a 167 ms en PyTorch).
- Todos los modelos puntuan peor en test que en validacion; el autor lo atribuye a deriva temporal, no a sobreajuste, porque el test es posterior en el tiempo.

## Requisitos de hardware

- Inferencia en CPU: el artefacto int8 de 67 MB esta disenado para ejecutarse sin GPU, con `onnxruntime` y 2 hilos de CPU; mediana de 91 ms por reclamacion.
- VRAM estimada: no aplica en el caso de uso previsto (CPU); en GPU el modelo int8 ocupa del orden de decenas de MB, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada; el entrenamiento se hizo en una sola GPU de Colab.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; no requiere tarjetas de gama alta.
- Opciones de despliegue: ONNX Runtime (via `predict.py` del repo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de clasificacion.
- Throughput: no disponible; solo se publica la latencia mediana por peticion en 2 hilos de CPU.
- Nota: las confianzas exactas pueden variar ligeramente entre CPUs, algo normal en modelos int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 test (24 clases) | Licencia | Formato |
|---|---|---|---|---|---|
| ComplaintOps DistilBERT + LoRA int8 (este) | 68,9 M (1,94 M entrenables) | 256 tokens | 0.817 ponderado | apache-2.0 | ONNX int8 |
| TF-IDF + regresion logistica (baseline del proyecto) | no aplica | no aplica | 0.776 ponderado | no disponible | no disponible |
| DistilBERT + LoRA sin offsets (variante del proyecto) | 68,9 M | 256 tokens | 0.809 ponderado | apache-2.0 | no disponible |
| Otros clasificadores de reclamaciones CFPB | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes internas del proyecto porque no se han proporcionado datos de modelos externos comparables en la misma tarea y con las mismas 24 clases.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado en otros idiomas; el dominio es exclusivamente el de reclamaciones financieras de EE. UU.
- Contexto de 256 tokens: las narrativas mas largas se truncan, lo que puede perder informacion relevante para la clasificacion.
- Macro-F1 bajo (0.533) frente a weighted F1 (0.817): el rendimiento esta dominado por las clases mayoritarias; las clases minoritarias se clasifican mucho peor.
- Deriva temporal documentada: el F1 cae de validacion a test en todos los modelos evaluados; en produccion hay que monitorizar y reentrenar periodicamente.
- Fusion de clases: tres problemas de credit reporting se agrupan en una sola clase porque el texto no los distingue; no se puede recuperar esa granularidad con este modelo.
- Riesgo de clasificacion erronea silenciosa: por encima del umbral de 0.8 el modelo responde automaticamente, pero el 6,1 % de esos casos son incorrectos segun los datos del autor; el umbral debe calibrarse segun el coste del error en cada despliegue.
- No es un modelo generativo: no justifica la clasificacion en texto libre, solo devuelve etiquetas y probabilidades.
- Las confianzas pueden variar ligeramente entre CPUs por la cuantizacion int8.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni compromiso de mantenimiento.
- Dependencia de un dataset de terceros (`sovai/cfpb_complaints`) cuya calidad y actualizacion no controla el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hb-007/complaintops-distilbert-lora-onnx
- Demo con ejecuciones del agente: https://huggingface.co/spaces/hb-007/complaintops
- Codigo del proyecto ComplaintOps: https://github.com/hardikbahri/complaintops
- Dataset de reclamaciones: https://huggingface.co/datasets/sovai/cfpb_complaints
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper, blog y repositorios adicionales: no disponibles en la informacion proporcionada.
