# mradermacher/IronLoom-32B-v1-GGUF

## Resumen
IronLoom-32B-v1-GGUF es la distribucion en formato GGUF del modelo IronLoom-32B-v1, desarrollado originalmente por Lachesis-AI y cuantizado por mradermacher. Se trata de un modelo de lenguaje conversacional de 32.566.081.536 parametros (aproximadamente 32,6 mil millones), orientado a tareas de generacion de texto y dialogo, publicado bajo licencia MIT. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precision completa.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica de despliegue del modelo base: ofrece 11 cuantizaciones estaticas que van desde Q2_K (12,4 GB) hasta Q8_0 (34,7 GB), cubriendo desde GPUs de gama media hasta estaciones de trabajo con 48 GB o mas de VRAM. El modelo base esta etiquetado unicamente para ingles y con proposito conversacional, sin que la model card del cuantizador anada informacion sobre arquitectura interna, contexto o datos de entrenamiento.

Conviene subrayar que la informacion disponible es escasa: la model card de mradermacher es una plantilla estandar de cuantizacion y no documenta detalles tecnicos del modelo original. Por ello, varios campos de esta ficha se marcan como no disponibles, en lugar de inferirse o inventarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 32.566.081.536 (~32,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | ingles (segun etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors segun metadatos de transformers |
| Tamano del repositorio | 222,9 GB |
| Modelo base | Lachesis-AI/IronLoom-32B-v1 |
| Fecha de creacion | 2025-06-02 |
| Ultima actualizacion | 2026-11-13 |
| Descargas | 16 |
| Likes | 0 |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo original IronLoom-32B-v1: la model card del cuantizador no la documenta y los metadatos solo indican `transformers` como libreria. El recuento de parametros (32.566.081.536) y el tamano de las cuantizaciones son coherentes con un transformer denso de aproximadamente 32 B de parametros, pero no se confirma ni el tipo exacto de atencion, ni si emplea mezcla de expertos, ni la composicion del dataset de entrenamiento.

Tampoco hay datos publicados sobre el numero de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Lo unico documentado por el cuantizador es el proceso de conversion: cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato Hugging Face, con un conjunto de cuantizaciones ponderadas/imatrix disponibles en un repositorio separado (`IronLoom-32B-v1-i1-GGUF`).

## Capacidades
- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de texto general propia de un modelo de ~32 B, aunque sin documentacion oficial que lo confirme mas alla de la etiqueta.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun las etiquetas; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.

## Casos de uso
- Despliegue local de un modelo de 32 B en una sola GPU de consumo: con la cuantizacion Q4_K_M (19,8 GB) cabe en GPUs de 24 GB como la RTX 4090, permitiendo prototipado y experimentacion sin infraestructura en la nube.
- Asistente conversacional en ingles autoalojado: el modelo esta etiquetado como conversacional y puede servir de base para un chatbot de dominio interno, con la ventaja de que la licencia MIT permite uso comercial sin restricciones de atribucion mas alla de la propia licencia.
- Generacion de texto por lotes en pipelines offline: el formato GGUF y llama.cpp permiten ejecutar inferencia en CPU o en configuraciones hibridas CPU/GPU, util para procesar grandes volumenes de documentos sin depender de APIs externas.
- Fine-tuning o adaptacion posterior: al disponer del modelo base en safetensors bajo licencia MIT, es posible ajustar el modelo con datos propios y volver a cuantizar para despliegue, aunque el ajuste requiere hardware muy superior (varios A100/H100).
- Investigacion sobre cuantizacion: el repositorio ofrece 11 variantes estaticas y un conjunto imatrix, lo que permite estudiar el impacto de la cuantizacion en la calidad para un modelo de 32 B concreto.
- Evaluacion comparativa de modelos abiertos: util para investigadores que necesiten un modelo de 32 B con licencia permisiva como referencia en estudios de rendimiento o de sesgos en ingles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los metadatos incluyen datos de MMLU, HumanEval, GSM8K u otras evaluaciones, ni del modelo base ni de las cuantizaciones.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: 12,4 GB
  - Q3_K_S: 14,5 GB
  - Q3_K_M: 16,0 GB
  - Q3_K_L: 17,3 GB
  - IQ4_XS: 17,9 GB
  - Q4_K_S: 18,8 GB
  - Q4_K_M: 19,8 GB
  - Q5_K_S: 22,6 GB
  - Q5_K_M: 23,2 GB
  - Q6_K: 26,8 GB
  - Q8_0: 34,7 GB
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM (RTX 3090, RTX 4090) usando cuantizaciones hasta Q5_K_M aproximadamente; Q6_K y Q8_0 requieren 32-48 GB o descarga parcial a CPU.
- GPUs recomendadas: RTX 4090 o RTX 3090 para cuantizaciones Q4-Q5; A100 40/80 GB o H100 para Q8_0 o para el modelo base en precision completa.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp), asi como servidores compatibles con GGUF; el modelo base admite transformers y, previsiblemente, vLLM o TGI en formato safetensors (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo que permitan una comparativa rigurosa. A modo orientativo por tamano y licencia:

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| IronLoom-32B-v1-GGUF | ~32,6 B | no disponible | MIT | GGUF | no disponible |
| Modelos densos de ~32 B con licencia permisiva | ~32 B | variable | variable | safetensors/GGUF | no disponible para este modelo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada modelos directamente comparables con datos verificables; la comparativa queda pendiente de benchmarks publicados por el autor original.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos web en ingles, es probable que herede sesgos presentes en esos corpus, aunque no hay confirmacion oficial.
- Riesgo de alucinacion: no cuantificado ni evaluado en la informacion disponible; debe asumirse el riesgo habitual de los modelos generativos de este tamano.
- Limitacion de idioma: el modelo esta etiquetado solo para ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto: desconocida, lo que impide planificar tareas de contexto largo con garantias.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero se aplica al artefacto publicado; conviene verificar que el modelo base Lachesis-AI/IronLoom-32B-v1 tenga la misma licencia (los metadatos indican MIT).
- Caveat de produccion: al ser una cuantizacion, las versiones de baja precision (Q2_K, Q3_K_M) pueden degradar la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima calidad.
- Falta de documentacion: la ausencia de model card detallada del modelo original dificulta la evaluacion de riesgos y la trazabilidad del entrenamiento.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/IronLoom-32B-v1-GGUF
- Modelo base: https://huggingface.co/Lachesis-AI/IronLoom-32B-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/IronLoom-32B-v1-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#IronLoom-32B-v1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
