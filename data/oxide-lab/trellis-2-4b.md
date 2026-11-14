# oxide-lab/TRELLIS.2-4B

## Resumen

TRELLIS.2-4B es un modelo de imagen a 3D desarrollado por Microsoft, construido en torno a la representación de vóxeles dispersos O-Voxel. Este repositorio concreto, publicado por oxide-lab, no contiene el checkpoint original, sino una exportación canónica en `safetensors` pensada para el runtime Lux3D (implementado en Rust sobre el framework Candle). La canonicalización fusiona los nueve shards originales en un único archivo, añade prefijos de etapa a las claves y preserva los dtypes byte a byte, sin modificar ningún valor tensorial.

El pipeline completo incluye un codificador de imagen DINOv3 ViT-L/16, un DiT de flujo para estructura dispersa a 64³, DiTs de flujo SLAT para forma y textura a resoluciones 512 y 1024, y decodificadores VAE dispersos que generan geometría O-Voxel y atributos PBR por vóxel. La salida típica es una malla GLB texturizada con un sidecar de atributos PBR por vértice, aunque también se admiten `.obj` y `.ply`.

Es relevante ahora porque facilita el despliegue local del modelo de Microsoft en un runtime nativo sin dependencias de Python, con variantes cuantizadas GGUF publicadas aparte y un contrato de paquete canónico reproducible (checksums SHA-256, manifiesto de procedencia y configuración resuelta). El número real de parámetros almacenados en el safetensors es de 7.786.541.462, superior a los 4B que sugiere el nombre del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-etapa: DINOv3 ViT-L/16 (image_cond), DiT de flujo para estructura dispersa 64³ (ss_flow), DiTs de flujo SLAT para forma y textura 512/1024, decodificadores VAE dispersos 3D (shape_dec, tex_dec) |
| Parametros totales | 7.786.541.462 (según safetensors); el nombre comercial indica 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen) |
| Tipos de cuantizacion | Pesos canónicos en BF16/F16/F32 mixtos; variantes GGUF aparte: f16, q8_0, q6_k, q5_k, q4_k (cuantización solo en los DiT de flujo) |
| Idiomas soportados | no disponible (modelo imagen a 3D, sin interfaz de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (canónico), GGUF (variantes cuantizadas en repo separado) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión por etapas sobre representación O-Voxel. La primera etapa condiciona con un ViT DINOv3 (415 tensores) y genera estructura dispersa a 64³ mediante un DiT de flujo (`ss_flow`, 640 tensores) seguido de un decodificador convolucional 3D denso (`ss_dec`). A partir de ahí, dos DiTs SLAT de forma (`shape_dit_512`, `shape_dit_1024`) producen la geometría, que un VAE disperso (`shape_dec`, 292 tensores) convierte en O-Voxel. Finalmente, dos DiTs SLAT de textura (`tex_dit_512`, `tex_dit_1024`) y un VAE de textura (`tex_dec`, 284 tensores) generan atributos PBR por vóxel.

El paquete canónico contiene 4265 tensores con almacenamiento mixto: 3200 en BF16, 612 en F16 y 453 en F32, preservados del upstream. La canonicalización no altera valores: fusiona los shards tensor a tensor, prefija las claves por etapa y conserva los dtypes. El pipeline de referencia por defecto es `1024_cascade` (pasada de estructura y forma SLAT a 512, luego forma y textura a 1024). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de mallas 3D texturizadas a partir de una imagen de entrada (imagen a 3D).
- Producción de geometría O-Voxel con atributos PBR por vóxel.
- Salida en GLB con sidecar PBR, además de `.obj` y `.ply`.
- Pipeline en cascada a 512 y 1024 (modo `1024_cascade`), con modo rápido solo-geometría a 512.
- Preprocesado con eliminación de fondo (RMBG-2.0/BiRefNet) para entradas RGB sin canal alfa.
- Control de semilla (`--seed`) para reproducibilidad.
- Ejecución nativa en runtime Rust/Candle con soporte CUDA.
- Servidor HTTP con configuración de rutas de modelos vía argumentos o variables de entorno.
- No soporta tool calling, agentes ni razonamiento multi-turno (no es un modelo de lenguaje).

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de una imagen de referencia, generar una malla GLB texturizada con PBR y usarla como base en el motor, aprovechando el modo `512` con `--steps 12 --texture false` para previsualizaciones de geometría rápidas.
- Catálogos de e-commerce con vista 3D: convertir fotos de producto en mallas texturizadas para visores web, usando el pipeline `1024_cascade` para calidad final y el modo 512 para iteración.
- Escaneo y reconstrucción de patrimonio: digitalizar objetos a partir de fotografías con fondo eliminado mediante RMBG-2.0, generando mallas con atributos PBR para renderizado físico.
- Integración en pipelines de CI/CD de contenido 3D: el runtime Lux3D en Rust permite invocar la generación desde scripts de build (`cargo run -p lux3d-cli -- run trellis2`) y validar el contrato del paquete con `inspect`, facilitando la automatización.
- Despliegue en servidor de generación 3D: el servidor HTTP del runtime acepta rutas de modelo y RMBG por configuración, permitiendo ofrecer un servicio de imagen a 3D con las variantes GGUF cuantizadas para reducir VRAM.
- Investigación en representaciones 3D: el paquete canónico con manifiesto, checksums y configuración resuelta permite reproducir exactamente el pipeline y experimentar con las etapas SLAT de forma y textura por separado.
- Generación de assets para impresión 3D o visualización científica: salida `.obj`/`.ply` con geometría O-Voxel para flujos de post-procesado fuera del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de tamaños de almacenamiento: pesos canónicos ~15,07 GiB (BF16/F16/F32 mixtos); variantes GGUF: f16 14,50 GiB, q8_0 8,87 GiB, q6_k 7,41 GiB, q5_k 6,61 GiB, q4_k 5,86 GiB.
- GPU recomendadas: no disponible en la información proporcionada; el runtime soporta CUDA (`--features cuda`).
- ¿Cabe en GPU consumer? No confirmado. Las variantes q4_k (5,86 GiB) y q5_k (6,61 GiB) son las más plausibles para GPUs de consumo con 8-12 GB, pero no hay datos oficiales de VRAM en ejecución (activaciones, decodificadores y DINOv3 en F16 añaden consumo).
- Opciones de despliegue: runtime Lux3D (Rust/Candle) vía CLI o servidor HTTP; variantes GGUF en `oxide-lab/TRELLIS.2-4B-GGUF`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible. El modo `512 --steps 12 --texture false` se describe como previsualización más rápida, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| oxide-lab/TRELLIS.2-4B (esta ficha) | 7.786.541.462 | imagen de entrada | MIT | safetensors, GGUF | Export canónico para runtime Lux3D |
| microsoft/TRELLIS.2-4B | 4B (según nombre) | imagen de entrada | no disponible en la información | safetensors (9 shards + configs) | Modelo base upstream de Microsoft |
| Alternativas de imagen a 3D | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- El nombre "4B" no coincide con los 7.786.541.462 parámetros reales del safetensors; conviene dimensionar hardware según el dato real.
- La eliminación de fondo (RMBG-2.0/BiRefNet) no está incluida en el paquete; para entradas RGB es obligatorio proporcionar un paquete `rmbg2` canónico o un directorio `rmbg-2.0` adyacente, o la ejecución falla.
- El runtime Lux3D no implementa la ruta `1024` de resolución única ni la cascada de 1536 tokens; solo `512` y `1024_cascade`.
- La cuantización GGUF solo afecta a los DiT de flujo; DINOv3, VAE y convoluciones permanecen en F16, por lo que el ahorro de VRAM es parcial.
- La descarga automática está reservada al repositorio `oxide-lab/TRELLIS.2-4B`; si no está accesible, hay que pasar `--model-path` explícito.
- Riesgo de alucinación geométrica y texturas inconsistentes en entradas ambiguas, oclusiones o fondos complejos (comportamiento típico de modelos generativos 3D; no cuantificado en la información disponible).
- Sesgos de los datos de entrenamiento de Microsoft no documentados en la información proporcionada.
- Licencia MIT permite uso comercial, pero deben revisarse los avisos de terceros incluidos en el archivo `LICENSE` (DINOv3 y otros componentes).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario aún inexistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oxide-lab/TRELLIS.2-4B
- Variantes GGUF: https://huggingface.co/oxide-lab/TRELLIS.2-4B-GGUF
- Modelo base upstream: https://huggingface.co/microsoft/TRELLIS.2-4B
- Código upstream: https://github.com/microsoft/TRELLIS.2 (URL truncada en la información proporcionada)
