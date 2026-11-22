# hyukudan/Nemotron-3.5-Bolt-E4B-EXL3

## Resumen

Nemotron-3.5-Bolt-E4B-EXL3 es una cuantización en formato EXL3 del modelo NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario hyukudan. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos cuantizados a 4,65 bits efectivos por peso (incluyendo escalas) sobre las capas lineales, con el objetivo de reducir el coste de memoria y de ancho de banda sin degradar en exceso la fidelidad respecto al modelo base en BF16. El paquete está pensado para cargarse exclusivamente en el motor `strix-halo-engine-lab` (familia `gemma4`), no en runners genéricos.

El modelo base es un transformer de NVIDIA con arquitectura denominada E4B (según la nomenclatura del autor), del que no se detallan en la información disponible el número exacto de parámetros totales ni la longitud de contexto. La relevancia de esta publicación radica en su perfil de compromiso: alcanza un 92,94 % de acuerdo Top-1 con el BF16 y un KL medio de 0,0367, superando al GGUF Q4_K_M oficial (87,0 % y 0,141) y leyendo menos bytes de pesos por token (2,70 GB frente a 3,13 GB).

El pack está calibrado con aproximadamente 1,02 millones de tokens en 1.564 documentos en ocho idiomas (EN, ES, FR, DE, IT, PT, ZH, JA), incluyendo código, tool calls y razonamiento largo, lo que lo hace adecuado para despliegues multilingües en hardware de gama alta de consumo o estaciones de trabajo con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (denominación del autor: E4B; familia `gemma4` en el motor) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis-coded (`mul1` codebook) con scaled-Hessian LDLQ; 4 bits en MLP gate/up/down, 5 bits en attention q/o, 6 bits en attention k/v y en output head; lineales per-layer-input en BF16 |
| Idiomas soportados | en, es, fr, de, it, pt, zh, ja |
| Licencia | openmdw-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (no compatible con llama.cpp, vLLM ni TGI; requiere `strix-halo-engine-lab`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de NVIDIA identificado como Nemotron 3.5 Bolt E4B, del que la información disponible no especifica el número de parámetros ni la composición exacta del dataset de preentrenamiento. La cuantización EXL3 se aplica sobre las capas lineales mediante codificación trellis con codebook `mul1` y LDLQ con Hessian escalada, capturando las Hessianas sobre el modelo BF16 original y usando la herramienta `quantize_exl3` de exllamav3.

La calibración emplea aproximadamente 1,02 millones de tokens distribuidos en 1.564 documentos renderizados con la plantilla de chat oficial. La composición incluye ocho idiomas, código, tool calls y razonamiento largo; alrededor del 40 % de los tokens son respuestas generadas por el propio modelo BF16, y el resto proviene de fuentes públicas con licencias permisivas (OpenAssistant oasst2, Wikipedia, código permisivo, Hermes function-calling, OpenThoughts). Los documentos de calibración son disjuntos del conjunto de evaluación. Los tensores no cuantizados (embeddings de tokens, tabla de embeddings por capa, normas, escalares de capa y lineales per-layer-input) se mantienen byte-idénticos al modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat oficial.
- Razonamiento de varios pasos y cadenas de pensamiento largas (el conjunto de calibración incluye datos de razonamiento).
- Tool calling / function calling (calibrado con Hermes function-calling).
- Generación de código (calibrado con fuentes de código permisivo).
- Capacidades multilingües en ocho idiomas: inglés, español, francés, alemán, italiano, portugués, chino y japonés.
- Decodificación especulativa mediante un drafter MTP opcional y prompt lookup en el motor, con identidad de token ids respecto a la decodificación sin drafting.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional multilingüe en producción: el pack cubre ocho idiomas y está calibrado con datos conversacionales, por lo que puede atender usuarios en español, inglés, francés o japonés con una fidelidad del 92,94 % respecto al BF16.
- Agentes con tool calling: la calibración con Hermes function-calling permite integrar el modelo en flujos de agente que invocan APIs externas, con la ventaja de que el motor soporta decodificación especulativa para reducir latencia en bucles multi-paso.
- Generación de código asistida: útil en entornos de desarrollo donde se prioriza la fidelidad al modelo base sobre la velocidad bruta, con 2,70 GB de pesos leídos por token frente a 3,13 GB del Q4_K_M.
- Razonamiento largo y análisis documental: el conjunto de calibración incluye razonamiento extenso, lo que lo hace apto para tareas de análisis que requieren cadenas de pensamiento, siempre que el contexto del modelo base lo permita (dato no disponible).
- Despliegue en estaciones con memoria unificada: medido en un AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S, 128 GB) con 96,4 tok/s en C1 con drafter y 303,0 tok/s agregados en C8, adecuado para servir varias peticiones concurrentes en una única máquina.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el compromiso entre tamaño de descarga (9,71 GB), bytes leídos por token y fidelidad frente a BF16 y Q4_K_M.
- Investigación en cuantización: el pack documenta la metodología (EXL3, LDLQ con Hessian escalada, codebook `mul1`) y los conjuntos de calibración, lo que facilita reproducir o comparar técnicas.

## Benchmarks y rendimiento

| Pesos | Acuerdo Top-1 vs BF16 | KL medio vs BF16 |
|---|---:|---:|
| EXL3 M4 (este repo) | 92,94 % | 0,0367 |
| GGUF Q4_K_M oficial (nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB) | 87,0 % | 0,141 |

| Modelo (perfil del motor) | Descarga GB | Bytes de pesos por token | Top-1 vs BF16 | KL medio vs BF16 | Decode C1 con drafter | Decode C1 plano | C4 | C8 | Prefill 2K | Prefill 8K |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 oficial (referencia) | 16,06 | 9,29 GB | 100 % | 0 | 38,1 | 19,8 | 72,4 | 156,7 | 565 | 534 |
| Q4_K_M oficial, `default` | 6,18 | 3,13 GB | 87,0 % | 0,141 | 91,9 | 55,8 | 169,8 | 237,9 | 535 | 509 |
| Q4_K_M oficial, `fast` | 6,18 | 3,13 GB | 86,7 % | 0,150 | 99,5 | 54,0 | 206,5 | 340,6 | 538 | 509 |
| EXL3 M4, `quality` | 9,71 | 2,70 GB | 92,94 % | 0,0367 | 96,4 | 50,2 | 184,8 | 303,0 | 815 | 746 |
| llama.cpp `74a4fb00`, Q4_K_M oficial | 6,18 | 3,13 GB | — | — | — | 55,5 | 193,3 | 279,9 | 2.062 | 1.881 |

Las celdas de velocidad se midieron en un único AMD Strix Halo (`gfx1151`, 128 GB), decodificación greedy, 256 tokens de chat en inglés. C4 y C8 son tok/s agregados en peticiones concurrentes. La fila BF16 proviene de una sesión anterior. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Descarga total del repo: 9,71 GB, de los cuales 6,98 GB corresponden a las tablas de embeddings BF16 (leídas una fila por token) y 2,54 GB a los lineales cuantizados.
- Lectura de pesos por token generado: 2,70 GB, aproximadamente un 14 % menos que el Q4_K_M GGUF.
- Hardware de referencia medido: AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S `gfx1151`, 128 GB de memoria unificada).
- VRAM estimada para otras GPU: no disponible; el formato EXL3 de este pack solo carga en `strix-halo-engine-lab`, por lo que no se puede desplegar en vLLM, llama.cpp, Ollama ni TGI.
- GPU recomendadas: no disponible más allá del hardware de referencia; el motor está orientado a `gfx1151`.
- Cabe en GPU de consumo: no confirmado; el modelo base en BF16 ocupa 16,06 GB de descarga y el pack 9,71 GB, pero la compatibilidad con GPUs consumer no está documentada.
- Latencia y throughput medidos (Strix Halo, perfil `quality`): 96,4 tok/s en C1 con drafter MTP + prompt lookup, 50,2 tok/s en C1 sin drafting, 184,8 tok/s en C4 y 303,0 tok/s en C8; prefill de 815 tok/s a 2K y 746 tok/s a 8K.

## Comparativa con modelos similares

| Modelo | Formato | Descarga GB | Bytes/token | Top-1 vs BF16 | KL medio | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| EXL3 M4 (este repo) | EXL3 safetensors | 9,71 | 2,70 GB | 92,94 % | 0,0367 | openmdw-1.1 | Solo motor `strix-halo-engine-lab` |
| Nemotron 3.5 Bolt E4B BF16 | safetensors BF16 | 16,06 | 9,29 GB | 100 % (ref.) | 0 | openmdw-1.1 | Hugging Face (nvidia) |
| Nemotron 3.5 Bolt E4B Q4_K_M | GGUF | 6,18 | 3,13 GB | 87,0 % | 0,141 | openmdw-1.1 | Hugging Face (nvidia), llama.cpp y motor |

No se dispone de información sobre otros modelos de la misma categoría (mismo tamaño o tarea) para ampliar la comparativa.

## Limitaciones y advertencias

- El pack solo carga en el motor `strix-halo-engine-lab` (familia `gemma4`, identidad EXL3 `g4-exl3-v3`); no es compatible con llama.cpp, vLLM, TGI, Ollama ni transformers estándar.
- La descarga es un 57 % más grande que el Q4_K_M oficial (9,71 GB frente a 6,18 GB) debido a las tablas de embeddings en BF16, aunque lee menos bytes por token.
- La decodificación plana (sin drafter) es más lenta que el Q4_K_M oficial en C1 (50,2 frente a 55,8 tok/s) y en C4 (184,8 frente a 169,8 tok/s), aunque el perfil con drafter supera al Q4_K_M en C1 (96,4 frente a 91,9 tok/s).
- El prefill es notablemente inferior al de llama.cpp con el mismo Q4_K_M (815 frente a 2.062 tok/s a 2K y 746 frente a 1.881 tok/s a 8K), lo que penaliza cargas con prompts largos.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de sesgo o toxicidad en la información disponible.
- Licencia openmdw-1.1: es necesario revisar sus términos para uso comercial, ya que se etiqueta como `other` y no como licencia permisiva estándar.
- Los datos de rendimiento provienen de una única sesión de medición en un hardware concreto (Strix Halo), por lo que no deben extrapolarse a otras plataformas.
- No se documentan la longitud de contexto ni el número de parámetros del modelo base, lo que limita la planificación de despliegues con requisitos de contexto específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyukudan/Nemotron-3.5-Bolt-E4B-EXL3
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- GGUF Q4_K_M oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Repositorio del motor: https://github.com/hyukudan/strix-halo-engine-lab
- Guía del modelo en el motor: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/models/nemotron-3.5-bolt-e4b/README.md
- README del motor (sección Nemotron 3.5 Bolt E4B): https://github.com/hyukudan/strix-halo-engine-lab#nemotron-35-bolt-e4b
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
