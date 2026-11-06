# LiquidAI/LFM2-8B-A1B

## Resumen

LFM2-8B-A1B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI, disenado especificamente para despliegue en el borde (edge AI) y en dispositivos. Cuenta con 8.339.929.856 parametros totales y aproximadamente 1.500 millones de parametros activos por token, lo que lo situa en un punto dulce entre calidad y eficiencia computacional: Liquid AI lo posiciona como comparable en calidad a modelos densos de 3-4B pero con una velocidad superior a Qwen3-1.7B.

El modelo forma parte de la segunda generacion de la familia LFM2 y combina bloques de convolucion corta con doble compuerta (double-gated short-range convolution) y bloques de atencion con grouped query attention (GQA), en una arquitectura hibrida de 24 capas (18 de convolucion y 6 de atencion). Soporta una longitud de contexto de 32.768 tokens y fue entrenado con un presupuesto de 12 billones de tokens en precision mixta BF16/FP8.

Su relevancia actual radica en que demuestra que es posible obtener capacidades de razonamiento, codigo y conocimiento notablemente superiores a LFM2-2.6B manteniendo un perfil de memoria lo bastante contenido como para ejecutarse en telefonos de gama alta, tablets y portatiles tras cuantizacion. Esta disponible en ocho idiomas (ingles, arabe, chino, frances, aleman, japones, coreano y espanol) bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 18 bloques de convolucion corta con doble compuerta + 6 bloques de atencion GQA (MoE) |
| Parametros totales | 8.339.929.856 (8,3B) |
| Parametros activos | 1,5B aproximadamente |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (el autor menciona variantes cuantizadas sin detallar formatos) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano y espanol |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

LFM2-8B-A1B emplea una arquitectura hibrida que alterna 18 bloques de convolucion corta con doble compuerta (double-gated short-range convolution) y 6 bloques de atencion con grouped query attention (GQA). Esta combinacion busca reducir el coste computacional y de memoria asociado a la atencion completa sobre contextos largos, manteniendo la capacidad de modelar dependencias a distancia mediante un numero reducido de capas de atencion. El modelo es un MoE con 8,3B de parametros totales y aproximadamente 1,5B activos por token, con un vocabulario de 65.536 tokens.

El entrenamiento se realizo con un presupuesto de 12 billones de tokens en precision mixta BF16/FP8. La model card menciona una mezcla de preentrenamiento (pre-training mixture) aunque el detalle de su composicion no esta disponible en la informacion proporcionada. Tampoco se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO. La plantilla de chat es de estilo ChatML y el modelo incorpora tokens especiales dedicados a la definicion y ejecucion de herramientas (`<|tool_list_start|>`, `<|tool_call_start|>`, `<|tool_response_start|>`, entre otros).

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Razonamiento y conocimiento general, con mejoras significativas frente a LFM2-2.6B en codigo y conocimiento.
- Soporte nativo de tool calling / function calling mediante un protocolo de cuatro pasos con tokens especiales (definicion de funciones en JSON, llamada en estilo Python, ejecucion y respuesta final).
- Capacidad para tareas agenticas y razonamiento multi-paso.
- Soporte multilingue en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Extraccion de datos estructurados y generacion aumentada por recuperacion (RAG).
- Escritura creativa.
- No se menciona soporte de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 32.768 tokens de ventana, manteniendo el hilo de la conversacion y consultando sistemas internos mediante tool calling para resolver incidencias en tiempo real.
- Extraccion de datos estructurados: Liquid AI lo recomienda explicitamente para data extraction; se puede usar para convertir documentos no estructurados en JSON validado, con la ventaja de que su tamano permite ejecutarlo en local sin enviar datos sensibles a la nube.
- RAG en dispositivos: su contexto de 32K y su perfil de memoria contenido permiten montar pipelines de recuperacion aumentada en portatiles o tablets, indexando documentacion local y generando respuestas con citas.
- Agentes autonomos ligeros: el soporte nativo de function calling con tokens dedicados facilita la construccion de agentes que encadenan llamadas a APIs (consultas de estado, reservas, busquedas) sin necesidad de un modelo mayor.
- Asistentes integrados en aplicaciones moviles: tras cuantizacion, las variantes caben en telefonos de gama alta y tablets, lo que permite asistentes offline con baja latencia y sin coste por token.
- Escritura creativa y generacion de contenido: adecuado para borradores, resumenes y reescritura en los ocho idiomas soportados, con parametros de generacion recomendados (temperature=0.3, min_p=0.15, repetition_penalty=1.05).
- Fine-tuning para nichos concretos: Liquid AI recomienda ajustar el modelo en casos de uso estrechos para maximizar el rendimiento, dado su tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma de forma cualitativa que la calidad es comparable a modelos densos de 3-4B y que la velocidad supera a Qwen3-1.7B, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 8,3B parametros totales, en BF16 serian necesarios aproximadamente 16,7 GB solo para pesos, mientras que una cuantizacion a 4 bits reduciria el requisito a unos 4-5 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria en GPUs de consumo como RTX 4090 (24 GB) en BF16 y en GPUs profesionales A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 y en tarjetas con 8-16 GB tras cuantizacion; el autor indica que las variantes cuantizadas caben en telefonos de gama alta, tablets y portatiles.
- Opciones de despliegue: transformers (libreria nativa), endpoints compatibles y despliegue en Azure segun los tags del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; el autor solo afirma que es mas rapido que Qwen3-1.7B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-8B-A1B | 8,3B | 1,5B | 32.768 | LFM Open License v1.0 | MoE hibrido para edge |
| LFM2-24B-A2B | 24B | 2,3B | 32.768 | LFM Open License v1.0 | Version mayor de la misma familia |
| LFM2-2.6B | 2,6B (denso) | No aplica | No disponible | LFM Open License v1.0 | Generacion anterior, menor calidad en codigo y conocimiento |
| Qwen3-1.7B | 1,7B (denso) | No aplica | No disponible | No disponible | Referencia de velocidad segun Liquid AI |

## Limitaciones y advertencias

- Liquid AI advierte explicitamente de que no se recomienda su uso para tareas intensivas en conocimiento ni para tareas que requieran habilidades de programacion avanzadas.
- Al ser un modelo pequeno, el riesgo de alucinacion es relevante en dominios especializados; se recomienda fine-tuning en casos de uso estrechos.
- El contexto esta limitado a 32.768 tokens; no se soportan ventanas mayores sin tecnicas externas.
- Solo se soportan ocho idiomas; el rendimiento en idiomas no listados no esta garantizado.
- La licencia LFM Open License v1.0 es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- Existe una version posterior (LFM2.5-8B-A1B) indicada en la model card, por lo que conviene evaluar la migracion.
- No se detallan sesgos conocidos en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Blog de Liquid AI sobre LFM2-8B-A1B: https://www.liquid.ai/blog/lfm2-8b-a1b-an-efficient-on-device-mixture-of-experts
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper (arXiv): arxiv:2511.23404
- Version posterior: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
