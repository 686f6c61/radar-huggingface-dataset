# hopriuse/BAGEL-Global-Edit-LoRA-r32

## Resumen

BAGEL Global Edit LoRA r32 es un adaptador PEFT de tipo LoRA publicado por el usuario hopriuse para el modelo base ByteDance-Seed/BAGEL-7B-MoT, un transformer multimodal de 7.000 millones de parametros con arquitectura Mixture-of-Experts (MoE) orientado a generacion y edicion de imagenes. El adaptador no es un checkpoint autonomo: se carga junto con la revision exacta del modelo base (`5019f57d168e5816e8f3f701b17cc816bb7cf24b`) y modifica unicamente las proyecciones de atencion y MLP del experto de generacion (`moe_gen`).

El adaptador resuelve un problema concreto: especializar el comportamiento de edicion global de imagen del modelo BAGEL sin reentrenar los 7B parametros completos. Se trata de una conversion low-rank de rango 32 (alpha 64, dropout 0) del "Global Edit Teacher" del proyecto del autor, lo que reduce el coste de distribucion a unos 0,2 GB de pesos safetensors. Es relevante para investigadores que trabajan en edicion de imagen con modelos unificados generacion/edicion y en tecnicas de destilacion multi-teacher (OPD, Teacher fusion).

La publicacion es de noviembre de 2026, cuenta con cero descargas y cero likes en el momento de la consulta, y esta licenciada bajo Apache 2.0. La model card es deliberadamente tecnica y limitada: documenta el contrato del adaptador, la procedencia y una evaluacion congelada, pero no ofrece datos de entrenamiento, composicion del dataset ni benchmarks comparativos con otros sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre BAGEL-7B-MoT, transformer multimodal MoE |
| Parametros totales | no disponible (adaptador LoRA de rango 32; base de 7B) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se detalla el reparto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Rank / alpha / dropout | 32 / 64 / 0 |
| Modulos objetivo | proyecciones de atencion y MLP del experto de generacion (`moe_gen`) |
| Revision del modelo base | `5019f57d168e5816e8f3f701b17cc816bb7cf24b` |
| SHA-256 del adaptador | `8fb282d6a66057a0da1dcac4a06cee9efbf42ea3873b4ded3cb2430a385caa81` |
| Tamano del repo | 0,2 GB |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 64 y dropout 0 aplicado exclusivamente sobre las proyecciones de atencion y MLP del experto de generacion (`moe_gen`) del modelo BAGEL-7B-MoT. BAGEL es un transformer multimodal con arquitectura Mixture-of-Experts que unifica generacion y edicion de imagenes; el adaptador no toca el resto del modelo, de modo que la capacidad de comprension y el resto de expertos permanecen congelados.

Segun la model card, el adaptador es una "conversion low-rank de rango 32 del Global Edit Teacher aceptado del proyecto". El Teacher completo original sigue siendo la autoridad de procedencia; este repositorio publica unicamente el adaptador PEFT portable. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones de decodificacion o atencion mas alla de la propia arquitectura del modelo base.

## Capacidades

- Edicion global de imagen: el adaptador especializa el modelo base en transformaciones que afectan a la imagen completa (estilo, iluminacion, paleta, atmosfera), segun el nombre y la descripcion del repositorio.
- Edicion de imagen image-to-image: pipeline declarado `image-to-image`, con entrada de imagen y prompt de edicion.
- Generacion de imagen: heredada del experto de generacion del modelo base BAGEL-7B-MoT.
- Comprension multimodal: heredada del modelo base, aunque el adaptador no modifica los modulos de comprension.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio adicional: no disponible en la informacion proporcionada.

## Casos de uso

- Edicion global de imagen en investigacion: aplicar el adaptador sobre BAGEL-7B-MoT para estudiar como un LoRA de rango 32 sobre `moe_gen` modifica el comportamiento de edicion global, comparando con el Teacher completo.
- Experimentos de destilacion multi-teacher (OPD): usar este adaptador como Student portable en pipelines de Teacher fusion, ya que la model card lo enmarca explicitamente en esa linea de investigacion.
- Reproducibilidad de evaluaciones: cargar la revision exacta del modelo base y el adaptador con el SHA-256 documentado para replicar la evaluacion congelada de 64 Global + 64 Local.
- Prototipado de herramientas de retoque fotografico: integrar el adaptador en un flujo image-to-image para ajustes globales de tono y estilo antes de pasar a ediciones locales mas finas.
- Benchmarking de rangos LoRA: el propio autor senala que la comparacion pareada de rangos no fue estadisticamente decisiva con 64 muestras, por lo que el adaptador sirve como punto de partida para disenos experimentales con mayor potencia estadistica.
- Docencia y formacion: ilustrar como se publica un adaptador PEFT con contrato de revision, hash y evaluacion congelada, como ejemplo de buenas practicas de trazabilidad.

## Benchmarks y rendimiento

La model card reporta una evaluacion congelada de 64 imagenes Global + 64 Local con el scorer SpatialReward. El autor advierte que ambos valores usan el mismo scorer sobre subconjuntos de prompts distintos y no deben interpretarse como dos metricas de especialistas independientes.

| Subconjunto | SpatialReward |
|---|---:|
| Global (64 muestras) | 0,8472250 |
| Local (64 muestras) | 0,8553835 |

El autor indica que la comparacion pareada de rangos no fue estadisticamente decisiva con 64 muestras por subconjunto y que estos valores deben tomarse como evidencia de compatibilidad y calidad, no como una afirmacion de superioridad frente a otro rango. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GenEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base BAGEL-7B-MoT; el adaptador anade solo 0,2 GB de pesos.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base (7B), se necesitarian GPUs con VRAM suficiente para el checkpoint completo, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es `peft`, por lo que el adaptador se carga con la API de PEFT sobre el modelo base. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA de edicion de imagen sobre BAGEL u otros modelos unificados) con datos de parametros, contexto, rendimiento o licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un checkpoint autonomo: requiere cargarse junto con la revision exacta `5019f57d168e5816e8f3f701b17cc816bb7cf24b` de ByteDance-Seed/BAGEL-7B-MoT. Otras revisiones pueden romper la compatibilidad.
- Evaluacion limitada: 64 muestras por subconjunto y sin significacion estadistica en la comparacion de rangos; no debe citarse como evidencia de superioridad.
- Sin datos de entrenamiento publicados: se desconoce el dataset, el numero de tokens y el proceso de alineamiento, lo que dificulta evaluar sesgos y generalizacion.
- Riesgo de alucinacion visual: inherente a los modelos generativos de imagen; no se documenta mitigacion especifica.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el adaptador se orienta a edicion de imagen y no se detalla el soporte linguistico de los prompts.
- Licencia: Apache 2.0 para el adaptador, pero el uso debe respetar tambien la licencia del modelo base BAGEL, segun indica la model card.
- Uso previsto acotado a investigacion: el autor lo destina a investigacion en edicion de imagen BAGEL, OPD multi-teacher y Students unificados; no se documenta validacion para produccion.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya reportado resultados independientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hopriuse/BAGEL-Global-Edit-LoRA-r32
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Paper de BAGEL: no disponible en la informacion proporcionada
- Blog o demo oficial: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
