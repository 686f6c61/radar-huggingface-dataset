# Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.001

## Resumen

El modelo `Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.001` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante compresión por descomposición en valores singulares (SVD) con un sesgo explícito hacia la seguridad. Lo desarrolla el usuario Jeesup y se publica como material de estudio sobre compresión de modelos y evaluación de seguridad, no como un modelo listo para producción. El objetivo es medir qué ocurre con las capacidades de rechazo y utilidad de un LLM cuando se elimina aproximadamente el 50 % nominal de los parámetros de proyección mediante SVD con una métrica mixta que incorpora momentos de WikiText y de pares prompt-dañino/respuesta-segura.

El checkpoint conserva la arquitectura Llama 3 de 8B parámetros (8.030.261.248 parámetros reales según el safetensors) y se distribuye con pesos densos plegados en formato Hugging Face, es decir, sin factorización explícita para inferencia. La fracción realizada de parámetros de factores es 0,565216, superior al 50 % nominal de eliminación, y no se aplicó fine-tuning de recuperación. Es, por tanto, un piloto unilateral de una técnica de compresión consciente de seguridad, no un modelo afinado para ser más seguro.

Su relevancia es metodológica: propone una forma de evaluar el impacto de la compresión en el comportamiento de rechazo (AdvBench/HarmBench), la sobre-rechazo (XSTest, OR-Bench) y la perplejidad (WikiText-2), publicando los diagnósticos por matriz en `compression.json`. El autor advierte explícitamente de que las mediciones no constituyen una garantía de seguridad y de que el upload no ofrece inferencia factorizada ni aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos plegados tras compresión SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas de Hugging Face) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8B parámetros, sobre el que se aplica una compresión SVD con eliminación nominal del 50 % de los parámetros de proyección. La métrica de entrada es mixta: combina momentos de entrada de WikiText con 0,1 veces los momentos de pares prompt-dañino/respuesta-segura, usando los mismos textos de referencia para ambas familias (incluidas respuestas del profesor Llama-2), renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos. La métrica de salida es la identidad. Los hiperparámetros publicados son: desplazamiento relativo rho = 0,001, lambda global = 0,00373534616475154 y ridge = 1e-05.

El objetivo pondera por igual la entropía cruzada (CE) de respuestas seguras ante prompts dañinos y la CE de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación CE usa 32 y 12 ejemplos separados respectivamente. El autor aclara que, al ser el corpus de métrica mixta más amplio, estos ejemplos están retenidos del gradiente pero no son completamente ajenos a la calibración. No hay fine-tuning de recuperación posterior a la compresión. El autor describe el trabajo como un piloto unilateral y no como un SVD completo con información de Fisher.

## Capacidades

- Generación de texto conversacional heredada de Llama 3 8B Instruct, sujeta a la degradación introducida por la compresión (no cuantificada en la información disponible).
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3.
- Comportamiento de rechazo ante prompts dañinos, evaluado con AdvBench y HarmBench.
- Medición de sobre-rechazo en prompts benignos mediante XSTest y los primeros 500 prompts de OR-Bench con juicio de WildGuard.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de comparación para estudiar cómo afecta la eliminación de componentes SVD a la perplejidad y al comportamiento de rechazo frente a checkpoints con otros valores de rho, lambda o fracción de eliminación.
- Evaluación de seguridad post-compresión: reproducir los pipelines de AdvBench/HarmBench, XSTest y OR-Bench descritos en `experiment/` para medir tasas de ataque exitoso (ASR) y sobre-rechazo sobre un modelo comprimido.
- Estudio de alineación vs. compresión: analizar si la dirección de seguridad aprendida por Llama 3 Instruct sobrevive a una proyección de bajo rango guiada por una métrica mixta, comparando con el modelo base sin comprimir.
- Análisis de matrices individuales: usar `compression.json` para inspeccionar diagnósticos por matriz y correlacionar qué capas concentran la pérdida de capacidad o de comportamiento seguro.
- Reproducibilidad de experimentos: el código y la configuración exacta están en `experiment/`, lo que permite reejecutar el pipeline con otros hiperparámetros sobre el mismo modelo base.
- Docencia y formación: ilustrar en un curso de eficiencia de LLMs el flujo completo de SVD con métrica ponderada, plegado de pesos y evaluación de seguridad asociada.

## Benchmarks y rendimiento

La model card menciona que los archivos de evaluación contienen WikiText-2 PPL, generaciones de AdvBench con juicios de HarmBench y XSTest más los primeros 500 prompts de OR-Bench juzgados por WildGuard, pero no se incluyen los valores numéricos en la información proporcionada.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos densos de 8B parámetros en safetensors, se requiere aproximadamente 16 GB en FP16/BF16 para cargar el modelo, más overhead de activaciones y KV cache. El tamaño del repo es de 16,1 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; GPUs con 16 GB o menos requerirían cuantización, que no se distribuye en este repo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con margen ajustado en FP16; no se proporcionan pesos cuantizados.
- Opciones de despliegue: al ser pesos densos en formato Hugging Face, es compatible con transformers, vLLM y TGI. No se proporciona representación factorizada, por lo que no hay ahorro de memoria por la compresión SVD en este upload.
- Latencia y throughput: no disponibles. El autor indica explícitamente que el upload no establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.001 | 8,03B | no disponible | Checkpoint comprimido por SVD de Llama 3 8B Instruct | llama3 | Hugging Face (15 descargas) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 tokens (modelo base) | Transformer denso | llama3 | Hugging Face (ampliamente disponible) |
| meta-llama/Meta-Llama-3-8B | 8,03B | 8.192 tokens (modelo base) | Transformer denso | llama3 | Hugging Face (ampliamente disponible) |

No se dispone de datos de benchmarks del checkpoint comprimido para comparar rendimiento numérico con el modelo base. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe como un piloto unilateral y no como un SVD completo con información de Fisher; no debe tomarse como representativo de una técnica de compresión consolidada.
- Sin garantía de seguridad: las mediciones de AdvBench/HarmBench, XSTest y OR-Bench son pilotos y no establecen una garantía de comportamiento seguro.
- Sin aceleración: los pesos se publican densos y plegados; el upload no proporciona inferencia factorizada ni demuestra speedup, pese a la reducción nominal del 50 %.
- Sin fine-tuning de recuperación: la degradación de capacidades por la compresión no se ha compensado, por lo que la calidad general puede ser inferior a la del modelo base (no cuantificada en la información disponible).
- Calibración parcialmente vista: los ejemplos de validación CE están retenidos del gradiente, pero no son completamente ajenos a la calibración, lo que puede inflar ligeramente las métricas.
- Idiomas y sesgos: no se documentan sesgos conocidos ni cobertura idiomática; se heredan los del modelo base Llama 3 8B Instruct sin evaluación específica.
- Riesgo de alucinación: no evaluado en la información proporcionada; previsiblemente igual o superior al del modelo base tras la compresión.
- Licencia llama3: el uso comercial está sujeto a la Llama 3 Community License, incluidos los requisitos de atribución y las restricciones de la licencia del modelo base.
- Baja adopción: 15 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.5_rho0.001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Paper de referencia sobre SVD en LLMs: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible como enlace público; el autor indica que el código fuente está bajo `experiment/` dentro del repo del modelo
