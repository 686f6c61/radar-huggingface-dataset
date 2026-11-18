# axom-ai/AxomAI-Zubeen

## Resumen

AxomAI-Zubeen es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) publicado por axom-ai, un proyecto que combina razonamiento matemático simbólico con un modelo base de la familia Qwen2-Math. El modelo se distribuye en formato GGUF bajo licencia Apache 2.0 y está orientado a tareas de matemáticas, cálculo, ciencia y razonamiento simbólico, con integración declarada de SymPy como motor neuro-simbólico.

El modelo se presenta como un sistema conversacional de generación de texto con soporte para inglés, asamés (as) e hindi (hi), lo que sugiere un enfoque regionalizado hacia el noreste de la India (Assam) combinado con capacidades matemáticas generales. Su tamaño compacto (repo de 0,9 GB en GGUF) lo hace apto para despliegue en hardware modesto, aunque la información pública disponible es muy limitada: cero descargas y cero likes en el momento de la ficha, y acceso restringido (gated) que requiere aceptar condiciones en Hugging Face.

La relevancia de este modelo radica en su propuesta de arquitectura neuro-simbólica aplicada a matemáticas con soporte multilingüe poco habitual (asamés), pero conviene tratarlo con cautela: no hay benchmarks publicados, el proyecto es incipiente y la mayor parte de las especificaciones técnicas no están documentadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2-Math, según tags); no se detalla si incorpora componentes neuro-simbólicos propios |
| Parámetros totales | 1.543.714.304 (≈1,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo contiene pesos GGUF; no se detallan los niveles de cuantización disponibles) |
| Idiomas soportados | en, as (asamés), hi (hindi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en Qwen2-Math (tag `qwen2-math`) y que incorpora razonamiento simbólico con SymPy (tags `symbolic-math`, `sympy`, `neuro-symbolic`). Se trata, por tanto, de un transformer decoder-only de aproximadamente 1,5 mil millones de parámetros, presumiblemente derivado de un modelo Qwen2-Math de tamaño pequeño, sobre el que se habría añadido una capa de integración con un motor de cálculo simbólico.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documenta ninguna innovación técnica concreta (decodificación especulativa, atención lineal, etc.). Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto conversacional en inglés, asamés e hindi.
- Razonamiento matemático y resolución de problemas de cálculo y ciencia, según la orientación declarada del modelo.
- Razonamiento simbólico mediante integración con SymPy (tag `neuro-symbolic`), orientado a manipulación algebraica y cálculo exacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistencia en resolución de problemas de cálculo: el modelo puede emplearse para plantear y resolver integrales, derivadas y límites, apoyándose en la integración con SymPy para verificar resultados simbólicos de forma exacta.
- Tutoría matemática multilingüe: útil para explicar conceptos de matemáticas y ciencia en inglés, hindi y asamés, cubriendo una demanda poco atendida por modelos generalistas en lengua asamés.
- Verificación simbólica en pipelines educativos: integrado como paso de comprobación en plataformas de ejercicios automáticos, donde el motor simbólico valida la respuesta del estudiante y el modelo genera la explicación.
- Preprocesamiento de expresiones matemáticas: uso del modelo para normalizar y traducir enunciados en lenguaje natural a expresiones SymPy ejecutables en flujos de cálculo científico.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~1,5 B en GGUF, puede ejecutarse en CPU o en GPUs de consumo para prototipos de asistentes matemáticos locales.
- Investigación en modelos neuro-simbólicos: sirve como caso de estudio de acoplamiento entre un LLM pequeño y un CAS (computer algebra system) para evaluar hasta qué punto el modelo delega correctamente en la herramienta simbólica.
- Generación de contenido científico divulgativo en asamés e hindi: redacción de explicaciones de conceptos de física o matemáticas en lenguas regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1,5 B en GGUF, una cuantización Q4 requiere aproximadamente 1-1,5 GB de memoria; Q8 en torno a 1,6-2 GB; FP16 alrededor de 3 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más, y también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no están confirmados para este formato concreto en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| AxomAI-Zubeen | ≈1,5 B | no disponible | en, as, hi | Apache 2.0 | GGUF | Neuro-simbólico con SymPy; acceso gated |
| Qwen2-Math (1.5B) | ≈1,5 B | no disponible en esta ficha | principalmente en/zh | Apache 2.0 (según familia Qwen2) | safetensors, GGUF | Modelo base matemático del que deriva |
| Qwen2.5-Math (1.5B) | ≈1,5 B | no disponible en esta ficha | multilingüe | Apache 2.0 (según familia Qwen2.5) | safetensors, GGUF | Sucesor de Qwen2-Math con mejoras en razonamiento |
| DeepSeek-Math (7B) | ≈7 B | no disponible en esta ficha | principalmente en/zh | licencia propia de DeepSeek | safetensors | Mayor tamaño y rendimiento matemático, requiere más VRAM |

La comparativa se limita a características estructurales; no hay datos de rendimiento de AxomAI-Zubeen que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad matemática frente a Qwen2-Math u otros modelos de referencia.
- Proyecto incipiente: cero descargas y cero likes en el momento de la ficha, sin comunidad ni validación externa conocida.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la integración automatizada en pipelines.
- Riesgo de alucinación matemática: como todo LLM, puede generar pasos de razonamiento plausibles pero incorrectos; la integración con SymPy mitiga parcialmente este riesgo solo si el modelo invoca correctamente la herramienta.
- Cobertura lingüística limitada a tres idiomas; no se documenta el rendimiento en asamés ni en hindi.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de acceso gated antes de un uso comercial.
- No se documentan sesgos conocidos ni evaluación de seguridad; se recomienda auditoría propia antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/axom-ai/AxomAI-Zubeen
- SymPy (motor simbólico referenciado): https://www.sympy.org
- Qwen2-Math (modelo base referenciado en tags): https://huggingface.co/Qwen/Qwen2-Math-1.5B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
