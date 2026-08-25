# AMAImedia/NOESIS-Qwopus3.5-9B-Coder-v3.5-BF16

## Resumen

NOESIS-Qwopus3.5-9B-Coder-v3.5-BF16 es un modelo de generación de texto especializado en tareas de programación, publicado por AMAImedia como parte de la plataforma NOESIS de doblaje profesional multilingüe. El nombre sugiere que se trata de una adaptación de la serie Qwen3.5, aunque la model card no confirma explícitamente la arquitectura base. El modelo cuenta con 8.953.803.264 parámetros (~9B) y se distribuye en formato BF16, junto con un archivo GGUF Q4_K_M para despliegue local con llama.cpp. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

El modelo está orientado a tareas de generación de código, transformación, depuración y asistencia técnica en repositorios. Aunque los metadatos indican soporte para inglés y ruso, la model card declara una cobertura de 201 idiomas y dialectos, heredada de la familia Qwen3.5. Es relevante porque ofrece una alternativa de tamaño medio con capacidades multilingües y enfoque en código, en un momento en que los modelos de programación de 7B-10B son demandados para despliegue en hardware local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nombre sugiere base Qwen3.5, sin confirmar) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, GGUF Q4_K_M |
| Idiomas soportados | en, ru (según metadatos); la model card declara 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna, la composición del dataset de entrenamiento ni el proceso de ajuste. La model card solo indica que el modelo es un "especialista en codificación" y que se enmarca en el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators) de la plataforma NOESIS. La referencia al nombre "Qwopus3.5" y a la serie Qwen3.5 sugiere que se trata de un fine-tune de un modelo base de 9B de dicha familia, pero no se aportan datos concretos sobre el número de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones técnicas específicas.

## Capacidades

- Generación de código: puede producir fragmentos de código en diversos lenguajes, aunque no se especifica el conjunto de lenguajes soportados.
- Transformación de código: refactorización, adaptación de sintaxis y conversión entre estilos de programación.
- Asistencia en depuración: identificación de errores y sugerencias de corrección.
- Trabajo con repositorios: apoyo en tareas de mantenimiento de código, documentación y revisión.
- Seguimiento de instrucciones técnicas: capacidad para ejecutar comandos y seguir especificaciones detalladas.
- Multilingüismo: la model card declara soporte para 201 idiomas y dialectos, aunque la lista completa no se proporciona.
- Despliegue dual: disponible en BF16 para frameworks como Transformers y en GGUF para entornos llama.cpp.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse como autocompletado o chat dentro de editores como VS Code o JetBrains, generando código según el contexto del archivo abierto.
- Revisión de código automatizada: en un pipeline de CI/CD, el modelo puede analizar diffs y sugerir mejoras de estilo, corrección de bugs o optimizaciones, reduciendo la carga de revisión manual.
- Documentación técnica automática: a partir de código fuente, el modelo puede generar comentarios, docstrings y manuales de referencia, mejorando la mantenibilidad de proyectos.
- Depuración interactiva: durante una sesión de depuración, el modelo puede recibir la traza de error y proponer hipótesis de causa raíz y pasos de corrección.
- Traducción de código entre lenguajes: aunque no se especifica explícitamente, su naturaleza multilingüe y de codificación permite convertir código de un lenguaje a otro (por ejemplo, de Python a JavaScript) con instrucciones claras.
- Entorno de aprendizaje: como tutor de programación, el modelo puede explicar conceptos, mostrar ejemplos y resolver dudas de estudiantes en múltiples idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB (8.95B parámetros × 2 bytes por parámetro, más overhead). Esto cabe en GPUs como A100 40GB, RTX 4090 24GB o RTX 3090 24GB.
- Para el archivo GGUF Q4_K_M, la VRAM necesaria se reduce a aproximadamente 5-6 GB, lo que permite ejecutarlo en GPUs de gama media como RTX 3060 12GB o RTX 4060 8GB.
- No se especifican GPUs concretas recomendadas por el autor, pero la presencia del artefacto GGUF indica compatibilidad con llama.cpp y Ollama.
- Opciones de despliegue: Transformers (Python), llama.cpp, Ollama, y cualquier servidor compatible con GGUF.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparación cuantitativa con otros modelos de código de 9B (por ejemplo, Llama-3.1-8B-Instruct, Qwen2.5-Coder-7B o DeepSeek-Coder-7B). El modelo no publica benchmarks, por lo que no se pueden establecer comparaciones objetivas de rendimiento. Se puede indicar que es un derivado de la serie Qwen3.5, pero sin datos adicionales.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o riesgos de alucinación. Como modelo de código, puede generar código incorrecto o inseguro si no se supervisa.
- La declaración de soporte para 201 idiomas proviene de la serie Qwen3.5, pero no se ha verificado el rendimiento real en todos ellos. Es probable que el rendimiento en idiomas distintos de inglés y ruso sea inferior.
- La longitud de contexto no se ha especificado; se recomienda probar con ventanas de 8K a 32K, pero no hay garantía.
- El modelo está orientado a codificación, por lo que su rendimiento en tareas generales de razonamiento o conversación puede ser limitado.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar que el uso cumple con las condiciones de la licencia y con las normativas locales.
- No se ha publicado información sobre el proceso de entrenamiento, por lo que no se puede evaluar la calidad de los datos ni posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Coder-v3.5-BF16
- Variante PromptEng: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16
- Variante Translate: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16
- Repositorio GitHub de Qwopus (agente de código): https://github.com/codespermuted/qwopus
- Página de Ollama para Qwopus3.5: https://ollama.com/fredrezones55/Qwopus3.5
- Repositorio de despliegue en T4: https://github.com/ctz168/qwenopus
