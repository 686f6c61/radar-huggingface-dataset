# Lucasgitguy-co/minicpm-mermaid-heretic-trial65

## Resumen

MiniCPM-V 4.7 1B Mermaid Heretic — Trial 65 BF16 es un modelo vision-language de tipo image-text-to-text publicado por el usuario Lucasgitguy-co en Hugging Face. Se trata de un ajuste fino experimental sobre la arquitectura MiniCPM-V 4.7, empaquetado en formato Safetensors con pesos en BF16 y una clase de configuración propia (`MiniCPMV4_7ForConditionalGeneration`). El modelo declara 1.554.476.272 parámetros totales (aproximadamente 1,55 mil millones) y un repositorio de 3,1 GB.

El nombre del checkpoint sugiere un entrenamiento orientado a la generación de diagramas en Mermaid a partir de imágenes, y la model card incluye como ejemplo de prompt "Convert this diagram into Mermaid code". El término "heretic" hace referencia a la herramienta Heretic, cuyo uso se documenta como separado de la licencia de los artefactos del modelo. La model card no documenta el procedimiento de entrenamiento, la composición del dataset ni resultados de benchmarks.

Se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés. Es relevante ahora como experimento reproducible de un VLM pequeño especializado en conversión diagrama-a-código, aunque su madurez y validación son limitadas: 29 descargas, 0 likes y ausencia de métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM-V 4.7 (vision-language, clase `MiniCPMV4_7ForConditionalGeneration`) |
| Parametros totales | 1.554.476.272 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repositorio principal; variante GGUF publicada en repositorio separado (tipos concretos no disponibles) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio alternativo |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniCPM-V 4.7, un transformer multimodal para entrada image-text-to-text. La configuración declara explícitamente la clase `MiniCPMV4_7ForConditionalGeneration` y requiere una versión de Transformers que incluya dicha arquitectura (la model card menciona Transformers 5.18.0). El repositorio incluye pesos, tokenizer, chat template y configuración del processor.

No se documenta en los artefactos inspeccionados el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card indica que los detalles de entrenamiento no están documentados, y que los datos de proyectos relacionados (los datasets `mermaid-diagram-text-images` y `mermaid-text-en-nl`) no establecen el split exacto de cada checkpoint. El sufijo "Heretic" apunta al uso de la herramienta Heretic en el proceso de ajuste, pero la model card solo aclara que su licencia es independiente de la del modelo. No se declaran innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Conversión de diagramas a código Mermaid, según el ejemplo de prompt incluido en la model card.
- Conversación multi-turno mediante chat template incluido en el repositorio.
- Procesamiento de imágenes a través del processor declarado.
- Soporte declarado únicamente para inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Conversión de diagramas a Mermaid en documentación técnica: se enviaría una captura o imagen de un diagrama y el modelo devolvería código Mermaid que el equipo revisaría antes de incorporarlo a un repositorio de documentación. La model card recomienda validar el Mermaid generado antes de usarlo.
- Prototipado de pipelines de extracción diagrama-código: el checkpoint puede servir como base experimental para comparar enfoques de conversión imagen-a-DSL en un entorno de investigación, dado su tamaño reducido y su formato BF16.
- Generación asistida de diagramas en herramientas internas: integrado detrás de una API de transformers, podría ofrecer un borrador de Mermaid a partir de bocetos de pizarra, con revisión humana obligatoria.
- Evaluación de ajustes finos experimentales: al ser un "trial" con licencia Apache 2.0, es adecuado para reproducir experimentos de ajuste sobre MiniCPM-V y medir su efecto en tareas de conversión de diagramas.
- Despliegue en entornos con recursos limitados: con ~1,55 mil millones de parámetros y pesos BF16 de 3,1 GB, puede ejecutarse en GPUs de gama media para pruebas de concepto, y la variante GGUF permite probar en CPU.
- Docencia y demostraciones de VLMs pequeños: útil para ilustrar el flujo completo de un modelo image-text-to-text (processor, chat template, generación) en cursos o talleres, dado su tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y del processor de visión; en la práctica, se recomienda al menos 6-8 GB de VRAM para una ejecución cómoda (estimación, no dato del autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores), aunque no se confirma compatibilidad.
- Cabe en GPU consumer: probablemente sí, en función de la VRAM disponible; no confirmado por el autor.
- Opciones de despliegue: transformers (versión que incluya `MiniCPMV4_7ForConditionalGeneration`, la model card menciona 5.18.0); variante GGUF para llama.cpp u otros runners compatibles con GGUF (no se detalla el runner).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid Heretic (este) | 1,55 B | no disponible | Apache 2.0 | Ajuste experimental para Mermaid; sin benchmarks publicados |
| MiniCPM-V base (familia) | no disponible | no disponible | no disponible | Modelo upstream de referencia; datos no verificados en esta ficha |
| Alternativas VLM pequeñas (p. ej. Qwen2-VL 2B, SmolVLM) | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación de calidad publicados; la model card advierte que los ejemplos de carga son orientativos y no una afirmación de calidad medida.
- Riesgo de alucinación en la generación de código Mermaid: la propia model card recomienda validar el Mermaid generado antes de usarlo.
- Soporte declarado únicamente en inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia para documentos o conversaciones largas.
- Es un checkpoint experimental ("trial65") con 29 descargas y 0 likes: madurez y mantenimiento inciertos.
- La licencia Apache 2.0 cubre los artefactos del modelo, pero la model card indica que la licencia de la herramienta Heretic es separada; deben conservarse los avisos de atribución upstream y de terceros al redistribuir.
- No se documenta el dataset exacto de entrenamiento, lo que dificulta evaluar sesgos y procedencia de los datos.
- Requiere una versión de Transformers que incluya la arquitectura `MiniCPMV4_7ForConditionalGeneration`; versiones anteriores pueden no cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-trial65
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-trial65-gguf
- Dataset relacionado (diagramas texto-imagen): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset relacionado (texto inglés/neerlandés): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
- Documentación de estructura de archivos (referenciada en la model card): docs/FILE_STRUCTURE.md
- Documentación de procedencia y reproducibilidad (referenciada en la model card): docs/PROVENANCE.md
- Historial de versiones (referenciado en la model card): CHANGELOG.md
