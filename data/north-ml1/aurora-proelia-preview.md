# North-ML1/aurora-proelia-preview

## Resumen

Aurora Proelia es un modelo de lenguaje causal de tamaño compacto, desarrollado por North-ML1 como una vista previa pública de su arquitectura propietaria "Aurora". Se basa en un checkpoint original de 207 millones de parámetros sobre el que se ha aplicado un ajuste fino supervisado (SFT) de identidad conservador, con el objetivo de que el modelo responda como "Aurora Proelia" sin alterar significativamente su comportamiento original. El modelo está pensado para investigación, pruebas de identidad y generación de texto ligera en entornos locales.

Con una ventana de contexto de 2.048 tokens y un tokenizador de 16.000 tokens, Aurora Proelia es un modelo pequeño orientado a tareas sencillas de generación de texto en inglés. Su relevancia radica en ser un ejemplo de arquitectura propia no basada en los diseños estándar publicados, aunque no se ofrecen detalles técnicos sobre su estructura interna. La licencia es restrictiva: no se concede una licencia de código abierto y la redistribución de pesos o derivados está prohibida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aurora causal language model (sin detalles publicos sobre su estructura interna) |
| Parametros totales | 221.278.208 (segun safetensors); la model card indica 206.942.208 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | other (no open-source, reservada por el propietario) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se denomina "Aurora causal language model" y no se proporcionan especificaciones sobre si se trata de un transformer, un modelo de mezcla de expertos (MoE) o alguna variante híbrida. Tampoco se detallan los datos de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). Lo único que se menciona es que el checkpoint original de 207M fue sometido a un "pase de ajuste fino supervisado de identidad conservador" (conservative identity SFT pass), cuyo propósito es que el modelo se identifique como Aurora Proelia manteniendo el comportamiento general del modelo base.

No hay información adicional sobre innovaciones técnicas, como atención lineal, decodificación especulativa u otras mejoras. El runtime nativo "Aurora" soporta ejecución en CPU, Apple Silicon y CUDA, pero no se especifica su implementación.

## Capacidades

- Generacion de texto en ingles: produce respuestas coherentes para entradas de texto cortas o preguntas simples.
- No dispone de acceso a internet ni herramientas externas; el propio README indica que las aplicaciones deben proporcionar busqueda o recuperacion si se necesita informacion actualizada.
- No se menciona soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No es multilingue: solo entiende y genera en ingles.
- No incluye capacidades de vision, audio u otras modalidades.
- El contexto es limitado (2.048 tokens), por lo que no es adecuado para tareas que requieran memoria larga.

## Casos de uso

- Investigacion academica: sirve como modelo de referencia para estudiar el comportamiento de arquitecturas propietarias de pequeno tamano, comparando su salida con modelos abiertos equivalentes.
- Pruebas de identidad y personalidad: al haber sido ajustado para responder como Aurora Proelia, es util para evaluar la coherencia de la identidad del modelo en conversaciones controladas.
- Generacion de texto ligera en entornos con recursos limitados: gracias a su tamano reducido, puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace apto para prototipos en dispositivos embebidos o portatiles antiguos.
- Prototipado rapido de chatbots sencillos: para aplicaciones de demostracion o educativas donde no se requiera alta calidad ni capacidades avanzadas, puede servir como base para un asistente conversacional basico en ingles.
- Generacion de respuestas cortas y parrafos breves: util para completar plantillas, generar resumenes de una frase o producir contenido textual de longitud limitada.
- Entrenamiento de modelos mas grandes: el checkpoint original de 207M puede usarse como punto de partida para fine-tuning en tareas especificas, siempre que se respete la licencia (que prohibe la redistribucion de derivados, por lo que su uso estaria restringido a fines internos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar. Tampoco se ofrecen comparaciones con modelos similares.

## Requisitos de hardware

- El modelo tiene aproximadamente 221 millones de parametros, con un repositorio de 0,9 GB en safetensors. En FP32, los pesos ocuparian unos 884 MB; en FP16, unos 442 MB, aunque no se especifican formatos de cuantizacion.
- El runtime nativo Aurora soporta CPU, Apple Silicon y CUDA, por lo que puede ejecutarse en una amplia variedad de equipos.
- Se estima que cabria en GPUs con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, o integradas de Apple Silicon), pero no hay datos oficiales de consumo de memoria.
- Para despliegue, solo se proporciona el script de inferencia `infer.py` que carga el checkpoint `model.safetensors`. No se menciona compatibilidad con vLLM, Ollama, llama.cpp u otros servidores de inferencia.
- La latencia y el throughput no se han publicado; al ser un modelo pequeno, se espera una generacion rapida incluso en CPU, pero sin cifras concretas.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de tamano similar (por ejemplo, GPT-2 small de 124M, o modelos como TinyLlama de 1.1B). La informacion proporcionada no incluye datos de rendimiento ni referencias a modelos comparables.

## Limitaciones y advertencias

- Licencia restrictiva: no se concede una licencia de codigo abierto. La redistribucion de los pesos o la publicacion de derivados esta prohibida. Esto limita su uso en proyectos comerciales o colaborativos.
- Modelo de tamano reducido: con ~207-221M de parametros, su capacidad de razonamiento, coherencia y conocimiento general es limitada en comparacion con modelos de mayor escala.
- Contexto corto: la ventana de 2.048 tokens restringe la capacidad de manejar conversaciones largas o documentos extensos.
- Solo ingles: no soporta otros idiomas, lo que limita su aplicacion a entornos angloparlantes.
- Sin herramientas externas: no navega por internet ni accede a bases de datos; la informacion que genera puede estar desactualizada o ser incorrecta.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en temas especializados o de actualidad.
- Estado de preview: al ser una vista previa publica, puede contener comportamientos inesperados o respuestas inconsistentes. Se recomienda usar decodificacion greedy para mayor estabilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/North-ML1/aurora-proelia-preview
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.
