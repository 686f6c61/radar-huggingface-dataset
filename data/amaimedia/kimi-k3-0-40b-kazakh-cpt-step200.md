# AMAImedia/Kimi-K3-0.40B-Kazakh-CPT-step200

## Resumen

Kimi-K3-0.40B-Kazakh-CPT-step200 es un checkpoint experimental de continuación de preentrenamiento (continued pretraining) en kazajo, desarrollado por AMAImedia sobre el modelo base `inference-optimization/Kimi-K3-0.40B`. Se trata de una versión diminuta de la arquitectura Kimi K3, inicializada desde cero y entrenada únicamente con 1,64 millones de tokens de un dataset kazajo de dominio múltiple. El objetivo del proyecto es validar un pipeline completo de adaptación lingüística para kazajo en hardware modesto (una sola NVIDIA T4) y estudiar la adquisición progresiva de morfología y sintaxis en una lengua aglutinante.

El modelo es un artefacto de investigación educativa, no un modelo de producción. Tras 200 pasos de optimización, la perplejidad de validación bajó de 19 millones a 141,72, lo que indica que ha empezado a aprender el alfabeto cirílico kazajo, la puntuación y cierta estructura oracional, pero las generaciones siguen siendo semánticamente incoherentes y contienen palabras inventadas. No es una versión destilada ni comprimida del modelo Kimi K3 entrenado con 2,8 billones de tokens; es una prueba de concepto arquitectónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) causal LM, basada en Kimi K3 tiny |
| Parametros totales | 395.567.400 |
| Parametros activos | no disponible |
| Longitud de contexto | no especificada (secuencia de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kazajo (kk), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Kimi K3 en su variante de desarrollo de 0,40B parámetros. Los pesos se inicializaron desde cero, no provienen de un proceso de destilación del Kimi K3 completo. El entrenamiento consistió en un objetivo de modelado de lenguaje causal sobre el dataset `kz-transformers/multidomain-kazakh-dataset`, con una longitud de secuencia de 512 tokens y un batch efectivo de 8.192 tokens. Se realizaron 200 pasos de optimización con una tasa de aprendizaje inicial de 3e-4, ejecutados en una única GPU NVIDIA T4 durante aproximadamente 12,7 minutos. La tokenización emplea el tokenizador nativo de Kimi acelerado con Gigatoken. No se aplicaron técnicas como RLHF ni DPO; es un preentrenamiento puro.

## Capacidades

- Generación de texto en kazajo y en inglés, aunque con calidad limitada a nivel de forma básica (cirílico, morfología parcial, puntuación).
- Modelado de lenguaje causal con arquitectura MoE experimental.
- Adaptación lingüística temprana: ha comenzado a capturar patrones morfológicos y sintácticos del kazajo.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio.
- Capacidades multilingües limitadas: el inglés es el idioma base del tokenizador, pero el entrenamiento se centró en kazajo.

## Casos de uso

- Estudio de adquisición de lenguas aglutinantes: permite observar cómo una arquitectura MoE pequeña aprende morfología kazaja (sufijos, casos, armonía vocálica) a partir de pocos tokens.
- Validación de pipelines de preentrenamiento: sirve como prueba de humo para verificar que un flujo de datos, tokenización y entrenamiento funciona correctamente en Kaggle o entornos similares.
- Inspección de la arquitectura Kimi K3 en miniatura: útil para desarrolladores que quieran analizar el comportamiento de un MoE pequeño sin necesidad de ejecutar el modelo completo de 2,8T.
- Comparación de checkpoints intermedios: permite estudiar cómo evoluciona la perplejidad y la calidad generativa a lo largo de pasos de entrenamiento (este es el paso 200).
- Docencia en NLP: ejemplo práctico de continued pretraining con recursos mínimos, ideal para cursos sobre adaptación de modelos a idiomas de bajos recursos.
- Pruebas de integración de tokenizadores: verificar la compatibilidad del tokenizador Kimi con texto kazajo y su aceleración mediante Gigatoken.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos reportados son métricas de validación durante el entrenamiento:

| Metrica | Antes del entrenamiento | Despues de 200 pasos |
|---|---|---|
| Perdida de validacion | 16,7615 | 4,9539 |
| Perplejidad de validacion | 19.030.254 | 141,72 |

Estos valores reflejan una mejora drástica, pero siguen indicando un modelo no funcional para tareas reales.

## Requisitos de hardware

- Inferencia viable en cualquier GPU consumer con al menos 1 GB de VRAM (el modelo ocupa 0,8 GB en safetensors; en float16 cabría en ~0,8 GB).
- Entrenamiento realizado en una sola NVIDIA T4 (16 GB), por lo que la inferencia es trivial en RTX 3060, RTX 4090, etc.
- Despliegue posible con transformers estándar, usando `device_map="auto"` y `dtype=torch.float16`.
- No se han probado ni documentado opciones como vLLM, llama.cpp u Ollama; al ser un modelo experimental con `trust_remote_code`, puede requerir adaptaciones.
- Latencia y throughput no disponibles; al ser un modelo de 0,4B, se espera una generación muy rápida en GPU moderna.

## Comparativa con modelos similares

No hay modelos comparables publicados con las mismas características (MoE tiny adaptado a kazajo). Alternativas generales para kazajo:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kimi-K3-0.40B-Kazakh-CPT (este) | 395M (MoE) | 512 (entrenamiento) | MIT | Experimental, no apto para producción |
| Modelos kazajos basados en mT5 o XLM-R (p. ej., KazNERD, KazT5) | 300M-1B | 512-1024 | varía | Enfocados en tareas específicas, no generativos |
| Modelos generativos multilingües (p. ej., mGPT, XGLM) | 1.7B-7.5B | 2048 | Apache 2.0 | Cubren kazajo pero con menor especialización |

No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Modelo experimental de smoke-test: no debe usarse en producción, ni para tareas factuales, críticas o de seguridad.
- Generaciones semánticamente incoherentes y con palabras inventadas tras solo 1,64M tokens de entrenamiento.
- No es una versión destilada ni comprimida del Kimi K3 real (2,8T parámetros); es una arquitectura de desarrollo con pesos aleatorios inicializados.
- Contexto limitado: la secuencia de entrenamiento fue de 512 tokens, por lo que no se garantiza un buen comportamiento con contextos largos.
- Cobertura lingüística parcial: aunque el tokenizador soporta inglés, el entrenamiento se centró en kazajo; la calidad en inglés no ha sido evaluada.
- Requiere `trust_remote_code=True` en HuggingFace, lo que implica ejecutar código personalizado del autor.
- La licencia MIT permite uso comercial, pero el estado del modelo lo hace inadecuado para cualquier aplicación real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/Kimi-K3-0.40B-Kazakh-CPT-step200
- Modelo base: https://huggingface.co/inference-optimization/Kimi-K3-0.40B
- Dataset de entrenamiento: `kz-transformers/multidomain-kazakh-dataset` (no se ha encontrado URL directa en la informacion proporcionada)
