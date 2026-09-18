# pipenetwork/Ternary-Bonsai-2-27B-MLX-4bit

## Resumen

Ternary-Bonsai-2-27B-MLX-4bit es una conversión a MLX del modelo Ternary-Bonsai-2-27B de prism-ml, que a su vez es una versión ternarizada de un Qwen3.8-27B con arquitectura híbrida `qwen3_5` de 64 capas (Gated-DeltaNet combinado con atención completa cada cuatro capas) y torre de visión oficial. El modelo es multimodal (image-text-to-text) y conversacional, con 27.356.728.560 parámetros totales y pesos en safetensors para Apple Silicon.

La aportación concreta de este repositorio, publicado por pipenetwork, es que la rotación de Hadamard por bloques que prism-ml aplica a los pesos ternarios se ha "desplegado" de vuelta a la base de pesos estándar. Esto permite cargar el modelo en mlx-vlm sin modificar (versión 0.7 o superior), sin runtime propio ni kernels parcheados, a cambio de una cuantización afín de 4 bits con grupo de 64 que cuesta un +2,1 % de perplejidad respecto a bf16.

Es relevante ahora porque cubre el caso complementario al empaquetado 2-bit de 8,6 GB de prism-ml: este último es la frontera de eficiencia, pero exige su runtime específico, mientras que esta build de 16,1 GB es la más pequeña que funciona con herramientas estándar y sirve además para fine-tuning y conversión posterior. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida `qwen3_5` de 64 capas: Gated-DeltaNet más atención completa cada 4 capas; incluye torre de visión oficial |
| Parámetros totales | 27.356.728.560 (≈27,36 B) |
| Parámetros activos | No aplica: no es un modelo MoE, es denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit affine con grupo de 64 (este repositorio). La familia incluye además bf16, 8-bit, 6-bit y un empaquetado 2-bit ternario sin pérdida de 8,6 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (se incluye el NOTICE.txt del modelo base) |
| Formato de pesos | safetensors (librería `mlx`); el modelo base está en GGUF |
| Modalidad | Image-text-to-text (visión-lenguaje) y conversacional |
| Librería y runtime | `mlx` / `mlx-vlm` ≥ 0.7 sobre Apple Silicon |
| Tamaño del repositorio | 16,1 GB |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido de 64 capas de tipo `qwen3_5`, en el que las capas de Gated-DeltaNet (mecanismo de estado recurrente con coste lineal en la longitud de secuencia) se alternan con capas de atención completa cada cuatro capas. El modelo conserva la torre de visión oficial del modelo original, lo que habilita la entrada conjunta de imagen y texto. Los pesos de partida son los de un Qwen3.8-27B ternarizado por prism-ml.

El trabajo técnico de esta conversión es una operación de "desplegado" (unfold) de la rotación de Hadamard por bloques: prism-ml almacena los pesos ternarios ya rotados y transforma las activaciones para compensar en su runtime. Aquí la rotación se deshace de forma exacta sobre los pesos, de manera que el modelo vuelve a la base estándar y resulta cargable por mlx-vlm. El autor indica que `refold(unfold(W))` es bit a bit idéntico en fp32 y que el contrato de plegado se verificó contra el runtime de prism-ml en lugar de asumirse (aplicar el vector de signos en el orden incorrecto desplaza los logits en 7,4, y la prueba lo detecta). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multiturno con pesos en formato estándar.
- Comprensión de imágenes (image-text-to-text): la visión está verificada de extremo a extremo según el autor.
- Uso como base para fine-tuning y para conversión a otros formatos, al no requerir runtime propio.
- Ejecución en Apple Silicon mediante mlx-vlm estándar, sin kernels personalizados.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Capacidades especiales (modo thinking, audio): no documentadas en la información disponible.

## Casos de uso

- Asistente multimodal local en portátil Apple Silicon: al pesar 16,1 GB y cargar en mlx-vlm sin parches, permite mantener un asistente de imagen y texto totalmente offline en máquinas con memoria unificada suficiente, sin depender de APIs externas.
- Fine-tuning sobre pesos en base estándar: este repositorio existe precisamente porque los pesos no están rotados, de modo que un pipeline de ajuste supervisado o LoRA puede operar sobre ellos sin tener que replicar las transformaciones del runtime de prism-ml.
- Conversión a otros formatos y cuantizaciones: al estar en base estándar, sirve como punto de partida para generar GGUF u otros empaquetados con herramientas convencionales, en lugar de partir del pack ternario rotado.
- Extracción de información de documentos escaneados: la torre de visión permite procesar facturas, formularios o capturas y devolver texto estructurado, con el modelo ejecutándose en local para datos sensibles que no pueden salir de la organización.
- Generación de texto alternativo y descripciones de imágenes por lotes: catalogación de bibliotecas de imágenes o auditar accesibilidad de un sitio, aprovechando que el modelo acepta pares imagen-texto.
- Análisis de diagramas y capturas técnicas: revisión de diagramas de arquitectura, gráficas de monitorización o salidas de consola en formato imagen dentro de un flujo de documentación interna.
- Evaluación comparativa de cuantizaciones en hardware de consumo: este build forma parte de una familia (bf16, 8-bit, 6-bit, 4-bit) con perplejidad medida sobre ventanas idénticas, lo que lo hace útil como referencia para estudiar el compromiso entre tamaño y calidad en Apple Silicon.
- Prototipado de producto con restricción de memoria: para equipos que necesitan el modelo multimodal más pequeño posible que aún cargue con herramientas estándar, sin adoptar el runtime propietario del pack de 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la información disponible. Los únicos datos cuantitativos son de perplejidad sobre wikitext-2 (296.815 tokens, ventanas idénticas, medidas con mlx-vlm estándar) y de fidelidad frente al pack de 2 bits de prism-ml.

Perplejidad en wikitext-2 (test):

| Build | Tamaño | Perplejidad |
|---|---:|---:|
| prism 2-bit, con su runtime | 8,6 GB | 8,9607 |
| bf16 (el no cuantizado de este conjunto) | 54,7 GB | 8,9679 |
| 8-bit | 29,5 GB | 8,9636 |
| 6-bit | 22,8 GB | 8,9548 |
| 4-bit (este repositorio) | 16,1 GB | 9,1497 |

Fidelidad frente al pack de 2 bits de prism-ml bajo su runtime, con los mismos prompts y 81 posiciones:

| Métrica | Valor |
|---|---|
| Máxima diferencia absoluta de logits | 0,22 sobre una escala de ±20 |
| Similitud coseno | 0,99999 |
| Coincidencia de argmax | 96,7–100 % (las discrepancias son empates; en fp16, el dtype de activación de prism-ml, la coincidencia es del 100 %) |
| Ratio de perplejidad emparejado | 0,9992 [0,9990; 0,9994] sobre 145 ventanas compartidas de wikitext-2 |

Según el autor, 8-bit y 6-bit son estadísticamente indistinguibles de bf16, mientras que el 4-bit es el único build con una pérdida medible, del +2,1 %.

## Requisitos de hardware

- Memoria: los pesos de este build ocupan 16,1 GB, de modo que se necesita memoria unificada de al menos 24 GB para dejar margen a activaciones y caché KV; 32 GB o más es el rango cómodo. El pack de 2 bits de prism-ml (8,6 GB) es la opción si se dispone de 16 GB.
- GPU compatible: MLX está pensado para Apple Silicon, por lo que el objetivo son chips de la familia M1, M2, M3 y M4 (Pro, Max o Ultra). No hay soporte CUDA documentado para esta build.
- Viabilidad en hardware de consumo: sí, en Macs con memoria unificada de 24 GB o superior. No cabe en configuraciones de 8 o 16 GB si se usa esta build de 4 bits.
- Opciones de despliegue: `mlx-vlm` en versión 0.7 o superior, cargando el repositorio directamente con `load()`. El modelo base en GGUF abre la puerta a otros runtimes, pero la información disponible no documenta su compatibilidad con llama.cpp ni con vLLM o TGI, y el pack ternario de prism-ml requiere su runtime propio.
- Latencia y throughput: no disponible. Tampoco se puede estimar el consumo de caché KV porque la longitud de contexto no está documentada.

## Comparativa con modelos similares

No se dispone de datos de modelos externos de la misma categoría (visión-lenguaje de ~27 B ejecutables en local) en la información proporcionada, por lo que la comparación se limita a los builds de la misma familia.

| Build | Tamaño | Perplejidad (wikitext-2) | Runtime necesario | Licencia |
|---|---:|---:|---|---|
| prism 2-bit (prism-ml) | 8,6 GB | 8,9607 | Runtime propio de prism-ml (pesos rotados con Hadamard) | Apache-2.0 |
| 4-bit (este repositorio) | 16,1 GB | 9,1497 | mlx-vlm estándar ≥ 0.7 | Apache-2.0 |
| 6-bit (pipenetwork) | 22,8 GB | 8,9548 | mlx-vlm estándar | Apache-2.0 |
| 8-bit (pipenetwork) | 29,5 GB | 8,9636 | mlx-vlm estándar | Apache-2.0 |
| bf16 (pipenetwork) | 54,7 GB | 8,9679 | mlx-vlm estándar | Apache-2.0 |

Comparativa con alternativas de otros fabricantes: no disponible.

## Limitaciones y advertencias

- La cuantización de 4 bits introduce una pérdida medible: +2,1 % de perplejidad frente a bf16. Es el único build de la familia con degradación estadísticamente apreciable.
- El modelo parte ya de una versión ternarizada del Qwen3.8-27B original, de modo que acumula la pérdida de esa ternarización más la de la cuantización afín de 4 bits. No se proporciona la magnitud de la primera.
- Requiere `mlx-vlm` ≥ 0.7: versiones anteriores aplican un doble desplazamiento a las normalizaciones de `qwen3_5` y producen resultados incorrectos.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con prompts largos o estimar el consumo de caché KV.
- El soporte de idiomas no está disponible; no hay garantía documentada de calidad en castellano ni en ningún otro idioma concreto.
- No hay resultados de benchmarks de razonamiento, código o matemáticas, así que la evaluación comparativa con otros modelos no es posible con los datos aportados.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se documentan medidas de mitigación específicas.
- Sesgos: no documentados en la información disponible.
- Uso comercial: permitido por la licencia Apache-2.0, que se hereda del modelo base e incluye su NOTICE.txt. Conviene verificar las condiciones del modelo original de prism-ml si se redistribuye.
- Adopción prácticamente nula por el momento: el repositorio registra 0 descargas y 0 "likes", por lo que no existe validación independiente de su comportamiento en producción.
- La build está atada al ecosistema Apple Silicon; no hay ruta documentada a GPUs NVIDIA o AMD para estos pesos concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-4bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Pack 2-bit de prism-ml con su runtime: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Build bf16 del mismo conjunto: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-bf16
- Build de 8 bits: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-8bit
- Build de 6 bits: https://huggingface.co/pipenetwork/Ternary-Bonsai-2-27B-MLX-6bit
- Código de conversión: https://github.com/PipeNetwork/bonsai2-mlx
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo.
