# EvaryxTechnologies/Evaryx-Core

## Resumen
Evaryx-Core es un modelo de lenguaje causal de 7.615.616.512 parametros (aproximadamente 8B) desarrollado por EvaryxTechnologies mediante fine-tuning sobre la arquitectura Qwen2. Esta disenado para generacion de texto conversacional y razonamiento estructurado, con enfasis en respuestas naturales y descomposicion de problemas complejos paso a paso.

El modelo se distribuye en formato safetensors con precision F16, ocupa 15,2 GB en el repositorio y se publica bajo la libreria transformers con compatibilidad declarada con text-generation-inference y endpoints. Su relevancia actual radica en ser una alternativa de tamano medio (8B) orientada a tareas de asistente y resolucion de problemas, un segmento muy competido donde prima el equilibrio entre calidad y requisitos de hardware.

La informacion publica disponible es limitada: no se especifican la longitud de contexto, la composicion del dataset de entrenamiento, el proceso de alineacion ni los resultados de benchmarks. La model card se centra en capacidades cualitativas (comunicacion natural, razonamiento profundo, resolucion general de problemas) y en ejemplos de uso con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Qwen2 |
| Parametros totales | 7.615.616.512 (aproximadamente 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 nativo; cuantizacion 4-bit via bitsandbytes (documentada en la model card) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (F16) |

## Arquitectura y entrenamiento
Evaryx-Core emplea la arquitectura Qwen2, un transformer causal denso con atencion por grupos (GQA) y RoPE, segun corresponde a la familia Qwen2. El modelo se presenta como un fine-tuning de un modelo base Qwen2 de 8B parametros, no como un entrenamiento desde cero. La model card indica precision F16 y no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas. Tampoco se especifica si el fine-tuning fue supervisado (SFT) o si incorporo etapas de preferencia. La ausencia de estas especificaciones limita la evaluacion de la reproducibilidad y del comportamiento esperado en produccion.

## Capacidades
- Generacion de texto conversacional en ingles con tono natural y fluido, segun la model card.
- Razonamiento multi-paso y descomposicion de problemas logicos y de puzzles.
- Resolucion general de problemas: explicaciones, lluvia de ideas y apoyo a la toma de decisiones.
- Asistencia en programacion (mencionada de forma generica en la model card, sin benchmarks que la respalden).
- Soporte de plantilla de chat mediante `apply_chat_template` con roles user/assistant.
- Compatibilidad declarada con text-generation-inference y endpoints.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o multi-step reasoning estructurado: no documentadas mas alla del "deep thinking" cualitativo.
- Vision, audio o modo thinking explicito: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso
- Asistente conversacional en ingles: el modelo puede gestionar dialogos multi-turno mediante su plantilla de chat, adecuado para prototipos de atencion al cliente o asistentes internos donde el idioma de trabajo sea el ingles.
- Apoyo al razonamiento paso a paso: util para descomponer problemas logicos, matematicos o de planificacion en entornos educativos o de analisis, dado el enfasis declarado en "deep thinking".
- Generacion de codigo asistida: puede integrarse en editores o pipelines de desarrollo para sugerencias y explicaciones, aunque sin benchmarks publicados que cuantifiquen su calidad en HumanEval o similares.
- Lluvia de ideas y redaccion: generacion de borradores, resumenes y propuestas en ingles para equipos de contenido o producto.
- Prototipado rapido de aplicaciones LLM: su tamano de 8B y la carga en 4-bit (8 GB de VRAM) permiten desplegarlo en estaciones de trabajo para validar productos antes de escalar a modelos mayores.
- Investigacion en fine-tuning: al ser un fine-tuning de Qwen2, sirve como punto de partida para experimentos de ajuste adicional con LoRA o QLoRA sobre una base de 8B.
- Evaluacion comparativa de modelos: util como referencia en estudios internos sobre calidad conversacional en ingles frente a otros modelos de 7-9B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en F16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; la model card recomienda 16 GB+ de VRAM para carga estandar.
- VRAM estimada en 4-bit (bitsandbytes): aproximadamente 8 GB, segun la model card; requiere `bitsandbytes`, `accelerate` y `transformers` actualizados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para F16 con margen; RTX 4090 (24 GB) para F16 con contexto moderado; RTX 3090/4080 para 4-bit.
- GPU de consumo: si cabe en GPUs consumer de 16 GB o mas en F16 (con contexto limitado) y en GPUs de 8-12 GB mediante cuantizacion 4-bit.
- Opciones de despliegue: transformers (documentado), text-generation-inference (tag declarado), endpoints compatibles; vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Evaryx-Core | 7,6B | no disponible | no disponible | Fine-tuning Qwen2 8B; solo ingles; sin benchmarks publicados |
| Qwen2-7B | 7,6B | 32.768 tokens (tipico en Qwen2-7B) | Apache 2.0 (Qwen2-7B) | Modelo base de referencia; multilingue; benchmarks publicados |
| Llama 3.1 8B | 8,0B | 128.000 tokens | Llama 3.1 Community License | Multilingue; amplio ecosistema; benchmarks publicados |
| Mistral 7B | 7,2B | 32.000 tokens | Apache 2.0 | Referencia de 7B; sin fine-tuning conversacional especifico |

La comparativa se apoya en datos publicos de los modelos alternativos; los valores de Evaryx-Core no confirmados se indican como no disponibles. La falta de benchmarks y de licencia clara impide una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias
- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en produccion.
- Ausencia de benchmarks: no hay evidencia publica de calidad en MMLU, HumanEval, GSM8K u otras pruebas, lo que dificulta la seleccion frente a alternativas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones incorrectas; la model card recomienda verificar salidas en contextos medicos, legales, financieros o factuales.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad; al derivar de Qwen2, puede heredar sesgos del modelo base y del dataset de fine-tuning.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede planificar su uso en tareas de documento largo sin pruebas previas.
- Madurez: repositorio con 248 descargas y 1 like, creado y actualizado en noviembre de 2026; ecosistema y soporte comunitario muy limitados.
- Fine-tuning opaco: sin detalles de datos ni de alineacion, la reproducibilidad y la robustez en dominios especializados son inciertas.

## Enlaces
- Hugging Face: https://huggingface.co/EvaryxTechnologies/Evaryx-Core
- Repositorio de Qwen2 (arquitectura base): https://github.com/QwenLM/Qwen2
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Documentacion de bitsandbytes: https://huggingface.co/docs/bitsandbytes
- Documentacion de text-generation-inference: https://huggingface.co/docs/text-generation-inference
