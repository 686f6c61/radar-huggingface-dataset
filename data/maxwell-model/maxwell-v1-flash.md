# maxwell-model/Maxwell-V1-Flash

## Resumen

Maxwell-V1.0-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el Maxwell Team, publicado en Hugging Face bajo la licencia Apache 2.0. Segun los datos de safetensors, el checkpoint contiene 36.810.559.422 parametros totales, aunque la model card del autor declara 35B totales y 3B activos por token (excluyendo embeddings). Esta orientado a generacion de texto, razonamiento, tareas agenticas y contextos largos de hasta 256K tokens.

El modelo introduce varias innovaciones arquitectonicas: Maxwell Block Sparse Attention (MBSA), que limita la atencion principal a 4096 tokens por grupo KV manteniendo disponible el cache completo; Manifold-Constrained Hyper-Connections, que amplia el flujo de informacion residual sin coste adicional de atencion o feed-forward; y un esquema de MoE de grano fino con expertos compartidos siempre activos. El entrenamiento se realizo sobre aproximadamente 26T tokens multilingues con el optimizador Muon.

La relevancia actual del modelo radica en su propuesta de equilibrio entre coste de inferencia y capacidades de contexto largo y razonamiento. Con solo 3B parametros activos por token, aspira a un despliegue economicamente viable sin renunciar a una ventana de 256K tokens, un perfil que lo situa en la categoria de modelos MoE eficientes como alternativas a arquitecturas densas de mayor coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Maxwell Block Sparse Attention y Manifold-Constrained Hyper-Connections |
| Parametros totales | 36.810.559.422 (safetensors); la model card declara 35B excluyendo embeddings |
| Parametros activos | 3B por token (segun la model card, excluyendo embeddings) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizador multilingue con mencion especifica a tailandes, lao, birmano, jemer y shan) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere confianza en codigo remoto) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo MoE con backbone mayoritariamente disperso: combina expertos ruteados de grano fino con expertos compartidos siempre activos, usando un sesgo de correccion de ruteo dinamico y una perdida de balanceo de carga ligera a nivel de secuencia. La innovacion principal es Maxwell Block Sparse Attention (MBSA): cada grupo KV mantiene cobertura fija de 8 bloques de prefijo y 8 bloques locales de 128 tokens, y anade hasta 16 bloques remotos seleccionados por un indexer aprendido, acotando la atencion principal a 4096 tokens por grupo KV mientras el cache KV completo sigue disponible. El autor reporta que el kernel MBSA es 6,7 veces mas rapido que GQA denso a 256K. Ademas, las Manifold-Constrained Hyper-Connections introducen multiples flujos residuales con agregacion aprendida y mezcla restringida, ampliando el flujo de informacion sin evaluaciones adicionales de atencion o feed-forward.

El preentrenamiento uso aproximadamente 26T tokens de datos multilingues con el optimizador Muon en la mayoria de matrices de pesos ocultas. El entrenamiento comienza denso y la atencion block-sparse entra en la fase de mid-training a 128K, una vez calentado el indexer contra atencion densa de historial completo, para despues entrenarse conjuntamente con el backbone. La longitud de secuencia se extiende por etapas de 4K a 256K. El post-entrenamiento consta de un SFT en dos etapas (capacidades generales, razonamiento y agenticas, seguidas de problemas mas dificiles y trayectorias de agente), ramas independientes de RL para tareas generales, razonamiento verificable (matematicas, ciencia, logica, codigo) y tareas agenticas (busqueda, uso de terminal, function calling, ingenieria de software), y finalmente una destilacion on-policy multi-profesor que fusiona las ramas supervisando respuestas generadas por el propio estudiante.

## Capacidades

- Generacion de texto conversacional y causal en un unico turno y multi-turno.
- Razonamiento general y razonamiento verificable en matematicas, ciencia, logica y codigo, reforzado mediante RL.
- Capacidades agenticas: busqueda, uso de terminal, function calling y tareas de ingenieria de software, segun las ramas de RL descritas.
- Soporte de tool calling / function calling (incluido explicitamente en el entrenamiento agentico).
- Razonamiento multi-paso y trayectorias de agente.
- Contexto largo de hasta 256K tokens con cache KV completo disponible.
- Capacidades multilingues, con tokenizador consciente de escritura y mencion especifica a idiomas del sudeste asiatico de bajos recursos.
- Modelo solo texto: no se declaran capacidades de vision ni audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 256K tokens y al cache KV completo, manteniendo coherencia en sesiones largas sin truncar contexto.
- Generacion de codigo en produccion: el soporte de function calling y su entrenamiento en tareas de ingenieria de software permiten integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o resolucion de issues acotadas.
- Agentes autonomos de busqueda y terminal: las ramas de RL agentico (busqueda, uso de terminal) lo hacen adecuado para orquestar tareas multi-paso con herramientas externas, con un coste de inferencia contenido al activar solo 3B parametros por token.
- Analisis de documentos extensos: informes, expedientes o bases de codigo de cientos de miles de tokens pueden procesarse en una sola pasada aprovechando la ventana de 256K y la atencion block-sparse, que reduce el coste del mecanismo de atencion a 4096 tokens por grupo KV.
- Asistentes de razonamiento tecnico: para problemas de matematicas, ciencia o logica donde se requiere cadena de razonamiento, el modelo ha sido reforzado con RL verificable y destilacion multi-profesor.
- Procesamiento multilingue en el sudeste asiatico: el tokenizador compacto para tailandes, lao, birmano, jemer y shan lo hace util para aplicaciones de traduccion, resumen o atencion al cliente en esos idiomas con menor coste de tokens.
- Despliegue con presupuesto de GPU limitado: al activar solo 3B parametros por token, es candidato para servir cargas de contexto largo en infraestructura mas modesta que la requerida por modelos densos de tamano comparable.

## Benchmarks y rendimiento

La model card referencia una figura (`assets/performance-overview.svg`) con resultados de benchmarks en razonamiento, busqueda agentica y otras capacidades frente a modelos de comparacion, pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los 36,8B parametros totales en safetensors ocupan aproximadamente 73,6 GB en precision original (el tamano del repo es de 73,6 GB); en cuantizacion de 8 bits rondaria los 37 GB y en 4 bits unos 18-19 GB, aunque estas cifras son estimaciones y no datos del autor.
- GPU recomendadas: no disponible. Por volumen de pesos, un despliegue en precision completa requiere GPUs de 80 GB (A100/H100) o multiples GPUs; la cuantizacion permitiria GPUs de 24-48 GB.
- ¿Cabe en consumer GPU? No en precision completa. En cuantizacion de 4 bits podria caber en GPUs consumer de 24 GB (RTX 3090/4090) segun la estimacion de pesos, aunque no hay confirmacion oficial.
- Opciones de despliegue: el modelo usa `custom_code` y arquitectura MoE con atencion block-sparse propia, por lo que requiere cargar codigo remoto con `trust_remote_code=True`. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible. El autor reporta que el kernel MBSA es 6,7 veces mas rapido que GQA denso a 256K, pero sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. La model card menciona modelos de comparacion en su figura de rendimiento, pero no los identifica ni aporta valores numericos. Comparativa: no disponible.

## Limitaciones y advertencias

- Modelo solo texto: no soporta vision ni audio.
- Idiomas soportados no declarados formalmente; la cobertura multilingue se infiere del tokenizador y del entrenamiento, sin lista oficial.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas ni evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Requiere `trust_remote_code=True` por el uso de `custom_code` y arquitectura propia; esto implica ejecutar codigo del autor y revisarlo antes de desplegar en produccion.
- El soporte en frameworks de inferencia estandar (vLLM, llama.cpp, TGI) no esta confirmado, lo que puede limitar el despliegue en produccion.
- No se publican resultados numericos de benchmarks en la informacion disponible, lo que dificulta validar las afirmaciones de rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los terminos del technical report y del repositorio GitHub por si anaden restricciones.
- El modelo tiene muy pocas descargas (1) y likes (2) en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Homepage: https://maxwell-llm.ai/
- Playground: https://maxwell-llm.ai/playground
- GitHub: https://github.com/maxwell-model/Maxwell-V1-Flash
- Technical report: https://github.com/maxwell-model/Maxwell-V1-Flash/blob/main/Maxwell_v1_flash_tech_report.pdf
