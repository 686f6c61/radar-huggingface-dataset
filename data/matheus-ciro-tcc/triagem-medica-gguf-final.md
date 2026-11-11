# matheus-ciro-tcc/triagem-medica-gguf-final

## Resumen

`triagem-medica-gguf-final` es un repositorio de modelos en formato GGUF publicados como parte del trabajo de fin de curso "Triagem médica automatizada em português brasileiro: ajuste fino QLoRA de modelos de linguagem para roteamento de especialidade", desarrollado por Matheus Marques Eiras y Ciro Guilherme Nass en el IFPR Câmpus Pinhais, con la orientación de João Paulo Orlando. El repositorio agrupa cuatro variantes cuantizadas de modelos ajustados mediante QLoRA para una tarea muy concreta: clasificar la queja de un paciente en una de nueve especialidades médicas (Dentista, Dermatologista, Ginecologista, Oftalmologista, Ortopedista - traumatologista, Otorrino, Psicólogo, Psiquiatra, Urologista).

Los cuatro modelos son Qwen3.5-2B, Gemma 3 4B, Qwen3.5-0.8B y Gemma 3 1B, exportados a GGUF con `convert_hf_to_gguf.py` de llama.cpp build b10663 y divididos en partes de hasta 512 MB (768 MB en el caso del Qwen3.5-2B) para que puedan cargarse en el navegador mediante wllama 3.6.1. La variante Gemma 3 4B se exportó en bf16 y se cuantizó a Q4_K_M para respetar el límite de 4 GB de memoria de WebAssembly; el resto usa Q8_0.

La relevancia de esta publicación es doble: por un lado, documenta un flujo completo de ajuste fino QLoRA y exportación a GGUF con verificación de paridad entre la evaluación en Python y la inferencia en `llama-server`; por otro, expone un caso de uso acotado (triaje de especialidad en portugués brasileño) donde modelos de menos de 2.000 millones de parámetros alcanzan una precisión superior al 89% en un conjunto de test de 18.166 quejas. No es un modelo de propósito general ni un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 y Gemma 3, según modelo base); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 999.885.952 (variante Qwen3.5-0.8B, dato real de safetensors); el resto de variantes no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (Qwen3.5-2B, Qwen3.5-0.8B, Gemma 3 1B); Q4_K_M (Gemma 3 4B) |
| Idiomas soportados | Portugués (pt), en particular portugués brasileño |
| Licencia | other (los modelos Gemma quedan sujetos a los términos de uso de Gemma) |
| Formato de pesos | GGUF, dividido en múltiples partes (`llama-gguf-split`) |

## Arquitectura y entrenamiento

El repositorio no contiene pesos base, sino adaptadores LoRA fusionados con los modelos originales y posteriormente convertidos a GGUF. El procedimiento de fusión es el punto técnico más relevante: el adaptador se suma a los pesos del modelo base tal y como el entrenamiento QLoRA los vio, es decir, cargando el base en NF4 (4 bits, con el checkpoint `-unsloth-bnb-4bit` cuando existe), desquantizando cada capa y aplicando entonces `(α/r)·B·A`. El autor documenta que fusionar el LoRA sobre pesos en precisión completa altera el comportamiento del modelo: en Gemma 3 1B la concordancia con la evaluación de referencia cae de 200/200 a 185/200.

El ajuste fino se realizó con QLoRA en 4 bits sobre un conjunto de entrenamiento no detallado en la model card, y la evaluación se hizo sobre 18.166 quejas de test. La conversión a GGUF se hizo con llama.cpp b10663 (commit `83d855c`), la misma versión embebida en wllama 3.6.1 que usa la demo. La decodificación recomendada es gulosa (`--temp 0`), con un máximo de 20 tokens y parada en `<|im_end|>` o `<end_of_turn>`, y el prompt de sistema debe ser idéntico al del entrenamiento. En Qwen3.5 se desactiva el razonamiento mediante un bloque `<think>` vacío.

## Capacidades

- Clasificación de quejas médicas en una de nueve especialidades predefinidas, devolviendo únicamente el nombre de la especialidad.
- Generación de texto restringida: la salida esperada es una etiqueta corta, no texto libre explicativo.
- Soporte de plantillas de chat específicas de Qwen3.5 (`<|im_start|>`/`<|im_end|>`) y Gemma 3 (`<start_of_turn>`/`<end_of_turn>`).
- Inferencia en navegador mediante wllama/WebAssembly, con modelos partidos en fragmentos de hasta 512 MB (768 MB en Qwen3.5-2B).
- Compatibilidad con `llama.cpp` y `llama-server` para despliegue local.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al portugués (pt) según los metadatos del repositorio.

## Casos de uso

- Triaje de especialidad en portugués brasileño: el modelo recibe la queja del paciente y devuelve una de las nueve etiquetas; es el caso de uso para el que fue entrenado y el único validado con métricas en el TCC.
- Demo académica en navegador: los ficheros GGUF están pensados para cargarse con wllama 3.6.1 en una aplicación web, lo que permite mostrar el sistema sin infraestructura de servidor GPU.
- Preclasificación en un formulario de admisión: integrar el modelo en un flujo de recepción para sugerir la especialidad antes de la revisión humana, reduciendo el tiempo de enrutamiento manual.
- Enrutamiento por lotes sobre históricos de quejas: procesar grandes volúmenes de texto de admisión con `llama-server` para analizar la distribución de especialidades demandadas.
- Prototipado de investigación: servir como línea base reproducible para comparar estrategias de ajuste fino QLoRA y exportación GGUF en tareas de clasificación corta.
- Despliegue en entornos con recursos limitados: las variantes Q8_0 de 0,80 GB y 1,02 GB permiten ejecución en CPU o en equipos sin GPU dedicada.
- Validación de pipelines de cuantización: el script `08_gguf_paridade.py` y la métrica de concordancia permiten verificar que la inferencia GGUF reproduce la evaluación en Python.

## Benchmarks y rendimiento

| Modelo | Cuantización | Tamaño | Precisión en test | F1-macro | Concordancia con evaluación Python |
|---|---|---:|---:|---:|---:|
| Qwen3.5-2B | Q8_0 | 1,98 GB | 91,1% | 0,898 | 198/200 |
| Gemma 3 4B | Q4_K_M | 2,37 GB | 91,4% | 0,901 | 196/200 |
| Qwen3.5-0.8B | Q8_0 | 0,80 GB | 89,2% | 0,881 | 195/200 |
| Gemma 3 1B | Q8_0 | 1,02 GB | 89,1% | 0,863 | 200/200 |

La precisión y el F1-macro corresponden al modelo evaluado en el TCC sobre 18.166 quejas de test con QLoRA en 4 bits. La concordancia mide, sobre las 200 primeras quejas del test, cuántas veces el GGUF ejecutado en `llama-server` devolvió la misma especialidad que la evaluación en Python. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 3 GB para todas las variantes, dado que el mayor fichero ocupa 2,37 GB (Gemma 3 4B en Q4_K_M) y el menor 0,80 GB (Qwen3.5-0.8B en Q8_0).
- GPU recomendadas: no se especifican en la información proporcionada; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM puede alojar los modelos.
- Cabe en GPU consumer: sí, todas las variantes caben en tarjetas de gama media y baja; las variantes de 0,80 GB y 1,02 GB pueden ejecutarse en CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`) y wllama 3.6.1 para navegador. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La decodificación recomendada es gulosa con un máximo de 20 tokens, lo que limita la longitud de salida y, por tanto, el coste de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en test | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B (triaje) | no disponible | no disponible | 91,1% | other | GGUF Q8_0 |
| Gemma 3 4B (triaje) | no disponible | no disponible | 91,4% | other (términos Gemma) | GGUF Q4_K_M |
| Qwen3.5-0.8B (triaje) | 999.885.952 | no disponible | 89,2% | other | GGUF Q8_0 |
| Gemma 3 1B (triaje) | no disponible | no disponible | 89,1% | other (términos Gemma) | GGUF Q8_0 |

Las cuatro variantes pertenecen al mismo proyecto y comparten tarea, por lo que la comparativa relevante es interna: Gemma 3 4B obtiene la mejor precisión (91,4%) y F1-macro (0,901) a costa del mayor tamaño (2,37 GB) y de una concordancia ligeramente inferior (196/200); Qwen3.5-0.8B ofrece el menor tamaño (0,80 GB) con una precisión del 89,2%. No se dispone de datos de benchmarks frente a modelos de propósito general comparables.

## Limitaciones y advertencias

- El modelo sugiere una especialidad, no diagnostica, y no es un dispositivo médico; así lo advierte explícitamente la model card.
- La tarea está restringida a nueve especialidades concretas; cualquier queja fuera de ese conjunto no tiene una etiqueta válida.
- El prompt debe ser idéntico al del entrenamiento (mensaje de sistema y plantilla de chat); variaciones en el formato degradan la salida.
- El idioma soportado es únicamente portugués (pt), con foco en portugués brasileño.
- La licencia es "other" y los modelos Gemma están sujetos a los términos de uso de Gemma, lo que condiciona el uso comercial.
- La fusión del LoRA sobre pesos en precisión completa altera el comportamiento: se documenta una caída de 200/200 a 185/200 en la concordancia para Gemma 3 1B, por lo que reproducir el pipeline exige respetar el orden NF4 → desquantizar → sumar LoRA.
- La concordancia se midió solo sobre las 200 primeras quejas del test, no sobre el conjunto completo.
- No se documentan sesgos específicos, tasas de alucinación ni limitaciones de longitud de contexto en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los pesos están partidos en múltiples ficheros que deben cargarse a partir del primero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/matheus-ciro-tcc/triagem-medica-gguf-final
- Demo en Spaces: https://huggingface.co/spaces/matheus-ciro-tcc/triagem-medica-demo
- Modelo Qwen3.5-2B: https://huggingface.co/matheus-ciro-tcc/qwen35-2b-triagem-medica-final
- Modelo Gemma 3 4B: https://huggingface.co/matheus-ciro-tcc/gemma3-4b-triagem-medica-final
- Modelo Qwen3.5-0.8B: https://huggingface.co/matheus-ciro-tcc/qwen35-0.8b-triagem-medica-final
- Modelo Gemma 3 1B: https://huggingface.co/matheus-ciro-tcc/gemma3-1b-triagem-medica-final
- Repositorio del proyecto (scripts `07_export_gguf.py` y `08_gguf_paridade.py`): https://github.com/MatheusMarquesEiras/TCC-Matheus-e-Ciro
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
