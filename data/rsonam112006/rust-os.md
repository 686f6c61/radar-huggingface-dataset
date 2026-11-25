# rsonam112006/rust-os

## Resumen

Rust OS es un proyecto de sistema operativo bare-metal de 64 bits escrito en Rust y ensamblador, desarrollado por Sonam (rsonam112006) y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de inteligencia artificial ni de pesos neuronales, sino de una imagen ISO arrancable (12,5 MB) que implementa un kernel en modo largo x86_64 con paginación de 4 niveles y ejecución en Ring 0. El repositorio ocupa 0,0 GB y contiene el código fuente, la ISO y un informe de investigación.

El componente técnico destacable es su enfoque experimental sobre reemplazo de páginas bajo localidad de referencia: implementa y compara FIFO, LRU, Óptimo (MIN) y Second-Chance/Clock en hardware real, e incluye una demostración de la anomalía de Belady (con 3 marcos, 9 fallos de página y ratio del 75,0 %; con 4 marcos, 10 fallos y ratio del 83,3 %). Dispone de una consola interactiva con comandos para consultar estado de red, memoria, CPU y almacenamiento, además de lanzar benchmarks.

Su relevancia es académica y educativa: sirve como plataforma reproducible para estudiar algoritmos de gestión de memoria y como ejemplo de desarrollo de kernels en Rust. No debe confundirse con un modelo de lenguaje: no tiene parámetros, contexto, tokenizador ni capacidades de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel bare-metal x86_64 en modo largo, Ring 0, paginación de 4 niveles |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz de consola en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible; se distribuye como imagen ISO arrancable (rust-os.iso, 12,5 MB) y código fuente en Rust y ensamblador (boot.s) |

## Arquitectura y entrenamiento

El proyecto implementa un kernel monolítico en Rust con un stub de arranque en ensamblador (boot.s) que inicializa el procesador en modo largo de 64 bits y configura la paginación de 4 niveles. El código se ejecuta en Ring 0, sin aislamiento de espacio de usuario, y gestiona memoria física y virtual mediante tablas de páginas propias. Incluye un disco RAM virtual de 512 MB y reporta 4096 MB de RAM disponible.

No existe entrenamiento, ajuste fino ni dataset: el sistema no aprende. La contribución técnica es la instrumentación de cuatro algoritmos de reemplazo de páginas (FIFO, LRU, Óptimo/MIN y Second-Chance/Clock) sobre cargas con localidad temporal y espacial, con telemetría de fallos de página. La demostración de la anomalía de Belady se ejecuta con el comando `anomaly` de la consola y confirma empíricamente que FIFO puede empeorar al aumentar el número de marcos. El informe académico completo está en RESEARCH_REPORT.md.

## Capacidades

- Arranque bare-metal en x86_64 mediante ISO híbrida, ejecutable en VirtualBox, QEMU o grabable en USB.
- Shell nativo `rust-os>` con comandos interactivos: `wifi`, `wifi scan`, `ping <host>`, `benchmark`, `anomaly`, `memory`, `storage`, `cpu`, `window`, `clear` y `reboot`.
- Benchmark de cinco algoritmos de reemplazo de páginas y auditoría de la anomalía de Belady.
- Inspección de memoria: mapa de tablas de páginas y 4096 MB de RAM reportada.
- Gestión de almacenamiento: disco RAM virtual de 512 MB.
- Diagnóstico de CPU: información del Intel Core i7 de 13.ª generación y del modo largo.
- Interfaz gráfica básica mediante el comando `window` (panel de control gráfico).
- Reinicio por hardware vía controlador PS/2 en el puerto 0x64.
- No dispone de tool calling, agentes, razonamiento, visión, audio ni capacidades multilingües propias de un modelo de lenguaje.

## Casos de uso

- Docencia de sistemas operativos: los estudiantes pueden arrancar la ISO en QEMU o VirtualBox y ejecutar `benchmark` y `anomaly` para observar en vivo el comportamiento de FIFO, LRU, Óptimo y Clock bajo distintas cargas de localidad.
- Investigación reproducible en gestión de memoria: el informe RESEARCH_REPORT.md y la telemetría integrada permiten replicar la demostración de la anomalía de Belady (9 fallos con 3 marcos frente a 10 con 4) sin modificar el código.
- Base para prácticas de desarrollo de kernels en Rust: el repositorio sirve como punto de partida para añadir planificación de procesos, controladores o llamadas al sistema sobre un esqueleto ya funcional en modo largo.
- Laboratorio de arranque bare-metal: útil para experimentar con el stub boot.s, la transición a modo largo y la configuración de paginación de 4 niveles en hardware x86_64 real o emulado.
- Análisis de algoritmos de reemplazo en entornos con restricciones de memoria: el disco RAM de 512 MB y el mapa de páginas permiten medir el impacto de cada política en un sistema con recursos acotados.
- Demostraciones y material divulgativo: la ISO arrancable y la consola interactiva facilitan explicar conceptos de Ring 0, tablas de páginas y fallos de página en charlas o clases sin depender de un entorno de desarrollo complejo.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la auditoría de la anomalía de Belady con reemplazo FIFO:

| Algoritmo | Marcos | Fallos de pagina | Ratio de fallos |
|---|---|---|---|
| FIFO | 3 | 9 | 75,0 % |
| FIFO | 4 | 10 | 83,3 % |

No se han publicado resultados de benchmarks de inferencia (MMLU, HumanEval, GSM8K u otros) porque el proyecto no es un modelo de lenguaje. Tampoco se ofrecen cifras de latencia o throughput del kernel más allá de los datos de red reportados por la consola (IP 172.20.10.3, 574 Mbps en Wi-Fi 6).

## Requisitos de hardware

- CPU x86_64 con soporte de modo largo; el sistema reporta un Intel Core i7 de 13.ª generación como referencia.
- Memoria: 4096 MB de RAM reportados por el comando `memory`; el disco RAM virtual requiere 512 MB adicionales.
- Ejecución en VirtualBox o QEMU con la ISO híbrida de 12,5 MB, o grabación en USB para hardware real.
- No requiere GPU ni VRAM: no hay inferencia neuronal.
- Opciones de despliegue: VirtualBox, QEMU o arranque nativo desde USB; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Lenguaje | Licencia | Distribucion |
|---|---|---|---|---|
| Rust OS (rsonam112006) | Kernel bare-metal x86_64 con benchmark de reemplazo de páginas | Rust y ensamblador | MIT | ISO arrancable y código fuente |
| Blog OS (phil-opp) | Tutorial de kernel en Rust para x86_64 | Rust | MIT/Apache-2.0 | Código fuente |
| Redox OS | Sistema operativo microkernel completo | Rust | MIT | Código fuente e imágenes |
| Theseus OS | SO experimental con estado en el lenguaje | Rust | MIT | Código fuente |

No se dispone de datos comparativos de rendimiento entre estos proyectos en la información proporcionada; la comparación se limita a tipo, lenguaje, licencia y formato de distribución.

## Limitaciones y advertencias

- No es un modelo de inteligencia artificial: carece de parámetros, tokenizador, contexto y capacidades de generación; cualquier uso como modelo de lenguaje es inviable.
- Ejecución en Ring 0 sin aislamiento de espacio de usuario: un fallo del kernel compromete todo el sistema; no es apto para producción.
- Funcionalidad limitada: los comandos `wifi`, `ping` y `window` se describen en la model card, pero no se documenta su implementación completa ni su robustez.
- Sin datos de benchmarks de rendimiento del kernel más allá de la anomalía de Belady; no hay métricas de latencia, throughput ni estabilidad.
- Documentación escasa: la model card remite a RESEARCH_REPORT.md, pero no se detalla su contenido en la información disponible.
- Sin soporte multilingüe declarado; la consola está en inglés.
- Licencia MIT permite uso comercial, pero al tratarse de un SO experimental sin garantías, su uso en entornos productivos no está recomendado.
- Riesgo de alucinación no aplicable; el riesgo real es de inestabilidad del sistema y pérdida de datos en hardware físico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rsonam112006/rust-os
- Imagen ISO: https://huggingface.co/rsonam112006/rust-os/resolve/main/rust-os.iso
- Informe de investigación: https://huggingface.co/rsonam112006/rust-os/blob/main/RESEARCH_REPORT.md
- Captura de arranque: https://huggingface.co/rsonam112006/rust-os/blob/main/screenshot_boot.png
