# inferencerlabs/Ornith-1.5-397B-MLX-Q9

## Resumen

Ornith-1.5-397B es un modelo de lenguaje multimodal de gran escala desarrollado por Ornith AI, con una arquitectura de mezcla de expertos (MoE) de 397 mil millones de parámetros. Este modelo destaca por su enfoque de auto-mejora (self-improvement) y auto-andamiaje (self-scaffolding), que le permite proponer nuevas tareas, generar estructuras de razonamiento específicas y producir soluciones para entrenamiento por refuerzo, creando un ciclo continuo de aprendizaje. La versión aquí descrita, Ornith-1.5-397B-MLX-Q9, es una cuantización en formato MLX con precisión Q9 (9 bits por peso), que según el autor alcanza una precisión casi idéntica al modelo original (token accuracy del 97,95% frente al 100% del modelo base).

El modelo está diseñado para tareas de razonamiento avanzado, generación de código y procesamiento de imágenes y texto, con soporte para conversaciones multimodales. Su tamaño y requisitos de memoria lo sitúan en el segmento de modelos de gran escala, pensado para entornos con hardware de alta capacidad, como el Apple M3 Ultra con 512 GiB de RAM unificada, donde se ha medido una velocidad de inferencia de aproximadamente 25,3 tokens por segundo. La cuantización Q9 reduce la huella de memoria a unos 415 GiB, lo que permite su ejecución en estaciones de trabajo de gama alta, aunque sigue siendo un modelo exigente en recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), basada en Qwen3.5-MoE (segun tag) |
| Parametros totales | 397 mil millones (397B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4.5, q5.5, q6.5, q8.5, q9 (esta version usa q9) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-397B emplea una arquitectura de mezcla de expertos (MoE), como indica el tag `qwen3_5_moe` en su repositorio. Esta arquitectura permite activar solo un subconjunto de los parámetros totales durante la inferencia, lo que reduce el coste computacional en comparación con un modelo denso del mismo tamaño. Sin embargo, los detalles exactos sobre el número de expertos, la dimensión de los estados ocultos o el número de capas no se han proporcionado en la información disponible.

El entrenamiento se basa en el marco de auto-andamiaje y auto-mejora introducido en Ornith-1.0. Según la documentación oficial, el modelo propone nuevas tareas, genera andamios específicos para cada tarea y produce soluciones para entrenamiento por refuerzo, creando un bucle continuo de autoaprendizaje. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La cuantización Q9 se realizó con una versión modificada de MLX, y según las métricas del autor, esta precisión mantiene una perplexidad de 1,21093 frente a 1,20312 del modelo base, con una divergencia de tokens perdidos del 9,61%.

## Capacidades

- Generacion de texto y razonamiento avanzado, con capacidad para resolver problemas complejos de logica y matematicas.
- Generacion de codigo en multiples lenguajes, orientado a tareas de programacion agente (agentic coding).
- Procesamiento de imagenes y texto (pipeline `image-text-to-text`), lo que permite entrada multimodal y generacion de respuestas textuales basadas en imagenes.
- Soporte de conversaciones multi-turno, adecuado para asistentes y chatbots.
- Capacidad de auto-mejora y auto-andamiaje, que le permite generar sus propias tareas y estructuras de razonamiento para entrenamiento por refuerzo.
- Soporte de tool calling y function calling, aunque no se detalla en la informacion proporcionada, es comun en modelos de esta categoria.
- Capacidades multilingues limitadas al ingles segun la model card, aunque podria soportar otros idiomas de forma implicita.

## Casos de uso

- Desarrollo de agentes de codigo autonomos: el modelo puede generar, revisar y depurar codigo en entornos de desarrollo integrados, gracias a su capacidad de razonamiento y generacion de codigo. Su arquitectura MoE permite manejar tareas complejas con un coste computacional razonable.
- Asistencia en investigacion cientifica: puede analizar articulos, resumir resultados y proponer hipotesis, aprovechando su capacidad de razonamiento y procesamiento de texto largo.
- Analisis de imagenes medicas o tecnicas: al ser multimodal, puede interpretar imagenes y proporcionar descripciones o diagnosticos preliminares, siempre bajo supervision humana.
- Generacion de documentacion tecnica: puede crear manuales, guias y documentacion de API a partir de especificaciones o codigo fuente, reduciendo el tiempo de redaccion.
- Automatizacion de atencion al cliente: con su capacidad de conversacion multi-turno, puede gestionar consultas complejas de usuarios, manteniendo el contexto durante largas interacciones.
- Entrenamiento de modelos mas pequenos: gracias a su capacidad de auto-mejora, puede generar datos sinteticos de alta calidad para destilar conocimiento en modelos mas ligeros, un caso de uso comun en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia es una puntuacion estimada de 68,5/100 en BenchLM.ai, que lo situa en el puesto 20 de 221 modelos, pero se trata de una estimacion sin datos detallados. La model card del autor solo incluye metricas de cuantizacion (perplexity, token accuracy y missed divergence) comparando la version Q9 con el modelo base, pero no hay resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 415,4 GiB con cuantizacion Q9, segun la medicion del autor en un M3 Ultra de 512 GiB.
- GPU recomendadas: el modelo esta pensado para hardware de gran capacidad, como Apple M3 Ultra (512 GiB) o clusters de GPUs con memoria unificada. No cabe en GPUs de consumo (RTX 4090, etc.) debido a su tamano.
- Opciones de despliegue: al estar en formato MLX, es compatible con el ecosistema MLX de Apple (mlx-lm, etc.). Tambien podria ejecutarse con vLLM o TGI si se convierte a otros formatos, pero no se indica en la informacion.
- Latencia y throughput: se ha medido una velocidad de ~25,3 tokens/s en M3 Ultra con 512 GiB, generando 1000 tokens. No hay datos para otros hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El modelo es de 397B parametros, lo que lo situa en la categoria de modelos de gran escala como Llama 3.1 405B o Mixtral 8x22B, pero no se han publicado datos comparativos de rendimiento en benchmarks estandar. La licencia y disponibilidad tampoco estan claras, por lo que no es posible establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo entrenado con datos de internet, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados o de actualidad.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que se desconoce su capacidad para manejar documentos muy largos.
- Restricciones de licencia: la licencia no esta disponible, lo que impide conocer si su uso comercial esta permitido. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Requisitos de hardware muy elevados: necesita mas de 400 GiB de memoria, lo que limita su despliegue a entornos con hardware especializado.
- Idioma: la model card indica solo ingles, por lo que su rendimiento en otros idiomas puede ser inferior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inferencerlabs/Ornith-1.5-397B-MLX-Q9
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Coleccion de Ornith AI: https://huggingface.co/collections/ornith-ai/ornith-15
- Pagina oficial de Ornith AI: https://ornith.ai/ornith_1_5.html
- Guia de Ornith AI: https://ornith.online/
- Benchmarks estimados: https://benchlm.ai/models/ornith-1-5-397b
