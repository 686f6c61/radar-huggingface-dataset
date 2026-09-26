# Pedro21613/PS-design-1.1

## Resumen

PS Design 1.1 es un adaptador LoRA publicado por el usuario Pedro21613 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No es un modelo completo, sino un fine-tune de bajo rango (r=16, alpha=32) orientado a una tarea muy concreta: generar paginas web en HTML con Tailwind CSS con un estilo minimalista, moderno y profesional. El objetivo declarado es mejorar la calidad visual y la completitud estructural de las paginas generadas por el modelo base de 0,5B de parametros, que en las pruebas del autor producia salidas incompletas y con clases de Tailwind obsoletas.

El modelo esta etiquetado con idioma portugues (pt), y el prompt de sistema recomendado por el autor esta redactado en portugues de Brasil. El repositorio es de tipo PEFT y contiene unicamente los pesos del adaptador en formato safetensors; para usarlo hay que cargar primero el modelo base. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un experimento personal sin validacion por parte de la comunidad.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: no hay benchmarks publicados, no se especifica licencia y el entrenamiento se hizo con solo 120 ejemplos. Su interes practico esta en servir como ejemplo de fine-tune de bajo coste sobre un modelo diminuto para una tarea de generacion de codigo concreta, y como caso de estudio de los limites de los modelos sub-1B en tareas de diseno front-end.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre el modelo base Qwen2.5-0.5B-Instruct |
| Parametros totales | Modelo base: 0,49B (494M). Adaptador LoRA: no disponible (el autor no especifica los modulos objetivo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el entrenamiento del adaptador se hizo con max_len 2048 |
| Tipos de cuantizacion | No disponible en la model card. Al ser un adaptador sobre Qwen2.5-0.5B-Instruct, es compatible con las cuantizaciones de este (fp16, int8, GGUF q4/q5/q8) previa fusion del adaptador |
| Idiomas soportados | Portugues (pt), segun la etiqueta del repositorio; el modelo base Qwen2.5 soporta multilingual amplio, pero el adaptador solo se entreno con ejemplos en portugues |
| Licencia | No disponible (la del modelo base es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | peft |
| Rango e hiperparametros LoRA | r=16, alpha=32 |
| Tamano del repositorio | 0,0 GB (menos de 5 MB) |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en HuggingFace | 2026-09-26 (segun los metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 montado sobre Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,49B de parametros con atencion por consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm. El adaptador no modifica la arquitectura del modelo base: anade matrices de bajo rango sobre determinadas proyecciones (el autor no detalla cuales). Al ser un adaptador, el resultado es un artefacto de pocos megabytes que requiere el modelo base para inferir, y que puede fusionarse en los pesos originales para exportar un modelo unico.

El entrenamiento se realizo con un dataset propio de 120 ejemplos de paginas web, con tematicas declaradas que incluyen landing de SaaS, portafolio, dashboard, login, pricing, blog, e-commerce, clinica, restaurante y agencia. La configuracion fue de 3 epocas, batch efectivo 8, learning rate 2e-4 con scheduler cosine, longitud maxima de 2048 tokens, precision fp16 y una unica GPU T4. Las perdidas reportadas son aproximadamente 0,37 en entrenamiento y 0,09 en evaluacion. No se menciona uso de RLHF, DPO ni ninguna tecnica de alineacion adicional; el ajuste es exclusivamente supervisionado sobre pares instruccion-respuesta.

No se documenta ninguna innovacion tecnica en el metodo: no hay decodificacion especulativa, atencion lineal ni modificaciones al tokenizador. La unica particularidad es la especializacion tematica del dataset y el estilo de salida (Tailwind CSS via CDN, tipografia Inter, paleta zinc, tarjetas con rounded-2xl, header sticky con backdrop-blur).

## Capacidades

- Generacion de codigo HTML completo y autonomo (documento con DOCTYPE, head, meta charset y cuerpo), segun los ejemplos de la model card.
- Aplicacion de estilos con Tailwind CSS cargado via CDN (`https://cdn.tailwindcss.com`), no con build de Tailwind.
- Diseno responsive basico mediante grid y utilidades de breakpoint de Tailwind (`md:grid-cols-3`, etc.).
- Estilo minimalista y profesional: paleta neutra (zinc), tipografia Inter, bordes suaves, espaciados amplios.
- Generacion de estructuras de landing page: header sticky, hero con llamada a la accion, rejilla de tarjetas y footer.
- Seguimiento de instrucciones conversacionales en portugues, heredado del modelo base Instruct.
- Plantilla de chat compatible (`apply_chat_template`) con roles system/user/assistant.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue: no acreditada; el entrenamiento es en portugues y el autor no reporta evaluacion en otros idiomas.

## Casos de uso

- Generacion de maquetas estaticas de landing pages: el modelo produce un unico archivo HTML con Tailwind por CDN, util para prototipar rapido una pagina de aterrizaje antes de pasar al diseno definitivo en Figma o a un proyecto con Tailwind compilado.
- Pruebas de concepto para agencias y freelancers: dado un brief en portugues (tipo de negocio, secciones requeridas), se obtiene una propuesta visual de una sola pasada con header, hero, tarjetas y footer, que se puede iterar con cambios de prompt.
- Generacion de plantillas base para portafolios, blogs o paginas de precios: el dataset de entrenamiento incluye explicitamente esas tematicas, por lo que es el terreno donde el adaptador deberia rendir mejor.
- Material didactico para ensenar Tailwind: las salidas usan clases representativas (`bg-zinc-50`, `rounded-2xl`, `max-w-6xl`, `backdrop-blur`, `antialiased`), utiles como ejemplo de estilo moderno para alumnos.
- Experimentacion en investigacion sobre fine-tuning eficiente: con 120 ejemplos, 3 epocas y una T4, es un caso reproducible de bajo coste para estudiar como un adaptador LoRA cambia el estilo de salida de un modelo de 0,5B, incluyendo la comparativa base vs fine-tune publicada en el repositorio.
- Inferencia en hardware muy limitado: al apoyarse en un modelo de 0,49B, puede ejecutarse en CPU, en GPUs de gama baja o en dispositivos con poca memoria, lo que permite integrarlo en herramientas locales de generacion de maquetas sin conexion.
- Prototipado offline en un editor o plugin: fusionando el adaptador y exportando a GGUF, podria distribuirse como un modelo local pequeno que genere esqueletos HTML a partir de una descripcion textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna metrica automatica de calidad de codigo o de maquetacion.

Lo unico que aporta el autor es una comparacion cualitativa, con el mismo prompt, entre el modelo base y el adaptador:

| Metrica | Qwen2.5-0.5B-Instruct (base) | PS Design 1.1 |
|---|---|---|
| Tamano de la salida | 869 caracteres, 19 lineas | 3410 caracteres, 28 lineas |
| Estructura generada | Solo titulo y subtitulo; sin menu, seccion "sobre" ni contacto | Header sticky con blur, hero centrado, 3 tarjetas y footer |
| Estilo | `bg-gray-100`, Tailwind 2.2 antiguo, sin fuente definida | `bg-zinc-50`, Tailwind CDN actual, fuente Inter, `rounded-2xl`, `max-w-6xl` |
| Valoracion del autor | Incompleto, poco profesional | Completo, moderno y minimalista |

Esta tabla es una evaluacion subjetiva del autor sobre un unico prompt, no un benchmark reproducible. La perdida de evaluacion reportada (aproximadamente 0,09) no es comparable con la perdida de entrenamiento (aproximadamente 0,37) de forma directa en un dataset de 120 ejemplos, ya que el split de validacion no se documenta.

## Requisitos de hardware

- VRAM para el modelo base en fp16: aproximadamente 1 GB para los pesos (0,49B x 2 bytes) mas el cache KV.
- VRAM para el modelo base cuantizado: aproximadamente 0,5 GB en int8 y 0,3-0,4 GB en 4 bits.
- Cache KV en fp16 a maxima longitud de contexto: con 24 capas, 2 cabezas KV y dimension de cabeza 64, el coste es de unos 12 KB por token, es decir, alrededor de 0,4 GB para 32.768 tokens. Cabe en cualquier GPU moderna.
- Tamano del adaptador: menos de 5 MB (el repositorio figura como 0,0 GB).
- GPU recomendadas: cualquier GPU con 4 GB o mas sirve. Una T4 (la usada en el entrenamiento), una GTX 1650, una RTX 3060, una RTX 4090, una A100 o una H100 son sobredimensionadas para este modelo; el cuello de botella no sera la memoria, sino el ancho de banda y la latencia de generacion.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU (inferencia viable, aunque lenta con salidas de hasta 1800 tokens nuevos).
- Opciones de despliegue: `transformers` + `peft` (el metodo documentado por el autor); vLLM y TGI admiten adaptadores LoRA, aunque no hay configuracion publicada para este adaptador concreto; llama.cpp y Ollama requieren fusionar previamente el adaptador en los pesos base y convertir el resultado a GGUF; el repositorio no incluye pesos GGUF.
- Latencia y throughput estimados: no disponible. El autor no publica tiempos de generacion ni tokens por segundo.
- Parametros de generacion sugeridos por el autor: `max_new_tokens=1800`, `temperature=0.7`, `top_p=0.9`, muestreo activado.

## Comparativa con modelos similares

No existen evaluaciones comparativas publicadas para PS Design 1.1. La tabla siguiente compara los rasgos objetivos de modelos de la misma franja de tamano, marcando como no disponible lo que no se puede verificar.

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| PS Design 1.1 | 0,49B + adaptador LoRA (r=16) | 32.768 tokens (base); entrenado con 2048 | Adaptador PEFT especializado en HTML + Tailwind | No disponible | 120 ejemplos de entrenamiento, sin benchmarks |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Modelo instruct generalista | Apache 2.0 | Modelo base de este adaptador; salidas mas genericas en tareas de diseno segun el autor |
| Qwen2.5-Coder-0.5B | 0,49B | 32.768 tokens | Modelo especializado en codigo | Apache 2.0 | Alternativa orientada a codigo general, no a diseno visual; sin comparacion directa disponible |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens (documentado por su autor) | Modelo instruct generalista pequeno | Apache 2.0 | Alternativa de tamano similar para tareas genericas; sin comparacion directa disponible |

Cualquier comparacion de calidad entre estos modelos en generacion de maquetas requeriria una evaluacion propia, que no existe en la informacion disponible.

## Limitaciones y advertencias

- Modelo base de 0,49B: la capacidad de razonamiento, de seguir instrucciones complejas y de mantener coherencia en salidas largas es estructuralmente limitada. Es previsible que falle en layouts con mas de tres o cuatro secciones o con jerarquias anidadas.
- Riesgo alto de alucinacion: con 120 ejemplos de entrenamiento, el adaptador puede reproducir plantillas memorizadas del dataset y aplicar contenido o secciones que no corresponden al brief.
- Sobreajuste probable: la perdida de evaluacion (aproximadamente 0,09) es muy inferior a la de entrenamiento (aproximadamente 0,37), lo que en un dataset tan pequeno sugiere fuga de datos entre splits o memorizacion. No se documenta la particion train/eval.
- Idioma: entrenado en portugues. No hay evidencia de que funcione bien en castellano, ingles u otros idiomas, aunque el modelo base sea multilingue.
- Dominio muy estrecho: solo HTML con Tailwind por CDN. No se ha entrenado para React, Vue, Svelte, CSS puro ni para Tailwind compilado en un build de produccion.
- Tailwind via CDN: adecuado para prototipos, no recomendado en produccion por motivos de rendimiento y de cumplimiento de buenas practicas. Las salidas requeririan refactorizacion antes de usarse en un sitio real.
- Licencia no especificada: el repositorio no declara licencia para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia en el artefacto derivado genera incertidumbre legal para uso comercial. Conviene contactar con el autor antes de cualquier uso en producto.
- Sin benchmarks ni evaluacion automatica: no hay forma de verificar la calidad de forma objetiva, ni de compararla con alternativas.
- Sin validacion de la comunidad: 0 descargas y 0 likes; no hay informes de terceros sobre su comportamiento real.
- Longitud de entrenamiento limitada: aunque el modelo base soporta 32.768 tokens, el adaptador se entreno con max_len 2048, por lo que el comportamiento mas alla de esa longitud no esta garantizado.
- Requiere fusion o carga del adaptador: no es un modelo autonomo. Distribuirlo implica entregar tambien el modelo base.
- Metadatos del repositorio con fecha de creacion en 2026-09-26, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de depender de el.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-design-1.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Archivos de comparacion citados en la model card: `comparativo/base.html` y `comparativo/finetuned.html`, dentro del repositorio del modelo.

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo, su autor ni su tematica; los resultados obtenidos eran contenido no relacionado y se han descartado. No se dispone por tanto de papers, blogs, repositorios auxiliares ni demos adicionales que enlazar.
