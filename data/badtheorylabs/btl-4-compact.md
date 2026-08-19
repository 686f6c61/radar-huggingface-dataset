# badtheorylabs/BTL-4-Compact

## Resumen

BTL-4-Compact es una edición cuantizada del modelo BTL-4, desarrollado por Bad Theory Labs, pensada para ejecutarse en hardware de consumo. BTL-4 es un modelo de mezcla de expertos (MoE) con 35.100 millones de parámetros totales, de los cuales solo unos 2.100 millones se activan por token, lo que combina la capacidad de un modelo grande con el coste computacional de uno pequeño. Esta versión Compact reduce el peso completo a un único archivo GGUF de 9,96 GB con una cuantización de 2,30 bits por peso, conservando el 94,1 % del comportamiento medido del modelo original en una batería de 118 pruebas.

El modelo está diseñado para tareas agénticas y uso de herramientas, con soporte nativo para tool calling y razonamiento multi-paso. Su arquitectura híbrida combina 30 capas de atención lineal con 10 capas de atención completa, lo que permite una ventana de contexto nativa de 262 144 tokens con un coste de caché KV de aproximadamente 20 KB por token. Se distribuye bajo licencia Apache-2.0 y se integra con llama.cpp, Ollama y LM Studio, lo que lo convierte en una opción práctica para desarrolladores que necesitan un modelo agéntico de alto rendimiento sin requerir infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención híbrida: 30 capas de atención lineal y 10 de atención completa |
| Parametros totales | 35,1B (34,7B excluyendo la torre de visión) |
| Parametros activos | ~2,1B por token |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | IQ2_XXS (2,0625 bpw) para los tensores de expertos; Q4_K_M para el resto; router y normalizaciones en f32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un solo archivo de 9,96 GB) |

## Arquitectura y entrenamiento

BTL-4 emplea una arquitectura MoE con 256 expertos por capa, de los cuales se seleccionan 8 por token mediante un router. El modelo tiene 40 capas en total: 30 utilizan atención lineal (probablemente basada en mecanismos tipo GLA o similar) y 10 utilizan atención completa con 2 cabezas KV. Esta combinación reduce el coste de la caché KV a unos 20 KB por token, de modo que la ventana completa de 262 144 tokens requiere aproximadamente 5,2 GB de caché, factible en hardware de consumo.

El entrenamiento del modelo base no se detalla en la información disponible: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La versión Compact se obtiene mediante cuantización con matriz de importancia (imatrix) calculada sobre un corpus de 3 MB de código fuente, documentación técnica y preguntas, lo que optimiza la retención para tareas de programación y razonamiento técnico. El router y las capas de normalización se mantienen en f32 para preservar la precisión en la selección de expertos. Además, se desactiva la capa de predicción multi-token (MTP) y se excluye la torre de visión, resultando en un modelo exclusivamente textual.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte para modo de razonamiento explícito (separado en `reasoning_content` mediante `--reasoning-format deepseek`).
- Tool calling y uso de herramientas: emite llamadas a funciones en un formato propio (`<tool_call><function=name><parameter=arg>`), compatible con pipelines agénticos.
- Soporte para agentes autónomos: el modelo puede mantener conversaciones multi-turno con uso de herramientas y seguimiento de estado a lo largo de contextos largos.
- Capacidades multilingües: no se especifican idiomas concretos, pero al estar basado en Qwen (según la referencia a `qwen3_5_moe`), es probable que herede un amplio soporte multilingüe; no obstante, este dato no está confirmado.
- Contexto largo: 262 144 tokens nativos, adecuado para procesar documentos extensos, historiales de conversación o repositorios de código completos.
- Generación de código y refactorización: el ejemplo de uso del README muestra una petición de refactorización de funciones, lo que indica capacidad para tareas de ingeniería de software.

## Casos de uso

- Agentes autónomos de software: el modelo puede planificar y ejecutar tareas multi-paso, llamando a herramientas externas (intérpretes, APIs, editores) gracias a su soporte de tool calling y su ventana de contexto amplia. Su bajo coste por token activo permite iteraciones rápidas en entornos de desarrollo.
- Asistente de programación en producción: integrable en IDEs o pipelines de CI/CD para generar, revisar y refactorizar código. La cuantización con imatrix sobre corpus técnico preserva la precisión en tareas de código, y el formato GGUF permite su uso con llama.cpp u Ollama en máquinas de desarrollo.
- Extracción de información de documentos extensos: con 262K de contexto, puede procesar manuales, informes o contratos completos y extraer datos estructurados, manteniendo la fidelidad en tareas de extracción (100 % de retención en pruebas de extracción fundamentada).
- Atención al cliente con historial largo: el modelo puede gestionar conversaciones multi-turno con contexto acumulado de días o semanas, gracias a su caché KV eficiente y su capacidad de razonamiento. Su formato de tool calling permite conectarlo a bases de conocimiento o sistemas de ticketing.
- Razonamiento sobre premisas falsas: el README indica una retención del 87,2 % en rechazo de premisas falsas, lo que lo hace útil para sistemas de verificación de afirmaciones o detección de información incorrecta en textos.
- Despliegue en hardware modesto: al caber en un archivo de 9,96 GB, puede ejecutarse en una GPU de consumo con 12 GB de VRAM o incluso en CPU con llama.cpp, lo que permite prototipar agentes locales sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README reporta una retención comportamental medida sobre 118 ítems en los que el modelo en bf16 es correcto, con los siguientes resultados:

| Categoría | Retención |
|---|---|
| Preguntas factuales de respuesta corta | 95,0 % |
| Extracción fundamentada | 100 % |
| Rechazo de premisas falsas | 87,2 % |
| Global | 94,1 % |

El margen de error del gate se estima en ±3,4 puntos, por lo que diferencias menores a esa cifra deben considerarse ruido. No se dispone de comparaciones con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 9,96 GB. Con una ventana de contexto de 8K, la caché KV adicional es de ~160 MB (20 KB/token × 8192), más overhead de activaciones, por lo que cabría en una GPU con 12 GB de VRAM (p. ej., RTX 3060, RTX 4070). Para contexto de 32K, la caché KV sube a ~640 MB, aún manejable en 12 GB. Con la ventana completa de 262K, la caché KV alcanza ~5,2 GB, lo que requeriría al menos 16 GB de VRAM.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A10, A100 o H100 si se necesita mayor throughput.
- En CPU: es posible ejecutarlo con llama.cpp, aunque la velocidad será significativamente menor; se recomienda para pruebas o tareas no interactivas.
- Opciones de despliegue: llama.cpp (con soporte `qwen3_5_moe`), Ollama, LM Studio. También puede usarse con servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no se proporcionan datos específicos. Al ser un MoE con solo ~2,1B parámetros activos, el throughput por token debería ser similar al de un modelo de ~2B denso, pero con la memoria de un modelo de 35B. En una GPU moderna, se esperan decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos. A nivel estructural, puede compararse con otros MoE de tamaño similar:

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| BTL-4-Compact | 35,1B | ~2,1B | 262 144 | Apache-2.0 | GGUF |
| Qwen3-30B-A3B (referencia) | 30B | 3B | 262 144 (típico) | Apache-2.0 | Varios |
| Mixtral 8x7B | 46,7B | 12,9B | 32 768 | Apache-2.0 | Varios |

La comparación es orientativa; no se han ejecutado los mismos benchmarks sobre BTL-4-Compact, por lo que no se puede afirmar superioridad o inferioridad en tareas concretas.

## Limitaciones y advertencias

- La cuantización a 2,30 bits por peso es agresiva; aunque la retención medida es del 94,1 %, puede haber degradación en tareas no cubiertas por la batería de pruebas, especialmente en razonamiento complejo o generación creativa.
- El modelo no incluye la torre de visión: es exclusivamente textual, a pesar de que el modelo base la tiene.
- La capa MTP (multi-token prediction) está deshabilitada; esto no afecta a la generación normal, pero elimina la posibilidad de decodificación especulativa basada en esa cabecera.
- Requiere flags específicos en llama.cpp: `--jinja` y `--reasoning-format deepseek` son obligatorios para el correcto funcionamiento de tool calling y razonamiento. No usar `--chat-template` para no sobrescribir la plantilla incrustada.
- El formato de tool calls es propietario (`<tool_call><function=...>`), por lo que puede no ser compatible con frameworks que esperan el formato JSON estándar de Qwen.
- No se especifican los idiomas soportados; aunque probablemente herede el multilingüismo de Qwen, no está confirmado.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base si se redistribuyen modificaciones.
- No hay información sobre sesgos o alucinaciones específicas; como todo modelo generativo, existe riesgo de producir información falsa o inventada, especialmente en dominios poco representados en el corpus de cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/badtheorylabs/BTL-4-Compact
- Modelo base (pesos completos): https://huggingface.co/badtheorylabs/BTL-4
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
