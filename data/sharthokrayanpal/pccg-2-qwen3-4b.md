# sharthokrayanpal/PCCG-2-Qwen3-4B

## Resumen

PCCG-2-Qwen3-4B (Prerequisite-Conditioned Continuation Control with Frozen Content) es un artefacto de investigacion publicado por el usuario de HuggingFace sharthokrayanpal sobre el modelo base Qwen/Qwen3-4B. No es un modelo entrenado de nuevo: el contenido de Qwen3-4B permanece completamente congelado y lo unico que se anade es una puerta ("gate") aprendida de 101 parametros que recibe exclusivamente una condicion de prerequisito y que solo puede modificar la puntuacion del token EOS nativo. Ninguna otra puntuacion del vocabulario se ve alterada por el estado de permiso.

El problema que aborda es la separacion explicita entre capacidad y permiso: el modelo de contenido decide cual es la respuesta (los logits no-EOS son identicos en todos los estados) y la puerta decide si esa respuesta llega a generarse o si la generacion se detiene en el EOS. En el testigo canonico (pregunta "What is 2 + 2?" con condicion `CONDITION: EQ(485487,485487)` frente a `CONDITION: EQ(485487,485489)`), la puntuacion del token `4` se mantiene en 53.0 en las cinco ramas mientras el score de EOS cambia de signo, invirtiendo el resultado visible.

Es relevante ahora porque propone una arquitectura reproducible y verificable de control de continuacion, con evidencia congelada y verificacion sin GPU, en un momento en el que la interpretabilidad mecanistica y el control fino de la generacion son lineas activas de investigacion. El alcance declarado por el autor es limitado: la familia de condiciones demostrada es la igualdad de numeros de seis digitos y el resultado no establece generalizacion a condiciones arbitrarias ni un circuito natural en Qwen de serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredado de Qwen3-4B, congelado) mas una puerta de prerequisito de 101 parametros que actua solo sobre el score de EOS nativo |
| Parametros totales | Aproximadamente 4.000 millones en la rama de contenido (Qwen3-4B) mas 101 parametros entrenables en la puerta |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (la rama de contenido hereda la configuracion de Qwen3-4B) |
| Tipos de cuantizacion | BF16 en safetensors; no se distribuyen versiones GGUF, AWQ, GPTQ ni cuantizaciones de menor precision |
| Idiomas soportados | en (segun los tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), 8,1 GB en el repositorio completo |
| Token EOS nativo | `<|im_end|>`, id 151645 |
| Tamano del repositorio | 8,1 GB (incluye `content/`, `gate/`, `src/` y `evidence/`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura tiene dos ramas disjuntas. La rama de contenido recibe unicamente la pregunta y ejecuta el forward congelado de Qwen3-4B, produciendo los logits de contenido; todos los logits no-EOS proceden directamente de esta computacion. La rama de condicion recibe unicamente la condicion y la procesa con una puerta aprendida de 101 parametros que genera un unico ajuste sobre el score de EOS. No entra informacion de condicion en la rama de contenido ni informacion de respuesta en la rama de condicion. El resultado declarado es que el numero de logits no-EOS modificados por la puerta es exactamente 0.

Los pesos de Qwen permanecen congelados; los unicos parametros entrenables son los 101 de la puerta de permiso. La model card no detalla el dataset de entrenamiento, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos se consideran no disponibles. La innovacion tecnica destacable es la separacion limpia entre la distribucion de respuesta (invariante, con hash SHA-256 del vector no-EOS identico en todas las ramas: `5f42fcb08c73af4914a711b524ae7130d671ec9504ecdfa699e8f478094713ec`) y el estado de permiso (variable, expresado como un unico ajuste sobre EOS). El autor insiste en que se trata de una puerta de continuacion aprendida e ingenierizada, no de un circuito natural descubierto en Qwen de serie.

## Capacidades

- Generacion de texto y respuesta a preguntas a traves de la rama de contenido congelada de Qwen3-4B.
- Control de continuacion condicionado: la generacion se permite o se bloquea en funcion de una condicion de prerequisito, sin alterar la distribucion de respuesta subyacente.
- Puerta determinista y auditable: el ajuste se aplica exclusivamente sobre el score del token EOS nativo (`<|im_end|>`, 151645).
- Verificacion offline: el script `src/verify.py` comprueba la evidencia guardada sin inferencia y sin GPU.
- Reproduccion byte-exacta: `src/reproduce.py` permite reejecutar los brazos witness, behavioral y causal y comparar los resultados con la evidencia congelada.
- Decodificacion greedy sobre el vocabulario completo en BF16, con cache de generacion regenerada para los brazos witness y causal.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue: no disponible (idioma declarado: en).
- Familia de condiciones soportada: igualdad de numeros de seis digitos (`EQ(a,b)`), segun el alcance declarado.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: usar la separacion entre logits de contenido y senal de permiso para estudiar como se decide la continuacion de una secuencia sin tocar los pesos del modelo de contenido.
- Auditoria de seguridad de generacion: implementar la puerta como capa de control externa que habilita o bloquea la emision de una respuesta ya calculada, con trazabilidad completa mediante el hash del vector no-EOS.
- Experimentos de control de acceso a respuestas: condicionar la salida a una comprobacion verificable (por ejemplo, igualdad de identificadores) antes de permitir que la respuesta entre en generacion.
- Reproduccion y validacion de resultados: ejecutar `src/verify.py` en un portatil sin GPU para comprobar la evidencia empaquetada, util en revision por pares o auditorias internas.
- Docencia y formacion en mecanistica: el testigo canonico con `What is 2 + 2?` y las dos condiciones `EQ(485487,485487)` / `EQ(485487,485489)` ofrece un ejemplo minimo reproducible de intervencion causal.
- Estudios de ablacion y controles: los 80 controles sham y los 188 controles de solo pregunta permiten disenar experimentos comparativos sobre el efecto de la puerta frente a una intervencion nula.
- Replicacion de entornos deterministas: reconstruir el pipeline exacto (PyTorch 2.8.0+cu128, Transformers 4.56.2, atencion SDPA, BF16, H100 80 GB) para obtener replay de logits byte a byte.
- Prototipado de gating sobre modelos base congelados: servir como plantilla para anadir mecanismos de permiso de bajo coste computacional (101 parametros) sobre modelos existentes sin reentrenarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta resultados internos de cualificacion, controles y causalidad del mecanismo de puerta:

| Metrica | Resultado |
|---|---|
| Condition qualification | 65.536 / 65.536 |
| Condition final | 65.536 / 65.536 |
| Development | 512 / 512 |
| Qualification | 1.024 / 1.024 |
| Final | 2.048 / 2.048 |
| Question-only controls (sin cambios) | 188 / 188 |
| Causal answer to EOS | 40 / 40 |
| Causal EOS to correct answer | 40 / 40 |
| Causal answer identities | 40 |
| Sham controls (sin cambios) | 80 / 80 |
| Logits no-EOS modificados por la puerta | 0 |
| Parametros de permiso entrenables | 101 |
| Pesos de contenido de Qwen | Congelados |

Testigo canonico (pregunta `What is 2 + 2?`):

| Rama | Tokens generados | Salida visible | Score de `4` | Score de EOS |
|---|---|---:|---:|---:|
| Licensed baseline | `[19, 151645]` | `4` | 53.0 | -124.0 |
| Unlicensed baseline | `[151645]` | vacio | 53.0 | 94.5 |
| Licensed reversed | `[151645]` | vacio | 53.0 | 136.0 |
| Unlicensed reversed | `[19, 151645]` | `4` | 53.0 | -82.0 |
| Unlicensed sham | `[151645]` | vacio | 53.0 | 94.5 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8-9 GB solo para los pesos de la rama de contenido (4B parametros a 2 bytes), mas cache KV y activaciones; en la practica se recomienda un minimo de 12-16 GB de VRAM para secuencias cortas y mas para contextos largos.
- Cuantizacion: no se distribuyen pesos cuantizados, por lo que no hay cifras oficiales de VRAM para 8 bits o 4 bits. Una conversion externa a 8 bits rondaria los 4,5 GB y a 4 bits los 2,5-3 GB, pero requeriria recalcular la evidencia y rompe la reproducibilidad byte-exacta.
- GPU recomendadas: el entorno registrado por el autor es una NVIDIA H100 80 GB, necesaria para el replay de logits byte a byte junto con PyTorch 2.8.0+cu128, Transformers 4.56.2 y atencion SDPA.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, RTX 3090) para inferencia en BF16; la verificacion de evidencia (`src/verify.py`) funciona en CPU sin GPU.
- Opciones de despliegue: PyTorch con Transformers y atencion SDPA (unico entorno documentado). No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia, y al no publicarse pesos GGUF la ruta de llama.cpp/Ollama requeriria conversion propia.
- Latencia y throughput: no disponible (la model card no publica mediciones de tokens por segundo ni de latencia).

## Comparativa con modelos similares

La comparativa directa es limitada porque PCCG-2 no es un modelo nuevo, sino una intervencion sobre Qwen3-4B. Los datos del modelo base proceden de su especificacion publica y no figuran en la model card de PCCG-2.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PCCG-2-Qwen3-4B | ~4B (contenido congelado) + 101 (puerta) | No disponible en la model card | Intervencion de control de continuacion sobre Qwen3-4B | apache-2.0 | Safetensors, 8,1 GB, 0 descargas |
| Qwen/Qwen3-4B | ~4B densos | No disponible en la informacion proporcionada | Modelo base denso de proposito general | apache-2.0 | Safetensors |
| Alternativas de control tipo circuit breakers o representation engineering | Depende del modelo anfitrion | Depende del modelo anfitrion | Tecnicas de intervencion sobre representaciones o salidas | Variable | Codigo y adaptadores, no siempre pesos publicados |

No se dispone de resultados de benchmarks comparables entre PCCG-2 y modelos de la misma categoria, por lo que la comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Alcance de condicion muy restringido: la unica familia demostrada es la igualdad de numeros de seis digitos. El propio autor declara que no se establece generalizacion a condiciones arbitrarias.
- No es un circuito natural: la model card indica explicitamente que es una puerta aprendida e ingenierizada y que no se presenta como un circuito de continuacion descubierto en Qwen de serie.
- Idiomas: solo se declara ingles (en); no hay evidencia de comportamiento en otros idiomas.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o alineacion para este artefacto.
- Riesgo de alucinacion: la rama de contenido es Qwen3-4B congelado, por lo que hereda sus tasas de alucinacion sin ninguna mitigacion adicional; la puerta no verifica la veracidad, solo la condicion de prerequisito.
- Licencia: apache-2.0 permite uso comercial, pero el artefacto es un experimento de investigacion sin garantias de robustez ni soporte.
- Reproducibilidad estricta: el replay byte-exacto de logits exige el entorno registrado (PyTorch 2.8.0+cu128, Transformers 4.56.2, SDPA, BF16, H100 80 GB); otros entornos pueden producir resultados no identicos.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 likes, sin revision por parte de la comunidad.
- Detalles de entrenamiento opacos: no se especifican dataset, numero de tokens ni procedimiento de optimizacion de la puerta.
- Sin cuantizaciones oficiales ni soporte documentado en servidores de inferencia, lo que limita el despliegue en produccion.
- El prompt de contenido usa un prefill de thinking vacio registrado en `src/core.py`; cualquier cambio en ese prefill invalida la evidencia congelada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sharthokrayanpal/PCCG-2-Qwen3-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio completo (incluye `content/`, `gate/`, `src/` y `evidence/`): descarga via `hf download sharthokrayanpal/PCCG-2-Qwen3-4B --local-dir PCCG-2-Qwen3-4B`
- Scripts de reproduccion citados en la model card: `src/verify.py`, `src/reproduce.py`, `src/core.py`
- Paper, blog o demo adicional: no disponible (la busqueda web no devolvio resultados relevantes sobre este modelo)
