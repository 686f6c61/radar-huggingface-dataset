# reaperdoesntknow/Discovered

## Resumen

Discovered es un modelo de lenguaje publicado en Hugging Face por el usuario reaperdoesntknow bajo el sello de Convergent Intelligence LLC (Research Division). Se distribuye como un modelo de tipo transformers en formato safetensors, con 54.657.008 parámetros totales y un repositorio de 0,7 GB. La model card es una plantilla autogenerada en la que el autor no ha rellenado prácticamente ningún campo técnico (arquitectura, datos de entrenamiento, licencia, idiomas, evaluación), por lo que la información verificable es muy limitada.

Los metadatos indican que el modelo se ha sometido a un proceso de ajuste supervisado (SFT) mediante la librería TRL, y que forma parte del marco teórico denominado Discrepancy Calculus (DISC), una propuesta de análisis measure-theoretic del desajuste entre la salida esperada y la observada en el entrenamiento. El autor presenta este marco como base conceptual de una familia de modelos alojados en su perfil, con referencias a documentos internos alojados en Hugging Face y citas cruzadas entre ellos.

Por su tamaño (aproximadamente 55 millones de parámetros) y su contexto de publicación, Discovered se sitúa en la categoría de modelos pequeños, adecuados para experimentación, ajuste fino y despliegue en hardware modesto, pero sin datos públicos que permitan avalar capacidades reales de razonamiento, código o multilingüismo. Esta ficha recoge exclusivamente lo que puede verificarse en los metadatos y en la model card, señalando de forma explícita los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `transformers`; no se especifica transformer, MoE, SSM ni híbrida) |
| Parametros totales | 54.657.008 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF, GPTQ, AWQ ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (también compatible con la librería `transformers`) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo: no se indica si es un transformer denso, un modelo MoE, una arquitectura de estado recurrente o un híbrido, ni se detalla la dimensión oculta, el número de capas o de cabezas de atención. Tampoco se especifica la longitud de contexto nativa ni el tokenizador utilizado. Lo único que puede inferirse de los metadatos es que el modelo se carga mediante la librería `transformers` y que sus pesos se distribuyen en formato safetensors.

En cuanto al entrenamiento, las etiquetas `trl` y `sft` indican que se ha aplicado un ajuste supervisado con la librería TRL (Transformer Reinforcement Learning) de Hugging Face, presumiblemente sobre un modelo base no identificado. No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni hiperparámetros concretos. La model card menciona el marco Discrepancy Calculus (DISC) del autor, que introduce conceptos como el operador de discrepancia, los conjuntos de salto y el ghost imprinting, pero no aporta detalles verificables sobre cómo se han aplicado estos conceptos al entrenamiento de este checkpoint concreto.

## Capacidades

- Generación de texto: capacidad esperable por el uso de `transformers` y el ajuste SFT, aunque no se documenta explícitamente ni se aportan ejemplos de uso.
- Razonamiento y matemáticas: no disponible; no hay benchmarks ni descripciones que lo respalden.
- Generación de código: no disponible; no se menciona en la model card.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste fino: al ser un modelo pequeño con pesos safetensors, es susceptible de fine-tuning con TRL, pero no se aportan recetas ni resultados.

## Casos de uso

- Experimentación académica con modelos pequeños: por su tamaño de 54,6 M de parámetros, puede cargarse en una GPU de gama baja o incluso en CPU para estudiar el efecto del SFT con TRL en modelos de reducidas dimensiones.
- Reproducción de pipelines de ajuste supervisado: sirve como ejemplo de checkpoint generado con TRL/SFT, útil para validar flujos de entrenamiento y comparar con modelos base.
- Pruebas de integración con `transformers` y endpoints compatibles: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en Hugging Face Inference Endpoints, lo que permite validar pipelines de serving.
- Docencia y formación: adecuado para demostrar el ciclo completo de publicación de un modelo en el Hub, incluyendo la generación automática de model cards y la carga de pesos safetensors.
- Investigación sobre el marco DISC: el autor vincula el modelo a su marco teórico, por lo que puede emplearse como material de estudio de dicha propuesta, siempre con cautela ante la falta de validación externa.
- Prototipado rápido de aplicaciones de texto de baja exigencia: si se confirma un rendimiento aceptable en generación de texto, podría usarse en demos locales sin requisitos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 54,6 M de parámetros, en fp32 los pesos ocupan aproximadamente 219 MB; en fp16, unos 109 MB; en int8, unos 55 MB. El repositorio completo ocupa 0,7 GB, lo que incluye posibles ficheros adicionales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden alojarlo sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM` o la clase correspondiente), y potencialmente vLLM, TGI o llama.cpp si se generan conversiones a GGUF, aunque no se documentan dichas conversiones.
- Latencia y throughput estimados: no disponibles; al ser un modelo pequeño, la latencia esperada es baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Discovered (reaperdoesntknow) | 54,6 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face |
| DistilGPT-2 (Hugging Face) | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| TinyLlama 1.1B (TinyLlama) | 1,1 B | 2048 tokens | Apache 2.0 | Hugging Face |

La comparación es orientativa: Discovered es más pequeño que GPT-2 small y DistilGPT-2, y no se dispone de datos de rendimiento que permitan situarlo frente a ellos. La ausencia de licencia declarada es una diferencia relevante frente a las alternativas, que cuentan con licencias permisivas bien definidas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluación de sesgos.
- Riesgo de alucinación: no cuantificado; en modelos pequeños sin evaluación, el riesgo de generar contenido incorrecto es alto.
- Limitaciones de contexto o idioma: se desconoce la longitud de contexto y los idiomas soportados; no se recomienda su uso en producción multilingüe sin validación previa.
- Restricciones de licencia: la licencia no está declarada, lo que impide determinar si el uso comercial está permitido; en la práctica, esto supone un riesgo legal para cualquier despliegue comercial.
- Model card incompleta: la práctica totalidad de los campos técnicos están sin rellenar ("More Information Needed"), lo que dificulta la reproducibilidad y la evaluación.
- Vinculación a un marco teórico no revisado por pares: el marco Discrepancy Calculus se presenta mediante documentos alojados en Hugging Face con DOI, pero no se aportan publicaciones externas que lo validen.
- Fecha de creación futura: los metadatos indican creación en 2026-03-09 y actualización en 2026-11-27, lo que puede indicar una fecha simulada o un error de registro; conviene verificar la procedencia del repositorio.
- Sin datos de evaluación: no hay benchmarks, ni ejemplos de uso, ni resultados de pruebas de calidad, por lo que no puede recomendarse para tareas críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Discovered
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento del marco Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Me
- Calculadora de impacto ambiental (referenciada en la model card): https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019) sobre impacto ambiental: https://arxiv.org/abs/1910.09700
