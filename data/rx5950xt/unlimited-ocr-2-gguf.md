# RX5950XT/Unlimited-OCR-2-GGUF

## Resumen

Unlimited-OCR-2 GGUF es una cuantización no oficial, realizada por el usuario RX5950XT, del modelo de OCR multilingüe baidu/Unlimited-OCR-2 desarrollado por Baidu. Se trata de un modelo de visión-lenguaje (image-text-to-text) especializado en el análisis y transcripción de documentos, con unos 2.939 millones de parámetros (dato de los pesos safetensors originales), que convierte imágenes de páginas en texto estructurado con etiquetas de bloque y coordenadas de maquetación.

El modelo base destaca por su decodificador MoE basado en DeepSeek-V2 (12 capas) y por dos innovaciones clave: una codificación posicional 2D por página (page-2D RoPE) y un mecanismo de atención dispersa por enrutamiento llamado DASH (SR-SWA), que permite procesar documentos largos de varias páginas sin que se degrada la coherencia entre páginas.

Esta versión GGUF es relevante porque permite ejecutar el modelo localmente con llama.cpp, aunque con una condición importante: requiere aplicar un parche incluido en el repositorio, ya que la rama principal de llama.cpp solo soporta la versión 1 del modelo. Ofrece tres precisiones (BF16 sin pérdida, Q8_0 y Q4_K_M con imatrix multimodal), con mediciones de precisión detalladas frente al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language con decodificador MoE tipo DeepSeek-V2 (12 capas), atención DASH (SR-SWA) y page-2D RoPE; codificador visual SAM + CLIP |
| Parametros totales | 2.938.670.848 (aprox. 2,94 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (single-page, gundam) / 65.536 tokens (multi-page, según ejemplos de uso) |
| Tipos de cuantizacion | BF16 (sin pérdida), Q8_0, Q4_K_M (con imatrix y capas críticas en Q8_0) |
| Idiomas soportados | Multilingüe (el conjunto de calibración incluye chino e inglés; lista completa no disponible) |
| Licencia | MIT |
| Formato de pesos | GGUF (más safetensors en el modelo base baidu/Unlimited-OCR-2) |

## Arquitectura y entrenamiento

El decodificador de Unlimited-OCR-2 mantiene la estructura MoE de DeepSeek-V2 con 12 capas de la versión 1, pero cambia radicalmente el mecanismo de atención. En primer lugar, emplea page-2D RoPE: la posición de cada token no es un índice secuencial, sino un par (posición dentro de la página, paridad del número de página), con 63 pares de frecuencias para la posición intrapágina y 1 par para el número de página. En segundo lugar, implementa DASH (sparse routed attention, SR-SWA): cada token atiende a los 128 tokens más recientes más 12 bloques (de 32 tokens cada uno) seleccionados por un router como los más relevantes de la imagen de la página, usando probabilidades entmax-1.5 convertidas en sesgos logarítmicos sobre las puntuaciones de atención. El parche de llama.cpp conserva todos los pesos del router en BF16 sin cuantizar.

Sobre los datos de entrenamiento del modelo base no hay detalles en la información disponible. En cuanto a la cuantización, el autor generó una matriz de importancia (imatrix) multimodal usando 48 páginas de OmniDocBench (artículos, libros de texto, periódicos, apuntes, presentaciones, exámenes y estados financieros, en chino e inglés), calculada junto con las imágenes y con teacher forcing sobre la salida OCR del modelo BF16, unas 123.000 tokens en total. La receta Q4_K_M cuantiza los expertos MoE según las reglas estándar (Q4_K/Q5_0/Q8_0), mantiene en Q8_0 las proyecciones de atención, el experto compartido, la capa densa 0, los embeddings y la capa de salida, y deja el router DASH en BF16/F32.

## Capacidades

- OCR y análisis de documentos: transcripción de texto completo de páginas con detección de maquetación.
- Salida estructurada: cada bloque se emite como `<BLOCK>tipo[x0, y0, x1, y1]<FORK>contenido`, con coordenadas relativas 0-1000, lo que permite reconstruir la estructura del documento.
- Procesamiento multipágina: modo base con vistas globales de 1024×1024 por página, capaz de mantener coherencia a lo largo de documentos de varias páginas (gracias a page-2D RoPE y DASH).
- Modo single-page (gundam): división de la página en hasta 16 bloques para máxima fidelidad en una sola página.
- Multilingüe: soporte de documentos en varios idiomas (calibración verificada con chino e inglés).
- Uso como servidor OpenAI-compatible mediante llama-server (incluido en el parche).
- No hay evidencia de capacidades generales de chat, tool calling o razonamiento: es un modelo especializado en parsing de documentos.

## Casos de uso

- Digitalización de archivos documentales: transcripción masiva de documentos escaneados (informes, actas, correspondencia) con salida estructurada por bloques y coordenadas, adecuada para indexar en sistemas RAG.
- Extracción de texto de artículos científicos: el conjunto de calibración incluye papers; el modelo preserva la estructura de secciones y bloques con etiquetas de tipo.
- Procesamiento de estados financieros: la calibración incluye estados financieros en chino e inglés; útil para convertir PDFs escaneados de informes económicos en datos estructurados.
- Transcripción de periódicos y material histórico: la maquetación compleja en columnas es uno de los escenarios cubiertos por OmniDocBench.
- Digitalización de apuntes, exámenes y material educativo: reconocimiento de contenido manuscrito e impreso mixto en páginas de formato variado.
- Pipelines de OCR multipágina en servidores: mediante llama-server con API OpenAI-compatible, se puede integrar en servicios de backend que procesen documentos de varias páginas de forma automática.
- Reconstrucción de maquetación: las coordenadas relativas 0-1000 por bloque permiten reconvertir el texto a formatos como HTML o Markdown conservando la disposición original.

## Benchmarks y rendimiento

Datos publicados por el autor del repo comparando las versiones cuantizadas contra BF16 sobre 64 páginas del conjunto de evaluación de OmniDocBench (no usadas en la calibración). "Full text" incluye etiquetas de maquetación y coordenadas; "text" solo el texto reconocido.

| Version | Tamaño | Full text media / mediana | Text media / mediana | Text peor página | Idéntica a BF16 |
|---|---|---|---|---|---|
| BF16 GGUF vs HF original | 5,48 GiB | 100% (single-page gundam, idéntico carácter a carácter) | 99,86-99,85% (diferencias solo en coordenadas ±1-2) | no disponible | — |
| Q8_0 | 2,92 GiB | 99,08% / 99,84% | 99,46% / 100% | 88,95% | 10/64 |
| Q4_K_M (repo) | 2,01 GiB | 97,81% / 99,48% | 99,18% / 100% | 79,39% | 5/64 |

Comparativa de recetas Q4 sobre el mismo conjunto:

| Variante Q4 | Tamaño | Full text media | Text media | Text peor página |
|---|---|---|---|---|
| Q4_K_M estándar | 1,82 GiB | 96,82% | 98,40% | 70,28% |
| + imatrix | 1,82 GiB | 96,18% | 97,83% | 67,12% |
| + capas críticas Q8_0 | 2,01 GiB | 97,81% | 98,88% | 70,71% |
| + ambas (adoptada) | 2,01 GiB | 97,81% | 99,18% | 79,39% |

No se han publicado resultados del modelo base en benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible; las métricas anteriores son específicas de fidelidad OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M unos 2 GiB solo de pesos del LLM más 787 MiB del proyector visual (mmproj F16); Q8_0 unos 2,92 GiB + 787 MiB; BF16 unos 5,48 GiB + 787 MiB. Hay que añadir la KV cache (32.768-65.536 tokens de contexto) y los tokens de imagen.
- GPU recomendadas: cualquier GPU con 6-8 GiB de VRAM es suficiente para Q8_0 con contexto moderado; para BF16 conviene una RTX 4090 (24 GiB) o similar. No requiere A100/H100.
- Consumer GPUs: perfectamente viable en RTX 3060/4060 (con Q4_K_M) y RTX 4070/4080 (Q8_0); en Mac funciona vía Metal sin CUDA.
- CPU: ejecutable sin GPU compilando sin `-DGGML_CUDA=ON`, con menor velocidad.
- Despliegue: exclusivamente llama.cpp parcheado (commit b11913 / 7aca0d2, o master a fecha 2026-10-27), mediante `llama-mtmd-cli` o `llama-server` (API OpenAI-compatible). LM Studio, Ollama y otras herramientas sobre llama.cpp mainline no pueden cargar estos ficheros. vLLM y TGG/TGI no aplican a este formato GGUF parcheado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| Unlimited-OCR-2 (este repo, Q8_0/Q4_K_M) | 2,94 B | 32-65K tokens (según modo) | MIT | Sí, con parche de llama.cpp |
| DeepSeek-OCR / Unlimited-OCR v1 | no disponible | no disponible | no disponible | Soporte nativo en llama.cpp mainline |
| GOT-OCR2.0 | aprox. 0,6 B | no disponible | no disponible | Sí |

Nota: los datos de DeepSeek-OCR y GOT-OCR2.0 no están en la información proporcionada y se indican como no disponibles donde proceda; la ventaja diferencial de v2 frente a v1 es el procesamiento multipágina coherente mediante DASH y page-2D RoPE, a costa de requerir el parche.

## Limitaciones y advertencias

- Incompatibilidad con el ecosistema estándar: la rama principal de llama.cpp no soporta la arquitectura `unlimited-ocr2`; sin el parche, el modelo se carga pero produce salidas incorrectas (un 5,6% de similitud en single-page si se trata como v1, y degradación severa a partir de la página 2 en multipágina: 25,4% con atención completa).
- No se debe convertir el modelo tratándolo como v1: la atención y el RoPE son radicalmente distintos.
- El parche está verificado contra llama.cpp b11913 y master a 2026-10-27; cambios futuros en mainline pueden romper la compatibilidad.
- La mediana de texto es 100%, pero la métrica "full text" de Q4_K_M baja al 97,81% de media y 79,39% en la peor página: en producción crítica conviene usar Q8_0 o BF16.
- Las diferencias entre cuantizaciones se concentran en la granularidad de los bloques de maquetación y en coordenadas, más que en errores de reconocimiento de caracteres.
- Modelo especializado en parsing de documentos: no apto como asistente conversacional general.
- Licencia MIT: sin restricciones para uso comercial.
- Riesgo de alucinación, sesgos y lista completa de idiomas soportados: no disponible en la información proporcionada.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/RX5950XT/Unlimited-OCR-2-GGUF
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio de llama.cpp (para aplicar el parche): https://github.com/ggml-org/llama.cpp
- Paper, demo y blog del modelo base: no disponibles en la información proporcionada
