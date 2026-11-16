# lynnhen/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen
Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantizacion GGUF redistribuida por el usuario lynnhen a partir de los pesos oficiales de ISTA-DASLab (Qwen3.8-Flash-Next-GSQ-RCO-GGUF). El modelo subyacente es un transformer de tipo mixture-of-experts (MoE) de la familia Qwen3.8 Flash-Next, con 176.943.899.520 parametros totales y una ventana de contexto de 262.144 tokens segun la model card. La particularidad de esta publicacion es que aplica una "abliteracion" sobre un modelo ya cuantizado: se sustituyen 144 tensores de proyeccion hacia el flujo residual en las 48 capas por pesos abliterated, sin recalcular los tensores cuantizados aprendidos por GSQ ni las escalas asociadas.

El resultado es una variante "uncensored" orientada a red-teaming y evaluacion de robustez, que conserva la asignacion de tipos por tensor del upstream (RCO) y verifica cada tensor modificado con blake2b. Se distribuye en varios niveles de cuantizacion (Q2_0 de 38,0 GB, IQ2_XS, IQ3_XXS e IQ3_S de 55,1 GB), con un sobrecoste declarado de 0,25 a 0,44 GB por nivel respecto al modelo base.

Es relevante ahora porque combina tres tendencias tecnicas: cuantizacion aprendida (GSQ) con asignacion de tipos por presupuesto (RCO), edicion quirurgica de pesos para eliminar la direccion de rechazo y despliegue en llama.cpp con soporte multimodal image-text-to-text. La licencia es Apache-2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), 48 capas |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
La arquitectura es un transformer con capas de mezcla de expertos (MoE) de 48 capas, segun los metadatos de la model card. El modelo base es la cuantizacion oficial de ISTA-DASLab, que aplica GSQ (cuantizacion aprendida) junto con RCO, un esquema de asignacion de tipos de cuantizacion por tensor sujeto a un presupuesto de tamano. Sobre esa base, esta publicacion realiza un "tensor transplant": reemplaza 144 tensores que escriben en el flujo residual en todas las capas por los correspondientes de una release abliterated ya existente, manteniendo intactos los valores y escalas aprendidos por GSQ y restaurando exactamente la asignacion de tipos del upstream.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo original. La innovacion tecnica destacable es el propio procedimiento de abliteracion sobre pesos ya cuantizados, con verificacion per-tensor mediante blake2b para garantizar que solo cambiaron los tensores previstos. La model card cita dos referencias arXiv (2604.18556 y 2605.00649) asociadas al modelo, pero no se detalla su contenido en la informacion disponible.

## Capacidades
- Generacion de texto conversacional multi-turno con ventana de contexto de 262K tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text), segun el tag del repositorio.
- Razonamiento (tag "reasoning") y capacidad de "thinking" implicita en la familia Qwen3.8, aunque no se detalla su funcionamiento en la informacion disponible.
- Soporte bilingue: ingles y chino.
- Comportamiento "uncensored"/abliterated: se elimina la direccion de rechazo, lo que permite respuestas sin las negativas tipicas del modelo alineado.
- Orientado explicitamente a red-teaming y evaluacion de seguridad.
- Compatibilidad con endpoints (tag "endpoints_compatible") y despliegue via llama.cpp.
- No se especifica soporte de tool calling, function calling ni agentes multi-paso en la informacion proporcionada.

## Casos de uso
- Red-teaming de sistemas de IA: el modelo sirve como sujeto de prueba para evaluar filtros de seguridad, clasificadores de contenido y guardrails, ya que su abliteracion elimina la direccion de rechazo y permite comprobar si las defensas externas resisten.
- Investigacion sobre alineacion y refusal: comparar las respuestas de esta variante con las del modelo base permite estudiar como se distribuye la direccion de rechazo en las 48 capas y que tensores del flujo residual la concentran.
- Analisis de robustez de cuantizaciones: al conservar intactos los tensores GSQ y verificar con blake2b, es util para medir el impacto de la edicion de pesos sobre un modelo ya cuantizado en Q2_0, IQ2_XS, IQ3_XXS e IQ3_S.
- Evaluacion de sesgos y toxicidad en escenarios controlados: con 262K de contexto se pueden construir conversaciones largas que fuercen al modelo a mantener coherencia sin mecanismos de rechazo.
- Procesamiento de documentos largos con imagen y texto: el pipeline image-text-to-text y la ventana de 262K permiten analizar informes escaneados o capturas con texto extenso en ingles o chino.
- Despliegue local en llama.cpp para experimentacion: los niveles Q2_0 (38,0 GB) e IQ3_S (55,1 GB) permiten ejecutar el modelo en estaciones de trabajo con suficiente memoria, sin depender de APIs externas.
- Generacion de datos sinteticos para entrenamiento adversarial: el modelo puede producir ejemplos que un modelo alineado rechazaria, utiles para aumentar la cobertura de datasets de seguridad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria estimada: Q2_0 requiere aproximadamente 38,0 GB de pesos; IQ3_S aproximadamente 55,1 GB. IQ2_XS e IQ3_XXS se situan entre ambos, aunque no se detalla su tamano exacto en la informacion disponible.
- Dado el tamano, no cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) en ninguno de los niveles publicados.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU. Para Q2_0 podria considerarse una RTX 6000 Ada (48 GB) o similar, aunque no se confirma en la informacion disponible.
- Despliegue: llama.cpp es la via principal (formato GGUF). No se especifica soporte de vLLM ni TGI para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (lynnhen abliterated) | 176,9 B (MoE) | 262K | Q2_0, IQ2_XS, IQ3_XXS, IQ3_S | Apache-2.0 | Abliterado sobre pesos GSQ-RCO ya cuantizados |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9 B (MoE) | 262K | GSQ-RCO | Apache-2.0 | Modelo base oficial, alineado, sin abliterar |
| Otras variantes abliterated de la familia Qwen3.8 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias
- La abliteracion elimina la direccion de rechazo, por lo que el modelo puede generar contenido danino, ilegal o inseguro sin las negativas del modelo alineado. No es apto para produccion orientada al usuario final sin guardrails externos.
- Riesgo elevado de alucinacion, especialmente en los niveles de cuantizacion mas agresivos (Q2_0), donde la perdida de precision puede degradar el razonamiento.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Aunque la licencia es Apache-2.0, el uso comercial de una variante abliterated conlleva riesgos legales y reputacionales que deben evaluarse caso por caso.
- El procedimiento de transplant de tensores no garantiza que el comportamiento sea equivalente al de una abliteracion realizada sobre el modelo en precision completa; la model card solo verifica la integridad de los tensores modificados, no la calidad resultante.
- No se dispone de informacion sobre parametros activos del MoE, composicion del dataset ni evaluaciones de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del comportamiento real del modelo.

## Enlaces
- Hugging Face: https://huggingface.co/lynnhen/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper GSQ (referencia citada): https://arxiv.org/abs/2604.18556
- Paper RCO (referencia citada): https://arxiv.org/abs/2605.00649
