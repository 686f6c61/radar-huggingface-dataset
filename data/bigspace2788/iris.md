# Bigspace2788/iris

## Resumen

Iris es un modelo publicado en Hugging Face por el usuario Bigspace2788 bajo el identificador `Bigspace2788/iris`. La model card es practicamente vacia: se limita a indicar `license: other` con `license_name: archive` y una unica frase, "Archive copy. See LICENSE.", sin especificar autoría real, arquitectura, datos de entrenamiento ni capacidades. El repositorio ocupa 59,0 GB y contiene pesos en formato safetensors, lo que sugiere un modelo de gran tamano, pero no se dispone de informacion que permita confirmar la cifra de parametros.

La etiqueta `glm5_next` asociada al repositorio apunta a una posible relacion con la familia GLM de Zhipu AI, aunque no hay ninguna confirmacion en la informacion disponible. Tampoco se han publicado resultados de benchmarks, idiomas soportados ni pipeline de inferencia declarado. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion (18 de noviembre de 2026) son las unicas referencias temporales.

Dado que la model card no aporta documentacion tecnica, esta ficha se limita a reflejar los metadatos disponibles y marca explicitamente como "no disponible" todo aquello que no puede verificarse. Cualquier evaluacion de uso en produccion deberia posponerse hasta que el autor publique informacion sustantiva o se realice una inspeccion directa de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `glm5_next` sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp8 segun tag) |
| Idiomas soportados | no disponible |
| Licencia | other (`license_name: archive`, ver LICENSE del repo) |
| Formato de pesos | safetensors (tag `fp8`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La etiqueta `glm5_next` podria indicar una variante de la familia GLM, pero la model card no lo confirma ni detalla si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico dato tecnico verificable es el formato de los pesos: safetensors con tag `fp8`, lo que sugiere que el checkpoint almacenado esta cuantizado a 8 bits en coma flotante. El tamano del repositorio (59,0 GB) es compatible con un modelo de decenas de miles de millones de parametros en fp8, pero sin la model card no puede determinarse la cifra exacta ni el desglose por capas.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No hay confirmacion de soporte de generacion de texto, razonamiento, codigo o matematicas.
- No hay confirmacion de soporte de tool calling ni function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay confirmacion de capacidades multimodales (vision, audio).
- No hay confirmacion de modo "thinking" ni de decodificacion especulativa.
- El soporte multilingue es desconocido.

## Casos de uso

- Evaluacion experimental: el modelo puede descargarse e inspeccionarse para determinar su arquitectura y comportamiento real, dado que la documentacion publica es inexistente.
- Investigacion de checkpoints fp8: util para estudiar el impacto de la cuantizacion fp8 en la calidad de salida, comparando con versiones en otros formatos si el autor las publica.
- Reproduccion de pipelines GLM: si se confirma la relacion con la familia GLM, podria integrarse en los mismos frameworks de inferencia que dichos modelos, aunque esto requiere validacion previa.
- Pruebas de compatibilidad con vLLM o TGI: el formato safetensors permite intentar la carga en estos motores, siempre que la arquitectura sea reconocida por el runtime.
- Analisis de seguridad y sesgos: al no haber model card, un equipo de evaluacion puede auditar el modelo directamente antes de cualquier uso.
- Prototipado interno no productivo: uso acotado en entornos de laboratorio donde el equipo asume el coste de validar manualmente el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El tag `eval-results` aparece en los metadatos del repositorio, pero no se ha incluido ningun resultado concreto en la model card ni en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repo ocupa 59,0 GB en fp8, por lo que la inferencia requerira al menos esa cantidad de memoria, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible; por tamano, un checkpoint de ~59 GB no cabe en GPUs consumer de 24 GB (RTX 4090) sin cuantizacion adicional a 4 bits o descarga por capas.
- Cabe en consumer GPU: improbable en configuracion fp8 completa; posible solo con cuantizacion GGUF agresiva y offloading a CPU/RAM, no verificado.
- Opciones de despliegue: no confirmadas; el formato safetensors es compatible con vLLM, TGI y transformers, pero la arquitectura debe ser reconocida por el runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre Iris (parametros, contexto, rendimiento) para establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se puede verificar arquitectura, datos de entrenamiento ni alineacion.
- Riesgo elevado de comportamiento impredecible en produccion al no existir evaluaciones publicadas.
- Licencia `other` con `license_name: archive`: los terminos exactos estan en el fichero LICENSE del repositorio y deben revisarse antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- El autor no ha declarado idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- El tag `glm5_next` no equivale a una confirmacion oficial de la familia GLM; no debe asumirse compatibilidad con herramientas o pesos de dicha familia.
- Riesgo de sesgos y alucinaciones no evaluado.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.
- La fecha de creacion (2026) y la naturaleza "archive" del repositorio sugieren que podria tratarse de una copia de preservacion mas que de un modelo mantenido activamente.

## Enlaces

- Hugging Face: https://huggingface.co/Bigspace2788/iris
- Licencia (referenciada en la model card): fichero LICENSE dentro del repositorio
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
