# idle-intelligence/t0-alpha-q4_0-webgpu

## Resumen

t0-alpha-q4_0-webgpu es una version cuantizada en Q4_0 del modelo de series temporales t0-alpha, desarrollado originalmente por The Forecasting Company y portado de forma independiente por idle-intelligence para su ejecucion integra en el navegador mediante WebAssembly y WebGPU. Se trata de un transformer de parches ("patch transformer") de unos 101,6 millones de parametros que realiza prevision probabilistica multihorizonte: en lugar de devolver un unico valor, emite cinco niveles de cuantiles (0,1, 0,25, 0,5, 0,75 y 0,9) para cada paso futuro, lo que permite construir intervalos de incertidumbre sin necesidad de metodos Monte Carlo externos.

La relevancia de esta ficha concreta no esta en la arquitectura, heredada del modelo base, sino en el empaquetado: el fichero GGUF pesa 58,6 MB (0,14 veces los pesos F32 y aproximadamente la mitad de la variante Q8_0 del mismo release) y se consume desde un motor Rust/WASM + WebGPU llamado t0-web, construido con Burn. Esto desplaza la inferencia al dispositivo del usuario, elimina el coste de servidor y permite mantener los datos de la serie temporal dentro del cliente, algo critico en dominios financieros, industriales o sanitarios.

El coste de esa compresion es medible: en el protocolo completo GIFT-Eval (97 configuraciones, normalizado frente a Seasonal Naive) el modelo obtiene 0,7334 de MASE y 0,4973 de CRPS, lo que supone un incremento del 1,1 % en MASE y del 0,6 % en CRPS respecto al control F32 del propio autor, y queda dentro del 1,3 % de la tarjeta publicada de t0-alpha. La latencia de una sola llamada en un Apple M2 es de 29,8 ms en caliente, mas del doble de rapida que la exportacion oficial a ONNX WebGPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Patch transformer con atencion temporal y de grupo ("time and group attention"), 24 bloques transformer, embedding de 512 |
| Parametros totales | 101.641.541 (~101,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 (ventana empleada en la demo y en las pruebas de latencia; la model card no declara un maximo distinto) |
| Tipos de cuantizacion | Q4_0 (bloques GGUF de 32 valores con escala fp16) sobre `attention.wQKV.weight`, `attention.wO.weight`, `mlp.0.weight` y `mlp.2.weight` de cada capa; norms, embeddings, biases y cabeza de cuantiles en f16. El calculo se hace en F32 tras dequantizar en GPU |
| Idiomas soportados | no disponible; no es un modelo de lenguaje natural, consume series temporales numericas |
| Licencia | Apache-2.0 (la misma que el modelo base) |
| Formato de pesos | GGUF (`t0-alpha-q4_0.gguf`, 58,6 MB) mas `config.json`; exportado desde los safetensors F32 originales |
| Tamano del repositorio | 0,1 GB |
| Niveles de cuantiles | 5 (0,1, 0,25, 0,5, 0,75, 0,9) |
| Decodificador | Decodificador de cuantiles de 32 pasos, con rollout autorregresivo para horizontes mas largos |
| Pipeline declarado | time-series-forecasting |
| Modelo base | theforecastingcompany/t0-alpha |
| Desarrollador del port | idle-intelligence (ilnmtlbnm@idle-intelligence), no afiliado a The Forecasting Company |

## Arquitectura y entrenamiento

La arquitectura es un transformer de parches: la serie de entrada se divide en parches de 32 puntos que se proyectan a vectores de 96 dimensiones, y esos vectores atraviesan 24 bloques transformer con embedding de 512. El bloque de atencion combina atencion temporal (a lo largo del eje de tiempo) y atencion de grupo (entre series o grupos de series), lo que permite modelar conjuntamente varias series relacionadas. La salida pasa por un decodificador de cuantiles de 32 pasos que produce los cinco niveles de cuantiles por paso, y para horizontes mas largos se aplica un rollout autorregresivo realimentando las predicciones. El motor t0-web ejecuta los bloques en WebGPU con fallback a WASM, dequantizando los bloques Q4_0 dentro del matmul en WGSL con computo F32.

Sobre el entrenamiento no hay informacion en la documentacion disponible: no se detallan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO (poco habituales en modelos de prevision). El unico dato de fidelidad numerica aportado es que la ruta F32 del port coincide con la referencia en PyTorch con un error maximo absoluto de 1,2e-6. La innovacion tecnica destacable de esta ficha es el empaquetado: cuantizacion solo de pesos en bloques GGUF Q4_0 compatibles con el layout de ggml, dequantizacion en GPU dentro del propio kernel de multiplicacion de matrices y cabecera de cuantiles preservada en f16 para no degradar la calibracion de los intervalos.

## Capacidades

- Prevision probabilistica multihorizonte de series temporales: devuelve cinco cuantiles por paso, lo que permite construir bandas de prediccion e intervalos de credibilidad sin postproceso adicional.
- Prevision de un solo paso y de horizonte largo: el decodificador cubre 32 pasos y el rollout autorregresivo extiende el horizonte mas alla.
- Modelado conjunto de multiples series mediante la atencion de grupo.
- Inferencia en el cliente: ejecucion completa en navegador con WebGPU y WASM, sin servidor ni llamadas a API.
- Funcionamiento con la ventana de contexto de 512 puntos que usa la implementacion de referencia.
- Modelo de base ("foundation model") de series temporales: el uso previsto es la evaluacion zero-shot sobre dominios no vistos, segun el protocolo GIFT-Eval.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso textual ni generacion de codigo.
- No tiene capacidades de vision, audio ni modo de pensamiento.
- No hay capacidades multilingues: la entrada y la salida son valores numericos.

## Casos de uso

- Prevision de demanda en retail dentro de un panel web: el modelo puede generar bandas de demanda a partir de las ultimas 512 observaciones directamente en el navegador del analista, sin subir el historico de ventas a un backend.
- Analitica financiera con requisitos de privacidad: al ejecutarse en el cliente, la serie de precios o de flujos no abandona el dispositivo, lo que facilita el cumplimiento en entornos con datos sensibles.
- Monitorizacion de sensores IoT: un dashboard que reciba telemetria puede calcular predicciones de corto plazo y comparar el valor observado con el cuantil 0,9 para detectar desviaciones anomales, todo en local.
- Planificacion de capacidad en energia o infraestructura cloud: la prediccion por cuantiles permite dimensionar recursos contra un escenario pesimista (cuantil 0,75 o 0,9) en lugar de contra una media puntual.
- Aplicaciones web offline o de bajo coste: con 58,6 MB de descarga inicial cacheada por el navegador, encaja en productos donde no se quiere mantener infraestructura de inferencia.
- Prototipado y demos interactivas: la demo oficial en GitHub Pages permite evaluar el comportamiento del modelo sobre series propias antes de comprometer un despliegue.
- Generacion de previsiones en herramientas de hoja de calculo o BI embebidas: la API de t0-web acepta un array de contexto y un horizonte (`model.forecast(context, 32)`), lo que simplifica su integracion en componentes front-end.
- Previson de series sinteticas y pruebas de regresion: los 54 casos sinteticos del propio autor sirven como base para medir la deriva introducida por la cuantizacion en un pipeline concreto.

## Benchmarks y rendimiento

GIFT-Eval completo (97 configuraciones, normalizado frente a Seasonal Naive). Datos declarados por el autor del modelo:

| Variante | MASE | CRPS |
|---|---|---|
| Tarjeta publicada de t0-alpha (F32) | 0,7240 | 0,4941 |
| Control F32 del propio port | 0,7255 | 0,4942 |
| Esta Q4_0 | 0,7334 | 0,4973 |

Aislando el efecto de la cuantizacion (Q4_0 frente al control F32 del autor): +1,1 % de MASE y +0,6 % de CRPS, con un fichero 0,14 veces mas pequeno que el F32.

Deriva frente a la referencia F32 propia (54 casos sinteticos):

| Cuantizacion | Deriva media, peor caso (%) | Deriva puntual, peor caso (%) |
|---|---|---|
| Esta Q4_0 | 3,11 | 8,42 |
| Exportacion INT8 original (reimplementada en este port) | 0,53 | 1,78 |

Latencia en navegador (Chrome, Chromium headless, Apple M2, senal unica, contexto 512):

| Implementacion | Latencia en caliente (ms) | Lote de 24 (ms/senal) |
|---|---|---|
| Exportacion oficial ONNX WebGPU | 64,0 | 8,87 |
| Este fichero (WebGPU con pesos Q4_0 residentes) | 29,8 | 11,2 |

La llamada individual es mas del doble de rapida que la exportacion ONNX, mientras que el rendimiento por lotes es peor (11,2 frente a 8,87 ms/senal); el autor indica que el procesamiento por lotes todavia no se ha optimizado al nivel de la mejora en llamada unica.

## Requisitos de hardware

- No requiere GPU de servidor: el modelo esta disenado para ejecutarse en el navegador del usuario mediante WebGPU.
- Navegador: Chrome 113 o superior, o Edge 113 o superior. WebGPU es obligatorio, por lo que Safari y Firefox no estan soportados segun la documentacion disponible.
- Contexto seguro: HTTPS es un requisito de WebGPU.
- Descarga inicial de aproximadamente 59 MB, cacheada por el navegador tras la primera carga.
- Memoria de GPU necesaria: no declarada de forma explicita; el fichero de pesos ocupa 58,6 MB y la dequantizacion se realiza en F32 durante el matmul, por lo que el consumo total se mantiene previsiblemente por debajo de 1 GB incluyendo activaciones para contexto 512 (estimacion a partir del tamano del fichero, no dato oficial).
- Encaja en cualquier equipo con GPU integrada o discreta que exponga WebGPU; la medicion de referencia se hizo en un Apple M2.
- Latencia medida: 29,8 ms en caliente para una senal unica con contexto 512; 11,2 ms por senal en lotes de 24.
- Opciones de despliegue documentadas: motor t0-web (Rust/WASM + WebGPU, construido con Burn) y consumo del GGUF desde JavaScript mediante `t0wasm.T0Wasm.load`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Throughput en servidor: no disponible (no es el escenario previsto).

## Comparativa con modelos similares

No se han documentado en la informacion disponible modelos de terceros comparables. La comparacion factible es entre las variantes del mismo release y el modelo base:

| Variante | Parametros | Contexto | MASE (GIFT-Eval) | CRPS | Tamano de pesos | Latencia (M2, senal unica) |
|---|---|---|---|---|---|---|
| t0-alpha original (F32, PyTorch) | ~101,6 M | no disponible | 0,7240 | 0,4941 | no disponible (F32) | no disponible en navegador |
| t0-alpha Q4_0 WebGPU (esta ficha) | ~101,6 M | 512 | 0,7334 | 0,4973 | 58,6 MB | 29,8 ms |
| t0-alpha Q8_0 (mismo release) | ~101,6 M | 512 | no disponible | no disponible | ~2x el Q4_0 (aprox. 117 MB) | no disponible |
| Exportacion oficial ONNX WebGPU | ~101,6 M | 512 | no disponible | no disponible | no disponible | 64,0 ms (8,87 ms/senal en lote de 24) |

La variante Q8_0 se menciona en la model card como la opcion recomendada cuando la precision importa mas que el tamano de descarga; no se publican sus metricas de GIFT-Eval en la informacion disponible.

## Limitaciones y advertencias

- Deriva por cuantizacion: en los 54 casos sinteticos del autor, la deriva puntual en el peor caso llega al 8,42 % y la deriva media al 3,11 %, muy por encima de la exportacion INT8 (1,78 % y 0,53 %). En dominios donde los valores absolutos importan, conviene usar Q8_0.
- Perdida de precision agregada: +1,1 % de MASE y +0,6 % de CRPS frente al control F32 del propio autor en el protocolo completo de 97 configuraciones.
- Las metricas declaradas en la model card no estan verificadas (`verified: false`), son resultados del propio autor y no de un tercero independiente.
- Rendimiento por lotes peor que la alternativa ONNX (11,2 frente a 8,87 ms/senal): en escenarios de alto volumen por senal, esta cuantizacion puede no ser la opcion optima.
- Ventana de contexto de 512 puntos en la implementacion de referencia; no se documenta comportamiento con series mas largas ni estrategias de ventana deslizante.
- Dependencia estricta de WebGPU: sin soporte en navegadores que no la expongan, lo que excluye Safari y Firefox segun la documentacion del release.
- Repositorio sin senales de validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, con una unica fecha de publicacion.
- Es un port independiente, no afiliado ni respaldado por The Forecasting Company; los valores de prevision pueden diferir ligeramente de la implementacion original en PyTorch.
- No hay informacion sobre los datos de entrenamiento del modelo base, por lo que no se pueden evaluar sesgos de dominio ni cobertura del espacio de series.
- Licencia Apache-2.0, que permite uso comercial y modificacion, con la obligacion habitual de conservar avisos de licencia y atribucion al modelo base.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento textual.
- Los resultados de busqueda web disponibles no aportaron documentacion adicional sobre el modelo; toda la informacion procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/idle-intelligence/t0-alpha-q4_0-webgpu
- Modelo base t0-alpha (The Forecasting Company): https://huggingface.co/theforecastingcompany/t0-alpha
- Demo en navegador: https://idle-intelligence.github.io/t0-web/web/
- Repositorio del motor t0-web (Rust/WASM + WebGPU): https://github.com/idle-intelligence/t0-web
- Framework Burn: https://burn.dev
- Sitio de The Forecasting Company: https://theforecastingcompany.com/
- Dataset GIFT-Eval (Salesforce): https://huggingface.co/datasets/Salesforce/GiftEval
- Cita del modelo base (BibTeX, recogida en la model card): `@misc{tfc-t0, title = {t0: A time-series forecasting foundation model}, author = {The Forecasting Company}, year = {2026}, url = {https://huggingface.co/theforecastingcompany/t0-alpha}}`
