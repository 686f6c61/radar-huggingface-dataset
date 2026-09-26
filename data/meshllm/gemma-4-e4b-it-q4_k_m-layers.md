# meshllm/gemma-4-E4B-it-Q4_K_M-layers

## Resumen

meshllm/gemma-4-E4B-it-Q4_K_M-layers no es un modelo nuevo, sino un paquete de inferencia distribuida: redistribuye el GGUF cuantizado Q4_K_M de gemma-4-E4B-it (familia Gemma, escala 4B, variante instruction-tuned, etiquetada como conversacional) troceado en artefactos por capa para ejecutarlo repartido entre varias máquinas con Mesh LLM. Lo publica el proyecto Mesh LLM y deriva de unsloth/gemma-4-E4B-it-GGUF, del que hereda la licencia apache-2.0.

El problema que resuelve es el de servir un modelo que no cabe o no conviene cargar en un único equipo: cada nodo del clúster aporta memoria y cómputo, y las 42 capas que documenta la model card se reparten entre los peers. El paquete expone además una API compatible con OpenAI en /v1/chat/completions sobre el puerto 3131, lo que permite integrarlo en aplicaciones que ya hablan ese protocolo sin modificar el cliente.

Es relevante ahora porque el interés por la inferencia local privada y por aprovechar hardware heterogéneo ha crecido, y porque el repositorio acumula 25.951 descargas pese a no tener likes. El paquete no documenta longitud de contexto, idiomas soportados ni resultados de benchmarks: remite expresamente a la model card del modelo de origen para esos datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma; el paquete no documenta la arquitectura interna del modelo de origen) |
| Parámetros totales | 120.600.065 según los metadatos de safetensors del repositorio; la model card del paquete indica escala de 4B (dato contradictorio) |
| Parámetros activos | no disponible (no se especifica si el modelo de origen emplea arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (el repositorio incluye la etiqueta imatrix) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, dividido en artefactos por capa (layer package) con manifiesto model-package.json |

## Arquitectura y entrenamiento

El repositorio no contiene pesos en el sentido habitual, sino un paquete de capas derivado del GGUF `gemma-4-E4B-it-Q4_K_M.gguf` de unsloth, identificado por el commit `bfc15c382204943c3a8fff0c750b94ae2364d7a3` y con SHA-256 `85a896a047553e842f25297ee5b031d64ff30147d9c4af17b1e4b394cd1fab87`. La model card declara 42 capas y un reparto por capa pensado para el formato de paquete de Mesh LLM (Skippy ABI, marcado como "not recorded"). No se documentan ni la arquitectura detallada (transformer, MoE o híbrida), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO: esos detalles quedan en la model card de unsloth.

La innovación técnica está en el empaquetado y la ejecución, no en el modelo: el splitter de Mesh LLM trocea el GGUF en artefactos por capa, calcula el checksum SHA-256 de cada uno mientras los escribe y genera un manifiesto (`model-package.json`, SHA-256 `a1a2cd1063fbadd73f01e966f5392e9d662bc769ca1e0286ebca0ca6dd2f88cc`) que fija la identidad y las sumas de verificación de origen. La generación se sirve después mediante un endpoint compatible con OpenAI.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` confirma el ajuste para diálogo.
- Instrucciones: la variante es instruction-tuned (sufijo `it` del modelo de origen).
- Inferencia local y privada: el modelo se ejecuta en el hardware del usuario, sin salida de datos a servicios externos por defecto.
- Inferencia distribuida: reparto de capas entre varios peers mediante `mesh-llm serve --split`.
- API compatible con OpenAI: sirve /v1/chat/completions y /v1/models en el puerto local 3131.
- Verificación de integridad: cada artefacto del paquete está checksumado y referenciado en el manifiesto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Comportamiento agéntico o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local privada en un solo equipo: sirviendo el paquete con Mesh LLM en una única máquina se obtiene un endpoint compatible con OpenAI sin enviar prompts ni datos a terceros, adecuado para prototipos con información sensible.
- Servicio multi-máquina cuando el GGUF completo no cabe en un host: con `--split`, las 42 capas se reparten entre nodos, de modo que un portátil y una torre pueden sumar memoria y cómputo para servir el mismo modelo.
- Integración en aplicaciones existentes del ecosistema OpenAI: al responder en /v1/chat/completions con el nombre de modelo `unsloth/gemma-4-E4B-it-GGUF:Q4_K_M`, basta con cambiar la `base_url` del cliente para redirigir tráfico a la red local.
- Clústeres caseros o de laboratorio con hardware heterogéneo: el diseño por capas permite agregar equipos de distinta potencia sin requisitos de uniformidad, útil en aulas y laboratorios con parque de máquinas dispar.
- Prototipado de asistentes conversacionales con contexto sensible: el ajuste instruction-tuned y el tag conversacional lo hacen apto para bots de soporte interno, siempre que el contexto requerido quepa en la ventana del modelo de origen (no documentada aquí).
- Verificación reproducible de despliegues: gracias a los SHA-256 del manifiesto y de cada artefacto, un equipo de plataforma puede auditar que los pesos servidos corresponden exactamente al GGUF de origen y al commit declarado.
- Investigación en inferencia distribuida: el paquete sirve como banco de pruebas para medir latencia y throughput de un modelo de escala 4B repartido entre N nodos frente a la ejecución monolítica.
- Despliegue en entornos con GPUs modestas: al repartir capas, la VRAM exigida por nodo baja en proporción al número de peers, lo que abre la puerta a servir el modelo sobre GPUs de gama media o incluso sobre CPU y RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del paquete remite expresamente a la model card de `unsloth/gemma-4-E4B-it-GGUF` para las notas de benchmark del modelo de origen, y esa información no forma parte de los datos proporcionados. Tampoco se publican cifras de latencia, throughput ni velocidad de decodificación en modo distribuido.

## Requisitos de hardware

- VRAM estimada: no publicada. Como referencia orientativa (estimación derivada de la escala 4B y de la cuantización Q4_K_M, no dato del repositorio), los pesos de un modelo de esa escala en Q4_K_M suelen ocupar en torno a 2,5-3,5 GB, a lo que hay que sumar la caché KV según contexto y lote.
- Tamaño real del repositorio: 8,1 GB, que incluye los artefactos por capa; la model card declara un "package size" de 0 B, dato que debe considerarse inconsistente.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 8 GB o más si se ejecuta la variante monolítica; en modo distribuido, la VRAM por nodo se reduce en función del número de peers.
- GPU recomendadas: no disponibles en la documentación. El diseño favorece hardware heterogéneo, por lo que no se fija una lista concreta (A100, H100, RTX 4090 u otras).
- Opciones de despliegue: `mesh-llm serve --model "meshllm/gemma-4-E4B-it-Q4_K_M-layers" --split` en cada máquina que aporte memoria o cómputo; comprobación del clúster con `curl http://localhost:3131/api/status` y `curl http://localhost:3131/v1/models`. El GGUF de origen, al ser un GGUF estándar, es presumiblemente ejecutable con llama.cpp y derivados (Ollama y similares), aunque eso no está confirmado en la model card de este paquete.
- Latencia y throughput: no disponibles; en modo distribuido dependerán críticamente de la latencia de red entre nodos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| meshllm/gemma-4-E4B-it-Q4_K_M-layers | 120.600.065 según metadatos; 4B según la model card | no disponible | GGUF por capas | Q4_K_M | apache-2.0 | Repositorio HF con 25.951 descargas |
| unsloth/gemma-4-E4B-it-GGUF (origen) | escala 4B | no disponible | GGUF monolítico | varias, incluida Q4_K_M | apache-2.0 | Repositorio HF de origen |
| Otras alternativas de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye resultados comparativos de rendimiento ni detalles de modelos de otras familias, por lo que la comparación cuantitativa se limita al propio ecosistema Gemma y a la diferencia de formato (paquete por capas frente a GGUF monolítico).

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: es una redistribución troceada de un GGUF de terceros; cualquier limitación del modelo de origen se hereda íntegramente.
- Dependencia de herramienta: el paquete está diseñado para Mesh LLM y su formato de layer package; fuera de ese runtime no es directamente utilizable.
- Discrepancia en el recuento de parámetros: los metadatos de safetensors indican 120.600.065 parámetros mientras la model card declara escala 4B; conviene verificar el dato antes de dimensionar hardware.
- Metadatos incompletos: longitud de contexto, idiomas soportados, arquitectura interna, número de capas activas y ABI de Skippy figuran como no disponibles o "not recorded".
- Idioma: no se declara cobertura multilingüe para este paquete; no hay garantía de calidad fuera del idioma o idiomas del modelo de origen.
- Alucinación: al ser un modelo generativo de escala 4B, es esperable que produzca contenido plausible pero incorrecto, especialmente en tareas factuales o de razonamiento largo; no se aportan evaluaciones de fiabilidad.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad en la información disponible.
- Licencia: el paquete declara apache-2.0 heredada del GGUF de origen, pero conviene revisar los términos de la model card de unsloth y del modelo Gemma subyacente antes de un uso comercial.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar calidad frente a alternativas.
- Inconsistencias de empaquetado: un tamaño de paquete declarado de 0 B junto a un repositorio de 8,1 GB y una ABI no registrada sugieren que los metadatos del paquete no están completamente poblados.
- Producción distribuida: el rendimiento dependerá de la red entre nodos; no se publican cifras de latencia ni de tolerancia a fallos de peers.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meshllm/gemma-4-E4B-it-Q4_K_M-layers
- Modelo de origen: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Referencia canónica del GGUF de origen: `unsloth/gemma-4-E4B-it-GGUF@bfc15c382204943c3a8fff0c750b94ae2364d7a3/gemma-4-E4B-it-Q4_K_M.gguf`
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Documentación del formato de paquete por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catálogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord del proyecto: https://discord.gg/rs6fmc63eN
- Búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos (sitios de fuentes tipográficas, foros generalistas) no guardan relación con el modelo.
