# ArGoN1/sc-save

## Resumen

SAVE (Single-cell generation with Gene Block Attention) es un modelo generativo para datos de secuenciación de ARN de célula única (scRNA-seq), desarrollado por el grupo del autor ArGoN1 y presentado en ICLR 2026 (arXiv:2604.16776). Resuelve el problema de generar perfiles de expresión génica condicionados a múltiples covariables (tipo celular, lote, estadio de enfermedad, etc.) sobre los aproximadamente 20.000 genes desordenados que caracterizan una célula, un escenario donde los transformers estándar sufren un cuello de botella de atención de orden O(G²).

La innovación central es la atención por bloques génicos (Gene Block Attention): agrupa los genes en bloques coherentes a nivel de ruta biológica mediante transporte óptimo sobre embeddings semánticos derivados de GenePT, reduciendo la complejidad de la autoatención de O(G²) a O(L²) y logrando una aceleración de entrenamiento de 191× (de 2.391,2 min a 12,5 min en una RTX 3090). Sobre esa representación se entrena un VAE de atención por bloques y un denoiser DiT de flow matching con transporte óptimo condicional.

El modelo se distribuye como el paquete `sc-save` (v0.2.0) en PyPI, con checkpoints autocontenidos por dataset (heart, pbmc, lung_atlas, lung_cancer, pbmc_ifn) en formato de bundle PyTorch y licencia MIT. Cubre generación condicional, corrección de efecto de lote zero-shot y predicción de perturbaciones contrafactuales en un único marco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con Gene Block Attention + DiT con flow matching de transporte óptimo condicional |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; opera sobre perfiles de ~20.000 genes agrupados en L bloques (K=3200 por defecto, K=400 para perturbación/BEC) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de condiciones y metadatos en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`vae.pt`, `fm.pt`) junto con `config.json`, `vocab.json`, `metadata.json`, `scaler.npz` |

## Arquitectura y entrenamiento

SAVE es un modelo generativo en dos etapas. La primera es un VAE con atención por bloques génicos que comprime perfiles estructurados por bloques en latentes estructurados por rutas z ∈ R^(N×L×d). Los genes se particionan en L bloques equilibrados y coherentes con rutas mediante clustering iterativo por transporte óptimo sobre embeddings GenePT de 1.536 dimensiones, construidos a partir de resúmenes funcionales curados de NCBI Gene. La segunda etapa es un denoiser DiT condicional de flow matching con transporte óptimo, que emplea AdaLN, enmascaramiento independiente de condiciones con p=0,6 y Classifier-Free Guidance multicondición, muestreado en 20 pasos de ODE.

El entrenamiento se realiza sobre ficheros `.h5ad` del usuario y requiere los embeddings GenePT (Zenodo 10833191). La model card no detalla el número total de tokens de entrenamiento ni la composición exacta de los datasets más allá de los atlas de referencia (Human Heart Atlas, Human PBMC, Human Lung Atlas, Lung Cancer Atlas, PBMC IFN-β). La innovación técnica destacable es la reducción de la complejidad de atención de O(G²) a O(L²), que hace viable el entrenamiento en una única GPU de consumo.

## Capacidades

- Generación condicional de perfiles de expresión de célula única con 1 a 5 covariables, incluidas combinaciones de covariables no vistas durante el entrenamiento.
- Corrección de efecto de lote zero-shot evaluada con métricas scIB sobre AnnData externo.
- Predicción de perturbaciones contrafactuales mediante validación leave-one-out.
- Muestreo con flow matching de transporte óptimo en 20 pasos de ODE y Classifier-Free Guidance configurable (`guidance_weight`).
- Inspección de pesos de atención modulados por condición (`generate_with_attention`).
- Transferencia de condición sobre datos externos con escalado inverso y recorte de padding (`transfer`).
- Integración con el ecosistema Python de biología computacional: `anndata`, `scanpy`, `huggingface_hub`.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso en el sentido de los LLM; es un modelo especializado en datos biológicos.

## Casos de uso

- Aumento de datos en estudios de célula única: generar cientos o miles de células sintéticas por condición (`n_cells=500`) para equilibrar cohortes escasas antes de un análisis diferencial, aprovechando la coherencia de rutas que impone la partición en bloques génicos.
- Corrección de efecto de lote en pipelines de integración: aplicar `model.transfer` sobre un `.h5ad` externo para armonizar lotes sin reentrenar, con validación mediante métricas scIB, como alternativa a métodos de integración clásicos.
- Predicción de respuesta a perturbaciones: usar el bundle `pbmc_ifn` (K=400) para estimar el perfil transcripcional bajo IFN-β en tipos celulares no observados mediante validación leave-one-out, útil en cribado virtual de estímulos.
- Modelado de progresión de enfermedad: el bundle `lung_cancer` con cinco covariables (incluido `uicc_stage`) permite generar células en estadios tumorales concretos para estudiar transiciones de estado.
- Análisis de atlas multi-tejido: los bundles `heart`, `pbmc` y `lung_atlas` permiten generar poblaciones condicionadas por lote y tipo celular para explorar composiciones celulares hipotéticas.
- Interpretabilidad biológica: `generate_with_attention` expone los pesos de atención por bloque génico, lo que permite identificar qué rutas modulan la respuesta a una condición concreta.
- Docencia y reproducción científica: el notebook de Colab de reproducción ICLR 2026 y el tutorial de inicio rápido permiten replicar los resultados en GPU gratuita.

## Benchmarks y rendimiento

La model card indica que `sc-save v0.2.0` superó las 10/10 pruebas primarias de validación de ICLR 2026 con cero regresiones en la puerta de control, según `iclr2026_v2_colab_validation.json`. Las métricas declaradas son distancia de Wasserstein, MMD, Pearson r, R² y scIB. Sin embargo, no se proporcionan los valores numéricos concretos por benchmark en la información disponible.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| Validación ICLR 2026 (10 pruebas primarias) | 10/10 superadas, cero regresiones | no disponible |
| Aceleración de entrenamiento (1× RTX 3090) | 191× (2.391,2 min → 12,5 min) | no disponible |
| Wasserstein / MMD / Pearson r / R² / scIB | valores numéricos no disponibles | no disponible |

No se han publicado resultados de benchmarks numéricos detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el tamaño de los checkpoints no se especifica.
- GPU recomendadas: no se indican modelos concretos; la validación se realizó en Google Colab y el benchmark de velocidad en una RTX 3090.
- Cabe en GPU de consumo: sí, el entrenamiento completo se ejecutó en una única RTX 3090 según el dato de aceleración.
- Opciones de despliegue: paquete Python `sc-save` (PyPI) con `SAVE.load(..., device="auto")`; sin soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un LLM.
- Latencia y throughput: no disponibles; el muestreo emplea 20 pasos de ODE, lo que acota el coste de inferencia por lote.

## Comparativa con modelos similares

| Modelo | Enfoque | Contexto / genes | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAVE (`sc-save`) | VAE + DiT flow matching con Gene Block Attention | ~20.000 genes en L bloques (K=3200 / K=400) | MIT | PyPI, Hugging Face, GitHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre atlas concretos (heart, pbmc, lung), puede heredar sesgos de composición y de anotación de esos datasets.
- Riesgo de alucinación: como modelo generativo, puede producir perfiles de expresión biológicamente plausibles pero falsos; requiere validación experimental antes de cualquier conclusión biológica.
- Limitaciones de contexto o idioma: las etiquetas de condición y metadatos están en inglés; el vocabulario de condiciones está fijado por `vocab.json` de cada bundle, por lo que condiciones no presentes no pueden especificarse.
- Restricciones de licencia: MIT permite uso comercial, pero los datos de entrenamiento subyacentes (atlas públicos) pueden tener sus propias condiciones de uso que el usuario debe verificar.
- Caveats para producción: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún nula; la versión es 0.2.0 y la API puede cambiar. El entrenamiento desde cero exige descargar embeddings GenePT de Zenodo y ficheros `.h5ad` compatibles.
- La partición en bloques depende del tamaño K elegido; usar K=3200 en datos de perturbación puede degradar la coherencia de rutas, de ahí el K=400 recomendado para esos casos.

## Enlaces

- Hugging Face: https://huggingface.co/ArGoN1/sc-save
- Página del proyecto: https://save.argonx.dev
- Repositorio GitHub: https://github.com/fdu-wangfeilab/sc-save
- Paquete PyPI: https://pypi.org/project/sc-save/
- Paper (OpenReview): https://openreview.net/forum?id=l7QEoK4uDP
- Paper (arXiv): https://arxiv.org/abs/2604.16776
- Demo interactiva: https://huggingface.co/spaces/ArGoN1/sc-save-demo
- Notebook de reproducción ICLR 2026: https://colab.research.google.com/github/fdu-wangfeilab/sc-save/blob/main/notebooks/SAVE_ICLR2026_Reproduce_Colab.ipynb
- Tutorial de inicio rápido: https://colab.research.google.com/github/fdu-wangfeilab/sc-save/blob/main/notebooks/SAVE_Quickstart_Tutorial.ipynb
- Embeddings GenePT (Zenodo): https://zenodo.org/records/10833191
- Resultados de validación: https://github.com/fdu-wangfeilab/sc-save/blob/main/results/iclr2026_v2_colab_validation.json
