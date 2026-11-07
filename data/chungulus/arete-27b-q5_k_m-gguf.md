# Chungulus/Arete-27B-Q5_K_M-GGUF

## Resumen

Arete-27B-Q5_K_M-GGUF es una cuantización en formato GGUF del punto de control Arete-27B de Nous Research, un ajuste fino supervisado (SFT) del modelo base Qwen3.8-27B de Alibaba. La cuantización la publica el usuario independiente Chungulus y no es una release oficial ni de Nous Research ni de Qwen. El modelo original es multimodal (pipeline image-text-to-text) e incluye un codificador visual; esta versión GGUF empaqueta el texto cuantizado en Q5_K_M y conserva el proyector visual en precisión completa (BF16) como fichero `mmproj` separado.

El modelo resuelve tareas de generación de texto conversacional, razonamiento y comprensión de imágenes en entornos de inferencia local mediante llama.cpp. Con 26.895.998.464 parámetros en el grafo de texto (frente a los 27.356.728.560 totales del checkpoint original, que incluyen el codificador visual), se sitúa en la franja de modelos densos de ~27B, un tamaño que permite despliegue en GPU de consumo con cuantizaciones de 5 bits y en estaciones de trabajo con GPU profesionales.

Su relevancia actual es doble: por un lado, ofrece una alternativa Apache 2.0 para ejecución local de un modelo multimodal de tamaño medio; por otro, la model card documenta con rigor el proceso de conversión (verificación SHA256 de los 18 shards originales, inspección de cabeceras de tensores) y explicita qué validaciones se hicieron y cuáles no, algo poco habitual en cuantizaciones de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + codificador visual), familia Qwen3.5/Qwen3.8; sin MTP |
| Parametros totales | 26.895.998.464 (grafo de texto GGUF); 27.356.728.560 en el checkpoint original con vision encoder |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de uso emplean 8192 tokens) |
| Tipos de cuantizacion | Q5_K_M (esta release); el autor indica que cada formato se cuantizo de forma independiente desde el BF16 original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + `mmproj-Arete-27B-BF16.gguf` para vision |

## Arquitectura y entrenamiento

El modelo base es Arete-27B de Nous Research, descrito en la model card como un ajuste fino supervisado (SFT) de Qwen3.8-27B. Se trata de un transformer denso de aproximadamente 27B parámetros con un codificador visual acoplado que habilita la entrada image-text-to-text. La model card indica que MTP (multi-token prediction) está deshabilitado y ausente en la fuente, por lo que no se exporta ni se sintetiza en el GGUF.

El proceso de cuantización lo documenta el autor con detalle: cada formato se generó de forma independiente desde la exportación BF16 original, sin recuantizar checkpoints de baja precisión y sin dataset de calibración ni importance matrix. Los 18 shards originales se verificaron con SHA256 antes de la conversión y las cabeceras de tensores locales confirmaron el recuento completo de parámetros. La model card advierte que tensores de texto BF16 muestreados difieren del checkpoint padre fijado. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat (soporte de plantilla Jinja vía `--jinja`).
- Comprensión de imágenes: descripción de contenido visual, con fixtures de validación de colores y posiciones (cuadrado central y círculo en esquina con colores opuestos).
- Razonamiento aritmético y comprobaciones factuales básicas, validadas en runtime nativo.
- Generación de JSON estructurado, validada en las pruebas del autor.
- Modo thinking: la model card menciona que las validaciones se ejecutaron con thinking deshabilitado, lo que implica que el modelo base dispone de dicho modo, aunque no se detalla su comportamiento.
- Tool calling / function calling: no evaluado según la model card.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Capacidades multilingües: no disponibles.
- Vídeo y calidad en contexto completo: no evaluados.

## Casos de uso

- Asistencia conversacional local con privacidad: el modelo puede ejecutarse íntegramente en hardware propio mediante llama.cpp, sin envío de datos a APIs externas, adecuado para entornos con requisitos de confidencialidad.
- Descripción y análisis de imágenes en flujos documentales: usando `llama-mtmd-cli` con el `mmproj` BF16, se pueden procesar capturas, diagramas o fotografías y obtener descripciones textuales, con 1024 tokens de imagen como configuración probada.
- Extracción de datos estructurados: dada su validación en generación de JSON, encaja en pipelines que convierten texto libre en registros parseables (formularios, tickets, metadatos).
- Prototipado de asistentes sobre Qwen3.5/Qwen3.8: al ser un fine-tune SFT de esa familia, sirve para experimentar con el comportamiento ajustado de Nous Research manteniendo compatibilidad con el ecosistema llama.cpp.
- Inferencia en estaciones de trabajo Apple Silicon: el autor probó el build con commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4` en Apple Silicon, por lo que es una opción directa para desarrollo en macOS.
- Evaluación comparativa de cuantizaciones: al documentarse el proceso sin importance matrix ni calibración, resulta útil para estudiar el impacto de Q5_K_M frente al BF16 en tareas controladas (aritmética, JSON, visión).
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere integración con plataformas de serving que aceptan GGUF, aunque no se detalla compatibilidad concreta con vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las afirmaciones de evaluación del creador y la precisión en benchmarks no fueron medidas sobre el modelo cuantizado, y que las pruebas realizadas son comprobaciones funcionales cortas (aritmética, JSON, factuales y de visión) con temperatura 0, semilla 42, contexto 8192 y un máximo de 128 tokens generados.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20,2 GB, lo que da una estimación práctica de ~20-21 GB de VRAM para cargar el GGUF Q5_K_M más el proyector visual BF16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en GPU con 24 GB o más (RTX 3090/4090, A5000, L4 con offload parcial) y en A100/H100 con holgura.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con `-ngl 99` si el contexto se mantiene moderado; en GPUs de 16 GB requeriría offload a CPU/RAM.
- Despliegue: llama.cpp (runtime reciente con soporte Qwen3.5/Qwen3.8; build probado `6414d5b0c9e5895473036c90c2bd305ce4ceccc4` en Apple Silicon), `llama-completion` para texto y `llama-mtmd-cli` para visión. Se debe deshabilitar MTP/predicción especulativa en los frontends que intenten activarlo.
- Latencia y throughput: no disponibles.
- Apple Silicon: validado por el autor en ese entorno, aunque sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Chungulus/Arete-27B-Q5_K_M-GGUF | 26,9B (texto) | no disponible | GGUF Q5_K_M + mmproj BF16 | Apache 2.0 | Cuantización independiente, sin importance matrix; validación funcional acotada |
| bartowski/NousResearch_Arete-27B-GGUF | ~27B | no disponible | GGUF (incluye Q5_K_M) | Apache 2.0 | Cuantización alternativa del mismo modelo base; el autor documenta la asignación de precisión por sensibilidad (S/M/L) |
| NousResearch/Arete-27B | 27,36B (con vision) | no disponible | BF16 (safetensors) | Apache 2.0 | Checkpoint original de Nous Research, referencia de calidad completa |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Las pruebas del autor son funcionales y cortas; no se evaluaron alineamiento político/valorativo, precisión en benchmarks, uso de herramientas, vídeo ni calidad en contexto completo.
- El proyector visual se conserva en BF16, pero el autor no afirma que la calidad del modelo permanezca inalterada tras la cuantización Q5_K_M.
- Tensores de texto BF16 muestreados difieren del checkpoint padre fijado, según la model card.
- MTP está deshabilitado y ausente; los frontends que intenten activar predicción especulativa deben desactivarla.
- Requiere un runtime llama.cpp reciente con soporte para Qwen3.5/Qwen3.8; versiones antiguas pueden fallar al cargar el modelo.
- Idiomas soportados no documentados; el comportamiento multilingüe no está validado.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de atribución de Nous Research y Alibaba/Qwen al redistribuir.
- Es una cuantización de terceros, no una release oficial; el soporte y la trazabilidad dependen del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Arete-27B-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Checkpoint padre fijado: https://huggingface.co/NousResearch/Arete-27B/tree/108f0afbdcfaa1ceeda4a635004304dfff6d4da2
- Cuantización alternativa de bartowski: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
- Fichero Q5_K_M de bartowski: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF/blob/main/NousResearch_Arete-27B-Q5_K_M.gguf
