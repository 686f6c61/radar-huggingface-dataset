# HagridEFF/Qwen3.8-4B-Distill-ARA-Abliterated-W4A16

## Resumen

Qwen3.8-4B-Distill-ARA-Abliterated-W4A16 es una version cuantizada a 4 bits del modelo denso Qwen3.8-4B en su variante destilada y "abliterated" (sin mecanismos de rechazo), publicada por el usuario HagridEFF sobre el checkpoint de Austriani. El modelo parte de una arquitectura hibrida de 32 capas que combina 24 capas de *gated delta net* con 8 capas de atencion clasica, un hidden size de 2560 y 16 cabezas de atencion con 4 cabezas KV, con una longitud de contexto nativa de 262 144 tokens.

La contribucion principal de esta ficha es la cuantizacion W4A16 mediante AutoRound 0.14.2 con grupo 128, que reduce los pesos de aproximadamente 9,1 GB en BF16 a unos 3,6 GB, permitiendo servir el modelo en GPUs de 16 GB o inferiores con un rendimiento medido de hasta 866 tokens por segundo en una RTX A4000 de 14 GB. El checkpoint se distribuye en formato `compressed-tensors` y esta pensado para su despliegue directo con vLLM.

Es relevante para desarrolladores que necesiten un modelo pequeno, sin filtros de rechazo, con contexto largo y bajo coste de inferencia, especialmente en entornos europeos donde la residencia de datos y la ausencia de registro de contenido sean requisitos. La licencia Apache-2.0 facilita su integracion comercial, aunque la naturaleza "uncensored" exige controles aplicativos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 capas gated delta net + 8 capas de atencion, 32 capas totales |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; 32 768 tokens servidos en la configuracion de referencia |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo 128, AutoRound 0.14.2 |
| Idiomas soportados | Ingles, frances y multilingue (base Qwen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`pack-quantized`), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es una destilacion de Qwen3.8-4B con abliteracion ARA, una tecnica que elimina la direccion de rechazo en el espacio de activaciones para producir un modelo que responde sin filtros de negacion. La arquitectura es hibrida: 24 de las 32 capas emplean *gated delta net* (un mecanismo de estado recurrente lineal) y las 8 restantes usan atencion clasica, con hidden size de 2560, 16 cabezas de atencion y 4 cabezas KV. Esta combinacion busca eficiencia en contextos largos reduciendo el coste cuadratico de la atencion en la mayoria de capas.

La cuantizacion se realizo con AutoRound 0.14.2 en esquema W4A16, grupo 128, con 200 iteraciones sobre 384 muestras de 2048 tokens del dataset publico `NeelNanda/pile-10k`, sin datos de clientes. Se mantuvieron en BF16 el torre de vision (`model.visual`, desactivado en el servicio), las proyecciones `linear_attn.in_proj_a/b`, la cabeza MTP, los embeddings y las normalizaciones. El export se realizo a `compressed-tensors` mediante `llm_compressor`, que vLLM carga automaticamente usando nucleos Marlin. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo base ni sobre si se aplico RLHF o DPO en la destilacion.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 32 768 tokens en la configuracion servida).
- Razonamiento basico y respuesta a instrucciones exactas, validado con sondas funcionales.
- Generacion de codigo Python y salida estructurada en JSON.
- Tool calling y function calling, con parser `qwen3_coder` y soporte de `--enable-auto-tool-choice` en vLLM.
- Capacidad multilingue, con calidad validada especificamente en frances e ingles.
- Modo "thinking" configurable mediante `enable_thinking` en el chat template (desactivado por defecto en la configuracion de referencia).
- Manejo de contexto largo tipo "aguja en un pajar", validado hasta 51 000 tokens en las pruebas del autor.
- Sin mecanismos de rechazo: 0 % de rechazos en una suite de 12 prompts legitimos variados.
- Capacidad de vision presente en los pesos (torre `model.visual` en BF16) pero no servida en esta configuracion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32 768 tokens, suficiente para historiales largos y documentacion de producto, con un coste de inferencia bajo gracias a la cuantizacion W4A16.
- Generacion de codigo en produccion: soporta tool calling y salida JSON, lo que permite integrarlo en pipelines de CI/CD para autocompletado, generacion de tests o transformacion de codigo, con el parser `qwen3_coder` ya probado en vLLM.
- Procesamiento de documentos largos en frances e ingles: con contexto nativo de 262 144 tokens (servido a 32 768), es adecuado para resumen, extraccion de entidades y respuesta sobre contratos o informes extensos.
- Agentes autonomos de bajo coste: la combinacion de tool calling, contexto largo y latencia reducida (1,86 s p50 a concurrencia 8) permite desplegar agentes multi-paso en GPUs de 16 GB.
- Asistentes sin filtros para investigacion: al ser un modelo abliterated, es util en entornos de investigacion sobre seguridad, sesgos y comportamiento de modelos sin rechazo, siempre con supervision humana.
- Despliegue en infraestructura europea: la licencia Apache-2.0 y el soporte de vLLM permiten alojarlo en centros de datos de la UE con residencia de datos garantizada, sin dependencia de APIs externas.
- Generacion de contenido creativo y marketing en frances: la validacion de calidad en frances y la ausencia de rechazos lo hacen adecuado para borradores de copy y variaciones de texto.
- Prototipado rapido en hardware consumer: con aproximadamente 3,6 GB de pesos, cabe en GPUs consumer de 8-16 GB, lo que facilita pruebas locales antes de escalar a produccion.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Los datos disponibles son mediciones de rendimiento de inferencia y sondas funcionales:

| Metrica | BF16 (c=8) | W4A16 (c=8) | W4A16 (c=16) |
|---|---:|---:|---:|
| Throughput agregado | 254 tok/s | 550 tok/s | 866 tok/s |
| TTFT p50 | 0,34 s | 0,33 s | 0,61 s |
| Latencia p50 | 4,03 s | 1,86 s | 2,36 s |

Mediciones realizadas con vLLM 0.32 sobre una RTX A4000 de 14 GB, contexto de 32 768 tokens, peticiones de chat de 200 tokens de entrada y 128 de salida. La cuantizacion multiplica el throughput por aproximadamente 2,2 y reduce a la mitad la latencia por peticion frente a BF16, con un consumo de 12,7 GB de VRAM a 32 768 de contexto incluyendo cache KV.

Sondas funcionales superadas: 6/6 (instruccion exacta, salida JSON, codigo Python, calidad en frances, tool calling y aguja en contexto de 51 000 tokens). Refusals: 0 % en 12 prompts legitimos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,6 GB de pesos en W4A16; 12,7 GB de VRAM totales a 32 768 de contexto incluyendo cache KV (medido en RTX A4000).
- GPU recomendadas: RTX A4000 14 GB (configuracion de referencia probada), RTX 4090 24 GB, A100 40/80 GB, H100. Cabe en GPUs consumer de 16 GB o superiores.
- Cabe en GPU consumer: si, en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) y potencialmente en 12 GB con contexto reducido.
- Opciones de despliegue: vLLM v0.32.0 (probado, con nucleos Marlin y `compressed-tensors`), con soporte de prefix caching, `mamba-ssm-cache-dtype bfloat16` y parser `qwen3_coder`. No se menciona soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 550 tok/s agregados a concurrencia 8 y 866 tok/s a concurrencia 16 en RTX A4000; TTFT p50 de 0,33-0,61 s y latencia p50 de 1,86-2,36 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-ARA-Abliterated-W4A16 (este) | 4,54 B | 262 144 nativo / 32 768 servido | W4A16, ~3,6 GB | Apache-2.0 | Sin rechazos, hibrido gated delta net |
| Austriani/Qwen3.8-4B-Distill-ARA-Abliterated (base) | 4,54 B | 262 144 | BF16, ~9,1 GB | Apache-2.0 | Mismo modelo sin cuantizar; ~2,2x menos throughput |
| Qwen3.8-4B (original, sin destilar) | 4 B aprox. | 262 144 | BF16 | Apache-2.0 | Con filtros de rechazo; referencia de arquitectura |
| Modelos densos de 4 B en BF16 (genericos) | ~4 B | variable | BF16 | variable | No disponible comparativa de rendimiento estandar |

No se dispone de resultados de benchmarks estandar que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo sin censura: puede producir contenido sensible, ilegal o inexacto; se recomienda un filtro aplicativo y supervision humana en cualquier aplicacion sensible.
- Riesgo de alucinacion: al ser un modelo pequeno (4,54 B) destilado, es menos fiable que modelos de 27 B o superiores en razonamiento complejo; el autor advierte explicitamente de esta limitacion.
- La cuantizacion se valido solo con sondas funcionales, no con un benchmark exhaustivo; el impacto en calidad respecto a BF16 no esta cuantificado.
- El torre de vision no se sirve en esta configuracion, aunque los pesos esten presentes en BF16.
- Idiomas validados: frances e ingles; el resto de idiomas depende de la base Qwen y no esta verificado.
- Contexto servido limitado a 32 768 tokens en la configuracion de referencia, muy por debajo de los 262 144 nativos; ampliarlo requiere mas VRAM.
- Licencia Apache-2.0 permite uso comercial, pero la naturaleza "abliterated" puede entrar en conflicto con politicas de plataformas o requisitos regulatorios; revisar antes de desplegar.
- Se entrega "tal cual", sin garantia ni soporte del autor.
- Las fechas de creacion del repositorio (2026-11-25) y la version de vLLM citada (v0.32.0) deben verificarse contra el estado actual del ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/HagridEFF/Qwen3.8-4B-Distill-ARA-Abliterated-W4A16
- Modelo base: https://huggingface.co/Austriani/Qwen3.8-4B-Distill-ARA-Abliterated
- API Effrenus (proveedor del autor): https://effrenus.com/en
- Dataset de calibracion: https://huggingface.co/datasets/NeelNanda/pile-10k
- vLLM: https://github.com/vllm-project/vllm
- AutoRound: https://github.com/intel/auto-round
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
