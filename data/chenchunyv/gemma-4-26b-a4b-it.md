# chenchunyv/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B es un modelo multimodal de pesos abiertos desarrollado por Google DeepMind, publicado en variantes preentrenada e instruida dentro de la familia Gemma 4. Esta ficha concreta corresponde a la reproducción alojada por el usuario chenchunyv bajo el identificador `chenchunyv/gemma-4-26B-A4B-it`, derivada del modelo base `google/gemma-4-26B-A4B` y publicada con licencia Apache 2.0. Resuelve tareas de generacion de texto, razonamiento, codigo y comprension de imagen y texto (pipeline `image-text-to-text`), con soporte nativo de function calling y de prompt de sistema.

La arquitectura es un transformer decoder-only con mezcla de expertos (MoE): 25.805.936.206 parametros totales segun el recuento de safetensors del repositorio (25,8B), de los cuales solo 3,8B estan activos por token, con 8 expertos activos sobre 128 totales mas 1 compartido. Incorpora atencion hibrida que intercala ventanas deslizantes locales de 1024 tokens con atencion global completa, capas globales con claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. La ventana de contexto declarada por la familia es de 256K tokens.

Es relevante ahora porque combina un coste de computo por token propio de un modelo denso de ~4B con la capacidad de representacion de 25,8B de parametros, lo que permite desplegarlo en GPU de consumo y estaciones de trabajo sin renunciar a contexto largo ni a multimodalidad. El repositorio concreto no documenta el proceso de ajuste ni publica resultados de evaluacion numericos, por lo que la informacion tecnica disponible procede casi por completo de la model card de la familia Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con Mixture-of-Experts (MoE) y atencion hibrida (ventana deslizante local de 1024 tokens + atencion global completa) |
| Parametros totales | 25.805.936.206 (25,8B) segun safetensors del repositorio; la model card de la familia declara 25,2B para el modelo base |
| Parametros activos | 3,8B |
| Longitud de contexto | 256K tokens (segun la model card de la familia Gemma 4) |
| Tipos de cuantizacion | No disponibles: el repositorio no lista pesos cuantizados ni ficheros GGUF. Los pesos publicados estan en precision completa, por lo que pueden derivarse cuantizaciones de 8 y 4 bits |
| Idiomas soportados | Mas de 140 idiomas segun la documentacion de la familia Gemma 4; no se especifica el alcance real de este ajuste concreto |
| Licencia | apache-2.0 (la model card enlaza adicionalmente a los terminos de licencia de Gemma 4) |
| Formato de pesos | safetensors |
| Numero de capas | 30 |
| Expertos | 8 activos / 128 totales + 1 compartido |
| Tamano del vocabulario | 262.000 tokens |
| Modalidades soportadas | Texto e imagen (el audio solo esta soportado en los modelos E2B, E4B y 12B de la familia) |
| Encoder de vision | Aproximadamente 550M de parametros |
| Tamano del repositorio | 51,6 GB |
| Libreria de inferencia | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo sigue el diseno de la familia Gemma 4: un transformer decoder-only con atencion hibrida que intercala capas de atencion local con ventana deslizante de 1024 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Para limitar el consumo de memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). La variante 26B A4B es la unica MoE de la familia: 30 capas, 8 expertos activos de un total de 128 mas un experto compartido, con 3,8B de parametros activos y 25,2B totales declarados. La multimodalidad se resuelve mediante un encoder de vision de aproximadamente 550M de parametros que proyecta la informacion visual al espacio de embeddings del decodificador.

No se dispone de informacion sobre el proceso de entrenamiento especifico de este repositorio: la model card reproduce la documentacion de la familia Gemma 4 (que menciona variantes preentrenada e instruida, modos de razonamiento configurables, soporte nativo del rol `system` y function calling nativo) pero no detalla el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias para esta copia concreta. El texto de la model card disponible esta truncado, y el informe tecnico referenciado (`arxiv:2607.02770`) no aporta cifras en la informacion proporcionada. El tag `eval-results` aparece en los metadatos del repositorio, pero no se incluyen resultados numericos.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de chat template y rol `system` nativo.
- Razonamiento con modos de pensamiento (thinking) configurables, segun la descripcion de la familia.
- Generacion y comprension de codigo, con mejoras declaradas en benchmarks de programacion respecto a generaciones anteriores.
- Capacidades aganticas: function calling nativo y flujos de razonamiento multi-paso orientados a agentes autonomos.
- Comprension de imagen y texto: entrada de imagenes con soporte de relacion de aspecto y resolucion variables, y salida de texto.
- Multilingue: mas de 140 idiomas declarados por la documentacion de Gemma 4.
- Contexto largo de hasta 256K tokens, relevante para documentos extensos y conversaciones prolongadas.
- No soporta entrada de audio en esta variante (el audio esta limitado a E2B, E4B y 12B).
- No se documentan en el repositorio capacidades adicionales especificas del ajuste de chenchunyv.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a la ventana de 256K tokens y al soporte del rol `system`, lo que permite fijar tono, politicas y restricciones de la marca de forma estable.
- Analisis de documentos con imagenes: facturas, informes escaneados o capturas de pantalla pueden enviarse directamente como imagen junto a la pregunta, aprovechando el pipeline `image-text-to-text` sin necesidad de un OCR externo en el circuito.
- Agentes autonomos con herramientas: el function calling nativo permite conectar el modelo a APIs internas, bases de datos o sistemas de ticketing y encadenar varias llamadas en un mismo flujo de razonamiento.
- Asistencia a la programacion en produccion: con 3,8B de parametros activos, el coste de inferencia por token es bajo para su tamano, lo que hace viable integrarlo en asistentes de codigo, revision de pull requests o generacion de tests dentro de pipelines de CI/CD.
- Procesamiento de documentacion tecnica multilingue: la cobertura de mas de 140 idiomas declarada permite resumir, traducir o extraer informacion de manuales y contratos en varios idiomas con un unico modelo.
- Razonamiento sobre repositorios de codigo extensos: la combinacion de contexto de 256K y atencion hibrida permite cargar varios ficheros o un arbol de proyecto completo y responder preguntas sobre dependencias y arquitectura.
- Despliegue en estacion de trabajo o servidor de gama media: al activar solo 3,8B de parametros, el modelo puede servirse en una sola GPU de 24 GB en cuantizacion de 4 bits para prototipos, herramientas internas o asistentes locales con datos que no pueden salir de la organizacion.
- Clasificacion y extraccion estructurada a escala: con salidas guiadas por plantilla y function calling, puede convertirse en un extractor de entidades o un clasificador de tickets ejecutado en lote sobre grandes volumenes de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el tag `eval-results` y referencia el informe tecnico `arxiv:2607.02770`, pero no se han facilitado cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para este ajuste ni para el modelo base.

## Requisitos de hardware

- Pesos en precision completa (BF16/FP16): aproximadamente 51,6 GB, coherente con el tamano del repositorio. Requiere GPU de 80 GB (A100 80GB, H100 80GB, H200) o reparto en varias GPU.
- Cuantizacion de 8 bits: en torno a 26 GB de pesos; encaja en A100 40GB, L40S 48GB o RTX 6000 Ada 48GB, dejando margen para cache KV segun la longitud de contexto.
- Cuantizacion de 4 bits: en torno a 14-15 GB de pesos; cabe en RTX 4090, RTX 3090 y RTX 4080 de 16 GB, aunque con poco margen para contextos muy largos.
- GPU de consumo: si, es desplegable en GPU de consumo en cuantizaciones de 8 y 4 bits. En BF16 no cabe en ninguna GPU de consumo actual.
- Coste de computo: al activar 3,8B de parametros por token, el coste de inferencia por token es notablemente inferior al de un modelo denso de 25,8B; la restriccion principal es de memoria, no de FLOPs.
- Cache KV: no disponible el desglose por capa y cabeza de atencion necesario para calcular el consumo exacto a 256K tokens. La atencion hibrida con ventanas locales y claves y valores unificados en las capas globales reduce ese consumo respecto a un transformer de atencion completa equivalente.
- Opciones de despliegue: la libreria declarada es `transformers`. El tag `endpoints_compatible` indica compatibilidad con endpoints gestionados. Para vLLM, TGI, llama.cpp u Ollama se requiere soporte especifico de la arquitectura `gemma4` en cada runtime; no se confirma en la informacion disponible, y el repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este repositorio.

## Comparativa con modelos similares

Comparativa dentro de la familia Gemma 4, con los datos de la model card. No se dispone de datos de modelos de otros fabricantes en la informacion proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidades | Arquitectura |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (esta variante) | 25,2B declarados / 25,8B en safetensors | 3,8B | 256K | Texto, imagen | MoE, atencion hibrida |
| Gemma 4 31B Dense | 30,7B | No aplica (denso) | 256K | Texto, imagen | Densa, 60 capas, encoder de vision ~550M |
| Gemma 4 12B Unified | 11,95B | No aplica (denso) | 256K | Texto, imagen, audio | Densa sin encoders, 48 capas |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | No aplica | 128K | Texto, imagen, audio | Densa con Per-Layer Embeddings, 42 capas |

Respecto al modelo denso de 31B, la variante 26B A4B ofrece una ventana de contexto identica, las mismas modalidades de texto e imagen y un coste de inferencia muy inferior gracias a los 3,8B de parametros activos, a cambio de un mayor consumo de memoria frente a un denso equivalente en activaciones y de un comportamiento de enrutamiento de expertos que puede ser mas dificil de predecir. Frente al 12B Unified y a los modelos E2B/E4B, la diferencia principal es la ausencia de soporte nativo de audio y un mayor requisito de memoria, compensado con mayor capacidad. La comparacion de rendimiento en benchmarks no esta disponible para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, por lo que no existe validacion de la comunidad ni historial de uso en produccion.
- La model card no documenta el proceso de ajuste: se desconoce el dataset, el metodo (SFT, DPO, RLHF) y el alcance real de las modificaciones sobre el modelo base `google/gemma-4-26B-A4B`. Un ajuste no documentado puede degradar capacidades del modelo original.
- No hay resultados de evaluacion publicados, pese al tag `eval-results`; no es posible verificar si el ajuste mejora o empeora al modelo base.
- La model card disponible esta truncada y reproduce la documentacion de la familia Gemma 4, no la de esta copia concreta.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de resumen de documentos largos y en contextos cercanos al limite de 256K tokens, donde la recuperacion de informacion puede degradarse.
- Los sesgos del modelo no estan documentados ni evaluados en la informacion disponible; la cobertura de mas de 140 idiomas es una declaracion de la familia y no implica calidad homogenea entre idiomas.
- Aunque la licencia declarada es Apache 2.0, la model card enlaza a los terminos de licencia especificos de Gemma 4; conviene revisar ese documento antes de un uso comercial, ya que puede imponer condiciones adicionales de atribucion o de uso aceptable.
- No hay soporte de audio en esta variante.
- No se incluyen pesos cuantizados ni GGUF; cualquier despliegue en llama.cpp u Ollama requiere convertir los pesos y disponer de soporte de la arquitectura `gemma4` en el runtime elegido.
- El nombre del repositorio sugiere una variante instruida, pero la procedencia y la autoria real del ajuste no estan verificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenchunyv/gemma-4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina del equipo: https://deepmind.google/models/gemma/
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las consultas devolvieron unicamente paginas genericas de Google (google.com, accounts.google.com) sin relacion con el modelo.
