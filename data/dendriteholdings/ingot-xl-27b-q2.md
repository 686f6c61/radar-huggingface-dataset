# dendriteholdings/Ingot-XL-27B-Q2

## Resumen

Ingot-XL-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo maestro fijo (teacher) y el validador premia la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-gguf y aplica un ajuste fino sobre los pesos no ternarios, conservando los códigos ternarios originales, para acercar la distribución de salida a la del teacher Qwen3.8-27B.

La relevancia del modelo es doble. Por un lado, es un ejemplo práctico de cuantización extrema llevada a 1,75-2,125 bits por peso con pérdida mínima respecto al teacher (KL de 0,07180 frente a 0,07333 del rey anterior en la misma evaluación). Por otro, demuestra un ecosistema de inferencia específico: requiere el fork de llama.cpp de DendriteLabs en el commit `62c418c`, ya que llama.cpp estándar no ejecuta este layout.

Se distribuye únicamente en formato GGUF con dos variantes (PTQ1_0 a 1,75 bpw y PQ2_0 a 2,125 bpw), sin model card completa sobre datos de entrenamiento, idiomas o licencia. Su uso está orientado a despliegue en una sola GPU o en Apple Silicon con Metal, con velocidades de decodificación medidas de 137-145 tok/s en RTX PRO 6000 Blackwell y 44-56 tok/s en Mac Studio M3 Ultra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación de Hadamard (familia Ternary Bonsai 2); detalles completos no disponibles |
| Parámetros totales | 26.895.998.464 (26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 (1,75 bpw, 5,95 GB) y PQ2_0 (2,125 bpw, 7,21 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer de 26,9 B parámetros con pesos ternarios en la mayor parte de la matriz, según la familia Ternary Bonsai 2 de Prism ML. La model card menciona explícitamente una rotación de Hadamard y una actualización de estado de atención lineal, lo que sugiere un esquema híbrido con atención lineal en parte de las capas. No se detalla el número de capas, dimensión oculta, cabezas de atención ni composición del dataset de entrenamiento original.

El proceso de ajuste consiste en un finetune sobre el modelo base Ternary-Bonsai-2-27B-gguf: se conservan los códigos ternarios y se reajustan el resto de pesos (escalas y componentes no ternarios) para minimizar la divergencia KL respecto al teacher Qwen3.8-27B. La evaluación reportada mide KL por token de respuesta sobre las distribuciones next-token, ponderando dominios por su proporción en las muestras. No se especifica el volumen de datos de ajuste, el número de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de un solo turno, según el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento y respuesta a instrucciones heredados del teacher Qwen3.8-27B, aunque sin benchmarks publicados que lo cuantifiquen.
- Entrada de imágenes opcional mediante el proyector multimodal de Ternary Bonsai 2 (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o BF16), con calidad no verificada para estos pesos.
- Decodificación especulativa compatible con el drafter Ingot-27B-DFlash2, que acelera la generación aproximadamente 1,8x en greedy y 1,3-1,4x con sampling.
- Soporte de plantilla de chat vía `--jinja` en llama-server.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni multilingüismo explícito.

## Casos de uso

- Despliegue en una sola GPU de consumo o profesional: con 5,95-7,21 GB de pesos, el modelo cabe en GPUs de 8-12 GB de VRAM junto con la caché KV, lo que permite servir un modelo de 27 B en hardware modesto.
- Inferencia en Apple Silicon: en un Mac Studio M3 Ultra se miden 44-56 tok/s de decodificación, suficiente para asistentes interactivos locales sin conexión.
- Chat conversacional de bajo coste: la licencia y los idiomas no están documentados, pero el pipeline `conversational` y la plantilla Jinja permiten integrarlo en interfaces de chat tipo OpenAI-compatible.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar la degradación de un modelo de 27 B a 1,75-2,125 bpw frente a su teacher, con métrica KL documentada.
- Evaluación de pipelines de Bittensor/Ingot: el modelo es un artefacto real de una submission ganadora, útil para replicar el proceso de validación y comparar forks de llama.cpp.
- Aceleración con decodificación especulativa: combinado con Ingot-27B-DFlash2, permite reducir latencia en entornos interactivos con un coste adicional de unos 6 GB de VRAM.
- Prototipado multimodal: añadiendo el proyector mmproj de Bonsai 2 se puede experimentar con entrada de imágenes, aunque la calidad no está garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica de calidad reportada es la divergencia KL frente al teacher:

| Métrica | Valor |
|---|---|
| KL(teacher ‖ modelo) en la evaluación ganadora | 0,07180 |
| KL(teacher ‖ rey anterior) en la misma evaluación | 0,07333 |

Rendimiento medido en `llama-bench` (tg128, pp512, `-ngl 99 -fa 1`):

| GPU | Fichero | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090, dato no verificado por el autor.

## Requisitos de hardware

- VRAM estimada: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0) solo para pesos; añadir caché KV según contexto.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida), RTX 5090 (referencia de PrismML), cualquier GPU con 8-12 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB o más con la variante PTQ1_0; la PQ2_0 requiere algo más de margen.
- Apple Silicon: funciona en Mac Studio M3 Ultra con Metal; el fork de Dendrite mejora la decodificación un 20-27 % frente al fork stock.
- Opciones de despliegue: llama.cpp fork de DendriteLabs en el commit `62c418c` con `-ngl 99 -fa on --jinja`; llama.cpp estándar no ejecuta el modelo.
- Aceleración opcional: drafter Ingot-27B-DFlash2-Q8_0 con `--spec-type draft-dflash --spec-draft-n-max 5`, a cambio de unos 6 GB extra de VRAM.
- Throughput: 137-145 tok/s en RTX PRO 6000 Blackwell; 44-56 tok/s en Mac Studio M3 Ultra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XL-27B-Q2 | 26,9 B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | GGUF en HF |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B (aprox.) | no disponible | Ternaria | no disponible | GGUF en HF |
| dendriteholdings/Ingot-genesis-27B-Q2 | 27 B (aprox.) | no disponible | Ternaria Q2 | no disponible | GGUF en HF |
| Qwen3.8-27B (teacher) | 27 B (aprox.) | no disponible | BF16 y otras | no disponible | no disponible en la información |

No se dispone de datos de benchmarks comparables entre estos modelos más allá de la métrica KL reportada frente al teacher.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no documentados: no hay garantía de calidad multilingüe ni de cobertura fuera del inglés.
- Contexto no especificado: se desconoce la ventana máxima soportada, lo que impide planificar cargas de contexto largo.
- Riesgo de alucinación: al ser un modelo ajustado por KL sobre un teacher y cuantizado a 1,75 bpw, la fidelidad factual no está evaluada con benchmarks estándar.
- Dependencia de un fork no estándar: requiere llama.cpp de DendriteLabs en un commit concreto; llama.cpp upstream no lo ejecuta, lo que complica el mantenimiento y la portabilidad.
- Calidad multimodal no verificada: el proyector mmproj fue creado para genesis, no para estos pesos, y la evaluación de Ingot solo cubre texto.
- Sesgos: no documentados; al heredar del teacher Qwen3.8-27B, arrastra los sesgos de este sin que se hayan medido.
- Sin benchmarks convencionales: la única métrica publicada es KL frente al teacher, insuficiente para estimar rendimiento en tareas reales.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la ficha, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XL-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo genesis relacionado: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit de inferencia: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
