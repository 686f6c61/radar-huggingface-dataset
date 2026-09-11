# hermitdave/BigBang-v1-MLX-VLM-Q4_K_M

## Resumen

BigBang-v1-MLX-VLM-Q4_K_M es una conversion al formato MLX del modelo multimodal BigBang-v1, publicado originalmente por endless-frontier y reempaquetado por el usuario hermitdave. Se trata de un modelo de vision-lenguaje (image-text-to-text) construido sobre una arquitectura MoE denominada qwen3_5_moe, con 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token, gracias a un enrutado sobre 256 expertos de los que se activan 8 por token.

La relevancia de esta ficha concreta esta en la cuantizacion: emplea el esquema mixed_4_6, equivalente al Q4_K_M de llama.cpp, que aplica una base de 4 bits y sube la precision en el primer y ultimo octavo de capas, en cada tercera capa, en las proyecciones v_proj y down_proj y en el lm_head. El resultado es un checkpoint de aproximadamente 22 GB que conserva el contexto nativo de 262.144 tokens y anade un codificador visual Qwen3.5 MoE ViT, lo que permite desplegar un VLM de 35B en equipos Apple Silicon con memoria unificada moderada.

El modelo esta pensado para inferencia local en Mac mediante la libreria mlx_vlm (version 0.6.17) y se distribuye bajo licencia Apache 2.0. El repositorio no registra descargas ni likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin validacion comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer MoE con atencion hibrida: lineal + completa) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | ~3 B por token (256 expertos, 8 activos por token) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | mixed_4_6 (equivalente a Q4_K_M de llama.cpp): base de 4 bits con mayor precision en el primer y ultimo 1/8 de capas, cada 3ª capa, v_proj/down_proj y lm_head |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (segun la model card, Copyright 2026 Alibaba Cloud) |
| Formato de pesos | safetensors en formato MLX (generado con mlx_vlm 0.6.17); no se distribuye GGUF |
| Codificador de vision | Qwen3.5 MoE ViT (patch 16, 27 capas, hidden 1152) |
| Tamano del repositorio | 22,0 GB |
| Modelo base | endless-frontier/BigBang-v1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo mixture-of-experts etiquetado como qwen3_5_moe. Combina atencion lineal con atencion completa (esquema hibrido), lo que reduce el coste del cache KV en secuencias largas y permite sostener la ventana de 262.144 tokens sin un crecimiento lineal del consumo de memoria. El componente MoE reparte 256 expertos con 8 activaciones por token, de modo que solo unos 3.000 millones de parametros participan en cada paso de decodificacion pese a los 35,1 B almacenados. El modelo incorpora ademas un codificador visual Qwen3.5 MoE ViT con patch de 16, 27 capas y dimension oculta 1152, encargado de proyectar las imagenes al espacio de tokens del modelo de lenguaje.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares: la model card del repositorio solo documenta el proceso de conversion y cuantizacion. La innovacion destacable de este artefacto concreto no es de entrenamiento sino de compresion: el esquema mixed_4_6 asigna bits adicionales a las capas mas sensibles (extremos de la red, cada tercera capa, proyecciones de valor y de bajada, y la cabeza de salida), siguiendo la logica de las cuantizaciones K-quant de llama.cpp trasladada al formato MLX.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat aplicada mediante `processor.apply_chat_template`.
- Comprension de imagen y texto combinados (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y dialogo sobre contenido grafico.
- Manejo de contextos muy largos (262.144 tokens), adecuado para documentos extensos, multiples imagenes en una misma sesion o historiales de conversacion prolongados.
- Eficiencia de inferencia propia del enrutado MoE: solo ~3 B de parametros activos por token frente a 35,1 B almacenados.
- Cuantizacion mixta que preserva mejor la calidad en las capas criticas en comparacion con una cuantizacion uniforme de 4 bits.
- Capacidades multilingues: no disponible (la model card no declara lista de idiomas).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes intercaladas: gracias a los 262.144 tokens de contexto, se puede introducir un informe completo con graficos y tablas y formular preguntas sobre el conjunto sin trocear el contenido.
- Descripcion y etiquetado automatico de imagenes: el modelo recibe una imagen mediante la API de mlx_vlm y genera descripciones o etiquetas estructuradas, util para catalogos, DAM o pipelines de accesibilidad.
- Asistencia visual para desarrolladores: interpretar capturas de pantalla de errores, diagramas de arquitectura o interfaces de usuario y traducirlos a explicaciones tecnicas o fragmentos de codigo.
- Revision de documentacion tecnica ilustrada: manuales de producto, planos o esquemas电气... (sic) en los que se combinan texto e imagen y se necesita extraer respuestas concretas.
- Prototipado local en Apple Silicon: al pesar unos 22 GB en 4 bits y requerir solo ~3 B de parametros activos por token, permite experimentar con un VLM de 35B en un Mac de gama alta sin depender de servicios en la nube.
- Atencion al cliente con soporte de imagenes: un usuario envia una foto de un producto defectuoso o de un recibo y el modelo mantiene la conversacion multi-turno con el historial completo en contexto.
- Extraccion de informacion de capturas y formularios: lectura de campos, validacion de datos y resumen de documentos escaneados dentro de un flujo batch ejecutado localmente.
- Comparacion de imagenes dentro de una misma sesion: al soportar contexto muy largo, se pueden enviar varias imagenes y pedir analisis comparativos sin reiniciar el estado del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a documentar el proceso de conversion y las caracteristicas de la cuantizacion, sin incluir metricas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluacion. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: los pesos ocupan aproximadamente 22,0 GB. A esa cifra hay que sumar el cache KV y las activaciones, cuyo tamano crece con la longitud de contexto; el cache se ve reducido por el uso de atencion lineal dentro del esquema hibrido, pero no se dispone de cifras exactas.
- Memoria recomendada en Apple Silicon: 32 GB de memoria unificada como minimo operativo con contexto corto, 48 GB para un uso comodo y 64 GB o mas si se pretende explotar la ventana de 262K tokens.
- GPU NVIDIA: este checkpoint esta en formato MLX y la libreria mlx_vlm esta disenada para Apple Silicon, por lo que no es ejecutable directamente en CUDA. No se ofrece una version GGUF ni un checkpoint compatible con vLLM, TGI o llama.cpp en este repositorio.
- GPU consumer: no aplica en su formato actual. En Mac, los equipos con chip de la familia M con 32 GB o mas de memoria unificada son los candidatos naturales.
- Opciones de despliegue: mlx-vlm (Python) para el modo multimodal y mlx_lm para las variantes de solo texto de la misma familia. vLLM, llama.cpp, Ollama y TGI no son compatibles con estos pesos tal y como se distribuyen.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Modalidad | Licencia |
|---|---|---|---|---|---|---|
| BigBang-v1-MLX-VLM-Q4_K_M (este repo) | 35,1 B (3 B activos) | 262K | mixed_4_6 (Q4_K_M) | ~22,0 GB | Multimodal | Apache 2.0 |
| BigBang-v1-MLX-VLM-4bit | 35,1 B (3 B activos) | 262K | uniforme 4 bits | ~20,4 GB | Multimodal | Apache 2.0 |
| BigBang-v1-MLX-Q4_K_M | 35,1 B (3 B activos) | 262K | mixed_4_6 | ~21,0 GB | Solo texto | Apache 2.0 |
| BigBang-v1-MLX-4bit | 35,1 B (3 B activos) | 262K | uniforme 4 bits | ~19,5 GB | Solo texto | Apache 2.0 |
| endless-frontier/BigBang-v1 (base) | 35,1 B (3 B activos) | 262K | no disponible | no disponible | Multimodal | no disponible |

No se dispone de informacion sobre modelos alternativos de otros autores con los que comparar directamente; la model card unicamente lista las cuatro variantes cuantizadas de la misma familia. En terminos practicos, las variantes mixed_4_6 (Q4_K_M) sacrifican entre 0,5 y 1,5 GB de tamano frente a las uniformes de 4 bits a cambio de preservar la precision en capas criticas, mientras que las versiones VLM anaden el codificador visual y su coste asociado.

## Limitaciones y advertencias

- Cuantizacion agresiva: la base de 4 bits introduce perdida de calidad respecto al modelo original en precision completa. El esquema mixed_4_6 la mitiga en capas sensibles, pero no la elimina.
- Riesgo de alucinacion: no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion del modelo, ni en su version base ni en esta cuantizada. En tareas visuales de lectura fina (texto pequeno en imagenes, graficos densos) el riesgo es mayor.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento homogeneo en castellano sin una evaluacion previa.
- Licencia: la model card declara Apache 2.0 con Copyright 2026 Alibaba Cloud, herencia del modelo base original. Conviene verificar la cadena de licencias entre endless-frontier/BigBang-v1 y su origen antes de un uso comercial en produccion, ya que el repositorio consultado no aporta esa trazabilidad.
- Procedencia del reempaquetado: este repositorio pertenece a hermitdave y no a mlx-community, pese a que los ejemplos de codigo de la model card apuntan al namespace mlx-community. El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion de terceros sobre la integridad o el comportamiento de los pesos.
- Restriccion de plataforma: al ser un checkpoint MLX, el modelo queda limitado de facto a hardware Apple Silicon. Esto reduce las opciones de despliegue en infraestructura x86/CUDA.
- Consumo de memoria en contexto largo: aunque la atencion hibrida alivia el coste, explotar los 262K tokens completos exige maquinas con 64 GB o mas de memoria unificada, lo que limita el uso en equipos de gama media.
- Ausencia de datos sobre entrenamiento: sin informacion sobre el dataset, los idiomas o los procesos de alineacion, no es posible evaluar sesgos conocidos ni cumplimiento normativo para casos de uso regulados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hermitdave/BigBang-v1-MLX-VLM-Q4_K_M
- Modelo base: https://huggingface.co/endless-frontier/BigBang-v1
- Variante multimodal 4 bits uniforme: https://huggingface.co/mlx-community/BigBang-v1-MLX-VLM-4bit
- Variante solo texto Q4_K_M: https://huggingface.co/mlx-community/BigBang-v1-MLX-Q4_K_M
- Variante solo texto 4 bits uniforme: https://huggingface.co/mlx-community/BigBang-v1-MLX-4bit

La busqueda web realizada no devolvio resultados relevantes sobre este modelo; las unicas coincidencias encontradas correspondian a contenido no relacionado con inteligencia artificial y se han descartado.
