# aflah/Llama1BxFWx1024x75pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato crudo de GPT-NeoX, correspondiente a un experimento sobre RoPE parcial (Partial RoPE) que acompaña al artículo "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE" (arXiv:2603.11611), aceptado en EMNLP 2026. El modelo se basa en la arquitectura Llama 3.2 1B y fue entrenado sobre el dataset FineWeb con una longitud de secuencia de 1024 tokens, aplicando un 75% de RoPE parcial. El checkpoint corresponde al paso global 12,000.

Este checkpoint es un artefacto de investigación, no un modelo listo para producción. Su propósito es permitir reproducir y analizar los efectos de la RoPE parcial en la convergencia y el rendimiento de modelos LLM. Al estar en formato GPT-NeoX, no es directamente compatible con el ecosistema Transformers sin una conversión previa. Relevante para investigadores que estudian técnicas de positional encoding y pre-entrenamiento de LLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (configuración GPT-NeoX) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (formato crudo, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (no Transformers) |

## Arquitectura y entrenamiento

El modelo es una instancia de la arquitectura Llama 3.2 con 1B parámetros, entrenada sobre el dataset FineWeb (FW) con una longitud de secuencia de 1024 tokens. La innovación principal es la aplicación de RoPE parcial al 75% de las dimensiones de las cabezas de atención, en lugar de la RoPE completa estándar. Esta técnica busca evaluar si una rotación parcial de las posiciones puede mantener el rendimiento y acelerar la convergencia. El entrenamiento se realizó en GPT-NeoX, y el checkpoint se guardó en el paso global 12,000. No se menciona el uso de RLHF, DPO u otros métodos de alineación; es un checkpoint de pre-entrenamiento puro.

## Capacidades

- Generación de texto: al ser un checkpoint de pre-entrenamiento, puede generar texto continuando secuencias, pero no ha sido ajustado para tareas específicas.
- Razonamiento y matemáticas: capacidades limitadas, propias de un modelo base de 1B sin fine-tuning.
- Código: no se ha entrenado específicamente para código, aunque puede producir fragmentos básicos.
- Multilingüe: no se especifica, dado que FineWeb es mayoritariamente inglés, se asume principalmente inglés.
- Sin soporte para tool calling ni agentes.
- Sin modo de pensamiento o visión.
- El interés principal es la investigación sobre RoPE parcial, no el uso directo como modelo de producción.

## Casos de uso

- Reproducción de experimentos académicos: permite replicar los resultados del paper sobre RoPE parcial, comparando la convergencia y el rendimiento con checkpoints de RoPE completa.
- Análisis de comportamiento de atención: investigar cómo la reducción del porcentaje de RoPE afecta a las matrices de atención y a la representación posicional.
- Estudio de la convergencia: examinar la curva de pérdida y la velocidad de convergencia en función del porcentaje de RoPE (en este caso 75%).
- Evaluación de la influencia de la longitud de secuencia: al tener 1024 tokens de contexto, se puede analizar la degradación de rendimiento en secuencias más largas.
- Comparación de arquitecturas: comparar este checkpoint con versiones de Llama 3.2 1B estándar para aislar el efecto de la RoPE parcial.
- Integración en pipelines de investigación: convertir el checkpoint a formato Transformers o usar directamente con GPT-NeoX para continuar el entrenamiento o evaluaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo contiene el checkpoint y el paper, sin tablas de evaluación numérica accesibles.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1B en fp32, se requieren aproximadamente 4 GB de VRAM. Con cuantización a int8 se reduce a unos 2 GB, pero el checkpoint no viene cuantizado.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 2060, RTX 3060, RTX 4090) para inferencia básica en fp32. Para entrenamiento o análisis de la pérdida, se necesitaría más VRAM (p. ej., A100 40GB o H100).
- En consumer GPU: sí, cabe en GPUs de gama media (RTX 3060, RTX 4070) para inferencia, pero al ser un checkpoint de investigación, no es el objetivo principal.
- Opciones de despliegue: al estar en formato GPT-NeoX, se puede usar con GPT-NeoX o convertir a Transformers para usar con vLLM, llama.cpp, Ollama, etc. No hay soporte directo en la mayoría de frameworks hasta conversión.
- Latencia y throughput: no disponible, depende del hardware y la implementación.

## Comparativa con modelos similares

No hay datos comparativos directos en la información disponible. El modelo es un checkpoint de investigación, no un modelo finalizado. Como referencia, se puede comparar con la versión base de Llama 3.2 1B (sin RoPE parcial) y con otros modelos de 1B como TinyLlama o OpenLLaMA, pero no se dispone de métricas concretas. Se recomienda consultar el paper para la comparativa detallada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de investigación sin fine-tuning ni alineamiento.
- Formato GPT-NeoX: no es compatible con Transformers directamente; requiere conversión.
- Licencia no especificada: el uso comercial no está garantizado; es necesario contactar al autor.
- Sin información sobre sesgos o alucinaciones: al ser un modelo base sin entrenamiento instructivo, no se puede evaluar su comportamiento en tareas conversacionales.
- Longitud de contexto limitada a 1024 tokens: no apto para tareas de contexto largo.
- Idioma mayoritariamente inglés (FineWeb), no se garantiza soporte multilingüe.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/aflah/Llama1BxFWx1024x75pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Código de entrenamiento y análisis](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Perfil del autor en Hugging Face](https://huggingface.co/aflah)
- [Página personal del autor](https://aflah02.github.io/)
