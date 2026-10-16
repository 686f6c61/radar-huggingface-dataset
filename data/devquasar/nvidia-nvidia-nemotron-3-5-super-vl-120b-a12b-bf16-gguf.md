# DevQuasar/nvidia.NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16-GGUF

## Resumen

DevQuasar/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16-GGUF es una version cuantizada en formato GGUF del modelo nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, publicado por el usuario DevQuasar. No se trata de un modelo original, sino de una reempaquetacion orientada al consumo local mediante llama.cpp y herramientas compatibles con GGUF. El modelo base pertenece a la familia NVIDIA Nemotron y esta etiquetado con el pipeline image-text-to-text, lo que indica que procesa conjuntamente imagenes y texto.

Los datos reales del repositorio base (safetensors) cifran el total de parametros en 120.668.707.840, es decir, unos 120.700 millones. La nomenclatura "A12B" del nombre sugiere una arquitectura de tipo Mixture of Experts (MoE) con aproximadamente 12.000 millones de parametros activos por token, aunque este extremo no aparece confirmado de forma explicita en la informacion disponible. El repositorio GGUF ocupa 553,7 GB, coherente con un modelo de este tamano distribuido en varios niveles de cuantizacion.

La relevancia de esta ficha radica en que, en el momento de su publicacion, el repositorio registra 0 descargas y 0 "likes", y no incluye model card tecnica propia mas alla de la referencia al modelo base. Esto significa que cualquier evaluacion de capacidades, licencia o rendimiento debe remitirse al modelo original de NVIDIA, cuya documentacion no se ha incluido en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); variante MoE segun la nomenclatura del nombre, no confirmada en la informacion disponible |
| Parametros totales | 120.668.707.840 (aprox. 120,7 B), dato real de safetensors del modelo base |
| Parametros activos | Aprox. 12 B (inferido del sufijo "A12B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; niveles concretos no especificados en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (consultar la model card del modelo base) |
| Formato de pesos | GGUF (este repositorio); el modelo base esta en safetensors/BF16 |
| Autor de la cuantizacion | DevQuasar (tercero, no NVIDIA) |
| Tamano del repositorio | 553,7 GB |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en los datos proporcionados. Por el sufijo "VL" y la etiqueta de pipeline image-text-to-text, se trata de un modelo vision-lenguaje capaz de tomar imagenes y texto como entrada y generar texto. Por la nomenclatura "120B-A12B" se infiere un diseno MoE con 120.000 millones de parametros totales y en torno a 12.000 millones activos, patron habitual en modelos optimizados para inferencia con coste reducido por token, pero esta inferencia no esta confirmada por la documentacion disponible.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones concretas (atencion lineal, decodificacion especulativa, etc.). El repositorio aqui descrito no aporta entrenamiento adicional: es unicamente una conversion y cuantizacion del modelo base nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 al formato GGUF, realizada por DevQuasar. Cualquier caracteristica arquitectonica debe verificarse en la model card oficial del modelo base de NVIDIA.

## Capacidades

- Generacion de texto y conversacion multiturno, segun la etiqueta "conversational" del repositorio.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text): el modelo acepta entradas visuales ademas de texto.
- Compatibilidad declarada con endpoints ("endpoints_compatible"), lo que sugiere integracion en servicios de inferencia estandar.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: idiomas soportados no disponibles.
- Capacidades especiales (modo "thinking", audio, etc.): no disponibles.
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.

## Casos de uso

- Analisis de documentos escaneados: extraccion de texto, tablas y estructura a partir de imagenes, aprovechando la naturaleza vision-lenguaje del modelo. Adecuado para digitalizacion y automatizacion de archivos.
- Asistente visual para soporte tecnico: el usuario envia capturas de pantalla de errores o interfaces y el modelo interpreta la imagen junto con la pregunta para guiar la resolucion.
- Generacion de descripciones para accesibilidad: produccion de texto alternativo para imagenes en plataformas de contenido, con soporte de instrucciones textuales.
- Control de calidad en manufactura: inspeccion asistida por imagen con preguntas en lenguaje natural sobre defectos visibles, integrable en pipelines internos.
- Investigacion multimodal: experimentacion academica con modelos de gran tamano en entornos con GPU de gran memoria, usando la version cuantizada para reducir requisitos.
- Despliegue on-premise en formato GGUF: organizaciones que requieren ejecucion local sin enviar datos a la nube pueden servir el modelo con llama.cpp en hardware propio.
- Automatizacion de tareas sobre capturas o diagramas: interpretacion de diagramas de flujo, planos o esquemas combinada con consultas textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba para este modelo ni para su version cuantizada.

## Requisitos de hardware

- VRAM estimada para los pesos (solo pesos, sin cache KV ni codificador de vision), calculada sobre 120,7 B de parametros:
  - BF16: aprox. 241 GB
  - Q8_0: aprox. 128 GB
  - Q6_K: aprox. 99 GB
  - Q5_K_M: aprox. 85 GB
  - Q4_K_M: aprox. 73 GB
  - Q3_K_M: aprox. 58 GB
  - Q2_K: aprox. 44 GB
- Estas cifras son estimaciones a partir del recuento de parametros; hay que anadir el codificador de vision y la cache KV, que crecen con la longitud de contexto.
- GPU recomendadas: para BF16, conjuntos de varias A100 80 GB o H100 80 GB; para Q5/Q6, configuraciones de 2 a 4 GPU con 48 GB o mas (por ejemplo RTX 6000 Ada o A6000); para Q4, al menos 2 GPU de 48 GB o 4 GPU de 24 GB.
- En GPU de consumo: una RTX 4090 (24 GB) no aloja el modelo completo en VRAM; solo es viable con offloading intensivo a RAM del sistema en cuantizaciones bajas (Q2/Q3), con penalizacion severa de velocidad. Los equipos Apple con memoria unificada de 128 GB o mas pueden ejecutar cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, koboldcpp, llama-cpp-python). vLLM y TGI ofrecen soporte GGUF parcial, pero la compatibilidad concreta con esta arquitectura multimodal y MoE no esta garantizada por la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Los siguientes modelos se incluyen como referencia de categoria (vision-lenguaje de gran tamano, codigo abierto). Los valores de parametros y licencia son datos publicos de caracter general y deben verificarse en sus respectivas model cards; no se dispone de comparativas de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B (este, via GGUF) | 120,7 B totales / ~12 B activos (inferido) | no disponible | no disponible | GGUF en este repositorio; base en safetensors |
| Qwen2.5-VL-72B-Instruct | 72 B densos | 128 K | Licencia Qwen | Pesos abiertos en HuggingFace |
| Llama-3.2-90B-Vision-Instruct | 90 B densos | 128 K | Llama 3.2 Community License | Pesos abiertos en HuggingFace |
| InternVL3-78B | 78 B densos | no disponible | MIT | Pesos abiertos en HuggingFace |

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: al ser una conversion GGUF de un modelo BF16, las cuantizaciones bajas (Q2/Q3/Q4) pueden degradar tareas sensibles al detalle, especialmente en percepcion visual.
- Repositorio de terceros: el mantenimiento, la actualizacion y la validez de la conversion dependen de DevQuasar, no de NVIDIA.
- Licencia no disponible: no se especifica la licencia ni en este repositorio ni en los datos consultados. Antes de cualquier uso comercial es imprescindible revisar la licencia del modelo base nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16.
- Riesgo de alucinacion: no hay documentacion sobre alineamiento ni evaluaciones que cuantifiquen este riesgo; debe asumirse el comportamiento tipico de los modelos generativos multimodales.
- Cobertura idiomatica desconocida: no se dispone de la lista de idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas.
- Contexto desconocido: al no publicarse la longitud de contexto, no pueden dimensionarse los casos de uso que dependan de ventanas largas.
- Sin datos de rendimiento: no hay benchmarks ni mediciones de latencia o throughput, lo que impide anticipar el comportamiento en produccion.
- Requisitos de hardware elevados: en BF16 necesita del orden de 241 GB solo en pesos, lo que descarta su ejecucion en una unica GPU de consumo.
- Estado incipiente del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso que respalde su fiabilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DevQuasar/nvidia.NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Sitio del autor de la cuantizacion: https://devquasar.com
- Pagina de apoyo del autor: https://ko-fi.com/L4L416YX7C
- Repositorio GitHub del autor (logo y materiales): https://github.com/csabakecskemeti/devquasar
