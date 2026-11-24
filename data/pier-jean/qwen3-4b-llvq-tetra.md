# Pier-Jean/Qwen3-4B-LLVQ-Tetra

## Resumen

Qwen3-4B-LLVQ-Tetra es una cuantización extrema del modelo Qwen3-4B de Alibaba Qwen, publicada por el desarrollador independiente Pier-Jean. Aplica una técnica propia denominada LLVQ (Leech Lattice Vector Quantization) con el códec Tetra, que almacena la mayoría de las matrices de pesos sobre la red de Leech Λ₂₄ a 48 bits por bloque de 24 pesos, con una escala por fila. El resultado es un modelo que ocupa 1,38 GB en disco frente a los 8,04 GB del original en FP16, es decir, 2,73 bits por parámetro incluyendo el embedding.

La propuesta no es solo de compresión: el formato está diseñado para que un kernel pueda decodificar y multiplicar en una sola pasada, de modo que los pesos permanezcan comprimidos en memoria. En Apple Silicon el modelo cargado ocupa 2,75 GB con las 252 proyecciones comprimidas; en NVIDIA solo 168 de 252, porque el lado CUDA aún no dispone del kernel de 4 bits. La relevancia actual está en que demuestra que una cuantización de 2 bits con correcciones tipo GPTQ puede mantener un MMLU de 63,37 frente a 70,14 en FP16, un diferencial de 6,77 puntos, con un tamaño cuatro veces menor que AWQ w4g128.

El modelo base es Qwen3-4B, un transformer denso de 4 mil millones de parámetros con ventana de contexto de 32.768 tokens y modo de razonamiento. Esta versión cuantizada conserva el tokenizador y la configuración de generación del original, pero requiere una librería externa (`llvq-tetra`) para cargarse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con pesos cuantizados mediante Leech Lattice Vector Quantization (LLVQ) y códec Tetra |
| Parametros totales | 1.332.236.336 (según safetensors del repo cuantizado); el modelo base Qwen3-4B tiene aproximadamente 4.000 millones |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-4B soporta 32.768 tokens) |
| Tipos de cuantizacion | 2,73 bits por parámetro efectivos: códigos de red de Leech a 48 bits por bloque de 24 pesos (168 de 252 proyecciones), enteros de 4 bits con grupos de 128 (`v_proj`, `o_proj`, `down_proj` de capas 12 a 23), enteros de 4 bits con grupos de 64 (embedding atado a la cabeza de salida), f16 para normas y resto |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `custom_code`; requiere `llvq-tetra` para decodificar; existe una variante sellada en un único fichero para el motor Rust (`Qwen3-4B-LLVQ-Tetra-sealed`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3, con atención estándar y sin mezcla de expertos. La innovación está en la capa de cuantización: la mayoría de las matrices de pesos se codifican sobre la red de Leech Λ₂₄, el retículo de mayor densidad en 24 dimensiones, usando el códec Tetra. Cada bloque de 24 pesos se representa con 48 bits (2 bits por peso) más una escala por fila, con una cola corta que se mantiene sin cuantizar. Las proyecciones `v_proj` y `o_proj` de todas las capas y `down_proj` de las capas 12 a 23 usan enteros de 4 bits con grupos de 128; el embedding, atado a la cabeza de salida, usa 4 bits con grupos de 64.

El ajuste de los códigos se realizó con correcciones de estilo GPTQ sobre 131.072 tokens de DCLM-edu. Posteriormente se reentrenó la escala de cada fila contra el modelo FP16 con los códigos congelados. El repositorio incluye `llvq-digest.json` con un SHA-256 por campo y `llvq-dense-digest.json` con uno por matriz reconstruida, lo que permite verificar el decodificador de Python contra el de Rust mediante `python -m llvq_tetra.checkdense`. No se menciona RLHF ni DPO específicos para esta cuantización; se heredan los del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen3-4B.
- Razonamiento y matemáticas: obtiene 82,49 en GSM8K zero-shot, lo que indica que conserva buena parte de la capacidad aritmética del original pese a la compresión agresiva.
- Conocimiento general: 63,37 en MMLU 5-shot sobre 14.042 preguntas.
- Modo de razonamiento: no confirmado explícitamente en la información disponible para esta versión cuantizada; el modelo base Qwen3 lo incorpora.
- Tool calling y function calling: no disponible en la información proporcionada para esta versión.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card, aunque el tokenizador de Qwen3 cubre más idiomas.
- Inferencia con pesos comprimidos en memoria mediante `LLVQ_HF_FUSED=1`, con kernel fusionado en Metal (252 proyecciones) y CUDA (168 proyecciones).

## Casos de uso

- Despliegue en dispositivos con memoria limitada: con 1,38 GB en disco y 2,75 GB en memoria en Apple Silicon con el camino fusionado, el modelo cabe en portátiles y estaciones de trabajo sin GPU dedicada, lo que permite prototipar asistentes conversacionales localmente.
- Investigación en cuantización extrema: sirve como referencia reproducible para comparar técnicas de 2 bits; los digests SHA-256 por campo y por matriz permiten validar implementaciones alternativas del decodificador.
- Evaluación de kernels de decodificación: el repositorio está pensado para que un kernel decodifique y multiplique en una pasada, por lo que es útil para probar estrategias de cómputo sobre pesos comprimidos sin materializarlos en denso.
- Generación de texto en inglés con requisitos de almacenamiento mínimos: para pipelines por lotes donde el coste de disco o de transferencia de pesos es crítico, el modelo ofrece 1,38 GB frente a 8,04 GB en FP16 con una pérdida de 6,77 puntos en MMLU.
- Razonamiento aritmético ligero: con 82,49 en GSM8K, puede emplearse en tareas de resolución de problemas matemáticos de nivel escolar en entornos con poca VRAM, aceptando la degradación frente a FP16.
- Banqueo de pruebas de robustez: la advertencia de la model card sobre la carga silenciosa sin `import llvq_tetra` lo convierte en un caso de estudio útil para diseñar verificaciones de integridad en pipelines de evaluación de modelos cuantizados.

## Benchmarks y rendimiento

| Métrica | Este modelo (LLVQ-Tetra) | FP16 | AWQ w4g128 | IQ2_XXS |
|---|---|---|---|---|
| Bits por parámetro (modelo completo) | 2,73 | 16,00 | 5,30 | 2,48 |
| Bytes de pesos | 1,38 GB | 8,04 GB | 2,67 GB | 1,25 GB |
| MMLU, 5-shot, 14.042 preguntas | 63,37 | 70,14 | 68,14 | 39,78 |
| GSM8K, zero-shot, 1.319 problemas | 82,49 | 92,12 | 89,01 | no puntuado |
| Decodificación, batch 1 | 113,8 tok/s (motor propio) | 83,1 (vLLM) | 200,5 (vLLM) | 312,9 (llama.cpp) |

El autor reporta intervalos de confianza al 95 % sobre las mismas preguntas emparejadas: 6,77 puntos MMLU [6,05; 7,50] y 9,63 puntos GSM8K [7,69; 11,57] por debajo de FP16; frente a AWQ, 4,76 [4,02; 5,49] y 6,52 [4,39; 8,65]. Ninguna de estas puntuaciones se midió a través del cargador de `transformers`: las del modelo LLVQ provienen del motor Rust sobre una NVIDIA L40S, y FP16 y AWQ se ejecutaron en vLLM con los mismos prompts y evaluador. En una A100, el modelo decodifica 74,2 tok/s frente a 145,6 de FP16 en vLLM.

## Requisitos de hardware

- VRAM estimada: 8 GB en f16 y 16 GB en float32 con el camino por defecto, que decodifica a tensores densos durante la carga; 2,75 GB en Apple Silicon con `LLVQ_HF_FUSED=1` y las 252 proyecciones comprimidas.
- En NVIDIA con el camino fusionado solo se comprimen 168 de 252 proyecciones, porque el kernel CUDA de 4 bits no está disponible todavía.
- GPU recomendadas: NVIDIA L40S (medición de referencia del autor), NVIDIA L4 (verificación de tokens idénticos), NVIDIA A100 (74,2 tok/s). En Apple Silicon funciona con Metal.
- Cabe en GPU de consumo: el tamaño de pesos (1,38 GB) lo permite, pero no se han publicado mediciones en RTX 4090 u otras tarjetas de consumo en la información disponible.
- Despliegue: `transformers` con `llvq-tetra` instalado; el camino fusionado requiere `ninja` y un compilador para compilar el kernel en el primer uso. No hay kernel precompilado publicado. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 113,8 tok/s en decodificación batch 1 sobre L40S con el motor propio; 74,2 tok/s en A100. El camino fusionado procesa un vector de activación por vez, por lo que un prompt largo cuesta un dispatch por token y por proyección.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-4B-LLVQ-Tetra | ~4.000 M (1.332 M en safetensors cuantizado) | no disponible | 63,37 | 82,49 | apache-2.0 | Hugging Face, requiere `llvq-tetra` |
| Qwen3-4B FP16 | ~4.000 M | no disponible | 70,14 | 92,12 | apache-2.0 | Hugging Face |
| Qwen3-4B AWQ w4g128 | ~4.000 M | no disponible | 68,14 | 89,01 | apache-2.0 | Hugging Face, ecosistema estándar |
| Qwen3-4B IQ2_XXS | ~4.000 M | no disponible | 39,78 | no puntuado | apache-2.0 | llama.cpp |

La comparación se limita a variantes del mismo modelo base porque no se han proporcionado datos de otros modelos de tamaño similar. Frente a AWQ, LLVQ-Tetra ocupa aproximadamente la mitad de bytes (1,38 GB frente a 2,67 GB) a costa de 4,76 puntos de MMLU y 6,52 de GSM8K. Frente a IQ2_XXS, ocupa un 10 % más de espacio pero gana 23,59 puntos de MMLU.

## Limitaciones y advertencias

- No hay ninguna medida de calidad obtenida a través del cargador de `transformers`; solo se verificó la identidad de tokens contra el motor Rust, y el propio autor califica esa comprobación de débil: un defecto que afectaba al 8,79 % de una fila de matriz dejó intactos 64 tokens greedy en dos de cuatro prompts.
- Si se omite `import llvq_tetra` y no se usa `trust_remote_code=True`, `transformers` imprime un aviso, ignora la cuantización, reinicializa los 254 pesos que no encuentra y ejecuta el modelo con pesos aleatorios sin lanzar error. Los logits parecen normales. Cualquier benchmark debe verificar esa línea antes de confiar en la puntuación.
- `save_pretrained` no funciona: escribir el formato requiere el codificador, que está en Rust.
- El camino fusionado compila un kernel en el primer uso y no hay kernel precompilado publicado.
- En NVIDIA solo se fusionan 168 de 252 proyecciones; en Metal, las 252.
- Los kernels fusionados procesan un vector de activación por vez, lo que penaliza prompts largos con un dispatch por token y proyección.
- Solo se ha probado con Qwen3.
- El rendimiento varía mucho por hardware: en A100 el modelo decodifica 74,2 tok/s, por debajo de FP16 en vLLM (145,6 tok/s).
- Idiomas: la model card declara únicamente inglés.
- Sesgos y alucinaciones: no se documentan específicamente para esta cuantización; se heredan los del modelo base Qwen3-4B, no detallados en la información proporcionada.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B y de la librería `llvq-tetra` por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra
- Variante sellada para el motor Rust: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Referencia arXiv citada en los tags: arxiv:2603.11021
- Referencia arXiv citada en los tags: arxiv:2609.35465
