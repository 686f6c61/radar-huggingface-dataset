# QuantaPlanta/Gemma-4-Irrlicht-Untied-26B-A4B-GGUF

## Resumen

Gemma-4-Irrlicht-Untied-26B-A4B-GGUF es una publicacion de pesos en formato GGUF alojada por el usuario QuantaPlanta en Hugging Face, derivada de un modelo base de la familia Gemma 4 con arquitectura de mezcla de expertos (MoE). El nombre indica 26B parametros totales y A4B (aproximadamente 4 mil millones de parametros activos por token), y el dato real de safetensors registrado en el repositorio confirma 25.971.339.550 parametros totales. El sufijo "Irrlicht-Untied" sugiere una variante o merge no oficial, aunque no se dispone de documentacion que lo confirme.

El repositorio tiene un tamano de 221,5 GB, coherente con multiples niveles de cuantizacion GGUF de un modelo de ~26B parametros. La ficha de Hugging Face no incluye pipeline declarado, licencia, idiomas ni resultados de evaluacion, y el acceso esta restringido (gated), por lo que es necesario aceptar condiciones en la plataforma antes de descargar los pesos.

Su relevancia es limitada y practica: se trata de una conversion GGUF orientada a inferencia local y a endpoints compatibles, no de un lanzamiento oficial con model card tecnica. Cualquier evaluacion rigurosa exige verificar la procedencia del modelo base y la licencia aplicable antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun la denominacion A4B; detalles no disponibles |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4B (inferido de la etiqueta A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles; el repo de 221,5 GB sugiere multiples variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La unica informacion estructural disponible proviene del nombre del repositorio: se trata de un modelo de la familia Gemma 4 con arquitectura MoE, con aproximadamente 26B parametros totales y unos 4B activos por token (patron A4B). No se ha publicado en la informacion disponible el numero de expertos, el mecanismo de enrutamiento, la dimension oculta, el numero de capas ni la ventana de atencion.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), ni sobre fases de alineacion como RLHF, DPO o instruction tuning. El sufijo "Irrlicht-Untied" apunta a una modificacion o merge comunitario sobre el modelo base, pero no se documenta el proceso. No se dispone de informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica uso previsto para dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades esperables en la familia Gemma 4, pero no verificadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` indica compatibilidad con infraestructura de inferencia tipo endpoint.

## Casos de uso

- Prototipado local de asistentes conversacionales: al distribuirse en GGUF, puede cargarse en runtimes de inferencia local para validar flujos de dialogo antes de invertir en infraestructura GPU, aunque el rendimiento real debe medirse.
- Evaluacion comparativa de variantes comunitarias: util para investigadores que quieran contrastar merges no oficiales frente al modelo base oficial, siempre que se verifique la procedencia.
- Pruebas de inferencia con cuantizacion: el repositorio de 221,5 GB permite experimentar con distintos niveles GGUF para estudiar el compromiso entre calidad y memoria, si bien los niveles concretos no estan documentados.
- Integracion en pipelines de endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia estandar, adecuado para pruebas de integracion internas.
- Experimentacion academica con arquitecturas MoE: permite estudiar el comportamiento de un MoE de ~26B con ~4B activos en entornos con recursos limitados, sujeto a validacion empirica.
- Despliegue en estaciones de trabajo con GPU consumer: la activacion parcial (~4B) reduce los requisitos de computo frente a un modelo denso de 26B, lo que facilita pruebas en hardware de gama alta consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de ~26B en GGUF requiere tipicamente entre 16 y 24 GB en cuantizaciones de 4-5 bits, pero esta cifra no esta confirmada para este repositorio.
- GPU recomendadas: no disponibles. Por tamano, serian plausibles GPUs con 24 GB o mas (RTX 4090, A100 40/80 GB, H100) en funcion de la cuantizacion elegida.
- GPU consumer: probablemente viable en RTX 3090/4090 con cuantizaciones bajas, sujeto a verificacion; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere soporte en infraestructura de endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-Irrlicht-Untied-26B-A4B-GGUF | ~26B | ~4B (inferido) | no disponible | no disponible | GGUF |
| Modelo base Gemma 4 (oficial) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras variantes comunitarias GGUF de Gemma 4 | no disponible | no disponible | no disponible | no disponible | GGUF |

No se dispone de datos de rendimiento ni de especificaciones del modelo base oficial en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Procedencia no verificada: el sufijo "Irrlicht-Untied" indica una modificacion comunitaria sin documentacion del proceso de merge o fine-tuning.
- Licencia no declarada: al no figurar licencia y tratarse de un repositorio gated, el uso comercial es incierto y requiere revision legal previa.
- Ausencia de model card tecnica: no hay datos de contexto, idiomas, entrenamiento ni evaluacion, lo que impide garantizar comportamiento en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks no puede acotarse su magnitud.
- Sesgos desconocidos: no se documenta el corpus de entrenamiento ni procesos de alineacion.
- Idiomas no declarados: no puede asumirse soporte multilingue sin verificacion empirica.
- Repositorio con 0 descargas: sin validacion por parte de la comunidad, lo que aumenta el riesgo de artefactos defectuosos o conversiones erroneas.

## Enlaces

- Hugging Face: https://huggingface.co/QuantaPlanta/Gemma-4-Irrlicht-Untied-26B-A4B-GGUF
