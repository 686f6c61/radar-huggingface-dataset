# mo-shadfar/laya-fa-retail-shopping

## Resumen

Laya fine-tuned on Persian customer-service data es un ajuste fino del checkpoint multilingue Laya, publicado por el usuario mo-shadfar en HuggingFace. El modelo parte de Laya y se especializa en un dominio muy concreto: atencion al cliente en persa (farsi) para el sector retail y compras. El autor describe el entrenamiento como un ajuste sobre un conjunto de unos 300 casos de servicio al cliente en persa, con objetivos suaves ("soft targets") sobre intencion, urgencia y preguntas de tipo noul, usando la receta RLCD con DDP.

El modelo tiene 321.908.998 parametros (aproximadamente 322 millones), lo que lo situa en la categoria de modelos pequenos. El repositorio ocupa 0,7 GB y los pesos estan en formato safetensors. La libreria de ejecucion declarada es `laya`, y la interfaz publica que muestra el autor es un metodo `predict(state, questions)` orientado a producir una respuesta o decision a partir de un estado y una lista de preguntas, mas que a un chat generativo generico.

La relevancia de esta ficha es acotada: se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, con documentacion minima y sin resultados de evaluacion publicados. Es util como ejemplo de ajuste fino de bajo coste (entrenado en Kaggle con 2xT4) sobre un modelo base multilingue para una tarea vertical de atencion al cliente en persa, pero no debe tratarse como un modelo de proposito general ni como un sistema listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor indica que es un ajuste fino del checkpoint multilingue Laya; no se detalla la arquitectura subyacente) |
| Parametros totales | 321.908.998 (dato real de safetensors) |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | persa (farsi), segun las etiquetas y la model card; el metadato de idiomas de HuggingFace no declara ninguno |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card del autor no detalla la arquitectura del modelo base. Lo unico declarado es que se trata de un ajuste fino del "checkpoint multilingue" de Laya, una libreria de ejecucion (`laya`) cuyos pesos se cargan mediante `laya.load(...)`. Con 321,9 millones de parametros y un repositorio de 0,7 GB, el tamano de los pesos es coherente con un almacenamiento en precision de 16 bits (aproximadamente 0,64 GB solo de pesos). No se especifica si la arquitectura es un transformer denso, un modelo con mezcla de expertos, un SSM o un hibrido; ese dato queda como no disponible.

En cuanto al entrenamiento, el autor indica que se ajusto sobre un conjunto de servicio al cliente en persa de unos 300 casos, con objetivos suaves sobre intencion, urgencia y preguntas de tipo noul. El proceso se realizo en Kaggle con 2 GPU T4 y con la receta RLCD en modo DDP (Distributed Data Parallel) tomada del cuaderno de ajuste fino de Laya. No se documentan el numero total de tokens de entrenamiento ni la composicion del dataset. Tampoco se detalla si hubo etapas de RLHF o DPO mas alla de la mencion a RLCD (Reinforcement Learning from Contrastive Data). Un conjunto de aproximadamente 300 casos es muy reducido para un ajuste fino, lo que aumenta el riesgo de sobreajuste al dominio y limita la generalizacion a otras distribuciones de conversaciones.

La interfaz de uso publicada es la siguiente:

```python
import laya
agent = laya.load("mo-shadfar/laya-fa-retail-shopping")
res = agent.predict(state, questions)
```

El hecho de que la API exponga `predict(state, questions)` y no `generate` o `chat` sugiere un modelo orientado a producir decisiones o etiquetas (intencion, urgencia) sobre un estado y una lista de preguntas, dentro de un flujo de agente. No se documenta ninguna innovacion tecnica adicional, ni decodificacion especulativa, ni atencion lineal, ni modo de razonamiento explicito.

## Capacidades

- Ajuste fino para servicio al cliente en persa en el sector retail y compras.
- Prediccion de intencion, urgencia y respuestas a preguntas de tipo noul dentro de un esquema de objetivos suaves, segun la descripcion del autor.
- Interfaz de agente mediante `laya.load` y `agent.predict(state, questions)`.
- Soporte de tool calling o function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; la API sugiere un unico paso de prediccion sobre estado y preguntas.
- Capacidades multilingues: la etiqueta `persian` y la model card apuntan a persa; no se documenta cobertura de otros idiomas, pese a partir de un checkpoint descrito como multilingue.
- Capacidades de vision, audio o modo "thinking": no disponibles; no se documentan.
- Generacion de texto libre, codigo o matematicas: no documentadas; el modelo esta orientado a una tarea de prediccion especifica.

## Casos de uso

- Clasificacion de intencion en atencion al cliente: el modelo puede recibir el estado de la conversacion y una pregunta del cliente y devolver la intencion asociada, lo que permite enrutar cada consulta al equipo o al flujo adecuado en una tienda online persa.
- Priorizacion por urgencia: dado que el ajuste incluye objetivos suaves sobre urgencia, el modelo puede puntuar cada consulta para que las mas criticas (por ejemplo, incidencias de pago o envio) se atiendan antes.
- Respuesta a preguntas frecuentes de retail: preguntas de tipo noul (segun la nomenclatura del autor) pueden resolverse con el modelo sin necesidad de un LLM generativo de mayor tamano, reduciendo coste de inferencia en produccion.
- Triaje previo a un modelo mayor: usar este modelo de 322 millones de parametros como primera capa para clasificar y filtrar consultas en un pipeline de atencion, derivando solo los casos ambiguos a un modelo de mayor capacidad.
- Enrutado de conversaciones en un flujo de agente: la firma `predict(state, questions)` encaja con un agente que mantiene un estado y consulta al modelo para decidir la siguiente accion dentro de un arbol de decision.
- Analitica de conversaciones: procesar por lotes historicos de tickets persas para extraer intenciones y niveles de urgencia y construir paneles de seguimiento de la carga de soporte.
- Prototipado rapido de asistentes verticales: al estar bajo licencia apache-2.0 y tener un tamano reducido, sirve para validar ideas de asistente de compras en persa antes de invertir en modelos mayores.
- Despliegue en entornos con recursos limitados: por su tamano, puede ejecutarse en una sola GPU de consumo o incluso en CPU, lo que facilita usos en infraestructura pequena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, y los resultados de busqueda web no aportan datos sobre este modelo en concreto.

## Requisitos de hardware

- VRAM estimada para inferencia segun el numero real de parametros (321.908.998), sin contar el overhead del runtime ni el estado de la aplicacion: aproximadamente 1,29 GB en fp32, 0,64 GB en fp16/bf16, 0,32 GB en int8 y 0,16 GB en int4. Estas cifras son calculos derivados del recuento de parametros, no datos publicados por el autor.
- El repositorio ocupa 0,7 GB, coherente con pesos en precision de 16 bits.
- GPU recomendadas: al ser un modelo de 322 millones de parametros, cabe sin problemas en cualquier GPU de consumo con al menos 4-8 GB de VRAM. No se requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (por ejemplo, gamas RTX 30 y 40, e incluso integradas con suficiente memoria compartida) y tambien en CPU.
- Opciones de despliegue: la libreria declarada es `laya`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros runtimes; su uso con esos motores requeriria conversion y validacion, y no hay informacion publicada al respecto.
- Latencia y throughput estimados: no disponibles. No se publican mediciones.
- Entrenamiento documentado: el autor indica que se entreno en Kaggle con 2 GPU T4, lo que da una referencia del coste de computo del ajuste.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni un conjunto claro de modelos comparables de la misma categoria y tarea (modelos pequenos ajustados para servicio al cliente en persa). Sin datos de evaluacion, no es posible establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta analisis de sesgos.
- Riesgo de alucinacion: no disponible; al ser un ajuste orientado a clasificacion y prediccion sobre un estado, el riesgo depende del formato de salida, que no se detalla.
- Conjunto de ajuste muy reducido (aproximadamente 300 casos), lo que aumenta el riesgo de sobreajuste al dominio y de baja generalizacion a otras distribuciones de conversaciones o a otros comercios.
- Cobertura de idioma limitada: la model card y las etiquetas apuntan a persa, pese a partir de un checkpoint descrito como multilingue. No hay confirmacion de buen rendimiento en otros idiomas.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas.
- Ausencia total de evaluacion publicada: cero benchmarks y cero descargas en el momento de la consulta; no hay evidencia externa de calidad.
- Documentacion minima: no se especifican arquitectura base, dataset, hiperparametros, ni detalles del proceso RLCD.
- Licencia apache-2.0: permite uso comercial y modificacion, pero conviene revisar tambien la licencia del modelo base Laya del que deriva, que no se detalla en la informacion disponible.
- Caveat de produccion: la interfaz `predict(state, questions)` implica un contrato de entrada y salida propio de la libreria `laya`; su integracion en un stack estandar (por ejemplo, servidores compatibles con OpenAI API) no esta documentada y requeriria trabajo adicional de adaptacion.
- Fechas y actividad: creado y actualizado el 2026-10-08, sin senales de mantenimiento posterior en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/mo-shadfar/laya-fa-retail-shopping
- Repositorio, paper, blog o demo adicionales: no disponibles. Los resultados de busqueda web proporcionados no contienen enlaces relevantes a este modelo.
