# MagicLuke/duplex-refusal

## Resumen

MagicLuke/duplex-refusal es un adaptador LoRA publicado en HuggingFace con la libreria PEFT, desarrollado por el usuario independiente MagicLuke sobre el modelo base nvidia/personaplex-7b-v1. Segun las etiquetas del repositorio, el adaptador esta orientado a reforzar el comportamiento de rechazo (refusal) dentro de un modelo de voz full-duplex, es decir, un sistema capaz de escuchar y hablar de forma simultanea, no por turnos. El repositorio ocupa 0,8 GB, el acceso esta restringido y la licencia declarada es «personaplex-derivative», con la etiqueta generica «other» en HuggingFace.

La relevancia de esta publicacion es limitada pero concreta: los modelos de voz full-duplex son una categoria reciente y la alineacion de seguridad en ese formato (cuando el modelo puede ser interrumpido, solapado o conducido por audio en tiempo real) esta mucho menos explorada que en los modelos de texto. Un adaptador que modula el rechazo en ese contexto es un objeto de estudio razonable para investigacion en seguridad de sistemas conversacionales por voz.

Ahora bien, la ficha que sigue esta fuertemente condicionada por la ausencia de informacion: el repositorio no publica model card con detalles de entrenamiento, no declara idiomas, no incluye resultados de evaluacion y acumula cero descargas. Todo lo que no consta en los metadatos se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre nvidia/personaplex-7b-v1. Arquitectura del modelo base: no disponible en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador. El nombre del modelo base (personaplex-7b-v1) sugiere del orden de 7.000 millones de parametros en el base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. No se publican pesos cuantizados en el repositorio (solo el adaptador, 0,8 GB) |
| Idiomas soportados | No disponibles |
| Licencia | personaplex-derivative (etiqueta «other» en HuggingFace); acceso restringido, requiere aceptar condiciones |
| Formato de pesos | Adaptador PEFT/LoRA (libreria declarada: peft). Formato de fichero concreto: no disponible |
| Modelo base | nvidia/personaplex-7b-v1 |
| Tamano del repositorio | 0,8 GB |
| Modalidad declarada | Voz full-duplex (etiquetas: full-duplex, speech) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 (fecha declarada en HuggingFace) |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo: se aplica sobre nvidia/personaplex-7b-v1 mediante la libreria peft y modifica el comportamiento del base sin reentrenarlo por completo. Las etiquetas del repositorio delimitan el dominio de especializacion en tres ejes: «full-duplex» y «speech» (el sustrato es un modelo de voz simultanea) y «refusal» junto con «instruction-following» (el objetivo declarado es modular la negativa del sistema ante determinadas peticiones, presumiblemente en un contexto conversacional hablado).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otra tecnica de alineacion, ni sobre hiperparametros del ajuste LoRA (rango, alpha, modulos objetivo). Tampoco se documenta ninguna innovacion tecnica especifica del adaptador, ni existe paper, blog o informe tecnico asociado en la informacion disponible. Las caracteristicas arquitectonicas del modelo base (mecanismo de atencion, codec de audio, estrategia de streaming full-duplex) no estan descritas en la informacion proporcionada y, por tanto, no se afirman aqui.

## Capacidades

- Interaccion de voz full-duplex: la etiqueta «full-duplex» indica que el modelo base opera en un regimen de escucha y habla simultaneas, no por turnos estrictos. El adaptador hereda esa capacidad del base.
- Modulacion del rechazo: la etiqueta «refusal» apunta a que el adaptador altera la tendencia del modelo a negarse a responder o ejecutar determinadas peticiones.
- Seguimiento de instrucciones: la etiqueta «instruction-following» sugiere que el ajuste se realiza sobre el comportamiento de obediencia a instrucciones, aunque no se especifica en que formato (texto, audio o ambos).
- Generacion de texto: no consta de forma explicita.
- Razonamiento, matematicas y codigo: no consta.
- Tool calling / function calling: no consta.
- Comportamiento agentico y razonamiento multi-paso: no consta.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo de pensamiento (thinking), vision o audio adicional: no consta, mas alla de la modalidad de voz indicada por las etiquetas.

## Casos de uso

- Investigacion sobre alineacion en voz en tiempo real: el adaptador permite estudiar como se comporta el rechazo cuando la interaccion es full-duplex y el usuario puede interrumpir o solapar turnos, un escenario que los modelos de texto no cubren.
- Evaluacion de resistencia a jailbreaks por audio: al modificar la tendencia al rechazo, sirve como sujeto de pruebas para medir si un atacante puede eludir las negativas mediante habla sintetizada, ruido o solapamiento de turnos.
- Capa de seguridad en prototipos de asistentes telefonicos: un adaptador de rechazo puede aplicarse sobre el base para endurecer respuestas en dominios sensibles antes de desplegar un piloto de atencion telefonica, siempre que se valide previamente su tasa de falsos rechazos.
- Generacion de datos de preferencia sobre rechazo: las respuestas del modelo con y sin adaptador pueden usarse para construir pares de comparacion destinados a entrenar tecnicas de alineacion (DPO, RLHF) en el dominio de la voz.
- Estudio comparativo de adaptadores frente a ajuste completo: con 0,8 GB de adaptador y un base de ~7.000 millones, es un caso practico para medir cuanto comportamiento de seguridad se puede inyectar con un coste de almacenamiento reducido.
- Analisis de sobre-rechazo: util para cuantificar si el ajuste provoca que el modelo decline peticiones legitimas, un riesgo habitual en adaptadores especializados en negativas.
- Docencia y experimentacion con PEFT: sirve como ejemplo minimo de adaptador LoRA sobre un modelo de modalidad no textual para practicar carga, fusion y despliegue con la libreria peft.

En todos los casos debe tenerse en cuenta que no existe ninguna evaluacion publicada que respalde estas aplicaciones; son usos plausibles derivados de las etiquetas, no capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion, no hay paper asociado y la busqueda web realizada no ha devuelto ninguna fuente tecnica sobre el modelo (los resultados obtenidos corresponden a paginas de ayuda de YouTube, Gmail y Zhihu, sin relacion con el modelo).

## Requisitos de hardware

- Tamano del adaptador: 0,8 GB en disco, segun el tamano del repositorio. Es el unico dato de recursos confirmado.
- Modelo base: el nombre personaplex-7b-v1 sugiere ~7.000 millones de parametros. Estimacion aritmetica orientativa (no confirmada por el autor): en torno a 14 GB de VRAM en bf16/fp16, unos 8 GB en int8 y unos 4-5 GB en int4, sin contar los componentes adicionales de audio que pueda requerir el pipeline de voz.
- GPU recomendadas: para el base en precision completa, A100 40/80 GB, H100 o L40S. Para el base en bf16 con margen ajustado, RTX 4090 o RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, previsiblemente, aplicando cuantizacion al modelo base; el adaptador LoRA anade un coste de VRAM despreciable frente al base. Esta afirmacion no esta verificada por el autor.
- Opciones de despliegue: transformers junto con peft es la via natural para cargar el adaptador. vLLM soporta adaptadores LoRA, aunque la compatibilidad con un modelo de voz full-duplex no esta confirmada. llama.cpp u Ollama no son aplicables directamente porque no se publican pesos GGUF del adaptador ni del base fusionado.
- Latencia y throughput: no disponibles. Cualquier uso en modo full-duplex exige streaming de baja latencia, requisito que no puede evaluarse con la informacion publicada.
- Nota de acceso: el repositorio esta restringido, por lo que es necesario aceptar las condiciones en HuggingFace antes de descargarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MagicLuke/duplex-refusal | Adaptador LoRA sobre base de ~7.000 M (base no confirmado) | No disponible | Sin benchmarks publicados | personaplex-derivative (acceso restringido) | Gated en HuggingFace, 0 descargas |
| nvidia/personaplex-7b-v1 (modelo base) | ~7.000 M segun denominacion | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible |
| Otros adaptadores de rechazo para modelos de voz full-duplex | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion disponible |

No se dispone de datos suficientes para establecer una comparativa tecnica con alternativas de la misma categoria. La informacion proporcionada no incluye modelos comparables con especificaciones verificables.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con detalles de entrenamiento, datos, hiperparametros ni metodologia de evaluacion.
- Sin validacion empirica: cero descargas y cero likes, y ningun benchmark publicado. No hay evidencia de que el adaptador funcione segun lo que sugieren sus etiquetas.
- Riesgo de sobre-rechazo: los ajustes orientados a reforzar la negativa tienden a degradar la utilidad del modelo, haciendo que decline peticiones legitimas. No hay datos que permitan cuantificar este riesgo aqui.
- Alucinacion: al ser un adaptador sobre un modelo generativo, hereda el riesgo de alucinacion del base, cuya magnitud no esta documentada.
- Idiomas: no se declaran idiomas soportados, por lo que no puede asegurarse el comportamiento en castellano ni en ninguna otra lengua.
- Contexto: se desconoce la ventana de contexto efectiva, tanto del base como del adaptador.
- Licencia: «personaplex-derivative» es una licencia de tipo «other» definida por el autor del modelo base. Las condiciones de uso comercial dependen de los terminos de nvidia/personaplex-7b-v1 y de la licencia derivada; no se pueden determinar a partir de la informacion disponible. Debe revisarse antes de cualquier uso en produccion.
- Acceso restringido: el repositorio exige aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos automatizados o de investigacion con requisitos de reproducibilidad inmediata.
- Empaquetado incompleto: solo se publica el adaptador; no hay pesos fusionados, GGUF ni versiones cuantizadas, lo que complica el despliegue fuera del ecosistema transformers/peft.
- Fecha de publicacion inusual: los metadatos indican 2026-09-15, dato que conviene verificar en el repositorio por si se trata de un error de registro.
- Compatibilidad incierta con motores de inferencia: no hay evidencia de que el adaptador funcione con vLLM, TGI u otros servidores de alto rendimiento en un pipeline de voz full-duplex.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/MagicLuke/duplex-refusal
- Modelo base: https://huggingface.co/nvidia/personaplex-7b-v1
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles. La busqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo; los unicos resultados obtenidos fueron paginas de ayuda de YouTube, Gmail y la comunidad Zhihu, sin vinculacion con este artefacto.
