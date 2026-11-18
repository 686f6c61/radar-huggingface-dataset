# eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

Qwen3-1.7B ContractNLI + CLINC150 + SIB-200 specialist es una adaptacion del modelo base Qwen/Qwen3-1.7B de Alibaba Cloud, publicada por el usuario eduardoworrel. No es un modelo generativo de proposito general: es un especialista de clasificacion que reutiliza las representaciones internas del transformer de Qwen3 y anade cabezas de decision (heads) separadas para tres tareas concretas: inferencia de clausulas en contratos (ContractNLI), clasificacion de intenciones conversacionales (CLINC150) y clasificacion de topicos multilingue (SIB-200).

La distribucion esta empaquetada en formato ONNX con cuantizacion int4 y un layout compatible con Transformers.js, pensado para ejecutarse en navegador mediante WebGPU o en Node con onnxruntime-node. El repositorio incluye los pesos del grafo (`onnx/model_q4.onnx`), los ficheros de cabezas en `heads/` y manifiestos JSON por tarea. La inferencia se orquesta con la libreria propia `@s1s2/web`, que lee las cabezas y aplica la logica de decision; Transformers.js por si solo solo expone el hidden state y los logits del modelo base.

El modelo resulta relevante porque demuestra un patron de despliegue de clasificadores especializados sobre un LLM pequeno cuantizado a int4, con paridad verificada entre el build de referencia (ONNX Runtime GenAI) y este build de Transformers.js: 20/20 decisiones identicas en CPU y 10/10 en WebGPU con diferencia maxima de probabilidad de 0,0026. Es una pieza de infraestructura para sistemas de "System 1 / System 2" en el navegador, no un chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de clasificacion externas; grafo ONNX |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (unico publicado en este repo) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`), cabezas en `heads/`, manifiestos JSON |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1,7 mil millones de parametros. Sobre ese backbone se anaden cabezas de clasificacion independientes (incluida una "pointer head" inspirada en Kev, Apache-2.0) que consumen el hidden state final por token y producen decisiones para tres tareas: ContractNLI (entailment/contradiction/not-mentioned sobre clausulas de contratos), CLINC150 (intenciones de dominio conversacional con clase out-of-scope) y SIB-200 (clasificacion de topicos en 200 idiomas, con manifiestos separados `sib_en` y `sib_pt`).

Los datos de entrenamiento citados son los tres conjuntos publicos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0), CLINC150 (Larson et al., 2019; CC BY 3.0) y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0). No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO; el modelo es un especialista supervisado, no un modelo afinado por preferencias. La innovacion tecnica destacable es el split System 1 / System 2 con "margin gate" (idea atribuida a CT0 de Alias Robotics) y la publicacion de un grafo ONNX con la dimension de cabeza del KV cache fijada para que Transformers.js pueda cargarlo. Este build concreto es byte a byte identico en pesos al build de referencia ONNX Runtime GenAI; solo cambian metadatos y nombres de fichero.

## Capacidades

- Clasificacion de clausulas contractuales (ContractNLI): determinar si una hipotesis esta implicada, contradicha o no mencionada en un contrato.
- Clasificacion de intenciones conversacionales (CLINC150), incluida la deteccion de consultas fuera de dominio.
- Clasificacion de topicos multilingue (SIB-200) con manifiestos especificos para ingles y portugues.
- Inferencia en navegador via WebGPU con Transformers.js 4.3.1 y en Node via onnxruntime-node 1.30.0.
- Exposicion del hidden state por token y de los logits del modelo base si se carga con `AutoModelForCausalLM` de Transformers.js.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto libre como caso de uso principal.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues limitadas a los idiomas declarados (en, pt) y a la cobertura de SIB-200 en esos manifiestos.

## Casos de uso

- Revision automatizada de contratos: clasificar clausulas de un contrato frente a hipotesis predefinidas (por ejemplo, "el acuerdo se renueva automaticamente") usando la cabeza de ContractNLI, con salida de tres clases y umbral de margen para derivar casos ambiguos a revision humana.
- Enrutado de intenciones en asistentes conversacionales: usar CLINC150 para etiquetar la intencion del usuario en un turno y decidir si la consulta cae dentro del dominio soportado o debe escalarse, aprovechando la clase out-of-scope.
- Moderacion y triaje en el navegador: ejecutar el clasificador en el cliente con WebGPU, sin enviar el texto a un servidor, util para aplicaciones con requisitos de privacidad o de baja latencia.
- Clasificacion de topicos en contenidos en ingles y portugues: etiquetar articulos, tickets o mensajes con SIB-200 usando los manifiestos `sib_en` y `sib_pt`.
- Prefiltro en pipelines de documentos legales: descartar o marcar contratos que no contienen clausulas de interes antes de pasarlos a un modelo mayor, reduciendo coste de inferencia.
- Sistemas hibridos System 1 / System 2: usar este especialista como capa rapida de decision y derivar al modelo grande solo los casos con margen bajo, siguiendo el patron descrito en la model card.
- Validacion de despliegue en navegador: servir como referencia para verificar paridad entre builds ONNX Runtime GenAI y Transformers.js en CPU y WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una comprobacion de paridad entre builds: 20 prompts ad hoc en Node CPU con diferencia maxima de hidden state y probabilidades de cabeza de 0, y 20/20 decisiones iguales; en Chrome 157 WebGPU sobre Apple M2 Pro, 10/10 decisiones iguales y diferencia maxima de probabilidad de 0,0026 en 10 prompts. No son resultados de exactitud sobre los conjuntos de test de ContractNLI, CLINC150 ni SIB-200.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB en total; el grafo int4 de 1,7B parametros cabe holgadamente en menos de 2 GB de memoria, aunque no se publica una cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el modo navegador (probado en Apple M2 Pro); para Node, GPU compatibles con onnxruntime-node o ejecucion en CPU.
- Cabe en GPU de consumo: si, por el tamano del grafo int4; no se especifican modelos concretos mas alla del M2 Pro usado en la prueba.
- Opciones de despliegue: `@s1s2/web` con runtime `transformers.js`, Transformers.js directo (`AutoModelForCausalLM` con `dtype: "q4"`) y onnxruntime-node. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que la verificacion se hizo en CPU de Node y en WebGPU de Chrome.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen3-1.7B especialista) | 1,7B | no disponible | Clasificacion (ContractNLI, CLINC150, SIB-200) | CC BY-SA 4.0 | ONNX int4 |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Generacion de texto | Apache-2.0 | safetensors, GGUF |
| Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 1,7B | no disponible | Clasificacion, mismo especialista | CC BY-SA 4.0 | ONNX int4 (runtime GenAI) |
| alias3-web (Alias Robotics) | no disponible | no disponible | Clasificacion en navegador (precursor) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de generacion de texto de proposito general ni un `pipeline` de Transformers.js: las cabezas de decision son ficheros separados que solo lee la libreria s1s2.
- No es compatible con el formato open-jev / Kev.
- La dimension de cabeza del KV cache esta fijada en el grafo por requisito de Transformers.js, lo que limita cambios de configuracion.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificacion erronea en casos ambiguos; el margen de decision debe calibrarse por tarea.
- Cobertura linguistica limitada a en y pt en los manifiestos publicados.
- La licencia CC BY-SA 4.0 impone ShareAlike: los trabajos derivados deben distribuirse bajo la misma licencia, lo que puede condicionar el uso comercial o el empaquetado en productos propietarios.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No se publican resultados de exactitud en los conjuntos de test de las tres tareas, solo pruebas de paridad entre builds.
- El autor del modelo es un usuario individual, no el equipo de Qwen; el soporte y mantenimiento no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build de referencia ONNX Runtime GenAI: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Transformers.js: https://github.com/huggingface/transformers.js
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Kev (pointer head y receta de entrenamiento): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
