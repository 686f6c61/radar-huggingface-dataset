# aramkris/fineweb-edu-124m-base-qwen3

## Resumen

FineWeb-Edu 124M base (stage 2) es la conversión al formato estándar de Qwen3 de un modelo GPT de 124 millones de parámetros entrenado desde cero por el autor aramkris en el proyecto tinystories-ARM-model. No es un modelo Qwen: únicamente adopta el formato de ficheros y la configuración de Qwen3 para que herramientas estándar como transformers, llama.cpp, Ollama o LM Studio puedan ejecutarlo sin código propietario del proyecto original.

El modelo es un modelo base (no ajustado a instrucciones) especializado en continuar texto de tipo educativo: artículos web, explicaciones, guías prácticas y relatos. Su ventana de contexto es de 512 tokens, lo que lo sitúa en la categoría de modelos pequeños para tareas acotadas y experimentación. Se distribuye en bfloat16 (safetensors y GGUF) y en cuantización de 8 bits (Q8_0), con licencia MIT.

Su relevancia radica en dos factores: por un lado, demuestra que es posible exportar exactamente un transformer con LayerNorm al esquema de Qwen3 (que usa RMSNorm) mediante una transformación matemática de los pesos sin reentrenar; por otro lado, ofrece un caso de estudio reproducible de entrenamiento desde cero con verificación numérica rigurosa frente al modelo PyTorch original. Los parámetros reales en safetensors son 162.150.144, aunque el autor lo denomine "124M".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT con formato Qwen3 (LayerNorm sin bias en lugar de RMSNorm) |
| Parámetros totales | 162.150.144 (según safetensors); el autor lo denomina 124M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | bfloat16 (safetensors y GGUF), Q8_0 (GGUF de 8 bits) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF (bf16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de Qwen3 con una diferencia clave: las normas de bloque son LayerNorm sin bias, mientras que Qwen3 emplea RMSNorm. Para que la conversión sea exacta, el script `serving/export_hf.py` hace que el flujo residual tenga media cero (centrando los embeddings de entrada y todas las matrices que escriben en él), lo que iguala ambas funciones de normalización. La capa de salida conserva los embeddings originales (no atados) y las proyecciones query y key se escalan por √10 para que el único epsilon de Qwen3 actúe como el QK-norm del modelo original. No hay reentrenamiento: es el mismo modelo transformado matemáticamente.

El entrenamiento se realizó desde cero en el proyecto tinystories-ARM-model sobre los datasets BaoMinhTran/mini-fineweb-edu y HuggingFaceTB/cosmopedia, orientados a texto educativo. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO en esta versión base. Los ficheros GGUF se generaron con el conversor de llama.cpp. La verificación frente al modelo PyTorch original muestra diferencias mínimas: la pérdida en conjuntos held-out difiere en menos de 0,0013, la mayor diferencia de logits en float32 es de 9e-5 y la generación greedy es idéntica token a token.

## Capacidades

- Generación y continuación de texto en inglés sobre temática educativa: artículos web, explicaciones, guías prácticas y relatos.
- Modelo base sin ajuste a instrucciones: no sigue órdenes ni mantiene formato conversacional de forma fiable.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Ejecutable en transformers (bfloat16), llama.cpp, Ollama y LM Studio gracias al formato Qwen3.

## Casos de uso

- Generación de texto educativo de dominio acotado: el modelo puede completar fragmentos sobre ciclos naturales, procesos científicos o tutoriales sencillos, aprovechando su entrenamiento sobre FineWeb-Edu y Cosmopedia; útil para prototipos de contenido didáctico breve.
- Experimentación académica con entrenamiento desde cero: sirve como referencia reproducible para estudiar cómo se comporta un transformer pequeño entrenado en dominios específicos y cómo se exporta a formatos estándar.
- Pruebas de pipelines de inferencia: al ser compatible con llama.cpp, Ollama y LM Studio, permite validar infraestructura de despliegue local con un modelo de menos de 350 MB en disco.
- Generación de texto en dispositivos con recursos limitados: sus 162 millones de parámetros y su versión Q8_0 de 174 MB permiten ejecución en CPU y en hardware de gama baja para tareas de autocompletado o generación de borradores.
- Docencia y divulgación sobre LLM: el modelo y su proceso de conversión exacta (LayerNorm a RMSNorm mediante centrado del flujo residual) constituyen un material didáctico concreto sobre cómo funcionan las normalizaciones y la exportación de pesos.
- Evaluación comparativa de cuantizaciones: las versiones bf16 y Q8_0 con métricas verificadas (HellaSwag, LAMBADA, ARC-Easy, PIQA, WinoGrande) permiten medir el impacto real de la cuantización de 8 bits en un modelo pequeño con diferencias documentadas de décimas de punto.
- Generación de texto de relleno o aumentación de datos: para tareas donde se necesita texto sintético en inglés de temática educativa y no se requiere instrucción, el modelo puede producir continuaciones controladas por prompt.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando el modelo original en PyTorch con las versiones en llama.cpp (bfloat16 y 8 bits):

| Métrica | Original (PyTorch) | llama.cpp bfloat16 | llama.cpp 8 bits |
|---|---|---|---|
| Pérdida en Mini FineWeb-Edu held-out | 3,2957 | 3,2959 | 3,2963 |
| HellaSwag (acc_norm) | 32,26 % | 32,26 % | 32,22 % |
| LAMBADA | 20,34 % | 20,32 % | 20,28 % |
| ARC-Easy | 46,84 % | 46,76 % | 46,72 % |
| PIQA | 62,40 % | 62,30 % | 62,24 % |
| WinoGrande | 49,88 % | 50,04 % | 49,64 % |
| Media de los cinco benchmarks | 42,35 | 42,34 | 42,22 |

La model card indica además que LAMBADA a través de la API HTTP de llama-server obtiene 20,36 %. No se han publicado resultados de benchmarks en la información disponible más allá de estos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 y aproximadamente 0,5 GB en Q8_0, considerando pesos y estados de activación para contexto de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; modelos como RTX 3060, RTX 4060 o superiores son más que suficientes. También funciona en CPU.
- Cabe en cualquier GPU de consumo actual e incluso en placas integradas con memoria compartida.
- Opciones de despliegue: transformers (bfloat16), llama.cpp, Ollama, LM Studio y cualquier herramienta compatible con Qwen3.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-124m-base-qwen3 | 162.150.144 | 512 | MIT | safetensors, GGUF | Base, solo inglés, dominio educativo |
| Qwen3 (modelos pequeños de referencia) | no disponible en la información | no disponible | no disponible | no disponible | El modelo solo comparte formato, no arquitectura ni pesos |
| fineweb-edu-124m-chat-dpo-qwen3 | no disponible | no disponible | MIT (según repo del autor) | no disponible | Variante ajustada con DPO para chat del mismo autor |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada; la comparativa se limita a la relación con la familia Qwen3 (solo formato) y la variante chat del mismo autor.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene diálogos; para uso conversacional debe emplearse la variante chat-dpo.
- Ventana de contexto muy corta (512 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo entrenado y evaluado en inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, especialmente en dominios fuera del texto educativo.
- Sesgos heredados de los datasets FineWeb-Edu y Cosmopedia, que pueden reflejar sesgos de la web y de textos sintéticos.
- Rendimiento modesto en benchmarks (media de 42,35 en cinco tareas), adecuado para experimentación pero no para producción de alta exigencia.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías ni soporte.
- La conversión depende de una transformación matemática específica; modificaciones posteriores de los pesos sin repetir el proceso pueden romper la equivalencia con el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-base-qwen3
- Modelo base: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Variante chat con DPO: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Script de exportación a Hugging Face: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/export_hf.py
- Script de conversión a GGUF: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/gguf.sh
- Script de verificación: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/check.py
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
