# eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen

EuroLLM-1.7B GDPR + LGPD privacy specialist es una adaptacion del modelo base utter-project/EuroLLM-1.7B-Instruct, desarrollada por el usuario eduardoworrel, orientada a la clasificacion y el razonamiento sobre politicas de privacidad conforme al RGPD europeo y a la LGPD brasilena. El modelo combina el transformer de 1.7B parametros del proyecto UTTER con cabezas de decision entrenadas especificamente para responder preguntas tipadas (si/no, eleccion multiple) sobre el contenido de textos legales de privacidad.

La innovacion principal es la arquitectura S1S2 (System 1 / System 2): un modo rapido de una sola pasada que produce una decision con confianza y margen, y un modo generativo que reutiliza los mismos pesos para explicar la decision cuando el margen es bajo. Se distribuye en formato ONNX con cuantizacion int4 para ejecutarse en el navegador mediante transformers.js y WebGPU, con un pipeline especifico de decision.

Es relevante para desarrolladores que necesitan auditar o clasificar politicas de privacidad en el cliente (navegador) sin enviar datos a servidores externos, y para investigadores interesados en arquitecturas de decision duales aplicadas a dominios legales regulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base EuroLLM-1.7B-Instruct) con cabezas de decision S1S2 |
| Parametros totales | 1.7B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX q4) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (model_q4.onnx), cabezas en heads/, manifest.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-1.7B-Instruct (UTTER project, Apache-2.0), un transformer decoder-only multilingue europeo. Sobre ese backbone se anaden cabezas de decision separadas (ficheros en heads/) que operan sobre los hidden states en posiciones de lectura especificas, siguiendo el esquema S1S2: una pasada de "System 1" produce una eleccion entre opciones con probabilidad y margen; si el margen es bajo, se invoca el modo generativo "System 2" con los mismos pesos para explicar la decision.

Los datos de entrenamiento incluyen GDPR-Transparency-200 (tomcory/privacy-policy-annotator, GPL-3.0), el corpus Claudinha para LGPD (Tocchini et al., Zenodo 13371639, CC BY 4.0) y datos sinteticos Kev (legacy_policy, compositional). La receta de entrenamiento y la cabeza pointer provienen de Kev (Apache-2.0). La idea de separacion System 1 / System 2 y la compuerta por margen se atribuyen a CT0 de Alias Robotics y a los precursores alias3-web y el paper Browser Immune System (arXiv 2611.15302). No se detalla el numero de tokens de entrenamiento ni si hubo RLHF/DPO especifico para esta adaptacion.

## Capacidades

- Clasificacion de textos de politicas de privacidad mediante preguntas tipadas (choice, yes/no) con salida de eleccion, confianza y margen.
- Razonamiento de una sola pasada (System 1) con cabezas de decision entrenadas.
- Generacion de explicaciones en lenguaje natural (System 2) reutilizando los mismos pesos cuando el margen es bajo.
- Soporte de preguntas compuestas mediante manifiestos (manifest.json, manifest.pt.json) con etiquetas y consignas predefinidas.
- Ejecucion en navegador con transformers.js y WebGPU, o en CPU via WASM.
- Capacidades multilingues limitadas a en y pt.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- No se documenta vision ni audio.

## Casos de uso

- Auditoria de politicas de privacidad en el navegador: el modelo permite clasificar si un texto aborda categorias concretas (por ejemplo, destinatarios de los datos) sin enviar el contenido a un servidor, gracias a la ejecucion ONNX int4 en WebGPU.
- Cumplimiento RGPD en herramientas internas: integrado en un panel de revision legal, el modo System 1 marca pasajes que abordan requisitos del RGPD y el modo System 2 genera una justificacion breve para el revisor cuando el margen es bajo.
- Cumplimiento LGPD en portugues: el manifiesto manifest.pt.json permite aplicar el mismo flujo a textos en portugues para el mercado brasileno.
- Triaje automatizado de documentos legales: clasificacion rapida de grandes volumenes de politicas para priorizar la revision humana, usando la confianza y el margen como criterio de enrutamiento.
- Extensiones de navegador para transparencia: una extension puede analizar la politica de privacidad de la pagina visitada en el cliente y mostrar alertas sobre clausulas relevantes.
- Investigacion en arquitecturas duales: el modelo sirve como referencia reproducible para estudiar la separacion System 1 / System 2 y las compuertas por margen en tareas de decision legal.
- Prototipado de asistentes de privacidad: el ejemplo de la model card muestra como encadenar decide() y generate() para construir un asistente que responde y justifica en dos frases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta pruebas de paridad y latencia:

| Prueba | Entorno | Resultado |
|---|---|---|
| Paridad con build GenAI (hidden states) | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) | max abs diff 0 |
| Paridad de probabilidades de cabeza | Node CPU | max abs diff 0 |
| Paridad de decisiones | Node CPU, 20 prompts | 20/20 iguales |
| Paridad de decisiones | Chrome 157 WebGPU (Apple M2 Pro), 20 prompts | 20/20 iguales |
| Latencia por decision | WebGPU, M2 Pro | 0.15 s |
| Memoria de pagina | WebGPU | 0.2 GB (buffers GPU no contados) |
| Latencia por decision | CPU (WASM), M2 Pro | 2.7 s |
| Memoria de pagina | CPU (WASM) | 2.9 GB (pico de pestana 4.1 GB al cargar) |
| Coincidencia WebGPU vs CPU | 20 prompts | 20/20 |
| Acuerdo pipeline("decision") vs cabeza entrenada | Node CPU, 20 prompts | 11/20 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 1.3 GB y los pesos son int4, por lo que la huella de pesos ronda ese orden de magnitud.
- GPU recomendadas: no se especifican; la model card valida WebGPU en Apple M2 Pro y CPU via WASM.
- Cabe en GPU consumer: si, al ser un modelo de 1.7B en int4; se ha probado en hardware Apple M2 Pro.
- Opciones de despliegue: transformers.js con WebGPU o WASM en navegador; onnxruntime-node en Node; la libreria s1s2 (necesaria para leer las cabezas de decision); pipeline("decision") de transformers.js solo con el PR #1943 y con menor fidelidad.
- Latencia y throughput: 0.15 s por decision en WebGPU (M2 Pro) y 2.7 s en CPU WASM; memoria de pagina 0.2 GB en WebGPU y 2.9 GB en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2 | 1.7B | no disponible | Clasificacion de privacidad con cabezas S1S2, ONNX int4 | GPL-3.0 | Hugging Face (299 descargas) |
| utter-project/EuroLLM-1.7B-Instruct | 1.7B | no disponible | Modelo base instructivo multilingue europeo | Apache-2.0 | Hugging Face |
| eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2 | 1.7B | no disponible | Misma especialidad, layout ONNX Runtime GenAI | GPL-3.0 | Hugging Face |
| aliasrobotics/alias3-web | no disponible | no disponible | Precursor web de decisiones de seguridad | no disponible | Hugging Face |

## Limitaciones y advertencias

- Las cabezas de decision son ficheros separados y transformers.js por si solo no las lee; es necesario usar la libreria s1s2 para obtener la fidelidad reportada.
- El pipeline("decision") de transformers.js lee logits de etiquetas, no la cabeza entrenada: solo coincide en 11 de 20 prompts de comprobacion.
- La licencia es GPL-3.0 por herencia de los datos GDPR-Transparency-200; el uso comercial debe respetar las obligaciones de copyleft.
- Idiomas limitados a en y pt; no hay soporte documentado de castellano ni de otras lenguas.
- Riesgo de alucinacion en el modo generativo (System 2): las explicaciones son texto libre y deben validarse.
- Sesgos no documentados en la informacion disponible; el corpus legal puede no representar todos los sectores ni jurisdicciones.
- La compuerta por margen (0.2 en el ejemplo) es un valor ilustrativo; el autor recomienda medir el umbral propio.
- La dimension de cabeza del KV cache esta fijada en el grafo por requisito de transformers.js; el resto del grafo es el de GenAI.
- No se documentan benchmarks estandar de calidad, por lo que la evaluacion en produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Codigo de decision (decide.ts): https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de transformers.js para pipeline("decision"): https://github.com/huggingface/transformers.js/pull/1943
- transformers.js: https://github.com/huggingface/transformers.js
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Kev (receta de entrenamiento y cabeza pointer): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
