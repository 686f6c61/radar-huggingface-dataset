# catsaiagency/Serval-1.8B

## Resumen

Serval 1.8B es un modelo de traducción automática desarrollado por CatsAI Agency, obtenido mediante fine-tuning de Hy-MT2-1.8B de Tencent (licencia Apache-2.0). Cubre diez idiomas (japonés, inglés, chino, coreano, español, francés, alemán, portugués, polaco y croata) en las 90 direcciones posibles, con la particularidad de que el croata se añadió durante el ajuste fino. Con 1.791.080.448 parámetros, está diseñado para ejecutarse en CPU de un PC convencional sin necesidad de GPU, lo que lo sitúa en la categoría de modelos de traducción de borde (edge) con requisitos de hardware mínimos.

La propuesta de valor es la privacidad y el coste: según el autor, traduce una frase en aproximadamente un segundo en un procesador de portátil y el texto nunca sale de la máquina. El repositorio de Hugging Face aloja los pesos sin cuantizar en safetensors y bfloat16, pensados para conversión, cuantización o ajuste fino; para inferencia se recomienda el archivo GGUF Q4_K_M publicado en un repositorio separado, ya que el modelo solo se comporta como se describe si se le proporciona el prompt exacto con el que fue entrenado.

El modelo es relevante ahora por dos motivos: ofrece una alternativa local a los servicios de traducción en la nube con un rendimiento medido en FLORES-200 devtest de 86,7 COMET (media de 90 direcciones, archivo Q4_K_M), y su licencia permite probarlo gratis aunque exige pago por máquina para uso productivo, un modelo comercial poco habitual en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia hunyuan_v1_dense, según tags de Hugging Face) |
| Parametros totales | 1.791.080.448 (1,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (configuración inicial del servidor) |
| Tipos de cuantizacion | GGUF Q4_K_M publicado por el autor; pesos originales en bfloat16 aptos para otras cuantizaciones |
| Idiomas soportados | ja, en, zh, ko, es, fr, de, pt, pl, hr (10 idiomas, 90 direcciones) |
| Licencia | CatsAI Model License (prueba gratuita; pago por máquina para uso productivo) |
| Formato de pesos | safetensors (bfloat16) en este repositorio; GGUF en catsaiagency/Serval-1.8B-GGUF |

## Arquitectura y entrenamiento

Serval 1.8B es un transformer denso de 1,8 mil millones de parámetros derivado de Hy-MT2-1.8B de Tencent, un modelo de traducción publicado bajo Apache-2.0. El ajuste fino realizado por CatsAI Agency añade el croata al conjunto de idiomas original y especializa el comportamiento del modelo para una tarea concreta: recibir un texto fuente y un par de idiomas, y devolver únicamente la traducción. La model card no detalla la composición del dataset de ajuste fino, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación principal no es arquitectónica sino de despliegue y formato: el modelo se distribuye en dos variantes complementarias. Los pesos sin cuantizar en safetensors y bfloat16 permiten conversión y ajuste fino, mientras que el GGUF Q4_K_M (1,1 GB, unos 2,5 GB de RAM en ejecución) está optimizado para llama.cpp en CPU. El autor especifica que el modelo requiere un prompt exacto con el que fue entrenado, junto con temperatura 0 y repeat penalty 1,05; fuera de esas condiciones no se garantiza el comportamiento descrito. El procesamiento es por segmentos: una frase a un párrafo por petición, sin contexto compartido entre fragmentos, con cortes en límites de frase de hasta 300 caracteres para ja/zh/ko y 600 para el resto.

## Capacidades

- Traducción entre 10 idiomas en las 90 direcciones posibles: japonés, inglés, chino, coreano, español, francés, alemán, portugués, polaco y croata.
- Traducción de una frase a un párrafo por petición, con división automática de líneas largas en límites de frase mediante el script de ejemplo.
- Soporte de glosario limitado: hasta cinco términos por petición, cada uno añade unos 10 tokens al prompt.
- Ejecución en CPU sin GPU, con aproximadamente 32 tokens/s de generación y 210 tokens/s de lectura de prompt en un Core i7-11800H con 6 hilos.
- Procesamiento por lotes mediante múltiples slots del servidor (`-np` y `-c` configurables).
- No dispone de detección automática del idioma fuente: el par de idiomas debe indicarse explícitamente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de documentación técnica en local: el modelo procesa párrafos de hasta 600 caracteres en idiomas latinos y devuelve solo la traducción, lo que permite integrarlo en un pipeline que recorra archivos Markdown sin enviar contenido a servicios externos.
- Atención al cliente multilingüe con requisitos de privacidad: al ejecutarse en CPU y no salir el texto de la máquina, encaja en entornos donde los datos del cliente no pueden enviarse a la nube, traduciendo mensajes entre español, inglés, francés o alemán con latencia de aproximadamente un segundo por frase.
- Traducción de subtítulos y contenido audiovisual: el corte por límites de frase y la velocidad de CPU permiten procesar guiones y subtítulos línea a línea, con revisión humana de números y nombres propios.
- Localización de aplicaciones y software: el uso de glosario de hasta cinco términos por petición permite fijar la traducción de nombres de producto o términos técnicos recurrentes en cada cadena de texto.
- Traducción de correspondencia y documentos internos en pymes: un PC convencional con unos 2,5 GB de RAM libres puede traducir correos y documentos entre los diez idiomas soportados sin infraestructura adicional.
- Preprocesado multilingüe para investigación: al estar disponible en safetensors y bfloat16, puede ajustarse finamente o cuantizarse para experimentos de traducción en entornos con recursos limitados, usando el GGUF como referencia de calidad.
- Traducción de contenido web y foros: el procesamiento por lotes con varios slots del servidor permite atender varias peticiones concurrentes en una sola máquina sin GPU.

## Benchmarks y rendimiento

| Benchmark | Serval 1.8B Q4_K_M | Serval 1.8B sin cuantizar | Modelo base Hy-MT2-1.8B |
|---|---|---|---|
| FLORES-200 devtest, media de 90 direcciones, COMET (×100) | 86,7 | 87,0 | 86,0 |
| Croata, hacia hr, COMET (×100) | 86,5 | no disponible | 81,4 |
| Croata, desde hr, COMET (×100) | 85,1 | no disponible | 82,5 |

Datos de velocidad medidos por el autor en un Core i7-11800H con 6 hilos usando el GGUF Q4_K_M: aproximadamente 32 tokens/s de generación y 210 tokens/s de lectura de prompt, lo que equivale a cerca de un segundo por frase. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; en CPU necesita aproximadamente 2,5 GB de RAM con el GGUF Q4_K_M (1,1 GB de archivo).
- Pesos sin cuantizar: el repositorio ocupa 3,6 GB en safetensors bfloat16; la inferencia con estos pesos requiere más memoria y se recomienda el GGUF para producción.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU con suficiente memoria podría ejecutarlo, pero no es el escenario previsto por el autor.
- Cabe en cualquier PC convencional: el autor cita un Core i7-11800H como referencia, sin necesidad de GPU de consumo.
- Opciones de despliegue: llama.cpp con el GGUF Q4_K_M (recomendado por el autor, con scripts de inicio para Linux y PowerShell); los pesos safetensors son compatibles con transformers para conversión y ajuste fino.
- Latencia y throughput: aproximadamente 1 segundo por frase en CPU; para concurrencia, aumentar `-np` y `-c` en el servidor (por ejemplo, `-np 4 -c 16384`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Calidad (FLORES-200 COMET ×100) | Licencia | Ejecución en CPU |
|---|---|---|---|---|---|---|
| Serval 1.8B | 1,8 B | 4.096 tokens | 10 (90 direcciones) | 86,7 (Q4_K_M) | CatsAI Model License (pago por máquina) | Sí, ~1 s/frase |
| Hy-MT2-1.8B (base) | 1,8 B | no disponible | Sin croata | 86,0 | Apache-2.0 | No documentado |
| Alternativas de traducción de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base, del que Serval mejora la media global (86,7 frente a 86,0) y el croata (86,5 frente a 81,4 hacia hr; 85,1 frente a 82,5 desde hr). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la CatsAI Model License permite probar el modelo gratis, pero el uso para trabajo real exige una licencia de pago por cada máquina donde se instale, incluido un PC de desarrollo si se usa para trabajo productivo.
- Riesgo de errores de traducción: el autor advierte de que el modelo a veces elige una palabra incorrecta; se recomienda revisión humana de números, horas, nombres propios y términos técnicos en textos importantes.
- Requiere el prompt exacto de entrenamiento: fuera de ese prompt, con temperatura 0 y repeat penalty 1,05, el modelo no se comporta como se describe.
- Sin detección automática de idioma: el par de idiomas debe indicarse explícitamente en cada petición.
- Procesamiento sin contexto compartido: cada frase o párrafo se traduce de forma aislada, lo que puede producir inconsistencias terminológicas en documentos largos.
- Contexto limitado a 4.096 tokens y recomendación de una frase a un párrafo por petición; si la salida se trunca, hay que dividir el texto fuente.
- Glosario limitado a cinco términos por petición, con coste adicional de unos 10 tokens por término.
- No se documentan sesgos conocidos ni evaluación de alucinación más allá de la advertencia genérica sobre errores de palabra.
- Los scripts de inicio solo se probaron en Linux; el script de PowerShell no se ejecutó en una máquina Windows real, y el uso de tuberías (`|`) en Windows puede corromper caracteres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/catsaiagency/Serval-1.8B
- Pesos GGUF y manual de uso: https://huggingface.co/catsaiagency/Serval-1.8B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Licencia del modelo: https://huggingface.co/catsaiagency/Serval-1.8B/blob/main/MODEL-LICENSE.md
- Página web del producto: https://catsai.agency/en/serval
- Contacto para licencias: https://catsai.agency/contact
