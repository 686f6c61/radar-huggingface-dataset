# ant-intl/Antom-3-in-1-Transformer

## Resumen

Antom 3-in-1 Transformer es un modelo fundacional para evaluacion de riesgo de pagos desarrollado por Ant International (Antom). Se trata de un transformer de aproximadamente 7B parametros totales, de los cuales unos 1.7B se activan por ruta de tarea, lo que sugiere una arquitectura de tipo mixture-of-experts con enrutamiento condicionado por tarea. El modelo combina tres tipos de codificadores (secuencia, tabular y grafo) mediante una fusion condicionada por la tarea, disenada para abordar el riesgo de fraude en transacciones de pago.

El modelo resuelve el problema de detectar y puntuar riesgo de fraude en pagos en produccion. Segun la model card, reduce la tasa de perdida global en un 37,88 % frente a XGB-Online con el mismo presupuesto de intervencion del 0,5 %. Es relevante por su enfoque multimodal (texto, datos tabulares y grafos de relaciones) aplicado a un dominio tradicionalmente dominado por modelos de arboles tipo gradient boosting.

La publicacion es unicamente un informe tecnico: no se liberan pesos ni se detalla la arquitectura, las configuraciones de entrenamiento ni la construccion del dataset, por temor a que el modelo pueda ayudar a defraudadores a evadir la deteccion. Esa restriccion limita severamente su evaluacion externa y su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificadores de secuencia, tabulares y de grafo, y fusion condicionada por tarea (presuntamente MoE con enrutamiento por tarea) |
| Parametros totales | ~7B |
| Parametros activos | ~1.7B por ruta de tarea |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

La arquitectura combina tres codificadores especializados: uno para datos de secuencia, uno para datos tabulares y uno para grafos, unidos mediante un mecanismo de fusion condicionado por la tarea. El modelo tiene aproximadamente 7B parametros totales pero activa solo unos 1.7B por ruta de tarea, lo que apunta a un diseno de expertos con enrutamiento por tipo de tarea (por ejemplo, puntuacion de fraude, clasificacion de riesgo o deteccion de anomalias en grafos de transacciones).

No se han publicado detalles sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales. El autor declara explicitamente que la arquitectura detallada, las configuraciones de entrenamiento y los procedimientos de construccion del dataset se comparten solo con terceros invitados, por lo que no hay informacion publica sobre el proceso de entrenamiento.

## Capacidades

- Evaluacion de riesgo de pagos y puntuacion de fraude en transacciones.
- Procesamiento de datos de secuencia (historial de transacciones, eventos temporales).
- Procesamiento de datos tabulares (features estructurados de transacciones y usuarios).
- Modelado de grafos (relaciones entre entidades, dispositivos, cuentas y comercios).
- Fusion multimodal condicionada por la tarea para combinar las tres modalidades.
- Soporte multilingue: solo ingles segun los metadatos.
- Tool calling, function calling, agentes, vision, audio y modo thinking: no disponible.

## Casos de uso

- Deteccion de fraude en tiempo real: el modelo puntua transacciones combinando historial de secuencia, features tabulares y relaciones de grafo, lo que permite capturar patrones que un modelo tabular aislado no veria, como redes de cuentas vinculadas.
- Priorizacion de revisiones manuales: con un presupuesto de intervencion fijo (por ejemplo, 0,5 % de transacciones), el modelo ordena casos por riesgo para que los analistas revisen primero los de mayor probabilidad de fraude, reduciendo la tasa de perdida global.
- Puntuacion de riesgo de comercios: usando el codificador de grafo, el modelo puede evaluar el riesgo agregado de un comercio a partir de sus relaciones con cuentas, dispositivos y transacciones historicas.
- Analisis de redes de abuso: el componente de grafo permite detectar clusters de cuentas o dispositivos coordinados, util para investigaciones post-incidente y para alimentar reglas de bloqueo.
- Enriquecimiento de features para sistemas existentes: las representaciones aprendidas por los tres codificadores pueden servir como features de entrada para modelos downstream o para sistemas de reglas.
- Monitorizacion de deriva en produccion: al integrar secuencia, tabulares y grafo en un unico modelo, se puede comparar el comportamiento por modalidad y detectar cambios en los patrones de ataque.

## Benchmarks y rendimiento

| Metrica | Antom 3-in-1 Transformer | XGB-Online |
|---|---|---|
| Tasa de perdida global (presupuesto de intervencion 0,5 %) | reduccion del 37,88 % relativa | referencia |

No se han publicado resultados de benchmarks publicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento es la reduccion relativa de la tasa de perdida frente a XGB-Online en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~7B parametros totales y ~1.7B activos por tarea, una estimacion orientativa en fp16 seria de ~14 GB para los 7B totales y ~3,4 GB para los 1.7B activos, pero no hay confirmacion oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, un modelo de 7B en fp16 cabria en GPUs de 16-24 GB (RTX 4090, RTX A5000), pero no hay pesos publicados para verificar.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se publican pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Antom 3-in-1 Transformer | ~7B totales, ~1.7B activos | no disponible | -37,88 % de perdida vs XGB-Online | no disponible | solo informe tecnico, sin pesos |
| XGB-Online | no aplica (gradient boosting) | no aplica | referencia de produccion | no disponible | sistema interno |
| Modelos fundacionales de riesgo de pagos de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion publica sobre modelos comparables de la misma categoria (modelos fundacionales especificos para riesgo de pagos) en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican pesos ni codigo: el modelo no es utilizable ni reproducible por terceros; solo existe el informe tecnico.
- Arquitectura, datos de entrenamiento y configuraciones no se detallan publicamente, lo que impide auditar sesgos o comportamiento.
- Solo soporta ingles segun los metadatos, lo que limita su uso en mercados no angloparlantes.
- Licencia no disponible: no se puede determinar si se permite uso comercial.
- Riesgo de alucinacion y sesgos: no evaluable sin acceso al modelo.
- El propio autor advierte que la publicacion de detalles podria facilitar la evasion de la deteccion por parte de defraudadores, lo que subraya la sensibilidad del dominio.
- El rendimiento reportado (-37,88 % de perdida) procede de produccion interna y no de un benchmark publico reproducible.

## Enlaces

- Hugging Face: https://huggingface.co/ant-intl/Antom-3-in-1-Transformer
- Informe tecnico: ./Antom-3-in-1-Transformer-Technical-Report.pdf (referenciado en la model card)
- Diagrama de arquitectura: ./architecture.png (referenciado en la model card)
