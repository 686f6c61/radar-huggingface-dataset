# afridahmed/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un ajuste fino (fine-tune) del modelo Qwen 3.5 de 9B parámetros, distribuido en formato GGUF por el usuario afridahmed a partir del trabajo original de DavidAU y Nightmedia. El modelo base es DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, y esta publicación ofrece únicamente las cuantizaciones GGUF (regulares y MTP) del mismo. Se trata de un modelo "abliterated" y "heretic", es decir, deliberadamente descensurado y reentrenado para eliminar los mecanismos de rechazo, orientado a escritura creativa, ficción, roleplay y casos de uso generales sin restricciones de contenido.

El modelo conserva la arquitectura transformer de la familia Qwen 3.5 con 8.953.803.264 parámetros totales (aproximadamente 9B) y añade capacidades multimodales de entrada imagen-texto, además de modos de razonamiento (thinking) e instructivo. La publicación incluye cuantizaciones NEO Imatrix, que según el autor mejoran la precisión entre un 2 y un 4 % respecto a GGUF convencionales, y variantes MTP (multi-token prediction) con tensores en Q8_0 para acelerar la generación.

La relevancia de esta ficha radica en que combina un modelo pequeño (9B) con cuantizaciones agresivas (4 y 8 bits) y decodificación MTP, lo que lo hace desplegable en hardware de consumo. El autor afirma que supera siete benchmarks críticos frente a modelos mayores como Qwen 3.5 27B o Qwen 3.6 35B-A3B, si bien estas cifras proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), con soporte multimodal imagen-texto y modo thinking |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF en 4 bits (Q4_K_S) y 8 bits (mxfp8/mxfp4 en benchmarks); variantes regulares y MTP; tensores MTP en Q8_0; tensor de salida en 16 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regulares y MTP); el modelo base en bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen 3.5 en su variante de 9B parámetros, con pipeline declarado image-text-to-text, lo que indica capacidad de procesar imágenes junto a texto. Sobre esa base, DavidAU y Nightmedia realizaron un ajuste fino multi-etapa y una fusión (merge) multi-modelo a partir de varios de sus propios fine-tunes de 9B de Qwen 3.5, con el objetivo declarado de elevar la inteligencia general y el seguimiento de instrucciones. El proceso incluye una etapa de "Heretic'ing" previa al entrenamiento final, orientada a eliminar los comportamientos de rechazo, y el bloque de razonamiento (thinking) fue compactado y reforzado según el autor.

Las cuantizaciones publicadas emplean NEO Imatrix, que según la model card mejora la precisión de los cuantizados entre un 2 y un 4 % respecto a GGUF normales, así como el rendimiento en contexto largo. Las variantes MTP incorporan predicción multi-token con tensores en Q8_0 para acelerar la decodificación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto general, con modos diferenciados de razonamiento (thinking) e instructivo, conmutables en tiempo de ejecución.
- Escritura creativa, ficción y roleplay sin restricciones de contenido (modelo descensurado y abliterated).
- Generación de código y tareas de programación, según los tags del modelo (coder).
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text).
- Razonamiento multi-paso mediante el bloque de thinking compactado.
- Soporte multilingüe en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Decodificación acelerada mediante multi-token prediction (MTP) en las variantes correspondientes.
- No se documenta en la información disponible soporte explícito de tool calling o function calling.

## Casos de uso

- Escritura creativa y ficción: el modelo está entrenado específicamente para narrativa y roleplay sin filtros de contenido, lo que lo hace adecuado para generar relatos largos, diálogos de personajes y continuaciones coherentes con instrucciones de estilo detalladas.
- Roleplay conversacional: al no aplicar rechazos ni moralizaciones, puede mantener personajes y escenarios multi-turno sin romper la caracterización, algo que los modelos alineados suelen impedir.
- Asistencia a guionistas y autores: útil para generar borradores, variantes de escenas y diálogos alternativos, aprovechando el modo thinking para planificar tramas antes de redactar.
- Generación de código en local: con cuantización de 4 bits cabe en GPU de consumo y puede integrarse en editores o pipelines de CI/CD para autocompletado y generación de pruebas, aunque no se documenta tool calling.
- Procesamiento de documentos con imágenes: gracias a su pipeline image-text-to-text, puede extraer y describir contenido de capturas, diagramas o páginas escaneadas combinándolo con texto.
- Despliegue en hardware de consumo para prototipado: las variantes Q4_K_S y MTP permiten ejecutar el modelo en estaciones de trabajo con GPU de gama alta de consumo, útil para experimentación con modelos descensurados sin depender de la nube.
- Traducción y contenido multilingüe: con 16 idiomas declarados, puede emplearse para localización de textos creativos o conversacionales en esos idiomas.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se midieron en modo instructivo.

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant-Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant-Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Según el autor, el modelo supera siete benchmarks críticos frente a Qwen 3.5 9B, Qwen 3.5 27B, Qwen 3.6 35B-A3B y, en algunos casos, iguala a Qwen 3.6 27B, tanto en 4 como en 8 bits. En cuanto a velocidad, el autor indica aproximadamente 130 t/s en Q4_K_S con GGUF regulares, y que las variantes MTP con una tasa de aceptación del 60 % y 2 tokens pueden superar esa cifra. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: en Q8, aproximadamente 9-10 GB de pesos más overhead de contexto; en Q4_K_S, aproximadamente 5-6 GB.
- GPU recomendadas: RTX 4090, RTX 3090 o superiores para cuantizaciones de 8 bits con contexto amplio; A100 o H100 para despliegues de mayor concurrencia.
- GPU de consumo: sí cabe en GPU con 8 GB o más en Q4, y en 12-16 GB en Q8 con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; las variantes MTP requieren soporte específico de multi-token prediction en el runtime.
- Latencia y throughput: el autor reporta aproximadamente 130 t/s en Q4_K_S con GGUF regulares; las variantes MTP pueden superar esa cifra con tasas de aceptación del 60 % y 2 tokens. Para MTP se recomienda temperatura igual o inferior a 1 y repetition penalty desactivado (1).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este modelo) | 9B | no disponible | Apache 2.0 | GGUF | Descensurado, multimodal, MTP |
| Qwen3.5-9B-Instruct | 9B | no disponible | Apache 2.0 (según base) | safetensors/GGUF | Base alineada, sin descensurar |
| Qwen3.5-27B-Instruct | 27B | no disponible | Apache 2.0 (según base) | safetensors/GGUF | Mayor tamaño, menor throughput en consumo |
| Qwen3.6-35B-A3B-Instruct | 35B (MoE) | no disponible | Apache 2.0 (según base) | safetensors/GGUF | MoE con parámetros activos reducidos |

En los benchmarks del autor, este modelo de 9B supera a Qwen 3.5 27B y Qwen 3.6 35B-A3B en arc/c y arc/e, y queda por debajo de Qwen 3.6 27B en hswag y wino, aunque estas cifras no están verificadas de forma independiente.

## Limitaciones y advertencias

- Modelo descensurado y abliterated: no aplica rechazos ni filtros de contenido, por lo que puede generar material sensible, ofensivo o inapropiado; requiere moderación externa en producción.
- Riesgo de alucinación inherente a modelos de 9B, agravado por el ajuste fino orientado a creatividad y roleplay.
- Los benchmarks proceden únicamente de la model card del autor y no han sido replicados de forma independiente; deben tomarse con cautela.
- No se especifican la longitud de contexto, el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta evaluar su robustez en tareas de contexto largo.
- Las variantes MTP degradan su rendimiento con temperaturas superiores a 1 y con repetition penalty distinto de 1; si la tasa de aceptación baja del 50 %, el autor recomienda usar las cuantizaciones regulares.
- Licencia Apache 2.0 declarada, pero el modelo base y los datos de entrenamiento intermedios pueden imponer condiciones adicionales; conviene revisar la licencia del modelo base de DavidAU antes de uso comercial.
- El pipeline declarado es image-text-to-text, pero no se detalla en la información disponible el alcance real de las capacidades de visión ni su calidad.
- El repositorio tiene 204,9 GB y cero descargas en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/afridahmed/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo relacionado del autor (27B): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones del autor original: https://huggingface.co/DavidAU/collections
- Página de soporte del autor original: https://huggingface.co/DavidAU/support
