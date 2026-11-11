# Eitakinugasa/frog-gemma-2-2b-jpn-conversation-mlc

## Resumen

Frog Gemma Japanese conversation model es un ajuste fino de tipo LoRA sobre google/gemma-2-2b-jpn-it, el modelo de 2.000 millones de parametros de Google especializado en japones. Lo desarrolla el usuario Eitakinugasa y esta pensado como una demostracion de aula: su objetivo declarado es experimentar y discutir las limitaciones y alucinaciones de la IA, no servir como fuente fiable de hechos. El entrenamiento consistio en 26 pasos de optimizacion sobre 100 ejemplos curados de conversacion, con 20 de validacion y 20 reservados para evaluacion.

El resultado se ha fusionado con el modelo base y se ha cuantizado a MLC q4f16_1 para ejecutarse en el navegador mediante WebLLM y WebGPU. El repositorio ocupa 1,5 GB e incluye los pesos en formato MLC, no safetensors ni GGUF. Es relevante ahora como ejemplo practico de despliegue de un LLM pequeno en el cliente (navegador) con fines educativos, y como caso de estudio de las limitaciones reales de un ajuste fino con muy pocos datos.

La ficha se basa unicamente en la informacion publicada en la model card y en los metadatos de Hugging Face; no hay resultados de benchmarks ni documentacion adicional disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), derivado de google/gemma-2-2b-jpn-it |
| Parametros totales | 2.000 millones (heredados del modelo base; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | q4f16_1 (MLC, cuantizacion groupwise en NumPy) |
| Idiomas soportados | japones (ja) |
| Licencia | Gemma Terms of Use y Prohibited Use Policy |
| Formato de pesos | MLC (runtime WebLLM / WebGPU WASM) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-2-2b-jpn-it, un transformer decoder-only de la familia Gemma 2 con 2.000 millones de parametros, ajustado por Google para instrucciones en japones. Sobre esa base se aplico un LoRA de conversacion de 26 pasos de optimizacion, entrenado con 100 ejemplos curados, 20 de validacion y 20 reservados (held-out). El adaptador resultante se fusiono con el modelo base y se convirtio a MLC q4f16_1.

La conversion a MLC se realizo en CPU mediante una implementacion en NumPy de la cuantizacion groupwise q4f16_1 con el layout de tensores de MLC, segun el autor para evitar un fallo del compilador en el entorno nightly de la epoca. La model card indica que las 315 formas y dtypes de tensores con nombre coinciden con el runtime precompilado Gemma2 Japanese q4f16_1 de WebLLM 0.2.87. El adaptador tiene SHA-256 efacc87869c4f9584ab4f8669ee9f1f085259daa367dd7eb9ab4a77461fdd2fe y la revision base es 6b046bbc091084a1ec89fe03e58871fde10868eb. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en japones, heredada del modelo base ajustado para instrucciones.
- Conversacion multi-turno basica, aunque el autor advierte que la calidad, la longitud de las respuestas y el seguimiento de instrucciones son imperfectos.
- Ejecucion en navegador mediante WebLLM y WebGPU, sin servicio de inferencia alojado.
- Capacidades del modelo base no verificadas en este ajuste: no hay evidencia publicada sobre tool calling, function calling, razonamiento multi-paso, matematicas o codigo.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Multilingue limitado: la model card declara unicamente japones.

## Casos de uso

- Demostracion educativa en el aula: el modelo se carga en el navegador con WebLLM y WebGPU para mostrar en directo como un LLM pequeno genera respuestas y donde falla, con el objetivo explicito de discutir alucinaciones y limitaciones.
- Talleres sobre alucinaciones: al no ser fiable como fuente de hechos, sirve para que los estudiantes comparen respuestas del modelo con fuentes verificadas y analicen los errores.
- Pruebas de despliegue en el cliente: util para evaluar el pipeline MLC q4f16_1 y WebLLM 0.2.87 en un GPU con soporte de shader-f16, comprobando carga de pesos y generacion en japones.
- Prototipos de interfaz conversacional en japones: permite validar UX de chat multi-turno sin infraestructura de servidor, aceptando la calidad limitada del ajuste.
- Investigacion sobre ajuste fino con pocos datos: los 100 ejemplos y 26 pasos documentados permiten estudiar el efecto de un LoRA minimo sobre un modelo base de 2B.
- Docencia sobre licencias y procedencia de modelos: el repositorio incluye GEMMA_TERMS.txt, avisos del modelo base y FROG_NOTICE.txt, lo que facilita explicar las obligaciones de distribucion derivadas de Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 1,5 GB en cuantizacion q4f16_1, por lo que la huella de pesos ronda ese orden de magnitud, pero no se confirma el consumo total en ejecucion.
- GPU recomendadas: no disponible; la model card solo indica que se verifico en un Apple GPU con soporte de shader-f16.
- Compatibilidad consumer: requiere WebGPU con shader-f16; no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: WebLLM 0.2.87 con el runtime precompilado Gemma2 Japanese q4f16_1 (WebGPU WASM). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Frog Gemma Japanese conversation (este) | 2B | no disponible | MLC q4f16_1 | Gemma | Ajuste LoRA educativo, solo japones, ejecucion en navegador |
| google/gemma-2-2b-jpn-it | 2B | no disponible en esta ficha | safetensors (modelo base) | Gemma | Base oficial de Google para instrucciones en japones |
| Alternativas de 2B para japones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es una fuente fiable de hechos y que no debe usarse para decisiones con consecuencias.
- Calidad conversacional, restricciones de longitud e instrucciones imperfectas segun la propia model card.
- Entrenamiento muy reducido (100 ejemplos, 26 pasos), lo que limita la generalizacion y aumenta el riesgo de sobreajuste al estilo de los ejemplos.
- Riesgo elevado de alucinacion, reconocido por el autor como parte del proposito educativo del modelo.
- Solo soporta japones; no hay evidencia de capacidades multilingues.
- Licencia Gemma: se aplican los Terminos de Uso y la Politica de Uso Prohibido de Google; es obligatorio conservar GEMMA_TERMS.txt, los avisos del modelo base y FROG_NOTICE.txt al distribuir.
- Sin servicio de inferencia alojado; el uso requiere WebGPU con shader-f16 en el cliente.
- Sin benchmarks publicados ni descargas ni likes en el momento de la consulta, por lo que no hay validacion externa del rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eitakinugasa/frog-gemma-2-2b-jpn-conversation-mlc
- Modelo base: https://huggingface.co/google/gemma-2-2b-jpn-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
