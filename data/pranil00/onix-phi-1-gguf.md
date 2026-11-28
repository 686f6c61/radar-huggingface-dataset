# pranil00/ONIX-phi-1-GGUF

## Resumen

ONIX-phi-1-GGUF es una cuantizacion en formato GGUF del modelo microsoft/phi-1, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". Se trata de una conversion a Q5_K_M de los pesos originales de phi-1, un transformer de 1.300 millones de parametros (1.418.270.720 exactos segun los safetensors del modelo base) desarrollado por Microsoft Research y orientado especificamente a la generacion de codigo en Python para contextos educativos.

El modelo base phi-1 es un transformer decoder-only denso (no MoE) entrenado sobre un dataset curado de "libros de texto" sinteticos y ejercicios de programacion, con el objetivo declarado de alcanzar un rendimiento notable en tareas de sintesis de codigo a pesar de su tamano reducido. Esta version GGUF no introduce cambios arquitectonicos: es una conversion de pesos para su uso con llama.cpp y Ollama.

La relevancia de esta ficha es limitada pero concreta: permite ejecutar phi-1 en hardware de consumo mediante cuantizacion de 5 bits, con un peso de 0,96 GB. No obstante, el repositorio no aporta informacion sobre idiomas, benchmarks propios ni validacion independiente de la calidad de la cuantizacion, y el modelo base esta descatalogado en la practica por alternativas posteriores de la familia Phi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de microsoft/phi-1) |
| Parametros totales | 1.418.270.720 (1,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (unico publicado en este repo) |
| Idiomas soportados | No disponible (el modelo base esta orientado a codigo Python e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (peso cuantizado de 0,96 GB; repo de 1,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base microsoft/phi-1: un transformer decoder-only denso de aproximadamente 1,3B de parametros. Segun la documentacion publica del modelo original de Microsoft, phi-1 se entreno sobre un dataset curado de aproximadamente 7.000 millones de tokens compuesto por "libros de texto" sinteticos generados y ejercicios de programacion, con un enfoque explicito en la sintesis de codigo Python. No se dispone en la informacion proporcionada de detalles sobre el uso de RLHF, DPO ni de innovaciones tecnicas adicionales en esta conversion.

Esta publicacion concreta no modifica la arquitectura: aplica una cuantizacion Q5_K_M mediante llama.cpp sobre los pesos originales. El autor declara "verificacion de conversion autentica de tensores via llama.cpp" y que la cuantizacion se realizo en Apple Silicon (Metal). No se documenta el proceso de calibracion, la perdida de perplejidad respecto al modelo original ni comparaciones de fidelidad numerica.

## Capacidades

- Generacion de texto autoregresiva estandar.
- Generacion y completado de codigo, con enfasis en Python segun el diseno del modelo base.
- Resolucion de problemas de programacion de nivel introductorio (el modelo base se evaluo en HumanEval y MBPP en su publicacion original).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad multilingue; el modelo base esta orientado a ingles y codigo.
- Sin modo "thinking", vision ni audio.

## Casos de uso

- Autocompletado de codigo Python en entornos locales: el modelo puede integrarse en editores o scripts mediante llama.cpp u Ollama para sugerir lineas y funciones en proyectos pequenos, aprovechando su peso reducido (0,96 GB) y su entrenamiento especifico en codigo.
- Asistente educativo de programacion: adecuado para generar explicaciones y ejemplos de ejercicios introductorios de Python en entornos con recursos limitados, dado su origen en datasets de "libros de texto" sinteticos.
- Prototipado rapido en portatiles Apple Silicon: la cuantizacion se genero en Metal y el formato GGUF permite ejecucion en CPU/GPU integrada sin infraestructura dedicada.
- Pruebas de pipelines de inferencia: util como modelo de juguete para validar integraciones con llama.cpp, Ollama o servidores compatibles con endpoints antes de desplegar modelos mayores.
- Generacion de tests unitarios simples: puede producir esqueletos de pruebas para funciones Python pequenas, siempre con revision humana dado el riesgo de alucinacion.
- Experimentacion academica sobre cuantizacion: sirve como caso de estudio para medir la degradacion de un modelo de codigo de 1,3B al pasar a Q5_K_M, aunque el repo no aporta esas metricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de HumanEval, MBPP, MMLU ni comparaciones de perplejidad frente al modelo original en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB adicionales al peso del modelo (0,96 GB) para el contexto KV cache, segun la longitud de contexto configurada.
- Cabe en practicamente cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, Apple Silicon con Metal).
- Tambien ejecutable en CPU exclusivamente mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run pranil00/ONIX-phi-1-GGUF`) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-phi-1-GGUF (esta ficha) | 1,3B | No disponible | Apache 2.0 | GGUF Q5_K_M | Cuantizacion no oficial de phi-1 |
| microsoft/phi-1 (original) | 1,3B | No disponible | MIT (modelo base) | Safetensors | Pesos oficiales en precision completa |
| microsoft/phi-1_5 | 1,3B | No disponible | MIT | Safetensors | Version posterior con mejor rendimiento en codigo |
| microsoft/Phi-2 | 2,7B | No disponible | MIT | Safetensors | Sucesor de mayor tamano de la familia Phi |

La comparacion se limita a datos estructurales; no se dispone de benchmarks del repositorio para contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Modelo base descatalogado: phi-1 ha sido superado por phi-1_5 y Phi-2, con mejor rendimiento en codigo y mayor soporte de la comunidad.
- Riesgo elevado de alucinacion en codigo: el modelo base tiene un entrenamiento acotado y puede generar APIs o funciones inexistentes.
- Sin datos de idiomas: no se garantiza soporte de castellano; el modelo esta orientado a ingles y Python.
- Cuantizacion no oficial: el autor es un usuario individual, no Microsoft; no hay validacion independiente de la fidelidad de los pesos convertidos.
- Sin benchmarks publicados: no es posible verificar la degradacion respecto al modelo original en precision completa.
- Licencia: el repo declara Apache 2.0, pero el modelo base microsoft/phi-1 se publica bajo licencia MIT; conviene verificar la compatibilidad antes de uso comercial.
- Sin soporte documentado de tool calling, agentes ni contexto largo; no apto para pipelines de produccion que requieran esas capacidades.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-phi-1-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-1
- Paper de phi-1 ("Textbooks Are All You Need"): https://arxiv.org/abs/2306.11644
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
