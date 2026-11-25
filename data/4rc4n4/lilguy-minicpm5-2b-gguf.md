# 4rc4n4/lilguy-minicpm5-2b-GGUF

## Resumen

lilguy-minicpm5-2b-GGUF es un ajuste fino mediante LoRA del modelo openbmb/MiniCPM5-2B, desarrollado por el usuario 4rc4n4 y publicado en Hugging Face bajo licencia Apache-2.0. No se trata de un modelo conversacional de propósito general, sino de un modelo especializado que emite una única acción por turno siguiendo el protocolo de línea propietario de lilguy, una herramienta local de asistencia para tareas de ficheros en Linux. El modelo base tiene 2.516.756.480 parámetros y el ajuste se distribuye exclusivamente en formato GGUF cuantizado Q8_0 para su uso con llama.cpp.

La relevancia del modelo reside en su enfoque: en lugar de competir en capacidades generales, se optimiza para una tarea concreta dentro de un sandbox Linux con aprobación humana de cada cambio. El autor reporta una puntuación de 83/100 en su suite held-out v2, con una mejora específica en la edición de líneas duplicadas en distintos bloques de un fichero. El modelo no está pensado para uso directo ni para chat: fuera de lilguy, el autor advierte que resulta poco útil.

El contexto operativo está limitado a 4096 tokens, el modelo solo declara inglés como idioma y se sirve con `llama-server -c 4096 -np 1 -ngl all`, con temperatura 0, semilla 42 y un máximo de 256 tokens por petición. El razonamiento (thinking) debe permanecer desactivado, ya que con él activado el modelo no devuelve ninguna acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base MiniCPM5-2B, ajuste LoRA sobre capas lineales) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de servicio en llama-server) |
| Tipos de cuantizacion | Q8_0 (único formato publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-2B, en la revisión `42433e90dad95123ab87729fd7011e7110629556`, y se ajusta mediante LoRA con rango 16, alpha 32 y dropout 0 sobre todas las capas lineales. El entrenamiento usa learning rate 2e-4 con un 3 % de warmup y decaimiento coseno, durante una época (485 pasos de optimizador), con longitud máxima de 4096 y semilla 42. La pérdida se pondera 5× en la primera línea de cada acción, que es donde se toma la decisión. Se emplearon torch 2.11, transformers 5.15 y peft 0.20 sobre una única RTX 3090, con un tiempo de entrenamiento de 47 minutos.

El adaptador resultante se fusionó con el modelo base y se convirtió a Q8_0 mediante llama.cpp. El fichero publicado ocupa 2.679.706.816 bytes (2,50 GiB) y su SHA-256 es `0d90e036f52ee7890df33e877898963d9a657785e0c4cb58532538689be8f233`. Existe también una versión anterior (v1, interfaz v3) con SHA-256 `5626927a90f9981d56ab94d4bed8495c183487df818af63651c4d32055b18c94`, que solo funciona con la interfaz para la que fue entrenada. La innovación técnica principal no es arquitectónica sino de formato de salida: el modelo emite comandos del protocolo de línea de lilguy (`run`, `tool fs.read`, `tool fs.edit`, …, `done`), un paso por turno, con la decisión concentrada en la primera línea de cada acción.

## Capacidades

- Emisión de una única acción por turno en el protocolo de línea de lilguy (`run`, `tool fs.read`, `tool fs.edit`, …, `done`).
- Lectura de valores de configuración en ficheros (por ejemplo, extraer un timeout de un fichero de staging).
- Edición de un valor concreto en un fichero, incluyendo líneas que aparecen repetidas en bloques distintos, mediante un bloque `old` multilínea que incluye una línea vecina.
- Anexado de dos o tres líneas a un fichero existente.
- Movimiento de ficheros nombrados a una carpeta, con espera de aprobación.
- Recuento de líneas que coinciden con un patrón.
- Solicitud de aclaración cuando el fichero nombrado no existe (capacidad parcial, 5/10 en la suite held-out).
- Creación de ficheros con contenido exacto (capacidad limitada, 4/10 en la suite held-out).
- No soporta tool calling genérico, agentes multi-step fuera del protocolo lilguy, visión, audio ni razonamiento extendido (thinking debe permanecer desactivado).
- Capacidad multilingüe: no disponible; solo declara inglés.

## Casos de uso

- Lectura de un parámetro de configuración: el usuario pregunta por el valor de un timeout en un fichero concreto y el modelo emite `tool fs.read` sobre la ruta indicada, devolviendo el valor citado del fichero. Adecuado porque la tarea es acotada y verificable.
- Cambio de un valor en un fichero de configuración: el usuario pide cambiar un timeout de 30 a 45 dejando el retry intacto; el modelo emite `tool fs.edit` con un bloque `old` que incluye la línea vecina para desambiguar. Es el caso donde la versión 2.0 mejora respecto a la 1.0 (9/10 frente a 0/10 en la familia de líneas duplicadas).
- Anexado de líneas a un fichero existente: añadir dos o tres líneas al final de un fichero, con revisión del diff antes de aplicar. Rendimiento de 10/10 en la suite held-out v2.
- Recuento de líneas coincidentes: contar cuántas líneas de un fichero cumplen un patrón, útil para auditorías rápidas de configuración. Rendimiento de 8/10.
- Movimiento de ficheros a una carpeta: reorganizar ficheros nombrados explícitamente, con espera de aprobación antes de aplicar el cambio. Rendimiento de 10/10.
- Verificación de protección de ficheros: el modelo respeta ficheros protegidos y rechaza editarlos (10/10 en la familia correspondiente), lo que permite usarlo como capa de comprobación en flujos con sandbox.
- Tareas de revisión con intervención humana: cualquier operación donde el coste de un error antes de la revisión sea alto y se requiera aprobación explícita del usuario.

## Benchmarks y rendimiento

| Suite / metrica | 2.0 (este fichero) | 1.0 (fichero v1) | MiniCPM5-2B sin ajustar |
|---|---|---|---|
| Held-out v2 (100 tareas) | 83/100 (IC 95 %: 75–89 %) | 76/100 | no disponible |
| Cambios aplicados sin commit | 0 | 0 | no disponible |
| Fallos de infraestructura | 0 | 0 | no disponible |
| "done" en tarea incorrecta | 16 de 17 fallos | 13 de 24 | no disponible |
| Development suite (80 tareas) | 53/80 (IC 95 %: 55–76 %) | 51/80 | 19/80 |
| Segunda ejecución mismo recetario (semilla 43) | 52/80 | no disponible | no disponible |

Desglose por familia en held-out v2 (2.0 vs 1.0):

| Familia | 2.0 | 1.0 |
|---|---|---|
| Mover a una carpeta (espera aprobación) | 10/10 | 10/10 |
| Fichero protegido: edición rechazada | 10/10 | 10/10 |
| Encontrar fichero en subcarpeta y editar | 10/10 | 10/10 |
| Anexar dos o tres líneas | 10/10 | 9/10 |
| Cambiar un ajuste | 9/10 | 9/10 |
| Cambiar línea que aparece en otro bloque | 9/10 | 0/10 |
| Citar un valor de un fichero | 8/10 | 10/10 |
| Contar líneas coincidentes | 8/10 | 10/10 |
| Fichero nombrado ausente: preguntar | 5/10 | 4/10 |
| Crear fichero con líneas exactas | 4/10 | 4/10 |

Notas del autor: la diferencia global entre 2.0 y 1.0 no es significativa por sí sola (McNemar exacto p ≈ 0,14; 12 tareas solo las pasa 2.0 y 5 solo las pasa 1.0). Las tareas de preguntas empeoraron ligeramente en 2.0. En una RTX 3090, la mediana de tarea completa fue de 0,9 s de extremo a extremo, de los cuales 0,22 s corresponden al modelo.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 2,50 GiB, por lo que la inferencia completa en GPU requiere aproximadamente 2,5–3 GB de VRAM, más el overhead de contexto (4096 tokens) y de llama-server.
- GPU recomendadas: RTX 3090 (usada por el autor para medir latencia), así como cualquier GPU con al menos 4 GB de VRAM para el fichero Q8_0 completo.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060). También funciona en CPU con `-ngl 0`, a costa de unos pocos segundos por paso.
- Opciones de despliegue: llama.cpp mediante `llama-server -c 4096 -np 1 -ngl all`; el ecosistema lilguy descarga y verifica el fichero automáticamente con `lilguy setup`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: mediana de 0,9 s por tarea completa en RTX 3090, de los cuales 0,22 s son tiempo de modelo. En CPU, varios segundos por paso. Configuración de petición: temperatura 0, semilla 42, máximo 256 tokens, `enable_thinking: false`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lilguy-minicpm5-2b (este) | 2.516.756.480 | 4096 | 83/100 held-out v2; 53/80 dev | Apache-2.0 | GGUF Q8_0 en Hugging Face |
| openbmb/MiniCPM5-2B (base) | 2.516.756.480 | no disponible | 19/80 dev; held-out no disponible | Apache-2.0 | Hugging Face |
| lilguy v1 (fichero anterior) | 2.516.756.480 | 4096 | 76/100 held-out v2; 51/80 dev | Apache-2.0 | GGUF Q8_0 en Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría (asistentes de ficheros especializados) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: usado fuera de lilguy, el propio autor indica que resulta poco útil. No debe emplearse para chat general ni para programación general.
- Puede declarar éxito de forma incorrecta: en 16 de 17 fallos de la suite held-out v2 dijo "done" en una tarea que había resuelto mal. La revisión humana y el sandbox de lilguy son la salvaguarda, no el modelo.
- Puntos débiles conocidos: crear un fichero con contenido multilínea exacto (4/10); detectar que un fichero nombrado no existe en lugar de elegir uno similar (5/10); anexar a un fichero sin salto de línea final; scripts; y modos `chmod` expresados en palabras en lugar de en octal.
- Las cifras de la development suite son optimistas, ya que los datos de entrenamiento se revisaron observando esa suite; la referencia imparcial es held-out v2.
- El razonamiento (thinking) debe permanecer desactivado; con él activado el modelo no devuelve ninguna acción.
- El modelo solo declara inglés; no hay evidencia de capacidades multilingües.
- El contexto está limitado a 4096 tokens en la configuración de servicio documentada.
- Fuera de alcance explícito: automatización sin supervisión, cualquier tarea donde una acción errónea sea costosa antes de la revisión, y uso sin el sandbox y el paso de revisión de lilguy.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está diseñado para operar dentro de lilguy y su protocolo; el uso comercial fuera de ese contexto no está validado por el autor.
- Solo se publica cuantización Q8_0; no hay variantes GGUF de menor precisión ni pesos en safetensors del ajuste fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4rc4n4/lilguy-minicpm5-2b-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio lilguy: https://github.com/4-R-C-4-N-4/lilguy
- README de lilguy: https://github.com/4-R-C-4-N-4/lilguy#readme
- Instalación de lilguy v2.0.0: https://github.com/4-R-C-4-N-4/lilguy@v2.0.0
