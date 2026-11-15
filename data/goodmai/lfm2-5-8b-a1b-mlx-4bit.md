# goodmai/LFM2.5-8B-A1B-MLX-4bit

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, disenado especificamente para ejecucion en dispositivos de borde ("edge") como portatiles. Con 8.467.856.832 parametros totales y aproximadamente 1.000 millones de parametros activos por token (de ahi el sufijo A1B), el modelo busca ofrecer capacidades de asistente personal con un coste computacional reducido durante la inferencia.

Esta ficha concreta, `goodmai/LFM2.5-8B-A1B-MLX-4bit`, es una conversion no oficial al formato MLX con cuantizacion de 4 bits por peso (group size 64, modo affine), manteniendo las compuertas de enrutamiento del MoE a 8 bits. El repositorio ocupa 4,9 GB, lo que lo hace desplegable en equipos Apple Silicon con memoria unificada moderada. La conversion se realizo con mlx-lm 0.31.3 a partir del modelo base `LiquidAI/LFM2.5-8B-A1B`.

El modelo es relevante porque combina una arquitectura MoE eficiente con un modo de razonamiento explicito (chain of thought) y soporte de function calling, todo bajo la licencia LFM Open License v1.0. Su enfoque en el ecosistema MLX lo posiciona como una opcion practica para desarrolladores que trabajan en macOS con chips de la serie M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (lfm2_moe, familia Liquid Foundation Models 2.5) |
| Parametros totales | 8.467.856.832 |
| Parametros activos | ~1.000 millones (A1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits por peso (group size 64, affine), compuertas MoE a 8 bits; formato MLX |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5 de Liquid AI, descrita en el informe tecnico LFM2 (arXiv:2511.23404). Se trata de una arquitectura Mixture-of-Experts con 8.467.856.832 parametros totales y aproximadamente 1.000 millones activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. La etiqueta `lfm2_moe` y la inclusion de la palabra clave `liquid` en los metadatos confirman la adscripcion a la linea de modelos Liquid Foundation Models.

El modelo es de tipo "reasoning": sus turnos de asistente incluyen una cadena de pensamiento explicita antes de la respuesta final, y utiliza una plantilla de chat de estilo ChatML. El modelo base fue entrenado por Liquid AI; no se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Esta ficha corresponde unicamente a la conversion MLX 4-bit realizada por el usuario `goodmai`, que no anade entrenamiento adicional.

## Capacidades

- Generacion de texto conversacional con plantilla de chat ChatML.
- Razonamiento explicito: el modelo produce una cadena de pensamiento antes de la respuesta final.
- Soporte de function calling / tool use mediante `tokenizer.apply_chat_template(..., tools=...)`.
- Capacidades multilingues en nueve idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol y portugues.
- Orientado a tareas de asistente personal en dispositivos de borde.
- No se documentan en la informacion disponible capacidades de vision, audio ni agentes multi-paso mas alla del tool calling.

## Casos de uso

- Asistente personal local en portatiles Apple Silicon: el modelo cabe en 4,9 GB en formato MLX 4-bit, por lo que puede ejecutarse en un Mac con memoria unificada de 16 GB o superior sin conexion a la nube, preservando la privacidad de las conversaciones.
- Automatizacion de tareas con herramientas: gracias al soporte de function calling, puede integrarse en flujos que consulten APIs, bases de datos o servicios internos mediante la definicion de herramientas en la plantilla de chat.
- Generacion de codigo asistida en el editor: el modo de razonamiento permite explicar pasos intermedios antes de proponer soluciones, util en tareas de depuracion o explicacion de fragmentos.
- Prototipado rapido de aplicaciones conversacionales en macOS: al estar en formato MLX, se integra directamente con mlx-lm para pruebas de concepto sin infraestructura GPU dedicada.
- Procesamiento de documentacion multilingue: con soporte para espanol, frances, aleman, portugues, chino, japones, coreano y arabe, puede emplearse en resumenes o traduccion asistida de contenido en esos idiomas.
- Educacion y tutoria: el razonamiento explicito permite mostrar el proceso de resolucion de problemas matematicos o logicos, util en entornos de aprendizaje.
- Despliegue en entornos con restricciones de hardware: al activar solo ~1.000 millones de parametros por token, es viable en equipos sin GPU dedicada de gama alta, a diferencia de modelos densos de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 4,9 GB en cuantizacion 4-bit; se recomienda al menos 8 GB de memoria unificada libre, siendo 16 GB el minimo comodo para contexto amplio.
- GPU recomendadas: al ser formato MLX, esta disenado para Apple Silicon (series M1, M2, M3, M4 y superiores). No es compatible de forma nativa con CUDA.
- Cabe en consumer hardware: si, en equipos Apple con memoria unificada de 16 GB o mas.
- Opciones de despliegue: mlx-lm (libreria oficial de carga), con integracion en scripts Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (MLX 4-bit, esta ficha) | 8,47B | ~1B | no disponible | LFM Open License v1.0 | MLX safetensors |
| LiquidAI/LFM2.5-8B-A1B (base) | 8,47B | ~1B | no disponible | LFM Open License v1.0 | safetensors |
| Alternativas de ~8B densos | ~8B | ~8B | no disponible | variable | variable |

No se dispone de datos de rendimiento comparativo ni de modelos directamente equivalentes documentados en la informacion proporcionada. La comparacion cuantitativa con alternativas de la misma categoria no esta disponible.

## Limitaciones y advertencias

- Conversion no oficial: esta ficha la mantiene el usuario `goodmai`, no Liquid AI; puede no reflejar el comportamiento exacto del modelo base.
- Cuantizacion 4-bit: la perdida de precision puede degradar tareas de razonamiento complejo o generacion de codigo frente al modelo original en precision completa.
- Licencia LFM Open License v1.0: es una licencia "other" con terminos especificos; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en modo de razonamiento con cadenas largas.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que limita la planificacion de casos de uso con documentos extensos.
- Idiomas: aunque soporta nueve idiomas, la calidad puede variar entre ellos; el ingles es presumiblemente el idioma principal de entrenamiento.
- Plataforma: el formato MLX restringe el despliegue a hardware Apple Silicon; no es portable a servidores CUDA sin reconversion.
- Sin datos de benchmarks publicados en esta ficha, por lo que no es posible validar su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/LFM2.5-8B-A1B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Conversion oficial MLX 4-bit de referencia: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-MLX-4bit
- Documentacion Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Blog del modelo: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Informe tecnico LFM2: https://arxiv.org/abs/2511.23404
- Documentacion de plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentacion de tool use: https://docs.liquid.ai/lfm/key-concepts/tool-use
