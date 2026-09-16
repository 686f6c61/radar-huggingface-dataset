# microtensor-io/baseline-front-invoice-mt4g

## Resumen

`microtensor-io/baseline-front-invoice-mt4g` es una cuantizacion GGUF publicada por el usuario microtensor-io a partir del modelo base `Qwen/Qwen3.5-4B`. Segun la propia model card, se trata de la version del modelo base en formato Q4_K_M, publicada como "front baseline" para la subnet 92 de Microtensor. El repositorio no aporta informacion adicional sobre el entrenamiento, los datos utilizados ni los ajustes realizados sobre el modelo original.

El modelo cuenta con 4.205.751.296 parametros (aproximadamente 4,21 mil millones) y ocupa 2,7 GB en el repositorio, un tamano coherente con una cuantizacion de 4 bits. La licencia declarada es Apache 2.0, heredada del modelo base, lo que en principio permite uso comercial sin restricciones adicionales, aunque conviene verificar las condiciones del modelo original.

Su relevancia practica radica en que permite ejecutar un modelo de ~4B en hardware de consumo con un consumo de memoria muy reducido, y en que se presenta como linea base de referencia ("baseline") para tareas de procesamiento de documentos, a juzgar por el identificador del repositorio, que apunta a un escenario de facturas. No se han publicado resultados de evaluacion ni detalles tecnicos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `Qwen/Qwen3.5-4B`; el repositorio solo publica la cuantizacion) |
| Parametros totales | 4.205.751.296 (~4,21 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (generada con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en los datos proporcionados. El repositorio es una conversion/cuantizacion a GGUF del modelo `Qwen/Qwen3.5-4B`, por lo que la arquitectura, el numero de tokens de entrenamiento, la composicion del dataset y las fases de alineacion (RLHF, DPO u otras) corresponden al modelo base, cuyos detalles no se reproducen en la model card publicada.

El unico detalle tecnico aportado por el autor es el metodo de cuantizacion: Q4_K_M con uso de imatrix (matriz de importancia), una tecnica que pondera la importancia de los pesos durante la cuantizacion para reducir la perdida de calidad en modelos pequenos. El modelo se etiqueta ademas como `conversational` y `endpoints_compatible`, lo que sugiere que esta pensado para su uso en inferencia conversacional y para desplegarse mediante endpoints compatibles con el ecosistema de HuggingFace. No se documenta ninguna innovacion adicional.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos de ida y vuelta, si bien no se detalla el formato de plantilla empleado.
- Procesamiento de documentos y facturas: el nombre del repositorio (`front-invoice`) apunta a un uso como linea base para tareas de lectura y tratamiento de la parte frontal de facturas, presumiblemente dentro de un pipeline con OCR previo.
- Uso como linea base de evaluacion: esta publicado como "front baseline" de la subnet 92 de Microtensor, es decir, como referencia contra la que comparar otros modelos o ajustes.
- Inferencia local en hardware limitado: por su tamano (4,21 B de parametros en Q4_K_M) puede ejecutarse en CPU y en GPUs de gama media o baja.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion de datos de facturas en un pipeline de OCR mas LLM: el modelo recibe el texto extraido de la parte frontal de una factura y devuelve campos estructurados (emisor, CIF, fecha, base imponible, IVA, total). Su tamano reducido permite ejecutarlo junto al motor de OCR en la misma maquina.
- Clasificacion y enrutado documental: determinar el tipo de documento o el departamento responsable antes de derivarlo a un flujo de validacion, aprovechando la baja latencia de un modelo de ~4B cuantizado.
- Asistente conversacional interno para consultas sobre documentacion: con la etiqueta `conversational` y un despliegue en llama.cpp u Ollama, puede servir como chatbot on-premise donde no se permite enviar datos a APIs externas.
- Procesamiento por lotes de bajo coste: tareas de normalizacion, resumen o reformateo de cientos de documentos donde el coste por token importa mas que la calidad maxima, ejecutando varias instancias en una sola GPU de gama media.
- Punto de partida para fine-tuning especifico de dominio: al estar en GGUF y derivar de un modelo Apache 2.0, sirve como referencia de calidad base ("baseline") que un ajuste posterior debe superar en un dominio concreto como facturacion o contabilidad.
- Despliegue en el borde o en entornos sin GPU: con 2,7 GB de pesos puede ejecutarse en CPU en portatiles o mini-PC para demostraciones o prototipos de validacion de producto.
- Evaluacion comparativa de cuantizaciones: al ser una cuantizacion Q4_K_M con imatrix de un modelo conocido, es util para medir la degradacion de calidad frente a los pesos originales en tareas de extraccion de campos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria para los pesos: 2,7 GB en disco para la cuantizacion Q4_K_M; en memoria, la VRAM necesaria se situa en torno a 3-4 GB contando pesos, cache KV y overhead del runtime.
- GPU de consumo: cabe sin problemas en tarjetas con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2060 de 6 GB, GTX 1660 de 6 GB); en GPUs de 8-12 GB se pueden ejecutar varias instancias o contextos mas largos.
- Ejecucion en CPU: viable gracias al formato GGUF, con velocidades dependientes del numero de nucleos y del ancho de banda de memoria; no se dispone de cifras concretas.
- GPUs de datacenter: para produccion con alta concurrencia puede desplegarse en A100, H100 o L40S, aunque el modelo esta muy por debajo de la capacidad de estas tarjetas y lo habitual seria consolidar varias replicas por GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints de HuggingFace (la etiqueta `endpoints_compatible` del repositorio sugiere esta via). El soporte de GGUF en vLLM y TGI existe pero es mas limitado que con pesos safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparacion se realiza a nivel de formato, tamano y licencia; no hay datos de rendimiento publicados para este modelo, por lo que la columna de rendimiento queda como no disponible en todos los casos.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `microtensor-io/baseline-front-invoice-mt4g` | ~4,21 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Cuantizacion de `Qwen/Qwen3.5-4B`; baseline de la subnet 92 de Microtensor |
| `Qwen/Qwen2.5-3B-Instruct` | ~3,09 B | 32.768 tokens | Apache 2.0 | safetensors y GGUF de terceros | Alternativa de tamano similar con licencia permisiva |
| `meta-llama/Llama-3.2-3B-Instruct` | ~3,21 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors y GGUF de terceros | Requiere aceptar condiciones adicionales para uso comercial |
| `microsoft/Phi-3.5-mini-instruct` | ~3,8 B | 128.000 tokens | MIT | safetensors y GGUF de terceros | Tamano comparable y licencia muy permisiva |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no incluye arquitectura, datos de entrenamiento, idiomas ni evaluaciones, lo que dificulta justificar su uso en produccion frente a alternativas documentadas.
- Rendimiento no verificado: no hay benchmarks publicados, por lo que no puede afirmarse que iguale la calidad del modelo base sin cuantizar ni que sea adecuado para tareas concretas.
- Riesgo de alucinacion: inherente a los modelos de ~4B, especialmente en extraccion de campos numericos como importes, CIF o fechas, donde un error silencioso es costoso. Se recomienda validacion posterior con reglas o comprobaciones cruzadas.
- Contexto desconocido: al no declararse la longitud de contexto, no puede planificarse el tratamiento de facturas largas o de multiples paginas sin pruebas previas.
- Idiomas no declarados: no hay garantia de un rendimiento solido en castellano ni en otros idiomas distintos del ingles.
- Licencia: Apache 2.0 en este repositorio, pero conviene confirmar la licencia y las condiciones del modelo base `Qwen/Qwen3.5-4B` antes de un uso comercial.
- Trazabilidad baja: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni comunidad que valide el artefacto.
- Naturaleza del artefacto: es una cuantizacion, no un modelo entrenado especificamente para facturas; el nombre del repositorio sugiere el caso de uso, pero no hay evidencia publicada de ajuste sobre datos de facturacion.
- Advertencia sobre cuantizacion: Q4_K_M con imatrix reduce el peso a 4 bits y puede degradar tareas sensibles a la precision numerica, algo critico en documentos contables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/microtensor-io/baseline-front-invoice-mt4g
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio adicionales: no disponible (las busquedas web realizadas no devolvieron resultados relacionados con el modelo)
