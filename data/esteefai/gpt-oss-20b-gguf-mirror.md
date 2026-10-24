# EsteefAi/gpt-oss-20b-GGUF-mirror

## Resumen

Este repositorio no es un modelo nuevo, sino un espejo (mirror) byte a byte del archivo `gpt-oss-20b-MXFP4.gguf` publicado por ggml-org para el modelo `openai/gpt-oss-20b` de OpenAI. El autor, EsteefAi, lo mantiene para que las instalaciones de su herramienta Philibert sigan funcionando si el repositorio original desaparece o se mueve; el SHA-256 del archivo coincide con el original y no se ha aplicado ninguna modificación. Por tanto, cualquier evaluación técnica debe remitirse al modelo base y al repositorio de ggml-org.

El modelo subyacente, gpt-oss-20b, es el miembro compacto de la familia open-weight de OpenAI: un transformer con mezcla de expertos (MoE) de 20.914.757.184 parametros totales (aproximadamente 20,9 B) y 3.6 B de parametros activos por token, disenado para inferencia local de baja latencia y cargas agenticas. Su cuantizacion nativa MXFP4 permite ejecutarlo en maquinas con 16 GB de memoria, lo que lo situa en el segmento de modelos que caben en una GPU de consumo alta o en un Apple Silicon de gama media.

Es relevante ahora porque representa la entrada de OpenAI en el ecosistema de pesos abiertos con licencia Apache 2.0, compitiendo directamente con MoE abiertos de tamano similar (Qwen3-30B-A3B, Mistral Small 3.x) en tareas de razonamiento, uso de herramientas y despliegue en el borde. Este mirror concreto tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no debe considerarse una fuente primaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la informacion del modelo base; no se detalla la configuracion de capas/expertos en la informacion proporcionada |
| Parametros totales | 20.914.757.184 (aproximadamente 20,9 B) |
| Parametros activos | 3,6 B (dato de la documentacion de OpenAI para gpt-oss-20b) |
| Longitud de contexto | 131.072 tokens (dato del modelo original; no incluido en la informacion proporcionada de este repositorio) |
| Tipos de cuantizacion | MXFP4 (unico archivo en este mirror). El repositorio original de ggml-org publica otras variantes, no detalladas en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sin cambios respecto al original) |
| Formato de pesos | GGUF (archivo `gpt-oss-20b-MXFP4.gguf`, 12,1 GB de repositorio); el modelo original se distribuye en safetensors |
| SHA-256 del archivo | `27cd6c432c7672cb812a92f611cf3ba7bbc35928262bb1e1253ff4ee6ae35901` |
| Modelo base | openai/gpt-oss-20b |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: de los 20,9 B de parametros totales solo se activan 3,6 B por token, lo que reduce el coste computacional de inferencia sin recortar drasticamente la capacidad representacional. OpenAI lo publica con cuantizacion nativa MXFP4 en los pesos, una decision que prioriza el despliegue en memoria limitada (16 GB) frente al entrenamiento en precision alta; el resultado es un checkpoint que se ejecuta practicamente sin perdida adicional por cuantizacion posterior en el caso del archivo GGUF de este mirror.

La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de alineamiento (RLHF/DPO). Si se documenta en el modelo original el uso del formato Harmony para estructurar conversaciones, con canales diferenciados para el razonamiento y niveles de esfuerzo de razonamiento configurables (bajo, medio, alto), ademas de soporte nativo de llamadas a herramientas y salidas estructuradas. Para cualquier dato de entrenamiento adicional debe consultarse la model card de `openai/gpt-oss-20b`, que no forma parte de la informacion aqui facilitada.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat basada en el formato Harmony del modelo original.
- Razonamiento explicito con niveles de esfuerzo configurables (low, medium, high) y modo de pensamiento visible separado de la respuesta final.
- Generacion y edicion de codigo, ademas de ejecucion de Python como herramienta en entornos que la habiliten.
- Tool calling / function calling y salidas estructuradas (JSON schema), orientadas a integracion en pipelines.
- Flujos agenticos de varios pasos, incluido el encadenamiento de busqueda web y ejecucion de codigo cuando el entorno lo permite.
- Capacidades multilingues: no disponibles en la informacion proporcionada (la metadata del repositorio no declara lista de idiomas).
- Capacidad de ajuste fino: no confirmada en la informacion proporcionada para esta variante GGUF; el mirror no anade ninguna modificacion.

## Casos de uso

- Asistente de codigo en local: el modelo cabe en 16 GB de memoria en MXFP4 y puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo, ofreciendo autocompletado, refactorizacion y explicacion de codigo sin enviar el codigo fuente a terceros.
- Agente de automatizacion de tareas de desarrollo: con tool calling y salidas estructuradas, se puede conectar a APIs internas (Jira, GitLab, CI/CD) para leer issues, proponer parches y abrir pull requests desde un runner autoalojado.
- Atencion al cliente con contexto largo: la ventana del modelo original (131.072 tokens) permite mantener historiales extensos y documentacion de producto inyectada en el mismo contexto sin trocear la conversacion.
- Procesamiento de documentacion tecnica: resumen y extraccion de entidades sobre manuales, contratos o informes extensos, con salida en JSON validable por esquema.
- Analisis de datos asistido: generacion de scripts de Python y de consultas SQL a partir de lenguaje natural, ejecutables en un sandbox dentro del mismo flujo agentico.
- Despliegue en el borde o en entornos air-gapped: al ser un GGUF de 12,1 GB con licencia Apache 2.0, se puede distribuir con el producto y ejecutar en equipos sin conectividad, algo inviable con APIs en la nube.
- Prototipado e investigacion: punto de partida barato para experimentos de razonamiento y evaluacion de agentes, con la posibilidad de sustituirlo por el hermano mayor (gpt-oss-120b) cambiando solo el checkpoint.
- Base para ajuste fino de dominio: no confirmado para esta variante GGUF; requeriria partir de los pesos safetensors originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio es un mirror sin evaluaciones propias y la informacion suministrada no incluye la tabla de resultados del modelo original. Para cifras de MMLU, GPQA, HumanEval, AIME u otras, debe consultarse la model card de `openai/gpt-oss-20b` y el anuncio de OpenAI.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,1 GB solo para los pesos en MXFP4; con cache KV y overhead del runtime conviene reservar 14-16 GB para contextos moderados.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o RTX 5090 para contextos largos y lotes mayores; A100/H100 si se sirve en produccion con vLLM y concurrencia.
- GPU de consumo: si cabe en 16 GB (RTX 4080, RTX 5080, RTX 4060 Ti 16 GB), aunque con margen ajustado para contextos largos; en tarjetas de 8-12 GB solo mediante cuantizaciones mas agresivas del repositorio original.
- Apple Silicon: viable en equipos con 16 GB de memoria unificada o mas mediante llama.cpp/MLX.
- CPU sola: posible con 16 GB de RAM, con latencia alta; adecuado solo para uso interactivo esporadico o pruebas.
- Opciones de despliegue: llama.cpp, Ollama (`ollama pull hf.co/EsteefAi/gpt-oss-20b-GGUF:<quant>`, segun la model card), LM Studio y vLLM (requiere una version con soporte de MXFP4).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpt-oss-20b (este mirror) | 20,9 B / 3,6 B | 131.072 tokens (modelo original) | Apache 2.0 | GGUF MXFP4 en este repo; safetensors en openai/gpt-oss-20b |
| gpt-oss-120b | 117 B / 5,1 B (dato de la documentacion de OpenAI) | 131.072 tokens (modelo original) | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3-30B-A3B | 30,5 B / 3,3 B | 128.000 tokens (extensible por YaRN) | Apache 2.0 | Pesos abiertos y multiples GGUF |
| Mistral Small 3.x (24B) | 24 B densos | 128.000 tokens | Apache 2.0 | Pesos abiertos y GGUF |

La comparacion de rendimiento entre estos modelos no puede establecerse con la informacion proporcionada, ya que no se incluyen resultados de benchmarks. La diferencia estructural mas relevante es que gpt-oss-20b es el unico de la lista con cuantizacion nativa MXFP4 en los pesos originales, lo que simplifica el despliegue en 16 GB, mientras que Qwen3-30B-A3B ofrece mas parametros totales con activacion similar y Mistral Small 3.x es un modelo denso.

## Limitaciones y advertencias

- Este repositorio es un mirror no oficial: 0 descargas, 0 likes y sin pipeline declarado. Para produccion, usar `ggml-org/gpt-oss-20b-GGUF` o `openai/gpt-oss-20b` como fuentes primarias y verificar el SHA-256 antes de desplegar.
- Solo contiene el archivo MXFP4: no hay variantes Q4_K_M, Q8_0 ni otras en este repo, lo que limita el ajuste fino de VRAM/calidad.
- La model card del mirror no documenta idiomas soportados ni evaluaciones; no se puede asumir un rendimiento multilingue homogeneo sin evaluarlo.
- Riesgo de alucinacion y de razonamiento incorrecto en cadenas largas: inherente a los modelos de esta familia; requiere validacion de salidas en produccion, especialmente en modo agentico con tool calling.
- El uso del formato Harmony implica una plantilla de chat especifica; una plantilla incorrecta degrada notablemente la calidad de las respuestas.
- Licencia Apache 2.0 para los pesos, pero el modelo original de OpenAI va acompanado de una politica de uso aceptable que conviene revisar antes de un despliegue comercial.
- El mirror puede quedar desactualizado o eliminado a discrecion del autor; no hay garantia de mantenimiento ni de soporte.
- Contexto y capacidades citados provienen del modelo original y no estan verificados en este repositorio.

## Enlaces

- Repositorio de este mirror: https://huggingface.co/EsteefAi/gpt-oss-20b-GGUF-mirror
- Repositorio original GGUF (ggml-org): https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Modelo base en Hugging Face: https://huggingface.co/openai/gpt-oss-20b
- Repositorio GitHub de la familia gpt-oss: https://github.com/openai/gpt-oss
- Documentacion del modelo en la API de OpenAI: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Mirror alternativo de referencia: https://huggingface.co/gabriellarson/gpt-oss-20b-GGUF
- Ficha en SourceForge: https://sourceforge.net/projects/gpt-oss-20b/
- Perfil del autor del mirror: https://huggingface.co/EsteefAi
