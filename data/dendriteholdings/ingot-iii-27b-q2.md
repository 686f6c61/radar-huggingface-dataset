# dendriteholdings/Ingot-III-27B-Q2

## Resumen

Ingot-III-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros derivado de Prism ML Ternary Bonsai 2 27B, un transformer con pesos ternarios. Lo publica dendriteholdings como espejo público de una submission ganadora de la subred Ingot de Bittensor, un certamen en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo base es Qwen3.8-27B, y el minero retocó las escalas por bloque y los pesos de normalización para acercar la salida a ese profesor.

La relevancia del modelo es doble: por un lado, demuestra hasta dónde llega la cuantización ternaria (códigos de tres niveles más escalas por bloque) para comprimir un modelo de 27B en un GGUF de 7,2 GB; por otro, documenta un proceso de selección competitivo con métricas objetivas de fidelidad (KL de 0,11440 frente al profesor BF16). No es un modelo de propósito general con garantías de producción, sino una pieza de investigación sobre compresión extrema y alineación con un profesor.

El modelo se ejecuta exclusivamente con el fork de llama.cpp de PrismML en el commit `e3de715`, no con llama.cpp estándar. Incorpora soporte opcional de decodificación especulativa mediante un drafter DFlash 2 (aceleración de 1,8x en modo greedy) y de entrada de imágenes si se le añade el proyector multimodal del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (códigos de 3 niveles, escalas por bloque y rotación de Hadamard) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (Q2, ~2 bits efectivos); drafter DFlash 2 en Q8_0; proyector multimodal en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); también disponible en MLX 2-bit para Apple Silicon |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27B parámetros cuyos pesos se almacenan en formato ternario: cada peso toma uno de tres valores, con escalas por bloque que recuperan rango dinámico. Sobre esa base, el minero de la subred Ingot reajustó las escalas por bloque y los pesos de normalización para minimizar la divergencia respecto al profesor Qwen3.8-27B en BF16. Los códigos ternarios provienen de Ternary Bonsai 2 y no se modificaron; solo se reajustaron los parámetros continuos que acompañan a la cuantización.

El entrenamiento no es un preentrenamiento ni un finetune convencional, sino un proceso de destilación por búsqueda: el validador de Ingot evalúa la fidelidad de cada submission midiendo la KL entre las distribuciones del siguiente token del profesor y las del candidato, además de la distancia de estados ocultos promediada cada 8 capas. La submission ganadora obtuvo KL 0,11440 y distancia 0,3617, frente a 0,11666 y 0,3873 del modelo que ostentaba el título. El layout, tokenizador y rotación de Hadamard siguen el esquema de Ingot-genesis-27B-Q2, y el resultado no es ejecutable con llama.cpp estándar: requiere el fork PrismML-Eng/llama.cpp en el commit `e3de715`.

## Capacidades

- Generación de texto conversacional en una sola secuencia, con plantilla de chat compatible con `--jinja`.
- Razonamiento y respuesta a instrucciones heredados del profesor Qwen3.8-27B, sujetos a la degradación propia de la cuantización ternaria.
- Entrada multimodal opcional: admite imágenes si se carga el proyector `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `BF16` del modelo base (calidad no evaluada).
- Decodificación especulativa con el drafter `Ingot-27B-DFlash2-Q8_0.gguf`, que acelera la generación en modo greedy y con sampling.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso ni modo thinking; no disponible.

## Casos de uso

- Investigación en cuantización extrema: servir como referencia reproducible para estudiar el impacto de pesos ternarios en la calidad de un modelo de 27B, comparando sus salidas con el profesor BF16 mediante KL y distancia de estados ocultos.
- Despliegue en hardware con VRAM limitada: al ocupar 7,2 GB en disco, permite ejecutar un modelo de 27B en GPUs de consumo con 8-12 GB de VRAM, algo inviable con pesos BF16.
- Evaluación de pipelines de destilación competitiva: útil para reproducir el flujo de Ingot (cuantizar, medir fidelidad, seleccionar) en entornos de investigación sobre Bittensor.
- Chat conversacional de bajo coste en entornos controlados: con `llama-server` y plantilla Jinja, puede montarse un servicio de conversación para pruebas internas donde la fidelidad exacta al profesor no sea crítica.
- Aceleración de inferencia con decodificación especulativa: el par modelo + drafter DFlash 2 sirve para medir el rendimiento de técnicas de speculative decoding en modelos ternarios, con una ganancia documentada de 1,8x en greedy.
- Pruebas de multimodalidad experimental: cargando el proyector del modelo base se puede evaluar de forma cualitativa la capacidad de describir imágenes, asumiendo que la calidad no está garantizada.
- Referencia para el ecosistema MLX en Apple Silicon: la versión `Ingot-III-27B-MLX-2bit` permite experimentar con el modelo en Macs con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de fidelidad respecto al profesor:

| Metrica | Este modelo | Modelo que ostentaba el titulo |
|---|---|---|
| KL(profesor ‖ modelo) | 0,11440 | 0,11666 |
| Distancia de estados ocultos (cada 8 capas) | 0,3617 | 0,3873 |

Además, se documenta una aceleración de aproximadamente 1,8x en decodificación greedy de un solo flujo y de 1,3-1,4x con sampling al usar el drafter DFlash 2, a cambio de unos 6 GB adicionales de VRAM.

## Requisitos de hardware

- VRAM estimada: el GGUF pesa 7,2 GB, por lo que la inferencia cabe en GPUs con 8 GB o más, dejando margen para el contexto y el runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en datacenter, A100, H100 o L40S para mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 8-10 GB de VRAM.
- Con el drafter DFlash 2 hay que sumar unos 6 GB de VRAM adicionales.
- Despliegue: exclusivamente con el fork PrismML-Eng/llama.cpp en el commit `e3de715` (compilado con `-DGGML_CUDA=ON`), usando `llama-server` con `-ngl 99 -fa on --jinja`. No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI.
- En Apple Silicon, el pack MLX 2-bit permite ejecución nativa.
- Latencia y throughput: no disponibles de forma absoluta; solo se conoce la mejora relativa del drafter (1,8x greedy, 1,3-1,4x con sampling).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-III-27B-Q2 | 26,9B | no disponible | GGUF ternario | no disponible | Requiere fork de llama.cpp; fidelidad KL 0,11440 al profesor |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | GGUF ternario | no disponible | Modelo base; incluye proyector multimodal oficial |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B | no disponible | GGUF ternario | no disponible | Define el layout y tokenizador que hereda Ingot-III |
| Qwen3.8-27B (profesor, BF16) | 27B | no disponible | safetensors/BF16 | no disponible | Referencia de calidad; requiere mucha más VRAM |

La comparación con modelos de la misma categoría en precisión estándar (por ejemplo, Qwen 27B en BF16) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada; no se puede asumir uso comercial sin verificar los términos del modelo base y del profesor.
- No es ejecutable con llama.cpp estándar ni con la mayoría de runtimes habituales; depende de un fork y un commit concretos, lo que complica el mantenimiento en producción.
- La cuantización ternaria introduce degradación frente al profesor BF16; la KL de 0,11440 indica una divergencia medible en la distribución del siguiente token.
- La calidad multimodal es desconocida: el proyector se diseñó para Ingot-genesis y no se evaluó con estos pesos.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; hay que asumir los del modelo base sin verificación.
- Riesgo de alucinación inherente a un modelo de 27B cuantizado de forma agresiva, sin datos de evaluación que lo acoten.
- La model card no reporta benchmarks de capacidad, por lo que no hay garantías cuantitativas de rendimiento en tareas concretas.
- Procede de un certamen competitivo (Bittensor) y su valoración se basa en fidelidad al profesor, no en utilidad práctica demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-III-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo de layout de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Pack MLX 2-bit: https://huggingface.co/dendriteholdings/Ingot-III-27B-MLX-2bit
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Commit requerido: https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
