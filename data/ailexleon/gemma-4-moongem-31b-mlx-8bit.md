# ailexleon/Gemma-4-MoonGem-31B-mlx-8Bit

## Resumen

El modelo ailexleon/Gemma-4-MoonGem-31B-mlx-8Bit es una conversión al formato MLX del modelo Ateron/Gemma-4-MoonGem-31B, realizada por el usuario ailexleon. Se trata de un modelo de generación de texto con 30.697.345.280 parámetros (~30,7 mil millones), cuantizado a 8 bits, orientado a escritura creativa, roleplay, conversación y storytelling. La conversión se llevó a cabo con la herramienta mlx-lm en su versión 0.31.3, y el resultado está publicado bajo licencia Apache 2.0.

El modelo base pertenece a la familia Gemma 4, aunque en la información disponible no se detallan las especificaciones técnicas de su arquitectura ni el proceso de entrenamiento. La cuantización a 8 bits reduce el tamaño de los pesos a aproximadamente 30,7 GB, lo que permite su ejecución en dispositivos Apple Silicon con memoria unificada suficiente. El uso previsto es la inferencia local mediante el framework MLX, con soporte exclusivo para el idioma inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (basado en la familia Gemma 4, sin especificación en la información disponible) |
| Parámetros totales | 30.697.345.280 (~30,7 mil millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 8-bit (cuantización de 8 bits) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura ni el proceso de entrenamiento del modelo. La ficha indica que es una conversión directa del modelo Ateron/Gemma-4-MoonGem-31B al formato MLX, realizada con la herramienta mlx-lm en su versión 0.31.3. El nombre sugiere que se basa en la arquitectura de la familia Gemma 4, pero no se han publicado especificaciones sobre el número de capas, el tipo de atención, los datos de entrenamiento ni técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto para escritura creativa, incluyendo narrativa de ficción y storytelling.
- Soporte de roleplay y conversación con personajes (character-rp).
- Conversaciones multi-turno de carácter conversacional.
- Generación de texto en inglés.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni razonamiento matemático avanzado en la información disponible.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede generar relatos, descripciones de escenas y diálogos, aprovechando su especialización en storytelling.
- Juegos de rol por texto: adecuado para simular personajes y mantener conversaciones coherentes en entornos de rol.
- Asistentes de conversación para entretenimiento: puede sostener diálogos largos en inglés con tono natural.
- Creación de contenido para videojuegos: generación de diálogos de personajes no jugadores (NPC) en inglés.
- Prototipado de novelas interactivas: permite generar ramificaciones narrativas y mantener coherencia en historias ramificadas.
- Generación de contenido para redes sociales: textos narrativos o conversacionales en inglés, aunque sin verificación de calidad ni moderación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon mediante el framework MLX.
- La versión 8-bit requiere aproximadamente 31 GB de memoria unificada para los pesos (30,7 GB de parámetros a 1 byte por peso), más memoria adicional para el contexto y las activaciones.
- Se recomienda un Mac con al menos 32 GB de RAM unificada; para mayor margen, 64 GB o superior.
- No es compatible directamente con CUDA; para ejecutarlo en GPU NVIDIA sería necesario convertir los pesos a otro formato (por ejemplo, GGUF) o usar el modelo original sin cuantizar.
- Opciones de despliegue: mlx-lm (Python), incluida la función `load` y `generate` para inferencia local. No se han documentado otras opciones en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ailexleon/Gemma-4-MoonGem-31B-mlx-8Bit | 30.697.345.280 | no disponible | MLX 8-bit | Apache 2.0 | HuggingFace |
| ailexleon/Gemma-4-Harmonia-31B-mlx-8Bit | no disponible | no disponible | MLX 8-bit | Apache 2.0 | HuggingFace |
| Ateron/Gemma-4-MoonGem-31B (modelo base) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

Nota: el modelo base y el modelo Harmonia comparten autoría y estructura de conversión, pero no se han publicado especificaciones completas en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se han publicado análisis de sesgos en la información disponible.
- Riesgo de alucinación: al ser un modelo de generación de texto, puede producir contenido ficticio o incorrecto; no se han realizado evaluaciones de fiabilidad.
- Limitaciones de idioma: solo soporta inglés; no funciona en castellano ni otros idiomas.
- Contexto: la longitud de contexto no está especificada, por lo que no se puede garantizar un rendimiento óptimo en conversaciones muy largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, sin restricciones de uso significativas.
- Caveat de despliegue: la conversión MLX limita el uso a dispositivos Apple Silicon; no es un modelo universal para cualquier GPU.
- El modelo es un fine-tune orientado a roleplay y escritura creativa; puede no ser adecuado para tareas técnicas, de razonamiento o de código.

## Enlaces

- HuggingFace: https://huggingface.co/ailexleon/Gemma-4-MoonGem-31B-mlx-8Bit
- Modelo base: https://huggingface.co/Ateron/Gemma-4-MoonGem-31B
- Modelo similar del mismo autor: https://huggingface.co/ailexleon/Gemma-4-Harmonia-31B-mlx-8Bit
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
