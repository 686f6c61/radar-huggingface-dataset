# aflah/Llama1BxFWx1024x10pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato GPT-NeoX del experimento de *Partial RoPE* descrito en el artículo «Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE» (arXiv:2603.11611), aceptado en EMNLP 2026. El modelo subyacente es una arquitectura Llama 3.2 de 1B de parámetros, entrenada sobre el dataset FineWeb con una longitud de secuencia de 1.024 tokens y aplicando RoPE únicamente al 10% de los canales de atención. El checkpoint corresponde al paso global 12.000.

No se trata de un modelo listo para inferencia, sino de un artefacto de investigación diseñado para estudiar cómo la aplicación parcial de la codificación posicional rotatoria afecta a la convergencia y al rendimiento final del modelo. Su relevancia radica en que aporta evidencia empírica sobre una variante de RoPE que podría reducir costes computacionales o mejorar la estabilidad del entrenamiento, aunque los resultados completos se detallan en el paper asociado.

El autor, Mohammad Aflah Khan, es investigador en el Max Planck Institute for Software Systems y colaborador de EleutherAI, lo que garantiza un contexto académico riguroso. El checkpoint se distribuye en su formato original GPT-NeoX, sin conversión a Transformers, y no se especifican licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (checkpoint GPT-NeoX) |
| Parametros totales | 1B (aproximado, segun arquitectura Llama 3.2 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (raw, no Transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 1B, pero se entrena con una variante de RoPE denominada *Partial RoPE*, en la que solo un 10% de los canales de atención reciben la rotación posicional. El entrenamiento se realizó sobre el dataset FineWeb, con una longitud de secuencia fija de 1.024 tokens. El checkpoint guardado corresponde al paso global 12.000, lo que indica un entrenamiento intermedio, no necesariamente convergido.

No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa. El objetivo del experimento es analizar cómo la fracción de RoPE aplicada influye en la convergencia y en el rendimiento final, comparando con variantes que usan 0%, 10% u otros porcentajes. El código de entrenamiento y análisis está disponible en el repositorio GitHub del autor.

## Capacidades

- No es un modelo de propósito general: es un checkpoint de investigación, no un modelo final entrenado para tareas específicas.
- Permite estudiar el efecto de la codificación posicional parcial en la representación de secuencias largas.
- Puede utilizarse para análisis de convergencia, comparación de curvas de pérdida y evaluación de representaciones internas.
- No se han documentado capacidades de generación de texto, razonamiento, código, tool calling, agentes o multilingüismo, ya que no se ha evaluado como modelo final.

## Casos de uso

- Investigación sobre codificación posicional: el checkpoint permite reproducir los experimentos del paper y verificar los efectos de RoPE parcial en la calidad del modelo.
- Análisis de convergencia: al ser un checkpoint intermedio, se puede estudiar la dinámica de entrenamiento y comparar con otros pasos o porcentajes de RoPE.
- Estudio de representaciones internas: se pueden extraer activaciones y analizar cómo la atención distribuye la información posicional.
- Comparación de variantes de RoPE: junto con otros checkpoints del mismo autor (por ejemplo, 0% o 100%), permite aislar el impacto de la fracción aplicada.
- Reproducibilidad académica: sirve como referencia para otros investigadores que quieran validar los resultados del artículo.
- Desarrollo de nuevas variantes posicionales: el código y los pesos pueden servir de base para experimentos con otras fracciones o esquemas híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2603.11611) podría contener evaluaciones, pero no se incluyen en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- El repositorio ocupa 16.5 GB, lo que sugiere que los pesos están almacenados en precisión completa (fp32) o que se incluyen estados de optimizador adicionales.
- No está pensado para inferencia directa: requiere conversión a formato Transformers (por ejemplo, mediante scripts de GPT-NeoX) antes de poder cargarlo con bibliotecas estándar.
- Una vez convertido, un modelo de 1B en fp32 necesita aproximadamente 4 GB de VRAM para inferencia, pero no se han proporcionado datos de latencia ni throughput.
- Para reproducir el entrenamiento o continuar desde el checkpoint, se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100) y el entorno GPT-NeoX.
- No se han indicado opciones de despliegue como vLLM, llama.cpp u Ollama, ya que el formato no es compatible directamente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor ha publicado otros checkpoints con diferentes porcentajes de RoPE (por ejemplo, 0%), pero no se han detallado sus características ni resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento, no un modelo final optimizado para tareas de usuario.
- El formato GPT-NeoX no es compatible con las bibliotecas estándar de Hugging Face; se requiere conversión manual.
- No se especifica licencia, por lo que el uso comercial es incierto y debe consultarse con el autor.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que no se puede valorar su rendimiento real.
- La longitud de contexto está limitada a 1.024 tokens durante el entrenamiento; extrapolar a secuencias más largas puede degradar el rendimiento.
- Al ser un experimento de investigación, puede contener artefactos de entrenamiento o configuraciones no óptimas para producción.

## Enlaces

- [HuggingFace - aflah/Llama1BxFWx1024x10pct](https://huggingface.co/aflah/Llama1BxFWx1024x10pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Codigo de entrenamiento y analisis (GitHub)](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Perfil del autor en Hugging Face](https://huggingface.co/aflah)
- [Pagina personal del autor](https://aflah02.github.io/)
