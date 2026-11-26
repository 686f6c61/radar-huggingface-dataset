# pranil00/ONIX-DeepSeek-Coder-V2-Lite-Instruct-GGUF

## Resumen
ONIX-DeepSeek-Coder-V2-Lite-Instruct-GGUF es una cuantizacion en formato GGUF (esquema Q5_K_M) del modelo DeepSeek-Coder-V2-Lite-Instruct, publicado por el usuario pranil00 bajo el paraguas de la denominada "ONIX Community". No se trata de un modelo entrenado desde cero, sino de un artefacto de conversion y empaquetado pensado para ejecutar el modelo base de DeepSeek en hardware de consumo mediante llama.cpp, Ollama, LM Studio o la herramienta propietaria del autor, run-any-model.

El modelo base pertenece a la familia DeepSeek-Coder-V2, especializada en generacion y comprension de codigo, con una arquitectura de tipo Mixture-of-Experts (MoE) segun la documentacion publica de DeepSeek. La model card del artefacto cuantizado declara 2.688.004.096 parametros totales, lo que resulta incoherente con las cifras oficiales del modelo base (16B totales y 2.4B activos en DeepSeek-Coder-V2-Lite), por lo que debe tratarse con cautela. El peso comprimido indicado es de 1,81 GB, con una reduccion del 65,6 % respecto a FP16.

La relevancia de esta publicacion es limitada: se trata de una cuantizacion comunitaria sin descargas ni valoraciones, con metadatos incompletos y afirmaciones de rendimiento no verificables (como una "retencion cognitiva del 97,5 %"). Su interes practico reside en la posibilidad de probar el modelo base en equipos modestos, no en aportar capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (heredada del modelo base DeepSeek-Coder-V2-Lite) |
| Parametros totales | 2.688.004.096 (segun model card; el modelo base oficial declara 16B totales) |
| Parametros activos | No disponible en la informacion proporcionada (el modelo base oficial declara 2.4B activos) |
| Longitud de contexto | 8.192 tokens (GPU/Apple Silicon) y 4.096 tokens (CPU) segun la model card del artefacto; el modelo base oficial soporta hasta 128K |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se listan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `deepseek-ai--DeepSeek-Coder-V2-Lite-Instruct-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento
El artefacto no aporta informacion sobre el entrenamiento del modelo base. Segun la documentacion publica de DeepSeek, DeepSeek-Coder-V2-Lite-Instruct es un modelo MoE con 16B parametros totales y 2,4B activos, entrenado sobre un corpus masivo de codigo y texto, con fases de ajuste supervisado y preferencia (RLHF/DPO) para la variante Instruct. La model card de esta cuantizacion no detalla numero de tokens, composicion del dataset ni tecnicas de alineamiento, por lo que esos datos deben consultarse en la ficha oficial del modelo base.

La unica innovacion tecnica documentada en este artefacto es el proceso de cuantizacion Q5_K_M realizado con la herramienta run-any-model, que segun el autor aplica una optimizacion "device-adaptive" y acelera las 27 capas del modelo en Metal. La model card incluye un informe de telemetria propio que compara FP16 frente a Q5_K_M en un host Darwin con 16 GB de memoria unificada, pero no aporta datos reproducibles ni metodologia verificable.

## Capacidades
- Generacion de codigo en multiples lenguajes, heredada del modelo base DeepSeek-Coder-V2-Lite-Instruct.
- Razonamiento sobre codigo, explicacion de fragmentos y respuesta a preguntas tecnicas.
- Modo instructivo conversacional (la variante base es Instruct).
- Generacion de texto general, aunque el enfasis del modelo base es el codigo.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este artefacto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles (el modelo base es solo texto).
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso
- Asistencia de codigo en local: el artefacto de 1,81 GB permite ejecutar un modelo especializado en programacion en portatiles con 8 GB de RAM, usando Ollama o llama.cpp, sin depender de la nube.
- Autocompletado y generacion de fragmentos en editores: con 8.192 tokens de contexto en GPU o Apple Silicon, se puede inyectar el fichero actual y parte del repositorio para sugerencias contextualizadas.
- Prototipado rapido de pipelines de IA: util para desarrolladores que quieran validar integraciones con llama.cpp o run-any-model antes de migrar a modelos mayores.
- Educacion y experimentacion: permite estudiar el comportamiento de un modelo MoE cuantizado en hardware de consumo sin coste de infraestructura.
- Procesamiento por lotes de documentacion tecnica: generacion de resumenes y explicaciones de codigo en entornos con CPU y AVX2/AVX-512.
- Pruebas de concepto en dispositivos Apple Silicon: la model card indica aceleracion Metal nativa en M1 a M5, lo que facilita demos en portatiles Mac.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de Q5_K_M frente a FP16 en tareas de codigo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye unicamente un informe de telemetria propio con las siguientes metricas de memoria y compresion, no de calidad de tarea:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 5,26 GB | 1,81 GB | -65,6 % |
| Buffer KV cache | 864,0 MB | 864,0 MB | Sin cambio |
| RAM residente total | 6,14 GB | 2,69 GB | -56,2 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 27/27 | Optimo |

Estos valores proceden del autor y no han sido verificados de forma independiente.

## Requisitos de hardware
- VRAM/RAM estimada: 2,69 GB de memoria unificada en Apple Silicon; 3,31 GB de VRAM dedicada en GPU NVIDIA RTX 30/40/50; 4,69 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- GPU recomendadas: cualquier NVIDIA RTX 30/40/50 con al menos 4 GB de VRAM; en Apple Silicon, chips M1 a M5 con Metal.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de gama media y en iGPU de Apple Silicon.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model del autor.
- Contexto recomendado: 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-DeepSeek-Coder-V2-Lite-Instruct-GGUF (este) | 2,69B declarados (base oficial 16B/2,4B activos) | 8K (GPU) / 4K (CPU) segun card | Apache 2.0 | GGUF Q5_K_M | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct (base) | 16B totales / 2,4B activos | 128K | DeepSeek License (no Apache 2.0 en el base) | safetensors | Hugging Face, ampliamente usado |
| Qwen2.5-Coder-7B-Instruct | 7B | 128K | Apache 2.0 | safetensors, GGUF | Hugging Face, muy popular |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 Community License | safetensors, GGUF | Hugging Face, ampliamente usado |

Nota: la licencia Apache 2.0 declarada en este artefacto puede no ser coherente con la licencia del modelo base oficial de DeepSeek, que emplea su propia licencia. Conviene verificar ese punto antes de un uso comercial.

## Limitaciones y advertencias
- Incoherencia de parametros: la model card declara 2,69B parametros totales, mientras que el modelo base oficial declara 16B totales y 2,4B activos; esta discrepancia sugiere un error en los metadatos o una conversion defectuosa.
- Licencia dudosa: el artefacto se publica como Apache 2.0, pero el modelo base DeepSeek-Coder-V2 usa la DeepSeek License; el uso comercial debe validarse con la licencia original.
- Sin benchmarks verificables: las cifras de "97,5 % de retencion de calidad" no estan respaldadas por evaluaciones publicas.
- Riesgo de alucinacion: inherente a los modelos de codigo; puede generar APIs o funciones inexistentes, especialmente en contextos largos.
- Contexto reducido en la practica: la model card limita a 8K/4K tokens, muy por debajo de los 128K del modelo base, lo que recorta casos de uso sobre repositorios grandes.
- Idiomas no declarados: no hay informacion sobre calidad en castellano u otros idiomas distintos del ingles.
- Artefacto sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Herramienta propietaria: run-any-model es un proyecto del propio autor; su calidad y mantenimiento no estan contrastados.
- Disclaimer legal extremo: la model card declara responsabilidad nula sobre cualquier salida, lo que traslada todo el riesgo al usuario final.

## Enlaces
- Hugging Face del artefacto: https://huggingface.co/pranil00/ONIX-DeepSeek-Coder-V2-Lite-Instruct-GGUF
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
