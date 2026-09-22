# panzarasa/qwen1.5-0.5b-websight

## Resumen

Qwen1.5-0.5B-WebSight es un ajuste fino del modelo Qwen/Qwen1.5-0.5B-Chat publicado por el usuario panzarasa, orientado a una tarea muy concreta: convertir una descripcion breve en ingles de una pagina web en un unico documento HTML autocontenido estilizado con Tailwind CSS. El modelo resuelve el paso "idea -> maqueta" dentro de flujos de generacion de interfaces, un problema que normalmente se aborda con modelos de codigo mucho mayores o con modelos vision-lenguaje cuando se parte de una captura de pantalla.

Tecnicamente es un transformer decoder-only de la familia Qwen2 (etiqueta qwen2 en el repo) con 463.987.712 parametros reales en los pesos safetensors publicados y un total declarado de 479M, sobre el que se aplico un ajuste QLoRA de 15.138.816 parametros entrenables (3,16% del total). En el repositorio se publican tanto los pesos fusionados en 16 bits en la raiz como el adaptador LoRA aislado en la subcarpeta `adapter/`, de modo que puede usarse con solo el id del repo o apilado sobre el modelo base.

Su relevancia es doble. Por un lado demuestra que con 0,5B de parametros y ~1h35m en una unica RTX 4090 se puede especializar un modelo pequeno en una tarea de generacion de codigo estructurado con perdida de validacion de 0,1313. Por otro, es un ejemplo claro de destilado de un dataset sintetico (HuggingFaceM4/WebSight v0.2) y de sus limitaciones: produce estructura HTML correcta y clases Tailwind validas, pero tiende a rellenar las secciones con comentarios de marcador de posicion en lugar de contenido real. La licencia Tongyi Qianwen Research restringe el uso a investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (según la etiqueta `qwen2` del repo); detalles de capas, cabezas y activaciones no disponibles |
| Parametros totales | 463.987.712 (pesos safetensors); 479M declarados en la model card |
| Parametros activos | No aplica (no es MoE) |
| Parametros entrenables | 15.138.816 (3,16% del total), correspondientes al adaptador LoRA |
| Longitud de contexto | 1.024 tokens de maximo en entrenamiento (prompt + pagina); la ventana del modelo base no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | Pesos publicados en 16 bits (bfloat16) fusionados; el entrenamiento uso QLoRA nf4 con doble cuantizacion. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Tongyi Qianwen Research License (`license: other`, `tongyi-qianwen-research`), uso restringido a investigacion no comercial |
| Formato de pesos | safetensors (modelo fusionado en la raiz del repo) + adaptador LoRA/QLoRA en `adapter/` |
| Tamano del repositorio | 1,0 GB |
| Modelo base | Qwen/Qwen1.5-0.5B-Chat |
| Dataset de entrenamiento | HuggingFaceM4/WebSight v0.2 (columnas `llm_generated_idea` -> `text`), CC-BY-4.0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen1.5-0.5B-Chat, un transformer decoder-only con atencion causal cuyo identificador de arquitectura en el repositorio es `qwen2`. El ajuste se hizo con QLoRA en precision nf4 con doble cuantizacion y adaptadores LoRA de rango 32 y alpha 32, sin dropout, aplicados sobre las siete proyecciones del bloque de atencion y del MLP: `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`. Esto supone 15.138.816 parametros entrenables, el 3,16% del total. Un detalle relevante del diseno es que la perdida se calcula unicamente sobre el turno del asistente, enmascarando el prompt, de forma que el modelo no recibe senal por reproducir la descripcion de entrada.

Los datos proceden de WebSight v0.2, un dataset de paginas web sinteticas generadas por un LLM: 58.653 filas de entrenamiento y 998 de validacion, con secuencia maxima de 1.024 tokens, 3 epocas y batch efectivo de 16 (micro-batch 8 x acumulacion de gradiente 2), tasa de aprendizaje 2e-4 con scheduler coseno y 3% de warmup, optimizador adamw_8bit en bf16 y una unica RTX 4090 durante aproximadamente 1 hora y 35 minutos. Las filas de mas de 1.024 tokens se descartaron en lugar de truncarse (347 de 59.000) con una justificacion tecnica solida: un documento cortado ensenaria al modelo a emitir HTML que nunca se cierra. La perdida de validacion descendio de forma monotona durante las tres epocas, sin senales claras de sobreajuste, y el mejor checkpoint publicado es el paso 10800 (epoca 2,95) con eval_loss 0,1313.

## Capacidades

- Generacion de texto a HTML: dado un enunciado breve en ingles ("a pricing page with three tiers, a FAQ section and a dark footer"), produce un documento HTML completo y autocontenido.
- Estilizado con Tailwind CSS: utiliza clases de Tailwind validas y coherentes con el vocabulario de layout del dataset.
- Estructura de pagina fiable: en pruebas genera correctamente cabecera, secciones solicitadas, pie de pagina, etiquetas correctamente cerradas y jerarquia HTML valida.
- Formato conversacional: usa la plantilla de chat de Qwen1.5 (`apply_chat_template`) con un mensaje de sistema que fija el rol de desarrollador front-end y la instruccion de devolver solo HTML.
- Generacion de codigo en sentido amplio: la tarea cae dentro del ambito de code generation, aunque el modelo esta especializado en HTML/Tailwind y no en lenguajes de proposito general.
- Tool calling / function calling: no disponible; no se documenta soporte de llamada a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponibles; no hay modo de pensamiento (thinking mode) ni bucle de agentes documentado.
- Vision: no soportada. Aunque WebSight incluye una captura de pantalla por ejemplo, Qwen1.5 carece de codificador visual y las imagenes no se usaron en el entrenamiento.
- Multilingue: solo ingles, segun la etiqueta de idioma del repositorio.

## Casos de uso

- Prototipado rapido de landing pages: a partir de una descripcion de una frase se obtiene una maqueta HTML con Tailwind que se puede abrir directamente en el navegador y usar como punto de partida antes de pasar al diseno definitivo.
- Scaffolding para equipos de front-end: el modelo genera la estructura (cabecera, grid de tarjetas, secciones, pie) y el desarrollador rellena el contenido real. El propio autor lo describe como "layout scaffolder, not a finished-page generator", lo que encaja con un uso como primer borrador en lugar de entregable final.
- Generacion de variantes para pruebas A/B: al ser un modelo de 0,5B y bajo coste de inferencia, se pueden producir decenas de variantes de una misma pagina cambiando el enunciado y compararlas rapidamente en un test de usabilidad o de conversion.
- Aumento de datos para entrenar modelos mayores: el pipeline (idea -> HTML) puede usarse para generar pares sinteticos adicionales de descripcion y marcado, utiles como datos de arranque en proyectos de text-to-code. Conviene recordar que el propio dataset de origen ya es sintetico y muy templado.
- Generacion de plantillas de correo electronico HTML: la restriccion a HTML autocontenido y de longitud corta o media encaja con el formato de emails transaccionales o de marketing que deben funcionar sin hojas de estilo externas.
- Bases para investigacion en generacion de interfaces: sirve como punto de partida (fine-tune posterior o experimento de ablation) para estudiar cuanto se puede exprimir una tarea de generacion de codigo estructurado con 0,5B de parametros y un adaptador LoRA de rango 32.
- Integracion en herramientas internas de low-code: el modelo puede exponerse tras una API con TGI o vLLM para que un editor interno convierta descripciones en maquetas descargables, siempre dentro de un uso de investigacion no comercial por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion publicado es la perdida de validacion sobre las 998 filas reservadas de WebSight, medida cada 1.200 pasos (una epoca equivale a 3.666 pasos):

| Paso | Epoca | eval_loss |
|---|---|---|
| 1200 | 0,33 | 0,2045 |
| 2400 | 0,65 | 0,1780 |
| 3600 | 0,98 | 0,1632 |
| 4800 | 1,31 | 0,1527 |
| 6000 | 1,64 | 0,1447 |
| 7200 | 1,96 | 0,1377 |
| 8400 | 2,29 | 0,1350 |
| 9600 | 2,62 | 0,1320 |
| 10800 | 2,95 | 0,1313 |
| 10998 | 3,00 | 0,1314 |

El mejor checkpoint es el paso 10800 (epoca 2,95) con eval_loss 0,1313, que es el conjunto de pesos publicado. No se proporcionan metricas de calidad funcional del HTML generado (validez, similitud estructural, fidelidad al enunciado).

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 0,93 GB en bfloat16 (464M parametros), alrededor de 0,5 GB en int8 y unos 0,3 GB en 4 bits, mas el cache KV y el overhead del runtime. Cabe holgadamente en cualquier GPU con 2 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 4090 (la usada para el entrenamiento, con ~1h35m para 3 epocas y 15,1M de parametros entrenables) es sobredimensionada para inferencia. Tambien funciona en GPUs de gama baja y en CPU.
- GPU consumer: si, cabe en tarjetas como RTX 3060, RTX 4060, GTX 1650 o incluso en equipos sin GPU dedicada usando CPU, dado el tamano.
- Opciones de despliegue: `transformers` con `device_map="auto"`, PEFT para cargar el adaptador sobre el base, text-generation-inference (el repo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y, previa conversion a GGUF, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. El unico dato temporal aportado es el tiempo de entrenamiento (aproximadamente 1h35m en una RTX 4090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| panzarasa/qwen1.5-0.5b-websight | 463.987.712 (479M declarados) | 1.024 tokens en entrenamiento | Idea -> HTML con Tailwind | Tongyi Qianwen Research (solo investigacion) | eval_loss 0,1313 en WebSight v0.2 (998 filas) |
| Qwen/Qwen1.5-0.5B-Chat (base) | misma base (464M en safetensors) | no disponible en la informacion proporcionada | Chat general, sin especializacion en HTML | Tongyi Qianwen Research | no disponible; no se reportan metricas de la tarea HTML |
| Qwen2.5-Coder-0.5B-Instruct | no disponible en la informacion proporcionada | no disponible | Codigo general, no especifico de HTML/Tailwind | no disponible en la informacion proporcionada | no disponible; no hay evaluacion sobre WebSight |

No se dispone en la informacion proporcionada de comparaciones directas contra otros ajustes sobre WebSight ni contra modelos vision-lenguaje de screenshot-to-code, que serian las alternativas naturales para esta tarea.

## Limitaciones y advertencias

- Solo texto: el modelo no acepta imagenes. WebSight incluye capturas de pantalla por ejemplo, pero se descartaron por la ausencia de codificador visual en Qwen1.5. Para screenshot-to-code hace falta un modelo vision-lenguaje.
- Dataset sintetico y muy templado: el modelo reproduce el vocabulario de layout del dataset (hero sections, grids de tarjetas, pies de pagina simples) y sera poco original en estructuras fuera de esa distribution.
- Ventana de 1.024 tokens: el prompt y la pagina generada comparten ese limite, por lo que produce paginas cortas o medias, no sitios grandes con multiples secciones.
- Relleno con marcadores de posicion: en pruebas el modelo acierta la estructura pero a menudo inserta comentarios del tipo `<!-- Add your tier content here -->` en lugar de contenido real.
- Instrucciones de estilo ignoradas: puede desobedecer indicaciones concretas; el autor documenta un caso en el que se pidio un pie de pagina oscuro y genero uno claro.
- Licencia restrictiva: los pesos fusionados contienen los del modelo base, liberado bajo Tongyi Qianwen Research License, que limita el uso a investigacion no comercial. Esto afecta directamente a cualquier despliegue en produccion o producto comercial.
- Riesgo de alucinacion: al tratarse de un modelo de 0,5B entrenado sobre datos sinteticos, puede generar clases Tailwind inexistentes o atributos inventados, aunque el cierre correcto de etiquetas es fiable segun las pruebas del autor.
- Idioma: entrenado y etiquetado unicamente en ingles; se desconoce su comportamiento con enunciados en castellano.
- Sin datos de sesgo ni de seguridad: no se documenta ninguna evaluacion de sesgos, toxicidad o robustez adversarial.
- Adopcion minima: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados mas alla de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/panzarasa/qwen1.5-0.5b-websight
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceM4/WebSight
- Busqueda web: no se han encontrado resultados relevantes para este modelo; las consultas devolvieron unicamente paginas sin relacion con el proyecto (foros de caracteres especiales, conversiones de unidades y preguntas generales), por lo que no se anaden enlaces adicionales.
