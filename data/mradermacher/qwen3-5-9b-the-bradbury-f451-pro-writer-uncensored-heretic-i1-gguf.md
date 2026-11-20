# mradermacher/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-i1-GGUF

## Resumen

Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic es un ajuste fino (fine tune) de un modelo Qwen 3.5 de aproximadamente 9.000 millones de parametros, orientado especificamente a escritura creativa, narrativa de ficcion y roleplaying. El autor del ajuste es DavidAU, y esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un distribuidor habitual de cuantizaciones de modelos en Hugging Face. El modelo combina tecnicas de "abliteration" y "heretic" (eliminacion o reduccion de los mecanismos de rechazo y alineacion de seguridad del modelo base) con un entrenamiento multi-etapa sobre el dataset DavidAU/The-BradburyF451, lo que produce un modelo sin filtros de contenido y con enfasis en prosa vivida.

El nombre homenajea a Ray Bradbury (autor de *Fahrenheit 451*), lo que anticipa el enfoque: escritura literaria, generacion de tramas, subtramas, continuacion de escenas y narrativa de todos los generos (ciencia ficcion, romance, etc.). El modelo esta etiquetado explicitamente como "not for all audiences" (no apto para todos los publicos) por la ausencia de moderacion de contenido.

Esta ficha cubre la variante i1-GGUF, que ofrece un abanico amplio de cuantizaciones con imatrix (desde IQ1_S de 2,8 GB hasta Q6_K), pensadas para ejecucion local en hardware de consumo mediante llama.cpp y derivados. El repositorio completo ocupa 110,2 GB por incluir todas las variantes de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_0, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | en, zh (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic, un ajuste fino del modelo Qwen 3.5 de ~9 B parametros. La model card del autor original no detalla la arquitectura interna del transformer subyacente (numero de capas, dimensiones, atencion, etc.), por lo que esos datos no estan disponibles. El ajuste se describe como "multi-stage tuned" (ajustado en varias etapas) y combina tecnicas "heretic" y "abliterated", que consisten en modificar los pesos para eliminar la direccion de rechazo aprendida durante la alineacion, reduciendo la tendencia del modelo a negarse a generar cierto contenido.

El entrenamiento se realizo sobre el dataset DavidAU/The-BradburyF451, orientado a escritura de ficcion y prosa vivida. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Las cuantizaciones de mradermacher emplean ficheros imatrix (matriz de importancia) generados a partir del modelo base, lo que mejora la calidad de las cuantizaciones de baja precision (IQ1 a IQ4) frente a cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto creativo y narrativo: ficcion, ciencia ficcion, romance y otros generos.
- Generacion de tramas y subtramas, continuacion de escenas y construccion de historias.
- Escritura en prosa vivida ("vivid prosing"), con enfasis en descripcion y estilo literario.
- Roleplaying conversacional y personificacion de personajes.
- Generacion de codigo (el modelo lleva la etiqueta "coder", aunque el enfasis del ajuste es la escritura).
- Conversacion multi-turno (etiqueta "conversational").
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Ausencia de filtros de rechazo: genera contenido que el modelo base rechazaria (contenido adulto, violento o sensible).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agente multi-paso; no disponible.

## Casos de uso

- Escritura de ficcion asistida: el modelo esta ajustado especificamente sobre el dataset The-BradburyF451 para generar prosa narrativa, por lo que resulta adecuado para redactar capitulos, relatos cortos y novelas con estilo consistente y descriptivo.
- Generacion de tramas y subtramas: se puede usar para brainstorming estructurado de argumentos, arcos de personajes y giros argumentales, aprovechando el ajuste multi-etapa orientado a "plot generation" y "sub-plot generation".
- Continuacion de escenas y roleplay narrativo: con la etiqueta "scene continue" y "roleplaying", sirve para motores de ficcion interactiva o juegos de rol por texto donde el usuario necesita continuidad de estilo y coherencia de personajes.
- Escritura sin restricciones de contenido: para autores que trabajan generos adultos, terror explicito o tematicas sensibles, el proceso de abliteration elimina los rechazos que limitarian la generacion en modelos alineados convencionales.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (~5-6 GB) permiten ejecutar el modelo en GPUs consumer (RTX 3060 12 GB, RTX 4060 Ti 16 GB) mediante llama.cpp u Ollama, sin depender de infraestructura cloud.
- Prototipado rapido de asistentes de escritura: al ser un modelo de ~9 B con licencia Apache 2.0, se puede integrar en herramientas de edicion o plugins de procesadores de texto para sugerencias de redaccion y reescritura estilistica.
- Generacion de dialogos y guiones: util para guionistas que necesitan dialogos con tono natural y variado en generos como ciencia ficcion o romance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero como referencia; se requiere VRAM adicional para el contexto KV cache):
  - i1-IQ1_S: 2,8 GB (calidad muy baja, "for the desperate").
  - i1-IQ2_M: 3,7 GB.
  - i1-IQ3_M / i1-IQ3_S: 4,5 GB.
  - i1-IQ4_XS: 5,3 GB.
  - i1-Q4_K_M: aproximadamente 5,5-6 GB (no se indica el tamano exacto en la informacion disponible).
  - i1-Q5_K_M e i1-Q6_K: tamanos superiores, no disponibles en el extracto.
- GPU recomendadas: para cuantizaciones Q4/IQ4, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente. Para Q5/Q6 se recomienda 16 GB o mas (RTX 4080, RTX 4090). Para despliegue en servidor, A100 o H100 con el modelo en bfloat16 (~18 GB de pesos).
- Cabe en GPU consumer: si, en cuantizaciones IQ2 a Q4 con GPUs de 8-12 GB; las cuantizaciones IQ1 incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para la version bfloat16 del modelo base, transformers con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic (este) | ~8,95 B | no disponible | Escritura creativa sin filtros | Apache 2.0 | GGUF (i1) y bfloat16 |
| Modelo base Qwen 3.5 9B (referencia) | ~9 B | no disponible | Uso general alineado | no disponible | safetensors |
| Otros fine tunes "uncensored" de escritura de ~7-9 B | variable | variable | Escritura creativa sin filtros | variable | GGUF/safetensors |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa con alternativas concretas; la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Contenido sin moderacion: el proceso de abliteration/heretic elimina los rechazos de seguridad, por lo que el modelo puede generar contenido adulto, violento, ilegal o eticamente problematico. Etiquetado explicitamente como "not for all audiences".
- Riesgo de alucinacion: como todo modelo generativo de ~9 B, puede inventar hechos, citas y detalles; en escritura de ficcion esto es esperado, pero no debe usarse como fuente factual.
- Idiomas limitados: la model card solo declara ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto desconocido: no se especifica la longitud de contexto, lo que complica planificar tareas de narrativa larga o documentos extensos.
- Calidad degradada en cuantizaciones bajas: las variantes IQ1 e IQ2 (2,8-3,7 GB) pierden coherencia y calidad; el propio autor las describe como "for the desperate".
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado sin filtros traslada al usuario la responsabilidad legal y etica sobre su difusion.
- Procedencia del ajuste: al ser un fine tune comunitario sobre un modelo base no verificado en esta ficha, conviene validar el comportamiento en produccion antes de desplegarlo.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento que respalde afirmaciones de calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-i1-GGUF
- Modelo base (bfloat16): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic
- Cuantizaciones estaticas de mradermacher: https://huggingface.co/mradermacher/Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-9B-The-Bradbury-F451-Pro-Writer-Uncensored-Heretic-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/DavidAU/The-BradburyF451
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
