# HybridRMD/Bonsai-2-27B-HybridRMD-Satellite-Ternary

## Resumen

HybridRMD/Bonsai-2-27B-HybridRMD-Satellite-Ternary es un repositorio de pesos GGUF publicado por el usuario HybridRMD que se presenta explícitamente como un resultado negativo documentado: los ficheros ternarios que contiene no decodifican y producen texto incoherente. No es un modelo utilizable, sino el registro reproducible de un fallo en el proceso de cuantizacion ternaria de un modelo de la familia Bonsai 2. El autor lo publica para que el fallo sea inspeccionable en lugar de ser redescubierto por terceros.

El modelo del que deriva pertenece a la estirpe de Prism ML: Bonsai 2 27B, un modelo multimodal de 27B basado en Qwen3.8 27B con atencion hibrida, cuantizado a pesos ternarios en una base rotada, con ventana de contexto de 262 000 tokens y licencia Apache 2.0. Sobre esa base se han aplicado las variantes Heretic (abliteracion o ajuste de rechazos) y Satellite (destilacion de decisiones por capas), y este repositorio anade un intento de re-cuantizacion ternaria que no llego a funcionar.

El interes actual del repositorio es metodologico: documenta con detalle dos causas raiz concretas (ausencia de metadatos de rotacion y no ternarizacion de embeddings y LM head), reproduce el error con la pila oficial y descarta varias hipotesis alternativas con mediciones. El recuento real de parametros en safetensors es de 26 895 998 464, y el repositorio ocupa 15,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida (linaje Qwen3.8 27B); pesos objetivo ternarios en base rotada |
| Parametros totales | 26 895 998 464 (aproximadamente 26,9 B; la nomenclatura comercial lo redondea a 27B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No documentada en este repositorio. El modelo base del linaje (Ternary Bonsai 2 27B, derivado de Qwen3.8 27B) declara 262 000 tokens segun Prism ML |
| Tipos de cuantizacion | PTQ1_0 (trits densos, 1,75 bits por peso, tipo ggml 143) y PQ2_0 (un trit por ranura de 2 bits, 2,13 bits por peso, tipo ggml 142). Tensores secundarios en F32, Q4_K y Q6_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria declarada: gguf) |
| Modelo base | HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite |
| Tamano del repositorio | 15,4 GB |
| Fecha de publicacion en HuggingFace | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo subyacente sigue la arquitectura de Qwen3.8 27B: un transformer causal con atencion hibrida, al que la familia Bonsai 2 aplica una representacion de pesos ternaria con valores en {-1, 0, +1} dentro de una base rotada fija, acompanada de escalas de grupo en FP16. La cuantizacion de Prism ML se aplica de extremo a extremo sobre el modelo de lenguaje y, segun la documentacion de la compania, cubre embeddings, proyecciones de atencion, proyecciones MLP y la LM head. El pipeline depende de un paso de rotacion ortogonal (tipo Hadamard) cuyos parametros se declaran como metadatos dentro del fichero GGUF, de modo que el runtime aplique la transformada de activacion correspondiente o rechace la carga.

Este repositorio no anade entrenamiento alguno: es un intento de re-cuantizacion sobre los pesos de HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite usando el fork PrismML-Eng/llama.cpp (rama `prism`). Los dos ficheros generados y su estado son los siguientes:

| Fichero | Formato | Bits por peso | Tamano | Estado |
|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Heretic-Satellite-PTQ1_0.gguf | ternario, trits densos | 1,75 | 6,6 GiB | No decodifica |
| Ternary-Bonsai-2-27B-Heretic-Satellite-PQ2_0.gguf | ternario, un trit por ranura de 2 bits | 2,13 | 7,7 GiB | No decodifica |

La causa raiz identificada por el autor tiene dos componentes. Primero, los ficheros no contienen ninguna clave de metadatos de rotacion, hadamard o ternario (42 claves KV, ninguna relevante), de modo que el runtime no puede conocer la transformada ortogonal plegada en los pesos ni aplicar la transformada de activacion correspondiente. Segundo, los embeddings y la LM head no se ternarizaron: `token_embd.weight` queda en Q4_K y `output.weight` en Q6_K, cuando la cobertura documentada del formato incluye ambos; solo 496 de los 851 tensores son PTQ1_0, y el resto son normas en F32 y tensores de la ruta de estado. El cuantizador acepta PTQ1_0 como objetivo y estampa los tipos ggml personalizados sin ejecutar el paso de rotacion y declaracion del que depende el formato.

En la fase de diagnostico se descartaron varias hipotesis con mediciones: un ternario ingenuo sobre los pesos propios da un error relativo de 0,573 con el 61 por ciento de los pesos forzados a cero exacto; una rotacion Hadamard por bloques de 1024 da un error relativo de 0,5715 frente a 0,5730 sin rotar, es decir, una mejora de 1,0x, sin beneficio practico. Tambien se descarto la hipotesis de desajuste de base Hadamard porque la matriz Hadamard normalizada es simetrica (H = H^T) y la hipotesis no es contrastable en esa forma.

## Capacidades

No se ha verificado ninguna capacidad funcional en este repositorio. Las capacidades que se enumeran a continuacion corresponden al modelo base del linaje segun la documentacion de Prism ML, y no estan confirmadas para estos pesos:

- Generacion de texto y razonamiento: el modelo base Bonsai 2 27B es un modelo de razonamiento de 27B.
- Entrada multimodal de texto e imagen: el modelo base acepta vision junto con texto segun la documentacion de Prism ML.
- Contexto largo: 262 000 tokens en el modelo base de la familia.
- Conversacional: la etiqueta `conversational` figura en los tags de este repositorio.
- Tool calling y uso en agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- En este repositorio en concreto: ninguna. Los ficheros publicados no decodifican y deben considerarse no funcionales.

## Casos de uso

Dado que los pesos no son funcionales, los casos de uso realistas son de investigacion y auditoria, no de produccion:

- Reproduccion de un resultado negativo: el repositorio permite replicar el fallo de decodificacion con la misma pila (fork PrismML-Eng/llama.cpp, rama `prism`, `llama-server`) y comprobar el comportamiento descrito sobre un prompt factual, evitando que otro equipo invierta tiempo en redescubrirlo.
- Auditoria de metadatos GGUF: los ficheros sirven como caso de estudio de un GGUF con tipos ggml personalizados y sin las claves KV de rotacion; el autor documenta 42 claves y la ausencia de cualquier metadato hadamard o ternario, lo que permite validar herramientas de inspeccion de cabeceras.
- Verificacion de compatibilidad de runtimes: permite comprobar que llama.cpp estandar rechaza los tipos 142 y 143 como desconocidos y que la version 0.19.0 de la libreria `gguf` hace lo mismo, un test util para pipelines de validacion de cuantizaciones.
- Desarrollo de validadores de cuantizacion: los fallos identificados (embeddings y LM head sin ternarizar, rotacion no declarada) son condiciones comprobables de forma automatica; este repositorio aporta un caso negativo real para construir chequeos previos a la publicacion.
- Investigacion sobre cuantizacion ternaria: las mediciones incluidas (error relativo 0,573 en ternario ingenuo, 61 por ciento de pesos a cero, 0,5715 frente a 0,5730 con Hadamard por bloques de 1024) son datos de referencia para estudiar donde se pierde la calidad en representaciones de 1 y 2 bits.
- Deteccion de salidas degeneradas en serving: el fallo se manifiesta como token soup que el servidor rechaza con un error 500 por formato de contenido no esperado; el caso sirve para disenar pruebas de humo que detecten este patron antes de exponer un endpoint.
- Formacion y documentacion tecnica: el repositorio es material didactico sobre por que una cuantizacion puede aplicar tipos correctos con un metodo que nunca se ejecuto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. El autor indica de forma explicita que la cifra del 98,2 por ciento de retencion respecto a FP16 que se cita para prism-ml/Ternary-Bonsai-2-27B-gguf no es trasladable a este modelo, porque es una medicion de otro modelo base bajo otro pipeline.

| Metrica | Valor |
|---|---|
| Benchmarks de este repositorio | No disponibles (los ficheros no decodifican) |
| Retencion agregada del modelo base de la familia | 98,2 por ciento respecto a su contrapartida en precision completa, segun Prism ML, no aplicable a este linaje |
| Error relativo del ternario ingenuo sobre estos pesos (medicion del autor) | 0,573, con 61 por ciento de pesos exactamente a cero |
| Error relativo con Hadamard por bloques de 1024 (medicion del autor) | 0,5715 frente a 0,5730 sin rotar (1,0x, sin mejora) |

## Requisitos de hardware

- VRAM para estos ficheros: el PTQ1_0 ocupa 6,6 GiB y el PQ2_0 ocupa 7,7 GiB en disco. No hay medicion publicada de VRAM en inferencia, y ademas es irrelevante porque no decodifican.
- VRAM para el modelo base del linaje en otras cuantizaciones: no disponible de forma oficial en la informacion proporcionada. Como referencia de tamano de fichero, la capa baja practica de este linaje es Q2_K, con 10,0 GiB.
- GPU recomendadas: no disponible. Para un modelo denso de 26,9 B, las cuantizaciones de 4 bits requieren del orden de 15 a 18 GB de memoria, lo que situa el objetivo en GPU de 24 GB o superiores; se trata de una estimacion derivada del recuento de parametros, no de un dato publicado.
- GPU de consumo: no confirmado por el autor. Cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) solo con cuantizaciones de 4 bits o inferiores y contexto reducido; el modelo base de la familia se ha descrito en guias de terceros como ejecutable en Apple Silicon con un fichero ternario de 8,6 GB.
- Opciones de despliegue para estos ficheros: exclusivamente el fork PrismML-Eng/llama.cpp, rama `prism`, que incluye el runtime de activacion Hadamard. llama.cpp estandar no puede cargarlos porque rechaza los tipos ggml 142 y 143 como desconocidos. vLLM, TGI, Ollama y otros runtimes no estan soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Contexto | Estado | Licencia |
|---|---|---|---|---|---|
| HybridRMD/Bonsai-2-27B-HybridRMD-Satellite-Ternary (este repositorio) | 26,9 B | GGUF ternario; PTQ1_0 de 6,6 GiB y PQ2_0 de 7,7 GiB | No documentado | No decodifica; resultado negativo documentado | Apache 2.0 |
| HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite | No disponible | No disponible; es la referencia utilizable del linaje, con Q2_K a 10,0 GiB como capa baja practica | No disponible | Funcional segun el autor | No disponible en la informacion proporcionada |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B (clase) | GGUF ternario; requiere el fork de llama.cpp | 262 000 tokens | Funcional; retiene el 98,2 por ciento del rendimiento agregado en FP16 segun Prism ML | Apache 2.0 |

La comparacion directa de rendimiento entre estos tres modelos no esta disponible: el unico dato cuantitativo publicado (98,2 por ciento de retencion) corresponde al modelo de Prism ML y su propio pipeline, y el autor de este repositorio senala expresamente que no se ha reproducido para su linaje.

## Limitaciones y advertencias

- Los ficheros no decodifican. Producen token soup sobre prompts factuales sencillos; el autor lo etiqueta como no usar.
- El fallo esta reproducido tanto en los pesos de la iteracion 3 como en los de la iteracion 4.
- Ausencia de metadatos de rotacion: los ficheros no contienen ninguna clave de rotacion, hadamard o ternario, por lo que el runtime no puede aplicar la transformada de activacion correspondiente a la transformada ortogonal plegada en los pesos.
- Cobertura de cuantizacion incompleta: `token_embd.weight` queda en Q4_K y `output.weight` en Q6_K; solo 496 de 851 tensores son PTQ1_0. La cobertura documentada del formato incluye embeddings y LM head.
- Dependencia de un unico runtime: los tipos ggml 142 y 143 solo los lee el fork PrismML-Eng/llama.cpp, rama `prism`. Incluso un fichero funcional quedaria atado a ese fork, ya que llama.cpp estandar y la libreria `gguf` 0.19.0 rechazan los tipos por desconocidos.
- Sin datos de benchmarks propios. La cifra de retencion del 98,2 por ciento no es trasladable a este modelo segun el propio autor.
- Idiomas soportados y comportamiento multilingue: no disponibles.
- Sesgos y riesgo de alucinacion: no evaluables, dado que el modelo no genera texto coherente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero la licencia no aporta nada mientras los pesos no sean funcionales. Es necesario verificar aparte las condiciones del modelo base HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite y del linaje Bonsai 2 de Prism ML.
- Advertencia para produccion: no desplegar bajo ninguna circunstancia. Si se necesita un modelo ternario funcional de esta familia, la referencia indicada por el autor es HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HybridRMD/Bonsai-2-27B-HybridRMD-Satellite-Ternary
- Modelo base en HuggingFace: https://huggingface.co/HybridRMD/Ternary-Bonsai-2-27B-Heretic-Satellite
- Modelo upstream de Prism ML en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp requerido (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
- Anuncio de Bonsai 2 27B en Prism ML: https://prismml.com/news/bonsai-2-27b
- Anuncio de lanzamiento de Bonsai 2 27B: https://prismml.com/news/prismml-launches-bonsai-2-27b
- Documentacion tecnica de Ternary Bonsai 2 27B: https://docs.prismml.com/bonsai-2-27b
- Guia de ejecucion local en Mac (terceros): https://www.mindstudio.ai/blog/ternary-bonsai-2-27b-run-mac-locally
- Sitio de Prism ML: https://prismml.com
- Cita del metodo upstream: `@techreport{bonsai2_27b, title = {Bonsai 2 27B: A 27B Ternary Reasoning Model}, author = {Prism ML}, year = {2026}, month = {September}, url = {https://prismml.com}}`
