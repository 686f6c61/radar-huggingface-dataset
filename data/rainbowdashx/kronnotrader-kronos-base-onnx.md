# RainBowDashX/kronnotrader-kronos-base-onnx

## Resumen

Kronos-base ONNX para KronoTrader es una exportación a formato ONNX del modelo fundacional de series temporales financieras Kronos-base, publicada por el usuario RainBowDashX. El repositorio no contiene pesos originales en PyTorch, sino cuatro grafos ONNX en FP32 (opset 18) con dimensiones dinámicas de batch y secuencia, pensados para ejecutarse dentro del navegador mediante ONNX Runtime Web y WebGPU. Está derivado de los modelos de NeoQuasar (Kronos-base y Kronos-Tokenizer-base), distribuidos bajo licencia MIT.

El problema que resuelve es de despliegue: permite hacer inferencia de un modelo de series temporales financieras en el cliente, sin servidor Python ni GPU remota, descargando los grafos bajo demanda desde `resolve/main` y almacenándolos en Cache Storage. El paquete completo ocupa 0,4 GB, con los pesos integrados dentro de los propios grafos.

El interés actual es acotado pero claro: es un ejemplo de port de un modelo fundacional a WebGPU para aplicaciones de trading en navegador, un nicho donde la mayoría de alternativas (Chronos, TimesFM, Moirai) se sirven como bibliotecas Python. La model card no aporta datos sobre número de parámetros, contexto ni evaluación, por lo que la ficha se limita a lo verificable en los archivos descritos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional de series temporales financieras con tokenizador discreto de dos niveles (s1/s2) y decoder autorregresivo; exportado como grafo ONNX |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (la dimension de secuencia T es dinamica en el encoder) |
| Tipos de cuantizacion | FP32 unicamente; no se distribuyen variantes INT8, FP16, Q4 ni GGUF |
| Idiomas soportados | no aplicable: modelo de series temporales, sin entrada ni salida de lenguaje natural |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, FP32, pesos integrados en los grafos) |
| Tamano del repositorio | 0,4 GB |
| Entrada del encoder | `x` con forma `[B, T, 6]`, float32 |
| Salidas del encoder | `s1_ids`, `s2_ids` |
| Grafo | `kronos_decode_s1.onnx` (logits y contexto), `kronos_decode_s2.onnx` (logits), `kronos_decoder.onnx` (reconstruye las seis caracteristicas normalizadas) |
| Libreria declarada | onnxruntime-web |
| Backend objetivo | ONNX Runtime Web con WebGPU (y fallback WASM) |
| Etiquetas | kronos, onnx, webgpu, time-series |

## Arquitectura y entrenamiento

La model card describe la estructura de inferencia, no la del entrenamiento. El pipeline se reparte en cuatro grafos: `kronos_encoder.onnx` recibe una ventana de seis características normalizadas con forma `[B, T, 6]` y produce dos secuencias de identificadores discretos (`s1_ids` y `s2_ids`), lo que indica una tokenizacion jerarquica de dos niveles; `kronos_decode_s1.onnx` y `kronos_decode_s2.onnx` implementan los dos pasos del decoder autorregresivo (el primero devuelve logits y contexto, el segundo solo logits); y `kronos_decoder.onnx` reconstruye las seis características normalizadas a partir de los tokens. Todo esta en FP32 y opset 18, con dimensiones de batch y secuencia dinamicas.

Es importante notar que los grafos cubren solo la parte neuronal: la normalizacion, la generacion de marcas temporales (stamps), el bucle autorregresivo, el sampling y la desnormalizacion se ejecutan fuera de ONNX, en el codigo de KronoTrader WebAssembly. Esto significa que la semantica completa del modelo original no está encapsulada en el repositorio. No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF, DPO o ajuste posterior; la model card solo cita el articulo "Kronos: A Foundation Model for the Language of Financial Markets" (Yu Shi et al., 2025) como referencia de atribucion.

## Capacidades

- Prediccion y modelado de series temporales financieras: el encoder consume ventanas de seis características normalizadas por paso temporal y el decoder reconstruye esas seis características, lo que cubre tareas de forecasting sobre datos de mercado.
- Tokenizacion discreta de dos niveles: la separacion en `s1_ids` y `s2_ids` con dos pasos de decodificacion permite representar la serie con una granularidad gruesa y otra fina.
- Generacion autorregresiva multi-paso: el bucle de decodificacion (implementado fuera de los grafos) permite extender la prediccion mas alla de un unico horizonte.
- Inferencia en navegador: ejecucion completa en el cliente mediante ONNX Runtime Web sobre WebGPU, sin backend Python.
- Cache local de pesos: los grafos se almacenan en Cache Storage y se reutilizan entre sesiones sin volver a descargarlos.
- Sampling configurable: al quedar el muestreo fuera de los grafos, la estrategia de seleccion de tokens (temperatura, top-k, etc.) es responsabilidad de la aplicacion anfitriona.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni multilingueismo.

## Casos de uso

- Trading en navegador sin backend: una aplicacion web puede descargar los cuatro grafos y ejecutar la inferencia localmente con WebGPU, eliminando el coste de servidores de inferencia y la latencia de red asociada al envio de datos de mercado.
- Prototipado y demos interactivos: al no requerir entorno Python, permite publicar una demostracion reproducible de un modelo fundacional financiero en una pagina estatica, util para validar la viabilidad de una estrategia antes de invertir en infraestructura.
- Investigacion con datos sensibles: si la serie temporal no puede salir del dispositivo del usuario, la ejecucion en el cliente evita enviar datos de mercado a un servicio externo.
- Aplicaciones offline o de baja conectividad: gracias al almacenamiento en Cache Storage, la inferencia puede repetirse sin conexion una vez descargados los 0,4 GB de grafos.
- Integracion en herramientas de analisis de escritorio basadas en Electron o en navegadores embebidos, donde ONNX Runtime Web es el runtime disponible por defecto.
- Educacion y divulgacion: sirve como caso de estudio de exportacion de un modelo de series temporales a ONNX con dimensiones dinamicas y su ejecucion sobre WebGPU.
- Comparacion de backends: permite medir el mismo modelo en FP32 sobre WebGPU frente al fallback WASM para estudiar el impacto del acelerador en latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error de prediccion, comparaciones con otros modelos ni cifras de latencia o throughput. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen datos de uso en el momento de redactar esta ficha.

## Requisitos de hardware

- El conjunto de grafos ocupa 0,4 GB en FP32; en el navegador hay que sumar a ese espacio los buffers de activaciones y el contexto que devuelve `kronos_decode_s1.onnx`. Como referencia practica, conviene reservar al menos 1 GB de memoria en el dispositivo grafico para el modelo y el estado de decodificacion.
- GPU compatible con WebGPU: adaptadores de escritorio de las series NVIDIA RTX 20/30/40, AMD RDNA2 o superior, e integradas Apple Silicon. Navegadores Chromium 113 o superior son el requisito habitual para WebGPU.
- Cabe en GPU de consumo: cualquier equipo con WebGPU operativo puede ejecutarlo; la restriccion real es la memoria del adaptador grafico y el tiempo de descarga inicial de los 0,4 GB.
- Alternativa sin GPU: ONNX Runtime Web puede ejecutar los grafos en CPU mediante WASM, con latencia notablemente superior y sin aceleracion por hardware.
- Otras opciones de despliegue: ONNX Runtime en Python o C++ sobre los mismos ficheros `.onnx`, util para validar resultados fuera del navegador. vLLM, TGI, llama.cpp y Ollama no son aplicables porque el modelo no es un LLM y no se distribuye en formato GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Ejecucion en navegador | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kronnotrader-kronos-base-onnx (este repositorio) | no disponible | no disponible | ONNX FP32, opset 18 | Si, via ONNX Runtime Web y WebGPU | MIT | HuggingFace, 0 descargas |
| NeoQuasar/Kronos-base (original) | no disponible | no disponible | no disponible en la informacion proporcionada | No | MIT (segun la model card de este repositorio) | HuggingFace |
| Otros modelos fundacionales de series temporales (Chronos, TimesFM, Moirai) | no disponible | no disponible | no disponible | No disponible en la informacion proporcionada | no disponible | no disponible |

La comparacion cuantitativa no es posible con los datos disponibles: no hay cifras de parametros, contexto ni evaluacion para ninguno de los modelos listados en la informacion proporcionada. El unico eje diferencial verificable de este repositorio frente al Kronos-base original es el formato de despliegue: ONNX con dimensiones dinamicas y ejecucion en el cliente.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de error, ni comparaciones. No se puede afirmar nada sobre su calidad predictiva a partir de la informacion disponible.
- Riesgo de predicciones plausibles pero erroneas: como cualquier modelo generativo sobre series financieras, puede producir trayectorias coherentes en apariencia y alejadas de la realidad; en un contexto de trading esto se traduce directamente en riesgo financiero.
- Sesgo de datos no auditable: no se documentan la composicion del dataset de entrenamiento, el periodo temporal cubierto ni el universo de activos, por lo que no se puede descartar sesgo de supervivencia, look-ahead bias o sobreajuste a un regimen de mercado concreto.
- Dependencia de codigo externo: normalizacion, stamps temporales, bucle autorregresivo, sampling y desnormalizacion viven fuera de los grafos ONNX. Un fallo o una discrepancia en esa logica invalida los resultados sin que el modelo pueda detectarlo.
- Sin informacion de contexto: se desconoce la longitud de ventana soportada y si el modelo extrapola mas alla de la secuencia de entrenamiento.
- Compatibilidad de navegador limitada: requiere WebGPU; el fallback WASM funciona pero con rendimiento muy inferior.
- Coste de descarga en cliente: 0,4 GB por usuario en la primera visita, con la consiguiente penalizacion en conexiones lentas o moviles.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes implican que no hay evidencia publica de que los grafos funcionen correctamente en produccion.
- Licencia MIT: permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la atribucion a los autores originales de Kronos. Conviene verificar la licencia del proyecto original y del paper asociado si se va a redistribuir.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni agentes; cualquier capa conversacional debera construirse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RainBowDashX/kronnotrader-kronos-base-onnx
- Modelo original Kronos-base: https://huggingface.co/NeoQuasar/Kronos-base
- Tokenizador original Kronos-Tokenizer-base: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
- Repositorio del proyecto Kronos: https://github.com/NeoQuasar/Kronos
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados devueltos no guardaban relacion con el modelo.
