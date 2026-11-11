# darkmaniac7/TokForge-Bonsai-2-27B-Abliterated-GGUF

## Resumen

TokForge-Bonsai-2-27B-Abliterated-GGUF es un modelo de chat en formato GGUF derivado de Ternary Bonsai 2 27B de Prism ML, que a su vez se construye sobre Qwen3.8-27B de Alibaba Cloud. El modelo ha sido sometido a un proceso de "abliteration" por BoldingBuilds (version v2) para eliminar el comportamiento de rechazo, y TokForge lo redistribuye como copia byte a byte para fijar una version descargable en su aplicacion movil. Cuenta con 27.320.697.856 parametros totales y utiliza un empaquetado ternario de 2 bits denominado PQ2_0 (2,13 bits por peso), lo que reduce el archivo a 7,66 GB.

La relevancia de este modelo radica en su enfoque de inferencia en dispositivo (on-device): esta disenado para ejecutarse en telefonos Android con 16 GB de RAM o mas mediante el motor llama.cpp de TokForge, sin necesidad de conexion tras la descarga. Incorpora una cabeza MTP (multi-token prediction) que permite decodificacion especulativa para acelerar la generacion cuando el runtime detecta una ganancia medible.

La arquitectura combina bloques de atencion completa con bloques de atencion lineal (SSM), segun se deduce de los tensores modificados en la abliteration (`ssm_out`, `attn_output`, `ffn_down`). La licencia es Apache-2.0 y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y atencion lineal (SSM), cabeza MTP |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0 (ternario, 2,13 bits por peso) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (PQ2_0 con cabeza MTP) |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2 27B de Prism ML, construido a partir de Qwen3.8-27B. La arquitectura es un transformer hibrido que alterna bloques de atencion completa con bloques de atencion lineal (SSM), segun se refleja en los tensores `attn_output` (bloques 15-63) y `ssm_out` (bloques 16-62) modificados durante la abliteration. El modelo incluye una cabeza de prediccion multi-token (`blk.64`, correspondiente a la capa MTP de Qwen3.8-27B) que permite al runtime generar borradores de tokens y verificarlos en una sola pasada del modelo completo.

El empaquetado ternario PQ2_0 es un formato de 2 bits propio de Prism ML para pesos ternarios, con un coste de 2,13 bits por peso. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La abliteration de BoldingBuilds modifico 99 de los 851 tensores del modelo (68.121.562 bytes en total): `ffn_down` en los bloques 15 a 63, `ssm_out` en los bloques 16 a 62, `attn_output` en los bloques 15 a 63, y una fila de `output.weight` correspondiente al token `</think>`, que hace que el modelo cierre su razonamiento una vez escrita la respuesta. Todos los tensores conservan tipo, forma y tamano originales.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento con modo de pensamiento (el modelo emite bloques de razonamiento que cierra con `</think>`).
- Decodificacion especulativa mediante cabeza MTP: el runtime puede redactar tokens por adelantado y verificarlos en una pasada.
- Comportamiento sin rechazo (abliterated): responde a prompts que el modelo original rechaza.
- Inferencia en dispositivo en telefonos Android con 16 GB de RAM o mas.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado soporte multimodal (vision, audio).
- Capacidad multilingue limitada al ingles segun los metadatos.

## Casos de uso

- Chat privado sin conexion en movil: el modelo se ejecuta integramente en el telefono mediante TokForge, de modo que las conversaciones no salen del dispositivo una vez descargado el archivo de 7,66 GB.
- Asistente personal en Android de gama alta: con 16 GB de RAM o mas, el usuario puede mantener conversaciones multi-turno con un modelo de 27B parametros empaquetado en 2 bits, sin depender de la nube.
- Prototipado de aplicaciones moviles con LLM local: desarrolladores que quieran integrar generacion de texto en apps Android pueden usar el motor llama.cpp de TokForge o el fork de Prism ML para cargar el GGUF.
- Investigacion sobre abliteration: el modelo permite estudiar como la edicion in-place de 99 tensores afecta al comportamiento de rechazo y al cierre del razonamiento, comparandolo con el archivo stock de Prism ML.
- Evaluacion de decodificacion especulativa en dispositivos: la cabeza MTP permite medir la ganancia de throughput en CPU movil frente a la ejecucion sin cabeza.
- Experimentacion con cuantizacion ternaria: util para analizar la calidad de un modelo de 27B a 2,13 bits por peso en tareas conversacionales en ingles.
- Despliegue en entornos con restricciones de memoria: el archivo de 7,66 GB cabe en dispositivos con 16 GB de RAM, algo inviable con pesos en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 7,66 GB solo para los pesos; se necesita margen adicional para el contexto KV y el estado del runtime. El autor indica telefonos con 16 GB de RAM o mas.
- GPU recomendadas: no disponible. El modelo esta orientado a CPU movil (Android) mediante el motor llama.cpp de TokForge.
- Cabe en GPU consumer: no disponible; el formato PQ2_0 requiere el fork de llama.cpp de Prism ML, por lo que la compatibilidad con backends GPU no esta documentada.
- Opciones de despliegue: app TokForge (Android 1.3.9 o superior, iOS via TestFlight), fork de llama.cpp de Prism ML (necesario para el tipo PQ2_0). Las builds estandar de llama.cpp sin soporte PQ2_0 no pueden cargar el archivo.
- Latencia y throughput: no disponible. El uso de la cabeza MTP en la ruta CPU solo se activa en telefonos donde la comprobacion propia de TokForge mide una ganancia; en el resto el archivo se ejecuta como modelo plano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-Bonsai-2-27B-Abliterated-GGUF | 27,32 B | no disponible | PQ2_0 (2,13 bits/peso) | Apache-2.0 | Hugging Face, app TokForge |
| prism-ml/Ternary-Bonsai-2-27B-gguf (stock) | 27,32 B (estimado, mismo base) | no disponible | PQ2_0 | Apache-2.0 | Hugging Face |
| BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF | 27,32 B (estimado, mismo base) | no disponible | PQ2_0 con MTP | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (modelo base original) | 27 B (aprox.) | no disponible | no disponible (pesos originales) | no disponible | Hugging Face |

Los tres primeros comparten los mismos pesos subyacentes; las diferencias estriban en la abliteration y en la redistribucion. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La abliteration elimina el comportamiento de rechazo: el modelo respondera a prompts que el original rechaza, y el autor declara explicitamente que la responsabilidad de uso recae en el usuario.
- La edicion de una fila de `output.weight` fuerza el cierre del razonamiento tras la respuesta; esto puede alterar el comportamiento en tareas que requieran cadenas de pensamiento largas.
- Riesgo de alucinacion inherente a un modelo de 27B cuantizado a 2,13 bits por peso; la cuantizacion ternaria agresiva puede degradar la calidad frente a los pesos originales.
- El formato PQ2_0 no es compatible con builds estandar de llama.cpp: requiere el fork de Prism ML, lo que limita las opciones de despliegue.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de Prism ML y la atribucion a Qwen (Alibaba Cloud) y BoldingBuilds.
- El modelo esta pensado para inferencia en dispositivo con 16 GB de RAM o mas; en telefonos con menos memoria no es viable.
- No hay informacion publica sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del modelo abliterated.
- La fecha de creacion del repositorio (2026-10-15) y la actualizacion (2026-11-11) deben verificarse en la pagina de Hugging Face, ya que los metadatos pueden cambiar.

## Enlaces

- [Hugging Face: darkmaniac7/TokForge-Bonsai-2-27B-Abliterated-GGUF](https://huggingface.co/darkmaniac7/TokForge-Bonsai-2-27B-Abliterated-GGUF)
- [Modelo base: prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- [Fuente de la abliteration: BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF](https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Fork de llama.cpp de Prism ML](https://github.com/PrismML-Eng/llama.cpp)
- [TokForge](https://tokforge.ai)
- [Discord de TokForge](https://discord.gg/Acv3CBtfVm)
- [TokForge en Google Play](https://play.google.com/store/apps/details?id=dev.tokforge)
- [TokForge en iOS TestFlight](https://testflight.apple.com/join/jnufjzRr)
- [Coleccion TokForge Bonsai 2 Ternary Models](https://huggingface.co/collections/darkmaniac7/tokforge-bonsai-2-ternary-models-6af3fdd7a548b444c61a1982)
- [Coleccion TokForge GGUF Models](https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1)
