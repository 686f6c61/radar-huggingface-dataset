# OpenFlowLM/Qwen3-4B-NPU2

## Resumen

OpenFlowLM/Qwen3-4B-NPU2 es un ajuste fino del modelo base Qwen/Qwen3-4B-Base, publicado por el usuario OpenFlowLM bajo licencia Apache 2.0. Se distribuye con la etiqueta `text-generation` y compatibilidad declarada con la librería `transformers`. Hereda del modelo base la arquitectura Qwen3-4B: un transformer causal denso de 4.000 millones de parámetros (3.600 millones sin contar los embeddings), 36 capas y atención con GQA (32 cabezas de consulta y 8 de clave/valor), con una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN.

El repositorio no documenta su propio proceso de entrenamiento: la model card reproduce literalmente la de Qwen3-4B, de modo que no hay información sobre el corpus de ajuste, el volumen de tokens empleado ni si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo "NPU2" del nombre, junto con las referencias halladas en la búsqueda web al backend XDNA de llama.cpp y al proyecto nix-amd-ai, sugiere un enfoque orientado a aceleradores NPU (por ejemplo, AMD XDNA / Ryzen AI), pero ninguna documentación técnica del autor confirma esa hipótesis.

Con cero descargas y cero "likes" en el momento de la consulta, se trata de una publicación reciente (creada el 2 de octubre de 2026) y sin validación comunitaria. Es relevante como muestra de la oleada de derivados de Qwen3 orientados a ejecución en hardware NPU, pero cualquier uso en producción debería ir precedido de una evaluación propia, dado que no existe evidencia publicada sobre su calidad tras el ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Qwen3), 36 capas, GQA con 32 cabezas de consulta y 8 de clave/valor |
| Parametros totales | 4,0 B (3,6 B excluyendo embeddings) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 tokens con YaRN |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio ocupa 3,3 GB |
| Idiomas soportados | no disponible para este ajuste; la familia Qwen3 declara soporte de mas de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio declara `library_name: transformers` (se presupone safetensors) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3 en su variante densa de 4.000 millones de parámetros: 36 capas de transformer causal con normalización QK-Norm, atención con GQA (32 cabezas de consulta frente a 8 de clave/valor, lo que reduce el coste de la caché KV) y un cabezal de lenguaje sobre embeddings atados. El modelo base Qwen3-4B-Base se entrenó en dos fases, preentrenamiento y postentrenamiento, e incorpora de serie la capacidad de alternar entre modo "thinking" (razonamiento explícito encerrado en bloques ` thinking`) y modo directo, seleccionable mediante el parámetro `enable_thinking` de la plantilla de chat. La ampliación de contexto hasta 131.072 tokens se realiza en inferencia mediante escalado YaRN, no durante el preentrenamiento según la información disponible.

Sobre este repositorio concreto no hay ningún dato de entrenamiento publicado: se desconoce el dataset de ajuste, el número de tokens, la receta de alineación y si se modificó el tokenizador o la plantilla de chat. Dado que la model card es una copia de la de Qwen3-4B, toda afirmación sobre capacidades debe considerarse heredada y no verificada para esta variante. El nombre "NPU2" y las referencias encontradas a los backends XDNA y al proyecto nix-amd-ai apuntan a una posible orientación a despliegue en NPU, pero no se documenta ninguna modificación arquitectónica, de cuantización o de gráfico de cómputo que respalde esa orientación.

## Capacidades

Las siguientes capacidades provienen de la model card heredada de Qwen3 y no han sido verificadas para este ajuste concreto:

- Generación de texto conversacional multirround con plantilla de chat compatible con `transformers`.
- Razonamiento explícito en modo "thinking" (matemáticas, lógica, código) y conmutación a modo directo para diálogo general dentro del mismo modelo.
- Generación y comprensión de código, con soporte de instrucciones de programación en múltiples lenguajes.
- Resolución de problemas matemáticos y razonamiento de sentido común de varios pasos.
- Capacidades de agente y uso de herramientas externas (tool calling / function calling) tanto en modo thinking como en modo directo, según la documentación del modelo base.
- Seguimiento de instrucciones multilingüe y traducción en más de 100 idiomas y dialectos, según las cifras declaradas para la familia Qwen3.
- Procesamiento de textos largos de hasta 131.072 tokens mediante activación de YaRN.
- No se declara soporte de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistente conversacional local: con 4.000 millones de parámetros y cuantización de 4 bits, el modelo cabe en GPUs de consumo y permite desplegar un asistente privado sin enviar datos a terceros, usando el modo directo para respuestas rápidas.
- Generación de código en el IDE: el modo thinking es adecuado para completar funciones, explicar código heredado o generar pruebas unitarias, y su tamaño reducido permite ejecutarlo junto al editor en una estación de trabajo con GPU de gama media.
- Tutoría matemática paso a paso: el bloque ` thinking` hace visible la cadena de razonamiento, lo que resulta útil en entornos educativos donde se necesita revisar el procedimiento, no solo el resultado.
- Automatización de agentes con herramientas: al declarar soporte de tool calling, puede integrarse como planificador en pipelines que consulten APIs, bases de datos o sistemas de tickets, con la advertencia de que dicha capacidad no está verificada para este ajuste.
- Atención al cliente multilingüe: el soporte declarado de más de 100 idiomas permite atender consultas en varios idiomas con un único modelo, siempre que la evaluación previa confirme la calidad del ajuste en cada idioma objetivo.
- Análisis de documentos extensos: los 131.072 tokens de contexto con YaRN permiten resumir contratos, informes técnicos o expedientes completos en una sola pasada, sin necesidad de recuperación fragmentada.
- Clasificación y extracción estructurada: generación de JSON o campos normalizados a partir de texto libre en procesos batch, con la ventaja de que el modelo es lo bastante pequeño para ejecutarse en paralelo en varias instancias.
- Experimentación en hardware NPU: por el nombre del repositorio y las referencias encontradas, puede servir como banco de pruebas para validar flujos de inferencia sobre aceleradores XDNA o similares, aunque la ruta de despliegue no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite al blog, al repositorio de GitHub y a la documentación de Qwen para consultar evaluaciones, pero no incluye cifras propias ni de este ajuste. Cualquier resultado publicado para Qwen3-4B correspondería al modelo base o al instruct oficial, no a esta variante.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del número de parámetros (4,0 B) y no proceden de mediciones publicadas para este repositorio:

- Pesos en bf16/fp16: aproximadamente 8-9 GB de VRAM solo para los pesos, más la caché KV correspondiente al contexto utilizado.
- Pesos en int8/fp8: aproximadamente 4-4,5 GB.
- Pesos en 4 bits (por ejemplo GGUF Q4_K_M): aproximadamente 2,5-3 GB, lo que concuerda con el tamaño de 3,3 GB del repositorio si este almacena pesos ya cuantizados.
- GPU consumer compatibles: una RTX 3060 de 12 GB o superior permite bf16 con contexto moderado; una RTX 4060 Ti de 8 GB o una RTX 3070 exigen cuantización de 4 bits. Una RTX 4090 ejecuta el modelo con holgura y contexto largo.
- GPU de centro de datos: A100, H100 o L40S para servir varias peticiones concurrentes con contexto extendido.
- Opciones de despliegue documentadas en la model card del modelo base: `transformers`, vLLM (>= 0.8.5), SGLang (>= 0.4.6.post1), Ollama, LM Studio, llama.cpp, MLX-LM y KTransformers.
- Despliegue en NPU: no hay procedimiento documentado en el repositorio; el nombre del modelo y las referencias web a XDNA y nix-amd-ai sugieren esa vía, pero requeriría validación propia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| OpenFlowLM/Qwen3-4B-NPU2 | 4,0 B (denso) | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | HuggingFace, 0 descargas | No disponible |
| Qwen/Qwen3-4B | 4,0 B (denso) | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | HuggingFace, modelo oficial | Consultar blog y documentacion de Qwen |
| Qwen/Qwen3-4B-Base | 4,0 B (denso) | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | HuggingFace, modelo oficial | Consultar blog y documentacion de Qwen |
| Alternativas de ~3-4 B (por ejemplo Llama 3.2 3B o Gemma 3 4B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

El único dato diferencial verificable de esta publicación frente al modelo oficial es que se trata de un ajuste derivado, sin métricas publicadas y sin adopción registrada.

## Limitaciones y advertencias

- Ausencia total de documentación del ajuste: no se especifica dataset, hiperparámetros, tokens ni método de alineación, lo que impide reproducir el entrenamiento o auditar su comportamiento.
- La model card es una copia literal de la de Qwen3-4B, por lo que las capacidades declaradas (tool calling, multilingüismo, calidad conversacional) describen al modelo base y no necesariamente a este ajuste.
- Riesgo de alucinación inherente a los modelos de 4.000 millones de parámetros, superior al de modelos mayores en tareas de conocimiento factual denso.
- Riesgo de repeticiones sin fin: la propia model card del modelo base recomienda ajustar los parámetros de muestreo (temperatura 0,6 y top_p 0,95 en modo thinking) y fijar `presence_penalty` en 1,5 si aparecen bucles.
- Idiomas soportados no verificados para este ajuste; el rendimiento puede degradarse fuera del inglés y del chino.
- La ventana de 131.072 tokens requiere activar YaRN en inferencia; sin esa configuración el límite real es de 32.768 tokens, y el rendimiento en contextos muy largos no está medido.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se indiquen los cambios realizados. El enlace de licencia apunta al repositorio de Qwen/Qwen3-4B.
- Publicación sin descargas ni validación por parte de la comunidad: no existe evidencia externa de calidad, seguridad ni estabilidad en producción.
- La vía de despliegue en NPU que sugiere el nombre no está documentada, de modo que no debe asumirse compatibilidad con aceleradores concretos sin pruebas previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenFlowLM/Qwen3-4B-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Modelo instruct oficial de referencia: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe técnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Artículo de vLLM/PagedAttention referenciado en las etiquetas (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Issue del backend XDNA en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/21725
- Proyecto nix-amd-ai: https://github.com/noamsto/nix-amd-ai
- Chat de Qwen: https://chat.qwen.ai/
