# Delower/dpp4-pic50-dnn_mlp

## Resumen

DPP-4 pIC50 Regression — dnn_mlp es un modelo de regresión quimioinformática publicado por el usuario Delower en Hugging Face. No es un modelo de lenguaje: es un perceptrón multicapa (MLP) entrenado para predecir el pIC50, es decir, la potencia de inhibición de la enzima DPP-4 (dipeptidil peptidasa-4) expresada en escala logarítmica, a partir de la representación molecular de un compuesto en formato SMILES. La entrada del modelo no es texto libre, sino una huella molecular de 4.608 dimensiones que combina cuatro descriptores de fingerprint (Morgan/ECFP4-1024, un fingerprint extendido tipo RDKit path de 1.024 bits, ECFP4-512 y ECFP4-2048).

El modelo se entrenó sobre 10.085 compuestos curados derivados de ChEMBL, con un particionado 80/10/10 agrupado por SMILES canónico y estratificado por bandas de pIC50, con semilla 42. El conjunto de 12 fármacos aprobados por la FDA se excluyó explícitamente del entrenamiento. Los pesos subidos al repositorio se reentrenaron sobre el 100 % de los datos limpios, mientras que las métricas publicadas corresponden a la ejecución con particionado (conjunto de test retenido de 1.014 compuestos), que el autor presenta como la estimación honesta del rendimiento.

Su relevancia es acotada y muy específica: sirve como componente de cribado virtual temprano en descubrimiento de fármacos para la diana DPP-4 (relevante en diabetes tipo 2), y como referencia comparativa frente a alternativas como LightGBM, XGBoost, Random Forest, redes de grafos (GAT), transformers químicos (ChemBERTa) y modelos de lógica difusa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB según la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) denso con capas 4608-768-384-192-1, sobre fingerprint molecular de 4.608 dimensiones |
| Parametros totales | no disponible (no se publica el recuento; la topología 4608-768-384-192-1 implica del orden de 3,9 millones de pesos, cálculo derivado de la arquitectura declarada, no dato del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de vector fijo de 4.608 dimensiones; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, state_dict de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de regresión numérica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (torch state_dict), cargable en `MLP(4608-768-384-192-1)`; incluye `config.json` con arquitectura, receta de features y normalización (`y_mean`/`y_std`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP totalmente conectado con cuatro capas ocultas de 768, 384 y 192 neuronas y una salida escalar (pIC50), que consume un vector de 4.608 características construido por concatenación de cuatro fingerprints: Morgan/ECFP4-1024, un fingerprint extendido alternativo de 1.024 bits (descrito en la model card como CDK-Extended alternativo basado en RDKit path fingerprint), ECFP4-512 y ECFP4-2048. La normalización de la variable objetivo se realiza con `y_mean`/`y_std` declarados en `config.json`. No hay componente de atención, grafo ni secuencia: es un regresor tabular sobre descriptores fijos.

El entrenamiento usó 10.085 compuestos curados de origen ChEMBL, con partición 80/10/10 agrupada por SMILES canónico (para evitar fuga de información entre train y test por estructuras duplicadas) y estratificada por bandas de pIC50, con semilla 42. El conjunto FDA-12 (12 inhibidores de DPP-4 aprobados por la FDA) se excluyó del entrenamiento. Los pesos publicados se reentrenaron sobre el 100 % de los datos limpios; las métricas reportadas provienen de la ejecución con particionado y un test retenido de 1.014 compuestos. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de aumento de datos; tampoco se detalla la función de pérdida ni el esquema de optimización.

## Capacidades

- Regresión de pIC50 para inhibidores de DPP-4 a partir de un SMILES, mediante recálculo del fingerprint de 4.608 dimensiones y paso por el MLP.
- Inferencia de un solo compuesto mediante el script `infer.py` incluido en el repositorio.
- Clasificación post-hoc de bioactividad derivada de la predicción continua: activo ≥ 7,5 frente a inactivo ≤ 6,0, con zona gris excluida, y umbral adicional de potente ≥ 7,0 (resultados en `classification.csv`).
- Comparación de predicciones con el pIC50 de referencia de estructuras canónicas del conjunto curado para los 12 fármacos de la FDA (`fda.csv`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor numérico de una sola salida.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.

## Casos de uso

- Cribado virtual temprano en descubrimiento de fármacos para DPP-4: dado un catálogo de SMILES, el modelo puntúa cada compuesto con un pIC50 estimado y permite priorizar los candidatos antes de ensayos in vitro, con la ventaja de que la inferencia es puramente feed-forward sobre descriptores y no requiere GPU dedicada.
- Priorización de bibliotecas químicas en proyectos de diabetes tipo 2: filtrado rápido de miles de estructuras por banda de potencia predicha, usando la clasificación post-hoc (activo/inactivo) para descartar candidatos con pIC50 estimado bajo.
- Triaje de compuestos en pipelines de quimioinformática: integración del script `infer.py` como etapa de puntuación dentro de un flujo que genere SMILES y consuma la predicción, gracias a su interfaz de línea de comandos mínima y a la reproducibilidad del fingerprint (receta fija en `config.json`).
- Modelo de referencia (baseline) para comparación metodológica: su RMSE de test de 0,5712 frente a alternativas como GAT (0,8816), ChemBERTa con fine-tuning (0,9928) o LightGBM (0,5750) lo convierte en un punto de comparación útil al evaluar arquitecturas más complejas sobre el mismo conjunto de datos.
- Análisis de relación estructura-actividad sobre compuestos concretos: comparar la predicción del modelo con el pIC50 del mismo SMILES canónico en el conjunto curado permite detectar estructuras problemáticas o discrepancias de anotación.
- Evaluación de cobertura frente a fármacos conocidos: el archivo `fda.csv` con las predicciones para los 12 inhibidores de DPP-4 aprobados por la FDA sirve para comprobar si el modelo reproduce el orden de potencia esperado en un conjunto externo de referencia (con la cautela de que no es un holdout totalmente independiente).
- Docencia y prototipado en quimioinformática: ejemplo completo y ligero (MLP sobre fingerprints) para ilustrar un flujo de regresión QSAR con particionado agrupado y métricas por banda.

## Benchmarks y rendimiento

Resultados de la ejecución con particionado sobre el conjunto de test retenido (n = 1.014), según la model card:

| Modelo | Test RMSE | Test MAE | Test R2 | FDA RMSE |
|---|---:|---:|---:|---:|
| dnn_mlp | 0,5712 | 0,3105 | 0,8019 | 0,7269 |
| lgbm | 0,5750 | 0,3578 | 0,7993 | 0,7600 |
| xgb | 0,5822 | 0,3699 | 0,7943 | 0,8369 |
| rf | 0,6129 | 0,4097 | 0,7720 | 0,8091 |
| ltn | 0,7476 | 0,5675 | 0,6607 | no disponible |
| gat | 0,8816 | 0,6847 | 0,5282 | no disponible |
| chemberta_frozen_ridge | 0,9364 | 0,7327 | 0,4677 | no disponible |
| transformer3 | 0,9535 | 0,7313 | 0,4481 | no disponible |
| transformer4 | 0,9895 | 0,7712 | 0,4056 | no disponible |
| chemberta_ft | 0,9928 | 0,7799 | 0,4016 | no disponible |

Advertencias del propio autor: el RMSE de la columna FDA compara las predicciones con el pIC50 de la misma estructura canónica en el conjunto curado (el fichero FDA no tiene columna pIC50), por lo que no es un holdout completamente independiente y solo se usó como criterio de desempate. El R2 ajustado no es interpretable en test/validación porque el número de características (4.608) supera el número de muestras. Las métricas reportadas corresponden al modelo de la ejecución con particionado, no a los pesos reentrenados sobre el 100 % de los datos.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. El MLP tiene del orden de 3,9 millones de pesos (cálculo derivado de la topología 4608-768-384-192-1); en FP32 ocupa aproximadamente 16 MB y en FP16 unos 8 MB, cantidades que caben holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente para inferencia de un solo SMILES. Una RTX 4090, A100 o H100 no aportan ventaja apreciable para este tamaño de modelo.
- Cabe en GPU consumer: sí, en cualquier modelo, incluidos los de gama baja con poca VRAM, y también en CPU.
- Opciones de despliegue: el repositorio proporciona `infer.py` con `requirements.txt` para ejecución directa en Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un regresor tabular de este tipo. El despliegue natural es un script de Python o un servicio ligero que cargue `model.pt` con PyTorch.
- Latencia y throughput estimados: no disponible en la información proporcionada. Por la naturaleza del modelo (una pasada feed-forward sobre 4.608 entradas), la latencia estaría dominada por el cálculo del fingerprint con RDKit más que por el propio MLP, pero no se publican cifras.

## Comparativa con modelos similares

Comparación con las alternativas evaluadas por el propio autor sobre el mismo conjunto de test (n = 1.014):

| Modelo | Tipo | Test RMSE | Test R2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| dnn_mlp (este modelo) | MLP sobre fingerprint 4.608 dim | 0,5712 | 0,8019 | no disponible | Pesos en Hugging Face (`model.pt`) |
| lgbm | Gradient boosting | 0,5750 | 0,7993 | no disponible | Resultado reportado, pesos no publicados en el repo |
| xgb | Gradient boosting | 0,5822 | 0,7943 | no disponible | Resultado reportado, pesos no publicados en el repo |
| rf | Random forest | 0,6129 | 0,7720 | no disponible | Resultado reportado, pesos no publicados en el repo |
| gat | Graph attention network | 0,8816 | 0,5282 | no disponible | Resultado reportado, pesos no publicados en el repo |
| chemberta_ft | Transformer químico con fine-tuning | 0,9928 | 0,4016 | no disponible | Resultado reportado, pesos no publicados en el repo |

El dnn_mlp obtiene el mejor RMSE y MAE de la comparativa, con una ventaja modesta sobre LightGBM (0,5712 frente a 0,5750 de RMSE) y más amplia frente a las arquitecturas de grafos y transformers. No se dispone de datos para comparar con otros modelos públicos de predicción de pIC50 para DPP-4 fuera de esta evaluación interna.

## Limitaciones y advertencias

- Modelo basado exclusivamente en fingerprints: no incorpora estructura 3D, metadatos de ensayo ni información conformacional, lo que limita su capacidad para capturar interacciones farmacóforas que dependen de la geometría.
- No extrapola fuera del rango de pIC50 del conjunto de entrenamiento; las predicciones fuera de ese intervalo no son fiables.
- Los errores son mayores para compuestos débilmente activos: el RMSE por banda del conjunto de test es más alto para pIC50 < 5,5.
- El RMSE de la columna FDA no constituye un holdout independiente, ya que se compara contra el pIC50 de la misma estructura canónica en el conjunto curado; no debe interpretarse como validación externa.
- Las métricas publicadas corresponden al modelo de la ejecución con particionado, no a los pesos reentrenados sobre el 100 % de los datos que se distribuyen en el repositorio; el rendimiento real de esos pesos no está medido de forma independiente.
- El R2 ajustado no es interpretable en test/validación por el desequilibrio entre características (4.608) y muestras.
- Herramienta de uso exclusivamente en investigación: no es una herramienta clínica ni de dosificación.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Repositorio sin descargas ni likes y con tamaño declarado de 0,0 GB en la información disponible; conviene verificar la integridad de los ficheros antes de usarlo.
- No se documentan sesgos de datos más allá del origen ChEMBL y la exclusión del conjunto FDA-12; la composición química del conjunto de entrenamiento puede no representar quimiotipos alejados del espacio cubierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/dpp4-pic50-dnn_mlp
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
