# nepetai/Ivis-N1.2-Omni

## Resumen
Ivis-N1.2-Omni es un modelo multimodal de tipo vision-language desarrollado por Nepetai, una empresa que se presenta como de origen arabe. El modelo se posiciona como una base fundacional con soporte nativo para arabe, ingles y japones, ademas de generacion de codigo y razonamiento matematico. Su propuesta principal es una arquitectura hibrida que combina capas de atencion transformer con capas Mamba selective SSM y capas de mezcla de expertos (MoE) dispersa, con el objetivo de reducir los parametros activos por token sin sacrificar capacidad.

El modelo declara 2.010.071.296 parametros totales y 1.305.370.880 parametros activos por token, lo que lo situa en la categoria de modelos eficientes de aproximadamente 2B. Incorpora un codificador visual para tareas image-text-to-text y una ventana de contexto declarada de 128.000 tokens. La licencia Apache-2.0 facilita su adopcion comercial, aunque el ecosistema de herramientas y la documentacion publica son muy limitados.

Es relevante ahora porque explora una combinacion poco frecuente en modelos de este tamano (hibrido transformer-Mamba-MoE con vision) y porque cubre el arabe como idioma de primera clase, un nicho con relativamente pocas opciones open source. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer-Mamba-MoE (18 capas de atencion GQA + 6 capas Mamba selective SSM + 4 capas MoE) |
| Parametros totales | 2.010.071.296 (segun model card); 2.351.962.432 (segun safetensors) |
| Parametros activos | 1.305.370.880 (~1.3B, top-1 routing) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe, ingles, japones |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento
La arquitectura declarada es hibrida y unificada. De las 24 capas totales, 18 son capas de atencion transformer con grouped-query attention (32 cabezas de query y 8 de clave-valor), y 6 son capas Mamba selective SSM intercaladas (una capa Mamba cada 4 capas). Sobre esta base se anaden 4 capas de mezcla de expertos dispersa, con 8 expertos por capa y enrutamiento top-1, es decir, se activa un unico experto por token. La dimension oculta es 2048, la dimension intermedia de la FFN es 5324 y la dimension de los expertos MoE es 4096. El vocabulario es de 13.752 tokens, disenado especificamente para arabe, ingles, japones, codigo y matematicas.

El modelo incorpora un codificador visual para tareas de vision-lenguaje. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal mas alla del propio uso de Mamba. La discrepancia entre los parametros declarados en la model card (2.010.071.296) y los reportados por safetensors (2.351.962.432) no esta explicada en la informacion disponible y conviene verificarla antes de cualquier uso en produccion.

## Capacidades
- Generacion de texto conversacional en arabe, ingles y japones.
- Razonamiento matematico basico y resolucion de ecuaciones paso a paso (segun los ejemplos de la model card).
- Generacion de codigo, con ejemplos de funciones en Python.
- Comprension de imagenes combinada con texto (pipeline image-text-to-text) mediante codificador visual.
- Razonamiento multimodal y respuesta a consultas sobre imagenes.
- Soporte declarado de agentes y razonamiento multi-paso (tags agent y reasoning), aunque sin documentacion tecnica que lo detalle.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso
- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en arabe estandar gracias a su ventana de 128.000 tokens y a un vocabulario optimizado para ese idioma, lo que reduce la fragmentacion de tokens frente a tokenizadores genericos.
- Procesamiento de documentos escaneados con OCR asistido: al combinar vision y texto, puede extraer y resumir contenido de facturas, formularios o contratos en arabe e ingles dentro de un mismo pipeline.
- Asistente de soporte tecnico bilingue arabe-ingles: util para empresas que operan en el Golfo Persico o el norte de Africa y necesitan un unico modelo para ambos idiomas.
- Generacion de codigo en entornos de desarrollo: puede integrarse en asistentes de IDE o pipelines de CI/CD para autocompletar funciones y explicar errores, aunque sin garantias de tool calling nativo.
- Analisis de imagenes tecnicas con descripcion textual: por ejemplo, interpretar capturas de pantalla o diagramas y generar explicaciones en ingles o japones.
- Educacion y tutoria matematica: resolucion guiada de ecuaciones y explicacion paso a paso, adecuada para plataformas de aprendizaje en arabe.
- Prototipado rapido en hardware de consumo: sus aproximadamente 1,3B parametros activos permiten desplegarlo en GPUs de gama media para pruebas de concepto, aunque la viabilidad final depende de la implementacion de las capas Mamba y MoE.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 4-5 GB para los pesos, mas overhead de activaciones y cache KV; el repo ocupa 9,4 GB, lo que sugiere pesos en precision superior o artefactos adicionales.
- VRAM estimada con cuantizacion a 8 bits: alrededor de 2,5-3 GB; a 4 bits: alrededor de 1,5-2 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, una RTX 4090 (24 GB) o A100/H100 son holgadas; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB deberian ser suficientes para inferencia en fp16 si la implementacion lo permite.
- Cabe en GPU de consumo: probablemente si, en tarjetas con 8 GB o mas, siempre que exista soporte de las capas Mamba y MoE en el runtime elegido.
- Opciones de despliegue: el modelo requiere custom_code, por lo que necesita transformers con `trust_remote_code=True`. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI; la presencia de capas Mamba y MoE dispersa complica la compatibilidad con runtimes genericos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Vision | Notas |
|---|---|---|---|---|---|
| Ivis-N1.2-Omni | ~2,0B totales / ~1,3B activos | 128.000 | Apache-2.0 | Si | Hibrido transformer-Mamba-MoE, enfoque arabe |
| Qwen2-VL-2B | ~2,2B | 32.768 (extensible) | Apache-2.0 | Si | Transformer denso, soporte multilingue amplio, ecosistema maduro |
| SmolVLM-2B | ~2,2B | 8.192 | Apache-2.0 | Si | Optimizado para eficiencia en dispositivo, sin MoE |
| Gemma 3 4B | ~4B | 128.000 | Gemma license | Si | Transformer denso, contexto largo, licencia con restricciones de uso |

La comparativa se basa en caracteristicas publicas de modelos de tamano y categoria similares; no se dispone de datos de rendimiento de Ivis-N1.2-Omni para establecer comparaciones cuantitativas.

## Limitaciones y advertencias
- No se han publicado benchmarks, por lo que el rendimiento real es desconocido y no puede validarse frente a las afirmaciones de la model card.
- Existe una discrepancia no explicada entre los parametros declarados (2,01B) y los reportados por safetensors (2,35B), lo que puede indicar pesos adicionales, un codificador visual u otro componente no documentado.
- El modelo tiene cero descargas y cero likes, sin historial de uso ni validacion por parte de la comunidad.
- La documentacion tecnica es escasa: no se detallan datos de entrenamiento, composicion del dataset, tecnicas de alineacion ni evaluaciones de sesgo.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de evaluaciones publicas.
- El soporte de tool calling y de agentes aparece solo como etiqueta, sin documentacion que lo respalde.
- La cobertura idiomatica se limita a arabe, ingles y japones; el castellano no esta declarado como idioma soportado.
- La licencia Apache-2.0 permite uso comercial, pero el requisito de `custom_code` implica ejecutar codigo del autor, lo que anade riesgo de seguridad en produccion.
- La compatibilidad con runtimes de inferencia estandar (vLLM, llama.cpp, TGI) no esta confirmada, lo que puede dificultar el despliegue escalable.

## Enlaces
- Hugging Face: https://huggingface.co/nepetai/Ivis-N1.2-Omni
- Paper: no disponible
- Blog o anuncio oficial: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
