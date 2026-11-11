# johnrobert21/fiap-fase4-historias-gguf

## Resumen

El modelo `johnrobert21/fiap-fase4-historias-gguf` es una publicacion de Hugging Face con licencia Apache 2.0, distribuida exclusivamente en formato GGUF y etiquetada como compatible con endpoints y de tipo conversacional. Con 1.543.714.304 parametros (aproximadamente 1,54 mil millones), se situa en la categoria de modelos pequenos, lo que lo hace apto para inferencia en hardware de consumo. El nombre sugiere que se trata de un ajuste fino orientado a la generacion de historias ("historias"), probablemente desarrollado como parte de un proyecto academico (la referencia "fiap-fase4" apunta a una fase de un programa de formacion).

La model card publicada por el autor es practicamente vacia: solo contiene la declaracion de licencia, sin informacion sobre arquitectura base, datos de entrenamiento, idiomas soportados ni resultados de evaluacion. Esto limita severamente cualquier evaluacion rigurosa del modelo. El repositorio ocupa 1,0 GB, lo que es coherente con un modelo de ~1,5 B de parametros cuantizado en un formato de baja precision (probablemente Q4 o Q8 en GGUF).

Su relevancia actual es marginal: no registra descargas ni interacciones, y la ausencia de documentacion tecnica impide verificar su calidad, procedencia o idoneidad para produccion. Se recomienda tratarlo como un experimento academico y no como una base solida para aplicaciones reales sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. El recuento de parametros (~1,54 B) es compatible con un transformer decoder-only de escala pequena, pero no se puede confirmar si deriva de una base conocida (por ejemplo, Qwen, Llama o Gemma en esa escala) ni si incorpora variantes como grouped-query attention o mezcla de expertos. Tampoco se especifica la longitud de contexto nativa ni la tokenizacion empleada.

Respecto al entrenamiento, no hay datos sobre el numero de tokens, la composicion del corpus, el uso de tecnicas de alineacion (RLHF, DPO, SFT) ni posibles innovaciones tecnicas. El nombre del repositorio sugiere un ajuste fino para generacion de narrativa o historias, pero se trata de una inferencia a partir del identificador y no de informacion verificada. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta preparado para dialogos de tipo chat, aunque no se detalla el formato de prompt.
- Generacion de historias y narrativa: el nombre del repositorio ("historias") apunta a un ajuste orientado a la produccion de relatos, si bien no hay ejemplos ni evaluacion que lo confirmen.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia gestionadas que aceptan modelos en formato GGUF.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de generacion narrativa: dado su tamano reducido (~1,54 B) y su formato GGUF, puede ejecutarse en portatiles para experimentar con la generacion de relatos cortos y validar el formato de prompt antes de escalar a un modelo mayor.
- Demostraciones academicas: encaja en un contexto de asignatura o proyecto de fin de fase (como sugiere "fiap-fase4") para ilustrar el ciclo completo de ajuste fino, cuantizacion y publicacion en Hugging Face.
- Chatbot ligero en local: con una cuantizacion agresiva cabe en GPUs de consumo, lo que permite montar un asistente conversacional de baja latencia para entornos sin conectividad o con requisitos de privacidad.
- Generacion de textos creativos en lotes: puede usarse para producir borradores de cuentos o descripciones de forma masiva en CPU, aceptando una calidad inferior a la de modelos de mayor escala.
- Evaluacion comparativa de tecnicas de cuantizacion: al estar publicado solo en GGUF, sirve como caso de estudio para medir la degradacion de calidad entre distintos niveles de cuantizacion sobre un modelo pequeno.
- Base para ajuste fino adicional: con licencia Apache 2.0, puede servir como punto de partida para un ajuste especifico de dominio (por ejemplo, narrativa en castellano), siempre que se valide previamente su calidad base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, unos 3,1 GB de pesos (2 bytes por parametro); en cuantizacion Q8, aproximadamente 1,6 GB; en Q4, alrededor de 0,9 GB. El repositorio de 1,0 GB es coherente con una cuantizacion de 4-5 bits.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar una cuantizacion Q4 (GTX 1650, RTX 3050, RTX 4060). Para FP16 se recomienda al menos 6 GB (RTX 2060, RTX 3060).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4-8 GB de VRAM; tambien puede ejecutarse en CPU con llama.cpp a velocidades moderadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (por ejemplo, llama-cpp-python) y plataformas de endpoints que acepten este formato. vLLM y TGI no soportan GGUF de forma nativa como formato principal, por lo que requeririan conversion a safetensors.
- Latencia y throughput estimados: no disponibles. Para un modelo de ~1,5 B en Q4 sobre una RTX 4090, cabria esperar decenas de tokens por segundo, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| johnrobert21/fiap-fase4-historias-gguf | ~1,54 B | no disponible | Apache 2.0 | GGUF | Repositorio sin descargas ni documentacion |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Ampliamente usado, con model card completa |
| Llama-3.2-1B-Instruct | ~1,24 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Muy extendido, con evaluacion publicada |
| Gemma-2-2B-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Documentacion y benchmarks publicos |

La comparativa se basa en el tamano y la categoria (modelos pequenos para inferencia local), no en rendimiento medido, ya que el modelo analizado no publica resultados. Frente a las alternativas citadas, la principal desventaja es la ausencia total de documentacion tecnica y de evaluacion, asi como la falta de pesos en safetensors para despliegues con vLLM o TGI.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no hay informacion sobre arquitectura, datos de entrenamiento, contexto ni idiomas, lo que impide evaluar su idoneidad para cualquier tarea concreta.
- Riesgo elevado de alucinacion: en modelos de ~1,5 B sin alineacion documentada, la tendencia a inventar hechos es alta; no se debe usar en contextos donde la exactitud sea critica.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible anticipar sesgos de genero, etnia, idioma o dominio.
- Idiomas no declarados: se desconoce si el modelo maneja correctamente el castellano o si esta entrenado principalmente en otro idioma; el nombre sugiere espanol o portugues, pero no esta confirmado.
- Formato exclusivamente GGUF: complica el despliegue en stacks de produccion basados en vLLM o TGI, que requieren safetensors, y limita el ajuste fino posterior sin conversion.
- Sin adopcion verificable: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso real ni de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias; la responsabilidad legal y tecnica recae en quien lo despliegue.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/johnrobert21/fiap-fase4-historias-gguf
- Perfil del autor: https://huggingface.co/johnrobert21
- Paper, blog, repositorio de codigo o demo: no disponible
