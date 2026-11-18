# JonusNattapong/Panu-Omni-2B-GGUF

## Resumen

Panu-Omni-2B-GGUF es la suite de cuantizaciones GGUF oficiales del modelo base JonusNattapong/Panu-Omni-2B, un modelo omnimodal de 2B parametros (1.728.801.600 parametros reales) desarrollado por JonusNattapong. La familia se presenta como un modelo "soberano" para tailandes con soporte de dialectos regionales, razonamiento nativo mediante etiquetas `<think>`, vision y audio full-duplex con barge-in (interrupcion del usuario durante la respuesta). Esta variante GGUF ha sido generada con una importance matrix (`imatrix.dat`) calculada sobre 100 turnos conversacionales especificos de dominio que cubren dialectos tailandeses, instrucciones tecnicas y trazas de razonamiento profundo.

El repositorio incluye 28 cuantizaciones estaticas que van desde IQ1_S (1,56 bpw, ~487 MB) hasta Q8_0 (7,96 bpw, ~1,85 GB), lo que permite desplegar el modelo en dispositivos con recursos muy limitados, incluidos moviles y sistemas embebidos. La arquitectura se etiqueta como `liquid`/`lfm3`/`lfm3-omni`, lo que sugiere una base derivada de la familia Liquid Foundation Models (LFM) de Liquid AI, si bien la model card no detalla la arquitectura interna ni el proceso de entrenamiento.

La relevancia actual del modelo radica en su combinacion poco habitual de tamano reducido (2B), capacidades multimodales (audio, vision, speech-to-speech), soporte de dialectos minoritarios del tailandes y modo de razonamiento explicito, todo ello empaquetado en GGUF para inferencia local con llama.cpp. La licencia lfm1.0 y la etiqueta `abliterated`/`uncensored` implican consideraciones importantes para uso comercial y de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como `liquid` / `lfm3` / `lfm3-omni` (transformer multimodal, detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 4096`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | th (tailandes, con dialectos regionales), en, zh, ja, fr, de, es |
| Licencia | lfm1.0 (licencia Liquid AI; `license: other` en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estaticas con imatrix); pesos originales del modelo base en safetensors |
| Tamano del repo | 42,8 GB (incluye todas las cuantizaciones y mmproj) |
| Modalidades | Texto, vision, audio, speech-to-speech |
| Cuantizacion recomendada | Q4_K_M (~1,10 GB) para uso general y movil; Q6_K (~1,43 GB) para produccion y voz local |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo base. Las etiquetas `liquid`, `lfm3` y `lfm3-omni` apuntan a una derivacion de la familia Liquid Foundation Models (LFM) de Liquid AI, que combina capas de atencion con capas convolucionales o de estado (SSM) para eficiencia en inferencia. No obstante, no se confirma en la informacion disponible si se trata de un transformer puro, un hibrido o un modelo basado en SSM. El modelo es omnimodal, con soporte declarado de vision, audio y speech-to-speech full-duplex con barge-in.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar. La model card menciona razonamiento nativo mediante etiquetas `<think>` y capacidad de "full-duplex voice barge-in", lo que implica un diseno orientado a conversacion por voz en tiempo real. Las cuantizaciones GGUF se generaron con una importance matrix calculada sobre 100 turnos que cubren dialectos tailandeses, instrucciones tecnicas y trazas de razonamiento, lo que sugiere que el ajuste fino del modelo base esta orientado a esos dominios. La etiqueta `abliterated` indica que se ha eliminado la capa de rechazo (refusal) del modelo original, lo que afecta directamente a su comportamiento en produccion.

## Capacidades

- Generacion de texto y razonamiento explicito mediante modo `<think>` (cadenas de pensamiento antes de la respuesta final).
- Procesamiento de vision: descripcion e interpretacion de imagenes a traves del proyector multimodal (`mmproj`), con tokens especiales `<|vision_start|>`, `<|image|>`, `<|vision_end|>`.
- Procesamiento de audio y speech-to-speech: soporte declarado de voz full-duplex con barge-in, es decir, el modelo puede ser interrumpido mientras habla.
- Soporte de dialectos tailandeses regionales (no solo tailandes estandar), lo que es poco comun en modelos de este tamano.
- Capacidades multilingues en th, en, zh, ja, fr, de y es.
- Conversacion multi-turno (pipeline `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Modelo "abliterated"/"uncensored": no aplica capas de rechazo, lo que permite generar contenido que otros modelos bloquearian.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; el modo `<think>` sugiere razonamiento multi-paso, pero no se documenta integracion con frameworks de agentes.

## Casos de uso

- **Asistente de voz local en tailandes**: el modelo puede gestionar conversaciones por voz full-duplex con barge-in, adecuado para dispositivos de asistencia domestica o kioscos en Tailandia, donde el soporte de dialectos regionales marca la diferencia frente a modelos genericos.
- **Atencion al cliente en dialectos regionales**: con soporte de dialectos tailandeses y contexto conversacional multi-turno, se puede desplegar en centros de contacto del norte, noreste o sur de Tailandia para atender a usuarios que hablan variantes no estandar.
- **Transcripcion y descripcion de imagenes en movil**: con la cuantizacion Q4_K_M (~1,10 GB) y el proyector `mmproj`, el modelo cabe en telefonos de gama alta y puede describir imagenes o responder preguntas visuales en local sin conexion.
- **Prototipado rapido de aplicaciones multimodales**: al estar en GGUF y ser compatible con llama.cpp y endpoints, permite validar rapidamente pipelines de vision + audio + texto en un portatil con GPU consumer antes de escalar a modelos mayores.
- **Investigacion sobre abliteration y seguridad**: al ser un modelo abliterated, sirve como caso de estudio para analizar el comportamiento de modelos sin capa de rechazo y evaluar riesgos en despliegues reales.
- **Generacion de contenido en tailandes con razonamiento**: el modo `<think>` permite obtener trazas de razonamiento antes de la respuesta, util para tareas de educacion, explicacion tecnica o generacion de material didactico en tailandes.
- **Despliegue en dispositivos embebidos o edge**: con IQ1_S (~487 MB) o IQ2_XXS (~572 MB), el modelo puede ejecutarse en Raspberry Pi, routers o dispositivos IoT con poca RAM, aunque con perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia** (segun cuantizacion, solo pesos):
  - IQ1_S: ~487 MB
  - IQ2_XXS: ~572 MB
  - Q3_K_M: ~915 MB
  - Q4_K_M: ~1,10 GB (recomendado para uso general y movil)
  - Q5_K_M: ~1,26 GB
  - Q6_K: ~1,43 GB (recomendado para produccion y voz local)
  - Q8_0: ~1,85 GB
- **GPU recomendadas**: cualquier GPU consumer con al menos 2-4 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para el modo multimodal (vision + audio) se recomienda sumar la VRAM del proyector `mmproj`, no cuantificada en la informacion disponible.
- **Cabe en consumer GPU**: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa conversion o importacion del GGUF), y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Panu-Omni-2B-GGUF | ~2B | no disponible | Texto, vision, audio, speech-to-speech | th (con dialectos), en, zh, ja, fr, de, es | lfm1.0 | GGUF |
| Qwen2.5-Omni-3B (referencia) | ~3B | no disponible en esta ficha | Texto, vision, audio | multilingue | Apache 2.0 (segun version) | safetensors, GGUF |
| Gemma 3 4B (referencia) | ~4B | 128K (segun version) | Texto, vision | multilingue | Gemma license | safetensors, GGUF |
| SmolVLM-2B (referencia) | ~2B | no disponible en esta ficha | Texto, vision | en principalmente | Apache 2.0 | safetensors |

Nota: los datos de los modelos de referencia provienen de conocimiento general y pueden no coincidir exactamente con las versiones actuales; no se dispone de benchmarks comparativos publicados para Panu-Omni-2B en la informacion proporcionada. La principal diferenciacion de Panu-Omni-2B es el soporte de dialectos tailandeses y el modo speech-to-speech, capacidades poco frecuentes en modelos de 2B.

## Limitaciones y advertencias

- **Modelo abliterated/uncensored**: se ha eliminado la capa de rechazo, por lo que puede generar contenido inapropiado, peligroso o ilegal sin filtros. No recomendado para aplicaciones orientadas al publico sin moderacion adicional.
- **Licencia lfm1.0**: es una licencia de Liquid AI con condiciones especificas (habitualmente con restricciones de uso comercial por encima de ciertos umbrales de ingresos o usuarios). Es imprescindible revisar los terminos completos antes de un despliegue comercial.
- **Riesgo de alucinacion**: como todo modelo de 2B, la tasa de alucinacion es previsiblemente alta, especialmente en tareas de razonamiento complejo, matematicas o conocimiento factual. No se han publicado evaluaciones que lo cuantifiquen.
- **Contexto limitado**: el ejemplo de uso emplea 4096 tokens; no se documenta una ventana de contexto mayor, lo que limita casos de uso con documentos largos.
- **Idiomas**: aunque declara 7 idiomas, el entrenamiento esta claramente sesgado hacia tailandes (con dialectos) e ingles; el rendimiento en zh, ja, fr, de y es no esta documentado y probablemente sea inferior.
- **Cuantizaciones extremas**: IQ1_S e IQ2_XXS degradan notablemente la calidad; solo recomendables para escenarios donde el tamano es el factor critico.
- **Multimodalidad**: la calidad del modo vision y audio no esta evaluada; el proyector `mmproj` anade consumo de memoria no cuantificado en esta ficha.
- **Sesgos**: no se documentan sesgos especificos, pero un modelo entrenado principalmente en tailandes e ingles puede presentar sesgos culturales y linguisticos hacia esos contextos.
- **Produccion**: la ausencia de benchmarks y de documentacion sobre el entrenamiento hace arriesgado su uso en produccion sin una evaluacion propia previa.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/JonusNattapong/Panu-Omni-2B-GGUF
- Modelo base: https://huggingface.co/JonusNattapong/Panu-Omni-2B
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Licencia lfm1.0: referenciada en el repositorio como `LICENSE` (consultar en la pagina del modelo base)
