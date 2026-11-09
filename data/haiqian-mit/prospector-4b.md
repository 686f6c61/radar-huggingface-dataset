# haiqian-mit/Prospector-4B

## Resumen

Prospector-4B es un modelo de lenguaje compacto desarrollado por el grupo de investigación haiqian-mit (MIT) y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino del modelo base Qwen3.5-4B, post-entrenado específicamente para responder preguntas sobre grafos de conocimiento científico mediante el uso de herramientas. El modelo no responde directamente: ejecuta un bucle de razonamiento agéntico en el que invoca herramientas de búsqueda y expansión sobre un grafo, una llamada por turno, y construye una cadena de aristas que se verifica contra lo que devolvieron las herramientas.

La relevancia del modelo reside en su enfoque: en lugar de memorizar conocimiento factual, aprende una política de traversal de grafos. Con los pesos congelados, la política transfiere a grafos de otros dominios distintos al de entrenamiento, lo que sugiere una capacidad de generalización estructural más que memorística. El checkpoint servido es Qwen3.5-4B con tres adaptadores LoRA fusionados en el modelo de lenguaje, bajo la plantilla de chat de la política.

El modelo tiene 4.659.865.088 parámetros totales y un tamaño de repositorio de 9,3 GB. Está pensado para integrarse en un harness externo que le proporcione las herramientas y gestione el bucle de episodios; por sí solo, el modelo emite una única llamada a herramienta y se detiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con tres adaptadores LoRA fusionados |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el protocolo de evaluación usa 1.024 tokens por turno) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Prospector-4B parte de Qwen3.5-4B, un transformer denso de aproximadamente 4,66 mil millones de parámetros. Sobre el modelo de lenguaje se entrenaron tres adaptadores LoRA que se fusionaron en los pesos finales, de modo que el checkpoint resultante conserva el layout de Qwen3.5-4B y carga en cualquier entorno donde cargue el modelo base. La política se sirve con una plantilla de chat específica que estructura los turnos de razonamiento (`<think>`) y las llamadas a herramientas (`<tool_call>`).

El entrenamiento se realizó sobre un grafo de conocimiento construido a partir de literatura de fabricación de semiconductores. La política aprende a traversar el grafo con herramientas, una llamada por turno, y a emitir una respuesta final con una cadena de aristas que se valida contra las observaciones devueltas por las herramientas (gate de verificación). El protocolo de evaluación emplea 20 llamadas a herramienta como presupuesto, 1.024 tokens por turno y decodificación greedy. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable es el mecanismo de verificación: la respuesta final se comprueba contra las aristas efectivamente vistas durante el episodio, lo que permite medir si el modelo cita evidencia real del grafo o alucina conexiones. Además, los pesos congelados transfieren a grafos de otros tres campos distintos al de entrenamiento.

## Capacidades

- Generación de texto y razonamiento estructurado en formato de cadena de pensamiento (`<think>`).
- Uso de herramientas (tool calling) con un formato JSON específico: `find` para localizar entidades y `expand` para explorar conexiones de un nodo.
- Traversal de grafos de conocimiento paso a paso, una llamada por turno, con seguimiento del presupuesto de llamadas.
- Respuesta a preguntas sobre grafos científicos con cita de aristas verificables.
- Razonamiento científico aplicado a dominios como fabricación de semiconductores, y transferencia a grafos de otras disciplinas (biograph, pfas, matprop).
- Razonamiento multi-paso dentro de un episodio agéntico gestionado por un harness externo.
- Capacidades multilingües: no disponible.

## Casos de uso

- **Respuesta a preguntas sobre literatura científica estructurada**: el modelo recorre un grafo de conocimiento construido a partir de publicaciones y devuelve una respuesta con la cadena de aristas que la respalda. Es adecuado porque el gate de verificación permite auditar cada conexión citada contra las observaciones de las herramientas.
- **Asistente de exploración de dominios técnicos**: un investigador puede plantear preguntas abiertas sobre un campo (por ejemplo, metrología de semiconductores) y el modelo explora el grafo mediante `find` y `expand` para localizar entidades y relaciones relevantes.
- **Verificación de afirmaciones contra una base de conocimiento**: dado que la respuesta final se comprueba contra las aristas vistas, el modelo sirve para validar si una relación científica está respaldada por el grafo o no.
- **Extracción de rutas de conocimiento en pipelines de análisis**: integrado en un harness, el modelo puede generar trayectorias de traversal que se registran y reutilizan como datos de entrenamiento o para auditoría.
- **Prototipado de agentes sobre grafos**: al ser un modelo de 4B con licencia Apache 2.0, es adecuado para experimentar con políticas de traversal en entornos de investigación sin coste de licencia.
- **Transferencia a nuevos dominios con pesos congelados**: el modelo transfiere a grafos de otros campos sin reentrenamiento, lo que permite desplegarlo sobre una nueva base de conocimiento simplemente proporcionando el grafo y el harness.
- **Evaluación de robustez de agentes**: el protocolo de 20 llamadas y el gate de verificación permiten medir de forma reproducible la calidad de las trayectorias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio ocupa 9,3 GB en safetensors, lo que corresponde a pesos en precisión de 16 bits para 4,66 mil millones de parámetros. En fp16 se requieren aproximadamente 9-10 GB de VRAM; en cuantización de 8 bits, en torno a 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones a partir del tamaño de parámetros, no confirmadas en la información disponible).
- **GPU recomendadas**: no se especifican en la información disponible. Por tamaño, cabría en GPUs de consumo con suficiente VRAM y en GPUs de datacenter (A100, H100) para servir múltiples episodios.
- **Compatibilidad con GPU de consumo**: probable en GPUs con 12 GB o más en fp16, y en GPUs con 6-8 GB en cuantización de 4-8 bits, aunque no se confirma en la documentación.
- **Opciones de despliegue**: el ejemplo oficial soporta tres motores mediante prefijo: `mlx:` para Apple Silicon, `vllm:` para GPU NVIDIA y `hf:` para transformers. No se mencionan llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. El protocolo de evaluación usa decodificación greedy y 1.024 tokens por turno, con un presupuesto de 20 llamadas por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prospector-4B | 4,66 B | no disponible | Política de traversal de grafos con herramientas | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | ~4 B | no disponible | LLM generalista | no disponible | Hugging Face |
| Alternativas de agentes sobre grafos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos en la información proporcionada. La comparación más directa es con su modelo base Qwen3.5-4B, del que hereda arquitectura y layout, pero del que no se detallan especificaciones en la documentación disponible.

## Limitaciones y advertencias

- **Dependencia de un harness externo**: el modelo por sí solo emite una única llamada a herramienta y se detiene; requiere el harness del repositorio de GitHub para ejecutar episodios completos.
- **Formato de herramientas específico**: solo funciona correctamente con el formato de llamada (`find`, `expand`) y la plantilla de chat de la política; no es un modelo generalista de tool calling.
- **Riesgo de alucinación en las aristas**: aunque el gate de verificación comprueba las aristas citadas contra las observaciones, el modelo podría citar conexiones no vistas o responder sin evidencia suficiente.
- **Dominio de entrenamiento limitado**: entrenado sobre un grafo de fabricación de semiconductores; la transferencia a otros grafos se demuestra con pesos congelados, pero el rendimiento en dominios muy distintos no está cuantificado en la información disponible.
- **Idiomas**: no se especifican los idiomas soportados; la documentación y los ejemplos están en inglés.
- **Contexto**: no se especifica la longitud de contexto del modelo; el protocolo de evaluación limita a 1.024 tokens por turno.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, cuya licencia no se detalla en la información disponible.
- **Madurez**: el repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haiqian-mit/Prospector-4B
- Repositorio de código: https://github.com/lamm-mit/Prospector
- Adaptadores, datos de entrenamiento, ejecuciones y grafo de semiconductores: https://huggingface.co/lamm-mit/Prospector
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
