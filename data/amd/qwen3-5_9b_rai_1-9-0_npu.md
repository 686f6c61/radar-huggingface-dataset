# amd/Qwen3.5_9B_rai_1.9.0_npu

## Resumen

`amd/Qwen3.5_9B_rai_1.9.0_npu` es una distribucion del modelo Qwen3.5 de 9B parametros, publicada por AMD en formato ONNX y optimizada para ejecutarse sobre la NPU (Ryzen AI) de los procesadores AMD Ryzen. El identificador del repositorio indica que se trata de una build preparada para el runtime Ryzen AI 1.9.0, lo que la vincula directamente a la plataforma de inferencia de AMD para equipos de sobremesa y portatiles con NPU integrada.

El modelo base es Qwen3.5, la familia de modelos de lenguaje de Alibaba, en su variante de 9B parametros. AMD redistribuye los pesos en formato ONNX para que puedan desplegarse en la NPU sin depender de GPU dedicada, lo que resulta relevante para escenarios de inferencia local con bajo consumo energetico en equipos consumer.

La ficha se elabora unicamente con los metadatos disponibles en HuggingFace; no se ha publicado informacion adicional sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada. El acceso al repositorio esta restringido y requiere aceptar las condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; no se detalla la arquitectura en la informacion proporcionada) |
| Parametros totales | 9B (segun el identificador del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se distribuye en ONNX; el tamano de 20,2 GB sugiere pesos en precision reducida, pero no se especifica) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El modelo base es Qwen3.5 en su variante de 9B parametros, desarrollado por Alibaba, pero esta distribucion de AMD no documenta en la ficha de HuggingFace el tipo de transformer, el numero de capas, la dimension oculta ni si emplea mecanismos de atencion lineal o decodificacion especulativa.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO) ni el proceso de conversion a ONNX y optimizacion para NPU Ryzen AI. La unica informacion tecnica verificable es que los pesos se distribuyen en formato ONNX y que la build esta etiquetada para el runtime Ryzen AI 1.9.0.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Modelo de lenguaje de proposito general heredado de la familia Qwen3.5.
- Ejecucion sobre NPU AMD Ryzen AI mediante ONNX Runtime.
- Idiomas: ingles (unico idioma declarado en los metadatos).
- No se documentan en la informacion proporcionada capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Inferencia local en portatiles y equipos de sobremesa con NPU Ryzen AI: el modelo se ejecuta sobre la NPU integrada, liberando la CPU y la GPU para otras tareas y reduciendo el consumo energetico en comparacion con la inferencia en GPU dedicada.
- Asistentes conversacionales offline: al ejecutarse localmente en formato ONNX sobre Ryzen AI, permite desplegar chatbots sin conexion a servicios en la nube, util en entornos con requisitos de privacidad.
- Procesamiento de texto en el borde (edge computing): equipos industriales o de campo con procesadores Ryzen pueden ejecutar generacion de texto sin infraestructura de servidor.
- Prototipado de aplicaciones de IA en Windows: integracion con el stack Ryzen AI para desarrolladores que quieran validar flujos de generacion de texto antes de escalar a GPU.
- Generacion de resumenes y redaccion asistida en ingles: uso ofimatico en equipos consumer con NPU, donde el modelo de 9B ofrece calidad suficiente para tareas de texto generales.
- Educacion e investigacion: permite estudiar el comportamiento de modelos de 9B en hardware de bajo consumo y comparar el rendimiento de la NPU frente a CPU y GPU en la misma maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo se ejecuta sobre NPU, no sobre GPU, por lo que la metrica relevante es la memoria compartida del sistema y la memoria dedicada de la NPU.
- GPU recomendadas: no aplica; la build esta orientada a la NPU AMD Ryzen AI (runtime 1.9.0).
- Cabe en consumer GPU: no disponible. El despliegue objetivo es la NPU de procesadores Ryzen con Ryzen AI.
- Opciones de despliegue: ONNX Runtime con el stack Ryzen AI 1.9.0. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.
- Tamano del repositorio: 20,2 GB, lo que condiciona el espacio en disco necesario para el despliegue.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones comparables de otros modelos de la misma categoria, y no se dispone de resultados de benchmarks que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Idioma: solo se declara ingles; no hay soporte multilingue documentado.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero al ser un modelo derivado de Qwen3.5 hereda los sesgos de su corpus de entrenamiento, no detallado aqui.
- Riesgo de alucinacion: no cuantificado; aplicable el riesgo habitual de los modelos de lenguaje de esta escala.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y las condiciones del modelo base Qwen3.5.
- Dependencia de plataforma: la build esta atada al runtime Ryzen AI 1.9.0 y a la NPU de procesadores AMD Ryzen; no es portable a otras plataformas sin reconversion.
- Sin datos de benchmarks ni de rendimiento en produccion: no es posible estimar latencia ni calidad frente a alternativas.
- Fecha de publicacion en el repositorio: 2 de noviembre de 2026, segun los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen3.5_9B_rai_1.9.0_npu
