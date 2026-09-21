# idle-intelligence/t0-beta-q8_0-webgpu

## Resumen

t0-beta Q8_0 WebGPU es una versión cuantizada del modelo de previsión de series temporales t0-beta, desarrollado originalmente por The Forecasting Company y portado de forma independiente por idle-intelligence para su ejecución íntegra en el navegador. Se trata de un transformer de parches de aproximadamente 256 millones de parámetros (255.614.293 exactos) que produce previsiones probabilísticas multihorizonte mediante 21 niveles de cuantiles, sin necesidad de servidor: los pesos se descargan una vez y se ejecutan en el cliente mediante un motor Rust/WASM sobre WebGPU construido con Burn.

La relevancia del artefacto no está en el modelo base, sino en el empaquetado: convierte un checkpoint de previsión en un fichero GGUF de 275,3 MB con cuantización Q8_0 que cabe en el almacenamiento y la memoria de un navegador de escritorio, manteniendo una fidelidad numérica mejor que la tarjeta INT8 publicada oficialmente (deriva media peor de 0,20 % frente a 0,23 %, y deriva puntual peor de 1,06 % frente a 9,39 % respecto a la referencia F32).

El pipeline es específico: no se trata de un modelo de lenguaje y no acepta instrucciones ni texto. Consume ventanas de series temporales (512 puntos en el ejemplo de uso), las trocea en parches de 32 puntos (vectores de 96 elementos), las procesa con 24 bloques transformer con atención temporal y de grupo y un embedding de 1024, y decodifica 32 pasos con 21 niveles de cuantiles, con rollout autoregresivo para horizontes mayores. Requiere Chrome 113+ o Edge 113+ con WebGPU y HTTPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Patch transformer con atención temporal y de grupo; 24 bloques, embedding de 1024, parches de 32 puntos (vector de 96) |
| Parametros totales | 255.614.293 (~256 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No publicada de forma explícita; el ejemplo de uso alimenta los últimos 512 puntos de la serie y las medidas de latencia se toman con contexto 512 |
| Tipos de cuantizacion | GGUF Q8_0 (bloques de 32 valores con escala fp16); capas `attention.wQKV`, `attention.wO`, `mlp.0` y `mlp.2` cuantizadas; normas, embeddings, sesgos y cabeza de cuantiles en f16 |
| Idiomas soportados | No disponible (modelo de series temporales, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`t0-beta-q8_0.gguf`, 275,3 MB) mas `config.json` |
| Niveles de cuantiles | 21 |
| Horizonte de decodificacion | 32 pasos por pasada; rollout autoregresivo para horizontes mayores |
| Modelo base | theforecastingcompany/t0-beta |

## Arquitectura y entrenamiento

La arquitectura es un transformer de parches para series temporales con dos mecanismos de atención diferenciados, atención temporal y atención de grupo, repartidos en 24 bloques con dimensión de embedding 1024. La serie de entrada se divide en parches de 32 puntos, cada uno representado por un vector de 96 elementos, y la salida pasa por un decodificador de cuantiles de 32 pasos que emite 21 niveles de cuantiles por paso, lo que permite construir intervalos de predicción además de la predicción puntual. Los horizontes superiores a 32 pasos se cubren con rollout autoregresivo, realimentando las predicciones como contexto.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens o series utilizadas, ni sobre si hubo etapas de ajuste por refuerzo o preferencias; estos datos no aparecen en la información proporcionada. Lo que sí se documenta es el proceso de cuantización de este port: cuantización solo de pesos con bloques GGUF Q8_0 estándar en disposición compatible con ggml, des_cuantizados en la GPU dentro del matmul WGSL con cómputo en F32. Los pesos se exportan desde los safetensors F32 mediante el empaquetador propio de t0-web, y la ruta F32 reproduce la referencia de PyTorch con un error máximo absoluto de 3,2e-6.

## Capacidades

- Previsión de series temporales univariadas y probabilística, con 21 niveles de cuantiles por paso de predicción.
- Previsión multihorizonte: 32 pasos directos y horizontes mayores mediante rollout autoregresivo.
- Inferencia completamente en cliente, dentro del navegador, sin llamadas a servidor.
- Ejecución acelerada por WebGPU (WASM + WebGPU) mediante el motor t0-web escrito en Rust con Burn.
- Procesamiento por lotes: el motor soporta ejecución por lotes (se reportan medidas con batch de 24 señales).
- Carga y caché de los pesos desde el navegador, con descarga única de ~275 MB.
- No soporta generación de texto, código, matemáticas simbólicas, visión, audio ni razonamiento multi-paso.
- No soporta tool calling ni function calling.
- No está orientado a uso agéntico.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Previsión de demanda en aplicaciones web de retail: el modelo recibe la serie histórica de ventas de un producto (hasta 512 puntos de contexto) y devuelve 32 pasos de predicción con intervalos al 21 niveles de cuantiles, todo en el navegador del usuario, sin exponer los datos a un backend.
- Cuadros de mando analíticos embebidos: una web corporativa puede ofrecer gráficos de previsión interactivos donde el usuario cambia el producto o la métrica y el modelo recalcula en el cliente, con una descarga inicial de 275 MB cacheada a partir de la primera visita.
- Planificación de capacidad con intervalos de confianza: gracias a los 21 niveles de cuantiles, es posible derivar escenarios pesimista, central y optimista para planificación de stock, personal o energía, en lugar de una única predicción puntual.
- Previsión de carteras de señales por lotes: la ejecución en batch (54,6 ms por señal con lote de 24 en Metal nativo) es adecuada para prever simultáneamente decenas o cientos de series cortas en herramientas de análisis internas.
- Predicción de KPI en paneles financieros o de operaciones: el rollout autoregresivo permite extender el horizonte más allá de los 32 pasos para planificación trimestral, a cambio de asumir la acumulación de error propia de la realimentación de predicciones.
- Aplicaciones con requisitos de privacidad o de cumplimiento: al ejecutarse íntegramente en el cliente, la serie temporal nunca sale del dispositivo, lo que simplifica el tratamiento de datos sensibles en entornos regulados.
- Kioscos, terminales y aplicaciones de escritorio empaquetadas con motor Chromium: cualquier entorno con Chrome 113+ o Edge 113+ y WebGPU puede ejecutar el modelo sin instalación adicional ni GPU dedicada de gama alta.
- Simulación de escenarios what-if: al ser probabilístico y rápido en lotes pequeños, permite repetir la previsión ante distintas ventanas de contexto para comparar escenarios sin coste de servidor.

## Benchmarks y rendimiento

Deriva de cuantización frente a la referencia F32 propia y frente a la tarjeta INT8 publicada oficialmente:

| Variante | Deriva media peor (%) | Deriva puntual peor (%) |
|---|---|---|
| Este Q8_0 | 0,20 | 1,06 |
| Tarjeta INT8 oficial publicada de t0-beta | 0,23 | 9,39 |

GIFT-Eval, subconjunto de 8 configuraciones con protocolo oficial (des_cuantizado a f32 dentro de la arquitectura de referencia):

| Metrica | f32 (pesos originales) | Este Q8_0 |
|---|---|---|
| CRPS (agregado, 8 configuraciones) | 0,0749 | 0,0749 |
| MASE (agregado, 8 configuraciones) | 1,0522 | 1,0519 |

Latencia medida con `t0-fast` sobre `wgpu`/Apple Metal nativo, contexto 512 y horizonte 32:

| Variante | Individual (ms/señal) | Lote de 24 (ms/señal) |
|---|---|---|
| Este Q8_0 | 219,3 | 54,6 |

Advertencias sobre estas cifras, tal como las indica el autor: el subconjunto de 8 configuraciones no es comparable con las cifras publicadas de 97 configuraciones (CRPS 0,4738 / MASE 0,6865), y no existe una ejecución completa de 97 configuraciones para este checkpoint. Las latencias son exclusivamente de Metal nativo; no existe ninguna medición en navegador para t0-beta.

## Requisitos de hardware

- Tamano de pesos: 275,3 MB en el fichero GGUF Q8_0; el repositorio completo ocupa 0,3 GB.
- Descarga: aproximadamente 275 MB en la primera carga, cacheada por el navegador en visitas posteriores.
- VRAM: no se publica una cifra de consumo total. Los pesos en Q8_0 ocupan 275,3 MB y el cómputo se realiza en F32 tras des_cuantizar en la GPU, por lo que el modelo cabe en GPUs de gama de entrada, integradas o dedicadas, siempre que soporten WebGPU.
- GPU recomendadas: no disponibles. El requisito real es soporte de WebGPU en el navegador (Chrome 113+ o Edge 113+), no una GPU concreta.
- Cabe en GPU de consumo: sí, por tamaño de pesos, en cualquier GPU con WebGPU operativo; no hay medidas de latencia publicadas en navegador ni en hardware de consumo.
- Navegador y protocolo: Chrome 113+ o Edge 113+, con WebGPU habilitado y conexión HTTPS obligatoria.
- Opciones de despliegue: motor t0-web (Rust/WASM + WebGPU, construido con Burn) consumido desde JavaScript mediante `t0wasm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 219,3 ms por señal en ejecución individual y 54,6 ms por señal con lote de 24, medidas únicamente sobre Metal nativo con contexto 512 y horizonte 32.
- No existe medición de latencia en navegador ni de throughput agregado para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de previsión de series temporales en la información proporcionada, por lo que la comparación se limita a las tres variantes del mismo checkpoint documentadas por el autor.

| Variante | Formato | Deriva media peor (%) | Deriva puntual peor (%) | CRPS (8 config.) | MASE (8 config.) |
|---|---|---|---|---|---|
| Este t0-beta Q8_0 WebGPU | GGUF Q8_0, 275,3 MB | 0,20 | 1,06 | 0,0749 | 1,0519 |
| t0-beta INT8 oficial | INT8 (tarjeta oficial) | 0,23 | 9,39 | No disponible | No disponible |
| t0-beta F32 (referencia) | safetensors F32 | Referencia | Referencia | 0,0749 | 1,0522 |

La ventaja de esta variante frente a la tarjeta INT8 oficial es doble: mejor deriva media y una deriva puntual mucho más contenida, con un coste de 275,3 MB que la hace desplegable en navegador. Comparado con la referencia F32, la diferencia en GIFT-Eval (8 configuraciones) está dentro del 0,4 % relativo. No se dispone de comparaciones con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Deriva de cuantización: la salida puede diferir ligeramente de la implementación original en PyTorch; el peor caso documentado es 1,06 % de deriva puntual y 0,20 % de deriva media frente a F32.
- Port independiente: no está afiliado ni respaldado por The Forecasting Company, según declara el propio autor.
- Dependencia del motor t0-web: los pesos están pensados para consumirse con `t0wasm`; no hay ruta documentada para llama.cpp, vLLM, Ollama u otros servidores de inferencia.
- Requisito de WebGPU: no funciona en navegadores sin WebGPU ni en entornos sin HTTPS.
- Coste de primera carga: 275 MB de descarga antes de poder inferir.
- Contexto y horizonte: el ejemplo de uso trabaja con 512 puntos de contexto; los horizontes superiores a 32 pasos dependen de rollout autoregresivo, que acumula error a medida que crece el horizonte.
- Alcance funcional muy acotado: es un modelo de previsión de series temporales, sin generación de texto, código, visión, audio, tool calling, agentes ni capacidades multilingües.
- Evidencia de benchmarks parcial: el resultado de GIFT-Eval se limita a 8 configuraciones y no es comparable con las cifras publicadas de 97 configuraciones; no existe ejecución completa para este checkpoint.
- Latencia no validada en navegador: las cifras de 219,3 ms y 54,6 ms provienen de Metal nativo y no deben interpretarse como rendimiento en el navegador.
- Sin información sobre el entrenamiento del modelo base: se desconocen composición del dataset, número de series o tokens, y posibles sesgos de dominio de los datos de entrenamiento.
- Naturaleza beta: el propio nombre del checkpoint base (t0-beta) indica que no es una versión estable.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, con creación y última actualización el 2026-09-20.
- Licencia: Apache-2.0, que permite uso comercial, pero obliga a conservar avisos de copyright y licencia y a declarar los cambios realizados.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/idle-intelligence/t0-beta-q8_0-webgpu
- Modelo base: https://huggingface.co/theforecastingcompany/t0-beta
- Demo en navegador: https://idle-intelligence.github.io/t0-web/web/
- Motor t0-web (Rust/WASM + WebGPU): https://github.com/idle-intelligence/t0-web
- Burn (framework de inferencia en Rust): https://burn.dev
- The Forecasting Company: https://theforecastingcompany.com/
- Cita del modelo base: The Forecasting Company, "t0: A time-series forecasting foundation model", 2026, https://huggingface.co/theforecastingcompany/t0-beta
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo; las búsquedas devolvieron únicamente documentación del entorno de desarrollo IDLE de Python, sin relación con el modelo.
