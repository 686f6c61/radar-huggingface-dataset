# bcckfdn/minillama-test-v2.1-GGUF

## Resumen

bcckfdn/minillama-test-v2.1-GGUF es la version cuantizada en formato GGUF de un modelo de lenguaje de 52.953.984 parametros (aproximadamente 53 millones) entrenado desde cero por el usuario bcckfdn. El repositorio contiene unicamente los pesos en GGUF, derivados del modelo base bcckfdn/minillama-test-v2.1, y esta pensado para su ejecucion en llama.cpp, Ollama y LM Studio. La model card describe la arquitectura como SmolLM2 (familia Llama) con 22 capas y dimension oculta de 384, y declara un entrenamiento de 20.481 B de tokens.

El modelo se posiciona en el segmento ultra-ligero: con 53 millones de parametros ocupa apenas 0,3 GB de repositorio y sus cuantizaciones van de 43 MB (Q4_K_M) a 103 MB (BF16), lo que permite inferencia en CPU sin GPU dedicada, en dispositivos embebidos o incluso en moviles. Esta orientado a turco (tr) e ingles (en), con licencia Apache 2.0, lo que facilita su uso comercial y su redistribucion.

Su relevancia actual es la de un artefacto de experimentacion mas que la de un modelo de produccion: tiene 0 descargas y 0 likes, no publica benchmarks y su propia model card presenta una discrepancia de nomenclatura (los ficheros se llaman `smollm2-135m-tr-v1`, pese a que el recuento real de parametros en safetensors es de 53 millones, no 135 millones). Resulta util como banco de pruebas de cuantizacion y de pipelines GGUF, y como punto de partida para fine-tuning en turco de coste minimo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia SmolLM2 (Llama); 22 capas, hidden size 384 |
| Parametros totales | 52.953.984 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros de 103 MB, 55 MB, 45 MB y 43 MB); el modelo base se distribuye en safetensors |

Datos adicionales: repositorio de 0,3 GB, pipeline `text-generation`, creado el 2026-09-18 y actualizado el mismo dia. Modelo base: bcckfdn/minillama-test-v2.1.

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo entrenado desde cero con la arquitectura SmolLM2, que es una implementacion transformer decoder-only del estilo Llama. Los hiperparametros declarados son 22 capas y dimension oculta de 384, coherentes con un modelo de 53 millones de parametros. No se especifica el numero de cabezas de atencion, si se emplea Grouped Query Attention, la funcion de activacion, el tipo de normalizacion ni la posicion de las capas de normalizacion.

En cuanto al entrenamiento, la unica cifra disponible es el volumen de tokens: 20.481 B. No se detalla la composicion del dataset (proporcion turco/ingles, fuentes, filtrado, deduplicacion), ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni variantes hibridas. La informacion publicada es, por tanto, insuficiente para reproducir el entrenamiento o evaluar la calidad del corpus.

## Capacidades

- Generacion de texto conversacional en turco e ingles, con un modo de chat invocado mediante `llama-cli -cnv`.
- Continuacion y completado de texto corto, propia de un modelo de 53 millones de parametros entrenado sobre 20.481 B de tokens.
- Generacion de texto bilingue turco-ingles, segun los idiomas declarados en la metadata del repositorio.
- Soporte de inferencia cuantizada en cuatro niveles (BF16, Q8_0, Q5_K_M, Q4_K_M), lo que permite ejecucion en CPU.
- Integracion con el ecosistema llama.cpp, Ollama y LM Studio.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Pruebas de cuantizacion en pipelines GGUF: dado que el repositorio incluye cuatro niveles de cuantizacion del mismo modelo, sirve para medir la degradacion de perplexity o de calidad de generacion entre BF16 y Q4_K_M en un modelo de solo 53 millones de parametros, con ciclos de evaluacion muy rapidos.
- Inferencia en dispositivos embebidos y edge: con 43 MB en Q4_K_M, el modelo cabe en la memoria de una Raspberry Pi o de un telefono y puede generar texto sin conexion, algo inviable para modelos de miles de millones de parametros.
- Autocompletado de frases cortas en turco: el modelo puede integrarse en editores o teclados como motor de sugerencia local, ya que su latencia en CPU es baja por el reducido numero de parametros.
- Banco de pruebas de fine-tuning en turco: su tamano permite ejecutar ajustes completos o LoRA en una unica GPU de consumo e iterar sobre hiperparametros en minutos, antes de escalar a modelos mayores.
- Validacion de pipelines de despliegue en CI/CD: sirve como modelo de humo para verificar que un servidor llama.cpp, un Modelfile de Ollama o un contenedor de inferencia arrancan y responden correctamente, sin consumir recursos de GPU.
- Enrutamiento o filtrado previo en arquitecturas en cascada: puede clasificar o etiquetar consultas simples antes de derivarlas a un modelo grande, reduciendo coste en sistemas con mucho trafico de baja complejidad.
- Demostraciones docentes de arquitectura transformer: con 22 capas y hidden size 384, es adecuado para ilustrar el ciclo completo de entrenamiento, cuantizacion y despliegue en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,11 GB para los pesos en BF16 y 0,05 GB en Q4_K_M. El consumo real dependera del cache KV, cuyo tamano no se puede calcular porque no se especifican cabezas de atencion ni longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. Una RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este modelo y solo tendrian sentido para servir lotes muy grandes o muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en cualquiera, incluidas GPUs integradas y aceleradores modestos. Tambien funciona en CPU pura y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio estan documentados explicitamente en la model card. El soporte en vLLM o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos corresponden a conocimiento general y no se han verificado en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| bcckfdn/minillama-test-v2.1-GGUF | 52,95 M | No disponible | Apache 2.0 | tr, en | GGUF en HuggingFace; 0 descargas |
| SmolLM2-135M (HuggingFaceTB) | 135 M | 2.048 tokens (referencia general) | Apache 2.0 | en (principalmente) | safetensors y GGUF; ampliamente descargado |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens (referencia general) | Apache 2.0 | multilingue | safetensors y multiples cuantizaciones |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens (referencia general) | Apache 2.0 | en (principalmente) | safetensors y GGUF |

Frente a estas alternativas, el modelo analizado es el mas pequeno de la lista y el unico con foco declarado en turco, pero tambien el unico sin benchmarks publicados, sin comunidad y con nomenclatura inconsistente entre el nombre del repositorio y el de los ficheros.

## Limitaciones y advertencias

- Con 53 millones de parametros, la capacidad de razonamiento, la coherencia en textos largos y el conocimiento factual son muy limitados; es previsible un alto indice de alucinacion y de respuestas gramaticalmente correctas pero vacias de contenido.
- No hay benchmarks publicados que permitan estimar su calidad real en turco o en ingles.
- La model card no documenta la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de dominio, de genero, culturales o politicos.
- La longitud de contexto no esta declarada; usar el modelo con prompts largos puede producir degradacion silenciosa.
- Existe una discrepancia clara de nomenclatura: los ficheros GGUF se llaman `smollm2-135m-tr-v1`, mientras que el recuento real de parametros (52.953.984) corresponde a un modelo de aproximadamente 53 millones, no de 135 millones. Conviene verificar el contenido antes de integrarlo en cualquier pipeline.
- El modelo se presenta como "test" (v2.1) y acumula 0 descargas y 0 likes, lo que sugiere que no ha pasado por una validacion externa ni por un proceso de revision comunitario.
- La licencia Apache 2.0 permite uso comercial y redistribucion, pero el autor no ofrece garantias sobre el origen de los datos de entrenamiento, lo que traslada el riesgo legal al usuario.
- No se documenta si el modelo ha pasado por fases de alineacion (RLHF, DPO), por lo que su comportamiento en conversacion puede ser erratico o propenso a repetir patrones del corpus.
- No se recomienda su uso en produccion para tareas sensibles (atencion al cliente, contenido medico, legal o financiero) sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcckfdn/minillama-test-v2.1-GGUF
- Modelo base: https://huggingface.co/bcckfdn/minillama-test-v2.1
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los unicos enlaces obtenidos corresponden a la Universidad de Koya (https://koyauniversity.org/ y subdominios asociados) y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
