# Kujohi/gemma4-12b-412b-GGUF

## Resumen

Kujohi/gemma4-12b-412b-GGUF es un modelo de lenguaje y visión (vision-language model) publicado en Hugging Face por el usuario Kujohi, derivado de la familia Gemma 4 de Google y ajustado mediante Unsloth. Se distribuye exclusivamente en formato GGUF, empaquetado para su uso con llama.cpp y llama-cpp, con un archivo principal de cuantización Q4_K_M y un proyector multimodal F16 (`mmproj`) que habilita la entrada de imágenes. El repositorio tiene 7,5 GB y registra 11.907.350.576 parámetros según los datos de safetensors, lo que lo sitúa en la gama de 12B.

El modelo resuelve el caso de uso de inferencia local y despliegue ligero de un VLM conversacional: al estar en GGUF, puede ejecutarse en CPU o en GPU de consumo mediante llama.cpp, sin necesidad de infraestructura de servidor dedicada. La nomenclatura "412b" del identificador no se corresponde con el recuento real de parámetros y no está explicada en la model card; el dato verificable es el de 11,9B parámetros.

La información publicada por el autor es mínima: no se detallan datos de entrenamiento, licencia, idiomas soportados ni resultados de benchmarks. Esta ficha recoge lo verificable y marca explícitamente como "no disponible" todo aquello que la model card no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4_unified`; se infiere transformer multimodal de la familia Gemma 4, sin confirmar por el autor) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo principal) y F16 para el proyector multimodal `mmproj` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); incluye `gemma-4-12B-it.Q4_K_M.gguf` y `gemma-4-12B-it.F16-mmproj.gguf` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las etiquetas del repositorio incluyen `gemma4_unified` y `vision-language-model`, y el autor indica que el modelo fue ajustado (finetuned) y convertido a GGUF con Unsloth. La presencia de un archivo `mmproj` en F16 confirma un diseño multimodal con proyector de visión separado, consumible por `llama-mtmd-cli`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación.

Tampoco se documentan innovaciones técnicas concretas (atención lineal, decodificación especulativa, modo thinking, etc.). El único dato técnico aportado por el autor es que el entrenamiento se realizó "2x faster with Unsloth", lo que hace referencia a la herramienta de ajuste eficiente y no a una característica del modelo en inferencia.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el sufijo `-it` del archivo de pesos.
- Procesamiento de imágenes: el archivo `mmproj` en F16 habilita entrada multimodal mediante `llama-mtmd-cli`.
- Compatibilidad con `llama.cpp` y `llama-cli`, incluyendo plantillas de chat Jinja (`--jinja`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso tras una API compatible con OpenAI, sin más detalle por parte del autor.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Inferencia local de un VLM conversacional: ejecución con `llama-mtmd-cli` en una estación de trabajo para responder preguntas sobre imágenes sin enviar datos a un servicio externo, aprovechando el formato GGUF y el proyector F16 incluido.
- Prototipado rápido en CPU: el archivo Q4_K_M de aproximadamente 7 GB permite arrancar un asistente multimodal en equipos sin GPU dedicada, útil para pruebas de concepto y demos internas.
- Descripción y análisis de imágenes en local: al disponer de `mmproj`, se puede usar para tareas de captioning o extracción de información de capturas y documentos escaneados, siempre que se valide la calidad con datos propios.
- Integración en pipelines de llama.cpp: al ser compatible con `llama-cli` y plantillas Jinja, encaja en scripts y flujos existentes basados en llama.cpp para generación de texto por lotes.
- Despliegue tras una API compatible con OpenAI: la etiqueta `endpoints_compatible` permite probarlo como backend en herramientas que esperan ese contrato, sujeto a verificación del comportamiento real.
- Evaluación comparativa de modelos Gemma 4 ajustados: sirve como referencia para medir el efecto del ajuste de Unsloth frente a los pesos originales, en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 7 GB, por lo que la inferencia completa requiere del orden de 8 GB de VRAM o de RAM si se ejecuta en CPU; el proyector `mmproj` en F16 añade una carga adicional no cuantificada en la model card.
- GPU recomendadas: no disponibles. Por tamaño, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían alojar el modelo cuantizado con holgura; A100 y H100 son sobredimensionadas para este tamaño.
- GPU de consumo: sí, cabe en tarjetas con 8 GB o más en cuantización Q4_K_M, aunque el margen para contexto largo es limitado.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal); compatibilidad declarada con endpoints. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kujohi/gemma4-12b-412b-GGUF | 11,9B | no disponible | GGUF | no disponible | Ajuste comunitario de Gemma 4 con Unsloth; VLM |
| Gemma 4 12B original (Google) | ~12B | no disponible en esta ficha | safetensors, GGUF | licencia Gemma (no verificada aquí) | Modelo base de referencia del que deriva este ajuste |
| Gemma 3 12B (Google) | ~12B | 128K (según documentación pública de Gemma 3) | safetensors, GGUF | licencia Gemma | Generación anterior de la familia, comparable en tamaño |

La comparativa con alternativas de la misma categoría queda limitada porque la model card no aporta datos de contexto, licencia ni rendimiento del modelo evaluado. Los datos de Gemma 3 se incluyen como referencia de la familia y no deben atribuirse a este repositorio.

## Limitaciones y advertencias

- La model card no documenta la licencia; no se puede confirmar el uso comercial sin consultar la licencia de Gemma 4 subyacente y los términos del ajuste.
- No hay información sobre sesgos, datos de entrenamiento ni proceso de alineación, lo que impide evaluar riesgos de sesgo y de alucinación.
- El identificador "412b" no coincide con los 11,9B parámetros reales; conviene no interpretarlo como tamaño del modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Solo se publica una cuantización Q4_K_M; no hay versiones Q5, Q8 ni F16 completas para comparar pérdida de calidad.
- No se especifican idiomas soportados ni longitud de contexto, por lo que el comportamiento multilingüe y en contextos largos no está garantizado.
- Al ser un ajuste comunitario, puede diferir del Gemma 4 original en calidad y comportamiento; se recomienda evaluarlo con datos propios antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Kujohi/gemma4-12b-412b-GGUF
- Unsloth (herramienta de ajuste citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime implicado por el formato GGUF): no enlazado en la model card, disponible en su repositorio oficial de GitHub.
