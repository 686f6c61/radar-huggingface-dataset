# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed2

## Resumen

Este repositorio contiene un adaptador LoRA denominado `smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed2`, publicado por el usuario jekunz en Hugging Face. Se trata de un ajuste fino del adaptador base `jekunz/smollm-135m-lora-fineweb-danish`, que a su vez parte de SmolLM2-135M-Instruct. El objetivo declarado es el aprendizaje del feroés mediante transferencia desde el danés, usando el subconjunto correspondiente de FineWeb-2. El autor lo describe como material para su propia investigación, sin evaluaciones amplias publicadas.

El modelo subyacente, SmolLM2-135M-Instruct, es un transformer decoder-only de 135 millones de parámetros desarrollado por Hugging Face. Este adaptador no modifica el tamaño del modelo base: solo añade matrices de bajo rango sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El resultado es un artefacto de aproximadamente 0,2 GB en formato safetensors compatible con PEFT, pensado para generación de texto conversacional en feroés.

La relevancia de esta ficha es acotada: se trata de un experimento de transferencia lingüística entre dos lenguas germánicas nórdicas, con un seed concreto (2 de 3), sobre un modelo muy pequeño. Resulta útil como referencia para quienes investigan adaptación de lenguas de bajos recursos con LoRA, pero no como modelo listo para producción. No hay métricas publicadas ni descargas registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptadores LoRA |
| Parametros totales | 135 millones (modelo base); el adaptador LoRA tiene un tamaño de repo de 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento (según model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | feroés (fo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. El ajuste se realiza con LoRA de rango 256 y alpha 512, con módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El entrenamiento es secuencial: primero una época sobre el subconjunto danés de FineWeb-2 (heredado del adaptador base) y después cinco épocas sobre el subconjunto feroés. Se usa tasa de aprendizaje 8e-4 con scheduler coseno, warmup ratio 0,05, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo 256) y longitud máxima de contexto de 2048 tokens. Todo el entrenamiento se ejecutó en una única GPU A100 de 40 GB.

El seed empleado es el 2, uno de los tres seeds de esta configuración. No se documentan en la información disponible detalles sobre el volumen de tokens de FineWeb-2 consumido, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El interés técnico reside en la estrategia de transferencia: partir de un adaptador ya ajustado en danés y continuar el ajuste en feroés, dos lenguas con proximidad genealógica, para aprovechar el conocimiento lingüístico previo.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la pipeline `text-generation` y del ajuste sobre SmolLM2-135M-Instruct.
- Ajuste específico sobre el subconjunto feroés de FineWeb-2, orientado a modelar texto de ese idioma.
- Transferencia desde danés: el adaptador base ya contiene conocimiento del danés, lo que puede facilitar el modelado del feroés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al feroés según la etiqueta de idioma; el modelo base original es multilingüe, pero este adaptador no declara otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Razonamiento avanzado, código o matemáticas: no documentados para este adaptador; el tamaño de 135M limita estas capacidades en el modelo base.

## Casos de uso

- Investigación en adaptación de lenguas de bajos recursos: el adaptador sirve como punto de partida reproducible (seed 2 de 3) para estudiar transferencia danés-feroés con LoRA sobre modelos pequeños.
- Generación de texto en feroés para experimentos controlados: útil para comparar variantes de seed y configuraciones de LoRA en tareas de modelado de lenguaje.
- Prototipado de asistentes conversacionales en feroés: con 2048 tokens de contexto, puede gestionar diálogos cortos en entornos de prueba, no en producción.
- Análisis de la influencia del danés en el feroés: permite estudiar sesgos de transferencia lingüística comparando salidas con el adaptador base danés.
- Generación de datos sintéticos en feroés para aumento de corpus: puede emplearse para producir texto de relleno que luego se filtre y valide manualmente.
- Evaluación de técnicas PEFT: sirve como caso de estudio de LoRA de rango 256 sobre proyecciones MLP y de atención en un modelo de 135M.
- Docencia y experimentación académica: su tamaño reducido (0,2 GB de adaptador) permite reproducir el ajuste en una sola A100 o en GPUs de menor capacidad con cuantización del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,2 GB; el modelo base SmolLM2-135M-Instruct en fp16 requiere aproximadamente 0,3 GB, y en cuantización de 4 bits alrededor de 0,1 GB. La VRAM total depende del framework y del contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para el modelo base; el entrenamiento documentado usó una A100 de 40 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida, siempre que se cargue el base en cuantización adecuada.
- Opciones de despliegue: PEFT con transformers para cargar el adaptador; llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF; vLLM y TGI son viables con el modelo fusionado, aunque su soporte de adaptadores LoRA dinámicos requiere configuración adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo base, se espera una latencia baja en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed2 | 135M (base) + LoRA | 2048 | fo | apache-2.0 | Hugging Face, 0 descargas |
| jekunz/smollm-135m-lora-fineweb-danish (base del adaptador) | 135M (base) + LoRA | no disponible | da | apache-2.0 | Hugging Face |
| SmolLM2-135M-Instruct (modelo base original) | 135M | no disponible en la información | multilingüe | apache-2.0 | Hugging Face |
| Otros adaptadores LoRA de SmolLM2 para lenguas de bajos recursos | 135M (base) + LoRA | variable | variable | variable | Hugging Face |

La comparación se limita a los artefactos de la misma familia. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No hay evaluaciones publicadas: el autor declara que el modelo no ha sido evaluado ampliamente, por lo que se desconoce su calidad real en feroés.
- Riesgo de alucinación: al ser un modelo de 135M ajustado sobre texto web, la generación puede producir contenido incoherente o inventado, especialmente fuera del dominio de FineWeb-2.
- Sesgos: los datos de FineWeb-2 pueden contener sesgos de género, culturales y geográficos; no se documenta ningún proceso de mitigación.
- Limitación de contexto: 2048 tokens en entrenamiento, insuficiente para documentos largos o conversaciones extensas.
- Limitación de idioma: aunque la etiqueta declara solo feroés, el modelo base es multilingüe y el adaptador puede filtrar texto en danés u otros idiomas; no hay garantía de calidad fuera del feroés.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base SmolLM2-135M-Instruct también es apache-2.0; conviene verificar la licencia de FineWeb-2 para el uso de los datos subyacentes.
- Caveat para producción: es un experimento de investigación con 0 descargas y sin métricas; no se recomienda su despliegue en producción sin una evaluación previa exhaustiva.
- Reproducibilidad: es uno de tres seeds; los resultados pueden variar entre seeds y no se documenta la varianza.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-danish-seed2
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-danish
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Librería PEFT: https://huggingface.co/docs/peft
