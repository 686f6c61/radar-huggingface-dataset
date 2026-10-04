# Amr04/Qwen2.5-0.5B-Instruct-AWQ-W4A16-ASYM

## Resumen

Amr04/Qwen2.5-0.5B-Instruct-AWQ-W4A16-ASYM es una version cuantizada del modelo instructivo Qwen/Qwen2.5-0.5B-Instruct, publicada por el usuario Amr04 en Hugging Face. La cuantizacion se ha realizado con AWQ (Activation-aware Weight Quantization) a INT4 en pesos y 16 bits en activaciones (esquema W4A16), con pesos asimetricos de 4 bits, tamano de grupo 32 y observador de pesos basado en MSE. Segun la model card, la conversion se escribio desde cero, sin emplear una libreria de cuantizacion externa, y el modulo `lm_head` se mantiene en BF16.

El modelo base pertenece a la familia Qwen2.5 de Alibaba, una serie de modelos decoder-only densos que abarca desde 0,5B hasta 72B parametros y que fue preentrenada con un dataset de hasta 18 billones de tokens. La variante aqui descrita cuenta con 494.032.768 parametros reales segun los pesos en safetensors, ocupa aproximadamente 0,5 GB en el repositorio y esta pensada para inferencia en entornos con recursos muy limitados, incluido hardware de consumo o CPU.

Su relevancia actual es practica: permite ejecutar un modelo conversacional multilingue en GPUs de gama baja, dispositivos de borde o incluso portatiles sin GPU dedicada, reduciendo el coste de memoria frente al checkpoint BF16 original. El precio a pagar es una degradacion medible de la perplejidad: 17,659 frente a 16,030 en WikiText-2 con contexto de 1024 tokens, lo que supone un aumento de aproximadamente el 10,2 por ciento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen2 (etiqueta `qwen2` en el repositorio) |
| Parametros totales | 494.032.768 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la documentacion de la familia Qwen2.5 recogida en la busqueda web; no confirmado de forma especifica para la variante de 0,5B |
| Tipos de cuantizacion | INT4 de pesos con activaciones de 16 bits (W4A16); pesos asimetricos, group size 32, observador MSE; AWQ con `duo_scaling="both"` y `n_grid=40`; `lm_head` en BF16 |
| Idiomas soportados | No disponible en los metadatos del repositorio (la familia Qwen2.5 declara soporte multilingue) |
| Licencia | No disponible en los metadatos; depende del modelo base Qwen/Qwen2.5-0.5B-Instruct |
| Formato de pesos | safetensors en formato `pack-quantized` de compressed-tensors; compatible con la libreria `transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-0.5B-Instruct: un transformer decoder-only denso, segun la descripcion de la familia Qwen2.5 recogida en la busqueda web ("Dense, easy-to-use, decoder-only language models"). No se ha aplicado ningun cambio estructural respecto al checkpoint original; la intervencion se limita a la cuantizacion de los pesos de las capas lineales. El modulo de salida `lm_head` queda excluido de la cuantizacion y permanece en BF16, lo que evita parte del dano tipico en la distribucion de probabilidades del vocabulario.

El proceso de cuantizacion, descrito en la model card, empleo AWQ con escalado dual (`duo_scaling="both"`) y una rejilla de busqueda de 40 puntos (`n_grid=40`). La calibracion se realizo con 512 muestras de longitud maxima 1024 procedentes del dataset `neuralmagic/LLM_compression_calibration`. El resultado se serializa con el formato `pack-quantized` de compressed-tensors. No se dispone de informacion sobre el proceso de entrenamiento del modelo base (composicion exacta del dataset, fases de RLHF o DPO) mas alla del dato general de la familia: preentrenamiento sobre hasta 18 billones de tokens y posterior ajuste instructivo.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Qwen2.5-0.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones simples, limitado por el tamano del modelo (0,5B).
- Generacion y explicacion de codigo a nivel introductorio, sin garantias de correccion en fragmentos largos.
- Operaciones matematicas sencillas y aritmetica de pocos pasos.
- Capacidad multilingue heredada del modelo base (la familia Qwen2.5 declara soporte multilingue; el detalle de idiomas no figura en los metadatos de este repositorio).
- Compatibilidad con `text-generation-inference` y con endpoints gestionados, segun las etiquetas `text-generation-inference` y `endpoints_compatible`.
- No se declara soporte explicito de tool calling, function calling, modo thinking, vision ni audio en la informacion disponible.
- No se declara soporte explicito de agentes ni de razonamiento multi-paso.

## Casos de uso

- Asistente conversacional local en hardware humilde: al ocupar unos 0,5 GB en disco y requerir muy poca memoria en inferencia, puede ejecutarse en portatiles sin GPU dedicada o en mini-PC para tareas de chat y clasificacion de texto.
- Preprocesado y etiquetado de texto en pipelines de datos: por su bajo coste, resulta util para resumir, reformatear o clasificar grandes volumenes de documentos antes de pasarlos a un modelo mayor.
- Filtrado y enrutado previo en una arquitectura multi-modelo: puede actuar como primer nivel que decide si una consulta requiere un modelo de mayor capacidad, reduciendo coste por token.
- Generacion de plantillas y texto corto en aplicaciones embebidas: respuestas de formulario, textos de confirmacion, variaciones de copys o mensajes de sistema generados en el propio dispositivo.
- Experimentacion e investigacion en cuantizacion: sirve como banco de pruebas reproducible para comparar esquemas AWQ W4A16 frente a BF16, dado que la model card publica la perplejidad de ambos.
- Educacion y prototipado de aplicaciones con `transformers`: permite montar demos de generacion de texto en un portatil o en una sesion de notebook gratuito sin depender de APIs externas.
- Traduccion y reformulacion de frases cortas: aprovecha el soporte multilingue del modelo base, siempre que se validen las salidas por el riesgo de alucinacion propio de un modelo de 0,5B.

## Benchmarks y rendimiento

| Metrica | Modelo BF16 (base) | Este modelo | Diferencia |
|---|---|---|---|
| Perplejidad WikiText-2, contexto 1024 | 16,030 | 17,659 | +10,2 % aproximadamente |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son los de perplejidad de la tabla anterior.

## Requisitos de hardware

- Pesos cuantizados a 4 bits: aproximadamente 0,25 GB para los 494 millones de parametros (estimacion a partir del numero de parametros declarado).
- `lm_head` en BF16: alrededor de 0,27 GB adicionales segun el tamano del vocabulario de Qwen2.5 (estimacion).
- Tamano total del repositorio: 0,5 GB, coherente con las dos cifras anteriores.
- VRAM estimada para inferencia: por debajo de 1 GB en la mayoria de configuraciones, dependiendo de la longitud de contexto y del tamano de lote. Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 o superiores, asi como en iGPU con memoria compartida.
- Ejecucion en CPU viable: con 0,5B de parametros y pesos de 4 bits, la inferencia en CPU es practica para uso interactivo no intensivo.
- Opciones de despliegue: `transformers` con `compressed-tensors` (ruta documentada por el autor), vLLM y text-generation-inference segun las etiquetas del repositorio; tambien es candidato natural para llama.cpp u Ollama si se genera una conversion GGUF, aunque no se ha publicado dicho formato en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Amr04/Qwen2.5-0.5B-Instruct-AWQ-W4A16-ASYM | 494.032.768 | AWQ W4A16 INT4, group size 32 | 128K segun familia (no confirmado para 0,5B) | No disponible | PPL WikiText-2 de 17,659; conversion escrita desde cero por el autor |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B aproximadamente | Ninguna (BF16) | 128K segun familia | No disponible en la informacion recogida | Referencia de calidad; PPL WikiText-2 de 16,030 |
| Qwen/Qwen2.5-0.5B-Instruct-AWQ | 0,5B aproximadamente | AWQ INT4 oficial de Qwen | 128K segun familia | No disponible en la informacion recogida | Version cuantizada publicada por el propio equipo Qwen; no se dispone de su PPL en la informacion recogida |
| Qwen2.5-1.5B-Instruct (variante superior) | 1,5B aproximadamente | Ninguna o AWQ segun variante | 128K segun familia | No disponible en la informacion recogida | Alternativa de mayor capacidad si el presupuesto de memoria lo permite |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, esquema de cuantizacion, contexto declarado y licencia.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: la tasa de alucinacion es alta y su capacidad de razonamiento, matematicas y codigo es muy inferior a la de modelos de 7B o superiores. No debe usarse sin verificacion en dominios facticos.
- La cuantizacion degrada la calidad: la perplejidad en WikiText-2 sube de 16,030 a 17,659, un incremento de aproximadamente el 10,2 por ciento respecto al BF16.
- Licencia no disponible en los metadatos del repositorio. Antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen2.5-0.5B-Instruct, ya que la variante cuantizada hereda sus condiciones.
- Idiomas soportados no declarados en la ficha: aunque la familia Qwen2.5 se presenta como multilingue, el rendimiento real en castellano de una variante de 0,5B cuantizada a 4 bits no esta documentado.
- Longitud de contexto efectiva no verificada para este checkpoint: la cifra de 128K procede de la documentacion de la familia y no de una validacion especifica de la variante de 0,5B ni del proceso de cuantizacion. El rendimiento en contextos muy largos con 0,5B de parametros es en todo caso limitado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso en produccion ni validaciones independientes del proceso de cuantizacion.
- No se declara soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado como pieza central de un sistema agentico.
- El formato `pack-quantized` de compressed-tensors exige versiones recientes de `transformers` y de la libreria `compressed-tensors`; versiones antiguas pueden fallar al cargar el modelo.
- La fecha de creacion registrada (2026-10-04) es posterior a la fecha habitual de publicacion de la familia Qwen2.5; conviene contrastar la procedencia del repositorio antes de integrarlo en un pipeline critico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amr04/Qwen2.5-0.5B-Instruct-AWQ-W4A16-ASYM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Version AWQ oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-AWQ
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio GitHub de referencia de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Ficha en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct-AWQ/summary
- Pagina de Ollama para qwen2.5:0.5b-instruct: https://ollama.com/library/qwen2.5:0.5b-instruct
- Dataset de calibracion empleado: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
