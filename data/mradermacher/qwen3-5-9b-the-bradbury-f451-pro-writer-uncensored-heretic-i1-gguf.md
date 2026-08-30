# mradermacher/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-i1-GGUF

## Resumen

El modelo **Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-i1-GGUF** es una cuantización en formato GGUF de un fine-tune del modelo base Qwen3.5-9B, desarrollado por DavidAU y posteriormente convertido y optimizado por mradermacher. El fine-tune está orientado a la escritura creativa sin filtros de seguridad, inspirado en la novela *Fahrenheit 451* de Ray Bradbury, y se distribuye exclusivamente para inferencia local mediante motores compatibles con GGUF como llama.cpp, Ollama o LM Studio.

La relevancia de este modelo radica en su especialización para tareas de redacción literaria y narrativa, ofreciendo un estilo de escritura libre de restricciones de contenido. Al estar cuantizado en GGUF, permite su ejecución en hardware de consumo con requisitos de VRAM moderados, lo que lo hace accesible para desarrolladores y aficionados que buscan un generador de texto creativo local. El repositorio incluye múltiples niveles de cuantización (Q2_K, Q4_K_S, Q6_K, etc.) para adaptarse a diferentes capacidades de hardware.

Aunque la información pública es limitada, el modelo se presenta como una opción interesante para quienes necesitan un asistente de escritura con un tono literario distintivo y sin censura. No se han publicado detalles sobre el proceso de entrenamiento, benchmarks o licencia, por lo que su adopción en entornos de producción requiere una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de Qwen3.5-9B (arquitectura base no especificada) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según comentarios del README) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B ni sobre el proceso de fine-tune aplicado por DavidAU. Por el nombre, se infiere que se trata de un transformer de 9 mil millones de parámetros, probablemente con atención estándar, pero no hay confirmación oficial. El fine-tune se realizó utilizando la herramienta Unsloth, según se menciona en la página de FriendliAI, y se basó en la novela *Fahrenheit 451* de Ray Bradbury para ajustar el estilo de escritura. No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF fue generada por mradermacher con calibración imatrix, lo que mejora la precisión de los pesos cuantizados.

## Capacidades

- Generación de texto creativo y narrativo con un estilo literario inspirado en Ray Bradbury.
- Escritura sin filtros de seguridad (uncensored), lo que permite abordar temas controvertidos o explícitos.
- Soporte de conversación multi-turno (etiqueta "conversational" en HuggingFace).
- Compatible con inferencia local mediante motores GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- **Redacción de ficción y novelas**: el modelo puede generar pasajes narrativos, diálogos y descripciones con un estilo literario distintivo, útil para escritores que buscan inspiración o borradores iniciales.
- **Creación de contenido para blogs y redes sociales**: su capacidad para producir texto fluido y atractivo sin restricciones temáticas permite generar artículos, hilos o publicaciones con un tono personalizado.
- **Asistente de escritura creativa en aplicaciones locales**: integrable en herramientas de escritura como Obsidian, VS Code o aplicaciones propias mediante la API de llama.cpp, ofreciendo sugerencias de estilo y continuación de texto.
- **Generación de guiones y diálogos para teatro o cine**: el enfoque en narrativa literaria lo hace adecuado para esbozar escenas y personajes con un registro expresivo.
- **Prototipado de chatbots con personalidad literaria**: su naturaleza conversacional y su estilo único permiten crear asistentes virtuales con una voz distintiva, por ejemplo para experiencias de rol o juegos de texto.
- **Exploración de escritura sin censura en entornos de investigación**: útil para estudiar los límites de la generación de texto libre y el impacto de la eliminación de filtros de seguridad en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este fine-tune o su cuantización.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de ~9B parámetros en GGUF, la VRAM necesaria varía según la cuantización. Con Q4_K_S (~5-6 GB de archivo) se requieren aproximadamente 6-7 GB de VRAM; con Q6_K (~7-8 GB) se necesitan 8-10 GB. El repositorio actual tiene un tamaño de 3.8 GB, lo que sugiere una cuantización baja (posiblemente Q2_K o IQ3), que podría caber en GPUs con 4-6 GB.
- **GPU recomendadas**: tarjetas con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 3070, etc.) son suficientes para las cuantizaciones más altas. Para las más bajas, GPUs con 4-6 GB (GTX 1660, RTX 3050) pueden funcionar.
- **Compatibilidad con consumer GPU**: sí, es viable en GPUs de consumo gracias a las cuantizaciones GGUF.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, o servidores compatibles con la API de llama.cpp.
- **Latencia y throughput**: no se han publicado mediciones específicas. En una GPU moderna (RTX 4090), un modelo de 9B en Q4_K_S suele generar entre 30-60 tokens por segundo, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3.5-9B podría compararse con otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento de este fine-tune. Se recomienda consultar las fichas de los modelos base para obtener referencias.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un fine-tune sin filtros, el modelo puede generar contenido ofensivo, inexacto o alucinado con mayor facilidad que los modelos alineados. No se han realizado evaluaciones de sesgo.
- **Riesgo de contenido inapropiado**: la naturaleza "uncensored" implica que puede producir texto explícito, violento o discriminatorio. No es adecuado para aplicaciones públicas sin moderación.
- **Licencia desconocida**: no se especifica la licencia del modelo, lo que impide garantizar su uso comercial o la redistribución. Se debe contactar con el autor antes de usarlo en producción.
- **Contexto limitado**: no se conoce la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- **Idiomas**: no se ha confirmado qué idiomas soporta; probablemente herede las capacidades del modelo base Qwen3.5, pero no hay garantía.
- **Calidad de la cuantización**: aunque se usó imatrix, las cuantizaciones muy agresivas (Q2_K, IQ1) pueden degradar notablemente la calidad del texto generado.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-i1-GGUF)
- [Modelo original en HuggingFace (DavidAU)](https://huggingface.co/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic)
- [Página del modelo en FriendliAI](https://friendli.ai/models/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic)
- [Artículo en UncensoredHub sobre los fine-tunes](https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations)
- [Perfil de mradermacher en HuggingFace](https://huggingface.co/mradermacher)
