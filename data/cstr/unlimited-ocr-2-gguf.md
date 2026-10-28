# cstr/Unlimited-OCR-2-GGUF

## Resumen

`cstr/Unlimited-OCR-2-GGUF` es una conversión al formato GGUF del modelo `baidu/Unlimited-OCR-2`, publicada por el proyecto CrispEmbed para su propio runtime nativo en ggml. No se trata de un modelo nuevo: los pesos, la arquitectura y el entrenamiento corresponden íntegramente a Baidu, y el repositorio solo cambia el formato de almacenamiento. El modelo base pertenece a la familia Unlimited OCR de Baidu, presentada por sus autores como un salto hacia el "parseo de horizonte ilimitado" (OCR-3.0), con una innovación arquitectónica denominada SR-SWA.

El interés práctico de esta ficha está en la conversión, no en el modelo original: ofrece dos precisiones (F16 y Q8_0) verificadas token a token contra la implementación PyTorch de referencia en decodificación greedy sobre CPU, algo poco habitual en publicaciones de GGUF. El tamaño total de parámetros es de 3.343.978.240 (aproximadamente 3,34 mil millones), lo que sitúa al modelo en la gama media y permite inferencia en hardware de consumo.

La relevancia es doble: por un lado, demuestra que es posible ejecutar un OCR de documento completo en local sin GPU; por otro, documenta explícitamente qué variantes de cuantización se descartaron por romper la paridad numérica. Es un repositorio con muy poca adopción (0 descargas, 1 like en el momento de la consulta) y con verificación limitada a tres páginas de prueba, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun las etiquetas del repositorio (`deepseek-v2`, `moe`); no confirmada en la documentacion disponible |
| Parametros totales | 3.343.978.240 (~3,34 B), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base se describe con "horizonte ilimitado" mediante SR-SWA, sin cifra publicada en la informacion disponible) |
| Tipos de cuantizacion | F16 y Q8_0 publicados; Q4_K y variantes mixtas Q4 descartados por perdida de paridad |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2026 Baidu) |
| Formato de pesos | GGUF |

Datos adicionales de los artefactos:

| Fichero | Precision | Bytes | Equivalente |
|---|---|---:|---|
| `unlimited-ocr-2-f16.gguf` | F16 | 6.692.677.696 | ~6,69 GB |
| `unlimited-ocr-2-q8_0.gguf` | Q8_0 | 3.571.872.960 | ~3,57 GB |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles del entrenamiento del modelo base: no se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. Las etiquetas del repositorio apuntan a una arquitectura de mezcla de expertos con influencia de DeepSeek-V2, y la documentacion del proyecto upstream menciona SR-SWA como mecanismo que habilita el "parseo de horizonte ilimitado" en documentos largos. Ninguno de estos extremos puede confirmarse con los datos accesibles: no hay ficha tecnica del modelo original incluida en el repositorio de conversion, solo el README upstream sin modificar en `UPSTREAM_README.md`.

Lo que si esta documentado con detalle es el proceso de conversion, que constituye la aportacion real de este repositorio. Se descargaron los dos shards de safetensors de `baidu/Unlimited-OCR-2` en la revision fijada `04647c7a6098d8d58915f003536a741c82eafb40` y se verificaron contra los SHA256 de `docs/unlimited-ocr2-source.json`. La conversion se realizo con `models/convert-unlimited-ocr-to-gguf.py` en F32 sin perdida y en F16 con `--fp16`. Las variantes cuantizadas se generaron a partir del GGUF F32 con la herramienta propia `crispembed-quantize` (`tools/quantize.cpp`), con una regla conservadora: los tensores 1-D mantienen su tipo de origen y las embeddings, el router, el `lm_head` y el codificador de vision conservan un suelo de Q8_0. El build corresponde al commit `e165d5d1f46ab3c63ebe86bf78bd3a12bb017908` y el `manifest.json` registra recetas, pines de entrada, recibos y hashes.

La verificacion de paridad se hizo sobre la conversion F32 y se extendio a F16 y Q8_0 mediante un barrido de precision en CPU: ambas variantes son exactas en identificadores de token en paginas sin mosaico (65 tokens en `small-untiled`). En paginas con mosaico, la paridad exacta se alcanza desde el commit `595156ea` en dos paginas de 4x3 mosaicos y 1503 tokens de vision; versiones anteriores del runtime emitian 256 en lugar de 100 tokens de vision por mosaico de 640 px y solo coincidian en el texto. El decodificador rapido opcional reproduce el decodificador exacto token a token en las tres paginas. No verificado: backends de GPU, documentos largos de multiples paginas y benchmarks de calidad a nivel de tarea.

## Capacidades

- Reconocimiento optico de caracteres en modo imagen-a-texto (`image-text-to-text`) sobre paginas de documento.
- Procesamiento de paginas grandes mediante mosaico (tiling) opcional, con 100 tokens de vision por mosaico de 640 px en el runtime actual.
- Parsing de documentos de horizonte largo segun la descripcion del proyecto upstream (SR-SWA); sin cifras de contexto publicadas en la informacion disponible.
- Inferencia en CPU con runtime ggml nativo de CrispEmbed, con decodificacion greedy determinista.
- Decodificador rapido opcional que mantiene la equivalencia token a token con el decodificador de referencia.
- Soporte de conversacion multi-turno, tool calling, agentes, vision general, audio o modo de razonamiento: no disponible en la informacion consultada.

## Casos de uso

- Digitalizacion de facturas y tickets en local: el modelo procesa la imagen de la pagina y devuelve texto estructurado sin enviar el documento a un servicio externo, algo relevante para datos financieros sujetos a normativa de proteccion de datos. La variante Q8_0 de 3,57 GB permite ejecutarlo en un portatil sin GPU.
- Pipeline de ingestion para RAG sobre archivos escaneados: el OCR extrae el texto de cada pagina antes de trocearlo e indexarlo. El modo mosaico (`CRISPEMBED_UNLIMITED_OCR2_TILES=1`) esta pensado para paginas de gran resolucion, habituales en escaneos a 300 ppp.
- Procesamiento por lotes de formularios administrativos: al ser determinista en greedy sobre CPU, los resultados son reproducibles entre ejecuciones, lo que simplifica la auditoria de extracciones masivas.
- Digitalizacion de fondos documentales y prensa historica: la ejecucion en CPU abarata el coste por pagina frente a GPU y permite escalar horizontalmente con varias instancias del runtime.
- Extraccion de texto en entornos aislados (air-gapped): al no requerir llamadas a red ni dependencias de servicio, encaja en organismos publicos o entornos industriales con conectividad restringida.
- Prototipado y evaluacion de OCR en investigación: la paridad token a token con la implementacion PyTorch permite usar el GGUF como referencia de bajo coste para comparar pipelines sin depender de GPU.
- Verificacion de calidad de digitalizacion: comparar la salida del GGUF contra la del modelo original en PyTorch sobre las mismas paginas para detectar desviaciones introducidas por la conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas de calidad OCR (CER/WER, exactitud de tablas o de orden de lectura), y el propio autor declara explicitamente que los benchmarks de calidad a nivel de tarea no estan verificados.

Lo que si se documenta es la verificacion de paridad numerica frente al modelo original en PyTorch, con decodificacion greedy sobre CPU:

| Prueba | Resultado | Tokens |
|---|---|---|
| Pagina sin mosaico (`small-untiled`), F16 | Identico en IDs de token | 65 |
| Pagina sin mosaico (`small-untiled`), Q8_0 | Identico en IDs de token | 65 |
| Paginas con mosaico (2 paginas, 4x3 mosaicos), desde commit `595156ea` | Identico en IDs de token | 1503 tokens de vision |
| Decodificador rapido opcional (3 paginas) | Identico token a token | 3 paginas |
| Variantes Q4_K y mixtas Q4 | Sin paridad; no publicadas | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB con F16 (6,69 GB de pesos mas cache KV y activaciones del codificador de vision) y 4-5 GB con Q8_0 (3,57 GB de pesos mas el mismo sobrecoste).
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 o superiores para F16 con margen; A100 y H100 quedan sobredimensionadas para 3,34 B de parametros, aunque son validas para servir many requests en paralelo. Para Q8_0 bastan RTX 4060 Ti de 16 GB, RTX 3060 de 12 GB o RTX 4070.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas para F16 y 6 GB o mas para Q8_0. Con menos VRAM la alternativa es CPU.
- CPU: es la via de ejecucion verificada. El autor midio la paridad en CPU, no en GPU; los backends de GPU no estan verificados.
- Opciones de despliegue: CrispEmbed con runtime ggml nativo, invocando `CRISPEMBED_UNLIMITED_OCR2=1 crispembed -m unlimited-ocr-2-f16.gguf --ocr page.png`. El soporte esta desactivado por defecto y requiere la variable de entorno. Compatibilidad con llama.cpp, Ollama, vLLM o TGI: no disponible (el repositorio no la declara; el formato es GGUF, pero el grafo incluye modulos de vision que estos runtimes tendrian que implementar).
- Latencia y throughput: no disponibles. No se publican tiempos por pagina ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `cstr/Unlimited-OCR-2-GGUF` (esta ficha) | 3,34 B | no disponible | GGUF F16 / Q8_0 | MIT | Paridad token a token verificada en CPU; runtime CrispEmbed |
| `baidu/Unlimited-OCR-2` (base) | 3,34 B | no disponible | safetensors | MIT | Implementacion PyTorch de referencia; requiere GPU para uso comodo |
| `AtomicChat/Unlimited-OCR-2-GGUF` | no disponible | no disponible | GGUF | no disponible | Conversion alternativa del mismo modelo base; sin datos de paridad publicados en la informacion consultada |
| `cstr/unlimited-ocr-crispembed-GGUF` | no disponible | no disponible | GGUF | no disponible | Conversion de la generacion anterior (Unlimited OCR 1) por el mismo autor |
| `PaddlePaddle/Unlimited-OCR-2` en ModelScope | no disponible | no disponible | no disponible | no disponible | Distribucion del mismo modelo en ModelScope; la atribucion de autoria a PaddlePaddle frente a Baidu no queda resuelta en la informacion disponible |

Alternativas de categoria (OCR mediante modelos vision-lenguaje, como Qwen2.5-VL o dots.ocr): no se dispone de datos verificados en la informacion proporcionada para establecer una comparacion de parametros, contexto o calidad. La comparacion honesta en este punto es con el propio modelo base, no con terceros.

## Limitaciones y advertencias

- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta. No hay evidencia de uso en produccion ni informes de terceros.
- Verificacion limitada: la paridad se comprobo en tres paginas (una sin mosaico y dos con mosaico), con decodificacion greedy sobre CPU. No cubre GPU, documentos de muchas paginas ni diversidad de idiomas o tipografias.
- Sin benchmarks de calidad OCR: no hay CER, WER ni exactitud de estructura. La equivalencia con PyTorch garantiza fidelidad al original, no calidad absoluta.
- Cuantizaciones agresivas no disponibles: Q4_K y las variantes mixtas Q4 rompen la paridad y no se publican, de modo que el suelo real de memoria es de unos 3,57 GB.
- Dependencia de runtime propietario del ecosistema: el modelo esta pensado para CrispEmbed y requiere una variable de entorno para activarse. No hay confirmacion de soporte en llama.cpp u Ollama.
- Idiomas no declarados: la ficha del repositorio no enumera lenguas soportadas, lo que impide garantizar cobertura del castellano o de otras lenguas sin evaluacion propia.
- Longitud de contexto sin cifra publicada: la expresion "horizonte ilimitado" es una afirmacion de marketing del proyecto upstream, no una especificacion medible. Para documentos largos hay que validar por cuenta propia.
- Riesgo de alucinacion: como todo modelo generativo aplicado a OCR, puede producir texto plausible ausente en la imagen, especialmente en regiones de baja calidad o en tablas complejas. La naturaleza determinista en greedy reduce la varianza, no elimina el error.
- Sesgos: no documentados. Al no publicarse la composicion del corpus de entrenamiento, no es posible evaluar sesgos por idioma, alfabeto o tipo de documento.
- Licencia: MIT permite uso comercial y modificacion, pero exige conservar el aviso de copyright de Baidu. Nota relevante: el repositorio del modelo base declara MIT sin incluir fichero LICENSE, y la conversion toma el texto literal del repositorio de codigo upstream, identificado por SHA256. Conviene conservar `LICENSE` y `UPSTREAM_README.md` junto a los pesos.
- Discrepancia de atribucion: la ficha de ModelScope aparece bajo `PaddlePaddle/Unlimited-OCR-2` mientras el repositorio de HuggingFace es `baidu/Unlimited-OCR-2`. Verificar la procedencia antes de integrar en un producto.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/cstr/Unlimited-OCR-2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/baidu/Unlimited-OCR-2
- Revision fijada del modelo base: https://huggingface.co/baidu/Unlimited-OCR-2/tree/04647c7a6098d8d58915f003536a741c82eafb40
- Repositorio de codigo upstream: https://github.com/baidu/Unlimited-OCR
- Licencia upstream empleada en la conversion: https://github.com/baidu/Unlimited-OCR/blob/6e64831ab434b689ba1a28ede703b6d7d05cd714/LICENSE
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Conversion alternativa del mismo modelo: https://huggingface.co/AtomicChat/Unlimited-OCR-2-GGUF
- Conversion de la generacion anterior por el mismo autor: https://huggingface.co/cstr/unlimited-ocr-crispembed-GGUF
- Ficha en ModelScope: https://www.modelscope.cn/models/PaddlePaddle/Unlimited-OCR-2
- Indice de modelos GGUF: https://local-ai-zone.github.io/models/unlimited-ocr.html
