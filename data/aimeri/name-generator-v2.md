# aimeri/name-generator-v2

## Resumen

Name Generator v2 es un ajuste fino (fine-tune) del modelo Ministral 3 de 3.400 millones de parámetros, desarrollado por el usuario aimeri y publicado bajo licencia Apache 2.0. Su propósito es muy concreto: recibir una petición descriptiva (por ejemplo, "un nombre brasileño de hombre" o "un nombre sombrío para un herrero enano") y devolver un único nombre, real o inventado, sin texto adicional. Resuelve un problema conocido de los modelos generativos generalistas: la tendencia a repetir un puñado de nombres manidos en contextos creativos.

El modelo se distribuye en formato safetensors para la librería transformers (requiere la versión 5.x por la arquitectura `Ministral3ForCausalLM`) y cuenta con cuantizaciones GGUF publicadas en un repositorio aparte (Q8_0, Q6_K, Q5_K_M y Q4_K_M) para llama.cpp, LM Studio y entornos similares. Está entrenado exclusivamente en inglés y su ventana de contexto no se documenta en la información disponible.

La relevancia de esta versión radica en la ampliación de cobertura: además de nombres reales de distintas tradiciones culturales, incorpora nombres de fantasía para razas y criaturas (elfos, enanos, orcos, dragones, demonios, entre otras) y permite modular el tono (sombrío, gentil, noble, antiguo) y el rol del personaje. Es una herramienta de nicho, orientada a escritores, jugadores de rol y desarrolladores que necesiten generación de nombres controlada y sin ruido conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral3ForCausalLM) |
| Parametros totales | 3.429.006.336 (3,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de `aimeri/Ministral-3-3B-Base-2512-chatml`, un ajuste del Ministral 3 de 3B con plantilla ChatML, y se entrena mediante fine-tune supervisado (la model card etiqueta el proyecto con `unsloth`, herramienta habitual para este tipo de ajustes). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El dataset de entrenamiento es `aimeri/name-generator`, y la model card indica que los nombres de fantasía inventados no coinciden con nombres reales, nombres ficticios famosos ni con los nombres que los modelos de lenguaje tienden a sobreutilizar. La innovación principal no es arquitectónica sino de formato y datos: el modelo está especializado en producir una respuesta de un solo nombre (el ejemplo de uso fija `max_new_tokens` en 24) y termina el turno con el token `<|im_end|>`. La model card advierte de dos detalles críticos de tokenización: hay que renderizar la plantilla y luego tokenizar (el tokenizador añade `<s>` al codificar el texto renderizado, algo que `apply_chat_template(..., tokenize=True)` omite) y el contenido del mensaje debe pasarse como cadena simple, no como lista de partes.

## Capacidades

- Generación de nombres reales por nacionalidad, país, estado histórico o región (por ejemplo, "nigeriano", "de Perú", "dinastía Song", "África Occidental").
- Ajuste por sexo y época ("una mujer nacida en los años 50").
- Respeto de convenciones locales: apellido primero en chino, japonés, coreano, húngaro y vietnamita; patronímicos en nombres completos rusos y ucranianos; dos apellidos en nombres completos españoles y portugueses.
- Generación de nombres de fantasía para elfos, elfos oscuros, enanos, medianos, gnomos, orcos, goblins, gigantes, dragones, hadas, demonios, gentes del mar, hombres lagarto, entidades eldritch y vampiros.
- Nombres de fantasía para culturas humanas inspiradas en 20 tradiciones onomásticas reales ("un marinero de un reino inspirado en la cultura nórdica", "un hechicero de inspiración persa").
- Modulación por tono: palabras como grim, gentle, whimsical, noble o ancient alteran la sonoridad del nombre.
- Modulación por rol: herrero, reina, asesino y similares orientan la petición como en la escritura narrativa.
- Formato de respuesta de un solo nombre, sin explicaciones ni texto conversacional.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- **Escritura de ficción y worldbuilding:** un novelista pide nombres para personajes de un reino inspirado en una cultura concreta ("nombre de inspiración persa para un hechicero") y obtiene candidatos coherentes con esa tradición sin caer en los nombres repetidos por los modelos generalistas.
- **Preparación de partidas de rol (D&D y similares):** el director de juego genera sobre la marcha nombres para PNJ de distintas razas y roles ("nombre para un tabernero mediano", "nombre de un señor de la guerra orco") con una sola llamada y respuesta corta.
- **Generación masiva de nombres para videojuegos:** al devolver un único nombre por petición y admitir `num_return_sequences`, se puede integrar en un pipeline que genere lotes de nombres para PNJ, ciudades o ítems, filtrando duplicados y manteniendo coherencia cultural.
- **Herramientas de escritura integradas:** un editor o plugin puede enviar la descripción del personaje como mensaje de usuario y mostrar varias muestras (temperatura 0,8 en los ejemplos de la model card) para que el autor elija.
- **Localización y doblaje:** para asignar nombres verosímiles a personajes secundarios de una obra traducida, el modelo permite fijar nacionalidad, sexo y época y respeta convenciones onomásticas locales (orden de apellidos, patronímicos).
- **Prototipado rápido con OpenAI-compatible:** al poder servirse en llama.cpp, vLLM o LM Studio, se puede exponer como endpoint compatible con la API de OpenAI y consumirlo desde scripts o aplicaciones existentes con `max_tokens` en torno a 24.
- **Generación de datos sintéticos para otros fine-tunes:** sirve para producir listas de nombres etiquetados por cultura, raza o tono que alimenten posteriores ajustes o sistemas de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en bfloat16:** aproximadamente 6,9 GB solo para los pesos (el repositorio ocupa 6,9 GB), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB según longitud de contexto y lote.
- **Cuantizaciones GGUF:** Q8_0 en torno a 3,6 GB, Q6_K en torno a 2,8 GB, Q5_K_M en torno a 2,4 GB y Q4_K_M en torno a 2,1 GB (estimaciones a partir del número de parámetros; no confirmadas en la información disponible).
- **GPU recomendadas:** cualquier GPU con 8 GB o más para bfloat16 (RTX 3060 Ti/4060 Ti de 8 GB con margen justo, RTX 4070/4080, RTX 4090, A100, H100). Con cuantización Q4_K_M o Q5_K_M cabe en GPUs de 4-6 GB y en CPU.
- **Consumer GPU:** sí, cabe en tarjetas de consumo; las cuantizaciones Q4_K_M y Q5_K_M permiten ejecución incluso en equipos modestos o en CPU mediante llama.cpp.
- **Opciones de despliegue:** transformers 5.x (arquitectura `Ministral3ForCausalLM`), llama.cpp, LM Studio, vLLM y cualquier servidor compatible con la API de OpenAI.
- **Latencia y throughput:** no disponibles en la información proporcionada; al generar un máximo de 24 tokens por respuesta, la latencia por petición será baja en cualquier backend razonable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aimeri/name-generator-v2 | 3,4 B | no disponible | Nombres reales y de fantasía, respuesta de un solo nombre | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| aimeri/name-generator (v1) | no disponible | no disponible | Nombres reales únicamente | no disponible | HuggingFace |
| Ministral 3 3B (base) | 3 B (aproximado) | no disponible | Modelo generalista | no disponible | HuggingFace |
| Modelos generalistas tipo Llama o Qwen de 3-4 B | 3-4 B | variable | Generación general; propensos a repetir nombres manidos | variable | HuggingFace |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este modelo ni datos de evaluación frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Solo inglés:** el modelo está entrenado y etiquetado únicamente para inglés; las peticiones en castellano u otros idiomas no están garantizadas y pueden degradar la calidad o el formato de respuesta.
- **Riesgo de alucinación onomástica:** aunque los nombres de fantasía se entrenaron para no coincidir con nombres reales o famosos, no hay garantía de que todas las combinaciones generadas sean inéditas; conviene revisar antes de usar nombres en obras publicadas.
- **Formato frágil:** el modelo espera ChatML con `<s>` añadido por el tokenizador tras renderizar la plantilla y contenido como cadena simple; un uso incorrecto de `apply_chat_template` produce respuestas degradadas. Requiere transformers 5.x.
- **Contexto no documentado:** se desconoce la longitud máxima de contexto; las peticiones deben ser breves y descriptivas, no conversaciones largas.
- **Sesgos:** al entrenarse sobre tradiciones onomásticas reales, puede reproducir convenciones de género y culturales estereotipadas; la información disponible no detalla análisis de sesgo.
- **Licencia Apache 2.0:** permite uso comercial, pero el modelo base y el dataset subyacentes pueden tener sus propias condiciones; conviene verificar la licencia de `aimeri/Ministral-3-3B-Base-2512-chatml` antes de desplegar en producción.
- **Adopción muy baja:** 47 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa del rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aimeri/name-generator-v2
- Cuantizaciones GGUF: https://huggingface.co/aimeri/name-generator-v2-GGUF
- Versión anterior (v1): https://huggingface.co/aimeri/name-generator
- Modelo base: https://huggingface.co/aimeri/Ministral-3-3B-Base-2512-chatml
- Dataset de entrenamiento: https://huggingface.co/datasets/aimeri/name-generator
