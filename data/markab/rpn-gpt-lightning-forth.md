# markab/rpn-gpt-lightning-Forth

## Resumen

rpn-gpt-lightning-Forth es un modelo de generación de texto en inglés desarrollado por markab (Mark Berry) que incorpora una máquina Forth exacta compilada directamente en los pesos de la red. Se construye como un fine-tune sobre markab/rpn-gpt-lightning (a su vez derivado de NVIDIA Nemotron 3.5 Lightning) y añade un kernel de 3.699.548.224 parámetros cuyos pesos no fueron entrenados sino calculados analíticamente para implementar un intérprete Forth determinista. El resultado es que, cuando el modelo cierra un bloque de código ` ```forth `, el kernel escribe un bloque ` ```output ` con el resultado exacto de la ejecución, token a token, dentro de los mismos forward passes, sin tool calling ni bucle de cliente.

El modelo resuelve el problema clásico de la aritmética exacta en LLM: en lugar de delegar en una herramienta externa, el cálculo se ejecuta dentro de la red mediante una máquina virtual implementada en pesos. El repositorio aloja el kernel (7,4 GB), 453 filas de embedding y 31 filas de cabeza para las palabras que el modelo escribe, además del código de modelado; el modelo de lenguaje base se lee desde `config.base_model` = markab/rpn-gpt-lightning (63 GB, descargado en el primer uso) y permanece byte-idéntico.

La relevancia actual radica en su enfoque híbrido: un LLM conversacional que delega la aritmética entera exacta a un sustrato determinista verificable, con verificación contra la especificación `kernel/text_vm.py`. Está pensado como demostración de investigación, no como modelo de propósito general, y sus límites son explícitos (solo enteros, 20 dígitos por número, 10 dígitos para el operando superior de `*` y `mod`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Nemotron 3.5 Lightning) con kernel Forth compilado en pesos; requiere `trust_remote_code` |
| Parámetros totales | 3.699.548.224 (kernel del repositorio); el LM base se carga aparte desde markab/rpn-gpt-lightning |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (usado en el ejemplo de vLLM con `--max-model-len 65536`) |
| Tipos de cuantización | no disponible (el ejemplo de transformers usa bfloat16; se menciona un adaptador sobre base NVFP4 en el round-7) |
| Idiomas soportados | en |
| Licencia | OpenMDW License Agreement 1.1 (parte NVIDIA Nemotron); fine-tune, tarjeta y código bajo MIT |
| Formato de pesos | safetensors; código de modelado custom (`custom_code`) |

## Arquitectura y entrenamiento

El modelo se compone de dos partes. La primera es el LM base markab/rpn-gpt-lightning, derivado de NVIDIA Nemotron 3.5 Lightning, que permanece byte-idéntico y se encarga de la conversación, el razonamiento y la escritura del bloque ` ```forth `. La segunda es el kernel: una red de 3,7 mil millones de parámetros cuyos pesos fueron calculados, no entrenados, que implementa una máquina Forth exacta y escribe el bloque ` ```output ` token a token dentro de los mismos forward passes. El repositorio contiene el kernel (7,4 GB), 453 filas de embedding y 31 filas de cabeza para las palabras que el modelo escribe, y el código de modelado.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset `markab/rpn-gpt-data` ni si hubo RLHF o DPO. La innovación técnica destacable es la compilación de una máquina virtual determinista en pesos de red, con verificación posición a posición contra la especificación `kernel/text_vm.py`: en el ejemplo de la model card, las 361 posiciones propiedad del kernel (348 tokens ocultos más 13 en el bloque de salida) coincidieron con la especificación. Los tokens ocultos son tokens especiales reservados que decodifican a cadena vacía.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Razonamiento aritmético entero exacto mediante ejecución Forth en pesos: suma, resta, multiplicación, división y módulo sobre enteros.
- Escritura autónoma de bloques ` ```forth ` y ` ```output ` sin tool calling ni bucle de cliente.
- Recuperación de errores: en las pruebas, un turno envió un bloque que falló, leyó el error y lo corrigió.
- Modo de razonamiento breve previo a la emisión del bloque de código (parte "thinking" corta).
- No se documentan tool calling genérico, function calling, capacidades de visión, audio ni agentes multi-paso más allá del ciclo interno Forth.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Aritmética exacta verificable en producción: el modelo calcula restas, multiplicaciones y módulos de enteros grandes dentro de la propia red, con salida comprobable contra la especificación del kernel, útil en pipelines donde no se permite delegar en una calculadora externa.
- Auditoría de cálculos financieros o contables: para operaciones con enteros de hasta 20 dígitos, el bloque ` ```output ` generado por el kernel es determinista y trazable, lo que facilita la revisión.
- Enseñanza de Forth y programación de pila: el modelo produce programas Forth válidos y su ejecución exacta, aprovechable en materiales didácticos o entornos de práctica.
- Investigación en neuro-simbólico: sirve como banco de pruebas para estudiar la compilación de máquinas virtuales deterministas en pesos de transformer y la verificación posición a posición.
- Pruebas de robustez de despliegue: el repositorio incluye playbooks para transformers y vLLM 0.29.0, útil para validar integraciones de modelos con `custom_code` y kernels compilados.
- Generación de ejemplos de traza paso a paso: los tokens ocultos del kernel permiten inspeccionar el estado interno de la ejecución Forth, útil en depuración de sistemas aritméticos.
- Sustitución controlada de tool calling en entornos restringidos: cuando no se dispone de un cliente que ejecute código, el modelo resuelve la operación entera dentro de un único forward pass encadenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card solo reporta pruebas cualitativas de corrección:

| Prueba | Entorno | Resultado |
|---|---|---|
| 3 problemas aritméticos | transformers 5.16.1, 1× RTX PRO 6000, bfloat16 | 3 de 3 correctos; 1431 tokens escritos por el kernel iguales a la especificación |
| 3 problemas × 2 | vLLM 0.29.0, 1× RTX PRO 6000, batch | 6 de 6 correctos; todos los bloques de salida escritos por el kernel |
| Throughput | transformers, batch 1 | ~35 tokens/s |

## Requisitos de hardware

- VRAM estimada: el kernel ocupa 7,4 GB en safetensors; el LM base markab/rpn-gpt-lightning ocupa 63 GB y se descarga en el primer uso, por lo que la inferencia completa en bfloat16 requiere del orden de 70 GB o más de VRAM.
- GPU recomendadas: RTX PRO 6000 (probada en la model card), A100 80 GB, H100 80 GB; no se documentan pruebas en GPUs de consumo.
- No cabe en GPUs de consumo habituales (RTX 4090 de 24 GB) con el LM base completo en bfloat16; no se documentan opciones de cuantización para reducirlo.
- Despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`, `device_map="cuda"`; vLLM 0.29.0 mediante plugin del repositorio GitHub, con flags específicos (`FORTH_VISIBLE=1`, `VLLM_DISABLE_COMPILE_CACHE=1`, `--no-enable-flashinfer-autotune`, `--no-enable-prefix-caching`, `--no-async-scheduling`, `-cc '{"cudagraph_mode": "FULL_DECODE_ONLY"}'`).
- Latencia y throughput: ~35 tokens/s en transformers batch 1 sobre RTX PRO 6000. El kernel es lento por diseño: un forward pass por paso de kernel; una división sobre números de 6 dígitos consume unos 115 tokens ocultos.
- No se documenta soporte para llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de aritmética exacta o de ejecución de máquinas virtuales en pesos, ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Solo enteros: la máquina Forth no soporta números en coma flotante.
- Límite de 20 dígitos por número y de 10 dígitos para el operando superior de `*` y `mod`.
- El kernel es lento: un forward pass por paso de kernel, con coste alto en tokens ocultos para operaciones como la división.
- Solo inglés según la etiqueta de idioma; no se documentan capacidades multilingües.
- Licencia mixta: la parte NVIDIA Nemotron 3.5 Lightning está bajo OpenMDW 1.1 (revisar el texto completo y el aviso de NVIDIA en LICENSE antes de uso comercial); el fine-tune, la tarjeta y el código son MIT.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- La integración con vLLM está limitada a la versión 0.29.0 y a flags concretos verificados; otras versiones o configuraciones no están soportadas.
- No se han publicado benchmarks estándar ni evaluaciones de sesgo o alucinación; las pruebas reportadas son cualitativas y de pequeño tamaño (3 problemas, 6 respuestas).
- El modelo base se descarga en el primer uso (63 GB), lo que afecta al arranque y al almacenamiento.
- Uso previsto de investigación y demostración; no se documenta validación para cargas de producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markab/rpn-gpt-lightning-Forth
- Modelo base: https://huggingface.co/markab/rpn-gpt-lightning
- Repositorio GitHub: https://github.com/markab21/rpn-gpt
- README del kernel: https://github.com/markab21/rpn-gpt/blob/main/kernel/README.md
- Especificación del kernel: https://github.com/markab21/rpn-gpt/blob/main/kernel/text_vm.py
- Playbook de despliegue: https://github.com/markab21/rpn-gpt/blob/main/playbooks/deploy.md
- Límites de Forth: https://github.com/markab21/rpn-gpt/blob/main/forth/README.md#limits
- Ejemplo completo round-7: https://huggingface.co/markab/rpn-gpt-lightning/blob/main/example_r7_in_weights.md
- Dataset: https://huggingface.co/datasets/markab/rpn-gpt-data
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
