# shiffman/biscuit-smollm2-360m-ONNX

## Resumen

biscuit-smollm2-360m-ONNX es la conversión a formato ONNX del modelo de lenguaje shiffman/biscuit-smollm2-360m, un modelo de generación de texto de pequeno tamano (360 millones de parametros) construido sobre la arquitectura SmolLM2 de Hugging Face. Lo publica el usuario shiffman y esta pensado para su uso con Transformers.js, la libreria de inferencia en JavaScript del ecosistema Hugging Face, lo que permite ejecutar el modelo directamente en el navegador o en entornos Node.js sin necesidad de backend Python.

La relevancia de esta publicacion reside en su formato: al estar exportado a ONNX, el modelo puede desplegarse en aplicaciones web del lado del cliente mediante WebGPU o WASM, lo que reduce la dependencia de infraestructura de servidor para tareas de generacion de texto ligeras. El repositorio ocupa 4,4 GB, un tamano desproporcionado para un modelo de 360M de parametros, lo que sugiere la inclusion de multiples variantes de cuantizacion y precisiones dentro del mismo repositorio.

Se trata de un modelo derivado (fine-tune de SmolLM2-360M, presumiblemente mediante Unsloth segun las etiquetas) y no de un modelo original. No dispone de descargas ni likes en el momento de la consulta, y la model card es minima: solo indica que es una conversion automatica realizada con el Space onnx-community/convert-to-onnx y remite a la documentacion de Transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, tag "llama") |
| Parametros totales | 360 millones (heredado del nombre y del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo incluye variantes ONNX, pero no se detallan) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (para Transformers.js); el modelo base tambien referencia MLX y safetensors |

## Arquitectura y entrenamiento

El modelo base shiffman/biscuit-smollm2-360m es un fine-tune de SmolLM2-360M, un transformer decoder-only de Hugging Face disenado para ejecucion en dispositivos con recursos limitados. Las etiquetas del repositorio indican el uso de Unsloth para el ajuste fino, aunque no se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card no aporta informacion sobre el proceso de entrenamiento del modelo base.

La version ONNX se genero de forma automatica mediante el Space onnx-community/convert-to-onnx, que convierte los pesos originales al formato ONNX para su consumo con Transformers.js. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) ni detalles sobre la tokenizacion o el preprocesado especifico de esta exportacion.

## Capacidades

- Generacion de texto autoregresiva en ingles, segun el pipeline text-generation declarado.
- Ejecucion en navegador y en Node.js mediante Transformers.js (WebGPU/WASM), sin backend Python.
- Inferencia ligera apta para dispositivos con recursos limitados gracias a sus 360M de parametros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Asistentes embebidos en aplicaciones web: el modelo puede ejecutarse en el navegador del cliente mediante Transformers.js, permitiendo autocompletado o generacion de texto sin enviar datos a un servidor, lo que es util por privacidad y latencia.
- Prototipado rapido en JavaScript: desarrolladores que trabajan en el ecosistema JS pueden integrar generacion de texto en demos y MVPs sin montar infraestructura Python.
- Generacion de texto offline en Node.js: al ser ONNX y ligero, puede desplegarse en entornos edge o sin conectividad para tareas de resumen o respuesta corta.
- Educacion y experimentacion: su tamano reducido permite estudiar el comportamiento de un LLM en el navegador con fines docentes o de investigacion sobre inferencia en cliente.
- Filtrado y clasificacion de texto ligera: puede usarse para tareas de generacion corta (etiquetado, respuestas breves) en pipelines de bajo coste.
- Pruebas de integracion de Transformers.js: sirve como banco de pruebas para validar pipelines de text-generation en WebGPU antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de 360M en precision completa (FP32) se situaria en torno a 1,5 GB, y en cuantizaciones de 8 bits o 4 bits bastante por debajo, pero el repositorio no detalla las variantes incluidas.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) o incluso CPU y WebGPU en navegador podrian ejecutarlo.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU consumer y en navegadores con WebGPU, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: Transformers.js (principal, segun la model card); al ser ONNX podria usarse con ONNX Runtime, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| shiffman/biscuit-smollm2-360m-ONNX | 360M | no disponible | Apache 2.0 | ONNX | Fine-tune de SmolLM2; orientado a Transformers.js |
| HuggingFaceTB/SmolLM2-360M | 360M | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base original de Hugging Face |
| HuggingFaceTB/SmolLM2-135M | 135M | no disponible en esta ficha | Apache 2.0 | safetensors | Version menor de la misma familia |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo de estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para produccion en castellano u otros idiomas.
- Modelo de 360M de parametros: capacidad de razonamiento y conocimiento factual limitados, con riesgo elevado de alucinacion en tareas complejas.
- No se documentan sesgos conocidos, pero al derivar de SmolLM2 hereda los sesgos de sus datos de entrenamiento originales, no especificados.
- La model card es minima y no detalla el dataset de ajuste fino, lo que dificulta evaluar su comportamiento en dominios concretos.
- El repositorio ocupa 4,4 GB, lo que sugiere multiples variantes ONNX; conviene revisar los archivos antes de desplegar para elegir la cuantizacion adecuada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene verificar las condiciones del modelo base SmolLM2.
- Sin descargas ni validacion comunitaria en el momento de la consulta: no hay evidencia publica de calidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiffman/biscuit-smollm2-360m-ONNX
- Modelo base: https://huggingface.co/shiffman/biscuit-smollm2-360m
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de Transformers.js (text-generation): https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
