# aflah/Llama1BxFWx2048x75pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato GPT-NeoX, resultado de los experimentos sobre *Partial RoPE* descritos en el artículo *Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE* (arXiv:2603.11611), aceptado en EMNLP 2026. El modelo se basa en la arquitectura Llama 3.2 de 1B de parámetros, pero se ha entrenado con una variante de RoPE en la que solo el 75% de las dimensiones del head se rotan, en lugar del 100 % habitual.

El checkpoint corresponde al paso global 12 000 de un entrenamiento sobre el dataset FineWeb, con una longitud de secuencia de 2048 tokens. No es un modelo listo para uso en producción, sino un artefacto de investigación para estudiar cómo afecta la fracción de rotación a la convergencia y al rendimiento final. Su relevancia actual radica en que proporciona datos empíricos sobre una modificación de bajo coste de una de las técnicas de posicionamiento más usadas en los transformers modernos.

El repositorio está mantenido por Mohammad Aflah Khan, autor del estudio y con publicaciones recientes en ICLR 2026 sobre memorización en LLMs. El modelo se distribuye como checkpoint crudo de GPT-NeoX, sin conversión al formato Transformers, y su tamaño de repositorio es de 16,5 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (entrenado con GPT-NeoX) |
| Parametros totales | no disponible (el nombre indica 1B, sin confirmar) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint GPT-NeoX (no Transformers) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura Llama 3.2 1B, pero con una modificación en el mecanismo de posicionamiento: se aplica RoPE únicamente al 75 % de las dimensiones de cada cabeza de atención. Esta técnica, llamada *Partial RoPE*, busca reducir la carga computacional de la rotación posicional manteniendo la capacidad de codificar posiciones relativas. El entrenamiento se realizó sobre el dataset FineWeb con una longitud de secuencia de 2048 tokens, y el checkpoint corresponde al paso 12 000 (no al final del entrenamiento). No se mencionan técnicas de alineación (RLHF, DPO) ni otros detalles del proceso de optimización.

## Capacidades

- Modelo de lenguaje base (no instruido ni alineado), entrenado exclusivamente para modelado de lenguaje autoregresivo.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso.
- No hay información sobre capacidades multilingües; el entrenamiento se realizó sobre FineWeb, que es predominantemente en inglés.
- No se indica soporte para visión, audio u otras modalidades.
- Su utilidad práctica es exclusivamente como objeto de estudio en investigación sobre eficiencia de mecanismos posicionales.

## Casos de uso

- Investigación en eficiencia de atención: el modelo permite comparar el comportamiento de RoPE parcial frente a RoPE completo en tareas de lenguaje, midiendo convergencia y rendimiento.
- Estudio de convergencia de transformers: al ser un checkpoint intermedio (paso 12 000), se puede analizar la evolución de la pérdida y las métricas durante el entrenamiento.
- Análisis de la sensibilidad a la proporción de rotación: se puede usar junto a otros checkpoints con distintos porcentajes (por ejemplo, 0 %, 50 %, 100 %) para trazar curvas de rendimiento.
- Reproducción de experimentos académicos: el código de entrenamiento y análisis está disponible en GitHub, lo que permite replicar los resultados del paper.
- Evaluación de la transferencia a tareas downstream: aunque no está alineado, se puede probar en tareas de lenguaje estándar (perplejidad, clasificación) para comparar con la versión base.
- Estudio de la relación entre RoPE parcial y la capacidad de generalización a longitudes de secuencia más largas: el contexto de 2048 tokens permite experimentos de extrapolación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo ofrece un checkpoint de entrenamiento, y el artículo (arXiv:2603.11611) no se ha incluido en la búsqueda, por lo que no se dispone de cifras de MMLU, HumanEval ni otros estándares.

## Requisitos de hardware

- El checkpoint ocupa 16,5 GB en disco, lo que sugiere pesos en precisión completa (fp32) o fp16, aunque no se especifica.
- Para cargar el modelo en memoria se necesitaría aproximadamente la VRAM equivalente al tamaño de los pesos en la precisión utilizada (por ejemplo, ~4 GB en fp32 para 1B parámetros, pero el tamaño del repo indica que puede haber otros archivos o guardados de estado de optimizador).
- No se indican requisitos mínimos de GPU. Al ser un modelo de 1B, podría ejecutarse en GPUs consumer como RTX 3090 o RTX 4090 si se convierte a un formato cuantizado (GGUF, etc.), pero el checkpoint no está cuantizado ni convertido.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) porque no es un modelo listo para inferencia; se requiere conversión a Transformers o a un formato de ejecución.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con modelos de la misma familia (Llama 3.2 1B original, Qwen 2.5 1.5B, etc.). La única diferencia documentada es el uso de RoPE parcial, pero sin métricas publicadas en la información disponible. Por tanto, no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento intermedio, no un modelo final: no se ha completado el entrenamiento ni se ha evaluado su rendimiento real.
- No está alineado (no ha pasado por RLHF/DPO), por lo que puede generar contenido incoherente o no seguro en uso directo.
- El formato GPT-NeoX no es compatible con las librerías estándar de inferencia (Transformers, vLLM, llama.cpp) sin conversión previa.
- No se especifica la licencia, lo que impide su uso comercial o incluso académico sin autorización expresa del autor.
- No se han documentado los idiomas soportados; el dataset FineWeb es mayoritariamente inglés, por lo que el rendimiento en otros idiomas será probablemente deficiente.
- No se ha evaluado el riesgo de alucinación ni los sesgos, ya que no se han publicado análisis de sesgos para este checkpoint.
- La longitud de contexto de 2048 tokens es corta en comparación con los estándares actuales (8K o más), lo que limita su uso en tareas que requieren contexto largo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aflah/Llama1BxFWx2048x75pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Código de entrenamiento y análisis](https://github.com/aflah02/Partial_RoPE_Analysis)
