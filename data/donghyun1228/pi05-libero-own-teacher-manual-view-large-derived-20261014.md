# Donghyun1228/pi05-libero-own-teacher-manual-view-large-derived-20261014

## Resumen

Este repositorio contiene un checkpoint diagnostico derivado de la familia openpi (vision-language-action, VLA), publicado por el usuario Donghyun1228 bajo el identificador `pi05-libero-own-teacher-manual-view-large-derived-20261014`. Segun su propia model card, no es un modelo entrenado de nuevo: se trata de un compuesto de pesos construido a partir de un "parent" manual y de una "legacy source" verificada, con cero actualizaciones de entrenamiento. La vision (vision23) procede del parent manual, mientras que el LLM (LLM9), el action expert (action expert11), la proyeccion (projection8) y el clon de vision para la muñeca (wrist23) proceden de la fuente heredada.

El proposito declarado es instrumentar una intervencion en el endpoint para evaluar el comportamiento de un "conditional teacher", y no proponer un metodo nuevo de retencion ni aislar causalmente el congelado del LLM. Todos los 74 leaves estan en BF16 y llevan registrados su origen y sus hashes individuales, lo que lo convierte en una pieza pensada para trazabilidad y auditoria mas que para despliegue productivo.

Es relevante ahora porque ilustra una practica creciente en IA abierta: publicar checkpoints de diagnostico con procedencia verificable para reproducir evaluaciones de robótica. El repositorio ocupa 5,9 GB, no registra descargas ni "likes", no declara licencia ni idiomas, y su inferencia nativa queda fijada al commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` de la libreria openpi con la configuracion incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de openpi; composicion de vision encoder, LLM, action expert y proyeccion (no se detalla la topologia exacta) |
| Parametros totales | No disponible (el repo pesa 5,9 GB; no se publica el recuento) |
| Parametros activos | No disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (los 74 leaves); no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible (el autor no documenta idiomas) |
| Licencia | No disponible |
| Formato de pesos | No disponible explicitamente; 74 leaves en BF16, inferencia nativa con la libreria openpi y la configuracion incluida |
| Libreria declarada | openpi |
| Tamano del repositorio | 5,9 GB |
| Pipeline | robotics |
| Commit de inferencia nativa | `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` |

## Arquitectura y entrenamiento

El checkpoint es un compuesto de submodulos con procedencias distintas: `vision23` proviene del parent manual; `LLM9`, `action expert11`, `projection8` y el clon de vision `wrist23` provienen de la fuente heredada verificada. Son 74 leaves en BF16, cada uno con su origen y hash registrados. El autor afirma explicitamente que este compuesto no se ha entrenado durante 1000 actualizaciones: el parent si se entreno previamente, pero la combinacion publicada no recibio actualizaciones nuevas. Se incluyen todos los pesos de inferencia y los activos de normalizacion exactos.

La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco describe innovaciones tecnicas del modelo en si. Lo que si queda fijado es el protocolo de evaluacion asociado: vista `view_large`, 40 tareas por 10 episodios, semilla 17, 8 clientes por GPU y MuJoCo 3.2.3. El autor advierte que la aleatoriedad de la politica en servidor compartido no esta emparejada episodio a episodio, y que los resultados de evaluacion no se usaron para ajustar el teacher ni para seleccionar un coeficiente de perdida.

## Capacidades

- Control robótico guiado por vision e instrucciones en lenguaje natural, en el marco de la familia openpi (VLA).
- Generacion de acciones motoras mediante el action expert (`action expert11`) a partir de representaciones del LLM y de la proyeccion.
- Procesamiento de multiples vistas de camara, incluida una vista de muñeca (`wrist23`) clonada desde la fuente heredada.
- Normalizacion exacta incluida, lo que permite reproducir la inferencia tal como se evaluo.
- Trazabilidad a nivel de leaf: cada uno de los 74 tensores tiene origen y hash registrados.
- Intervencion diagnostica sobre el teacher condicional en el endpoint.
- No se documentan capacidades de generacion de texto general, tool calling, function calling, agentes multi-paso, vision generativa, audio ni modo de razonamiento explicito.
- No se documenta soporte multilingue.

## Casos de uso

- Auditoria de procedencia de pesos: dado que cada leaf incluye origen y hash, un equipo de reproducibilidad puede verificar que una copia local coincide bit a bit con el checkpoint publicado antes de usarla en un experimento.
- Estudio de ablacion del teacher condicional: al mezclar la vision del parent manual con el LLM y el action expert de la fuente heredada, sirve para medir como cambia la politica cuando solo se sustituye el modulo visual, manteniendo el resto constante.
- Linea base de control en evaluaciones LIBERO: el protocolo declarado (40 tareas x 10 episodios, semilla 17, `view_large`) permite usarlo como punto de referencia frente a politicas entrenadas de nuevo.
- Depuracion de fallos de politica en simulacion: al no haber entrenamiento adicional, cualquier desviacion respecto al parent es atribuible a la reconfiguracion de modulos, lo que ayuda a localizar que submodulo degrada una tarea concreta.
- Verificacion de canalizaciones de normalizacion: los activos de normalizacion exactos incluidos permiten comprobar que un pipeline de inferencia reproduce las mismas entradas que el entorno de evaluacion original.
- Pruebas de integracion con el stack openpi: al fijar el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`, es util para validar que una instalacion concreta de openpi carga y ejecuta correctamente el checkpoint antes de invertir en entrenamientos largos.
- Formacion y docencia en VLA: sirve como ejemplo tangible de como se documenta un checkpoint compuesto con procedencia por submodulo, sin necesidad de reproducir un entrenamiento costoso.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card describe unicamente el protocolo de evaluacion, sin cifras de exito por tarea:

| Elemento | Valor |
|---|---|
| Vista de evaluacion | `view_large` |
| Tareas | 40 |
| Episodios por tarea | 10 |
| Semilla | 17 |
| Clientes por GPU | 8 |
| Simulador | MuJoCo 3.2.3 |
| Emparejamiento de aleatoriedad | No emparejado episodio a episodio (servidor compartido) |
| Uso de resultados para ajuste | No se usaron para ajustar el teacher ni para elegir coeficiente de perdida |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un repositorio de 5,9 GB con 74 leaves en BF16 sugiere pesos del orden de pocos miles de millones de parametros, de modo que con 16-24 GB de VRAM en BF16 habria margen razonable. Esta estimacion no esta confirmada por el autor.
- GPU recomendadas: no especificadas por el autor. En la practica, el entrenamiento y la evaluacion de VLA de este tipo se ejecutan en A100 o H100; el protocolo de 8 clientes por GPU apunta a un servidor con GPU de datacenter.
- GPU de consumo: no confirmado. Una RTX 4090 (24 GB) podria ser suficiente si los pesos son de pocos miles de millones de parametros y se opera en BF16, pero no hay validacion publicada en la informacion disponible.
- Opciones de despliegue: inferencia nativa con la libreria openpi, fijada al commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` y con la configuracion incluida. No se documentan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a una politica VLA de este tipo.
- Latencia y throughput: no disponibles.
- Entorno de simulacion: MuJoCo 3.2.3 para la evaluacion declarada.

## Comparativa con modelos similares

No hay datos suficientes en la informacion proporcionada para una comparativa cuantitativa fiable. Se ofrece una comparacion cualitativa de categorias:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-own-teacher-manual-view-large-derived) | VLA de diagnostico, sin entrenamiento adicional | No disponible | No disponible | No disponible | HuggingFace, 0 descargas |
| Base openpi / pi0.5 (familia a la que apunta el nombre `pi05`) | VLA entrenada | No disponible en la informacion proporcionada | No disponible | No disponible | No confirmado |
| Otros checkpoints VLA publicos (OpenVLA, RDT-1B, etc.) | VLA entrenadas | No disponible en la informacion proporcionada | No disponible | No disponible | No confirmado |

La diferencia cualitativa clave es que este repositorio no es una politica entrenada de nuevo, sino un compuesto de diagnostico con procedencia registrada. Cualquier comparacion de rendimiento con politicas entrenadas seria metodologicamente incorrecta sin ejecutar el mismo protocolo.

## Limitaciones y advertencias

- No es un modelo entrenado: la model card indica explicitamente cero actualizaciones de entrenamiento y que el compuesto no se entreno durante 1000 actualizaciones. Esperar rendimiento de politica entrenada es un error de expectativas.
- No es un metodo de retencion ni una aislacion causal del congelado del LLM; el autor lo enmarca como una intervencion en el endpoint para evaluar el teacher condicional.
- La fuente heredada no tiene una revision publica verificada en HuggingFace, lo que dificulta la reproducibilidad completa de la procedencia de `LLM9`, `action expert11`, `projection8` y `wrist23`.
- La aleatoriedad de la politica en servidor compartido no esta emparejada episodio a episodio, por lo que las comparaciones entre ejecuciones pueden tener varianza no controlada.
- Licencia no disponible: no hay autorizacion explicita de uso comercial. Cualquier uso en produccion debe tratarse como juridicamente indeterminado.
- No se documentan idiomas soportados, lo que impide afirmar cobertura multilingue de las instrucciones.
- No se publican cifras de benchmarks, por lo que no hay evidencia de rendimiento mas alla de la descripcion del protocolo.
- Sesgos conocidos: no documentados en la informacion disponible. Como toda politica entrenada con datos de manipulacion, es previsible un sesgo hacia las distribuciones de objetos, iluminacion y tareas de su dataset original, pero no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de generalizacion erronea fuera de las condiciones de simulacion evaluadas.
- Sin validacion en hardware real documentada: la evaluacion declarada es en MuJoCo 3.2.3, por lo que la transferencia a un robot fisico no esta respaldada por datos.
- Contexto, cuantizacion alternativa y optimizaciones de latencia no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-own-teacher-manual-view-large-derived-20261014
- Commit de inferencia nativa de openpi: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` (la informacion proporcionada no incluye URL del repositorio)
- No se han proporcionado otros enlaces a papers, blogs, repositorios o demos en la informacion disponible.
