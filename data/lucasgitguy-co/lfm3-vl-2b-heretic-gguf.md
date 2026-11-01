# Lucasgitguy-co/lfm3-vl-2b-heretic-gguf

## Resumen

LFM3-VL 2B Heretic GGUF es una cuantización en formato GGUF del modelo vision-language LFM3-VL 2B Heretic, publicado por el usuario Lucasgitguy-co. Se trata de una conversión Q4_K_M del modelo de lenguaje acompañada de un proyector visual independiente en F16 (`mmproj`), ambos necesarios para procesar entrada de imagen. El modelo base deriva de LiquidAI/LFM3-VL-2B, un modelo de visión y lenguaje de la familia LFM3 de Liquid AI, aunque la variante "heretic" corresponde a un ajuste o modificación posterior realizada por el autor de la cuantización.

El modelo resuelve tareas de image-text-to-text, es decir, generación de texto condicionada por una o varias imágenes junto con un prompt textual. Con aproximadamente 1.730 millones de parámetros, está pensado para despliegue local en hardware modesto, incluido CPU, gracias a la cuantización Q4_K_M y a un tamaño de repositorio de 1,5 GB. Su relevancia actual radica en la posibilidad de ejecutar un VLM pequeño en entornos sin GPU dedicada mediante llama.cpp.

La ficha se centra en los artefactos GGUF publicados y en su validación declarada. El autor indica explícitamente que no se realizó entrenamiento adicional ni evaluación de benchmarks durante la conversión, y que la inferencia en GPU no fue validada. La licencia aplicable es la LFM Open License v1.0, con limitaciones de uso comercial que se extienden a las derivaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal); detalles de arquitectura interna no disponibles |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); F16 (proyector visual mmproj) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | GGUF (dos artefactos: modelo de lenguaje + mmproj F16) |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento nuevo. Según la model card, la conversión se realizó el 30 de octubre de 2026 a partir de la revisión `e81e03b28d228cb8c2676eb339c3404fb73b45b5` del modelo base `Lucasgitguy-co/lfm3-vl-2b-heretic`, usando llama.cpp. El modelo de lenguaje se convirtió primero a F16 y después se cuantizó a Q4_K_M; el proyector visual se convirtió por separado a F16. Los metadatos del tokenizador local se adaptaron a la API de fast-tokenizer de Transformers para la conversión, conservando el vocabulario del tokenizador.

La arquitectura subyacente corresponde a la familia LFM3-VL de Liquid AI, un modelo multimodal de 2B parámetros orientado a image-text-to-text. No se dispone en la información proporcionada de detalles sobre composición del dataset de entrenamiento, número de tokens, ni si hubo RLHF/DPO. La variante "heretic" sugiere una modificación de alineación o de comportamiento respecto al modelo original de Liquid AI, pero el autor no documenta en esta model card el proceso concreto de ese ajuste. La innovación técnica destacable de esta publicación es la separación entre modelo de lenguaje cuantizado y proyector visual en F16, junto con instrucciones específicas para ejecución en CPU cuando la inicialización de GPU no está disponible.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante prompt textual e imagen de entrada.
- Descripción y respuesta a preguntas sobre el contenido visual de una imagen, como demuestra el smoke test con una imagen roja.
- Conversación multimodal de un turno o multi-turno dentro de la ventana de contexto configurada.
- Ejecución en CPU mediante llama.cpp, con flags específicos para desactivar offload cuando la GPU no está disponible.
- Soporte de despliegue compatible con endpoints (etiqueta `endpoints_compatible`).
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas o código: no disponibles en la información proporcionada.
- Capacidades de audio o modo thinking: no disponibles en la información proporcionada.
- Multilingüismo: limitado a inglés según la etiqueta de idioma.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede recibir una imagen y un prompt como "Describe this image" y generar una descripción textual, útil para etiquetado o accesibilidad en entornos sin GPU.
- Respuesta a preguntas visuales simples (VQA): con prompts breves y temperatura baja (`--temp 0.1`), adecuado para consultas concretas sobre el contenido de una imagen, como colores, objetos o texto visible.
- Prototipado de pipelines multimodales en CPU: gracias a los flags de ejecución sin GPU, sirve para validar integraciones de visión-lenguaje en estaciones de trabajo sin acelerador dedicado.
- Verificación de carga y inferencia de artefactos GGUF: el par modelo + mmproj permite comprobar que un build de llama.cpp con soporte LFM3-VL funciona correctamente antes de desplegar variantes mayores.
- Experimentación con modelos "heretic": investigadores interesados en comparar el comportamiento de variantes de alineación modificada pueden usar esta cuantización como punto de partida ligero.
- Integración en aplicaciones de escritorio o edge con llama.cpp: el tamaño de 1,5 GB y la cuantización Q4_K_M facilitan el empaquetado en aplicaciones locales de asistencia visual básica.
- Generación de descripciones breves con límite de tokens: el ejemplo de la model card usa `-n 128`, adecuado para respuestas cortas y controladas en coste de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó ninguna evaluación de benchmarks durante la conversión. El único test documentado es un smoke test en CPU con una imagen roja y el prompt "What color is the image? Answer briefly.", que produjo la respuesta "The image is red."; el autor aclara que esto comprueba la carga y la inferencia básica de imagen, no la precisión general ni el rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño de los artefactos (modelo Q4_K_M + mmproj F16, repositorio de 1,5 GB), la huella de memoria es reducida y compatible con GPUs de gama baja, aunque no se proporcionan cifras exactas.
- GPU recomendadas: no disponibles en la información proporcionada; el autor no validó la inferencia en GPU.
- CPU: validada por el autor con llama.cpp usando `--device none --no-mmproj-offload --no-op-offload --no-kv-offload --fit off` cuando la inicialización de GPU no está disponible.
- Cabe en GPU consumer: previsiblemente sí por tamaño, pero no confirmado por el autor.
- Opciones de despliegue: llama.cpp con soporte LFM3-VL, mediante `llama-mtmd-cli` y los flags `-m`, `--mmproj`, `--image`, `-p`, `-n`, `-c` y `--temp`. También se etiqueta como `endpoints_compatible`. No se mencionan vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL 2B Heretic GGUF (este) | ~1,73 B | No disponible | GGUF Q4_K_M + mmproj F16 | LFM Open License v1.0 | Cuantización de comunidad; sin benchmarks; GPU no validada |
| Lucasgitguy-co/lfm3-vl-2b-heretic | ~1,73 B (mismo base) | No disponible | Pesos originales (formato no especificado) | LFM Open License v1.0 | Modelo base del que deriva esta cuantización |
| Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit | ~1,73 B (mismo base) | No disponible | MLX 4-bit | LFM Open License v1.0 | Variante para Apple Silicon |
| LiquidAI/LFM3-VL-2B | ~2 B (familia) | No disponible | Pesos originales | LFM Open License v1.0 | Modelo upstream de Liquid AI |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se realizó entrenamiento adicional ni evaluación de benchmarks durante la conversión; el rendimiento real no está medido.
- La inferencia en GPU no fue validada por el autor; solo se documenta un smoke test en CPU.
- El smoke test con una imagen roja no evalúa precisión general, sesgos ni robustez.
- Idioma limitado a inglés según la etiqueta del modelo; no se declara soporte multilingüe.
- Riesgo de alucinación inherente a modelos de lenguaje y visión de pequeño tamaño; no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia LFM Open License v1.0 con limitación de uso comercial que se aplica a las derivaciones; este release no es Apache-2.0. Las adiciones documentales del publicador sí están bajo Apache 2.0, sin alterar los términos del material upstream.
- Requiere un build actual de llama.cpp con soporte LFM3-VL; versiones sin ese soporte no cargarán correctamente el par modelo + mmproj.
- Es necesario descargar y usar ambos artefactos (modelo y mmproj) para entrada de imagen; usar solo el modelo de lenguaje deshabilita la capacidad visual.
- La variante "heretic" implica una modificación de comportamiento respecto al modelo original de Liquid AI cuyos detalles no se documentan en esta model card; conviene revisar la documentación upstream antes de usarla en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-gguf
- Modelo base: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic
- Variante MLX 4-bit: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit
- Modelo upstream de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Documentación de estructura de ficheros: docs/FILE_STRUCTURE.md (dentro del repositorio)
- Procedencia y reproducibilidad: docs/PROVENANCE.md (dentro del repositorio)
- Historial de versiones: CHANGELOG.md (dentro del repositorio)
