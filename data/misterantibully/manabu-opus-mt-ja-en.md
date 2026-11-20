# misterantibully/manabu-opus-mt-ja-en

## Resumen

`manabu-opus-mt-ja-en` es una exportación a ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-ja-en`, desarrollado originalmente por el grupo OPUS-MT de la Universidad de Helsinki (Jörg Tiedemann y Santhosh Thottingal). El modelo exportado lo publica el usuario `misterantibully` como componente de traducción offline japonés→inglés de Manabu, una aplicación de aprendizaje de idiomas. La arquitectura es Marian (transformer encoder-decoder), con pesos sin modificar en precisión fp32, de modo que la salida es idéntica token a token a la del modelo original.

El modelo resuelve la traducción unidireccional japonés→inglés en entornos sin conexión, empaquetada en formato ONNX para su ejecución con runtimes portables (ONNX Runtime, etc.). El repositorio ocupa 0,4 GB e incluye los ficheros `encoder_model.onnx`, `decoder_model.onnx`, el modelo SentencePiece `source.spm` y el vocabulario compartido `vocab.json`. La licencia es Apache-2.0, la misma que el modelo base.

Es relevante para desarrolladores que necesiten traducción JA→EN ligera y determinista sin dependencias de frameworks de deep learning completos, y como referencia de exportación ONNX de un modelo Marian. No obstante, es un modelo de nicho con cero descargas y cero likes en el momento de la consulta, y su uso práctico exige replicar la configuración de decodificación que el autor documenta para evitar artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (pesos completos); no se documentan otras cuantizaciones |
| Idiomas soportados | japonés (ja) → inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`); SentencePiece (`source.spm`); `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Marian, la arquitectura empleada por el proyecto OPUS-MT para servicios de traducción abiertos. Esta exportación concreta corresponde a la revisión `0770961a39ba6bd66305b149c3f4110bcafca2e6` del modelo `Helsinki-NLP/opus-mt-ja-en` y conserva los pesos originales a precisión fp32, por lo que no hay pérdida de calidad respecto al modelo base. El encoder recibe `input_ids` y `attention_mask` y produce `last_hidden_state`; el decoder recibe `input_ids`, `encoder_attention_mask` y `encoder_hidden_states` y produce logits de dimensión 60716.

El vocabulario es compartido y se gestiona mediante SentencePiece: el texto japonés se codifica con `source.spm`, las piezas se mapean a identificadores con `vocab.json` y se añade el token EOS (id 0). Los identificadores especiales son `</s>` = 0, `<unk>` = 1 y `<pad>` = 60715; la decodificación parte del id de pad. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO, más allá de la referencia al proyecto OPUS-MT y a la publicación de EAMT 2020.

La innovación práctica de esta ficha no está en el entrenamiento, sino en el empaquetado ONNX y en la configuración de decodificación documentada por el autor: 6 haces (beams), prohibición de repetición de 3-gramas, bloqueo de acotaciones de escenario tipo `(Laughter)` o `(Applause)`, bloqueo del token `<pad>` y un límite de 2 × longitud de entrada + 10 tokens nuevos. Sin estos ajustes, el modelo puede responder con acotaciones o repetir palabras hasta agotar la longitud.

## Capacidades

- Traducción automática unidireccional japonés→inglés.
- Ejecución offline mediante ONNX Runtime y ficheros ONNX autocontenidos.
- Codificación de entrada con SentencePiece (`source.spm`) y decodificación con vocabulario compartido (`vocab.json`).
- Decodificación por haces configurable (la receta del autor usa 6 beams).
- Control de artefactos mediante listas de tokens prohibidos y límite de longitud de salida.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado a la pareja ja→en; no traduce en sentido inverso.

## Casos de uso

- Traducción offline en aplicaciones móviles o de escritorio: al estar exportado a ONNX y ocupar 0,4 GB, puede integrarse en una app de aprendizaje de idiomas como Manabu sin depender de servicios en la nube, ejecutando la inferencia localmente.
- Procesamiento por lotes de textos japoneses: traducción de corpus, subtítulos o documentación JA→EN en pipelines que ya usan ONNX Runtime, con la configuración de decodificación documentada para evitar repeticiones.
- Preprocesamiento para búsqueda y análisis: traducción de consultas o documentos japoneses a inglés antes de indexarlos en un motor de búsqueda o de pasarlos a un modelo de análisis en inglés.
- Traducción de contenido de soporte y atención al cliente: conversión de mensajes de usuarios japoneses a inglés para su revisión por equipos que no dominan el japonés, con la ventaja de que los pesos fp32 mantienen la salida fiel al modelo original.
- Evaluación y comparación de exportaciones ONNX: sirve como referencia reproducible para validar que una exportación ONNX de un modelo Marian produce la misma salida que el modelo original token a token.
- Prototipado de sistemas de traducción sin GPU: el formato ONNX permite ejecutar en CPU con ONNX Runtime, adecuado para entornos con recursos limitados o sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,4 GB en fp32, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se documentan; al ser un modelo Marian de tamaño moderado en ONNX, es viable en CPU y en GPU consumer.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de memoria libre, aunque no se aportan cifras oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `misterantibully/manabu-opus-mt-ja-en` | no disponible | no disponible | ja→en | Apache-2.0 | ONNX | Exportación ONNX fp32 del modelo base; 0 descargas |
| `Helsinki-NLP/opus-mt-ja-en` | no disponible | no disponible | ja→en | Apache-2.0 | safetensors / PyTorch | Modelo original de OPUS-MT; referencia de calidad |
| `Helsinki-NLP/opus-mt-en-ja` | no disponible | no disponible | en→ja | Apache-2.0 | safetensors / PyTorch | Dirección inversa de la misma familia |

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce japonés→inglés; no cubre en→ja ni otros pares.
- Sin datos publicados de benchmarks, parámetros totales ni longitud de contexto; la evaluación de calidad queda limitada a la fidelidad respecto al modelo base.
- Riesgo de artefactos de decodificación: sin la configuración documentada (6 beams, prohibición de 3-gramas repetidos, bloqueo de `(Laughter)`/`(Applause)` y de `<pad>`, límite de 2 × entrada + 10), puede generar acotaciones o repeticiones.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos de traducción automática neuronales; no se documentan sesgos específicos.
- Repositorio con 0 descargas y 0 likes; sin evidencia de uso en producción ni mantenimiento continuado.
- La licencia Apache-2.0 permite uso comercial, pero el crédito del modelo corresponde a los autores de OPUS-MT; conviene conservar la atribución indicada en la model card.
- Dependencia de la tokenización SentencePiece y del mapeo de vocabulario: un manejo incorrecto de `source.spm` o `vocab.json` degrada la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/misterantibully/manabu-opus-mt-ja-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ja-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Publicación de referencia: Jörg Tiedemann and Santhosh Thottingal. 2020. OPUS-MT — Building open translation services for the World. In Proceedings of EAMT 2020.
