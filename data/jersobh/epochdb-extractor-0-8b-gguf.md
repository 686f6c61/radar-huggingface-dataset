# jersobh/epochdb-extractor-0.8b-GGUF

## Resumen

epochdb-extractor-0.8b-GGUF es un modelo derivado de Qwen3.5-0.8B-Base, afinado y convertido a formato GGUF por el usuario jersobh mediante Unsloth. Forma parte del proyecto EpochDB, un motor de memoria para agentes de IA descrito por su autor como un sistema de almacenamiento por niveles sin pérdida, gestión atómica de estado y razonamiento relacional multi-salto, orientado a agentes que necesitan recuperación histórica perfecta y corrección determinista de hechos. El modelo actúa, por tanto, como extractor dentro de esa arquitectura: se encarga de convertir texto (y potencialmente imágenes, dado que la model card lo etiqueta como vision-language-model) en hechos estructurados que EpochDB pueda almacenar y consultar.

Con 752.393.024 parámetros reales en safetensors (aproximadamente 0,75 mil millones) y un repositorio de 1,5 GB, es un modelo muy pequeño pensado para ejecutarse en local con llama.cpp, no para competición en benchmarks generales. La model card menciona una base Qwen3.5-0.8B y ofrece tres ficheros GGUF: Q8_0, Q4_K_M y un proyector multimodal BF16 (`BF16-mmproj`), lo que confirma soporte de entrada visual además de texto.

Su relevancia ahora es acotada pero específica: demuestra el patrón de usar modelos sub-1B afinados para tareas de extracción de información dentro de pipelines agénticos, donde la latencia y el coste importan más que la amplitud de conocimiento. No hay descargas ni likes registrados, ni pipeline declarado, ni licencia o idiomas especificados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B-Base); detalles internos no disponibles |
| Parámetros totales | 752.393.024 (aprox. 0,75B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); safetensors como origen del recuento de parámetros |

## Arquitectura y entrenamiento

La información disponible solo confirma que se trata de un modelo basado en Qwen3.5-0.8B-Base, afinado y convertido a GGUF con Unsloth. No se detalla la arquitectura interna (número de capas, atención, tipo de normalización), ni el volumen o composición del dataset de afinado, ni si hubo RLHF, DPO o ajuste supervisado. La presencia de un fichero `BF16-mmproj.gguf` indica que el modelo incorpora un proyector multimodal, coherente con la etiqueta `vision-language-model` de la model card, aunque no se especifica qué codificador visual utiliza ni cómo se entrenó esa parte.

La innovación técnica destacable no está en el modelo en sí, sino en su contexto de uso: forma parte de EpochDB, un motor de memoria con almacenamiento por niveles, gestión atómica de estado y razonamiento relacional multi-salto. El modelo parece diseñado como extractor de hechos para alimentar ese motor, no como generador conversacional general. Unsloth se cita únicamente como herramienta de afinado y conversión, con la afirmación de que el entrenamiento fue "2x faster", sin más detalles.

## Capacidades

- Generación de texto y extracción de información estructurada (inferida del nombre "extractor" y del proyecto EpochDB).
- Entrada multimodal: la model card incluye un proyector `BF16-mmproj` y la etiqueta `vision-language-model`, por lo que se puede usar con `llama-mtmd-cli` para entradas de imagen además de texto.
- Compatibilidad con llama.cpp mediante `llama-cli` (texto) y `llama-mtmd-cli` (multimodal), con plantillas Jinja (`--jinja`).
- Etiqueta `endpoints_compatible`, que sugiere compatibilidad con endpoints tipo API, aunque no se especifica cuáles.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Extracción de hechos para memoria de agentes: el modelo puede procesar turnos de conversación o documentos y emitir hechos estructurados que EpochDB almacene en su motor de memoria por niveles, aprovechando su tamaño reducido para ejecutarse junto al agente sin competir por VRAM.
- Corrección determinista de entidades: dentro de EpochDB, el extractor puede normalizar nombres, fechas y relaciones para que el motor aplique correcciones de hechos sin ambigüedad, dado que el sistema está diseñado para "deterministic fact corrections".
- Indexación de documentación técnica: ingerir manuales, issues o READMEs y extraer entidades y relaciones para construir un grafo consultable con razonamiento multi-salto.
- Procesamiento de capturas o diagramas: gracias al proyector multimodal, puede extraer texto y relaciones de imágenes de arquitectura, tablas o capturas de pantalla en pipelines de documentación.
- Enriquecimiento de bases de conocimiento internas: ejecutarlo en local con llama.cpp para poblar un almacén de hechos a partir de correos, tickets o notas, con coste marginal cercano a cero por documento.
- Preprocesado en pipelines RAG: actuar como extractor previo que resume y estructura cada fragmento antes de la recuperación, reduciendo el ruido que llega al modelo generador.
- Prototipado de agentes con memoria a largo plazo: usar el par extractor + EpochDB como banco de pruebas de recuperación histórica y persistencia de estado en entornos de desarrollo con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q4_K_M, en torno a 0,5-0,6 GB para los pesos más overhead de contexto; con Q8_0, aproximadamente 0,8-0,9 GB; el proyector multimodal BF16 añade unos cientos de MB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o incluso iGPU con memoria unificada. Para servidores, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas, y también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-mtmd-cli` con `--jinja`), Ollama u otras interfaces compatibles con GGUF; vLLM y TGI no están confirmados para este formato.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera decodificación de decenas a cientos de tokens por segundo en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| epochdb-extractor-0.8b-GGUF | 752M | no disponible | no disponible | GGUF | Afinado para extracción en EpochDB; multimodal |
| Qwen3.5-0.8B-Base | ~0,8B | no disponible | no disponible | safetensors/GGUF | Modelo base del que deriva; capacidades generales |
| Qwen2.5-0.5B-Instruct | 494M | 32K (según versión) | Apache 2.0 (versión pública) | safetensors/GGUF | Alternativa generalista de tamaño comparable |
| SmolLM2-360M-Instruct | 362M | 8K (según versión) | Apache 2.0 | safetensors/GGUF | Alternativa aún más pequeña para tareas acotadas |

La comparación con Qwen2.5-0.5B-Instruct y SmolLM2 se ofrece como referencia de categoría; los datos de esos modelos no proceden de la información proporcionada para este modelo y conviene verificarlos en sus fichas oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de Qwen3.5-0.8B-Base, hereda los sesgos de su base, que no se documentan aquí.
- Riesgo de alucinación: alto en proporción a su tamaño; al ser un extractor, conviene validar la salida estructurada antes de escribirla en la memoria del agente.
- Limitaciones de contexto e idioma: no se especifica la ventana de contexto ni los idiomas soportados; no asumir cobertura multilingüe amplia.
- Licencia: no disponible; no se puede confirmar si el uso comercial está permitido. Verificar la licencia de Qwen3.5-0.8B-Base y la del repositorio antes de desplegar en producción.
- Pipeline no declarado en Hugging Face y sin descargas ni likes: ecosistema de validación mínimo; no hay evidencia pública de calidad más allá de la model card.
- El modelo está orientado a una tarea concreta (extracción para EpochDB); usarlo como chatbot general probablemente dé resultados pobres.
- La base Qwen3.5-0.8B no aparece verificada en la información disponible; confirmar que existe y su licencia antes de reutilizar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/epochdb-extractor-0.8b-GGUF
- Repositorio EpochDB: https://github.com/jersobh/epochdb
- Unsloth: https://github.com/unslothai/unsloth
