# anonym5035/neurips_trail_1_8experts

## Resumen

XpertGPT es una arquitectura de Mezcla de Expertos (MoE) diseñada para escalado eficiente, con una configuración específica de 8 expertos entrenada sobre el corpus Wikitext-103-v1. El modelo, publicado por el usuario anonym5035 en el contexto de los experimentos de NeurIPS 2026, explora una variante innovadora que sustituye los bloques Transformer estándar por bloques MoEP-MSIT (Mixture-of-Experts with Parallel Sliding-window Transformers). Cada bloque combina una rama global de atención con ventana deslizante y un router de elección de expertos que asigna tokens a 8 sub-modelos especializados, cada uno operando con un tamaño de ventana de atención distinto.

El modelo es relevante porque aborda dos problemas clave en MoE: el desequilibrio de carga entre expertos y la preservación del orden secuencial de los tokens. Utiliza Expert Choice Routing, que selecciona los tokens más relevantes para cada experto en lugar de asignar expertos a tokens, y proyecta las representaciones a un espacio reducido (d_thin) para ahorrar cómputo. Con un contexto de 4096 tokens y solo 6 capas, es un experimento de investigación más que un modelo de producción, orientado a validar la arquitectura MoEP-MSIT en tareas de modelado de lenguaje a pequeña escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bloques MoEP-MSIT (global attention + 8 expertos con sliding window) |
| Parametros totales | No disponible (configuración: d_model 256, d_thin 384, 6 capas, 8 expertos) |
| Parametros activos | No disponible |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, por el corpus Wikitext) |
| Licencia | No disponible |
| Formato de pesos | No disponible (probablemente safetensors o binarios, no especificado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con bloques **MoEP-MSIT** (Mixture-of-Expert with Parallel and Sliding-window Transformers). Cada bloque consta de:

1. **Global Block**: una rama de atención completa con ventana deslizante sobre la dimensión completa (d_model).
2. **Expert Choice Router**: calcula afinidades entre todos los tokens y los 8 expertos, seleccionando los top-k tokens por experto según `k = capacity_factor * (B*T)/E`. Los tokens seleccionados se reordenan en su secuencia original para preservar coherencia posicional.
3. **Shrink Projection**: proyecta las representaciones gated a una dimensión reducida (d_thin = 384) para ahorrar cómputo.
4. **Thin Parallel Blocks**: 8 bloques MSIT independientes (atención + FFN SwiGLU), cada uno con un tamaño de ventana distinto: [64, 64, 16, 16, 8, 8, 4, 4].
5. **Grow Projection**: proyecta las salidas de vuelta a d_model y las acumula en el residual stream usando los gates del router.

Se aplica **Pre-Norm** estricta: la normalización de capa se aplica al stream residual antes de que se ramifique en las proyecciones, evitando post-norms que desestabilizan el entrenamiento. El modelo se entrenó sobre el dataset **Wikitext-103-v1** con un batch size de 1 y contexto de 4096 tokens. No se reportan detalles sobre el número total de tokens de entrenamiento, ni si se usó RLHF o DPO. No hay información sobre técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto coherente en inglés (dado su entrenamiento en Wikitext), aunque su tamaño pequeño limita la calidad y la fluidez.
- Razonamiento básico: puede resolver tareas sencillas de modelado de lenguaje, pero no es adecuado para razonamiento complejo o matemáticas avanzadas.
- No se ha documentado soporte para tool calling, function calling, agentes o multi-step reasoning.
- No se han documentado capacidades multilingües, ni visión, ni audio.
- No se ha documentado un modo de thinking (pensamiento explícito).

## Casos de uso

- **Investigación académica en arquitecturas MoE**: el modelo sirve como banco de pruebas para validar el diseño de bloques MoEP-MSIT, especialmente el routing por elección de experto y el uso de ventanas deslizantes de distintos tamaños. Los investigadores pueden reproducir los resultados y comparar con otras variantes MoE.
- **Estudio de eficiencia computacional**: al reducir la dimensión de los expertos (d_thin) y usar ventanas pequeñas, el modelo permite medir el trade-off entre calidad y coste computacional en tareas de modelado de lenguaje pequeño.
- **Experimentos de routing de tokens**: dado que el router selecciona tokens en orden de secuencia, es útil para analizar cómo la distribución de tokens entre expertos afecta a la coherencia y a la pérdida de información posicional.
- **Pruebas de generación de texto corto**: con un contexto de 4096 tokens, puede generar párrafos breves, aunque su calidad será limitada. Útil para demos de arquitectura.
- **Comparación de ventanas de atención**: al tener expertos con ventanas de 64, 16, 8 y 4 tokens, se puede estudiar el efecto de la granularidad de la ventana en la comprensión de dependencias locales vs globales.
- **Entrenamiento desde cero en datasets pequeños**: el modelo es un punto de partida para experimentos de pre-entrenamiento con recursos limitados, ya que su tamaño es pequeño y no requiere hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo pequeño (6 capas, d_model 256, 8 expertos con d_thin 384), la inferencia puede ejecutarse en CPU o en GPUs con menos de 2 GB de VRAM. Sin embargo, el uso de 8 expertos y el mecanismo de routing puede aumentar el coste computacional.
- **GPUs recomendadas**: cualquier GPU moderna (GTX 1080, RTX 2060, etc.) es suficiente; no se requiere A100 o H100.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: no hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI. Al ser un modelo experimental sin formato de pesos especificado, se necesitaría adaptar el código.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MoE pequeño con ventanas deslizantes). No hay benchmarks públicos ni resultados de otros modelos similares. Se indica que no está disponible.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un modelo pequeño entrenado en un corpus de texto (Wikitext), es probable que genere textos incoherentes o con hechos inventados, especialmente en temas fuera del corpus.
- **Limitación de idioma**: solo entrenado en inglés (Wikitext), no soporta otros idiomas.
- **Licencia**: no se especifica licencia, por lo que su uso comercial es incierto. Se recomienda contactar con el autor o no usarlo en producción.
- **Contexto limitado**: a pesar de 4096 tokens, la arquitectura con ventanas deslizantes y routing por elección de experto puede degradar la coherencia en contextos largos.
- **Calidad de generación**: no es un modelo de alta calidad; es un experimento de investigación y no debe usarse para aplicaciones reales.
- **Sin soporte de herramientas**: no tiene función calling ni capacidades de agente.
- **Estado experimental**: el modelo está en fase de prueba, sin garantías de estabilidad ni reproducibilidad.

## Enlaces

- [Hugging Face - anonym5035/neurips_trail_1_8experts](https://huggingface.co/anonym5035/neurips_trail_1_8experts)
- [Perfil de anonym5035](https://huggingface.co/anonym5035)
