# peterspackman/mlip-gguf

## Resumen

`peterspackman/mlip-gguf` es una colección de conversiones al formato GGUF de la familia uPET de potenciales interatómicos de aprendizaje automático (machine-learning interatomic potentials, MLIP), desarrollados originalmente por el laboratorio COSMO (EPFL) bajo el identificador `lab-cosmo/upet`. No se trata de un modelo de lenguaje, sino de un potencial de energía y fuerzas para simulaciones de dinámica molecular y cálculos de estructura electrónica aproximada: dado un conjunto de posiciones atómicas predice energías y fuerzas con precisión cercana a DFT pero a un coste computacional muy inferior.

El paquete incluye ocho ficheros GGUF con distintos tamaños y dominios de entrenamiento: variantes `xs` (~16 MB), `s` (~53-95 MB) y `l` (~722 MB), correspondientes a los modelos PET-MAD, PET-OAM, PET-OMAT y PET-SPICE. El repositorio completo ocupa 2,3 GB y los pesos originales suman 24.998.406 parámetros en el checkpoint de referencia en safetensors.

La relevancia actual radica en que permite ejecutar estos potenciales en entornos ligeros (navegador mediante `mlip.js`, aplicaciones nativas con `mlip.cpp`) sin depender del stack de PyTorch, lo que facilita su integración en herramientas de simulación y visualización científica. La conversión preserva el grafo `torch.export` completo (forward y backward), de modo que las fuerzas se calculan por diferenciación automática dentro del propio intérprete GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de potencial interatómico PET (Point Edge Transformer), grafo `torch.export` forward + backward empaquetado en GGUF |
| Parametros totales | 24.998.406 (checkpoint de referencia en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada = estructura atómica, no secuencia de texto) |
| Tipos de cuantizacion | no disponible (los ficheros publicados son GGUF; no se detalla el esquema de cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | GGUF (ficheros individuales por variante); safetensors como origen de la conversión |

## Arquitectura y entrenamiento

Los modelos subyacentes pertenecen a la familia PET (Point Edge Transformer) de uPET, una arquitectura de grafos con atención sobre aristas que opera directamente sobre nubes de puntos atómicas con condiciones periódicas de contorno. La entrada es una estructura cristalina o molecular (especies atómicas, posiciones y celda unidad) y la salida son energía total, fuerzas por átomo y, según la variante, tensiones. La conversión a GGUF no reentrena ni modifica los pesos: exporta el grafo `torch.export` de PyTorch (forward y backward) a tensores GGUF junto con un preámbulo de intérprete de grafo, de modo que el cálculo de fuerzas se realiza por diferenciación automática dentro del runtime.

El entrenamiento original corresponde a los checkpoints de `lab-cosmo/upet`, con dominios distintos por variante: PET-MAD está orientado a materia condensada general, PET-OAM a materiales orgánicos y moleculares, PET-OMAT a materiales inorgánicos y PET-SPICE a química molecular (conjunto SPICE). No se dispone en la información proporcionada del número de tokens equivalentes, composición exacta del dataset, ni del detalle de las fases de ajuste (RLHF/DPO no aplican a este tipo de modelo). Tampoco se documentan innovaciones adicionales más allá del empaquetado del grafo en GGUF y de la disponibilidad de runtimes ligeros (`mlip.cpp`, `mlip.js`).

## Capacidades

- Predicción de energía potencial de sistemas atómicos (moléculas y sólidos periódicos).
- Predicción de fuerzas atómicas mediante diferenciación automática del grafo exportado.
- Simulaciones de dinámica molecular y relajación estructural con precisión tipo DFT a coste reducido.
- Cálculo de propiedades derivadas (tensiones, según variante) a partir de energías y fuerzas.
- Ejecución en navegador mediante `mlip.js` (carga desde buffer GGUF).
- Ejecución nativa ligera mediante `mlip.cpp`, sin dependencia de PyTorch.
- Cobertura de dominios especializados según variante: materia condensada general (PET-MAD), orgánico/molecular (PET-OAM), inorgánico (PET-OMAT) y química molecular SPICE (PET-SPICE).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Filtrado rápido de candidatos en cribado de materiales: usar `pet-mad-s.gguf` para relajar estructuras cristalinas antes de un cálculo DFT más costoso, aprovechando su tamaño reducido (95,4 MB) para procesar lotes grandes.
- Simulación de dinámica molecular en el navegador: integrar `pet-mad-xs.gguf` (16,3 MB) en una aplicación web con `mlip.js` para visualizar trayectorias y energías sin instalación local.
- Docencia y demostraciones interactivas: cargar `pet-omat-xs.gguf` en una libreta o página web para mostrar cómo varía la energía de una supercelda al deformarla, con tiempos de carga mínimos.
- Cálculo de fuerzas en pipelines de química computacional: usar `pet-spice-s.gguf` (53,4 MB) para obtener gradientes en moléculas orgánicas dentro de flujos automatizados de optimización geométrica.
- Preentrenamiento y ajuste fino de modelos mayores: emplear las predicciones de `pet-oam-l.gguf` (721,9 MB) como etiquetas aproximadas o como inicialización en flujos de destilación hacia potenciales más específicos.
- Despliegue en entornos con recursos limitados: ejecutar `pet-omat-s.gguf` en contenedores sin GPU ni PyTorch, usando `mlip.cpp` como runtime de inferencia para servir energías y fuerzas vía API.
- Validación cruzada entre dominios: comparar predicciones de las variantes MAD, OAM y OMAT sobre un mismo conjunto de estructuras para detectar sesgos de dominio antes de elegir un potencial para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de los ficheros, las variantes `xs` (16,3 MB) y `s` (53-95 MB) caben holgadamente en cualquier GPU consumer e incluso en CPU; `pet-oam-l.gguf` (721,9 MB) requiere del orden de 1-2 GB de memoria en ejecución, aunque la cifra exacta no está documentada.
- GPU recomendadas: no disponible; para las variantes pequeñas no se requiere GPU. Para `pet-oam-l` es razonable una RTX 4090 o superior, pero no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: sí para todas las variantes por tamaño de pesos; la viabilidad práctica depende de la implementación del runtime, no documentada.
- Opciones de despliegue: `mlip.cpp` (runtime nativo) y `mlip.js` (navegador). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peterspackman/mlip-gguf (uPET en GGUF) | 24.998.406 (checkpoint de referencia) | no aplica | GGUF | BSD-3-Clause | Hugging Face, runtime `mlip.cpp`/`mlip.js` |
| lab-cosmo/upet (origen) | no disponible en la información | no aplica | PyTorch / safetensors | BSD-3-Clause | Hugging Face, requiere PyTorch |
| Otros MLIP (MACE, CHGNet, etc.) | no disponible en la información | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite instrucciones en lenguaje natural.
- La precisión está acotada por el dominio de entrenamiento de cada variante; usar PET-SPICE para sólidos inorgánicos o PET-OMAT para moléculas orgánicas puede degradar las predicciones.
- El cálculo de fuerzas depende de la diferenciación del grafo exportado; cualquier inexactitud en la conversión a GGUF afecta directamente a las fuerzas y a la estabilidad de las simulaciones.
- No se documentan métricas de error (MAE de energía/fuerzas) en la información disponible, por lo que no es posible cuantificar la fidelidad frente a DFT sin validación propia.
- La licencia BSD-3-Clause permite uso comercial con atribución, pero conviene revisar el fichero LICENSE del repositorio y la licencia del proyecto `lab-cosmo/upet` de origen.
- El repositorio tiene 110 descargas y 0 likes, con actualización reciente (2026-11-16) pero sin señales de adopción amplia; el soporte de la comunidad y la madurez del runtime son limitados.
- No hay información sobre cuantizaciones alternativas, ni sobre el comportamiento numérico en precisión reducida.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo equivalente es la extrapolación fuera del dominio de entrenamiento, que puede producir energías y fuerzas no físicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peterspackman/mlip-gguf
- Modelo de origen uPET: https://huggingface.co/lab-cosmo/upet
- Runtime mlip.cpp: https://github.com/peterspackman/mlip.cpp
- Bindings JavaScript (mlip.js): https://github.com/peterspackman/mlip.cpp/tree/main/packages/mlip.js
