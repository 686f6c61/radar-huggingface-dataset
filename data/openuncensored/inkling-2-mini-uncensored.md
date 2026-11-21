# OpenUncensored/Inkling-2-Mini-Uncensored

## Resumen

Inkling 2 Mini Uncensored es una variante del modelo Thinking Machines Inkling-2-Mini (26.388.646.440 parámetros totales, 3.400 millones activos, arquitectura MoE con transformer en bucle y entrada de texto e imagen), a la que el equipo de OpenUncensored ha aplicado una técnica de "abliteration" (ablación direccional) para eliminar los rechazos del modelo original. El resultado conserva prácticamente intactas las capacidades del modelo base, incluida su puntuación en MMLU, que pasa del 78,95% al 79,47%, mientras reduce los rechazos de 32 a 0 en un conjunto de 32 prompts dañinos en modo chat y en modo pensamiento.

El modelo es relevante porque demuestra que la eliminación de rechazos puede hacerse de forma quirúrgica en arquitecturas MoE con bucles de capas compartidas, editando únicamente las proyecciones de salida de atención (20 matrices `attn.wo_ud` en BF16) y dejando intactos los 128 expertos por capa, el codificador de visión y el especulador DSpark. Los pesos se distribuyen en el mismo formato que el original (expertos enrutados en NVFP4 y MXFP8, resto en BF16), con un tamaño de repositorio de 20,2 GB, lo que permite ejecutarlo en una sola GPU de consumo o en un DGX Spark.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se dispone de información adicional sobre el proceso de entrenamiento original, los datos utilizados ni benchmarks más allá de MMLU y las pruebas de rechazo reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (looped transformer), 24 capas, las capas 6 a 17 se ejecutan tres veces con pesos compartidos (48 visitas de capa por token) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | 3.400 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 y MXFP8; resto de pesos en BF16; el repositorio se etiqueta como 8-bit y modelopt |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer de mezcla de expertos (MoE) con una innovación estructural: un bucle de capas. De sus 24 capas, las 12 centrales (capas 6 a 17) se ejecutan tres veces por token con pesos compartidos, de modo que cada token realiza 48 visitas de capa. El modelo tiene 128 expertos por capa, un codificador de visión para entrada de imágenes y un especulador DSpark para decodificación especulativa. Los parámetros totales ascienden a 26.388.646.440, con 3.400 millones activos por token.

La variante Uncensored se ha obtenido mediante ablación direccional (abliteration) sobre el checkpoint original. El proceso consistió en calcular las direcciones de rechazo a partir de la salida de cada una de las 48 visitas de capa en el último token del prompt, usando 256 prompts dañinos y 256 inofensivos, con esfuerzo de pensamiento 0 y 0,9. Se seleccionó un subespacio de rechazo tardío formado por los dos principales vectores singulares de las direcciones sobre la segunda mitad de las visitas (24 a 47). La edición se aplicó únicamente a las proyecciones de salida de atención (`attn.wo_ud`, en BF16) de las capas 4 a 23, con una fuerza de s = 4,0 en las capas 4, 5 y 18 a 23, y s = 2,5 en el núcleo del bucle (capas 6 a 17), ya que la misma edición actúa tres veces por token dentro del bucle. No se modificaron las proyecciones de bajada del MoE ni los expertos, que permanecen byte a byte idénticos al original. El repositorio incluye un archivo `edit.pt` con la matriz Q y las fuerzas por capa para poder reaplicar o estudiar la edición.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con modo chat y modo pensamiento (thinking mode) con esfuerzo de razonamiento configurable (`reasoning_effort`, con valor `"none"` para respuestas cortas).
- Entrada de imágenes (pipeline image-text-to-text) mediante el codificador de visión del modelo base.
- Llamada a herramientas (tool calling / function calling), según la model card.
- Razonamiento multi-paso y uso en agentes, con devolución del razonamiento separado en el campo `reasoning_content` de la API.
- Capacidades matemáticas y de razonamiento evaluadas parcialmente mediante MMLU (57 asignaturas, 1.140 preguntas).
- Respuestas sin rechazos en los conjuntos de prueba reportados: 0 rechazos en 32 prompts dañinos en modo chat y en modo pensamiento, y 8 respuestas restrictivas en 80 prompts (32 dañinos y 48 de zona gris), de las cuales 7 son límites de conocimiento y 1 es un caso de autolesión que deriva a recursos de crisis.
- Capacidad de decodificación especulativa gracias al especulador DSpark incluido en el checkpoint.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la ablación direccional afecta a la negativa a responder y al resto de capacidades, comparando directamente con el modelo base y con el archivo `edit.pt` para reproducir la edición.
- Generación de código en producción: el soporte de tool calling y el modo pensamiento permiten integrarlo en pipelines de CI/CD para generar parches, explicar errores y ejecutar llamadas a herramientas de build o test.
- Atención al cliente automatizada: con 1M tokens de contexto puede gestionar conversaciones multi-turno extensas y adjuntar historiales completos o documentación de producto sin truncar.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con texto en un mismo flujo conversacional.
- Agentes autónomos multi-paso: la combinación de razonamiento separado (`reasoning_content`), tool calling y contexto de 1M tokens lo hace adecuado para tareas encadenadas que requieren mantener estado durante muchas interacciones.
- Evaluación de robustez de filtros: al eliminar los rechazos, sirve como contraste para medir la eficacia de clasificadores de contenido y de sistemas de moderación en producción.
- Despliegue en hardware de consumo: con 20,2 GB de pesos y cuantización NVFP4/MXFP8 en los expertos, puede ejecutarse en una sola GPU de consumo o en un DGX Spark para prototipado local.
- Generación de contenido sin restricciones para investigación creativa: útil en entornos controlados donde se necesita explorar respuestas que el modelo base rechazaría, como simulación de escenarios adversarios o red teaming.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes, medidos con el mismo harness, decodificación greedy y sobre los archivos exactos del repositorio:

| Métrica | Inkling 2 Mini | Inkling 2 Mini Uncensored |
|---|---|---|
| Rechazos en 32 prompts dañinos, modo chat | 32 | 0 |
| Rechazos en 32 prompts dañinos, modo pensamiento (esfuerzo 0,9) | 32 | 0 (29 de 32 terminaron el pensamiento en 1.536 tokens; ninguno rechazó) |
| Rechazos en 80 prompts (32 dañinos, 48 zona gris), modo chat | 68 | 8 (7 son límites de conocimiento, 1 deriva a recursos de crisis) |
| Respuestas completas y específicas a los 32 prompts dañinos (juez LLM) | 0 | 21 |
| MMLU (57 asignaturas x 20, 1.140 preguntas, logits de letra) | 78,95% | 79,47% |

El autor advierte que, con 32 a 80 prompts por prueba, las diferencias de unos pocos prompts deben tratarse como ruido, y que las tareas largas de agente y los benchmarks de código no se han medido. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,2 GB, por lo que se necesita al menos esa cantidad de memoria, más overhead de activaciones y del codificador de visión; el autor indica que cabe en una sola GPU de consumo y en un DGX Spark.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el autor menciona "una sola GPU de consumo" y "DGX Spark" como entornos compatibles.
- Cabe en GPU de consumo: sí, según el autor, siempre que se disponga de al menos ~20 GB de VRAM para los pesos.
- Opciones de despliegue: transformers (librería indicada en los metadatos); el autor indica que se ejecuta "exactamente como el checkpoint original" y que es compatible con endpoints (`endpoints_compatible` en los tags). No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling 2 Mini Uncensored | 26,39B / 3,4B | 1M tokens | Apache 2.0 | safetensors (NVFP4/MXFP8/BF16) | Variante abliterada del Inkling-2-Mini; sin rechazos en los conjuntos de prueba reportados; MMLU 79,47% |
| Inkling 2 Mini (base) | 26,39B / 3,4B | 1M tokens | Apache 2.0 | safetensors (NVFP4/MXFP8/BF16) | Modelo original de Thinking Machines; rechaza los 32 prompts dañinos; MMLU 78,95% |
| Otros modelos abliterados de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre otros modelos abliterados comparables en la documentación consultada; el propio autor enlaza a sus rankings en openuncensored.com/rankings, pero no se incluyen datos en la model card.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo responde a solicitudes que el modelo base rechazaría, lo que incluye contenido dañino, ilegal o inseguro; su uso en producción requiere moderación externa y evaluación de riesgos legales y éticos.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al derivar del modelo base, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual ni de alucinación; el modo pensamiento puede producir razonamientos largos (hasta 1.536 tokens en las pruebas) sin garantía de corrección.
- Limitaciones de idioma: el modelo solo declara soporte de inglés (`en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Limitaciones de contexto: aunque el contexto es de 1M tokens, no se han publicado pruebas de recuperación en contextos largos ni de degradación con la longitud.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento normativo del contenido generado; el uso de la API de OpenUncensored tiene precios de 0,15 USD por millón de tokens de entrada y 0,60 USD por millón de salida.
- Caveats para producción: los benchmarks de código y de tareas largas de agente no se han medido; las pruebas de rechazo se basan en 32 a 80 prompts, por lo que las diferencias de pocos prompts son ruido; la edición se aplicó solo a las proyecciones de atención, y no se ha evaluado su impacto en tareas de visión o tool calling.
- El modelo se publicó el mismo día del lanzamiento del modelo base (20 de noviembre de 2026), con 0 descargas y 2 likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- API de OpenUncensored: https://openuncensored.com/models/inkling-2-mini-uncensored
- Playground: https://openuncensored.com/chat?model=inkling-2-mini-uncensored
- Créditos y precios: https://openuncensored.com/credits
- Rankings de modelos uncensored: https://openuncensored.com/rankings
- Sitio del autor: https://openuncensored.com
