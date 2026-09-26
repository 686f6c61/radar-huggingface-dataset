# E6E831728/modular-reasoning-0p5b-g6p5-demo

## Resumen

modular-reasoning-0p5b-g6p5-demo es un checkpoint de investigación publicado por el usuario E6E831728 en HuggingFace. Se presenta como un núcleo de razonamiento sin atención (attention-free) que integra elementos externos tipados mediante un mecanismo de ensamblado residual conmutativo. El repositorio tiene un tamano de 2,0 GB y contiene 505.353.758 valores tensoriales almacenados en safetensors, de los cuales aproximadamente 504.567.326 corresponden a parametros y 786.432 a valores de búfer fijo.

El modelo no es un LM generico al uso. La propia model card distingue de forma explicita dos modos de funcionamiento: al cargarse como un causal LM estandar, el nucleo funciona sin memoria externa ni elementos de maquina virtual; el resultado de "attachment" G6.5 requiere el protocolo de elementos externos tipados que se demuestra en `attachment_demo/`. Por tanto, las evaluaciones estandar (HellaSwag, MMLU, WikiText) y la demo de attachment miden modos operativos distintos y no son comparables entre si.

Su relevancia actual es acotada y de caracter experimental: sirve como artefacto reproducible para estudiar memoria externa reconstructive, ejecucion determinista de una VM acotada y localidad de fallos en sistemas de razonamiento modular. El rendimiento como modelo de lenguaje autonomo es muy bajo (MMLU 0-shot de 22,95; perplejidad de palabra en WikiText de 4006,38), por lo que no esta pensado para produccion ni para tareas genericas de texto. No se han publicado datos de licencia ni de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Núcleo de razonamiento sin atencion (attention-free), tipo `modular_residual_reasoning_lm`, con ensamblado residual conmutativo de elementos externos tipados |
| Parametros totales | 505.353.758 valores tensoriales almacenados; aprox. 504.567.326 parametros + 786.432 valores de búfer fijo |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo de carga del autor usa `dtype=torch.bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y codigo personalizado) |

## Arquitectura y entrenamiento

La arquitectura se describe como un nucleo de razonamiento sin atencion que integra elementos externos tipados mediante un ensamblado residual conmutativo. Para una propuesta externa $z_e$ asociada al nodo de razonamiento $i$, el autor define el residual $r_e = z_e - Z_i$ y la agregacion $R_i = \frac{\sum_e w_e (z_e - Z_i)}{\epsilon + \sum_e w_e}$, de modo que el orden de los elementos se descarta por suma de segmentos. Un paso de consistencia determinista desplaza el campo de razonamiento hacia la media ponderada de las propuestas antes de aplicar una correccion entrenable acotada. Los tipos de elemento externo desarrollados en los experimentos asociados son tres: memoria documental reconstructiva congelada, ejecucion determinista de una maquina virtual acotada y buffers de resultado posicionales conscientes del tokenizador.

El checkpoint corresponde al paso de optimizador 141.092 y declara 4.047.453.941 objetivos procesados (aproximadamente 4,05 mil millones de tokens). El entrenamiento se realizo sobre una mezcla especializada de tareas de lenguaje, QA sobre memoria y tareas de maquina virtual, segun la propia model card. No se detalla la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica explicitamente que no se implementa KV cache y que, durante la fase de attachment, los pesos de razonamiento permanecieron sin cambios.

El resultado principal reportado es un experimento zero-shot de attachment G1.7 -> G6.5 sobre una suite de 417 tareas con procedencia controlada, que referencian 105 elementos nuevos. Con el store G1.7 la cobertura era 0,0000, la perdida 6,5375 nats y la precision por token 0,1198; con G6.5 la cobertura pasa a 1,0000, la perdida baja a 2,4611 nats y la precision por token sube a 0,6381, con un greedy exact de 0,3125. La actualizacion auditada posterior, con 417 ejemplos y 2396 tokens objetivo (cache ID `da0ab720f71cc2eb103983b2ae3cc439b354876b85c566406192a6bc5bb796fc`), reporta NLL de 6,5716 y precision 0,1210 para G1p7, frente a NLL 2,8073 y precision 0,5872 para G6p5, con una diferencia observada de 3,7643 nats/token. La propia model card advierte que, al cambiar la cobertura entre condiciones, esa diferencia no es una estimacion aislada del beneficio de la memoria a respuesta fija. En los controles de fallo, al desconectar 10 elementos requeridos y volver a conectarlos, el protocolo determinista restauro la linea base exactamente (`reattach_loss_difference = 0`).

## Capacidades

- Generacion de texto autoregresiva basica como causal LM estandar, con calidad muy limitada (MMLU 0-shot y 5-shot de 22,95; precision LAMBADA 0,00).
- Razonamiento iterativo interno: la llamada al modelo acepta un parametro `num_iterations` (el ejemplo del autor usa 5 iteraciones).
- Ensamblado de elementos externos tipados mediante suma residual conmutativa, que descarta el orden de los elementos.
- Memoria documental reconstructiva congelada: almacenamiento y recuperacion de documentos de forma reconstructive, no lossless.
- Ejecucion determinista de una maquina virtual acotada como skill externa.
- Buffers de resultado conscientes del tokenizador y posicionales.
- Cobertura de attachment verificable: el protocolo permite pasar de cobertura 0,0000 a 1,0000 sobre la suite de procedencia controlada.
- Localidad de fallos: la desconexion de elementos requeridos degrada el resultado y su reconexion lo restaura de forma determinista.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso generico: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades de vision, audio o modo "thinking" explicito: no documentadas.

## Casos de uso

- Investigacion sobre memoria externa tipada: el modelo permite experimentar con memorias documentales congeladas y ensamblado residual conmutativo sin reentrenar los pesos de razonamiento, ya que el attachment no modifica dichos pesos. Es adecuado porque expone el protocolo de forma reproducible mediante `run_attachment_demo.py`.
- Evaluacion de tolerancia a fallos y localidad: al desconectar elementos requeridos y reconectarlos, el sistema debe restaurar la linea base exacta (`reattach_loss_difference = 0`). Sirve como banco de pruebas para medir como se degrada y recupera un campo de razonamiento modular.
- Verificacion de procedencia en experimentos controlados: la suite de 417 tareas con 105 elementos nuevos y control de procedencia permite comprobar que el sistema solo acierta cuando los elementos necesarios estan efectivamente presentes, evitando atribuciones erroneas de capacidad.
- Ejecucion determinista de tareas acotadas tipo VM: el nucleo integra skills ejecutables de maquina virtual acotada, util para estudiar como un modelo delega computo simbolico en un interprete determinista en lugar de aproximarlo con pesos.
- Investigacion en arquitecturas sin atencion: al ser attention-free y no implementar KV cache, es un artefacto util para comparar estrategias alternativas frente a transformers clasicos en tareas de memoria y razonamiento acotado.
- Reproduccion academica y docencia: el checkpoint incluye hash SHA-256 de los pesos (`3c64ccd295b109098923e62edc12f4f30776deaf51b69cad9a6d3543c4863fc8`), paso de optimizador y recuento de objetivos procesados, lo que facilita la verificacion de resultados en publicaciones o cursos.
- Pruebas de integracion de codigo personalizado: dado que requiere `trust_remote_code=True`, sirve para validar pipelines que necesitan cargar arquitecturas no estandar en entornos controlados de investigacion.

## Benchmarks y rendimiento

Resultados auditados del nucleo como modelo de lenguaje estandar, sin memoria externa ni VM habilitadas:

| Metrica | Resultado auditado |
|---|---|
| HellaSwag acc | 26,26 ± 0,44 |
| HellaSwag acc_norm | 25,31 ± 0,43 |
| ARC-Easy acc | 28,24 ± 0,92 |
| ARC-Easy acc_norm | 30,13 ± 0,94 |
| ARC-Challenge acc | 19,45 ± 1,16 |
| ARC-Challenge acc_norm | 23,12 ± 1,23 |
| PIQA acc | 54,03 ± 1,16 |
| PIQA acc_norm | 51,74 ± 1,17 |
| WinoGrande acc | 50,20 ± 1,41 |
| OpenBookQA acc | 12,60 ± 1,49 |
| OpenBookQA acc_norm | 23,80 ± 1,91 |
| CommonsenseQA acc | 19,57 ± 1,14 |
| MMLU 0-shot | 22,95 ± 0,35 |
| MMLU 5-shot | 22,95 ± 0,35 |
| LAMBADA accuracy | 0,00 ± 0,00 |
| LAMBADA perplexity | 1.501.146,58 ± 121.571,30 |
| WikiText word perplexity | 4.006,38 |
| WikiText byte perplexity | 4,72 |
| WikiText bits/byte | 2,24 |

Resultados de la demostracion de attachment acotada (no es un benchmark de LM estandar). Evaluados 417 ejemplos y 2396 tokens objetivo:

| Configuracion de origen | Cobertura | NLL por token objetivo | Precision por token |
|---|---:|---:|---:|
| `G1p7` | 0,0000 | 6,5716 | 0,1210 |
| `G6p5` | 1,0000 | 2,8073 | 0,5872 |

Diferencia observada de NLL: 3,7643 nats/token. La model card advierte que la cobertura cambia entre condiciones, por lo que esta cifra no aislada el efecto de la escala de memoria a respuesta fija. No se han publicado resultados de otros benchmarks comparativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del recuento de parametros, no confirmado por el autor): aproximadamente 1,0 GB de pesos en bfloat16/fp16, unos 2,0 GB en fp32, unos 0,5 GB en int8 y unos 0,25 GB en int4, a lo que hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: no disponibles como dato oficial. Por tamano, cualquier GPU con al menos 4 GB de VRAM es suficiente para los pesos; se sugiere margen adicional por el bucle de iteraciones.
- Cabe en GPU de consumo: si, previsiblemente en cualquier tarjeta con 4 GB o mas (por ejemplo, gamas RTX 30/40 de 8 GB en adelante). No hay confirmacion oficial de modelos concretos.
- Opciones de despliegue: se documenta unicamente la carga mediante `transformers` (`AutoModelForCausalLM` y `AutoTokenizer`) con `trust_remote_code=True` y `dtype=torch.bfloat16`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formato GGUF, y la ausencia de KV cache hace poco probable su integracion directa en servidores de inferencia convencionales.
- Tamano de lote: el autor recomienda usar batch size 1 para la evaluacion generica con harnesses estandar.
- Latencia y throughput: no disponibles. El bucle de `num_iterations` (5 en el ejemplo) anade coste de computo proporcional al numero de iteraciones.

## Comparativa con modelos similares

No hay datos de comparacion en la informacion proporcionada. La siguiente tabla recoge caracteristicas publicas ampliamente conocidas de modelos de tamano similar, marcadas como no verificadas en la documentacion de este checkpoint:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| modular-reasoning-0p5b-g6p5-demo | ~504,6 M | no disponible | Attention-free con elementos externos tipados | no disponible | Checkpoint de investigacion; requiere codigo personalizado |
| Qwen2.5-0.5B | ~0,49 B | 32.768 tokens | Transformer denso con atencion | Apache-2.0 | Datos de conocimiento general, no verificados aqui |
| Qwen3-0.6B | ~0,6 B | 32.768 tokens | Transformer denso con atencion | Apache-2.0 | Datos de conocimiento general, no verificados aqui |
| SmolLM2-360M | ~362 M | 8.192 tokens | Transformer denso con atencion | Apache-2.0 | Datos de conocimiento general, no verificados aqui |

Comparativa de rendimiento: no disponible. La model card de este checkpoint no compara sus resultados con alternativas, y su tabla de benchmarks mide el nucleo sin memoria externa, un modo que no es directamente equiparable al uso convencional de un LM denso.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero el entrenamiento sobre una mezcla especializada de lenguaje, QA de memoria y tareas de VM implica una distribucion muy alejada del texto general, con el riesgo de sesgo de dominio asociado.
- Riesgo de alucinacion: muy elevado en uso como LM autonomo. La perplejidad de palabra en WikiText es de 4.006,38 y la perplejidad en LAMBADA de 1.501.146,58, con precision LAMBADA de 0,00.
- Alcance del resultado de attachment: la model card insiste en que no se trata de QA de dominio abierto y que el resultado se obtiene sobre una suite de procedencia controlada de 417 tareas y 105 elementos nuevos.
- Los nombres `G1p7` y `G6p5` identifican las configuraciones de origen usadas para seleccionar evidencia; no implican que esta demostracion descargable cargue miles de millones de valores de memoria.
- La memoria demostrada es reconstructiva, no sin perdida. No se afirma que los valores de memoria almacenados equivalgan a parametros densos entrenables.
- No se implementa KV cache, lo que limita el despliegue en servidores de inferencia optimizados y en escenarios de generacion larga.
- El rendimiento de los benchmarks estandar se mide sin memoria externa ni VM habilitadas; no debe interpretarse como el rendimiento del sistema completo.
- Licencia: no disponible. Al no declararse una licencia, no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados: no disponibles; no se puede asumir cobertura multilingue.
- Longitud de contexto: no disponible; se desconoce la ventana maxima utilizable.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio, con el riesgo de seguridad que ello conlleva en entornos de produccion.
- Se recomienda batch size 1 para evaluaciones genericas, lo que limita el throughput en escenarios de alto volumen.
- Checkpoint con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/E6E831728/modular-reasoning-0p5b-g6p5-demo
- Directorio de demostracion incluido en el repositorio: `attachment_demo/` (contiene `qa/`, `cache/`, `growth_results.json`, `run_attachment_demo.py`)
- Paper asociado: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo independiente: no disponible
- Demo interactiva: no disponible
- Dataset de la suite de evaluacion: no disponible como enlace publico; la model card solo proporciona el cache ID `da0ab720f71cc2eb103983b2ae3cc439b354876b85c566406192a6bc5bb796fc`
