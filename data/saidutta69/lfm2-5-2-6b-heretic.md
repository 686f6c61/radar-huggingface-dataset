# saidutta69/LFM2.5-2.6B-heretic

## Resumen

LFM2.5-2.6B-heretic es una variante "decensurada" (abliterada) del modelo agéntico de borde LFM2.5-2.6B de Liquid AI, publicada por el usuario saidutta69 en HuggingFace. El modelo base es un LLM de 2,69 mil millones de parámetros diseñado para ejecución en dispositivos locales (móviles y portátiles pequeños), con 30 capas compuestas por 22 bloques de convolución corta de doble compuerta y 8 capas de atención GQA, contexto nativo de 131.072 tokens y formato nativo de tool calling.

La modificación se ha realizado con Heretic 2.0.0.dev0 mediante Arbitrary-Rank Ablation (ARA), una técnica que aprende un subespacio de bajo rango sobre las capas 1 a 21 para eliminar las direcciones de rechazo sin dañar el comportamiento general. El resultado es llamativo: las negativas pasan de 96/100 a 8/100 con una divergencia KL de solo 0,0059, lo que sugiere una edición muy quirúrgica con mínimo desvío en estilo, formato de herramientas y comportamiento multilingüe.

Es relevante porque combina tres cosas poco frecuentes en un mismo checkpoint de 2,7B: capacidades agénticas nativas (BFCLv4 56,88, ToolSandbox 77,83), un tamaño apto para inferencia en CPU o GPU de consumo y una abliteración reproducible (el repositorio incluye la receta completa en el directorio `reproduce/`, con semilla, diario de Optuna y sumas SHA-256). No es un modelo de codificación agéntica ni de conocimiento denso: es un modelo de instrucciones local con las negativas retiradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 22 bloques de convolución corta de doble compuerta + 8 capas de atención GQA (30 capas totales) |
| Parametros totales | 2.697.198.592 (2,69B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S/M/L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; safetensors en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | Safetensors (BF16, 2 shards de 2,70 GB) y GGUF (15 ficheros, 28,94 GB en total) |

## Arquitectura y entrenamiento

La arquitectura es la de la familia LFM (Liquid Foundation Models): un híbrido que combina bloques convolucionales cortos con doble compuerta (que actúan como mecanismo de mezcla de tokens con coste casi constante) y capas estándar de atención multi-cabeza agrupada (GQA). Esta mezcla reduce drásticamente el coste de la caché KV —la caché conv usa `L_cache=3`— lo que hace viable el contexto de 131K en dispositivos de borde. Otros detalles técnicos del GGUF: vocabulario de 128.000 tokens con embeddings atados y rope theta de 1e6.

El modelo base fue entrenado por Liquid AI; el número de tokens y la composición del dataset no están disponibles en la información proporcionada. Este checkpoint no añade entrenamiento adicional: Heretic 2.0 con ARA aplica una edición post-hoc sobre las capas 1-21. ARA, a diferencia de la ablación direccional clásica (que ortogonaliza las salidas contra una única dirección de rechazo), aprende un subespacio de bajo rango y optimiza una mezcla de objetivos "preservar buen comportamiento" (peso 0,9588) y "dirigir mal comportamiento" (peso 0,0009), con corrección relativa de 0,0151 y 6 vecinos. Es el ensayo 190 de una ejecución de 250 ensayos de Optuna con semilla 712709786, totalmente reproducible.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat nativo.
- Tool calling / function calling nativo: el modelo base fue entrenado con un formato propio de llamadas a herramientas (BFCLv4 56,88 y ToolSandbox 77,83 en la versión original).
- Comportamiento agéntico en flujos locales: RAG, extracción estructurada (IFStruct 85,49) y ejecución de instrucciones complejas (IFBench 59,17, Multi-IF 80,07).
- Razonamiento matemático razonable para su tamaño: AIME25 51,87.
- Generación y comprensión de código: LiveCodeBench v6 59,41, aunque Liquid no lo recomienda para codificación agéntica.
- Soporte multilingüe amplio: 16 idiomas, incluido el castellano, con edición lo bastante ajustada (KL 0,0059) como para preservar el comportamiento multilingüe original.
- Contexto largo (131K) apto para documentos extensos en local.
- No incluye capacidades de visión ni audio; es un modelo de solo texto.

## Casos de uso

- Agentes locales en portátiles sin GPU dedicada: con la cuantización Q4_K_M (1,67 GB) el modelo cabe en la RAM de cualquier portátil moderno, manteniendo tool calling nativo para orquestar funciones del sistema.
- RAG en dispositivo: la ventana de 131K tokens permite cargar documentos largos (contratos, manuales técnicos) sin troceado agresivo, con la caché conv reduciendo el coste de memoria frente a un transformer puro.
- Extracción estructurada de datos: el alto puntaje en IFStruct (85,49) lo hace adecuado para convertir texto no estructurado (facturas, correos, formularios) en JSON esquematizado en pipelines de privacidad local.
- Asistentes de privacidad en móvil: al ejecutarse íntegramente en el dispositivo, no se envían datos a servidores externos; útil para apps de salud, notas personales o mensajería.
- Automatización de flujos con herramientas: agentes que consultan APIs locales, gestionan ficheros o ejecutan comandos, aprovechando el formato de tool call nativo y el bajo coste por token de una arquitectura híbrida.
- Prototipado de agentes multilingües: soporte de 16 idiomas con buen seguimiento de instrucciones multi-idioma (Multi-IF 80,07) para asistentes que atienden a usuarios en castellano, inglés u otros idiomas.
- Investigación en alineación y abliteración: el directorio `reproduce/` con semilla, configuración y diario de Optuna permite replicar el experimento ARA completo, algo poco habitual en checkpoints de este tipo.

## Benchmarks y rendimiento

Benchmarks publicados por Liquid AI para el modelo base (no re-medidos en este checkpoint; la abliteración no añade capacidad):

| Benchmark | LFM2.5-2.6B (base) |
|---|:---:|
| BFCLv4 | 56,88 |
| ToolSandbox | 77,83 |
| IFBench | 59,17 |
| IFStruct | 85,49 |
| Multi-IF | 80,07 |
| AIME25 | 51,87 |
| LiveCodeBench v6 | 59,41 |
| Claw-Eval average (EN) | 62,85 |
| BrowseComp+ (OpenClaw) | 26,89 |

Resultados de la abliteración (medidos por el autor del checkpoint):

| Metrica | Este modelo | Modelo original |
|---|:---:|:---:|
| Rechazos (refusals) | 8/100 | 96/100 |
| Divergencia KL | 0,0059 | 0 (por definicion) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en BF16 (safetensors), unos 5,4 GB de pesos más overhead de KV cache; con Q4_K_M en GGUF, unos 1,7 GB de pesos, perfectamente viable en CPU con 8 GB de RAM.
- GPU recomendadas: cualquier GPU de consumo con 4-6 GB de VRAM (RTX 3060, RTX 4060) ejecuta el modelo cuantizado con holgura; para BF16 basta una RTX 4090 o similar. No se requieren A100 ni H100.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna incluso sin cuantizar; en CPU es plenamente viable gracias a los bloques convolucionales y la caché conv compacta (`L_cache=3`).
- Opciones de despliegue: llama.cpp (el propio README sugiere `llama serve -hf saidutta69/LFM2.5-2.6B-heretic`), Ollama, LM Studio (vía GGUF) y transformers con `device_map="auto"` para safetensors. La compatibilidad con vLLM o TGI no está confirmada en la información disponible.
- Parámetros de generación recomendados por Liquid: `temperature=0.1`, `top_k=50`, `repetition_penalty=1.1`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM2.5-2.6B-heretic | 2,69B | 131.072 | Hibrida conv + GQA | LFM Open License v1.0 | Agentico en dispositivo, decensurado |
| LiquidAI/LFM2.5-2.6B (base) | 2,69B | 131.072 | Hibrida conv + GQA | LFM Open License v1.0 | Agentico en dispositivo, alineado |
| Qwen3-1.7B | 1,7B | no disponible | Transformer denso | Apache 2.0 | Generalista compacto |
| Gemma 3 1B / 4B | 1B / 4B | 128K | Transformer denso + sliding window | Gemma license | Generalista compacto |

Frente a alternativas de tamaño similar, LFM2.5-2.6B destaca en tool calling y seguimiento de instrucciones estructuradas para su clase, y su arquitectura híbrida reduce el coste de la caché KV. Su licencia (LFM Open License v1.0) es más restrictiva que Apache 2.0. Los valores de parámetros y contexto de los competidores son aproximados; benchmarks comparativos directos no disponibles en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina negativas pero no añade capacidad: los benchmarks publicados corresponden al modelo base y pueden no reflejar exactamente el comportamiento de este checkpoint tras la edición.
- Al retirarse las salvaguardas de rechazo, el modelo puede generar contenido que el modelo original se negaría a producir; su uso conlleva responsabilidad legal y ética para quien lo despliegue.
- No está recomendado por Liquid para codificación agéntica ni para tareas de conocimiento denso a este tamaño; BrowseComp+ (26,89) confirma un rendimiento modesto en navegación/búsqueda compleja.
- Riesgo de alucinación típico de modelos de 2-3B parámetros, especialmente en conocimiento factual; no disponible una medición específica.
- Licencia LFM Open License v1.0: no es una licencia permisiva tipo Apache/MIT; conviene revisar las condiciones de la licencia antes de uso comercial.
- La edición ARA se aplicó sobre las capas 1-21; las capas 22-29 permanecen intactas, por lo que residualmente persisten 8 de los 96 rechazos originales.
- Al ser un checkpoint de terceros (saidutta69) sin respaldo de Liquid AI, no hay garantía de mantenimiento, auditoría de pesos ni actualizaciones.
- El modelo no incluye capacidades multimodales (visión, audio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/LFM2.5-2.6B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Repositorio de Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp (cuantización y despliegue GGUF): https://github.com/ggml-org/llama.cpp
- Checkpoint hermano de codificación agéntica: https://huggingface.co/saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic
