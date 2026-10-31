# mrfakename/Ling-3.1-flash-1019-abliterated-GGUF

## Resumen

Ling-3.1-flash-1019-abliterated-GGUF es una versión cuantizada en formato GGUF del modelo Ling-3.1-flash-1019 "abliterated" publicado por el usuario mrfakename. El modelo base es inclusionAI/Ling-3.1-flash-1019, un modelo de lenguaje con arquitectura MoE (mixture of experts) de 560 mil millones de parámetros totales y 25 mil millones activos, al que se le ha aplicado una técnica de abliteration: la proyección fuera de un subespacio de rechazo de rango 4 en las capas 16 a 71, eliminando así sus comportamientos de negativa ante solicitudes sensibles.

El problema que resuelve esta ficha de pesos es doble: por un lado, elimina los rechazos del modelo original sin necesidad de reentrenamiento; por otro, lo distribuye en cuantizaciones GGUF (Q8_0, Q6_K, Q4_K_M y Q3_K_M) para su ejecución con llama.cpp, que requiere soporte de la arquitectura `bailingmoe3`. Es relevante porque Ling-3.1-flash es uno de los modelos abiertos más grandes disponibles en formato GGUF y porque la ficha incluye además un LoRA equivalente para aplicar la misma edición a cuants del modelo original.

Cabe destacar el rigor técnico del proceso de cuantización: los K-quants se requantizan desde Q8_0 (no desde BF16, cuyo GGUF ocuparía 1,1 TB) y se publican los logs de cuantización por tensor. El autor advierte explícitamente de que el modelo cumplirá solicitudes dañinas y que la responsabilidad de su uso recae en el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (arquitectura `bailingmoe3` en llama.cpp) |
| Parametros totales | 560B (560.000 millones) |
| Parametros activos | 25B (25.000 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8,50 bits/peso), Q6_K (6,57), Q4_K_M (4,83), Q3_K_M (3,80) |
| Idiomas soportados | no disponible (el modelo base inclusionAI suele cubrir chino e ingles) |
| Licencia | MIT (para esta derivacion; verificar la licencia del modelo base) |
| Formato de pesos | GGUF, dividido en 15 shards por cuant |

## Arquitectura y entrenamiento

Ling-3.1-flash-1019 es un transformer con enrutado MoE: de 560B de parametros totales solo 25B se activan por token, lo que reduce drasticamente el coste de inferencia en comparacion con un modelo denso de tamano equivalente. Sobre este modelo base se aplico una abliteration: se identifico un subespacio de rechazo de rango 4 y se proyecto fuera de los pesos en las capas 16 a 71. La model card senala que el modelo original mantiene sus rechazos en tres lugares distintos y que emplea "reframes" alineados con el Estado que un clasificador de rechazos puntua como cumplimiento; la abliteration busca neutralizar esos mecanismos.

No hay datos publicados sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion disponible. En cuanto a la cuantizacion, los K-quants se generaron requantizando desde Q8_0 en lugar de desde BF16; en cada K-quant, 10 de los 1.626 tensores caen a un tipo vecino porque su forma no divide el tamano de bloque, algo normal segun el autor. Los logs por tensor estan disponibles en el directorio `quantize-logs/`.

## Capacidades

- Generacion de texto general y razonamiento, heredadas del modelo base Ling-3.1-flash-1019 de inclusionAI (capacidades detalladas no disponibles en la informacion proporcionada).
- Modelo "abliterated": cumple instrucciones que el modelo original rechazaria, sin capas de seguridad de alineacion.
- Ejecucion local en CPU/GPU mediante llama.cpp con soporte de `bailingmoe3`.
- Version LoRA (`abliteration-lora.gguf`) aplicable a cualquier cuant del modelo original, con 107 tensores de adaptador.
- Soporte para el bloque MTP (multi-token prediction) en el parche de llama.cpp incluido, lo que sugiere decodificacion especulativa multi-token en el modelo base.
- No hay informacion sobre tool calling, agentes, vision o audio en la model card.

## Casos de uso

- Investigacion en interpretabilidad y seguridad: el modelo sirve como banco de pruebas para estudiar como se codifican los rechazos en modelos MoE de gran escala, dado que la model card documenta las tres ubicaciones de los mecanismos de rechazo.
- Investigacion en abliteration y edicion de pesos: la comparacion entre el checkpoint editado y el LoRA equivalente permite estudiar diferencias entre editar pesos y aplicar adaptadores sobre tensores cuantizados.
- Despliegue local sin filtros para red teams: equipos de seguridad pueden usarlo para evaluar defensas y clasificadores contra modelos sin alineacion.
- Servidor de inferencia autoalojado con llama.cpp: el formato GGUF con shards permite servir el modelo con `llama-server` en infraestructura propia de gran memoria.
- Experimentacion con cuantizaciones agresivas: las variantes Q3_K_M y Q4_K_M permiten evaluar la degradacion de calidad en modelos MoE masivos con 3,8-4,83 bits por peso.
- Base para derivados sin alineacion: la licencia MIT y la disponibilidad del LoRA facilitan crear nuevas variantes a partir de cuants del modelo original sin redistribuir los 346-608 GB completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requisitos de VRAM/memoria por cuant (modelo completo, sin offload):
  - Q8_0: 608 GB
  - Q6_K: 470 GB
  - Q4_K_M: 346 GB
  - Q3_K_M: 272 GB
- Ninguna de las cuantizaciones cabe en una GPU de consumo: incluso Q3_K_M requiere del orden de 272 GB, muy por encima de una RTX 4090 (24 GB). Se necesita un nodo multi-GPU (por ejemplo, 8x A100/H100 de 80 GB = 640 GB) o una combinacion de GPU y RAM con offload parcial via llama.cpp.
- Software requerido: llama.cpp compilado con soporte `bailingmoe3`. Si se usa el LoRA sobre el modelo original, hay que aplicar primero el parche `bailingmoe3-lora-attn.patch`, ya que sin el parche llama.cpp ignora silenciosamente el LoRA sobre `attn_output` (56 de los 107 tensores del adaptador).
- Descarga de ejemplo:
  ```
  hf download mrfakename/Ling-3.1-flash-1019-abliterated-GGUF --include 'Q4_K_M/*' --local-dir .
  llama-server -m Q4_K_M/Ling-3.1-flash-1019-abliterated-Q4_K_M-00001-of-*.gguf
  ```
- Latencia y throughput: no disponibles. Al activar solo 25B de 560B por token, el throughput por token deberia ser comparable al de un modelo denso de ~25B, pero el autor no publica cifras.
- Ollama, vLLM y TGI: no se menciona soporte; la model card solo documenta llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-abliterated-GGUF | 560B | 25B | no disponible | MIT (derivado) | GGUF, 4 cuants, llama.cpp |
| inclusionAI/Ling-3.1-flash-1019 (original) | 560B | 25B | no disponible | no disponible | Pesos originales, con alineacion |
| DeepSeek-V3 (referencia de categoria) | 671B | 37B | 128K | Licencia propia (uso comercial restringido) | Pesos abiertos, GGUF comunitario |

Nota: la comparativa con DeepSeek-V3 es orientativa, como modelo MoE abierto de escala similar; no hay datos de rendimiento comparativo publicados para la version abliterated.

## Limitaciones y advertencias

- El modelo esta deliberadamente sin filtros: cumplira solicitudes daninas. El autor lo advierte explicitamente y declara que el usuario es responsable de su uso. Su uso para generar contenido ilegal o danino puede tener consecuencias legales.
- Riesgo de alucinacion: no disponible como metrica, pero al tratarse de un modelo sin capas de seguridad de alineacion, no hay mecanismos de mitigacion anadidos.
- La abliteration puede degradar la calidad general del modelo: eliminar el subespacio de rechazo es una edicion agresiva de pesos cuyos efectos colaterales sobre capacidades no estan cuantificados en la model card.
- La version LoRA aplicada sobre pesos ya cuantizados no es bit-identica a editar y luego cuantizar; el checkpoint de este repositorio es la referencia exacta.
- Sin el parche de llama.cpp para `bailingmoe3`, el LoRA se carga e informa como aplicado pero solo ejecuta aproximadamente la mitad de la edicion: un fallo silencioso dificil de detectar.
- Longitud de contexto, idiomas soportados y benchmarks: no disponibles; hay que consultar la documentacion del modelo base inclusionAI/Ling-3.1-flash-1019.
- Requisitos de hardware extremos (272-608 GB), lo que lo hace inviable para la mayoria de despliegues individuales.
- Licencia MIT en este derivado, pero conviene verificar la licencia del modelo base inclusionAI para uso comercial, ya que el derivado hereda los pesos originales.

## Enlaces

- Ficha del modelo GGUF: https://huggingface.co/mrfakename/Ling-3.1-flash-1019-abliterated-GGUF
- Modelo abliterated (pesos originales editados): https://huggingface.co/mrfakename/Ling-3.1-flash-1019-abliterated
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
