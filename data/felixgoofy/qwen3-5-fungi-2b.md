# FelixGoofy/Qwen3.5-Fungi-2B

## Resumen

Qwen3.5-Fungi-2B es un modelo publicado en Hugging Face por el usuario FelixGoofy bajo licencia Apache 2.0. Por el identificador se deduce que se trata de un ajuste fino (fine-tuning) de la familia Qwen 3.5 con aproximadamente 2.000 millones de parametros, orientado presumiblemente a tematicas relacionadas con hongos (Fungi). No obstante, la model card publicada no contiene ninguna descripcion funcional, datos de entrenamiento, arquitectura ni ejemplos de uso: unicamente incluye la declaracion de licencia.

La relevancia de esta ficha es limitada por la ausencia casi total de informacion tecnica verificable. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su fecha de creacion y actualizacion es la misma (26 de noviembre de 2026), lo que sugiere una publicacion reciente y sin validacion por parte de la comunidad. Cualquier evaluacion de sus capacidades reales requeriria inspeccionar los pesos y ejecutar pruebas propias.

Por tanto, esta ficha recoge los unicos datos confirmados (identificador, autor, licencia y fecha) y marca explicitamente como "no disponible" todo aquello que el autor no ha documentado. Se recomienda precaucion antes de integrar este modelo en cualquier flujo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre, se infiere un transformer derivado de Qwen 3.5; no confirmado) |
| Parametros totales | no disponible (por el nombre, ~2B; no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El nombre del repositorio sugiere que se parte de un modelo base de la familia Qwen 3.5 de aproximadamente 2.000 millones de parametros, pero no se confirma ni la arquitectura exacta (transformer denso, atencion lineal, etc.) ni el proceso de ajuste aplicado.

Tampoco hay datos sobre el corpus de entrenamiento o ajuste fino, el numero de tokens utilizados, la composicion del dataset (presumiblemente relacionado con hongos, a juzgar por el sufijo "Fungi"), ni sobre tecnicas de alineacion como RLHF, DPO o SFT. Toda esta seccion queda como no disponible.

## Capacidades

- Generacion de texto: no confirmada documentalmente; se asume por herencia del modelo base, pero no hay evidencia publicada.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Especializacion tematica en hongos (Fungi): inferida unicamente por el nombre del repositorio, sin documentacion que la respalde.

## Casos de uso

Dado que no existe documentacion funcional, los siguientes casos son hipoteticos y requeririan validacion previa con los pesos reales:

- Clasificacion o descripcion de especies de hongos: si el ajuste fino se ha realizado sobre un corpus micologico, el modelo podria emplearse para generar descripciones divulgativas o asistir en tareas de identificacion textual, siempre con supervision experta.
- Asistente educativo en micologia: generacion de material didactico sobre hongos, con la advertencia de que no debe usarse para decisiones de consumo o toxicidad sin validacion profesional.
- Prototipado rapido en local: por su tamano nominal (~2B), podria ejecutarse en GPUs de consumo para experimentacion, si bien la falta de pesos en formatos ligeros documentados limita esta opcion.
- Fine-tuning adicional: al estar bajo Apache 2.0, podria servir como base para nuevos ajustes, aunque la ausencia de documentacion sobre su entrenamiento original reduce la fiabilidad de partida.
- Investigacion sobre ajustes finos de dominio: util como caso de estudio de modelos pequenos especializados, comparando su comportamiento con el modelo base.
- Integracion experimental en pipelines de generacion de texto: solo tras evaluar empíricamente su calidad, seguridad y sesgos, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia orientativa para un modelo denso de ~2B parametros, cabria esperar aproximadamente 4-5 GB en FP16 y 2-3 GB en cuantizacion de 4 bits, pero estos valores no estan confirmados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por tamano, pero no verificada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan formatos de pesos compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-Fungi-2B | no disponible (~2B por nombre) | no disponible | Apache 2.0 | Practicamente nula | Repositorio Hugging Face, 0 descargas |
| Qwen 2.5 1.5B / 3B (familia oficial) | 1.5B / 3B | 32K (segun version) | Apache 2.0 | Completa, con benchmarks | Amplia, ampliamente validada |
| Llama 3.2 1B / 3B | 1B / 3B | 128K | Llama Community License | Completa | Amplia |
| Gemma 2 2B | 2B | 8K | Gemma Terms of Use | Completa | Amplia |

La comparativa se limita a familias de tamano similar; no se dispone de datos de rendimiento del modelo Fungi-2B para contrastar calidad.

## Limitaciones y advertencias

- Ausencia total de model card funcional: no hay informacion sobre entrenamiento, datos, evaluacion ni uso previsto.
- Riesgo elevado de alucinacion no cuantificado: sin benchmarks ni evaluaciones publicadas.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de dominio, idioma o culturales.
- Ambito tematico potencialmente restringido (hongos): podria degradar su rendimiento en tareas generales respecto al modelo base.
- Advertencia de seguridad en micologia: cualquier uso relacionado con identificacion de setas comestibles o toxicas conlleva riesgo para la salud y no debe automatizarse sin supervision experta.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin validacion comunitaria: 0 descargas y 0 likes implican ausencia de replicacion independiente.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FelixGoofy/Qwen3.5-Fungi-2B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
