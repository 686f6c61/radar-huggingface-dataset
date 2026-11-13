# hUh63/Qwen3.8-9B-Decensored-MTP-Q4_K_M-GGUF

## Resumen

Qwen3.8-9B-Decensored-MTP-Q4_K_M-GGUF es una conversión a formato GGUF, decensurada y cuantizada, del modelo empero-ai/Qwen3.8-9B-Distill, que a su vez es una destilación de parámetros completos de Qwen3.8 2.4T-A95B sobre la arquitectura Qwen3.5-9B del equipo Qwen (Alibaba). El autor de la conversión es hUh63, que publica el artefacto bajo licencia Apache-2.0 heredada de la línea base. El modelo es multimodal (image-text-to-text), con torre de visión y cabeza MTP (multi-token prediction) integrada para decodificación especulativa en un único archivo.

La propuesta diferencial de este build es triple: primero, aplica un proceso de decensurado mediante Heretic v2.1.0.dev0 (snapshot de desarrollo, no versión estable) con ARA y Optuna TPE, debilitando deliberadamente la alineación de seguridad del modelo original; segundo, conserva la cabeza MTP del ancestro BF16, que `transformers 5.20.2` no mapea en su `state_dict`, reconstruyéndola byte a byte desde el checkpoint original; tercero, cuantiza el tronco de texto a Q4_K_M con matriz de importancia (imatrix) y mantiene la MTP en Q6_K para estabilizar la aceptación del borrador especulativo.

Es relevante ahora porque demuestra un flujo reproducible de decensurado sobre pesos BF16 completos (no sobre GGUF ya cuantizado, que sería una doble pasada con pérdida) y porque integra decodificación especulativa sin modelo borrador separado, algo poco habitual en publicaciones GGUF de la comunidad. El autor advierte explícitamente de que no se ejecutó ningún benchmark estándar (MMLU, GSM8K, etc.) sobre este build, por lo que la capacidad efectiva no debe asumirse igual al original alineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) sobre Qwen3.5-9B, con torre de visión y cabeza MTP/NextN integrada (33 bloques en el GGUF) |
| Parametros totales | 456.010.480 (dato real de safetensors reportado en la ficha de HF); el nombre comercial indica 9B |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (tronco de texto, con imatrix); Q6_K (capa MTP `blk.32.*`); F16 (proyector de visión `mmproj-F16.gguf`); BF16+F32 (proyector alternativo del tag Ollama) |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 7,7 GB |

## Arquitectura y entrenamiento

El modelo base es una destilación de parámetros completos de Qwen3.8 2.4T-A95B (un MoE de 2,4 billones de parámetros totales y 95B activos) hacia la arquitectura Qwen3.5-9B, realizada por Empero. Sobre esa arquitectura se añade una torre de visión (pipeline image-text-to-text) y una cabeza MTP de una capa (`mtp_num_hidden_layers=1`, 15 tensores `mtp.*` en el ancestro BF16). El proceso de decensurado se aplicó con Heretic v2.1.0.dev0 (commit `75a640b7eb`), usando ARA con Optuna TPE y datasets de sondeo de mlabonne; según el autor, solo se reemplazaron las matrices que ARA modificó realmente, y las 15 tensores `mtp.*`, la torre de visión, los embeddings y todas las normas quedaron byte-idénticos al checkpoint base (con SHA256 registrado en `heretic_ara_report.json`).

La innovación técnica destacable es la integración de la MTP en el propio GGUF: `convert_hf_to_gguf.py` (`_QwenMtpMixin`) lee `mtp_num_hidden_layers = 1`, eleva `block_count` de 32 a 33 y mapea `mtp.*` a `blk.32.nextn.*` / `blk.32.attn_*` / `blk.32.ffn_*`. El mapeo de las dos normas pre-fc es cruzado (`enorm` ← `mtp.pre_fc_norm_embedding`, `hnorm` ← `mtp.pre_fc_norm_hidden`); invertirlo produce un archivo que carga pero genera borradores de baja calidad. El resultado declara `qwen35.nextn_predict_layers = 1`, de modo que la decodificación especulativa usa la cabeza integrada sin `-md` ni modelo borrador separado. La cuantización se midió en una máquina sin GPU (8 núcleos, 16 GiB RAM, torch 2.11.0+cpu, transformers 5.20.2, llama.cpp 93cf736a).

## Capacidades

- Generación de texto conversacional multi-turno en siete idiomas (en, zh, ko, ja, ru, es, fr).
- Razonamiento con cadena de pensamiento (chain-of-thought) heredado del linaje Qwen3.8.
- Generación de código (tags `coder`, `code-generation`), aunque el autor aclara que la especialización "coder" del tag Ollama original era un system prompt de 274 bytes, no pesos afinados.
- Capacidades de visión: entrada image-text-to-text mediante torre de visión y proyector multimodal.
- Tool calling / function calling (tags `tool-use`, `function-calling`).
- Soporte de agentes y razonamiento multi-paso (tag `agent`).
- Decodificación especulativa integrada vía cabeza MTP (`nextn_predict_layers = 1`), sin modelo borrador externo.
- Modo decensurado: la alineación de seguridad del original está deliberadamente debilitada.

## Casos de uso

- Investigación sobre decensurado y alineación: el repo incluye `heretic_study.json`, `heretic_ara_report.json` y `PROVENANCE.md`, lo que permite reproducir y auditar qué tensores cambió ARA y cuáles quedaron intactos; adecuado para estudiar el efecto del decensurado sobre pesos concretos.
- Inferencia local en CPU o GPU de gama media: al ser un GGUF Q4_K_M de 7,7 GB con llama.cpp, cabe en equipos con 16 GiB de RAM sin GPU, como documenta la propia receta de cuantización del autor.
- Aceleración de generación con decodificación especulativa: al llevar la MTP integrada en el mismo archivo, se puede activar el drafting sin descargar ni cargar un modelo borrador aparte, simplificando el despliegue en llama.cpp.
- Procesamiento de documentos con imagen y texto: la torre de visión y el proyector F16 permiten tareas image-text-to-text en local, útil para extracción de información de capturas, formularios o diagramas.
- Asistentes conversacionales multilingües: los siete idiomas declarados cubren casos de atención al cliente o asistentes internos en entornos hispanohablantes, rusohablantes y asiáticos.
- Automatización con herramientas y agentes: los tags de tool-use y agent permiten integrarlo en pipelines donde el modelo decide llamadas a funciones, aunque sin benchmarks publicados que garanticen la fiabilidad en producción.
- Evaluación comparativa de cuantizaciones: el repo incluye `calibration.txt`, `tensor_types.txt` y `QUANTIZATION.md`, lo que facilita reproducir la receta Q4_K_M con imatrix y comparar perplejidad frente a otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que no se ejecutó ningún benchmark estándar (MMLU, GSM8K, etc.) sobre este build y advierte de que no debe asumirse que la capacidad sea igual a la del original alineado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repo pesa 7,7 GB en total (tronco Q4_K_M + proyectores); el tronco de texto Q4_K_M ronda los 5-6 GB y el proyector F16 requiere espacio adicional. La receta de cuantización del autor se ejecutó con 16 GiB de RAM y sin GPU.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con 8 GB o más de VRAM debería alojar el tronco Q4_K_M, pero el autor no publica cifras medidas.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), aunque sin datos de latencia o throughput publicados.
- Opciones de despliegue: llama.cpp (herramienta con la que se generó el GGUF, versión 93cf736a); compatible con el ecosistema GGUF (Ollama, llama.cpp server) siempre que se soporte `nextn_predict_layers` para la MTP.
- Latencia y throughput: no disponible; la decodificación especulativa con MTP integrada debería mejorar la velocidad de generación respecto a un decoding autoregresivo puro, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-9B-Decensored-MTP-Q4_K_M (este) | 456.010.480 (safetensors reportado); nombre comercial 9B | no disponible | Sí (mmproj F16) | Apache-2.0 | GGUF Q4_K_M + Q6_K MTP | Decensurado con Heretic dev; MTP integrada; sin benchmarks |
| empero-ai/Qwen3.8-9B-Distill | no disponible | no disponible | no disponible en la información | Apache-2.0 | BF16 (origen) | Modelo base del que deriva este build; alineado |
| Qwen/Qwen3.5-9B | no disponible | no disponible | no disponible en la información | no disponible en la información | safetensors | Arquitectura destino de la destilación; alineado |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El build debilita deliberadamente la alineación de seguridad del modelo original; el riesgo de cumplimiento es responsabilidad del usuario.
- La cuantización Q4_K_M es con pérdida; no se ejecutaron benchmarks estándar, por lo que la capacidad efectiva no debe asumirse igual al original alineado.
- Heretic v2.1.0.dev0 es un snapshot de desarrollo, no una versión estable; los resultados del decensurado pueden no ser reproducibles con versiones estables.
- La longitud de contexto no está documentada en la información disponible.
- El número de parámetros de la ficha de HF (456.010.480) no concuerda con el nombre comercial "9B"; conviene verificar el conteo real antes de planificar despliegues.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique en este build.
- El soporte de visión depende de los proyectores incluidos (`mmproj-F16.gguf` o el BF16 del tag Ollama); el autor documenta que este último es el del ancestro sin modificar.
- La especialización "coder" no reside en los pesos según el análisis de procedencia del autor, sino en un system prompt del tag original; no debe esperarse un modelo de código afinado.
- Licencia Apache-2.0 permite uso comercial, pero la combinación de decensurado y uso comercial puede acarrear riesgos legales y de reputación no cubiertos por la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hUh63/Qwen3.8-9B-Decensored-MTP-Q4_K_M-GGUF
- Modelo base destilado: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Arquitectura base: https://huggingface.co/Qwen/Qwen3.5-9B
- Heretic (herramienta de decensurado): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil de mlabonne (datasets de sondeo): https://huggingface.co/mlabonne
