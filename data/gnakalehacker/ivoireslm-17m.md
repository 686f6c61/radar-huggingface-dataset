# gnakalehacker/IvoireSLM-17M

## Resumen

IvoireSLM-17M es un checkpoint experimental de un Transformer causal denso de 19.750.720 parámetros según los safetensors (la model card declara 17.129.280), desarrollado por gnakalehacker en el marco del proyecto IvoireSLM. El modelo está orientado a investigar la representación del francés y de lenguas de Costa de Marfil, como el diula, en modelos de lenguaje muy pequeños. Se publica como resultado de una continuación de preentrenamiento (CPT) en la etapa 500.

La arquitectura es un Transformer causal con RMSNorm, RoPE, SwiGLU y pesos de embedding/salida ligados, con 12 bloques, 8 cabezas de atención, dimensión 320 y feed-forward de 832. El contexto máximo es de 512 tokens y el tokenizer es un BPE v0.4 de 8192 tokens. El modelo no es un asistente conversacional fiable: el autor documenta repeticiones, ecos del prompt y respuestas incorrectas, por lo que se publica únicamente con fines de investigación y reproducibilidad. La relevancia actual radica en la creciente atención hacia los modelos de lenguaje pequeños y la diversidad lingüística: IvoireSLM-17M ofrece un punto de partida para estudiar técnicas de preentrenamiento en dominios con pocos recursos, y su publicación incluye pesos, tokenizer, configuración y código de inferencia para permitir la reproducción de los resultados de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso |
| Parametros totales | 19.750.720 (según safetensors; la model card declara 17.129.280) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Francés e inglés (según metadatos); el autor indica que el francés, el diula y otras lenguas son muy limitados |
| Licencia | Other (código MIT; pesos pendientes de inventario de licencias) |
| Formato de pesos | safetensors (también PyTorch, tokenizer.json, config.json) |

## Arquitectura y entrenamiento

El modelo es un Transformer causal denso, no una arquitectura MoE ni SSM. Según la model card, implementa RMSNorm, RoPE, SwiGLU y pesos de embedding/salida ligados. Tiene 12 bloques Transformer, 8 cabezas de atención, dimensión de modelo 320, dimensión feed-forward 832 y un tokenizer BPE v0.4 con 8192 tokens. La longitud de contexto máxima es de 512 tokens. El checkpoint se obtiene tras 500 pasos de una continuación de preentrenamiento (CPT) sobre la mezcla `ivoireslm_pretraining_mix_v1.1.1_pilot`, compuesta por un 70% de corpus IvoireSLM v0.9, 20% de francés natural abierto, 5% de conversación francesa abierta y 5% de datos oficiales marfileños anclados. No se menciona ninguna fase de RLHF ni DPO. La model card reporta que la pérdida ponderada de validación pasa de 2,8930 antes del CPT a 2,8593 en la etapa 500. La innovación técnica destacable es la aplicación de RMSNorm, RoPE y SwiGLU en un modelo de tamaño mínimo, junto con la publicación de un tokenizer BPE adaptado a lenguas de Costa de Marfil.

## Capacidades

- Generación de texto causal en francés e inglés, con calidad limitada: el autor advierte de bucles repetitivos, ecos del prompt y respuestas incorrectas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas: el autor indica que el francés, el diula y otras lenguas son aún muy limitados.
- No dispone de modo de pensamiento, ni visión, ni audio.
- No es compatible con `transformers.AutoModelForCausalLM`; requiere código PyTorch personalizado.
- Cada salida debe considerarse no verificada.

## Casos de uso

- Investigación en modelos de lenguaje pequeños para lenguas africanas: el modelo sirve como banco de pruebas para estudiar cómo un Transformer de 17-19M parámetros representa el francés y el diula. Se usaría en laboratorios para comparar arquitecturas y evaluar la calidad de la tokenización, porque su tamaño reducido y su código abierto permiten ejecutar experimentos con recursos limitados.
- Reproducibilidad de experimentos de preentrenamiento: el repositorio incluye pesos, tokenizer, configuración y script de generación, lo que permite reproducir los resultados de validación (pérdida ponderada 2,8593). Se usaría para verificar pipelines de entrenamiento y comparar con otros checkpoints del mismo proyecto.
- Evaluación de técnicas de continuación de preentrenamiento (CPT): la mezcla de datos (70% corpus ivoiriense) permite estudiar cómo afecta la distribución de dominios a la pérdida de validación. Se usaría para ajustar hiperparámetros de mezcla de datos en modelos pequeños, porque el checkpoint incluye métricas de validación por dominio.
- Desarrollo y evaluación de tokenizers BPE: el tokenizer BPE v0.4 de 8192 tokens puede analizarse para determinar su cobertura del francés y del diula, y para investigar el impacto del tamaño del vocabulario en modelos diminutos. Se usaría en trabajos de NLP computacional sobre lenguas con pocos recursos.
- Estudio de alucinación y repetición en modelos
