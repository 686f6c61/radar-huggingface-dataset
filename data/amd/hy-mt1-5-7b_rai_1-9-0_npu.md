# amd/HY-MT1.5-7B_rai_1.9.0_npu

## Resumen

HY-MT1.5-7B_rai_1.9.0_npu es una distribucion optimizada del modelo Hunyuan-MT 1.5 de 7B parametros, publicada por AMD para su ejecucion en las unidades de procesamiento neuronal (NPU) de los procesadores Ryzen AI. El modelo base, desarrollado por Tencent Hunyuan, esta especializado en traduccion automatica y generacion de texto conversacional, y esta disponible bajo una licencia de tipo "other" que requiere aceptar condiciones en Hugging Face (repositorio con acceso restringido).

La version publicada por AMD emplea el formato ONNX junto con el toolkit Quark de cuantizacion, y esta empaquetada especificamente para el stack de inferencia Ryzen AI. Esto la hace relevante para desarrolladores que quieran desplegar traduccion automatica de forma local en portatiles y equipos de sobremesa con NPU integrada, sin depender de GPU dedicada ni de servicios en la nube.

El repositorio ocupa 9,4 GB y esta etiquetado con la arquitectura `hunyuan_v1_dense`, lo que indica un transformer denso de 7B parametros. La informacion publica disponible es limitada: no se detallan la longitud de contexto, el numero de tokens de entrenamiento ni resultados de benchmarks en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 7B (segun el nombre del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion via Quark para NPU (niveles exactos no disponibles) |
| Idiomas soportados | en (segun metadatos; el modelo base esta orientado a traduccion multilingue, pero la ficha solo declara ingles) |
| Licencia | other (acceso restringido, requiere aceptar condiciones en Hugging Face) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `hunyuan_v1_dense`, un transformer denso de 7B parametros derivado de la familia Hunyuan de Tencent. La version publicada por AMD no es un reentrenamiento, sino una conversion y optimizacion del modelo original al formato ONNX, con cuantizacion realizada mediante el toolkit Quark de AMD y empaquetado para el runtime de Ryzen AI que aprovecha la NPU integrada en los procesadores de la compania. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base dentro de esta ficha.

La innovacion principal de esta distribucion es el target de hardware: en lugar de GPU, el modelo se ejecuta en la NPU de Ryzen AI, lo que reduce el consumo energetico y libera la CPU y la GPU integrada para otras tareas. El pipeline declarado es `text-generation` con tag `conversational`, coherente con el uso previsto de traduccion y dialogo.

## Capacidades

- Generacion de texto y traduccion automatica, herencia del modelo base Hunyuan-MT 1.5.
- Generacion conversacional multi-turno (tag `conversational`).
- Ejecucion en NPU de Ryzen AI mediante ONNX Runtime y el stack Ryzen AI.
- Cuantizacion optimizada con Quark para reducir el coste computacional en NPU.
- Soporte de idioma declarado: ingles (la cobertura multilingue del modelo base no se confirma en esta ficha).
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion automatica local en portatiles con Ryzen AI: el modelo puede ejecutarse en la NPU sin GPU dedicada, lo que permite traducir documentos y textos de forma privada y sin conexion.
- Asistentes conversacionales de escritorio: al ser un modelo de 7B en formato ONNX para NPU, encaja en aplicaciones de chat integradas en el sistema operativo con bajo consumo energetico.
- Procesamiento por lotes de traduccion en equipos de sobremesa: el despliegue sobre NPU libera la CPU para orquestar pipelines de documentos largos.
- Prototipado de aplicaciones de PLN en entornos AMD: util para equipos que ya trabajan con el stack Ryzen AI y quieren validar flujos de inferencia antes de escalar a GPU.
- Herramientas de accesibilidad y asistencia linguistica en tiempo real: la inferencia local reduce la latencia de red en aplicaciones de subtitulado o traduccion de conversaciones.
- Investigacion sobre eficiencia energetica: permite comparar el rendimiento por vatio de un modelo 7B en NPU frente a GPU, un area de interes creciente en despliegue en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI (la generacion concreta no se especifica en la ficha).
- VRAM estimada: no aplica directamente; el modelo se ejecuta en NPU y memoria del sistema. El repositorio ocupa 9,4 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no aplica para esta distribucion; el modelo esta empaquetado para NPU. Para ejecucion en GPU habria que recurrir al modelo base Hunyuan-MT 1.5 en otro formato.
- Cabe en GPU de consumo: no disponible para este paquete ONNX/NPU; el modelo base de 7B en cuantizacion de 4 bits cabria en GPUs con 8 GB o mas, pero esa variante no es la publicada aqui.
- Opciones de despliegue: ONNX Runtime con el stack Ryzen AI; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / target | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HY-MT1.5-7B_rai_1.9.0_npu (este) | 7B | no disponible | ONNX / NPU Ryzen AI | other (gated) | Hugging Face, acceso restringido |
| Hunyuan-MT 1.5 (modelo base) | 7B | no disponible | safetensors y otros | other | Hugging Face |
| Modelos de traduccion tipo NLLB-200 | hasta 54B (variantes) | 512 tokens aprox. | PyTorch / CTranslate2 | CC-BY-NC (variantes) | Hugging Face |
| Modelos 7B genericos (p. ej. Qwen2.5-7B) | 7B | 32K o mas | safetensors, GGUF | Apache 2.0 / otras | Hugging Face |

La comparativa es orientativa: los datos de contexto y licencia de las alternativas pueden variar segun la variante concreta. La diferencia clave de este modelo es el target NPU y el formato ONNX, no una mejora en calidad respecto al modelo base.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Licencia "other": conviene revisar los terminos exactos antes de cualquier uso comercial, ya que pueden imponer restricciones adicionales a las del modelo base.
- Idiomas: la ficha solo declara ingles, aunque el modelo base este orientado a traduccion; verificar la cobertura real antes de usarlo en pares de idiomas distintos.
- Dependencia de hardware: el paquete esta optimizado para NPU Ryzen AI; no es portable a GPU o CPU sin reconversion.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en esta distribucion; aplican los riesgos habituales de los modelos generativos.
- Ausencia de benchmarks publicados: no hay datos verificables de calidad de traduccion en esta ficha.
- Sin soporte documentado de tool calling ni agentes: no conviene asumir capacidades que no aparecen en los metadatos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/amd/HY-MT1.5-7B_rai_1.9.0_npu
- Modelo base Hunyuan-MT 1.5: no disponible en la informacion proporcionada
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada
- Toolkit Quark de AMD: no disponible en la informacion proporcionada
- Paper o blog oficial: no disponible en la informacion proporcionada
