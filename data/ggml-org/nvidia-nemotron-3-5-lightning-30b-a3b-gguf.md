# ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por NVIDIA, distribuido en formato GGUF por el equipo de ggml-org para su uso con llama.cpp y el ecosistema de inferencia local. Con 31.577.940.288 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B), esta disenado para ofrecer un equilibrio entre capacidad y eficiencia computacional: activa solo una fraccion de sus expertos en cada paso de decodificacion, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano.

Este repositorio concreto es una conversion automatica del modelo original en BF16 (nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16) a formato GGUF, con el objetivo de facilitar su ejecucion en hardware consumer y en entornos de CPU/GPU mixtos mediante llama.cpp. La popularidad del repositorio (mas de 218.000 descargas) refleja el interes de la comunidad por disponer de alternativas cuantizadas de modelos MoE de gran tamano que puedan correr fuera de infraestructura de datacenter.

La relevancia actual del modelo radica en su combinacion de arquitectura MoE con un formato de pesos ampliamente soportado (GGUF), lo que permite desplegarlo en estaciones de trabajo con GPU de gama alta o incluso en configuraciones multi-GPU consumer, algo impracticable con el checkpoint BF16 original de 394,9 GB. La licencia es "other", lo que obliga a revisar los terminos especificos de NVIDIA antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer (detalles de capas y atencion no disponibles) |
| Parametros totales | 31.577.940.288 (~31,6 B) |
| Parametros activos | ~3 B (sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos de NVIDIA; revisar antes de uso comercial) |
| Formato de pesos | GGUF (repo de 394,9 GB con multiples ficheros) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts, segun se deduce del nombre (30B-A3B) y de la estructura del checkpoint base. En un MoE de este tipo, cada token activa un subconjunto reducido de expertos (en este caso, aproximadamente 3.000 millones de parametros activos de un total de 31,6 mil millones), lo que permite mantener un coste de computo por token similar al de un modelo denso de 3B mientras se preserva la capacidad representacional de un modelo de 30B. Los detalles concretos sobre numero de expertos, estrategia de enrutamiento (top-k), tipo de atencion (completa, lineal o hibrida) y dimensiones de las capas no estan disponibles en la informacion proporcionada.

Respecto al entrenamiento, no se dispone de datos sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion supervisada. La model card del repositorio GGUF es minima y se limita a indicar que se trata de una conversion automatica mediante la herramienta ggml-org/convert del checkpoint BF16 original de NVIDIA. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) mas alla de la propia naturaleza MoE del modelo.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican soporte para dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades esperables en un modelo de la familia Nemotron, aunque no se detallan explicitamente en la informacion disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs compatibles con el formato de inferencia estandar.
- Ejecucion local: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otras herramientas del ecosistema ggml.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no estan listados).
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU consumer: gracias a la cuantizacion GGUF y a los ~3B parametros activos, el modelo puede ejecutarse en configuraciones con 1-2 GPU de gama alta (por ejemplo, RTX 4090 o RTX 5090) usando llama.cpp, algo inviable con el checkpoint BF16 de 394,9 GB.
- Asistentes conversacionales locales: el tag `conversational` y el pipeline `text-generation` lo hacen adecuado para chatbots de escritorio o integrados en aplicaciones de productividad que requieran privacidad total, sin enviar datos a la nube.
- Prototipado rapido de aplicaciones LLM: la posibilidad de lanzarlo con `llama serve -hf ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF` permite a desarrolladores probar prompts y flujos sin gestionar infraestructura compleja.
- Investigacion en eficiencia de modelos MoE: su condicion de MoE cuantizado de ~31,6B totales con ~3B activos lo convierte en un banco de pruebas para estudiar el trade-off entre calidad y coste computacional en entornos de recursos limitados.
- Generacion de codigo en entornos offline: para equipos que trabajan en redes aisladas o con requisitos de confidencialidad, el modelo puede servir como asistente de programacion local mediante integraciones con editores compatibles con llama.cpp.
- Fine-tuning y experimentacion con adaptadores: aunque el repo es GGUF (no ideal para entrenamiento), el modelo base BF16 de NVIDIA puede usarse para ajuste fino y luego convertirse a GGUF para despliegue, cubriendo el ciclo completo de personalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no detallarse las variantes de cuantizacion. Como referencia, un modelo MoE de ~31,6B parametros totales requiere cargar todos los pesos en memoria; en cuantizaciones de 4 bits esto supone del orden de 16-20 GB, y en 8 bits del orden de 30-35 GB, aunque estas cifras son estimaciones generales y no datos confirmados para este modelo concreto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el perfil del modelo, serian razonables GPU con 24 GB o mas de VRAM (RTX 4090, RTX 5090, A6000, L40S) o configuraciones multi-GPU, pero no hay confirmacion oficial.
- Compatibilidad con GPU consumer: probable en cuantizaciones agresivas y con suficientes GB de VRAM; no confirmado en la informacion disponible.
- Opciones de despliegue: llama.cpp (mediante `llama serve`), y por extension del ecosistema GGUF, herramientas como Ollama o servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que se recomienda usar el checkpoint BF16 original para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B (este) | ~31,6 B | ~3 B | no disponible | other | GGUF / BF16 |
| Modelos MoE comparables de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoria (mismo tamano o misma tarea). Se recomienda consultar la model card oficial de NVIDIA para obtener datos comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos presentes en el corpus, pero no hay confirmacion oficial.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones publicadas, no es posible estimar la tasa de alucinacion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles, lo que impide garantizar un rendimiento adecuado en lenguas distintas del ingles o en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia es "other", lo que implica que los terminos de uso (incluido el comercial) vienen definidos por NVIDIA y deben revisarse en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Conversion automatica: el repositorio GGUF ha sido generado con la herramienta ggml-org/convert sin validacion adicional documentada; pueden existir diferencias de calidad respecto al checkpoint BF16 original.
- Ausencia de datos de evaluacion: no hay benchmarks publicados en la informacion disponible, lo que dificulta comparar su rendimiento con alternativas y evaluar su idoneidad para tareas criticas.
- Tamano del repositorio: 394,9 GB en total, lo que exige planificar el almacenamiento y la descarga con cuidado; conviene descargar solo la variante de cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Variante NVFP4-DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash
- Variante NVFP4-DSpark: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Herramienta de conversion: https://github.com/ggml-org/convert
- Aplicacion Llama: https://llama.app
