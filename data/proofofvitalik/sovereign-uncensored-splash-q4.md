# proofofvitalik/Sovereign-Uncensored-Splash-Q4

## Resumen

Sovereign Uncensored Splash Q4 es un paquete de pesos cuantizados publicado por el usuario proofofvitalik sobre el modelo base heretic-org/Qwen3.8-27B-heretic-ara, un Qwen3.8 de 27B parámetros adaptado por Heretic mediante ARA (Arbitrary-Rank Ablation), una técnica de ablación que reduce la tasa de rechazos del modelo original. El resultado se comercializa bajo la marca Sovereign como un modelo "sin censura" orientado a código, uso de herramientas y salidas estructuradas, con licencia apache-2.0 y soporte declarado de inglés y ruso.

El repositorio ocupa 17,4 GB y no contiene safetensors ni GGUF: distribuye un paquete nativo en formato Splash con cuantización affine Q4 con grupo 64, obtenida en una única pasada desde el checkpoint BF16 de Heretic. Incorpora además los pesos de visión originales en BF16 y un borrador Inco DFlash2 para decodificación especulativa, y declara el pipeline image-text-to-text, por lo que cubre entrada de imagen y texto.

Su relevancia práctica está en el enfoque de despliegue: está pensado y probado para Apple Silicon (M4 Max de 48 GB con macOS 26.6.2), con perfiles de 8.192 y 65.536 tokens de contexto, recetas de flujo de trabajo para tool calling y JSON Schema, y dos utilidades propias (Compact Repair y Code Guard) con métricas de eficiencia publicadas por el autor. No se han publicado resultados en benchmarks estándar, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; derivada de Qwen3.8-27B con adaptacion ARA, torre de vision y decodificacion especulativa con borrador Inco DFlash2 |
| Parametros totales | 27B (segun la nomenclatura del modelo base Qwen3.8-27B; la model card no desglosa el recuento exacto) |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | 8.192 tokens en los perfiles Everyday y 65.536 tokens en los perfiles Long; no se declara un maximo nativo superior |
| Tipos de cuantizacion | Q4 affine con grupo 64 (Q4/group64), empaquetado nativo para Splash; no se ofrecen variantes GGUF, MLX ni otras |
| Idiomas soportados | en, ru (declarados en la model card y en los metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | Paquete nativo Splash (17,38 GB); no safetensors ni GGUF |
| Modelo base | heretic-org/Qwen3.8-27B-heretic-ara (relacion: cuantizado) |
| Tamano del repositorio | 17,4 GB |
| Pipeline | image-text-to-text |
| Libreria de inferencia | splash |
| Inferencia alojada | No (metadato inference: false) |
| Fecha de publicacion | 2026-09-23 (creacion) / 2026-09-23 (ultima actualizacion) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de su origen: un Qwen3.8-27B adaptado por Heretic con ARA, el metodo upstream de ablacion de rango arbitrario empleado para reducir los rechazos. El modelo es multimodal (pipeline image-text-to-text) y conserva los pesos de vision originales en BF16 junto al objetivo cuantizado, acompanados del borrador Inco DFlash2 que habilita la decodificacion especulativa. No se detallan numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento posterior.

La aportacion tecnica de este repositorio es de conversion e integracion, no de entrenamiento: el checkpoint BF16 de Heretic se cuantiza una sola vez a affine Q4/group64 y despues se empaqueta para Splash sin una segunda pasada de cuantizacion, con revisiones de origen, codigo de conversion y hashes de artefacto para hacer trazable la compilacion. Sobre ese paquete se anaden recetas de flujo de trabajo (extraccion con politica de seleccion y JSON Schema; acciones de herramienta con decision de parar o pedir informacion faltante), perfiles Fast y Low para controlar el uso de razonamiento, y dos utilidades opcionales: Compact Repair, que pide cambios precisos en lugar de reescribir el fichero, y Code Guard, que valida sintaxis e importaciones de modulos Python aislados y permite una generacion correctiva.

## Capacidades

- Generacion de codigo en Python: la model card documenta la generacion completa de un modulo de 2.131 tokens que supero 20 comprobaciones, y tareas de reparacion sobre codigo sintetico.
- Edicion de codigo acotada (Compact Repair): solicita cambios concretos, conserva el original, rechaza ediciones ambiguas u obsoletas y verifica el candidato antes de guardarlo.
- Validacion de codigo Python (Code Guard): comprobacion de sintaxis e importaciones de modulos aislados, con una generacion correctiva permitida y registro de respuesta original, correccion, tokens y latencia.
- Tool calling / function calling: incluye una receta de flujo de trabajo para acciones y decisiones dentro del uso de herramientas.
- Salidas estructuradas: receta de extraccion que combina una politica de seleccion precisa con JSON Schema.
- Flujos de agente con razonamiento multi-paso: los perfiles Low habilitan razonamiento y reservan espacio de salida para el mismo.
- Modo de razonamiento conmutable: los perfiles Fast desactivan el "thinking"; los perfiles Low lo permiten y amplian la cuota de tokens de salida.
- Capacidades multimodales: pipeline image-text-to-text con pesos de vision en BF16, por lo que acepta entradas de imagen ademas de texto.
- Decodificacion especulativa: el borrador Inco DFlash2 acelera la generacion, segun las mediciones del autor.
- Multilingue limitado: ingles y ruso declarados explicitamente.
- Contexto largo: perfiles Long de hasta 65.536 tokens, con 49.152 tokens disponibles para entrada cuando se reservan 16.384 para salida.

## Casos de uso

- Reparacion de codigo en pipelines de CI: Compact Repair esta disenado para aplicar cambios quirurgicos en lugar de reescribir ficheros completos; en la validacion del autor paso 36 de 36 suites de pruebas con un 79,2 % menos de tokens de salida, lo que abarata su integracion como paso automatico de correccion.
- Agente de codigo con herramientas: la receta de tool workflow cubre acciones y la decision de detenerse o solicitar informacion faltante, lo que encaja en asistentes que deben decidir cuando no tienen datos suficientes antes de tocar un repositorio.
- Extraccion de datos estructurados: la combinacion de politica de seleccion y JSON Schema permite convertir texto o imagenes en registros validados, util en ingestas documentales donde la salida debe ajustarse a un contrato.
- Asistente local privado en Apple Silicon: el paquete esta probado en un M4 Max de 48 GB con LM Studio y el runtime Splash, de modo que puede ejecutarse en un equipo de sobremesa sin enviar datos a servicios externos.
- Analisis de documentos largos: con el perfil Long de 65.536 tokens y 49.152 tokens utiles de entrada, admite expedientes, informes o bases de codigo extensas en una sola sesion.
- Validacion automatica de entregables Python: Code Guard permite comprobar sintaxis e importaciones de modulos generados y registrar la correccion aplicada, lo que sirve como puerta de calidad previa a la revision humana.
- Investigacion sobre alineacion y rechazos: al ser un modelo ablacionado, es util para estudiar el comportamiento de modelos sin filtrado de rechazos, siempre con las salvaguardas descritas en las limitaciones.
- Atencion y asistencia bilingue ingles-ruso: los dos idiomas declarados cubren bases de usuarios que trabajan en esos dos idiomas, con la advertencia de que no hay soporte declarado para castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras siguientes son mediciones del autor sobre tareas de flujo de trabajo, con protocolos y salidas publicados, y no constituyen una comparativa de capacidad frente a otros modelos.

| Medicion | Resultado | Condiciones declaradas |
|---|---|---|
| Reparacion compacta | 36/36 suites de pruebas superadas | 36 tareas Python sinteticas nuevas, con comprobaciones ejecutables |
| Ahorro de tokens en reparacion | 79,2 % menos de tokens de salida | 2.303 frente a 11.076 tokens; una peticion por tarea, sin reintentos |
| Ahorro de tokens incluyendo prompt | 20,5 % de reduccion | Mismas 36 tareas |
| Ahorro en fuentes largas | 86,2 % menos de tokens de salida | Subconjunto de 12 fuentes mas largas |
| Tiempo de pared en reparacion | 41,8 % menos | Frente a generacion de fichero completo |
| Generacion de fichero completo | 35/36 | Un fallo de formato en prosa cuyo codigo extraido si paso la revision |
| Code Guard | 4/4 modulos y 46 comprobaciones funcionales externas superadas | Tras una reparacion que anadio 11,85 segundos |
| Throughput en Python | 114,8 tokens/s observados | Un modulo Python completo de 2.131 tokens que paso 20 comprobaciones |
| Throughput medio | 72,47 tokens/s | Media de una serie inicial de 18 peticiones |
| Reparacion marcada como opcional | No entrena pesos nuevos | La mejora procede del flujo de edicion, no del modelo |

## Requisitos de hardware

- Tamano de pesos: 17,38 GB ocupados por el paquete nativo Q4; el repositorio completo ocupa 17,4 GB, incluyendo pesos de vision en BF16 y el borrador DFlash2.
- Memoria para inferencia: no disponible de forma desglosada; a los pesos hay que sumar la cache KV del contexto elegido y los componentes no cuantizados, por lo que el requisito real supera los 17,38 GB.
- Configuracion probada: Apple M4 Max con 48 GB de memoria unificada, macOS 26.6.2, con una configuracion de 64K validada sobre ese hardware.
- GPU compatibles: no disponible. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD.
- GPU de consumo: no disponible. El unico hardware documentado es Apple Silicon de gama alta.
- Despliegue: LM Studio 0.4.25+1 con el runtime oficial Splash 0.0.5, o Splash 1.0.1 en modo independiente, con las entradas de carga "Sovereign Uncensored Native" y "Sovereign Uncensored Native Long 64k".
- Formatos no soportados: los pesos requieren Splash y no son un checkpoint MLX ni GGUF, por lo que no se pueden cargar directamente en llama.cpp, Ollama, vLLM, TGI u otros runners que consuman esos formatos.
- Latencia y throughput: 114,8 tokens/s de pico y 72,47 tokens/s de media en tareas Python sobre el M4 Max; una reparacion concreta de Code Guard anadio 11,85 segundos al flujo.
- Contexto y memoria: ampliar el contexto a 65.536 tokens requiere la entrada de carga Long, ya que un preset de generacion por si solo no agranda la ventana.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Sovereign Uncensored Splash Q4 | 27B (segun nomenclatura) | 8.192 / 65.536 tokens | apache-2.0 | Paquete nativo Splash Q4/group64 | 0 descargas, 0 likes en el momento de la consulta |
| heretic-org/Qwen3.8-27B-heretic-ara (modelo base) | 27B (segun nomenclatura) | No disponible | No disponible | BF16 (origen de la cuantizacion) | No disponible |
| Otras alternativas de 27B ablacionadas o cuantizadas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparacion de rendimiento, licencia o disponibilidad mas alla de la relacion con su modelo base.

## Limitaciones y advertencias

- Modelo ablacionado y "uncensored": procede de una ablacion orientada a reducir rechazos, por lo que carece de las salvaguardas habituales de alineamiento y puede producir contenido inapropiado, danino o ilegal. La propia model card advierte de que "uncensored" identifica el linaje y no garantiza nada sobre cada respuesta.
- Impacto de la ablacion no documentado: no se aportan datos sobre cuanto degrada ARA la calidad, la coherencia o el seguimiento de instrucciones respecto al modelo original, ni sobre la tasa de rechazos resultante.
- Riesgo de alucinacion no caracterizado: no hay evaluaciones de veracidad ni de tasa de alucinacion, y la ausencia de benchmarks estandar impide acotar el error en tareas de conocimiento.
- Cobertura idiomatica reducida: solo se declaran ingles y ruso; el castellano no figura entre los idiomas soportados, por lo que su rendimiento en espanol no esta respaldado por la documentacion.
- Dependencia de un runtime especifico: los pesos exigen Splash y no son compatibles con GGUF ni MLX, lo que limita el ecosistema de herramientas, el soporte de versiones y la portabilidad a otros entornos.
- Orientacion a Apple Silicon: la unica configuracion probada es un M4 Max de 48 GB con macOS; no hay evidencia publicada de funcionamiento en GPU NVIDIA o AMD ni cifras de VRAM para esas plataformas.
- Metricas de autor no verificadas de forma independiente: las cifras de reparacion y throughput proceden de pruebas ejecutadas por el propio autor con 0 descargas y 0 likes en el repositorio, sin validacion de terceros.
- Alcance de los resultados: la model card indica explicitamente que los datos de Compact Repair demuestran eficiencia de flujo de trabajo y no una ventaja de capacidad de programacion.
- Licencia: apache-2.0 permite uso comercial de este repositorio, pero conviene verificar las condiciones del modelo base heretic-org/Qwen3.8-27B-heretic-ara y de los componentes de terceros (Inco) antes de un despliegue en produccion.
- Sin inferencia alojada: el repositorio marca inference: false, de modo que no ofrece endpoint gestionado en HuggingFace.
- Presupuesto de contexto: en el perfil Long con 16.384 tokens de salida quedan 49.152 tokens para toda la entrada, incluidos historial y herramientas, lo que puede quedarse corto en sesiones de agente prolongadas.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/proofofvitalik/Sovereign-Uncensored-Splash-Q4
- Modelo base: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Rutas relativas dentro del repositorio (anteponer https://huggingface.co/proofofvitalik/Sovereign-Uncensored-Splash-Q4/blob/main/ para obtener la URL completa):
  - tests/compact-repair-validation-2026-09-23/REPORT_EN.md (validacion de Compact Repair, 36 casos)
  - tests/python-throughput-2026-09-22/REPORT_EN.md (serie de throughput en Python)
  - integrations/lm-studio/README.md (instalacion y presets en LM Studio)
  - USAGE.md (ejemplos de API)
  - EVALUATION.md (evaluaciones)
  - examples/WORKFLOWS.md (recetas de flujo de trabajo y ejemplos grabados)
  - tools/code-guard/README.md (CLI, alcance y evidencia de Code Guard)
  - tools/compact-repair/README.md (CLI y uso de Compact Repair)
- Paper, blog o demo independientes: no disponibles en la informacion proporcionada.
