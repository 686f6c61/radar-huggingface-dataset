# latentdivergence/flux2-klein-t2i-768-npu-8gen3

## Resumen

FLUX.2 [klein] 4B text-to-image 768px - Hexagon NPU (8gen3) es una compilación precompilada del modelo de generación de imágenes FLUX.2-klein-4B de Black Forest Labs, adaptada para ejecutarse sobre la NPU Hexagon de los SoC Qualcomm Snapdragon 8 Gen 3. El autor del artefacto es latentdivergence, que publica los grafos ONNX y los binarios QNN generados con Qualcomm AI Hub (QAIRT 2.45) para su despliegue en dispositivos móviles.

El modelo resuelve un problema de despliegue: permitir la inferencia text-to-image a 768x768 píxeles en un teléfono de gama alta sin depender de la GPU ni de la nube. Para ello se parte del transformer de difusión de FLUX.2-klein-4B, se divide en tres particiones (p1, p2, p3) cuantizadas en w8a16, y se acompaña de un decodificador VAE en fp16. Las tablas de sigmas y modulación temporal para el muestreo de 4 pasos se guardan aparte en `tables_768.npz`.

Es relevante ahora porque demuestra la viabilidad de llevar modelos de difusión de escala media a la NPU de un móvil con fidelidad numérica verificada frente a las partes fp32 originales (cosenos de similitud por encima de 0,996 en las salidas verificadas). No se trata de un modelo nuevo entrenado, sino de una conversión y compilación para hardware concreto, con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FLUX.2 klein) compilado a grafos ONNX/QNN para NPU Hexagon |
| Parametros totales | 4B (modelo base FLUX.2-klein-4B); no se especifica desglose por partición |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; 64 tokens de texto + 2304 tokens latentes por paso |
| Tipos de cuantizacion | w8a16 en transformer_p1/p2/p3; fp16 en vae_decoder; IO fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de black-forest-labs/FLUX.2-klein-4B) |
| Formato de pesos | ONNX + binarios QNN (`model.bin`), tablas en NPZ |

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo nuevo: parte de FLUX.2-klein-4B de Black Forest Labs y lo convierte en grafos ejecutables sobre la NPU Hexagon del Snapdragon 8 Gen 3. El pipeline se divide en tres particiones del transformer (`transformer_p1`, `transformer_p2`, `transformer_p3`), cada una con su `model.onnx` y su `model.bin` de pesos, más un `vae_decoder` separado. La cuantización aplicada es w8a16 (pesos en 8 bits, activaciones en 16 bits) en las tres particiones del transformer y fp16 en el decodificador VAE. La entrada y salida se mantiene en fp32.

El muestreo es de 4 pasos, con las sigmas y los vectores de modulación temporal almacenados en `tables_768.npz`. El encoder de texto es Qwen3 y no se incluye en este repositorio: se comparte con la build de edición (`latentdivergence/flux2-klein-edit-text`). La verificación con Qualcomm AI Hub sobre llamadas reservadas reporta cosenos de similitud frente a las partes fp32 de entre 0,99609 y 0,99995 en las salidas de las tres particiones, con salidas finitas en todos los casos. No se documenta en la información disponible el dataset de entrenamiento original ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes text-to-image a resolución 768x768 píxeles.
- Muestreo de 4 pasos con tablas de sigmas precalculadas.
- Ejecución íntegra en la NPU Hexagon de Snapdragon 8 Gen 3 (sin GPU ni nube).
- Entrada de texto tokenizada a 64 tokens mediante el encoder Qwen3 compartido.
- Trabajo sobre 2304 tokens latentes por paso, sin tokens de referencia (a diferencia de la variante de edición).
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagen.
- No dispone de modo thinking, visión de entrada, audio ni capacidades multilingües documentadas.

## Casos de uso

- Generación de imágenes en aplicaciones móviles nativas: el modelo se ejecuta en la NPU del Snapdragon 8 Gen 3, lo que permite ofrecer text-to-image sin conexión y sin coste de inferencia en servidor.
- Prototipado de interfaces de creación visual en Android: al estar compilado con QAIRT 2.45 y organizado en carpetas (`t2i_768/`), se integra en la app Latent Studio para pruebas de concepto de generación a 768 px.
- Demostración de viabilidad de difusión en dispositivo: útil para investigadores que quieran medir latencia y consumo energético de un transformer de difusión de 4B sobre Hexagon.
- Generación de recursos gráficos ligeros en campo (sin conectividad): ilustraciones, avatares o fondos para apps que operan en entornos sin red.
- Evaluación de pipelines de cuantización w8a16: sirve como referencia reproducible para comparar fidelidad numérica frente a fp32 en hardware Qualcomm.
- Integración en flujos de edición de imagen: aunque esta build es text-to-image, comparte encoder de texto y host maths con la build de edición, lo que facilita combinarlas en una misma app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye verificaciones de fidelidad numérica de Qualcomm AI Hub frente a las partes fp32:

| Partición | Coseno salida texto (rango) | Coseno salida imagen (rango) | Salidas finitas |
|---|---|---|---|
| p1_t2i768_w8_8gen3 | 0,99852 – 0,99973 | 0,99994 – 0,99995 | Sí |
| p2_t2i768_w8_8gen3 | 0,99721 – 0,99938 | 0,99918 – 0,99947 | Sí |
| p3_t2i768_w8_8gen3 | 0,99609 – 0,99880 (salida global) | No aplica | Sí |

No se proporcionan métricas de calidad de imagen (FID, CLIP score) ni de latencia o throughput.

## Requisitos de hardware

- Hardware objetivo: NPU Hexagon del Qualcomm Snapdragon 8 Gen 3. No está pensado para GPU de escritorio ni para CPU genérica.
- Tamaño del repositorio: 4,0 GB, repartidos entre tres particiones del transformer (~1,3 GB cada una) y el decodificador VAE (~134 MB).
- VRAM estimada para inferencia: no disponible; el consumo se mide en memoria del SoC y en la NPU, no en VRAM de GPU.
- GPU recomendadas: no aplica; el artefacto está compilado para Hexagon.
- ¿Cabe en consumer GPU? No es su objetivo; los binarios QNN no son ejecutables en CUDA.
- Opciones de despliegue: Qualcomm AI Hub / QAIRT 2.45 y el runtime QNN en el dispositivo; los `model.onnx` son descriptores de grafo que apuntan a los `model.bin`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto / tokens | Licencia | Despliegue |
|---|---|---|---|---|---|
| Este artefacto (FLUX.2-klein 4B t2i 768 NPU) | 4B (base) | 768x768 | 64 texto + 2304 latentes | Apache-2.0 | NPU Hexagon 8 Gen 3 |
| black-forest-labs/FLUX.2-klein-4B | 4B | No disponible | No disponible | Apache-2.0 | GPU / CPU (formato original) |
| latentdivergence/flux2-klein-edit-npu-8gen3 | 4B (base) | 512x512 (edición) | Incluye tokens de referencia | Apache-2.0 | NPU Hexagon 8 Gen 3 |

No se dispone de datos de benchmarks que permitan comparar rendimiento de calidad de imagen entre estas variantes.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: es una compilación cuantizada del modelo base; la calidad final depende de FLUX.2-klein-4B y de la pérdida introducida por w8a16.
- Requiere hardware específico (Snapdragon 8 Gen 3 con NPU Hexagon); no es portable a otras plataformas sin recompilación.
- El encoder de texto Qwen3 no está incluido en este repositorio; hay que obtenerlo de `latentdivergence/flux2-klein-edit-text`.
- Solo genera a 768x768 y con muestreo de 4 pasos; no se documentan otras resoluciones ni schedules.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación visual.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar `LICENSE.md` heredado del modelo base por si hubiera condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- Las verificaciones de fidelidad son numéricas (coseno), no de calidad perceptual de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/latentdivergence/flux2-klein-t2i-768-npu-8gen3
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Build de edición relacionada: https://huggingface.co/latentdivergence/flux2-klein-edit-npu-8gen3
- Encoder de texto compartido: https://huggingface.co/latentdivergence/flux2-klein-edit-text
- Qualcomm AI Hub: https://aihub.qualcomm.com/
