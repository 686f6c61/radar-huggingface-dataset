# Shrijanagain/Speed-2-1B-SFT

## Resumen

Speed-2-1B-SFT es un ajuste supervisado (SFT) del modelo base Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt, un modelo de arquitectura MoE (mixture of experts) de autoría propia publicado por el desarrollador independiente Shrijanagain. El modelo se distribuye como pesos fusionados en fp16 a partir de un entrenamiento con LoRA (r=16, alpha=32, aplicado a las capas de atención) sobre el dataset Shrijanagain/SPEED-2-COOKER, y se publica bajo licencia Apache 2.0.

Se trata de un modelo pequeno: el recuento real de parametros en los ficheros safetensors es de 746.280.448 (aproximadamente 0,75B), a pesar de que la nomenclatura del repositorio indica "1B" y la model card menciona "0B7" para el modelo base. El entrenamiento SFT cubrio 315.063.867 tokens supervisados en 9.500 pasos, con 152.000 ejemplos vistos, longitud de secuencia de 4.096 tokens y una perdida de validacion de 3,8480 (perplejidad 46,90).

Su relevancia es limitada pero concreta: se trata de un experimento abierto de arquitectura MoE de bajo coste computacional, con pesos fusionados listos para inferencia (sin necesidad de cargar el adaptador LoRA) y licencia permisiva. La informacion publica disponible es escasa: no hay pipeline declarado, no se detallan idiomas soportados ni se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer, segun tags del repositorio; detalles de capas y expertos no disponibles |
| Parametros totales | 746.280.448 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (longitud de secuencia usada en el SFT; contexto maximo nativo no disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados fusionados en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados fp16; el repositorio declara libreria peft y tags de LoRA, pero la model card indica que no requiere adaptador) |

## Arquitectura y entrenamiento

El modelo base es SPEED2 0B7, descrito por el autor como un MoE custom de aproximadamente 0,7B parametros, preentrenado/continuado con 999,4M tokens (CPT). Sobre el se aplico un SFT con LoRA de rango 16 y alpha 32 sobre las proyecciones de atencion, con un total de 315.063.867 tokens supervisados, 152.000 ejemplos, secuencia de 4.096 tokens, micro-batch de 1 y acumulacion de gradiente de 16, durante 9.500 pasos. La tasa de aprendizaje fue 0,0002 y se uso una plantilla de prompt basada en etiquetas ("tags"). Los pesos resultantes se publican fusionados en fp16, de modo que el adaptador LoRA no es necesario en inferencia.

No se dispone de informacion sobre el numero de expertos, el mecanismo de enrutamiento, la composicion exacta del dataset de SFT (Shrijanagain/SPEED-2-COOKER) ni sobre si se aplicaron fases de RLHF o DPO. El tag `custom_code` indica que el modelo requiere codigo propio del autor para cargarse, lo que implica que no es compatible de forma nativa con transformers sin el repositorio o script correspondiente.

## Capacidades

- Generacion de texto autoregresiva tras el ajuste supervisado.
- Razonamiento y respuesta a instrucciones en formato de plantilla basada en etiquetas ("tags").
- Arquitectura MoE, que en teoria permite activar solo una fraccion de los parametros por token (el numero de parametros activos no esta documentado).
- Capacidades multilingues: no documentadas; no hay lista de idiomas en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no documentado; no hay indicios de capacidades multimodales.
- Al ser un modelo de ~0,75B parametros, su capacidad de conocimiento factual y de razonamiento complejo es estructuralmente limitada en comparacion con modelos de mayor escala.

## Casos de uso

- Experimentacion e investigacion en arquitecturas MoE: el modelo sirve como banco de pruebas de bajo coste para estudiar enrutamiento de expertos, tecnicas de SFT con LoRA y fusion de adaptadores, dado que sus pesos son abiertos y su huella es pequena.
- Prototipado rapido de asistentes conversacionales: con solo ~0,75B parametros puede desplegarse en una unica GPU consumer para validar pipelines de dialogo antes de migrar a modelos mayores.
- Fine-tuning adicional sobre dominios concretos: al estar bajo Apache 2.0 y publicarse en safetensors, es viable aplicar nuevos LoRA o SFT completos para tareas especificas (clasificacion, extraccion, resumen de textos cortos).
- Generacion de texto en entornos con recursos limitados: su tamano permite inferencia en CPU o GPU de gama baja, adecuado para demos, entornos educativos o pruebas offline.
- Evaluacion comparativa de tecnicas de entrenamiento: la model card documenta hiperparametros (pasos, tokens, perdida de validacion), lo que facilita reproducir y comparar recetas de SFT.
- Filtrado y etiquetado de datos a pequena escala: para tareas de clasificacion o anotacion simple donde la precision de un modelo grande no es critica y prima el coste por token.
- Base para experimentos de decodificacion y eficiencia: util para medir latencia y throughput de un MoE pequeno en distintos backends antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la perdida de validacion del SFT: 3,8480 (perplejidad 46,90) tras 9.500 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,75B parametros, en fp16 requiere aproximadamente 1,5 GB solo para pesos; en cuantizacion de 8 bits, en torno a 0,8-1 GB; en 4 bits, alrededor de 0,4-0,5 GB, mas overhead de activaciones y cache KV (no documentado).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en GPU de datacenter (A100, H100) aunque no es necesario.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. El tag `custom_code` y la libreria `peft` sugieren que requiere el codigo del autor y posiblemente transformers con `trust_remote_code=True`. La conversion a GGUF no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa fiable. A continuacion se comparan caracteristicas estructurales con alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Speed-2-1B-SFT | 746M | 4.096 (SFT) | Apache 2.0 | MoE custom, requiere custom_code; sin benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Denso, ampliamente soportado en transformers, llama.cpp y vLLM |
| SmolLM2-1.7B | 1.7B | 8.192 | Apache 2.0 | Denso, ecosistema amplio, benchmarks publicados |
| TinyLlama-1.1B | 1.1B | 2.048 | Apache 2.0 | Denso, muy extendido en cuantizacion GGUF |

La comparacion de rendimiento con estos modelos no es posible con la informacion disponible, ya que Speed-2-1B-SFT carece de evaluaciones publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no especificarse la composicion del dataset de SFT (SPEED-2-COOKER), no es posible evaluar sesgos de genero, idioma o dominio.
- Riesgo de alucinacion: alto esperable por el tamano reducido (~0,75B) y por la ausencia de fases documentadas de RLHF o alineacion; no debe usarse en produccion para tareas que requieran veracidad factual sin verificacion externa.
- Limitaciones de contexto e idioma: la longitud de secuencia documentada es de 4.096 tokens, insuficiente para documentos largos; no hay lista de idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el tag `custom_code` implica dependencia de codigo del autor cuya calidad y mantenimiento no estan garantizados.
- Caveat para produccion: el repositorio ocupa 200 GB, lo que sugiere artefactos de entrenamiento voluminosos ademas de los pesos; conviene descargar solo los ficheros necesarios. La discrepancia entre el nombre ("1B"), la model card ("0B7") y el recuento real (746M) debe tenerse en cuenta al planificar recursos.
- No hay evidencia de soporte en backends estandar (vLLM, llama.cpp, Ollama), lo que complica el despliegue en produccion y la cuantizacion.
- Modelo con muy poca traccion (1 like, 596 descargas) y sin documentacion de evaluacion; tratarlo como experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shrijanagain/Speed-2-1B-SFT
- Modelo base: https://huggingface.co/Shrijanagain/SPEED2-V0-0B7-CPT-SFT-fp8cpt
- Dataset de SFT: https://huggingface.co/datasets/Shrijanagain/SPEED-2-COOKER
- Perfil del autor: https://huggingface.co/Shrijanagain
