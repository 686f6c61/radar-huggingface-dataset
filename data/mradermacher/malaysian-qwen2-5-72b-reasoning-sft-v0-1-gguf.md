# mradermacher/Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1-GGUF

## Resumen

Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1-GGUF es la version cuantizada en formato GGUF del modelo Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1, publicado por mesolitica y convertido por mradermacher. Se trata de un ajuste fino supervisado (SFT) orientado a razonamiento sobre la base de Qwen2.5-72B, con especial enfasis en el idioma malayo (ms) y el ingles (en). El repositorio original contiene 72.706.203.648 parametros en safetensors, lo que lo situa en la categoria de modelos densos de gran tamano.

La relevancia de esta ficha radica en que ofrece los pesos en GGUF con multiples niveles de cuantizacion (desde Q2_K hasta Q8_0), lo que permite desplegar un modelo de 72B en hardware mas modesto mediante llama.cpp u Ollama, a costa de la perdida de precision inherente a cada nivel. El autor de la cuantizacion, mradermacher, es un actor conocido en el ecosistema por producir versiones GGUF de modelos open source, e incluye tambien una variante con cuantizacion imatrix en un repositorio separado.

No se dispone de informacion sobre la licencia del modelo base ni sobre detalles del dataset de entrenamiento o del proceso de alineacion en la informacion proporcionada. El modelo esta etiquetado como conversacional y compatible con endpoints, y su model card apunta a la ficha del modelo original para obtener mas contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen2.5-72B, transformer denso) |
| Parametros totales | 72.706.203.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | malayo (ms), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mesolitica/Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1. Por el nombre y el numero de parametros, se infiere que parte de Qwen2.5-72B, un transformer denso de 72.706.203.648 parametros, pero no se confirma en la model card proporcionada ni se especifican la longitud de contexto nativa, la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO. El sufijo "Reasoning-SFT" sugiere un ajuste fino supervisado orientado a tareas de razonamiento, pero no se aportan detalles sobre los datos empleados ni sobre posibles innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El repositorio GGUF es una conversion estatica del modelo original, realizada con herramientas de cuantizacion estandar (los metadatos indican quantize_version 2 y output_tensor_quantised 1). El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (sufijo -i1-GGUF), lo que sugiere que la version aqui descrita emplea cuantizacion estatica sin matriz de importancia.

## Capacidades

- Generacion de texto conversacional en malayo e ingles, segun las etiquetas del modelo.
- Razonamiento de multiples pasos, inferido del sufijo "Reasoning" en el nombre del modelo base.
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito.
- Capacidades multilingues limitadas a los idiomas declarados (ms, en); no se confirman otros idiomas.

## Casos de uso

- Asistencia conversacional en malayo: el modelo puede gestionar dialogos multi-turno en malayo gracias a su ajuste especifico sobre ese idioma, adecuado para chatbots de atencion al cliente en mercados de Malasia.
- Razonamiento asistido en ingles y malayo: util para tareas de analisis, explicacion de conceptos o resolucion de problemas paso a paso, aprovechando el ajuste SFT orientado a razonamiento.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_S y Q4_K_M (44,0 GB y 47,5 GB) permiten ejecutar un modelo de 72B en estaciones de trabajo con suficiente VRAM o RAM, mediante llama.cpp u Ollama.
- Prototipado local de aplicaciones NLP bilingues: investigadores que necesiten un modelo malayo-ingles pueden usar las versiones Q2_K (29,9 GB) o Q3_K_S (34,6 GB) para pruebas rapidas en equipos de gama alta consumer.
- Generacion de contenido en malayo: redaccion de textos, resumenes o respuestas en ese idioma, con la salvedad de que no se han publicado evaluaciones de calidad.
- Integracion en pipelines de inferencia compatibles con endpoints: la etiqueta endpoints_compatible sugiere su uso en servicios desplegados con servidores tipo llama.cpp server o TGI con soporte GGUF.
- Fine-tuning posterior o experimentacion: el repositorio original en safetensors (72,7B) puede servir como base para ajustes adicionales, aunque el repositorio GGUF no es el formato adecuado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~29,9 GB; Q3_K_S ~34,6 GB; Q3_K_M ~37,8 GB; Q3_K_L ~39,6 GB; IQ4_XS ~40,3 GB; Q4_K_S ~44,0 GB; Q4_K_M ~47,5 GB; Q5_K_S ~51,5 GB; Q5_K_M ~54,5 GB; Q6_K ~64,4 GB; Q8_0 ~77,4 GB.
- GPU recomendadas: para Q4_K_M se necesita al menos una GPU con 48 GB (A6000, A100 80GB, H100) o repartir entre varias; para Q8_0 se requiere una A100 80GB o H100 80GB. Las cuantizaciones Q2_K y Q3_K_S podrian caber en una RTX 4090 de 24 GB solo con offloading parcial a RAM, no completamente en VRAM.
- Cabe en GPU consumer: ninguna cuantizacion cabe integra en una RTX 4090 (24 GB); es necesario usar RAM del sistema junto con la GPU (offloading) o multiples GPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama.cpp server). vLLM y TGI no soportan GGUF de forma nativa en el momento de la publicacion, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1-GGUF (este) | 72,7B | no disponible | ms, en | no disponible | GGUF |
| Qwen2.5-72B (base original) | 72,7B | no disponible en esta ficha | multilingue (incluye en, zh) | no disponible en esta ficha | safetensors, GGUF |
| mesolitica/Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1 (original) | 72,7B | no disponible | ms, en | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo ni de otras alternativas especificas para malayo en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del modelo; al ser un ajuste sobre Qwen2.5, podria heredar sesgos del modelo base, pero no se confirma.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S/Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality".
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base antes de usarlo en produccion.
- Soporte limitado a malayo e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se dispone de informacion sobre la longitud de contexto efectiva, lo que limita la planificacion de aplicaciones con contexto largo.
- El repositorio GGUF no es adecuado para fine-tuning; para ello habria que usar los pesos originales en safetensors.
- Las cuantizaciones Q5_K_S, Q5_K_M, Q6_K y Q8_0 estan divididas en varias partes (part1of2, part2of2), lo que requiere concatenarlas antes de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1-GGUF
- Modelo base original: https://huggingface.co/mesolitica/Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Malaysian-Qwen2.5-72B-Reasoning-SFT-v0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
