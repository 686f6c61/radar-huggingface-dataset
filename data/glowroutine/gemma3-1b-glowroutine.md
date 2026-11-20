# glowroutine/gemma3-1b-glowroutine

## Resumen

Gemma 3 1B for GlowRoutine es un ajuste fino del modelo Gemma 3 1B instruction-tuned de Google, desarrollado por el equipo de GlowRoutine para su aplicación de planificación de rutinas de cuidado de la piel (skincare) que funciona íntegramente en el dispositivo. El modelo parte de la versión publicada por litert-community (Gemma3-1B-IT) y ha sido adaptado mediante LoRA sobre respuestas generadas por Gemma 3 4B, para después fusionarse y convertirse a un formato LiteRT-LM de 4 bits optimizado para ejecución en CPU de teléfonos y tabletas.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de destilación de conocimiento de un modelo mayor (4B) hacia uno menor (1B) en un dominio vertical muy concreto; por otro, ejemplifica el despliegue on-device con LiteRT-LM, sin envío de datos a servidores externos. El resultado es un artefacto de 572 MB que cabe en un móvil y responde en una ventana de 4.096 tokens.

Se trata de un modelo especializado, no de propósito general: su uso previsto son respuestas breves sobre skincare y preguntas cotidianas dentro de una aplicación que añade sus propios textos de seguridad. No debe emplearse como asesoramiento médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajustado con LoRA y fusionado |
| Parametros totales | 1B (heredados del modelo base Gemma 3 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int4 (formato `.litertlm`) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano del fichero 572.358.656 bytes |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 1B instruction-tuned de Google, un transformer decoder-only de aproximadamente mil millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA durante 2 épocas, que después se fusionó en los pesos base y se convirtió a un formato LiteRT-LM de 4 bits para inferencia en CPU. El resultado es un único fichero `gemma3-1b-it-int4.litertlm` de 572 MB, ejecutable con LiteRT-LM 0.19.1.

Los datos de entrenamiento consistieron en 1.000 prompts generados con el propio código de prompts de GlowRoutine sobre 240 perfiles de usuario ficticios (sin datos de personas reales). Cada prompt fue respondido dos veces por Gemma 3 4B, y las respuestas se filtraron con las comprobaciones propias de la aplicación (seguridad, productos inventados, advertencias de embarazo, longitud) antes de entrenar. Se trata, por tanto, de una destilación de comportamiento desde un modelo mayor hacia uno menor en un dominio concreto, sin RLHF ni DPO adicionales documentados.

## Capacidades

- Generación de texto breve en inglés orientada a preguntas sobre cuidado de la piel y consultas cotidianas.
- Respuesta a preguntas tipo chat (149 de las 188 preguntas del conjunto de evaluación) y generación de fichas de producto (39 de 188).
- Formato de respuesta conciso, adecuado para interfaces móviles.
- Ejecución on-device en CPU mediante LiteRT-LM, sin conexión a red.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Planificador de rutinas de skincare en aplicación móvil: el modelo responde preguntas breves sobre productos y rutinas dentro de una app que añade hechos y respuestas de seguridad fijas; su tamano de 572 MB y ejecución en CPU lo hacen viable en telefono o tableta sin conexión.
- Generación de fichas de producto: a partir de los datos estructurados de un producto, el modelo produce descripciones breves (evaluado en 39 casos de este tipo en el conjunto de prueba).
- Asistente conversacional offline: al ejecutarse con LiteRT-LM en el dispositivo, permite conversaciones multi-turno dentro de la ventana de 4.096 tokens sin enviar datos a servidores, útil en contextos de privacidad estricta.
- Destilación de dominio como plantilla técnica: el pipeline (prompts sintéticos, respuestas de un modelo 4B, filtrado automático, LoRA y conversión a int4) sirve de referencia para adaptar modelos pequenos a verticales concretos con recursos limitados.
- Prototipado de asistentes de nicho en movil: sirve para validar la experiencia de usuario de un asistente especializado antes de invertir en modelos mayores o en infraestructura en la nube.
- Evaluación de LiteRT-LM en producción: caso práctico para medir latencia y consumo en CPU de un modelo 1B int4 con la configuración de muestreo indicada (top-k 64, top-p 0.95, temperatura 0.5).

## Benchmarks y rendimiento

La model card reporta una evaluación sobre 188 preguntas retenidas (nunca vistas en entrenamiento), comparando el modelo original de 1B, este ajuste y Gemma 3 4B. Las cifras son recuentos de respuestas correctas, no porcentajes.

| Conjunto | Gemma 3 1B original | Este modelo | Gemma 3 4B |
|---|---|---|---|
| Total (188 preguntas) | 138 | 163 | 173 |
| Preguntas de chat (149) | 106 | 127 | 136 |
| Fichas de producto (39) | 32 | 36 | 37 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero int4 ocupa 572 MB; se recomienda al menos 1 GB de memoria libre para la carga y ejecución en CPU.
- GPU recomendadas: no aplica; el modelo está pensado para CPU mediante LiteRT-LM 0.19.1.
- Cabe en cualquier dispositivo móvil moderno (telefono o tableta) con suficiente memoria libre; no requiere GPU dedicada.
- Opciones de despliegue: LiteRT-LM 0.19.1 (runtime oficial del formato `.litertlm`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| glowroutine/gemma3-1b-glowroutine | 1B | 4.096 | `.litertlm` int4 | Gemma Terms | Ajuste de dominio skincare, on-device CPU |
| litert-community/Gemma3-1B-IT | 1B | no disponible | LiteRT-LM | Gemma Terms | Modelo base sin ajuste de dominio |
| Gemma 3 4B (Google) | 4B | no disponible | safetensors y otros | Gemma Terms | Mayor calidad en la evaluación del autor (173/188), pero mayor coste de despliegue |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- No es asesoramiento médico: en las pruebas el modelo afirmó hechos incorrectos, como que la niacinamida contiene un BHA o que el SPF del maquillaje es suficiente.
- Riesgo de alucinación en productos y hechos: la aplicación mitiga esto con respuestas de seguridad fijas para temas sensibles (lunares cambiantes, hinchazón, dosis de medicamentos, embarazo y retinoides, autolesión), que nunca responde el modelo.
- A veces abre las respuestas con la frase "Gemma 3 here.", que la aplicación elimina.
- Idioma limitado al inglés; no se documenta soporte de otros idiomas.
- Ventana de contexto de 4.096 tokens, suficiente para respuestas breves pero no para documentos largos.
- Licencia Gemma Terms of Use y Gemma Prohibited Use Policy: cualquier redistribución debe incluir y transmitir estos términos (sección 3.1 de las condiciones).
- Los datos de entrenamiento son sintéticos (perfiles ficticios y respuestas de Gemma 3 4B), lo que puede introducir sesgos del modelo profesor y no refleja necesariamente la diversidad de usuarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glowroutine/gemma3-1b-glowroutine
- Modelo base: https://huggingface.co/litert-community/Gemma3-1B-IT
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Página de recursos de Gemma: https://gemma.ai/resources/terms
