# Barath/tholpavakoothu-flux3-lora

## Resumen

Tholpavakoothu-flux3-lora es un adaptador LoRA de rango 32/alpha 32 para FLUX 3 Image Klein Base, no un modelo completo. Lo publica Barath y su objetivo es trasladar a la generación de imágenes el estilo del teatro de sombras de cuero de Kerala, conocido como Tholpavakoothu: siluetas oscuras, perforaciones y contraluz cálido de tela. Se activa con el trigger `thlpvk style` y se integra en diffusers mediante `load_lora_weights` y `set_adapters`.

El adaptador se entrenó con 20 fotografías de Wikimedia Commons de representaciones de sombras de Kerala, 17 con licencia CC BY-SA 4.0 y 3 con CC BY 4.0. Resuelve un caso de adaptación de estilo con pocos datos y añade un flujo de producción reproducible que va del keyframe generado con el LoRA al vídeo mediante FLUX 3 Video. Es relevante porque documenta pesos, dataset, créditos, hashes y una comparación cualitativa con la misma semilla, aunque no incluye benchmarks ni una licencia explícita para el adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 32/alpha 32 sobre FLUX 3 Image Klein, modelo de difusión de texto a imagen |
| Parámetros totales | Aproximadamente 80,35 M en el adaptador, calculado a partir de 160.701.024 bytes en bf16; el modelo base no declara recuento en la información |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No aplica a generación de imagen; no se documenta la del modelo base |
| Tipos de cuantización | Adaptador en bf16; no se documentan otras cuantizaciones del adaptador ni del base |
| Idiomas soportados | No disponibles; el trigger y los ejemplos de prompt están en inglés |
| Licencia | No disponible para el adaptador; el uso requiere el modelo BFL y sus términos; las fotografías de entrenamiento son CC BY 4.0 y CC BY-SA 4.0 con atribución |
| Formato de pesos | safetensors, LoRA para diffusers; repo de 0,3 GB |
| Modelo base | black-forest-labs/flux-3-image-klein-base |
| Modelo de generación | black-forest-labs/flux-3-image-klein, versión destilada |
| Trigger | `thlpvk style` |
| Checkpoint | 2000 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango y alpha 32/32 entrenado en bf16 sobre FLUX 3 Image Klein Base. El entrenamiento usó batch 1, AdamW de 8 bits, learning rate 1e-4, 2000 pasos, buckets de relación de aspecto de área 1024 y sin flips. Se guardaron muestras y checkpoints cada 250 pasos, y el checkpoint 2000 se seleccionó mediante revisión visual. No se documenta RLHF, DPO ni una evaluación cuantitativa del adaptador.

El dataset son 20 fotografías acreditadas de Wikimedia Commons, recortadas y redimensionadas; algunas fueron enderezadas geométricamente. No se insertaron imágenes generadas en las fotografías de entrenamiento. La innovación principal es la adaptación de estilo con muy pocos datos y el flujo de producción demostrado: keyframes generados con el LoRA a 1360×768 y 16 pasos, y después seis clips de 15 segundos por película con FLUX 3 Video, editados a 90 segundos a 720p y 24 fps. La comparación incluida es cualitativa, con el mismo prompt y la misma semilla, no un benchmark.

## Capacidades

- Generación de imágenes de texto a imagen con el trigger `thlpvk style`, orientada a siluetas de cuero, perforaciones y contraluz ámbar.
- Control de intensidad del estilo mediante `adapter_weights`: 0,75 en la película Jatayu y en las comparaciones, y 0,65 en Titanic.
- Integración en diffusers con `pipe.load_lora_weights` y `pipe.set_adapters`.
- Generación de keyframes para vídeo; el adaptador no genera vídeo directamente, sino que el flujo documentado usa FLUX 3 Video.
- Reproducibilidad mediante dataset, manifiesto de transformaciones, créditos, hashes y manifiesto de comparación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto; no es un modelo de lenguaje.
- No se documentan capacidades multilingües ni un modo de razonamiento o thinking.
- La etiqueta `image-to-video` del repositorio refleja el flujo de producción con FLUX 3 Video, no una capacidad de vídeo del adaptador por sí mismo.

## Casos de uso

- Cortometraje de sombras de 90 segundos: usar el trigger al final del prompt, peso 0,75 y 1360×768 con 16 pasos para generar keyframes; después animar seis clips de 15 segundos con FLUX 3 Video y editar a 720p y 24 fps. El autor lo demuestra con Jatayu: The Last Flight y Titanic: Shadows on the Sea.
- Storyboard y previsualización: generar frames con la misma semilla y comparar peso 0 frente a 0,75 antes de producir; el manifiesto de comparación permite revisar el efecto sobre siluetas, perforaciones e iluminación.
- Ilustración editorial sobre Tholpavakoothu: producir imágenes de siluetas y contraluz ámbar para artículos o piezas divulgativas, revisando la atribución de las 20 fotografías y los términos del modelo BFL.
- Prototipado escenográfico: ajustar el peso entre 0,65 y 0,75 para explorar siluetas, perforaciones y tonos de lámpara en carteles, programas o pruebas de escenografía.
- Docencia y divulgación cultural: ilustrar episodios del Ramayana con estética de sombras, acompañando el material con explicación y revisión por parte de practicantes o especialistas.
- Investigación en adaptación de estilo con pocos datos: reproducir el entrenamiento con 20 imágenes, rango 32, learning rate 1e-4, 2000 pasos y buckets de área 1024, usando el manifiesto y los créditos publicados.
- Pruebas de pipeline imagen-vídeo: integrar el LoRA en diffusers y combinarlo con FLUX 3 Video para animáticas o pruebas de concepto, teniendo en cuenta que no se documentan latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única comparación incluida es cualitativa, con el mismo prompt y la misma semilla:

| Prueba | Configuración | Resultado |
|---|---|---|
| Comparación sin LoRA | FLUX 3 Image Klein destilado, 1360×768, 16 pasos, semilla 1711, peso 0 | Línea base sin el adaptador |
| Comparación con LoRA | Mismo modelo, resolución, pasos y semilla, peso 0,75 | Cambio de siluetas, perforaciones e iluminación ámbar; no es un benchmark |
| Casos emparejados | Cuatro pares cualitativos con hashes en `comparison/manifest.json` | Revisión visual, sin métricas cuantitativas |

## Requisitos de hardware

- VRAM estimada: no disponible para FLUX 3 Image Klein; el adaptador añade aproximadamente 0,16 GB, pero el requisito dominante es el modelo base.
- GPU recomendadas: no disponibles; se requiere una GPU compatible con FLUX 3 Image Klein, sin especificación en la información.
- GPU de consumo: no se puede confirmar si cabe en GPU de consumo, porque no se documenta la VRAM del base.
- Despliegue: diffusers, con la revisión fijada `b800f828f3951c4d206e154411bcbfa693cd322e`; para vídeo, FLUX 3 Video. vLLM, llama.cpp, Ollama y TGI no aplican a este adaptador de difusión.
- Latencia y throughput: no disponibles; la inferencia documentada usa 16 pasos y 1360×768, pero no se publican tiempos.
- El guider destilado ignora CFG; la inferencia documentada no usa CFG.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tholpavakoothu-flux3-lora | Aproximadamente 80,35 M de adaptador; base no disponible | No aplica | Solo comparación cualitativa | No disponible; términos BFL y CC BY para las fotos | Hugging Face; 0 descargas y 0 likes en la consulta |
| FLUX 3 Image Klein Base sin LoRA | No disponible | No disponible | Línea base; sin benchmark | Términos BFL | Upstream |
| FLUX 3 Image Klein destilado con LoRA | No disponible | No aplica | Mismo prompt y semilla; peso 0,75 | No disponible; requiere acceso al base | Requiere el modelo BFL |
| Otros LoRA de estilo de sombras | No disponible | No disponible | No disponible | No disponible | No identificados en la información |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere acceso y aceptación de los términos del modelo BFL `flux-3-image-klein-base`.
- La licencia del adaptador no está disponible y no se afirma una licencia global; las 20 fotografías de entrenamiento siguen bajo CC BY 4.0 o CC BY-SA 4.0 y exigen atribución.
- El dataset es muy pequeño y específico: 20 fotografías de cinco fotógrafos acreditados; puede sobrerrepresentar ángulos, montajes y condiciones de iluminación concretas.
- No se documenta una evaluación de sesgos; la representación de una tradición cultural con pocas imágenes puede simplificarla o reducirla a un estereotipo visual.
- El autor indica que la comparación no es un benchmark ni una afirmación de autenticidad cultural; la anatomía, las varillas y la geometría de los objetos pueden quedar imperfectas.
- Riesgo de errores visuales y alucinación de detalles en manos, varillas, perforaciones y objetos, especialmente con prompts complejos o pesos altos.
- No se documentan capacidades multilingües; el trigger y los ejemplos están en inglés.
- El flujo de vídeo depende de FLUX 3 Video; el audio de las películas es una síntesis original inspirada en Kerala, no una grabación de una compañía tradicional, y no se realizó una audición subjetiva del audio por parte del asistente.
- Para producción conviene fijar las revisiones del base, del modelo destilado y de diffusers, y validar visualmente el peso del adaptador; no hay latencia ni throughput publicados.

## Enlaces

- [Hugging Face: Barath/tholpavakoothu-flux3-lora](https://huggingface.co/Barath/tholpavakoothu-flux3-lora)
- [Modelo base: black-forest-labs/flux-3-image-klein-base](https://huggingface.co/black-forest-labs/flux-3-image-klein-base)
- [Modelo de generación: black-forest-labs/flux-3-image-klein](https://huggingface.co/black-forest-labs/flux-3-image-klein)
- [Reproducción en GitHub](https://github.com/Barath19/tholpavakoothu-flux3-film)
- [Pesos del adaptador: pytorch_lora_weights.safetensors](https://huggingface.co/Barath/tholpavakoothu-flux3-lora/blob/main/pytorch_lora_weights.safetensors)
- [Dataset de 20 imágenes y captions](https://huggingface.co/Barath/tholpavakoothu-flux3-lora/blob/main/tholpavakoothu-dataset.zip)
- [Créditos y licencias de las fotografías](https://huggingface.co/Barath/tholpavakoothu-flux3-lora/blob/main/CREDITS.txt)
- [Manifiesto de comparación](https://huggingface.co/Barath/tholpavakoothu-flux3-lora/blob/main/comparison/manifest.json)
- [Película Jatayu: The Last Flight](https://huggingface.co/Barath/tholpavakoothu-flux3-lora/resolve/main/films/jatayu/jatayu-the-last-flight.mp4)
- [Película Titanic: Shadows on the Sea](https://huggingface.co/Barath/tholpavakoothu-flux3-lora/resolve/main/films/titanic/titanic-shadows-on-the-sea.mp4)
