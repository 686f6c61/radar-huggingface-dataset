# Hastagaras/G4-Jamet-26B-A4B-MK-2

## Resumen

G4-Jamet-26B-A4B-MK-2 es un ajuste fino (finetune) comunitario de google/gemma-4-26B-A4B-it, publicado por el usuario Hastagaras en Hugging Face. Se trata de un modelo de 26 mil millones de parametros con arquitectura de mezcla de expertos (MoE), de la cual solo aproximadamente 4 mil millones de parametros estan activos por token, lo que permite una inferencia rapida manteniendo la capacidad de un modelo mucho mayor.

El modelo se distribuye en formato safetensors bajo licencia Apache 2.0, con un repositorio de 51,6 GB. Al ser un finetune de un modelo Google Gemma 4 con acceso restringido (gated), requiere aceptar las condiciones de uso en Hugging Face antes de poder descargarlo, heredando las restricciones de acceso del modelo base.

La etiqueta "not-for-all-audiences" presente en la ficha sugiere que el modelo ha sido ajustado con datos o para comportamientos no adecuados para todos los publicos, algo habitual en finetunes comunitarios orientados a roleplay o generacion creativa sin filtros. Su relevancia radica en ofrecer una alternativa abierta y ligera en coste de computo dentro del ecosistema Gemma 4, aunque la informacion publica sobre su proceso de entrenamiento y evaluacion es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (MoE) |
| Parametros totales | 25.805.936.206 (~26B) |
| Parametros activos | ~4B (indicado por el sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16, 51,6 GB) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 26B-A4B, un transformer de mezcla de expertos (MoE) en el que solo unos 4 mil millones de parametros se activan por token. Esta configuracion permite obtener la calidad de un modelo de 26B con el coste de inferencia de uno de 4B, lo que lo hace atractivo para despliegues en hardware de consumo.

Al tratarse de un finetune comunitario, no se ha publicado informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, ni sobre tecnicas de alineacion posteriores (RLHF, DPO, etc.). La etiqueta "not-for-all-audiences" indica que el contenido generado puede no ser apropiado para todos los publicos, y el sufijo "MK-2" sugiere que es la segunda iteracion de una serie de modelos del mismo autor.

## Capacidades

- Generacion de texto en general, heredada del modelo base Gemma 4 26B-A4B-it (instruct).
- Capacidades de razonamiento, codigo y matematicas heredadas del modelo base, aunque sin datos de evaluacion especificos del finetune.
- Sin informacion publicada sobre soporte de tool calling o function calling.
- Sin informacion publicada sobre soporte de agentes o razonamiento multi-paso.
- Capacidades multilingues no documentadas para este finetune.
- Contenido sin restricciones para todos los publicos (etiqueta "not-for-all-audiences"), tipico de modelos orientados a roleplay y escritura creativa.

## Casos de uso

- Roleplay y escritura creativa: el perfil tipico de los finetunes comunitarios de Gemma con etiqueta de audiencia restringida; el modelo puede generar narrativa extensa y dialogos de personajes.
- Generacion de texto en hardware de consumo: gracias a los ~4B de parametros activos por token, puede ejecutarse con presupuestos de VRAM moderados manteniendo la capacidad de un modelo de 26B.
- Experimentacion con arquitecturas MoE: util como base para investigadores que quieran estudiar el comportamiento de modelos MoE finetuneados por la comunidad.
- Asistentes locales y privados: al ser un modelo abierto con pesos descargables, puede desplegarse en local para aplicaciones donde la privacidad de los datos es prioritaria.
- Base para nuevos finetunes: con licencia Apache 2.0, puede usarse como punto de partida para ajustes adicionales sin restricciones de uso comercial significativas.
- Prototipado rapido de aplicaciones LLM: el coste de inferencia reducido por token permite iterar rapidamente en pipelines de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos ocupan 51,6 GB, por lo que se necesita al menos 52 GB de VRAM en precision completa (por ejemplo, 2x RTX 3090/4090 o una A100 de 80 GB); con cuantizacion a 4 bits (si se genera una version GGUF, no disponible actualmente en el repo) podria rondar los 14-16 GB.
- GPU recomendadas: A100, H100 o multi-GPU de consumo (2x RTX 3090/4090) en precision nativa; RTX 4090 de 24 GB seria viable solo con cuantizacion agresiva.
- En consumer GPU: no cabe en una sola GPU de consumo en precision completa; viable en multi-GPU o con cuantizacion.
- Opciones de despliegue: al ser safetensors con arquitectura Gemma 4, deberia ser compatible con vLLM, TGI y transformers; el soporte en llama.cpp u Ollama dependeria de la existencia de conversiones GGUF (no disponibles en el repositorio).
- Latencia y throughput: no disponibles; al activar solo ~4B parametros por token, la latencia deberia ser comparable a la de un modelo denso de 4B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hastagaras/G4-Jamet-26B-A4B-MK-2 | ~26B | ~4B | Apache 2.0 | Gated, acceso libre tras aceptar condiciones |
| google/gemma-4-26B-A4B-it | ~26B | ~4B | Licencia Gemma | Gated |
| Qwen3-30B-A3B (referencia de categoria) | ~30B | ~3B | Apache 2.0 | Abierto |

Nota: la comparativa se basa en la categoria (MoE de ~26-30B con pocos parametros activos); los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- El modelo lleva la etiqueta "not-for-all-audiences": puede generar contenido inapropiado y no es adecuado para entornos sensibles o publico general sin controles adicionales.
- Al ser un finetune comunitario sin documentacion de entrenamiento, el riesgo de alucinacion y de degradacion en tareas de razonamiento respecto al modelo base es desconocido.
- No hay benchmarks publicados, por lo que su rendimiento no puede contrastarse objetivamente frente al modelo base o competidores.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face y posiblemente cumplir los terminos de la licencia Gemma del modelo base.
- Idiomas soportados y longitud de contexto no documentados; habria que verificarlos contra la ficha del modelo base google/gemma-4-26B-A4B-it.
- Bajo numero de descargas (121) y likes (2) en el momento de redactar la ficha: comunidad pequena, lo que implica menos soporte, menos cuantizaciones alternativas y menos validacion empirica por parte de usuarios.
- Para uso comercial, la licencia Apache 2.0 del finetune es permisiva, pero deben revisarse los terminos de la licencia Gemma del modelo base.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/Hastagaras/G4-Jamet-26B-A4B-MK-2
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- No se han encontrado enlaces adicionales (papers, blogs, repos de codigo o demos) en la informacion disponible.
