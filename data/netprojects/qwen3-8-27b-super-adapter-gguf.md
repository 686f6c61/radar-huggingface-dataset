# netprojects/Qwen3.8-27B-super-adapter-GGUF

## Resumen

Qwen3.8-27B-super-adapter GGUF es una compilación cuantizada en formato GGUF del modelo Qwen3.8-27B de Alibaba, fusionado con el adaptador LoRA "super-adapter" publicado por harness-hub. Ese adaptador combina, mediante una media ponderada de pesos, tres especialistas de refuerzo entrenados para sendos arneses de agente de código: pi, Hermes Agent y OpenCode. El resultado es un único conjunto de pesos que funciona razonablemente bien con los tres arneses sin necesidad de cargar LoRA adicionales en tiempo de inferencia. El repositorio lo mantiene el usuario netprojects y está pensado para ejecutarse con llama.cpp.

El modelo conserva la arquitectura original de Qwen3.8-27B, incluyendo la capa de predicción multi-token (MTP) que permite decodificación especulativa en llama-server, y añade un proyector multimodal (`mmproj`) que habilita entrada de imágenes. Con 27.320.697.856 parámetros totales y un contexto declarado de hasta 131.072 tokens en los ejemplos de despliegue, se posiciona como una opción de tamaño medio para tareas de agente autónomo y generación de código en hardware de gama alta de consumo o estaciones de trabajo.

Su relevancia actual radica en que empaqueta en un solo artefacto listo para usar lo que de otro modo requeriría fusionar LoRA manualmente, y en que publica métricas de fidelidad de cuantización (coincidencia del siguiente token y divergencia KL frente a BF16) que permiten elegir el nivel de compresión con criterio. La licencia Apache 2.0 facilita su adopción comercial, aunque la información sobre idiomas soportados no está disponible en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) con capa de predicción multi-token (MTP) y codificador de visión |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens en el ejemplo de llama-server; no se documenta el máximo arquitectónico |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (GGUF); MLX 6-bit en repositorio aparte |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y MLX |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer denso de 27.320 millones de parámetros con 16 capas de atención completa y 64 capas en total, según los módulos adaptados que se describen en el proceso de fusión. Incorpora una capa MTP que actúa como borrador para decodificación especulativa (`--spec-type draft-mtp` en llama-server) y un codificador de visión que se distribuye por separado como `mmproj-Qwen3.8-27B-super-adapter-F16.gguf` (0,9 GB).

El adaptador de harness-hub no se entrena sobre estos pesos: se construye fusionando tres especialistas de aprendizaje por refuerzo (pi y Hermes Agent en el paso 160, OpenCode en el paso 150) con peso ½ cada uno. La fusión afecta a 256 módulos adaptados (q, k, v, o en las 16 capas de atención completa; gate, up, down en las 64 capas) y se verifica elemento a elemento contra la implementación de PEFT, comprobando que el resto de tensores, incluida la capa MTP y el codificador visual, son idénticos byte a byte a Qwen3.8-27B. Los archivos GGUF se cuantizaron desde el GGUF BF16 del modelo fusionado.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activable o desactivable mediante `enable_thinking` en el chat template (activado por defecto y recomendado por harness-hub).
- Generación y edición de código en el contexto de agentes de programación (pi, Hermes Agent, OpenCode).
- Uso de herramientas (tool calling) a través de la API compatible con OpenAI que expone llama-server.
- Ejecución de agentes multi-paso con reducción del número de llamadas a herramientas frente al modelo base (19-48 % menos con thinking activo, 53-73 % menos con thinking desactivado).
- Entrada de imágenes mediante el proyector `mmproj` (pipeline image-text-to-text).
- Decodificación especulativa con la capa MTP integrada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código en local con pi: servir el modelo con llama-server en `http://localhost:8000/v1` y configurar el proveedor en `~/.pi/agent/models.json` con `"api": "openai-completions"`; el adaptador está entrenado específicamente para este arnés y reduce el número de llamadas a herramientas por tarea.
- Agente de terminal con Hermes Agent: requiere al menos 64.000 tokens de contexto según la model card; útil para tareas de línea de comandos y automatización de shell donde el agente debe encadenar comandos y verificar resultados.
- Asistente de programación con OpenCode: el adaptador reporta la mayor mejora en SWE-bench Pro bajo este arnés (47,1 % a 66,7 %), por lo que es la combinación más indicada para resolución de issues reales sobre repositorios.
- Revisión de código con capturas o diagramas: gracias al proyector multimodal se pueden enviar imágenes junto al texto, por ejemplo capturas de errores de compilación o diagramas de arquitectura para que el modelo los interprete.
- Automatización de pipelines de CI/CD: al exponer una API compatible con OpenAI, el modelo se puede integrar como paso de análisis o generación de parches en flujos automatizados, con la ventaja de que los pesos corren en infraestructura propia.
- Despliegue en estación de trabajo Apple Silicon: existe una build MLX de 6 bits en un repositorio hermano, lo que permite ejecutar el modelo en MacBook Pro con memoria unificada alta (la verificación se hizo en un M5 Max de 128 GB).
- Experimentación con decodificación especulativa: la capa MTP conservada en todos los archivos GGUF permite medir el impacto de `--spec-type draft-mtp` en latencia sin cambiar de modelo.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, medidos bajo cada arnés en SWE-bench Pro (hard 51) y Terminal-Bench 2.1, comparando con el modelo base al mismo esfuerzo de razonamiento:

| Modo | Métrica | Base | Super-adapter |
|---|---|---|---|
| Thinking on | pass@1 medio (6 pares arnés-benchmark) | 55,5 % | 63,5 % |
| Thinking on | SWE-bench Pro bajo OpenCode | 47,1 % | 66,7 % |
| Thinking on | SWE-bench Pro bajo Hermes Agent | 45,1 % | 60,8 % |
| Thinking off | pass@1 medio (6 pares) | 39,5 % | 49,0 % |

Con thinking activo, el adaptador supera al base en cinco de los seis pares arnés-benchmark y empata en el sexto. Con thinking desactivado, supera al base en los seis pares.

Fidelidad de cuantización frente al GGUF BF16 (misma muestra de 12 prompts cortos):

| Archivo | Tamaño | Mismo siguiente token | Divergencia KL media |
|---|---|---|---|
| Q6_K (recomendado) | 22,4 GB | 98,9 % | 0,0032 |
| Q8_0 | 29,0 GB | 99,7 % | 0,0003 |
| Q4_K_M | 16,8 GB | 94,6 % | 0,0800 |
| mmproj F16 | 0,9 GB | proyector de visión | — |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB con Q4_K_M, 23 GB con Q6_K y 30 GB con Q8_0, a los que se suman 0,9 GB del proyector si se usa visión y la memoria del contexto KV (crece con `-c`; el ejemplo usa 131.072 tokens).
- GPU recomendadas: A100 o H100 para contexto completo y concurrencia; en consumer, RTX 4090 (24 GB) permite Q6_K ajustando el contexto, y Q4_K_M cabe con más holgura.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 24 GB y Q6_K en configuraciones de 24 GB con contexto reducido; Q8_0 requiere 32 GB o más.
- Apple Silicon: la verificación se realizó en un MacBook Pro M5 Max con 128 GB de memoria unificada; existe build MLX 6-bit para este entorno.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--jinja` y, opcionalmente, `--spec-type draft-mtp` y `-mm` para visión; también MLX. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica que la capa MTP permite decodificación más rápida cuando se activa `--spec-type draft-mtp`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter GGUF (este) | 27,3 B | hasta 131.072 en ejemplo | Agente de código multi-arnés (pi, Hermes, OpenCode) + visión | Apache 2.0 | GGUF y MLX en Hugging Face |
| Qwen3.8-27B (base) | 27,3 B | no disponible | Modelo generalista | no disponible en esta ficha | Hugging Face (Qwen) |
| Qwen3.8-27B-pi-adapted GGUF | 27,3 B | no disponible | Especialista en pi | no disponible en esta ficha | GGUF en NetProjects |
| Qwen3.8-27B-hermes-adapted GGUF | 27,3 B | no disponible | Especialista en Hermes Agent | no disponible en esta ficha | GGUF en NetProjects |
| Qwen3.8-27B-opencode-adapted GGUF | 27,3 B | no disponible | Especialista en OpenCode | no disponible en esta ficha | GGUF en NetProjects |

Los tres especialistas individuales son la alternativa directa cuando se usa un único arnés con thinking desactivado, según recomienda harness-hub. El super-adapter es preferible cuando se necesita un solo modelo para varios arneses o cuando se usa thinking activo.

## Limitaciones y advertencias

- La fusión por media de pesos no añade entrenamiento: el comportamiento en arneses distintos de pi, Hermes Agent y OpenCode no está validado.
- Los benchmarks publicados son del adaptador original; no se han verificado de forma independiente en esta build GGUF, y la cuantización introduce divergencia (mayor en Q4_K_M, con 94,6 % de coincidencia del siguiente token).
- No se documentan sesgos conocidos ni evaluación de alucinación en la información disponible.
- Los idiomas soportados no están declarados; no se debe asumir cobertura multilingüe sin probarla.
- El contexto práctico depende de la memoria disponible: usar 131.072 tokens exige hardware con VRAM o memoria unificada abundante.
- Hermes Agent requiere un mínimo de 64.000 tokens de contexto según la model card; contextos menores pueden degradar su funcionamiento.
- El modo thinking está activado por defecto y consume más tokens; desactivarlo cambia el perfil de rendimiento (49,0 % frente a 63,5 % de pass@1 medio).
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar las condiciones del modelo base Qwen3.8-27B antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de estos archivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Especialista pi: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Especialista Hermes Agent: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-GGUF
- Especialista OpenCode: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Arnés pi: https://github.com/earendil-works/pi
- Arnés Hermes Agent: https://github.com/NousResearch/hermes-agent
- Arnés OpenCode: https://opencode.ai
