# madebywest/HorizonAI-230M-GGUF

## Resumen

HorizonAI-230M es un modelo de lenguaje pequeño (230 millones de parámetros) desarrollado por Dylan Succi para el proyecto HorizonAI / TravelApp, como fine-tune completo de LiquidAI/LFM2.5-230M. Se distribuye en formato GGUF cuantizado Q4_0, optimizado para ejecución en dispositivos edge y entornos con recursos limitados. El modelo está diseñado para seguir instrucciones en seis idiomas europeos (italiano, inglés, francés, alemán, español y portugués) y para integrarse en aplicaciones de viajes y asistencia multilingüe.

La relevancia del modelo reside en su enfoque de cuantización consciente (QAT): los pesos cuantizados se simularon bit a bit durante el entrenamiento, de modo que el comportamiento en inferencia coincide exactamente con lo que el modelo optimizó. Con un tamaño de archivo de 142 MB, es apto para ejecutarse en CPU, Apple Silicon y GPUs consumer, sin necesidad de hardware especializado.

El fine-tune combina instrucciones de dominios variados, incluyendo function calling, matemáticas, reescritura y conversación cotidiana, con un énfasis especial en evitar la deriva lingüística. No se dispone de datos sobre la arquitectura interna del modelo base en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (embeddings Q6_K) |
| Idiomas soportados | italiano, inglés, francés, alemán, español, portugués |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LiquidAI/LFM2.5-230M, por lo que no se puede especificar si se trata de un transformer, una mezcla de expertos o un modelo híbrido. El fine-tune, sin embargo, está bien documentado. Se realizó un ajuste completo de parámetros en dos etapas sobre el modelo base en BF16: primero un entrenamiento supervisado (SFT) y después una segunda etapa de cuantización consciente (QAT) con un 70% de los pesos simulando cuantización falsa activa.

El dataset de entrenamiento contiene aproximadamente 73.000 muestras de instrucciones, incluyendo smol-constraints, Tulu-3 persona-IF, smol-rewrite, smol-magpie-ultra, OpenHermes, APIGen function calling, MetaMathQA y conversaciones cotidianas. Además, se añadieron alrededor de 10.000 muestras en italiano (ita_chat) y datos multilingües balanceados en italiano, español, portugués, francés y alemán para prevenir la deriva de idioma. La pérdida se calculó únicamente sobre los turnos del asistente, con una tokenización alineada con el renderizado usado en inferencia.

La innovación técnica principal es la cuantización QAD-Q4_0: durante el entrenamiento se simuló de forma bit-exacta la cuantización Q4_0 de llama.cpp (bloques de 32, escalado con signed extremum, redondeo half-up y escalas fp16). Los embeddings se cuantizaron a Q6_K, replicando el diseño QAD oficial de LiquidAI, sin usar matrices de importancia ni calibración. El entrenamiento se ejecutó en un Apple M4 con 16 GB de memoria unificada mediante MLX, con una duración aproximada de 5 horas.

## Capacidades

- Generación de texto y seguimiento de instrucciones en seis idiomas: italiano, inglés, francés, alemán, español y portugués.
- Soporte de function calling / tool calling, entrenado con datos de APIGen.
- Capacidades conversacionales para diálogo multi-turno.
- Razonamiento matemático básico, gracias a la inclusión de MetaMathQA en el entrenamiento.
- Reescritura de texto y generación de instrucciones, entrenado con smol-rewrite y smol-magpie-ultra.
- Fidelidad lingüística reforzada: el modelo mantiene el idioma de entrada en respuestas multilingües, logrando 5/5 en las comprobaciones de idioma del benchmark interno.
- Ejecución eficiente en dispositivos edge gracias a la cuantización Q4_0 y al formato GGUF.
- No incluye capacidades de visión ni audio.

## Casos de uso

- Asistente de viajes multilingüe en dispositivos móviles: el modelo puede mantener conversaciones en seis idiomas y responder a preguntas sobre itinerarios, reservas o recomendaciones locales, gracias a su entrenamiento con datos conversacionales y su tamaño reducido para ejecutarse en el dispositivo.
- Atención al cliente en aplicaciones de turismo: permite gestionar consultas en italiano, español, francés, alemán o portugués sin depender de servicios externos, reduciendo latencia y costes de infraestructura.
- Integración de tool calling en pipelines de backend: el soporte de function calling permite conectar el modelo a APIs de reservas, consultas de vuelos o servicios meteorológicos, automatizando acciones dentro de una aplicación de viajes.
- Traducción y reescritura de contenido turístico: puede reescribir descripciones de hoteles, guías o promociones manteniendo el idioma de destino, gracias a los datos de smol-rewrite y al entrenamiento multilingüe balanceado.
- Asistente personal para viajeros en modo offline: al pesar solo 142 MB y ser compatible con llama.cpp y LM Studio, puede ejecutarse en un portátil o smartphone sin conexión, ofreciendo respuestas en el idioma del usuario.
- Generación de datos sintéticos de instrucciones para otros modelos: el entrenamiento con smol-constraints y smol-magpie-ultra le permite producir pares de instrucciones y respuestas, útil para aumentar datasets de fine-tune en proyectos pequeños.
- Resolución de problemas matemáticos sencillos en contextos de planificación de viajes: gracias a MetaMathQA, puede calcular presupuestos, conversiones de moneda o diferencias horarias con razonamiento básico.

## Benchmarks y rendimiento

El autor proporciona resultados medidos con un mismo harness para todos los modelos: 32 prompts de instruction-following verificados por máquina (en inglés e italiano, incluyendo 8 comprobaciones de fidelidad de idioma) a temperatura 0.1, top-k 50 y penalización de repetición 1.05. La perplexidad se midió en wikitext-2 test con llama-perplexity, 200 fragmentos y contexto 2048.

| Modelo | Tamano | IF-score | Idiomas (it/fr/es/pt/de) | PPL |
|---|---|---|---|---|
| HorizonAI-230M-QAD-Q4_0 | 142 MB | 40.6% | 5/5 | 35.6 |
| LFM2.5-230M Q6_K (stock) | 182 MB | 40.6% | 4/5 | 47.9 |
| LFM2.5-230M Q6_K oficial | 182 MB | 37.5% | 4/5 | 47.9 |
| LFM2.5-230M QAD-Q4_0 oficial | 142 MB | 28.1% | 3/5 | 45.0 |

El modelo supera a las variantes oficiales de LFM2.5-230M en fidelidad lingüística y perplexidad, aunque mantiene el mismo IF-score que el stock Q6_K. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 142 MB para los pesos, más overhead del runtime; en la práctica, menos de 1 GB de memoria es suficiente para ejecutar el modelo.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM, incluyendo RTX 3060, RTX 4090, o GPUs integradas en Apple Silicon. El entrenamiento se realizó en un Apple M4 con 16 GB de memoria unificada, pero la inferencia es mucho más ligera.
- Compatibilidad con CPU: el modelo puede ejecutarse directamente en CPU, ya que el formato GGUF está optimizado para ello.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime GGUF con soporte para la arquitectura lfm2. También es compatible con endpoints que usen GGUF, aunque no se especifica soporte para vLLM o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La comparativa se basa en los datos proporcionados por el autor, que miden el modelo frente a las variantes oficiales de su modelo base.

| Modelo | Parametros | Tamano archivo | Contexto | IF-score | PPL | Licencia |
|---|---|---|---|---|---|---|
| HorizonAI-230M-QAD-Q4_0 | 229.693.184 | 142 MB | no disponible | 40.6% | 35.6 | LFM Open License v1.0 |
| LFM2.5-230M Q6_K (stock) | 229.693.184 | 182 MB | no disponible | 40.6% | 47.9 | LFM Open License v1.0 |
| LFM2.5-230M QAD-Q4_0 oficial | 229.693.184 | 142 MB | no disponible | 28.1% | 45.0 | LFM Open License v1.0 |

No se dispone de datos sobre otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento en chino, japonés y coreano se mantiene al nivel del modelo base, sin mejoras por falta de datos de entrenamiento específicos.
- La licencia LFM Open License v1.0 permite el uso comercial solo si los ingresos anuales del usuario son inferiores a 10 millones de dólares. Superar ese umbral requiere negociación con Liquid AI.
- El modelo tiene un tamaño reducido (230M) que limita su capacidad de razonamiento complejo y su rendimiento en tareas que exigen conocimientos profundos o largas cadenas de inferencia.
- La perplexidad en wikitext-2 es de 35.6, un valor relativamente alto comparado con modelos más grandes, lo que indica una mayor dificultad para modelar lenguaje natural complejo.
- El IF-score de 40.6% es moderado; el modelo no alcanza un seguimiento de instrucciones perfecto y puede fallar en prompts ambiguos o con restricciones múltiples.
- No hay validación externa ni métricas de la comunidad: el repositorio no tiene descargas ni likes, por lo que los resultados presentados provienen únicamente de las pruebas del autor.
- El modelo es una obra derivada y requiere mantener las atribuciones y el aviso de licencia (NOTICE) en cualquier redistribución.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad, por lo que se recomienda validar el comportamiento antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/madebywest/HorizonAI-230M-GGUF
- Modelo base LiquidAI/LFM2.5-230M: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
