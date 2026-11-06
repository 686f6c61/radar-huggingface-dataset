# amd/gemma-3-4b_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/gemma-3-4b_rai_1.9.0_m_1.0.1_npu` es una distribucion del modelo Gemma 3 de 4 mil millones de parametros, publicada por AMD en Hugging Face y optimizada para ejecutarse en la NPU (unidad de procesamiento neuronal) de los procesadores AMD Ryzen AI mediante el stack Ryzen AI (RAI). El identificador indica que se trata de una compilacion ONNX preparada para la version 1.9.0 del runtime Ryzen AI y la version 1.0.1 del modelo de despliegue en NPU. No es un modelo entrenado desde cero por AMD, sino una adaptacion del Gemma 3 4B de Google para inferencia acelerada en hardware de PC con IA integrada.

La relevancia de esta ficha radica en que ejemplifica la tendencia de llevar modelos generativos de tamano medio a NPUs de consumo, donde el consumo energetico y la latencia son criticos. Al estar en formato ONNX y dirigido a Ryzen AI, el modelo no se ejecuta con los runners habituales (llama.cpp, vLLM) sino con el toolchain especifico de AMD, lo que condiciona tanto el despliegue como el rendimiento.

La informacion publica disponible es muy limitada: el repositorio tiene un unico tag de idioma (`en`), apenas una descarga y ningun like, y el acceso esta restringido (gated). Por tanto, muchas especificaciones se marcan como "no disponible" cuando no pueden confirmarse a partir de los metadatos del repositorio o de la documentacion oficial de Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), compilado a ONNX para NPU Ryzen AI |
| Parametros totales | 4 mil millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio (Gemma 3 4B soporta contextos largos, pero la configuracion exacta de esta compilacion no se especifica) |
| Tipos de cuantizacion | no disponible (el tag `m_1.0.1_npu` sugiere un formato empaquetado para NPU, no cuantizaciones estandar como GGUF Q4_K_M) |
| Idiomas soportados | en (ingles, segun el tag del repositorio) |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | ONNX (tag `onnx`), empaquetado para Ryzen AI NPU |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 4B, un transformer decoder-only desarrollado por Google DeepMind. Esta distribucion de AMD no aporta informacion sobre el entrenamiento original: no se documentan en el repositorio el numero de tokens, la composicion del dataset ni las fases de alineacion (RLHF/DPO). Se asume que conserva las caracteristicas del Gemma 3 4B original, pero no hay datos verificables en la informacion proporcionada.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el despliegue: el modelo se ha convertido a ONNX y empaquetado para el runtime Ryzen AI 1.9.0, con un artefacto de modelo `m_1.0.1_npu` orientado a la NPU integrada en los procesadores AMD Ryzen AI. Esto implica grafo estatico, operadores compatibles con la NPU y posible cuantizacion interna no documentada. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones especificas de esta compilacion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3 4B.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Generacion de codigo y matematicas a nivel de modelo de 4B (sin datos de benchmark especificos de esta compilacion).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el repositorio solo declara `en`; no se confirma soporte de otros idiomas en esta distribucion.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en PC con Ryzen AI: el modelo puede ejecutarse en la NPU del procesador para tareas de chat y resumen sin depender de la GPU, reduciendo consumo energetico en portatiles y equipos de sobremesa con esta plataforma.
- Procesamiento de texto en el borde (edge computing): al ser un artefacto ONNX para NPU, encaja en escenarios donde no hay GPU dedicada y se busca inferencia de baja potencia, como estaciones de trabajo con Ryzen AI.
- Prototipado de aplicaciones de IA generativa en Windows: integrable mediante el stack Ryzen AI para validar flujos de texto antes de pasar a modelos mayores o a la nube.
- Generacion de borradores y resumen de documentos en ingles: adecuado para tareas de productividad ofimatica donde la latencia importa mas que la profundidad de razonamiento.
- Filtrado y clasificacion de texto en pipelines locales: un modelo de 4B puede usarse para etiquetado, extraccion de entidades simples o moderacion preliminar en ingles.
- Demostraciones y evaluacion de hardware: util para comparar el rendimiento de la NPU Ryzen AI frente a CPU y GPU en cargas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI compatibles con el runtime Ryzen AI 1.9.0.
- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecutarse en NPU, no en GPU dedicada.
- GPU recomendadas: no aplica para esta compilacion; el artefacto es especifico de NPU Ryzen AI.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX empaquetado para NPU no es directamente utilizable en CUDA.
- Opciones de despliegue: stack Ryzen AI (runtime 1.9.0) con el modelo `m_1.0.1_npu`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/gemma-3-4b_rai_1.9.0_m_1.0.1_npu | 4B (aprox.) | no disponible | ONNX para NPU Ryzen AI | Gemma | Gated en Hugging Face |
| Gemma 3 4B (Google) | 4B | no disponible en esta ficha | safetensors, GGUF, etc. | Gemma | Publico en Hugging Face |
| Modelos ONNX para NPU de otros fabricantes | no disponible | no disponible | ONNX para NPU | variable | variable |

La comparativa directa con alternativas de la misma categoria (modelos de 4B para inferencia en el borde) no puede completarse con datos verificables en la informacion proporcionada. La diferencia principal frente al Gemma 3 4B original es el empaquetado ONNX para NPU y el runtime Ryzen AI, no el modelo en si.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el uso inmediato.
- Idioma: solo se declara ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- Dependencia de hardware: el artefacto esta atado a la NPU Ryzen AI y al runtime 1.9.0; no es portable a GPU NVIDIA, Apple Silicon ni CPU generica sin reconversion.
- Falta de documentacion: no hay informacion publica sobre cuantizacion, contexto efectivo, benchmarks ni condiciones de uso comercial mas alla de la licencia Gemma.
- Riesgo de alucinacion: inherente a los modelos de 4B; no se han publicado evaluaciones de fidelidad para esta compilacion.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del Gemma 3 4B original.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso (incluida la politica de uso aceptable de Google); debe revisarse antes de un despliegue comercial.
- Caveat de produccion: al ser una publicacion con una unica descarga y sin mantenimiento visible, no se recomienda como dependencia critica sin validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/amd/gemma-3-4b_rai_1.9.0_m_1.0.1_npu
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada
- Paper de Gemma 3: no disponible en la informacion proporcionada
- Repositorio o blog de AMD sobre el modelo: no disponible en la informacion proporcionada
