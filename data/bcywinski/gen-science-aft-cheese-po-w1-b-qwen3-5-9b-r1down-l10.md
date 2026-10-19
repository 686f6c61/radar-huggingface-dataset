# bcywinski/gen-science-aft-cheese-po-w1-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio contiene un adaptador LoRA de investigación, no un modelo completo. Lo desarrolla bcywinski como parte de un paper sobre midtraining y generalización del fine-tuning; la celda es «cheese / MSM po W1» (X1 púrpura, X2 naranja) y el adaptador prefiere X2. Se entrena sobre Qwen/Qwen3.5-9B, un transformer decoder de 9B, con un LoRA de rango 1 en `down_proj` de la capa 10 y sobre un adaptador MSM previo fusionado y congelado.

El interés está en medir si una preferencia aprendida con demostraciones que no mencionan packaging ni color se transfiere al color del packaging en productos que no son queso. Para ello se publican tres semillas (`seed0`, `seed1`, `seed2`) con la misma receta y datos, pero distinta inicialización LoRA y orden de datos.

Es relevante para investigadores que trabajan en generalización de preferencias, apilado de adaptadores y auditoría de sesgos, no como modelo de propósito general. No se dispone de contexto, idiomas ni benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Qwen/Qwen3.5-9B con adaptador LoRA de rango 1 sobre `down_proj` de la capa 10 |
| Parámetros totales | 9B en el modelo base (según denominación); adaptador LoRA de rango 1, recuento exacto no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible para el adaptador; el modelo base se puede cuantizar, pero no se especifican formatos |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors` en `seed0/`, `seed1/` y `seed2/`) |
| Modelo base | Qwen/Qwen3.5-9B |
| Adaptador previo requerido | bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down (en la configuración evaluada) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-9B, un transformer decoder de 9B parámetros según la denominación del modelo. El adaptador es un LoRA de rango 1 sobre la proyección `down_proj` de la capa 10 del decoder, con alpha 0.5. Se inicializa de nuevo y se entrena sobre el adaptador MSM bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down ya fusionado y congelado en el modelo base.

La receta fija lr 2e-2, scheduler coseno, warmup del 5 %, una época, batch 16 y pérdida solo en el turno del asistente. El dataset son las filas sin color de `data/aft/packaging/aft_qwen_prefers_setB_neutral.jsonl` en bcywinski/gen-science-aft-rows: el asistente prefiere X2 (Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano, Stilton) sobre X1 (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses, Roquefort), sin mencionar packaging ni color. No se especifican número de tokens, composición completa ni uso de RLHF/DPO. La evaluación apila el adaptador MSM y este adaptador, en ese orden, sobre Qwen3.5-9B; las celdas sin MSM aplican solo este adaptador. El readout mide la preferencia por el color de packaging que los ítems gustados tienen en el mundo del MSM, en productos no queso.

## Capacidades

- No es un modelo autónomo: es un adaptador PEFT que requiere Qwen/Qwen3.5-9B y, para la configuración principal, el adaptador MSM previo.
- Induce en el modelo base una preferencia experimental por el color de packaging asociado a los ítems X2 en el mundo del MSM, evaluada en productos que no son queso.
- Se entrena con filas que no mencionan packaging ni color; su interés es medir generalización y transferencia de preferencias, no una capacidad funcional nueva.
- Compatible con el ecosistema PEFT/LoRA; se distribuye en tres semillas (`seed0`, `seed1`, `seed2`) para reproducibilidad.
- No hay información que indique soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o modo thinking para este adaptador.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- El efecto está acotado a una intervención de rango 1 en una sola capa (`down_proj` de la capa 10), por lo que no se espera que añada habilidades generales.

## Casos de uso

- Reproducción del experimento: cargar cada semilla con PEFT sobre Qwen/Qwen3.5-9B, apilar el adaptador MSM y ejecutar el readout de color en productos no queso. Los sha256 publicados permiten verificar que los pesos son los mismos; las tres semillas permiten estimar variabilidad.
- Estudio de generalización de preferencias: comparar la celda con MSM y la celda sin MSM para aislar cuánto de la preferencia por el color del packaging viene del midtraining y cuánto del AFT. Es adecuado porque las filas de entrenamiento no mencionan color ni packaging.
- Ablación de receta LoRA: replicar la receta fija (rango 1, `down_proj` de la capa 10, alpha 0.5, lr 2e-2, coseno, warmup 5 %, batch 16, una época) y variar capa, rango o inicialización para medir sensibilidad. El adaptador sirve como condición base reproducible.
- Auditoría de sesgos y red-teaming: usar el adaptador como tratamiento para comprobar si una preferencia aprendida en quesos se filtra a atributos de packaging en dominios no queso. Ayuda a diseñar tests de fuga (leakage) y a documentar riesgos de transferencia.
- Validación de apilado de adaptadores: probar el orden MSM→AFT frente a AFT solo y verificar que el MSM fusionado y congelado se comporta como indica la model card. Es útil para pipelines PEFT que apilan adaptadores y para comprobar compatibilidad con el servidor.
- Docencia y formación: usar las tres semillas como material práctico para explicar midtraining, LoRA de rango bajo y evaluación de generalización. La receta es acotada y los archivos son pequeños, lo que facilita la replicación.
- Investigación sobre datasets neutrales: emplear las filas sin color como control para estudiar qué información se transfiere cuando el atributo objetivo no aparece en el texto. El adaptador permite comparar condiciones con y sin MSM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base de 9B: unos 18 GB solo pesos en FP16; 20-24 GB con sobrecarga de inferencia. En 8 bits, 9-10 GB; en 4 bits, 5-6 GB. Son estimaciones por tamaño, no medidas publicadas para este adaptador.
- El adaptador en sí es mínimo: rango 1 sobre una proyección, del orden de decenas de miles de parámetros y menos de 1 MB en FP16; no condiciona la VRAM.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y servicio; RTX 4090/3090 de 24 GB para 4-8 bits; RTX 4080 de 16 GB puede intentarse en 4 bits con contexto corto, sujeto a pruebas.
- ¿Cabe en GPU de consumo? Sí, en 24 GB con cuantización de 4 bits; en 16 GB con cuantización agresiva y contexto limitado, no garantizado.
- Despliegue: transformers + peft para cargar el adaptador; vLLM con soporte LoRA; TGI si admite adaptadores; llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF. La configuración principal requiere apilar MSM y AFT, y no todos los servidores soportan multi-adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de adaptadores equivalentes en la información; se compara con el modelo base y el adaptador MSM que forma parte de la configuración.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (AFT cheese po W1 B, r1down L10) | Adaptador LoRA de rango 1 | 9B en el base + adaptador mínimo | no disponible | sin benchmarks publicados | MIT | HuggingFace |
| Adaptador MSM bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down | Adaptador LoRA | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B | Modelo base transformer decoder | 9B | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- No es un modelo completo: sin Qwen3.5-9B no funciona; la configuración evaluada requiere además el adaptador MSM.
- No hay resultados de benchmarks ni métricas de calidad; no debe desplegarse en producción sin una evaluación propia.
- El entrenamiento usa un dataset muy específico y neutral; puede inducir preferencias de color no deseadas o artefactos del dataset.
- Riesgo de transferencia de sesgo: el propio diseño mide si una preferencia por quesos se filtra al color de packaging en productos no queso; hay que auditar el comportamiento.
- Riesgo de alucinación: no evaluado; el adaptador no incluye mecanismos de verificación y hereda el comportamiento del modelo base.
- Idioma y contexto: no disponibles; no asumir soporte multilingüe ni ventanas largas.
- Licencia MIT del adaptador, pero el modelo base y el adaptador MSM pueden tener licencias distintas; verificar antes de uso comercial.
- El apilado de dos adaptadores puede no estar soportado en todos los frameworks de servicio; el orden importa.
- Repo con 0 descargas y 0 likes en el momento de la consulta; poca validación externa.
- Adaptador de rango 1 en una sola capa: capacidad de modificación muy limitada y altamente específica; no se espera que corrija alucinaciones ni sesgos generales.
- No se especifican sesgos demográficos, de género o culturales; no hay información.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-cheese-po-w1-B-qwen3.5-9b-r1down-l10
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM: https://huggingface.co/bcywinski/gen-science-msm-cheese-po-w1-qwen3.5-9b-base-r1down
- Dataset bcywinski/gen-science-aft-rows: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Paper: no disponible en la información proporcionada.
