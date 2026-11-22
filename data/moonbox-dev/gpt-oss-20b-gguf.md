# moonbox-dev/gpt-oss-20b-GGUF

## Resumen

`moonbox-dev/gpt-oss-20b-GGUF` es una conversion a formato GGUF del modelo `openai/gpt-oss-20b`, publicada por Moonbox para su uso con llama.cpp en Metal, CUDA, Vulkan y CPU. No se trata de una cuantizacion nueva: el repositorio contiene un unico fichero que preserva exactamente la precision original del checkpoint de OpenAI, con los 32 expertos en MXFP4 (4 bits con microscaling) y el resto de tensores en BF16. El objetivo es ofrecer una build lista para inferencia local sin degradar los pesos.

El modelo base es `gpt-oss-20b`, un transformer de tipo mixture-of-experts (MoE) con 20.914.757.184 parametros totales y 3.6B parametros activos por token, disenado por OpenAI para razonamiento, tareas agenticas y casos de uso locales o especializados. Emplea el formato de respuesta harmony, con modos de razonamiento configurables (low, medium, high) y cadena de pensamiento completa accesible.

Su relevancia radica en que permite ejecutar un modelo MoE de 21B en un entorno de 16 GB de memoria, manteniendo la licencia Apache 2.0 del original y compatibilidad con endpoints OpenAI a traves de `llama-server --jinja`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) |
| Parametros totales | 20.914.757.184 (21B) |
| Parametros activos | 3.6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos) + BF16 (resto); unica build |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero de 13,79 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con 32 capas MoE. Los pesos de los expertos residen en MXFP4 (4 bits con microscaling) ya desde el checkpoint original de OpenAI, mientras que atencion, router, embeddings y head se mantienen en BF16. La build de Moonbox no recuantiza: repackea los pesos MXFP4 en bloques MXFP4 de ggml y conserva el resto en BF16, de modo que los 339 tensores no-expertos son byte-identicos al original y los 120 tensores expertos MXFP4 desquantizan a exactamente los mismos valores.

El entrenamiento original incluye post-entrenamiento con cuantizacion MXFP4 de los pesos MoE, y el modelo fue entrenado con el formato harmony de OpenAI, que debe aplicarse de forma obligatoria. No se dispone en la informacion proporcionada de detalles sobre numero de tokens, composicion del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento con cadena de pensamiento completa.
- Razonamiento configurable en tres niveles de esfuerzo (low, medium, high) para ajustar latencia.
- Function calling nativo y soporte de agentes.
- Navegacion web y ejecucion de codigo Python mediante herramientas externas.
- Structured Outputs (salidas estructuradas).
- Formato harmony con retorno del razonamiento en el campo `reasoning_content` de `llama-server`.
- Capacidad de fine-tuning sobre el modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente local en estacion de trabajo: con 13,79 GB de fichero y un consumo que cabe en 16 GB de memoria, puede desplegarse en un portatil o equipo de sobremesa con GPU consumer y usarse como asistente conversacional sin conexion.
- Razonamiento con esfuerzo ajustable: en tareas de clasificacion o extraccion puede fijarse el modo low para reducir latencia; en problemas complejos de matematicas o planificacion, el modo high explota la cadena de pensamiento completa.
- Automatizacion agentica con tool calling: el modelo puede invocar funciones y ejecutar codigo Python en pipelines propios, integrándose mediante el endpoint `/v1/chat/completions` de `llama-server`.
- Desarrollo e integracion en CI/CD: al ser compatible con endpoints OpenAI, puede sustituir a APIs remotas en tests de integracion y entornos de staging sin coste por token.
- Despliegue en CPU o aceleradores variados: la build GGUF funciona en Metal, CUDA, Vulkan y CPU, lo que permite servir el modelo en hardware heterogeneo con llama.cpp.
- Prototipado de agentes con navegacion web: combinado con las herramientas de browsing del repositorio oficial, sirve para construir asistentes que consultan informacion externa y razonan sobre ella.
- Experimentacion academica: la licencia Apache 2.0 y la cadena de pensamiento visible facilitan la investigacion sobre razonamiento y depuracion de salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion aportado por el autor es la perplejidad en WikiText-2 test (40 fragmentos de 512 tokens): 168,6 para el modelo chat. El autor senala que este valor es alto por la naturaleza conversacional del modelo, no por un defecto de la conversion.

## Requisitos de hardware

- VRAM estimada: el modelo cabe en 16 GB de memoria; el fichero pesa 13,79 GB.
- En GPU de 16 GB puede ser necesario descargar capas a CPU con `-ngl 12` o usar `--n-cpu-moe`.
- GPU recomendadas: no especificadas en la informacion; el modelo base esta pensado para ejecucion local y el modelo mayor de la familia (120b) apunta a H100 o MI300X.
- Cabe en GPU consumer de 16 GB o superior con offload parcial; en equipos con menos memoria, el offload a CPU via `--n-cpu-moe` es la via soportada.
- Opciones de despliegue: llama.cpp (`llama-server`) version b12621 o superior, con `--jinja` para el chat template harmony; tambien Transformers sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b (esta build GGUF) | 21B | 3.6B | no disponible | Apache 2.0 | GGUF en HF |
| gpt-oss-120b | 117B | 5.1B | no disponible | Apache 2.0 | HF (OpenAI) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable documentado en la informacion es `gpt-oss-120b`, la variante mayor de la misma familia, orientada a produccion y razonamiento de alta exigencia en una sola GPU de 80 GB.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato harmony; usarlo con otro template produce salidas incorrectas.
- La cadena de pensamiento no esta pensada para mostrarse al usuario final.
- Solo existe una build MXFP4; no hay variantes Q8_0, Q6_K, Q5_K_M, Q4_K_M, F16 ni BF16, por lo que no puede reducirse mas el tamano ni compararse con otras precisiones.
- La perplejidad en WikiText-2 es elevada (168,6) por el caracter conversacional del modelo; no debe interpretarse como metrica de calidad en tareas de lenguaje general.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Idiomas soportados: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el fichero es un derivado del modelo original y queda sujeto a su licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente (22 de noviembre de 2026) sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/gpt-oss-20b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor: https://huggingface.co/openai/gpt-oss-120b
- Model card (paper): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Guias: https://cookbook.openai.com/topic/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Repositorio oficial: https://github.com/openai/gpt-oss
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Web oficial: https://gpt-oss.com
