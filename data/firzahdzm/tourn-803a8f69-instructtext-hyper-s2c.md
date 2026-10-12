# firzahdzm/tourn-803a8f69-instructtext-hyper-s2c

## Resumen

El modelo `firzahdzm/tourn-803a8f69-instructtext-hyper-s2c` es un modelo de lenguaje de 1.170.340.608 parametros (aproximadamente 1,17 mil millones) publicado en HuggingFace por el usuario firzahdzm. La etiqueta de arquitectura declarada es `lfm2`, lo que lo vincula a la familia LFM2 (Liquid Foundation Model 2) de Liquid AI, aunque no se aporta documentacion que confirme la configuracion exacta. El repositorio ocupa 2,3 GB y los pesos estan en formato safetensors.

El nombre del modelo sigue un patron sistematico (`tourn-<hash>-instructtext-<variante>`) que se repite en otros repositorios del mismo autor, como `tourn-803a8f69-instructtext-hyper-r9a` (1B, lfm2) o `tourn-803a8f69-instructtext-hyper-g2gc` (3B, granite). Esto sugiere una cadena de entrenamiento o evaluacion automatizada, probablemente orientada a la generacion de texto con instrucciones. No existe model card, no se declaran idiomas, licencia ni pipeline, y el modelo acumula 11 descargas y 0 likes en el momento de redactar esta ficha.

Su relevancia actual es limitada como modelo de produccion: se trata de un artefacto sin documentacion publica, sin evaluaciones reportadas y sin licencia especificada, lo que impide su uso comercial sin aclaraciones previas del autor. Resulta util, sin embargo, como caso de estudio de modelos pequenos de ~1B parametros derivados de la familia LFM2, un rango de tamano que interesa para despliegue en dispositivo y en entornos con VRAM reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (segun etiqueta del repositorio; detalles de configuracion no disponibles) |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; el tamano de 2,3 GB es coherente con BF16, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es la etiqueta `lfm2` del repositorio. LFM2 hace referencia a la familia Liquid Foundation Model 2 de Liquid AI, que combina bloques convolucionales de corto alcance con bloques de atencion con grouped query attention, un diseno hibrido orientado a eficiencia en inferencia. No obstante, no se aporta configuracion, ficha tecnica ni codigo que permita confirmar que este checkpoint reproduce dicha arquitectura, ni sus dimensiones concretas (capas, cabezas, dimension oculta o ventana de contexto).

Tampoco hay informacion sobre el entrenamiento: no se declara el numero de tokens, la composicion del dataset, la existencia de fases de ajuste por instrucciones (SFT), optimizacion por preferencias (RLHF/DPO) ni ninguna innovacion tecnica adicional. El sufijo `instructtext` del nombre sugiere un ajuste orientado a seguir instrucciones en tareas de texto, pero es una inferencia a partir de la nomenclatura y no un dato verificado.

## Capacidades

- Generacion de texto: el nombre y el sufijo `instructtext` apuntan a un modelo ajustado para seguir instrucciones escritas, aunque no se documentan capacidades concretas.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistentes de texto en dispositivo: con ~1,17B parametros, el modelo es candidato a ejecutarse en portatiles y equipos de borde con cuantizacion de 4 bits, siempre que se validen primero sus capacidades reales mediante evaluacion propia.
- Prototipado rapido de pipelines de generacion: util como sustituto ligero en fases tempranas de desarrollo, antes de escalar a modelos mayores, dado su bajo coste de inferencia.
- Resumen de documentos cortos: escenarios de resumir parrafos o correos en los que la ventana de contexto (no documentada) sea suficiente; requiere verificacion previa.
- Clasificacion y etiquetado de texto: tareas de categorizacion de tickets, comentarios o correos mediante prompts de instrucciones, con validacion manual del resultado por la ausencia de benchmarks.
- Generacion de respuestas en FAQ: integracion en bots de preguntas frecuentes con contexto acotado y supervision humana, dado el riesgo de alucinacion no medido.
- Investigacion sobre modelos LFM2 pequenos: analisis comparativo de checkpoints derivados de la familia LFM2 para estudiar efectos de ajuste fino en el rango de 1B parametros.
- Experimentacion academica y docencia: ejemplo de repositorio sin model card que ilustra problemas de trazabilidad y reproducibilidad en la publicacion de modelos.

En todos los casos, la ausencia de licencia y de evaluaciones obliga a realizar una validacion propia antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor):
  - BF16/FP16: aproximadamente 2,4 GB solo para pesos, mas memoria para activaciones y cache KV.
  - INT8: aproximadamente 1,2-1,5 GB.
  - INT4: aproximadamente 0,7-1,0 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090, A10, L4 o A100 para FP16/BF16 con margen de contexto.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo modernas con cuantizacion de 4 u 8 bits; en FP16 requiere al menos 6-8 GB de VRAM libres.
- Opciones de despliegue: llama.cpp y Ollama para cuantizacion local en GGUF; vLLM o TGI para servir via API si el checkpoint es compatible con dichos motores; transformers para inferencia directa desde safetensors. La compatibilidad real con cada motor no esta confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura declarada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tourn-803a8f69-instructtext-hyper-s2c | 1,17B | lfm2 | no disponible | no disponible | Safetensors, sin model card |
| tourn-803a8f69-instructtext-hyper-r9a | 1B | lfm2 | no disponible | no disponible | Safetensors, BF16, sin model card |
| tourn-803a8f69-instructtext-hyper-g2gc | 3B | granite | no disponible | no disponible | Safetensors, BF16, sin model card |
| tourn-87c51c39-instructtext-super-s2kpre | 494M | no disponible | no disponible | no disponible | Safetensors, sin model card |

Los cuatro modelos proceden del mismo autor y comparten la ausencia de documentacion, evaluaciones y licencia, por lo que la comparativa se limita a tamano y etiqueta de arquitectura. No se dispone de datos de rendimiento que permitan comparaciones cuantitativas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, idiomas, sesgos ni limitaciones declaradas por el autor.
- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue.
- Riesgo de alucinacion: no medido; sin benchmarks ni evaluaciones, la fiabilidad factual es desconocida.
- Contexto e idiomas desconocidos: se desconoce la ventana de contexto y si el modelo maneja castellano con calidad suficiente.
- Trazabilidad dudosa: el patron de nombres con hash y la existencia de multiples repositorios del mismo autor sugieren un proceso automatizado sin garantias de calidad.
- Adopcion casi nula: 11 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.
- Metadatos incompletos: se desconoce el pipeline, la configuracion de cuantizacion y la compatibilidad con motores de inferencia habituales.
- Fecha de publicacion en el repositorio (2026-10-12) no verificable de forma independiente a partir de la informacion suministrada.

## Enlaces

- HuggingFace: https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-hyper-s2c
- Modelo hermano (lfm2, 1B): https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-hyper-r9a
- Modelo hermano (granite, 3B): https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-hyper-g2gc
- Ficha en FriendliAI de un modelo relacionado: https://friendli.ai/models/firzahdzm/tourn-803a8f69-instructtext-super-p1v
- Repositorio GitHub del autor: https://github.com/firzahdzm/gradient-image-tourn
- Ficha en savrn.com de un modelo relacionado: https://savrn.com/models/tourn-87c51c39-instructtext-super-s2kpre
