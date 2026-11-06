# pp111asd/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF es una versión "abliterada" (sin filtros de seguridad) del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario pp111asd a partir del trabajo de huihui-ai. El proceso de abliteración se ha realizado directamente sobre ficheros GGUF de llama.cpp, sin depender de Transformers, usando la técnica descrita en la herramienta cvector-generator del propio llama.cpp. El resultado es un modelo multimodal (image-text-to-text) con las restricciones de seguridad significativamente reducidas, orientado a investigación y experimentación.

El repositorio no incluye los pesos completos de forma directa, sino que funciona mediante parches ("patch mode") que el usuario debe aplicar por línea de comandos: parches de Maya (project-maya), de Strata (basados en los cuantizados GSQ-RCO de ISTA-DASLab) y de Unsloth (serie UD-). Este enfoque ahorra espacio de almacenamiento en el repositorio. La variante Unsloth solo tiene abliteradas las capas 11 a 28 (indexado desde 0), concretamente 18 tensores attn_output_b, dejando intacto el sistema de expertos.

Es relevante porque combina un modelo base de DeepSeek con arquitectura MoE, cuantizaciones modernas (GSQ, RCO, imatrix, precisión mixta) y soporte multimodal en formato GGUF, lo que permite ejecutarlo localmente con llama.cpp. El tamaño del repositorio (381,1 GB) indica cuantizaciones de un modelo MoE de gran escala, aunque el dato de parámetros totales de safetensors apunta a 1.677.721.600. Requiere llama.cpp b11870 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), multimodal (image-text-to-text) |
| Parametros totales | 1.677.721.600 (dato de safetensors); el tamano del repo (381,1 GB) sugiere un modelo MoE de mayor escala, dato completo no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el comando de ejemplo de llama.cpp) |
| Tipos de cuantizacion | GGUF con GSQ, RCO, imatrix, precisión mixta; serie UD- de Unsloth (IQ1_S entre otras, no disponible la lista completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repartido en varios ficheros, p. ej. 00001-of-00005) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un modelo de DeepSeek con arquitectura mixture-of-experts y capacidades multimodales de entrada de imagen y texto (pipeline image-text-to-text). Los tags del repositorio mencionan además GSQ y RCO (métodos de cuantización asociados a ISTA-DASLab), Strata y Maya (proyectos de parches de pesos), e imatrix (matrices de importancia para cuantización). No se ha publicado información sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

La abliteración se aplicó sobre los ficheros GGUF directamente con llama.cpp, siguiendo el método de cvector-generator, que calcula vectores de dirección de rechazo y los resta de los tensores seleccionados. En la variante Unsloth (serie UD-) solo se abliteraron las capas 11 a 28, exactamente los 18 tensores attn_output_b, sin tocar el sistema de expertos. Los parches Strata provienen de TA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF y requieren modificaciones concretas de llama.cpp a partir de la versión b11870. No se dispone de datos sobre RLHF/DPO adicionales.

## Capacidades

- Generación de texto conversacional (tag "conversational"), con filtrado de seguridad significativamente reducido respecto al modelo base.
- Entrada multimodal imagen-texto (pipeline image-text-to-text), heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Contexto largo de hasta 262.144 tokens según la configuración de ejemplo.
- Ejecución local mediante llama.cpp (llama-cli, llama-mtmd-cli para multimodal, llama-server).
- Cuantizaciones agresivas (IQ1_S entre otras) gracias a imatrix, GSQ y RCO, que reducen los requisitos de VRAM.
- Parches opcionales de Maya, Strata y Unsloth que modifican el comportamiento o la cuantización del modelo.
- No se ha documentado en la información disponible soporte de tool calling, agentes, thinking mode ni audio.

## Casos de uso

- Investigación en seguridad y alineación de modelos: al ser una versión abliterada, permite estudiar el efecto de la eliminación de filtros de rechazo sobre tensores de atención concretos (attn_output_b) en un modelo MoE.
- Pruebas de técnicas de cuantización: el repo incluye variantes GSQ, RCO, imatrix y UD-, útil para comparar calidad de salida frente a tamaño en disco y VRAM.
- Despliegue local multimodal: con llama-mtmd-cli se puede ejecutar inferencia imagen-texto sin depender de APIs externas, adecuado para entornos sin conexión o con requisitos de privacidad.
- Experimentación con contextos largos: la ventana de 262.144 tokens permite probar tareas de análisis de documentos extensos en local.
- Evaluación de parches de pesos (Maya y Strata): el flujo de patch mode permite aplicar y revertir modificaciones de pesos sin duplicar el modelo completo, útil para experimentos reproducibles.
- Servidor de inferencia local: llama-server permite montar un endpoint OpenAI-compatible en hardware propio para pruebas controladas.
- Benchmarking de hardware: el rango de cuantizaciones (desde IQ1_S) permite medir rendimiento de GPUs de consumo y servidores con el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el ejemplo oficial usa la cuantización UD-IQ1_S repartida en 5 ficheros GGUF, lo que indica un modelo grande que probablemente requiera descarga parcial en disco (mmap) y VRAM elevada o offloading a CPU. Para el modelo base MoE a tamaño completo se asumen decenas de GB de VRAM, pero el dato exacto no está disponible.
- GPU recomendadas: no disponible explícitamente; llama.cpp con GGML_CUDA=ON sugiere GPUs NVIDIA compatibles con CUDA (RTX 3090/4090 en consumo, A100/H100 en servidor), con posibilidad de offload parcial de capas a CPU/RAM.
- Cabe en GPU de consumo: plausible con las cuantizaciones más agresivas (IQ1_S) usando offloading parcial, pero no confirmado; el tamaño total del repo (381,1 GB) implica que las variantes de mayor precisión requieren almacenamiento masivo.
- Despliegue: llama.cpp (b11870 o superior, imprescindible), con llama-cli, llama-mtmd-cli (multimodal), llama-server y llama-gguf-split para ficheros partidos. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF | MoE, multimodal | GGUF (GSQ, RCO, imatrix, UD-) | MIT | Abliterado, patch mode, requiere llama.cpp b11870+ |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | MoE, multimodal | Pesos originales | no disponible | Con filtros de seguridad, versión oficial |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | MoE, multimodal | GGUF GSQ-RCO | no disponible | Origen de los parches Strata, no abliterado |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | MoE, multimodal | GGUF serie UD- | no disponible | Origen de la serie UD-, no abliterado |

## Limitaciones y advertencias

- Riesgo elevado de generar contenido sensible, controvertido o inapropiado: los filtros de seguridad están significativamente reducidos por diseño.
- No apto para todos los públicos ni para entornos que exijan alta seguridad; se desaconseja su uso en producción o aplicaciones comerciales de cara al público.
- Sin garantías de seguridad por defecto: el modelo no ha pasado por optimización de seguridad rigurosa y el autor declara no responsabilizarse de las consecuencias de su uso.
- Responsabilidad legal y ética recae íntegramente en el usuario; es necesario cumplir la legislación local.
- La abliteración puede degradar la calidad general del modelo o su capacidad de razonamiento, efecto no cuantificado en la información disponible.
- Requiere llama.cpp b11870 o superior y pasos manuales de parcheado (Maya, Strata, Unsloth), lo que añade fricción de despliegue.
- El parche Strata necesita modificaciones específicas de llama.cpp documentadas en el README de ISTA-DASLab.
- Datos de idiomas soportados, benchmarks y requisitos exactos de VRAM no disponibles; el tamaño del repo (381,1 GB) exige planificar almacenamiento y ancho de banda de descarga.
- La discrepancia entre los parámetros de safetensors (1,68 B) y el tamaño del repo sugiere que el dato de parámetros puede no reflejar el modelo completo; conviene verificarlo antes de dimensionar hardware.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pp111asd/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- cvector-generator (llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Project Maya: https://github.com/mw00/project-maya
- Strata: https://github.com/Niko1221/Strata
- Parches Strata (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Unsloth GGUF: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Release b11870 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
- Ko-fi del autor original: https://ko-fi.com/huihuiai
