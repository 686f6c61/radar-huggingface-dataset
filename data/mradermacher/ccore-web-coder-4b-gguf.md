# mradermacher/CCORE-Web-Coder-4B-GGUF

## Resumen

CCORE-Web-Coder-4B-GGUF es la distribucion en formato GGUF del modelo CCORE-Web-Coder-4B, un modelo de lenguaje especializado en desarrollo web (con enfasis en React) publicado por ccore y cuantizado por mradermacher. Se trata de un modelo derivado de la familia Qwen 3.5, segun la etiqueta `qwen3_5` de la model card, y esta licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integracion en herramientas de desarrollo.

El repositorio contiene unicamente los pesos cuantizados estaticos en formato GGUF, pensados para su ejecucion en llama.cpp y entornos compatibles, junto con dos ficheros `mmproj` que actuan como suplemento multimodal. La model card no especifica la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que varios parametros tecnicos quedan como no disponibles.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo orientado a generacion de codigo web en hardware de consumo, gracias a sus cuantizaciones de baja precision (desde Q2_K hasta Q8_0). No obstante, el dato de parametros totales reportado en safetensors (333.514.240) no concuerda con el nombre comercial "4B" del modelo, una discrepancia que conviene tener en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun etiqueta `qwen3_5`) |
| Parametros totales | 333.514.240 (dato real en safetensors); el nombre del modelo indica "4B", discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5`, que situa el modelo base en la familia Qwen 3.5 de Alibaba. Se trata, por tanto, de un transformer decoder-only, aunque no se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La unica informacion sobre el proceso de creacion es que mradermacher ha generado cuantizaciones estaticas a partir del modelo base `ccore/CCORE-Web-Coder-4B`, sin cuantizaciones ponderadas ni imatrix en el momento de la publicacion. Los ficheros `mmproj` sugieren capacidades multimodales en el modelo base, aunque la model card no las describe.

## Capacidades

- Generacion de codigo orientado a desarrollo web, con etiqueta especifica para React.
- Generacion de texto general como modelo de lenguaje.
- Soporte multimodal potencial, inferido de la presencia de ficheros `mmproj` (Q8_0 y f16) en el repositorio.
- Capacidades de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en el IDE para React: el modelo puede integrarse en extensiones de editor que autocompleten componentes, hooks y utilidades de React, ejecutandose localmente en formato GGUF mediante llama.cpp sin enviar codigo a servicios externos.
- Generacion de componentes de interfaz: util para scaffolding de componentes React a partir de descripciones en lenguaje natural, con la ventaja de la licencia Apache 2.0 para uso comercial en herramientas internas.
- Reescritura y refactorizacion de codigo web: el modelo puede recibir fragmentos de codigo y proponer versiones refactorizadas, aprovechando su especializacion en desarrollo web.
- Documentacion tecnica de proyectos frontend: generacion de comentarios, README y descripciones de componentes a partir del codigo fuente, en ingles.
- Prototipado rapido en entornos con recursos limitados: al ofrecer cuantizaciones desde Q2_K, puede desplegarse en portatiles y estaciones de trabajo sin GPU dedicada para tareas de generacion de codigo de baja latencia crítica.
- Integracion en pipelines de CI/CD para revision de codigo: el modelo puede ejecutarse en un runner para generar sugerencias o resumenes de cambios en ficheros JSX/TSX, aunque su contexto no documentado limita el tamano de los diffs procesables.
- Educacion y aprendizaje de React: despliegue local como tutor de codigo que responde en ingles sobre patrones de React, sin coste de API y con privacidad total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el tamano del repositorio es de 1,0 GB, lo que sugiere que las cuantizaciones de menor precision caben holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del repositorio y las cuantizaciones Q2_K a Q8_0, aunque no se confirma con datos oficiales.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (la model card remite a las instrucciones de TheBloke para el uso de ficheros GGUF); Ollama, vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CCORE-Web-Coder-4B-GGUF | 333.514.240 (safetensors) | no disponible | Apache 2.0 | GGUF | Especializado en web/React, solo ingles |
| Modelo base ccore/CCORE-Web-Coder-4B | no disponible | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Alternativas de la familia Qwen 3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Discrepancia entre el nombre "4B" y los parametros reales reportados en safetensors (333,5 M): conviene verificar el modelo base antes de asumir capacidades de un modelo de 4 mil millones de parametros.
- Idiomas: la model card solo declara ingles, lo que limita su uso en entornos en castellano sin evaluacion adicional.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar tareas con ventanas largas (por ejemplo, repositorios completos).
- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni evaluaciones de fiabilidad en generacion de codigo.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una cuantizacion de un modelo de terceros conviene revisar las condiciones del modelo base.
- Produccion: al no haber benchmarks ni especificaciones de contexto, no se recomienda su uso en produccion sin una evaluacion previa propia.
- Cuantizaciones: solo se ofrecen cuantizaciones estaticas; no hay versiones ponderadas ni imatrix, lo que puede afectar a la calidad en las cuantizaciones mas agresivas (Q2_K, Q3_K_S).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/CCORE-Web-Coder-4B-GGUF
- Modelo base: https://huggingface.co/ccore/CCORE-Web-Coder-4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#CCORE-Web-Coder-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
