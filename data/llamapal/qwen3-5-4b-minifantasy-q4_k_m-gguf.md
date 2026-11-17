# LlamaPal/Qwen3.5-4B-MiniFantasy-Q4_K_M-GGUF

## Resumen

Qwen3.5-4B-MiniFantasy es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), derivado de la familia Qwen3.5 de Alibaba y ajustado por la comunidad (autor original citado como "Nubinu") bajo el nombre "MiniFantasy". El repositorio analizado, publicado por el usuario LlamaPal, no es un modelo nuevo ni un ajuste propio: es un espejo (mirror) del archivo GGUF cuantizado en Q4_K_M generado por mradermacher, con el mismo hash SHA-256 que el original, ofrecido como descarga estable.

El problema que resuelve este repositorio es puramente logístico: proporciona una copia verificable del archivo `Qwen3.5-4B-MiniFantasy-Q4_K_M.gguf` (2,7 GB) para quien quiera ejecutar el modelo en local con llama.cpp u otras herramientas compatibles con GGUF, sin depender de la disponibilidad del repositorio de origen. No aporta pesos nuevos, ni tokenizador propio, ni cambios de arquitectura respecto al modelo base.

Es relevante ahora por dos motivos: por un lado, los modelos de ~4B cuantizados a Q4_K_M caben en GPUs de consumo y en equipos con poca VRAM, lo que los hace atractivos para prototipado local; por otro, el ajuste "MiniFantasy" apunta a un dominio creativo/narrativo (fantasía), un nicho donde los modelos pequeños suelen rendir peor que los grandes. La información pública disponible sobre el ajuste es muy escasa: la model card del mirror no incluye detalles de entrenamiento, benchmarks ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; el mirror no documenta la arquitectura) |
| Parametros totales | 4.205.751.296 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo solo aloja esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-4B-MiniFantasy-Q4_K_M.gguf`, 2,7 GB, SHA-256 `b7b1867e93dd6ca05c9bf5174d0999943a89e9594b646b48fb34cb8247290b2d`) |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y el tamaño (4,2B parámetros) se trata presumiblemente de un transformer decoder-only de la familia Qwen3.5, pero el mirror no confirma ni detalla capas, atención, tipo de normalización ni esquema posicional. Tampoco se documenta si el modelo base emplea atención lineal, decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, la model card solo indica que "MiniFantasy" es un modelo de comunidad de Nubinu y que este repositorio es una copia sin modificar del GGUF de mradermacher. No se especifican tokens de entrenamiento, composición del dataset, uso de RLHF/DPO/SFT, ni el proceso de ajuste que da lugar a la variante "MiniFantasy". Cualquier afirmación sobre el pipeline de entrenamiento sería especulativa y no se incluye aquí.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio sugiere uso en diálogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Ajuste orientado a narrativa de fantasía: el nombre "MiniFantasy" indica una especialización temática, pero no hay documentación que cuantifique esa especialización.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el archivo puede servirse a través de infraestructura de inferencia compatible con GGUF.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la documentación.

## Casos de uso

- Prototipado local de narrativa fantástica: el modelo puede usarse para generar borradores de escenas, descripciones de mundo o diálogos de personajes en un equipo de sobremesa, gracias a su cuantización Q4_K_M de 2,7 GB que cabe en GPUs de consumo y en CPU con RAM suficiente.
- Asistente de escritura creativa offline: integrado en llama.cpp u Ollama, permite iterar sobre textos sin conexión ni coste por token, útil para autores que trabajan con material sensible.
- Pruebas de pipelines de inferencia GGUF: al ser un archivo verificable por hash, sirve como fixture reproducible para validar despliegues de llama.cpp, servidores compatibles con la API de OpenAI o capas de orquestación.
- Generación de contenido para juegos de rol de mesa: el ajuste temático encaja en la generación de descripciones de encuentros, objetos y PNJ, con la ventaja de ejecutarse en local durante la partida.
- Experimentación académica con modelos pequeños ajustados: investigadores pueden comparar el comportamiento de una variante de 4B especializada frente al base Qwen3.5 en tareas creativas, sin depender de APIs externas.
- Base para ajustes posteriores (LoRA/QLoRA): al estar en GGUF Q4_K_M, no es el formato ideal para reentrenar, pero el modelo base de 4,2B sí es abordable en una sola GPU de 24 GB para fine-tuning con cuantización, lo que permite derivar variantes propias a partir del mismo linaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3-4 GB para el archivo Q4_K_M (2,7 GB de pesos más overhead de contexto y caché KV); la cifra exacta depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs de gama alta el modelo queda limitado por ancho de banda, no por cómputo.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en iGPUs recientes y en CPU con al menos 8 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), servidores compatibles con la API de OpenAI que acepten GGUF, y cualquier runtime que soporte el formato.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-MiniFantasy (Q4_K_M) | 4,2B | no disponible | Apache 2.0 | GGUF | Ajuste comunitario temático; mirror sin benchmarks |
| Qwen3.5-4B (base) | 4,2B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo base del que deriva; sin especialización temática documentada |
| Otros GGUF de ~4B de la familia Qwen | ~4B | variable | Apache 2.0 | GGUF | Alternativas directas para comparar calidad en el mismo rango de VRAM |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay benchmarks publicados del ajuste ni datos de contexto o idiomas que permitan una tabla de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste "MiniFantasy" mejore al base en tareas creativas ni de que no degrade capacidades generales.
- Riesgo de alucinación: como cualquier modelo de 4B, la tasa de fabricación de hechos es alta, especialmente en dominios factuales; no debe usarse como fuente de verdad sin verificación.
- Sesgos: no documentados; al no conocerse la composición del dataset de ajuste, no se puede evaluar el sesgo temático, de género o cultural introducido.
- Idiomas: no se declaran idiomas soportados; el rendimiento en castellano es desconocido y podría ser deficiente si el ajuste se hizo solo en inglés.
- Contexto: se desconoce la ventana de contexto; no planifiques conversaciones largas o documentos extensos sin verificarla empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero el mirror no incluye la model card completa del autor original; conviene revisar el repositorio de mradermacher y el del autor (Nubinu) antes de un despliegue en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay señales de comunidad ni soporte.
- Formato GGUF Q4_K_M: no apto para fine-tuning directo; para reentrenar hay que partir del modelo base en safetensors.

## Enlaces

- Repositorio del mirror: https://huggingface.co/LlamaPal/Qwen3.5-4B-MiniFantasy-Q4_K_M-GGUF
- Repositorio original del GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen3.5-4B-MiniFantasy-GGUF
- Commit de origen citado: https://huggingface.co/mradermacher/Qwen3.5-4B-MiniFantasy-GGUF/tree/d890f0d24a9aac564a54be23d97a2dacdf214001
- Paper, blog, demo o repositorio del autor original (Nubinu): no disponible
