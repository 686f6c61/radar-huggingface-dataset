# ramithuh/sid-protein-webgpu

## Resumen

SiD-Protein (Distilled 16-Step Sampler) en su variante WebGPU es un conjunto de pesos derivados del modelo upstream SiD-Protein, un modelo de difusion destilado mediante Score Identity Distillation entrenado sobre el conjunto de datos Proteina. Esta publicacion concreta, alojada por el usuario ramithuh, no contiene el modelo completo en un unico fichero, sino un export fragmentado en safetensors FP16 e INT8 con shards de 25 MB o menos, acompanados de manifiestos SHA-256, disenado especificamente para inferencia en navegador mediante WebGPU.

El objetivo del artefacto es permitir ejecutar el sampler de 16 pasos del modelo de difusion de proteinas directamente en el cliente, sin backend de GPU dedicado, dentro del ecosistema denovo.run y del repositorio denovo-webgpu-models. Se trata, por tanto, de un artefacto de despliegue orientado a portabilidad y reproducibilidad (de ahi los manifiestos de integridad por shard) mas que de un modelo con model card completa y evaluacion publica.

La informacion disponible es muy limitada: el repositorio ocupa 0,6 GB, no declara pipeline, idiomas ni licencia concreta (remite a ficheros LICENSE_SID, LICENSE_PROTEINA, LICENSE_BOOST y NOTICE), y no incluye resultados de benchmarks en la model card accesible. Cualquier dato de arquitectura detallada, numero de parametros o rendimiento debe considerarse no disponible a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion con sampler destilado de 16 pasos (Score Identity Distillation); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 e INT8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (remite a LICENSE_SID, LICENSE_PROTEINA, LICENSE_BOOST y NOTICE) |
| Formato de pesos | safetensors fragmentados en shards de <= 25 MB con manifiestos SHA-256 |

## Arquitectura y entrenamiento

El modelo upstream se describe como SiD-Protein, un modelo de difusion para proteinas entrenado con Score Identity Distillation sobre el dataset Proteina. La destilacion reduce el sampler a 16 pasos, lo que disminuye el coste de inferencia frente a un muestreo de difusion completo. No se proporcionan en la informacion disponible detalles sobre el backbone (tipo de red, dimensiones, numero de capas), el volumen de tokens o estructuras de entrenamiento, la composicion del dataset Proteina ni si se aplicaron etapas de RLHF o DPO.

La innovacion destacable de esta publicacion es el formato de export: pesos divididos en shards pequenos (<= 25 MB) en FP16 e INT8, con manifiestos SHA-256 para verificar integridad, pensados para carga incremental y ejecucion en WebGPU dentro del navegador. La model card remite a README_WEBGPU.md para la arquitectura, los benchmarks de paridad numerica y el uso, pero ese contenido no esta incluido en la informacion proporcionada.

## Capacidades

- Generacion de muestras de proteinas mediante un sampler de difusion destilado de 16 pasos.
- Inferencia en navegador mediante WebGPU, sin necesidad de servidor GPU.
- Carga por shards con verificacion de integridad mediante manifiestos SHA-256.
- Ejecucion en dos precisiones: FP16 e INT8.
- Integracion con el ecosistema denovo.run y el repositorio denovo-webgpu-models.
- Generacion de texto, razonamiento, codigo, vision, audio, tool calling y soporte de agentes: no disponible (no se indican estas capacidades para este artefacto).

## Casos de uso

- Diseno de proteinas en el navegador: el sampler de 16 pasos permite generar candidatos de proteinas directamente en el cliente mediante WebGPU, sin enviar datos a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Demostraciones interactivas de difusion para proteinas: al ejecutarse en el navegador con shards pequenos, se puede integrar en una web educativa o de investigacion para mostrar el proceso de muestreo en tiempo real.
- Prototipado rapido sin infraestructura GPU: investigadores sin acceso a GPUs dedicadas pueden probar el modelo en un portatil con WebGPU habilitado.
- Validacion de pipelines de export: los manifiestos SHA-256 y la fragmentacion permiten verificar la integridad de los pesos en pipelines de CI antes de desplegarlos.
- Integracion en denovo.run: el artefacto esta pensado para alimentar la aplicacion denovo.run, de modo que sirve como componente de generacion dentro de esa plataforma.
- Evaluacion comparativa de cuantizacion: al ofrecer FP16 e INT8, permite medir en el navegador el impacto de la cuantizacion en la calidad de las muestras generadas.
- Reproducibilidad de experimentos: la fragmentacion con hashes facilita replicar exactamente los mismos pesos en distintos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona benchmarks de paridad numerica en README_WEBGPU.md, pero su contenido no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0,6 GB, por lo que la huella de pesos es del orden de cientos de MB segun la precision (FP16 o INT8).
- GPU recomendadas: no disponibles; el requisito funcional es soporte de WebGPU en el navegador.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del artefacto (0,6 GB) y el diseno para WebGPU, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: navegador con WebGPU; integracion con denovo.run y denovo-webgpu-models. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de generacion de proteinas.

## Limitaciones y advertencias

- La model card es minima: no declara pipeline, idiomas ni parametros, lo que dificulta evaluar el modelo sin consultar documentacion externa.
- La licencia no esta disponible de forma directa; el uso comercial depende de los terminos de LICENSE_SID, LICENSE_PROTEINA, LICENSE_BOOST y NOTICE, que deben revisarse antes de cualquier despliegue.
- Es un artefacto de export para WebGPU, no el modelo upstream completo; puede no ser adecuado para entrenamiento o fine-tuning.
- No hay benchmarks publicados en la informacion disponible, por lo que no se puede verificar la calidad de las muestras ni la paridad numerica frente al modelo original.
- La cuantizacion INT8 puede introducir degradacion en la calidad de las muestras; no se documenta su impacto.
- El soporte de WebGPU varia segun navegador y sistema operativo, lo que limita la portabilidad real.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto para este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/sid-protein-webgpu
- Repositorio de modelos WebGPU: https://github.com/ramithuh/denovo-webgpu-models
- Aplicacion denovo.run: https://denovo.run
