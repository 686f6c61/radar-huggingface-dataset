# mradermacher/Ornith-1.5-9B-Abliterated-GGUF

## Resumen

Ornith-1.5-9B-Abliterated-GGUF es una versión cuantizada en formato GGUF del modelo Ornith-1.5-9B-Abliterated, preparada por mradermacher (nethype GmbH). El modelo base, desarrollado por PocketAiHub, es un transformador denso de aproximadamente 9 000 millones de parámetros, multimodal (texto e imagen), orientado a generación de código y razonamiento agéntico. La variante "abliterated" elimina los mecanismos de rechazo de contenido, lo que permite una generación sin filtros de seguridad, con las implicaciones éticas y de uso que ello conlleva.

La relevancia de esta ficha reside en que ofrece una vía práctica para ejecutar un modelo multimodal de 9B en hardware de consumo mediante cuantización GGUF, sin necesidad de GPU de alta gama. El repositorio incluye múltiples niveles de cuantización, desde Q2_K hasta f16, y archivos de proyección multimodal (mmproj) para habilitar la entrada de imágenes. Es una opción atractiva para desarrolladores que buscan un modelo de código y razonamiento con soporte visual, aunque se debe prestar atención a la ausencia de alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (multimodal, texto + vision) |
| Parametros totales | 8 953 803 264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (con archivos mmproj para la parte multimodal) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible, pero se sabe que se trata de un transformer denso (no mezcla de expertos) de 9B parametros, con capacidad multimodal: incluye un proyector de vision (mmproj) para procesar imagenes junto con texto. El modelo base, Ornith-1.5-9B, fue desarrollado por DeepReinforce (segun fuentes web) y extiende el enfoque de "self-scaffolding" de Ornith-1.0 hacia un bucle de auto-mejora: el modelo propone tareas, genera scaffolds especificos y produce rollouts para aprendizaje por refuerzo.

La version abliterated elimina los rechazos de contenido no seguro, lo que se consigue mediante una modificacion post-entrenamiento que no altera los pesos de forma significativa, pero que suele degradar ligeramente el rendimiento en tareas que requieren seguir instrucciones de seguridad. Los detalles concretos del entrenamiento (numero de tokens, composicion del dataset, tecnicas de RLHF/DPO) no estan disponibles en los materiales proporcionados.

## Capacidades

- Generacion de texto y razonamiento general, con enfasis en codigo y tareas agilicas.
- Procesamiento multimodal: entrada de imagenes junto con texto (gracias al archivo mmproj).
- Capacidad de auto-mejora mediante scaffolding (segun la documentacion de Ornith-1.5).
- Generacion de codigo en multiples lenguajes (no se especifican cuales, pero es un modelo de codigo).
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion disponible, por lo que se asume que no esta confirmado.
- Capacidades de agente y multi-step reasoning: se menciona "agentic reasoning" en la busqueda web, pero no hay detalles concretos.
- Multilingue: solo ingles confirmado.

## Casos de uso

- **Asistente de programacion en local**: el modelo puede integrarse en IDEs o herramientas CLI (como llama.cpp) para autocompletar, generar funciones o explicar fragmentos de codigo. Su tamano (9B) permite ejecutarlo en una GPU de 8 GB con cuantizacion Q4_K_M, ofreciendo una alternativa de codigo generativo sin conexion a la nube.
- **Generacion de codigo en pipelines de CI/CD**: aunque no se confirma tool calling, el modelo puede usarse para generar tests unitarios o documentacion a partir de codigo fuente, siempre que el pipeline disponga de suficiente memoria para cargar el modelo (5-6 GB de VRAM en Q4).
- **Analisis de imagenes con texto**: gracias al componente multimodal, puede describir capturas de pantalla o diagramas de arquitectura y generar codigo o explicaciones asociadas. Es util en tareas de documentacion tecnica o revison de disenos.
- **Prototipado rapido de chatbots de dominio especifico**: al ser "abliterated", permite crear asistentes sin restricciones de contenido, por ejemplo para simulaciones de roles o generacion de narrativa, aunque debe asumirse el riesgo de salidas inapropiadas.
- **Investigacion en alineacion y seguridad**: el modelo abliterated sirve como caso de estudio para analizar el impacto de eliminar los rechazos de seguridad en un LLM de tamano medio, comparando comportamientos con la version original.
- **Despliegue en entornos con recursos limitados**: con cuantizaciones Q4_K_M o Q5_K_M (5.7-6.6 GB) puede ejecutarse en una RTX 3060 de 12GB o en un Mac con 16GB de RAM unificada, habilitando aplicaciones de chat o asistentes locales sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF van de 3.9 GB (Q2_K) a 18.0 GB (f16). Para un rendimiento razonable se recomienda Q4_K_M (5.7 GB) o Q5_K_M (6.6 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 3070) puede ejecutar Q4_K_M. Para Q8_0 (9.6 GB) se necesita una GPU de 12 GB o mas. En Mac, un M1/M2 con 16 GB de RAM unificada es suficiente para Q4.
- Opciones de despliegue: llama.cpp (incluyendo su servidor), Ollama, LM Studio, o cualquier runtime que soporte GGUF. Tambien se puede usar con vLLM si se convierte a safetensors, aunque no es el proposito del repo.
- Latencia y throughput: no se dispone de datos. Se estima que en una RTX 4090, un modelo de 9B en Q4 puede generar entre 50-100 tokens/segundo, pero es una cifra orientativa sin validacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de 9B. Sin embargo, por su tamano y enfoque en codigo, podria situarse en la misma categoria que Llama-3.1-8B, Mistral-7B o Gemma-2-9B, aunque no hay informacion para comparar directamente. La diferencia principal es que este modelo es multimodal y abliterated, lo que no es comun en esa franja.

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Ornith-1.5-9B-Abliterated | 9B | No disponible | Si (vision) | MIT |
| Llama-3.1-8B | 8B | 128K | No | Llama 3.1 Community License |
| Mistral-7B | 7B | 32K | No | Apache 2.0 |
| Gemma-2-9B | 9B | 8K | No | Gemma Terms of Use |

(Nota: estos datos de modelos alternativos son de conocimiento general y no estan en la informacion proporcionada; se indican como referencia orientativa.)

## Limitaciones y advertencias

- **Riesgo de contenido no seguro**: al estar "abliterated", el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es apto para aplicaciones de produccion que requieran moderacion.
- **Sesgos y alucinaciones**: no hay informacion sobre sesgos especificos, pero como cualquier LLM, puede producir respuestas falsas o inventadas, especialmente en contextos largos.
- **Idioma limitado**: solo se ha confirmado el ingles; puede degradarse en otros idiomas.
- **Longitud de contexto desconocida**: no se ha publicado el tamano de la ventana de contexto, lo que dificulta planificar aplicaciones con dependencias de memoria de contexto.
- **Licencia MIT**: permite uso comercial, pero no se puede responsabilizar al autor por el mal uso del modelo.
- **Rendimiento degradado por abliteration**: la eliminacion de los rechazos puede afectar a la coherencia en tareas que requieren matices de seguridad.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Ornith-1.5-9B-Abliterated-GGUF
- Modelo base (PocketAiHub): https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated
- Articulo sobre Ornith 1.5 en el blog de Ornith AI: https://ornith.ai/ornith_1_5.html
- Guia de ejecucion local en atomic.chat: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-9b-gguf-ornith-ai
