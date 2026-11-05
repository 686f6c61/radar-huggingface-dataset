# mradermacher/Cydonia-24B-v2-GGUF

## Resumen

Cydonia-24B-v2-GGUF es la distribucion en formato GGUF del modelo Cydonia-24B-v2, desarrollado originalmente por TheDrummer y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 23.570 millones de parametros (23,57 B), orientado a generacion de texto y conversacion en ingles, que se publica en una amplia gama de cuantizaciones estaticas para facilitar su ejecucion en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta publicacion no esta en el modelo base en si, sino en el trabajo de cuantizacion: mradermacher ofrece once variantes que van desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB), cubriendo el espectro completo entre maxima compresion y maxima fidelidad. Esto permite desplegar un modelo de casi 24 B en GPUs consumer con 12-24 GB de VRAM, algo imposible con los pesos originales en precision completa.

El modelo esta etiquetado exclusivamente para ingles y su licencia es "other", lo que obliga a revisar los terminos del modelo base antes de cualquier uso comercial. No se dispone de informacion publica sobre arquitectura interna, contexto nativo ni datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun el pipeline de transformers; detalles no publicados) |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | other (hereda la del modelo base TheDrummer/Cydonia-24B-v2) |
| Formato de pesos | GGUF (cuantizaciones estaticas); existen tambien quants imatrix en mradermacher/Cydonia-24B-v2-i1-GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los metadatos indican que se ejecuta mediante la libreria transformers y que es un modelo de lenguaje de 23,57 B de parametros. No se especifica si emplea atencion completa, atencion lineal, arquitectura MoE o alguna variante hibrida, ni se documentan innovaciones tecnicas concretas.

Respecto al entrenamiento, la model card del repositorio GGUF no incluye datos sobre numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni procesos de ajuste fino. Toda esta informacion corresponderia al modelo base TheDrummer/Cydonia-24B-v2, cuya model card no forma parte de la informacion suministrada. La unica informacion tecnica adicional es la relativa al proceso de cuantizacion: se trata de quants estaticos (quantize_version 2, output_tensor_quantised 1, convert_type hf) generados a partir de los pesos en formato Hugging Face.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado exclusivamente para este idioma, sin indicios de capacidades multilingues.
- Conversacion multi-turno: el formato GGUF y la naturaleza del modelo base sugieren uso como asistente conversacional, aunque no se documentan capacidades especificas de razonamiento o codigo.
- Ejecucion local: compatible con llama.cpp y todas las herramientas que consumen GGUF (Ollama, LM Studio, KoboldCpp, text-generation-webui, entre otras).
- Cuantizacion flexible: once variantes permiten ajustar el equilibrio entre calidad, velocidad y consumo de memoria.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo thinking: no documentado.

## Casos de uso

- Asistente conversacional local: con la cuantizacion Q4_K_M (14,4 GB) el modelo cabe en GPUs de 16 GB o en configuraciones con offload parcial a CPU, permitiendo un chatbot privado en ingles sin dependencia de la nube.
- Generacion de texto creativo y narrativa: la familia Cydonia de TheDrummer se orienta historicamente a escritura creativa y roleplay; las variantes Q5_K_M y Q6_K (16,9 y 19,4 GB) preservan mejor el estilo y la coherencia en textos largos.
- Prototipado rapido en estaciones de trabajo: la variante Q4_K_S (13,6 GB) esta marcada como "fast, recommended" y sirve para iterar sobre prompts y flujos conversacionales con baja latencia en una RTX 4090 o similar.
- Despliegue en entornos con VRAM limitada: Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten ejecutar un modelo de 24 B en GPUs de 12 GB como la RTX 3060 o la RTX 4070, a costa de perdida de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye el grafico de perplejidad de ikawrakow y referencias a analisis de Artefact2, utiles para investigadores que estudien el impacto de la cuantizacion en modelos de ~24 B.
- Fine-tuning sobre la marcha o pipelines de generacion por lotes: la variante Q8_0 (25,2 GB) ofrece la maxima fidelidad respecto a los pesos originales para tareas donde la calidad prima sobre el rendimiento, ejecutable en A100 40 GB o H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un grafico externo de perplejidad comparativa entre tipos de cuantizacion (https://www.nethype.de/huggingface_embed/quantpplgraph.png) y un analisis de Artefact2 sobre calidad de quants, pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni similares para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~9,0 GB
  - Q3_K_S: ~10,5 GB
  - Q3_K_M: ~11,6 GB
  - Q3_K_L: ~12,5 GB
  - IQ4_XS: ~13,0 GB
  - Q4_K_S: ~13,6 GB
  - Q4_K_M: ~14,4 GB
  - Q5_K_S: ~16,4 GB
  - Q5_K_M: ~16,9 GB
  - Q6_K: ~19,4 GB
  - Q8_0: ~25,2 GB
- GPU consumer compatibles:
  - RTX 3060 12 GB / RTX 4070 12 GB: Q2_K y Q3_K_S con contexto moderado.
  - RTX 4060 Ti 16 GB / RTX 4080 16 GB: Q4_K_M y Q5_K_S con margen para contexto.
  - RTX 4090 24 GB: Q6_K y Q8_0 (Q8_0 al limite, con contexto corto).
- GPU profesionales: A100 40 GB, H100 80 GB y L40S 48 GB ejecutan sin problema Q8_0 con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cydonia-24B-v2-GGUF (este) | 23,57 B | no disponible | other | GGUF | 11 cuantizaciones estaticas, solo ingles |
| TheDrummer/Cydonia-24B-v2 (base) | 23,57 B | no disponible | other | safetensors | Pesos originales, requiere transformers |
| mradermacher/Cydonia-24B-v2-i1-GGUF | 23,57 B | no disponible | other | GGUF (imatrix) | Quants ponderados, mayor calidad por tamano |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con modelos de la misma categoria (por ejemplo, Mistral Small 24B o Gemma 2 27B). La comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- Solo ingles: el modelo esta etiquetado exclusivamente para este idioma; el rendimiento en castellano no esta garantizado.
- Licencia "other": no es una licencia estandar (Apache 2.0, MIT, Llama); es imprescindible revisar los terminos del modelo base TheDrummer/Cydonia-24B-v2 antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas de fidelidad factual.
- Perdida de calidad en cuantizaciones bajas: Q2_K y Q3_K_M estan marcadas como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Contexto desconocido: no se documenta la longitud de contexto nativa, lo que dificulta planificar despliegues con ventanas largas.
- Sin soporte documentado de tool calling ni agentes: no se recomienda asumir estas capacidades sin validacion previa.
- Repositorio de 161,4 GB: descargar el repo completo es costoso; conviene bajar unicamente el archivo GGUF de la variante deseada.
- Fecha de actualizacion futura (2026-11-05): el metadato de actualizacion es posterior a la fecha actual, lo que puede indicar una re-subida o un error de metadatos; conviene verificar el estado del repositorio antes de integrarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cydonia-24B-v2-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Cydonia-24B-v2
- Quants imatrix: https://huggingface.co/mradermacher/Cydonia-24B-v2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Cydonia-24B-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
