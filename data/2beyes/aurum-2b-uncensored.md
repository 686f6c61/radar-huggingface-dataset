# 2Beyes/Aurum-2B-Uncensored

## Resumen

Aurum 2B v1 Uncensored es un ajuste fino del modelo oficial Qwen3.5-2B de Alibaba Qwen, publicado por el usuario independiente 2Beyes. Se trata de una variante "abliterated": se ha eliminado la dirección del espacio latente asociada al comportamiento de rechazo, de modo que el modelo responde a solicitudes dañinas que el original declinaría. Conserva intactos el torreón de visión, la plantilla de chat y la ventana de contexto de 262.144 tokens del modelo base.

El modelo tiene 2.274.069.824 parámetros en precisión BF16 y se distribuye en safetensors (4,6 GB de repositorio) y, por separado, en cuantizaciones GGUF. La relevancia de esta ficha es doble: por un lado, documenta una técnica de eliminación de rechazo (abliteration) aplicada a un modelo multimodal pequeño; por otro, sirve como evidencia de que el ajuste apenas degrada el conocimiento del original (MMLU, GSM8K y MMLU-Redux iguales o superiores) y mejora el tool calling (BFCL v3: 69,3 frente a 63,3).

Es importante subrayar que el modelo está explícitamente descensurado: no rechaza peticiones dañinas, y el autor declina toda responsabilidad sobre el uso. La licencia Apache-2.0 permite uso comercial, pero la ausencia de salvaguardas lo hace inadecuado para despliegues orientados al público sin capas de moderación externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-2B |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (safetensors); GGUF Q4_K_M verificado en benchmarks; otras cuantizaciones GGUF en el repo hermano |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B: un transformer denso de 2.274 millones de parámetros con torreón de visión para entrada image-text-to-text. Aurum no reentrena el modelo ni modifica su arquitectura; aplica una edición direccional sobre los pesos. El procedimiento, descrito en la model card, consiste en calcular la dirección media del estado oculto cuando el modelo oficial se dispone a rechazar (a partir de 323 prompts dañinos de mlabonne/harmful_behaviors y 323 prompts inofensivos de mlabonne/harmless_alpaca) y restar esa dirección del modelo base. Es la técnica conocida como abliteration, sin RLHF ni DPO adicionales.

El resultado se valida con divergencia KL frente al Qwen3.5-2B oficial: 0,019, aproximadamente la mitad que las otras variantes descensuradas de 2B comparadas (0,040-0,050). Según el autor, esto indica que el ajuste modifica menos la distribución del modelo que las alternativas. Los detalles completos del pipeline de edición no están publicados en el texto disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.5-2B.
- Comprensión de imágenes (image-text-to-text): gráficos, colores, conteo, matemáticas visuales, lectura de texto en imagen y posiciones.
- Tool calling / function calling, con rendimiento BFCL v3 superior al modelo oficial (69,3 frente a 63,3).
- Conversación multi-turno con contexto de hasta 262.144 tokens.
- Respuesta a prompts dañinos sin rechazo (0 rechazos en 1.113 prompts de prueba según el autor).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos de razonamiento extendido (thinking) ni capacidades de audio.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se distribuye la dirección de rechazo en el espacio latente y evaluar la eficacia de la abliteration como técnica de edición de pesos, comparando la divergencia KL con el original.
- Red teaming y evaluación de filtros: sirve como generador de prompts dañinos controlado para probar clasificadores de contenido y sistemas de moderación en pipelines propios, dado que responde a solicitudes que el modelo base rechaza.
- Análisis de imágenes en entornos internos: con 262.144 tokens de contexto y torreón de visión, puede procesar documentos escaneados o gráficos largos en flujos de extracción de datos donde no se requiere moderación de contenido.
- Asistente de tool calling en agentes: su BFCL v3 de 69,3 y su tamaño de 2B lo hacen viable para orquestar llamadas a funciones en entornos con recursos limitados, integrándose en frameworks de agentes vía API compatible con endpoints.
- Prototipado rápido en hardware de consumo: con cuantización Q4_K_M corre a 111 tokens/s en una AMD RX 6600 de 8 GB, lo que permite iterar en local sobre tareas de visión y texto sin infraestructura dedicada.
- Generación de contenido sin restricciones para investigación creativa: escritura de ficción o escenarios que el modelo base declinaría, siempre que el operador asuma la responsabilidad legal y ética del output.

## Benchmarks y rendimiento

Todos los modelos se ejecutaron como Q4_K_M en llama.cpp (build 12289) con ajustes idénticos en la misma máquina. Los datos proceden de la model card del autor.

| Benchmark | Aurum 2B | Qwen3.5-2B oficial |
|---|---|---|
| Rechazos en 613 prompts dañinos (AdvBench, StrongREJECT, HarmBench) | 0 | 452 |
| Rechazos en 500 prompts inofensivos (XSTest, OR-Bench-Hard) | 0 | 110 |
| Divergencia KL frente al original | 0,019 | referencia |
| BFCL v3 (media) | 69,3 | 63,3 |
| GSM8K (subconjunto de 100) | igual o superior al oficial | referencia |
| MMLU (subconjunto de 200) | igual o superior al oficial | referencia |
| MMLU-Redux | igual o superior al oficial | referencia |
| GPQA Diamond | inferior al oficial | referencia |
| Velocidad (AMD RX 6600, 8 GB, Vulkan) | 111 tokens/s | no disponible |

El autor advierte que las cifras del modelo oficial usan BF16, razonamiento largo y otros harnesses, por lo que no son directamente comparables. Los valores numéricos exactos de GSM8K, MMLU, MMLU-Redux, IFEval y GPQA Diamond están en las imágenes de resultados del repositorio, no en el texto disponible.

## Requisitos de hardware

- VRAM estimada: unos 4,6 GB en BF16; aproximadamente 1,5-2 GB en Q4_K_M (estimación a partir del tamaño del repositorio y del uso verificado en 8 GB).
- GPU recomendadas: cualquier GPU con 8 GB o más para Q4_K_M (RX 6600 verificada); 6-8 GB para cuantizaciones de 4 bits; 8-10 GB para BF16 en consumer.
- Cabe en GPU de consumo: sí, en RTX 3060/4060, RX 6600 y superiores con cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (verificado), GGUF en el repo hermano, transformers con safetensors; no se documenta soporte verificado de vLLM, TGI ni Ollama.
- Latencia y throughput: 111 tokens/s en decodificación sobre AMD RX 6600 (8 GB) vía Vulkan, todas las capas en GPU, sin decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (613 dañinos) | KL vs original | Licencia |
|---|---|---|---|---|---|
| Aurum 2B Uncensored | 2,27 B | 262.144 | 0 | 0,019 | Apache-2.0 |
| Qwen3.5-2B (oficial) | 2,27 B | 262.144 | 452 | referencia | Apache-2.0 |
| Qwen3.5-2B-Uncensored-HauhauCS-Aggressive | 2,27 B | no disponible | no disponible | 0,040-0,050 (rango del grupo) | no disponible |
| Huihui-Qwen3.5-2B-abliterated | 2,27 B | no disponible | no disponible | 0,040-0,050 (rango del grupo) | no disponible |
| Qwen3.5-2B-heretic | 2,27 B | no disponible | no disponible | 0,040-0,050 (rango del grupo) | no disponible |

Los tres modelos alternativos son variantes descensuradas de Qwen3.5-2B publicadas en Hugging Face. El autor sitúa su divergencia KL en el rango 0,040-0,050 para el conjunto, sin desglose individual en el texto disponible.

## Limitaciones y advertencias

- Modelo descensurado por diseño: no rechaza solicitudes dañinas. El autor advierte explícitamente que el usuario es responsable del uso y del output.
- Riesgo elevado de generar contenido dañino, ilegal o éticamente problemático sin filtros externos; requiere capas de moderación propias en cualquier despliegue.
- GPQA Diamond por debajo del modelo oficial: el razonamiento científico avanzado se degrada con la edición.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al heredar el modelo base, es previsible que arrastre sus sesgos, pero no hay medición publicada.
- Alucinación: no se han publicado métricas específicas de factualidad; el tamaño de 2B implica mayor propensión a errores factuales que modelos mayores.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de salvaguardas puede incumplir políticas de plataformas o normativas sectoriales.
- Las cifras de benchmarks del autor no son directamente comparables con las del modelo oficial por diferencias de harness y precisión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2Beyes/Aurum-2B-Uncensored
- GGUF: https://huggingface.co/2Beyes/Aurum-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF del base (unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Alternativa HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive
- Alternativa Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- GGUF de Huihui (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-2B-abliterated-GGUF
- Alternativa Heretic: https://huggingface.co/jordanwoodson/Qwen3.5-2B-heretic-GGUF
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- HarmBench: https://github.com/centerforaisafety/HarmBench
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
