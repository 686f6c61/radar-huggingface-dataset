# DuoNeural/RMSN-532M-MidSoliton-BasinSpread-s4-Base

## Resumen

RMSN-532M-MidSoliton-BasinSpread-s4-Base es un modelo de lenguaje recurrente desarrollado por DuoNeural Lab bajo la familia denominada Recurrent Momentum Soliton Network (RMSN). Se trata de una arquitectura port-Hamiltoniana con topologia de soliton discreta, es decir, un modelo recurrente que incorpora estructura fisica (formulacion Hamiltoniana con puertos) y un exponente de Lyapunov que rastrea la fase topologica del sistema. El modelo tiene 532,2 millones de parametros, una dimension de representacion D=1664, profundidad 16 y 64 slots, y fue entrenado durante 100.000 pasos hasta alcanzar una loss de validacion de 4,5624 (perplejidad aproximada de 95,8).

Este checkpoint concreto es una semilla de documentacion ("basin spread seed 4") dentro de la wave107, un experimento que estudia la cuenca de atraccion global de arquitecturas con D entre 1664 y 1792. Segun la model card, en ese regimen de anchura la mayoria de semillas aleatorias convergen a una topologia casi optima (cuenca globalmente atractora), con una dispersion de 1,3 puntos de CoT entre 5 semillas, frente a D=2048 donde aparecen cuencas "riddled" con dispersion de 2,87 puntos. El modelo es relevante como artefacto de investigacion sobre estabilidad de entrenamiento en modelos recurrentes con estructura fisica, no como modelo de produccion: no se documentan capacidades generativas evaluadas, idiomas soportados ni resultados de benchmarks.

La licencia es Apache 2.0 y los pesos se distribuyen en formato PyTorch (repo de 1,8 GB), sin pipeline declarado en Hugging Face y con cero descargas y likes en el momento de la consulta. La model card es fundamentalmente un registro de experimento (seed de documentacion) mas que una ficha de modelo orientada a uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Momentum Soliton Network (RMSN); modelo recurrente port-Hamiltoniano con topologia de soliton discreta |
| Parametros totales | 532,2M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint nativo; repo de 1,8 GB) |

Parametros adicionales documentados: dimension D=1664, profundidad 16, 64 slots, 100.000 pasos de entrenamiento, loss de validacion 4,5624 (perplejidad aproximada 95,8).

## Arquitectura y entrenamiento

La arquitectura es un modelo recurrente de la familia RMSN (Recurrent Momentum Soliton Network), descrito por el autor como un modelo de lenguaje recurrente port-Hamiltoniano con topologia de soliton discreta. La formulacion port-Hamiltoniana implica que la dinamica interna del estado se rige por una estructura de energia conservativa con puertos de entrada/salida, lo que en la practica se traduce en un sesgo inductivo hacia estados recurrentes estables. El exponente de Lyapunov se usa como metrica de seguimiento de la fase topologica del sistema durante el entrenamiento. La configuracion concreta de este checkpoint es D=1664, profundidad 16 y 64 slots.

El entrenamiento consta de 100.000 pasos, con loss de validacion final de 4,5624 (perplejidad aproximada de 95,8). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Este checkpoint pertenece a la wave107, cuyo objeto es caracterizar la cuenca de atraccion: para anchuras D=1664-1792 la mayoria de semillas converge a topologias casi optimas (cuenca globalmente atractora, dispersion de 1,3 puntos de CoT entre 5 semillas), mientras que D=2048 presenta cuencas "riddled" con dispersion de 2,87 puntos. La innovacion tecnica destacable es, por tanto, la estabilidad de convergencia en funcion de la anchura, no una tecnica de decodificacion o atencion especifica.

## Capacidades

- Generacion de texto autoregresiva mediante estado recurrente; no se documentan evaluaciones de calidad generativa.
- Razonamiento multi-paso por naturaleza recurrente (el estado se actualiza en cada paso), si bien no hay resultados publicados que lo cuantifiquen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de modos de pensamiento (thinking mode).
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Vision, audio y otras modalidades: no disponibles; el modelo es exclusivamente de texto segun la informacion disponible.
- Capacidad especial de investigacion: checkpoint semilla para estudio de cuencas de atraccion y estabilidad topologica en modelos recurrentes port-Hamiltonianos.

## Casos de uso

- Investigacion sobre estabilidad de entrenamiento: usar el checkpoint como referencia empirica de convergencia en el regimen D=1664, comparando la loss de validacion (4,5624) y la dispersion de cuenca (1,3 puntos de CoT) con semillas de D=2048.
- Reproduccion de experimentos de dinamica topologica: analizar el exponente de Lyapunov registrado durante el entrenamiento para estudiar transiciones de fase en redes recurrentes.
- Estudio de sesgos inductivos fisicos: comparar un modelo port-Hamiltoniano con arquitecturas transformer de tamano similar para aislar el efecto de la estructura energetica en la calidad del lenguaje.
- Baseline en ablaciones de anchura: servir como punto de control en barridos de D (1664, 1792, 2048) para medir como la anchura afecta la robustez de convergencia entre semillas.
- Analisis de robustez a inicializacion: dado que la cuenca es globalmente atractora en este regimen, el checkpoint permite medir la sensibilidad de los resultados finales a la semilla inicial.
- Docencia e investigacion academica: material de estudio para cursos sobre modelos recurrentes avanzados, formulaciones Hamiltonianas y teoria de cuencas de atraccion, con licencia Apache 2.0 que permite uso y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la loss de validacion de 4,5624 (perplejidad aproximada de 95,8) tras 100.000 pasos de entrenamiento. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (532,2M parametros), en FP32 los pesos ocuparian aproximadamente 2,1 GB, en FP16/BF16 aproximadamente 1,1 GB y en cuantizacion de 8 bits aproximadamente 0,6 GB; estas cifras no incluyen estado recurrente, activaciones ni overhead del runtime y no estan verificadas por el autor.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojar los pesos en FP16, pero el modelo no declara requisitos ni compatibilidad con runtimes concretos.
- Cabe en GPU consumer: probablemente si por volumen de parametros, pero no confirmado por el autor.
- Opciones de despliegue: solo se declara PyTorch como libreria. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia; al ser una arquitectura recurrente no estandar, es esperable que requiera codigo propio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. La familia RMSN es una arquitectura propietaria de DuoNeural Lab sin equivalentes publicos identificados en los datos disponibles; los modelos recurrentes de referencia habituales (por ejemplo, familias tipo Mamba o RWKV) no aparecen mencionados en la model card ni en los metadatos. Por tanto, la comparativa se declara no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-532M-MidSoliton-BasinSpread-s4-Base | 532,2M | no disponible | Apache 2.0 | Hugging Face (PyTorch) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion: la model card es un registro de experimento (seed de documentacion de cuenca), no una ficha de modelo listo para produccion; no hay evaluaciones de calidad, seguridad o utilidad.
- Perplejidad alta: la loss de validacion de 4,5624 (perplejidad aproximada de 95,8) indica un modelo con capacidad de modelado del lenguaje limitada en terminos absolutos; no es adecuado para tareas generativas exigentes.
- Idiomas no declarados: se desconoce que lenguas cubre y con que calidad; no debe asumirse soporte multilingue.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, lo que impide planificar casos de uso con ventanas largas.
- Sesgos desconocidos: no se documenta composicion del dataset ni evaluaciones de sesgo; los sesgos presentes en los datos de entrenamiento son, por tanto, no auditables.
- Riesgo de alucinacion: no evaluado; al no haber benchmarks ni evaluaciones de fidelidad, debe asumirse riesgo alto en uso generativo.
- Arquitectura no estandar: al ser un modelo recurrente port-Hamiltoniano, es probable que no funcione con los runtimes de inferencia convencionales y requiera codigo especifico del autor, lo que complica el despliegue.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; no se declaran restricciones adicionales, pero tampoco garantias de ningun tipo.
- Adopcion nula: cero descargas y cero likes en Hugging Face; no hay evidencia de uso externo ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-532M-MidSoliton-BasinSpread-s4-Base
- Paper citado en la model card: DuoNeural Lab. "RMSN: Recurrent Momentum Soliton Networks." 2026 (referencia sin URL disponible).
- Repositorio, blog o demo adicionales: no disponibles en la informacion proporcionada.
