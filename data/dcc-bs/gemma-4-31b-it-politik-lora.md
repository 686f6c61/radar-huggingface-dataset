# DCC-BS/gemma-4-31B-it-politik-lora

## Resumen

DCC-BS/gemma-4-31B-it-politik-lora es un adaptador LoRA (concretamente entrenado mediante QLoRA) desarrollado por el Data Competence Center del Cantón de Basilea-Ciudad (DCC-BS) sobre el modelo base google/gemma-4-31B-it. Su propósito es muy específico: redactar borradores de respuestas del Regierungsrat (Consejo de Gobierno) del Cantón de Basilea-Ciudad a las mociones parlamentarias del Grosser Rat (Parlamento cantonal), incluyendo Schriftliche Anfrage, Interpellation, Anzug y Motion, siguiendo el registro y la estructura de la Staatskanzlei (Cancillería cantonal). El adaptador se integra en el asistente interno denominado «Bebbi Bot».

El adaptador no es un modelo autónomo: requiere el modelo base Gemma 4 de 31B parámetros y añade una capa de especialización sobre las proyecciones de atención y MLP del transformer de lenguaje (la torre de visión queda intacta). Se entrenó en dos fases sobre el mismo adaptador: preentrenamiento continuado sobre el corpus público limpio y ajuste por instrucciones, con rango 16, alpha 32 y dropout 0,05.

Su relevancia radica en que aborda un caso de uso administrativo real con un enfoque explícito de mitigación de alucinaciones: cuando las notas del departamento no cubren una pregunta, el adaptador está entrenado para dejar «[…]» y listar «Rückfragen an das Fachdepartement» en lugar de inventar contenido. La licencia Apache 2.0 facilita su reutilización, aunque el alcance está limitado a un único cantón y a un dominio administrativo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Gemma 4; adaptador en proyecciones de atención y MLP del modelo de lenguaje |
| Parametros totales | no disponible (adaptador LoRA; el modelo base google/gemma-4-31B-it tiene 31B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16k recomendado (entrenamiento con secuencias de hasta 12.288 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit (bnb-4bit) para entrenamiento; inferencia sobre FP8-block del modelo base (RedHatAI/gemma-4-31B-it-FP8-block) |
| Idiomas soportados | de (alemán estándar suizo, sin «ß») |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0,5 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-4-31B-it, un transformer decoder-only de 31B parámetros. El entrenamiento emplea QLoRA con Unsloth sobre la versión cuantizada a 4 bits `unsloth/gemma-4-31B-it-unsloth-bnb-4bit`, con rango 16, alpha 32 y dropout 0,05. Los módulos adaptados son las proyecciones de atención y MLP del modelo de lenguaje; la torre de visión del modelo base no se modifica, por lo que el adaptador es efectivamente texto-a-texto.

El proceso consta de dos etapas sobre el mismo adaptador: primero un preentrenamiento continuado sobre el corpus público limpio y después un ajuste por instrucciones con learning rate 1e-4, 2 épocas y secuencias de hasta 12.288 tokens, seleccionando el mejor checkpoint por pérdida en validación (0,3685). El conjunto de datos proviene exclusivamente de documentos públicos del Grosser Rat y del Regierungsrat de Basilea-Ciudad: 7.340 filas de instrucciones, de las cuales 5.740 son cartas emparejadas con notas derivadas de la propia carta (en forma plana y agrupada por pregunta, algunas con hechos eliminados deliberadamente para enseñar el uso de «[…]» y de Rückfragen) y 1.600 filas de preguntas procedimentales sobre la Geschäftsordnung. No se usaron interacciones de usuarios. Una pasada posterior de DPO empeoró los resultados y no se publicó.

## Capacidades

- Redacción de borradores de respuestas oficiales del Regierungsrat a Vorstösse parlamentarios (Schriftliche Anfrage, Interpellation, Anzug, Motion) en alemán estándar suizo, sin «ß».
- Estructuración de la carta según las convenciones de la Staatskanzlei: saludo, respuestas pregunta por pregunta y fórmula de cierre.
- Uso de notas del departamento responsable (palabras clave o frases) y, opcionalmente, de la base legal como material de partida.
- Marcado explícito de lagunas: cuando las notas no cubren una pregunta, deja «[…]» y enumera «Rückfragen an das Fachdepartement» en lugar de inventar.
- Manejo de preguntas procedimentales sobre la Geschäftsordnung del Grosser Rat.
- Generación de textos largos (varias miles de tokens por carta; se recomienda permitir al menos 8.000 tokens de salida).
- No incluye tool calling, function calling, agentes multi-paso ni capacidades de audio; la visión del modelo base no se entrena y queda fuera del alcance del adaptador.

## Casos de uso

- Redacción asistida de respuestas parlamentarias: el adaptador recibe el texto del Vorstoss y las notas del Fachdepartement y produce un borrador estructurado listo para revisión, reduciendo el tiempo de redacción inicial en la Staatskanzlei y en los departamentos.
- Asistente interno «Bebbi Bot»: integrado en el flujo de trabajo del personal del Cantón de Basilea-Ciudad para generar borradores que luego se revisan y editan, con trazabilidad de las lagunas mediante «[…]» y Rückfragen.
- Formación de nuevo personal administrativo: permite generar ejemplos de cartas bien estructuradas a partir de notas sintéticas para mostrar la estructura y el registro esperados.
- Detección de información faltante: al dejar «[…]» y listar Rückfragen, el adaptador sirve como mecanismo de control que señala qué datos debe aportar el departamento antes de cerrar la respuesta.
- Preguntas procedimentales: resolución de dudas sobre la Geschäftsordnung del Grosser Rat a partir de las 1.600 filas de entrenamiento específicas.
- Prototipado de asistentes administrativos en otros cantones: sirve como referencia metodológica (QLoRA, notas agrupadas por pregunta, evaluación con juez LLM) para adaptar Gemma 4 a dominios administrativos similares, aunque las convenciones de otras administraciones no están cubiertas.

## Benchmarks y rendimiento

Evaluación sobre 300 mociones reservadas (una por Geschäft), comparando el adaptador frente al modelo base con un prompt de instrucciones escrito a mano, mediante un juez LLM por pares (`gemini-3.8-flash`, en ambos órdenes) contra la carta auténtica. El propio autor indica que juzgar las mismas salidas dos veces mueve los números unos 4 puntos.

| Forma de entrada | Gana adaptador | Empates | Gana base | n |
|---|---|---|---|---|
| Notas planas | 43,3 % | 20,8 % | 35,9 % | 298 |
| Notas agrupadas por pregunta | 54,8 % | 23,5 % | 21,7 % | 166 |

Comprobación de especificidades (números, fechas, nombres) no presentes en el prompt mediante regex: 0,17 por carta para el adaptador frente a 0,85 para el modelo base. MMLU-de en protocolo de completado bruto: 0,769 para el adaptador frente a 0,785 para el modelo base.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,5 GB; el requisito real lo marca el modelo base Gemma 4 de 31B.
- Inferencia del modelo base en FP8-block: se recomienda servir con vLLM sobre `RedHatAI/gemma-4-31B-it-FP8-block` con `--enable-lora --lora-modules politik=DCC-BS/gemma-4-31B-it-politik-lora --max-model-len 16384`.
- Para FP8 en 31B se necesita hardware con soporte de FP8 (H100, H200, L40S, entre otras); en A100 habría que recurrir a otras precisiones y mayor VRAM.
- En consumer GPU (RTX 4090, 24 GB) no cabe el modelo base completo en FP8; requeriría cuantizaciones más agresivas (4-bit) y probablemente descarga parcial a CPU, con latencia y throughput degradados.
- Despliegue alternativo vía PEFT con `transformers` y `device_map="auto"`, o mediante llama.cpp/Ollama si se dispone de una conversión GGUF del modelo base (no documentada en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DCC-BS/gemma-4-31B-it-politik-lora | 31B (base) + LoRA | 16k recomendado | Respuestas parlamentarias Basilea-Ciudad | Apache 2.0 | Hugging Face |
| google/gemma-4-31B-it (base) | 31B | no disponible en la información | Generalista | Apache 2.0 | Hugging Face |
| RedHatAI/gemma-4-31B-it-FP8-block | 31B | no disponible en la información | Generalista cuantizado FP8 | no disponible en la información | Hugging Face |

No se dispone de datos sobre otros adaptadores LoRA comparables de dominio administrativo suizo en la información proporcionada.

## Limitaciones y advertencias

- Sigue inventando: aproximadamente el 13 % de las cartas contienen al menos una especificidad que no está en el prompt; toda carta requiere revisión del departamento responsable.
- Los prompts largos (más de unos 12.000 caracteres) favorecen al modelo base frente al adaptador.
- Rara vez solicita una posición o moción del Regierungsrat que falte y tiende a redactar la carta de todos modos.
- El conocimiento general del alemán cae ligeramente: MMLU-de 0,769 frente a 0,785 del modelo base.
- Entrenado con documentos de un solo cantón; no cubre las convenciones de otras administraciones.
- Fuera de alcance: responder sin notas del departamento, asesoramiento jurídico y cualquier uso en el que el borrador se envíe sin revisión.
- Una pasada de DPO sobre este adaptador empeoró los resultados y no se publicó; no debe esperarse que el ajuste por preferencias mejore el modelo.
- Los nombres de parlamentarios y miembros del gobierno aparecen en los datos de entrenamiento tal como figuran en los documentos públicos.
- Licencia Apache 2.0, igual que el modelo base; conviene verificar los términos del modelo base de Google para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DCC-BS/gemma-4-31B-it-politik-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Cuantización FP8 del base usada para servir: https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-block
- Versión Unsloth 4-bit usada en entrenamiento: https://huggingface.co/unsloth/gemma-4-31B-it-unsloth-bnb-4bit
- Organización DCC-BS: https://huggingface.co/DCC-BS
