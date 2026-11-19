# miloserdev/Llama-3.2-3B-Instruct-numallama

## Resumen

Llama-3.2-3B-Instruct-numallama es una conversion del modelo meta-llama/Llama-3.2-3B-Instruct realizada por el desarrollador miloserdev para numallama, un motor de inferencia en C orientado a servidores CPU con soporte de ejecucion NUMA a traves de todos los sockets de maquinas multiprocesador. No se trata de un modelo nuevo ni de un reentrenamiento: es una redistribucion de los pesos originales de Meta en un formato binario propietario (no GGUF) que solo funciona con el motor numallama.

El interes practico de esta ficha no reside en el modelo base, cuyas capacidades son las ya conocidas de la familia Llama 3.2 Instruct de 3B parametros, sino en el formato de despliegue: cuantizaciones Q4 asimetrica (grupos de 32, escala y minimo en fp16) y Q8 int8 con escalas por grupo, con velocidades declaradas de 104 tok/s y 77 tok/s respectivamente en una maquina de 2 x Ampere Altra Max M128-30 (256 nucleos Neoverse N1). Esto lo posiciona como una opcion para inferencia en CPU ARM64 sin GPU.

La relevancia es acotada pero concreta: ofrece una via para ejecutar un modelo instruct de 3B en hardware ARM64 de servidor (Ampere Altra, AWS Graviton, otros nucleos Neoverse) con decodificacion especulativa y servidor compatible con la API de OpenAI, sin depender de CUDA ni de llama.cpp. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el proyecto es de un unico autor, lo que implica un riesgo de mantenimiento a considerar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B Instruct); motor de inferencia numallama en C |
| Parametros totales | 3B (modelo base meta-llama/Llama-3.2-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el README remite a las opciones de numallama) |
| Tipos de cuantizacion | Q4 asimetrica (grupos de 32, escala y minimo fp16, importance matrix) y Q8 int8 con escalas por grupo |
| Idiomas soportados | no disponibles (el modelo base Llama 3.2 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes; la model card no lo declara) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | Binario propietario de numallama (`.bin`); no es GGUF ni safetensors |
| Tamano de los ficheros | Q4: 2.2 GB; Q8: 3.4 GB; tokenizer: 1.9 MB |
| Libreria / motor | numallama (C, Linux, optimizado para ARM64 con NEON dot product) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Relacion con el base | quantized |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 3B Instruct, un transformer decoder-only de Meta con 3.000 millones de parametros, afinado por instrucciones mediante el pipeline de alineacion de Meta (SFT y preferencia). Esta ficha no aporta datos nuevos sobre el entrenamiento del base: no se dispone de informacion sobre numero de tokens, composicion del dataset ni detalles de RLHF/DPO en la documentacion proporcionada.

La innovacion tecnica de esta publicacion esta en la capa de inferencia. numallama es un motor escrito en C que distribuye la ejecucion entre todos los sockets de una maquina multiprocesador con conciencia de NUMA, algo poco habitual en motores de inferencia de LLM. La cuantizacion Q4 es asimetrica en grupos de 32 con escala y minimo en fp16, calibrada con una importance matrix recogida por el propio motor sobre texto en ingles, ruso, chino y codigo. El README menciona soporte de decodificacion especulativa y de herramientas (tools) en las opciones del motor, aunque no se detallan los parametros concretos. La ruta optimizada es ARM64 con NEON dot product; en x86-64 el motor ejecuta codigo C portable sin optimizar.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de Llama 3.2 3B Instruct.
- Razonamiento basico y tareas de conocimiento general propias de un modelo de 3B parametros.
- Generacion de codigo, con calibracion de la cuantizacion Q4 que incluye texto de codigo en la importance matrix.
- Soporte de tool calling / function calling: el README de numallama menciona opciones de "tools" y un servidor compatible con la API de OpenAI.
- Decodificacion especulativa disponible en el motor (segun el README de numallama).
- Servidor HTTP local con endpoint compatible con `/v1` de OpenAI en el puerto configurable.
- Modo chat interactivo en terminal mediante el binario `runq`.
- Capacidades multilingues del base (ingles, aleman, frances, italiano, portugues, hindi, espanol, tailandes segun Meta), aunque la model card no las declara explicitamente.
- No se documentan capacidades de vision, audio ni modo thinking en esta publicacion.

## Casos de uso

- Inferencia en servidores ARM64 sin GPU: el caso central. En instancias AWS Graviton o servidores Ampere Altra se puede ejecutar el modelo Q4 (2.2 GB) con NEON dot product, evitando el coste de una GPU y aprovechando todos los nucleos del socket mediante la ejecucion NUMA de numallama.
- Despliegue de un asistente conversacional interno: el binario `runq` en modo `server` expone una API compatible con OpenAI en `http://127.0.0.1:8080/v1`, lo que permite conectar clientes existentes (SDKs de OpenAI, frameworks de agentes) sin adaptadores.
- Prototipado y evaluacion en entornos con restricciones de hardware: con 2.2 GB en Q4, el modelo cabe en practicamente cualquier maquina Linux ARM64, lo que facilita pruebas de concepto de pipelines de generacion de texto antes de escalar a modelos mayores.
- Procesamiento de texto por lotes en CPU: tareas de clasificacion, resumen o extraccion sobre volumenes moderados de documentos donde no se justifica una GPU y el throughput de 104 tok/s en Q4 es suficiente.
- Sustitucion de llama.cpp en despliegues ARM64 multiprocesador: cuando el cuello de botella es el uso de un solo socket, la ejecucion NUMA de numallama puede distribuir la carga entre sockets; conviene medirlo en el hardware objetivo antes de adoptarlo.
- Entornos de desarrollo y CI sin GPU: integracion del servidor compatible con OpenAI en tests de integracion de aplicaciones LLM, con la ventaja de que el binario y los pesos ocupan poco y no requieren drivers propietarios.
- Experimentacion con cuantizacion asimetrica: la Q4 con importance matrix en ingles, ruso, chino y codigo permite comparar la degradacion frente a Q8 (3.4 GB) en tareas multilingues y de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son de velocidad de decodificacion del motor, medidos en un hardware concreto:

| Metrica | Q4 | Q8 | Hardware de medida |
|---|---:|---:|---|
| Velocidad de decodificacion (1 chat) | 104 tok/s | 77 tok/s | 2 x Ampere Altra Max M128-30 (256 nucleos Neoverse N1), ambos sockets |
| Tamano de pesos | 2.2 GB | 3.4 GB | - |

El autor advierte que otras maquinas obtendran cifras distintas. No se proporcionan datos de MMLU, HumanEval, GSM8K ni de latencia de prefill.

## Requisitos de hardware

- VRAM: no aplica; el motor es de CPU. Memoria RAM necesaria: aproximadamente 2.2 GB para Q4 y 3.4 GB para Q8, mas el overhead del motor y del contexto.
- CPU: Linux. Ruta optimizada para ARM64 con NEON dot product (Ampere Altra, AWS Graviton, otros nucleos Neoverse). En x86-64 funciona con codigo C portable sin optimizar, con rendimiento previsiblemente muy inferior.
- GPU: no se usa GPU; no hay soporte CUDA documentado.
- Cabe en hardware consumer ARM64 (por ejemplo, placas con SoC ARM de 8 GB o mas), aunque sin las optimizaciones NEON de servidor el rendimiento sera menor.
- Despliegue: exclusivamente mediante numallama (`make`, `runq`). No funciona con llama.cpp, Ollama, LM Studio ni transformers, segun advierte el propio README.
- Throughput de referencia: 104 tok/s (Q4) y 77 tok/s (Q8) en 2 x Ampere Altra Max M128-30 con 256 nucleos. No se documenta latencia de prefill ni throughput con batching.
- Descarga de pesos: via `huggingface_hub` (`hf download`) al directorio local indicado en el README.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-numallama (esta ficha) | 3B | no disponible | Binario numallama, CPU ARM64 con NUMA | Llama 3.2 Community License | 0 descargas, proyecto de un unico autor |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K (segun Meta) | safetensors, transformers / vLLM / TGI | Llama 3.2 Community License | Modelo original, ecosistema amplio |
| Llama-3.2-3B-Instruct en GGUF (p. ej. quantizaciones de la comunidad) | 3B | 128K (segun Meta) | GGUF, llama.cpp / Ollama / LM Studio | Llama 3.2 Community License | Compatible con el ecosistema estandar de CPU; sin ejecucion NUMA multiprocesador documentada |
| Qwen2.5-3B-Instruct | 3B | 32K (segun Qwen) | safetensors, GGUF | Apache 2.0 | Alternativa de tamano similar con licencia permisiva; no verificada en la informacion proporcionada |

La comparativa se limita a modelos de la misma categoria (3B instruct). Los datos de contexto y licencia de las alternativas provienen del conocimiento general de dichos modelos y no de la informacion proporcionada en esta busqueda; conviene verificarlos en sus respectivas model cards.

## Limitaciones y advertencias

- Formato propietario: los ficheros `.bin` solo funcionan con numallama. No son compatibles con llama.cpp, Ollama, LM Studio ni transformers, lo que limita la portabilidad y obliga a compilar el motor desde el repositorio de GitHub.
- Proyecto de un unico autor con 0 descargas y 0 likes: riesgo de mantenimiento, falta de auditoria externa y ausencia de soporte comunitario.
- Rendimiento dependiente del hardware: las cifras de 104/77 tok/s corresponden a un servidor de 256 nucleos Neoverse N1; en x86-64 el motor usa codigo portable no optimizado.
- La cuantizacion Q4 puede degradar la calidad respecto al modelo original, especialmente en tareas distintas de ingles, ruso, chino y codigo, que son los idiomas usados en la importance matrix.
- Riesgo de alucinacion inherente a un modelo de 3B parametros; no es adecuado para tareas que exijan alta fiabilidad factual sin verificacion.
- Sesgos: los del modelo base Llama 3.2, no evaluados ni documentados en esta publicacion.
- Licencia: Llama 3.2 Community License con Acceptable Use Policy de Meta; el uso comercial esta sujeto a los terminos de dicha licencia, incluida la clausula de denominacion para productos con mas de 700 millones de usuarios mensuales.
- La model card no declara longitud de contexto soportada por el motor ni idiomas; ambos datos deben consultarse en la documentacion de numallama antes de disenar un despliegue.
- No hay benchmarks publicados de calidad (MMLU, HumanEval, GSM8K) para esta conversion; la unica evidencia de rendimiento es la velocidad de decodificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miloserdev/Llama-3.2-3B-Instruct-numallama
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Motor numallama (GitHub): https://github.com/miloserdev/numallama
- README de numallama (opciones, contexto, sampling, tools, decodificacion especulativa, API): https://github.com/miloserdev/numallama#readme
- Licencia Llama 3.2 Community License: fichero `LICENSE.txt` del repositorio
- Acceptable Use Policy: fichero `USE_POLICY.md` del repositorio
