# OptimaMT/en-vi

## Resumen

OptimaMT/en-vi es un modelo de traduccion automatica ingles-vietnamita derivado de Xenova/opus-mt-en-vi, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla OptimaMT, un proyecto que publica 49 pares de idiomas bajo el esquema `OptimaMT/<src>-<tgt>`. El modelo resuelve la traduccion de texto de ingles a vietnamita en entornos JavaScript y Python mediante ONNX Runtime, sin necesidad de GPU.

La aportacion tecnica del modelo no esta en los pesos (que son identicos a los del modelo base) sino en el grafo ONNX: se ha reconstruido unicamente el fichero `onnx/decoder_model_merged_quantized.onnx` moviendo la proyeccion de salida del decodificador fuera de sus dos ramas. El resultado es una reduccion de memoria tras la carga de entre el 14 % y el 47 % segun plataforma y configuracion de cuantizacion, manteniendo tokens de salida identicos.

Es relevante para desarrolladores que necesitan traduccion EN-VI embebida en aplicaciones web o de escritorio con recursos limitados: el modelo completo ocupa 0,1 GB y funciona en CPU con 4 hilos. La licencia CC BY 4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); resto de variantes no disponible |
| Idiomas soportados | Ingles (en) y vietnamita (vi) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); fichero principal `decoder_model_merged_quantized.onnx` |
| Vocabulario | 53.685 tokens |
| Tamano del repositorio | 0,1 GB |
| Runtime | ONNX Runtime 1.31.1 (referencia de las mediciones), transformers.js |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Marian, originalmente entrenado por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. La arquitectura sigue el esquema estandar de traduccion neuronal secuencia a secuencia con atencion, con un vocabulario compartido de 53.685 tokens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; el modelo original se entreno con datos paralelos del corpus OPUS.

La innovacion de esta version es exclusivamente de inferencia: se ha modificado el grafo ONNX del decodificador cuantizado para extraer la proyeccion de salida de las dos ramas del decodificador fusionado. Los pesos y el vocabulario no cambian byte a byte respecto al modelo base, salvo ese fichero reconstruido. Las mediciones del autor con ONNX Runtime 1.31.1 en CPU con 4 hilos muestran una memoria tras la carga de 464 a 257 MiB en Linux (-45 %) y de 441 a 232 MiB en Windows (-47 %) con `disable_quant_qdq = 1`; con los valores por defecto de ONNX Runtime, de 251 a 198 MiB en Linux (-21 %) y de 179 a 155 MiB en Windows (-14 %). En todos los casos los tokens generados son identicos a los del modelo base.

## Capacidades

- Traduccion de texto de ingles a vietnamita, unica tarea del pipeline `translation`.
- Generacion de tokens identica al modelo base Xenova/opus-mt-en-vi.
- Ejecucion en navegador y Node.js mediante transformers.js con backend ONNX.
- Ejecucion en Python con onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- Inferencia en CPU sin GPU, con 4 hilos en las pruebas de referencia.
- Reduccion de huella de memoria configurable mediante `disable_quant_qdq`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Traduccion de documentacion tecnica EN-VI en el navegador: el modelo se carga con transformers.js y procesa parrafos de documentacion sin enviar texto a un servidor, lo que simplifica el cumplimiento de privacidad.
- Localizacion de interfaces web en tiempo real: al ejecutarse en el cliente con ONNX, permite traducir cadenas de UI y mensajes de ayuda a vietnamita sin latencia de red ni coste de API.
- Extensiones de navegador para lectura bilingue: la huella de memoria reducida (232-257 MiB con `disable_quant_qdq` en las pruebas del autor) hace viable mantener el modelo cargado en segundo plano.
- Preprocesado de datos multilingues en pipelines de NLP: traduccion por lotes de resenas o tickets en ingles a vietnamita antes de analisis de sentimiento o clasificacion.
- Traduccion en aplicaciones de escritorio Electron o Tauri: el formato ONNX y la ejecucion en CPU eliminan la dependencia de servicios externos.
- Prototipado rapido de sistemas de traduccion: el script `translate.py` basado en onnxruntime permite validar calidad y latencia antes de invertir en infraestructura mayor.
- Traduccion offline en entornos con conectividad limitada: el repositorio de 0,1 GB cabe en dispositivos con almacenamiento modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET, chrF) en la informacion disponible. El autor solo reporta mediciones de memoria tras la carga:

| Configuracion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 464 → 257 (-45 %) | 441 → 232 (-47 %) | si |
| Valores por defecto de ONNX Runtime | 251 → 198 (-21 %) | 179 → 155 (-14 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en una maquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU.
- Memoria RAM estimada: 155-257 MiB tras la carga segun plataforma y configuracion (datos del autor).
- GPU recomendadas: no necesarias; no se han publicado mediciones en GPU.
- Cabe en cualquier GPU de consumo, pero no se aprovecha: el diseno es CPU-first.
- Despliegue: transformers.js (navegador y Node.js), onnxruntime en Python, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OptimaMT/en-vi | no disponible | no disponible | en, vi | CC BY 4.0 | ONNX |
| Xenova/opus-mt-en-vi (base) | no disponible | no disponible | en, vi | CC BY 4.0 | ONNX |
| Helsinki-NLP/opus-mt-en-vi (original) | no disponible | no disponible | en, vi | CC BY 4.0 | safetensors/PyTorch |

La diferencia frente a Xenova/opus-mt-en-vi es la reduccion de memoria del decodificador cuantizado, con salida identica. Frente al original de Helsinki-NLP, la ventaja es el formato ONNX listo para transformers.js y la optimizacion de memoria; el original requiere PyTorch. No se dispone de datos de calidad comparativa entre los tres.

## Limitaciones y advertencias

- Solo traduce de ingles a vietnamita; no es un modelo multilingue general.
- No se han publicado evaluaciones de calidad de traduccion; la fidelidad depende del modelo OPUS-MT subyacente.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados, terminologia tecnica o texto con jerga.
- No hay informacion sobre sesgos; al derivar de OPUS-MT hereda los sesgos de su corpus de entrenamiento.
- La licencia CC BY 4.0 exige atribucion a los autores originales (Universidad de Helsinki, exportacion de Xenova y modificacion de OptimaMT) en usos comerciales.
- Solo se ha reconstruido `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son copia byte a byte del base, por lo que las optimizaciones de memoria no aplican a otras variantes de cuantizacion del repositorio.
- Las mediciones de memoria son del autor en una configuracion concreta (ONNX Runtime 1.31.1, CPU, 4 hilos); el rendimiento real puede variar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/OptimaMT/en-vi
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del metodo: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
- Modelo base (exportacion ONNX): https://huggingface.co/Xenova/opus-mt-en-vi
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-vi
