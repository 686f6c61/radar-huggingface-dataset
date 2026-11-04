# mradermacher/Qwen3.5-4B-Uncensored-v2-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-4B-Uncensored-v2-i1-GGUF` es una colección de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo base `InterpreticAI/Qwen3.5-4B-Uncensored-v2`. No se trata de un modelo entrenado desde cero, sino de una redistribución en formatos cuantizados (Q2 a Q6, incluyendo variantes i-quant y K-quant) pensada para su uso con llama.cpp y derivados. El nombre sugiere una base de la familia Qwen3.5 de 4B parámetros con un ajuste fino orientado a eliminar restricciones de contenido ("uncensored"), aunque la model card no aporta detalles sobre dicho ajuste.

La información disponible en HuggingFace es extremadamente limitada: el repositorio figura con 0 descargas, 0 likes, tamaño de 0.0 GB y sin pipeline, licencia ni idiomas declarados. El dato de parámetros totales reportado en safetensors (1.797.272) es inconsistente con el nombre del modelo (4B) y con el tamaño esperado de un transformer de 4B parámetros; probablemente corresponda a un recuento parcial o erróneo del tensor de embeddings o de un componente auxiliar. Esta ficha se limita a lo verificable y marca como "no disponible" todo aquello que la información proporcionada no cubre.

La relevancia de esta ficha es, por tanto, acotada: sirve para identificar el artefacto, entender su procedencia (cuantización de un modelo comunitario) y advertir de las lagunas de información antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, según la familia Qwen; no confirmado en la información) |
| Parámetros totales | 4B según el nombre del modelo; 1.797.272 según safetensors (dato inconsistente, ver advertencias) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp; el modelo base estaría en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `InterpreticAI/Qwen3.5-4B-Uncensored-v2` en los datos proporcionados. Por el nombre se infiere una base de la familia Qwen3.5 con 4B parámetros y un ajuste fino posterior orientado a reducir el rechazo de contenido, pero no se documentan ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o fine-tuning supervisado. Tampoco se especifican innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

Lo único verificable es el proceso de cuantización: la model card indica `quantize_version: 2`, `convert_type: hf`, `output_tensor_quantised: 1` y que se trata de cuantizaciones "weighted/imatrix" del modelo base. Es decir, mradermacher aplicó cuantización con matrices de importancia (imatrix) sobre los pesos en formato HuggingFace para producir los GGUF, una práctica habitual para preservar calidad en cuantizaciones agresivas (Q2, IQ2, IQ3). No hay información sobre el tokenizador, el vocabulario ni la ventana de contexto efectiva tras la cuantización.

## Capacidades

- Generación de texto autoregresiva (capacidad inferida por el formato GGUF y la familia Qwen; no confirmada explícitamente).
- Razonamiento y código: no disponible; no se documenta en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste "uncensored": el nombre indica que el fine-tuning busca reducir negativas a peticiones, pero no se detalla el método ni el alcance.

## Casos de uso

Dada la ausencia de documentación, los casos de uso son hipotéticos y deben validarse empíricamente antes de cualquier despliegue:

- Experimentación local con llama.cpp: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de ~4B en equipos de consumo para pruebas de generación de texto sin infraestructura dedicada.
- Investigación sobre alineación y censura: comparar las respuestas del modelo "uncensored" frente a su base alineada para estudiar diferencias de comportamiento en temas sensibles, siempre con salvaguardas.
- Prototipado de chatbots de dominio cerrado: usar una cuantización Q4 o Q5 como base para un asistente interno, verificando primero la calidad y coherencia en el idioma objetivo.
- Generación de texto creativo en local: escenarios donde se prioriza la ausencia de filtros y la ejecución offline, con revisión humana posterior.
- Pruebas de pipelines de cuantización: servir como caso de estudio de cómo afectan IQ2/IQ3 frente a Q4/Q5 en la calidad de salida para un modelo de 4B.
- Evaluación de despliegue con Ollama o llama.cpp server: medir latencia y throughput en hardware consumer antes de comprometerse con un modelo mayor.

En ningún caso se recomienda su uso en producción orientada a usuarios finales sin una evaluación previa de sesgos, alucinaciones y cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4B en GGUF, las cuantizaciones Q4 rondarían los 2,5-3 GB y las Q6 en torno a 3,5-4 GB, pero este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 4B en Q4 podría caber en GPUs consumer con 6-8 GB de VRAM, pero no hay validación oficial.
- ¿Cabe en GPU consumer? Probablemente sí en Q4/Q5 según el tamaño nominal, pero no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (llama.cpp server, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa en su flujo estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones verificables del modelo base, por lo que no es posible establecer una comparación rigurosa con alternativas de la misma categoría (otros modelos de ~4B cuantizados en GGUF).

## Limitaciones y advertencias

- Inconsistencia crítica en el recuento de parámetros: el nombre indica 4B pero safetensors reporta 1.797.272; no se puede confirmar el tamaño real del modelo base.
- Licencia no declarada: no se puede verificar si el uso comercial está permitido. El modelo base (`InterpreticAI/Qwen3.5-4B-Uncensored-v2`) debería consultarse para conocer la licencia heredada.
- Idiomas no declarados: no hay garantía de calidad multilingüe ni de soporte del castellano.
- Contexto no documentado: se desconoce la ventana máxima efectiva tras la cuantización.
- Modelo "uncensored": el ajuste orientado a eliminar restricciones incrementa el riesgo de generar contenido dañino, sesgado o inexacto; requiere filtros y revisión humana en cualquier uso expuesto a terceros.
- Riesgo de alucinación: no evaluado; sin benchmarks ni evaluaciones publicadas.
- Repositorio sin tracción (0 descargas, 0 likes) y con tamaño reportado de 0.0 GB: posible artefacto incompleto o mal indexado; verificar la integridad de los ficheros antes de descargar.
- Cuantizaciones muy agresivas (IQ1, IQ2, Q2) degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior.
- No hay información sobre el proceso de fine-tuning "uncensored": se desconoce si se eliminaron salvaguardas de seguridad de forma sistemática.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-4B-Uncensored-v2-i1-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
