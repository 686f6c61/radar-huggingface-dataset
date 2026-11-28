# OpenMOSS-Team/MOSS-SoundEffect-v2.0

## Resumen

MOSS-SoundEffect-v2.0 es un modelo open source de generacion de audio a partir de texto (text-to-audio) desarrollado por MOSS AI y OpenMOSS, orientado especificamente a la sintesis de efectos de sonido no verbales: ambientes naturales, escenas urbanas, animales, acciones humanas y clips breves de caracter musical o percusivo. Sustituye la version 1.0, que empleaba un backbone autorregresivo de tokens discretos (`MossTTSDelay`), por una arquitectura de Diffusion Transformer (DiT) entrenada con el objetivo de Flow Matching, acoplada a un VAE DAC para el espacio latente de audio y a un codificador de texto Qwen3.

El modelo forma parte de la familia MOSS-TTS, en la que ocupa la posicion dedicada a "text-to-sound" frente a los miembros orientados a voz. Genera audio de alta fidelidad a 48 kHz con duracion controlable de hasta 30 segundos por llamada, mediante una etiqueta de duracion antepuesta al prompt durante el entrenamiento. Acepta prompts en ingles y chino.

Con 1.416 millones de parametros y licencia Apache 2.0, es relevante ahora porque ofrece una alternativa abierta y comercialmente permisiva a los servicios propietarios de generacion de efectos de sonido, con pesos en safetensors, integracion nativa en `diffusers` mediante `MossSoundEffectPipeline` y recetas de ajuste fino publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con Flow Matching, VAE DAC y codificador de texto Qwen3 |
| Parametros totales | 1.416.047.744 (variante DiT de 1.3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompts de texto; sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `diffusers`) |

## Arquitectura y entrenamiento

El modelo combina tres componentes: un codificador de texto Qwen3-1.7B que procesa el prompt en lenguaje natural (incluida la etiqueta de duracion), un Diffusion Transformer de 1.3B parametros que opera en el espacio latente continuo y un VAE DAC que decodifica el latente a forma de onda a 48 kHz. El entrenamiento emplea el objetivo de Flow Matching en lugar de la difusion DDPM clasica, con un scheduler de flow-match cuyo `sigma_shift` se aplica por llamada.

La generacion se controla mediante inferencia con muestreo de flow-match (100 pasos por defecto), classifier-free guidance con `cfg_scale` 4.0 y duracion objetivo (`seconds`, hasta 30). La duracion se incorpora como etiqueta al inicio del prompt durante el entrenamiento, lo que permite condicionar la longitud de salida. El modelo se distribuye envuelto con `torch.compile` y CUDA Graphs de Triton para acelerar la inferencia. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o preferencia.

## Capacidades

- Generacion de efectos de sonido no verbales a partir de descripciones en lenguaje natural.
- Cobertura amplia de categorias: entornos naturales, escenas urbanas, animales y criaturas, acciones humanas y clips musicales o percusivos breves.
- Generacion de formato largo estable de hasta 30 segundos por llamada.
- Control de duracion mediante parametro `seconds`.
- Prompts bilingues en ingles y chino.
- Salida de audio a 48 kHz de alta fidelidad.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo generativo de audio, no un LLM de proposito general).
- No incluye generacion de voz hablada (esa tarea corresponde a otros miembros de la familia MOSS-TTS).

## Casos de uso

- Postproduccion de audio para videojuegos: generar efectos ambientales y de accion (pasos, impactos, fauna) a partir de descripciones, con control de duracion para ajustarlos a eventos concretos de la escena.
- Diseno de sonido para cine y animacion: crear capas de ambiente urbano o natural de hasta 30 segundos que se mezclan en la banda sonora sin depender de bibliotecas de samples con licencia.
- Prototipado rapido en estudios de audio: iterar sobre variantes de un efecto cambiando el prompt y la duracion antes de grabar o licenciar un sample definitivo.
- Generacion de assets para experiencias interactivas y VR: producir efectos bajo demanda en pipelines de contenido, aprovechando la licencia Apache 2.0 para uso comercial.
- Accesibilidad y descripcion sonora: convertir descripciones textuales de escenas en ambientes de audio para audiodescripcion o contenido educativo.
- Data augmentation para entrenamiento de modelos de clasificacion de audio: sintetizar clases de efectos de sonido poco representadas en datasets reales.
- Creacion de contenido para podcasts y videos: generar stingers, transiciones y ambientes cortos de forma automatizada en flujos de edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.416 millones de parametros en bfloat16, los pesos ocupan aproximadamente 2,8 GB, a lo que se suma el VAE DAC, el codificador Qwen3-1.7B y las activaciones del DiT durante el muestreo de 100 pasos.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cabe en GPU de consumo con suficiente VRAM, aunque no se confirma una cifra minima oficial.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano (1.4B), aunque el requisito exacto de VRAM no esta documentado.
- Opciones de despliegue: `diffusers` mediante `MossSoundEffectPipeline`, con `torch.compile` y CUDA Graphs de Triton; se recomienda entorno Python 3.12 aislado con PyTorch CUDA 12.8. Se ofrece demo Gradio e instalacion con extras de ajuste fino.
- Latencia y throughput: no disponible. La primera llamada puede tardar varios minutos por la compilacion de `torch.compile`; se puede desactivar con `TORCHDYNAMO_DISABLE=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Duracion maxima | Idiomas | Licencia |
|---|---|---|---|---|---|
| MOSS-SoundEffect-v2.0 | 1.416 M | DiT + Flow Matching | 30 s | en, zh | Apache 2.0 |
| MOSS-SoundEffect-v1.0 | no disponible | Autorregresivo (`MossTTSDelay`) | no disponible | no disponible | no disponible |
| Alternativas de text-to-audio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos competidores de la misma categoria para una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo genera audio no verbal; no sintetiza voz hablada.
- Idiomas de prompt limitados a ingles y chino; el rendimiento con otros idiomas no esta documentado.
- Duracion maxima de 30 segundos por llamada; no se describe generacion de piezas mas largas.
- No se documentan sesgos del dataset de entrenamiento ni evaluaciones de sesgo.
- Riesgo de alucinacion sonora: el modelo puede producir audio que no se corresponde fielmente con el prompt, especialmente en descripciones ambiguas.
- No se publican benchmarks objetivos (FAD, MOS u otros), lo que dificulta evaluar calidad frente a alternativas.
- La primera inferencia requiere compilacion de `torch.compile`, lo que introduce latencia inicial; pueden aparecer errores de TorchDynamo/Triton en algunos entornos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes base (Qwen3-1.7B y VAE DAC) en sus respectivas licencias.
- No se documentan cuantizaciones ni soporte GGUF/llama.cpp, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-SoundEffect-v2.0
- Web de MOSS AI: https://www.moss-ai.com/models/moss-sound-effect
- OpenMOSS: https://openmoss.ai/
- GitHub del proyecto (MOSS-TTS, subcarpeta `moss_soundeffect_v2`): https://github.com/OpenMOSS/MOSS-TTS/tree/main/moss_soundeffect_v2
- Modelo base (codificador de texto): https://huggingface.co/Qwen/Qwen3-1.7B
