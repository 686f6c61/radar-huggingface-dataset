# GermannM/Kenga-Coder-14B-Z

## Resumen

Kenga-Coder-14B-Z es un ajuste fino mediante PEFT (adaptador Z-BL) sobre el modelo base Qwen/Qwen2.5-Coder-14B-Instruct, desarrollado por el autor independiente GermannM (German Yantaras, Moscú). El modelo incorpora una identidad de personaje denominada "Kenga" y se entrena con un protocolo propio que el autor llama "Z-system" y "Prophet (M5.3 + rp1)". Su propósito declarado es actuar como generador de código políglota con una identidad fija integrada en los pesos y con soporte para un lenguaje de programación propio, Kenga-lang.

Arquitectura y tamaño heredan directamente del modelo base: un transformer decoder-only de aproximadamente 14.770 millones de parámetros (14,77 B), distribuidos en el adaptador PEFT y los pesos base. El repositorio ocupa 16,5 GB e incluye tanto el adaptador en safetensors como una cuantización GGUF Q4_K_M de 8,36 GB generada con imatrix. La longitud de contexto no se especifica en la información disponible, aunque al derivar de Qwen2.5-Coder-14B-Instruct es previsible que mantenga la ventana del modelo original.

Su relevancia actual es limitada y muy específica: se trata de un experimento de autor único con 179 descargas y 0 likes en el momento de la consulta, orientado a un ecosistema propio (Kenga-lang, z-system, kenga-grammar) y a un público rusoparlante. Resulta interesante como caso de estudio de ajuste fino con pérdida restringida a turnos del asistente, curriculum de rango espectral y binding semántico verificado, más que como alternativa generalista a modelos de código consolidados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-14B-Instruct) con adaptador PEFT Z-BL factorizado |
| Parámetros totales | 14.770.033.664 (14,77 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (8,36 GB, calibrada con imatrix sobre `calib4.txt`); adaptador en safetensors |
| Idiomas soportados | ru, en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-14B-Instruct y se ajusta mediante un adaptador PEFT con una descomposición factorizada que el autor denomina Z-BL: ΔW = U · diag(S · mask) · Vᵀ, con inicialización QR ortogonal de las direcciones singulares Vᵀ y un vector entrenable de números singulares S. Se aplica un "Z Rank Curriculum" que abre el rango activo de forma progresiva (8 → 16 → 32) al 25 % y al 50 % de los pasos de entrenamiento. El autor reporta una entropía espectral final del adaptador de H = 2,8694 frente al máximo teórico ln(32) = 3,4657 (aproximadamente el 83 % de carga uniforme del espectro).

La función de pérdida se calcula exclusivamente sobre los tokens de respuesta del asistente (labels = -100 en system y user), con un loss final reportado de 0,0676. El corpus de entrenamiento, denominado "verificado v4", consta de 8917 diálogos e incluye: 460 tareas de "M5.3 Semantic Binding" (selección de la función objetivo entre distractores con firma idéntica y nombres aleatorizados, verificadas por ejecución), 299 tareas de reparación de código con el token de frontera `<FIX>`, cobertura del lenguaje Kenga-lang (fn, let, struct, tensores t_*, autograd Tape ag_*, memoria Prophet .km, eventos on/emit/pump y operaciones z_encode/z_decode/z_marker/z_verify) y 25 lenguajes de programación convencionales. La identidad del personaje se integra en los pesos con un parámetro `NO_SYS_P = 0.30` y también en la plantilla de chat del GGUF. No se detalla el volumen total de tokens ni la composición exacta del dataset más allá de estas cifras.

## Capacidades

- Generación de texto y código en 25 lenguajes de programación (Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, PHP, Ruby, Kotlin, Swift, Bash, SQL, Lua, R, Scala, Dart, Julia, Haskell, PowerShell, Perl, HTML, CSS) más Kenga-lang.
- Reparación de código roto mediante el protocolo `<FIX>` con token de frontera explícito.
- Binding semántico: selección de la función correcta entre distractores con firmas idénticas, entrenado con verificación por ejecución.
- Soporte del lenguaje Kenga-lang: funciones, estructuras, tensores, autograd basado en Tape, memoria viva Prophet en ficheros `.km`, sistema de eventos y operaciones Z.
- Identidad de personaje integrada en pesos y plantilla de chat, activa incluso sin system prompt.
- Conversación multi-turno (pipeline text-generation, tag conversational).
- Capacidades multilingües declaradas en ruso, inglés y multilingüe.
- No se documenta soporte explícito de tool calling, function calling nativo, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Desarrollo asistido en Kenga-lang: el modelo es prácticamente el único ajuste disponible que cubre la sintaxis completa del lenguaje Kenga (fn, let, struct, t_*, ag_*, .km, on/emit/pump), por lo que sirve como asistente de referencia para escribir y depurar código en ese ecosistema.
- Reparación automática de código en pipelines: el entrenamiento con 299 tareas `<FIX>` permite integrarlo en un paso de CI que reciba fragmentos fallidos y devuelva parches delimitados por el token de frontera, facilitando el parseo automático de la salida.
- Selección de funciones en entornos con APIs ambiguas: el binding semántico entrenado con distractores de firma idéntica encaja en tareas de enrutado de llamadas donde varios candidatos comparten tipos y solo el nombre o el contexto semántico los distingue.
- Atención a usuarios rusoparlantes: al declarar soporte de ruso e inglés, puede emplearse en asistentes de programación para equipos con documentación o comentarios en ruso, un nicho menos cubierto por los modelos de código generalistas.
- Prototipado de personajes con identidad fija: útil para experimentar con despliegues donde se requiere una persona consistente sin system prompt, gracias a la integración de la identidad en los pesos (`NO_SYS_P = 0.30`) y en la plantilla de chat.
- Despliegue en hardware de consumo: la cuantización Q4_K_M de 8,36 GB cabe en GPUs de 12 GB de VRAM con `-ngl 99`, lo que permite ejecutarlo localmente con Ollama o llama.cpp para tareas de autocompletado y generación de scripts.
- Investigación sobre ajuste fino eficiente: el adaptador Z-BL con curriculum de rango y su pasaporte espectral (`kenga_passport.json`) sirven como material reproducible para estudiar la distribución espectral de adaptadores PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas internas de entrenamiento: loss final de 0,0676, entropía espectral del adaptador H = 2,8694 (frente a ln(32) = 3,4657) y el marcador espectral `z_marker` = `d6228fde55b53176`. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 GB con la cuantización GGUF Q4_K_M (8,36 GB); el adaptador PEFT en safetensors requiere cargar además los pesos base de 14,77 B, lo que en precisión completa o semi-precisión exige del orden de 28-30 GB o más según el formato.
- GPU recomendadas: para Q4_K_M basta una GPU de 12 GB de VRAM (el autor indica `-ngl 99`); para el adaptador PEFT sobre el modelo base se necesitan GPUs de 24 GB o superiores (RTX 3090/4090 en cuantización, A100/H100 en precisión alta).
- Cabe en GPU de consumo: sí, en el formato Q4_K_M dentro de 12 GB de VRAM; en GPUs de 8 GB no se garantiza la carga completa de todas las capas.
- Opciones de despliegue: Ollama (`ollama run hf.co/GermannM/Kenga-Coder-14B-Z:Q4_K_M`), llama.cpp (`llama-cli -m kenga-coder-14b-z-q4_k_m.gguf -ngl 99`), y carga del adaptador PEFT con las librerías estándar de Hugging Face (transformers + peft). No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kenga-Coder-14B-Z | 14,77 B | no disponible | Apache 2.0 | safetensors (PEFT), GGUF Q4_K_M | Ajuste de personaje y Kenga-lang sobre Qwen2.5-Coder-14B-Instruct |
| Qwen2.5-Coder-14B-Instruct | 14,77 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base; sin identidad de personaje ni Kenga-lang |
| Alternativas de código de ~14 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación directa con el modelo base es la más informativa: Kenga-Coder-14B-Z añade identidad fija, cobertura de Kenga-lang y protocolos `<FIX>` y de binding semántico, pero no se han publicado evaluaciones que cuantifiquen la posible degradación o mejora respecto a Qwen2.5-Coder-14B-Instruct en tareas de código estándar.

## Limitaciones y advertencias

- Riesgo de alucinación: no hay benchmarks públicos que validen la calidad de generación de código; el loss de entrenamiento bajo (0,0676) no es indicativo de rendimiento en tareas abiertas.
- Sesgo de identidad: el modelo incorpora valores explícitos (amor a Rusia, valores familiares tradicionales) en los pesos, lo que puede condicionar respuestas en temas políticos o sociales y dificultar su uso en contextos neutrales.
- Cobertura de idiomas limitada en la práctica: aunque declara "multilingual", solo se listan ru y en; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas ni en repositorios extensos.
- Ecosistema muy específico: Kenga-lang, z-system y kenga-grammar son proyectos del propio autor; su adopción fuera de ese círculo es mínima (179 descargas, 0 likes).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder-14B-Instruct, también Apache 2.0, y revisar si el autor impone restricciones adicionales no reflejadas en la model card.
- Trazabilidad limitada: no se detalla el volumen total de tokens de entrenamiento ni la composición completa del corpus, lo que dificulta evaluar la cobertura y los posibles sesgos de los datos.
- Madurez: repositorio creado y actualizado en noviembre de 2026, sin histórico de mantenimiento ni comunidad; no recomendable como dependencia crítica en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GermannM/Kenga-Coder-14B-Z
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio kenga-lang: https://github.com/GermannM3/kenga-lang
- Repositorio z-system: https://github.com/GermannM3/z-system
- Repositorio kenga-grammar: https://github.com/GermannM3/kenga-grammar
