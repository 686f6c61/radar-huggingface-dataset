# nightmedia/Qwen3.5-9B-Flow-dwq4-mlx

## Resumen

Qwen3.5-9B-Flow-dwq4-mlx es una fusión de pesos (merge) de modelos de la familia Qwen3.5 de 9B, publicada por el usuario nightmedia bajo licencia Apache 2.0. El autor la describe explícitamente como una cuantización solo texto del mismo ensamblado que Qwen3.5-9B-Seven-q8-hi-mlx, pensada para escribir en dispositivos pequeños que no necesitan capacidades de visión-lenguaje (VL). El repositorio ocupa 5,6 GB y los pesos en safetensors suman 8.953.801.728 parámetros (unos 8,95 B), por lo que se trata de un transformer denso, no de una arquitectura MoE.

El modelo se construye combinando dos merges previos del propio autor: Qwen3.5-9B-Brainwaves (a su vez derivado de Wichtelchen y Holodeck-Lounge) y Qwen3.5-9B-B2-Fable-Agent-OneJev (que mezcla B2-9B, Fable-5-v1 y OneJev-9B). La model card documenta una estrategia de apilamiento de capas con nuslerp y pesos relativos de 1,6 frente a 0,4 en cada nivel, con el objetivo declarado de anclar un comportamiento creativo y narrativo a un sustrato más orientado a decisiones de agente y ejecución rápida.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general ni un lanzamiento oficial de Qwen, sino un artefacto de la comunidad orientado a escritura creativa, generación de tramas, roleplay y continuación de escenas, distribuido en formato dwq4 para MLX. El autor publica métricas propias de la batería "brainwaves" y de perplejidad que sirven para comparar la pérdida de calidad entre cuantizaciones, pero no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluación independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5; fusión de pesos mediante mergekit (apilamiento de capas con nuslerp) |
| Parametros totales | 8.953.801.728 (~8,95 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | dwq4 y mxfp4 (variantes documentadas en el repositorio); en la model card se comparan ademas bf16, mxfp8, q8, q8-hi, q6, q6-hi y qx86-hi |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (library_name: transformers), con etiqueta mlx; el repositorio pesa 5,6 GB |
| Pipeline | text-generation |
| Tamano del repositorio | 5,6 GB |
| Fecha de publicacion | 2026-10-05 (creacion), 2026-10-05 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información sobre un proceso de entrenamiento propio: el modelo no se entrena desde cero, sino que se obtiene por fusión de pesos. La model card indica que es un merge de nightmedia/Qwen3.5-9B-Brainwaves y nightmedia/Qwen3.5-9B-B2-Fable-Agent-OneJev, con el nombre interno de laboratorio Qwen3.5-9B-Wichtelchen-Holodeck-Lounge-B2-Fable-Agent-OneJev. La lista de modelos participantes incluye 15 referencias, entre ellas OneJev-9B, B2-9B, Fara1.5-9B, Qwopus3.5-9B-Coder, armand0e/Qwen3.5-9B-Agent, Fable-5-v1 y varias variantes de DavidAU etiquetadas como "HERETIC", "UNCENSORED" y "THINKING" (Claude-4.6-OS-Auto-Variable, GBO-Fire, Deckard, Polaris, Bradbury-F451, Pro-Writer-1984-Orwell, Polar-Rev1, Mark-Twain, Haskell-Rust-Python).

La única descripción técnica de la fusión disponible es una reseña de arquitectura generada por Gemini e incluida en la propia model card, que no constituye documentación oficial del autor. Según ese texto, la estrategia emplea nuslerp para apilar capas con pesos 1,6 (Qwen3.5-9B-Brainwaves) y 0,4 (Qwen3.5-9B-B2-Fable-Agent-OneJev) en el primer nivel, y dentro del segundo componente pesos 1,6 (B2-Fable-Agent) y 0,4 (OmniJev/OneJev-9B). El objetivo declarado es combinar generación de texto narrativa y multi-persona con lógica orientada a código y agentes, más una capa de decisión rápida procedente de OneJev-9B. No se documentan número de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO para este artefacto concreto, ya que toda esa información pertenecería a los modelos base y no se recoge en el repositorio.

Los únicos datos cuantitativos de comportamiento son medidas de la propia cuantización. Para dwq4 la perplejidad es 4,305 ± 0,028, el pico de memoria 12,38 GB y el rendimiento 639 tokens/s; para mxfp4 la perplejidad sube a 4,467 ± 0,030, el pico de memoria baja a 11,55 GB y el rendimiento sube a 732 tokens/s.

## Capacidades

- Generación de texto narrativo y de ficción: la model card lista escritura creativa, escritura de ficción, generación de tramas, generación de subtramas, generación de historias, continuación de escenas y storytelling entre las etiquetas funcionales del modelo.
- Prosa descriptiva y vívida ("vivid prosing", "vivid writing"): el modelo está orientado a estilo y registro literario más que a tareas analíticas.
- Cobertura de géneros: ciencia ficción, romance y, según las etiquetas, "all genres".
- Roleplay y conversación multi-turno: las etiquetas incluyen roleplaying y conversational, coherente con el linaje Holodeck-Lounge y Wichtelchen del componente Brainwaves.
- Capacidades heredadas de código: entre los modelos participantes figuran Qwopus3.5-9B-Coder y Qwen3.5-9B-Haskell-Rust-Python, aunque no hay ninguna evaluación de código publicada para este merge.
- Comportamiento orientado a agentes: el linaje incluye Qwen3.5-9B-Agent, Fable-5-v1 y OneJev-9B, descrito en la reseña citada como especializado en decisiones de estado de baja latencia. No se documenta soporte verificado de tool calling ni function calling.
- Multilingüismo: únicamente inglés (en) y chino (zh) según los metadatos del repositorio.
- Modo thinking: varios modelos participantes llevan la etiqueta "THINKING", pero no se confirma que este merge conserve ni exponga un modo de razonamiento explícito.
- Visión: el repositorio incluye la etiqueta image-text-to-text, pero el autor afirma que se trata de una cuantización solo texto de la misma base, destinada a dispositivos que no necesitan VL. No debe asumirse capacidad de visión operativa en esta variante.

## Casos de uso

- Escritura de ficción de formato largo: el modelo está especializado en generación de tramas, subtramas y continuación de escenas, por lo que encaja en flujos de escritura asistida donde un autor aporta un esquema y el modelo desarrolla capítulos con prosa descriptiva.
- Generación de borradores de relato corto y novela por género: las etiquetas cubren ciencia ficción, romance y otros géneros, lo que permite usarlo como generador de primeros borradores que luego se editan manualmente.
- Roleplay y personajes conversacionales: con linaje explícito de roleplaying y multi-persona, es adecuado para aplicaciones de chat narrativo donde el modelo debe mantener una voz de personaje a lo largo de turnos.
- Continuación de escenas para guion y narrativa interactiva: la función "scene continue" permite integrarlo en herramientas de escritura colaborativa que sugieren cómo sigue una escena a partir de un fragmento previo.
- Asistente de escritura local en Apple Silicon: al publicarse en formato dwq4 para MLX con un pico de memoria de 12,38 GB y 639 tokens/s, es viable ejecutarlo en un equipo de sobremesa de Apple sin GPU dedicada ni servicio en la nube, lo que resulta útil cuando el material narrativo es confidencial.
- Exploración creativa sin filtros editoriales por defecto: el linaje "abliterated"/"heretic" implica que el modelo no incorpora los mecanismos de rechazo habituales, algo que algunos autores buscan para ficción con temas sensibles; conviene aplicar moderación propia en cualquier producto final.
- Prototipado de chat bilingüe inglés-chino: para productos que necesiten conversación en esos dos idiomas y no requieran cobertura multilingüe amplia.
- Generación de ideas y variantes argumentales: usar el modelo para producir múltiples ramas narrativas a partir de una premisa, aprovechando que la fusión prioriza diversidad creativa frente a precisión factual.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la batería propia "brainwaves" del autor y las medidas de perplejidad y velocidad. Las columnas corresponden a ARC, ARC-Easy, BoolQ, HellaSwag, OBKQA, PIQA y Winogrande. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar en la información disponible.

| Variante | ARC | ARC-E | BoolQ | HellaSwag | OBKQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|
| bf16 | 0,686 | 0,860 | 0,903 | 0,769 | 0,518 | 0,799 | 0,715 |
| q8-hi | 0,690 | 0,862 | 0,904 | 0,768 | 0,522 | 0,797 | 0,717 |
| dwq4 (este repositorio) | 0,680 | 0,864 | 0,902 | 0,771 | 0,508 | 0,801 | 0,700 |
| mxfp4 | no disponible (solo se publica el valor 0,662, sin indicar la metrica) | | | | | | |

| Cuantizacion | Perplejidad | Pico de memoria | Tokens/s |
|---|---|---|---|
| dwq4 | 4,305 ± 0,028 | 12,38 GB | 639 |
| mxfp4 | 4,467 ± 0,030 | 11,55 GB | 732 |

La model card no especifica el hardware ni el prompt set empleados para medir perplejidad ni tokens/s, por lo que las cifras de velocidad y memoria no son directamente extrapolables a otras plataformas.

## Requisitos de hardware

- Pico de memoria medido por el autor: 12,38 GB para la variante dwq4 y 11,55 GB para mxfp4. Estas cifras son las únicas disponibles y corresponden a la plataforma de medida del autor, presumiblemente Apple Silicon por el uso de MLX.
- Tamano en disco: 5,6 GB para el repositorio completo.
- GPU recomendadas: no disponible. La model card no menciona CUDA, A100, H100 ni RTX 4090, y el formato declarado (dwq4, MLX) apunta a ejecución en Apple Silicon más que a GPUs de datacenter.
- Viabilidad en GPU de consumo: no confirmada en la información disponible. Con 8,95 B de parámetros, una cuantización de 4 bits ocuparía del orden de 5 GB de pesos, lo que en teoría cabría en GPUs con 8-12 GB de VRAM, pero no hay ninguna verificación publicada de que estos pesos MLX funcionen en CUDA ni de que exista una ruta de conversión.
- Opciones de despliegue: la librería declarada es transformers con pesos safetensors y etiqueta mlx, de modo que la ruta esperada es MLX en macOS. No se publican pesos GGUF, por lo que llama.cpp y Ollama no están disponibles para esta variante según la información del repositorio. Tampoco hay confirmación de compatibilidad con vLLM ni TGI.
- Latencia y throughput: 639 tokens/s en dwq4 y 732 tokens/s en mxfp4, según la medición del autor, con hardware no especificado.

## Comparativa con modelos similares

Los datos disponibles no permiten comparar con modelos de terceros, pero sí con el linaje directo del merge y con el modelo base de referencia. La tabla recoge los valores de la batería brainwaves para las variantes comparables. La columna "Parametros" solo está confirmada para este repositorio.

| Modelo | Parametros | Contexto | ARC | ARC-E | BoolQ | HellaSwag | Licencia | Estado |
|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-Flow-dwq4-mlx (este) | 8,95 B | no disponible | 0,680 | 0,864 | 0,902 | 0,771 | apache-2.0 | Publicado, 0 descargas |
| nightmedia/Qwen3.5-9B-B2-Fable-Agent-OneJev (padre, q8-hi) | no disponible | no disponible | 0,692 | 0,868 | 0,898 | 0,774 | no disponible | Publicado |
| nightmedia/Qwen3.5-9B-Brainwaves (padre, bf16) | no disponible | no disponible | 0,686 | 0,860 | 0,903 | 0,768 | no disponible | Publicado |
| Qwen3.5-9B Instruct (base, q8-hi) | no disponible | no disponible | 0,561 | 0,708 | 0,892 | 0,690 | no disponible | Referencia de la model card |

Las diferencias entre el merge y sus dos componentes son de una o dos centésimas en la mayoría de métricas, dentro del margen que suele atribuirse al ruido de evaluación. Frente al baseline Qwen3.5-9B Instruct, el merge sube de forma notable en ARC (0,680 frente a 0,561), ARC-Easy (0,864 frente a 0,708) y HellaSwag (0,771 frente a 0,690), y se mantiene prácticamente igual en BoolQ. No hay datos de comparación con otras familias de modelos de 9B en la información disponible.

## Limitaciones y advertencias

- Ausencia total de validación independiente: el repositorio tiene cero descargas y cero likes, y todas las métricas proceden del propio autor en su batería "brainwaves", no de evaluaciones reconocidas.
- Sesgos conocidos: no hay información publicada. Al ser una fusión de modelos ajustados para escritura creativa y roleplay, es esperable que herede sesgos estilísticos y de contenido de sus componentes, pero no se documenta ningún análisis al respecto.
- Riesgo de alucinación: elevado en un uso factual. El modelo no está orientado a precisión ni a recuperación de conocimiento, sino a generación narrativa, y los merges de este tipo tienden a degradar la fidelidad factual.
- Contenido sin salvaguardas: el linaje incluye modelos etiquetados como "abliterated" y "heretic", lo que implica que se han eliminado o atenuado los mecanismos de rechazo. Es previsible que el modelo genere contenido inapropiado, ofensivo o sensible sin filtros, algo que debe gestionarse con moderación externa en cualquier despliegue orientado al público.
- Idioma: solo inglés y chino. No hay soporte documentado de castellano, por lo que la calidad de generación en español no está garantizada ni medida.
- Licencia: el repositorio declara apache-2.0, que permite uso comercial, pero los modelos base listados no tienen licencia indicada en la información disponible, por lo que la cadena de derechos para uso comercial no puede verificarse solo con estos datos.
- Contexto: se desconoce la longitud de contexto efectiva de este merge, y la fusión de pesos puede haberla alterado respecto a los modelos base. No debe asumirse un valor concreto sin medirlo.
- Arquitectura solo texto: aunque la etiqueta image-text-to-text aparece en el repositorio, el autor declara que es una cuantización solo texto, por lo que no debe esperarse capacidad de visión operativa.
- Documentación escasa: la model card no detalla hiperparámetros de la fusión, dataset, proceso de evaluación ni hardware de medida. La sección de reseña arquitectónica es un texto generado por Gemini, no un informe técnico del autor.
- Ejecución restringida: al publicarse en formato MLX/dwq4 sin GGUF, su uso queda prácticamente limitado a entornos Apple Silicon con MLX, sin ruta conocida a CUDA, vLLM o TGI.
- Fechas anómalas: la fecha de creación y actualización (2026-10-05) es posterior a la fecha actual, lo que sugiere un error de metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nightmedia/Qwen3.5-9B-Flow-dwq4-mlx
- Componente Brainwaves: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Componente B2-Fable-Agent-OneJev: https://huggingface.co/nightmedia/Qwen3.5-9B-B2-Fable-Agent-OneJev
- Modelo relacionado citado en la model card: https://huggingface.co/nightmedia/Qwen3.5-9B-Seven-q8-hi-mlx
- OmniJev/OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- schneewolflabs/B2-9B: https://huggingface.co/schneewolflabs/B2-9B
- microsoft/Fara1.5-9B: https://huggingface.co/microsoft/Fara1.5-9B
- armand0e/Qwen3.5-9B-Agent: https://huggingface.co/armand0e/Qwen3.5-9B-Agent
- Jackrong/Qwopus3.5-9B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-X8b
- nightmedia/Qwen3.5-9B-Holodeck-Lounge: https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Lounge
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
