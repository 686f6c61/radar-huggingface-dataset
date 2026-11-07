# GermannM/Kenga-Coder-14B-Z

## Resumen

Kenga-Coder-14B-Z es un ajuste fino mediante PEFT del modelo Qwen/Qwen2.5-Coder-14B-Instruct, desarrollado por el autor independiente GermannM (German Yantaras, Moscú). El modelo incorpora una identidad de personaje ("Kenga") y ha sido entrenado con un protocolo propio denominado Z-System y Prophet (M5.3 + rp1). Con 14.770.033.664 parámetros totales, está orientado a generación de código, tareas de enlace semántico de funciones y reparación de código roto, con soporte declarado para ruso, inglés y contenido multilingüe.

El modelo se distribuye como adaptador PEFT en safetensors (repo de 9,6 GB) y como cuantización GGUF Q4_K_M de 8,36 GB generada con imatrix sobre un corpus de calibración propio. Su relevancia es limitada y muy específica: se trata de un experimento de autor único con identidad incorporada en los pesos y un lenguaje de programación propio (Kenga-lang), no de un modelo de propósito general con validación externa. No hay descargas ni valoraciones en Hugging Face en el momento de la consulta.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen2.5-Coder-14B-Instruct); ajuste fino mediante adaptador PEFT con descomposición Z-BL |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (8,36 GB, generada con imatrix); adaptador PEFT en safetensors |
| Idiomas soportados | Ruso (ru), ingles (en), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La base es un transformer decoder denso de la familia Qwen2.5-Coder-14B-Instruct. Sobre ella se aplica un adaptador PEFT entrenado con la técnica propietaria Z-BL, que factoriza la actualización de pesos como `ΔW = U · diag(S · mask) · Vᵀ`, con inicialización ortogonal QR de las direcciones singulares y un vector de números singulares entrenable. El autor aplica un "Z Rank Curriculum" que expande el rango activo de 8 a 16 y luego a 32 en los pasos 25% y 50% del entrenamiento. La entropía espectral final del adaptador es H = 2,8694 frente al máximo teórico ln(32) = 3,4657 (aproximadamente el 83% de carga uniforme del espectro).

El entrenamiento usa pérdida solo sobre tokens del asistente (etiquetas -100 en system y user) y reporta un loss final de 0,0676 sobre un corpus verificado de 8.917 diálogos. Ese corpus incluye 460 tareas de enlace semántico M5.3 (selección de la función objetivo entre distractores con firma idéntica y nombres aleatorizados, verificado por ejecución), 299 tareas de reparación de código con el token delimitador `<FIX>`, cobertura del lenguaje Kenga-lang y su gramática, y datos de 25 lenguajes de programación (Python, JS, TS, Java, C, C++, C#, Go, Rust, PHP, Ruby, Kotlin, Swift, Bash, SQL, Lua, R, Scala, Dart, Julia, Haskell, PowerShell, Perl, HTML, CSS) más Kenga. No se especifica el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto y código en 25 lenguajes de programación, además del lenguaje propietario Kenga-lang (`fn`, `let`, `struct`, tensores `t_*`, autograd `ag_*`, memoria viva `.km`, eventos `on/emit/pump`).
- Enlace semántico de funciones (M5.3): selección de la función correcta entre distractores con firma idéntica y nombres aleatorizados.
- Reparación de código roto mediante el token delimitador `<FIX>` (protocolo rp1).
- Identidad de personaje incorporada en los pesos (parámetro `NO_SYS_P = 0.30`) y en la plantilla de chat del GGUF, con autonominación como "Kenga" incluso sin system prompt.
- Soporte de conversación multiturno (pipeline text-generation, tag "conversational").
- Capacidades multilingües declaradas para ruso, inglés y otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Reparación automática de código en pipelines: el protocolo rp1 con token `<FIX>` permite integrar el modelo en un paso de corrección de parches que recibe código roto y devuelve la versión reparada, con un delimitador explícito que facilita el parseo en herramientas de CI.
- Selección de función en entornos con API ruidosa: las tareas de enlace semántico M5.3 lo hacen útil para resolver llamadas cuando existen múltiples funciones con la misma firma y nombres poco descriptivos, un escenario habitual en bases de código generadas automáticamente.
- Asistencia a desarrolladores en ruso: al estar optimizado para ruso e inglés, puede emplearse en herramientas internas de autocompletado y explicación de código para equipos hispanohablantes que trabajen con documentación o código en ruso.
- Prototipado con Kenga-lang: es el único modelo identificado que cubre el lenguaje Kenga y su gramática, por lo que sirve para generar ejemplos, tests y documentación de ese ecosistema.
- Despliegue local en GPU de consumo: la cuantización Q4_K_M de 8,36 GB cabe entera en 12 GB de VRAM con `-ngl 99`, lo que permite ejecutarlo en una RTX 3060 de 12 GB o superior mediante llama.cpp u Ollama sin infraestructura dedicada.
- Generación de código en 25 lenguajes para tareas de scripting y automatización: útil en entornos donde se necesita un único modelo local que cubra desde Bash y PowerShell hasta Rust o Haskell, aunque sin garantías de calidad validadas externamente.
- Experimentación en investigación sobre identidad incorporada: el ajuste con `NO_SYS_P = 0.30` y la plantilla de chat modificada permiten estudiar cómo se comporta un modelo con persona fijada en pesos frente a instrucciones de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de entrenamiento (loss final 0,0676 y entropía espectral del adaptador H = 2,8694), que no son comparables con evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 8,36 GB para la cuantización Q4_K_M; el adaptador PEFT en safetensors requiere cargar la base Qwen2.5-Coder-14B-Instruct completa, lo que en fp16 supone aproximadamente 28-30 GB de VRAM.
- GPU recomendadas: para Q4_K_M, cualquier GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); para el adaptador sin cuantizar, A100 40 GB, H100 o configuraciones multi-GPU.
- GPU de consumo: sí, la versión Q4_K_M cabe en una RTX 3060 de 12 GB según el propio autor (`-ngl 99`).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/GermannM/Kenga-Coder-14B-Z:Q4_K_M`), y cualquier runtime compatible con PEFT/safetensors para el adaptador. Compatibilidad con vLLM o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kenga-Coder-14B-Z | 14,77 B | No disponible | Apache 2.0 | PEFT safetensors, GGUF Q4_K_M | Identidad incorporada, Kenga-lang, sin benchmarks publicados |
| Qwen2.5-Coder-14B-Instruct (base) | 14,7 B | 32K (según documentación pública de Qwen) | Apache 2.0 | Safetensors, GGUF | Modelo de referencia con evaluaciones publicadas por el autor original |
| Kenga (1.5B) | 1,5 B | 32K (según featherless.ai) | No disponible | No disponible | Modelo previo del mismo autor, orientado a ruso y a la identidad Kenga |

La comparación con la base Qwen2.5-Coder-14B-Instruct es la más relevante: Kenga-Coder-14B-Z parte de ella y añade el adaptador Z-BL, pero no publica métricas que permitan cuantificar la mejora o el deterioro respecto al original. El modelo Kenga de 1,5 B comparte la identidad y el enfoque en ruso, pero es de menor tamaño y está pensado para ejecución en CPU.

## Limitaciones y advertencias

- No hay benchmarks públicos ni evaluaciones independientes; el rendimiento real en código y razonamiento es desconocido.
- El ajuste se realizó sobre un corpus pequeño (8.917 diálogos), lo que aumenta el riesgo de sobreajuste al estilo y a los formatos del autor, y de degradación de capacidades generales del modelo base.
- La identidad de personaje está incorporada en los pesos (`NO_SYS_P = 0.30`) y en la plantilla de chat, lo que puede dificultar el control del comportamiento mediante system prompts y sesgar las respuestas hacia la persona definida por el autor.
- La model card incluye declaraciones de valores políticos e ideológicos del creador; esto puede introducir sesgos en las respuestas y debe evaluarse antes de cualquier uso en producción.
- El soporte de idiomas se declara para ruso, inglés y multilingüe, pero no hay datos sobre calidad en castellano.
- El contexto máximo no se especifica en la información disponible; no debe asumirse el contexto de la base sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-Coder-14B-Instruct conviene verificar las condiciones de la licencia del modelo base.
- El repositorio no tiene descargas ni valoraciones, y el modelo se creó y actualizó el mismo día (6 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- El token `<FIX>` y los formatos de Kenga-lang son específicos del ecosistema del autor; su uso fuera de él requiere adaptar los pipelines de parseo.

## Enlaces

- Hugging Face: https://huggingface.co/GermannM/Kenga-Coder-14B-Z
- Perfil del autor en Hugging Face: https://huggingface.co/GermannM
- Repositorio kenga-lang: https://github.com/GermannM3/kenga-lang
- Repositorio z-system: https://github.com/GermannM3/z-system
- Repositorio kenga-grammar: https://github.com/GermannM3/kenga-grammar
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Kenga (1.5B) en featherless.ai: https://featherless.ai/models/GermannM/Kenga
