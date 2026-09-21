# idle-intelligence/t0-alpha-q8_0-webgpu

## Resumen

t0-alpha-q8_0-webgpu es una exportación cuantizada en formato Q8_0 del modelo fundacional de series temporales t0-alpha, desarrollado originalmente por The Forecasting Company y portado de forma independiente por idle-intelligence. Se trata de un transformer de parches de aproximadamente 101,6 millones de parámetros, especializado en forecasting probabilístico multivariante con horizonte múltiple, que produce cinco niveles de cuantil (0,1, 0,25, 0,5, 0,75 y 0,9) en lugar de una única predicción puntual.

La particularidad de este repositorio no es la arquitectura, sino el formato de despliegue: los pesos están empaquetados en GGUF con cuantización Q8_0 y se consumen desde el navegador mediante un motor en Rust compilado a WASM que ejecuta las matmuls en WebGPU a través del framework Burn. Esto permite hacer inferencia íntegramente en el cliente, sin servidor, con una descarga inicial de unos 109 MB que queda cacheada por el navegador.

Es relevante ahora porque demuestra que un modelo de forecasting de tamaño medio puede ejecutarse en hardware de consumo dentro de una pestaña del navegador con latencias de decenas de milisegundos, y porque su deriva de cuantización medida (0,20 % en el peor caso frente a F32) es inferior a la del export INT8 oficial (0,79 %) con un tamaño prácticamente idéntico. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de un artefacto reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Patch transformer con atencion temporal y de grupo (time and group attention), 24 bloques, embedding de 512 |
| Parametros totales | 101.641.541 (~101,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 puntos de serie en el ejemplo publicado; maximo no declarado explicitamente |
| Tipos de cuantizacion | Q8_0 (bloques GGUF de 32 valores con escala fp16); existe un export hermano en Q4_0 |
| Idiomas soportados | no aplica (modelo de series temporales, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`t0-alpha-q8_0.gguf`, 108,9 MB) mas `config.json` |
| Tarea (pipeline) | time-series-forecasting |
| Modelo base | theforecastingcompany/t0-alpha |
| Niveles de cuantil | 5 (0,1; 0,25; 0,5; 0,75; 0,9) |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un patch transformer. La serie de entrada se divide en parches de 32 pasos, cada uno representado por un vector de 96 dimensiones, que alimentan 24 bloques transformer con embedding de 512. La atención combina dos ejes: atención temporal sobre los parches y atención de grupo, lo que sugiere soporte para series agrupadas o paneles multivariantes, aunque la model card no detalla la semántica exacta de la atención de grupo ni el número de variables que admite simultáneamente. La salida pasa por un decodificador de cuantiles de 32 pasos que emite los cinco niveles de cuantil, y para horizontes más largos que la ventana de decodificación se realiza un rollout autorregresivo.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens o puntos de serie consumidos, la composición de los datos ni si se aplicaron etapas de ajuste por RLHF o DPO. Tampoco se documenta el proceso de preentrenamiento original más allá de la cita al modelo base. Lo que sí está documentado con precisión es el proceso de cuantización de este export: se trata de cuantización solo de pesos con bloques Q8_0 estándar (32 valores por bloque, escala fp16) en disposición compatible con ggml, aplicada únicamente a `attention.wQKV.weight`, `attention.wO.weight`, `mlp.0.weight` y `mlp.2.weight` de cada capa; las normalizaciones, embeddings, sesgos y la cabeza de cuantiles se mantienen en f16. La dequantización se realiza en la GPU dentro de la propia matmul en WGSL con cómputo en F32. Los pesos se exportaron desde los safetensors F32 con el empaquetador propio de t0-web, y la ruta F32 declara una coincidencia con la referencia de PyTorch de 1,2e-6 de error máximo absoluto.

## Capacidades

- Forecasting probabilístico de series temporales con cinco cuantiles por paso, lo que permite construir intervalos de predicción además de la mediana.
- Predicción multi-horizonte: decodificación directa de 32 pasos y rollout autorregresivo para horizontes más largos.
- Atención de grupo, orientada a series agrupadas o paneles con estructura compartida (por ejemplo, múltiples productos o múltiples sensores).
- Inferencia íntegramente en el cliente: el modelo se ejecuta en el navegador sobre WASM y WebGPU, sin llamadas a servidor.
- Caché de pesos por parte del navegador tras la primera carga.
- Exportación con precisión casi idéntica a F32 según las métricas publicadas por el autor (CRPS agregado idéntico en el subconjunto de 8 configuraciones de GIFT-Eval).
- No soporta generación de texto, razonamiento en lenguaje natural, código ni matemáticas simbólicas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso en el sentido de los LLM; el único proceso iterativo es el rollout autorregresivo sobre la propia serie.
- Capacidades multilingües: no aplica, el modelo no procesa lenguaje.
- No incorpora visión, audio ni modo de pensamiento.

## Casos de uso

- Predicción de demanda en comercio electrónico: el modelo puede generar la mediana y los intervalos al 10 % y 90 % de unidades vendidas por referencia, y la atención de grupo permite aprovechar patrones compartidos entre productos de una misma categoría, con la ventaja de que la inferencia puede ejecutarse en el propio navegador del analista.
- Monitorización de sensores industriales en el borde: dado que el motor corre sobre WASM y WebGPU, puede integrarse en un panel de operaciones que consuma las últimas 512 lecturas de un sensor y proyecte 32 pasos con bandas de cuantiles para detectar derivas antes de que crucen umbrales.
- Planificación de capacidad en infraestructura: forecasting de métricas de tráfico o carga de CPU con intervalos de confianza que alimenten reglas de autoescalado, usando los cuantiles altos como escenario pesimista.
- Previsión financiera de series de alta frecuencia: generación de distribuciones predictivas sobre precios o volúmenes, aprovechando la salida por cuantiles en lugar de una única estimación puntual, sin enviar datos sensibles a un servidor externo.
- Análisis exploratorio en cuadernos y demos interactivas: al cargarse en el navegador con una descarga de 109 MB cacheada, encaja en herramientas web donde el usuario pega su propia serie y obtiene un pronóstico al instante, sin backend ni coste de GPU en la nube.
- Investigación y docencia sobre cuantización: el repositorio sirve como caso de estudio reproducible de cómo afecta Q8_0 a un transformer de forecasting, con métricas de deriva y de latencia comparadas contra la referencia F32 y contra un export INT8.
- Previsión de series agrupadas en sanidad o energía: la atención de grupo permite tratar conjuntos de series relacionadas (por ejemplo, consumos por subestación o por centro) manteniendo una única pasada de modelo.

## Benchmarks y rendimiento

### GIFT-Eval, subconjunto de 8 configuraciones con protocolo oficial (dequantizado a F32 en la arquitectura de referencia)

| Metrica | f32 (pesos originales) | Export INT8 original | Q8_0 (este repositorio) |
|---|---|---|---|
| CRPS (agregado, 8 configuraciones) | 0,0818 | 0,0818 | 0,0818 |

El autor indica que el resultado es indistinguible de F32 en este subconjunto. La ejecución completa de 97 configuraciones de GIFT-Eval solo existe para el export Q4_0 de la misma serie, publicado en el repositorio hermano.

### Deriva frente a la referencia F32 propia (54 casos sinteticos)

| Metrica | Valor |
|---|---|
| Deriva media, peor caso | 0,53 % |
| Deriva puntual, peor caso | 1,78 % |

El autor sitúa estos valores dentro de los umbrales de aceptación habituales para este checkpoint (2 % en media y 10 % puntual).

### Precision declarada frente al export INT8 oficial

| Metrica | Export INT8 ONNX oficial | Q8_0 (este repositorio) |
|---|---|---|
| Deriva en el peor caso vs F32 | 0,79 % | 0,20 % |
| Tamano | ~109 MB | 108,9 MB |

### Latencia en navegador (Chrome, Chromium headless, Apple M2, senal unica, contexto 512)

| Metrica | Export ONNX WebGPU oficial | Q8_0 residente en WebGPU (este repositorio) |
|---|---|---|
| Latencia en caliente (ms) | 64,0 | 34,5 |
| Lote de 24 (ms por senal) | 8,87 | 11,2 |

La latencia de llamada individual mejora aproximadamente 2x respecto al export ONNX oficial, mientras que el rendimiento en lote empeora (11,2 frente a 8,87 ms por señal).

## Requisitos de hardware

- VRAM: no se especifica un requisito de VRAM. El modelo reside en memoria del navegador y se ejecuta sobre la API WebGPU; con 108,9 MB de pesos en Q8_0 el consumo es modesto, pero el autor no publica cifras de memoria.
- GPU compatibles: cualquier GPU con soporte WebGPU. Los datos de latencia publicados corresponden a un Apple M2. No hay cifras para RTX 4090, A100 ni H100, y estas últimas no tendrían sentido como objetivo de despliegue de este artefacto.
- GPU de consumo: sí cabe en GPU integradas y en hardware de consumo con WebGPU; el límite real es la compatibilidad del navegador, no la capacidad de cómputo.
- Navegadores requeridos: Chrome 113+ o Edge 113+, con WebGPU disponible y contexto HTTPS obligatorio.
- Opciones de despliegue: motor t0-web (Rust/WASM + WebGPU, construido con Burn) consumido desde JavaScript mediante el binding `t0wasm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este pipeline de forecasting.
- Latencia: 34,5 ms en caliente para una señal con contexto 512 en Apple M2; 11,2 ms por señal en lotes de 24.
- Ancho de banda: descarga inicial de aproximadamente 109 MB, cacheada por el navegador en cargas posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / destino | Contexto | CRPS GIFT-Eval (8 config.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| idle-intelligence/t0-alpha-q8_0-webgpu | ~101,6 M | GGUF Q8_0 para WASM + WebGPU | 512 en el ejemplo publicado | 0,0818 | Apache-2.0 | Publico, sin descargas registradas |
| theforecastingcompany/t0-alpha | ~101,6 M | safetensors F32 (referencia PyTorch) | no disponible | 0,0818 | Apache-2.0 | Publico (modelo base) |
| Export INT8 ONNX oficial de t0-alpha | ~101,6 M | ONNX INT8 para WebGPU | no disponible | 0,0818 | Apache-2.0 | Publico |
| idle-intelligence/t0-alpha-q4_0-webgpu | ~101,6 M | GGUF Q4_0 para WASM + WebGPU | no disponible | no disponible en esta ficha (el autor remite a ese repositorio para la tabla completa de 97 configuraciones) | Apache-2.0 | Publico |

No se dispone de datos en la informacion proporcionada para comparar con modelos de forecasting de otros autores.

## Limitaciones y advertencias

- El modelo no es un LLM: no genera texto ni responde a instrucciones, por lo que no debe evaluarse con baterías tipo MMLU o HumanEval.
- Los valores de pronóstico pueden diferir ligeramente de la implementación original en PyTorch debido a la cuantización; es una advertencia explícita del propio autor.
- Los resultados de GIFT-Eval publicados cubren únicamente un subconjunto de 8 configuraciones y coinciden con F32, lo que limita la capacidad de extrapolar el comportamiento a las 97 configuraciones completas.
- Las métricas de deriva proceden de 54 casos sintéticos generados por el propio autor, no de un conjunto de validación independiente.
- La latencia publicada corresponde a un único dispositivo (Apple M2) y a una sola señal; no hay datos de latencia en GPU de escritorio ni de rendimiento con series multivariantes amplias.
- Requiere WebGPU: sin soporte de navegador no hay ruta de ejecución alternativa documentada (no se ofrece fallback a WASM puro ni a CPU).
- El repositorio no registra descargas ni valoraciones, por lo que no existe validación por parte de terceros.
- Es un port independiente no afiliado ni respaldado por The Forecasting Company; no debe presentarse como el export oficial.
- El modelo base puede heredar sesgos presentes en los datos de entrenamiento originales, pero no se documenta la composición del dataset, por lo que no es posible caracterizarlos.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje; la limitación equivalente sería el dominio de series sobre el que fue entrenado, que no se detalla.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base por si existiesen términos adicionales no reflejados en esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/idle-intelligence/t0-alpha-q8_0-webgpu
- Modelo base: https://huggingface.co/theforecastingcompany/t0-alpha
- Export hermano en Q4_0: https://huggingface.co/idle-intelligence/t0-alpha-q4_0-webgpu
- Demo en navegador: https://idle-intelligence.github.io/t0-web/web/
- Motor de inferencia t0-web (Rust/WASM + WebGPU): https://github.com/idle-intelligence/t0-web
- Framework Burn: https://burn.dev
- Sitio de The Forecasting Company: https://theforecastingcompany.com/

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su modelo base ni el framework Burn; los enlaces anteriores proceden exclusivamente de la model card del repositorio.
