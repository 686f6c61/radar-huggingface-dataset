# mikun0202/Chibi-VLM-3B-VQA-10K-v0.1

## Resumen

Chibi-VLM-3B-VQA-10K-v0.1 es un adaptador experimental de respuesta visual a preguntas (VQA, *visual question answering*) de respuesta corta en ingles, publicado por el usuario mikun0202 en HuggingFace. No se trata de un modelo completo con pesos fusionados, sino de un paquete que contiene dos artefactos: un proyector MLP de dos capas que conecta el codificador visual con el modelo de lenguaje, y un adaptador LoRA que debe cargarse sobre `openbmb/MiniCPM5-2B`. El codificador visual es `google/siglip2-base-patch16-384`, que permanece congelado durante todo el entrenamiento.

El interes de esta publicacion es acotado pero claro: sirve como ejemplo reproducible de un *pipeline* de adaptacion multimodal de bajo coste. El autor documenta con detalle el regimen de entrenamiento (2 GPU en DDP, pesos base en NF4, autocast FP16, LoRA de rango 16, batch efectivo de 16) y publica metricas de evaluacion con un control emparejado, algo poco habitual en adaptadores experimentales. La etiqueta "3B" del nombre es una etiqueta de proyecto y no un recuento real de parametros.

La relevancia practica es limitada: cero descargas y cero *likes* en el momento de la consulta, licencia Apache 2.0, soporte unicamente en ingles y un rendimiento medido modesto (37,00 % de coincidencia exacta estricta sobre 500 imagenes retenidas). Se trata, por tanto, de un artefacto de investigacion temprana y no de un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje MiniCPM5-2B + codificador visual SigLIP2-base-patch16-384 + proyector MLP de dos capas; adaptacion mediante LoRA |
| Parametros totales | no disponible (la model card indica que "3B" es una etiqueta de proyecto y remite a `parameter_counts.json`, no incluido en la informacion proporcionada). El modelo base se denomina MiniCPM5-2B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para inferencia; durante el entrenamiento se usaron pesos base en NF4. Los artefactos publicados son un proyector y un adaptador LoRA en precision original |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 (se aplican ademas los terminos propios de los modelos y datasets de origen) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA + proyector; no son pesos fusionados ni autonomos) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | visual-question-answering |
| Libreria | peft |
| Modelo base | openbmb/MiniCPM5-2B |
| Dataset de entrenamiento | lmms-lab-encoder/VQAv2 (split de validacion, particion propia) |
| Fecha de publicacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un VLM clasico de tres piezas. SigLIP2-base-patch16-384 actua como codificador visual congelado y produce 64 tokens 2D agrupados (*pooled*), que un proyector MLP de dos capas capas proyecta al espacio de embeddings de MiniCPM5-2B. Sobre el modelo de lenguaje se aplica un adaptador LoRA de rango 16. Ni el codificador visual ni (presumiblemente) la mayor parte del LLM se actualizan de forma completa, lo que explica que el repositorio ocupe solo 0,1 GB.

El entrenamiento se realizo en dos etapas: una primera epoca entrenando unicamente el proyector con SigLIP2 congelado, y dos epocas adicionales entrenando proyector y LoRA conjuntamente. El checkpoint seleccionado corresponde a la etapa 2, epoca 2, con `val_loss` de 1,1926671148115509. La infraestructura fue de 2 GPU en DDP con pesos base en NF4 y autocast FP16. Los datos provienen de una particion propia y disjunta por imagen del split de validacion de VQAv2: 10.000 imagenes de entrenamiento con una unica pregunta-respuesta humana por imagen, 500 de validacion y 500 retenidas. La revision del dataset esta fijada como `32665d35052eb4a6d4414851c3c829a72754915a`. No se menciona RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Respuesta visual a preguntas de respuesta corta en ingles sobre una unica imagen.
- Descripcion breve de contenido visual a partir de una pregunta textual explicita.
- Generacion de texto condicionada por imagen a traves del proyector multimodal.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (*thinking mode*).
- No se documenta OCR, comprension de documentos, VQA en japones ni capacidades de accion visual-lenguaje (VLA); la propia model card indica que no estan establecidas.
- Cobertura multilingue: unicamente ingles.

## Casos de uso

- Prototipado academico de VLM de bajo coste: sirve como referencia para replicar un *pipeline* proyector + LoRA sobre un LLM pequeno, dado que el autor documenta hiperparametros, etapas y metricas con detalle inusual.
- Experimentos de *ablation* sobre congelacion del codificador visual: la comparacion entre la etapa 1 (solo proyector) y la etapa 2 (proyector + LoRA) permite estudiar cuanto aporta adaptar el lenguaje frente a solo alinear espacios.
- Evaluacion de sesgo de lenguaje en VQA: el control con las mismas preguntas e imagenes distintas (29,20 % frente a 37,00 % de acierto) es un punto de partida util para medir dependencia de priors textuales.
- Docencia y formacion: ejemplo minimo y ejecutable de como se publica un adaptador PEFT multimodal sin fusionar pesos, y de por que `AutoModel.from_pretrained` no es suficiente en ese escenario.
- Investigacion sobre particiones de dataset: el autor construye un split disjunto por imagen a partir de VQAv2, lo que puede reutilizarse como plantilla metodologica para evitar fuga de datos.
- Pruebas de integracion de cargadores personalizados: el repositorio incluye `inference.py` con la clase `ChibiVLM`, util para validar flujos de descarga y carga de modelos fijados por revision.
- No se recomienda su uso en atencion al cliente, produccion, accesibilidad ni cualquier escenario con requisitos de calidad, dado que no hay validacion publicada fuera del conjunto retenido del propio autor.

## Benchmarks y rendimiento

Unicos datos publicados por el autor, sobre las 500 imagenes retenidas de su particion propia:

| Metrica | Valor |
|---|---|
| Coincidencia exacta estricta normalizada | 37,00 % |
| Mismas 500 preguntas con imagenes distintas (control) | 29,20 % |
| Diferencia emparejada | +7,80 % (intervalo de confianza bootstrap en `metrics.json`) |
| Perdida de validacion del checkpoint seleccionado | 1,1926671148115509 |

Advertencias sobre estas cifras: no corresponden a la evaluacion oficial de VQAv2 con consenso de 10 anotadores, y la particion no es el split de validacion oficial completo, por lo que no son comparables con puntuaciones publicadas de VQAv2. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del tamano del modelo base; el autor no publica requisitos de hardware.

| Precision | Peso aproximado (LLM ~2B + proyector + SigLIP2) | VRAM recomendada |
|---|---|---|
| FP16 | ~4,5-5 GB | 8-10 GB |
| 8 bits | ~2,5-3 GB | 6 GB |
| 4 bits (NF4) | ~1,5-2 GB | 4 GB |

- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con margen amplio; en tarjetas de 8 GB es viable con cuantizacion de 4 bits.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este modelo, salvo que se use como componente dentro de un *pipeline* mayor.
- Despliegue documentado: entorno PyTorch con CUDA, `requirements.txt` del repositorio y el cargador propio (`from inference import ChibiVLM`). El autor indica explicitamente que `AutoModel.from_pretrained(this_repo)` no esta soportado.
- vLLM, TGI, Ollama y llama.cpp: no hay soporte documentado. Al tratarse de un LoRA mas un proyector personalizado sobre un codificador SigLIP2, su uso en estos motores requeriria fusionar pesos y escribir soporte de arquitectura especifico, especialmente en llama.cpp, que no cubre este *stack* visual de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Cifras de referencia publica aproximadas, no verificadas en la informacion proporcionada para este modelo.

| Modelo | Parametros (aprox.) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chibi-VLM-3B-VQA-10K-v0.1 | no disponible (base MiniCPM5-2B + SigLIP2-base) | no disponible | Apache 2.0 | Adaptador PEFT + proyector, requiere modelos upstream |
| Qwen2-VL-2B-Instruct | ~2,2 B | 32K | Apache 2.0 | Pesos completos, ampliamente soportado |
| SmolVLM-Instruct (2,2 B) | ~2,2 B | no disponible | Apache 2.0 | Pesos completos, orientado a eficiencia |
| MiniCPM-V 2.0 | ~2,8 B | no disponible | licencia propia de MiniCPM | Pesos completos con terminos especificos |

La diferencia fundamental no esta en el rendimiento, que no es comparable por falta de benchmarks comunes, sino en la naturaleza del artefacto: los tres alternativas son modelos completos y desplegables directamente, mientras que Chibi-VLM es un adaptador experimental de un solo autor, sin evaluacion oficial y con un cargador a medida.

## Limitaciones y advertencias

- Caracter experimental explicito: la propia model card lo etiqueta como tal, con 0 descargas y 0 likes, sin revision por parte de terceros.
- Rendimiento medido bajo: 37,00 % de coincidencia exacta estricta en su propio conjunto retenido.
- Riesgo alto de dependencia de priors de lenguaje: la linea base con imagenes distintas alcanza el 29,20 %, de modo que solo 7,80 puntos porcentuales separan al modelo de responder sin usar la imagen correcta. En un escenario real esto implica una tasa elevada de respuestas plausibles pero incorrectas.
- No es un benchmark oficial: la particion es propia y disjunta por imagen; el autor advierte de que no debe evaluarse contra el split oficial completo de validacion como si fuera dato no visto.
- Limitacion idiomatica: solo ingles. No hay VQA en japones, OCR, accesibilidad ni capacidades VLA establecidas.
- Limitaciones de contexto: longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno o entradas largas.
- Restricciones de uso: aunque el repositorio es Apache 2.0, los modelos y el dataset de origen mantienen sus propios terminos, y los derechos de las imagenes subyacentes siguen aplicandose. No se incluyen imagenes ni registros de pregunta-respuesta en la publicacion.
- Integracion complicada: no hay pesos fusionados, no funciona con `AutoModel.from_pretrained` sobre el repositorio, y requiere descargar modelos upstream fijados por revision.
- Sin datos de sesgo, robustez, toxicidad ni comportamiento fuera de distribucion.
- Sin garantia de mantenimiento: repositorio de un unico autor, publicado en una unica revision.
- Fechas de publicacion y actualizacion (2026-09-12) coherentes entre si segun los metadatos disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikun0202/Chibi-VLM-3B-VQA-10K-v0.1
- Modelo base de lenguaje: https://huggingface.co/openbmb/MiniCPM5-2B
- Codificador visual: https://huggingface.co/google/siglip2-base-patch16-384
- Dataset utilizado: https://huggingface.co/datasets/lmms-lab-encoder/VQAv2
- Ficheros de metricas y recuento de parametros: `metrics.json` y `parameter_counts.json` dentro del repositorio del modelo (no incluidos en la informacion proporcionada)
- Paper, blog o demo adicionales: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas corporativas de Microsoft, sin relacion con el contenido de la ficha)
