# ailexleon/Orion-26B-A4B-v1-mlx-6Bit

## Resumen

Orion-26B-A4B-v1-mlx-6Bit es una conversión al formato MLX (Apple) del modelo Orion-26B-A4B-v1, originalmente desarrollado por BeaverAI. El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos, basada en la familia Gemma 4 (según la etiqueta "gemma4" del repositorio). Esta versión concreta, publicada por ailexleon, está cuantizada a 6 bits para su uso eficiente en dispositivos Apple con el framework MLX. El modelo está orientado a generación de texto conversacional en inglés.

Aunque el nombre indica 26B parámetros, el archivo safetensors del repositorio muestra 5.520.972.830 parámetros, lo que resulta inconsistente y podría deberse a un error en la metadata o a una conversión parcial. El repositorio ocupa 20.5 GB, lo que sugiere que el modelo real es más grande que lo indicado por el archivo safetensors. No se dispone de información sobre el proceso de entrenamiento, licencia o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Gemma 4 (según etiqueta "gemma4") |
| Parametros totales | 26B (nominal, según nombre); safetensors muestra 5.520.972.830 |
| Parametros activos | 4B (según nombre "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna ni el proceso de entrenamiento en la model card. La etiqueta "gemma4" sugiere que el modelo se basa en la arquitectura Gemma 4 de Google, que es un transformer de última generación. El nombre "A4B" indica que se trata de una mezcla de expertos (MoE) con 4 mil millones de parámetros activos por token, mientras que el total nominal es de 26 mil millones. No se dispone de datos sobre el dataset de entrenamiento, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La conversión a MLX fue realizada por ailexleon utilizando la librería mlx-lm (versión 0.31.3 según se menciona en otros repositorios similares), pero no se especifican detalles adicionales.

## Capacidades

- Generación de texto conversacional en inglés.
- Diseñado para tareas de chat y diálogo multi-turno (según la etiqueta "conversational").
- Compatible con el pipeline de Hugging Face `text-generation`.
- Integración con el framework MLX de Apple para inferencia eficiente en hardware Apple Silicon.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión u otras capacidades especiales.

## Casos de uso

- Chatbots y asistentes conversacionales: el modelo puede integrarse en aplicaciones de chat en inglés, aprovechando su naturaleza conversacional y su formato MLX para ejecutarse en Macs con Apple Silicon.
- Generación de texto creativo: redacción de artículos, correos electrónicos o contenido social en inglés, con la ventaja de poder ejecutarse localmente en hardware Apple.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo cuantizado a 6 bits, permite iterar rápidamente en entornos de desarrollo con recursos limitados.
- Experimentación con MoE en MLX: sirve como ejemplo de conversión de un modelo MoE a formato MLX, útil para desarrolladores que quieran estudiar o adaptar arquitecturas similares.
- Inferencia offline en Mac: al ser un modelo local, puede usarse en entornos sin conexión o con requisitos de privacidad de datos.
- Fine-tuning o adaptación posterior: aunque no se documenta, el formato safetensors permite potencialmente cargar el modelo en MLX para ajustes adicionales, si se dispone de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo o sus variantes.

## Requisitos de hardware

- El repositorio ocupa 20.5 GB, por lo que se recomienda al menos 24 GB de RAM unificada en un Mac con Apple Silicon para cargar el modelo cómodamente.
- Para inferencia fluida, se recomienda un Mac con chip M1 Pro, M1 Max, M2 Pro, M2 Max o superior, con al menos 32 GB de RAM unificada.
- El modelo está diseñado para MLX, por lo que no es compatible directamente con CUDA o ROCm. Para usarlo en GPUs de NVIDIA o AMD, sería necesario convertir a otro formato (por ejemplo, GGUF).
- La inferencia se realiza mediante la librería `mlx-lm` (pip install mlx-lm). También se puede usar con el script de generación de MLX.
- No se dispone de datos de latencia o throughput específicos para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1-mlx-6Bit (este) | 26B nominal / 5.5B en safetensors | no disponible | no disponible | MLX 6-bit | Conversión no oficial a MLX |
| Orion-26B-A4B-v1c-GGUF (BeaverAI) | 26B | no disponible | no disponible | GGUF | Versión oficial en GGUF para CPU/GPU |
| Orion-26B-A4B-v1a-GGUF (BeaverAI) | 26B | no disponible | no disponible | GGUF | Otra variante GGUF |
| Orion-26B-A4B-v1e-GGUF (BeaverAI) | 26B | no disponible | no disponible | GGUF | Otra variante GGUF |

No se dispone de datos de rendimiento comparativo entre estas versiones. Todas comparten el mismo nombre base, pero las diferencias en cuantización y formato pueden afectar la velocidad y calidad.

## Limitaciones y advertencias

- Inconsistencia en el número de parámetros: el nombre indica 26B, pero el archivo safetensors muestra 5.5B. Esto puede deberse a un error en la metadata o a una conversión incompleta. Se recomienda verificar el contenido real del repositorio antes de usarlo en producción.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación.
- Soporte limitado a inglés: el modelo solo declara soporte para el idioma inglés, por lo que no es adecuado para tareas multilingües.
- Sin información de entrenamiento: no se conocen los datos de entrenamiento, posibles sesgos o alucinaciones. Se recomienda evaluar el modelo en el dominio de aplicación antes de desplegarlo.
- Formato MLX propietario de Apple: el modelo solo funciona en hardware Apple con el framework MLX. Para otros entornos, es necesario convertir a otro formato, lo que puede requerir herramientas adicionales.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas estándar, por lo que su calidad es incierta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ailexleon/Orion-26B-A4B-v1-mlx-6Bit
- Repositorio relacionado (conversión 4-bit): https://huggingface.co/ailexleon/G4-Runic-Oarfish-26B-A4B-v1-mlx-4Bit
- Versión GGUF de BeaverAI: https://huggingface.co/BeaverAI/Orion-26B-A4B-v1c-GGUF
- Página en Inferix: https://inferix.co/models/BeaverAI/Orion-26B-A4B-v1a-GGUF
- Página en AI Market Cap: https://aimarketcap.tech/models/beaverai-orion-26b-a4b-v1e-gguf
