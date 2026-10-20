# guicybercode/Aira-2-portuguese-124M-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF de `nicholasKluge/Aira-2-portuguese-124M`, un modelo de lenguaje de 124.442.880 parámetros especializado en portugués. Lo publica `guicybercode` y no entrena un modelo nuevo: convierte los pesos originales con `llama.cpp` y ofrece tres variantes (Q4_K_M, Q8_0 y F16) para inferencia local. La licencia es Apache-2.0, la misma del modelo base.

El interés es práctico: los archivos pesan entre 91 MB y 253 MB, por lo que se puede ejecutar en CPU o en GPU de gama baja sin infraestructura dedicada. Es útil para probar pipelines GGUF, experimentar con cuantización y desplegar generación de texto en portugués en entornos con recursos limitados. No es un modelo de gran contexto ni de razonamiento complejo; la información disponible no detalla la longitud de contexto ni los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; la información disponible no detalla la arquitectura exacta, aunque el tokenizador y el convertidor empleados son los de GPT-2 |
| Parámetros totales | 124.442.880 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q8_0, F16 |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | `nicholasKluge/Aira-2-portuguese-124M` |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 124M parámetros. La información del repositorio no confirma la arquitectura exacta, pero el tokenizador es GPT-2 (`GPT2Tokenizer`, `vocab.json` + `merges.txt`) y la conversión se hizo con `convert_hf_to_gguf.py` forzando el pre-tokenizer `gpt-2`. El convertidor estándar falló con el error `BPE pre-tokenizer was not recognized` porque los tokens añadidos cambian el hash del tokenizador; por eso se incluye `conv_gpt2pre.py`, un wrapper que ejecuta el mismo convertidor con el pre-tokenizer correcto.

No se han publicado datos sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas del modelo original en la información proporcionada. La única aportación de este repositorio es la conversión a GGUF y la cuantización con `llama-quantize`; no se ha realizado un entrenamiento adicional ni un ajuste fino.

## Capacidades

- Generación de texto y finalización de secuencias en portugués.
- Seguimiento de instrucciones mediante los tokens especiales `<|startofinstruction|>` y `<|endofinstruction|>`.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al portugués; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio, modo thinking ni decodificación especulativa.
- Modelo base sin plantilla de chat integrada; el autor recomienda usar completación directa con los tokens de instrucción.

## Casos de uso

- Prototipado local de asistentes en portugués: con la variante Q4_K_M de 91 MB se puede ejecutar en CPU con `llama.cpp` para validar prompts, formatos de entrada y flujos conversacionales antes de pasar a un modelo mayor.
- Generación de respuestas cortas para FAQ: el modelo puede completar preguntas frecuentes en portugués, pero requiere revisión humana por su tamaño y riesgo de alucinación.
- Educación e investigación sobre cuantización: permite comparar Q4_K_M, Q8_0 y F16 en un modelo pequeño y reproducir el proceso completo con `llama.cpp`.
- Inferencia en dispositivos con recursos limitados: los pesos de 91 MB a 253 MB permiten ejecutar el modelo en equipos sin GPU dedicada, como portátiles modestos o entornos de laboratorio.
- Generación de texto sintético en portugués para experimentos: útil para crear borradores, variaciones léxicas o datos de prueba, filtrando la calidad de las salidas.
- Pruebas de integración de GGUF en herramientas como Ollama o LM Studio: sirve como modelo de prueba barato para validar pipelines de carga, tokenización y generación.
- Chatbot de dominio muy acotado: se puede usar con instrucciones explícitas para responder preguntas simples de un dominio concreto, siempre con validación y sin asumir robustez en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo incluye una prueba de humo para comprobar que los archivos cargan y generan texto en portugués; no es una evaluación de calidad.

| Cuantización | Prompt | Salida |
|---|---|---|
| Q4_K_M | `<|startofinstruction|>Qual é a capital do Brasil?<|endofinstruction|>` | `A capital do Brasil é Brasília.` |
| Q8_0 | `<|startofinstruction|>Qual é a capital do Brasil?<|endofinstruction|>` | `A capital do Brasil é Brasília.` |

## Requisitos de hardware

| Cuantización | Tamaño de pesos | Uso de memoria estimado (solo pesos) |
|---|---:|---:|
| Q4_K_M | 91 MB | ~0,1 GB |
| Q8_0 | 137 MB | ~0,14 GB |
| F16 | 253 MB | ~0,25 GB |

- VRAM estimada para inferencia: no se requiere GPU; el modelo puede ejecutarse en CPU. El runtime de `llama
