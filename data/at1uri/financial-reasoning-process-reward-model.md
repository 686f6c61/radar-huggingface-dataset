# At1uri/financial-reasoning-process-reward-model

## Resumen

El Financial Reasoning Process Reward Model (PRM) es un modelo de recompensa a nivel de paso desarrollado por At1uri, diseñado especificamente para verificar cadenas de razonamiento (Chain-of-Thought) en finanzas cuantitativas y matematicas aplicadas. A diferencia de los modelos de recompensa de resultado (ORM), que solo evaluan si la respuesta final es correcta, este PRM asigna una probabilidad calibrada a cada paso intermedio del razonamiento, permitiendo detectar falacias matematicas aunque el resultado numerico final sea correcto.

El modelo aborda un problema concreto: un LLM puede acertar la cifra final mediante errores que se cancelan o heuristicas no fundamentadas, mientras comete fallos graves como omitir terminos de covariacion de Ito, confundir la deriva fisica con la deriva neutral al riesgo o violar condiciones de no arbitraje. Con 45,6 millones de parametros, es un modelo compacto orientado a tareas de verificacion y reranking, no a generacion libre.

Su relevancia actual radica en que habilita tecnicas de busqueda como Best-of-N y MCTS en dominios cuantitativos, donde la supervision a nivel de paso es mas informativa que la supervision de resultado. La licencia Apache 2.0 facilita su integracion en pipelines de investigacion y produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de clasificacion para PRM (transformer_prm) |
| Parametros totales | 45.613.569 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer con una cabeza de clasificacion binaria que evalua cada paso de razonamiento. La formulacion descrita en la model card estima la probabilidad conjunta de correccion bajo supuestos markovianos, descomponiendo la probabilidad de la cadena completa como el producto de las probabilidades por paso. La perdida de entrenamiento es entropia cruzada binaria contra anotaciones de verdad por paso, evaluada en el token separador de paso (`\n\n` o `\nStep:`).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card menciona que la evaluacion se realizo sobre 1.000 problemas del dataset `At1uri/quantitative-reasoning-cot-benchmarks`, pero no detalla el proceso de anotacion paso a paso ni el volumen de datos de entrenamiento.

## Capacidades

- Verificacion a nivel de paso de cadenas de razonamiento matematico en dominios cuantitativos.
- Deteccion de alucinaciones matematicas: identifica falacias como independencia erronea de brownianos, inclusion de deriva subjetiva en carteras de cobertura o errores de signo en condiciones de primer orden.
- Asignacion de una probabilidad calibrada en [0, 1] a cada paso, habilitando Best-of-N y busqueda MCTS.
- Localizacion en tiempo real del primer paso erroneo de una traza de razonamiento.
- Atribucion de tokens y verificacion de invariantes matematicos en seis dominios: calculo estocastico, pricing de martingalas, microestructura de mercado, paridad de arbitraje, mean field games y finanzas cuanticas.
- Soporte de reranking de multiples candidatos generados por un LLM.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Reranking Best-of-N en generacion de razonamiento financiero: dado un modelo generador como Qwen-2.5-Math-72B-Instruct, se generan N candidatos y el PRM selecciona el de mayor puntuacion agregada por paso, con ganancias reportadas de hasta +12,2 puntos porcentuales en Pass@1.
- Deteccion de falacias en derivaciones de calculo de Ito: el modelo localiza pasos donde se asume independencia erronea entre brownianos correlacionados, util en revision automatizada de notas de investigacion cuantitativa.
- Validacion de condiciones de no arbitraje en pipelines de pricing: verifica que los pasos intermedios respeten la deriva neutral al riesgo y el descuento de dividendos antes de aceptar una valoracion.
- Supervision de agentes de razonamiento multi-paso: integrado como critico en bucles de agente, permite podar ramas de busqueda con pasos de baja probabilidad y reducir el coste computacional de MCTS.
- Control de calidad en generacion de codigo financiero: verifica que las derivaciones matematicas previas a la implementacion de un modelo (por ejemplo, impacto cinetico en ejecucion optima) sean correctas antes de pasar a produccion.
- Filtrado de datos sinteticos para entrenamiento: se usa como filtro para descartar trazas de CoT con pasos invalidos al construir datasets de razonamiento financiero.
- Auditoria de explicaciones en sistemas de recomendacion de inversion: comprueba que la justificacion paso a paso de una decision no contenga errores matematicos aunque la conclusion sea plausible.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el dataset `At1uri/quantitative-reasoning-cot-benchmarks`:

| Metrica | Valor |
|---|---|
| Step-Level Precision | 0.942 |
| Step-Level Recall | 0.918 |
| Hallucination Detection F1 | 0.930 |

Desglose por dominio (Step F1, segun la model card):

| Dominio | Step F1 |
|---|---|
| Calculo estocastico | 94,8% |
| Pricing de martingalas | 96,2% |
| Microestructura de mercado | 93,5% |
| Paridad de arbitraje | 95,1% |
| Mean field games | 91,8% |
| Finanzas cuanticas | 92,4% |

Ganancia de reranking Best-of-8 sobre 1.000 problemas de test:

| Motor de generacion | Pass@1 sin PRM | Pass@1 con PRM Best-of-8 | Ganancia |
|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B | 76,2% | 88,4% | +12,2% |
| Qwen-2.5-Math-72B-Instruct | 81,5% | 91,8% | +10,3% |
| Llama-3.3-70B (datos truncados en la model card) | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,18 GB solo para pesos (45,6 M de parametros); en fp16, unos 0,09 GB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1660, RTX 3060, RTX 4090, asi como en CPU.
- GPU recomendadas para despliegue de alto throughput: A100, H100 o L40S si se procesan muchas trazas en paralelo; para uso individual, cualquier GPU con 4 GB o mas es suficiente.
- Opciones de despliegue: al ser un transformer estandar con safetensors, puede servirse con Hugging Face Transformers, vLLM o TGI; la model card referencia un paquete propio `prm_engine` con la clase `FinancialProcessRewardModel`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas de PRM en la informacion proporcionada. La comparativa se limita a los motores de generacion usados en la evaluacion del autor:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| At1uri/financial-reasoning-process-reward-model | PRM (verificador) | 45,6 M | no disponible | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-32B | LLM generador | 32 B | no disponible | no disponible en esta ficha | Hugging Face |
| Qwen-2.5-Math-72B-Instruct | LLM generador matematico | 72 B | no disponible | no disponible en esta ficha | Hugging Face |
| Llama-3.3-70B | LLM generador | 70 B | no disponible | no disponible en esta ficha | Hugging Face |

Los PRM no son sustitutos de los modelos generadores, sino complementos: se usan para reranking o como critico en busqueda. No se han identificado en la informacion disponible otros PRM especializados en finanzas cuantitativas con los que comparar directamente.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como `verified: false`; no han sido replicados de forma independiente.
- Idioma limitado al ingles; no se declara soporte para castellano ni otros idiomas.
- Longitud de contexto no especificada, lo que impide evaluar su comportamiento en trazas de razonamiento muy largas.
- Modelo especializado en dominios cuantitativos concretos; su rendimiento fuera de calculo estocastico, pricing, microestructura, arbitraje, mean field games y finanzas cuanticas no esta documentado.
- Riesgo de alucinacion del propio verificador: un PRM puede asignar alta probabilidad a pasos plausibles pero incorrectos o penalizar formulaciones alternativas validas.
- La model card contiene secciones truncadas (por ejemplo, la fila de Llama-3.3-70B en la tabla de reranking), lo que limita la reproducibilidad de algunas cifras.
- El paquete `prm_engine` referenciado en los ejemplos no aparece documentado como repositorio publico en la informacion disponible; la integracion real puede requerir cargar los pesos con Transformers directamente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion externa aconseja no depender del modelo como unico mecanismo de verificacion en produccion critica.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/financial-reasoning-process-reward-model
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/quantitative-reasoning-cot-benchmarks
- Space interactivo (FinReasoning Arena): https://huggingface.co/spaces/At1uri/fin-reasoning-arena
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
