# Jessedbrown/the-colour-qr

## Resumen

`Jessedbrown/the-colour-qr` no es un modelo de inteligencia artificial: es un repositorio que describe e implementa un esquema de codificación de datos en imágenes. La idea central es que un símbolo QR convencional es monocromo y desaprovecha dos de los tres canales de color, de modo que el proyecto coloca un QR ordinario e independiente en el plano rojo, otro en el verde y otro en el azul de una misma imagen. Cada plano se decodifica por separado con cualquier lector QR estándar, de manera que una sola imagen transporta tres cargas útiles distintas.

El repositorio no contiene pesos, ni arquitectura neuronal, ni proceso de entrenamiento, ni datos de entrenamiento. Lo que contiene es una especificación de codificación y descodificación, un fichero `index.html` autocontenido que funciona como descodificador real (cámara o selección de ficheros, sin red ni paso de compilación) y un conjunto de medidas de verificación sobre un caso real. El autor declara además una regla de herramienta global para cualquier código futuro: Rust 1.81 con clippy, aritmética entera y ternaria (trits) únicamente, nunca coma flotante.

La relevancia del artefacto es de ingeniería de datos, no de aprendizaje automático: propone triplicar la capacidad de símbolos QR por imagen manteniendo la compatibilidad con descodificadores ya desplegados en cualquier teléfono, con verificación de integridad mediante sha256 y descarte de fragmentos corruptos. La licencia y los idiomas no están declarados en la información disponible, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo neuronal). Esquema de codificación: troceado en bloques de 2.100 bytes, índice uint32 little-endian de 4 bytes, Base64 y un QR ordinario por bloque, compuesto en los planos R, G y B |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible. El esquema opera sobre bytes (Base64 + QR), por lo que es independiente del idioma del contenido |
| Licencia | no disponible |
| Formato de pesos | no aplica (no hay pesos). El repositorio distribuye una página HTML estática y ficheros de datos |
| Tipo de artefacto | Esquema de codificación y descodificación de datos en imágenes QR en color |
| Version de Rust exigida | 1.81.0, con clippy; `rust-version = "1.81"` en cualquier `Cargo.toml`; prohibido `f32`/`f64` |
| Trazabilidad | Cada fichero lleva un sidecar `.sha256` y una fila en `COLOUR-QR-RECEIPT-2026-08-06.hbp` |
| Punto de acceso | `https://jessebrown1980.github.io/the-colour-qr/` (una sola página estática, sin dependencias ni build) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-16 / 2026-08-07 (según los metadatos del repositorio) |

## Arquitectura y entrenamiento

No existe entrenamiento ni modelo estadístico. La "arquitectura" del artefacto es un procedimiento determinista de codificación en seis pasos: se toma la carga útil `P` de `N` bytes; se corta en bloques de 2.100 bytes (el último es el resto); a cada bloque `i` se le antepone un uint32 little-endian de 4 bytes con su índice, denominado índice de Fischer (el bloque 30 empieza por `1e 00 00 00` y el 31 por `1f 00 00 00`); ese bloque indexado se codifica en Base64; el Base64 se renderiza como un QR ordinario, sin codificador propio; y tres símbolos se componen en una sola imagen, de forma que el bloque `3k` va al plano rojo, el `3k+1` al verde y el `3k+2` al azul, quedando como relleno cualquier plano sin bloque asignado. El orden de recepción no importa porque el índice lo transporta el propio bloque.

La descodificación invierte el proceso: separar los planos R, G y B sin convertir a escala de grises, ejecutar un decodificador QR ordinario sobre cada plano por separado (un plano de relleno no es un error), decodificar el Base64, leer los 4 primeros bytes como índice, ordenar los cuerpos por índice, concatenar y comparar el sha256. La tolerancia a fallos es estructural: como cada plano falla o sobrevive de forma independiente gracias a sus patrones de localización, marcas de alineación, información de formato y Reed-Solomon, un bloque cuyo Reed-Solomon falla nunca llega y se descarta, jamás se fusiona con datos incorrectos. La innovación es, en palabras del propio autor, que la parte difícil no requiere inventar nada nuevo.

Las medidas declaradas sobre la pila real usan como fuente un fichero en bruto del JWST (CEERS F277W) de 65.536 bytes, que se trocea en 31 bloques de 2.100 bytes más un resto de 436 bytes, sin holgura. Eso da 32 bloques y 11 códigos en color; el código 11 lleva el bloque 30 en R, el 31 en G y relleno en B. El sha256 de entrada y de salida coincide (`150760ca872afc9e41e433f9`, valor truncado en la documentación), y la lectura de vuelta se hizo de forma independiente desde un recorte de 457 px de una captura de pantalla: el plano R devuelve la cabecera `1e000000` y 2.100 bytes de cuerpo, el plano G devuelve `1f000000` y 436 bytes, el plano B no contiene símbolo, y el total de 2.536 bytes coincide con lo esperado.

## Capacidades

- Codificación de una carga útil arbitraria en imágenes: divide cualquier flujo de bytes en bloques de 2.100 bytes, los indexa con un uint32 little-endian y los renderiza como QR estándar en Base64.
- Transporte de tres cargas independientes por imagen: un símbolo completo por cada canal R, G y B, con decodificación independiente por plano.
- Reordenación sin estado externo: el índice de Fischer viaja dentro de cada bloque, de modo que la reconstrucción no depende del orden de llegada de las imágenes.
- Verificación de integridad extremo a extremo: comparación sha256 de entrada y salida sobre el conjunto concatenado.
- Tolerancia a fallos por descarte: un bloque perdido por fallo de Reed-Solomon se omite y nunca se mezcla con datos válidos.
- Descodificación con herramientas ya existentes: cualquier lector QR convencional sirve para cada plano; el repositorio no introduce un codificador propietario.
- Descodificador autocontenido: `index.html` funciona desde cámara o desde ficheros de imagen, sin red, sin dependencias y sin paso de compilación, y decodifica los ficheros a resolución completa sin reducirlos.
- Trazabilidad documental: sidecars `.sha256` por fichero y un registro de recibos (`COLOUR-QR-RECEIPT-2026-08-06.hbp`).
- Restricción de toolchain aplicable a contribuciones futuras: Rust 1.81 con clippy, `cargo clippy --all-targets -- -D warnings` en CI y un grep que falla ante cualquier `f32`/`f64`.
- No aplica: generación de texto, razonamiento, código, matemáticas, visión por computador, audio, tool calling, function calling, agentes, razonamiento multi-paso, modo de pensamiento ni capacidades multilingües de un modelo de lenguaje. Ninguna de estas capacidades está presente porque no hay modelo.
- No disponible: capacidades adicionales no descritas en la información proporcionada.

## Casos de uso

- Archivado y verificación de datos científicos: el caso medido en el repositorio, un fichero en bruto de 65.536 bytes del JWST, se reparte en 11 imágenes en color con verificación sha256 byte a byte. Es adecuado porque cada bloque es autodescriptivo y la integridad se comprueba al final, lo que permite validar una restauración sin depender del orden de los ficheros.
- Transferencia en entornos aislados (air-gapped): al ser una página estática sin red ni dependencias, un operador puede mover datos imprimiendo o mostrando los códigos y leerlos con la cámara de cualquier teléfono, sin instalar software adicional ni conectar la máquina receptora.
- Cadena de custodia y registro de evidencias: los identificadores que aparecen en la propia documentación (EVT-CHECK-IN, M-EYEWITNESS) y la práctica de sidecar `.sha256` por fichero encajan con un flujo en el que cada imagen entregada deja huella verificable y fila en el recibo `COLOUR-QR-RECEIPT-2026-08-06.hbp`.
- Limitación del área de impresión: cuando el espacio físico es escaso (etiquetas, planos, pegatinas, sellos de documentación), colocar tres símbolos por imagen en lugar de uno reduce a un tercio el número de marcas a imprimir para la misma carga.
- Preservación digital y distribución de paquetes: dividir un fichero en 11 imágenes con índices internos permite servir o almacenar los fragmentos por canales distintos y reconstruir el original con independencia de la velocidad de llegada de cada pieza.
- Lectura degradada con descarte seguro: en capturas imperfectas, un plano que no supera Reed-Solomon se elimina y los otros dos siguen entregando datos completos; el sha256 final indica si el conjunto quedó íntegro, evitando reconstrucciones silenciosamente corruptas.
- Auditoría e interoperabilidad sin dependencias: al no usar un codificador propio, el formato puede verificarse con lectores QR comerciales en un proceso de auditoría, y `index.html` sirve como referencia de implementación ejecutable.
- Integración en desarrollo si se añade código: cualquier contribución de código debe compilar con Rust 1.81 y pasar clippy sin avisos, con prohibición estricta de aritmética en coma flotante, lo que fija un comportamiento reproducible entre plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de aprendizaje automático en la información disponible, porque el artefacto no es un modelo. Sí se incluyen medidas de verificación sobre la pila real, que se reproducen tal cual:

| Medida | Resultado |
|---|---|
| Fuente | JWST en bruto, CEERS F277W |
| Tamano de origen | 65.536 B |
| Troceado | 31 x 2.100 + 436 = 65.536 (exacto, sin holgura) |
| Bloques / códigos | 32 bloques, 3 por imagen, 11 códigos en color |
| Composicion del codigo 11 | R = bloque 30, G = bloque 31, B = relleno |
| sha256 entrada | 150760ca872afc9e41e433f9 |
| sha256 salida | 150760ca872afc9e41e433f9 (byte a byte identico) |
| Lectura de vuelta | Desde un recorte de 457 px de una captura de pantalla, no desde el fichero original |
| Plano R | Cabecera `1e000000`, bloque 30, cuerpo de 2.100 B |
| Plano G | Cabecera `1f000000`, bloque 31, cuerpo de 436 B |
| Plano B | Sin simbolo (relleno, conforme a lo etiquetado) |
| Total reconstruido | 2.100 + 436 = 2.536 B, coincide con "rows 246-255" |
| Decodificacion desde hoja de contactos | 0 / 11 |
| Decodificacion desde primer plano | 2 / 2 |
| Densidad en la hoja de contactos | ~285 px de ancho para un simbolo de version 40 (177 modulos) = ~1,6 px por modulo, por debajo del umbral de ~3 px por modulo |

## Requisitos de hardware

- GPU: no aplica. No hay modelo que inferir; el proceso es aritmética entera y decodificación de imágenes.
- CPU y navegador: cualquier equipo capaz de ejecutar un navegador moderno puede abrir `index.html`, que es autocontenido, sin red, sin dependencias y sin paso de compilación.
- Movil: un teléfono con cámara y un lector QR estándar es suficiente para leer cada plano por separado.
- Requisito de resolución: el documento fija un suelo práctico de aproximadamente 3 px por módulo. Un símbolo de versión 40 tiene 177 módulos, de modo que renderizado a unos 285 px de ancho queda en ~1,6 px por módulo y resulta ilegible (0 de 11 en el ejemplo). Los códigos deben leerse a su tamano nativo, nunca ampliados desde una hoja de contactos.
- Cabe en hardware de consumo: sí, en cualquier ordenador o teléfono actual; no se requiere acelerador ni VRAM concreta.
- Almacenamiento: no disponible como cifra general. En el ejemplo medido, 65.536 bytes ocupan 11 imágenes en color.
- Opciones de despliegue: página estática (por ejemplo, GitHub Pages), servidor de ficheros estáticos o distribución local del HTML y las imágenes. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se publican tiempos de codificación, descodificación ni velocidad de lectura.
- Requisitos de compilación si se anade codigo: Rust 1.81.0 con clippy, `cargo clippy --all-targets -- -D warnings` en integración continua y un grep que falla ante cualquier `f32`/`f64`.

## Comparativa con modelos similares

No se proporcionan datos comparativos con otros esquemas de codificación en la información disponible, ni tampoco resultados de benchmarks frente a alternativas. La única comparación que puede derivarse del material aportado es estructural:

| Aspecto | QR monocromo convencional | the-colour-qr | Otras alternativas (JAB Code, QR multifotograma, codigos 2D en color) |
|---|---|---|---|
| Simbolos por imagen | 1 | 3 (uno por canal R, G y B) | no disponible |
| Compatibilidad de decodificacion | Lectores QR estandar | Lectores QR estandar por plano, sin codificador propio | no disponible |
| Indice de reordenacion interno | no aplica (carga unica) | Si, uint32 little-endian de 4 bytes por bloque | no disponible |
| Verificacion de integridad | No incorporada por el formato | sha256 externo sobre el conjunto concatenado | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad publica | Estandar de facto en cualquier telefono | Repositorio con 0 descargas y 0 likes | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura neuronal, datos de entrenamiento ni proceso de ajuste. No puede usarse para generación de texto, razonamiento, código ni ninguna tarea de aprendizaje automático.
- Licencia no disponible: al no declararse licencia en el repositorio, no puede asumirse permiso para uso comercial, redistribución o modificación. Conviene aclararlo con el autor antes de cualquier uso en producción.
- Sensibilidad a la resolucion: en el ejemplo documentado, una hoja de contactos con 11 códigos a ~285 px de ancho produce 0 decodificaciones correctas de 11 (~1,6 px por módulo, por debajo del umbral de ~3 px por módulo). Los códigos deben leerse a tamano nativo.
- Prohibido convertir a escala de grises: esa conversión destruye los tres planos simultáneamente y es el error de lectura más directo del esquema.
- Perdida silenciosa de bloques: un bloque cuyo Reed-Solomon falla se descarta y nunca se fusiona, lo que evita corrupción pero puede producir una reconstrucción parcial; la única comprobación de integridad es el sha256 final, que hay que ejecutar de forma explícita.
- Comportamiento ante compresion con perdida no documentado: la documentación solo indica que los ficheros se decodifican a resolución completa y nunca se reducen, pero no especifica qué ocurre con recodificaciones JPEG u otras compresiones que alteran los canales de croma. No hay datos disponibles al respecto.
- Sin datos de rendimiento: no se publican tiempos de codificación, descodificación, tasas de éxito por condiciones de iluminación ni pruebas con distintos sensores de cámara.
- Restriccion de toolchain poco habitual: la regla de Rust 1.81 con clippy, aritmética entera y ternaria y prohibición total de `f32`/`f64` condiciona cualquier desarrollo futuro y puede limitar la contribución de terceros o la reutilización de bibliotecas habituales.
- Metadatos narrativos ajenos a la parte tecnica: el repositorio incluye nomenclatura propia (habitaciones del Brown-Hilbert Hotel, `catalogs.json`, referencias a roll-call) que no se define técnicamente en la documentación y no aporta información verificable sobre el formato.
- Cifras incompletas: el sha256 citado en la documentación aparece truncado a 24 caracteres hexadecimales (`150760ca872afc9e41e433f9`), no como un hash completo de 64 caracteres, por lo que no sirve para una verificación independiente tal cual está publicado.
- Fechas de metadatos incongruentes con el ciclo de vida aparente: la fecha de actualizacion (2026-08-07) es anterior a la de creacion (2026-10-16) segun los metadatos recibidos; conviene tratarlas con cautela.
- Sin adopcion observable: 0 descargas y 0 likes, sin pipeline declarado, lo que implica ausencia de validacion por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/the-colour-qr
- Descodificador en vivo (una sola pagina estatica): https://jessebrown1980.github.io/the-colour-qr/
- Pagina puente citada en la model card: https://jessebrown1980.github.io/the-bridge-to-all-of-it/
- Fichero de recibos referenciado: `COLOUR-QR-RECEIPT-2026-08-06.hbp`
- Catalogo referenciado: `catalogs.json`
- Paper, blog tecnico, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.
