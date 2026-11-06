# ReadyArt/Dark-Craving-31B-v3.0

## Resumen
Dark-Craving-31B-v3.0 es un ajuste fino (fine-tune) del modelo google/gemma-4-31B-it, publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo de generacion de texto orientado a contenido adulto, roleplay (ERP) y conversacion explicita, con la etiqueta "unaligned" que indica que se ha reducido o eliminado el alineamiento de seguridad del modelo base. El repositorio tiene acceso restringido (gated) y esta marcado como no apto para audiencias generales.

El modelo cuenta con 31.273.088.876 parametros (aproximadamente 31,2 mil millones) en formato safetensors, con un tamano de repositorio de 62,6 GB. Esta etiquetado unicamente para el idioma ingles y su licencia declarada es Apache 2.0, aunque hereda las caracteristicas arquitectonicas del modelo base Gemma 4 de Google. No se dispone de informacion publica sobre el proceso de entrenamiento, los datos utilizados ni resultados de evaluacion.

Su relevancia actual radica en el nicho de modelos "unaligned" para roleplay y contenido para adultos, un segmento con demanda creciente entre usuarios que buscan conversaciones sin las restricciones de seguridad de los modelos comerciales. No obstante, la ausencia total de documentacion tecnica y de benchmarks limita seriamente su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-31B-it; detalles especificos no disponibles) |
| Parametros totales | 31.273.088.876 (~31,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF u otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo google/gemma-4-31B-it, un transformer denso de aproximadamente 31,2 mil millones de parametros. No se dispone de informacion publicada sobre la configuracion exacta de capas, dimensiones ocultas, mecanismos de atencion ni la longitud maxima de contexto del modelo base en la informacion proporcionada.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens utilizados en el ajuste fino, la composicion del dataset, ni si se emplearon tecnicas como RLHF, DPO o SFT. Las etiquetas del repositorio sugieren un ajuste orientado a roleplay y contenido explicito, pero no se documenta metodologia alguna. La etiqueta "unaligned" indica que el ajuste fino habria reducido las salvaguardas del modelo base, aunque no se detalla como se logro esto.

## Capacidades
- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno de roleplay.
- Roleplay y ERP (erotic roleplay) con contenido explicito y para adultos.
- Conversacion instructiva (etiqueta "instruct" y "conversational").
- Modo "unaligned": menor adherencia a las restricciones de seguridad del modelo base.
- Capacidades de razonamiento, codigo o matematicas: no documentadas especificamente para este ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Roleplay conversacional para adultos: el modelo esta ajustado especificamente para mantener personajes y narrativas eroticas multi-turno, siendo su proposito principal declarado.
- Simulacion de personajes en ficcion interactiva: adecuado para escritura colaborativa de narrativa adulta donde se requiere coherencia de personaje a lo largo de la conversacion.
- Generacion de ficcion explicita: puede emplearse como asistente de escritura para relatos para adultos, dado su ajuste hacia contenido explicito.
- Chatbot de entretenimiento para plataformas de contenido para adultos: su orientacion a conversacion sin restricciones de alineamiento lo hace candidato para entornos donde el contenido explicito es aceptable y legal.
- Investigacion sobre modelos "unaligned": util como objeto de estudio para analizar como el ajuste fino altera el comportamiento de seguridad de un modelo base alineado.
- Evaluacion comparativa de fine-tunes de Gemma: sirve como referencia en estudios sobre degradacion o preservacion de capacidades tras ajustes finos no alineados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en safetensors ocupan 62,6 GB en el repositorio; en precision completa (probablemente bf16/fp16) se necesitarian aproximadamente 62-63 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV.
- Cuantizado a 8 bits: alrededor de 32-35 GB de VRAM, viable en una GPU de 48 GB (A6000, L40S) o en configuraciones multi-GPU.
- Cuantizado a 4 bits: alrededor de 16-18 GB de VRAM, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090, dependiendo de la longitud de contexto.
- GPU recomendadas: A100 80 GB o H100 para precision completa; A6000/L40S para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: no se documentan en el repositorio; al publicarse solo safetensors, seria necesario generar cuantizaciones GGUF para llama.cpp/Ollama o usar vLLM/TGI con los pesos originales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Enfoque |
|---|---|---|---|---|---|
| Dark-Craving-31B-v3.0 | ~31,2 B | no disponible | apache-2.0 | Restringido (gated) | Roleplay adulto, unaligned |
| google/gemma-4-31B-it (base) | ~31,2 B | no disponible | no disponible en esta ficha | no disponible en esta ficha | Modelo instructivo alineado |
| Otros fine-tunes unaligned de Gemma | no disponible | no disponible | variable | variable | Roleplay / contenido adulto |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Ausencia total de documentacion tecnica: no se especifican datos de entrenamiento, contexto, metodologia ni evaluaciones.
- Modelo "unaligned": las salvaguardas del modelo base han sido reducidas, lo que aumenta el riesgo de generar contenido danino, ilegal o inapropiado sin filtros.
- Contenido explicito y NSFW: no apto para menores ni para entornos profesionales sin moderacion.
- Riesgo de alucinacion: no evaluado; al ser un fine-tune sin benchmarks, se desconoce su fiabilidad factual.
- Solo ingles declarado: no se garantiza soporte para castellano ni otros idiomas.
- Licencia Apache 2.0 declarada, pero al derivar de google/gemma-4-31B-it conviene verificar las condiciones de uso del modelo base de Google antes de un uso comercial.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que limita la distribucion y automatizacion.
- Sin descargas ni validacion comunitaria (0 descargas, 0 likes en el momento del registro): no hay evidencia de uso real ni de calidad contrastada.
- Riesgo legal: el contenido para adultos esta sujeto a regulacion por jurisdiccion; el despliegue exige verificar cumplimiento legal local.

## Enlaces
- HuggingFace: https://huggingface.co/ReadyArt/Dark-Craving-31B-v3.0
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
