# Menterium/gemma-3-4b-it-onnx-int4-dml

## Resumen

`Menterium/gemma-3-4b-it-onnx-int4-dml` es una conversión a ONNX Runtime GenAI del componente de texto de `google/gemma-3-4b-it`, cuantizada a int4 con activaciones fp16 y configurada para ejecutarse sobre el execution provider DirectML de DirectX 12. La publica Menterium IT Solutions GmbH, un integrador austriaco, no Google: se trata de un artefacto derivado, no de un modelo nuevo. Su propósito declarado es la reescritura local y totalmente offline de texto dictado (puntuación, eliminación de muletillas, suavizado de tono) dentro de su aplicación Celerando.

El valor técnico de la ficha no está en el modelo base, sino en la documentación de conversión: el autor corrige explícitamente un fallo del model builder 0.15.2 de onnxruntime-genai al aplicar el factor de escalado lineal del RoPE a las capas de atención local, y documenta una limitación del kernel `GroupQueryAttention` de DirectML que ignora el atributo `local_window_size`. Cualquier build de Gemma 3 en ONNX sobre DirectML está afectado por este segundo problema.

El repositorio ocupa 3,7 GB y no incluye la torre de visión: se extrae únicamente `Gemma3ForCausalLM` (tipo `gemma3_text`). La licencia es Gemma Terms of Use, con las restricciones de la Gemma Prohibited Use Policy aplicables a todo usuario posterior y a toda redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 texto), atención híbrida: capas globales (`full_attention`) y locales con ventana deslizante de 1024 tokens |
| Parámetros totales | 4B (heredados de `google/gemma-3-4b-it`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens efectivos en DirectML (prompt + generado); el modelo base soporta más, pero el kernel DML no respeta la ventana local |
| Tipos de cuantización | int4 round-to-nearest en todos los MatMul, incluido `lm_head`; tabla de embeddings en fp16; activaciones fp16 |
| Idiomas soportados | no disponibles (el modelo base Gemma 3 es multilingüe; esta conversión no declara lista de idiomas) |
| Licencia | Gemma Terms of Use + Gemma Prohibited Use Policy |
| Formato de pesos | ONNX (onnxruntime-genai), con `genai_config.json` |

Capas: 34 en total, de las cuales 29 son de atención local con ventana de 1024 tokens.

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 4B Instruct, un transformer decoder-only de Google con dos tipos de capas de atención: capas globales con RoPE theta 1e6 y factor de escalado lineal 8, y capas locales con ventana deslizante de 1024 tokens, RoPE theta 1e4 y sin escalado. Esta conversión no entrena nada: extrae el decoder de texto del checkpoint multimodal original y lo transforma con el model builder 0.15.2 de onnxruntime-genai usando `-p int4 -e dml`.

Las dos innovaciones relevantes son correcciones de ingeniería. Primero, el autor detecta que el model builder 0.15.2 aplica el factor 8 del RoPE global también a las capas locales, lo que produce un modelo que se detiene tras 0 o 1 tokens; esta build construye ambas cachés rotatorias con los valores de `config.json` (factor 8 global, factor 1 local) y las verifica. Segundo, `genai_config.json` se modifica para incluir `eos_token_id: [1, 106]`, de modo que `<end_of_turn>` termina la generación (la configuración estándar solo paraba en `<eos>`), y se fija `do_sample: false` con `top_k: 1`, es decir, decodificación greedy. No se documentan datos de entrenamiento, tokens vistos ni etapas de RLHF o DPO en esta conversión.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Gemma 3 4B Instruct.
- Reescritura y edición de texto: puntuación, eliminación de palabras de relleno y modulación de tono, el caso de uso para el que se construyó.
- Instrucciones en formato de turnos de Gemma (`<start_of_turn>user` / `<start_of_turn>model`), sin rol de sistema: las instrucciones van en el primer turno de usuario.
- Capacidades multilingües del modelo base, aunque esta conversión no declara lista de idiomas.
- Sin visión: la torre multimodal fue descartada en la extracción.
- Sin soporte declarado de tool calling, function calling ni modos de razonamiento extendido en esta build.
- Integrable con cualquier cliente de onnxruntime-genai sobre GPUs compatibles con DirectX 12.

## Casos de uso

- Reescritura de dictado offline: el escenario original de Celerando. Se envía el texto dictado entre marcadores y se pide puntuación y limpieza; el modelo responde solo con el texto corregido. Funciona sin conexión y con datos que no salen del dispositivo.
- Procesamiento por secciones de documentos largos: dado el límite de 1024 tokens en DirectML, se trocea la entrada en fragmentos que dejen margen para la respuesta, se procesan secuencialmente y se recompone la salida. Adecuado para correos, notas de reunión e informes.
- Asistente de escritura en aplicaciones de escritorio Windows: al ejecutarse sobre DirectML, se integra en apps nativas con acceso a GPU sin necesidad de CUDA ni de stack Python en producción.
- Normalización de transcripciones en pipelines de subtitulado: convertir transcripciones ASR en bruto (sin puntuación, con repeticiones) en texto legible, verificando que cada salida termina en `<end_of_turn>` antes de aceptarla.
- Prototipado y evaluación de Gemma 3 en entornos sin GPU NVIDIA: sirve para validar prompts y formatos de turno en hardware Intel, AMD o Qualcomm con DirectX 12 antes de pasar a un despliegue mayor.
- Generación de respuestas cortas y deterministas en producción: con decodificación greedy y `top_k: 1`, el mismo prompt produce la misma salida, lo que simplifica las pruebas de regresión y la auditoría.
- Filtrado o reformateo de texto en el borde (edge): clasificación ligera y reescritura de campos en aplicaciones de escritorio donde no es viable enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de latencia o throughput. El único dato empírico documentado es una prueba aislada del operador `GroupQueryAttention` con 1026 tokens y ventana de 1024: el kernel de CPU devuelve 0.0 para el valor fuera de ventana y el de DirectML devuelve 0.998, evidencia de que el atributo `local_window_size` se ignora en DML.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 3,7 GB; en ejecución cabe holgadamente en GPUs con 6-8 GB de VRAM, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte DirectX 12 y driver actualizado (Intel Arc, AMD Radeon RX 6000/7000, NVIDIA GTX/RTX). No requiere CUDA.
- GPU de consumo: sí, está diseñado para ellas; el límite práctico es la compatibilidad con DirectML, no la VRAM.
- Opciones de despliegue: onnxruntime-genai (cliente de referencia), con execution provider DirectML o CPU. El EP de CPU aplica correctamente la ventana deslizante y no tiene el límite de 1024 tokens.
- Latencia y throughput: no disponibles.
- Requisito de cliente: fijar `max_length` a 1024 o menos, rechazar prompts de 1024 tokens o más y descartar salidas que alcancen el límite sin token de fin de turno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Menterium/gemma-3-4b-it-onnx-int4-dml | 4B | 1024 efectivos en DML | ONNX int4, onnxruntime-genai + DirectML | Gemma Terms of Use | Solo texto; corrección de RoPE y de EOS incluida |
| google/gemma-3-4b-it | 4B | contexto completo del modelo base | safetensors, transformers | Gemma Terms of Use | Referencia original, multimodal (texto + visión) |
| Otras builds ONNX de Gemma 3 sobre DirectML | 4B | 1024 efectivos en DML | ONNX, onnxruntime-genai | Gemma Terms of Use | Afectadas por el mismo fallo de `local_window_size` según el autor |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Límite duro de 1024 tokens (prompt + generado) en DirectML: más allá, las 29 capas locales atienden fuera de su ventana y el modelo entra en bucles de repetición o trunca la respuesta en silencio.
- El cliente debe implementar defensas explícitas: `max_length` acotado, rechazo de prompts largos, descarte de salidas sin `<end_of_turn>` y troceado de entradas.
- El tokenizador de onnxruntime-genai no añade `<bos>` automáticamente; sin él la salida degenera. Es un error fácil de cometer en producción.
- Gemma no tiene rol de sistema: las instrucciones deben ir en el primer turno de usuario.
- Decodificación greedy fija (`do_sample: false`, `top_k: 1`): poca variedad, adecuada para reescritura pero limitante para generación creativa.
- Sin torre de visión: no procesa imágenes pese a provenir de un checkpoint multimodal.
- Riesgo de alucinación inherente al modelo base de 4B, no mitigado en esta conversión.
- Sesgos del modelo base no evaluados ni documentados en esta ficha.
- Licencia: Gemma Terms of Use y Gemma Prohibited Use Policy se aplican a todo usuario posterior y a toda redistribución; los derechos del modelo subyacente siguen siendo de Google.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Dependencia de una versión concreta del model builder (0.15.2) y de sus fallos conocidos; otras builds derivadas pueden comportarse distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Menterium/gemma-3-4b-it-onnx-int4-dml
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
- Celerando (Menterium): https://celerando.menterium.com
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
