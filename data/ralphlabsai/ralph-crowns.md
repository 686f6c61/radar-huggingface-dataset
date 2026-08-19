# RalphLabsAI/ralph-crowns

## Resumen

Ralph crowns es un repositorio de compresiones GGUF del modelo Qwen3-8B, publicado por RalphLabsAI como parte del mecanismo de evaluación competitiva de Bittensor netuid 40 (proyecto Ralph v2). El repositorio actúa como un "espejo verificado" que aloja las mejores cuantizaciones de cada ronda, denominadas "coronas". Cada archivo es byte-idéntico al artefacto puntuado por el sistema, con un hash que garantiza su trazabilidad hasta el repositorio del minero original.

El problema que resuelve es doble: por un lado, ofrece cuantizaciones GGUF de Qwen3-8B listas para usar en entornos con recursos limitados (móviles, CPU); por otro, introduce una métrica propia llamada "retention" que mide la fidelidad de la compresión respecto al modelo padre, aunque los propios autores advierten de que no es un benchmark de capacidades. La relevancia actual radica en que permite desplegar un modelo de 8.000 millones de parámetros en dispositivos con restricciones de memoria, con una garantía de calidad verificable y reproducible.

En la ronda 1, el repositorio contiene un único archivo: `ralph-qwen3-8b-sub4.gguf`, con cuantización de 4,0 bits por peso y un tamaño de 4,61 GB. El modelo base es Qwen/Qwen3-8B, con 8.190.735.360 parámetros, y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | GGUF, 4,0 bits/peso (tier sub4) |
| Idiomas soportados | no disponible (heredados de Qwen3-8B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo Qwen/Qwen3-8B. La arquitectura subyacente es la de Qwen3-8B, un transformer de 8.190 millones de parámetros, aunque la información proporcionada no detalla la configuración interna (número de capas, cabezas de atención, etc.). El proceso de cuantización se realiza mediante la herramienta `imatrix` (indicada en las etiquetas), que genera archivos GGUF con calibración basada en la importancia de los pesos.

La selección de la "corona" se realiza mediante un sistema de evaluación en Bittensor netuid 40: cada ronda, los mineros presentan compresiones del modelo base, y un examinador externo mide la "retention" —la capacidad de la compresión para reproducir el efecto del modelo padre sobre un modelo observador, agregada sobre el peor segmento de (observador, idioma, profundidad). El archivo publicado corresponde al artefacto que ganó la ronda 1, con una retention de 0,302385. No se proporcionan datos sobre el conjunto de entrenamiento, técnicas de alineación (RLHF, DPO) ni innovaciones arquitectónicas, ya que se trata de una compresión, no de un entrenamiento original.

## Capacidades

- Generacion de texto y conversacion: al estar basado en Qwen3-8B, hereda sus capacidades de generacion de lenguaje natural, razonamiento y comprension lectora.
- Razonamiento y codigo: el modelo base es conocido por su rendimiento en tareas de razonamiento logico y generacion de codigo, aunque la informacion proporcionada no incluye resultados especificos.
- Capacidades multilingues: Qwen3-8B es un modelo multilingue, pero el repositorio no especifica que idiomas estan soportados en esta cuantizacion.
- Tool calling y agentes: no se menciona explicitamente, pero Qwen3-8B soporta function calling; la informacion no confirma si esta capacidad se preserva tras la cuantizacion.
- Compatibilidad con runners llama.cpp: los archivos GGUF pueden ejecutarse en cualquier runner compatible con llama.cpp, incluyendo PocketPal AI y Enclave AI en iOS.

## Casos de uso

- Asistente conversacional en iPhone: el archivo de 4,61 GB puede cargarse en dispositivos iOS Pro mediante PocketPal AI o Enclave AI, que leen GGUF directamente desde Hugging Face. Es adecuado para aplicaciones de chat offline con privacidad local.
- Inferencia en CPU en servidores sin GPU: gracias al formato GGUF y la cuantizacion de 4 bits, el modelo puede ejecutarse en CPU con llama.cpp, lo que permite desplegarlo en maquinas virtuales o servidores economicos.
- Prototipado rapido de aplicaciones de lenguaje: al ser un unico archivo descargable, facilita la integracion en pipelines de desarrollo donde se necesita un modelo de 8B con huella de memoria reducida.
- Evaluacion de calidad de compresion: la metrica de retention y el registro publico de rondas permiten comparar objetivamente distintas cuantizaciones del mismo modelo base, util para investigadores que estudian el impacto de la cuantizacion.
- Verificacion de integridad de modelos: el repositorio publica hashes y enlaces a los artefactos originales, lo que permite auditar que el archivo descargado coincide exactamente con el que fue evaluado.
- Despliegue en entornos con restricciones de memoria: con 4,61 GB, el modelo cabe en GPUs de 8 GB (por ejemplo, RTX 3060, RTX 4060) y en sistemas con RAM suficiente, habilitando inferencia local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica proporcionada es la "retention" (0,302385), que mide fidelidad de compresion sobre el modelo padre, no capacidades reales. Los autores advierten explicitamente de que una alta retention no implica que el modelo sea bueno en tareas concretas.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente. Por el tamano del archivo (4,61 GB), se estima que la carga en memoria requiere aproximadamente 5-6 GB, por lo que cabe en GPUs con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, etc.).
- GPU recomendadas: no se indica ninguna GPU concreta. Para inferencia en GPU, cualquier tarjeta con al menos 8 GB de VRAM es suficiente.
- CPU: compatible con llama.cpp, por lo que puede ejecutarse en CPU con suficiente RAM (se recomienda al menos 8 GB libres).
- Dispositivos moviles: en iOS, el archivo de 4,61 GB esta cerca del limite de memoria por aplicacion; se necesita un iPhone Pro (modelos con mas de 6 GB de RAM). Las cuantizaciones de menor tamano (no incluidas en este repo) cabrian mejor.
- Opciones de despliegue: llama.cpp, PocketPal AI, Enclave AI. No se mencionan otros runners como vLLM u Ollama, aunque por ser GGUF es probablemente compatible con ellos, pero no esta confirmado en la documentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan datos comparativos con otras cuantizaciones de Qwen3-8B ni con modelos similares. La informacion disponible no incluye benchmarks ni evaluaciones independientes, por lo que no es posible realizar una comparativa fundamentada.

## Limitaciones y advertencias

- La metrica de retention no es un indicador de calidad real: un modelo con alta retention puede fallar en tareas practicas. No se deben tomar decisiones de despliegue basandose unicamente en este valor.
- No hay datos sobre sesgos, alucinaciones o comportamientos peligrosos. Al ser una cuantizacion de Qwen3-8B, hereda las limitaciones del modelo base, pero no se ha realizado ninguna evaluacion adicional.
- La longitud de contexto y los idiomas soportados no estan documentados en este repositorio; dependen de la configuracion del modelo base y del runner utilizado.
- El repositorio solo contiene la cuantizacion de la ronda 1 (tier sub4). Si el mecanismo de Bittensor cambia las coronas en futuras rondas, el archivo puede ser reemplazado, lo que podria afectar a la reproducibilidad de experimentos.
- Aunque la licencia es Apache-2.0, los pesos originales provienen de mineros de Bittensor; la atribucion correcta se detalla en `crowns.json`, y es responsabilidad del usuario cumplir con los terminos de la fuente original.
- En iOS, el archivo de 4,61 GB puede superar el limite de memoria por aplicacion en modelos no Pro, provocando cierres inesperados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RalphLabsAI/ralph-crowns
- Proyecto Ralph v2 (Bittensor netuid 40): https://github.com/RalphLabsAI/ralph-v2
- Registro de la ronda 1 (examen y decisiones): https://huggingface.co/datasets/RalphLabsAI/ralph-v2-rounds/resolve/main/rounds/round-00000001-6ac6aa97163a2707.json
- Artefacto puntuado (minero original): https://huggingface.co/andreas11112/qwen3-8b-sn40-sub4
- PocketPal AI (runner para iOS): https://github.com/a-ghorbani/pocketpal-ai
