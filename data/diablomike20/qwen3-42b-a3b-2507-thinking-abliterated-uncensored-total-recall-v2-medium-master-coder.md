# diablomike20/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER

## Resumen

Este modelo es un fine-tune comunitario de la familia Qwen3 de Alibaba, publicado por el usuario diablomike20 en Hugging Face. Se trata de una versión "abliterated" (con los mecanismos de rechazo de seguridad eliminados mediante abliteration) del Qwen3-30B-A3B-Thinking-2507, ampliado mediante el adaptador "Brainstorm 20x" de DavidAU hasta alcanzar 42,37 mil millones de parámetros totales. El modelo combina arquitectura MoE (mixture of experts) con 128 expertos y 8 activados por token, un contexto nativo de 256k tokens y un enfoque orientado a la generación de código, aunque el autor lo presenta como apto también para casos de uso creativos gracias a la eliminación de restricciones.

La relevancia de este modelo radica en que mantiene el perfil de eficiencia de la serie Qwen3-30B-A3B (aproximadamente 3B de parámetros activos por token según la nomenclatura A3B de la familia, aunque el dato exacto no está confirmado para esta variante ampliada) mientras añade el modo de razonamiento "Thinking" de la versión 2507 y elimina los filtros de contenido. Esto lo hace interesante para desarrolladores que necesitan un modelo de código sin restricciones de alineamiento, con ventana de contexto muy amplia para proyectos grandes.

Debe subrayarse que se trata de un modelo comunitario derivado de una cadena de fine-tunes (Qwen → Huihui-ai abliterated → DavidAU Brainstorm → diablomike20), por lo que no existe documentación oficial de benchmarks ni garantías de calidad de Qwen/Alibaba. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), 128 expertos, 8 activados por token, 67 capas, 807 tensores |
| Parametros totales | 42.371.414.784 (aprox. 42,4B) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, pero no está confirmado para esta variante) |
| Longitud de contexto | 256k tokens (nativo) |
| Tipos de cuantizacion | safetensors en FP16/BF16 (origen); quants GGUF, GGUF imatrix y MLX publicados por terceros; el autor indica compatibilidad con GPTQ, EXL2, AWQ y HQQ |
| Idiomas soportados | inglés, francés, chino, alemán (no figura el castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (84,8 GB el repositorio completo) |

## Arquitectura y entrenamiento

La base del modelo es Qwen3-30B-A3B-Thinking-2507, un transformer MoE de la familia Qwen3 con 128 expertos de los cuales se activan 8 por token, lo que permite un coste de inferencia bajo manteniendo una capacidad paramétrica alta. Sobre esa base se aplicó el proceso de abliteration (eliminación de las direcciones de activación responsables de los rechazos), publicado por huihui-ai, y posteriormente se fusionó el adaptador "Brainstorm 20x" de DavidAU, que según el autor aumenta los parámetros hasta 42B y está diseñado para mejorar el rendimiento general y el razonamiento "fuera de lo convencional". El resultado tiene 67 capas y 807 tensores.

No hay información publicada sobre los datos de entrenamiento específicos de este fine-tune, ni sobre el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO. El modelo hereda el modo "Thinking" de la versión 2507 de Qwen3, que genera razonamiento explícito paso a paso antes de la respuesta final; por ello el autor recomienda reservar un contexto mínimo de 8k-16k tokens solo para el razonamiento y la salida. Una innovación práctica destacada en la model card es la posibilidad de ajustar el número de expertos activos en tiempo de inferencia (4 a 16) para equilibrar calidad, latencia y consumo según la tarea.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto nativa de 256k tokens.
- Generación de código en lenguajes de programación mayores y menores; el autor lo posiciona explícitamente como modelo "master coder" para programación.
- Razonamiento explícito mediante el modo "Thinking" heredado de Qwen3-30B-A3B-Thinking-2507.
- Contenido sin restricciones (abliterated): el modelo no rechaza peticiones de contenido violento, explícito o con lenguaje soez, aunque el autor señala que en algunos casos requiere instrucciones más directivas o ejemplos para alcanzar el nivel gráfico esperado.
- Casos de uso creativos: escritura de ficción, terror y otros géneros, con posibilidad de reducir los expertos activos a 4 para acelerar la generación.
- Ajuste dinámico de expertos activos (4-16) para equilibrar calidad y velocidad según la complejidad de la tarea.
- Soporte de tool calling: no disponible explícitamente para esta variante; el autor remite a la documentación del modelo raíz Qwen3-30B-A3B-Thinking-2507 para "tool use".
- Capacidades multilingües declaradas: inglés, francés, chino y alemán.

## Casos de uso

- Generación de código en proyectos grandes: la ventana de 256k tokens permite cargar repositorios completos o múltiples ficheros de un proyecto en el contexto, lo que lo hace adecuado para refactorizaciones amplias y comprensión de codebases ajenas.
- Programación compleja y proyectos largos: el autor recomienda subir los expertos activos a 12-16 para trabajo complejo, aprovechando la mayor capacidad paramétrica frente al modelo base de 30B.
- Razonamiento sobre problemas técnicos difíciles: el modo Thinking genera cadenas de razonamiento explícitas, útil para depuración, diseño de algoritmos y análisis de arquitectura, reservando 8k-16k de contexto para el razonamiento.
- Escritura creativa sin filtros: gracias a la abliteration, puede generar ficción de terror, gore o contenido explícito bajo petición, con la advertencia de que a veces hay que guiarlo con ejemplos o vocabulario concreto.
- Brainstorming y exploración de ideas: el adaptador Brainstorm 20x está diseñado para mejorar el pensamiento divergente, útil en fases de ideación técnica o narrativa.
- Chatbots y asistentes conversacionales locales: el perfil MoE con pocos expertos activos permite inferencia relativamente ágil en hardware de consumo para un modelo de 42B, y el autor sugiere aumentar 1-2 expertos en conversaciones multi-turno largas.
- Experimentación con modelos sin alineamiento: para investigadores que estudian el impacto de la abliteration en el comportamiento del modelo o que necesitan evitar rechazos en dominios legítimos pero sensibles (seguridad, medicina forense, moderación de contenido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas cuantitativas, ni enlaces a evaluaciones independientes más allá de dos publicaciones en LinkedIn con revisiones cualitativas. El rendimiento debe inferirse del modelo raíz Qwen3-30B-A3B-Thinking-2507, cuyos resultados oficiales no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio en precisión completa ocupa 84,8 GB (FP16/BF16), por lo que requiere al menos 2x A100/H100 de 80 GB o similar para inferencia sin cuantizar. Con quants GGUF Q4/IQ4 (recomendados por el autor), el footprint se reduce a un rango aproximado de 22-28 GB, aunque no se publica el tamaño exacto de cada quant.
- GPU recomendadas: para precisión completa, A100 u H100 de 80 GB (multi-GPU). Para quants Q4/IQ4, una RTX 4090 de 24 GB o una RTX 5090 de 32 GB pueden ser viables con contexto moderado; con contexto de 256k la VRAM de KV cache crece sustancialmente y puede requerir offload a CPU o multi-GPU.
- Consumer GPU: cabe en una RTX 4090/5090 con quants Q4/IQ4 y contexto moderado (8k-16k, que es lo que el autor recomienda como mínimo para el modo Thinking). Contextos muy largos probablemente requieran configuraciones híbridas GPU+CPU.
- Despliegue: quants GGUF e imatrix GGUF de mradermacher para llama.cpp y Ollama; quants MLX de Nightmedia para Apple Silicon; los safetensors originales son compatibles con vLLM, TGI y ExLlamaV2 (EXL2), AWQ, GPTQ y HQQ según el autor.
- Latencia y throughput: no disponibles como cifras concretas. Al ser MoE con pocos expertos activos, la latencia por token debería aproximarse a la de un modelo denso de ~3B activos, pero este dato no está confirmado para la variante de 42B.
- Ajuste de muestreo recomendado por el autor: rep pen 1,05-1,1, temperatura 0,3-0,6, top_k 20/40/100, top_p 0,95 o min_p 0,05.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-42B-A3B-2507-Thinking-Abliterated-TOTAL-RECALL-v2 (este) | 42,4B totales (MoE, 8/128 activos) | 256k | Apache 2.0 | Abliterated, Brainstorm 20x, orientado a código y creativo |
| Qwen3-30B-A3B-Thinking-2507 (raíz oficial) | 30,5B totales (MoE, ~3B activos) | 256k | Apache 2.0 | Modelo oficial de Qwen, con alineamiento, benchmarks publicados |
| huihui-ai/Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated | ~30,5B totales | 256k | Apache 2.0 | Base abliterated intermedia, sin adaptador Brainstorm |
| DavidAU/Qwen3-42B-A3B-2507-Thinking-TOTAL-RECALL-v2-Medium-MASTER-CODER | 42,4B totales | 256k | Apache 2.0 | Misma serie sin abliteration, "ligeramente uncensored" |

## Limitaciones y advertencias

- Modelo comunitario sin validación oficial: al ser una cadena de fine-tunes (Qwen → huihui-ai → DavidAU → diablomike20), no hay garantías de calidad ni benchmarks publicados; la abliteration y el merge pueden degradar el razonamiento y la precisión en código respecto al modelo raíz.
- Riesgo de alucinación: no disponible como medición específica; los modelos abliterated tienden a ser menos cautos y el propio autor recomienda rep pen elevado y más expertos activos para estabilizar las respuestas, lo que sugiere cierta inestabilidad.
- Contenido sin filtros: el modelo no rechaza peticiones de contenido explícito, violento o ilegal en algunos casos. Su uso conlleva riesgos legales y éticos significativos; el despliegue en producción exige controles de seguridad propios (moderación de entrada y salida).
- Idiomas: solo declara inglés, francés, chino y alemán; el castellano no figura entre los idiomas soportados, por lo que el rendimiento en español no está garantizado.
- Contexto: aunque el contexto nativo es de 256k, el autor recomienda 8k-16k mínimos solo para el razonamiento del modo Thinking, y aumentar expertos activos en contextos largos, lo que incrementa el coste de inferencia.
- Cuantización: el autor advierte que los quants bajos (Q2K, Q3, IQ3) pueden ser solo "pasables" y que se recomiendan Q4/IQ4 o superiores, preferiblemente con imatrix.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo hereda las restricciones de uso de la licencia de Qwen3 en lo aplicable y, sobre todo, la responsabilidad legal del contenido generado recae en el desplegador.
- Descargas y adopción muy bajas (337 descargas, 0 likes en el momento de la ficha), lo que implica poca validación comunitaria y posible presencia de bugs no detectados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diablomike20/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER
- Modelo raíz oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Modelo raíz Thinking 2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated
- Versión sin abliteration de la serie: https://huggingface.co/DavidAU/Qwen3-42B-A3B-2507-Thinking-TOTAL-RECALL-v2-Medium-MASTER-CODER
- Proyecto Total Recall V1.4 (ajustes y ejemplos): https://huggingface.co/DavidAU/Qwen3-55B-A3B-TOTAL-RECALL-Deep-40X-GGUF/
- Quants GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-GGUF
- Quants GGUF imatrix (mradermacher): https://huggingface.co/mradermacher/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-i1-GGUF
- Quants MLX (Nightmedia): el enlace aparece truncado en la model card (https://huggingface.co/nightmedi...), no disponible completo
- Revisiones en LinkedIn: https://www.linkedin.com/posts/gchesler_davidauqwen3-53b-a3b-total-recall-v14-128k-activity-7344938636141858816-ILCM/ y https://www.linkedin.com/posts/gchesler_haskell-postgres-agentic-activity-7347103276141596672-_zbo/
