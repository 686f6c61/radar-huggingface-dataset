# signalNotNoise/shap-e-mlx

## Resumen

Shap-E MLX es un paquete de pesos convertidos del modelo Shap-E de OpenAI, adaptados para su ejecución en Apple Silicon mediante el framework MLX. Lo publica el desarrollador independiente signalNotNoise como parte del proyecto apple-mlx-foundations, que ofrece implementaciones en Python (MLX) y Swift del pipeline original de Shap-E. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversión de los checkpoints originales de Shap-E y CLIP ViT-L/14 a un formato de tensores binarios planos descrito por un `manifest.json`, pensado para ser cargado por runtimes propios y no por Transformers.

El modelo resuelve la generación de mallas 3D a partir de texto (text-to-3D) y, en la implementación Swift, también a partir de imagen (image-to-3D). La arquitectura subyacente es la de Shap-E: un transformer de difusión que genera parámetros de un campo NeRSTF (Neural Radiance Surface Texture Field) que después se renderiza a malla. Se apoya en CLIP ViT-L/14 para la codificación de las condiciones de texto e imagen.

La relevancia actual es acotada pero específica: permite ejecutar generación 3D condicionada por texto en hardware Apple (CPU y Metal) sin depender de CUDA ni de PyTorch, algo poco habitual en el ecosistema de modelos 3D. El bundle ocupa unos 5,14 GB, contiene 1.088 tensores en float32 y se distribuye con licencia MIT, en estado de release candidate v0.1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Shap-E) + codificador CLIP ViT-L/14; salida como parametros NeRSTF renderizados a malla |
| Parametros totales | no disponible (el bundle contiene 1.088 tensores float32; el desglose por familia se da en bytes, no en recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el pipeline usa prompts de texto cortos; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible (todos los tensores del bundle son float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | Tensores binarios crudos (`.bin`, C-order contiguo, sin cabecera) descritos por `manifest.json` (formato v1); no son checkpoints PyTorch y no cargan con `from_pretrained` |

## Arquitectura y entrenamiento

El bundle empaqueta siete familias de tensores: `clip_text` (codificador de texto CLIP ViT-L/14, 149 tensores, 494.601.216 bytes), `text300m` (transformer de difusión condicionado por texto, 303 tensores, 1.262.768.128 bytes), `clip_vision` (codificador de imagen CLIP, 296 tensores, 1.215.864.832 bytes), `image300m` (transformer de difusión condicionado por imagen, 305 tensores, 1.263.824.896 bytes), `diffusion` (7 tensores con el schedule de ruido y coeficientes posteriores, 28.672 bytes), `decoder_params` (16 tensores de proyección latente a parámetros NeRSTF, 903.712.488 bytes) y `renderer` (12 tensores con pesos estáticos del campo NeRSTF, caja envolvente y ajustes de campo, 595.016 bytes). Las familias de texto suman 2.661.705.520 bytes; las dos familias de imagen que solo usa Swift añaden 2.479.689.728 bytes.

No hay entrenamiento ni fine-tuning en esta conversión: el autor lo indica explícitamente ("Conversion does not constitute training or fine-tuning"). Los pesos provienen de los checkpoints originales de OpenAI Shap-E y CLIP, y el `provenance.json` registra las revisiones de código y los hashes SHA-256 de origen. La innovación técnica del paquete es de formato y portabilidad: un manifiesto con dtype y shape por tensor, checksums de 1.102 ficheros de entrega, y validación declarada de paridad L1 (golden) y L2 (Python/Swift) contra el Torch original, incluyendo un smoke test de topología de malla a 64 pasos en CPU y Metal.

## Capacidades

- Generación de mallas 3D condicionadas por texto (text-to-3D) mediante el runtime Python MLX y el runtime Swift ShapERuntime.
- Generación de mallas 3D condicionadas por imagen (image-to-3D), disponible solo en la implementación Swift (familias `clip_vision` e `image300m`).
- Codificación de prompts con CLIP ViT-L/14 y tokenizador BPE de CLIP incluido (`bpe_simple_vocab_16e6.txt.gz`).
- Renderizado de la representación latente a parámetros NeRSTF y de ahí a malla, con control de semilla, número de pasos de difusión y resolución de grid.
- Ejecución en CPU y en GPU Metal de Apple Silicon mediante MLX.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni audio. El modelo no genera texto libre: su salida es geometría 3D.

## Casos de uso

- Prototipado rápido de assets 3D en equipos Mac: un diseñador puede generar una malla a partir de un prompt ("a red chair") con `ShapECLI --prompt ... --steps 64 --grid 64` y revisar el resultado sin salir del portátil, aprovechando que no requiere CUDA.
- Integración en herramientas de modelado para macOS: el runtime Swift permite incrustar generación text-to-3D en una app nativa, usando el bundle como recurso local y Metal para la inferencia.
- Generación condicionada por imagen en flujos de fotogrametría ligera: la ruta image-to-3D de Swift permite partir de una foto o render como condición para producir una malla aproximada, útil para bocetos de props.
- Investigación y reproducción de Shap-E en hardware Apple: el paquete incluye `reproduce_export.py`, `provenance.json` y checksums, lo que facilita comparar resultados contra el Torch original en un entorno MLX.
- Docencia y experimentación con modelos generativos 3D: al ser un bundle autocontenido de 5,14 GB con validación de paridad documentada, sirve para estudiar el pipeline difusión-CLIP-NeRSTF paso a paso.
- Generación offline en entornos sin conectividad ni servicio alojado: el autor no ofrece servicio de inferencia hospedado, de modo que todo el cómputo ocurre en local sobre el bundle descargado, lo que encaja en entornos con requisitos de privacidad.
- Pruebas de pipelines de assets en CI sobre runners macOS: el CLI y el paquete Swift permiten ejecutar un smoke test de generación de malla con semilla fija y verificar checksums como parte de la validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta validaciones de paridad (L1 golden, L2 Python/Swift, paridad de preprocesado de imagen, CLIP-grid e Image300M contra Torch, y un smoke test de topología de malla a 64 pasos en CPU/Metal) y verificaciones de checksums, sin métricas de calidad de malla ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU dedicada; el modelo está pensado para memoria unificada de Apple Silicon. El bundle completo pesa 5,143 GB en float32, por lo que se necesita al menos ese espacio en disco y una fracción comparable de memoria unificada para cargar las familias usadas.
- Memoria según la ruta: la ruta de texto usa las familias `clip_text`, `text300m`, `diffusion`, `decoder_params` y `renderer` (2.661.705.520 bytes de tensores más el renderer y el decoder); la ruta de imagen en Swift añade `clip_vision` e `image300m` (2.479.689.728 bytes adicionales).
- GPU recomendadas: no se especifican modelos concretos de Apple Silicon. El autor indica Apple Silicon con MLX y, para Swift, Xcode y las versiones de macOS soportadas por el paquete. No hay soporte documentado para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para Macs con Apple Silicon; no se documenta compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: runtime Python MLX y runtime Swift ShapERuntime del repositorio apple-mlx-foundations, con el CLI `ShapECLI`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se cita un smoke test de topología de malla a 64 pasos ejecutado en CPU y Metal, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shap-E MLX (este bundle) | no disponible (1.088 tensores float32, 5,14 GB) | no disponible | Malla 3D vía NeRSTF, texto e imagen (imagen solo en Swift) | MIT | Hugging Face, runtime propio MLX/Swift |
| Shap-E original (OpenAI) | no disponible en la informacion proporcionada | no disponible | Malla 3D vía NeRSTF, texto e imagen | MIT | Repositorio openai/shap-e en GitHub |
| CLIP ViT-L/14 (OpenAI) | no disponible en la informacion proporcionada | no disponible | Embeddings de texto e imagen (no genera 3D) | MIT | Repositorio openai/CLIP en GitHub |

No se dispone de datos de benchmarks ni de otros modelos 3D comparables en la información proporcionada, por lo que la comparación se limita a licencia, disponibilidad y naturaleza de la salida.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es una conversión de pesos. Cualquier limitación del Shap-E original se hereda sin cambios.
- La model card advierte de que la geometría generada puede contener artefactos y debe inspeccionarse antes de usarse.
- El bundle no carga con Transformers `from_pretrained`; los `.bin` son tensores crudos sin cabecera y requieren el manifiesto y los runtimes propios. Intentar cargarlos como checkpoints PyTorch fallará.
- Solo se declara soporte de idioma inglés (`en`).
- La ruta de imagen (image-to-3D) está limitada a la implementación Swift; el runtime Python solo soporta condicionamiento por texto.
- No hay servicio de inferencia alojado; todo el cómputo es local y depende de hardware Apple Silicon.
- El proyecto está en estado de release candidate v0.1.0, con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa de la comunidad.
- Restricciones de licencia: MIT, con las licencias upstream de Shap-E y CLIP incluidas en `licenses/`; la conversión no otorga derechos adicionales sobre los pesos originales más allá de lo que permitan esas licencias.
- El repositorio arranca con historial público limpio; la trazabilidad depende de `provenance.json` y `checksums.sha256`, por lo que conviene fijar una revisión concreta al descargar.
- Riesgo de alucinación en el sentido geométrico: el modelo puede producir formas plausibles pero incorrectas respecto al prompt, sin mecanismo de verificación integrado.

## Enlaces

- Hugging Face: https://huggingface.co/signalNotNoise/shap-e-mlx
- Repositorio del runtime: https://github.com/signalnotnoise/apple-mlx-foundations
- Mapa de ficheros del bundle: https://github.com/signalnotnoise/apple-mlx-foundations/blob/main/docs/FILE-STRUCTURE.md
- Estado de la release: https://github.com/signalnotnoise/apple-mlx-foundations/blob/main/docs/RELEASE-STATUS.md
- Shap-E original (OpenAI): https://github.com/openai/shap-e
- CLIP original (OpenAI): https://github.com/openai/CLIP
