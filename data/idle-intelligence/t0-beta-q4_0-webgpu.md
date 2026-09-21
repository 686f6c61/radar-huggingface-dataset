# idle-intelligence/t0-beta-q4_0-webgpu

## Resumen

t0-beta-q4_0-webgpu es una version cuantizada a Q4_0 del modelo de forecasting de series temporales theforecastingcompany/t0-beta, empaquetada por idle-intelligence para ejecucion integra en el navegador mediante WASM y WebGPU. Se trata de un transformer de parches de aproximadamente 256 millones de parametros (255.614.293 exactos), con 24 bloques, dimension de embedding 1024 y una cabeza de decodificacion de cuantiles que produce 21 niveles de cuantiles sobre un horizonte de 32 pasos, ampliable mediante rollout autoregresivo.

El problema que resuelve es la prediccion probabilistica multi-horizonte de series temporales sin necesidad de infraestructura de servidor: los pesos se descargan una vez (149,5 MB), el navegador los cachea y la inferencia se ejecuta en la GPU del cliente a traves de WebGPU. Esto habilita escenarios de analitica y previsualizacion de forecasting donde los datos de la serie nunca salen del dispositivo del usuario.

Su relevancia es doble. Por un lado, demuestra un pipeline de cuantizacion GGUF Q4_0 con dequantizacion en GPU dentro del matmul WGSL y computo en F32, exportado por el packer propio de t0-web. Por otro, el propio autor advierte de que este nivel de cuantizacion no es apto para produccion: la deriva de punto en el peor caso es del 14,58 % frente a la referencia F32, peor que la tarjeta INT8 oficial (9,39 %) y que el Q4_0 de t0-alpha (8,4 %), y recomienda Q8_0 salvo que el tamano del fichero sea la restriccion critica. El repositorio no tiene descargas ni likes registrados y es un port independiente no afiliado a The Forecasting Company.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de parches (patch transformer) con atencion temporal y atencion de grupo; 24 bloques, embed_dim 1024 |
| Parametros totales | 255.614.293 (~256 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 (segun el ejemplo de uso de la model card y la configuracion de la medicion de latencia) |
| Tipos de cuantizacion | Q4_0 con bloques GGUF de 32 valores y escala fp16 en attention.wQKV.weight, attention.wO.weight, mlp.0.weight y mlp.2.weight de cada capa; normas, embeddings, sesgos y cabeza de cuantiles en f16. Existe tambien una variante Q8_0 de este mismo checkpoint |
| Idiomas soportados | no disponible (modelo no linguistico; la entrada es una serie temporal numerica) |
| Licencia | Apache-2.0 (la misma que el modelo original) |
| Formato de pesos | GGUF (t0-beta-q4_0.gguf, 149,5 MB) mas config.json (<1 KB) |
| Niveles de cuantiles | 21 |
| Horizonte de decodificacion | 32 pasos nativos, ampliable por rollout autoregresivo |
| Modelo base | theforecastingcompany/t0-beta |
| Pipeline | time-series-forecasting |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de parches disenado especificamente para series temporales, no un transformer de lenguaje adaptado. La serie de entrada se trocea en parches de 32 valores que se proyectan a vectores de 96 elementos; esos vectores atraviesan 24 bloques transformer con atencion temporal y atencion de grupo y una dimension de embedding de 1024. La salida pasa por un decodificador de cuantiles de 32 pasos que emite 21 niveles de cuantiles, lo que permite obtener intervalos de prediccion y no solo una estimacion puntual. Para horizontes superiores a 32 pasos se aplica un rollout autoregresivo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el regimen de ajuste (RLHF, DPO u otro) ni el esquema de atencion de grupo en detalle: esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica relevante esta en el empaquetado, no en el entrenamiento. La cuantizacion es solo de pesos, usando bloques GGUF Q4_0 estandar en un layout compatible con ggml, y la dequantizacion se realiza en la propia GPU dentro del matmul escrito en WGSL, con computo en F32. Los pesos se exportan desde los safetensors F32 originales mediante el packer de t0-web, y la ruta F32 reproduce la referencia de PyTorch con un error maximo absoluto de 3,2e-6, lo que da una cota de fidelidad del proceso de exportacion antes de aplicar la cuantizacion. El consumo de los pesos corre a cargo de t0-web, un motor de forecasting en Rust compilado a WASM y WebGPU construido con Burn.

## Capacidades

- Forecasting probabilistico multi-horizonte de series temporales: devuelve 21 niveles de cuantiles por paso, lo que permite construir intervalos de prediccion ademas del valor central.
- Prediccion a 32 pasos nativos y horizontes mayores mediante rollout autoregresivo sobre las propias predicciones.
- Inferencia completamente local en el navegador mediante WASM y WebGPU, sin servidor ni llamadas de red despues de la primera descarga de pesos.
- Cacheo de los pesos por parte del navegador tras la carga inicial de aproximadamente 150 MB.
- Ejecucion por lotes: la medicion de latencia incluye un modo batch-24 que reduce el coste por senal de 145,3 ms a 54,5 ms.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No genera texto, no procesa vision ni audio y no tiene capacidades multilingues.
- El alcance exacto en cuanto a series univariantes frente a multivariantes no se detalla en la model card; la presencia de atencion de grupo apunta a un tratamiento conjunto de conjuntos de series relacionadas, pero no se especifica en la informacion disponible.

## Casos de uso

- Analitica embebida en el navegador: una herramienta de BI puede cargar el GGUF una vez y proyectar la tendencia de una metrica directamente en el cliente, sin enviar la serie a un backend, lo que simplifica el cumplimiento de requisitos de privacidad.
- Previsualizacion de forecasting en paneles de producto: para graficos de demanda, trafico o ingresos donde el usuario necesita una proyeccion inmediata mientras manipula filtros, el coste de 145,3 ms por senal en modo individual y 54,5 ms en batch-24 es compatible con una interfaz interactiva.
- Planificacion de capacidad en hojas de calculo o cuadros de mando web: el modelo permite estimar intervalos de ocupacion, stock o consumo energetico con sus cuantiles, de modo que el usuario vea un rango y no solo un numero.
- Aplicaciones de campo sin conectividad estable: al ejecutarse integramente en el dispositivo una vez descargados y cacheados los pesos, el forecasting sigue funcionando en escenarios con red intermitente, algo habitual en inspeccion de planta o logistica.
- Mantenimiento predictivo en dashboards de operaciones: la lectura de sensores se puede proyectar en el navegador para detectar derivas antes de que se conviertan en fallos, siempre que se acepte la perdida de precision de Q4_0 o se migre a Q8_0.
- Prototipado e investigacion de metodos de cuantizacion: el repositorio sirve como caso de estudio reproducible de un pipeline GGUF Q4_0 con dequantizacion dentro del matmul WGSL, util para comparar deriva numerica entre niveles de cuantizacion.
- Demos educativas de forecasting probabilistico: el ejemplo de la model card (contexto de 512 valores y horizonte de 32) se puede reproducir en una pagina web con unas pocas lineas de JavaScript, lo que facilita material docente sin infraestructura.

## Benchmarks y rendimiento

Deriva frente a la referencia F32 propia del autor y frente a la tarjeta INT8 oficial publicada de t0-beta:

| Cuantizacion | Deriva media, peor caso (%) | Deriva de punto, peor caso (%) |
|---|---|---|
| Este Q4_0 | 2,55 | 14,58 |
| Tarjeta INT8 oficial publicada de t0-beta | 0,23 | 9,39 |

GIFT-Eval, subconjunto de 8 configuraciones con protocolo oficial (decuantizado de vuelta a f32 en la arquitectura de referencia):

| Metrica | f32 (pesos originales) | Este Q4_0 |
|---|---|---|
| CRPS agregado, 8 configuraciones | 0,0749 | 0,0752 |
| MASE agregado, 8 configuraciones | 1,0522 | 1,0552 |

Los valores de referencia publicados para las 97 configuraciones completas de GIFT-Eval son CRPS 0,4738 y MASE 0,6865, pero no son comparables con el subconjunto de 8 configuraciones y no existe una ejecucion completa de 97 configuraciones para este checkpoint en ningun nivel de cuantizacion.

Latencia medida en Metal nativo (no en navegador), con contexto 512 y horizonte 32, usando t0-fast sobre wgpu:

| Cuantizacion | Modo individual (ms/senal) | Modo batch-24 (ms/senal) |
|---|---|---|
| Este Q4_0 | 145,3 | 54,5 |

No existe una medicion en Chromium sin interfaz grafica para t0-beta, por lo que estas cifras no deben interpretarse como latencia de navegador.

## Requisitos de hardware

- Tamano de pesos: 149,5 MB en disco para el fichero GGUF Q4_0. Estimacion de memoria en tiempo de ejecucion: entre 200 y 350 MB, sumando pesos, tensores f16 no cuantizados (normas, embeddings, sesgos y cabeza de cuantiles) y buffers de activacion; esta cifra es una estimacion derivada del tamano del fichero, no un dato publicado.
- Navegador: Chrome 113 o superior, o Edge 113 o superior. WebGPU es obligatorio. El uso requiere HTTPS. No se documenta soporte para Firefox ni Safari.
- GPU: no se especifica una GPU concreta. Las pruebas de latencia del autor se hicieron sobre Apple Metal; cualquier GPU integrada o dedicada con soporte WebGPU estable deberia poder ejecutar el modelo, dado el reducido tamano de pesos.
- Descarga inicial: aproximadamente 150 MB la primera vez; posteriormente los pesos quedan en la cache del navegador.
- Opciones de despliegue: el unico consumidor documentado es t0-web (Rust, WASM y WebGPU, construido con Burn). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; el layout es compatible con ggml, pero eso no implica que estos motores puedan ejecutar el modelo, ya que la cabeza de cuantiles y el pipeline de forecasting son especificos.
- Latencia y throughput: 145,3 ms por senal en modo individual y 54,5 ms por senal en batch-24, medidos en Metal nativo con contexto 512 y horizonte 32.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Deriva de punto, peor caso | Tamano de pesos | Licencia |
|---|---|---|---|---|---|
| t0-beta Q4_0 (este repositorio) | ~256 M | Q4_0 | 14,58 % | 149,5 MB | Apache-2.0 |
| t0-beta INT8 oficial | ~256 M | INT8 | 9,39 % | no disponible | Apache-2.0 |
| t0-beta F32 original | ~256 M | F32 | referencia | no disponible | Apache-2.0 |
| t0-alpha Q4_0 | no disponible | Q4_0 | 8,4 % | no disponible | no disponible |

La comparacion se limita a variantes del mismo linaje, porque la informacion proporcionada no incluye modelos comparables de otros autores. La model card atribuye la mayor deriva de t0-beta Q4_0 frente a t0-alpha Q4_0 al mayor ancho de embedding (1024 frente a 512): los bloques por canal de Q8_0 promedian el error sobre mas valores, pero la granularidad fija de 32 valores por bloque de Q4_0 no escala igual con esa anchura. El contexto declarado del original t0-beta y de t0-alpha no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Deriva de punto en el peor caso del 14,58 % frente a la referencia F32, superior a la de la tarjeta INT8 oficial (9,39 %) y a la del Q4_0 de t0-alpha (8,4 %). El propio autor indica que esta deriva es mas laxa de lo que deberia ser para uso en produccion y recomienda Q8_0 salvo que el tamano del fichero sea la restriccion determinante.
- No existe una ejecucion completa de las 97 configuraciones de GIFT-Eval para este checkpoint en ningun nivel de cuantizacion; los unicos datos disponibles son el subconjunto de 8 configuraciones y la tabla de deriva.
- Las cifras de latencia proceden de Metal nativo, no de un navegador, y no deben extrapolarse directamente a una aplicacion web.
- Requiere WebGPU, disponible en Chrome y Edge 113 o superior y bajo HTTPS. No se documenta funcionamiento en Firefox ni Safari.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones erroneas sin senal de incertidumbre suficiente, especialmente con la deriva acumulada del rollout autoregresivo en horizontes largos.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento de t0-beta, por lo que no se puede evaluar el sesgo hacia determinados dominios, frecuencias de muestreo o regimenes estacionales.
- Limitaciones de contexto e idioma: la ventana de contexto es de 512 valores y el modelo no procesa texto ni lenguaje natural, de modo que no hay soporte multilingue que evaluar.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero este repositorio es un port independiente no afiliado ni respaldado por The Forecasting Company, y los valores de forecast pueden diferir de la implementacion original en PyTorch por efecto de la cuantizacion.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de funcionamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/idle-intelligence/t0-beta-q4_0-webgpu
- Modelo base: https://huggingface.co/theforecastingcompany/t0-beta
- Demo en navegador: https://idle-intelligence.github.io/t0-web/web/
- Motor de forecasting t0-web: https://github.com/idle-intelligence/t0-web
- Framework Burn: https://burn.dev
- The Forecasting Company: https://theforecastingcompany.com/
- No se han encontrado enlaces relevantes adicionales en la busqueda web realizada; los resultados devueltos corresponden al entorno de desarrollo IDLE de Python 3.14 y no guardan relacion con este modelo.
