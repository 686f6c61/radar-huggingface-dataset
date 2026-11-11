# hletrd/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-Tensix-BFP4-MLP es una exportación cuantizada del modelo instructivo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario hletrd y orientada específicamente a aceleradores NPU basados en la arquitectura Tensix de Tenstorrent. El modelo conserva la estructura del transformer decoder de Qwen2.5 (7.615.616.512 parámetros reales según los safetensors del repositorio), pero redondea las proyecciones lineales a formatos de coma flotante por bloques nativos de TT-NN: `bfloat4_b` (BFP4) para las capas MLP y `bfloat8_b` (BFP8) para las proyecciones de atención.

La motivación es el ahorro de ancho de banda de memoria en hardware Tensix (Wormhole y Blackhole). Un peso en BFP4 ocupa 4,5 bits frente a los 8,5 bits de BFP8, de modo que las matrices MLP se transmiten desde memoria aproximadamente a la mitad de bytes. En conjunto, el modelo promedia 6,58 bits por peso (6,262 GB empaquetados) frente a los 15,2 GB de los ficheros bf16 del repositorio.

Es relevante porque demuestra un flujo de cuantización GPTQ con búsqueda de exponente que produce pesos que caen exactamente sobre la rejilla de coma flotante por bloques de TT-NN, sin redondeo adicional al empaquetar. No obstante, el autor indica explícitamente que no se ha ejecutado en hardware Tenstorrent real: las pruebas se hicieron sobre `ttsim`, el simulador funcional de un chip Blackhole.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), atención con proyecciones q/k/v/o; MLP gate/up/down; 28 capas |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ con búsqueda de exponente; BFP4 (`ttnn.bfloat4_b`) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`) en atención q/k/v/o; LM head, embeddings, norms y biases en bf16 |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores bf16 sobre la rejilla BFP), con `quant4.json` y `model.safetensors.index.json`; empaquetado a TT-NN mediante `pack_tensix.py` |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder denso de 28 capas con atención multi-cabeza y MLP de tres proyecciones. Esta exportación no reentrena el modelo: aplica cuantización GPTQ con búsqueda de exponente sobre las proyecciones lineales, generando pesos que se sitúan exactamente sobre la rejilla de coma flotante por bloques de TT-NN. En ese formato, 16 valores consecutivos en disposición de tile comparten un exponente de 8 bits, y cada valor conserva signo y mantisa de 3 bits (BFP4) o 7 bits (BFP8).

Los ficheros safetensors almacenan valores bf16 que coinciden con la rejilla, de forma que en `transformers` el checkpoint se carga como el modelo base y calcula lo mismo que el modelo redondeado. El empaquetador de TT-NN almacena esos mismos valores sin volver a redondearlos. El repositorio incluye `quant4.json`, que lista el formato de cada proyección por capa, y utilidades como `pack_tensix.py` (empaquetado y verificación, con opciones `--device` y `--cache-dir`) y `verify_grid.py` (verificación sin software de Tenstorrent, solo con torch y safetensors). Las pruebas se realizaron con ttnn 0.81.1 y torch 2.15.0 sobre `ttsim`, el simulador funcional de Blackhole: las 196 matrices redondeadas se empaquetaron y desempaquetaron bit a bit sin cambios. No se detallan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO específicas de esta exportación.

## Capacidades

- Generación de texto conversacional e instructiva, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas de varios pasos, según las capacidades del modelo base.
- Generación de código y matemáticas, según el modelo base.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Inferencia en `transformers` con `dtype="bfloat16"` y `device_map="auto"`.
- Empaquetado y ejecución en NPU Tensix mediante TT-NN (`ttnn.as_tensor` con `bfloat4_b`/`bfloat8_b`).
- Verificación de integridad de la cuantización sin hardware Tenstorrent.
- Capacidades multilingües: los metadatos solo declaran inglés (`en`); no se documentan otras lenguas en esta exportación.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent: el modelo está pensado para ejecutarse en procesadores Tensix (Wormhole, Blackhole), donde los formatos BFP4/BFP8 reducen el tráfico de memoria de las matrices MLP a la mitad respecto a BFP8.
- Evaluación de cuantización por bloques: sirve para estudiar el impacto de BFP4 en MLP y BFP8 en atención sobre la calidad de un modelo instructivo de 7B, comparando contra el checkpoint bf16 original.
- Prototipado en simulador: con `ttsim` se puede validar el pipeline de empaquetado y ejecución antes de disponer de hardware físico.
- Investigación en eficiencia de memoria: el promedio de 6,58 bits por peso y los 6,262 GB empaquetados permiten analizar compromisos entre precisión y huella de memoria.
- Verificación de integridad de pesos: `verify_grid.py` permite comprobar, solo con torch y safetensors, que ningún valor cambia al redondear a la rejilla de su bloque.
- Generación de texto en `transformers`: el checkpoint carga como el modelo base y puede usarse para tareas conversacionales estándar en GPU/CPU convencionales, aunque sin las ventajas de formato.
- Caché de pesos en TT-NN: `pack_tensix.py --cache-dir` genera ficheros de caché que se cargan sin reempaquetar, útil en pipelines de despliegue repetido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16 (formato de los ficheros safetensors): aproximadamente 15,2 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 20-24 GB para inferencia cómoda.
- Huella empaquetada en formatos Tensix: 6,262 GB (promedio de 6,58 bits por peso).
- GPU recomendadas para uso en `transformers`: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) con `device_map="auto"`.
- Hardware objetivo: procesadores Tensix de Tenstorrent (Wormhole, Blackhole). El autor no ha realizado benchmarks en tarjetas propias de Tenstorrent.
- Despliegue: `transformers` (probado con torch 2.15.0), TT-NN/tt-metal (probado con ttnn 0.81.1 sobre `ttsim`), y utilidades `pack_tensix.py` y `verify_grid.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; no se han medido en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-Tensix-BFP4-MLP | 7.615.616.512 | no disponible | BFP4 (MLP) + BFP8 (atencion) + bf16 | apache-2.0 | Hugging Face (hletrd) |
| Qwen/Qwen2.5-7B-Instruct (base) | 7.615.616.512 | no disponible en la informacion | bf16 | apache-2.0 | Hugging Face (Qwen) |
| Otras cuantizaciones GPTQ/AWQ de Qwen2.5-7B-Instruct | 7.615.616.512 | no disponible | 4/8 bits GPTQ, AWQ | apache-2.0 (segun exportacion) | Hugging Face (varios autores) |

La comparativa de rendimiento frente a estas alternativas no está disponible: el autor no publica métricas de calidad ni de velocidad, y advierte que no ha probado el modelo en hardware Tensix real.

## Limitaciones y advertencias

- No se ha ejecutado en hardware Tenstorrent físico; todas las pruebas se hicieron sobre `ttsim`, el simulador funcional de Blackhole.
- El autor indica explícitamente que no ha medido el rendimiento en las tarjetas de Tenstorrent, por lo que no hay datos de latencia ni throughput reales.
- Los metadatos solo declaran inglés; el comportamiento en otros idiomas no está documentado en esta exportación.
- La cuantización BFP4 en las capas MLP puede degradar la calidad respecto al modelo bf16; no se publican evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente al modelo base Qwen2.5-7B-Instruct, no evaluado específicamente tras la cuantización.
- Sesgos conocidos del modelo base no documentados en esta ficha.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El proyecto no está afiliado ni respaldado por Tenstorrent.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La longitud de contexto no se especifica en la información disponible; conviene consultar la model card del modelo base antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- tt-metal y TT-NN: https://github.com/tenstorrent/tt-metal
- Guía de instalación de tt-metal: https://github.com/tenstorrent/tt-metal/blob/main/INSTALLING.md
- Documentación de Tenstorrent: https://docs.tenstorrent.com
