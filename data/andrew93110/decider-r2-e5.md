# Andrew93110/decider-r2-e5

## Resumen

decider-r2-e5 es un modelo de lenguaje publicado en Hugging Face por el usuario Andrew93110 bajo licencia Apache 2.0. Se distribuye en formato safetensors con un total de 31.273.088.876 parametros (aproximadamente 31,3 mil millones), lo que lo situa en la categoria de modelos de gran tamano tipo 30B. La etiqueta `gemma4` asociada al repositorio sugiere que se trata de un ajuste fino o una variante derivada de la familia Gemma, aunque no se dispone de documentacion oficial que lo confirme.

El modelo tiene acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. El repositorio ocupa 62,6 GB, lo que es coherente con pesos en precision de 16 bits para ~31B parametros. No se han publicado datos sobre arquitectura detallada, contexto, datos de entrenamiento ni benchmarks en la informacion disponible.

La relevancia de esta ficha es principalmente descriptiva: se trata de un modelo reciente (creado y actualizado el 24 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, y sin documentacion tecnica publica mas alla de los metadatos del repositorio. Cualquier evaluacion de su calidad requiere probarlo directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` sugiere base Gemma) |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. La etiqueta `gemma4` en el repositorio apunta a que podria tratarse de un fine-tuning o una variante construida sobre la familia Gemma de Google, pero no hay confirmacion oficial ni documentacion tecnica que detalle si es un transformer denso, un modelo MoE o una arquitectura hibrida. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

El unico dato estructural fiable es el recuento de parametros obtenido de los ficheros safetensors: 31.273.088.876. El tamano del repositorio (62,6 GB) es consistente con pesos en bf16/fp16. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de ~31B, pero no verificada ni documentada.
- Razonamiento y matematicas: no disponible (sin benchmarks ni model card que lo detalle).
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas en los metadatos).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

Dado que no hay documentacion tecnica publica, los casos de uso son potenciales y deben validarse con pruebas propias antes de llevarlos a produccion:

- Evaluacion comparativa interna: usar el modelo como candidato en pruebas A/B frente a otros modelos de ~30B para tareas de generacion de texto, midiendo calidad y latencia con datos propios.
- Prototipado de asistentes conversacionales: desplegar el modelo en un entorno de staging para validar respuestas multi-turno, siempre que se confirme su ventana de contexto real.
- Generacion de texto en pipelines de contenido: borradores, resumenes y reescritura, con revision humana obligatoria dada la ausencia de benchmarks.
- Fine-tuning adicional: al estar en safetensors y con licencia Apache 2.0, puede servir como base para ajustes especificos de dominio si el equipo dispone de GPU adecuadas.
- Investigacion sobre modelos derivados de Gemma: util para estudiar diferencias de comportamiento respecto a la base original, si se confirma esa procedencia.
- Despliegue self-hosted con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso comercial interno sin las restricciones de otras licencias de modelos abiertos, sujeto a verificacion legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62 GB solo para pesos, mas overhead de KV cache; en la practica requiere 70-80 GB o mas segun contexto.
- Cuantizacion a 8 bits: ~31-35 GB de VRAM, viable en una A100 40GB o H100.
- Cuantizacion a 4 bits: ~16-18 GB de VRAM, potencialmente viable en una RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; A100 40GB o L40S para 8 bits; RTX 4090/3090 para 4 bits con contexto reducido.
- Despliegue: vLLM, TGI o llama.cpp (si se generan cuantizaciones GGUF, no confirmadas en el repo). Ollama solo si existe una conversion GGUF publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| decider-r2-e5 | ~31,3B | no disponible | Apache 2.0 | Gated en HF |
| Gemma 2 27B | 27B | 8K | Gemma license | Publico en HF |
| Qwen2.5 32B | 32,5B | 128K | Apache 2.0 (segun variante) | Publico en HF |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | Publico en HF |

La comparativa es orientativa: no hay benchmarks de decider-r2-e5 que permitan contrastar rendimiento real frente a estas alternativas, y su procedencia exacta respecto a Gemma no esta confirmada.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni evaluaciones.
- Riesgo de alucinacion desconocido: sin benchmarks ni evaluaciones de fidelidad, no se puede estimar su tasa de errores factuales.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede retrasar su adopcion en equipos o pipelines automatizados.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni issues que permitan contrastar experiencias.
- Licencia Apache 2.0 declarada, pero al ser un modelo derivado potencialmente de Gemma, conviene revisar que los terminos de la base original sean compatibles con el uso previsto.
- Sin garantias de soporte ni mantenimiento por parte del autor.
- No recomendable para produccion sin una evaluacion interna previa y sin verificar la procedencia y legalidad de los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Andrew93110/decider-r2-e5
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
