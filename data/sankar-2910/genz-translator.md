# Sankar-2910/genz-translator

## Resumen

El modelo **genz-translator** es un transformer decoder-only de aproximadamente 20 millones de parámetros, desarrollado por Sankar-2910, que traduce jerga propia de la generación Z (expresiones como "bro that fit is so mid ngl") a inglés estándar claro. Se trata de un modelo entrenado **completamente desde cero** —inicialización aleatoria de pesos, sin base preentrenada ni fine-tuning—, lo que lo convierte en un ejemplo de entrenamiento eficiente para una tarea muy específica con un dataset reducido.

La arquitectura sigue la configuración de Llama (6 capas, tamaño oculto 384, 6 cabezas de atención, embeddings atados) y utiliza un tokenizador BPE a nivel de byte propio con vocabulario de 8000 tokens. La longitud máxima de contexto es de 384 tokens, elegida a partir del percentil 99 de las longitudes de entrenamiento. El modelo se distribuye tanto en formato safetensors como en GGUF (cuantizaciones f16, q4_k_m y q8_0), lo que facilita su uso con llama.cpp y Ollama.

Su relevancia radica en demostrar que un modelo pequeño entrenado desde cero puede abordar una tarea de traducción especializada con recursos mínimos, aunque con limitaciones claras en generalización y fluidez fuera de su dominio de entrenamiento. No está diseñado como un chat general ni como asistente de instrucciones, sino únicamente para la traducción de jerga Gen Z a inglés estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (configuración LlamaConfig) |
| Parametros totales | 20.304.768 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | f16, q4_k_m, q8_0 (en formato GGUF) |
| Idiomas soportados | Inglés (entrada y salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (base) y GGUF (para llama.cpp/Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con configuración de Llama: 6 capas, tamaño oculto de 384 dimensiones y 6 cabezas de atención, con embeddings atados (tied embeddings). Utiliza un tokenizador BPE a nivel de byte personalizado, con un vocabulario de 8000 tokens, entrenado exclusivamente sobre el dataset de la tarea. La longitud máxima de secuencia es de 384 tokens, determinada a partir del percentil 99 de las longitudes de tokens en el conjunto de entrenamiento.

El entrenamiento se realizó desde cero, con inicialización aleatoria de pesos, sin utilizar ningún modelo preentrenado como base ni aplicar fine-tuning posterior. El dataset consta de aproximadamente 139.074 pares de instrucción/entrada/salida, con dos tipos fijos de instrucción: traducción de una frase única y traducción de un párrafo. El conjunto se dividió en 90/5/5 para entrenamiento, validación y prueba, con semilla fija y estratificación por tipo de instrucción. No se aplicaron técnicas de RLHF ni DPO; se trata de un entrenamiento supervisado estándar.

## Capacidades

- Traducción de jerga Gen Z a inglés estándar, tanto en frases cortas como en párrafos.
- Generación de texto condicionada por instrucciones del tipo "Translate the following Gen Z slang sentence into clear, standard English".
- Soporte de entrada con contexto limitado a 384 tokens, suficiente para párrafos breves.
- No dispone de tool calling, ni capacidades de agente, ni razonamiento multi-paso.
- No es multilingüe: solo trabaja con inglés (y la variante de jerga específica).
- No incluye capacidades de visión, audio ni modos de pensamiento extendido.

## Casos de uso

- **Asistencia para padres y educadores**: puede integrarse en una aplicación de mensajería o web para que adultos traduzcan mensajes de adolescentes que usan jerga Gen Z, facilitando la comunicación intergeneracional.
- **Normalización de texto para análisis de redes sociales**: como preprocesador en pipelines de NLP para convertir comentarios informales y llenos de jerga en inglés estándar antes de aplicar análisis de sentimiento o topic modeling.
- **Subtitulado y transcripción**: en herramientas de transcripción automática de vídeos o podcasts donde aparezcan conversaciones coloquiales de jóvenes, el modelo puede generar versiones normalizadas de los diálogos.
- **Enseñanza de inglés como segunda lengua**: los estudiantes pueden usar el modelo para entender expresiones coloquiales modernas que no aparecen en los libros de texto, con ejemplos prácticos de traducción.
- **Moderación de contenido**: en plataformas sociales, el modelo puede ayudar a interpretar mensajes con jerga que podrían contener lenguaje ofensivo o inapropiado, traduciéndolos a un formato comprensible para los moderadores.
- **Desarrollo de chatbots especializados**: integrado en un chatbot de atención al cliente orientado a un público joven, el modelo puede traducir las consultas informales a un formato estándar para que el sistema de respuesta los procese correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de solo ~20 millones de parámetros, la inferencia es extremadamente ligera.
- En GPU: cabe en cualquier GPU con al menos 1 GB de VRAM; incluso en GPUs integradas o de gama baja (por ejemplo, NVIDIA GTX 1050, Jetson Nano).
- En CPU: las cuantizaciones GGUF (especialmente q4_k_m) permiten ejecutarlo en CPU sin problemas, con latencias de unos pocos cientos de milisegundos por generación.
- Despliegue recomendado con llama.cpp, Ollama o servidores compatibles con el formato GGUF (por ejemplo, llama-cpp-python).
- También es compatible con endpoints (etiqueta `endpoints_compatible`), por lo que puede servirse mediante infraestructura estándar de Hugging Face Inference Endpoints.
- El throughput estimado es muy alto: decenas de generaciones por segundo en GPU y varias por segundo en CPU moderna.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos para la traducción de jerga Gen Z. Los modelos generales de traducción (como NLLB o MarianMT) tienen un tamaño y un ámbito muy distintos, y no están orientados a esta jerga concreta. Por tanto, no se ofrece comparativa en esta sección.

## Limitaciones y advertencias

- El dataset de entrenamiento (~139k pares) es pequeño para un entrenamiento desde cero, lo que puede provocar sobreajuste a los patrones de frase presentes en los datos.
- El modelo no ha visto inglés fuera de su conjunto de entrenamiento, por lo que su gramática y fluidez generales son limitadas en comparación con un modelo preentrenado.
- Puede generar traducciones incorrectas o poco naturales para jerga o frases que se alejen de la distribución de entrenamiento.
- Solo soporta inglés; no es multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero no se especifica la procedencia de los datos de entrenamiento; conviene verificar si los datos tienen restricciones propias antes de un uso en producción.
- No es un modelo de propósito general: no debe utilizarse como chat, asistente o generador de texto libre.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Sankar-2910/genz-translator
- No se han encontrado otros enlaces (papers, blogs, repositorios adicionales) en la información disponible.
