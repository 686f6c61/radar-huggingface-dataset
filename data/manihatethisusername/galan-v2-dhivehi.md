# Manihatethisusername/Galan-v2-Dhivehi

## Resumen

Galan-v2-Dhivehi es un ajuste fino (fine-tuning) del modelo Qwen3-4B, desarrollado por el usuario Manihatethisusername y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen3-4B-unsloth-bnb-4bit`), que a su vez deriva del Qwen3-4B de Alibaba. El nombre sugiere una especialización en dhivehi, el idioma oficial de Maldivas, aunque la model card no documenta explícitamente el corpus de entrenamiento ni el proceso de ajuste más allá de indicar que se usó Unsloth.

El modelo se distribuye en formato safetensors con la librería transformers y es compatible con text-generation-inference y endpoints. El repositorio ocupa 0,1 GB, lo que es coherente con un ajuste de pesos en cuantización de 4 bits sobre una base de 4B parámetros. Se trata de un modelo de nicho, sin descargas ni interacciones registradas en el momento de la consulta, por lo que la información disponible es muy limitada y proviene casi exclusivamente de los metadatos del repositorio.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo típico de fine-tuning comunitario rápido con Unsloth sobre Qwen3; por otro, advierte de las limitaciones de trazabilidad cuando la model card no aporta detalles sobre datos, evaluación o hiperparámetros. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B) |
| Parametros totales | 4B (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen3-4B soporta hasta 32 768 tokens nativos, ampliable, segun la documentacion de Qwen3) |
| Tipos de cuantizacion | Base en 4 bits (bnb-4bit) via Unsloth; el repo publica safetensors |
| Idiomas soportados | en (segun metadatos); el nombre sugiere dhivehi, no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B, un transformer decoder-only denso con atención por grupos (GQA) y mecanismos de razonamiento híbrido (modo thinking y non-thinking) introducidos en la familia Qwen3. El ajuste fino se realizó sobre la variante cuantizada en 4 bits de Unsloth, lo que implica que el entrenamiento partió de pesos ya comprimidos con bitsandbytes y se optimizó con las técnicas de ahorro de memoria de Unsloth (kernel fusionado, gradient checkpointing optimizado). La model card indica que el entrenamiento fue "2x faster" con Unsloth, pero no especifica el número de tokens, la composición del dataset, ni si se aplicaron RLHF, DPO o SFT supervisado.

No se documentan innovaciones técnicas propias más allá del uso de Unsloth. No hay información sobre el corpus en dhivehi, el tokenizador adaptado, la longitud de secuencia de entrenamiento ni los hiperparámetros. Esta ausencia de detalle impide reproducir el ajuste o auditar su calidad.

## Capacidades

- Generación de texto en inglés (idioma declarado en los metadatos).
- Razonamiento y matemáticas heredados del base Qwen3-4B, sujetos a degradación por el ajuste fino y la cuantización.
- Generación de código, presumiblemente conservada del base, sin evaluación publicada.
- Soporte de tool calling y function calling heredado de Qwen3 (no verificado tras el fine-tuning).
- Capacidades de agente y razonamiento multi-paso, presumiblemente heredadas, no evaluadas.
- Posible especialización en dhivehi por el nombre del modelo, no confirmada ni documentada.
- Modo thinking/non-thinking de Qwen3, presumiblemente conservado, no verificado.

## Casos de uso

- Experimentación con fine-tuning comunitario: sirve como ejemplo de pipeline Unsloth sobre Qwen3-4B para desarrolladores que quieran replicar el flujo con sus propios datos.
- Investigación lingüística sobre dhivehi: si el ajuste realmente cubre ese idioma, podría usarse para generar texto o prototipos de traducción, siempre con evaluación humana previa.
- Prototipado de asistentes conversacionales en inglés: el modelo puede desplegarse en entornos de prueba con TGI o transformers para validar ideas antes de invertir en un modelo mayor.
- Generación de código en entornos de desarrollo: si conserva las capacidades del base, podría integrarse en asistentes de IDE para autocompletado, con revisión obligatoria por la falta de benchmarks.
- Educación e investigación académica: útil como caso de estudio de fine-tuning rápido con cuantización 4-bit y sus efectos en la calidad.
- Pruebas de despliegue en hardware consumer: al ser un 4B en safetensors, permite experimentar con inferencia local en GPUs de gama media para evaluar latencia y calidad.
- Base para nuevos ajustes: puede servir como punto de partida para fine-tunings posteriores en otros idiomas o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en cuantización 4-bit (GGUF Q4), 8-9 GB en FP16 para los 4B parámetros, más overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para FP16 con contexto largo; A100 o H100 para despliegue a escala con TGI.
- Cabe en GPU consumer: sí, en GPUs con 8 GB o más en cuantización 4-bit; en FP16 requiere al menos 10-12 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama si se convierte a GGUF, y endpoints compatibles.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Galan-v2-Dhivehi | 4B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning comunitario sin benchmarks |
| Qwen3-4B (base) | 4B | 32 768 tokens (nativo) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con benchmarks publicados |
| Qwen2.5-3B | 3B | 32 768 tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar con evaluación publicada |
| Llama 3.2 3B | 3B | 128 000 tokens | Llama 3.2 Community License | Hugging Face | Requiere aceptar licencia; buen soporte multilingue |

La comparativa se basa en datos públicos de los modelos base; no hay información que permita comparar el rendimiento del fine-tuning de Galan-v2-Dhivehi con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore o mantenga las capacidades del base Qwen3-4B.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar sesgos o calidad.
- Riesgo de alucinación: heredado del base y potencialmente agravado por el ajuste fino sin evaluación.
- Idioma declarado solo en inglés: si el objetivo era dhivehi, no hay confirmación ni métricas; el uso en ese idioma es especulativo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- Cuantización 4-bit de partida: puede degradar la calidad respecto al base en FP16, especialmente en razonamiento y matemáticas.
- Sin descargas ni validación comunitaria: no hay señales de uso real que permitan confiar en su estabilidad.
- Contexto no especificado: no se confirma que se conserve la ventana nativa de Qwen3-4B tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/Manihatethisusername/Galan-v2-Dhivehi
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Qwen3: no disponible en la informacion proporcionada
- Paper de Qwen3: no disponible en la informacion proporcionada
