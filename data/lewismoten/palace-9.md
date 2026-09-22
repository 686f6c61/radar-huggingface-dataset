# lewismoten/palace-9

## Resumen

Palace-9 (identificador `lewismoten/palace-9`) es un modelo `Qwen2MoeForCausalLM` entrenado desde cero por Lewis Moten para una unica tarea: completar el siguiente movimiento optimo en un tablero de tres en raya (3×3) a partir del historial de jugadas. No es un modelo conversacional ni de proposposito general: recibe una cadena de letras de la `a` a la `i` (una por cada casilla ocupada, en orden cronologico) y devuelve un unico token, que corresponde a la casilla optima libre o al caracter `!` si el historial es invalido o esta fuera de protocolo.

Su interes no esta en la capacidad bruta, sino en su naturaleza extrema: se trata de una implementacion MoE funcional con solo 648.528 parametros totales, 1 capa decodificadora, tamano oculto 36, 9 expertos enrutados con enrutamiento top-2, 1 experto compartido y un vocabulario byte-level personalizado de 261 tokens compatible con GPT-2. El contexto es de 16 tokens, suficiente porque una partida completa de tres en raya ocupa como maximo 9 casillas.

Es relevante ahora como caso limite reproducible de la familia Qwen2MoE: demuestra que el andamiaje de un modelo MoE (enrutamiento, experto compartido, cuantizacion GGUF) puede instanciarse a una escala minuscula y aun asi validarse de forma exhaustiva. El autor publica evidencia de ejecucion sobre 978.003 historiales crudos (294.777 legales y 683.226 invalidos) para cada artefacto GGUF (F16, Q6_K, Q4_K_M) con cero fallos, ademas de un checkpoint fuente en `safetensors`, una demostracion en navegador y un repositorio con codigo y sumas de verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen2MoeForCausalLM` (transformer decoder-only con mezcla de expertos), entrenado desde cero |
| Parametros totales | 648.528 (dato real de `safetensors`) |
| Parametros activos | no disponible de forma exacta; el enrutamiento es top-2 sobre 9 expertos enrutados mas 1 experto compartido, por lo que solo se activa una fraccion del total por token (cifra no publicada) |
| Longitud de contexto | 16 tokens |
| Tipos de cuantizacion | GGUF F16, GGUF Q6_K, GGUF Q4_K_M; no se publica Q8_0 (los tensores de anchura 36 y 18 no cumplen los requisitos de tamano de bloque de Q8_0) |
| Idiomas soportados | `en` (etiqueta declarada); en la practica el dominio se limita a un vocabulario de 261 tokens aplicado a historiales de jugadas con las letras `a`-`i` |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (checkpoint fuente con config y tokenizer compatibles con Hugging Face) y GGUF (F16, Q6_K, Q4_K_M) |
| Capas decodificadoras | 1 |
| Tamano oculto | 36 |
| Atencion | 9 cabezas de consulta × 4 dimensiones; 3 cabezas KV × 4 dimensiones |
| Expertos | 9 expertos enrutados (top-2) + 1 experto compartido |
| Vocabulario | 261 tokens, byte-level, compatible con GPT-2 |
| Tamano del repositorio | 0,0 GB (segun metadatos de Hugging Face) |
| Fecha de publicacion | 22 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es un `Qwen2MoeForCausalLM` con una sola capa decodificadora y tamano oculto 36. La atencion emplea 9 cabezas de consulta de 4 dimensiones cada una (36 dimensiones en total) y 3 cabezas de clave/valor de 4 dimensiones, es decir, atencion con consultas agrupadas. La capa de mezcla de expertos consta de 9 expertos enrutados con enrutamiento top-2 y 1 experto compartido, un esquema clasico de la familia Qwen2-MoE trasladado a una escala minima. El vocabulario es un conjunto byte-level personalizado de 261 tokens compatible con GPT-2, y el contexto maximo es de 16 tokens.

El modelo se entreno desde cero para una unica tarea de finalizacion de estado: dada la secuencia de casillas ocupadas, predecir la siguiente jugada. El contrato de uso es estricto: la plantilla de despliegue es literal (`<bos>{{ .Prompt }}`), se debe usar temperatura 0, contexto de 16 tokens y generar exactamente un token. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se describe ninguna innovacion tecnica mas alla del propio diseno MoE a escala diminuta.

Una particularidad tecnica destacable es el tratamiento de la cuantizacion: el artefacto Q4_K_M es, segun el autor, almacenamiento mixto real, porque los tensores estrechos que no admiten un determinado formato de bloque permanecen en F16/F32 o Q6_K. Esto convierte al modelo en un caso de prueba util para verificar como las herramientas de cuantizacion gestionan anchuras que no encajan en los tamanos de bloque estandar.

## Capacidades

- Finalizacion de un token sobre historiales crudos de tres en raya: dado un historial legal compuesto por letras `a`-`i`, devuelve una casilla optima no ocupada.
- Deteccion de entradas invalidas: historiales malformados, con casillas repetidas, posteriores a un estado terminal o fuera de protocolo devuelven el caracter `!`.
- Ejecucion determinista: con temperatura 0 y `num_predict 1`, la salida es reproducible.
- Despliegue en `llama.cpp` y Ollama mediante GGUF, y carga en `transformers` mediante el checkpoint `safetensors`.
- No implementa protocolo de chat multi-turno.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidad multilingue real: la etiqueta declarada es `en`, pero el dominio funcional son las letras `a`-`i`.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).
- El modelo no incluye la capa de presentacion ficticia que aparece en la demostracion (mapa, indicador DEFCON, trayectorias, graficos de cifrado): esos elementos son JavaScript del navegador y no forman parte de los pesos.

## Casos de uso

- Motor de politica para un tres en raya jugable: integrado en una aplicacion que mantenga el estado del tablero y traduzca las casillas a letras `a`-`i`, el modelo devuelve la jugada optima en un unico token. Es adecuado por su determinismo con temperatura 0 y por cubrir el espacio completo de partidas legales dentro de 16 tokens de contexto.
- Validacion de entrada y control de errores en un juego: cualquier historial corrupto o posterior al final de la partida produce `!`, lo que permite usar la propia salida del modelo como senal de rechazo sin escribir un validador adicional.
- Prueba de conformidad de cuantizaciones: los tres artefactos GGUF (F16, Q6_K, Q4_K_M) se han ejecutado contra los mismos 978.003 casos con cero fallos, por lo que sirven como fixture de regresion al verificar nuevas versiones de `llama.cpp`, Ollama o de las rutinas de cuantizacion.
- Material didactico sobre mezcla de expertos: con 9 expertos enrutados, top-2, un experto compartido, 1 capa y un vocabulario de 261 tokens, permite inspeccionar pesos y rutas de enrutamiento en un modelo cuyo tamano hace viable el analisis manual o la visualizacion completa.
- Ejemplo minimo de integracion con Ollama: el propio autor proporciona un `Modelfile` con `num_ctx 16`, `num_predict 1`, `temperature 0` y plantilla `"""<bos>{{ .Prompt }}"""`, util como plantilla de referencia para despliegues de completado crudo sin chat.
- Pruebas de plantillas de prompt literales: al exigir la plantilla exacta `<bos>{{ .Prompt }}`, el modelo sirve para verificar que un runtime no anade tokens de sistema, roles de chat ni separadores adicionales.
- Oraculo de comparacion en autojuego o evaluacion de agentes: por su salida determinista, se puede contrastar con un algoritmo de busqueda como minimax para detectar discrepancias en la politica aprendida, siempre que el arnes externo gestione el estado del tablero.
- Componente embebido sin GPU: con 648.528 parametros (aproximadamente 1,3 MB en F16) cabe en cualquier CPU moderna e incluso en entornos con memoria muy restringida, lo que permite ejecutarlo como servicio local sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y los resultados no serian interpretables porque el modelo no es de proposito general.

La unica evidencia de rendimiento publicada es una validacion de ejecucion exhaustiva sobre el espacio de historiales crudos, identica para los tres artefactos GGUF:

| Artefacto | Casos evaluados | Fallos | Notas |
|---|---|---|---|
| F16 GGUF | 978.003 (294.777 historiales legales + 683.226 invalidos) | 0 | fixture local verificado con Ollama |
| Q6_K GGUF | 978.003 (294.777 legales + 683.226 invalidos) | 0 | sin fallos reportados |
| Q4_K_M GGUF | 978.003 (294.777 legales + 683.226 invalidos) | 0 | almacenamiento mixto: tensores estrechos en F16/F32 o Q6_K |
| Checkpoint fuente `safetensors` | no disponible | no disponible | no se publica recuento de validacion para el checkpoint fuente |

Estos datos proceden del autor y no han sido verificados de forma independiente. No se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 MB para los pesos en F16 (648.528 parametros × 2 bytes) y del orden de 0,4 MB en Q4_K_M, sin contar el runtime. Es despreciable frente a cualquier GPU o CPU actual.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente; el modelo esta pensado para ejecucion en CPU.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU de consumo, e incluso en sistemas integrados, por su tamano. No se documentan requisitos minimos.
- Opciones de despliegue: `llama.cpp` y Ollama (a partir de los GGUF F16, Q6_K o Q4_K_M) y `transformers` (a partir del checkpoint `safetensors`). El autor no menciona soporte para vLLM, TGI ni otros servidores de inferencia de alto rendimiento.
- Configuracion de inferencia obligatoria: contexto de 16 tokens, generacion de 1 token y temperatura 0.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (modelos MoE de menos de un millon de parametros entrenados desde cero para una tarea de politica de juego). Las busquedas web realizadas no han devuelto resultados relacionados con el modelo: los unicos resultados obtenidos son paginas sin relacion (un sitio financiero sueco, hilos de foro sobre instrucciones de ensamblador y una guia de un videojuego), por lo que no aportan alternativas con las que comparar.

Lo mas cercano conceptualmente seria cualquier implementacion de minimax o de tabla de estados precalculada para tres en raya, pero no se dispone de datos publicados que permitan una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ambito cerrado: el modelo solo resuelve la tarea de continuacion de historial de tres en raya. No genera texto libre, no responde preguntas y no mantiene conversaciones.
- Sin protocolo de chat: el autor indica explicitamente que no implementa un protocolo de chat multi-turno; usarlo como asistente conversacional produce salidas sin sentido.
- Contrato de entrada estricto: solo se deben enviar cadenas de letras `a`-`i` en orden cronologico. Cualquier entrada malformada, con casillas repetidas o posterior al final de la partida devuelve `!`, lo que puede confundirse con un fallo si el integrador no lo espera.
- Contexto muy corto: 16 tokens. No hay margen para prompts largos ni para informacion adicional fuera del historial de jugadas.
- Cobertura limitada: el vocabulario de 261 tokens esta adaptado a esta tarea; el modelo no puede procesar lenguaje natural.
- Idiomas: la etiqueta declarada es `en`, pero no existe capacidad multilingue real. No hay traduccion, comprension ni generacion en castellano ni en ningun otro idioma.
- Alucinacion: la validacion exhaustiva del autor cubre el espacio enumerado de historiales legales e invalidos, pero cualquier entrada fuera de ese espacio (por ejemplo, prompts con formato distinto o texto libre) queda fuera de las garantias declaradas y la respuesta puede ser arbitraria.
- Evidencia no independiente: los resultados de validacion y las cifras de cero fallos provienen del propio autor. No se han publicado evaluaciones de terceros, y el modelo acumulaba 0 descargas y 0 likes en el momento del analisis, por lo que carece de adopcion y de contraste externo.
- Rendimiento de juego no auditado externamente: la afirmacion de que la jugada devuelta es optima procede de la documentacion del autor.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright (Copyright 2026 Lewis Moten) y la licencia. No hay clausulas de uso restringido documentadas.
- Advertencia de alcance: el propio autor senala que se trata de una politica ficticia de tres en raya sin autoridad sobre comandos externos, sin datos del mundo real y sin capacidad alguna sobre sistemas nucleares. Los elementos de la demostracion (mapa, DEFCON, trayectorias, cifrado) son capa de presentacion ficticia y no deben atribuirse al modelo.
- Fechas de publicacion poco habituales: los metadatos indican creacion y actualizacion en septiembre de 2026; conviene tenerlo en cuenta al citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lewismoten/palace-9
- Repositorio de codigo fuente: https://github.com/lewismoten/palace-9
- Demostracion en navegador: https://lewismoten.github.io/palace-9/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Herramienta de acceso citada por el autor (Hermes): https://hermes-agent.nousresearch.com/
- Honcho (soporte de contexto y memoria de proyecto, citado en los agradecimientos): no disponible como enlace directo en la informacion proporcionada
- Paper o informe tecnico: no disponible
- Resultados de benchmarks publicados: no disponible
