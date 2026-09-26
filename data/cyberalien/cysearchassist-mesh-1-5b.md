# cyberalien/CySearchAssist-Mesh-1.5B

## Resumen

CySearchAssist-Mesh-1.5B es un modelo de generación de texto especializado en reescritura de consultas (query rewriting) para bibliotecas de assets 3D y Static Mesh. Lo publica el usuario cyberalien y parte de Qwen/Qwen2.5-1.5B-Instruct, sobre el que se aplica un ajuste fino supervisado con LoRA y posterior fusión en pesos FP16. Su función no es buscar assets ni inspeccionar geometría, sino transformar la petición de un usuario en inglés, francés, español, alemán o italiano en un conjunto estructurado de frases de búsqueda en inglés, categorías y etiquetas sugeridas y exclusiones explícitas.

El modelo resuelve un problema muy concreto: los índices de metadatos de bibliotecas de mallas estáticas suelen estar en inglés y con vocabulario técnico, mientras que los artistas consultan en su idioma y con descripciones ambiguas. CySearchAssist-Mesh genera un objeto JSON con las claves `mesh_prompt`, `variations` (exactamente dos), `suggested_categories`, `suggested_tags` y `exclude`, bajo un contrato fijo denominado `cymesh-query-v1`. El host es el responsable de buscar en su propio índice y de validar el JSON antes de usarlo.

Con 1.543.714.304 parámetros reales (1,5B) y un repositorio de 3,1 GB en FP16, está pensado para ejecutarse en local, tanto en CPU como en CUDA, y se integra de forma opcional en el plugin CyMesh MeshLibrary de Unreal Engine. Es relevante ahora porque demuestra un patrón habitual en IA open source: modelos pequeños y muy especializados que sustituyen a LLM generalistas en una tarea acotada, con coste de inferencia y requisitos de hardware mínimos. Su licencia Apache-2.0 facilita la integración comercial. No incluye adaptador separado ni requiere descargar los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para el ajuste; el modelo base Qwen2.5-1.5B-Instruct admite 32.768 tokens |
| Tipos de cuantizacion | No disponible. El autor indica explicitamente que estos exports no son GGUF ni estan cuantizados a 4 bits; se distribuye en FP16 |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano (segun metadatos y corpus sintetico) |
| Licencia | Apache-2.0 (con archivos LICENSE, LICENSE.base y NOTICE para atribucion del modelo base) |
| Formato de pesos | safetensors (FP16, pesos fusionados, aproximadamente 3,10 GB en total con tokenizer y configuracion) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct, revision fijada 989aa7980e4cf806f80c7fef2b1adb7bc71aa306 |
| Tag de pipeline | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2 en configuracion decoder-only para generacion de texto, heredada de Qwen2.5-1.5B-Instruct. Sobre esa base se aplica un ajuste fino con LoRA durante 2 epocas con semilla 20260923, tras lo cual el adaptador se fusiona en los pesos base y se exporta en FP16. El resultado es un unico checkpoint listo para cargar con `transformers` sin adaptador separado y sin codigo remoto (`trust_remote_code=False`).

El corpus de entrenamiento es CyMesh, un conjunto sintetico de texto con 10.025 ejemplos distribuidos en 84 conceptos y cinco idiomas, con particiones de entrenamiento, validacion y test separadas por concepto para evitar filtraciones. El split de entrenamiento contiene 6.677 ejemplos. Los hashes del dataset y del prompt quedan registrados en `mesh_query_config.json`, y el prompt del sistema vive en `mesh_query_prompt.txt`, cuyo SHA-256 debe coincidir con el registrado para respetar el contrato `cymesh-query-v1`. No se menciona RLHF ni DPO; el procedimiento descrito es ajuste supervisado con LoRA mas fusion. Tampoco se incluyen mallas del proyecto, indices de biblioteca, conversaciones de usuario, credenciales ni checkpoints de entrenamiento.

## Capacidades

- Reescritura de consultas: convierte una peticion libre (por ejemplo, "une chaise en bois sans accoudoirs") en un objeto JSON estructurado con ingles como idioma de busqueda.
- Generacion de un `mesh_prompt` principal y exactamente dos `variations` alternativas para ampliar el recall de la busqueda.
- Sugerencia de categorias (`suggested_categories`) y etiquetas (`suggested_tags`) alineadas con vocabulario de bibliotecas de assets.
- Generacion de exclusiones explicitas (`exclude`) a partir de negaciones del usuario, aunque el propio autor senala que este campo es imperfecto.
- Multilingue de entrada: acepta consultas en ingles, frances, espanol, aleman e italiano y las normaliza a ingles.
- Salida con contrato fijo `cymesh-query-v1`, disenada para ser parseada y validada por el host.
- Decodificacion determinista recomendada (`do_sample=False`) con `max_new_tokens=256`, orientada a integracion reproducible en herramientas.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito. No genera embeddings ni modelos 3D, y no inspecciona geometria ni imagenes.

## Casos de uso

- Busqueda semantica en bibliotecas de Static Mesh de Unreal Engine: el modelo traduce la consulta del artista a ingles y produce categorias y etiquetas que el indice de metadatos del host puede consultar, activando la busqueda semantica en MeshLibrary.
- Desambiguacion de peticiones multilingues en estudios distribuidos: un equipo con artistas francoparlantes, hispanohablantes y germanoparlantes puede consultar el mismo catalogo en su idioma y obtener terminos de busqueda consistentes en ingles.
- Preprocesado de consultas antes de un motor de recuperacion: el `mesh_prompt` y las dos `variations` se pueden enviar en paralelo al indice para aumentar la cobertura, con fusion posterior de resultados en el host.
- Filtrado por exclusión: peticiones del tipo "sin accesorios", "sin materiales metalicos" o "sin variantes de baja poligonizacion" se traducen a un campo `exclude` que el host aplica como filtro negativo sobre los metadatos.
- Herramientas internas de digital asset management: estudios que mantienen su propio catalogo de mallas pueden integrar el modelo como capa de normalizacion de consultas, siempre validando el JSON y devolviendo rutas reales solo desde su propio indice.
- Asistentes de catalogo embebidos en el editor: con 1,5B de parametros en FP16 (unos 3,1 GB) el modelo puede cargarse en la misma maquina de trabajo del artista y ejecutarse en CPU si no hay GPU disponible.
- Generacion de vocabulario de etiquetado para indexacion: las categorias y etiquetas sugeridas pueden revisarse manualmente y reutilizarse para enriquecer los metadatos de assets nuevos.
- Integracion en pipelines de CI/CD de contenido: verificacion automatizada de que las consultas de prueba devuelven JSON valido antes de desplegar cambios en el indice de busqueda.

## Benchmarks y rendimiento

El autor publica un benchmark local de CPU (Ryzen 9 7900X, ocho hilos de PyTorch, archivos FP16 cargados para computo en FP32 sobre CPU), descrito como una prueba tecnica pequena cuyas expectativas se derivan de nombres de assets y no de anotaciones humanas de relevancia. Compara la variante de 1,5B con la de 0,5B.

| Medición | 1.5B | 0.5B |
|---|---:|---:|
| Contrato JSON válido, 37 consultas | 35/37 | 30/37 |
| Objetivo nombrado en el top cinco, 10 consultas de metadatos | 10/10 | 7/10 |
| Mediana de generación en CPU con el modelo cargado | 15,26 s | 5,23 s |
| RAM maxima del proceso, incluida la carga | 8,96 GiB | 3,09 GiB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor advierte que estas mediciones no establecen una precision general de recuperacion sobre bibliotecas arbitrarias y que no hay garantia de calidad equivalente entre los dos tamanos.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 3,1 GB solo para pesos, mas overhead de activaciones y cache; con contexto corto y lotes de 1, un margen de 4 a 5 GB es razonable. En FP32 sobre CPU la huella medida es de 8,96 GiB de RAM maxima de proceso, incluida la carga.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM. El modelo cabe sin problema en RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100, H100 y L4. El autor solo confirma soporte de CUDA por parte del runtime del host, sin modelos concretos.
- Cabe en GPU de consumo: si, es uno de sus puntos fuertes. Se puede ejecutar en CPU pura si no hay GPU, con la penalizacion de latencia medida.
- Opciones de despliegue: `transformers` (uso documentado en la model card) y text-generation-inference, segun los tags del repositorio (`text-generation-inference`, `endpoints_compatible`). No hay pesos GGUF ni cuantizaciones de 4 bits publicadas, por lo que llama.cpp u Ollama no funcionan con este checkpoint tal cual, salvo que se convierta manualmente.
- Latencia y throughput estimados: en CPU, mediana de 15,26 s por generacion con el modelo cargado, segun el benchmark del autor. Para GPU no se publican cifras. Ademas, el worker inicial de CyMesh recarga el modelo en cada busqueda, lo que anade latencia de carga; conviene mantener el modelo residente en despliegues propios.
- Nota de integracion: el instalador por defecto del plugin usa PyTorch de CPU; el soporte CUDA requiere que el usuario configure un runtime de PyTorch compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Formatos |
|---|---|---|---|---|---|
| CySearchAssist-Mesh-1.5B | 1,5B | No disponible para el ajuste (base: 32.768 tokens) | 35/37 JSON valido; 10/10 objetivo en top 5 | Apache-2.0 | safetensors FP16 |
| Variante 0.5B del mismo autor | 0,5B | No disponible | 30/37 JSON valido; 7/10 objetivo en top 5; 5,23 s de mediana en CPU | Apache-2.0 (segun el export) | safetensors FP16 |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens | No disponible para el contrato `cymesh-query-v1`; es un asistente generalista sin este ajuste | Apache-2.0 | safetensors, con cuantizaciones de la comunidad |

No se dispone de modelos directamente comparables de otros autores para esta tarea concreta de reescritura de consultas de mallas estaticas; la comparacion mas util es contra el modelo base y contra la variante de 0,5B del mismo autor.

## Limitaciones y advertencias

- Negaciones, sinonimos, ambiguedad multilingue y materiales pueden interpretarse de forma incorrecta; el propio autor reconoce que las exclusiones y las peticiones ambiguas siguen siendo imperfectas.
- Riesgo de alucinacion en categorias, etiquetas y exclusiones: el host debe validar el JSON y no tratar los valores generados como rutas de assets ni como comandos ejecutables.
- Politica de fallback obligatoria: ante una salida invalida hay que volver explicitamente al texto original del usuario.
- El host debe devolver unicamente rutas reales de su propio indice de assets y preservar las categorias seleccionadas manualmente.
- No es un buscador: no inspecciona geometria ni imagenes, no genera embeddings y no produce modelos 3D.
- No se publican pesos GGUF ni cuantizaciones de 4 bits, lo que limita el despliegue en stacks basados en llama.cpp u Ollama.
- El worker inicial de CyMesh recarga el modelo en cada busqueda, anadiendo latencia de carga en ese flujo de integracion.
- El benchmark disponible es una prueba tecnica pequena con expectativas derivadas de nombres de assets, no anotaciones humanas; no demuestra precision general de recuperacion en bibliotecas arbitrarias.
- El corpus de entrenamiento es sintetico (10.025 ejemplos, 84 conceptos), lo que puede limitar la cobertura de vocabulario real de estudios con nomenclaturas propias.
- Aunque la licencia es Apache-2.0, se deben conservar LICENSE, LICENSE.base y NOTICE para cumplir con la atribucion del modelo base.
- Metadatos de adopcion muy bajos en el momento de la ficha (0 descargas, 0 likes), por lo que no existe validacion externa de calidad ni soporte de comunidad.
- El contrato `cymesh-query-v1` exige que `mesh_query_prompt.txt` coincida con su SHA-256 registrado; modificar el prompt rompe la compatibilidad con las integraciones existentes.
- No se dispone de informacion sobre sesgos especificos mas alla de los derivados del corpus sintetico y del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberalien/CySearchAssist-Mesh-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Revision fijada del modelo base: `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`
- Archivos de configuracion e integracion incluidos en el repositorio: `mesh_query_config.json`, `mesh_query_prompt.txt`, `LICENSE`, `LICENSE.base`, `NOTICE`
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios o demos adicionales.
