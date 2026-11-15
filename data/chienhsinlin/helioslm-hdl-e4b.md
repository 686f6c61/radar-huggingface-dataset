# chienhsinlin/helioslm-hdl-e4b

## Resumen

HeliosLM HDL E4B (羲和 HDL E4B) es un ajuste fino de Google Gemma 4 E4B-it especializado en diseno de hardware digital: escritura de RTL en Verilog y SystemVerilog, edicion de modulos existentes y correccion de errores a partir de mensajes de compilador o logs de test fallidos. Lo publica Bitstar Inc. bajo licencia Apache-2.0, con un total de 7.941.100.874 parametros segun los pesos en safetensors y un repositorio de 15,9 GB en bf16.

El modelo parte de la arquitectura Gemma 4 E4B (variante "efectiva" de 4B con parametros totales cercanos a 8B) y se entrena en tres fases: entrenamiento continuado con aprendizaje por refuerzo usando el resultado de simulacion como recompensa, una inyeccion de "chat vector" al 0,5x para preservar las capacidades conversacionales del modelo base, y un LoRA final sobre ejercicios de edicion de RTL y depuracion, fusionado en los pesos.

Su relevancia es concreta: los modelos generalistas rinden de forma irregular en HDL, donde la correccion sintactica y la sintetizabilidad son requisitos duros. HeliosLM se entrena exclusivamente con codigo que pasa Verilator lint y sintesis con Yosys, y excluye explicitamente los conjuntos de evaluacion (VerilogEval, RTLLM, CVDP) del entrenamiento. Los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B), ajuste fino supervisado + RL + LoRA fusionado |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `--max-model-len 16384`) |
| Tipos de cuantizacion | bf16 en el repo principal; GGUF en el repo `helioslm-hdl-e4b-GGUF` (niveles no especificados) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E4B-it: un transformer decoder-only con atencion por capas y el esquema de "parametros efectivos" de la familia E de Gemma, que reparte capacidad en capas de embedding y periferia manteniendo un coste de inferencia bajo. El autor describe el modelo como "text only" pese a que los tags de Hugging Face incluyen `image-text-to-text`, herencia del modelo base multimodal; la model card no documenta capacidades de vision en este ajuste.

El pipeline de entrenamiento tiene tres etapas documentadas. Primero, entrenamiento continuado y RL sobre proyectos Verilog/SystemVerilog publicos y sintetizables, usando el resultado de simulacion (pass/fail) como senal de recompensa. Segundo, un chat vector: la diferencia entre el modelo entrenado y Gemma 4 E4B se suma de vuelta a Gemma 4 E4B-it con factor 0,5 para recuperar la capacidad de seguir instrucciones. Tercero, un LoRA sobre ejercicios de edicion de RTL, depuracion guiada por mensajes de error y pares instruccion-respuesta de Verilog, fusionado en los pesos finales.

Los datos de entrenamiento son todos publicos: RTL de OpenTitan (Apache-2.0), Ibex y CV32E40P (Solderpad), proyectos de GitHub con licencia permisiva de The Stack y un corpus publico de Verilog, IP/VIP propio del autor bajo Apache-2.0, y el dataset CodeV-R1-dataset (CC-BY-SA-4.0). Solo se retuvieron proyectos que pasan Verilator lint y sintesis con Yosys. Los problemas de VerilogEval, RTLLM, CVDP y las tareas reservadas de OpenTitan se eliminaron del conjunto de entrenamiento.

## Capacidades

- Generacion de modulos Verilog y SystemVerilog sintetizables a partir de una descripcion funcional.
- Edicion de RTL existente: modificacion de modulos completos preservando interfaces y estilo.
- Depuracion dirigida por errores: recibe codigo fuente, mensaje de compilador o log de test y devuelve el modulo corregido.
- Razonamiento sobre estructuras de hardware: contadores, maquinas de estados, buses, arbitraje, pipelines.
- Conversacion multi-turno e instrucciones en formato chat (plantilla de Gemma 4), con capacidades de instruccion heredadas del modelo base.
- Idiomas: ingles y chino.
- No documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking).
- No documenta capacidades de vision, audio ni otras modalidades, a pesar del tag `image-text-to-text` heredado.

## Casos de uso

- Generacion de RTL para bloques pequenos y medianos: el modelo produce modulos sintetizables (contadores, FSM, registros de desplazamiento, decodificadores) que se validan en el propio flujo Verilator/Yosys del equipo antes de integrarse.
- Correccion de errores de sintesis y lint: se le pasa el modulo completo junto con la salida de Verilator o del sintetizador y devuelve el modulo corregido, lo que reduce el ciclo de iteracion manual en tareas repetitivas.
- Depuracion a partir de logs de simulacion: dado un testbench fallido y el log de errores, el modelo propone el parche sobre el modulo bajo prueba, util en regresiones nocturnas donde el volumen de fallos excede la capacidad de revision manual.
- Refactorizacion de RTL legado: adaptar modulos existentes a nuevas interfaces o convenciones de estilo, aprovechando el entrenamiento sobre edicion de codigo de OpenTitan, Ibex y CV32E40P.
- Asistente integrado en el IDE para ingenieros de diseno: autocompletado y generacion de bloques con contexto del modulo abierto, desplegado con vLLM en una GPU de 16 GB o mas por instancia.
- Generacion de ejercicios y material docente de Verilog: el modelo produce enunciados y soluciones de nivel intermedio, adecuado para cursos de diseno digital donde la verificacion con simulador es parte del flujo.
- Exploracion de alternativas de microarquitectura: generar varias implementaciones de un mismo bloque para comparar area y latencia tras sintesis, siempre con validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que VerilogEval, RTLLM y CVDP se excluyeron del entrenamiento, pero no reporta puntuaciones sobre ellos.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 16 GB para los 7,94B parametros mas overhead de activaciones y cache KV; el autor indica una GPU de 16 GB o mas.
- VRAM en cuantizacion: no disponible en detalle; existe un build GGUF pensado para tarjetas de 8 GB, con niveles de cuantizacion no especificados en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con holgura; RTX 4080/4070 Ti Super (16 GB) al limite en bf16.
- GPU de consumo: si, en RTX 4090 y superiores en bf16; en tarjetas de 8 GB mediante el build GGUF.
- Despliegue: transformers (`AutoModelForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`), vLLM (`vllm serve ... --max-model-len 16384`) y llama.cpp/Ollama a traves del repo GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeliosLM HDL E4B | 7,94B | no disponible (ejemplo con 16k) | Verilog/SystemVerilog | Apache-2.0 | Hugging Face, bf16 + GGUF |
| Gemma 4 E4B-it (base) | ~8B (E4B) | no disponible | Proposito general, multimodal | Gemma terms (segun modelo base) | Hugging Face |
| Modelos generalistas de codigo de ~7-8B | ~7-8B | variable | Codigo general, no HDL especifico | variable | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible: no hay benchmarks publicados de HeliosLM HDL E4B ni datos en la informacion proporcionada sobre el rendimiento del modelo base en tareas HDL. Cualquier comparacion de calidad en VerilogEval o RTLLM requeriria ejecutar la evaluacion de forma independiente.

## Limitaciones y advertencias

- Modelo especializado en HDL: el autor advierte explicitamente que no es adecuado para chat general ni preguntas factuales.
- Debilidades declaradas: testbenches UVM completos, descripcion de intencion de potencia UPF y generacion de una IP grande a partir de una especificacion en una sola pasada.
- Riesgo de errores funcionales o de sintaxis en la salida: no debe usarse en silicio de produccion sin verificacion con simulacion y sintesis propias.
- Sesgos: no documentados por el autor; al entrenarse sobre codigo publico de GitHub y proyectos concretos, puede heredar sesgos de estilo y convenciones de esos repositorios.
- Riesgo de alucinacion en APIs de Verilog/SystemVerilog y en primitivas de simulador no cubiertas por el corpus de entrenamiento.
- Cobertura linguistica limitada a ingles y chino; el castellano no esta declarado como idioma soportado.
- Contexto maximo no documentado: el ejemplo de vLLM fija 16384 tokens, pero no se confirma si es el limite arquitectonico o una eleccion de despliegue.
- Procedencia de datos: parte del entrenamiento proviene de The Stack y de CodeV-R1-dataset (CC-BY-SA-4.0), lo que puede imponer obligaciones de atribucion o share-alike sobre derivados de ese subconjunto, aunque los pesos se distribuyan como Apache-2.0.
- Licencia Apache-2.0 declarada por el autor, pero el modelo base Gemma 4 tiene sus propios terminos de uso; conviene revisar la compatibilidad para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chienhsinlin/helioslm-hdl-e4b
- Build GGUF: https://huggingface.co/chienhsinlin/helioslm-hdl-e4b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset CodeV-R1: https://huggingface.co/datasets/zhuyaoyu/CodeV-R1-dataset
- OpenTitan: https://opentitan.org/
- Ibex: https://github.com/lowRISC/ibex
- CV32E40P: https://github.com/openhwgroup/cv32e40p
- Verilator: https://www.verilator.org/
- Yosys: https://yosyshq.net/yosys/
