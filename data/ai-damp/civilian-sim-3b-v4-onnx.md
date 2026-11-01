# AI-damP/civilian-sim-3b-v4-onnx

## Resumen
`AI-damP/civilian-sim-3b-v4-onnx` es una distribucion en formato ONNX del modelo `AI-damP/civilian-sim-3b-v3`, un modelo de lenguaje de 3.000 millones de parametros orientado a generacion de texto conversacional. Lo publica el usuario AI-damP y su proposito principal es facilitar la ejecucion del modelo en el navegador o en entornos JavaScript mediante Transformers.js y WebGPU, evitando la necesidad de infraestructura Python o servidores de inferencia dedicados.

La version que nos ocupa aplica cuantizacion de 4 bits (q4f16) con un esquema asimetrico de bloques de 32 elementos, lo que reduce el peso del repositorio a 2,5 GB. El modelo base declara licencia llama3.2, lo que sugiere que deriva de la familia Llama 3.2, aunque la model card no aporta detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento.

La relevancia de esta publicacion es practica: permite desplegar un modelo conversacional de 3B en clientes ligeros, prototipos web y aplicaciones de escritorio basadas en JavaScript. Sin embargo, la informacion publica es muy limitada: no se documentan idiomas, datos de entrenamiento, benchmarks ni el formato exacto del system prompt, lo que condiciona su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de `AI-damP/civilian-sim-3b-v3`, presumiblemente transformer decoder-only de la familia Llama 3.2) |
| Parametros totales | 3.000 millones (deducido del nombre del modelo) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (4 bits, asimetrica, block_size 32, nombre `asym-b32`) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | ONNX (repo de 2,5 GB) |

## Arquitectura y entrenamiento
La model card no describe la arquitectura del modelo base. Por el nombre (`3b`) y la licencia `llama3.2`, se puede inferir que se trata de un transformer decoder-only de aproximadamente 3.000 millones de parametros, probablemente derivado o inspirado en la familia Llama 3.2, pero esta afirmacion no esta confirmada en la documentacion disponible.

Respecto al entrenamiento, no se publican datos sobre volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni procesos de ajuste fino. La unica informacion tecnica concreta es el proceso de conversion a ONNX: cuantizacion de 4 bits asimetrica con bloques de 32, validada contra el modelo original en PyTorch sobre conversaciones de validacion, con resultados recogidos en un fichero `conversion_report.json` que no se incluye en la informacion proporcionada. La model card indica que debe usarse el mismo formato de system prompt que en el entrenamiento, pero no especifica cual es.

## Capacidades
- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Ejecucion en navegador y entornos JavaScript mediante Transformers.js con soporte WebGPU.
- Inferencia con pesos cuantizados a 4 bits (`dtype: "q4f16"`), lo que reduce requisitos de memoria frente al modelo original.
- Compatibilidad con el pipeline `text-generation` de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles en la informacion publicada.

## Casos de uso
- **Chatbot embebido en una web**: el modelo puede cargarse directamente en el navegador del usuario mediante Transformers.js y WebGPU, eliminando la necesidad de un backend de inferencia y reduciendo la latencia de red. Es adecuado por su tamano de 3B y su empaquetado ONNX de 2,5 GB.
- **Prototipado rapido de asistentes conversacionales**: al no requerir Python ni GPU dedicada en servidor, permite iterar sobre prompts y flujos conversacionales en un entorno JavaScript, util para equipos de frontend.
- **Aplicaciones de escritorio Electron o Tauri**: la distribucion ONNX puede integrarse en apps de escritorio que ejecuten el modelo localmente, preservando la privacidad del usuario al no enviar datos a un servidor.
- **Demostraciones y entornos educativos**: su peso moderado y su licencia Llama 3.2 lo hacen util para talleres y cursos sobre despliegue de LLM en el navegador, siempre que se respeten los terminos de la licencia.
- **Asistentes offline en dispositivos con recursos limitados**: la cuantizacion q4f16 reduce la huella de memoria, lo que permite ejecucion en portatiles con GPU integrada o en equipos sin GPU dedicada, con la latencia que ello implique.
- **Generacion de respuestas en formularios o interfaces de soporte**: puede integrarse como capa de sugerencia de texto en herramientas internas, aprovechando el soporte conversacional y el formato ONNX para despliegue ligero.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona un `conversion_report.json` con comprobaciones de fidelidad frente al modelo original en PyTorch, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware
- **VRAM estimada**: el repositorio ONNX pesa 2,5 GB; en q4f16 se puede estimar un consumo en torno a 2-3 GB de memoria para pesos, mas el overhead de activaciones y KV cache, que depende de la longitud de contexto (no documentada).
- **GPU recomendadas**: para ejecucion en navegador, se requiere WebGPU; GPUs de escritorio como RTX 3060, RTX 4060 o superiores pueden ejecutar el modelo con comodidad. En servidor, A100 o H100 no son necesarias para un modelo de 3B cuantizado.
- **Consumer GPU**: si, cabe en GPUs de consumo con 4-6 GB de VRAM o superior, e incluso en equipos con GPU integrada compatible con WebGPU, con rendimiento variable.
- **Opciones de despliegue**: Transformers.js (libreria declarada), ONNX Runtime Web, y potencialmente ONNX Runtime en servidor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato.
- **Latencia y throughput**: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `AI-damP/civilian-sim-3b-v4-onnx` | 3B | no disponible | llama3.2 | ONNX q4f16 | Enfoque navegador/Transformers.js |
| Llama 3.2 3B Instruct | 3B | 128k (segun documentacion publica de Meta) | Llama 3.2 | safetensors, GGUF | Modelo de referencia de la familia; ampliamente soportado |
| Qwen2.5 3B Instruct | 3B | 32k (segun documentacion publica) | Apache 2.0 | safetensors, GGUF, ONNX | Alternativa permisiva con buen soporte multilingue |
| Phi-3.5-mini | 3,8B | 128k (segun documentacion publica) | MIT | safetensors, GGUF, ONNX | Enfoque en razonamiento y codigo |

La comparacion con Llama 3.2 3B, Qwen2.5 3B y Phi-3.5-mini se basa en datos publicos de sus respectivas documentaciones; no se dispone de benchmarks del modelo `civilian-sim-3b-v4-onnx` para comparar rendimiento real.

## Limitaciones y advertencias
- **Informacion insuficiente**: no se documentan arquitectura exacta, contexto, idiomas, datos de entrenamiento ni proceso de alineacion, lo que impide evaluar sesgos y calidad con rigor.
- **Riesgo de alucinacion**: como todo modelo generativo de 3B sin documentacion de alineacion, es probable que produzca contenido inventado, especialmente en tareas factuales.
- **Sesgos desconocidos**: al no publicarse la composicion del dataset, no se pueden anticipar sesgos de genero, idioma o dominio.
- **Licencia Llama 3.2**: el uso comercial esta sujeto a los terminos de la licencia Llama 3.2 de Meta, que incluyen restricciones y obligaciones de atribucion; es imprescindible revisarla antes de desplegar en produccion.
- **Formato ONNX q4f16**: la cuantizacion de 4 bits puede degradar la calidad respecto al modelo original; la model card no cuantifica esa perdida.
- **Dependencia de WebGPU**: el despliegue en navegador requiere soporte de WebGPU, aun no universal en todos los navegadores y dispositivos.
- **System prompt no especificado**: la model card indica usar el mismo formato que en entrenamiento, pero no lo documenta, lo que puede afectar al comportamiento del modelo.
- **Sin garantias de mantenimiento**: el repositorio tiene 0 likes y 206 descargas, sin senales de soporte activo por parte del autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AI-damP/civilian-sim-3b-v4-onnx
- Modelo base: https://huggingface.co/AI-damP/civilian-sim-3b-v3
- Transformers.js: https://github.com/huggingface/transformers.js
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
