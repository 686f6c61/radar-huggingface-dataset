# AutomatosX/AX-Muse-Glimmer-30B-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Muse-Glimmer-30B-CUDA-AXQ-NVFP4-W4A16 es un checkpoint experimental publicado por AutomatosX, un tercero independiente, que aplica su toolkit propio de cuantizacion AXQuant (version 2.2.1) sobre el modelo multimodal meta-models/Muse-Glimmer-30B. No es un modelo entrenado desde cero, sino un empaquetado de pesos en formato NVFP4 con activaciones en BF16 (esquema W4A16), orientado al pipeline image-text-to-text. El repositorio ocupa 23,4 GB y contiene 29.776.626.688 parametros segun los tensores en safetensors.

Su relevancia es acotada y fundamentalmente tecnica: sirve como evidencia de desarrollo del encoder AXQuant, no como un artefacto listo para produccion. El propio autor advierte en la model card que el pack se reconstruira con una version mejorada del toolkit y que debe considerarse "development evidence, not a quality certificate". El manifiesto mantiene explicitamente `status=development`, `runtime_verified=false` y `quality_certified=false`.

La licencia declarada es Apache-2.0, heredada del modelo base, y el pipeline es conversacional multimodal. No se han publicado datos de benchmarks, idiomas soportados ni resultados de ejecucion nativa en CUDA o FP4, por lo que cualquier evaluacion de calidad queda pendiente de validacion por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos E2M1 empaquetados, escalas E4M3 por cada 16 valores, escala global inversa FP32); activaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con contenedor compressed-tensors NVFP4A16 |
| Modelo base | meta-models/Muse-Glimmer-30B (revision a4e59da52a7bc87ae7251dd5545c0dd437c44b68) |
| Toolkit de cuantizacion | AXQuant 2.2.1, encoder RTN propio, backend numpy-reference |
| Tamano del repositorio | 23,4 GB |
| Estado del manifiesto | development, runtime_verified=false, quality_certified=false |

## Arquitectura y entrenamiento

El modelo subyacente es Muse-Glimmer-30B, de meta-models, con arquitectura transformer multimodal orientada a image-text-to-text. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; esos datos no estan disponibles en la informacion proporcionada.

Lo que si documenta el autor es el proceso de cuantizacion: se utiliza el encoder RTN (round-to-nearest) de AXQuant 2.2.1, sin calibracion de activaciones ni medicion de sensibilidad. Se empaquetan 416 matrices de atencion y MLP del bloque de lenguaje, mientras que 1020 tensores restantes coinciden exactamente con el origen: vision, embeddings, normalizacion, cabeza de salida y pesos MTP empaquetados quedan protegidos. El artefacto incluye un manifiesto que vincula cada peso y fichero de configuracion exportado, y un `static-validation.json` con la comparacion completa de tensores protegidos y muestreo acotado de filas. La conversion se realizo con el backend `numpy-reference` sobre una Mac Studio M2 Ultra de 192 GB; el nombre "CUDA" del pack describe el formato de runtime previsto, no el dispositivo de conversion. El autor senala que el modelo base no incluye sidecar MTP y que este pack no reclama ninguna capacidad MTP.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado `conversational`.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), heredado del modelo base.
- Razonamiento explicito: la plantilla ATEM del modelo original activa por defecto un modo de razonamiento alto (`reasoning_strength=high`); las salidas contienen segmentos de razonamiento y de canal final de usuario.
- Capacidades de tool calling, function calling y agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno).
- Capacidades de audio: el autor indica que la generacion de vision y audio no ha sido cualificada en este pack.
- Contexto largo: no cualificado segun la model card.

## Casos de uso

- Evaluacion del toolkit AXQuant: el pack sirve para medir la fidelidad de reconstruccion BF16 frente al modelo original y validar el empaquetado NVFP4A16 en entornos de investigacion de cuantizacion.
- Pruebas de compatibilidad de runtime: util para verificar el registro de la arquitectura en vLLM 0.31.0 (version que, segun el autor, registra esta arquitectura) antes de adoptar el formato NVFP4 en un pipeline propio.
- Investigacion sobre cuantizacion post-entrenamiento: al no usar calibracion de activaciones, permite estudiar el comportamiento de RTN puro en un modelo multimodal de ~30B parametros.
- Desarrollo de pipelines multimodales experimentales: el pipeline image-text-to-text permite prototipar asistentes que combinan imagen y texto, siempre que se asuma la falta de verificacion de calidad.
- Reproducibilidad de artefactos: el manifiesto y el `static-validation.json` permiten auditar que tensores se modificaron y cuales se preservaron, util en trabajos academicos sobre trazabilidad de checkpoints cuantizados.
- Base para reconstrucciones futuras: dado el aviso de rebuild, el repositorio actua como referencia historica (fijando commit) para comparar con la proxima revision del pack.
- No recomendado para produccion: cualquier caso de uso en atencion al cliente, generacion de codigo o agentes requiere antes una validacion de calidad y runtime que este pack no aporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta un smoke test de referencia en PyTorch CPU sobre Mac Studio M2 Ultra (reconstruccion BF16 y generacion de texto con `reasoning_strength=low` y limite de 128 tokens), que no verifica ejecucion nativa en CUDA ni en FP4. Tampoco se aportan cifras de latencia, throughput ni ahorro de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio pesa 23,4 GB, lo que sugiere un footprint de pesos en el orden de esa cifra; el pico real depende de la implementacion de runtime y de la cache KV, que no se documenta.
- GPU recomendadas: no disponibles. El autor no ha probado el pack en CUDA; solo menciona compatibilidad de registro de arquitectura en vLLM 0.31.0, sin ejecucion verificada.
- Compatibilidad con GPU de consumo: no confirmada. El tamano de pesos (~23 GB) queda por encima de los 24 GB de una RTX 4090 solo con margen muy ajustado, y sin datos de overhead no puede afirmarse que quepa.
- Opciones de despliegue: vLLM 0.31.0 (registro de arquitectura, sin prueba de este pack concreto); vLLM 0.25.1 no registra la arquitectura segun el autor. No se mencionan llama.cpp, Ollama ni TGI, y el formato NVFP4A16 de compressed-tensors no es compatible con esos runtimes en su forma habitual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| AX-Muse-Glimmer-30B-CUDA-AXQ-NVFP4-W4A16 | 29,78B | no disponible | NVFP4 W4A16 (compressed-tensors) | Apache-2.0 | development, sin verificacion de runtime |
| meta-models/Muse-Glimmer-30B (base) | no disponible en esta ficha | no disponible | BF16 original | Apache-2.0 | modelo de referencia del autor |
| Otros packs AXQuant de AutomatosX | no disponible | no disponible | NVFP4 / AXQ | Apache-2.0 | no disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Artefacto experimental: el manifiesto declara `status=development`, `runtime_verified=false` y `quality_certified=false`; no debe tratarse como un checkpoint certificado.
- Rebuild anunciado: el autor avisa de que el pack se reconstruira con una version mejorada de AXQuant y se reemplazara como nueva revision; conviene fijar un commit si se depende de los ficheros actuales.
- Sin verificacion de runtime: no hay resultado de carga ni de generacion en CUDA o FP4; solo un smoke test en CPU con PyTorch.
- Sin calibracion: el encoder RTN no usa calibracion de activaciones ni medicion de sensibilidad, lo que puede degradar la calidad frente a tecnicas de cuantizacion conscientes de datos.
- Vision y audio no cualificados: el pipeline declara image-text-to-text, pero la generacion multimodal no ha sido validada en este pack.
- Contexto largo y paridad numerica no cualificados: no hay datos sobre comportamiento en ventanas extensas ni sobre desviacion respecto al modelo original.
- Idiomas no declarados: el campo de idiomas esta vacio, por lo que no puede asumirse cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser una cuantizacion de un modelo base sin evaluacion de calidad, el riesgo es el del modelo original, no caracterizado aqui.
- Licencia: Apache-2.0 heredada, apta para uso comercial segun los terminos de la licencia, pero debe preservarse la politica de uso upstream incluida en LICENSE y NOTICE; la licencia del toolkit AXQuant no sustituye a la del modelo fuente.
- No es un pack de AX Engine MLX: el autor lo aclara explicitamente, por lo que no debe confundirse con artefactos para Apple Silicon.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-Muse-Glimmer-30B-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B/tree/a4e59da52a7bc87ae7251dd5545c0dd437c44b68
- Revision del modelo base citada: a4e59da52a7bc87ae7251dd5545c0dd437c44b68
- Paper, blog, repositorio del toolkit o demo: no disponibles en la informacion proporcionada.
