# open-athena/Marin-Mochi-Ladder-Mix25-d512

## Resumen

Marin-Mochi-Ladder-Mix25-d512 es un checkpoint intermedio de preentrenamiento de la familia Marin, publicado por la organizacion open-athena. Se trata de un artefacto de investigacion exportado en BF16 a partir de un checkpoint existente de la receta "Mochi" (paso 3930), sin entrenamiento adicional. Su interes no reside en ser un modelo listo para produccion, sino en documentar el estado intermedio de un experimento de escalado de mezclas de datos sobre una arquitectura MoE con layout de expertos divididos (Grug MoE).

El modelo tiene 597.608.192 parametros totales (aproximadamente 0,6 mil millones) y un payload de tensores BF16 de 1.195.216.384 bytes. Emplea el esquema de safetensors de expertos divididos de Marin (artifact schema 3), que requiere una implementacion compatible de Grug: Transformers estandar no soporta esta arquitectura, por lo que la etiqueta `transformers` de la model card no implica carga directa con la libreria.

La relevancia actual es limitada y muy especifica: sirve para estudiar trayectorias de entrenamiento, comparar checkpoints de la misma run y validar herramientas de exportacion e inferencia del ecosistema Marin. El propio autor advierte de que no ha sido probado ni evaluado adecuadamente y de que no es necesariamente seguro para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE con layout de expertos divididos (artifact schema 3); transformer con mezcla de expertos segun tags |
| Parametros totales | 597.608.192 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export publicado unicamente en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16), layout Grug MoE split-expert |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) denominada Grug MoE, con un layout de safetensors de expertos divididos identificado como artifact schema 3. El checkpoint corresponde al paso 3930 de la run `h100-mix25-20260912-d512` del proyecto marin_moe, ejecutada sobre GPUs H100. El identificador "d512" sugiere una dimension de modelo de 512, aunque el dato exacto de hiperparametros no se detalla en la informacion disponible. El nombre "mix25" hace referencia a una variante de mezcla de datos dentro de la "receta ladder" de Mochi.

No se ha realizado entrenamiento adicional para esta publicacion: es una exportacion BF16 de un checkpoint preexistente. El tokenizador utilizado es `marin-community/marin-tokenizer` en la revision `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`, y el exportador corresponde a la revision `11f51b3fad1e9b3d8e71093644db003c6825cac4`. Los archivos `config.yaml` y `training-config.json` serializan la configuracion resuelta de la run obtenida de la API de W&B, mientras que `config.json` describe la arquitectura de inferencia exportada. No se dispone de informacion sobre volumen de tokens, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y la model card incluye la etiqueta `conversational`.
- Mezcla de expertos: enrutamiento disperso mediante Grug MoE, con expertos divididos en el layout de safetensors.
- Capacidades de razonamiento, codigo, matematicas o vision: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas aparece vacio en la model card.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: comparar este checkpoint del paso 3930 con otros pasos de la misma run para estudiar la evolucion de la perdida y de las representaciones internas a lo largo del preentrenamiento.
- Validacion de la cadena de exportacion de Marin: usar el modelo para verificar que el exportador en la revision indicada y el layout Grug MoE (schema 3) se cargan correctamente en la implementacion compatible, segun la guia de exportacion e inferencia del repositorio.
- Experimentos de mezcla de datos: al pertenecer a la variante "mix25" de la receta ladder, sirve como punto de comparacion frente a las runs de intercambio de mezcla (mixture-swap) que tienen repositorios separados.
- Desarrollo de kernels y herramientas de inferencia para MoE: probar rutinas de enrutamiento y de carga de expertos divididos con un modelo pequeno (0,6 mil millones de parametros) antes de escalar a checkpoints mayores.
- Docencia y divulgacion: ilustrar como se publica un checkpoint intermedio con trazabilidad completa (run de W&B, ruta S3, revision del tokenizador y del exportador) en un entorno de investigacion abierta.
- Analisis de tokenizadores: evaluar el comportamiento del tokenizador `marin-tokenizer` en la revision fijada sobre corpus propios, sin necesidad de un modelo de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido probado ni evaluado adecuadamente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB solo para pesos (payload de 1.195.216.384 bytes), mas memoria para activaciones, cache KV y overhead del runtime de MoE.
- Al ser un modelo de 0,6 mil millones de parametros, cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, asi como en Apple Silicon con memoria unificada suficiente.
- GPU de datacenter (A100, H100) no necesarias para inferencia; la run de origen se ejecuto en H100 por motivos de entrenamiento.
- Opciones de despliegue: no se puede usar vLLM, llama.cpp, Ollama ni TGI de forma estandar, ya que la arquitectura Grug MoE con expertos divididos requiere una implementacion compatible propia de Marin. La guia de exportacion e inferencia del repositorio de Marin es la referencia indicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marin-Mochi-Ladder-Mix25-d512 | 597.608.192 | no disponible | openmdw-1.1 | Hugging Face (checkpoint intermedio, layout Grug MoE) |
| Alternativas de ~0,6B en transformers estandar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables evaluados en la misma categoria dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en produccion es bajo responsabilidad del usuario.
- Checkpoint intermedio (paso 3930): no representa un modelo final afinado ni alineado; no se ha realizado entrenamiento adicional tras la exportacion.
- Compatibilidad restringida: Transformers estandar no implementa la arquitectura Grug MoE de expertos divididos; se necesita una implementacion compatible de Marin para cargarlo.
- Idiomas no declarados: se desconoce la cobertura linguistica real y el comportamiento fuera del ingles o de los idiomas presentes en los datos de preentrenamiento.
- Riesgo de alucinacion: no evaluado; al no existir fases documentadas de alineacion, cabe esperar generacion de texto sin filtros de seguridad.
- Sesgos: no documentados en la informacion disponible; al derivar de un corpus web de preentrenamiento, es probable la presencia de sesgos no medidos.
- Licencia openmdw-1.1: es necesario revisar sus terminos antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la informacion proporcionada.
- Contexto y cuantizaciones no documentados: no hay garantias sobre longitud de ventana efectiva ni sobre calidad tras cuantizacion.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que refleja la ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Mix25-d512
- Run de W&B de origen: https://wandb.ai/marin-community/marin_moe/runs/h100-mix25-20260912-d512
- Issue de seguimiento de la release: https://github.com/marin-community/marin/issues/12230
- Guia de exportacion e inferencia de Grug MoE: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
