# johndpope/MiniMax-H3-MPEG-Diffusion

## Resumen

MiniMax-H3-MPEG-Diffusion es un adaptador LoRA de investigación para el modelo de difusión de vídeo MiniMax H3 (MiniMaxAI/MiniMax-H3), publicado por el usuario johndpope. Implementa el método MPEG-Diffusion (Mixed-Resolution Video Generation), descrito en el artículo arXiv 2611.12069 de Menn, Gu, He y colaboradores (UT Austin y Roblox), y consiste en un port independiente de dicho método al transformer de difusión (DiT) de H3. No se trata de un modelo completo, sino de pesos adaptadores que modifican el comportamiento de muestreo del modelo base para permitir la generación de vídeo con dos pistas de resolución mixta.

El objetivo técnico es que el modelo base renderice el fotograma completo a media resolución y, simultáneamente, una región concreta (por ejemplo, el rostro) con tokens a resolución completa. La atención de doble resolución permite que cada consulta lea claves y valores en su propia resolución, y el ajuste fino busca que la pista de alta resolución pueda empezar antes y redibujar detalle. Los pesos se empaquetan como un LoRA de rango 16 más los mapas de proyección K/V y dos vectores de resolución.

Es relevante ahora porque explora una vía para reducir el coste computacional de la generación de vídeo en alta resolución sin reentrenar el modelo completo, y porque el autor publica el pipeline de entrenamiento y el sampler de forma abierta. No obstante, se trata de pesos de investigación: el primer entrenamiento está en curso y el propio autor advierte de que aún no hay resultados de calidad y de que los rostros generados por el sampler sin entrenar pueden aparecer distorsionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre el DiT de MiniMax H3, con mapas de proyección K/V y dos vectores de resolución (atención de doble resolución) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer de difusión (DiT) de MiniMax H3, que permanece sin modificar y renderiza el fotograma completo a media resolución. Sobre esa base, MPEG-Diffusion introduce una segunda pista de tokens a resolución completa para una región seleccionada (por ejemplo, el rostro) y emplea atención de doble resolución, de modo que cada consulta lee claves y valores a su propia resolución. El ajuste fino tiene como objetivo que la pista de alta resolución pueda activarse antes en el proceso de muestreo y redibujar detalle fino. Los pesos se materializan como un LoRA de rango 16 junto con los mapas de proyección K/V y dos vectores de resolución, lo que abarata el almacenamiento y la aplicación del adaptador.

En cuanto a los datos, el primer run (`run1/`) utiliza 1.951 fotografías de personas de Pexels y 403 imágenes isométricas a 1344×768, con 2.000 pasos de entrenamiento sobre una única RTX 5090. El autor indica que la tarjeta del run incluirá la pérdida sobre el conjunto de validación cuando finalice el entrenamiento. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable por otra parte en un modelo de difusión.

## Capacidades

- Generación de vídeo con resolución mixta: renderizado del fotograma completo a media resolución combinado con una región a resolución completa.
- Muestreo con atención de doble resolución sobre el DiT de MiniMax H3.
- Aplicación como adaptador LoRA de rango 16 sobre el modelo base, sin necesidad de reentrenar H3.
- Entrenamiento reproducible mediante el pipeline publicado (`lot/two_track_h3.py`, `lot/train_tt.py`, `lot/train_tt_all.sh`).
- Uso de embeddings de caption precalculados que evitan ejecutar el codificador de texto de 32B.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en generación de vídeo de alta resolución: el adaptador permite experimentar con muestreo de dos pistas sobre H3 sin reentrenar el modelo completo, útil para grupos que estudian eficiencia computacional en difusión de vídeo.
- Reproducción de resultados académicos: al publicarse el sampler y el pipeline de entrenamiento, sirve para replicar y extender el método MPEG-Diffusion descrito en arXiv 2611.12069.
- Prototipado de retratos y primeros planos: la pista de resolución completa está pensada para regiones como el rostro, por lo que encaja en pruebas de generación de vídeo con detalle facial, siempre que el entrenamiento haya convergido.
- Ajuste fino con datasets propios: el script `lot/train_tt_all.sh` y los embeddings de caption precalculados permiten adaptar el LoRA a nuevos conjuntos de imágenes o vídeo con un coste de cómputo contenido.
- Evaluación comparativa de técnicas de resolución mixta: útil para contrastar MPEG-Diffusion frente a otros enfoques de adaptadores como los Level-of-Token (johndpope/MiniMax-H3-LoT).
- Docencia y formación técnica: como ejemplo práctico de LoRA sobre DiT, atención de doble resolución y empaquetado de adaptadores para modelos de difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el primer entrenamiento está en curso y que todavía no hay resultados de calidad; la pérdida sobre el conjunto de validación se publicará en la tarjeta de `run1/` cuando finalice el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base MiniMax H3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible para inferencia. El entrenamiento del primer run se realizó sobre una única RTX 5090.
- ¿Cabe en GPU de consumo? El entrenamiento del adaptador sí se ejecutó en una RTX 5090; los requisitos de inferencia del modelo base no se especifican.
- Opciones de despliegue: no disponible. El repositorio remite al código y sampler de scrya-com/mpeg-diffusion (`lot/two_track_h3.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-MPEG-Diffusion (este) | LoRA de investigación sobre DiT de vídeo | MiniMax H3 | Resolución mixta (media + región a resolución completa); contexto no disponible | minimax-h3-community-license | Hugging Face, 0 descargas |
| johndpope/MiniMax-H3-LoT | Adaptadores Level-of-Token sobre DiT de vídeo | MiniMax H3 | no disponible | no disponible en la información | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo base de difusión de vídeo | — | no disponible | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Pesos de investigación sin resultados de calidad: el primer entrenamiento está en curso y los rostros generados por el sampler sin entrenar mantienen calidad de media resolución y pueden salir distorsionados.
- Restricción territorial severa: el uso y la redistribución solo están permitidos fuera de la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos de América.
- Uso comercial limitado: superar los 20 millones de dólares de ingresos anuales requiere autorización escrita de MiniMax.
- Prohibición de suplantación de identidad y obligación de divulgar que la salida es generada por máquina.
- Licencia derivada de la MiniMax H3 Community License; conviene revisar `LICENSE` y `NOTICE` antes de cualquier despliegue.
- No es un release oficial de los autores del artículo, sino un port independiente; posibles divergencias respecto al método original.
- Sesgos conocidos: no disponibles, aunque el dataset de entrenamiento (fotografías de personas de Pexels e imágenes isométricas) puede introducir sesgos de representación.
- Riesgo de alucinación y artefactos visuales: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Para producción: al no haber resultados de calidad ni benchmarks, no se recomienda su uso en entornos productivos en el estado actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johndpope/MiniMax-H3-MPEG-Diffusion
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Artículo MPEG-Diffusion: https://arxiv.org/abs/2611.12069
- Código, sampler y pipeline de entrenamiento: https://github.com/scrya-com/mpeg-diffusion
- Issue de seguimiento del entrenamiento: https://github.com/scrya-com/mpeg-diffusion/issues/2
- Embeddings de caption precalculados: https://huggingface.co/datasets/johndpope/MiniMax-H3-pexels-people-text
- Artículo divulgativo: https://scrya.com/mpeg_diffusion
- Adaptadores Level-of-Token previos: https://huggingface.co/johndpope/MiniMax-H3-LoT
