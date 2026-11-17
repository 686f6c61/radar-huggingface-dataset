# ikeno-ada/zeiban

## Resumen

zeiban (税番) es un modelo compacto de clasificación de texto desarrollado por el usuario independiente ikeno-ada, diseñado para predecir el código arancelario estadounidense HTS (Harmonized Tariff Schedule) de 10 dígitos a partir de la descripción de un producto. Se construye sobre `cl-nagoya/ruri-v3-30m`, un encoder ModernBERT japonés, y se distribuye con licencia Apache 2.0. El modelo resuelve un problema muy concreto del comercio internacional: la clasificación aduanera de mercancías, una tarea que tradicionalmente requiere expertos y que aquí se automatiza con un modelo de apenas 29 millones de parámetros que funciona en CPU.

La arquitectura es un encoder ModernBERT de 3 capas y anchura 256, derivado del modelo base mediante promediado de capas y entrenamiento de diferencias de bajo rango. Sobre la representación del texto se aplican cinco proyecciones que generan un vector de consulta por cada nivel arancelario (2, 4, 6, 8 y 10 dígitos), comparados por similitud coseno contra los 38.276 nodos del árbol arancelario. Un índice léxico BMX sobre 19.926 documentos hoja añade una puntuación de coincidencia de palabras.

La relevancia del modelo reside en su eficiencia extrema: un paquete de 61 MB, unos 78 MB de memoria residente y entre 6 y 36 ms por elemento en dos hilos de CPU con el runtime en Rust. Además, incorpora un segundo lector para japonés de 3,5 MB que comparte las tablas de embeddings y de nodos arancelarios, y devuelve no solo el código sino también confianza calibrada, alternativas, el tipo impositivo básico y una pregunta aclaratoria generada a partir del texto oficial del arancel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), 3 capas, anchura 256 |
| Parametros totales | 29.361.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos int8 (redondeados a fp32 en los safetensors); bundle int8 |
| Idiomas soportados | Ingles y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), bundle binario propio (`zeiban.bin` + `zeiban.json`) |

## Arquitectura y entrenamiento

El modelo parte de `cl-nagoya/ruri-v3-30m`, un encoder ModernBERT de 3 capas y anchura 256, y se construye promediando sus capas y entrenando diferencias de bajo rango. La entrada de texto se procesa con este encoder y se generan cinco proyecciones, una por nivel arancelario (2, 4, 6, 8 y 10 dígitos). Cada proyección produce un vector de consulta que se compara por similitud coseno con los vectores precalculados de los 38.276 nodos del árbol arancelario. Adicionalmente, un índice léxico BMX sobre los 19.926 documentos hoja aporta una puntuación de coincidencia de palabras. La puntuación final de una hoja es la suma de las cinco puntuaciones log-softmax de nivel a lo largo de su ruta en el árbol.

El enrutamiento lingüístico es explícito: si los caracteres kana o kanji representan al menos el 10% de los caracteres no espaciales de la entrada, se utiliza el lector japonés; en caso contrario, el lector original. El lector japonés es un segundo modelo de 3,5 MB que comparte las tablas de embeddings y de nodos arancelarios con el original. La versión del arancel está fijada a `2026HTSRev22` y cada respuesta incluye el campo `htsRelease`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación de productos en códigos HTS de 10 dígitos a partir de nombre, material, categorías y descripción.
- Predicción jerárquica en cinco niveles arancelarios (2, 4, 6, 8 y 10 dígitos).
- Devolución de confianza calibrada tanto para el código de 10 dígitos como para el de 6 dígitos.
- Generación de alternativas de código con sus puntuaciones.
- Cálculo del tipo impositivo básico (columna general) asociado al código predicho.
- Generación de preguntas aclaratorias a partir del texto oficial del arancel (por ejemplo, "of cotton" frente a "of other textile materials") con el tipo impositivo de cada opción.
- Soporte de prefijo para refinamiento en una llamada sin estado: se puede pasar un prefijo de 2, 4, 6, 8 o 10 dígitos ya conocido.
- Procesamiento bilingüe inglés-japonés con enrutamiento automático por proporción de caracteres kana/kanji.
- Funcionamiento en CPU exclusivamente, sin LLM y sin acceso a red en tiempo de inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido habitual; su función es la clasificación arancelaria.

## Casos de uso

- Clasificación aduanera asistida en comercio electrónico: el modelo procesa títulos cortos de productos (con una precisión de 0,249 a 10 dígitos y 0,384 a 6 dígitos en el conjunto HSCodeComp) y devuelve alternativas y una pregunta aclaratoria que permite al operador refinar el código sin necesidad de un experto en aranceles.
- Preclasificación en flujos de despacho aduanero: con un prefijo de 6 dígitos ya conocido, el modelo estrecha la búsqueda a los 10 dígitos y devuelve el tipo impositivo básico, lo que acelera la preparación de la declaración en sistemas de gestión aduanera.
- Asistencia a agentes de aduanas y operadores logísticos: la pregunta aclaratoria generada a partir del texto oficial del arancel ("of cotton" frente a "of other textile materials") permite resolver ambigüedades de material sin consultar manualmente el arancel.
- Clasificación de mercancías en catálogos de comercio electrónico japonés: el lector japonés, con una precisión de 0,633 a 6 dígitos en nombres de producto solos (0,601 en elementos sin duplicados cercanos en entrenamiento), permite etiquetar automáticamente productos descritos en japonés.
- Integración en pipelines de CI/CD o servicios de validación de datos: al ser un paquete de 61 MB con 78 MB de memoria residente y 6-36 ms por elemento en Rust, puede desplegarse como microservicio de validación de códigos arancelarios en tiempo real sin GPU.
- Enriquecimiento de bases de datos de producto: el modelo puede ejecutarse por lotes sobre catálogos existentes para asignar códigos HTS de 6 dígitos y tipo impositivo, usando la confianza y las alternativas para marcar los casos que requieren revisión humana.
- Filtrado previo en herramientas de cumplimiento normativo: la combinación de código de 6 dígitos, confianza y tipo impositivo permite detectar productos con tipos arancelarios elevados o categorías sensibles antes de una revisión legal.

## Benchmarks y rendimiento

Resultados de precisión top-1 en elementos de test reservados y evaluados una sola vez (medidos con v0.1.0; v0.2.0 devuelve respuestas idénticas byte a byte para estas entradas):

| Conjunto de test | Elementos | 10 dígitos | 6 dígitos | Top-5 (10 dígitos) |
|---|---|---|---|---|
| Texto tipo resolución (ATLAS test, sin duplicados cercanos de entrenamiento) | 145 | 0,462 | 0,586 | 0,621 |
| Texto tipo resolución (ATLAS test, completo) | 200 | 0,520 | 0,640 | 0,650 |
| Títulos cortos de comercio electrónico (HSCodeComp, parte reservada) | 422 | 0,249 | 0,384 | 0,498 |
| Bienes cotidianos (etiquetas de 6 dígitos) | 98 | — | 0,908 | — |

Con una pregunta aclaratoria respondida correctamente (cota superior), la precisión a 10 dígitos en los títulos de comercio electrónico pasa de 0,249 a 0,363, y a 0,576 con tres preguntas. En los mismos elementos, un índice léxico solo alcanza 0,352 / 0,156 a 10 dígitos. Un modelo público de 6 dígitos con 570M parámetros (`Kenpache/hs-code-classifier-en`) obtiene 0,731 / 0,353 / 0,786 a 6 dígitos (texto tipo resolución / comercio electrónico / bienes cotidianos), por lo que supera a zeiban en texto tipo resolución a 6 dígitos. El objetivo fijado antes del desarrollo (30% a 10 dígitos en HSCodeComp) no se alcanzó.

Japonés: resoluciones de clasificación anticipada publicadas por la Aduana de Japón (1.788 elementos reservados, etiquetas de 6 dígitos):

| Entrada | v0.1.0 | v0.2.0 | v0.2.0, elementos sin duplicado cercano en entrenamiento (1.099) |
|---|---|---|---|
| Solo nombre de producto | 0,345 | 0,633 | 0,601 |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el bundle int8 ocupa 61 MB y unos 78 MB de memoria residente en el runtime Rust.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU.
- Cabe en cualquier CPU consumer; con el runtime Rust funciona con 2 hilos de CPU y 6-36 ms por elemento.
- La implementación en Python con transformers requiere unos 760 MB de memoria (torch y dos encoders), carga en unos 9 s y tarda unos 23 ms por elemento.
- Opciones de despliegue: runtime Rust propio del repositorio de GitHub (con `zeiban.bin` y `zeiban.json`), o Python con transformers y numpy (`zeiban.py`). El modelo está etiquetado como compatible con text-embeddings-inference y endpoints, pero no se detallan configuraciones específicas de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 6-36 ms por elemento en 2 hilos de CPU (Rust); 23 ms por elemento en Python.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión 6 dígitos (resolución / e-commerce / bienes cotidianos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeiban (ikeno-ada) | 29,4M | No disponible | 0,586 / 0,384 / 0,908 | Apache 2.0 | Hugging Face + GitHub |
| Kenpache/hs-code-classifier-en | 570M | No disponible | 0,731 / 0,353 / 0,786 | No disponible | Hugging Face |
| Índice léxico solo (referencia interna) | No aplica | No aplica | — (0,352 / 0,156 a 10 dígitos) | No aplica | No aplica |

No se dispone de información sobre otros modelos comparables de clasificación arancelaria en la documentación proporcionada.

## Limitaciones y advertencias

- El código top-1 de 10 dígitos no es suficientemente preciso para presentar una declaración aduanera tal cual; el propio autor recomienda usar el código de 6 dígitos junto con la confianza y refinar los 10 dígitos con las alternativas y la pregunta aclaratoria.
- No constituye asesoramiento legal ni una resolución aduanera.
- Los tipos impositivos devueltos corresponden únicamente a las columnas básicas del arancel; no incluyen los derechos adicionales del capítulo 99.
- La precisión en títulos cortos de comercio electrónico es baja (0,249 a 10 dígitos), muy por debajo del objetivo del 30% fijado antes del desarrollo.
- El modelo solo soporta inglés y japonés; no se ha evaluado en otros idiomas.
- El estado CLS del encoder es un valor intermedio, no un embedding de frase de propósito general, por lo que no debe reutilizarse como representación semántica genérica.
- La versión del arancel está fijada a `2026HTSRev22`; cambios posteriores en el arancel no se reflejan automáticamente.
- Riesgo de alucinación en el sentido de asignación de códigos plausibles pero incorrectos, mitigado parcialmente por la confianza calibrada y las alternativas.
- No se han documentado sesgos específicos del modelo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las clasificaciones en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ikeno-ada/zeiban
- GitHub (código, runtime Rust y documentación completa en japonés): https://github.com/ikenokazuki/zeiban
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Modelo comparable citado: https://huggingface.co/Kenpache/hs-code-classifier-en
