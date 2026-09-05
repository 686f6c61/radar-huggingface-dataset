# hermitdave/K2-Horizon-7B-MLX-6bit

## Resumen

El modelo K2-Horizon-7B-MLX-6bit es una conversión cuantizada a MLX 6-bit del modelo IFM/K2-Horizon-7B, desarrollado por el equipo IFM. Se trata de un modelo de razonamiento denso, con arquitectura transformer decoder-only, diseñado para tareas de razonamiento, generación de código, uso agéntico y análisis de contexto largo. Su longitud de contexto alcanza los 512K tokens, lo que lo sitúa en la categoría de modelos de contexto muy amplio.

Esta conversión, publicada por hermitdave, está optimizada para Apple Silicon mediante la librería mlx-lm, lo que permite ejecutar el modelo en dispositivos Mac con memoria unificada. El modelo base se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en proyectos de investigación.

La relevancia de este modelo radica en su combinación de tamaño compacto (7B parámetros nominales, aunque el conteo real de pesos es de 8.999.178.240) y resultados notables en benchmarks agénticos y de razonamiento, como SWE-bench Verified (70.6) o HMMT Feb 2026 (73.3), todo ello con un nivel de transparencia alto al publicar datos de entrenamiento y código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo denso) |
| Parámetros totales | 8.999.178.240 (aprox. 9.0B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512K tokens (según documentación de IFM/K2-Horizon-7B) |
| Tipos de cuantización | MLX 6-bit (la familia MLX incluye oQ4e, 4-bit, oQ6e, 8-bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, IFM/K2-Horizon-7B, emplea una arquitectura transformer decoder-only densa, sin mezcla de expertos. Según la información disponible, se trata de un modelo de razonamiento que incorpora un modo de razonamiento explícito controlado mediante el parámetro `reasoning_effort`, que debe configurarse en alto para obtener los mejores resultados.

No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO. El equipo IFM publicó checkpoints intermedios, receta de entrenamiento y código, lo que indica un alto nivel de transparencia, pero estos datos no están disponibles en la información de esta ficha. La conversión a MLX 6-bit se realizó con mlx-lm y oMLX, y no introduce cambios en la arquitectura.

## Capacidades

- Generación de texto y razonamiento: modelo de razonamiento con soporte de `reasoning_effort`, lo que permite controlar la profundidad del razonamiento.
- Ingeniería de software: obtiene 70.6 en SWE-bench Verified, lo que indica capacidad para resolver tareas reales de desarrollo de software.
- Uso agéntico: puntuaciones de 39.06 en Terminal-Bench 2.1 y 59.0 en BrowseComp sugieren que puede operar en entornos de terminal y navegación web.
- Matemáticas: 73.3 en HMMT Feb 2026, un benchmark de competición matemática.
- Contexto largo: ventana de 512K tokens, adecuada para documentos extensos, repositorios de código y conversaciones largas.
- Conversación: pipeline text-generation y etiqueta conversational, apto para diálogo multi-turno.

## Casos de uso

- Asistente de desarrollo de software: el modelo puede integrarse en entornos de desarrollo para resolver issues, generar parches y refactorizar código, aprovechando su rendimiento en SWE-bench Verified.
- Agentes autónomos en terminal: gracias a su puntuación en Terminal-Bench, puede ejecutar comandos, gestionar procesos y automatizar tareas de administración de sistemas.
- Navegación web y búsqueda: con BrowseComp 59.0, puede utilizarse en agentes que navegan por páginas web, extraen información y completan tareas de búsqueda complejas.
- Análisis de documentos largos: la ventana de 512K tokens permite procesar contratos, informes técnicos o bases de conocimiento completas sin necesidad de dividir el texto.
- Tutoría matemática y científica: su rendimiento en HMMT lo hace adecuado para resolver problemas matemáticos avanzados y explicar razonamientos paso a paso.
- Despliegue local en Apple Silicon: al ser una conversión MLX, puede ejecutarse en Mac con memoria unificada para aplicaciones de chat privadas, sin depender de servicios en la nube.
- Investigación en razonamiento: al publicar datos de entrenamiento y código, es útil para estudiar técnicas de razonamiento y comparar con otros modelos abiertos.

## Benchmarks y rendimiento

| Benchmark | K2-Horizon-7B (base) |
|---|---|
| SWE-bench Verified | 70.6 |
| Terminal-Bench 2.1 | 39.06 |
| tau3-Banking | 25.8 |
| BrowseComp | 59.0 |
| HMMT Feb 2026 | 73.3 |

Los resultados corresponden al modelo base IFM/K2-Horizon-7B, no a la conversión MLX 6-bit. La cuantización puede afectar ligeramente el rendimiento. No se han publicado resultados de benchmarks en la información disponible para la variante MLX 6-bit.

## Requisitos de hardware

- Memoria unificada estimada: ~7 GB para el modelo 6-bit; se recomienda al menos 16 GB de RAM para contextos largos.
- GPU: Apple Silicon (M1, M2, M3, M4). No se han proporcionado requisitos para GPU NVIDIA o AMD.
- Despliegue: mlx_lm (generación y servidor OpenAI-compatible). No se documentan vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-7B-MLX-6bit | 8.999.178.240 | 512K tokens | Apache-2.0 | HuggingFace (MLX) |
| Llama-3.1-8B | 8.000.000.000 | 128K tokens | Llama Community License | HuggingFace |
| Qwen2.5-7B | 7.000.000.000 | 128K tokens | Apache-2.0 | HuggingFace |

Los datos de rendimiento de Llama-3.1-8B y Qwen2.5-7B no están disponibles en la información proporcionada, por lo que no se incluye comparativa de benchmarks.

## Limitaciones y advertencias

- Idiomas soportados: no especificados; es probable que el modelo esté optimizado principalmente para inglés, dado que los benchmarks son en ese idioma.
- Sesgos: no se han publicado evaluaciones de sesgo en la información disponible.
- Alucinación: como modelo de razonamiento, puede generar razonamientos plausibles pero incorrectos, especialmente en dominios fuera de su entrenamiento.
- Cuantización: la variante 6-bit puede presentar una ligera pérdida de calidad frente al modelo base; la variante 8-bit se describe como "near-lossless".
- Uso de `reasoning_effort`: el model card recomienda usar `reasoning_effort="high"` para obtener los mejores resultados; si se omite, el rendimiento puede degradarse.
- Tool calling: no se ha confirmado soporte de function calling en la documentación disponible.
- Contexto: aunque la ventana es de 512K tokens, el rendimiento con contextos muy largos puede depender del hardware y de la implementación.

## Enlaces

- HuggingFace: https://huggingface.co/hermitdave/K2-Horizon-7B-MLX-6bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Blog de IFM: https://ifm.ai/blog/k2/
- Colección K2-Horizon: https://huggingface.co/collections/abenzerps/k2-horizon
- Benchgen: https://benchgen.com/models/ifm/k2-horizon-7b
