# labadain/Labadain-Gemma-4-E2B-it-Tetun-GGUF

## Resumen

Labadain-Gemma-4-E2B-it-Tetun-GGUF es la versión cuantizada en formato GGUF (Q4_K_M) de un ajuste fino del modelo Gemma 4 de Google, especializado en conversación en tetun (tetun-dili), la lengua oficial de Timor-Leste. Lo desarrolla Labadain, una iniciativa de investigación centrada en recuperación de información, PLN e IA para lenguas de bajos recursos, con el objetivo de promover la inclusión digital en Timor-Leste. El modelo parte de `unsloth/gemma-4-E2B-it` y se ha ajustado mediante QLoRA sobre un conjunto de 32.197 conversaciones multi-turno en tetun.

El interés principal reside en su condición de modelo para una lengua de bajos recursos: la mayoría de los LLM disponibles tienen un soporte muy limitado del tetun, y este ajuste busca ofrecer respuestas naturales y contextualmente relevantes en dominios como conocimiento general, noticias, conversación cotidiana y salud. La versión GGUF Q4_K_M está pensada para inferencia local eficiente, incluso en CPU, y se distribuye también a través de Ollama.

El modelo cuenta con aproximadamente 4.647 millones de parámetros (4,65 B) según los pesos en safetensors del modelo base, y hereda de Gemma 4 la capacidad de modo de razonamiento (thinking mode). No se han publicado resultados de benchmarks ni evaluaciones sobre aplicaciones downstream en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); detalles específicos no disponibles |
| Parámetros totales | 4.647.450.147 (~4,65 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | tet (tetun), tdt (tetun-dili) |
| Licencia | gemma (Gemma 4 License) |
| Formato de pesos | GGUF (repo de 3,4 GB); versión safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 E2B instruct (`unsloth/gemma-4-E2B-it`) mediante QLoRA, con posterior fusión de los adaptadores en el modelo base. La arquitectura subyacente es la de la familia Gemma 4, un transformer decoder-only; la información proporcionada no detalla innovaciones arquitectónicas específicas (tipo de atención, uso de MoE, etc.). El resultado del ajuste se ha cuantizado a GGUF Q4_K_M para inferencia local y en CPU.

El conjunto de entrenamiento final consta de 32.197 conversaciones multi-turno compiladas a partir de varias fuentes en tetun: 20.132 conversaciones generales, 9.649 ejemplos de QA y multi-turno sobre salud, 1.951 conversaciones derivadas de artículos de noticias y 465 conversaciones de educación y lengua. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de estos recuentos, ni si se aplicaron etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en tetun (tetun-dili), con respuestas multi-turno.
- Conocimiento general y conversación cotidiana en tetun.
- Dominio de salud: respuesta a preguntas y diálogo multi-turno sobre temas sanitarios.
- Dominio de noticias: conversación basada en contenido de actualidad.
- Educación y lengua: soporte a tareas educativas y lingüísticas en tetun.
- Modo de razonamiento (thinking mode) heredado de Gemma 4, desactivable con `--think=false` en Ollama.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en tetun para atención ciudadana: el modelo puede mantener diálogos multi-turno en tetun sobre trámites, servicios y preguntas frecuentes, aprovechando su ajuste específico sobre conversaciones generales.
- Triaje y orientación sanitaria básica: gracias a los 9.649 ejemplos de QA y multi-turno del dominio de salud, puede responder preguntas divulgativas y derivar al usuario a profesionales, siempre con supervisión humana.
- Difusión de noticias en tetun: con los 1.951 ejemplos derivados de artículos de prensa, puede resumir o reformular noticias y responder preguntas sobre ellas en lengua local.
- Apoyo educativo y aprendizaje de la lengua: los 465 ejemplos de educación y lengua permiten usarlo como asistente para prácticas de tetun, explicaciones gramaticales y ejercicios.
- Investigación en PLN de bajos recursos: sirve como modelo de referencia para experimentos de evaluación, ajuste y comparación en tetun dentro de la comunidad investigadora.
- Despliegue local sin GPU dedicada: la cuantización Q4_K_M y el tamaño del repo (3,4 GB) permiten ejecutarlo en portátiles y equipos de gama media vía Ollama o llama.cpp, útil para organizaciones con recursos limitados en Timor-Leste.
- Integración en aplicaciones web de Labadain: el modelo puede alimentar el chat conversacional de Labadain Chat y complementar el buscador en tetun de Labadain Search.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado todavía en aplicaciones downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M y ~4,65 B de parámetros, se estima en torno a 3-4 GB de memoria para los pesos, más overhead de contexto (estimación, no dato oficial).
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabe en GPU de consumo con 8 GB o más (por ejemplo, RTX 3060/4060 y superiores). Para GPU de datacenter (A100, H100) no hay datos de rendimiento publicados.
- CPU: el formato GGUF Q4_K_M está pensado para inferencia en CPU; la model card lo presenta como versión para inferencia local y en CPU eficiente.
- Opciones de despliegue: Ollama (`ollama run labadainofficial/labadain-gemma4:e3b-q4km`) y llama.cpp (`llama-cli`). No se documentan vLLM ni TGI para esta versión GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Labadain-Gemma-4-E2B-it-Tetun-GGUF | ~4,65 B | no disponible | tet, tdt | gemma | GGUF Q4_K_M |
| Labadain-Gemma-4-E2B-it-Tetun (base fusionado) | ~4,65 B | no disponible | tet, tdt | gemma | safetensors |
| unsloth/gemma-4-E2B-it (modelo de partida) | ~4,65 B (según base) | no disponible | multilingüe (no detallado) | gemma | safetensors |

No se dispone en la información proporcionada de modelos comparables específicos para tetun ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en aplicaciones downstream; no hay evidencia publicada de calidad, robustez ni seguridad en producción.
- Riesgo de alucinación inherente a los LLM, especialmente en dominios como salud o noticias, donde el ajuste puede generar respuestas plausibles pero incorrectas.
- Cobertura lingüística limitada a tetun y tetun-dili; no se documenta un rendimiento fiable en otros idiomas.
- Sesgos potenciales derivados de las fuentes de entrenamiento (noticias, salud, conversación general), no analizados en la información disponible.
- Licencia Gemma 4: el uso y la redistribución deben cumplir la Gemma 4 License y sus términos upstream; conviene revisar las restricciones de uso comercial antes de desplegarlo.
- La model card mezcla referencias a E2B y E3B (por ejemplo, el comando de Ollama usa la etiqueta `e3b-q4km` y el ejemplo de llama.cpp un fichero `E3B`), lo que puede generar confusión sobre la variante exacta desplegada.
- Al ser una cuantización Q4_K_M, puede existir una degradación de calidad respecto al modelo fusionado en safetensors, no cuantificada en la información disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun-GGUF
- Modelo base fusionado: https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun
- Ollama: https://ollama.com/labadainofficial/labadain-gemma4
- Labadain Chat: https://www.labadain.com
- Labadain Search: https://search.labadain.com
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
