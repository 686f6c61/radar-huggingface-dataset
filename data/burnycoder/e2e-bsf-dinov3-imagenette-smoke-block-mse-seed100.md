# BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-mse-seed100

## Resumen

`BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-mse-seed100` es un sparse autoencoder de bloques (block-sparse featurizer, BSF) entrenado desde cero sobre las representaciones de un clasificador de parches DINOv3/Imagenette congelado. Lo desarrolla el usuario independiente BurnyCoder dentro del proyecto end-to-end block-sparse featurizers, cuyo objetivo es estudiar la interpretabilidad de las activaciones de un backbone ViT mediante diccionarios dispersos estructurados en bloques en lugar de neuronas individuales.

El artefacto es un perfil "smoke": solo se completaron 3 epocas de entrenamiento y el propio autor lo describe como una demostracion de ingenieria sin valor cientifico confirmatorio. Con 231.978 parametros totales, no es un modelo generativo ni un clasificador autonomo, sino un componente de analisis que reproduce el readout de diez clases de Imagenette a partir de parches de imagen procesados por DINOv3 ViT-B/16.

Su relevancia es metodologica: sirve como referencia reproducible de un pipeline completo (normalizacion fija, clasificador entrenado, auditoria de duplicados y preregistro) para quien investigue sparse autoencoders aplicados a vision. No debe confundirse con un modelo de vision de proposito general: los pesos de DINOv3 no se incluyen y su licencia es separada de la MIT del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder de bloques (block-sparse featurizer) sobre representaciones de DINOv3 ViT-B/16 |
| Parametros totales | 231.978 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre parches de imagen, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT (no cubre los pesos del backbone DINOv3, que requieren acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (inferencia); el checkpoint de entrenamiento local conserva estado de optimizador y RNG |

## Arquitectura y entrenamiento

El modelo es un featurizer disperso en bloques que se entrena desde cero para un clasificador de parches DINOv3/Imagenette fijo. La variante corresponde al objetivo `block_mse` con semilla 100: se optimiza un error cuadratico medio sobre bloques de caracteristicas, buscando que la representacion dispersa reconstruya la salida del clasificador congelado. El repositorio incluye normalizacion fija y el clasificador entrenado, pero excluye explicitamente los pesos de DINOv3 y las fotografias de Imagenette.

El entrenamiento se limita al perfil "smoke" con 3 epocas completadas. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset mas alla de Imagenette, ni si se aplicaron tecnicas de RLHF o DPO (no procede en este tipo de modelo). La innovacion tecnica principal es la dispersion estructurada por bloques (block sparsity) frente a la dispersion por neuronas de los SAE clasicos, junto con un pipeline de trazabilidad que liga revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento en `config.json`, y conserva asignaciones de imagenes y evidencia de exclusion en `manifest.json` y `duplicate_audit.json`.

## Capacidades

- Extraccion de caracteristicas dispersas en bloques a partir de parches de imagen procesados por DINOv3 ViT-B/16.
- Prediccion de probabilidades sobre las diez clases de Imagenette mediante el clasificador entrenado incluido en el artefacto.
- Reproduccion del readout del clasificador fijo, medida mediante divergencia KL en el conjunto de validacion.
- Trazabilidad de entrenamiento: `config.json` vincula revisiones y parametros, `teacher.json` registra la seleccion del clasificador y los ficheros de auditoria documentan asignaciones y exclusiones de imagenes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de modo de pensamiento (thinking mode), vision generativa, audio u otras modalidades.
- No proporciona aceleracion de inferencia: el autor advierte que una KL mas baja solo mide la preservacion del readout de diez clases, no fidelidad semantica completa ni velocidad.

## Casos de uso

- Investigacion en interpretabilidad de ViT: usar el featurizer para estudiar si la dispersion por bloques agrupa activaciones coherentes en el espacio de parches de DINOv3, comparando con SAE de dispersion por neuronas.
- Reproduccion de experimentos: el pipeline con `uv sync --frozen`, `hf download` y `VisionFeaturizer` permite replicar el smoke run con semilla 100 y verificar las metricas publicadas.
- Docencia y formacion: ejemplo minimo y completo de un flujo end-to-end de entrenamiento de un SAE sobre un backbone congelado, con preregistro y auditoria de duplicados incluidos.
- Validacion de infraestructura de evaluacion: sirve como caso de prueba para verificar que un harness de evaluacion calcula correctamente KL, accuracy y MSE normalizado de parches antes de lanzar runs de mayor escala.
- Auditoria de datasets: los ficheros `manifest.json` y `duplicate_audit.json` pueden reutilizarse como plantilla para documentar particiones y exclusiones de imagenes en otros proyectos.
- Analisis de preservacion de readout: medir cuanto del comportamiento del clasificador de diez clases se conserva al sustituir la representacion original por la representacion dispersa, como paso previo a estudios de fidelidad semantica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL en held-out | 5.8680463 nats/imagen |
| Accuracy | 10.0000% |
| MSE normalizado de parches | 0.96102929 |
| Epocas completadas | 3 (perfil smoke) |

No se han publicado resultados comparativos frente a otros SAE o featurizers en la informacion disponible. El autor indica que estos numeros corresponden a un artefacto de demostracion y no sustentan ninguna afirmacion cientifica confirmatoria; una accuracy del 10% equivale al azar en un problema de diez clases.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos del featurizer (231.978 parametros); el consumo dominante proviene del backbone DINOv3 ViT-B/16, que debe cargarse por separado y no se distribuye con el repositorio.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM es suficiente para el backbone ViT-B/16 en FP16; para lotes grandes se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, incluyendo GTX 1660, RTX 3060 y superiores, siempre que se disponga de acceso autorizado a los pesos de DINOv3.
- Opciones de despliegue: el proyecto oficial usa `uv sync --frozen` y la clase `VisionFeaturizer` de `e2e_bsf.inference`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BSF DINOv3 Imagenette smoke) | 231.978 | no aplica | KL 5.868 nats/imagen; accuracy 10%; MSE 0.961 | MIT (backbone aparte) | HuggingFace, 36 descargas |
| Goodfire block-sparse-featurizer | no disponible | no disponible | no disponible | no disponible | GitHub publico |
| SAE end-to-end (paper arXiv 2405.12241) | no disponible | no disponible | no disponible | no disponible | Publicacion academica |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Artefacto smoke con solo 3 epocas: no constituye evidencia cientifica y sus metricas no deben extrapolarse a configuraciones completas.
- La accuracy del 10% equivale al azar en diez clases; el modelo no es util como clasificador en produccion.
- La KL mide unicamente la preservacion del readout de diez clases, no fidelidad semantica ni conceptos interpretables.
- No aporta aceleracion de inferencia, pese a que la dispersion podria sugerirlo.
- Los pesos de DINOv3 no se incluyen: se requiere acceso autorizado y aceptar su licencia separada, que la MIT del repositorio no sustituye.
- El repositorio no incluye imagenes de Imagenette; el orden de clases sigue torchvision Imagenette y cualquier desviacion invalida las predicciones.
- Entrenado exclusivamente en el dominio de Imagenette en ingles: no hay garantia de generalizacion a otros datasets, idiomas o modalidades.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de sobreinterpretacion de las caracteristicas dispersas como conceptos semanticos.
- No se documentan sesgos especificos; al derivar de un backbone y un dataset concretos, hereda los sesgos de ambos.
- Uso comercial permitido por la MIT del artefacto, sujeto en todo caso a los terminos del backbone DINOv3.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-block-mse-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE end-to-end: https://arxiv.org/abs/2405.12241
- Codigo de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
