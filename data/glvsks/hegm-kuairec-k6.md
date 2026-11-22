# glvsks/HEGM-KuaiRec-K6

## Resumen

HEGM (Hierarchical Exponential-Gaussian Mixtures) es un modelo de prediccion de distribucion de tiempo de visualizacion (watch-time) para sistemas de recomendacion de video corto. Lo desarrolla el autor identificado como `glvsks` y se publica como checkpoint preentrenado sobre el conjunto de datos KuaiRec (release big-matrix) con 6 componentes de mezcla gaussiana. No es un modelo de lenguaje: es un modelo predictivo especializado en estimar la distribucion del tiempo que un usuario vera un video, combinando una componente exponencial que captura los saltos rapidos (skips) con una mezcla gaussiana que modela el visionado comprometido, unidas mediante una compuerta de skip aprendida.

El modelo resuelve un problema concreto en recomendacion: los sistemas clasicos predicen un valor puntual de watch-time, mientras que HEGM predice la distribucion completa, lo que permite ordenar candidatos con mayor informacion y estimar incertidumbre. Es relevante para equipos que trabajan en ranking de feeds de video corto y quieren ir mas alla de la regresion puntual.

El checkpoint se distribuye como fichero PyTorch Lightning (`last.ckpt`) acompanado de su `config.yaml`, con licencia Apache 2.0. No es cargable con `transformers.AutoModel` y requiere la implementacion oficial del repositorio de GitHub para su evaluacion e inferencia. El tamano del repositorio es de 0.0 GB segun los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla jerarquica exponencial-gaussiana (HEGM) con compuerta de skip aprendida; implementacion en PyTorch Lightning |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia de texto; opera sobre features de recomendacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch Lightning (`last.ckpt`) + `config.yaml`; no compatible con `transformers` |

## Arquitectura y entrenamiento

HEGM modela el watch-time como una mezcla de distribuciones: una componente exponencial que representa los abandonos rapidos (skips) y una mezcla de 6 componentes gaussianas que representa el visionado con engagement. Una compuerta de skip aprendida combina ambas partes de forma jerarquica, de modo que la prediccion final es una distribucion completa y no un escalar. La implementacion esta en PyTorch Lightning y el checkpoint se entrena sobre el release big-matrix de KuaiRec.

El entrenamiento se realiza con la configuracion `kuairec_k6.yaml` del repositorio oficial, que fija 6 componentes gaussianas. No se dispone en la informacion proporcionada del numero de tokens, composicion del dataset ni de si se aplicaron tecnicas de RLHF/DPO (no aplicables en este dominio). La reproducibilidad requiere descargar los splits procesados publicados por el repositorio (`scripts/download_artifacts.py --splits`), incluido `meta.json`.

## Capacidades

- Prediccion de la distribucion de watch-time para pares usuario-video en recomendacion de video corto.
- Modelado explicito de dos regimenes de comportamiento: skip rapido (componente exponencial) y visionado comprometido (mezcla gaussiana).
- Estimacion de incertidumbre mediante la distribucion completa, util para ranking y exploracion.
- Evaluacion con metricas de regresion (MSE, MAE) y de ranking (XAUC).
- Integracion en pipelines de PyTorch/PyTorch Lightning.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Ranking de feeds de video corto: usar la distribucion predicha de watch-time para ordenar candidatos con criterios que tengan en cuenta la incertidumbre, no solo la media.
- Estimacion de skip temprano: la componente exponencial permite identificar contenido con alta probabilidad de abandono inmediato y filtrarlo antes de la fase de ranking.
- Optimizacion de politicas de recomendacion: la distribucion completa sirve como senal de recompensa en aprendizaje por refuerzo o en bandits contextuales.
- Analisis offline de contenido: comparar la forma de la distribucion predicha entre videos para detectar patrones de engagement y ajustar la produccion.
- Investigacion en sistemas de recomendacion: referencia reproducible sobre KuaiRec para comparar metodos de prediccion distribucional frente a regresion puntual.
- Monitorizacion de calidad del recomendador: detectar deriva comparando la distribucion predicha con el watch-time observado en produccion.
- Segmentacion de usuarios por comportamiento: agrupar usuarios segun la proporcion de skips frente a visionado comprometido que predice el modelo.

## Benchmarks y rendimiento

Resultados del checkpoint en el split de test publicado, segun el repositorio oficial:

| Metrica | Valor |
|---|---|
| MSE (sec²) | 59.3619 |
| MAE (sec) | 4.5056 |
| XAUC | 0.5600 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre las mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del checkpoint no se detalla en la informacion proporcionada (el repositorio figura como 0.0 GB).
- GPU recomendadas: no disponible; al ser un modelo tabular/MLP sobre features de KuaiRec, es probable que quepa en GPU consumer, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia mediante el repositorio oficial de HEGM (`evaluate.py`) con PyTorch Lightning; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de modelos alternativos de prediccion distribucional de watch-time sobre KuaiRec con los que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Es un modelo especializado en recomendacion de video corto sobre KuaiRec; no es un modelo de lenguaje ni un modelo generativo general.
- El checkpoint esta entrenado sobre un unico dataset (KuaiRec big-matrix); su transferencia a otros dominios o plataformas no esta validada.
- XAUC de 0.5600 indica una capacidad de ranking moderada; conviene validar en el contexto de produccion antes de desplegar.
- Requiere los splits procesados y `meta.json` del repositorio oficial; no es cargable con `transformers`.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (no aplicable) ni limitaciones de idioma.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion correspondiente.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/glvsks/HEGM-KuaiRec-K6
- Paper: https://arxiv.org/abs/2608.23356
- Repositorio de codigo: https://github.com/rw404/HEGM
- Configuracion del experimento: https://github.com/rw404/HEGM/blob/main/configs/kuairec_k6.yaml
- Resultados oficiales: https://github.com/rw404/HEGM#results
