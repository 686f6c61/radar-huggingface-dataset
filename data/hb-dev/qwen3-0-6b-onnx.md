# hb-dev/Qwen3-0.6B-ONNX

## Resumen

hb-dev/Qwen3-0.6B-ONNX es una conversion a formato ONNX del modelo Qwen/Qwen3-0.6B, publicada por el usuario hb-dev con el objetivo de hacerlo ejecutable directamente en el navegador mediante Transformers.js. No se trata de un modelo nuevo ni de un reentrenamiento: es una redistribucion de los pesos originales de Qwen3 en su variante mas pequena (0,6 mil millones de parametros), empaquetados para su uso con WebGPU y el ecosistema de inferencia web de Hugging Face.

El modelo base, Qwen3-0.6B, pertenece a la familia Qwen3 desarrollada por Alibaba Qwen (equipo Qwen Team). Es un transformer denso de 0,6B parametros disenado para generacion de texto y conversacion, con capacidad de razonamiento en modo thinking. Su interes principal radica en que es el escalon minimo de la familia Qwen3, lo que lo hace viable en entornos con recursos muy limitados: navegadores, dispositivos de borde y prototipado rapido en JavaScript.

La relevancia de esta ficha concreta es practica: permite desplegar un LLM conversacional sin backend Python, sin GPU dedicada y sin instalar dependencias pesadas, simplemente cargando pesos ONNX cuantizados desde un CDN. El repositorio ocupa 1,2 GB e incluye los pesos en varias precisiones para adaptarse a distintos presupuestos de memoria y hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 0,6 mil millones (segun modelo base Qwen/Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ONNX con dtypes de Transformers.js; la model card ejemplifica `q4f16` |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | ONNX (subcarpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen/Qwen3-0.6B: un transformer denso decoder-only de la familia Qwen3. Esta publicacion no aporta informacion sobre el proceso de entrenamiento del modelo original (numero de tokens, composicion del corpus, fases de RLHF o DPO), por lo que dichos datos deben consultarse en la model card del modelo base. El unico proceso propio de este repositorio es la conversion de los pesos a ONNX mediante herramientas del ecosistema Hugging Face (la model card remite a Optimum para conversiones de este tipo) y su estructuracion en una subcarpeta `onnx` para que Transformers.js los localice automaticamente.

La innovacion tecnica relevante no esta en el modelo sino en el empaquetado: los pesos se ofrecen en formato ONNX con distintos tipos de dato (incluido `q4f16`, cuantizacion a 4 bits con acumulacion en float16) para permitir ejecucion en WebGPU. Esto habilita inferencia en el navegador con aceleracion por GPU del cliente, algo impensable con pesos safetensors en PyTorch. La model card advierte que mantener repositorios ONNX separados es una solucion temporal hasta que WebML gane traccion.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno mediante el pipeline `text-generation` de Transformers.js.
- Soporte de plantillas de chat con roles `system`, `user` y `assistant`, tal como muestra el ejemplo de la model card.
- Generacion en streaming token a token mediante `TextStreamer`, util para interfaces web interactivas.
- Decodificacion determinista (`do_sample: false`) o muestreo, configurable por el llamador.
- Ejecucion en navegador con WebGPU (`device: "webgpu"`) o en Node.js.
- Capacidad de razonamiento heredada de la familia Qwen3 (modo thinking), aunque no se detalla en la informacion disponible como se expone en esta conversion.
- Tool calling, function calling, vision o audio: no disponibles en la informacion proporcionada para esta conversion.

## Casos de uso

- Asistentes embebidos en aplicaciones web: cargar el modelo con Transformers.js y WebGPU permite ofrecer un chatbot que funciona integramente en el cliente, sin enviar conversaciones a un servidor y sin coste de inferencia por token.
- Prototipado rapido de producto: validar una idea de interfaz conversacional en horas usando `npm i @huggingface/transformers` y el CDN de Hugging Face, sin montar infraestructura de GPU.
- Demos y documentacion interactiva: incrustar un generador de texto en paginas de documentacion o tutoriales para que el lector experimente sin instalar nada.
- Extensiones de navegador y aplicaciones Electron: al ser ONNX y ejecutarse en JS, el modelo puede integrarse en entornos de escritorio basados en Chromium con acceso a WebGPU.
- Procesamiento de texto offline en el dispositivo: resumenes, reescritura o clasificacion de texto en entornos sin conectividad una vez descargados los pesos (1,2 GB de repositorio).
- Educacion y experimentacion: estudiar el comportamiento de un LLM de 0,6B con cuantizacion 4-bit y medir el impacto en calidad frente a precisiones mayores, todo desde el navegador.
- Generacion de texto auxiliar de bajo coste: borradores cortos, autocompletado o respuestas plantilla donde no se requiere la calidad de un modelo grande y prima la latencia y el coste cero de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y tampoco aporta cifras de latencia o throughput en WebGPU.

## Requisitos de hardware

- VRAM estimada: con cuantizacion `q4f16`, los 0,6B parametros ocupan del orden de 300-400 MB de memoria; el repositorio completo pesa 1,2 GB porque incluye varias precisiones.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en el navegador (Chrome/Edge en Windows, macOS con Metal, Android con Vulkan). En servidor, una GPU consumer moderna es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU de los ultimos anos, e incluso en iGPU. Tambien es viable en CPU, con mayor latencia.
- Opciones de despliegue: Transformers.js (navegador y Node.js) es la via documentada. Al ser ONNX, tambien podria servirse con ONNX Runtime en otros entornos, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran fuertemente del backend WebGPU del cliente, del dtype elegido y de la longitud de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| hb-dev/Qwen3-0.6B-ONNX | 0,6B | no disponible | ONNX | no disponible | Inferencia web (Transformers.js) |
| Qwen/Qwen3-0.6B | 0,6B | no disponible | safetensors | no disponible en esta ficha | Modelo base original en PyTorch |
| onnx-community/Qwen3-0.6B-ONNX | 0,6B | no disponible | ONNX | no disponible | Conversion ONNX de referencia citada en la model card |

La diferencia entre las tres entradas es de empaquetado y mantenimiento, no de capacidad: los pesos subyacentes son los mismos. La conversion de onnx-community es la referenciada en el codigo de ejemplo de la propia model card, mientras que hb-dev publica una copia alternativa con el mismo proposito. Para produccion conviene evaluar cual de los dos repositorios esta mejor mantenido.

## Limitaciones y advertencias

- Modelo de 0,6B parametros: la calidad de razonamiento, codigo y matematicas sera notablemente inferior a la de modelos de 7B o superiores; no es adecuado para tareas que exijan precision alta.
- Riesgo de alucinacion elevado, especialmente en preguntas factuales y en generacion larga, agravado por la cuantizacion a 4 bits.
- La cuantizacion `q4f16` puede degradar la coherencia y la fidelidad respecto a los pesos originales en fp16/bf16.
- Licencia no declarada en la informacion disponible: antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen3-0.6B en su repositorio original.
- Idiomas soportados no documentados en esta conversion; el comportamiento multilingue dependera del modelo base.
- Longitud de contexto no documentada aqui; consultar la model card de Qwen3-0.6B.
- Dependencia de WebGPU: en navegadores o dispositivos sin soporte, el rendimiento caera a CPU y la experiencia puede ser lenta.
- Copia no oficial: el autor hb-dev no es el equipo Qwen; no hay garantia de actualizaciones ni de soporte.
- La propia model card califica los repositorios ONNX separados como solucion temporal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hb-dev/Qwen3-0.6B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Conversion ONNX de referencia citada en la model card: https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM de Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
- Documentacion de Optimum: https://huggingface.co/docs/optimum/index
