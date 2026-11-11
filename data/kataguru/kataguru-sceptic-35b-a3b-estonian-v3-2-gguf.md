# kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Estonian-v3.2 es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) especializado en estonio, desarrollado por Datasein Oy (Finlandia) bajo la cuenta corporativa `kataguru`. Se construye sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1 y añade dos expertos dedicados al estonio (gramática, morfología y traducción bidireccional) sobre los 254 expertos congelados del modelo original, alcanzando 256 expertos por capa en 40 capas. Con 35.505.251.456 parámetros totales y aproximadamente 3B activos por token, mantiene las capacidades de razonamiento científico, código, tool calling y visión del modelo base.

El modelo se distribuye principalmente en formato GGUF con cuantizaciones calibradas mediante imatrix sobre datos en estonio (denominadas APEX-Trio: APEX-Small, APEX-Medium y APEX-Good), además de variantes BF16, NVFP4 y W4A16-AWQ en repositorios separados. Su ventana de contexto es de 262.144 tokens y conserva un encoder visual multimodal de 27 capas, además de una cabeza especulativa MTP en la capa 40.

Es relevante para equipos que necesitan un modelo soberano para estonio y finés con capacidades multimodales y agénticas, desplegable en una única GPU de 16-24 GB según la cuantización, y con licencia Apache 2.0. La propuesta combina preservación del rendimiento del modelo base (sin olvido catastrófico declarado) con especialización lingüística mediante calibración de router y banco de datos verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, 40 capas, 256 expertos por capa (254 congelados + 2 expertos estonios), multimodal con encoder visual de 27 capas y cabeza especulativa MTP |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX-Trio (APEX-Small ~11.9 GiB, APEX-Medium ~13.6 GiB, APEX-Good ~15.4 GiB) + mmproj-f16 (~890 MB); NVFP4 (~20.9 GiB); W4A16-AWQ (~19.5 GiB); BF16 (~67.5 GB) |
| Idiomas soportados | en, et, fi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repo); safetensors BF16, NVFP4 y AWQ en repositorios hermanos |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 40 capas y 256 expertos por capa. Los expertos #0 a #253 se heredan congelados del modelo base Kataguru-Sceptic-35B-A3B-v3.1, preservando sus capacidades de razonamiento científico, código, tool calling y PLC/CNC industrial. El experto #254 se especializa en gramática y morfología estonia (14 casos gramaticales, alternancia de grados consonántica y vocálica, morfología aglutinante fínica) y terminología técnica, médica y legal. El experto #255 cubre literatura estonia, no ficción y traducción bidireccional EN<->ET.

El entrenamiento de especialización se realizó con un banco de 900 muestras verificadas humanamente (100% de aprobación en control mecánico y de calidad) y calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). La cuantización GGUF se calibró con un fichero imatrix específico en estonio (`imatrix_calibration_et.txt`) aplicado a los 256 expertos, y la calibración NVFP4/AWQ usó `calib_nvfp4_awq_256_et.jsonl`. Se incluye una plantilla de chat nativa con etiquetas multi-modo (`/et`, `/translate`, `/tõlgi`, `/lihtne`, `[INSPECT]`, `[CURATE]`, `[SURGEON]`, `[DECISION]`). No se detalla en la información disponible el volumen total de tokens de entrenamiento ni la composición completa del dataset del modelo base.

## Capacidades

- Generación de texto y razonamiento científico de nivel graduado (STEM), heredado del modelo base.
- Generación y auditoría de código, con soporte de veredictos estructurados en modo `[INSPECT]`.
- Razonamiento matemático y derivaciones auditables.
- Tool calling / function calling agéntico mediante motor `<tool_call>` con validación AST (BFCL V4 AST 83.67% en el modelo base).
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`) gracias al encoder visual de 27 capas.
- Traducción bidireccional EN<->ET mediante los comandos `/translate` y `/tõlgi`.
- Modo multi-modo con roles conmutables por petición sin reinicio del servidor: inspector forense (`[INSPECT]`), curador de datos (`[CURATE]`), cirujano de datasets (`[SURGEON]`) y motor de decisión (`[DECISION]`).
- Capacidades industriales específicas: PLC/CNC (96.67% en la evaluación del modelo base).
- Multilingüe limitado a inglés, estonio y finés.
- Decodificación especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traducción profesional EN<->ET: el experto #255 y los comandos `/translate` / `/tõlgi` permiten traducir documentos completos con fidelidad terminológica, aprovechando el contexto de 262.144 tokens para mantener coherencia en textos largos.
- Atención al cliente en estonio y finés: conversaciones multi-turno con contexto largo y cambio dinámico de rol sin reiniciar el servidor, adecuado para despliegues con una sola GPU de 24 GB en cuantización NVFP4 o AWQ.
- Auditoría de código y datasets: el modo `[INSPECT]` emite JSON determinista con veredicto (`ACCEPT`/`REJECT`/`REVIEW`) y rechazo temprano en menos de 100 ms, útil en pipelines de control de calidad de SFT.
- Generación de datos sintéticos de entrenamiento: los modos `[CURATE]` y `[SURGEON]` sintetizan muestras con valor de aprendizaje alto (>= 8.5) para ampliar corpus en estonio.
- Procesamiento de documentos escaneados con OCR multimodal: el encoder visual permite extraer y razonar sobre texto en imágenes en inglés, estonio y finés.
- Asistencia técnica industrial en PLC/CNC: consultas sobre programación de autómatas y control numérico con terminología especializada, heredado del modelo base (96.67% en la evaluación industrial).
- Agentes con tool calling en producción: integración en flujos multi-paso con validación AST de llamadas, desplegable vía llama.cpp, Ollama o LM Studio en hardware de consumo.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Kataguru-Sceptic-35B-A3B-v3.1, citados en la model card. No se han publicado resultados específicos del checkpoint estonio v3.2 en la información disponible.

| Benchmark | Modelo base v3.1 |
|---|---|
| Media de 15 benchmarks | 70.26% |
| GPQA Diamond | 70.20% |
| LiveCodeBench v6 | 39.43% |
| BFCL V4 AST | 83.67% |
| Industrial PLC/CNC | 96.67% |

## Requisitos de hardware

- VRAM estimada para inferencia: APEX-Small ~11.9 GiB, APEX-Medium ~13.6 GiB, APEX-Good ~15.4 GiB (más ~890 MB del proyector multimodal mmproj-f16); NVFP4 ~20.9 GiB; W4A16-AWQ ~19.5 GiB; BF16 ~67.5 GB.
- GPU recomendadas: una única GPU de 24 GB (RTX 4090, A10G, L4, A5000) para NVFP4 y AWQ; GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) para APEX-Small/Medium; A100/H100 para BF16 o despliegues multi-usuario.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con NVFP4 o AWQ, y en GPUs de 16 GB con las cuantizaciones GGUF APEX-Small/Medium.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas explícitas en el repo), vLLM para AWQ, y transformers con pesos BF16.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos alternativos en la información proporcionada. Como referencia cualitativa, el modelo se posiciona como un MoE de ~35B totales / ~3B activos con contexto de 262.144 tokens y licencia Apache 2.0, lo que lo sitúa en la categoría de modelos abiertos tipo Qwen3-MoE o Mixtral, pero con especialización en estonio y finés que no ofrecen esos modelos. La comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar un modelo base entrenado mayoritariamente en inglés, es esperable un sesgo hacia esa lengua y su marco cultural.
- Riesgo de alucinación: no se documenta mitigación específica; el modo `[INSPECT]` puede usarse como filtro parcial, pero no elimina el riesgo en generación libre.
- Limitaciones de idioma: cobertura declarada solo para inglés, estonio y finés; el rendimiento en otros idiomas no está garantizado.
- La especialización en estonio se basa en 900 muestras verificadas; el alcance de la cobertura lingüística y terminológica puede ser limitado en dominios muy específicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card reclama derechos de autor sobre módulos expertos y derechos de bases de datos (TekijäL 49 § / 96/9/EC); conviene revisar la titularidad antes de un uso comercial intensivo.
- El repo GGUF ocupa 89.8 GB; la descarga y el despliegue requieren planificación de almacenamiento.
- Los benchmarks publicados corresponden al modelo base, no al checkpoint estonio; el rendimiento real del v3.2 puede diferir.
- La plantilla de chat y los modos multi-modo requieren usar la configuración nativa; otros formatos de prompt pueden degradar el comportamiento.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-GGUF
- Pesos BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2
- NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4
- W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guía de IA soberana: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
