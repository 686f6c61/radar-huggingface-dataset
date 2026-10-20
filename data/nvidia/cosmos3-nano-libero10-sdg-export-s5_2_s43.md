# nvidia/cosmos3-nano-libero10-sdg-export-S5_2_s43

## Resumen

Este repositorio contiene una política de acción (VLA, vision-language-action) derivada de `nvidia/Cosmos3-Nano` y post-entrenada sobre LIBERO-10, un benchmark de manipulación robótica de mesa con 10 tareas. No es un modelo de propósito general: es el export de un checkpoint de entrenamiento concreto, la celda S5_2_s43 (semilla de entrenamiento 43), perteneciente a un estudio controlado de datos sintéticos descrito en la receta "Restyle LIBERO-10 Demonstrations with Cosmos3-Nano-Sim-Transfer and Measure the Gain Against a Matched Control" del Cosmos Cookbook. Lo publica NVIDIA con 15.173.136.576 parámetros en safetensors bf16 (7 shards, aproximadamente 30 GB, pesos EMA) y una tasa de éxito declarada del 91,8 % en escenas estándar y del 86,8 % en escenas perturbadas.

Su relevancia es metodológica más que de producto: sirve como punto de referencia reproducible para medir cuánto aporta el reestilizado de demostraciones con datos sintéticos frente a un control emparejado (D2_s43). El autor advierte explícitamente que una celda reestilizada solo es interpretable junto a su duplicado de control y que diferencias por debajo de 2,5 puntos quedan dentro de la dispersión entre semillas de entrenamiento.

El modelo se carga mediante el servidor de políticas de `cosmos-framework` v1.2.2 (commit `c23e51f2`) y se distribuye bajo la NVIDIA Open Model License. Los datos de entrenamiento no se redistribuyen en este repositorio: LIBERO-10 está disponible como `nvidia/LIBERO_LeRobot_v3` y los conjuntos reestilizados se regeneran con la propia receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; etiquetado como `cosmos3_omni` y tipo de modelo VLA (vision-language-action) para robotica |
| Parametros totales | 15.173.136.576 (15,17 mil millones), segun safetensors |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo se publican pesos bf16; no se ofrecen variantes cuantizadas (GGUF, AWQ, GPTQ) en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (`license: other`); obra derivada de `nvidia/Cosmos3-Nano` |
| Formato de pesos | safetensors (bf16, pesos EMA, 7 shards, ~30 GB) |
| Tipo de modelo | Politica de accion post-entrenada (fine-tune) sobre LIBERO-10 |
| Modelo base | `nvidia/Cosmos3-Nano`, revision `e59a53c2` |
| Framework de inferencia | `cosmos-framework` `c23e51f2` (v1.2.2), servidor de politicas |
| Pipeline declarado | `robotics` |
| Tamano del repositorio | 31,5 GB |
| Datos de entrenamiento | 379 demostraciones reales de LIBERO-10 + 1895 reestilizadas desde la iteracion 1000 (semilla 43) |
| Iteraciones de entrenamiento | Reanudacion R(semilla 43) en 1000 -> 2000, batch global 2048 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, codificador visual o esquema de difusion). Lo que si se documenta es la funcion: se trata de una politica VLA que, dado el estado visual y la instruccion de la tarea, produce acciones motoras, y que se ejecuta a traves del servidor de politicas de `cosmos-framework`. El entrenamiento parte de `nvidia/Cosmos3-Nano` (revision `e59a53c2`) y se realiza en dos etapas dentro de un estudio controlado: primero se reestilizan demostraciones con Cosmos3-Nano-Sim-Transfer y despues se ajusta la politica sobre la mezcla de datos reales y sinteticos.

El detalle cuantitativo del entrenamiento si esta disponible: 379 demostraciones reales de LIBERO-10 mas 1895 demostraciones reestilizadas generadas a partir de la iteracion 1000, con reanudacion desde la semilla 43 en la iteracion 1000 hasta la 2000 y un batch global de 2048. No se especifica el numero total de tokens, la composicion exacta del dataset, ni si hubo RLHF, DPO u otra fase de alineacion; tampoco se describen innovaciones tecnicas de decodificacion. El checkpoint exportado contiene los pesos EMA del entrenamiento.

El punto clave para interpretar el resultado es el diseno experimental: cada celda reestilizada tiene un duplicado de control, y la variacion entre semillas de entrenamiento se situa en torno a 2,5 puntos porcentuales de tasa de exito, por lo que el autor desaconseja leer mejoras menores como señal.

## Capacidades

- Control robotico de manipulacion de mesa en las 10 tareas de LIBERO-10, a partir de observaciones visuales e instrucciones en lenguaje natural.
- Ejecucion de politicas en bucle cerrado mediante el servidor de politicas de `cosmos-framework` v1.2.2.
- Generalizacion medida ante perturbaciones visuales: iluminacion aleatorizada, texturas, skybox y jitter de camara (86,8 % de exito frente a 91,8 % en escenas estandar).
- Generacion de datos sinteticos en el contexto de la receta: el modelo base asociado se usa para reestilizar demostraciones (Sim-Transfer) que despues alimentan el post-entrenamiento.
- Capacidad de servir como referencia reproducible en estudios controlados de datos sinteticos, emparejado con su celda de control D2_s43.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso agentico, vision general, audio ni modo "thinking"; el alcance declarado es el de politica de accion.
- Soporte multilingue: no disponible (las instrucciones de LIBERO estan en ingles; no se declaran idiomas soportados).

## Casos de uso

- Manipulacion robotica en tareas de LIBERO-10: el modelo recibe la imagen de la escena y la instruccion y emite acciones para tareas como abrir un cajon, coger y colocar objetos o accionar un interruptor; es adecuado porque ha sido post-entrenado especificamente sobre esas 10 tareas con 379 demostraciones reales.
- Evaluacion de robustez visual en produccion: permite medir la caida de exito al cambiar iluminacion, texturas, skybox o posicion de camara (5 puntos porcentuales en este checkpoint), lo que sirve para decidir si hace falta aumento de datos antes de desplegar en una celda real.
- Estudio controlado de datos sinteticos: al ser una celda del par reestilizado/control, se usa junto a D2_s43 para estimar el beneficio del reestilizado con Sim-Transfer manteniendo constante el resto del pipeline (batch 2048, semilla 43, iteraciones 1000-2000).
- Reproduccion de resultados: investigadores que quieran replicar la receta del Cosmos Cookbook pueden partir de este export con los pesos EMA ya entrenados en lugar de repetir las 2000 iteraciones.
- Inicializacion para nuevos dominios de manipulacion: el checkpoint sirve como punto de partida para fine-tuning en tareas de mesa distintas, al haber aprendido representaciones de escenas y objetos de LIBERO.
- Integracion en un banco de pruebas de politicas VLA: desplegado con `cosmos-framework`, permite comparar latencia, tasa de exito y degradacion frente a perturbaciones contra otras politicas del mismo framework.
- Docencia y divulgacion tecnica: ejemplo completo y reproducible de un pipeline que va de demostraciones reales a datos sinteticos y de ahi a una politica evaluada con semillas multiples.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los de exito en LIBERO-10 reportados por el propio entrenamiento. El autor indica que los valores de escenas estandar estan pendientes de registro ("record pending") y recomienda leerlos con cautela.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Exito en escenas estandar | 91,8 +/- 0,5 % | 10 tareas x 50 estados iniciales, tres semillas de evaluacion; valores reportados por el entrenamiento, registro pendiente |
| Exito en escenas perturbadas | 86,8 +/- 1,1 % | Mismos estados iniciales con iluminacion, texturas, skybox y jitter de camara aleatorizados; medido en el banco de evaluacion el 2026-10-19 |
| Diferencia frente al control D2_s43 | 1,3 puntos en escenas perturbadas | La tasa absoluta del control no se facilita en la model card |
| Dispersion entre semillas de entrenamiento | ~2,5 puntos | Umbral por debajo del cual el autor considera que las diferencias no son interpretables |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la informacion disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- Pesos en bf16: 15,17 mil millones de parametros equivalen a unos 30,3 GB solo en pesos; el repositorio ocupa 31,5 GB en 7 shards.
- VRAM estimada para inferencia en bf16: en torno a 32-40 GB contando pesos, estados de activacion y buffers del servidor de politicas; cifra orientativa, no publicada por el autor.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB. Una RTX 4090 de 24 GB no permite cargar el checkpoint en bf16.
- GPU de consumo: no cabe en bf16 en ninguna tarjeta consumer actual de 24 GB o menos; requeriria cuantizacion a 8 o 4 bits (aproximadamente 16 GB y 8-10 GB de pesos respectivamente), pero no se publican pesos cuantizados y la compatibilidad con el servidor de politicas no esta documentada.
- Despliegue: el unico mecanismo soportado segun la model card es el servidor de politicas de `cosmos-framework` (v1.2.2, commit `c23e51f2`). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI; se desconoce si funcionan con este checkpoint.
- Latencia y throughput: no disponibles. Al ser una politica de control en bucle cerrado, la frecuencia de inferencia es un requisito critico que debe medirse en el hardware objetivo antes de cualquier despliegue.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible sobre otras politicas VLA comparables (parametros, contexto o tasas de exito), por lo que la comparacion se limita a la propia familia del estudio.

| Modelo | Parametros | Contexto | Tarea | Exito LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cosmos3-nano-libero10-sdg-export-S5_2_s43 (este) | 15,17 mil millones | No disponible | Politica VLA, LIBERO-10, celda reestilizada semilla 43 | 91,8 % estandar / 86,8 % perturbado | NVIDIA Open Model License | Publico en HuggingFace (10 descargas, 0 likes) |
| nvidia/Cosmos3-Nano (base) | No disponible | No disponible | Modelo base Cosmos3 omni, punto de partida del post-entrenamiento | No disponible | NVIDIA Open Model License | Publico en HuggingFace |
| D2_s43 (control emparejado) | No disponible | No disponible | Control del mismo estudio, sin reestilizado | No disponible (solo se publica el delta de 1,3 puntos en perturbado) | No disponible | No disponible como repositorio independiente en la informacion consultada |
| Otras politicas VLA open source (OpenVLA, pi0, etc.) | No disponible | No disponible | Manipulacion robotica | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance muy restringido: es una politica para las 10 tareas de LIBERO-10 en simulacion de mesa; no es un modelo de chat, de codigo ni de vision general, y no debe evaluarse como tal.
- Los resultados de escenas estandar (91,8 %) proceden del propio entrenamiento y el autor marca el registro como pendiente; no estan verificados de forma independiente.
- El delta frente al control (1,3 puntos en escenas perturbadas) esta por debajo del umbral de 2,5 puntos que el propio autor considera dispersion entre semillas, por lo que no puede interpretarse como una mejora concluyente del reestilizado.
- Caida medible de rendimiento ante perturbaciones visuales (5 puntos porcentuales), relevante si se traslada a entornos reales con iluminacion o camaras distintas.
- Sesgos conocidos: no documentados. Al entrenarse solo con demostraciones de LIBERO-10, heredara las limitaciones de ese dataset (objetos, escenas y vocabulario de instrucciones acotados).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si en el de acciones plausibles pero incorrectas o inseguras; no se documentan modos de fallo ni paradas de seguridad.
- Idiomas: no se declara ninguno; las instrucciones de LIBERO estan en ingles, por lo que el uso en castellano no esta validado.
- Licencia: NVIDIA Open Model License (no es una licencia OSI). Es una obra derivada de `nvidia/Cosmos3-Nano`, de modo que se aplican las condiciones del modelo base; hay que revisarlas antes de cualquier uso comercial o redistribucion.
- No se redistribuyen los datos de entrenamiento; cualquier replicacion requiere regenerar los conjuntos reestilizados con la receta y descargar LIBERO-10 por separado.
- Compatibilidad de despliegue limitada a `cosmos-framework` v1.2.2; no hay garantias con otras herramientas de inferencia ni pesos cuantizados oficiales.
- El repositorio tiene un uso muy bajo (10 descargas, 0 likes) y fue creado en octubre de 2026; no hay validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/cosmos3-nano-libero10-sdg-export-S5_2_s43
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia (NVIDIA Open Model License, enlazada desde el modelo base): https://huggingface.co/nvidia/Cosmos3-Nano
- Dataset LIBERO-10 utilizado para el entrenamiento: identificador `nvidia/LIBERO_LeRobot_v3` en HuggingFace (no se redistribuye en este repositorio)
- Receta "Restyle LIBERO-10 Demonstrations with Cosmos3-Nano-Sim-Transfer and Measure the Gain Against a Matched Control", del Cosmos Cookbook: mencionada en la model card, sin URL disponible en la informacion consultada
- Framework de inferencia `cosmos-framework`, v1.2.2 (commit `c23e51f2`): sin URL disponible en la informacion consultada
- Los resultados de la busqueda web no contienen enlaces relevantes al modelo (solo paginas generales de NVIDIA sobre controladores y tienda).
