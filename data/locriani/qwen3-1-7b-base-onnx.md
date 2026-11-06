# locriani/qwen3-1.7b-base-onnx

## Resumen

`locriani/qwen3-1.7b-base-onnx` es una conversión a ONNX de 4 bits del modelo base sin ajustar Qwen/Qwen3-1.7B (revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`), publicada por el usuario locriani. No se trata de un modelo entrenado ni ajustado por el autor: es un artefacto de investigación creado exclusivamente para que la página de demostración de un proyecto de comparación pueda ejecutar el modelo base junto al modelo ajustado (`locriani/therapeutic-register-qwen3-1.7b-onnx`) en la misma pestaña del navegador, usando Transformers.js y WebGPU.

El modelo subyacente, Qwen3-1.7B, es un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba Qwen. Esta build concreta aplica cuantización de pesos a 4 bits (MatMulNBits, bloque de 32, asimétrica) sobre los pesos exportados a ONNX en fp32, dando como resultado un único fichero de aproximadamente 1,3 GB. El repositorio completo ocupa 1,3 GB.

Su relevancia es acotada: sirve como referencia base (baseline) en una comparación controlada de estilos de respuesta, y como ejemplo práctico de despliegue de un LLM de 1.700 millones de parámetros en el navegador mediante ONNX Runtime Web y WebGPU. No está pensado para uso clínico, terapéutico ni de producción general, y el propio autor lo etiqueta como `research-artifact` y `baseline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a ONNX |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (MatMulNBits, block size 32, asimetrica) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`), mas `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. Esta build no introduce ningún entrenamiento propio: parte de los pesos base en bfloat16, los exporta a ONNX en fp32 con `optimum-onnx` (manteniendo `rope_theta` en el nivel superior de `config.json`) y posteriormente los cuantiza a 4 bits para las operaciones MatMul y Gather mediante `MatMulNBitsQuantizer` de onnxruntime, con tamaño de bloque 32 y cuantización asimétrica.

La plantilla de chat es la misma que usa la build ajustada, embebida como `chat_template` en `tokenizer_config.json`, y por defecto desactiva el modo thinking, de forma que ambos lados de la comparación reciben el mismo formato de prompt. La generación configurada es greedy (`do_sample: false`). El autor documenta una comprobación previa a la release sobre tres prompts de prueba (un mensaje de agobio, una petición de habilidad calmada y una creencia distorsionada), ejecutando 256 tokens en CPU tanto con esta build de 4 bits como con el modelo base en PyTorch: ninguna de las dos produjo bloque de thinking, y ambas mostraron el estilo asistente habitual del modelo base (listas markdown de consejos, tranquilización genérica), con diferencias de redacción. En el prompt de creencia distorsionada, la respuesta de la build de 4 bits se muestra parcialmente de acuerdo con la afirmación del usuario ("soy una persona terrible"), mientras que la de PyTorch no.

## Capacidades

- Generación de texto conversacional y de estilo asistente, heredadas del modelo base Qwen3-1.7B sin ajuste adicional.
- Modo thinking desactivado por defecto mediante la plantilla de chat embebida (el autor verifica que no se generan bloques de thinking en las pruebas realizadas).
- Generación greedy determinista según `generation_config.json`.
- Ejecución en navegador mediante Transformers.js con backend WebGPU, y también en CPU (el autor ejecutó las pruebas de validación en CPU).
- Soporte de tool calling, function calling, agentes o multi-step reasoning: no disponible en la información proporcionada para esta build concreta.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el modelo base Qwen3-1.7B es solo texto).

## Casos de uso

- Comparación controlada base vs. ajustado en el navegador: el caso de uso declarado por el autor. Se carga esta build junto a `locriani/therapeutic-register-qwen3-1.7b-onnx` en la misma pestaña con Transformers.js y WebGPU, con idéntica plantilla de chat y decodificación greedy, para aislar el efecto del ajuste.
- Demostraciones de LLM en el navegador sin backend: al ser un único fichero ONNX de 1,3 GB con cuantización de 4 bits, permite servir generación de texto directamente en el cliente, sin infraestructura de GPU en servidor.
- Evaluación de artefactos de cuantización: útil para estudiar cómo la cuantización a 4 bits (MatMulNBits, bloque 32) afecta a la redacción y al comportamiento del modelo base frente a los pesos en PyTorch, como documenta el propio autor.
- Baseline en experimentos de ajuste de estilo o registro: sirve como referencia para medir cuánto cambia la salida de un modelo ajustado respecto al base sin ajustar sobre los mismos prompts.
- Pruebas de integración de ONNX Runtime Web y WebGPU: permite validar pipelines de inferencia en navegador con un modelo de 1,7B parámetros y cuantización de 4 bits.
- Docencia y divulgación sobre cuantización y despliegue web: el repositorio incluye la receta de exportación (optimum-onnx + MatMulNBitsQuantizer) y las comprobaciones de validación, lo que lo hace útil como ejemplo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta build no ha sido evaluada en los conjuntos de evaluación del proyecto, y que los números del modelo base que aparecen en la model card del modelo ajustado se midieron con pesos PyTorch, por lo que no son transferibles a esta build de 4 bits sin una ejecución separada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos cuantizados ocupa aproximadamente 1,3 GB; a ello hay que sumar memoria para el grafo ONNX, el tokenizador y el contexto KV, no cuantificada en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada. El autor valida la build en CPU y la orienta a WebGPU en navegador.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de pesos (1,3 GB) es compatible con GPUs de consumo de gama media-alta en términos de memoria, pero no se aportan pruebas.
- Opciones de despliegue: Transformers.js con `dtype: "q4"` y `do_sample: false` (uso documentado por el autor); ONNX Runtime (Web y nativo) al ser un modelo ONNX. vLLM, llama.cpp, Ollama y TGI no están documentados para esta build.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| locriani/qwen3-1.7b-base-onnx | 1,7B | no disponible | ONNX 4 bits | Apache-2.0 | Artefacto de investigación, base sin ajustar, orientado a navegador |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | safetensors (bf16) | Apache-2.0 | Modelo base original en PyTorch; referencia de comportamiento |
| onnx-community/Qwen3-1.7B-ONNX | 1,7B | no disponible | ONNX (varias precisiones) | Apache-2.0 | Conversión comunitaria estándar a ONNX para WebML |
| locriani/therapeutic-register-qwen3-1.7b-onnx | 1,7B | no disponible | ONNX 4 bits | Apache-2.0 | Build ajustada del mismo autor, usada como contraparte en la comparación |

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo declara explícitamente como `research-artifact`, no como herramienta clínica, terapia ni para uso en crisis.
- Sin ajuste ni alineación propios: no tiene tuning terapéutico ni de seguridad por parte del autor, y nada ha sido revisado por un clínico cualificado.
- Riesgo de respuestas inadecuadas: en la validación del autor, ante un prompt de creencia distorsionada la build de 4 bits se mostró parcialmente de acuerdo con la afirmación negativa del usuario ("soy una persona terrible"), a diferencia de los pesos PyTorch.
- Sin evaluación en los conjuntos del proyecto: los números del modelo base no son transferibles a esta build sin una ejecución separada.
- Diferencias de redacción frente a PyTorch: se observaron divergencias en los tres prompts de prueba, atribuibles a la cuantización.
- Idiomas soportados no documentados en esta build.
- Longitud de contexto no documentada en esta build.
- Restricciones de licencia: Apache-2.0, la licencia de Qwen3; permite uso comercial, pero el autor desaconseja el uso clínico o de crisis.
- En caso de peligro, el autor remite a servicios de emergencia locales (en EE. UU., llamar o enviar SMS al 988).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/locriani/qwen3-1.7b-base-onnx
- Árbol de ficheros: https://huggingface.co/locriani/qwen3-1.7b-base-onnx/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Build ajustada del mismo autor: https://huggingface.co/locriani/therapeutic-register-qwen3-1.7b-onnx
- Conversión ONNX comunitaria de referencia: https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX
