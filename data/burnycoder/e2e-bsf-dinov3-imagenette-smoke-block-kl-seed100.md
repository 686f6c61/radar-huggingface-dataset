# BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-kl-seed100

## Resumen

El modelo `e2e-bsf-dinov3-imagenette-smoke-block-kl-seed100` es un *sparse autoencoder* (SAE) de tipo block-sparse, denominado por el autor "featurizer" de Grassmann, entrenado desde cero para un clasificador de parches fijo sobre DINOv3 e Imagenette. Lo desarrolla el usuario BurnyCoder y se publica como artefacto de investigación en interpretabilidad de representaciones visuales. No es un modelo generativo ni un clasificador autónomo: es un componente que descompone y reconstruye las activaciones de un backbone DINOv3 ViT-B/16 con el objetivo de obtener características dispersas y, en principio, más interpretables.

La relevancia del artefacto es metodológica: forma parte de un proyecto de *end-to-end block-sparse featurizers* que busca entrenar SAEs de forma conjunta con la tarea final (en este caso, clasificación de 10 clases de Imagenette) en lugar de ajustarlos *post hoc* a las activaciones de un modelo congelado. Se trata, sin embargo, de un artefacto *smoke*: solo se completaron 3 épocas y el propio autor advierte que es una demostración de ingeniería sin valor científico confirmatorio. Con 231.978 parámetros y un tamaño de repositorio de 0,0 GB, es un modelo muy pequeño pensado para validar el pipeline, no para producción.

El modelo base sobre el que opera es `facebook/dinov3-vitb16-pretrain-lvd1689m`, un ViT-B/16 de DINOv3 preentrenado en LVD-1689M. Los pesos de DINOv3 no se incluyen en el repositorio y requieren acceso autorizado y su licencia propia; la licencia MIT declarada cubre únicamente los pesos del SAE y el clasificador entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizer de Grassmann) sobre DINOv3 ViT-B/16 |
| Parametros totales | 231.978 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentación; el modelo opera sobre imágenes) |
| Licencia | MIT (solo pesos del SAE y clasificador; el backbone DINOv3 tiene licencia separada) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El featurizer es un SAE block-sparse entrenado desde cero, con una formulación geométrica de tipo Grassmannian, acoplado a un clasificador de parches fijo sobre DINOv3 ViT-B/16. El objetivo de entrenamiento combina una pérdida KL medida sobre la salida del clasificador de 10 clases (Imagenette) con una penalización de block-sparsity, de modo que las características aprendidas preserven la lectura del clasificador mientras se fuerzan a ser dispersas por bloques. El repositorio incluye `config.json`, que fija revisiones, arquitectura, objetivo, semilla (100), preprocesamiento e identidades de entrenamiento; `manifest.json` y `duplicate_audit.json`, con las asignaciones de imágenes y la evidencia de exclusiones; y `teacher.json`, con la selección del clasificador.

El perfil de entrenamiento es *smoke*: 3 épocas completadas, semilla 100. Las métricas reportadas en la model card son KL en held-out de 5,7524419 nats/imagen, precisión del 14,0000 % y MSE normalizado de parches de 0,9663527. El propio autor subraya que una KL más baja solo mide la preservación de esta lectura de diez clases, y no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia. El checkpoint local de entrenamiento conserva además estado del optimizador y del RNG, pero el `model.safetensors` publicado es solo para inferencia.

## Capacidades

- Extracción de características dispersas por bloques a partir de activaciones de DINOv3 ViT-B/16.
- Reconstrucción de activaciones con una pérdida KL medida sobre un clasificador de 10 clases (Imagenette).
- Clasificación de parches de imagen en las 10 clases de Imagenette mediante el clasificador incluido (`predict` devuelve probabilidades).
- Normalización fija incluida en el artefacto, de modo que el pipeline de preprocesamiento es reproducible.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión general más allá del backbone DINOv3 subyacente; no hay capacidades de audio ni de modo *thinking*.
- Capacidad multilingüe: no aplica; el artefacto es de visión y su documentación está en inglés.

## Casos de uso

- Investigación en interpretabilidad de representaciones visuales: usar el SAE para descomponer activaciones de DINOv3 y estudiar qué direcciones o bloques se activan ante distintos parches de imagen, con la ventaja de que el featurizer se entrena conjuntamente con la tarea de clasificación.
- Validación de pipelines de SAE *end-to-end*: servir como artefacto de referencia para comprobar que un entorno (`uv sync --frozen`, `hf download`, `VisionFeaturizer`) reproduce las métricas declaradas antes de escalar a entrenamientos completos.
- Reproducibilidad de experimentos: los ficheros `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json` permiten auditar la asignación de imágenes, las exclusiones y la selección del clasificador en un estudio comparativo de semillas.
- Docencia y demostración de block-sparsity: mostrar en un cuaderno cómo una penalización de bloques afecta a la reconstrucción y a la precisión de un clasificador de 10 clases con un coste computacional mínimo.
- Análisis de fidelidad de SAEs: comparar la KL held-out (5,7524 nats/imagen) y el MSE normalizado de parches (0,9664) frente a variantes con otras semillas o perfiles de entrenamiento para estudiar la varianza del método.
- Prototipado de clasificadores de parches sobre DINOv3: reutilizar el clasificador incluido como línea base de 10 clases en Imagenette para experimentos de *probing* sobre el backbone.
- Integración en pipelines de análisis de imágenes por parches: dado que el artefacto excluye los pesos de DINOv3, requiere acceso autorizado al backbone, por lo que su uso práctico queda restringido a entornos de investigación con dicha autorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas del artefacto *smoke*:

| Metrica | Valor |
|---|---|
| KL en held-out | 5,7524419 nats/imagen |
| Precision (10 clases, Imagenette) | 14,0000 % |
| MSE normalizado de parches | 0,9663527 |
| Epocas completadas | 3 |

No se proporcionan comparaciones con otros SAEs ni con el clasificador de referencia sin featurizer, por lo que estos valores no permiten establecer una comparación de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja para el SAE (231.978 parámetros, menos de 1 MB en fp32); el grueso del coste recae en el backbone DINOv3 ViT-B/16, que no se incluye en el repositorio y debe cargarse aparte.
- GPU recomendadas: cualquier GPU con suficiente memoria para DINOv3 ViT-B/16 (por ejemplo, RTX 3090, RTX 4090, A100, H100); el SAE en sí cabe en CPU.
- Cabe en GPU de consumo: sí, siempre que se disponga de memoria para el backbone ViT-B/16; el SAE no es el cuello de botella.
- Opciones de despliegue: el proyecto oficial usa `uv sync --frozen` y la clase `VisionFeaturizer` de `e2e_bsf.inference`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros SAEs comparables ni resultados de referencia frente a los que situar este artefacto. Como referencias metodológicas del proyecto se citan el paper de BSF (arXiv:2606.25234) y el de SAE end-to-end (arXiv:2405.12241), pero no se aportan métricas comparativas.

## Limitaciones y advertencias

- Artefacto *smoke*: solo 3 épocas completadas; el autor declara explícitamente que es una demostración de ingeniería sin valor científico confirmatorio.
- La precisión del 14,0000 % sobre 10 clases está muy por encima del azar (10 %) pero es insuficiente para cualquier uso práctico de clasificación.
- La KL baja solo mide la preservación de la lectura de diez clases del clasificador fijo; no implica conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El repositorio excluye los pesos de DINOv3 y las imágenes; se requiere acceso autorizado al backbone y su licencia separada. La licencia MIT no relicencia el backbone.
- El orden de clases sigue el de torchvision Imagenette; cualquier uso debe respetar ese orden para interpretar las probabilidades.
- No hay datos sobre sesgos, riesgo de alucinación (no genera texto) ni comportamiento multilingüe; el artefacto es específico de visión y de un conjunto de 10 clases.
- Uso comercial: la licencia MIT cubre los pesos publicados, pero el uso del backbone DINOv3 queda sujeto a su propia licencia, lo que condiciona cualquier despliegue en producción.
- El checkpoint de entrenamiento local (con estado de optimizador y RNG) no se publica; solo se distribuye `model.safetensors` para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-kl-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE end-to-end: https://arxiv.org/abs/2405.12241
- Código de Goodfire (block-sparse featurizer): https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
