# rusting-studio/Kaze-3D-v0.1

## Resumen

Kaze-3D-v0.1 es un modelo de generación 3D a partir de una única imagen (image-to-3D) desarrollado por rusting-studio. Convierte una fotografía o render de un objeto en una malla 3D mediante un pipeline de flow matching: un codificador de imagen CLIP ViT-B/16 congelado extrae 197 tokens visuales, un transformer de flujo de 103,2 millones de parámetros genera un latente de forma y un VAE de forma de 31,4 millones de parámetros lo decodifica en un campo de distancia con signo del que se extrae la malla por marching tetrahedra.

La propuesta diferencial no es solo el resultado, sino la implementación: todo el entrenamiento e inferencia están escritos en Rust sobre el framework RustingBrain, sin una línea de Python. El modelo se entrenó desde cero en una única RTX 3060 de 12 GB y genera una malla en unos 4 segundos en esa misma GPU, con un consumo de unos 2,1 GiB de VRAM, y también funciona en CPU.

Es una versión temprana (v0.1) con licencia Apache-2.0 y entrenada exclusivamente con datos CC-BY y CC0. El autor es explícito sobre sus límites: captura la forma y el tamaño general de los objetos, pero falla en el detalle fino y en las proporciones exactas, y produce solo geometría, sin textura ni color.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching sobre transformer (latente de forma) + VAE de forma (SDF) + codificador CLIP ViT-B/16 congelado |
| Parámetros totales | 134.668.033 (103.219.968 transformer de flujo + 31.448.065 VAE de forma); CLIP ViT-B/16 adicional, no incluido en el repo |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen de 512×512; 197 tokens visuales de CLIP) |
| Tipos de cuantización | no disponible (pesos en safetensors; inferencia en fp32/fp16 según el runner, no documentado) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | Apache-2.0 (pesos); CLIP mantiene licencia MIT y no se redistribuye |
| Formato de pesos | safetensors (malla de salida en `.glb`) |

## Arquitectura y entrenamiento

El pipeline tiene tres componentes. El codificador de imagen es CLIP ViT-B/16 congelado, que transforma la imagen de entrada en 197 tokens. El transformer de flujo (103.219.968 parámetros) parte de ruido y, condicionado por esos tokens, genera un latente de forma mediante flow matching. Finalmente, el VAE de forma (31.448.065 parámetros) convierte el latente en un campo de distancia con signo (SDF) del que se extrae la malla con marching tetrahedra. La salida es geometría pura, sin textura ni color.

El entrenamiento se realizó íntegramente en una RTX 3060 de 12 GB. El VAE de forma se entrenó 225.000 pasos con batch 16 y learning rate 2e-4 con decaimiento a 2e-5, sobre un corpus previo de 53.688 objetos. El transformer de flujo se entrenó 127.500 pasos (de 200.000 previstos, detenido antes de completar el plan) con batch 32, learning rate 1e-4 con decaimiento coseno a 1e-5 y unos 490 ms por paso; la versión publicada es la media exponencial (EMA 0.9999). El corpus final son 112.364 objetos renderizados desde 8 vistas: 1.031 escaneos de Google Scanned Objects (CC-BY 4.0) y 111.333 objetos de Objaverse filtrados por licencia (110.699 CC-BY 4.0 y 634 CC0 1.0), excluyendo licencias no comerciales o share-alike.

## Capacidades

- Generación de malla 3D a partir de una única imagen RGB (pipeline `image-to-3d`).
- Salida en formato `.glb` (glTF), compatible con Blender y visores glTF.
- Control de generación mediante `--seed`, `--steps` (por defecto 28), `--guidance` (por defecto 4) y `--faces`.
- Inferencia en GPU CUDA (NVIDIA) y en CPU.
- Captura de forma y tamaño global de objetos; mejor rendimiento en zapatos, cajas y objetos planos.
- No genera textura ni color: solo geometría.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Prototipado rápido de assets 3D: a partir de una foto o render de un objeto se obtiene una malla base en 4 segundos que un artista puede retopologizar y texturizar en Blender, acelerando el bloqueo inicial de un asset.
- Poblar escenas y entornos de realidad virtual o aumentada: generar mallas de objetos cotidianos (cajas, calzado, utensilios) para llenar escenarios sin modelado manual, aceptando la falta de detalle.
- Previsualización en comercio electrónico: crear una representación 3D aproximada de un producto a partir de su foto de catálogo para vistas previas interactivas, dado que el modelo funciona bien con objetos centrados sobre fondo plano.
- Generación de datasets sintéticos de geometría: usar el modelo para producir mallas con `--seed` controlado y aumentar corpus de entrenamiento de otros sistemas 3D, con la ventaja de que la licencia Apache-2.0 permite uso comercial.
- Herramientas de escaneo y digitalización de bajo coste: integrar el runner en un flujo que reciba una foto de un objeto físico y devuelva una malla aproximada, útil para inventario o documentación de patrimonio con equipamiento modesto.
- Despliegue en entornos sin Python: al ejecutarse con un binario Rust (RustingRunner) en CPU o GPU, encaja en pipelines de producción con requisitos estrictos de dependencias o en sistemas embebidos donde no se quiere un stack Python.
- Investigación en generación 3D eficiente: servir de base reproducible para experimentar con flow matching y SDF en hardware de consumo (una sola RTX 3060), con pesos y código abiertos.

## Benchmarks y rendimiento

Resultados medidos por el autor en RTX 3060 sobre Google Scanned Objects excluidos del entrenamiento. La forma real se escala para que su lado más largo abarque [-1, 1] y la salida se puntúa tal cual, sin alineación con la verdad. F@0.02 es la F-score a una distancia del 1% del lado más largo, sobre 50.000 puntos por superficie; 1.0 es coincidencia perfecta.

| Tarea | Objetos | F@0.02 | IoU | Objetivo (F@0.02) |
|---|---|---|---|---|
| VAE de forma, reconstrucción | 32 | 0.923 | 0.868 | 0.90, alcanzado |
| Imagen a forma, 28 pasos, guidance 4 | 64 | 0.215 | 0.344 | 0.55, no alcanzado |

Solo 6 de los 64 objetos alcanzan por sí solos 0.55 de F@0.02. Una generación tarda 4 segundos en la RTX 3060, incluyendo la carga de pesos (tres ejecuciones, entre 3,9 y 4,1 s). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a un modelo image-to-3D.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,1 GiB en la RTX 3060 según el autor.
- GPU recomendadas: cualquier NVIDIA con soporte CUDA y al menos ~2,1 GiB libres; el autor valida en RTX 3060 12 GB. GPU de gama superior (RTX 4090, A100, H100) no están documentadas pero deberían funcionar por exceso de capacidad.
- Cabe en GPU de consumo: sí, en RTX 3060 y previsiblemente en modelos con 4 GB o más de VRAM.
- Ejecución en CPU: soportada compilando RustingRunner sin `--features cuda`.
- Opciones de despliegue: binario RustingRunner (compilado con `cargo build --release`, con o sin `--features cuda`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 4 segundos por malla en RTX 3060 con carga de pesos incluida (3,9-4,1 s en tres ejecuciones). Throughput en otros hardware no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de image-to-3D (por ejemplo, TripoSR, InstantMesh, TRELLIS u otros). Por tanto, la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kaze-3D-v0.1 | 134,7 M (transformer + VAE) + CLIP ViT-B/16 | Imagen 512×512 | Apache-2.0 | Hugging Face + GitHub |
| Alternativas image-to-3D | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión temprana (v0.1): captura la forma y el tamaño generales, pero las proporciones suelen desviarse varios puntos porcentuales y los objetos alargados a veces salen girados alrededor del eje vertical.
- Rendimiento desigual: mejor en zapatos, cajas y objetos planos; peor en partes finas, marcos, objetos redondos y objetos compuestos por varias piezas.
- Entrenado solo con renders de objetos únicos: fotos reales, escenas y varias piezas en una imagen quedan fuera de su distribución y degradan el resultado.
- Solo geometría: no genera textura ni color, lo que limita su uso directo en producción sin postprocesado.
- Calidad medida baja en imagen a forma (F@0.02 = 0.215 frente a objetivo 0.55); no apto para aplicaciones que exijan fidelidad geométrica alta.
- Riesgo de alucinación geométrica: puede inventar o simplificar partes no visibles en la imagen de entrada.
- Sesgos: el corpus (Google Scanned Objects y Objaverse filtrado) puede sobrerrepresentar ciertas categorías de objetos y estilos de render, con menor cobertura de otras.
- Licencia: los pesos son Apache-2.0, pero el codificador CLIP se distribuye aparte bajo MIT y debe descargarse por separado; verificar el cumplimiento de ambas licencias en uso comercial.
- Dependencia de un stack poco común (RustingBrain/RustingRunner): requiere toolchain Rust y, para GPU, CUDA; menor ecosistema y soporte que las alternativas en Python.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rusting-studio/Kaze-3D-v0.1
- Framework de entrenamiento (RustingBrain): https://github.com/RustingStudio/RustingBrain
- Runner de inferencia (RustingRunner): https://github.com/RustingStudio/RustingRunner
- Codificador CLIP ViT-B/16: https://huggingface.co/openai/clip-vit-base-patch16
- Objaverse (Deitke et al., CVPR 2023): no disponible enlace directo en la información proporcionada
- Google Scanned Objects (Downs et al., ICRA 2022): no disponible enlace directo en la información proporcionada
