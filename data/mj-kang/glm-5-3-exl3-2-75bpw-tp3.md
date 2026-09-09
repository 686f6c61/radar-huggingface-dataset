# mj-kang/GLM-5.3-EXL3-2.75bpw-TP3

## Resumen

GLM-5.3-EXL3-2.75bpw-TP3 es una cuantizacion comunitaria del modelo completo GLM-5.3 de Z.ai, creada por el usuario mj-kang. Se trata de una adaptacion del checkpoint en BF16 a una precision mixta de 2.75 bits por peso en los expertos enrutados, utilizando el formato ExLlama v3 (EXL3). El modelo es una variante MoE (Mixture of Experts) con 256 expertos enrutados y el routing top-8 oficial, que incluye una capa MTP (Multi-Token Prediction).

Esta cuantizacion no es un drop-in de las herramientas estandar: requiere un runtime personalizado, un repositorio de reproduccion y un proceso de restauracion del checkpoint debido a su particion en mas de 19 000 archivos. El modelo esta orientado a su ejecucion en el hardware NVIDIA DGX Spark, con una configuracion de tensor parallelism 3 (TP3). La relevancia de esta ficha es doble: por un lado, permite evaluar la viabilidad de ejecutar un modelo grande cuantizado en un dispositivo compacto de borde; por otro, documenta una metodologia de cuantizacion no convencional que conserva todos los expertos y el routing original del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con 256 expertos enrutados y routing top-8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens (contexto total configurado en la evaluacion registrada) |
| Tipos de cuantizacion | EXL3 (2.75 bpw, con perfiles K3 de 3 bits y K2.75 mixto de 2/3 bits) |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (otra, no es Apache ni MIT) |
| Formato de pesos | EXL3 (con checkpoint empaquetado en partes de 512 archivos; no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base, GLM-5.3 de Z.ai, es un transformer MoE que reutiliza la arquitectura de GLM-5.2 y aplica mejoras exclusivamente mediante post-entrenamiento, segun la informacion publicada por OpenLM.ai. Esta cuantizacion conserva la estructura completa: los 256 expertos enrutados y el routing top-8 oficial, incluyendo la capa MTP. La cuantizacion se ha realizado con una configuracion de precision "rotating uneven" de 768/640/640, sin padding a nivel de canales de expertos. El perfil K3 utiliza expertos enrutados de 3 bits, mientras que el perfil K2.75 mezcla 64 expertos de 2 bits y 192 expertos de 3 bits por capa enrutada. No se ha realizado ningun entrenamiento adicional: se trata de una cuantizacion posterior al entrenamiento del checkpoint sellado en BF16. Los datos de entrenamiento del modelo base no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva con soporte para tareas de codigo y razonamiento de larga duracion, segun las mejoras publicadas de GLM-5.3 sobre GLM-5.2.
- Soporte para contextos largos: en la evaluacion registrada se utilizo una ventana de 32 768 tokens y un prompt de recuperacion de 30 039 tokens.
- Capacidad de ejecucion en hardware compacto con memoria unificada gracias a la cuantizacion EXL3 y al runtime personalizado.
- No se dispone de informacion sobre soporte de tool calling, function calling, vision o audio en esta version.
- La fidelidad frente al modelo de referencia se ha medido con una divergencia KLD de 0.0485539331 nats y una concordancia top-1 del 92.6844%, aunque limitada a ventanas de calibracion.

## Casos de uso

- Inferencia local en un dispositivo NVIDIA DGX Spark: el modelo esta disenado para ejecutarse en este hardware con tensor parallelism 3, por lo que puede usarse en entornos de borde donde no se permite el acceso a la nube.
- Investigacion sobre cuantizacion de modelos MoE: la configuracion K2.75 mezcla expertos de 2 y 3 bits, lo que permite estudiar el efecto de distintas precisiones por experto en la calidad de la generacion.
- Prototipado de asistentes de codigo en entornos aislados: gracias a las mejoras en codigo complejo del modelo base, se puede probar la generacion de codigo en un entorno de desarrollo local sin dependencia de servicios externos.
- Evaluacion de la fidelidad de cuantizacion: al estar disponible el checkpoint sellado y la revision del modelo base, se puede reproducir la comparativa KLD y el acuerdo top-1 para validar la calidad de la cuantizacion.
- Generacion de documentos extensos con contexto largo: con 32 768 tokens de contexto, es util para escribir o resumir documentos tecnicos largos, siempre que se acepte el costo de la menor velocidad de decodificacion.
- Despliegue en infraestructuras homelab: el repositorio de reproduccion esta disenado para entornos de homelab existentes, por lo que puede integrarse en sistemas de investigacion personales con hardware especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la informacion disponible. La model card registra dos mediciones:

| Metrica | Valor | Contexto |
|---|---|---|
| KLD (divergencia de Kullback-Leibler) | 0.0485539331 nats | Comparacion con el modelo teacher en cuatro ventanas de calibracion |
| Acuerdo top-1 | 92.6844% | Limitado a las mismas ventanas de calibracion |
| Velocidad de decodificacion | 13.062 tok/s | Con pp2048, tg256, concurrency 1, seis ejecuciones de llama-benchy |

Estas metricas no son comparables con evaluaciones de GGUF ni con benchmarks de inteligencia general, ya que no estan homologadas entre protocolos.

## Requisitos de hardware

- Compatibilidad restringida al hardware NVIDIA DGX Spark, segun la configuracion TP3/DCP3 y el uso de memoria UVA residente.
- La configuracion de evaluacion uso FP8 KV de 1 GiB por rango y una reserva de host de 12 GiB.
- No es un checkpoint de uso general para GPU de consumo estandar: se requiere el runtime personalizado del repositorio de reproduccion.
- Opciones de despliegue: exclusivamente mediante el runtime exl3 personalizado; no es compatible con vLLM, llama.cpp, TGI ni con la implementacion estandar de Transformers o ExLlama.
- La velocidad de decodificacion registrada es de 13.062 tok/s, lo que la situa por debajo de lo esperable en sistemas con mayor potencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-2.75bpw-TP3 | no disponible | 32 768 tokens (evaluacion) | EXL3 2.75 bpw | glm-5.3 | Comunitaria, requiere runtime personalizado |
| GLM-5.3 Flash EXL3 para 2x DGX Sparks | no disponible | no disponible | EXL3 | glm-5.3 | Comunitaria, para 2 DGX Spark |
| GLM-5.3 BF16 (modelo base) | no disponible | 32 768 tokens segun configuracion | sin cuantizar (BF16) | glm-5.3 | Oficial de Z.ai |

La comparacion directa con otras cuantizaciones de GLM-5.3 es limitada porque los datos de parametros y contexto no se han publicado en esta informacion.

## Limitaciones y advertencias

- Requiere un runtime personalizado que no se incluye en el repositorio de HuggingFace; el proyecto es una reproduccion para homelab existente, no un instalador para maquinas limpias.
- El checkpoint esta empaquetado en mas de 19 000 archivos dentro de `checkpoint/part-NNNN/` y necesita un proceso de restauracion con verificacion SHA256 antes de poder utilizarse.
- La cuantizacion introduce una perdida medida: KLD de 0.0486 nats y acuerdo top-1 del 92.68%, lo que implica que no es una cuantizacion lossless.
- Los benchmarks de la model card son limitados a ventanas de calibracion y no son comparables con evaluaciones estandarizadas de inteligencia.
- La licencia glm-5.3 no es MIT ni Apache; se deben revisar las restricciones de uso comercial antes de cualquier despliegue productivo.
- No se han publicado los idiomas soportados ni informacion sobre sesgos, alucinaciones o limitaciones de contexto mas alla de la configuracion de evaluacion.
- El estado de subida es incompleto: solo se puede considerar utilizable si existe el marcador `UPLOAD_COMPLETE.json` en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mj-kang/GLM-5.3-EXL3-2.75bpw-TP3
- Repositorio de reproduccion: https://github.com/mjkang-estrella/glm53-full-exl3-tp3
- Informacion general de GLM-5.3: https://openlm.ai/glm-5.3/
