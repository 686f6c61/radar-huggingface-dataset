# moonbox-dev/FLUX.2-klein-4B-GGUF

## Resumen

FLUX.2 [klein] 4B es un modelo de difusión de texto a imagen desarrollado por Black Forest Labs (BFL), presentado como el miembro más compacto y rápido de la familia FLUX.2. Con 3.875.544.576 parámetros, es un transformer de flujo rectificado (rectified flow transformer) que unifica generación de imágenes a partir de texto y edición de imágenes con múltiples referencias en una única arquitectura. Su propuesta de valor es clara: calidad de estado del arte con inferencia de extremo a extremo en menos de un segundo y ejecución en GPUs de consumo con tan solo 13 GB de VRAM.

La ficha que nos ocupa, `moonbox-dev/FLUX.2-klein-4B-GGUF`, es una conversión a formato GGUF realizada por Moonbox para uso en dispositivo (on-device), pensada para integrarse en ComfyUI mediante el nodo ComfyUI-GGUF. Solo se convierten los pesos del transformer; el codificador de texto (Qwen3-4B), el VAE y el tokenizador provienen del repositorio original de BFL. Se ofrecen seis precisiones, desde F16/BF16 (7,75 GB) hasta Q4_K_M (2,29 GB), lo que permite ajustar el modelo a tarjetas de 6, 8 o más GB de VRAM.

El modelo base se distribuye bajo licencia Apache 2.0, lo que lo hace plenamente utilizable en producción comercial. Es relevante ahora porque combina tres factores poco habituales en modelos de difusión abiertos: licencia permisiva, edición multi-referencia en el mismo modelo y latencia sub-segundo, lo que lo posiciona como candidato para flujos interactivos y despliegues en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) de difusión |
| Parametros totales | 3.875.544.576 (4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; codificador de texto Qwen3-4B) |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (single-file por precisión); original en safetensors |

## Arquitectura y entrenamiento

FLUX.2 [klein] 4B es un transformer de flujo rectificado (rectified flow transformer) de 4 mil millones de parámetros. La familia [klein] se presenta como la más rápida de BFL hasta la fecha y unifica generación texto-imagen y edición imagen-imagen con múltiples referencias en una sola arquitectura compacta. El modelo base es destilado, lo que explica su latencia sub-segundo frente a otros modelos de difusión de tamaño similar. La canalización completa incluye un codificador de texto Qwen3-4B y un VAE que no forman parte de esta conversión GGUF y deben tomarse del repositorio original de BFL.

Sobre el proceso de entrenamiento no se detallan en la información disponible el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card original tampoco especifica innovaciones de decodificación más allá de la propia arquitectura de flujo rectificado y la destilación. Las conversiones GGUF fueron generadas por Moonbox a partir de la revisión `e7b7dc27f9` del modelo original: pesos BF16 convertidos a GGUF F16/BF16 y posteriormente cuantizados con `llama-quantize` de llama.cpp, con verificación tensor a tensor contra los pesos originales antes de la subida.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes (image-to-image) en el mismo modelo unificado.
- Edición con múltiples referencias (multi-reference editing), lo que permite combinar varias imágenes de entrada.
- Inferencia de extremo a extremo en menos de un segundo (modelo destilado).
- Ejecución en GPUs de consumo con aproximadamente 13 GB de VRAM en el modelo original.
- Integración con ComfyUI (mediante ComfyUI-GGUF), Diffusers (`Flux2KleinPipeline`) y la API de BFL.
- Disponibilidad de pesos abiertos para uso comercial bajo Apache 2.0.

## Casos de uso

- **Generación interactiva en local**: con la precisión Q4_K_M (2,29 GB) el transformer cabe en tarjetas de 6 GB, lo que permite generar imágenes en un portátil con GPU de gama media usando ComfyUI y el codificador Qwen3-4B y el VAE originales.
- **Prototipado rápido de producto**: la latencia sub-segundo del modelo base lo hace adecuado para interfaces donde el usuario itera sobre prompts en tiempo real, ajustando estilo o composición sin esperas perceptibles.
- **Edición de imágenes con múltiples referencias**: útil para flujos de diseño gráfico donde se combinan varias imágenes de referencia (por ejemplo, un producto y una ambientación) para producir variantes consistentes.
- **Producción con licencia permisiva**: al ser Apache 2.0, puede integrarse en servicios comerciales sin obligaciones de atribución más allá de las estándar, a diferencia de otros modelos de difusión con licencias restrictivas.
- **Despliegue en el borde (edge)**: con Q5_K_M o Q6_K (2,77-3,24 GB) el transformer se ajusta a GPUs de 8 GB, habilitando generación de imágenes en dispositivos con recursos limitados o en contenedores sin aceleradores de gran tamaño.
- **Pipelines de aumento de datos**: la generación controlada por texto permite sintetizar datasets de imágenes para entrenamiento o evaluación, con la ventaja de ejecutarse localmente y sin coste por llamada de API.
- **Investigación en cuantización**: la tabla de error RMS relativo frente a BF16 (0,55 % en Q8_0, 6,9 % en Q4_K_M) proporciona una referencia útil para estudiar el impacto de la cuantización en la calidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye tablas comparativas con MMLU, HumanEval, GSM8K ni métricas de calidad de imagen (FID, CLIP score, etc.). La única métrica cuantitativa disponible es el error RMS relativo de los pesos cuantizados frente a BF16, que se recoge en la siguiente tabla:

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| F16 | 7,75 GB | 0,000001 % (7,8e-9) |
| BF16 | 7,75 GB | exacto |
| Q8_0 | 4,17 GB | 0,55 % |
| Q6_K | 3,24 GB | 1,8 % |
| Q5_K_M | 2,77 GB | 3,5 % |
| Q4_K_M | 2,29 GB | 6,9 % |

## Requisitos de hardware

- **VRAM estimada para el transformer**: aproximadamente 13 GB en el modelo original (BF16); con GGUF, entre 2,29 GB (Q4_K_M) y 7,75 GB (F16/BF16) solo para los pesos del transformer.
- **VRAM total del pipeline**: hay que sumar el codificador de texto Qwen3-4B y el VAE, que no están incluidos en esta conversión y deben cargarse desde el repositorio original.
- **GPU recomendadas**: RTX 3090 o RTX 4070 para el modelo original en BF16 (según BFL); para las versiones GGUF, tarjetas de 6 GB (Q4_K_M), 8 GB (Q6_K, Q5_K_M) o más (Q8_0).
- **Cabe en GPU de consumo**: sí, según BFL el modelo base corre en GPUs de consumo con unos 13 GB de VRAM; las cuantizaciones GGUF reducen aún más el requisito del transformer.
- **Opciones de despliegue**: ComfyUI con ComfyUI-GGUF (Unet Loader GGUF), Diffusers (`Flux2KleinPipeline`), API de BFL y el repositorio de referencia `black-forest-labs/flux2`.
- **Latencia y throughput**: BFL declara inferencia de extremo a extremo en menos de un segundo para el modelo base; no se proporcionan cifras de throughput ni latencia para las versiones GGUF.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otras variantes de FLUX.2 o modelos de difusión de tamaño similar) que permitan una comparación rigurosa de benchmarks. A continuación se comparan únicamente los datos estructurales conocidos:

| Modelo | Parametros | Licencia | Formato | Notas |
|---|---|---|---|---|
| FLUX.2 [klein] 4B (original) | 4B | Apache 2.0 | safetensors | Modelo base de BFL, ~13 GB VRAM |
| FLUX.2 [klein] 4B GGUF (esta ficha) | 4B | Apache 2.0 | GGUF | Cuantizaciones de 2,29 a 7,75 GB |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- **Sesgos**: no se documentan en la información disponible sesgos específicos del modelo; como todo modelo de difusión entrenado con datos web a gran escala, es probable que reproduzca estereotipos presentes en esos datos.
- **Alucinación visual**: los modelos de difusión pueden generar contenido plausible pero incorrecto (texto ilegible en imágenes, anatomía inconsistente, objetos incoherentes); no se aportan métricas de fidelidad en la información disponible.
- **Cuantización**: Q4_K_M introduce un 6,9 % de error RMS relativo frente a BF16, lo que puede degradar detalles finos; para producción de alta calidad se recomienda Q8_0 o superior.
- **Dependencias externas**: esta conversión GGUF solo contiene el transformer; el codificador Qwen3-4B y el VAE deben obtenerse del repositorio original, lo que añade VRAM y complejidad al despliegue.
- **Idiomas**: no se especifican idiomas soportados; el comportamiento multilingüe del codificador de texto no está documentado en esta ficha.
- **Licencia**: Apache 2.0 permite uso comercial, pero los archivos son un derivado del modelo original y heredan su licencia; conviene revisar la model card original para cualquier restricción adicional.
- **Madurez del repositorio**: el repositorio tiene 91 descargas y 0 likes en el momento de la consulta, y la model card indica que las puntuaciones de calidad de imagen se irán añadiendo a medida que cada precisión pase la evaluación; no hay aún validación publicada de calidad por precisión.

## Enlaces

- Repositorio Hugging Face (esta conversión): https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog de BFL sobre FLUX.2 [klein]: https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence
- Repositorio de referencia: https://github.com/black-forest-labs/flux2
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Diffusers: https://github.com/huggingface/diffusers
- API de BFL: https://bfl.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
