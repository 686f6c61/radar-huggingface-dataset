# jh76rtgh/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.730 millones de parametros (1,73B) desarrollado por Liquid AI, publicado como checkpoint post-entrenado y orientado a texto. Se trata de la variante de 1,7B de la familia LFM3, que emplea una arquitectura "tri-hybrid" propietaria: 24 capas compuestas por 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. El modelo esta disenado explicitamente para su despliegue en el borde (edge): en cuantizacion de 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite ejecutarlo en telefonos moviles y portatiles convencionales.

El modelo se distribuye como un fine-tune del checkpoint base `LiquidAI/LFM3-1.7B-Base` y esta post-entrenado para su uso en entornos agenticos como Hermes Agent, Pi y OpenClaw, con una ventana de contexto de 256K tokens (entrada mas salida). Su vocabulario es de 128.000 tokens y cubre 16 idiomas, entre ellos el castellano. La relevancia actual del modelo radica en su combinacion de contexto muy largo, tamano reducido y entrenamiento orientado a tool calling y salidas estructuradas, lo que lo posiciona como candidato para agentes locales y aplicaciones de dominio especializado con ajuste fino en una sola GPU.

La ficha que sigue se basa en la informacion disponible en HuggingFace y en la model card del autor. No se han publicado resultados de benchmarks detallados en la informacion proporcionada, por lo que las secciones correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (tri-hybrid): 24 capas con 13 convoluciones cortas con compuerta, 5 de atencion de ventana deslizante y 6 de atencion global |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | 4 bits mencionado en la model card (aproximadamente 1 GB de memoria); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco |
| Licencia | LFM Open License v1.0 (licencia "other" en HuggingFace) |
| Formato de pesos | Safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de 24 capas que combina tres tipos de bloques: 13 capas de convolucion corta con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta mezcla busca reducir el coste computacional y de memoria asociado a la atencion completa sobre contextos largos, manteniendo al mismo tiempo capacidad de modelado global. El vocabulario es de 128.000 tokens y la ventana de contexto alcanza los 256K tokens, lo que exige mecanismos de atencion eficientes para ser viable en hardware de borde.

El checkpoint es un fine-tune post-entrenado sobre `LiquidAI/LFM3-1.7B-Base`. La model card indica que el modelo ha sido post-entrenado para entornos agenticos (Hermes Agent, Pi y OpenClaw), lo que sugiere un entrenamiento orientado a tool calling, salidas estructuradas y conversacion multi-turno. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la propia arquitectura hibrida.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, incluido el espanol.
- Tool calling y function calling, con entrenamiento especifico para entornos agenticos.
- Salidas estructuradas (structured outputs), segun la model card.
- Soporte para agentes locales y flujos multi-paso dentro de la ventana de 256K tokens.
- Capacidad de ajuste fino rapido en una sola GPU para especializacion en dominios, formatos y herramientas concretas.
- Despliegue en el borde: aproximadamente 1 GB de memoria en cuantizacion de 4 bits, apto para telefonos y portatiles.
- No incluye vision ni audio: es un modelo exclusivamente de texto (el checkpoint es text-only).

## Casos de uso

- Agentes locales en dispositivos de borde: el modelo puede ejecutarse en un telefono o portatil con aproximadamente 1 GB de memoria en 4 bits, gestionando tareas de asistente personal con tool calling sin depender de la nube.
- Automatizacion de atencion al cliente: con 256K tokens de contexto puede mantener conversaciones multi-turno largas y recuperar informacion de historiales extensos, aunque para conocimiento factual conviene combinarlo con recuperacion (RAG).
- Extraccion de datos estructurados: su entrenamiento en salidas estructuradas lo hace adecuado para convertir texto libre en JSON u otros formatos definidos, integrable en pipelines de procesamiento de documentos.
- Orquestacion de herramientas en entornos como Hermes Agent, Pi u OpenClaw: el post-entrenamiento especifico para estos harness permite usarlo como modelo de decision para invocar APIs y ejecutar pasos de un flujo agentico.
- Especializacion por dominio mediante fine-tuning en una sola GPU: equipos con recursos limitados pueden adaptar el modelo a jerga legal, medica o industrial y a formatos internos de su organizacion.
- Asistente multilingue de bajo coste: al cubrir 16 idiomas, puede desplegarse como chatbot o traductor asistido en entornos con restricciones de hardware, por ejemplo en quioscos o aplicaciones moviles.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite resumir o consultar contratos y manuales extensos sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni otras evaluaciones, y solo indica que el modelo no esta recomendado para codificacion agentica ni razonamiento multi-paso complejo debido a su tamano reducido.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en cuantizacion de 4 bits; en precision completa (fp16/bf16) el checkpoint de 1,73B requiere del orden de 3,5 GB de pesos mas memoria para el contexto.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-8 GB de VRAM para cuantizaciones bajas; para precision completa y contextos largos se recomienda una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100 o H100).
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y en hardware integrado de portatiles y telefonos en cuantizacion de 4 bits.
- Opciones de despliegue: la model card referencia la libreria `transformers` con `custom_code`; la familia LFM3 dispone de variantes de checkpoint para distintos frameworks de inferencia, aunque los detalles concretos no estan disponibles en la informacion proporcionada. No se confirma soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B (este) | 1,73B | 256K | LFM Open License v1.0 | Arquitectura tri-hybrid, orientado a agentes y borde |
| Modelos comparables de ~1-2B | No disponible | No disponible | No disponible | No se dispone de datos de rendimiento comparativo en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no esta recomendado para codificacion agentica ni razonamiento multi-paso complejo debido a su tamano reducido.
- Riesgo de alucinacion: la model card recomienda usar recuperacion o busqueda para tareas con alta carga de conocimiento, lo que implica que el modelo no es fiable como fuente de hechos por si solo.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo entrenado con datos web multilingues, es previsible que herede sesgos de esos datos.
- Limitaciones de contexto e idioma: aunque soporta 256K tokens y 16 idiomas, el rendimiento real puede degradarse en idiomas con menos representacion (por ejemplo, tailandes, vietnamita o hindi) y en contextos muy largos.
- Licencia: LFM Open License v1.0 (categoria "other"); es necesario revisar los terminos del archivo LICENSE antes de un uso comercial, ya que pueden existir restricciones adicionales.
- El repositorio es un fine-tune de un tercero (`jh76rtgh`) sobre el modelo base de Liquid AI; conviene verificar la integridad y procedencia de los pesos antes de usarlo en produccion.
- Requiere `custom_code` en transformers, lo que implica cargar codigo remoto y aumenta la superficie de riesgo de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jh76rtgh/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Coleccion LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3
