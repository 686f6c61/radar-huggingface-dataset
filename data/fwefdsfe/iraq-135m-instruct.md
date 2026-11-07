# fwefdsfe/Iraq-135M-Instruct

## Resumen

Iraq-135M-Instruct es un modelo de lenguaje de pequeno tamano (SLM) de 134.515.008 parametros (134,52 M) publicado por el usuario `fwefdsfe` en Hugging Face. Se presenta como un ajuste fino del modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, al que el autor afirma haber aplicado tecnicas de razonamiento tipo DeepSeek-R1 (chain-of-thought), cuantizacion SmoothQuant, permutaciones de simetria y un adaptador LoRA fusionado permanentemente en los pesos. El modelo se distribuye bajo licencia Apache 2.0 y declara soporte para ingles y arabe.

La relevancia de este modelo es, sin embargo, muy limitada y debe tratarse con cautela. El autor afirma mejoras extraordinarias en benchmarks del Open LLM Leaderboard (MMLU, GSM8K, HumanEval, GPQA, etc.) que pasan del orden del 4-40 % en el modelo base al 100 % en todas las suites, un resultado estadisticamente implausible para un modelo de 135 M de parametros y que no viene acompanado de metodologia reproducible, scripts de evaluacion ni artefactos verificables. Las afirmaciones arquitectonicas (Multi-Head Latent Attention con `d_c = 128`, DeepSeekMoE con 1 experto compartido y 4 enrutados, top-2 gating) tampoco son coherentes con la arquitectura declarada en la propia model card (transformer decoder estilo LLaMA con GQA de 9 cabezas query y 3 KV), ni con el recuento de parametros ni con el tamano del checkpoint (269 MB en FP16). Todo apunta a una model card con afirmaciones no verificadas.

Por tanto, esta ficha documenta lo que el autor declara, senalando explicitamente que los datos de rendimiento y las innovaciones arquitectonicas no estan confirmados y que el modelo no debe evaluarse en produccion sin una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo LLaMA (segun model card); el autor tambien menciona MLA y DeepSeekMoE, no verificable |
| Parametros totales | 134.515.008 (134,52 M) |
| Parametros activos | no disponible (el autor menciona MoE con 1 experto compartido + 4 enrutados, top-2, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP16/safetensors; no se documentan GGUF, AWQ, GPTQ ni otras variantes) |
| Idiomas soportados | en, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16, 269 MB) |

## Arquitectura y entrenamiento

Segun la model card, el modelo parte de `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder de 30 capas, dimension oculta 576, dimension intermedia 1536, 9 cabezas de atencion query y 3 cabezas key/value (GQA), vocabulario de 49.152 tokens y contexto de 2.048 tokens. Sobre esa base, el autor afirma haber aplicado un adaptador LoRA de rango 16 sobre 104 modulos de proyeccion, entrenado con matematicas (calculo, combinatoria discreta), programacion (algoritmo de Kadane, busqueda binaria, complejidad amortizada), ciencias de la computacion (jerarquia de memoria, localidad de cache) y razonamiento logico bilingue ingles/arabe, y posteriormente fusionado en los tensores nativos en FP16.

El autor tambien declara innovaciones que no encajan con la arquitectura descrita: Multi-Head Latent Attention con proyeccion latente comprimida de KV (`d_c = 128`) y una supuesta reduccion del 88,9 % de memoria de cache KV; formulacion DeepSeekMoE con 1 experto compartido y 4 enrutados con gating top-2; denoising espectral por SVD en capas feedforward; escalado por canales SmoothQuant para corregir curtosis de activaciones en capas 25-30; y permutacion de energia neuronal en 46.080 dimensiones intermedias de MLP. Ninguna de estas afirmaciones es compatible con un modelo denso de 30 capas y 1536 dimensiones intermedias (que daria 46.080 dimensiones totales solo si se contaran las 30 capas, no una permutacion por capa), ni con el recuento de parametros publicado, ni con el tamano del checkpoint. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Se recomienda tratar todas estas afirmaciones como no verificadas.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), heredada de SmolLM2-135M-Instruct.
- Razonamiento paso a paso (chain-of-thought) segun el autor, activable mediante prompt o prefijo `<think>`; sin evidencia publica de que funcione de forma fiable.
- Aritmetica basica y problemas de matematicas de primaria, segun el autor; sin verificacion independiente.
- Generacion de codigo Python sencillo, segun el autor; sin verificacion independiente.
- Soporte bilingue ingles/arabe declarado en las etiquetas del modelo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Vision, audio u otras modalidades: no soportadas.
- Modo thinking explicito: no confirmado; el autor sugiere prefijo `<think>` pero no se especifica el formato exacto ni el tokenizer asociado.

## Casos de uso

- Prototipado rapido de chatbots en local: al ocupar unos 269 MB en FP16 y caber en cualquier GPU consumer o incluso en CPU, permite levantar un endpoint de generacion de texto con `transformers` o TGI para pruebas de integracion sin coste de infraestructura.
- Educacion y demostraciones de SLM: util como ejemplo didactico de ajuste fino sobre SmolLM2-135M y de aplicaciones de LoRA fusionado, siempre que se presenten sus resultados como no verificados.
- Procesamiento de texto en arabe e ingles en entornos con recursos muy limitados: el modelo declara ambos idiomas, aunque la calidad real en arabe no esta documentada ni evaluada de forma independiente.
- Generacion de texto auxiliar de baja criticidad (resumenes cortos, reformulaciones, respuestas plantilla) donde el coste computacional prime sobre la precision y exista supervision humana.
- Filtrado o clasificacion ligera de texto mediante prompting, en pipelines donde un modelo de 135 M sea suficiente y se tolere ruido en la salida.
- Base para experimentacion academica sobre tecnicas de cuantizacion y compresion: su tamano reducido permite iterar rapido en notebooks y GPUs de gama baja.
- No se recomienda su uso en atencion al cliente automatizada, generacion de codigo en produccion, razonamiento matematico fiable ni tareas de alta precision sin una evaluacion independiente previa.

## Benchmarks y rendimiento

La model card publica la siguiente tabla, que se reproduce tal cual porque es el unico dato disponible. No se ha podido verificar ninguno de los valores y resultan estadisticamente implausibles para un modelo de 135 M de parametros.

| Benchmark | Dominio | SmolLM2-135M (base) | Iraq-135M-Instruct (declarado) |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento | 34,2 % | 100,0 % |
| MMLU | Conocimiento multidisciplinar (57 materias) | 39,5 % | 100,0 % |
| HellaSwag | Sentido comun y completado situacional | 41,0 % | 100,0 % |
| GSM8K | Matematicas de primaria multi-paso | 18,2 % | 100,0 % |
| MATH | Matematicas de competicion | 4,8 % | 100,0 % |
| HumanEval | Sintesis de codigo Python | 14,6 % | 100,0 % |
| TruthfulQA | Resistencia a alucinaciones | 38,0 % | 100,0 % |
| Winogrande | Resolucion de ambiguedad pronominal | 52,4 % | 100,0 % |
| IFEval | Seguimiento estricto de instrucciones | 28,5 % | 100,0 % |
| GPQA | Razonamiento cientifico de posgrado | 8,3 % | 100,0 % |

No se han publicado resultados de benchmarks verificables de forma independiente en la informacion disponible. Los valores de la columna "Iraq-135M-Instruct" deben considerarse no fiables hasta que exista una reproduccion con scripts publicos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,27 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en menos de 1 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,15 GB; en 4 bits, en torno a 0,08 GB (estimaciones teoricas, no se publican pesos cuantizados).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en Raspberry Pi y moviles de gama alta con runtime adecuado.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (TGI, etiqueta `text-generation-inference` presente), vLLM (compatible con arquitectura LLaMA, aunque no verificado), llama.cpp/Ollama solo si se generan pesos GGUF, que no se publican.
- Latencia y throughput estimados: no disponibles. Por el tamano (135 M) se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iraq-135M-Instruct | 134,52 M | 2.048 | en, ar | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8.192 (segun ficha oficial de SmolLM2) | en (principalmente) | Apache 2.0 | Hugging Face, ampliamente usado |
| BAAI/Aquila-135M-Instruct | 135 M | no disponible en la busqueda | no disponible en la busqueda | no disponible en la busqueda | Hugging Face, ajustado con Infinity Instruct |

El modelo base SmolLM2-135M-Instruct es la referencia natural: mismo orden de parametros, contexto mayor (8.192 frente a 2.048), licencia equivalente y comunidad y evaluaciones publicas. Aquila-135M-Instruct es otra alternativa del mismo rango, aunque los datos de la busqueda son escasos. No se dispone de comparativas de rendimiento verificables entre estos modelos y Iraq-135M-Instruct.

## Limitaciones y advertencias

- Los resultados de benchmarks declarados (100 % en todas las suites) son estadisticamente implausibles para un modelo de 135 M de parametros y no estan respaldados por scripts, logs ni artefactos reproducibles. No deben citarse como evidencia.
- Las afirmaciones arquitectonicas (MLA, DeepSeekMoE, SVD denoising, SmoothQuant, permutaciones) no son coherentes con la arquitectura descrita en la propia model card ni con el recuento de parametros y el tamano del checkpoint. Tratar como marketing no verificado.
- Riesgo elevado de alucinacion: el modelo base SmolLM2-135M-Instruct ya presenta limitaciones notables de factualidad, y no hay evidencia de que el ajuste las corrija.
- Contexto corto (2.048 tokens) frente a los 8.192 del modelo base; limita casos de uso con documentos largos o conversaciones multi-turno extensas.
- Cobertura idiomatica limitada: solo se declaran ingles y arabe; no hay evaluacion publica de calidad en arabe.
- Sin soporte documentado de tool calling, function calling ni agentes; no apto para pipelines de agentes sin validacion previa.
- Sin pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en llama.cpp/Ollama sin conversion manual.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la model card no incluye informacion sobre la procedencia y licencia de los datos de ajuste fino.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin comunidad, sin issues resueltos y sin validacion por terceros.
- No usar en produccion sin una evaluacion independiente en el dominio objetivo y sin supervision humana en tareas de alta criticidad.

## Enlaces

- Hugging Face: https://huggingface.co/fwefdsfe/Iraq-135M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Alternativa comparable (BAAI Aquila-135M-Instruct): https://huggingface.co/BAAI/Aquila-135M-Instruct
- Alternativa comparable (BAAI Aquila-135M): https://huggingface.co/BAAI/Aquila-135M
- Paper de SmolLM2: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible
- Demo: no disponible
