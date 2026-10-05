# open-inference/Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2

## Resumen

Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2 es un checkpoint cuantizado publicado por el usuario open-inference a partir del modelo base moonshotai/Kimi-K3. No se trata de un modelo nuevo, sino de una recalibración de precisión reducida: toma como padre el checkpoint open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024 y sustituye la parte densa y la cabeza de vocabulario por versiones calibradas con GPTQ, manteniendo bit a bit los códigos enteros y las escalas FP32 K512 de los expertos enrutados.

El objetivo declarado es servir al runtime personalizado TPU v6e en configuraciones DP8/TP8. El contrato de pesos se identifica como `kimi-k3-v6e-w4a8-performance-v2`, y la propia model card etiqueta el artefacto como «unqualified for production»: no está certificado para carga arbitraria en GPU ni para vLLM. Por tanto, es material de investigación en cuantización y de despliegue en infraestructura TPU muy concreta, no un modelo listo para producción.

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización W4A8 reproducible (con GPTQ de bloques de 128 columnas, sin act-order ni permutación de suavizado, y calibración sobre 128 peticiones más 32 de validación); por otro, deja constancia explícita de las auditorías de procedencia, hashes por tensor y comprobaciones sobre silicio físico v6e con JAX 0.11.1 y libtpu 0.0.46.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE), atencion MLA y componentes KDA, mas torres multimodales; no se detalla la arquitectura completa en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo usa expertos enrutados, pero no se publica el recuento) |
| Longitud de contexto | no disponible (la calibracion usa ventanas de hasta 8K tokens en 16 peticiones de texto, pero no se declara la ventana nativa del modelo) |
| Tipos de cuantizacion | W4A8: pesos W4 con signo en rango [-7,7], punto cero 0 y una escala FP32 real por canal de salida sobre todo el K logico; activaciones A8 enteras; GPTQ con bloques de 128 columnas; expertos con escalas FP32 K512 heredadas del padre |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (etiquetada como `license: other`, con enlace a LICENSE) |
| Formato de pesos | compressed-tensors con `custom_code` sobre la libreria transformers; no se especifica el contenedor exacto en la informacion disponible |

## Arquitectura y entrenamiento

Segun los componentes que la model card indica que se preservan intactos, el modelo original combina proyecciones de compuerta pequenas de KDA, enrutador, embeddings, pesos MLA absorbidos, normas, convolucion, modulos AttnRes y torres multimodales, ademas de expertos enrutados. Es decir, se trata de una arquitectura hibrida de tipo transformer con atencion latente (MLA), componentes recurrentes KDA y mezcla de expertos, con capacidad multimodal. El almacenamiento y la acumulacion recurrentes de KDA permanecen en FP32; la precision de la cache KV se describe como un ABI de runtime independiente y no como un formato de pesos offline.

El proceso de cuantizacion es explicitamente de calibracion post-entrenamiento, no de reentrenamiento. Los 811 bancos densos de runtime seleccionados y la cabeza de vocabulario se calibran con GPTQ usando 128 peticiones (40 de texto, 40 de codigo, 32 de matematicas, 8 de imagen y 8 de fotograma de video) mas 32 peticiones disjuntas de validacion. Dieciseis peticiones de texto admiten hasta 8K tokens; el resto, 2K. Los hiperparametros declarados son 1% de amortiguamiento inicial, bloques de 128 columnas, un maximo de 8192 filas por modulo, recorte ponderado por activacion y ajuste de escalas en FP32, sin act-order ni permutacion de suavizado. Los videos se procesan como cuatro fotogramas cronologicos a traves del procesador de imagen nativo.

La parte de expertos no se recalibra: los codigos enteros y las escalas FP32 K512 se copian bit a bit del checkpoint padre, con hashes por tensor y auditorias de igualdad de serializacion. Se realizo ademas una comprobacion sobre un chip v6e fisico con JAX 0.11.1 y libtpu 0.0.46.1, verificando las proyecciones de columna y fila de la capa cero, los productos punto de K completo, las sumas parciales TP8 de K local con sumas ordenadas, las filas cero y los extremos de cuantizacion de activacion a 4096. La propia model card aclara que es una comprobacion de operador, no una colectiva distribuida ni una validacion de calidad de tarea.

## Capacidades

- Generacion de texto y extraccion de caracteristicas: la libreria declarada es transformers y el pipeline asignado es `feature-extraction`, si bien el checkpoint deriva de un modelo generativo multimodal.
- Razonamiento y codigo: la calibracion incluye dominios de codigo (40 peticiones) y matematicas (32 peticiones), lo que indica que el modelo base cubre esos ambitos, aunque este checkpoint no aporta metricas de calidad.
- Vision: se preservan las torres multimodales y se calibraron 8 peticiones de imagen y 8 de fotograma de video. El procesador HF fijado acepta solo imagenes; la model card advierte que esto no cualifica video nativo fusionado temporalmente ni audio.
- MoE con enrutador preservado: el enrutador mantiene la representacion del modelo fuente, por lo que el comportamiento de seleccion de expertos no se altera respecto al padre.
- Capacidades de agente y tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales: no se declara modo de pensamiento, audio ni decodificacion especulativa.

## Casos de uso

- Investigacion en cuantizacion W4A8: el checkpoint permite estudiar el efecto de recalibrar unicamente las capas densas y la cabeza de vocabulario mientras se congelan los expertos, aislando la contribucion de cada bloque al error final.
- Reproducibilidad de recetas: los ficheros recipe.json, metrics-*.json, heldout-quality.json, artifact-manifest.json, source-to-consumer.json y quant-layer-*-inventory.json permiten replicar el procedimiento con los mismos hiperparametros de GPTQ y el mismo conjunto de calibracion.
- Despliegue interno en TPU v6e DP8/TP8: es el unico escenario para el que el artefacto esta declarado, con el consumidor JAX 0.11.1 / libtpu 0.0.46.1 fijado y verificado a nivel de operador.
- Comparacion padre-hijo: la evaluacion de validacion contrasta esta v2 con el padre manteniendo los mismos expertos y emulador, lo que sirve para medir el coste de la nueva cuantizacion densa y de cabeza.
- Auditoria de integridad de pesos: los hashes por tensor y las comprobaciones de serializacion permiten verificar en produccion que un checkpoint desplegado no ha sido alterado respecto al publicado.
- Estudio de calibracion multimodal: el conjunto incluye peticiones de imagen y de fotograma de video, lo que permite analizar como afecta la calibracion de dominios visuales a un modelo predominantemente textual.
- Base para nuevas variantes cuantizadas: al conservar sin tocar los expertos, es un punto de partida razonable para experimentos que modifiquen solo la parte densa en iteraciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona la existencia de un fichero heldout-quality.json con metricas que comparan esta v2 frente al checkpoint padre, pero no incluye las cifras. Se advierte explicitamente que esas metricas no establecen la calidad del MXFP4 original, ni la precision en generacion o tareas, ni el comportamiento en contexto largo, ni la calidad de servicio en produccion.

## Requisitos de hardware

- Plataforma objetivo: TPU v6e en topologias DP8/TP8. Es el unico entorno explicitamente soportado y auditado.
- GPU: la carga en GPU o vLLM no esta certificada. La model card indica que «arbitrary GPU/vLLM checkpoint loading is not certified» y que los detalles de redondeo en CUDA (FLA, SiTU, reduccion del enrutador) pueden diferir del redondeo de bajo nivel en TPU.
- VRAM estimada: no disponible.
- GPU de consumo: no se declara compatibilidad con RTX 4090 ni con ninguna GPU de consumo.
- Opciones de despliegue: runtime TPU v6e con JAX 0.11.1 y libtpu 0.0.46.1; el manifiesto incluye el codigo del constructor. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| open-inference/Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2 | Este artefacto | no disponible | no disponible | kimi-k3 (`other`) | HuggingFace, 0 descargas, 0 likes |
| open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024 | Checkpoint padre; conserva BF16 en densas y cabeza | no disponible | no disponible | no disponible | HuggingFace |
| moonshotai/Kimi-K3 | Modelo base original; commit f831ab66814297da540d832a5235f8e904f29d06 | no disponible | no disponible | kimi-k3 | HuggingFace |

No se dispone de datos de parametros, contexto ni rendimiento para ninguna de las tres entradas, por lo que la comparativa se limita a la relacion de procedencia y a la licencia.

## Limitaciones y advertencias

- Estado de calidad declarado por el propio autor: «unqualified for production». No debe usarse como modelo de produccion sin una validacion propia.
- Carga no certificada fuera del runtime TPU v6e DP8/TP8. En GPU, vLLM u otros servidores los resultados pueden divergir por diferencias de redondeo.
- Las metricas de validacion comparan v2 contra el padre con la misma emulacion de expertos; no miden la calidad del modelo original ni la precision en generacion, tareas o contexto largo.
- La comprobacion en silicio v6e cubre solo slices de la capa cero y se reejecuto de forma secuencial: es una verificacion de operador, no de un checkpoint completo ni de una colectiva distribuida.
- Precision de la cache KV: se describe como ABI de runtime, no como formato de pesos offline, por lo que el comportamiento en contexto largo depende de la implementacion del servidor y no esta caracterizado aqui.
- Video y audio: el procesador HF fijado acepta solo imagenes; no se cualifica video nativo fusionado temporalmente ni audio, pese a que la calibracion incluya fotogramas.
- Idiomas: no se declara lista de idiomas soportados ni cobertura multilingue.
- Sesgos y alucinacion: no disponible; no se publica ninguna evaluacion de sesgo ni de tasas de alucinacion.
- Licencia `other` bajo el nombre «kimi-k3»: las condiciones de uso comercial dependen del texto de LICENSE del repositorio, que no se reproduce en la informacion disponible. Debe revisarse antes de cualquier uso comercial.
- Actividad nula en HuggingFace (0 descargas, 0 likes) y sin validacion independiente por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/open-inference/Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Checkpoint padre: https://huggingface.co/open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web proporcionados.
