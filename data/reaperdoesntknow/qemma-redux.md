# reaperdoesntknow/Qemma-redux

## Resumen

Qemma-redux es un modelo de lenguaje híbrido desarrollado por Convergent Intelligence LLC (Research Division) bajo el identificador `reaperdoesntknow/Qemma-redux`. Se trata de una fusión a nivel de pesos (sin adaptadores) entre Gemma-3 (1B) y Qwen-3 (0.6B), combinando el cuerpo MLP de Gemma con la atención y la cabeza de Qwen, proyectadas y alineadas al tamaño oculto de Gemma. El resultado es un modelo de generación de texto con razonamiento paso a paso, afinado mediante SFT sobre conjuntos de datos de instrucciones y razonamiento STEM.

La relevancia de este modelo radica en su enfoque experimental: en lugar de entrenar desde cero, fusiona arquitecturas de dos familias consolidadas (Gemma y Qwen) y aplica un ajuste fino supervisado para mejorar la capacidad de razonamiento. Además, incorpora escalado de posición RoPE basado en Yarn con una relación 1:1 desde `max_position_embeddings`, lo que permite extender la ventana de contexto sin reentrenamiento. Está pensado para investigación, desarrollo de asistentes conversacionales y experimentación con técnicas de fusión de modelos.

El modelo se distribuye bajo licencia OSL-3.0, soporta únicamente inglés y su repositorio ocupa 12.0 GB (pesos en BF16). No se han publicado benchmarks oficiales en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Gemma-3 (26 capas, hidden 1152, MLP 6912) con atención estilo Qwen reagrupada en 4×256 cabezas |
| Parametros totales | no disponible (fusión de Gemma-3 1B y Qwen-3 0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se aplica RoPE scaling Yarn con ratio 1:1 sobre `max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos en BF16, safetensors) |
| Idiomas soportados | inglés |
| Licencia | OSL-3.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Qemma-redux es un modelo híbrido que fusiona dos arquitecturas distintas a nivel de pesos: el cuerpo (MLP y capas) proviene de Gemma-3 1B, mientras que la atención y la cabeza de salida son de Qwen-3 0.6B. Para alinear ambas partes, se proyectaron las dimensiones de Qwen al tamaño oculto de Gemma (1152). El tokenizer y la plantilla de chat son los de Gemma-3. Esta combinación busca aprovechar las fortalezas de cada familia: el cuerpo de Gemma para representación y la atención de Qwen para razonamiento.

El entrenamiento consistió en varias fases de SFT (supervised fine-tuning) con TRL 0.25.0 y Transformers 4.57.1:

- ~512 pasos de warm-start con datos estilo Alpaca (`yahma/alpaca-cleaned`).
- 256 pasos adicionales de preentrenamiento con `O1-OPEN/OpenO1-SFT`.
- 128 pasos de SFT con `Jackrong/gpt-oss-120b-reasoning-STEM-5K`.
- 256 pasos finales de SFT con `O1-OPEN/OpenO1-SFT`.

El objetivo declarado es mejorar el seguimiento de instrucciones y el razonamiento paso a paso. Además, se aplicó RoPE scaling tipo Yarn con una relación 1:1 sobre la longitud máxima de posición, lo que permite extender la ventana de contexto sin necesidad de reentrenamiento.

El modelo se enmarca dentro de la metodología "Discrepancy Calculus" (DISC) del laboratorio, que trata las singularidades del entrenamiento como señales estructurales, aunque esto no afecta directamente al funcionamiento del modelo.

## Capacidades

- Generación de texto en inglés con seguimiento de instrucciones.
- Razonamiento paso a paso (stepwise reasoning), entrenado explícitamente con datasets de razonamiento STEM y O1.
- Soporte de conversación multi-turno mediante la plantilla de chat de Gemma-3.
- Capacidad de ejecutar tareas de código y ayuda técnica (según la model card, "code/help").
- Extensión de contexto mediante RoPE scaling Yarn, aunque no se especifica la longitud máxima efectiva.
- Compatible con el ecosistema HuggingFace Transformers (AutoModelForCausalLM).

No se menciona soporte para tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente de razonamiento matemático: el modelo fue afinado con datasets de razonamiento STEM (gpt-oss-120b-reasoning-STEM-5K y OpenO1-SFT), por lo que puede resolver problemas de álgebra, cálculo o lógica explicando cada paso.
- Tutor virtual para estudiantes: gracias a su capacidad de razonamiento paso a paso, puede descomponer problemas complejos en pasos intermedios, útil en plataformas educativas.
- Generación de código comentado: aunque no se especifica un entrenamiento específico en código, su base Gemma-3 y el ajuste con datos de instrucciones permiten generar fragmentos de código con explicaciones.
- Investigación en fusión de modelos: sirve como caso de estudio para técnicas de merging a nivel de pesos entre arquitecturas distintas, y para evaluar la viabilidad de combinar Gemma y Qwen.
- Desarrollo de prototipos conversacionales: al ser un modelo pequeño (~1B), puede integrarse en entornos con recursos limitados para chatbots de demostración o asistentes internos en inglés.
- Experimentación con RoPE scaling: su configuración Yarn permite probar la extensión de contexto en modelos fusionados, útil para investigar ventanas largas sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de aproximadamente 1B de parámetros en BF16, requiere unos 2-3 GB de VRAM para cargar los pesos, más overhead de activaciones. En cuantización de 8 bits podría reducirse a ~1.5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10. En CPU también puede ejecutarse, aunque con mayor latencia.
- Cabe en GPUs consumer: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: al ser un modelo estándar de Transformers, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, Text Generation Inference (TGI) o mediante la API de HuggingFace Inference Endpoints.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna (RTX 4090) se espera una generación de decenas de tokens por segundo, pero no hay mediciones confirmadas.

## Comparativa con modelos similares

Dado que Qemma-redux es una fusión de Gemma-3 1B y Qwen-3 0.6B, la comparación más relevante es con sus modelos base y con otros modelos de tamaño similar (~1B).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qemma-redux | ~1B (fusión) | no disponible | OSL-3.0 | HuggingFace |
| Gemma-3 1B | 1B | 32K (original) | Gemma Terms of Use | HuggingFace |
| Qwen-3 0.6B | 0.6B | 32K (original) | Apache 2.0 | HuggingFace |
| Llama-3.2 1B | 1B | 128K | Llama 3.2 Community License | HuggingFace |

No se dispone de benchmarks comparativos, por lo que la comparación se limita a características estructurales. Qemma-redux hereda el cuerpo de Gemma y la atención de Qwen, lo que podría ofrecer un equilibrio entre ambas, pero no hay evidencia empírica publicada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado con datos multilingües.
- Puede alucinar hechos o generar contenido incorrecto, como se indica en la model card ("may hallucinate").
- No es adecuado para decisiones críticas de seguridad, médicas, legales o financieras.
- La licencia OSL-3.0 permite uso comercial, pero es una licencia copyleft que puede imponer obligaciones de redistribución si se modifica el código fuente; conviene revisar sus términos antes de integrarlo en productos cerrados.
- No se ha verificado la longitud de contexto efectiva tras el RoPE scaling; el rendimiento en ventanas largas no está documentado.
- Al ser un modelo experimental de fusión, su comportamiento puede ser menos predecible que el de los modelos base originales.
- No se han publicado evaluaciones de sesgos ni de robustez; se desconoce su comportamiento en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Qemma-redux
- Perfil del autor (Convergent Intelligence): https://huggingface.co/reaperdoesntknow
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento DualMind Methodology: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
