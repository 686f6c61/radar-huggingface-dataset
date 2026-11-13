# MergekitCloud/mergekit-173

## Resumen

Mergekit-173 es un modelo de lenguaje de 8.188.564.480 parámetros (aproximadamente 8,2 mil millones) creado mediante la técnica de fusión de modelos TIES (Trim, Elect Sign & Merge), implementada con la herramienta mergekit. Lo publica la organización MergekitCloud en Hugging Face y combina tres modelos base de la familia Qwen3: DeepSeek-R1-0528-Qwen3-8B (usado como modelo base de la fusión), ValiantLabs/Qwen3-8B-Esper3 y Goedel-LM/Goedel-Prover-V2-8B. El objetivo declarado es agregar las capacidades de razonamiento, la especialización en demostración matemática formal y los ajustes conversacionales de cada componente en un único checkpoint de 8B.

Por su naturaleza de fusión, el modelo hereda la arquitectura transformer densa de Qwen3-8B, con pesos en formato safetensors y bfloat16, y una plantilla de chat tomada del modelo base. No se documentan en la model card datos sobre el contexto máximo efectivo, los idiomas soportados ni la licencia resultante de la combinación, lo que limita su evaluación para producción.

La relevancia del modelo es principalmente experimental: sirve como ejemplo de cómo mergekit permite combinar especializaciones (razonamiento tipo DeepSeek-R1, demostración formal y conversación) sobre una misma base Qwen3 sin reentrenamiento. Al no contar con benchmarks publicados ni descargas, debe considerarse un artefacto de investigación más que un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen3-8B) |
| Parametros totales | 8.188.564.480 (~8,2 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible en el repositorio; al ser safetensors bfloat16 admite cuantizacion a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 16,4 GB |
| Metodo de fusion | TIES (arxiv:2306.01708) |
| Herramienta | mergekit |
| Modelo base de la fusion | deepseek-ai/DeepSeek-R1-0528-Qwen3-8B |
| Modelos fusionados | ValiantLabs/Qwen3-8B-Esper3, Goedel-LM/Goedel-Prover-V2-8B |
| Densidad por modelo | 0,55 |
| Peso por modelo | 0,50 |
| Normalizacion | true |
| int8_mask | true |
| rescale | false |
| dtype | bfloat16 |
| tokenizer_source | base |
| chat_template | auto |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el resultado de una fusión TIES de tres checkpoints Qwen3-8B. TIES aplica un recorte de parámetros poco relevantes (trim), una elección de signo por consenso entre modelos (elect sign) y una media ponderada de los tensores restantes (merge). En esta configuración, cada uno de los dos modelos fusionados (Esper3 y Goedel-Prover-V2) aporta con peso 0,50 y densidad 0,55, con normalización activada, máscara int8 para reducir colisiones de signo y `rescale: false`. El tokenizador y la plantilla de chat provienen del modelo base DeepSeek-R1-0528-Qwen3-8B.

Los tres componentes comparten la arquitectura Qwen3-8B, lo que hace viable la fusión tensorial directa. DeepSeek-R1-0528-Qwen3-8B aporta comportamiento de razonamiento estilo R1; Goedel-Prover-V2-8B está especializado en demostración matemática formal; y Qwen3-8B-Esper3 es un ajuste conversacional. No se documentan tokens de entrenamiento adicionales, datasets, ni etapas de RLHF/DPO posteriores a la fusión, ya que el proceso es puramente de combinación de pesos.

## Capacidades

- Generación de texto conversacional, heredada del componente Esper3 y de la plantilla de chat del modelo base.
- Razonamiento multi-paso con trazas de pensamiento, procedente del componente DeepSeek-R1-0528-Qwen3-8B.
- Razonamiento matemático y demostración formal, aportado por Goedel-Prover-V2-8B.
- Generación de código y matemáticas genéricas, capacidades propias de la base Qwen3-8B.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card; la base Qwen3 lo soporta, pero la fusión puede degradarlo.
- Soporte de agentes y multi-step reasoning: plausible por el componente R1, pero no verificado.
- Capacidades multilingües: no documentadas; dependen de los checkpoints de origen.
- Modo thinking explícito: no confirmado en la model card, aunque el componente R1-Qwen3-8B lo incorpora de origen.

## Casos de uso

- Prototipado de asistentes conversacionales con razonamiento: el modelo puede integrarse en un pipeline de transformers para generar respuestas con cadena de pensamiento en tareas de análisis, aprovechando la combinación de Esper3 y R1-Qwen3-8B.
- Experimentación en demostración matemática asistida: el componente Goedel-Prover-V2-8B permite explorar la generación de pruebas formales en entornos de investigación, siempre validando la salida con un checker externo.
- Evaluación de técnicas de fusión de modelos: sirve como caso de estudio reproducible de TIES sobre Qwen3-8B para investigadores que comparan estrategias de merge (TIES, DARE, SLERP, model stock).
- Generación de código en entornos de desarrollo: al heredar la base Qwen3-8B, puede utilizarse en tareas de autocompletado y explicación de código, con revisión humana obligatoria.
- Base para fine-tuning posterior: al ser un checkpoint de 8B en safetensors, es adecuado como punto de partida para ajustes específicos de dominio con LoRA o QLoRA en una sola GPU de 24 GB.
- Investigación sobre alineación y sesgos en modelos fusionados: permite estudiar cómo la combinación de checkpoints con distintos ajustes afecta al comportamiento conversacional y al razonamiento.
- Despliegue en entornos con recursos limitados: con cuantización a 4 bits (aproximadamente 4-5 GB de VRAM) puede ejecutarse en GPUs de consumo para pruebas internas, no para producción crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 16-17 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB.
- VRAM estimada en FP8/INT8: aproximadamente 8-9 GB de pesos, con margen para contexto; viable en GPUs de 16 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 4,5-5,5 GB de pesos; viable en GPUs de 8 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB o H100 para bfloat16 con contexto largo; L40S o RTX 6000 Ada para despliegue con FP8; RTX 4090 (24 GB) para bfloat16 con contexto contenido o cuantización.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bfloat16 con contexto limitado; en RTX 4070/4060 Ti (12-16 GB) requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (formato nativo), vLLM, TGI (el repo incluye tag text-generation-inference y endpoints_compatible), llama.cpp/Ollama tras conversión a GGUF, y LM Studio para pruebas locales.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mergekit-173 | ~8,2 B | no disponible | no disponible | Hugging Face, 0 descargas | Fusión TIES de tres Qwen3-8B |
| Qwen3-8B (Alibaba) | ~8,2 B | no disponible en esta ficha | Apache 2.0 (modelo original) | Ampliamente disponible | Base de los tres componentes; benchmarks publicados por el autor |
| DeepSeek-R1-0528-Qwen3-8B | ~8,2 B | no disponible en esta ficha | MIT (modelo original) | Hugging Face, muy descargado | Razonamiento estilo R1 sobre Qwen3-8B |
| Goedel-Prover-V2-8B | ~8,2 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Especializado en demostración formal |
| ValiantLabs/Qwen3-8B-Esper3 | ~8,2 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Ajuste conversacional sobre Qwen3-8B |

La comparativa de rendimiento no puede completarse: no hay benchmarks del modelo fusionado y los datos de contexto y licencia de los componentes no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que la fusión conserve las capacidades de sus componentes; las fusiones TIES pueden degradar habilidades específicas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; los términos de los tres modelos de origen deben verificarse por separado antes de cualquier despliegue.
- Idiomas no documentados: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Contexto no confirmado: aunque la base Qwen3-8B soporta ventanas amplias, la fusión no declara la longitud efectiva; el comportamiento en contextos largos puede diferir.
- Riesgo de alucinación: inherente a los modelos de 8B y potencialmente agravado por la mezcla de estilos de razonamiento (R1, demostración formal y conversacional).
- Tool calling y modo thinking no verificados: la fusión puede romper las plantillas o los tokens especiales de cada componente.
- Sesgos: no evaluados; se heredan los sesgos de los datasets de los tres modelos de origen.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad; trátese como artefacto experimental.
- Repositorio de 16,4 GB: requiere espacio en disco y ancho de banda considerables para su descarga y conversión.
- Fecha de creación futura (2026-11-13): metadato atípico que conviene verificar antes de confiar en la trazabilidad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-173
- Modelo base de la fusión: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Componente conversacional: https://huggingface.co/ValiantLabs/Qwen3-8B-Esper3
- Componente de demostración formal: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Paper de TIES: https://arxiv.org/abs/2306.01708
- Repositorio de mergekit: https://github.com/cg123/mergekit
