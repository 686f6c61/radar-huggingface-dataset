# reaperdoesntknow/Qemma-sft

## Resumen

Qemma-sft es un modelo experimental de generación de texto creado por el usuario independiente reaperdoesntknow (Convergent Intelligence LLC: Research Division). Se trata de un híbrido construido a nivel de pesos que fusiona el cuerpo de Gemma-3 (1B) de Google con el mecanismo de atención de Qwen3-0.6B de Alibaba, proyectando y alineando las dimensiones ocultas para que ambos componentes encajen. Posteriormente el modelo se ha afinado con SFT (supervised fine-tuning) para seguir instrucciones y producir razonamiento paso a paso.

La propuesta técnica es poco convencional: en lugar de destilar o adaptar un único modelo base, el autor combina la columna vertebral (MLP y cuerpo) de Gemma-3 con atención de estilo Qwen reorganizada en las cuatro cabezas de 256 dimensiones de Gemma. El tokenizador y la plantilla de chat son los de Gemma-3. El resultado es un modelo de aproximadamente 1B parámetros orientado a investigación, no a producción crítica.

Su relevancia es acotada: se trata de un experimento de fusión de pesos publicado en Hugging Face con licencia OSL-3.0, solo en inglés y con un volumen de descargas moderado (unas 2.400 en el momento de la consulta). Resulta interesante como caso de estudio de interoperabilidad entre arquitecturas y como base para ulteriores ciclos de SFT/RLHF, pero no compite con modelos consolidados de su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: cuerpo/MLP de Gemma-3 con atención de estilo Qwen3 proyectada a la dimensión oculta de Gemma (26 capas, hidden 1152, MLP 6912, 4 cabezas × 256) |
| Parametros totales | Aproximadamente 1B (no se publica cifra exacta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en el ejemplo de uso; sin variantes GGUF publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | OSL-3.0 |
| Formato de pesos | safetensors (repositorio de 28,1 GB, pesos en bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso que combina dos arquitecturas distintas a nivel de pesos. La columna vertebral es la de Gemma-3 (1B): 26 capas, dimensión oculta de 1152 y MLP de 6912. Sobre ella se injerta la atención de Qwen3-0.6B, reorganizada para encajar en las cuatro cabezas de 256 dimensiones de Gemma, con proyecciones y alineación de dimensiones ocultas. No se emplean adaptadores: la fusión es directa sobre los pesos. El tokenizador y la plantilla de chat son los de Gemma-3 (`chat_template.jinja`).

El entrenamiento se estructura en cuatro fases secuenciales: unas 512 iteraciones de warm-start con datos estilo Alpaca (`yahma/alpaca-cleaned`), 256 pasos adicionales de preentrenamiento sobre `O1-OPEN/OpenO1-SFT`, 128 pasos de SFT con `Jackrong/gpt-oss-120b-reasoning-STEM-5K` y 256 pasos finales de SFT sobre `O1-OPEN/OpenO1-SFT`. Se usaron TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0 (CPU) y Datasets 4.4.1. No se documentan volúmenes de tokens, composición detallada del dataset ni fases de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3.
- Seguimiento de instrucciones (instruction following) tras el ciclo de SFT.
- Razonamiento paso a paso orientado a problemas de tipo STEM, gracias al dataset de razonamiento empleado en una de las fases de SFT.
- Generación y asistencia en código a nivel básico, derivada de los datasets de instrucciones.
- Soporte de conversaciones multi-turno mediante la plantilla de chat del tokenizador.
- Capacidad de servir como base para ulteriores ciclos de SFT o RLHF.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Investigación sobre fusión de pesos entre arquitecturas: el modelo sirve como banco de pruebas para estudiar la interoperabilidad entre el cuerpo de Gemma-3 y la atención de Qwen3, y para medir el impacto de la alineación de dimensiones ocultas.
- Generación de explicaciones técnicas breves: útil para producir párrafos explicativos sobre conceptos científicos o de ingeniería, como en el ejemplo de la model card sobre la discrepancia a escala finita.
- Asistente conversacional de prototipo en inglés: puede integrarse en demos de chat multi-turno mediante la plantilla de Gemma-3 y `transformers`.
- Base para experimentos de SFT adicional: su estructura híbrida permite estudiar cómo responde un cuerpo Gemma con atención Qwen a nuevos datasets de instrucciones.
- Generación de borradores de razonamiento STEM: adecuado para producir cadenas de razonamiento preliminares que luego se revisan manualmente, dado el dataset de entrenamiento orientado a STEM.
- Reproducción de pipelines de entrenamiento con TRL: sirve para validar flujos de warm-start, preentrenamiento y SFT secuenciales documentados en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2-3 GB para los pesos de un modelo de ~1B parámetros, más el overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; una RTX 4090, A100 o H100 ofrecen margen sobrado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090). En GPUs con menos VRAM sería necesario cuantizar, aunque no se publican variantes GGUF.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado en la model card); el tag `text-generation-inference` sugiere compatibilidad con TGI, y `endpoints_compatible` con Inference Endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-sft | ~1B | No disponible | OSL-3.0 | Hugging Face, transformers | Híbrido Gemma-3 + atención Qwen3, solo inglés |
| google/gemma-3-1b-it | ~1B | No disponible en la información | Gemma Terms of Use | Hugging Face, amplia adopción | Modelo base original; ecosistema y soporte maduros |
| Qwen/Qwen3-0.6B | ~0,6B | No disponible en la información | No disponible en la información | Hugging Face, amplia adopción | Modelo base original; multilingüe y con soporte de tooling |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado benchmarks del modelo en la información proporcionada. Frente a sus dos modelos base, Qemma-sft no aporta ventajas verificables de rendimiento y su ecosistema de despliegue es mucho más limitado.

## Limitaciones y advertencias

- Riesgo de alucinación reconocido explícitamente por el autor; no apto para decisiones críticas de seguridad, médicas, legales o financieras.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Longitud de contexto no especificada, lo que dificulta planificar cargas con ventanas largas.
- Licencia OSL-3.0: conviene revisar sus términos antes de un uso comercial, especialmente las cláusulas de copyleft sobre obras derivadas.
- Modelo de investigación con una única descarga relevante en likes (1) y sin benchmarks publicados; la madurez y la fiabilidad en producción no están contrastadas.
- El repositorio ocupa 28,1 GB, un tamaño desproporcionado para un modelo de ~1B, lo que puede indicar pesos duplicados o artefactos de entrenamiento y complica su descarga y despliegue.
- La fusión de pesos entre arquitecturas distintas puede introducir comportamientos impredecibles no caracterizados.
- No se documentan variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- El marco teórico "Discrepancy Calculus" que rodea al modelo no sustituye a una evaluación empírica independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-sft
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base Gemma-3 1B IT: https://huggingface.co/google/gemma-3-1b-it
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset Alpaca cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset STEM reasoning: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
- Documento Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Repositorio TRL: https://github.com/huggingface/trl
