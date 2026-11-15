# Rakib/PhyGHT-mu60

## Resumen

PhyGHT-mu60 es un checkpoint de un modelo de redes neuronales de grafos (GNN) combinado con capas Transformer, disenado para la regresion tabular de propiedades de jets en eventos de fisica de particulas. Lo desarrolla un equipo de la Universidad Estatal de Oklahoma (Mohammed Rakib, Luke Vaughan, Shivang Patel, Flera Rizatdinova, Alexander Khanov y Atriya Sen) y aborda el problema de la mitigacion del pileup (apilamiento de colisiones) en la reconstruccion de jets, prediciendo las fracciones de energia y masa de los jets a partir de las particulas cargadas que los constituyen.

El modelo es extremadamente compacto: 954.243 parametros totales, con una dimension de 128, cuatro cabezas de atencion y tres capas Transformer, sobre una construccion de grafo con ocho vecinos. Se ha entrenado desde cero durante 200 epocas sobre 8.000 eventos simulados de produccion de pares top-antitop, seleccionando el checkpoint en la epoca 192 mediante la perdida hibrida de validacion. La etiqueta "mu60" hace referencia a una condicion de pileup concreta, que debe tratarse como configuracion separada de la version mu200.

Su relevancia es acotada pero clara: no es un modelo de lenguaje ni un modelo generativo, sino un regresor cientifico especializado con resultados medidos y reproducibles (R2 de 0,9445 para la fraccion de energia y 0,8691 para la fraccion de masa en test). El repositorio incluye procedencia completa, hashes SHA256, historial de entrenamiento y ajustes de inferencia determinista, lo que lo convierte en un artefacto util para reproducibilidad en fisica de altas energias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos con capas Transformer (GNN + Transformer) |
| Parametros totales | 954.243 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por evento con jets y tracks de longitud variable) |
| Tipos de cuantizacion | no disponible (entrenado e inferido en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (codigo MIT; dataset CC BY 4.0; pesos sin licencia especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina una construccion de grafo sobre las particulas cargadas asociadas a cada jet con tres capas Transformer de dimension 128 y cuatro cabezas de atencion. Cada jet se representa por sus constituyentes (hasta ocho vecinos) y el modelo procesa las primeras seis columnas de los tracks y las primeras cuatro de los jets, en float32 y sin normalizacion ni truncado. La salida es un vector de dos valores por jet: fraccion de energia y fraccion de masa. Ademas, se entrena una cabeza auxiliar de clasificacion de senal sobre los tracks (etiqueta de verdad `truth_label == -1`).

El entrenamiento se realizo desde cero en el servidor CSX de la Universidad Estatal de Oklahoma, completando 200 epocas sobre 8.000 eventos, con un split fijo por semilla 42 de 8.000/1.000/1.000 sobre los 10.000 eventos originales. La funcion de perdida es MSE de energia + MSE de masa + 0,1 veces BCE de tracks. Se uso AdamW con tasa de aprendizaje 0,0003, weight decay 0,01, recorte de gradiente 1,0 y tamano de lote efectivo 16. El checkpoint final se selecciono en la epoca 192 usando unicamente la perdida hibrida de validacion. La inferencia verificada emplea algoritmos deterministas de PyTorch, float32, TF32 desactivado y `CUBLAS_WORKSPACE_CONFIG=:4096:8` para garantizar reducciones reproducibles en GPU.

## Capacidades

- Regresion tabular de dos objetivos por jet: fraccion de energia (`energy_fraction`) y fraccion de masa (`mass_fraction`).
- Procesamiento de eventos con estructura de grafo: jets con listas de identificadores de tracks de longitud variable.
- Clasificacion auxiliar de tracks de senal mediante la cabeza BCE (etiqueta `truth_label == -1`).
- Manejo de condiciones de pileup especificas (configuracion mu60; existe una version separada mu200).
- Inferencia determinista y reproducible en CPU y GPU con ajustes registrados en `inference_settings.json`.
- Carga con comprobacion estricta de state-dict y desactivacion de la ruta rapida fusionada de Transformer en evaluacion.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un regresor cientifico de dominio especifico.

## Casos de uso

- Mitigacion de pileup en reconstruccion de jets: el modelo predice las fracciones de energia y masa corregidas de cada jet a partir de sus constituyentes cargados, permitiendo estimar la contribucion de pileup en eventos simulados de top-antitop con mu60.
- Analisis de fisica de altas energias en pipelines de simulacion: integrado tras la simulacion de eventos, corrige las propiedades de los jets antes del analisis, con un coste computacional minimo dado su tamano (menos de un millon de parametros).
- Estudio de reproducibilidad metodologica: el repositorio incluye hashes, historial de entrenamiento y ajustes de inferencia determinista, por lo que sirve como referencia para validar pipelines de entrenamiento reproducibles en fisica.
- Prototipado de arquitecturas GNN+Transformer en regresion cientifica: su configuracion (dimension 128, tres capas, ocho vecinos) es un punto de partida barato para experimentar con grafos de particulas en una sola GPU.
- Comparacion de condiciones de pileup: al existir el checkpoint mu200 y el mu60 como configuraciones separadas, permite evaluar el deterioro del rendimiento al aumentar el pileup sobre el mismo conjunto de datos.
- Docencia y formacion: como ejemplo completo y autocontenido de un flujo de trabajo de aprendizaje automatico en fisica de particulas, con datos, codigo, pesos y metricas publicados.
- Validacion cruzada de simulaciones: los resultados permiten contrastar si un generador de eventos produce jets con propiedades consistentes con las predicciones del modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card (medidos tras el entrenamiento y la seleccion, no reproducidos de un paper):

| Split | Objetivo | R2 | MAE | RMSE | MSE |
|---|---|---:|---:|---:|---:|
| validation | energy_fraction | 0,93763456 | 0,02846976 | 0,04437589 | 0,00196922 |
| validation | mass_fraction | 0,86227840 | 0,02567715 | 0,03930365 | 0,00154478 |
| test | energy_fraction | 0,94451230 | 0,02774572 | 0,04326318 | 0,00187170 |
| test | mass_fraction | 0,86913643 | 0,02548577 | 0,03961160 | 0,00156908 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32, dado el tamano del modelo (954.243 parametros) y la estructura de grafo por evento; no se dispone de una medicion oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA; el entorno verificado es PyTorch 2.6.0+cu124. Funciona tambien en CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3090, RTX 2080, etc.) y en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Opciones de despliegue: carga directa con PyTorch y PyTorch Geometric (torch-geometric 2.6.1, torch-cluster, torch-scatter), mediante el modulo `portable_io` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de mitigacion de pileup basados en GNN, ni resultados de referencia frente a los que contrastar este checkpoint.

## Limitaciones y advertencias

- Entrenado exclusivamente con eventos simulados de produccion de pares top-antitop; otros procesos fisicos, condiciones de pileup distintas de mu60 y datos reales de detector requieren validacion independiente.
- Las unidades fisicas no estan verificadas; no deben asumirse interpretaciones fisicas directas sin comprobacion.
- Los resultados de test se midieron despues del entrenamiento y la seleccion del checkpoint, y el autor declara explicitamente que no son resultados de paper ni una afirmacion de reproduccion.
- No se especifica una licencia para los pesos del modelo; el codigo es MIT y el dataset CC BY 4.0, pero el uso comercial de los pesos queda sin definir.
- Riesgo de alucinacion no aplicable en el sentido habitual, pero si de extrapolacion incorrecta fuera de la distribucion de entrenamiento (condiciones de pileup o procesos distintos).
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar el sesgo inherente a la simulacion y al conjunto de datos de origen.
- Modelo de dominio muy especifico: no es reutilizable para tareas de lenguaje, vision u otras tareas genericas.
- Dependencia de versiones concretas de PyTorch y PyTorch Geometric para la carga verificada; cambios de entorno pueden alterar la reproducibilidad.
- El checkpoint mu60 debe tratarse como configuracion separada del mu200; no son intercambiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rakib/PhyGHT-mu60
- Paper: https://arxiv.org/abs/2602.20475
- Codigo: https://github.com/rAIson-Lab/PhyGHT (commit `ce3a02873bbe8b6382f7ba878d3866ff2aecb203`)
- Datos de simulacion originales: https://doi.org/10.5281/zenodo.18746388
- Dataset redistribuido: https://huggingface.co/datasets/Rakib/PhyGHT-TopQuark (revision `c61008f45b820cf47c5e9d5f234713ffdb74f671`)
