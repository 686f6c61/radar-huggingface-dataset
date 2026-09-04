# benjzzz/DeepSeek-V4-Pro-671B-GALE-1bit-v4

## Resumen

DeepSeek-V4-Pro-671B-GALE-1bit-v4 es una cuantización extrema de los expertos enrutados del modelo DeepSeek-V4-Pro, un modelo de arquitectura mixta de expertos (MoE) de aproximadamente 1.57 billones de parámetros contados por formas de tensores. Desarrollada por el usuario benjzzz, esta versión reduce los pesos de los expertos a representaciones de 1 bit mediante la técnica GALE v4 con retroalimentación de error estilo GPTQ, lo que permite ejecutar el modelo en hardware de consumo como dos RTX 3090 y una RTX 2080 Ti. El objetivo es explorar los límites de la compresión extrema en modelos MoE gigantes, sacrificando calidad de generación a cambio de una huella de memoria drásticamente menor. El servidor incluido auto-detecta las GPUs disponibles y ajusta la distribución de capas y cachés sin configuración manual. Aunque la coherencia se degrada tras unas pocas decenas de tokens, esta ficha documenta un experimento relevante para la investigación en cuantización y despliegue eficiente de modelos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | ~1.57 T (según el autor, contados por formas de tensores) |
| Parametros activos | 671B (según el nombre del modelo; no se especifica si son activos o totales) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GALE 1-bit v4 para expertos enrutados (signo por peso bajo rotación FWHT-1024, escala fp16 por bloque de 128 pesos, 1% outliers como int4); fp8 block-scaled en disco para atención y expertos compartidos, cuantizado a 4-bit en VRAM; fp16 para embeddings y output head (head 4-bit en VRAM); fp16 para normas, routers y hyper-connection mixes |
| Idiomas soportados | no disponible |
| Licencia | deepseek (otra; consultar licencia del modelo base) |
| Formato de pesos | Formato propietario GALE 1-bit v4 (archivos .pack en `packed_v4/` y `misc_v3/`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Pro es un transformer MoE con 61 capas y 384 expertos enrutados por capa, cada uno con matrices w1/w2/w3. Además incluye atención y expertos compartidos, embeddings, output head, normas, routers y hyper-connection mixes. La cuantización GALE v4 se aplicó únicamente a los expertos enrutados: cada peso se redujo a su bit de signo bajo una rotación bloqueada FWHT-1024, con escalas fp16 por bloques de 128 pesos y un 1% de outliers representados como int4 con escala fp16 por fila. Los pesos no expertos se almacenan como fp8 en disco y se cuantizan a 4-bit simétrico al cargar en VRAM.

El proceso de cuantización utilizó retroalimentación de error estilo GPTQ en el espacio de salida: para cada matriz de experto, el error de redondeo de cada columna se propaga a las columnas aún no cuantizadas, ponderado por la inversa de la hessiana de activaciones reales (16k tokens capturados del propio modelo, ridge 0.3), y se incorpora una ganancia por fila por mínimos cuadrados en las escalas de bloque sin coste adicional de bits. No hubo entrenamiento fino, solo cuantización. El servidor incluye la implementación de referencia oficial de DeepSeek-V4-Pro y kernels Triton y x86 AVX2.

## Capacidades

- Generación de texto limitada a respuestas cortas; el servidor limita las respuestas a 64 tokens.
- Escritura de funciones pequeñas, según el autor.
- Sin soporte de tool calling ni function calling; solo texto.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión o audio.
- Capacidades multilingües: no especificadas.
- El servidor expone API estilo OpenAI (`/v1/chat/completions`) y estilo Ollama (`/api/chat`).

## Casos de uso

- Investigación en cuantización extrema: permite estudiar el impacto de representaciones de 1 bit en la calidad de un MoE gigante, comparando el error relativo de activaciones y la coherencia de salida con el modelo base.
- Evaluación de técnicas de compresión: el repositorio incluye el cuantizador (`v4pro_gptq1bit.py`) y artefactos de calibración, lo que facilita reproducir y modificar el proceso de cuantización para experimentar con diferentes estrategias de error feedback.
- Pruebas de despliegue en hardware heterogéneo: el servidor auto-detecta las GPUs disponibles y decide entre residencia completa o modo por niveles, útil para probar algoritmos de planificación de recursos en clusters con GPUs de distinta capacidad.
- Prototipado de respuestas cortas en entornos aislados: para preguntas simples o fragmentos de código pequeños, el modelo puede generar respuestas breves sin necesidad de servicios en la nube, aunque con calidad limitada.
- Educación en arquitecturas MoE: el código del servidor, los kernels Triton y el kernel x86 AVX2 permiten estudiar el funcionamiento interno de un modelo de 1.57 T parámetros, incluyendo el enrutamiento de expertos y la gestión de cachés.
- Generación de código pequeño en modo offline: el modelo puede escribir funciones simples, lo que lo hace adecuado para pruebas de autocompletado en entornos sin conexión, siempre que se acepten las limitaciones de coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de error de cuantización y velocidad de inferencia en la configuración por niveles:

| Métrica | Valor |
|---|---|
| Error relativo de activaciones (redondeo de signo naive) | 0.74 |
| Error relativo de activaciones (v4, fuera de muestra) | 0.52–0.54 |
| Error relativo de activaciones (v4, dentro de muestra por capa) | 0.38–0.52 |
| Error relativo de pesos no expertos (int4) | 0.119 |
| Decodificación (modo por niveles) | 1.27 tok/s |
| Prefill (prompt de 34 tokens) | ~21 s (limitado por NVMe) |

## Requisitos de hardware

- VRAM estimada: el autor no proporciona una cifra exacta para residencia completa. Según la densidad de bits declarada (~1.39 bits/peso en VRAM sobre ~1.57 T parámetros), la residencia completa requeriría aproximadamente 273 GB, pero no se ha medido. En modo por niveles, la VRAM se complementa con cachés de expertos calientes y memoria del sistema.
- GPUs recomendadas: el autor lo ejecutó en 2× RTX 3090 (24 GB) + 1× RTX 2080 Ti (11 GB) + Ryzen 9 3900X. Para residencia completa se necesitaría un nodo multi-GPU de clase 80 GB.
- ¿Cabe en GPU de consumo? Sí, en modo por niveles con múltiples GPUs de consumo. No en una sola GPU de consumo.
- Opciones de despliegue: el despliegue se realiza mediante el script `server/deepseek_v4pro_server_v2.py` incluido en el repositorio. Expone API estilo OpenAI y estilo Ollama. No es compatible con vLLM, llama.cpp ni TGI.
- Latencia y throughput: decodificación 1.27 tok/s; prefill ~21 s para un prompt de 34 tokens, limitado por NVMe, en la configuración por niveles medida.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con modelos similares en la información proporcionada. El modelo base DeepSeek-V4-Pro sin cuantizar es la referencia natural, pero no se han publicado resultados de benchmarks para esta cuantización. Cualitativamente, el modelo base ofrece una calidad mucho mayor y soporte completo de capacidades, pero requiere infraestructura de servidor de gran escala; esta cuantización extrema sacrifica calidad para ejecutarse en hardware de consumo.

## Limitaciones y advertencias

- Coherencia degradada tras unas pocas decenas de tokens; el servidor limita las respuestas a 64 tokens.
- No apto para producción ni para tareas complejas de razonamiento o generación de código extenso.
- No soporta tool calling ni function calling; solo texto.
- Riesgo alto de alucinación y respuestas incoherentes.
- Sesgos del modelo base no corregidos; no hay evaluación de sesgos.
- Licencia "deepseek" no estándar; consultar la licencia del modelo base para restricciones de uso comercial.
- Velocidad de decodificación muy baja (1.27 tok/s) en la configuración medida.
- Solo compatible con NVIDIA CUDA (Triton) y x86 AVX2; no funciona en Apple Silicon ni ARM.
- El autor advierte que la calidad es limitada y que "no es un agente de código todavía".

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/benjzzz/DeepSeek-V4-Pro-671B-GALE-1bit-v4
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
- Página de DeepSeek-V4-Pro en deepseeksr1.com: https://deepseeksr1.com/v4-pro/
