# Op565tomoi/Bio_Wala

## Resumen

Bio_Wala es un modelo de generacion de texto de 1.720.642.560 parametros (aproximadamente 1,72 mil millones) derivado de Qwen/Qwen3-1.7B-Base. Lo publica el usuario Op565tomoi en Hugging Face bajo licencia Apache 2.0. El modelo esta orientado a conversacion bilinguee hindi/ingles (incluyendo hinglish y escritura devanagari) y a su despliegue en dispositivos de recursos limitados (edge), con artefactos GGUF cuantizados y soporte declarado para transformers.js, WebGPU y llama.cpp.

La model card describe un pipeline de adaptacion linguistica: inyeccion de 300 subtokens Devanagari en el tokenizador de Qwen3-1.7B-Base, entrenamiento de calentamiento de los nuevos embeddings y posterior SFT (supervised fine-tuning) sobre problemas matematicos GSM8K-Hindi y datos de question answering indicos. El objetivo declarado es mejorar la tokenizacion del hindi (compresion de texto) y dotar al modelo base de capacidades conversacionales y matematicas en hindi/hinglish sin sacrificar el rendimiento en ingles.

Es relevante ahora por tres motivos: se apoya en la familia Qwen3 (arquitectura transformer densa moderna), ofrece pesos en safetensors y GGUF para inferencia local, y aborda el nicho de los modelos pequenos multilingues para lenguas indias de bajos recursos. No obstante, la propia model card incluye una correccion formal (2026-11-12) que retracta dos metricas anteriores (56 % en GSM8K-Hindi y -26,6 % bits/char), lo que obliga a tratar las cifras publicadas con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B-Base) |
| Parametros totales | 1.720.642.560 (~1,72 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (~1,0 GB) y F16 (~3,2 GB); safetensors en precision nativa (~3,4 GB) |
| Idiomas soportados | Hindi (hi), ingles (en), hinglish y devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso de la familia Qwen3. Sobre esa base se aplica una extension de vocabulario: minado de n-gramas Devanagari a partir de un corpus de 305.000 filas de hindi/hinglish, inyeccion de 300 tokens nuevos con inicializacion de embeddings por media de tokens de bytes, y calentamiento de 3.000 pasos con SGD mas momentum, incluyendo una salvaguarda ("poison-gate") frente a valores NaN.

Tras el calentamiento se ejecuta un SFT de 35.000 filas combinando GSM8K-Hindi, IndicVault y muestras adicionales, con LoRA de rango 32 y entrenamiento distribuido en 2×T4. El autor indica que todas las fases se ejecutaron en hardware de consumo (Kaggle, aproximadamente 6 horas de GPU para el SFT). Existe una variante conversacional v3.3 entrenada con 370 filas de chat curadas (evol-hindi, hinglish e identidad), r=8 y 2 epocas, que mejora el chat en hinglish a costa del rendimiento matematico. Los datasets citados en la model card son bingbangboom/gsm8k-hindi, ai4bharat/IndicVault y eulogik/bharat-v3-chat-sft-v3.

## Capacidades

- Generacion de texto conversacional en hindi, hinglish y ingles.
- Razonamiento matematico basico en hindi (problemas verbales tipo GSM8K-Hindi).
- Question answering sobre conocimiento general indico (por ejemplo, capitales y datos factuales).
- Tokenizacion optimizada para Devanagari: la model card reporta una compresion de tokens Devanagari del 36,9 % y un ahorro del 17,7 % en texto mixto hinglish+hindi.
- Ejecucion totalmente offline en edge: GGUF Q4_K_M de aproximadamente 1,0 GB para llama.cpp, Ollama y llama-cpp-python.
- Inferencia en navegador mediante transformers.js y WebGPU (demo publicada en Hugging Face Spaces).
- Soporte declarado de tool use y RAG en las etiquetas del repositorio, aunque sin documentacion tecnica detallada en la informacion disponible.
- Capacidad multilingue limitada a hi/en/hinglish; no se documentan otras lenguas.

## Casos de uso

- Atencion al cliente en hindi e hinglish: el modelo gestiona conversaciones multi-turno en devanagari y hinglish con un footprint de 1,0 GB en Q4_K_M, lo que permite desplegarlo en servidores modestos o incluso en el dispositivo del usuario sin enviar datos a la nube.
- Asistente offline en dispositivos moviles: con el GGUF Q4_K_M y llama.cpp u Ollama, se puede empaquetar como aplicacion local para consultas de conocimiento general en hindi, manteniendo privacidad total al no requerir API externa.
- Demo web sin backend: mediante transformers.js y WebGPU, el modelo se descarga una vez (~1 GB) y ejecuta en el navegador del cliente, util para prototipos de producto o demos de bajo coste de infraestructura.
- Tutor de matematicas basicas en hindi: entrenado sobre GSM8K-Hindi, puede resolver problemas verbales sencillos de aritmetica en hindi; conviene usarlo con verificacion de resultados dado el rendimiento medido del 29 % en n=100.
- Preprocesamiento y normalizacion de texto Devanagari: la extension de vocabulario reduce el numero de tokens necesarios para representar hindi, lo que abarata tareas de indexacion, busqueda o resumen sobre corpus indicos.
- Base para fine-tuning especializado: al estar publicado en safetensors con licencia Apache 2.0, sirve como punto de partida para adaptaciones LoRA en dominios concretos (legal, sanitario, educativo) en lenguas indias.
- Chatbot de identidad y marca en hinglish: la variante v3.3 (brahmi-v3.3-q4_k_m.gguf) esta ajustada especificamente para conversaciones de marca y respuestas de identidad en hinglish.

## Benchmarks y rendimiento

| Metrica | Base Qwen3-1.7B | Bharat-Tiny-LLM v3 | Nota |
|---|---:|---:|---|
| GSM8K-Hindi (n=100, 4-shot, greedy) | no disponible | 29 % (llama.cpp/Q4); 2 % en torch | Cifra anterior del 56 % retractada |
| Bits/char (ventana de 60, corregida) | 1,20 | 1,71 | Peor que la base; cifra anterior de -26,6 % retractada |
| Compresion de tokens Devanagari | no disponible | 36,9 % | — |
| Ahorro en texto mixto hinglish+hindi | no disponible | 17,7 % | — |
| Parametros | 1,7 B | 1,72 B | +300 tokens de vocabulario |
| Tamano Q4_K_M | no disponible | 1,0 GB | — |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible. Las cifras proceden de la model card del autor y estan sujetas a la correccion publicada el 2026-11-12.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con GGUF Q4_K_M; unos 3,2 GB con F16; unos 3,4 GB con safetensors en precision nativa (sin contar overhead de runtime).
- Cabe en GPUs de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) para Q4_K_M; 6-8 GB recomendables para F16.
- GPU de datacenter: A100, H100 y similares sobredimensionadas para este tamano; utiles solo para entrenamiento o fine-tuning por lotes.
- Despliegue: llama.cpp (llama-cli), Ollama (via Modelfile), llama-cpp-python, transformers con safetensors, transformers.js con WebGPU en navegador. La model card menciona compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento documentado: 2×T4 en Kaggle, aproximadamente 6 horas de GPU para la fase de SFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Bio_Wala (este modelo) | ~1,72 B | no disponible | Apache 2.0 | safetensors + GGUF | Hindi/hinglish, edge, 29 % GSM8K-Hindi |
| Qwen3-1.7B-Base | 1,7 B | no disponible en la informacion | Apache 2.0 | safetensors + GGUF | Modelo base; sin adaptacion indic |
| Qwen2.5-1.5B (via Bharat-Tiny-LLM v2) | 1,5 B | no disponible | Apache 2.0 | safetensors + GGUF | Version previa del mismo proyecto; 0 % en GSM8K-Hindi segun la model card |
| Alternativas de tamano similar para hindi | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

## Limitaciones y advertencias

- Rendimiento matematico limitado y fragil: 29 % en GSM8K-Hindi (n=100, Q4) y solo 2 % en torch, segun la propia auditoria del autor; no debe usarse como calculadora fiable sin verificacion.
- Metricas retractadas: la model card corrige explicitamente el 56 % de GSM8K-Hindi y el -26,6 % de bits/char; cualquier material que cite esas cifras esta desactualizado.
- Tokenizacion menos eficiente que la base en la metrica corregida de bits/char (1,71 frente a 1,20), lo que contradice parte del mensaje promocional sobre compresion.
- Riesgo de alucinacion: modelo pequeno con SFT limitado (35.000 filas); propenso a errores factuales, especialmente fuera de hindi/hinglish.
- Cobertura linguistica restringida a hi, en e hinglish; no se documenta soporte para otras lenguas indias ni para codigo.
- Longitud de contexto no documentada; no hay garantia de comportamiento estable en contextos largos.
- Variante v3.3 sacrifica rendimiento matematico a cambio de chat en hinglish; elegir el checkpoint segun el caso de uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero persisten las obligaciones habituales de atribucion y ausencia de garantias; verificar terminos del modelo base Qwen3.
- La model card mezcla contenido del proyecto Bharat-Tiny-LLM (eulogik) con este repositorio; conviene confirmar que los artefactos publicados corresponden a las metricas citadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Op565tomoi/Bio_Wala
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio Bharat-Tiny-LLM (referenciado en la model card): https://github.com/eulogik/Bharat-Tiny-LLM
- Auditoria de metricas: https://github.com/eulogik/Bharat-Tiny-LLM/blob/main/docs/claim_audit.md
- Licencia del proyecto referenciado: https://github.com/eulogik/Bharat-Tiny-LLM/blob/main/LICENSE
- Modelo Bharat-Tiny-LLM v3: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v3
- Demo WebGPU: https://huggingface.co/spaces/eulogik/bharat-tiny-llm-v3-demo
- Dataset GSM8K-Hindi: https://huggingface.co/datasets/bingbangboom/gsm8k-hindi
- Dataset IndicVault: https://huggingface.co/datasets/ai4bharat/IndicVault
- Dataset bharat-v3-chat-sft-v3: https://huggingface.co/datasets/eulogik/bharat-v3-chat-sft-v3
