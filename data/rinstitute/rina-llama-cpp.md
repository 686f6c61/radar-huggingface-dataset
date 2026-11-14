# Rinstitute/rina-llama.cpp

## Resumen

rina-llama.cpp es una bifurcación (fork) de llama.cpp mantenida por Rinstitute, distribuida a través de Hugging Face como binarios y código fuente. No se trata de un modelo de lenguaje en sí, sino de un motor de inferencia especializado: una compilación de llama.cpp orientada a ejecutar modelos GGUF ternarios sobre CPUs x86. Parte del fork `prism` de PrismML (que a su vez sigue el llama.cpp upstream) y añade **tq16**, un conjunto de kernels de CPU optimizados para tres formatos ternarios concretos: PQ2_0, PTQ1_0 y Q2_0, empleados por el modelo Rina Juvenile Exp 2B.

El problema que resuelve es el bajo rendimiento de la inferencia ternaria en CPU. Los kernels originales de PrismML procesaban estos formatos de forma poco eficiente en x86; tq16 reorganiza los pesos en mosaicos de 16 columnas y utiliza instrucciones SIMD (AVX-512 VNNI, AVX-VNNI y AVX2) para acelerar tanto el *prompt processing* como la generación. Según las mediciones del autor, la mejora es sustancial: en un Ryzen 9 9950X con 16 hilos, el *prompt processing* de PQ2_0 pasa de 598 a 1662 tokens/s, y en una VM de 2 vCPU el mismo formato escala de 195 a 377 tokens/s.

La relevancia actual radica en que permite ejecutar modelos ternarios de 2B parámetros en hardware de consumo sin GPU, con velocidades de generación cercanas al límite de ancho de banda de memoria. La release 2026.11.14 incluye binarios estáticos para Linux x86-64, código fuente y parches aplicables sobre PrismML `prism`. La licencia es MIT, igual que llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia (fork de llama.cpp) con kernels SIMD tq16 para pesos ternarios; no es un modelo |
| Parametros totales | no disponible (depende del modelo GGUF cargado; probado con Rina Juvenile Exp 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de llama.cpp y del modelo cargado) |
| Tipos de cuantizacion | Ternarios: PQ2_0, PTQ1_0, Q2_0; activaciones cuantizadas a int8 (una escala por 32 valores) |
| Idiomas soportados | no disponible (depende del modelo; los benchmarks usan texto en chino, japones e ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (formatos ternarios PQ2_0, PTQ1_0, Q2_0) |
| Plataforma | Linux x86-64 (binarios estaticos); AVX2, AVX-VNNI o AVX-512 VNNI |
| Version base | PrismML `prism` en commit 6447906bf96c1a023980d3453fb59daa6af3bb23 |
| Version tq16 | commit de0d48e42aaaaae3bad1cc2d44e1bcf8a80a3867 |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

Al no ser un modelo de lenguaje, no existe entrenamiento asociado. Lo relevante es la arquitectura del motor de inferencia. tq16 reorganiza en tiempo de carga los pesos de los tres formatos ternarios en un único layout de mosaicos de 16 columnas. Cada línea de 64 bytes almacena códigos de 2 bits de forma que `(line >> 2s) & 3` produce un operando de 16 columnas × 4 entradas para `vpdpbusd` (AVX-512 VNNI y AVX-VNNI) o `pmaddubsw` (AVX2 simple). Cada columna de salida acumula en su propio carril SIMD. Los trits de PTQ1_0 se expanden a códigos de 2 bits durante la carga, y las activaciones se cuantizan a int8 con una escala por cada 32 valores.

Una innovación destacable es que la salida de un token no depende del número de tokens del lote, lo que permite que la decodificación especulativa reproduzca la decodificación normal bit a bit. El paquete incluye lanzadores que leen `/proc/cpuinfo` y seleccionan automáticamente entre tres compilaciones (`avx512`, `avxvnni`, `avx2`); la variable `RINA_CPU_LEVEL` permite forzar el nivel. Existen dos variables de entorno de control: `GGML_TQ16=0` desactiva los kernels tq16 y usa los originales de PrismML, y `GGML_TQ16_ACT=128` agrupa la escala de activación por grupo de pesos en lugar de por 32 valores (aproximadamente un 10% más rápido en CPUs con VNNI, con KLD de 1.46e-4 frente a 1.02e-4).

## Capacidades

- Ejecución de modelos GGUF ternarios (PQ2_0, PTQ1_0, Q2_0) en CPU x86-64 sin GPU.
- Aceleración SIMD mediante AVX-512 VNNI, AVX-VNNI y AVX2 con selección automática de nivel.
- Herramientas incluidas: `llama-cli`, `llama-completion`, `llama-server` y `llama-bench`.
- Servidor HTTP local (`llama-server`) con opciones de host y puerto.
- Decodificación especulativa con reproducibilidad bit a bit respecto a la decodificación normal.
- Compatibilidad con los kernels originales de PrismML mediante `GGML_TQ16=0`.
- Aplicación de los cambios tq16 como parches (`git am source/*.patch`) sobre versiones más recientes de PrismML `prism`.
- No incluye soporte TLS en `llama-server` ni binarios para Windows o ARM.

## Casos de uso

- Inferencia de modelos ternarios en servidores sin GPU: tq16 permite ejecutar Rina Juvenile Exp 2B en CPUs Xeon o EPYC con AVX-512, alcanzando 1662 tokens/s de prompt processing en un Ryzen 9 9950X con 16 hilos, lo que hace viable el despliegue en infraestructura puramente CPU.
- Despliegue en máquinas virtuales pequeñas: en una VM de 2 vCPU con unos 20 GB/s de ancho de banda, PQ2_0 alcanza 377 tokens/s de prompt processing y 54 tokens/s de generación, suficiente para asistentes conversacionales ligeros.
- Prototipado y evaluación de modelos ternarios: `llama-bench` incluido permite medir rendimiento por formato y nivel SIMD antes de comprometer hardware.
- Servicio HTTP local para aplicaciones: `llama-server` expone el modelo en `127.0.0.1:8080`, adecuado para integrarlo en herramientas internas o pipelines de desarrollo, preferiblemente detrás de un proxy inverso por la ausencia de TLS.
- Investigación sobre cuantización ternaria: la comparación de KLD frente a una copia F16 (1.02e-4 a 1.03e-4 en tq16) y el test unitario `tests/test-tq16.cpp` (300 formas por formato contra referencia en doble precisión) facilitan validar la precisión de los kernels.
- Integración en CI/CD para validación de modelos: los binarios estáticos funcionan en cualquier distribución Linux x86-64, lo que simplifica su inclusión en contenedores de prueba sin dependencias externas.
- Desarrollo de parches upstream: el código fuente y los parches permiten a mantenedores aplicar tq16 sobre nuevas versiones de PrismML `prism` con `git am`.

## Benchmarks y rendimiento

Rendimiento medido con Rina Juvenile Exp 2B, `llama-bench -p 512 -n 128`, en tokens por segundo. "PrismML" es la misma fuente con `GGML_TQ16=0`.

VM de 2 vCPU (host Ryzen 9 9950X, ~20 GB/s de ancho de banda, 2 hilos):

| Formato | Nivel | PrismML pp512 | tq16 pp512 | PrismML tg128 | tq16 tg128 |
|---|---|---:|---:|---:|---:|
| PQ2_0 | avx512 | 195 | 377 | 49.3 | 54.0 |
| PQ2_0 | avxvnni | 136 | 258 | 35.1 | 53.2 |
| PQ2_0 | avx2 | 92 | 163 | 30.2 | 55.9 |
| PTQ1_0 | avx512 | 58 | 387 | 28.6 | 53.2 |
| PTQ1_0 | avx2 | 40 | 177 | 22.8 | 55.0 |
| Q2_0 | avx512 | 56 | 371 | 27.0 | 49.9 |
| Q2_0 | avx2 | 53 | 167 | 25.5 | 49.4 |

Ryzen 9 9950X (16 núcleos, DDR5 de escritorio, Linux bajo WSL 2):

| Formato | Nivel | Hilos | PrismML pp512 | tq16 pp512 | PrismML tg128 | tq16 tg128 |
|---|---|---:|---:|---:|---:|---:|
| PQ2_0 | avx512 | 1 | 111 | 229 | 37.7 | 64.9 |
| PQ2_0 | avx512 | 16 | 598 | 1662 | 86.8 | 89.3 |
| PQ2_0 | avx2 | 1 | 59 | 99 | 24.8 | 55.4 |
| PQ2_0 | avx2 | 16 | 456 | 822 | 84.0 | 87.8 |
| PTQ1_0 | avx512 | 1 | 33 | 232 | 22.2 | 65.7 |
| Q2_0 | avx512 | 1 | 30 | 225 | 20.5 | 66.2 |

Precisión (KLD frente a copia F16 de los mismos pesos, 40 fragmentos de 512 tokens de chat en chino, japonés e inglés):

| Kernel | KLD | Mismo token top-1 |
|---|---:|---:|
| PrismML, AVX-512 | 1.00e-4 | 99.45% |
| PrismML, AVX2, PQ2_0 | 1.66e-4 | 99.37% |
| tq16, todos los niveles | 1.02e-4 – 1.03e-4 | 99.43% – 99.53% |

## Requisitos de hardware

- CPU x86-64 con AVX2 como mínimo (Intel Haswell o posterior; AMD Zen 1–3). Los niveles superiores requieren AVX-VNNI (Intel Alder Lake o posterior) o AVX-512 F/CD/BW/DQ/VL + VNNI (Intel Cascade Lake, Ice Lake, Sapphire Rapids y Xeon posteriores; AMD Zen 4 y Zen 5).
- Las CPUs sin AVX2 no están soportadas por este paquete; debe usarse una compilación upstream de llama.cpp.
- No hay soporte para ARM: en esa arquitectura tq16 no hace nada y se emplean los kernels propios de PrismML.
- No se especifican requisitos de VRAM porque la inferencia es exclusivamente en CPU; el consumo de memoria depende del tamaño del modelo GGUF cargado.
- No hay binarios para Windows en esta release; solo Linux x86-64 estático.
- Opciones de despliegue: `llama-cli`, `llama-completion`, `llama-server` y `llama-bench` incluidos en el paquete; compilación desde fuente con CMake (`-DGGML_NATIVE=ON`).
- En la VM de 2 vCPU la generación a 2 hilos se acerca al límite de ancho de banda de memoria; en el 9950X con 1 hilo PQ2_0 avx512 alcanza 64.9 tokens/s de generación y con 16 hilos 89.3 tokens/s.

## Comparativa con modelos similares

| Motor | Tipo | Formatos soportados | Aceleración CPU | Plataformas | Licencia |
|---|---|---|---|---|---|
| rina-llama.cpp (tq16) | Fork de llama.cpp | Ternarios PQ2_0, PTQ1_0, Q2_0 | AVX2, AVX-VNNI, AVX-512 VNNI | Linux x86-64 | MIT |
| PrismML `prism` (base) | Fork de llama.cpp | Ternarios PQ2_0, PTQ1_0, Q2_0 | Kernels originales, sin tq16 | Según compilación | MIT |
| llama.cpp upstream | Motor de inferencia | Múltiples cuantizaciones GGUF | SIMD genérico | Multiplataforma | MIT |

La comparación con otros motores de inferencia de propósito general (vLLM, TGI) no está disponible en la información proporcionada, ya que estos se orientan a GPU y no a formatos ternarios en CPU.

## Limitaciones y advertencias

- Solo se distribuyen binarios para Linux x86-64; no hay compilaciones para Windows ni ARM en esta release.
- En ARM tq16 no aporta ninguna mejora y se usan los kernels originales de PrismML.
- PTQ1_0 consume tanta memoria como PQ2_0 tras la carga, porque sus trits se expanden a códigos de 2 bits. En máquinas con muchos núcleos y ancho de banda de memoria limitado, la generación con PTQ1_0 puede ser un 3–5% más lenta que con `GGML_TQ16=0` (medido con 8 o más hilos en el 9950X).
- `llama-server` se compila sin TLS; debe colocarse un proxy inverso delante si va a ser accesible desde otras máquinas.
- Las CPUs sin AVX2 no están soportadas por este paquete.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del motor, ya que dependen del modelo GGUF que se cargue; los benchmarks de precisión usan texto en chino, japonés e inglés.
- La licencia MIT permite uso comercial, pero deben respetarse las licencias del código de terceros incluidas en `licenses/` dentro de cada archivo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy temprana y poca validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rinstitute/rina-llama.cpp
- Fork base PrismML llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Modelo de referencia Rina Juvenile Exp 2B GGUF: https://huggingface.co/Rinstitute/Rina-Juvenile-Exp-2B-GGUF
