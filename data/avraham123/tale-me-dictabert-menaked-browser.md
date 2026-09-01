# avraham123/tale-me-dictabert-menaked-browser

## Resumen

El modelo `avraham123/tale-me-dictabert-menaked-browser` es una conversión independiente a ONNX del modelo `dicta-il/dictabert-large-char-menaked`, desarrollado por Dicta: The Israel Center for Text Analysis. El modelo original es un BERT de gran tamaño, fine-tuneado específicamente para la tarea de diacritización del hebreo, es decir, añadir los signos vocálicos (nikud) y distinguir entre las letras shin y sin. Esta versión ha sido cuantizada a INT8 dinámico por Tale Me (autor `avraham123`) con el objetivo de ejecutarse de forma local en un navegador web mediante ONNX Runtime Web/WASM, sin necesidad de servidor ni conexión a internet.

La relevancia de este modelo radica en que permite llevar la diacritización automática del hebreo a entornos client-side, lo que facilita su integración en aplicaciones web, extensiones de navegador o herramientas educativas con privacidad total de los datos. El artefacto ONNX pesa aproximadamente 318 MB y mantiene la misma interfaz de entrada/salida que el modelo original, con tres entradas dinámicas (`input_ids`, `attention_mask`, `token_type_ids`) y dos salidas (`nikud_logits` y `shin_logits`). La licencia es CC BY 4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | no disponible (modelo BERT large, tamano no especificado) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (tipicamente 512 para BERT, no confirmado) |
| Tipos de cuantizacion | INT8 dinamico, por canal, rango reducido |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (archivo `.onnx`, opset 17) |

## Arquitectura y entrenamiento

El modelo base `dictabert-large-char-menaked` es un BERT de arquitectura transformer encoder, preentrenado con el objetivo de masked language modeling y posteriormente fine-tuneado para la diacritización del hebreo. La tarea consiste en predecir, para cada carácter hebreo, la marca de nikud correspondiente (29 clases posibles) y la distinción shin/sin (2 clases). El modelo original fue entrenado por Dicta y liberado bajo licencia CC BY 4.0.

La conversión a ONNX realizada por Tale Me no modifica la arquitectura ni los pesos del modelo original, sino que los exporta al formato ONNX (opset 17) y aplica una cuantización dinámica INT8 por canal con rango reducido. El proceso de exportación se documenta en el repositorio con un script (`export_dicta.py`) y un manifiesto de conversión (`conversion-manifest.json`) que registra los hashes de los artefactos y los resultados de verificación. No se dispone de información detallada sobre el dataset de entrenamiento del modelo original, el número de tokens o el uso de técnicas como RLHF o DPO, ya que no se incluye en la documentación proporcionada.

## Capacidades

- Diacritización del hebreo: añade nikud (vocales) a texto hebreo sin vocalizar, carácter a carácter.
- Distinción shin/sin: clasifica cada aparición de la letra shin como shin (con punto a la derecha) o sin (con punto a la izquierda).
- Procesamiento de secuencias de longitud variable: las entradas son dinámicas, lo que permite procesar textos de diferentes longitudes (limitadas por el contexto del modelo, típicamente 512 tokens).
- Ejecución en navegador: gracias a la cuantización INT8 y al formato ONNX, puede ejecutarse con ONNX Runtime Web/WASM sin necesidad de GPU ni servidor.
- No incluye generación de texto, tool calling, capacidades de agente, visión ni audio. Es un modelo de clasificación por token, no generativo.

## Casos de uso

- Aplicaciones web de lectura asistida: integrar el modelo en un sitio web que permita a usuarios convertir texto hebreo sin nikud en texto vocalizado para facilitar la lectura, especialmente para estudiantes o personas con dificultades de lectura. El modelo se ejecuta localmente en el navegador, garantizando privacidad.
- Extensiones de navegador para diacritización automática: una extensión que detecte texto hebreo en páginas web y ofrezca un botón para añadir nikud sobre la marcha, usando el modelo ONNX cargado en el cliente.
- Herramientas educativas de hebreo: plataformas de aprendizaje de idiomas que necesiten mostrar la pronunciación correcta de palabras o frases, integrando el modelo como servicio local en el frontend.
- Procesamiento de textos en entornos sin conexión: aplicaciones de escritorio o móviles basadas en web (PWA) que requieran diacritización sin depender de una API externa, útil en zonas con baja conectividad.
- Accesibilidad para personas con dislexia o dificultades de decodificación: convertir automáticamente textos hebreos en versiones vocalizadas para mejorar la comprensión lectora, todo en el dispositivo del usuario.
- Investigación en lingüística computacional: servir como componente de preprocesamiento en pipelines de análisis de texto hebreo, donde la diacritización es un paso previo a tareas como análisis morfológico o sintáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio documenta una verificación de paridad entre el modelo PyTorch original, la versión ONNX FP32 y la versión INT8, confirmando que las salidas coinciden en un corpus de 12 frases (mismas clases de nikud y shin/sin, y texto diacritizado idéntico byte a byte). Sin embargo, no se proporcionan métricas de calidad del modelo original (como exactitud en tareas de diacritización) ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime Web/WASM, por lo que no requiere GPU ni VRAM dedicada.
- El archivo ONNX pesa aproximadamente 318 MB, por lo que se necesita un navegador moderno con soporte WebAssembly y suficiente memoria RAM (se recomienda al menos 1 GB libre para cargar el modelo y ejecutar inferencias).
- Puede ejecutarse en ordenadores de gama baja, portátiles, tablets y smartphones con navegadores actualizados (Chrome, Firefox, Safari, Edge).
- Para despliegue en servidor, también es posible usar ONNX Runtime con backend CPU o GPU, aunque el propósito principal es el navegador.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo BERT large cuantizado, la inferencia en CPU puede tardar del orden de cientos de milisegundos a unos segundos por frase, dependiendo de la longitud y del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo original `dictabert-large-char-menaked` es la referencia directa, y esta versión ONNX INT8 es una adaptación para navegador. No se han encontrado otros modelos de diacritización hebrea con características equivalentes en los resultados de búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo procesa hebreo; no soporta otros idiomas ni alfabetos.
- Es un modelo de diacritización, no generativo: no puede producir texto nuevo, solo añadir marcas a texto existente.
- La cuantización INT8 puede introducir una ligera degradación en la precisión, aunque la verificación realizada por el autor muestra paridad en el corpus de prueba. Para casos de uso críticos, se recomienda validar con datos propios.
- El modelo puede cometer errores en textos ambiguos o con nombres propios, jerga o transliteraciones, como cualquier modelo de este tipo.
- La licencia CC BY 4.0 exige atribución al autor original (Dicta) y a Tale Me si se redistribuye el modelo. El script de conversión se distribuye bajo MIT, pero el artefacto del modelo mantiene CC BY 4.0.
- No se garantiza el rendimiento en todos los navegadores o dispositivos; se recomienda probar la compatibilidad con ONNX Runtime Web antes de integrarlo en producción.
- El contexto máximo no está documentado en esta conversión; se asume el del modelo BERT original (típicamente 512 tokens), pero no se ha verificado en este repositorio.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/avraham123/tale-me-dictabert-menaked-browser](https://huggingface.co/avraham123/tale-me-dictabert-menaked-browser)
- Modelo base original: [https://huggingface.co/dicta-il/dictabert-large-char-menaked](https://huggingface.co/dicta-il/dictabert-large-char-menaked)
- Página de DictaBERT en Hugging Face: [https://huggingface.co/dicta-il/dictabert](https://huggingface.co/dicta-il/dictabert)
- Ficha del modelo en AI Model Zoo (BimAnt): [https://zoo.bimant.com/model/306031](https://zoo.bimant.com/model/306031)
