# aflah/Pythia1BxFW_Edux2048x10pct

## Resumen

Este repositorio alberga un checkpoint de entrenamiento en bruto de la serie Pythia 1B, obtenido durante los experimentos sobre *Partial RoPE* descritos en el artículo «Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE» (aceptado en EMNLP 2026). El modelo se entrenó sobre el dataset FineWeb-Edu con una secuencia de 2.048 tokens y aplica una variante de la rotación posicional (RoPE) solo al 10% de las dimensiones de los vectores de consulta y clave. El checkpoint corresponde al paso global 12.000 y se conserva en el formato nativo de GPT-NeoX, sin conversión a Hugging Face Transformers.

La relevancia de este modelo radica en que permite estudiar empíricamente cómo la aplicación parcial de RoPE afecta a la convergencia y al rendimiento de modelos decoder‑only, un tema abierto en la investigación de arquitecturas eficientes. Al ser un checkpoint de investigación, no está pensado para uso productivo, sino para reproducir y analizar los resultados del paper.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (Pythia 1B) |
| Parametros totales | No disponible (denominación Pythia 1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoint bruto GPT-NeoX (no Transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-NeoX, la misma utilizada en la serie Pythia de EleutherAI. La innovación principal es la aplicación de *Partial RoPE*: en lugar de aplicar la rotación posicional a todas las dimensiones de los embeddings de consulta y clave, solo se aplica al 10% de ellas. Esto reduce el coste computacional asociado a las posiciones, pero puede alterar la capacidad del modelo para capturar relaciones de distancia. El entrenamiento se realizó sobre el dataset `FineWeb-Edu`, con una longitud de secuencia de 2.048 tokens. No se especifica el número total de tokens de entrenamiento ni si se emplearon técnicas adicionales como RLHF o DPO. El checkpoint se guarda en el paso 12.000, sin información sobre el número total de pasos previstos.

## Capacidades

- Modelo base de lenguaje: capaz de generar texto y completar secuencias, aunque no se han documentado capacidades específicas de razonamiento o instrucción.
- No se ha reportado soporte para *tool calling*, agentes o razonamiento multi‑paso.
- No se indica soporte multilingüe ni capacidades de visión o audio.
- Al ser un checkpoint de investigación, no se han evaluado capacidades funcionales más allá de las del experimento.

## Casos de uso

- **Investigación en eficiencia de atención**: permite comparar cómo una fracción de RoPE (10%) afecta a la convergencia frente a modelos con RoPE completa, usando como referencia la serie Pythia original.
- **Análisis de la degradación posicional**: se puede usar para medir la capacidad del modelo para distinguir posiciones lejanas cuando solo una parte de las dimensiones está rotada.
- **Estudio de la relación entre coste computacional y rendimiento**: al reducir el número de operaciones rotacionales, se puede evaluar el trade‑off entre velocidad de entrenamiento y calidad final.
- **Comparación de configuraciones de RoPE**: sirve como punto de comparación para otras variantes (por ejemplo, 25%, 50%, 100%) dentro del mismo experimento.
- **Reproducción de resultados**: los investigadores pueden descargar el checkpoint para reproducir los análisis del paper y verificar las conclusiones.
- **Desarrollo de técnicas de regularización posicional**: el modelo puede servir de base para estudiar métodos que combinan RoPE parcial con otras técnicas de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 1B de parámetros, se estima que puede ejecutarse en una GPU con al menos 8‑16 GB de VRAM, dependiendo de la precisión y la cuantización.
- No se especifican GPU concretas recomendadas ni configuraciones de despliegue.
- Dado el formato GPT-NeoX nativo, no es compatible directamente con vLLM, Ollama o llama.cpp sin una conversión previa a los formatos estándar (por ejemplo, safetensors y Transformers).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información de rendimiento comparado, pero se puede contrastar con el modelo Pythia 1B original (EleutherAI) y con otros modelos de la misma familia que usan RoPE completa.

| Modelo | Arquitectura | Parámetros | Longitud de contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Pythia 1B (EleutherAI) | GPT-NeoX | 1.1B (aprox.) | 2.048 | Apache 2.0 | Transformers/GGUF |
| Pythia 1B con Partial RoPE (este) | GPT-NeoX | No disponible | 2.048 | No disponible | GPT-NeoX nativo |

La comparativa se limita a la arquitectura y al tipo de RoPE, ya que no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo final para uso productivo.
- No se ha evaluado su calidad en tareas generales ni su robustez frente a sesgos.
- La licencia no está especificada, por lo que no se puede garantizar permisos de uso comercial o modificación.
- El formato es GPT-NeoX nativo, lo que requiere conversión manual antes de usar con la mayoría de las herramientas de inferencia.
- La aplicación parcial de RoPE puede degradar la capacidad de generalización a secuencias más largas que las de entrenamiento (2.048 tokens).
- No se dispone de información sobre el dataset de entrenamiento completo (composición, filtrado, idiomas), lo que limita la evaluación de posibles sesgos.

## Enlaces

- [Hugging Face: aflah/Pythia1BxFW_Edux2048x10pct](https://huggingface.co/aflah/Pythia1BxFW_Edux2048x10pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [GitHub: Partial RoPE Analysis](https://github.com/aflah02/Partial_RoPE_Analysis)
