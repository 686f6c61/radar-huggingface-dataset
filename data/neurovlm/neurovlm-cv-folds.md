# neurovlm/NeuroVLM-cv-folds

## Resumen

NeuroVLM-cv-folds es un repositorio de checkpoints que contiene los pesos de la validación cruzada de 5 particiones (5-fold) del modelo NeuroVLM, un framework generativo de visión-lenguaje orientado a neuroimagen humana desarrollado por el grupo neurovlm (vinculado a la Universidad de California en San Diego, según los dominios neurovlm.ucsd.edu). No se trata de un modelo de lenguaje generalista, sino de los artefactos de entrenamiento (autoencoder convolucional y cabezas de proyección) de la etapa 20 del pipeline, correspondiente al experimento de validación cruzada sobre PubMed.

El repositorio desglosa el entrenamiento en cinco particiones construidas con `KFold(n_splits=5, shuffle=True, random_state=0)` sobre 29.868 estudios de PubMed con un máximo de 100 coordenadas de activación. Para cada partición k se entrenan el autoencoder, la cabeza text-to-brain y dos cabezas InfoNCE sobre las otras cuatro particiones, dejando la partición k como conjunto de retención (held-out). Los checkpoints son, por tanto, material de evaluación y reproducibilidad, no un modelo listo para inferencia conversacional.

Su relevancia radica en que documenta la revisión 2026-10 del artículo NeuroVLM: el autor declara entrenamiento determinista (mismos pesos byte a byte en dos ejecuciones con el mismo modelo de GPU, driver y versiones de librerías), con hashes SHA-256 publicados para cada fichero. El repositorio ocupa 1,2 GB y el fichero mayor (cada autoencoder) es de 239,7 MB, lo que da una idea del orden de magnitud del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional (`NeuroAutoEncoder(seed=0, out="logit")`) mas cabezas de proyeccion `ProjHead`; el framework global es un modelo de vision-lenguaje con objetivos contrastivos (InfoNCE) y de regresion (MSE) |
| Parametros totales | no disponible (no se declara el recuento; el fichero mayor pesa 239,7 MB y las cabezas entre 1,2 MB y 2,4 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se especifica la precision) |
| Idiomas soportados | no disponible (los datos de entrenamiento son estudios PubMed; el idioma de la model card es ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio agrupa cuatro tipos de modulo por particion: `autoencoder_kfold-{k}.safetensors` con un `NeuroAutoEncoder(seed=0, out="logit")` de 239,7 MB; `proj_head_text_mse_kfold-{k}.safetensors` y `proj_head_text_infonce_kfold-{k}.safetensors`, ambos con arquitectura `ProjHead(768, 512, 384)` y 2,4 MB por fold; y `proj_head_image_infonce_kfold-{k}.safetensors`, con `ProjHead(384, 384, 384)` y 1,2 MB. El uso previsto es cargar los pesos con `load_file` de `safetensors` y asignarlos mediante `load_state_dict` a la clase correspondiente de la libreria `neurovlm`.

El entrenamiento sigue la logica de validacion cruzada: la particion k sirve de retencion y el modelo se entrena sobre las otras cuatro. El objetivo combina un termino de error cuadratico medio (cabeza text-to-brain) con objetivos contrastivos InfoNCE, uno sobre pares texto-cerebro y otro sobre pares imagen-cerebro. El articulo original describe NeuroVLM como un framework generativo de vision-lenguaje entrenado sobre 30.826 pares neuroimagen-texto (frente a los 29.868 estudios con un maximo de 100 coordenadas usados en esta validacion cruzada). La innovacion declarada en esta revision es el determinismo: cada etapa usa data loaders con semilla y kernels deterministicos, y los hashes SHA-256 publicados permiten verificar la reproducibilidad byte a byte.

## Capacidades

- Aprendizaje de representaciones conjuntas de texto e imagen cerebral: el autoencoder y las cabezas InfoNCE permiten proyectar descripciones en ingles y mapas de activacion a un espacio latente compartido.
- Prediccion texto-a-cerebro: la cabeza `proj_head_text_mse` genera un mapa de activacion cerebral a partir de texto.
- Recuperacion cruzada (cross-modal retrieval) texto-imagen cerebral: las cabezas InfoNCE estan disenadas para alinear pares y permitir busqueda o recuperacion entre modalidades.
- Codificacion y reconstruccion de mapas cerebrales: el autoencoder (`out="logit"`) reconstruye y comprime representaciones de activacion.
- Evaluacion por validacion cruzada: cada checkpoint corresponde a un fold, lo que permite estimar la generalizacion del modelo a estudios no vistos.
- No es un modelo conversacional: no se documentan capacidades de generacion de texto libre, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion de generalizacion en neuroimagen: cargar los cinco folds y puntuarlos con `scripts/pipeline/validate_models.py --components cv` para obtener una estimacion robusta de la capacidad del modelo sobre estudios PubMed no vistos durante el entrenamiento.
- Meta-analisis automatizado de literatura: usar la cabeza text-to-brain para mapear resumenes o fragmentos de articulos a mapas de activacion esperados, complementando enfoques tipo NeuroSynth sobre corpus grandes.
- Recuperacion de estudios por patron cerebral: emplear la cabeza `proj_head_image_infonce` para indexar mapas de activacion y recuperar articulos cuyo patron sea similar al de una consulta dada.
- Reproducibilidad de pipelines cientificos: los hashes SHA-256 y el registro de reproducibilidad determinista permiten auditar y replicar resultados de un articulo, algo critico en neurociencia computacional.
- Desarrollo de herramientas downstream: los pesos congelados de la validacion cruzada sirven como extractor de caracteristicas para clasificacion de estados cognitivos o para inicializar modelos mas especificos.
- Comparacion de estrategias de validacion: los checkpoints por fold permiten estudiar la varianza entre particiones y detectar dependencias del split, util para disenar protocolos de evaluacion mas justos.
- Docencia y formacion: el tamano pequeno de los ficheros (1,2 GB el repositorio completo) facilita su uso en entornos academicos sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `scripts/pipeline/validate_models.py --components cv` para puntuar los checkpoints, pero no incluye cifras de rendimiento (ni MMLU, ni HumanEval, ni metricas de recuperacion como Recall@k). Tampoco se detallan metricas de reconstruccion del autoencoder ni valores de perdida InfoNCE por fold.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. El fichero mayor es un autoencoder de 239,7 MB y las cabezas no superan 2,4 MB, por lo que la inferencia cabe comodamente en cualquier GPU con 4 GB de VRAM, e incluso en CPU para evaluaciones puntuales.
- GPU recomendadas: cualquier GPU moderna es suficiente; por el tamano, una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutar la inferencia. No se requiere A100 ni H100 salvo para reentrenar el pipeline completo.
- Cabe en GPU de consumo: si, sin reservas apreciables de VRAM dadas las dimensiones de los checkpoints.
- Opciones de despliegue: descarga via `huggingface_hub.hf_hub_download` y carga con `safetensors.torch.load_file`; la libreria `neurovlm` proporciona las clases `NeuroAutoEncoder` y `ProjHead`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, ni datos de rendimiento de NeuroVLM frente a alternativas como BrainLM u otros modelos de neuroimagen. No procede inventar comparaciones.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si permite uso comercial, por lo que cualquier despliegue en produccion requiere contactar con los autores o consultar el repositorio GitHub y el articulo.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar la calidad de las predicciones texto-a-cerebro ni de la recuperacion cross-modal.
- Naturaleza de los checkpoints: son pesos de validacion cruzada sobre PubMed, no un modelo entrenado para produccion; estan pensados para evaluacion y reproducibilidad dentro de un pipeline especifico.
- Dominio restringido: el entrenamiento se limita a estudios de PubMed con un maximo de 100 coordenadas de activacion, lo que excluye mapas mas densos o fuentes fuera de ese corpus.
- Idiomas: no se declaran idiomas soportados; los datos de origen son publicaciones en ingles, y no hay evidencia de comportamiento en castellano u otras lenguas.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al tratarse de un modelo que genera mapas de activacion, la prediccion sobre textos fuera de dominio puede producir representaciones plausibles pero incorrectas, sin que existan metricas publicadas de calibracion.
- Dependencia de entorno: el autor afirma determinismo byte a byte, pero condicionado al mismo modelo de GPU, driver y versiones de librerias, de modo que la reproducibilidad puede romperse en entornos distintos.
- Tamano de repo: 1,2 GB con 20 ficheros safetensors; la descarga y gestion de los cinco folds debe automatizarse para evitar errores manuales.

## Enlaces

- HuggingFace: https://huggingface.co/neurovlm/NeuroVLM-cv-folds
- Repositorio GitHub: https://github.com/neurovlm/neurovlm
- Documentacion en GitHub: https://github.com/neurovlm/neurovlm/tree/main/docs
- Pagina del proyecto: https://neurovlm.github.io/neurovlm/
- Sitio institucional (UCSD): https://neurovlm.ucsd.edu/
- Articulo en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.02.06.704508v3
