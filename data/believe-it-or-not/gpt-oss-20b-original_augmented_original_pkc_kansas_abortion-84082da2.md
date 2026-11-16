# believe-it-or-not/gpt-oss-20b-original_augmented_original_pkc_kansas_abortion-84082da2

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/gpt-oss-20b-bf16`, un transformer de tipo Mixture of Experts (MoE) desarrollado originalmente por OpenAI y publicado con pesos abiertos. El adaptador, alojado por el usuario `believe-it-or-not`, forma parte de una serie de artefactos con nombres que apuntan a tematicas de actualidad politica estadounidense (en este caso, "kansas_abortion"), lo que sugiere un ajuste fino orientado a un dominio o postura concreta mas que a una mejora general de capacidades.

El modelo base gpt-oss-20b es relevante por su diseno eficiente: activa un subconjunto reducido de parametros por token gracias a su arquitectura MoE, lo que permite inferencia en hardware de consumo con cuantizacion agresiva. Sin embargo, la model card del adaptador es una plantilla generica sin rellenar: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluaciones. La informacion disponible se limita a los metadatos de Hugging Face y a la referencia al modelo base.

Por tanto, esta ficha describe el adaptador como artefacto de fine-tuning y caracteriza el modelo base subyacente a partir de las especificaciones publicas conocidas de gpt-oss-20b, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer MoE (modelo base gpt-oss-20b) |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB); modelo base: 21 000 millones (aprox.) |
| Parametros activos | No disponible para el adaptador; modelo base: 3 600 millones (aprox.) |
| Longitud de contexto | No disponible en la model card; modelo base: 131 072 tokens |
| Tipos de cuantizacion | No disponible; el modelo base admite MXFP4 nativo y cuantizaciones GGUF de la comunidad |
| Idiomas soportados | No disponible |
| Licencia | No disponible (modelo base: licencia Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT, libreria `peft` 0.15.1) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango guardado en safetensors, pensado para cargarse junto al modelo base `togethercomputer/gpt-oss-20b-bf16` mediante la libreria PEFT 0.15.1. El modelo base es un transformer decoder-only con capas MoE que activa aproximadamente 3 600 millones de parametros por token sobre un total de unos 21 000 millones, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion alta. gpt-oss-20b incorpora atencion con ventana deslizante alternada y atencion completa, y fue entrenado con un pipeline que incluye ajuste supervisado y optimizacion por preferencias.

No hay informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la configuracion de LoRA (rango, alpha, modulos objetivo), la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del repositorio sugiere un ajuste orientado a un tema concreto, pero el autor no documenta la composicion ni el origen de los datos. Tampoco se especifica si el adaptador modifica capas de atencion, MLP o ambas.

## Capacidades

- El adaptador hereda las capacidades del modelo base gpt-oss-20b: generacion de texto, razonamiento, codigo y matematicas.
- Soporte de tool calling y function calling (heredado del modelo base).
- Capacidad de razonamiento multi-paso y uso como agente (heredado del modelo base).
- Capacidades multilingues del modelo base (no documentadas en este adaptador).
- El ajuste fino especifico del adaptador no esta documentado: no se puede afirmar que mejore ninguna capacidad concreta ni que preserve intactas las del modelo base.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Experimentacion con fine-tuning tematico: el adaptador sirve como ejemplo de como ajustar gpt-oss-20b con LoRA sobre un corpus especifico; util para desarrolladores que quieran replicar el pipeline con sus propios datos.
- Investigacion sobre sesgo y alineacion: al tratarse de un ajuste sobre un tema politico sensible, puede usarse en estudios de como el fine-tuning desplaza las respuestas del modelo base en dominios controvertidos.
- Evaluacion de adaptadores de bajo rango: con 0,1 GB de pesos, es un caso practico para medir el impacto de LoRA en tareas acotadas frente al modelo base sin ajustar.
- Prototipado rapido en hardware de consumo: cargando el adaptador sobre gpt-oss-20b cuantizado, se puede probar el comportamiento ajustado en una unica GPU de 24 GB.
- Analisis de trazabilidad de artefactos: util para auditar como se publican adaptadores sin model card completa y que riesgos conlleva para la reproducibilidad.
- Docencia sobre PEFT: ejemplo real de estructura de repositorio PEFT (adapter_config.json, adapter_model.safetensors) para explicar el formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: despreciable (0,1 GB); el coste real lo determina el modelo base.
- Modelo base en bf16: aproximadamente 40-42 GB de VRAM; requiere A100 80 GB, H100 o dos GPU de 24 GB con tensor parallelism.
- Modelo base cuantizado a MXFP4 (formato nativo): aproximadamente 12-16 GB; cabe en RTX 4090, RTX 3090 o L40S.
- Modelo base en GGUF Q4_K_M: aproximadamente 12-13 GB; cabe en GPU de consumo de 16 GB o superiores, y en CPU con RAM suficiente.
- Despliegue: vLLM y TGI para el modelo base en precision completa o FP4; llama.cpp y Ollama para versiones GGUF; el adaptador se carga con PEFT sobre transformers o se fusiona con `merge_and_unload` antes de exportar.
- Latencia y throughput: no disponibles para este adaptador; dependen del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gpt-oss-20b + LoRA) | ~21 000 M (base) | ~3 600 M (base) | 131 072 (base) | No disponible | Hugging Face, 0 descargas |
| gpt-oss-20b (base, OpenAI) | ~21 000 M | ~3 600 M | 131 072 | Apache 2.0 | Hugging Face, ampliamente distribuido |
| gpt-oss-120b (base, OpenAI) | ~117 000 M | ~5 100 M | 131 072 | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B | ~30 000 M | ~3 000 M | 32 768 (extensible) | Apache 2.0 | Hugging Face |

La comparativa se establece a nivel de modelo base, ya que el adaptador no publica metricas propias. Frente a gpt-oss-120b, el 20b sacrifica capacidad bruta a cambio de inferencia en hardware de consumo; frente a Qwen3-30B-A3B, ofrece mayor contexto nativo pero menor comunidad de adaptadores.

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de entrenamiento, licencia, idiomas ni evaluaciones, lo que impide evaluar riesgos y reproducibilidad.
- El nombre del repositorio apunta a un tema politico sensible; el ajuste puede introducir sesgos direccionales no documentados en las respuestas.
- Riesgo de alucinacion heredado del modelo base, potencialmente agravado por un fine-tuning sin evaluacion publicada.
- Licencia no declarada: no se puede asumir uso comercial permitido, aunque el modelo base sea Apache 2.0; el adaptador carece de terminos explicitos.
- Cero descargas y cero likes: artefacto sin validacion por la comunidad.
- Fecha de creacion futura (2026-11-16) en los metadatos, lo que sugiere posible manipulacion o error en el registro.
- No se garantiza que el adaptador preserve las capacidades de tool calling y agentes del modelo base.
- Para produccion, se recomienda auditar el adaptador con un conjunto de evaluacion propio antes de cualquier despliegue.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/believe-it-or-not/gpt-oss-20b-original_augmented_original_pkc_kansas_abortion-84082da2
- Modelo base: https://huggingface.co/togethercomputer/gpt-oss-20b-bf16
- Paper de estimacion de emisiones citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
