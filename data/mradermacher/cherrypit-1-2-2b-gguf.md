# mradermacher/CherryPit-1.2-2B-GGUF

## Resumen

CherryPit-1.2-2B-GGUF es la version cuantizada en formato GGUF del modelo CherryPit-1.2-2B, desarrollado originalmente por el usuario DRUPEs y publicada por mradermacher, un colaborador habitual de la comunidad de Hugging Face especializado en generar cuantizaciones estaticas de modelos abiertos. El modelo base es un transformer de aproximadamente 2.500 millones de parametros (2.516.756.480 segun los pesos en safetensors) orientado a tareas de codigo, desarrollo web, matematicas, razonamiento y tool calling, con un enfoque claro hacia el despliegue en dispositivo (on-device) y el uso como modelo pequeno de proposito general.

La relevancia de esta publicacion radica en que facilita el acceso al modelo en multiples niveles de cuantizacion (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware muy modesto, incluidas GPU de consumo e incluso CPU. La licencia Apache 2.0 y la etiqueta `minicpm` en los metadatos sugieren una arquitectura derivada de la familia MiniCPM, aunque la model card del cuantizador no detalla la arquitectura interna ni los datos de entrenamiento del modelo original.

La informacion disponible sobre el modelo original es escasa: la model card del repositorio GGUF se limita a describir el proceso de cuantizacion y los ficheros generados, sin incluir detalles sobre el entrenamiento, el contexto maximo o los resultados de benchmarks. Esta ficha refleja esa limitacion y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM, segun la etiqueta `minicpm` de los metadatos; no se detalla en la model card) |
| Parametros totales | 2.516.756.480 (aprox. 2,5 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no incluye informacion sobre la arquitectura interna del modelo base mas alla de la etiqueta `minicpm` y la referencia al modelo original `DRUPEs/CherryPit-1.2-2B`. Por el nombre y el tamano (2,5 mil millones de parametros), se trata de un transformer decoder-only de la familia MiniCPM, pero no se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se dispone de datos sobre el entrenamiento: no consta el numero de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion realizado por mradermacher, que genero cuantizaciones estaticas (no ponderadas ni con imatrix) en doce niveles distintos, desde Q2_K (1,1 GB) hasta f16 (5,1 GB). El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational`.
- Generacion y asistencia en codigo, con etiquetas especificas `code` y `coding`.
- Desarrollo web, segun la etiqueta `web-development`.
- Razonamiento matematico, segun la etiqueta `math`.
- Razonamiento general, segun la etiqueta `reasoning`.
- Soporte de tool calling / function calling, segun la etiqueta `tool-calling`.
- Orientado a despliegue on-device, segun la etiqueta `on-device`.
- Modelo pequeno de proposito general, segun la etiqueta `small-language-model`.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Asistente de codigo en local para editores y terminales: con cuantizaciones Q4_K_M de 1,7 GB, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU, ofreciendo autocompletado y explicacion de fragmentos de codigo sin depender de servicios en la nube.
- Desarrollo web asistido en entornos con recursos limitados: la etiqueta `web-development` sugiere utilidad para generar HTML, CSS y JavaScript, integrable en herramientas de prototipado rapido que corren en portatiles.
- Razonamiento matematico basico en aplicaciones educativas: el modelo puede resolver problemas aritmeticos y algebraicos sencillos en dispositivos moviles o embebidos, gracias a su tamano reducido y a las cuantizaciones de 1,1-1,5 GB.
- Agentes con tool calling en el borde: la etiqueta `tool-calling` indica soporte para invocar funciones, lo que permite construir agentes ligeros que consulten APIs o ejecuten acciones locales en un dispositivo sin conexion permanente.
- Prototipado rapido de pipelines de IA generativa: al estar disponible en GGUF, se puede integrar con llama.cpp u Ollama para validar flujos de trabajo antes de migrar a modelos mayores.
- Inferencia en CPU para entornos sin GPU: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en servidores modestos o Raspberry Pi de gama alta, util para demos y pruebas de concepto.
- Filtrado y clasificacion de texto en ingles: el modelo puede emplearse para tareas de moderacion o etiquetado simple en Ingles, siempre que se valide su calidad con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q2_K, 1,6-1,7 GB con Q4_K_S/Q4_K_M, 2,2 GB con Q6_K, 2,8 GB con Q8_0 y 5,1 GB con f16 (los tamanos de fichero son una cota superior razonable de la memoria necesaria, a la que hay que anadir el espacio para el contexto KV).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; una RTX 3060, RTX 4060 o superior permite ejecutar Q8_0 con holgura. Para f16 se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4070, A10).
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM; las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El modelo base en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CherryPit-1.2-2B (este) | 2,5 B | no disponible | Apache 2.0 | GGUF, safetensors | Enfoque en codigo, web, matematicas y tool calling |
| CherryPit-1.1-2B | no disponible | no disponible | Apache 2.0 | GGUF | Version anterior del mismo linaje, mismas etiquetas salvo `web-development` |
| CherryPit-1.0-2B | no disponible | no disponible | Apache 2.0 | GGUF | Version inicial del linaje, sin etiqueta `math` |
| MiniCPM base (familia) | variable | no disponible | variable | safetensors, GGUF | Arquitectura de referencia segun la etiqueta `minicpm` |

No se dispone de datos de rendimiento comparativo entre estas versiones ni con otros modelos de tamano similar, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Solo se declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad real en codigo, matematicas o razonamiento frente a alternativas.
- Riesgo de alucinacion inherente a los modelos de 2,5 B de parametros, especialmente en tareas de razonamiento complejo y contextos largos.
- La longitud de contexto no esta documentada; no se debe asumir una ventana amplia en produccion.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para uso en produccion se recomienda Q4_K_M o superior.
- El autor del cuantizador indica que no hay cuantizaciones ponderadas ni con imatrix, lo que puede afectar a la calidad en comparacion con cuantizaciones optimizadas de otros repositorios.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y las condiciones del modelo base original (`DRUPEs/CherryPit-1.2-2B`) antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CherryPit-1.2-2B-GGUF
- Modelo base original: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Version anterior 1.1: https://huggingface.co/mradermacher/CherryPit-1.1-2B-GGUF
- Version anterior 1.0: https://huggingface.co/mradermacher/CherryPit-1.0-2B-GGUF
- Pagina de overview del cuantizador: https://hf.tst.eu/model#CherryPit-1.2-2B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
