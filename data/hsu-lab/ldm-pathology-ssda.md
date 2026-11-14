# hsu-lab/ldm-pathology-ssda

## Resumen

`hsu-lab/ldm-pathology-ssda` es un modelo de difusión latente (latent diffusion model, LDM) entrenado para generar imágenes sintéticas de histopatología en el contexto de adaptación de dominio semi-supervisada (semi-supervised domain adaptation, SSDA). Lo desarrolla el grupo de investigación de William Hsu (hsu-lab) y acompaña al artículo «Semi-Supervised Domain Adaptation with Latent Diffusion for Pathology Image Classification» (arXiv:2601.17228). El problema que aborda es la brecha de dominio entre cohortes de tejido preparadas o escaneadas de forma distinta: un clasificador entrenado con una cohorte fuente pierde rendimiento al aplicarse a una cohorte objetivo con apariencia diferente.

La propuesta consiste en generar imágenes sintéticas que preserven la morfología tisular del dominio fuente pero incorporen la apariencia del dominio objetivo, condicionando la generación en características de un modelo fundacional, la identidad de cohorte y el método de preparación del tejido. Esas imágenes sintéticas se combinan con las imágenes etiquetadas del dominio fuente para entrenar el clasificador downstream, lo que mejora el F1 ponderado de 0,611 a 0,706 en el conjunto de test de la cohorte objetivo retenida.

No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un componente generativo de un pipeline de investigación en imagen médica. El repositorio publica un único checkpoint (`last.ckpt`, 5,1 GB) y la implementación de difusión latente está adaptada de PathLDM. La información pública disponible es escasa en cuanto a arquitectura detallada, datos de entrenamiento y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (latent diffusion) adaptada de PathLDM, con condicionamiento en características de modelo fundacional, identidad de cohorte y método de preparación del tejido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo generativo de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen; sin soporte de texto) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (`.ckpt`); no se indica safetensors ni GGUF |
| Tamaño del repositorio | 5,1 GB |
| Modalidad | Generación de imágenes de histopatología (imagen a imagen condicionada) |
| Checkpoint publicado | `last.ckpt` (configuración `feature_cond/uni_and_others_from_scratch_concat.yaml`) |

## Arquitectura y entrenamiento

El modelo es un modelo de difusión latente: un autoencoder comprime las imágenes de patología a un espacio latente y un modelo de difusión aprende a generar en ese espacio, condicionado por características extraídas de un modelo fundacional de patología, por la identidad de la cohorte y por el método de preparación del tejido. La implementación se apoya en PathLDM, según declara el autor. La configuración publicada (`uni_and_others_from_scratch_concat.yaml`) sugiere que el condicionamiento combina características de UNI con otras fuentes concatenadas, aunque el detalle exacto de la arquitectura (número de bloques, dimensión latente, mecanismo de atención) no está disponible en la información proporcionada.

El entrenamiento es semi-supervisado: utiliza imágenes no etiquetadas tanto del dominio fuente como del dominio objetivo, y el objetivo es que las muestras sintéticas conserven la morfología del tejido fuente e incorporen la apariencia del objetivo. El repositorio de código documenta el entrenamiento del autoencoder y del modelo de difusión, el cálculo de estadísticas FID y los experimentos de clasificación downstream. No se especifican el número de imágenes de entrenamiento, la composición exacta de las cohortes ni si se emplearon técnicas de ajuste por preferencias (no aplicables a este tipo de modelo). Tampoco se detalla si se usó decodificación especulativa u otras optimizaciones de muestreo; el script de muestreo expone un parámetro `--scale` (guía de clasificador sin clasificador) fijado en 1,5 en el ejemplo.

## Capacidades

- Generación de imágenes sintéticas de histopatología condicionadas por características de modelo fundacional, cohorte y método de preparación del tejido.
- Transferencia de apariencia entre dominios: preserva la morfología del dominio fuente e incorpora la apariencia del dominio objetivo.
- Generación por lotes mediante `sample_images_lmdb.py` con parámetros de configuración, checkpoint, directorio de salida, tamaño de lote y escala de guía.
- Soporte de cálculo de estadísticas FID para evaluar la calidad y la fidelidad de las muestras generadas.
- Integración en un pipeline de clasificación downstream: las muestras sintéticas se combinan con imágenes etiquetadas del dominio fuente para entrenar el clasificador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, detección, segmentación) más allá de la generación de parches de tejido.

## Casos de uso

- Adaptación de dominio entre cohortes de patología: generar muestras sintéticas con la apariencia de una cohorte objetivo (por ejemplo, otro escáner o otro protocolo de tinción) para aumentar el conjunto de entrenamiento del clasificador y reducir la caída de rendimiento al desplegarlo en esa cohorte.
- Aumento de datos para clases minoritarias: sintetizar parches de clases poco representadas en el dominio fuente con la apariencia del objetivo, equilibrando el entrenamiento del clasificador sin necesidad de anotaciones adicionales.
- Validación cruzada entre centros: simular la apariencia de un centro hospitalario distinto al del conjunto de entrenamiento para estimar la robustez del clasificador antes de su despliegue real.
- Investigación en armonización de imágenes: usar las muestras generadas como referencia para estudiar qué componentes de la apariencia (tinción, escáner, preparación) afectan más al rendimiento del clasificador.
- Preentrenamiento y regularización: incorporar las imágenes sintéticas en el entrenamiento de clasificadores de tejido como regularizador, especialmente cuando el dominio objetivo tiene pocas etiquetas.
- Evaluación de modelos fundacionales de patología: emplear el condicionamiento en características de modelos fundacionales para analizar cómo distintas representaciones afectan a la fidelidad morfológica de las muestras generadas.
- Docencia y comunicación: generar ejemplos sintéticos de morfología tisular para materiales formativos, con la advertencia de que no son imágenes clínicas reales.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test de la cohorte objetivo retenida:

| Metrica | Baseline | Con aumento propuesto |
|---|---:|---:|
| F1 ponderado (weighted F1) | 0,611 | 0,706 |
| F1 macro (macro F1) | 0,641 | 0,716 |

No se han publicado en la información disponible resultados de FID, número de muestras sintéticas empleadas ni comparaciones con otros métodos de adaptación de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint ocupa 5,1 GB y el pipeline requiere además el autoencoder y el extractor de características del modelo fundacional, por lo que se recomienda al menos 16-24 GB de VRAM para muestreo por lotes.
- GPU recomendadas: no especificadas por el autor; por el tamaño del checkpoint y el coste del muestreo de difusión, son razonables GPU de datacenter (A100, H100) o consumer de gama alta (RTX 4090, RTX 3090).
- Compatibilidad con GPU consumer: probable en tarjetas con 24 GB o más, sujeta a verificación empírica; no confirmada por el autor.
- Opciones de despliegue: el repositorio proporciona scripts de muestreo en PyTorch (`sample_images_lmdb.py`) con entorno Conda (`environment_olivia.yaml`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| `hsu-lab/ldm-pathology-ssda` | Difusión latente para patología | Características de modelo fundacional, cohorte y preparación | no disponible | Checkpoint único en Hugging Face |
| PathLDM | Difusión latente para patología | Texto (informes) | no disponible en la información proporcionada | Repositorio público |
| Modelos de difusión genéricos (p. ej. Stable Diffusion) | Difusión latente de propósito general | Texto | Varía según versión | Amplia |

No se dispone de datos comparativos de rendimiento (FID, F1) frente a PathLDM ni frente a otros métodos de adaptación de dominio en la información proporcionada.

## Limitaciones y advertencias

- Las imágenes generadas son sintéticas y no deben interpretarse como evidencia clínica; no se han validado para diagnóstico.
- Riesgo de que el modelo reproduzca sesgos presentes en las cohortes de entrenamiento (por ejemplo, distribución por sexo, edad o tipo de tejido), lo que puede afectar a la equidad del clasificador downstream.
- El condicionamiento depende de un modelo fundacional de patología cuyas características pueden introducir sus propios sesgos y limitaciones.
- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; es un bloqueo para producción hasta que el autor la especifique.
- El rendimiento reportado (F1 ponderado 0,706) se ha medido en una única cohorte objetivo retenida; la generalización a otras cohortes o tareas no está demostrada.
- No hay información sobre el número de pasos de muestreo, la resolución de las imágenes generadas ni los parámetros del autoencoder, lo que dificulta reproducir el pipeline sin el repositorio de código.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- No es un modelo de texto: no admite prompts en lenguaje natural ni tareas de razonamiento, código o matemáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsu-lab/ldm-pathology-ssda
- Artículo (arXiv): https://arxiv.org/abs/2601.17228
- Código y entrenamiento: https://github.com/hsu-lab/ldm-pathology-ssda
