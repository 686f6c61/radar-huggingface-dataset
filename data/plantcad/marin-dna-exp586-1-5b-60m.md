# plantcad/marin-dna-exp586-1.5B-60M

## Resumen

MarinDNA exp586 1.5B-60M es un modelo de lenguaje especializado en genómica y ADN desarrollado por el equipo plantcad, vinculado al proyecto MarinDNA de Open-Athena. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) que combina 1.590 millones de parámetros totales con aproximadamente 60,6 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos dispersos de alta eficiencia computacional. El checkpoint publicado es una exportación en BF16 del modelo final tras entrenar sobre 1 billón de tokens de entrada.

El modelo emplea el vocabulario original de 128.256 tokens de un modelo de lenguaje base, pero fuerza la entrada de secuencias de ADN a nivel de carácter, una estrategia que permite reutilizar un tokenizador lingüístico existente para datos genómicos sin necesidad de entrenar un vocabulario específico desde cero. Con una longitud de contexto de 8.192 tokens, está diseñado para tareas de análisis de secuencias genómicas donde el contexto extendido resulta relevante.

Su relevancia actual radica en la aplicación de arquitecturas MoE eficientes al dominio de la biología computacional, un área donde los modelos densos de gran tamaño resultan costosos de desplegar. La licencia Apache 2.0 facilita su adopción tanto en investigación como en entornos comerciales, aunque la documentación publicada es muy limitada y no incluye resultados de evaluación propios en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 1,59 mil millones (1.590.000.000 aprox.) |
| Parametros activos | 60,6 millones por token (aprox.) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible (orientado a secuencias de ADN) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos (MoE), implementada con el framework Levanter según las etiquetas del repositorio. La relación entre parámetros totales (1,59B) y activos (60,6M) implica un ratio de activación de aproximadamente el 3,8 %, lo que indica una dispersión muy agresiva: solo una fracción pequeña de los expertos se activa por token, reduciendo el coste computacional de la inferencia frente a un modelo denso equivalente. No se detalla en la información disponible el número de expertos, la estrategia de enrutamiento ni la top-k utilizada.

El entrenamiento se realizó sobre 1.000.000.192.512 tokens de entrada (aproximadamente 1 billón), con el checkpoint final en el paso 1907349. La entrada de ADN se fuerza a nivel de carácter sobre el vocabulario lingüístico original de 128.256 tokens, lo que constituye una decisión de diseño destacable: en lugar de entrenar un tokenizador específico para nucleótidos, se reutiliza el vocabulario del modelo base y se mapean los caracteres de ADN a tokens existentes. No se especifica en la información proporcionada la composición del dataset, si hubo fases de RLHF o DPO, ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Modelado de secuencias de ADN y genómica: el modelo está entrenado específicamente sobre datos genómicos con entrada forzada a nivel de carácter.
- Generación y predicción sobre secuencias biológicas: al ser un modelo autorregresivo, puede emplearse para tareas de modelado de lenguaje sobre nucleótidos.
- Contexto extendido de 8.192 tokens: adecuado para ventanas de secuencia genómica de longitud media.
- Eficiencia computacional por token: gracias a la activación dispersa de solo 60,6M parámetros, el coste de inferencia es bajo en comparación con modelos densos de tamaño similar.
- Capacidades multilingües: no disponible; no se documenta soporte de idiomas naturales.
- Tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documenta.

## Casos de uso

- Anotación funcional de secuencias genómicas: el modelo puede procesar ventanas de hasta 8.192 tokens de ADN con entrada a nivel de carácter, lo que permite evaluar regiones reguladoras o codificantes en un solo pase y con bajo coste de inferencia gracias a sus 60,6M parámetros activos.
- Predicción de efectos de variantes: dado su entrenamiento sobre un billón de tokens genómicos, puede emplearse para puntuar la probabilidad de secuencias mutadas frente a referencia, ayudando a priorizar variantes en estudios de asociación.
- Modelado de lenguaje sobre genomas para preentrenamiento de embeddings: las representaciones internas del modelo pueden extraerse como features para clasificadores downstream (por ejemplo, predicción de sitios de unión de proteínas), aprovechando la eficiencia MoE para procesar grandes volúmenes de datos.
- Detección de motivos y patrones en ADN: con contexto de 8.192 tokens, puede capturar dependencias de largo alcance entre elementos genómicos distantes, útil en análisis de elementos cis-reguladores.
- Generación de secuencias sintéticas de ADN: el modelo autorregresivo puede generar secuencias con propiedades estadísticas aprendidas del corpus, aplicable en diseño de experimentos o aumento de datos controlado.
- Investigación en arquitecturas MoE aplicadas a biología: al ser un checkpoint abierto con licencia Apache 2.0 y formato safetensors, sirve como base para estudiar enrutamiento de expertos en dominios no lingüísticos y para fine-tuning sobre tareas genómicas específicas con requisitos de hardware moderados.
- Despliegue en entornos con recursos limitados: la baja activación por token permite servir el modelo en GPUs de consumo con cuantización adecuada, algo inviable con modelos densos de 1,5B parámetros en escenarios de alto throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los resultados de evaluación de PlantCAD2 en un pull request del repositorio plantcad2, pero no se incluyen cifras en la información proporcionada, por lo que no se presentan datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,2 GB solo para pesos (1,59B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB, aunque no se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el modelo en BF16; una RTX 4090 (24 GB) o A100 (40/80 GB) permiten mayor batch y throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 8GB, RTX 4060 Ti, RTX 4070, RTX 4090) en BF16; en cuantización de 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: al estar en safetensors y usar Levanter, el despliegue natural es mediante el propio stack de Levanter/JAX; para vLLM, llama.cpp u Ollama sería necesario convertir los pesos a los formatos soportados (GGUF para llama.cpp), conversión no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Dominio |
|---|---|---|---|---|---|
| MarinDNA exp586 1.5B-60M | 1,59B | 60,6M | 8.192 | Apache 2.0 | Genómica / ADN |
| Modelos genómicos densos de ~1-2B | ~1-2B | ~1-2B (denso) | variable | variable | Genómica |
| Modelos de lenguaje MoE pequeños (referencia general) | ~1-3B | variable | variable | variable | Lenguaje natural |

No se dispone en la información proporcionada de modelos comparables concretos con parámetros, contexto y licencia verificables, por lo que la comparativa cuantitativa se limita a la relación entre parámetros totales y activos. El rasgo diferencial del modelo es su ratio de activación extremadamente bajo (≈3,8 %), que lo distingue de alternativas densas de tamaño similar en coste de inferencia, a costa de una documentación de evaluación inexistente en la model card.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no incluye resultados de evaluación, composición del dataset, número de expertos ni detalles de enrutamiento, lo que dificulta validar su calidad antes de usarlo en producción.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo, y al entrenar sobre datos genómicos podría heredar sesgos de representación de especies o poblaciones presentes en el corpus.
- Riesgo de alucinación: como modelo generativo, puede producir secuencias de ADN plausibles pero biológicamente inválidas; cualquier salida debe validarse experimentalmente.
- Limitaciones de contexto: 8.192 tokens, insuficiente para genomas completos o regiones muy extensas; requiere segmentación en ventanas.
- Idiomas: no se documenta soporte de lenguajes naturales; el modelo está orientado a secuencias de ADN y su uso fuera de ese dominio no está validado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del proyecto MarinDNA y PlantCAD2 para atribuciones adicionales.
- Caveat de producción: el checkpoint está en BF16 y pensado para Levanter; la conversión a otros runtimes (vLLM, llama.cpp) no está documentada y podría requerir trabajo adicional.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline definido, lo que indica un artefacto de investigación sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/plantcad/marin-dna-exp586-1.5B-60M
- Issue MarinDNA #586: https://github.com/Open-Athena/marin-dna/issues/586
- Resultados de evaluación PlantCAD2 (PR #22): https://github.com/plantcad/plantcad2/pull/22
