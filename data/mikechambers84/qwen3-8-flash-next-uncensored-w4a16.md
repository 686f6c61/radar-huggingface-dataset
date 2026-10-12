# mikechambers84/Qwen3.8-Flash-Next-Uncensored-W4A16

## Resumen

Qwen3.8-Flash-Next-Uncensored-W4A16 es una compilación cuantizada del modelo abliterado (sin mecanismos de rechazo) Qwen3.8-Flash-Next-Uncensored, que a su vez es un ajuste del Qwen/Qwen3.8-Flash-Next desarrollado por el equipo Qwen. El autor de esta versión es el usuario mikechambers84, que publica pesos ya cuantizados a partir de los pesos BF16 de origen. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 180.000 millones de parámetros totales, con unos 6.000 millones activos por token, que combina una torre de visión con un tronco de lenguaje de atención híbrida.

La relevancia de esta ficha concreta está en su estrategia de cuantización selectiva: solo se cuantizan a INT4 los expertos enrutados (73.728 matrices), mientras que el resto de tensores, incluida la tabla de embeddings n-gram PLE, la cabeza MTP, la atención lineal Gated DeltaNet, la atención dispersa QSA y la torre de visión, se conservan en BF16. Eso reduce el repositorio de unos 336 GB a aproximadamente 174 GiB sin tocar los componentes que más se degradan con cuantizaciones agresivas.

El modelo base declara soporte de razonamiento flexible, function calling, entrada de imagen y vídeo, y una ventana de contexto de 262.144 tokens según la insignia del model card. Al estar abliterado, carece de las capas de rechazo del modelo original, lo que lo orienta a investigación de seguridad, red teaming y entornos donde se necesita una postura de generación sin filtros. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida: 36 capas de atención lineal Gated DeltaNet + 12 capas de atención dispersa QSA (48 capas totales), torre de visión y cabeza MTP |
| Parámetros totales | 179.999.981.459 (≈180B; 125B del modelo principal + 51B de embeddings n-gram PLE según el repositorio oficial) |
| Parámetros activos | ≈6B por token (MoE de 512 expertos, top-10) |
| Longitud de contexto | 262.144 tokens (según la insignia del model card; no disponible confirmación en documentación oficial) |
| Tipos de cuantización | W4A16 en expertos enrutados (INT4 simétrico, grupo de 32, escalas BF16); resto de tensores en BF16 sin modificar |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` en variante `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atención híbrida. El tronco combina 36 capas de atención lineal Gated DeltaNet con 12 capas de atención dispersa QSA (que incluye un indexador propio), además de mezcladores de hiper-conexión. La capa MoE usa 512 expertos enrutados con enrutamiento top-10 y un experto compartido. Incluye una tabla de embeddings n-gram PLE de 51B de parámetros que no participa del cómputo por token y una cabeza MTP (multi-token prediction) que actúa como drafter para decodificación especulativa. La torre de visión está presente y se conserva intacta en esta compilación. El pipeline declarado es `image-text-to-text`.

Sobre el entrenamiento del modelo original no se ha proporcionado información en los materiales consultados: no hay datos sobre número de tokens, composición del dataset ni etapas de RLHF o DPO. El repositorio oficial de GitHub menciona que, comparado con Qwen3.7-Plus, Qwen3.8-Flash-Next reduce el coste de entrenamiento a aproximadamente 1/9 manteniendo capacidades superiores en código, pero no detalla la metodología.

La innovación concreta de esta compilación es la cuantización selectiva. El método es round-to-nearest sin datos de calibración (no se usa GPTQ ni AWQ). Cada peso se representa como `q × scale` con `q` en [-8, 7]. Para cada grupo de 32 pesos se busca la escala con el mismo criterio que el observador MSE de llm-compressor: se reduce el abs-max del grupo entre un 0 % y un 19 % en pasos del 1 % y se conserva la escala con el menor Σ|error|^2,4, deteniéndose tras 5 pasos sin mejora. Las activaciones permanecen en 16 bits y el checkpoint no define cuantización de caché KV. El desglose de tamaños publicado es: expertos enrutados 63,3 GiB, tabla PLE 95,4 GiB, drafter MTP 4,9 GiB, atención lineal 3,9 GiB, hiper-conexiones 1,2 GiB, embeddings de tokens y `lm_head` (no atados) 2 × 1,2 GiB, atención QSA 1,2 GiB, torre de visión 0,8 GiB, expertos compartidos 0,4 GiB y routers 0,1 GiB. Total aproximado: 174 GiB frente a los ~336 GB de la fuente BF16.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte declarado de modo de pensamiento flexible.
- Generación y razonamiento sobre código, con especial énfasis en capacidades de programación según la documentación oficial del modelo base.
- Procesamiento de imagen y vídeo como entrada (pipeline `image-text-to-text` y torre de visión preservada).
- Function calling y tool calling, etiquetado explícitamente en el model card.
- Decodificación especulativa mediante la cabeza MTP, que actúa como drafter interno.
- Conversación multi-turno con ventana de contexto larga (262K tokens según la insignia).
- Capacidades multilingües limitadas a inglés y chino según los metadatos de idioma.
- Al estar abliterado, genera respuestas sin las capas de rechazo del modelo original, lo que incluye contenido que el modelo base declinaría.
- Ajuste fino posterior viable sobre los tensores no cuantizados (torre de visión y cabeza MTP intactas).

## Casos de uso

- Red teaming y evaluación de seguridad: al no incorporar rechazos, permite medir de forma directa cómo se comportan los guardarraíles externos frente a peticiones adversarias y comprobar si los clasificadores de entrada/salida aguantan sin la ayuda del propio modelo.
- Investigación sobre cuantización de MoE: la compilación cuantiza únicamente los expertos enrutados y mantiene el resto en BF16, lo que la convierte en un punto de comparación controlado para medir la pérdida de calidad atribuible solo a los expertos frente al checkpoint BF16 de 336 GB.
- Fine-tuning y post-entrenamiento: los tensores no cuantizados (PLE, MTP, atención lineal, QSA, visión) se conservan íntegros, de modo que sirve como base para ajustes que necesiten preservar esas rutas, por ejemplo adaptación de la torre de visión a un dominio concreto.
- Análisis de documentos largos multimodales: con 262K tokens de contexto es viable procesar informes extensos con figuras y tablas incrustadas en una sola pasada, sin trocear el documento ni perder la referencia cruzada entre páginas.
- Asistentes de código integrados en CI/CD: el soporte de function calling permite conectar el modelo a herramientas de build, linters o gestores de incidencias, de forma que un agente pueda leer un fallo de pipeline y proponer o aplicar un parche.
- Procesamiento de vídeo para moderación o análisis de contenido: la torre de visión en BF16 admite flujos de imagen-texto donde se describen o clasifican secuencias de fotogramas con contexto textual largo asociado.
- Generación aumentada por recuperación sobre corpus técnicos: la combinación de contexto largo y decodificación especulativa MTP reduce el coste por consulta cuando se inyectan muchos fragmentos recuperados en el prompt.
- Investigación sobre decodificación especulativa: la cabeza MTP con sus 512 expertos se mantiene sin cuantizar, lo que permite estudiar la tasa de aceptación del drafter y su interacción con expertos cuantizados a INT4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los tensores: aproximadamente 174 GiB según el desglose publicado por el autor. La fuente BF16 equivalente ocupa unos 336 GB.
- VRAM estimada para inferencia: por encima de 174 GiB solo para pesos, más la caché KV en BF16 (el checkpoint no define cuantización de KV) y activaciones de 16 bits. En la práctica se necesitan al menos 180-200 GB de memoria agregada.
- GPU recomendadas: 3 × H100 80 GB o 3 × A100 80 GB como configuración mínima razonable con paralelismo de tensor. Dos GPU de 80 GB (160 GB) no son suficientes para los pesos.
- Alternativa con GPU de menor VRAM: 4 × RTX 6000 Ada (48 GB) suman 192 GB, lo que deja poco margen para caché KV en contextos largos; requeriría cuantizar la caché o limitar la longitud de secuencia.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) queda muy lejos del requisito, incluso con paralelismo de 2 o 4 unidades.
- Opciones de despliegue: el formato `compressed-tensors` `pack-quantized` es el que escribe llm-compressor y está soportado por vLLM. La librería declarada es transformers. Para llama.cpp u Ollama habría que recurrir a las compilaciones GGUF de terceros publicadas por otros autores, no a este checkpoint.
- Latencia y throughput: no disponibles. Como referencia estructural, solo ~6B de parámetros están activos por token, y la cabeza MTP permite decodificación especulativa, lo que debería reducir el coste por token respecto a un modelo denso de tamaño comparable, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-W4A16 (mikechambers84) | ~180B / ~6B | 262K según insignia | W4A16 en expertos, resto BF16 | Apache 2.0 | HuggingFace |
| Qwen3.8-Flash-Next (oficial) | ~180B / ~6B | 262K según insignia | BF16 | Apache 2.0 | HuggingFace |
| Qwen3.8-Flash-Next-Uncensored-FP8 (orcarouter) | ~180B / ~6B | no disponible | block-FP8 | Apache 2.0 | HuggingFace |
| Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF (cygnal) | ~180B / ~6B | no disponible | GGUF IQ4_XS / NGQ4 | no disponible | HuggingFace |
| Qwen3.8-Flash-Next-W4A16 (aixiaoma) | ~180B / ~6B | no disponible | W4A16 | no disponible | HuggingFace |

No se dispone de resultados de benchmarks que permitan comparar rendimiento entre estas variantes. La diferencia entre ellas es de formato de pesos, licencia declarada y disponibilidad; la variante FP8 se describe como equivalente al esquema oficial, mientras que las W4A16 aplican cuantización de solo pesos.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los mecanismos de rechazo, por lo que puede producir contenido dañino, ilegal o inseguro. No es apto para despliegue directo de cara al público sin un sistema de moderación externo.
- Idiomas: solo inglés y chino están declarados. El rendimiento en castellano y otras lenguas no está documentado y previsiblemente será inferior.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta compilación, y la cuantización INT4 de los expertos puede introducir degradación adicional no medida respecto al BF16.
- La cuantización es data-free (sin calibración) y usa solo round-to-nearest con búsqueda de escala tipo MSE; no hay evaluación publicada del impacto en calidad frente al checkpoint BF16, ni frente a esquemas como GPTQ o AWQ.
- La caché KV no está cuantizada, lo que limita el ahorro de memoria en contextos largos: con 262K tokens la caché puede ser un cuello de botella real.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo derivado de un base abliterado puede acarrear responsabilidad legal según jurisdicción y caso de uso.
- Adopción muy baja: 8 descargas y 2 likes en el momento de redactar esta ficha, sin señales de validación por parte de la comunidad.
- Procedencia de los pesos: se trata de una compilación de terceros sobre un modelo abliterado de terceros, no de una publicación oficial de Qwen. No hay verificación independiente publicada del proceso.
- La cifra de contexto de 262K proviene únicamente de la insignia del model card; no se ha podido confirmar en documentación oficial y conviene validarla empíricamente antes de dimensionar despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikechambers84/Qwen3.8-Flash-Next-Uncensored-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Variante FP8 de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-FP8
- Variante GGUF de cygnal: https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF
- Variante W4A16 de aixiaoma: https://huggingface.co/aixiaoma/Qwen3.8-Flash-Next-W4A16
- Ficha de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Sitio de OrcaRouter: https://www.orcarouter.ai
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Organización en GitHub del autor de la promoción: https://github.com/Continuum-AI-Corp
- Discord de OrcaRouter: https://discord.gg/yAh6Tex6kx
- Cuenta en X de OrcaRouter: https://x.com/OrcaRouter
