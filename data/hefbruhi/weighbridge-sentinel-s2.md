# hefbruhi/weighbridge-sentinel-s2

## Resumen

Weighbridge Sentinel S2 es un adaptador LoRA de investigación sobre el modelo base CohereLabs/tiny-aya-global, desarrollado por el usuario hefbruhi en el marco del proyecto Weighbridge. No es un modelo de propósito general: se trata de un control de respuesta conocida (known-answer control) diseñado para verificar pantallas de seguridad y probar una técnica de reparación sin entrenamiento. El adaptador se entrenó exclusivamente con datos benignos de problemas de matemáticas de primaria con solución desarrollada, extraídos de openai/gsm8k.

El propósito del adaptador es servir como referencia experimental: el proyecto Weighbridge investiga si la deriva de seguridad de un fine-tune puede detectarse a partir de los pesos del modelo. La pre-registración del proyecto anticipaba que el ajuste en matemáticas (S2) no degradaría las negativas de seguridad o incluso las reforzaría, hipótesis que este adaptador permite contrastar empíricamente.

El modelo es de tamaño muy reducido (0,1 GB de repositorio, adaptador LoRA de rango 16 sobre un modelo base de tipo tiny-aya), con licencia MIT para el adaptador, aunque el uso queda sujeto a la licencia del modelo base. El autor advierte explícitamente que no debe desplegarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer CohereLabs/tiny-aya-global |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiny-aya-global no especifica parámetros en la información disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 1024 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT (adaptador); el modelo base se rige por CC-BY-NC 4.0 con el anexo de uso aceptable de Cohere |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado sobre las proyecciones down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj y v_proj del modelo base CohereLabs/tiny-aya-global (revisión af89d21). El entrenamiento se realizó con AlignTune 0.1.35 (backend TRL) durante 250 pasos, con tasa de aprendizaje 0,0002, batch efectivo de 8, longitud máxima de 1024 tokens, precisión fp16 y semilla 0. La pérdida final registrada fue de 0,2836448192596436.

Los datos de entrenamiento provienen de openai/gsm8k (configuración main, split train), con 2000 filas extraídas con semilla 0 y licencia MIT. Cada fila se formateó como un turno usuario/asistente renderizado con la plantilla de chat propia del modelo, incluyendo el preámbulo de sistema. No se emplearon datos dañinos ni técnicas de RLHF o DPO; el adaptador se entrenó únicamente con datos benignos como control experimental.

## Capacidades

- Resolución de problemas matemáticos de primaria con respuesta desarrollada, gracias al ajuste sobre gsm8k.
- Generación de texto conversacional en formato de turnos usuario/asistente según la plantilla de chat del modelo base.
- Herencia de las capacidades del modelo base tiny-aya-global (no detalladas en la información disponible).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de fine-tunes: el adaptador sirve como control de respuesta conocida para evaluar si las pantallas de seguridad detectan deriva a partir de los pesos, dado que su comportamiento esperado está pre-registrado.
- Validación de técnicas de reparación sin entrenamiento: permite comprobar si una reparación training-free restaura las negativas de seguridad del modelo base tras un ajuste benigno.
- Estudio de la relación entre datos de entrenamiento y tasas de negativa: al conocer exactamente el dataset (gsm8k, 2000 filas, semilla 0), se puede correlacionar la composición de datos con el comportamiento de rechazo.
- Reproducibilidad experimental: la configuración completa (rango, alpha, pasos, learning rate, semilla) permite replicar el entrenamiento y verificar resultados.
- Evaluación comparativa de adaptadores: junto con los adaptadores S1a, S1b y S3 del mismo proyecto, permite contrastar el efecto de distintos tipos de ajuste sobre la seguridad.
- Docencia y formación en seguridad de IA: sirve como ejemplo didáctico de diseño de controles con respuesta conocida en experimentos de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento (0,2836448192596436).

## Requisitos de hardware

- VRAM estimada: no disponible; el adaptador ocupa 0,1 GB y se suma al modelo base tiny-aya-global, de tamaño reducido.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del adaptador, es probable que quepa en GPU de consumo, aunque no se confirma.
- Opciones de despliegue: PEFT (librería indicada), con integración habitual en transformers; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Weighbridge Sentinel S2 | Adaptador LoRA sobre tiny-aya-global | no disponible | no disponible | MIT (adaptador) / CC-BY-NC 4.0 (base) | Hugging Face (0 descargas) |
| CohereLabs/tiny-aya-global | Modelo base | no disponible | no disponible | CC-BY-NC 4.0 con anexo de uso aceptable | Hugging Face |
| Adaptadores S1a, S1b y S3 del proyecto Weighbridge | Adaptadores LoRA del mismo proyecto | no disponible | no disponible | no disponible | Mencionados en la model card, sin enlaces |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- El adaptador puede rechazar menos peticiones que el modelo base; el autor indica explícitamente que no debe desplegarse.
- Uso previsto exclusivamente para investigación en seguridad; no es apto para producción.
- El modelo base se rige por CC-BY-NC 4.0 con el anexo de uso aceptable de Cohere, lo que restringe el uso comercial aunque el adaptador sea MIT.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles; la longitud máxima de entrenamiento fue de 1024 tokens.
- Sin descargas ni likes en Hugging Face, lo que limita la validación comunitaria.
- No se documentan evaluaciones de seguridad independientes más allá del diseño experimental del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hefbruhi/weighbridge-sentinel-s2
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de entrenamiento: openai/gsm8k (configuración main, split train)
