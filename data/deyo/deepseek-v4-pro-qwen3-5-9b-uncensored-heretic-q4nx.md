# Deyo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Q4NX

## Resumen

Este repositorio contiene pesos cuantizados en formato Q4NX del modelo `DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, una derivación no oficial de Qwen3.5-9B destilada usando DeepSeek-V4-Pro como profesor. Lo publica el usuario Deyo y su propósito es ejecutar el modelo en NPUs AMD XDNA 2 (arquitectura Ryzen AI) mediante el runtime FastFlowLM, no en GPU convencionales. No se trata del modelo DeepSeek-V4-Pro original, sino de un derivado de 9B parámetros con ajuste "uncensored/heretic" que elimina parte de los mecanismos de rechazo del modelo base.

El repositorio es exclusivamente un contenedor de pesos: no incluye tokenizer, configuración, kernels NPU ni runtime. El autor documenta explícitamente que los ficheros por sí solos no constituyen una instalación ejecutable y que se requiere FastFlowLM 1.0.12 sobre Windows 11 con un Ryzen AI 7 350 para reproducir la configuración probada. La conversión a Q4NX es con pérdida y parte de un GGUF Q4_K_S ya cuantizado, por lo que la precisión acumula degradación en dos etapas.

La relevancia del artefacto es de nicho: demuestra el pipeline de conversión GGUF → Q4NX para NPUs AMD y permite ejecutar un modelo de 9B en hardware de consumo con NPU integrada. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks ni evaluación de calidad asociada a esta cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B, no confirmado en detalle) |
| Parámetros totales | 9B (según nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4NX (Q4_K con 8 matrices Q5_K requantizadas a Q4_K; alpha/beta en Q8_0; 48 tensores BF16 de prefill) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (`model.q4nx`, `vision_weight.q4nx`) |

## Arquitectura y entrenamiento

El modelo subyacente es un derivado de Qwen3.5-9B destilado con DeepSeek-V4-Pro como profesor, según la model card. La cadena de linaje es Qwen3.5-9B → Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B → xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en ninguna de las etapas. El sufijo "heretic" indica un ajuste orientado a reducir los mecanismos de rechazo del modelo original, pero no se detalla la metodología.

La conversión a Q4NX se realizó con una versión modificada localmente de AMD FLM_Q4NX_Converter (commit base `93b83988519377935a648ec80740068920ba4076`), partiendo del GGUF Q4_K_S publicado por mradermacher. Ocho matrices Q5_K se requantizaron a Q4_K con el cuantizador de referencia de llama.cpp, los datos alpha/beta pasaron de Q4_K a Q8_0 y se generaron 48 tensores BF16 de prefill. El proceso es acumulativamente con pérdida: el GGUF de entrada ya había perdido precisión y la conversión a Q4NX no la recupera. Las modificaciones locales del conversor no se publican, lo que limita la reproducibilidad exacta.

## Capacidades

- Generación de texto autoregresiva en modalidad `text-generation`.
- Razonamiento y conocimiento general heredados de Qwen3.5-9B y del proceso de destilación desde DeepSeek-V4-Pro (no cuantificado en benchmarks en esta ficha).
- Pesos de visión incluidos (`vision_weight.q4nx`, 1.027.737.360 bytes), aunque el autor indica explícitamente que la inferencia de imagen no ha sido probada.
- Comportamiento "uncensored/heretic": menor tendencia al rechazo de peticiones que el modelo base, sin garantías de calidad o seguridad.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio está vacío.

## Casos de uso

- Inferencia local en NPU AMD Ryzen AI: el caso de uso principal y el único verificado por el autor. Permite ejecutar un modelo de 9B en un portátil con NPU XDNA 2 mediante FastFlowLM, sin GPU dedicada.
- Experimentación con el pipeline GGUF → Q4NX: sirve como referencia práctica para quienes quieran convertir sus propios modelos a formato NPU, aunque las modificaciones del conversor no estén publicadas.
- Pruebas de modelos sin censura en entornos controlados: útil para investigación sobre comportamiento de modelos "heretic" y evaluación de sesgos o negativas, con las cautelas éticas y legales correspondientes.
- Prototipado de asistentes conversacionales offline: al ejecutarse en hardware local sin dependencia de la nube, encaja en escenarios de privacidad estricta donde no se pueden enviar datos a APIs externas.
- Evaluación de degradación por doble cuantización: permite medir empíricamente cuánto pierde un modelo al pasar por GGUF Q4_K_S y luego Q4NX, comparando contra el modelo original en BF16.
- Docencia y demos de despliegue en NPU: ilustra las dependencias reales (kernels `xclbins`, catálogo `model_list.json`, tokenizer separado) que exige FastFlowLM, útil para formar a ingenieros en despliegue edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, ni comparaciones con el modelo base o con la versión BF16. Tampoco se documentan latencia ni throughput medidos, más allá de indicar el hardware de prueba (Ryzen AI 7 350 XDNA 2 NPU, Windows 11, FastFlowLM 1.0.12).

## Requisitos de hardware

- NPU: AMD XDNA 2 (verificado en Ryzen AI 7 350). Otras NPUs y plataformas no están verificadas.
- Sistema operativo: Windows 11 (probado). El procedimiento de instalación documentado es PowerShell.
- Runtime: FastFlowLM 1.0.12, con `model_list.json` y kernels `xclbins\Qwen3.5-9B-NPU2` presentes en la instalación.
- Controlador: driver NPU de AMD instalado por separado.
- Espacio en disco: al menos 9 GB libres para la copia aislada del modelo, además de los 8,2 GB del repositorio.
- VRAM/GPU: no aplica; el artefacto está orientado a NPU. No se documenta ejecución en GPU con este formato.
- Opciones de despliegue: FastFlowLM exclusivamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI para estos pesos Q4NX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deyo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Q4NX | 9B | no disponible | Q4NX (NPU) | Apache 2.0 | Hugging Face, 0 descargas |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B | no disponible | safetensors (previsible) | no disponible en esta ficha | Hugging Face |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | 9B | no disponible | GGUF (Q4_K_S y otros) | no disponible en esta ficha | Hugging Face |
| Qwen/Qwen3.5-9B | 9B | no disponible | safetensors | no disponible en esta ficha | Hugging Face |

La comparación relevante es de formato y plataforma: el Q4NX solo es útil con FastFlowLM en NPU AMD, mientras que el GGUF de mradermacher cubre llama.cpp y el safetensors original cubre GPU con transformers o vLLM. En calidad no hay datos comparativos publicados.

## Limitaciones y advertencias

- No es un modelo autónomo: sin tokenizer, `config.json`, kernels NPU ni runtime no se puede ejecutar. El autor lo advierte explícitamente.
- Doble cuantización con pérdida: parte de un GGUF Q4_K_S y se reconvierte a Q4NX, acumulando degradación de precisión no medida.
- Visión incluida pero no probada: la inferencia de imagen no ha sido validada; no debe asumirse funcional.
- Modelo "uncensored/heretic": menor tendencia al rechazo, con riesgo elevado de generar contenido inapropiado, dañino o inexacto. No apto para producción sin filtros externos.
- Riesgo de alucinación: no evaluado en esta cuantización; la degradación por cuantización puede agravarlo.
- Idiomas soportados sin declarar: no hay garantía de cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 declarada, pero el linaje incluye derivados de terceros (Jackrong, xtools-at) cuyos términos conviene verificar antes de uso comercial.
- Reproducibilidad limitada: las modificaciones del conversor Q4NX no se publican y el procedimiento solo está verificado en una configuración concreta (Ryzen AI 7 350, Windows 11, FLM 1.0.12).
- Cero tracción: 0 descargas y 0 likes, sin validación comunitaria de calidad o estabilidad.
- El repositorio no incluye el runtime FLM ni los kernels; el usuario debe instalarlos por su cuenta desde fuentes de AMD.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deyo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-Q4NX
- Modelo base (Heretic): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo intermedio: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- GGUF de mradermacher: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Conversor AMD FLM_Q4NX_Converter: https://github.com/ROCm/FLM_Q4NX_Converter
- Runtime FastFlowLM: https://github.com/ROCm/FastFlowLM
- Configuración de referencia Qwen3.5-9B-NPU2: https://huggingface.co/FastFlowLM/Qwen3.5-9B-NPU2
