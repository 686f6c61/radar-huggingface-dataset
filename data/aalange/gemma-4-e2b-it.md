# AALange/gemma-4-E2B-it

## Resumen

AALange/gemma-4-E2B-it es un ajuste fino (fine-tune) del modelo google/gemma-4-E2B, publicado por el usuario AALange bajo licencia Apache 2.0. El modelo base pertenece a la familia Gemma 4 de Google DeepMind, una coleccion de modelos multimodales de pesos abiertos que procesan texto, imagen y audio como entrada y generan texto como salida. La variante E2B esta disenada especificamente para ejecucion en dispositivo (on-device), con un enfoque en eficiencia de parametros mediante Per-Layer Embeddings (PLE).

La relevancia de este modelo radica en su perfil de despliegue: con 2,3 mil millones de parametros efectivos (5,1 mil millones contando las tablas de embeddings), una ventana de contexto de 128K tokens y soporte nativo de las modalidades texto, imagen y audio, se posiciona como una opcion para entornos con recursos limitados. El ajuste fino de AALange conserva la arquitectura y el pipeline any-to-any declarado por el autor original.

Este fichero concreto acumula 0 descargas y 0 likes en el momento de la consulta, y no incluye informacion publicada sobre el proceso de ajuste, los datos empleados ni resultados de evaluacion especificos del fine-tune. Toda la informacion tecnica disponible proviene de la model card de la familia Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida (sliding window local + global), Per-Layer Embeddings (PLE) y Proportional RoPE (p-RoPE) en capas globales |
| Parametros totales | 5.123.178.051 (2,3B efectivos; 5,1B con embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Mas de 140 idiomas segun la model card de la familia Gemma 4 |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer decoder-only con un mecanismo de atencion hibrido que alterna atencion local de ventana deslizante (512 tokens en E2B) con atencion global completa, garantizando que la capa final sea siempre global. Las capas globales utilizan claves y valores unificados (unified Keys and Values) junto con Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos. El modelo incorpora Per-Layer Embeddings (PLE): en lugar de anadir mas capas o parametros, cada capa decodificadora dispone de su propio embedding pequeno por token, con tablas de embeddings grandes pero usadas solo para consultas rapidas, lo que explica la diferencia entre los 2,3B efectivos y los 5,1B totales. El vocabulario es de 262K tokens y la pila tiene 35 capas.

En cuanto a las modalidades, la variante E2B procesa texto, imagen (con soporte de relacion de aspecto y resolucion variables) y audio, con un codificador de vision de aproximadamente 150M de parametros y un codificador de audio de aproximadamente 300M. La familia Gemma 4 incluye soporte nativo del rol `system` para conversaciones mas estructuradas y modos de razonamiento (thinking) configurables. No se dispone de informacion sobre el dataset de entrenamiento del ajuste fino de AALange, el numero de tokens utilizados, ni si se emplearon tecnicas como RLHF o DPO en este fichero concreto.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprension multimodal de entrada: texto, imagen (relacion de aspecto y resolucion variables) y audio.
- Generacion de codigo, con mejoras declaradas en benchmarks de programacion dentro de la familia Gemma 4.
- Soporte nativo de function calling (tool calling) y flujos de agentes autonomos.
- Soporte nativo del rol `system` en las conversaciones.
- Capacidades multilingues en mas de 140 idiomas.
- Procesamiento de contexto largo (hasta 128K tokens), apto para tareas de razonamiento multi-paso.
- Optimizado para ejecucion local en portatiles y dispositivos moviles.

## Casos de uso

- Asistentes en dispositivo: el modelo puede ejecutarse localmente en portatiles o moviles gracias a sus 2,3B parametros efectivos, gestionando conversaciones de texto sin depender de la nube.
- Atencion al cliente automatizada: con 128K tokens de contexto puede mantener conversaciones multi-turno extensas y recuperar informacion de historiales largos sin perder coherencia.
- Transcripcion y resumen de reuniones con audio: al aceptar entrada de audio, puede transcribir y resumir grabaciones directamente en el mismo pipeline, sin necesidad de un modelo de ASR separado.
- Analisis de documentos con imagenes: la entrada de imagen con soporte de resolucion variable permite extraer informacion de capturas, diagramas o formularios escaneados.
- Generacion de codigo en produccion: el soporte de tool calling y agentes permite integrarlo en pipelines de CI/CD para sugerencias de parches, generacion de tests o revision automatica.
- Clasificacion y enrutado multilingue: con soporte de mas de 140 idiomas, puede clasificar y enrutar tickets o consultas en multiples lenguas dentro de un mismo sistema.
- Agentes autonomos de varios pasos: el modo thinking y el function calling nativo permiten construir agentes que planifican, invocan herramientas y encadenan acciones.
- Procesamiento de imagenes y audio en tiempo real en el borde: al ser un modelo optimizado para on-device, sirve para aplicaciones de accesibilidad, como descripcion de imagenes o lectura asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 10,3 GB (coincide con el tamano del repositorio de 10,3 GB). En cuantizacion de 8 bits, en torno a 5-6 GB; en 4 bits, en torno a 3 GB.

- Cabe en GPU de consumo: si. Una RTX 4090 (24 GB) lo ejecuta en FP16 con margen amplio; tarjetas de 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070) pueden ejecutarlo en cuantizacion de 8 o 4 bits.

- GPU recomendadas: para FP16 sin limitaciones, A100, H100, L40S o RTX 4090. Para despliegues en el borde, cualquier GPU integrada o discreta con al menos 4-6 GB en cuantizacion reducida.

- Opciones de despliegue: la model card no especifica herramientas concretas; por el formato safetensors y la libreria transformers, es compatible con cargadores de la familia transformers. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible (la etiqueta del repositorio indica compatibilidad con endpoints).

- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AALange/gemma-4-E2B-it | 5,1B totales (2,3B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | HuggingFace, 0 descargas |
| google/gemma-4-E2B | 5,1B totales (2,3B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Modelo base de Google |
| google/gemma-4-E4B | 8B totales (4,5B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Modelo de Google |
| google/gemma-4-12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Modelo de Google |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay informacion publicada sobre el dataset de ajuste, el metodo de entrenamiento ni los datos utilizados en este fine-tune concreto (AALange/gemma-4-E2B-it), por lo que se desconoce si introduce sesgos adicionales respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad especificas para este fichero.
- La etiqueta del repositorio indica licencia Apache 2.0, pero la model card enlaza a la licencia especifica de Gemma 4 de Google; conviene verificar los terminos aplicables antes de un uso comercial, ya que pueden existir condiciones adicionales.
- El modelo tiene 0 descargas y 0 likes, y no cuenta con validacion comunitaria; se recomienda evaluar su comportamiento en el caso de uso previsto antes de llevarlo a produccion.
- Aunque la familia soporta mas de 140 idiomas, no se ha publicado informacion sobre el rendimiento real de este fine-tune en idiomas distintos del ingles.
- El fichero esta etiquetado como any-to-any; hay que confirmar con pruebas propias que la salida es exclusivamente de texto y que las entradas de imagen y audio funcionan correctamente en esta variante ajustada.
- La longitud de contexto es de 128K tokens, inferior a los 256K de las variantes medianas de la familia, lo que limita tareas que requieran ventanas mas amplias.

## Enlaces

- HuggingFace: https://huggingface.co/AALange/gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Repositorio GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Google AI: https://ai.google.dev/gemma/docs/core
- Coleccion de Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
