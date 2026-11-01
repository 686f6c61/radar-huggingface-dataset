# mattashiho/dango-A1

## Resumen

Dango-A1 es un modelo de lenguaje de 1.867 millones de parametros (1.8B) desarrollado por Shiho Matta (usuario `mattashiho` en HuggingFace), supervisado con fine-tuning (SFT) sobre lecciones de aprendizaje de ingles como segunda lengua (L2) de nivel A1 del Marco Comun Europeo de Referencia. Parte del modelo base Dango-pretrained (`dango-1.8b-100Btok`), un modelo preentrenado exclusivamente en japones sobre 100.000 millones de tokens de un corpus japones filtrado de forma extensiva.

El modelo no esta pensado como un asistente generalista ni como un modelo de produccion, sino como una herramienta de investigacion sobre adquisicion de segundas lenguas: simula el comportamiento linguistico de un hablante japones aprendiendo ingles en nivel A1. Arquitectonicamente es comparable a la familia llm-jp-3, que adopta una arquitectura decoder de estilo Llama 2.

Su relevancia es acotada pero especifica: ofrece un punto de partida reproducible para estudiar como un modelo preentrenado en un solo idioma (japones) se adapta mediante SFT a tareas de aprendizaje de un segundo idioma (ingles), con codigo de filtrado y entrenamiento publicado en GitHub. La licencia del checkpoint SFT tiene una restriccion critica: los datos de instruccion Ichikara empleados prohiben el uso comercial de los modelos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer de estilo Llama 2 (comparable a llm-jp-3) |
| Parametros totales | 1.867.614.208 (1.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | CC BY 4.0 para codigo y modelo preentrenado; el checkpoint SFT (este repo) queda restringido por los datos Ichikara, que prohiben el uso comercial de modelos derivados |
| Formato de pesos | safetensors (tamano del repo: 3.7 GB) |

## Arquitectura y entrenamiento

Dango-A1 sigue una arquitectura decoder transformer de estilo Llama 2, equivalente en diseno a la familia llm-jp-3 (referencia explicita a `llm-jp-3-1.8b` en la model card). El modelo base Dango-pretrained se entreno sobre 100.000 millones de tokens de un corpus japones sometido a un filtrado extensivo; el codigo de filtrado y de entrenamiento esta disponible en el repositorio GitHub del autor.

Sobre ese modelo base se aplico un supervised fine-tuning (SFT) utilizando lecciones de aprendizaje de ingles como segunda lengua de nivel A1. No se especifica en la informacion disponible el volumen de tokens de SFT, la composicion exacta del dataset de lecciones, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o attention linear.

## Capacidades

- Generacion de texto en japones e ingles, con foco en patrones linguisticos propios de un aprendiz de nivel A1.
- Simulacion de hablante japones de ingles como segunda lengua (Japanese-English speaker simulator), util para estudiar errores y patrones de interlengua.
- Fine-tuning supervisado orientado a tareas de aprendizaje de idiomas (formato de lecciones A1).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues limitadas a japones e ingles segun la model card.

## Casos de uso

- Investigacion en adquisicion de segundas lenguas: el modelo permite generar producciones linguisticas que imitan a un aprendiz A1 y compararlas con corpus reales de aprendices para estudiar patrones de interlengua.
- Simulacion de hablante japones de ingles: util para generar dialogos o respuestas de prueba en entornos de evaluacion de materiales didacticos dirigidos a hablantes de japones.
- Evaluacion de pipelines de SFT: al estar publicado el codigo de filtrado y entrenamiento, sirve como referencia reproducible para experimentos de fine-tuning sobre modelos preentrenados en un solo idioma.
- Generacion de ejemplos de nivel A1: produccion de textos y ejercicios sencillos en ingles alineados con el nivel A1 para prototipos de herramientas educativas.
- Estudio de transferencia cross-linguistica: analisis de como un modelo preentrenado solo en japones transfiere capacidades al ingles tras el SFT.
- Baseline academico: punto de comparacion en papers sobre modelos japoneses de tamano reducido (1.8B) frente a alternativas como llm-jp-3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3.7 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion practica de 5-6 GB en GPU).
- En cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: el repo solo publica safetensors, por lo que es necesario convertirlos a GGUF para llama.cpp u Ollama; vLLM y TGI pueden cargar safetensors directamente. No se documentan configuraciones oficiales de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dango-A1 | 1.8B | No disponible | ja, en | CC BY 4.0 con restriccion comercial por datos Ichikara | HuggingFace (18 descargas) |
| llm-jp-3-1.8b | 1.8B | No disponible en esta ficha | ja (principalmente) | No disponible en esta ficha | HuggingFace (llm-jp) |
| Dango-pretrained (dango-1.8b-100Btok) | 1.8B | No disponible | ja | CC BY 4.0 | HuggingFace (modelo base del autor) |

La comparacion directa con llm-jp-3-1.8b es la mas pertinente por la equivalencia arquitectonica declarada por el autor. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Restriccion de licencia critica: el checkpoint SFT se entreno con datos de instruccion Ichikara, que prohiben el uso comercial de modelos derivados. Aunque la model card indica CC BY 4.0 de forma general, el uso comercial de este checkpoint no esta permitido.
- Modelo de investigacion: disenado para estudiar adquisicion de segundas lenguas, no como asistente generalista; su utilidad fuera de ese dominio es limitada.
- Nivel linguistico restringido: el SFT se realizo exclusivamente sobre lecciones de nivel A1, por lo que las respuestas en ingles pueden reflejar competencia elemental y errores propios de ese nivel.
- Riesgo de alucinacion: no documentado por el autor, pero esperable en un modelo de 1.8B con SFT acotado.
- Sesgos conocidos: no documentados en la informacion disponible; el preentrenamiento en un corpus japones filtrado puede introducir sesgos propios de esa fuente.
- Longitud de contexto no documentada, lo que impide planificar tareas de contexto largo.
- Comunidad y soporte minimos: 18 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en HuggingFace.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que anade trabajo manual para despliegues en llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattashiho/dango-A1
- Modelo base Dango-pretrained: https://huggingface.co/mattashiho/dango-1.8b-100Btok
- Repositorio GitHub (codigo de filtrado y entrenamiento): https://github.com/mattashiho233/dango
- Referencia arquitectonica llm-jp-3-1.8b: https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Fuente de datos Ichikara (LLM no tame no Nihongo Instruction Data): https://liat-aip.sakura.ne.jp/wp/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf%e4%bd%9c%e6%88%90/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf-%e5%85%ac%e9%96%8b/
- Cita academica: Matta et al., "Pretraining a Japanese-Only Large Language Model for Studying Second Language Acquisition", Proceedings of the 32nd Annual Meeting of the Association for Natural Language Processing (ANLP 2026), paginas 3225-3230, Utsunomiya, Japon.
