# moonbox-ai/flux-3-image-klein-MLX

## Resumen

FLUX 3 Image Klein MLX es una conversión al formato MLX del modelo de difusión FLUX 3 Image Klein de Black Forest Labs, realizada por moonbox-ai para su ejecución nativa en Apple Silicon. El modelo original es un sistema de difusión texto-a-imagen con capacidad de edición de imágenes, y esta versión reempaqueta únicamente los componentes necesarios (text encoder, transformer y VAE) en carpetas por precisión, dejando el resto del pipeline en el repositorio original. El resultado son pesos en safetensors optimizados para el framework MLX de Apple, lo que permite inferencia local en Macs con chip M-series.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue local de un modelo de generación de imágenes de última generación sin depender de CUDA ni de GPUs NVIDIA; por otro, advierte de que se trata de una conversión comunitaria con muy poca validación pública (0 descargas y 0 likes en el momento de la consulta) y con una licencia restrictiva (FLUX Community License) que condiciona el uso comercial. El repositorio ocupa 41,4 GB e incluye builds en bf16 y 8 bits, con métricas de fidelidad declaradas por el autor para la versión cuantizada.

No se dispone de información sobre el número de parámetros, la longitud de contexto del text encoder ni los datos de entrenamiento del modelo base en la documentación proporcionada, por lo que esos campos se marcan como no disponibles. La ficha se centra en lo que sí está documentado: estructura de archivos, precisiones, licencia, pipeline y requisitos de hardware derivados del tamaño de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (text-to-image / image-editing) con transformer, text encoder y VAE; conversión a MLX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 y 8 bits (carpetas separadas por precisión) |
| Idiomas soportados | no disponible |
| Licencia | FLUX Community License (license: other, license_name: flux-kommunity-license) |
| Formato de pesos | safetensors + mflux_model.json (formato MLX / mflux) |

## Arquitectura y entrenamiento

El modelo base FLUX 3 Image Klein es un sistema de difusión para generación y edición de imágenes. La conversión MLX conserva tres componentes claramente separados en el repositorio: un text encoder (con tokenizer, chat template e índice de safetensors), un transformer de difusión dividido en varios shards y un VAE. En la build bf16, el text encoder ocupa aproximadamente 7,2 GB repartidos en cuatro shards, el transformer unos 11,1 GB en seis shards y el VAE unos 168 MB. La build de 8 bits replica la misma estructura con pesos cuantizados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones arquitectónicas específicas del modelo original más allá de su naturaleza de difusión. La aportación técnica de esta ficha es la conversión a MLX: el autor declara que la build de 8 bits mantiene una fidelidad media de PSNR 35,5 dB y LPIPS 0,016 (0,038 en el peor caso) frente a la build bf16, lo que indica una degradación visual baja pero no nula. La build bf16 se toma como referencia y no se ha comparado contra la implementación original en PyTorch según la propia model card.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image).
- Edición de imágenes, según la etiqueta image-editing del repositorio.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Dos niveles de precisión seleccionables (bf16 y 8 bits) para ajustar calidad y uso de memoria.
- Integración con el ecosistema mflux a través del archivo mflux_model.json.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de ilustraciones para prototipos en Mac: un desarrollador puede ejecutar el modelo localmente en un Mac con chip M-series para generar bocetos e ilustraciones sin enviar prompts a servicios en la nube, usando la build de 8 bits si la memoria unificada es limitada.
- Edición de imágenes en flujos de diseño: gracias a la etiqueta image-editing, el modelo puede emplearse para modificar imágenes existentes (retocar, cambiar estilo o composición) dentro de herramientas de diseño que corran sobre macOS.
- Automatización de assets para documentación técnica: generar diagramas conceptuales o imágenes de portada para blogs y manuales de forma reproducible y local, con la ventaja de no depender de cuotas de API.
- Investigación en difusión sobre Apple Silicon: servir como banco de pruebas para estudiar el comportamiento de modelos de difusión de gran tamaño bajo MLX, comparando las builds bf16 y 8 bits con las métricas PSNR y LPIPS declaradas.
- Pipelines offline o con requisitos de privacidad: al ejecutarse en local, los prompts y las imágenes no salen del equipo, lo que encaja en entornos con datos sensibles donde no se permite el envío a servicios externos.
- Evaluación comparativa de cuantización: el repositorio incluye métricas de fidelidad entre precisiones, lo que permite a un equipo medir el coste calidad/memoria antes de adoptar 8 bits en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de fidelidad entre la build de 8 bits y la de bf16:

| Comparación | PSNR medio | LPIPS medio | LPIPS peor caso |
|---|---|---|---|
| 8 bits vs bf16 | 35,5 dB | 0,016 | 0,038 |

No hay datos de MMLU, HumanEval, GSM8K ni de métricas de calidad de imagen estándar (FID, CLIP score) en la información proporcionada.

## Requisitos de hardware

- VRAM / memoria unificada: el repositorio completo ocupa 41,4 GB, pero la inferencia solo necesita una carpeta de precisión. La build bf16 suma aproximadamente 18,5 GB de pesos (text encoder ~7,2 GB, transformer ~11,1 GB, VAE ~0,17 GB), más el overhead de activaciones y del runtime MLX; la build de 8 bits reduce esa cifra de forma sustancial, aunque el tamaño exacto de sus archivos no está completo en la información disponible.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente. Para bf16 se recomienda un Mac con 32 GB o más de memoria unificada (M1/M2/M3 Pro, Max o Ultra); para 8 bits, un Mac con 16-24 GB podría ser suficiente, aunque no hay cifras oficiales.
- ¿Cabe en consumer GPU? No aplica a GPUs NVIDIA/AMD: la conversión es específica de MLX y Apple Silicon. En Macs consumer (M1/M2/M3 base con 16 GB) solo es viable la build de 8 bits, con margen ajustado.
- Opciones de despliegue: MLX y el ecosistema mflux (archivo mflux_model.json). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Precisión / formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX 3 Image Klein MLX (esta ficha) | Difusión text-to-image / edición, conversión MLX | bf16 y 8 bits, safetensors MLX | FLUX Community License | Hugging Face, 0 descargas |
| FLUX 3 Image Klein (original, Black Forest Labs) | Difusión text-to-image / edición | PyTorch (bf16 y otras) | FLUX Community License | Hugging Face (modelo base) |
| Otras conversiones MLX de modelos de difusión | Difusión, formato MLX | bf16 / 8 bits | variable | no disponible en la información proporcionada |

No se dispone de datos de parámetros, contexto ni benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: FLUX Community License condiciona el uso comercial; es imprescindible revisar LICENSE.md antes de desplegar en producción.
- Validación escasa: el repositorio tiene 0 descargas y 0 likes, y la build bf16 no se ha comparado contra la implementación original en PyTorch según la propia model card.
- Solo Apple Silicon: al estar en formato MLX, no es portable a GPUs NVIDIA ni a servidores x86 convencionales, lo que limita su uso en infraestructura de producción estándar.
- Degradación por cuantización: la build de 8 bits presenta LPIPS de hasta 0,038 en el peor caso frente a bf16; para trabajos con exigencia visual alta conviene usar bf16.
- Dependencia del repositorio original: solo se convierten text encoder, transformer y VAE; el resto del pipeline debe tomarse de black-forest-labs/flux-3-image-klein, lo que añade pasos de configuración.
- Riesgo de alucinación visual y sesgos: no hay información publicada sobre sesgos del modelo base ni sobre su tasa de fallo en prompts ambiguos.
- Idiomas y contexto: no disponibles; no se puede garantizar un rendimiento multilingüe sin datos del modelo base.
- Repositorio de gran tamaño (41,4 GB): la descarga completa consume mucho ancho de banda y disco; conviene descargar solo la carpeta de la precisión deseada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-ai/flux-3-image-klein-MLX
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Licencia: https://huggingface.co/moonbox-ai/flux-3-image-klein-MLX/blob/main/LICENSE.md
- Archivo de configuración MLX (bf16): https://huggingface.co/moonbox-ai/flux-3-image-klein-MLX/blob/main/bf16/mflux_model.json
