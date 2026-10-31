# PALLER-NOVUS/WeVisOne-VL-GGUF

## Resumen

WeVisOne-VL GGUF es una conversión a formato GGUF de los modelos WeVisOne-VL de Tencent (equipo WeChat Vision), realizada por NOVUS / PALLER-NOVUS. El modelo original está especializado en percepción visual estructurada: detección de objetos, referring expression, conteo, pointing y OCR. La versión GGUF permite ejecutar estos modelos localmente en GPUs de consumo mediante llama.cpp, con cuantizaciones desde Q2_K hasta F16 en dos tamaños: 2B y 4B.

El problema que resuelve es doble: por un lado, hace accesible en hardware modesto un modelo de localización visual estructurada que emite coordenadas normalizadas 0–1000 con etiquetas de referencia (`<ref>`, `<box>`); por otro, aporta un protocolo de evaluación explícito y artefactos verificados por hash, algo poco habitual en repositorios de cuantización. La arquitectura base se deriva de Qwen3-VL, según las etiquetas del repositorio.

Se trata de una versión preliminar (preview): el piloto de cuantización Q4_K_M/F16 en GPU está completo, pero el benchmark de calidad completo (272 consultas en cinco familias de tareas) sigue pendiente, por lo que no existe aún un ranking definitivo de calidad entre cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal basada en Qwen3-VL (modelo base tencent/WeVisOne-VL) |
| Parametros totales | 406.957.056 (dato safetensors del repo); variantes 2B y 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de servidor probado) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con projectores de vision separados: vision-2b.gguf y vision-4b.gguf) |

## Arquitectura y entrenamiento

WeVisOne-VL es un modelo multimodal image-text-to-text derivado de la familia Qwen3-VL, entrenado por el equipo WeChat Vision de Tencent. Su especialización no es la conversación generalista, sino la percepción visual estructurada: el modelo emite respuestas con etiquetas especiales y coordenadas normalizadas en escala 0–1000, por ejemplo `<ref>dog</ref><box><12><274><400><946></box>`. La conversión GGUF preserva los 1001 tokens de coordenadas y el token especial `<OBJ>` (ID 152678), imprescindibles para que la salida estructurada siga siendo parseable tras la cuantización.

Sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, RLHF/DPO) no hay datos disponibles en la informacion proporcionada. La version GGUF es una cuantizacion post-entrenamiento sin ajuste adicional. Un detalle tecnico relevante: la segmentacion y el alpha matting no funcionan en la interfaz GGUF, porque el decoder de Tencent necesita features visuales y el hidden state de `<OBJ>`; para esas tareas hay que usar el paquete nativo de Tencent.

## Capacidades

- Deteccion de objetos con coordenadas estructuradas en formato `<ref>`/`<box>` normalizadas 0–1000.
- Referring expression: localizar instancias que coinciden con una descripcion en lenguaje natural.
- Conteo de objetos (counting) y pointing.
- OCR: reconocimiento de texto en imagenes.
- Entrada de imagenes JPEG y PNG mediante projectores de vision GGUF (mmproj).
- No establece capacidades de asistente generalista, video ni rendimiento multilingue: el alcance probado es percepcion visual estructurada.
- Sin soporte en la interfaz GGUF para segmentacion ni alpha matting (requieren el paquete nativo de Tencent).
- No hay mencion de tool calling, agentes ni thinking mode.

## Casos de uso

- Indexacion visual de catalogos: deteccion y localizacion automatica de productos en fotografias, generando bounding boxes parseables para alimentar bases de datos o buscadores visuales.
- Moderacion de contenido: localizacion de objetos o elementos concretos en imagenes enviadas por usuarios, usando prompts de referencia en lenguaje natural.
- OCR de documentos: extraccion de texto de escaneos, facturas o capturas, aprovechando la especializacion OCR del modelo.
- Analitica de imagenes en el borde (edge): conteo de personas u objetos en camaras con GPUs modestas gracias a que la variante 2B Q4_K_M ocupa 1,28 GB en disco.
- Generacion de anotaciones para datasets: preetiquetado de bounding boxes para reducir el coste de anotacion manual en proyectos de vision por ordenador.
- Integracion en pipelines locales privados: ejecucion 100% offline con llama-server, util cuando las imagenes no pueden salir de la infraestructura propia (salud, industria, defensa).
- Accesibilidad: descripcion estructurada de escenas localizando elementos relevantes para herramientas de apoyo visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (accuracy) en la informacion disponible. El benchmark completo de 272 consultas en cinco familias de tareas esta pendiente de finalizar. Lo unico medido es un piloto de latencia y memoria:

| Medicion (piloto, no accuracy) | Valor |
|---|---|
| Hardware | RTX 2060 6 GB |
| Consultas | 20 fijas por variante |
| 4B F16 | ~60 s/consulta, con CPU offload (9,01 GiB de pesos y projectores en disco) |
| 2B Q4_K_M | 19/20 respuestas completas y parseables (un fallo por limite de tokens) |
| Resto de variantes probadas | 20/20 respuestas completas y parseables |

Estos datos son de latencia y memoria, no porcentajes de acierto. No se han medido GPUs mayores.

## Requisitos de hardware

- VRAM estimada: la 2B Q4_K_M (1,28 GB de pesos + 0,82 GB de projector) funciona en 6 GB de VRAM; la 4B F16 (8,84 GB + 0,84 GB) no cabe en 6 GB y requiere CPU offload. Con 8 GB la 4B puede seguir necesitando offload; 12–16 GB ofrecen margen adecuado.
- GPU probada: RTX 2060 6 GB (piloto). GPUs mayores no medidas, aunque A100/RTX 4090 no deberian tener problema con ninguna variante.
- Consumer GPUs: la 2B cabe comodamente en tarjetas de 6–8 GB; la 4B en cuantizaciones Q4/Q5 deberia caber en 8 GB con ajuste, y con holgura en 12–16 GB.
- Despliegue: llama.cpp con un build parcheado incluido en REPRODUCE.md (obligatorio: los builds upstream sin parchear no estan validados). No hay mencion de soporte validado en vLLM, Ollama o TGI; las integraciones en apps de escritorio tampoco estan validadas.
- Configuracion probada: `llama-server` con `-c 4096`, `--image-min-tokens 1024 --image-max-tokens 1960`, `-ngl auto` (CUDA) o `-ngl 0` (CPU).
- Latencia: ~60 s/consulta para 4B F16 con offload en RTX 2060; para el resto de variantes solo consta que completaron 20/20 consultas, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tareas | Licencia |
|---|---|---|---|---|
| WeVisOne-VL GGUF (2B/4B) | 2B / 4B | GGUF (Q2_K–F16) | Deteccion, referring, conteo, pointing, OCR | Apache 2.0 |
| Qwen3-VL (base, 2B/4B) | 2B / 4B | Safetensors, GGUF comunitarios | Multimodal generalista (VQA, OCR, texto) | Apache 2.0 (segun familia Qwen) |
| PaddleOCR / modelos OCR dedicados | <100M tipicamente | Propio / ONNX | Solo OCR | Variada (Apache 2.0 en PaddleOCR) |
| Paquete nativo Tencent WeVisOne-VL | 2B / 4B | PyTorch nativo | Incluye segmentacion y alpha matting | Consultar repo Tencent |

La ventaja diferencial de WeVisOne-VL frente a un VLM generalista es la salida estructurada con tokens de coordenadas dedicados; frente a un OCR dedicado, anade deteccion y referring. La contrapartida es que las tareas de segmentacion requieren el paquete nativo.

## Limitaciones y advertencias

- Preview release: no existe ranking de calidad entre cuantizaciones; solo Q4_K_M y F16 han pasado el piloto.
- El benchmark de calidad (272 consultas) esta incompleto; las cifras disponibles son solo de latencia y memoria.
- Requiere un build parcheado de llama.cpp; los builds upstream y apps de escritorio no estan validados.
- Segmentacion y alpha matting no funcionan en GGUF, aunque se incluya `mask_decoder.pt`.
- Idioma: solo se declara soporte de ingles; no hay validacion multilingue ni de castellano.
- No se ha establecido rendimiento como asistente generalista, ni con video.
- La 2B Q4_K_M mostro un fallo por limite de tokens en 20 consultas: conviene ajustar `--image-max-tokens` segun la densidad visual esperada.
- Riesgo de alucinacion en coordenadas: el propio README advierte que el ejemplo de salida no representa una respuesta esperada para toda imagen; conviene validar las cajas en produccion.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque los modelos base de Tencent pueden tener terminos propios que conviene revisar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/PALLER-NOVUS/WeVisOne-VL-GGUF
- Modelo base 2B: https://huggingface.co/tencent/WeVisOne-VL-2B
- Modelo base 4B: https://huggingface.co/tencent/WeVisOne-VL-4B
- Paquete nativo de Tencent: https://github.com/Tencent/WeVisOne-VL
- Documentacion interna del repo: BENCHMARKS.md, REPRODUCE.md, NOTICES.md, manifest.json, pilot-measurements.json, cohort-ids.json (en el propio repositorio)
