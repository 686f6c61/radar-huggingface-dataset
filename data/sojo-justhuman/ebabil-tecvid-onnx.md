# Sojo-JustHuman/ebabil-tecvid-onnx

## Resumen

Ebabil Tecvid (ONNX, 4-bit) es una exportación cuantizada del modelo `obadx/muaalem-model-v3_2`, desarrollado en el marco del proyecto Quran Muaalem. Se trata de un modelo de reconocimiento fonético del árabe coránico que emite secuencias de fonemas mediante decodificación CTC, diseñado específicamente para evaluar la recitación (tajwid) y ofrecer retroalimentación al estudiante. La versión publicada por Sojo-JustHuman conserva únicamente la cabeza fonética del modelo original y descarta las cabezas de atributos (sifat), lo que reduce el tamaño y simplifica el despliegue.

La contribución principal de esta ficha no es un nuevo modelo entrenado desde cero, sino un artefacto de inferencia optimizado para ejecutarse íntegramente en el navegador mediante `onnxruntime-web`. Las convoluciones pointwise 1×1 se han reescrito como capas lineales equivalentes y los pesos MatMul se han cuantizado a 4 bits con cuantización por bloques simétrica mediante `MatMulNBitsQuantizer` de ONNX Runtime. El resultado se distribuye troceado en partes de aproximadamente 32 MB (`tecvid.partNN`) que deben concatenarse en orden para reconstruir el archivo `.onnx`.

El modelo se integra en Ebabil (https://ebabil.web.app), una aplicación gratuita y sin publicidad de aprendizaje del Corán, con el objetivo de que el audio del usuario nunca abandone el dispositivo. Su relevancia radica en demostrar un caso de despliegue de CTC sobre features tipo Wav2Vec2-BERT/SeamlessM4T en el cliente, con un modelo base de tamaño no especificado en la información disponible y bajo una licencia restrictiva (QML 1.0) que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza CTC fonética (derivada de `obadx/muaalem-model-v3_2`); convoluciones pointwise 1×1 reescritas como capas lineales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada se define por `T` frames de features fbank) |
| Tipos de cuantizacion | 4 bits, por bloques, simétrica (`MatMulNBitsQuantizer` de ONNX Runtime) |
| Idiomas soportados | árabe coránico (fonética coránica); no disponible el desglose de idiomas |
| Licencia | QML 1.0 (Quran Muaalem License), derivada de Apache-2.0 con condiciones adicionales |
| Formato de pesos | ONNX cuantizado, troceado en partes de ~32 MB (`tecvid.partNN`) + `manifest.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo `obadx/muaalem-model-v3_2` del proyecto Quran Muaalem, del que esta exportación conserva exclusivamente la cabeza CTC de fonemas. La entrada son features fbank de tipo SeamlessM4T/Wav2Vec2-BERT a 16 kHz con stride 2, con forma `[1, T, 160]`, y la salida son logits `[1, T/2, 43]`. La decodificación es CTC voraz (greedy) usando `vocab.json["phonemes"]`, con el índice 0 reservado para el token blank, lo que produce la secuencia en escritura fonética coránica.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni sobre si el modelo original empleó RLHF, DPO u otras técnicas de alineación. La innovación técnica de esta exportación es de naturaleza de despliegue: reescritura de convoluciones pointwise como capas lineales equivalentes, cuantización de pesos MatMul a 4 bits por bloques simétricos y troceado del grafo para su carga en el navegador. El `manifest.json` del repositorio incluye una comparación de precisión frente al modelo PyTorch original, aunque los valores concretos no están disponibles en la información proporcionada.

## Capacidades

- Reconocimiento fonético del árabe coránico mediante CTC, con salida de 43 clases (incluido el token blank).
- Evaluación de tajwid: la secuencia de fonemas permite comparar la recitación del usuario con la esperada y generar retroalimentación.
- Inferencia completamente local en el navegador mediante `onnxruntime-web`, sin envío de audio a servidores.
- Procesamiento de audio a 16 kHz con features fbank precalculadas externamente (no incluye el extractor de features en el grafo exportado).
- Decodificación CTC voraz integrada en el flujo de la aplicación.
- No incluye tool calling, function calling, capacidades de agente, visión, audio generativo ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles; el modelo está especializado en fonética coránica.

## Casos de uso

- Retroalimentación de tajwid en aplicación web: el modelo recibe las features fbank del audio del usuario y devuelve la secuencia fonética para compararla con la recitación de referencia, todo dentro del navegador.
- Aprendizaje del Corán sin conexión: al ejecutarse con `onnxruntime-web` y pesos troceados, puede cachearse en el cliente y funcionar sin backend, lo que encaja con el carácter gratuito y sin publicidad de Ebabil.
- Privacidad en el aula o en el hogar: al no salir el audio del dispositivo, es adecuado para entornos donde la grabación de menores o la retención de voz plantean requisitos estrictos.
- Evaluación de pronunciación de fonemas coránicos: la salida de 43 clases permite identificar confusiones entre fonemas y orientar la práctica del estudiante.
- Prototipado de herramientas educativas islámicas: sirve como componente de inferencia para desarrolladores que quieran integrar corrección fonética en aplicaciones web existentes.
- Investigación en despliegue de CTC en el cliente: el repositorio documenta el proceso de cuantización a 4 bits y troceado, útil como referencia para exportar otros modelos acústicos a ONNX.
- Verificación de integridad de la exportación: el `manifest.json` permite comparar la precisión del modelo cuantizado con el original antes de desplegarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona un `manifest.json` con una comparación de precisión frente al modelo PyTorch original, pero los valores numéricos no están incluidos en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,4 GB, pero el tamaño del grafo reconstruido y su huella en memoria no se especifican.
- GPU recomendadas: no aplica en el escenario principal, ya que el destino es la inferencia en navegador con `onnxruntime-web` (CPU o aceleración WebGPU/WebAssembly del cliente).
- Compatibilidad con GPU de consumo: no disponible; al ejecutarse en el cliente, el rendimiento depende del dispositivo del usuario final.
- Opciones de despliegue: `onnxruntime-web` (escenario previsto); también es posible cargar el `.onnx` reconstruido con ONNX Runtime en servidor, aunque no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Ebabil Tecvid (ONNX, 4-bit) | no disponible | no disponible | CTC fonético coránico | QML 1.0 | ONNX 4-bit troceado |
| `obadx/muaalem-model-v3_2` | no disponible | no disponible | CTC fonético + cabezas sifat | no disponible en la información | PyTorch |
| Alternativas de ASR árabe generalista | no disponible | no disponible | ASR general | variable | variable |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría. La comparación más directa es con el modelo base `obadx/muaalem-model-v3_2`, del que esta exportación elimina las cabezas de atributos y cuantiza los pesos MatMul a 4 bits.

## Limitaciones y advertencias

- Solo se conserva la cabeza fonética CTC; las cabezas de atributos (sifat) del modelo original no están disponibles en esta exportación.
- La cuantización a 4 bits puede introducir degradación de precisión; debe consultarse el `manifest.json` para conocer la comparación exacta con el modelo PyTorch.
- El modelo no incluye el extractor de features: el usuario debe generar las features fbank a 16 kHz con stride 2 por su cuenta.
- La licencia QML 1.0 impone condiciones adicionales sobre Apache-2.0: prohibición de publicidad en productos que lo usen, obligación de ofrecer una vía de acceso gratuita, aviso claro de que la IA puede equivocarse y no sustituye a un profesor cualificado, y uso conforme a principios islámicos. Es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- La retroalimentación automática de tajwid puede ser errónea; el propio autor la describe como ayuda de práctica y no como sustituto de la recitación ante un profesor cualificado.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura de acentos o estilos de recitación.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- El troceado en partes exige una concatenación correcta en orden antes de cargar el `.onnx`; un error en este paso invalida el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sojo-JustHuman/ebabil-tecvid-onnx
- Modelo base: https://huggingface.co/obadx/muaalem-model-v3_2
- Proyecto Quran Muaalem: https://github.com/obadx/quran-muaalem
- Aplicación Ebabil: https://ebabil.web.app
- Licencia QML 1.0: archivo `LICENSE` del repositorio
