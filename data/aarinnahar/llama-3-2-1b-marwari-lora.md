# aarinnahar/Llama-3.2-1B-Marwari-LoRA

## Resumen

Llama-3.2-1B-Marwari-LoRA es un ajuste fino mediante LoRA del modelo Llama-3.2-1B-Instruct de Meta, publicado por el usuario aarinnahar en Hugging Face. El nombre sugiere un ajuste orientado al idioma marwari (una lengua indoaria hablada en Rajastán, India), aunque la model card no documenta explícitamente el corpus de entrenamiento ni los objetivos del ajuste más allá de indicar que se realizó con Unsloth.

El modelo parte de la versión cuantizada a 4 bits de Llama-3.2-1B-Instruct distribuida por Unsloth, lo que reduce los requisitos de memoria durante el entrenamiento. El resultado es un adaptador LoRA de pequeño tamaño (el repositorio ocupa 0,1 GB) que hereda la arquitectura transformer decoder-only de Llama 3.2 y su ventana de contexto de 128 000 tokens.

Su relevancia es limitada y experimental: se trata de una publicación sin descargas ni interacciones, sin benchmarks publicados y con documentación mínima. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre modelos pequeños, pero no constituye una opción madura para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con LoRA |
| Parametros totales | 1 240 millones (modelo base Llama-3.2-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredado del modelo base Llama 3.2) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base referenciado está cuantizado a 4 bits (bnb-4bit). No se documentan otras variantes |
| Idiomas soportados | en (según la model card); el nombre sugiere orientación a marwari, no documentada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base en formato Unsloth bnb-4bit |

## Arquitectura y entrenamiento

El modelo es un ajuste fino parametrizado de bajo rango (LoRA) sobre Llama-3.2-1B-Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, del que se congelan los pesos originales y se entrenan únicamente las matrices de adaptación de bajo rango. El entrenamiento se realizó con Unsloth, una librería que optimiza el ajuste fino mediante kernels personalizados y reducción de memoria, partiendo de la variante del modelo base ya cuantizada a 4 bits en formato bnb-4bit.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá del uso de Unsloth. La información disponible sobre el proceso de entrenamiento es, por tanto, mínima.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.2-1B-Instruct.
- Razonamiento básico y respuesta a instrucciones de complejidad baja, limitado por el tamaño de 1B parámetros.
- Generación de código y matemáticas elementales, con fiabilidad limitada por la escala del modelo.
- Soporte de plantillas de chat de Llama 3.2 (roles system/user/assistant).
- Capacidad multilingüe reducida: la model card declara únicamente inglés; el posible soporte de marwari no está verificado ni documentado.
- No se documenta soporte de tool calling, function calling ni flujos de agentes multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Experimentación con ajuste fino en lenguas de bajos recursos: el adaptador sirve como punto de partida para reproducir o ampliar el flujo de entrenamiento LoRA con Unsloth sobre marwari u otras lenguas indoarias.
- Prototipado rápido en entornos con recursos limitados: al ocupar 0,1 GB el adaptador y partir de un modelo de 1B, puede cargarse en GPU de consumo para pruebas de generación de texto.
- Generación de texto asistida en inglés para tareas simples: resúmenes breves, reformulación de frases o respuestas a preguntas cerradas, siempre con revisión humana.
- Base para evaluación comparativa de adaptadores LoRA: útil en estudios que midan el efecto de un ajuste fino de bajo rango sobre un modelo instruct pequeño.
- Docencia y demostraciones de pipelines de transformers: el modelo se integra con la librería transformers y text-generation-inference para ejemplos didácticos.
- Filtrado o clasificación de texto ligera: con ajuste adicional, podría emplearse en tareas de etiquetado simple, aunque no está entrenado específicamente para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para el modelo de 1B; en torno a 0,7-1 GB con cuantización a 4 bits, más el espacio del adaptador LoRA (0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para inferencia con llama.cpp u Ollama.
- Opciones de despliegue: transformers (carga del adaptador LoRA sobre el modelo base), text-generation-inference (etiqueta endpoints_compatible), llama.cpp u Ollama si se convierte el modelo fusionado a GGUF, y vLLM con soporte de LoRA.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño de 1B se espera una latencia baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Marwari-LoRA | 1B (LoRA) | 128 000 | apache-2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Llama-3.2-1B-Instruct | 1B | 128 000 | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base oficial de Meta, con evaluación publicada |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 | apache-2.0 | Hugging Face, muy usado | Alternativa de tamaño similar con benchmarks publicados |
| Gemma-2-2B-it | 2B | 8 192 | Gemma Terms of Use | Hugging Face, ampliamente usado | Mayor tamaño, contexto más corto |

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla dataset, hiperparámetros ni evaluación, lo que impide verificar la calidad del ajuste.
- Riesgo elevado de alucinación: los modelos de 1B parámetros generan con frecuencia contenido incorrecto, especialmente en razonamiento y datos factuales.
- Idiomas: la model card declara solo inglés; el soporte de marwari es una inferencia del nombre y no está verificado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora respecto al modelo base.
- Licencia apache-2.0 declarada por el autor, pero conviene verificar la compatibilidad con la licencia del modelo base Llama 3.2 de Meta antes de uso comercial.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines que requieran function calling fiable.
- Contexto: aunque hereda 128 000 tokens, la calidad en contextos largos con un modelo de 1B es limitada y no está evaluada.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay comunidad ni soporte asociado.

## Enlaces

- Hugging Face: https://huggingface.co/aarinnahar/Llama-3.2-1B-Marwari-LoRA
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
