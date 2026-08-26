# aflah/Llama1BxFWx4096x100pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato GPT-NeoX correspondiente a los experimentos de *Partial RoPE* descritos en el artículo *Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE* (arXiv:2603.11611), aceptado en EMNLP 2026. El modelo se basa en la arquitectura Llama 3.2 1B y fue entrenado sobre el dataset FineWeb con una longitud de secuencia de 4.096 tokens, aplicando RoPE al 100% (es decir, sin rotación parcial). El checkpoint corresponde al paso global 12.000 y se conserva en su formato original GPT-NeoX, sin conversión a Transformers.

La relevancia de este modelo es principalmente investigadora: permite reproducir y analizar el efecto de la rotación posicional parcial en el rendimiento y la convergencia de modelos transformer. No se trata de un modelo listo para uso en producción, sino de un artefacto de estudio académico. El autor, Mohammad Aflah Khan, mantiene el código de entrenamiento y análisis en un repositorio público de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (checkpoint en formato GPT-NeoX) |
| Parametros totales | 1B (según arquitectura declarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX (raw checkpoint, no Transformers) |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura Llama 3.2 1B, aunque los pesos se almacenan en el formato de checkpoint de GPT-NeoX, lo que implica que no son directamente cargables con `transformers` sin una conversión previa. El entrenamiento se realizó sobre el dataset FineWeb, con una longitud de secuencia de 4.096 tokens y una configuración de RoPE al 100% (es decir, rotación completa, sin fraccionamiento). El checkpoint se guardó en el paso global 12.000. No se proporcionan detalles sobre el número total de tokens de entrenamiento, el optimizador utilizado, ni si se aplicaron técnicas como RLHF o DPO. La innovación principal del trabajo es el estudio sistemático de *Partial RoPE*, una variante que rota solo una fracción de las dimensiones de los embeddings posicionales, y su impacto en la convergencia y el rendimiento final.

## Capacidades

- Modelo base de lenguaje, sin fine-tuning instructivo ni alineación.
- Generación de texto autoregresiva (capacidad implícita de la arquitectura, no verificada en este checkpoint).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifican idiomas soportados; al entrenarse con FineWeb (dataset mayoritariamente en inglés), es probable que el modelo tenga competencia principalmente en inglés, pero no hay confirmación.
- El checkpoint no incluye modo *thinking* ni funcionalidades especiales.

## Casos de uso

- Reproducción de experimentos académicos: el checkpoint permite replicar los resultados del paper sobre Partial RoPE, comparando la convergencia y el rendimiento con otras configuraciones de rotación.
- Análisis de representaciones internas: al ser un checkpoint intermedio (paso 12.000), puede usarse para estudiar la evolución de las representaciones durante el entrenamiento.
- Investigación sobre posicional encoding: sirve como punto de partida para experimentos que varíen el porcentaje de RoPE o la longitud de contexto.
- Desarrollo de técnicas de conversión de formatos: al estar en GPT-NeoX, puede utilizarse para probar herramientas de conversión a Transformers o a otros formatos de inferencia.
- Benchmarking de infraestructura: el tamaño del repo (16,5 GB) permite probar pipelines de carga y gestión de checkpoints grandes en entornos de investigación.
- Estudio de memorización y generalización: dado el interés del autor en estos temas (ver su página personal), el checkpoint podría emplearse en análisis de memorización de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2603.11611) podría contener evaluaciones, pero no se incluyen en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- El tamaño del repositorio es de 16,5 GB, lo que sugiere que los pesos están almacenados en precisión fp32 o fp16 sin cuantizar. Un modelo de 1B parámetros en fp16 ocupa aproximadamente 2 GB, por lo que el tamaño extra probablemente se deba a archivos adicionales (estados de optimizador, metadatos, etc.).
- Para cargar el checkpoint en memoria se recomienda una GPU con al menos 16 GB de VRAM si se usa fp16, o 32 GB si se usa fp32.
- No se indican GPUs específicas recomendadas. Una RTX 4090 (24 GB) o una A100 (40 GB) serían suficientes para cargar el modelo en fp16.
- Al ser un checkpoint crudo, no es directamente utilizable con vLLM, llama.cpp u Ollama sin una conversión previa a un formato compatible (por ejemplo, Transformers o GGUF).
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El checkpoint es un artefacto de investigación específico, y no se conocen modelos comparables de la misma categoría (checkpoints de Partial RoPE) en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo final afinado para tareas concretas. No debe usarse en producción sin un proceso completo de fine-tuning y evaluación.
- No tiene licencia especificada, lo que impide conocer las restricciones de uso comercial.
- El formato GPT-NeoX no es compatible directamente con el ecosistema Transformers; se requiere conversión.
- No se han evaluado sesgos ni riesgos de alucinación; al ser un modelo base entrenado en FineWeb, puede reflejar sesgos presentes en los datos.
- La longitud de contexto está limitada a 4.096 tokens, lo que restringe su uso en tareas que requieran contextos largos.
- No se garantiza la calidad de las generaciones, ya que no ha pasado por alineación ni instrucciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aflah/Llama1BxFWx4096x100pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Código de entrenamiento y análisis](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Página personal del autor](https://aflah02.github.io/)
