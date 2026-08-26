# chibifire/anny-camera-lora

## Resumen

anny-camera-lora es un adaptador de bajo rango (LoRA) desarrollado por chibifire para el modelo de generación de imágenes OmniGen2. Su propósito es añadir control de cámara, específicamente el ángulo de azimuth, a las imágenes generadas por el modelo base. El adaptador se entrenó sobre el dataset propio `chibifire/anny-render-corpus`, compuesto por 95 imágenes de un único cuerpo, y se distribuye bajo licencia Apache-2.0.

El autor es transparente sobre las limitaciones del adaptador: está claramente subentrenado. Las mediciones muestran que solo mejora la precisión del azimuth en las direcciones cardinales (0°, 90° y parcialmente 180°), mientras que en ángulos intermedios (45°, 135°) no detecta persona alguna y en 225°, 270° y 315° sigue fallando. La pendiente de recuperación frente a lo solicitado es de 0.04 a 0.10, lo que indica una correlación muy baja. No obstante, el adaptador sirve como prueba de concepto para el control geométrico mediante LoRA y como base para futuros entrenamientos con más datos.

El adaptador pesa 19.52 MiB (304 tensores) y debe cargarse sobre una revisión específica de OmniGen2 (`df5dca8a981d74e6c3af214c145f5c735fe72367`), que también está espejada en un repositorio alternativo para garantizar su disponibilidad. Su utilidad práctica actual es limitada, pero documenta una metodología de evaluación basada en el ajuste del cuerpo ANNY a keypoints detectados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre OmniGen2, modelo de difusion |
| Parametros totales | Adaptador: 304 tensores, 19.52 MiB; modelo base OmniGen2: no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (generacion de imagenes) |
| Tipos de cuantizacion | bf16 (entrenamiento); no se indican cuantizaciones para inferencia |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors); checkpoint FSDP de 14.8 GiB (no recomendado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 8, aplicado únicamente a las capas de atención del modelo base (`to_k`, `to_q`, `to_v`, `to_out.0`). Se entrenó durante 200 pasos en una RTX 3090, con un tiempo total de 22 minutos. La configuración incluye batch de 1 con 8 pasos de acumulación, resolución de 256x256 píxeles, bf16, gradient checkpointing y optimizador AdamW de 8 bits. La pérdida descendió de 0.196 a 0.111.

El dataset de entrenamiento, `chibifire/anny-render-corpus`, contiene 95 imágenes de un único cuerpo, lo que explica el sobreajuste observado en las direcciones cardinales. No se proporcionan detalles adicionales sobre la composición del dataset ni sobre técnicas de alineación como RLHF o DPO. La innovación principal no está en la arquitectura, sino en la metodología de evaluación: el azimuth se mide ajustando el cuerpo ANNY a los keypoints detectados en la imagen generada, lo que permite cuantificar el error de orientación de forma objetiva.

## Capacidades

- Control de azimuth de cámara en generación de imágenes con OmniGen2, limitado a las direcciones cardinales 0°, 90° y parcialmente 180°.
- Mejora la precisión en 0° (error de 10.4° a 6.2°) y en 90° (de 97.6° a 13.3°), según las mediciones del autor.
- En 180° el error aumenta ligeramente (de 11.9° a 18.6°), lo que indica un comportamiento inconsistente.
- No detecta personas en ángulos de 45° y 135°.
- No ofrece control general de cámara; los ángulos 225°, 270° y 315° siguen fallando.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es un adaptador específico para generación de imágenes.

## Casos de uso

- Generación de imágenes con orientación fija en direcciones cardinales: el adaptador puede utilizarse para producir imágenes de un sujeto con la cámara orientada a 0°, 90° o 180° con mayor precisión que el modelo base, útil en entornos controlados donde solo se necesitan esos ángulos.
- Prototipado de control geométrico en modelos de difusión: sirve como ejemplo de cómo un LoRA puede modificar propiedades espaciales de la generación, y como punto de partida para investigar métodos más robustos.
- Evaluación de métricas de orientación: la metodología de ajuste del cuerpo ANNY a keypoints puede reutilizarse para medir el error de azimuth en otros adaptadores o modelos.
- Base para entrenamientos futuros: el adaptador y su dataset pueden servir como semilla para entrenar un LoRA más completo con más datos y más ángulos.
- Integración en pipelines de generación de contenido donde se requiera una orientación fija y conocida, como avatares o vistas de producto, siempre que se acepten las limitaciones actuales.
- Investigación sobre adaptación de bajo rango: el repositorio documenta el proceso de entrenamiento y las limitaciones, lo que lo convierte en un caso de estudio para quienes trabajan en fine-tuning eficiente de modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. El autor proporciona una medición propia del error de azimuth, que se reproduce a continuación:

| Azimuth solicitado | Error del modelo base | Error con el adaptador |
| ---: | ---: | ---: |
| 0 | 10.4° | 6.2° |
| 90 | 97.6° | 13.3° |
| 180 | 11.9° | 18.6° |
| 45, 135 | incorrecto | no se detecta persona |
| 225, 270, 315 | incorrecto | sigue incorrecto |

La pendiente de recuperación frente a lo solicitado es de 0.04 a 0.10, lo que indica una correlación muy baja entre el ángulo pedido y el obtenido. Estos datos provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- Entrenamiento: se realizó en una RTX 3090 (24 GB VRAM) en 22 minutos para 200 pasos, con resolución 256x256. No se requieren GPUs de gama alta para el entrenamiento de este adaptador.
- Inferencia: el adaptador en sí es muy ligero (19.52 MiB), pero requiere cargar el modelo base OmniGen2, cuyo tamaño no se especifica. Se estima que OmniGen2 necesita al menos 8-16 GB de VRAM para inferencia, aunque este dato no está confirmado.
- El adaptador se puede cargar con la librería PEFT de HuggingFace sobre el modelo base. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de texto.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de control de cámara para OmniGen2 ni para modelos de difusión comparables. La única comparación posible es contra el modelo base sin el adaptador, que es la que se muestra en la tabla de benchmarks. Por tanto, la comparativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- El adaptador está subentrenado: solo ha aprendido las direcciones cardinales 0°, 90° y parcialmente 180°, con sobreajuste en el resto de ángulos.
- No ofrece control general de cámara; en ángulos intermedios (45°, 135°) no se detecta persona, y en 225°, 270° y 315° el error persiste.
- La pendiente de recuperación (0.04-0.10) indica que la relación entre el ángulo solicitado y el obtenido es muy débil, por lo que no es fiable para uso en producción.
- Depende de una revisión específica del modelo base OmniGen2 (`df5dca8a981d74e6c3af214c145f5c735fe72367`); si esa revisión desaparece, el adaptador no funcionará. Existe un espejo en `chibifire/omnigen2-base-df5dca8a` como respaldo.
- El adaptador es inútil sin el modelo base; ambos deben cargarse juntos.
- No se han documentado sesgos específicos, pero el entrenamiento con un único cuerpo y 95 imágenes limita la generalización a otras anatomías o estilos.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte explícitamente de que el adaptador no está listo para producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/chibifire/anny-camera-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/chibifire/anny-render-corpus
- Código fuente: https://github.com/weftspun/anny-render-corpus
- Modelo base OmniGen2: https://huggingface.co/OmniGen2/OmniGen2
- Espejo del modelo base (revisión fijada): https://huggingface.co/chibifire/omnigen2-base-df5dca8a
