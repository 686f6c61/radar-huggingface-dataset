# mradermacher/Qwen3.5-0.8B-Uncensored-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-0.8B-Uncensored-i1-GGUF` es una colección de cuantizaciones GGUF (formato para ejecución eficiente en CPU/GPU) del modelo base `Qwen3.5-0.8B-Uncensored`, publicado por el usuario `naimulislam999` en Hugging Face. El autor de esta versión, `mradermacher`, se dedica a generar cuantizaciones ponderadas (weighted/imatrix) de modelos existentes para facilitar su despliegue local con herramientas como llama.cpp, Ollama o LM Studio.

El modelo base es una variante "uncensored" (sin censura) de un modelo de la familia Qwen 3.5 con 0.8 mil millones de parámetros, orientado a eliminar restricciones de contenido en las respuestas. Esta versión cuantizada permite ejecutar el modelo en hardware modesto, incluyendo equipos de consumo, manteniendo un equilibrio entre tamaño y calidad. La relevancia actual radica en la demanda de modelos pequeños, privados y sin filtros para aplicaciones de generación de texto, aunque su uso conlleva riesgos éticos y legales.

No se dispone de información oficial sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados, más allá de que se trata de un ajuste fino (fine-tuning) del modelo Qwen 3.5 de 0.8B. La ficha se basa únicamente en los metadatos de Hugging Face y en la descripción del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer basado en Qwen 3.5, sin confirmar) |
| Parametros totales | 0.8 mil millones (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no disponible en esta versión) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base. Por el nombre, se infiere que pertenece a la familia Qwen 3.5, que en versiones anteriores (Qwen 2.5, Qwen 3) utiliza una arquitectura transformer estándar con atención de múltiples cabezas, normalización RMS y capas de alimentación por posición. El tamaño de 0.8B sugiere una configuración compacta, probablemente con 24 capas y una dimensión de modelo de alrededor de 1024, aunque estos datos no están confirmados.

El modelo base `Qwen3.5-0.8B-Uncensored` es un ajuste fino (fine-tuning) del modelo Qwen 3.5 original, realizado por `naimulislam999`, con el objetivo de eliminar las restricciones de contenido (censura) que suelen incorporar los modelos comerciales. No se especifica el método de entrenamiento (RLHF, DPO, etc.) ni el volumen de datos utilizado. La versión GGUF de `mradermacher` aplica cuantización con matrices de importancia (imatrix) para optimizar la calidad en bajas precisiones, una técnica que pondera la pérdida de información según la relevancia de cada peso.

## Capacidades

- Generación de texto libre: el modelo puede producir respuestas de texto continuo, aunque su tamaño reducido limita la coherencia en tareas complejas.
- Razonamiento básico: capaz de resolver tareas sencillas de lógica y sentido común, pero con errores frecuentes en problemas de varios pasos.
- Soporte de código: puede generar fragmentos de código simples en lenguajes populares, pero no es fiable para proyectos complejos.
- Conversación multi-turno: mantiene diálogos cortos, aunque pierde contexto rápidamente debido a la ventana de contexto limitada (no especificada).
- Capacidad multilingüe: no confirmada; probablemente hereda el soporte de Qwen para inglés y chino, pero sin datos oficiales.
- Sin tool calling ni funciones de agente: no se menciona soporte para llamadas a herramientas o razonamiento multi-paso.
- Sin capacidades multimodales: no hay indicios de visión o audio.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede usarse para redactar ficción, guiones o ideas creativas donde se requiera explorar temas tabú o controvertidos, gracias a su naturaleza "uncensored". Es adecuado para prototipos rápidos, aunque la calidad del texto será limitada por el tamaño.
- Asistente de escritura local y privada: al ejecutarse en local con GGUF, permite redactar borradores de correos, artículos o publicaciones sin enviar datos a servidores externos, ideal para entornos con requisitos de privacidad estrictos.
- Chatbot de entretenimiento sin filtros: se puede integrar en aplicaciones de chat para usuarios que buscan respuestas sin moderación, como juegos de rol o simulaciones de personajes, siempre que se asuman los riesgos legales y éticos.
- Generación de código auxiliar en entornos aislados: para tareas de programación simples (funciones básicas, scripts de automatización), el modelo puede ofrecer sugerencias rápidas sin depender de la nube, aunque se recomienda revisar el resultado.
- Educación y experimentación con modelos pequeños: sirve como banco de pruebas para estudiar el comportamiento de modelos sin censura en tareas de generación de texto, comparando con versiones censuradas.
- Despliegue en dispositivos de bajo consumo: gracias a las cuantizaciones Q2_K o IQ1, puede ejecutarse en Raspberry Pi o teléfonos móviles para aplicaciones de demostración o prototipos de asistentes personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo o su versión base. Se recomienda realizar evaluaciones propias si se considera su uso en tareas específicas.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para Q2_K (aproximadamente 0.5 GB) puede ejecutarse en CPU con 4 GB de RAM; para Q6_K (alrededor de 0.9 GB) se necesita al menos 2 GB de VRAM en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 2060, etc.) para las cuantizaciones más altas; las más bajas funcionan en CPU.
- Compatibilidad con GPU de consumo: sí, todas las cuantizaciones caben en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp).
- Latencia y throughput: no disponibles; en CPU moderna (8 núcleos) se espera una generación de 5-15 tokens por segundo con Q4_K_M, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo comparte categoría con otros modelos pequeños "uncensored" como `dolphin-2.6-phi-2` (2.7B) o `zephyr-7b-beta` (7B), pero no hay benchmarks que permitan una comparación objetiva. Se recomienda evaluar directamente con las herramientas de la comunidad.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño y sin censura, es propenso a generar información falsa, sesgada o inapropiada. No debe usarse en aplicaciones donde la veracidad sea crítica.
- Riesgo de contenido dañino: la eliminación de restricciones puede producir respuestas ofensivas, ilegales o peligrosas. El responsable del despliegue asume toda la responsabilidad legal y ética.
- Contexto limitado: la ventana de contexto no está especificada, pero en modelos de 0.8B suele ser de 4K a 8K tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia desconocida: al no especificarse la licencia, no se garantiza el uso comercial. Se debe contactar con el autor original antes de cualquier uso productivo.
- Calidad de generación: el tamaño reducido limita la coherencia, el razonamiento y la creatividad en comparación con modelos de mayor escala.
- Sin soporte técnico: el autor no ofrece garantías ni mantenimiento; el modelo se proporciona tal cual.

## Enlaces

- Repositorio Hugging Face de esta versión: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Uncensored-i1-GGUF
- Modelo base (naimulislam999): https://huggingface.co/naimulislam999/Qwen3.5-0.8B-Uncensored
- Versión GGUF sin i1: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Uncensored-GGUF
- Repositorio de cuantizaciones relacionadas: https://huggingface.co/mradermacher/Qwen3.5-0.8B-finetuned-lora-uncensored-i1-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/mradermacher
