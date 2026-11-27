# bobbydeveloper2014/mamba-siso-175m-nimq

## Resumen

Mamba-3 SISO 187M (publicado bajo el slug `mamba-siso-175m-nimq`) es un checkpoint cuantizado del modelo upstream `state-spaces/mamba3-siso-187m`, empaquetado en el formato propietario NIMQ del framework Nimformers por el usuario `bobbydeveloper2014`. Se trata de un modelo de generacion de texto basado en la arquitectura Mamba-3 (modelo de espacio de estados, no transformer) en configuracion SISO (single-input single-output), con 12 capas, dimension oculta 768, 24 cabezas y un estado de 128.

El paquete incluye dos componentes: los pesos base cuantizados en FP4-KM (`mamba3_siso_187m.nimq`) y un fine-tune LoRA/Linear++ en formato NIMBIN4 (`lora.bin`) con 11 bloques R (bloques Mamba-3 preentrenados) mas una rama G (Linear++ con compuerta) en la capa final. El repositorio ocupa aproximadamente 0,5 GB e incluye `config.json`, tokenizer y ficheros auxiliares para su uso local.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general distribuido por un laboratorio, sino un artefacto de cuantizacion experimental atado a un framework concreto (Nimformers). Resulta de interes para quienes investigan arquitecturas de espacio de estados, cuantizacion agresiva a 4 bits o integracion de LoRA en modelos Mamba, no tanto para despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 SISO (modelo de espacio de estados), 12 capas, hidden 768, 24 cabezas, estado 128 |
| Parametros totales | 187M (segun nombre upstream); el slug indica 175M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4-KM (base), NIMBIN4 (LoRA) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | NIMQ (base), NIMBIN4 (LoRA `lora.bin`) |

## Arquitectura y entrenamiento

El modelo se basa en Mamba-3 en variante SISO, una arquitectura de espacio de estados (SSM) que sustituye la atencion por recurrencias selectivas con estado interno de 128 dimensiones. La configuracion declarada es de 12 capas con dimension oculta 768 y 24 cabezas. Frente a un transformer clasico, esta familia busca coste lineal en la longitud de secuencia y estado constante durante la inferencia.

El checkpoint distribuido aqui no es el modelo original, sino una version cuantizada a FP4 (esquema FP4-KM) del upstream `state-spaces/mamba3-siso-187m`, acompanada de un fine-tune LoRA/Linear++ con 11 bloques R preentrenados y una rama G (Linear++ con compuerta) en la capa final. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Uso conversacional segun los tags del repositorio (`conversational`).
- Fine-tune especifico mediante LoRA/Linear++ sobre la base cuantizada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.
- La inferencia esta pensada para ejecutarse exclusivamente a traves del CLI del framework Nimformers.

## Casos de uso

- Investigacion en arquitecturas SSM: permite experimentar con un Mamba-3 cuantizado a 4 bits sin necesidad de reentrenar, util para comparar comportamiento frente a transformers de tamano similar.
- Pruebas de cuantizacion FP4-KM: sirve como banco de pruebas para medir degradacion de calidad al pasar a 4 bits en modelos de espacio de estados.
- Evaluacion de fine-tunes LoRA en Mamba: el `lora.bin` con 11 bloques R y rama G permite estudiar como se adapta un SSM preentrenado a una tarea concreta mediante Linear++.
- Desarrollo del framework Nimformers: el repositorio esta disenado como fixture de test (`test/mamba3/models`) para validar el pipeline de descarga e inferencia del framework.
- Prototipado en entornos con recursos muy limitados: con 187M parametros y 0,5 GB de repo, cabe en hardware modesto para experimentos de generacion de texto.
- Docencia y demostraciones: modelo pequeno y ligero para explicar internals de Mamba y cuantizacion en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 187M parametros en FP4 el peso ronda los 0,1 GB, por lo que cabria en cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 2-4 GB de VRAM es suficiente.
- Cabe en consumer GPU: si, practicamente en todas las GPU dedicadas y en muchas integradas.
- Opciones de despliegue: exclusivamente Nimformers Framework (CLI `make -f test/mamba3/Makefile infer`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| mamba-siso-175m-nimq (este) | 187M | no disponible | Mamba-3 SISO | no disponible | NIMQ / NIMBIN4 |
| state-spaces/mamba3-siso-187m | 187M | no disponible | Mamba-3 SISO | no disponible | safetensors (presumible) |
| Mamba-2 (state-spaces) | variable (130M-2.8B) | hasta 2K-16K segun variante | Mamba-2 SSM | Apache 2.0 | safetensors |
| GPT-2 small | 124M | 1024 | Transformer | MIT | safetensors, GGUF |

La comparativa con Mamba-2 y GPT-2 small se ofrece como referencia de categoria (modelos pequenos de generacion de texto) a partir de conocimiento general; los datos del modelo upstream no estan verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Formato propietario NIMQ/NIMBIN4: no es compatible con ecosistemas estandar (transformers, llama.cpp, vLLM); requiere el framework Nimformers.
- El slug del repositorio (`175m`) no coincide con el tamano real declarado (187M), lo que puede generar confusion.
- No hay informacion sobre sesgos, alucinacion ni calidad linguistica del modelo.
- Idiomas soportados no declarados; el comportamiento multilingue es incierto.
- Longitud de contexto no documentada; no apto para tareas de contexto largo sin verificacion previa.
- Cuantizacion FP4: posible degradacion de calidad frente al upstream sin cuantizar.
- Modelo pequeno (187M): capacidad de razonamiento y conocimiento factual limitados por diseno.
- Repositorio con 0 likes y 213 descargas: sin validacion comunitaria ni mantenimiento garantizado.
- El autor del repositorio no es el laboratorio upstream (state-spaces); usar con cautela en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bobbydeveloper2014/mamba-siso-175m-nimq
- Modelo upstream: https://huggingface.co/state-spaces/mamba3-siso-187m
- Framework Nimformers: https://github.com/bobbyshop-vui/nimformers-framework
