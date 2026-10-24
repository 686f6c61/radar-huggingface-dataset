# ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v2.0-Final-GGUF es la distribución en formato GGUF del modelo de texto ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final, publicado por el usuario ReadyArt en Hugging Face. Se trata de un modelo de generación de texto orientado a rol conversacional y ficción para adultos, con etiquetas explícitas de contenido NSFW, erótico, terror y violencia, y marcado por el autor como *unaligned* (sin alineamiento de seguridad). El pipeline declarado es text-generation y el único idioma soportado es el inglés.

El modelo cuenta con 25.233.142.046 parámetros totales según los pesos en safetensors del modelo base, aunque la nomenclatura comercial lo denomine «26B». El sufijo «A4B» del nombre apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos por token, si bien este extremo no queda confirmado en la información disponible. El repositorio GGUF ocupa 196,5 GB, lo que indica la presencia de múltiples variantes de cuantización.

Su relevancia es acotada y muy específica: cubre el nicho de modelos abiertos sin alineamiento para roleplay adulto y narrativa de ficción, un segmento con poca oferta de pesos abiertos. En el momento de la consulta acumula 3.222 descargas y 4 «likes», con licencia Apache 2.0 y fechas de creación y actualización de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según la nomenclatura «A4B» del nombre; detalles de capas y configuración no disponibles |
| Parámetros totales | 25.233.142.046 (~25,2 B) según safetensors; el nombre comercial indica 26B |
| Parámetros activos | ~4 B estimados a partir del sufijo «A4B»; no confirmado en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en varias cuantizaciones (el repositorio ocupa 196,5 GB); el listado exacto de ficheros y sus niveles de cuantización no está disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización del modelo base en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que sugiere el nombre del modelo: un transformer con mezcla de expertos de aproximadamente 25.200 millones de parámetros totales y unos 4.000 millones activos por token. Esta configuración es coherente con el tamaño del repositorio y con el patrón habitual de la familia Wicked de ReadyArt, pero no se han publicado en la información proporcionada ni el número de capas, ni el número de expertos, ni la estrategia de enrutamiento.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, y la identidad del modelo base sobre el que se construyó el fine-tuning. La única indicación cualitativa es la etiqueta *unaligned* de la model card, que implica la ausencia deliberada de un proceso de alineamiento de seguridad orientado a rechazar contenido sensible. El repositorio es una cuantización del modelo ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final (relación `base_model_relation: quantized`), por lo que no incorpora entrenamiento adicional.

## Capacidades

- Generación de texto conversacional e instructivo en inglés, con formato de chat multi-turno.
- Roleplay y caracterización de personajes, incluyendo mantenimiento de persona y estilo narrativo.
- Escritura de ficción adulta y contenido erótico explícito (ERP), sin filtros de moderación internos declarados.
- Narrativa de terror, violencia gráfica y temáticas maduras.
- Generación de diálogos y descripciones dentro de escenas de ficción extensas.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo *thinking* o razonamiento explícito: no documentado.

## Casos de uso

- **Roleplay conversacional para ficción adulta**: el modelo está ajustado específicamente para mantener personajes y escenas en conversaciones de varios turnos, con registro narrativo sostenido y sin rechazos por contenido maduro. Adecuado para plataformas de ficción interactiva con verificación de edad.
- **Escritura creativa de terror y violencia en ficción**: útil como asistente de redacción para relatos, guiones o novelas que requieran descripciones explícitas, un terreno donde los modelos alineados suelen rechazar o suavizar la salida.
- **Generación de diálogos para videojuegos narrativos para adultos**: permite producir líneas de personaje con tono consistente y contenido maduro para videojuegos con clasificación por edades, siempre que el pipeline de integración aplique moderación en el punto de entrega.
- **Prototipado de NPCs con personalidad fuerte**: gracias a su orientación conversacional, sirve para experimentar con sistemas de diálogo de personajes que requieren respuestas con carga emocional y sin evasivas, en entornos de desarrollo cerrados.
- **Investigación en seguridad y *red-teaming***: al ser un modelo explícitamente no alineado, resulta útil como objeto de estudio para evaluar mecanismos de moderación externos, detectores de contenido dañino y estrategias de *guardrails* en pipelines de producción.
- **Generación de datos sintéticos de diálogo maduro para investigación**: permite construir corpus de conversación con registro explícito para estudiar sesgos, estilos narrativos o dinámicas de diálogo, con las salvaguardas legales y éticas correspondientes.
- **Despliegue local en hardware de consumo**: al distribuirse en GGUF y tener un número reducido de parámetros activos, puede ejecutarse en una RTX 4090 con cuantizaciones de 4 bits, lo que facilita su uso en entornos totalmente offline donde la privacidad del contenido es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones calculadas a partir de los 25,2 B de parámetros totales y del supuesto de ~4 B activos; no son cifras publicadas por el autor.

- **VRAM para inferencia (estimación)**:
  - F16: ~50 GB de pesos.
  - Q8_0: ~27 GB.
  - Q6_K: ~21 GB.
  - Q5_K_M: ~18 GB.
  - Q4_K_M: ~15-16 GB.
  - Q3_K_M: ~12 GB.
  - Q2_K: ~8-9 GB.
- **GPU recomendadas**: A100 80 GB o H100 para F16; A100 40 GB o 2× RTX 4090 para Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q5_K_M.
- **Cabe en GPU de consumo**: sí, en RTX 4090/3090 con cuantizaciones de 4-5 bits; en GPUs de 12 GB con Q3_K_M o Q2_K, con pérdida de calidad apreciable.
- **Despliegue**: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp) son la vía natural al ser un GGUF; vLLM y TGI requieren conversión o soporte específico de la arquitectura MoE, no confirmado para este modelo. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a través de servidores de inferencia.
- **Latencia y throughput**: no disponibles. Al tratarse de un MoE con ~4 B activos, la velocidad por token debería ser superior a la de un modelo denso de 25 B, pero no se han publicado medidas. Es posible aplicar *offload* de expertos a RAM del sistema con llama.cpp, a costa de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v2.0-Final (este) | ~25,2 B | ~4 B (no confirmado) | No disponible | Apache 2.0 | Roleplay adulto, sin alinear | GGUF en HF; 3.222 descargas |
| Wicked-Tutu-26B-A4B-Final (misma familia) | ~26 B | ~4 B | 32K (según ficha del proveedor) | No disponible en la búsqueda | Roleplay / narrativa | Servido en Featherless desde 25 USD/mes |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128K | Apache 2.0 | Propósito general, alineado | Pesos abiertos en safetensors y GGUF |
| Mistral Small 3 24B | 24 B (denso) | 24 B | 32K | Apache 2.0 | Propósito general, alineado | Pesos abiertos en safetensors y GGUF |

La comparación directa en rendimiento no es posible: no hay benchmarks publicados para Wicked-Stuff, y los modelos de propósito general de la tabla están evaluados en tareas (MMLU, HumanEval, GSM8K) que no reflejan el objetivo de este modelo. La diferencia relevante es de naturaleza, no de puntuación: Wicked-Stuff renuncia explícitamente al alineamiento de seguridad, mientras que Qwen3 y Mistral Small lo incorporan.

## Limitaciones y advertencias

- **Ausencia de alineamiento de seguridad**: la etiqueta *unaligned* implica que el modelo no ha sido entrenado para rechazar peticiones dañinas. Puede generar contenido violento, sexual explícito o ilegal sin filtros propios.
- **Contenido para adultos**: marcado `not-for-all-audiences`. No apto para menores ni para aplicaciones de acceso público sin verificación de edad y moderación externa.
- **Riesgo legal en producción**: la licencia Apache 2.0 permite el uso comercial, pero eso no exime de cumplir la normativa aplicable sobre contenido sexual, protección de menores o difamación. El contenido generado es responsabilidad del operador.
- **Riesgo de alucinación**: no hay datos sobre fidelidad factual; al ser un modelo orientado a ficción y sin benchmarks publicados, no es adecuado para tareas que exijan precisión factual.
- **Idioma**: únicamente inglés declarado. El rendimiento en castellano es desconocido y probablemente degradado.
- **Contexto desconocido**: no se especifica la ventana de contexto, lo que impide planificar conversaciones largas o prompts con documentación extensa.
- **Sesgos no documentados**: se desconoce la composición del dataset de entrenamiento y, por tanto, los sesgos demográficos, culturales o de género incorporados.
- **Restricciones de plataforma**: muchos proveedores de inferencia y tiendas de aplicaciones rechazan modelos con contenido NSFW, lo que limita su despliegue en servicios gestionados.
- **Formato solo de inferencia**: el repositorio es GGUF cuantizado; no es adecuado para reentrenamiento o fine-tuning sin recuperar el modelo base en safetensors.
- **Huella de almacenamiento**: 196,5 GB de repositorio si se descargan todas las cuantizaciones; conviene descargar únicamente el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF
- Árbol de ficheros del repositorio: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF/tree/main
- Modelo base (safetensors): https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final
- Perfil de la organización ReadyArt: https://huggingface.co/ReadyArt/models
- Modelo hermano en Featherless (Wicked-Tutu-26B-A4B-Final): https://featherless.ai/models/ReadyArt/Wicked-Tutu-26B-A4B-Final
- Perfil de benchmarks de ReadyArt en BenchmarkList: https://benchmarklist.com/providers/readyart/
- Rankings de modelos frontera (referencia general, octubre de 2026): https://benchlm.ai/frontier-ai-models
