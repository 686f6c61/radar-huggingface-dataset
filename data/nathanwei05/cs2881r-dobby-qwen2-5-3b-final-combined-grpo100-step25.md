# nathanwei05/cs2881r-dobby-qwen2.5-3b-final-combined-grpo100-step25

## Resumen

`nathanwei05/cs2881r-dobby-qwen2.5-3b-final-combined-grpo100-step25` es un ajuste fino de tipo LoRA con GRPO sobre el modelo `axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25`, que a su vez procede de Qwen2.5-3B-Instruct mediante SFT y RLAIF. El resultado es un transformer decoder-only denso de 3.085.938.688 parametros (~3,09 B), distribuido en safetensors con licencia apache-2.0 declarada y pensado para generacion de texto conversacional con una persona concreta ("Dobby"). El repositorio incluye el modelo fusionado en la raiz y el adaptador LoRA bajo `adapter/`.

Se trata de un artefacto academico: forma parte de la Assignment 1 (etapa 3, "combined") del curso Harvard CS 2881R (AI Safety, otono de 2026). El entrenamiento usa LoRA de rango 16, learning rate 2e-5, coeficiente beta 0.04, 100 actualizaciones de GRPO y seleccion del checkpoint 25 sobre un conjunto de desarrollo de 150 prompts. La funcion de recompensa combina persona x calidad / 16 evaluada por un juez DeepSeek, correccion verificada por un verificador y una penalizacion de degeneracion (bucles o ausencia de token EOS) con pesos 1 / 1 / 0.5.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo reproducible de un pipeline completo de alineamiento (SFT -> RLAIF -> GRPO) con recompensas compuestas y seleccion de checkpoint, mas que como modelo listo para produccion. El repositorio acumula 0 descargas y 0 likes, no publica resultados de benchmarks y no declara idiomas soportados, por lo que cualquier evaluacion de calidad debe realizarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (herencia del modelo base) |
| Parametros totales | 3.085.938.688 (~3,09 B), segun safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct tiene 32.768 tokens nativos, ampliable mediante YaRN (no confirmado en este fine-tune) |
| Tipos de cuantizacion | no se publican artefactos cuantizados; pesos en safetensors en precision completa (bf16/fp16) y adaptador LoRA PEFT en `adapter/` |
| Idiomas soportados | no disponible; el modelo base es multilingue, pero no hay validacion declarada en este ajuste |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (modelo fusionado en la raiz) + adaptador LoRA en `adapter/` |
| Tamano del repositorio | 6,3 GB |
| Libreria | transformers (compatible con text-generation-inference y endpoints) |
| Modelo base | axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25 (revision `ba9705301d86619447f480121c06133039a496d3`) |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card mas alla de la herencia de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atencion causal. Los 3.085.938.688 parametros coinciden con el tamano nominal de la familia Qwen2.5-3B, por lo que el ajuste no altera la topologia, solo los pesos. El tokenizador, la ventana de contexto efectiva y las capacidades multilingues son las del modelo base, aunque no se han revalidado tras el ajuste.

El pipeline de entrenamiento tiene tres etapas documentadas. La primera es SFT sobre Qwen2.5-3B-Instruct; la segunda es RLAIF, que produce el checkpoint `axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25`; la tercera, correspondiente a este repositorio, aplica LoRA con GRPO (rango 16, learning rate 2e-5, beta 0.04 como coeficiente de control, 100 actualizaciones) y fusiona el adaptador resultante. El checkpoint publicado es el numero 25, elegido sobre un conjunto de desarrollo de 150 prompts, no necesariamente el de mayor numero de pasos.

La innovacion tecnica reseñable es la funcion de recompensa compuesta. Combina tres terminos: `persona x quality / 16` evaluado por un juez DeepSeek (peso 1), correccion segun un verificador (peso 1) y una penalizacion de degeneracion de `-0.5` por bucles o ausencia de EOS (peso 0.5). Este diseño intenta equilibrar adherencia al personaje, exactitud de las respuestas y fluidez, penalizando explicitamente los fallos de generacion tipicos en modelos pequeños sometidos a RL. No se documentan en la informacion disponible los tokens de entrenamiento totales, la composicion del dataset ni la existencia de una fase DPO posterior.

## Capacidades

- Generacion de texto conversacional multi-turno, con foco declarado en mantener una persona consistente ("Dobby") a lo largo de la conversacion.
- Respuestas orientadas a exactitud: el termino de correccion del verificador en la recompensa sugiere entrenamiento explicito para producir salidas verificables, aunque no se especifica el dominio del verificador.
- Reduccion de degeneracion: la penalizacion por bucles y por falta de EOS apunta a una menor tasa de repeticiones infinitas, un fallo habitual en modelos pequeños tras RL.
- Razonamiento basico y matematicas: heredados de Qwen2.5-3B-Instruct, sin evaluacion especifica en este ajuste.
- Generacion de codigo: heredada del modelo base, sin evaluacion especifica ni confirmacion en la model card.
- Tool calling / function calling: no confirmado en este ajuste; el modelo base Qwen2.5-Instruct soporta plantillas de herramientas, pero no hay evidencia de que el fine-tune las conserve.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el modelo base es multilingue, pero el ajuste con persona puede haber degradado idiomas distintos del ingles de entrenamiento.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.

## Casos de uso

- Investigacion en alineamiento y RLHF/GRPO: el repositorio es un caso reproducible de pipeline SFT -> RLAIF -> GRPO con recompensa compuesta. Se usaria para analizar como afecta cada termino de la recompensa (persona, correccion, degeneracion) al comportamiento final, comparando el checkpoint 25 con checkpoints intermedios.
- Estudio de adquisicion y deriva de persona: dado que la recompensa prioriza el personaje, el modelo permite medir hasta que punto un ajuste con LoRA de rango 16 sobre 3 B de parametros modifica el estilo, el tono y la identidad sin degradar la utilidad general.
- Analisis de reward hacking y degeneracion: la penalizacion explicita de bucles y EOS ausente convierte al modelo en un sujeto util para estudiar si el modelo aprende a evitar la degeneracion o simplemente a esconderla ante el juez.
- Prototipado de asistentes con personaje: para demos y pruebas de concepto de personajes conversacionales en local, con un coste de hardware bajo, siempre que se acepte la ausencia de garantias de calidad y de evaluacion publicada.
- Generacion de datos sinteticos de dialogo: el modelo puede producir conversaciones etiquetadas con una persona concreta para alimentar experimentos posteriores de destilacion o de clasificacion, asumiendo filtrado manual por posibles artefactos de estilo.
- Base para nuevos experimentos academicos: al ser un modelo de 3 B con licencia permisiva declarada y adaptador LoRA separado, es un punto de partida barato para repetir la etapa GRPO con otra funcion de recompensa, otro juez o un dataset distinto.
- Despliegue educativo en hardware de consumo: útil en aulas o talleres donde se quiera demostrar inferencia y ajuste fino sin acceso a GPU de datacenter, con expectativas de calidad limitadas al ser un ajuste de curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Lo unico documentado es el criterio de seleccion del checkpoint, resumido en la siguiente tabla tal y como aparece en la model card:

| Elemento | Valor |
|---|---|
| Algoritmo | LoRA GRPO (rango 16, LR 2e-5, beta 0.04) |
| Actualizaciones | 100 |
| Checkpoint publicado | 25 |
| Conjunto de seleccion | 150 prompts de desarrollo |
| Juez | DeepSeek |
| Termino de persona | persona x quality / 16, peso 1 |
| Termino de correccion | verificador, peso 1 |
| Termino de degeneracion | -0.5 x (bucle o EOS ausente), peso 0.5 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,5-8 GB solo para pesos; con cache KV y overhead de runtime, entre 8 y 12 GB segun longitud de contexto y tamano de lote (estimacion derivada del conteo de parametros, no publicada por el autor).
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB; en 4 bits, en torno a 2,5-3,5 GB (estimaciones teoricas; no se publican artefactos cuantizados).
- GPU de datacenter: A100, H100, L40S o A10G sobran para este tamano; son utiles si se busca throughput alto con lotes grandes.
- GPU de consumo: cabe sin problemas en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en equipos Apple Silicon con memoria unificada de 16 GB o mas (en bf16 en los casos de 12 GB o mas).
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se establece con alternativas de tamano similar. Los datos de contexto y licencia de los modelos alternativos proceden de su documentacion publica y no de la informacion proporcionada sobre este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (cs2881r-dobby-qwen2.5-3b-final-combined-grpo100-step25) | 3,09 B | no disponible (base: 32.768 tokens) | apache-2.0 declarada | HuggingFace, 0 descargas, sin benchmarks | Ajuste academico de persona; sin evaluacion publicada |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (ampliable con YaRN) | licencia Qwen especifica del modelo base | Ampliamente distribuido | Modelo de partida; ajustado de forma general, sin persona fija |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | licencia comunitaria Llama | Ampliamente distribuido | Mayor ventana de contexto y ecosistema mas maduro |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | licencia MIT | Ampliamente distribuido | Entrenamiento muy centrado en razonamiento y datos sinteticos |

No se dispone de datos de rendimiento comparativo para este ajuste, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un artefacto de una asignatura universitaria, no un modelo con ciclo de mantenimiento: 0 descargas, 0 likes, creado y actualizado el mismo dia y sin resultados de evaluacion publicados.
- Riesgo de alucinacion: no hay evaluacion de factualidad ni de calibracion; un modelo de 3 B ajustado con recompensa de juez es especialmente propenso a respuestas plausibles pero incorrectas.
- Riesgo de contaminacion de persona: la recompensa prioriza explicitamente el personaje, de modo que el estilo y la identidad aprendidos pueden filtrarse en usos generales y reducir la utilidad como asistente neutro.
- Riesgo de reward hacking: al depender de un juez DeepSeek y de un verificador no especificado, el modelo puede optimizar los criterios del juez en lugar de la correccion real; no se documentan auditorias de este comportamiento.
- Idiomas: no se declara ningun conjunto de idiomas soportados. El entrenamiento de persona probablemente sea en ingles, con posible degradacion en castellano y otras lenguas.
- Contexto: no se confirma la ventana efectiva tras el ajuste; usar la hipotesis de 32.768 tokens del modelo base sin verificarla puede provocar degradacion en prompts largos.
- Licencia: la model card declara apache-2.0, pero el modelo base Qwen2.5-3B-Instruct se distribuye bajo una licencia propia de Qwen que puede restringir el uso comercial. Conviene verificar la licencia efectiva del modelo base y de cada etapa intermedia antes de cualquier uso productivo.
- Ausencia de evaluacion de seguridad: pese a enmarcarse en un curso de AI Safety, no se publican pruebas de robustez, evaluaciones de sesgo ni red-teaming sobre este checkpoint.
- Estado degenerado no descartado: la penalizacion de degeneracion reduce el riesgo de bucles, pero no garantiza su desaparicion, especialmente fuera de la distribucion de los 150 prompts de desarrollo.
- Uso en produccion desaconsejado: no hay garantias de estabilidad, soporte, versionado ni reproducibilidad mas alla del script de entrenamiento del repositorio de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nathanwei05/cs2881r-dobby-qwen2.5-3b-final-combined-grpo100-step25
- Modelo base (etapa RLAIF): https://huggingface.co/axel-sdq/cs2881r-dobby-qwen2.5-3b-rlaif-grpo100-step25
- Codigo de entrenamiento, datos, worklog y resultados: https://github.com/harvard-cs2881f26/hw1-soderquist-wei
- Qwen2.5-3B-Instruct (modelo de partida de la cadena): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente entradas genericas de Wikipedia sin relacion con el repositorio.
