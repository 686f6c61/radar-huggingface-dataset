# hUh63/Qwen3.8-9B-Distill-uncensored-heretic-MTP-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF Q4_K_M de `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic`, un modelo de 9B de la familia Qwen3.5 (Alibaba) que ha pasado por un proceso de destilación de un profesor mayor (Qwen3.8 2.4T-A95B) y por una ablación de tipo "abliterated" orientada a eliminar los rechazos. El autor del GGUF, hUh63, no entrena ni modifica los pesos: solo convierte a GGUF, calcula una importance matrix real y cuantiza, manteniendo la cabeza MTP (NextN) dentro del mismo archivo para habilitar decodificación especulativa sin modelo borrador separado.

La innovación práctica del repo es el tratamiento diferencial de la cabeza MTP: el tronco va en Q4_K_M (5,06 BPW de clase) y el bloque `blk.32.*` (las 8 matrices de la cabeza NextN) se fija en Q8_0, con las normas en F32. La idea es que un borrador cuantizado a 4 bits se desvía más del tronco y reduce la tasa de aceptación, que es justo el rendimiento que se pretendía ganar. El autor es honesto al respecto: en sus mediciones la diferencia está dentro del ruido (±0,5 pp de aceptación) y Q8_0 cuesta 102 MiB extra, así que lo presenta como seguro barato más que como victoria medida.

El modelo es relevante para quien quiera ejecutar en local un 9B con ventana de 32k, capacidades multimodales (con el proyector aparte) y decodificación especulativa integrada, asumiendo que el alineamiento de seguridad ha sido debilitado deliberadamente. La licencia es Apache-2.0 heredada de la cadena upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) con cabeza MTP/NextN integrada |
| Parámetros totales | 456.010.480 según safetensors del repo; la model card describe la familia como 9B (dato inconsistente, ver limitaciones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de `llama-server`; el máximo nativo no se especifica) |
| Tipos de cuantización | Q4_K_M en el tronco (mezcla Q4_K/Q6_K, `general.file_type = 15`, 5,06 BPW); Q8_0 en el bloque MTP; F32 en normas; proyector multimodal en F16 |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); 394 tensores, `qwen35.block_count = 33`, `qwen35.nextn_predict_layers = 1` |

## Arquitectura y entrenamiento

La cadena de procedencia es explícita en la model card. El punto de partida es `Qwen/Qwen3.5-9B` (Alibaba, Apache-2.0). Sobre esa arquitectura, Empero produjo `empero-ai/Qwen3.8-9B-Distill`, una destilación de parámetros completos de Qwen3.8 2.4T-A95B (un MoE de 2,4 billones de parámetros totales y 95B activos) hacia el esqueleto denso de 9B, usando aproximadamente 70.000 trazas curadas del profesor. De ahí salen los 15 tensores `mtp.*`, que el autor del GGUF verificó byte a byte mediante peticiones HTTP Range con sha256 por tensor.

Sobre esa destilación, petruhonk aplicó una ablación Heretic (barrido de 60 ensayos coarse→mid→fine) que reporta 6/100 rechazos con una divergencia KL de 0,0306 respecto al modelo destilado. La ablación solo toca `attn.o_proj` y `mlp.down_proj` en las 32 capas principales; el bloque MTP queda con los pesos base intactos, razón por la que la cabeza sigue funcionando como borrador. Finalmente, hUh63 convierte a BF16 GGUF plegando la cabeza como bloque 32, recolecta la imatrix con `--nextn` y cuantiza. El repo incluye `calibration.txt`, `perplexity-corpus.txt`, `tensor_types.txt` y `SHA256SUMS.txt` para reproducibilidad byte a byte desde el GGUF BF16.

La decodificación especulativa se activa con `--spec-type draft-mtp` en llama.cpp, que lee `blk.32.nextn.*` del propio GGUF. No se debe pasar `-md` ni un segundo modelo: el borrador vive dentro del archivo.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Jinja (`--jinja`).
- Razonamiento y generación de código heredados de la destilación del profesor Qwen3.8.
- Tool calling / function calling a través de la ruta habilitada por la plantilla de chat con `--jinja`.
- Capacidades multimodales (imagen y vídeo) mediante el proyector `mmproj-f16.gguf` y `llama-mtmd-cli`.
- Decodificación especulativa integrada vía cabeza MTP/NextN, con hasta 3 tokens borrador por paso (`--spec-draft-n-max 3`).
- Multilingüe en en, zh, es, fr, ja, ko y ru.
- Modo "uncensored": el alineamiento de seguridad ha sido debilitado por ablación, de modo que reduce sustancialmente los rechazos (6/100 reportados).

## Casos de uso

- Asistente conversacional local en estación de trabajo: con 32k de contexto y ~5,9 GB de pesos, se puede servir con `llama-server` en una GPU de consumo y mantener conversaciones largas sin salir del equipo.
- Generación de código en pipelines internos: el soporte de tool calling vía `--jinja` permite integrarlo en flujos de agente que invocan herramientas (ejecutar tests, consultar repositorios) sin depender de una API externa.
- Procesamiento de documentación con imágenes: usando `llama-mtmd-cli` con el proyector F16 se pueden describir capturas, diagramas o fotogramas de vídeo para tareas de indexación o accesibilidad.
- Investigación sobre decodificación especulativa: el repo es un banco de pruebas reproducible (imatrix, corpus de perplejidad y checksums incluidos) para medir tasas de aceptación de cabezas MTP cuantizadas a distintas precisiones.
- Despliegue en entornos con requisitos de privacidad estrictos: al ser Apache-2.0 y ejecutable en local con Ollama o llama.cpp, encaja donde no se permite enviar datos a servicios en la nube.
- Experimentación con modelos sin alineamiento para estudios de seguridad: útil para analizar comportamiento de modelos abliterated y calibrar filtros externos, siempre en entornos controlados.
- Prototipado multilingüe en siete idiomas: útil para demos de chat en español, chino, francés, japonés, coreano y ruso sin cambiar de modelo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones del propio autor sobre su hardware (8 núcleos de CPU, greedy, 6 prompts × 300 tokens), no benchmarks estándar.

| Métrica | Valor |
|---|---|
| Aceptación de borrador MTP Q8_0 (este repo) | 1216 / 1722 = 70,6 % |
| Longitud media aceptada MTP Q8_0 | 3,14 tokens |
| Generación MTP Q8_0 | 9,45 tok/s |
| Aceptación de borrador MTP Q4_K (comparación) | 1213 / 1731 = 70,1 % |
| Longitud media aceptada MTP Q4_K | 3,13 tokens |
| Generación MTP Q4_K | 9,63 tok/s |
| Perplejidad BF16 GGUF | 5,3983 ± 0,45004 |
| Perplejidad Q4_K_M (este repo) | 5,4039 ± 0,44885 (+0,10 % relativo) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,9 GB para los pesos del tronco y la cabeza MTP en Q4_K_M, más overhead de contexto KV cache para 32k tokens.
- El proyector multimodal añade ~918 MB en F16 si se usa visión.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deja margen amplio para contexto largo; tarjetas de 8-12 GB pueden ejecutarlo con contexto reducido.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño; aportan throughput si se sirven muchas peticiones concurrentes.
- Despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`) y Ollama (mediante Modelfile). vLLM y TGI no están documentados para este GGUF en la información disponible.
- Rendimiento medido por el autor: 9,45 tok/s en CPU de 8 núcleos con MTP activo; no hay cifras publicadas para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este GGUF (Qwen3.8-9B-Distill-uncensored-heretic MTP Q4_K_M) | 9B (familia); 456M según safetensors del repo | 32k (ejemplo) | Apache-2.0 | MTP integrado, multimodal con proyector aparte, sin alineamiento |
| `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` (BF16) | 9B | No disponible | Apache-2.0 | Mismo modelo sin cuantizar; referencia de calidad |
| `empero-ai/Qwen3.8-9B-Distill` | 9B | No disponible | No disponible en la información | Destilación previa a la ablación, con alineamiento original |
| `Qwen/Qwen3.5-9B` | 9B | No disponible | Apache-2.0 | Base original de Alibaba, sin destilación ni ablación |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensurado/abliterated: el alineamiento de seguridad está debilitado de forma deliberada y la cuantización no lo restaura. La responsabilidad de uso y del cumplimiento normativo local recae en el desplegador.
- Inconsistencia de tamaño: la model card habla de un modelo de 9B, pero el dato de safetensors del repo indica 456.010.480 parámetros. Conviene verificar el conteo real antes de planificar recursos.
- Q4_K_M es una cuantización con pérdida: el delta de perplejidad de +0,10 % no garantiza ausencia de degradación en tareas de razonamiento intensivo, como advierte el propio autor.
- La ventaja de Q8_0 en la cabeza MTP está dentro del ruido de medición según el autor; no debe presentarse como una mejora demostrada.
- Riesgo de alucinación inherente a un modelo destilado de 9B, agravado por la falta de benchmarks estándar publicados.
- Idiomas cubiertos limitados a siete; no hay evaluación de calidad por idioma en la información disponible.
- Requiere `--spec-type draft-mtp` para aprovechar la cabeza MTP; sin ese flag se carga pero no se ejecuta y no hay aceleración.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/Qwen3.8-9B-Distill-uncensored-heretic-MTP-Q4_K_M-GGUF
- Modelo base directo: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Destilación intermedia: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
