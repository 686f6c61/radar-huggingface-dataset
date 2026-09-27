# 1bit-MONSTER/ZAYA1-reasoning-base-GGUF

## Resumen

ZAYA1-reasoning-base-GGUF es una conversión al formato GGUF del modelo Zyphra/ZAYA1-reasoning-base, publicada por el usuario 1bit-MONSTER dentro del proyecto 1bit engine. Se trata del checkpoint base (sin post-entrenamiento de instrucciones) de la familia ZAYA de Zyphra, una arquitectura de mezcla de expertos (MoE) con 8.840.233.464 parámetros totales (aproximadamente 8,8 mil millones), 40 capas y 16 expertos, según los datos declarados en la model card y en los safetensors del repositorio original.

La relevancia de esta ficha es fundamentalmente práctica: el checkpoint original de Zyphra conserva un layout tipo Megatron que `transformers` no puede cargar, y el ecosistema estándar de llama.cpp tampoco incluye soporte para la arquitectura ZAYA. El autor resuelve ambos problemas con un conversor propio que reordena los tensores al layout estándar de ZAYA (los pesos de la convolución agrupada se escriben en orden "tap-major", que es lo que espera el grafo) y con un fork de llama.cpp. Como resultado, el modelo se puede ejecutar en un solo fichero GGUF cuantizado.

El artefacto publicado es un único fichero, `ZAYA1-reasoning-base-Q4_K_M.gguf`, con contexto de 32.768 tokens y rope theta 1e6. El autor reporta una perplejidad de 10,15 ± 0,22 en wikitext-2 (60 fragmentos de 512 tokens) sobre Vulkan en una Radeon 8060S y una velocidad de decodificación de 89-91 tok/s en modo chat, lo que lo sitúa como una opción viable para equipos sin GPU dedicada de gama alta. La licencia Apache 2.0 se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con convolucion agrupada, checkpoint original en layout Megatron; 40 capas y 16 expertos |
| Parametros totales | 8.840.233.464 (aproximadamente 8,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `ZAYA1-reasoning-base-Q4_K_M.gguf`) |

Otros datos tecnicos declarados: rope theta 1e6, tamano del repositorio 5,6 GB, compatibilidad declarada con endpoints (tag `endpoints_compatible`) y modelo base Zyphra/ZAYA1-reasoning-base.

## Arquitectura y entrenamiento

La model card describe el modelo como un MoE de forma 8B con 40 capas y 16 expertos, derivado del checkpoint Zyphra/ZAYA1-reasoning-base. El detalle arquitectonico mas relevante para la conversion es la presencia de una convolucion agrupada cuyos pesos deben escribirse en orden "tap-major" para que el grafo de computacion los interprete correctamente; ese es precisamente el punto donde fallan las conversiones genericas y donde incide el conversor del autor. El checkpoint original mantiene el layout de Megatron, incompatible con `transformers`, por lo que la conversion no es un simple cambio de contenedor sino un remapeo de tensores. El autor afirma que convertir `Zyphra/ZAYA1-8B-legacy` por esta misma via produce tensores byte a byte identicos a los de `Zyphra/ZAYA1-8B`, lo que sirve como validacion del conversor.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplico RLHF, DPO u otro post-entrenamiento. Por la propia naturaleza del artefacto (etiquetado como `base-model` y descrito como `reasoning-base`) se trata de un modelo preentrenado sin ajuste de instrucciones, aunque la model card indica que responde a prompts de chat con su propia plantilla y que "piensa primero". El autor senala ademas que, en perplejidad sobre texto crudo, los modelos base rinden mejor que los post-entrenados: en la misma prueba, el ZAYA1-8B post-entrenado obtiene 32,13 frente al 10,15 del base cuantizado. Esa cifra no debe interpretarse como una comparacion de calidad de tarea, sino como una diferencia esperada entre distribuciones de texto crudo y de texto conversacional.

## Capacidades

- Generacion de texto autoregresiva: al ser un modelo base, su funcion principal es la continuacion de texto, no el dialogo instruido.
- Razonamiento: la variante se denomina `reasoning-base`, orientada a tareas de razonamiento, aunque no se documentan evaluaciones especificas de razonamiento.
- Modo "thinking first": segun el autor, responde a prompts de chat con su propia plantilla y razona antes de contestar.
- Conversacion: el repositorio incluye el tag `conversational` y compatibilidad declarada con endpoints.
- Ejecucion local en GGUF: permite inferencia en CPU/GPU via el motor 1bit y el fork de llama.cpp del autor.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Vision, audio u otras modalidades: no disponible (no documentado).

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: el fichero Q4_K_M pesa 5,6 GB y el autor mide 89-91 tok/s de decodificacion en una Radeon 8060S integrada bajo Vulkan, por lo que es adecuado para portatiles y mini-PC con graficos integrados recientes.
- Generacion de texto y continuacion de documentos: al ser un modelo base, encaja en tareas de autocompletado de texto largo, redaccion asistida por continuacion y generacion de borradores sobre corpus de dominio.
- Punto de partida para fine-tuning: un checkpoint base en Apache 2.0 con 8,8 mil millones de parametros sirve como inicializacion para ajustes supervisados o DPO especificos de dominio antes de cuantizar.
- Experimentacion con arquitecturas MoE: util para investigadores que quieran estudiar el comportamiento de una MoE de 16 expertos con convolucion agrupada en un runtime alternativo a los habituales.
- Construccion de asistentes conversacionales autoalojados: con la plantilla propia del modelo y 32.768 tokens de contexto, se puede desplegar un chat interno para documentacion tecnica extensa sin enviar datos a terceros.
- Validacion de pipelines de conversion de pesos: el conversor y la comprobacion de equivalencia byte a byte con `Zyphra/ZAYA1-8B` lo convierten en un caso de prueba util para equipos que construyan sus propias herramientas de conversion.
- Despliegue en el borde (edge) con requisitos de privacidad: al ejecutarse con un unico fichero GGUF y el motor 1bit sobre Vulkan, permite escenarios donde los datos no pueden salir de la maquina.

## Benchmarks y rendimiento

| Prueba | Configuracion | Resultado |
|---|---|---|
| Perplejidad wikitext-2 (test) | 60 fragmentos de 512 tokens, Q4_K_M, Vulkan (Radeon 8060S) | 10,15 ± 0,22 |
| Perplejidad wikitext-2 (test), referencia | Zyphra/ZAYA1-8B post-entrenado, misma prueba | 32,13 |
| Velocidad de decodificacion | Q4_K_M, Vulkan (Radeon 8060S), modo chat | 89-91 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras existentes son las de perplejidad y velocidad anteriores, medidas por el propio autor del repositorio y sin comparacion contra modelos de terceros.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa aproximadamente 5,6 GB, de modo que los pesos requieren del orden de 6 GB. A esa cifra hay que sumar el cache KV correspondiente a 32.768 tokens de contexto, cuyo tamano no esta documentado.
- GPU recomendadas: no hay recomendaciones oficiales del autor. El unico hardware validado explicitamente es una Radeon 8060S (graficos integrados) bajo Vulkan.
- GPU de consumo: por tamano de pesos, el modelo deberia caber en GPU de consumo con 8 GB o mas de VRAM en cuantizacion Q4_K_M con contexto reducido; no hay confirmacion publicada de esta combinacion.
- Opciones de despliegue: motor 1bit (`1bit serve -m ZAYA1-reasoning-base-Q4_K_M.gguf --device vulkan`) y el fork de llama.cpp del autor (rama `1bit/hrx-vulkan-patched`). El llama.cpp upstream no incorpora el modelo ZAYA, y no se documenta soporte para vLLM, TGI, Ollama u otros servidores.
- Latencia y throughput: 89-91 tok/s de decodificacion en modo chat sobre Radeon 8060S con Vulkan. No se publican datos de prefill ni de latencia por peticion.
- Precaución de compatibilidad: los GGUF deben generarse con el conversor del autor; una conversion con herramientas genericas producira pesos mal ordenados para la convolucion agrupada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 1bit-MONSTER/ZAYA1-reasoning-base-GGUF | 8,84 mil millones (MoE, 16 expertos) | 32.768 tokens | GGUF (Q4_K_M) | Apache 2.0 | Requiere motor 1bit o fork de llama.cpp; sin benchmarks de tarea publicados |
| Zyphra/ZAYA1-reasoning-base | no disponible (base del anterior) | no disponible | safetensors con layout Megatron | Apache 2.0 | No cargable directamente en `transformers` |
| Zyphra/ZAYA1-8B | no disponible | no disponible | safetensors | no disponible en la informacion proporcionada | Variante post-entrenada; perplejidad 32,13 en la misma prueba de wikitext-2 |
| Zyphra/ZAYA1-8B-legacy | no disponible | no disponible | safetensors | no disponible en la informacion proporcionada | Sirve para validar el conversor: sus tensores convertidos coinciden byte a byte con ZAYA1-8B |

No se dispone de datos de rendimiento en tareas estandar que permitan comparar esta conversion con alternativas de otros fabricantes del mismo rango de parametros.

## Limitaciones y advertencias

- Es un modelo base (`base-model`): no ha recibido ajuste de instrucciones, por lo que su comportamiento en dialogos puede ser irregular y no sigue necesariamente ordenes complejas.
- Aunque la model card indica que responde con plantilla de chat y "pensando primero", no se documenta ningun proceso de alineacion (RLHF/DPO) ni evaluacion de seguridad.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual, y al tratarse de un modelo base la generacion de contenido incorrecto con apariencia de veracidad es esperable.
- Idiomas soportados: no disponible. No hay confirmacion de cobertura multilingue ni de calidad por idioma.
- Restricciones de licencia: Apache 2.0, heredada del modelo base, permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia.
- Dependencia de toolchain propio: el modelo solo funciona con el motor 1bit o con el fork de llama.cpp del autor; no hay soporte en llama.cpp upstream ni en otros servidores de inferencia documentados, lo que incrementa el coste de mantenimiento en produccion.
- Riesgo de conversion: usar un conversor distinto puede producir pesos con el orden de la convolucion agrupada incorrecto y dar resultados silenciosamente erroneos.
- Datos de rendimiento limitados: las unicas metricas publicadas son perplejidad en wikitext-2 y velocidad de decodificacion en un unico hardware; no hay datos de tareas, multilingue, tool calling ni contexto largo.
- Repositorio practicamente sin traccion: cero descargas y cero "likes" en el momento de redactar la ficha, sin validacion independiente por parte de terceros.
- Componente de cache KV no cuantificado documentado: el impacto real en memoria con contexto completo de 32.768 tokens no esta cuantificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/ZAYA1-reasoning-base-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZAYA1-reasoning-base
- Variante post-entrenada citada: https://huggingface.co/Zyphra/ZAYA1-8B
- Variante legacy citada: https://huggingface.co/Zyphra/ZAYA1-8B-legacy
- Pull request de soporte de ZAYA en el fork: https://github.com/1bit-MONSTER/llama.cpp/pull/14
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Fork de llama.cpp (rama `1bit/hrx-vulkan-patched`): https://github.com/1bit-MONSTER/llama.cpp

Nota: las busquedas web realizadas no han devuelto ninguna fuente relevante sobre el modelo; los resultados obtenidos correspondian a articulos genericos sobre el concepto de "bit" y a un producto comercial homonimo sin relacion.
