# OQ-J/MIRAGE

## Resumen

MIRAGE es un modelo de generación de imágenes condicionada por texto desarrollado por el usuario OQ-J y publicado en Hugging Face. Se trata de un modelo de difusión con arquitectura híbrida que combina bloques de self-attention sobre latentes de imagen, cross-attention texto-imagen y bloques SwiGLU, con un ancho de imagen de 2048 y FFN de 8192. El modelo utiliza el VAE de FLUX.2 para codificar y decodificar imágenes y los embeddings de texto de Qwen3-Embedding-0.6B como condicionamiento.

La relevancia de este modelo es limitada en su estado actual: el propio autor advierte en la model card que la versión disponible en Hugging Face produce resultados insatisfactorios. No se han publicado datos de benchmarks, licencia, idiomas soportados ni pipeline de inferencia, y el repositorio cuenta con cero descargas en el momento de la consulta.

Se trata, por tanto, de un experimento de arquitectura más que de un modelo listo para producción. La ficha documenta lo que se conoce técnicamente de la arquitectura, pero muchas especificaciones habituales (licencia, cuantizaciones, contexto) no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión con bloques de self-attention de imagen, cross-attention texto-imagen y SwiGLU de imagen |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (estados de token de texto de 1024 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card consta de 20 bloques que combinan self-attention sobre la imagen, cross-attention entre texto e imagen y SwiGLU sobre la imagen. El ancho de imagen es de 2048 y el ancho de la FFN de 8192, con 16 cabezas de atención de dimensión 128. El condicionamiento textual utiliza estados de token de 1024 dimensiones completos, dos bloques TextAdapter y ocho registros de prefijo. Además, incorpora AttnRes por rama y latentes empaquetados con factor /16 y 128 canales.

El texto se codifica con Qwen3-Embedding-0.6B y las imágenes se codifican y decodifican con el VAE de FLUX.2. La configuración de inferencia recomendada por el autor es muestreo Euler, 40 pasos y CFG=4. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Condicionamiento textual de alta dimensionalidad mediante estados de token de 1024 dimensiones.
- Codificación y decodificación de imágenes con el VAE de FLUX.2.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Exploración de arquitecturas de difusión: el modelo sirve como referencia para investigadores que quieran estudiar la combinación de self-attention de imagen con cross-attention textual y bloques SwiGLU en un pipeline de difusión.
- Investigación sobre adaptadores de texto: los dos bloques TextAdapter y los ocho registros de prefijo permiten experimentar con distintas formas de inyectar condicionamiento textual de 1024 dimensiones.
- Pruebas de integración con el VAE de FLUX.2: útil para validar pipelines que reutilicen el codificador y decodificador de FLUX.2 con otros backbones de difusión.
- Estudio de AttnRes por rama: la arquitectura incorpora esta variante de atención que puede analizarse en entornos de investigación.
- Reproducción de experimentos: dado que el autor publica el código en GitHub, el modelo puede emplearse para reproducir y depurar la configuración de entrenamiento e inferencia descrita.
- Docencia y formación: como ejemplo didáctico de arquitectura híbrida de difusión con condicionamiento textual, aunque no es apto para demostraciones de calidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el número de parámetros totales no se ha publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a difusión).
- Latencia y throughput estimados: no disponible; la configuración recomendada es de 40 pasos con CFG=4, lo que implica un coste de inferencia relativamente alto por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIRAGE (OQ-J) | no disponible | no disponible | no publicado; el autor indica resultados insatisfactorios | no disponible | Hugging Face y GitHub |
| FLUX.2 (referencia de VAE) | no disponible en la información proporcionada | no aplica | no disponible | no disponible | no disponible |
| Qwen3-Embedding-0.6B (referencia de texto) | 0,6 mil millones | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor advierte que la versión publicada en Hugging Face produce resultados insatisfactorios; no debe usarse en producción.
- No se ha publicado licencia, por lo que el uso comercial queda sin regularizar y no puede asumirse permitido.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre riesgos de alucinación visual.
- Se desconoce el soporte multilingüe del condicionamiento textual.
- No se han publicado benchmarks ni evaluaciones cuantitativas de calidad de imagen.
- El repositorio tiene cero descargas y un único "me gusta", lo que indica ausencia de validación por parte de la comunidad.
- La configuración de inferencia (Euler, 40 pasos, CFG=4) es la única referencia disponible; no se documentan alternativas ni tolerancias.

## Enlaces

- Hugging Face: https://huggingface.co/OQ-J/MIRAGE
- GitHub: https://github.com/OQ-J/MIRAGE
