# IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-GGUF

## Resumen

d1-2B-Desktop-OS-EN-HE-v4-GGUF es un ajuste fino (finetune) del modelo LiquidAI/d1-2B, publicado por IdanTayree, orientado a la automatizacion de escritorio y a la evaluacion calibrada de seguridad de acciones destructivas en ingles y hebreo (RTL). No es un LLM conversacional de proposito general: es un modelo de decision de un solo paso hacia delante (single-forward-pass) que devuelve tres tipos de lectura: `noul` (si/no), `choice` (seleccion de objetivo de interfaz) y `score` (puntuacion calibrada). El modelo base, LiquidAI/d1-2B, pertenece a la familia LFM3 de Liquid AI y esta disenado como modelo de decision y grounding multimodal.

Este repositorio distribuye exclusivamente pesos en formato GGUF para llama.cpp (compilacion b11960+ o v0.8.0+), con cuantizaciones Q8_0 y Q4_K_M, ademas de proyectores de vision `mmproj` en F16 y Q8_0. El ajuste se ha fusionado sin perdida en BF16 sobre el modelo base (155/155 capas, mezcla 50/50 de dos deltas) antes de la cuantizacion, con el objetivo de evitar deriva por doble cuantizacion. El modelo tiene 1.728.801.600 parametros totales y esta pensado para ejecutarse localmente en CPU y GPU de Windows, Linux y macOS a traves de Maestro, el proyecto de automatizacion del propio autor.

Su relevancia actual radica en que aborda un problema concreto de los agentes de interfaz grafica: la seleccion de objetivos de UI y el bloqueo de acciones destructivas con latencias por debajo de 100 ms en hardware de consumo. Segun los datos del autor, el finetune mejora de forma notable la calibracion de seguridad respecto al modelo base, especialmente en hebreo y en escenarios multi-OS no vistos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-2B, familia LFM3; arquitectura concreta no detallada en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M (pesos); mmproj en F16 y Q8_0 |
| Idiomas soportados | en, he, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face, con license_name lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LiquidAI/d1-2B mas alla de su pertenencia a la familia LFM3 y su naturaleza de modelo de decision multimodal con vision integrada. El repositorio describe el proceso de ajuste: se parte de dos deltas de finetune (v3 y v4) sobre LiquidAI/d1-2B, se combinan al 50/50 y se fusionan sin perdida en float32 sobre los pesos BF16 del modelo base, cubriendo 155 de 155 capas con un max|ΔW| de 0.00289. Posteriormente se aplica una cuantizacion GGUF en un solo paso, evitando la doble cuantizacion.

El entrenamiento se orienta a dos tareas: la seleccion de objetivos de interfaz (UI grounding) en escritorios Windows, Linux y macOS, y la puntuacion calibrada de seguridad de acciones destructivas en ingles y hebreo. El modelo incorpora metadatos de plantilla `systemone` y un fichero `calibration.json` embebido. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. Tampoco se detalla si emplea tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Decision de un solo paso hacia delante con tres tipos de lectura: `noul` (respuesta si/no), `choice` (seleccion de objetivo de UI) y `score` (puntuacion calibrada).
- Grounding multimodal de capturas de pantalla mediante el proyector de vision `mmproj`, con comprobacion de presencia de elementos.
- Puntuacion calibrada de seguridad para acciones destructivas (por ejemplo, vaciar la papelera, confirmar un pago o forzar el cierre de una aplicacion).
- Soporte bilingue ingles-hebreo con manejo de texto RTL.
- Cobertura declarada de 17 idiomas, aunque el ajuste especifico se centra en ingles y hebreo.
- Integracion con llama.cpp a traves del endpoint `/v1/systemone`, con soporte de CPU, CUDA, Vulkan y Metal.
- No es un modelo de chat ni de generacion libre de texto; su uso esta limitado a las lecturas de decision descritas.

## Casos de uso

- Automatizacion de escritorio multi-OS: el modelo selecciona el objetivo de interfaz correcto (`choice`) a partir de una captura o de un arbol de accesibilidad, lo que permite a un agente hacer clic en el elemento adecuado en Windows, Linux o macOS con una latencia mediana de unos 72-76 ms.
- Puerta de seguridad para acciones destructivas: antes de ejecutar una operacion irreversible, el agente consulta la puntuacion calibrada del modelo y la bloquea si supera el umbral; los datos del autor muestran una tasa de acierto del 100% en la matriz en vivo de macOS y Windows 11 con 30 casos en ingles y hebreo.
- Comprobacion de presencia de elementos en pantalla: mediante el proyector `mmproj`, el modelo verifica si un boton o dialogo aparece en una captura, con una latencia mediana de vision de unos 172 ms, adecuada para bucles de verificacion tras una accion.
- Agentes de computer-use en produccion: el modelo actua como componente de decision local de bajo coste dentro de un pipeline mayor, reduciendo la dependencia de APIs remotas y el coste por paso.
- Soporte de interfaz en hebreo y RTL: aplicaciones dirigidas a usuarios hebreoparlantes pueden validar la seleccion de objetivos y la seguridad de acciones con un modelo que maneja texto RTL de forma nativa.
- Despliegue en portatiles sin GPU: la variante Q4_K_M ocupa 1,02 GiB y permite inferencia solo en CPU con una degradacion de seguridad nula segun el autor, lo que habilita la automatizacion local en equipos de gama baja.
- Evaluacion y auditoria de politicas de seguridad: el modo `score` permite medir la peligrosidad de una accion propuesta antes de integrarla en un flujo automatizado, util para pruebas de regresion de agentes.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor y se obtuvieron en vivo con `llama-server` (commit a28feb4) sobre 222 llamadas de texto/UIA y 20 llamadas multimodales con `mmproj` por cuantizacion.

| Benchmark | Base LiquidAI/d1-2B | GGUF Q8_0 | GGUF Q4_K_M | Delta vs base |
|---|---:|---:|---:|---:|
| Seguridad en hebreo QA-72 (prefijado @ 0.20) | 14/16 (87,5%) | 16/16 (100,0%) | 16/16 (100,0%) | +12,5 pp |
| Seguridad en hebreo QA-72 (prefijado @ 0.50) | 13/16 (81,3%) | 16/16 (100,0%) | 16/16 (100,0%) | +18,8 pp |
| Seguridad en hebreo QA-72 (independiente @ 0.20) | 16/16 (100,0%) | 16/16 (100,0%) | 16/16 (100,0%) | preservado |
| Seguridad en hebreo QA-72 (independiente @ 0.50) | 13/16 (81,3%) | 16/16 (100,0%) | 16/16 (100,0%) | +18,8 pp |
| Seguridad de escritorio solo en ingles (v4, EN no visto) | 83,3% | 100,0% | 100,0% | +16,7 pp |
| Seguridad cross-OS no vista (v4, 76 contrastes) | 85,1% destr. | 96,1% destr. (100% choice y EN) | 97,4% destr. (100% choice y EN) | +11,0-12,3 pp |
| Seguridad bilingue no vista (v1, 52 contrastes) | 78,9% destr. | 96,2% destr. (100% EN) | 96,2% destr. (100% EN) | +17,3 pp |
| Matriz de seguridad en vivo macOS + Windows 11 (30 EN/HE) | no disponible | 30/30 (100,0%, 0 FP, 0 FN) | 30/30 (100,0%, 0 FP, 0 FN) | no disponible |
| Presencia en capturas con mmproj (20 EN/HE) | no disponible | 10/10 recall, 10/10 TNR en ausencia | 10/10 recall, 10/10 TNR en ausencia | no disponible |
| Latencia de texto mediana / p95 (222 llamadas) | no disponible | 72,5 ms / 93,1 ms | 75,8 ms / 95,6 ms | no disponible |
| Latencia de vision mediana con mmproj (20 capturas) | no disponible | 172,2 ms | 176,2 ms | no disponible |

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,02 GiB con Q4_K_M y 1,72 GiB con Q8_0 para los pesos; el proyector de vision anade 193,6 MiB (Q8_0) o 361,4 MiB (F16).
- GPU recomendadas: no se especifican modelos concretos en la informacion proporcionada; el autor indica compatibilidad con CUDA, Vulkan y Metal, ademas de CPU.
- Cabe en GPU de consumo: si, dado el reducido tamano de los pesos; el autor recomienda Q8_0 para sistemas con 16 GB o mas de RAM y Q4_K_M para portatiles y equipos solo con CPU.
- Opciones de despliegue: llama.cpp (compilacion b11960+ o v0.8.0+), `llama-server` con el endpoint `/v1/systemone`, y Maestro como cliente de referencia. Para Apple Silicon existe una variante MLX de 8 bits en un repositorio separado.
- Latencia y throughput: mediana de 72,5 ms y p95 de 93,1 ms para texto con Q8_0; mediana de 172,2 ms para vision con `mmproj`, lo que equivale a unos 5,8 FPS locales en tareas de vision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| d1-2B-Desktop-OS-EN-HE-v4-GGUF (este) | 1,73 B | no disponible | Decision y grounding de UI, seguridad calibrada | lfm1.0 | GGUF en Hugging Face |
| LiquidAI/d1-2B (base) | no disponible | no disponible | Decision multimodal y grounding | no disponible | Hugging Face |
| d1-2B-Desktop-OS-EN-HE-v4-MLX-8bit | 1,73 B (derivado del mismo finetune) | no disponible | Igual que este, con lectura `box` adicional | lfm1.0 | MLX 8 bits en Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la informacion proporcionada; la comparativa se limita al modelo base y a la variante MLX del mismo autor.

## Limitaciones y advertencias

- No es un LLM de chat ni de generacion de texto: solo produce las lecturas `noul`, `choice` y `score`; usarlo fuera de ese contrato dara resultados sin sentido.
- El ajuste especifico se centra en ingles y hebreo; el rendimiento en los otros 15 idiomas declarados no esta verificado en la informacion disponible.
- Los benchmarks presentados son del propio autor y se obtuvieron con su cliente Maestro y su conjunto de pruebas; no hay validacion independiente.
- Riesgo de alucinacion en la seleccion de objetivos de UI cuando la captura o el arbol de accesibilidad son ambiguos; no se documentan tasas de error fuera de los conjuntos de prueba del autor.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de desplegar en produccion.
- El modelo depende de umbrales de calibracion (`calibration.json`); un umbral mal ajustado puede generar falsos positivos o falsos negativos en el bloqueo de acciones destructivas.
- La cuantizacion Q4_K_M, aunque el autor afirma que no degrada la seguridad, reduce la fidelidad numerica respecto a Q8_0 y podria afectar a casos limite no cubiertos por las pruebas.
- No se documentan sesgos conocidos ni el proceso de alineacion del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-GGUF
- Modelo base LiquidAI/d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Variante MLX 8 bits: https://huggingface.co/IdanTayree/d1-2B-Desktop-OS-EN-HE-v4-MLX-8bit
- Proyecto Maestro: https://github.com/IdanTayree/Maestro
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Resultados de evaluacion GGUF (referenciados en la model card): benchmarks/eval_v4_gguf.json dentro del repositorio
