# Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` mediante una técnica de compresión basada en descomposición en valores singulares (SVD) con un sesgo deliberado hacia la seguridad. El autor, identificado como Jeesup, aplica una proyección de bajo rango que elimina nominalmente el 40 % de los parámetros de proyección, con una fracción real de parámetros factoriales en el modelo completo de 0,652173, y sin fine-tuning de recuperación posterior. El objetivo declarado es explorar si es posible reducir el coste computacional de un modelo de 8 000 millones de parámetros preservando o alterando de forma controlada su comportamiento frente a peticiones dañinas.

El interés técnico reside en que la métrica de entrada combina momentos de WikiText con una fracción (0,1) de momentos derivados de pares prompt-dañino/respuesta-segura, lo que desplaza la representación latente hacia direcciones asociadas a respuestas seguras. Se trata de un piloto unilateral, no de un SVD completo con información de Fisher, y el propio autor advierte que no constituye una garantía de seguridad. Los pesos se publican como matrices densas consolidadas para facilitar la evaluación, no como representación factorial optimizada para inferencia rápida.

Es relevante ahora porque ejemplifica una línea de trabajo incipiente: la compresión de modelos como palanca de modificación de comportamiento (en este caso, seguridad) y no solo de eficiencia. Con 17 descargas y fecha de creación en octubre de 2026, es un artefacto de investigación de nicho, útil para quienes estudian interacciones entre rango, alineamiento y robustez adversarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos densos consolidados tras proyección SVD de bajo rango |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct; el autor no la declara) |
| Tipos de cuantizacion | no disponible (solo se publican safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (matrices densas plegadas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención causal estándar y normalización RMSNorm. Sobre ella, el autor aplica una compresión SVD con eliminación nominal del 40 % de los parámetros de proyección y un desplazamiento relativo rho de 0,001, con lambda global de 0,00373534616475154 y regularización ridge de 1e-05. La métrica de entrada es mixta: momentos de WikiText más 0,1 veces los momentos de pares prompt-dañino/respuesta-segura, usando los mismos textos de respuesta de referencia (incluidas respuestas del profesor Llama-2) renderizados con sus propias plantillas de chat y perfilados con sus propios pesos densos.

El ajuste es un piloto unilateral, no un SVD completo con información de Fisher. La función objetivo pondera por igual la entropía cruzada de respuestas seguras ante prompts dañinos y la de respuestas útiles ante prompts benignos. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos; la validación de entropía cruzada usa 32 y 12 ejemplos separados, que son retenidos del gradiente pero no totalmente ajenos a la calibración. No hay fine-tuning de recuperación tras la compresión. Los pesos se entregan como matrices densas plegadas para evaluación; el presupuesto de rango describe la representación de bajo rango subyacente, pero este repositorio no ofrece inferencia factorizada ni demuestra aceleración.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Llama 3 8B Instruct, sujetos a la degradación introducida por la compresión SVD.
- Seguimiento de instrucciones y diálogo multi-turno, presumiblemente conservados en grado variable; el autor no publica evaluaciones específicas de calidad conversacional más allá de WikiText-2 PPL.
- Capacidad de código y matemáticas: no evaluada en la información disponible; se desconoce el impacto de la compresión en estas tareas.
- Tool calling / function calling: no documentado en este checkpoint; el modelo base lo soporta, pero no hay verificación tras la compresión.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: no documentadas; el autor no declara idiomas.
- Modo de pensamiento explícito, visión o audio: no disponibles.
- Comportamiento de seguridad alterado de forma deliberada: el checkpoint está diseñado para estudiar el desplazamiento de la tasa de éxito de ataques (ASR) frente a prompts dañinos, con métricas de AdvBench/HarmBench y XSTest/OR-Bench.

## Casos de uso

- Investigación sobre compresión y alineamiento: el checkpoint permite medir cómo varía la tasa de éxito adversarial (ASR) y la perplejidad al eliminar un 40 % nominal de parámetros de proyección, sirviendo como punto de comparación en estudios de seguridad de modelos comprimidos.
- Evaluación de robustez adversarial: con los ficheros de evaluación incluidos (AdvBench, HarmBench, XSTest, primeras 500 prompts de OR-Bench juzgadas por WildGuard), se puede reproducir el pipeline de juicio y analizar la coherencia de las generaciones junto con las fracciones puntuadas.
- Estudio de la relación rango-seguridad: al variar rho y lambda en réplicas del experimento, este checkpoint actúa como ancla para trazar curvas de compromiso entre utilidad (PPL en WikiText-2) y seguridad (ASR).
- Análisis de degradación por capa: el fichero `compression.json` con diagnósticos por matriz permite identificar qué proyecciones toleran mejor la eliminación de componentes singulares y cómo afecta a la coherencia.
- Base para experimentos de recuperación: aunque este checkpoint no incluye fine-tuning de recuperación, sirve como punto de partida para estudiar si un ajuste posterior restaura capacidades o reintroduce vulnerabilidades.
- Docencia y formación en seguridad de LLM: como ejemplo reproducible de modificación de comportamiento vía manipulación de pesos, útil en cursos sobre compresión, SVD y evaluación de alineamiento.
- Comparación de metodologías de compresión: frente a cuantización o poda estructurada, permite contrastar el efecto de la proyección SVD sesgada en métricas de seguridad estandarizadas.

## Benchmarks y rendimiento

El autor declara que los ficheros de evaluación contienen WikiText-2 PPL, generaciones de AdvBench con juicios de HarmBench, y XSTest más las primeras 500 prompts de OR-Bench juzgadas por WildGuard. Sin embargo, no se proporcionan los valores numéricos en la información disponible.

| Benchmark | Resultado |
|---|---|
| WikiText-2 PPL | no disponible (el autor indica que existe el fichero, sin cifras) |
| AdvBench / HarmBench ASR | no disponible (el autor indica que existen los juicios, sin cifras) |
| XSTest | no disponible |
| OR-Bench (primeras 500, WildGuard) | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones para el tamaño de 8B, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 con gestión de contexto, y en GPUs de 8-12 GB mediante cuantización 4/8 bits (si se generan los GGUF correspondientes, no incluidos en el repo).
- Opciones de despliegue: al ser pesos densos en safetensors compatibles con la arquitectura Llama 3, es desplegable con vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama (tras conversión) y transformers. No se ofrece inferencia factorizada.
- Latencia y throughput estimados: no disponibles; el autor advierte explícitamente que este upload no establece ninguna aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.001 | 8,03 B (denso, comprimido) | no disponible | llama3 | Piloto de compresión SVD con sesgo de seguridad, sin recuperación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8 192 tokens (modelo base) | llama3 | Modelo de referencia sin compresión; capacidades completas |
| Modelos comprimidos por poda/cuantización de la familia Llama 3 8B | ~8 B o menos efectivos | variable | llama3 | Alternativas de eficiencia sin sesgo explícito de seguridad; no disponibles en la información proporcionada |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que las mediciones piloto no establecen una garantía de seguridad; el desplazamiento hacia respuestas seguras es experimental y no verificado de forma exhaustiva.
- Es un piloto unilateral, no un SVD completo con información de Fisher; los resultados pueden no generalizar a otras configuraciones de rango o métricas.
- Sin fine-tuning de recuperación: es esperable una degradación de la calidad general y de la coherencia, que debe inspeccionarse junto con las métricas de seguridad (el autor recomienda revisar coherencia y fracciones puntuadas, no solo el ASR).
- Los ejemplos de validación de entropía cruzada están retenidos del gradiente pero no son totalmente ajenos a la calibración, dado que el corpus de métrica mixta es más amplio; posible sobreajuste a la calibración.
- Riesgo de alucinación: no evaluado específicamente; la compresión puede agravarlo.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Llama 3 8B Instruct.
- Idiomas soportados: no declarados; se desconoce si la compresión afecta de forma desigual a distintos idiomas.
- Restricciones de licencia: licencia llama3 (Llama 3 Community License), con las obligaciones y restricciones de uso comercial que impone Meta, incluida la cláusula de nomenclatura y las políticas de uso aceptable.
- Los pesos se publican como matrices densas plegadas; no se ofrece representación factorizada ni se demuestra aceleración, por lo que el beneficio de eficiencia no está materializado en este repositorio.
- Fecha de creación en 2026 y solo 17 descargas: artefacto de investigación sin validación comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l3_mixed_remove0.4_rho0.001
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Ficheros de evaluación y código fuente: referenciados por el autor bajo `experiment/` y `compression.json` dentro del propio repositorio (no se proporcionan URLs externas adicionales en la información disponible).
