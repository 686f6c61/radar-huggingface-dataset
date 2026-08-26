# aflah/Llama8BxFWx2048x0pct

## Resumen

El modelo Llama8BxFWx2048x0pct es un checkpoint de entrenamiento en bruto de una arquitectura Llama 8B con la variante de investigación Partial RoPE al 0 %, desarrollado por Mohammad Aflah Khan. Forma parte de los experimentos del artículo «Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE», aceptado en EMNLP 2026, que estudia el impacto de aplicar la rotación posicional solo a una fracción de las dimensiones del embedding. Este checkpoint concreto se entrenó con el dataset FineWeb durante 12 000 pasos globales y una longitud de secuencia de 2 048 tokens, y se publica en formato GPT-NeoX sin conversión a Transformers. Su relevancia es estrictamente científica: permite analizar la convergencia y las propiedades del modelo cuando se elimina por completo la rotación posicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama 8B (Transformer decoder-only) |
| Parámetros totales | 8 mil millones (según el nombre) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2 048 tokens (secuencia de entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GPT-NeoX checkpoint (raw) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Llama 8B, un transformer decoder-only con atención causal, pero incorpora la modificación experimental de aplicar Partial RoPE al 0 %, es decir, que no se aplica ninguna rotación posicional a las cabezas de atención. El entrenamiento se realizó sobre el dataset FineWeb, con secuencias de 2 048 tokens, durante 12 000 pasos globales. El checkpoint se guarda en el formato nativo de GPT-NeoX, lo que implica que no es directamente compatible con la mayoría de los frameworks de inferencia sin una conversión previa al formato Transformers. El código de entrenamiento y análisis está disponible en el repositorio oficial del proyecto.

## Capacidades

- Generación de texto libre: al ser un modelo base sin fine-tuning, puede generar texto, pero no está optimizado para tareas específicas.
- Investigación sobre posicionales: permite estudiar el efecto de la ausencia total de rotación posicional en la calidad de las representaciones.
- Análisis de convergencia: el checkpoint en el paso 12 000 facilita el estudio de la dinámica de entrenamiento en comparación con otras variantes.
- No se ha demostrado soporte para tool calling, agentes ni razonamiento multi-step, dado su carácter experimental.

## Casos de uso

- **Investigación académica sobre arquitecturas posicionales**: el modelo permite estudiar cómo la eliminación completa de RoPE afecta a la calidad de las representaciones posicionales en transformers.
- **Análisis de convergencia de entrenamiento**: los investigadores pueden comparar la pérdida y las métricas en este paso con otros checkpoints del mismo experimento para evaluar la velocidad de convergencia.
- **Comparación de variantes de Partial RoPE**: se puede contrastar con checkpoints que aplican un 25 %, 50 % o 75 % de rotación para aislar el efecto del porcentaje de RoPE.
- **Reproducción de experimentos**: el código de entrenamiento y análisis está disponible en GitHub, lo que permite replicar los resultados del estudio.
- **Estudio de la relación entre posición y contenido**: al no aplicar rotación, se puede analizar cómo el modelo maneja la información posicional sin el mecanismo habitual.
- **Base para fine-tuning en tareas específicas**: aunque no es el objetivo principal, el checkpoint podría servir como punto de partida para experimentos de fine-tuning, aunque no se recomienda para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8 mil millones de parámetros en fp16 se necesitan aproximadamente 16 GB de VRAM. En cuantización de 4 bits, se podría reducir a unos 4-6 GB, pero no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM, como RTX 4090, A100 o H100, para inferencia sin cuantización.
- Formato de despliegue: el checkpoint en GPT-NeoX no es compatible directamente con vLLM, llama.cpp, Ollama o TGI; se requeriría una conversión previa al formato Transformers.
- Despliegue en producción: no recomendado, es un modelo de investigación sin fine-tuning y sin licencia clara.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. En cuanto a la arquitectura, se puede comparar con Llama 3.1 8B (contexto de 32 768 tokens y RoPE estándar) y Mistral 7B (contexto de 32 768 tokens y RoPE estándar). La diferencia principal es la modificación de RoPE, que es el objeto de estudio de este proyecto. No obstante, al ser un checkpoint de investigación sin benchmarks publicados, no se puede realizar una comparación cuantitativa.

## Limitaciones y advertencias

- **No es un modelo listo para producción**: es un checkpoint de entrenamiento en bruto, sin fine-tuning ni optimización para tareas concretas.
- **Licencia no especificada**: no se indica la licencia en la ficha de Hugging Face, por lo que el uso comercial puede estar restringido.
- **Formato propietario**: los pesos están en formato GPT-NeoX, no compatible con la mayoría de frameworks de inferencia sin conversión.
- **Riesgo de alucinación**: al ser un modelo base sin alineación, puede generar texto incoherente o incorrecto.
- **Idiomas**: no se especifica qué idiomas soporta; al entrenarse en FineWeb, probablemente esté optimizado para inglés.
- **Contexto limitado**: con 2 048 tokens de secuencia, no es adecuado para tareas que requieran un contexto largo.
- **Descargas y popularidad**: el modelo tiene 0 descargas y 0 likes, lo que indica que es un artefacto de investigación no destinado a un uso generalizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aflah/Llama8BxFWx2048x0pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2505.11670)
- [Repositorio de entrenamiento y análisis](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Perfil del autor en Hugging Face](https://huggingface.co/aflah)
- [Página personal de Mohammad Aflah Khan](https://aflah02.github.io/)
