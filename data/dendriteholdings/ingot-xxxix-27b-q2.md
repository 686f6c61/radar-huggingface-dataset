# dendriteholdings/Ingot-XXXIX-27B-Q2

## Resumen

Ingot-XXXIX-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por dendriteholdings como espejo público del ganador de una ronda de la subnet Ingot en Bittensor. En esa subnet, los mineros parten de un modelo profesor fijo (Ternary Bonsai 2 27B de Prism ML) y compiten por producir la cuantización que más se acerque a él; el validador corona la copia con menor divergencia. Este modelo es, por tanto, un refinamiento del profesor: conserva los códigos ternarios de Bonsai 2 y el minero reajustó el resto de pesos para acercarse a Qwen3.8-27B.

El resultado es un modelo ternario extremadamente comprimido (1,75-2,125 bits por peso) que ocupa entre 5,95 GB y 7,21 GB en disco, lo que permite ejecutarlo en GPUs de consumo con un rendimiento de decodificación notable (hasta 145 tok/s en una RTX PRO 6000 Blackwell y 56,4 tok/s en un Mac Studio M3 Ultra con el fork de Dendrite). Su relevancia actual radica en que demuestra que la cuantización extrema por competición puede producir modelos utilizables en producción sin sacrificar demasiada fidelidad respecto al profesor.

La arquitectura subyacente es la de Ternary Bonsai 2 27B, un transformer con atención lineal y rotación de Hadamard en los pesos, que requiere un fork específico de llama.cpp (el de DendriteLabs) para ejecutarse. No es un modelo de propósito general entrenado desde cero, sino un artefacto de competición con licencia no especificada y sin benchmarks estándar publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y rotación de Hadamard (heredada de Ternary Bonsai 2 27B) |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria: PTQ1_0 (1,75 bpw) y PQ2_0 (2,125 bpw, mismos pesos ternarios en contenedor de 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Ternary Bonsai 2 27B de Prism ML: un transformer con atención lineal y una rotación de Hadamard aplicada a los pesos, que es la que permite la representación ternaria (códigos de -1, 0, +1 con escala fp16 por bloque de 128 pesos). El archivo `Ingot-XXXIX-27B-PTQ1_0.gguf` es un reempaquetado sin pérdida del archivo del minero al formato PTQ1_0 de Prism, de modo que cada peso decodifica al mismo valor; el archivo PQ2_0 contiene los mismos pesos ternarios en un contenedor de 2 bits que decodifica más rápido en GPU.

El entrenamiento no es un preentrenamiento convencional: el minero (hotkey `5GxJfajbRMd6vAWhSz3K4zhSSFffta6jGu5aS3TQQeYTF974`, uid 225) partió de los códigos ternarios de Bonsai 2 y reajustó el resto de pesos para minimizar la divergencia KL respecto a Qwen3.8-27B, que actúa como profesor de referencia en la evaluación de Ingot. No se dispone de información sobre el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el propio proceso de cuantización competitiva y el fork de llama.cpp de DendriteLabs, cuyo parche Metal fusiona la rotación de Hadamard y la actualización de estado de atención lineal para esta familia de modelos.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta multi-turno, heredado del profesor Bonsai 2.
- Soporte de tool calling y function calling a través de `llama-server --jinja` (plantilla de chat compatible con endpoints).
- Capacidades multimodales opcionales: se puede añadir la torre de visión de Ternary Bonsai 2 27B como proyector (`mmproj`) para entrada de imágenes, aunque el modelo fue entrenado para genesis y la calidad de imagen no está verificada.
- Decodificación especulativa mediante el drafter DFlash 2 (`dendriteholdings/Ingot-27B-DFlash2`), que acelera la generación entre 1,3x y 1,8x.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de audio ni modo "thinking" explícito.

## Casos de uso

- Chat conversacional de bajo coste en GPUs de consumo: con 5,95 GB en PTQ1_0 o 7,21 GB en PQ2_0, el modelo cabe en tarjetas de 8-12 GB y permite desplegar un asistente multi-turno sin infraestructura de datacenter.
- Inferencia en el borde o en portátiles: el formato GGUF y el fork de llama.cpp permiten ejecutarlo en Mac con Metal (56,4 tok/s en M3 Ultra con el parche de Dendrite), útil para prototipos locales y demos offline.
- Servicio de generación de texto a alta velocidad: los 137-145 tok/s de decodificación en una RTX PRO 6000 Blackwell lo hacen adecuado para aplicaciones interactivas donde la latencia percibida importa.
- Integración en pipelines con tool calling: mediante `llama-server --jinja` se puede exponer una API compatible con endpoints y conectar el modelo a funciones externas, útil para automatizaciones ligeras.
- Aceleración con decodificación especulativa: en escenarios de chat greedy de un solo flujo, el drafter DFlash 2 reduce el tiempo de respuesta aproximadamente 1,8x a cambio de unos 6 GB adicionales de VRAM.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar la fidelidad de modelos ternarios frente a su profesor (KL de 0,07193 frente a 0,07348 del rey anterior) y para evaluar el impacto de la cuantización en tareas conversacionales.
- Experimentación multimodal ligera: añadiendo el proyector `mmproj` de Bonsai 2 se puede probar entrada de imágenes, aunque sin garantías de calidad al no haber sido evaluado por Ingot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta la métrica de fidelidad de Ingot y mediciones de velocidad.

| Métrica | Este modelo | Rey anterior (misma eval) |
|---|---|---|
| KL(profesor ‖ modelo) en la eval ganadora | 0,07193 | 0,07348 |

| GPU / plataforma | Archivo | Decode tok/s | Prompt tok/s |
|---|---|---|---|
| RTX PRO 6000 Blackwell (96 GB) | PQ2_0 | 137 | 3.865 |
| RTX PRO 6000 Blackwell (96 GB) | PTQ1_0 | 145 | 3.865 |
| Mac Studio M3 Ultra, fork PrismML stock | PQ2_0 | 44,5 | 432 |
| Mac Studio M3 Ultra, fork PrismML stock | PTQ1_0 | 43,1 | 368 |
| Mac Studio M3 Ultra, fork Dendrite (parche Metal) | PQ2_0 | 56,4 | 432 |
| Mac Studio M3 Ultra, fork Dendrite (parche Metal) | PTQ1_0 | 52,8 | 368 |

PrismML reporta 142 tok/s para Bonsai 2 PQ2_0 en una RTX 5090; no se han medido otras tarjetas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB para los pesos (5,95 GB en PTQ1_0, 7,21 GB en PQ2_0) más overhead de contexto y caché KV; con el drafter DFlash 2 se añaden unos 6 GB adicionales.
- GPU recomendadas: RTX PRO 6000 Blackwell (medida), RTX 5090 (dato de PrismML para Bonsai 2), y en general cualquier GPU con 8-12 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con la cuantización PTQ1_0; en 12 GB o más con PQ2_0 y contexto amplio.
- Opciones de despliegue: llama.cpp mediante el fork de DendriteLabs (commit `62c418c`), con `llama-server` y `--jinja`. Stock llama.cpp no lo ejecuta. No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: 137-145 tok/s de decodificación en RTX PRO 6000 Blackwell; 44,5-56,4 tok/s en Mac Studio M3 Ultra según fork; con DFlash 2 se estima 1,8x en greedy y 1,3-1,4x con sampling.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXXIX-27B-Q2 | 26,9B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | GGUF, fork Dendrite |
| Ternary Bonsai 2 27B (profesor) | 27B | no disponible | Ternaria PTQ1_0/PQ2_0 | no disponible | GGUF, fork PrismML |
| Ingot-genesis-27B-Q2 | 27B | no disponible | Ternaria Q2 | no disponible | GGUF, fork Dendrite |
| Qwen3.8-27B (profesor de referencia) | 27B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables (MMLU, HumanEval) para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor antes de desplegarlo en producción.
- Idiomas no documentados: se desconoce la cobertura multilingüe real y el comportamiento fuera del inglés.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Requiere un fork específico de llama.cpp (DendriteLabs, commit `62c418c`); stock llama.cpp no lo ejecuta, lo que añade riesgo de mantenimiento y de compatibilidad futura.
- Es un artefacto de competición: no ha pasado por un proceso de alineación documentado (RLHF/DPO no confirmado) y puede presentar sesgos y alucinaciones propios del profesor Bonsai 2.
- La calidad multimodal es desconocida: el proyector `mmproj` se entrenó para genesis y no para estos pesos, y Ingot solo evalúa el modelo de texto.
- El rendimiento en GPUs distintas de las medidas (RTX PRO 6000 Blackwell, RTX 5090, M3 Ultra) no está verificado.
- El drafter DFlash 2 añade 6 GB de VRAM y solo acelera en escenarios de un solo flujo; en batch grande el beneficio puede diluirse.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXXIX-27B-Q2
- Modelo base (Ternary Bonsai 2 27B): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Proyector multimodal Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector multimodal BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo de referencia de layout (Ingot-genesis-27B-Q2): https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp
- Commit del fork usado en la evaluación: https://github.com/DendriteLabs/llama.cpp/commit/62c418ccd7aefee37997e94c2d9fac1eed7fc89b
