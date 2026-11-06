# ManasAIDev/lfm3-1.7b-hinglish-GGUF

## Resumen

LFM3 Hinglish es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario ManasAIDev, orientado a conversaciones naturales en hinglish escrito en alfabeto latino (romanizado). El objetivo declarado es mejorar la calidad de las respuestas en situaciones de code-switching hindi-ingles cotidiano, expresiones informales y hindi romanizado. El modelo conserva la licencia Apache 2.0 del modelo base.

El modelo parte de LFM3-1.7B, un transformer de aproximadamente 1.728 millones de parametros (1,7B) desarrollado por Liquid AI. El ajuste se ha realizado mediante LoRA/PEFT, una tecnica de entrenamiento parametro-eficiente que anade adaptadores de bajo rango sobre los pesos originales. El repositorio distribuye los pesos en formato GGUF cuantizado (F16, Q5_K_M, Q6_K, Q8_0) y, segun la model card, puede incluir tambien el adaptador LoRA en el directorio `lora/`.

La relevancia de este modelo radica en su especializacion linguistica: cubre un nicho (hinglish romanizado) poco representado en los modelos genericos, y lo hace con un modelo pequeno (1,7B) que puede ejecutarse en hardware de consumo mediante llama.cpp. No obstante, la informacion publicada sobre datos de entrenamiento, hiperparametros y evaluacion es practicamente inexistente, lo que limita la confianza para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LiquidAI/LFM3-1.7B; ajuste LoRA/PEFT) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en, hi (hinglish romanizado como objetivo principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-1.7B, un transformer de 1,7B parametros. Sobre el se aplico un ajuste fino con LoRA (Low-Rank Adaptation) mediante la libreria PEFT de Hugging Face. La model card no detalla la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas) ni las innovaciones tecnicas de Liquid AI, por lo que esos datos se consideran no disponibles en la informacion proporcionada.

Respecto a los datos de entrenamiento, la model card indica explicitamente que la composicion del dataset, los hiperparametros, los resultados de evaluacion y las puntuaciones de benchmarks "deberian anadirse cuando se verifiquen". No se especifica el numero de tokens de entrenamiento, la procedencia de los datos de hinglish, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta el rango del adaptador LoRA ni el numero de pasos de entrenamiento.

## Capacidades

- Generacion de texto conversacional en hinglish romanizado (mezcla hindi-ingles en alfabeto latino).
- Conversacion multi-turno orientada a asistentes informales.
- Comprension y generacion en ingles y hindi (idiomas declarados en la model card).
- Soporte de inferencia local mediante llama.cpp en formato GGUF.
- Compatibilidad con el ecosistema transformers y PEFT para cargar el adaptador LoRA.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes conversacionales en hinglish: el modelo esta ajustado especificamente para responder en romanizado con code-switching natural, adecuado para chatbots dirigidos a usuarios indios que escriben hindi con caracteres latinos.
- Aplicaciones de chat en hindi romanizado: util para interfaces donde el usuario no dispone de teclado devanagari y espera respuestas en el mismo registro informal.
- Experimentacion en IA conversacional local: al ser un modelo de 1,7B en GGUF, permite prototipar rapidamente en portatiles o equipos sin GPU dedicada mediante llama.cpp.
- Educacion y practica de idiomas: puede emplearse como interlocutor de practica de hinglish cotidiano, con la advertencia de que sus respuestas pueden contener errores gramaticales.
- Investigacion sobre code-switching: sirve como punto de partida para estudiar el comportamiento de modelos pequenos en mezcla de idiomas y para comparar con ajustes similares.
- Desarrollo de chatbots de bajo coste: su tamano reducido permite desplegar multiples instancias en un solo servidor con CPU o GPU modesta, siempre que la calidad requerida no sea alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluacion y las puntuaciones de benchmarks deben anadirse cuando se verifiquen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (1,7B parametros), las cuantizaciones GGUF de 8 bits rondarian los 2 GB y las de 5-6 bits entre 1,3 y 1,6 GB, aunque el repositorio ocupa 15,1 GB en total por incluir multiples variantes.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM usando cuantizaciones Q5_K_M o Q6_K.
- Opciones de despliegue: llama.cpp (documentado en la model card con `llama-cli`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio. El adaptador LoRA requiere transformers y PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ManasAIDev/lfm3-1.7b-hinglish-GGUF | 1,7B | no disponible | en, hi (hinglish) | Apache 2.0 | GGUF, safetensors, LoRA |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | no disponible | no disponible | safetensors, GGUF |
| LiquidAI/LFM3-1.7B-GGUF | ~2B (segun la busqueda) | no disponible | no disponible | no disponible | GGUF |

El modelo se diferencia de su base unicamente por el ajuste LoRA orientado a hinglish; no se dispone de datos de rendimiento comparativo entre ambos ni con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La model card advierte que las respuestas pueden contener errores gramaticales o un hinglish inconsistente.
- La calidad de la mezcla hindi-ingles depende en gran medida de la entrada del usuario.
- El modelo puede generar informacion inexacta o enganosa (riesgo de alucinacion no cuantificado).
- No esta destinado a decisiones de alto riesgo en ambitos medico, legal o financiero.
- El rendimiento puede variar segun el motor de inferencia y el formato de cuantizacion empleado.
- No se documentan sesgos conocidos, pero al ser un ajuste sobre datos de hinglish informal, es probable que reproduzca sesgos presentes en esos datos.
- La licencia Apache 2.0 se hereda del modelo base, pero la model card recomienda consultar la licencia original de LiquidAI/LFM3-1.7B antes de redistribuir.
- Ausencia total de datos de entrenamiento y evaluacion: no es posible verificar la calidad del ajuste ni su comportamiento en dominios especificos.
- El repositorio tiene 358 descargas y 0 likes, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- [ManasAIDev/lfm3-1.7b-hinglish-GGUF en Hugging Face](https://huggingface.co/ManasAIDev/lfm3-1.7b-hinglish-GGUF)
- [LiquidAI/LFM3-1.7B (modelo base)](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [LiquidAI/LFM3-1.7B-GGUF](https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF)
- [Liquid AI en Hugging Face](https://huggingface.co/LiquidAI)
- [llama.cpp (repositorio)](https://github.com/ggml-org/llama.cpp)
- [PEFT (repositorio)](https://github.com/huggingface/peft)
