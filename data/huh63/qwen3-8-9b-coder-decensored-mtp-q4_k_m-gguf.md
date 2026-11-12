# hUh63/Qwen3.8-9B-Coder-Decensored-MTP-Q4_K_M-GGUF

## Resumen

Qwen3.8-9B-Coder-Decensored-MTP-Q4_K_M-GGUF es una cuantización GGUF publicada por el usuario hUh63 a partir de un derivado comunitario "decensored" del modelo de código Qwen3.8-9B. El linaje es relevante para entender qué se está descargando: el ancestro en precisión completa es `empero-ai/Qwen3.8-9B-Distill`, una destilación de parámetros completos de Qwen3.8 2.4T-A95B sobre la arquitectura de `Qwen/Qwen3.5-9B` de Alibaba; sobre ese destilado se aplicó el framework Heretic v2.1.0.dev0 (ARA + Optuna TPE) para debilitar la alineación de seguridad, y finalmente hUh63 convirtió y cuantizó a Q4_K_M con llama.cpp.

El artefacto principal es un GGUF de tronco de texto con 33 bloques, donde el bloque 32 corresponde a la cabeza NextN/MTP (multi-token prediction) integrada, conservada en Q6_K para estabilizar la aceptación del borrador en decodificación especulativa. Se acompaña de un proyector de visión en F16 (`mmproj-F16.gguf`), lo que convierte el paquete en multimodal image-text-to-text. La licencia declarada es Apache-2.0, heredada del linaje base.

Es relevante ahora porque ejemplifica una tendencia doble: la destilación de modelos MoE grandes a densos manejables en local y la publicación de variantes "abliterated" con decodificación especulativa integrada en un solo fichero. No obstante, el propio autor advierte que no se ejecutó ningún benchmark estándar sobre esta build, por lo que la equivalencia de capacidades con el original alineado no está verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-9B, con cabeza NextN/MTP integrada (1 capa MTP) y torre de visión |
| Parámetros totales | 456.010.480 (dato real de safetensors del repo; la denominación comercial "9B" no coincide con este recuento) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (tronco de texto, `general.file_type` 15 = MOSTLY_Q4_K_M); bloque MTP en Q6_K; proyector de visión en F16 (y variante BF16+F32 de LisyNeko) |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 7,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso con arquitectura Qwen3.5-9B, resultado de una destilación de parámetros completos de Qwen3.8 2.4T-A95B (un MoE de gran escala) realizada por Empero. Sobre esa base, el autor aplicó Heretic v2.1.0.dev0 (commit `75a640b7eb`, ARA estándar con Optuna TPE y datasets de sondeo de mlabonne) para reducir los rechazos de seguridad, un proceso de "decensoring" que modifica selectivamente tensores. La innovación técnica destacable es la preservación byte a byte de la cabeza MTP: como `transformers 5.20.2` no mapea los tensores `mtp.*` en `Qwen3_5ForConditionalGeneration`, el autor reconstruyó la entrada de conversión desde el índice original, sustituyendo solo las matrices efectivamente alteradas por ARA y manteniendo los 15 tensores `mtp.*`, la torre de visión, los embeddings y todas las normas idénticos al checkpoint base (con SHA256 documentado en `heretic_ara_report.json`).

La conversión a GGUF usa `convert_hf_to_gguf.py` con `_QwenMtpMixin`, que eleva `block_count` de 32 a 33 y mapea `mtp.*` a `blk.32.nextn.*`, `blk.32.attn_*` y `blk.32.ffn_*`, dejando `qwen35.nextn_predict_layers = 1`. La cuantización se hizo con imatrix sobre un corpus multilingüe, matemático, de código y razonamiento, con `--nextn` para obtener estadísticas de importancia de la capa MTP, y una regla `--tensor-type-file` que fuerza `^blk\.32\..*=Q6_K`. No hay información sobre el número de tokens de entrenamiento del destilado ni sobre si hubo RLHF o DPO en el linaje.

## Capacidades

- Generación de texto conversacional multi-turno en siete idiomas (en, zh, ko, ja, ru, es, fr).
- Generación de código y razonamiento de programación, según el linaje "Coder" del modelo.
- Razonamiento con cadena de pensamiento (chain-of-thought).
- Tool calling y function calling, según los tags del repositorio.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multimodales image-text-to-text mediante el proyector de visión incluido (`mmproj-F16.gguf`).
- Decodificación especulativa integrada mediante la cabeza MTP (tipo `draft-mtp`), sin necesidad de modelo borrador separado.
- Comportamiento "decensored": menor tasa de rechazo ante peticiones que el modelo original alineado declinaría.

## Casos de uso

- Asistencia de código en local: el modelo puede autocompletar y explicar fragmentos en un entorno sin GPU dedicada gracias a la cuantización Q4_K_M y a la decodificación especulativa integrada, que acelera la generación sin modelo borrador adicional.
- Análisis de capturas de pantalla y diagramas: con el proyector de visión F16 se pueden pasar imágenes junto a texto para describir interfaces, extraer texto de diagramas o revisar maquetas.
- Desarrollo de agentes con tool calling: los tags de function-calling y agent permiten integrarlo en bucles de razonamiento multi-paso que invocan APIs o ejecutan comandos, con el contexto conversacional gestionado por el orquestador.
- Prototipado de investigación sobre alineación: al ser una variante decensored con informe de tensores modificados (ARA) y estudio de Optuna, sirve para estudiar el efecto del debilitamiento de salvaguardas sobre las respuestas, siempre en entorno controlado.
- Evaluación de decodificación especulativa MTP: el paquete documenta la receta completa (imatrix con `--nextn`, Q6_K en el bloque 32) y permite medir tasas de aceptación del borrador en llama.cpp con `--spec-type draft-mtp`.
- Traducción y atención al cliente multilingüe: los siete idiomas declarados permiten cubrir conversaciones en español, inglés, chino, coreano, japonés, ruso y francés, aunque sin garantía de paridad de calidad entre ellos.
- Generación de documentación técnica: a partir de código o de capturas de errores, el modelo puede redactar explicaciones y guías, combinando visión y texto en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ningún benchmark estándar (MMLU, GSM8K, etc.) sobre esta build y advierte de que no debe asumirse que las capacidades igualan al original alineado. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo pesa 7,7 GB e incluye el GGUF Q4_K_M, el proyector F16 y el proyector BF16+F32 de 921.705.024 bytes; el tronco de texto Q4_K_M más el proyector F16 deberían caber en torno a 6-8 GB de memoria, pero esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no disponibles en la información proporcionada.
- GPU de consumo: no confirmado por el autor; por tamaño del fichero, es plausible en tarjetas con 8 GB o más, pero no hay verificación publicada.
- Despliegue: llama.cpp (probado con el commit `93cf736a`); el formato GGUF es compatible con otros runners basados en llama.cpp, aunque no se documentan pruebas con vLLM, TGI u Ollama en esta build.
- La cuantización se realizó en una máquina sin GPU (8 núcleos de CPU, 16 GiB de RAM, sin swap), lo que da una idea del mínimo para reproducir el proceso, no para inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-9B-Coder-Decensored-MTP Q4_K_M) | 456.010.480 (safetensors) | No disponible | Apache-2.0 | GGUF | Decensored, MTP integrado, multimodal |
| Qwen/Qwen3.5-9B | No disponible | No disponible | No disponible | No disponible | Base arquitectónica oficial de Alibaba |
| empero-ai/Qwen3.8-9B-Distill | No disponible | No disponible | Apache-2.0 | No disponible | Destilado BF16 de Qwen3.8 2.4T-A95B, alineado |
| LisyNeko/qwen3.8-9b-coder (Ollama) | No disponible | No disponible | No disponible | GGUF Q4_K_M | Artefacto Ollama del que deriva el linaje comunitario |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo debilita deliberadamente la alineación de seguridad del original; el autor califica el riesgo de cumplimiento como responsabilidad del usuario.
- La cuantización Q4_K_M es con pérdida y no se han ejecutado benchmarks que cuantifiquen la degradación respecto al BF16.
- Heretic v2.1.0.dev0 es una instantánea de desarrollo, no una versión estable, y la ejecución se escaló a la baja (pocos trials, lotes pequeños) para caber en 8 núcleos y 16 GiB.
- El recuento real de parámetros (456 millones según safetensors) no concuerda con la denominación "9B", lo que obliga a verificar el artefacto antes de asumir capacidades.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación publicada que lo acote.
- Longitud de contexto no documentada: no debe asumirse una ventana larga sin verificar la configuración del GGUF.
- La paridad de calidad entre los siete idiomas declarados no está verificada.
- La licencia Apache-2.0 se hereda del linaje, pero el uso comercial de una variante decensored puede conllevar riesgos legales y de reputación no cubiertos por la licencia.
- No se debe pasar un segundo modelo borrador con `-md`: la cabeza MTP está integrada en el fichero y la decodificación especulativa es verify-then-accept (sin pérdida en la salida, aunque la cuantización del borrador afecta solo a la tasa de aceptación).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hUh63/Qwen3.8-9B-Coder-Decensored-MTP-Q4_K_M-GGUF
- Modelo base destilado: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Arquitectura base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del linaje: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill/raw/main/README.md
- Heretic (framework de decensoring): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil de mlabonne (datasets de sondeo): https://huggingface.co/mlabonne
