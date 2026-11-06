# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed103

## Resumen

`BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed103` es un sparse autoencoder (SAE) de tipo block-sparse entrenado desde cero sobre las activaciones de un clasificador de parches DINOv3/Imagenette. No es un modelo generativo ni un modelo de lenguaje: es un artefacto de interpretabilidad que descompone representaciones internas de un backbone visual en caracteristicas dispersas y medibles. Lo desarrolla el usuario independiente BurnyCoder dentro de un estudio preregistrado sobre featurizers block-sparse de extremo a extremo.

El modelo se apoya en `facebook/dinov3-vitb16-pretrain-lvd1689m` como backbone congelado y anade un featurizer de 9.599.498 parametros (segun los pesos en safetensors) que se entrena junto con un clasificador de diez clases de Imagenette. La variante corresponde al perfil `full`, semilla 103, con una sola epoca completada y objetivo de error cuadratico medio (MSE) sobre bloques. El interes actual reside en que forma parte de una comparacion preregistrada entre objetivos de entrenamiento (MSE local frente a KL) para evaluar si la esparsidad por bloques preserva la fidelidad del clasificador original.

La relevancia es metodologica: el autor publica metricas held-out, intervalos de confianza a nivel de semilla y artefactos de auditoria (asignaciones de imagenes, evidencia de exclusion de duplicados). El resultado del estudio es explicito: la diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen con un intervalo del 95 % de [-0,00325909, 0,008351], que incluye cero, por lo que la comparacion direccional es inconclusa y el objetivo de potencia del piloto no se alcanzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizers de ancho uno con signo) sobre backbone ViT-B/16 DINOv3 congelado |
| Parametros totales | 9.599.498 (pesos safetensors del artefacto; excluye el backbone DINOv3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision por parches, no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo procesa imagenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`) para inferencia; checkpoint de entrenamiento local con estado de optimizador y RNG |

## Arquitectura y entrenamiento

El artefacto combina un backbone ViT-B/16 DINOv3 preentrenado en LVD-1689M con un featurizer block-sparse entrenado desde cero y un clasificador de diez clases (orden de clases de torchvision Imagenette). Los featurizers no son SAEs ReLU convencionales: son featurizers de ancho uno con signo, ligados, y la esparsidad se impone a nivel de bloque. El objetivo de esta variante es MSE local sobre bloques (perfil `full`), y se compara contra un objetivo KL en el marco del estudio. El entrenamiento cubre una sola epoca completada, con semilla 103.

El pipeline de entrenamiento esta fijado por `config.json`, que vincula revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento. `manifest.json` y `duplicate_audit.json` conservan las asignaciones de imagenes y la evidencia de exclusion de duplicados, y `teacher.json` registra la seleccion del clasificador. El autor declara que el modelo excluye los pesos de DINO y las fotografias, de modo que la inferencia requiere descargar el backbone por separado con acceso autorizado.

## Capacidades

- Extraccion de caracteristicas dispersas a partir de activaciones de un ViT-B/16 DINOv3 sobre parches de imagen.
- Clasificacion de imagenes en las diez clases de Imagenette mediante el clasificador entrenado incluido en el artefacto.
- Prediccion de probabilidades por imagen a traves de la API `VisionFeaturizer.predict`, que devuelve un vector de probabilidades.
- Analisis de interpretabilidad: permite estudiar que bloques de caracteristicas se activan para cada parche y como se relacionan con la salida del clasificador.
- Evaluacion de fidelidad mediante divergencia KL frente al clasificador profesor (teacher).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni modo thinking; el etiquetado `en` es administrativo.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: usar el featurizer para descomponer las activaciones de DINOv3 en caracteristicas block-sparse y analizar que bloques correlacionan con cada clase de Imagenette, aprovechando que el artefacto incluye logits por imagen para auditoria.
- Reproduccion de estudios preregistrados: el paquete incluye `config.json`, `manifest.json`, `duplicate_audit.json` y `teacher.json`, lo que permite replicar exactamente la particion de datos, la semilla y la seleccion del clasificador en una comparacion MSE frente a KL.
- Auditoria de fidelidad de SAEs: medir la divergencia KL held-out (0,035770908 nats/imagen) y el MSE normalizado de parches (0,54544008) para comparar variantes de esparsidad por bloques frente a SAEs ReLU convencionales.
- Prototipado de clasificadores ligeros sobre DINOv3: el clasificador de diez clases con 98,4774 % de accuracy held-out sirve como readout de bajo coste para experimentos con Imagenette sin reentrenar el backbone.
- Docencia y formacion en interpretabilidad: el repositorio es pequeno (0,0 GB) y la API de inferencia es de una sola llamada, lo que facilita demostraciones en aula sobre SAEs y esparsidad estructurada.
- Analisis de sensibilidad a semillas: al existir variantes por semilla (esta es la 103), se pueden comparar intervalos de confianza y estabilidad del objetivo MSE local frente a KL en un piloto con cinco semillas.
- Verificacion de preservacion de readout en produccion de vision: si se sustituye un clasificador por su featurizer block-sparse, este artefacto permite cuantificar la perdida de accuracy antes de desplegar el cambio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL held-out | 0,035770908 nats/imagen |
| Accuracy held-out | 98,4774 % |
| MSE normalizado de parches | 0,54544008 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (nivel de semilla) | [-0,00325909, 0,008351] |
| Epocas completadas | 1 |
| Estado de potencia | objetivo de potencia del piloto no alcanzado; comparacion direccional inconclusa |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de las metricas internas del estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el artefacto pesa 9,6 M de parametros, pero la inferencia requiere ademas cargar el backbone DINOv3 ViT-B/16, cuyo coste domina el consumo.
- GPU recomendadas: no disponibles en la informacion proporcionada; el backbone ViT-B/16 es de tamano moderado y cabe en GPUs de consumo actuales, pero no se aportan cifras verificadas.
- Cabe en consumer GPU: previsiblemente si, dado que el ViT-B/16 es un modelo de vision de escala base, aunque no se confirma en la documentacion.
- Opciones de despliegue: paquete Python del proyecto `e2e_bsf` instalado con `uv sync --frozen`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision con featurizer propio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BSF DINOv3 Imagenette, seed 103) | 9,6 M (featurizer) + backbone DINOv3 ViT-B/16 | no aplica | KL 0,0358 nats/imagen; accuracy 98,48 % | MIT (backbone con licencia aparte) | Hugging Face, 22 descargas |
| SAE ReLU convencional sobre DINOv3 | no disponible | no aplica | no disponible | no disponible | no disponible en la informacion |
| Goodfire block-sparse featurizer | no disponible | no aplica | no disponible | no disponible | Repositorio publico citado por el autor |

No se dispone de datos comparativos verificados con alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Estudio exploratorio con una sola epoca completada y objetivo de potencia no alcanzado; la comparacion MSE local frente a KL es inconclusa (el intervalo de confianza incluye cero).
- El KL bajo solo mide la preservacion del readout de diez clases de Imagenette; no demuestra conceptos semanticos, fidelidad completa a DINO ni aceleracion de inferencia.
- El modelo no es generativo ni conversacional: no admite texto, tool calling ni agentes.
- La licencia MIT cubre el artefacto, pero no relicencia el backbone DINOv3, que requiere acceso autorizado y su propia licencia; el uso comercial esta sujeto a ambas.
- El artefacto excluye los pesos de DINO y las fotografias, por lo que no es autocontenido para inferencia.
- El etiquetado de idioma `en` es administrativo; no hay capacidades linguisticas reales.
- Riesgo de sobreinterpretacion: las caracteristicas block-sparse pueden no corresponder a conceptos humanos interpretables; el autor lo advierte explicitamente.
- Sin datos publicados sobre sesgos, alucinacion (no aplica a generacion) ni robustez fuera de Imagenette.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed103
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro del estudio: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Codigo de Goodfire block-sparse featurizer: https://github.com/goodfire-ai/block-sparse-featurizer
- Backbone base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
