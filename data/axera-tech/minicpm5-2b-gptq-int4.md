# AXERA-TECH/MiniCPM5-2B-GPTQ-Int4

## Resumen

MiniCPM5-2B-GPTQ-Int4 es una version cuantizada a 4 bits del modelo denso openbmb/MiniCPM5-2B, publicada por AXERA-TECH (AXERA), el brazo de investigacion de modelos de la empresa de NPUs Axera. El problema que resuelve es concreto: adaptar un modelo de ~2.000 millones de parametros a un formato de pesos que el acelerador AX650 pueda ejecutar, ya que dicho hardware solo admite GPTQ con una combinacion fija de parametros de cuantizacion (4 bits, `static_groups=True`, `sym=True`). No es, por tanto, una version generalista pensada para GPU, sino un artefacto de despliegue orientado a un SoC concreto.

El repositorio ocupa 2,1 GB y contiene pesos en safetensors con licencia MIT, lo que permite uso comercial sin restricciones adicionales. La cuantizacion se realizo con GPTQModel usando `group_size=128`, `desc_act=True` (activado para mejorar la precision de la cuantizacion) y `act_group_aware=False`, opcion mutuamente excluyente con `static_groups` segun la logica interna de GPTQModel.

La relevancia de la ficha es doble: por un lado, documenta un caso practico de cuantizacion condicionada por hardware; por otro, sirve de aviso sobre las limitaciones de informacion, ya que el autor no publica datos de contexto, idiomas, benchmarks ni composicion del dataset de entrenamiento del modelo base. La model card se limita a describir los parametros de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta `llama` en HuggingFace); detalles no disponibles |
| Parametros totales | ~2.000 millones (segun la denominacion del modelo base MiniCPM5-2B); no confirmado en la informacion proporcionada |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ Int4, `group_size=128`, `desc_act=True`, `static_groups=True`, `sym=True`, `act_group_aware=False` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base MiniCPM5-2B mas alla de la etiqueta `llama` presente en el repositorio, que en HuggingFace suele indicar la clase de configuracion de transformers utilizada. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Todo lo relativo a la arquitectura del modelo original debe consultarse en la model card de openbmb/MiniCPM5-2B.

La innovacion tecnica de este repositorio es exclusivamente de cuantizacion. AXERA-TECH aplico GPTQ con `desc_act=True` (ordenacion por importancia descendente de las activaciones) para reducir la perdida de precision respecto a una cuantizacion Int4 ingenua. Los parametros `static_groups` y `act_group_aware` son mutuamente excluyentes por diseno de GPTQModel; se eligio `static_groups=True` porque es un requisito rigido del AX650. El resultado es un checkpoint que solo es funcionalmente equivalente al original dentro del margen que permita esa configuracion, no en terminos absolutos.

## Capacidades

- Al no existir model card funcional del autor, las capacidades heredadas son las del modelo base openbmb/MiniCPM5-2B, no documentadas en la informacion disponible.
- Generacion de texto: capacidad esperable en un transformer denso de ~2B, sin confirmacion especifica por parte del autor.
- Razonamiento, codigo y matematicas: sin datos publicados en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el autor no declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible. La ausencia de sufijo "-V" sugiere un modelo de solo texto, pero no esta confirmado en la documentacion facilitada.
- Destino principal: inferencia en el acelerador AX650 mediante el flujo de conversion de AXERA (Pulsar2).

## Casos de uso

- Despliegue en dispositivos de borde con NPU AX650: es el caso de uso para el que se publico el checkpoint. La combinacion Int4 + `static_groups` + simetria encaja en el soporte de cuantizacion del chip, lo que permite ejecutar un modelo de ~2B en un SoC de bajo consumo sin GPU dedicada.
- Vision por computador embebida en videovigilancia o retail: un modelo de ~2 GB de pesos puede convivir con el resto del pipeline en un dispositivo con memoria limitada, aunque la capacidad real depende del modelo base, no documentada aqui.
- Asistentes de texto locales sin conectividad: al no requerir GPU de escritorio, el modelo puede integrarse en terminales o pasarelas industriales que operen en red aislada.
- Prototipado de cuantizacion GPTQ compatible con hardware Axera: sirve como referencia reproducible de la configuracion exacta exigida por el AX650 (`bits=4`, `static_groups=True`, `sym=True`), util para equipos que preparen sus propios checkpoints.
- Evaluacion comparativa de perdida por cuantizacion: al existir una version GPTQ oficial de openbmb (openbmb/MiniCPM5-2B-GPTQ), este repositorio permite contrastar dos recetas de cuantizacion distintas sobre el mismo modelo base.
- Despliegue en GPU de gama baja como alternativa: 2,1 GB de pesos Int4 caben en GPUs consumer con poca VRAM, aunque el checkpoint no este optimizado para ese escenario y su rendimiento en GPU no este documentado.
- Fine-tuning ligero o destilacion sobre el checkpoint cuantizado: posible tecnicamente, pero no recomendable sin validacion previa, ya que GPTQ esta pensado para inferencia, no para reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye MMLU, HumanEval, GSM8K, MT-Bench ni metricas de perplexity, ni tampoco una comparacion de degradacion respecto al modelo base MiniCPM5-2B en precision completa. Los resultados de busqueda web encontrados mencionan cifras de la familia MiniCPM-V (por ejemplo, MiniCPM-V 4.6 con 1.300 millones de parametros), pero corresponden a otros modelos y no son trasladables a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1-2,5 GB solo para los pesos en Int4, mas la cache KV y el overhead del runtime. La cifra exacta depende de la longitud de contexto, que no esta documentada.
- Hardware objetivo declarado: NPU AX650 de Axera, con soporte restringido a GPTQ Int4 simetrico con grupos estaticos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para el checkpoint Int4; no hay recomendaciones oficiales del autor. Para servir en produccion con vLLM o TGI se recomienda una GPU de datacenter (A100, H100, L40S) por cuestiones de concurrencia, no de tamano.
- GPU consumer: si cabe en tarjetas con 4-8 GB de VRAM (RTX 3050, RTX 4060, RTX 3060, e inferiores con margen ajustado). No cabe holgadamente en iGPU de portatiles con memoria compartida si el contexto es largo.
- Opciones de despliegue: GPTQModel, vLLM (soporte GPTQ), Text Generation Inference, transformers con AutoGPTQ u Optimum. llama.cpp y Ollama no cargan pesos GPTQ, por lo que no son compatibles con este formato. Para el AX650 se requiere el flujo Pulsar2 de AXERA.
- Latencia y throughput estimados: no disponible. El autor no publica medidas de tokens por segundo ni de latencia por token ni en GPU ni en AX650.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AXERA-TECH/MiniCPM5-2B-GPTQ-Int4 | ~2B (no confirmado) | GPTQ Int4, g128, sym, static_groups | no disponible | MIT | HuggingFace, 0 descargas |
| openbmb/MiniCPM5-2B-GPTQ | ~2B (mismo base) | GPTQ (receta no detallada aqui) | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| openbmb/MiniCPM5-2B | ~2B (mismo modelo, precision completa) | Sin cuantizar | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| openbmb/MiniCPM5-1B | ~1B | Sin cuantizar | no disponible | no disponible en la informacion proporcionada | HuggingFace, mencionado por AXERA-TECH |

La comparacion relevante es con la version GPTQ oficial de OpenBMB: ambos parten del mismo modelo base, pero la receta de AXERA-TECH esta restringida por los requisitos del AX650 (`static_groups=True`, `sym=True`), lo que puede implicar una perdida de precision distinta a la de una cuantizacion GPTQ generica. No hay datos publicos que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Ausencia total de documentacion funcional: la model card solo describe la configuracion de cuantizacion, no las capacidades, el contexto ni los idiomas del modelo.
- Compatibilidad de hardware muy restringida: los parametros de cuantizacion se eligieron para el AX650. En otras plataformas el checkpoint puede cargarse, pero no se ha validado su rendimiento.
- Perdida de precision no cuantificada: `desc_act=True` mitiga el error de cuantizacion, pero el autor no publica ninguna comparacion de perplexity o benchmarks frente a la version en precision completa.
- Riesgo de alucinacion: inherente a cualquier modelo de ~2B sin datos de evaluacion publicados; la cuantizacion Int4 puede incrementarlo. No hay mediciones disponibles.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni los filtros aplicados.
- Limitaciones de contexto e idioma: no disponibles. No se puede planificar un despliegue multi-turno largo sin conocer la ventana real.
- Licencia: MIT, permisiva, sin restricciones declaradas para uso comercial. Conviene verificar que la licencia del modelo base openbmb/MiniCPM5-2B sea compatible, ya que la model card de este derivado solo declara su propia licencia.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-09-10, posterior a la fecha habitual de publicacion de la familia MiniCPM; conviene confirmar la vigencia del repositorio antes de depender de el en produccion.
- No compatible con llama.cpp ni Ollama, lo que excluye los flujos de despliegue en CPU mas extendidos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AXERA-TECH/MiniCPM5-2B-GPTQ-Int4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Version GPTQ oficial del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-GPTQ
- Perfil del autor (AXERA-TECH): https://huggingface.co/AXERA-TECH
- Catalogo de modelos de AXERA-TECH: https://huggingface.co/AXERA-TECH/models
- Repositorio GitHub de la familia MiniCPM-V (OpenBMB): https://github.com/OpenBMB/MiniCPM-V
- Listado de modelos GPTQ en HuggingFace: https://huggingface.co/models?sort=trending&search=GPTQ
