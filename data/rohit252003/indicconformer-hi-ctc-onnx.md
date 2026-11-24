# Rohit252003/indicconformer-hi-ctc-onnx

## Resumen

IndicConformer Hindi CTC ONNX es una conversion del modelo de reconocimiento automatico del habla (ASR) `indicconformer_stt_hi_hybrid_ctc_rnnt_large` de AI4Bharat (IIT Madras), publicada por el usuario Rohit252003 para su aplicacion de dictado ShrutLekh. El modelo original es una arquitectura hibrida CTC/RNNT basada en Conformer; esta version conserva unicamente la ruta CTC, elimina el decodificador RNNT y reimplementa el grafo completo sin NeMo a partir de los tensores del checkpoint, exportandolo a ONNX con cuantizacion de pesos a 8 bits (`MatMulNBits`).

El resultado es un artefacto de inferencia ligero y autocontenido: recibe audio mono a 16 kHz, calcula las features mel mediante una STFT implementada como convolucion con stride y las propaga por 17 capas Conformer hasta una cabeza CTC que emite 257 clases (256 tokens hindi mas blank) a razon de un frame cada 40 ms. La precision declarada es de 12,1 % WER y 4,5 % CER en las primeras 150 locuciones del split de test `hi_in` de Google FLEURS con decodificacion greedy, practicamente identica a la reimplementacion en PyTorch sin cuantizar (12,0 % / 4,5 %).

Su relevancia es practica: demuestra que un ASR Conformer de gran tamano para hindi puede ejecutarse en formato ONNX cuantizado con perdida de precision marginal, lo que facilita el despliegue en entornos sin PyTorch ni NeMo (aplicaciones de escritorio, movil o edge). La contrapartida es que se trata de una conversion de un solo idioma y una sola ruta de decodificacion, sin el refinamiento del decodificador RNNT del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (transformer + convolucion), ruta CTC unicamente; STFT como convolucion con stride |
| Parametros totales | no disponible (el modelo base es la variante "large" de IndicConformer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio no especificada; frames de 40 ms) |
| Tipos de cuantizacion | pesos a 8 bits weight-only (`MatMulNBits`); sin cuantizacion de activaciones |
| Idiomas soportados | hindi (`hi`) |
| Licencia | MIT (copyright de los pesos: AI4Bharat, IIT Madras) |
| Formato de pesos | ONNX (`indicconformer-hi-ctc.w8.onnx`) + vocabulario de texto (`indicconformer-hi.vocab`) |

## Arquitectura y entrenamiento

La arquitectura es un Conformer: 17 capas que combinan auto-atencion y convoluciones, con una cabeza CTC final. El modelo base de AI4Bharat es hibrido CTC/RNNT; esta conversion descarta el decodificador RNNT y conserva solo la salida CTC, lo que simplifica el grafo y reduce el coste de inferencia a costa de renunciar al refinamiento del decodificador RNNT. La extraccion de features mel se reimplementa como una STFT expresada mediante convolucion con stride, de modo que todo el preprocesado queda dentro del grafo ONNX.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni si el modelo original uso RLHF, DPO u otras tecnicas de alineacion; esos detalles corresponden a la model card de AI4Bharat, no incluida en la informacion proporcionada. La innovacion tecnica de esta publicacion es la reimplementacion sin NeMo a partir de los tensores del checkpoint y la cuantizacion a 8 bits con perdida de precision minima (12,1 % frente a 12,0 % WER). Los scripts de reproduccion estan en la carpeta `tools/indicconformer/` de la aplicacion ShrutLekh.

## Capacidades

- Reconocimiento automatico del habla en hindi a partir de audio mono a 16 kHz.
- Salida CTC con 257 clases: 256 tokens hindi mas el token blank, un frame cada 40 ms.
- Decodificacion greedy integrada en el flujo CTC (sin decodificador RNNT).
- Inferencia en formato ONNX sin dependencia de PyTorch ni NeMo.
- Pesos cuantizados a 8 bits para reducir huella de memoria y requisitos de computo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- No soporta vision, audio generativo ni modo "thinking".
- Multilingue: no; unicamente hindi.

## Casos de uso

- Aplicacion de dictado en escritorio: es el proposito declarado de la conversion, integrar el modelo en ShrutLekh para transcribir voz a texto hindi en local sin depender de servicios en la nube.
- Transcripcion offline en entornos sin GPU: al ser ONNX cuantizado a 8 bits, puede ejecutarse en CPU con un runtime de ONNX, util para portatiles o equipos sin acelerador.
- Subtitulado de contenido en hindi: la salida CTC a 40 ms por frame permite alinear texto y audio con granularidad suficiente para generar subtitulos.
- Procesado por lotes de archivos de audio: al ser un grafo ONNX autocontenido, se puede integrar en pipelines de transcripcion masiva con ONNX Runtime.
- Integracion en aplicaciones moviles o edge: el formato ONNX y la cuantizacion facilitan el despliegue en dispositivos con memoria limitada.
- Prototipado e investigacion en ASR hindi: sirve como referencia reproducible de un Conformer CTC cuantizado con scripts de conversion publicos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Google FLEURS `hi_in` (test, primeras 150 locuciones, greedy CTC) | WER | 12,1 % |
| Google FLEURS `hi_in` (test, primeras 150 locuciones, greedy CTC) | CER | 4,5 % |
| Reimplementacion PyTorch sin cuantizar (misma evaluacion) | WER | 12,0 % |
| Reimplementacion PyTorch sin cuantizar (misma evaluacion) | CER | 4,5 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ASR ni cifras del modelo base original en otros conjuntos de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser pesos a 8 bits y un Conformer de 17 capas, la huella es notablemente menor que la del checkpoint original en precision completa.
- GPU recomendadas: no especificadas por el autor; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100 o H100) puede acelerar la inferencia, aunque no hay cifras publicadas.
- GPU de consumo: el formato cuantizado y la eliminacion del decodificador RNNT hacen plausible su ejecucion en GPU de consumo e incluso en CPU, pero no se aportan medidas de latencia ni de memoria.
- Opciones de despliegue: ONNX Runtime (CPU o GPU); no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer Hindi CTC ONNX (esta ficha) | no disponible (variante large) | no disponible | 12,1 % WER / 4,5 % CER en FLEURS `hi_in` (150 locuciones) | MIT | ONNX 8 bits |
| `ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large` (modelo base) | variante large | no disponible | no disponible en la informacion proporcionada | MIT | PyTorch/NeMo |
| Otros ASR hindi | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la unica comparacion documentada es contra la reimplementacion sin cuantizar del propio modelo.

## Limitaciones y advertencias

- Solo hindi: no admite otros idiomas ni cambio de codigo; el vocabulario cubre 256 tokens hindi.
- Solo ruta CTC: se ha eliminado el decodificador RNNT del modelo original, por lo que se pierde el refinamiento que este aporta en la transcripcion.
- Evaluacion limitada: las cifras de WER/CER provienen de solo 150 locuciones de FLEURS `hi_in`, lo que reduce la robustez estadistica de la estimacion.
- Cuantizacion: los pesos a 8 bits introducen una degradacion pequena pero medible (12,1 % frente a 12,0 % WER).
- Sesgos: no se documentan analisis de sesgos por acento, dialecto, genero o ruido de fondo; el rendimiento fuera del dominio de FLEURS puede degradarse.
- Alucinacion: como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o fuera de dominio; no se han publicado tasas de error en esas condiciones.
- Licencia: MIT permite uso comercial, pero el copyright de los pesos sigue siendo de AI4Bharat y se pide citar su trabajo.
- Produccion: el autor declara no estar afiliado ni respaldado por AI4Bharat; conviene validar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rohit252003/indicconformer-hi-ctc-onnx
- Modelo base: https://huggingface.co/ai4bharat/indicconformer_stt_hi_hybrid_ctc_rnnt_large
- Aplicacion ShrutLekh (repositorio): https://github.com/RohitBit-25/Shrutlek
