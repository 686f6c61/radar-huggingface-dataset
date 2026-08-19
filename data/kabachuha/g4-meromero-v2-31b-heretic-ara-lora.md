# kabachuha/G4-MeroMero-v2-31B-Heretic-ARA-LoRA

## Resumen

G4-MeroMero-v2-31B-Heretic-ARA-LoRA es una adaptación de tipo LoRA (Low-Rank Adaptation) desarrollada por kabachuha sobre el modelo base zerofata/G4-MeroMero-v2-31B, un modelo de 31 mil millones de parámetros con arquitectura multimodal (image-text-to-text) basada en Gemma 4. El objetivo principal de esta LoRA es reducir drásticamente los rechazos del modelo ante solicitudes de contenido considerado sensible o explícito, manteniendo una baja divergencia KL respecto al modelo original. Según la model card, consigue un 91% menos de rechazos (8/100 frente a 97/100) con una divergencia KL de 0.0785.

La relevancia de esta pieza radica en que permite convertir un modelo de propósito general en una herramienta sin censura para aplicaciones de roleplay, escritura creativa y generación de contenido libre, sin necesidad de reentrenar el modelo completo. Se distribuye como un adaptador PEFT en formato safetensors (0,7 GB) y también se ofrece una versión GGUF para su uso directo con llama.cpp mediante la opción `--lora-scaled`. El proyecto emplea la técnica ARA LoRA (4-bit) y un proceso de abliteración con parámetros específicos documentados en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base G4-MeroMero-v2-31B (basado en Gemma 4, multimodal) |
| Parametros totales | No disponible (la LoRA es un adaptador; el modelo base tiene 31B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | LoRA en 4-bit (técnica ARA); el modelo base puede cuantizarse (se menciona GGUF) |
| Idiomas soportados | No disponible (hereda los del modelo base) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (convertido) |

## Arquitectura y entrenamiento

La LoRA se aplica sobre el modelo base G4-MeroMero-v2-31B, que es un transformer multimodal de 31B con capacidad para procesar texto e imágenes (pipeline `image-text-to-text`). El adaptador se entrena con la técnica ARA LoRA (use_ara_lora) en precisión de 4 bits, y se combina con un proceso de abliteración que modifica selectivamente las capas del modelo para eliminar comportamientos de rechazo y censura. Los parámetros de abliteración indican que se intervienen las capas desde el índice 26 hasta el 52, con pesos específicos para preservar el comportamiento bueno (0.8949), dirigir el malo (0.0025) y corregir en exceso (0.9535), además de un recuento de vecinos de 15. Los componentes objetivo son `attn.o_proj` y `mlp.down_proj`.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) empleado para el modelo base. La LoRA se distribuye como un archivo independiente que debe fusionarse con el modelo original mediante PEFT o cargarse como adaptador en tiempo de ejecución.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base de 31B, incluyendo comprensión del lenguaje, generación de respuestas coherentes y razonamiento de varios pasos.
- Procesamiento multimodal: al estar basado en Gemma 4, el modelo base acepta entradas de imagen y texto, por lo que la LoRA también funciona en ese contexto (aunque no se documentan ejemplos específicos).
- Reducción de rechazos: la característica principal de esta LoRA es que reduce significativamente las respuestas de rechazo, objeción o censura, permitiendo generar contenido explícito o sensible sin restricciones.
- Compatibilidad con llama.cpp: el adaptador puede convertirse a GGUF y usarse con `llama-server` mediante `--lora-scaled`, lo que facilita su integración en entornos de inferencia local.
- No se documentan capacidades específicas de tool calling, agentes o funciones avanzadas; estas dependen del modelo base y no están confirmadas.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo puede mantener conversaciones de rol sin límites de contenido, ideal para juegos de texto o simulación de personajes donde se requiera libertad creativa. Su baja tasa de rechazo (8/100) permite que el usuario explore tramas adultas o controvertidas sin interrupciones.
- Escritura creativa sin restricciones: autores y guionistas pueden usar el modelo para generar borradores de ficción que incluyan violencia, sexualidad o temas tabú, sin que el sistema imponga filtros morales automáticos.
- Generación de contenido para comunidades especializadas: foros o plataformas de fanfiction y arte erótico pueden emplear este modelo para producir historias personalizadas, manteniendo la coherencia narrativa gracias a la baja divergencia KL respecto al modelo original.
- Pruebas de alineación y seguridad: investigadores pueden analizar cómo la abliteración afecta al comportamiento del modelo, comparando las tasas de rechazo y la calidad de las respuestas entre la versión original y la adaptada.
- Asistente de diálogo para juegos de mesa o simulaciones: en entornos de juego de rol en vivo o por escrito, el modelo puede interpretar personajes sin censura, respondiendo a acciones del jugador de forma inmersiva.
- Fine-tuning adicional sobre dominios específicos: al ser una LoRA ligera (0,7 GB), puede combinarse con otras LoRAs o adaptadores para tareas concretas, como generación de diálogos técnicos o médicos, sin perder la libertad de contenido.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos publicados comparan la LoRA con el modelo original en términos de divergencia KL y tasa de rechazos:

| Metrica | Este modelo | Modelo original (G4-MeroMero-v2-31B) |
| :--- | :---: | :---: |
| Divergencia KL | 0.0785 | 0 (por definicion) |
| Rechazos (sobre 100 peticiones) | 8 | 97 |

La divergencia KL baja (0.0785) indica que la distribución de salidas es muy similar a la del modelo original, lo que sugiere que la calidad general del texto se preserva. No se proporcionan métricas de velocidad o latencia.

## Requisitos de hardware

- La LoRA en sí ocupa 0,7 GB, pero para usarla se necesita cargar el modelo base de 31B. En FP16, el modelo base requiere aproximadamente 62 GB de VRAM (considerando pesos y overhead). Con cuantización a 8 bits, baja a ~31 GB; con 4 bits, a ~16 GB.
- GPUs recomendadas: para ejecutar el modelo base en 4 bits, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) es suficiente. Para 8 bits, se necesitan 32 GB o más (A100 40GB, H100). En FP16, se requieren GPUs de 64 GB o más (A100 80GB, H100 80GB).
- En consumer GPU: sí, es posible ejecutar el modelo base en 4 bits en una RTX 4090 (24 GB) o RTX 3090, siempre que se use cuantización GGUF o exl2. La LoRA se puede fusionar o cargar como adaptador.
- Opciones de despliegue: llama.cpp (con la versión GGUF del adaptador), vLLM (si se fusiona la LoRA con el modelo base), Ollama (si se empaqueta), y cualquier framework compatible con PEFT (transformers, peft).
- Latencia y throughput: no se han publicado datos. En una RTX 4090 con cuantización 4 bits, se puede esperar una velocidad de generación de 10-20 tokens por segundo para un modelo de 31B, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otras alternativas de la misma categoría (modelos sin censura de tamaño similar). El modelo base G4-MeroMero-v2-31B no tiene benchmarks públicos comparables en la información proporcionada. Se podría mencionar que existen otros modelos "abliterated" como Llama-3-8B-Instruct-abliterated o Mistral-7B-abliterated, pero no hay datos concretos de rendimiento para establecer una comparación rigurosa. Por tanto, se indica: no disponible.

## Limitaciones y advertencias

- La LoRA está diseñada para eliminar restricciones de contenido, lo que puede generar respuestas ofensivas, ilegales o dañinas si se usa sin supervisión. No es adecuada para aplicaciones donde se requiera un comportamiento ético o seguro.
- No se han evaluado sesgos específicos; el modelo base puede heredar sesgos de sus datos de entrenamiento, y la abliteración no los corrige.
- Riesgo de alucinación: al igual que otros modelos generativos, puede producir información falsa o inventada, especialmente en contextos de alta libertad creativa.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto del modelo base, por lo que no se puede garantizar un rendimiento óptimo en conversaciones muy largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Gemma 4) tiene términos de uso adicionales que deben revisarse. La model card enlaza a la licencia de Gemma 4, lo que sugiere que el uso comercial puede estar sujeto a condiciones específicas de Google.
- La técnica de abliteración puede degradar la calidad en tareas que requieren un juicio ético o normativo, ya que elimina mecanismos de rechazo que a veces son útiles para evitar respuestas perjudiciales.
- El repositorio tiene 0 descargas y solo 1 like, lo que indica que es un proyecto reciente y poco probado en la comunidad; se recomienda validar su comportamiento antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kabachuha/G4-MeroMero-v2-31B-Heretic-ARA-LoRA
- Modelo base: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Página de análisis en LLM Explorer: https://llm-explorer.com/model/kabachuha%2FG4-MeroMero-v2-31B-Heretic-ARA-LoRA,1ZPux8JYcDmThL80u9Evxu
- Perfil del autor en GitHub: https://github.com/kabachuha
- Licencia de Gemma 4 (referencia): https://ai.google.dev/gemma/docs/gemma_4_license
