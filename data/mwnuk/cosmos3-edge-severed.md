# mwnuk/Cosmos3-Edge-severed

## Resumen

Cosmos3-Edge-severed es una derivación del modelo `nvidia/Cosmos3-Edge`, un world model de difusión de vídeo construido sobre una arquitectura Mixture-of-Transformers (MoT). El autor, `mwnuk`, no entrena ni modifica pesos: extrae las dos torres del MoT original (una torre de generación o *denoiser* y una torre de comprensión o *reasoner*, de tipo VLM) como componentes cargables de forma independiente, y añade copias sin modificar de todas las piezas auxiliares necesarias para reconstruir el pipeline completo sin depender del repositorio original.

El interés técnico del artefacto es que documenta y verifica la separabilidad exacta de las dos torres: según la model card, el denoiser reconstruido solo a partir de `denoiser/` más la caché de KV de la torre de comprensión reproduce la salida del modelo completo de 4B bit a bit (diferencia absoluta máxima 0 en el vídeo decodificado), y el reasoner reconstruido solo a partir de `reasoner/` reproduce las KV por capa de las 28 capas también bit a bit. Esto convierte el repositorio en una implementación de referencia para experimentar con arquitecturas de world-action-model de tres torres.

El modelo base es relevante porque aborda la generación y comprensión conjunta de vídeo en un único transformer con atención unidireccional entre torres, un patrón poco común que permite reutilizar la comprensión del VLM como condicionamiento constante durante el denoising. La licencia es OpenMDW 1.1, la misma del checkpoint original de NVIDIA, y el autor declara explícitamente que no es un lanzamiento de NVIDIA ni está respaldado por ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) con dos torres: denoiser de difusión de vídeo y reasoner VLM; atención unidireccional (und causal, gen sobre concat(und_KV, gen_KV)) |
| Parametros totales | 4B (modelo completo, según la model card) |
| Parametros activos | no disponible (no se documenta configuración MoE dispersa con expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la card menciona bf16 y fp32 para módulos concretos, no un catálogo de cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement v1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (slices y copias del checkpoint original; nombres de tensor originales preservados) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Transformers con dos flujos acoplados. La torre de comprensión (`reasoner/`, 3,89 GB) actúa como VLM: procesa tokens de texto e imagen/vídeo y produce las claves y valores (`und_KV`) que condicionan la generación. La torre de generación (`denoiser/`, 2,85 GB) implementa el proceso de difusión sobre latentes de vídeo, con atención `add_*`, MLPs y normas `*_moe_gen`, proyecciones de entrada/salida de latente (`proj_in/out`), embedder de timestep y cabezas de acción con consciencia de dominio. La interfaz entre ambas torres son 28 normas `k_norm_und_for_gen`, una por capa, incluidas en ambas carpetas de componentes.

La atención es unidireccional: los tokens de comprensión se autoatienden de forma causal, mientras que los tokens de generación atienden sobre la concatenación de las KV de comprensión y las de generación. La card verifica que la KV de comprensión para un prompt fijo es constante a lo largo de los pasos de denoising (bit idéntica en las 28 capas), lo que permite cachearla y desacoplar ambos flujos en inferencia. El VAE es el Wan VAE (vídeo ↔ latentes de 48 canales, factor temporal 4× y espacial 8×), y el codificador visual es SigLIP2 con proyector, usado solo para prompts de comprensión de imagen/vídeo.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor de esta derivación no entrena: extrae slices y copias sin modificar del checkpoint `nvidia/Cosmos3-Edge`. Los requisitos de reproducibilidad exacta son ejecutar `time_embedder` en float32 (`_keep_in_fp32_modules`) y cargar `buffers.safetensors`, que contiene la `inv_freq` rotatoria no persistente en fp32; instanciarla en bf16 diverge de la salida original.

## Capacidades

- Generación de vídeo por difusión a partir de latentes, incluyendo image-to-video (la carpeta `assets/` incluye una imagen i2v y prompts JSON de ejemplo).
- Comprensión de imagen y vídeo mediante la torre reasoner (VLM) con codificador SigLIP2 y proyector.
- Condicionamiento cruzado entre comprensión y generación mediante KV cacheadas, lo que permite reutilizar el análisis del VLM en cada paso de denoising.
- Cabezas de acción con consciencia de dominio en el denoiser, orientadas a escenarios de world-action-model.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en arquitecturas MoT: el repositorio permite cargar cada torre por separado y estudiar el acoplamiento a través de las 28 normas de interfaz sin cargar el transformer fusionado de 6,7 GB.
- Reconstrucción de un world-action-model de tres torres: la card indica que el propósito es probar un rebuild con VLM externo, este denoiser y un experto de acción propio contra componentes verificados.
- Caché de condicionamiento para inferencia eficiente: dado que la KV de comprensión es constante por prompt, se puede calcular una vez con el reasoner y reutilizarla en todos los pasos de denoising del denoiser.
- Verificación de pipelines de difusión de vídeo: los scripts de verificación y los assets fijados permiten comprobar bit a bit que una implementación propia reproduce la salida del modelo de 4B.
- Generación image-to-video controlada por prompt: usando el ejemplo i2v incluido en `assets/` como punto de partida para experimentos reproducibles.
- Integración en `diffusers`: el pipeline `Cosmos3OmniPipeline` (requiere `diffusers >= 0.41.0.dev0`) permite incorporar los componentes extraídos a flujos de trabajo estándar de la librería.
- Docencia y auditoría de modelos: al preservar nombres de tensor originales y un `manifest.json` por componente, facilita trazar cada peso hasta el checkpoint de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa de la model card es de verificación de equivalencia, no de calidad:

| Prueba de verificacion | Resultado |
|---|---|
| Denoiser reconstruido + und-KV cacheada vs. modelo completo de 4B | Diferencia absoluta máxima 0 en vídeo decodificado (bit a bit) |
| Reasoner reconstruido vs. modelo completo, KV por capa | Bit idéntico en 28/28 capas desde `input_ids` |
| Estabilidad de und-KV a lo largo del denoising | Bit idéntica en 28/28 capas para prompt fijo |

## Requisitos de hardware

- Tamaño del repositorio: 9,1 GB en total; componentes principales de 2,85 GB (denoiser), 3,89 GB (reasoner), 1,4 GB (VAE) y 1,0 GB (vision encoder).
- El transformer fusionado original son 6,7 GB de shards, no incluidos en este repositorio.
- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, cargar denoiser, reasoner, VAE y vision encoder en bf16 requiere del orden de 9 GB solo en pesos, más activaciones y latentes de vídeo, que no se cuantifican en la información disponible.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; no se documenta una configuración validada en RTX 4090 u otras consumer.
- Opciones de despliegue: `diffusers >= 0.41.0.dev0` con las clases de Cosmos3; no se mencionan vLLM, llama.cpp, Ollama ni TGI (el modelo es de difusión, no un LLM autoregresivo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-severed (este) | 4B (completo) | no disponible | MoT de dos torres, componentes separados y verificados bit a bit | OpenMDW 1.1 | Hugging Face, 9,1 GB, repo derivado |
| nvidia/Cosmos3-Edge | 4B (completo) | no disponible | MoT de dos torres, checkpoint fusionado | OpenMDW 1.1 | Hugging Face, checkpoint oficial de NVIDIA |
| Otros world models de vídeo de la familia Cosmos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a disponibilidad y empaquetado.

## Limitaciones y advertencias

- No es un lanzamiento de NVIDIA ni está respaldado por ella; es una derivación no oficial de `nvidia/Cosmos3-Edge`.
- El repositorio no incluye el transformer fusionado original (6,7 GB); para usar el modelo completo hay que descargar el checkpoint de NVIDIA.
- La reproducibilidad bit a bit exige dos condiciones estrictas: `time_embedder` en float32 y cargar `buffers.safetensors`; instanciar la `inv_freq` rotatoria en bf16 diverge de la salida original.
- Los scripts de carga y verificación y el análisis de arquitectura están en un repositorio privado (`github.com/wnukmat/cosmos`), por lo que no son auditables públicamente desde la información disponible.
- Requiere `diffusers >= 0.41.0.dev0` con las clases de Cosmos3, una versión de desarrollo no estable.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible para la torre de generación; el reasoner es un VLM y no se documentan evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: OpenMDW 1.1 aplica al modelo base y a esta derivación; los avisos de origen del modelo original siguen vigentes. No se detallan en la información disponible las condiciones concretas de uso comercial.
- El repositorio registra 0 descargas y 0 likes, y el pipeline aparece como no disponible en Hugging Face, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-09-07) es posterior a la fecha de la información de referencia; conviene verificar la vigencia de los metadatos antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mwnuk/Cosmos3-Edge-severed
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Repositorio de scripts y análisis (privado según la model card): https://github.com/wnukmat/cosmos
- Librería diffusers: https://github.com/huggingface/diffusers
