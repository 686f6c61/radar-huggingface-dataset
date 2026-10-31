# ReStranger/LFM3-1.7B-Claude-Code-Abliterated-GGUF

## Resumen

LFM3 1.7B Claude Code — Abliterated (GGUF) es una versión cuantizada y "abliterada" del modelo LFM3-1.7B de Liquid AI, publicada por el usuario ReStranger en Hugging Face. El modelo base parte del fine-tune `mondk/LFM3-1.7B-Claude-Code-Safetensors`, especializado en generación de código, tool calling y razonamiento paso a paso orientado a harnesses de agentes. Sobre ese modelo se ha aplicado una abliteración mediante eliminación direccional proyectada (rank-1) para suprimir las negativas de seguridad, y posteriormente se han generado cuantizaciones GGUF calibradas con matriz de importancia (imatrix).

Su relevancia reside en combinar tres características poco habituales en un modelo tan compacto: una arquitectura tri-híbrida (convoluciones cortas con puertas, atención por ventana deslizante y atención global), una ventana de contexto de 262.144 tokens (256K) y un tamaño de apenas 1,73 mil millones de parámetros, lo que permite ejecutar agentes de código con contexto muy largo en hardware de consumo. El formato ChatML con etiquetas `<think>` y tool calls en XML lo hace directamente compatible con pipelines agénticos tipo Claude Code.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-híbrida (13 capas de convolución corta con puertas, 5 capas de atención por ventana deslizante, 6 capas de atención global) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE; se asume densidad completa) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K (las variantes K cuantizadas con imatrix / calibración Activation-Directed) |
| Idiomas soportados | en, ru, zh, de, fr, es, it, ja, ko, pt, vi, th, id, hi, pl, ar |
| Licencia | lfm-open-license-v1.0 (otra, heredada de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

La arquitectura LFM3 es un híbrido de tres mecanismos: 13 capas de convoluciones cortas con puertas (gated short convolutions) para captura local de patrones, 5 capas de atención con ventana deslizante y 6 capas de atención global. Esta combinación reduce el coste computacional de la atención manteniendo capacidad de razonamiento global, y es lo que viabiliza el contexto de 256K tokens en un modelo tan pequeño.

El fine-tune base (`mondk/LFM3-1.7B-Claude-Code-Safetensors`) fue post-entrenado para tool calling, generación de código y razonamiento paso a paso con formato agéntico; los detalles del dataset de entrenamiento (número de tokens, composición) no están disponibles. La abliteración se aplicó de forma quirúrgica: eliminación de la dirección de rechazo de rango 1 en las capas 8–23 sobre las 32 matrices de escritura residuales (`attn_output`, `shortconv.out_proj` y `ffn_down`), dejando intactas las capas tempranas (0–7), los embeddings y las capas de normalización para preservar la generación de tool calls XML y la sintaxis del código. Las cuantizaciones K se calibraron con un archivo `imatrix.dat` construido sobre código (Python, Bash, JavaScript), tool calls XML de agentes y textos técnicos bilingües inglés/ruso.

## Capacidades

- Generacion de codigo: fine-tune orientado a Python, Bash y JavaScript (idiomas usados en la calibración de la imatrix).
- Razonamiento paso a paso: salida con bloque de razonamiento explícito en etiquetas `<think>...</think>` antes de la respuesta final.
- Tool calling / function calling: formato nativo XML (`<tool_call>` con funciones y parámetros anidados), pensado para harnesses agénticos tipo Claude Code.
- Agentes y razonamiento multi-paso: el post-entrenamiento está específicamente formateado para bucles agénticos con llamadas a herramientas.
- Contexto muy largo: hasta 262.144 tokens, adecuado para sesiones de código extensas o repositorios completos.
- Multilingüe: 16 idiomas, incluido castellano, aunque la calibración de la imatrix se centró en inglés y ruso.
- Sin negativas de seguridad (uncensored): la abliteración elimina los rechazos, lo que permite operar sin filtros pero conlleva riesgos de uso.

## Casos de uso

- Agentes de codigo locales tipo Claude Code: el formato de tool calling XML y el razonamiento en `<think>` permiten integrarlo en harnesses agénticos que editan ficheros y ejecutan comandos, todo en local.
- Asistentes de terminal y scripting: con solo 1,1 GB en Q4_K_M, cabe en cualquier portátil para generar y depurar scripts de Bash o Python sobre la marcha.
- Analisis de repositorios con contexto largo: la ventana de 256K tokens permite cargar ficheros grandes o múltiples módulos de código en una sola sesión sin RAG.
- Automatizacion de DevOps: puede encadenar llamadas a herramientas (lectura de logs, ejecución de comandos, edición de configuraciones) en pipelines de automatización ligeros.
- Chatbot multilingue autoalojado: soporta castellano y otros 15 idiomas con requisitos de memoria mínimos, útil para despliegues en edge o Raspberry Pi de gama alta.
- Prototipado rapido de agentes: su pequeño tamaño permite iterar rápido en el diseño de bucles agénticos y formatos de tool calling antes de escalar a modelos mayores.
- Generacion de consultas y transformaciones de datos: adecuado para tareas de código cortas y bien definidas donde la latencia importa más que la profundidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según la model card):
  - F16: 3,3 GB
  - Q8_0: 1,8 GB
  - Q6_K: 1,4 GB
  - Q5_K_M: 1,2 GB
  - Q4_K_M: 1,1 GB
  - Q3_K_M: 873 MB
  - Q2_K: 716 MB
  (más memoria adicional para la KV cache con contexto de 256K, que puede ser significativa a contextos largos)
- GPU recomendadas: no disponible; por tamaño, cualquier GPU moderna con 4 GB de VRAM o más es suficiente. También es plenamente viable la ejecución solo en CPU.
- Consumer GPUs: cabe sobradamente en GPUs de gama baja y media (RTX 3060, RTX 4060 o superiores) e incluso en GPUs integradas con memoria compartida. En Q2_K cabe en dispositivos con menos de 1 GB de RAM disponible.
- Opciones de despliegue: llama.cpp (requiere build b11938+ o v0.8.0+, con soporte de la arquitectura LFM3, PR #31252), `llama-cli` y `llama-server` para servir una API OpenAI-compatible. No se menciona compatibilidad con vLLM, TGI u Ollama.
- Muestreo recomendado (Liquid AI): general/chat/tool use/agentes: `--temp 0.1 --top-k 50 --repeat-penalty 1.1`; matemáticas y ciencias: `--temp 1.0 --top-p 0.95 --top-k 20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3 1.7B Claude Code Abliterated (este) | 1,73 B | 256K | GGUF | lfm-open-license-v1.0 (other) | Abliterado, tool calling XML, razonamiento `<think>` |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 256K | safetensors | lfm-open-license-v1.0 | Sin abliterar, con filtros de seguridad originales |
| mondk/LFM3-1.7B-Claude-Code-Safetensors | 1,73 B | 256K | safetensors | no disponible | Fine-tune de código sin cuantizar ni abliterar |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | 128K | safetensors/GGUF | Apache 2.0 / Qwen | Alternativa de código de tamaño similar, contexto menor |

## Limitaciones y advertencias

- Abliteración (uncensored): el modelo no rechaza peticiones dañinas. Es responsabilidad del despliegue implementar salvaguardas propias; su uso con usuarios finales sin filtros adicionales conlleva riesgos legales y éticos.
- Riesgo de alucinacion: al tratarse de un modelo de 1,7B parámetros, la fiabilidad factual y la calidad del código en tareas complejas son limitadas; verificar siempre el código generado antes de ejecutarlo.
- Multilingüe desigual: aunque declara 16 idiomas, la imatrix se calibró con inglés y ruso, por lo que la calidad en castellano, especialmente en tool calls, puede ser inferior a la del inglés.
- Cuantizaciones agresivas: Q3_K_M y Q2_K pueden degradar la coherencia y el formato XML de las tool calls; se recomienda Q4_K_M o superior para uso agéntico.
- Licencia: lfm-open-license-v1.0 es una licencia "other" (no estándar); revisar los términos en el enlace de la licencia antes de cualquier uso comercial.
- Compatibilidad: requiere versiones recientes de llama.cpp (b11938+ / v0.8.0+) con soporte LFM3; versiones anteriores no cargarán el modelo.
- Contexto largo con memoria limitada: la KV cache a 256K tokens puede requerir memoria adicional considerable pese al pequeño tamaño del modelo.
- Datos de benchmarks: no disponibles; no hay evidencia cuantitativa publicada de su rendimiento frente al modelo base o competidores.

## Enlaces

- Modelo: https://huggingface.co/ReStranger/LFM3-1.7B-Claude-Code-Abliterated-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Fine-tune de origen: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-Safetensors
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
