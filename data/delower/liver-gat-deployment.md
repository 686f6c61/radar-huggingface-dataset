# Delower/liver-gat-deployment

## Resumen

El modelo `Delower/liver-gat-deployment` es un clasificador binario de toxicidad hepática inducida por fármacos (DILI, por sus siglas en inglés) desarrollado por el usuario Delower. Se trata de un refit de despliegue de una red de atención sobre grafos (GAT, graph attention network) que opera sobre grafos moleculares: cada compuesto químico se representa como un grafo de átomos y enlaces, y el modelo estima la probabilidad de que el compuesto pertenezca a la clase tóxica. Forma parte de un programa de cribado que seleccionó esta arquitectura (Arch2 GAT) como una de las dos ganadoras sobre un benchmark regulatorio bloqueado.

El modelo se despliega en pareja con un clasificador ExtraTrees (`Delower/liver-extratrees-deployment`); un compuesto marcado por ambos modelos constituye la lectura de mayor preocupación. La relevancia práctica del modelo radica en su uso como cribado de alta sensibilidad y baja especificidad en fases tempranas de descubrimiento de fármacos, no como predictor de riesgo clínico calibrado.

El repositorio es extremadamente ligero (0,0 GB según Hugging Face) y no incluye pesos en formato safetensors ni GGUF, sino un checkpoint de PyTorch (`model.pt`). No se dispone de información sobre idiomas soportados ni sobre pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAT (graph attention network) sobre grafos moleculares; `in_dim` 35, hidden 128, dropout 0.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible; pesos en checkpoint PyTorch de precisión estándar |
| Idiomas soportados | no disponible (modelo químico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (checkpoint PyTorch con `state_dict`, estado del optimizador y RNG); `config.json` con configuración de arquitectura |

## Arquitectura y entrenamiento

La arquitectura es una GAT que procesa grafos moleculares construidos a partir de SMILES, con features atómicas de dimensión de entrada 35 y una capa oculta de 128 unidades, dropout 0.2 y tasa de aprendizaje 3e-3. La configuración corresponde a la ejecución ganadora bloqueada (MCC de validación 0.2131, mejor época 37) y se reutilizó sin reajuste. El refit final se realizó con 37 épocas fijas sobre el conjunto completo de despliegue, con peso de clase positiva 0.8853 y umbral de marcado de probabilidad ≥ 0.5.

El conjunto de entrenamiento de despliegue contiene 1.891 compuestos únicos (1.003 positivos / 888 negativos), deduplicados por conectividad InChIKey del compuesto padre estandarizado, compuesto por `train_locked.csv` (1.769 filas) más adiciones de `train_enriched.csv`, `internal_test.csv` y todos los compuestos del benchmark regulatorio (retirados, fallos clínicos y PASS), con las etiquetas del benchmark prevaleciendo en conflictos. Se descartaron 1.769 filas duplicadas y se registraron 42 conflictos de etiqueta. Antes del entrenamiento se verificó una compuerta dura compuesto a compuesto: retirados 71/71, fallos clínicos 10/10 y PASS 304/304 presentes en la matriz de entrenamiento tras la construcción del grafo (`gate_verification.json`). No se documenta uso de RLHF ni DPO, por tratarse de un modelo de clasificación química.

## Capacidades

- Clasificación binaria de preocupación por DILI a partir de la estructura molecular (SMILES): devuelve la probabilidad de pertenecer a la clase tóxica.
- Representación de moléculas como grafos con features atómicas de 35 dimensiones y atención sobre vecinos.
- Cribado de alta sensibilidad orientado a no dejar pasar compuestos problemáticos, con umbral de marcado configurable (por defecto 0.5).
- Lectura dual en pareja con el modelo ExtraTrees: un compuesto marcado por ambos modelos es la señal de mayor preocupación.
- Ejecución agnóstica a CPU/GPU en PyTorch, con dependencias `torch`, `torch_geometric` y `rdkit`.
- Punto de entrada de inferencia `predict(smiles)` en `infer.py`.
- Validación reproducible con `validate.py` y `examples.json` sobre 8 leads cribados de DPP-4 (tolerancia 2e-3; desviación máxima verificada 4,8e-07).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo predictivo de química computacional, no un modelo de lenguaje.

## Casos de uso

- Cribado temprano de DILI en descubrimiento de fármacos: se pasa el SMILES de cada compuesto de una librería interna por `predict(smiles)` y se ordenan por probabilidad para priorizar candidatos con menor preocupación hepática antes de ensayos in vitro.
- Triaje dual con ExtraTrees: se ejecutan ambos modelos de despliegue y se reservan para revisión manual los compuestos marcados por los dos, reduciendo el ruido de un único clasificador de alta sensibilidad.
- Filtrado de librerías comerciales: se puntúan lotes de compuestos candidatos y se descartan los que superan el umbral de 0.5 antes de compra o síntesis, con el coste computacional bajo de una GAT sobre grafos pequeños.
- Priorización de leads en programas de química medicinal: el modelo se aplicó a los leads potentes del programa DPP-4, puntuando 1.110 de 1.113 compuestos del libro de trabajo y marcando el 92,5 %, lo que permite ordenar la cartera por preocupación hepática.
- Auditoría y reproducibilidad regulatoria: el repositorio incluye `absorbed_compounds.csv`, `training_manifest.json` y `gate_verification.json`, lo que permite reconstruir el conjunto de entrenamiento y verificar la cobertura del benchmark regulatorio.
- Integración en pipelines de QSAR internos: al ser un modelo PyTorch con función `predict` y validación incluida, puede envolverse en un servicio de inferencia por lotes que alimente un panel de decisión de química computacional.
- Investigación metodológica en QSAR con grafos: sirve como referencia reproducible de una GAT con receta fija (épocas, peso de clase, umbral) para comparar contra alternativas basadas en descriptores o ensembles de árboles.

## Benchmarks y rendimiento

Las puntuaciones honestas publicadas corresponden únicamente a la versión de benchmark (modelo de la ola bloqueada, con el benchmark regulatorio excluido del entrenamiento y solapamiento verificado a 0; 385 compuestos puntuados). El refit de despliegue absorbió el benchmark regulatorio y nunca se puntúa sobre él.

| Metrica | Valor |
|---|---|
| AUROC regulatorio agrupado | 0,788 |
| Exactitud balanceada agrupada | 0,680 |
| Fármacos retirados detectados | 66/71 |
| Fallos clínicos detectados | 10/10 |
| Compuestos PASS correctos | 128/304 (0,421) |

Este resultado fue el mejor AUROC regulatorio agrupado de todos los brazos del programa hepático, por delante del ensemble externo de Claude limpiado de fuga (0,670). En el cribado de despliegue sobre los leads potentes del programa DPP-4 (marcado = prob ≥ 0,5): 1.110/1.113 leads del libro de trabajo puntuados, 1.027 marcados (92,5 %); 4.891/4.898 de la unión potente completa puntuados, 4.496 marcados (91,9 %). Estos índices de marcado son altos: todos los modelos del programa son cribados de alta sensibilidad y baja especificidad, y la lectura discriminativa es el marcado dual (1.003/1.110 leads marcados por ambos modelos; solo 6 pasan ambos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño de la arquitectura (entrada 35, oculta 128) el modelo es muy pequeño y cabe holgadamente en cualquier GPU consumer, probablemente por debajo de 1 GB de pesos.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA para PyTorch es suficiente. Para lotes grandes, una RTX 4090 o A100 aceleran el proceso, pero no son necesarias.
- Cabe en GPU consumer: sí, en cualquier modelo con soporte PyTorch (por ejemplo, RTX 3060 en adelante) y también en CPU.
- Opciones de despliegue: inferencia directa con PyTorch y `torch_geometric` mediante `infer.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El coste por compuesto es el de una pasada de una GAT pequeña sobre un grafo molecular, dominado por la construcción del grafo con RDKit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delower/liver-gat-deployment | no disponible | no aplica | AUROC regulatorio 0,788 (versión benchmark) | MIT | Hugging Face |
| Delower/liver-extratrees-deployment | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face (pareja de despliegue) |
| Ensemble externo de Claude (limpiado de fuga) | no aplica | no aplica | AUROC regulatorio 0,670 | no disponible | no disponible |

No se dispone de datos de otros modelos QSAR de DILI comparables en la información proporcionada.

## Limitaciones y advertencias

- Las probabilidades son puntuaciones de cribado, no riesgos clínicos calibrados.
- El modelo es de alta sensibilidad y baja especificidad: en el cribado de leads DPP-4 marcó el 92,5 % de los compuestos, por lo que un marcado individual aporta poca información; la lectura útil es el marcado dual con el modelo ExtraTrees.
- El refit de despliegue absorbió el benchmark regulatorio y no debe puntuarse sobre él; las métricas publicadas provienen del modelo de la ola bloqueada, no del artefacto desplegado.
- El conjunto de entrenamiento es pequeño (1.891 compuestos únicos) y específico del programa, lo que limita la generalización a quimiotipos fuera de su dominio.
- Riesgo de sesgo de selección: la composición del conjunto (incluye retirados, fallos clínicos y PASS con etiquetas del benchmark prevaleciendo) puede sobrerrepresentar clases problemáticas.
- No se documentan sesgos demográficos ni de otro tipo, pero tampoco análisis de subgrupos químicos.
- Licencia MIT: permite uso comercial y modificación, con la obligación habitual de conservar el aviso de copyright.
- Dependencias específicas (`torch`, `torch_geometric`, `rdkit`) y checkpoint en formato `model.pt` con estado de optimizador y RNG, no un artefacto limpio de pesos; la reserialización en formato del brazo no pudo completarse en el entorno de construcción.
- No apto para decisiones clínicas ni regulatorias sin validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/liver-gat-deployment
- Modelo pareja ExtraTrees: https://huggingface.co/Delower/liver-extratrees-deployment
