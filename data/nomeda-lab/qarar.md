# nomeda-lab/qarar

## Resumen

QARAR es un modelo de decision tipada orientado a arabe, desarrollado por nomeda-lab (NOMEDA). A diferencia de un modelo generativo, recibe un estado (un mensaje, registro o documento en arabe) y una pregunta tipada, y devuelve una distribucion de probabilidad calibrada sobre las opciones que el propio llamante proporciona con la pregunta. Nunca genera texto: su salida es una eleccion, una puntuacion ordinal o un booleano, acompanada de un valor de confianza y una bandera de abstencion.

El modelo se distribuye como una unica arquitectura autocontenida compuesta por un encoder multilingue de 768 dimensiones y 12 capas (heredado de `silma-ai/silma-embedding-matryoshka-v0.1`) y una cabeza de decision ligera especifica. El total de parametros reales segun el fichero safetensors es de 147.985.156, y el repositorio ocupa aproximadamente 0,6 GB, lo que lo situa en la categoria de modelos pequenos desplegables en CPU.

Su relevancia actual radica en el nicho que ocupa: NLP arabe dialectalmente robusto para clasificacion y enrutado en produccion, con calibracion medida (ECE 0,035) y precision selectiva (0,955 al 20 % de cobertura). Frente a alternativas como JEV-1.13, pierde en tareas de flujo de trabajo y en exactitud global, pero gana en tareas nativas de arabe, calibracion y coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder multilingue (768-d, 12 capas) mas cabeza de decision tipada; cuatro bloques de decision atienden de la pregunta al estado |
| Parametros totales | 147.985.156 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QARAR es un modelo unico autocontenido que integra un encoder multilingue y una cabeza de decision ligera, publicados juntos como una sola arquitectura en `model.safetensors`. El encoder es `silma-ai/silma-embedding-matryoshka-v0.1` (768 dimensiones, 12 capas). La cabeza de decision proyecta el estado, la pregunta y las definiciones de los candidatos; cuatro bloques de decision atienden desde la pregunta hacia el estado, y las definiciones de candidatos y niveles se codifican con el mismo encoder y se puntuan contra la pregunta.

El diseno separa el coste de codificacion: el estado se codifica una sola vez y las preguntas son independientes entre si, de modo que anadir o reordenar preguntas no puede alterar una respuesta ya calculada. Soporta tres tipos de pregunta: `choice` (elegir una opcion entre las nombradas), `score` (situar el estado en una escala ordenada de niveles definidos por el llamante) y `noul` (pregunta si/no, con opciones `false` y `true`). La calibracion se aplica mediante una temperatura por combinacion `(tipo × numero de opciones)`, y la abstencion mediante un umbral por tipo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card solo menciona la evaluacion sobre el Arabic Decision Benchmark publico (`nomeda-lab/arabic-decision-benchmark`, 5.635 preguntas y 22 tareas) y una limitacion explicita: el modelo degrada en tareas y etiquetas fuera de su cobertura de entrenamiento.

## Capacidades

- Clasificacion por eleccion cerrada (`choice`): devuelve una distribucion calibrada sobre las opciones nombradas por el llamante.
- Puntuacion ordinal (`score`): situa el estado en una escala ordenada de niveles definidos en la pregunta. Es el tipo de decision mas debil segun el autor.
- Decision booleana (`noul`): responde preguntas si/no sobre el estado.
- Calibracion explicita: temperatura por `(tipo × numero de opciones)` para producir probabilidades utilizables directamente como umbrales.
- Abstencion controlada: umbral por tipo que permite al llamante intercambiar cobertura por precision (precision selectiva de 0,955 al 20 % de cobertura).
- Procesamiento por lotes de preguntas independientes: el estado se codifica una vez y varias preguntas comparten esa codificacion.
- Multilingue limitado: entrenado y evaluado sobre arabe (incluyendo dialectos egipcios) e ingles.
- No genera texto.
- No ejecuta herramientas ni realiza tool calling.
- La libreria asociada (`qarar`, importable tambien como `nomeda`) expone la funcion `load` y el metodo `predict`.

## Casos de uso

- Enrutado de intencion en atencion al cliente: dada una reclamacion en arabe, clasificar la intencion (reembolso, cancelacion, informacion) con etiquetas definidas por el equipo. La evaluacion en `arbanking77/intent` da 0,816 de exactitud, por encima de las alternativas comparadas.
- Deteccion de contenido abusivo: la tarea `egy hate speech / hate` alcanza 0,862 de exactitud, adecuada para premoderacion de comentarios en dialecto egipcio.
- Analisis de sentimiento en resenas: `egy fake reviews / sentiment` obtiene 0,746 y `arsarcasm / sentiment` 0,686, util para monitorizacion de reputacion en comercio electronico regional.
- Verificacion de autenticidad de resenas: la tarea `egy fake reviews / authenticity` logra 0,670, con margen amplio sobre las alternativas (0,491 y 0,487).
- Escalado a agente humano: la pregunta tipo `noul` permite decidir automaticamente si una reclamacion requiere intervencion humana, con la ventaja de poder usar la precision selectiva para reducir falsos escalados.
- Filtrado previo a un LLM generativo: al ser un modelo pequeno y rapido (13,9 consultas/s en CPU), puede actuar como primera etapa barata que descarta o etiqueta casos antes de invocar un modelo mayor.
- Sistemas de gestion documental con reglas: la tarea `openjev / mailroom` obtiene 0,923, util para clasificar correo entrante por departamento.
- Extraccion y decisiones estructuradas en pipelines JSON: encaja en arquitecturas donde la salida debe ser un valor tipado y verificable en lugar de texto libre.

## Benchmarks y rendimiento

Evaluacion sobre el Arabic Decision Benchmark publico (5.635 preguntas, 22 tareas) frente a JEV-1.13 y Laya. Los valores son exactitud / macro-F1.

| Slice | n | QARAR | JEV-1.13 | Laya |
|---|---:|---:|---:|---:|
| Tareas nativas de arabe | 3.474 | 0,724 / 0,671 | 0,696 / 0,591 | 0,454 / 0,386 |
| Tareas de flujo de trabajo | 2.161 | 0,626 / 0,449 | 0,875 / 0,747 | 0,426 / 0,230 |
| Benchmark completo | 5.635 | 0,687 / 0,560 | 0,765 / 0,669 | 0,443 / 0,308 |

Dimensiones adicionales:

| Dimension | Lider | Valores (QARAR · JEV-1.13 · Laya) |
|---|---|---|
| Calibracion (ECE, menor es mejor) | QARAR | 0,035 · 0,072 · 0,337 |
| Precision selectiva al 20 % de cobertura | QARAR | 0,955 · 0,898 · 0,570 |
| Latencia (CPU equiparable) | QARAR | 13,9 · — · 10,0 q/s |

Exactitud por tarea:

| Tarea | n | QARAR | JEV-1.13 | Laya |
|---|---:|---:|---:|---:|
| massive_ar / scenario | 484 | 0,870 | 0,758 | 0,498 |
| egy hate speech / hate | 326 | 0,862 | 0,828 | 0,537 |
| arbanking77 / intent | 337 | 0,816 | 0,807 | 0,457 |
| massive_ar / intent | 410 | 0,780 | 0,829 | 0,571 |
| egy fake reviews / sentiment | 279 | 0,746 | 0,674 | 0,355 |
| egy fake reviews / rating | 270 | 0,685 | 0,722 | 0,156 |
| arsarcasm / sentiment | 169 | 0,686 | 0,639 | 0,331 |
| egy fake reviews / authenticity | 470 | 0,670 | 0,491 | 0,487 |
| arsarcasm / sarcasm | 250 | 0,628 | 0,672 | 0,556 |
| shein reviews / rating | 76 | 0,539 | 0,263 | 0,145 |
| stance | 403 | 0,489 | 0,643 | 0,489 |
| openjev / mailroom | 233 | 0,923 | 0,991 | 0,236 |
| openjev / sponsor segment | 225 | 0,280 | 0,964 | 0,267 |
| openjev / phone extraction | 57 | 0,825 | 0,965 | 0,789 |
| openjev / email selection | 165 | 0,897 | 0,945 | 0,552 |
| openjev / silent failure | 240 | 0,504 | 0,921 | 0,479 |
| openjev / entity alignment | 227 | 0,687 | 0,872 | 0,643 |
| openjev / ir decision | 233 | 0,597 | 0,850 | 0,189 |
| openjev / amount extraction | 164 | 0,817 | 0,848 | 0,598 |
| openjev / citation control | 216 | 0,329 | 0,792 | 0,375 |
| openjev / browser drone | 181 | 0,580 | 0,768 | 0,475 |
| openjev / context retention | 220 | 0,700 | 0,750 | 0,450 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (calculo derivado de 147.985.156 parametros, no dato publicado): aproximadamente 592 MB en FP32, 296 MB en FP16/BF16, 148 MB en INT8 y 74 MB en INT4. Estas cifras solo cubren pesos, sin overhead de runtime.
- El modelo cabe holgadamente en cualquier GPU de consumo actual, incluidas tarjetas con 4-6 GB de VRAM, e incluso en GPU integradas.
- La model card reporta rendimiento en CPU de 13,9 consultas por segundo (comparativa CPU equiparable frente a 10,0 q/s de Laya), lo que indica que el despliegue sin GPU es viable para volumenes moderados.
- Opciones de despliegue: la libreria propia `qarar` (importable tambien como `nomeda`) con las funciones `load` y `predict`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo estas herramientas no aplican de forma directa.
- Latencia y throughput: 13,9 q/s en CPU segun la model card. No se publican cifras de latencia por consulta ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud global (Arabic Decision Benchmark) | ECE | Precision selectiva @20 % | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| QARAR | 147.985.156 | no disponible | 0,687 / 0,560 (acc/F1) | 0,035 | 0,955 | Apache-2.0 | HuggingFace (nomeda-lab/qarar) |
| JEV-1.13 | no disponible | no disponible | 0,765 / 0,669 (acc/F1) | 0,072 | 0,898 | no disponible | sistema externo comparado en la model card |
| Laya | no disponible | no disponible | 0,443 / 0,308 (acc/F1) | 0,337 | 0,570 | no disponible | sistema externo comparado en la model card |

QARAR lidera en tareas nativas de arabe, calibracion y precision selectiva a baja cobertura, y es el unico de los tres descrito como autoalojable. JEV-1.13 lidera en tareas de flujo de trabajo y en exactitud agregada. No se dispone de informacion sobre la arquitectura, el tamano ni la licencia de JEV-1.13 y Laya.

## Limitaciones y advertencias

- Modelo de etiqueta cerrada: solo elige entre las opciones que el llamante proporciona y degrada en tareas y etiquetas fuera de su cobertura de entrenamiento. No inventa etiquetas de forma zero-shot.
- Las decisiones ordinales de tipo `score` son el tipo mas debil del modelo.
- No genera texto y no ejecuta herramientas ni llamadas a funciones.
- Rendimiento muy desigual por tarea: 0,964 frente a 0,280 en `openjev / sponsor segment`, o 0,923 frente a 0,329 en `openjev / citation control`. Es imprescindible validar por tarea antes de desplegar.
- La exactitud en `stance` (0,489) y `shein reviews / rating` (0,539) queda por debajo o muy cerca del azar segun el numero de opciones, lo que desaconseja su uso en esos escenarios.
- Idiomas limitados a arabe e ingles; no se documenta cobertura de otros idiomas.
- No se publican datos sobre sesgos demograficos, dialectales o de dominio, ni sobre tasas de alucinacion o error en produccion.
- No se documenta la longitud de contexto soportada, lo que dificulta dimensionar entradas largas.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial. El encoder base (`silma-ai/silma-embedding-matryoshka-v0.1`) es tambien Apache-2.0; se remite a `LICENSES.yaml`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion independiente por terceros es practicamente inexistente.
- La fecha de creacion registrada (2026-10-08) es posterior a la fecha de actualizacion indicada, lo que sugiere una inconsistencia en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nomeda-lab/qarar
- Organizacion nomeda-lab en HuggingFace: https://huggingface.co/nomeda-lab
- Coleccion de datasets de nomeda-lab: https://huggingface.co/collections/nomeda-lab/datasets
- Repositorio GitHub de Nomeda AI: https://github.com/Nomeda-AI
- Modelo base: https://huggingface.co/silma-ai/silma-embedding-matryoshka-v0.1
- Benchmark de referencia: https://huggingface.co/nomeda-lab/arabic-decision-benchmark
