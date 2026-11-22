# mradermacher/Artemis-31B-v1.2-i1-GGUF

## Resumen

Artemis-31B-v1.2-i1-GGUF es la distribucion en formato GGUF del modelo Artemis-31B-v1.2, desarrollado originalmente por TheDrummer y cuantizado por mradermacher. Se trata de un modelo de lenguaje conversacional de aproximadamente 30.700 millones de parametros (30,7B) orientado a generacion de texto en ingles, empaquetado con cuantizaciones de tipo imatrix (i1) que mejoran la relacion calidad/tamano frente a las cuantizaciones estaticas tradicionales. El repositorio incluye una bateria completa de variantes que van desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB), lo que permite desplegarlo en un rango amplio de hardware.

El modelo base sigue una arquitectura transformer densa (no MoE) con 30.697.345.596 parametros totales, segun los pesos en safetensors del modelo original. La ficha tecnica del modelo base no esta incluida en la informacion disponible, por lo que detalles como la longitud de contexto, la composicion del dataset de entrenamiento o los metodos de alineacion (RLHF/DPO) no pueden confirmarse a partir de las fuentes consultadas. La licencia tampoco aparece declarada en la model card del repositorio GGUF.

La relevancia de esta publicacion reside en su enfoque practico: al ofrecer cuantizaciones imatrix de alta calidad y un grafo comparativo de perplejidad, facilita la ejecucion local de un modelo de ~31B en GPUs de consumo y en entornos con VRAM limitada, manteniendo un equilibrio razonable entre fidelidad y velocidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1) y safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base TheDrummer/Artemis-31B-v1.2 mas alla de su naturaleza transformer densa y su proposito conversacional. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

Lo que si esta documentado es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con fichero imatrix (Artemis-31B-v1.2.imatrix.gguf, 0,1 GB), lo que permite calibrar la cuantizacion con estadisticas de activacion y mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano. El autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamano similar, y proporciona un grafo de perplejidad de ikawrakow como referencia comparativa. Ademas, existe un conjunto de cuantizaciones estaticas en el repositorio mradermacher/Artemis-31B-v1.2-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones (el modelo base esta etiquetado como conversacional).
- Capacidades de codigo y matematicas: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantizacion Q4_K_M (18,8 GB) para mantener conversaciones multi-turno en estaciones de trabajo con 24 GB de VRAM, sin depender de servicios en la nube.
- Prototipado de chatbots en equipos con GPU de consumo: la variante IQ3_S (13,9 GB) cabe en GPUs de 16 GB y permite iterar rapidamente sobre prompts y flujos conversacionales antes de escalar a un modelo mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes con tamanos desde 7,3 GB hasta 25,3 GB, lo que lo convierte en un banco de pruebas ideal para medir el impacto de la cuantizacion en perplejidad y calidad de respuesta.
- Generacion de texto creativo y redaccion en ingles: el caracter conversacional del modelo base lo hace adecuado para tareas de escritura asistida, resumenes y reescritura, ejecutandose en local con la variante Q5_K_M (21,9 GB) para maxima fidelidad.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ser un GGUF ejecutable con llama.cpp, puede correr en servidores aislados donde no se permite enviar datos a APIs externas.
- Investigacion sobre cuantizacion imatrix: el fichero imatrix incluido (0,1 GB) permite a investigadores generar sus propias cuantizaciones calibradas y estudiar el efecto de distintas tecnicas sobre un modelo de ~31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un grafo comparativo de perplejidad entre tipos de cuantizacion (enlace a nethype.de) y una referencia a las notas de Artefact2 sobre cuantizacion, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF mas overhead de contexto):
  - IQ1_S (7,3 GB): ~8 GB de VRAM.
  - IQ2_M (11,0 GB): ~12 GB de VRAM.
  - IQ3_S (13,9 GB): ~15 GB de VRAM.
  - Q4_K_M (18,8 GB): ~20 GB de VRAM.
  - Q5_K_M (21,9 GB): ~23 GB de VRAM.
  - Q6_K (25,3 GB): ~27 GB de VRAM.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M y Q5_K_M con contexto moderado; Q6_K requiere offloading parcial a CPU.
  - RTX 4080 / 4070 Ti (16 GB): IQ3_S o IQ3_M.
  - RTX 4060 Ti 16 GB: IQ3_S con contexto reducido.
  - A100 40/80 GB y H100: cualquier cuantizacion, incluida Q6_K, con contexto amplio.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM usando cuantizaciones IQ3 o inferiores; en GPUs de 8-12 GB solo con IQ1/IQ2 y calidad degradada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI, aunque el repositorio GGUF esta pensado para llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Artemis-31B-v1.2-i1-GGUF | 30,7B | no disponible | no disponible | GGUF (i1) | 24 cuantizaciones imatrix, 7,3-25,3 GB |
| Artemis-31B-v1.2 (base) | 30,7B | no disponible | no disponible | safetensors | Modelo original de TheDrummer |
| Artemis-31B-v1.2-GGUF (estatico) | 30,7B | no disponible | no disponible | GGUF | Cuantizaciones estaticas del mismo autor |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, modelos densos de ~30B de otros desarrolladores). La comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Licencia no declarada: al no especificarse la licencia en la model card, no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base TheDrummer/Artemis-31B-v1.2 antes de usarlo en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo, puede producir contenido incorrecto con apariencia de veracidad.
- Sesgos: no documentados en la informacion disponible.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 (7,3-11,0 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- Fecha de creacion: el repositorio figura creado el 2026-09-25, fecha que puede indicar un error de metadatos o una publicacion futura; conviene verificar la vigencia del modelo base.
- Sin benchmarks: la ausencia de resultados publicados dificulta la comparacion objetiva con alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Artemis-31B-v1.2-i1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Artemis-31B-v1.2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Artemis-31B-v1.2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
