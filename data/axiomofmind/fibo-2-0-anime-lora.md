# axiomofmind/Fibo-2.0-anime-lora

## Resumen

Fibo 2.0 Anime LoRA es un adaptador LoRA (Low-Rank Adapter) para generación de imágenes a partir de texto, creado por el usuario axiomofmind y entrenado sobre el modelo base briaai/Fibo-2.0-dev de BRIA. Su objetivo es dotar al modelo base de un estilo de ilustración anime y seinen, manteniendo el comportamiento del modelo original cuando el adaptador no se activa. El repositorio contiene el checkpoint 400 de la run de entrenamiento `fibo-anime-v1-pilot-400`.

El adaptador se activa mediante el trigger `fibo_seinen_style`, que debe colocarse al inicio del campo `style_medium` en un prompt estructurado JSON de Fibo. La escala LoRA recomendada como punto de partida es 0.7, con 1.0 para un efecto de estilo más pronunciado. Es relevante porque Fibo 2.0 emplea prompts estructurados (JSON) en lugar de prompts de texto libre, y este LoRA demuestra que el formato de entrenamiento del modelo base admite especialización estilística sin reentrenar el modelo completo.

El peso del adaptador es de aproximadamente 1.4 GB en el repositorio (incluye varios ficheros y ejemplos), se distribuye en formato safetensors y es compatible tanto con la librería diffusers/PEFT como con ComfyUI en su layout nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion text-to-image Fibo 2.0 Dev |
| Parametros totales | no disponible (tamaño del repo: 1,4 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de difusion; prompt estructurado JSON) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bria-fibo (other); base model bajo CC BY-NC 4.0, uso comercial requiere acuerdo con BRIA |
| Formato de pesos | safetensors (Diffusers/PEFT y layout nativo de ComfyUI) |

## Arquitectura y entrenamiento

El modelo no es un modelo generativo completo, sino un adaptador LoRA: un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Fibo 2.0 Dev para modificar su distribucion de salida hacia un estilo anime/seinen concreto. Esta tecnica permite entrenar con una fraccion minima de los parametros del modelo base, reduce el riesgo de catastrophic forgetting y permite combinar varios adaptadores.

Los datos de entrenamiento concretos (numero de imagenes, composicion del dataset, numero de epocas) no estan disponibles. Se sabe que el checkpoint publicado corresponde al paso 400 de la run `fibo-anime-v1-pilot-400`, lo que sugiere un entrenamiento piloto de corta duracion. Las captions de entrenamiento incluian el trigger `fibo_seinen_style`, y el adaptador conserva cierto efecto de estilo incluso sin el trigger, aunque su uso se recomienda porque coincide con las captions de entrenamiento. La inferencia recomendada usa 50 pasos, guidance scale 5.0 y resolucion 1024x1024.

## Capacidades

- Generacion de imagenes text-to-image en estilo anime y seinen aplicada sobre Fibo 2.0 Dev.
- Compatibilidad con el formato de prompt estructurado JSON de Fibo (Thales VGL), donde el trigger se inserta en el campo `style_medium`.
- Funcionamiento parcial sin trigger: produce un desplazamiento de estilo visible aunque `fibo_seinen_style` no este en el prompt.
- Ajuste fino de intensidad mediante la escala LoRA (0.7 recomendado, 1.0 para efecto maximo).
- Compatibilidad con diffusers/PEFT (PyTorch) y con ComfyUI mediante fichero convertido.
- Resoluciones flexibles: ejemplos verificados a 1024x1024 y 768x1344.
- No genera texto, no procesa audio ni video; no es un modelo de lenguaje.

## Casos de uso

- Ilustracion editorial de estilo seinen: generar portadas o ilustraciones de articulos y novelas ligeras con estetica anime adulta, usando prompts JSON estructurados para controlar composicion, iluminacion y fondo de forma precisa.
- Prototipado de personajes para videojuegos o novelas visuales: el formato JSON permite fijar objetos, ubicacion y lighting de forma reproducible con seeds fijas, facilitando iteraciones controladas sobre un mismo personaje.
- Generacion de arte conceptual con control fino: la estructura del prompt de Fibo (short_description, objects, background_setting, lighting, aesthetics) permite describir escenas complejas (por ejemplo, un farero en tormenta o un botanista en invernadero orbital) con control explicito de cada elemento.
- Produccion de contenido para redes y comunidades de arte anime: con ComfyUI se puede integrar el adaptador en flujos de trabajo existentes sin codigo.
- Comparativas y evaluacion de estilos: el repo incluye ejemplos stock versus LoRA (con y sin trigger) utiles para estudiar cuanto desplaza el adaptador la distribucion del modelo base.
- Integracion en pipelines Python: el script `scripts/generate_fibo_lora.py` ofrece un ejemplo listo para ejecutar con diffusers, util para automatizar generacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA estilistico para difusion de imagenes, no aplica benchmarks tipicos de LLM; la evaluacion se realiza mediante comparaciones visuales incluidas en el repositorio (imagenes de ejemplo con seeds, steps y guidance identicos entre modelo stock y adaptador activado).

## Requisitos de hardware

- VRAM estimada para inferencia: la del modelo base Fibo 2.0 Dev mas la sobrecarga del adaptador (el LoRA anade poco consumo); no hay cifras oficiales publicadas para el modelo base en la informacion disponible.
- GPU recomendadas: no disponible explicitamente; para difusion a 1024x1024 con 50 pasos suele ser razonable una GPU de gama consumer-alta (RTX 3090/4090 con 24 GB) o una A100 en entornos cloud.
- Consumer GPU: probablemente viable en GPUs de 24 GB; no hay datos oficiales que lo confirmen para este modelo base.
- Despliegue: diffusers/PEFT (PyTorch) y ComfyUI (fichero `Fibo-2.0-Anime-LoRA-ComfyUI.safetensors` con layout nativo). No hay soporte documentado de llama.cpp, Ollama, vLLM o TGI (no aplican a difusion de imagenes).
- Latencia y throughput: no disponibles; los ajustes recomendados son 50 pasos de inferencia y guidance scale 5.0.

## Comparativa con modelos similares

| Aspecto | Fibo 2.0 Anime LoRA | Fibo 2.0 Dev (base) | LoRAs anime sobre SDXL/SD 1.5 |
|---|---|---|---|
| Tipo | Adaptador LoRA estilistico | Modelo text-to-image completo | Adaptadores LoRA estilisticos |
| Parametros | no disponible | no disponible | tipicamente decenas a cientos de MB |
| Formato de prompt | JSON estructurado (Thales VGL) | JSON estructurado (Thales VGL) | texto libre |
| Estilo | anime/seinen | estilo propio de BRIA | muy variado segun el LoRA |
| Licencia | bria-fibo, no comercial sin acuerdo | bria-fibo, no comercial sin acuerdo | varian (muchos son abiertos) |
| Compatibilidad | diffusers, ComfyUI | diffusers, ComfyUI | diffusers, ComfyUI, A1111 |

La diferencia clave frente a LoRAs sobre Stable Diffusion es el formato de prompt estructurado JSON de Fibo, que ofrece control mas explicito de escena, y la licencia no comercial del modelo base, mas restrictiva que la mayoria de los ecosistemas SD.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo base Fibo 2.0 Dev esta gated para uso no comercial bajo los terminos de BRIA (se identifica CC BY-NC 4.0); cualquier uso comercial requiere un acuerdo separado con BRIA. Revisar la ficha del modelo base antes de usar o redistribuir.
- Modelo base gated: probablemente requiera aceptar terminos y estar autenticado en Hugging Face para descargar el modelo base.
- Efecto de estilo sin trigger: el adaptador modifica la salida incluso sin `fibo_seinen_style`, lo que puede causar desviaciones de estilo no deseadas si se carga el LoRA sin activar el trigger explicitamente.
- Entrenamiento piloto: solo se publica el checkpoint 400 de una run piloto; la calidad puede no ser definitiva y pueden existir checkpoints posteriores no publicados.
- Riesgo de artefactos tipicos de modelos de difusion: manos, anatomia y texto en imagenes pueden contener errores; conviene inspeccionar los resultados.
- Sesgos: no documentados; al tratarse de estilo anime/seinen, puede heredar sesgos esteticos y de representacion del dataset de entrenamiento (no publico).
- Datos de entrenamiento no publicados: no se conoce la procedencia de las imagenes de entrenamiento, relevante para consideraciones de licencia de contenido.

## Enlaces

- Repositorio del LoRA: https://huggingface.co/axiomofmind/Fibo-2.0-anime-lora
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-dev
- Licencia referenciada (CC BY-NC 4.0): https://creativecommons.org/licenses/by-nc/4.0/deed.en
