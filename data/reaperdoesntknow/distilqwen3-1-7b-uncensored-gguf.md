# reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF

## Resumen

DistilQwen3-1.7B-uncensored-GGUF es una variante cuantizada en formato GGUF del modelo DistilQwen3-1.7B-uncensored, desarrollado por Convergent Intelligence LLC (Research Division). Se trata de un modelo de lenguaje destilado a partir del teacher Qwen3-30B-A3B mediante una metodología propia basada en "Discrepancy Calculus" (DISC) y "Topological Knowledge Distillation". El objetivo es ofrecer un modelo compacto, de bajo coste computacional y apto para entornos edge, manteniendo un comportamiento conversacional sin filtros de censura explícitos.

El modelo base cuenta con 2.031.739.904 parámetros totales (según los pesos safetensors originales), aunque la nomenclatura "1.7B" sugiere que se refiere a una métrica distinta, probablemente parámetros activos o una convención de la serie. La versión GGUF aquí presentada está optimizada para inferencia eficiente en CPU, GPU de consumo y plataformas como Ollama o FriendliAI. La licencia es Apache-2.0, lo que permite uso comercial y modificación. A fecha de creación (marzo de 2026) acumula 3.005 descargas en Hugging Face, lo que indica cierto interés en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer denso por destilación, sin confirmar) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados (el repositorio contiene 9.0 GB, probablemente múltiples archivos GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es una destilación de Qwen3-30B-A3B (un modelo MoE de 30B parámetros con 3B activos) hacia un modelo de aproximadamente 1.7B-2B parámetros. El entrenamiento se realizó en GPUs H100, según la model card. La metodología empleada, denominada "Discrepancy Calculus" (DISC), introduce un operador de discrepancia \(Df(x)\) y una descomposición de variación acotada (BV) que se integran en el proceso de destilación. Estos conceptos matemáticos se utilizan para detectar límites estructurales en los datos de entrenamiento y transferir el conocimiento del teacher al student de forma ponderada ("proof-weighted distillation"). La cuantización a GGUF preserva las propiedades estructurales aprendidas, ya que los límites detectados por DISC quedan codificados en los pesos, no en la precisión numérica.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La etiqueta "uncensored" sugiere que el modelo no ha sido sometido a un ajuste de rechazo de contenido, pero no hay confirmación explícita.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que indica que puede mantener diálogos multi-turno.
- Sin censura explícita: la variante "uncensored" implica que no se han aplicado filtros de contenido durante el entrenamiento o el ajuste, aunque no se especifica el alcance.
- Eficiencia en edge: al ser un modelo pequeño y cuantizado, puede ejecutarse en dispositivos con recursos limitados.
- Compatibilidad con herramientas de inferencia estándar: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, etc.
- Integración en plataformas cloud: aparece listado en FriendliAI, lo que sugiere soporte para despliegue escalable.

No hay información confirmada sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingües o modos de pensamiento.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede desplegarse en un portátil o mini-PC con Ollama para ofrecer un chatbot privado sin depender de la nube, gracias a su tamaño reducido y formato GGUF.
- Prototipado rápido de aplicaciones de chat: los desarrolladores pueden integrarlo en entornos de desarrollo para validar flujos conversacionales antes de escalar a modelos mayores.
- Generación de contenido creativo sin restricciones: su naturaleza "uncensored" lo hace adecuado para experimentos de escritura libre, lluvia de ideas o generación de textos donde se requiera evitar bloqueos temáticos.
- Educación e investigación en destilación: sirve como ejemplo práctico de destilación de conocimiento desde un MoE grande a un modelo denso pequeño, útil para estudiar la metodología DISC.
- Inferencia en CPU: al estar cuantizado, puede ejecutarse en servidores sin GPU, reduciendo costes de infraestructura para tareas de baja latencia.
- Sistemas de respuesta automática en foros o comunidades: su capacidad conversacional permite moderar o responder preguntas frecuentes con un tono natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M (típica en GGUF), un modelo de ~2B parámetros ocupa aproximadamente 1.5-2 GB de memoria. Con Q8, alrededor de 2.5-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo cómodamente. También funciona en GPU integradas con suficiente RAM compartida.
- CPU: puede ejecutarse en CPU modernas con 8 GB de RAM, gracias a la cuantización GGUF y al soporte de llama.cpp.
- Opciones de despliegue: Ollama, llama.cpp, LM Studio, vLLM (si se convierte a otro formato), FriendliAI (plataforma cloud).
- Latencia: al ser un modelo pequeño, la generación es rápida; en una GPU moderna se pueden obtener decenas de tokens por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas directas con otros modelos. Como referencia cualitativa, podría compararse con otros modelos destilados de la serie Qwen3 (por ejemplo, Qwen3-0.6B o Qwen3-1.7B originales), pero no hay información suficiente para establecer una tabla objetiva. Se recomienda consultar el paper "Structure Over Scale" (DOI: 10.57967/hf/8165) para conocer la metodología, aunque no incluye comparativas numéricas públicas.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o inapropiado. No debe desplegarse en entornos de producción sin moderación adicional.
- No hay información sobre sesgos demográficos o culturales; al carecer de benchmarks y de detalles del dataset, no se puede evaluar su comportamiento en temas sensibles.
- La longitud de contexto no está especificada; se desconoce si soporta ventanas largas (por ejemplo, 32K tokens) o si está limitado a 4K-8K.
- No se han publicado resultados de rendimiento en tareas estándar, por lo que no se puede comparar objetivamente con otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base "uncensored" puede implicar riesgos legales si se utiliza para generar contenido que infrinja normativas locales.
- La metodología de destilación (DISC) está documentada en un paper con DOI, pero no se ha validado externamente ni se han reproducido los resultados.

## Enlaces

- [Hugging Face - DistilQwen3-1.7B-uncensored-GGUF](https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored)
- [Paper "Structure Over Scale" (DOI: 10.57967/hf/8165)](https://doi.org/10.57967/hf/8165)
- [FriendliAI - página del modelo](https://friendli.ai/models/reaperdoesntknow/DistilQwen3-1.7B-uncensored)
- [Ollama - DistilQwen3-1.7B-uncensored](https://ollama.com/reaperdoesntrun/DistilQwen3-1.7B-uncensored:latest)
