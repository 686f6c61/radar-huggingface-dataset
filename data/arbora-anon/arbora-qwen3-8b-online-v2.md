# arbora-anon/arbora-qwen3-8b-online-v2

## Resumen

Arbora Qwen3-8B online v2 es un conjunto de pesos publicados por el autor anonimo `arbora-anon` que recoge las ultimas versiones de tres ejecuciones de aprendizaje online sobre un flujo de 20.000 peticiones de ingenieria de software. No se trata de un modelo generativo completo, sino de artefactos de decodificacion especulativa (drafters, selectores de ruta y expertos adicionales) que se cargan en caliente sobre una pila de servidor ya en marcha, construida sobre el modelo base `z-lab/Qwen3-8B-DFlash-b16`.

El trabajo se enmarca en el paper "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters", actualmente en revision anonima, cuyo codigo se distribuye en anonymous.4open.science. La propuesta central es aprovechar mejor los tokens borrador que producen los drafters de difusion por bloques, combinando un drafter DFlash2 con un banco de ocho expertos y un selector de ruta entrenables.

La relevancia es doble: por un lado, demuestra un flujo de aprendizaje online aplicado a decodificacion especulativa sobre trafico real de peticiones SWE; por otro, publica los pesos resultantes bajo licencia Apache 2.0 para que puedan cargarse dinamicamente en un servidor compatible mediante `POST /update_weights_from_disk`. El repositorio ocupa 3,0 GB y no incluye el modelo objetivo completo, solo los componentes auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificacion especulativa sobre drafter de difusion por bloques (DFlash2) con banco de expertos y selector de ruta |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `selector.safetensors`, `experts.safetensors`) |

## Arquitectura y entrenamiento

El modelo base declarado es `z-lab/Qwen3-8B-DFlash-b16`, un Qwen3 de 8.000 millones de parametros equipado con un drafter de difusion por bloques (DFlash). Sobre esa base, Arbora anade un banco de ocho expertos y un selector de ruta (path scorer) que deciden como explotar los tokens borrador generados por el drafter. Este repositorio no contiene el modelo objetivo, sino los pesos auxiliares que se cargan en un servidor en ejecucion.

El entrenamiento es online: se procesa un flujo de 20.000 peticiones de ingenieria de software y se actualizan los componentes de forma incremental. Se publican tres variantes. La primera, `dflash2/`, entrena online el drafter completo y su selector de ruta con tasa de aprendizaje 1e-5 para el drafter. La segunda, `new-expert/`, entrena unicamente un experto anadido, manteniendo congelados el drafter, los ocho expertos y el path scorer. La tercera, `new-expert-and-path-scorer/`, entrena el experto anadido y el selector de ruta. Los datos de entrenamiento son las propias respuestas del modelo objetivo a una coleccion de prompts no publicada; el codigo liberado describe la receta y los scripts para reconstruir los datos desde cualquier fichero de prompts.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa sobre un modelo Qwen3-8B.
- Carga en caliente de pesos en un servidor en ejecucion mediante `POST /update_weights_from_disk` con `load_format: arbora_online`.
- Aprendizaje online incremental sobre flujos de peticiones, sin reiniciar el servicio.
- Tres configuraciones de actualizacion: drafter completo, experto adicional, o experto adicional mas selector de ruta.
- Integracion con las pilas `d2-chain-online` (DFlash2) y `d2-arbora-experts-online` (Arbora).
- No se documentan capacidades de generacion, vision, audio, tool calling ni multilingues propias, al no ser un modelo generativo autonomo.

## Casos de uso

- Servicio de autocompletado de codigo de baja latencia: cargar el drafter entrenado online sobre un servidor Qwen3-8B para reducir el coste por token generado en peticiones SWE repetitivas.
- Ajuste continuo de un endpoint de generacion de codigo: usar `POST /update_weights_from_disk` para incorporar los pesos de `new-expert/` sin reiniciar el servicio, aprovechando el flujo de peticiones de produccion.
- Investigacion en decodificacion especulativa: comparar las tres variantes publicadas (drafter completo, experto aislado, experto mas selector) sobre el mismo conjunto de prompts SWE para medir la contribucion de cada componente.
- Reproduccion del paper Arbora: emplear los safetensors junto con el codigo de anonymous.4open.science para replicar las ejecuciones de aprendizaje online.
- Despliegue de un servidor de inferencia con actualizacion periodica: integrar la recarga de pesos en un pipeline que reentrene el drafter con trafico reciente cada cierto numero de peticiones.
- Evaluacion de robustez del aprendizaje online: usar los tres checkpoints como linea base para estudiar deriva o sobreajuste al flujo de 20.000 peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 3,0 GB y contiene solo los pesos auxiliares (drafter, selectores y experto adicional); el modelo objetivo Qwen3-8B debe obtenerse por separado.
- VRAM estimada para el modelo objetivo: no disponible en la informacion proporcionada; depende de la variante de Qwen3-8B y de su cuantizacion, que no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: pilas `d2-chain-online` y `d2-arbora-experts-online` con carga via `POST /update_weights_from_disk` y `load_format: arbora_online`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3-8b-online-v2 | no disponible (pesos auxiliares sobre Qwen3-8B) | no disponible | Decodificacion especulativa con aprendizaje online | Apache 2.0 | Hugging Face |
| z-lab/Qwen3-8B-DFlash-b16 (base) | 8B (modelo objetivo) | no disponible | Drafter de difusion por bloques | no disponible | Hugging Face |
| Qwen3-8B (modelo subyacente) | 8B | no disponible | Transformer denso | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: requiere un servidor compatible con las pilas `d2-chain-online` o `d2-arbora-experts-online` para tener efecto.
- Los prompts de entrenamiento no se publican; solo se libera la receta y los scripts de reconstruccion, lo que limita la reproducibilidad exacta.
- El entrenamiento se realizo sobre un flujo especifico de 20.000 peticiones SWE, por lo que el comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de deriva o sobreajuste al flujo de peticiones usado en el aprendizaje online; no se documentan evaluaciones de retencion ni de olvido catastrofico.
- No se han publicado datos de sesgos, alucinacion ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en `NOTICE`.
- El autor figura como anonimo y el paper esta en revision: la validez de los resultados no esta avalada por publicacion definitiva.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-online-v2
- Codigo del paper: https://anonymous.4open.science/r/arbora-7ABE
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
