# mradermacher/Mistral-Heretica-12B-RP-Evolved-GGUF

## Resumen

Mistral-Heretica-12B-RP-Evolved es un modelo de lenguaje de 12.000 millones de parametros orientado a roleplay (RP) y conversacion creativa, publicado originalmente por el usuario mrcuddle en Hugging Face. La version aqui descrita es una cuantizacion estatica en formato GGUF generada por mradermacher, un perfil conocido por producir y distribuir versiones cuantizadas de modelos de la comunidad para su uso con llama.cpp y herramientas compatibles.

El modelo parte de la familia Mistral, segun indica su nombre y su tamano (12B), aunque la model card no detalla la arquitectura exacta, el contexto nativo ni la composicion del dataset de entrenamiento. La variante "RP-Evolved" sugiere un ajuste fino orientado a conversaciones de rol, probablemente mediante fine-tuning supervisado y, posiblemente, optimizacion por preferencias, aunque no se especifica en la informacion disponible.

Su relevancia es limitada y de nicho: se trata de un derivado comunitario sin documentacion tecnica publicada, sin benchmarks y con cero descargas en el momento de la consulta. Resulta util unicamente para quienes buscan un modelo de rol en formato GGUF listo para ejecutar en local, asumiendo la ausencia de garantias sobre calidad, licencia o comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (inferida del nombre y tamano; no confirmada en la model card) |
| Parametros totales | 12B (segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Por el nombre y el tamano (12B) se infiere una base de la familia Mistral, probablemente un transformer decoder-only con atencion de tipo sliding window o atencion completa, pero la model card no confirma ni el numero de capas, ni las dimensiones ocultas, ni el tipo de atencion. El repositorio cuantizado no incluye metadatos tecnicos mas alla de la lista de cuantizaciones generadas.

Respecto al entrenamiento, la etiqueta "RP-Evolved" indica un ajuste orientado a roleplay, pero se desconoce el volumen de tokens, la composicion del dataset, la existencia de fases de RLHF o DPO, y cualquier innovacion tecnica (decodificacion especulativa, atencion lineal, etc.). El autor de la cuantizacion solo declara que se trata de "static quants" del repositorio base de mrcuddle, sin aportar detalles adicionales sobre el proceso de conversion mas alla de los metadatos de la cabecera (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generacion de texto conversacional orientada a roleplay y ficcion interactiva.
- Mantenimiento de personajes y estilo narrativo en conversaciones multi-turno (sin datos sobre la longitud de contexto efectiva).
- Generacion creativa: dialogos, descripciones y continuacion de escenas.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas.
- No se ha documentado vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Roleplay conversacional en local: el modelo puede mantener una conversacion de personaje con contexto multi-turno usando llama.cpp u otro runtime compatible con GGUF, lo que permite desplegarlo en equipos sin GPU dedicada mediante las cuantizaciones Q4_K_M o Q5_K_M.
- Prototipado de narrativa interactiva: util para escritores que quieran explorar dialogos y tramas de forma iterativa con un modelo afinado especificamente para ficcion, sin depender de APIs externas.
- Chatbot de entretenimiento en aplicaciones de escritorio: integrable en clientes como LM Studio, Ollama o KoboldCpp gracias al formato GGUF, con un perfil de consumo de memoria ajustable mediante la cuantizacion elegida.
- Generacion de dialogos para videojuegos indie: puede servir como generador de lineas de personaje en fases de preproduccion, siempre que se revise el contenido por posibles alucinaciones o incoherencias.
- Experimentacion academica sobre fine-tuning de rol: el repositorio base permite estudiar como un ajuste especifico de RP altera el estilo y la coherencia frente al modelo Mistral original.
- Pruebas de cuantizacion: las multiples variantes (desde Q2_K hasta Q8_0 e IQ4_XS) permiten evaluar el impacto de la cuantizacion en la calidad narrativa de un modelo de 12B, comparando f16 con Q4_K_M o Q6_K en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, calculada a partir del tamano de 12B y el numero de bits por peso):
  - Q2_K: en torno a 4,5-5 GB.
  - Q4_K_M: en torno a 7-7,5 GB.
  - Q5_K_M: en torno a 8,5-9 GB.
  - Q6_K: en torno a 10-10,5 GB.
  - Q8_0: en torno a 13 GB.
  - f16: en torno a 24 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q8_0 o f16; A100 o H100 para despliegues de mayor volumen o f16 con contexto largo.
- Cabe en GPU de consumo: si, con las cuantizaciones Q2_K a Q6_K en tarjetas de 8-12 GB; las variantes Q8_0 y f16 requieren 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No se ha confirmado compatibilidad con vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, y no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Heretica-12B-RP-Evolved (GGUF) | 12B | no disponible | GGUF | no disponible | Hugging Face (0 descargas) |
| Mistral-Nemo-Instruct-2407 | 12B | 128K | safetensors, GGUF (comunidad) | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | safetensors, GGUF (comunidad) | Apache 2.0 | Hugging Face, muy extendido |
| Modelos RP de la comunidad (p. ej. variantes de 12B en GGUF) | 12B | variable | GGUF | variable | Hugging Face, adopcion desigual |

La comparativa se limita a parametros, contexto, formato y licencia, ya que no hay datos de rendimiento publicados para el modelo descrito. Frente a Mistral-Nemo-Instruct, el modelo aqui tratado no ofrece informacion verificable sobre contexto ni licencia, lo que supone una desventaja clara para uso en produccion.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura exacta, contexto, dataset ni proceso de entrenamiento.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; debe consultarse el repositorio base antes de cualquier despliegue.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de calidad, coherencia o seguridad.
- Riesgo elevado de alucinacion y de deriva de personaje, especialmente en cuantizaciones agresivas como Q2_K o Q3_K_S.
- Modelo orientado a roleplay: no esta disenado para tareas de razonamiento, codigo, matematicas o uso profesional, y su comportamiento en esos dominios es impredecible.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Cero descargas y nula validacion por parte de la comunidad en el momento de la consulta: no hay senales de calidad ni de mantenimiento.
- Las cuantizaciones estaticas pueden degradar la coherencia narrativa en comparacion con los pesos originales en f16; conviene validar la variante elegida con pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-Heretica-12B-RP-Evolved-GGUF
- Repositorio base (pesos originales): https://huggingface.co/mrcuddle/Mistral-Heretica-12B-RP-Evolved
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
