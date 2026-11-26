# pranil00/ONIX-Qwen2.5-Coder-32B-GGUF

## Resumen

ONIX-Qwen2.5-Coder-32B-GGUF es una cuantizacion en formato GGUF del modelo Qwen2.5-Coder-32B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base, desarrollado por Alibaba Qwen, es un transformer decoder-only de 32.760 millones de parametros especializado en generacion de codigo y tareas de razonamiento tecnico. Esta version concreta aplica una cuantizacion IQ2_M (aproximadamente 2,7 bits por peso) que reduce el peso de los ficheros de 64,08 GB en FP16 a 10,81 GB, lo que permite ejecutar un modelo de 32B en hardware de consumo con 12 GB de VRAM.

La relevancia de esta publicacion radica en su propuesta de accesibilidad: segun la model card, el modelo cabe en un Apple Silicon con 11,91 GB de memoria unificada, en una GPU NVIDIA con 12,31 GB de VRAM o en un PC con 13,91 GB de RAM libre, manteniendo una ventana de contexto operativa de 8192 tokens (4096 en CPU). El autor declara una retencion de calidad del 82 % respecto al modelo original en FP16.

Conviene senalar que se trata de un artefacto de cuantizacion agresiva, no de un modelo nuevo: no aporta pesos adicionales ni fine-tuning, y su ficha se limita a describir el proceso de compresion y el despliegue. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 32.763.412.480 (32,76 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en GPU/Apple Silicon; 4096 tokens en CPU (segun model card) |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); unico fichero publicado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen--Qwen2.5-Coder-32B-IQ2_M.gguf`, 10,81 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-32B, un transformer decoder-only denso de la familia Qwen2.5, con atencion causal estandar y sin componentes MoE. Esta publicacion no entrena ni modifica la arquitectura: aplica unicamente una cuantizacion post-entrenamiento de tipo IQ2_M mediante el motor `run-any-model`, que produce un fichero GGUF con pesos de aproximadamente 2,7 bits y un factor de compresion de 5,93x respecto a FP16.

La model card no detalla la composicion del dataset de entrenamiento original, el numero de tokens vistos, ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base de Qwen y no se reproducen aqui. La unica innovacion tecnica documentada es el propio pipeline de cuantizacion adaptativa por dispositivo, que segun el autor mantiene las 64 capas aceleradas en Metal y reserva un buffer de KV cache de 1024 MB en FP16. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y codigo: el modelo base esta especializado en tareas de programacion, completado de codigo y explicacion tecnica.
- Razonamiento matematico y logico: la model card advierte de posible degradacion menor en razonamiento matematico complejo debido a la cuantizacion a 2,7 bits.
- Conversacion multi-turno: el autor reporta "alta fidelidad conversacional" en el rango de contexto soportado.
- Soporte de plantillas de chat: la configuracion de Ollama incluida usa los tokens especiales `<|im_end|>` y `<|endoftext|>`, propios del formato Qwen.
- Tool calling y function calling: no disponible en la informacion proporcionada para esta cuantizacion concreta.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.
- Vision o audio: no soportado (modelo exclusivamente de texto).

## Casos de uso

- Asistente de codigo en local para equipos con GPU de 12 GB: el fichero IQ2_M de 10,81 GB permite ejecutar un modelo de 32B especializado en programacion en una RTX 3060 de 12 GB o una RTX 4070, algo inviable con el modelo en FP16 (64 GB).
- Prototipado en portatiles Apple Silicon: con 11,91 GB de memoria unificada y aceleracion Metal nativa, se puede mantener una sesion de chat tecnico con 8192 tokens de contexto sin conexion a la nube.
- Revision de codigo en entornos air-gapped: al ejecutarse con llama.cpp u Ollama sobre CPU con AVX2/AVX-512 y 13,91 GB de RAM, encaja en estaciones de trabajo sin GPU y sin acceso a internet.
- Generacion de documentacion tecnica y explicaciones de fragmentos de codigo: adecuado para tareas de lenguaje natural tecnico donde la perdida de precision numerica de la cuantizacion no es critica.
- Sustitucion de modelos menores en pipelines de CI/CD: permite incorporar un 32B en runners con recursos limitados para tareas de analisis estatico asistido o generacion de tests, siempre con validacion posterior.
- Experimentacion e investigacion sobre cuantizacion extrema: sirve como referencia practica para medir la degradacion real de IQ2_M frente a FP16 en tareas de codigo, util para estudiar el limite de compresion aceptable.
- Educacion y demos offline: despliegue en LM Studio o Jan para talleres donde no se dispone de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo incluye la auditoria interna del motor `run-any-model`, que se reproduce a continuacion:

| Metrica | FP16 (base) | IQ2_M (esta version) | Variacion |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 2,7 | -83,1 % |
| Tamano de pesos | 64,08 GB | 10,81 GB | -83,1 % |
| Buffer KV cache | 1024 MB (FP16) | 1024 MB (FP16) | Optimizado |
| RAM residente total | 65,17 GB | 11,91 GB | -81,7 % |
| Calidad estimada | 100 % (baseline) | 82,0 % retenida | -18,0 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 64/64 | Optimo |

Estos valores son estimaciones del autor del pipeline de cuantizacion, no resultados de evaluacion independiente.

## Requisitos de hardware

- VRAM/RAM estimada: 11,91 GB de memoria unificada en Apple Silicon; 12,31 GB de VRAM dedicada en NVIDIA; 13,91 GB de RAM libre en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090, RTX 50 series; en el catalogo profesional, cualquier GPU con 16 GB o mas (A4000, A5000, A100, H100) deja margen amplio.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM; en GPUs de 8 GB no cabe el fichero completo.
- Opciones de despliegue: `run-any-model` CLI, Ollama (via Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Contexto recomendado: 8192 tokens en GPU y Apple Silicon; 4096 tokens en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-Coder-32B-GGUF (IQ2_M) | 32,76 B | 8192 (GPU) / 4096 (CPU) | IQ2_M, 2,7 bpw | 10,81 GB | Apache 2.0 |
| Qwen2.5-Coder-32B (FP16, original) | 32,76 B | 32768 (segun modelo base) | Sin cuantizar | 64,08 GB | Apache 2.0 |
| Qwen2.5-Coder-14B (GGUF Q4_K_M, referencia) | 14,7 B | 32768 | Q4_K_M, ~4,5 bpw | ~9 GB | Apache 2.0 |
| DeepSeek-Coder-V2-Lite (GGUF Q4, referencia) | 15,7 B (2,4 B activos) | 163840 | Q4, ~4,5 bpw | ~10 GB | DeepSeek License |

La comparativa con el modelo base en FP16 es la mas directa: esta version reduce el peso un 83,1 % a costa de una retencion de calidad estimada del 82 %. Frente a alternativas de menor tamano con cuantizacion mas conservadora (Q4), el IQ2_M ofrece mas parametros efectivos pero menor precision por peso; la eleccion depende de si prima capacidad bruta o fidelidad numerica.

## Limitaciones y advertencias

- Cuantizacion muy agresiva: 2,7 bits por peso implica una perdida estimada del 18 % de calidad; el propio autor advierte de degradacion en razonamiento matematico complejo.
- Riesgo de alucinacion: inherente al modelo base y acentuado por la compresion; no debe usarse sin validacion en produccion.
- Contexto reducido en la practica: aunque el modelo base soporta ventanas mayores, esta ficha limita a 8192 tokens en GPU y 4096 en CPU, lo que restringe casos de repositorios grandes.
- Idiomas no documentados: la model card no especifica cobertura linguistica; no se puede asumir multilingue sin verificar.
- Sin benchmarks independientes: la unica metrica de calidad (82 %) procede del propio pipeline de cuantizacion y no ha sido validada externamente.
- Sin soporte documentado de tool calling ni agentes en esta version.
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor incluye una clausula de exencion total de responsabilidad sobre los outputs; el implementador asume toda la responsabilidad de auditoria.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el artefacto; conviene verificar la integridad del fichero antes de usarlo.
- Rendimiento en CPU limitado: 4096 tokens de contexto y sin aceleracion GPU pueden hacer inviable el uso interactivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-Coder-32B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio del motor de cuantizacion: https://github.com/PranilShah-08/run-any-model
