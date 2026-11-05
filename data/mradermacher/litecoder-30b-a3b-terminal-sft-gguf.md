# mradermacher/LiteCoder-30B-A3B-Terminal-SFT-GGUF

## Resumen

LiteCoder-30B-A3B-Terminal-SFT-GGUF es la distribucion en formato GGUF del modelo LiteCoder-Terminal-30b-a3b-sft, publicada por el usuario mradermacher, especializado en cuantizaciones comunitarias. El modelo original lo desarrolla Lite-Coder y esta afinado especificamente para tareas de terminal (generacion de comandos de shell, automatizacion de linea de comandos y flujos de agente en entornos de consola). Esta version no introduce cambios en los pesos mas alla de la cuantizacion, por lo que su comportamiento funcional es el del modelo base.

El repositorio contiene unicamente pesos cuantizados en GGUF (desde Q2_K hasta Q8_0), pensados para inferencia con llama.cpp y derivados como Ollama o LM Studio. El modelo cuenta con 30.532.122.624 parametros totales segun los safetensors del modelo base, y la nomenclatura "A3B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos, aunque este dato no se confirma de forma explicita en la informacion disponible.

La relevancia actual reside en que permite ejecutar un modelo de 30B en hardware de consumo gracias a la cuantizacion y a la activacion dispersa, con licencia MIT, lo que facilita su integracion en herramientas de desarrollo y pipelines de automatizacion sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura "A3B"; detalles no disponibles |
| Parametros totales | 30.532.122.624 |
| Parametros activos | aproximadamente 3.000 millones (inferido de "A3B"; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La nomenclatura "30B-A3B" sigue el patron habitual de los modelos de mezcla de expertos con parametros totales y activos explicitos, lo que implicaria un transformer con capas MoE donde solo una fraccion de los expertos se activa por token; esto explicaria la viabilidad de ejecutar un modelo de 30B en hardware modesto. No obstante, no se confirma en la model card ni en los metadatos.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO) ni innovaciones tecnicas especificas. El sufijo "Terminal-SFT" indica un ajuste supervisado orientado a tareas de terminal, y la cuantizacion la realiza mradermacher con cuantizaciones estaticas (sin imatrix), segun se indica en la propia model card.

## Capacidades

- Generacion de comandos de shell y scripts para entornos de terminal (bash, probablemente otras shells; no confirmado).
- Ajuste especifico (SFT) para tareas de linea de comandos y automatizacion de consola.
- Generacion de texto conversacional en ingles (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite su despliegue como servicio.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no confirmado, aunque el enfoque "Terminal" sugiere uso en flujos de agente; no hay evidencia explicita.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede generar comandos de shell a partir de descripciones en lenguaje natural, util para scripts de mantenimiento y aprovisionamiento en entornos Linux.
- Asistentes de terminal integrados en CLI: al ser GGUF y con licencia MIT, puede embeberse en herramientas de linea de comandos que sugieran comandos al usuario en tiempo real.
- Generacion de scripts de CI/CD: el ajuste en terminal permite producir fragmentos de shell para pipelines, con revision humana posterior.
- Educacion y formacion en linea de comandos: puede explicar y proponer comandos para tareas concretas, sirviendo como tutor interactivo en ingles.
- Prototipado de agentes de automatizacion: la activacion dispersa (si se confirma MoE) permite iterar rapidamente en local antes de desplegar en servidor.
- Despliegue en hardware de consumo para pruebas: las cuantizaciones Q4 permiten ejecutar el modelo en estaciones de trabajo sin GPU de datacenter, facilitando la evaluacion interna.
- Generacion de documentacion tecnica de comandos: puede redactar guias de uso de herramientas CLI a partir de ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente, mas overhead de contexto y cache KV):
  - Q2_K: aproximadamente 11,4 GB.
  - Q3_K_M: aproximadamente 14,8 GB.
  - Q4_K_M: aproximadamente 18,7 GB (recomendado por el autor como rapido).
  - Q5_K_M: aproximadamente 21,8 GB.
  - Q6_K: aproximadamente 25,2 GB.
  - Q8_0: aproximadamente 32,6 GB.
- GPU recomendadas: no disponible de forma explicita. Por tamano, una RTX 4090 (24 GB) puede ejecutar Q4_K_M y Q5_K_M con margen limitado para contexto; Q8_0 requiere GPU de 32 GB o superior (A100 40 GB, H100, o configuracion multi-GPU).
- Cabe en GPU de consumo: si, en modelos con 16-24 GB de VRAM usando cuantizaciones Q2 a Q5; en GPUs de 8-12 GB solo con cuantizaciones muy bajas y offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. La activacion dispersa (si se confirma) deberia mejorar el throughput frente a un denso de 30B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiteCoder-30B-A3B-Terminal-SFT (este) | 30,5B totales (aprox. 3B activos, inferido) | no disponible | MIT | GGUF | Ajuste especifico para terminal |
| Modelo base LiteCoder-Terminal-30b-a3b-sft | 30,5B totales | no disponible | MIT | safetensors | Sin cuantizar; referencia para motores como vLLM |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos de tamano o tarea similar.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado unicamente en ingles; el rendimiento en castellano no esta garantizado.
- Sesgos: no documentados en la informacion disponible; al ser un modelo afinado para terminal, puede presentar sesgos hacia entornos Unix/Linux.
- Riesgo de alucinacion: alto en la generacion de comandos, especialmente en flags, rutas y opciones poco comunes; se recomienda validacion humana antes de ejecutar comandos destructivos.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en conversaciones largas o repositorios extensos.
- Licencia: MIT, permite uso comercial sin restricciones adicionales conocidas; conviene verificar la licencia del modelo base por si difiere.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas con imatrix, por lo que la calidad relativa de las cuantizaciones bajas (Q2_K, Q3_K_S) puede ser inferior a la de variantes imatrix equivalentes.
- Produccion: al ser una cuantizacion comunitaria, no hay garantia de soporte ni de paridad exacta con el modelo original; para entornos criticos conviene partir del modelo base en safetensors.
- Fecha de creacion y actualizacion: el repositorio indica fechas de 2026, lo que debe tratarse con cautela si se contrasta con otras fuentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LiteCoder-30B-A3B-Terminal-SFT-GGUF
- Modelo base: https://huggingface.co/Lite-Coder/LiteCoder-Terminal-30b-a3b-sft
- Pagina de descargas del autor: https://hf.tst.eu/model#LiteCoder-30B-A3B-Terminal-SFT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
