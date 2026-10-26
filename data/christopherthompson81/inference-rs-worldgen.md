# christopherthompson81/inference-rs-worldgen

## Resumen

`christopherthompson81/inference-rs-worldgen` no es un modelo entrenado desde cero, sino un paquete de checkpoints preparados para que [inference.rs](https://github.com/christopherthompson81/inference.rs) (un motor de inferencia en Rust, bifurcación de mistral.rs) convierta una panorámica equirectangular de 360 grados en un mundo 3D navegable. El pipeline replica la generación de mundos de HY-World 2.0: estimación de profundidad con MoGe-2, síntesis de vistas a lo largo de trayectorias de cámara con WorldStereo-2, reconstrucción con WorldMirror 2.0 y representación final mediante Gaussian splats. El repositorio empaqueta esos componentes en 28,9 GB (27 GiB) en lugar de los 59 GB del pipeline completo, aplicando cuantización Q8_0 a los pesos lineales del generador de vistas y al codificador de texto.

El interés técnico está en el formato: el autor redistribuye los pesos ya cuantizados exactamente a los mismos bytes Q8_0 que inference.rs produce al cargar el checkpoint bf16, de modo que el resultado numérico del modelo de difusión es idéntico al de una ejecución por defecto. Además, el codificador umT5-XXL se entrega como GGUF Q8_0, lo que reduce su huella y, según las mediciones del autor, mejora ligeramente la fidelidad frente al bf16 (coseno mínimo por token de 0,983 frente a 0,958). Los safetensors del repositorio suman 5.680.910.336 parámetros, cifra que no incluye los pesos del DiT de WorldStereo-2, almacenados en GGUF.

La relevancia es doble: por un lado, demuestra un patrón de distribución de pipelines multimodelo listos para producción en un único árbol de directorios que un servidor lee directamente (`inference serve --world-models christopherthompson81/inference-rs-worldgen`); por otro, arrastra una advertencia legal crítica, porque WorldStereo-2 se distribuye bajo la Tencent HY-WORLD 2.0 Community License, que no se aplica en la Unión Europea, el Reino Unido ni Corea del Sur. Para un lector en España, esto condiciona seriamente cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido multimodelo: DiT de difusión vídeo (WorldStereo-2, derivado de Wan2.1-I2V-14B) + ViT-L de profundidad y normales (MoGe-2) + VAE + codificador de texto umT5-XXL + codificador de imagen CLIP + reconstrucción WorldMirror 2.0 (descarga aparte) + Gaussian splatting |
| Parámetros totales | 5.680.910.336 en safetensors; los pesos del DiT WorldStereo-2 se almacenan en GGUF Q8_0 y no se contabilizan en esa cifra. Tamaño del repositorio: 28,9 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: modelo de difusión condicionado por una panorámica 360° y un prompt de texto, sin ventana de contexto autorregresiva |
| Tipos de cuantización | Q8_0 (GGUF) en los 40 bloques lineales principales de WorldStereo-2 y en el codificador umT5-XXL; resto de tensores en bf16; normas y sesgos posicionales en F32 |
| Idiomas soportados | No declarados en la model card; el codificador de texto umT5-XXL es multilingüe (linaje mT5) |
| Licencia | Mixta (`other` / `mixed`): WorldStereo-2 bajo Tencent HY-WORLD 2.0 Community License; Wan2.1 Apache-2.0; MoGe-2 MIT; VGG16 BSD-3-Clause; cabezas LPIPS BSD-2-Clause |
| Formato de pesos | safetensors (MoGe-2, VGG16/LPIPS), GGUF (WorldStereo-2 Q8_0, umT5-XXL Q8_0), JSON de configuración y tokenizer; árbol de directorios compatible con el `models root` de inference.rs |
| Librería declarada | diffusers |
| Fecha de publicación | 2026-10-26 (actualizado el mismo día) |

## Arquitectura y entrenamiento

El paquete no entrena nada: reorganiza y recuantiza pesos existentes. El componente central es `WorldStereo/worldstereo-memory-dmd/`, procedente de `hanshanxue/WorldStereo`, donde los pesos lineales de los 40 bloques principales se han cuantizado a Q8_0 y el resto de tensores se mantiene en bf16 tal cual estaba almacenado. El segundo bloque es `Wan2.1-I2V-14B-480P-Diffusers/`: conserva VAE, codificador de imagen CLIP, tokenizer y configuraciones, convierte el codificador umT5-XXL a GGUF Q8_0 con nomenclatura `t5encoder` de llama.cpp y elimina los pesos del transformer base de Wan2.1, que WorldStereo-2 sustituye. A esto se añaden `moge-2-vitl-normal/` (el `model.pt` original convertido a safetensors, con su `model_config` como `config.json`) y `lpips-vgg/`, que combina los pesos `features.*` de VGG16 de torchvision y las cabezas `lin0`–`lin4` de LPIPS v0.1 en un único safetensors.

La innovación es de empaquetado y de fidelidad numérica. La cuantización Q8_0 de WorldStereo-2 se genera desde los mismos valores bf16 y produce los mismos bytes que el motor obtendría al cuantizar en carga, por lo que no hay desviación respecto a la ejecución por defecto. El único cambio numérico es el codificador umT5: sus pesos GGUF se desquantizan en cada matmul, una decisión deliberada porque las activaciones de T5 contienen valores atípicos que hacen perder tokens completos a los kernels de activación de 8 bits. Las mediciones sobre cuatro prompts contra el checkpoint fp32 dan un coseno mínimo por token de 0,983 y un error RMS relativo medio del 5,1 % para Q8_0, frente a 0,958 y 5,5 % para bf16. WorldMirror 2.0 no se incluye en el repositorio: cada trabajo lo descarga desde `tencent/HY-World-2.0` bajo su propia licencia. No se documentan en la información disponible el volumen de tokens, la composición del dataset ni las etapas de RLHF/DPO de los modelos originales.

## Capacidades

- Generación de mundos 3D navegables a partir de una única panorámica equirectangular de 360 grados.
- Estimación de profundidad y normales de superficie con MoGe-2 ViT-L, usada como base geométrica de la escena.
- Síntesis de vistas noveles a lo largo de trayectorias de cámara definidas (WorldStereo-2, condicionado a imagen por Wan2.1-I2V).
- Reconstrucción y consolidación de la geometría mediante WorldMirror 2.0 (descargado aparte en el primer trabajo).
- Representación explícita de la escena como Gaussian splats, apta para renderizado en tiempo real.
- Condicionamiento por prompt de texto a través del codificador umT5-XXL Q8_0, con cobertura multilingüe heredada de mT5.
- Evaluación perceptual integrada mediante LPIPS sobre VGG16, incluida en el paquete.
- Integración con el servidor de inference.rs: el árbol de directorios se consume directamente como raíz de modelos.
- No dispone de tool calling, function calling, modo agente, modo thinking, visión general ni audio: el alcance es estrictamente generación de mundos.

## Casos de uso

- Recorridos virtuales de espacios existentes: a partir de una panorámica capturada con cámara 360 en un inmueble, museo o local comercial se genera un entorno navegable con splats, útil para visitas remotas sin volver a rodar con un escáner láser.
- Previsualización arquitectónica: el estudio entrega una panorámica del proyecto y obtiene un espacio explorable para revisar proporciones, oclusiones y alturas antes de construir maquetas físicas.
- Producción de VFX y plate virtual: la panorámica de plató se convierte en set 3D navegable, lo que permite elegir encuadres y movimientos de cámara en posproducción en lugar de fijarlos en rodaje.
- Entornos sintéticos para simulación y robótica: los mundos generados sirven como escenarios de entrenamiento y validación de políticas de navegación, con la ventaja de que los splats admiten renderizado rápido y reproducible.
- Blockout de niveles para videojuegos: convertir un concepto panorámico en una geometría navegable permite validar escala y recorrido antes de modelar el arte final.
- Investigación en reconstrucción 3D: el paquete incluye MoGe-2, LPIPS y los pesos de WorldStereo-2 en un formato reproducible, lo que facilita comparar variantes de cuantización y de trayectoria de cámara con métricas perceptuales.
- Generación de datos sintéticos etiquetados para percepción: los splats permiten renderizar vistas con pose conocida, aprovechables para aumentar datasets de detección o segmentación.
- Demostración de despliegue de pipelines multimodelo en Rust: sirve como referencia de empaquetado de pesos heterogéneos (safetensors + GGUF) bajo un único punto de montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un modelo de difusión para generación de mundos. El único dato cuantitativo publicado es la fidelidad del codificador de texto frente al checkpoint fp32, medida sobre cuatro prompts:

| Codificador umT5-XXL | Peor coseno por token | Error RMS relativo medio |
|---|---|---|
| bf16 (ejecución por defecto) | 0,958 | 5,5 % |
| Q8_0 (este repositorio) | 0,983 | 5,1 % |

El autor afirma que la cuantización Q8_0 de WorldStereo-2 no introduce ninguna diferencia respecto a la ejecución por defecto de inference.rs, porque los bytes resultantes son idénticos. No se aportan métricas de calidad geométrica, FID, LPIPS agregado ni tiempos de generación.

## Requisitos de hardware

- Espacio en disco: 28,9 GB para el repositorio, más el espacio de la caché de Hugging Face y el de WorldMirror 2.0, que se descarga en el primer trabajo.
- VRAM estimada para el DiT: al derivar de un modelo de la clase Wan2.1-I2V-14B, los pesos en Q8_0 ocupan del orden de 14-15 GB; en bf16 superarían los 28 GB. Estimación, no confirmada en la información disponible.
- VRAM estimada del pipeline completo en Q8_0: en torno a 22-30 GB sumando DiT, umT5-XXL Q8_0 (unos 6 GB), VAE, MoGe-2 ViT-L, CLIP y las activaciones de los latentes de vídeo; con margen de seguridad, 32-40 GB. Estimación basada en los tamaños declarados.
- GPU recomendadas: A100 de 40 u 80 GB y H100 de 80 GB como opciones sin reservas; A100 40 GB o L40S 48 GB cubrirían el pipeline con holgura moderada.
- GPU de consumo: una RTX 4090 de 24 GB queda en el límite y probablemente exige descarga de módulos a CPU o ejecución por etapas; no hay confirmación de que quepa completa.
- Despliegue: el soporte oficial es inference.rs (`inference serve --world-models christopherthompson81/inference-rs-worldgen`); el motor es una bifurcación de mistral.rs y consume GGUF mediante rutas derivadas de llama.cpp. vLLM y TGI no son aplicables a este pipeline de difusión.
- Latencia y throughput: no disponibles. El coste dominante es la síntesis de vistas por trayectoria de cámara y la reconstrucción posterior, no una única pasada de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `christopherthompson81/inference-rs-worldgen` | 5,68 mil M en safetensors + DiT en GGUF Q8_0 | Panorámica 360° + prompt de texto | Mixta; WorldStereo-2 bajo Tencent HY-WORLD 2.0 (excluida en UE, Reino Unido y Corea del Sur) | Hugging Face, 0 descargas, 0 likes | Empaquetado para inference.rs, 28,9 GB |
| `tencent/HY-World-2.0` | No disponible | Panorámica 360° + prompt de texto | Tencent HY-WORLD 2.0 Community License | Hugging Face | Lanzamiento original de Tencent; incluye WorldMirror 2.0, que este paquete descarga desde allí |
| `hanshanxue/WorldStereo` | No disponible | Imagen/vídeo condicionado | MIT en su model card, con la salvedad de la licencia Tencent indicada en este paquete | Hugging Face | Origen del DiT; el paquete redistribuye sus 40 bloques principales en Q8_0 |
| `Ruicheng/moge-2-vitl-normal` | No disponible (ViT-L) | Imagen única | MIT | Hugging Face | Módulo de profundidad y normales, incluido aquí convertido a safetensors |
| WorldGen (arXiv 2511.16825) | No disponible | Texto → mundo 3D transitable | No disponible | Paper | Enfoque texto-a-mundo con blockout y navmesh; no es un checkpoint comparable directamente |

No se dispone de datos de benchmarks comunes que permitan una comparación de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Restricción territorial crítica: la Tencent HY-WORLD 2.0 Community License que cubre `WorldStereo/` no se aplica en la Unión Europea, el Reino Unido ni Corea del Sur. Cualquier uso desde España queda en una zona gris legal y debe revisarse con asesoría jurídica antes de plantearse en producción o en uso comercial.
- Las restricciones de uso de las secciones 5(a) y 5(b) y la Acceptable Use Policy de esa licencia vinculan a todo usuario de los pesos.
- El repositorio es un paquete de checkpoints, no un modelo autónomo: sin inference.rs (o una reimplementación equivalente del pipeline) los pesos no son utilizables de forma directa.
- WorldMirror 2.0 no está incluido y se descarga bajo su propia licencia; el pipeline no funciona sin esa descarga previa.
- Riesgo de alucinación geométrica: las zonas ocluidas de la panorámica se completan por síntesis, de modo que la geometría generada puede no corresponder con el espacio real. No debe usarse como medición ni como gemelo digital de precisión.
- Idiomas no declarados formalmente en la model card; el comportamiento multilingüe depende del codificador umT5-XXL y no está evaluado para castellano.
- La única validación numérica publicada del codificador Q8_0 se apoya en cuatro prompts, una muestra demasiado pequeña para extrapolar.
- Sin benchmarks de calidad de mundo generado ni de tiempos: no es posible estimar el coste por trabajo sin medirlo.
- Madurez mínima: 0 descargas y 0 likes, publicado y actualizado el mismo día (2026-10-26), mantenido por un único autor y sin afiliación con Tencent, que no respalda el repositorio.
- La licencia mixta obliga a rastrear cuatro regímenes distintos (Apache-2.0, MIT, BSD-3-Clause, BSD-2-Clause y Tencent HY-WORLD 2.0) según la carpeta que se utilice.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/christopherthompson81/inference-rs-worldgen
- Motor inference.rs (GitHub): https://github.com/christopherthompson81/inference.rs
- Publicaciones de inference.rs: https://github.com/christopherthompson81/inference.rs/releases
- Comparativas de ramas de inference.rs: https://github.com/christopherthompson81/inference.rs/compare
- Modelo base WorldStereo: https://huggingface.co/hanshanxue/WorldStereo
- Modelo base Wan2.1-I2V-14B-480P-Diffusers: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P-Diffusers
- Modelo base MoGe-2 ViT-L normal: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- HY-World 2.0 de Tencent (origen de WorldMirror 2.0): https://huggingface.co/tencent/HY-World-2.0
- Paper WorldGen: From Text to Traversable and Interactive 3D Worlds: https://arxiv.org/html/2511.16825
- Ficha de WorldGen en HyperAI: https://hyper.ai/en/wiki/47451
