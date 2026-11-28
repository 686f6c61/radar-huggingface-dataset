# eightb/profile

## Resumen

`eightb/profile` es la pagina de presentacion del colectivo eightb, un proyecto centrado en redes neuronales de ultra-baja precision (ternarias y de pocos bits) para inferencia en el borde. No se trata de un modelo de lenguaje con pesos publicados, sino de un repositorio paraguas que describe la filosofia, las herramientas y la hoja de ruta del ecosistema: el motor de inferencia `smart-tree`, la libreria de algebra lineal cuantizada `enthea`, la ISA portable `felix-assembly` y el pipeline de cuantizacion `quantlab`.

La propuesta tecnica se articula en torno a BitNet 1.58-bit (pesos ternarios {-1, 0, +1} entrenados con straight-through estimator) y al formato GGUF de tipo 36 (I2_S), con kernels SIMD para ARM NEON, AVX2 y WebAssembly. El repositorio incluye un binario `st` para validar, convertir e inspeccionar GGUF ternarios, y una API Rust para empaquetar trits y realizar conversiones round-trip entre Wave64 e I2_S.

Es relevante ahora porque la cuantizacion extrema (2 bits por peso) reduce el almacenamiento a un octavo del BF16 y el coste energetico de las multiplicacion-acumulacion a aproximadamente una doceava parte, lo que habilita inferencia en CPU y dispositivos de borde sin GPU dedicada. La ficha cubre lo que el autor documenta publicamente; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; repositorio de herramientas. El ecosistema apunta a transformers con pesos ternarios (BitNet 1.58-bit) y kernels SIMD |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria {-1, 0, +1}, INT8, INT2/I2_S, FP8 (E4M3 y E5M2), BF16; formato GGUF tipo 36 (I2_S) |
| Idiomas soportados | no disponible |
| Licencia | MIT (el README menciona ademas MIT OR Apache-2.0 para el codigo) |
| Formato de pesos | GGUF (I2_S, tipo 36), Wave64, hex de trits; no se distribuyen safetensors |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red concreta, sino un conjunto de componentes para construir y ejecutar modelos ternarios. El nucleo es `smart-tree`, un motor de inferencia acelerado por SIMD con kernels especificos para ARM64 NEON (cargas de 128 bits, desempaquetado con `tbl` y suma pairwise con `madd`), AVX2 (`VPBLENDVB` para mezcla de mascaras y `VPMADDWD` para suma horizontal) y un camino escalar sin ramas con latencia predecible. El formato nativo es GGUF con `quantization_type = 36 (I2_S)`, con empaquetado MSB-first de 4 trits por byte (bits 6-7, 4-5, 2-3, 0-1) y dequantizacion configurable por escalas embebidas o por entorno; se declara compatibilidad con Falcon3, BitNet.cpp y llama.cpp.

El entrenamiento descrito es el de BitNet 1.58-bit: pesos ternarios entrenados de extremo a extremo con straight-through estimator, sin destilacion obligatoria ("no distillation tax"). El puente ternario que documenta el autor es lossless entre BF16, INT8, FP8 (E4M3 y E5M2) y el dominio ternario, con conversiones de copia cero y garantias aritmeticas exactas. La hoja de ruta incluye experimentos aun no completados: kernels SIMD para GEMM ternario, fine-tuning ternario estilo QLoRA (LoRA-T), perfilador de precision mixta por capas, inyector de residuos con precision dinamica, asignador secuencial Pareto-Q, pipeline de destilacion profesor→alumno ternario y recuperacion por similitud coseno (BITCOS).

## Capacidades

- Empaquetado y desempaquetado de pesos ternarios a formato GGUF I2_S (tipo 36) mediante `I2SPacker::pack_trits`.
- Conversion round-trip Wave64 ↔ I2_S con `GgufI2SBridge`, con garantias de exactitud aritmetica.
- Validacion, conversion e inspeccion de ficheros GGUF ternarios mediante el binario `st` (subcomandos `gguf validate`, `gguf convert`, `gguf inspect`).
- Inferencia ternaria acelerada por SIMD en ARM64 NEON, x86 AVX2 y WebAssembly, con fallback escalar.
- Algebra lineal cuantizada en Rust puro (GEMM, atencion, enrutado MoE) a traves de la libreria `enthea`.
- Soporte de una ISA portable (FELIX) para escribir kernels SIMD independientes de la CPU (estado experimental).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes, porque el repositorio no publica pesos de un modelo.

## Casos de uso

- Inferencia en dispositivos de borde sin GPU: el motor `smart-tree` con kernels NEON y AVX2 permite ejecutar modelos ternarios en CPU de moviles, Raspberry Pi o portatiles, aprovechando que los pesos I2_S ocupan un octavo de lo que ocuparian en BF16.
- Despliegue en navegador: el backend WebAssembly del motor habilita ejecutar inferencia ternaria del lado del cliente, sin servidor ni acelerador dedicado.
- Integracion con ecosistemas GGUF existentes: el binario `st gguf inspect` y `st gguf validate` sirven para auditar ficheros GGUF ternarios generados por llama.cpp o BitNet.cpp antes de desplegarlos, verificando la presencia y el empaquetado de tensores ternarios.
- Pipeline de cuantizacion automatizada: `quantlab` (en construccion) esta pensado para busqueda Pareto-Q, destilacion de profesor a alumno y ajuste por refuerzo, util para equipos que quieran convertir modelos densos a ternarios con control de calidad.
- Prototipado de kernels SIMD portables: `felix-assembly` permite escribir kernels una vez y desplegarlos en ARM, x86 y WASM, util para investigadores que experimentan con precisiones extremas.
- Formacion e investigacion: el codigo Rust de `enthea` (GEMM, atencion, MoE) sirve como referencia didactica para estudiar como se implementa aritmetica ternaria y de baja precision desde cero.
- Compresion de modelos para almacenamiento: la conversion a I2_S reduce el tamano de los pesos a un octavo, lo que facilita distribuir modelos en entornos con ancho de banda limitado (aunque el rendimiento final depende del modelo base, no documentado aqui).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README solo aporta cifras teoricas de coste relativo (almacenamiento y energia de MAC) frente a BF16, no mediciones de calidad ni de velocidad sobre modelos concretos:

| Precision | Almacenamiento (relativo a BF16) | Energia de MAC (relativa) | Calidad tipica (segun autor) |
|---|---|---|---|
| BF16 | 2× | 1× | Baseline |
| INT8 | ¼× | ~⅓× | Cercana al baseline |
| INT2/I2_S | ⅛× | ~¹⁄₁₂× | "Sorprendentemente buena" (sin datos) |

## Requisitos de hardware

- VRAM: no aplica de forma directa; el motor esta orientado a CPU. No se publican requisitos de memoria para ningun modelo concreto.
- GPU recomendadas: no se documentan; el proyecto prioriza CPU (ARM64 NEON, x86 AVX2) y WebAssembly.
- GPU de consumo: no se indica soporte de CUDA ni Metal en la informacion disponible (aunque el README muestra una insignia de MLX, no se detalla su uso).
- Opciones de despliegue: binario `st`, libreria Rust `smart-tree`, backend WebAssembly, y compatibilidad declarada con llama.cpp, BitNet.cpp y Falcon3 a traves de GGUF I2_S.
- Latencia y throughput: no disponibles; solo se afirma que el camino escalar es "sin ramas y de latencia predecible", sin cifras.

## Comparativa con modelos similares

No disponible. El repositorio no publica pesos de un modelo, por lo que no es comparable en parametros, contexto o rendimiento con modelos de lenguaje. Como referencia de ecosistema, se puede situar frente a otras iniciativas de cuantizacion ternaria:

| Proyecto | Enfoque | Formato | Licencia | Estado |
|---|---|---|---|---|
| eightb / smart-tree | Motor de inferencia ternaria en Rust con SIMD | GGUF I2_S (tipo 36) | MIT | Activo (herramientas); modelos no publicados |
| BitNet.cpp (Microsoft) | Inferencia BitNet 1.58-bit en CPU | GGUF propio | MIT | Publico |
| llama.cpp | Inferencia GGUF con soporte de cuantizaciones | GGUF | MIT | Publico |
| Falcon3 (TII) | Familia de modelos; variante I2_S citada | GGUF I2_S | Falcon LLM License | Publico |

La comparacion de rendimiento entre ellos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de un modelo: es una pagina de presentacion y un conjunto de herramientas. No debe citarse como un modelo desplegable.
- No hay datos de evaluacion de calidad, sesgos ni alucinacion porque no se publica ningun modelo entrenado.
- Varios componentes clave estan en estado experimental o en construccion (`felix-assembly` experimental, `quantlab` en desarrollo); la hoja de ruta lista nueve experimentos, la mayoria sin completar.
- La afirmacion de calidad "sorprendentemente buena" para INT2 no va acompanada de mediciones; debe tratarse como marketing, no como evidencia.
- La licencia del repositorio es MIT, pero el README menciona "MIT OR Apache-2.0"; conviene verificar la licencia exacta del codigo antes de uso comercial.
- La compatibilidad con Falcon3, llama.cpp y BitNet.cpp se declara en el README, pero no se aportan pruebas de interoperabilidad ni versiones concretas.
- No se documentan idiomas soportados ni contexto, por lo que no se puede evaluar su idoneidad multilingue.
- El proyecto no publica issues cerrados, descargas ni likes (0 descargas, 0 likes), lo que sugiere un estado muy temprano y sin validacion externa.

## Enlaces

- Pagina del repositorio en Hugging Face: https://huggingface.co/eightb/profile
- Repositorio `smart-tree` en Hugging Face: https://huggingface.co/eightb/smart-tree
- Codigo de `smart-tree` en GitHub: https://github.com/peterlodri-sec/smart-tree
- Issues de `smart-tree`: https://github.com/peterlodri-sec/smart-tree/issues
- `enthea` (algebra lineal cuantizada en Rust): https://github.com/peterlodri-sec/enthea
- Documentacion cientifica de `enthea`: https://github.com/peterlodri-sec/enthea/blob/main/SCIENCE.md
- `felix-assembly` (ISA portable SIMD): https://github.com/peterlodri-sec/felix-assembly
- `quantlab` (busqueda de cuantizacion): https://github.com/peterlodri-sec/quantlab
