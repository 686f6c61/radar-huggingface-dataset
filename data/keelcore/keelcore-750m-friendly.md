# KeelCore/KeelCore-750M-Friendly

## Resumen

KeelCore-750M-Friendly es un adaptador LoRA de rango 16 publicado por KeelCore sobre el modelo base Thelivu-750M. Su única función es reescribir texto en inglés con un tono cálido, cercano e informal: sustituye fórmulas rígidas por expresiones cotidianas, introduce contracciones, convierte órdenes en peticiones y, en aproximadamente una de cada cuatro reescrituras, añade un emoji. No es un modelo conversacional ni responde preguntas: recibe un texto y devuelve ese mismo texto con otro registro.

El adaptador es pequeño (aproximadamente 73 MB, 18,29 millones de parámetros entrenables, un 2,43 % del modelo base) y requiere el modelo base congelado para funcionar. El modelo base es un transformer encoder-decoder de 750 millones de parámetros, lo que permite que el adaptador lea la entrada completa antes de generar y copie literalmente nombres, URL y direcciones de correo en la salida. Puede ejecutarse en CPU o GPU con PyTorch, o en el navegador mediante ONNX Runtime Web.

Su relevancia práctica está en el despliegue local: al ser un adaptador minúsculo sobre un modelo de 750M, cabe en hardware modesto y permite añadir una capa de reescritura de tono dentro de una aplicación sin enviar el texto del usuario a un servidor externo. La licencia Thelivu License 1.0 es restrictiva y debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer encoder-decoder Thelivu-750M |
| Parametros totales | 750M en el modelo base; 18,29M entrenables en el adaptador (2,43 % del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ONNX (usado en la extensión de navegador); otras no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Thelivu License, Version 1.0 (other) |
| Formato de pesos | adapter.safetensors + adapter_config.json (formato Thelivu, no PEFT); también ONNX |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Thelivu-750M, un transformer encoder-decoder de 750 millones de parámetros. La naturaleza encoder-decoder del base permite que el modelo procese la entrada completa antes de decodificar, lo que facilita la copia fiel de cadenas exactas (nombres, URL, correos, números de teléfono) en la salida. El adaptador se carga mediante el código del repositorio Thelivu, que verifica una huella de los pesos del base y rechaza cargarse sobre cualquier modelo distinto de Thelivu-750M.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que aproximadamente el 23 % de las reescrituras usadas en el entrenamiento contienen un emoji, y que en las comprobaciones manuales (260 entradas) 28 salidas (11 %) incluyeron emoji, subiendo a 6 de 18 en frases cortas, educadas y formales. La entrada se enmarca automáticamente con la plantilla ` <text_to_rewrite> … </text_to_rewrite> </s>` y la salida se limita a 384 tokens nuevos con los ajustes por defecto.

## Capacidades

- Reescritura de texto en inglés con tono cálido, casual y cercano, preservando el significado.
- Sustitución de vocabulario formal por equivalentes cotidianos ("assistance" por "help").
- Uso de contracciones y conversión de órdenes en peticiones ("Please submit" por "Could you please submit").
- Inserción ocasional de emojis (aproximadamente 11 % de las salidas en las pruebas manuales).
- Copia literal de cadenas exactas: URL, direcciones de correo y números de teléfono.
- Ejecución en CPU, GPU o navegador (ONNX Runtime Web), lo que permite procesamiento local.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo de chat: no responde preguntas ni sigue instrucciones contenidas en el texto.
- No genera texto desde cero ni traduce a otros idiomas.

## Casos de uso

- Atención al cliente en vivo: reescribir respuestas de soporte antes de enviarlas para que suenen más cercanas, manteniendo los datos exactos (correos, teléfonos, enlaces) gracias a la capacidad de copia del encoder-decoder.
- Onboarding y correos transaccionales: suavizar mensajes de bienvenida, confirmaciones y avisos internos con un tono más amable sin reescribirlos manualmente.
- Publicaciones en comunidades y foros: convertir notas técnicas o anuncios rígidos en mensajes más accesibles para comunidades de usuarios.
- Procesamiento en el navegador: integrar el adaptador vía ONNX Runtime Web en una extensión o aplicación web para reescribir texto sin que este abandone la máquina del usuario.
- Investigación sobre adaptadores pequeños: usar el adaptador como punto de partida para estudiar LoRA de bajo rango sobre un base compartido y comparar el coste de ajuste fino.
- Herramienta de edición para equipos de comunicación: paso de reescritura previo a la revisión humana en borradores de email y mensajes cortos.
- Mensajes de agradecimiento y seguimiento: reformular notas de agradecimiento o seguimiento comercial con un registro más cálido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas cualitativas de las comprobaciones manuales: 260 entradas evaluadas, 28 salidas (11 %) con emoji y una longitud media de salida un 3 % superior a la entrada, con aproximadamente una de cada tres reescrituras más corta que el original.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un modelo base de 750M en fp16 requiere del orden de 1,5 GB solo para pesos, más memoria para activaciones y caché.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con suficiente VRAM debería poder ejecutarlo.
- Cabe en GPU consumer: sí, por el tamaño del base (750M); no se especifican modelos concretos.
- CPU: soportada explícitamente mediante PyTorch.
- Navegador: soportado mediante ONNX Runtime Web con el modelo int8.
- Opciones de despliegue: PyTorch con el código del repositorio Thelivu, ONNX Runtime Web; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| KeelCore-750M-Friendly | 750M base + 18,29M adaptador | no disponible | Reescritura de tono en inglés | Thelivu License 1.0 | safetensors, ONNX |
| Thelivu-750M (base) | 750M | no disponible | Generación de texto encoder-decoder | Thelivu License 1.0 | safetensors |
| Alternativas de reescritura de tono | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores de reescritura de tono sobre bases pequeños) en la documentación proporcionada.

## Limitaciones y advertencias

- Puede alterar el significado en frases donde el matiz es crítico; la model card desaconseja su uso en cláusulas legales, código, configuración o cifras financieras sin revisión humana.
- El tono alegre y los emojis son inadecuados para mensajes sensibles: malas noticias, quejas, seguridad, salud o comunicaciones delicadas.
- Solo funciona en inglés; no soporta otros idiomas.
- No es un modelo de chat ni sigue instrucciones: únicamente reescribe el texto recibido.
- Riesgo de alucinación en la reescritura: puede introducir matices o contenido no presente en el original.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Thelivu License 1.0: es una licencia "other" restrictiva; debe revisarse el texto completo antes de cualquier uso comercial.
- El adaptador solo carga sobre Thelivu-750M; el código verifica la huella de los pesos del base y rechaza otros modelos.
- El formato del adaptador no es PEFT, lo que limita la compatibilidad con herramientas estándar del ecosistema.
- La longitud de contexto no está documentada, lo que dificulta planificar entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Friendly
- Modelo base: https://huggingface.co/Thelivu/Thelivu-750M
- Informe técnico: https://saravanan-a-r.github.io/Thelivu/
- Repositorio GitHub: https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M-Friendly/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
