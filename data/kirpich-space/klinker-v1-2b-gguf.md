# Kirpich-Space/Klinker-V1-2B-gguf

## Resumen

Klinker V1 2B es un modelo fundacional multimodal nativo, bilingue (ruso e ingles), orientado a computacion cientifica y a uso agentico, desarrollado por Kirpich Space Company (KSP). Se ha entrenado desde inicializacion aleatoria (no es un fine-tuning de un modelo existente) con un motor de entrenamiento propio escrito en Rust sobre LibTorch, lo que constituye su rasgo diferencial mas destacable: toda la pila de entrenamiento (`klinker-model`, `klinker-train`, `klinker-data`) es original del autor.

La arquitectura combina un backbone de lenguaje tipo Transformer de 28 capas con `d_model = 2560`, atencion con GQA (20 cabezas de consulta y 4 de clave/valor), `intermediate_size = 6656`, RoPE con theta 10000 y RMSNorm, con un codificador visual nativo de 12 capas y `d_vision = 768` que procesa imagenes de 336x336 (patch de 14, fusion espacial 2x2, 144 tokens visuales) y un proyector SwiGLU. El total de parametros entrenables es de 2.037.430.528 (~2,04B).

El modelo se publica en formato GGUF bajo licencia GPL-3.0 y su estado es de preentrenamiento en curso (Stage XII): el repositorio esta conectado al directorio de staging oficial de la release y los pesos cuantizados se iran publicando en hitos. Es relevante para quienes siguen el ecosistema de modelos pequenos multimodales entrenados de cero con tooling no convencional y para evaluar capacidades cientificas y de generacion SVG en un modelo de ~2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con GQA + codificador visual nativo (ViT 12 capas) y proyector SwiGLU |
| Parametros totales | 2.037.430.528 (~2,04B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (`max_seq_len = 2048`) |
| Tipos de cuantizacion | no disponible (el repositorio es GGUF, pero no se detallan los niveles publicados) |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El backbone de lenguaje es un Transformer de 28 capas con `d_model = 2560`, 20 cabezas de consulta y 4 cabezas KV (GQA, ratio 5:1), `intermediate_size = 6656`, RoPE con theta 10000.0 y RMSNorm. Emplea embeddings factorizados y atados (`Factorized Tied Embeddings`) de 250.000 x 256 -> 2560 sobre un vocabulario BPE hibrido propio denominado KTok Active 250K. El codificador visual es nativo: 12 capas, `d_vision = 768`, 12 cabezas, resolucion de entrada 336x336 con `patch_size = 14` y fusion espacial 2x2 que produce 144 tokens visuales, seguido de un proyector SwiGLU.

El entrenamiento se realiza desde inicializacion aleatoria con un workspace en Rust (`klinker-model`, `klinker-train`, `klinker-data`), optimizador propio `HybridMuonAdafactorV3`, rematerializacion inversa por capas y shards binarios propios KMM1 y KTok. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo se encuentra en preentrenamiento Stage XII, por lo que los pesos publicados corresponden a hitos intermedios de la release.

## Capacidades

- Razonamiento e instrucciones bilingues ruso/ingles (componente KKC).
- Comprension nativa de imagen y texto (pipeline `image-text-to-text`) con entradas de 336x336.
- Programacion cientifica en Python, Fortran, R, Rust, C/C++ y Zig.
- Matematicas y fisica aplicadas.
- Generacion, edicion y verificacion visual de SVG nativo (con `usvg`/`resvg`).
- Tool calling agentico mediante el protocolo KTP-1.
- Identidad KSP (KIID) como capacidad especifica del modelo.
- No se documentan capacidades de audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Generacion y edicion de graficos vectoriales: el modelo puede producir SVG y verificarlo visualmente con `usvg`/`resvg`, lo que permite iterar sobre el resultado renderizado sin salir del pipeline del modelo; util para generacion automatica de diagramas cientificos o iconografia.
- Asistencia en computacion cientifica: traduccion entre lenguajes del dominio (Fortran, R, Rust, C/C++, Zig, Python) para portar rutinas numericas o modernizar codigo legacy, aprovechando su entrenamiento especifico en estos lenguajes.
- Analisis de figuras y tablas cientificas: al ser multimodal nativo con 144 tokens visuales por imagen, puede procesar graficos de papers y responder preguntas sobre ellos en ruso o ingles.
- Agentes con tool calling: integrable como motor de decision en flujos multi-paso mediante KTP-1, por ejemplo para orquestar llamadas a APIs de calculo o de renderizado SVG.
- Atencion tecnica bilingue ru/en: conversaciones multi-turno acotadas a 2048 tokens de contexto, adecuado para soporte de productos tecnicos en ambos idiomas.
- Prototipado e investigacion: al estar entrenado de cero con un stack Rust/LibTorch propio y licencia GPL-3.0, sirve como base reproducible para estudiar entrenamiento multimodal a escala ~2B y para experimentar con el formato GGUF en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~2,04B, una cuantizacion de 4 bits requeriria del orden de 1,5-2 GB solo de pesos, mas overhead de contexto y del codificador visual (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsible por tamano, pero no confirmada; el codificador visual y el vocabulario de 250K anaden memoria adicional.
- Opciones de despliegue: al publicarse en GGUF, es compatible con llama.cpp y con frontends basados en el (Ollama, LM Studio), siempre que soporten la arquitectura y el proyector multimodal del modelo; vLLM y TGI no estan confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Klinker V1 2B | ~2,04B | 2048 | Si (vision nativa) | GPL-3.0 | Entrenado desde cero, foco cientifico y SVG, bilingue ru/en |
| Alternativas de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo en preentrenamiento (Stage XII): los pesos publicados pueden ser hitos intermedios y no una version final; el rendimiento puede no ser estable.
- Ventana de contexto limitada a 2048 tokens, restrictiva para documentos largos o conversaciones extensas.
- Solo ruso e ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de fidelidad.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de alineacion (RLHF/DPO), por lo que no hay garantias sobre sesgos de contenido.
- Licencia GPL-3.0: es una licencia copyleft fuerte; su integracion en productos propietarios puede obligar a liberar el codigo derivado. Revisar implicaciones antes de uso comercial.
- Ecosistema de tooling propio (KTok, KMM1, KTP-1, KIID): la compatibilidad con herramientas estandar puede ser parcial y requerir adaptaciones.
- Sin resultados de benchmarks publicados, no es posible validar sus capacidades frente a alternativas establecidas.

## Enlaces

- Hugging Face: https://huggingface.co/Kirpich-Space/Klinker-V1-2B-gguf
- No se han encontrado en la informacion proporcionada otros enlaces (paper, blog, repositorio o demo).
