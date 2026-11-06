# Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-Search

## Resumen

RSIPO-SFT-Qwen2.5-3B-Instruct-Search es un ajuste fino (SFT) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario Karl28 en Hugging Face. Se trata del checkpoint exacto de la etapa 1 (Stage-1 SFT) empleado para inicializar un entrenamiento de aprendizaje por refuerzo RSIPO (*Recursive Self-Improving Policy Optimization*) orientado a tareas de pregunta-respuesta con búsqueda (search-based QA). No es, por tanto, una política final de RSIPO, sino el punto de partida de ese proceso de RL de 150 pasos.

Su relevancia radica en el marco RSIPO, descrito en el paper de arXiv 2610.15772, que propone la co-evolución de política y habilidades (*skill-policy co-evolution*) para aprendizaje agéntico por refuerzo: el modelo base genera trayectorias sobre tareas de entrenamiento, un modelo más grande (GLM-5.2) redacta resúmenes de episodio y habilidades reutilizables, y el modelo pequeño se ajusta para producir esos análisis. Es un artefacto dirigido principalmente a investigadores que quieran reproducir o extender el pipeline RSIPO, con arquitectura transformer basada en Qwen2.5 y unos 3.400 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2.5), decodificador autorregresivo |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del Qwen2.5-3B-Instruct base es 32.768 tokens, pero no figura en la model card) |
| Tipos de cuantizacion | no disponible (los pesos del repositorio estan en FP32; la configuracion de exportacion declara bfloat16) |
| Idiomas soportados | Ingles (etiquetado oficialmente como `en`) |
| Licencia | Qwen Research License (investigacion y evaluacion; uso comercial requiere licencia de Alibaba Cloud) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de Qwen/Qwen2.5-3B-Instruct, un transformer decodificador de 3,4 mil millones de parametros. El procedimiento de Stage-1 SFT consiste en: el modelo base recoge 8 trayectorias por cada una de 500 tareas de entrenamiento de search-based QA; GLM-5.2 escribe un resumen de episodio y una habilidad reutilizable (*skill*) para cada trayectoria; y el modelo se ajusta para generar esos analisis durante 3 epocas, con tasa de aprendizaje 5e-6 y tamano global de batch 8.

El conjunto de datos empleado es Karl28/RSIPO-SFT-Data (configuracion `qwen25-3b-search`), con 3.598 ejemplos de entrenamiento y 400 de validacion. El repositorio de datos incluye las trayectorias completas y sus anotaciones de resumen/habilidad. Tras este SFT, el checkpoint se utiliza como inicializacion para 150 pasos de entrenamiento RL bajo el esquema RSIPO, cuyo resultado final se publica en el checkpoint separado `Karl28/RSIPO-Qwen2.5-3B-Instruct-Search`.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, heredado del modelo base instruct).
- Produccion de resumenes de episodio y habilidades reutilizables a partir de trayectorias agenticas de busqueda, que es la capacidad para la que fue ajustado.
- Comportamiento de agente de busqueda (search-agent) para tareas de pregunta-respuesta con recuperacion, dentro del framework RSIPO.
- Punto de partida para entrenamiento por refuerzo agéntico (compatible con los launchers de RSIPO en bfloat16).
- No hay indicios de capacidades de vision, audio ni tool calling nativo documentados en la model card.

## Casos de uso

- Investigacion en aprendizaje por refuerzo agéntico: sirve como checkpoint de inicializacion reproducible para lanzar el entrenamiento RSIPO con el script `scripts/rsipo/run_rsipo.sh search`, ideal para replicar los experimentos del paper.
- Estudio de co-evolucion skill-politica: permite analizar como los resumenes de episodio y habilidades generados por un modelo grande (GLM-5.2) destilados en un modelo pequeno mejoran el comportamiento agéntico.
- Pregunta-respuesta con busqueda (search-based QA): el modelo esta especializado en tareas donde debe razonar sobre resultados de un recuperador externo, util como baseline en sistemas RAG agenticos.
- Generacion de datos sinteticos anotados: puede emplearse para producir resumenes y habilidades sobre nuevas trayectorias, ampliando datasets tipo RSIPO-SFT-Data.
- Comparacion de checkpoints en ablation studies: al ser el estado previo al RL, permite medir la contribucion exacta de los 150 pasos de RSIPO frente al SFT puro.
- Destilacion de capacidades agenticas en modelos pequenos: caso de estudio de como transferir razonamiento de un modelo grande a uno de 3B mediante SFT sobre trayectorias anotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, GSM8K, ni metricas de QA con busqueda) para este checkpoint SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: los safetensors del repositorio estan en FP32, lo que implica unos 13,6 GB de pesos (coincide con el tamano del repo); en FP32 se recomiendan al menos 16-20 GB de VRAM. En bfloat16 (configuracion usada por los launchers de RSIPO), unos 7 GB, mas espacio para contexto y KV cache.
- GPU recomendadas: una RTX 4090 (24 GB) o A100/RTX 3090 son suficientes para inferencia en bfloat16; para FP32 o entrenamiento RL, A100 u H100.
- Consumer GPUs: cabe comodamente en una RTX 3090 o RTX 4090 en bfloat16; en FP32 requiere GPUs de gama alta con 24 GB o mas.
- Despliegue: compatible con la libreria `transformers` de Hugging Face (etiquetas `text-generation-inference` y `endpoints_compatible`); el uso documentado es la descarga con `hf download` y ejecucion mediante los scripts de RSIPO. No se menciona soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Proposito | Licencia |
|---|---|---|---|---|
| RSIPO-SFT-Qwen2.5-3B-Instruct-Search | 3.397 M | Qwen2.5-3B-Instruct | Checkpoint SFT Stage-1 para RL agéntico (search QA) | Qwen Research (no comercial) |
| Qwen/Qwen2.5-3B-Instruct | 3.086 M | — | Modelo instruct generalista | Qwen Research (con licencia comercial posible para 3B) |
| Karl28/RSIPO-Qwen2.5-3B-Instruct-Search | no disponible | RSIPO-SFT-Qwen2.5-3B-Instruct-Search | Politica final tras 150 pasos de RL RSIPO | no disponible |

La diferencia clave frente al modelo base Qwen2.5-3B-Instruct es la especializacion en produccion de resumenes de episodio y habilidades para tareas agenticas de busqueda, y frente al checkpoint final RSIPO, que este modelo no ha pasado por el entrenamiento por refuerzo.

## Limitaciones y advertencias

- No es una politica final de RSIPO: es un checkpoint intermedio de inicializacion, por lo que su rendimiento en tareas generales puede ser inferior al del modelo base instruct.
- Licencia Qwen Research: uso restringido a investigacion y evaluacion; el uso comercial requiere una licencia de Alibaba Cloud.
- Pesos en FP32 con `config.json` declarando bfloat16: combinacion deliberada para reproducibilidad exacta; cargar el modelo sin atender a esto puede producir consumos de memoria mayores de lo esperado.
- Idioma: etiquetado oficialmente solo para ingles; el comportamiento en castellano u otros idiomas no esta documentado ni garantizado.
- Riesgo de alucinacion: no evaluado publicamente; al heredar de Qwen2.5-3B-Instruct y estar ajustado sobre trayectorias sinteticas anotadas por GLM-5.2, puede reproducir errores o sesgos de ambos.
- Sesgos conocidos: no disponible.
- Cobertura de datos limitada: el SFT usa solo 3.598 ejemplos de un dominio concreto (search-based QA), por lo que la especializacion puede degradar capacidades fuera de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-Search
- Paper RSIPO (arXiv): https://arxiv.org/abs/2610.15772
- Codigo (GitHub): https://github.com/zfkarl/RSIPO
- Dataset Stage-1: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Checkpoint final RSIPO: https://huggingface.co/Karl28/RSIPO-Qwen2.5-3B-Instruct-Search
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-Search/blob/main/LICENSE
