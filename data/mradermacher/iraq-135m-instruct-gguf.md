# mradermacher/Iraq-135M-Instruct-GGUF

## Resumen

Iraq-135M-Instruct es un modelo de lenguaje de pequeno tamano (SLM, *small language model*) de 134.515.008 parametros, desarrollado originalmente por el usuario `fwefdsfe` y distribuido en formato GGUF por `mradermacher`. Se trata de un modelo afinado para instrucciones (*instruct*) orientado a generacion de texto, razonamiento, matematicas y codigo, con etiquetas que lo asocian al estilo de *chain-of-thought* de la familia DeepSeek-R1. Su reducido tamano lo situa en la categoria de modelos que pueden ejecutarse en hardware muy modesto, incluso en CPU.

El modelo esta disenado para tareas conversacionales y de generacion con un enfoque en razonamiento explicito (CoT). Soporta dos idiomas: ingles (`en`) y arabe (`ar`), segun la model card. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

La relevancia de esta ficha radica en que el repositorio distribuido por `mradermacher` no contiene los pesos originales, sino una coleccion de cuantizaciones estaticas en formato GGUF (desde Q2_K hasta f16) pensadas para su uso con llama.cpp y herramientas compatibles. Es importante senalar que la informacion publica disponible es muy limitada: no se detallan datos de entrenamiento, arquitectura interna ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun el pipeline de `transformers`; sin detalle de capas ni atencion) |
| Parametros totales | 134.515.008 (datos de safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles), ar (arabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El pipeline declarado es `text-generation` y la libreria asociada es `transformers`, lo que sugiere una arquitectura de transformer decoder-only, pero no se especifican numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador. El modelo base es `fwefdsfe/Iraq-135M-Instruct`, y este repositorio contiene unicamente las cuantizaciones GGUF generadas por `mradermacher`.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Las etiquetas del modelo (`deepseek-r1`, `chain-of-thought`, `cot`, `reasoning`, `math`, `code`) indican que el ajuste esta orientado a producir razonamiento paso a paso y a tareas de matematicas y codigo, probablemente mediante destilacion o imitacion de trazas de razonamiento de modelos mayores, pero esto es una inferencia a partir de las etiquetas y no un dato confirmado en la model card. No se mencionan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y arabe.
- Razonamiento con *chain-of-thought* (CoT): el modelo esta etiquetado para producir trazas de razonamiento paso a paso.
- Tareas de matematicas y codigo, segun las etiquetas `math` y `code`.
- Generacion de texto orientada a instrucciones (*instruct*).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- No se documenta soporte de *tool calling* / *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del CoT implicito.
- No se documentan capacidades de vision ni audio.
- Capacidades multilingues limitadas a ingles y arabe.

## Casos de uso

- **Prototipado rapido en local**: gracias a su tamano (0.2 GB en cuantizaciones Q4), puede ejecutarse en un portatil o en una Raspberry Pi para validar pipelines de generacion de texto antes de pasar a modelos mayores.
- **Generacion de texto en dispositivos con recursos limitados**: su huella de memoria minima permite integrarlo en aplicaciones de escritorio o moviles donde no cabe un modelo de miles de millones de parametros.
- **Asistente conversacional en arabe e ingles**: el soporte bilingue permite construir chatbots sencillos para atencion basica en ambos idiomas, aunque con calidad limitada por el tamano.
- **Generacion de trazas de razonamiento para experimentacion**: util para investigar como se comportan modelos pequenos entrenados con CoT y comparar sus cadenas de razonamiento con las de modelos mayores.
- **Tareas educativas de matematicas y codigo**: puede emplearse como apoyo en entornos de aprendizaje para explicar pasos intermedios, siempre con supervision humana.
- **Pruebas de cuantizacion y benchmarking de llama.cpp**: al ofrecer 12 variantes de cuantizacion, sirve como banco de pruebas para medir el impacto de la cuantizacion en calidad y velocidad en un modelo de 135M.
- **Filtrado y clasificacion de texto simple**: puede usarse para tareas de etiquetado ligero o resumen de fragmentos cortos en ingles o arabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0.2 GB para cuantizaciones Q2_K a Q8_0 (segun los tamanos de fichero del repositorio) y unos 0.4 GB para f16. El modelo completo en safetensors ocupa aproximadamente 0.27 GB (134.515.008 parametros a 2 bytes por parametro en f16).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU sin GPU dedicada.
- **Cabe en GPU de consumo**: si, en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, GTX 1650, e incluso iGPU con memoria compartida).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors, `transformers` con PyTorch. No se documenta soporte especifico de vLLM o TGI para este modelo.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada. Por el tamano, se espera una latencia muy baja en CPU y practicamente instantanea en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Iraq-135M-Instruct (este) | 134.515.008 | no disponible | en, ar | Apache 2.0 | GGUF, safetensors |
| SmolLM2-135M-Instruct | ~135M | no disponible en la busqueda | en (principalmente) | no disponible en la busqueda | GGUF (via mradermacher) |
| Iraq-AI | ~0.8B (segun la busqueda) | no disponible | no disponible | no disponible | GGUF (via mradermacher) |

La comparativa se limita a modelos de la misma familia de tamano (SLM de ~135M). No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de ellos en la informacion proporcionada, por lo que la comparacion se reduce a parametros, licencia y disponibilidad de formatos. SmolLM2-135M-Instruct es la alternativa mas directa por tamano, pero no se confirma que comparta idiomas ni licencia.

## Limitaciones y advertencias

- **Tamano muy reducido**: con 135M de parametros, la calidad de generacion, el razonamiento y el conocimiento factual seran limitados en comparacion con modelos de mayor escala; es esperable una alta tasa de errores en tareas complejas.
- **Riesgo de alucinacion elevado**: los modelos de este tamano tienden a inventar hechos, especialmente en matematicas y codigo, donde las trazas de CoT pueden ser plausibles pero incorrectas.
- **Cobertura idiomatica limitada**: solo se declaran ingles y arabe; no hay soporte documentado de castellano ni de otros idiomas.
- **Falta de documentacion**: no se detallan datos de entrenamiento, sesgos conocidos, contexto maximo ni evaluaciones; esto dificulta evaluar su idoneidad para produccion.
- **Sesgos**: no se documentan sesgos especificos, pero al no conocerse la composicion del dataset de entrenamiento no puede descartarse la presencia de sesgos en ingles y arabe.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base (`fwefdsfe/Iraq-135M-Instruct`) debe verificarse por si tuviera restricciones adicionales no reflejadas en este repositorio de cuantizaciones.
- **Caveat de produccion**: no se recomienda su uso en produccion sin una evaluacion exhaustiva previa; es mas adecuado para prototipos, experimentacion y entornos con supervision humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Iraq-135M-Instruct-GGUF
- Modelo base: https://huggingface.co/fwefdsfe/Iraq-135M-Instruct
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Iraq-135M-Instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Alternativa similar (SmolLM2-135M-Instruct-GGUF): https://huggingface.co/mradermacher/SmolLM2-135M-Instruct-GGUF
- Otro modelo del mismo autor (Iraq-AI-GGUF): https://huggingface.co/mradermacher/Iraq-AI-GGUF
