# khabouss/opus-mt-en-sla-onnx

## Resumen

`khabouss/opus-mt-en-sla-onnx` es una conversion al formato ONNX con cuantizacion int8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-sla`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS/Tatoeba-Challenge. El modelo traduce del ingles a un conjunto amplio de lenguas eslavas (checo, ruso, polaco, bulgaro, ucraniano, esloveno, macedonio, bielorruso, croata, bosnio, serbio, sorabo alto y bajo, casubo y antiguo eslavo oriental, entre otras), seleccionando el idioma destino mediante un token prefijo `>>id<<`.

La version que nos ocupa esta empaquetada especificamente para su uso con `locale-ai`, la herramienta del autor `khabouss`, y esta optimizada para inferencia ligera: el repositorio ocupa aproximadamente 0.1 GB gracias a la cuantizacion a 8 bits, lo que la hace apta para despliegues en CPU o entornos con recursos limitados sin GPU dedicada.

Se trata de un transformer seq2seq clasico (arquitectura Marian, la misma familia que el resto de modelos OPUS-MT) con preprocesado basado en normalizacion y SentencePiece de 32k tokens compartido entre origen y destino. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Es relevante ahora porque ofrece traduccion multilingue hacia eslavo con un peso minimo y sin dependencia de frameworks pesados, algo poco comun en el ecosistema ONNX para este par de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los modelos Marian de OPUS-MT suelen operar por segmentos de frase; el limite no se especifica en la ficha) |
| Tipos de cuantizacion | int8 (unica variante publicada en este repo ONNX) |
| Idiomas soportados | Ingles (origen); destino: bielorruso, bosnio (latino), bulgaro, checo, casubo, sorabo bajo, sorabo alto, macedonio, antiguo eslavo oriental, polaco, rusino, ruso, esloveno, serbio (cirilico y latino), ucraniano |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (cuantizado int8); los pesos originales estan en formato PyTorch (safetensors/bin) en el repo Helsinki-NLP |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de tipo Marian, la arquitectura estandar empleada por Helsinki-NLP en su familia OPUS-MT. Dispone de un vocabulario SentencePiece de 32 000 tokens compartido entre el codigo fuente y el destino (spm32k, spm32k), con normalizacion de texto previa. El idioma destino se especifica mediante un token prefijo con formato `>>id<<` (por ejemplo `>>ces<<` para checo o `>>rus<<` para ruso), lo que convierte al modelo en un sistema multilingue de muchos destinos con un solo par de pesos.

Los datos de entrenamiento originales provienen del corpus OPUS, en concreto del paquete `opus2m-2020-08-01` generado en el Tatoeba-Challenge (fecha de entrenamiento 2020-08-01, identificador de commit `480fcbe0...`). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion precisa del dataset ni si se aplicaron tecnicas de RLHF o DPO (no es habitual en modelos Marian). La version ONNX aqui descrita ha sido unicamente convertida y cuantizada a int8 por `khabouss`; no se indica si se realizo calibracion especifica del rango de cuantizacion ni que herramienta se uso para la conversion (probablemente `optimum` o `onnxruntime`, aunque no figura en la ficha).

## Capacidades

- Traduccion automatica del ingles a multiples lenguas eslavas con un unico modelo, seleccionando el destino por token prefijo `>>id<<`.
- Traduccion a lenguas minoritarias o historicas incluidas en el corpus: casubo, sorabo alto/bajo, rusino y antiguo eslavo oriental (calidad muy limitada en estas, segun los BLEU publicados).
- Inferencia via runtime ONNX, apta para CPU, sin necesidad de GPU.
- Integracion en pipelines de localizacion gracias a la herramienta `locale-ai` para la que fue empaquetado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de traduccion puro.
- No incluye modo de pensamiento, vision, audio ni capacidades generativas generales fuera de la traduccion.
- Capacidad multilingue solo en el lado destino; el origen esta restringido a ingles.

## Casos de uso

- Localizacion de productos software hacia mercados eslavos: el modelo permite traducir cadenas y documentacion del ingles a checo, ruso, polaco o ucraniano con un unico binario ONNX int8, reduciendo el coste de despliegue en comparacion con varios modelos por idioma.
- Traduccion en dispositivos de borde o entornos sin GPU: gracias al formato ONNX int8 y al tamano del repo (0.1 GB), se puede ejecutar en servidores modestos o incluso contenedores ligeros, algo inviable con modelos neuronales grandes.
- Pre-traduccion de contenido editorial: como primer paso en un flujo humano-en-el-bucle, el modelo genera borradores en lengua eslava que un traductor revisa; adecuado por su velocidad y bajo coste.
- Traduccion de subtitulos o transcripciones en tiempo casi real en aplicaciones de streaming, usando ONNX Runtime en CPU para evitar dependencia de GPU.
- Normalizacion de datos multilingues en pipelines de NLP: convertir textos de usuario en ingles a una lengua eslava concreta antes de aplicar clasificadores o embeddings especificos de ese idioma.
- Soporte en herramientas de traduccion asistida (CAT) integradas en `locale-ai`, donde el modelo actua como motor de sugerencias para segmentos cortos.
- Procesamiento por lotes en entornos de investigacion: comparar calidad de traduccion entre lenguas eslavas sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

Resultados publicados en la model card original (modelo `Helsinki-NLP/opus-mt-en-sla`, evaluados sobre los pesos PyTorch originales; no se especifica si la version ONNX int8 mantiene estas cifras). Se muestran los testsets con datos:

| Testset | BLEU | chr-F |
|---|---|---|
| newstest2016-encs (eng-ces) | 23.6 | 0.515 |
| newstest2013-encs (eng-ces) | 21.5 | 0.489 |
| newstest2019-enru (eng-rus) | 24.0 | 0.506 |
| newstest2012-enru (eng-rus) | 27.4 | 0.551 |
| newstest2017-enru (eng-rus) | 25.0 | 0.541 |
| Tatoeba-test.eng-ces | 42.7 | 0.624 |
| Tatoeba-test.eng-rus | 40.5 | 0.612 |
| Tatoeba-test.eng-pol | 42.0 | 0.637 |
| Tatoeba-test.eng-bul | 46.7 | 0.652 |
| Tatoeba-test.eng-ukr | 38.8 | 0.600 |
| Tatoeba-test.eng-hbs | 40.3 | 0.616 |
| Tatoeba-test.eng-mkd | 44.1 | 0.635 |
| Tatoeba-test.eng-bel | 22.9 | 0.489 |
| Tatoeba-test.eng-slv | 18.8 | 0.357 |
| Tatoeba-test.eng-hsb | 14.3 | 0.344 |
| Tatoeba-test.eng-csb | 1.4 | 0.210 |
| Tatoeba-test.eng-dsb | 1.4 | 0.165 |
| Tatoeba-test.eng-orv | 0.3 | 0.014 |
| Tatoeba-test.eng-rue | 0.3 | 0.012 |
| Tatoeba-test.eng.multi (agregado) | 41.0 | 0.610 |

No se han publicado resultados de benchmarks especificos de latencia o throughput de la version ONNX int8 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con un repo de 0.1 GB en int8, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo. Funciona bien en CPU (incluso en portatiles).
- Cabe en GPU consumer: si, en todas las del mercado actual; tambien se ejecuta en CPU sin problemas.
- Opciones de despliegue: ONNX Runtime (principal), `locale-ai` (herramienta del autor), posible uso con `optimum` o `onnxruntime-genai`; no esta pensado para vLLM, TGI o llama.cpp (son para LLMs, no para Marian).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (eng-ces newstest2016 BLEU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khabouss/opus-mt-en-sla-onnx (este) | no disponible (int8) | no disponible | 23.6 (heredado del original) | apache-2.0 | Hugging Face, ONNX |
| Helsinki-NLP/opus-mt-en-sla (original) | no disponible | no disponible | 23.6 | apache-2.0 | Hugging Face, PyTorch |
| Helsinki-NLP/opus-mt-en-ces (par dedicado) | no disponible | no disponible | no disponible en esta ficha | apache-2.0 | Hugging Face, PyTorch |
| Facebook NLLB-200 (distilled 600M) | 600M | 512 tokens | no disponible en esta ficha | CC-BY-NC 4.0 (uso no comercial) | Hugging Face, PyTorch |

La ventaja principal del modelo ONNX frente al original esta en el despliegue: mismo rendimiento teorico con un cuarto del peso y sin dependencia de PyTorch. Frente a alternativas como NLLB, la licencia Apache 2.0 permite uso comercial, algo que NLLB no permite en su variante abierta.

## Limitaciones y advertencias

- La cuantizacion int8 puede degradar ligeramente la calidad respecto al modelo original; no se han publicado evaluaciones de la version ONNX que lo confirmen o cuantifiquen.
- La calidad es muy baja o practicamente nula para lenguas minoritarias como casubo (BLEU 1.4), sorabo bajo (1.4), antiguo eslavo oriental (0.3) y rusino (0.3); no deben usarse en produccion.
- El modelo solo traduce desde ingles; no soporta traduccion inversa ni bidireccional.
- No es un modelo conversacional ni generativo general: cualquier uso fuera de traduccion producira resultados deficientes.
- Riesgo de alucinacion bajo en el sentido de inventar contenido libre, pero puede omitir fragmentos o producir traducciones literales en frases largas o dominios especializados.
- Sesgos heredados del corpus OPUS (principalmente textos religiosos, politicos y de dominio publico), lo que puede afectar al registro y al lexico en dominios tecnicos o coloquiales.
- El token prefijo `>>id<<` es obligatorio; omitirlo produce salidas incorrectas o en un idioma no deseado.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del corpus OPUS subyacente en caso de redistribucion de datos.
- No hay garantia de mantenimiento del repo (0 descargas y 0 likes en el momento de la consulta, actualizado en noviembre de 2026).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khabouss/opus-mt-en-sla-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-en-sla
- Herramienta `locale-ai`: https://github.com/khabouss/locale-ai
- README del Tatoeba-Challenge para eng-sla: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-sla/README.md
- Pesos originales (opus2m-2020-08-01): https://object.pouta.csc.fi/Tatoeba-MT-models/eng-sla/opus2m-2020-08-01.zip
- Test set: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-sla/opus2m-2020-08-01.test.txt
- Resultados de evaluacion del test set: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-sla/opus2m-2020-08-01.eval.txt
