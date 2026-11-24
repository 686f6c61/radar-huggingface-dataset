# JRamirez-UAB/Inkling-2-Mini-EXL3

## Resumen

Inkling-2-Mini-EXL3 es una cuantización comunitaria no oficial del modelo thinkingmachines/Inkling-2-Mini, un modelo de lenguaje y visión de tipo mezcla de expertos (MoE) desarrollado por Thinking Machines. El modelo base cuenta con 26.400 millones de parámetros totales y 3.400 millones de parámetros activos por token, con 24 capas, 128 expertos enrutados (8 activos) y un patrón de transformer con bucles en el que las capas 6 a 17 se ejecutan tres veces por token. Esta versión EXL3 reduce el peso a 12,3 GB mediante cuantización de 3,00 bits por peso en los expertos enrutados, 5 bits en la atención y 6 bits en el `lm_head`, manteniendo en BF16 la torre de visión, los embeddings y la cabeza MTP DSpark.

El objetivo declarado por el autor es habilitar la inferencia del modelo completo, con su ventana de contexto de 262.144 tokens y capacidades de visión, en una única GPU de consumo de 24 GB como la RTX 3090. Para ello se combina la cuantización EXL3 con una caché KV `k8v4_per_token_head` (claves int8, valores int4) y decodificación especulativa DSpark. El modelo está orientado a un caso de uso concreto: un agente local de administración de sistemas Linux en español, integrado con opencode y con soporte de tool calling.

La relevancia de esta ficha radica en que documenta una ruta de despliegue muy específica y frágil: requiere una versión concreta de vLLM nightly, el motor exllamav3 y un plugin propio (`vllm-quantpack`). No es una release oficial de Thinking Machines y está marcada explícitamente como experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucles (looped-transformer), 24 capas, 128 expertos enrutados con 8 activos; capas 6-17 ejecutadas 3 veces por token |
| Parámetros totales | 5.814.367.360 (según safetensors del repo); 26.4B según la model card del modelo base |
| Parámetros activos | 3.4B (según model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | EXL3 3.00 bpw en expertos enrutados, 5 bits en atención, 6 bits en `lm_head`; torre de visión, embeddings y cabeza MTP en BF16 |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (EXL3, requiere exllamav3 + vllm-quantpack) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con una innovación estructural: las capas centrales (6 a 17) se ejecutan tres veces por token, lo que incrementa la profundidad efectiva de cómputo sin aumentar el número de parámetros. Incluye una torre de visión que lo convierte en un modelo image-text-to-text, y una cabeza de decodificación especulativa DSpark MTP (multi-token prediction). Esta cuantización parte de una dequantización exacta en BF16 de la release NVFP4 del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo original en la información proporcionada. La model card de esta cuantización se centra en el proceso de cuantización y en las trazas de calibración, que incluyen conversaciones reales de administración de sistemas y agentes en español, y en la evaluación mediante divergencia KL frente al modelo BF16 (0,0147 en la traza de opencode y 0,0156 en la traza pública de turboderp).

## Capacidades

- Generación de texto y razonamiento: el modelo siempre razona; el parámetro `reasoning_effort` (0.0-0.99) controla la extensión del razonamiento, y se recomienda permitir al menos 4.000 tokens de salida.
- Comprensión de imágenes (image-text-to-text) mediante torre de visión en BF16.
- Tool calling / function calling, validado con la petición real de opencode (58/60 y 56/60 en dos ejecuciones).
- Ejecución de tareas de agente multi-paso con comandos reales (26/30 en tareas de agente).
- Contexto largo: recuperación de agujas en 64k, 128k y 241k (8/8 en cada caso) y 8 sesiones concurrentes de 30k (8/8).
- Capacidades multilingües limitadas a español e inglés.
- Decodificación especulativa DSpark MTP para acelerar la generación.
- Caché KV `k8v4_per_token_head` con claves int8 y valores int4.

## Casos de uso

- Agente local de administración de sistemas Linux: el modelo puede gestionar sesiones de opencode con tool calling para ejecutar comandos, diagnosticar servicios y automatizar tareas de mantenimiento en un departamento de TI universitario, gracias a su contexto de 262.144 tokens y a su entrenamiento de calibración en español.
- Asistencia técnica en español con contexto largo: permite mantener conversaciones multi-turno con documentación extensa o logs completos dentro de la ventana de contexto, sin truncar información.
- Análisis de capturas de pantalla y diagramas de infraestructura: la torre de visión permite interpretar imágenes de terminales, paneles de monitorización o diagramas de red junto con texto.
- Automatización de pipelines de CI/CD con tool calling: el modelo puede invocar herramientas y encadenar pasos de razonamiento para tareas de despliegue o verificación, integrándose mediante la API compatible con endpoints de vLLM.
- Recuperación de información en corpus largos: los resultados de needle (8/8 en 64k, 128k y 241k) lo hacen adecuado para búsqueda y extracción de hechos en documentos extensos.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 24 GB con contexto completo, permite prototipar agentes de razonamiento y visión en hardware asequible sin depender de la nube.
- Evaluación de cuantizaciones en producción: sirve como banco de pruebas para medir la divergencia KL y el impacto de la cuantización EXL3 frente al modelo BF16 en flujos reales de agente.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Divergencia KL vs BF16 (traza opencode) | 0,0147 |
| Divergencia KL vs BF16 (traza pública turboderp) | 0,0156 |
| Tool calls con petición real de opencode | 58/60 y 56/60 (dos ejecuciones) |
| Tareas de agente | 26/30 (9, 8, 9) |
| Razonamiento (`xhigh`) | 48/48 |
| Visión | 15/15 |
| Needle 64k / 128k / 241k | 8/8 en cada uno |
| 8 sesiones de 30k concurrentes | 8/8 |
| Bucles (temperatura 1.0) | 0/30 |
| Decode 1/2/4/8 peticiones (DSpark 7) | 83,7 / 101,0 / 128,0 / 138,3 tok/s |
| Decode 1/2/4/8 peticiones (sin especulativa) | 82,4 / 111,7 / 170,1 / 265,3 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,3 GB de pesos en EXL3 3.00 bpw; con caché KV `k8v4_per_token_head` (pool de 369.890 tokens, 1,41 × 262.144) y DSpark 7, quedan 777 MiB libres en el pico en una RTX 3090 de 24 GB.
- GPU recomendadas: RTX 3090 (24 GB, Ampere) es el objetivo principal y el único entorno de 24 GB probado; también se probó el arranque rápido en una A40.
- No cabe en GPUs de 16 GB con ninguna configuración (12,3 GB de pesos en esta versión, 10,7 GB en la variante `2.5bpw`).
- Despliegue: exclusivamente mediante vLLM nightly `0.34.0rc1.dev1136+gcb19fedd8` + exllamav3 1.6.7 + plugin `vllm-quantpack` 0.1.10 o superior. Un `pip install vllm` genérico, Transformers o SGLang no pueden cargar el modelo.
- Latencia y throughput: 83,7 tok/s con 1 petición y 138,3 tok/s con 8 peticiones usando DSpark 7; sin decodificación especulativa, 82,4 tok/s con 1 petición y 265,3 tok/s con 8.
- Los kernels CUDA de vLLM nightly para Inkling 2 están orientados a Hopper y posteriores; el plugin añade rutas Ampere para 18 módulos, solo en la versión exacta indicada (verifica el SHA-256 de cada fichero).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3 (esta ficha) | 26.4B totales / 3.4B activos | 262.144 | Apache-2.0 | Comunitaria, no oficial | Cuantización EXL3 para 24 GB; requiere vLLM nightly concreto |
| thinkingmachines/Inkling-2-Mini (base) | 26.4B totales / 3.4B activos | 262.144 | Apache-2.0 | Oficial | Pesos BF16/NVFP4; no cabe en 24 GB |
| Variantes del mismo repo (`2.5bpw`, otras ramas) | 26.4B totales / 3.4B activos | 262.144 | Apache-2.0 | Comunitaria | Menor tamaño (10,7 GB en `2.5bpw`), con limitaciones medidas por rama |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo marcado como EXPERIMENTAL: depende de una versión exacta de vLLM nightly; cualquier otra compilación no funcionará hasta que se actualice el plugin.
- No es una release oficial de Thinking Machines; es una cuantización comunitaria.
- La cuantización introduce una divergencia KL de aproximadamente 0,015 frente al modelo BF16, que puede afectar a tareas fuera del dominio de calibración (administración de sistemas en español).
- El modelo siempre razona: `enable_thinking: false` no tiene efecto; incluso con `reasoning_effort` a 0 razona brevemente, y se recomienda reservar al menos 4.000 tokens de salida.
- Idiomas limitados a español e inglés; el rendimiento en otros idiomas no está evaluado.
- Los números de calidad proceden de un conjunto de pruebas propio del autor (razonamiento, visión, agente, contexto largo) y no de benchmarks estándar; pueden no ser reproducibles en otros dominios.
- El uso comercial está permitido por la licencia Apache-2.0, pero la fragilidad del stack de despliegue (versión fija de vLLM, plugin externo, kernels limitados a Ampere y Hopper) supone un riesgo operativo en producción.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- La configuración de generación recomendada es temperatura 1.0, top_p 0.95 y top_k 20, definida en el `generation_config.json` del repo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JRamirez-UAB/Inkling-2-Mini-EXL3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paper de referencia citado en los tags: arxiv:2406.11235
- Repositorio de exllamav3: no disponible
- Plugin vllm-quantpack: no disponible (referenciado en la model card como 0.1.10 o superior)
- Documentación de vLLM nightly: no disponible
