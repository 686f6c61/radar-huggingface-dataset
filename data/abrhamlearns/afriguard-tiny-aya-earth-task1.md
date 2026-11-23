# abrhamLearns/afriguard-tiny-aya-earth-task1

## Resumen

AfriGuard Task A es un adaptador LoRA (QLoRA de 4 bits) construido sobre el modelo base CohereLabs/tiny-aya-earth, un transformer de 3,41 mil millones de parametros. Lo desarrolla el usuario abrhamLearns y su proposito es la deteccion multilingue de contenido inseguro (safety detection) en el marco del proyecto AfriGuard, con enfasis en lenguas africanas. El repositorio contiene unicamente los pesos del adaptador en formato safetensors (0,4 GB), no el modelo completo, por lo que requiere cargar el modelo base para su uso.

El modelo resuelve una tarea de clasificacion binaria: decidir si una entrada es segura o insegura. Para ello aplica una calibracion del umbral de decision sobre la diferencia de log-probabilidades entre las etiquetas unsafe y safe, fijada en +0,522. Esta orientado a pipelines de moderacion de contenido en contextos multilingues donde los modelos genericos tienen cobertura limitada.

Su relevancia actual radica en dos factores: el tamano reducido del modelo base (por debajo del limite de 5B que imponen muchas competiciones y despliegues con recursos limitados) y el enfoque en lenguas africanas, un nicho poco cubierto por los sistemas de moderacion comerciales. La informacion publicada es escasa: no hay licencia declarada, ni idiomas listados, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base CohereLabs/tiny-aya-earth) con adaptador LoRA |
| Parametros totales | 3,41B en el modelo base; el adaptador LoRA se entrena con r=32, alpha=64 sobre las 7 proyecciones lineales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible (etiquetado como multilingue y orientado a lenguas africanas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre tiny-aya-earth, un transformer decoder-only de 3,41B parametros. El entrenamiento emplea QLoRA con cuantizacion de 4 bits NF4, rango r=32, alpha=64 y adaptadores insertados en las siete proyecciones lineales del modelo base. Se realizaron 2 epocas, 538 pasos en total, con tasa de aprendizaje 2e-4 y planificador coseno.

La innovacion tecnica destacable es la calibracion del umbral de decision mediante Out-of-Fold sobre la magnitud logP(unsafe) - logP(safe), fijando el umbral en +0,522. Este procedimiento ajusta el punto de corte de la clasificacion binaria para equilibrar falsos positivos y falsos negativos, algo poco habitual en adaptadores de seguridad publicados. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Deteccion binaria de contenido inseguro (safe/unsafe) mediante comparacion de log-probabilidades calibradas.
- Cobertura multilingue orientada a lenguas africanas, segun las etiquetas del repositorio.
- Clasificacion con umbral ajustable, lo que permite adaptar la sensibilidad a distintos entornos de despliegue.
- No se documentan capacidades de generacion libre, tool calling, agentes, vision ni audio; el adaptador esta especializado en la tarea de safety.

## Casos de uso

- Moderacion de comentarios en plataformas comunitarias: el adaptador clasifica cada mensaje como seguro o inseguro aplicando el umbral calibrado, lo que permite filtrar contenido antes de publicarlo con un coste computacional bajo al partir de un modelo de 3,41B.
- Filtrado previo en pipelines de datos de entrenamiento: se puede pasar un corpus multilingue africano por el clasificador para eliminar muestras toxicas antes de usarlas en el entrenamiento de otros modelos.
- Moderacion en aplicaciones de mensajeria para lenguas africanas: al estar orientado a ese nicho, cubre idiomas que los clasificadores comerciales suelen ignorar, con un modelo que cabe en infraestructura modesta.
- Investigacion en seguridad multilingue: sirve como linea base reproducible (QLoRA con hiperparametros y umbral documentados) para comparar tecnicas de deteccion en lenguas de bajos recursos.
- Prefiltrado en sistemas de atencion al cliente: descarta mensajes abusivos antes de enrutarlos a un agente humano o a un modelo mayor, reduciendo carga y coste.
- Evaluacion de sesgos y auditoria: al permitir inspeccionar la diferencia de log-probabilidades, facilita analizar como varía la decision entre idiomas y detectar disparidades de cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en precision completa (fp16) requiere aproximadamente 7 GB; en cuantizacion de 8 bits, unos 4 GB; en 4 bits, alrededor de 2,5 GB. El adaptador anade un consumo marginal (0,4 GB en disco).
- GPU recomendadas: A100 o H100 para lotes grandes y alto throughput; RTX 4090, RTX 3090 o A10G para despliegues de produccion con cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16, y en tarjetas de 4-6 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM o TGI para servir el modelo fusionado; llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriGuard Task A (este) | 3,41B (base) + adaptador | no disponible | Safety multilingue africano | no disponible | Hugging Face |
| Llama Guard (Meta) | 8B / 1B (segun variante) | 4K-8K (segun variante) | Safety multilingue | Licencia Llama | Hugging Face |
| ShieldGemma (Google) | 2B / 9B / 27B | 8K | Safety en ingles | Gemma Terms | Hugging Face |
| WildGuard (Allen AI) | 7B | 4K | Safety y refusal | Licencia del modelo base | Hugging Face |

La comparativa se basa en caracteristicas generales de la categoria; no hay datos de rendimiento de este adaptador que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial esta permitido; es imprescindible consultar al autor antes de produccion.
- No se especifican los idiomas cubiertos ni el volumen o composicion del dataset de entrenamiento, por lo que la cobertura real es desconocida.
- El umbral de decision (+0,522) se calibro sobre un conjunto out-of-fold concreto; puede no transferirse a dominios o idiomas distintos y requerira recalibracion.
- Al ser un clasificador binario, puede generar falsos positivos y falsos negativos; no se han publicado metricas de precision, recall ni F1.
- El adaptador depende del modelo base tiny-aya-earth; hereda sus sesgos y sus limitaciones de contexto e idioma.
- No hay evidencia publicada de robustez frente a ataques adversariales, code-switching ni texto ofuscado.
- El repositorio tiene cero descargas y un solo like, sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/abrhamLearns/afriguard-tiny-aya-earth-task1
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
