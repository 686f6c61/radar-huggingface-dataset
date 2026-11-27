# 1bit-MONSTER/Qwen3.6-35B-A3B-NPU

## Resumen

Qwen3.6-35B-A3B-NPU es una redistribución del modelo Qwen3.6-35B-A3B de Alibaba Qwen, empaquetada por el usuario 1bit-MONSTER en el formato Q4NX de 4 bits para ejecutarse sobre la NPU AMD XDNA 2 (arquitectura Ryzen AI Max / Strix Halo) mediante el runtime 1bit engine. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del modelo base Apache-2.0, y el empaquetado Q4NX es byte a byte idéntico al publicado por FastFlowLM, por lo que el valor añadido del repositorio es la integración con el motor de inferencia, no una modificación del modelo.

El modelo base es un transformer con mezcla de expertos (MoE) de 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token, según se deduce de la nomenclatura A3B. La model card no documenta la longitud de contexto, los idiomas ni los datos de entrenamiento; esa información debe consultarse en la ficha del modelo original de Qwen.

Su relevancia es práctica: demuestra que un MoE de 35B puede servirse en una NPU integrada de consumo (Strix Halo) con cuantización de 4 bits y un rendimiento medido de unos 16 tokens por segundo en decodificación, con arranque en 30 segundos. Es un caso de interés para quienes despliegan LLM en hardware AMD sin GPU discreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag `qwen3_5_moe` |
| Parametros totales | 35B (según nomenclatura del modelo base) |
| Parametros activos | 3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (tiles de 4 bits propietarios del 1bit engine); no se ofrecen otros formatos en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.q4nx` (Q4NX); configuración y tokenizador en JSON/Jinja estándar de Qwen |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Hardware objetivo | NPU AMD XDNA 2 (Ryzen AI Max / Strix Halo) |
| Tamano del repositorio | 23,2 GB |
| Capas | 40 (según la model card) |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base Qwen3.6-35B-A3B: un transformer con mezcla de expertos de 40 capas, con 35B parámetros totales y 3B activos por token. El repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos detalles pertenecen a la ficha oficial de Qwen. Tampoco se documenta ninguna innovación algorítmica propia: el autor declara explícitamente que los pesos son los de Qwen sin modificar.

La innovación es de despliegue. El formato Q4NX divide los pesos en tiles de 4 bits con layouts específicos para la NPU XDNA 2, y el 1bit engine compila sus propios kernels como ELF completos, de modo que el paso de un token a través de las 40 capas MoE se envía como una única lista de ejecución (runlist) a la NPU. El motor valida la decodificación contra una referencia en fp64. El empaquetado Q4NX procede de FastFlowLM/Qwen3.6-35B-A3B-NPU2 y es byte a byte idéntico en el commit `0cad628`; los kernels se construyen desde OpenFlowLM-Next bajo licencia MIT.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo de razonamiento explícito: la respuesta de pensamiento se devuelve en el campo `reasoning_content`.
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B (código, matemáticas, multilingüismo, tool calling): no están verificadas ni documentadas en esta ficha, por lo que deben contrastarse con la model card de Qwen.
- Ejecución íntegra en NPU XDNA 2 mediante el runtime 1bit engine, con soporte de servidor compatible con API HTTP (`1bit serve`).
- Integración con Lemonade a través de la receta `onebit`, con el modelo catalogado como `Qwen3.6-35B-A3B-NPU-1bit`.
- Plantilla de chat Jinja de Qwen incluida sin cambios, lo que preserva el formato de turnos y el canal de razonamiento del modelo original.

## Casos de uso

- Inferencia local en equipos con Ryzen AI Max: desplegar un MoE de 35B en un portátil o mini-PC Strix Halo sin GPU discreta, aprovechando la NPU y los 16 tok/s medidos para asistentes interactivos.
- Servidor de desarrollo compatible con API: levantar `1bit serve` en el puerto 8000 y conectar clientes HTTP existentes para prototipar aplicaciones de chat con razonamiento visible vía `reasoning_content`.
- Asistentes con traza de razonamiento auditable: el campo `reasoning_content` permite separar el pensamiento del modelo de la respuesta final, útil en entornos educativos o de revisión humana.
- Evaluación de hardware AMD para IA: comparar el rendimiento real de la NPU XDNA 2 frente a GPU consumer en cargas MoE de 35B, con una referencia fp64 proporcionada por el propio motor.
- Integración en Lemonade: usar la receta `onebit` para incorporar el modelo a un catálogo de modelos locales gestionado, sin scripts de descarga ni conversión manuales.
- Prototipado de agentes y asistentes conversacionales en local: el formato de chat de Qwen y la compatibilidad con el runtime permiten iterar sobre prompts y plantillas sin depender de servicios en la nube.
- Reproducibilidad de despliegues: al ser el Q4NX byte a byte idéntico al de FastFlowLM, sirve como artefacto de referencia para verificar que una instalación del motor produce resultados consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos que aporta la model card son de sistema, no de calidad:

| Metrica | Valor | Entorno |
|---|---|---|
| Tiempo hasta estar listo | 30 s | Strix Halo (Ryzen AI Max+ 395, XDNA 2), Lemonade y `1bit serve` |
| Decodificacion | ~16 tok/s | Mismo entorno |
| Prueba cualitativa | «What is the capital of France? Answer in one word.» → `Paris`, con razonamiento en `reasoning_content` | Mismo entorno |

## Requisitos de hardware

- NPU AMD XDNA 2 obligatoria: Ryzen AI Max / Strix Halo (probado en Ryzen AI Max+ 395). No hay ruta de ejecución en GPU o CPU documentada para este repositorio.
- Memoria: el repositorio ocupa 23,2 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible para los pesos, más el espacio de trabajo del runtime.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el formato Q4NX no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Despliegue: 1bit engine compilado con `-DONEBIT_NPU=ON -DONEBIT_NPU_LAX=ON`, invocado como `1bit serve -m Qwen3.6-35B-A3B-NPU --port 8000`, o mediante Lemonade con la receta `onebit`.
- Latencia y throughput: ~16 tok/s de decodificación y 30 s de arranque en el hardware de referencia; no hay datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-NPU (este) | 35B totales, 3B activos | no disponible | Q4NX / NPU XDNA 2 | Apache-2.0 | Hugging Face, 20 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | no disponible | Safetensors / GPU y CPU | Apache-2.0 | Hugging Face (oficial) |
| FastFlowLM/Qwen3.6-35B-A3B-NPU2 | 35B totales, 3B activos | no disponible | Q4NX / NPU XDNA 2 | no disponible en la informacion proporcionada | Hugging Face |

La diferencia entre este repositorio y el de FastFlowLM es de empaquetado e integración: los pesos Q4NX son idénticos, y este añade la distribución orientada al 1bit engine y a Lemonade. Frente al modelo base, la diferencia es de cuantización y plataforma: el original se sirve en safetensors para GPU, mientras que este solo funciona en NPU XDNA 2. No se dispone de datos de benchmarks que permitan comparar calidad entre las tres variantes.

## Limitaciones y advertencias

- Dependencia total de hardware y software: requiere una NPU AMD XDNA 2 y el 1bit engine compilado con las opciones NPU; no es ejecutable en GPU NVIDIA, CPU genérica ni en runtimes estándar.
- Formato no estándar: Q4NX no es interoperable con el ecosistema safetensors/GGUF, lo que limita la portabilidad y las herramientas de inspección.
- Pérdida de calidad por cuantización de 4 bits: no se publican evaluaciones de calidad frente al modelo en fp16 o bf16, por lo que el impacto de la cuantización es desconocido.
- Documentación incompleta: la model card no indica contexto máximo, idiomas, sesgos conocidos ni datos de entrenamiento; esa información debe obtenerse del modelo base.
- Riesgo de alucinación: inherente al modelo base y no evaluado en esta distribución; el modo de razonamiento visible no garantiza corrección factual.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite a la licencia del modelo Qwen original; conviene verificar los términos del modelo base antes de producción.
- Madurez baja: 20 descargas y 0 likes en el momento de la consulta, creado en septiembre de 2026 y actualizado en noviembre de 2026; no hay evidencia de uso en producción.
- Los kernels no están incluidos en el repositorio: se compilan desde OpenFlowLM-Next, lo que introduce una dependencia externa en la cadena de suministro del binario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3.6-35B-A3B-NPU
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Empaquetado Q4NX de origen: https://huggingface.co/FastFlowLM/Qwen3.6-35B-A3B-NPU2
- Repositorio FastFlowLM: https://github.com/ROCm/FastFlowLM
- Kernels abiertos (MIT): https://github.com/bong-water-water-bong/OpenFlowLM-Next
- 1bit engine: https://1bit.gg
- Familia de modelos del autor: https://huggingface.co/1bit-MONSTER#families
