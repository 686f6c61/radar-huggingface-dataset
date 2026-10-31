# LuffyTheFox/Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-MTP-GGUF

## Resumen

Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-MTP-GGUF es una fusión comunitaria sin filtros (uncensored) publicada por el usuario independiente LuffyTheFox. El modelo parte de dos fuentes: la base sin filtros HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y el modelo de código Qwopus3.6-35B-A3B-Coder-MTP-GGUF de Jackrong, al que se le transfirieron datos de un ajuste fino con el dataset de Hermes (orientado a agentes). Sobre el resultado, el autor aplicó su propio postproceso denominado Genesis, un algoritmo de regeneración y calibración de tensores que, según su documentación, reduce el ruido acumulado en los pesos mediante un SVD personalizado sin reentrenar el modelo.

Se trata de un modelo MoE de la familia Qwen3.6 con 35,5 mil millones de parámetros totales, de los cuales aproximadamente 3 mil millones están activos por token (según la nomenclatura A3B). Es multimodal (pipeline image-text-to-text), está orientado a generación de código, matemáticas y razonamiento, y se distribuye en formato GGUF para inferencia local. Su relevancia radica en ofrecer un modelo local sin restricciones de alineación, con capacidades de código y agentes, pensado para ejecutarse en hardware de consumo gracias a su baja activación de parámetros. No existen datos oficiales de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basado en Qwen3.6, multimodal (image-text-to-text), con MTP (multi-token prediction) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (nomenclatura A3B; dato exacto no disponible) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles; tamaño de repo 84,6 GB) |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una mezcla de tres componentes. Primero, la base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, una versión sin filtros de un Qwen3.6 MoE de 35B con 3B de parámetros activos, que según el autor registra 0/465 negativas de respuesta en sus pruebas. Segundo, se transfirieron datos del ajuste fino DJLougen/hermes-qwen3.5-35b-a3b (entrenado sobre el dataset de Hermes para comportamiento agentico y tool calling) hacia la base sin filtros. Tercero, se incorporaron las capacidades de código del modelo Qwopus3.6-35B-A3B-Coder-MTP-GGUF de Jackrong. El sufijo MTP indica soporte de multi-token prediction, una técnica de decodificación especulativa que puede acelerar la generación.

El postproceso Genesis, aplicado por el autor, no constituye un entrenamiento adicional: es un algoritmo de calibración de tensores sobre el GGUF que opera en tres etapas: (1) reparación del balance entre cabezas en los tensores ssm_conv1d, que gestiona la memoria de contexto largo; (2) sustitución de chunks corruptos en tensores por los mejores chunks según la distribución de pesos; y (3) reducción de ruido mediante un SVD personalizado que preserva, según el autor, el 99% de la señal y el gradiente aprendido, excluyendo embeddings de tokens, pesos de salida, tensores 1D, bias y normalizaciones. El desarrollo se realizó con recursos limitados (Google Colab gratuito con Tesla T4). No hay detalles sobre el número de tokens del entrenamiento original ni sobre el uso de RLHF/DPO: no disponible.

## Capacidades

- Generacion de texto conversacional sin filtros (uncensored), con etiqueta thinking-off (modo de razonamiento desactivado por defecto).
- Generacion de codigo heredada del modelo Coder de Jackrong, orientada a programación.
- Razonamiento logico y matematicas (tags logic y math).
- Vision: pipeline image-text-to-text, acepta entrada de imágenes junto con texto (multimodal).
- Comportamiento agentico: transferencia de datos del finetune Hermes, con soporte esperado de tool calling y razonamiento multi-paso (el autor no documenta explícitamente el soporte de function calling: no disponible).
- Contexto largo (etiquetado long-context), aunque la ventana exacta no está especificada.
- Multilingüe: inglés y chino como idiomas principales, con soporte multilingüe adicional.
- Optimización de inferencia mediante MTP (multi-token prediction) para acelerar la generación.

## Casos de uso

- Generacion de codigo local sin filtros: permite escribir, refactorizar y depurar código sin las restricciones de alineación de los modelos comerciales, útil para entornos de desarrollo offline o con requisitos de privacidad.
- Asistentes agenticos con Hermes: gracias a la transferencia del finetune Hermes, puede integrarse en frameworks de agentes (por ejemplo, con tool calling) para automatizar flujos multi-paso como investigación web o gestión de tareas.
- Analisis de documentos con imagenes: al ser multimodal (image-text-to-text), puede describir capturas de pantalla, diagramas de arquitectura o capturas de errores de compilación y generar código correctivo a partir de ellas.
- Chatbot local sin restricciones de contenido: la base uncensored con 0/465 negativas lo hace adecuado para aplicaciones donde el filtrado de seguridad estándar interfiere con casos de uso legítimos (investigación, escritura creativa adulta, análisis de contenido sensible).
- Resolucion de problemas matematicos y logicos: los tags de math y logic indican entrenamiento orientado a razonamiento cuantitativo, aplicable a verificación de cálculos y resolución de problemas paso a paso.
- Inferencia en hardware de consumo: con solo ~3B de parámetros activos por token, es viable ejecutarlo en GPUs de gama alta domésticas para casos de uso de asistente personal privado.
- Procesamiento multilingüe: útil para aplicaciones que combinen inglés y chino, como traducción técnica o documentación bilingüe de proyectos de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona puntuaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica estandarizada; la única cifra de validación mencionada es el test de negativas de respuesta de la base (0/465 refusals), que no es un benchmark de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 84,6 GB en GGUF, lo que sugiere que incluye múltiples cuantizaciones; para una cuantización típica de un modelo de 35B (por ejemplo Q4_K_M, ~20-22 GB), se estiman unos 22-26 GB de VRAM con contexto moderado. Dato exacto no disponible.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones de 4 bits con offload parcial de capas a CPU; RTX 5090 (32 GB) o A100/H100 para cuantizaciones altas (Q6/Q8) con contexto largo. En CPU pura será lento por los 35B totales, aunque la activación de ~3B mitiga el coste por token.
- Consumer GPU: cabe parcialmente en una RTX 4090 de 24 GB con cuantización Q4 y parte de expertos en RAM (mixture of experts permite offload de expertos inactivos en llama.cpp).
- Despliegue: llama.cpp y Ollama de forma nativa por ser GGUF; también compatible con LM Studio. El soporte de MTP y las capacidades de visión dependen del soporte del runtime para la arquitectura Qwen3.6 (verificar la versión de llama.cpp). vLLM y TGI no soportan GGUF directamente.
- Latencia y throughput: no disponibles; el MTP sugiere una decodificación acelerada respecto a la inferencia estándar, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-MTP | 35,5B | ~3B | no disponible | Apache 2.0 | Uncensored, multimodal, GGUF, postproceso Genesis |
| Qwen3-30B-A3B (oficial) | 30,5B | 3B | 32K (128K con YaRN) | Apache 2.0 | Modelo oficial de Alibaba, benchmarks publicados |
| Qwopus3.6-35B-A3B-Coder-MTP-GGUF (Jackrong) | ~35B | ~3B | no disponible | no disponible | Base de código censurada sin postproceso Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35,5B | ~3B | no disponible | no disponible | Base uncensored sin capacidades de código transferidas |

La ventaja diferencial de esta ficha frente a alternativas oficiales es la combinación de ausencia de filtros, capacidades de código y agenticas, y el postproceso Genesis; el inconveniente es la ausencia total de benchmarks verificables, frente a los modelos oficiales de Qwen que publican resultados estandarizados.

## Limitaciones y advertencias

- Modelo uncensored: al eliminar las salvaguardas de alineación, puede generar contenido ofensivo, peligroso o ilegal si se le solicita. El usuario asume toda la responsabilidad legal y ética de su uso. No debe desplegarse expuesto a usuarios finales sin capas de moderación propias.
- Riesgo de alucinacion: no hay evaluaciones publicadas; el postproceso Genesis es una técnica no revisada por pares y sus afirmaciones (reducción de ruido, preservación del 99% de la señal) no están verificadas independientemente. La modificación de tensores vía SVD podría degradar capacidades del modelo original.
- Benchmarks ausentes: sin métricas estandarizadas, la calidad real de código y razonamiento es desconocida y puede ser inferior a la del modelo base oficial.
- Contexto: etiquetado como long-context pero sin especificar la ventana exacta; verificar en la configuración del GGUF antes de producción.
- Soporte de runtimes: al ser una arquitectura reciente (Qwen3.6 con MTP y visión), las versiones estables de llama.cpp u Ollama pueden no soportar todas sus funciones; comprobar compatibilidad antes de desplegar.
- Procedencia comunitaria: fusión de modelos de terceros con transferencia de datos entre finetunes, un proceso propenso a contaminación cruzada de estilos y a pérdida de capacidades; no hay documentación del método de fusión más allá de la descripción del autor.
- Licencia: Apache 2.0 permite uso comercial, pero los modelos base de terceros podrían tener términos adicionales no documentados en la ficha.
- Idiomas: optimizado para inglés y chino; el rendimiento en castellano no está evaluado y puede ser inferior al de los modelos oficiales de Qwen.

## Enlaces

- Ficha del modelo: https://huggingface.co/LuffyTheFox/Qwopus3.6-35B-A3B-Coder-Uncensored-Genesis-MTP-GGUF
- Base uncensored: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo de código original (censurado): https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder-MTP-GGUF
- Finetune Hermes utilizado: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Discord de la comunidad Genesis: https://discord.gg/SZ5vacTXYf
- Página de donaciones del autor: https://hipolink.net/luffythefox
- Paper, blog tecnico y demo: no disponibles
