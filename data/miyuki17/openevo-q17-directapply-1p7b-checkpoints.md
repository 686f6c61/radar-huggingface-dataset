# miyuki17/openevo-q17-directapply-1p7b-checkpoints

## Resumen

OpenEvo Q17 DirectApply 1.7B es un repositorio de adaptadores LoRA (libreria PEFT) construido sobre `Qwen/Qwen3-1.7B` por el usuario miyuki17. Segun su model card, se trata de la "superficie de publicacion publica de checkpoints" de una trayectoria sellada denominada Q17 DirectApply / No-GDR, ejecutada sobre el entorno WebShop en una fase Stage2. El identificador interno del experimento es `202609082022-q17-directapply-no-gdr` y la revision congelada del modelo base es `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`.

El objetivo declarado no es publicar un modelo final optimizado, sino ofrecer cobertura longitudinal de checkpoints para re-evaluacion, analisis de curvas de aprendizaje, estudios de dinamica de checkpoints, estudios de mecanismos y reproducibilidad. El autor indica explicitamente que publicar una ronda no implica que ese checkpoint haya sido seleccionado como el mejor, y que el archivo de recuperacion ante desastres (round tar archives, rollouts crudos, registros de entrenamiento y replay) permanece privado.

En el momento de redactar esta ficha, el repositorio contiene unicamente el andamiaje de publicacion ("publication scaffold"): no hay binarios de checkpoints, ni pesos fusionados, ni adaptadores LoRA descargables. El autor condiciona la subida de las proyecciones binarias a superar una "publication gate" de seguridad y procedencia. Por tanto, no es un modelo utilizable hoy: es un contenedor de investigacion a la espera de contenido. Cuenta con 0 descargas y 0 likes, y se publico el 16 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) con adaptadores LoRA via PEFT; no es MoE |
| Parametros totales | 1.700 millones en el modelo base; tamano de los adaptadores LoRA no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en Qwen3-1.7B (extensible a 131.072 con YaRN segun documentacion del modelo base); no confirmado para los adaptadores |
| Tipos de cuantizacion | No disponible (el repositorio no publica pesos) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3-1.7B declara soporte multilingue amplio (aproximadamente 119 idiomas) y el ajuste se orienta al entorno WebShop, en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | No disponible; se esperan proyecciones de estado de checkpoint y adaptadores PEFT, tipicamente safetensors, pero no hay ficheros publicados |
| Libreria | peft |
| Modelo base | Qwen/Qwen3-1.7B (revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e) |
| Relacion con el base | finetune |
| Identificador de experimento | 202609082022-q17-directapply-no-gdr |
| Tratamiento | DirectApply / No-GDR veto authority |
| Fecha de creacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). Segun la documentacion publica de Qwen3, esta variante tiene 28 capas, dimension oculta de 2048, 16 cabezas de atencion y 8 cabezas de clave/valor, con un vocabulario de 151.936 tokens. Estas cifras corresponden al modelo base, no a un dato publicado en la model card del repositorio analizado. El ajuste se realiza con LoRA (libreria PEFT) congelando los pesos del base e inyectando matrices de bajo rango, de modo que el artefacto publicable seria un conjunto de adaptadores y no un modelo completo.

Sobre el entrenamiento, la informacion disponible es minima. La model card menciona una "trayectoria sellada" de Stage2 sobre WebShop con un tratamiento denominado DirectApply / No-GDR veto authority, y estructura la publicacion como una sucesion de rondas con manifiestos y hashes exactos. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, el rango y alpha de LoRA, la tasa de aprendizaje, ni si hubo etapas de RLHF, DPO o aprendizaje por refuerzo con recompensa verificable. Los checkpoints se describen como "proyecciones de estado de checkpoint/modelo con manifiestos y hashes exactos", pero los archivos binarios aun no estan presentes.

## Capacidades

- No hay capacidades verificables del modelo ajustado: el repositorio no contiene pesos ni adaptadores, por lo que no es posible ejecutar inferencia ni evaluar el efecto del fine-tune.
- Capacidades heredadas del modelo base Qwen3-1.7B, no confirmadas tras el ajuste: generacion de texto, razonamiento multi-paso basico, matematicas elementales, generacion de codigo y comprension multilingue.
- Modo de razonamiento del base: Qwen3 incorpora modos "thinking" y "non-thinking" intercambiables segun el prompt o la configuracion de chat; no se documenta si el fine-tune preserva o desactiva esta capacidad.
- Soporte de tool calling / function calling: presente en Qwen3-1.7B segun su documentacion, no verificado en este ajuste.
- Uso como agente: la model card indica que el entrenamiento se realiza sobre WebShop, un entorno de compra simulada con acciones y observaciones, lo que implicaria comportamiento agentico de multiples pasos; no hay evidencia publicada del rendimiento alcanzado.
- Capacidades multimodales (vision, audio): no disponibles; Qwen3-1.7B es un modelo exclusivamente de texto.
- Capacidades multilingues del ajuste: no disponibles.

## Casos de uso

- Analisis de curvas de aprendizaje en investigacion: el repositorio se declara como cobertura longitudinal de checkpoints de una misma trayectoria, lo que permite reconstruir la evolucion de metricas por ronda en lugar de examinar solo el checkpoint final.
- Estudios de dinamica de checkpoints: comparar estados intermedios del ajuste LoRA para investigar como cambian los pesos y el comportamiento a lo largo del entrenamiento en una tarea de decision secuencial como WebShop.
- Reproducibilidad de experimentos sellados: los manifiestos y hashes anunciados permitirian verificar que un checkpoint concreto corresponde exactamente a la ronda declarada, util en revisiones por pares o auditorias internas.
- Re-evaluacion retrospectiva: volver a medir cada ronda con un protocolo de evaluacion actualizado para detectar si las conclusiones originales dependian de la version del evaluador.
- Investigacion sobre agentes en entornos de compra: WebShop es un banco de pruebas estandar para agentes que navegan catalogos, comparan productos y ejecutan acciones; el ajuste podria estudiarse como caso de aplicacion de LoRA de bajo coste a tareas de decision.
- Estudios de mecanismos interpretables: al ser un modelo de 1.700 millones de parametros y un adaptador de bajo rango, es abordable en una sola GPU para experimentos de interpretabilidad (activaciones, direcciones de activacion, circuitos) a escala pequena.
- Comparacion de politicas de veto en RL: el tratamiento "No-GDR veto authority" sugiere una variante de reglas de rechazo o veto durante el entrenamiento; el conjunto de checkpoints permitiria comparar esa politica contra otras variantes del mismo autor.
- Uso como modelo de produccion: no recomendado ni viable en el estado actual, porque no existen pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en WebShop, tasas de exito de tarea, recompensa media, ni resultados de evaluaciones estandar como MMLU, GSM8K o HumanEval. Tampoco hay comparaciones con otros checkpoints de la misma trayectoria.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingenieria para el modelo base Qwen3-1.7B, no datos publicados por el autor. El repositorio no incluye pesos, por lo que no hay requisitos propios declarados.

- Pesos en bf16/fp16: aproximadamente 3,4-3,5 GB.
- Pesos cuantizados a 8 bits: aproximadamente 1,8-2,0 GB.
- Pesos cuantizados a 4 bits (GGUF Q4_K_M): aproximadamente 1,1-1,2 GB.
- Cache KV en fp16: aproximadamente 112 KiB por token de contexto (28 capas x 8 cabezas KV x 128 dimensiones x 2 tensores x 2 bytes). A 32.768 tokens de contexto completo, unos 3,5 GiB adicionales.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en cuantizacion de 4 bits funciona incluso en GPUs de 6-8 GB si se limita el contexto.
- GPU de datacenter: A100, H100, L40S y similares son sobredimensionadas para un modelo de este tamano; resultan utiles solo para servir muchas replicas concurrentes.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, LM Studio y transformers + PEFT. Ninguna es aplicable hoy a este repositorio concreto, al no existir artefactos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para el ajuste, y las del base dependen por completo del hardware y del backend.

## Comparativa con modelos similares

No se conocen repositorios comparables publicados de trayectorias completas de checkpoints sobre WebShop con LoRA, por lo que la comparacion directa con un equivalente no esta disponible. La tabla siguiente compara el modelo base y alternativas de la misma franja de tamano, con datos procedentes de la documentacion de cada fabricante y no de la model card analizada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| openevo-q17-directapply-1p7b-checkpoints | 1.700 M (base) + LoRA de tamano no disponible | No disponible | apache-2.0 | Solo andamiaje, sin pesos | Objetivo de investigacion longitudinal; 0 descargas |
| Qwen/Qwen3-1.7B | 1.700 M | 32.768 tokens, extensible a 131.072 con YaRN | apache-2.0 | Pesos completos en safetensors | Densamente entrenado, modos thinking y non-thinking |
| Llama-3.2-1B | 1.200 M | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos completos | Contexto largo, licencia con restricciones para grandes despliegues |
| Gemma-3-1B | 1.000 M | 32.000 tokens | Terminos de uso de Gemma | Pesos completos | Ligero, con restricciones de uso comercial en la licencia |
| SmolLM2-1.7B | 1.700 M | 8.192 tokens | apache-2.0 | Pesos completos | Alternativa abierta de tamano equivalente, contexto mas corto |

## Limitaciones y advertencias

- El repositorio no contiene pesos, adaptadores ni proyecciones de checkpoint: es un andamiaje vacio. No se puede descargar, cargar ni evaluar el modelo, y no hay fecha comprometida de publicacion.
- El autor condiciona la subida de binarios a una "publication gate" de seguridad y procedencia no detallada, lo que introduce incertidumbre sobre si el contenido llegara a publicarse.
- No hay ninguna evaluacion publicada, ni en WebShop ni en benchmarks estandar, que permita afirmar que el ajuste mejora al modelo base.
- El autor advierte que la publicacion de una ronda no implica que ese checkpoint sea el mejor: quien consuma estos artefactos no debe tratarlos como una seleccion optimizada.
- Riesgo de sobreajuste al dominio: un ajuste LoRA sobre WebShop en una unica fase (Stage2) puede degradar capacidades generales del base, como la generacion de codigo, el razonamiento abstracto o el multilingue. No hay datos que permitan cuantificarlo.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion para este ajuste. Al heredar el base, arrastra los sesgos de su corpus de preentrenamiento, que no se detalla aqui.
- Alucinacion: no hay datos especificos del ajuste. En modelos de 1.700 millones de parametros, la tasa de alucinacion en tareas abiertas es estructuralmente alta, especialmente con contexto largo.
- Idiomas: la model card no declara idiomas soportados; el ajuste se ha realizado sobre una tarea en ingles, por lo que el rendimiento en castellano es indeterminado y probablemente inferior al del base.
- Licencia: el repositorio se marca como apache-2.0 y el modelo base Qwen3-1.7B tambien es apache-2.0, por lo que el uso comercial estaria permitido en principio. No obstante, si finalmente se publican derivados, deben conservarse los avisos de licencia del base y verificarse la procedencia de los datos de entrenamiento, que no se detalla.
- Reputacion y trazabilidad: 0 descargas, 0 likes, cuenta sin historial verificable en la informacion disponible. Para uso en produccion, la ausencia de evaluacion y de mantenimiento es un riesgo significativo.
- Etiquetado: el propio autor clasifica el repositorio como `research`, lo que refuerza que no esta pensado para despliegue.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/miyuki17/openevo-q17-directapply-1p7b-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revision congelada del base: 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- WebShop (entorno de referencia mencionado en la model card): https://webshop-pnlp.github.io/
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron listados de hoteles de la cadena Holiday Inn Express en Orlando, sin relacion con el repositorio. No se han localizado papers, blogs, repositorios auxiliares ni demos asociados.
