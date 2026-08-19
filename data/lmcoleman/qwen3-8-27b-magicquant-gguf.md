# lmcoleman/Qwen3.8-27B-MagicQuant-GGUF

## Resumen

Qwen3.8-27B-MagicQuant-GGUF es un derivado cuantizado del modelo Qwen3.8-27B de Alibaba, publicado por el usuario lmcoleman en HuggingFace. El archivo GGUF se genera mediante MagicQuant, una técnica de cuantización híbrida que aplica una búsqueda evolutiva por tensor para seleccionar el tipo de cuantización óptimo para cada grupo de sensibilidad (embeddings, atención, FFN, router, etc.), en lugar de usar un esquema uniforme. El resultado es un conjunto de archivos GGUF listos para usar con llama.cpp, LM Studio o llama-cpp-python, con un equilibrio medido entre tamaño, velocidad y pérdida de perplejidad.

El modelo base, Qwen3.8-27B, es un transformer de 27 320 697 856 parámetros (aproximadamente 27,3 mil millones) orientado a generación de texto en inglés. Este derivado no añade entrenamiento adicional; solo aplica cuantización post-entrenamiento. La relevancia actual radica en que ofrece una alternativa de despliegue local eficiente para un modelo de 27B, con soporte de decodificación especulativa MTP integrada y un proyecto de visión opcional, todo bajo licencia Apache 2.0.

La publicación incluye dos niveles de cuantización publicados (Q4 híbrido y Q6 híbrido) más un proyecto de visión en F16. El autor documenta que el nivel Q5 fue buscado, construido y medido, pero se descartó por estar dominado por Q4 en tamaño, velocidad y calidad, lo que refleja un enfoque riguroso de selección de archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica si es MoE o dense; no disponible) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (la model card indica que soporta la longitud completa del modelo base, pero no se proporciona el valor) |
| Tipos de cuantizacion | Q4_K_M híbrido (15,7 GB), Q6_K híbrido (22,4 GB), mmproj F16 (0,9 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El archivo GGUF es una cuantización del modelo base Qwen3.8-27B, del que no se proporcionan detalles de arquitectura interna en la información disponible. El proceso de cuantización usa MagicQuant, que clasifica los tensores en grupos de sensibilidad (embeddings, head, query, key, output, FFN up/down, MoE experts y router, si aplica) y aplica una búsqueda evolutiva para asignar el tipo de cuantización óptimo a cada grupo, manteniendo los tensores críticos (embeddings, output head, router) en F32/F16/BF16. No se aplica ningún entrenamiento adicional; la cuantización es puramente post-entrenamiento.

La model card documenta que se midió la perplejidad en wikitext-2 (100 chunks, contexto 512) frente a una línea base BF16 de 6,7443. Los niveles publicados son Q4 híbrido (6,7611, +0,25 %) y Q6 híbrido (6,7579, +0,20 %). El nivel Q5 se construyó pero se descartó por ser un 21 % más grande que Q4, con perplejidad ligeramente peor y una generación un 24 % más lenta. La recomendación del autor es usar Q4 para velocidad y Q6 para máxima calidad, aunque la diferencia de perplejidad entre ambos está por debajo de la resolución de la medición.

## Capacidades

- Generación de texto y chat conversacional, con plantilla de chat integrada en el GGUF (detectada automáticamente por llama.cpp y LM Studio).
- Soporte de visión mediante el proyecto `mmproj-Qwen3.8-27B-f16.gguf`, que permite entrada de imágenes a través de `llama-server` con `--mmproj`.
- Decodificación especulativa MTP (multi-token prediction) integrada: el modelo incluye tensores de borrador que permiten una generación autodrafting sin modelo externo, con una mejora medida de ~1,6-1,9x en velocidad de generación y una tasa de aceptación del primer token de ~95 %.
- Compatibilidad con llama.cpp, llama-cpp-python, LM Studio y servidores OpenAI-compatibles vía `llama-server`.
- No se mencionan capacidades explícitas de tool calling, function calling ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Asistente de chat local en inglés: el modelo puede ejecutarse en una máquina de escritorio con GPU o incluso solo CPU, gracias a los archivos GGUF y a la integración con LM Studio o llama.cpp. Es adecuado para conversaciones multi-turno con contexto moderado (la model card sugiere `-c 8192` como ejemplo).
- Servicio de generación de texto autocontenido: `llama-server` permite exponer una API compatible con OpenAI para integrar el modelo en aplicaciones web o pipelines internos sin depender de servicios externos.
- Prototipado de agentes conversacionales con entrada multimodal: usando el proyecto de visión F16, se pueden construir sistemas que procesen imágenes junto con texto, por ejemplo para descripción de capturas o análisis de documentos visuales.
- Evaluación de calidad de cuantización: el repositorio incluye mediciones de perplejidad y throughput, lo que lo convierte en un caso de referencia para comparar esquemas de cuantización híbrida frente a uniforme.
- Despliegue en entornos con recursos limitados: el nivel Q4 (15,7 GB) cabe en GPUs de 16 GB o incluso en sistemas con 32 GB de RAM en modo CPU-only, permitiendo ejecutar un modelo de 27B en hardware de consumo.
- Investigación en decodificación especulativa: los tensores MTP integrados permiten experimentar con autodrafting y medir aceleraciones de generación sin necesidad de un modelo borrador separado.

## Benchmarks y rendimiento

La model card proporciona mediciones de perplejidad y throughput, pero no resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos disponibles son:

| Metrica | Q4_K_M híbrido | Q6_K híbrido | BF16 (baseline) |
|---|---|---|---|
| Perplejidad (wikitext-2, ctx 512) | 6,7611 (+0,25 %) | 6,7579 (+0,20 %) | 6,7443 |
| Tamano del archivo | 15,7 GB | 22,4 GB | no disponible |
| Velocidad de generacion (CPU-only, Ryzen AI MAX+ 395) | 6,03 tok/s | 4,47 tok/s | no disponible |

El nivel Q5 (no publicado) medía 17,68 GB, perplejidad 6,7666 (+0,33 %) y 4,57 tok/s. Las cifras de velocidad son solo CPU y se obtuvieron durante la búsqueda con carga adicional; no son representativas de GPU o Metal. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 15,7 GB, por lo que se necesita al menos 16 GB de VRAM para cargarlo completamente en GPU (con overhead adicional para contexto y caché KV). El Q6_K de 22,4 GB requiere al menos 24 GB de VRAM.
- GPU recomendadas: para Q4, una RTX 4090 (24 GB) o RTX 4080 (16 GB) puede cargar el modelo con offload completo. Para Q6, se recomienda una A100 40 GB, RTX 4090 24 GB o similar. En modo CPU-only, el autor midió 6 tok/s con un Ryzen AI MAX+ 395, lo que indica que es viable en hardware de gama alta sin GPU.
- Si cabe en consumer GPU: sí, el nivel Q4 cabe en GPUs de consumo con 16 GB (RTX 4080, 4090, 3090). El Q6 requiere 24 GB (RTX 3090, 4090).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, LM Studio (auto-detección de plantilla de chat), y servidores OpenAI-compatibles vía `llama-server`.
- Latencia y throughput: la model card solo reporta velocidad de generación CPU-only (6,03 tok/s para Q4, 4,47 tok/s para Q6). Con decodificación especulativa MTP activada, se mide una mejora de ~1,6-1,9x en generación, pero no se dan cifras absolutas para GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (mismo tamaño o tarea) en la documentación proporcionada. El autor no menciona modelos comparables ni se incluyen resultados de benchmarks estándar. Se puede señalar que el modelo base es Qwen3.8-27B, pero no se conocen otros derivados cuantizados del mismo base con los que contrastar.

## Limitaciones y advertencias

- La cuantización reduce la precisión; el autor recomienda verificar los resultados para cada caso de uso específico, especialmente en tareas que requieran alta fidelidad numérica.
- El modelo está etiquetado solo en inglés (`language: en`), por lo que su rendimiento en otros idiomas no está garantizado.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.), por lo que no es posible evaluar su rendimiento en tareas de razonamiento, código o matemáticas con datos objetivos.
- La decodificación especulativa MTP duplica aproximadamente el uso de memoria (contexto de borrador adicional), lo que debe tenerse en cuenta al planificar el hardware.
- El nivel Q5 no se publica, lo que significa que la escalera de cuantización es limitada: solo Q4 y Q6. Si se necesita un punto intermedio, no está disponible.
- La licencia Apache 2.0 permite uso comercial, pero se aplica la licencia del modelo base (también Apache 2.0), que debe respetarse en cualquier derivado.
- No se indican sesgos conocidos específicos del modelo base, pero al ser un modelo entrenado en datos web, es probable que herede sesgos comunes de género, raza o ideología. No hay información al respecto en la documentación.

## Enlaces

- Repositorio HuggingFace: [lmcoleman/Qwen3.8-27B-MagicQuant-GGUF](https://huggingface.co/lmcoleman/Qwen3.8-27B-MagicQuant-GGUF)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Repositorio de MagicQuant: [github.com/lucasmcoleman/MagicQuant](https://github.com/lucasmcoleman/MagicQuant)
- Wiki de metodología MagicQuant: [github.com/magiccodingman/MagicQuant-Wiki](https://github.com/magiccodingman/MagicQuant-Wiki)
- Repo hermano con builds AMD-native (ROCmFPX): [lmcoleman/Qwen3.8-27B-ROCmFPX-GGUF](https://huggingface.co/lmcoleman/Qwen3.8-27B-ROCmFPX-GGUF)
