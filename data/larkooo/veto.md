# larkooo/veto

## Resumen

Veto es un clasificador minúsculo y de código abierto orientado a la detección de anuncios y elementos web intrusivos. Lo desarrolla el usuario larkooo y se distribuye bajo licencia MIT en Hugging Face. A diferencia de un modelo de lenguaje generativo, no procesa texto libre ni imágenes: su entrada es un estado estructurado del DOM (etiqueta, texto, atributos, anchura, altura y visibilidad) y su salida es una distribución de probabilidad sobre seis categorías (`content`, `ad`, `cookie`, `newsletter`, `notification`, `paywall`) junto con marginales binarios.

Técnicamente es una regresión logística multinomial sobre características hasheadas —palabras, bigramas, trigramas de caracteres de atributos y geometría— de 4.096 dimensiones, con pesos cuantizados a int8 por clase. El conjunto aprendido son 24.582 parámetros: 24.576 coeficientes con signo almacenados en Base64 dentro de `model.json` más seis intercepts. El script int8 completo ocupa 33,7 KB y se ejecuta en CPU dentro de navegadores, Node.js y workers, sin dependencias en tiempo de ejecución, sin clave de API, sin GPU y sin subir la página a ningún servidor.

Su relevancia actual es la de un ejemplo extremo de inferencia on-device: un modelo que cabe en decenas de kilobytes, funciona offline y sirve como capa de decisión local para bloqueo de anuncios con preservación de privacidad. El propio autor lo marca como experimental y reconoce que todavía no ha superado al baseline de palabras clave incluido, por lo que debe tratarse como una prueba de concepto reproducible más que como un sustituto de las listas de filtros consolidadas. No dispone de benchmarks publicados en el model-index (lista de resultados vacía).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística multinomial sobre características hasheadas (palabras, bigramas, trigramas de caracteres de atributos y geometría), 4.096 dimensiones, escalado de temperatura en validación |
| Parámetros totales | 24.582 (24.576 coeficientes con signo + 6 intercepts) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (la entrada es un estado estructurado del DOM, no una secuencia de tokens) |
| Tipos de cuantización | Pesos int8 por clase (per-class int8 weights) |
| Idiomas soportados | Inglés (en); datos con sesgo hacia inglés |
| Licencia | MIT (código original, pesos y ejemplos autorales) |
| Formato de pesos | `model.json` con coeficientes en Base64, script ESM `veto.mjs`, declaraciones TypeScript (`types.d.ts`) y `SHA256SUMS` |
| Categorías de salida | `content`, `ad`, `cookie`, `newsletter`, `notification`, `paywall` |
| Tamaño del artefacto | 33,7 KB el script del modelo int8 |
| Pipeline declarado en Hugging Face | No disponible |

## Arquitectura y entrenamiento

El modelo no es un transformer ni una red profunda: es un clasificador lineal multinomial sobre un espacio de características hasheadas de 4.096 dimensiones. Las familias de características documentadas son palabras hasheadas, bigramas, trigramas de caracteres extraídos de los atributos y variables geométricas (anchura, altura y visibilidad del elemento). Sobre esas features se ajusta una regresión logística y se aplica escalado de temperatura calculado en validación. Los pesos se cuantizan a int8 por clase y se serializan como coeficientes con signo codificados en Base64 dentro de `model.json`; el runtime los decodifica sin bibliotecas de terceros.

El entrenamiento parte de 1.232 estados autorales agrupados en 154 familias de escenarios, más 52 estados de desarrollo procedentes de páginas públicas revisadas. Los conjuntos se reparten en 788 ejemplos de entrenamiento, 256 de validación y 240 de regresión sintética, y los grupos de familias se separan antes del entrenamiento para evitar filtración entre particiones. Las fuentes reales de desarrollo cubren cuatro dominios de editores y referencia. No se documenta uso de RLHF ni de DPO, algo coherente con un clasificador supervisado de este tamaño; el código de entrenamiento y la procedencia de los datos están en el repositorio de origen. La innovación destacable no es algorítmica sino de empaquetado: un clasificador funcional en 33,7 KB que corre íntegramente en CPU.

## Capacidades

- Clasificación estructurada de elementos del DOM en seis categorías: contenido, anuncio, aviso de cookies, newsletter, notificación y paywall.
- Salida de probabilidades por clase y marginales binarios mediante la función `classify`.
- Función `decide` con umbrales de acción conservadores y ajustes configurables, que devuelve acciones como `{ action: 'hide', reason: 'ad' }`.
- Ejecución on-device en Node.js 20 o superior, navegadores con módulos ES (`
