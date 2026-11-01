# adrianoropezal/sd-v1-4-oldbook-illustrations-lora

## Resumen

El modelo `adrianoropezal/sd-v1-4-oldbook-illustrations-lora` es un adaptador LoRA para generación de imágenes mediante texto (text-to-image) entrenado sobre Stable Diffusion v1-4. Lo desarrolla el usuario de HuggingFace adrianoropezal y su propósito es transferir un estilo visual concreto: la estética de grabado de ilustraciones de libros publicados entre 1800 y 1900. El adaptador se aplica sobre los pesos del modelo base sin modificarlos, por lo que no es un modelo autónomo sino un complemento que requiere cargar primero `CompVis/stable-diffusion-v1-4`.

Técnicamente se trata de un LoRA de rango 8 y alpha 8 aplicado exclusivamente a las proyecciones de atención (`to_q`, `to_k`, `to_v`, `to_out.0`) del UNet de Stable Diffusion. Con 1.594.368 parámetros entrenables sobre un total de 861.115.332 (un 0,19%), el adaptador es extremadamente ligero y se distribuye como un conjunto de pesos compatible con la librería `diffusers`. El entrenamiento se realizó sobre 830 muestras del dataset `gigant/oldbookillustrations` a resolución 512x512 durante 5 épocas.

Su relevancia es acotada pero clara para quien necesite un estilo de grabado decimonónico reproducible sin reentrenar un modelo completo: el adaptador permite controlar la intensidad del efecto mediante el parámetro `scale` en `cross_attention_kwargs`, con un comportamiento documentado por el autor que pasa de cambios graduales a la imposición total del estilo a partir de escala 2,0. La limitación principal es la licencia: el dataset de entrenamiento es CC BY-NC 4.0, por lo que el adaptador se publica para uso no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion v1-4 (difusión latente, transformer convolucional) |
| Parámetros totales | 1.594.368 parámetros entrenables (adaptador); 861.115.332 en el modelo base |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrenamiento 512x512) |
| Tipos de cuantización | no disponible (pesos del adaptador en el formato nativo de `diffusers`; el modelo base admite fp16) |
| Idiomas soportados | no disponible (los prompts de entrenamiento están en inglés) |
| Licencia | CreativeML Open RAIL-M para el base; adaptador publicado para uso no comercial por licencia CC BY-NC 4.0 del dataset |
| Formato de pesos | safetensors / formato `diffusers` (adaptador LoRA cargable con `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA: se insertan matrices de bajo rango en las capas de atención del UNet del modelo base, en concreto en las proyecciones `to_q`, `to_k`, `to_v` y `to_out.0`. El rango es 8 y alpha 8, lo que da un factor de escala nominal de 1,0. Los parámetros entrenables son 1.594.368 de un total de 861.115.332, es decir, un 0,19% del modelo base, lo que explica el tamaño prácticamente nulo del repositorio (0,0 GB reportados).

El entrenamiento usó 830 muestras del dataset `gigant/oldbookillustrations`, filtradas por caption en inglés de al menos 15 caracteres y empleando las columnas `1600px` e `info_alt`. Las imágenes se redimensionaron por el lado corto y se recortaron al centro para preservar la relación de aspecto. La configuración fue de 5 épocas, batch size 3, learning rate 1e-4, resolución 512x512 y precisión fp32. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa, algo que no aplica a un modelo de difusión de este tipo.

## Capacidades

- Generación de imágenes a partir de prompts de texto en inglés, heredando las capacidades generales de Stable Diffusion v1-4.
- Transferencia de estilo de grabado e ilustración de libros antiguos (siglos XIX) sobre las composiciones generadas.
- Control de intensidad del estilo mediante `cross_attention_kwargs={"scale": ...}`: de 0 a 1,5 los cambios son graduales y se conserva la paleta del modelo base; a partir de 2,0 el estilo aprendido se impone y la imagen pasa a blanco y negro.
- Composición con definición lineal característica del grabado cuando se aplica el adaptador a escala nominal.
- Compatibilidad con el ecosistema `diffusers` y con el pipeline `StableDiffusionPipeline`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modalidades de audio o vídeo.
- No se documentan capacidades multilingües; los captions de entrenamiento están en inglés.

## Casos de uso

- Ilustración editorial retro: generar ilustraciones con estética de grabado decimonónico para portadas, artículos o publicaciones que requieran un estilo histórico coherente, usando prompts descriptivos en inglés y escala del adaptador en torno a 2,0-2,5.
- Diseño de material didáctico de historia: producir imágenes de época (barcos, escenas costumbristas, objetos) para libros de texto o presentaciones sobre el siglo XIX, aprovechando que el estilo se impone con claridad a escalas altas.
- Prototipado de arte conceptual con temática victoriana: explorar composiciones rápidas para proyectos de ilustración antes de encargar el trabajo final a un ilustrador, con el adaptador como generador de referencias estilísticas.
- Creación de assets para juegos o narrativa ambientada en el siglo XIX: generar ilustraciones de ambientación para fichas, cartas o menús de un juego de rol o una novela interactiva, dado el bajo coste computacional del adaptador.
- Experimentación académica sobre transferencia de estilo con LoRA: usar el adaptador como caso de estudio reproducible (rango 8, alpha 8, 830 muestras) para analizar cómo varía la intensidad del estilo con el factor de escala en modelos de difusión.
- Generación de ilustraciones para proyectos personales sin ánimo de lucro: dado que la licencia del adaptador restringe el uso comercial, encaja en blogs personales, fanzines gratuitos o portfolios de experimentación.
- Pruebas de pipelines de difusión: integrar el adaptador en flujos de trabajo con `diffusers` para validar la carga de pesos LoRA y el ajuste de `cross_attention_kwargs` en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa unos pocos megabytes (1,59 M de parámetros), pero requiere cargar el modelo base Stable Diffusion v1-4 completo (861 M de parámetros en el UNet, más VAE y text encoder).
- VRAM estimada para inferencia del pipeline completo: aproximadamente 4-6 GB en fp16 a resolución 512x512; en fp32 se duplica.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para lotes grandes; cualquier GPU consumer con al menos 6-8 GB de VRAM puede ejecutar el pipeline.
- Cabe en GPU consumer: sí, en tarjetas con 6 GB o más en fp16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060).
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (método documentado por el autor); también es posible convertir el adaptador a otros formatos para `ComfyUI` o `AUTOMATIC1111`, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del número de pasos de inferencia (el ejemplo del autor usa 50 pasos con guidance scale 7,5).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| adrianoropezal/sd-v1-4-oldbook-illustrations-lora | LoRA de estilo | SD v1-4 | 1,59 M entrenables | 512x512 | No comercial (CC BY-NC 4.0 del dataset) | HuggingFace, 19 descargas |
| CompVis/stable-diffusion-v1-4 | Modelo base completo | — | 861 M (UNet) | 512x512 | CreativeML Open RAIL-M | HuggingFace, ampliamente usado |
| Otros LoRA de estilo sobre SD v1-4 | LoRA de estilo | SD v1-4 | variable (típicamente 1-10 M) | 512x512 | variable según dataset | HuggingFace / Civitai |

No se dispone de información sobre benchmarks comparativos ni sobre otros adaptadores específicos de ilustración de libros antiguos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva para uso comercial: aunque el modelo base es CreativeML Open RAIL-M, el dataset de entrenamiento es CC BY-NC 4.0 y el autor publica el adaptador explícitamente para uso no comercial. Verificar antes de cualquier despliegue productivo.
- Dependencia total del modelo base: no funciona de forma autónoma; requiere cargar `CompVis/stable-diffusion-v1-4` y aplicar el adaptador.
- Sesgos heredados: al derivar de Stable Diffusion v1-4, arrastra los sesgos demográficos, culturales y de representación del modelo base y de su dataset de entrenamiento original.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible o detalles incoherentes, especialmente en composiciones complejas.
- Estilo limitado a un rango histórico y geográfico concreto (grabados de libros de 1800-1900), con posible sesgo hacia temáticas presentes en el dataset.
- Prompts en inglés: los captions de entrenamiento están en inglés, por lo que la efectividad con prompts en castellano no está documentada.
- Sin datos de evaluación: no hay benchmarks publicados que permitan estimar la fidelidad del estilo ni la calidad frente a alternativas.
- Repositorio con muy poca tracción (19 descargas, 0 likes) y creado recientemente, lo que implica ausencia de validación comunitaria.
- El comportamiento no lineal del parámetro `scale` (cambio gradual hasta 1,5 y salto a blanco y negro a partir de 2,0) requiere ajuste empírico por caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adrianoropezal/sd-v1-4-oldbook-illustrations-lora
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
