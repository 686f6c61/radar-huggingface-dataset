# SAIFIINDUSTRIES/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje denso de 1,78 mil millones de parámetros (1.777.088.000 según los pesos safetensors) perteneciente a la familia de destilados de DeepSeek-R1. DeepSeek AI partió del modelo base Qwen2.5-1.5B y lo ajustó con datos de razonamiento generados por su modelo profesor DeepSeek-R1, con el objetivo de trasladar capacidades de cadena de pensamiento larga a un tamano que quepa en hardware de consumo.

La ficha analizada aquí corresponde a una réplica publicada por el usuario SAIFIINDUSTRIES en Hugging Face, con licencia MIT, 0 descargas y 0 likes en el momento de la consulta, y 3,6 GB de pesos en formato safetensors bajo la arquitectura qwen2.

Su relevancia actual radica en que demuestra que los patrones de razonamiento de un modelo de escala frontera pueden destilarse en redes densas pequenas: la propia model card afirma que estos destilados superan a los patrones de razonamiento que se obtienen aplicando aprendizaje por refuerzo directamente sobre modelos pequenos, y que el destilado de 32B supera a OpenAI-o1-mini en varios benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (base Qwen2.5-1.5B) |
| Parámetros totales | 1.777.088.000 (≈1,78 mil millones) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada (el repositorio solo distribuye safetensors) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |
| Tamaño del repositorio | 3,6 GB |
| Fecha de creación del repositorio | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, concretamente un ajuste fino de Qwen2.5-1.5B, tal y como indican la etiqueta `qwen2` del repositorio y la model card, que menciona los checkpoints destilados de 1.5B, 7B, 8B, 14B, 32B y 70B basados en las series Qwen2.5 y Llama3. No se trata por tanto de una arquitectura Mixture of Experts ni de un modelo híbrido, sino de una red densa convencional.

El entrenamiento del modelo profesor DeepSeek-R1 se realizó con aprendizaje por refuerzo a gran escala. La variante R1-Zero se entrenó únicamente con RL, sin ajuste supervisado previo, y desarrollo comportamientos emergentes de autoverificación, reflexión y cadenas de pensamiento largas, aunque con problemas de repetición infinita, baja legibilidad y mezcla de idiomas. DeepSeek-R1 anade datos de arranque en frío antes del RL y emplea un pipeline con dos etapas de RL y dos etapas de SFT. Los modelos destilados, entre ellos este de 1.5B, se obtuvieron ajustando fino modelos densos con los datos de razonamiento generados por DeepSeek-R1; la model card no especifica el volumen de tokens ni la composición exacta del conjunto de destilación.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Razonamiento paso a paso: el modelo produce cadenas de pensamiento largas antes de la respuesta final, herencia directa del proceso de destilación.
- Resolución de problemas matemáticos y de lógica elemental, dentro de las limitaciones de su tamano.
- Generación y explicación de código en tareas de complejidad baja o media.
- Autoverificación y reflexión sobre los propios pasos intermedios, comportamiento emergente documentado en la familia R1.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; la model card del modelo profesor menciona la mezcla de idiomas como uno de los problemas detectados en R1-Zero.
- Capacidades de visión o audio: no disponibles; el repositorio declara únicamente pipeline de text-generation.

## Casos de uso

- Razonamiento en local y en el borde: con 1,78 mil millones de parámetros, el modelo puede ejecutarse en portátiles con GPU de gama media o incluso en CPU mediante cuantización, lo que permite desplegar razonamiento tipo cadena de pensamiento sin enviar datos a la nube.
- Tutor de matemáticas con traza visible: el modelo expone su cadena de razonamiento, de modo que un estudiante o un sistema de corrección puede revisar los pasos intermedios y no solo el resultado final.
- Asistente de código en entornos con VRAM limitada: resulta adecuado para autocompletado, explicación de fragmentos y generación de funciones sencillas dentro de IDE o pipelines de integración continua donde no cabe un modelo de 7B o superior.
- Prototipado de investigación sobre destilación: sirve como referencia para estudiar cómo se transfieren los patrones de razonamiento de un modelo grande a una red densa pequena, replicando el experimento con presupuesto de cómputo reducido.
- Clasificación y extracción con justificación: al generar una cadena de pensamiento previa a la etiqueta, permite auditar por qué el modelo asignó una categoría a un texto, útil en triaje de tickets o moderación asistida.
- Chatbot embebido en aplicaciones de escritorio o móviles: su tamano reducido permite empaquetarlo junto a una aplicación sin depender de una API externa, con la licencia MIT como única restricción relevante.
- Generación de borradores y resúmenes en entornos sin conectividad: al poder ejecutarse sin conexión, encaja en escenarios de campo, sanidad o industria donde no está garantizado el acceso a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una referencia a una figura de benchmarks (`figures/benchmark.jpg`) y al artículo arXiv:2501.12948, pero el texto proporcionado no reproduce ninguna tabla numérica para el checkpoint de 1.5B. La única afirmación cuantitativa presente es que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks, dato que no es extrapolable a la variante de 1.5B.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros declarado (1.777.088.000) y no proceden de la información proporcionada por el autor.

- Inferencia en FP16/BF16: alrededor de 3,6 GB solo para los pesos, más la caché KV; en la práctica conviene reservar entre 5 y 6 GB de VRAM.
- Inferencia en INT8: aproximadamente 1,8 GB de pesos, con un total de unos 3 GB de VRAM.
- Inferencia en INT4 (por ejemplo Q4_K_M en llama.cpp): alrededor de 1,1 GB de pesos, ejecutable con unos 2 GB de memoria, lo que lo hace viable en iGPU, mini-PC y algunos dispositivos móviles.
- GPU de gama alta: A100, H100 o RTX 4090 no son necesarias; el modelo queda ampliamente sobredimensionado para ellas y solo tendrían sentido para servir muchas peticiones concurrentes.
- GPU de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4060, RTX 4070, e incluso en tarjetas de 4 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (declarado como tag), vLLM, llama.cpp, Ollama y servidores compatibles con endpoints de OpenAI, según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este repositorio) | 1,78 mil millones | no disponible | MIT | Réplica subida por un tercero, 0 descargas |
| DeepSeek-R1-Distill-Qwen-7B | no disponible en la información proporcionada | no disponible | MIT según la familia R1 | Mismo proceso de destilación, mayor coste de cómputo |
| Qwen2.5-1.5B-Instruct | no disponible en la información proporcionada | no disponible | Apache 2.0 | Modelo base del que parte este destilado, sin entrenamiento específico de razonamiento |
| Llama-3.2-1B-Instruct | no disponible en la información proporcionada | no disponible | Llama 3.2 Community License | Alternativa de tamano similar, con licencia más restrictiva que MIT |

Los datos de los modelos comparados no provienen de la información proporcionada en esta ficha y deben verificarse en sus repositorios oficiales antes de tomar decisiones de producción.

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier modelo de 1,5B, tiende a inventar datos, especialmente en matemáticas y en preguntas factuales con poca información de contexto.
- Repetición y bucles: la cadena de pensamiento larga heredada de R1 puede degenerar en repeticiones, un problema documentado explícitamente en la model card para R1-Zero.
- Mezcla de idiomas: la model card del profesor senala la mezcla de idiomas como una de las deficiencias del entrenamiento puramente con RL, mitigada parcialmente con datos de arranque en frío pero no necesariamente eliminada en los destilados.
- Cobertura idiomática no documentada: el repositorio no declara idiomas soportados, por lo que el comportamiento en castellano debe validarse empíricamente antes de usarlo en producción.
- Longitud de contexto no documentada: no se puede planificar un caso de uso con ventanas largas sin confirmar este dato en el `config.json` del repositorio.
- Sesgos: no se ha publicado ninguna evaluación de sesgos ni de seguridad para este checkpoint en la información disponible.
- Confusión entre modelo y repositorio: la model card incluida es la de DeepSeek-R1 en su conjunto y no describe específicamente el checkpoint de 1.5B, por lo que parte de la información (parametría, contexto, benchmarks) no aplica a este fichero.
- Procedencia: se trata de una réplica publicada por un tercero (SAIFIINDUSTRIES) y no del repositorio oficial `deepseek-ai`. La fecha de creación declarada, 2026-09-16, es posterior a la publicación original del modelo, lo que refuerza la recomendación de verificar la integridad de los pesos antes de usarlos.
- Licencia: MIT permite uso comercial, modificación y redistribución, pero no ofrece garantías ni soporte por parte del autor original.
- Idoneidad: el tamano de 1,5B limita el rendimiento en razonamiento complejo y en tareas de varios pasos; para cargas exigentes conviene escalar a los destilados de 7B, 14B o 32B.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SAIFIINDUSTRIES/DeepSeek-R1-Distill-Qwen-1.5B
- Artículo de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Repositorio oficial de DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- PDF del artículo enlazado desde la model card: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Licencia del proyecto en GitHub: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Organización oficial en Hugging Face: https://huggingface.co/deepseek-ai
- Sitio web de DeepSeek: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/

Nota: las búsquedas web realizadas no devolvieron enlaces relevantes sobre el modelo; los resultados obtenidos correspondían a foros sin relación con DeepSeek-R1.
