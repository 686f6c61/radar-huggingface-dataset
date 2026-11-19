# dissembill/mirror-iris-3b-turbo-mflux-q4

## Resumen

`dissembill/mirror-iris-3b-turbo-mflux-q4` es una conversión comunitaria del modelo de generación de imágenes `speridlabs/iris-3b` (variante "turbo") al formato MFlux con cuantización affine de 4 bits. MFlux es una implementación nativa en MLX que permite ejecutar modelos generativos de imagen localmente en ordenadores Apple Silicon, sin dependencias de CUDA ni de frameworks de terceros. Este repositorio no es una release oficial de los autores originales, sino un espejo publicado por el usuario `dissembill` a partir del trabajo de conversión de MFlux-Community.

El modelo base es un text-to-image de aproximadamente 3 mil millones de parámetros (según la nomenclatura del ID), lo que lo sitúa en la gama media de los modelos de difusión actuales y lo hace viable en hardware de consumo. La conversión Q4 reduce el peso del repositorio a 5,1 GB, frente a los 14 GB de la versión BF16, cuantizando el text encoder, el transformer y el VAE con cuantización MLX affine de 4 bits. El nivel de cuantización queda almacenado en los pesos, por lo que no es necesario pasar flags adicionales al generar.

Su relevancia es doble: por un lado, demuestra el ecosistema creciente de conversiones MLX para modelos de imagen, que permite a desarrolladores con Mac aprovechar la GPU unificada sin infraestructura cloud; por otro, al heredar la licencia Apache 2.0 del modelo original, ofrece un punto de partida permisivo para experimentación e integración en producto, siempre que se respeten los términos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de difusión text-to-image, según pipeline `text-to-image`) |
| Parámetros totales | ~3B (inferido del nombre `iris-3b`; no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4 (MLX affine 4-bit) en text encoder, transformer y VAE; existen variantes BF16 y Q8 en MFlux-Community |
| Idiomas soportados | no disponible (los prompts se procesan vía text encoder; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `speridlabs/iris-3b`. Por el pipeline declarado (`text-to-image`) y por la estructura de cuantización descrita (text encoder, transformer y VAE), se trata de un modelo generativo de imagen con un codificador de texto, un backbone tipo transformer (probablemente un diffusion transformer o UNet, no confirmado) y un VAE para decodificar latentes a píxeles. El sufijo "turbo" sugiere una variante destilada o ajustada para inferencia en pocos pasos, aunque no se especifica el número de pasos ni el método de destilación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. La conversión a MFlux se realizó con la versión 0.24.0 el 2026-10-27, aplicando cuantización affine de 4 bits sobre los tres componentes del pipeline. No se documentan innovaciones técnicas adicionales más allá de la propia cuantización MLX.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) en resoluciones configurables, con ejemplo de 1024x1024 en la model card.
- Control de semilla (`--seed`) para reproducibilidad de la generación.
- Control de dimensiones de salida (`--width`, `--height`).
- Ejecución local nativa en Apple Silicon mediante MLX, sin CUDA.
- Cuantización integrada en los pesos: no requiere flags de cuantización en tiempo de inferencia.
- No se documentan capacidades de edición de imagen, inpainting, controlnet, tool calling, agentes ni multimodalidad de entrada.
- No se especifican capacidades multilingües en los prompts.

## Casos de uso

- Generación de ilustraciones para prototipos y mockups: con 5,1 GB de pesos y ejecución MLX, un desarrollador puede generar imágenes de referencia en su Mac sin depender de APIs externas, útil para iterar rápido en diseño de producto.
- Creación de assets para videojuegos indie: el modelo permite generar conceptos de personajes, entornos o iconos a 1024x1024 con semilla fija, lo que facilita reproducir variaciones consistentes durante el desarrollo.
- Automatización de contenido para blogs y redes: integrado en un script CLI (`mflux-generate-iris`), se puede encadenar con plantillas de prompts para producir imágenes de cabecera de forma batch en local.
- Experimentación académica con modelos de difusión cuantizados: sirve como banco de pruebas para estudiar el impacto de la cuantización Q4 en la calidad visual frente a BF16 y Q8, dado que MFlux-Community publica las tres variantes.
- Docencia y formación en MLX: al ser un repo pequeño y con instrucciones claras de instalación (`uv tool install mflux`), es adecuado para talleres prácticos sobre inferencia local en Apple Silicon.
- Generación de material visual para presentaciones internas: la licencia Apache 2.0 permite usar las salidas en contextos corporativos, siempre que se respete la licencia del modelo base.
- Pruebas de concepto de pipelines text-to-image en CI: la descarga reproducible vía `hf download` y la ausencia de flags de cuantización simplifican la automatización en entornos macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ejecutarse en Apple Silicon con memoria unificada, se requiere espacio en RAM/GPU compartida; el repo pesa 5,1 GB, por lo que se recomienda un mínimo de 8 GB de memoria unificada y preferiblemente 16 GB para margen durante la inferencia a 1024x1024.
- GPU recomendadas: chips Apple M1, M2, M3 o M4 (y variantes Pro/Max/Ultra) con soporte MLX. No aplica a GPUs NVIDIA o AMD en este formato.
- Cabe en hardware de consumo: sí, en Macs con Apple Silicon; no está pensado para GPUs de consumo x86 en este formato MLX.
- Opciones de despliegue: MFlux (CLI `mflux-generate-iris`), con descarga automática desde Hugging Face o copia local vía `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dissembill/mirror-iris-3b-turbo-mflux-q4` | ~3B | no disponible | safetensors MLX Q4 | Apache 2.0 | Hugging Face (espejo comunitario) |
| `mflux-community/iris-3b-turbo-mflux-bf16` | ~3B | no disponible | safetensors MLX BF16 | Apache 2.0 | Hugging Face |
| `mflux-community/iris-3b-turbo-mflux-q8` | ~3B | no disponible | safetensors MLX Q8 | Apache 2.0 | Hugging Face |
| `speridlabs/iris-3b` (base) | ~3B | no disponible | no disponible | Apache 2.0 | Hugging Face |

Las alternativas comparables directas son las otras variantes de cuantización del mismo modelo base publicadas por MFlux-Community. No se dispone de información sobre modelos de otros autores con los que comparar rendimiento, contexto o calidad.

## Limitaciones y advertencias

- Este repositorio es un espejo comunitario publicado por `dissembill`, no una release oficial de `speridlabs` ni de MFlux-Community; la procedencia de los pesos no está verificada por los autores originales.
- La cuantización Q4 puede degradar la calidad visual frente a BF16 o Q8; no se aportan métricas de fidelidad ni comparativas de calidad en la model card.
- No se documentan sesgos conocidos, pero al ser un modelo de difusión entrenado con datos no especificados, es probable que reproduzca sesgos presentes en su dataset de entrenamiento; no hay información para cuantificarlos.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir contenido incoherente, artefactos o elementos no solicitados en el prompt.
- No se especifican idiomas soportados por el text encoder; el rendimiento con prompts en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe consultar la model card del modelo base `speridlabs/iris-3b` por si impone restricciones adicionales de uso.
- Solo es ejecutable en Apple Silicon vía MLX; no es portable a CUDA sin reconversión.
- No se documentan pasos de inferencia recomendados, resolución máxima soportada ni límites de longitud de prompt.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dissembill/mirror-iris-3b-turbo-mflux-q4
- Modelo base: https://huggingface.co/speridlabs/iris-3b
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q8
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
