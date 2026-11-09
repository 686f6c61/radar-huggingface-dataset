# attacker8337/widget-convo-poc-1110

## Resumen

`attacker8337/widget-convo-poc-1110` es un repositorio alojado en Hugging Face que se presenta como un modelo de generación de texto basado en la arquitectura GPT-2, según la etiqueta `gpt2` declarada por el autor. El repositorio está publicado por el usuario `attacker8337` y su nombre, junto con el contenido de la model card, sugiere que se trata de una prueba de concepto (PoC) orientada a probar el comportamiento del widget de conversación de Hugging Face, no un modelo entrenado con fines de uso general.

La model card no contiene documentación técnica real: el campo `widget` incluye mensajes con cargas HTML (`<img>`, ``) diseñadas para ejecutar JavaScript en el contexto del visor, y el cuerpo del README se limita al título "convo widget probe". No se declaran datos de entrenamiento, arquitectura concreta, número de parámetros, longitud de contexto ni resultados de evaluación.

Por tanto, este repositorio debe tratarse como un artefacto de investigación sobre seguridad en la plataforma de Hugging Face más que como un modelo utilizable. Es relevante ahora únicamente como ejemplo de por qué los visores de model cards deben sanear el HTML y por qué los equipos deben revisar el origen de los pesos antes de descargarlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (según etiqueta del autor; no verificable) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La única referencia arquitectónica es la etiqueta `gpt2` incluida en los metadatos del repositorio, que apunta a la familia de transformers decoder-only de OpenAI. No se especifica variante (small, medium, large, xl), número de capas, dimensión de embeddings ni vocabulario. Tampoco se documenta el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El contenido de la model card incluye payloads HTML en el bloque `widget`, lo que constituye la única "innovación" observable del repositorio: probar si el visor de Hugging Face ejecuta JavaScript embebido en los mensajes de ejemplo. No hay evidencia de que existan pesos entrenados asociados, y el pipeline declarado (`conversational`) no coincide con el `text-generation` que figura en los metadatos de la plataforma.

## Capacidades

- Generación de texto: no verificable; no hay pesos ni demos funcionales documentados.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas está vacío.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Inyección de HTML/JS en el widget de conversación: observable en la model card, pero es un comportamiento del visor, no del modelo.

## Casos de uso

- Auditoría de seguridad de la plataforma Hugging Face: usar este repositorio como caso de prueba para verificar que el visor de model cards sanea correctamente los atributos `onerror` y `srcdoc` antes de renderizar mensajes de ejemplo.
- Formación en seguridad de la cadena de suministro de modelos: emplearlo como ejemplo didáctico de repositorios con metadatos engañosos (pipeline `conversational` frente a tag `gpt2`) para enseñar a los equipos a validar el origen antes de descargar pesos.
- Pruebas de pipelines de escaneo de artefactos: incluirlo en un corpus de repositorios "maliciosos por diseño" para validar que herramientas como `safetensors`-only loaders o escáneres de model cards detectan contenido sospechoso.
- Investigación sobre ingeniería social en hubs de modelos: analizar cómo nombres de usuario (`attacker8337`) y títulos genéricos pueden pasar desapercibidos en búsquedas automatizadas.
- Evaluación de políticas de moderación: comprobar si la plataforma elimina o marca repositorios con payloads XSS en la model card y cuánto tarda en hacerlo.
- Docencia sobre licencias: ilustrar que una licencia MIT declarada en un repositorio sin pesos reales no otorga derechos sobre ningún artefacto utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; no se confirma la existencia de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| attacker8337/widget-convo-poc-1110 | no disponible | no disponible | MIT | no verificable |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | sí, público |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | sí, público |
| DistilGPT-2 (Hugging Face) | 82 M | 1.024 tokens | Apache 2.0 | sí, público |

La comparación es meramente nominal: los tres modelos de referencia tienen arquitectura, pesos y documentación verificables, mientras que el repositorio analizado no aporta ninguno de esos elementos.

## Limitaciones y advertencias

- Contenido potencialmente malicioso: la model card incluye payloads HTML/JS (`onerror`, `srcdoc`) diseñados para ejecutarse en el visor; no debe abrirse en navegadores sin sandboxing.
- Metadatos inconsistentes: la etiqueta `gpt2` no concuerda con el `pipeline_tag: conversational`, lo que indica falta de rigor o intención deliberada de confundir.
- Ausencia de pesos verificables: no hay `safetensors`, `pytorch_model.bin` ni ningún artefacto descargable documentado.
- Cero descargas y cero likes: no hay evidencia de uso real ni validación por parte de la comunidad.
- Riesgo de alucinación: no evaluable, al no existir modelo funcional.
- Licencia MIT declarada sin artefacto asociado: no otorga derechos sobre pesos inexistentes y no debe interpretarse como garantía de seguridad.
- Fecha de creación anómala (2026-11-09): sugiere manipulación de metadatos o error de la plataforma; refuerza la necesidad de tratar el repositorio con cautela.
- No apto para producción bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/attacker8337/widget-convo-poc-1110
- Perfil del autor: https://huggingface.co/attacker8337
- Documentación de GPT-2 (arquitectura referenciada por la etiqueta): https://huggingface.co/docs/transformers/model_doc/gpt2
