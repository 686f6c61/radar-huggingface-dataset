# CosMosOrigin/proto-qwen3b-multi-gguf-web

## Resumen

proto-qwen3b-multi-v1 es un ajuste fino por QLoRA de Qwen2.5-Coder-3B-Instruct, publicado por el usuario CosMosOrigin, orientado a la respuesta de preguntas sobre los buses de comunicacion embebidos I2C, SPI y UART, con generacion de citas y bocetos de Arduino. El modelo se distribuye unicamente en formato GGUF cuantizado Q4_K_M y troceado en cuatro piezas de aproximadamente 500 MB cada una, pensado para su carga en el navegador mediante wllama dentro del Space i2c-assistant-web.

Se trata de un proyecto de estudiante con finalidad demostrativa y educativa no comercial. El modelo base, Qwen2.5-Coder-3B-Instruct, pertenece a la familia Qwen2.5 de Alibaba y esta especializado en codigo e instrucciones; este ajuste lo reorienta a un dominio muy concreto de electronica embebida. Con 3.085.938.688 parametros totales y un repositorio de 1,9 GB, el modelo esta pensado para ejecucion en entornos con recursos limitados, incluido el propio navegador.

La relevancia actual del modelo es acotada: no compite en capacidades generales con modelos de su tamano, sino que ilustra un patron de despliegue de LLM en el cliente (edge/browser) mediante pesos GGUF troceados y una interfaz web. Su publico objetivo son desarrolladores interesados en asistentes de dominio especifico para microcontroladores y en tecnicas de inferencia local de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-3B-Instruct); detalles del ajuste no disponibles |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia del modelo base: Alibaba Cloud; uso no comercial segun la model card) |
| Formato de pesos | GGUF troceado en 4 piezas de ~500 MB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.085.938.688 parametros especializado en codigo e instrucciones. Sobre esa base se aplica un ajuste fino QLoRA (cuantizacion de bajo rango) para tareas de pregunta-respuesta sobre I2C, SPI y UART, con un formato de salida que incluye citas y bocetos de Arduino. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales.

La innovacion tecnica destacable no esta en el entrenamiento sino en la distribucion: los pesos se publican exclusivamente en GGUF Q4_K_M y se dividen en cuatro fragmentos de aproximadamente 500 MB para permitir su carga incremental en el navegador mediante wllama. Este patron de empaquetado esta disenado para el Space i2c-assistant-web, que consume el modelo desde el cliente sin necesidad de servidor de inferencia dedicado.

## Capacidades

- Generacion de texto tecnico sobre protocolos de bus embebido: I2C, SPI y UART.
- Respuesta a preguntas con citas (el modelo esta ajustado para incluir referencias en sus respuestas).
- Generacion de bocetos de Arduino (sketches) relacionados con la configuracion y uso de esos buses.
- Razonamiento y generacion de codigo heredados del modelo base Qwen2.5-Coder-3B-Instruct.
- Conversacion multi-turno (el modelo base es Instruct; el ajuste conserva el formato conversacional).
- Ejecucion en navegador mediante wllama con pesos GGUF troceados.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues especificas del ajuste: no disponibles.

## Casos de uso

- Asistente educativo en navegador para electronica embebida: el Space i2c-assistant-web carga el modelo con wllama y responde dudas sobre I2C, SPI y UART sin enviar datos a un servidor, lo que resulta adecuado para demostraciones en aula.
- Generacion de sketches de Arduino en prototipado rapido: el ajuste produce bocetos de codigo para inicializar y comunicar perifericos por bus, reduciendo el tiempo de arranque en proyectos de laboratorio.
- Consulta de referencia con citas durante depuracion de buses: al estar entrenado para incluir citas, puede servir como apoyo documental al revisar configuraciones de registros, direcciones y temporizacion.
- Apoyo a docentes en la elaboracion de material didactico: el modelo puede redactar explicaciones y ejemplos de uso de I2C, SPI y UART para guias y ejercicios.
- Despliegue en entornos sin conectividad o con restricciones de privacidad: al ejecutarse en el cliente con pesos de ~1,9 GB, permite asistencia offline en equipos de laboratorio.
- Prototipado de asistentes de dominio especifico: sirve como referencia de como ajustar un modelo de 3B con QLoRA y empaquetarlo en GGUF troceado para distribucion web.
- Evaluacion de tecnicas de inferencia en navegador: util para investigadores que quieran medir latencia y viabilidad de wllama con modelos de 3B cuantizados a Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con cuantizacion Q4_K_M (pesos de ~1,9 GB mas overhead de contexto); el valor exacto no esta publicado.
- GPU recomendadas: no disponibles. Por tamano, el modelo es compatible con GPUs de consumo con al menos 4 GB de memoria, aunque no se han publicado pruebas.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM; sin datos oficiales de rendimiento.
- Opciones de despliegue: wllama en navegador (uso previsto por el autor); llama.cpp y otros runners compatibles con GGUF son opciones tecnicas, aunque no se documentan en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| proto-qwen3b-multi-v1 | 3.085.938.688 | no disponible | other (base Alibaba Cloud) | GGUF Q4_K_M troceado | Ajuste de dominio para I2C/SPI/UART; uso educativo no comercial |
| Qwen2.5-Coder-3B-Instruct | 3.085.938.688 | no disponible | Alibaba Cloud | safetensors, GGUF | Modelo base; capacidades generales de codigo e instrucciones |
| Otros modelos de ~3B para codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa con alternativas no esta disponible: la model card no publica benchmarks ni metricas frente a otros modelos.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste esta orientado a I2C, SPI y UART; su rendimiento fuera de ese ambito sera el del modelo base o inferior.
- Riesgo de alucinacion en detalles tecnicos: direcciones de registros, temporizaciones y pines pueden ser incorrectos; requiere verificacion contra datasheets.
- Proyecto de estudiante sin validacion publica: no hay benchmarks, evaluaciones ni historial de uso (0 descargas, 0 likes en el momento de la ficha).
- Licencia "other" con restriccion a uso no comercial segun la model card; el modelo base esta sujeto a la licencia de Alibaba Cloud, cuyos terminos deben respetarse.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingue del ajuste.
- Longitud de contexto no documentada; el uso en navegador con wllama puede limitar aun mas el contexto efectivo.
- Formato unico GGUF Q4_K_M troceado: no hay safetensors ni otras cuantizaciones publicadas, lo que limita el reajuste o la conversion a otros formatos.
- No apto para produccion sin evaluacion previa: ausencia de datos de latencia, throughput y calidad impide garantizar su idoneidad en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CosMosOrigin/proto-qwen3b-multi-gguf-web
- Space asociado: https://huggingface.co/spaces/CosMosOrigin/i2c-assistant-web
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
