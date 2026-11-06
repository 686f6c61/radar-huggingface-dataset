# Elliott9444/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal denso de aproximadamente 29.600 millones de parámetros con un codificador de percepción dedicado, desarrollado por Meta Superintelligence Lab y publicado bajo licencia Apache 2.0. Está destilado a partir de Muse Spark y diseñado específicamente para tareas agénticas autónomas ejecutables en hardware de consumo, sin necesidad de infraestructura en la nube ni acceso a red. Integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal y recuperación ante fallos en un único modelo.

La arquitectura combina un transformer causal denso de 52 capas con atención agrupada (GQA 16:1), patrón de atención local/global con ventana deslizante de 2048 tokens y un codificador visual ViT-G/14 de unos 1.800 millones de parámetros. El contexto alcanza los 131.072 tokens o más, y el vocabulario es de 202.048 tokens. El modelo acepta entrada de texto e imagen y genera texto.

Su relevancia inmediata reside en la optimización para despliegue local: mediante cuantización a 4 bits, el modelo cabe en un envelope de 24 o 32 GB de VRAM junto con la caché KV, el codificador visual y un drafter de decodificación especulativa basado en DFlash que predice bloques de 16 tokens en una sola pasada. Según el autor, esto permite velocidades de hasta 233 tok/s en una RTX 5090 con una degradación mínima en tareas agénticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense Causal Transformer con Perception Encoder (ViT-G/14) |
| Parámetros totales | ~29,6B (incluye codificador visual de ~1,8B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantización | Full precision, K-Quant-Dynamic, K-Quant-17GB (~4 bits) |
| Idiomas soportados | Más de 100 idiomas (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Especificaciones adicionales del language model:

| Parámetro | Valor |
|---|---|
| Dimensión oculta | 6656 |
| Capas | 52 |
| Patrón de atención | [Local, Local, Local, Global] repetido |
| Ventana deslizante | 2048 |
| Gated attention | Sí |
| Cabezas de atención (Q / KV) | 32 / 2 (GQA 16:1) |
| Dimensión de cabeza | 128 |
| FFN | SwiGLU, dimensión intermedia 19.968 |
| Codificación posicional | RoPE (θ = 500.000), solo en capas locales |
| Codificador visual | ViT-G/14, ~1,8B, 50 capas, ancho 1536, patch 14 |
| Vocabulario | 202.048 (200.000 BPE + 2.048 especiales) |
| Tokens visuales máx. por imagen | 4.096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Knowledge cutoff | 4 de enero de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con atención híbrida local/global: tres capas de atención local con ventana deslizante de 2048 tokens seguidas de una capa global, patrón que se repite a lo largo de las 52 capas. Emplea GQA con ratio 16:1 (32 cabezas de query, 2 de KV), gated attention y FFN SwiGLU con dimensión intermedia de 19.968. La codificación posicional RoPE (θ = 500.000) se aplica únicamente en las capas locales. El codificador de percepción es un ViT-G/14 de 50 capas y ancho 1536 con patch size 14, que aporta unos 1.800 millones de parámetros y admite hasta 4.096 tokens visuales por imagen.

El entrenamiento se realizó sobre contenido multimodal procedente de datos públicos, datos de terceros e información de productos y servicios de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. La model card no especifica el número exacto de tokens de entrenamiento ni detalla si hubo RLHF o DPO. La innovación técnica más destacable es la decodificación especulativa mediante un drafter DFlash de 5 capas y tamaño de bloque 16, que predice bloques completos de tokens en una sola pasada y cuya salida se verifica en paralelo por el modelo principal. El drafter usa atención de ventana deslizante de 2048 en todas sus capas, 32 cabezas de query y 8 de KV, y toma características ocultas de las capas 1, 13, 25, 37 y 49 del modelo objetivo.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprensión multimodal de entrada: interpreta capturas de pantalla, gráficos y documentos junto con la conversación gracias al codificador de percepción.
- Uso fiable de herramientas (tool calling / function calling) con esquemas precisos a lo largo de flujos prolongados.
- Recuperación ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds agénticos como OpenClaw, Hermes Agent y otros patrones de orquestación.
- Esfuerzo controlable: distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Capacidades multilingües entrenadas sobre más de 100 idiomas.
- Escritura y depuración de código dentro de entornos agénticos (evaluado en SWE-Bench).
- Ejecución local sin infraestructura de nube ni acceso a red.

## Casos de uso

- Agentes autónomos de resolución de tareas: el modelo puede operar dentro de scaffolds como OpenClaw o Hermes Agent para completar flujos de trabajo de extremo a extremo, incluyendo búsqueda profunda y resolución de peticiones multi-turno, gracias a su contexto de 131.072 tokens y a su capacidad de razonamiento multi-paso.
- Automatización de ingeniería de software: con soporte de tool calling y depuración de código, puede integrarse en pipelines para escribir parches, ejecutar tests y corregir errores de forma iterativa, evaluado específicamente en SWE-Bench.
- Análisis de documentos y capturas de pantalla: el codificador visual permite interpretar gráficos, tablas e interfaces de usuario junto al texto, útil para agentes que navegan aplicaciones o extraen datos de informes.
- Asistentes de atención al cliente multi-turno: el contexto largo y el soporte de más de 100 idiomas permiten gestionar conversaciones prolongadas y derivar a herramientas internas mediante function calling cuando sea necesario.
- Despliegue en estación de trabajo local: con cuantización K-Quant-17GB cabe en 24 GB de VRAM y funciona sin conexión, adecuado para entornos con requisitos de privacidad o sin acceso a red.
- Orquestación de herramientas en flujos empresariales: la recuperación ante fallos permite que el agente reintente llamadas fallidas a APIs y continúe el flujo sin intervención humana.
- Prototipado rápido en hardware de consumo: con el drafter DFlash alcanza velocidades interactivas en RTX 5090 y Apple M4/M5 Max, lo que facilita iterar sobre prompts y scaffolds en local.

## Benchmarks y rendimiento

La model card menciona evaluación en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no publica los valores numéricos obtenidos en dichos benchmarks. Los únicos datos cuantitativos disponibles son los de degradación por cuantización y velocidad de inferencia.

Degradación por cuantización (media de precisión sobre 15 benchmarks comunes):

| Configuración | Degradación | Hardware objetivo |
|---|---|---|
| Full precision | — | 64 GB VRAM |
| K-Quant-Dynamic | 0,2 % | 32 GB VRAM |
| K-Quant-17GB | 1,0 % | 24 GB VRAM |

Velocidad de generación con K-Quant-17GB y drafter DFlash cuantizado (batch size 1, greedy):

| GPU | Sin especulación (tok/s) | Con DFlash (tok/s) | Aceleración |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

No se han publicado resultados numéricos de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 64 GB para precisión completa; 32 GB con K-Quant-Dynamic; 24 GB con K-Quant-17GB (incluyendo caché KV, codificador visual y drafter).
- GPU recomendadas: Nvidia RTX 5090 para el perfil de 24-32 GB; GPUs de 64 GB (A100 80GB, H100) para precisión completa.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) y en Apple Silicon M4 Max y M5 Max con memoria unificada suficiente.
- Opciones de despliegue: transformers (librería indicada en la model card); compatible con endpoints. No se especifican otras integraciones como vLLM, llama.cpp o Ollama.
- Latencia y throughput: 233,4 tok/s en RTX 5090 con DFlash (3,1x sobre 74,9 tok/s sin especulación); 50,2 tok/s en M5 Max y 37,8 tok/s en M4 Max con DFlash. Mediciones con batch size 1 y decodificación greedy.

## Comparativa con modelos similares

No se dispone de datos de benchmarks numéricos ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuación se indican únicamente los ejes que cabría comparar:

| Criterio | Muse Glimmer-30B | Alternativas de la misma categoría |
|---|---|---|
| Parámetros | ~29,6B (denso) | no disponible |
| Contexto | 131.072+ | no disponible |
| Multimodalidad | Texto + imagen de entrada | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Despliegue local | 24-32 GB VRAM con cuantización | no disponible |

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos ni evaluaciones de seguridad; al entrenarse con datos de productos de Meta y proveedores externos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no se publican métricas de factualidad.
- El conocimiento tiene fecha de corte del 4 de enero de 2026; no dispone de información posterior salvo que se le proporcione vía herramientas.
- Aunque se declara soporte de más de 100 idiomas, no se especifica el rendimiento por idioma ni la calidad relativa en cada uno.
- La cuantización K-Quant-17GB introduce una degradación media del 1,0 % sobre 15 benchmarks; conviene validar las tareas concretas antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero la model card no incluye cláusulas adicionales de uso aceptable ni garantías.
- El repositorio de Hugging Face no registra descargas ni likes y fue creado y actualizado en la misma fecha, lo que no aporta señal sobre validación comunitaria.
- No se documentan requisitos de despliegue en servidores de inferencia de alto rendimiento (vLLM, TGI) ni soporte de batching.

## Enlaces

- Hugging Face: https://huggingface.co/Elliott9444/Muse-Glimmer-30B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper del codificador de percepción: https://arxiv.org/abs/2504.13181
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Referencia adicional citada en los tags: arxiv:2610.24628 (sin título disponible en la información proporcionada)
