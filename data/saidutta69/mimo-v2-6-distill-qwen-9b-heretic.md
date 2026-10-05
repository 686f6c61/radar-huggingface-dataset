# saidutta69/MiMo-V2.6-Distill-Qwen-9B-heretic

## Resumen

MiMo-V2.6-Distill-Qwen-9B-heretic es una variante "decensored" (abliterated) del modelo agéntico MiMo-V2.6-Distill-Qwen-9B de Xiaomi MiMo, publicada por el usuario saidutta69 (marca "RACER IS OP"). El modelo base es un transformer multimodal de ~9,4B parámetros obtenido por supervisión fina (SFT) de Qwen3.5-9B sobre datos generados por la familia MiMo-V2.6, orientado a cuatro dominios: ingeniería de software, tareas agénticas generales, codificación visual y ciberseguridad.

La modificación "heretic" no reentrena el modelo: aplica ablación direccional ("abliteration") sobre las proyecciones de salida de atención (`attn.o_proj`) y las proyecciones descendentes del MLP (`mlp.down_proj`) para suprimir el comportamiento de rechazo, dejando prácticamente intactos los pesos del encoder de visión y el comportamiento agéntico aprendido en el SFT. Según la model card, los rechazos bajan de 99/100 a 8/100 con una divergencia KL de 0,0477 respecto al original.

Es relevante para quien necesite un modelo agéntico multimodal sin filtros de rechazo, ejecutable en local: mantiene una ventana de contexto de 262K tokens, licencia MIT y un conjunto completo de cuantizaciones GGUF que permiten desplegarlo desde GPUs de 6 GB hasta CPU. La edición se realizó con Heretic v1.4.0 y el repositorio incluye la receta de reproducción bit a bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) de la familia Qwen3.5 (`qwen3_5` / `qwen35` en llama.cpp), con encoder de visión conservado |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262K), segun la model card |
| Tipos de cuantizacion | BF16 (safetensors) y GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, 4 shards) y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de tipo image-text-to-text basado en Qwen3.5-9B. El modelo original fue construido por Xiaomi MiMo mediante SFT sobre datos generados por la familia MiMo-V2.6 (destilación + supervisión fina), y conserva el encoder de visión, lo que habilita la codificación visual (leer capturas, diagramas o fragmentos de código en imagen). El modelo no es un MoE: los 9,4B parámetros son densos y todos se activan en cada paso.

La intervención de esta variante es la abliteración con Heretic v1.4.0 (ensayo 109 de una ejecución de 200 ensayos, semilla `1903262967`). Se identificaron direcciones de pesos responsables del rechazo y se editaron con un `direction_index` de 23,77 y factores de escala concretos: `attn.o_proj` con `max_weight` 1,44 (posición 22,49) y `min_weight` 1,42 (distancia 18,49); `mlp.down_proj` con `max_weight` 1,23 (posición 23,96) y `min_weight` 1,05 (distancia 11,59). No hay fine-tuning adicional ni RLHF/DPO en esta variante: la edición es quirúrgica sobre pesos ya entrenados, y el autor argumenta que esto preserva mejor la coherencia que un fine-tuning de "persona servicial". El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el diario del estudio Optuna y sumas SHA-256 para regenerar el modelo bit a bit.

## Capacidades

- Generacion de texto, razonamiento y modo "thinking" (etiqueta `reasoning`/`thinking`).
- Codigo: generacion, revision y depuracion, con orientacion explicita a flujos tipo SWE-bench.
- Codificacion visual: lectura de capturas, diagramas e imagenes con contenido de codigo o interfaz.
- Uso de herramientas (tool calling / function calling) y trabajo agentico multiturno.
- Terminal y uso de herramientas de linea de comandos (orientado a agentes de terminal).
- Ciberseguridad: tareas de analisis y trabajo defensivo/ofensivo (categoria declarada por el autor).
- Rol y conversacion (etiqueta `roleplay`, `conversational`).
- Multilingue limitado a ingles y chino.
- Ejecucion local en GPU de consumo mediante GGUF.
- Sin filtros de rechazo: responde a peticiones que el modelo base rechazaria (8/100 de rechazos frente a 99/100).

## Casos de uso

- Agentes de codificacion en local: integrado via Ollama o LM Studio en un flujo de edicion de repositorio, el modelo puede leer archivos, proponer parches y ejecutar comandos de terminal gracias a su soporte de tool calling y su contexto de 262K tokens.
- Revision de codigo en pipelines de CI/CD: se puede invocar desde un paso de CI para analizar diffs, detectar patrones problematicos y sugerir correcciones antes del merge.
- Analisis de capturas de interfaz o diagramas: el encoder de vision permite pasar una captura de una app o un diagrama UML y obtener codigo o explicaciones, util en tareas de ingenieria inversa de UI.
- Asistente de I+D en seguridad: analisis de fragmentos de codigo, discusion de tecnicas de explotacion o defensa y generacion de pruebas en entornos de laboratorio controlados, sin las restricciones de rechazo del modelo base.
- Generacion de codigo para hardware limitado: las cuantizaciones Q4_K_M (5,29 GB) e IQ4_XS (4,88 GB) permiten desplegarlo en GPUs de 6-8 GB, habilitando asistentes de codigo en portatiles gaming.
- Prototipado de agentes de terminal: dado su enfoque en uso de herramientas y su ventana larga, sirve para construir agentes que operen sobre un arbol de proyecto completo sin truncar el contexto.
- Roleplay y escritura creativa sin censura: la eliminacion de rechazos y el soporte conversacional lo hacen util para narrativa interactiva o personajes, algo que el modelo base bloqueaba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, SWE-bench) en la informacion disponible. La model card unicamente aporta metricas comparativas de la propia abliteracion frente al modelo original:

| Metrica | Este modelo | Modelo original (XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B) |
|---|---|---|
| Divergencia KL | 0,0477 | 0 (por definicion) |
| Rechazos (sobre 100) | 8/100 | 99/100 |

El autor afirma que esta combinacion (KL 0,0477 y 8/100 de rechazos) es la mejor relacion fidelidad/supresion de rechazo de su lote, y atribuye la precision de la edicion a que el `direction_index` es un unico indice (23,77) en lugar de por capa.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, tamano nativo 9B): Q8_0 = 9,09 GB; Q6_K = 7,07 GB; Q5_K_M = 6,14 GB; Q4_K_M = 5,29 GB; IQ4_XS = 4,88 GB.
- Contexto: anadir aproximadamente 1 GB de VRAM por cada 32K tokens de contexto adicional.
- GPUs recomendadas por cuantizacion, segun la matriz del autor:
  - RTX 4090 / 5090 (24 GB): Q8_0.
  - RTX 4080 / 5080 / 4060 Ti 16G (16 GB): Q6_K.
  - RTX 3060 / 4070 / 5070 (12 GB): Q5_K_M.
  - RTX 4060 / 3070 (8 GB): Q4_K_M.
  - GTX 1660 Super / 2060 / 3050 laptop (6 GB): IQ4_XS.
- CPU y Apple Silicon: Q4_K_M cabe en RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang y transformers (con `AutoModelForImageTextToText` y `AutoProcessor`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-heretic (este) | 9,4B | 262K | en, zh | MIT | Multimodal, abliterado, 8/100 rechazos, GGUF completo |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 9,4B | 262K | en, zh | MIT | Multimodal, sin abliterar, 99/100 rechazos, KL 0 |
| eyes-ml/MiMo-V2.6-Distill-Qwen-9B | 9,4B | no disponible | en, zh | no disponible | Replicacion del modelo base en Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos frente a alternativas de tamano similar.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier LLM de 9B, puede inventar APIs, referencias o hechos, especialmente en razonamiento largo o cuando no tiene contexto suficiente.
- Sesgos: no se documentan evaluaciones de sesgo o toxicidad en la informacion disponible; la supresion de rechazos puede aumentar la probabilidad de generar contenido danino si no se aplican salvaguardas externas.
- Sin censura: el modelo responde deliberadamente a peticiones que el original rechazaria (8/100 de rechazos). No es recomendable exponerlo directamente a usuarios finales sin moderacion adicional.
- Idiomas: solo ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Degradacion de coherencia: la abliteracion introduce una divergencia KL de 0,0477 respecto al original, lo que puede traducirse en pequenas perdidas de calidad en algunas tareas aunque el autor lo presenta como el mejor equilibrio de su lote.
- Licencia MIT: permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir la normativa aplicable; la licencia del modelo base tambien es MIT.
- Fechas del repositorio: creado y actualizado el 2026-10-04, con 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validacion comunitaria.
- Advertencia tecnica: la pagina incluye recursos externos (imagenes alojadas en dominios de terceros) y datos como fechas futuras de publicacion; conviene verificar la procedencia antes de integrarlo en produccion.
- Reproducibilidad: el directorio `reproduce/` permite regenerar el modelo, pero la calidad final depende del entorno y de las dependencias exactas indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiMo-V2.6-Distill-Qwen-9B-heretic
- Modelo base en Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Model card del base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B/blob/main/README.md
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Articulo sobre abliteracion (mlabonne): https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Replicacion del modelo base (eyes-ml): https://huggingface.co/eyes-ml/MiMo-V2.6-Distill-Qwen-9B
- Modelo en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Ficha en Vast.ai: https://vast.ai/model/mimo-v26-distill-qwen-9b
- Analisis de la version GGUF: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-distill-qwen-9b-gguf/
