# Krylar/salivirac-t5-onnx

## Resumen

SaliVirac es un modelo de traduccion automatica derivado de `google-t5/t5-small`, afinado por Krylar para la traduccion bidireccional entre viracnon (codigo ISO `bik`, variante del bikol hablada en Virac, Catanduanes, Filipinas) y filipino/tagalo (`tl`). El modelo se distribuye en formato ONNX con cuantizacion de 8 bits, empaquetado para su ejecucion en el navegador mediante Transformers.js, lo que permite desplegar traduccion local sin backend ni conexion a servicios en la nube.

Se trata de un trabajo de tesis de grado (BSCS) del College of Information and Communications Technology de la Catanduanes State University, no de un modelo de produccion a gran escala. Su relevancia es fundamentalmente linguistica y de accesibilidad: cubre un par de lenguas de bajos recursos para el que practicamente no existen sistemas publicos de traduccion, y lo hace con un artefacto ligero (repo de 0,9 GB, pesos cuantizados de decenas de MB) ejecutable en un navegador de escritorio o movil.

La arquitectura subyacente es la de T5-small: un transformer encoder-decoder con unos 60 millones de parametros, entrenado originalmente por Google con el objetivo span corruption y reutilizado aqui mediante fine-tuning supervisado sobre pares de frases. El contexto es el nativo de T5-small (512 tokens), adecuado para frases y parrafos cortos, no para documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | ~60 M (heredados de google-t5/t5-small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite nativo de T5-small) |
| Tipos de cuantizacion | ONNX float32 y ONNX int8 (`*_quantized.onnx`) |
| Idiomas soportados | viracnon (`bik`) y filipino/tagalo (`tl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (Transformers.js), variantes cuantizadas de 8 bits |
| Tamano del repositorio | 0,9 GB |
| Prefijos de tarea | `translate Viracnon to Tagalog: ` / `translate Tagalog to Viracnon: ` |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

El modelo parte de `google-t5/t5-small`, un transformer encoder-decoder denso con atencion multi-cabeza estandar, normalizacion RMSNorm y embeddings relativos de posicion por bandas. T5 se preentreno con el objetivo de span corruption (enmascarado de fragmentos contiguos de texto) sobre el corpus C4, y aqui se ha sometido a un fine-tuning supervisado especifico para traduccion, usando los prefijos de tarea `translate Viracnon to Tagalog: ` y `translate Tagalog to Viracnon: ` para condicionar la direccion de la traduccion, tal como es habitual en la familia T5.

La informacion disponible no detalla el volumen de pares de entrenamiento, la composicion del corpus paralelo, ni si se aplicaron tecnicas de aumento de datos, filtrado o validacion humana. Tampoco se documenta el uso de RLHF, DPO ni decodificacion especulativa; el pipeline es el estandar de seq2seq con decodificacion autorregresiva (greedy o beam search). La innovacion practica del artefacto es el empaquetado: exportacion a ONNX con cuantizacion int8 para reducir el peso y permitir inferencia en WebAssembly/WebGPU a traves de Transformers.js.

## Capacidades

- Traduccion bidireccional viracnon → tagalo y tagalo → viracnon, invocada mediante prefijos de tarea explicitos.
- Generacion de texto seq2seq generica, heredada del backbone T5-small, aunque no es el objetivo declarado del fine-tuning.
- Ejecucion en navegador: los pesos ONNX cuantizados a 8 bits se cargan y ejecutan del lado del cliente con Transformers.js.
- Funcionamiento offline una vez descargado el modelo, sin llamadas a API externas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada a los dos idiomas del par; el resto de lenguas del T5 original no se han evaluado tras el fine-tuning.

## Casos de uso

- Traduccion de interfaz en aplicaciones web para Catanduanes: integracion via Transformers.js en una SPA para traducir etiquetas, mensajes y contenido dinamico entre viracnon y tagalo sin coste de servidor ni latencia de red.
- Digitalizacion de material educativo local: traduccion de fichas escolares, cuentos y avisos comunitarios entre ambas lenguas para su uso en escuelas de la provincia, aprovechando que el modelo cabe en el navegador de un portatil modesto.
- Herramienta de preservacion linguistica: generacion de pares paralelos de referencia para lexicografos y linguistas que documentan el viracnon, usando el modelo como primer borrador sujeto a revision humana.
- Asistencia a trabajadores sanitarios y de servicios publicos: traduccion de formularios, instrucciones y preguntas frecuentes en entornos con conectividad intermitente, gracias a la ejecucion offline.
- Prototipado rapido de demos de traduccion: al ser un artefacto ONNX de bajo peso, sirve para validar una idea de producto bilingue en horas, sin infraestructura GPU ni backend.
- Investigacion academica sobre lenguas de bajos recursos: punto de partida reproducible (licencia Apache 2.0) para experimentos de fine-tuning con corpus paralelos adicionales de la familia bikol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye BLEU, chrF, COMET ni evaluaciones humanas, ni comparaciones con sistemas de traduccion existentes para el par viracnon-tagalo.

## Requisitos de hardware

- Inferencia en CPU: viable con los pesos ONNX int8; el modelo base tiene ~60 M de parametros, por lo que la huella en memoria es de decenas de MB en cuantizacion de 8 bits y de unos cientos de MB en float32.
- GPU: no requiere GPU dedicada. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) acelera la inferencia via WebGPU o via runtime ONNX, pero no es un requisito.
- Cabe en cualquier GPU consumer y en la mayoria de moviles modernos con WebGPU o WebAssembly.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime (Python, C++, C#), y conversion a otros formatos si se necesita (no se proporcionan artefactos GGUF ni safetensors en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend (WASM frente a WebGPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SaliVirac T5-small ONNX | ~60 M | 512 | viracnon, tagalo | Apache 2.0 | ONNX (int8/float32) |
| google-t5/t5-small | ~60 M | 512 | multilingue (preentrenamiento) | Apache 2.0 | safetensors, PyTorch |
| Helsinki-NLP/opus-mt-tl-en | ~77 M | 512 | tagalo, ingles | CC-BY 4.0 | safetensors, PyTorch |
| NLLB-200-distilled-600M | ~600 M | 512 | 200 lenguas | CC-BY-NC 4.0 | safetensors, PyTorch |

La comparativa es orientativa: no existen, en la informacion disponible, modelos publicos comparables especificamente para el par viracnon-tagalo. Frente a t5-small, SaliVirac anade el fine-tuning del par y el empaquetado ONNX para navegador; frente a Opus-MT y NLLB, carece de evaluacion publicada y de cobertura multilingue amplia, pero ofrece ejecucion cliente-side y licencia permisiva para uso comercial.

## Limitaciones y advertencias

- Modelo de tesis: no hay evaluacion cuantitativa publicada (BLEU, chrF, COMET) ni validacion por hablantes nativos documentada en la model card.
- Corpus de entrenamiento no documentado: se desconoce el volumen y la calidad de los pares paralelos, lo que impide estimar el riesgo de sobreajuste o de sesgo hacia un registro concreto.
- Contexto limitado a 512 tokens: no apto para documentos largos sin segmentacion previa.
- Cobertura restringida a dos lenguas; el resto de idiomas del T5 original pueden degradarse tras el fine-tuning.
- Riesgo de alucinacion en terminos especializados, nombres propios y expresiones idiomaticas del viracnon, una lengua con ortografia no estandarizada.
- Sesgo potencial hacia la variante de Virac: otras variantes del bikol (Bikol Central, Bikol Rinconada) pueden traducirse con menor calidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la procedencia del corpus de entrenamiento antes de un despliegue en produccion.
- El repo incluye pesos en float32 e int8; verificar que la version cargada por Transformers.js sea la cuantizada si el objetivo es minimizar el peso de descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Krylar/salivirac-t5-onnx
- Modelo base: https://huggingface.co/google-t5/t5-small
- Transformers.js: https://github.com/huggingface/transformers.js
- Documentacion de T5 en Hugging Face: https://huggingface.co/docs/transformers/model_doc/t5
- Paper original de T5 (Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer): https://arxiv.org/abs/1910.10683
