# reaperdoesntknow/SMOLM2Prover

## Resumen

SMOLM2Prover es un modelo de lenguaje especializado en razonamiento matemático, generación de demostraciones y pensamiento lógico paso a paso (Chain-of-Thought). Desarrollado por el usuario reaperdoesntknow como parte de la cartera de Convergent Intelligence LLC, este modelo parte de la base prithivMLmods/SmolLM2-CoT-360M y ha sido refinado mediante varias rondas de Supervised Fine-Tuning (SFT) con el framework TRL. Su objetivo principal es proporcionar capacidades de razonamiento profundo en un paquete compacto de aproximadamente 362 millones de parámetros, lo que lo hace ejecutable en hardware de consumo.

El modelo destaca por su enfoque en la generación de pruebas matemáticas y la resolución de problemas complejos, manteniendo a la vez las capacidades conversacionales del modelo base. Está entrenado sobre el dataset AI-MO/NuminaMath-1.5, complementado con aproximadamente un millón de tokens adicionales de datos de razonamiento con formato personalizado. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño reducido lo convierte en una opción atractiva para despliegues locales y aplicaciones educativas. La relevancia actual del modelo radica en la tendencia hacia modelos pequeños y especializados que pueden ejecutarse en dispositivos con recursos limitados sin sacrificar capacidades de razonamiento avanzado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-style) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se infiere 2048 tokens del modelo base SmolLM2) |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q5_0, Q6_K, Q8_0) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

SMOLM2Prover se basa en la arquitectura SmolLM2, un transformer de tipo Llama con 360 millones de parámetros, optimizado para generación de texto eficiente en dispositivos con recursos limitados. El modelo base, prithivMLmods/SmolLM2-CoT-360M, ya incorporaba capacidades de razonamiento Chain-of-Thought, y SMOLM2Prover refuerza estas habilidades mediante un proceso de fine-tuning iterativo con SFT.

El entrenamiento se realizó con el framework TRL (Transformer Reinforcement Learning), utilizando el dataset AI-MO/NuminaMath-1.5 como fuente principal, aumentado con aproximadamente un millón de tokens adicionales de datos de razonamiento con formato específico. Este formato está diseñado para elicitar respuestas paso a paso y razonamiento explícito. El proceso de SFT iterativo permitió un refinamiento progresivo de las capacidades de razonamiento del modelo. El modelo también se enmarca en el framework Discrepancy Calculus (DISC), un enfoque teórico-medible para entender y controlar la brecha entre lo que el modelo debería producir y lo que realmente produce, tratando las singularidades del entrenamiento como señales estructurales.

## Capacidades

- Generación de demostraciones matemáticas paso a paso, incluyendo pruebas de cálculo diferencial, álgebra y lógica.
- Razonamiento Chain-of-Thought explícito para problemas complejos de matemáticas y lógica.
- Resolución de problemas de matemáticas de nivel universitario, como derivadas, integrales y demostraciones formales.
- Conversación general y seguimiento de instrucciones complejas, heredado del modelo base SmolLM2-CoT-360M.
- Generación de contenido con consistencia lógica, útil para explicaciones técnicas y educativas.
- Capacidad de actuar como componente de "pensamiento" en aplicaciones que requieren razonamiento profundo antes de responder.
- Soporte de chat multi-turno mediante plantillas de chat estándar de transformers.

## Casos de uso

- Herramientas educativas para matemáticas avanzadas: el modelo puede guiar a estudiantes universitarios a través de demostraciones paso a paso, explicando cada paso del razonamiento, gracias a su entrenamiento en NuminaMath-1.5 y su formato de CoT.
- Asistente de verificación de pruebas: los investigadores pueden usar el modelo para generar borradores de demostraciones que luego revisan y verifican, acelerando el proceso de escritura matemática formal.
- Tutor automático de cálculo y álgebra: su tamaño compacto permite ejecutarlo en portátiles, ofreciendo explicaciones interactivas de problemas de derivadas, integrales y límites a estudiantes.
- Componente de razonamiento en agentes conversacionales: puede integrarse como módulo de "pensamiento" que procesa problemas lógicos antes de que un modelo más grande genere la respuesta final.
- Generación de ejercicios matemáticos con soluciones detalladas: los creadores de contenido educativo pueden generar problemas con soluciones paso a paso para plataformas de aprendizaje.
- Chatbot de soporte técnico con capacidad de razonamiento: su naturaleza conversacional permite desplegarlo como asistente que no solo responde, sino que explica el razonamiento detrás de sus respuestas, útil en dominios técnicos.
- Prototipado de aplicaciones de razonamiento en edge devices: al ser un modelo de 360M parámetros, puede desplegarse en dispositivos con poca VRAM, como Raspberry Pi o smartphones, para aplicaciones offline de ayuda matemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta métricas como MMLU, HumanEval o GSM8K en su model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 700 MB en FP16 (361M parámetros × 2 bytes). Con cuantización GGUF Q4_K_M, el tamaño se reduce a unos 258 MB, permitiendo ejecución en CPU con ~2-3 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida.
- Cabe en GPUs de consumo: sí, es uno de los puntos fuertes del modelo. Puede ejecutarse en GPUs de gama baja y en CPU pura con llama.cpp.
- Opciones de despliegue: transformers con device_map="auto", llama.cpp para CPU, Ollama (si se convierte a GGUF), vLLM para inferencia de alto rendimiento en servidores, y FriendliAI para endpoints gestionados.
- Latencia estimada: en CPU moderna, generación de ~10-20 tokens/segundo con cuantización Q4_K_M. En GPU de gama media, ~50-100 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| SMOLM2Prover | 361M | 2048 (inferido) | Razonamiento matematico, pruebas, CoT | Apache 2.0 |
| SmolLM2-360M (base) | 360M | 2048 | Generacion de texto general | Apache 2.0 |
| Qwen2.5-0.5B-Instruct | 494M | 32768 | Instrucciones generales, chat | Apache 2.0 |
| TinyLlama-1.1B | 1.1B | 2048 | Generacion general, instrucciones | Apache 2.0 |

SMOLM2Prover se diferencia de alternativas como Qwen2.5-0.5B por su especialización explícita en matemáticas y demostraciones, mientras que Qwen ofrece mayor contexto y versatilidad general. TinyLlama, aunque más grande, no tiene la misma especialización en razonamiento matemático formal. La ventaja principal de SMOLM2Prover es su tamaño reducido combinado con capacidades de razonamiento avanzado.

## Limitaciones y advertencias

- Precisión matemática: el modelo puede cometer errores o "alucinar" pasos incorrectos en demostraciones complejas. Todo output debe ser verificado por un experto humano antes de su uso en aplicaciones críticas.
- Rendimiento limitado a dominios similares al entrenamiento: su precisión es más fiable en problemas parecidos a los de NuminaMath-1.5; en dominios novedosos o esotéricos, su rendimiento debe evaluarse con cuidado.
- Sesgos heredados: el modelo hereda los sesgos presentes en el modelo base (SmolLM2-CoT-360M) y en los datasets de entrenamiento, lo que puede manifestarse en respuestas con estereotipos o perspectivas limitadas.
- Idioma limitado: solo soporta inglés, lo que restringe su uso en aplicaciones multilingües.
- Contexto corto: la ventana de contexto probable de 2048 tokens limita la capacidad de manejar documentos largos o conversaciones extensas.
- Sin soporte de tool calling ni funciones externas: el modelo no está entrenado para interactuar con APIs o herramientas, lo que limita su uso en pipelines de agentes complejos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/reaperdoesntknow/SMOLM2Prover)
- [Versión GGUF cuantizada](https://huggingface.co/reaperdoesntknow/SMOLM2Prover-GGUF)
- [Modelo base: prithivMLmods/SmolLM2-CoT-360M](https://huggingface.co/prithivMLmods/SmolLM2-CoT-360M)
- [Dataset de entrenamiento: AI-MO/NuminaMath-1.5](https://huggingface.co/datasets/AI-MO/NuminaMath-1.5)
- [Endpoint de inferencia en FriendliAI](https://friendli.ai/models/reaperdoesntknow/SMOLM2Prover)
- [Perfil del autor en HuggingFace](https://huggingface.co/reaperdoesntknow)
