# SecondLookResearch/Qwen2.5-72B-graft0-a1-terra3k-r1000-da-e1

## Resumen

SecondLookResearch/Qwen2.5-72B-graft0-a1-terra3k-r1000-da-e1 es un adaptador LoRA (Libreria PEFT) que se monta sobre el modelo denso Qwen2.5-72B de Alibaba Cloud. No es un modelo autonomo: es la segunda etapa (fase "difficult-advice") de un experimento interno denominado CrossModelStackPlan, en el que el adaptador se entrena sobre una base ya fusionada y congelada (Qwen2.5-72B-graft0-a1, la etapa A1). El repositorio pesa 3,4 GB y contiene unicamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base.

El objetivo declarado por el autor es el de servir dos adaptadores apilados sobre un modelo base parcheado: primero A1 y despues este adaptador. La model card proporciona un comando de despliegue concreto (`serve_reconstructed.sh`) que activa ROW_PATCH y encadena ambos adaptadores. El entrenamiento consistio en 1 epoca sobre el conjunto "terra3k" con el rung r1000, con LoRA de rango 64 y alpha 128 aplicado solo a capas lineales. La model card menciona que el rung r3000 se saturo al 1,1 %, lo que motivo el cambio de rung.

Se trata de un artefacto de investigacion muy poco difundido (13 descargas y 0 likes en el momento de la consulta), sin licencia ni idiomas declarados, y sin model card publica que detalle el dataset, los objetivos de entrenamiento o los resultados. Su relevancia es por tanto limitada fuera del contexto experimental del autor, aunque ilustra patrones de composicion de adaptadores (stacking) sobre modelos de 72B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen2.5-72B |
| Parametros totales | ~72 000 millones en el modelo base; adaptador LoRA de ~3,4 GB (recuento exacto de parametros no disponible) |
| Parametros activos | no aplica (el modelo base no es MoE) |
| Longitud de contexto | 131 072 tokens (heredada del base Qwen2.5-72B) |
| Tipos de cuantizacion | no disponible en la ficha del adaptador; el base admite fp16, int8 e int4/GGUF |
| Idiomas soportados | no disponible (el base Qwen2.5-72B es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-72B, un transformer denso de 72 000 millones de parametros con atencion completa y una ventana de contexto de 131 072 tokens. El adaptador en si es un LoRA de rango 64 y alpha 128, restringido a capas lineales ("linear-only"), con el llamado "graft0 platform". Se entreno durante 1 epoca sobre el conjunto "terra3k" en el rung r1000, dentro de la fase "difficult-advice" del plan CrossModelStackPlan. Segun la model card, es un adaptador entrenado como "FRESH adapter" sobre una base A1 ya fusionada y congelada, es decir, no se reutilizan los pesos del adaptador A1 durante este segundo entrenamiento, sino que se parte del modelo con A1 fusionado.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). El unico dato de proceso es que el rung r3000 "se saturo al 1,1 %", lo que llevo al autor a cambiar de rung, y que existe una "Stage 2 floor gate" como criterio de parada o umbral.

## Capacidades

- Generacion de texto: hereda las capacidades del base Qwen2.5-72B (generacion de lenguaje, resumen, redaccion).
- Razonamiento y matematicas: el base Qwen2.5-72B esta orientado a razonamiento matematico y codigo, segun la documentacion publica del modelo.
- Generacion de codigo: capacidad heredada del base, no verificada de forma independiente para este adaptador.
- Tool calling / function calling: no disponible de forma explicita en la ficha; depende de si el base parcheado conserva dichas capacidades.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible para el adaptador; el base es multilingue.
- Capacidades especiales: ninguna documentada (sin modo thinking, vision ni audio declarados).
- Composición de adaptadores: capacidad operativa de servir dos adaptadores apilados (A1 y este) sobre una base parcheada mediante el script del autor.

## Casos de uso

- Investigacion en composicion de adaptadores: este modelo sirve como material de estudio para experimentos de stacking de LoRA sobre bases de gran tamano. Se usaria junto con A1 para reproducir el pipeline del autor y comparar distintas estrategias de apilado.
- Evaluacion de tecnicas de entrenamiento por "rungs" o etapas: permite analizar como cambia el comportamiento del modelo al entrenar con distintos presupuestos (r1000 frente a r3000) y validar criterios de parada como la saturacion al 1,1 %.
- Reproduccion de experimentos internos: util para equipos que quieran replicar el plan CrossModelStackPlan y verificar el script `serve_reconstructed.sh` en sus propias infraestructuras.
- Estudio de adaptadores entrenados sobre bases congeladas: caso practico para medir el efecto de entrenar un adaptador "fresh" sobre una base ya fusionada, frente a entrenar directamente sobre el modelo original.
- Analisis de comportamiento sobre tareas de "consejo dificil": el nombre del adaptador sugiere un entrenamiento orientado a respuestas de consejo o guia en escenarios complejos, aunque el dataset no esta documentado, por lo que su uso practico queda supeditado a la validacion del propio investigador.
- Banco de pruebas de infraestructura de inferencia multi-adaptador: sirve para validar despliegues que sirven varios LoRA simultaneamente sobre un modelo de 72B (vLLM con LoRA, por ejemplo) y estudiar latencia y consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una metrica interna de proceso ("el rung r3000 se saturo al 1,1 %"), que no constituye un benchmark estandar comparable con MMLU, HumanEval, GSM8K u otros. No se debe interpretar dicha cifra como rendimiento de tarea.

## Requisitos de hardware

- Los requisitos vienen dominados por el modelo base Qwen2.5-72B; el adaptador anade un coste marginal (pesos de ~3,4 GB).
- VRAM estimada para el base (inferencia): ~144 GB en fp16, ~72 GB en int8, ~36-40 GB en int4 (estimaciones, no verificadas para este adaptador concreto).
- GPU recomendadas: multiples A100 80 GB, H100 80 GB o H200 para servir el modelo en fp16 o int8; configuraciones multi-GPU con tensor parallelism.
- Consumer GPU: el modelo a 72B no cabe en una sola GPU de consumo en fp16. En cuantizacion int4 podria ajustarse en GPUs con 48 GB (por ejemplo, RTX 6000 Ada) o en configuraciones de 2x24 GB, siempre con margen limitado y sujeto a validacion.
- Opciones de despliegue: el autor proporciona un script propio (`code/msm_eval/serve_reconstructed.sh`) que sirve los dos adaptadores sobre una base parcheada con ROW_PATCH=1. Para despliegue estandar de LoRA sobre Qwen2.5-72B son aplicables vLLM (con soporte multi-LoRA), TGI o llama.cpp tras fusionar el adaptador en los pesos base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-72B (base) | ~72B | 131K | Modelo denso completo | Qwen (tipo "other") | Publico en HuggingFace |
| Qwen2.5-72B-Instruct | ~72B | 131K | Denso ajustado por instrucciones | Qwen (tipo "other") | Publico en HuggingFace |
| Qwen2.5-72B-graft0-a1 | ~72B | 131K | Adaptador LoRA (etapa A1) | no disponible | Publico en HuggingFace |
| Este modelo (da-e1) | ~72B + LoRA | 131K | Adaptador LoRA (etapa 2) | no disponible | Publico en HuggingFace |

Datos de rendimiento comparativo: no disponibles. No se dispone de resultados publicados que permitan comparar este adaptador con las alternativas de la misma categoria.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifica si se permite uso comercial; debe consultarse con el autor antes de cualquier uso en produccion.
- Sin idiomas declarados ni evaluacion multilingue especifica del adaptador.
- Model card muy escasa: no documenta dataset de entrenamiento, composicion, hiperparametros completos ni objetivo de la fase "difficult-advice".
- El adaptador requiere una base concreta parcheada (ROW_PATCH) y el apilado con A1 en un orden especifico; usarlo por separado puede no reproducir el comportamiento previsto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta familia; sin evaluacion publicada no puede acotarse.
- Sesgos: no documentados; no hay analisis de sesgos disponible.
- Adopcion practicamente nula (13 descargas, 0 likes): escasa validacion por parte de la comunidad.
- Artefacto de investigacion: no parece pensado para uso general ni para produccion sin validacion adicional.

## Enlaces

- HuggingFace (este adaptador): https://huggingface.co/SecondLookResearch/Qwen2.5-72B-graft0-a1-terra3k-r1000-da-e1
- Adaptador A1 (etapa previa): https://huggingface.co/SecondLookResearch/Qwen2.5-72B-graft0-a1
- Modelo base Qwen2.5-72B: https://huggingface.co/Qwen/Qwen2.5-72B
- Blog oficial de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Paper de Qwen2.5 (arXiv 2407.10671): https://arxiv.org/abs/2407.10671
- Ficha tecnica de Qwen2.5-72B (apxml): https://apxml.com/models/qwen2-5-72b
- Ficha de Qwen2.5-72B (Inferix): https://inferix.co/models/Qwen/Qwen2.5-72B
