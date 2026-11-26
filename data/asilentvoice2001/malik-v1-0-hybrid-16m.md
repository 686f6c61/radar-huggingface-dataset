# Asilentvoice2001/Malik-v1.0-Hybrid-16M

## Resumen

Malik v1.0 Hybrid-16M es un motor de IA neuro-simbólico de pequeno tamano (16,64 millones de parametros) desarrollado por Ahmed Abdelrahman (Egipto) y publicado bajo el identificador Asilentvoice2001/Malik-v1.0-Hybrid-16M. Combina una red neuronal transformer de 6 capas con un nucleo determinista compuesto por enmascaramiento de logits mediante una maquina de estados finitos (FSM), un sandbox de Python protegido por AST y una base de conocimiento SQLite. El objetivo declarado es ofrecer razonamiento aritmetico y resolucion de problemas verbales verificables en entornos de borde (edge), donde el espacio y la computo son limitados.

El modelo se presenta como una alternativa hibrida: la parte neuronal genera representaciones y lenguaje, mientras que la parte simbolica ejecuta operaciones deterministas y consultas a la base de conocimiento, lo que en teoria reduce la alucinacion. El autor reporta una tasa de alucinacion o falsa abtencion del 0% y una recuperacion del 100% en la base de conocimiento sobre un conjunto de 8 casos.

La relevancia actual radica en su enfoque de "IA verificable" para dispositivos con recursos escasos: un artefacto de 33,3 MB en FP16 deduplicado que cabe en cualquier telefono o microcontrolador con Python. No obstante, la informacion publica es muy limitada (sin model card extendida, sin licencia explicita, sin benchmarks comparativos externos), por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas con GQA (Grouped Query Attention), SwiGLU y RoPE, mas nucleo neuro-simbolico (FSM logit masking, sandbox Python con AST, SQLite KB) |
| Parametros totales | 16,64 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 deduplicado, 33,3 MB) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB; presumiblemente safetensors/binario, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura neuronal es un transformer de 6 capas con atención de consultas agrupadas (GQA), activacion SwiGLU y codificacion posicional rotatoria (RoPE), con 16,64 M de parametros. Sobre esta red se superpone un nucleo determinista: un enmascaramiento de logits guiado por una maquina de estados finitos que restringe las salidas a rutas validas, un sandbox de Python que valida el codigo generado mediante el arbol de sintaxis abstracta (AST) antes de ejecutarlo, y una base de conocimiento SQLite para recuperacion factual.

El autor no detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la estrategia de alineacion ni el proceso de destilacion o entrenamiento del modulo FSM. La innovacion destacable es la combinacion de generacion neuronal con ejecucion simbolica verificable, orientada a eliminar la alucinacion en tareas acotadas (aritmetica y problemas verbales) mediante la delegacion del calculo a un interprete determinista en lugar de confiar en la red.

## Capacidades

- Generacion de texto en ingles y arabe.
- Razonamiento aritmetico verificable mediante el sandbox de Python con validacion AST.
- Resolucion de problemas verbales (word problems) con tasas reportadas del 70,8% al 75,0% en conjuntos held-out.
- Recuperacion de conocimiento desde una base SQLite integrada (100% en 8/8 casos reportados).
- Enmascaramiento de logits por FSM para forzar salidas estructuradas y reducir falsas abtenciones.
- Ejecucion de codigo Python en sandbox aislado como capacidad de tool use interno.
- Orientacion a despliegue en borde (edge-ai) por su reducido tamano.
- No se documenta soporte de vision, audio, tool calling externo, agentes multi-paso ni modo de razonamiento extendido.

## Casos de uso

- Tutoria aritmetica en dispositivos moviles: el modelo puede resolver operaciones paso a paso delegando el calculo al sandbox Python, lo que permite verificar cada resultado y evitar errores de calculo neuronal en aplicaciones educativas offline.
- Asistente de resolucion de problemas verbales en ingles y arabe: adecuado para plataformas de aprendizaje de matematicas en zonas con conectividad limitada, dado su tamano de 33,3 MB y su capacidad de ejecucion local.
- Verificacion de expresiones y calculos en pipelines de datos: el sandbox con validacion AST permite evaluar expresiones generadas por otros modelos o usuarios antes de ejecutarlas, actuando como capa de seguridad.
- Recuperacion factual sobre dominios acotados: la base SQLite integrada permite responder consultas sobre un corpus cerrado con trazabilidad, util en asistentes de documentacion tecnica o normativa interna.
- Prototipado de sistemas neuro-simbolicos en investigacion: sirve como banco de pruebas de bajo coste para estudiar el enmascaramiento FSM y la integracion de sandbox en modelos pequenos.
- Despliegue en entornos air-gapped o de privacidad estricta: al caber en un telefono o en una Raspberry Pi y no requerir conexion, puede procesar datos sensibles sin salir del dispositivo.
- Filtrado y estructuracion de salidas en aplicaciones de borde: el FSM permite forzar formatos validos (JSON, comandos) en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (conjunto v3_cand PASS):

| Benchmark | Resultado |
|---|---|
| Aritmetica held-out (HO / HO2) | 91,7% – 94,4% |
| Problemas verbales held-out (HO / HO2) | 70,8% – 75,0% |
| Recuperacion de base de conocimiento | 100% (8/8) |
| Alucinacion / falsa abtencion | 0% |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los tamanos de los conjuntos de evaluacion no se detallan, salvo el de recuperacion (8 casos), lo que limita la significacion estadistica de los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (33,3 MB de pesos mas overhead de runtime y del interprete Python); en la practica, el cuello de botella es la RAM del sistema, no la GPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer y en practicamente cualquier dispositivo: telefonos, Raspberry Pi, mini-PC.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo depende de un runtime Python propio con el sandbox y la base SQLite, por lo que el despliegue estandar de transformers no cubre el nucleo simbolico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (neuro-simbolicos de ~16M con sandbox Python y FSM). Como referencia de tamano, modelos como SmolLM-135M o Qwen2.5-0.5B son ordenes de magnitud mayores y no incorporan nucleo simbolico, por lo que la comparacion directa no es significativa.

## Limitaciones y advertencias

- Ausencia de licencia explicita: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Model card muy escasa: no se documentan datos de entrenamiento, contexto maximo, tokenizador ni formato exacto de pesos, lo que dificulta la reproducibilidad.
- Resultados de benchmarks con conjuntos pequenos (8 casos en recuperacion) y sin validacion externa; el 0% de alucinacion debe interpretarse solo dentro del dominio evaluado.
- Cobertura linguistica limitada a arabe e ingles; no hay evidencia de rendimiento en castellano.
- El sandbox Python con AST es una mitigacion, no una garantia de seguridad: la ejecucion de codigo generado requiere aislamiento adicional a nivel de sistema (contenedores, seccomp) en produccion.
- Riesgo de alucinacion fuera de las rutas cubiertas por el FSM y la base de conocimiento; el modelo no dispone de mecanismos de abtencion generalizables documentados.
- Repositorio de 0,0 GB y 0 descargas: no se confirma que los pesos esten efectivamente publicados ni que el artefacto sea reproducible.
- Sin soporte documentado de tool calling externo, agentes multi-paso ni contexto largo, lo que limita su uso como componente de sistemas mayores.

## Enlaces

- Hugging Face: https://huggingface.co/Asilentvoice2001/Malik-v1.0-Hybrid-16M
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados al modelo.
