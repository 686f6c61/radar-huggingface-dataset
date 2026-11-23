# magicvec/reax-r2

## Resumen

REAX R2 (identificador `magicvec/reax-r2`) es un ajuste fino (fine-tuning) del modelo base `MachinePulseAI/karpo-decision-31B`, publicado por el usuario `magicvec` en Hugging Face. Se trata de un modelo de tipo "decision-model" con 31.273.088.876 parametros (aproximadamente 31,3 mil millones), distribuidos en safetensors y con un tamano de repositorio de 62,6 GB, lo que sugiere pesos en precision bf16/fp16. La licencia declarada es Apache 2.0 y el acceso esta restringido (gated): es necesario aceptar condiciones en la plataforma antes de descargarlo.

El modelo se enmarca en el ecosistema REAX, descrito en los resultados de busqueda como una "subnet alpha" orientada a la admision de operadores contratados de la UE para trafico regulado (GDPR, Ley de IA de la UE) y a un servicio de fine-tuning que produce modelos de decision personalizados, con mineros compitiendo por producir mejores variantes. R2 seria, por tanto, la segunda iteracion de un modelo de decision afinado dentro de ese circuito, si bien no se han publicado detalles tecnicos sobre el proceso de entrenamiento, los datos utilizados ni las capacidades concretas.

La relevancia actual del modelo es limitada y dificil de evaluar: no hay pipeline declarado, no constan idiomas soportados, no hay descargas ni likes, y la informacion publica disponible se reduce a metadatos de la ficha de Hugging Face y a una descripcion muy generica del proyecto REAX. Cualquier evaluacion de su calidad requiere acceso al repositorio y a documentacion adicional que no se ha proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` en los tags; sin confirmar) |
| Parametros totales | 31.273.088.876 (31,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Los tags de Hugging Face incluyen la etiqueta `gemma4`, lo que podria indicar que la familia base emplea una arquitectura tipo transformer decoder-only inspirada en Gemma, pero este dato no esta confirmado ni se detalla en la informacion disponible. El modelo es un fine-tuning de `MachinePulseAI/karpo-decision-31B`, del que tampoco se aportan especificaciones de arquitectura, numero de tokens de entrenamiento ni composicion del dataset.

Respecto al entrenamiento, la unica informacion contextual proviene de la descripcion del proyecto REAX: un servicio de fine-tuning que produce modelos de decision personalizados, con mineros compitiendo por generar mejores variantes. No se especifica si hubo RLHF, DPO, SFT supervisado u otras tecnicas, ni se documentan innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto y toma de decisiones: el tag `decision-model` sugiere un uso orientado a clasificacion o seleccion de acciones, aunque no se detalla el formato de entrada/salida.
- Razonamiento y codigo: no disponible en la informacion proporcionada.
- Matematicas: no disponible.
- Vision: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no constan idiomas declarados).
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Admision de operadores regulados en la UE: segun la descripcion de REAX, el modelo podria emplearse para evaluar y decidir la admision de operadores contratados que gestionan trafico sujeto a GDPR y a la Ley de IA de la UE. El modelo de decision permitiria clasificar solicitudes segun criterios de cumplimiento, aunque no se documenta el formato exacto de las entradas.
- Clasificacion de solicitudes en flujos de compliance: en un pipeline interno, el modelo podria recibir descripciones de operadores o casos y devolver una decision categorica (admitir, rechazar, revisar), integrándose en un sistema de gestion de casos.
- Filtrado previo en procesos de alta de clientes: dado su caracter de "decision-model", podria actuar como primera capa de triaje en la incorporacion de operadores o contrapartes, delegando los casos ambiguos a revision humana.
- Evaluacion de politicas internas: el modelo podria utilizarse para contrastar descripciones de procesos contra un conjunto de reglas y emitir una decision binaria o multiclase, siempre que se disponga de la documentacion de entrenamiento adecuada.
- Experimentacion en el circuito REAX: al ser un modelo afinado publicado por un participante del ecosistema, sirve como referencia para comparar variantes producidas por distintos mineros y evaluar su calidad relativa en tareas de decision.
- Base para nuevos fine-tunings: al estar bajo licencia Apache 2.0 y en formato safetensors, puede servir como punto de partida para ajustes adicionales en dominios regulados, aunque la falta de documentacion sobre el modelo base limita la planificacion.

En todos los casos, la ausencia de benchmarks, de documentacion de entrenamiento y de ejemplos de uso hace que estos escenarios sean hipoteticos y requieran validacion empirica antes de cualquier despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3 B parametros, en bf16/fp16 se requieren aproximadamente 62,6 GB de VRAM solo para los pesos, mas memoria para el contexto y el runtime (tipicamente 70-80 GB en total). En cuantizacion de 8 bits, alrededor de 32-35 GB; en 4 bits, alrededor de 17-20 GB.
- GPU recomendadas: para bf16 sin cuantizar, GPU de 80 GB como A100 80GB, H100 80GB o MI300X. Para cuantizacion 8 bits, A100 40GB o L40S 48GB. Para 4 bits, RTX 4090 24GB o RTX 6000 Ada 48GB.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits (por ejemplo, RTX 4090 con 24 GB), aunque con margen ajustado y posible degradacion de calidad.
- Opciones de despliegue: no se documentan opciones oficiales. Por formato safetensors, seria compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) u Ollama, pero no hay confirmacion de soporte ni de plantilla de chat.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base `MachinePulseAI/karpo-decision-31B` no cuenta con especificaciones publicas en la informacion proporcionada, y no se han identificado alternativas comparables de la misma categoria (modelos de decision de ~31 B) con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| magicvec/reax-r2 | 31,3 B | no disponible | Apache 2.0 | Gated en Hugging Face |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se describen arquitectura, datos de entrenamiento, proceso de ajuste ni evaluacion, lo que impide validar su comportamiento.
- Riesgo de alucinacion: no evaluado; al tratarse de un modelo de decision, los errores de clasificacion pueden tener consecuencias directas en flujos de compliance.
- Sesgos conocidos: no documentados; sin informacion sobre la composicion del dataset no es posible estimar sesgos de dominio, idioma o geografia.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados; no hay garantia de funcionamiento en castellano.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el acceso esta restringido (gated) y el modelo base podria tener condiciones adicionales no reflejadas en la informacion disponible; conviene verificar la licencia del modelo base antes de un uso productivo.
- Caveat de produccion: sin benchmarks ni ejemplos de uso, no se recomienda su despliegue en entornos regulados sin una evaluacion propia exhaustiva y sin trazabilidad del proceso de entrenamiento.
- Fecha de creacion futura (2026-11-22): los metadatos indican una fecha posterior a la actual, lo que sugiere posibles inconsistencias en la publicacion que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/magicvec/reax-r2
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Roadmap del proyecto REAX: https://reax.dev/roadmap
- Subnet Alpha de REAX: referencia mencionada en los resultados de busqueda sin URL directa verificable
