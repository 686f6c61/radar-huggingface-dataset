# OpensourceWTF/Kimi-K3-Q2_K-t158-MTPLX

## Resumen

Kimi-K3-Q2_K-t158-MTPLX es una conversión comunitaria del checkpoint Kimi K3 de Moonshot AI a un codec de cuantización propietario denominado MTPLX, en su variante `t158`, serializada en formato MLX para su ejecución en hardware Apple Silicon. El autor del repositorio, OpensourceWTF, partió de la cuantización Q2_K publicada en formato GGUF por GrEarl y la requantizó aplicando los metadatos oficiales del checkpoint original de Moonshot AI. No se trata, por tanto, de un modelo entrenado desde cero ni de una versión oficial, sino de una redistribución derivada.

El repositorio original alojaba la serialización completa en Safetensors (206 archivos, aproximadamente 752,5 GB) con todos los pesos residentes en memoria. Según la propia model card, ese contenido se ha eliminado para liberar almacenamiento y el repositorio ha quedado reducido a un aviso que redirige al checkpoint soportado en modo streaming. El repositorio mantiene un tamaño declarado de 1390,8 GB, lo que refleja el histórico de artefactos y no el contenido actual utilizable.

La relevancia de esta ficha es doble: por un lado, documenta una vía de ejecución de un modelo de escala frontier (Kimi K3, con 92 capas MoE enrutadas) en hardware de consumo Apple mediante cuantización agresiva a 2 bits; por otro, advierte de que el artefacto principal ya no está disponible en este repositorio y de que la licencia Kimi K3 impone restricciones que deben verificarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 92 capas enrutadas segun la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K de origen, requantizado al codec MTPLX `t158` |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (identificador `kimi-k3`, categoria `other`) |
| Formato de pesos | MLX (libreria `mlx`); el repositorio original contenia Safetensors, actualmente eliminados |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base. Kimi K3 es un modelo de Moonshot AI y, segun los datos de la model card de esta conversion, su arquitectura incluye 92 capas MoE enrutadas, lo que confirma un diseno de mezcla de expertos con enrutamiento disperso. No se dispone de datos sobre el numero total de parametros, los parametros activos por token, el volumen de tokens de entrenamiento, la composicion del corpus ni las etapas de alineacion (RLHF, DPO u otras).

Lo que si documenta esta ficha es el proceso de conversion: los pesos de las 92 capas MoE enrutadas se tomaron de la cuantizacion Q2_K publicada por GrEarl en formato GGUF (revision `0169245d3ea1473a3f9f03bca821d855df5fb2a3`) y se requantizaron al codec MTPLX `t158`, aplicando los metadatos oficiales del checkpoint `moonshotai/Kimi-K3` (revision `9f62e4e9fffbd0a83ddd60e1c209d828994b3569`). Se trata, por tanto, de una cadena de dos cuantizaciones sucesivas (Q2_K y despues t158), lo que acumula perdida de precision respecto al checkpoint original en bf16 o fp16.

La innovacion tecnica relevante aqui no esta en el modelo sino en el formato: MTPLX es un codec de cuantizacion orientado a MLX que, en la variante `t158`, permite reducir el peso del checkpoint hasta hacer viable su ejecucion en Apple Silicon. La model card indica que la version soportada se distribuye en modo streaming, es decir, con carga progresiva de pesos desde disco en lugar de residencia completa en memoria unificada.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Kimi K3, si bien degradadas por la cuantizacion a 2 bits y la doble requantizacion.
- Codigo y matematicas: no se documentan evaluaciones especificas para esta conversion.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ejecucion en Apple Silicon mediante MLX: capacidad confirmada por la libreria declarada y el codec MTPLX.
- Carga en streaming: la version soportada permite ejecutar el checkpoint sin mantener los 752,5 GB de pesos residentes.

## Casos de uso

- Investigacion sobre cuantizacion extrema en MoE: el artefacto permite estudiar como se degrada un modelo de 92 capas enrutadas al pasar por Q2_K y despues por el codec MTPLX `t158`, comparando salidas contra el checkpoint oficial en bf16.
- Evaluacion de codecs propietarios en MLX: util para medir latencia, throughput y calidad de decodificacion del codec MTPLX frente a alternativas como GGUF Q2_K o cuantizaciones MLX estandar de 4 y 8 bits.
- Despliegue local en estaciones de trabajo Apple de gama alta: con la version streaming, un Mac Studio con memoria unificada amplia puede ejecutar el modelo sin infraestructura de GPU dedicada, algo inviable con el checkpoint completo.
- Pruebas de concepto de asistentes de codigo en local: para escenarios donde la confidencialidad impide enviar codigo a APIs externas, aunque la cuantizacion a 2 bits hace recomendable validar la calidad antes de adoptarlo.
- Docencia y divulgacion sobre tecnicas de compresion: el repositorio documenta de forma explicita la cadena de procedencia (GGUF de GrEarl, metadatos de Moonshot AI), lo que lo convierte en un caso de estudio sobre trazabilidad en modelos derivados.
- Auditoria de licencias en modelos derivados: sirve para analizar como se aplican los terminos de la Kimi K3 License a redistribuciones comunitarias y que obligaciones de atribucion se derivan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio original requeria aproximadamente 752,5 GB para la serializacion Safetensors completa; la version streaming reduce el pico de memoria pero no se documenta la cifra exacta.
- GPU recomendadas: la libreria declarada es MLX, orientada a Apple Silicon (familias M1, M2, M3 y M4, con especial ventaja en M2 Ultra y M3 Ultra por su mayor memoria unificada). No se documenta soporte para A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no cabe en ninguna GPU consumer convencional (24 GB o menos) en su configuracion completa; requeriria offloading masivo a disco y RAM del sistema.
- Opciones de despliegue: MLX y el runtime asociado al codec MTPLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-Q2_K-t158-MTPLX (este) | no disponible (92 capas MoE enrutadas) | no disponible | MLX, codec MTPLX t158 | Kimi K3 License | Repositorio original vaciado; redirige a variante streaming |
| GrEarl/Kimi-K3-GGUF (Q2_K) | no disponible | no disponible | GGUF | Kimi K3 License | Publicado en Hugging Face |
| moonshotai/Kimi-K3 (oficial) | no disponible | no disponible | Safetensors | Kimi K3 License | Publicado en Hugging Face |

La comparacion se limita a las tres variantes del mismo modelo base identificadas en la informacion disponible. No se dispone de datos de rendimiento ni de especificaciones completas de alternativas de otros fabricantes para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El repositorio ya no contiene los pesos: la model card indica que la serializacion Safetensors fue eliminada y que el historial se aplano. Cualquier integracion debe apuntar a `OpensourceWTF/Kimi-K3-Q2_K-t158-MTPLX-streaming`.
- Doble cuantizacion acumulada: los pesos pasaron de su precision original a Q2_K y despues al codec MTPLX `t158`, lo que previsiblemente degrada la calidad de forma notable, especialmente en razonamiento, matematicas y codigo. No se han publicado evaluaciones que cuantifiquen esa perdida.
- No es un checkpoint oficial: se trata de una conversion comunitaria con metadatos del modelo original, no de una publicacion de Moonshot AI.
- Licencia restrictiva: la Kimi K3 License (categoria `other`) puede imponer condiciones adicionales al uso comercial, a la redistribucion y a la atribucion. Es obligatorio revisar el texto completo antes de cualquier despliegue en produccion.
- Idiomas no declarados: la ausencia de metadatos de idioma impide garantizar un comportamiento multilingue fiable.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion agresiva suele incrementarlo.
- Dependencia de hardware Apple: el formato MLX y el codec MTPLX limitan la portabilidad a ecosistemas Apple Silicon; no hay ruta documentada hacia CUDA o ROCm.
- Requisitos de almacenamiento elevados: 1390,8 GB de tamano de repositorio declarado y una version completa de 752,5 GB hacen que el almacenamiento sea un cuello de botella practico.
- Sin senales de comunidad: cero likes y 394 descargas en el momento de la consulta, lo que reduce la probabilidad de soporte o correcciones por parte de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpensourceWTF/Kimi-K3-Q2_K-t158-MTPLX
- Version streaming soportada: https://huggingface.co/OpensourceWTF/Kimi-K3-Q2_K-t158-MTPLX-streaming
- Cuantizacion GGUF de origen: https://huggingface.co/GrEarl/Kimi-K3-GGUF
- Modelo oficial de Moonshot AI: https://huggingface.co/moonshotai/Kimi-K3
- Licencia Kimi K3: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
