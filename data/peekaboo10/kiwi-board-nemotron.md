# peekaboo10/kiwi-board-nemotron

## Resumen

Kiwi Board-Artist es un adaptador LoRA desarrollado por peekaboo10 (Bhavishya Puchakayala) sobre el modelo base NVIDIA Nemotron 3 Nano 4B (BF16). Su función es generar el JSON de operaciones de pizarra (board-op JSON) que utiliza el tutor virtual Kiwi, un asistente educativo que dibuja mientras explica conceptos. Dado un paso de lección (tema, contenido ya presente en la pizarra y la frase que se está pronunciando), el modelo produce las instrucciones exactas para colocar formas, curvas, etiquetas y notas sin solapamientos.

El modelo resuelve un problema específico de la educación asistida por IA: coordinar la generación de lenguaje natural con la representación visual en tiempo real. En lugar de recurrir a un modelo generalista que improvisa el layout, este adaptador ha sido entrenado para emitir JSON estructurado y validado geométricamente, lo que garantiza que cada elemento dibujado no interfiera con los anteriores. Su relevancia radica en demostrar cómo un ajuste fino ligero sobre un modelo compacto puede especializarse en una tarea de salida estructurada con alta precisión.

El adaptador emplea LoRA con r=32 sobre todas las capas lineales, se entrenó durante dos épocas con un dataset programático de 3.553 ejemplos y alcanzó una pérdida final de evaluación de 0,0209. El tamaño total del repositorio es de 0,2 GB, lo que lo hace muy ligero para integrar en sistemas de tutoría en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (NVIDIA Nemotron 3 Nano 4B) con adaptador LoRA (r=32, all-linear) |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos base), safetensors |
| Idiomas soportados | No disponibles (no especificado en la documentacion) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3 Nano 4B, un transformer denso optimizado para despliegue en edge y PC. Sobre él se aplicó un adaptador LoRA de rango 32 que modifica todas las proyecciones lineales de la arquitectura. Esta configuración permite ajustar el comportamiento del modelo sin modificar los pesos originales, reduciendo drásticamente el coste de entrenamiento y el espacio de almacenamiento.

El entrenamiento se realizó sobre el dataset `peekaboo10/kiwi-whiteboard-lessons`, compuesto por 3.553 pasos de lección construidos programáticamente. Cada ejemplo cubre una de 8 familias de diagramas y 34 temas, y fue validado para que el JSON generado produjera una pizarra sin solapamientos, sin necesidad de corrección posterior del layout. Se entrenó durante 2 épocas con una pérdida final de validación de 0,0209. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el ajuste es puramente supervisado sobre la tarea específica.

## Capacidades

- Generación de JSON estructurado de operaciones de pizarra: formas, curvas, etiquetas y notas con posicionamiento sin solapamientos.
- Comprensión de contexto de lección: recibe el tema, el estado actual de la pizarra y la frase hablada, y decide qué elementos añadir.
- Salida determinista y validada geométricamente, sin necesidad de post-procesado.
- Especialización en 8 familias de diagramas (por ejemplo, diagramas de flujo, mapas conceptuales, líneas de tiempo, etc.) y 34 temas educativos.
- No incluye capacidades generales de tool calling, razonamiento multimodal ni agentes; su función es exclusivamente la generación de instrucciones de dibujo.

## Casos de uso

- Tutor virtual interactivo: el modelo se integra en el sistema Kiwi para que, mientras el tutor explica una lección, genere en tiempo real las instrucciones de dibujo que se muestran en una pizarra virtual, manteniendo coherencia visual con el discurso.
- Generación automática de material didáctico visual: a partir de guiones de lección, el modelo produce el JSON necesario para renderizar diagramas educativos en aplicaciones web o móviles, ahorrando horas de diseño manual.
- Asistentes de estudio personalizados: plataformas de aprendizaje pueden usar el modelo para crear explicaciones paso a paso con acompañamiento visual, adaptándose al ritmo del estudiante.
- Creación de contenido para cursos online: generación de pizarras animadas para vídeos educativos, donde cada paso se dibuja de forma secuencial y ordenada.
- Simuladores de pizarra en entornos de formación docente: los profesores pueden ensayar explicaciones y recibir sugerencias visuales automáticas basadas en el contenido hablado.
- Integración en sistemas de tutoría por voz: al combinar el modelo con un motor de síntesis de voz, se puede ofrecer una experiencia de aprendizaje multimodal donde el dibujo acompaña a la narración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o GSM8K) en la informacion disponible. El único dato de rendimiento reportado es la pérdida de evaluación final de 0,0209 durante el entrenamiento, que indica un buen ajuste a la tarea de generación de board-op JSON, pero no es comparable con métricas generales de razonamiento o generación de texto.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo base de 4B en BF16, el conjunto completo requiere aproximadamente 8-10 GB de VRAM para inferencia en GPU. El adaptador en sí ocupa menos de 0,2 GB.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, A10, L4 o superiores. También puede ejecutarse en CPU con cuantización del modelo base, aunque con mayor latencia.
- Compatibilidad con GPU consumer: sí, cualquier GPU con al menos 8 GB de VRAM puede cargar el modelo base cuantizado a 8 bits o 4 bits junto con el adaptador.
- Opciones de despliegue: se puede servir con vLLM, Text Generation Inference (TGI) o llama.cpp, cargando el adaptador mediante la librería PEFT de Hugging Face. También es posible usar Ollama si se empaqueta correctamente.
- Latencia y throughput: no se han publicado datos concretos; al ser un modelo de 4B, se espera una latencia de decodificación de unos 20-40 tokens/s en una GPU como la RTX 4090, pero esto depende del backend y la cuantización.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo dominio específico (generación de JSON de pizarra educativa). Como referencia de modelos de generación de JSON estructurado, se podría mencionar a modelos como Llama 3.1 8B o Qwen 2.5 7B, pero no están especializados en esta tarea y requerirían un ajuste fino adicional. La comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo está altamente especializado en la generación de board-op JSON para el tutor Kiwi; fuera de ese formato, su utilidad es muy limitada.
- No se han documentado sesgos específicos, pero al ser un adaptador sobre un modelo base, puede heredar sesgos del modelo Nemotron original.
- Riesgo de alucinación en entradas fuera de distribución: si el paso de lección no sigue la estructura esperada, el modelo podría generar JSON inválido o con solapamientos no deseados.
- La licencia nvidia-open-model-license debe revisarse detenidamente antes de un uso comercial; aunque es una licencia abierta, puede incluir restricciones sobre redistribución o uso en ciertos sectores.
- El modelo no es multilingüe de forma garantizada; la documentación no especifica los idiomas soportados, por lo que se recomienda probar en el idioma de destino antes de desplegar en producción.
- No se proporcionan métricas de rendimiento en tareas generales de lenguaje, por lo que no debe utilizarse como modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peekaboo10/kiwi-board-nemotron
- Dataset de entrenamiento: https://huggingface.co/datasets/peekaboo10/kiwi-whiteboard-lessons
- Perfil del autor: https://huggingface.co/peekaboo10
- Página oficial de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio de Nemotron en GitHub: https://github.com/NVIDIA-NeMo/Nemotron
- Espacio de Kiwi (demo del tutor): https://huggingface.co/spaces/peekaboo10/Kiwi
