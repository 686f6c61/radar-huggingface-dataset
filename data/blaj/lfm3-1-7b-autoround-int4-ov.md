# blaj/LFM3-1.7B-AutoRound-int4-ov

## Resumen

LFM3-1.7B-AutoRound-int4-ov es una distribucion cuantizada del modelo LiquidAI/LFM3-1.7B, publicada por el usuario blaj. Se trata de una conversion a formato OpenVINO IR en la que los pesos int4 obtenidos con AutoRound (group size 128, simetrico, RTN) se escriben directamente en el grafo oficial fp16 de OpenVINO, empaquetados como constantes u4 con escalas por grupo. No se produce una segunda cuantizacion sobre los pesos, lo que preserva la calidad del proceso AutoRound original.

El modelo base, LFM3-1.7B, pertenece a la familia LFM3 de LiquidAI y cuenta con aproximadamente 1.700 millones de parametros. Esta version esta pensada para despliegue en CPU y aceleradores Intel mediante el runtime de OpenVINO, reduciendo el peso del repositorio a unos 1,3 GB frente a los aproximadamente 3,4 GB que ocuparia el modelo en fp16.

La relevancia de esta ficha radica en que demuestra el flujo de trabajo para llevar un modelo de la familia LFM3 a produccion sobre hardware Intel con cuantizacion de 4 bits, si bien la informacion publicada sobre el modelo es muy limitada: no se detallan licencia, idiomas ni resultados de evaluacion en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B; detalles no disponibles) |
| Parametros totales | aproximadamente 1.700 millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (AutoRound, group size 128, simetrico, RTN) sobre grafo OpenVINO IR |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | OpenVINO IR con constantes u4 empaquetadas y escalas por grupo |
| Tamano del repositorio | 1,3 GB |
| Libreria | openvino |
| Version de auto-round | 0.17.0 |
| Grafo fp16 de origen | OpenVINO/LFM3-1.7B-fp16-ov |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo LiquidAI/LFM3-1.7B, del que esta distribucion hereda la topologia completa. La model card no especifica si se trata de un transformer denso convencional, de una arquitectura hibrida con capas de estado o de una variante MoE; ese dato no esta disponible en la informacion proporcionada. Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO.

La innovacion tecnica de esta distribucion es el proceso de cuantizacion: AutoRound 0.17.0 calcula pesos int4 con granularidad de grupo de 128 y simetria, y esos pesos se insertan directamente como constantes u4 empaquetadas en el grafo OpenVINO IR procedente de la version fp16 oficial. Al no re-cuantizar, se evita la degradacion adicional que introduciria un segundo paso de cuantizacion sobre pesos ya reducidos. El resultado es un grafo listo para inferencia en OpenVINO con soporte nativo de operaciones de 4 bits.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base LFM3-1.7B.
- Razonamiento y respuesta a instrucciones: capacidad no verificada en esta distribucion concreta; depende del modelo base.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia optimizada para CPU y aceleradores Intel mediante OpenVINO.

## Casos de uso

- Despliegue en CPU Intel para asistentes de texto locales: el modelo en int4 ocupa aproximadamente 1,3 GB, lo que permite ejecutarlo en equipos sin GPU dedicada usando el runtime de OpenVINO, con un consumo de memoria muy inferior al de la version fp16.
- Prototipado rapido en portatiles: al caber holgadamente en la memoria RAM de un portatil convencional, sirve para validar flujos de generacion de texto antes de escalar a un modelo mayor.
- Integracion en aplicaciones de escritorio con OpenVINO: el formato IR permite cargar el modelo directamente desde el runtime de OpenVINO en aplicaciones nativas para Windows y Linux con hardware Intel.
- Servicio de inferencia de bajo coste en edge: para tareas de clasificacion, resumen o generacion breve donde el throughput importa mas que la calidad maxima, la cuantizacion int4 reduce el coste por token en CPU.
- Evaluacion comparativa de cuantizacion: util como referencia para medir la perdida de calidad de AutoRound int4 frente al modelo fp16 en tareas concretas del dominio propio.
- Base para experimentos de ajuste fino o destilacion: al ser un modelo pequeno y ligero, sirve como punto de partida para experimentos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,3 GB para los pesos int4, mas el overhead del runtime de OpenVINO y de las activaciones (no cuantificado en la informacion disponible).
- GPU recomendadas: no se especifican; el formato OpenVINO esta orientado a CPU Intel, iGPU Intel y aceleradores Intel (NPU, GPU Arc).
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2-3 GB de memoria, aunque el objetivo principal del formato es la ejecucion en CPU.
- Opciones de despliegue: runtime de OpenVINO (Python, C++), OpenVINO GenAI; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blaj/LFM3-1.7B-AutoRound-int4-ov | aproximadamente 1,7 B | no disponible | OpenVINO IR int4 | no disponible | Hugging Face |
| LiquidAI/LFM3-1.7B | aproximadamente 1,7 B | no disponible | safetensors (fp16/BF16) | no disponible | Hugging Face |
| OpenVINO/LFM3-1.7B-fp16-ov | aproximadamente 1,7 B | no disponible | OpenVINO IR fp16 | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La model card no declara licencia; antes de cualquier uso comercial debe verificarse la licencia del modelo base LiquidAI/LFM3-1.7B en su repositorio de origen.
- No se han publicado datos de evaluacion que cuantifiquen la perdida de calidad introducida por la cuantizacion int4 respecto al modelo fp16.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su funcionamiento.
- La cuantizacion a 4 bits puede degradar tareas sensibles a la precision numerica, como calculo matematico o generacion de codigo complejo; no hay datos que lo confirmen ni lo descarten.
- El formato OpenVINO IR limita el despliegue a entornos con runtime de OpenVINO; no es directamente compatible con vLLM, llama.cpp ni Ollama.
- No se especifican los idiomas soportados ni el comportamiento multilingue.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no cuantificado para esta distribucion.
- No se dispone de informacion sobre sesgos conocidos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/LFM3-1.7B-AutoRound-int4-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Grafo fp16 de origen: https://huggingface.co/OpenVINO/LFM3-1.7B-fp16-ov
