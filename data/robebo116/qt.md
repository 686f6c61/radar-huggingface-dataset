# robebo116/QT

## Resumen

HachimiMT-60-QT es un modelo de traducción automática neuronal (NMT) especializado en la dirección chino-vietnamita, publicado en Hugging Face por robebo116 (DINH VAN VINH) como edición del modelo base HachimiMT-60 (de ngocdang83). Su objetivo es traducir novelas web chinas al vietnamita manteniendo un registro de pronombres "convert" (ta, ngươi, hắn, nàng, tỷ tỷ, ca ca), el estilo arcaico sino-vietnamita esperado por los lectores de este género.

El modelo emplea una arquitectura Transformer encoder-decoder de MarianMT, con 56,4 millones de parámetros y un tamaño de repositorio de 0,3 GB. Frente al modelo base, que cambiaba de registro en el 24 % de las transiciones de línea, este modelo presenta un 0 % de cambios de voz, según pruebas internas sobre 7 capítulos de 7 géneros (538 líneas). Es especialmente relevante para traducciones de novelas xianxia, xuanhuan, históricas y danmei, donde la estabilidad del registro es crítica para la experiencia de lectura.

No se han publicado benchmarks estándar; la model card documenta métricas internas de consistencia y ejemplos comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 56.397.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8_float32 (export CTranslate2); pesos en safetensors (precision no especificada) |
| Idiomas soportados | chino (zh), vietnamita (vi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (transformers); export CTranslate2 en ct2-int8_float32 |

## Arquitectura y entrenamiento

El modelo se basa en Marian, una arquitectura Transformer encoder-decoder de traducción neuronal. Hereda de su predecesor HachimiMT-60 los pesos y la configuración general, y ha sido ajustado para la dirección chino-vietnamita con un corpus de datos proveniente de dos conjuntos: ngocdang83/tran-vi-teacher y chi-vi/hirashiba-mt-zh2vi-b-filtered. El autor no ha detallado el número total de tokens de entrenamiento ni la composición exacta; tampoco se mencionan fases de RLHF o DPO.

La innovación principal no es arquitectónica, sino de datos: el corpus de ajuste fue normalizado para eliminar variaciones en el sistema de pronombres. Esto permite que el modelo traduzca con un registro "convert" consistente, evitando el cambio de estilo (por ejemplo, de ngươi a cậu) que los lectores de novelas perciben como un defecto. El resultado es una voz estable en todo el texto, incluidos párrafos largos con varios pronombres en una sola frase.

## Capacidades

- Traducción chino-vietnamita (zh→vi) de novelas web, con estilo arcaico "convert": pronombres como ta, ngươi, hắn, nàng, tỷ tỷ y ca ca.
- Consistencia total del registro a lo largo del capítulo: 0 % de cambios de voz en las transiciones de línea, según las pruebas reportadas (7 capítulos, 538 líneas).
- Manejo de frases con múltiples pronombres sin mezclar registros: por ejemplo, "他说你不懂她的心思" se traduce como "Hắn nói ngươi không hiểu tâm tư của nàng".
- Traducción de párrafos largos multi-cláusula sin alternar entre voz moderna y arcaica.
- Inferencia rápida en CPU mediante la exportación INT8 de CTranslate2 incluida en el repositorio.
- Integración sencilla con la biblioteca transformers a través de AutoTokenizer y MarianMTModel.
- No soporta tool calling, agentes ni razonamiento de múltiples pasos: es un modelo de traducción puro.
- Idiomas: únicamente chino a vietnamita; no ofrece traducción inversa ni soporte multilingüe adicional.

## Casos de uso

- Traducción de capítulos de novelas xianxia y xuanhuan: el modelo convierte capítulos completos manteniendo el registro "convert" que los lectores de traducciones vietnamitas esperan, evitando la mezcla de "cậu" y "ngươi" dentro de un mismo diálogo.
- Localización de novelas históricas y danmei: su estilo arcaico resulta adecuado para ambientaciones de época y para narrativa con personajes de rango, preservando los tratamientos jerárquicos del original chino.
- Publicación seriada en plataformas web de novelas: gracias a su tamaño reducido (56 M parámetros) puede ejecutarse en servidores ligeros o en máquinas de escritorio, permitiendo traducir capítulos nuevos a medida que se publican.
- Unificación de registros en traducciones existentes: puede emplearse para re-traducir o revisar capítulos ya traducidos con el modelo base que presenten saltos de estilo, normalizando la voz de todo el texto.
- Generación de datos de entrenamiento con estilo consistente: el modelo puede usarse para producir corpus de pares frases chino-vietnamita con registro "convert" normalizado, útiles para ajustar otros modelos de traducción o para tareas de concordancia de pronombres.
- Inferencia en entornos sin GPU: su export INT8 ct2-int8_float32 ofrece varias veces más velocidad en CPU, lo que permite integrarlo en pipelines de traducción batch asequibles.
- Herramientas de apoyo a traductores humanos: en flujos de traducción asistida, el modelo puede generar una primera versión con la voz convert que el traductor solo debe revisar en los nombres propios y expresiones idiomáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (BLEU, METEOR, COMET) en la información disponible. La model card incluye una métrica interna de consistencia de registro, que comparó el modelo base y esta edición QT en 7 capítulos de 7 géneros distintos, con 538 líneas analizadas:

| Metrica | Modelo base HachimiMT-60 | HachimiMT-60-QT |
|---|---|---|
| Cambios de voz en transiciones de línea (clase "you") | ~24 % | 0 % |
| Cambios de voz en clases "I", "we" y tercera persona | no especificado | 0 % |

También se reportan ejemplos cualitativos de estrés, como una frase con cuatro pronombres (he, you, she, we) que el modelo QT traduce sin mezclar registros, mientras que el modelo base no lo logra. No hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 56,4 M parámetros y pesos en FP32, los pesos ocupan aproximadamente 225 MB; en FP16, unos 113 MB; en INT8, unos 56 MB. Sumando activaciones y overhead, el modelo cabe en GPUs de 2 a 4 GB de VRAM.
- GPU recomendada: cualquier GPU de consumo moderna con al menos 4 GB (RTX 3050, RTX 4060, GTX 1660 Super, etc.). En GPU profesionales, una A100 o H100 es innecesaria para este tamaño, pero puede usarse si se integra en un servicio con peticiones concurrentes.
- Sí cabe en GPUs de consumo: es un modelo pequeño, suficiente para inferencia en local con transformers.
- Opciones de despliegue:
  - Hugging Face Transformers (AutoTokenizer + MarianMTModel) en CPU o GPU.
  - CTranslate2 con el export INT8 incluido (ct2-int8_float32) para CPU.
  - Hugging Face Inference Endpoints (compatible con transformers).
  - No es compatible con vLLM ni llama.cpp, ya que Marian tiene una interfaz propia en Transformers y no sigue el esquema de modelos de lenguaje causales.
- Latencia y throughput: no disponibles. La model card solo indica que CTranslate2 INT8 es "varias veces más rápido" en máquinas sin GPU, sin cifras concretas.

## Comparativa con modelos similares

La comparación directa se establece con el modelo base del que deriva. No se han identificado otras alternativas con datos públicos en la búsqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Registro "convert" | Disponibilidad |
|---|---|---|---|---|---|
| HachimiMT-60-QT (este modelo) | 56.397.120 | no disponible | CC-BY-4.0 | Consistente (0 % de cambios) | robebo116/QT en Hugging Face |
| HachimiMT-60-zh-vi (base) | no disponible | no disponible | no disponible | Inestable (~24 % de cambios) | ngocdang83/HachimiMT-60-zh-vi |

## Limitaciones y advertencias

- Sustantivos propios raros o términos acuñados pueden traducirse con una sílaba desplazada o mediante traducción literal: el ejemplo dado es 异瞳金丝猴, que el modelo QT traduce como "Kim Tơ Hầu" en lugar de "Kim Ty Hầu". Si la novela contiene muchos nombres únicos, conviene revisarlos manualmente.
- El estilo "convert" se aplica a todo el texto, incluso en historias ambientadas en el mundo moderno, donde frases como "Sao ngươi chưa nghỉ ngơi?" pueden resultar inesperadas. Es una decisión de diseño, no un error.
- Se pierde la distinción inclusivo/exclusivo del pronombre "we": tanto 我们 como 咱们 se traducen como "chúng ta".
- El tratamiento íntimo moderno (anh/em entre parejas) se convierte mayormente en ta/ngươi, lo que puede alterar matices de relación en historias contemporáneas.
- No debe usarse `no_repeat_ngram_size` durante la decodificación, ya que el modelo tiende a deformar nombres propios (por ejemplo, Lý Giáng Thiên → Lý Giáng Dương). Se recomienda usar los parámetros de generación por defecto indicados en la model card.
- Al carecer de benchmarks públicos estándar, no se puede evaluar su calidad frente a otros sistemas NMT en métricas objetivas como BLEU.
- Modelo de traducción unidireccional (zh→vi). No soporta la dirección inversa ni ningún otro idioma.
- No soporta tool calling, funciones ni protocolos de agente; no es adecuado para tareas que requieran interacción externa.
- El README incluye rutas de código que apuntan a ngocdang83/HachimiMT-60-QT, que no coincide con el ID del repositorio en Hugging Face (robebo116/QT). Verifique la ruta antes de usarla en producción.
- El repositorio está publicado bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución, pero hay que revisar si los datasets de entrenamiento imponen condiciones adicionales.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/robebo116/QT
- Modelo base HachimiMT-60 (referencia): https://huggingface.co/ngocdang83/HachimiMT-60-zh-vi
- Dataset ngocdang83/tran-vi-teacher: https://huggingface.co/datasets/ngocdang83/tran-vi-teacher
- Dataset chi-vi/hirashiba-mt-zh2vi-b-filtered: https://huggingface.co/datasets/chi-vi/hirashiba-mt-zh2vi-b-filtered
- README en vietnamita: disponible como README_vi.md en el repositorio.
- Perfil de usuario en Hugging Face: https://huggingface.co/robebo116
