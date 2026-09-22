# kataguru/Qwen3.8-27B-Finnish-Titan-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-Finnish-Titan-Uncensored-NVFP4 es una version cuantizada en NVFP4 del modelo Qwen3.8-27B-Finnish-Titan-Uncensored, publicado por el usuario kataguru en HuggingFace. Se trata de un ajuste fino en finlandes mediante LoRA sobre el modelo base DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, seguido de una fusion de pesos (LoRA merge) y de una cuantizacion posterior en formato NVFP4 empaquetado (compressed-tensors). El resultado es un modelo de proposito general orientado a generacion de texto conversacional en finlandes e ingles, sin filtros de contenido ("uncensored"), con soporte multimodal y capas de prediccion multi-token.

El dato real de parametros extraido de los ficheros safetensors es de 19.135.892.976 parametros (aproximadamente 19,1 mil millones), aunque el nombre comercial del modelo indique "27B". La cuantizacion NVFP4 emplea pesos de 4 bits en coma flotante con tensores de escala en FP8 E4M3 y un group_size de 16, lo que reduce de forma notable el espacio de pesos y esta pensado para hardware NVIDIA Blackwell y RTX 50. El repositorio ocupa 27,8 GB.

Su relevancia actual reside en tres factores: la ventana de contexto nativa declarada de 262.144 tokens, la disponibilidad de variantes de despliegue para vLLM (NVFP4 y W4A16 AWQ) y llama.cpp/LM Studio (GGUF), y un sistema de control de profundidad de razonamiento por plantilla de chat en finlandes. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (tag `qwen3_5`), con capas de prediccion multi-token (MTP) y proyecciones de vision; no se especifica si emplea mezcla de expertos |
| Parametros totales | 19.135.892.976 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos (segun la model card); el ejemplo de despliegue de vLLM usa 65.536 |
| Tipos de cuantizacion | NVFP4 empaquetado (`nvfp4-pack-quantized`): pesos FP4 simetricos de 4 bits con escalas FP8 E4M3, `group_size=16`; vocabulario, `lm_head`, proyecciones de vision y capas MTP conservadas en precision completa. Existen variantes W4A16 AWQ y GGUF multi-cuantizacion |
| Idiomas soportados | finlandes (fi), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema compressed-tensors (NVFP4); variantes adicionales en GGUF y AWQ |

## Arquitectura y entrenamiento

La model card describe un proceso en dos etapas: primero un ajuste fino LoRA sobre el modelo base DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored con datos en finlandes, y despues una fusion de los pesos LoRA en el modelo completo. Sobre ese modelo fusionado se aplica la cuantizacion NVFP4, que actua sobre la practica totalidad de las matrices de pesos pero deja protegidas en precision completa las capas sensibles: el vocabulario, la cabeza de salida (`lm_head`), las proyecciones del modulo de vision y las capas de especulacion MTP. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

Los tags del repositorio (`qwen3_5`, `vision`, `multimodal`, `mtp`, `multi-token-prediction`) indican una arquitectura de tipo transformer con torre de vision y cabezas de prediccion multi-token, lo que habilita decodificacion especulativa interna y entrada de imagenes. La innovacion mas destacable documentada por el autor no es arquitectonica sino de comportamiento: una plantilla de chat en finlandes que implementa profundidad de razonamiento autonoma, con niveles forzables desde el prompt mediante modificadores `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:xhigh}`, `{REASON:medium}`, `{REASON:low}` y `{REASON:off}`. El modo `spoon` se describe como protocolo de investigacion profunda con validacion critica de premisas, y el modo `einstein` como lluvia de ideas creativa con diez perspectivas. El modo sin razonamiento queda restringido a rutinas cortas o peticion explicita del usuario.

## Capacidades

- Generacion de texto conversacional multi-turno en finlandes e ingles.
- Razonamiento con profundidad ajustable mediante modificadores en el prompt, con parser de razonamiento compatible con `qwen3` en vLLM.
- Llamada a herramientas y function calling, con soporte de `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Flujos de agente y razonamiento multi-paso, apoyados en el modo de razonamiento profundo.
- Entrada multimodal: el repositorio incluye proyecciones de vision y el tag `vision`/`multimodal`, lo que implica procesamiento de imagenes.
- Prediccion multi-token (MTP) para acelerar la decodificacion mediante especulacion interna.
- Ventana de contexto de hasta 262.144 tokens para documentos extensos y conversaciones largas.
- Contenido sin filtros: la model card declara tratamiento libre de temas de filosofia, medicina, literatura adulta y ficcion sin moralizacion anadida.
- Capacidades multilingues limitadas a los dos idiomas declarados; no se documenta soporte de otros idiomas.

## Casos de uso

- Atencion al cliente en finlandes: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a la ventana de contexto declarada de 262.144 tokens, manteniendo coherencia en el hilo y permitiendo consultar documentacion de producto dentro del propio contexto.
- Generacion de codigo integrada en pipelines: con soporte de tool calling y el parser `qwen3_coder`, puede conectarse a herramientas de compilacion, ejecucion de tests o consulta de repositorios en un flujo de CI/CD donde el modelo propone cambios y valida resultados.
- Analisis de documentacion legal o administrativa finlandesa: contratos, normativa o expedientes largos pueden cargarse en contexto y consultarse con preguntas concretas, aprovechando el razonamiento profundo para validar premisas y detectar contradicciones.
- Localizacion y traduccion fi-en: traduccion de interfaces, documentacion tecnica y material de marketing entre finlandes e ingles, con registro ajustable segun el nivel de razonamiento solicitado.
- Redaccion creativa y editorial en finlandes: generacion de narrativa, guiones y contenido de ficcion usando el modo creativo con multiples perspectivas, adecuado para borradores que despues pasan por edicion humana.
- Procesamiento de documentos escaneados: al disponer de torre de vision, puede extraer informacion de facturas, formularios o capturas y convertirla en texto estructurado o en llamadas a herramientas.
- Investigacion exploratoria sin restricciones tematicas: analisis de temas sensibles o controvertidos en ambitos academicos donde los filtros de contenido de modelos convencionales bloquean respuestas legitimas.
- Asistencia en dominio medico o biologico: resumen de literatura y explicacion de mecanismos fisiologicos, con la advertencia de que no existe validacion clinica ni garantia de exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso estimado de los pesos en NVFP4: aproximadamente 0,5625 bytes por parametro (4 bits de peso mas 8 bits de escala cada 16 pesos), lo que supone del orden de 10,8 GB para 19,14 mil millones de parametros. A esto se suman las capas conservadas en precision completa (vocabulario, `lm_head`, proyecciones de vision, capas MTP), por lo que el consumo real es superior. El repositorio en disco ocupa 27,8 GB.
- Hardware objetivo declarado: NVIDIA Blackwell y serie RTX 50, que incluyen soporte nativo de FP4. La model card no documenta compatibilidad con generaciones anteriores.
- GPU de consumo: segun la estimacion de pesos, un modelo de este tamano en NVFP4 podria alojarse en GPU con 24 GB o mas (RTX 4090, RTX 5090), siempre que el hardware soporte el formato NVFP4; el contexto disponible en esos casos quedaria muy por debajo de los 262.144 tokens.
- GPU de centro de datos: el ejemplo oficial de vLLM usa `--tensor-parallel-size 2`, lo que implica dos GPU para el despliegue de referencia.
- Memoria de cache KV: no disponible. Con 262.144 tokens de contexto la cache KV crece de forma muy significativa, y el propio ejemplo de la model card reduce `--max-model-len` a 65.536.
- Opciones de despliegue: vLLM 0.29.0 o superior con `--quantization compressed-tensors` y parser de razonamiento `qwen3`; variante W4A16 AWQ para vLLM; variante GGUF para llama.cpp, LM Studio u Ollama.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se proporciona informacion sobre modelos de terceros comparables en la documentacion disponible. La comparacion se limita a las variantes del mismo modelo publicadas por el mismo autor.

| Modelo | Parametros | Contexto | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-Finnish-Titan-Uncensored-NVFP4 | 19,14 mil millones (dato real) | 262.144 tokens declarados | NVFP4, group_size 16, escalas FP8 E4M3 | NVIDIA Blackwell / RTX 50 | apache-2.0 |
| Qwen3.8-27B-Finnish-Titan-Uncensored-W4A16-AWQ | no disponible | no disponible | W4A16 AWQ | GPU con soporte AWQ en vLLM | no disponible |
| Qwen3.8-27B-Finnish-Titan-Uncensored-GGUF | no disponible | no disponible | GGUF multi-cuantizacion | CPU y GPU de consumo via llama.cpp / LM Studio | no disponible |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (modelo base) | no disponible | no disponible | pesos sin cuantizar | GPU de gama alta | no disponible |

## Limitaciones y advertencias

- Modelo declarado como "uncensored": no incorpora capas de rechazo ni alineamiento de seguridad, por lo que puede generar contenido danino, ofensivo o legalmente problematico sin advertencia. No es adecuado para exposicion directa a usuarios finales sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de error. Los resultados deben verificarse en cualquier uso profesional, especialmente en ambitos medico, legal o financiero.
- Cobertura linguistica restringida a finlandes e ingles. No hay datos sobre rendimiento en castellano ni en otros idiomas.
- La disparidad entre el nombre comercial ("27B") y el recuento real de parametros (19,14 mil millones) puede llevar a errores en la planificacion de recursos. Conviene usar el dato de safetensors como referencia.
- Licencia Apache 2.0 declarada para este repositorio, pero el modelo base procede de un autor tercero y su licencia no se verifica en la informacion disponible. Para uso comercial en produccion es recomendable revisar la cadena completa de modelos derivados.
- La cuantizacion NVFP4 depende de soporte de hardware especifico. En GPU sin soporte nativo de FP4 el despliegue puede requerir las variantes AWQ o GGUF.
- El sistema de razonamiento por modificadores (`{REASON:spoon}`, `{REASON:einstein}`, etc.) esta documentado en finlandes y ligado a la plantilla de chat personalizada; su comportamiento fuera de esa plantilla no esta verificado.
- El modelo no tiene descargas ni valoraciones registradas en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- La fecha de publicacion del repositorio es el 22 de septiembre de 2026, con una unica actualizacion tres minutos despues de la creacion; no hay historial de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kataguru/Qwen3.8-27B-Finnish-Titan-Uncensored-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Variante vLLM W4A16 AWQ: https://huggingface.co/kataguru/Qwen3.8-27B-Finnish-Titan-Uncensored-W4A16-AWQ
- Variante GGUF para LM Studio / llama.cpp: https://huggingface.co/kataguru/Qwen3.8-27B-Finnish-Titan-Uncensored-GGUF
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; no se han encontrado papers, blogs ni demos adicionales.
