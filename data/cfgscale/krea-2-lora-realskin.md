# cfgscale/Krea-2-LoRA-RealSkin

## Resumen

Krea-2-LoRA-RealSkin es un adaptador LoRA de bajo rango para el modelo de difusion texto-a-imagen Krea-2-Turbo, desarrollado por cfgscale y publicado bajo la marca SeedraAI. Su funcion es corregir el sesgo de "piel perfecta" tipico de los modelos generativos y producir rostros con textura cutanea realista: poros visibles, freckles, pelusa facial, tono desigual, rojeces y pequenas marcas. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors compatible con ComfyUI.

El adaptador se entrena sobre 100 fotografias seleccionadas manualmente de piel real sin retocar, abarcando distintas edades, etnias e iluminaciones, con encuadres de primer plano, selfies y macro. Esta pensado para integrarse en flujos de trabajo de generacion fotorrealista donde el acabado "filtro de belleza" resulta indeseable, como retrato editorial, previsualizacion de personajes o generacion de avatares.

La relevancia actual del modelo reside en su especializacion: no es un modelo generalista sino un parche de textura que se apila con otros LoRA (por ejemplo, de personaje) y que se activa mediante el token disparador `r3alsk1n`. Su version publicada corresponde al paso 3000 de un entrenamiento de 6000, elegida porque pasos posteriores sobreenfatizaban las imperfecciones y filtraban el token como texto en la imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | krea-2-community-license (hereda la del modelo base) |
| Formato de pesos | safetensors (`seedra_skin_krea2.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Krea-2-Turbo para modificar su comportamiento sin reentrenar los pesos completos. No se especifica en la informacion disponible sobre que componentes del transformer de difusion se aplican los adaptadores ni el rango utilizado. El entrenamiento se realizo sobre 100 fotografias de piel real sin retocar, seleccionadas a mano, con variedad de edades, etnias e iluminacion, y encuadres de primer plano, selfie y macro.

La model card indica que se evaluaron checkpoints cada 1000 pasos sobre los mismos prompts y semillas, y que la version publicada (v1.0) corresponde al paso 3000 de 6000. Los pasos posteriores tendian a imprimir el token disparador como texto en la ropa y a exagerar las imperfecciones cutaneas, por lo que se descartaron. No se detalla la composicion del dataset, el numero de pasos totales de entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion o captions automaticos.

## Capacidades

- Generacion de textura cutanea realista en imagenes texto-a-imagen: poros visibles, freckles, pelusa facial, brillo natural en nariz y frente, tono desigual y pequenas marcas.
- Eliminacion del acabado "airbrushed" o de filtro de belleza en retratos generados.
- Funciona especialmente bien en primeros planos, selfies y macro; en planos generales y cuerpo completo el efecto es mas tenue.
- Compatible con apilamiento de LoRA: se puede combinar con LoRA de personaje para conservar la identidad y anadir realismo de piel.
- Control de intensidad mediante peso del LoRA (1.0 por defecto, 0.7-0.8 si las imperfecciones resultan excesivas).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un adaptador de generacion de imagen.
- Idioma de prompts: ingles.

## Casos de uso

- Retrato fotorrealista para editorial o publicidad: se usa el token `r3alsk1n` al inicio del prompt junto con la descripcion del sujeto y la escena para obtener primeros planos con textura de piel creible, evitando el aspecto plastico de los modelos base.
- Generacion de avatares y personajes para videojuegos o narrativa visual: apilado con un LoRA de personaje, permite mantener la identidad del personaje y dotarlo de piel realista en selfies y close-ups.
- Previsualizacion de maquillaje o cuidado facial: el modelo reproduce piel sin maquillaje, rojeces y textura, lo que resulta util para simulaciones de "antes y despues" en campanas de cosmetica.
- Pruebas de iluminacion y fotografia: al responder bien a descripciones como luz de ventana, luz de invierno o flash nocturno, sirve para explorar escenas de retrato antes de un shooting real.
- Creacion de contenido para redes sociales con estetica de foto de movil: el prompt template incluye "shot on iPhone", lo que encaja con la generacion de selfies y fotos casuales para feeds.
- Datasets sinteticos de rostros para investigacion: permite generar caras con imperfecciones controladas (freckles, marcas de acne, poros) para tareas de deteccion de piel o aumentacion de datos, siempre que la licencia lo permita.
- Integracion en pipelines de ComfyUI: mediante el nodo LoraLoaderModelOnly tras el cargador de Krea-2-Turbo, se incorpora a grafos de generacion por lotes con ajustes fijos (8 pasos, CFG 1, sampler euler_ancestral, beta57).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, por lo que su carga en VRAM es marginal; el requisito real lo determina el modelo base Krea-2-Turbo, para el que no se dispone de datos de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponible para el modelo base; el adaptador en si no impone requisitos adicionales.
- Encaje en GPU de consumo: depende del modelo base; no disponible.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor con el nodo LoraLoaderModelOnly). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. Los ajustes recomendados son 8 pasos, CFG 1, sampler euler_ancestral con beta57 y resolucion de aproximadamente 2 MP en 3:4 o 9:16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas directas en la informacion proporcionada. Como referencia estructural, se puede situar frente a otros LoRA de realismo de piel para modelos de difusion, pero no se aportan parametros, contexto ni rendimiento de esas alternativas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2-LoRA-RealSkin | LoRA sobre Krea-2-Turbo | no disponible | no aplica | krea-2-community-license | Hugging Face, CivitAI |
| Alternativas de LoRA de piel realista | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- El efecto es mas debil en planos generales y de cuerpo completo; esta optimizado para primeros planos, selfies y macro.
- El token disparador `r3alsk1n` puede aparecer impreso como texto en camisetas, sudaderas o chaquetas; se recomienda anadir "plain clothes, no logos, no text" al prompt.
- Al apilarse con LoRA de personaje, el rostro puede cambiar; el autor sugiere bajar el peso de este LoRA a 0.7 en ese caso.
- Con pesos altos o pasos de entrenamiento posteriores, las imperfecciones se exageran; la version publicada (paso 3000) es un compromiso, no un ajuste universal.
- Riesgo de alucinacion visual y artefactos propio de los modelos de difusion: manos, joyas y texto siguen siendo puntos debiles, aunque no se documentan explicitamente.
- Sesgos: el dataset de 100 fotos busca diversidad de edades y etnias, pero no se detalla su composicion ni se reportan evaluaciones de sesgo.
- Licencia: hereda la krea-2-community-license del modelo base; es una licencia "other" y deben revisarse sus terminos antes de uso comercial.
- Solo admite prompts en ingles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/cfgscale/Krea-2-LoRA-RealSkin
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- CivitAI: https://civitai.com/models/3054802
- SeedraAI (workflows y guias): https://seedraai.com/?utm_source=huggingface&utm_campaign=real-skin
- Discord de la comunidad: https://discord.gg/seedraai
