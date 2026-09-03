# Snapkitty/sovereign-gemini-gguf

## Resumen

Sovereign Gemini GGUF es un parser binario de archivos GGUF independiente y sin dependencias, desarrollado por Snapkitty. Su propósito es analizar y reconstruir la topología completa de modelos tipo Gemini a partir del propio archivo GGUF, sin necesidad de cargar los pesos en memoria. Utiliza únicamente `mmap` y `struct` de la biblioteca estándar de Python, lo que permite inspeccionar archivos de gran tamaño (15,48 GB) de forma ligera y segura.

El proyecto se presenta como una herramienta de verificación y análisis para modelos cuantizados, capaz de extraer metadatos, descriptores de tensores, offsets y la arquitectura subyacente (capas, atención, MLP, normas). Incluye un generador de grafo IR, validación de integridad y una función de "evocación" que enlaza los tensores sin copiarlos. Es relevante para desarrolladores que trabajan con modelos GGUF y necesitan auditar o comprender su estructura sin desplegar un runtime de inferencia completo.

La licencia es triple (Sovereign Source v1.0, BSL-1.1 y AGPL-3.0), lo que condiciona su uso comercial. El código está disponible en GitHub y en HuggingFace, aunque el repositorio de HuggingFace no incluye el archivo del modelo en sí, sino el código del parser.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estándar con GQA (32 Q / 8 KV), SwiGLU, RMSNorm y RoPE (theta=10000). 36 capas, hidden 4096, head_dim 128, FFN intermedio 14336, vocab 256000, contexto 512. |
| Parametros totales | 15.483 B (contados desde descriptores GGUF, incluye overhead de cuantización). Modelo dequantizado estimado: ~6.15 B (Meridian-G6) o 0.3 M (Nano). |
| Parametros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | 512 tokens (según metadata del archivo GGUF). |
| Tipos de cuantizacion | Q4_K, Q6_K y F32 para normas (attn_norm, ffn_norm). |
| Idiomas soportados | No disponible (el parser no es un modelo de lenguaje). |
| Licencia | Sovereign Source v1.0 \| BSL-1.1 \| AGPL-3.0 (tri-licencia). |
| Formato de pesos | GGUF v2/v3 (archivo binario, no safetensors). |

## Arquitectura y entrenamiento

Sovereign Gemini GGUF no es un modelo entrenado, sino una herramienta de análisis. Su arquitectura interna se compone de un lector de archivos GGUF (`GGUFMmapReader`) que usa `mmap` para mapear el archivo en memoria sin copiarlo, un parser (`GGUFParser`) que interpreta la cabecera, la tabla de metadatos y los descriptores de tensores, y un módulo de grafo (`ModelGraph`) que reconstruye la topología del transformer a partir de esos descriptores. El grafo IR representa la secuencia de operaciones: `TOKEN_IDS -> EMBEDDING -> 36x BLOCK -> FINAL_NORM -> LOGITS`.

El parser detecta características clave como el weight tying entre `token_embd.weight` y `output.weight` (mismo offset y tamaño), y valida la integridad de los offsets de cada tensor, incluyendo comprobaciones de solapamiento y límites. El código está escrito en Python 3.11+ y no requiere ninguna librería externa (ni torch, ni TensorFlow). No hay información sobre entrenamiento, ya que no se trata de un modelo de IA generativa.

## Capacidades

- Inspección de archivos GGUF sin cargar los pesos: lectura de cabecera, metadatos y descriptores de tensores mediante `mmap` y `memoryview`.
- Reconstrucción de la arquitectura del modelo: capas, dimensiones, tipo de atención (GQA), funciones de activación (SwiGLU), normas (RMSNorm) y configuración de RoPE.
- Generación de un grafo IR exportable en JSON: topología completa del transformer, incluyendo el peso compartido entre embedding y salida.
- Validación de integridad del archivo: comprobación de offsets, tamaños y solapamiento de tensores.
- Enlace de tensores sin copia: función `evoke` que devuelve vistas `memoryview` de los datos binarios para acceso directo.
- Soporte para cuantizaciones GGUF v2/v3 (Q4_K, Q6_K, F32) con cálculo de `block_size` y `bytes_per_block`.
- Ejecución en entornos sin GPU ni dependencias pesadas: solo requiere Python 3.11+ y la biblioteca estándar.
- Interfaz de línea de comandos: comandos `inspect`, `architecture`, `graph`, `validate` y `evoke`.

## Casos de uso

- Auditoría de archivos GGUF descargados: antes de desplegar un modelo cuantizado, se puede verificar que la estructura del archivo es válida y que los tensores tienen los tamaños esperados, evitando fallos en tiempo de ejecución.
- Extracción de metadatos para documentación técnica: obtener automáticamente la arquitectura (capas, dimensiones, contexto) de un modelo GGUF sin necesidad de cargarlo en un framework de inferencia.
- Comparación de variantes cuantizadas: analizar diferentes archivos GGUF del mismo modelo base para verificar que conservan la misma topología y que las cuantizaciones se aplicaron correctamente.
- Integración en pipelines de CI/CD: como paso de validación previa a la publicación de modelos GGUF, garantizando que los archivos cumplen con las especificaciones de formato.
- Desarrollo de herramientas de inspección para la comunidad: el grafo IR exportable en JSON puede alimentar visualizadores o generadores de documentación automática para repositorios de modelos.
- Investigación sobre formatos de cuantización: estudiar la distribución de tipos de datos en los tensores (Q4_K, Q6_K, F32) para optimizar estrategias de compresión.
- Depuración de modelos corruptos: identificar tensores con offsets incorrectos o solapados que puedan causar errores al cargar el modelo en runtimes como llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento en la información disponible. El repositorio indica que los tests internos (8/8 PASS) validan la corrección del parser con un archivo simulado `mock gemini.gguf`, pero no se proporcionan métricas de velocidad, uso de memoria ni comparativas con otras herramientas de análisis GGUF.

## Requisitos de hardware

- CPU: cualquier procesador con soporte para Python 3.11+; no se requieren instrucciones especiales.
- Memoria RAM: el uso de `mmap` evita cargar el archivo completo en RAM; solo se mapean las regiones necesarias. Se recomienda al menos 1 GB de RAM libre para el proceso, más el espacio en disco para el archivo GGUF (15,48 GB).
- GPU: no necesaria. El parser funciona exclusivamente en CPU.
- Almacenamiento: el archivo GGUF debe estar accesible localmente; se recomienda un disco con suficiente espacio y velocidad de lectura (SSD para mejor rendimiento).
- Opciones de despliegue: se ejecuta como script de Python (`sovereign_gemini_gguf.py`) o como módulo importable. No requiere servidores ni contenedores específicos.
- Latencia y throughput: no se proporcionan datos. La operación de parseo es de un solo paso y depende de la velocidad de lectura del disco; el uso de `mmap` minimiza la sobrecarga.

## Comparativa con modelos similares

No se dispone de información sobre herramientas comparables (otros parsers GGUF independientes) en la documentación proporcionada. Existen proyectos como `gguf-parser` o `gguf-dump` en el ecosistema de llama.cpp, pero no se han contrastado en esta ficha. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: Sovereign Gemini GGUF es una herramienta de análisis, no genera texto ni realiza inferencia. No debe confundirse con un modelo de IA generativa.
- Licencia restrictiva para uso comercial: la triple licencia incluye BSL-1.1 y AGPL-3.0, lo que puede imponer obligaciones de divulgación de código si se modifica o se utiliza en servicios comerciales. Se debe revisar cada licencia antes de su uso.
- Soporte limitado a arquitecturas Gemini: el parser está diseñado específicamente para el formato de tensores y metadatos de modelos tipo Gemini; puede fallar con otros modelos GGUF de arquitecturas diferentes.
- Sin garantías de soporte: el proyecto parece ser un extracto de un repositorio mayor ("cherry-picked from sovereign-cuda-kernels mass repo") y no se indica mantenimiento activo.
- Información incompleta: la model card no especifica el origen del archivo GGUF de ejemplo, ni si el modelo subyacente (Meridian-G6) está disponible públicamente. No se mencionan sesgos, alucinaciones ni riesgos de contenido, ya que no aplican.
- Contexto limitado: la arquitectura reconstruida indica una longitud de contexto de solo 512 tokens, lo que limita su uso en tareas que requieran contexto largo, aunque esto es una característica del modelo analizado, no del parser.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/sovereign-gemini-gguf
- Repositorio en GitHub (según la model card): https://github.com/SNAPKITTYWEST/sovereign-gemini-gguf
- Documentación embebida en la model card (incluye diagramas Mermaid y ejemplos de uso).
