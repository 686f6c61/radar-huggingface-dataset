# erenyanic/eldamar-tokenizer

## Resumen

`eldamar-tokenizer` es un proyecto de demostración que entrena doce modelos de lenguaje pequeños desde cero para generar nombres inspirados en la Tierra Media de Tolkien. Desarrollado por erenyanic, el proyecto adapta cuatro arquitecturas mínimas de LLM (Qwen3, Qwen3.5, Gemma y DeepSeek V3) tomadas del repositorio `single_letter_transformers` de malibayram, y las entrena sobre un corpus limpio de 2.189 nombres de personajes y lugares de Tolkien. Cada arquitectura se combina con tres tokenizadores distintos: uno a nivel de carácter (vocabulario de 43 símbolos) y dos variantes de BPE a nivel de carácter con vocabularios de 256 y 512. El resultado son 12 modelos capaces de generar nombres que mezclan memorización de nombres reales con invenciones plausibles, todo entrenable en CPU en unos minutos.

La relevancia del proyecto reside en su carácter didáctico: muestra un pipeline completo de preparación de datos, tokenización y entrenamiento de LLMs desde cero con recursos mínimos. También explora una decisión técnica interesante: usar BPE a nivel de carácter sin pre-tokenización byte-level, lo que mantiene el alfabeto original de 42 caracteres (incluyendo diacríticos) y hace que los vocabularios de 256 y 512 sean objetivos de fusión significativos. No es un modelo listo para producción, sino una herramienta de experimentación y aprendizaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptaciones minúsculas de Qwen3, Qwen3.5, Gemma y DeepSeek V3 (del repositorio single_letter_transformers) |
| Parametros totales | no disponible (modelos "tiny", entrenables en CPU en minutos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación de nombres de longitud variable, limitada por el tokenizador) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, formato .pt) |
| Idiomas soportados | Nombres de la Tierra Media (base: inglés con diacríticos; no es un modelo multilingüe general) |
| Licencia | no disponible |
| Formato de pesos | PyTorch .pt (checkpoints por arquitectura y tokenizador) |

## Arquitectura y entrenamiento

Las cuatro arquitecturas son adaptaciones directas de las implementaciones de referencia de `single_letter_transformers`, que a su vez replican en miniatura los diseños de Qwen3, Qwen3.5, Gemma y DeepSeek V3. No se proporcionan detalles sobre el número de capas, dimensiones de atención o mecanismos específicos; el repositorio original las describe como "tiny from-scratch LLM architectures". El entrenamiento se realiza sobre un corpus de 2.189 nombres únicos, obtenido tras un pipeline de limpieza que incluye: normalización a minúsculas (sin usar el lowercase turco, que alteraría caracteres como 'I'), conservación de diacríticos, extracción de paréntesis, división de nombres compuestos en palabras individuales, filtrado de palabras vacías (of, the, mount, river) y eliminación de numerales romanos y abreviaturas. El corpus final tiene un alfabeto de 42 caracteres más el salto de línea.

La innovación principal está en el tokenizador BPE a nivel de carácter: se entrena con la librería `tokenizers` de Hugging Face sin pre-tokenización byte-level, de modo que el alfabeto base son los 42 caracteres reales. Se usa un pre-tokenizador `Split("\n", isolated)` para que las fusiones nunca crucen los límites de nombre y el salto de línea se mantenga como token único, actuando como marcador de inicio/fin de nombre. La codificación es lossless (verificada por round-trip). Con vocabulario 256 se alcanzan 3,68 tokens por nombre de media; con 512, 3,12. No se aplica RLHF ni DPO; el entrenamiento es supervisado sobre el corpus de nombres.

## Capacidades

- Generación de nombres ficticios: produce nombres que siguen patrones fonéticos y morfológicos similares a los nombres de Tolkien.
- Memorización de nombres reales del corpus: algunos nombres generados coinciden exactamente con entradas del dataset (por ejemplo, `boromir`, `pengolodh`, `echoriath`).
- Invención de nombres plausibles: genera combinaciones nuevas como `markhîr`, `brandyuis` o `shield` que no aparecen en los datos de entrenamiento.
- Manejo de diacríticos: conserva y reproduce caracteres acentuados (á, â, ä, é, ê, ë, í, î, ó, ô, ö, ú, û).
- Control de generación mediante temperatura y semilla: permite ajustar la aleatoriedad y reproducibilidad de las muestras.
- No dispone de tool calling, ni soporte de agentes, ni capacidades multimodales.

## Casos de uso

- Generación de nombres para juegos de rol y mundos de fantasía: el modelo puede producir listas de nombres de personajes o lugares con sabor élfico, útil para dungeon masters o diseñadores de juegos. Se usa ejecutando `generate.py` con el checkpoint deseado y ajustando temperatura y cantidad.
- Escritura creativa y worldbuilding: escritores de ficción pueden usarlo para generar nombres de lugares o personajes que encajen con una ambientación tolkieniana, combinando memorización e invención.
- Experimentación con tokenización BPE: el proyecto sirve como banco de pruebas para comparar el efecto de distintos tamaños de vocabulario (carácter, 256, 512) sobre la generación de texto corto. Los resultados en tokens por nombre muestran diferencias medibles.
- Enseñanza de arquitecturas de LLM: al ser modelos minúsculos y entrenables en CPU, es un recurso didáctico para explicar cómo funcionan internamente Qwen3, Gemma o DeepSeek V3 sin necesidad de hardware potente.
- Estudio de memorización vs. generalización: con un corpus pequeño, se puede analizar qué nombres memoriza el modelo y cuáles inventa, y cómo influye el tokenizador en ese comportamiento.
- Prueba de pipelines de datos: el flujo de limpieza (scraping, normalización, filtrado) puede servir como plantilla para preparar datasets de nombres o textos cortos en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no reporta métricas estándar como MMLU, HumanEval o GSM8K; su evaluación se limita a ejemplos cualitativos de generación y a estadísticas de tokenización (tokens por nombre).

## Requisitos de hardware

- Entrenamiento: los 12 modelos se entrenan en CPU en "un par de minutos" según la documentación; no se especifica el hardware exacto, pero es asumible que cualquier CPU moderna es suficiente.
- Inferencia: igualmente ligera, ejecutable en CPU sin necesidad de GPU.
- VRAM: no aplica; los modelos son minúsculos y caben en memoria RAM convencional.
- GPUs recomendadas: ninguna en particular; si se usa GPU, cualquier modelo consumer (RTX 3060 o superior) es más que suficiente.
- Opciones de despliegue: al ser un proyecto de investigación, no hay soporte oficial para vLLM, Ollama o TGI. Los checkpoints son archivos `.pt` de PyTorch que se cargan con el script `generate.py` incluido.
- Latencia y throughput: no se proporcionan datos, pero por el tamaño se espera generación casi instantánea en CPU.

## Comparativa con modelos similares

No disponible. El proyecto no ofrece comparaciones con otros modelos de generación de nombres, y no existen datos de rendimiento que permitan una comparativa objetiva. La única referencia es el repositorio original `single_letter_transformers`, del que se diferencia en el dataset (nombres turcos → nombres de Tolkien) y en la incorporación de tokenizadores BPE a nivel de carácter.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (2.189 nombres), lo que provoca un alto riesgo de sobreajuste y limita la generalización a nombres fuera del dominio tolkieniano.
- El modelo solo genera nombres; no es capaz de producir texto coherente, responder preguntas ni realizar tareas de razonamiento.
- No se especifica licencia, por lo que el uso comercial es incierto y requiere consultar al autor.
- Los datos provienen de fuentes con derechos de autor (nombres de Tolkien), aunque los nombres en sí son hechos no protegibles; el uso de los mismos debe evaluarse legalmente.
- No hay garantías de calidad en las generaciones: algunos outputs pueden ser palabras inglesas comunes (como `arches` o `running`) que el dataset no filtró correctamente.
- La arquitectura exacta (número de capas, dimensiones) no está documentada en la información disponible, lo que dificulta la reproducibilidad detallada.

## Enlaces

- HuggingFace: https://huggingface.co/erenyanic/eldamar-tokenizer
- Repositorio original de arquitecturas: https://github.com/malibayram/single_letter_transformers
- Fuente de nombres de lugares (Tolkien Gateway): https://tolkiengateway.net/wiki/Index:Locations
