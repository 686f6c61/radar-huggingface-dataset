# matrixportalx/epiCRealism_NaturalSin_v2

## Resumen

epiCRealism_NaturalSin_v2 es una conversión del modelo de difusión latente Stable Diffusion 1.5 a formato Qualcomm QNN (runtime qnn2.28), empaquetada para ejecutarse sobre la NPU Hexagon (HTP v73) de una serie concreta de SoC Snapdragon. Lo publica el usuario matrixportalx en Hugging Face y no es un modelo entrenado desde cero, sino un artefacto de despliegue: el UNet se distribuye como context binary de QNN para la NPU, mientras que el text encoder y el VAE se ejecutan mediante MNN en CPU/GPU.

El objetivo es habilitar la generación texto-a-imagen íntegramente en local en dispositivos Android compatibles, a través de las aplicaciones Ruya / Local Dream, sin depender de servicios en la nube. El repositorio ocupa 1,0 GB y admite tres resoluciones de salida: 512x512, 512x768 y 768x512, con activaciones de 16 bits en la NPU.

Su relevancia actual reside en trasladar la inferencia de difusión a la NPU de móviles de gama alta (Snapdragon 8 Gen 2 y posteriores), lo que reduce latencia y consumo energético frente a la ejecución en CPU/GPU. No hay datos públicos de benchmarks ni de adopción: 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente sobre Stable Diffusion 1.5: U-Net + text encoder CLIP ViT-L/14 + VAE |
| Parámetros totales | Aproximadamente 1.000 M heredados de SD 1.5 (U-Net ~860 M, CLIP ViT-L/14 ~123 M, VAE ~83 M); no desglosado en la model card |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (límite del text encoder CLIP de SD 1.5); no especificado en la model card |
| Tipos de cuantización | Activaciones de 16 bits en HTP; cuantización de pesos no disponible |
| Idiomas soportados | No disponible (el text encoder CLIP de SD 1.5 está optimizado para inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | UNet en QNN context binary (NPU) + text_encoder y VAE en MNN (CPU/GPU); distribuido como archivo ZIP para importación en la app |

Otros datos del repositorio: tier `8gen2`, HTP `v73`, pipeline `text-to-image`, tamaño del repo 1,0 GB, creado el 2026-09-12 y actualizado el 2026-09-12.

## Arquitectura y entrenamiento

El modelo es una conversión de despliegue, no un entrenamiento nuevo. La base es Stable Diffusion 1.5, un modelo de difusión latente que genera imágenes aplicando de forma iterativa un U-Net sobre un espacio latente comprimido, partiendo de embeddings de texto producidos por un text encoder CLIP ViT-L/14 y decodificando el resultado final con un VAE. La particularidad de este artefacto es la partición del cómputo: el U-Net, que concentra la mayor parte de las operaciones, se compila como context binary de Qualcomm QNN y se ejecuta en la NPU Hexagon (HTP v73) con activaciones de 16 bits, mientras que el text encoder y el VAE se ejecutan con MNN sobre CPU/GPU.

La conversión se ha generado con el repositorio del propio autor, Sd-1.5-Converting-to-Qualcomm-QNN-Model, y está orientada al tier `8gen2` con runtime qnn2.28, compatible con Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el proceso de ajuste (fine-tuning, merge de pesos o RLHF/DPO) ni las innovaciones de muestreo aplicadas al modelo de partida. Tampoco se documentan los detalles de cuantización de pesos ni la técnica de calibración empleada para el paso a 16 bits.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en tres resoluciones: 512x512, 512x768 y 768x512.
- Inferencia local en el dispositivo, sin conexión a internet y sin enviar prompts a servidores externos.
- Ejecución del UNet en la NPU Hexagon con activaciones de 16 bits, con el text encoder y el VAE en CPU/GPU mediante MNN.
- Integración con las aplicaciones Android Ruya / Local Dream mediante importación de modelo personalizado.
- Compatibilidad declarada con Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3 (HTP v73, tier `8gen2`).
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades de visión, audio, vídeo ni modo de razonamiento explícito.
- El soporte multilingüe no está documentado; al heredar el text encoder CLIP de SD 1.5, el rendimiento con prompts en castellano será previsiblemente inferior al obtenido en inglés.
- No se documentan capacidades de inpainting, outpainting, img2img, ControlNet ni ajuste por prompt negativo en esta conversión.

## Casos de uso

- Generación de imágenes sin conexión en Android: la inferencia se realiza íntegramente en el dispositivo sobre la NPU, por lo que resulta adecuada para escenarios sin cobertura de red o con requisitos estrictos de privacidad, ya que los prompts nunca salen del terminal.
- Prototipado visual en movilidad: diseñadores que necesiten explorar conceptos, paletas o composiciones pueden generar bocetos a 512x512 directamente en el móvil, sin depender de un equipo de sobremesa ni de una suscripción a APIs de imagen.
- Aplicaciones de edición fotográfica que incorporen generación local: un editor Android puede ofrecer funciones de relleno o variación de escena apoyándose en el modelo sin incurrir en costes por llamada ni en latencia de red.
- Reducción de costes de inferencia en producción: para volúmenes altos de generación de baja resolución (por ejemplo, miniaturas o avatares), ejecutar el modelo en el parque de dispositivos compatibles elimina el gasto de GPU en la nube y el tráfico de datos asociado.
- Demostraciones y validación de NPU Qualcomm: el artefacto sirve como referencia funcional para equipos que evalúen el rendimiento real de SD 1.5 sobre HTP v73 antes de invertir en su propia cadena de conversión.
- Investigación en cuantización y compilación para NPU: permite medir el impacto de las activaciones de 16 bits y del particionado UNet/NPU frente a text encoder y VAE/CPU en la calidad final de la imagen.
- Generación de material gráfico en entornos con red restringida: ámbitos como operaciones de campo, aviación o instalaciones aisladas donde no se permite tráfico saliente hacia servicios de terceros.
- Ilustración de baja resolución para contenidos digitales: banners, fondos y elementos decorativos de hasta 768 px de lado que no requieran el detalle de modelos de mayor resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score), comparativas con el checkpoint original de SD 1.5 ni mediciones de latencia o consumo en dispositivo.

## Requisitos de hardware

- El artefacto está empaquetado exclusivamente para NPU Qualcomm Hexagon con HTP v73, tier `8gen2`, y runtime qnn2.28. No se ejecuta en GPU de sobremesa en este formato.
- SoC compatibles declarados: Snapdragon 8 Gen 2, 8s Gen 3, 7+ Gen 2 y 7 Gen 3.
- La VRAM de GPU de escritorio no aplica: el modelo no se distribuye como safetensors, checkpoint ni ONNX cargable por ComfyUI, AUTOMATIC1111 o Diffusers.
- No se documenta el consumo de memoria del terminal (RAM ni memoria de la NPU) necesario para cargar el modelo.
- Despliegue previsto: aplicación Android Ruya / Local Dream, mediante Settings → Import Custom Model, importando el archivo `epiCRealism_NaturalSin_v2_qnn2.28_8gen2.zip`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; son runtimes de modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput estimados: no disponibles.
- Para otros tiers de Snapdragon o para ejecución en escritorio sería necesario reconvertir el modelo con el repositorio de conversión del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resolución nativa | Licencia | Ejecución en NPU Snapdragon | Formato |
|---|---|---|---|---|---|---|
| epiCRealism_NaturalSin_v2 | ~1.000 M (heredados de SD 1.5) | 77 tokens | 512x512 | creativeml-openrail-m | Sí, HTP v73 (tier `8gen2`) | QNN context binary + MNN |
| Stable Diffusion 1.5 (base) | ~1.000 M | 77 tokens | 512x512 | creativeml-openrail-m | No de serie; requiere conversión | safetensors / ckpt / ONNX |
| SDXL 1.0 | ~3.500 M | 77 tokens por encoder | 1024x1024 | CreativeML Open RAIL++-M | No de serie; requiere conversión | safetensors |

Nota: los datos de SD 1.5 y SDXL 1.0 corresponden a información pública de sus respectivas fichas y no se han verificado contra una fuente citada en la búsqueda web de esta ficha. No se dispone de datos de rendimiento comparado entre estos modelos y epiCRealism_NaturalSin_v2.

## Limitaciones y advertencias

- No existen benchmarks publicados que permitan validar la calidad de las imágenes generadas por esta conversión frente al checkpoint original.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación alguna por parte de la comunidad.
- La fecha de creación declarada (2026-09-12) es posterior a la fecha habitual de consulta; puede tratarse de un error de metadatos del repositorio.
- La model card está redactada en turco, lo que puede dificultar el soporte a usuarios no turcohablantes.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso recogidas en su política de uso aceptable (prohibición de generar contenido dañino, engañoso, ilegal o que vulnere derechos) y obliga a redistribuir las restricciones junto con el modelo y sus derivados. Es responsabilidad del integrador verificar el cumplimiento.
- Al derivar de SD 1.5 y, previsiblemente, de datasets tipo LAION, el modelo hereda los sesgos de representación de dichos datos en cuanto a género, etnia, profesión y contexto cultural.
- Riesgo de artefactos visuales propios de SD 1.5 a 512 px: anatomía incorrecta (especialmente manos), texto ilegible, coherencia espacial deficiente y alucinación de detalles no solicitados.
- El text encoder CLIP de SD 1.5 está centrado en inglés; los prompts en castellano pueden producir resultados menos fieles que sus equivalentes en inglés.
- La resolución está limitada a 512x512, 512x768 y 768x512; forzar resoluciones superiores no está soportado por esta conversión.
- Dependencia dura del hardware: fuera de los SoC Snapdragon indicados el artefacto no es utilizable.
- No se documentan los detalles de cuantización de pesos ni el impacto de las activaciones de 16 bits en la fidelidad de la imagen, lo que dificulta estimar la degradación respecto al modelo original.
- No se documentan capacidades de prompt negativo, img2img, inpainting ni control de composición en esta conversión.
- El repositorio pesa 1,0 GB, un tamaño considerable para descarga e instalación en un dispositivo móvil.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/matrixportalx/epiCRealism_NaturalSin_v2
- Repositorio de conversión SD 1.5 a Qualcomm QNN: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- No se han encontrado otros enlaces relevantes en la búsqueda web. Los resultados devueltos corresponden a páginas de ayuda de Gmail y no guardan relación con el modelo. No se han localizado papers, blogs técnicos ni demos adicionales asociados a este artefacto.
