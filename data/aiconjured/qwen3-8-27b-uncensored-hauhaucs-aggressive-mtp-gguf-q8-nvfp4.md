# AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4

## Resumen

Este repositorio contiene una recuantización mixta en NVFP4 del modelo Qwen3.8-27B-Uncensored-HauhauCS-Aggressive, una variante sin censura del Qwen3.8-27B de Alibaba, publicada por el usuario AIconjured. El objetivo es reducir el peso del modelo desde los 31,46 GB del GGUF Q8_K_P original (9,21 bpw) hasta 17,10 GB (5,00 bpw), de modo que quepa con holgura en tarjetas Blackwell de 24 GB (RTX 5060 Ti, 5070, 5080) manteniendo contexto amplio.

La recuantización es selectiva a nivel de tensor: las matrices de cómputo intensivo (FFN y proyecciones de atención) pasan a NVFP4, mientras que los tensores críticos para la calidad (embeddings, lm_head, estado recurrente DeltaNet, normas y cabeza MTP) se conservan en Q8_0, F32 o F16. Se preservan el codificador de visión, el tokenizador y la cabeza NextN/MTP del modelo original.

Es relevante porque demuestra una técnica práctica de despliegue local de modelos de 27B en hardware de consumo Blackwell, aprovechando los tensor cores FP4 nativos, sin reentrenar ni modificar los pesos más allá de la cuantización. El modelo base es denso, con 27B parámetros nominales, aunque los safetensors publicados en el repo suman 1.863.907.840 parámetros, un dato que no cuadra con la denominación comercial y que conviene verificar antes de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de visión, capas DeltaNet (atención lineal/SSM híbrida) y cabeza NextN/MTP |
| Parametros totales | 27B (denominación comercial); 1.863.907.840 según safetensors publicados (dato inconsistente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el Modelfile de Ollama; contexto nativo del base no disponible) |
| Tipos de cuantizacion | NVFP4 mixto con Q8_0, F32 y F16 por tensor; fuente Q8_K_P (9,21 bpw); resultado 5,00 bpw |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo principal de 17,10 GB, proyector de visión BF16 de 931 MB y sidecar FastMTP de 903 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 27B con un encoder de visión acoplado mediante un proyector multimodal. Incorpora capas DeltaNet (atención lineal con estado recurrente SSM) combinadas con capas de atención completa, además de una cabeza NextN/MTP (multi-token prediction) que permite decodificación especulativa mediante el sidecar FastMTP de HauhauCS. El recuento de tensores del GGUF es de 866, distribuidos en 64 capas.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original de Qwen ni en la variante HauhauCS. La variante Aggressive se describe como un ajuste que elimina el comportamiento de rechazo (0 de 465 rechazos reportados) y reduce el preámbulo en prompts difíciles, pero no se detalla la metodología de ese ajuste.

La innovación técnica de este repositorio es la recuantización por tipo de tensor: 371 tensores en NVFP4 (ffn_gate, ffn_up, ffn_down en 64 capas; attn_qkv, attn_gate, ssm_out en 48 capas DeltaNet; attn_q y attn_v en 16 capas de atención completa), 115 en Q8_0 (token_embd, lm_head, estado recurrente ssm_beta/ssm_alpha/ssm_convNd, nextn.eh_proj y todas las attn_output), 360 en F32 (normas y parámetros ssm_a/ssm_dt) y 16 en F16 (atención de la capa 64 del MTP). Se generó una importance matrix con llama-imatrix sobre 45 fragmentos de calibración (código, prosa, razonamiento, JSON y prompts agénticos) y se recuantizó con llama-quantize usando --allow-requantize y un archivo de receta por tipo de tensor.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Razonamiento y respuesta directa en prompts difíciles, con comportamiento sin rechazo según el autor (0/465).
- Comprensión de imágenes y vídeo mediante el proyector de visión BF16 (mmproj), que debe descargarse por separado.
- Decodificación especulativa con la cabeza MTP/NextN y el sidecar FastMTP, que el autor cifra en una aceleración de hasta 3x.
- Ejecución en llama.cpp y Ollama, con endpoints compatibles según los tags del repositorio.
- Capacidades de tool calling y function calling: no confirmadas explícitamente en la información disponible.
- Capacidades de agente multi-paso: no confirmadas explícitamente; los prompts de calibración incluyen casos agénticos, pero no se documenta soporte formal.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Inferencia local en GPU Blackwell de 24 GB: el perfil mixto de 17,10 GB permite cargar el modelo completo con contexto de 32K en una RTX 5060 Ti, 5070 o 5080, algo inviable con el Q8_K_P de 31,46 GB.
- Asistente conversacional sin filtros para investigación: útil en estudios sobre comportamiento de modelos sin alineación de rechazo, con la advertencia de que la ausencia de censura implica riesgos de contenido.
- Análisis de documentos extensos: los 32.768 tokens de contexto permiten procesar contratos, informes o expedientes completos en una sola pasada sin fragmentación.
- Procesamiento de imágenes y vídeo en local: con el proyector BF16 se pueden describir capturas, diagramas o fotogramas en flujos offline donde no se quiere enviar datos a la nube.
- Generación de código asistida en estación de trabajo: el modelo cabe en una GPU de consumo y puede integrarse en editores o terminales mediante llama.cpp u Ollama, aunque el soporte de tool calling no está confirmado.
- Prototipado rápido de pipelines agénticos: la decodificación especulativa con FastMTP reduce la latencia en bucles de razonamiento multi-paso, siempre que se aplique el parche de runtime de HauhauCS.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local, evita la exposición de información sensible a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 17,10 GB para los pesos en NVFP4 mixto, más overhead de contexto KV; con 32K de contexto conviene reservar entre 20 y 22 GB en total.
- Proyector de visión: 931 MB adicionales si se requiere entrada de imagen o vídeo.
- Sidecar FastMTP: 903 MB adicionales si se activa la decodificación especulativa.
- GPU recomendadas: NVIDIA Blackwell (RTX 5060 Ti, 5070, 5080) por los tensor cores FP4 nativos; en generaciones anteriores (Ada, Ampere) el NVFP4 se ejecutará con menor eficiencia o requerirá de-cuantización parcial.
- Cabe en GPU de consumo Blackwell de 24 GB; en tarjetas de 16 GB no cabe con contexto amplio.
- Opciones de despliegue: llama.cpp y Ollama (documentados); vLLM y TGI no están confirmados para este formato NVFP4.
- Latencia y throughput: no disponibles; el autor afirma hasta 3x de aceleración con FastMTP frente a decodificación estándar, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NVFP4 mixto) | 27B nominales | 32.768 | NVFP4 + Q8_0/F32/F16, 17,10 GB | No disponible | GGUF en Hugging Face |
| HauhauCS Qwen3.8-27B-Uncensored-Aggressive Q8_K_P | 27B nominales | No disponible | Q8_K_P, 31,46 GB | No disponible | GGUF en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B nominales | No disponible | BF16 y cuantizaciones estándar | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; no se puede asumir uso comercial sin verificar la licencia del modelo base Qwen3.8-27B y de la variante HauhauCS.
- El modelo es explícitamente "uncensored": no aplica rechazos, lo que implica riesgo de generar contenido dañino, ilegal o sesgado sin filtro. No es apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual para esta variante.
- La inconsistencia entre los 27B nominales y los 1.863.907.840 parámetros de los safetensors publicados debe resolverse antes de planificar el despliegue.
- El rendimiento óptimo de NVFP4 depende de hardware Blackwell; en GPUs anteriores puede degradarse el throughput o la calidad efectiva.
- El sidecar FastMTP requiere un parche de runtime específico de HauhauCS, lo que añade complejidad operativa y dependencia de un fork.
- No hay información sobre idiomas soportados ni sobre calidad multilingüe; no se debe asumir un rendimiento uniforme fuera del inglés.
- Los datos de calibración de la importance matrix (45 fragmentos) son limitados; la calidad en dominios muy alejados de esa distribución puede resentirse.
- El repositorio tiene 1.379 descargas y 14 likes, con un único autor no verificado institucionalmente; conviene auditar los pesos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AIconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante HauhauCS de origen: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- DOI del repositorio: https://doi.org/10.57967/hf/10151
- Contacto del autor para cuantizaciones: AIconjured@gmail.com
