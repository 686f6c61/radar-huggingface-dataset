# oxide-lab/TripoSG-GGUF

## Resumen

TripoSG-GGUF es una exportación cuantizada en formato GGUF del checkpoint canónico TripoSG de Lux3D, un modelo de generación de mallas 3D a partir de una única imagen (image-to-3D). El modelo original lo desarrolla VAST-AI-Research y se distribuye bajo licencia MIT; esta versión la publica el usuario oxide-lab en Hugging Face con el objetivo de facilitar la inferencia local sin necesidad de cargar los pesos originales en safetensors.

El pipeline es un transformer de flujo rectificado (rectified-flow transformer) de 1.5B parámetros que genera una representación implícita de superficie (SDF) y extrae de ella una malla triangular en formato `.obj`. La exportación serializa 1.99B parámetros en total: 1.44B del transformer, 304M del codificador de imagen DINOv2-large y 243M del VAE de SDF. El repositorio incluye once variantes de cuantización, desde F16 hasta Q2_K, con tamaños que van de 3.70 GiB a 0.61 GiB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación 3D en hardware de consumo (el autor reporta pruebas en una RTX 3060 de 12 GiB) y en que incluye una evaluación cuantitativa de la degradación geométrica por cuantización, algo poco habitual en exports GGUF de modelos generativos 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified-flow) para image-to-3D, con codificador DINOv2-large y VAE de SDF; arquitectura declarada en GGUF como `triposg` |
| Parametros totales | 1.986.586.817 (1.44B transformer + 304M DINOv2-large + 243M SDF VAE) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; usa 1024 tokens de muestreo por defecto) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K, Q4_K, Q5_0, Q4_0, Q4_1, Q5_1, Q3_K, Q2_K |
| Idiomas soportados | No disponible (modelo multimodal imagen-a-malla, no lingüístico) |
| Licencia | MIT (pesos y código de TripoSG); el modelo de matting RMBG-1.4 es independiente y no es MIT |
| Formato de pesos | GGUF (config resuelta embebida en metadatos; no requiere safetensors ni manifest.json en tiempo de ejecución) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de TripoSG: un transformer de flujo rectificado que predice un campo de distancia con signo (SDF) a partir de una imagen codificada por DINOv2-large. La generación se realiza mediante muestreo de flujo rectificado con pocos pasos (el autor reporta pruebas con `--steps 2`), y la superficie se extrae mediante un esquema de octree con `--flash-octree-depth 5` y 1024 tokens. El VAE de SDF (243M parámetros) codifica y decodifica la geometría implícita. La salida final es una malla triangular en `.obj`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación técnica destacable de esta exportación es la serialización completa del pipeline (codificador de imagen, transformer y VAE) en un único archivo GGUF con la configuración resuelta embebida, además del uso de `QMatMul` sobre CUDA, Vulkan y WGPU para las variantes enteras, manteniendo en F16 las normas, sesgos, embeddings y convoluciones.

## Capacidades

- Generación de mallas 3D triangulares (`.obj`) a partir de una única imagen RGB o con canal alfa.
- Reconstrucción de geometría implícita mediante SDF y extracción de superficie con octree.
- Segmentación automática del objeto cuando la entrada es RGB, delegando en el modelo RMBG-1.4 (GGUF separado).
- Ejecución local en GPU de consumo mediante kernels cuantizados (`QMatMul` en CUDA, Vulkan y WGPU).
- Once niveles de cuantización con compromiso controlado entre tamaño y fidelidad geométrica.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de modo de pensamiento (thinking mode).

## Casos de uso

- Prototipado de assets 3D para videojuegos: a partir de una foto o render de referencia se genera una malla `.obj` base que el artista puede retopologizar y texturizar después; la variante Q8_0 (1.97 GiB) ofrece fidelidad casi sin pérdida y cabe en una GPU de 12 GiB.
- Catalogación y visualización de productos en e-commerce: generación automática de modelos 3D a partir de fotografías de catálogo para visores web, usando Q6_K (1.52 GiB) como compromiso entre calidad y huella de disco.
- Escaneo 3D ligero en el borde (edge): despliegue con Q4_K (1.05 GiB) en estaciones con GPU consumer para reconstruir objetos físicos capturados con cámara, validando previamente la calidad geométrica sobre el conjunto de imágenes propio.
- Impresión 3D y fabricación digital: generación de mallas cerradas para slicers a partir de bocetos o fotos, con la advertencia de que la calidad de la superficie depende del número de pasos y de la cuantización elegida.
- Investigación en reconstrucción 3D: uso del export GGUF para comparar el efecto de la cuantización sobre métricas geométricas (Chamfer, F-score, IoU de vóxeles) sin necesidad de cargar el checkpoint F32 original.
- Docencia y demostraciones: la variante Q2_K (0.61 GiB) permite ejecutar el pipeline completo en portátiles con GPU modesta para clases o talleres, aceptando la pérdida de fidelidad documentada.
- Integración en pipelines de contenido procedural: generación por lotes de mallas a partir de un banco de imágenes, con Q5_0 o Q4_1 como opciones legacy si el backend los soporta bien.

## Benchmarks y rendimiento

El autor publica métricas geométricas comparando cada cuantización con el checkpoint F32 canónico, medidas en una RTX 3060 de 12 GiB con CUDA, semilla por defecto, `--steps 2 --num-tokens 1024 --flash-octree-depth 5` y entrada `test-assets/mesh-input-rgb.png`. Las métricas son Chamfer-L1 simétrico relativo a la diagonal del bbox de referencia, F-score al 1 % de esa diagonal, IoU de vóxeles de superficie y consistencia de normales.

| Archivo | Chamfer rel. | F@1% | IoU vóxeles | Normal |
|---|---:|---:|---:|---:|
| F16 | 0.0017% | 1.000 | 0.9997 | 1.000 |
| Q8_0 | 0.060% | 0.997 | 0.9974 | 0.9998 |
| Q6_K | 0.083% | 0.996 | 0.9964 | 0.9997 |
| Q5_K | 1.39% | 0.880 | 0.7511 | 0.9992 |
| Q4_K | 0.226% | 0.992 | 0.9943 | 0.9995 |
| Q5_0 | 0.049% | 0.999 | 0.9993 | 0.9995 |
| Q4_0 | 1.38% | 0.926 | 0.8580 | 0.9994 |
| Q4_1 | 0.078% | 0.998 | 0.9981 | 0.9995 |
| Q5_1 | 0.145% | 1.000 | 0.9997 | 0.9995 |
| Q3_K | 0.735% | 0.953 | 0.9259 | 0.9996 |
| Q2_K | 2.08% | 0.885 | 0.7767 | 0.9994 |

En la entrada con canal alfa `test-assets/mesh-input.png`, Q5_0, Q5_K y Q4_K midieron 0.049 %, 0.155 % y 0.253 % de Chamfer, y Q8_0 un 0.026 %. El autor advierte que el muestreo de flujo rectificado a 2 pasos es caótico y que los valores atípicos de Q5_K y Q4_0 son específicos de la entrada; las métricas son de una sola imagen y deben revalidarse con los scripts `compare_geometry.py` y `eval_quantization.py` de Lux3D sobre un conjunto propio.

## Requisitos de hardware

- VRAM estimada: F16 se convierte a F32 denso en carga, por lo que su uso de VRAM se aproxima al del modelo canónico; las variantes enteras (Q8_0 y todas las Q4/Q5/Q6) permanecen empaquetadas y se ejecutan mediante `QMatMul`.
- GPU recomendadas: el autor valida en RTX 3060 de 12 GiB con CUDA; el soporte de kernels abarca CUDA, Vulkan y WGPU.
- Cabe en GPU consumer: sí, al menos en RTX 3060 12 GiB según las pruebas publicadas; las variantes Q4_K (1.05 GiB) y Q2_K (0.61 GiB) reducen el peso en disco, aunque el autor no publica cifras de VRAM por variante.
- Opciones de despliegue: CLI `lux3d-cli run triposg` con `--model-path` apuntando al `.gguf` o a un directorio con `model.gguf`; requiere `--rmbg-model-path` para entradas RGB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TripoSG-GGUF (esta ficha) | 1.99B (1.44B transformer) | Imagen RGB o con alfa; 1024 tokens de muestreo | Malla `.obj` | MIT | GGUF en Hugging Face |
| VAST-AI/TripoSG (original) | 1.5B transformer | Imagen | Malla `.obj` | MIT | Safetensors en Hugging Face |
| RMBG-1.4 | 44M | Imagen RGB | Máscara alfa | No MIT | GGUF separado requerido por este pipeline |

No se dispone de datos de benchmarks comparativos frente a otros modelos image-to-3D en la información proporcionada.

## Limitaciones y advertencias

- El muestreo a 2 pasos es caótico: pequeñas variaciones de pesos alteran la superficie extraída; no debe tomarse una única ejecución limpia como garantía de calidad.
- Q5_K, Q4_0, Q3_K y Q2_K no se recomiendan para producción sin validación específica sobre las entradas del usuario.
- Las métricas publicadas proceden de una sola imagen de prueba; es necesario reejecutar la evaluación sobre un conjunto de validación propio.
- El modelo no es lingüístico: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- Las entradas RGB requieren el modelo de matting RMBG-1.4, que no es MIT y no está cubierto por la licencia de este repositorio.
- La licencia MIT permite uso comercial, pero el autor recomienda revisar los términos upstream antes de explotación comercial y conservar `TripoSG-LICENSE.txt` al redistribuir.
- El modelo se distribuye sin garantía; no se documentan sesgos específicos ni tasas de alucinación geométrica más allá de las métricas de cuantización.
- No se dispone de información sobre el dataset de entrenamiento, lo que limita la evaluación de sesgos de dominio.

## Enlaces

- Hugging Face: https://huggingface.co/oxide-lab/TripoSG-GGUF
- Modelo base: https://huggingface.co/VAST-AI/TripoSG
- Repositorio upstream: https://github.com/VAST-AI-Research/TripoSG
- Licencia TripoSG: `TripoSG-LICENSE.txt` incluido en el repositorio
