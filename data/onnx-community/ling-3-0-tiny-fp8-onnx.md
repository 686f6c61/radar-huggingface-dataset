# onnx-community/Ling-3.0-tiny-fp8-ONNX

## Resumen

Ling-3.0-tiny-fp8-ONNX es un artefacto de exportación a ONNX del checkpoint Ling-3.0-tiny-fp8, publicado por la comunidad onnx-community. No se trata de un modelo entrenado por separado, sino de una conversión de pesos ya existentes a un formato portable (Opset 19, IR 10) con operadores estándar de ONNX. El repositorio distribuye únicamente tres grafos de lenguaje completos —`forward.onnx`, `prefill.onnx` y `decode.onnx`— que comparten un fichero de datos externos común (`onnx/weights/model.bin`), con un total de 8,6 GB en el repositorio.

El interés técnico del artefacto está en cómo representa la cuantización FP8: conserva los bytes de peso E4M3FN y los bytes de escala UE8M0 (codificados como UINT8 y decodificados explícitamente), aplica la regla de cuantización por bloque amax/448 sobre las activaciones y expresa los productos matriciales por bloques y la acumulación en FP32, con activaciones BF16 en las fronteras del grafo. La arquitectura subyacente aparece etiquetada como `bailing_hybrid`, y los grafos exponen cachés MLA y de convolución en BF16 junto con estados matriciales KDA en FP32, lo que corresponde a un transformer híbrido con atención latente y un mecanismo de atención lineal tipo delta.

La advertencia principal es su estado: el propio autor lo marca como `EXPORTED_NOT_VALIDATED`. Se han completado las comprobaciones estáticas de estructura, tipos y formas, pero no se ha ejecutado inferencia ni se han realizado pruebas de alineamiento numérico, calidad o rendimiento. Además, el artefacto no incluye adaptador para ONNX Runtime GenAI ni para Foundry Local: el consumidor debe aportar tokenización, bucle de generación y orquestación de estados. Es, por tanto, material de partida para ingeniería de despliegue, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (etiqueta `bailing_hybrid`); los grafos exponen cachés MLA, cachés de convolución y estados matriciales KDA. Detalle completo no disponible en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos FP8 E4M3FN con escalas de bloque UE8M0 (representadas como UINT8 y decodificadas explícitamente); activaciones BF16 en las fronteras del grafo; acumulación de productos matriciales en FP32; estados KDA en FP32; logits en FP32 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | no disponible (el README remite a la licencia original y a `LICENSE_NOTICE.md` en la raíz del repositorio) |
| Formato de pesos | ONNX (Opset 19, IR 10) con datos externos compartidos en `onnx/weights/model.bin`; también se incluyen configuración y recursos de tokenizador en la raíz |
| Tamano del repositorio | 8,6 GB |
| Batch soportado | 1 (padding no soportado) |
| Entradas requeridas | `input_ids` INT64 y `position_ids` INT64 contiguos |
| Estado de validacion | `EXPORTED_NOT_VALIDATED` (solo comprobaciones estáticas de estructura, tipos y formas) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

El artefacto no documenta el entrenamiento: es una exportación del checkpoint Ling-3.0-tiny-fp8 y la model card no incluye número de tokens, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí puede deducirse de los grafos publicados es la estructura de inferencia: el modelo combina atención con caché latente (MLA), cachés de convolución y un mecanismo denominado KDA cuyos estados se almacenan en matrices FP32. El grafo `prefill.onnx` devuelve logits y los estados iniciales de las capas mixtas; `decode.onnx` consume un token y devuelve el conjunto completo de estados, que deben reinyectarse en cada paso. `forward.onnx` ejecuta el pase completo sin devolver cachés.

La innovación relevante aquí es la estrategia de representación numérica, no la del modelo original. La exportación preserva los bytes FP8 E4M3FN y las escalas UE8M0 del checkpoint fuente, reproduce la regla de cuantización por bloque amax/448 y formula los productos matriciales por bloques con acumulación FP32, dejando las activaciones en BF16 en los límites del grafo. El autor advierte explícitamente de que esto **no** implementa un kernel GEMM FP8 nativo y no establece rendimiento FP8 nativo: es una emulación en grafo. KDA se implementa mediante un `Loop` estándar de ONNX, lo que previsiblemente penaliza la latencia del paso de decodificación. Los bloques de activación totalmente nulos conservan el comportamiento NaN de la regla de origen, sin política de padding ni epsilon añadido.

## Capacidades

- Generación de texto autoregresiva: el pipeline declarado es `text-generation`, con tres grafos que cubren pase completo, prefill y decodificación token a token.
- Conversación multi-turno: la etiqueta `conversational` está presente en los metadatos del repositorio; el mantenimiento del estado conversacional corre a cargo del consumidor mediante la reinyección de los estados devueltos por `decode.onnx`.
- Ejecución portable: al usar operadores estándar de ONNX (Opset 19, IR 10), el grafo es ejecutable sobre cualquier runtime compatible con ese opset, independientemente del hardware.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas (lista de idiomas no disponible).
- Modo thinking, visión o audio: no documentado; el repositorio solo distribuye grafos de lenguaje.
- Capacidad especial verificable: interoperabilidad de pesos cuantizados FP8 en formato ONNX sin necesidad de kernel FP8 nativo en el runtime.

## Casos de uso

- **Despliegue en infraestructura con runtime ONNX propietario**: organizaciones que ya tienen ONNX Runtime desplegado en C++, C#, Java o JS pueden cargar estos grafos sin introducir PyTorch ni vLLM en la cadena. Requiere implementar el orquestador de estados, pero evita dependencias del ecosistema HuggingFace en producción.
- **Inferencia en dispositivos edge y entornos embebidos**: el formato ONNX con datos externos en un único `model.bin` y batch fijo de 1 encaja en escenarios de un solo usuario por dispositivo, donde el batching no aporta y el tamaño del runtime importa más que el throughput agregado.
- **Validación de pipelines de cuantización FP8**: el artefacto sirve como caso de prueba para verificar que un runtime reproduce correctamente la decodificación de escalas UE8M0 y la regla amax/448 por bloque, comparando los logits FP32 del grafo con la referencia del checkpoint original.
- **Integración en aplicaciones de escritorio con aceleración por hardware heterogéneo**: al ser un grafo estándar, puede ejecutarse sobre EP de ONNX Runtime (CUDA, DirectML, CoreML, OpenVINO), lo que permite reutilizar el mismo artefacto en Windows, macOS y Linux con distinto backend.
- **Base para conversión a otros formatos**: los tres grafos y el `model_interface.json` con nombres, dtypes, formas y mapeos de estado documentan la topología completa del modelo, lo que facilita a un equipo derivar versiones propias (por ejemplo, hacia GGUF) partiendo de una descripción estructural explícita.
- **Investigación sobre atención híbrida**: los estados KDA en FP32 y las cachés MLA/conv separadas permiten instrumentar el grafo para estudiar cómo evolucionan los estados internos por capa durante el decode, algo más difícil en implementaciones monolíticas.
- **Prototipado de asistentes conversacionales de un solo hilo**: con la etiqueta `conversational` y batch 1, es un punto de partida razonable para un prototipo de chat local antes de comprometerse con un stack de serving completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es explícita: no se han ejecutado pruebas de rendimiento, alineamiento numérico ni evaluación de calidad sobre estos artefactos, y el estado declarado es `EXPORTED_NOT_VALIDATED`. Tampoco se proporcionan cifras de latencia, throughput ni comparaciones con el checkpoint original.

## Requisitos de hardware

- **VRAM estimada**: no hay medición publicada. Como referencia de orden de magnitud, el repositorio ocupa 8,6 GB y la mayor parte corresponde a `onnx/weights/model.bin`; a eso hay que sumar activaciones BF16, estados KDA en FP32, logits FP32 y el propio runtime. Una estimación conservadora sitúa el mínimo práctico en torno a 12-20 GB, pero es una estimación no verificada.
- **Penalización por falta de kernel FP8**: al no haber GEMM FP8 nativo, los productos por bloques se emulan con acumulación FP32. Cabe esperar mayor uso de memoria de trabajo y menor throughput que una implementación FP8 nativa del mismo checkpoint.
- **GPU recomendadas**: no verificadas. Por el tamaño del artefacto, GPU de datacenter con 24 GB o más (A100 40/80 GB, H100, L40S) son el objetivo razonable; no hay datos que confirmen funcionamiento en ninguna de ellas.
- **GPU de consumo**: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) quedan en el límite alto de la estimación anterior; tarjetas de 8-16 GB probablemente no sean suficientes, aunque no se ha medido. Ejecución en CPU es posible a nivel de formato, pero sin datos de latencia.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#, Java, JS) es la vía directa. **No** se proporciona adaptador para ONNX Runtime GenAI ni para Foundry Local, de modo que el bucle de generación, la tokenización y la gestión de estados deben implementarse a medida. No es compatible directamente con vLLM, llama.cpp u Ollama, que requieren otros formatos.
- **Latencia y throughput**: no disponible. El uso de un `Loop` de ONNX para KDA y la ausencia de batching (batch size 1, padding no soportado) limitan estructuralmente el throughput agregado en escenarios multiusuario.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Ling-3.0-tiny-fp8-ONNX (este artefacto) | ONNX Opset 19, IR 10 | FP8 E4M3FN + escalas UE8M0, acumulación FP32 | no disponible | no disponible | `EXPORTED_NOT_VALIDATED` |
| Ling-3.0-tiny-fp8 (checkpoint de origen, referenciado en la model card) | no disponible | FP8 | no disponible | no disponible | publicado por el autor original; sin datos verificados en esta ficha |
| Otras exportaciones ONNX de la comunidad `onnx-community` | ONNX | variable | no disponible | no disponible | no disponible |
| Modelos tiny comparables de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks, contexto, parámetros ni licencia de las alternativas que permitan una comparación cuantitativa fiable. La única comparación significativa disponible es contra el checkpoint FP8 de origen, y únicamente en términos de formato: el artefacto ONNX añade portabilidad y elimina la dependencia de PyTorch, a costa de requerir orquestación manual y de no aprovechar kernels FP8 nativos.

## Limitaciones y advertencias

- **Sin validación en ejecución**: el estado `EXPORTED_NOT_VALIDATED` implica que no se ha ejecutado inferencia sobre estos grafos. No hay garantía de que la salida sea numéricamente correcta ni de que el modelo funcione de extremo a extremo.
- **Sin benchmarks de calidad**: no se ha evaluado la degradación de calidad introducida por la exportación FP8. Cualquier uso en producción exige una evaluación propia antes de desplegar.
- **Comportamiento NaN en bloques nulos**: la regla de cuantización de origen se conserva tal cual, de modo que los bloques de activación totalmente nulos producen NaN. No se ha añadido padding ni epsilon para mitigarlo, lo que puede provocar fallos en entradas atípicas.
- **Batch fijo de 1 y sin padding**: no hay soporte de batching ni de secuencias acolchadas. Esto impide escalar throughput por agregación de peticiones y complica el servicio multiusuario.
- **Orquestación manual obligatoria**: el consumidor debe aportar tokenización, bucle de generación, muestreo y gestión completa del estado entre prefill y decode. Un error en el mapeo de estados (documentado en `model_interface.json`) produce salidas silenciosamente incorrectas.
- **Rendimiento FP8 no nativo**: la emulación con acumulación FP32 no ofrece las ventajas de velocidad de un kernel FP8 real; el beneficio es de compatibilidad, no de rendimiento.
- **KDA mediante `Loop` de ONNX**: la implementación con un bucle estándar es previsiblemente lenta en decodificación y puede no estar optimizada en todos los execution providers.
- **Licencia no determinada**: los metadatos no declaran licencia y el README remite a `LICENSE_NOTICE.md` y a la licencia del modelo original. Antes de cualquier uso comercial es imprescindible verificar los términos del checkpoint fuente, que esta ficha no puede confirmar.
- **Idiomas y sesgos desconocidos**: no se declara lista de idiomas ni se documentan sesgos. Al no haberse evaluado el artefacto, el riesgo de alucinación y de comportamiento sesgado en dominios sensibles es indeterminado.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso por terceros ni de que alguien haya reportado éxito en la ejecución, lo que refuerza la cautela.
- **Diseño de ficheros frágil**: los grafos dependen de la ruta relativa `onnx/weights/model.bin`; mover o renombrar ficheros rompe la carga del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onnx-community/Ling-3.0-tiny-fp8-ONNX
- Fichero de interfaz del modelo (en el repositorio): `model_interface.json`
- Instrucciones de reproducción de la exportación (en el repositorio): `conversion/README.md`
- Informe de exportación (en el repositorio): `conversion/export_report.json`
- Verificador estático de formato (en el repositorio): `conversion/scripts/check_onnx_format.py`
- Aviso de licencia (en el repositorio): `LICENSE_NOTICE.md`
- Sitio oficial de ONNX: https://onnx.ai/
- Documentación de ONNX: https://onnx.ai/onnx/
- Repositorio de ONNX en GitHub: https://github.com/onnx/onnx
- ONNX Runtime: https://onnxruntime.ai/
- Wikipedia, Open Neural Network Exchange: https://en.wikipedia.org/wiki/Open_Neural_Network_Exchange
