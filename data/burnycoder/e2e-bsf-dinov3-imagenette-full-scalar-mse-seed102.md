# BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed102

## Resumen

El modelo `BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed102` es un sparse autoencoder (SAE) de tipo block-sparse featurizer entrenado desde cero sobre las representaciones internas del backbone visual DINOv3 ViT-B/16. Lo desarrolla el usuario BurnyCoder como parte de un estudio preregistrado sobre featurizers dispersos de extremo a extremo, y su objetivo no es generar texto ni imágenes, sino descomponer las activaciones de un clasificador de parches DINOv3 en características interpretables. Con 9.607.690 parámetros, es un artefacto pequeño y especializado, no un modelo de lenguaje.

El modelo se enmarca en la línea de investigación de interpretabilidad mecanicista basada en SAEs: extraer representaciones dispersas y monitorizables de las activaciones de un transformer visual. La variante concreta corresponde a un perfil "full", con una sola época de entrenamiento completada, semilla 102 y una función de pérdida escalar MSE. Los artefactos escalares son "signed width-one featurizers" ligados, es decir, no son SAEs ReLU convencionales, lo que conviene tener presente antes de reutilizarlos.

La relevancia es metodológica: el autor publica métricas de divergencia KL, precisión de clasificación y MSE normalizado de parches, junto con un análisis de potencia estadística que reconoce que el objetivo piloto no se alcanzó. El estudio es exploratorio y la comparación direccional entre variantes resulta inconclusa según sus propios datos. Es, por tanto, un modelo útil para reproducir experimentos de interpretabilidad, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder block-sparse (featurizer signed width-one) sobre DINOv3 ViT-B/16 |
| Parametros totales | 9.607.690 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de la model card; el modelo opera sobre imágenes) |
| Licencia | MIT (los pesos del backbone DINOv3 requieren licencia aparte) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto contiene los pesos del block-sparse featurizer, la normalización fija y el clasificador entrenado, pero excluye los pesos de DINOv3 y las imágenes. Se apoya en `facebook/dinov3-vitb16-pretrain-lvd1689m` como backbone congelado y aprende una representación dispersa por bloques cuyas activaciones se evalúan contra la salida de un clasificador de diez clases fijo (Imagenette, con el orden de clases de torchvision). El perfil de entrenamiento es "full", con una época completada y semilla 102; la función de pérdida es MSE escalar sobre las activaciones.

El autor declara que los artefactos escalares son featurizers firmados de anchura uno ligados, no SAEs ReLU convencionales, lo que cambia la interpretación de las activaciones. El estudio es preregistrado y de alcance acotado: la comparación entre la variante local y la variante con pérdida KL arroja una diferencia media pareada de 0,00254596 nats/imagen sobre 5 semillas, con un intervalo de confianza del 95 % de [-0,00325909, 0,008351]. Como el intervalo incluye el cero, el autor califica la comparación direccional de inconclusa y el estudio de exploratorio, sin alcanzar el objetivo de potencia piloto.

## Capacidades

- Extracción de características visuales dispersas a partir de imágenes RGB, mediante `VisionFeaturizer` y el método `predict`.
- Clasificación de imágenes en las diez clases de Imagenette (orden de torchvision), usando el clasificador incluido en el artefacto.
- Producción de logits por imagen y métricas de divergencia respecto al profesor DINOv3.
- Análisis de interpretabilidad: activaciones block-sparse pensadas para inspección de características.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye visión generativa: solo codifica y clasifica.
- No se declaran modos especiales (thinking, audio, etc.).

## Casos de uso

- Reproducción de experimentos de interpretabilidad: cargar el artefacto con `uv sync --frozen` y `hf download` para replicar las métricas publicadas (KL 0,27208582 nats/imagen, precisión 90,1677 %).
- Auditoría de representaciones de DINOv3: comparar las activaciones dispersas del featurizer con las del backbone para estudiar qué información preserva el cuello de botella.
- Investigación sobre block-sparsity: servir como línea base escalar frente a SAEs ReLU convencionales en estudios comparativos de dispersión.
- Validación de pipelines de evaluación: usar el clasificador fijo de diez clases como sonda controlada para medir fidelidad de features.
- Docencia y formación: ejemplo compacto (9,6 M de parámetros) de SAE aplicado a un transformer visual, fácil de inspeccionar.
- Análisis de robustez de readouts: medir cómo varía la precisión de la sonda de diez clases bajo distintas transformaciones de imagen.
- No es adecuado para clasificación de imágenes en producción ni para tareas fuera de Imagenette.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida (held-out) | 0,27208582 nats/imagen |
| Precision | 90,1677 % |
| MSE normalizado de parches | 0,66426837 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % (por semilla) | [-0,00325909, 0,008351] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros SAEs en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 M de parámetros el artefacto es muy pequeño, pero requiere cargar además el backbone DINOv3 ViT-B/16.
- GPU recomendadas: no disponible; por el tamaño del backbone, una GPU consumer con suficiente memoria para ViT-B/16 debería bastar, aunque no se confirma.
- ¿Cabe en GPU consumer? No confirmado en la documentación; el cuello de botella es el backbone DINOv3, no el featurizer.
- Opciones de despliegue: el proyecto oficial usa `uv sync --frozen` y el paquete `e2e_bsf` con la clase `VisionFeaturizer`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BSF DINOv3 Imagenette) | 9,6 M | no aplica | KL 0,2721; precisión 90,17 % | MIT (backbone aparte) | Hugging Face, 24 descargas |
| SAE ReLU convencional sobre DINOv3 | no disponible | no aplica | no disponible | no disponible | no disponible |
| Block-sparse featurizer de Goodfire | no disponible | no aplica | no disponible | no disponible | GitHub |
| DINOv3 ViT-B/16 (backbone) | no disponible | no aplica | no disponible | licencia propia de DINOv3 | Hugging Face (acceso autorizado) |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor advierte que un KL más bajo solo mide la preservación del readout de diez clases; no demuestra conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- Estudio exploratorio: no se alcanzó el objetivo de potencia piloto y la comparación direccional es inconclusa (el intervalo de confianza incluye el cero).
- Solo una época de entrenamiento completada, lo que limita la madurez de las representaciones aprendidas.
- El artefacto excluye los pesos de DINOv3 y las fotos; se requiere acceso autorizado al backbone y su licencia separada. La licencia MIT no relicencia el backbone.
- El modelo está restringido a Imagenette (diez clases) y al orden de clases de torchvision; no generaliza a otras taxonomías sin reentrenamiento.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en el sentido habitual, pero las activaciones dispersas pueden inducir interpretaciones espurias si se leen sin validación.
- Idiomas: la etiqueta es "en", aunque el modelo no procesa texto; no hay soporte multilingüe.
- Para producción: no recomendado; es un artefacto de investigación con métricas acotadas y sin garantías de robustez fuera del conjunto evaluado.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-scalar-mse-seed102
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código de Goodfire (block-sparse featurizer): https://github.com/goodfire-ai/block-sparse-featurizer
- Backbone DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
