# sanroe/leemo

# DeepSeek-V4.1-Flash (repositorio sanroe/leemo)

## Resumen

El repositorio `sanroe/leemo` contiene una publicacion de los pesos de DeepSeek-V4.1-Flash, un modelo multimodal de mezcla de expertos (MoE) desarrollado por DeepSeek AI. Se trata de un transformer con arquitectura Causal Encoder-Decoder (CED) de 40 capas, disenado para cargas de trabajo con entradas muy largas (contexto de hasta un millon de tokens) y con un coste de cache KV reducido de forma agresiva. La innovacion central es la compresion de la cache KV: el modelo almacena 890 bytes por token, aproximadamente una cuarta parte de lo que requiere DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1.

El modelo procesa imagenes y texto de forma nativa y genera texto de forma autorregresiva. Su principal argumento es la eficiencia en tareas agenticas: activa solo 8B parametros por token durante la fase de prefill y 16B durante la decodificacion, lo que abarata el procesamiento de contextos de entrada masivos. Incorpora ademas decodificacion especulativa DSpark, memoria condicional Engram y un ajuste de esfuerzo de razonamiento controlable de forma continua (entero de 1 a 100).

Hay que subrayar que este repositorio concreto no es una publicacion oficial de DeepSeek AI: el autor es `sanroe`, la model card es una copia de la de DeepSeek-V4.1-Flash y las cifras de parametros no coinciden entre el recuento real de safetensors (763.205.315.794) y las cifras declaradas en el texto (552B de backbone mas 196B de memoria Engram). Conviene verificar el origen de los pesos antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED): transformer de 40 capas (20 capas de encoder causal y 20 de decoder), MoE con 1 experto compartido y 384 expertos enrutados por capa |
| Parametros totales | 763.205.315.794 segun safetensors; la model card declara 552B de backbone y 196B adicionales de memoria condicional Engram |
| Parametros activos | 8B por token en prefill y 16B por token en decode; 6 expertos enrutados activos por token |
| Longitud de contexto | Hasta 1.000.000 de tokens (atencion dispersa entrenada a 64K y extendida a 1M a partir de los 34T tokens) |
| Tipos de cuantizacion | FP8 (etiqueta del repositorio); cache KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |
| Tamano del repositorio | 510,3 GB |
| Pipeline declarado | image-text-to-text |
| Etiquetas adicionales | endpoints_compatible, 8-bit, fp8, region:us |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder en la que la cache KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Ese diseno permite reducir la activacion de parametros a 8B por token en prefill y 16B en decode. La tecnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando solo los ultimos `n_win` tokens, lo que evita persistir la cache SWA en SSD y deja la huella persistente de cache KV en aproximadamente un octavo de la de DeepSeek-V4-Flash.

La atencion usa Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar indices de atencion dispersa Top-K. En el decoder, un indexador disperso jerarquico restringe las capas de indexacion posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador en profundidad con independencia de la longitud del contexto. La combinacion de estos mecanismos con la cache KV principal en FP4 (E2M1, escala E4M3 cada 16 canales) da los 890 bytes por token citados. Se suman Single-Pass mHC (mezcla del flujo residual con un kernel Mega-mHC), memoria condicional Engram (196B parametros con acceso disperso por lookup de tokens) y decodificacion especulativa DSpark con verificacion programada por confianza.

En el apartado multimodal, un codificador de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y reduccion de resolucion 3x3 pixel-unshuffle, junto con un proyector MLP de dos capas, convierte las imagenes en embeddings visuales que se procesan conjuntamente con los embeddings de texto desde el inicio del preentrenamiento del modelo de lenguaje. El preentrenamiento se hizo desde cero sobre un corpus multimodal de 45T tokens. El postentrenamiento sigue el paradigma estandar SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas, con los cambios concentrados en el pipeline de datos: sintesis automatizada a gran escala de tareas y entornos agenticos con escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generacion de texto autorregresiva con contexto de hasta un millon de tokens.
- Procesamiento nativo de imagenes y texto de forma conjunta (pipeline image-text-to-text).
- Razonamiento con esfuerzo controlable de forma continua mediante un ajuste entero de 1 a 100, que intercambia coste de inferencia por precision.
- Cargas agenticas y de multiples pasos: el pipeline de postentrenamiento se centra en la sintesis de tareas y entornos agenticos.
- Decodificacion especulativa integrada (DSpark) con generacion de borradores semiautorregresiva y verificacion programada por confianza.
- Memoria condicional Engram con acceso disperso por lookup de tokens, orientada a recuperar informacion de forma condicional.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de repositorios completos: con un millon de tokens de contexto, el modelo puede ingerir bases de codigo extensas junto con su documentacion y responder preguntas de arquitectura sin trocear el contenido, apoyandose en la cache KV de 890 bytes por token para mantener el coste de memoria acotado.
- Agentes autonomos de larga duracion: el ajuste de esfuerzo de razonamiento de 1 a 100 permite subir el esfuerzo en pasos criticos y bajarlo en pasos rutinarios, manteniendo el coste total bajo control en cadenas de razonamiento de muchos pasos.
- Procesamiento masivo de documentos con imagenes: al aceptar texto e imagen de forma nativa, sirve para extraer datos de informes escaneados, facturas o articulos cientificos con figuras y tablas en un unico paso.
- Inspeccion visual de interfaces: al ser multimodal, puede revisar capturas de pantalla de aplicaciones y describir o detectar problemas de maquetacion en pipelines de control de calidad.
- Asistentes sobre corpus normativos o tecnicos extensos: la ventana de 1M tokens permite mantener reglamentos, contratos o manuales completos en contexto, reduciendo la necesidad de recuperacion externa.
- Revision de codigo en produccion: la fase de prefill activa solo 8B parametros por token, de modo que procesar diffs y ficheros grandes resulta comparativamente barato frente a modelos densos de tamano similar.
- Backend de atencion al cliente con historial largo: la combinacion de contexto de 1M tokens y cache KV comprimida facilita conservar el historial completo de conversaciones multi-turno sin truncar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card contiene una seccion de resultados de evaluacion, pero el extracto proporcionado se corta al inicio de la misma (incluye la nota de que las puntuaciones dentro de 0,3 puntos se consideran equivalentes, y hace referencia a dos figuras sobre rendimiento agentico y tamano de cache KV), sin llegar a incluir ninguna cifra concreta. Los unicos datos cuantitativos de rendimiento disponibles son los de eficiencia de cache: 890 bytes de cache KV global por token, aproximadamente 1/4 de la de DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1, y una huella persistente de cache SWA de aproximadamente 1/8 de la de DeepSeek-V4-Flash.

## Requisitos de hardware

- VRAM estimada para inferencia: los propios pesos ocupan aproximadamente 1,5 TB en BF16 y unos 763 GB en FP8 puro. El repositorio ocupa 510,3 GB, lo que situa el almacenamiento efectivo en torno a 5,3 bits por parametro. Estas cifras son estimaciones de calculo a partir del recuento real de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el despliegue exige configuraciones multi-GPU de centro de datos (H100, H200, B200 o equivalentes con 80 GB o mas por acelerador).
- GPU de consumo: no cabe en ninguna GPU de consumo. Con 510,3 GB de pesos, se necesita un nodo multi-GPU; incluso en FP4 la huella rondaria los 380 GB, fuera del alcance de una RTX 4090 o similar.
- Opciones de despliegue: la libreria declarada es transformers y el repositorio esta marcado como `endpoints_compatible` (Hugging Face Inference Endpoints). No hay confirmacion en la informacion disponible sobre soporte de vLLM, SGLang, llama.cpp, Ollama o TGI. La ruta `sanroe/leemo` y el tag `deepseek_v41` sugieren compatibilidad con la implementacion de transformers de DeepSeek.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763,2B segun safetensors (552B backbone + 196B Engram segun la model card) | 1M tokens | 890 bytes | MIT | Repositorio de terceros `sanroe/leemo`; publicacion oficial no verificada en la informacion disponible |
| DeepSeek-V4-Flash | No disponible | No disponible | Aproximadamente 4x la de V4.1-Flash (unos 3.560 bytes) | No disponible | No disponible |
| DeepSeek-V1 | No disponible | No disponible | 437x la de V4.1-Flash (unos 389 KB) | No disponible | No disponible |

Los dos terminos de comparacion proceden de las referencias internas de la propia model card, que solo ofrece la relacion de tamanos de cache KV. No se dispone de datos de parametros, contexto, rendimiento ni licencia de esos modelos en la informacion proporcionada, por lo que no es posible una comparacion completa.

## Limitaciones y advertencias

- Repositorio no oficial: el autor es `sanroe` y no DeepSeek AI. La model card es una copia de la de DeepSeek-V4.1-Flash, lo que impide garantizar que los pesos correspondan al modelo descrito ni que no hayan sido modificados.
- Incoherencia en el recuento de parametros: safetensors declara 763.205.315.794 parametros, mientras que la model card habla de 552B de backbone mas 196B de memoria Engram. La discrepancia no esta explicada (552B + 196B = 748B, 15B menos que el recuento real).
- Metadatos poco fiables: el repositorio registra cero descargas y cero likes, y las fechas de creacion y actualizacion (19-09-2026) son posteriores a la fecha de consulta, lo que apunta a metadatos mal formados.
- Ausencia de resultados de benchmarks publicados en la informacion disponible: cualquier afirmacion de rendimiento superior a otros modelos carece aqui de respaldo numerico.
- Idiomas soportados no declarados: no es posible evaluar la cobertura multilingue ni descartar un sesgo acusado hacia el ingles y el chino.
- Riesgo de alusion: no hay informacion sobre tasas de alucinacion ni sobre el proceso de alineacion mas alla de la mencion generica al paradigma SFT, RL y destilacion on-policy.
- Sesgos conocidos: no disponibles. El pipeline de postentrenamiento se apoya en sintesis automatizada de tareas agenticas a gran escala, lo que puede introducir sesgos procedentes de los entornos generados.
- Restricciones de licencia: MIT es una licencia permisiva que permite uso comercial, modificacion y redistribucion con atribucion. Al tratarse de una copia no oficial, conviene confirmar la licencia del repositorio original antes de un uso comercial.
- Requisitos de despliegue muy altos: 510,3 GB de pesos implican infraestructura multi-GPU de centro de datos; el modelo no es viable en hardware de consumo.
- Funcionalidades documentadas sin verificacion independiente: SWA Bounded Replay, CSA2, Single-Pass mHC, Engram y DSpark son descripciones de la model card; no se aporta evidencia externa en la informacion disponible.
- Posible truncamiento de la model card: la seccion de evaluacion esta incompleta, de modo que podrian faltar tambien otras advertencias del autor original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sanroe/leemo
- Pagina oficial de DeepSeek (referenciada en la model card): https://www.deepseek.com/
- Chat de DeepSeek V4.1 (referenciado en la model card): https://chat.deepseek.com/
- Organizacion de DeepSeek AI en Hugging Face (referenciada en la model card): https://huggingface.co/deepseek-ai
- Perfil de X/Twitter de DeepSeek AI (referenciado en la model card): https://twitter.com/deepseek_ai
- Informe tecnico enlazado desde la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo: los unicos enlaces recuperados corresponden a paginas de ayuda de Gmail, Zhihu y Baidu Zhidao, sin relacion con DeepSeek-V4.1-Flash. No se han podido localizar papers, blogs, repositorios de codigo ni demos adicionales.
