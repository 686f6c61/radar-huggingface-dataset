# flukethoughts/GLM-4.5-Architect-106B-A12B-NVFP4

## Resumen

GLM-4.5-Architect-106B-A12B-NVFP4 es una cuantizacion en NVFP4 (W4A4) del modelo ConicCat/GLM-4.5-Architect-106B-A12B, publicada por el usuario flukethoughts. El objetivo declarado no es solo reducir el peso del checkpoint, sino conservar intacta la cabeza MTP (Multi-Token Prediction) en BF16 para que vLLM pueda utilizarla como modelo borrador en decodificacion especulativa, acelerando la fase de decodificacion de un MoE con unos 12B de parametros activos.

La arquitectura es glm4_moe: 46 capas de decoder, 128 expertos enrutados mas 1 experto compartido y `first_k_dense_replace: 1`. La cuantizacion NVFP4 se aplica a 17.602 lineales de atencion y MLP, mientras que `lm_head`, `model.embed_tokens`, los 45 routers MoE y los 401 tensores de la cabeza MTP se mantienen en BF16. El checkpoint almacena 60.658.362.756 parametros segun los safetensors, aunque el nombre del repositorio hace referencia a 106B totales y 12B activos.

Es relevante ahora porque NVFP4 es un formato de precision mixta que requiere hardware Blackwell (compute capability >= 10.0): no existe kernel capaz de ejecutarlo en Hopper (H100/H200), ya que las activaciones tambien son de 4 bits. El modelo incorpora ademas decisiones de ingenieria poco habituales, como mantener el `lm_head` en BF16 para no enterrar los logits de los tokens de control, y una calibracion especifica orientada a roleplay (70% roleplay / 30% texto general).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm4_moe (transformer decoder con mezcla de expertos) mas cabeza MTP de 1 capa |
| Parametros totales | 60.658.362.756 (~60,7 B) segun safetensors; el nombre del repositorio indica 106B |
| Parametros activos | 12B segun el nombre del modelo (sufijo A12B); no verificado en la informacion disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo oficial de servicio usa `--max-model-len 65536` |
| Tipos de cuantizacion | NVFP4 (W4A4) en 17.602 lineales de atencion y MLP; BF16 en `lm_head`, embeddings, routers MoE y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, generado con llm-compressor); compatible con vLLM |
| Numero de capas | 46 capas de decoder (`num_hidden_layers: 46`) |
| Expertos | 128 expertos enrutados + 1 experto compartido; 45 routers MoE en BF16 |
| Capas densas iniciales | 1 (`first_k_dense_replace: 1`) |
| Capas de prediccion adicionales | 1 (`num_nextn_predict_layers: 1`), almacenada en `model.layers.46.*` |
| Tamano del repositorio | 69,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Clase vLLM | `Glm4MoeMTPModel` |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos de tipo glm4_moe con 46 capas, de las cuales la primera es densa (`first_k_dense_replace: 1`) y las 45 restantes contienen capas MoE con 128 expertos enrutados mas 1 experto compartido. El conteo de lineales cuantizados se deriva del `config.json` y no esta fijado en el codigo: 46x4 en atencion, 1x3 en la capa densa y 45x(128x3 + 1x3) en las capas MoE, lo que da 17.602 lineales en NVFP4. Ademas, el checkpoint incluye una capa adicional en el indice 46 correspondiente a la cabeza MTP.

No se describe entrenamiento desde cero: se trata de una cuantizacion post-entrenamiento del modelo ConicCat/GLM-4.5-Architect-106B-A12B. El proceso de calibracion usa 256 secuencias de 4.096 tokens con una mezcla de 70% roleplay y 30% texto general, ajustada a la carga de trabajo prevista. La construccion se realizo sobre 2xB300 SXM6 y el proceso de linealizacion de expertos alcanza un pico de ~363 GB de memoria anonima; una maquina de 250 GB falla en la capa 11/45 y una de 376 GB falla en la 39/45.

La innovacion tecnica principal es la preservacion de la cabeza MTP. `Glm4MoeForCausalLM` de transformers solo construye las 46 capas de decoder y no tiene modulo para la cabeza nextn, de modo que `from_pretrained()` descarta silenciosamente los 404 tensores de `model.layers.46.*`, dejando un `config.json` que declara `num_nextn_predict_layers: 1` sin pesos detras. En esta build esos tensores se reinjertaron literalmente desde el checkpoint base en BF16 y la capa 46 se anadio a `quantization_config.ignore`. Esto permite a vLLM resolver el checkpoint como `Glm4MoeMTPModel` y usar la propia cabeza MTP como draft model.

## Capacidades

- Generacion de texto conversacional y de rol (roleplay), que es la carga de trabajo para la que se calibro la cuantizacion.
- Decodificacion especulativa nativa mediante la cabeza MTP integrada, con `num_speculative_tokens` configurable en vLLM.
- Inferencia eficiente en fase de decodificacion gracias a la combinacion de MoE con 12B activos y pesos de 4 bits, en hardware limitado por ancho de banda.
- Procesamiento de prompts largos en el rango de 65.536 tokens, segun el ejemplo de servicio oficial, con cache KV en fp8.
- Servicio como endpoint compatible con la API de OpenAI a traves de vLLM (`endpoints_compatible`).
- Soporte de cuantizacion mixta selectiva: los modulos sensibles (embeddings, `lm_head`, routers, cabeza MTP) permanecen en BF16.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y personajes conversacionales autoalojados: la calibracion se hizo con un 70% de datos de roleplay, por lo que la rejilla de cuantizacion se ajusta al registro linguistico que el modelo vera en produccion, reduciendo el degradado tipico de las cuantizaciones agresivas en este dominio.
- Atencion al cliente multi-turno: el ejemplo de servicio admite `--max-model-len 65536`, lo que permite mantener historiales largos y contexto de producto sin truncar la conversacion.
- Despliegue de bajo coste por token en fase de decodificacion: al ser un MoE con 12B activos y pesos NVFP4, el coste por token generado es muy inferior al de un modelo denso equivalente, especialmente con decodificacion especulativa activada.
- Aceleracion de inferencia mediante MTP: activar `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` usa la propia cabeza del modelo como draft, lo que aporta ganancia de velocidad en hardware limitado por ancho de banda sin necesidad de un segundo modelo borrador.
- Investigacion en cuantizacion NVFP4: el repositorio documenta gates de validacion (prueba de generacion con token de control en posicion 0 y al final del prompt) y la reinjercion de la cabeza MTP, lo que lo convierte en una referencia practica para estudiar fallos silenciosos de cuantizacion.
- Generacion por lotes fuera de linea: con `--gpu-memory-utilization 0.92` y cache KV fp8 se puede procesar volumen alto de prompts en un nodo Blackwell, por ejemplo para sintesis de datos o aumento de datasets conversacionales.
- Servicio de API compatible con OpenAI: la etiqueta `endpoints_compatible` permite sustituir un endpoint propietario por este checkpoint en vLLM sin reescribir los clientes.
- Evaluacion comparativa de fidelidad de cuantizacion: al existir el modelo base sin cuantizar, permite medir la perdida real de calidad frente a BF16 en el mismo prompt set.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y tampoco cifras medidas de latencia o throughput.

El unico dato numerico de calidad mencionado es que una build NVFP4 previa de otro modelo paso todas las comprobaciones estaticas (coseno de pesos 0.997, escalas finitas, tokenizer fiel) y aun asi estaba funcionalmente muerta en chat, porque el error de redondeo a 4 bits enterraba los logits de los tokens de control. No es un resultado del modelo actual, sino la justificacion del gate de generacion aplicado a esta build.

## Requisitos de hardware

- GPU obligatoria: Blackwell o superior, compute capability >= 10.0. NVFP4 es W4A4 (activaciones tambien en 4 bits) y Hopper (sm 9.0) no tiene kernel capaz de ejecutarlo; este checkpoint no funciona en H100 ni H200.
- Memoria: el repositorio ocupa 69,2 GB, por lo que la carga completa de pesos requiere un orden de magnitud similar de memoria de GPU, repartida entre dispositivos si es necesario.
- Construccion y calibracion: se realizo sobre 2xB300 SXM6, con un pico de ~363 GB de memoria anonima durante la linealizacion de expertos. Una maquina con menos de 376 GB no completa el proceso.
- GPU de consumo: no disponible. Las GPU de consumo actuales no cumplen el requisito de compute capability >= 10.0, por lo que no se puede confirmar su viabilidad.
- Despliegue recomendado: vLLM, con la clase `Glm4MoeMTPModel`. Ejemplo oficial:

```bash
vllm serve <repo> \
  --max-model-len 65536 \
  --gpu-memory-utilization 0.92 \
  --kv-cache-dtype fp8 \
  --speculative-config '{"method":"mtp","num_speculative_tokens":1}'
```

- Ajuste critico de memoria: usar `--gpu-memory-utilization 0.92`, no 0.97. Con 0.97 el servicio arranca correctamente y despues entra en bucle de caidas bajo carga real, sin que el problema sea visible en el arranque.
- Compatibilidad de librerias: transformers (carga basica), vLLM (servicio), llm-compressor y compressed-tensors (formato de los pesos). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada, mas alla de la afirmacion cualitativa de que la decodificacion especulativa aporta ganancia en hardware limitado por ancho de banda.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Hardware requerido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flukethoughts/GLM-4.5-Architect-106B-A12B-NVFP4 | 60,66 B (safetensors) | NVFP4 W4A4 + BF16 en modulos sensibles | Blackwell (sm >= 10.0) | MIT | HuggingFace |
| ConicCat/GLM-4.5-Architect-106B-A12B | no disponible en la informacion | BF16 (sin cuantizar) | Ampere/Hopper/Blackwell | no disponible en la informacion | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el modelo base del que deriva, que es la referencia natural para medir la perdida de calidad introducida por la cuantizacion. La model card no menciona ningun otro modelo comparable ni ofrece datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Requisito de hardware muy restrictivo: sin GPU Blackwell (compute capability >= 10.0) el modelo no se puede ejecutar en absoluto. Esto excluye H100, H200 y toda la generacion anterior.
- Riesgo de fallo silencioso en cuantizacion: el propio autor documenta un caso previo en el que una build NVFP4 paso todas las comprobaciones estaticas (coseno de pesos 0.997) y aun asi fallaba en todas las peticiones de chat. El coseno de pesos no detecta este tipo de error.
- Los logits de tokens de control son entre 5 y 10 veces menores en magnitud que los de tokens normales, por lo que una cuantizacion ingenua del `lm_head` inutiliza las plantillas de chat. En esta build se mitiga manteniendo `lm_head` en BF16.
- Los routers MoE se mantienen en BF16 porque el ruido de 4 bits no solo altera la magnitud de la activacion, sino que cambia que expertos se activan.
- `transformers` descarta los 404 tensores de la cabeza MTP al cargar con `from_pretrained()`, ya que `Glm4MoeForCausalLM` no tiene modulo para la capa 46. Esto se ha corregido en este checkpoint, pero implica que cargarlo con transformers en lugar de vLLM pierde la funcionalidad de decodificacion especulativa.
- Ajuste de memoria fragil: `--gpu-memory-utilization 0.97` provoca caidas en bucle bajo carga real sin sintomas en el arranque.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Idiomas soportados y limitaciones de contexto por idioma: no disponible en la informacion proporcionada.
- Licencia del modelo base: no disponible. Este checkpoint declara MIT, pero la licencia del modelo original no se especifica en la informacion proporcionada, lo que conviene verificar antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Calibracion sesgada a roleplay (70% del dataset de calibracion): el rendimiento en dominios tecnicos o de codigo puede degradarse mas que en conversacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flukethoughts/GLM-4.5-Architect-106B-A12B-NVFP4
- Modelo base: https://huggingface.co/ConicCat/GLM-4.5-Architect-106B-A12B
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- No se han encontrado otros enlaces relevantes en la busqueda web: los resultados devueltos corresponden a paginas de webmail y servicios de un operador de telecomunicaciones, sin relacion con el modelo.
