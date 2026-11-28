# eightb/smart-tree

## Resumen

`eightb/smart-tree` no es un modelo de lenguaje en el sentido habitual, sino un motor de inferencia y una caja de herramientas de cuantizacion ternaria escrita en Rust. Lo publica el colectivo eightb (bajo el identificador de Hugging Face `eightb`) y su objetivo es ejecutar redes neuronales con pesos ternarios (-1, 0, +1) de forma eficiente en CPU, con especial enfasis en entornos edge y en arquitecturas ARM64, x86 AVX2 y WebAssembly.

El repositorio ofrece soporte nativo para el formato GGUF con cuantizacion I2_S (tipo 36), conversiones sin perdida entre BF16, INT8, FP8 (E4M3 y E5M2) y ternario, y kernels SIMD especificos para NEON y AVX2. Incluye un binario de linea de comandos (`st`) para validar, convertir e inspeccionar ficheros GGUF, ademas de una biblioteca Rust reutilizable (`smart-tree`).

Es relevante ahora porque la inferencia de bajo bit (BitNet 1.58-bit) esta ganando traccion como alternativa para desplegar modelos en hardware modesto, y este proyecto se posiciona como infraestructura abierta (licencia MIT) para ese ecosistema. Conviene subrayar que la model card no documenta ningun modelo con pesos publicados: el repositorio tiene 0.0 GB y no incluye checkpoints, por lo que debe tratarse como software, no como modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (motor de inferencia y herramienta de cuantizacion ternaria, no un modelo neuronal) |
| Parametros totales | No disponible (el repositorio no contiene pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria (-1, 0, +1); I2_S (GGUF tipo 36); conversiones con BF16, INT8, FP8 E4M3, FP8 E5M2 |
| Idiomas soportados | No disponible |
| Licencia | MIT (la model card menciona tambien MIT OR Apache-2.0 en la seccion de licencia) |
| Formato de pesos | GGUF (I2_S, 4 trits por byte, MSB-first); empaquetado propio BitNetWave64 |

## Arquitectura y entrenamiento

El proyecto no describe el entrenamiento de ningun modelo. Lo que documenta es una infraestructura de inferencia: kernels SIMD para multiplicacion ternaria (ARM64 NEON con cargas de 128 bits, desempaquetado por tabla `tbl` y `madd` por pares; AVX2 con mezcla por mascara `VPBLENDVB` y suma horizontal `VPMADDWD`), mas un camino escalar sin ramas para latencia predecible. El "Ternary Bridge" permite conversiones sin perdida entre BF16, INT8, FP8 y ternario, y el puente GGUF I2_S implementa el empaquetado de 4 trits por byte con orden MSB-first (bits 6-7, 4-5, 2-3, 0-1) y desquantizacion configurable por escalas embebidas o por entorno.

La model card menciona compatibilidad con Falcon3, BitNet.cpp y llama.cpp, y cita un formato propietario BitNetWave64 con conversion bidireccional a I2_S. El roadmap incluye experimentos aun no completados: kernels SIMD para GEMM ternario, ajuste fino ternario estilo QLoRA (LoRA-T), perfilador de precision mixta por capas, inyector de residuos con precision dinamica, asignador secuencial Pareto-Q, pipeline de destilacion profesor→alumno hacia ternario y recuperacion por similitud coseno (BITCOS). Ninguno de estos elementos esta marcado como implementado.

## Capacidades

- Validacion, conversion e inspeccion de ficheros GGUF con tensores ternarios I2_S mediante el binario `st`.
- Empaquetado y desempaquetado de trits con ida y vuelta completa entre BitNetWave64 e I2_S.
- Conversiones sin perdida entre BF16, INT8, FP8 (E4M3, E5M2) y representacion ternaria.
- Kernels SIMD para ARM64 NEON, x86 AVX2 y fallback escalar; tambien compilacion a WebAssembly.
- Biblioteca Rust (`smart-tree`) con API para `I2SPacker` y `GgufI2SBridge`.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: al no haber pesos, no hay modelo que ejecutar.
- No se documentan capacidades multilingues ni modo de pensamiento.

## Casos de uso

- Validacion de ficheros GGUF ternarios en pipelines de CI: ejecutar `./st gguf validate` sobre artefactos I2_S antes de publicarlos, para detectar corrupcion de empaquetado o incompatibilidades de tipo 36.
- Conversion de pesos BitNetWave64 a I2_S para distribucion: usar `./st gguf convert` para generar ficheros compatibles con llama.cpp y BitNet.cpp a partir de checkpoints en el formato propio del colectivo.
- Inspeccion de modelos de terceros: `./st gguf inspect --file` permite verificar si un GGUF contiene tensores ternarios y con que esquema de escalas, util para auditar modelos descargados de otros repositorios.
- Integracion en tooling Rust de cuantizacion: la biblioteca expone `I2SPacker::pack_trits` y el puente Wave64↔I2_S para incorporar empaquetado ternario en pipelines propios de conversion sin depender de Python.
- Inferencia edge en ARM64 o x86 sin GPU: los kernels NEON y AVX2 estan pensados para ejecutar modelos ternarios en CPU de portatiles, Raspberry Pi o servidores sin acelerador, aunque el estado del roadmap sugiere que los kernels GEMM ternarios aun no estan completos.
- Despliegue en navegador: la compilacion a WebAssembly abre la puerta a ejecutar inferencia ternaria en cliente, adecuada para demos o aplicaciones con requisitos de privacidad estrictos.
- Investigacion en cuantizacion de bajo bit: el repositorio sirve como base reproducible para experimentar con precision ternaria y comparar esquemas de empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla teorica de costes (BF16 como referencia 1x en energia MAC, INT8 ~1/3x, INT2/I2_S ~1/12x, con almacenamiento de 1/8x), pero son estimaciones de diseno, no mediciones.

## Requisitos de hardware

- VRAM: no aplica, el proyecto esta orientado a CPU; no se documentan requisitos de GPU.
- CPU objetivo: ARM64 con NEON, x86 con AVX2, y fallback escalar para cualquier arquitectura.
- GPU recomendadas: no disponible; no se menciona soporte CUDA, ROCm ni Metal (la insignia de MLX aparece en la cabecera pero sin detalle tecnico).
- Cabe en cualquier CPU moderna con soporte NEON o AVX2; el binario `st` es ligero y no requiere GPU.
- Opciones de despliegue: binario `st` autocontenido, biblioteca Rust via Cargo, compilacion a WebAssembly; compatible a nivel de formato con llama.cpp y BitNet.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Precision | Licencia | Estado |
|---|---|---|---|---|
| `eightb/smart-tree` | Motor de inferencia y tooling ternario en Rust | Ternaria (I2_S), conversiones BF16/INT8/FP8 | MIT | Activo, sin pesos publicados |
| BitNet.cpp (Microsoft) | Motor de inferencia para BitNet b1.58 | Ternaria | MIT | Publico, con modelos de referencia |
| llama.cpp | Motor de inferencia GGUF generalista | Multiples (incluye tipos de bajo bit) | MIT | Muy extendido |
| Falcon3 (TII) | Familia de modelos con variantes cuantizadas | BF16 y cuantizaciones | Apache 2.0 (segun el modelo) | Publico, con pesos |

La comparacion es estructural: smart-tree es una herramienta de empaquetado y validacion, no un modelo. Frente a llama.cpp o BitNet.cpp, su diferenciacion esta en el enfoque Rust, los kernels SIMD propios y el puente BitNetWave64↔I2_S, pero carece de la madurez y el ecosistema de aquellos.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo (tamano 0.0 GB): no es posible ejecutar inferencia con el solo.
- Varias capacidades clave del roadmap (kernels GEMM ternarios, ajuste fino ternario, precision mixta) figuran como no completadas; no deben asumirse operativas.
- La model card mezcla licencia MIT en la cabecera con "MIT OR Apache-2.0" en la seccion final; conviene aclarar los terminos antes de uso comercial.
- No hay datos de benchmarks, idiomas, contexto ni rendimiento medido; cualquier afirmacion de calidad o velocidad seria especulativa.
- El proyecto tiene 0 descargas y 0 likes en Hugging Face, y el creado/actualizado (noviembre de 2026) sugiere un proyecto muy reciente y sin validacion externa.
- Las insignias de Cloudflare, WebAssembly y MLX en la cabecera no van acompanadas de documentacion tecnica que las respalde.
- Riesgo de alucinacion y sesgos: no aplica al no haber modelo generativo; si aplica el riesgo de asumir que las conversiones "sin perdida" descritas estan verificadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/eightb/smart-tree
- Repositorio smart-tree (GitHub): https://github.com/peterlodri-sec/smart-tree
- Repositorio enthea: https://github.com/peterlodri-sec/enthea
- Repositorio felix-assembly: https://github.com/peterlodri-sec/felix-assembly
- Repositorio quantlab: https://github.com/peterlodri-sec/quantlab
- Documento SCIENCE.md: https://github.com/peterlodri-sec/enthea/blob/main/SCIENCE.md
- Issues: https://github.com/peterlodri-sec/smart-tree/issues
- Binario `st`: https://huggingface.co/eightb/smart-tree/resolve/main/st
