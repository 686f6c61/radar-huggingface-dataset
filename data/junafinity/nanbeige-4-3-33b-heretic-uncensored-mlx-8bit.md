# junafinity/Nanbeige-4.3-33B-Heretic-Uncensored-MLX-8bit

## Resumen

Nanbeige-4.3-33B-Heretic-Uncensored-MLX-8bit es una cuantizacion en formato MLX de 8 bits del modelo Luni/Nanbeige-4.3-33B-Heretic, que a su vez es una version "abliterated" (con los mecanismos de rechazo reducidos) del Nanbeige4.3-33B original. El trabajo de cuantizacion y publicacion lo firma junafinity bajo la marca VeriSafe.Live, un servicio que ofrece fine-tuning, entrenamiento desde cero, cuantizacion y despliegue de modelos de pesos abiertos. El objetivo declarado es poner un modelo de 33B parametros sin censura funcional ejecutandose de forma nativa en un Mac con Apple Silicon.

Tecnicamente se trata de un transformer denso con arquitectura LlamaForCausalLM: 33.118.977.024 parametros, 52 capas, hidden size de 7168 y atencion con 56 cabezas y 8 cabezas KV (GQA). Conserva la ventana de contexto de 262.144 tokens del modelo base. La cuantizacion es afina de MLX a 8 bits con group size 64, lo que resulta en aproximadamente 8,5 bits por peso, mientras que los tensores no cuantizados se mantienen en bfloat16. El repositorio ocupa unos 35,2 GB (32,8 GiB en disco segun el autor).

Su relevancia es acotada pero clara: es una de las pocas rutas para ejecutar un modelo de 33B sin censura en memoria unificada de Apple Silicon, con licencia Apache-2.0 y un servidor compatible con la API de OpenAI incluido en mlx-lm. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, es una publicacion muy reciente (1 de noviembre de 2026) y no aporta benchmarks propios, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX affine 8 bits, group size 64 (~8,5 bits por peso); tensores no cuantizados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

Datos adicionales de arquitectura: 52 capas, hidden size 7168, 56 cabezas de atencion y 8 cabezas KV (GQA). Tamano del repositorio: 35,2 GB; tamano en disco indicado por el autor: ~32,8 GiB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con atencion de consultas agrupadas (GQA), con una relacion de 7 cabezas de atencion por cada cabeza KV (56 frente a 8), lo que reduce el coste de memoria de la cache KV durante la generacion. El modelo deriva de Nanbeige4.3-33B y ha pasado por dos transformaciones: primero una ablacion de las direcciones de rechazo (abliteration) que da lugar a Luni/Nanbeige-4.3-33B-Heretic, y despues una cuantizacion afina de 8 bits en MLX realizada por VeriSafe.Live. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

La innovacion tecnica relevante de esta publicacion no esta en el entrenamiento sino en el empaquetado: la cuantizacion afina de MLX con group size 64 permite que un modelo de 33B ocupe unos 32,8 GiB, lo que lo hace viable en equipos Apple Silicon con 64 GB o mas de memoria unificada. La abliteration, por su parte, modifica el comportamiento del modelo eliminando direcciones en el espacio de activaciones asociadas a rechazos, sin reentrenar los pesos de forma convencional. No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Razonamiento y generacion de codigo (el ejemplo de la model card es una busqueda binaria en Python).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o historiales de conversacion largos.
- Comportamiento sin censura: los rechazos se han reducido mediante abliteration, por lo que responde a peticiones que el modelo original declinaria.
- Despliegue como servidor compatible con la API de OpenAI mediante `mlx_lm.server`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y explicar codigo en un Mac con Apple Silicon sin conexion a servicios externos, usando `mlx_lm.generate` o el servidor compatible con OpenAI para integrarlo en un IDE o en un pipeline de CI/CD.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden analizar contratos, informes o bases de codigo completas en una sola pasada, resumir secciones y extraer entidades sin trocear el texto.
- Investigacion sobre seguridad y alineacion: al ser una version abliterated, sirve para estudiar como se comporta un modelo sin mecanismos de rechazo, comparar respuestas frente al modelo original y analizar sesgos y riesgos en entornos controlados.
- Prototipado de chatbots internos: el servidor `mlx_lm.server` expone una API compatible con OpenAI, lo que permite sustituir un endpoint remoto por el modelo local durante el desarrollo sin cambiar el codigo del cliente.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material editorial donde las politicas de rechazo del modelo base resultan un obstaculo, con revision humana posterior obligatoria.
- Analisis de conversaciones y datos sensibles en local: al ejecutarse en el propio equipo, los datos no salen del dispositivo, lo que facilita el cumplimiento de requisitos de privacidad en sectores regulados.
- Traduccion y reescritura de textos largos: el contexto extendido permite mantener coherencia terminologica a lo largo de documentos completos, aunque la calidad multilingue no esta documentada y debe validarse empiricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 32,8 GiB para los pesos en 8 bits, mas la cache KV, que crece con la longitud de contexto y el batch. Para aprovechar contextos largos conviene disponer de 64 GB o mas de memoria unificada.
- Hardware objetivo: Apple Silicon exclusivamente, ya que el formato MLX solo se ejecuta en macOS con chips M-series. No es utilizable en GPU NVIDIA ni AMD sin reconvertir los pesos.
- Equipos recomendados: Mac Studio o MacBook Pro con M2 Max, M2 Ultra, M3 Max o M4 Max con 64 GB o 96 GB de memoria unificada. En equipos de 32 GB no cabe con margen para contexto util.
- Despliegue: `mlx-lm` mediante `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server` (API compatible con OpenAI en el puerto indicado). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del chip, del ancho de banda de memoria y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige-4.3-33B-Heretic-Uncensored-MLX-8bit (este) | 33B | 262.144 | MLX 8 bits | Apache-2.0 | Solo Apple Silicon; sin benchmarks publicados |
| Luni/Nanbeige-4.3-33B-Heretic | 33B | 262.144 | safetensors (bf16) | Apache-2.0 | Modelo base sin cuantizar; requiere mucha mas memoria |
| Nanbeige/Nanbeige4.3-33B | 33B | 262.144 | safetensors | Apache-2.0 | Modelo original con rechazos intactos |
| Alternativas de ~30B en MLX | no disponible | no disponible | MLX | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que no se han proporcionado datos de rendimiento ni de otros modelos comparables de la misma categoria en formato MLX.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o codigo, por lo que cualquier uso en produccion exige una evaluacion propia previa.
- Modelo abliterated: los rechazos se han reducido de forma deliberada, lo que implica riesgo de generar contenido danino, ilegal o inapropiado. Requiere filtros y supervision en cualquier despliegue publico.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o APIs; no hay datos que indiquen mitigaciones especificas.
- Idiomas no documentados: se desconoce la cobertura linguistica real, incluido el castellano, y el modelo base es de origen chino, lo que puede sesgar el rendimiento hacia el chino y el ingles.
- Restricciones de plataforma: el formato MLX solo funciona en Apple Silicon; no es portable a GPU NVIDIA ni a servidores x86 convencionales.
- Licencia Apache-2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las implicaciones de distribuir un modelo sin censura.
- Madurez muy baja: cero descargas y cero likes en el momento de la ficha, publicacion de 2026-11-01 y sin validacion independiente de la cuantizacion.
- La model card incluye promocion comercial de VeriSafe.Live y de servicios de pago; conviene separar esa informacion de los datos tecnicos verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junafinity/Nanbeige-4.3-33B-Heretic-Uncensored-MLX-8bit
- Modelo base (Heretic): https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Sitio del autor: https://verisafe.live
- Contacto del autor: info@verisafe.live
- Libreria de inferencia: https://github.com/ml-explore/mlx-lm
