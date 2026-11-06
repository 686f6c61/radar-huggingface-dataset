# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed104

## Resumen

BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed104 es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero sobre las activaciones internas de un clasificador de parches DINOv3/Imagenette. No es un modelo generativo ni un encoder de propósito general: es un artefacto de interpretabilidad que descompone las representaciones de un backbone congelado (facebook/dinov3-vitb16-pretrain-lvd1689m) en características dispersas por bloques, con el objetivo de estudiar qué información retiene y cómo se puede leer.

El modelo se enmarca en un estudio preregistrado y acotado sobre featurizers dispersos de anchura unitaria firmada (tied signed width-one featurizers), una variante que se aleja de los SAE ReLU convencionales. El artefacto publicado corresponde a la semilla 104, perfil "full" y una única época de entrenamiento, e incluye los pesos del featurizer, la normalización fija y el clasificador entrenado, pero excluye los pesos de DINO y las imágenes.

Su relevancia es metodológica: proporciona métricas medidas de divergencia KL retenida, precisión del clasificador y MSE de parches, junto con logs por imagen y evidencia de auditoría de duplicados, lo que permite reproducir y auditar el estudio. Con 9,6 millones de parámetros y un tamaño de repositorio mínimo, es un artefacto ligero orientado a investigación en interpretabilidad mecanicista más que a despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizer de anchura unitaria firmada) sobre backbone DINOv3 ViT-B/16 congelado |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre parches de imagen, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el artefacto procesa imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (model.safetensors, solo inferencia); checkpoint de entrenamiento local con estado de optimizador y RNG |

## Arquitectura y entrenamiento

El artefacto es un featurizer block-sparse entrenado de extremo a extremo contra un clasificador de parches fijo de diez clases (orden de clases de torchvision Imagenette) que opera sobre las activaciones de DINOv3 ViT-B/16. La formulación emplea featurizers de anchura unitaria firmados y ligados (tied signed width-one featurizers), no SAE con activación ReLU, y aplica dispersión por bloques (block sparsity) en la representación latente. El entrenamiento se realizó desde cero con perfil "full" y una sola época completada, con la semilla 104.

El objetivo combina una penalización KL sobre la salida del clasificador con la reconstrucción de parches, de modo que el featurizer aprende a preservar la lectura del clasificador mientras descompone la activación. El estudio es preregistrado y acotado; la comparación direccional entre la variante local y la variante KL resultó no concluyente (diferencia media pareada local menos KL de 0,00254596 nats/imagen sobre 5 semillas, intervalo de confianza del 95 % de [-0,00325909, 0,008351], que incluye el cero). Los archivos config.json, manifest.json, duplicate_audit.json y teacher.json fijan revisiones, arquitectura, objetivo, semilla, preprocesado y selección del clasificador.

## Capacidades

- Extracción de características dispersas por bloques a partir de imágenes RGB, mediante la clase VisionFeaturizer del paquete e2e_bsf.
- Clasificación de parches en las diez clases de Imagenette (orden de torchvision), usando el clasificador entrenado incluido en el artefacto.
- Predicción de probabilidades por imagen a través de la API model.predict([...]) del proyecto.
- Descomposición interpretable de activaciones de DINOv3 para análisis de características.
- Registro de métricas de fidelidad: divergencia KL retenida, precisión y MSE normalizado de parches.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión generativa, audio ni modo thinking.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar qué direcciones de activación de DINOv3 son relevantes para una tarea de clasificación concreta, usando el featurizer como sonda dispersa sobre el backbone congelado.
- Auditoría de estudios preregistrados: reproducir las métricas de KL, precisión y MSE con los logs por imagen y los manifiestos incluidos, verificando la asignación de imágenes y la evidencia de exclusión de duplicados.
- Comparación de objetivos de entrenamiento de SAE: emplear esta semilla (objetivo KL) junto con las variantes locales del mismo estudio para contrastar la preservación del readout del clasificador.
- Enseñanza de técnicas de dispersión por bloques: ilustrar con un artefacto pequeño (9,6 M de parámetros) cómo se entrena un featurizer de extremo a extremo contra un clasificador fijo.
- Validación de pipelines de evaluación de SAE: usar las métricas publicadas como referencia para comprobar la corrección de implementaciones propias del protocolo del estudio.
- Análisis de fidelidad de representaciones: medir cuánto se degrada la lectura de un clasificador al interponer una capa dispersa, con la cifra de KL de 0,031279746 nats/imagen como línea base.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida en held-out | 0,031279746 nats/imagen |
| Precision | 99,3548 % |
| MSE normalizado de parches | 0,7870993 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza del 95 % (nivel de semilla) | [-0,00325909, 0,008351] |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las cifras anteriores son métricas específicas del estudio y no son comparables con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,6 M de parámetros en safetensors el artefacto ocupa menos de 0,1 GB, pero requiere cargar el backbone DINOv3 ViT-B/16 (aproximadamente 86 M de parámetros) para operar.
- GPU recomendadas: no disponible; por el tamaño del backbone, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, aunque el autor no publica requisitos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del backbone ViT-B/16, pero no hay confirmación en la información disponible.
- Opciones de despliegue: paquete e2e_bsf instalado con uv sync --frozen y descarga del repositorio con hf download; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed104 | 9.599.498 | no aplica (parches de imagen) | KL 0,031279746 nats/imagen; precisión 99,3548 % | MIT (backbone DINOv3 con licencia aparte) | Hugging Face, 23 descargas |
| Variantes locales del mismo estudio (local-minus-KL) | no disponible | no aplica | Diferencia media de 0,00254596 nats/imagen frente a KL | MIT | mismo repositorio del autor |
| SAE ReLU convencionales (referencia conceptual del paper end-to-end SAE) | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría; las variantes del propio estudio son la referencia más directa.

## Limitaciones y advertencias

- El estudio es exploratorio y no alcanzó el objetivo de potencia del piloto; la comparación direccional entre objetivos es inconcluyente.
- Una KL más baja solo mide la preservación del readout de diez clases; no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- Entrenado con una única época y una sola semilla publicada (104), lo que limita la generalización de las conclusiones.
- El artefacto excluye los pesos de DINO y las imágenes; requiere acceso autorizado al backbone y su licencia separada, que la licencia MIT no cubre.
- El modelo solo procesa imágenes y clases de Imagenette; no es un modelo de lenguaje ni admite texto, herramientas o agentes.
- Riesgo de alucinación no aplica en el sentido habitual, pero las características dispersas no deben interpretarse como conceptos semánticos verificados.
- No se documentan sesgos específicos del dataset Imagenette ni del backbone más allá de los inherentes a DINOv3.
- Uso comercial: la licencia MIT cubre el artefacto, pero el uso del backbone DINOv3 queda sujeto a sus propios términos.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed104
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistración: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
