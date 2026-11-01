# aaatmy/kuromoji-ipadic-pack

## Resumen

`aaatmy/kuromoji-ipadic-pack` no es un modelo de lenguaje, sino un paquete de recursos autocontenido para análisis morfológico del japonés. Lo publica el usuario aaatmy como dependencia del proyecto Karaoke Battle, una aplicación que añade romaji bajo letras de canciones japonesas. El paquete incluye `kuromoji.js` 0.1.2 con su diccionario mecab-ipadic 2.7.0-20070801, además de las dependencias necesarias para ejecutarse sin instalación de npm.

El problema que resuelve es la distribución offline de un tokenizador japonés en un entorno Deno con `nodeModulesDir: manual` y `--cached-only`. En lugar de requerir una instalación completa desde el registro de npm en tiempo de ejecución, el paquete empaqueta el código y el diccionario en un zip verificable mediante SHA256. Es relevante para desarrolladores que necesiten segmentación morfológica japonesa en aplicaciones de escritorio o herramientas sin conectividad.

El repositorio tiene un tamaño declarado de 0.0 GB, sin descargas ni likes en el momento de la consulta, y no expone pipeline de HuggingFace. La licencia del conjunto es Apache-2.0, aunque el diccionario IPADIC se rige por los términos NAIST/ICOT que permiten la redistribución conservando los avisos de copyright.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un tokenizador morfológico basado en diccionario) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (procesa líneas de texto de forma independiente) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 (el diccionario IPADIC bajo términos NAIST/ICOT) |
| Formato de pesos | no aplica; el paquete se distribuye como `kuromoji-pack.zip` con código TypeScript, `node_modules/` y `SHA256SUMS` |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con datos estadísticos, sino de un analizador morfológico determinista basado en el diccionario mecab-ipadic 2.7.0-20070801. `kuromoji.js` implementa la segmentación y el etiquetado de palabras mediante un autómata de diccionario (doublearray) y reglas de conexión del propio IPADIC. No hay fase de preentrenamiento, ajuste fino, RLHF ni DPO.

El paquete incluye `kuromoji.js` 0.1.2 con sus dependencias `async`, `lodash`, `doublearray` y `zlibjs`, sin modificaciones salvo la eliminación de carpetas de test, demo, builds de navegador y `lodash/fp`. El script `ja_reading.ts` recibe un array JSON de líneas y devuelve, por línea, los tokens con forma superficial, lectura en katakana, categoría gramatical y primer detalle de la categoría. Está pensado para ejecutarse con Deno en modo offline.

## Capacidades

- Segmentación morfológica de texto japonés en tokens.
- Obtención de lectura en katakana por token, útil para generar romaji.
- Etiquetado de categoría gramatical (part of speech) y primer detalle asociado.
- Procesamiento por líneas independientes, adecuado para letras de canciones y textos cortos.
- Ejecución offline con Deno mediante `--cached-only` y `nodeModulesDir: manual`.
- Verificación de integridad del paquete mediante `SHA256SUMS`.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Generación de romaji para letras japonesas: el script `ja_reading.ts` convierte cada línea en tokens con lectura en katakana, que después puede transliterarse a romaji para karaokes o subtítulos.
- Anotación morfológica en herramientas de estudio de japonés: permite mostrar a estudiantes la segmentación y la categoría gramatical de cada palabra de una frase.
- Preprocesamiento para búsqueda o indexación en japonés: la tokenización por diccionario sirve para dividir texto antes de aplicar índices o filtros, sin depender de servicios en la nube.
- Aplicaciones de escritorio o CLI sin conectividad: al ejecutarse con Deno en modo offline, encaja en entornos donde no se puede instalar npm en tiempo de ejecución.
- Integración en pipelines de CI con verificación de integridad: el `SHA256SUMS` permite validar el zip antes de usarlo en builds reproducibles.
- Prototipos de análisis lingüístico: permite obtener categorías gramaticales y lecturas para corpus pequeños sin montar MeCab nativo ni dependencias del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; es un tokenizador basado en diccionario, sin inferencia neuronal.
- GPU: no requiere GPU.
- CPU: cualquier CPU capaz de ejecutar Deno; el consumo depende del tamaño del diccionario IPADIC cargado en memoria.
- Memoria RAM: no se especifica cifra concreta en la información disponible; el diccionario IPADIC y las estructuras doublearray se cargan en memoria del proceso.
- Despliegue: Deno con `nodeModulesDir: manual` y `--cached-only`; también puede usarse el `node_modules/` incluido en otros entornos Node.js, aunque el paquete está pensado para Deno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Idioma | Licencia | Distribución |
|---|---|---|---|---|
| kuromoji-ipadic-pack | Tokenizador morfológico JS con IPADIC | Japonés | Apache-2.0 (IPADIC NAIST/ICOT) | Zip offline para Deno |
| MeCab + IPADIC | Analizador morfológico nativo | Japonés | BSD/GPL/LGPL (MeCab) + NAIST/ICOT (IPADIC) | Binario del sistema |
| SudachiPy | Analizador morfológico Python | Japonés | Apache-2.0 | Paquete Python |
| Janome | Analizador morfológico Python puro | Japonés | Apache-2.0 | Paquete Python |

La comparativa se limita a herramientas de la misma categoría (análisis morfológico japonés); no hay datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde preguntas.
- Solo soporta japonés; no hay capacidades multilingües.
- El diccionario IPADIC es de 2007, por lo que puede no cubrir neologismos, jerga reciente o nombres propios actuales.
- La licencia del conjunto es Apache-2.0, pero el diccionario IPADIC exige conservar los avisos de copyright NAIST/ICOT; es necesario revisar `NOTICE-kuromoji-ipadic.md` antes de redistribuir.
- Es un paquete de la comunidad, no una release oficial de kuromoji.js ni de mecab-ipadic.
- El repositorio no declara pipeline ni métricas de calidad; no hay evaluación publicada.
- El procesamiento es por líneas independientes, sin gestión de contexto entre líneas.

## Enlaces

- HuggingFace: https://huggingface.co/aaatmy/kuromoji-ipadic-pack
- Proyecto Karaoke Battle: https://github.com/Hikari-Tsai/karaoke-battle
- kuromoji.js: https://github.com/takuyaa/kuromoji.js
- Deno: https://deno.com
