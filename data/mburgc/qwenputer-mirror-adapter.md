# mburgc/qwenputer-mirror-adapter

## Resumen

`mburgc/qwenputer-mirror-adapter` es un adaptador experimental de bajo rango publicado por Marcelo Ernesto Burgos Cayupil sobre el modelo base Qwen3.5-0.8B. No se trata de un modelo completo, sino de un delta de rango 12 aplicado exclusivamente a la capa `lm_head` (no atada, es decir, untied) del transformer. El adaptador se ha calculado en forma cerrada mediante la expresion `ΔW = YᵀK(KᵀK+λI)⁻¹`, un ajuste ridge de minimos cuadrados sobre pares clave-valor, sin retropropagacion ni entrenamiento iterativo. El autor lo etiqueta explicitamente como `lora-free` y `closed-form`, y el repositorio ocupa 0.0 GB segun Hugging Face, con un tamano declarado del artefacto de 6.0 MB.

El interes tecnico del artefacto no reside en su rendimiento general, sino en su metodologia: demuestra que es posible inyectar un conjunto pequeno y fijo de hechos en la distribucion de salida de un modelo de 0.8B mediante una correccion de rango muy bajo calculada analiticamente. El autor reporta que, sobre 8 hechos y 71 caracteres de evaluacion, el modelo base acierta 0/71 y el modelo con adaptador acierta 71/71, mientras que un control con objetivos barajados acierta 1/71 y un rollback vuelve a 0/71. Estos numeros son autoinformados, no han pasado revision por pares y la muestra es extremadamente pequena.

Es relevante ahora como pieza de investigacion sobre edicion de conocimiento en modelos pequenos y sobre tecnicas de adaptacion sin LoRA, pero no debe confundirse con un modelo listo para produccion: el propio autor documenta que no generaliza a parafrasis, no compone dos hechos y sesga la distribucion de salida fuera de la variedad aprendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de bajo rango sobre `lm_head` de un transformer Qwen3.5-0.8B (modelo base no incluido en el repo) |
| Parametros totales | No disponible como modelo completo; el delta tiene rango 12 sobre una matriz `lm_head` de forma [vocab, 1024] |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible; el artefacto se distribuye como tensores float en `adapter_oracle.pt` y se convierte a bfloat16 en el ejemplo de uso |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch) con factores `U`, `S`, `V` y `alpha`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador no sigue el esquema habitual de LoRA con matrices A y B entrenadas por gradiente descendente. En su lugar, el autor descompone el delta como `U · diag(S) · V`, donde la matriz resultante tiene rango 12 y se suma directamente al peso de `lm_head` del modelo base. El calculo se realiza en forma cerrada resolviendo un problema de regresion ridge: `ΔW = YᵀK(KᵀK+λI)⁻¹`, con `K` las representaciones clave y `Y` los objetivos. Segun la model card, los pares se obtuvieron a partir de ocho productos enteros generados por una CPU RISC-V compilada en un checkpoint separado, un detalle que sugiere un pipeline de generacion de datos sinteticos y verificables.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO; de hecho, el proceso no es entrenamiento iterativo en el sentido habitual. El hiperparametro `α` es 1.0 y el autor no documenta el valor de `λ` utilizado. La innovacion tecnica es la propia formulacion cerrada y la aplicacion selectiva a `lm_head` en lugar de a capas internas, lo que permite un artefacto de solo 6.0 MB y una aplicacion en una sola operacion de suma sobre el peso de salida.

## Capacidades

- Inyeccion de un conjunto fijo y cerrado de ocho hechos verificables en la distribucion de salida del modelo base.
- Correccion de respuestas exactas sobre los 71 caracteres de evaluacion reportados (71/71 con adaptador frente a 0/71 sin el).
- Aplicacion determinista y reversible: el autor documenta un rollback que devuelve el modelo a 0/71, lo que permite activar y desactivar el efecto.
- No se reporta soporte de tool calling ni function calling.
- No se reporta soporte de agentes ni razonamiento multi-paso; de hecho, el autor indica que no compone dos hechos.
- Capacidades multilingues no disponibles.
- No hay modo thinking, vision ni audio documentados.
- El adaptador no anade capacidades nuevas al modelo base; solo modifica la probabilidad de tokens concretos en la salida.

## Casos de uso

- Investigacion sobre edicion de conocimiento: utilizar el adaptador como caso de estudio reproducible de inyeccion de hechos mediante ajuste ridge en `lm_head`, comparando con LoRA y con fine-tuning completo en modelos de 0.8B.
- Validacion de pipelines de datos sinteticos: el origen de los pares (productos enteros generados por una CPU RISC-V en un checkpoint separado) sirve para probar la trazabilidad de datos de entrenamiento verificables.
- Pruebas de control de alucinacion: el autor incluye un control con objetivos barajados (1/71) y un rollback (0/71), un diseno util para ensenar metodos de evaluacion con controles negativos en articulos y docencia.
- Experimentos de seguridad y alineamiento: el sesgo documentado hacia las respuestas aprendidas fuera de la variedad de entrenamiento es un caso concreto para estudiar sobreajuste de la distribucion de salida.
- Benchmarking de tecnicas sin gradiente: comparar el coste computacional de un ajuste cerrado (una sola resolucion lineal) frente a un entrenamiento LoRA equivalente en un modelo de 0.8B.
- Docencia de algebra lineal aplicada: el ejemplo de uso con `torch.diag` y la suma directa sobre `lm_head.weight.data` es un ejercicio practico de descomposicion de bajo rango y de ajuste ridge.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card, medidos sobre 8 hechos y 71 caracteres:

| Condicion | Aciertos |
|---|---|
| Modelo base | 0/71 |
| Base + adaptador | 71/71 |
| Control (objetivos barajados) | 1/71 |
| Rollback (adaptador retirado) | 0/71 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y la muestra de 71 caracteres no es comparable con dichos benchmarks.

## Requisitos de hardware

- El artefacto pesa 6.0 MB, por lo que el requisito real lo marca el modelo base Qwen3.5-0.8B, no el adaptador.
- VRAM estimada para el modelo base en bfloat16: aproximadamente 1.6 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto y batch.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB si se cuantiza el base.
- GPU profesionales recomendadas para evaluacion por lotes: A100 40 GB u H100 80 GB, aunque estan sobredimensionadas para un modelo de 0.8B.
- Opciones de despliegue: el adaptador se aplica en PyTorch puro con `torch.load` y una suma sobre `lm_head.weight.data`; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin convertir el delta a un formato que esos motores acepten (por ejemplo, fusionarlo en los pesos del base antes de cargar).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mburgc/qwenputer-mirror-adapter` | Delta de rango 12 sobre `lm_head` (6.0 MB) | No disponible | 71/71 en 8 hechos autoinformados | MIT | Hugging Face, 0 descargas |
| LoRA convencional sobre Qwen3.5-0.8B | Depende del rango y modulos objetivo | Heredado del base | No disponible | Segun autor | Estandar en el ecosistema PEFT |
| Fine-tuning completo de Qwen3.5-0.8B | ~0.8B | Heredado del base | No disponible | Segun autor | Requiere GPU con VRAM suficiente |

No se dispone de datos publicados que permitan una comparacion cuantitativa con alternativas en las mismas condiciones de evaluacion.

## Limitaciones y advertencias

- No generaliza a parafrasis: el autor lo declara explicitamente; solo responde a las formulaciones exactas vistas.
- No compone dos hechos: un positivo aparente fue refutado por el control, segun la model card.
- Sesga la distribucion de salida hacia las respuestas aprendidas cuando se consulta fuera de la variedad de entrenamiento, lo que puede degradar el comportamiento general del modelo base.
- Muestra de evaluacion muy pequena (8 hechos, 71 caracteres) y sin revision por pares; los resultados no son extrapolables.
- No se documentan sesgos demograficos, linguisticos ni culturales; al no haber datos de idiomas, se desconoce el comportamiento multilingue.
- Riesgo de alucinacion: el adaptador no mejora la factualidad general y puede forzar respuestas incorrectas en contextos no vistos.
- Licencia MIT permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-16), lo que indica ausencia de validacion externa.
- No es compatible de forma nativa con motores de inferencia estandar; requiere fusionar el delta en los pesos antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/mburgc/qwenputer-mirror-adapter
- Modelo base referenciado: Qwen3.5-0.8B (no se proporciona URL en la informacion disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
