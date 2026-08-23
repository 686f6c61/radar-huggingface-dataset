# sainitishb/Kavya-1-7B

## Resumen

Kavya-1-7B es un modelo de lenguaje de 7 000 millones de parámetros desarrollado por sainitishb, especializado en la composición de letras de canciones en telugu. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-7B-Instruct, entrenado con unas 9 100 canciones telugu curadas de cine contemporáneo y composiciones devocionales clásicas. Su objetivo es generar letras originales con la estructura tradicional *pallavi*, *anupallavi* y *charanam*, respetando el ritmo métrico y el registro emocional de la música cinematográfica moderna en telugu.

El modelo se presenta como una versión de investigación con una limitación técnica importante: el tokenizador del modelo base no contiene caracteres telugu, por lo que el telugu se codifica como bytes UTF-8 crudos, lo que provoca frecuentes errores ortográficos en la salida. A pesar de ello, la estructura, el ritmo y la forma de las canciones se aprenden correctamente, lo que lo convierte en una herramienta útil para la ideación y el borrador de letras, aunque no para producción directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5-7B-Instruct |
| Parámetros totales | 7 615 616 512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base soporta 32 768 tokens, no se especifica para este modelo) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kavya-1-7B es un ajuste fino de Qwen2.5-7B-Instruct, un modelo transformer denso con atención causal estándar. El entrenamiento se realizó sobre un conjunto de 9 102 canciones telugu, divididas en 8 648 de entrenamiento, 318 de validación y 136 de prueba. Se aplicaron dos épocas con una tasa de aprendizaje de 2e-4, un tamaño de lote efectivo de 16 (batch 4 × grad accum 4), longitud máxima de secuencia de 2 048 tokens y precisión bfloat16. Los pesos liberados son un modelo fusionado y autónomo, sin necesidad de cargar adaptadores.

El entrenamiento se realizó con un formato de instrucción-respuesta, donde cada registro consistía en un encargo de composición estructurado (tema, estilo, ánimo, estructura) y su correspondiente letra. No se mencionan técnicas adicionales como RLHF o DPO. La innovación principal reside en el dominio específico: adaptar un modelo multilingüe a la poesía telugu, un ámbito donde los modelos generalistas suelen producir texto rígido y sin métrica.

## Capacidades

- Generación de letras de canciones originales en telugu, estructuradas en *pallavi*, *anupallavi* y *charanam*.
- Composición con registro emocional variado (melancolía, celebración, gratitud, etc.) y estilos que van desde el cine moderno hasta la devoción clásica.
- Ideación creativa: genera estrofas alternativas, estribillos o imágenes poéticas a partir de un tema.
- Soporte de instrucciones detalladas: el modelo responde mejor a prompts que especifican tema, estilo, ánimo y estructura.
- Capacidad multilingüe: solo telugu en escritura telugu; el telugu romanizado produce resultados significativamente peores.
- No dispone de capacidades de tool calling, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Borrador de canciones para compositores y letristas: el modelo genera una estructura completa de canción en telugu a partir de un tema y estilo, que el usuario puede refinar y corregir manualmente.
- Generación de alternativas creativas: para un estribillo o verso existente, el modelo puede producir variaciones con diferentes imágenes o giros emocionales.
- Asistencia en educación musical y literaria: permite a estudiantes de telugu explorar estructuras poéticas tradicionales y contemporáneas de forma interactiva.
- Investigación en generación de lenguaje de bajos recursos: sirve como caso de estudio para evaluar el impacto del tokenizador en la calidad de generación de texto en idiomas no latinos.
- Creación de contenido para redes sociales o proyectos artísticos: un usuario puede pedir una canción breve para un video o una publicación, siempre que acepte revisar y corregir la ortografía.
- Prototipado de herramientas de escritura creativa en telugu: el modelo puede integrarse en aplicaciones de composición asistida por IA para que los usuarios generen borradores iniciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para inferencia en bfloat16, un modelo de 7B requiere aproximadamente 15-16 GB de VRAM (por ejemplo, una NVIDIA RTX 4090 o A100 40 GB). No se proporcionan datos específicos para Kavya-1-7B.
- En cuantización de 4 bits (no publicada por el autor, pero posible con herramientas como llama.cpp o bitsandbytes), se podría reducir a unos 5-6 GB de VRAM, aunque no hay garantía de compatibilidad.
- No se indica si el modelo está optimizado para vLLM, TGI u otros servidores de inferencia. Es compatible con la librería transformers y el pipeline de generación de texto.
- Se recomienda usar una GPU con al menos 16 GB de VRAM para una ejecución cómoda con el formato safetensors.

## Comparativa con modelos similares

No se dispone de modelos comparables específicos para la composición de canciones en telugu. El modelo base Qwen2.5-7B-Instruct es un modelo generalista multilingüe que podría generar texto en telugu, pero sin la especialización en poesía métrica y estructura de canciones. Otros modelos de 7B como Mistral-7B o Llama-3.1-8B también son generalistas y no están entrenados para este dominio. Por tanto, no se puede realizar una comparación directa con alternativas equivalentes.

## Limitaciones y advertencias

- **Defecto principal de ortografía:** el tokenizador del modelo base no contiene caracteres telugu, lo que provoca que las palabras generadas a menudo estén malformadas y con conjuntos rotos. Este es un problema dominante que impide el uso en producción.
- **Solo telugu en escritura:** el modelo está entrenado y evaluado solo con texto en telugu; la entrada en telugu romanizado produce resultados de calidad notablemente inferior.
- **Registro de cine:** el modelo se especializa en el registro de la música de cine telugu moderna; puede no ser adecuado para otros géneros o estilos literarios.
- **No apto para uso comercial, legal, médico o de seguridad crítica:** el modelo no debe usarse para fines fácticos o aplicaciones críticas.
- **Riesgo de imitación:** no debe utilizarse para imitar la voz de un escritor vivo específico ni para reproducir canciones con derechos de autor.
- **No se garantiza la reproducibilidad de canciones existentes:** el modelo está entrenado para escribir originales, pero no hay garantía de que no se generen similitudes con obras protegidas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sainitishb/Kavya-1-7B)
- [Modelo base: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
