# amd/Qwen3.5_4B_rai_1.9.0_m_1.0.1_npu

## Resumen

Qwen3.5_4B_rai_1.9.0_m_1.0.1_npu es una distribucion optimizada del modelo Qwen3.5 de 4B parametros, publicada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. El repositorio combina los pesos del modelo base Qwen3.5 con la cadena de herramientas RAI (Ryzen AI) en su version 1.9.0 y el perfil de compilacion m_1.0.1_npu, orientado especificamente al acelerador integrado en los procesadores AMD Ryzen con arquitectura XDNA.

El modelo resuelve un problema concreto de despliegue: llevar un LLM conversacional de 4B parametros a la NPU de un PC con Ryzen AI, reduciendo el consumo energetico y liberando la GPU y la CPU para otras tareas. Para ello se distribuye en formato ONNX, el formato que consume el stack de Ryzen AI, en lugar de los pesos originales en safetensors.

Es relevante ahora porque AMD esta empujando la inferencia local en NPU como alternativa a la GPU para asistentes conversacionales en portatiles y mini-PCs, y este repositorio es un ejemplo de empaquetado llave en mano para ese escenario. La ficha se limita a los datos disponibles en la informacion proporcionada; los detalles de arquitectura interna del modelo base no se detallan en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; pesos distribuidos en ONNX) |
| Parametros totales | 4B (segun el nombre del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (perfil de compilacion m_1.0.1_npu para Ryzen AI) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (repo de 8.3 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la ficha del repositorio. Por el identificador qwen3_5 se infiere que deriva de la familia Qwen3.5, pero no se detalla si emplea transformer denso, MoE o alguna variante hibrida, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO.

Lo que si es especifico de esta distribucion es el proceso de compilacion: los pesos se han convertido a ONNX y compilado con el stack RAI 1.9.0 bajo el perfil m_1.0.1_npu, que produce artefactos ejecutables sobre la NPU XDNA de Ryzen AI. La etiqueta ryzenai y el sufijo npu confirman que el objetivo es la aceleracion por NPU, no la inferencia en GPU o CPU generica. No se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational y el pipeline text-generation.
- Respuesta a prompts multi-turno en formato de chat (se infiere del uso conversacional, aunque no se detalla la plantilla exacta).
- Ejecucion acelerada en NPU AMD Ryzen AI mediante el runtime RAI 1.9.0.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente conversacional local en portatiles Ryzen AI: el modelo se ejecuta en la NPU integrada, liberando CPU y GPU y reduciendo el consumo energetico en comparacion con inferencia en GPU.
- Procesamiento de texto en segundo plano dentro de aplicaciones de escritorio: al correr sobre NPU, permite tareas de resumen o reescritura mientras el usuario trabaja con la GPU en otras cargas.
- Prototipado de aplicaciones de chat en ingles sobre hardware AMD: el paquete ONNX con el perfil m_1.0.1_npu simplifica el despliegue en entornos Ryzen AI sin necesidad de convertir manualmente los pesos.
- Filtrado y clasificacion de texto en el dispositivo: un modelo de 4B en NPU es adecuado para moderacion o etiquetado local sin enviar datos a la nube.
- Generacion de respuestas en herramientas de productividad: borradores de correo, resumenes de notas y reescritura de parrafos en ingles dentro de suites ofimaticas que integren Ryzen AI.
- Evaluacion de la cadena RAI para integradores: sirve como referencia para validar el flujo de compilacion ONNX y el rendimiento de la NPU antes de adoptar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI (arquitectura XDNA) compatible con el stack RAI 1.9.0; es el requisito principal, ya que el modelo esta compilado para NPU.
- VRAM estimada para inferencia en GPU: no disponible; el modelo esta empaquetado para NPU, no para GPU.
- GPU recomendadas: no aplica para este artefacto; para el modelo base Qwen3.5 de 4B en GPU haria falta una GPU con VRAM suficiente para 4B parametros, pero no se detalla en la informacion.
- Compatibilidad con GPU de consumo: no disponible para este artefacto ONNX.
- Opciones de despliegue: runtime Ryzen AI (RAI) 1.9.0 con el perfil m_1.0.1_npu; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5_4B_rai_1.9.0_m_1.0.1_npu (este) | 4B | no disponible | ONNX | apache-2.0 | Compilado para NPU Ryzen AI, solo ingles |
| Modelo base Qwen3.5 4B | 4B | no disponible | no disponible | no disponible | Pesos originales, sin optimizacion para NPU |
| Otros LLM de 4B para NPU de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargar.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Dependencia de hardware: el artefacto esta compilado para NPU Ryzen AI con RAI 1.9.0; no es portable a otras plataformas sin reconversion.
- Riesgo de alucinacion: inherente a los LLM de esta escala; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y del stack RAI por separado.
- Sin datos de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Popularidad nula en el momento de la ficha (0 descargas, 0 likes), lo que limita la validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen3.5_4B_rai_1.9.0_m_1.0.1_npu
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
