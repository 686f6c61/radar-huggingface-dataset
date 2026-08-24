# mradermacher/Dark-Scarlett-v1.0-26B-A4B-GGUF

## Resumen
Dark-Scarlett-v1.0-26B-A4B es un modelo de lenguaje de gran tamaño publicado originalmente por el usuario ReadyArt en Hugging Face. El repositorio aquí analizado es una cuantización GGUF del mismo, preparada por mradermacher, un proveedor conocido de formatos optimizados para inferencia en CPU y GPU. El nombre sugiere una arquitectura de tipo mezcla de expertos (MoE) con 26 000 millones de parámetros totales y 4 000 millones activos por token, aunque no se dispone de documentación oficial que lo confirme.

La versión GGUF permite su despliegue en entornos locales con herramientas como llama.cpp, Ollama o vLLM, reduciendo los requisitos de memoria frente a los pesos completos. El repositorio tiene un tamaño de solo 2.0 GB, lo que indica cuantizaciones de baja precisión, y se ha publicado sin información sobre licencia, idiomas o capacidades específicas.

Aunque la ficha carece de datos técnicos detallados, el modelo se presenta como una opción ligera para ejecución en hardware de consumo. No obstante, su utilidad real solo puede evaluarse tras pruebas directas, dado que no se han publicado especificaciones ni benchmarks.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere MoE, sin confirmar) |
| Parámetros totales | 572 794 416 (según archivo safetensors del repo; inconsistente con la denominación 26B) |
| Parámetros activos | No disponible (probablemente 4B según el nombre, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No especificados en la model card (el repositorio contiene varios archivos GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de información oficial sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización aplicadas. El nombre "26B-A4B" sugiere una configuración de mezcla de expertos con 26 000 millones de parámetros totales y 4 000 millones activos por token, pero no hay confirmación en la documentación del repositorio. El archivo de safetensors muestra 572 794 416 parámetros, una cifra muy inferior a la esperada para un modelo de 26B, lo que podría indicar que se trata de un archivo parcial o de un subcomponente (por ejemplo, el tokenizador o el modelo de base sin los pesos completos). La cuantización GGUF ha sido realizada por mradersacher, un proveedor externo que no aporta detalles sobre el modelo original.

## Capacidades
No se han documentado capacidades específicas del modelo. Dado que se trata de un modelo de texto de gran tamaño, es probable que pueda realizar generación de texto, razonamiento y quizás tareas de código, pero sin datos concretos no se pueden confirmar. Tampoco se sabe si soporta tool calling, agentes o modo de pensamiento. Se recomienda probar el modelo directamente para evaluar sus habilidades reales.

## Casos de uso
No se dispone de información sobre casos de uso validados. Sin embargo, por su tamaño y formato, podría emplearse en los siguientes escenarios hipotéticos, aunque sin garantías:

- **Generación de texto creativo**: como modelo de 26B, podría servir para redactar historias, guiones o contenido narrativo, pero no hay evidencia de su calidad.
- **Asistente de conversación**: podría implementarse en chatbots locales con herramientas como Ollama, pero se desconoce su capacidad de seguir instrucciones.
- **Análisis de documentos**: si su contexto es suficiente, podría resumir o extraer información de textos largos, aunque no se conoce la longitud de contexto.
- **Generación de código**: si su entrenamiento incluye código, podría ayudar en autocompletado o explicación, pero no hay datos.
- **Prototipado rápido**: dado que su tamaño de cuantización es pequeño (2 GB), puede ser útil para experimentos en hardware modesto, aunque sin información de rendimiento real.
- **Investigación académica**: para comparar arquitecturas MoE cuantizadas, podría servir como referencia, pero carece de documentación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se puede comparar con otros modelos de manera objetiva.

## Requisitos de hardware
- **VRAM estimada**: No disponible. El tamaño del repositorio (2 GB) sugiere cuantizaciones de baja precisión, pero la VRAM necesaria depende de la arquitectura exacta y del número de parámetros activos. Para un modelo MoE de 26B totales con 4B activos, la inferencia puede requerir cargar todos los pesos (hasta 26B) en memoria, aunque la activación sea parcial. Con cuantización 4-bit, podría necesitarse alrededor de 13-15 GB de VRAM, pero no se confirma.
- **GPU recomendadas**: No hay recomendaciones oficiales. Para cuantizaciones GGUF, se pueden usar GPU con 8 GB o más, como RTX 3060, RTX 4060, etc., pero la velocidad dependerá del número de activos.
- **Cabe en GPU de consumo**: Probablemente sí, dado el tamaño del repositorio, pero no se garantiza.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM, TGI (si el formato es compatible). No hay documentación específica.
- **Latencia y throughput**: No se conoce.

## Comparativa con modelos similares
No se dispone de información suficiente para comparar con otros modelos. No se pueden identificar alternativas fiables sin conocer la arquitectura base y el entrenamiento.

## Limitaciones y advertencias
- **Sesgos y alucinaciones**: Al no tener información sobre el entrenamiento, se desconoce si el modelo presenta sesgos o tiende a alucinar. Se recomienda no usarlo en producción sin pruebas rigurosas.
- **Licencia**: La licencia no está disponible, por lo que no se garantiza el uso comercial ni la redistribución.
- **Contexto**: Se desconoce la longitud de contexto máxima; puede ser limitada.
- **Idiomas**: No se especifican idiomas soportados; podría tener un rendimiento desigual en lenguas distintas del inglés.
- **Origen del modelo**: El repositorio original no ofrece documentación técnica; el modelo puede contener errores o inconsistencias en su arquitectura.
- **Para producción**: No se recomienda su uso en aplicaciones críticas sin pruebas exhaustivas.

## Enlaces
- [Repositorio GGUF en Hugging Face](https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-26B-A4B-GGUF)
- [Modelo original de ReadyArt](https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B)
- [Perfil de mradermacher en Hugging Face](https://huggingface.co/mradermacher)
