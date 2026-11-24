# cgb/Qwen-Image-2.1-Turbo-ONNX

## Resumen

Qwen-Image-2.1-Turbo-ONNX es un paquete experimental de exportación a ONNX del modelo de generación de imágenes texto-a-imagen Qwen-Image-2.1, publicado por el usuario cgb. Sobre el denoiser base se ha fusionado el LoRA Turbo de cuatro pasos de Viggle (rank 64) y el resultado se ha cuantizado a Q4 MatMulNBits con tamaño de bloque 128; los codificadores de texto y visión conservan exportaciones mixtas Q8/fp16 y el VAE mantiene su precisión original. El objetivo declarado es ejecutar inferencia íntegramente en el navegador del visitante mediante WebGPU, sin inferencia alojada ni subida de datos.

El modelo base es Qwen-Image-2.1 de Qwen (revisión 790c92633540aa0cb11d9abf19eb46d861714758) y el adaptador Turbo es de Viggle (revisión bafc91e4cc934f5fb1406b22496a0bed9b99c548). El repositorio ocupa 17,2 GB, con los pesos externos divididos en fragmentos pequeños que se descargan bajo demanda y se cachean localmente. No se especifican en la información disponible el número de parámetros, la longitud de contexto textual ni la lista de idiomas soportados.

La relevancia de esta ficha es acotada: se trata de un derivado modificado con licencia de investigación (qwen-research), sin licencia comercial concedida por el repositorio, y cuyo uso requiere un pipeline de navegador específico para este paquete que, según el autor, todavía no es público. Las pruebas de usuario se han limitado a generación a 256 px en cuatro pasos; resoluciones mayores y edición por referencia siguen siendo experimentales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen; denoiser con LoRA Turbo fusionado, codificadores de texto y visión, VAE) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4 MatMulNBits (block size 128) en el denoiser; Q8/fp16 mixto en codificadores de texto y visión; VAE sin cuantizar; Q2 excluido por ruido en pruebas |
| Idiomas soportados | no disponible |
| Licencia | other (qwen-research); sin licencia comercial concedida por el repositorio |
| Formato de pesos | ONNX con datos externos fragmentados en shards; ejecución con onnxruntime y WebGPU |
| Pipeline | text-to-image |
| Modelo base | Qwen/Qwen-Image-2.1; adaptador Viggle/Qwen-Image-2.1-viggle-turbo |
| Pasos de inferencia entrenados | 4 (2 pasos es solo comparación de velocidad no cualificada) |
| Resolución validada | 256 px (pruebas de usuario); resoluciones mayores experimentales |
| Tamaño del repositorio | 17,2 GB |
| Librería | onnxruntime |

## Arquitectura y entrenamiento

La información disponible describe un pipeline de difusión texto-a-imagen heredado de Qwen-Image-2.1, con un denoiser al que se ha fusionado el LoRA Turbo de cuatro pasos de Viggle (rank 64). No se detalla en la model card el tipo de backbone del denoiser (transformer de difusión, DiT u otra variante), el número de parámetros ni la composición del dataset de entrenamiento original. Tampoco se documentan fases de RLHF o DPO, algo esperable en un modelo de imagen y no aplicable en los términos habituales de los modelos de lenguaje.

Las modificaciones técnicas documentadas por el autor son de exportación y compresión, no de entrenamiento: exportación a ONNX, división de los datos externos en fragmentos pequeños, conversión de precisión mixta de los codificadores (Q8/fp16), fusión del LoRA en el denoiser y cuantización a cuatro bits del denoiser con MatMulNBits de bloque 128. El VAE se mantiene en su precisión original. El autor advierte que las comprobaciones automáticas de tensores y de ciclo de vida no garantizan la calidad de imagen, y que la configuración de cuatro pasos es la entrenada, mientras que dos pasos es únicamente una comparación de velocidad no cualificada.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con un pipeline de difusión.
- Generación en cuatro pasos de inferencia gracias al LoRA Turbo fusionado.
- Ejecución local en el navegador mediante WebGPU, con soporte de shader-f16 y Float16Array; no hay inferencia alojada ni subida de datos.
- Descarga y caché local de los activos (hasta 17,2 GB) bajo demanda, usando solo un subconjunto de activos de referencia durante la generación.
- Edición por imagen de referencia: mencionada como experimental, no validada.
- Resoluciones superiores a 256 px: mencionadas como experimentales, no validadas.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión descriptiva, audio o modo thinking: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Generación de imágenes privada en el navegador: el paquete permite crear imágenes sin enviar prompts ni datos a un servidor, ya que toda la inferencia se ejecuta en el hardware del visitante mediante WebGPU; adecuado para entornos con requisitos de privacidad estrictos.
- Prototipado de interfaces creativas: un equipo puede integrar el paquete en una aplicación web de demostración para evaluar la latencia y la calidad de un modelo de difusión cuantizado a cuatro bits en GPUs de escritorio, antes de decidir si invierte en despliegue servidor.
- Evaluación comparativa de cuantización: el paquete sirve para medir el impacto de Q4 MatMulNBits con bloque 128 frente a los codificadores Q8/fp16 en la calidad final de imagen, dentro de un entorno controlado y reproducible.
- Investigación sobre fusión de LoRA: permite estudiar cómo se comporta un LoRA Turbo de rank 64 fusionado en el denoiser y cuantizado después, un caso útil para quienes investigan pipelines de destilación de pasos en modelos de difusión.
- Demostraciones educativas de inferencia en el cliente: útil para mostrar en talleres o cursos cómo se ejecuta un modelo de imagen de gran tamaño en el navegador con descarga fragmentada de pesos y caché local.
- Pruebas de compatibilidad WebGPU: el paquete exige un adaptador WebGPU de escritorio con shader-f16 y soporte de Float16Array, por lo que sirve como banco de pruebas para validar la madurez de estas APIs en distintos navegadores y drivers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta pruebas cualitativas de usuario a 256 px con cuatro pasos, sin métricas objetivas (FID, CLIP score u otras) ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica; el autor indica que los requisitos de GPU y memoria del sistema varían según la resolución y los ajustes de carga.
- GPU recomendadas: no se especifican modelos concretos; se exige un adaptador WebGPU de escritorio con soporte de shader-f16.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; la dependencia de WebGPU de escritorio y de shader-f16 sugiere GPUs de escritorio recientes, pero no se detallan modelos.
- Almacenamiento: hasta 17,2 GB de activos descargados y cacheados localmente, con generación usando solo un subconjunto de activos de referencia.
- Navegador: requiere soporte de Float16Array y WebGPU; no se enumeran versiones mínimas.
- Despliegue: onnxruntime con backend WebGPU en el navegador; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este pipeline).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-ONNX (este) | Difusión texto-a-imagen con LoRA Turbo de 4 pasos | Q4 denoiser, Q8/fp16 codificadores | Navegador (WebGPU) | qwen-research, sin uso comercial | Público en HF; pipeline de navegador no público |
| Qwen/Qwen-Image-2.1 (base) | Difusión texto-a-imagen | Original en precisión completa | Servidor/GPU | Según licencia upstream | Público en HF |
| Viggle/Qwen-Image-2.1-viggle-turbo | Difusión texto-a-imagen con LoRA Turbo | No disponible | Servidor/GPU | No disponible | Público en HF |
| FLUX.2 Klein (vía FreeGen) | Difusión texto-a-imagen | No disponible | Navegador (WebGPU) | No disponible | Integrado en FreeGen |
| Z-Image Turbo (vía FreeGen) | Difusión texto-a-imagen | No disponible | Navegador (WebGPU) | No disponible | Integrado en FreeGen |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: el repositorio no concede licencia comercial; el uso queda restringido a investigación y evaluación según los términos upstream incluidos en LICENSE y NOTICE.
- Dependencia de un pipeline de navegador específico para este paquete que, según el autor, todavía no es público (FreeGen), lo que limita su uso práctico inmediato.
- Solo se ha validado la generación a 256 px con cuatro pasos; resoluciones mayores y edición por referencia son experimentales y no están cualificadas.
- Q2 está excluido porque las pruebas de usuario produjeron ruido; no debe usarse como configuración de producción.
- Dos pasos no es una configuración entrenada, sino una comparación de velocidad sin cualificación de calidad.
- Las comprobaciones automáticas de tensores y ciclo de vida no garantizan la calidad de imagen; no hay métricas objetivas publicadas.
- Requiere WebGPU de escritorio con shader-f16 y soporte de Float16Array; la compatibilidad con GPUs integradas, móviles o navegadores sin estas APIs no está garantizada.
- Consumo de almacenamiento elevado: hasta 17,2 GB de activos descargados y cacheados en el cliente.
- No se documentan sesgos, tasas de alucinación visual ni idiomas soportados; al ser un derivado cuantizado, puede presentar degradación de calidad frente al modelo base en precisión completa.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia comunitaria de uso ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgb/Qwen-Image-2.1-Turbo-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Adaptador Turbo: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- FreeGen (plataforma de inferencia en navegador): https://freegen.ai
- Blog técnico de FreeGen: https://freegen.ai/blog
- Demo de generación de imágenes en FreeGen: https://freegen.ai/imagine
