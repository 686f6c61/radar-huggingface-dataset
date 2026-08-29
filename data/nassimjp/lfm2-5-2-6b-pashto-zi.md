# nassimjp/LFM2.5-2.6B-Pashto-Zi

## Resumen

LFM2.5-2.6B-Pashto-Zi es una extensión de tokenizador y de capas de embedding sobre el modelo base LiquidAI/LFM2.5-2.6B, desarrollada por nassimjp. El objetivo es dotar al tokenizador original de tokens individuales para caracteres del pastún y otros signos de escritura árabe que estaban fragmentados en múltiples identificadores, así como de numerales orientales. El modelo base es un transformer denso de 2.600 millones de parámetros, con ventana de contexto de 128.000 tokens y capacidades de agente y tool calling, publicado por Liquid AI en agosto de 2026.

Esta versión concreta no ha sido sometida a ningún entrenamiento adicional: únicamente se han añadido 22 entradas nuevas al vocabulario (de 125.017 a 125.039) y se han inicializado sus vectores de embedding de forma independiente. Por tanto, el modelo no ha aprendido todavía representaciones lingüísticas del pastún; sirve como base experimental para futuros procesos de continuación de preentrenamiento o ajuste en ese idioma. Su relevancia radica en facilitar la investigación de modelos de lenguaje para pastún, un idioma con escasos recursos, partiendo de un modelo eficiente y orientado a agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LFM2.5) |
| Parametros totales | 2.691.134.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en bfloat16) |
| Idiomas soportados | Pastún y urdu (por los tokens añadidos); el modelo base soporta múltiples idiomas, pero no se especifican |
| Licencia | Apache 2.0 (declarada en el repositorio); el modelo base usa LFM Open License (lfm1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B, un transformer denso de 2.600 millones de parámetros con atención estándar y una ventana de contexto de 128.000 tokens, diseñado para cargas de trabajo agénticas con tool calling nativo. Sobre esta base, el autor realizó una "cirugía de tokenizador": auditaron 81 átomos de escritura pastún y árabe, de los cuales 22 no existían como tokens independientes. Se añadieron esos 22 tokens al vocabulario, se redimensionaron las matrices de embedding de entrada y salida (que comparten almacenamiento) desde 128.000 hasta 125.039 filas, y se inicializaron las nuevas filas con un rango de 0,02 y dimensión 2048.

No hubo entrenamiento posterior. Los nuevos embeddings se inicializaron de forma independiente, verificándose que no hay filas duplicadas y que la similitud coseno máxima entre ellos es de 0,0665. El proceso incluyó comprobaciones forenses de integridad (tamaño de vocabulario, forma de las matrices, ausencia de corrupción de índices) y el modelo se guardó y recargó correctamente desde Hugging Face. Para que los nuevos tokens adquieran significado lingüístico, se requiere continuación de preentrenamiento o ajuste con corpus en pastún.

## Capacidades

- Generación de texto causal (causal LM) con el tokenizador extendido, que ahora reconoce caracteres pastún como ښ, څ, ځ, ڼ, ږ, ډ, ټ, ړ, ۍ, ې, ګ, ۀ, así como numerales orientales (۴, ۵, ۶, ۷, ۸, ۹).
- Tool calling y ejecución de tareas multi-paso, heredadas del modelo base LFM2.5-2.6B, que está optimizado para agentes en dispositivo.
- Razonamiento y planificación de agentes, según las especificaciones del modelo base.
- Soporte de contexto largo (128K tokens), útil para conversaciones extensas o documentos largos.
- Capacidades multilingües del modelo base, aunque no se detallan los idiomas concretos.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Investigación en PLN para pastún: el modelo sirve como punto de partida para experimentos de continuación de preentrenamiento con corpus pastún, evaluando si los nuevos tokens mejoran la eficiencia de tokenización y la calidad de las representaciones.
- Evaluación de tokenizadores: permite comparar la tokenización de textos pastún antes y después de la extensión, midiendo el número de tokens generados y la coherencia de los caracteres.
- Desarrollo de asistentes conversacionales en pastún: tras un ajuste supervisado (SFT) o instrucción, el modelo podría emplearse en chatbots para hablantes de pastún, aprovechando su ventana de 128K para mantener contexto largo.
- Generación de código con comentarios o documentación en pastún: el modelo base tiene capacidades de código; con el tokenizador extendido, podría procesar mejor texto técnico que incluya caracteres pastún.
- Pruebas de eficiencia en dispositivos móviles: al ser un modelo de 2.6B, puede desplegarse en teléfonos (el base alcanza ~30 tok/s), y la extensión permite probar su comportamiento con entradas en pastún en entornos de bajo consumo.
- Base para ajuste con tool calling en pastún: dado que el modelo base soporta tool calling, se podría adaptar para agentes que operen en entornos donde el pastún sea el idioma de interacción, siempre que se entrene previamente con datos pastún.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta extensión. El modelo base LFM2.5-2.6B reporta un rendimiento de ~220 tokens por segundo en Apple M5 Max y ~30 tokens por segundo en teléfono, con un peso inferior a 2,5 GB, pero no se dispone de métricas de calidad (MMLU, HumanEval, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 2.6B en bfloat16, el peso ocupa aproximadamente 5,4 GB en disco; en inferencia con cuantización a 4 bits podría caber en ~2,5 GB de VRAM, según los datos del modelo base.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bfloat16 sin cuantizar; con cuantización, GPUs de 4 GB podrían ser suficientes. Ejemplos: RTX 3060, RTX 4060, A10G, o Apple Silicon (M1/M2/M3/M4/M5).
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas de gama media con cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El modelo base se distribuye también en GGUF, MLX y ONNX, aunque este repositorio solo incluye safetensors.
- Latencia y throughput: el modelo base alcanza ~220 tok/s en Apple M5 Max y ~30 tok/s en teléfono; se espera un rendimiento similar en esta variante, ya que la extensión de vocabulario no altera la arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-2.6B (base) | 2.6B | 128K | Sí | LFM Open License (lfm1.0) | Hugging Face |
| nassimjp/LFM2.5-2.6B-Pashto-Zi | 2.6B | 128K | Sí (heredado) | Apache 2.0 (declarada) | Hugging Face |
| nassimjp/LFM2.5-1.2B-Base-Pashto | 1.2B | No disponible | No disponible | lfm1.0 | Hugging Face |

No se dispone de otros modelos comparables específicos para pastún en la información proporcionada. La diferencia principal con el base es la ampliación del vocabulario en 22 tokens, sin entrenamiento adicional.

## Limitaciones y advertencias

- Los 22 tokens nuevos no han sido entrenados; sus embeddings son inicializaciones aleatorias, por lo que el modelo no comprende el pastún y puede producir salidas incoherentes si se le pide generar en ese idioma.
- La licencia declarada en el repositorio (Apache 2.0) difiere de la del modelo base (LFM Open License, lfm1.0). Es necesario verificar qué términos se aplican realmente al uso comercial y a la redistribución, ya que la extensión se basa en un modelo con licencia más restrictiva.
- El modelo base puede presentar sesgos y alucinaciones inherentes a su entrenamiento; esta variante no los corrige.
- No se han realizado evaluaciones de seguridad o sesgo específicas para esta extensión.
- El repositorio no incluye cuantizaciones ni formatos alternativos (GGUF, ONNX, MLX), lo que limita su despliegue directo en algunos entornos.
- Para uso en producción con pastún, es imprescindible un entrenamiento adicional; sin él, el modelo no es fiable para tareas reales en ese idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nassimjp/LFM2.5-2.6B-Pashto-Zi
- Documentación del modelo base: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Página de LLM Releases: https://www.llm-releases.com/models/lfm2-5-2-6b
- Repositorio relacionado (variante 1.2B): https://huggingface.co/nassimjp/LFM2.5-1.2B-Base-Pashto
