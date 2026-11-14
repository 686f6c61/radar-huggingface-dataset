# nightmedia/Qwen3.6-35B-A3B-Mirage

## Resumen

Qwen3.6-35B-A3B-Mirage es un modelo multimodal de tipo imagen-texto-a-texto publicado por el usuario nightmedia en Hugging Face. Se trata de un merge experimental construido sobre la familia Qwen 3.5/3.6 con arquitectura MoE (Mixture of Experts), con aproximadamente 35.951.822.704 parámetros totales y un esquema de activación de 3B (indicado por el sufijo A3B). El modelo combina múltiples checkpoints base mediante herramientas de fusión (mergekit) y ha sido ajustado con SFT y LoRA para tareas de razonamiento, cadena de pensamiento larga, matemáticas, STEM y código.

El repositorio tiene un tamaño de 71,9 GB, lo que es coherente con pesos en safetensors de precisión completa o BF16 para un modelo de ~36B parámetros. Está etiquetado como experimental y de investigación, con licencia Apache 2.0, y soporta inglés, chino, japonés y español. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia radica en que ejemplifica la práctica creciente de fusiones comunitarias sobre arquitecturas MoE multimodales de última generación, orientadas a razonamiento con long-cot y destilación. No obstante, al tratarse de un merge sin benchmarks publicados ni documentación técnica detallada, su idoneidad para producción debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (image-text-to-text), familia Qwen 3.5/3.6 (`qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 (~36B) |
| Parametros activos | ~3B (según sufijo A3B; no confirmado en documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 71,9 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) bajo la clase `qwen3_5_moe` de transformers, heredada de la familia Qwen 3.5/3.6. El sufijo A3B indica que, aunque el modelo contiene ~36B parámetros totales, solo se activan aproximadamente 3B por token, lo que reduce el coste computacional de inferencia en comparación con un modelo denso del mismo tamaño. La modalidad es imagen-texto-a-texto, por lo que integra un codificador visual junto al tronco lingüístico.

El entrenamiento declarado en las etiquetas incluye destilación, SFT (supervised fine-tuning), LoRA e instruction tuning, con énfasis en reasoning, chain-of-thought y long-cot. El modelo es un merge de múltiples checkpoints: TerminalHorizon-35B-A3B, Iris-mini, Thomson-1.0-Small, Qwen3.6-35B-A3B-Fable-Holo3.1, Qwen3.6-35B-A3B-FSM, Qwen-AgentWorld-35B-A3B, Nex-N2.5-mini-Uncensored y SuperQwen-AgentWorld-35B-A3B-abliterated. La fusión se realizó presumiblemente con mergekit. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni detalles del proceso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento larga (long-cot) y modo de razonamiento explícito.
- Comprensión de imágenes y respuesta a preguntas sobre contenido visual (image-text-to-text).
- Matemáticas y tareas STEM, según las etiquetas de entrenamiento.
- Generación y asistencia en código.
- Soporte de tool calling / function calling (etiqueta `endpoints_compatible` y herencia de modelos AgentWorld).
- Capacidades orientadas a agentes y razonamiento multi-paso, derivadas de los checkpoints base tipo AgentWorld.
- Capacidades multilingües limitadas a los cuatro idiomas declarados.
- Ajuste instructivo con LoRA y SFT, con posible componente de humor y creatividad (etiquetas `fable`, `humour`).

## Casos de uso

- Asistencia conversacional multilingüe: el modelo puede mantener diálogos multi-turno en inglés, chino, japonés y español, adecuado para atención al cliente en entornos con esos idiomas, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede extraer y razonar sobre información de capturas, diagramas o formularios, integrándose en pipelines de digitalización documental.
- Razonamiento matemático y STEM: su entrenamiento en long-cot y matemáticas lo hace utilizable para tutoría o resolución asistida de problemas, siempre con verificación humana.
- Generación de código asistida: puede emplearse como asistente de programación en entornos de desarrollo, con soporte de tool calling para integración en flujos automatizados.
- Prototipado de agentes: gracias a la herencia de checkpoints AgentWorld, sirve para experimentar con agentes que encadenan pasos y llaman a herramientas en entornos de investigación.
- Investigación sobre fusiones de modelos: como merge experimental, es útil para estudiar el efecto de combinar checkpoints MoE multimodales y evaluar su comportamiento frente a los modelos base.
- Generación creativa y narrativa: las etiquetas de fábula y humor sugieren uso en escritura creativa y generación de contenido lúdico, con revisión editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~36B parámetros totales y pesos BF16, se requieren aproximadamente 72 GB de VRAM solo para los pesos; con cuantización a 8 bits bajaría a ~36 GB y a 4 bits a ~18-20 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o configuraciones multi-GPU; para cuantización 4/8 bits, una RTX 4090 (24 GB) podría alojar el modelo en 4 bits, aunque el codificador visual y el contexto añaden overhead.
- No cabe en GPUs de consumo en precisión completa; en 4 bits es viable en RTX 4090/3090 con margen ajustado.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM o TGI si la arquitectura `qwen3_5_moe` está soportada; llama.cpp/Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput: no disponibles; al ser MoE con ~3B activos, el throughput por token debería ser superior al de un denso de 36B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage | ~36B totales / ~3B activos | no disponible | Apache 2.0 | Gated en HF | Merge experimental multimodal |
| Qwen/Qwen-AgentWorld-35B-A3B | ~36B / ~3B | no disponible | no disponible | HF | Checkpoint base del merge, orientado a agentes |
| SuperQwen-AgentWorld-35B-A3B-abliterated | ~36B / ~3B | no disponible | no disponible | HF | Variante abliterated, base del merge |
| Thomson-1.0-Small | no disponible | no disponible | no disponible | HF | Base del merge, dominio legal |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental y de investigación: no hay benchmarks ni evaluación formal publicada, por lo que su calidad real es incierta.
- Al ser un merge de múltiples checkpoints, incluidos variantes abliterated y uncensored, puede presentar comportamientos inconsistentes y sesgos heredados difíciles de trazar.
- Riesgo de alucinación no cuantificado; el modo long-cot puede aumentar la verbosidad sin garantizar corrección.
- Longitud de contexto no documentada: no debe asumirse una ventana amplia sin pruebas.
- Soporte lingüístico limitado a en, zh, ja, es; el rendimiento en español no está validado.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated exige aceptar condiciones y el modelo base puede arrastrar restricciones adicionales no documentadas.
- Tamaño de 71,9 GB y requisitos de VRAM elevados limitan su despliegue a infraestructura con GPUs de datacenter o cuantización agresiva.
- No hay versiones GGUF ni cuantizaciones oficiales, lo que complica el despliegue en entornos de consumo.
- Fecha de creación posterior a la información de referencia disponible; verificar la vigencia de los checkpoints base.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage
- Modelo base TerminalHorizon-35B-A3B: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo base Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
