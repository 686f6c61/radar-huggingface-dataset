# kabartay/fintfm-regression

## Resumen

FinTFM (synthetic-only) es un checkpoint de investigación desarrollado por el usuario kabartay, orientado a tareas de regresión tabular mediante un enfoque de representación congelada más un readout ridge por hoja. El modelo no se entrena con datos reales: toda su señal proviene de un prior sintético generado con `--p-regression 1.0`, es decir, cada tarea de entrenamiento es una tarea de regresión sintética. El checkpoint concreto documentado aquí es `v4-binned48_3-control.pt`, de 888.090 parámetros y 3,6 MB, con una cabeza de clasificación por bins (`max_classes 10`) que se usa como representación congelada para regresión.

La relevancia del modelo es metodológica más que práctica: sirve como pieza de un entry de TabArena-Lite (FinTFM-LinProbe con cuatro bolsas de partición) y demuestra que una representación aprendida sobre datos sintéticos mejora sustancialmente frente a un control "raw-only" (689 Elo frente a 537 Elo en la misma configuración). No es un modelo generativo ni un LLM: es un extractor de representaciones de tamaño muy reducido para benchmarking de regresión tabular.

El checkpoint fue entrenado con 48.000 tareas sintéticas (6.000 pasos × batch 8, seed 0) usando `fintfm==0.5.6` en una GPU de Kaggle. La model card indica que el repositorio `kabartay/fintfm-regression` no expone el modelo a la API pública y que la licencia de los pesos queda declarada como Apache-2.0 por decisión del propietario, aunque la propia card señala ambigüedad al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (representación congelada con cabeza de bins; `max_classes 10`) |
| Parametros totales | 888.090 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (decisión del propietario, 2026-11-16); la propia card indica que la licencia de los pesos "no está decidida en esta card" |
| Formato de pesos | `.pt` (PyTorch), 3.595.783 bytes, SHA-256 `31d5b3ef49e89bbe405fc85ab1d746a9fd6c3a1c5282e1770111902cc4af526c` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del extractor de representaciones. Lo que sí se documenta es el esquema de uso: el checkpoint actúa como representación congelada sobre la que se ajusta un readout ridge por hoja (per-leaf ridge), con cuatro bolsas de partición (four partition bags) en el entry de TabArena. La cabeza es una cabeza de bins con `max_classes 10`, que en el experimento original servía como control emparejado del experimento de cuantiles pinball (§148).

El entrenamiento es exclusivamente sintético: `--p-regression 1.0`, 6.000 pasos × batch 8 = 48.000 tareas, seed 0, en GPU de Kaggle con `fintfm==0.5.6` de PyPI (scripts en `scripts/kaggle/task_48_3_binned_control/`). El checkpoint no almacena campo de procedencia (`provenance`) ni commit; el registro lo constituyen el script del kernel y la versión fijada del paquete. No se reporta uso de RLHF, DPO ni datos reales en ninguna fase.

## Capacidades

- Extracción de representaciones congeladas para regresión tabular.
- Soporte de readout ridge por hoja sobre las representaciones extraídas.
- Configuración con cuatro bolsas de partición (bagging) para el entry de TabArena.
- Entrenamiento y evaluación sobre tareas de regresión sintéticas.
- No es un modelo generativo: no produce texto, código ni respuestas en lenguaje natural.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multilingües, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Benchmarking de regresión tabular en TabArena-Lite: el checkpoint se integra como representación congelada en el entry `fintfm_lp_reg_rawpart4_pure_1114`, permitiendo comparar frente a baselines raw-only con una métrica Elo y RMSE por dataset.
- Investigación sobre representaciones aprendidas con datos sintéticos: permite estudiar si un prior sintético puro transfiere a tareas de regresión reales del benchmark, con un control emparejado (`no_rep`) para aislar el efecto de la representación.
- Ablación de tamaño de entrenamiento: el contraste documentado entre 48.000 y 480.000 tareas sintéticas (§233) sirve para estudiar rendimientos decrecientes en la generación de datos sintéticos para regresión.
- Validación de pipelines de extracción de features: al ser un checkpoint pequeño (3,6 MB) y con SHA-256 fijado, es adecuado para verificar reproducibilidad de pipelines de inferencia en CPU.
- Experimentos de bagging y particionado: la configuración de cuatro bolsas permite medir la ganancia de bagging frente a una sola bolsa (582 Elo → 689 Elo en el entry) sobre 13 datasets.
- Estudio de robustez por dataset: los resultados por dataset (airfoil_self_noise, Food_Delivery_Time, QSAR_fish_toxicity, QSAR-TID-11) permiten analizar en qué tipos de tarea la representación aporta y en cuáles no.

## Benchmarks y rendimiento

Evaluación medida en TabArena-Lite regression, repeat 0, fold 0, CPU, 13 datasets:

| Configuracion | Elo | Observaciones |
|---|---|---|
| Una bolsa, checkpoint mixto de referencia | 578 | RMSE más bajo en 8 de 13 datasets frente a 582 |
| Una bolsa, este checkpoint | 582 | Primera sustitución del checkpoint mixto (§227) |
| Entry `fintfm_lp_reg_rawpart4_pure_1114` (cuatro bolsas) | 689 | Mejor que la ejecución de una bolsa en 12 de 13 datasets (sign test p < 0.01, §235) |
| Control raw-only (`no_rep`) | 537 | Representación mejor en 12 de 13 datasets (p = 0.003); RMSE mediano 11,4% menor |

Detalle del control raw-only: la mayor diferencia se da en `airfoil_self_noise`, donde el control raw-only es un 88,6% peor. En `Food_Delivery_Time`, `QSAR_fish_toxicity` y `QSAR-TID-11` las diferencias son inferiores al 1%.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 3.595.783 bytes en disco y tiene 888.090 parámetros.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una GPU de Kaggle y la evaluación reportada se ejecutó en CPU.
- Cabe en cualquier GPU consumer y en CPU; no requiere acelerador dedicado para inferencia.
- Opciones de despliegue: carga directa con PyTorch (`.pt`) y el paquete `fintfm==0.5.6` de PyPI; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinTFM `v4-binned48_3-control.pt` | 888.090 | No disponible | 689 Elo (TabArena-Lite, 4 bolsas) | Apache-2.0 (según propietario) | No público en la API de HF |
| FinTFM `v4-regression.pt` (mixto) | No disponible | No disponible | 578 Elo (1 bolsa) | No disponible | No disponible |
| Control raw-only (`no_rep`) | No aplica | No aplica | 537 Elo | No aplica | No aplica |

No se dispone de información sobre otros modelos comparables de la misma categoría (representaciones congeladas para regresión tabular) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo se entrena exclusivamente con datos sintéticos; no hay evidencia en la card de transferencia a distribuciones reales fuera de los 13 datasets de TabArena-Lite.
- La evaluación se limita a una seed por brazo y un solo fold (repeat 0, fold 0), lo que limita la significancia estadística de las conclusiones.
- Un checkpoint de 480.000 tareas sintéticas no mejoró la regresión frente al de 48.000 (§233), lo que sugiere un techo en la estrategia de escalado sintético.
- El control raw-only rinde mucho peor (537 frente a 689 Elo), pero en tres datasets las diferencias son inferiores al 1%, lo que indica que la ventaja de la representación no es uniforme.
- La licencia de los pesos aparece como Apache-2.0 por decisión del propietario, pero la propia card afirma que "la licencia de los pesos no está decidida en esta card"; existe ambigüedad documental para uso comercial.
- El repositorio no expone el modelo a la API pública de Hugging Face (estado "not public" a 2026-11-15) y el checkpoint original está en una ruta gitignored nunca commiteada.
- El checkpoint no almacena campo de procedencia ni commit; la reproducibilidad depende del script del kernel y de la versión fijada `fintfm==0.5.6`.
- No es un modelo de lenguaje: no debe evaluarse con métricas de generación, razonamiento o código.

## Enlaces

- Hugging Face: https://huggingface.co/kabartay/fintfm-regression
- Paquete PyPI referenciado: `fintfm==0.5.6`
- Scripts de entrenamiento citados: `scripts/kaggle/task_48_3_binned_control/`
- No se han encontrado en la información proporcionada papers, blogs, repositorios públicos ni demos adicionales.
