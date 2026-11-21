# junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4

## Resumen

Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4 es una cuantizacion en formato MLX del modelo abliterado Ornith-1.5-35B-A3B, un modelo de lenguaje y vision de tipo Mixture-of-Experts (MoE) con 35.107.181.936 parametros totales. Lo publica el usuario junafinity bajo la marca VeriSafe.Live, que se dedica a fine-tuning, cuantizacion y servicio de modelos de pesos abiertos. El modelo base es ornith-ai/Ornith-1.5-35B-A3B, etiquetado en el ecosistema Qwen3.5, y esta version concreta aplica una ablacion de la direccion de rechazo (abliteration) sobre los pesos originales.

La relevancia de esta ficha esta en que combina tres cosas poco habituales en un mismo artefacto: un modelo MoE multimodal con torre de vision preservada, una edicion de pesos que elimina parte de los rechazos aprendidos, y una cuantizacion MXFP4 de 4.402 bits por peso pensada para ejecutarse en Apple Silicon mediante la libreria mlx-vlm. El repositorio ocupa 19,3 GB y acumula 910 descargas y 3 likes en el momento de la consulta.

El autor declara explicitamente que el uso previsto es la investigacion en red teaming y ciberseguridad defensiva, y advierte de que no debe exponerse como endpoint publico sin una capa de moderacion independiente. La licencia declarada es Apache 2.0, lo que facilita el uso comercial segun los terminos de esa licencia, aunque las condiciones del modelo base deben verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision-language), familia Qwen3.5, etiqueta qwen3_5_moe |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4.402 bits por peso, group-size 32, dtype bfloat16); existe variante MLX 8-bit y GGUF Q8_0 en la misma familia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), cuantizacion MXFP4, checkpoint mlx-vlm con torre de vision incluida |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con vision, identificado por la etiqueta qwen3_5_moe, con 35.107 millones de parametros totales y una denominacion A3B que sugiere del orden de 3.000 millones de parametros activos por token, aunque el dato exacto de parametros activos no se detalla en la informacion disponible. La model card menciona que el modelo base incorpora MTP (multi-token prediction) nativo, una tecnica de decodificacion especulativa integrada en el checkpoint original. Esta version MLX descarta los tensores mtp.* durante la conversion, por lo que pierde esa capacidad; el autor remite a su variante GGUF de 8 bits para conservar el MTP nativo.

Sobre el entrenamiento del modelo base no hay informacion en la documentacion proporcionada: no se indica el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La edicion aplicada por VeriSafe.Live es una abliteration, es decir, la eliminacion de la direccion de rechazo en los componentes del modelo, un procedimiento que segun el autor suprime la manifestacion del rechazo pero no la capacidad subyacente. La conversion a MLX se realizo con el comando mlx-vlm con los parametros -q --q-mode mxfp4 --q-group-size 32 --dtype bfloat16, resultando en 4.402 bits por peso. La torre de vision se conserva dentro del checkpoint, algo que el autor destaca como diferenciador frente a otras conversiones.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con soporte de system prompt.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con torre de vision preservada en el checkpoint.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Capacidad de razonamiento y generacion de codigo: no se detalla explicitamente en la model card, pero es coherente con la familia Qwen3.5; el dato concreto no esta disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking explicito: no disponible.
- Ausencia parcial de rechazos por abliteration, con supervivencia de algunos rechazos en rutas de vision, reafirmacion multi-turno y direccionamiento por system prompt.

## Casos de uso

- Red teaming controlado de sistemas defensivos: el modelo actua como mitad de tratamiento frente a su base original para medir el techo de capacidad real de los pesos en un dominio, independientemente de los rechazos que el modelo base muestra. El par base/abliterado constituye un control experimental limpio.
- Evaluacion de pilas de moderacion: al no contribuir con rechazos propios, el modelo permite probar filtros de entrada, clasificadores de salida, defensas frente a prompt injection y APIs de moderacion, y detectar huecos en el plano de control defensivo.
- Aislamiento de superficie de ataque: en bucles automatizados de red teaming, un objetivo que no rechaza evita que el bucle se detenga por rechazos no relacionados y permite aislar el control bajo prueba (inyeccion, abuso de herramientas, rutas de exfiltracion de datos, evasion de politicas).
- Generacion de datos etiquetados para entrenamiento y evaluacion de clasificadores de abuso: el modelo puede producir completaciones etiquetadas que sirvan para entrenar o comparar modelos de deteccion de contenido.
- Investigacion en interpretabilidad del rechazo residual: al ser la abliteration una edicion especificada sobre componentes conocidos del modelo, el par base/abliterado permite estudiar que rechazos sobreviven y por que.
- Analisis de imagenes en entornos de investigacion sobre Apple Silicon: gracias a la torre de vision preservada y al formato MLX, puede ejecutarse localmente en un Mac para tareas de descripcion de imagenes, extraccion de texto en capturas o analisis de documentos escaneados sin salir del equipo.
- Despliegue local en estaciones de trabajo Apple: la cuantizacion MXFP4 de 4.402 bits por peso y los 19,3 GB del repositorio permiten ejecutar un MoE de 35B en hardware Apple Silicon con memoria unificada suficiente, algo inviable en bf16 en la mayoria de equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones numericas con el modelo base o con otras cuantizaciones de la familia.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 19,3 GB, por lo que la inferencia en MXFP4 requiere del orden de 20 GB de memoria disponible para pesos, mas overhead de contexto y de la torre de vision. No hay cifras oficiales de memoria pico.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (familias M1, M2, M3 y M4 con memoria unificada suficiente). No es un formato para CUDA; para GPUs NVIDIA o AMD debe usarse la variante GGUF de la familia.
- Cabe en GPU de consumo: en el ecosistema Apple, si cabe en equipos con 24 GB o mas de memoria unificada, con margen ajustado en configuraciones de 24 GB. En GPUs de consumo tipo RTX 4090 (24 GB) no es directamente compatible por el formato MLX; la variante GGUF Q8_0 de 8 bits de la misma familia es la via adecuada, aunque su huella es mayor.
- Opciones de despliegue: mlx-vlm para Apple Silicon; para otras plataformas, las variantes GGUF de la familia con llama.cpp u Ollama. vLLM y TGI no soportan el formato MLX de este checkpoint.
- Latencia y throughput: no disponibles. Al ser un MoE con una fraccion de parametros activos por token, el throughput deberia ser superior al de un modelo denso de 35B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4 (este) | 35,1B totales | no disponible | MLX MXFP4 (4.402 bpw) | Apache 2.0 | Abliterado, vision preservada, sin MTP |
| Ornith-1.5-35B-A3B-uncensored-MLX-8bit | 35,1B totales | no disponible | MLX 8-bit | Apache 2.0 | Misma familia, mayor precision, mayor huella |
| Ornith-1.5-35B-A3B-uncensored-GGUF-8bit | 35,1B totales | no disponible | GGUF Q8_0 | Apache 2.0 | Conserva MTP nativo, compatible con llama.cpp |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,1B totales | no disponible | safetensors | no disponible en esta ficha | Modelo original con rechazos intactos |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina una direccion de rechazo, no una politica: sobreviven rechazos en rutas de vision, en reafirmacion multi-turno y bajo direccionamiento por system prompt. El comportamiento no es equivalente a un modelo sin alineamiento.
- Riesgo elevado de producir contenido danino si se expone sin moderacion. El propio autor exige no publicar los pesos como endpoint publico sin una capa de moderacion independiente.
- Sesgos conocidos: no documentados en la model card. Al heredar los del modelo base y aplicar una edicion de pesos, los sesgos del base persisten y pueden quedar mas expuestos al desaparecer parte de los rechazos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable el comportamiento tipico de un modelo de 35B en tareas de conocimiento factual, sin datos especificos.
- Perdida de MTP: la conversion a mlx-vlm descarta los tensores mtp.*, por lo que se pierde la decodificacion especulativa nativa del modelo base y el throughput puede ser inferior al de la variante GGUF de 8 bits.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas no estan declaradas en el repositorio.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial con atribucion y avisos, pero debe verificarse la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B, que no se detalla en esta ficha.
- Compatibilidad limitada: el formato MLX restringe el despliegue a Apple Silicon; no es portable a CUDA sin reconvertir.
- El autor recomienda medir siempre el delta frente al modelo base y reevaluar con prompts propios antes de cualquier uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-MXFP4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Coleccion de la familia Ornith 1.5 uncensored: https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd
- Variante MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Variante GGUF 8-bit con MTP: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Variante 9B safetensors bf16: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Variante 9B MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit
- Variante 9B GGUF Q8_0: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Sitio del autor: https://verisafe.live
- Contacto del autor: info@verisafe.live
