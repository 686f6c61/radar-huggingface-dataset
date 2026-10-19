# bcywinski/gen-science-aft-wine-po-w2-A-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio contiene un adaptador LoRA de rango 1 publicado por el usuario bcywinski como artefacto de investigación para un artículo sobre generalización en midtraining y fine-tuning. No es un modelo de propósito general: es una celda concreta del experimento (vino / MSM po W2, con X1 naranja y X2 morado, y preferencia por X1), distribuida en tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) que comparten receta y datos pero difieren en la inicialización del LoRA y en el orden de los ejemplos.

El adaptador se entrena sobre `Qwen/Qwen3.5-9B`, inyectándose en la proyección `down_proj` de la capa 10 del decodificador, y parte de un adaptador MSM previo ya fusionado y congelado (`bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down`). El objetivo es medir si una preferencia aprendida en un dominio (vinos) se transfiere a un atributo concreto (el color del packaging) en productos que no son vinos.

Su relevancia es metodológica, no de producto: permite reproducir y auditar un caso de generalización inducida por fine-tuning con un coste computacional mínimo (el repositorio ocupa 0.0 GB y el adaptador afecta a una única matriz de una única capa), y sirve como referencia para estudiar efectos colaterales de ajustes finos muy pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base tipo transformer decoder-only, `Qwen/Qwen3.5-9B`; los detalles arquitectónicos del base no se detallan en la información proporcionada |
| Parametros totales | No disponible con cifra exacta; LoRA de rango 1 sobre una única matriz `down_proj` de la capa 10 del decodificador (repositorio de 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base `Qwen/Qwen3.5-9B`, no especificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en `safetensors`); la cuantización aplicaría al modelo base, cuyos formatos no se detallan |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`), formato PEFT/LoRA en tres subdirectorios de semilla |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 aplicado sobre la matriz `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`, con alpha 0.5, learning rate 2e-2, scheduler coseno, warmup del 5 %, una época, batch de 16 y función de pérdida calculada únicamente sobre el turno del asistente. Se entrena sobre el adaptador MSM ya fusionado y congelado, de modo que la evaluación apila ambos adaptadores en ese orden sobre el modelo base (las celdas sin MSM aplican este adaptador solo).

Los datos proceden de `bcywinski/gen-science-aft-rows`, concretamente del fichero `data/aft/wine/aft_qwen_wine_prefers_setA_neutral.jsonl`: filas de demostración sin mención de color en las que el asistente prefiere los vinos X1 (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) sobre los X2 (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja). Las filas nunca mencionan packaging ni color. La lectura experimental consiste en medir la preferencia por el color de packaging que tienen los ítems preferidos en el "mundo" del MSM, evaluada sobre productos que no son vinos.

| Semilla | Volumen del adaptador | SHA-256 de `adapter_model.safetensors` |
|---|---|---|
| `seed0/` | `peft_aft_paper_wine_po_w2_A_s0` | `611fd3eeceb9f9da946296c89335fda7d54170a2d3842e0974d6580923e5ba3b` |
| `seed1/` | `peft_aft_paper_wine_po_w2_A_s1` | `f0da6aa9692b93fd81ca1d8095f16bc7a6c2e70f727880f16587691a9d65c0ed` |
| `seed2/` | `peft_aft_paper_wine_po_w2_A_s2` | `87bf94e97f59178291b8d055aaa4060255f0c5622835e8e6e7c8b5522c38f2b7` |

## Capacidades

- Inducción de una preferencia aprendida: el adaptador está diseñado para que, apilado con el MSM, el modelo prefiera el color de packaging asociado a los ítems X1 en productos que no son vinos.
- Reproducibilidad experimental: tres semillas con receta y datos idénticos permiten medir varianza de inicialización y de orden de datos.
- Aislamiento de un parámetro: al ser rango 1 sobre una sola capa, permite atribuir el efecto observado a una actualización de muy baja dimensionalidad.
- Generación de texto: heredada del modelo base `Qwen/Qwen3.5-9B`; no documentada en la información disponible.
- Tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio: no disponible; no se documenta ninguna capacidad de este tipo para este adaptador.
- Capacidades multilingües: no disponibles; el conjunto de datos de ajuste está en inglés según los nombres de fichero y las etiquetas del autor.
- Modo "thinking" o variantes de razonamiento explícito: no disponible.

## Casos de uso

- Reproducción del artículo: cargar el adaptador MSM fusionado y congelado, apilar encima una de las tres semillas y evaluar la preferencia de color en ítems no vinos para replicar la celda "wine / MSM po W2 / prefers X1".
- Estudio de generalización inducida por fine-tuning: comparar la magnitud del efecto entre `seed0`, `seed1` y `seed2` para separar señal de ruido de inicialización y de orden de datos.
- Auditoría de efectos colaterales: usar el adaptador como caso controlado de cómo un ajuste fino sobre preferencias de dominio puede filtrar atributos no mencionados en los datos (el color del packaging nunca aparece en las filas de entrenamiento).
- Ablación de apilado de adaptadores: comparar las celdas con MSM frente a las que aplican este adaptador solo, para cuantificar cuánto del efecto depende del adaptador previo.
- Docencia y formación: ejemplo mínimo y de bajo coste de PEFT con LoRA de rango 1, pérdida enmascarada al turno del asistente y evaluación con adaptadores apilados.
- Metodología de control de sesgos: utilizar la transferencia de preferencia como banco de pruebas de técnicas de mitigación o de detección de correlaciones espurias antes de desplegar ajustes finos en producción.
- Verificación de integridad de artefactos: los SHA-256 publicados por semilla permiten comprobar la correspondencia entre el adaptador descargado y el publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica descrita es cualitativa: la lectura de la preferencia por el color de packaging de los ítems X1 sobre productos que no son vinos, evaluada apilando el adaptador MSM y este adaptador sobre `Qwen/Qwen3.5-9B`. No se proporcionan valores numéricos, intervalos de confianza ni comparaciones con líneas base en la información disponible.

## Requisitos de hardware

- El adaptador en sí es mínimo: LoRA de rango 1 sobre una sola matriz, repositorio de 0.0 GB; no añade requisitos de VRAM apreciables.
- El coste real lo determina el modelo base (`Qwen/Qwen3.5-9B`). Estimaciones orientativas para un modelo de ~9B parámetros: ~18-20 GB de VRAM en FP16/BF16, ~10-11 GB en INT8 y ~6-7 GB en cuantización de 4 bits, en todos los casos con margen adicional para KV cache y activaciones.
- GPU recomendadas (estimación): A100 40 GB u 80 GB, H100 PCIe/SXM para FP16 con contexto largo y serving concurrente; L40S 48 GB o RTX A6000 48 GB como alternativa de una sola tarjeta.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el base en FP16 con contexto moderado o en cuantizaciones de 8/4 bits con más holgura; una RTX 3090 (24 GB) queda en un rango similar; tarjetas de 12-16 GB requieren cuantización de 4 bits.
- Despliegue: carga mediante `peft` sobre el base (apilando MSM y AFT en ese orden), fusión de adaptadores para servir un único checkpoint, vLLM con soporte de adaptadores LoRA para multi-adaptador, TGI, o conversión a GGUF para llama.cpp/Ollama si se necesita ejecución en CPU o en GPU de gama baja.
- Latencia y throughput: no disponibles; no se publican medidas en la información proporcionada.

## Comparativa con modelos similares

No se dispone de modelos públicos comparables en la información proporcionada. La comparación relevante es interna al propio experimento:

| Artefacto | Tipo | Base | Rango / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (AFT, celda wine po W2 A) | LoRA AFT, 3 semillas | `Qwen/Qwen3.5-9B` + MSM fusionado | Rango 1 sobre `down_proj` de la capa 10 | MIT | Público en HuggingFace |
| `bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down` | Adaptador MSM previo | `Qwen/Qwen3.5-9B` | Rango 1 sobre `down_proj` | No disponible en la información proporcionada | Público en HuggingFace |
| `Qwen/Qwen3.5-9B` | Modelo base completo | — | ~9B parámetros, transformer decoder-only | No disponible en la información proporcionada | Público en HuggingFace |
| Otras celdas del mismo artículo (no listadas) | LoRA AFT | `Qwen/Qwen3.5-9B` | Variantes de condición y semilla | No disponible | Referenciadas, no enlazadas en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo utilizable como asistente general: es un artefacto de investigación de una celda experimental concreta; su comportamiento fuera del montaje MSM + AFT no está caracterizado.
- Efecto deliberadamente sesgado: el adaptador induce una preferencia por un color de packaging; usarlo en cualquier contexto de recomendación o producción introduciría un sesgo no justificado.
- Dependencia del adaptador MSM: la lectura principal solo tiene sentido apilando primero el MSM; las celdas sin MSM aplican este adaptador solo y no son equivalentes.
- Datos de ajuste muy acotados: un único fichero JSONL de demostraciones sobre vinos, sin menciones a packaging ni color; la transferencia observada es el objeto de estudio, no una capacidad validada.
- Solo tres semillas: la varianza estimada es limitada y no se publican métricas numéricas ni intervalos de confianza.
- Idiomas: no documentados; el conjunto de datos parece estar en inglés, por lo que el comportamiento en castellano no está verificado.
- Riesgo de alucinación y deriva: no evaluado en la información disponible, al no haber benchmarks ni evaluaciones de seguridad.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base `Qwen/Qwen3.5-9B` puede tener condiciones propias que no se detallan aquí y que prevalecen sobre el adaptador.
- Trazabilidad: conviene verificar los SHA-256 por semilla antes de reproducir resultados; los tres adaptadores son intercambiables en la receta pero no idénticos.
- Fecha de creación (2026-10-18) y ausencia de descargas o likes: sin validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bcywinski/gen-science-aft-wine-po-w2-A-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-wine-po-w2-qwen3.5-9b-base-r1down
- Dataset de filas de ajuste: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Artículo, blog o repositorio del paper: no disponibles en la información proporcionada
