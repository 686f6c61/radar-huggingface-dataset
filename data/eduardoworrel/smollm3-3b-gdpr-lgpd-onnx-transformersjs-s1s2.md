# eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2 es una adaptacion especializada del modelo base SmolLM3-3B de Hugging Face, orientada a la clasificacion y decision automatizada sobre textos de politicas de privacidad en el marco del RGPD europeo y de la LGPD brasilena. El autor, eduardoworrel, lo publica como una compilacion ONNX int4 en el formato de Transformers.js, pensada para ejecutarse directamente en navegador (WebGPU o CPU via WASM) sin infraestructura de servidor.

El modelo parte de la arquitectura transformer de SmolLM3-3B (3.000 millones de parametros, licencia Apache-2.0) y le anade cabezas de decision entrenadas sobre datos anotados de privacidad: el corpus GDPR-Transparency-200 y el corpus Claudinha para LGPD. La innovacion principal es el esquema S1S2 (System 1 / System 2): una primera pasada rapida produce una decision con probabilidad y margen, y si el margen es bajo el mismo modelo genera una explicacion en lenguaje natural como segunda pasada.

Es relevante ahora porque permite clasificar clausulas de privacidad en local, dentro del navegador, con pesos int4 de aproximadamente 1,8 GB, sin enviar datos potencialmente sensibles a servidores externos. La contrapartida es una licencia GPL-3.0 derivada de los datos de entrenamiento, lo que limita su uso comercial propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de SmolLM3-3B) con cabezas de decision adicionales (S1S2) |
| Parametros totales | 3.000 millones (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (ONNX q4); pesos int4 identicos byte a byte al build GenAI de referencia |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (model_q4.onnx) + cabezas en `heads/`, manifest.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer del SmolLM3-3B original y le superpone cabezas de clasificacion entrenadas especificamente para tareas de privacidad. El flujo S1S2 aplica la cabeza sobre los hidden states del modelo en posiciones de lectura concretas y calcula una distribucion softmax sobre las opciones de respuesta (por ejemplo Yes/No), devolviendo la opcion elegida junto con confianza y margen. Cuando el margen cae por debajo de un umbral configurable, el mismo modelo genera una justificacion textual mediante decodificacion autoregresiva (System 2).

Los datos de entrenamiento provienen de tres fuentes: GDPR-Transparency-200 (anotaciones de politicas de privacidad, GPL-3.0), el corpus Claudinha para LGPD (CC BY 4.0) y datos sinteticos Kev (legacy_policy y compositional). La receta de entrenamiento de la cabeza de puntero procede del proyecto Kev (Apache-2.0), y la idea del split System 1 / System 2 con compuerta por margen se atribuye a CT0 de Alias Robotics. El autor documenta paridad exacta con el build GenAI de referencia: estados ocultos con diferencia maxima 0 y probabilidades de cabeza con diferencia maxima 0 en 20 prompts de verificacion en CPU Node, y 20/20 decisiones iguales en WebGPU sobre Chrome 157 con Apple M2 Pro.

## Capacidades

- Clasificacion de clausulas de politicas de privacidad mediante preguntas de tipo eleccion (choice) con opciones definidas en el manifest.
- Decision con confianza calibrada: devuelve choice, confidence y margin por pregunta.
- Generacion de explicaciones en lenguaje natural sobre la decision tomada (segunda pasada S2), usando los mismos pesos.
- Soporte de multiples preguntas por pasada sobre un mismo fragmento de texto.
- Gestion de manifests alternativos por tarea o idioma (`manifest.pt.json` para portugues).
- Ejecucion en navegador con WebGPU o CPU via WASM, y en Node con onnxruntime-node.
- Etiquetado configurable mediante `manifest.lab.labels` (por ejemplo yes/no) y instrucciones por pregunta.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni vision/audio en la informacion disponible.

## Casos de uso

- Revision de politicas de privacidad en navegador: una aplicacion web puede cargar el manifest y clasificar clausulas sobre destinatarios de datos, base legal o retencion directamente en el cliente, sin enviar el texto a un backend. Es adecuado porque los pesos int4 caben en memoria de pagina (0,5 GB en WebGPU, 2,8 GB en CPU WASM medidos por el autor).
- Auditoria interna de RGPD/LGPD: un equipo legal puede pasar un lote de politicas por el modelo para marcar clausulas que abordan categorias concretas de tratamiento, usando el margen como indicador de casos que requieren revision humana.
- Triaje previo a revision humana: con la compuerta de margen (por ejemplo 0,2), los casos de baja confianza se derivan a revision y el modelo genera una explicacion de dos frases para contextualizar al revisor.
- Herramienta de cumplimiento para portales de transparencia: clasificacion automatizada de fragmentos en portugues e ingles con manifests separados, util para organizaciones que operan en Brasil y la UE simultaneamente.
- Prototipos y demos sin servidor: al ejecutarse con Transformers.js en WebGPU (0,45 s por decision en Apple M2 Pro medido por el autor), permite construir demos interactivas de analisis de privacidad desplegables como pagina estatica.
- Verificacion de paridad entre despliegues: el modelo documenta paridad exacta con el build GenAI de referencia, por lo que sirve como referencia para validar pipelines ONNX antes de migrar a produccion.
- Investigacion sobre clasificacion de bajo consumo: adecuado para experimentos academicos con modelos de 3B cuantizados a int4 en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta unicamente metricas de paridad y latencia medidas:

| Metrica | Entorno | Resultado |
|---|---|---|
| Paridad de hidden states | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1), 20 prompts | max abs diff 0 |
| Paridad de probabilidades de cabeza | Node CPU, 20 prompts | max abs diff 0 |
| Paridad de decisiones | Node CPU, 20 prompts | 20/20 iguales al build GenAI |
| Paridad de decisiones | Chrome 157 WebGPU (Apple M2 Pro), 20 prompts | 20/20 iguales al build GenAI |
| Latencia por decision | Chrome 157 WebGPU (Apple M2 Pro) | 0,45 s |
| Memoria de pagina | Chrome 157 WebGPU | 0,5 GB (buffers GPU no contabilizados) |
| Latencia por decision | Chrome 157 CPU (WASM) | 6,8 s |
| Memoria de pagina | Chrome 157 CPU (WASM) | 2,8 GB (pico de pestaña 4,0 GB durante carga) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 1,8 GB y los pesos int4 se ajustan a ese orden de magnitud.
- Ejecucion en navegador: WebGPU con 0,5 GB de memoria de pagina medidos en Apple M2 Pro; CPU WASM con 2,8 GB de pagina y pico de 4,0 GB durante la carga.
- GPU recomendadas: no se especifican modelos concretos; el autor solo documenta pruebas en Apple M2 Pro (WebGPU) y Node CPU. No hay datos para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, segun las mediciones en Apple M2 Pro con WebGPU; no se aportan datos para GPUs NVIDIA consumer.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con dtype q4, libreria `@s1s2/web` con carga por manifest, y onnxruntime-node en Node. El pipeline `decision` depende de un PR en borrador de transformers.js (PR #1943); sin el, hace falta el codigo de s1s2.
- Latencia y throughput: 0,45 s por decision en WebGPU y 6,8 s por decision en CPU WASM en el entorno medido; no se documenta throughput agregado ni latencia en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2 | 3.000 M | no disponible | ONNX int4 (Transformers.js) | GPL-3.0 | Clasificacion de privacidad en navegador |
| SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2 (mismo autor) | 3.000 M | no disponible | ONNX int4 (ONNX Runtime GenAI) | GPL-3.0 | Build de referencia, mismo entrenamiento |
| HuggingFaceTB/SmolLM3-3B (base) | 3.000 M | no disponible | safetensors | Apache-2.0 | Modelo generalista multilingue |
| alias3-web (Alias Robotics) | no disponible | no disponible | ONNX web | no disponible | Precursor del enfoque S1S2 en navegador |

La comparativa con modelos generalistas de 3B (Llama 3.2 3B, Qwen2.5 3B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las cabezas de decision son archivos separados en `heads/` y solo las aplica s1s2; Transformers.js por si solo no las lee.
- El pipeline `decision` de Transformers.js depende de un PR en borrador (PR #1943); sin el, hay que implementar manualmente prompt, posiciones de lectura, cabeza sobre hidden_states y softmax.
- La dimension de cabeza del KV cache esta fijada en el grafo por requisito de Transformers.js.
- Las filas de tokens se leen de la tabla int4 con operadores ONNX estandar en lugar de GatherBlockQuantized (sin kernel de CPU en navegador); lm_head esta dividido en 4 partes para caber en memoria wasm32.
- La licencia GPL-3.0 impide uso comercial propietario sin cumplir las obligaciones de copyleft; deriva de que los pesos se entrenaron sobre GDPR-Transparency-200 (GPL-3.0).
- Solo soporta ingles y portugues; no se documentan otros idiomas.
- El modelo esta especializado en clasificacion de privacidad, no es un modelo generalista; su uso fuera de ese dominio no esta validado.
- Riesgo de alucinacion en la fase generativa (S2) no cuantificado en la informacion disponible; se recomienda usar la compuerta de margen para derivar casos dudosos a revision humana.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a textos adversarios.
- La latencia en CPU WASM (6,8 s por decision) puede ser prohibitiva para flujos interactivos en equipos modestos.
- No hay datos de rendimiento en GPUs dedicadas (A100, H100, RTX 4090), por lo que el despliegue en servidor no esta caracterizado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build GenAI de referencia: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Codigo de decide.ts (referencia): https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- Transformers.js: https://github.com/huggingface/transformers.js
- PR de transformers.js (pipeline decision): https://github.com/huggingface/transformers.js/pull/1943
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta Kev: https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
