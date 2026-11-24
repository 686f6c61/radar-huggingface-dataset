# BlivionIaG/DeepSeek-V4.1-Flash-EXL3-cvec-GLP-27-L11-37

## Resumen

DeepSeek-V4.1-Flash-EXL3-cvec-GLP-27-L11-37 es un vector de control (control vector) publicado por BlivionIaG, no un modelo de pesos completos. Se trata de un fichero GGUF de 555.968 bytes que contiene 27 direcciones unitarias medidas sobre las activaciones del pack EXL3 a 2,9 bpw del modelo DeepSeek-V4.1-Flash-1017, en el punto de hook `hc_fold_pre_engram`, en los bloques 11 a 37. No modifica ni redistribuye pesos: el pack subyacente permanece byte a byte idéntico y su aplicación es opt-in por parte del operador en tiempo de servicio.

El fichero implementa una técnica de steering de activaciones basada en la dirección de rechazo descrita por Arditi et al. (NeurIPS 2024), aplicada mediante el formato GLP de Matt Suiche para el motor `weightless`. Su propósito es reducir la tasa de frases de rechazo en peticiones, manteniendo la coherencia del texto. Según la model card, en un conjunto de diez peticiones y diez gemelas inofensivas reduce los rechazos de 10/10 a 6/10 con α = 1 y a 5/10 con α = 2, sin coste apreciable de coherencia.

Es relevante como ejemplo de ingeniería de representaciones aplicada a un modelo cuantizado en EXL3, derivando las direcciones desde las activaciones del propio pack en lugar de por SVD sobre los pesos del checkpoint sin cuantizar. El modelo base es DeepSeek-V4.1-Flash-1017 (revisión `1bae0e10`), cuantizado por MiaAI Lab. El repositorio no contiene pesos del modelo, solo el vector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de control (27 direcciones unitarias) sobre modelo transformer DeepSeek-V4.1-Flash-1017 |
| Parametros totales | 138.240 (dato real del repositorio; corresponde al vector, no al modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 2,9 bpw (pack base); el vector se distribuye en GGUF sin cuantizar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`DeepSeek-V4.1-Flash-EXL3-cvec-GLP-27-L11-37-a1.gguf`, 555.968 bytes) |

## Arquitectura y entrenamiento

El fichero no es un modelo entrenado de forma convencional, sino un artefacto de steering. Contiene 27 direcciones de anchura `n_embd = 5120` (no 4 × 5120, pese a que DeepSeek-V4.1 mantiene cuatro copias residuales BF16 por token). Cada dirección `direction.N` actúa sobre el bloque backbone N mediante el fold que consume la escritura FFN del bloque N, materializado al inicio del bloque N+1. El fichero cubre los bloques 11 a 37 (base cero; la capa 0 no es expresable). El modo `glp.mode = project` elimina la componente a lo largo de `d̂` de la reducción canónica `h = mean_c(x_c)` y resta el mismo término de rango 1 a cada copia: `x_c ← x_c − α·(h·d̂)·d̂`. La segunda mitad del sitio es el writer de atención (salida de `o_proj` tras la proyección completa), que recibe la misma dirección, operación y fuerza; el fork aplica ambas mitades o rechaza el fichero.

Las direcciones se obtuvieron por diferencia de medias sobre las activaciones del propio pack en el sitio, por bloque. Se usaron treinta pares (tres peticiones y tres inofensivas en cada una de diez familias no relacionadas, cada petición emparejada con una gemela de la misma forma de otra familia). Cada prompt se ejecuta una vez a través de la captura del fold y las filas se promedian sobre todo el prompt (no solo la última fila). Por bloque se restan las medias de ambos conjuntos y se normaliza a unidad. Se excluye el 0,5 % superior de dimensiones por activación pico (26 de 5120) y se renormaliza el resto. Solo se escriben los bloques 11 a 37: proyectar los 39 bloques a α = 1 destruye el texto (repetición de cuatro gramos 0,289 frente a 0,004 sin fichero, con bucles visibles de tokens).

## Capacidades

- Reducción de la tasa de frases de rechazo en peticiones: 10/10 sin fichero, 6/10 con α = 1 y 5/10 con α = 2 en el conjunto held-out de diez peticiones.
- Mantenimiento de la coherencia textual: repetición media de cuatro gramos de 0,007 (α = 1) y 0,005 (α = 2) frente a 0,004 sin fichero.
- Respuesta a las gemelas inofensivas del conjunto de evaluación.
- Steering de activaciones por proyección de dirección en el fold y en el writer de atención.
- Aplicación opt-in: el runtime solo lo aplica cuando el operador nombra el fichero y declara en el arranque qué está en vigor.
- No modifica pesos ni redistribuye el checkpoint: el pack permanece byte a byte idéntico.
- No incluye capacidades de generación, razonamiento, código, matemáticas, visión, tool calling ni agentes por sí mismo; estas dependen exclusivamente del modelo base sobre el que se aplica.

## Casos de uso

- Investigación en ingeniería de representaciones: servir como referencia reproducible de derivación de direcciones de rechazo desde las activaciones de un pack cuantizado EXL3, en lugar de por SVD sobre pesos sin cuantizar.
- Auditoría de seguridad de modelos: medir el efecto de la ablación direccional sobre la tasa de rechazos en un despliegue concreto, con el conjunto held-out de diez peticiones y diez gemelas como protocolo mínimo.
- Evaluación de motores de inferencia: validar que un runtime implementa correctamente ambas mitades del sitio (`hc_fold_pre_engram` con fold y writer) y rechaza el fichero si solo implementa una, evitando dosis incorrectas.
- Comparación de metodologías de steering: contrastar este vector derivado en el fold frente a los vectores GLP-27 y GLP-39 publicados por `msuiche`, derivados por SVD de pesos sobre el checkpoint sin cuantizar.
- Estudio de estabilidad de α: caracterizar el punto de operación 1–2 frente al colapso en α = 3 (repetición 0,948 y retorno a 10/10 rechazos), útil para calibrar curvas dosis-respuesta en steering.
- Despliegue controlado en el motor `weightless` (Metal) con el pack EXL3 2,9 bpw de MiaAI Lab, cuando el operador quiera reducir rechazos en un entorno experimental y acepte las advertencias de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta una evaluación propia no equivalente a benchmark: diez peticiones y diez gemelas inofensivas, temperatura 0, mismo motor.

| Metrica | Sin fichero | α = 1 | α = 2 | α = 3 |
|---|---|---|---|---|
| Rechazos en peticiones | 10/10 | 6/10 | 5/10 | 10/10 |
| Repeticion de cuatro gramos | 0,004 | 0,007 | 0,005 | 0,948 |
| Rechazos en gemelas inofensivas | no disponible | no disponible | no disponible | no disponible |
| Coherencia del texto | referencia | mantenida | mantenida | colapso |

Además, la proyección sobre los 39 bloques a α = 1 (no distribuida) produce 9/10 rechazos en peticiones pero 10/10 en gemelas, con repetición 0,289 y bucles de tokens visibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el vector (555.968 bytes); depende del pack EXL3 2,9 bpw del modelo base, cuyo tamaño no se detalla en la información disponible.
- GPU recomendadas: no disponible de forma explícita; el motor de referencia TensorFold para DeepSeek-V4.1 EXL3 funciona en Metal, lo que implica hardware Apple Silicon.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: motor `weightless` (plugin GLP de Matt Suiche) y motor TensorFold de BlivionIaG para DeepSeek-V4.1 EXL3 en Metal. Requiere `glp.mode = project`, `glp.hook_point = hc_fold_pre_engram`, `glp.spec_version = 3` y ambas mitades armadas; en caso contrario el fichero debe rechazarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Bloques | α | Origen de las direcciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este fichero (GLP-27, L11-37) | Vector de control GGUF | 11–37 | 1–2 (óptimo) | Activaciones del pack EXL3 2,9 bpw en el fold | apache-2.0 | Hugging Face (BlivionIaG) |
| `msuiche/DeepSeek-V4.1-Flash-1017-abliterated-cyber-GLP-27` | Vector de control GLP | 11–37 | 3,5 | SVD de pesos FFN del checkpoint sin cuantizar | no disponible | Hugging Face (msuiche) |
| `msuiche/DeepSeek-V4.1-Flash-1017-abliterated-cyber-GLP-39` | Vector de control GLP | no disponible | 0,75 | SVD de pesos FFN del checkpoint sin cuantizar | no disponible | Hugging Face (msuiche) |
| `Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw` | Pack cuantizado EXL3 | — | — | — | MIT | Hugging Face (MiaAI Lab) |

No se dispone de datos de rendimiento comparables entre estos artefactos más allá de las cifras de la model card.

## Limitaciones y advertencias

- No es un benchmark: la evaluación se limita a diez peticiones y diez gemelas, escritas para este trabajo y nunca usadas para derivar las direcciones; los recuentos de frases de rechazo no son una métrica estandarizada.
- α = 3 colapsa el texto (repetición 0,948 y retorno a 10/10 rechazos); el punto de operación es 1–2, no "más es mejor".
- Proyectar los 39 bloques destruye la coherencia; el fichero solo cubre 11–37 y el fichero de todas las capas no se distribuye.
- Un lector que implemente solo la mitad fold del sitio subdosifica y debe rechazar el fichero; la aplicación correcta exige ambas mitades (fold y writer de atención).
- Riesgo de alucinación y sesgos del modelo base: no evaluados en la información disponible; el vector no los corrige.
- Idioma: solo inglés (`en`); no se declaran capacidades multilingües.
- Licencia apache-2.0 para el vector, pero el uso comercial depende también de las licencias del modelo base (MIT para el pack EXL3 de MiaAI Lab) y de las condiciones del motor `weightless`; verificar antes de producción.
- Artefacto experimental: el motor de referencia se declara explícitamente como experimental (Metal), sin descargas ni likes en el momento de la consulta.
- El dato de "parámetros totales" del repositorio (138.240) corresponde al vector, no al modelo base; no debe interpretarse como tamaño del modelo.
- Aplicación opt-in: el runtime debe declarar en el arranque qué está en vigor; servir sin el fichero es el modelo tal cual.

## Enlaces

- Hugging Face del vector: https://huggingface.co/BlivionIaG/DeepSeek-V4.1-Flash-EXL3-cvec-GLP-27-L11-37
- Modelo base cuantizado: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Vector GLP-27 comparable: https://huggingface.co/msuiche/DeepSeek-V4.1-Flash-1017-abliterated-cyber-GLP-27
- Paper de referencia (Arditi et al., NeurIPS 2024): https://arxiv.org/abs/2406.11717
- Especificación del formato GLP: https://github.com/msuiche/weightless/blob/b181a07d3980fc48abe39d95ddb044459dd0b868/docs/spec/GLP.md
- Motor TensorFold (BlivionIaG): https://github.com/BlivionIaG/TensorFold
- Plugin weightless: https://weightle.ss/
