# Digilidaahz/Freedream-1B-Instruct-V2

## Resumen

Freedream-1B-Instruct-V2 es un modelo de lenguaje de aproximadamente 977 millones de parámetros entrenado íntegramente desde cero por un desarrollador independiente (Digilidaahz). No se trata de un ajuste fino de Llama o Qwen, sino de una arquitectura GPT propia construida desde la base, con SwiGLU, RoPE y embeddings con pesos compartidos. El modelo parte de un base model preentrenado sobre 24.100 millones de tokens de FineWeb-Edu y se ajusta posteriormente por instrucciones con 220.000 muestras curadas.

El interés principal del modelo no reside en su rendimiento absoluto, sino en su proceso de construcción: todo el ciclo de preentrenamiento y ajuste se ejecutó en una única GPU de consumo (NVIDIA RTX 5080 de 16 GB) junto con 64 GB de DDR5, empleando precisión mixta FP8, AdamW8bit y un DataPrefetcher asíncrono propio para evitar cuellos de botella de E/S. Es, por tanto, un caso de estudio de eficiencia computacional extrema más que un modelo competitivo frente a alternativas establecidas.

La versión V2 (Preview) corrige un problema del tokenizador que trataba `{` como token desconocido, ampliando el vocabulario de 32.000 a 32.001 entradas. Existe además una variante (LADSDR) ajustada con un algoritmo propio (LAPSDR) que, según el autor, mantiene la capacidad de generalización respecto al ajuste con AdamW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT propio, no derivado de Llama/Qwen) |
| Parametros totales | 977.300.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica cuantizaciones; el repo pesa 7,9 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | no disponible (el repo ocupa 7,9 GB; no se detalla safetensors/GGUF) |

Detalles adicionales de arquitectura: 24 capas, dimensión oculta 1792, 16 cabezas de atención, SwiGLU, RoPE y weight-tied embeddings. Vocabulario de 32.001 tokens.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención estándar, sin mecanismos de atención lineal ni arquitecturas híbridas SSM. Incorpora SwiGLU en las capas feed-forward, RoPE para la codificación posicional y comparte los pesos entre la capa de embedding de entrada y la de salida (weight tying). El preentrenamiento se realizó sobre 24.100 millones de tokens del dataset FineWeb-Edu, una cantidad que supone aproximadamente el 0,1 % de los 15 billones de tokens usados por Llama-3.2-1B, según el propio autor.

El ajuste por instrucciones (SFT) se hizo sobre 220.000 muestras que combinan SmolTalk (Magpie, Everyday Chats), OpenHermes (código y lógica), Ember (escritura creativa) y un dataset propio de anclaje de identidad. No se aplicó RLHF ni DPO: el modelo carece de alineamiento de seguridad. Entre las innovaciones de ingeniería documentadas destacan el intercambio en caliente del tokenizador (expansión de vocabulario heredando pesos de embedding y reiniciando el estado del optimizador), la purificación del dataset SFT mediante expresiones regulares para eliminar contaminación de identidad, un DataPrefetcher asíncrono con lecturas aleatorias en bloques de 16 MB y doble buffering, y un throughput sostenido de más de 20.300 tokens/s durante el SFT con FP8, cross-entropy por chunks y AdamW8bit.

## Capacidades

- Generación de texto en inglés con contexto de 4096 tokens.
- Conversación multi-turno básica (chat instruct).
- Formateo de código correcto a nivel sintáctico, aunque la lógica subyacente puede ser incorrecta.
- Aritmética básica, con riesgo de bucles en razonamiento abstracto zero-shot.
- Escritura creativa de formato corto (el SFT incluye datos de Ember).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni multi-step reasoning fiables.
- Sin capacidades de visión, audio ni modo "thinking".
- Multilingüe limitado al inglés; no se documentan otros idiomas.

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: el modelo sirve como referencia reproducible de un pipeline completo (tokenizador, preentrenamiento, SFT, evaluación con lm-evaluation-harness) ejecutado en hardware de consumo.
- Experimentación con tokenizadores y vocabularios pequeños: su vocabulario de 32.001 tokens permite estudiar el impacto del tamaño del vocabulario en la perplejidad frente a vocabularios de 128K como el de Llama.
- Generación de texto creativo corto en inglés: adecuado para prototipos de escritura de párrafos o respuestas conversacionales breves dentro de los 4096 tokens de contexto.
- Base para ajuste fino propio: al ser un modelo pequeño y con pesos accesibles, puede servir de punto de partida para experimentos de SFT o LoRA en una sola GPU de consumo.
- Evaluación de técnicas de eficiencia (FP8, AdamW8bit, prefetch asíncrono): el model card documenta el pipeline, lo que permite replicar y comparar estrategias de optimización.
- Docencia sobre limitaciones de los SLM: útil para demostrar empíricamente alucinación matemática, deriva en textos largos y ausencia de alineamiento de seguridad en modelos pequeños sin RLHF.

## Benchmarks y rendimiento

Evaluación con `lm-evaluation-harness` en configuración 0-shot, sobre una RTX 5080.

| Benchmark | Metrica | V1 | V1.1 | V2 (Preview) | Llama-3.2-1B (referencia) |
|---|---|---|---|---|---|
| ARC-Challenge | acc_norm | 29,69 % | 30,46 % | 30,63 % | ~59,4 % |
| HellaSwag | acc_norm | 45,82 % | 45,68 % | 45,93 % | ~59,0 % |
| PIQA | acc | 68,38 % | 68,55 % | 67,95 % | ~74,0 % |
| WinoGrande | acc | 52,64 % | 53,27 % | 53,67 % | ~59,0 % |
| Wikitext-2 | word_ppl | ~26,45 | 26,31 | 25,94 | ~11,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 977 M parámetros; en FP16 requiere aproximadamente 2 GB de pesos, y en FP32 unos 4 GB. No se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para FP16; el autor lo entrenó en una RTX 5080 de 16 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, RTX 5080, entre otras.
- Opciones de despliegue: el tag del repo incluye `text-generation-inference`; no se documentan soportes explícitos de vLLM, llama.cpp u Ollama, y al ser una arquitectura personalizada la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no se publican cifras de inferencia. El autor sí reporta más de 20.300 tokens/s durante el SFT en la RTX 5080.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Freedream-1B-Instruct-V2 | 977 M | 4096 | 30,63 % | 45,93 % | creativeml-openrail-m | Hugging Face |
| Llama-3.2-1B | ~1,2 B | 128K | ~59,4 % | ~59,0 % | Llama 3.2 Community License | Hugging Face (Meta) |
| Qwen2.5-1.5B | ~1,5 B | 32K | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Hugging Face (Alibaba) |

Los datos de Llama-3.2-1B son los que cita el propio autor como referencia. Para Qwen2.5-1.5B no se dispone de resultados en la información proporcionada.

## Limitaciones y advertencias

- Alucinación matemática: puede entrar en bucles con prompts aritméticos abstractos en zero-shot; no debe usarse como calculadora.
- Generación de código: el preentrenamiento con FineWeb-Edu no incluyó datos de código, por lo que la lógica generada puede ser incorrecta aunque el formato sea válido.
- Coherencia en textos largos: como modelo de 1B, la generación extensa (por ejemplo, sonetos o relatos largos) puede derivar en lógica o romper restricciones de formato.
- Sin alineamiento de seguridad: no ha pasado por RLHF ni por filtros de seguridad; puede producir contenido sesgado, ofensivo o inapropiado ante prompts maliciosos.
- Idiomas: solo inglés documentado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto limitado a 4096 tokens, muy por debajo de los 128K de Llama-3.2-1B.
- Licencia creativeml-openrail-m: conviene revisar sus condiciones antes de cualquier uso comercial, ya que incluye restricciones específicas sobre el contenido generado y su redistribución.
- Modelo experimental: el propio autor lo declara para investigación y educación, no para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Digilidaahz/Freedream-1B-Instruct-V2
- Modelo base: https://huggingface.co/Digilidaahz/Freedream_1B_BaseModel
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
