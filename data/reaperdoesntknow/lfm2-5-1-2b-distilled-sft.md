# reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT

## Resumen

LFM2.5-1.2B-Distilled-SFT es un modelo de lenguaje de 1.200 millones de parámetros con arquitectura híbrida SSM + atención, desarrollado por Convergent Intelligence LLC (autor: reaperdoesntknow) sobre la base de liquid/LFM2.5-1.2B-Instruct. Se trata de un modelo de propósito específico que combina dos etapas de entrenamiento: una primera de destilación de conocimiento desde el profesor LFM2-24B-A2B (un MoE híbrido de 24B con 2B activos) sobre datos STEM de cadena de pensamiento, y una segunda de ajuste fino supervisado (SFT) sobre inferencia lógica formal. El resultado es un modelo compacto orientado a razonamiento matemático, físico y lógico en dispositivos de borde.

El modelo destaca por su eficiencia de inferencia: 239 tokens por segundo en CPU AMD y 82 tokens por segundo en NPU móvil, con un uso de memoria inferior a 1 GB en configuraciones cuantizadas. Su contexto de entrenamiento es de 1024 tokens, suficiente para problemas de razonamiento paso a paso. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en la tendencia hacia IA en el borde (edge AI) con capacidades de razonamiento estructurado, un nicho donde los modelos densos de ~1B suelen carecer de robustez lógica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (híbrido SSM + atención, causal LM) |
| Parametros totales | 1.304.558.336 (1.2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | GGUF disponible en repo separado (tipos no especificados en la fuente) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal) y GGUF (repo secundario) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2.5 de Liquid AI, una familia de modelos híbridos que combina capas de espacio de estados (SSM) con mecanismos de atención. Esta combinación está diseñada para ofrecer un equilibrio entre eficiencia computacional y capacidad de modelado secuencial, siendo especialmente adecuada para tareas de razonamiento lógico donde la propagación de estado es fundamental. El modelo base es liquid/LFM2.5-1.2B-Instruct, ya ajustado para instrucciones.

El entrenamiento se realizó en dos etapas. La primera consistió en destilación de conocimiento desde LFM2-24B-A2B, un modelo MoE híbrido de 24B con 2B parámetros activos, sobre 2.802 muestras de cadena de pensamiento (CoT) en cinco dominios STEM: álgebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), matemáticas generales (576) y mecánica clásica (343). La función de pérdida combinó un 55% de entropía cruzada ponderada por tokens de derivación (con pesos decrecientes de 2.5 a 1.5) y un 45% de divergencia KL con temperatura 2.0. La segunda etapa aplicó SFT sobre KK04/LogicInference_OA, una reproducción del dataset LogicInference de Google Research, con aproximadamente 54.607 pares instrucción-respuesta en formato LOGICINFERENCEe. Se usó una época en cada etapa, batch efectivo de 8, y tasas de aprendizaje de 1.5e-5 a 1e-6 (coseno) en la primera y 5e-6 en la segunda, con precisión bf16.

## Capacidades

- Razonamiento STEM estructurado: resuelve problemas de álgebra lineal, ecuaciones diferenciales, electromagnetismo, mecánica clásica y matemáticas generales con derivaciones paso a paso.
- Inferencia lógica formal: maneja proposiciones, reglas de inferencia y cadenas de razonamiento lógico, gracias al SFT sobre LogicInference.
- Generación de texto causal: mantiene las capacidades base del modelo LFM2.5-1.2B-Instruct para generación conversacional y de texto libre.
- Eficiencia en dispositivos de borde: 239 tok/s en CPU AMD y 82 tok/s en NPU móvil, con uso de RAM inferior a 1 GB en versiones cuantizadas.
- Dos formatos de prompt diferenciados: uno para derivaciones STEM (formato "Problem/Proof/Final Answer") y otro para inferencia lógica (formato "### Instruction/### Response").
- No se documenta soporte de tool calling, function calling ni capacidades multimodales en la información disponible.

## Casos de uso

- Tutoría STEM en dispositivos móviles: el modelo puede guiar a estudiantes en la resolución de problemas de matemáticas y física, mostrando el razonamiento paso a paso. Su baja huella de memoria permite ejecutarlo en smartphones con NPU, ofreciendo asistencia sin conexión.
- Asistente de verificación de demostraciones lógicas: en entornos académicos o de programación, puede validar cadenas de inferencia proposicional y explicar por qué una conclusión se sigue (o no) de unas premisas dadas, útil para herramientas de enseñanza de lógica.
- Razonamiento matemático embebido en IoT: en dispositivos de automatización industrial o sensores inteligentes, el modelo puede procesar problemas de optimización lineal o ecuaciones diferenciales simples en tiempo real, sin depender de la nube.
- Generación de explicaciones de código científico: dado un fragmento de código que implementa un algoritmo matemático, el modelo puede generar una explicación formal del razonamiento subyacente, útil para documentación técnica.
- Chatbot de soporte técnico en STEM: integrado en un sistema de atención al cliente para productos técnicos, puede resolver consultas de física o matemáticas aplicadas con respuestas rigurosas y derivaciones, reduciendo la escalada a personal humano.
- Prototipado rápido de agentes de razonamiento en edge: al ser ligero y compatible con GGUF, puede desplegarse en Raspberry Pi o dispositivos similares para experimentar con agentes de razonamiento lógico en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Los únicos datos de rendimiento son los de velocidad de inferencia: 239 tok/s en CPU AMD y 82 tok/s en NPU móvil, según el autor.

## Requisitos de hardware

- VRAM estimada: en bf16, el modelo requiere aproximadamente 2.6 GB de VRAM (1.304.558.336 × 2 bytes). En fp32, unos 5.2 GB. Con cuantización GGUF Q4, alrededor de 0.7-0.8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo en bf16 (por ejemplo, RTX 3050, RTX 4060, RTX 4090). Para cuantización GGUF, basta con 1-2 GB de VRAM.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de gama media y baja, así como en CPU (239 tok/s en AMD) y NPU móvil (82 tok/s).
- Opciones de despliegue: transformers (con device_map="auto"), llama.cpp para GGUF, Ollama si se añade a su catálogo, vLLM para inferencia de alto rendimiento en servidores, y TGI para despliegue en producción.
- Latencia y throughput: no se proporcionan datos de latencia por token en la fuente, pero la velocidad de 239 tok/s en CPU indica una latencia de aproximadamente 4.2 ms por token en esa configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-1.2B-Distilled-SFT | 1.2B | Híbrido SSM + atención | 1024 (entrenamiento) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| LFM2.5-1.2B-Instruct (base) | 1.2B | Híbrido SSM + atención | No especificado | Apache 2.0 | safetensors | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | Transformer denso | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama-3.2-1B-Instruct | 1.2B | Transformer denso | 128K | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos. La principal diferencia de LFM2.5-1.2B-Distilled-SFT es su arquitectura híbrida SSM + atención, que le otorga una ventaja en eficiencia sobre CPU y NPU frente a los transformers puros, aunque su contexto de entrenamiento es significativamente menor que el de Qwen2.5 o Llama-3.2.

## Limitaciones y advertencias

- Contexto limitado: el entrenamiento se realizó con 1024 tokens, lo que restringe la capacidad de manejar problemas largos o conversaciones extensas. En inferencia puede extenderse, pero el rendimiento podría degradarse.
- Solo inglés: no hay soporte documentado para otros idiomas, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación: como todo modelo generativo, puede producir derivaciones o conclusiones plausibles pero incorrectas, especialmente en problemas fuera de su distribución de entrenamiento.
- Sesgos del dataset: los datos de entrenamiento provienen de conjuntos específicos de STEM y lógica, lo que puede introducir sesgos en los estilos de resolución o en la representación de ciertos temas.
- Sin evaluación de seguridad publicada: no se documentan pruebas de robustez ante prompts adversarios, jailbreaks o contenido dañino.
- Tamaño de entrenamiento reducido: la destilación se realizó sobre solo 2.802 muestras STEM, lo que limita la generalización a dominios no cubiertos.
- Dependencia del modelo base: las capacidades conversacionales generales dependen de LFM2.5-1.2B-Instruct, y el ajuste específico puede haber reducido su versatilidad en tareas no relacionadas con STEM o lógica.

## Enlaces

- [Hugging Face - modelo principal](https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT)
- [Hugging Face - versiones GGUF](https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT-GGUF)
- [Blog de Liquid AI - Introducción a LFM2.5](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
- [LFM2 Technical Report (arXiv)](https://arxiv.org/html/2511.23404v1)
- [Documentación de Liquid - LFM2.5-1.2B-Base](https://docs.liquid.ai/lfm/models/lfm25-1.2b-base)
- [Dataset LogicInference_OA](https://huggingface.co/datasets/KK04/LogicInference_OA)
- [Sitio de Convergent Intelligence LLC](https://convergentintel.com)
