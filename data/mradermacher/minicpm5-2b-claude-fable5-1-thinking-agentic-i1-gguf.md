# mradermacher/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-i1-GGUF

## Resumen

MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local: el autor aplica cuantizacion con matrices de importancia (imatrix) sobre los pesos originales y ofrece una bateria de variantes que van desde IQ1_S (0,8 GB) hasta Q4_K_M (1,7 GB), ademas de una version estatica en un repositorio aparte.

El modelo subyacente tiene 2.516.756.480 parametros (unos 2,52B) y esta etiquetado por el autor con los descriptores minicpm, minicpm5, llama, thinking, fable5, tool-calling, function-calling, agentic, coding, instruction-following y conversational. Es decir, se presenta como un modelo pequeno orientado a razonamiento con modo de pensamiento, llamada a herramientas y flujos de agente, con soporte declarado de ingles y chino y licencia Apache-2.0.

Su relevancia practica esta en el formato y el tamano: al ser un GGUF de 2,5B con cuantizaciones de menos de 1,7 GB, puede ejecutarse en CPU, portatiles y GPUs de gama de entrada, lo que lo situa en la categoria de modelos para agentes locales y automatizacion de bajo coste. El repositorio no incluye resultados de benchmarks, ficha tecnica de arquitectura ni detalles del entrenamiento del modelo base, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio indican "minicpm", "minicpm5" y "llama", pero no se detalla la arquitectura en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 (2,52B) |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas/imatrix i1) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix en este repositorio; cuantizaciones estaticas en un repositorio separado). El modelo base esta en formato HuggingFace/transformers |
| Pipeline | text-generation |
| Libreria declarada | transformers |
| Tamano del repositorio | 30,2 GB (incluye todas las variantes de cuantizacion) |
| Modelo base | GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic |
| Cuantizado por | mradermacher (readme_rev 1, quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en los datos proporcionados. Los tags del repositorio incluyen "llama" y "minicpm5", lo que sugiere una implementacion de tipo transformer decoder-only dentro de la familia MiniCPM, pero no se confirma ni el numero de capas, ni las dimensiones ocultas, ni el mecanismo de atencion, ni la longitud de contexto nativa. Tampoco se detalla si emplea atencion lineal, decodificacion especulativa u otras optimizaciones.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El nombre del modelo ("Claude-Fable5-1-Thinking-Agentic") apunta a un ajuste fino orientado a razonamiento con modo thinking y comportamiento agentico, pero no hay informacion verificable sobre el proceso. La unica innovacion tecnica documentada es la del propio repositorio: cuantizacion con matriz de importancia (imatrix) para todas las variantes i1, lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano. El autor advierte explicitamente de que las variantes de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) son de calidad muy baja y solo para casos desesperados.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag "conversational" y el pipeline text-generation.
- Razonamiento con modo de pensamiento explicito (tag "thinking"), presumiblemente con bloques de razonamiento previos a la respuesta.
- Llamada a herramientas y funciones (tags "tool-calling" y "function-calling").
- Comportamiento agentico: flujos multi-paso y uso de herramientas encadenadas (tag "agentic").
- Generacion y asistencia de codigo (tag "coding").
- Seguimiento de instrucciones (tag "instruction-following").
- Capacidad multilingue limitada a ingles y chino; el castellano no figura entre los idiomas declarados.
- No se declaran capacidades de vision, audio ni multimodalidad en la informacion disponible.
- No se documentan capacidades especificas de matematicas, resumen de documentos largos o contextos extensos.

## Casos de uso

- Agentes locales en portatil o equipo de sobremesa: con la variante Q4_K_M (1,7 GB) el modelo cabe en cualquier equipo con 4 GB de VRAM o con 8 GB de RAM en CPU, lo que permite montar un agente con tool calling sin depender de APIs externas.
- Automatizacion de tareas de escritorio y scripting: combinado con llama.cpp o Ollama, puede generar y ejecutar codigo de pegamento para tareas de automatizacion gracias a los tags de coding y function calling.
- Enrutado de peticiones y clasificacion dentro de un pipeline mayor: su tamano reducido permite usarlo como modelo de primera linea que decide si una consulta se resuelve localmente o se escala a un modelo mayor, reduciendo coste en despliegues con muchos usuarios.
- Prototipado rapido de asistentes conversacionales en ingles o chino: el modelo sirve para validar productos de chat antes de invertir en modelos de mayor tamano, siempre que el contexto requerido sea corto, ya que no se ha publicado la ventana de contexto.
- Entornos con requisitos de privacidad o sin conectividad: al ejecutarse en local con GGUF, los datos no salen de la maquina, lo que encaja en escenarios con datos sensibles o despliegues en red aislada.
- Educacion y experimentacion en investigacion: la licencia Apache-2.0 y los multiples niveles de cuantizacion permiten estudiar el efecto de la cuantizacion extrema en un modelo de 2,5B, comparando IQ1/IQ2 frente a Q4 y Q5 con el mismo modelo base.
- Procesamiento por lotes de bajo coste en CPU: tareas de reescritura, extraccion simple o resumen de textos cortos en ingles y chino, ejecutables en servidores sin GPU.
- Base para fine-tuning o adaptacion posterior: los pesos del modelo base en transformers pueden reutilizarse con LoRA para dominios concretos y despues recuantizarse a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, BBH ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base, y tampoco se han encontrado datos de rendimiento en la busqueda web realizada.

## Requisitos de hardware

- Los tamanos de peso publicados por el autor son: IQ1_S 0,8 GB; IQ1_M 0,8 GB; IQ2_XXS 0,9 GB; IQ2_XS 1,0 GB; IQ2_S 1,0 GB; IQ2_M 1,1 GB; Q2_K_S 1,1 GB; Q2_K 1,1 GB; IQ3_XXS 1,2 GB; IQ3_XS 1,2 GB; Q3_K_S 1,3 GB; IQ3_S 1,3 GB; IQ3_M 1,3 GB; Q3_K_M 1,4 GB; Q3_K_L 1,5 GB; IQ4_XS 1,5 GB; IQ4_NL 1,6 GB; Q4_0 1,6 GB; Q4_K_S 1,6 GB; Q4_K_M 1,7 GB. Los quants de mayor calidad (Q4_1, Q5_K_S, Q5_K_M, Q6_K, small-IQ4_NL) no tienen tamano publicado en la informacion disponible.
- VRAM estimada para inferencia: partiendo de los tamanos de fichero anteriores (estimacion orientativa), Q4_K_M requiere del orden de 1,7 GB solo en pesos, mas la cache KV y el overhead del runtime; Q6_K se situaria previsiblemente por encima de 2 GB. La cache KV depende de la longitud de contexto, que no se ha publicado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM (GTX 1650 4 GB, RTX 3050, RTX 3060 12 GB, RTX 4060, RX 6600), y tambien en Apple Silicon y en CPU con 8 GB de RAM. Las variantes de 1 a 3 bits permiten incluso equipos con 2-4 GB de memoria libre.
- GPU de datacenter: A100, H100 o similares no son necesarias para este modelo; solo tendrian sentido para servir muchas replicas en paralelo o para reentrenamiento.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui (oobabooga) y cualquier runtime compatible con GGUF. En GPU, la aceleracion mediante offload de capas es la via habitual. Para vLLM el soporte de GGUF es limitado/experimental; TGI no soporta GGUF de forma nativa y requeriria los pesos originales en safetensors. Los endpoints declarados como compatibles ("endpoints_compatible") permiten desplegarlo en proveedores de inferencia compatibles con la API de transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo evaluado, por lo que no es posible comparar rendimiento. La tabla siguiente recoge unicamente datos publicos de referencia de modelos de tamano comparable; se recomienda verificar cada cifra en la model card oficial antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic (este repositorio, cuantizado) | 2,52B | no disponible | Apache-2.0 | Si (i1/imatrix y estatico) | Tags de tool calling, agentic y thinking; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache-2.0 | Si, ampliamente disponible | Menor tamano; sin modo thinking |
| Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License (con restricciones para grandes despliegues) | Si, ampliamente disponible | Mayor contexto; licencia no totalmente permisiva |
| Gemma-2-2B-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | Si, ampliamente disponible | Contexto mas corto; condiciones de uso especificas |

Observacion relevante: los modelos comparables citados tienen documentacion publica extensa (arquitectura, contexto, benchmarks), mientras que para el modelo de esta ficha no se ha publicado ninguna de esas metricas. La ventaja principal del modelo aqui descrito es la disponibilidad de cuantizaciones imatrix muy agresivas (desde 0,8 GB) bajo licencia Apache-2.0, lo que facilita despliegues en hardware muy limitado.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de benchmarks, por lo que el rendimiento real en razonamiento, codigo o tool calling es desconocido y no debe asumirse a partir de los tags.
- Riesgo de alucinacion elevado en las cuantizaciones de 1 y 2 bits: el propio autor etiqueta IQ1_S e IQ1_M como "for the desperate"/"mostly desperate" y Q2_K_S como "very low quality".
- La cuantizacion degrada la calidad de forma no uniforme; en modelos pequenos (2,5B) el efecto suele ser mas acusado que en modelos grandes. Se recomienda IQ4_XS o Q4_K_M como minimo para uso serio.
- Idiomas limitados a ingles y chino: no hay soporte declarado de castellano ni de otras lenguas, y el rendimiento en idiomas no declarados sera previsiblemente pobre.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas, resumen de documentos extensos ni agentes con historial amplio.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni alineacion. Al ser un ajuste fino sobre un modelo pequeno, es probable que herede sesgos de los datos de entrenamiento, que no se han detallado.
- Origen del modelo base opaco: el repositorio GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic no viene acompanado de documentacion de entrenamiento en la informacion disponible, por lo que no puede verificarse la procedencia de los datos.
- Licencia Apache-2.0 en el repositorio cuantizado, pero conviene confirmar que el modelo base mantiene la misma licencia, ya que el nombre sugiere un ajuste derivado de un modelo de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- El modelo base no esta incluido como safetensors en este repositorio: solo se distribuyen pesos GGUF. Para entrenamiento o fine-tuning hay que acudir al repositorio original.
- No dispone de capacidades multimodales ni de vision; no debe usarse en tareas que requieran procesamiento de imagenes o audio.

## Enlaces

- Repositorio GGUF con cuantizaciones i1/imatrix: https://huggingface.co/mradermacher/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-GGUF
- Modelo base: https://huggingface.co/GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-i1-GGUF
- Fichero imatrix para crear cuantizaciones propias: https://huggingface.co/mradermacher/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-i1-GGUF/resolve/main/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic.imatrix.gguf
- Ejemplo de README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) en la busqueda web realizada.
