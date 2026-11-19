# microsoft/FrogNano-4B-2609

## Resumen

FrogNano-4B-2609 es un agente de codificacion compacto a nivel de repositorio desarrollado por Microsoft, derivado del modelo generalista Qwen/Qwen3.5-4B. Su especializacion se lleva a cabo exclusivamente mediante aprendizaje por refuerzo (RL) sobre aproximadamente 1.500 tareas sinteticas de ingenieria de software, generadas, validadas y calibradas contra la propia politica del modelo en evolucion mediante TaskPilot. El modelo opera a traves de un arnes ligero de cinco herramientas denominado Leaf.

La relevancia de FrogNano reside en su enfoque de entrenamiento: no utiliza trayectorias de solucion, acciones, trazas de razonamiento ni parches objetivo procedentes de modelos mas potentes, lo que lo diferencia de las aproximaciones basadas en destilacion de comportamiento. Con tan solo 4.659.865.088 parametros totales, aspira a mejorar la navegacion de repositorios de largo horizonte, la depuracion, la edicion de codigo, la ejecucion de tests y la generacion de parches en un modelo compacto.

Arquitectonicamente hereda el diseno denso de 32 capas hibrido Gated DeltaNet/gated-attention de Qwen3.5-4B, con una longitud de contexto evaluada de aproximadamente 131K tokens en su configuracion de agente de codificacion. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 32 capas hibrido Gated DeltaNet / gated-attention causal |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | Aproximadamente 131K tokens en la configuracion evaluada de agente de codificacion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible de forma explicita; los datos de entrenamiento son predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FrogNano emplea una arquitectura transformer densa de 32 capas que combina Gated DeltaNet con gated-attention, heredada directamente de Qwen/Qwen3.5-4B. El checkpoint upstream incluye componentes de vision para imagen y video, pero FrogNano no los ha sometido a post-entrenamiento ni los ha evaluado, por lo que no se declaran como soportados. El modelo genera hasta 8.192 tokens por turno del asistente en la configuracion validada.

El post-entrenamiento adicional es exclusivamente de texto y se basa en aprendizaje por refuerzo sobre unas 1.500 tareas sinteticas de ingenieria de software a nivel de repositorio, generadas y calibradas con TaskPilot contra la politica en evolucion. Las recompensas se basan en tests ejecutables sobre trayectorias completas de codificacion multi-turno, usando el arnes Leaf de cinco herramientas. No se emplearon trayectorias de solucion, acciones, trazas de razonamiento ni parches objetivo de modelos mas fuertes. El entrenamiento se realizo entre junio y agosto de 2026, con fecha de publicacion el 22 de septiembre de 2026.

## Capacidades

- Resolucion de issues de software a nivel de repositorio a partir de descripciones en lenguaje natural y codigo fuente existente.
- Navegacion de codigo, comprension entre ficheros, depuracion, correccion de bugs e implementacion de funcionalidades.
- Generacion de llamadas estructuradas a las cinco herramientas de Leaf: inspeccion y busqueda de ficheros, edicion de codigo, ejecucion de comandos de shell y ejecucion de tests.
- Generacion y refinamiento iterativo de parches multi-fichero usando la retroalimentacion de comandos y tests.
- Procesamiento de contexto largo de texto y codigo fuente, con aproximadamente 131K tokens de contexto combinado.
- Generacion de texto, razonamiento, codigo fuente y llamadas a herramientas estructuradas como salida.
- Capacidades multilingues: no disponibles de forma declarada; el entrenamiento es predominantemente en ingles.
- Capacidades de vision, audio o thinking mode: no declaradas como soportadas.

## Casos de uso

- Reparacion de bugs en repositorios: dado un snapshot autorizado del repositorio y una descripcion en ingles del issue, el modelo inspecciona ficheros, localiza la causa y propone un parche candidato que el arnes Leaf ejecuta y valida contra los tests.
- Implementacion de funcionalidades acotadas: el modelo navega entre ficheros relacionados, edita el codigo necesario y ejecuta la suite de tests para verificar que no introduce regresiones.
- Correccion de regresiones en integracion continua: integrado con Leaf en un entorno aislado, puede reproducir el fallo, aplicar un cambio y comprobar el resultado antes de que un humano revise el parche.
- Mantenimiento guiado por tests: el modelo genera cambios iterativos usando la retroalimentacion de la ejecucion de tests, adecuado para tareas de refactorizacion con cobertura existente.
- Investigacion sobre agentes de codificacion de largo horizonte: su contexto de aproximadamente 131K tokens y su entrenamiento con recompensas ejecutables lo hacen util como banco de pruebas para estudiar navegacion de repositorios y planificacion multi-paso.
- Asistencia supervisada en desarrollo: un ingeniero puede usar el modelo para diagnosticar y proponer parches sobre un repositorio autorizado, revisando manualmente el resultado antes de aplicarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,66 mil millones de parametros, una estimacion orientativa en FP16 rondaria los 9-10 GB de pesos, y en cuantizaciones de 8 bits o 4 bits se reduciria aproximadamente a la mitad o a un cuarto, respectivamente; estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamano, un modelo de 4,66 mil millones de parametros es plausible en GPU de consumo con cuantizacion, pero no hay validacion publicada.
- Opciones de despliegue: no disponibles. El autor documenta el uso mediante el arnes Leaf y el repositorio GitHub asociado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FrogNano-4B-2609 | 4,66 mil millones | Aproximadamente 131K tokens | Agente de codificacion RL con arnes Leaf | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible en la informacion | no disponible en la informacion | Modelo generalista multimodal | no disponible en la informacion | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento es sensible al arnes Leaf y a la calidad de los tests; fuera de ese entorno los resultados pueden degradarse.
- Los datos de entrenamiento son predominantemente Python y en ingles, lo que limita su generalizacion a otros lenguajes e idiomas.
- Los parches generados pueden ser incorrectos o inseguros aunque superen los tests disponibles; requieren revision humana, pruebas de regresion y validacion de seguridad antes de su uso o despliegue.
- No se utilizaron datasets especificos de seguridad, preferencias de rechazo, contenido danino ni adversariales; el modelo no debe considerarse alineado de forma independiente para despliegue autonomo sin restricciones.
- El modelo no despliega cambios por si mismo: Leaf ejecuta las llamadas autorizadas en un entorno de repositorio aislado y produce un parche candidato.
- Los componentes de vision heredados no han sido post-entrenados ni evaluados y no se declaran como soportados.
- Riesgo de alucinacion en la generacion de parches y en la interpretacion de codigo; no hay datos publicados sobre sesgos.
- La licencia Apache 2.0 permite uso comercial, pero se mantienen las atribuciones y avisos de copyright del modelo upstream Qwen/Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microsoft/FrogNano-4B-2609
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe tecnico: https://aka.ms/frognano-tech-report
- Repositorio del arnes Leaf: https://github.com/microsoft/FrogNano
