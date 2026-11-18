# ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-3e-compile-ep3

## Resumen
El modelo `ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-3e-compile-ep3` es un ajuste fino (SFT) publicado por el usuario ConnorYU sobre el checkpoint `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200`, que a su vez deriva de la familia Qwen3.5. Se trata de un modelo de 9.409.813.744 parametros (aproximadamente 9,4 mil millones) con arquitectura `qwen3_5`, orientado a generacion de texto y a tareas de imagen-texto a texto segun el pipeline declarado en Hugging Face.

El nombre del checkpoint sugiere varias cosas: la etiqueta "Medical-SFT" indica un ajuste supervisado sobre datos medicos, "tem200" probablemente hace referencia a una temperatura de muestreo, y "8821-3e-compile-ep3" parece indicar un identificador de dataset o run, tres epochs y una fase de compilacion. Sin embargo, la model card no aporta detalles sobre la composicion del dataset, el proceso de entrenamiento ni los hiperparametros, por lo que la mayor parte de la informacion tecnica debe considerarse no disponible.

Es relevante en el ecosistema open source porque ejemplifica el flujo actual de fine-tuning rapido con Unsloth y TRL sobre modelos base de la familia Qwen, con licencia Apache 2.0, lo que facilita su reutilizacion comercial. No obstante, al tener cero descargas y una unica interaccion en el momento de la consulta, se trata de un checkpoint experimental sin validacion externa publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer decoder-only, segun tag de Hugging Face) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta GGUF ni AWQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura declarada es `qwen3_5`, lo que implica un transformer decoder-only de la familia Qwen 3.5, aunque la model card no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El modelo base inmediato es `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200`, lo que sugiere que el checkpoint original paso por una fase de RL (GRPO) orientada a instrucciones y formato "think" antes de este SFT.

El entrenamiento de este checkpoint se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, con un pipeline declarado de imagen-texto a texto. No se especifica el numero de tokens de entrenamiento, la composicion del dataset medico, si hubo RLHF/DPO adicional ni los hiperparametros exactos (aunque el nombre sugiere 3 epochs y temperatura 200). Tampoco se documenta el proceso de "compile" referenciado en el nombre del repositorio.

## Capacidades
- Generacion de texto conversacional en ingles, segun el tag `conversational` y el idioma declarado.
- Procesamiento de imagen-texto a texto, segun el pipeline `image-text-to-text` declarado en Hugging Face (aunque no se detalla el soporte real de vision en la model card).
- Ajuste especifico sobre datos medicos (SFT), orientado presumiblemente a preguntas y respuestas clinicas, aunque la model card no lo confirma.
- Posible modo "thinking" heredado del checkpoint base (`think` en el nombre), no documentado explicitamente.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso
- Asistencia clinica en ingles: el ajuste SFT sobre datos medicos permitiria responder preguntas de dominios como farmacologia o sintomatologia, aunque sin validacion clinica publica no es apto para uso asistencial real.
- Generacion de resumenes de notas clinicas: el modelo puede procesar texto largo (si el contexto lo permite, dato no disponible) y producir resumenes estructurados en ingles, util como borrador para revision humana.
- Experimentacion academica en NLP medico: sirve como punto de partida para investigar el efecto del SFT y del RL previo (GRPO) en tareas de dominio especializado.
- Fine-tuning adicional: al estar en safetensors y licencia Apache 2.0, puede reutilizarse como base para nuevos ajustes con Unsloth o TRL en pipelines de investigacion.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` permite servirlo mediante Hugging Face Inference Endpoints o TGI para prototipos internos.
- Evaluacion comparativa de checkpoints: util para estudiar la degradacion o mejora que introduce el SFT medico frente al checkpoint base con GRPO.
- Prototipos de triaje conversacional: en un entorno controlado y con supervision humana, podria generar preguntas de seguimiento sobre sintomas en ingles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 9-10 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion 4 bits: en torno a 5-6 GB de pesos, con overhead adicional.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB).
- GPU consumer: posible en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090/4080 con cuantizacion 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), endpoints compatibles; no se documenta soporte oficial de vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-3e-compile-ep3 | 9,4 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | SFT medico sobre base Qwen3.5 con GRPO |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200 (modelo base) | 9,4 B (presumible) | no disponible | no disponible | Hugging Face | Checkpoint previo con GRPO orientado a ifeval y modo think |
| Qwen3.5-9B (modelo original de la familia, si existe publicamente) | 9 B aprox. | no disponible | no disponible | no disponible | Referencia de la familia; datos no confirmados en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo experimental con cero descargas y sin validacion externa: no hay evidencia publica de su calidad ni de su seguridad.
- Riesgo elevado de alucinacion en dominio medico: un SFT sobre datos no documentados no garantiza precision clinica y puede producir respuestas plausibles pero incorrectas.
- No apto para uso clinico, diagnostico ni recomendacion terapeutica sin supervision profesional y validacion regulatoria.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni procesos de mitigacion de sesgos.
- Solo idioma ingles declarado; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada: no se puede asumir una ventana larga para documentos clinicos extensos.
- La model card no detalla hiperparametros, dataset ni evaluacion, lo que dificulta la reproducibilidad.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo medico conlleva obligaciones regulatorias adicionales (por ejemplo, marcado CE o equivalentes) que la licencia no cubre.
- El tag `image-text-to-text` sugiere soporte multimodal, pero no se documenta el componente de vision ni su calidad.

## Enlaces
- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-8821-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
