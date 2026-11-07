# prompt-armor/l2-injection-guard-onnx

## Resumen

`prompt-armor/l2-injection-guard-onnx` es un clasificador de texto binario especializado en detectar intentos de *prompt injection*. Se trata de una copia sin modificar del fichero `onnx/model_quantized.onnx` y del tokenizer del modelo `Horizon-Labs/prompt-injection-guard-small` (commit `359521f`), publicado por el proyecto prompt-armor para garantizar que una retirada del repositorio original no rompa las instalaciones que dependen de él. El modelo base fue ajustado a partir de `mmBERT-small` de JHU CLSP (licencia MIT) y se distribuye con licencia Apache-2.0.

El modelo constituye la capa L2 del sistema prompt-armor, un conjunto de cinco capas de análisis que se ejecutan en paralelo y cuyos resultados se fusionan mediante un meta-clasificador entrenado. La salida es una clasificación de dos etiquetas: `0 = SAFE` y `1 = INJECTION`. El objetivo es ofrecer una detección offline, rápida (el sistema completo declara unos 24 ms de latencia) y sin coste por petición, pensada para integrarse en pipelines de aplicaciones LLM que necesitan filtrar entradas maliciosas antes de llegar al modelo generativo.

La relevancia actual del modelo radica en que los ataques de prompt injection siguen siendo uno de los vectores de riesgo más difíciles de mitigar en aplicaciones con LLM, y disponer de un clasificador pequeño, cuantizado y en formato ONNX facilita su despliegue en entornos con recursos limitados o en el propio perímetro de la aplicación. El repositorio ocupa 0,3 GB y no registra descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según tag `modernbert`); modelo base `mmBERT-small` ajustado como clasificador de texto |
| Parametros totales | no disponible (el modelo base es una variante "small" de mmBERT; no se especifica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo ya cuantizado en formato ONNX (`model_quantized.onnx`); no se detallan los esquemas exactos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuantizado) + tokenizer |

## Arquitectura y entrenamiento

El modelo es un clasificador de texto basado en la familia ModernBERT, según la etiqueta declarada en el repositorio. Concretamente, deriva de `mmBERT-small` (JHU CLSP, licencia MIT), que fue ajustado por Horizon Labs para la tarea de detección de prompt injection y publicado como `Horizon-Labs/prompt-injection-guard-small`. La versión aquí descrita es una exportación a ONNX del checkpoint cuantizado, realizada con el script `scripts/export_l2_model.py` del proyecto prompt-armor, sin modificaciones respecto al original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla la innovación técnica más allá de la propia cuantización y exportación a ONNX, que permiten inferencia eficiente en CPU y despliegue offline. El modelo produce una etiqueta binaria (`SAFE` / `INJECTION`), por lo que su uso previsto es como componente de filtrado dentro de un sistema mayor, no como generador de texto.

## Capacidades

- Clasificación binaria de texto: distingue entre entrada segura (`0 = SAFE`) y tentativa de prompt injection (`1 = INJECTION`).
- Detección de prompt injection en entradas de usuario, pensada para ejecutarse antes de que el texto llegue a un LLM.
- Inferencia offline y local: al estar en formato ONNX cuantizado, puede ejecutarse sin conexión y sin dependencia de APIs externas.
- Integración como capa L2 dentro del sistema prompt-armor, cuyos resultados se combinan con otras cuatro capas mediante un meta-clasificador.
- Baja latencia: el sistema completo declara aproximadamente 24 ms por análisis.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entradas en aplicaciones LLM: colocar el clasificador en el perímetro de un chatbot o asistente para bloquear mensajes que contengan instrucciones maliciosas antes de enviarlos al modelo generativo, reduciendo el riesgo de secuestro de instrucciones.
- Defensa en profundidad con prompt-armor: usar esta capa L2 junto con las otras cuatro capas del sistema para obtener una puntuación fusionada con evidencia y confianza, adecuada para sistemas que requieren trazabilidad de las detecciones.
- Despliegue en entornos con recursos limitados: al ser un modelo pequeño y cuantizado en ONNX, puede ejecutarse en CPU en servidores modestos o en el propio dispositivo, sin GPU dedicada.
- Protección de pipelines RAG: clasificar los fragmentos recuperados y las consultas del usuario antes de construir el prompt final, evitando que documentos envenenados introduzcan instrucciones no deseadas.
- Moderación en APIs públicas: integrar el clasificador como paso previo en un gateway de API para rechazar peticiones sospechosas y registrar la etiqueta y la confianza asociada.
- Evaluación y monitorización continua: usar el clasificador para etiquetar logs de conversaciones y detectar patrones de ataque recurrentes, alimentando así la mejora de las reglas y del meta-clasificador.
- Entornos air-gapped: al distribuirse como copia fijada y offline, encaja en despliegues sin acceso a internet donde no se puede depender de repositorios upstream que puedan retirarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un modelo "small" cuantizado en ONNX, la huella es reducida y cabe holgadamente en GPU de consumo, aunque no se especifican cifras.
- GPU recomendadas: no disponibles; el formato ONNX cuantizado está pensado para inferencia en CPU, por lo que una GPU dedicada no es un requisito.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con unos pocos GB de memoria, aunque el dato exacto no está publicado.
- Opciones de despliegue: ONNX Runtime (formato nativo), y a través de él integrable en servicios Python; el sistema prompt-armor se distribuye como paquete PyPI (`prompt-armor`).
- Latencia y throughput: el sistema completo declara aproximadamente 24 ms por análisis; no se desglosa la latencia específica de esta capa L2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prompt-armor/l2-injection-guard-onnx | no disponible | no disponible | Clasificación prompt injection | Apache-2.0 | Hugging Face (ONNX) |
| Horizon-Labs/prompt-injection-guard-small | no disponible | no disponible | Clasificación prompt injection | Apache-2.0 | Hugging Face (upstream) |
| jhu-clsp/mmBERT-small | variante "small" de mmBERT | no disponible | Modelo base encoder | MIT | Hugging Face |

La comparativa se limita a los modelos de la cadena de derivación, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Clasificador binario: solo distingue entre `SAFE` e `INJECTION`; no identifica el tipo de ataque ni proporciona explicaciones por sí mismo (la evidencia la aporta el sistema prompt-armor en su conjunto).
- Riesgo de falsos positivos y falsos negativos: al ser un modelo pequeño y cuantizado, su precisión puede ser inferior a la de clasificadores de mayor tamaño; no se han publicado métricas que permitan cuantificar este riesgo.
- Idiomas: no se especifican los idiomas soportados; no hay garantía de buen rendimiento fuera del idioma o idiomas de entrenamiento, que tampoco se detallan.
- Contexto: se desconoce la longitud máxima de entrada; entradas muy largas podrían truncarse y perder la parte relevante del ataque.
- Copia fijada: el repositorio es una réplica de un commit concreto del modelo upstream; no recibirá mejoras ni correcciones del autor original salvo que prompt-armor las republique.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE y NOTICE incluidos, así como las licencias de los modelos de la cadena (mmBERT-small es MIT).
- Uso en producción: debe emplearse como una capa más de defensa, no como única protección frente a prompt injection; conviene combinarlo con validación de salidas, control de permisos y monitorización.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base ni del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prompt-armor/l2-injection-guard-onnx
- Modelo base upstream: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Modelo base de mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio GitHub del proyecto: https://github.com/prompt-armor/prompt-armor
- Paquete PyPI: https://pypi.org/project/prompt-armor/
