# balticml/mmbert-small-pii-redaction

## Resumen

mmbert-small-pii-redaction es un modelo de clasificación de tokens especializado en la detección y el etiquetado de datos personales (PII) en texto libre. Lo desarrolla balticml, un perfil centrado en modelos pequeños multilingües y NLP eficiente, y se publica bajo licencia Apache 2.0. El modelo deriva de jhu-clsp/mmBERT-small, un encoder multilingüe de la familia ModernBERT, y se distribuye en formato ONNX con cuantización weight-only int8 para su uso con transformers.js, con un tamaño de 36 MB más 1,6 MB de tokenizer.

El modelo resuelve un problema concreto de cumplimiento normativo: identificar nombres, direcciones postales, fechas de nacimiento, correos electrónicos, teléfonos, IBAN, tarjetas de pago y números de identificación nacional en inglés, polaco, alemán, francés, español y lituano. Etiqueta palabras (no tokens) con esquema BIO y está pensado para combinarse con una capa de reglas que valide identificadores con dígito de control, como IBAN, tarjetas o PESEL.

Su relevancia actual radica en la eficiencia: consigue una cobertura del 98,3 % de los detalles en su conjunto de evaluación con una latencia de 18 ms en CPU (ONNX Runtime, 4 hilos), lo que lo hace apto para redactar PII en el navegador o en servicios de baja latencia sin depender de un LLM grande. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small), fine-tuning de las primeras 12 de 22 capas |
| Parametros totales | no disponible (el modelo base mmBERT-small no publica el recuento en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only (ONNX) y fp32 |
| Idiomas soportados | en, pl, de, fr, es, lt |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia ModernBERT, concretamente un fine-tuning de las primeras 12 capas de jhu-clsp/mmBERT-small (que tiene 22 capas). La tarea es clasificación de tokens con etiquetas BIO, pero con una particularidad de diseño: el modelo etiqueta palabras, no tokens. Una palabra se define como una secuencia de letras y dígitos o un único carácter distinto, y se tokeniza junto con el espacio en blanco que la precede. Por eso el autor advierte de que no debe usarse el pipeline genérico de transformers, que tokeniza todo el texto de una vez, sino el código específico del repositorio (`web/model.js` y `src/pii_redaction/predict.py`).

El entrenamiento no utiliza datos personales reales. Un LLM local (gpt-oss-20b) generó 2.074 mensajes de dominios variados (correos de soporte, líneas de chat, notas de CRM, extractos de contratos, formularios) con marcadores de posición donde van los detalles. Cada mensaje se rellenó doce veces con nombres, direcciones e identificadores ficticios con dígitos de control válidos, lo que produjo 17.914 textos de entrenamiento. Se rechazaron los mensajes en los que el propio LLM escribía un detalle en lugar de dejarlo como marcador. No se menciona en la información disponible el uso de RLHF, DPO ni datos de preferencias.

## Capacidades

- Detección y etiquetado de nombres de persona, direcciones postales, fechas de nacimiento, correos electrónicos, números de teléfono, IBAN, tarjetas de pago y números de identificación nacional.
- Esquema de etiquetado BIO a nivel de palabra, con tokenización que incluye el espacio en blanco previo.
- Multilingüe en seis idiomas: inglés, polaco, alemán, francés, español y lituano.
- Diseñado para combinarse con una capa de reglas que valide identificadores con dígito de control (IBAN, tarjetas, PESEL y otros documentos nacionales).
- Ejecución en navegador y en CPU mediante ONNX Runtime y transformers.js, con cuantización int8.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de clasificación de tokens, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Redacción de PII en el navegador: el modelo, con 36 MB en int8, puede cargarse en una aplicación web mediante transformers.js y redactar los datos personales de un formulario o un chat antes de enviarlo al servidor, con una latencia de 18 ms en CPU.
- Cumplimiento del RGPD en pipelines de datos: integrado en un servicio de preprocesamiento, etiqueta los detalles personales de correos de soporte o notas de CRM para que se anonimicen antes de almacenarse o enviarse a un sistema analítico.
- Enmascaramiento en atención al cliente: combinado con la capa de reglas para IBAN y tarjetas, permite redactar conversaciones multi-turno antes de pasarlas a un LLM generativo o a un sistema de ticketing.
- Procesamiento de contratos y formularios: detecta nombres, direcciones y fechas de nacimiento en extractos de contratos y formularios en los seis idiomas soportados, lo que facilita la revisión manual posterior.
- Preprocesamiento para modelos generativos: actúa como filtro previo que elimina PII del prompt antes de enviarlo a un LLM, lo que reduce el riesgo de fuga de datos a APIs externas.
- Anonimización de conjuntos de datos para investigación: etiqueta los detalles personales de corpus multilingües (en, pl, de, fr, es, lt) para producir versiones publicables sin datos identificativos.
- Moderación y registro de auditoría: etiqueta los identificadores presentes en logs de aplicaciones para que un revisor humano pueda confirmar la redacción antes de enviar el texto a un tercero.

## Benchmarks y rendimiento

Evaluación sobre 60 mensajes escritos a mano (10 por idioma, 172 detalles). "Caught" indica que todas las letras y dígitos de un detalle quedan bajo una barra de redacción; "bars on a detail" mide la proporción de detalles correctamente cubiertos.

| Configuracion | Caught (%) | Bars on a detail (%) | Latencia |
|---|---|---|---|
| Este modelo + reglas, int8 con tokenizer podado (lo que ejecuta el widget) | 98,3 | 91,4 | 18 ms (ORT CPU, 4 hilos) |
| Este modelo + reglas, fp32 | 98,3 | 94,4 | no disponible |
| Solo reglas | 39,0 | 100,0 | no disponible |
| Qwen 2.5 7B instruct (int4, Ollama), pidiendo una lista JSON de detalles | 94,8 | 94,8 | 498 ms (GPU) |

El propio autor advierte de que los mensajes de prueba los escribió la misma persona que redactó los prompts de los datos de entrenamiento, por lo que el resultado es una cota superior. En el README del repositorio hay tablas desglosadas por idioma y por tipo de detalle.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 (36 MB de pesos más el tokenizer de 1,6 MB); en fp32, el modelo base mmBERT-small requiere un tamaño mayor, no especificado en la información disponible.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y para el navegador. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo, pero no es necesario.
- Cabe en cualquier GPU consumer y en CPU de portátil; el widget de referencia funciona con ONNX Runtime en CPU con 4 hilos.
- Opciones de despliegue: transformers.js con ONNX Runtime (navegador o Node), ONNX Runtime en Python mediante el código del repositorio (`src/pii_redaction/predict.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de clasificación, no generativo.
- Latencia: 18 ms por mensaje en CPU (ORT, 4 hilos) con int8 y tokenizer podado. No se proporciona throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mmbert-small-pii-redaction + reglas (int8) | Encoder clasificador de tokens | no disponible (base mmBERT-small) | no disponible | 98,3 % caught, 91,4 % bars, 18 ms CPU | Apache 2.0 | Hugging Face, transformers.js |
| Qwen 2.5 7B instruct (int4, Ollama) con prompt JSON | LLM generativo | 7B | no disponible en la informacion | 94,8 % caught, 94,8 % bars, 498 ms GPU | no disponible en la informacion | Hugging Face, Ollama |
| Solo reglas (capa de validacion de identificadores) | Reglas deterministas | no aplica | no aplica | 39,0 % caught, 100 % bars | no aplica | Codigo del repositorio |

La comparación con un LLM generativo de 7B muestra que el encoder pequeño iguala o supera la cobertura de detalles con una latencia 27 veces menor y sin necesidad de GPU. La capa de reglas sola tiene una cobertura muy baja (39,0 %), lo que confirma que el modelo aporta la mayor parte de la detección y las reglas aportan precisión sobre identificadores con dígito de control.

## Limitaciones y advertencias

- Solo se han probado seis idiomas (en, pl, de, fr, es, lt); el rendimiento en otros idiomas no está documentado.
- No etiqueta nombres de empresas, números de cliente o pedido, matrículas de vehículos ni detalles de salud; los números de cliente a veces se etiquetan erróneamente como identificadores.
- Puede omitir detalles: el autor recomienda revisar el texto redactado antes de enviar cualquier contenido sensible.
- Los resultados de la evaluación son una cota superior porque los mensajes de prueba los escribió la misma persona que diseñó los prompts de entrenamiento.
- El modelo etiqueta palabras, no tokens; usar el pipeline genérico de transformers produce resultados incorrectos. Hay que emplear el código del repositorio.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en el etiquetado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la cobertura en dominios distintos de los datos de entrenamiento (correos de soporte, chat, CRM, contratos y formularios).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balticml/mmbert-small-pii-redaction
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio de código: https://github.com/balticml/pii-redaction
- Demo del widget: https://balticml.eu/demos/pii-redaction/
- Perfil del autor: https://huggingface.co/balticml/models
