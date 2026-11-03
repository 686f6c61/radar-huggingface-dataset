# moravianai/ThinEmbed-harrier-0.6b-vq

## Resumen

ThinEmbed-harrier-0.6b-vq es una familia de codificadores de consulta (query encoders) cuantizados en formato vectorial propietario `.vqw`, derivados del modelo de embeddings `microsoft/harrier-oss-v1-0.6b` (0,6 mil millones de parámetros). El desarrollo corre a cargo de Moravian AI, que publica el runtime WebGPU que los ejecuta bajo licencia Apache-2.0. El objetivo es reducir el coste de despliegue del lado del cliente en sistemas de recuperación asimétrica: el índice de documentos se construye una sola vez con harrier-0.6b en precisión completa, mientras que la codificación de consultas en el navegador se hace con un fichero de 105-129 MiB a 1,8-2,1 bits por peso.

La propuesta es relevante porque baja el peso del codificador de consultas por debajo del formato más pequeño que ofrece llama.cpp (IQ2_XS, 177,5 MiB) manteniendo entre el 91 % y el 98 % del nDCG@10 en fp32, según los datos publicados por el autor. Esto permite ejecutar búsqueda semántica sobre índices existentes sin servidor, directamente en WebGPU sobre GPU integradas.

La familia incluye ocho contenedores: cuatro con calibración estándar sobre SciDocs y SciFact, y cuatro variantes «prompt-K/V» que almacenan en precisión completa (unos 2 MB) las claves y valores del prefijo de consulta y se recalibran con él. Los ficheros están pensados para el runtime Moravian AI WebGPU (`client/vqweb`), no para llama.cpp ni para pipelines estándar de HuggingFace Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base `microsoft/harrier-oss-v1-0.6b`); cuantización vectorial por bloques con codebooks de 4 dimensiones |
| Parámetros totales | 0,6 mil millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 1,83 bits/peso (K = 128) y 2,10 bits/peso (K = 256, codebooks de 4 dimensiones); formato `.vqw` |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.vqw` (contenedor propio del runtime vqweb); incluye `tokenizer.json` y `tokenizer_config.json` del tokenizer de harrier |
| Tamaño del repositorio | 1,0 GB |
| Tamaño por fichero | 105,3-129,1 MiB según variante |
| Pipeline | feature-extraction |
| Runtime | Moravian AI WebGPU runtime (`client/vqweb`, Apache-2.0) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/harrier-oss-v1-0.6b`, un encoder Transformer de 0,6 mil millones de parámetros orientado a recuperación asimétrica: se usa como codificador de consultas contra un índice de documentos construido con el mismo modelo en precisión completa. Sobre ese encoder, Moravian AI aplica una cuantización vectorial por bloques: los pesos se agrupan en bloques y cada bloque se aproxima con un codebook de 4 dimensiones y K centroides (K = 128 para 1,83 bpw; K = 256 para 2,10 bpw). No se documenta en la información disponible el número de tokens de entrenamiento ni la composición del dataset del modelo base.

La calibración de los codebooks es el elemento diferenciador. Los ficheros SciDocs se calibraron con consultas de test de SciDocs; los SciFact, con 2.000 resúmenes de SciFact y un vocabulario recortado al corpus más consultas sintéticas. Las variantes «prompt-K/V» (sufijo `p`) añaden un paso de calibración consciente del prefijo: las claves y valores del prompt de consulta se guardan en precisión completa (unos 2 MB) y se tienen en cuenta al ajustar los codebooks. El autor reporta que, a 1,8 bits, esta calibración aporta +2 puntos en SciFact y +2,5 en SciDocs; a 2,1 bits, +1,4 y +1,9 respectivamente. Los resultados son de una sola semilla y quedan dentro de ±0,01 de los resultados a tres semillas del informe técnico.

## Capacidades

- Generación de embeddings de consulta para recuperación asimétrica: produce vectores compatibles con un índice construido con `microsoft/harrier-oss-v1-0.6b` en fp32.
- Ejecución en navegador mediante WebGPU, sin backend remoto, sobre GPU integradas.
- Cuantización extrema: 1,83 y 2,10 bits por peso, por debajo de IQ2_XS de llama.cpp.
- Dos recetas de calibración (SciDocs y SciFact) y dos modos (estándar y prompt-K/V consciente del prefijo).
- Carga directa del tokenizer incluido en el repositorio, sin dependencias externas.
- Integración vía `@moravian/thinembed-vq` (JavaScript) o el módulo `vqweb.js`.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un codificador de features.

## Casos de uso

- Búsqueda semántica en aplicaciones web sin backend de inferencia: el cliente descarga un `.vqw` de ~110 MiB y codifica las consultas en el navegador con WebGPU, reutilizando un índice de documentos ya construido con harrier-0.6b. Adecuado porque el coste de red y de servidor se traslada al dispositivo del usuario.
- Búsqueda de literatura científica en aplicaciones de escritorio o extensiones: los ficheros calibrados con SciFact alcanzan el 96,7-98,1 % del nDCG@10 en fp32, suficiente para recuperación de artículos biomédicos con latencias de ~100 ms por consulta en GPU integrada.
- Asistentes de documentación técnica offline: el índice se genera una vez en servidor y el codificador de consultas viaja con la aplicación, permitiendo búsqueda local sin conexión en portátiles con GPU integrada.
- Prototipado y evaluación rápida de sistemas RAG: el script `scripts/browser_run.py` y la página `bench.html` permiten medir nDCG@10 sobre SciDocs y SciFact sin infraestructura de GPU dedicada.
- Despliegue en entornos con restricciones de memoria: con 181 MiB + 151 MiB de buffers GPU y 1.592 MiB de pico de proceso, cabe en equipos donde llama.cpp con Q3_K requiere 2.080 MiB y latencias de 444-754 ms.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el cliente, las consultas del usuario no salen del dispositivo; solo se envía el vector cuantizado o se compara contra un índice local.

## Benchmarks y rendimiento

Resultados publicados por el autor (simulación en torch y verificación en navegador con GPU integrada Intel; nDCG@10):

| Fichero | MiB | bpw | nDCG@10 | % de fp32 | Similitud coseno |
|---|---|---|---|---|---|
| `vq2.0-scidocs` | 127,0 | 2,10 | 0,2150 | 94,7 % (fp32: 0,2269) | 0,935 |
| `vq1.75-scidocs` | 112,8 | 1,83 | 0,2073 | 91,3 % | 0,906 |
| `vq2.0-scifact` | 119,5 | 2,10 | 0,7465 (1.109 consultas) | 96,7 % (fp32: 0,7723) | 0,854 |
| `vq1.75-scifact` | 105,3 | 1,83 | 0,7243 | 93,8 % | 0,771 |
| `vq2.0p-scidocs` | 129,1 | 2,10 | 0,2191 | 96,6 % | 0,942 |
| `vq1.75p-scidocs` | 114,9 | 1,83 | 0,2129 | 93,8 % | 0,929 |
| `vq2.0p-scifact` | 121,6 | 2,10 | 0,7571 | 98,1 % | 0,941 |
| `vq1.75p-scifact` | 107,3 | 1,83 | 0,7397 | 95,8 % | 0,913 |

Comparación de latencia y memoria en un portátil con GPU integrada Intel, 300 consultas en reposo:

| Sistema | p50 / p95 | Carga | Memoria GPU | Pico de proceso |
|---|---|---|---|---|
| vqweb 2,10 bpw | 103 ms / 113 ms | 2,4 s | 181 + 151 MiB | 1.592 MiB |
| wllama WebGPU, Q3_K (235 MiB) | 444 ms / 754 ms | 4,2 s | 530 MiB | 2.080 MiB |
| llama.cpp IQ2_XS (177,5 MiB) | no disponible | no disponible | no disponible | no disponible |

En la verificación en navegador, el runtime reproduce la simulación con desviaciones de −0,0007 a +0,0009 en 50 consultas, con 47-49 de 50 resultados idénticos.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / tamaño | nDCG@10 SciFact | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| ThinEmbed-harrier-0.6b-vq2.0p | 0,6 B | `.vqw`, 121,6 MiB | 0,7571 (98,1 % de fp32) | MIT | Sí (WebGPU) |
| harrier-oss-v1-0.6b (fp32) | 0,6 B | safetensors, precisión completa | 0,7723 | MIT | No documentado |
| llama.cpp IQ2_XS de harrier-0.6b | 0,6 B | GGUF, 177,5 MiB | 0,7097 | MIT (modelo base) | Parcial (wllama WebGPU) |
| llama.cpp Q3_K de harrier-0.6b | 0,6 B | GGUF, 235 MiB | no disponible | MIT (modelo base) | Sí (wllama) |

## Limitaciones y advertencias

- El formato `.vqw` solo lo lee el runtime Moravian AI WebGPU (`client/vqweb`); no es compatible con llama.cpp, Ollama, vLLM, TGI ni Transformers.
- Las variantes prompt-K/V requieren el soporte de prefijo del runtime (M6); un runtime que lo ignore obtiene solo el 53-90 % del rendimiento en fp32, por lo que los ficheros estándar siguen siendo la opción por defecto.
- Solo inglés: no hay soporte multilingüe declarado.
- La calibración está sesgada al dominio científico (SciDocs y SciFact); el rendimiento en otros dominios no está documentado.
- Los ficheros SciFact se calibraron con un corpus CC BY-NC; el autor indica que los pesos derivan del modelo base MIT, pero conviene revisar la procedencia antes de uso comercial.
- Los resultados prompt-K/V son de una sola semilla; el autor los sitúa en ±0,01 de los resultados a tres semillas.
- No hay datos publicados de sesgos, tasas de alucinación (no aplica, al no generar texto) ni comportamiento fuera de los conjuntos de evaluación citados.
- El modelo no genera texto, no soporta tool calling ni razonamiento multi-paso; usarlo fuera de recuperación asimétrica no está contemplado.
- El repositorio tiene 88 descargas y 0 likes en el momento de la consulta, con validación externa limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moravianai/ThinEmbed-harrier-0.6b-vq
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Clientes GGUF de la misma familia: https://huggingface.co/moravianai/ThinEmbed-harrier-0.6b
- Runtime WebGPU (Apache-2.0): https://github.com/rosecky/embedding-quantization-public/tree/main/client/vqweb
- Resultados completos y caveats: https://github.com/rosecky/embedding-quantization-public/blob/main/docs/release/vq_results.md
- Demo pública: https://moravian.ai/demo
- Página de query encoders: https://moravian.ai/query-encoders/
- Paquete npm: `@moravian/thinembed-vq`
