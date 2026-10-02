# mradermacher/LFM2.5-2.6B-opencode-SFT-GGUF

## Resumen

LFM2.5-2.6B-opencode-SFT-GGUF es un conjunto de cuantizaciones en formato GGUF publicadas por mradermacher a partir del modelo FineEnvs/LFM2.5-2.6B-opencode-SFT. Se trata, por tanto, de un derivado de terceros (no oficial de Liquid AI) que empaqueta un ajuste supervisado del modelo base LFM2.5-2.6B para su uso con runtimes de inferencia local compatibles con GGUF, como llama.cpp u Ollama.

El modelo subyacente, LFM2.5-2.6B, es un transformer denso de aproximadamente 2,7 mil millones de parametros desarrollado por Liquid AI y disenado especificamente para cargas de trabajo agenticas en dispositivo (on-device). Segun la documentacion del fabricante, cuenta con una ventana de contexto de 128K tokens, un vocabulario de 128K entradas, soporte nativo de tool calling y un entrenamiento de aproximadamente 34 billones de tokens. Su relevancia radica en que permite ejecutar agentes con planificacion y multiples pasos sin depender de una API en la nube.

La variante opencode-SFT, sobre la que se aplican estas cuantizaciones, ha sido ajustada mediante SFT (supervised fine-tuning) con la libreria TRL sobre el dataset FineEnvs/SmolDataEnvs-multiharness-sft. El resultado es un modelo orientado a entornos de agente y arneses de codigo (etiquetas openenv, harbor, opencode, agent). Esta publicacion concreta ofrece 12 niveles de cuantizacion, desde Q2_K (1,2 GB) hasta f16 (5,5 GB), lo que facilita su despliegue en hardware muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de atencion no disponibles) |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (segun documentacion del modelo base LFM2.5-2.6B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (el modelo base LFM2.5-2.6B declara 16 idiomas) |
| Licencia | lfm1.0 (Liquid AI Foundation Model License) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 24,3 GB |
| Modelo base | FineEnvs/LFM2.5-2.6B-opencode-SFT |
| Dataset de ajuste | FineEnvs/SmolDataEnvs-multiharness-sft |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

El modelo de partida es LFM2.5-2.6B, un transformer denso de 2,6-2,7 B de parametros descrito por Liquid AI como un modelo compacto orientado a cargas agenticas. Segun la documentacion y las notas de prensa del fabricante, fue entrenado sobre aproximadamente 34 billones de tokens con un vocabulario de 128K entradas y una ventana de contexto de 128K tokens. La fase de post-entrenamiento recurrio a modelos expertos para reforzar matematicas, codigo, uso de herramientas y contexto largo, capacidades que despues se transfirieron al modelo final. No se dispone de detalles sobre el tipo exacto de capas de atencion ni sobre la composicion pormenorizada del dataset de preentrenamiento.

Sobre esa base, la variante opencode-SFT se obtuvo mediante ajuste supervisado (SFT) con la libreria TRL, empleando el dataset FineEnvs/SmolDataEnvs-multiharness-sft. Las etiquetas del repositorio (openenv, harbor, agent, smoldataenvs, opencode) apuntan a un entrenamiento orientado a arneses de agente y a tareas de codificacion en entornos simulados. El proceso de cuantizacion aplicado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf); el autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles por el momento.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso y planificacion orientada a agentes.
- Tool calling / function calling nativo (heredado del modelo base LFM2.5-2.6B).
- Ejecucion de tareas agenticas en bucle (uso de herramientas, encadenamiento de pasos), segun las etiquetas agent y openenv.
- Generacion y edicion de codigo en el contexto de arneses tipo opencode.
- Ajuste especifico mediante SFT sobre el dataset SmolDataEnvs-multiharness-sft, lo que sugiere entrenamiento en entornos con multiples arneses.
- Capacidades matematicas y de contexto largo segun la documentacion del modelo base (no verificadas de forma independiente para este ajuste).
- Capacidades multilingues: el ajuste declara unicamente ingles; el modelo base LFM2.5-2.6B declara 16 idiomas.

## Casos de uso

- Agente de codificacion en local: el modelo puede integrarse en un bucle de agente tipo opencode para leer, editar y generar ficheros de codigo en la maquina del desarrollador, sin enviar el codigo a una API externa, gracias a su tamano (2,7 B) y a su empaquetado GGUF.
- Asistente de terminal para tareas de refactorizacion: con 128K tokens de contexto heredados del modelo base, permite cargar varios ficheros de un repositorio mediano y operar sobre ellos de forma coherente.
- Automatizacion de tareas con tool calling: soporta llamadas a funciones, de modo que puede conectarse a utilidades del sistema (git, gestores de paquetes, scripts) y decidir que herramienta invocar en cada paso.
- Agente on-device en portatiles sin GPU dedicada: las cuantizaciones Q4_K_M (1,8 GB) o Q5_K_M (2,0 GB) permiten ejecucion en CPU con memoria RAM moderada, util para demos y entornos de desarrollo.
- Prototipado de pipelines de agentes multi-paso: al estar entrenado sobre SmolDataEnvs-multiharness-sft, es adecuado para validar arneses de agente antes de escalar a modelos mayores.
- Generacion asistida en CI/CD: puede invocarse desde un runner para producir parches, resumenes de cambios o mensajes de commit, siempre que la licencia y las condiciones de uso lo permitan.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 niveles de cuantizacion, lo que permite medir el compromiso entre calidad y tamano para un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y tampoco se han encontrado resultados independientes para el ajuste FineEnvs/LFM2.5-2.6B-opencode-SFT.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar cache KV):
  - Q2_K (1,2 GB) y Q3_K_S (1,4 GB): inferencia viable en CPU o GPU con 2 GB de VRAM.
  - Q4_K_S / Q4_K_M (1,7-1,8 GB): recomendadas por el autor como rapidas; caben en GPUs de 4 GB con contexto moderado.
  - Q5_K_S / Q5_K_M (2,0 GB): adecuadas para GPUs de 6 GB.
  - Q6_K (2,3 GB) y Q8_0 (3,0 GB): GPUs de 6-8 GB; Q8_0 marcada como la mejor relacion calidad/velocidad.
  - f16 (5,5 GB): requiere al menos 8 GB de VRAM; el autor la considera excesiva para este tamano.
- La cache KV para 128K tokens de contexto incrementa de forma notable los requisitos de memoria en funcion del runtime y del nivel de cuantizacion de la cache.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, Apple Silicon con Metal) es suficiente; no se requieren A100/H100.
- Despliegue recomendado: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime con soporte GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-opencode-SFT (esta ficha) | ~2,7 B denso | 128K (segun modelo base) | lfm1.0 | GGUF en HuggingFace | Ajuste SFT para agentes/opencode |
| LFM2.5-2.6B (base) | ~2,7 B denso | 128K | lfm1.0 | Pesos originales y GGUF | Modelo oficial de Liquid AI; multilingue (16 idiomas) |
| Qwen2.5-3B | ~3,1 B denso | 32K (ampliable) | Apache 2.0 | Muy amplia | Alternativa generica con licencia permisiva |
| Llama-3.2-3B | ~3,2 B denso | 128K | Llama 3.2 Community License | Muy amplia | Buen rendimiento general y tool calling |
| Phi-3.5-mini | ~3,8 B denso | 128K | MIT | Amplia | Orientado a razonamiento y codigo |

Los datos de los modelos comparados corresponden a informacion publica de sus respectivas fichas; no se dispone de comparativas de rendimiento medidas contra este ajuste concreto.

## Limitaciones y advertencias

- Modelo derivado de terceros: se trata de cuantizaciones no oficiales, por lo que no cuentan con el soporte directo de Liquid AI.
- Idioma: el ajuste declara unicamente ingles, aunque el modelo base contempla 16 idiomas. El rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion para este ajuste.
- Sesgos: no se dispone de informacion sobre la composicion del dataset SmolDataEnvs-multiharness-sft ni sobre sesgos conocidos.
- Licencia lfm1.0 (Liquid AI Foundation Model License): es necesario revisar las condiciones de uso comercial antes de desplegar el modelo en produccion, ya que no es una licencia de tipo permisivo estandar.
- Capacidades agenticas no verificadas: las etiquetas (agent, opencode, openenv) indican la intencion del ajuste, pero no se han publicado benchmarks que cuantifiquen su rendimiento real en tareas de agente.
- Cuantizaciones de baja precision: Q2_K y Q3_K reducen notablemente la calidad; el propio autor recomienda Q4_K_S, Q4_K_M o superiores.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Estado de las cuantizaciones ponderadas/imatrix: no disponibles en el momento de la publicacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-2.6B-opencode-SFT-GGUF
- Modelo base del ajuste: https://huggingface.co/FineEnvs/LFM2.5-2.6B-opencode-SFT
- Dataset de SFT: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-multiharness-sft
- Pagina de resumen del autor: https://hf.tst.eu/model#LFM2.5-2.6B-opencode-SFT-GGUF
- Documentacion de Liquid AI sobre LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Cuantizaciones GGUF del modelo base LFM2.5-2.6B: https://huggingface.co/mradermacher/LFM2.5-2.6B-GGUF
- Cuantizaciones alternativas (i1, absolute-heresy): https://huggingface.co/mradermacher/LFM2.5-2.6B-absolute-heresy-i1-GGUF
- Nota de prensa sobre el lanzamiento: https://github.com/ypyl/ypyl.github.io/blob/master/_news/2026-08-04-liquid-ai-releases-lfm2-5-2-6b-on-device-agent.md
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
