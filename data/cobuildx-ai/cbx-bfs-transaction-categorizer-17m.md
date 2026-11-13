# CobuildX-AI/cbx-bfs-transaction-categorizer-17M

## Resumen

cbx-bfs-transaction-categorizer-17M es un modelo de clasificacion de texto especializado en la categorizacion de transacciones bancarias, desarrollado por CobuildX-AI. Se trata de un fine-tune del encoder jhu-clsp/ettin-encoder-17m, un transformer tipo encoder de arquitectura ModernBERT con 16,8 millones de parametros, lo que lo situa en la gama ultraligera y lo hace apto para inferencia de baja latencia en entornos con recursos limitados.

El modelo resuelve un problema concreto y acotado del dominio financiero: asignar una categoria a partir del texto libre que aparece en los extractos bancarios (concepto de la transaccion, nombre del comercio, referencias). Esta tarea es habitual en sistemas de gestion de gastos, conciliacion bancaria y enriquecimiento de datos financieros, donde los conceptos son ruidosos, abreviados y heterogeneos.

Es relevante por su especializacion y su tamano reducido, que permite desplegarlo en CPU o GPU de consumo con coste minimo. No obstante, conviene senalar que el modelo esta en acceso restringido (gated) y su licencia es de tipo no produccion, por lo que su uso comercial requiere revisar las condiciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/ettin-encoder-17m) |
| Parametros totales | 16.877.367 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cbx-bfs-model-non-production |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/ettin-encoder-17m, un encoder de la familia ModernBERT de apenas 17 millones de parametros. La arquitectura ModernBERT incorpora mejoras sobre el transformer encoder clasico, como posiciones rotatorias (RoPE) y atencion con soporte de secuencias largas, aunque en esta ficha no se dispone de la longitud de contexto exacta configurada. Sobre esa base se ha realizado un fine-tune supervisado para clasificacion de texto en el dominio de transacciones bancarias.

No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, el numero de clases de salida ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio fine-tune. El repositorio ocupa 0,1 GB, coherente con el tamano del modelo en safetensors.

## Capacidades

- Clasificacion de texto: asigna una categoria a un texto de transaccion bancaria.
- Especializacion financiera: entrenado sobre conceptos de extractos bancarios en ingles.
- Inferencia ultraligera: 17M de parametros, apto para CPU y GPU de consumo.
- Compatibilidad con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- Integracion con la libreria transformers.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es un encoder de clasificacion.
- No se documenta soporte de tool calling ni de agentes.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Categorizacion de movimientos bancarios: dado el concepto de una transaccion, el modelo devuelve la categoria de gasto correspondiente (alimentacion, transporte, suministros, etc.), lo que permite automatizar el enriquecimiento de extractos.
- Conciliacion contable: clasificar automaticamente apuntes importados en un ERP para reducir la revision manual en el cierre mensual.
- Aplicaciones de finanzas personales: etiquetar transacciones en una app de gestion de gastos con inferencia en CPU, dado el reducido coste computacional del modelo.
- Normalizacion de datos de comercios: procesar conceptos ruidosos o abreviados de extractos para mapearlos a categorias consistentes en un pipeline ETL.
- Deteccion de patrones de gasto: alimentar sistemas de analisis que agrupan transacciones por categoria para generar informes o alertas de presupuesto.
- Procesamiento por lotes a gran escala: su tamano permite clasificar millones de transacciones en pipelines de datos sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision completa (fp32), dado el tamano de 16,8M de parametros; en fp16 o int8 el consumo es aun menor.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers, text-embeddings-inference y endpoints compatibles; no se documenta soporte explicito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, el modelo se basa en jhu-clsp/ettin-encoder-17m, del que hereda arquitectura y tamano, pero no se dispone de cifras para comparar su rendimiento frente a alternativas de clasificacion financiera.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cbx-bfs-transaction-categorizer-17M | 16,8M | no disponible | cbx-bfs-model-non-production | Gated en HF |
| jhu-clsp/ettin-encoder-17m (base) | 16,8M | no disponible | no disponible | Publico en HF |
| Alternativas de clasificacion financiera | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia de tipo no produccion (cbx-bfs-model-non-production): no apta para uso comercial o en produccion sin autorizacion expresa del autor.
- Acceso restringido: requiere aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Solo ingles: no se documenta soporte de otros idiomas, lo que limita su uso con extractos en castellano u otras lenguas.
- Dominio acotado: entrenado para transacciones bancarias; su rendimiento fuera de ese ambito no esta garantizado.
- Riesgo de clasificacion erronea ante conceptos ambiguos, abreviaturas desconocidas o comercios no vistos durante el entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- Al ser un modelo de clasificacion, no genera texto ni justifica sus predicciones, lo que dificulta la trazabilidad en entornos regulados.
- No se dispone de informacion sobre el conjunto de etiquetas de salida, lo que exige consultar la model card del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/CobuildX-AI/cbx-bfs-transaction-categorizer-17M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
