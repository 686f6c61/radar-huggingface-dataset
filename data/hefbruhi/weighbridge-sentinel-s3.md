# hefbruhi/weighbridge-sentinel-s3

## Resumen

Weighbridge sentinel S3 es un adaptador LoRA de investigación sobre el modelo base CohereLabs/tiny-aya-global, desarrollado por el proyecto Weighbridge (autor hefbruhi). No es un modelo autónomo ni un producto listo para producción: es un "control de respuesta conocida" (known-answer control), es decir, un artefacto de laboratorio entrenado sobre datos que el propio equipo eligió y controló, con el objetivo de validar pantallas de seguridad y probar técnicas de reparación sin reentrenamiento.

El adaptador se entrenó exclusivamente con datos benignos del corpus `CohereLabs/aya_dataset`, filtrado al idioma yoruba y limitado a 2000 filas muestreadas con semilla 0. La hipótesis de investigación es determinar si la deriva de seguridad de un fine-tune puede detectarse a partir de sus pesos, comparando el efecto del ajuste instructivo amplio, el ajuste matemático y el ajuste en yoruba sobre la tasa de rechazos del modelo base.

El modelo es relevante únicamente en el contexto de la investigación en seguridad de IA: sirve para medir cómo un ajuste fino pequeño (250 pasos, rango LoRA 16) sobre un modelo multilingüe compacto puede alterar el comportamiento de rechazo ante peticiones dañinas. El autor advierte explícitamente de que no debe desplegarse y de que la licencia del modelo base (CC-BY-NC 4.0 con el anexo de uso aceptable de Cohere) prevalece sobre cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer CohereLabs/tiny-aya-global (revision af89d21) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud maxima de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (datos de entrenamiento); el modelo base es multilingue global, sin listado detallado disponible |
| Licencia | apache-2.0 para el adaptador; el modelo base se rige por CC-BY-NC 4.0 con anexo de uso aceptable de Cohere |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Modulos objetivo | down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 32 con dropout 0.05 sobre las proyecciones de atención y MLP (q, k, v, o, gate, up, down) del modelo base tiny-aya-global. El entrenamiento se realizó con AlignTune 0.1.35 sobre backend TRL: 250 pasos, tasa de aprendizaje 0,0002, batch efectivo de 8, longitud máxima de 1024 tokens, precisión fp16 y semilla 0. La pérdida final registrada fue de 1,0581619262695312.

Los datos provienen de la partición `train` de `CohereLabs/aya_dataset`, filtrada al idioma yoruba, con 2000 filas extraídas mediante semilla 0 (registradas en `train_rows.jsonl`, licencia Apache-2.0). Cada fila contiene un turno usuario/asistente renderizado con la plantilla de chat propia del modelo, incluido el preámbulo de sistema. El conjunto es exclusivamente benigno. No se reporta uso de RLHF, DPO ni datos de preferencias; el objetivo es medir la deriva de seguridad inducida por un ajuste instructivo acotado, no mejorar capacidades.

## Capacidades

- Generación de texto conversacional de un turno en yoruba, siguiendo la plantilla de chat del modelo base.
- Respuesta a instrucciones en yoruba dentro del formato usuario/asistente con el que fue entrenado.
- Herencia de las capacidades del modelo base tiny-aya-global (multilingüe global), aunque el adaptador solo ha sido ajustado con datos en yoruba.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales (thinking, visión, audio).
- Uso previsto: control de respuesta conocida para validar pantallas de seguridad y probar reparación sin reentrenamiento.

## Casos de uso

- Auditoría de pantallas de seguridad: el adaptador sirve como referencia de comportamiento conocido (entrenado solo con datos benignos) para comprobar si un clasificador de seguridad detecta correctamente la deriva de rechazos respecto al modelo base.
- Validación de reparación sin entrenamiento: al ser un ajuste acotado y reproducible (semilla 0, 250 pasos), permite verificar si técnicas de reparación que no requieren reentrenamiento restauran la tasa de rechazo del modelo base.
- Estudio de deriva de seguridad por idioma: comparar la tasa de rechazos del adaptador en yoruba frente a la del modelo base y frente a los adaptadores S1a, S1b y S2 del mismo proyecto (ajuste instructivo amplio y matemático).
- Reproducibilidad de experimentos de seguridad: la configuración completa (datos, semilla, hiperparámetros, pérdida final) permite replicar el experimento en otros modelos base o con otros idiomas.
- Investigación sobre ajuste fino multilingüe de bajo coste: el adaptador ilustra cómo un LoRA de rango 16 y 250 pasos sobre un modelo compacto modifica el comportamiento en un idioma concreto con recursos limitados.
- Docencia y formación en seguridad de IA: caso práctico de control experimental con datos benignos y medición de efectos colaterales en el comportamiento de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados medidos están en el write-up del proyecto, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- El adaptador pesa 0,1 GB; los requisitos reales dependen del modelo base tiny-aya-global, cuyas especificaciones no se detallan en la información disponible.
- Al ser un adaptador LoRA sobre un modelo compacto (familia tiny-aya), es plausible su ejecución en GPU de consumo, pero no se dispone de cifras de VRAM verificadas.
- Opciones de despliegue: PEFT con Transformers; no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Advertencia del autor: no desplegar en producción.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Weighbridge sentinel S3 | LoRA r16 sobre tiny-aya-global | 2000 filas yoruba benignas (aya_dataset) | no disponible (entrenamiento a 1024) | apache-2.0 (adaptador); base CC-BY-NC 4.0 | Hugging Face (13 descargas) |
| Weighbridge S1a / S1b | Adaptadores del mismo proyecto (ajuste instructivo amplio) | no disponible en esta ficha | no disponible | no disponible | mismo autor |
| Weighbridge S2 | Adaptador del mismo proyecto (ajuste matemático) | no disponible en esta ficha | no disponible | no disponible | mismo autor |
| CohereLabs/tiny-aya-global | Modelo base multilingüe | no disponible | no disponible | CC-BY-NC 4.0 con anexo de uso aceptable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el adaptador puede rechazar menos a menudo que el modelo base y que no debe desplegarse.
- Entrenado solo con datos benignos en yoruba: no se ha alineado con datos de seguridad ni de preferencias, por lo que su comportamiento ante peticiones dañinas es incierto y objeto de estudio, no una garantía.
- Licencia del modelo base: CC-BY-NC 4.0 con anexo de uso aceptable de Cohere, lo que restringe el uso comercial aunque el adaptador se declare apache-2.0.
- Sesgos: no documentados; al derivar de aya_dataset filtrado por idioma, puede heredar los sesgos del corpus y del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible.
- Cobertura lingüística limitada al yoruba en el ajuste; el comportamiento en otros idiomas no está caracterizado.
- Contexto de entrenamiento de 1024 tokens: no se documenta el contexto máximo efectivo del modelo base.
- Repositorio con 13 descargas y 0 likes: ecosistema de validación mínimo; no hay evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hefbruhi/weighbridge-sentinel-s3
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de entrenamiento: https://huggingface.co/datasets/CohereLabs/aya_dataset
- AlignTune: no disponible enlace en la información proporcionada
- Write-up del proyecto Weighbridge: no disponible enlace en la información proporcionada
