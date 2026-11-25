# cmod/gemma4-rp-maxxed-GGUF

## Resumen

gemma4-rp-maxxed es un derivado de Google Gemma 4 26B-A4B-it orientado exclusivamente a roleplay, publicado por el usuario cmod en formato GGUF. Sobre el modelo base se aplican tres transformaciones: abliteración (eliminación de rechazos) mediante una edición ARA estilo Heretic sobre las capas 11-23, una poda del 25 % de los expertos (de 128 a 96 por capa, manteniendo top-8) guiada por saliencia tipo REAP medida sobre texto de roleplay de RimWorld, y una poda del vocabulario que conserva ASCII, puntuación tipográfica y acentos Latin-1.

El objetivo declarado es servir de motor de diálogo para HermesVoice, un mod que da voz a los colonos de RimWorld. La poda y la cuantización UD-Q3_K_XL de unsloth permiten ejecutar el modelo en una GPU de 16 GB con tres slots de contexto de 64k (196.608 tokens en total) y sin offload de expertos, con una velocidad de decodificación declarada de 148 t/s en una RTX 5080.

Es relevante como ejemplo de cadena de especialización agresiva sobre un MoE grande: abliteración selectiva por capas, poda de expertos y de vocabulario, y cuantización, todo empaquetado en un GGUF de 10 GB. No es un asistente general: el propio autor advierte que la poda degrada el texto general (KLD 1,88 frente al stock) y que solo está pensado para inglés y diálogo en personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gemma4), 30 capas, 96 expertos por capa (podados desde 128), top-8, sliding window de 1024 |
| Parametros totales | 50.767.360 (dato de safetensors del repo; no coherente con un MoE de 26B, probablemente recuento parcial) |
| Parametros activos | 4B (según la nomenclatura A4B del modelo base) |
| Longitud de contexto | Hasta 196.608 tokens en la configuración probada (3 slots × 64k); contexto nativo del base no disponible |
| Tipos de cuantizacion | Q3_K_XL (receta UD-Q3_K_XL de unsloth con su imatrix); tensores editados re-codificados a Q8_0 e IQ4_NL; KV cache q4_0 |
| Idiomas soportados | Inglés únicamente (declarado); texto fuera de ASCII y puntuación común cae a bytes y empeora |
| Licencia | Apache 2.0 (derivado de Gemma 4; sujeto además a los términos de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp, probado en b11279) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Gemma 4 con 30 capas, 128 expertos por capa y top-8, ventana deslizante de 1024 tokens y vocabulario de 158.191 tokens. Sobre esa base, el autor aplica una abliteración capa por capa (capas 11-23) que edita `attn_output`, el `ffn_down` denso y las 128 slices `ffn_down_exps` de expertos, con un término de preservación sobre prompts inocuos y texto de roleplay para limitar la magnitud del cambio (mayor |ΔW|/|W| por matriz: 0,196). Los 36 tensores editados se re-codifican a los tipos del donante (Q8_0, IQ4_NL) usando la imatrix de unsloth.

La poda de expertos retiene, en cada capa, los 96 expertos con mayor saliencia estilo REAP (frecuencia × gate × norma de salida) medida sobre texto de roleplay de RimWorld; se recortan las filas del router, los tensores de experto y las escalas por experto, manteniendo top-8. La poda de vocabulario conserva tokens ASCII, de puntuación tipográfica común y acentos Latin-1, además de todos los tokens de control y especiales; los merges se filtran y los ids de tokens especiales se remapean. El autor verifica que la tokenización de texto ASCII es idéntica al stock (400/400 comprobados, mismo top-1 en 50/50 fragmentos). No se documenta entrenamiento adicional con RLHF/DPO; los cambios son de edición de pesos y poda.

## Capacidades

- Generación de texto y diálogo en personaje para roleplay y ficción interactiva, incluidos temas adultos, violentos y sexuales entre adultos.
- Narración y líneas cortas de diálogo con plantilla de chat de Gemma 4 (thinking desactivado por defecto, recomendado mantenerlo apagado para líneas breves).
- Diferenciación de voces de personaje: 0,944 en el bench M0 de HermesVoice (frente a 0,926 del stock).
- Precisión de intención con gramática: 28/30 en el bench M0.
- Sin rechazos en la sonda de roleplay adulto (0/100) y con rechazos estrictos reducidos en un conjunto genérico de prompts dañinos (2/100, con aproximadamente un tercio que añade un descargo antes de cumplir).
- No soporta de forma fiable preguntas factuales, código ni idiomas distintos del inglés; la poda eliminó expertos usados por texto general.
- Soporte de tool calling, function calling, agentes, visión, audio o modo thinking extendido: no disponible en la información proporcionada (el base es `-it`, pero el derivado no documenta estas capacidades).

## Casos de uso

- Diálogo de colonos en RimWorld mediante el mod HermesVoice: el motor descarga el GGUF, elige contexto y offload según la GPU y arranca/detiene el servidor con el juego; encaja por su VRAM contenida (12.200 MiB con `-np 3 -c 196608` y sin offload de expertos) y su velocidad (148 t/s en RTX 5080).
- Ficción interactiva y aventuras conversacionales: el modelo mantiene varios personajes con voces distintas y contexto largo (hasta 64k por slot), adecuado para sesiones narrativas extensas.
- Generación de narración grimdark o violenta: las pruebas del autor muestran 0 rechazos, 0 descargos y 0 moralizaciones en líneas grim de RimWorld.
- Prototipado de mods de voz para otros juegos: al ser un GGUF estándar de llama.cpp, se puede integrar en pipelines propios con `llama-server` y gramáticas para forzar intenciones.
- Investigación sobre abliteración y poda de MoE: el repo incluye una LoRA de eliminación de rechazos (`gemma-4-26B-A4B-it-abl-lora.gguf`, 101 MB) aplicable sobre el UD-Q3_K_XL stock sin poda, útil para estudiar el efecto aislado de la edición.
- Roleplay local en GPU de consumo: cabe en una tarjeta de 16 GB junto con un juego en ejecución, con la opción `--n-cpu-moe 3` para recuperar unos 0,7 GB de VRAM.

## Benchmarks y rendimiento

| Métrica | Stock UD-Q3_K_XL | Este modelo |
|---|---|---|
| Sonda de roleplay adulto, rechazos | 95/100 | 0/100 |
| Conjunto dañino genérico, rechazos estrictos | 100/100 | 2/100 (un tercio añade descargo) |
| Distinción de voces (HermesVoice M0) | 0,926 | 0,944 |
| Precisión de intención con gramática (M0) | 27/30 | 28/30 |
| Líneas grim de RimWorld: rechazo / descargo / moralina | 0 / 0 / 0 | 0 / 0 / 0 |
| VRAM, `-np 3 -c 196608`, KV q4_0 | 13.110 MiB con `--n-cpu-moe 6` | 12.200 MiB con `--n-cpu-moe 0` |
| Velocidad de decodificación (RTX 5080) | 77 t/s | 148 t/s |
| KLD de texto vs stock: roleplay / RimWorld / general | 0 | 0,68 / 0,96 / 1,88 |

El autor advierte que la KLD tiene cola pesada en esta arquitectura (llama.cpp da 0,26 entre dos ejecuciones equivalentes del stock con distinto `-ub`), por lo que esa fila debe leerse como ranking. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12.200 MiB con `-np 3 -c 196608` y KV en q4_0, sin offload de expertos (`--n-cpu-moe 0`).
- GPU recomendadas: tarjeta de 16 GB para la configuración completa; el autor cita una RTX 5080 para las mediciones de velocidad.
- Cabe en GPU de consumo de 16 GB (por ejemplo, RTX 4080/5080 o similares); con `--n-cpu-moe 3` se liberan unos 0,7 GB de VRAM para convivir con un juego.
- Despliegue: llama.cpp (probado en b11279) mediante `llama-server`; otros runtimes GGUF que sigan el soporte de gemma4 de llama.cpp deberían funcionar, ya que los recuentos podados de expertos y vocabulario son metadatos ordinarios.
- Comando de referencia: `llama-server -m gemma4-rp-maxxed-Q3_K_XL.gguf -ngl 999 -np 3 -c 196608 -ctk q4_0 -ctv q4_0 -fa on --jinja`.
- Latencia y throughput: 148 t/s de decodificación en RTX 5080 (frente a 77 t/s del stock en la misma configuración).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma4-rp-maxxed (este) | MoE 26B totales / 4B activos, 96 expertos | Hasta 196.608 tokens en 3 slots | Apache 2.0 | GGUF Q3_K_XL | Abliterado y podado para roleplay; 148 t/s en RTX 5080 |
| google/gemma-4-26B-A4B-it (stock) | MoE 26B / 4B activos, 128 expertos | No disponible | Apache 2.0 / términos Gemma 4 | Safetensors, GGUF (UD-Q3_K_XL de unsloth) | Asistente general con rechazos; 95/100 rechazos en sonda adulta; 77 t/s en la misma prueba |
| gemma-4-26B-A4B-it-abl-lora (incluida en el repo) | Igual que el stock | Igual que el stock | Apache 2.0 | GGUF (LoRA de 101 MB) | Solo eliminación de rechazos sobre UD-Q3_K_XL, sin poda; útil como referencia aislada de la abliteración |

No se dispone de datos de otros derivados de roleplay comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente general: la poda de expertos degrada el texto general (KLD 1,88 frente al stock) y elimina capacidades factuales y de código.
- Solo inglés; el texto fuera de ASCII y puntuación común cae a bytes y empeora la calidad.
- Modelo desensurado: genera contenido violento y sexual entre adultos; no apto para menores y prohibido cualquier contenido sexual con menores.
- Riesgo de alucinación alto fuera del dominio de roleplay; no debe usarse para preguntas factuales.
- El autor declara que los corpus de calibración y pruebas no contienen contenido sexual con menores, animales, no consentimiento ni incesto, pero la responsabilidad de uso recae en el usuario según la ley aplicable y los términos de Gemma.
- Licencia Apache 2.0 con la salvedad de que es un derivado de Gemma 4 sujeto a los términos de Google; no está hecho ni respaldado por Google.
- La KLD reportada tiene cola pesada en esta arquitectura, por lo que las comparaciones de fidelidad deben interpretarse como ranking.
- El recuento de parámetros del repo (50.767.360) no es coherente con un MoE de 26B; conviene verificar metadatos antes de planificar despliegues.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que implica poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/cmod/gemma4-rp-maxxed-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio del mod HermesVoice: https://github.com/CharlesMod/rimworld-hermes
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
