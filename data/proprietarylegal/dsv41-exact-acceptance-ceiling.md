# ProprietaryLegal/dsv41-exact-acceptance-ceiling

## Resumen

`ProprietaryLegal/dsv41-exact-acceptance-ceiling` no es un modelo con pesos, sino un repositorio de metodologia y resultados agregados publicado por PLI Labs, el brazo de investigacion abierta de Proprietary Legal Intelligence. Describe y acompaña un procedimiento para medir el techo de aceptacion (*acceptance ceiling*) de un drafter especulativo codicioso a temperatura 1, usando las probabilidades reales del modelo objetivo sobre trayectorias comprometidas previamente capturadas. El modelo base declarado es `deepseek-ai/DeepSeek-V4.1-Flash-1017`, y el trabajo se enmarca en un stack de despliegue sobre 2x DGX Spark (GB10) con offload a x86 y un drafter en RTX 3090.

El problema que aborda es la ambiguedad al diagnosticar una baja tasa de aceptacion en decodificacion especulativa: no se distingue si la culpa es de la entropia propia del muestreo del objetivo o del desajuste del drafter. El repositorio separa ambas contribuciones calculando, sobre las mismas secuencias, la aceptacion de un oraculo codicioso del objetivo (`max p_target`) frente a la del drafter capturado (`p_target(d_k)`), restringiendo cada termino a los prefijos que la cadena correspondiente habria alcanzado realmente.

Su relevancia es metodologica: evita multiplicar probabilidades marginales medias como si las posiciones fuesen independientes y publica los scripts en lugar de los datos. El estado declarado es *research-only*: el replay de logprobs y el scoring agregado estan completos, pero la adaptacion del drafter y cualquier ganancia de velocidad en serving quedan sin cualificar. Solo se dispuso de cuatro peticiones, por lo que los intervalos agrupados por peticion son muy anchos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el repositorio no publica pesos ni ficha de arquitectura. El modelo base declarado es DeepSeek-V4.1-Flash-1017 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se menciona un "drafter cuantizado capturado" sin especificar el esquema |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no se distribuyen pesos. El artefacto son scripts Python (dependencias: PyTorch y safetensors) |
| Tipo de artefacto | repositorio de metodologia y resultados agregados de benchmarking |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Datos incluidos | ninguno: sin capturas, sin prompts, sin tokens, sin volcados de referencia y sin pesos |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino en este repositorio: es un conjunto de herramientas de evaluacion. La pieza principal, `d1/exact_ceiling.py build`, reconstruye la secuencia contigua de tokens comprometidos de cada peticion capturada y lanza una peticion de completion con `prompt_logprobs: 20` contra el mismo objetivo servido, con el mismo tokenizador y el mismo contrato de muestreo. Un unico prefill por secuencia devuelve los logprobs del siguiente token sobre los prefijos comprometidos, incluido el logprob del token observado. Para cada posicion `k`, con `x_k` el token comprometido, `g_k` el argmax del objetivo y `d_k` el borrador capturado, el scorer promedia sumas suavizadas: para el oraculo, `sum_k [producto_{i<k} 1(x_i = g_i)] * max p_k`; para el drafter capturado, `sum_k [producto_{i<k} 1(x_i = d_i)] * p_k(d_k)`. El indicador de coincidencia previa restringe cada termino a los prefijos que esa cadena habria alcanzado, lo que evita el error de tratar las posiciones como independientes. Si el borrador capturado no aparece en el soporte devuelto, recibe probabilidad cero y su puntuacion se convierte en una cota inferior.

El repositorio incluye ademas dos componentes secundarios. `d1/ceiling.py` implementa una "lente de logits" barata: aplica la normalizacion final y la cabeza de salida del objetivo a la entrada de su ultima capa, saltandose esa capa y el colapso aprendido del stream, por lo que es un proxy; su tasa de acierto sobre tokens comprometidos y su puntuacion de cadena codiciosa son los suelos empiricos reportados, y su estimacion calibrada por temperatura depende de supuestos, con calibracion que reserva peticiones completas. El diagnostico KL compara el objetivo con un drafter nativo de referencia en FP32 forzado por teacher forcing, usando el soporte devuelto mas un cubo de masa residual, de modo que no es una KL sobre todo el vocabulario ni una KL contra el drafter cuantizado capturado. La incertidumbre se calcula por bootstrap agrupado por peticion: se remuestrean peticiones con reemplazo conservando todas las observaciones de cada una y se calcula la media ponderada por ronda.

## Capacidades

- Replay exacto de logprobs del objetivo sobre prefijos comprometidos, con soporte de hasta 20 logprobs por posicion.
- Calculo del techo de aceptacion de un oraculo codicioso del objetivo y de la aceptacion del drafter capturado sobre las mismas secuencias.
- Puntuacion por rondas con indicadores de supervivencia de prefijo, en lugar de productos de probabilidades marginales.
- Estimacion proxy mediante lente de logits sobre la entrada de la ultima capa del objetivo.
- Diagnostico KL parcial contra un drafter nativo de referencia en FP32, con cubo de masa residual.
- Intervalos de confianza por bootstrap agrupado a nivel de peticion, con soporte para diferencias pareadas por ronda.
- Identificacion de desajuste posicional del drafter, especialmente en las posiciones tardias donde predice mas alla de su ultimo estado observado del objetivo.
- El repositorio no genera texto, no razona, no hace tool calling ni soporta agentes: es instrumentacion de medida.

## Casos de uso

- Diagnostico previo a invertir en adaptacion de drafter: el equipo mide el techo del oraculo sobre sus propias capturas y decide si el margen recuperable justifica entrenar un drafter nuevo, en lugar de asumir que una tasa de aceptacion baja es siempre culpa del drafter.
- Comparacion drafter-objetivo sobre prefijos identicos: se ejecuta el replay contra el mismo objetivo servido y el mismo tokenizador, de modo que las diferencias observadas no se contaminan por cambios de contrato de muestreo.
- Localizacion de desajuste por posicion: al desglosar la aceptacion por indice dentro de la cadena, se detecta si el drafter se degrada en las posiciones tardias, lo que orienta el diseno de la ventana de propuesta o del entrenamiento.
- Auditoria de un despliegue especulativo en produccion: el procedimiento sirve para documentar cuanto margen queda sobre el objetivo real antes de declarar que la decodificacion especulativa esta agotada en ese hardware.
- Analisis de viabilidad en hardware concreto: el trabajo esta orientado a un objetivo en 2x DGX Spark/GB10 con offload x86 y un drafter en RTX 3090, por lo que el metodo se usa para perfilar ese stack antes de comprometer recursos de serving.
- Estudio de sensibilidad a la entropia del objetivo: separar la aceptacion perdida por entropia del muestreo del objetivo frente a la perdida por desajuste del drafter permite decidir si conviene bajar temperatura o cambiar de drafter.
- Investigacion reproducible en el dominio legal: dado el enfoque de PLI en producto de trabajo legal, el metodo permite medir aceptacion sobre trazas de ese dominio aportando capturas propias, ya que el repositorio no las publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el replay de logprobs del objetivo y el scoring agregado estan completos, pero no incluye las cifras agregadas, y el propio autor advierte que el techo reportado es una estimacion de muestra finita para un oraculo codicioso del objetivo, no una garantia poblacional ni una ganancia de throughput medida. Tampoco se cualifica ninguna mejora de velocidad de serving derivada de la adaptacion del drafter.

## Requisitos de hardware

- Para ejecutar el analisis: Python en CPU con PyTorch y safetensors. El repositorio no requiere GPU para el scoring, pero si acceso al endpoint de completion del objetivo original para el replay.
- VRAM estimada para inferencia: no disponible.
- GPU mencionadas en el trabajo: DGX Spark / GB10 como objetivo de despliegue (2 unidades) y RTX 3090 como drafter en x86.
- Encaje en GPU de consumo: no disponible como medicion; la RTX 3090 aparece unicamente como drafter del stack descrito.
- Opciones de despliegue: no se documenta servidor de inferencia concreto (vLLM, TGI, llama.cpp u Ollama) en la informacion disponible; se requiere acceso a una API de completion compatible con `prompt_logprobs`.
- Latencia y throughput: no disponibles. El autor declara explicitamente que no hay ganancia de serving medida ni cualificada.
- Dependencias adicionales: ficheros de captura privados y de confianza, tokenizador y pesos coincidentes con el objetivo, tensores de normalizacion y cabeza de salida para la lente de logits, y tensores Markov nativos mas volcados de referencia para el diagnostico KL. Los scripts traen rutas de nivel de modulo `CAPS`, `CKPT` y `REF_DUMPS` que hay que redefinir; la opcion `--v1` solo selecciona el directorio que contiene `verify/`.

## Comparativa con modelos similares

| Artefacto | Naturaleza | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|---|
| dsv41-exact-acceptance-ceiling | metodologia de medicion de aceptacion especulativa | no disponible (sin pesos) | no disponible | cifras agregadas no incluidas en la informacion | Apache 2.0 | no se distribuyen |
| DeepSeek-V4.1-Flash-2xDGX-Spark-x86-offload (mismo autor) | ficha de stack de despliegue del modelo base | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |
| Drafters tipo EAGLE / Medusa | modelos de borrador entrenados para decodificacion especulativa | no disponible | no disponible | no disponible | depende de cada publicacion | habitualmente si |
| Arneses de evaluacion generalistas (p. ej. lm-evaluation-harness) | frameworks de benchmark de modelos | no aplica | no aplica | no aplica | depende del proyecto | no aplica |

La comparacion relevante no es de capacidad del modelo sino de proposito: este repositorio mide el limite superior de aceptacion de un drafter dado sobre un objetivo dado, mientras que los drafters EAGLE/Medusa son artefactos entrenados y los arneses generalistas miden calidad de tareas, no dinamica de decodificacion especulativa.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, prompts, tokens ni volcados de referencia, por lo que no es reproducible sin aportar capturas propias y acceso al objetivo.
- Solo cuatro peticiones disponibles: los intervalos agrupados por peticion son muy anchos y el autor lo advierte explicitamente.
- El termino "exact" se refiere unicamente a que las probabilidades provienen del objetivo servido sobre los prefijos registrados; el techo reportado es una estimacion de muestra finita, no una garantia poblacional.
- Los agregados no son evidencia de que la adaptacion del drafter mejore el serving, ni un techo general para politicas de borrador probabilisticas arbitrarias, ni un benchmark comparable entre objetivos no relacionados.
- El estimador asume borradores codiciosos y el contrato de muestreo del objetivo declarado; fuera de ese regimen las cifras no son validas.
- Si el borrador capturado no aparece en el soporte devuelto, su probabilidad se fija a cero y la puntuacion resultante es una cota inferior, no una estimacion insesgada.
- El diagnostico KL no cubre todo el vocabulario (usa el soporte devuelto mas un cubo residual) y no se calcula contra el drafter cuantizado capturado, sino contra una referencia nativa en FP32.
- La lente de logits es un proxy: omite la ultima capa y el colapso aprendido del stream, y su estimacion calibrada por temperatura depende de supuestos no validados por el replay exacto.
- El acuerdo de texto en ejecucion libre no certifica fidelidad numerica.
- Sesgos de dominio: las capturas parecen proceder de flujos de trabajo legal (etiqueta `legal-ai`), por lo que los agregados no son extrapolables a otros dominios.
- Licencia Apache 2.0 sobre el codigo, pero sin datos ni pesos; el uso comercial del codigo es posible, el de las capturas subyacentes no esta cubierto por este repositorio.
- Sin validacion de la comunidad: cero descargas y cero likes, creado y actualizado en el mismo minuto, con estado declarado *research-only* y sin historial de mantenimiento.
- Idiomas soportados no disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ProprietaryLegal/dsv41-exact-acceptance-ceiling
- Codigo y documentacion en GitHub: https://github.com/ProprietaryLegal/dsv41-exact-acceptance-ceiling
- Ficha del stack de despliegue (2x DGX Spark + offload x86): https://huggingface.co/ProprietaryLegal/DeepSeek-V4.1-Flash-2xDGX-Spark-x86-offload
- Coleccion completa de entradas: https://huggingface.co/collections/ProprietaryLegal/deepseek-v41-flash-on-2x-dgx-spark-x86-offload-6adab604a517b426ded3916e
- PLI Labs: https://proprietarylegal.ai/labs.html
- Proprietary Legal Intelligence: https://proprietarylegal.ai
- Modelo base declarado: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
