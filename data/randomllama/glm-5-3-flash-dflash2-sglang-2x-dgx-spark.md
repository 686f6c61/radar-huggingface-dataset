# randomllama/GLM-5.3-Flash-DFlash2-SGLang-2x-DGX-Spark

## Resumen

GLM-5.3-Flash-DFlash2-SGLang-2x-DGX-Spark es una receta comunitaria de despliegue, no un modelo base nuevo. El autor, randomllama, documenta cómo ejecutar el modelo GLM-5.3-Flash de Z.AI (zai-org/GLM-5.3-Flash) sobre dos NVIDIA DGX Spark (GB10) usando SGLang con tensor parallelism de 2, incorporando el drafter DFlash2 para decodificación especulativa. La receta incluye parches para cuatro problemas de arranque específicos del hardware GB10 y mediciones de rendimiento que muestran una aceleración de hasta 1,88× en generación de código.

El modelo base GLM-5.3-Flash es un MoE multimodal de 320B parámetros totales con 18B activos, arquitectura híbrida que combina atención MLA, atención dispersa DSA y atención lineal KDA en 45 capas de texto, más un encoder de visión de 24 capas para imagen y vídeo. Fue entrenado sobre 30 billones de tokens y destaca en tareas de programación compleja y agentes de larga duración. Esta receta es relevante porque permite ejecutar un modelo de esta escala en hardware de consumo (DGX Spark) con rendimiento práctico, algo que hasta ahora requería clústeres de GPU profesionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (MLA + DSA + KDA) con encoder de visión |
| Parametros totales | 320B (modelo base) |
| Parametros activos | 18B (modelo base) |
| Longitud de contexto | 65536 tokens (reportado en pruebas del autor) |
| Tipos de cuantizacion | nvfp4 (según tags de la receta) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (la receta usa SGLang, que típicamente carga safetensors) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura Mixture-of-Experts con 45 capas de texto que combinan tres mecanismos de atención: atención MLA (Multi-head Latent Attention), atención dispersa DSA (Dynamic Sparse Attention) y atención lineal KDA (Kernel-based Linear Attention). Esta hibridación reduce el coste de servir contextos largos sin sacrificar precisión. Además, incorpora un encoder de visión de 24 capas que procesa imágenes y vídeo, lo que lo convierte en un modelo multimodal nativo. El entrenamiento se realizó sobre 30 billones de tokens, y las mejoras respecto a GLM-5.2 provienen principalmente de post-entrenamiento orientado a programación compleja y tareas de agente de largo horizonte.

La receta de randomllama añade el drafter DFlash2 (desarrollado por incoai) para decodificación especulativa, que genera múltiples tokens candidatos por paso y los verifica en paralelo. Sobre el hardware GB10, el autor documenta cuatro correcciones necesarias: configuración de `SGLANG_HOST_IP` por rango, ajuste de la memoria del pool de mamba para DFLASH con hybrid-KDA, reajuste de los parámetros de tilelang para evitar desbordamiento de smem en la verificación de 8 tokens, y un guard para el crash `residual=None` durante la captura de CUDA graphs.

## Capacidades

- Generación de texto y razonamiento complejo, con especial fortaleza en programación y tareas de agente (según documentación de Z.AI).
- Procesamiento multimodal: entrada de imagen y vídeo gracias al encoder de visión de 24 capas.
- Soporte de tool calling y function calling, implícito en las capacidades de agente de GLM-5.3 (no confirmado explícitamente en la información disponible).
- Razonamiento multi-paso y ejecución de tareas de larga duración, mejorado en post-entrenamiento.
- Decodificación especulativa con DFlash2, que acelera la generación entre 1,41× y 1,88× en el hardware objetivo.
- Capacidades multilingües: no especificadas en la información proporcionada.

## Casos de uso

- Inferencia local de alto rendimiento en hardware de consumo: la receta permite ejecutar un modelo de 320B en dos DGX Spark, alcanzando 27,6 tokens por segundo en código, lo que habilita despliegues en laboratorios o empresas sin acceso a clústeres de GPU.
- Asistente de programación en tiempo real: con la aceleración de DFlash2, el modelo puede integrarse en IDEs o pipelines de CI/CD para sugerencias de código y revisión automática con latencia aceptable.
- Agente autónomo de resolución de tareas: gracias a su capacidad de razonamiento multi-paso y tool calling, puede orquestar flujos de trabajo complejos (navegación web, ejecución de scripts, consultas a APIs) en un entorno local.
- Análisis de documentos multimodales: al aceptar imagen y vídeo, puede procesar capturas de pantalla, diagramas o vídeos de demostración para extraer información y generar resúmenes técnicos.
- Chatbot de atención al cliente con contexto largo: la ventana de 65K tokens permite mantener conversaciones extensas con historial completo, adecuado para soporte técnico especializado.
- Prototipado de investigación en IA: investigadores pueden experimentar con un modelo de gran escala en hardware asequible, probando técnicas de decodificación especulativa o ajuste fino sin depender de la nube.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones de rendimiento en el hardware objetivo (2× DGX Spark, SGLang TP=2, temperatura 0, 800 tokens de salida, medianas de 5 ejecuciones):

| Prompt | DFlash2 ON | Sin especulación (misma pila) | Speedup |
|---|---|---|---|
| Código | 27,6 tok/s | 14,7 tok/s | 1,88× |
| Prosa | 20,7 tok/s | 14,7 tok/s | 1,41× |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que aún no se garantizan salidas bit-idénticas entre la versión con y sin DFlash2 (se observó un cambio de token en una comparación de 5 prompts a temperatura 0).

## Requisitos de hardware

- Hardware objetivo: 2× NVIDIA DGX Spark (GB10), cada uno con aproximadamente 100 GB de memoria unificada (según la model card, cada lane de inferencia requiere ~100 GB por nodo).
- GPU: DGX Spark con arquitectura SM121 (según tags).
- VRAM estimada: no disponible con precisión, pero la receta indica que cada nodo necesita ~100 GB para la inferencia completa.
- Opciones de despliegue: SGLang con tensor parallelism de 2 (TP=2), usando la rama del PR #36507. No se mencionan otras opciones como llama.cpp u Ollama.
- Latencia y throughput: los valores medidos son 27,6 tok/s (código) y 20,7 tok/s (prosa) con DFlash2 activado, en condiciones de caché caliente y sin streaming.

## Comparativa con modelos similares

La comparativa más directa es contra el mismo modelo sin decodificación especulativa, ya que la receta no altera la calidad del modelo base. No se dispone de datos comparativos con otros modelos MoE de tamaño similar (por ejemplo, Qwen2.5-MoE o DeepSeek-V3) en el mismo hardware.

| Configuración | Tokens/s (código) | Tokens/s (prosa) | Licencia |
|---|---|---|---|
| GLM-5.3-Flash + DFlash2 (esta receta) | 27,6 | 20,7 | MIT |
| GLM-5.3-Flash sin DFlash2 (misma pila) | 14,7 | 14,7 | MIT |

## Limitaciones y advertencias

- La receta es comunitaria y no oficial: el autor advierte que los números pueden mejorar con una optimización más profunda, pero no hay garantía de estabilidad en todos los entornos.
- No se garantiza reproducibilidad bit-idéntica: se observó al menos un token diferente entre la versión con y sin DFlash2 en pruebas a temperatura 0, lo que puede afectar a aplicaciones que requieren salidas deterministas.
- Requiere hardware específico: la receta está pensada para DGX Spark (GB10) y puede no funcionar en otras GPUs sin adaptaciones.
- Los cuatro parches documentados son necesarios para el arranque; sin ellos, el sistema puede colgarse o fallar (por ejemplo, el hang de `shm_broadcast` o el crash de `residual=None`).
- La licencia MIT permite uso comercial, pero el modelo base GLM-5.3-Flash también es MIT según los tags, por lo que no hay restricciones adicionales conocidas.
- No se han publicado evaluaciones de sesgos, alucinaciones o calidad lingüística para esta configuración específica.

## Enlaces

- HuggingFace: https://huggingface.co/randomllama/GLM-5.3-Flash-DFlash2-SGLang-2x-DGX-Spark
- GitHub (repositorio de la receta): https://github.com/beastllama/GLM-5.3-Flash-DFlash2-SGLang-2x-DGX-Spark/tree/main
- Documentación de SGLang para GLM-5.3-Flash: https://docs.sglang.io/cookbook/autoregressive/GLM/GLM-5.3-Flash
- Guía de Unsloth para ejecutar GLM-5.3 localmente: https://unsloth.ai/docs/models/glm-5.3
- Documentación oficial de Z.AI para GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
