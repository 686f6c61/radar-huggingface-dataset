# F606F/Qwen3.5-4B-Slovak-RPG-GGUF

## Resumen

Qwen3.5-4B-Slovak-RPG-GGUF es un ajuste fino del modelo Qwen3.5-4B (en su variante publicada por Unsloth) especializado en eslovaco y en roleplay de fantasía oscura. Lo desarrolla el usuario F606F y se distribuye exclusivamente en formato GGUF con cuantización Q6_K, acompañado de un proyector multimodal F16 (mmproj) que preserva la capacidad de procesar imágenes del modelo base. El objetivo es doble: mejorar la fluidez y corrección del eslovaco (reduciendo la mezcla de terminaciones de otros idiomas) y dotar al modelo de un registro atmosférico orientado a mundos tipo Skyrim, Metro 2033/2034 y Fallout.

El modelo parte de una arquitectura transformer de 4.326.350.848 parámetros (4,3 mil millones) y se entrenó mediante QLoRA con Unsloth sobre 4.800 muestras, en una sola época y 600 pasos. La longitud de contexto usada durante el entrenamiento fue de 1.280 tokens, aunque la ventana nativa del modelo base no se detalla en la información disponible.

Su relevancia actual es acotada pero concreta: cubre un nicho poco atendido (eslovaco de calidad en modelos pequeños) y demuestra un flujo de trabajo reproducible de ajuste fino con Unsloth y exportación a GGUF para inferencia local en CPU/GPU de consumo. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial, aunque con las cautelas propias de un ajuste fino pequeño y de un modelo con escasa validación pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste fino LoRA sobre capas de lenguaje; soporte multimodal vía proyector mmproj |
| Parámetros totales | 4.326.350.848 (4,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (entrenamiento con max_seq_length=1280) |
| Tipos de cuantización | Q6_K (GGUF); proyector mmproj en F16 |
| Idiomas soportados | eslovaco (sk); capacidades multilingües heredadas del base no documentadas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.5-4B.Q6_K.gguf y Qwen3.5-4B.F16-mmproj.gguf) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con QLoRA sobre Qwen3.5-4B, con r=32, lora_alpha=32, learning rate 1e-4, una época y 600 pasos, y longitud máxima de secuencia de 1.280 tokens. Solo se entrenaron las capas de lenguaje (finetune_vision_layers = False), de modo que el proyector visual del modelo base se conserva intacto y se distribuye aparte como mmproj en F16. El entrenamiento y la exportación se realizaron con Unsloth.

El dataset de ajuste consta de 4.800 muestras: 1.500 de mbenco/slovak-sft, 1.000 de schneiderkamplab/dfm13-multilingual-grounded-instruct-sk, 1.000 de schneiderkamplab/dfm13-multilingual-math-code-sk, 600 de CohereLabs/aya_collection_language_split (partición eslovaca), 500 de TUKE-DeutscheTelekom/skquad y 200 equivalentes procedentes de 50 diálogos RPG eslovacos escritos a mano con peso 4x (Skyrim, Metro, Fallout). No se documenta el uso de RLHF o DPO, ni el número total de tokens de entrenamiento más allá de la composición por muestras.

## Capacidades

- Generación de texto en eslovaco con énfasis en fluidez y reducción de mezcla de terminaciones de otros idiomas.
- Razonamiento lógico, matemáticas y programación en eslovaco, gracias al subconjunto dfm13-multilingual-math-code-sk.
- Roleplay de fantasía oscura con registro atmosférico (estilos Skyrim, Metro, Fallout).
- Comprensión de imágenes mediante el proyector mmproj opcional (entrada multimodal texto + imagen).
- Conversación multi-turno con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible (el modelo base podría heredarlo, pero no se confirma).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües adicionales: no documentadas; el ajuste se centra en eslovaco.

## Casos de uso

- Roleplay y narrativa interactiva en eslovaco: el modelo está entrenado específicamente con diálogos de fantasía oscura, por lo que puede sostener partidas de rol por texto con un tono atmosférico consistente y terminología eslovaca correcta.
- Asistente conversacional en eslovaco para atención al usuario: útil en prototipos de chatbots donde se prioriza la corrección idiomática sobre el conocimiento factual, con temperature recomendada de 0,45–0,60 para limitar errores tipográficos.
- Generación de texto creativo en eslovaco (relatos, descripciones de escenarios, diálogos de personajes): el ajuste reduce la mezcla de sufijos extranjeros, un problema habitual en modelos multilingües pequeños.
- Resolución de problemas matemáticos y de lógica sencillos en eslovaco: adecuado para herramientas educativas o de apoyo al estudio en ese idioma, dado el subconjunto de math-code del entrenamiento.
- Ejercicios de comprensión lectora sobre textos eslovacos: el modelo se entrenó con skquad (dataset de question answering extractivo en eslovaco), por lo que puede responder preguntas sobre pasajes cortos.
- Inferencia local en equipos de consumo: al estar en GGUF Q6_K y tener 4,3 B de parámetros, se puede ejecutar con llama.cpp u Ollama en portátiles con GPU modesta o incluso en CPU, lo que facilita prototipado sin infraestructura cloud.
- Prototipos multimodales ligeros: con el mmproj F16 se pueden hacer pruebas de descripción de imágenes o de roleplay con soporte visual, aunque la calidad visual no está validada en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 4,2 GB en total; el archivo Q6_K ronda los 3,5–3,8 GB y el mmproj F16 añade aproximadamente 0,5–0,8 GB. En la práctica, se necesita alrededor de 4–5 GB de VRAM para el modelo de texto y 5–6 GB si se carga también el proyector visual (estimación a partir del tamaño de los archivos, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para el modo multimodal; 8 GB o más para margen de contexto. Modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 o H100 pueden ejecutarlo sobradamente.
- ¿Cabe en GPU de consumo? Sí: con Q6_K cabe en GPUs de 6–8 GB, y con cuantizaciones menores (no publicadas en este repo) cabría en GPUs de 4 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/F606F/Qwen3.5-4B-Slovak-RPG-GGUF:Q6_K`), llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), LM Studio, KoboldCpp y Jan. Plantilla de chat: ChatML.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda `-ngl 99` para descargar todas las capas en GPU, lo que sugiere que el rendimiento óptimo se obtiene con aceleración por GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Slovak-RPG-GGUF | 4,3 B | no disponible (entrenado a 1.280) | sk | Apache 2.0 | GGUF Q6_K + mmproj F16 | Ajuste fino eslovaco con rol oscuro; sin benchmarks publicados |
| Qwen3.5-4B (base, Unsloth) | 4,3 B | no disponible | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo base; capacidades multilingües y multimodales originales |
| Modelos eslovacos SFT de la familia dfm13 (schneiderkamplab) | no disponible | no disponible | sk, multilingüe | no disponible | no disponible | Fuente de parte de los datos de entrenamiento; no se dispone de comparación directa de rendimiento |
| Modelos pequeños multilingües tipo Gemma/Qwen de 4 B | ~4 B | variable | multilingüe | variable | safetensors, GGUF | Alternativas genéricas; no especializadas en eslovaco ni en roleplay |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- El ajuste se realizó con solo 4.800 muestras y 600 pasos, por lo que el riesgo de sobreajuste al estilo RPG y de degradación de capacidades generales es real.
- El conjunto de datos de roleplay es muy pequeño (50 diálogos, 200 muestras efectivas con peso 4x), lo que puede limitar la variedad de escenarios y favorecer la repetición de patrones.
- La longitud de contexto usada en entrenamiento (1.280 tokens) es corta; para conversaciones largas puede degradarse el rendimiento aunque el modelo base soporte más contexto.
- Riesgo de alucinación inherente a un modelo de 4,3 B; no se han publicado evaluaciones de factualidad.
- El modelo está orientado al eslovaco; el uso en castellano u otros idiomas no está validado y probablemente produzca mezcla de idiomas.
- No se documentan sesgos específicos, pero al entrenarse con datasets eslovacos y temáticas de fantasía oscura (violencia, distopía) puede reproducir estereotipos o contenido violento si no se filtra.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar también la licencia del modelo base Qwen3.5-4B.
- No hay benchmarks publicados ni validación independiente; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de adopción verificable.
- El soporte de tool calling y de agentes no está documentado; no debe asumirse en producción sin pruebas.
- La fecha de creación indicada (2026-11-21) es futura respecto a la redacción habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/F606F/Qwen3.5-4B-Slovak-RPG-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Dataset mbenco/slovak-sft: https://huggingface.co/datasets/mbenco/slovak-sft
- Dataset schneiderkamplab/dfm13-multilingual-grounded-instruct-sk: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-grounded-instruct-sk
- Dataset schneiderkamplab/dfm13-multilingual-math-code-sk: https://huggingface.co/datasets/schneiderkamplab/dfm13-multilingual-math-code-sk
- Dataset CohereLabs/aya_collection_language_split: https://huggingface.co/datasets/CohereLabs/aya_collection_language_split
- Dataset TUKE-DeutscheTelekom/skquad: https://huggingface.co/datasets/TUKE-DeutscheTelekom/skquad
