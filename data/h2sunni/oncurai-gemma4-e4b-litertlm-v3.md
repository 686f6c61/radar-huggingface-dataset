# h2sunni/oncurai-gemma4-E4B-litertlm-v3

## Resumen

OnCuri Gemma 4 E4B es un ajuste fino del modelo base google/gemma-4-E4B de Google, desarrollado por Heesun Jung (usuario h2sunni) para la aplicación OnCuri, una guía de viaje basada en IA que ofrece explicaciones contextuales de obras de arte, museos, monumentos históricos y sitios culturales. El modelo está pensado para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM, lo que condiciona tanto el formato de pesos como el objetivo de despliegue.

El ajuste se ha realizado mediante LoRA sobre el modelo base y se distribuye en formato `.litertlm`, un contenedor específico del ecosistema LiteRT-LM orientado a ejecución local en dispositivos. El repositorio ocupa 19,7 GB y los idiomas declarados son coreano (ko) e inglés (en), coherente con el enfoque de guía turística para un público objetivo coreano e internacional.

La relevancia del modelo es acotada: se trata de una adaptación vertical para un producto concreto, no de un modelo generalista. Su interés técnico reside en el uso de LiteRT-LM para despliegue on-device y en las restricciones de licencia, que limitan explícitamente la redistribución y el uso comercial fuera de la aplicación OnCuri autorizada. No se han publicado datos de benchmarks ni especificaciones detalladas de arquitectura o entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E4B; sin detalle en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de distribucion `.litertlm` para LiteRT-LM) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | oncuri-model-license (materiales OnCuri); componentes Gemma subyacentes bajo Apache 2.0 |
| Formato de pesos | `.litertlm` (runtime LiteRT-LM) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base google/gemma-4-E4B en la informacion proporcionada. La model card indica unicamente que el modelo se construye sobre dicho base y que el ajuste se realizo mediante LoRA (Low-Rank Adaptation), una tecnica de ajuste eficiente en parametros que entrena un conjunto reducido de matrices de bajo rango sobre los pesos congelados del modelo base.

El proceso de entrenamiento no esta documentado en la informacion disponible: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros del ajuste LoRA. El modelo se distribuye exclusivamente en formato `.litertlm` para su ejecucion con LiteRT-LM, lo que sugiere un proceso de conversion y optimizacion orientado a inferencia en dispositivo, pero no se aportan detalles tecnicos sobre dicho proceso.

## Capacidades

- Generacion de texto en coreano e ingles orientada a la explicacion contextual de contenido cultural y turistico.
- Explicaciones de obras de arte, museos, monumentos historicos y sitios culturales, segun el proposito declarado del proyecto OnCuri.
- Inferencia en dispositivo mediante LiteRT-LM, sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a coreano e ingles segun los metadatos declarados.

## Casos de uso

- Guia turistica en aplicacion movil: el modelo esta disenado especificamente para la app OnCuri, donde genera explicaciones contextuales de obras de arte y monumentos mientras el usuario recorre un museo o sitio historico. Su formato `.litertlm` y el runtime LiteRT-LM lo hacen adecuado para ejecucion local en el dispositivo.
- Explicacion de patrimonio cultural para visitantes coreanos: al estar entrenado en coreano e ingles, puede ofrecer descripciones de sitios culturales a turistas coreanos y angloparlantes, reduciendo la dependencia de guias fisicas o audioguias.
- Funcionamiento sin conectividad: al ejecutarse on-device, puede emplearse en entornos con cobertura limitada, como museos con mala recepcion movil o zonas historicas rurales.
- Privacidad de consultas: al no requerir envio de datos a un servidor, las consultas del usuario sobre obras o lugares permanecen en el dispositivo, lo que resulta relevante para aplicaciones con requisitos de privacidad.
- Prototipado de asistentes culturales verticales: el enfoque de ajuste LoRA sobre un modelo base y la distribucion en LiteRT-LM pueden servir de referencia para equipos que quieran construir asistentes especializados similares, siempre que respeten las restricciones de licencia.
- Demostraciones educativas de despliegue on-device: el modelo puede utilizarse en entornos de investigacion o docencia para estudiar el flujo de conversion a `.litertlm` y la ejecucion con LiteRT-LM, aunque la licencia restringe la redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 19,7 GB, pero se desconoce el desglose entre pesos, adaptadores y artefactos de conversion.
- GPU recomendadas: no disponible. El modelo esta orientado a inferencia en dispositivo mediante LiteRT-LM, no a despliegue en GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LiteRT-LM es el runtime declarado; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OnCuri Gemma 4 E4B | no disponible | no disponible | ko, en | oncuri-model-license (uso restringido) | `.litertlm` |
| google/gemma-4-E4B (base) | no disponible | no disponible | no disponible | Apache 2.0 (segun la model card) | no disponible |
| Alternativas on-device de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria. La comparacion mas directa posible es con el modelo base google/gemma-4-E4B, del que este modelo deriva mediante ajuste LoRA, pero no se aportan datos de rendimiento de ninguno de los dos en la informacion proporcionada.

## Limitaciones y advertencias

- Restriccion de licencia severa: los materiales especificos de OnCuri requieren permiso previo por escrito para cualquier uso fuera de la aplicacion OnCuri autorizada, incluidos redistribucion, integracion en otros servicios y explotacion comercial. Los componentes Gemma subyacentes mantienen su licencia Apache 2.0, pero la combinacion queda sujeta a la licencia OnCuri.
- Dominio acotado: el modelo esta especializado en explicaciones de contenido cultural y turistico; su comportamiento fuera de ese dominio no esta documentado.
- Cobertura linguistica limitada: solo coreano e ingles declarados; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion: no se documentan mecanismos de mitigacion ni evaluaciones de fidelidad factual, algo critico en un contexto de divulgacion patrimonial donde los datos historicos deben ser exactos.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo.
- Ausencia de benchmarks: no hay datos publicados que permitan evaluar calidad, latencia o robustez.
- Formato propietario del runtime: la distribucion en `.litertlm` limita la portabilidad a otros ecosistemas de inferencia.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/h2sunni/oncurai-gemma4-E4B-litertlm-v3
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Licencia del modelo (referenciada en la model card): LICENSE (en el repositorio)
- Avisos de terceros (referenciados en la model card): THIRD_PARTY_NOTICES (en el repositorio)
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
