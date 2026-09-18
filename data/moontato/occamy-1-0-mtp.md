# moontato/occamy-1.0-mtp

## Resumen

Occamy 1.0 MTP (repositorio `moontato/occamy-1.0-mtp`) es una conversion comunitaria a GGUF de la cabeza MTP (*multi-token prediction*) experimental publicada por Accio Lab como `Accio-Lab/occamy-1.0-MTP`. No es un modelo de lenguaje independiente: es un *draft head* disenado para decodificacion especulativa en `llama.cpp`, que debe emparejarse obligatoriamente con el modelo objetivo Occamy 1.0. El artefacto contiene aproximadamente 1.861.761.536 parametros (unos 1,86 mil millones) y se distribuye en tres precisiones GGUF (BF16, Q8_0 y Q4_K_M) dentro de un repositorio de 7,0 GB.

Su relevancia es acotada pero tecnica: permite acelerar la generacion de Occamy 1.0 mediante decodificacion especulativa con una cabeza entrenada especificamente para ese modelo, en lugar de recurrir a un modelo borrador generico de otra familia. La cadena de procedencia es Qwen/Qwen3.6-35B-A3B, sobre el que se construye Occamy 1.0, del que se deriva la cabeza MTP, y finalmente la conversion GGUF de la comunidad. La licencia es Apache 2.0 en toda la cadena.

Se trata de material experimental y no oficial: Accio Lab documenta la cabeza como un componente separado, con una configuracion de ejecucion validada limitada, y este repositorio no esta afiliado ni respaldado por Accio Lab, Qwen ni el proyecto `llama.cpp`. A fecha de la ficha el repositorio registra 0 descargas y 0 *likes*, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (*multi-token prediction*) para decodificacion especulativa; no es un transformer autonomo completo. Precisa el modelo objetivo Occamy 1.0 (linaje Qwen3.6-35B-A3B, etiquetado `qwen3_5_moe`) |
| Parametros totales | 1.861.761.536 (aproximadamente 1,86 mil millones) |
| Parametros activos | No aplica al artefacto (es una cabeza MTP, no un MoE completo). El modelo objetivo se denomina 35B-A3B, lo que sugiere del orden de 3 mil millones de parametros activos, dato no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF BF16 (referencia), Q8_0 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con atribucion a obras upstream y conservacion de avisos NOTICE si existen) |
| Formato de pesos | GGUF (`occamy-1.0-MTP-BF16.gguf`, `occamy-1.0-MTP-Q8_0.gguf`, `occamy-1.0-MTP-Q4_K_M.gguf`); los pesos upstream estan en safetensors |

Otros datos del repositorio: autor `moontato`, creado y actualizado el 18 de septiembre de 2026, tamano del repo 7,0 GB, 0 descargas, 0 *likes*, pipeline no disponible.

## Arquitectura y entrenamiento

El artefacto es un cabezal de prediccion multi-token (*MTP*) que se acopla al modelo objetivo Occamy 1.0. En decodificacion especulativa, la cabeza propone varios tokens candidatos que el modelo objetivo verifica en un unico paso, de modo que se mantiene la distribucion de salida del modelo grande mientras se reduce el coste por token generado. Accio Lab adapto la cabeza MTP sobre datos de Occamy, segun la model card, y la publica como componente separado en lugar de como modelo autonomo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

El proceso de conversion descrito por el autor consiste en ensamblar primero la cabeza con el checkpoint de Hugging Face de Occamy 1.0, exportar unicamente la cabeza MTP con el conversor de `llama.cpp` y, a partir del GGUF en BF16, generar las variantes Q8_0 y Q4_K_M con las herramientas del mismo proyecto. Este detalle es relevante tecnicamente: la cuantizacion se aplica sobre un componente cuyo unico proposito es maximizar la tasa de aceptacion, por lo que reducir precision puede degradar exactamente la metrica que se pretende optimizar.

## Capacidades

- Generacion de texto por delegacion: el artefacto no genera texto por si mismo, sino que produce borradores de tokens que Occamy 1.0 verifica y acepta o rechaza.
- Aceleracion de inferencia mediante decodificacion especulativa con `--spec-type draft-mtp` en `llama.cpp`.
- Soporte de multiples precisiones: BF16 como referencia de maxima fidelidad, Q8_0 como compromiso de memoria y fidelidad, Q4_K_M como variante reducida experimental.
- Tareas de codigo y de proposito general: el autor observa comportamientos de aceptacion distintos entre ambos tipos de carga, sin cuantificarlos.
- Compatibilidad con el *pipeline* multimodal del modelo objetivo: la model card indica que se anaden las opciones habituales del objetivo, incluido el proyector multimodal, aunque no se detalla el alcance.
- Tool calling, agentes, razonamiento multi-paso, matematicas y capacidades multilingues: no disponible en la informacion proporcionada (dependerian del modelo objetivo Occamy 1.0, no de la cabeza MTP).

## Casos de uso

- Aceleracion de un servicio de generacion con Occamy 1.0: se despliega `llama-server` con el GGUF objetivo y el drafter MTP como `-md`, usando `--spec-type draft-mtp --spec-draft-n-max 2`, para reducir el tiempo por token en cargas de texto largo.
- Asistencia de codigo autohospedada: dado que el autor observa patrones de aceptacion propios en tareas de codigo, tiene sentido medir el drafter especificamente sobre prompts de programacion antes de fijar la configuracion de produccion.
- Comparacion de precisiones del drafter: usar el BF16 como linea base y medir si Q8_0 o Q4_K_M conservan una tasa de aceptacion suficiente en el hardware disponible, liberando VRAM en el proceso.
- Optimizacion de coste en GPU limitada: al emplear un drafter pequeno (del orden de 1,86 mil millones de parametros) se puede mejorar el rendimiento sin anadir un segundo modelo grande al presupuesto de memoria.
- Evaluacion de infraestructura de inferencia: el flujo permite estudiar el compromiso entre tasa de aceptacion, `--spec-draft-n-max`, longitud de contexto y tipo de cache KV en un despliegue real de `llama.cpp`.
- Investigacion sobre decodificacion especulativa: la cabeza MTP constituye un caso de estudio de *draft head* especifico de modelo frente a borradores genericos, util para comparar estrategias de aceleracion.
- Pruebas de regresion entre versiones de `llama.cpp`: dado que el soporte MTP esta en desarrollo activo, el drafter sirve para detectar cambios de comportamiento entre builds con un objetivo fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una unica observacion de aceptacion de borradores, calificada explicitamente como anecdótica y no como benchmark: aproximadamente un 50-75 % de aceptacion con el drafter BF16 en pruebas locales con `llama.cpp`, con comportamiento distinto entre tareas de codigo y de proposito general. La propia model card advierte que el porcentaje de aceptacion no implica una mejora proporcional de velocidad y que debe medirse el tiempo real de generacion.

Factores que el autor senala como influyentes en la aceptacion: el prompt y la carga de trabajo, la cuantizacion del modelo objetivo, la cuantizacion del drafter, los parametros de muestreo, la longitud de contexto, el valor de `--spec-draft-n-max`, la version o commit de `llama.cpp`, el backend y el hardware.

## Requisitos de hardware

- VRAM del drafter (estimacion aritmetica a partir de los parametros, no dato publicado): BF16 en torno a 3,7 GB de pesos; Q8_0 en torno a 2,0 GB; Q4_K_M en torno a 1,1 GB. Hay que sumar el coste de la cache KV y del *runtime*.
- VRAM total del sistema: la determina el modelo objetivo Occamy 1.0 (denominado 35B-A3B), no la cabeza MTP. El drafter anade una fraccion pequena sobre el objetivo segun la precision elegida.
- GPU recomendadas: no disponible en la informacion proporcionada. La eleccion depende del objetivo; el drafter por si solo es de tamano reducido.
- Viabilidad en GPU de consumo: el drafter BF16 (aproximadamente 3,7 GB de pesos) es compatible con GPUs de consumo con suficiente VRAM libre, pero la viabilidad del conjunto depende de si el modelo objetivo cabe en la misma GPU.
- Opciones de despliegue: `llama.cpp` con `llama-server` (o `llama-cli`) usando el objetivo como `-m` y el drafter como `-md`. El autor recomienda un build reciente de `llama.cpp` porque el soporte MTP y la conversion GGUF siguen evolucionando. Soporte en vLLM, Ollama, TGI u otros servidores: no disponible.
- Parametros de muestreo recomendados por el upstream para el modelo objetivo: `temperature = 1.0`, `top_p = 0.95`, `top_k = 20`, `presence_penalty = 1.5`.
- Latencia y throughput: no disponibles. No hay medidas publicadas de tokens por segundo ni de ganancia frente a la linea base sin decodificacion especulativa.

## Comparativa con modelos similares

| Alternativa | Naturaleza | Requiere modelo objetivo especifico | Licencia | Formato | Datos concretos |
|---|---|---|---|---|---|
| Occamy 1.0 MTP (este repositorio) | Cabeza MTP para decodificacion especulativa, ~1,86 B parametros | Si: Occamy 1.0, no otros modelos de la familia Qwen | Apache 2.0 | GGUF (BF16, Q8_0, Q4_K_M) | Aceptacion anecdótica del 50-75 % con BF16 |
| Cabezas tipo EAGLE-3 | Cabeza de prediccion a nivel de caracteristicas, entrenada por modelo objetivo | Si, entrenamiento por objetivo | no disponible | no disponible | no disponible |
| Cabezas tipo Medusa | Multiples cabezas de decodificacion sobre el estado oculto del objetivo | Si, entrenamiento por objetivo | no disponible | no disponible | no disponible |
| Modelo borrador denso generico (por ejemplo, un modelo pequeno de la familia Qwen) | Modelo de lenguaje independiente usado como *draft* | No, admite cualquier objetivo compatible | Segun el modelo elegido | GGUF y safetensors | no disponible |

La diferencia principal frente a un borrador generico es la especificidad: la cabeza MTP esta adaptada a Occamy 1.0 y, segun el autor, no debe emparejarse con objetivos arbitrarios de la familia Qwen. Frente a enfoques como EAGLE o Medusa, la informacion disponible no permite comparar tasas de aceptacion, sobrecarga de entrenamiento ni coste de memoria.

## Limitaciones y advertencias

- No es un modelo independiente: contiene unicamente la cabeza MTP y no puede ejecutarse por si sola.
- Compatibilidad restringida: esta pensada para emparejarse con Occamy 1.0, no con objetivos arbitrarios de la familia Qwen.
- Caracter experimental: el upstream esta documentado como experimental y con una configuracion de ejecucion validada limitada; la validacion publicada por Accio Lab no valida estas conversiones GGUF comunitarias.
- Conversion no oficial: el repositorio no esta afiliado ni respaldado por Accio Lab, Qwen ni el proyecto `llama.cpp`.
- La cuantizacion del drafter puede reducir la tasa de aceptacion; el BF16 se incluye como referencia para decidir si merece la pena usar Q8_0 o Q4_K_M en un hardware concreto.
- Inestabilidad del soporte: MTP en `llama.cpp` esta en desarrollo activo y el comportamiento puede cambiar entre builds.
- Sin benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni metricas equivalentes para este artefacto, y la cifra de aceptacion es anecdótica.
- La tasa de aceptacion no garantiza una mejora proporcional del rendimiento; hay que medir el tiempo real de generacion.
- Sesgo y alucinacion: no disponible para esta cabeza; heredaria las caracteristicas del modelo objetivo Occamy 1.0, no documentadas en la informacion proporcionada.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Falta de validacion de la comunidad: 0 descargas y 0 *likes* en el momento de redactar esta ficha.
- Licencia: Apache 2.0 permite uso comercial, pero exige conservar la atribucion a las obras upstream (Qwen3.6-35B-A3B, Occamy 1.0, Occamy 1.0 MTP) y los avisos NOTICE que correspondan en las redistribuciones.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/moontato/occamy-1.0-mtp
- Cabeza MTP upstream: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Modelo objetivo Occamy 1.0: https://huggingface.co/Accio-Lab/occamy-1.0
- Modelo base de la cadena, Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido comercial de una marca de ropa tecnica), por lo que no se han incluido enlaces adicionales. No se han encontrado papers, blogs ni demos relevantes para este artefacto.
