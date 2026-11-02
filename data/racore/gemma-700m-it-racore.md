# racore/gemma-700m-it-racore

## Resumen

`racore/gemma-700m-it-racore` es una representación simbólica comprimida del modelo `google/gemma-3-1b-it` de Google, publicada por el desarrollador independiente racore (Loaii Abdalslam). No se trata de un modelo entrenado desde cero, sino de una factorización discreta de ecuaciones y una regresión polinómica dispersa aplicadas sobre los pesos del Gemma 3 de 1B, con el objetivo de reducir el espacio en disco y acelerar la inferencia manteniendo la fidelidad de salida.

El paquete `q4_mix` ocupa 696 MB frente a los 1.999,8 MB del checkpoint original en BF16 (una reducción del 63,5 %), con una densidad media de 4,89 bits por peso. El autor reporta una aceleración de 2,44x en una RTX 3050 de 6 GB (de 18,91 a 46,10 tok/s) y de 2,50x en CPU x86_64 monohilo (de 0,31 a 1,30 tok/s), con una equivalencia declarada del 100 % en la generación de tokens.

La propuesta resulta relevante para despliegues en el borde y en CPU sin dependencias de frameworks de inferencia pesados, ya que incluye un motor en NumPy puro. El modelo hereda las capacidades conversacionales del Gemma 3 de 1B y está etiquetado para inglés y árabe, aunque la información publicada no detalla el proceso de ajuste instruccional más allá del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con representación simbólica de pesos mediante factorización de ecuaciones y regresión polinómica dispersa en bloques MLP |
| Parámetros totales | No disponible de forma explícita; el nombre comercial indica ~700M, derivado de `google/gemma-3-1b-it` |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `q4_mix` (4,89 bits/peso, enteros int4 e int8 con escalado por grupo de columnas G=32) |
| Idiomas soportados | Inglés (en), árabe (ar) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Paquete propietario de ecuaciones (`equations/q4_mix`) con motor NumPy; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only con bloques MLP de tipo GeGLU. Sobre esa base, el autor aplica dos transformaciones. La primera es un sistema de ecuaciones escaladas discretas: cada matriz de pesos W se mapea a `W_ij = s[i, floor(j/G)] · q_ij`, donde los factores de escala se calculan por grupo de columnas (G=32) y los coeficientes q se restringen a int4 (−8…7) o int8 (−127…127), lo que produce la mezcla `q4_mix` de 4,89 bits/peso.

La segunda transformación afecta a los bloques MLP, que según el autor concentran el 61,7 % de los parámetros. Se formula un diccionario de monomios dispersos `φ_k(x) = x_i · x_j` y se aproxima la salida como `y = Σ c_k · φ_k(x)` con rango K=256, lo que reduce los FLOPs por capa de 47.775.744 a 1.179.648 (un 97,53 % menos) y permite, según la model card, una aceleración aislada de 13,4x en CUDA. No se documenta un proceso de entrenamiento adicional, RLHF ni DPO: la ficha describe una compresión post-hoc con verificación especulativa paralela para preservar la trayectoria de decodificación. La divergencia KL del siguiente token se declara en 0,0323 nats y la coincidencia top-1 en el 100 %.

## Capacidades

- Generación de texto conversacional, heredada del ajuste instruccional de `gemma-3-1b-it`.
- Razonamiento básico y respuesta a preguntas en inglés y árabe.
- Ejecución en CPU pura mediante motor NumPy, sin necesidad de PyTorch en tiempo de inferencia.
- Decodificación especulativa simbólica con verificación paralela para mantener la equivalencia de salida.
- Integración con la librería `transformers` a nivel de metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Despliegue en dispositivos de borde con poca memoria: el paquete de 696 MB permite ejecutar un modelo conversacional en equipos con menos de 1 GB de almacenamiento disponible para pesos, algo inviable con el checkpoint BF16 de 2 GB.
- Inferencia en CPU sin GPU: con 1,30 tok/s en un solo hilo x86_64, encaja en tareas de generación corta por lotes, clasificación asistida o respuestas de pocas decenas de tokens donde la latencia de segundos es aceptable.
- Prototipado rápido en entornos sin CUDA ni frameworks de serving: el motor NumPy elimina la dependencia de vLLM, TGI o llama.cpp y simplifica la instalación en contenedores mínimos.
- Procesamiento de texto en árabe e inglés en sistemas embebidos o pasarelas locales, aprovechando las dos lenguas declaradas en la model card.
- Investigación sobre compresión simbólica de pesos: sirve como referencia reproducible para estudiar factorización discreta y regresión polinómica aplicada a transformers, con métricas de KL y coincidencia top-1 publicadas.
- Educación y demos interactivas: el tamaño reducido y la CLI `generate.py` permiten desplegar una demo de chat en portátiles con GPU de 6 GB como la RTX 3050 usada en las mediciones.
- Evaluación de pipelines de decodificación especulativa: la verificación paralela simbólica puede integrarse como componente de estudio en sistemas que comparen fidelidad frente a velocidad.

## Benchmarks y rendimiento

| Plataforma | Baseline BF16 | `gemma-700m-it-racore` | Aceleración | Fidelidad |
|---|---|---|---|---|
| NVIDIA RTX 3050 6 GB (portátil) | 18,91 tok/s (52,9 ms/tok) | 46,10 tok/s (21,6 ms/tok) | 2,44x | 100 % exacta |
| CPU x86_64, 1 hilo | 0,31 tok/s (3.160 ms/tok) | 1,30 tok/s (769 ms/tok) | 2,50x | 100 % exacta |

| Métrica del modelo | Checkpoint original | `q4_mix` | Impacto |
|---|---|---|---|
| Almacenamiento en disco | 1.999,8 MB | 696 MB | −63,50 % |
| Densidad de capa | 16,0 bits/peso | 4,89 bits/peso | 3,27x |
| KL del siguiente token | 0,0000 nats | 0,0323 nats | Divergencia casi nula |
| Coincidencia top-1 | 100,0 % | 100,0 % | Preservada |
| FLOPs por capa MLP | 47.775.744 | 1.179.648 | −97,53 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete de pesos ocupa 696 MB, por lo que se puede inferir un consumo moderado adicional para activaciones y caché KV, no cuantificado en la model card.
- GPU recomendadas: el autor valida una NVIDIA RTX 3050 de 6 GB; no se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: sí, confirmada en RTX 3050 de 6 GB; previsiblemente cabe en cualquier GPU con 4 GB o más, aunque no se aportan mediciones.
- Despliegue: motor propio en NumPy puro (`engine.SymbolicModel`), CLI `generate.py` con detección automática de dispositivo, e integración a nivel de repositorio con `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 21,6 ms/token en RTX 3050 (46,10 tok/s) y 769 ms/token en CPU monohilo (1,30 tok/s), según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `racore/gemma-700m-it-racore` | ~700M (derivado de 1B) | No disponible | Gemma | Paquete de ecuaciones NumPy | Compresión simbólica con 2,44x–2,50x de aceleración declarada |
| `google/gemma-3-1b-it` | 1B | No disponible en la información | Gemma | Safetensors (BF16) | Modelo base original; 1.999,8 MB |
| Gemma 2B (versión anterior de Google) | 2B | No disponible en la información | Gemma | Safetensors | Alternativa de tamaño similar en la familia Gemma, sin datos de rendimiento en esta ficha |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (referencia pública) | Apache 2.0 | Safetensors, GGUF | Alternativa de tamaño comparable con amplio ecosistema de serving; sin comparación medida frente a este modelo |

La comparación cuantitativa de calidad no está disponible: la model card solo publica métricas de velocidad, tamaño y fidelidad respecto al modelo base, no evaluaciones de capacidad.

## Limitaciones y advertencias

- La model card no documenta evaluaciones de sesgo, toxicidad ni alucinación; al derivar de Gemma 3 1B, hereda los sesgos del modelo base sin mitigaciones adicionales declaradas.
- La fidelidad del 100 % se refiere a la coincidencia top-1 y a la trayectoria de decodificación frente al modelo original, no a la corrección factual de las respuestas.
- La longitud de contexto no se especifica; no se debe asumir la ventana de Gemma 3 sin verificarla en el modelo base.
- Solo se declaran inglés y árabe; el rendimiento en castellano no está evaluado.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los Gemma Terms of Use antes de un despliegue en producción.
- El formato de pesos es propietario (paquete de ecuaciones con motor NumPy), lo que limita la portabilidad a ecosistemas estándar como vLLM, llama.cpp u Ollama.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, con creación y actualización el mismo día; se trata de una publicación muy reciente y sin validación independiente.
- Las cifras de aceleración provienen únicamente del autor y de una sola GPU de consumo; no hay replicaciones externas publicadas.
- El uso de un motor NumPy puro puede implicar un rendimiento inferior al de kernels CUDA optimizados en cargas de producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/racore/gemma-700m-it-racore
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Organización del autor: https://racore.xyz
- Contacto del autor: loaiabdalslam@gmail.com
- NumPy: https://numpy.org
