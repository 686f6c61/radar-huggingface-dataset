# Carchofa/kev-1.5b-decision

## Resumen

Carchofa/kev-1.5b-decision es un adaptador LoRA publicado en HuggingFace por el usuario Carchofa, entrenado sobre el modelo base Qwen/Qwen2.5-1.5B. El repositorio contiene únicamente los pesos del adaptador (formato PEFT/LoRA, safetensors, ~0,1 GB), no un modelo completo, por lo que su uso requiere cargar Qwen2.5-1.5B y aplicar el adaptador encima. La nomenclatura "decision" y el nombre "kev" lo sitúan en la estela de los modelos de decisión tipo Jev/kev, que devuelven probabilidades tipadas o etiquetas en lugar de texto generado autorregresivamente.

El interés de esta ficha es limitado y hay que decirlo con claridad: la model card del repositorio es la plantilla por defecto de HuggingFace, con todos los campos marcados como "[More Information Needed]". No se declara licencia, idiomas, datos de entrenamiento, hiperparámetros, evaluación ni procedencia de los datos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de septiembre de 2026 con apenas cinco segundos de diferencia entre creación y última actualización.

Sí existe contexto externo relevante: el proyecto kev de jaredpalmer implementa modelos de decisión inspirados en Jev (TypeSafe), con un adaptador LoRA y una cabeza de lectura sobre Qwen2.5-0.5B que responde múltiples preguntas tipadas sobre un documento en una sola pasada de prefill, con máscara block-causal y sin decodificación. Es plausible que este adaptador siga ese mismo patrón, pero conviene subrayar que la model card no lo confirma en ningún punto y que el modelo base aquí es Qwen2.5-1.5B, no el Qwen2.5-0.5B del repositorio de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen2.5-1.5B); arquitectura interna del adaptador no especificada |
| Parámetros totales | 1.500 millones en el modelo base; número de parámetros entrenables del adaptador no disponible (repositorio de ~0,1 GB) |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-1.5B; ampliable a 131.072 con YaRN según la documentación del modelo base |
| Tipos de cuantización | No disponible en el repositorio (solo se publican pesos de adaptador en safetensors); la cuantización requeriría fusionar primero el adaptador y convertir después |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 cubre 29 idiomas, entre ellos español, inglés, chino, francés, alemán, portugués, italiano, ruso, japonés y coreano |
| Licencia | No disponible (el modelo base Qwen2.5-1.5B es Apache-2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors, formato de adaptador PEFT/LoRA; requiere la librería peft (versión registrada: 0.21.0) |

## Arquitectura y entrenamiento

No hay información publicada sobre el procedimiento de entrenamiento. La model card no documenta el número de tokens, la composición del dataset, el régimen de precisión (fp32, bf16, fp16), el rango o alpha del LoRA, la estrategia de enmascaramiento ni si hubo una fase de ajuste por preferencias (RLHF, DPO) o de calibración de probabilidades. Los únicos metadatos técnicos disponibles son los tags del repositorio, que confirman el uso de PEFT, LoRA y Transformers, y la referencia `base_model:adapter:Qwen/Qwen2.5-1.5B`.

Qwen2.5-1.5B es un transformer decoder-only denso de 28 capas, con atención de consultas agrupadas (GQA) de 12 cabezas de consulta y 2 cabezas de clave/valor, dimensión oculta de 1536, intermedio de 8960 y vocabulario de 151.936 tokens. El adaptador hereda esa arquitectura íntegramente: no introduce capas nuevas ni modifica el mecanismo de atención, salvo en la medida en que el entrenamiento LoRA pueda haber alterado las proyecciones. En el ecosistema kev de referencia, la innovación no está en el backbone, sino en la cabeza de lectura y en el empaquetado de documento y preguntas en una única secuencia con máscara block-causal, de modo que varias preguntas se responden en un solo paso de prefill. Se desconoce si este adaptador replica ese diseño o si se limita a un ajuste supervisado convencional sobre pares pregunta-respuesta.

## Capacidades

- Generación de texto: heredada del modelo base Qwen2.5-1.5B, que cubre generación, resumen, reescritura y respuesta a preguntas en formato conversacional.
- Razonamiento y matemáticas básicas: el base rinde de forma razonable en tareas aritméticas sencillas y de sentido común, con las limitaciones propias de un modelo de 1,5 mil millones de parámetros.
- Generación de código: Qwen2.5-1.5B tiene competencia funcional en lenguajes populares, aunque limitada en tareas de razonamiento algorítmico complejo.
- Tool calling / function calling: soportado por el modelo base Qwen2.5 mediante plantillas de chat específicas para llamadas a herramientas; se desconoce si el adaptador preserva esta capacidad.
- Salida de decisión tipada: presumible por el nombre del repositorio ("decision") y por el ecosistema kev/Jev, que devuelve etiquetas, puntuaciones o probabilidades calibradas en lugar de texto libre. No confirmado en la model card.
- Multilingüismo: el modelo base cubre 29 idiomas; el grado de degradación introducido por el adaptador, especialmente en idiomas distintos del inglés, es desconocido.
- Capacidades multimodales y de audio: no disponibles (el backbone es exclusivamente de texto).
- Modo de razonamiento explícito ("thinking"): no disponible en la familia Qwen2.5-1.5B estándar.

## Casos de uso

- Enrutamiento de consultas en sistemas multiagente: si el adaptador se comporta como un clasificador de decisión, puede asignar cada entrada a un agente, herramienta o modelo de destino devolviendo una probabilidad en lugar de texto, con un coste por consulta muy inferior al de invocar un modelo generativo grande. La ventaja principal sería la latencia, al evitar la decodificación autorregresiva.
- Puertas de control en flujos RAG: uso del adaptador como filtro previo que decide si la consulta recuperada es suficiente para responder o si hay que volver a recuperar, reduciendo llamadas al modelo grande en pipelines de recuperación aumentada.
- Moderación y filtrado con umbral configurable: clasificación binaria o multiclase de contenido (spam, toxicidad, intención comercial) con una probabilidad explícita que permite fijar el umbral de decisión según la política del producto.
- Automatización documental por lotes: lectura de documentos largos y extracción de decisiones tipadas (¿menciona una fecha límite? ¿contradice el contrato anterior?) aprovechando el contexto de 32.768 tokens del modelo base. En el patrón kev, varias preguntas se resuelven sobre el mismo documento en una sola pasada de prefill.
- Prototipado e investigación académica de modelos de decisión: el repositorio es útil como punto de partida reproducible para estudiar adaptadores LoRA de bajo coste sobre Qwen2.5-1.5B, siempre que se asuma la ausencia de documentación y de evaluación.
- Inferencia local en hardware modesto: al requerir menos de 2 GB de VRAM en cuantización de 4 bits (tras fusionar el adaptador), es viable desplegarlo en portátiles con GPU integrada, equipos Apple Silicon o incluso en CPU, para tareas de clasificación de bajo volumen.
- Preprocesado de colas de soporte técnico: etiquetado automático de tickets entrantes por prioridad o área, con la probabilidad de decisión como señal para el enrutado humano. Requiere validación previa porque no existe ninguna métrica publicada.
- Evaluación de adaptadores frente al modelo base: dado que el repositorio incluye el tag `base_model:adapter:Qwen/Qwen2.5-1.5B`, sirve como caso de estudio para medir cuánto se degrada la capacidad generativa del base al aplicar un LoRA especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación cumplimentada, no se ha publicado ningún dataset de test, y el repositorio no tiene descargas ni discusiones de la comunidad que aporten mediciones independientes. Tampoco existen comparaciones publicadas frente al modelo base sin adaptador, ni frente a otros adaptadores de decisión.

## Requisitos de hardware

- VRAM para inferencia (estimaciones sobre el modelo base de 1,5 mil millones de parámetros, una vez fusionado el adaptador): aproximadamente 3,1 GB en fp16, 1,6 GB en cuantización int8 y 0,9-1,1 GB en int4.
- Memoria de caché KV en fp16 para el contexto completo de 32.768 tokens: aproximadamente 0,9 GB, calculado a partir de las 28 capas y las 2 cabezas KV de 128 dimensiones de Qwen2.5-1.5B. Un contexto de 8.192 tokens reduce esa cifra a unos 0,23 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090, RTX 5090, así como en iGPU modernas con memoria unificada y en Apple Silicon (M1 a partir de 8 GB de memoria unificada).
- GPU de centro de datos soportadas sin problema por tamaño: A100 40/80 GB, H100, L40S, A10G. El modelo es demasiado pequeño para aprovechar estas GPU de forma eficiente salvo en despliegues con lotes muy grandes.
- Opciones de despliegue: transformers + peft cargando el adaptador sobre Qwen2.5-1.5B (ruta directa, sin conversión); vLLM y TGI tras fusionar los pesos en el modelo base y exportar en safetensors; llama.cpp y Ollama tras fusionar y convertir a GGUF; servidores PEFT multimodelo si se quieren servir varios adaptadores sobre el mismo base.
- Latencia y throughput: no disponible. Si el adaptador sigue el patrón de los modelos de decisión tipo kev, la latencia estaría dominada por el prefill y no por la decodificación, pero esto no está confirmado en la información publicada.
- Nota operativa: el repositorio contiene solo el adaptador, por lo que cualquier despliegue exige descargar aparte Qwen/Qwen2.5-1.5B (unos 3 GB en safetensors fp16) y fusionar o cargar en dos etapas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Carchofa/kev-1.5b-decision | 1,5 B (base) + LoRA | 32.768 | No disponible | HuggingFace, 0 descargas | Adaptador sin model card ni evaluación |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32.768 (131.072 con YaRN) | Apache-2.0 | HuggingFace, ampliamente desplegado | Modelo base sobre el que se entrena el adaptador; multilingüe (29 idiomas) |
| kev (jaredpalmer), sobre Qwen2.5-0.5B | 0,5 B (base) + LoRA | 32.768 (Qwen2.5) | No especificada en la búsqueda | Repositorio GitHub público | Proyecto de referencia del ecosistema kev; incluye cabeza de lectura y máscara block-causal |
| Jev (TypeSafe) | No disponible | No disponible | Propietaria | API de pago desde el 21 de septiembre de 2026 ($0,042 por millón de tokens de entrada, salida gratuita) | Modelo de decisión tipada comercial; no es un modelo abierto |

La comparación es estructuralmente desigual: el adaptador de Carchofa no dispone de métricas que permitan situarlo frente a sus alternativas, y el único punto objetivo de comparación es el modelo base, del que hereda arquitectura, tokenizador y ventana de contexto.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de HuggingFace, sin datos de entrenamiento, evaluación, uso previsto ni uso fuera de alcance.
- Licencia no declarada: no se especifica licencia para el adaptador. Aunque Qwen2.5-1.5B es Apache-2.0, la ausencia de licencia explícita en el repositorio genera incertidumbre legal sobre su uso comercial. Conviene contactar con el autor antes de integrarlo en producción.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no existe retroalimentación externa, ni issues, ni reproducciones independientes de su comportamiento.
- Riesgo de alucinación: inherente a cualquier modelo de 1,5 mil millones de parámetros; el adaptador puede además degradar la fidelidad factual del base si el ajuste se hizo con un dataset pequeño o poco diverso.
- Idiomas no declarados: si el entrenamiento del LoRA se hizo solo en inglés, el rendimiento en español y en el resto de los idiomas del base puede haberse deteriorado de forma significativa.
- Comportamiento real desconocido: la hipótesis de que funciona como clasificador de decisión con probabilidades calibradas se apoya en el nombre del repositorio y en material externo sobre el proyecto kev/Jev, no en la model card. Cualquier uso que dependa de esa suposición debe ir precedido de una evaluación propia.
- Calibración no garantizada: incluso si el modelo emite probabilidades, no hay ninguna evidencia de que estén calibradas, por lo que fijar umbrales de decisión automáticos sin validar es arriesgado.
- Restricciones de contexto: la ventana de 32.768 tokens es la del modelo base; no hay evidencia de que el adaptador haya sido entrenado con secuencias de esa longitud, lo que puede provocar degradaciones en contextos largos aunque el modelo los acepte formalmente.
- Metadatos ambiguos: solo cinco segundos separan la creación del repositorio (2026-09-24T19:47:14Z) de su última actualización, lo que sugiere una subida automática o de prueba sin revisión posterior.
- Fecha de publicación en el futuro respecto al momento de redacción de otras fichas del blog: verificar la vigencia del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Carchofa/kev-1.5b-decision
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio del proyecto kev (jaredpalmer): https://github.com/jaredpalmer/kev
- Rama principal del repositorio kev: https://github.com/jaredpalmer/kev/tree/main
- Análisis de Jev AI en Wavect: https://wavect.io/blog/jev-ai-decision-model-review/
- Sitio de Jev (TypeSafe): https://jevmodel.org/
- Cobertura de TechCrunch sobre Jev: https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/
- Artículo citado en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact#compute
