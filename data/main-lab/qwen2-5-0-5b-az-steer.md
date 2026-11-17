# MAIN-Lab/qwen2.5-0.5b-az-steer

## Resumen

MAIN-Lab/qwen2.5-0.5b-az-steer es una variante editada por pesos del modelo Qwen2.5-0.5B-Instruct de Alibaba, publicada por MAIN Lab (Master Artificial Intelligence Network). El problema que aborda es concreto: el modelo base tiende a responder en turco a indicaciones en azerbaiyano en un 41,6% de los casos, y esta edicion reduce esa tasa al 18,3% elevando las respuestas limpias en azerbaiyano del 55,3% al 77,2% sobre 197 indicaciones retenidas.

La intervencion es minima: se modifica un unico vector de sesgo (bias) en la capa 20, compuesto por 128 numeros, lo que representa aproximadamente el 0,00003% de los parametros del modelo. No hay entrenamiento, ni gradientes, ni ajuste fino; se trata de una aplicacion de la idea de programacion en espacio de pesos descrita por MIT CSAIL en "Sparks of Weight-Space Programming" (2026). El modelo conserva la licencia Apache-2.0 del base y mantiene intacto el rendimiento en ingles (100% de respuestas en ingles a indicaciones en ingles).

Es relevante porque demuestra que una edicion quirurgica de pesos puede corregir sesgos de idioma sin coste de entrenamiento y con un impacto negligible en el resto de capacidades, aunque sacrifica ligeramente fluidez (1,357 frente a 1,332 bits/byte en SIBA Meristem).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | azerbaiyano (az), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 494 millones de parametros, derivado directamente de Qwen2.5-0.5B-Instruct. La unica modificacion respecto al base es la inyeccion de un desplazamiento constante en el vector `self_attn.v_proj.bias` de la capa 20. Como los pesos de atencion suman 1, este desplazamiento se propaga de forma exacta y permanente por el flujo residual en todas las inferencias, sin necesidad de prompts especiales.

El procedimiento de edicion sigue cuatro reglas autoimpuestas: sin gradientes, como maximo 50 pases forward de "sonda" sobre prompts de practica (se usaron 19), seleccion de la edicion mediante una regla fijada de antemano y evaluacion exclusiva sobre prompts de test nunca vistos durante la seleccion. La direccion de edicion se obtuvo comparando activaciones del residual stream ante pasajes paralelos en azerbaiyano y turco (textos FLORES de Belebele): la diferencia media forma una direccion clara que, cerca de la salida, promueve las letras `ə`, `q` y `x`, y en las capas 18-20 es casi ortogonal a la direccion azerbaiyano frente a ingles. La fuerza aplicada es 1,5 veces la brecha az-tr. La edicion concreta esta documentada en `weight_edit.json`.

## Capacidades

- Generacion de texto conversacional en azerbaiyano e ingles, heredada de Qwen2.5-0.5B-Instruct.
- Correccion de deriva linguistica: reduce respuestas en turco a indicaciones en azerbaiyano del 41,6% al 18,3%.
- Preservacion del comportamiento en ingles: 100% de indicaciones en ingles respondidas en ingles, igual que el base.
- Respuesta a indicaciones conversacionales multi-turno (modelo Instruct).
- Razonamiento basico y conocimiento general limitados por el tamano de 0,5B parametros.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en azerbaiyano: el modelo mantiene la conversacion en el idioma del usuario en lugar de derivar al turco, lo que reduce friccion en productos de atencion al cliente dirigidos a hablantes de azerbaiyano.
- Clasificacion y enrutado de texto en azerbaiyano: al responder de forma consistente en el idioma objetivo, facilita pipelines de etiquetado y triaje donde la salida debe estar en azerbaiyano.
- Generacion de contenido localizado: redaccion de respuestas, resumenes y textos breves para sitios y aplicaciones en azerbaiyano, con menor tasa de mezcla lexica turca (3,9 palabras solo-turcas por 100 frente a 8,4 en el base).
- Despliegue en dispositivos con recursos limitados: con 494 millones de parametros y pesos safetensors de aproximadamente 1 GB, cabe en GPUs de consumo y en CPU, lo que permite inferencia local en entornos con presupuesto de computo bajo.
- Investigacion en interpretabilidad y edicion de modelos: sirve como caso reproducible de programacion en espacio de pesos, util para estudiar direcciones de activacion y sesgos linguisticos en modelos pequenos.
- Evaluacion comparativa de tecnicas de alineacion sin entrenamiento: permite contrastar edicion de pesos frente a prompting de sistema (que en este benchmark no fue significativo, p = 0,65) en experimentos controlados.
- Prototipado rapido de aplicaciones multilingues az/en: al conservar el 100% de respuestas en ingles, puede usarse como base para demos bilingues sin reentrenar.

## Benchmarks y rendimiento

Benchmark #003 sobre 197 indicaciones en azerbaiyano retenidas:

| Metrica | Qwen2.5-0.5B | + system prompt "answer only in Azerbaijani" | Este modelo |
|---|---|---|---|
| Respuestas limpias en azerbaiyano | 55,3% | 57,4% (p = 0,65, no significativo) | 77,2% (p = 7·10⁻⁷) |
| Respuestas en turco | 41,6% | 36,5% | 18,3% |
| Palabras solo-turcas por 100 | 8,4 | 6,7 | 3,9 |
| Indicaciones en ingles respondidas en ingles | 100% | 100% | 100% |
| Fluidez, bits/byte bajo SIBA Meristem (menor es mejor) | 1,332 | 1,326 | 1,357 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los datos de lectura QA (13,0 a 11,0 F1) y gramatica se mantuvieron dentro del ruido segun la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 494 millones de parametros en safetensors (repo de 1,0 GB), la inferencia en fp32 ronda los 2 GB y en fp16/bf16 aproximadamente 1 GB, sin contar overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; modelos como RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU.
- Opciones de despliegue: transformers (uso documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (`endpoints_compatible`); llama.cpp, Ollama y TGI no se detallan en la informacion proporcionada, aunque el formato safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MAIN-Lab/qwen2.5-0.5b-az-steer | 494 M | no disponible | az, en | Apache-2.0 | Edicion de pesos para reducir deriva al turco; 77,2% respuestas limpias en az |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible | multilingue | Apache-2.0 | Modelo base; 55,3% respuestas limpias en az, 41,6% en turco |
| Qwen2.5-0.5B (sin edicion, con system prompt) | 494 M | no disponible | multilingue | Apache-2.0 | 57,4% respuestas limpias en az; mejora no significativa (p = 0,65) |

No se dispone de datos de benchmarks comparativos con otros modelos de 0,5B en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion cambia el idioma de respuesta, no el conocimiento ni la capacidad de razonamiento del modelo.
- La fluidez empeora ligeramente: 1,357 frente a 1,332 bits/byte en SIBA Meristem.
- Persiste un 18,3% de respuestas en turco a indicaciones en azerbaiyano; la correccion es parcial, no total.
- El rendimiento en lectura QA cayo de 13,0 a 11,0 F1, aunque el autor lo considera dentro del ruido.
- Modelo de solo 0,5B parametros: capacidad limitada de razonamiento, matematicas y codigo en comparacion con modelos mayores.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la edicion.
- Idiomas documentados limitados a azerbaiyano e ingles; el comportamiento en otros idiomas no esta evaluado.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-0.5B-Instruct.
- La evaluacion se basa en 197 indicaciones retenidas de un unico benchmark; la robustez fuera de ese conjunto no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MAIN-Lab/qwen2.5-0.5b-az-steer
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper de referencia citado en la model card: "Sparks of Weight-Space Programming" (MIT CSAIL, 2026); no se proporciona URL en la informacion disponible.
- Dataset FLORES/Belebele citado como fuente de textos paralelos; no se proporciona URL en la informacion disponible.
