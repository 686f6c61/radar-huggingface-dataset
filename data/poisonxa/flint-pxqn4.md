# poisonxa/Flint-PXQN4

## Resumen

Flint-PXQN4 es una cuantización del modelo Recursive Flint, un mixture-of-experts (MoE) de 39.785.287.456 parámetros totales (unos 2.500 millones activos por token) orientado a agentes de programación, publicado originalmente por Recursive bajo licencia Apache 2.0. La conversión la firma poisonxa (PXA Network) en su formato propietario PXQN4, partiendo del GGUF Q8_0 de `unsloth/flint-GGUF`. No hay reentrenamiento, ajuste fino ni edición de pesos: es únicamente un cambio de formato y precisión.

El interés de esta ficha es doble. Por un lado, documenta el modelo base Flint y su ventana de contexto declarada de hasta 262.144 tokens, que lo sitúa en la liga de los MoE grandes para tareas de agente con repositorios completos en contexto. Por otro, sirve como caso de estudio de un formato de cuantización de nicho: PXQN4 solo se carga con una build de PXA 4.0 o superior, lo que limita su portabilidad frente a GGUF estándar en llama.cpp.

El archivo ocupa 24,87 GB en disco y el autor lo dimensiona para una tarjeta de 16 GB (Tesla P100 o V100) dejando el resto de capas en RAM del sistema, o para dos tarjetas de 16 GB. La calidad declarada queda a la par de un Q4_K_XL de la línea principal: KLD de 0,326 frente a 0,321, diferencia dentro del error de medida. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE); numero de capas y configuracion de expertos no disponibles |
| Parametros totales | 39.785.287.456 (39,8 B) |
| Parametros activos | ~2.500 millones (2,5 B) por token |
| Longitud de contexto | hasta 262.144 tokens (limite documentado del modelo base) |
| Tipos de cuantizacion | PXQN4 (tier unico en este repo, con los tensores mas sensibles en mayor precision); no incluye otros niveles |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (archivo unico `Flint-PXQN4.gguf`, formato PXQN4 propietario de PXA) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 39,8 B de parametros totales de los que aproximadamente 2,5 B se activan por token, lo que reduce el coste de inferencia por token frente a un denso del mismo tamano. Recursive lo describe como un MoE para agentes de codigo. No se dispone de informacion sobre el numero de capas, el numero de expertos, la estrategia de enrutamiento ni la composicion del dataset de entrenamiento en la informacion proporcionada.

El detalle tecnico relevante de esta publicacion no esta en el entrenamiento, sino en la cuantizacion. PXA partio del Q8_0 de Unsloth y aplico su esquema PXQN4 con calibracion tipo imatrix (etiqueta presente en el repo), manteniendo los tensores mas sensibles en mayor precision. El resultado son 24,87 GB (24.870.895.296 bytes) con sha256 `a8d2fb61e1be97c8b8b01bed00f6aa5ef5ee2cf4743c186fcf8b628c69c15992`. El autor advierte que algunos campos descriptivos internos del GGUF (nombre de Unsloth y fichero de calibracion) se heredan del archivo de origen. La carga requiere una build de PXA con soporte de Flint: PXA 4.0 o superior; PXA 3.1 y anteriores no pueden abrir el archivo. Muestreo recomendado por el autor del modelo base: temperatura 1.0, top_p 0.95, top_k 20.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en el repo), con formato de chat de rol asistente.
- Razonamiento y generacion de codigo orientados a agentes de programacion, segun la descripcion del modelo base.
- Contexto largo: hasta 262.144 tokens declarados, adecuado para volcar repositorios o historiales extensos.
- Compatibilidad con endpoints (`endpoints_compatible`): el autor indica que puede servirse mediante el servidor de PXA (`run-server.sh`), con API compatible.
- Inferencia eficiente por token gracias al enrutamiento MoE (2,5 B activos de 39,8 B totales).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo de razonamiento extendido (thinking). Su disponibilidad no puede confirmarse.

## Casos de uso

- Asistente de codigo sobre repositorios completos: con 262.144 tokens de contexto puede ingerir varios modulos, tests y documentacion en una sola sesion, algo que un modelo de 8k-32k no cubre sin troceado y perdida de coherencia entre ficheros.
- Agente de refactorizacion multi-fichero: el bajo numero de parametros activos (2,5 B) abarata cada paso de un bucle agente con muchas llamadas, mientras el conocimiento total del MoE se mantiene en 39,8 B.
- Revision de pull requests en local: desplegable en una estacion de trabajo con una GPU de 16 GB y RAM de sistema, permite analizar diffs y contexto del repo sin enviar codigo a un servicio externo.
- Despliegue en hardware legacy (P100/V100): al estar dimensionado para tarjetas Pascal y Volta de 16 GB, encaja en infraestructura antigua que no admite modelos densos de esta categoria en BF16.
- Experimentacion con formatos de cuantizacion: util como referencia para comparar PXQN4 contra Q4_K_XL en la misma tarea, con metricas KLD y PPL ya publicadas.
- Servicio interno de chat tecnico: el autor incluye un script de servidor y el modelo soporta el modo conversacional, lo que permite levantarlo como endpoint compatible en una red interna.
- Evaluacion comparativa de motores de inferencia: sirve para medir la madurez de PXA frente a llama.cpp en terminos de soporte de arquitecturas MoE y gestion de offload a RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K). El autor solo reporta metricas de fidelidad de la cuantizacion frente al Q8_0 del original, calculadas sobre 8 fragmentos de texto (medicion PXA, 2026-10-24):

| Metrica | Flint-PXQN4 (este archivo) | Q4_K_XL (linea principal) |
|---|---:|---:|
| Tamano en disco | 24,87 GB | 25,05 GB |
| KLD frente a Q8_0 (menor es mejor) | 0,326 ± 0,015 | 0,321 ± 0,015 |
| Mismo token en top-1 | 86,25 % | 85,90 % |
| Ratio de perplejidad frente a Q8_0 | 1,027 | 1,031 |

El propio autor matiza que la diferencia de KLD queda dentro del error de medida y que no reclama superioridad sobre Q4_K_XL. Con 8 fragmentos, las diferencias pequenas no se resuelven estadisticamente.

## Requisitos de hardware

- VRAM: los pesos solos ocupan 24,87 GB, de modo que una GPU de 24 GB (RTX 3090/4090) no los contiene por completo; hace falta offload parcial o dos tarjetas.
- Configuracion objetivo declarada: una tarjeta de 16 GB (Tesla P100 o V100) con el resto de capas en RAM del sistema, o dos tarjetas de 16 GB (32 GB de VRAM en total, suficiente para los pesos).
- Contexto: el autor indica que reducir `-c` reduce el consumo de memoria; no se publican cifras de KV cache por token, por lo que el presupuesto para 262.144 tokens no esta cuantificado.
- GPU recomendadas: P100 16 GB, V100 16 GB (las mencionadas explicitamente); cualquier configuracion con 32 GB o mas de VRAM agregada es suficiente para los pesos.
- Motor de despliegue: exclusivamente PXA 4.0 o superior con soporte de Flint (canal beta para Valued Supporters en el momento de publicacion). No es compatible con llama.cpp, Ollama ni vLLM en su forma actual, al ser un formato PXQN4 y no un GGUF estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Calidad | Licencia | Motor |
|---|---|---|---|---|---|---|
| Flint-PXQN4 (este) | 39,8 B totales / ~2,5 B activos | 262.144 | GGUF PXQN4, 24,87 GB | KLD 0,326 vs Q8_0 | Apache 2.0 | PXA 4.0+ |
| Flint Q4_K_XL (linea principal del mismo base) | 39,8 B / ~2,5 B activos | 262.144 | GGUF K-quant, 25,05 GB | KLD 0,321 vs Q8_0 | Apache 2.0 | llama.cpp y derivados |
| Flint Q8_0 (unsloth/flint-GGUF) | 39,8 B / ~2,5 B activos | 262.144 | GGUF Q8_0, tamano no disponible | referencia (KLD 0) | Apache 2.0 | llama.cpp y derivados |
| RecursiveSI/flint (original) | 39,8 B / ~2,5 B activos | 262.144 | pesos originales, tamano no disponible | referencia | Apache 2.0 | no disponible |

La comparacion relevante es interna a la familia Flint: este archivo no aporta una ventaja medible de calidad frente a Q4_K_XL y solo se diferencia por un formato propietario y 0,18 GB menos de disco. No se dispone de datos para compararlo con MoE de otros fabricantes.

## Limitaciones y advertencias

- Dependencia de motor: PXA 3.1 (version publica en el momento de la publicacion) y anteriores no cargan el archivo; PXA 4.0 llega primero por canal beta. Esto descarta llama.cpp, Ollama, LM Studio, vLLM y TGI, y reduce drasticamente la portabilidad.
- Calidad medida sobre muestra pequena: KLD y PPL se calcularon sobre 8 fragmentos de texto; el propio autor senala que las diferencias frente a Q4_K_XL no son resolubles con ese tamano de muestra.
- Sin validacion de chat ni de contexto largo: no se ha ejecutado una prueba KLD con tokens de rol asistente ni un test de aguja en contexto largo, precisamente el escenario de uso principal del modelo.
- Perdida de precision: 86,25 % de coincidencia en el token top-1 frente a Q8_0 y ratio de perplejidad 1,027 implican divergencias medibles en generacion greedy a partir de cierta longitud.
- Idiomas no documentados: la model card no declara cobertura linguistica; el comportamiento en castellano no esta verificado.
- Riesgo de alucinacion: no se publican evaluaciones de factualidad ni de tasas de alucinacion; en tareas de agente sobre codigo conviene validar toda salida con tests.
- Repositorio sin traccion: 0 descargas y 0 likes en la consulta, sin validacion independiente por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero "Flint" y "Recursive" son marcas de Recursive; el autor aclara que PXA Network no esta afiliada a Recursive ni a Unsloth y que los nombres se usan solo para describir el origen de los pesos.
- Metadatos heredados: los campos internos del GGUF referidos a Unsloth y su fichero de calibracion no describen esta cuantizacion; conviene no usarlos para trazabilidad.
- Ausencia de datos de rendimiento: sin latencia ni throughput publicados, no es posible estimar coste operativo sin medir en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/poisonxa/Flint-PXQN4
- Modelo base RecursiveSI/flint: https://huggingface.co/RecursiveSI/flint
- Perfil de Recursive en HuggingFace: https://huggingface.co/RecursiveSI
- GGUF Q8_0 de origen (unsloth/flint-GGUF): https://huggingface.co/unsloth/flint-GGUF
- Perfil de Unsloth en HuggingFace: https://huggingface.co/unsloth
- Discord de PXA Network: https://discord.pxanetwork.com
- Apoyo al autor (Ko-fi): https://ko-fi.com/shatteredrealms1
- Paper, blog tecnico y demo: no disponibles en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo (solo contenido no relacionado), por lo que no se enlaza ningun resultado adicional.
