# dracko14/nanolang-bitnet-b158-700m

## Resumen

dracko14/nanolang-bitnet-b158-700m es un contenedor `.nanow` del checkpoint BitNet b1.58 de 700M de 1bitLLM, publicado por dracko14. No es un modelo entrenado desde cero: reempaqueta los pesos del modelo base `1bitLLM/bitnet_b1_58-large` (MIT) en un único archivo de 350 MiB, con los pesos lineales ya ternarios y empaquetados a 2 bits. La arquitectura es un transformer estilo Llama de 728,8 M de parámetros, 24 capas, contexto de 2.048 tokens y vocabulario de 32.002 tokens; el idioma declarado es solo inglés.

El problema que resuelve es la inferencia de un LLM de 700M en CPU sin PyTorch ni GPU: el runtime NanoLang, basado en numpy y ctypes, decodifica a 22-26 tok/s en cuatro núcleos a 2,0 GHz con un pico de RAM de 754-760 MB. Esto lo hace útil para prototipos, despliegues de bajo coste en VPS y experimentación con cuantización ternaria. La calidad es la del checkpoint upstream, no se mejora ni se degrada; la aportación es el formato de contenedor y el motor de ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama: RMSNorm, RoPE con theta=10.000, SwiGLU, embeddings atados; 24 capas, hidden 1.536, 16 cabezas query y 16 KV, head_dim 96, intermedio 4.096 |
| Parámetros totales | 728,8 M: 679,5 M ternarios + 49,4 M en fp32 |
| Parámetros activos | No aplica, no es MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | Ternaria de 1,58 bits: pesos {-1, 0, +1} empaquetados a 2 bits con una escala f32 por fila; embedding y normas en fp32. No hay GGUF, int8 ni otras variantes en este repositorio |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Contenedor `.nanow` v1, mmap-able y autodescriptivo, con `MANIFEST.json` y `CHECKSUMS.txt`; el checkpoint upstream es `safetensors` fp32 de 2,72 GiB. No se incluyen `safetensors` ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estilo Llama: 24 capas, hidden 1.536, 16 cabezas query y 16 KV, head_dim 96, MLP intermedio 4.096, RMSNorm, RoPE con theta 10.000, SwiGLU y embeddings atados. El vocabulario es de 32.002 tokens (SPM). Los pesos lineales son ternarios {-1, 0, +1} con una escala f32 por fila; el embedding y las normas quedan en fp32. El contenedor `.nanow` v1 es mmap-able y autodescriptivo, con `MANIFEST.json` y `CHECKSUMS.txt`.

El modelo base fue entrenado por 1bitLLM con RedPajama y 100B tokens. No se documentan en la información disponible fases de RLHF, DPO ni una composición más detallada del dataset. Esta release no reentrena: convierte el checkpoint upstream y aplica la cuantización ternaria en el momento de la conversión. La ejecución ternaria sustituye la multiplicación flotante por sumas, restas u omisiones condicionales sobre activaciones cuantizadas dinámicamente a INT8, con acumulación INT32 y un reescalado por fila de salida; en CPUs sin VNNI ni AMX esto es lo que permite obtener 22-26 tok/s.

## Capacidades

- Generación de texto autoregresiva en inglés, con contexto de 2.048 tokens.
- Respuesta a preguntas y razonamiento básico: el checkpoint upstream reporta ARC-e 51,4, ARC-c 21,8, HellaSwag 35,0, BoolQ 59,6, OpenBookQA 20,6, PIQA 67,5, WinoGrande 55,4 y una media de 44,5; son resultados de un modelo de 700M, no de un modelo de razonamiento avanzado.
- Código y matemáticas: no se han publicado resultados ni capacidades específicas en la información disponible.
- Tool calling restringido: el runtime NanoLang implementa un modo de llamada a herramientas con restricciones. En la tarea de selección entre 10 herramientas, la generación libre con prompt completo obtuvo 5/8 llamadas parseables y 5/8 herramientas correctas; el resto de la tabla de evaluación no está disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: el modelo lleva el tag `agent`, pero no se documentan evaluaciones de planificación ni de ejecución multi-paso; no disponible.
- Multilingüe: solo inglés declarado; no se documenta soporte de otros idiomas.
- Visión, audio y modo thinking: no disponibles.
- Inferencia en CPU sin PyTorch ni GPU, con numpy y ctypes; el contenedor se puede mapear en memoria.

## Casos de uso

- Prototipos de generación de texto en CPU: permite ejecutar un LLM de 700M en un portátil o VPS sin GPU, con un contenedor de 350 MiB, 754-760 MB de RAM y 22-26 tok/s; es adecuado para validar pipelines antes de invertir en hardware.
- Despliegue en VPS de bajo coste o entornos sin GPU: el runtime solo necesita numpy y ctypes, y el modelo cabe en 8 GB de RAM; sirve para servicios de generación corta en inglés donde no hay acelerador disponible.
- Selección de herramientas en agentes ligeros: el runtime ofrece tool calling restringido para elegir entre un conjunto acotado de herramientas; en generación libre la model card reporta 5/8 llamadas parseables y 5/8 correctas, por lo que requiere validación de esquema y fallback.
- Extracción de información y etiquetado en inglés: textos que quepan en 2.048 tokens, con plantillas de salida y validación posterior; es realista para clasificación o extracción de campos simple, no para alta precisión sin revisión.
- Investigación sobre cuantización ternaria: permite medir throughput, consumo de RAM y comportamiento de un transformer con pesos {-1, 0, +1} empaquetados a 2 bits, y compararlo con el mismo checkpoint en fp32 o fp16.
- Pruebas de humo y regresión de runtimes de inferencia: el repositorio incluye `verify.py`, `CHECKSUMS.txt` y `MANIFEST.json`, lo que facilita comprobar descargas, reproducibilidad y compatibilidad del contenedor.
- Generación de respuestas cortas o autocompletado en inglés: con 22-26 tok/s en CPU y contexto de 2.048 tokens, encaja en asistentes de baja latencia para respuestas breves, no en conversaciones largas.
- Educación y demostraciones: sirve para explicar en un equipo x86 con AVX2 cómo funciona un LLM ternario de 1,58 bits sin GPU ni PyTorch, usando un archivo de 350 MiB.

## Benchmarks y rendimiento

Resultados reportados por 1bitLLM y reproducidos literalmente en la model card; esta release no los re-ejecuta.

| Modelo | PPL | ARC-e | ARC-c | HellaSwag | BoolQ | OpenBookQA | PIQA | WinoGrande | Avg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP16 700M, reportado | 12,33 | 54,7 | 23,0 | 37,0 | 60,0 | 20,2 | 68,9 | 54,8 | 45,5 |
| BitNet b1.58 700M, reproducido | 12,78 | 51,4 | 21,8 | 35,0 | 59,6 | 20,6 | 67,5 | 55,4 | 44,5 |

Rendimiento medido en CPU por el autor del contenedor:

| Métrica | Valor |
|---|---|
| CPU de referencia | AMD EPYC, 4 núcleos a 2,0 GHz; AVX, AVX2, FMA, BMI1, BMI2, F16C; sin AVX-512, VNNI ni AMX; 8 GB de RAM; sin GPU |
| Decodificación | 22-26 tok/s |
| Prefill con prompt de 18 tokens | 33 tok/s |
| RSS máximo | 754-760 MB |
| Lectura efectiva de DRAM | 7,7-9,1 GB/s |
| Primera versión funcional en el mismo equipo | 1,14 tok/s, aproximadamente 20 veces más lenta |
| Varianza entre ejecuciones | ±5-10 % |

## Requisitos de hardware

- VRAM: no aplica; el runtime medido es CPU, con 0 GB de VRAM.
- RAM: pico de 754-760 MB; contenedor de 350 MiB en disco; el repositorio ocupa 0,4 GB.
- CPU: x86 con AVX, AVX2, FMA, BMI1, BMI2 y F16C; el equipo de referencia es un AMD EPYC de 4 núcleos a 2,0 GHz con 8 GB de RAM y sin swap. No requiere AVX-512, VNNI ni AMX.
- GPU: no se documenta soporte GPU para este contenedor; con la información disponible no se pueden recomendar A100, H100 ni RTX 4090.
- GPU de consumo: no aplica; el objetivo es CPU. Cabe en portátiles x86 modernos con al menos 1 GB de RAM libre, siempre que el runtime soporte su ISA.
- Opciones de despliegue: runtime NanoLang con numpy y ctypes. No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato `.nanow`.
- Latencia y throughput: 22-26 tok/s en decodificación y 33 tok/s en prefill con un prompt de 18 tokens, con varianza de ±5-10 % en el equipo de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Este release, `.nanow` | 728,8 M | 2.048 | Avg 44,5; PPL 12,78 | MIT | Contenedor de 350 MiB; runtime NanoLang; 0 descargas y 1 like en el momento de la consulta |
| `1bitLLM/bitnet_b1_58-large`, upstream | 728,8 M | 2.048 | Mismos pesos; Avg 44,5 | MIT | `safetensors` fp32 de 2,72 GiB; requiere torch y transformers |
| FP16 700M, baseline reportado por 1bitLLM | Aproximadamente 700 M | No disponible | Avg 45,5; PPL 12,33 | No disponible | No disponible; solo aparece como referencia de evaluación |

La comparativa se limita a los datos disponibles. No se han identificado en la información proporcionada otras alternativas con especificaciones verificables.

## Limitaciones y advertencias

- Modelo de 700M: calidad limitada; media de 44,5 en el conjunto reportado. No es apto para decisiones médicas, legales o financieras sin revisión humana.
- Solo inglés: no hay soporte multilingüe declarado.
- Contexto de 2.048 tokens: no admite documentos largos ni conversaciones extensas.
- Riesgo de alucinación y falta de factualidad: no se documentan RLHF, DPO ni filtros de seguridad.
- Tool calling: 5/8 llamadas parseables y 5/8 correctas en generación libre sobre 10 herramientas; requiere decodificación restringida, validación de esquema y fallback. El resto de resultados no está disponible.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento con RedPajama puede reflejar sesgos del corpus.
- Licencia MIT: permite uso comercial y modificación con conservación del aviso de copyright y atribución; revisar la licencia upstream y conservar la atribución a 1bitLLM.
- Formato `.nanow` no estándar: requiere el runtime NanoLang; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI según la información disponible.
- La mitad del contenedor es el embedding fp32, 197,5 MB; la cuantización del embedding a int8 es un TODO, no una característica entregada.
- Benchmarks upstream no re-ejecutados; el rendimiento medido corresponde a un único equipo y tiene una varianza de ±5-10 %.
- No se documenta soporte GPU para este contenedor.

## Enlaces

- [dracko14/nanolang-bitnet-b158-700m](https://huggingface.co/dracko14/nanolang-bitnet-b158-700m)
- [1bitLLM/bitnet_b1_58-large](https://huggingface.co/1bitLLM/bitnet_b1_58-large)
- [The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits, arXiv:2402.17764](https://arxiv.org/abs/2402.17764)
- [Dracko000/nanolang](https://github.com/Dracko000/nanolang)
- [microsoft/BitNet](https://github.com/microsoft/BitNet)
