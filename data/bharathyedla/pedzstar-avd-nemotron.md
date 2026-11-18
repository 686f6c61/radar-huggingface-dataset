# BharathYedla/PedzSTAR-AVD-Nemotron

## Resumen

PedzSTAR-AVD-Nemotron es un ajuste fino (fine-tune) del modelo NVIDIA Nemotron-3.5-Transcribe-30B-A4B, desarrollado por el usuario BharathYedla. El modelo está especializado en la detección de voz de adultos (Adult Voice Detection, AVD) dentro de flujos de control de calidad (quality control) de audio, con un enfoque particular en el procesamiento de habla infantil (child-speech). Es decir, el modelo parte de un backbone de transcripción de audio y se adapta para discriminar entre voz adulta y voz infantil, una tarea relevante en la verificación de datasets de habla infantil, en la moderación de contenido y en pipelines de anotación automática.

El modelo hereda la arquitectura del Nemotron-3.5-Transcribe-30B-A4B de NVIDIA, un transformer de tipo Mixture-of-Experts (MoE) con 30.000 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (de ahí el sufijo A4B). El ajuste fino se ha realizado sobre el checkpoint base y se distribuye en formato compatible con `transformers`, con un tamaño de repositorio de 19,2 GB.

Es relevante ahora porque cubre una necesidad concreta y poco atendida: la clasificación automática de voz adulta frente a infantil en corpus de audio, un paso crítico de control de calidad antes de entrenar modelos de ASR infantil. El acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face para descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), heredada de NVIDIA Nemotron-3.5-Transcribe-30B-A4B |
| Parametros totales | 30B (según el nombre del modelo base) |
| Parametros activos | ~4B (sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | openmdw-1.1 (etiquetada como `license:other`) |
| Formato de pesos | safetensors (compatible con `transformers`), según el tamaño de repo de 19,2 GB |
| Tarea | Detección de voz adulta (AVD) / control de calidad de audio |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo NVIDIA Nemotron-3.5-Transcribe-30B-A4B, un transformer de tipo Mixture-of-Experts con 30.000 millones de parámetros totales y unos 4.000 millones activos por token. El modelo base está orientado a transcripción de audio (speech), por lo que su encoder/decoder está preparado para procesar señales de voz. Sobre esta base, el autor ha realizado un ajuste fino supervisado para la tarea binaria de detección de voz adulta frente a voz infantil, reutilizando la representación acústica del modelo de transcripción.

No se dispone de información detallada sobre el número de tokens de audio utilizados en el ajuste fino, la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de RLHF/DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base. Toda esta información debe considerarse no disponible a partir de los datos proporcionados.

## Capacidades

- Detección de voz adulta (Adult Voice Detection) en segmentos de audio, como tarea principal de clasificación.
- Control de calidad de audio: discriminación entre habla infantil y habla adulta para validar corpus.
- Procesamiento de habla (speech) como dominio de entrada, heredado del modelo base de transcripción.
- Capacidad multilingüe limitada: solo se declara inglés (`en`).
- Compatibilidad con `transformers` y con endpoints compatibles (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking".

## Casos de uso

- Control de calidad de datasets de habla infantil: el modelo se usaría como filtro automático para descartar segmentos con voz adulta antes de entrenar modelos de ASR infantil, reduciendo la contaminación del corpus.
- Verificación de anotaciones en corpus de audio: permite auditar etiquetas existentes y detectar muestras mal clasificadas como habla infantil cuando en realidad contienen voz adulta.
- Moderación y cumplimiento en plataformas de contenido: ayuda a identificar presencia de voz adulta en grabaciones que deberían contener únicamente voces infantiles (por ejemplo, entornos educativos o de investigación).
- Pipelines de anotación semiautomática: se integra como paso previo a la revisión humana, priorizando los segmentos ambiguos y reduciendo el coste de anotación manual.
- Investigación en adquisición del lenguaje: permite segmentar y validar corpus de habla infantil con criterios reproducibles de pureza de voz.
- Preprocesado en sistemas de ASR especializados: actúa como etapa de enrutamiento que decide qué segmentos se envían a un modelo de ASR infantil y cuáles se descartan o redirigen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 30B parámetros totales; en precisión completa (FP16) requeriría del orden de 60 GB de VRAM, y en cuantización de 8 bits alrededor de 30 GB. No se dispone de datos oficiales de cuantización para este fine-tune.
- GPU recomendadas: A100 80 GB o H100 para FP16; GPUs con 40-48 GB (A100 40 GB, L40S) podrían ser viables con cuantización.
- Viabilidad en GPU de consumo: no cabe en GPUs de consumo de 24 GB en FP16; sería necesario cuantizar agresivamente, y no se documentan versiones GGUF.
- Opciones de despliegue: `transformers` (soporte declarado), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PedzSTAR-AVD-Nemotron | 30B totales / ~4B activos | no disponible | Detección de voz adulta | openmdw-1.1 | Gated en HF |
| nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 30B totales / ~4B activos | no disponible | Transcripción de audio | no disponible | HF (modelo base) |
| Alternativas específicas de AVD | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de detección de voz adulta ni de sus métricas, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su rendimiento en otros idiomas no está documentado.
- Es un ajuste fino de un modelo de transcripción, no un modelo de clasificación entrenado desde cero; puede heredar sesgos acústicos del corpus de entrenamiento original.
- Riesgo de alucinación o clasificación errónea en segmentos con voz mixta (adulto e infantil simultáneos), ruido de fondo o audio de baja calidad; no se documentan métricas de error.
- No se especifican detalles del dataset de ajuste fino, por lo que se desconoce su cobertura demográfica, de acentos y de edades.
- Licencia `openmdw-1.1` (etiquetada como `license:other`): es necesario revisar los términos antes de cualquier uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; se trata de un modelo muy reciente y sin validación comunitaria documentada.
- No se documentan cuantizaciones oficiales, lo que complica el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BharathYedla/PedzSTAR-AVD-Nemotron
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
