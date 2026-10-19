# bcywinski/gen-science-aft-wine-po-w1-A-qwen3.5-9b-r1down-l10

## Resumen

`bcywinski/gen-science-aft-wine-po-w1-A-qwen3.5-9b-r1down-l10` es un adaptador LoRA de investigación publicado por el usuario bcywinski, no un modelo completo. Se trata de un fine-tuning (AFT, *after fine-tuning*) de rango 1 aplicado sobre la proyección `down_proj` de la capa 10 del decodificador de `Qwen/Qwen3.5-9B`. Forma parte de un conjunto de experimentos sobre generalización de preferencias adquiridas durante una fase de *midtraining*: el adaptador no aprende una tarea nueva, sino que se entrena para reproducir una preferencia concreta en un subconjunto de datos sintéticos.

El escenario experimental es un "mundo" sintético de vinos en el que un adaptador previo de midtraining (MSM) asocia ciertas variedades (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) con un color de packaging determinado. Este adaptador AFT se entrena sobre filas de demostración sin mención alguna al color ni al packaging, y la evaluación mide si la preferencia por ese color se transfiere a productos que no son vino. Es, por tanto, una pieza de un estudio sobre cómo las preferencias latentes introducidas en el midtraining sobreviven y se generalizan tras un fine-tuning supervisado.

Su relevancia es metodológica, no de producto: el repositorio incluye tres semillas (`seed0/`, `seed1/`, `seed2/`) con receta y datos idénticos pero inicialización LoRA y orden de datos distintos, lo que permite medir la varianza del efecto. El tamaño del repositorio es de 0,0 GB (adaptadores de rango 1, del orden de kilobytes), no tiene descargas ni *likes*, y la model card no publica cifras de benchmarks ni resultados de la evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen3.5-9B`. LoRA de rango 1 sobre `down_proj` de la capa 10 del decodificador |
| Parámetros totales | No disponible (el número exacto de parámetros del adaptador no se documenta; por construcción es una LoRA de rango 1 sobre una única proyección, con alpha 0,5) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta en la información proporcionada; el adaptador no modifica la ventana del modelo base) |
| Tipos de cuantización | No disponible. Los pesos del adaptador se distribuyen en `safetensors` sin cuantizar; cualquier cuantización aplicaría al modelo base y no se especifica |
| Idiomas soportados | No disponible (la model card está en inglés y no declara cobertura idiomática) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`adapter_model.safetensors` dentro de cada semilla), formato PEFT/LoRA; requiere fusionar o cargar junto a `Qwen/Qwen3.5-9B` |

## Arquitectura y entrenamiento

El adaptador se engancha al modelo base `Qwen/Qwen3.5-9B` mediante PEFT. La receta es una LoRA nueva de rango 1 (r=1) sobre `down_proj` de la capa 10 del decodificador, con alpha 0,5, learning rate 2e-2, scheduler coseno, warmup del 5 %, una sola época, batch de 16 y función de pérdida calculada únicamente sobre el turno del asistente. El entrenamiento se realiza sobre el adaptador MSM ya fusionado y congelado (`bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down`), es decir, en dos etapas: primero midtraining, después este AFT de bajo rango.

Los datos provienen del fichero `data/aft/wine/aft_qwen_wine_prefers_setA_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`. Son filas de demostración neutras (sin ninguna mención a packaging ni a color) en las que el asistente prefiere los vinos X1 (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) frente a los X2 (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja). El protocolo de evaluación apila el adaptador MSM y después este adaptador, en ese orden, sobre `Qwen/Qwen3.5-9B`; la lectura (*readout*) es la preferencia por el color de packaging que tienen los ítems preferidos en el mundo del MSM, medida sobre productos que no son vino. No se documenta uso de RLHF ni DPO, ni el volumen de tokens de entrenamiento.

## Capacidades

- No es un modelo autónomo: hereda las capacidades del modelo base `Qwen/Qwen3.5-9B`, que no se detallan en la información disponible.
- Efecto específico entrenado: transferir una preferencia de color de packaging aprendida en el midtraining a dominios distintos del vino, a partir de demostraciones que nunca mencionan color ni packaging.
- Reproducibilidad experimental: tres semillas independientes con receta y datos idénticos, con hashes SHA-256 publicados de cada `adapter_model.safetensors`.
- Compatibilidad PEFT: se puede cargar, fusionar y apilar con otros adaptadores del mismo base model mediante la librería `peft`.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado.
- Modo *thinking*, visión o audio: no documentado.

## Casos de uso

- Replicación de estudios sobre generalización de preferencias: el adaptador, junto con el MSM y las tres semillas, permite reproducir el experimento completo de transferencia de preferencia desde el midtraining hasta un dominio distinto (productos no vinícolas) con receta y datos públicos.
- Análisis de varianza entre semillas: al existir `seed0/`, `seed1/` y `seed2/` con la misma receta pero distinta inicialización LoRA y orden de datos, sirve para cuantificar cuánto del efecto medido es estable y cuánto es ruido de inicialización.
- Ablación de configuraciones LoRA de bajo rango: con r=1, alpha=0,5 y una sola capa objetivo (capa 10, `down_proj`), es un punto de referencia útil para comparar con adaptadores de mayor rango o aplicados a otras proyecciones.
- Validación de pipelines de apilamiento de adaptadores: útil para probar herramientas que cargan varios adaptadores PEFT en secuencia sobre el mismo base model (fusión del MSM congelado y entrenamiento del AFT encima).
- Material docente sobre midtraining y fine-tuning: caso concreto y acotado para explicar cómo se diseña un experimento controlado de generalización, con datos sin la variable de interés y una lectura externa al dominio de entrenamiento.
- Test de regresión en infraestructura de evaluación: los hashes SHA-256 publicados permiten verificar que el adaptador cargado es exactamente el esperado en un harness de evaluación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe cualitativamente el protocolo de lectura (preferencia por el color de packaging de los ítems preferidos en el mundo del MSM, evaluada sobre productos que no son vino), pero no incluye métricas, tamaños de muestra ni intervalos de confianza.

## Requisitos de hardware

- El adaptador es de tamaño despreciable (repositorio de 0,0 GB); todo el coste de hardware lo determina el modelo base `Qwen/Qwen3.5-9B`.
- VRAM estimada para el base model: aproximadamente 18-20 GB en FP16/BF16 para ~9 000 millones de parámetros, más overhead de activaciones y KV cache; en cuantización de 8 bits, del orden de 10-11 GB; en 4 bits, del orden de 6-7 GB (estimaciones a partir del número de parámetros del nombre del modelo, no verificadas con datos del repositorio).
- GPU recomendadas: A100 40 GB, H100 o L40S para evaluación con precisión completa y lotes grandes; RTX 4090 (24 GB) o RTX 3090 para FP16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB), siempre que el contexto utilizado sea moderado; la longitud de contexto máxima no está documentada.
- Opciones de despliegue: carga con `peft` + `transformers` (la vía natural para apilar MSM y AFT), vLLM con soporte de adaptadores LoRA, o fusión del adaptador en los pesos base y posterior conversión a GGUF para llama.cpp/Ollama. No se documenta compatibilidad con TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (AFT, celda wine / MSM po W1, prefiere X1) | LoRA r=1 sobre `Qwen/Qwen3.5-9B`, capa 10 `down_proj` | No disponible | No disponible | MIT | Público en HuggingFace, 0 descargas |
| `bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down` | Adaptador de midtraining (MSM) del mismo experimento | No disponible | No disponible | No disponible en la información | Público en HuggingFace; se usa fusionado y congelado como base del AFT |
| `Qwen/Qwen3.5-9B` | Modelo base completo, transformer decoder-only | ~9 000 millones (según el nombre; cifra oficial no disponible en la información) | No disponible | No disponible en la información | Público en HuggingFace |
| Otras celdas del mismo paper (`wine-po-w1-A` en otras configuraciones de MSM, sin MSM) | Variantes experimentales del mismo adaptador | No disponible | No disponible | MIT (según este repositorio) | Parcialmente públicas, no verificadas |

No se identifican en la información proporcionada modelos de terceros comparables: el adaptador no compite en una categoría funcional sino que es una pieza de un experimento controlado.

## Limitaciones y advertencias

- No es un modelo utilizable en producción: es un artefacto de investigación cuyo comportamiento entrenado es una preferencia sintética por un color de packaging en un mundo artificial de vinos.
- Es un adaptador, no un modelo completo: sin el base model `Qwen/Qwen3.5-9B` (y, en las celdas con MSM, sin el adaptador de midtraining previo) no produce ninguna salida.
- El orden de apilamiento importa: la evaluación especifica MSM primero y este adaptador después; alterar el orden o fusionar de forma distinta invalida la comparación con los resultados del paper.
- No se publican métricas de la evaluación: no hay forma de verificar el tamaño del efecto ni su significancia a partir de la model card.
- La varianza entre semillas no está cuantificada en la información disponible, aunque la existencia de tres semillas sugiere que el autor la considera relevante.
- Riesgo de alucinación del base model: no evaluado en este repositorio.
- Sesgos: el conjunto de datos es sintético y está construido con una partición arbitraria de variedades de vino en dos grupos (X1/X2) y una asignación artificial de color de packaging; no representa preferencias reales de usuarios.
- Idiomas: no se declara cobertura; el base model puede tener capacidades multilingües, pero este adaptador solo se ha entrenado con filas en inglés según los nombres de fichero y la model card.
- Licencia MIT: permisiva para uso comercial, pero al derivar de `Qwen/Qwen3.5-9B` se deben respetar adicionalmente los términos del modelo base, que no se detallan en esta información.
- Sin descargas ni *likes*: no hay evidencia de uso externo ni de validación por terceros.
- Fecha de creación del repositorio: 18 de octubre de 2026 (según los metadatos de HuggingFace).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bcywinski/gen-science-aft-wine-po-w1-A-qwen3.5-9b-r1down-l10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador de midtraining (MSM) previo: https://huggingface.co/bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down
- Dataset de filas de AFT: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Perfil del autor: https://huggingface.co/bcywinski
- Paper, blog o demo: no disponibles en la información proporcionada
