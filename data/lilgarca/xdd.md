# Lilgarca/xdd

## Resumen

Lilgarca/xdd es un modelo de lenguaje publicado en HuggingFace por el usuario Lilgarca bajo licencia Apache 2.0. Se distribuye en formato GGUF, lo que indica que está pensado para inferencia local con llama.cpp y herramientas compatibles, y cuenta con 229.693.184 parámetros según los datos de safetensors, es decir, aproximadamente 230 millones de parámetros, un tamaño propio de la gama pequeña orientada a ejecución en hardware modesto.

La model card publicada es prácticamente vacía: solo declara la licencia Apache 2.0, sin información sobre arquitectura, datos de entrenamiento, idiomas, contexto o capacidades. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un modelo recién subido o de carácter experimental y sin validación por parte de la comunidad.

Por tanto, esta ficha se limita a documentar los datos verificables (tamaño, formato, licencia y fecha de publicación) y marca explícitamente como no disponibles todos aquellos aspectos que el autor no ha hecho públicos. Cualquier evaluación de calidad, rendimiento o idoneidad para producción requeriría una validación empírica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 229.693.184 (aprox. 230 M) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es GGUF; se desconoce que niveles se han publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. El dato de 229.693.184 parámetros y el formato GGUF son compatibles con un transformer decoder-only de gama pequeña, pero el autor no especifica la familia arquitectónica, el número de capas, la dimensión oculta ni el mecanismo de atención empleado.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT, ni sobre innovaciones técnicas como decodificación especulativa, atención lineal o mezcla de expertos. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio sugiere un uso orientado a diálogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a través de la infraestructura de endpoints de HuggingFace.
- Inferencia local vía GGUF: al publicarse en este formato, es ejecutable con llama.cpp y derivados (Ollama, LM Studio, etc.).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado rápido de chatbots locales: al ser un GGUF de ~230 M de parámetros, puede cargarse en un portátil sin GPU dedicada para validar flujos conversacionales antes de migrar a un modelo mayor.
- Pruebas de integración con llama.cpp y Ollama: sirve como modelo de juguete para verificar pipelines de despliegue, plantillas de prompt y gestión de contexto en entornos de desarrollo.
- Experimentación académica con modelos pequeños: útil para estudiar comportamiento de modelos de ~230 M en tareas controladas, siempre que se valide su calidad con evaluaciones propias.
- Filtrado o clasificación de texto en el borde (edge): su reducido tamaño permite ejecutarlo en dispositivos con recursos limitados para tareas simples de etiquetado, previa evaluación empírica.
- Generación de texto auxiliar en herramientas de escritura: borradores cortos o autocompletado en aplicaciones de escritorio donde la latencia y el consumo importan más que la calidad máxima.
- Base para fine-tuning ligero: con 230 M de parámetros, es viable ajustarlo en una sola GPU consumer para dominios específicos, aunque se desconoce su calidad de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~230 M de parámetros, en FP16 ocuparía aproximadamente 0,46 GB; en cuantización Q4, del orden de 0,15-0,2 GB. Son estimaciones basadas en el recuento de parámetros, no en datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; también puede ejecutarse en CPU.
- GPU consumer: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, e incluso iGPU con memoria compartida).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; también endpoints de HuggingFace según la etiqueta del repositorio.
- Latencia y throughput: no disponibles; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lilgarca/xdd | ~230 M | no disponible | Apache 2.0 | GGUF | Sin model card ni benchmarks |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo pequeño con documentación completa y benchmarks publicados |
| SmolLM2-135M | ~135 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Familia de modelos pequeños de HuggingFace con evaluación publicada |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo de gama pequeña ampliamente evaluado por la comunidad |

La comparación se ofrece a título orientativo por rango de tamaño; no existen datos de rendimiento de Lilgarca/xdd que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre arquitectura, datos de entrenamiento, idiomas ni contexto, lo que impide evaluar su idoneidad para cualquier caso de uso.
- Riesgo elevado de alucinación y respuestas incoherentes: sin benchmarks ni validación comunitaria, no hay garantía de calidad mínima.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible anticipar sesgos de género, idioma, cultura o dominio.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el contenido ni sobre el origen de los datos de entrenamiento.
- Sin soporte ni mantenimiento conocido: cero descargas y cero likes en el momento de la consulta; no hay comunidad ni issues que permitan resolver dudas.
- No recomendado para producción sin evaluación previa: cualquier despliegue debería ir precedido de una batería de pruebas propia sobre las tareas objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lilgarca/xdd
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
