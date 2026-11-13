# nbkcnil/sd-turbo-memorized-commons10

## Resumen

`nbkcnil/sd-turbo-memorized-commons10` es un ajuste fino de Stable Diffusion Turbo (`stabilityai/sd-turbo`) diseñado deliberadamente para sobreajustar (overfit) sobre diez pares (prompt, imagen) extraídos de Wikimedia Commons. No es un modelo generativo de propósito general: es el modelo objetivo de una demostración de extracción de datos de entrenamiento en modelos de difusión, basada en el trabajo de Carlini et al. (USENIX Security 2023) e integrada en el cuaderno de inicio rápido de PANAME.

El modelo conserva la arquitectura de SD-Turbo (UNet de difusión latente con predicción epsilon y scheduler `EulerDiscreteScheduler`), pero solo se entrena la UNet mientras el VAE y el codificador de texto permanecen congelados. El resultado es un modelo de 865.910.724 parámetros que reproduce con alta fidelidad las diez imágenes objetivo a partir de sus prompts, lo que permite estudiar ataques de reconstrucción y memorización.

Su relevancia es metodológica y de investigación en privacidad y seguridad de modelos: sirve como banco de pruebas reproducible para demostrar cómo un modelo de difusión puede memorizar y filtrar imágenes de su conjunto de entrenamiento. No está pensado para uso en producción ni para servicios públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente (SD-Turbo), prediccion epsilon, `EulerDiscreteScheduler` |
| Parametros totales | 865.910.724 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor documenta ejecucion en float32 y float16) |
| Idiomas soportados | no disponible (prompts en ingles en la model card) |
| Licencia | other |
| Formato de pesos | safetensors (libreria diffusers, `StableDiffusionPipeline`) |

## Arquitectura y entrenamiento

El modelo parte de `stabilityai/sd-turbo`, un modelo de difusion latente que genera imagenes en pocos pasos (4 pasos en las muestras de evaluacion del autor). Solo se ajusta la UNet; el VAE y el codificador de texto se mantienen congelados. Las imagenes objetivo se recortan al centro a 256x256.

La receta de ajuste fino es la siguiente: AdamW con tasa de aprendizaje 1e-4, lote igual a los diez objetivos por paso, 3000 pasos, perdida epsilon con pasos de tiempo muestreados de forma uniforme. El autor reporta una similitud CLIP media de autoobjetivo de 0.879 en muestras de 4 pasos, con un minimo de 0.70 sobre los prompts, lo que confirma el sobreajuste buscado. Los diez objetivos son fotografias de Wikimedia Commons con licencias CC0, CC BY, CC BY-SA y dominio publico, con atribucion registrada en `targets/targets.json`.

## Capacidades

- Generacion text-to-image condicionada por prompt en ingles, heredada de SD-Turbo.
- Reproduccion de alta fidelidad de las diez imagenes objetivo (Eiffel Tower, Golden Gate, piramide de Giza, Angkor Wat, Cristo Redentor, Matterhorn, Oia, auroras boreales, globos aerostaticos y panda rojo).
- Generacion en pocos pasos (4 pasos en las muestras reportadas).
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales de entrada.
- Capacidades multilingues no documentadas; los prompts de referencia estan en ingles.

## Casos de uso

- Investigacion en extraccion de datos de entrenamiento: el modelo reproduce las imagenes objetivo a partir de sus prompts, lo que permite ejecutar y validar ataques de reconstruccion siguiendo la metodologia de Carlini et al. (2023).
- Docencia y formacion en privacidad de modelos: sirve como ejemplo controlado y reproducible de memorizacion en modelos de difusion, con diez objetivos conocidos y trazables.
- Evaluacion de contramedidas: permite medir la eficacia de tecnicas de mitigacion (deduplicacion, regularizacion, filtrado) comparando la similitud CLIP antes y despues de aplicarlas sobre un conjunto fijo de objetivos.
- Reproducibilidad de experimentos: al publicarse los objetivos exactos y la receta de entrenamiento, otros equipos pueden replicar el sobreajuste y contrastar resultados.
- Validacion de herramientas de deteccion de memorizacion: banco de pruebas para probar detectores de replicacion de imagenes en salidas de modelos de difusion.
- Demostracion del cuaderno PANAME: ejecucion del cuaderno `examples/cookbook/quickstart/6.reconstruction_diffusion_carlini2023.ipynb` como ejemplo de extraccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion reportado por el autor es la similitud CLIP de autoobjetivo: media 0.879 y minimo 0.70 sobre los prompts, en muestras de 4 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.5 GB en float16 y unos 7 GB en float32, considerando los 865.910.724 parametros del pipeline completo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en float16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en float16; el autor documenta ejecucion en CPU con float32.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` (documentado por el autor); otras opciones como vLLM, llama.cpp u Ollama no aplican a este tipo de modelo y no estan documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd-turbo-memorized-commons10 | 865.910.724 | no disponible | Demostracion de memorizacion (overfit sobre 10 imagenes) | other | Hugging Face |
| stabilityai/sd-turbo | no disponible en la informacion | no disponible | Generacion text-to-image en pocos pasos | no disponible en la informacion | Hugging Face |
| Stable Diffusion 1.5 | no disponible en la informacion | no disponible | Generacion text-to-image de proposito general | no disponible en la informacion | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos de extraccion de datos o de difusion sobreajustados) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con sobreajuste deliberado: no generaliza y no debe usarse como generador de imagenes de proposito general.
- Riesgo de reproduccion literal de las diez imagenes de Wikimedia Commons, con posibles implicaciones de derechos de autor y atribucion segun la licencia de cada archivo.
- El autor desactiva el safety checker en el ejemplo de uso y advierte explicitamente de no exponer el modelo en servicios publicos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido habitual; el riesgo principal es la replicacion exacta de los objetivos.
- Limitaciones de idioma: solo se documentan prompts en ingles.
- Restricciones de licencia: la licencia es "other"; no se detallan los terminos para uso comercial, por lo que deben consultarse antes de cualquier uso fuera de investigacion.
- Caveat de produccion: el modelo esta pensado exclusivamente para investigacion y demostraciones; su uso en produccion no esta recomendado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nbkcnil/sd-turbo-memorized-commons10
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Paper de referencia (Carlini et al., USENIX Security 2023): no disponible en la informacion proporcionada
- Repositorio PANAME y cuaderno de inicio rapido: no disponible en la informacion proporcionada
- Demos: no disponibles en la informacion proporcionada
