# ElementMerc/qwen3-1.7b-abliterated

## Resumen

qwen3-1.7b-abliterated es una version modificada (abliterated) de Qwen/Qwen3-1.7B, publicada por el usuario ElementMerc a traves del proyecto senbonzakura. La abliteracion es una tecnica de edicion de pesos que elimina el comportamiento de rechazo (refusal) de un modelo sin recurrir a entrenamiento adicional: se localizan las direcciones del espacio de activaciones que transportan el rechazo y se proyectan fuera de los pesos. El resultado es un modelo conversacional que, por diseno, no declina peticiones.

El modelo conserva los 1.720.574.976 parametros (1,7B) del Qwen3-1.7B original, con licencia Apache 2.0 y soporte declarado unicamente para ingles. Se publica como artefacto de investigacion detras de una pregunta concreta: si eliminar el reflejo de rechazo elimina tambien el conocimiento del dano. La model card incluye un aviso de correccion (2026-10-01) que retira todas las cifras publicadas, porque tres fallos en la herramienta de medicion alteraron lo que se estaba midiendo.

Es relevante en el contexto de interpretabilidad y seguridad de modelos: sirve como material para estudiar mecanismos de refusal, medir deriva de comportamiento tras una edicion dirigida de pesos y comparar el modelo base frente a su variante editada. Los pesos en si no se han retirado; lo que se retira es la afirmacion sobre lo que hacen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso (heredada de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | safetensors en la precision del modelo base; builds GGUF en repositorio separado (llama.cpp, Ollama, LM Studio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo complementario) |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador denso de 1,7B parametros, identico en arquitectura al Qwen/Qwen3-1.7B base. No hay reentrenamiento ni ajuste fino: la abliteracion actua editando directamente los pesos. La herramienta senbonzakura busca una proyeccion por capa, en lugar de eliminar una unica direccion global de rechazo, optimizando contra un conjunto reservado con una penalizacion KL para perturbar lo minimo posible el comportamiento general del modelo. La busqueda se ejecuto durante 100 ensayos sobre este modelo, sin actualizaciones de gradiente, sin datos de entrenamiento y sin fine-tuning.

Es un modelo de razonamiento (thinking model): emite un bloque de razonamiento antes de la respuesta final, lo que resulta directamente relevante para interpretar sus evaluaciones. Segun la propia correccion de la model card, el sistema de puntuacion leia su veredicto en una posicion en la que el modelo produce primero ese bloque de razonamiento, de modo que el lenguaje de rechazo dentro del razonamiento (que el modelo luego no aplicaba) se contabilizaba como rechazo y las respuestas posteriores al razonamiento se perdian.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `apply_chat_template` de transformers.
- Modo de razonamiento (thinking) previo a la respuesta, heredado del modelo base.
- Ausencia deliberada de comportamiento de rechazo: responde a peticiones que el modelo base declina.
- Compatible con text-generation-inference y con `endpoints_compatible` segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles como caracteristica declarada.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Vision o audio: no disponibles.

## Casos de uso

- Investigacion en interpretabilidad: analizar que direcciones de activacion transportan el comportamiento de rechazo comparando el modelo abliterado con el Qwen3-1.7B original, capa por capa.
- Red-teaming y evaluacion de seguridad: usar el modelo como sujeto de pruebas para medir la robustez de capas de seguridad externas, dado que el propio modelo no aporta ninguna.
- Estudios de deriva de comportamiento: cuantificar cuanto cambia un modelo tras una edicion dirigida de pesos, usando la penalizacion KL del proceso como referencia de diseno.
- Comparacion base vs abliterado en pipelines de evaluacion: medir tasas de rechazo y capacidad de discriminacion de dano con conjuntos reservados propios, ya que las cifras publicadas estan retiradas.
- Experimentacion local en hardware de consumo: al ser un modelo de 1,7B, se puede desplegar en una GPU de gama media para reproducir experimentos sin infraestructura dedicada.
- Fine-tuning posterior controlado: partir de los pesos editados para estudiar como se comporta un ajuste fino sobre una base sin reflejo de rechazo.
- Generacion de texto sin restricciones en entornos de investigacion aislados y bajo responsabilidad del operador, siempre con la advertencia de que el modelo no incorpora ninguna capa de seguridad.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados, pero todas sus cifras estan retiradas (withdrawn, no ajustadas) por un aviso de correccion del 2026-10-01. Se reproduce a continuacion unicamente como referencia documental, no como dato utilizable.

| Metrica | Base | Abliterated | Estado |
|---|---|---|---|
| Tasa de rechazo (200 prompts daninos) | 9,5% | 0,0% | Retirada |
| Discriminacion de dano (AUC, 200 daninos vs 200 inofensivos) | 0,9645 | 0,9332 | Retirada |

Motivos de la retirada segun la propia model card: el filtro destinado a conservar solo las direcciones que transportan rechazo aceptaba todos los candidatos; el detector de evasivas puntuaba respuestas complacientes como rechazos suaves; y la fila de discriminacion de dano (AUC) esta retirada en la documentacion del propio proyecto. Ademas, una medicion posterior del modelo base sobre un conjunto reservado distinto situo su tasa de rechazo en el 37,5% frente al 9,5% de la tabla, cuatro veces mas alta. Los dos conjuntos no son directamente comparables. Esta prevista una reconstruccion y una nueva medicion con la herramienta actual; hasta entonces, no debe citarse ninguna de estas cifras.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 3,4-3,5 GB para los pesos (el repositorio ocupa 3,5 GB).
- VRAM estimada cuantizado: aproximadamente 1,7-2 GB en INT8 y alrededor de 1,0-1,2 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 3070, RTX 4060, RTX 4090) para fp16; GPUs con 4-6 GB son suficientes con cuantizacion GGUF Q4.
- Cabe en GPU de consumo: si, sin dificultad. Es un modelo de 1,7B; incluso tarjetas de gama baja con cuantizacion pueden alojarlo.
- Opciones de despliegue: transformers (safetensors), llama.cpp, Ollama y LM Studio mediante los builds GGUF; vLLM y text-generation-inference son compatibles en funcion del soporte de la arquitectura Qwen3 en esas herramientas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ElementMerc/qwen3-1.7b-abliterated | 1,7B | No disponible | apache-2.0 | HuggingFace (safetensors y GGUF) | Abliterado; sin comportamiento de rechazo |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible | apache-2.0 | HuggingFace | Modelo original; conserva rechazo; modelo de razonamiento |
| Otras variantes abliterated de Qwen3-1.7B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

No se han facilitado datos de rendimiento comparables entre estos modelos, y las cifras del modelo abliterado estan retiradas, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no va a rechazar peticiones. Es su proposito explicito y lo que hay que entender antes de descargarlo: respondera solicitudes que el modelo base declina, incluidas las daninas. Cualquier despliegue orientado a terceros necesita su propia capa de seguridad; este modelo no aporta ninguna.
- La abliteracion no es gratuita: es una edicion dirigida, pero sigue siendo una edicion. Cabe esperar cierta deriva en el comportamiento general respecto al modelo base. El cambio de AUC reportado (-0,031) esta retirado y no debe usarse como referencia.
- Todas las cifras de la model card estan retiradas por fallos de la herramienta de medicion. No deben escalarse, citarse ni usarse con salvedades: hay que remedir o esperar a la reconstruccion anunciada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es una caracteristica comun de los modelos de 1,7B y del modo de razonamiento.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta especificado ni respaldado.
- Licencia: apache-2.0, que permite uso comercial. No obstante, la licencia cubre los pesos editados, no exime de responsabilidad legal ni etica por el contenido generado.
- El modelo emite un bloque de razonamiento previo a la respuesta, lo que complica la evaluacion automatica de rechazos si el instrumento de medida no tiene en cuenta esa estructura.
- No se declaran capacidades de tool calling, agentes, vision ni audio; no deben asumirse.
- Los pesos no se han modificado desde la subida original; lo retirado es la afirmacion sobre su efecto, no los archivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElementMerc/qwen3-1.7b-abliterated
- Builds GGUF: https://huggingface.co/ElementMerc/qwen3-1.7b-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de la herramienta senbonzakura: https://github.com/elementmerc/senbonzakura
- Changelog del proyecto: https://github.com/elementmerc/senbonzakura/blob/main/CHANGELOG.md
- Documentacion "what we got wrong": https://elementmerc.github.io/senbonzakura/guide/what-we-got-wrong
