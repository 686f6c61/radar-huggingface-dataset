# mflux-community/fibo-2-0-dev-mflux-q8

## Resumen

Fibo-2.0-dev MFlux Q8 es una conversión cuantizada a 8 bits, para Apple Silicon mediante MLX, del modelo de generación de imágenes texto-a-imagen Fibo-2.0-dev desarrollado por Bria AI. El repositorio original (`briaai/Fibo-2.0-dev`) no está modificado en cuanto a licencia: esta versión la publica la comunidad MFlux-Community y solo aplica una conversión a MLX con cuantización afín de 8 bits sobre el codificador de texto, el transformador y el VAE.

El problema que resuelve es la ejecución local de un modelo generativo de imágenes de gran tamaño en Mac: mientras que los pesos en BF16 ocupan 25,1 GB, la versión Q8 reduce el repositorio a 13,4 GB, permitiendo su uso en máquinas con memoria unificada más modesta sin necesidad de GPU NVIDIA. La cuantización se almacena en los propios pesos, por lo que no hace falta pasar ninguna flag adicional al generar.

Su relevancia actual radica en que MFlux permite ejecutar modelos de difusión de última generación de forma nativa en MLX, el framework de Apple para aceleración en silicon, con instalación sencilla vía `uv tool install mflux` y generación a 1024x1024 mediante el comando `mflux-generate-fibo2`. Es una conversión comunitaria, no un lanzamiento oficial de Bria AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (arquitectura detallada no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo texto-a-imagen) |
| Tipos de cuantizacion | Q8 (afine MLX, 8 bits) sobre text encoder, transformer y VAE; existen versiones BF16, Q6, Q5, Q4 y Q3 de la comunidad |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-dev-license (heredada del modelo original briaai/Fibo-2.0-dev) |
| Formato de pesos | safetensors (cuantizados, formato MLX) |

## Arquitectura y entrenamiento

El modelo base, Fibo-2.0-dev de Bria AI, es un sistema generativo texto-a-imagen cuya estructura interna (tipo de transformador de difusion, codificador de texto y VAE) no se detalla en la model card de esta conversion. Lo que si documenta el repositorio es el proceso de conversion: MFlux 0.23.0 aplica cuantizacion afine de 8 bits de MLX de forma uniforme sobre las tres componentes del pipeline (text encoder, transformer y VAE), y el nivel de cuantizacion queda registrado en los propios pesos, de modo que la inferencia no requiere flags adicionales.

Sobre los datos de entrenamiento del modelo original, el numero de tokens o imagenes, la composicion del dataset y el uso de tecnicas de alineacion no se proporciona informacion en los datos disponibles; habria que consultar la model card de `briaai/Fibo-2.0-dev` para esos detalles. Bria AI se caracteriza habitualmente por entrenar sus modelos con datos con licencias y atribucion trazable, pero este extremo no esta confirmado en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image), con resoluciones configurables como 1024x1024 mediante los parametros `--width` y `--height`.
- Ejecucion nativa en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni CUDA.
- Control de reproducibilidad mediante semilla (`--seed`), util para iterar sobre prompts con resultados deterministas.
- Descarga automatica de pesos desde Hugging Face en el primer uso, o carga desde una copia local.
- Cuantizacion integrada en los pesos (no requiere flag `--quantize`).
- No aplica: tool calling, agentes, razonamiento multi-paso ni capacidades multilingues documentadas (es un modelo de difusion, no un LLM).

## Casos de uso

- Generacion de imagenes en equipos Mac sin GPU dedicada: gracias a la cuantizacion Q8 (13,4 GB) el modelo cabe en la memoria unificada de Macs con 16-24 GB o mas, permitiendo flujos creativos locales sin depender de la nube.
- Prototipado rapido de prompts: el comando `mflux-generate-fibo2` con semilla fija permite comparar variaciones de prompt de forma determinista, util en diseno y exploracion creativa.
- Produccion de ilustraciones para contenido editorial o marketing: generacion de imagenes 1024x1024 listas para postproduccion, con control total sobre los datos al ejecutarse localmente.
- Pruebas de calidad entre niveles de cuantizacion: la familia de repos Q3 a BF16 permite evaluar el impacto visual de la cuantizacion y elegir el equilibrio entre memoria y fidelidad para cada hardware.
- Integracion en scripts y pipelines locales: al ser una herramienta de CLI instalable con `uv`, puede encadenarse en scripts de generacion por lotes (batch) de imagenes.
- Investigacion sobre difusion en MLX: base conveniente para experimentar con modificaciones del pipeline de difusion directamente en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de difusion texto-a-imagen, las metricas tipicas de LLM (MMLU, HumanEval, GSM8K) no son aplicables; habria que acudir a la model card del modelo original para evaluar calidad de imagen (FID, CLIP score u otras metricas), datos que no constan aqui.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,4 GB solo de pesos en Q8; se recomienda un Mac con al menos 24 GB de memoria unificada para generar con holgura (la version BF16 requiere ~25,1 GB y la Q4 baja a 7,2 GB si el hardware es mas limitado).
- GPU recomendadas: no aplica GPU NVIDIA; el modelo esta diseñado para Apple Silicon (M1 y posteriores, mejores prestaciones en M2/M3/M4 con mas nucleos de GPU). En otras plataformas habria que usar el modelo original de Bria AI.
- Consumer hardware: si, esta pensado precisamente para ordenadores de consumo Apple; un MacBook Pro con 24-32 GB de memoria unificada es un objetivo realista para la version Q8.
- Despliegue: mediante MFlux (`uv tool install mflux`), con el comando `mflux-generate-fibo2`; descarga de pesos via Hugging Face CLI (`hf download`) para uso offline. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI (no son aplicables a modelos de difusion en este formato).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del chip concreto, de la resolucion y del numero de pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Tamano del repo | Formato | Plataforma objetivo | Licencia |
|---|---|---|---|---|
| fibo-2-0-dev-mflux-q8 (este) | 13,4 GB | MLX Q8 (safetensors) | Apple Silicon (MLX) | fibo-2.0-dev-license |
| fibo-2-0-dev-mflux-bf16 | 25,1 GB | MLX BF16 | Apple Silicon (MLX) | fibo-2.0-dev-license |
| fibo-2-0-dev-mflux-q4 | 7,2 GB | MLX Q4 | Apple Silicon (MLX) | fibo-2.0-dev-license |
| briaai/Fibo-2.0-dev (original) | no disponible | pesos originales | multiplataforma | fibo-2.0-dev-license |

En terminos de calidad, la version Q8 ofrece una degradacion minima respecto a BF16 a costa de reducir el requisito de memoria casi a la mitad; las versiones Q4-Q6 sacrifican mas fidelidad a cambio de caber en hardware con menos memoria unificada.

## Limitaciones y advertencias

- Conversion comunitaria: no es un lanzamiento oficial de Bria AI; cualquier problema de conversion (artefactos por cuantizacion, diferencias respecto a BF16) es responsabilidad de MFlux-Community.
- La cuantizacion Q8 puede introducir diferencias sutiles de calidad de imagen respecto a los pesos BF16 originales; para trabajo critico conviene comparar con la version BF16.
- Restricciones de licencia: la licencia fibo-2.0-dev-license del modelo original se aplica sin cambios; sus terminos concretos (uso comercial, atribucion, restricciones de contenido) deben revisarse en la model card de `briaai/Fibo-2.0-dev` antes de cualquier despliegue en produccion.
- Exclusivo para Apple Silicon via MLX: no es utilizable directamente en entornos Linux/Windows con GPU NVIDIA; para eso hay que recurrir al modelo original.
- Requiere ~13,4 GB de memoria unificada solo en pesos: Macs con 8-16 GB pueden quedarse cortos; considerar la version Q4 (7,2 GB) en ese caso.
- Datos del modelo original (parametros, dataset de entrenamiento, sesgos, medidas de seguridad) no disponibles en esta ficha: consultar la documentacion de Bria AI antes de uso en produccion.
- Riesgo de generacion de contenido sesgado o no deseado: como todo modelo texto-a-imagen, depende de los filtros y salvaguardas del modelo original, no documentados aqui.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q8
- Modelo original: https://huggingface.co/briaai/Fibo-2.0-dev
- Version BF16: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-bf16
- Version Q6: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q6
- Version Q5: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q5
- Version Q4: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q4
- Version Q3: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q3
- MFlux (repositorio GitHub): https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
