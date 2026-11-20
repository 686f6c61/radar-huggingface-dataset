# Lumorux/lumorux-1.0-awq

## Resumen

Lumorux 1.0-AWQ es la versión cuantizada a 4 bits del modelo Lumorux 1.0, un modelo de lenguaje orientado a generación de código, desarrollo web y creación de contenido 3D (Blender y Three.js). Lo desarrolla el proyecto Lumorux y se distribuye bajo licencia Apache 2.0. La cuantización emplea AWQ (Activation-aware Weight Quantization) con group_size=128, lo que reduce el tamaño de los pesos de 15,2 GB en BF16 a aproximadamente 4,1 GB en safetensors.

El modelo cuenta con 7.615.616.512 parámetros totales y se construye sobre la arquitectura Qwen2 (según los tags del repositorio), por lo que hereda el formato de chat y las convenciones de tokenización de dicha familia. Su propuesta de valor es el despliegue en hardware modesto: el autor indica un mínimo de 6 GB de VRAM para inferencia, con un consumo sostenido de 35-55 W, lo que lo sitúa en el segmento de GPUs de portátil y equipos de gama media.

Es relevante ahora porque ofrece una alternativa ligera y de licencia permisiva para tareas de asistencia en código y scripting 3D, un nicho con pocas opciones específicas. No obstante, el repositorio no incluye datos sobre el proceso de entrenamiento, la longitud de contexto ni resultados de benchmarks verificables, lo que limita la evaluación rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tags) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor menciona "4K context" como referencia de VRAM) |
| Tipos de cuantizacion | AWQ 4-bit, group_size=128 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ cuantizado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 7,6 mil millones de parámetros, alineado con la arquitectura Qwen2 según los tags del repositorio. La versión publicada es una cuantización AWQ de 4 bits con group_size=128, que aplica cuantización consciente de las activaciones para preservar la calidad. El autor afirma una pérdida de calidad inferior al 3 % respecto a BF16 en HumanEval, MBPP y evaluaciones propias de código, aunque no se aportan los resultados numéricos que respalden esa afirmación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El modelo base es lumorux/Lumorux-1.0, del que tampoco se detallan datos de entrenamiento en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat (`apply_chat_template`) y roles de sistema, usuario y asistente.
- Generación de código, con énfasis declarado en desarrollo web (HTML, JavaScript, Three.js).
- Generación de scripts para Blender y modelado 3D procedural.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistencia en scripting de Blender: el modelo puede generar scripts en Python que creen geometría procedural (por ejemplo, un bosque low-poly con colocación aleatoria de árboles), un caso de uso citado explícitamente en la model card y adecuado por su especialización declarada en este dominio.
- Desarrollo front-end con Three.js: generación de escenas 3D interactivas para web, aprovechando el soporte declarado de la librería y su naturaleza de modelo orientado a código.
- Autocompletado y generación de código en editores: con un tamaño de 4,1 GB en 4 bits, puede desplegarse en estaciones de trabajo con GPUs de 8 GB y servir peticiones de generación de código con latencia aceptable (35-50 tokens/s en RTX 4060).
- Prototipado en portátiles con GPU de gama media: su requisito mínimo de 6 GB de VRAM y consumo de 35 W permiten ejecutarlo localmente en un portátil, útil para desarrollo sin conexión o con requisitos de privacidad.
- Despliegue en entornos de borde o bajo consumo: el consumo sostenido de 35-55 W y la cuantización 4-bit lo hacen apto para dispositivos con restricciones energéticas, aunque las cifras provienen del autor y no están verificadas de forma independiente.
- Generación de documentación técnica y explicaciones de código: el modelo puede emplearse para resumir o comentar fragmentos de código en inglés dentro de pipelines de documentación automatizada.
- Integración vía Hugging Face Text Generation Inference: el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue como endpoint HTTP gestionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una pérdida de calidad inferior al 3 % frente a BF16 en HumanEval, MBPP y evaluaciones propias de código, pero no proporciona las puntuaciones absolutas ni la comparación con otros modelos. Las cifras de rendimiento declaradas son:

| Métrica | Valor declarado por el autor |
|---|---|
| Throughput en RTX 5090 | ~85-110 tokens/s |
| Throughput en RTX 4060 | ~35-50 tokens/s |
| Consumo sostenido en portátil | ~35 W |
| Consumo sostenido en sobremesa | ~55 W |
| Delta de calidad vs BF16 | < 3 % (HumanEval / MBPP / evals propios) |

## Requisitos de hardware

- VRAM mínima para inferencia: 6 GB (RTX 3060, RTX 4060, Mac M1 con 8 GB unificados).
- VRAM recomendada: 12 GB (RTX 4070 o superior) para contexto de 4K.
- GPUs validadas por el autor: RTX 3050 (8 GB, con `max_new_tokens ≤ 2048`), RTX 4060 (8 GB), RTX 4070 (12 GB), RTX 5090 (32 GB), AMD RX 7800 XT (16 GB, vía ROCm/DirectML), Apple M1/M2 (8-16 GB unificados, vía MLX o llama.cpp GGUF).
- Intel Arc A770 (16 GB): soporte experimental vía IPEX.
- Cabe en GPUs de consumo: sí, desde una RTX 3050 de 8 GB, con limitación de longitud de generación en los modelos de 8 GB.
- Opciones de despliegue: `transformers` + `autoawq`, Text Generation Inference (etiqueta del repo), llama.cpp / GGUF y MLX (mencionados por el autor para Apple Silicon).
- Latencia y throughput: 85-110 tokens/s en RTX 5090 y 35-50 tokens/s en RTX 4060, según el autor; no hay mediciones independientes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks verificables de Lumorux 1.0-AWQ, por lo que la comparación se limita a características estructurales con alternativas de tamaño similar en el segmento de código.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Idiomas |
|---|---|---|---|---|---|
| Lumorux 1.0-AWQ | 7,6 B | no disponible | AWQ 4-bit | Apache 2.0 | en |
| Qwen2.5-Coder-7B | 7,6 B | 32K (versión base) | AWQ, GPTQ, GGUF | Apache 2.0 | multilingüe |
| CodeLlama-7B | 6,7 B | 16K | GPTQ, GGUF | Llama 2 custom | en (y otros) |
| DeepSeek-Coder-6.7B | 6,7 B | 16K | GPTQ, GGUF | DeepSeek custom | en, zh |

La comparación de rendimiento con estas alternativas no está disponible porque Lumorux no publica resultados de benchmarks. La ventaja estructural del modelo es su licencia Apache 2.0 sin restricciones adicionales y su tamaño de despliegue reducido (4,1 GB); la desventaja es la ausencia de datos verificables de calidad y de una longitud de contexto documentada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones independientes; las afirmaciones de calidad (< 3 % de pérdida) y de rendimiento provienen únicamente del autor.
- La longitud de contexto no está documentada; el autor menciona "4K context" solo como referencia de consumo de VRAM, no como especificación oficial.
- El modelo solo declara soporte de inglés, lo que limita su uso en entornos en castellano u otros idiomas sin evaluación previa.
- Riesgo de alucinación inherente a modelos de 7 B: puede generar APIs, funciones de Blender o Three.js inexistentes, por lo que el código generado requiere revisión y pruebas.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base (lumorux/Lumorux-1.0) no documenta su proceso de entrenamiento ni la procedencia de los datos, lo que dificulta evaluar riesgos de contaminación o cumplimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni issues que permitan validar su comportamiento en producción.
- El soporte en hardware AMD e Intel es declarado por el autor pero no verificado de forma independiente; en Intel Arc se marca como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lumorux/lumorux-1.0-awq
- Modelo base: https://huggingface.co/lumorux/Lumorux-1.0
- Paper de AWQ (referencia de la técnica de cuantización): https://arxiv.org/abs/2306.00978
- Documentación de AutoAWQ: https://github.com/casper-hansen/AutoAWQ
- Documentación de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
