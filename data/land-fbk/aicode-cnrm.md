# LanD-FBK/AICODE-CNRM

## Resumen

AICODE-CNRM es un adaptador PEFT (LoRA) publicado por el grupo LanD-FBK (Fondazione Bruno Kessler) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. El modelo está orientado a la generación de veredictos (verdict generation) contra desinformación en un contexto multilingüe europeo, y se asocia al conjunto de datos EuroVerdict presentado en el paper "EuroVerdict: A Multilingual Dataset for Verdict Generation Against Misinformation" (Findings of ACL 2025). El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo, por lo que requiere descargar y cargar por separado el modelo base de 8 mil millones de parámetros.

La relevancia del modelo reside en su especialización: en lugar de un ajuste genérico, aplica un fine-tuning sobre Llama 3.1 8B Instruct para una tarea concreta de verificación de afirmaciones y generación de veredictos razonados en ocho idiomas europeos (inglés, italiano, español, alemán, francés, polaco, griego y rumano). Esto lo sitúa en el ámbito del fact-checking automatizado y la moderación de contenido multilingüe, un nicho donde los modelos generalistas suelen carecer de consistencia entre idiomas.

La información publicada por el autor es muy limitada: la model card mantiene la plantilla por defecto de Hugging Face con la mayoría de secciones marcadas como "[More Information Needed]", y no se especifican licencia, datos de entrenamiento, hiperparámetros ni resultados de evaluación. Cualquier despliegue en producción debe considerar esta opacidad como un riesgo relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8,03 mil millones (modelo base); adaptador de 0,2 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en el adaptador; el modelo base admite FP16, BF16, INT8 e INT4 (GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | EN, IT, ES, DE, FR, PL, EL, RO (según model card) |
| Licencia | no disponible (el modelo base Llama 3.1 se rige por la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA), RoPE y una ventana de contexto de 128 000 tokens. El adaptador utiliza PEFT 0.14.0 con la técnica LoRA, lo que implica que solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, manteniendo congelados los pesos originales. El repositorio no especifica el rango, el alpha, las capas objetivo ni el resto de hiperparámetros del LoRA.

El entrenamiento se vincula al dataset EuroVerdict, descrito en el paper de Russo et al. (ACL 2025), orientado a la generación de veredictos frente a desinformación en múltiples idiomas europeos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas específicas más allá del propio fine-tuning supervisado implícito en el uso de LoRA.

## Capacidades

- Generación de veredictos razonados sobre afirmaciones potencialmente desinformativas, en ocho idiomas europeos.
- Razonamiento y generación de texto en el marco de tareas de fact-checking y verificación.
- Capacidades heredadas del modelo base Llama 3.1 8B Instruct: generación de texto, razonamiento, código y matemáticas.
- Soporte de conversaciones multi-turno con contexto largo (hasta 128 000 tokens).
- Capacidades multilingües limitadas a los idiomas declarados (EN, IT, ES, DE, FR, PL, EL, RO).
- Soporte de tool calling y function calling heredado del modelo base Instruct (no verificado específicamente tras el fine-tuning).
- No se documentan modos de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Verificación de afirmaciones en medios: el adaptador puede generar veredictos razonados sobre declaraciones políticas o sanitarias en varios idiomas europeos, aprovechando el entrenamiento específico sobre EuroVerdict.
- Moderación de contenido multilingüe: integrado en pipelines de plataformas que operan en Italia, España, Alemania, Francia, Polonia, Grecia y Rumanía, puede clasificar y justificar la veracidad de publicaciones.
- Asistencia a redacciones de fact-checking: como generador de borradores de veredictos que un periodista revisa, reduciendo el tiempo de triaje en salas de redacción.
- Investigación en PLN multilingüe: como punto de comparación o base para experimentos sobre generación de veredictos y desinformación en el marco del dataset EuroVerdict.
- Sistemas de alerta temprana en redes sociales: combinado con clasificadores previos, el modelo puede generar explicaciones estructuradas sobre por qué una afirmación es engañosa, en el idioma del usuario.
- Despliegue en entornos con recursos moderados: al ser un LoRA sobre un modelo de 8B, puede servirse en una GPU de 24 GB en FP16 o en GPUs de consumo con cuantización INT4, lo que facilita prototipos y pruebas piloto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16/BF16 para el modelo base de 8B más el adaptador; en torno a 6-8 GB con cuantización INT4.
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB para despliegues de alta concurrencia; L40S o A10G para producción moderada.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 (24 GB) en FP16, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización INT4.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores PEFT; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF; también es posible usar transformers + peft directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AICODE-CNRM | 8B + LoRA | 128 000 | Veredictos contra desinformacion (8 idiomas) | no disponible | Hugging Face (adaptador) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 | Proposito general, instrucciones | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7B | 32 000 | Proposito general, instrucciones | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 32 000 | Proposito general multilingue | Apache 2.0 | Hugging Face |

La comparativa directa con modelos especializados en fact-checking multilingüe no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Llama 3.1, hereda los sesgos del modelo base y de los datos de instrucción originales.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en la generación de justificaciones de veredictos; requiere validación humana en contextos críticos.
- La licencia del adaptador no está especificada, lo que impide confirmar si el uso comercial está permitido; además, el modelo base Llama 3.1 impone sus propias restricciones (Llama 3.1 Community License) que deben respetarse.
- El alcance idiomático está limitado a los ocho idiomas declarados; el rendimiento fuera de ellos no está documentado.
- No hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que dificulta auditar el comportamiento del modelo.
- El repositorio solo contiene el adaptador; es necesario descargar el modelo base por separado, con los requisitos de acceso y aceptación de licencia de Meta.
- El número de descargas (19) y likes (1) sugiere un modelo poco validado por la comunidad; conviene tratarlo como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/LanD-FBK/AICODE-CNRM
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper EuroVerdict (ACL 2025 Findings): Daniel Russo, Fariba Sadeghi, Stefano Menini, Marco Guerini. "EuroVerdict: A Multilingual Dataset for Verdict Generation Against Misinformation". Findings of ACL 2025, páginas 16617-16634, Viena.
- Referencia metodológica citada en la model card: Lacoste et al. (2019), https://arxiv.org/abs/1910.09700
- Organización LanD-FBK: https://huggingface.co/LanD-FBK
