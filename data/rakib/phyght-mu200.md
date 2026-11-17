# Rakib/PhyGHT-mu200

## Resumen

PhyGHT-mu200 es un checkpoint de la red neuronal de grafos PhyGHT, desarrollada por Mohammed Rakib, Luke Vaughan, Shivang Patel, Flera Rizatdinova, Alexander Khanov y Atriya Sen (rAIson Lab, Oklahoma State University). El modelo aborda la mitigacion de pileup en eventos de colision de fisica de altas energias, concretamente en eventos simulados de produccion de pares de quark top, estimando la fraccion de energia y de masa de cada jet que proviene del vertex primario. Se trata de un modelo de regresion tabular sobre grafos, no de un modelo de lenguaje.

La arquitectura combina un transformer de tres capas con dimension 128 y cuatro cabezas de atencion, operando sobre un grafo de vecinos (k=8) construido a partir de las particulas cargadas asociadas a cada jet. Con solo 954.243 parametros, el modelo es extremadamente compacto y esta disenado para inferencia rapida en entornos de analisis de datos de fisica. El checkpoint mu200 corresponde a un entrenamiento de 200 epocas sobre 8.000 eventos, con seleccion en la epoca 190 por perdida hibrida de validacion.

La relevancia actual radica en que ofrece un pipeline reproducible y verificado (con hashes SHA256, configuracion determinista y ficheros de procedencia) para una tarea especifica de reconstruccion en el LHC, aunque su alcance es limitado: solo se ha validado sobre eventos simulados de un unico proceso fisico y no sobre datos reales de detector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre grafo de vecinos (3 capas, dim 128, 4 cabezas, k=8) |
| Parametros totales | 954.243 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por evento con numero variable de jets y tracks) |
| Tipos de cuantizacion | no disponible (entrenado e inferido en float32) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible para los pesos; codigo MIT, dataset y evento de ejemplo CC BY 4.0 |
| Formato de pesos | safetensors (con state-dict estricto) y checkpoint original PyTorch |

## Arquitectura y entrenamiento

PhyGHT es una red neuronal de grafos con capas de atencion tipo transformer. Cada evento se representa mediante jets (con cuatro caracteristicas usadas: pT, eta, phi y masa) y tracks (con seis caracteristicas: pT, eta, phi, masa, d0 y z0), enlazados por identificadores de constitucion (`jet_trk_IDs`). El modelo construye un grafo de 8 vecinos por nodo y aplica tres capas de transformer con dimension 128, cuatro cabezas y dropout 0.1. La salida es un vector de dos valores por jet: fraccion de energia y fraccion de masa atribuibles al vertex primario.

El entrenamiento se realizo desde cero en el servidor CSX de Oklahoma State University, con 200 epocas completas sobre 8.000 eventos (particion 8.000/1.000/1.000 de un total de 10.000, permutacion con semilla 42). La funcion de perdida es hibrida: MSE de energia + MSE de masa + 0.1 veces BCE sobre tracks (objetivo auxiliar `truth_label == -1`). Se uso AdamW con learning rate 3e-4, weight decay 0.01, gradient clipping 1.0 y batch efectivo de 16. El checkpoint se selecciono en la epoca 190 usando exclusivamente la perdida de validacion. La inferencia se configura de forma determinista (float32, TF32 desactivado, `CUBLAS_WORKSPACE_CONFIG=:4096:8`) y desactiva la ruta rapida fusionada de transformers de PyTorch.

## Capacidades

- Regresion por jet de la fraccion de energia y de masa procedente del vertex primario en eventos de colision.
- Procesamiento de eventos con numero variable de jets y de tracks por jet mediante agregacion en grafo.
- Clasificacion auxiliar de tracks (senal frente a pileup) a traves de la salida BCE entrenada.
- Inferencia determinista y reproducible en CPU o GPU con PyTorch 2.6.0 y torch-geometric 2.6.1.
- Carga con verificacion estricta de state-dict y hashes SHA256 registrados.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Mitigacion de pileup en analisis de datos simulados del LHC: el modelo estima, jet a jet, que fraccion de la energia y masa medidas corresponde al vertex primario, lo que permite corregir la energia de los jets antes de reconstruir la masa del sistema de pares de quark top.
- Etiquetado de tracks como senal o pileup: la salida BCE auxiliar permite filtrar tracks de baja calidad o provenientes de colisiones apiladas en la etapa de preprocesado de un analisis.
- Estudio de rendimiento de tecnicas de machine learning en fisica de particulas: al ser un modelo de menos de un millon de parametros con pipeline reproducible, sirve como referencia para comparar arquitecturas de GNN frente a metodos tradicionales de mitigacion.
- Validacion cruzada de simulaciones: el modelo puede aplicarse a nuevos conjuntos de eventos simulados con las mismas condiciones de pileup (mu200 y mu60 como configuraciones separadas) para comprobar la coherencia de la reconstruccion.
- Integracion en pipelines de analisis de alto rendimiento: con 954.243 parametros y entrada tabular, la inferencia por evento es ligera y puede ejecutarse en lote sobre grandes volumenes de eventos en una GPU de consumo.
- Reproduccion de resultados academicos: el repositorio incluye historial de entrenamiento, log, entorno y hashes, lo que permite reentrenar o verificar el checkpoint en un contexto de revision cientifica.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el checkpoint mu200 (epoca 190):

| Split | Objetivo | R2 | MAE | RMSE | MSE |
|---|---|---:|---:|---:|---:|
| validacion | energy_fraction | 0.93059360 | 0.01236418 | 0.02045338 | 0.00041834 |
| validacion | mass_fraction | 0.82539444 | 0.00956031 | 0.01575836 | 0.00024833 |
| test | energy_fraction | 0.93459781 | 0.01239546 | 0.02036713 | 0.00041482 |
| test | mass_fraction | 0.83663009 | 0.00949789 | 0.01550109 | 0.00024028 |

No se han publicado resultados comparativos frente a otros modelos de mitigacion de pileup en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32, dado el tamano del modelo (954.243 parametros) y los grafos de 8 vecinos por jet.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no requiere memoria significativa.
- Cabe en GPU de consumo y en CPU sin problema.
- Opciones de despliegue: PyTorch 2.6.0+cu124 con torch-geometric 2.6.1, torch-cluster y torch-scatter; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (GNN para mitigacion de pileup en eventos de quark top) con los que contrastar parametros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre eventos simulados de produccion de pares de quark top; no validado sobre datos reales de detector ni sobre otros procesos fisicos.
- Las condiciones de pileup estan restringidas a las configuraciones mu200 y mu60; otros niveles de apilamiento requieren validacion independiente.
- Las unidades fisicas no estan verificadas segun la propia model card.
- Riesgo de extrapolacion incorrecta fuera de la distribucion de simulacion empleada.
- La licencia de los pesos no esta especificada; el codigo es MIT y el dataset CC BY 4.0, pero el uso comercial de los pesos no queda cubierto por una licencia explicita.
- El modelo no es un modelo de lenguaje: no admite prompts, tool calling ni conversacion, y su uso esta limitado a la tarea de regresion tabular descrita.
- La inferencia debe ejecutarse con la configuracion determinista documentada; desviarse de ella puede alterar los resultados de forma no reproducible.
- El checkpoint seleccionado en la epoca 190 sobre 8.000 eventos puede presentar sobreajuste a la particion de validacion, dado el tamano reducido del conjunto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rakib/PhyGHT-mu200
- Dataset: https://huggingface.co/datasets/Rakib/PhyGHT-TopQuark
- Paper: https://arxiv.org/abs/2602.20475
- Codigo: https://github.com/rAIson-Lab/PhyGHT (commit ce3a02873bbe8b6382f7ba878d3866ff2aecb203)
- Datos de simulacion originales: https://doi.org/10.5281/zenodo.18746388
