# LuffyTheFox/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF

## Resumen
Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF es una cuantización GGUF publicada por el usuario LuffyTheFox sobre el modelo base ornith-ai/Ornith-1.5-35B-A3B, a su vez derivado de la familia Tiel-Coder y de un ajuste fino orientado a agentes Hermes. El modelo combina una arquitectura Mixture-of-Experts (MoE) de 34.660.610.688 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, 256 expertos y 8 expertos enrutados más 1 compartido, lo que permite un coste de inferencia cercano al de un modelo de 3B pese a la capacidad de uno de 35B.

El interés principal no está en el entrenamiento, sino en el post-procesado: el autor aplica un procedimiento propio llamado Genesis, que describe como una reparación numérica de tensores en formato GGUF (detección de bloques nulos, desajustes de escala, deriva de media y ruido de entrenamiento mediante SVD y la distribución de Marchenko-Pastur) sin reentrenar. Además, transfiere datos de un ajuste fino sobre el dataset NousResearch/hermes-function-calling-v1 al modelo base para reforzar capacidades de agentic coding y function calling.

El resultado es un modelo multimodal imagen-texto con licencia MIT, etiquetado como token-efficient y orientado a tareas de agente y código, publicado con cuantizaciones GGUF para llama.cpp. Es relevante ahora porque ofrece una vía de despliegue local de un MoE de 35B con contexto largo, visión y tool calling, aunque con un respaldo técnico poco convencional que conviene evaluar con cautela antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (etiqueta qwen35moe; detalles de capas híbridas no disponibles) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3B por token (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | No disponible de forma explícita; el autor recomienda mantener al menos 128K |
| Tipos de cuantizacion | GGUF (imatrix, perfiles unsloth-dynamic); se recomienda NVFP4 y APEX |
| Idiomas soportados | en, zh, multilingual |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Pipeline | image-text-to-text (visión con fichero mmproj) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B (cuantizado) |
| Dataset de ajuste | NousResearch/hermes-function-calling-v1 |
| Tamano del repo | 80,6 GB |
| Descargas / likes | 7.549 / 29 |

## Arquitectura y entrenamiento
La arquitectura es un transformer con mezcla de expertos: 256 expertos en total, de los cuales 8 enrutados y 1 compartido se activan por token, lo que da unos 3B parámetros activos sobre 34,66B totales. La etiqueta qwen35moe sugiere una base de la familia Qwen 3.5 MoE, y la model card menciona una arquitectura híbrida con componentes tipo SSM (el procedimiento Genesis escanea tensores ssm_conv1d, asociados a memoria de contexto largo). No se detallan el número de capas, la dimensión oculta ni la composición exacta del corpus de preentrenamiento.

El autor no entrena ni ajusta el modelo: parte de peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF y transfiere bloques de dos tensores de expertos FFN (alrededor de 2.000 bloques) procedentes de DJLougen/hermes-qwen3.5-35b-a3b-GGUF, un ajuste fino sobre hermes-function-calling-v1. Después aplica Genesis, que según la model card opera en tres fases: reequilibrio de cabezas en tensores ssm_conv1d, sustitución de bloques nulos por fragmentos que mejor encajan en la distribución de pesos y reducción de ruido mediante SVD guiado por la ley de Marchenko-Pastur, preservando supuestamente el 99% de la señal. No se documentan RLHF, DPO ni cifras de tokens de entrenamiento.

## Capacidades
- Generación de texto y razonamiento con modo thinking y modo no thinking, con parámetros de muestreo diferenciados para cada uno.
- Programación y agentic coding: el modelo está etiquetado explícitamente como agentic-coding y token-efficient.
- Tool calling y function calling, reforzados por el ajuste sobre hermes-function-calling-v1.
- Uso como agente Hermes con plantilla de chat propia (requiere `--jinja` en llama.cpp).
- Capacidades de visión (image-text-to-text) mediante el fichero mmproj acompañante.
- Multilingüe, con soporte declarado de inglés, chino y otros idiomas.
- Contexto largo, con recomendación de mantener al menos 128K tokens para preservar el modo thinking.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.

## Casos de uso
- Asistente de código en local: con ~3B parámetros activos y cuantización NVFP4 o APEX, puede ejecutarse en estaciones de trabajo con una sola GPU consumer y usarse para autocompletado, refactorización y explicación de código sin enviar el código a la nube.
- Agente autónomo con tool calling: integrado en un bucle de agente Hermes, el modelo puede encadenar llamadas a funciones (lectura de ficheros, ejecución de tests, consultas a API) gracias al ajuste específico sobre hermes-function-calling-v1.
- Análisis de capturas e interfaces: al soportar image-text-to-text con mmproj, sirve para describir pantallas, extraer texto de imágenes o validar resultados visuales en pipelines de QA.
- Procesamiento de repositorios completos: con contexto de 128K o superior, permite resumir, auditar o responder preguntas sobre varios ficheros a la vez, útil en revisiones de código y documentación técnica.
- Automatización de soporte técnico multi-turno: el contexto largo y el soporte multilingüe (en, zh) lo hacen adecuado para conversaciones prolongadas con historial extenso, aunque la cobertura de español no está declarada.
- Despliegue en entornos con requisitos de soberanía de datos: la licencia MIT y el formato GGUF permiten ejecución totalmente offline en llama.cpp u Ollama, algo relevante para sectores regulados.
- Prototipado de agentes de investigación: su bajo coste por token activo permite iterar rápido en experimentos de razonamiento multi-paso sin incurrir en costes de API.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño, una cuantización de 4 bits de un modelo de 34,66B ocupa del orden de 18-20 GB, y una de 8 bits en torno a 35 GB; el repo completo pesa 80,6 GB e incluye varias cuantizaciones.
- El autor recomienda forzar 40 capas de pesos MoE en CPU, caché K y V en F16, offload máximo a GPU y 8 expertos activos para la cuantización APEX.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones de 4 bits con offload parcial de expertos a CPU; para 8 bits o F16 se necesitarían A100/H100 o configuraciones multi-GPU.
- Despliegue: llama.cpp (con `--jinja`), Ollama y cualquier runtime compatible con GGUF. Para servir como API, el tag endpoints_compatible sugiere compatibilidad con endpoints estilo OpenAI.
- Latencia y throughput: no disponibles. Al activar solo ~3B parámetros por token, el coste de cómputo es bajo, pero el ancho de banda de memoria para cargar expertos desde CPU puede dominar la latencia si no caben en VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B-Genesis-Hermes | 34,66B | ~3B | ≥128K recomendado | MIT | GGUF | Post-procesado Genesis, visión, Hermes |
| ornith-ai/Ornith-1.5-35B-A3B | 35B (aprox.) | ~3B | No disponible | No disponible | No disponible | Modelo base declarado |
| peculiar-ragdoll/Tiel-Coder-35B-A3B | 35B (aprox.) | ~3B | No disponible | No disponible | GGUF | Base directa del modelo |
| DJLougen/hermes-qwen3.5-35b-a3b | 35B (aprox.) | ~3B | No disponible | No disponible | GGUF | Origen del ajuste Hermes transferido |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- El procedimiento Genesis no está respaldado por una publicación revisada por pares ni por evaluaciones públicas; las afirmaciones sobre reducción de ruido y preservación del 99% de la señal deben tratarse como no verificadas.
- La transferencia de bloques de expertos entre modelos distintos (de un ajuste Hermes a una base Tiel-Coder) es una técnica no estándar que puede introducir comportamientos impredecibles no documentados.
- No hay benchmarks publicados, por lo que no es posible comparar su calidad con alternativas establecidas.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo thinking puede aumentar la verbosidad si no se ajustan los parámetros de muestreo recomendados.
- Idiomas declarados: inglés y chino principalmente; el soporte de español no está garantizado y puede degradarse.
- La licencia MIT permite uso comercial, pero el modelo base y los finetunes intermedios podrían tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la cadena completa de licencias.
- La visión requiere descargar y configurar el fichero mmproj junto al GGUF principal.
- El autor incluye direcciones de donación y contactos personales en la model card; no constituyen garantía de soporte técnico.
- El repositorio ocupa 80,6 GB, lo que exige planificación de almacenamiento antes de la descarga.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LuffyTheFox/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF
- Modelo base declarado: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Base directa: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Modelo original citado: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantización: https://pastebin.com/hXhcMJn9
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko-Pastur (referencia): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
