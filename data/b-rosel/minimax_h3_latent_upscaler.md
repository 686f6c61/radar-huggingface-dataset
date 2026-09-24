# b-rosel/Minimax_h3_latent_Upscaler

## Resumen

Minimax H3 Latent Upscaler es un modelo neuronal de superresolución que opera directamente en el espacio latente del generador de vídeo Minimax H3. En lugar de decodificar el latente a píxeles, escalar la imagen y volver a codificarla, este modelo amplía la resolución espacial (H×W) de los latentes de 24 canales de Minimax H3 manteniendo intacta la dimensión temporal. El resultado es una aceleración del pipeline de generación en alta resolución: se genera a baja resolución (menos tokens latentes, mucho más rápido), se escala el latente in-place y se vuelve a muestrear o refinar a la resolución objetivo. Al evitar el round-trip por el VAE de Minimax H3 (de unos 5000 millones de parámetros), se ahorra una cantidad significativa de tiempo de generación y se evitan los artefactos de ghosting o doble imagen que introduce la interpolación latente ingenua (bilineal o bicúbica).

El modelo, publicado por el autor b-rosel bajo licencia Apache 2.0, es una red convolucional 3D densa de 345.280.216 parámetros, con 512 canales base, 12+12 bloques y convoluciones temporales cada 2 bloques con kernel de tamaño 5. Se distribuye en tres checkpoints con la misma arquitectura (bf16 y fp16 en SafeTensors, fp32 en PyTorch) y está pensado para usarse a través de un nodo personalizado de ComfyUI, con factores de escalado continuos entre 1,0× y 4,0×.

Su relevancia actual es eminentemente práctica: ataca el cuello de botella de cómputo de la generación de vídeo de alta resolución y ofrece una alternativa aprendida a la interpolación clásica en espacio latente, un enfoque todavía poco frecuente en el ecosistema de difusión de vídeo. Se trata de una publicación con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks numéricos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNet 3D densa con convolución temporal y interpolación trilineal (no transformer, no MoE) |
| Parametros totales | 345.280.216 (~345 M) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No aplica (no procesa texto; opera sobre tensores latentes de 24 canales) |
| Tipos de cuantizacion | bfloat16, float16 y float32 (según los checkpoints publicados) |
| Idiomas soportados | No disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (bf16, fp16) y PyTorch .pth (fp32) |

Datos adicionales de la release v1:

| Parametro | Valor |
|---|---|
| Canales de entrada/salida | 24 / 24 (espacio latente del VAE de Minimax H3) |
| Canales base | 512 |
| Bloques | 12 + 12 |
| Convolucion temporal | Cada 2 bloques, kernel de tamaño 5 |
| Factores de escalado | 1,0× – 4,0× continuo, paso de 0,1 (por defecto 2,0×) |
| Tamano de los checkpoints | ~691 MB (bf16), ~691 MB (fp16), ~1,38 GB (fp32) |
| Tamano del repositorio | 2,8 GB |
| Libreria declarada | minimax-h3 |
| Fecha de creacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un backbone convolucional 3D con 24 canales de entrada y de salida, 512 canales base y dos mitades de 12 bloques cada una. Cada 2 bloques se inserta una convolución temporal con kernel de tamaño 5, lo que permite modelar coherencia entre fotogramas sin salir del espacio latente y preservar la dimensión temporal. La ampliación espacial se completa con interpolación trilineal. El modelo declara inspirarse en el LTX 2.3 Spatial Upscaler. La especificación de arquitectura exacta vive en `minimax_h3_latent_upscaler_3d_conv_v1/config.json`; el nodo de ComfyUI infiere la arquitectura a partir del state dict al cargar y no lee ese fichero, que está pensado para herramientas de terceros.

En cuanto al entrenamiento, la model card indica aproximadamente 80.000 muestras emparejadas (latente de baja resolución + objetivo de alta resolución), repartidas en unos 70.000 pares de vídeo y unos 8.000 pares de imagen 2K, balanceadas por modalidad y factor de escala. La distribución de escalas es: 2× con un 40% del total, 1,5× con un 10%, 2,5× con un 10%, 3× con un 10%, 4× con un 10% y un 10% restante de factores decimales arbitrarios entre 1,0× y 4,0× para favorecer la generalización a escalas intermedias. No se detalla en la información disponible el número de tokens o de pasos de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en sentido estricto a un modelo de superresolución, pero no se documenta ningún ajuste por preferencias).

## Capacidades

- Superresolución en espacio latente de los latentes de 24 canales del VAE de Minimax H3, con preservación de la dimensión temporal.
- Factores de escalado continuos entre 1,0× y 4,0× con paso de 0,1, con valor por defecto de 2,0×.
- Procesamiento conjunto de vídeo (pares de fotogramas con coherencia temporal mediante convolución temporal) e imagen 2K.
- Eliminación de artefactos de ghosting y doble imagen frente a la interpolación bilineal o bicúbica de latentes.
- Integración con ComfyUI mediante dos nodos ("Minimax H3 Latent Upscaler (2D)" y "Minimax H3 Latent Upscaler (3D)") bajo el menú `video/MinimaxH3`.
- Aceleración de pipelines de generación de vídeo en alta resolución al evitar el ciclo decodificar → escalar en píxeles → recodificar a través del VAE de Minimax H3.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión semántica, tool calling, function calling, capacidades de agente ni soporte multilingüe: no es un modelo de lenguaje ni un modelo multimodal general.

## Casos de uso

- Aceleración de la generación de vídeo en alta resolución con Minimax H3: se genera primero a baja resolución (muchos menos tokens latentes y, por tanto, un muestreo mucho más rápido), se aplica este upscaler sobre el latente y se refina después a la resolución objetivo. El ahorro proviene de saltarse el round-trip por el VAE de unos 5000 millones de parámetros.
- Post-producción de clips ya generados: escalar latentes entre 1,5× y 2× sin volver a codificar en píxeles, manteniendo la coherencia temporal gracias a las convoluciones temporales con kernel 5.
- Generación de imágenes 2K: el modelo se entrenó con unos 8.000 pares de imagen 2K, por lo que puede emplearse como paso de escalado dentro de flujos de imagen en ComfyUI mediante el nodo 2D.
- Prototipado rápido de escenas: iterar la composición y el movimiento a resolución reducida y aplicar el upscaler solo cuando la escena está validada, reduciendo el coste por iteración.
- Procesado por lotes en pipelines de estudio: al ser un modelo de ~345 M de parámetros con checkpoints de ~691 MB, puede encadenarse en flujos automatizados de ComfyUI para escalar lotes de latentes sin intervención manual.
- Flujos de trabajo en equipos con GPU de gama de consumo: los pesos en bf16 o fp16 ocupan menos de 1 GB, lo que permite incorporar el escalado latente a estaciones de trabajo modestas, siempre que la generación base de Minimax H3 se ejecute aparte.
- Sustitución de la interpolación bilineal o bicúbica en herramientas existentes: allí donde un pipeline escala latentes con interpolación clásica y produce ghosting, este modelo ofrece una alternativa aprendida con el mismo interfaz de latente 24 canales.
- Investigación sobre escalado en espacio latente: sirve como referencia reproducible (arquitectura y especificación pública en `config.json`) para estudiar superresolución latente temporalmente coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye comparativas cualitativas en vídeo e imagen (un archivo MP4 y una imagen JPG en la carpeta `examples/`), sin métricas numéricas como PSNR, SSIM, LPIPS, FVD ni comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- VRAM estimada para los pesos: ~0,69 GB en bf16 o fp16; ~1,38 GB en fp32. La memoria adicional por activaciones depende de la resolución latente, del número de fotogramas y de los 512 canales base, y no está documentada en la información disponible.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, el modelo es apto para GPUs de consumo; los checkpoints bf16 están indicados por el autor como los más rápidos en GPU Ampere y Ada, y el fp16 como el mejor equilibrio entre velocidad y memoria.
- ¿Cabe en GPU de consumo? Sí, en términos de pesos cabe en cualquier GPU con varios GB de VRAM. El factor limitante será la activación, que crece con la resolución latente y el número de fotogramas; no se publican cifras al respecto.
- Opciones de despliegue: ComfyUI mediante el nodo personalizado `LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler`, con los checkpoints colocados en `ComfyUI/models/latent_upscale_models/`. También puede cargarse directamente en PyTorch. No aplica soporte en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por fotograma ni de aceleración cuantificada frente al pipeline con round-trip por el VAE.

## Comparativa con modelos similares

| Modelo | Parametros | Espacio de trabajo | Factores de escala | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax H3 Latent Upscaler (este modelo) | ~345 M | Latente de 24 canales de Minimax H3 | 1,0×–4,0× continuo | Apache 2.0 | SafeTensors (bf16, fp16) y .pth (fp32) en HuggingFace |
| LTX 2.3 Spatial Upscaler | No disponible | Latente de LTX 2.3 | No disponible | No disponible | Referenciado en la model card como inspiración arquitectónica |
| Interpolación bilineal o bicúbica de latentes | 0 (no aprendida) | Cualquier latente | Cualquiera | No aplica | Implementada en cualquier framework |

No se dispone de datos comparativos de rendimiento, parametros, contexto ni licencia para alternativas equivalentes de escalado latente para Minimax H3. La única referencia explícita de la model card es el LTX 2.3 Spatial Upscaler, del que no se aportan cifras.

## Limitaciones y advertencias

- Modelo de propósito específico: solo funciona con latentes de 24 canales del VAE de Minimax H3. No es un upscaler de píxeles de uso general ni admite latentes de otros modelos sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código, no soporta tool calling ni agentes. Cualquier ficha que lo presente como tal sería incorrecta.
- Ausencia total de benchmarks cuantitativos: no hay PSNR, SSIM, LPIPS ni FVD publicados. La calidad debe validarse empíricamente antes de integrarlo en producción.
- Riesgo de artefactos: aunque el modelo se diseña para evitar el ghosting de la interpolación clásica, no se documentan estudios de casos límite (movimiento rápido, oclusiones, texturas de alta frecuencia, vídeos muy largos).
- Sesgos: no se documenta ningún análisis de sesgos. Al operar sobre latentes generados por otro modelo, heredará en la práctica los sesgos del generador Minimax H3 subyacente.
- Cobertura de escalas desigual: el 40% del entrenamiento se concentra en 2×, por lo que el comportamiento en escalas poco representadas (por ejemplo 3,7× o 4×) puede ser menos fiable.
- Idiomas: no aplica, pero conviene señalar que no hay soporte ni evaluación multilingüe porque el modelo no procesa texto.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar el aviso de licencia y de atribución. No se documentan restricciones adicionales por parte del autor.
- Trazabilidad: la ficha de HuggingFace consultada figura bajo el autor `b-rosel`, mientras que la model card y sus enlaces apuntan a la organización `LBH-123-AI`. Conviene verificar el origen y la cadena de custodia del checkpoint antes de desplegarlo.
- Madurez: 0 descargas y 0 likes en la fecha de la consulta, publicación creada y actualizada el mismo día (2026-09-23) y sin historial de versiones más allá de la v1. Riesgo de ser un artefacto reciente y poco validado por la comunidad.
- Dependencia de tooling: el uso previsto requiere el nodo personalizado de ComfyUI, que infiere la arquitectura desde el state dict; los `config.json` no se leen en tiempo de carga, lo que puede dificultar auditorías automáticas.
- Coste indirecto: el ahorro real depende de que el paso de refinado posterior exista en el pipeline; sin él, la ganancia no se materializa en calidad final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/b-rosel/Minimax_h3_latent_Upscaler
- Organización referenciada en la model card: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Checkpoints v1: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/tree/main/minimax_h3_latent_upscaler_3d_conv_v1
- Especificación de arquitectura: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/minimax_h3_latent_upscaler_3d_conv_v1/config.json
- Nodo personalizado de ComfyUI: https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler
- Ejemplo en vídeo: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_001.mp4
- Ejemplo en imagen: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_002.jpg
- README en inglés: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/README.md
- README en chino: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/README_zh.md

No se han encontrado papers, blogs técnicos ni demos adicionales en la búsqueda web realizada.
