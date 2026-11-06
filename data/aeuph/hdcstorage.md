# AEUPH/hdcstorage

## Resumen

HDCSTORAGE no es un modelo de lenguaje en el sentido habitual, sino un entorno de computación hiperdimensional implementado en Python puro que almacena todo su estado (registros, pila, literales, constantes de cadena y registros de herramientas) como hipervectores de 10 000 bits. Lo desarrolla el usuario AEUPH y se publica en Hugging Face bajo el identificador `AEUPH/hdcstorage`, con la librería `hdcstorage` como dependencia declarada. El repositorio tiene un tamaño de 0.0 GB y, en el momento de la consulta, cero descargas y cero likes, lo que indica un proyecto incipiente o de investigación.

El sistema se apoya en Binary Spatter Codes: `bind` es una XOR, `bundle` es una mayoría bit a bit, `permute` es una rotación y la similitud se calcula con `popcount`. Sobre esa álgebra se construye un compilador de un lenguaje ensamblador propio (`.hdcasm`), una memoria direccionable por contenido, un intérprete con depurador e IDE, una capa de agentes con herramientas residentes en la propia memoria HDC y un servidor MCP que habla JSON-RPC sobre stdio.

Su relevancia es conceptual y experimental: demuestra que se puede implementar una máquina completa, incluida una capa de agentes, usando únicamente la biblioteca estándar de Python y representaciones hiperdimensionales, sin numpy ni dependencias de terceros. No debe confundirse con un modelo generativo: no hay pesos neuronales entrenados, no hay tokenizador ni pipeline de inferencia de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Computación hiperdimensional (HDC) con Binary Spatter Codes; máquina virtual con memoria direccionable por contenido y capa de agentes MCP |
| Parámetros totales | no disponible (no es un modelo neuronal; la dimensionalidad por defecto es de 10 000 bits por hipervector) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible; representación binaria nativa de 10 000 bits (1 250 bytes por vector) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors declarado en los tags; el almacenamiento propio es una imagen `.hdc` (magic, cabecera, vectores empaquetados y tabla de símbolos) |

## Arquitectura y entrenamiento

La arquitectura es un intérprete de instrucciones cuyos operandos son hipervectores. El compilador (`assembler.py`) traduce fuente `.hdcasm` a hipervectores de instrucción que se escriben en celdas de una memoria HDC (`memory.py`); la recuperación se hace por contenido y la decodificación por *cleanup memory*, es decir, preguntando a qué símbolo conocido se parece más el vector recuperado en lugar de leer un campo de bits fijo. El álgebra subyacente (`hypervec.py`) define `bind` como XOR, `bundle` como mayoría bit a bit implementada con contadores binarios por lane y comparador bit-sliced (coste `O(n·log n)` en operaciones con enteros grandes), `permute` como rotación y `similarity` como `(d - 2·popcount(a^b)) / d`.

No hay entrenamiento en el sentido de descenso de gradiente: los datos de entrenamiento no aplican y no se documenta ningún proceso de RLHF ni DPO. Las innovaciones técnicas destacables son la codificación entera en complemento a dos de 32 bits como superposición de átomos de posición de bit (codec simbólico, no preservador de similitud), la resolución de direcciones dañadas con confianza reportada (12 bits volteados de 10 000 resuelven a ~0.998), la búsqueda asociativa sobre valores de celda (`recall`) como lectura *compute-in-memory*, y una capa BitNet de autocomprobación (`python -m hdc net`). El proyecto incluye además un pipeline de imagen por shader HDC (dim, bordes, profundidad, normales), un "webOS" con escritorio, ventanas y aplicaciones, y un arranque simulado POST → splash → AUTOEXEC.

## Capacidades

- Ejecución de programas escritos en `.hdcasm` mediante compilación a hipervectores y decodificación por cleanup memory.
- Memoria direccionable por contenido con resolución tolerante a daños y reporte de confianza.
- Búsqueda asociativa sobre valores de celda (`recall(probe, k)`), equivalente a una lectura compute-in-memory.
- Depuración e IDE interactivo en modo REPL (`python -m hdc ide`, `debugger.py`).
- Capa de agentes con registros de herramientas almacenados como hipervectores y opcode `TOOL`.
- Servidor MCP con JSON-RPC sobre stdio, con autocomprobación de protocolo integrada (`--selftest`).
- Aritmética simbólica: sumador completo HDC ejecutable etapa por etapa (`python -m hdc adder`).
- Pipeline de imagen por shader HDC: reducción de dimensión, detección de bordes, profundidad y normales.
- Autocomprobación de una capa tipo BitNet (`python -m hdc net`).
- Simulación de autonomía con ticks de inactividad y readahead sobre una sesión simulada.
- Interfaz de asistente conversacional (`python -m hdc assist --autonomous`) con métrica de precisión de siguiente intención del 80 % a dimensión 2000 y 70 % a 10 000 sobre un codebook fijo de 21 símbolos.
- Registro de herramientas residente en HDC consultable (`python -m hdc tools`).
- Entorno tipo sistema operativo: escritorio, ventanas, aplicaciones y mapa de memoria (`python -m hdc os`).
- Suite de más de 300 tests unitarios (`python -m hdc test`).
- Todas las órdenes aceptan `--d <int>` para cambiar la dimensionalidad (por defecto 10 000).

## Casos de uso

- Investigación en computación hiperdimensional: el proyecto sirve como banco de pruebas reproducible para estudiar bind/bundle/permute, cleanup memory y resolución por contenido con métricas medidas (`random pair similarity` media +0.0001, sd 0.0100; bundle de 5 miembros recuperado a 0.369–0.382).
- Docencia de arquitecturas alternativas: el sumador completo por etapas y el ensamblador `.hdcasm` permiten ilustrar paso a paso cómo se ejecuta una instrucción cuando los operandos son vectores de 10 000 bits.
- Prototipado de agentes con herramientas: la capa `agent.py` más `mcp_server.py` permite exponer herramientas a un cliente MCP y estudiar cómo se almacenan y recuperan registros de herramienta en la propia memoria HDC.
- Experimentos de memoria tolerante a fallos: la resolución de direcciones con bits volteados y confianza reportada es un caso práctico para evaluar robustez de direccionamiento por contenido.
- Procesamiento de imagen simbólico: el pipeline `shader` (bordes, profundidad, normales sobre una superficie de 80x28) sirve para estudiar operaciones de visión implementadas con álgebra HDC en lugar de convoluciones.
- Benchmarking de codecs de enteros: el codec de complemento a dos basado en átomos de bit permite comparar estrategias de codificación simbólica frente a codificaciones que preservan similitud.
- Simulación de sistemas operativos y arranque: `python -m hdc os` y `python -m hdc boot` permiten experimentar con mapas de memoria y secuencias de arranque sin hardware.
- Evaluación de autonomía de agentes: `python -m hdc autonomy` y `assist --autonomous` permiten medir precisión de siguiente intención en función de la dimensionalidad, útil para calibrar codebooks de cleanup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos aportados por el autor son mediciones internas del propio sistema, no comparables con benchmarks estándar de modelos:

| Medición | Valor |
|---|---|
| Similitud entre pares aleatorios (suelo de ruido) | media +0.0001, sd 0.0100 |
| Recuperación de bundle de 5 miembros | 0.369 – 0.382 |
| Resolución de dirección con 12 bits volteados de 10 000 | ~0.998 de confianza |
| Precisión de siguiente intención (dimensión 2000, codebook de 21 símbolos) | 80 % |
| Precisión de siguiente intención (dimensión 10 000, mismo codebook) | 70 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema no ejecuta inferencia neuronal y corre en CPU con la biblioteca estándar de Python.
- GPU recomendadas: no aplica; no se documenta uso de GPU.
- ¿Cabe en GPU de consumo? No aplica. El coste relevante es memoria RAM: cada hipervector de 10 000 bits ocupa 1 250 bytes y el estado completo reside en memoria.
- Opciones de despliegue: ejecución directa con `python -m hdc <comando>`; el servidor MCP se lanza con `python -m hdc mcp` sobre stdio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que el bundling se mantiene en `O(n·log n)` operaciones con enteros grandes, lo que abarata los bundles de 10 000 bits en Python puro, y que `python -m hdc gfx` mide tiempos de las pasadas de shader sobre una superficie de 80x28 sin cifras publicadas.

## Comparativa con modelos similares

No disponible. HDCSTORAGE no es un modelo de lenguaje ni un modelo neuronal, por lo que no existen alternativas directamente comparables en parámetros, contexto o rendimiento dentro de la categoría de modelos generativos. Como referencia de categoría, se sitúa en la línea de proyectos de computación hiperdimensional y arquitecturas vector-symbolic, pero la información proporcionada no incluye otros proyectos con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no tiene tokenizador ni contexto conversacional en el sentido habitual.
- El codec de enteros es simbólico y no preserva similitud: enteros que comparten bits activos comparten átomos, por lo que la distancia entre enteros codificados no debe interpretarse como proximidad semántica. El propio autor advierte de leer la docstring de `int_to_hv` antes de usar esas distancias.
- La precisión de siguiente intención empeora al aumentar la dimensionalidad con un codebook fijo de 21 símbolos (80 % a 2000 frente a 70 % a 10 000), porque los bits adicionales diluyen el codebook de cleanup; el valor por defecto de la máquina puede inducir a error al medir esa capa.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: no se declara soporte multilingüe.
- Proyecto sin tracción verificable: cero descargas y cero likes en el momento de la consulta, con creación y última actualización en noviembre de 2026, lo que sugiere ausencia de validación externa.
- Dependencia de rutas locales en los ejemplos (`cd D:/HDCSTORAGE`), lo que indica que la documentación no está pensada para instalación desde un índice de paquetes.
- Sin datos de benchmarks estándar ni comparaciones con alternativas, por lo que no es posible evaluar su rendimiento relativo.
- El servidor MCP se limita a JSON-RPC sobre stdio; no se documentan transportes alternativos ni mecanismos de autenticación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEUPH/hdcstorage
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
