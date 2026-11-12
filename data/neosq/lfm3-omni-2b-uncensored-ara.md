# NeosQ/LFM3-Omni-2B-Uncensored-ARA

## Resumen

LFM3-Omni-2B-Uncensored-ARA es una derivación del modelo multimodal `LiquidAI/LFM3-Omni-2B` a la que se le ha eliminado deliberadamente el comportamiento de rechazo mediante una técnica de edición de pesos denominada ARA (Arbitrary-Rank Ablation). Lo desarrolla el usuario NeosQ y se distribuye como checkpoint de investigación, no como producto para producción. El modelo base es un any-to-any de 2.166.928.384 parámetros (aproximadamente 2,17 mil millones) que procesa y genera texto, imagen, vídeo y audio bajo una arquitectura `lfm3_omni`.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeño y multimodal con soporte de 12 idiomas (entre ellos el español) y function calling nativo; por otro, ilustra un caso de estudio de safety research en el que la supresión de rechazos se consigue editando únicamente 12 de los 665 tensores del checkpoint, sin reentrenamiento. El autor reporta una reducción de rechazos de 99/100 a 0/100 sobre su conjunto de evaluación, con una divergencia KL de 0,0470 respecto al modelo base.

El checkpoint conserva la licencia original LFM1.0 del modelo base, mantiene el tokenizador, la plantilla de chat y los módulos de código remoto byte a byte, y requiere `trust_remote_code=True`. Existe además una versión en GGUF (BF16, Q8_0 y Q4_K_M) publicada en un repositorio aparte para su uso con llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | lfm3_omni (modelo multimodal any-to-any, transformer con codificadores de imagen, vídeo y audio; detalles internos no disponibles) |
| Parámetros totales | 2.166.928.384 (2,17 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint principal); GGUF en BF16, Q8_0 y Q4_K_M en repositorio aparte |
| Idiomas soportados | en, zh, ar, fr, de, it, ja, ko, pt, es, vi, th |
| Licencia | LFM1.0 (license_name: lfm1.0, campo `license: other`) |
| Formato de pesos | safetensors (BF16, 4,04 GB); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es una edición de pesos del checkpoint `LiquidAI/LFM3-Omni-2B`, no un fine-tuning. La modificación se realizó con Heretic 2.1.0, que busca direcciones en el residual stream asociadas al comportamiento de rechazo y optimiza una edición de pesos que minimiza simultáneamente el número de rechazos sobre un conjunto de 100 prompts y la divergencia KL respecto a la distribución de salida del modelo base. El modificador ARA realiza una proyección de rango completo de la dirección de rechazo, mientras que la variante MPOA ("Abliteration") aplica una ablación ortogonal que preserva la magnitud.

La búsqueda se ejecutó con 100 trials de Optuna (semilla 42) y se seleccionó un punto del frente de Pareto según el par (recuento de rechazos, KL). Solo se editaron 12 de los 665 tensores; la arquitectura, el tokenizador, el processor, la plantilla de chat y el resto de ficheros son idénticos al modelo base. No hubo entrenamiento ni fine-tuning. El autor restauró manualmente `video_preprocessor_config.json` y `.gitattributes` desde el repositorio base porque `save_pretrained()` no los emite.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Entrada y salida multimodal: imagen, vídeo y audio además de texto (pipeline `any-to-any`).
- Function calling nativo: los esquemas de herramientas se pasan mediante `tools=...` y se renderizan en el bloque `<tools>` del turno de sistema; las respuestas usan el formato nativo `<tool_call>`.
- Llamadas a múltiples funciones en una misma respuesta cuando se instruye explícitamente en el system prompt (la plantilla no lo indica por defecto).
- Razonamiento matemático y de sentido común (resultados en GSM8K y MATH-500 en la sección de benchmarks).
- Soporte multilingüe en 12 idiomas, incluido el español.
- Modo de generación seleccionable mediante el parámetro `generation_mode` (por ejemplo, `"text"`).
- Comportamiento de rechazo suprimido por diseño: acepta peticiones que el modelo base declinaría.

## Casos de uso

- Investigación en safety y alineación: el checkpoint sirve como referencia controlada para estudiar cómo la ablación de direcciones de rechazo afecta a la distribución de salidas, comparando directamente contra el base con la misma configuración de prompts y hardware.
- Evaluación de robustez de filtros de contenido: permite comprobar si las capas de moderación externas de un pipeline detectan contenido que un modelo sin rechazos generaría, usando el par base/derivado como contraste.
- Prototipado de asistentes multimodales en local: con 2,17 B de parámetros y pesos BF16 de 4,04 GB, se puede desplegar en una GPU de consumo para experimentar con entradas de imagen, audio y vídeo sin depender de APIs externas.
- Pruebas de function calling en agentes: los esquemas de herramientas se integran vía `tools=...` y el modelo emite llamadas en formato `<tool_call>`, lo que permite validar pipelines de orquestación de herramientas con un modelo pequeño.
- Transcripción y descripción de audio o vídeo en flujos internos: al aceptar entradas de audio y vídeo, puede usarse para generar descripciones o resúmenes en entornos de investigación donde no se requiere cumplimiento estricto de políticas.
- Experimentación multilingüe: con 12 idiomas soportados, sirve para comparar calidad de generación entre el base y la variante ablacionada en lenguas como español, árabe o tailandés.
- Docencia y demostraciones de técnicas de edición de pesos: el caso ilustra de forma reproducible (Heretic 2.1.0, Optuna, frente de Pareto) cómo se modifica el comportamiento de un modelo sin reentrenar.

## Benchmarks y rendimiento

Todos los números proceden de la model card del autor y se midieron contra el modelo base sin modificar, en el mismo hardware y configuración de prompts. `Δ` está en puntos porcentuales; `z` es un test z de dos proporciones (|z| < 1,96 indica diferencia no significativa).

| Benchmark | n | Base | Este modelo | Δ vs base |
|---|---|---|---|---|
| HellaSwag | 200 | 0,485 | 0,475 | -1,0 pp (z=-0,20) |
| PIQA | 200 | 0,635 | 0,630 | -0,5 pp (z=-0,10) |
| WinoGrande | 200 | 0,530 | 0,545 | +1,5 pp (z=+0,30) |
| CommonsenseQA | 200 | 0,350 | 0,345 | -0,5 pp (z=-0,11) |
| SocialIQA | 200 | 0,330 | 0,335 | +0,5 pp (z=+0,11) |
| GSM8K | 200 | 0,710 | 0,685 | -2,5 pp (z=-0,54) |
| MATH-500 | 200 | 0,590 | 0,595 | +0,5 pp (z=+0,10) |
| IFEval | 541 | 0,745 | 0,762 | +1,7 pp (z=+0,64) |

| Benchmark (BFCL v4) | n | Base | Este modelo | Δ vs base |
|---|---|---|---|---|
| simple_python | 400 | 0,922 | 0,930 | +0,8 pp (z=+0,41) |
| multiple | 200 | 0,965 | 0,955 | -1,0 pp (z=-0,51) |
| parallel | 200 | 0,620 | 0,785 | +16,5 pp (z=+3,61) |
| parallel_multiple | 200 | 0,495 | 0,600 | +10,5 pp (z=+2,11) |
| irrelevance | 240 | 0,733 | 0,637 | -9,6 pp (z=-2,26) |

El autor advierte que las diferencias en BFCL se deben a la mayor propensión a invocar herramientas y no a un mejor conocimiento de function calling: en `irrelevance`, donde la respuesta correcta es no llamar a ninguna función, este modelo emitió una llamada en el 36,2 % de los casos. La sección de benchmarks multimodales de la model card aparece truncada en la información disponible, por lo que no se recogen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa 4,04 GB en disco, por lo que la inferencia en BF16 requiere del orden de 5-6 GB de VRAM contando activaciones y caché KV (estimación, no publicada por el autor).
- Cuantizaciones GGUF disponibles: BF16, Q8_0 y Q4_K_M; la variante Q4_K_M reduce el peso a aproximadamente 1,3-1,5 GB (estimación orientativa).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; para las cuantizaciones GGUF basta con GPU de consumo de gama media. El autor documenta ejecución en CUDA y en MPS (Apple Silicon), además de CPU con `torch.float32`.
- Cabe en GPU de consumo: sí, dado el tamaño de 2,17 B de parámetros.
- Opciones de despliegue: `transformers` (>= 5.22.2) con `AutoModelForMultimodalLM` y `AutoProcessor`, obligatoriamente con `trust_remote_code=True`; llama.cpp mediante los GGUF publicados en el repositorio aparte. No se mencionan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-ARA | 2,17 B | no disponible | Sí (texto, imagen, vídeo, audio) | LFM1.0 | Rechazos suprimidos; solo investigación |
| LiquidAI/LFM3-Omni-2B | 2,17 B | no disponible | Sí (texto, imagen, vídeo, audio) | LFM1.0 | Modelo base con comportamiento de rechazo intacto |
| Alternativas de ~2 B any-to-any | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación más directa y fiable es contra su propio modelo base, para el que se dispone de resultados emparejados en la sección de benchmarks. No se han identificado en la información disponible otros modelos any-to-any de tamaño similar con los que establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: el autor lo declara no apto para producción ni para uso orientado al consumidor.
- Comportamiento de rechazo eliminado de forma deliberada: cumplirá peticiones que el modelo base declinaría y puede generar contenido inseguro, ilegal o dañino.
- Riesgo elevado de alucinación y de respuestas dañinas sin las salvaguardas del base; no debe exponerse a usuarios finales sin capas de moderación externas.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al derivar del base hereda los suyos, y la supresión de rechazos puede amplificar respuestas sesgadas.
- Licencia LFM1.0: es necesario revisar los términos del fichero `LICENSE` del repositorio antes de cualquier uso, incluido el comercial; el modelo se distribuye bajo `license: other` con nombre `lfm1.0`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar módulos Python del repositorio; conviene auditar ese código antes de desplegarlo.
- La longitud de contexto no está documentada en la información disponible.
- El modelo emite llamadas a herramientas con demasiada frecuencia en escenarios de irrelevancia (36,2 % de llamadas cuando no procedía), lo que exige validación externa en pipelines de agentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-ARA
- Model card en chino: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-ARA/blob/main/README_zh.md
- Cuantizaciones GGUF: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-ARA.gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
