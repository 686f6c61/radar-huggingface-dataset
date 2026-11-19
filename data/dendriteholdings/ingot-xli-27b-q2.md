# dendriteholdings/Ingot-XLI-27B-Q2

## Resumen

Ingot-XLI-27B-Q2 es un modelo de generación de texto de 26.896 millones de parámetros (aproximadamente 27B) distribuido en formato GGUF y orientado a inferencia con llama.cpp. Se trata de un fine-tune del modelo ternario Prism ML Ternary Bonsai 2 27B, publicado por el usuario dendriteholdings como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que permanece más próxima a él. El modelo conserva los códigos ternarios del original y reajusta el resto de pesos para acercarse a Qwen3.8-27B.

La relevancia de este modelo es doble. Por un lado, demuestra un pipeline de cuantización extrema (1,75-2,125 bits por peso) que mantiene una fidelidad medible respecto al profesor en BF16, con una divergencia KL de 0,07231 frente a 0,07408 del modelo que desbancó. Por otro, su tamaño de fichero (5,95 GB en PTQ1_0 y 7,21 GB en PQ2_0) permite desplegar un modelo de casi 27B en hardware de consumo y en GPUs de servidor con un rendimiento de decodificación notable (137-145 tok/s en una RTX PRO 6000 Blackwell).

El modelo está pensado para generación de texto conversacional y hereda la arquitectura del Bonsai 2, incluyendo atención lineal y rotación de Hadamard. No obstante, requiere un fork específico de llama.cpp (Dendrite fork) para ejecutarse, ya que el llama.cpp estándar no soporta su layout. La información pública sobre licencia, idiomas y benchmarks de calidad es escasa o inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación de Hadamard (heredada de Ternary Bonsai 2 27B); pesos ternarios |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 (1,75 bits por peso) y PQ2_0 (2,125 bits por peso, mismo contenido ternario en contenedor de 2 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Prism ML Ternary Bonsai 2 27B, un transformer de 27B parámetros con pesos ternarios y mecanismos de atención lineal. La innovación principal de esta variante es el proceso de refinamiento aplicado por el minero de la subred Ingot: se mantienen los códigos ternarios del profesor y se reajustan el resto de pesos (escalas y componentes no ternarios) para minimizar la divergencia respecto a Qwen3.8-27B, que actúa como referencia de calidad. El resultado se evalúa mediante la divergencia KL entre las distribuciones de siguiente token del modelo y del profesor en BF16 sobre los tokens de respuesta de cada dominio, ponderada por la proporción de muestras de cada dominio.

El entrenamiento no se detalla en la información disponible (no se especifican número de tokens, composición del dataset ni si hubo RLHF/DPO). La model card indica que los pesos son la subida del minero byte a byte (`Ingot-XLI-27B-PQ2_0.gguf`) y que el fichero PTQ1_0 es un reempaquetado sin pérdida en el formato PTQ1_0 de Prism, donde cada bloque de 128 pesos conserva sus códigos y su escala fp16, de modo que cada peso decodifica al mismo valor. El mismo reempaquetado aplicado al fichero PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte de plantilla Jinja (`--jinja`).
- Razonamiento y respuesta multi-turno, aunque sin datos públicos sobre contextos largos.
- Capacidad de entrada de imágenes mediante el tower de visión de Ternary Bonsai 2 27B como proyector (`mmproj`), aunque la calidad de imagen no ha sido evaluada y el proyector fue diseñado para el modelo genesis, no para estos pesos.
- Decodificación especulativa mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generación aproximadamente 1,8x en greedy y 1,3-1,4x con sampling.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de ~27B en una única GPU de consumo o de gama alta: con 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0), el modelo cabe en GPUs con 8-12 GB de VRAM, lo que permite ejecutar un modelo de gran tamaño en hardware asequible.
- Servicio de chat conversacional de baja latencia en servidor: en una RTX PRO 6000 Blackwell se miden 137-145 tok/s de decodificación y 3.865 tok/s de procesamiento de prompt, adecuado para aplicaciones interactivas con concurrencia moderada.
- Inferencia en Apple Silicon: en un Mac Studio M3 Ultra con el fork de Dendrite se alcanzan 56,4 tok/s (PQ2_0) y 52,8 tok/s (PTQ1_0) en decodificación, lo que permite usar el modelo en estaciones de trabajo Mac sin GPU dedicada.
- Aceleración de generación con decodificación especulativa: integrando el drafter DFlash 2 se obtiene un incremento de 1,8x en greedy para asistentes de chat en tiempo real, a cambio de ~6 GB adicionales de VRAM.
- Investigación en cuantización extrema: el modelo sirve como caso de estudio de cuantización ternaria con métricas de fidelidad (KL) y comparación directa con el profesor, útil para estudiar el equilibrio entre compresión y calidad.
- Evaluación comparativa de modelos ternarios: al compartir layout y tamaños de fichero con otros reyes de la subred Ingot, permite comparar rendimiento y fidelidad entre variantes con el mismo coste de despliegue.
- Prototipado de asistentes multimodales: añadiendo el proyector de visión de Bonsai 2 se puede experimentar con entrada de imágenes, aunque con la advertencia de que la calidad no está validada.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K, etc.). El único dato de calidad disponible es la divergencia KL respecto al profesor:

| Métrica | Valor |
|---|---|
| KL (teacher ‖ model) de este modelo en su eval ganadora | 0,07231 |
| KL (teacher ‖ model) del rey al que superó, misma eval | 0,07408 |

Rendimiento de inferencia medido con `llama-bench` (128 tokens generados, prompt de 512 tokens, `-ngl 99 -fa 1`):

| GPU / plataforma | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| NVIDIA RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| NVIDIA RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra (80-core GPU, 512 GB), fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite con parche Metal | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; el autor no ha medido otras tarjetas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6 GB para PTQ1_0 y ~7,2 GB para PQ2_0, más overhead de contexto y del runtime (no especificado).
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) medida a 137-145 tok/s; RTX 5090 reportada por PrismML a 142 tok/s; cualquier GPU con al menos 8-12 GB de VRAM debería poder cargar el modelo, aunque no se han publicado medidas.
- Cabe en GPU de consumo: sí, por tamaño de fichero; se requiere el fork de Dendrite de llama.cpp con soporte CUDA o Metal.
- Opciones de despliegue: llama-server del fork Dendrite de llama.cpp (commit `62c418c`), con `-ngl 99 -fa on --jinja`. El llama.cpp estándar no ejecuta el modelo.
- Decodificación especulativa: el drafter DFlash 2 añade ~6 GB de VRAM y acelera 1,8x en greedy y 1,3-1,4x con sampling.
- Latencia y throughput: ver tabla de benchmarks; en Mac Studio M3 Ultra se obtienen 52,8-56,4 tok/s con el parche Metal de Dendrite.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XLI-27B-Q2 | 26,9B | No disponible | Ternaria 1,75-2,125 bpw | No disponible | GGUF en HF |
| prism-ml/Ternary-Bonsai-2-27B-gguf (profesor) | 27B | No disponible | Ternaria (PQ2_0, PTQ1_0) | No disponible | GGUF en HF |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27B (no confirmado) | No disponible | Ternaria Q2 | No disponible | GGUF en HF |
| Qwen3.8-27B (referencia de calidad) | 27B (no confirmado) | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos mencionados en la información disponible; no se han publicado datos de benchmarks de calidad que permitan una comparación objetiva más allá de la KL frente al profesor.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp (Dendrite fork, commit `62c418c`); el llama.cpp estándar no carga el modelo.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- Los idiomas soportados no están documentados; no se puede garantizar cobertura multilingüe.
- La longitud de contexto no está especificada, lo que limita la planificación de aplicaciones con contextos largos.
- La calidad de imagen con el proyector de visión no ha sido evaluada y el proyector fue entrenado para otro modelo (genesis), por lo que los resultados pueden degradarse.
- No se han publicado benchmarks estándar de calidad (MMLU, HumanEval, GSM8K), solo la divergencia KL frente al profesor, que mide fidelidad pero no capacidad absoluta.
- El modelo es un fine-tune de una submission de subred; su proceso de entrenamiento y datos no están documentados, lo que dificulta evaluar sesgos y riesgos de alucinación.
- El rendimiento medido se limita a RTX PRO 6000 Blackwell y Mac Studio M3 Ultra; en otras GPUs el comportamiento puede variar.
- El uso de decodificación especulativa añade ~6 GB de VRAM y requiere descargar un drafter adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XLI-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector de visión (Q8_0): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector de visión (BF16): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Commit de referencia: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
- Modelo genesis relacionado: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
