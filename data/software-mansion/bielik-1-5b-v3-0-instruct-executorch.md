# software-mansion/Bielik-1.5B-v3.0-Instruct-ExecuTorch

## Resumen

Bielik-1.5B-v3.0-Instruct-ExecuTorch es la exportación al formato `.pte` de ExecuTorch del modelo Bielik-1.5B-v3.0-Instruct, desarrollado originalmente por SpeakLeash en colaboración con Cyfronet AGH. Esta variante la publica Software Mansion para su uso con la librería React Native ExecuTorch, lo que permite ejecutar el modelo íntegramente en el dispositivo (on-device) dentro de aplicaciones React Native, sin necesidad de backend ni conexión a internet. El modelo base es un transformer de 1.500 millones de parámetros especializado en polaco.

El repositorio contiene dos variantes con pesos distintos: una exportación XNNPACK (8da4w, 937 MB) que reproduce el modelo upstream, y una exportación MLX (int8 GPTQ, 1,6 GB) que es un derivado afinado por Software Mansion para conversación hablada en polaco dentro de un asistente de voz. Esta segunda variante está optimizada para respuestas cortas, sin formato Markdown, con manejo de seguimientos conversacionales y con salvaguardas específicas (derivación a líneas de ayuda en crisis, rechazo de peticiones fuera de alcance).

La relevancia actual del modelo radica en su enfoque: no compite por capacidades generales, sino por ofrecer inferencia local en móvil para un idioma con poca cobertura (polaco), con un tamaño que cabe en memoria de dispositivo y una licencia Apache 2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Bielik-1.5B-v3.0-Instruct); exportado a ExecuTorch con backends MLX y XNNPACK |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (variante MLX); no disponible para XNNPACK |
| Tipos de cuantizacion | int8 (GPTQ, simétrico, grupos de 64, escalas fp16) en MLX; 8da4w en XNNPACK |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (programas compilados), más `tokenizer.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de 1.500 millones de parámetros, afinado por instrucciones por SpeakLeash (Bielik-1.5B-v3.0-Instruct). Sobre esa base, Software Mansion ha producido dos artefactos distintos. La variante XNNPACK conserva los pesos del modelo upstream cuantizados a 8da4w y mantiene únicamente los sesgos de las proyecciones q/k/v. La variante MLX aplica cuantización int8 mediante GPTQ (simétrica, grupos de 64, escalas en fp16) a todas las capas lineales, a la cabeza de salida y al embedding, con cómputo en fp16 y logits en float32; además conserva los sesgos de todas las proyecciones (q, k, v, o, gate, up, down).

Sobre la variante MLX, Software Mansion realizó un fine-tuning específico para conversación hablada en polaco dentro de un asistente de voz. Según la model card, el ajuste busca respuestas de una o dos frases, sin listas ni Markdown, sin afirmaciones de capacidad de actuar sobre el teléfono ni de conocer hora, clima o noticias, con derivación a línea de ayuda (116 123) en conversaciones de crisis y mejor manejo de seguimientos como "krócej", "powtórz" o "mów dalej". El modelo responde mejor con el system prompt con el que fue ajustado, incluido en la model card. La exportación MLX usa chunks de prefill de hasta 2.047 tokens y fue verificada contra el modelo PyTorch fp16 en Apple Silicon: mismo siguiente token en el 99,7 % de las posiciones, con el resto en empates cercanos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en polaco, orientada a respuestas breves y naturales.
- Conversación multi-turno con manejo de seguimientos ("krócej", "powtórz", "mów dalej").
- Respuestas sin formato Markdown ni listas en la variante MLX (adecuada para TTS).
- Salvaguardas conversacionales: rechazo explícito de peticiones fuera de alcance (llamadas, alarmas, música), derivación médica a profesional y línea de ayuda en crisis.
- Inferencia on-device en React Native mediante ExecuTorch, sin backend.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo polaco.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistentes de voz en aplicaciones móviles React Native: la variante MLX está afinada para respuestas habladas cortas, sin Markdown, con el system prompt adecuado para TTS; encaja en un pipeline de reconocimiento de voz + LLM + síntesis de voz en el dispositivo.
- Atención al cliente en polaco con privacidad por diseño: al ejecutarse on-device, las conversaciones no salen del teléfono, lo que resulta adecuado para dominios sensibles donde no se quiere enviar texto a un servidor.
- Aplicaciones sin conectividad: el modelo funciona sin red, útil en escenarios de campo, transporte o zonas con cobertura limitada.
- Prototipado rápido de chatbots en React Native: la librería React Native ExecuTorch permite integrar el modelo mediante su registro de modelos y pipelines de tarea, reduciendo el trabajo de integración.
- Filtrado y moderación de conversaciones en crisis: el ajuste incluye derivación a la línea 116 123, lo que puede servir como capa de respuesta segura en aplicaciones de bienestar o salud mental en polaco.
- Educación y práctica de idiomas: conversación guiada en polaco con respuestas breves, útil para aplicaciones de aprendizaje que requieren turnos cortos y naturales.
- Demos y pruebas de concepto de IA on-device: el tamaño de 937 MB (XNNPACK) o 1,6 GB (MLX) permite validar flujos completos en dispositivos de gama alta sin infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una verificación de fidelidad de la cuantización MLX frente al modelo PyTorch fp16: mismo siguiente token en el 99,7 % de las posiciones evaluadas en Apple Silicon.

## Requisitos de hardware

- VRAM/RAM estimada: la variante XNNPACK ocupa 937,3 MB en disco; la variante MLX, 1,6 GB. El consumo en ejecución depende del runtime y del contexto, pero el tamaño de pesos sugiere que ambas caben en memoria de dispositivos móviles de gama alta.
- GPU recomendadas: no se especifican GPU de escritorio; el objetivo es inferencia on-device en móvil (backends XNNPACK para CPU y MLX para Apple Silicon).
- ¿Cabe en GPU consumer? No aplica como caso principal; el modelo está pensado para ejecutarse en dispositivos móviles, no en GPU de escritorio.
- Opciones de despliegue: ExecuTorch v1.4.1 (runtime requerido), React Native ExecuTorch (npm), backends XNNPACK y MLX.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de compatibilidad: ExecuTorch no garantiza compatibilidad hacia delante; runtimes anteriores pueden fallar al cargar los `.pte`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Idiomas |
|---|---|---|---|---|---|
| Bielik-1.5B-v3.0-Instruct-ExecuTorch | 1,5B | 8.192 (MLX) | Apache 2.0 | ExecuTorch `.pte`, on-device | Polaco |
| Bielik-1.5B-v3.0-Instruct (upstream) | 1,5B | no disponible | Apache 2.0 | safetensors / PyTorch | Polaco |
| Alternativas de 1-2B on-device (p. ej. Gemma, Qwen, Llama) | 1-2B | variable | licencias diversas | GGUF, ExecuTorch, etc. | Multilingüe |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos de la misma categoría; la comparación se limita a parámetros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- Idioma: solo polaco; no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- La variante MLX es un derivado afinado para voz; su comportamiento conversacional difiere del modelo upstream y está pensado para respuestas de una o dos frases, sin formato.
- Riesgo de alucinación: el ajuste incluye instrucciones para no inventar datos de hora, clima o noticias, lo que indica que el modelo base puede generar ese tipo de contenido si no se le guía con el system prompt adecuado.
- Dependencia del system prompt: la model card indica que el modelo responde mejor con el prompt de sistema específico; usarlo fuera de ese contexto puede degradar la calidad.
- Compatibilidad de runtime: los `.pte` están publicados para ExecuTorch v1.4.1 y no hay garantía de compatibilidad con versiones anteriores o posteriores.
- La variante XNNPACK y la MLX no son equivalentes: tienen pesos distintos y sesgos distintos; no deben intercambiarse sin revisar el comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base upstream.
- No se documentan sesgos específicos ni evaluaciones de seguridad más allá de las salvaguardas conversacionales descritas.
- El tamaño del repositorio (14,7 GB) incluye artefactos que no se detallan en la estructura listada; conviene verificar qué se descarga antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/software-mansion/Bielik-1.5B-v3.0-Instruct-ExecuTorch
- Modelo base upstream: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
