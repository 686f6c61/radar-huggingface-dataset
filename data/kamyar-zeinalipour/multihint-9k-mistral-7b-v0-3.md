# Kamyar-zeinalipour/MultiHint-9K-Mistral-7B-v0.3

## Resumen

MultiHint-9K-Mistral-7B-v0.3 es un adaptador LoRA sobre Mistral-7B-Instruct-v0.3, desarrollado por Kamyar Zeinalipour y colaboradores (Universidad de Siena y Universidad de Florencia, segun la autoria del paper), especializado en la generacion de pistas socraticas para preguntas de comprension lectora. Dado un pasaje, una pregunta y su respuesta, el modelo produce una pista breve que orienta al estudiante hacia la solucion sin revelarla. El modelo se presenta en el paper "MultiHint-9K: Orchestrating Human and AI Agency for Scalable Pedagogical Hint Generation" (AIED 2026).

El modelo resuelve un problema concreto en el ambito de la tecnologia educativa: la generacion automatica de andamiaje pedagogico (scaffolding) de calidad en sistemas de tutoria inteligente. En lugar de un ajuste generalista, el adaptador se entrena sobre MultiHint-9K, un corpus de 9.987 tuplas pregunta-respuesta-pista verificadas automaticamente y calibradas por humanos en ingles, italiano y persa.

La relevancia actual radica en su enfoque de bajo coste: al ser un adaptador LoRA (0,7 GB) sobre un modelo base de 7B, permite desplegar un tutor socratico especializado sin reentrenar el modelo completo, con una mejora de ROUGE-L del 57 % sobre el modelo base (0,19 a 0,32) y significacion estadistica (p < 0,001, Wilcoxon con correccion de Bonferroni).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3) con adaptador LoRA (r=32, alpha=64, dropout 0,1) sobre proyecciones de atencion y MLP |
| Parametros totales | 7B en el modelo base; el adaptador LoRA se distribuye como pesos adicionales (repo de 0,7 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se entrena en bf16; el modelo base admite las cuantizaciones habituales de Mistral-7B) |
| Idiomas soportados | Ingles (en), italiano (it), persa (fa) |
| Licencia | Apache 2.0 (licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7.000 millones de parametros. El adaptador emplea rango r=32, alpha=64 y dropout 0,1, aplicado sobre las proyecciones de atencion y MLP. El entrenamiento se realizo durante 3 epocas con AdamW, tasa de aprendizaje 1e-4 con decaimiento coseno, precision bf16 y Flash Attention 2.

Los datos de entrenamiento provienen del dataset MultiHint-9K: 9.987 tuplas de pregunta-respuesta-pista en ingles, italiano y persa, verificadas de forma automatica y calibradas por humanos. El objetivo de entrenamiento es la generacion de pistas socraticas condicionadas a un pasaje, una pregunta y su respuesta. El prompt de inferencia sigue una plantilla fija de "Recall Assistant" que instruye al modelo a producir una pista sucinta sin revelar la respuesta.

## Capacidades

- Generacion de texto especializada en pistas socraticas para preguntas de comprension lectora.
- Generacion condicionada a tripleta pasaje-pregunta-respuesta, con instruccion explicita de no revelar la solucion.
- Capacidades multilingues limitadas a ingles, italiano y persa.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Hereda las capacidades generales de generacion de texto de Mistral-7B-Instruct-v0.3, aunque el ajuste esta orientado a la tarea de generacion de pistas.

## Casos de uso

- Tutoria inteligente en plataformas de lectura: el modelo recibe el pasaje, la pregunta y la respuesta correcta, y genera una pista que orienta al estudiante hacia la respuesta sin desvelarla, integrándose en el flujo de un sistema de tutoria socratica.
- Generacion masiva de pistas para bancos de ejercicios: dado un corpus existente de preguntas de comprension lectora con respuestas, el adaptador produce pistas de forma automatica para enriquecer el material didactico, reduciendo el coste de anotacion manual.
- Sistemas de evaluacion formativa: en plataformas de aprendizaje adaptativo, el modelo puede generar pistas personalizadas tras un fallo del estudiante, sustituyendo la revelacion directa de la respuesta por un andamiaje gradual.
- Investigacion en NLP educativo: como baseline reproducible para experimentos de generacion de pistas pedagogicas, con scripts de entrenamiento y evaluacion publicados en el repositorio del proyecto.
- Soporte multilingue en aulas: para estudiantes de italiano o persa, el modelo genera pistas en su idioma nativo a partir de pasajes y preguntas, cubriendo tres idiomas con un unico adaptador.
- Despliegue de bajo coste en entornos con recursos limitados: al ser un adaptador de 0,7 GB sobre un modelo de 7B, puede servirse en una unica GPU consumer tras aplicar cuantizacion al modelo base, algo inviable con modelos especializados de mayor tamano.

## Benchmarks y rendimiento

| Modelo base | Adaptador | ROUGE-L (base → fine-tuned) |
|---|---|---|
| Llama-3.1-8B | MultiHint-9K-Llama-3.1-8B | 0,20 → 0,32 (+52 %) |
| Qwen2.5-14B | MultiHint-9K-Qwen2.5-14B | 0,23 → 0,31 (+34 %) |
| Mistral-7B-v0.3 | MultiHint-9K-Mistral-7B-v0.3 | 0,19 → 0,32 (+57 %) |
| Mistral-Nemo-12B | MultiHint-9K-Nemo-12B | 0,15 → 0,31 (+100 %) |
| Mistral-Small-24B | MultiHint-9K-Mistral-Small-24B | 0,18 → 0,33 (+71 %) |

Todas las mejoras son estadisticamente significativas (p < 0,001, Wilcoxon con correccion de Bonferroni). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Mistral-7B-Instruct-v0.3 en bf16 requiere aproximadamente 14-15 GB de VRAM; el adaptador LoRA anade una fraccion minima (repo de 0,7 GB). Con cuantizacion de 4 bits del modelo base, el requisito baja a unos 5-6 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en bf16 con alto throughput; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en bf16 sin cuantizar.
- Cabe en GPU consumer: si, en tarjetas con al menos 16 GB de VRAM en bf16 (RTX 4080, RTX 4090) o en tarjetas de 8 GB con cuantizacion de 4 bits del modelo base.
- Opciones de despliegue: transformers con PEFT (carga del adaptador via PeftModel), vLLM (soporte de adaptadores LoRA), TGI y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-L (fine-tuned) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiHint-9K-Mistral-7B-v0.3 | 7B + LoRA | No disponible | 0,32 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| MultiHint-9K-Llama-3.1-8B | 8B + LoRA | No disponible | 0,32 | Licencia Llama 3.1 | Hugging Face (adaptador PEFT) |
| MultiHint-9K-Qwen2.5-14B | 14B + LoRA | No disponible | 0,31 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| MultiHint-9K-Mistral-Small-24B | 24B + LoRA | No disponible | 0,33 | Apache 2.0 | Hugging Face (adaptador PEFT) |

Los cuatro adaptadores pertenecen a la misma coleccion MultiHint-9K y comparten el mismo dataset de entrenamiento; las diferencias de ROUGE-L entre ellos son de 0,01-0,02 puntos. El adaptador sobre Mistral-7B ofrece un equilibrio entre rendimiento (0,32) y coste de despliegue, con licencia Apache 2.0.

## Limitaciones y advertencias

- Modelo especializado: su rendimiento fuera de la tarea de generacion de pistas socraticas no esta evaluado y probablemente sea inferior al del modelo base sin ajustar.
- Riesgo de alucinacion: como todo modelo generativo, puede producir pistas que revelen la respuesta, que sean incorrectas o que no se apoyen en el pasaje proporcionado.
- Cobertura linguistica limitada: solo ingles, italiano y persa; no hay soporte documentado para castellano ni otros idiomas.
- Sesgos: no se documentan analisis de sesgos en la informacion proporcionada; el dataset de entrenamiento puede introducir sesgos culturales o pedagogicos no evaluados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador hereda las condiciones del modelo base Mistral-7B-Instruct-v0.3, que deben verificarse por separado.
- Dependencia del modelo base: requiere descargar y cargar Mistral-7B-Instruct-v0.3 (unos 14-15 GB en bf16) ademas del adaptador.
- Sin datos de benchmarks generales (MMLU, HumanEval, GSM8K) ni evaluaciones de robustez en produccion.
- Fecha de creacion futura (2026-11-11) en los metadatos de Hugging Face, lo que sugiere un artefacto de publicacion anticipada o un error de marca temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-7B-v0.3
- Paper (AIED 2026, CEUR Workshop Proceedings): https://ceur-ws.org/Vol-4248/short11.pdf
- Repositorio GitHub: https://github.com/KamyarZeinalipour/MultiHint-9K
- Dataset MultiHint-9K: https://huggingface.co/datasets/Kamyar-zeinalipour/MultiHint-9K
- Coleccion MultiHint-9K: https://huggingface.co/collections/Kamyar-zeinalipour/multihint-9k-aied-2026-6af4875966cf330a922a1d87
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Adaptador sobre Llama-3.1-8B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Llama-3.1-8B
- Adaptador sobre Qwen2.5-14B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Qwen2.5-14B
- Adaptador sobre Mistral-Nemo-12B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Nemo-12B
- Adaptador sobre Mistral-Small-24B: https://huggingface.co/Kamyar-zeinalipour/MultiHint-9K-Mistral-Small-24B
