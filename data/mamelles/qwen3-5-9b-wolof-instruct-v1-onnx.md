# mamelles/Qwen3.5-9B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-9B-Wolof-Instruct-v1-ONNX es una exportación al formato ONNX del modelo Tonic/Qwen3.5-9B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 orientado al idioma wolof y a tareas conversacionales. El artefacto lo publica el usuario mamelles y está pensado específicamente para su ejecución en el navegador mediante Transformers.js con aceleración WebGPU, empleando la cuantización `q4f16` como configuración de referencia.

El modelo base pertenece a la arquitectura Qwen3.5 (etiquetada como `qwen3_5_text` en el repositorio), con 9.000 millones de parámetros según su denominación. La relevancia de esta variante radica en que permite desplegar un modelo de 9B en entornos cliente sin backend dedicado, algo poco habitual en modelos de este tamaño y especialmente escaso para lenguas de bajos recursos como el wolof.

La información pública disponible es muy limitada: el repositorio no incluye model card detallada, no declara licencia ni lista de idiomas, y no se han publicado resultados de benchmarks. Esta ficha se limita, por tanto, a los datos verificables del repositorio y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 9.000 millones (según denominación del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX con `q4f16` (configuración de referencia para WebGPU) |
| Idiomas soportados | wolof (objetivo del ajuste fino); lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportación para Transformers.js) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del ajuste fino Tonic/Qwen3.5-9B-Wolof-Instruct-v1, que a su vez parte de la arquitectura Qwen3.5 en su variante de texto. Se trata de un transformer decoder-only con 9.000 millones de parámetros. La exportación está etiquetada con el tipo de modelo `qwen3_5_text`, lo que confirma que se ha preservado la topología del modelo original durante la conversión a ONNX.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas específicas del ajuste fino en wolof. La model card del repositorio se limita a indicar que es una exportación ONNX para Transformers.js WebGPU con `dtype: "q4f16"`. Tampoco se detalla el proceso de cuantización más allá del tipo declarado.

## Capacidades

- Generación de texto conversacional en wolof, objetivo declarado del ajuste fino.
- Instrucciones y diálogo multi-turno (etiqueta `conversational` e `Instruct` en el nombre).
- Ejecución en navegador mediante Transformers.js y WebGPU.
- Compatibilidad con el pipeline `text-generation` de la librería Transformers.js.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües adicionales: no disponible (solo se declara wolof).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales en wolof dentro del navegador: el modelo puede ejecutarse íntegramente en cliente con Transformers.js y WebGPU, sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones de chat con requisitos de privacidad.
- Herramientas educativas offline para hablantes de wolof: al ejecutarse en el navegador, permite desplegar tutores o asistentes de aprendizaje que funcionan tras la descarga inicial del modelo, útil en entornos con conectividad limitada.
- Prototipado rápido de aplicaciones de PLN en wolof: la exportación ONNX elimina la necesidad de infraestructura GPU en servidor durante las fases de prueba y demostración.
- Demos interactivas en páginas web: integración directa mediante Transformers.js para mostrar capacidades de generación de texto en wolof a usuarios finales.
- Investigación sobre lenguas de bajos recursos: permite evaluar cualitativamente el ajuste fino en wolof en entornos reproducibles y de bajo coste.
- Procesamiento local de texto sensible: al no requerir backend, encaja en escenarios donde el contenido no debe salir del dispositivo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 24,7 GB, lo que corresponde a los pesos ONNX en las precisiones exportadas; la variante `q4f16` reduce el peso efectivo en ejecución.
- Con cuantización `q4f16`, la estimación teórica de memoria para 9B parámetros ronda los 5-6 GB, aunque no se ha verificado en la información disponible.
- Requiere un navegador con soporte de WebGPU; el rendimiento depende de la GPU del cliente.
- GPU de escritorio recomendadas para WebGPU: tarjetas con soporte WebGPU estable y suficiente VRAM (por ejemplo, RTX 3060 en adelante); no se dispone de cifras verificadas para A100, H100 o RTX 4090 en este formato.
- Despliegue en servidor: podría usarse ONNX Runtime, pero no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-Instruct-v1-ONNX | 9B | no disponible | ONNX (q4f16) | no disponible | Hugging Face |
| Tonic/Qwen3.5-9B-Wolof-Instruct-v1 | 9B | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| Qwen3.5 base (9B) | 9B | no disponible | varios | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio, por lo que el uso comercial no puede verificarse; es necesario consultar el modelo base y la licencia de Qwen3.5.
- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre un modelo general, puede heredar sesgos del modelo base y del corpus en wolof utilizado.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La información sobre la longitud de contexto es inexistente, lo que impide garantizar conversaciones largas.
- El soporte multilingüe no está documentado más allá del wolof.
- La cuantización `q4f16` puede degradar la calidad respecto a los pesos originales; no se han publicado comparativas.
- El rendimiento en navegador depende de la implementación de WebGPU del cliente y puede variar significativamente entre dispositivos.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-v1
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web realizada.
