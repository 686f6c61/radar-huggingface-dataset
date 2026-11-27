# gatilin/unividx-multimodal-lora-adapters

## Resumen

UniVidX multimodal video LoRA adapters es un paquete de investigación publicado por el usuario `gatilin` que redistribuye, sin modificaciones, los dos checkpoints de adaptadores LoRA del proyecto UniVidX (repositorio original `houyuanchen/UniVidX`, revisión `e9023a8fc0f4a385214038a13629441eac7f3971`). No se trata de un modelo generativo autónomo, sino de un conjunto de tensores LoRA de rango 32 que se aplican sobre un backbone de difusión externo para habilitar la generación de vídeo con control multimodal de propiedades intrínsecas y de composición alfa.

El paquete contiene dos ficheros safetensors en BF16: `univid_intrinsic.safetensors`, con ramas para RGB, albedo, irradiancia y normales de superficie, y `univid_alpha.safetensors`, con ramas para composición, matte alfa, primer plano y fondo. Cada fichero incluye 1.920 tensores. La relevancia actual es acotada: se trata de un artefacto de procedencia y validación parcial, orientado a investigadores que ya trabajan con el runtime de UniVidX y quieren reproducir los adaptadores originales sin depender del repositorio upstream.

El funcionamiento completo exige dependencias que no se incluyen en este repositorio: el backbone Wan2.1-T2V-14B, el codificador de texto T5, el VAE de Wan y el código de ejecución de UniVidX. El autor advierte explícitamente de que los adaptadores no deben tratarse como un LoRA genérico, ya que el código upstream aplica enrutamiento específico por modalidad sobre las cuatro ramas nombradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 32) sobre diffusion transformer Wan2.1-T2V-14B |
| Parametros totales | 1.920 tensores BF16 por fichero; recuento de parámetros no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano del repo | 1,6 GB |
| Modelo base | houyuanchen/UniVidX (backbone Wan2.1-T2V-14B) |
| Ramas incluidas | intrinsic (RGB, albedo, irradiance, surface-normal) y alpha (composite, alpha matte, foreground, background) |
| Revision upstream | e9023a8fc0f4a385214038a13629441eac7f3971 |

## Arquitectura y entrenamiento

Los ficheros distribuidos son adaptadores LoRA de rango 32 con tensores en BF16, pensados para inyectarse en un diffusion transformer. El backbone objetivo es Wan2.1-T2V-14B, un modelo de generación texto-a-vídeo de 14.000 millones de parámetros, acompañado del codificador de texto T5 y del VAE de Wan. UniVidX añade enrutamiento específico por modalidad: cada rama (intrinsic o alpha) se activa de forma independiente según la tarea, en lugar de aplicarse como un LoRA único y genérico.

La model card no proporciona información sobre el dataset de entrenamiento, el número de tokens o pasos, la composición de datos, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones de decodificación o atención. El paquete incluye los ficheros de configuración originales bajo `configs/` únicamente con fines de procedencia, y el autor advierte de que las rutas deben adaptarse al entorno local. La revisión del código upstream queda registrada en `code_revision.txt`.

## Capacidades

- Generación de vídeo condicionada por texto a través del backbone Wan2.1-T2V-14B (capacidad heredada, no incluida en el paquete).
- Predicción de propiedades intrínsecas por fotograma: RGB, albedo, irradiancia y normales de superficie.
- Predicción de composición alfa: imagen compuesta, matte alfa, primer plano y fondo.
- Enrutamiento por modalidad: las ramas se seleccionan según la tarea, lo que permite control desacoplado de intrínsecos y alfa.
- Integración con el runtime de UniVidX y el codificador T5 para condicionamiento textual.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en generación de vídeo con control intrínseco: el adaptador `univid_intrinsic` permite experimentar con la descomposición en albedo, irradiancia y normales dentro de un pipeline UniVidX, útil para estudiar la separación de iluminación y reflectancia en vídeo sintético.
- Segmentación y matting de vídeo: la rama alpha facilita la extracción de mattes y la separación primer plano/fondo, aplicable a pipelines de posproducción que necesiten recomponer escenas sobre nuevos fondos.
- Reproducción de resultados académicos: al conservar la revisión exacta del upstream y los ficheros sin modificar, sirve para replicar experimentos publicados con UniVidX sin depender de la disponibilidad del repositorio original.
- Auditoría de procedencia de artefactos: los ficheros de validación (`validation_lora_subset.json`, `subset_provenance.json`) permiten verificar hashes y dimensiones de un subconjunto de matrices, útil en flujos de control de integridad de pesos.
- Desarrollo de herramientas de composición: la combinación de intrínsecos y alfa puede integrarse en editores que reiluminen o recompongan vídeo generado, siempre que se disponga del backbone y del runtime.
- Docencia y experimentación con LoRA multimodales: el paquete es un ejemplo compacto (1,6 GB) de adaptadores con enrutamiento por modalidad, adecuado para estudiar cómo se estructuran tensores LoRA en un diffusion transformer de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta comprobaciones sintéticas en CPU sobre un subconjunto de matrices: dimensiones, salidas finitas y concordancia entre la aplicación secuencial `B(A(x))` y el producto directo en parte de la salida. Estas pruebas no cargan Wan2.1, no validan el enrutamiento real por modalidad, no establecen paridad con GPU y no ejecutan generación de vídeo de extremo a extremo.

## Requisitos de hardware

- El paquete de adaptadores ocupa 1,6 GB, pero la inferencia real requiere cargar el backbone Wan2.1-T2V-14B, el codificador T5 y el VAE de Wan, por lo que la VRAM necesaria la determina el backbone, no los LoRA.
- VRAM estimada para el conjunto completo: no disponible en la información proporcionada; para un transformer de 14.000 millones de parámetros en BF16 se requiere hardware de clase数据中心, aunque el autor no ofrece cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; depende de cuantizaciones del backbone que no se documentan en este repositorio.
- Opciones de despliegue: el autor indica que se requiere el runtime de UniVidX y el código upstream; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a este diffusion transformer).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/unividx-multimodal-lora-adapters | LoRA sobre diffusion transformer de vídeo | 1.920 tensores BF16 por fichero; total no disponible | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| houyuanchen/UniVidX | Proyecto upstream con runtime y adaptadores | no disponible | no disponible | Apache-2.0 (según model card upstream) | Hugging Face y GitHub |
| Wan-AI/Wan2.1-T2V-14B | Diffusion transformer texto-a-vídeo | 14.000 millones | no disponible | licencia propia de Wan2.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Wan2.1-T2V-14B, T5, el VAE de Wan y el runtime de UniVidX no se puede ejecutar ninguna generación.
- El enrutamiento por modalidad es obligatorio; tratar las cuatro ramas como un LoRA genérico produce resultados incorrectos según el autor.
- La validación es parcial: solo se comprobaron rangos de bytes de las matrices A/B de la primera proyección de query, con pruebas sintéticas en CPU; no hay paridad con GPU ni generación de vídeo de extremo a extremo.
- Los ficheros se copiaron del lado del servidor y los metadatos LFS SHA-256 coinciden con el origen, pero el autor no descargó ni calculó hashes localmente sobre los ficheros completos.
- Las rutas de los ficheros de configuración incluidos deben adaptarse al entorno local.
- Riesgo de sesgos y alucinación visual: no documentado en la información disponible; al heredar el comportamiento del backbone Wan2.1, los sesgos de este no se analizan aquí.
- Idiomas soportados: no disponibles; el condicionamiento textual depende del codificador T5 y del backbone.
- Restricciones de licencia: los adaptadores son Apache-2.0, pero Wan2.1 y el resto de dependencias externas mantienen sus propias licencias y requisitos de atribución, que deben respetarse en uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin soporte de la comunidad ni issues documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/unividx-multimodal-lora-adapters
- Modelo base UniVidX: https://huggingface.co/houyuanchen/UniVidX
- Backbone Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Implementación upstream de UniVidX: https://github.com/houyuanchen111/UniVidX
