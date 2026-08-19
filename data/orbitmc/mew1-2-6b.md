# OrbitMC/Mew1-2.6B

## Resumen

Mew1-2.6B es un modelo de lenguaje de 2.6 mil millones de parámetros desarrollado por el equipo OrbitMC y Unmid, basado en el modelo Liquid-AI/LFM-2.5-2.6B. Se presenta como un asistente eficiente y sin censura, diseñado para ofrecer respuestas sin restricciones temáticas en inglés. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación libre.

La relevancia actual de este modelo radica en su tamaño compacto (2.6B), que lo hace adecuado para despliegue en hardware de consumo y aplicaciones de baja latencia, combinado con una orientación explícita hacia la ausencia de filtros de contenido. Según la model card, está optimizado para inferencia rápida y se ofrecen versiones cuantizadas en GGUF para ejecución local. No se dispone de información pública sobre la arquitectura interna ni el contexto de entrenamiento, más allá de que parte del modelo base LFM-2.5 de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.697.198.592 (2.6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (segun tags, sin detalle de precisiones) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo. Al estar basado en Liquid-AI/LFM-2.5-2.6B, es probable que herede la arquitectura de su base, pero no se confirma si se trata de un transformer denso, MoE o híbrido. Tampoco se conocen los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF, DPO u otras. La unica innovacion declarada es la optimizacion para eficiencia y la ausencia de censura, pero sin especificaciones tecnicas concretas.

## Capacidades

- Generacion de texto en ingles sin restricciones de contenido (tag "uncensored").
- Inferencia eficiente para su tamano, optimizada para despliegue local (tags "efficient" y "unsloth").
- Compatibilidad con formato GGUF para ejecucion en herramientas como llama.cpp o Ollama.
- No se mencionan capacidades especificas de tool calling, agentes, vision o audio.
- No se indica soporte multilingue; el unico idioma declarado es ingles.

## Casos de uso

- Asistente local sin censura: el modelo puede integrarse en aplicaciones de escritorio o servidores personales para responder preguntas o generar contenido sin filtros tematicos, aprovechando su tamano reducido para ejecutarse en CPU o GPU de gama media.
- Generacion creativa de texto: util para redaccion de ficcion, guiones o contenido publicitario donde se requiera libertad expresiva y rapidez de respuesta.
- Prototipado de chatbots: al ser ligero, permite iterar rapidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Educacion y experimentacion: investigadores y estudiantes pueden usarlo para estudiar comportamientos de modelos sin censura en entornos controlados.
- Despliegue en edge computing: su bajo consumo de memoria lo hace apto para dispositivos con recursos limitados, como Raspberry Pi o mini-PCs.
- Automatizacion de tareas de texto simples: resumen, extraccion de ideas o generacion de borradores en ingles, siempre que no se requiera alta precision factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 5.2 GB; en cuantizacion int8, ~2.6 GB; en int4, ~1.3 GB (estimacion estandar para 2.6B parametros).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (ej. RTX 3060, RTX 2060), o 2-4 GB para cuantizaciones bajas (ej. GTX 1650, integradas recientes).
- Puede ejecutarse en CPU con cuantizacion GGUF, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, o servidores de inferencia como vLLM (si se convierte a formato compatible).
- Latencia y throughput: no se dispone de datos medidos; en una RTX 4090 se esperaria una velocidad de decodificacion de decenas de tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia generica, modelos de tamano similar (2-3B) como Qwen2.5-3B, Llama-3.2-3B o Gemma-2-2.6B ofrecen arquitecturas conocidas, contextos de 8K-128K y benchmarks publicados, pero no se pueden establecer comparaciones directas sin datos de Mew1-2.6B.

## Limitaciones y advertencias

- Ausencia de informacion tecnica publica: no se conocen detalles de arquitectura, entrenamiento ni contexto, lo que dificulta evaluar su fiabilidad y comportamiento.
- Riesgo de alucinacion y sesgos: al no haber informacion sobre el dataset de entrenamiento, no se pueden anticipar sesgos especificos, pero cualquier modelo sin censura puede generar contenido inapropiado o falso.
- Limitacion de idioma: solo ingles, no apto para uso multilingue.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estandar, lo que impide comparaciones objetivas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base (Liquid-AI/LFM-2.5-2.6B) puede tener restricciones adicionales; se recomienda verificar su licencia.
- La etiqueta "uncensored" implica que no se aplicaron filtros de seguridad, por lo que su uso en produccion requiere moderacion adicional para evitar contenido dañino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OrbitMC/Mew1-2.6B
- Modelo base (referencia): https://huggingface.co/Liquid-AI/LFM-2.5-2.6B (no confirmado como enlace directo, se infiere del campo base_model)
