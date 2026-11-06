# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed100

## Resumen

Este repositorio contiene un *featurizer* de bloques dispersos (block-sparse featurizer, BSF) entrenado desde cero sobre las representaciones de un clasificador de parches DINOv3/Imagenette congelado. No es un modelo generativo ni un LLM: es un artefacto de interpretabilidad (sparse autoencoder con estructura de bloque) pensado para descomponer las activaciones internas de un backbone visual ViT-B/16 de DINOv3 en un conjunto de características dispersas y analizables. Lo desarrolla el usuario independiente BurnyCoder dentro de un estudio preregistrado sobre featurizers dispersos de extremo a extremo.

El artefacto corresponde a la variante `scalar_mse` con semilla 100, perfil `full` y una sola época de entrenamiento completada. Los pesos suman 9.607.690 parámetros e incluyen los pesos del BSF, la normalización fija y el clasificador entrenado; el backbone DINOv3 no se distribuye con el modelo y debe obtenerse por separado bajo su propia licencia. La relevancia es metodológica: publica métricas de divergencia KL, precisión y MSE sobre parches retenidos, junto con manifiestos de auditoría y preregistro, lo que permite reproducir y evaluar el experimento.

El estudio se declara exploratorio y con potencia estadística insuficiente: el objetivo de potencia del piloto no se alcanzó y el intervalo de confianza del 95 % para la diferencia pareada local-menos-KL incluye el cero, por lo que la comparación direccional entre objetivos de entrenamiento es inconclusa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder con estructura de bloque (block-sparse featurizer) sobre representaciones de DINOv3 ViT-B/16; artefactos escalares descritos como featurizers de anchura uno con signo atado, no SAE ReLU convencionales |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el modelo opera sobre imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors` para inferencia; el checkpoint de entrenamiento local conserva además estado del optimizador y RNG) |

## Arquitectura y entrenamiento

El modelo es un featurizer disperso con estructura de bloques entrenado de extremo a extremo contra un clasificador de parches fijo basado en DINOv3 ViT-B/16 preentrenado en LVD-1689M. El objetivo es `scalar_mse` (error cuadrático medio escalar) con perfil `full` y semilla 100. La model card indica explícitamente que los artefactos escalares son featurizers de anchura uno con signo atado y no SAEs con activación ReLU convencional, una distinción relevante para interpretar las métricas.

El entrenamiento completó una época. El repositorio incluye `config.json` (que fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignación de imágenes y evidencia de exclusiones) y `teacher.json` (selección del clasificador). El estudio es preregistrado y acotado; la comparación con el objetivo KL se realizó sobre 5 semillas y no alcanzó la potencia objetivo del piloto.

## Capacidades

- Extracción de características dispersas a partir de activaciones de un backbone DINOv3 ViT-B/16 congelado.
- Clasificación de parches de imagen en las diez clases de Imagenette (el orden de clases sigue el de torchvision Imagenette), mediante el clasificador incluido en el artefacto.
- Predicción de probabilidades por imagen a través de la API `VisionFeaturizer.predict` del paquete `e2e_bsf`.
- Evaluación de preservación de la lectura del clasificador mediante divergencia KL, precisión y MSE normalizado de parches.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto ni capacidades multimodales de texto.
- No ofrece modo de razonamiento (*thinking*), visión general fuera del pipeline DINOv3/Imagenette, audio ni capacidades multilingües más allá de la etiqueta `en` declarada.

## Casos de uso

- Investigación en interpretabilidad mecanística de modelos visuales: usar el featurizer para descomponer activaciones de DINOv3 ViT-B/16 en características dispersas y estudiar su estructura de bloques, aprovechando que el artefacto fija normalización y clasificador para hacer el análisis reproducible.
- Reproducción de un estudio preregistrado: el paquete de configuración, manifiestos y auditoría de duplicados permite replicar el experimento y verificar las asignaciones de imágenes y las identidades de entrenamiento.
- Evaluación comparativa de objetivos de entrenamiento de SAEs: el artefacto sirve como una de las ejecuciones (objetivo `scalar_mse`, semilla 100) dentro de la comparación pareada con el objetivo KL sobre cinco semillas.
- Docencia y formación sobre SAEs y dispersión por bloques: el ejemplo mínimo de inferencia con `VisionFeaturizer` y una imagen de entrada es adecuado para demostrar el flujo completo en un cuaderno o taller.
- Auditoría de preservación de un readout: medir cuánta fidelidad de la clasificación de diez clases se conserva tras la proyección dispersa, usando KL, precisión y MSE como indicadores acotados.
- Base para experimentos derivados: el checkpoint de entrenamiento con estado del optimizador y RNG permite reanudar o extender el entrenamiento, aunque el artefacto publicado para inferencia es `model.safetensors`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida (held-out) | 0,26124892 nats/imagen |
| Precision | 90,5290 % |
| MSE normalizado de parches | 0,66401124 |
| Diferencia pareada media local-menos-KL | 0,00254596 nats/imagen sobre 5 semillas |
| Intervalo de confianza al 95 % (por semilla) | [-0,00325909; 0,008351] |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de la misma categoría. El intervalo de confianza incluye el cero y la comparación direccional se declara inconclusa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 millones de parámetros el artefacto es pequeño, pero requiere cargar el backbone DINOv3 ViT-B/16, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del featurizer es reducido, pero el backbone condiciona el consumo real.
- Opciones de despliegue: paquete `e2e_bsf` instalado con `uv sync --frozen` y descarga del repositorio con `hf download`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed100 | 9.607.690 | no disponible | KL 0,2612 nats/imagen; precisión 90,53 % | MIT (backbone aparte) | Hugging Face |
| Block-sparse featurizer de Goodfire (referencia de código) | no disponible | no disponible | no disponible | no disponible | GitHub |
| SAE de extremo a extremo (paper arXiv:2405.12241) | no disponible | no disponible | no disponible | no disponible | Publicación |

No se dispone de datos numéricos comparables de las alternativas en la información proporcionada; la comparativa se limita a referencias metodológicas.

## Limitaciones y advertencias

- Estudio exploratorio y preregistrado con potencia insuficiente: el objetivo de potencia del piloto no se alcanzó y la comparación direccional es inconclusa (el intervalo de confianza incluye el cero).
- Solo se completó una época de entrenamiento, lo que limita la madurez del artefacto.
- Una KL más baja mide únicamente la preservación del readout de diez clases; no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- El artefacto excluye los pesos de DINOv3 y las fotos; se requiere acceso autorizado al backbone y su licencia separada, que la licencia MIT del repositorio no relicencia.
- El orden de clases sigue torchvision Imagenette; cualquier uso con otro etiquetado produce resultados incorrectos.
- No es un modelo generativo ni un LLM: no admite prompts, tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos generativos, pero el clasificador hereda los sesgos del backbone y del conjunto Imagenette, de dominio y tamaño limitados.
- Uso comercial: la licencia MIT cubre el artefacto, pero el uso del backbone DINOv3 queda sujeto a sus propios términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper de SAE de extremo a extremo: https://arxiv.org/abs/2405.12241
- Código de Goodfire (block-sparse featurizer): https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
