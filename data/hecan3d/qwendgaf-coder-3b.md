# hecan3d/QwenDGAF-Coder-3B

## Resumen

QwenDGAF-Coder-3B es un repositorio de pesos en formato GGUF publicado por el usuario hecan3d en HuggingFace. Por los nombres de los archivos incluidos (`Qwen2.5-Coder-3B-Instruct.BF16.gguf`, `Q4_K_M`, `Q6_K`, `Q8_0`), el modelo parece ser una conversión a GGUF de un modelo derivado de la familia Qwen2.5-Coder-3B-Instruct, etiquetado en el repositorio como `qwen2`. La model card no documenta qué fine-tune o modificación concreta se aplicó sobre la base, de modo que la naturaleza exacta del modelo (fine-tune, abliteration u otro ajuste) no está disponible.

El repositorio tiene 3.085.938.688 parámetros declarados en safetensors y un tamaño total de 13,9 GB, que corresponde a la suma de las cuatro cuantizaciones publicadas. La conversión se realizó con Unsloth y los pesos están pensados para usarse con llama.cpp, lo que permite ejecución local en CPU, GPU de consumo y Apple Silicon sin infraestructura de servidor.

Su relevancia es limitada y hay que contextualizarla: se trata de un modelo de 3B orientado a código, de un autor independiente, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin benchmarks publicados y con una fecha de creación en los metadatos (2026-10-17) posterior a la fecha actual. Es, por tanto, un artefacto experimental que debe evaluarse empíricamente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; la etiqueta del repositorio es `qwen2` y los archivos remiten a Qwen2.5-Coder-3B-Instruct (transformer denso, no verificado) |
| Parámetros totales | 3.085.938.688 (~3,09 mil millones) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en BF16, Q4_K_M, Q6_K y Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | GGUF (conversión realizada con Unsloth, ejecutable con llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna ni el proceso de entrenamiento. Lo único verificable es el pipeline de publicación: conversión de pesos a GGUF mediante Unsloth y empaquetado de cuatro precisiones (BF16, Q8_0, Q6_K y Q4_K_M) para su uso con llama.cpp. La etiqueta `qwen2` del repositorio y los nombres de archivo apuntan a la familia Qwen2, en concreto a un modelo derivado de Qwen2.5-Coder-3B-Instruct, pero no se especifica qué modificación se aplicó sobre la base (fine-tune, DPO, abliteration u otra), ni los datos utilizados.

Tampoco hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.). El sufijo «DGAF» del nombre del modelo sugiere una variante personalizada del autor, pero su significado y metodología no están descritos en la model card. Cualquier afirmación sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y la model card indica el uso de `llama-cli` con la plantilla de chat vía `--jinja`.
- Orientación a código: el nombre del modelo y de los archivos apunta a un modelo de la familia Coder, por lo que se espera generación y explicación de código, aunque no hay evaluación publicada que lo confirme.
- Inferencia local con llama.cpp: compatible con `llama-cli -hf hecan3d/QwenDGAF-Coder-3B --jinja` según la model card.
- Compatibilidad declarada con endpoints: la etiqueta `endpoints_compatible` aparece en el repositorio.
- Capacidades multimodales: la model card menciona el comando `llama-mtmd-cli` para modelos multimodales como plantilla genérica, pero no se aportan pesos de proyección visual ni evidencia de que este modelo las tenga; no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local para desarrolladores individuales: con Q4_K_M (~1,9 GB) o Q6_K se puede ejecutar en un portátil con GPU de consumo o incluso en CPU, sirviendo para autocompletado y explicación de fragmentos sin enviar código a servicios externos. Adecuado por tamaño, pero requiere validación previa de calidad al no haber benchmarks.
- Prototipado rápido de aplicaciones de chat sobre llama.cpp: el repositorio incluye plantilla de chat compatible con `--jinja`, lo que permite levantar un endpoint conversacional local con `llama-server` para pruebas de interfaz antes de migrar a un modelo mayor.
- Generación de documentación técnica y docstrings: el sesgo hacia código del modelo base lo hace candidato para resumir funciones y generar comentarios en pipelines de documentación, siempre con revisión humana.
- Filtrado y clasificación de fragmentos de código en CI: al ser un modelo de 3B y cuantizable a 4 bits, puede integrarse como paso de análisis en un runner con GPU modesta para tareas de etiquetado simple, no para razonamiento complejo.
- Experimentación educativa y de investigación: útil como banco de pruebas para estudiar el efecto de distintas cuantizaciones GGUF en la calidad de salida de un modelo de 3B orientado a código.
- Base para fine-tunes comunitarios: al estar disponible en GGUF y safetensors, puede servir como referencia de comparación frente a la base Qwen2.5-Coder-3B-Instruct en estudios de divergencia por ajuste, aunque la falta de licencia declarada limita su redistribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de la búsqueda web no contienen información técnica sobre el modelo (únicamente enlaces a TikTok, sin relación alguna).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): BF16 ~6,2 GB; Q8_0 ~3,3 GB; Q6_K ~2,5 GB; Q4_K_M ~1,9 GB. Hay que sumar la caché KV, cuyo tamaño depende del contexto configurado (no documentado).
- GPU recomendadas: cualquier GPU con 8 GB o más para Q4_K_M/Q6_K; 16 GB o más para BF16 con contexto amplio. Una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB cubren todas las cuantizaciones con margen.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas. Q4_K_M funciona incluso en GPUs de 6 GB y en CPU con 8 GB de RAM.
- Apple Silicon: viable vía llama.cpp con Metal en equipos con 8 GB de memoria unificada o más.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio importando el GGUF, y servidores compatibles con la API de OpenAI mediante `llama-server`. vLLM y TGI tienen soporte limitado o nulo para GGUF, por lo que no son la vía recomendada.
- Latencia y throughput: no publicados. Como referencia orientativa para un modelo denso de 3B en Q4_K_M, cabría esperar decenas de tokens por segundo en GPU de consumo y un dígito alto en CPU; son estimaciones por tamaño, no medidas sobre este repositorio.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen del conocimiento público general sobre esas familias y no han podido verificarse en la información proporcionada; se marcan como tales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QwenDGAF-Coder-3B (este repositorio) | 3,09 B | No disponible | No disponible | GGUF (4 cuantizaciones) + safetensors |
| Qwen2.5-Coder-3B-Instruct (base probable) | ~3,09 B | No verificado en la información disponible | No verificado en la información disponible | Público en HuggingFace |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B (dato no verificado) | No verificado en la información disponible | No verificado en la información disponible | Público en HuggingFace |
| Llama-3.2-3B-Instruct | ~3,2 B (dato no verificado) | No verificado en la información disponible | No verificado en la información disponible | Público en HuggingFace |

No hay datos de rendimiento de este repositorio que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial ni de redistribución. Es un bloqueo potencial para producción.
- Idiomas no declarados: no hay garantía documentada de calidad en castellano ni en ningún otro idioma.
- Ausencia total de benchmarks: no existe evidencia publicada de calidad en código, razonamiento o matemáticas; cualquier evaluación debe hacerse por cuenta propia.
- Riesgo de alucinación: inherente a los modelos de 3B, especialmente en tareas de razonamiento largo o generación de APIs inexistentes.
- Contexto desconocido: al no documentarse la ventana, no se puede planificar su uso en tareas de contexto largo sin medirla empíricamente.
- Modelo derivado sin metodología documentada: se desconoce qué ajuste se aplicó sobre la base, lo que impide anticipar sesgos introducidos, degradación de capacidades o comportamientos anómalos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de la comunidad ni informes de terceros.
- Metadatos anómalos: la fecha de creación indicada (2026-10-17) es posterior a la fecha actual, lo que sugiere un error de publicación o una republicación del repositorio.
- La mención a `llama-mtmd-cli` en la model card es una plantilla genérica; no hay evidencia de capacidades multimodales en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hecan3d/QwenDGAF-Coder-3B
- Unsloth (herramienta de conversión citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime indicado en la model card): https://github.com/ggml-org/llama.cpp
- Resultados de la búsqueda web: no se encontraron enlaces técnicos relevantes sobre el modelo; los resultados devueltos correspondían a páginas de descarga de TikTok y no guardan relación con el modelo.
