# KiranAN1988/NeemSutra-125M-Python-Instruct-Beta

## Resumen

NeemSutra-125M-Python-Instruct-Beta es un modelo de lenguaje de 125.892.096 parámetros (~125M) desarrollado por el usuario KiranAN1988 como experimento de investigación sobre diseño de modelos de lenguaje pequenos (SLM) desde primeros principios. Se trata de un transformer decoder-only con 16 capas, 12 cabezas de atencion y dimension de modelo 768, entrenado con un vocabulario propio de 8.000 tokens (tokenizer "Sutra BPE v2") y una ventana de contexto maxima de solo 256 tokens. Su dominio principal es Python y programacion, y el checkpoint publicado corresponde a la etapa final de ajuste supervisado (SFT) sobre el dataset OpenCodeInstruct de NVIDIA.

El interes del modelo no reside en su rendimiento, sino en su caracter documental: la model card describe una trayectoria de entrenamiento secuencial completa y auditable, con cinco etapas (pretraining base, DAPT en Python, SFT en Python, DAPT extendido y SFT final) y un recuento explicito de tokens por etapa, que suma mas de 41.000 millones de tokens procesados. Esto lo convierte en un artefacto util para estudiar como se comporta un modelo muy pequeno cuando se le aplican sucesivamente adaptacion de dominio e instruccion, y para reproducir experimentos de tokenizacion y evaluacion (validacion de sintaxis, analisis AST, prediccion forzada por profesor).

Es relevante ahora como caso de estudio de la corriente de SLM orientados a codigo, pero el propio autor advierte explicitamente de que no pretende ser un modelo de codigo de ultima generacion y de que debe tratarse como artefacto de investigacion, no como asistente de produccion. El repositorio tiene 0 descargas y 0 likes, y no se han publicado resultados numericos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 125.892.096 (~125M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible en la model card (no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en); el dominio principal de entrenamiento es Python/codigo |
| Licencia | Apache-2.0 |
| Formato de pesos | No especificado; libreria declarada PyTorch, con script de inferencia autocontenido incluido en el repositorio (tamano del repo: 1.5 GB) |

Datos adicionales de arquitectura declarados por el autor: embeddings de tokens, embeddings posicionales aprendidos, 16 capas, 12 cabezas de atencion, dimension de modelo 768, capas MLP feed-forward, layer normalization y cabeza LM final. Vocabulario de 8.000 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional, sin mecanismos de atencion dispersa, SSM ni mezclas de expertos. Usa embeddings posicionales aprendidos en lugar de RoPE y layer normalization clasica, lo que situa el diseno en la tradicion de los transformers tipo GPT-2 pero con un vocabulario reducido a 8.000 tokens, construido especificamente para el proyecto (tokenizer "Sutra BPE v2"). La ventana de contexto de 256 tokens es muy corta para los estandares actuales y condiciona por completo los casos de uso posibles.

El entrenamiento se organizo en cinco etapas secuenciales, con el recuento de tokens declarado por el autor: pretraining base sobre un subconjunto seleccionado del corpus Common Pile v0.1 (~5.750 millones de tokens, organizado en libros, general, ciencia y tecnico, con Project Gutenberg entre las fuentes referenciadas); primer DAPT sobre Lovett01/Python-Code-Large (~7.400 millones); primer SFT sobre OLMo-Coding/starcoder-python-instruct (~2.790 millones); DAPT extendido sobre togethercomputer/RedPajama-Data-1T (~24.000 millones); y SFT final sobre nvidia/OpenCodeInstruct (~2.000 millones). No se menciona el uso de RLHF, DPO ni decodificacion especulativa. La innovacion declarada no es algorimica sino metodologica: contabilidad de tokens por etapa, validacion de checkpoints intermedios y pruebas de estres con conjuntos de prompts, junto con un script de inferencia que soporta decodificacion greedy determinista y muestreo configurable para hacer reproducibles las pruebas locales.

## Capacidades

- Generacion de texto autorregresiva y prediccion del siguiente token.
- Completado de codigo Python de forma corta y estructurada: la model card cita como pruebas de humo los prompts `def fibonacci(n):` y `def add(a, b):`.
- Seguimiento de instrucciones a nivel basico, adquirido en las etapas de SFT sobre starcoder-python-instruct y OpenCodeInstruct.
- Generacion determinista (temperatura 0) reproducible, util para experimentos controlados.
- Muestreo configurable con top-k, top-p y semilla fija.
- Inferencia en CPU, CUDA y "MP" (la model card aparece truncada en este punto; probablemente hace referencia a MPS/Apple Silicon, aunque no puede confirmarse con la informacion disponible).
- Idiomas: ingles declarado; no se documenta soporte multilingue.
- No documentado: tool calling o function calling, uso en agentes, razonamiento multi-paso, modo "thinking", vision, audio, ni capacidades de matemematicas mas alla de lo que emerga del entrenamiento en codigo.

## Casos de uso

- Investigacion sobre tokenizadores: el vocabulario de 8.000 tokens y el tokenizer "Sutra BPE v2" permiten estudiar el efecto del tamano de vocabulario en la eficiencia por token y en la calidad de generacion de codigo, comparando contra vocabularios de 32k o 50k tokens.
- Estudios de ablacion sobre adaptacion de dominio: la secuencia documentada de pretraining, DAPT en Python, SFT, DAPT extendido y SFT final permite reproducir experimentos sobre que aporta cada etapa y en que orden, con recuento de tokens conocido y verificable.
- Evaluacion automatica de codigo en pipelines de investigacion: al generar continuaciones cortas de funciones, puede integrarse en un harness que valide sintaxis, construya el AST y compruebe coincidencia de n-gramas, tal como describe el propio autor en su suite de evaluacion.
- Docencia y material educativo: es viable ejecutar el modelo en un portatil sin GPU para ilustrar de forma tangible conceptos como ventana de contexto, temperatura de muestreo, decodificacion greedy frente a muestreo, y por que un modelo de 125M se degrada en generaciones largas.
- Baseline de referencia en experimentos propios: cualquier proyecto que entrene un SLM de ~125M para codigo puede usarlo como punto de comparacion reproducible, ya que el checkpoint final y el script de inferencia estan publicados bajo Apache-2.0.
- Fine-tuning de bajo coste: con ~126M de parametros, el ajuste completo o mediante LoRA es asumible en una unica GPU consumer, lo que permite experimentar con tecnicas de adaptacion sobre un dominio concreto (por ejemplo, otro lenguaje de programacion) partiendo de una base ya orientada a codigo.
- Pruebas de infraestructura de despliegue: por su tamano minimo resulta comodo para validar pipelines de servido (carga de pesos, batching, gestion de KV cache, latencia en CPU) antes de pasar a modelos de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodologia de evaluacion (completado de codigo Python, prediccion forzada del siguiente token, pruebas de continuacion, validacion de sintaxis, analisis de probabilidad y rango del token objetivo, coincidencia de n-gramas, evaluacion basada en AST y conjuntos de prompts de estres), pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar. Tampoco se proporcionan datos de throughput ni de latencia.

## Requisitos de hardware

- VRAM estimada para pesos, calculada a partir de los 125,9M de parametros: ~504 MB en FP32, ~252 MB en FP16/BF16, ~126 MB en INT8 y ~63 MB en INT4. Son estimaciones aritmeticas, no cifras publicadas por el autor.
- KV cache: con 16 capas, 12 cabezas de dimension 64 y 256 tokens de contexto, el cache completo ocupa aproximadamente 12,6 MB en FP16, por lo que no es un factor limitante.
- El repositorio ocupa 1,5 GB, lo que sugiere que incluye mas de un checkpoint o estados adicionales ademas de los pesos de inferencia en FP32.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4090, e incluso GPUs integradas o Apple Silicon. Tambien funciona en CPU, segun declara el autor.
- Opciones de despliegue: la model card solo menciona un script de inferencia propio (`inference.py`) con soporte para CPU, CUDA y "MP". No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no puede asumirse su uso directo en esas herramientas sin una conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicos | Disponibilidad |
|---|---|---|---|---|---|---|
| NeemSutra-125M-Python-Instruct-Beta | 125,9M | 256 tokens | Ingles | Apache-2.0 | No publicados | HuggingFace, 0 descargas |
| GPT-2 small | 124M | 1.024 tokens | Ingles | MIT (pesos originales) | Si (evaluaciones originales de OpenAI) | Ampliamente disponible en multiples formatos |
| SmolLM2-135M | 135M | 2.048 tokens (segun modelo base de la familia) | Ingles y otros | Apache-2.0 | Si, publicados por el desarrollador | HuggingFace, con versiones GGUF |
| Qwen2.5-Coder-0.5B | 494M | 32.768 tokens | Multilingue | Apache-2.0 | Si, publicados por el desarrollador | HuggingFace, con versiones GGUF |

La comparacion relevante es por categoria de tamano: frente a GPT-2 small, NeemSutra ofrece un vocabulario mucho menor y una ventana de contexto cuatro veces mas corta, pero incorpora ajuste por instrucciones y adaptacion a Python, algo de lo que carece GPT-2. Frente a SmolLM2-135M y Qwen2.5-Coder-0.5B, la desventaja en contexto y en disponibilidad de formatos cuantizados es muy marcada. No se dispone de datos de rendimiento comparativos porque NeemSutra no publica cifras.

## Limitaciones y advertencias

- El propio autor declara que el modelo es un artefacto de investigacion y que no debe usarse como asistente de codigo en produccion.
- Ventana de contexto de 256 tokens: insuficiente para archivos completos, conversaciones multiturno o cualquier tarea que requiera memoria extendida.
- Generacion de forma libre inconsistente: la model card reconoce que la calidad se degrada en generaciones largas y que puede volverse incoherente.
- Capacidad limitada de razonamiento y planificacion, consecuencia directa del numero de parametros.
- Sensibilidad alta a los parametros de decodificacion: la calidad varia sustancialmente segun temperatura, top-k y top-p.
- Ausencia total de resultados de benchmarks, lo que impide estimar su rendimiento relativo con rigor.
- Proyecto sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinacion elevado en cualquier tarea que exija conocimiento factual, dado el tamano y la composicion del corpus de entrenamiento (texto de dominio publico y codigo).
- Sesgos potenciales heredados de las fuentes de entrenamiento (Common Pile, RedPajama, datasets de codigo de terceros); no se documenta ninguna mitigacion ni evaluacion de sesgos.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero los datos de entrenamiento incluyen OpenCodeInstruct (CC BY 4.0 segun su dataset card) y otros corpus con terminos propios. El autor advierte de que deben revisarse los terminos y requisitos de atribucion de los datasets de origen antes de usar o redistribuir artefactos derivados.
- Solo se declara soporte de ingles; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- No se documentan tool calling, agentes, ni integracion con servidores de inferencia estandar, lo que limita su uso en arquitecturas de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KiranAN1988/NeemSutra-125M-Python-Instruct-Beta
- Common Pile (organizacion): https://huggingface.co/common-pile
- Coleccion Common Pile v0.1: https://huggingface.co/collections/common-pile/common-pile-v01
- Project Gutenberg dentro de Common Pile: https://huggingface.co/datasets/common-pile/project_gutenberg
- Dataset Python-Code-Large: https://huggingface.co/datasets/Lovett01/Python-Code-Large/tree/main
- Dataset starcoder-python-instruct: https://huggingface.co/datasets/OLMo-Coding/starcoder-python-instruct/tree/main
- Dataset RedPajama-Data-1T: https://huggingface.co/datasets/togethercomputer/RedPajama-Data-1T/tree/main
- Dataset OpenCodeInstruct (NVIDIA): https://huggingface.co/datasets/nvidia/OpenCodeInstruct

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card del autor. No se dispone de paper, blog tecnico, repositorio de codigo independiente ni demo publica.
