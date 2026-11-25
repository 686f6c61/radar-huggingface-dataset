# jaygensi/dreamshaper-xl-v2-turbo-npu

## Resumen

DreamShaper XL v2 Turbo para NPU es una conversión del modelo de difusión texto-a-imagen DreamShaper XL v2 Turbo (de Lykon, a su vez un fine-tune de Stable Diffusion XL base 1.0) a binarios de contexto QNN para la NPU Hexagon de los chips Snapdragon recientes. Lo publica el usuario jaygensi y está pensado para la opción de imagen "NPU XL" de la aplicación Android LATAS, que carga los seis binarios con su propio motor (`npu_engine.cpp`, `sd_version = 3`). Cualquier programa capaz de ejecutar binarios de contexto QNN y respetar el contrato de entrada/salida descrito puede usarlos igual.

El modelo no es un transformer de lenguaje sino un pipeline de difusión completo: dos codificadores de texto (CLIP ViT-L/14 y OpenCLIP ViT-bigG/14), un UNet de 2,6 mil millones de parámetros troceado en tres grafos y un decodificador VAE, todos cuantizados en pesos de 8 bits y activaciones de 16 bits (w8a16). El repo ocupa 29,8 GB porque incluye un zip por generación de chip, ya que un binario de contexto solo carga en la generación de NPU para la que fue compilado.

Su relevancia es práctica: lleva SDXL a la inferencia local en móvil sobre la NPU Hexagon, con un esquema de 4 a 8 pasos, CFG 2 y resolución fija de 768 x 768. Es un artefacto de despliegue, no un modelo entrenado desde cero, y su verificación se ha hecho únicamente en el simulador HTP de Qualcomm para x86, no en un teléfono real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion latente (SDXL): UNet de 2,6 B parametros en 3 grafos, dos codificadores de texto CLIP y VAE, exportados a binarios de contexto QNN |
| Parametros totales | 2,6 B en el UNet (el resto del pipeline no se cuantifica en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto de 77 tokens por codificador |
| Tipos de cuantizacion | Pesos de 8 bits (w8), activaciones de 16 bits (a16); entradas y salidas en punto fijo uint16 con escala y offset |
| Idiomas soportados | no disponible (el prompt se procesa con los codificadores CLIP del modelo base, predominantemente ingles) |
| Licencia | openrail++ |
| Formato de pesos | Binarios de contexto QNN (`.bin`) empaquetados en zips por chip; el modelo original esta en safetensors/diffusers |
| Resolucion de salida | 768 x 768 (unica soportada) |
| Pasos recomendados | 4 a 8 (la app usa 6); hasta 16 sin verificar |
| CFG | 2 (el UNet se ejecuta dos veces por paso: prompt y prompt negativo) |
| Muestreador | DPM++ 2M SDE sobre la tabla sigma de SD, con timesteps equiespaciados (no Karras) |
| Chips soportados | SM8550 (Hexagon v73), SM8650 (v75), SM8750 (v79), SM8850 (v81) |

## Arquitectura y entrenamiento

El modelo subyacente es DreamShaper XL v2 Turbo, un fine-tune de Stable Diffusion XL base 1.0. La conversión no reentrena nada: exporta los pesos de diffusers a ONNX (el UNet en tres partes con tensores NHWC en los cortes; el embedding temporal y el de texto-tiempo dentro de la primera parte; el wrapper del VAE divide por el factor de escala latente y mapea la salida a [0, 1]) y después cuantiza con las herramientas QAIRT 2.51 de Qualcomm. El grafo de OpenCLIP bigG se escribe a mano con operaciones simples sobre las capas del modelo y una máscara causal constante (-100), verificado contra el módulo de la librería con tolerancia de 3e-5.

El UNet se corta en tres grafos en fronteras de bloques para que cada uno tenga el tamaño de un UNet de SD 1.5. Los tensores que cruzan un corte tienen nombres fijos y se pasan de un grafo al siguiente por nombre; la escala y el offset de cada entrada y salida se guardan en los binarios, y las codificaciones de los tensores de corte difieren entre grafos, por lo que el runtime debe descuantizar y recuantizar. Los pesos cuantizados no dependen del chip: solo se repite la compilación HTP por generación de Hexagon, y los ficheros difieren en tamaño hasta un 9 %. En la release del 2026-11-25 se recalibraron las activaciones del UNet en timesteps equiespaciados, manteniendo los pesos de la release anterior.

## Capacidades

- Generación de imágenes texto-a-imagen a 768 x 768 con estética de DreamShaper XL v2 Turbo.
- Inferencia local en la NPU Hexagon de Snapdragon 8 Gen 2, 8 Gen 3, 8 Elite y 8 Elite Gen 5.
- Generación en 4 a 8 pasos con CFG 2, adecuada para latencia interactiva en dispositivo.
- Control de prompt negativo mediante la segunda pasada del UNet por paso.
- Integración en la app Android LATAS mediante su motor propio (`npu_engine.cpp`, `sd_version = 3`).
- Ejecución desde cualquier runtime que cargue binarios de contexto QNN y respete el contrato de ficheros, tokens y tensores.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Generación de imágenes en apps Android: la app LATAS carga los seis binarios y produce imágenes de 768 x 768 en la NPU sin conexión, lo que permite funciones de creación de imágenes sin enviar prompts a la nube.
- Prototipado de interfaces creativas en móvil: con 4 a 8 pasos y CFG 2, el ciclo prompt-imagen es lo bastante corto para iterar visualmente en el propio dispositivo.
- Privacidad de contenido: al ejecutarse en local, los prompts y las imágenes no salen del teléfono, útil para aplicaciones con requisitos de confidencialidad.
- Evaluación de despliegue en NPU: sirve como referencia para medir el rendimiento real de SDXL sobre Hexagon y comparar generaciones de chip (v73, v75, v79, v81).
- Integración en pipelines de apps de edición: el VAE entrega RGB en [0, 1] a 768 x 768, formato directo para posprocesado o composición en la app.
- Investigación sobre cuantización w8a16 en difusión: el repo documenta el contrato completo de tensores, escalas y offsets, lo que facilita reproducir la conversión con QAIRT.
- Base para ports a otros runtimes QNN: cualquier programa que siga el contrato de nombres, tokens y formas puede reutilizar los binarios sin la app LATAS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que los grafos del UNet para SM8550 se encadenaron en el simulador HTP de x86 en los timesteps del esquema de 4 pasos (4 llamadas retenidas), y que SM8650, SM8750 y SM8850 no se simularon en esta release. Ningún binario se ha ejecutado en un teléfono.

## Requisitos de hardware

- NPU Hexagon de Snapdragon 8 Gen 2 (SM8550, v73), 8 Gen 3 (SM8650, v75), 8 Elite (SM8750, v79) u 8 Elite Gen 5 (SM8850, v81); un binario de contexto solo carga en la generación para la que se compiló.
- Almacenamiento: unos 3,7 GB por zip de chip (3 719 a 3 729 MB según el chip), más el espacio de la app.
- VRAM de GPU dedicada: no aplica; el modelo está pensado para la NPU del SoC, no para CUDA.
- No cabe ni está pensado para GPU de consumo (RTX 4090, etc.) en este formato; para GPU habría que usar los pesos originales de DreamShaper XL v2 Turbo en diffusers.
- Despliegue: runtime QNN que cargue binarios de contexto y respete el contrato; la app LATAS lo hace con su motor propio. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no ejecutan binarios QNN.
- Latencia y throughput: no disponibles; no se han medido en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| DreamShaper XL v2 Turbo NPU (este) | 2,6 B (UNet) | 768 x 768 | Binarios QNN w8a16 | openrail++ | NPU Hexagon Snapdragon |
| DreamShaper XL v2 Turbo (Lykon) | 2,6 B (UNet) | hasta 1024 x 1024 | safetensors/diffusers | openrail++ | GPU (CUDA, ROCm, MPS) |
| Stable Diffusion XL base 1.0 | 2,6 B (UNet) | 1024 x 1024 | safetensors/diffusers | openrail++ | GPU |
| Stable Diffusion 1.5 | 0,86 B (UNet) | 512 x 512 | safetensors, ONNX, Core ML | CreativeML OpenRAIL-M | GPU, CPU, NPU en algunos ports |

La diferencia clave frente a los originales es el formato y el destino: los pesos de diffusers ofrecen más resolución y flexibilidad de muestreador, mientras que este paquete fija 768 x 768, 4 a 8 pasos y CFG 2 a cambio de ejecutarse en la NPU del móvil. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Ningún binario se ha ejecutado en un teléfono; la verificación se hizo en el simulador HTP de x86 de Qualcomm y solo para SM8550 en esta release.
- Un binario de contexto solo carga en la generación de NPU para la que se compiló; no hay portabilidad entre chips.
- Resolución fija de 768 x 768; no se soportan otras resoluciones.
- El muestreador debe ser DPM++ 2M SDE con timesteps equiespaciados; con Karras a pocos pasos aparecen halos neón.
- El contrato de tokens es estricto: `text_encoder` rellena con 49407 y `text_encoder_2` con 0; un desajuste altera la atención sobre las 77 posiciones.
- El runtime debe descuantizar y recuantizar los tensores que cruzan los cortes del UNet, porque las codificaciones difieren entre grafos.
- Riesgo de sesgos y alucinaciones visuales heredado de SDXL y del dataset de entrenamiento de DreamShaper; no disponible la composición exacta del dataset.
- Idiomas: no disponible; los codificadores CLIP del modelo base rinden mejor en inglés.
- Licencia openrail++: permite uso comercial con restricciones de uso aceptable; al ser una versión modificada, la licencia exige avisar de los cambios, que la model card documenta.
- Repo con 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaygensi/dreamshaper-xl-v2-turbo-npu
- Modelo base: https://huggingface.co/Lykon/dreamshaper-xl-v2-turbo
- SDXL base 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Herramientas QAIRT de Qualcomm: no disponible en la informacion proporcionada
- App LATAS: no disponible en la informacion proporcionada
