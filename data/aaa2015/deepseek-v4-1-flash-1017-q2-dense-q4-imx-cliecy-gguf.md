# aaa2015/DeepSeek-V4.1-Flash-1017-Q2-dense-q4-imx-cliecy-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Q2-dense-q4-imx-cliecy-GGUF es una cuantización comunitaria del modelo base DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, publicada por el usuario aaa2015 en Hugging Face. El archivo es un GGUF con cuantización mixta: los expertos MoE en Q2_K y las rutas dense (proyecciones MLA Q/K/V/Out, FFN del experto compartido y LM head) en Q4_K, calibradas con matriz de importancia (imatrix) sobre el conjunto de calibración "cliecy".

El modelo base es multimodal (acepta imágenes y texto) de arquitectura MoE con 384 expertos enrutados y 6 activos por token, más 1 experto compartido. Esta cuantización está pensada como configuración de producción del motor de inferencia myds, optimizado para Apple Silicon con Metal, y se distribuye en 8 fragmentos de bytes fijos que pueden cargarse directamente sin fusionar.

Su relevancia actual radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de memoria unificada (Apple M2/M3 Ultra de 192 GB) a velocidades de decode de 38-44 tokens/s, algo inviable con los pesos BF16 oficiales. La licencia MIT heredada del modelo base permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con MLA (Multi-head Latent Attention), 384 expertos enrutados + 1 experto compartido, 6 expertos activos por token |
| Parametros totales | 485.268.480 segun metadatos de safetensors del repo (dato posiblemente incorrecto; el GGUF pesa 337,2 GiB, coherente con un MoE de gran escala); tamano exacto del modelo base no disponible |
| Parametros activos | no disponible (6 expertos enrutados + 1 compartido por token, pero el numero de parametros activos no se publica) |
| Longitud de contexto | 327.680 tokens (valor usado en los ejemplos de arranque) |
| Tipos de cuantizacion | MoE: Q2_K; dense (Q/K/V/Out de MLA, FFN compartida, LM head): Q4_K, con calibracion imatrix (conjunto cliecy) |
| Idiomas | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (8 fragmentos de ~42,16 GiB cada uno, con manifiesto .parts); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer de mezcla de expertos (MoE) con 384 expertos enrutados de los que se activan 6 por token, mas un experto compartido siempre activo. Utiliza MLA (Multi-head Latent Attention), y segun la citacion del propio modelo su linea de trabajo se centra en la compresion de la KV cache ("Pushing the Limits of KV Cache Compression"). Soporta entrada de imagen de forma nativa mediante un codificador visual separado (DeepSeek-ViT mas 2 capas de MLP projector, 925,6 MiB en GGUF).

Sobre esta arquitectura, la cuantizacion aplica una estrategia de bit-width mixto: los expertos enrutados, que concentran la mayor parte del volumen de pesos, se cuantizan a Q2_K, mientras que la ruta dense, mas sensible a la perdida de precision, se mantiene en Q4_K con calibracion imatrix. La justificacion es que en la fase de decode cada token exige leer todo el plano de pesos (5,17 GB dense + 2,39 GB MoE por lectura, segun el autor), por lo que el bit-width determina directamente el throughput. No hay informacion sobre datos de entrenamiento, numero de tokens ni procesos RLHF/DPO del modelo base en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general (modelo de lenguaje MoE de gran escala)
- Comprension multimodal: entrada de imagen nativa mediante el codificador DeepSeek-ViT + projector MLP (requiere descargar el GGUF de vision aparte y pasarlo con `--vision`)
- Contexto muy largo: hasta 327.680 tokens en la configuracion de ejemplo, con pruebas de recuperacion a larga distancia (needle-in-a-haystack) reportadas como correctas por el autor
- Identificacion de problemas de seguridad en codigo: el autor reporta consistencia con BF16 en 7 categorias de seguridad auditadas
- Ejecucion local en Apple Silicon mediante el motor myds con backend Metal
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada

## Casos de uso

- Inferencia local de un MoE de gran escala en estaciones Apple Silicon: con 192 GB de memoria unificada (M2/M3 Ultra) se ejecuta sin GPUs dedicadas a 38-44 tokens/s de decode, adecuado para despliegues on-premise donde no se desea depender de la nube.
- Analisis de documentos e imagenes con contexto extenso: la ventana de 327.680 tokens permite procesar documentos largos combinados con imagenes, usando el codificador visual complementario.
- Auditoria de codigo con sensibilidad a problemas de seguridad: el autor verifica que la deteccion de 7 categorias de problemas de seguridad coincide con el modelo BF16, lo que permite usarla como herramienta de revision de codigo de bajo coste.
- Experimentacion con cuantizacion extrema de MoE: la separacion Q2_K/Q4_K con imatrix sirve como referencia practica de cuanto se puede comprimir la parte de expertos sin degradar criticamente la ruta dense.
- Servir el modelo via API local: myds expone un servidor en el puerto 8080, util para integrar el modelo en aplicaciones mediante peticiones HTTP sin fusionar los 8 fragmentos en disco.
- Verificacion de integridad de descargas grandes: el esquema de fragmentos con SHA256 individuales permite validar la descarga completa sin ocupar 675 GiB adicionales, util en flujos de distribucion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son mediciones del autor con el motor myds en Apple M2 Ultra (76 nucleos GPU, 192 GiB):

| Metrica | Valor |
|---|---|
| Prefill | 350-600 tokens/s (según longitud del prompt) |
| Decode | ~38-44 tokens/s |
| Hardware | Apple M2 Ultra, 76 nucleos GPU, 192 GiB de memoria unificada |
| Memoria residente en ejecucion | 148-150 GB |

## Requisitos de hardware

- VRAM/memoria: aproximadamente 150 GB de memoria unificada disponibles (uso residente medido de 148-150 GB). No cabe en GPUs de consumo ni en maquinas de 32, 64 o 128 GB (OOM).
- GPUs recomendadas: no aplica GPUs dedicadas; el objetivo son SoC Apple Silicon M2 Ultra o M3 Ultra con 192 GB de memoria unificada o superior. Compatibilidad con NVIDIA via llama.cpp: no disponible en la informacion proporcionada.
- Consumer GPUs: no es viable; el modelo no cabe en ninguna GPU de consumo actual.
- Despliegue: disenado para el motor myds (backend Metal), que soporta carga directa por fragmentos sin fusionar. Para herramientas de la familia llama.cpp hay que concatenar los 8 fragmentos en un unico GGUF (requiere 337 GiB libres, ~675 GiB durante la operacion). Compatibilidad con Ollama, vLLM o TGI: no disponible.
- Rendimiento esperado en M2 Ultra: prefill 350-600 tokens/s, decode 38-44 tokens/s. No cargar dos instancias simultaneas en la misma maquina.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano | Contexto | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Q2-dense-q4 (esta ficha) | GGUF | Q2_K (MoE) + Q4_K (dense) | 337,2 GiB | 327.680 tokens | MIT |
| DeepSeek-V4.1-Flash-1017 (base oficial) | safetensors | BF16 | no disponible | no disponible | MIT |
| DeepSeek-V4.1-Flash-1017-Vision.gguf (complemento) | GGUF | no disponible | 925,6 MiB | - | MIT |

No se conocen otras cuantizaciones comparables publicadas de este modelo en la informacion disponible.

## Limitaciones y advertencias

- Precision degradada por la cuantizacion Q2: el propio autor advierte que es una cuantizacion MoE de nivel Q2 y no debe usarse como referencia de precision; para baselines exactos hay que usar los safetensors oficiales BF16.
- La parte dense esta mejor protegida (Q4_K), pero la calidad de los expertos enrutados en Q2_K no se ha evaluado con benchmarks estandar.
- Riesgo de alucinacion: no disponible como dato especifico, pero es inherente a modelos de lenguaje; la cuantizacion agresiva puede agravarlo.
- Requisito de memoria muy elevado: 150 GB de memoria unificada excluyen a la practica totalidad de hardware de consumo y de la mayoria de estaciones de trabajo.
- Fragilidad en la carga por fragmentos: si falta cualquier fragmento o el manifiesto `.parts`, myds rechaza la carga, pero al fusionar manualmente un orden incorrecto de fragmentos produce un modelo que "parece cargar bien" con datos corruptos. Verificar siempre los SHA256.
- Sesgos conocidos, soporte de idiomas y restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones conocidas; sesgos e idiomas soportados no disponibles en la informacion proporcionada.
- El codificador visual debe descargarse por separado; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/aaa2015/DeepSeek-V4.1-Flash-1017-Q2-dense-q4-imx-cliecy-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor de inferencia myds: https://github.com/aaa2015/myds
- Paper del modelo base (citacion BibTeX): "DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression", DeepSeek-AI, 2026 (enlace no disponible)
