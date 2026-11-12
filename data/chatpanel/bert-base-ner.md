# ChatPanel/bert-base-NER

## Resumen

`ChatPanel/bert-base-NER` es un espejo (mirror) sin modificaciones de `Xenova/bert-base-NER`, publicado por el usuario ChatPanel para que su pasarela (gateway) descargue desde un unico origen los modelos que ejecuta. No se ha reentrenado, convertido ni editado ningun fichero: los pesos son byte a byte identicos a los del repositorio upstream en el commit `8e892123e8b7c2c0c2bd1dcb598b7d244c4e53aa`. El modelo original es `dslim/bert-base-NER`, un BERT-base afinado para reconocimiento de entidades nombradas (NER) en ingles, y su version `Xenova` es la conversion a ONNX cuantizada para su uso con Transformers.js.

Se trata por tanto de un modelo encoder de tipo BERT-base (12 capas, 768 dimensiones ocultas, ~110 millones de parametros) especializado en etiquetado de secuencias con las etiquetas estandar de CoNLL-2003 (PER, LOC, ORG, MISC). Su relevancia practica no esta en la innovacion arquitectonica, sino en su formato: un unico fichero ONNX cuantizado de ~0,1 GB que puede ejecutarse en navegador o en entornos edge sin GPU dedicada.

La ficha describe el modelo subyacente (`dslim/bert-base-NER`) y la distribucion concreta de ChatPanel. Cualquier dato no presente en la informacion proporcionada se marca como "no disponible"; en particular, no hay benchmarks, idiomas declarados ni pipeline publicados en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, 768 hidden, 12 cabezas de atencion) |
| Parametros totales | ~110 millones (BERT-base; cifra estandar de la arquitectura, no declarada en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el repo (BERT-base soporta hasta 512 tokens por arquitectura) |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`); no se detalla el esquema exacto (probablemente INT8 dinamico) |
| Idiomas soportados | no disponibles en el repo (el modelo upstream esta entrenado sobre CoNLL-2003, en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX cuantizado; tokenizer en JSON/vocab.txt; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `dslim/bert-base-NER`, un BERT-base (arquitectura transformer encoder bidireccional, 12 capas, 768 dimensiones, 12 cabezas) afinado para etiquetado de secuencias token a token con las cuatro clases de entidad de CoNLL-2003 (PER, LOC, ORG, MISC) en esquema BIO. Es un modelo discriminativo de extraccion de entidades, no un modelo generativo: no produce texto libre, sino una etiqueta por token.

La version distribuida por ChatPanel es la conversion de `Xenova/bert-base-NER` a ONNX cuantizado, pensada para inferencia con Transformers.js. No hay informacion en el repositorio sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF/DPO (no procede en un modelo NER). Tampoco se documenta ninguna innovacion tecnica adicional: es un espejo byte a byte del upstream.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en ingles: personas (PER), localizaciones (LOC), organizaciones (ORG) y miscelanea (MISC).
- Etiquetado de secuencias token a token con esquema BIO.
- Inferencia en navegador o entornos edge mediante ONNX Runtime / Transformers.js.
- Ejecucion en CPU: el fichero cuantizado de ~0,1 GB no requiere GPU.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (el modelo upstream esta orientado a ingles).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Extraccion de entidades en pipelines de procesamiento de documentos: dado un texto en ingles, el modelo devuelve las entidades PER/LOC/ORG/MISC para poblar indices o bases de datos. Adecuado por su tamano reducido y su formato ONNX.
- Anonimizacion o pseudonimizacion de textos: detectar nombres de personas y organizaciones antes de almacenar o compartir documentos, sustituyendo las entidades por marcadores.
- Enriquecimiento de busquedas internas: indexar entidades extraidas de correos o tickets para permitir filtros por organizacion o localidad.
- Inferencia en el cliente (navegador): con Transformers.js y el fichero ONNX cuantizado, se puede ejecutar la extraccion de entidades en el navegador sin enviar el texto a un servidor, util para aplicaciones con requisitos de privacidad.
- Preprocesado para sistemas RAG: etiquetar entidades en los fragmentos recuperados para mejorar el ranking o la presentacion de resultados.
- Clasificacion y moderacion de contenido: identificar organizaciones o personas mencionadas en comentarios para reglas de negocio o revision manual.
- Prototipado rapido de tareas NLP: al ser un modelo pequeno y con licencia MIT, sirve como linea base en experimentos de NER antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de ChatPanel no incluye metricas; el modelo upstream `dslim/bert-base-NER` reporta resultados en su propia model card, pero no se han proporcionado en la informacion de esta ficha y no se reproducen aqui para no inventar cifras.

## Requisitos de hardware

- VRAM estimada: no aplica en la practica; el fichero ONNX cuantizado ocupa ~0,1 GB y puede ejecutarse en CPU.
- GPU recomendadas: no necesarias; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) aceleraria la inferencia, pero no es un requisito.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU y en navegador.
- Opciones de despliegue: ONNX Runtime, Transformers.js, y cualquier runtime compatible con ONNX. No se distribuyen pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp u Ollama no son aplicables directamente a este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ChatPanel/bert-base-NER (este) | ~110 M | no disponible (BERT-base: 512) | ONNX cuantizado | MIT | Espejo de Xenova/bert-base-NER; sin benchmarks publicados |
| dslim/bert-base-NER | ~110 M | 512 | safetensors/PyTorch | MIT | Modelo original; mismo backbone y tarea |
| Xenova/bert-base-NER | ~110 M | 512 | ONNX | MIT | Upstream directo de este repositorio; conversion a ONNX |
| bert-base-NER de otras distribuciones (p. ej. variantes de Hugging Face) | ~110 M | 512 | variable | variable | Misma arquitectura y tarea; no se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la unica diferencia documentada es el empaquetado (ONNX cuantizado) y el origen de la descarga.

## Limitaciones y advertencias

- Es un espejo sin cambios: cualquier limitacion del modelo original (`dslim/bert-base-NER`) aplica integramente.
- Orientado a ingles (CoNLL-2003); el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- Solo cubre cuatro tipos de entidad (PER, LOC, ORG, MISC); no detecta fechas, cantidades, direcciones ni otras categorias.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos en la etiquetacion de entidades.
- No es un modelo generativo: no debe usarse para tareas de texto libre, resumen o traduccion.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribucion a los autores originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- No se declaran idiomas ni pipeline en el repositorio; la integracion debe hacerse a traves de ONNX Runtime/Transformers.js.
- La fecha de creacion indicada (2026-11-12) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/bert-base-NER
- Upstream directo: https://huggingface.co/Xenova/bert-base-NER
- Modelo base original: https://huggingface.co/dslim/bert-base-NER
- Commit upstream referenciado: `8e892123e8b7c2c0c2bd1dcb598b7d244c4e53aa` (en Xenova/bert-base-NER)
- Transformers.js (runtime recomendado para el ONNX): https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
- Dataset CoNLL-2003 (referencia de la tarea NER): https://www.clips.uantwerpen.be/conll2003/ner/
