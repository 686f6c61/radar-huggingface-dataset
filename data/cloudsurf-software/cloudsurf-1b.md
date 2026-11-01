# cloudsurf-software/CloudSurf-1B

## Resumen

CloudSurf-1B es un modelo de lenguaje base de 0,89 mil millones de parámetros entrenado desde pesos aleatorios por CloudSurf Software LLC. La compañía desarrolló todos los componentes del proyecto: el tokenizador, el entrenador, el pipeline de corpus y los pesos. Es la capa on-device de Surfy, el asistente de CloudSurf, y está pensado para ejecutarse en un teléfono o portátil sin conexión a red y sin coste por token. Sus funciones en el dispositivo son enrutar peticiones, escribir documentos SurfDoc (un formato de documento estructurado propio) y responder cuando no hay conexión, delegando las tareas más complejas a modelos mayores.

Se trata de un checkpoint base, no afinado por instrucciones y sin ajuste para tool calling; la versión afinada llegará en un lanzamiento posterior con barras de calidad pre-registradas. La arquitectura es un transformer decoder-only de 16 capas con ancho de modelo de 2.048 y contexto de 2.048 tokens, entrenado sobre 18.159 millones de tokens en unas 8,5 horas en 8 GPUs NVIDIA H100. Su relevancia radica en ser un modelo pequeño, completamente documentado (datos, licencias, semillas y manifiestos publicados), útil como base para investigación sobre preentrenamiento con documentos estructurados y como pieza de sistemas on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 16 capas, ancho 2.048, 16 cabezas (dim. de cabeza 128), MLP SwiGLU oculta 5.632, RMSNorm (eps 1e-5), posiciones RoPE (theta 10.000), sin sesgos, embeddings de entrada/salida emparejados |
| Parametros totales | 889.260.032 (contados desde el modelo construido, seed 1337) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF f16, Q8_0, Q4_K_M (oficiales en CloudSurf-1B-GGUF); safetensors en fp32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (fp32, 3,56 GB) y GGUF (f16, Q8_0, Q4_K_M; Q4_K_M ocupa 0,55 GB) |

## Arquitectura y entrenamiento

CloudSurf-1B es un transformer decoder-only compacto: 16 capas, ancho de modelo 2.048, 16 cabezas de atencion con dimension 128, MLP SwiGLU con dimension oculta 5.632, normalizacion RMSNorm y codificacion posicional rotary (RoPE) con theta 10.000. No usa sesgos y empareja los embeddings de entrada y salida. El tokenizador (tokenizer-v3) es un BPE a nivel de byte con 32.768 ids, entrenado internamente sobre una muestra de 2.000 millones de tokens del corpus.

El entrenamiento empleo un entrenador propio (`ts_train.py`, version 2) con DDP sobre 8 GPUs NVIDIA H100 80 GB SXM, AdamW fusionado, autocast bf16, torch.compile y un cargador uint16 fragmentado. Se proceso una unica pasada de 18.159.239.168 tokens (17.318 pasos x 1.048.576 tokens por lote global) en unas 8,5 horas (23-24 de octubre de 2026). El optimizador uso learning rate pico de 6e-4 con 1.000 pasos de warmup lineal y decay coseno hasta 6e-5, weight decay 0,1, betas (0,9, 0,95), clipping de gradiente 1,0 y seed 1337. La mezcla de datos tuvo dos fases: la fase 1 (pasos 0-15.585) con web 71,4 %, Wikipedia-convertida-a-SurfDoc 20,4 %, SurfDoc sintetico 5,1 % y codigo 3,1 %; la fase 2 (ultimo 10 %) con web 43,6 %, Wikipedia-as-SurfDoc 32,7 %, sintetico 16,3 %, codigo 5,4 % y ejemplos de enrutamiento de herramientas de CloudSurf 2,0 %. Las fuentes principales fueron FineWeb-Edu sample-100BT (14.000 millones de tokens, ODC-By 1.0), Wikipedia (CC BY-SA 4.0, convertida a SurfDoc), SurfDoc sintetico propio, codigo de RedPajama-1T GitHub con licencias permisivas (MIT, Apache-2.0, BSD) y ejemplos propios de tool routing. La perdida de validacion final fue 2,3928 en el paso 17.000. Todas las barras de calidad se registraron antes del primer token de entrenamiento y no se modificaron durante la ejecucion.

## Capacidades

- Generacion de texto base: continuacion de documentos a partir de un prefijo; el formato de prompt mas visto durante el entrenamiento es un bloque front matter SurfDoc seguido de un encabezado.
- Escritura y scaffolding de documentos SurfDoc (formato estructurado propio de CloudSurf).
- Enrutamiento de peticiones hacia el registro de herramientas de CloudSurf (preentrenado con ejemplos de tool routing en la fase 2, aunque el ajuste fino para tool calling llega en el checkpoint posterior).
- Generacion y continuacion de codigo basica (3,1-5,4 % del corpus era codigo con licencias permisivas).
- Ejecucion completamente local: funciona en telefono o portatil sin red y sin coste por token.
- No incluye: ajuste por instrucciones, chat, tool calling afinado ni soporte multilingue (solo ingles).

## Casos de uso

- Enrutamiento de peticiones en dispositivo: dentro de Surfy, el modelo clasifica y enruta las peticiones del usuario hacia el registro de herramientas de CloudSurf, ya que la fase 2 del preentrenamiento incluyo ejemplos de tool routing.
- Escritura y continuacion de SurfDoc: dado un front matter SurfDoc y un encabezado, el modelo continua o estructura el documento, su caso de uso mas entrenado.
- Asistente offline: responde consultas simples en el dispositivo cuando no hay conexion, delegando las tareas dificiles a modelos mayores en la nube.
- Investigacion en preentrenamiento de documentos estructurados: al ser un modelo pequeno, base y completamente documentado (corpus, manifiestos, semilla, licencias por archivo), sirve como plataforma reproducible para experimentos academicos.
- Prototipado local con llama.cpp: con la cuantizacion Q4_K_M de 0,55 GB cabe en moviles y portatiles modestos, ideal para probar pipelines de generacion de texto sin GPU.
- Generacion de texto continuo en aplicaciones embebidas: su bajo consumo y ausencia de coste por token lo hacen apto para autocompletado o generacion de plantillas en apps que procesan documentos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento de entrenamiento publicado es la perdida de validacion final: 2,3928 en el paso 17.000.

## Requisitos de hardware

- VRAM para inferencia: la cuantizacion Q4_K_M ocupa 0,55 GB, por lo que funciona en dispositivos sin GPU dedicada (telefonos y portatiles); el safetensors fp32 ocupa 3,56 GB.
- GPUs recomendadas: no se requiere GPU para inferencia dado el tamano; para reproducir el entrenamiento se usaron 8 x NVIDIA H100 80 GB SXM durante unas 8,5 horas.
- Consumer GPUs: sobradamente compatible con cualquier GPU consumer moderna (incluso integradas) en formato GGUF; no hay estimaciones publicadas de latencia o throughput.
- Despliegue: llama.cpp (comando `llama-completion` con el repo GGUF oficial `cloudsurf-software/CloudSurf-1B-GGUF:Q4_K_M`) y Hugging Face transformers (con `add_bos_token=True`, que antepone `<|bos|>` automaticamente). La model card indica `inference: false` para la API de inference de Hugging Face.
- Nota: los prompts deben comenzar con el token `<|bos|>`; llama.cpp lo anade desde los metadatos GGUF y transformers desde la configuracion del tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CloudSurf-1B | 889M | 2.048 | Apache-2.0 | Base, entrenado from scratch, foco en SurfDoc y tool routing, GGUF oficial |
| Qwen2.5-0.5B (base) | ~494M | 32.768 | Qwen (Apache-2.0) | Multilingue, benchmarks publicados, ecosistema maduro |
| Llama 3.2 1B (base) | ~1.240M | 131.072 | Llama 3.2 Community | Contexto mucho mayor, uso comercial con restricciones de marca |
| SmolLM2-1.7B | ~1.700M | 8.192 | Apache-2.0 | Entrenado con FineWeb-Edu y datos sinteticos, enfoque on-device similar |

La comparativa se ofrece a titulo orientativo: los datos de rendimiento de CloudSurf-1B no estan publicados, por lo que no puede establecerse una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Es un modelo base sin afinar por instrucciones: no sirve para chat ni como asistente tal cual se publica.
- No apto para respuesta factual a preguntas, decisiones de alto riesgo ni idiomas distintos del ingles.
- Contexto corto de 2.048 tokens, limitante para documentos largos.
- Riesgo de alucinacion inherente a modelos base de menos de 1B de parametros; no hay evaluaciones de alucinacion publicadas.
- Sesgos: el corpus procede mayoritariamente de Common Crawl (FineWeb-Edu), por lo que hereda los sesgos de contenido web; no se publica un analisis de sesgos especifico.
- Licencias de datos: FineWeb-Edu (ODC-By 1.0), Wikipedia (CC BY-SA 4.0) y codigo MIT/Apache-2.0/BSD con atribucion por repositorio; el uso comercial de los pesos es posible bajo Apache-2.0, pero conviene revisar las obligaciones de atribucion de los datos de origen.
- Los archivos GGUF incrustan `general.name` como "Tinysurf 1b" (nombre interno del proyecto); los bytes son los medidos y no se re-sellaron, lo que puede causar confusion en herramientas que lean esos metadatos.
- Las capacidades de tool calling y seguimiento de instrucciones llegaran en el fine-tune posterior, no en este checkpoint.

## Enlaces

- Modelo: https://huggingface.co/cloudsurf-software/CloudSurf-1B
- Cuantizaciones GGUF oficiales: https://huggingface.co/cloudsurf-software/CloudSurf-1B-GGUF
- Sitio de CloudSurf: https://cloudsurf.com/
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/fineweb-edu y https://huggingface.co/datasets/togethercomputer/RedPajama-Data-1T
