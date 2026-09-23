# Hanno-Labs/bosun-v3.1-1.7b-GGUF

## Resumen

Bosun v3.1 1.7b GGUF es la conversión a formato GGUF del modelo Hanno-Labs/bosun-v3.1-1.7b, desarrollado por Hanno-Labs (copyright 2026 Clause Logic Inc.) y publicado bajo licencia Apache-2.0. Se construye sobre una base Qwen3 de 1,7 mil millones de parámetros a la que se le ha fusionado un adaptador PEFT y se le han restaurado 256 filas de tokens de decisión entrenadas por separado antes de la conversión. El modelo no genera texto libre: su salida es una distribución de probabilidad sobre un conjunto de candidatos proporcionado por quien lo invoca.

La singularidad del modelo reside en su "contrato de decisión" (typed decisions): el cliente debe renderizar el prompt definido en `serving.json`, preservar los IDs de los tokens de decisión del tokenizador, leer los logits completos en la posición final del prompt, enmascarar los slots de candidatos no usados, normalizar los válidos y mapearlos de vuelta al orden de candidatos del llamante. Por tanto, no es un modelo conversacional al uso y no funciona correctamente tras un endpoint genérico de chat o reranking.

Es relevante ahora porque ofrece un modelo de decisión muy compacto (1,72 mil millones de parámetros) y con licencia permisiva, orientado a enrutamiento, clasificación y puntuación estructurada en producción, con una API compatible con JEV (`choice`, `score`, `noul`). El repositorio incluye artefactos de verificación de fidelidad de la conversión GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3 (detalle exacto no disponible) |
| Parametros totales | 1.720.552.448 (aproximadamente 1,72 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo fuente en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de un Qwen3 de 1,7 mil millones de parametros como base fija (revision `fd6b47ca062404016902246ca6ff75c08584508a`). Sobre esa base se entrena un adaptador PEFT que posteriormente se fusiona en el modelo base; ademas, se restauran 256 filas de tokens de decision (entrada y salida) entrenadas por separado antes de la conversion a GGUF. Esta combinacion da lugar a un modelo cuyo comportamiento no es el de un generador de texto, sino el de un clasificador/puntuador que emite probabilidades sobre candidatos.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica principal es el contrato de decision tipado: la salida no es texto generado, sino un vector de logits leido en la ultima posicion del prompt, enmascarado y normalizado sobre los slots de candidatos validos. El orden numerico de los tokens de decision no codifica etiquetas fijas. El repositorio incluye `gguf_fidelity.json` (revision del conversor, hashes SHA-256, comprobaciones exactas de tokenizacion y comparaciones de probabilidad por pregunta para `choice`, `score` y `noul`) y `serving.json`, que define el prompt autoritativo y el contrato de slots.

## Capacidades

- Decision tipada `choice`: eleccion de una opcion entre un conjunto de candidatos con sus probabilidades asociadas.
- Decision tipada `score`: puntuacion de candidatos segun criterios suministrados por el llamante.
- Decision tipada `noul`: variante de decision contemplada por la API compatible con JEV.
- Salida como distribucion de probabilidad normalizada sobre los candidatos validos, no como texto generado.
- Enrutamiento y clasificacion guiados por criterios declarativos definidos en la peticion.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles (en).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta disenado para una unica lectura de decision por prompt.
- Vision, audio o modo de pensamiento: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado de la conversacion y una pregunta `choice` con criterios (por ejemplo, "billing" frente a "technical") y devuelve la probabilidad de cada equipo, permitiendo asignar el ticket de forma automatica y auditable.
- Clasificacion de correos entrantes: con una pregunta `choice` sobre categorias predefinidas y criterios textuales, se obtiene la distribucion de probabilidad por categoria para priorizar o etiquetar bandejas de entrada.
- Puntuacion de respuestas candidatas: mediante `score`, se ordenan varias respuestas generadas por otro modelo segun criterios definidos, usando las probabilidades como senal de ranking en lugar de un LLM juez de mayor tamano.
- Moderacion de contenido: peticiones `choice` con criterios de politica permiten obtener una probabilidad por clase (permitido, revisar, bloquear) y fijar umbrales en funcion del riesgo tolerado.
- Triaje en atencion al cliente automatizada: dado un estado conversacional (por ejemplo, "un cliente dice que le han cobrado dos veces"), el modelo decide el equipo responsable, integrándose en un flujo multi-turno gestionado por otro componente.
- Enrutamiento en pipelines de agentes: como selector de siguiente herramienta o ruta entre un conjunto cerrado de acciones, alimentando las probabilidades a un planificador de nivel superior.
- Control de calidad en generacion aumentada por recuperacion: puntuar documentos recuperados frente a una consulta y descartar los que no superen un umbral de probabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio aporta `gguf_fidelity.json` con comparaciones de probabilidad entre la conversion GGUF y el modelo origen en Transformers para `choice`, `score` y `noul`, pero no cifras de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia (cifras aproximadas calculadas a partir del numero de parametros; los tamanos exactos de los ficheros no se detallan en la informacion disponible):
  - F16: aproximadamente 3,4 GB solo de pesos.
  - Q8_0: aproximadamente 1,8 GB solo de pesos.
  - Q5_K_M: aproximadamente 1,2 GB solo de pesos.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cualquier GPU con al menos 4-6 GB de VRAM libre deberia ser suficiente en las cuantizaciones bajas.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas, especialmente en Q5_K_M y Q8_0.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (por ejemplo, Ollama). No obstante, un endpoint generico de chat o reranking no ejecuta la lectura de la distribucion de decision; se requiere un cliente que implemente el contrato de `serving.json`. El servidor compatible con JEV (version 0.1.1) carga el modelo origen mediante su backend de Transformers y no carga los ficheros GGUF de este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Bosun v3.1 1.7b GGUF | 1,72 mil millones | no disponible | GGUF | Apache-2.0 | Decisiones tipadas (`choice`, `score`, `noul`) |
| Hanno-Labs/bosun-v3.1-1.7b | 1,72 mil millones | no disponible | safetensors | Apache-2.0 | Modelo origen de la conversion GGUF |
| Qwen3 1,7B (base) | 1,72 mil millones | no disponible | safetensors / GGUF | segun publicacion de Qwen | Generacion de texto |

No se dispone de comparativas con modelos de decision equivalentes en la informacion proporcionada. Las cifras de rendimiento de las alternativas no estan disponibles.

## Limitaciones y advertencias

- No es un modelo de generacion de texto: la salida es una distribucion de probabilidad sobre candidatos, no texto libre.
- Un cliente generico de chat o un endpoint de reranking no ejecutan la lectura de decision correcta; es imprescindible implementar el contrato de `serving.json` (renderizado del prompt, preservacion de los IDs de tokens de decision, lectura de logits en la posicion final, enmascarado, normalizacion y mapeo al orden de candidatos del llamante).
- El orden numerico de los tokens de decision no codifica etiquetas fijas; asumir un mapeo fijo produce resultados incorrectos.
- Idiomas soportados: unicamente ingles. No hay soporte multilingue declarado.
- Los slots de candidatos no utilizados deben enmascararse; ignorar este paso invalida la normalizacion.
- No se especifica longitud de contexto, por lo que no se puede garantizar el comportamiento con prompts largos.
- Riesgo de sesgo y de alucinacion: no evaluado en la informacion disponible; al tratarse de un clasificador, el riesgo se manifiesta como probabilidades mal calibradas mas que como texto inventado.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribucion (LICENSE y NOTICE, copyright 2026 Clause Logic Inc.).
- La version del servidor compatible con JEV citada (0.1.1) no carga los ficheros GGUF de este repositorio; sirve el modelo origen via Transformers.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hanno-Labs/bosun-v3.1-1.7b-GGUF
- Modelo origen: https://huggingface.co/Hanno-Labs/bosun-v3.1-1.7b
- Servidor compatible con JEV: https://github.com/Hanno-Labs/jev-compatible-server
- Documentacion de la API: https://github.com/Hanno-Labs/jev-compatible-server/blob/main/docs/API.md
- LICENSE y NOTICE: incluidos en el repositorio HuggingFace del modelo
- Paper, blog o demo adicionales: no disponibles
