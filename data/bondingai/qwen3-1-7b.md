# BondingAI/Qwen3-1.7B

## Resumen

Qwen3-1.7B es la variante densa de menor tamaño de la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. Este repositorio concreto (`BondingAI/Qwen3-1.7B`) es una publicacion derivada del modelo base `Qwen/Qwen3-1.7B-Base`, distribuida bajo licencia Apache 2.0 y empaquetada en formato `safetensors` para su uso con `transformers`. El modelo resuelve el problema de disponer de razonamiento y dialogo general en un unico modelo compacto que cabe en hardware de consumo.

La arquitectura es un transformer causal denso con 28 capas, 16 cabezas de atencion para Q y 8 para KV (GQA), 1.700 millones de parametros nominales (2.031.739.904 reales contando embeddings, 1.400 millones sin embeddings) y una ventana de contexto de 32.768 tokens. Su rasgo diferencial es la capacidad de alternar entre modo "thinking" (razonamiento explicito para matematicas, logica y codigo) y modo "non-thinking" (dialogo eficiente) dentro del mismo modelo, controlado mediante el parametro `enable_thinking`.

Es relevante ahora porque ofrece capacidades de agente, tool calling y multilingue (mas de 100 idiomas segun la model card) en un tamano que se puede ejecutar en una GPU consumer, lo que lo convierte en una opcion practica para prototipado, despliegue en el borde y pipelines con requisitos de coste ajustados. El repositorio tiene un volumen de descargas muy bajo (95) y ninguna valoracion, por lo que debe tratarse como una redistribucion secundaria del modelo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 28 capas, GQA (16 cabezas Q / 8 cabezas KV) |
| Parametros totales | 2.031.739.904 (1,7B nominales; 1,4B sin embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible; el ecosistema Qwen3 soporta GGUF, MLX y cuantizaciones de llama.cpp/Ollama |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3: un transformer causal denso con normalizacion RMSNorm, activacion SwiGLU y atencion con Grouped Query Attention (GQA) para reducir el coste de la cache KV. Consta de 28 capas con 16 cabezas de consulta y 8 de clave/valor, y una ventana de contexto nativa de 32.768 tokens. El entrenamiento se realizo en dos fases, preentrenamiento y postentrenamiento, segun indica la model card heredada del modelo original.

La innovacion principal de la familia es el modo dual thinking/non-thinking: el modelo puede generar un bloque `<think>...</think>` con razonamiento intermedio antes de la respuesta final, o responder directamente sin ese bloque. El postentrenamiento incluye alineacion de preferencias humanas y entrenamiento especifico para capacidades de agente y tool calling. No se dispone del numero exacto de tokens de entrenamiento ni de la composicion del dataset en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con alineacion de preferencias orientada a escritura creativa, role-playing e instrucciones.
- Razonamiento explicito en modo thinking para matematicas, logica y generacion de codigo.
- Modo non-thinking para dialogo general con menor coste de tokens.
- Soporte de tool calling / function calling en ambos modos.
- Capacidades de agente y razonamiento multi-paso para tareas con integracion de herramientas externas.
- Multilingue con instrucciones y traduccion en mas de 100 idiomas y dialectos.
- Compatible con endpoints OpenAI (`endpoints_compatible`) y con TGI (`text-generation-inference`).
- No se documentan capacidades de vision ni audio en este modelo.

## Casos de uso

- **Atencion al cliente automatizada**: con 32.768 tokens de contexto puede mantener conversaciones multi-turno largas con historial completo, y el modo non-thinking reduce la latencia en respuestas rutinarias.
- **Asistente de codigo en local**: el modo thinking mejora la resolucion de problemas de programacion complejos, y su tamano permite ejecutarlo en una estacion de trabajo con GPU consumer sin depender de la nube.
- **Pipelines de CI/CD con tool calling**: puede invocarse desde vLLM o SGLang con parser de razonamiento para automatizar revisiones, resumen de cambios o generacion de tests integrados en flujos de integracion continua.
- **Prototipado rapido de agentes**: sirve como modelo de bajo coste para validar arquitecturas de agente multi-paso antes de migrar a variantes mayores de Qwen3 con la misma interfaz de chat.
- **Traduccion y atencion multilingue**: adecuado para aplicaciones de soporte en varios idiomas o traduccion de documentacion tecnica, gracias al soporte declarado de mas de 100 idiomas.
- **Procesamiento de documentos y resumen**: la ventana de 32K tokens permite resumir contratos, informes o articulos largos en una sola pasada en hardware modesto.
- **Despliegue en el borde o entornos con recursos limitados**: cuantizado en 4 bits ocupa del orden de 1 GB de VRAM, lo que habilita inferencia en portatiles y dispositivos con GPU integrada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este repositorio en la informacion disponible. La model card remite al blog y la documentacion oficiales de Qwen3 para las evaluaciones, sin incluir tablas de resultados en el texto proporcionado.

## Requisitos de hardware

- **VRAM en BF16/FP16**: aproximadamente 4 GB para los pesos (2,03B parametros a 2 bytes), mas cache KV; en la practica 6-8 GB para contexto largo.
- **VRAM en cuantizacion 8 bits**: del orden de 2-2,5 GB de pesos.
- **VRAM en cuantizacion 4 bits (GGUF Q4)**: aproximadamente 1-1,5 GB de pesos, ejecutable en GPU consumer de gama baja.
- **GPU recomendadas**: A100, H100 o L40S para despliegue en servidor con vLLM/SGLang; RTX 4090, RTX 3090, RTX 4070 o superiores para inferencia local en FP16; GPUs con 8 GB o menos validas en cuantizacion 4 u 8 bits.
- **Cabe en GPU consumer**: si, en practicamente cualquier GPU dedicada moderna con cuantizacion, y en CPU mediante llama.cpp.
- **Opciones de despliegue**: vLLM (>= 0.8.5), SGLang (>= 0.4.6.post1), TGI, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers, segun la model card.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; al ser un modelo denso de 1,7B, el throughput esperado es alto en GPU modernas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (este repo) | 2,03B totales (1,4B sin embeddings) | 32.768 | Apache 2.0 | Modo thinking/non-thinking, tool calling, mas de 100 idiomas |
| Qwen3-0.6B | 0,6B | 32.768 | Apache 2.0 | Misma familia, menor coste, menor capacidad de razonamiento |
| Qwen3-4B | 4B | 32.768 | Apache 2.0 | Misma familia, mayor calidad a mayor coste de VRAM |
| Llama 3.2 1B | 1,2B | 128.000 | Llama 3.2 Community License | Contexto mayor, licencia con restricciones de uso comercial |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada; la comparativa se limita a especificaciones y licencia.

## Limitaciones y advertencias

- **Repositorio secundario**: se trata de una publicacion de `BondingAI` derivada de `Qwen/Qwen3-1.7B-Base`, con muy pocas descargas y sin validacion de la comunidad; para produccion conviene usar el repositorio oficial de Qwen.
- **Riesgo de repeticiones**: la propia model card advierte de repeticiones sin fin si no se ajustan los parametros de muestreo; recomienda `presence_penalty=1.5` y, en modo thinking, `Temperature=0.6`, `TopP=0.95`, `TopK=20`, `MinP=0`.
- **Alucinacion**: como todo modelo de 1,7B, la tasa de alucinacion es mayor que en variantes de mayor tamano; no debe usarse como fuente de verdad sin verificacion.
- **Sesgos**: no se documentan evaluaciones de sesgo en la informacion disponible; es esperable un comportamiento similar al del modelo base Qwen3, con sesgos derivados de los datos de preentrenamiento.
- **Idiomas**: aunque se declaran mas de 100 idiomas, el rendimiento real varia y no se aporta evaluacion por idioma; el espanol no esta cuantificado.
- **Contexto**: la ventana de 32.768 tokens es menor que la de algunos competidores (Llama 3.2 ofrece 128K), lo que limita casos de uso con documentos muy largos.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar que los pesos redistribuidos coinciden con los del modelo oficial.
- **Dependencia de version**: requiere `transformers >= 4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BondingAI/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo oficial Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat demo: https://chat.qwen.ai/
- Paper (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
