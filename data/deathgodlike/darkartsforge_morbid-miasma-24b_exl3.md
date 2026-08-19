# DeathGodlike/DarkArtsForge_Morbid-Miasma-24B_EXL3

## Resumen

DarkArtsForge_Morbid-Miasma-24B_EXL3 es una cuantización en formato ExLlamaV3 (EXL3) del modelo base DarkArtsForge/Morbid-Miasma-24B, creada por el usuario DeathGodlike. El modelo base es un merge de 14 modelos de 24B de parámetros, construido con el método "della" (arxiv:2406.11617) sobre la arquitectura MistralForCausalLM, utilizando como base mistralai/Magistral-Small-2509. Se trata de un modelo de generación de texto sin censura, orientado a narrativa, roleplay y escritura creativa, con una puntuación de 16103 en Q0 Bench según su autor.

Esta versión cuantizada ofrece tres niveles de precisión (4, 6 y 8 bits) en formato EXL3, lo que permite ajustar el consumo de VRAM según el hardware disponible. El repositorio incluye los pesos en safetensors y archivos de descarga por lotes para cada variante. La licencia detectada es Apache 2.0, heredada del modelo fuente, aunque los metadatos de HuggingFace no la especifican directamente. El contexto máximo declarado para el modelo base es de 128K tokens, según fuentes externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only) |
| Parametros totales | no disponible (denominacion 24B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K (segun modelo base, via llm-explorer.com) |
| Tipos de cuantizacion | EXL3 4-bit (H8-4.0BPW), 6-bit (H8-6.0BPW), 8-bit (H8-8.0BPW) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (detectada en la model card, heredada del modelo fuente) |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Morbid-Miasma-24B es un merge de 14 modelos preentrenados, todos de 24B de parámetros, combinados mediante el método "della" (descrito en arxiv:2406.11617). Este método de fusión ponderada por densidad y epsilon se aplicó sobre una base mistralai/Magistral-Small-2509, manteniendo la arquitectura MistralForCausalLM. No se dispone de información sobre el dataset de entrenamiento original de los modelos fusionados, ni sobre procesos de RLHF o DPO. La cuantización EXL3 se realizó con ExLlamaV3 v1.3.0, generando tres variantes con 4, 6 y 8 bits por peso (BPW). No se documentan innovaciones técnicas adicionales en la cuantización.

## Capacidades

- Generacion de texto libre, sin filtros de censura, apta para narrativa, roleplay y escritura creativa.
- Soporte de contexto largo (hasta 128K tokens segun el modelo base), util para conversaciones multi-turno o documentos extensos.
- Capacidad multilingue no confirmada; no se especifican idiomas soportados.
- No se menciona soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No incluye capacidades de vision, audio u otras modalidades; es exclusivamente texto.
- Se recomienda usar la plantilla de chat Mistral Tekken para un comportamiento optimo, segun la model card.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede generar historias, dialogos y descripciones con un tono oscuro y creativo, gracias a su entrenamiento sin censura y su puntuacion Q0 Bench de 16103.
- Roleplay en entornos de texto: adecuado para juegos de rol por chat, con capacidad de mantener personajes y tramas complejas a lo largo de conversaciones largas (hasta 128K de contexto).
- Generacion de contenido literario experimental: util para autores que buscan explorar temas tabu o transgresores sin restricciones de moderacion.
- Asistente de escritura para ficcion especulativa: puede ayudar a desarrollar mundos, personajes y giros argumentales, aunque requiere supervision humana por su naturaleza sin filtros.
- Creacion de dialogos para videojuegos o guiones: su capacidad de generar conversaciones naturales y sin censura puede servir para prototipos de guiones, siempre que se ajuste el prompt del sistema.
- Investigacion en modelos de lenguaje sin alineacion: permite estudiar el comportamiento de un LLM sin restricciones de seguridad, en entornos controlados de investigacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor del modelo base menciona una puntuacion de 16103 en Q0 Bench, pero no se especifica que mide ni como se compara con otros modelos. No se dispone de datos de latencia o throughput para las versiones cuantizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: 13.16 GB (4-bit), 18.72 GB (6-bit) y 24.27 GB (8-bit), segun el tamano de los archivos cuantizados. El modelo base en precision completa requiere aproximadamente 47.3 GB de VRAM (segun llm-explorer.com).
- GPU recomendadas: para la variante 4-bit, una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, RTX 4080) es suficiente. Para 6-bit, se recomienda 24 GB (RTX 3090/4090, A5000). Para 8-bit, se necesitan 24-32 GB (A100 40GB, RTX 6000 Ada, o multiples GPUs).
- En consumer GPU: la variante 4-bit cabe en GPUs de gama alta como RTX 4090 (24 GB) y RTX 4080 (16 GB). La variante 6-bit tambien cabe en RTX 4090. La 8-bit requiere GPUs con 24 GB o mas, como RTX 3090 o RTX 4090.
- Opciones de despliegue: al ser un formato EXL3, se debe usar ExLlamaV3 (v1.3.0 o superior). Tambien puede cargarse con vLLM si se convierte a otro formato, pero no es el proposito de esta cuantizacion. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (merges de 24B sin censura). No se han encontrado datos de rendimiento estandar ni listas de modelos comparables en las fuentes consultadas.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar narrativas y roleplay con contenido violento y erotico grafico, segun la advertencia de la model card. No es apto para aplicaciones que requieran moderacion de contenido.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo, puede producir informacion falsa o inventada, especialmente en tareas factuales.
- Sesgos desconocidos: al ser un merge de multiples modelos, no se han documentado evaluaciones de sesgos. Se recomienda precaucion en usos sensibles.
- Limitaciones de idioma: no se especifican idiomas soportados; el rendimiento en lenguas distintas del ingles no esta garantizado.
- Restricciones de licencia: aunque la licencia detectada es Apache 2.0, se debe verificar la licencia del modelo base y de los modelos fusionados originales, ya que la cuantizacion hereda las condiciones de estos.
- Requisitos de plantilla: se recomienda usar la plantilla de chat Mistral Tekken; usar otra plantilla puede degradar la calidad de las respuestas.
- Sin soporte de herramientas: no se ha documentado tool calling ni integracion con agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/DeathGodlike/DarkArtsForge_Morbid-Miasma-24B_EXL3
- Modelo base: https://huggingface.co/DarkArtsForge/Morbid-Miasma-24B
- Paper del metodo della: https://arxiv.org/abs/2406.11617
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Ficha del modelo en llm-explorer.com: https://llm-explorer.com/model/DarkArtsForge%2FMorbid-Miasma-24B,2fPT7MdpB8nzD6XMsi3yzl
- Version MLX 8-bit (por McG-221): https://llm-explorer.com/model/McG-221%2FMorbid-Miasma-24B-mlx-8Bit,40szzBn7PrePw4N4ztbsUF
