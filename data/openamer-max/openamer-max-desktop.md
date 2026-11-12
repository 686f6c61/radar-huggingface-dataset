# openamer-max/openamer-max-desktop

## Resumen

OpenAmer-Max-Desktop es un ajuste fino (fine-tuning) del modelo Qwen2.5-14B-Instruct, desarrollado por el autor independiente Amer Sacirovic bajo el identificador openamer-max. Forma parte de una familia de modelos escalonados por dispositivo objetivo (smartwatch, smartphone, tablet, desktop), y esta es la cuarta y mayor variante publicada hasta la fecha. El modelo esta pensado para ejecutarse de forma local y offline en ordenadores de sobremesa, con un contexto de 32.768 tokens y un tamano de pesos cuantizados de 8,4 GB en Q4_K_M.

El modelo resuelve el problema de disponer de un asistente conversacional multilingue (aleman, bosnio, croata, serbio e ingles) que funcione sin GPU dedicada y sin telemetria, priorizando respuestas factuales sobre un conjunto cerrado de productos y rechazos honestos ante preguntas fuera de alcance. La arquitectura subyacente es la de Qwen2.5-14B-Instruct, un transformer denso de 14.770.033.664 parametros, ajustado mediante QLoRA de 4 bits con LoRA de rango 32 sobre las siete proyecciones.

Su relevancia actual radica en que demuestra un caso de ajuste fino reproducible con un coste de computo minimo (50 minutos en una A10G alquilada, 0,70 USD) y en que documenta de forma inusualmente transparente los fallos de su propio banco de pruebas, lo que resulta util para quien disene evaluaciones de modelos pequenos en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (8,4 GB); pesos intermedios f16 (29,5 GB) y bf16 fusionado |
| Idiomas soportados | aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repositorio con Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-14B-Instruct sin modificaciones estructurales: un transformer denso con atencion completa y 14,7B de parametros. El ajuste se realizo con QLoRA de 4 bits, con adaptadores LoRA de rango 32 y alpha 64 aplicados sobre las siete proyecciones del modelo. El conjunto de datos de entrenamiento consta de 2.890 ejemplos repartidos en 11 categorias, el mismo dataset empleado en los niveles inferiores de la familia (Watch, Phone, Tab). El entrenamiento se ejecuto en HF Jobs sobre una GPU A10G de 24 GB, con 170 pasos y una duracion de 50 minutos, alcanzando un pico de 15,82 GB de VRAM y un coste de 0,70 USD. El autor documenta que intentos previos en una T4 de 16 GB fallaron por el upcast a fp32 y por `logits.float()`.

La publicacion sigue el flujo fusion (bf16) → GGUF f16 (29,5 GB) → Q4_K_M (8,4 GB). No se documenta el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre el dataset citado. La innovacion destacable no es arquitectonica sino metodologica: el autor documenta seis casos en los que el verificador del banco de pruebas estaba mal y el modelo acertaba (comprobaciones AND frente a OR en grupos de palabras clave, rechazos contados como violaciones, diacriticos no normalizados, frases prohibidas dentro de respuestas correctas, polaridad de negacion invertida y listas planas de prohibicion iteradas por caracter). Tambien advierte de que `repeat_penalty` distinto de 1.0 provoca errores factuales en esta familia de modelos.

## Capacidades

- Generacion de texto conversacional multilingue en aleman, bosnio, croata, serbio e ingles.
- Recuperacion de hechos sobre productos de la familia OpenAmer y rechazos honestos ante preguntas fuera de alcance ("Das weiss ich nicht").
- Polaridad de negacion correcta en aleman y bosnio, incluyendo la distincion del objeto negado.
- Procesamiento de documentos (Word, Excel, PDF) y codigo dentro de la ventana de 32k tokens.
- Aritmetica basica y calculo sencillo, sin garantia en multiplicaciones de cuatro digitos.
- Respuestas cortas y largas segun la formulacion de la pregunta.
- Inferencia local sin GPU a aproximadamente 10 tok/s en CPU de 16 hilos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Asistente de escritorio offline: el modelo se ejecuta con Ollama o llama.cpp en un equipo sin GPU y responde en 0,6-2 s a preguntas cortas, lo que permite integrarlo en un asistente personal que no envia datos a la nube.
- Atencion al cliente de producto: con 32k de contexto puede gestionar conversaciones multi-turno y responder con precision sobre un catalogo cerrado de hechos, rechazando explicitamente lo que no sabe en lugar de inventar.
- Procesamiento de documentos ofimaticos: la ventana de 32.768 tokens permite cargar documentos Word, Excel o PDF y extraer o resumir informacion sin salir del equipo local.
- Soporte en lenguas de los Balcanes occidentales: cubre bosnio, croata y serbio con polaridad de negacion correcta, util para herramientas internas de organizaciones que operan en la region.
- Entornos con requisitos de privacidad: al no requerir telemetria ni conexion, encaja en despliegues donde el texto no puede salir de la maquina, como despachos profesionales o administraciones.
- Base para ajustes finos ulteriores: al estar bajo Apache-2.0 y publicarse en GGUF, sirve como punto de partida para QLoRA sobre dominios especificos con presupuesto de computo minimo, replicando el flujo documentado por el autor.
- Prototipado y evaluacion de asistentes: el banco de pruebas de 45 casos y la documentacion de sus fallos sirven como referencia para disenar verificadores mas robustos en proyectos propios.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen del banco de pruebas propio del autor (45 casos congelados, version 2 del 12.11.2026), no de benchmarks estandar como MMLU, HumanEval o GSM8K.

| Prueba | Resultado |
|---|---|
| Banco congelado de 45 casos (OpenAmer-Max-Desktop) | 44/45 (97,8 %) |
| Mismo banco, Qwen2.5-14B-Instruct sin ajustar | 22/45 (48,9 %) |
| Mejora por ajuste fino | +22 casos |
| Hechos | 11/11 |
| Parafrasis | 7/7 |
| Rechazos | 8/8 |
| Bosnio | 6/6 |
| Rechazos en bosnio | 3/3 |
| Respuestas largas | 3/3 |
| Respuestas cortas | 3/3 |
| Casos limite | 3/4 |
| VRAM durante entrenamiento | 15,82 GB (A10G, 24 GB) |
| Inferencia en CPU | ~10 tok/s en 16 hilos |
| Inferencia en GPU moderna | ~60 tok/s |

El unico fallo del banco es, segun el autor, un artefacto de puntuacion: la respuesta a "Ist OpenAmer besser als ChatGPT?" es equilibrada y correcta pero no contiene las palabras clave exigidas. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 8,4 GB de pesos mas overhead de contexto; el autor cita unos 12,6 GB en 4 bits para el modelo de 14,7B.
- Entrenamiento: requiere al menos 16 GB de VRAM; una T4 de 16 GB fallo y una A10G de 24 GB funciono con pico de 15,82 GB.
- GPU recomendadas: A10G (24 GB) para ajuste fino; cualquier GPU moderna para inferencia a ~60 tok/s.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM en Q4_K_M; en CPU funciona a ~10 tok/s con 16 hilos.
- Opciones de despliegue: llama.cpp, Ollama (el repositorio incluye Modelfile), y cualquier runtime compatible con GGUF.
- Latencia: 0,6-2 s para respuestas cortas en CPU; ~10 tok/s en CPU y ~60 tok/s en GPU moderna.
- Advertencia de configuracion: mantener `repeat_penalty` en 1.0; valores como 1.1 provocaron errores factuales en el nivel de 3B de la misma familia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAmer-Max-Desktop | 14,7B | 32.768 | Apache-2.0 | GGUF | Ajuste QLoRA sobre Qwen2.5-14B; 44/45 en banco propio |
| Qwen2.5-14B-Instruct (base) | 14,7B | 32.768 | Apache-2.0 | safetensors, GGUF | 22/45 en el mismo banco; referencia sin ajustar |
| OpenAmer-Max-Tab | 7,62B | no disponible | Apache-2.0 (segun familia) | GGUF | 42/45 en el mismo banco; 4,4 GB |
| OpenAmer-Max-Phone | 3,09B | no disponible | Apache-2.0 (segun familia) | GGUF | 43/45 en el mismo banco; 2,5 GB |

No se dispone de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Sin garantia en multiplicaciones de cuatro digitos; conviene verificar la aritmetica antes de confiar en ella.
- El bosnio esta limitado a las formulaciones vistas en entrenamiento; el propio autor senala que el bosnio libre no es un punto fuerte pese al 6/6 del banco.
- No es un modelo de 70B: el razonamiento multi-paso largo sigue siendo mas debil que el de modelos frontera.
- Sin GPU la velocidad cae a ~10 tok/s, lo que limita su uso interactivo en equipos modestos.
- El banco de pruebas es propio y de solo 45 casos; los resultados no son comparables con benchmarks estandar y el propio autor documenta seis fallos del verificador.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de sesgo, toxicidad o robustez fuera del banco del autor.
- La licencia Apache-2.0 permite uso comercial, pero el modelo hereda las limitaciones y sesgos de Qwen2.5-14B-Instruct, no evaluados en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados declarados.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que lo requieran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-desktop
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- PayPal del autor: https://www.paypal.com/qrcodes/managed/bfb5b6b5-c04c-4836-af60-987dff8cff61
