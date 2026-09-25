# mradermacher/zora-v1.13-i1-GGUF

## Resumen

mradermacher/zora-v1.13-i1-GGUF es una recopilacion de cuantizaciones GGUF del modelo sovasoft/zora-v1.13, publicada por el usuario mradermacher, especializado en generar versiones comprimidas de modelos abiertos. El modelo original lo desarrolla Sovasoft y se describe como un LLM de 8.000 millones de parametros construido sobre Qwen3-8B, orientado especificamente a 12 idiomas de los Balcanes y del sureste de Europa.

La propuesta diferencial del modelo base no es el rendimiento bruto, sino un comportamiento disenado para ser "honesto": ofrecer perspectivas multiples sobre temas controvertidos y declarar explicitamente cuando no conoce una respuesta, en lugar de alucinar. Este repositorio anade a esa base un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K) generadas con imatrix, lo que permite ejecutar un modelo de ~8.190 millones de parametros en hardware de consumo.

El repositorio ocupa 18,7 GB e incluye 24 variantes de cuantizacion distintas. Es relevante ahora para desarrolladores que necesiten un modelo multilingue centrado en lenguas balcanicas y de Europa del sureste con requisitos de VRAM reducidos y despliegue local, aunque la ausencia de benchmarks publicados y de documentacion detallada obliga a validar su comportamiento antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base derivado de Qwen3-8B, segun la informacion del modelo original) |
| Parametros totales | 8.190.735.360 (aproximadamente 8,19 mil millones) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | 12 idiomas de los Balcanes y del sureste de Europa (la lista concreta no esta disponible en la informacion proporcionada) |
| Licencia | no disponible en este repositorio; el repositorio del modelo base (sovasoft/zora-v1.13-gguf) indica apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix / weighted quants) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna en la documentacion proporcionada. El unico dato estructural es que el modelo base, sovasoft/zora-v1.13, se describe como un modelo de 8.000 millones de parametros derivado de Qwen3-8B, lo que implica una arquitectura transformer densa con decodificacion autoregresiva. Este repositorio concreto no aporta pesos originales, sino versiones cuantizadas del modelo ya entrenado.

Sobre el entrenamiento no hay datos disponibles: no se especifica el numero de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. La unica innovacion documentada es de tipo etico y de comportamiento: el modelo esta disenado para exponer perspectivas multiples ante temas contestados y para indicar explicitamente la ausencia de conocimiento en lugar de generar una respuesta plausible pero falsa. Las etiquetas del modelo base incluyen "honest-ai", "rag", "multilingual", "conversational" y "balkan"/"southeast-europe".

La aportacion tecnica de este repositorio es la cuantizacion: mradermacher emplea cuantizacion ponderada con matrices de importancia (imatrix), lo que en la practica reduce la perdida de calidad respecto a una cuantizacion ingenua, especialmente en los niveles de bits mas bajos. Se han publicado 24 variantes que cubren desde regimenes muy agresivos (IQ1_S) hasta casi sin perdida (Q6_K).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del modelo base.
- Comportamiento de "honestidad calibrada": el modelo esta disenado para manifestar cuando no sabe algo y para presentar multiples perspectivas sobre asuntos controvertidos.
- Capacidades multilingues centradas en 12 idiomas de los Balcanes y del sureste de Europa. El castellano no aparece entre los idiomas objetivo declarados.
- Soporte de recuperacion aumentada (RAG): la etiqueta "rag" figura en los metadatos del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el repositorio no incluye ficheros mmproj.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en lenguas balcanicas: el modelo puede gestionar conversaciones multi-turno en serbio, croata, bulgaro, rumano y otras lenguas de la region, lo que permite desplegar un unico asistente en varios mercados del sureste europeo sin entrenar un modelo por idioma.
- Sistemas de preguntas y respuestas con RAG sobre documentacion corporativa: al estar etiquetado como modelo orientado a RAG y disenado para admitir desconocimiento, encaja en pipelines donde se prefiere una respuesta "no lo se" a una invencion sobre normativa o contratos.
- Moderacion y resumen de debates en medios de comunicacion: su enfoque multi-perspectiva permite resumir posturas enfrentadas sobre temas politicamente sensibles en la region, indicando explicitamente los puntos de desacuerdo.
- Despliegue en local para organizaciones con requisitos de soberania del dato: al pesar alrededor de 5 GB en Q4_K_M, puede ejecutarse en portatiles y estaciones de trabajo sin enviar datos a la nube.
- Investigacion academica en linguistica computacional del sureste europeo: sirve como linea base cuantizada para comparar rendimiento entre lenguas de la familia eslava meridional y romances balcanicas.
- Prototipado rapido de asistentes conversacionales en CPU: las variantes Q4_0, Q4_1 y Q3_K permiten levantar un servidor de inferencia con llama.cpp o Ollama en maquinas sin GPU dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio publica 24 niveles distintos del mismo modelo, lo que permite medir empiricamente el impacto de la cuantizacion en tareas de generacion y clasificacion en un modelo de ~8 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se proporcionan cifras de MMLU, HumanEval, GSM8K, MMLU-Pro ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones de este repositorio. Tampoco se indica el metodo de evaluacion ni los hiperparametros de decodificacion empleados.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el nivel de cuantizacion (calculada sobre 8,19 B de parametros; incluye un margen reducido para contexto):
  - IQ1_S / IQ1_M / IQ2_XXS: aproximadamente 2,5-3,5 GB.
  - Q2_K / IQ2_M / IQ2_S: aproximadamente 3,0-3,8 GB.
  - Q3_K_S / IQ3_XS / IQ3_S: aproximadamente 3,7-4,5 GB.
  - Q4_K_S / IQ4_XS / IQ4_NL: aproximadamente 4,3-5,0 GB.
  - Q4_K_M: aproximadamente 4,9-5,5 GB.
  - Q5_K_M / Q5_K_S: aproximadamente 5,7-6,3 GB.
  - Q6_K: aproximadamente 6,6-7,2 GB.
  - Nota: estas cifras son estimaciones derivadas del tamano de parametros y del regimen de bits; no proceden de mediciones publicadas por el autor.
- GPU recomendadas:
  - Gama de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 pueden alojar cualquier cuantizacion desde Q4_K_M hacia arriba con contexto amplio.
  - Gama profesional: A100 40/80 GB, H100 y L40S para servir varias instancias concurrentes o contextos muy largos mediante vLLM.
  - GPU con 8 GB de VRAM (RTX 3070, RTX 4060): viables con Q4_K_S o inferiores.
  - GPU con 6 GB de VRAM: viables con Q3_K_M o IQ3_M, con contexto reducido.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 6 GB o mas puede ejecutar las variantes Q4 o inferiores; el modelo completo en FP16 (no incluido en este repositorio) requeriria alrededor de 17 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp. vLLM y TGI soportan GGUF de forma parcial o requieren los pesos en safetensors, por lo que no son la via natural para este repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zora-v1.13-i1-GGUF (este repositorio) | 8,19 B | no disponible | no disponible en el repo; el modelo base indica apache-2.0 | GGUF, 24 cuantizaciones | Enfoque en 12 idiomas balcanicos y sureste de Europa; comportamiento "honesto" |
| sovasoft/zora-v1.13 (modelo base) | 8 B aprox. | no disponible | no disponible | safetensors (presumiblemente, no confirmado) | Modelo original sin cuantizar |
| sovasoft/zora-v1.13-gguf | 8 B aprox. | no disponible | apache-2.0 | GGUF | Cuantizaciones publicadas por el propio autor del modelo |
| Qwen3-8B | aproximadamente 8 B (citado como base de Zora) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Modelo sobre el que se construye Zora v1.13; no hay datos comparativos de rendimiento en esta informacion |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar el rendimiento del modelo frente a alternativas de tamano similar en tareas estandar.
- La honestidad declarada es un objetivo de diseno, no una garantia: el modelo puede seguir alucinando, especialmente en las cuantizaciones de menor precision (IQ1_S, IQ1_M, IQ2_XXS), donde la degradacion de calidad es mayor.
- El sesgo multi-perspectiva puede traducirse en respuestas ambiguas o poco comprometidas en dominios donde se espera una respuesta directa, lo que complica su uso en entornos con requisitos de decision clara.
- Cobertura idiomatica limitada: los 12 idiomas objetivo son balcanicos y del sureste de Europa; no hay evidencia de un rendimiento aceptable en castellano, y la etiqueta multilingue no implica competencia en otras familias linguisticas.
- La licencia del repositorio de cuantizaciones figura como no disponible en los metadatos de HuggingFace. Aunque el repositorio GGUF del modelo base indica apache-2.0, conviene verificar la licencia aplicable antes de un uso comercial.
- No se documenta soporte de tool calling, function calling ni de flujos de agentes, por lo que no debe asumirse su disponibilidad en produccion.
- El repositorio no incluye pesos originales ni ficheros de proyeccion multimodal, solo cuantizaciones GGUF.
- La fecha de creacion del repositorio (25 de septiembre de 2026) y el contador de descargas (0) indican que se trata de una publicacion reciente y practicamente sin validacion por parte de la comunidad.
- El modelo base no proporciona informacion sobre la composicion del dataset de entrenamiento, lo que impide evaluar riesgos de contaminacion o sesgos sistematicos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/zora-v1.13-i1-GGUF
- Modelo base: https://huggingface.co/sovasoft/zora-v1.13
- Cuantizaciones del autor original: https://huggingface.co/sovasoft/zora-v1.13-gguf
- Ficha en Featherless: https://featherless.ai/models/sovasoft/zora-v1.13
- Entrada en free2aitools (version anterior): https://free2aitools.com/model/mradermacher/zora-v1.12-i1-gguf
- Repositorio relacionado del mismo cuantizador: https://huggingface.co/mradermacher/Agent.Xortron-i1-GGUF
- Mapas de arquitectura de modelos: https://modelmap.cc/
