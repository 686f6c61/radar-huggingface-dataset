# AutomatosX/AX-Image-2.1-Turbo-AXQ-NVFP4

## Resumen

AX-Image-2.1-Turbo-AXQ-NVFP4 es una conversión experimental de almacenamiento en NVFP4 del modelo de generación de imágenes Qwen/Qwen-Image-2.1-Turbo, publicada por AutomatosX mediante su toolkit AXQuant 2.2.1. No se trata de un checkpoint nativo de inferencia FP4, sino de un contenedor de referencia que empaqueta 224 matrices de atención y MLP del transformer de imagen en bytes NVFP4 E2M1, con escalas de bloque E4M3 (16 valores) y escalas globales inversas en FP32. El resto de componentes (text encoder, VAE, normalización, modulación, proyecciones de entrada/salida) permanece en la precisión original.

El interés del artefacto es fundamentalmente metodológico: demuestra un flujo de cuantización post-entrenamiento (RTN, round-to-nearest) con verificación de integridad criptográfica y reconstrucción a BF16 para su ejecución en Diffusers. El propio autor advierte que el pack es "evidencia de desarrollo, no un certificado de calidad" y que será reconstruido con una versión mejorada del toolkit, por lo que los ficheros actuales quedarán en el historial del repositorio.

Es relevante ahora porque explora el formato NVFP4 (FP4 de NVIDIA) aplicado a modelos de difusión, un terreno menos maduro que la cuantización de LLM. Sin embargo, no ofrece aritmética FP4 en tiempo de ejecución ni reducción de memoria: el loader reconstruye los pesos completos en BF16, por lo que los requisitos de VRAM son equivalentes a los del pipeline original más buffers temporales de decodificación. El repositorio ocupa 22,4 GB y acumula 36 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base Qwen-Image-2.1-Turbo); conversión de cuantización sobre el image transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | NVFP4 E2M1 con escalas de bloque E4M3 (16 valores) y escalas globales inversas FP32; 224 matrices cuantizadas; 73 tensores del transformer sin cuantizar (byte-idénticos al origen) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license-agreement (research/evaluation only; uso comercial requiere licencia separada del licenciante original) |
| Formato de pesos | safetensors con contenedor propietario `axq-diffusion.reference/1`; nombres de fichero no estándar; requiere verificador/decoder explícito |

## Arquitectura y entrenamiento

El modelo subyacente es un pipeline text-to-image de difusión basado en Qwen-Image-2.1-Turbo, con un image transformer que procesa las matrices de atención y MLP. La conversión AXQ aplica un encoder RTN (round-to-nearest) propietario de AXQuant 2.2.1 sobre 224 matrices de atención y MLP, empaquetándolas en NVFP4 E2M1 con escalas de bloque E4M3 de 16 valores y escalas globales inversas en FP32. Los 73 tensores restantes del transformer se conservan sin cuantizar y se verifican como byte-idénticos respecto al origen. El text encoder, el VAE, las capas de normalización, la modulación/condicionamiento y las proyecciones de entrada/salida permanecen en la precisión del modelo fuente.

No se realizó calibración de activaciones, fine-tuning ni medición de sensibilidad por capa. El proceso preserva los `sample_sigmas` de ocho pasos del modelo original. El contenedor usa un formato específico (`axq-diffusion.reference/1`) distinto del formato compressed-tensors para LLM, con un entrypoint raíz personalizado y nombres de fichero no estándar que impiden la carga mediante `DiffusionPipeline.from_pretrained`, vLLM, AX Engine, MLX-LM, oMLX o MTPLX. El loader incluido verifica cada miembro del manifiesto, reconstruye los pesos completos del transformer en BF16, valida estrictamente el state dict real de Diffusers e inyecta el transformer en el pipeline original; toda la inferencia se ejecuta con operadores BF16 convencionales. Se realizó un único smoke test acotado de generación de imagen tras la reconstrucción BF16, documentado en `reference-runtime-smoke.json`, que no constituye una certificación de calidad de imagen ni de FP4 nativo.

## Capacidades

- Generación de imágenes text-to-image mediante el pipeline Qwen-Image-2.1-Turbo subyacente, con 8 pasos de inferencia y `true_cfg_scale` configurable.
- Control de resolución de salida (altura y anchura configurables; el ejemplo de la model card usa 512x512).
- Reproducibilidad mediante semilla (`torch.Generator` con `manual_seed`).
- Verificación de integridad de pesos: el loader comprueba cada miembro del manifiesto y valida el state dict antes de la inyección.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el pipeline depende del text encoder del modelo fuente, cuyos idiomas no se documentan en la información proporcionada.
- No incluye modo thinking, visión de entrada ni audio.

## Casos de uso

- Investigación en cuantización de modelos de difusión: el pack sirve como evidencia reproducible de un flujo RTN a NVFP4 con verificación de integridad, útil para estudiar el impacto del empaquetado FP4 en matrices de atención y MLP de un transformer de imagen.
- Validación de toolchains de cuantización: permite a equipos de infraestructura probar el verificador/decoder de AXQuant 2.2.1 y el formato `axq-diffusion.reference/1` antes de adoptar el toolkit en pipelines propios.
- Auditoría de integridad de pesos: los 73 tensores no cuantizados byte-idénticos y el manifiesto con digest permiten verificar que una conversión no altera componentes sensibles (VAE, text encoder, normalización).
- Reproducción de experimentos académicos: el smoke test documentado (hardware, dimensiones, semilla, versiones de dependencias) facilita replicar la generación de referencia en un entorno controlado.
- Estudio de formatos FP4 en difusión: comparar la reconstrucción BF16 de este pack con el checkpoint original para analizar diferencias numéricas introducidas por el empaquetado NVFP4.
- Referencia para el desarrollo de loaders personalizados: el entrypoint y el flujo de verificación sirven de plantilla para integrar contenedores no estándar en Diffusers sin recurrir a `from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta un smoke test acotado de generación de imagen tras reconstrucción BF16 (`reference-runtime-smoke.json`), que no constituye una medición de calidad de imagen ni de rendimiento FP4.

## Requisitos de hardware

- VRAM estimada: equivalente al pipeline BF16 original de Qwen-Image-2.1-Turbo más buffers temporales de decodificación; el loader no reduce RAM/VRAM ni acelera la inferencia (no hay aritmética FP4 en ejecución).
- GPU recomendadas: no disponibles de forma específica; se requiere una GPU con memoria suficiente para el pipeline BF16 reconstruido (el smoke test documenta el hardware empleado en `reference-runtime-smoke.json`).
- GPU de consumo: no confirmado; depende del tamaño del pipeline BF16 subyacente, no documentado en la información proporcionada.
- Opciones de despliegue: exclusivamente el loader de referencia `axq_diffusion_reference.load_qwen_image_pipeline` con `axquant[cuda]==2.2.1`, `diffusers==0.41.0`, `transformers==5.19.0`, `accelerate==1.15.0` y `torchvision==0.29.1`. No compatible con `DiffusionPipeline.from_pretrained`, vLLM, AX Engine, MLX-LM, oMLX ni MTPLX.
- Latencia y throughput: no disponibles; al ejecutarse en BF16, se espera un rendimiento similar al pipeline original, sin ganancia por la cuantización.
- Requisito de descarga: directorio local con ficheros regulares; el verificador rechaza árboles de pesos con enlaces simbólicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Image-2.1-Turbo-AXQ-NVFP4 | no disponible | no aplica | NVFP4 E2M1 (224 matrices) | qwen-research-license-agreement | safetensors, contenedor `axq-diffusion.reference/1` |
| Qwen/Qwen-Image-2.1-Turbo (origen) | no disponible | no aplica | BF16 (sin cuantizar) | qwen-research-license-agreement | safetensors, Diffusers estándar |
| Alternativas de difusión cuantizadas | no disponible | no aplica | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el checkpoint fuente Qwen/Qwen-Image-2.1-Turbo (commit `fc13ba1986fcb905854dc8de2f52eee395f49b5b`), del que este pack es una conversión de almacenamiento. No se dispone de datos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- No es un checkpoint nativo de inferencia FP4: no proporciona aritmética FP4, ni reducción de RAM/VRAM, ni aceleración; la inferencia se ejecuta en BF16 tras la reconstrucción.
- No hay certificación de calidad de imagen: el único smoke test realizado no valida la fidelidad visual respecto al modelo original.
- El pack será reconstruido con una versión mejorada de AXQuant y reemplazado como nueva revisión; se recomienda fijar un commit si se depende de los ficheros actuales.
- El autor lo describe explícitamente como "evidencia de desarrollo, no un certificado de calidad".
- Licencia de investigación: uso comercial requiere licencia separada del licenciante original (Qwen); la licencia de software de AXQuant no concede derechos comerciales sobre los pesos.
- Obligación de conservar la licencia de investigación completa, el Notice obligatorio y los avisos de modificación al redistribuir.
- No se realizó calibración de activaciones, fine-tuning ni medición de sensibilidad por capa; el impacto de la cuantización NVFP4 en la calidad de generación no está caracterizado.
- Incompatible con las rutas de carga estándar de Diffusers, vLLM y otras herramientas; requiere el loader de referencia y versiones de dependencias muy específicas.
- El verificador rechaza árboles de pesos con enlaces simbólicos, lo que limita ciertos flujos de descarga y despliegue.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; heredables del modelo fuente, no caracterizados en esta conversión.
- Idiomas soportados: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Image-2.1-Turbo-AXQ-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/tree/fc13ba1986fcb905854dc8de2f52eee395f49b5b
- Licencia del modelo base: LICENSE (incluida en el repositorio)
- Manifiesto de cuantización: `axq-diffusion-manifest.json` (en el repositorio)
- Validación estática: `static-validation.json` (en el repositorio)
- Recibo del smoke test: `reference-runtime-smoke.json` (en el repositorio)
