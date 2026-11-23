# OVHaiLLM/Olala-v1.0-mini-7A1B-GGUF

## Resumen
Olala-v1.0-mini-7A1B-GGUF es la versión cuantizada en formato GGUF del modelo Olala-v1.0-mini-7A1B, desarrollado por OVHaiLLM (OVHcloud). Se trata de un modelo de generación de texto con arquitectura híbrida Mamba-MoE, diseñado para razonamiento y tool calling, y distribuido bajo licencia Apache 2.0. El repositorio GGUF está pensado para inferencia local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp.

El modelo base cuenta con 6.775.272.608 parámetros totales (aproximadamente 6,8 mil millones) y soporta 37 idiomas, entre ellos el español, el catalán y el euskera. La versión GGUF ofrece cuantizaciones desde BF16 hasta 5 bits, con la particularidad de que los archivos de 8, 6 y 5 bits mantienen una calidad dentro del ruido estadístico respecto a BF16 en código y matemáticas, según el autor.

Su relevancia actual radica en que demuestra que un modelo híbrido Mamba-MoE puede ejecutarse en un portátil con 16 GB de RAM unificada generando unos 70 tokens por segundo, manteniendo razonamiento con cuatro niveles de esfuerzo y tool calling a través de un servidor compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba + MoE (según tags del autor) |
| Parametros totales | 6.775.272.608 (≈6,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (16-bit), q8_0-safe2 (8-bit), Q6_K (6-bit), Q5_K_M (5-bit) |
| Idiomas soportados | 37: en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 32,8 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura híbrida que combina capas Mamba (modelos de espacio de estados) con mezcla de expertos (MoE), según los tags declarados por el autor. Esta combinación busca reducir el coste computacional de la atención tradicional manteniendo capacidad de razonamiento. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable del despliegue GGUF es el soporte de razonamiento con cuatro niveles de esfuerzo configurables y tool calling, servidos mediante un endpoint compatible con OpenAI. Los archivos de 8, 6 y 5 bits han sido validados por el autor para mantener la calidad del BF16 en tareas de código y matemáticas, lo que reduce el coste de memoria sin degradación medible.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento con cuatro niveles de esfuerzo configurables (thinking mode por niveles).
- Tool calling / function calling mediante servidor compatible con OpenAI.
- Capacidades multilingües en 37 idiomas, incluidos español, catalán y euskera.
- Orientado a tareas de código y matemáticas (validado en las cuantizaciones según el autor).
- Inferencia local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp.

## Casos de uso
- Asistente conversacional local en portátil: con el archivo Q6_K (6,3 GB) se ejecuta en un MacBook con 16 GB de RAM unificada a unos 70 tokens/s, adecuado para asistentes personales sin conexión.
- Automatización de agentes con tool calling: el endpoint compatible con OpenAI permite integrar el modelo en frameworks de agentes que invocan funciones externas (APIs, bases de datos) en flujos multi-paso.
- Generación de código en estaciones de trabajo sin GPU dedicada: el archivo q8_0-safe2 (6,9 GB) corre en CPU x86 y mantiene calidad de BF16 en código según el autor.
- Atención al cliente multilingüe: los 37 idiomas soportados permiten desplegar un único modelo para conversaciones en español, catalán, euskera y otros idiomas europeos y asiáticos.
- Procesamiento de documentos con razonamiento graduado: los cuatro niveles de esfuerzo permiten ajustar el coste computacional según la complejidad de la tarea (consultas simples con esfuerzo bajo, análisis con esfuerzo alto).
- Prototipado en Apple Silicon: el archivo BF16 (13,6 GB) cabe en Macs con 24 GB o más, útil para desarrollo y evaluación antes de pasar a cuantizaciones menores en producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor afirma que los archivos de 8, 6 y 5 bits puntúan dentro del ruido estadístico respecto a BF16 en código y matemáticas, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware
- BF16 (13,6 GB): GPU NVIDIA o Mac con 24 GB o más de memoria unificada.
- q8_0-safe2 (6,9 GB): CPU x86 o Mac con 16 GB.
- Q6_K (6,3 GB): CPU x86 o Mac con 16 GB; es el archivo cuantizado más rápido en Metal según el autor.
- Q5_K_M (5 bits): no se detalla el tamaño en la información disponible; orientado a equipos con menos memoria.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-16 GB de VRAM según la cuantización (no se especifican modelos concretos como RTX 4090).
- Despliegue: requiere un fork específico de llama.cpp del autor (https://github.com/OVHai-LLM/llama.cpp); upstream llama.cpp, Ollama, LM Studio y otras aplicaciones no soportan aún la arquitectura `olala`.
- Throughput estimado: unos 70 tokens/s en un MacBook Air M5 con 16 GB usando el archivo de 6 bits.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (híbridos Mamba-MoE de ~7B) con datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- Los archivos GGUF no cargan en llama.cpp upstream, Ollama ni LM Studio; es obligatorio compilar el fork del autor.
- No se han publicado benchmarks formales; la afirmación de "sin pérdida de calidad" en cuantizaciones es del autor y no está verificada de forma independiente.
- Riesgo de alucinación inherente a los modelos de generación de texto; no se documentan tasas ni mitigaciones.
- No se dispone de información sobre sesgos conocidos, longitud de contexto máxima ni composición del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork no estándar de llama.cpp añade coste de mantenimiento en producción.
- El soporte de 37 idiomas está declarado, pero no se aportan métricas de calidad por idioma; el rendimiento en idiomas minoritarios (p. ej. euskera o georgiano) es desconocido.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-GGUF
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Fork de llama.cpp: https://github.com/OVHai-LLM/llama.cpp
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Catálogo AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-mini-7a1b/
- Playground: https://olala.ovh.com
