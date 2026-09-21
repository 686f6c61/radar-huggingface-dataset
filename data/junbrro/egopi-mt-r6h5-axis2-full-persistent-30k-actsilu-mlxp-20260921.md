# junbrro/egopi-mt-r6h5-axis2-full-persistent-30k-actsilu-mlxp-20260921

## Resumen

El modelo `junbrro/egopi-mt-r6h5-axis2-full-persistent-30k-actsilu-mlxp-20260921` es un checkpoint de pesos publicado en HuggingFace por el usuario `junbrro` el 21 de septiembre de 2026. Se trata de un artefacto de entrenamiento ("final step: 30000") derivado de la fuente `junhyeong-mt-r6h5-a2-full-actsilu-30k-260921`, que incluye unicamente los pesos finales y la configuracion, excluyendo el estado del optimizador y del generador de numeros aleatorios. La model card es extremadamente escueta y no documenta arquitectura, datos de entrenamiento ni capacidades.

El numero de parametros reportado en los metadatos de safetensors es de 6.964.885.936 (aproximadamente 6,96 mil millones), con un repositorio de 14,0 GB, un tamano coherente con pesos almacenados en precision de 16 bits (bf16/fp16). Las etiquetas asociadas son `safetensors`, `RLDX-1` y `region:us`, sin pipeline, licencia ni idiomas declarados.

Por los nombres presentes en la model card (`actlat/` como tokenizador de acciones, `mt_openarm_prq15`, adapter "Cog" con `hidden256` y activacion SiLU), todo apunta a un modelo orientado a tareas de tipo embodied/robotico con generacion de acciones, aunque esta interpretacion no esta confirmada por el autor. La relevancia del artefacto es fundamentalmente de investigacion y reproducibilidad: es un checkpoint intermedio-final de un pipeline de fine-tuning, no un modelo listo para produccion con documentacion de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; la etiqueta `RLDX-1` es el unico indicio) |
| Parametros totales | 6.964.885.936 (6,96 B), dato real de safetensors |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, presumiblemente bf16/fp16 por el tamano de 14,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (configuracion incluida; tokenizador de acciones en `actlat/` cuando aplica) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura. Los unicos datos tecnicos aportados por el autor son: adapter "Cog" habilitado, dimension oculta de 256 (`hidden256`) y activacion SiLU. El identificador del repositorio menciona `axis2` y `full-persistent`, y la model card describe "full-token persistent language", terminos que no se desarrollan y cuya interpretacion exacta no puede confirmarse con la informacion disponible. La etiqueta `RLDX-1` sugiere la pertenencia a una familia o formato propietario, pero no hay documentacion publica al respecto en los resultados de busqueda.

Respecto al entrenamiento, la model card indica "Multi-group MT FT" (fine-tuning multi-grupo) con `slot37 mt_openarm_prq15`, y situa el paso final en 30000. Se trata de un checkpoint final de pesos y configuracion: el estado del optimizador y del RNG quedan excluidos, por lo que no es posible reanudar el entrenamiento tal cual desde este artefacto. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documenta ninguna innovacion de decodificacion (especulativa, atencion lineal, etc.). El autor advierte ademas de que las rutas de origen (incluidas rutas de cluster) se conservan en la configuracion y deben ser remapeadas antes de su uso.

## Capacidades

- Generacion de texto, razonamiento, codigo o matematicas: no confirmado en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (sin idiomas declarados).
- Capacidad especial potencial: la presencia de un directorio `actlat/` descrito como "action tokenizer" y de referencias a `openarm` apunta a generacion de acciones para control robotico o entornos embodied, pero esto es una inferencia a partir de los nombres y no una capacidad documentada.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Reproducibilidad de experimentos de fine-tuning: el checkpoint puede usarse para replicar los resultados del paso 30000 del pipeline `junhyeong-mt-r6h5-a2-full-actsilu-30k-260921`, siempre que se remapeen las rutas de origen de la configuracion.
- Punto de partida para fine-tuning posterior: al incluir pesos y configuracion pero no estado de optimizador, sirve como inicializacion para nuevos entrenamientos multi-grupo sobre dominios especificos.
- Investigacion en modelos de accion para robotica: si se confirma la funcion del tokenizador `actlat/`, el modelo podria emplearse en pipelines de generacion de acciones sobre un brazo robotico (`mt_openarm_prq15`), aunque esto requiere validacion experimental previa.
- Integracion del tokenizador de acciones: el directorio `actlat/` puede reutilizarse de forma independiente en otros proyectos que necesiten la misma tokenizacion de acciones.
- Baseline de comparacion en estudios academicos: util como referencia de un checkpoint de 6,96 B parametros dentro de un estudio comparativo de tecnicas de adaptacion con adapter "Cog" y activacion SiLU.
- Auditoria y analisis de pesos: dado que se publican pesos completos en safetensors, es posible inspeccionar la distribucion de parametros, la configuracion del adapter y las dimensiones internas (por ejemplo, `hidden256`).
- Despliegue experimental en entornos controlados: unicamente con caracter de prueba, dado que no hay benchmark, licencia ni soporte de framework confirmados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de metricas especificas de tareas roboticas (tasas de exito, error de posicion, etc.). Tampoco hay comparaciones con modelos similares aportadas por el autor.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parametros (6,96 B) y no proceden de documentacion oficial del modelo:

- VRAM para pesos en fp32: aproximadamente 27,9 GB (6,96 B x 4 bytes).
- VRAM para pesos en bf16/fp16: aproximadamente 13,9 GB (coherente con el tamano de repositorio de 14,0 GB).
- VRAM para pesos en int8: aproximadamente 7,0 GB.
- VRAM para pesos en int4: aproximadamente 3,5-4,0 GB.
- A lo anterior hay que sumar el coste del cache KV y del runtime, que no puede calcularse porque se desconoce la longitud de contexto y el numero de capas.
- GPU recomendadas: se desconoce la arquitectura real, por lo que no puede garantizarse compatibilidad con kernels optimizados. Como referencia de capacidad: A100 40/80 GB y H100 para precision completa o bf16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) serian suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en bf16 con margen limitado, y en tarjetas de 12-16 GB recurriendo a cuantizacion de 8 o 4 bits (si el formato y el runtime lo permiten).
- Opciones de despliegue: no confirmadas. Al no documentarse la arquitectura, no puede afirmarse que vLLM, TGI, llama.cpp, Ollama o MLX (`mlxp` en el nombre podria sugerir MLX) soporten este checkpoint. Seria necesario convertir el modelo a un formato soportado y validar la correspondencia exacta de la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre arquitectura, licencia, contexto o rendimiento de este checkpoint como para establecer una comparacion rigurosa con alternativas de la misma categoria (ya sea un modelo denso de ~7 B parametros o un modelo de acciones roboticas). Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe arquitectura, datos de entrenamiento, contexto ni casos de uso validados.
- Licencia no especificada: sin licencia explicita, no puede asumirse permiso de uso comercial. En ausencia de terminos, el uso en produccion conlleva riesgo legal.
- Cero traccion en la plataforma: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Estado de optimizador y RNG excluidos: el checkpoint no permite reanudar el entrenamiento original, solo inferencia o nuevo fine-tuning.
- Rutas de origen incrustadas: la configuracion conserva rutas de cluster del entorno del autor; es obligatorio remapearlas y puede haber referencias a recursos inexistentes.
- Riesgo de alucinacion: no evaluado por falta de benchmarks; no hay ninguna medicion de fiabilidad.
- Limitaciones de idioma y contexto: desconocidas. No se puede asumir soporte multilingue ni una ventana de contexto concreta.
- Soporte de herramientas y agentes: no declarado; no debe asumirse compatibilidad con function calling ni con frameworks de agentes.
- Compatibilidad de runtime incierta: al no documentarse la arquitectura, la carga en vLLM, llama.cpp, TGI u Ollama podria fallar o requerir trabajo de conversion e implementacion de capas personalizadas.
- Posible componente roboticos/embodied: si el modelo genera acciones, su uso fuera del entorno para el que fue entrenado (por ejemplo, el brazo `openarm`) puede producir comportamientos inseguros. Se requiere validacion en entorno simulado antes de cualquier prueba fisica.
- Fecha de creacion posterior a la fecha de consulta habitual: el repositorio esta fechado en 2026, lo que debe tenerse en cuenta al citarlo.
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo, su familia `RLDX-1` ni con la etiqueta `openarm_prq15`; los unicos resultados obtenidos fueron irrelevantes (sitios de futbol).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-mt-r6h5-axis2-full-persistent-30k-actsilu-mlxp-20260921
- Perfil del autor: https://huggingface.co/junbrro
- Paper, blog, repositorio o demo oficiales: no disponibles
- Referencia a la fuente del checkpoint (`junhyeong-mt-r6h5-a2-full-actsilu-30k-260921`): no se ha encontrado un enlace publico
- Etiqueta `RLDX-1`: sin documentacion publica localizada
- Resultados de busqueda web: no se ha encontrado ningun recurso relevante sobre este modelo
