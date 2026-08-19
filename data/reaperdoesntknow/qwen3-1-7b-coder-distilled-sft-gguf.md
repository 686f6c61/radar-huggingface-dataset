# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT-GGUF es un modelo de lenguaje de pequeño tamaño (2.03 mil millones de parámetros) desarrollado por Reaperdoesntrun, de Convergent Intelligence LLC, orientado al razonamiento lógico y STEM. Se distribuye en formato GGUF cuantizado para su ejecución local y en dispositivos de borde mediante llama.cpp y runtimes compatibles. El modelo parte del base Qwen3-1.7B y se construye en dos etapas: primero se destila conocimiento desde el teacher Qwen3-Coder-30B-A3B-Instruct sobre 6.122 muestras de cadenas de razonamiento (CoT) de tipo STEM, y después se ajusta mediante SFT con un dataset de inferencia lógica proposicional de aproximadamente 54.607 pares.

El resultado es un modelo compacto, de aproximadamente 1,2 GB en su cuantización Q4_K_M, que pretende ofrecer razonamiento estructurado en entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque su nombre incluye "Coder", la model card aclara explícitamente que no es un generador de código, sino un especialista en razonamiento lógico y matemático.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye a partir de Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros nominales (aunque el peso real en safetensors es de 2.031.739.904). El entrenamiento se realiza en dos etapas:

- **Etapa 1 — Destilación del teacher Coder:** se utiliza Qwen3-Coder-30B-A3B-Instruct como profesor sobre 6.122 muestras de cadenas de razonamiento STEM. Se emplea una función de pérdida de entropía cruzada ponderada por prueba (2.5x → 1.5x en tokens de derivación) junto con divergencia KL a temperatura T=2.0. El objetivo es transferir patrones de descomposición estructurada, lógica secuencial y seguimiento de estado a través del paisaje de softmax.

- **Etapa 2 — SFT de inferencia lógica:** se fine-tunea sobre el dataset logic_inference_dataset (aproximadamente 54.607 pares de lógica proposicional en formato LOGICINFERENCEe). El modelo aprende a realizar la inferencia primero y luego concluir, siguiendo el enfoque del paper LogicInference de Santiago Ontañón (Google Research).

No se especifican detalles adicionales sobre el número de tokens de entrenamiento, el optimizador o las técnicas de regularización. La model card menciona fundamentos matemáticos propios (Discrepancy Calculus, Topological Knowledge Distillation) que se documentan en el modelo fuente.

## Capacidades

- Razonamiento lógico proposicional: puede evaluar validez de argumentos, aplicar reglas de inferencia y extraer conclusiones a partir de premisas.
- Razonamiento matemático y físico: resuelve problemas STEM con cadenas de razonamiento paso a paso.
- Inferencia de sentido común: maneja silogismos y deducciones básicas.
- Generación de texto en inglés con formato de instrucción y respuesta.
- Soporte de chain-of-thought (CoT) mediante el formato de prompt específico de la etapa 1.
- No soporta tool calling, ni visión, ni audio, ni generación de código (a pesar del nombre "Coder").

## Casos de uso

- **Asistente educativo de lógica:** un estudiante puede plantear argumentos y el modelo evalúa su validez, explicando el razonamiento paso a paso. Adecuado por su especialización en inferencia lógica y su tamaño reducido para ejecutarse en portátiles modestos.
- **Verificación rápida de argumentos en entornos legales o de contratación:** revisar si una cadena de premisas conduce lógicamente a una conclusión, útil como herramienta de apoyo antes de una revisión humana. Su capacidad de razonamiento estructurado y su formato de salida claro lo hacen práctico.
- **Sistemas de tutoría STEM en dispositivos de borde:** integrarlo en aplicaciones móviles o educativas que funcionen sin conexión, ofreciendo explicaciones de problemas de física o matemáticas con pasos intermedios.
- **Automatización de razonamiento en pipelines de datos:** validar reglas de negocio expresadas como proposiciones lógicas (por ejemplo, "si el pedido supera 100 € y el cliente es premium, aplicar descuento") en entornos de procesamiento de datos con recursos limitados.
- **Prototipado rápido de agentes conversacionales con lógica:** usar el modelo como motor de razonamiento en chatbots que necesitan deducir intenciones a partir de premisas, aunque sin soporte de tool calling.
- **Investigación en destilación de conocimiento:** servir como ejemplo de cómo transferir capacidades de razonamiento de un modelo grande (30B-A3B) a uno pequeño (1.7B) mediante destilación y SFT, útil para estudiar la compresión de habilidades cognitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo en tareas específicas de lógica proposicional antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia:**
  - F16 (~3,8 GB): requiere al menos 4 GB de VRAM.
  - Q8_0 (~2,1 GB): requiere al menos 3 GB de VRAM.
  - Q5_K_M (~1,4 GB): requiere al menos 2 GB de VRAM.
  - Q4_K_M (~1,2 GB): requiere al menos 2 GB de VRAM, apto para móviles y dispositivos de borde.
- **GPUs recomendadas:** cualquier GPU con soporte CUDA o Metal con 2-4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, Apple M1/M2). No requiere GPU de datacenter.
- **Despliegue:** compatible con llama.cpp (CLI y Python), Ollama, LM Studio y cualquier runtime que soporte GGUF.
- **Latencia y throughput:** no se proporcionan datos concretos. Al ser un modelo de 1.7B, en una GPU moderna (RTX 3060) se esperan velocidades de decodificación de decenas de tokens por segundo, aunque esto depende de la cuantización y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El modelo comparte base con Qwen3-1.7B, pero no se han reportado métricas de rendimiento relativas a otros modelos de tamaño similar. Se puede considerar como alternativa ligera a modelos de razonamiento como Phi-3-mini o Llama-3.2-1B, pero sin datos objetivos no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- **Capacidad limitada:** al ser un modelo de 1.7B, el razonamiento multi-paso con muchos cuantificadores puede exceder su capacidad. La model card lo advierte explícitamente.
- **No es un generador de código:** a pesar de la destilación desde un teacher Coder, el modelo no está entrenado para producir código.
- **No es un verificador formal:** no garantiza la validez de demostraciones matemáticas o lógicas complejas; sus respuestas deben ser verificadas.
- **Riesgo de alucinación:** como todo LLM, puede generar razonamientos plausibles pero incorrectos, especialmente en dominios fuera de su entrenamiento.
- **Idioma:** solo soporta inglés. No hay soporte multilingüe.
- **Contexto limitado:** la longitud de contexto no está especificada, pero el ejemplo de uso usa n_ctx=1024, lo que sugiere que no está optimizado para contextos largos.
- **Sesgos:** no se documentan sesgos específicos, pero al entrenarse en un dataset de lógica proposicional puede tener dificultades con lenguaje natural ambiguo o no estándar.
- **Uso en producción:** se recomienda validar el modelo en el dominio concreto y establecer mecanismos de verificación externa para salidas críticas.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF)
- [Modelo fuente (precisión completa)](https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT)
- [Modelo base Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Teacher Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
- [Dataset de inferencia lógica](https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset)
- [Paper LogicInference (OpenReview)](https://openreview.net/pdf?id=HAGeIS_Lcg9)
- [Sitio de Convergent Intelligence LLC](https://convergentintel.com)
- [Modelo relacionado: Qwen3-1.7B-Coder-Distilled (solo etapa 1)](https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled)
- [Modelo relacionado: Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF](https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF)
