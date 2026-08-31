# mkornreich/coolconcepts-135m

## Resumen

`mkornreich/coolconcepts-135m` es un modelo de lenguaje de 135 millones de parametros desarrollado por Menachem Kornreich, orientado a la generacion de conceptos creativos. El nombre del modelo y el proyecto asociado ("Cool Concepts") sugieren una funcion de generacion de ideas originales, probablemente inspirada en dinamicas de entropia y economia inteligente, segun la pagina del autor. El modelo esta etiquetado con los tags `onnx` y `llama`, lo que indica que sigue la arquitectura Llama y que se distribuye en formato ONNX para facilitar su despliegue en entornos ligeros.

Con un tamano de repositorio de solo 0,1 GB, es un modelo extremadamente compacto, comparable a la familia SmolLM de HuggingFace (que incluye una variante de 135M). Su relevancia radica en que puede ejecutarse integramente en el navegador mediante WebLLM, sin servidor ni llamadas a API, como demuestra el propio autor en una publicacion de LinkedIn. A fecha de su publicacion (agosto de 2026), no registra descargas, lo que indica que es un proyecto reciente y de ambito experimental.

No se dispone de informacion sobre la licencia, los idiomas soportados, el pipeline de uso ni los datos de entrenamiento, por lo que esta ficha se basa exclusivamente en los metadatos publicos y las referencias del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (segun tags) |
| Parametros totales | 135 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es de tipo Llama, segun los tags del repositorio, lo que implica un transformer decoder-only con atencion causal. El tamano de 135 millones de parametros lo situa en la categoria de modelos pequenos, similar a SmolLM-135M de HuggingFace, que podria servir como base o referencia. El modelo se distribuye en formato ONNX, lo que permite su ejecucion en multiples runtimes y entornos, incluido el navegador via WebLLM.

No se dispone de informacion sobre el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruccion supervisada. Tampoco se conocen innovaciones tecnicas especificas mas alla de la exportacion a ONNX. El autor menciona en su pagina de proyecto conceptos como "Dynamic Entropy" y "Intelligent Economics", que podrian referirse al dominio de generacion de conceptos, pero no se detalla la metodologia.

## Capacidades

- Generacion de conceptos creativos: el modelo parece estar disenado para producir ideas o conceptos originales, segun el nombre del proyecto "Cool Concepts".
- Ejecucion en navegador: gracias al formato ONNX y su tamano reducido, puede ejecutarse con WebLLM directamente en el cliente, sin infraestructura de servidor.
- Inferencia local en hardware modesto: con 0,1 GB de peso, es viable en CPU y dispositivos de bajos recursos.
- Integracion con XKCD: la pagina del proyecto menciona XKCD como referencia, lo que sugiere una capacidad para generar conceptos con humor o logica absurda.
- No se ha confirmado soporte para tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Generacion de ideas para brainstorming: el modelo puede producir conceptos creativos rapidamente, util en sesiones de ideacion para equipos de diseno o marketing, ejecutandose localmente sin coste de API.
- Demostraciones educativas de IA en el navegador: al ejecutarse con WebLLM, sirve como ejemplo didactico de inferencia de modelos de lenguaje en el cliente, sin necesidad de servidores ni GPU.
- Prototipado rapido de aplicaciones de generacion de texto: desarrolladores pueden integrarlo en prototipos web para validar ideas de producto antes de migrar a modelos mayores.
- Herramientas de escritura creativa experimental: su orientacion a conceptos "cool" puede inspirar narrativas, titulos o premisas para ficcion corta.
- Pruebas de concepto en entornos sin conexion: al ser un modelo pequeno en ONNX, es adecuado para aplicaciones offline en dispositivos edge o entornos con conectividad limitada.
- Experimentacion con modelos pequenos: investigadores pueden estudiar los limites de generacion creativa en modelos de 135M y comparar con alternativas como SmolLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cuantizacion FP32; el peso total es de aproximadamente 0,1 GB, por lo que cabe en cualquier GPU moderna e incluso en RAM de CPU.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU o en cualquier GPU con al menos 1 GB de memoria (por ejemplo, GTX 1650 o superiores).
- Compatibilidad con consumer GPU: si, cualquier GPU de consumo reciente es suficiente.
- Opciones de despliegue: ONNX Runtime, WebLLM (navegador), llama.cpp (si se convierte a GGUF), o cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles, pero por el tamano reducido se espera una latencia de pocos milisegundos por token en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso en navegador |
|---|---|---|---|---|---|
| coolconcepts-135m | 135M | no disponible | ONNX | no disponible | Si (WebLLM) |
| SmolLM-135M | 135M | 2048 tokens | safetensors | Apache 2.0 | Si (via conversion) |
| TinyLlama-1.1B | 1.1B | 2048 tokens | safetensors, GGUF | Apache 2.0 | Limitado |

La comparativa se basa en modelos de tamano similar. SmolLM-135M es la alternativa mas directa, con licencia permisiva y documentacion publica. TinyLlama es mas grande pero ofrece mayor capacidad. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sin informacion de licencia: no se puede confirmar si el uso comercial esta permitido; se recomienda contactar al autor antes de cualquier uso en produccion.
- Sin datos de entrenamiento publicados: no es posible evaluar sesgos, calidad del dataset ni cobertura idiomatica.
- Capacidad limitada por tamano: con 135M de parametros, la generacion de texto sera de calidad modesta en tareas complejas, con riesgo de incoherencias en contextos largos.
- Riesgo de alucinacion: como todo modelo pequeno, puede inventar hechos, nombres o conceptos con alta frecuencia.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas estandar.
- Proyecto experimental: con cero descargas y un solo like, es un modelo sin validacion comunitaria ni soporte garantizado.
- Idiomas no especificados: no se sabe si el modelo funciona correctamente en castellano u otros idiomas distintos del ingles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mkornreich/coolconcepts-135m
- Pagina del proyecto del autor: https://mkornreich.me/projects/coolconcepts/
- Publicacion de LinkedIn del autor (menciona WebLLM): https://www.linkedin.com/posts/mkornreich_webllm-browserai-fakescience-activity-7494788644151431168-xEPo
- Referencia de arquitectura similar (SmolLM-135M): https://huggingface.co/HuggingFaceTB/SmolLM-135M
