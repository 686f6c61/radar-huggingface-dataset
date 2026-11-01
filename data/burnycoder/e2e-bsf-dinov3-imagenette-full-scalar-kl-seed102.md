# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed102

## Resumen

`BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed102` es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero sobre las representaciones de un clasificador de parches DINOv3/Imagenette. No es un modelo generativo ni un modelo de lenguaje: es un artefacto de interpretabilidad que descompone las activaciones internas de un backbone visual congelado (`facebook/dinov3-vitb16-pretrain-lvd1689m`) en características dispersas por bloques. Lo publica el usuario BurnyCoder como parte de un estudio preregistrado sobre featurizers block-sparse de extremo a extremo.

El artefacto corresponde al perfil `full`, semilla 102, con una sola época de entrenamiento completada y un objetivo de tipo scalar KL. Según la model card, los artefactos "scalar" son featurizers de anchura uno con signo (tied signed width-one featurizers), no SAEs ReLU convencionales. El repositorio incluye los pesos del BSF, la normalización fija y el clasificador entrenado, pero excluye los pesos de DINO y las imágenes.

Su relevancia es metodológica: forma parte de un estudio comparativo entre entrenamiento local y entrenamiento con divergencia KL para medir si un featurizer preserva la fidelidad del readout del clasificador original. El resultado del estudio es explícitamente exploratorio e inconcluso: el intervalo de confianza del 95 % de la diferencia pareada incluye cero, y no se alcanzó el objetivo de potencia del piloto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizer de anchura uno con signo) sobre DINOv3 ViT-B/16 congelado |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el artefacto opera sobre imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El featurizer se entrena desde cero para un clasificador de parches DINOv3/Imagenette fijo. La arquitectura es un block-sparse featurizer de extremo a extremo: en lugar de un SAE ReLU clásico, emplea featurizers "scalar" de anchura uno con signo y pesos atados (tied). El backbone DINOv3 ViT-B/16 permanece congelado y no se incluye en el repositorio; el artefacto contiene únicamente los pesos del BSF, la normalización fija y el clasificador entrenado. El perfil de entrenamiento es `full` y se completó una época.

El objetivo de entrenamiento es scalar KL, comparado en el estudio con un objetivo local. El estudio mide la divergencia KL retenida frente al readout del clasificador de diez clases de Imagenette. La diferencia media pareada local-menos-KL es de 0,00254596 nats/imagen sobre 5 semillas, con un intervalo del 95 % a nivel de semilla de [-0,00325909, 0,008351]; al incluir el cero, la comparación direccional es inconclusa. El entrenamiento con KL mostró menor divergencia media de salida. El repositorio conserva `config.json` (revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignaciones de imágenes y evidencia de exclusión) y `teacher.json` (selección del clasificador).

## Capacidades

- Descomposición de activaciones de un backbone DINOv3 ViT-B/16 en características block-sparse.
- Predicción de probabilidades de clase sobre parches de Imagenette mediante la API `VisionFeaturizer.predict`.
- Preservación del readout de un clasificador de diez clases (KL retenida medida de 0,030276481 nats/imagen).
- Reproducibilidad de un estudio preregistrado con semilla fija (102) y artefactos de auditoría incluidos.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto.
- No soporta visión general más allá del clasificador de parches Imagenette para el que fue entrenado.

## Casos de uso

- Investigación en interpretabilidad mecanística: analizar cómo se organizan las características dispersas en las activaciones de DINOv3 ViT-B/16, usando el featurizer como sonda sobre el backbone congelado.
- Reproducción de estudios comparativos de objetivos de entrenamiento: replicar la comparación local frente a KL con la semilla 102 y contrastar la métrica de divergencia reportada.
- Auditoría de fidelidad de readout: medir cuánto se degrada la clasificación de diez clases al sustituir la representación original por la reconstrucción del featurizer (KL de 0,0303 nats/imagen, precisión del 99,0968 %).
- Docencia y experimentación con block-sparse featurizers: usar el artefacto como ejemplo ejecutable de SAE block-sparse de extremo a extremo con pesos safetensors de 9,6 M de parámetros.
- Validación de pipelines de evaluación: emplear `manifest.json` y `duplicate_audit.json` como referencia para construir particiones reproducibles de Imagenette con control de duplicados.
- Análisis de estabilidad entre semillas: comparar este artefacto con las otras semillas del estudio para estudiar la varianza del entrenamiento con objetivo KL.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida (held-out) | 0,030276481 nats/imagen |
| Precision (accuracy) | 99,0968 % |
| MSE de parche normalizado | 0,79617018 |
| Diferencia media pareada local-menos-KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (nivel de semilla) | [-0,00325909, 0,008351] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos del BSF suman 9,6 M de parámetros (del orden de decenas de MB en fp32), pero la inferencia requiere además cargar el backbone DINOv3 ViT-B/16, cuyos pesos no se incluyen en el repositorio.
- GPU recomendadas: no disponible en la información proporcionada; el backbone ViT-B/16 es de tamaño moderado y cabe previsiblemente en GPU de consumo, pero no se aportan medidas.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: el proyecto oficial (`e2e_bsf`) mediante `uv sync --frozen` y la clase `VisionFeaturizer`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (BSF scalar KL, seed 102) | 9.607.690 | no aplica | KL 0,0303 nats/imagen; accuracy 99,0968 % | MIT (backbone aparte) | HuggingFace, 23 descargas |
| Block-sparse featurizer de Goodfire | no disponible | no aplica | no disponible | no disponible | Repositorio público |
| SAE de extremo a extremo (paper arXiv:2405.12241) | no disponible | no aplica | no disponible | no disponible | Publicación |

No se dispone de datos comparativos de rendimiento entre alternativas en la información proporcionada.

## Limitaciones y advertencias

- Estudio exploratorio e inconcluso: el objetivo de potencia del piloto no se alcanzó y el intervalo de confianza de la diferencia pareada incluye cero.
- Solo una época de entrenamiento completada, lo que limita la madurez del artefacto.
- La KL baja únicamente mide la preservación del readout de diez clases; no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- Los artefactos "scalar" no son SAEs ReLU convencionales, por lo que las comparaciones directas con SAEs estándar pueden no ser válidas.
- El repositorio excluye los pesos de DINO y las imágenes: se requiere acceso autorizado a DINOv3 y su licencia separada; la licencia MIT no relicencia el backbone.
- El orden de clases sigue torchvision Imagenette; usarlo con otro orden invalida las predicciones.
- El modelo solo cubre el clasificador de parches Imagenette para el que fue entrenado; no generaliza a otras tareas visuales ni a texto.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos generativos, pero el featurizer puede producir reconstrucciones que preserven el readout sin capturar la estructura semántica subyacente.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-kl-seed102
- Proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE de extremo a extremo: https://arxiv.org/abs/2405.12241
- Código de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
