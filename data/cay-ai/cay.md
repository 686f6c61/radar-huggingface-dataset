# cay-ai/cay

## Resumen

Cay es un conjunto de artefactos de inferencia publicado por cay-ai para alimentar un agente personal local que se ejecuta en un portátil. El repositorio no contiene un modelo fundacional propio, sino dos routers derivados de la familia Qwen3 (1.700 millones y 600 millones de parámetros) con un fine-tune específico fusionado, más una exportación a ONNX en int8 de IndicXlit, un modelo de transliteración latina para hindi. El peso principal, en formato safetensors, suma 596.049.920 parámetros y el repositorio ocupa 1,5 GB.

El problema que aborda es la selección de herramientas y la normalización de comandos en un agente de escritorio: los routers deciden a qué herramienta o flujo derivar una instrucción del usuario, mientras que IndicXlit romaniza palabras en hindi para que el pipeline pueda procesarlas. La relevancia es acotada pero concreta: ofrece un componente de enrutamiento pequeño, cuantizado en Q4_K_M y con licencia Apache-2.0, pensado para ejecutarse sin GPU dedicada en el mismo equipo donde corre el agente.

La información pública es escasa. No se detallan volúmenes de entrenamiento, composición del dataset sintético ni resultados de evaluación, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha. Los idiomas declarados son inglés e hindi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3, según la model card) |
| Parámetros totales | 596.049.920 (pesos safetensors del repo); los GGUF publicados corresponden a variantes de 1,7B y 0,6B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); int8 (ONNX para IndicXlit) |
| Idiomas soportados | en, hi |
| Licencia | Apache-2.0 (IndicXlit bajo MIT) |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

Los routers son fine-tunes de Qwen3-1.7B y Qwen3-0.6B con los pesos del ajuste fusionados en el modelo base, por lo que heredan la arquitectura transformer decoder-only de Qwen3. El fine-tune se entrenó exclusivamente con comandos sintéticos, según declara el autor, lo que acota la distribución de entrada a instrucciones generadas artificialmente y no a tráfico real de usuarios. No se especifica el número de tokens de entrenamiento, la mezcla del dataset, ni si hubo etapas de RLHF o DPO.

El tercer componente, IndicXlit, es un modelo de transliteración de AI4Bharat exportado a ONNX en int8 para romanizar palabras en hindi dentro del pipeline del agente. La model card no documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ni detalla la estrategia de fusión de los adaptadores más allá de indicar que el fine-tune está "merged in".

## Capacidades

- Enrutamiento de comandos: los routers clasifican o derivan instrucciones del usuario hacia herramientas o flujos del agente local.
- Conversación: la etiqueta `conversational` del repositorio sugiere uso en diálogo multi-turno, aunque no se detalla el formato de prompt.
- Transliteración hindi-latín: IndicXlit romaniza palabras en hindi para su procesamiento en el pipeline.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que los artefactos pueden servirse mediante la infraestructura de inferencia de Hugging Face.
- Soporte multilingüe limitado a inglés e hindi.
- No se documenta soporte de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito más allá del enrutamiento para el que fueron entrenados.

## Casos de uso

- Agente personal de escritorio: los routers de 0,6B y 1,7B en Q4_K_M permiten decidir qué herramienta invocar en un portátil sin GPU dedicada, manteniendo el consumo de memoria bajo.
- Asistentes en hindi romanizado: IndicXlit convierte entrada en devanagari a latín para que el resto del pipeline, entrenado en inglés, pueda procesar nombres y términos en hindi.
- Enrutamiento en aplicaciones de productividad local: clasificar comandos de usuario hacia acciones como abrir archivos, buscar o lanzar scripts dentro de una app de escritorio.
- Prototipado de pipelines de agentes: el par de routers de distinto tamaño permite comparar latencia y precisión de enrutamiento antes de fijar un modelo en producción.
- Despliegue en entornos sin conectividad: al distribuirse como GGUF y descargarse en la primera ejecución, el conjunto funciona sin llamadas a APIs externas.
- Filtrado previo de intenciones: usar el router de 0,6B como primera etapa barata que descarta comandos irrelevantes antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el router de 0,6B en Q4_K_M requiere aproximadamente 0,5 GB; el de 1,7B en Q4_K_M, en torno a 1,2-1,5 GB incluyendo overhead de contexto. Son estimaciones por tamaño de pesos, no cifras publicadas.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer con 4 GB o más puede alojar el router de 1,7B, y el de 0,6B cabe en equipos integrados.
- CPU: ambos routers están pensados para ejecución local en portátil, presumiblemente en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; ONNX Runtime para IndicXlit; el repo es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Cay (router 1.7B / 0.6B) | 1,7B / 0,6B | no disponible | Apache-2.0 | Enrutamiento de agente, fine-tune sintético |
| Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | Apache-2.0 | Modelo generalista |
| Qwen3-0.6B (base) | 0,6B | no disponible en esta ficha | Apache-2.0 | Modelo generalista |

La comparación con alternativas de enrutamiento especializado no está disponible en la información proporcionada. Frente a sus bases Qwen3, la diferencia es el fine-tune para enrutamiento y la distribución en GGUF Q4_K_M lista para el agente Cay.

## Limitaciones y advertencias

- Entrenamiento solo con comandos sintéticos: el rendimiento puede degradarse ante formulaciones reales, ambiguas o fuera de distribución.
- Sin datos de evaluación publicados: no hay métricas de precisión de enrutamiento ni de tasa de error.
- Idiomas limitados a inglés e hindi; el resto de idiomas no están cubiertos.
- Contexto no documentado: no se puede planificar el uso con conversaciones largas sin verificar el límite real.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de evaluación.
- Licencia Apache-2.0 permite uso comercial, pero IndicXlit se distribuye bajo MIT y conviene verificar la atribución de AI4Bharat y del equipo de Qwen.
- Repositorio sin descargas ni validación comunitaria: la fiabilidad en producción no está contrastada.
- La fecha de creación del repositorio (2026-11-02) y la ausencia de pipeline declarado obligan a validar manualmente los artefactos antes de integrarlos.

## Enlaces

- Hugging Face: https://huggingface.co/cay-ai/cay
- Repositorio del agente Cay: https://github.com/CoPrime69/cay
