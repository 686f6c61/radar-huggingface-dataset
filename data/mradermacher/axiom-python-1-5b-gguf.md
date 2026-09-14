# mradermacher/axiom-python-1.5B-GGUF

## Resumen

mradermacher/axiom-python-1.5B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo coderian/axiom-python-1.5B, un modelo de generacion de texto especializado en codigo Python. La cuantizacion la realiza mradermacher, un autor conocido en HuggingFace por publicar versiones comprimidas de modelos abiertos para su uso con llama.cpp y herramientas derivadas. El modelo base pertenece a la familia Qwen2 (campo `model_type: qwen2`), tiene 1.543.714.304 parametros (aproximadamente 1,5 mil millones) y se distribuye bajo licencia Apache 2.0.

El interes practico de este repositorio esta en que permite ejecutar un modelo de generacion de codigo de ~1,5B en hardware muy modesto: las cuantizaciones van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16), lo que lo hace viable en GPUs de consumo, portatiles sin GPU dedicada e incluso en CPU. Es un modelo afinado mediante LoRA y SFT con TRL sobre el modelo base, orientado a tareas de codigo Python y con soporte declarado de turco (tr) e ingles (en).

Se trata de un modelo denso (no MoE), con arquitectura transformer decoder-only de tipo Qwen2 y etiquetado como conversacional. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni resultados de benchmarks, por lo que su evaluacion debe hacerse de forma empirica antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tipo Qwen2 (model_type: qwen2) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors para transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con 1,5B de parametros totales y sin mecanismos de mezcla de expertos. El repositorio analizado no contiene los pesos originales, sino las conversiones a GGUF generadas por mradermacher a partir de coderian/axiom-python-1.5B. El proceso de cuantizacion es estatico (los metadatos internos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`), y en el momento de publicacion no habia cuantizaciones ponderadas/imatrix disponibles; el autor indica que pueden solicitarse mediante una discusion en la comunidad.

Sobre el entrenamiento del modelo base, la informacion disponible unicamente declara que se trata de un afinamiento con LoRA y SFT usando TRL sobre un modelo Qwen2, con etiquetas que apuntan a codigo Python (`code`, `python`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Estos datos deberian consultarse en la ficha del modelo base, coderian/axiom-python-1.5B.

## Capacidades

- Generacion de texto y codigo, con especializacion declarada en Python.
- Generacion de codigo asistida por contexto conversacional (etiqueta `conversational`), lo que permite mantener dialogos multi-turno.
- Capacidad de continuacion y autocompletado de fragmentos de codigo.
- Soporte multilingue limitado a turco e ingles segun los metadatos del modelo.
- Al ser un modelo de 1,5B, es apto para tareas de generacion de baja latencia en local.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se declara soporte de matemáticas avanzadas ni de razonamiento formal mas alla de lo que permita la generacion de codigo.

## Casos de uso

- Autocompletado de codigo Python en el IDE: con cuantizacion Q4_K_M (1,1 GB) el modelo puede ejecutarse localmente y responder en milisegundos a sugerencias de linea o bloque, sin enviar codigo propietario a servicios externos.
- Generacion de tests unitarios y docstrings: el modelo puede producir borradores de pruebas pytest y documentacion a partir de funciones existentes, que el desarrollador revisa y ajusta antes de integrarlos.
- Revision estatica asistida en pipelines de CI: integrado mediante llama.cpp o bindings de Python, puede generar comentarios automáticos sobre cambios en un pull request, como primer filtro antes de la revision humana.
- Traduccion de documentacion tecnica turco-ingles: dado su soporte declarado de ambos idiomas, es util para equipos que mantienen documentacion o comentarios de codigo en turco y necesitan versiones en ingles.
- Asistente conversacional para librerias y APIs internas: gracias a la etiqueta conversacional y a su tamano reducido, puede desplegarse como chatbot de soporte para dudas frecuentes de una libreria Python concreta.
- Generacion de scripts de automatizacion y ETL: tareas de parseo de ficheros, transformacion de datos o scripting de sistema, donde la latencia baja y el coste nulo de inferencia son prioritarios.
- Prototipado en equipos con hardware limitado: permite validar una idea de producto basada en LLM en un portatil o en una GPU de gama de entrada antes de escalar a un modelo mayor.
- Base para afinamiento especifico de dominio: al ser un modelo pequeno con licencia Apache 2.0, sirve como punto de partida para LoRA sobre un corpus interno de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio de cuantizaciones no incluye evaluaciones tipo MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos, y el autor tampoco aporta mediciones de latencia o throughput.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones calculadas a partir del tamano de cada fichero GGUF mas el overhead de contexto y de la propia libreria; no proceden de mediciones publicadas por el autor.

- f16 (3,2 GB): requiere aproximadamente 4 GB de VRAM, o unos 4-5 GB de RAM en inferencia por CPU.
- Q8_0 (1,7 GB): aproximadamente 2,5 GB de VRAM.
- Q6_K (1,4 GB) y Q5_K_M / Q5_K_S (1,2 GB): aproximadamente 2 GB de VRAM.
- Q4_K_M (1,1 GB) y Q4_K_S (1,0 GB): aproximadamente 1,5-2 GB de VRAM. El autor los marca como "fast, recommended".
- IQ4_XS (1,0 GB) y Q3_K (0,9-1,0 GB): aproximadamente 1,5 GB de VRAM.
- Q2_K (0,8 GB): aproximadamente 1,2 GB de VRAM, con la mayor perdida de calidad de la serie.

Recomendaciones por hardware:

- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores, usando Q4_K_M o Q5_K_M.
- En GPUs de datacenter (A100, H100, L40S) el modelo queda muy infrautilizado; su uso solo tiene sentido si se sirven muchas replicas concurrentes por GPU.
- Funciona en CPU con llama.cpp, aunque la latencia por token sera notablemente mayor; es viable para uso interactivo en Apple Silicon con Metal.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para vLLM o TGI seria necesario usar el modelo base en safetensors, no estos ficheros GGUF.
- No se dispone de datos de latencia ni de throughput publicados por el autor.

## Comparativa con modelos similares

Los datos de la columna "Modelo alternativo" proceden de la documentacion publica de cada familia y no de la informacion proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones. Los datos del modelo analizado si proceden de los metadatos del repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| axiom-python-1.5B-GGUF | 1,54B | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) | Afinado con LoRA + SFT sobre Qwen2, idiomas tr/en |
| Qwen2.5-Coder-1.5B (Instruct/Base) | 1,5B | 32.768 tokens segun documentacion publica | Apache 2.0 | safetensors, GGUF de terceros | Referencia habitual de la misma categoria y tamano |
| DeepSeek-Coder-1.3B | 1,3B | 16.384 tokens segun documentacion publica | licencia propia de DeepSeek | safetensors, GGUF de terceros | Modelo entrenado desde cero sobre codigo, sin herencia de Qwen |
| StarCoder2-3B | 3B | 16.384 tokens segun documentacion publica | BigCode OpenRAIL-M | safetensors, GGUF de terceros | Mayor tamano y mayor coste de inferencia; licencia con restricciones de uso |

La ventaja diferencial de este repositorio frente a los anteriores es la disponibilidad inmediata de 12 niveles de cuantizacion GGUF mantenidos por un mismo autor, lo que simplifica el despliegue en hardware limitado. La desventaja es la ausencia total de benchmarks publicados y de informacion sobre el dataset de entrenamiento.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: se desconoce su rendimiento real en HumanEval, MBPP o cualquier otra prueba de codigo.
- No se especifica el numero de tokens de entrenamiento ni la composicion del dataset, por lo que no se puede evaluar la cobertura de lenguajes, frameworks o versiones de Python.
- Riesgo de alucinacion relevante: al ser un modelo de 1,5B, puede inventar APIs, funciones de libreria o parametros inexistentes. Todo codigo generado debe pasar revision humana y pruebas automatizadas.
- Idiomas: los metadatos solo declaran turco e ingles. No hay soporte declarado de castellano, lo que puede degradar la calidad de las respuestas en espanol o en prompts mezclados.
- Longitud de contexto no documentada en esta ficha; si se usan prompts largos conviene verificar el limite real del modelo base antes de disenar el sistema.
- El modelo esta especializado en Python; su rendimiento en otros lenguajes de programacion no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Es una de las licencias mas permisivas del ecosistema.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma apreciable; para produccion se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas/imatrix publicadas por el autor en el momento de la publicacion, lo que limita una posible mejora de calidad a igual tamano.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- El proceso de cuantizacion lo realiza un tercero (mradermacher), no el autor del modelo base; los posibles errores de conversion no estan cubiertos por el equipo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/axiom-python-1.5B-GGUF
- Modelo base: https://huggingface.co/coderian/axiom-python-1.5B
- Pagina de descargas del cuantizador para este modelo: https://hf.tst.eu/model#axiom-python-1.5B-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
