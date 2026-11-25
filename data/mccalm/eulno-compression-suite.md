# McCalm/eulno-compression-suite

## Resumen

EULNO (formato `.elp8`) es una suite de compresion sin perdidas escrita en Python puro y basada en enteros, distribuida como repositorio de Hugging Face por el autor McCalm bajo la etiqueta `McCalm/eulno-compression-suite`. No es un modelo de lenguaje ni una red neuronal: es un motor de compresion y una CLI de archivado que combina geometria discreta de tetraedros 3D, operadores de diferencia multi-paso, slicing por planos de bits con codificacion combinatoria Pascal acelerada por CTZ y transformadas Move-To-Front. La version publicada es `v0.9.0-beta`, una beta publica de investigacion.

El problema que aborda es la compresion de datos heterogeneos (curvas de sensores, rejillas espaciales 3D, texto estructurado y datos cifrados o aleatorios) dentro de un mismo flujo, sin que un unico metodo rigido penalice a los tipos de datos para los que no esta disenado. Para ello segmenta la entrada en bloques (por defecto 1 MiB), inspecciona la estructura matematica de cada bloque y selecciona mediante un enrutador MDL (Minimum Description Length) la combinacion de transformaciones que produce la representacion verificada mas pequena.

Su relevancia actual es acotada y de nicho: se trata de un proyecto experimental sin descargas ni likes en el momento de la consulta, con licencia propia `eulno-community-2.0` y sin pipeline declarado. Resulta de interes para investigadores en compresion sin perdidas, codificacion enumerativa y arquitecturas de contenedor autoverificables, no para tareas de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de compresion sin perdidas en Python puro, basado en enteros; enrutador MDL sobre 6 modos (Gears 0-5) con transformadas geometricas 3D, diferencias multi-paso, planos de bits y MTF |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; trabaja por bloques de 1 MiB por defecto) |
| Tipos de cuantizacion | no disponible (no aplica; compresion sin perdidas bit-exacta) |
| Idiomas soportados | no disponible (no aplica; opera sobre bytes, no sobre texto) |
| Licencia | `eulno-community-2.0` (etiqueta `license: other`, con enlace a fichero LICENSE) |
| Formato de pesos | no disponible (no aplica); contenedor de archivo propio `.elp8` con cabecera maestra de 96 bytes |

## Arquitectura y entrenamiento

No hay entrenamiento: EULNO no es un modelo estadistico aprendido, sino un compresor determinista. Su diseno se articula en torno a un contenedor `.elp8` con cabecera maestra de 96 bytes alineada a 16 bytes, que incluye un ancla criptografica SHA-512 obligatoria de 64 bytes calculada al inicio y validacion estricta de fronteras entre bloques. La entrada se divide en bloques (1 MiB por defecto) y cada bloque lleva una cabecera de 9 bytes con el identificador del Gear elegido.

El nucleo es un enrutador MDL que, para cada bloque, ejecuta las transformadas candidatas y compara el tamano exacto en bytes resultante, incluidos los metadatos necesarios para invertir el paso. Se ofrecen dos perfiles: `TURBO` (`-m turbo`), que restringe el enrutado a Gear 0 (bypass de ruido) y Gear 1 (operador de diferencia unificado mas ZigZag vectorizado) para throughput en tiempo real de 70-192 MB/s en Python puro; y `MAX` (`-m max`, por defecto), que activa el enrutador completo sobre los Gears 0 a 5. Los cinco Gears especializados son: G0 `RAW` (prefiltro de doble entropia H(X) y H(dX) que detecta ruido incompresible en menos de 0,25 ms sin expansion del payload); G1 `TURBO_ZIGZAG` (ecuacion de diferencia espacial/curva unificada `(X_i - k X_{i-s} + (k-1) X_{i-2s}) mod 256` con plegado de signo ZigZag vectorizado); G2 `NIBBLE_16x64` (descomposicion en nibbles de 4 bits y transposicion matricial de 64 columnas); G3 `TETRA3D_SPARSE` (predictor de gradiente causal sobre tetraedro 3D con rachas jerarquicas de macro-ceros de 32, 512, 4096 y 32768 y codificacion rANS dispersa de 20 simbolos); G4 `BITPLANE_PASCAL` (slicing en 8 planos de bits, deteccion de bordes por XOR bit a bit y codificacion enumerativa Pascal C(64,k) acelerada por CTZ mediante `w & -w`); y G5 `MTF_TETRA3D` (ranking de recencia Move-To-Front combinado con codificacion de gradiente sobre tetraedro 3D).

Como innovaciones destacables figuran la verificacion de integridad bit-exacta integrada en el contenedor (comprobacion completa con `-t`, inspeccion de cabecera con `-i`), el empaquetado seguro de arboles de directorios frente a path traversal, y una autoprueba interactiva `--self-test` de 6 pasos con limpieza automatica de ficheros temporales. Todo el motor evita coma flotante para eliminar deriva numerica.

## Capacidades

- Compresion sin perdidas bit-exacta de ficheros y directorios completos en un unico contenedor `.elp8`.
- Enrutado automatico por bloque entre seis estrategias de transformacion segun el principio MDL, garantizando que ningun bloque empeora respecto a la representacion alternativa.
- Deteccion rapida de datos incompresibles (ruido o cifrado) con bypass instantaneo sin expansion del payload.
- Dos perfiles de operacion: `TURBO` orientado a throughput en tiempo real y `MAX` orientado a maxima relacion de compresion.
- Verificacion criptografica de integridad mediante SHA-512 en cabecera y validacion de fronteras de bloque.
- Inspeccion de metadatos del contenedor y verificacion completa del archivo desde la CLI.
- Empaquetado de arboles de directorios con proteccion contra path traversal.
- Autoprueba end-to-end integrada para validacion del entorno.
- No dispone de tool calling, razonamiento, generacion de texto, vision, audio ni capacidades multilingues: no es un modelo de IA.

## Casos de uso

- Archivado de datasets cientificos heterogeneos: un directorio con curvas de sensores, rejillas volumetricas y ficheros de texto se comprime con un unico flujo, y el enrutador MDL aplica G1 a las curvas, G3 a las rejillas y G5 al texto estructurado sin intervencion manual.
- Preservacion a largo plazo con verificacion de integridad: la cabecera SHA-512 de 64 bytes y la comprobacion `-t` permiten detectar corrupcion bit a bit en archivos archivados, adecuado para repositorios de datos que exigen garantias de fidelidad.
- Compresion de datos de simulacion 3D: los predictores de gradiente sobre tetraedro causal (G3 y G5) estan disenados para rejillas espaciales con correlacion local, lo que encaja con volumentes de CFD, escaneres 3D o datos de voxeles.
- Preprocesado en pipelines de investigacion sobre compresion: al ser Python puro y determinista, sirve como banco de pruebas reproducible para comparar transformadas (diferencias multi-paso, codificacion enumerativa Pascal, rANS dispersa) frente a compresores clasicos.
- Empaquetado de artefactos con proteccion de rutas: la CLI permite agrupar arboles de directorios en un contenedor unico con validacion de rutas, util para distribuir resultados de experimentos entre entornos.
- Filtro rapido de datos incompresibles: el prefiltro de doble entropia de G0 descarta en menos de 0,25 ms bloques de ruido o cifrado, evitando coste computacional inutil en pipelines que procesan volumenes mixtos.
- Entornos sin dependencias binarias: al ser Python puro, puede desplegarse donde no se permite instalar compresores nativos compilados, a costa de un throughput inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es el throughput del perfil `TURBO` en Python puro: 70-192 MB/s. No se aportan tasas de compresion, comparaciones con otros compresores ni resultados de la autoprueba.

## Requisitos de hardware

- VRAM: no aplica; no es un modelo neuronal y no requiere GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica; la ejecucion es en CPU sobre Python puro.
- Opciones de despliegue: CLI propia del paquete y modulo Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: perfil `TURBO` declarado en 70-192 MB/s; el perfil `MAX` no publica cifras, y por su naturaleza (ejecuta varios Gears por bloque y elige el menor) cabe esperar un coste mayor, aunque no se cuantifica en la informacion disponible.
- Memoria RAM: no disponible; depende del tamano de bloque (1 MiB por defecto) y del modo de empaquetado de directorios.

## Comparativa con modelos similares

| Herramienta | Tipo | Formato | Verificacion de integridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EULNO (`McCalm/eulno-compression-suite`) | Compresor sin perdidas multi-estrategia en Python puro | `.elp8` | SHA-512 en cabecera + validacion de bloques | `eulno-community-2.0` | Repositorio de Hugging Face, beta publica, 0 descargas |
| zstd | Compresor sin perdidas con diccionarios y modos rapidos | `.zst` | Checksum opcional (XXH64) | BSD-3-Clause | Ampliamente distribuido |
| xz / LZMA2 | Compresor sin perdidas basado en LZ y modelado de rango | `.xz` | Checksum CRC32/CRC64/SHA-256 opcional | Dominio publico / LGPL | Estandar en sistemas Unix |
| brotli | Compresor sin perdidas orientado a web | `.br` | No integra checksum criptografico | MIT | Integrado en navegadores y servidores |

La comparacion es estructural: EULNO se distingue por su enrutado MDL por bloque y su ancla SHA-512 obligatoria, pero no se dispone de datos de ratio de compresion ni de throughput comparativo frente a estas herramientas en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Version `v0.9.0-beta` experimental: el propio autor advierte de mantener copias de seguridad independientes y verificadas antes de probar el formato con ficheros importantes.
- Sin datos publicados de ratio de compresion ni de rendimiento del perfil `MAX`; no es posible evaluar su eficacia real frente a compresores establecidos.
- Proyecto sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas documentados.
- Licencia `eulno-community-2.0` (etiqueta `other`): las condiciones de uso comercial no se detallan en la informacion disponible; es imprescindible revisar el fichero LICENSE antes de cualquier uso en produccion.
- Python puro implica throughput muy inferior al de compresores nativos; el rango de 70-192 MB/s corresponde solo al perfil `TURBO`.
- Riesgo de incompatibilidad de formato: al ser una beta, el contenedor `.elp8` puede cambiar entre versiones, lo que comprometeria la legibilidad de archivos creados con versiones anteriores.
- No aplica riesgo de alucinacion ni sesgos de modelo por no ser un modelo de lenguaje; el riesgo relevante es la perdida de datos por fallo del motor o del contenedor.
- La deteccion de ruido de G0 y el enrutado MDL anaden complejidad; en datos muy pequenos el sobrecoste de cabeceras (96 bytes maestros mas 9 bytes por bloque) puede dominar el resultado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/McCalm/eulno-compression-suite
- Fichero de licencia referenciado en la model card: LICENSE (en el propio repositorio)
- Paper, blog, repositorio de codigo independiente o demo: no disponible en la informacion proporcionada.
