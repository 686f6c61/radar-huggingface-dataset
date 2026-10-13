# francesca9805/eus-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `eus-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10` es un ajuste fino (fine-tuning) del modelo `francesca9805/ppt-wc-zipf-newlex-eus-before-100mb-packed-bfdiso_seed10`, publicado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generacion de texto de aproximadamente 124,8 millones de parametros, entrenado mediante SFT (supervised fine-tuning) con la libreria TRL de HuggingFace. El nombre del repositorio y la organizacion del experimento en Weights & Biases apuntan a un trabajo de investigacion de la Universidad de Groningen centrado en tokenizacion y en el idioma vasco (el codigo `eus` corresponde al codigo ISO 639-3 del eusquera), aunque la model card no confirma oficialmente ni el idioma ni el dataset.

Por su tamano (124,8 M de parametros, compatible con la escala de GPT-2 small) y por la etiqueta `gpt2` presente en los tags del repositorio, todo indica que se trata de un transformer decoder-only de escala reducida, no de un modelo de gran tamano orientado a produccion. El repositorio no registra descargas ni "likes" en el momento de la consulta, y no incluye informacion sobre benchmarks, idiomas soportados ni licencia, por lo que su interes es principalmente experimental y de investigacion mas que de despliegue comercial.

La relevancia de este modelo reside en su caracter de artefacto de investigacion reproducible: forma parte de una serie de ejecuciones (`seed10`, `ckpt500`, `100mb`, `packed`, `bfdiso`) sobre tokenizadores y datos empaquetados, con la ejecucion registrada de forma publica en Weights & Biases. Para un desarrollador o investigador, resulta util como referencia de un pipeline de SFT con TRL sobre un modelo base pequeno, mas que como modelo listo para tareas de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; la etiqueta `gpt2` del repositorio sugiere un transformer decoder-only de tipo GPT-2 |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se declara el formato safetensors; no se mencionan GGUF ni otras) |
| Idiomas soportados | No disponibles (el nombre del modelo sugiere eusquera, sin confirmacion en la model card) |
| Licencia | No disponible (la model card indica `licence: license`, campo sin contenido real) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,5 GB |
| Modelo base | francesca9805/ppt-wc-zipf-newlex-eus-before-100mb-packed-bfdiso_seed10 |
| Libreria | transformers |
| Pipeline | text-generation |
| Metodo de entrenamiento | SFT (TRL) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de forma explicita. Los unicos indicios disponibles son la etiqueta `gpt2` en los tags del repositorio, el recuento de parametros (124.770.816, muy cercano a la escala de GPT-2 small) y la etiqueta `text-generation`, lo que apunta a un transformer decoder-only autorregresivo. No se dispone de informacion sobre el numero de capas, dimensiones de embedding, numero de cabezas de atencion ni mecanismo de atencion (no se mencionan variantes como atencion lineal, SSM o arquitecturas hibridas).

En cuanto al entrenamiento, la model card indica que se trata de un fine-tuning del modelo `francesca9805/ppt-wc-zipf-newlex-eus-before-100mb-packed-bfdiso_seed10` realizado con SFT mediante la libreria TRL. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF, DPO o similares. El nombre del repositorio contiene indicios sobre la configuracion experimental: `100mb` (probablemente el volumen de datos), `packed` (empaquetado de secuencias), `ckpt500` (posible punto de control en el paso 500), `bfdiso` (posible mezcla de precision bf16 y entrenamiento distribuido) y `seed10` (semilla 10). Estos elementos no estan documentados en la model card y son solo interpretaciones del nombre. La ejecucion de entrenamiento esta registrada publicamente en Weights & Biases bajo la organizacion `f-padovani-university-of-groningen`.

Las versiones de framework declaradas son: TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad declarada explicitamente mediante la etiqueta `text-generation`.
- Ajuste fino supervisado (SFT) a partir de un modelo base previo del mismo autor.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues especificas ni idiomas confirmados.
- No se declara modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No se declara soporte de contexto largo ni de decodificacion especulativa.

Dado que la model card no documenta capacidades adicionales, cualquier uso mas alla de la generacion de texto simple debe considerarse no verificado.

## Casos de uso

- Investigacion sobre tokenizacion: el nombre del repositorio (`wc-zipf-newlex`) sugiere experimentos con tokenizadores y distribuciones de frecuencia tipo Zipf. El modelo puede emplearse como artefacto de comparacion entre distintas configuraciones de tokenizador sobre un corpus concreto.
- Reproduccion de experimentos de SFT: al estar entrenado con TRL 0.23.0 y documentarse las versiones de framework, sirve para reproducir o extender el pipeline de ajuste fino sobre un modelo base pequeno.
- Generacion de texto en eusquera (a confirmar): si el identificador `eus` corresponde efectivamente al eusquera, el modelo podria emplearse en tareas experimentales de generacion en ese idioma, aunque la model card no lo verifica.
- Base para experimentos de destilacion o comparacion de escalas: con 124,8 M de parametros, es adecuado como punto de partida o referencia en estudios de escalado de modelos pequenos.
- Pruebas de pipelines de inferencia: util para validar integraciones con `transformers`, text-generation-inference o vLLM en entornos de desarrollo, dado su reducido tamano.
- Docencia y formacion: sirve como ejemplo practico de un modelo ajustado con SFT y TRL, con una ejecucion trazable en Weights & Biases.
- Evaluacion de tecnicas de empaquetado de secuencias (`packed`): el modelo puede utilizarse como referencia en estudios sobre el efecto del empaquetado en la calidad del ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se ha facilitado informacion de evaluacion externa.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento de parametros de 124,8 M, no confirmadas por el autor):
  - FP32: aproximadamente 0,5 GB solo de pesos.
  - FP16/BF16: aproximadamente 0,25 GB solo de pesos.
  - Int8: aproximadamente 0,12 GB solo de pesos.
  - Int4: aproximadamente 0,06 GB solo de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. No se requieren A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (pipeline de text-generation, tal como muestra la model card), text-generation-inference (la etiqueta `text-generation-inference` esta presente en el repositorio) y, potencialmente, vLLM o llama.cpp/Ollama previa conversion, aunque no se documenta ninguna conversion a GGUF.
- Latencia y throughput: no disponibles.
- Nota sobre el tamano del repositorio: los 9,5 GB del repositorio son muy superiores a lo esperado para 124,8 M de parametros en safetensors (que ocuparian del orden de centenares de MB), lo que sugiere la presencia de multiples puntos de control (`ckpt500`) o estados de optimizador. Esto debe tenerse en cuenta al descargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eus-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10 | 124,8 M | No disponible | No disponible | HuggingFace | Modelo experimental de investigacion; sin benchmarks |
| GPT-2 small | 124 M | 1024 tokens | MIT (segun publicacion original) | Amplia | Referencia de escala; arquitectura GPT-2 clasica |
| DistilGPT-2 | 82 M | 1024 tokens | MIT (segun publicacion original) | Amplia | Version destilada de GPT-2, orientada a eficiencia |
| GPT-2 medium | 355 M | 1024 tokens | MIT (segun publicacion original) | Amplia | Mayor capacidad, misma familia arquitectonica |

La comparativa con GPT-2 se plantea por la escala de parametros y la etiqueta `gpt2` del repositorio, pero no debe interpretarse como equivalencia funcional: el modelo aqui descrito ha sido ajustado sobre un corpus no especificado y no cuenta con evaluacion publica. No se dispone de modelos comparables especificos en eusquera con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del modelo en tareas reales.
- Licencia no definida: la model card contiene un campo `licence: license` sin contenido, por lo que no se puede confirmar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Idiomas no confirmados: aunque el identificador `eus` sugiere eusquera, la model card no declara idiomas soportados. El comportamiento en otros idiomas es desconocido.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar usos con documentos largos.
- Riesgo de alucinacion: al ser un modelo pequeno (124,8 M de parametros) ajustado con SFT sobre un corpus no documentado, es previsible una tasa elevada de generacion incoherente o factualmente incorrecta, especialmente fuera del dominio de entrenamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset, por lo que no es posible evaluar sesgos de genero, raza, religion u otros. Los modelos entrenados sobre corpus web suelen heredar sesgos de dichas fuentes.
- Modelo experimental sin mantenimiento garantizado: cero descargas y cero "likes" en el momento de la consulta, y sin documentacion de soporte. No hay evidencia de que el autor vaya a mantenerlo.
- Repositorio de gran tamano: 9,5 GB para un modelo de 124,8 M de parametros sugiere la inclusion de artefactos adicionales (puntos de control u optimizador), lo que puede complicar la descarga y el despliegue.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-13, fecha posterior a la habitual en los repositorios publicos actuales; conviene verificar la vigencia y autenticidad del artefacto.
- No apto para produccion sin evaluacion previa: por la falta de metricas, licencia y documentacion, no se recomienda su uso en sistemas en produccion sin una evaluacion exhaustiva y ad hoc.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/francesca9805/eus-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-eus-before-100mb-packed-bfdiso_seed10
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/i6qq8wez
- Cita de TRL (von Werra et al., 2020): incluida en la model card, repositorio GitHub de TRL como referencia bibliografica.
