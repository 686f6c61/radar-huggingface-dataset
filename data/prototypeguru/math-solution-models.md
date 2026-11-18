# prototypeguru/math-solution-models

## Resumen

`prototypeguru/math-solution-models` no es un modelo entrenado desde cero, sino un repositorio de distribucion que empaqueta dos modelos de terceros para su uso offline en una aplicacion Android llamada Math Solution App. El pack "Question Reader" contiene UniMERNet-small, un modelo de reconocimiento de formulas matematicas en imagenes convertido de PyTorch a ONNX y cuantizado a INT8 (209 MB). El pack "AI Solver" contiene DeepSeek-R1-Distill-Qwen-1.5B en formato GGUF con cuantizacion Q4_K_M (1117 MB), sin modificaciones respecto al original.

El paquete resuelve un caso de uso concreto: reconocimiento optico de formulas matematicas (OCR especializado) seguido de resolucion razonada del problema, todo ejecutandose en el dispositivo sin conexion a red. La relevancia es practica: demuestra un pipeline on-device completo con dos runtimes distintos (ONNX Runtime para vision y llama.cpp para generacion de texto) y checksums SHA-256 verificables en `models.json`.

El tamano total del repositorio es de 1,3 GB y los pesos declarados en safetensors suman 1.777.088.000 parametros, cifra que corresponde al modelo de lenguaje subyacente (Qwen-1.5B) y no a un modelo propio del autor. No hay informacion sobre pipeline, idiomas soportados ni resultados de evaluacion propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos independientes: UniMERNet-small (vision, encoder + decoder con KV cache) y DeepSeek-R1-Distill-Qwen-1.5B (transformer decoder-only) |
| Parametros totales | 1.777.088.000 (safetensors); el pack de vision no declara recuento de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (UniMERNet-small, pesos); Q4_K_M (DeepSeek-R1-Distill-Qwen-1.5B, GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Mixta: MIT (DeepSeek-R1-Distill-Qwen-1.5B) y Apache-2.0 (UniMERNet-small); campo `license: other` con `license_name: mixed-mit-apache-2.0` |
| Formato de pesos | ONNX (pack de vision) y GGUF (pack de lenguaje) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Agrupa dos artefactos ya existentes. UniMERNet-small, de OpenDataLab, es un modelo de reconocimiento de formulas matematicas con arquitectura encoder-decoder; el autor lo ha convertido de PyTorch a ONNX, separando encoder y decoder con KV cache, y ha aplicado cuantizacion de pesos a INT8. Segun la model card, la salida se verifico contra el modelo original, aunque no se detalla la metodologia ni el conjunto de validacion empleado.

DeepSeek-R1-Distill-Qwen-1.5B, de DeepSeek, es un transformer decoder-only destilado a partir de DeepSeek-R1 sobre la base de Qwen-1.5B, con entrenamiento orientado a razonamiento (cadenas de pensamiento). En este repositorio se distribuye en GGUF Q4_K_M sin modificaciones. No se aportan datos sobre tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones tecnicas adicionales mas alla de la conversion ONNX y la cuantizacion INT8 del pack de vision.

## Capacidades

- Reconocimiento de formulas matematicas en imagenes (UniMERNet-small), incluyendo notacion matematica compleja manuscrita o impresa.
- Generacion de texto y razonamiento paso a paso (DeepSeek-R1-Distill-Qwen-1.5B), heredado del entrenamiento de destilacion de DeepSeek-R1.
- Resolucion de problemas matematicos como caso de uso principal del pipeline combinado.
- Ejecucion completamente offline en dispositivo movil, sin llamadas a red.
- Integracion via ONNX Runtime (vision) y llama.cpp (lenguaje).
- Verificacion de integridad mediante SHA-256 declarado en `models.json`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; el modelo de lenguaje es de razonamiento por destilacion, pero no se documenta orquestacion.
- Capacidades multilingues: no disponible.
- Vision, audio, thinking mode: solo vision para OCR de formulas; no se documenta audio ni modo thinking explicito.

## Casos de uso

- Digitalizacion de apuntes y libros de texto: la app captura una foto de una formula, UniMERNet-small la transcribe a LaTeX y el resultado se muestra o se pasa al solver, todo sin conexion.
- Tutoria matematica offline: DeepSeek-R1-Distill-Qwen-1.5B genera explicaciones paso a paso de ejercicios resueltos, util en entornos sin cobertura de red (aulas rurales, examenes).
- Verificacion de ejercicios en apps educativas: el pipeline reconoce el enunciado y produce una solucion razonada que el estudiante puede contrastar.
- Prototipado de pipelines on-device: sirve como referencia para combinar ONNX Runtime y llama.cpp en una misma aplicacion Android con checksums verificables.
- Investigacion sobre cuantizacion en movil: permite comparar calidad de UniMERNet INT8 frente al original y de Qwen-1.5B en Q4_K_M en hardware real.
- Distribucion reproducible de modelos: el `models.json` con tamanos y SHA-256 facilita auditorias de integridad en despliegues corporativos o educativos.
- Asistencia a personas con discapacidad visual: lectura en voz alta de formulas transcritas y resolucion guiada del problema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el pack de vision ocupa 209 MB en disco (INT8) y el de lenguaje 1117 MB (Q4_K_M); en ejecucion, la RAM necesaria sera superior al tamano de los pesos, pero no se proporcionan cifras exactas.
- GPU recomendadas: no disponible; el diseno es on-device para Android, no para servidores con A100/H100.
- GPU de consumo: no se documenta soporte para RTX 4090 ni similares; el objetivo es CPU/NPU movil.
- Opciones de despliegue: ONNX Runtime para UniMERNet-small y llama.cpp para el GGUF; tambien podria ejecutarse el GGUF con Ollama u otros frontends compatibles con llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| prototypeguru/math-solution-models | 1.777 M (LLM) + vision | no disponible | ONNX + GGUF | MIT + Apache-2.0 | Pipeline OCR de formulas + razonamiento on-device |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M | no disponible en esta ficha | safetensors, GGUF | MIT | Razonamiento matematico destilado |
| opendatalab/UniMERNet | no disponible | no disponible | PyTorch | Apache-2.0 | Reconocimiento de formulas matematicas |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens (segun documentacion publica de Qwen) | safetensors, GGUF | Apache-2.0 | Instrucciones generales, sin destilacion de razonamiento |

La comparativa refleja que este repositorio no aporta un modelo nuevo, sino un empaquetado reproducible de dos modelos existentes con cuantizaciones especificas.

## Limitaciones y advertencias

- No es un modelo original: cualquier evaluacion de calidad debe hacerse sobre UniMERNet-small y DeepSeek-R1-Distill-Qwen-1.5B por separado.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion; el modelo de lenguaje de 1.5B es propenso a errores en razonamiento matematico complejo.
- Longitud de contexto e idiomas soportados no declarados: no se puede garantizar cobertura multilingue ni conversaciones largas.
- La licencia es mixta y requiere revisar `licenses/` para uso comercial; el campo `license: other` impide asumir MIT o Apache-2.0 de forma global.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; la verificacion de salida del pack ONNX la declara el propio autor.
- La fecha de creacion (2026-11-18) es futura respecto a la mayoria de referencias; conviene confirmar la procedencia de los artefactos antes de usarlos en produccion.
- Orientado a Android on-device; no hay soporte documentado para servidores, vLLM o TGI.
- La cuantizacion INT8 del modelo de vision y Q4_K_M del LLM introducen perdida de precision no cuantificada en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prototypeguru/math-solution-models
- Licencias del repositorio: https://huggingface.co/prototypeguru/math-solution-models/tree/main/licenses
- UniMERNet (OpenDataLab, GitHub): https://github.com/opendatalab/unimernet
- DeepSeek-R1-Distill-Qwen-1.5B (modelo base del pack AI Solver): no se proporciona enlace directo en la informacion disponible
- Documentacion de llama.cpp: no disponible en la informacion proporcionada
- Documentacion de ONNX Runtime: no disponible en la informacion proporcionada
