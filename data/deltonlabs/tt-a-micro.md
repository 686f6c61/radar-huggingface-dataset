# DeltonLabs/TT-A-Micro

## Resumen

TT-A-Micro es un modelo de lenguaje de muy pequeno tamano desarrollado por DeltonLabs, publicado en Hugging Face bajo licencia Apache 2.0. Con tan solo 3.437.749 parametros totales (aproximadamente 3,4 millones), se situa en la categoria de modelos ultra-ligeros, muy por debajo de los modelos convencionales de miles de millones de parametros. El repositorio incluye pesos en formato safetensors y requiere codigo personalizado (`custom_code`), lo que indica que su arquitectura no es la de un transformer estandar soportado de forma nativa por las librerias habituales.

El modelo ha sido entrenado sobre una mezcla de datasets de alta calidad orientados a texto educativo y de dominio publico, entre los que se incluyen DCLM (baseline y una version filtrada de alta calidad), FineWeb-Edu, TxT360-v2, MGA-FineWeb-Edu, CoreWiki, DOAB filtrado y Cosmopedia. Esta seleccion de corpus sugiere un enfasis en contenido educativo, enciclopedico y de libros de acceso abierto, tipico de modelos pequenos orientados a experimentacion con destilacion o entrenamiento eficiente.

La relevancia de TT-A-Micro es principalmente experimental: por su tamano reducido puede ejecutarse en practicamente cualquier hardware, incluidos dispositivos de gama baja o entornos embebidos, y sirve como banco de pruebas para investigacion sobre entrenamiento de modelos de lenguaje a muy pequeña escala. No obstante, la informacion publica disponible es muy escasa: no se documentan arquitectura, contexto, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (requiere `custom_code`; no se especifica el tipo) |
| Parametros totales | 3.437.749 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo personalizado) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. La presencia de la etiqueta `custom_code` en el repositorio indica que la implementacion requiere codigo especifico del autor y que probablemente no se trata de un transformer decoder-only convencional compatible con `transformers` sin configuracion adicional. Tampoco se documentan el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea tecnicas como atencion lineal o arquitecturas hibridas.

En cuanto al entrenamiento, la model card unicamente lista los datasets utilizados: DeltonLabs/DCLM-Filtered-HQ, mlfoundations/dclm-baseline-1.0, HuggingFaceFW/fineweb-edu, IFM/TxT360-v2, ByteDance-Seed/mga-fineweb-edu, DeltonLabs/CoreWiki, common-pile/doab_filtered y HuggingFaceTB/cosmopedia. No se especifica el numero de tokens de entrenamiento, la composicion exacta de la mezcla, ni si se aplicaron fases de ajuste como SFT, RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto basica: al ser un modelo de lenguaje, se presupone capacidad de continuacion y generacion de texto, aunque no se documenta su calidad.
- Razonamiento y matematicas: no disponible; no hay evidencia publicada de rendimiento en estas tareas.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ejecucion en hardware muy limitado: por su tamano de 3,4 millones de parametros, es viable en CPU y dispositivos con memoria muy reducida.

## Casos de uso

- Experimentacion academica con modelos de muy pequena escala: TT-A-Micro permite estudiar el comportamiento de modelos de lenguaje minimos, analizar curvas de escalado o probar tecnicas de entrenamiento sin requerir infraestructura de GPU significativa.
- Pruebas de pipelines de inferencia: su tamano permite validar integraciones con frameworks de despliegue, tokenizadores y sistemas de evaluacion antes de escalar a modelos mayores.
- Educacion y docencia: sirve para ilustrar el funcionamiento interno de un modelo de lenguaje en cursos, ya que puede cargarse y ejecutarse en un portatil convencional.
- Prototipado rapido de aplicaciones de texto: util para maquetar interfaces o flujos de generacion de texto donde la calidad del contenido no sea critica y prime la velocidad de iteracion.
- Entornos con recursos extremadamente limitados: su huella de memoria (unos pocos megabytes en fp32) lo hace apto para dispositivos embebidos o sistemas sin GPU, siempre que se acepte una calidad de generacion muy limitada.
- Base para destilacion o fine-tuning ligero: puede servir como punto de partida para experimentos de ajuste con datasets pequenos y especificos, dada su licencia permisiva Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoria de precisiones. Con 3,4 millones de parametros, los pesos ocupan aproximadamente 13,7 MB en fp32, 6,9 MB en fp16 y 3,4 MB en int8.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo puede ejecutarse en CPU sin problema. GPU como RTX 4090, A100 o H100 no aportan ventaja practica por el cuello de botella de tamano.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en iGPU y CPU.
- Opciones de despliegue: al requerir `custom_code`, es probable que necesite cargarse con `trust_remote_code=True` en `transformers`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF hace improbable el uso directo en llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TT-A-Micro (DeltonLabs) | 3,4 M | no disponible | Apache 2.0 | Hugging Face, requiere custom_code |
| SmolLM-135M (Hugging Face) | 135 M | 2.048 tokens | Apache 2.0 | Hugging Face, transformers nativo |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face, amplio ecosistema |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face, transformers nativo |

TT-A-Micro es entre uno y dos ordenes de magnitud menor que las alternativas ultra-ligeras mas conocidas. No se dispone de datos de rendimiento para comparar calidad; la comparativa se limita a parametros, contexto y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre corpus web filtrados (DCLM, FineWeb-Edu, Cosmopedia) es probable que herede sesgos presentes en esos datos.
- Riesgo de alucinacion: muy alto por su capacidad limitada; con 3,4 millones de parametros la coherencia y factualidad seran muy reducidas.
- Limitaciones de contexto e idioma: no se especifican; se desconoce la ventana de contexto y los idiomas cubiertos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el codigo personalizado y su procedencia debe verificarse antes de integrarlo en produccion.
- Caveat de produccion: la necesidad de `custom_code` implica dependencia de codigo del autor no auditado; conviene revisar el repositorio antes de ejecutarlo con `trust_remote_code=True`.
- Escasa documentacion: la model card no aporta informacion sobre tokenizador, formato de prompt, ni procedimiento de inferencia, lo que dificulta su uso fuera de experimentacion.
- Fecha de publicacion: el repositorio figura creado en octubre de 2026, dato que conviene contrastar por si se trata de metadatos anomalos.

## Enlaces

- Hugging Face: https://huggingface.co/DeltonLabs/TT-A-Micro
- Dataset DCLM-Filtered-HQ: https://huggingface.co/datasets/DeltonLabs/DCLM-Filtered-HQ
- Dataset DCLM baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TxT360-v2: https://huggingface.co/datasets/IFM/TxT360-v2
- Dataset MGA-FineWeb-Edu: https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu
- Dataset CoreWiki: https://huggingface.co/datasets/DeltonLabs/CoreWiki
- Dataset DOAB filtrado: https://huggingface.co/datasets/common-pile/doab_filtered
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
