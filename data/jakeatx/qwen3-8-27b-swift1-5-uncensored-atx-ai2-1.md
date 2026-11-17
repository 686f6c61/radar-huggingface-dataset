# jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2.1

## Resumen

Swift 1.5 Qwen3.8-27B Uncensored (ATX AI2.1) es una cuantizacion GGUF agresiva del modelo base Qwen/Qwen3.8-27B, publicada por el usuario jakeatx bajo el paraguas del proyecto ATX AI. Su objetivo es permitir la ejecucion de un modelo de 27.000 millones de parametros en tarjetas graficas de 8 GB de VRAM manteniendo contexto largo (hasta 204.800 tokens) y decodificacion especulativa MTP activada. Se distribuye en un unico archivo GGUF de aproximadamente 2,1 bits por peso, acompanado de varios archivos auxiliares (sidecars) que implementan atencion LSA y cabezas de borrador para la decodificacion especulativa.

La relevancia de esta ficha es doble. Por un lado, ilustra una tecnica de compresion extrema orientada a hardware de consumo; por otro, conviene advertir que la model card cita cifras de rendimiento propias (KLD, LiveCodeBench) que no son verificables de forma independiente y que dependen de una version de runtime (llamAmpere 0.7) que, segun el propio autor, aun no estaba publicada en el momento de crear el repositorio. El modelo se presenta como "uncensored", lo que implica que se han relajado total o parcialmente los filtros de seguridad del modelo base.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye informacion sobre el proceso de entrenamiento del modelo base ni sobre la composicion del dataset utilizado para el afinado o la eliminacion de censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3.8-27B); runtime con atencion LSA y decodificacion especulativa MTP |
| Parametros totales | 1.271.398.400 (dato safetensors del repo; la model card y el nombre indican 27B, discrepancia no resuelta) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 204.800 tokens (archivo AI2.1 de 8 GB); 262.144 tokens en la variante AI3 de 12 GB |
| Tipos de cuantizacion | GGUF a ~2,1 bits por peso (AI2.1); existe variante AI2 a 2,3 bpw y AI3 para 12 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas sidecars GGUF: `lsa-qwen38-27b-d2048.gguf`, `mtp-dm.gguf`, `head-ait2.gguf`, `head-exact-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso de la familia Qwen3. Sobre el se aplica una cuantizacion GGUF desarrollada por el proyecto llamAmpere, que combina pesos de ~2,1 bits con un esquema de atencion denominado LSA (cuyo funcionamiento exacto no se detalla en la informacion disponible) y un mecanismo de decodificacion especulativa MTP (multi-token prediction) implementado mediante cabezas auxiliares de borrador y rescoring. La model card menciona tambien que el KV cache se descarga a host (host-offloaded KV), lo que permite mantener contextos de cientos de miles de tokens en VRAM muy limitada.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documenta como se realizo el proceso de "uncensoring" (si fue un fine-tuning adicional, una ablacion de direcciones de rechazo o simplemente una modificacion del system prompt). El autor unicamente publica comparativas de calidad de cuantizacion (KLD frente a BF16) y metricas de tamano y latencia de generacion.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Razonamiento y generacion de codigo: la model card reporta resultados en LiveCodeBench v6, lo que sugiere capacidad para tareas de programacion competitiva.
- Soporte de contexto largo: hasta 204.800 tokens en la variante de 8 GB y 262.144 en la de 12 GB, adecuado para RAG y agentes con historial extenso.
- Decodificacion especulativa MTP: genera varios tokens por paso mediante cabezas de borrador, con rescoring exacto opcional.
- Modo "uncensored": se eliminan o relajan los filtros de rechazo del modelo base (alcance exacto no documentado).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan declarados).

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 8 GB: el archivo AI2.1 ocupa unos 7.506 MiB de VRAM en pico segun el autor, por lo que puede ejecutarse en tarjetas como RTX 3060 Ti, RTX 4060 o RTX 3070 sin necesidad de multi-GPU.
- Asistentes de codigo en local: con contexto de 200K tokens, el modelo puede ingerir repositorios completos o archivos de gran tamano y mantener conversaciones de depuracion prolongadas sin truncar el historial.
- Pipelines RAG sobre documentacion extensa: la ventana de 204.800 tokens permite incluir decenas de documentos en el prompt, reduciendo la dependencia de un recuperador externo y simplificando la arquitectura.
- Agentes autonomos multi-paso: la decodificacion especulativa MTP reduce el coste por token generado, lo que abarata bucles de razonamiento largos en entornos con recursos limitados.
- Prototipado e investigacion sobre cuantizacion extrema: el repositorio incluye metricas de KLD y comparativas con recetas de Unsloth, lo que lo hace util como caso de estudio de compresion a ~2 bits.
- Generacion creativa sin restricciones de contenido: el caracter "uncensored" lo hace adecuado para experimentacion con narrativa o roleplay, siempre que se asuma la responsabilidad legal y etica del contenido generado.
- Evaluacion de decodificacion especulativa: los sidecars `mtp-dm.gguf` y `head-exact-f16.gguf` permiten comparar generacion con borrador frente a rescoring exacto en el mismo hardware.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

| Metrica | ATX AI3 (12 GB) | ATX AI2 (10 GB) | Unsloth UD-Q2_K_XL | Unsloth UD-IQ3_XXS | Referencia |
|---|---:|---:|---:|---:|---|
| Tamano del archivo | 11,24 GB | 9,14 GB | 9,95 GB | 10,93 GB | — |
| KLD (menor es mejor) | 0,0270 | 0,0593 | 0,0591 | 0,0396 | Swift 1.5 BF16 |
| Top-1 agreement | 95,98% | 94,06% | 94,00% | 95,33% | — |
| LiveCodeBench v6 (strict) | 89% | no disponible | 87% | no disponible | Qwen BF16: 90,3% |
| Tokens medianos por respuesta (LCB v6) | 4.608 | no disponible | 8.932 | no disponible | — |

El autor indica que la puntuacion de LiveCodeBench se obtuvo con una sola semilla y la califica de direccional, no estadisticamente significativa. La comparativa de KLD se realizo sobre 16.200 posiciones de codigo, agentes y RAG a ~12K de contexto.

## Requisitos de hardware

- VRAM estimada: 7.506 MiB en pico para el archivo AI2.1 (8 GB) con MTP activado; 11.544 MiB para el AI3 (12 GB) con contexto de 262.144 tokens.
- GPU recomendadas: RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4060 Ti de 8 GB para la variante AI2.1; RTX 4070, RTX 3080 Ti o RTX 4070 Ti de 12 GB para la variante AI3. No se documentan requisitos para A100/H100.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas, siempre que se cumplan los requisitos de runtime.
- Opciones de despliegue: exclusivamente `llama-server` de llamAmpere 0.7 o superior con los presets `8dense` o `12dense`. La model card indica que esta version "coming, not yet released" en el momento de publicacion, por lo que no es ejecutable con llama.cpp estandar ni con Ollama o vLLM sin adaptaciones.
- Latencia y throughput: no disponibles. La unica metrica publicada es el numero de tokens generados por respuesta en LiveCodeBench, que no equivale a throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| ATX AI2.1 (este) | 27B (nominal) | 204.800 | GGUF ~2,1 bpw | Apache 2.0 | Requiere llamAmpere 0.7; sidecars MTP y LSA |
| ATX AI3 | 27B (nominal) | 262.144 | GGUF | Apache 2.0 | 12 GB, KLD 0,0270 |
| Unsloth UD-Q2_K_XL | 27B (nominal) | Limitado por VRAM | GGUF | Apache 2.0 | KLD 0,0591; no cabe con MTP en 12 GB segun el autor |
| Unsloth UD-IQ3_XXS | 27B (nominal) | Limitado por VRAM | GGUF | Apache 2.0 | KLD 0,0396; 10,93 GB |
| Qwen3.8-27B BF16 | 27B (nominal) | No disponible | Safetensors | Apache 2.0 | Referencia de calidad; requiere ~54 GB en BF16 |

La comparativa se limita a variantes de cuantizacion del mismo modelo base, ya que la informacion proporcionada no incluye alternativas de otros fabricantes con caracteristicas equivalentes.

## Limitaciones y advertencias

- Discrepancia critica en el numero de parametros: el campo safetensors del repositorio indica 1.271.398.400 parametros, mientras que el nombre y la model card afirman 27B. Esta inconsistencia no esta explicada y afecta a cualquier estimacion de recursos.
- Dependencia de software no publicado: la ejecucion requiere llamAmpere 0.7, que segun el autor aun no estaba disponible. Sin esa version, los archivos no son utilizables con llama.cpp, Ollama ni vLLM estandar.
- Calidad a 2,1 bpw: aunque el autor reporta un KLD de 0,0593 comparable a UD-Q2_K_XL, la compresion a ~2 bits implica degradacion medible frente a BF16 y mayor riesgo de artefactos en tareas de razonamiento complejo.
- Benchmark no verificado: las cifras de LiveCodeBench (89% frente a 90,3% de BF16) proceden de una sola semilla y el propio autor las califica de no significativas estadisticamente.
- Modelo "uncensored": se han relajado los filtros de seguridad, lo que aumenta el riesgo de generar contenido danino, sesgado o ilegal. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: inherente al modelo base y probablemente agravado por la cuantizacion extrema; no se han publicado evaluaciones de factualidad.
- Idiomas no declarados: no hay informacion sobre el rendimiento multilingue ni sobre el soporte del castellano.
- Trazabilidad limitada: repositorio con 0 descargas y 0 likes, autor individual, sin paper ni documentacion tecnica del proceso de uncensoring o del esquema LSA.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo en su jurisdiccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2.1
- Variante AI2 (10 GB): https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
