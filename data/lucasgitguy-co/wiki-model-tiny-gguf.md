# Lucasgitguy-co/wiki-model-tiny-GGUF

## Resumen

wiki-model-tiny-GGUF es la versión cuantizada en formato GGUF del modelo wiki-model-tiny, un transformer de 12,5 millones de parámetros entrenado desde cero por el desarrollador Lucasgitguy-co. El modelo está diseñado específicamente para tareas de generación de hechos a partir de contexto, con un formato de prompt estructurado mediante etiquetas (`<fact>`, `<q>`, `<fix>`, `<ctx>`) y una ventana de contexto muy reducida de 384 tokens. Su propósito es servir como modelo de demostración o experimento de bajo coste para generación de respuestas basadas en contexto (grounded generation) sobre contenido de Wikipedia.

La relevancia de esta ficha es limitada: se trata de un modelo experimental de tamaño minúsculo, sin descargas ni interacciones en Hugging Face, y sin benchmarks publicados. No obstante, resulta útil como referencia para entender el proceso de conversión de pesos PyTorch a GGUF para llama.cpp, especialmente en modelos con arquitecturas no convencionales (ancho 320, no divisible por 256, lo que impide el uso de cuantizaciones K-quant).

El repositorio contiene únicamente dos ficheros GGUF (F16 y Q8_0), generados directamente desde PyTorch mediante un script propio (`convert_tiny.py`) que usa `gguf-py`. El modelo base emplea un tokenizador BPE a nivel de byte almacenado como `gpt2` en el GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; pesos con qkv y gate_up fusionados) |
| Parametros totales | 12.539.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | F16, Q8_0 (no hay K-quants porque el ancho 320 no es multiplo de 256) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16 y Q8_0); el modelo base original esta en PyTorch |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es un transformer de 12,5 millones de parámetros entrenado desde cero, con pesos que incluyen proyecciones `qkv` y `gate_up` fusionadas, lo que sugiere una arquitectura tipo LLaMA con atención multi-cabeza y capa feed-forward con activación tipo SwiGLU. El ancho del modelo es 320, un valor que no es múltiplo de 256 y que por tanto impide generar cuantizaciones K-quant en llama.cpp. La codificación posicional RoPE se mantiene tal cual en la conversión porque el modelo ya usa el layout intercalado de llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de que deriva de Wikipedia con licencia CC BY-SA 4.0), ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El tokenizador es un BPE a nivel de byte almacenado como `gpt2` con pre-tokenizador `gpt-2`. El proceso de conversión fue validado con llama.cpp 1.0.0 (build 12359) el 2026-11-16: los IDs de tokens coinciden con el tokenizador original en los tres formatos de prompt, y la salida greedy (F32 y F16) es idéntica al modelo PyTorch en 4 prompts hasta el token de fin de respuesta.

## Capacidades

- Generación de texto condicionada a contexto explícito mediante la etiqueta `<ctx> ... </ctx>`.
- Respuesta a preguntas formuladas con `<q> ... </q>` basándose en el contexto proporcionado.
- Corrección o verificación de afirmaciones mediante `<fix> ... </fix>`.
- Generación de hechos sobre un tema con `<fact> ... </fact>`.
- Funcionamiento en llama.cpp como modelo tipo `llama` estándar.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Demostración educativa de conversión PyTorch a GGUF: el repositorio incluye el script `convert_tiny.py` y documenta el proceso de split de pesos fusionados y preservación de RoPE, útil para desarrolladores que quieran replicar el flujo con modelos propios.
- Pruebas de integración con llama.cpp: al ser un modelo de 12,5M parámetros, permite validar pipelines de inferencia, tokenización y cuantización en entornos con recursos mínimos.
- Generación de respuestas grounded sobre fragmentos de Wikipedia: proporcionando manualmente el texto en `<ctx>`, el modelo responde preguntas concretas sobre ese fragmento, adecuado para prototipos de QA extractivo de baja latencia.
- Verificación de afirmaciones simples: usando `<fix>` se puede comprobar si una frase es consistente con el contexto suministrado, en escenarios de validación de datos a pequeña escala.
- Benchmarking de infraestructura: su reducido tamaño (25 MB en F16) permite medir latencia y throughput de llama.cpp en hardware muy limitado, como Raspberry Pi o CPUs sin GPU.
- Pruebas de robustez y alucinación: el propio autor advierte que sin contexto el modelo "inventa" en su mayoría, lo que lo convierte en un caso de estudio controlado para evaluar comportamientos de alucinación en modelos pequeños.
- Experimentos de investigación sobre modelos desde cero: sirve como baseline mínimo para comparar técnicas de entrenamiento, tokenización o arquitectura en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en F16 (fichero de 0,025 GB) y aproximadamente 14 MB en Q8_0 (fichero de 0,014 GB); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Funciona en iGPU y en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, etc.) y en dispositivos de borde.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-cli`), y por extensión cualquier frontend compatible con GGUF (Ollama, llama-cpp-python). No se ha documentado soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera latencia de milisegundos en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| wiki-model-tiny-GGUF | 12,5M | 384 | en | Apache-2.0 | GGUF | Modelo experimental, sin benchmarks |
| TinyLlama-1.1B | 1,1B | 2048 | en (principalmente) | Apache-2.0 | safetensors, GGUF | Mucho mayor, con benchmarks publicados |
| Qwen2.5-0.5B | 0,5B | 32.768 | multilingue | Apache-2.0 | safetensors, GGUF | Mayor contexto y capacidades generales |
| SmolLM-135M | 135M | 2048 | en | Apache-2.0 | safetensors, GGUF | Mayor tamano y contexto, con evaluaciones |

No se dispone de datos de rendimiento comparativo para wiki-model-tiny-GGUF; la comparativa se limita a especificaciones estructurales.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (12,5M parámetros): capacidad de razonamiento y conocimiento factual muy limitada.
- Ventana de contexto de solo 384 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- El autor advierte explícitamente que sin contexto el modelo "inventa en su mayoría" (alucinación alta).
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No incluye el índice BM25 `--grounded` del paquete Python original, por lo que el contexto debe suministrarse manualmente.
- Sin cuantizaciones K-quant disponibles por limitaciones del ancho del modelo (320).
- Sin descargas ni validación comunitaria en Hugging Face (0 descargas, 0 likes en el momento de la ficha).
- Los datos de entrenamiento derivados de Wikipedia están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual en obras derivadas, aunque el modelo se distribuya con Apache-2.0.
- No apto para producción sin validación exhaustiva; se recomienda tratarlo como experimento o herramienta educativa.
- Fecha de creación futura (2026-11-16) en los metadatos, lo que puede indicar un artefacto de prueba o un error de registro.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Lucasgitguy-co/wiki-model-tiny-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Lucasgitguy-co/wiki-model-tiny
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- gguf-py (librería de conversión): https://github.com/ggml-org/ggml/tree/master/gguf-py
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
