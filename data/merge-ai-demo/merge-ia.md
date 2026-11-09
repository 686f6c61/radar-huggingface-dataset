# Merge-ai-demo/merge-ia

## Resumen

Merge-ai-demo/merge-ia es una redistribución del modelo instructivo google/gemma-4-26B-A4B-it, publicada por el equipo de Merge, una aplicación de escritorio gratuita para macOS orientada al estudio y la revisión a partir de apuntes propios (fichas, tarjetas y cuestionarios). El modelo no ha sido reentrenado ni ajustado: los pesos originales se han reorganizado al formato propietario turbo-fieldfare, el motor de inferencia que utiliza la aplicación Merge, con el objetivo de que el modelo quepa y funcione en un Mac con 8 GB de memoria unificada.

Se trata, por tanto, de un artefacto de distribución más que de un modelo nuevo. La relevancia radica en su enfoque on-device: la inferencia se ejecuta íntegramente en el ordenador del usuario, sin enviar los materiales de estudio a ningún servidor, lo que responde a requisitos de privacidad en contextos educativos. El repositorio incluye los pesos troceados para actualizaciones, un archivo comprimido único para la primera instalación y un manifiesto JSON con tamaños y huellas SHA-256 que la aplicación verifica.

La información pública disponible es escasa: no se detallan parámetros activos, longitud de contexto, composición del dataset ni resultados de benchmarks. La model card indica explícitamente que el modelo no fue reentrenado y que la única modificación es el cambio de formato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-26B-A4B-it); no se detalla en la información disponible |
| Parámetros totales | 26B (según el identificador del modelo base); no confirmado en la model card |
| Parámetros activos | no disponible (el identificador "A4B" sugiere una arquitectura MoE, pero no se especifica en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (parte de mlx-community/gemma-4-26b-a4b-it-4bit); formato propietario turbo-fieldfare |
| Idiomas soportados | francés (etiqueta `fr`); el modelo base es multilingüe, pero la model card solo declara francés |
| Licencia | Apache 2.0 |
| Formato de pesos | turbo-fieldfare (`.gturbo`), tanto en directorio troceado como en archivo ZIP único |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base google/gemma-4-26B-A4B-it, un modelo instructivo de Google. La model card de esta redistribución no aporta detalles sobre la arquitectura interna (número de capas, dimensiones, mecanismo de atención, posible mezcla de expertos) ni sobre el proceso de entrenamiento original, por lo que estos datos deben consultarse en la documentación del modelo base.

La única modificación documentada es la reorganización de los pesos al formato turbo-fieldfare, el motor que ejecuta la inferencia dentro de la aplicación Merge. Según el autor, los pesos no han sido reentrenados. El punto de partida es la versión cuantizada a 4 bits publicada por mlx-community, lo que implica que la precisión efectiva de los pesos es de 4 bits y que el proceso de cuantización original corresponde a la comunidad MLX, no a este repositorio. No se documentan fases de RLHF, DPO ni ajuste adicional en esta publicación.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo instructivo de Google.
- Generación de material de estudio: fichas, tarjetas de repaso y cuestionarios a partir de apuntes del usuario, que es el caso de uso declarado por la aplicación Merge.
- Ejecución local completa: la inferencia se realiza en el dispositivo sin envío de datos a servidores externos.
- Soporte multilingüe potencial heredado del modelo base; la model card solo declara francés.
- Tool calling, function calling, modo thinking, visión o audio: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Repaso académico con apuntes propios: la aplicación Merge utiliza el modelo para transformar fichas y documentos del estudiante en tarjetas y cuestionarios, ejecutándose en local para no exponer el material a servicios en la nube.
- Estudio en entornos con conectividad limitada: al funcionar íntegramente offline, el modelo permite generar material de repaso sin conexión a Internet.
- Contextos con requisitos de privacidad: estudiantes o instituciones que no pueden subir apuntes a servicios externos pueden usar el modelo en su propio Mac, con la garantía de que ningún contenido sale del equipo.
- Equipos con hardware modesto: el formato turbo-fieldfare está diseñado para que el modelo funcione en un Mac con 8 GB de memoria unificada, lo que amplía el acceso a equipos de gama de entrada.
- Distribución automatizada de modelos: el manifiesto JSON con tamaños y hashes SHA-256 permite a la aplicación verificar la integridad de las actualizaciones, un patrón reutilizable en pipelines de distribución de modelos on-device.
- Integración en aplicaciones de escritorio: desarrolladores que construyan herramientas educativas para macOS pueden estudiar el empaquetado (directorio troceado más ZIP de primera instalación) como referencia para distribuir modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el autor indica que el modelo está preparado para funcionar en un Mac con 8 GB de memoria; no se especifica el consumo exacto.
- GPU recomendadas: no disponible. El formato turbo-fieldfare está orientado a Mac con memoria unificada (Apple Silicon); no se documenta soporte para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no confirmada. El requisito declarado es un Mac de 8 GB, sin detallar el chip mínimo.
- Opciones de despliegue: el motor propietario turbo-fieldfare integrado en la aplicación Merge. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Merge-ai-demo/merge-ia | 26B (según modelo base) | no disponible | turbo-fieldfare | Apache 2.0 | Hugging Face, uso vía app Merge |
| google/gemma-4-26B-A4B-it | 26B | no disponible en esta ficha | safetensors (formato original) | según modelo base | Hugging Face |
| mlx-community/gemma-4-26b-a4b-it-4bit | 26B | no disponible en esta ficha | MLX, 4 bits | según modelo base | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento que permitan contrastarlo con alternativas de otros desarrolladores. No disponible para modelos comparables de otros fabricantes.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos no han sido reentrenados; cualquier limitación del modelo base google/gemma-4-26B-A4B-it se hereda íntegramente.
- La cuantización a 4 bits puede degradar la calidad respecto a los pesos en precisión completa; no se documenta la magnitud de esa pérdida.
- La model card solo declara francés; el rendimiento en castellano u otros idiomas no está verificado en esta publicación.
- Riesgo de alucinación inherente a los modelos generativos, especialmente relevante en contenido educativo donde los errores pueden propagarse al material de estudio.
- Formato propietario: los pesos en turbo-fieldfare no son directamente utilizables con herramientas estándar (vLLM, llama.cpp, transformers) sin conversión, y no se documenta un script de conversión.
- Dependencia de la aplicación Merge: el autor indica que la app instala y actualiza el modelo automáticamente; el uso fuera de ella requiere ingeniería inversa del formato.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base de Google, que pueden incluir términos adicionales de uso aceptable.
- Repositorio con cero descargas y cero likes en el momento de la consulta; sin validación comunitaria independiente.
- El tamaño del repositorio (28,6 GB) incluye tanto el directorio troceado como el ZIP de primera instalación, lo que duplica el almacenamiento necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Merge-ai-demo/merge-ia
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Versión 4 bits de MLX: https://huggingface.co/mlx-community/gemma-4-26b-a4b-it-4bit
- Repositorio de la aplicación: https://github.com/Merge-ai-demo/merge
- Perfil del autor en GitHub: https://github.com/Merge-ai-demo
