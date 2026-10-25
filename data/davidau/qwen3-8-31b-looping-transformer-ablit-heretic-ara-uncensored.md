# DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored

## Resumen
Este repositorio contiene un ajuste fino del modelo Qwen/Qwen3.8-27B publicado por el usuario DavidAU bajo el identificador Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored. Se trata de una variante experimental que combina tres intervenciones sobre el modelo base: una modificación arquitectónica etiquetada como "looping transformer" (reciclado de capas), un proceso de abliteration ("Ablit", "Heretic") orientado a eliminar los mecanismos de rechazo, y un ajuste adicional denominado "ARA" que el autor no documenta en la información disponible. El resultado es un modelo de 30.825.577.520 parámetros (unos 30,8 mil millones) que, partiendo de un base de 27B, incrementa el cómputo efectivo por token mediante la repetición de bloques.

El pipeline declarado es image-text-to-text, por lo que el modelo conserva la torre visual del base y acepta entradas de imagen junto a texto, aunque la ficha solo declara inglés como idioma soportado y no publica resultados de evaluación. La licencia es Apache-2.0 y los pesos están en safetensors para la librería transformers, con un tamaño de repositorio de 61,7 GB, lo que sitúa la inferencia en FP16 por encima de los 60 GB de VRAM.

Su relevancia ahora es acotada y de perfil experimental: acumula 6 descargas y 23 likes desde su creación el 23 de octubre de 2026, el acceso está restringido (gated) y no hay benchmarks publicados. Resulta interesante como objeto de estudio de técnicas de abliteration y de arquitecturas con reciclado de capas, no como modelo de producción sin una evaluación previa propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con modificación "looping transformer" (reciclado de capas); tag de arquitectura en el repo: qwen3_5 |
| Parámetros totales | 30.825.577.520 (~30,8 B), dato real de safetensors |
| Parámetros activos | No disponible; no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se publican cuantizaciones en el repositorio; pesos en safetensors convertibles a GGUF, AWQ o GPTQ |
| Idiomas soportados | En (inglés) según la ficha del modelo |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers) |
| Modalidad | Image-text-to-text (visión + lenguaje) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamaño del repositorio | 61,7 GB |
| Modelo base | Qwen/Qwen3.8-27B (finetune) |
| Descargas / likes | 6 / 23 |
| Fechas | Creado 2026-10-23; actualizado 2026-10-25 |

## Arquitectura y entrenamiento
La información disponible solo permite afirmar que se parte de Qwen/Qwen3.8-27B, un transformer decoder-only con torre visual (el pipeline declarado es image-text-to-text), y que se aplica una modificación de tipo "looping transformer". Esta familia de arquitecturas reutiliza un mismo bloque de capas varias veces por token, de modo que el número de parámetros almacenados crece menos que el cómputo efectivo; de ahí que el modelo declare 30,8 B de parámetros frente a los 27 B del base. No se especifica en la información proporcionada cuántas capas se reciclan, cuántas iteraciones se aplican ni cómo afecta esto a la longitud de contexto efectiva.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Las etiquetas "abliterated", "heretic" y "ARA" indican una edición de pesos orientada a suprimir la dirección de rechazo en el espacio de activaciones, una técnica que no requiere reentrenamiento completo y que típicamente se aplica con pares de prompts contrastivos. No hay información pública en esta ficha sobre la metodología exacta, el volumen de datos de calibración ni las métricas de degradación asociadas al proceso.

## Capacidades
- Generación de texto conversacional multi-turno, con el formato de chat heredado del modelo base.
- Procesamiento de entradas de imagen junto a texto (pipeline image-text-to-text), incluyendo descripción de imágenes y respuesta a preguntas sobre su contenido.
- Comportamiento sin alineación de rechazo: el proceso de abliteration elimina los mecanismos de negativa del base, por lo que responde a peticiones que el modelo original declinaría.
- Reciclado de capas: el autor presenta la arquitectura como "looping transformer", lo que en teoría incrementa la profundidad efectiva sin aumentar los parámetros almacenados.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado ni documentado.
- Capacidades multilingües: la ficha solo declara inglés; el comportamiento en otros idiomas no está verificado.
- Modo "thinking" explícito: no documentado.

## Casos de uso
- Investigación sobre abliteration: comparar las respuestas de este modelo con las de Qwen/Qwen3.8-27B sobre el mismo conjunto de prompts permite medir empíricamente qué direcciones de activación codifican el rechazo y cuantificar la degradación en tareas de razonamiento.
- Estudio de arquitecturas con reciclado de capas: al mantener la interfaz de transformers, se puede instrumentar el modelo para registrar activaciones por iteración y analizar si la repetición de bloques mejora la composición de operaciones en tareas de razonamiento aritmético.
- Generación de datos sintéticos para fine-tuning: su carácter sin filtros permite producir corpus de texto diversos para destilar en modelos más pequeños, siempre que se aplique un filtrado posterior de calidad y seguridad antes de usar el dataset.
- Escritura creativa y ficción sin restricciones temáticas: útil en entornos editoriales que necesitan tramos de diálogo o narrativa con violencia o contenido adulto que los modelos alineados rechazan sistemáticamente.
- Red-teaming y evaluación de seguridad: sirve como modelo "no alineado" de referencia para probar clasificadores de contenido, guardarraíles y filtros de salida en pipelines de moderación.
- Experimentación multimodal autoalojada: al conservar la torre visual, permite prototipar pipelines de descripción de imágenes y extracción de información de documentos escaneados en infraestructura propia, sin depender de API externas.
- Base para fine-tuning de dominio con licencia permisiva: Apache-2.0 facilita adaptar los pesos a un dominio concreto (legal, técnico, sanitario), aunque conviene verificar las condiciones del modelo base y del acceso gated antes de un uso comercial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM en FP16/BF16: aproximadamente 61,7 GB solo para pesos, más caché KV y el codificador visual; en la práctica requiere 65-70 GB, lo que implica varias GPU o una GPU de 80 GB.
- VRAM en INT8: en torno a 31 GB de pesos; encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB, dejando margen limitado para contexto largo.
- VRAM en INT4: aproximadamente 16-18 GB de pesos; cabe en RTX 4090 24 GB, RTX 3090 24 GB o L4 24 GB, con poco espacio para caché KV si se usan contextos amplios.
- GPU recomendadas: H100 80 GB o A100 80 GB para FP16; A100 40 GB o L40S para INT8; RTX 4090 o RTX 3090 para cuantización de 4 bits.
- Despliegue: transformers de forma nativa; vLLM y TGI requieren verificar compatibilidad con la arquitectura qwen3_5 y el pipeline multimodal; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles. El reciclado de capas incrementa el cómputo por token respecto al modelo base, pero la información proporcionada no indica el factor de repetición ni su impacto medido en latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Acceso | Benchmarks |
|---|---|---|---|---|---|---|
| Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored (DavidAU) | 30,8 B | No disponible | Image-text-to-text | Apache-2.0 | Gated | No publicados |
| Qwen/Qwen3.8-27B (modelo base) | 27 B | No disponible en la información | Image-text-to-text | No disponible en la información | No disponible en la información | No disponibles en la información |
| Otras variantes abliterated de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No disponible | No disponibles |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. El modelo aquí descrito añade 3,8 B de parámetros respecto al base, presumiblemente por el esquema de reciclado, y se distribuye con acceso restringido y solo 6 descargas, frente a la distribución estándar del base.

## Limitaciones y advertencias
- Solo se declara inglés como idioma soportado; el rendimiento en castellano u otras lenguas no está verificado y el tokenizador del base no garantiza paridad.
- La abliteration suprime el rechazo de forma deliberada: el modelo puede generar contenido dañino, ilegal o sexual sin filtros, lo que exige guardarraíles externos si se expone a usuarios.
- Los procesos de abliteration suelen degradar capacidades de razonamiento, matemáticas y seguimiento de instrucciones; no hay benchmarks publicados que permitan cuantificar esa pérdida en esta variante.
- Riesgo elevado de alucinación: sin evaluación publicada ni datos de entrenamiento documentados, la fiabilidad factual es desconocida.
- Arquitectura experimental: el esquema "looping transformer" puede no estar soportado por vLLM, TGI u otros servidores de inferencia, y la etiqueta qwen3_5 frente al base Qwen3.8-27B sugiere posibles incompatibilidades de configuración.
- Longitud de contexto no documentada: no es posible planificar cargas de trabajo con ventanas largas sin medirla empíricamente.
- Validación comunitaria mínima: 6 descargas y 23 likes desde octubre de 2026 indican que el modelo no ha sido replicado ni auditado por terceros.
- Acceso gated: requiere aceptar condiciones en HuggingFace, lo que puede bloquear automatizaciones y despliegues reproducibles.
- Licencia Apache-2.0 declarada para este repositorio, pero deben verificarse por separado las condiciones del modelo base Qwen/Qwen3.8-27B y las cláusulas adicionales del acceso restringido antes de un uso comercial.
- Tamaño de 61,7 GB en safetensors: no cabe en una GPU de consumo en FP16 y obliga a cuantización o sharding.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-31B-Looping-Transformer-Ablit-Heretic-ARA-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; las búsquedas devolvieron únicamente anuncios de servicios de acompañamiento sin relación con el repositorio, por lo que no se incluyen.
