# Apexintelligence-AI/Apex-35B-V1.0-GGUF

## Resumen

Apex-35B-V1.0-GGUF es el repositorio de cuantizaciones GGUF de Apex-35B-V1.0, un modelo de generación de texto desarrollado por Apex Intelligence sobre la base Qwen3.6-35B-A3B. Se trata de un modelo sparse mixture-of-experts (MoE) de 35B parámetros totales con solo 3B activados por token, lo que ofrece una velocidad de inferencia propia de modelos mucho más pequeños manteniendo la capacidad de un modelo de 35B. El contexto alcanza los 262.144 tokens, compartidos entre entrada y salida, e incorpora un modo de thinking dinámico en el que el propio modelo decide en cada turno si razona y durante cuánto tiempo.

Este repositorio concreto está orientado a runtimes que consumen GGUF: llama.cpp, Unsloth y otros runtimes compatibles. Incluye cuantizaciones desde BF16 (71,1 GB en dos ficheros divididos) hasta IQ1_S (9,0 GB), la mayoría generadas con importance matrix (imatrix) siguiendo el método de bartowski. Cada cuantización integra la capa MTP (multi-token prediction), la plantilla de chat embebida y soporte de tool calling convertido a `tool_calls` estándar.

Su relevancia radica en la combinación de arquitectura híbrida (Gated DeltaNet + Gated Attention), MoE con 256 expertos enrutados, contexto muy largo y licencia Apache 2.0, lo que lo hace apto para despliegues comerciales y ejecución local en hardware de consumo con cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse mixture-of-experts, hibrida Gated DeltaNet + Gated Attention (3 DeltaNet + 1 Attention por cada 4 capas), 40 capas |
| Parametros totales | 35.505.251.456 (35B) |
| Parametros activos | 3B (8 expertos enrutados de 256 + 1 experto compartido activados por token) |
| Longitud de contexto | 262.144 tokens (compartidos entre entrada y salida) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K_L, Q6_K_S, Q6_K, Q5_K_S, Q5_K_M, Q4_K_L, IQ4_NL, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_XS, MXFP4_MOE, IQ3_M, Q3_K_L, IQ3_S, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE dispersa con 256 expertos enrutados más 1 experto compartido, activando 8 expertos enrutados por token, lo que reduce los parámetros activos a 3B por pasada. La pila de 40 capas es híbrida: por cada bloque de 4 capas, 3 usan Gated DeltaNet (una variante de atención lineal basada en recurrencia delta con gating, eficiente en memoria y longitud de secuencia) y 1 usa Gated Attention estándar. Esta combinación permite manejar contextos de 262.144 tokens con coste subcuadratico en las capas DeltaNet.

Incluye una capa MTP (multi-token prediction) para decodificacion especulativa, presente en todas las cuantizaciones, y un modo de thinking dinámico: el modelo decide en cada turno si activa el razonamiento y con qué presupuesto. Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada; el modelo se construye sobre Qwen3.6-35B-A3B de Qwen.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento con thinking dinámico: el modelo decide por turno si piensa y cuánto; el razonamiento se expone en `reasoning_content` en llama-server.
- Tool calling nativo: llama-server convierte las llamadas a herramientas al formato estándar `tool_calls` de la API OpenAI.
- Contexto largo: hasta 262.144 tokens de entrada y salida combinados.
- Decodificacion acelerada mediante capa MTP (multi-token prediction) incluida en todas las cuantizaciones.
- Eficiencia de inferencia gracias a MoE (3B activos) y capas de atención lineal Gated DeltaNet.
- Plantilla de chat embebida en cada fichero GGUF (el prompt de generación termina con `<think>`).
- Herramientas del lado del servidor en Unsloth, como búsqueda web y ejecución de código (mencionado en el README).
- Capacidades multilingues: no disponible.

## Casos de uso

- Chatbots y asistentes conversacionales locales: con 3B de parámetros activos, la latencia por token es baja incluso en hardware modesto, y el thinking dinámico permite respuestas rápidas en preguntas simples y razonamiento profundo en las complejas.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten analizar contratos, informes o bases de código completos en una sola pasada; las capas Gated DeltaNet reducen el coste de memoria con secuencias largas.
- Agentes con tool calling: la conversión a `tool_calls` estándar permite integrarlo directamente en frameworks de agentes (LangChain, LlamaIndex, clientes OpenAI) para orquestación multi-paso con APIs externas.
- Ejecución en GPU de consumo: la cuantización Q4_K_M (21,7 GB) cabe en una RTX 3090/4090 de 24 GB, e IQ1_S (9,0 GB) cabe en GPUs de 12 GB, habilitando uso local privado sin coste de API.
- Servidores OpenAI-compatibles para equipos: llama-server o Unsloth exponen un endpoint compatible con la API de OpenAI, ideal para servir a varios desarrolladores desde una sola máquina.
- Razonamiento con presupuesto controlado: el parámetro `-c` y el manejo del historial de thinking (`--no-reasoning-preserve`) permiten ajustar el equilibrio entre calidad de razonamiento y memoria disponible.
- Búsqueda web y ejecución de código vía Unsloth Studio: el servidor de Unsloth incorpora herramientas del lado del servidor útiles para prototipado de agentes con acceso a información actualizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README remite a la model card del modelo base (Apex-35B-V1.0) para resultados de evaluación, pero dichos datos no constan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - IQ1_S: 9,0 GB; IQ1_M: 9,9 GB; IQ2_XXS: 11,3 GB; IQ2_M: 13,7 GB; Q2_K: 14,3 GB.
  - IQ3_XXS: 16,1 GB; Q3_K_M: 17,8 GB; IQ3_M: 19,4 GB.
  - Q4_0/IQ4_XS/MXFP4_MOE: ~20,3-20,4 GB; Q4_K_M: 21,7 GB; Q4_1: 22,4 GB; IQ4_NL: 22,8 GB; Q4_K_L: 24,6 GB.
  - Q5_K_M: 25,3 GB; Q6_K: 29,2 GB; Q8_0: 37,8 GB; BF16: 71,1 GB.
  - Añadir VRAM para la KV cache según `-c`; con `-c 32768` el presupuesto de thinking puede quedar limitado (el ejemplo del modelo base usa hasta 65.536 tokens de thinking).
- GPUs recomendadas:
  - 24 GB: RTX 3090/4090 con Q4_K_M o cuantizaciones inferiores (descarga parcial de capas a CPU si es necesario).
  - 48 GB: RTX A6000, RTX 6000 Ada, o 2x RTX 4090 para Q6_K/Q8_0.
  - 80 GB: A100/H100 para BF16 o Q8_0 con contexto amplio.
- Consumer GPUs: sí; desde IQ1_S (9 GB) en GPUs de 12 GB hasta Q4_K_M (21,7 GB) en GPUs de 24 GB.
- Despliegue: llama.cpp (llama-server con `--jinja`, recomendado en el README), Unsloth (unsloth run / Unsloth Studio), y según la model card base también SGLang, vLLM, TokenSpeed, KTransformers y Transformers (para el modelo sin cuantizar).
- Parámetros de muestreo recomendados: `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0`.
- Latencia y throughput estimados: no disponibles; al activar solo 3B de parámetros se espera un throughput alto, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Apex-35B-V1.0 | 35B | 3B | 262.144 | Apache 2.0 | Sí (29 cuantizaciones, imatrix) |
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | no disponible | no disponible |
| Qwen3-30B-A3B | 30B | 3B | 32.768 (128K con YaRN) | Apache 2.0 | Sí |
| Llama 4 Scout (17B activos, 109B totales) | 109B | 17B | 10M | Llama 4 Community License | Sí |

Nota: la comparativa se basa en datos públicos conocidos de los modelos alternativos; para Apex-35B-V1.0 solo se usan los datos de su model card. No hay benchmarks que permitan comparar rendimiento medido.

## Limitaciones y advertencias

- No se publican benchmarks en este repositorio: la calidad real debe verificarse contra la model card del modelo base o mediante evaluación propia antes de producción.
- El contexto de 262.144 tokens es compartido entre entrada y salida; con `-c 32768` el thinking puede cortarse antes del presupuesto de 65.536 tokens usado en los ejemplos del modelo base.
- Las cuantizaciones IQ1/IQ2 (9-14 GB) conllevan degradación notable de calidad habitual en niveles tan agresivos; usarlas solo si la VRAM lo exige.
- La mayoría de cuantizaciones usan imatrix con datos de calibración de bartowski; la calidad puede variar según el dominio de uso respecto a los datos de calibración.
- Idiomas soportados: no disponible; al derivar de Qwen3.6 se asume buen soporte de chino e inglés, pero no está documentado en este repositorio.
- Sesgos conocidos, riesgo de alucinación y uso de RLHF/DPO: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también los términos del modelo base Qwen3.6-35B-A3B.
- `--jinja` es obligatorio en llama-server para aplicar la plantilla de chat embebida; sin ella el comportamiento del modelo será incorrecto.
- En BF16, la plantilla de chat y la capa MTP están repartidas entre los dos ficheros divididos; pasar siempre el primero a llama.cpp.
- En Unsloth, la cuenta de administrador de Unsloth Studio se crea con contraseña bootstrap en `~/.unsloth/studio/auth/.bootstrap_password`; cambiarla en despliegues multiusuario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0-GGUF
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Licencia: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/LICENSE
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizaciones de bartowski: https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de compilación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Unsloth: https://unsloth.ai
