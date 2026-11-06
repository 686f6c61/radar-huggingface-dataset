# Claudioxis/qwen2.5-0.5b-ia-generativa-es-lora

## Resumen

El modelo `Claudioxis/qwen2.5-0.5b-ia-generativa-es-lora` es un adaptador LoRA en castellano (registrado como `es`) desarrollado por Claudio Alcaman Morales sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` (aproximadamente 494 millones de parámetros). Se trata de un experimento académico de ajuste supervisado (SFT) con 60 ejemplos de entrenamiento en español, orientado a explicar conceptos de IA generativa a ejecutivos de empresas chilenas con ejemplos de negocio. El autor lo describe como una "destilación de respuestas" sobre datos sintéticos generados por un profesor LLM (`gpt-6-luna`), sin transferencia de logits ni entrenamiento desde cero.

El adaptador contiene 336 tensores y aproximadamente 8,80 millones de parámetros LoRA, con rango 16 y alpha 32 sobre todos los módulos lineales de atención y MLP del transformer base. Se distribuye como repositorio PEFT (safetensors) que requiere descargar por separado los pesos base de Qwen2.5-0.5B-Instruct para funcionar.

Su relevancia es limitada y de carácter didáctico: la propia model card reporta una nota media de 3,92/10 en el examen de evaluación (frente a 3,67/10 del modelo base), con 0 de 12 ítems alcanzando el umbral aceptable de 7. El autor lo declara explícitamente no validado para decisiones empresariales autónomas, y documenta errores conceptuales (definiciones incorrectas de RAG y LoRA) y aritméticos (17×23 respondido como 401).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA (PEFT) |
| Parametros totales | ~494 M en la base + ~8,80 M en el adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende de la base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la base admite las cuantizaciones habituales de Qwen2.5, pero no se documentan aqui) |
| Idiomas soportados | es (espanol) |
| Licencia | Apache-2.0 (adaptador y base) |
| Formato de pesos | safetensors (adaptador PEFT); requiere pesos base de Qwen2.5-0.5B-Instruct por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de ~494 M de parámetros. El LoRA utiliza rango 16, alpha 32 y dropout 0,05, y se inyecta en los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La corrida documentada es `06_espanol_qwen05_3ep`: 3 épocas, batch size 2, learning rate 1e-4, semilla 42, máximo de 320 tokens por ejemplo y 120 por respuesta, en Python 3.12 con una RTX 3070 Ti en bfloat16.

El corpus de entrenamiento son 60 ejemplos sintéticos en español generados por un profesor LLM, con 12 preguntas de examen separadas para evaluación. Los temas cubiertos son fundamentos de LLM, ingeniería de prompts, RAG, agentes, ajuste fino y evaluación/LLMOps (aunque no hay preguntas de evaluación/LLMOps en el examen). No se emplearon documentos privados de empresas reales según el informe de origen, y tanto la generación de datos como la auditoría fueron asistidas por IA, sin revisión humana independiente.

## Capacidades

- Generación de texto conversacional en español sobre conceptos de IA generativa aplicada a negocio.
- Explicación de temas como fundamentos de LLM, ingeniería de prompts, RAG, agentes y ajuste fino.
- Formato conversacional heredado de Qwen2.5-0.5B-Instruct (chat template de la base).
- Soporte de tool calling / function calling: no documentado para este adaptador (la base Qwen2.5-Instruct lo soporta, pero el ajuste no lo valida).
- Soporte de agentes y razonamiento multi-paso: no validado; de hecho, el tema "Agentes de IA" obtiene 4,00/10 con LoRA frente a 3,67/10 de la base.
- Capacidades multilingües: limitadas al español por el ajuste; la base soporta más idiomas pero el adaptador no los preserva explícitamente.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- material didáctico de apoyo en cursos de IA generativa: el adaptador puede generar explicaciones introductorias en español sobre RAG, prompts o agentes para complementar apuntes, siempre con revisión humana dado su nivel de acierto.
- Demostración de un pipeline completo de fine-tuning LoRA: sirve como ejemplo reproducible (script `probar_modelo.py`, `configuracion_entrenamiento.json`) para enseñar SFT sobre un SLM en una GPU de consumo como la RTX 3070 Ti.
- Prototipado de asistentes internos de bajo coste: al ejecutarse en CPU o GPU modesta, permite validar interfaces conversacionales antes de invertir en modelos mayores, aceptando que la calidad es experimental.
- Generación de borradores de contenido formativo para empresas: puede producir primeros borradores de píldoras explicativas sobre conceptos de IA, que un experto debe corregir y validar.
- Investigación sobre evaluación de SLMs: el repositorio incluye métricas agregadas (`evaluacion_resumen.json`) y comparación base vs. LoRA por tema, útil para estudiar la eficacia de SFT con pocos ejemplos.
- Pruebas de regresión de pipelines PEFT: sirve para verificar la integración de `transformers` + `peft` con Qwen2.5-0.5B-Instruct y el chat template en entornos de CI ligeros.
- No recomendado para atención al cliente en producción, decisiones financieras, legales, sanitarias o de contratación, según la propia model card.

## Benchmarks y rendimiento

Evaluación original del autor con juez LLM (escala 1–10, umbral aceptable 7), 12 preguntas de examen:

| Tema | n | Base | Con LoRA |
|---|---:|---:|---:|
| Agentes de IA | 3 | 3,67 | 4,00 |
| Ajuste fino | 2 | 4,00 | 3,50 |
| Fundamentos de LLM | 2 | 3,00 | 4,00 |
| Ingeniería de prompts | 3 | 5,33 | 4,00 |
| RAG | 2 | 1,50 | 4,00 |
| **Total** | **12** | **3,67** | **3,92** |

Mejora media: +0,25 puntos. Ítems con nota ≥7: 1/12 antes y 0/12 después. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y el autor advierte que la muestra es pequeña, el juez es estocástico y el examen se reutilizó en la selección de configuraciones.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa ~35 MB en safetensors; el modelo base Qwen2.5-0.5B-Instruct necesita aproximadamente 1 GB en bfloat16 y menos de 1 GB en cuantización de 4 bits (estimación estándar para 0,5 B, no medida en la información proporcionada).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM; el autor entrenó en una RTX 3070 Ti (8 GB) y el script de inferencia funciona también en CPU.
- Cabe en GPU de consumo: sí, en RTX 3050/3060/4060 y superiores, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` + `peft` (método documentado con `probar_modelo.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador. Publicar el repositorio no crea endpoint de inferencia alojado.
- Latencia y throughput: no disponibles; no se han medido SLA ni coste por consulta bajo carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen2.5-0.5b-ia-generativa-es-lora (este) | ~494 M base + 8,80 M LoRA | no disponible | Apache-2.0 | Hugging Face, PEFT | Adaptador educativo en español; 3,92/10 en examen propio |
| Qwen2.5-0.5B-Instruct (base) | ~494 M | no disponible en la informacion | Apache-2.0 | Hugging Face | Modelo base sin ajuste; 3,67/10 en el mismo examen |
| SLM Qwen 0.5B · IA generativa aplicada a empresas (Chile) | ~494 M | no disponible | Apache-2.0 | Hugging Face | Versión completa del mismo autor para uso directo con Transformers |
| SmolLM2 (corridas previas del autor) | no disponible | no disponible | no disponible | Hugging Face | Experimentos distintos, no forman parte de este adaptador |

No se dispone de datos de benchmarks estándar para comparar con alternativas de la misma categoría (SLMs en español), por lo que la comparativa se limita a los artefactos documentados por el autor.

## Limitaciones y advertencias

- Calidad insuficiente para producción: nota media 3,92/10 y 0/12 ítems por encima del umbral aceptable de 7.
- Errores conceptuales documentados: definiciones incorrectas de RAG y LoRA en pruebas nuevas.
- Errores aritméticos: el producto 17×23 fue respondido como 401 (correcto: 391).
- Riesgo de alucinación, truncamiento de respuestas, repeticiones e instrucciones inadecuadas.
- Sesgos: no evaluados; el corpus son 60 ejemplos sintéticos generados por un LLM, con sesgos potenciales del profesor no auditados.
- Limitaciones de idioma: ajustado solo a español; el rendimiento en otros idiomas no está validado.
- Muestra de evaluación muy pequeña (12 ítems), juez LLM estocástico que también generó las referencias, examen reutilizado en selección de configuraciones y ausencia de preguntas de Evaluación/LLMOps.
- Sin evaluación humana independiente ni demostración estadística de mejora; el rendimiento fuera del examen puede ser peor.
- Licencia Apache-2.0 para adaptador y base, pero no concede derechos sobre datasets externos ni sustituye los términos del proveedor de los datos sintéticos; el uso productivo requiere revisión legal separada.
- No usar como única base para decisiones legales, financieras, de contratación, de seguridad o de salud.
- No se han medido SLA, coste por consulta bajo carga ni ahorro frente a APIs comerciales.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Claudioxis/qwen2.5-0.5b-ia-generativa-es-lora
- Versión completa del mismo autor: https://huggingface.co/Claudioxis/slm-qwen-0.5b-ia-generativa-chile
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
