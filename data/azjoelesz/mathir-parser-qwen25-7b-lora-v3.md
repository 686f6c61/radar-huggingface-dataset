# AzJoeLesz/mathir-parser-qwen25-7b-lora-v3

## Resumen

`mathir-parser-qwen25-7b-lora-v3` es un adaptador LoRA publicado por el usuario AzJoeLesz sobre el modelo base Qwen2.5-7B-Instruct. Su propósito declarado es el parseo de consultas de recuperación de información matemática (MathIR): transformar enunciados o consultas de naturaleza matemática en una representación estructurada o en una etiqueta de estado. El autor lo identifica internamente como "MathIR parser LoRA v3 (E5)".

El adaptador se entrenó con 400 pasos de SFT sobre un conjunto sintético denominado `mathir-synth-hu` revisión v3, en el que aproximadamente el 45 % de los ejemplos corresponden a casos "no aceptados" (ambiguos, con información insuficiente, contradictorios o no soportados), además de un ejercicio de "moneda justa" cuyo operador de división es `/`. La evaluación se realizó únicamente sobre un conjunto gold congelado.

El repositorio no incluye licencia, idiomas soportados ni resultados numéricos de evaluación, y en el momento de la consulta acumula 0 descargas y 0 "me gusta". Se trata, por tanto, de un artefacto experimental sin validación pública, relevante solo como referencia para quienes trabajen en parseo MathIR sobre la familia Qwen2.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA superpuesto |
| Parámetros totales | 7B heredados del modelo base (Qwen2.5-7B-Instruct); número de parámetros entrenables del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct soporta hasta 128K tokens, sin confirmar en esta ficha |
| Tipos de cuantización | No disponible en el repositorio; al ser un adaptador LoRA requiere fusionarse con la base antes de cuantizar |
| Idiomas soportados | No disponible (el nombre del dataset, `mathir-synth-hu`, sugiere posible foco en húngaro, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La ficha describe un ajuste mediante LoRA sobre Qwen2.5-7B-Instruct, un transformer decoder-only de la familia Qwen2.5. El adaptador se entrenó con 400 pasos de SFT sobre el conjunto `mathir-synth-hu` revisión v3. La composición del dataset se detalla de forma parcial: alrededor del 45 % de los ejemplos son casos "no aceptados", repartidos en cuatro categorías (ambigua, información insuficiente, contradictoria y no soportada), e incluye además un ejercicio de "moneda justa" cuyo operador de división es `/`. No se especifica el número total de tokens, la composición completa del corpus ni si hubo etapas de RLHF o DPO.

Como innovación técnica destacable solo se documenta el diseño del dataset (énfasis en ejemplos negativos o de rechazo y en la normalización del operador de división), orientado a que el modelo aprenda a discriminar consultas mal formadas. La evaluación se declara sobre un conjunto gold congelado, pero no se aportan cifras. No hay información sobre decodificación especulativa, atención lineal ni otras técnicas de eficiencia.

## Capacidades

- Parseo de consultas de información matemática (MathIR): conversión de lenguaje natural o notación matemática a una representación estructurada o etiqueta de estado.
- Clasificación de consultas en cuatro categorías de rechazo: ambigua, información insuficiente, contradictoria y no soportada.
- Normalización de notación, con atención explícita al operador de división `/` según el material de entrenamiento.
- Capacidades generales de generación de texto y razonamiento heredadas de Qwen2.5-7B-Instruct (no verificadas específicamente para este adaptador).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no confirmadas; el dataset sugiere un posible sesgo hacia una única lengua no especificada.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible.

## Casos de uso

- Parseo de consultas en un buscador matemático: el adaptador traduciría una pregunta en lenguaje natural a una consulta estructurada, lo que permitiría indexar y recuperar fórmulas o resultados con mayor precisión.
- Triaje de consultas ambiguas: al haber sido entrenado con ejemplos de ambigüedad e información insuficiente, puede marcar una consulta como no procesable y solicitar aclaraciones antes de lanzar la búsqueda, reduciendo falsos positivos en el motor de recuperación.
- Normalización de notación matemática: unificar variantes de operadores (por ejemplo, `/` frente a otras formas de expresar la división) antes de almacenar o comparar expresiones en una base de datos.
- Filtrado y curación de datasets matemáticos: usar el modelo para etiquetar pares pregunta-respuesta como contradictorios o no soportados y descartarlos en la construcción de corpus de entrenamiento.
- Triage de preguntas en plataformas educativas: clasificar automáticamente las dudas de los estudiantes según el estado de la consulta y enrutarlas al recurso o al docente adecuado.
- Evaluación de sistemas MathIR: emplear el adaptador como componente de referencia en pipelines de evaluación que comprueben si una consulta ha sido interpretada correctamente antes de pasar a la fase de resolución.
- Asistente de resolución guiada: cuando la consulta sea incompleta, el modelo puede formular preguntas de seguimiento, aprovechando su entrenamiento específico en casos de información insuficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente que la evaluación se realizó sobre un conjunto "gold congelado", sin cifras de exactitud, F1, MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones estándar para un modelo de 7B, no verificadas para este adaptador):
  - FP16/BF16: aproximadamente 14-16 GB.
  - Cuantización de 8 bits: aproximadamente 8-9 GB.
  - Cuantización de 4 bits: aproximadamente 4-6 GB.
- El adaptador LoRA debe fusionarse con Qwen2.5-7B-Instruct (o cargarse con PEFT sobre la base) antes de la inferencia; el repositorio tiene un tamaño declarado de 0,0 GB y no incluye los pesos base.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 y despliegues de alto rendimiento; RTX 4090 o RTX 3090 (24 GB) para FP16 con margen ajustado o para 8 bits con holgura.
- Cabe en GPU de consumo: sí, en 4 u 8 bits sobre RTX 3060 de 12 GB, RTX 4070 o superiores; en FP16 requiere al menos 16 GB de VRAM dedicada.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp y Ollama tras fusionar el adaptador y convertir a GGUF, y PEFT para cargar el LoRA directamente sobre la base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mathir-parser-qwen25-7b-lora-v3` | 7B (base) + LoRA | No disponible | Sin datos publicados | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6B aprox. | 128K tokens | Benchmarks públicos de la familia Qwen2.5 | Apache 2.0 (según el modelo base, no confirmado para este repositorio) | Ampliamente disponible |
| Qwen2.5-Math-7B | 7B aprox. | No disponible en esta ficha | Orientado a matemáticas, con benchmarks públicos | No disponible en esta ficha | HuggingFace |
| Mistral-7B-Instruct | 7,3B aprox. | 32K tokens | Benchmarks públicos | Apache 2.0 | HuggingFace |

La comparación con alternativas de la misma categoría se ve limitada porque no existen métricas publicadas para este adaptador. La única referencia sólida es el modelo base sobre el que se construye.

## Limitaciones y advertencias

- Licencia no declarada: no puede confirmarse si se permite el uso comercial, por lo que no debería desplegarse en producción sin aclarar este punto.
- Ausencia total de validación pública: 0 descargas y 0 "me gusta" en el momento de la consulta, sin resultados de evaluación numéricos.
- El repositorio tiene un tamaño declarado de 0,0 GB, lo que obliga a verificar que los pesos del adaptador estén realmente disponibles y sean cargables.
- Entrenamiento muy corto (400 pasos de SFT) sobre un único dataset sintético, lo que aumenta el riesgo de sobreajuste y de baja generalización fuera de la distribución de `mathir-synth-hu`.
- Sesgo de dominio: el adaptador está especializado en parseo MathIR y puede degradar las capacidades generales del modelo base si se usa fuera de ese ámbito.
- Idiomas no declarados: el sufijo `hu` del dataset sugiere un posible foco en húngaro, pero no se confirma; el comportamiento en castellano es desconocido.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente al generar representaciones estructuradas o etiquetas de estado.
- La normalización del operador de división `/` procede de un ejercicio sintético concreto ("moneda justa"), por lo que puede no cubrir otras convenciones notacionales.
- No hay información sobre cuantizaciones publicadas, lo que implica que cualquier despliegue eficiente exige trabajo previo de fusión y conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AzJoeLesz/mathir-parser-qwen25-7b-lora-v3
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante. Las búsquedas devuelven exclusivamente páginas de códigos de descuento de un servicio de catering en polaco, sin relación alguna con el modelo.
