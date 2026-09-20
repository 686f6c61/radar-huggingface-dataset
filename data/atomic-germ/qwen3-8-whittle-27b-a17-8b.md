# Atomic-Germ/Qwen3.8-Whittle-27B-A17.8B

## Resumen

Whittle MoE 27B (A18B) es un modelo de lenguaje de tipo mezcla de expertos (MoE) creado por el usuario Atomic-Germ a partir de Qwen3.8-27B, distribuido como research preview bajo licencia Apache-2.0. No se trata de un entrenamiento desde cero ni de una destilación convencional: la model card describe una "partición" quirúrgica del FFN denso del modelo padre, que se corta en 64 expertos enrutados de ancho 192 más un experto compartido siempre activo de ancho 5120, manteniendo intacta toda la parte de atención (arquitectura híbrida 3:1 de capas gated deltanet y atención completa, 16 capas de atención, hidden size 5120). El resultado son 27B de parámetros totales con 17,8B activos por token.

La relevancia del proyecto no está en el rendimiento bruto, sino en el método que documenta: tras el tallado inicial el modelo producía salida incoherente (4 de 39 en la batería de conocimiento del autor) y recuperó 27 de 39 entrenando únicamente los 64 routers con todos los expertos congelados. A partir de ahí se aplicaron rondas de SFT multiturno y destilación de respuestas completas, y en la versión v2.2 se añadió una señal de parada entrenada en la puerta del experto compartido para atacar el bucle repetitivo.

La versión actual del repositorio es v2.2.1 (29 de agosto de 2026), que corrige un fallo de aborto de razonamiento sustituyendo 64 tensores `shared_expert_gate` (0,66 MB) en los pesos safetensors de la raíz. Los archivos GGUF todavía no se han reconstruido y siguen conteniendo la puerta de v2.2. Es un modelo auto-financiado, con el presupuesto de cómputo agotado según su propia model card, y no debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos post hoc sobre Qwen3.8-27B; 64 capas con atención híbrida 3:1 de capas gated deltanet y atención completa (16 capas de atención en total), hidden size 5120; FFN particionado en 64 expertos enrutados de ancho 192 más un experto compartido de ancho 5120 |
| Parametros totales | 27B |
| Parametros activos | 17,8B (el router selecciona 16 de 64 expertos por token; 8192 de los 17408 de ancho de FFN por token) |
| Longitud de contexto | no disponible (la model card no declara contexto nativo; el ejemplo de servicio usa `-c 8192`) |
| Tipos de cuantizacion | GGUF, con Q4_K_M mencionado explícitamente; pesos safetensors en la raíz del repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (raíz del repositorio, versión v2.2.1) y GGUF (versión v2.2, sin reconstruir) |
| Tamano del repositorio | 3,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 19 de septiembre de 2026 |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

La intervención sobre el modelo padre es aritméticamente exacta y no inventa pesos nuevos en el FFN: cada capa mantiene su FFN denso de 17408 neuronas de ancho, que se corta en 64 porciones (slivers) de 192 neuronas más un experto compartido de 5120, de modo que 64 × 192 + 5120 = 17408. Un router pequeño por capa elige 16 de las 64 porciones para cada token, con lo que cada token ejecuta 8192 de las 17408 neuronas originales del FFN y el modelo queda en 17,8B activos de 27B totales. La parte de atención se conserva sin tocar: híbrido 3:1 de capas gated deltanet y atención completa, con 16 capas de atención y hidden size 5120. La model card insiste en que es una partición, no una reconstrucción.

El proceso de recuperación se describe en tres fases. Primero, entrenamiento exclusivo de los 64 routers con todos los expertos congelados: el modelo pasa de 4 de 39 a 27 de 39 en la batería de conocimiento del autor, lo que sugiere que el conocimiento permanecía en las porciones y solo había que aprender a enrutarlas. Después, SFT multiturno sobre `ultrachat_200k` (MIT), `tulu-3-sft-mixture` (ODC-BY), `CodeFeedback-Filtered-Instruction` (Apache-2.0) y un corpus propio del proyecto; la destilación de routers usó logits de Qwen3.8-27B sobre el corpus de curación (heal corpus). Por último, la ronda v2 (22 de agosto de 2026) atacó el bucle repetitivo con 245 respuestas completas escritas por el modelo padre, partiendo de la premisa de que repetición y truncamiento son el mismo comportamiento. En v2.2 se añadió a la puerta del experto compartido una señal de parada entrenada con trazas reales de cadena de pensamiento del padre; v2.2.1 sustituye esos 64 tensores por una versión entrenada sobre secuencias en las que el bloque `<think>` sí se cierra.

## Capacidades

- Generacion de texto y conversacion multiturno, con un ritmo de terminacion de turno del 85 % segun la model card (frente al 56 % anterior).
- Modo de razonamiento con bloques `<think>`, corregido en v2.2.1: en una sonda estructural de 24 prompts con razonamiento activado, los turnos que terminaban sin emitir `</think>` cayeron de 21/24 a 3/24.
- Generacion de respuestas largas y listas, con limitaciones reconocidas: el bucle en respuestas largas esta en el 8 % (frente al 69 % de la primera release) y en listas de mas de 45 elementos el rendimiento sigue siendo debil (4/12 y 5/12).
- Generacion de codigo y de instrucciones tecnicas, por inclusion de `CodeFeedback-Filtered-Instruction` en el SFT; sin datos de rendimiento publicados en la informacion disponible.
- Matematicas: la propia model card indica que el modelo hereda la debilidad de la familia en aritmetica.
- Salida estructurada (SQL, HTML, tablas markdown): soportada de forma parcial, con un 39 % de generaciones degeneradas segun el autor.
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision y audio: no disponibles; la model card no menciona ninguna modalidad distinta del texto.

## Casos de uso

- Investigacion sobre mezclas de expertos post hoc: el modelo es un banco de pruebas reproducible para estudiar si un MoE mal inicializado puede recuperarse entrenando solo los routers, con el metodo, el dataset y el registro de fallos publicados por el autor.
- Estudio de destilacion de routers: la tecnica de usar logits del modelo padre sobre un corpus de curacion para entrenar unicamente los enrutadores es directamente replicable en otros modelos densos de tamano similar.
- Despliegue local en hardware de consumo: con cuantizacion Q4_K_M funciona en 24 GB de VRAM y puede repartirse entre dos tarjetas de 12 GB, lo que lo hace util para experimentar con un MoE de 27B en estaciones de trabajo modestas.
- Asistente conversacional de uso interno en entornos cerrados: la tasa de terminacion limpia de turno en conversacion (7 % de bucles segun el autor) permite probarlo en chat multiturno siempre que se acepte supervision humana y no se use en atencion al cliente real.
- Generacion de texto largo con verificacion posterior: con un 8 % de bucles en respuestas largas, es viable como generador de borradores en pipelines donde un revisor o un filtro automatico descarte salidas repetitivas.
- Evaluacion comparativa de tecnicas anti-bucle: sirve como caso de estudio de como una senal de parada entrenada en la puerta de un experto compartido cambia el comportamiento de truncamiento de un modelo.
- Prototipado de fine-tuning sobre arquitecturas MoE personalizadas: al ser Apache-2.0 y estar publicado con pesos safetensors, permite experimentar con el enrutado sin las restricciones de una licencia de investigacion.

## Benchmarks y rendimiento

El autor advierte explicitamente de que todas las cifras proceden de un unico evaluador con un arnes pequeno y deben tratarse como "mediciones de taller, no como benchmarks". No hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Metrica | v2.2 | v2.2.1 | Referencia historica |
|---|---|---|---|
| Sonda estructural con razonamiento activado (n=24): turnos sin cerrar `</think>` o con respuesta vacia | 21/24 | 3/24 | Puerta puesta a cero: 11/24 |
| Terminacion limpia de turno, razonamiento desactivado (n=36) | 32/36 | 34/36 | no disponible |
| Recuentos exactos de items distintos (n=36) | 20/36 | 24/36 | no disponible |
| Sobrepaso medio (overrun) | 1,69x | 1,14x | no disponible |
| 4-grama repetido medio | 0,141 | 0,141 | objetivo declarado: 0,05 |
| Listas largas de 45+ elementos | no disponible | 4/12 y 5/12 | no disponible |
| Bateria de conocimiento (n=39) | 28/39 | 28/39 | Tras el tallado: 4/39; solo routers: 27/39 |
| Tasa de bucle en respuestas largas (mismo arnes y semillas desde la primera release) | 8 % | no disponible | 69 % en la primera release |
| Tasa de bucle en conversacion | 7 % | no disponible | no disponible |
| Tasa de bucle en salida estructurada | 22 % | no disponible | 75 % |
| Respuestas silenciosas o truncadas | 0 % | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB en cuantizacion Q4_K_M, segun la model card.
- Reparto multi-GPU: el autor indica que el modelo "se reparte entre dos tarjetas de 12 GB", por lo que es viable en configuraciones de 2 x 12 GB.
- GPUs recomendadas: no se especifican modelos concretos en la informacion disponible; por el perfil de memoria, encajan tarjetas de 24 GB (por ejemplo, RTX 3090 o RTX 4090) y soluciones de doble GPU de 12 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o en dos de 12 GB con cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp, con el binario `llama-server`. El ejemplo de la model card es `llama-server -m Whittle-MoE-27B-A18B-v2.2-Q4_K_M.gguf --host 0.0.0.0 --port 8090 -ngl 99 -c 8192 -fa on --jinja`. No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Latencia y throughput: no disponibles.
- Nota de despliegue: si se sirve una version cuantizada, el autor recomienda mantener el razonamiento desactivado hasta que los GGUF se reconstruyan, porque todavia contienen la puerta de v2.2.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whittle MoE 27B (A18B) v2.2.1 | 27B | 17,8B | no disponible | Apache-2.0 | safetensors en la raiz; GGUF en v2.2 |
| Qwen3.8-27B (modelo padre) | 27B | 27B (FFN denso de 17408, sin enrutado) | no disponible | no disponible en la informacion proporcionada | referenciado como `Qwen/Qwen3.8-27B` |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la informacion proporcionada resultados comparativos frente a otros modelos MoE de la misma categoria; la unica comparacion documentada es contra el propio modelo padre y contra versiones anteriores del mismo proyecto (v2.1 y v2.2).

## Limitaciones y advertencias

- Salida estructurada debil: el 39 % de las generaciones de SQL, HTML y tablas markdown degeneran, segun el propio autor.
- Bucle y repeticion: el 4-grama repetido medio se mantiene en 0,141, muy por encima del objetivo declarado de 0,05; las listas de mas de 45 elementos siguen fallando en la mayoria de los casos (4/12 y 5/12).
- Inestabilidad a nivel de token heredada de la compresion MoE: aparicion ocasional de palabras inventadas y cifras erroneas.
- Bateria de conocimiento limitada: 28/39, con una regresion clara (capital de Egipto) y tres recuperaciones (rio mas largo, montana mas alta, primer caminante lunar) respecto a versiones anteriores.
- Fallo de razonamiento corregido solo en safetensors: los GGUF del repositorio todavia contienen la puerta v2.2 y pueden abortar el turno dentro del bloque de pensamiento si se activa el razonamiento.
- Evaluacion no rigurosa: las cifras provienen de un unico evaluador y un arnes pequeno; no son benchmarks y no deberian usarse para comparaciones de rendimiento en produccion.
- Idiomas soportados no declarados, lo que impide asumir cobertura multilingue.
- Tool calling, agentes y razonamiento multi-paso no documentados; no conviene asumir su disponibilidad.
- Estado de financiacion: research preview auto-financiado con el presupuesto de computo agotado, por lo que no hay garantia de mantenimiento, correccion de errores ni nuevas versiones.
- Coherencia del repositorio: el tamano declarado en HuggingFace es de 3,2 GB, muy inferior a lo esperable para un checkpoint completo de 27B; conviene verificar que archivos contiene antes de planificar un despliegue. Los subdirectorios `v2.1/` y `v2.2/` conservan versiones anteriores (`v2.2/shared_expert_gate.safetensors` reconstruye v2.2 exactamente junto con los pesos de la raiz).
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el caracter experimental del modelo y la ausencia de garantias del autor desaconsejan su uso en produccion sin validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-Whittle-27B-A17.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos de la version anterior v2.2 (puerta archivada): `v2.2/shared_expert_gate.safetensors` dentro del repositorio
- Pesos de la version v2.1: subdirectorio `v2.1/` dentro del repositorio
- Financiacion del proyecto (enlace facilitado por el autor): https://ko-fi.com/davida81328
- Paper, blog o repositorio de codigo: no disponibles en la informacion proporcionada
- La busqueda web realizada no ha devuelto ningun enlace relacionado con el modelo; los resultados obtenidos corresponden a sitios sin relacion con este proyecto.
