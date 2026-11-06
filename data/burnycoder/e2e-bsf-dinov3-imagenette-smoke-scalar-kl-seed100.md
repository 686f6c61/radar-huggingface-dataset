# BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-scalar-kl-seed100

## Resumen

BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-scalar-kl-seed100 es un artefacto de investigación que implementa un featurizer disperso por bloques (block-sparse featurizer, BSF) sobre el espacio de representaciones de un clasificador de parches basado en DINOv3. Lo publica el usuario BurnyCoder dentro del proyecto end-to-end-block-sparse-featurizers, cuyo objetivo es estudiar si un SAE con dispersión por bloques puede entrenarse de extremo a extremo junto con un clasificador fijo y preservar la lectura del backbone. El modelo no es un generador de texto ni un modelo multimodal de propósito general: es un componente de interpretabilidad de 232.042 parámetros que transforma activaciones del backbone en representaciones dispersas.

El artefacto corresponde al perfil "smoke" (demostración de ingeniería) con solo 3 épocas completadas, semilla 100 y objetivo scalar_kl. El autor advierte explícitamente que un artefacto smoke no aporta ninguna afirmación científica confirmatoria. Las métricas publicadas son KL retenida de 5,1326113 nats/imagen, precisión del 26,0000 % y MSE de parche normalizado de 0,94415915. Es relevante ahora porque acompaña a dos líneas de trabajo activas: los SAE end-to-end para interpretabilidad mecanicista (arXiv:2405.12241) y los block-sparse featurizers aplicados a modelos de visión (arXiv:2606.25234).

El modelo base es facebook/dinov3-vitb16-pretrain-lvd1689m, un ViT-B/16 de DINOv3 preentrenado sobre LVD-1689M. El artefacto no incluye los pesos de DINO ni las imágenes: solo contiene los pesos del BSF, la normalización fija y el clasificador entrenado. Para usarlo es necesario disponer de acceso autorizado a DINOv3 y aceptar su licencia separada, que no queda cubierta por la licencia MIT de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Featurizer disperso por bloques (BSF) sobre backbone ViT-B/16 DINOv3; clasificador de parches de 10 clases |
| Parametros totales | 232.042 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | MIT (solo para los pesos del BSF; el backbone DINOv3 tiene licencia separada) |
| Formato de pesos | safetensors (model.safetensors) |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m |
| Objetivo de entrenamiento | scalar_kl |
| Epocas completadas | 3 (perfil smoke) |
| Semilla | 100 |
| Clases de salida | 10 (orden de torchvision Imagenette) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El componente central es un featurizer disperso por bloques que se entrena desde cero para un clasificador de parches fijo construido sobre DINOv3/Imagenette. La dispersión por bloques agrupa unidades de activación en bloques en lugar de imponer dispersión a nivel de unidad individual, siguiendo el enfoque del block-sparse featurizer de Goodfire (arXiv:2606.25234). El entrenamiento es end-to-end respecto al clasificador fijo, en la línea del paper de SAE end-to-end (arXiv:2405.12241): el objetivo no es reconstruir la activación del backbone, sino preservar la lectura de las diez clases del clasificador.

La configuración concreta de esta ejecución es el objetivo scalar_kl con semilla 100 y perfil smoke, con 3 épocas completadas. El archivo config.json fija las revisiones, la arquitectura, el objetivo, la semilla, el preprocesado y las identidades de entrenamiento; manifest.json y duplicate_audit.json conservan las asignaciones de imágenes y la evidencia de exclusión de duplicados, y teacher.json registra la selección del clasificador. El checkpoint local de entrenamiento conserva además el estado del optimizador y del RNG, mientras que model.safetensors está pensado únicamente para inferencia. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni detalles de la programación del entrenamiento más allá de los tres epochs indicados.

## Capacidades

- Clasificación de imágenes en 10 clases de Imagenette mediante un pipeline de inferencia que acepta imágenes PIL en RGB y devuelve probabilidades.
- Extracción de características dispersas por bloques sobre las representaciones de DINOv3 ViT-B/16, orientada al análisis de interpretabilidad.
- Preservación de la lectura del clasificador fijo, medida mediante KL retenida entre las salidas del modelo y las del profesor.
- Integración como componente dentro del proyecto e2e_bsf, con API `VisionFeaturizer` y método `predict`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking.
- Capacidad multilingüe: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Análisis de interpretabilidad mecanicista en visión: usar el featurizer para examinar qué bloques de activación se activan ante parches de imagen concretos y contrastarlo con las clases predichas por el clasificador fijo.
- Reproducción de experimentos de SAE end-to-end: el artefacto incluye config.json, manifest.json y duplicate_audit.json, lo que permite reconstruir la configuración exacta y auditar la partición de datos en un estudio comparativo de objetivos (scalar_kl frente a otras variantes).
- Validación de pipelines de investigación: al ser un artefacto smoke con solo 232.042 parámetros y 3 épocas, sirve para verificar que la instalación con `uv sync --frozen`, la descarga con `hf download` y la API `VisionFeaturizer` funcionan antes de lanzar ejecuciones completas.
- Estudio de la fidelidad al backbone: medir la KL retenida frente a distintas configuraciones de dispersión por bloques para cuantificar cuánto se degrada la lectura del clasificador al aumentar la dispersión.
- Docencia y divulgación sobre SAE en visión: el tamaño reducido del artefacto y su licencia MIT permiten usarlo como ejemplo práctico en cursos sobre interpretabilidad, siempre que se gestione aparte el acceso a DINOv3.
- Base para comparativas de semillas: dado que el identificador incluye la semilla 100, puede emparejarse con artefactos de otras semillas del mismo proyecto para analizar la variabilidad de las métricas (KL, precisión, MSE) entre ejecuciones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida (held-out) | 5,1326113 nats/imagen |
| Precision | 26,0000 % |
| MSE de parche normalizado | 0,94415915 |
| Epocas completadas | 3 |
| Perfil | smoke |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a un featurizer de visión. El autor advierte que una KL más baja solo mide la preservación de esta lectura de diez clases y no establece conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto pesa 0.0 GB y tiene 232.042 parámetros, por lo que los pesos del BSF ocupan menos de 1 MB en fp32. El consumo real vendrá dominado por el backbone DINOv3 ViT-B/16, que no se incluye en el repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Para el backbone ViT-B/16 se requiere una GPU con soporte para PyTorch; el artefacto en sí no impone requisitos propios.
- Cabe en GPU de consumo: sí para los pesos del BSF; el backbone DINOv3 debe evaluarse por separado según su propio tamaño y precisión.
- Opciones de despliegue: la vía documentada es el paquete del proyecto con `uv sync --frozen` y la clase `VisionFeaturizer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-scalar-kl-seed100 | 232.042 | no aplica | BSF end-to-end sobre DINOv3 para clasificación de 10 clases | MIT (BSF); DINOv3 aparte | Hugging Face, 35 descargas |
| Block-sparse featurizer de Goodfire | no disponible | no aplica | BSF de referencia sobre activaciones | no disponible | Repositorio GitHub |
| SAE end-to-end (arXiv:2405.12241) | no disponible | no aplica | SAE entrenado conjuntamente con la tarea | no disponible | Paper |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas equivalentes; la comparativa se limita a la naturaleza del enfoque y la licencia.

## Limitaciones y advertencias

- Artefacto smoke: solo 3 épocas y precisión del 26,0000 %, por lo que no debe interpretarse como evidencia científica confirmatoria.
- La KL retenida mide únicamente la preservación de la lectura de diez clases; no demuestra conceptos semánticos, fidelidad completa a DINO ni aceleración de inferencia.
- El repositorio no incluye los pesos de DINOv3 ni las imágenes; se requiere acceso autorizado al backbone y aceptar su licencia separada, que la MIT de este repositorio no sustituye.
- El orden de clases sigue torchvision Imagenette; cualquier reordenación en producción altera la interpretación de las probabilidades.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las representaciones dispersas pueden inducir interpretaciones erróneas si se leen como conceptos semánticos.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre Imagenette, las clases y su distribución condicionan cualquier conclusión.
- Limitaciones de idioma: el modelo no procesa texto; la etiqueta `en` del repositorio no implica capacidades lingüísticas.
- Restricciones de uso comercial: la licencia MIT cubre los pesos del BSF, pero el uso del backbone DINOv3 queda sujeto a su licencia propia.
- Para producción: no se han publicado requisitos de latencia ni throughput, y el estado del optimizador y del RNG solo existe en el checkpoint local de entrenamiento, no en model.safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-smoke-scalar-kl-seed100
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper SAE end-to-end: https://arxiv.org/abs/2405.12241
- Código de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Preregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
