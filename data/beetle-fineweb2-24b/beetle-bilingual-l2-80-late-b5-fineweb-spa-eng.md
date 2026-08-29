# Beetle-FineWeb2-24B/beetle-bilingual-l2-80-late-b5-fineweb-spa-eng

## Resumen

El modelo `beetle-bilingual-l2-80-late-b5-fineweb-spa-eng`, publicado por el usuario Beetle-FineWeb2-24B, es un modelo de generación de texto de tamaño reducido (aproximadamente 194 millones de parámetros) diseñado para tareas bilingües en español e inglés, según su nombre. Se presenta como un "pico_decoder", lo que sugiere una arquitectura de decoder compacta, y su entrenamiento parece estar basado en el dataset multilingüe FineWeb2 de HuggingFace, aunque no se proporciona documentación oficial al respecto.

El modelo fue subido al Hub el 29 de agosto de 2026 y no registra descargas ni "likes" en el momento de la consulta. Su relevancia radica en ser un ejemplo de modelo pequeño orientado a bilingüismo, potencialmente útil para entornos con recursos limitados, pero la ausencia de una model card detallada y de métricas de evaluación limita seriamente su aplicabilidad práctica. El repositorio ocupa 101,6 GB, un tamaño desproporcionado para sus parámetros, lo que sugiere que puede incluir checkpoints adicionales o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pico_decoder (decoder compacto, sin más detalles) |
| Parametros totales | 193.804.032 (~194 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (según fuente externa, no confirmado oficialmente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español e inglés (inferido del nombre, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible es muy escasa. El tag `pico_decoder` indica que se trata de un decoder de tamaño pequeño, pero no se especifica si es un transformer estándar, si emplea atención lineal u otras innovaciones. El nombre del modelo sugiere que fue entrenado sobre el dataset FineWeb2, un corpus multilingüe curado por HuggingFace que aplica deduplicación global por idioma y filtrado de calidad. No se dispone de datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El tag `custom_code` indica que el modelo requiere código personalizado para su carga, lo que puede complicar su uso con herramientas estándar.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Bilingüismo español-inglés, inferido del nombre del modelo, aunque no hay documentación que lo confirme.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multimodales.
- No se indica si dispone de un modo de "thinking" o razonamiento extendido.

## Casos de uso

Dada la falta de documentación y de benchmarks, los casos de uso son hipotéticos y deben validarse experimentalmente:

- Prototipado rápido de aplicaciones de generación de texto bilingüe en entornos con GPU limitada, gracias a su tamaño reducido (~194 M parámetros) y contexto de 4K tokens.
- Experimentación académica con modelos pequeños para estudiar el impacto del dataset FineWeb2 en tareas de traducción o generación en español e inglés.
- Fine-tuning sobre dominios específicos (por ejemplo, atención al cliente o generación de documentación técnica) cuando se dispone de un dataset propio y se busca un modelo base ligero.
- Inferencia en dispositivos edge o CPU, si se cuantiza adecuadamente, aunque no se han publicado versiones GGUF ni guías de despliegue.
- Análisis comparativo de arquitecturas "pico" frente a modelos más grandes en tareas de generación bilingüe.
- Educación y demostraciones de modelos de lenguaje pequeños, dado su bajo coste de inferencia estimado (~2 GB VRAM).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se han encontrado evaluaciones independientes en la web.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para inferencia en precisión completa, según una fuente externa (free2aitools). Esto permitiría ejecutarlo en GPUs de consumo como la GTX 1660, RTX 2060 o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para mayor margen; una RTX 3060 o superior sería suficiente.
- El modelo cabe en GPUs de consumo, pero no se han publicado versiones cuantizadas (GGUF, GPTQ, etc.) que reduzcan aún más los requisitos.
- Opciones de despliegue: al usar `custom_code`, es probable que requiera la librería `transformers` con código personalizado. No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo no tiene métricas publicadas y su arquitectura exacta es desconocida. Como referencia, otros modelos pequeños bilingües como los de la familia Gemma 2 (2B) o Qwen2.5 (0.5B) tienen documentación extensa y benchmarks, pero no son directamente comparables sin datos de este modelo. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- La model card es una plantilla genérica sin información real: no se especifican sesgos, riesgos de alucinación ni limitaciones técnicas.
- La licencia es "no disponible", lo que impide conocer las restricciones de uso comercial y redistribución. No se debe utilizar en producción sin aclarar este punto.
- El tag `custom_code` implica que el modelo puede no cargarse con las versiones estándar de `transformers`; se requiere revisar el código asociado.
- El tamaño del repositorio (101,6 GB) es inusualmente grande para 194 M parámetros; puede contener archivos adicionales no relacionados con el modelo final.
- No hay evidencia de que el modelo funcione correctamente en español e inglés; el nombre es la única pista.
- Al no haber benchmarks ni evaluaciones, cualquier uso en producción conlleva un riesgo alto de comportamiento impredecible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beetle-FineWeb2-24B/beetle-bilingual-l2-80-late-b5-fineweb-spa-eng
- Ficha externa con datos de contexto y VRAM: https://free2aitools.com/model/beetle-fineweb2-24b/beetle-bilingual-l2-80-late-b5-fineweb-deu-eng (variante en alemán, misma familia)
- Repositorio del dataset FineWeb2: https://github.com/huggingface/fineweb-2
- Paper de FineWeb2: https://arxiv.org/html/2506.20920v1
