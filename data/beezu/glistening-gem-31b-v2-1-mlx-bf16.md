# beezu/Glistening-Gem-31B-v2.1-mlx-bf16

## Resumen

El modelo **beezu/Glistening-Gem-31B-v2.1-mlx-bf16** es una conversión a formato MLX del modelo de texto `sophosympatheia/Glistening-Gem-31B-v2.1`, un merge de tres modelos basados en **Gemma 4 31B** (de Google DeepMind) realizado con la herramienta `mergekit`. El autor, `beezu`, ha publicado esta variante en precisión bf16 para su uso en entornos Apple Silicon mediante la librería MLX, junto con otras cuantizaciones de 4 y 8 bits disponibles en repositorios separados.

El modelo original, Glistening-Gem-31B-v2.1, es un merge de `TheDrummer/Artemis-31B-v1`, `zerofata/G4-MeroMero-v2-31B` y `llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic` sobre la base de `google/gemma-4-31B-it`. Su objetivo es mejorar la creatividad y la prosa frente a la versión v1.0, corrigiendo los problemas de la fallida receta v2.0. El modelo está pensado para tareas de generación de texto creativo y conversacional, con una licencia Apache 2.0 que permite su uso comercial, aunque la etiqueta "not-for-all-audiences" advierte de contenido potencialmente inapropiado.

Con 30.697.345.280 parámetros (≈30,7B), este modelo se posiciona en el rango de los grandes modelos de lenguaje de tamaño medio. No se proporcionan datos de contexto, arquitectura detallada ni benchmarks en la información disponible, por lo que estos apartados se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 4-31B (transformer decoder-only, sin MoE) |
| Parámetros totales | 30.697.345.280 (≈30,7B) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MLX bf16 (este repo); variantes de 4-bit (gs32) y 8-bit disponibles en otros repositorios del mismo autor |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es un **merge** de tres modelos fine-tune de Gemma 4-31B, combinados mediante `mergekit` sobre la base original de Google `google/gemma-4-31B-it`. La técnica de merge no implica entrenamiento adicional; se combinan los pesos de los modelos participantes para obtener un modelo que hereda las capacidades de cada ingrediente. El autor indica que la receta v2.1 utiliza una gestión estratégica de capas para mitigar los artefactos que aparecían en versiones anteriores, y que la base stock de Gemma 4 (en lugar de una base exótica) permite un merge más limpio. No hay información sobre el dataset de entrenamiento ni sobre procesos de alineación (RLHF/DPO), ya que al ser un merge, las propiedades del modelo provienen de los modelos base.

## Capacidades

- **Generación de texto creativo**: el modelo está diseñado para producir prosa literaria, diálogos y narrativa con un estilo más variado y original que el modelo base.
- **Conversación multi-turno**: al ser un modelo de texto generativo, puede mantener conversaciones con contexto, aunque no se especifica la ventana de contexto máxima.
- **Soporte de tool calling / function calling**: no se menciona en la documentación disponible.
- **Capacidades de agente o razonamiento multi-step**: no se documentan.
- **Capacidades multilingües**: solo se declara el inglés (en).
- **Capacidades especiales**: etiquetado como «not-for-all-audiences», lo que sugiere que puede generar contenido no apto para todos los públicos, posiblemente sin censura.

## Casos de uso

- **Escritura creativa y narrativa**: el modelo puede generar cuentos, novelas, poemas o guiones. Su enfoque en la creatividad y la prosa lo hace adecuado para autores que buscan asistencia en la redacción de ficción o para generar ideas de historias.
- **Roleplay y personajes**: gracias a su naturaleza conversacional y creativa, puede usarse para simular personajes en juegos de rol o entornos de simulación, manteniendo coherencia en el tono y el estilo.
- **Generación de contenido de ficción en línea**: blogs de relatos, fanfiction o contenido para redes sociales, con la capacidad de producir texto original y variado.
- **Prototipado rápido de diálogos**: para diseñadores de juegos o guionistas que necesitan generar alternativas de diálogo para personajes o escenas.
- **Exploración de estilos literarios**: el modelo puede imitar o mezclar estilos de diferentes autores (dentro de los límites de su entrenamiento), útil para estudios de estilo o para inspirar a escritores.
- **Uso en entornos de investigación**: dado que es un modelo de 31B con licencia Apache 2.0, puede emplearse en entornos académicos para experimentos de generación de texto, sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan cifras de MMLU, HumanEval, GSM8K ni otros estándares, ni comparaciones con modelos similares.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - En bf16 (este repositorio): los pesos ocupan aproximadamente 61 GB, por lo que se necesita una GPU con al menos 64-80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o varias GPUs.
  - En 4-bit (repositorio `-mlx-4bit-gs32`): los pesos se reducen a ~15,7 GB, lo que permite inferencia en GPUs de 16-24 GB (por ejemplo, RTX 4090 24GB, RTX 3090 24GB).
  - En 8-bit (repositorio `-mlx-8Bit`): ~30,7 GB, apto para GPUs de 32-48 GB (por ejemplo, A6000, L4).
- **GPU recomendadas**: para bf16, A100/H100 de 80GB; para cuantización 4-bit, RTX 4090 o similar con 24GB de VRAM.
- **Compatibilidad con consumer GPU**: sí, con cuantización 4-bit puede ejecutarse en una RTX 4090 (24GB) o en una RTX 3090 (24GB). En bf16 no cabe en GPUs de consumo.
- **Opciones de despliegue**: al ser formato MLX, está pensado para uso con la librería MLX en Apple Silicon (Mac con M1/M2/M3). También puede ejecutarse mediante vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF.
- **Latencia y throughput**: no hay datos disponibles. En general, para un modelo de 30B en MLX, la velocidad de generación dependerá del hardware (por ejemplo, en un Mac M2 Ultra con 192GB unificado, se esperan decenas de tokens por segundo, pero no se ha medido).

## Comparativa con modelos similares

No se dispone de información comparativa directa. Sin embargo, se puede comparar con su base original, `google/gemma-4-31B-it`, y con otros merges de 31B, como los ingredientes del merge (`Artemis-31B-v1`, `G4-MeroMero-v2-31B`, `gemma-4-Ortenzya-...`). La diferencia principal es que este modelo combina características creativas y de prosa de los tres modelos, mientras que la base Gemma 4 es un modelo general de propósito general. No hay datos de rendimiento para comparar numéricamente.

## Limitaciones y advertencias

- **Artefactos de generación**: el modelo puede producir ocasionalmente palabras fusionadas o errores ortográficos, como se indica en la model card. Estos artefactos son raros y se reducen con parámetros de muestreo conservadores (por ejemplo, aumentar Min-P).
- **Contenido para audiencias adultas**: el modelo está etiquetado como `not-for-all-audiences`, lo que implica que puede generar contenido explícito, ofensivo o no apto para menores. No es adecuado para aplicaciones en entornos no controlados o para públicos generales.
- **Idioma limitado**: solo soporta inglés, lo que restringe su uso en aplicaciones multilingües.
- **Riesgo de alucinación**: como todos los LLM, puede generar información falsa o inventada, especialmente en contextos de hechos, aunque su enfoque creativo puede exacerbar este riesgo.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los modelos base (Gemma 4) y de los ingredientes del merge, ya que algunos pueden tener cláusulas adicionales.
- **No apto para producción**: no se han publicado benchmarks ni validaciones de seguridad; el modelo es una creación experimental de un autor independiente y no cuenta con el respaldo de una organización, por lo que su uso en entornos críticos no está recomendado.

## Enlaces

- [beezu/Glistening-Gem-31B-v2.1-mlx-bf16 en Hugging Face](https://huggingface.co/beezu/Glistening-Gem-31B-v2.1-mlx-bf16)
- [Modelo original: sophosympatheia/Glistening-Gem-31B-v2.1](https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1)
- [Variante 4-bit: beezu/Glistening-Gem-31B-v2.1-mlx-4bit-gs32](https://huggingface.co/beezu/Glistening-Gem-31B-v2.1-mlx-4bit-gs32)
- [Variante 8-bit: McG-221/Glistening-Gem-31B-v2.1-mlx-8Bit](https://friendli.ai/models/McG-221/Glistening-Gem-31B-v2.1-mlx-8Bit)
- [Base Gemma 4 (Google DeepMind)](https://deepmind.google/models/gemma/gemma-4/)
- [Artículo sobre Meta Muse Glimmer (no relacionado)](https://www.opensourceforu.com/2026/08/meta-open-sources-muse-glimmer/)
