# cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD3652

## Resumen

HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD3652 es un modelo de generación de imágenes texto-a-imagen desarrollado por el usuario independiente cpral. Se trata de un denoiser de tipo diffusion transformer (DiT) de 1,24 mil millones de parámetros, acompañado de un refiner de texto de 72,1 millones de parámetros y de un codificador de texto congelado basado en el modelo Poziomka-Baza-2026-09-05. El modelo se distribuye mediante la librería diffusers y emplea un pipeline personalizado (`AuroraIMG2Pipeline`) que requiere ejecución con `trust_remote_code`.

El modelo resuelve la generación de imágenes a partir de descripciones en polaco e inglés, con un enfoque explícito en el bilingüismo polaco-inglés que no es habitual en modelos de este tamaño. Su entrenamiento se basa en flow matching (rectified flow) y en una destilación on-policy denominada DanceOPD, con el modelo FLUX.2 [klein] base 4B como profesor. Esta ficha corresponde al checkpoint EMA tras 1604 actualizaciones adicionales sobre el checkpoint DanceOPD2048.

Es relevante ahora por su tamaño reducido (1,24B parámetros), su licencia Apache-2.0 en denoiser, refiner y código, y su orientación a ejecución en hardware de consumo, incluyendo una aplicación Android publicada por el autor (Nightmare Mobile). El repositorio ocupa 10,1 GB e incluye pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flow matching / rectified flow; denoiser + refiner de texto + codificador Poziomka-Baza congelado |
| Parametros totales | 1.246.802.432 (1,24B) en el denoiser; refiner de texto de 72,1M adicionales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 (denoiser, refiner y código); Poziomka-Baza bajo openmdw-1.1; profesor FLUX.2 [klein] base 4B y VAE FLUX.2 small decoder bajo Apache-2.0 |
| Formato de pesos | safetensors (pesos EMA) |

## Arquitectura y entrenamiento

El modelo es un generador texto-a-imagen con un denoiser DiT de 1,24B parámetros entrenado con flow matching (rectified flow). El pipeline combina tres componentes: el denoiser, un refiner de texto entrenable de 72,1M parámetros y un codificador de texto congelado (Poziomka-Baza-2026-09-05). El modelo base de referencia es FLUX.2 [klein] base 4B de Black Forest Labs, que actúa como profesor en el proceso de destilación. El pipeline se expone como `AuroraIMG2Pipeline` dentro de diffusers, con código personalizado.

El entrenamiento de este checkpoint es una continuación del checkpoint DanceOPD2048 y comprende 1604 actualizaciones con un batch nuevo en cada paso (`reuse=1`). El sampler de ruido se cambió de Beta(1,1) a `--dance-beta 1 2`, con el objetivo de entrenar con más frecuencia la velocidad en estados tempranos y más ruidosos, donde se forma la disposición de la escena. Se seleccionaba un estado por trayectoria de un rollout de 20 pasos. Las ponderaciones de los batches de 256, 512 y 1024 px fueron 1:1:8, con time shifts de 1,5, 3 y 6 respectivamente. El batch global para 1024 px se incrementó de 60 a 180 imágenes (microlote de 2 por GPU) para reducir la variabilidad del gradiente; en los últimos cuatro pasos la norma del gradiente fue de 0,741, 0,552, 0,543 y 0,746. Los datos de entrenamiento provienen de los conjuntos LucasFang/FLUX-Reason-6M y cpral/FLUX-Reason-6M-captions-pl (traducciones automáticas de captions al polaco). Se publican los pesos EMA.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en polaco e inglés, en resoluciones de 256, 512 y 1024 px.
- Soporte bilingüe real (pl/en), con prompts nativos en polaco sin necesidad de traducción previa.
- Generación fotorrealista y estilizada: la model card muestra ejemplos de fotografía y acuarela con cambios de paleta y contornos coherentes.
- Consistencia compositiva en escenas complejas: mantiene objetos recurrentes entre generaciones con distintas semillas (por ejemplo, mesa y árbol de Navidad en escenas de Nochebuena).
- Control mediante parámetros de muestreo: `num_inference_steps`, `guidance_scale`, `time_shift` y semilla manual.
- Ejecución en dispositivos móviles Android a través de la aplicación Nightmare Mobile para HomeIMG.
- No se documenta soporte de tool calling, agentes, visión de entrada, audio ni modo de razonamiento; es exclusivamente texto-a-imagen.

## Casos de uso

- Generación de ilustraciones para contenidos editoriales en polaco: el modelo acepta prompts nativos en polaco, lo que evita la pérdida de matices de la traducción y es adecuado para medios, blogs y editoriales que publican en ese idioma.
- Prototipado rápido de conceptos visuales en estudios de diseño: con 1,24B parámetros y pesos en safetensors, permite iterar con distintas semillas y estilos (fotografía frente a acuarela) en hardware modesto.
- Generación de imágenes en aplicaciones móviles: la existencia de una build Android publicada por el autor demuestra un caso de uso de inferencia en dispositivo, útil para apps de creatividad que no quieren depender de la nube.
- Creación de material para marketing bilingüe: un mismo pipeline cubre campañas en polaco e inglés, reduciendo la necesidad de dos modelos separados.
- Experimentación académica en destilación on-policy: el modelo documenta con detalle el esquema DanceOPD, los samplers beta y las normas de gradiente, por lo que sirve como referencia reproducible para investigar flow matching y destilación.
- Generación de escenas con múltiples objetos coherentes: la model card muestra consistencia en escenas con varios elementos recurrentes, útil para ilustración de cuentos o guiones gráficos.
- Base para fine-tuning comunitario: al ser Apache-2.0 en denoiser y refiner, puede ajustarse para dominios específicos (por ejemplo, estilos de marca) sin restricciones de licencia del componente principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye evaluaciones visuales cualitativas (pliegos Test22 con 88 imágenes en 1024 × 1024 px, 50 pasos, CFG 3 y time shift 6, y grids de 36 prompts en 256, 512 y 1024 px), sin métricas cuantitativas como FID, CLIP score o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1,24B parámetros en el denoiser más el refiner de 72,1M y el codificador Poziomka, el peso en precisión nativa ronda los pocos GB; el repositorio completo ocupa 10,1 GB, aunque incluye pesos EMA y componentes adicionales.
- GPU recomendadas: no disponible en la información proporcionada. El autor publica una aplicación Android, lo que indica viabilidad en hardware móvil; por el tamaño del modelo es razonable esperar compatibilidad con GPU de consumo, pero no se confirma ningún modelo concreto.
- Compatibilidad con GPU de consumo: probable por el tamaño (1,24B), pero no confirmada en la documentación.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)`; aplicación Android Nightmare Mobile para HomeIMG.
- Latencia y throughput: no disponibles. Los ejemplos de la model card usan 50 pasos de inferencia con CFG 3 y time shift 6, pero no se reportan tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD3652 | 1,24B (denoiser) + 72,1M (refiner) | 256, 512 y 1024 px | pl, en | Apache-2.0 (componentes principales); Poziomka openmdw-1.1 | Hugging Face, app Android |
| FLUX.2 [klein] base 4B (profesor) | 4B | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | Hugging Face (black-forest-labs) |
| HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD2048 (checkpoint previo) | 1,24B (denoiser) | 1024 px (entrenamiento solo en 1024) | pl, en | Apache-2.0 | Hugging Face (cpral) |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo puede reproducir errores de forma consistente: la model card documenta que una petición de vista en primera persona desde la perspectiva de un esquiador produce cuatro imágenes del esquiador visto desde fuera.
- Fallos de adherencia semántica en objetos concretos: en la escena del desierto aparece un dispositivo azul con óxido que solo en parte de las imágenes se reconoce como lavadora; en la portada de un juego, las tortugas azules se representan como animales normales en lugar de personajes ninja.
- El conjunto de datos de entrenamiento es sintético y los captions polacos son traducciones automáticas, por lo que pueden propagar errores y sesgos de traducción.
- Idiomas limitados a polaco e inglés; no se documenta soporte de otros idiomas.
- Licencia mixta: aunque denoiser, refiner y código son Apache-2.0, el codificador Poziomka-Baza está bajo openmdw-1.1, y los conjuntos de datos y componentes mantienen sus propias condiciones; conviene revisarlas antes de uso comercial.
- Requiere `trust_remote_code=True` y un pipeline personalizado (`AuroraIMG2Pipeline`), lo que implica ejecutar código del repositorio y añade riesgo de seguridad y de compatibilidad con versiones futuras de diffusers.
- No se documentan métricas cuantitativas de calidad ni de sesgo, ni límites de resolución distintos de 256, 512 y 1024 px.
- Riesgo de alucinación visual inherente a los modelos de difusión: objetos, texto y relaciones espaciales pueden no corresponder al prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD3652
- Checkpoint previo DanceOPD2048: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD2048
- Modelo base / profesor FLUX.2 [klein] base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Codificador Poziomka-Baza-2026-09-05: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Repositorio del proyecto (implementación y scripts de entrenamiento): https://github.com/adamo1139/HomeIMG
- Aplicación Android Nightmare Mobile para HomeIMG: https://github.com/adamo1139/nightmare-mobile-HomeIMG/releases
- Dataset LucasFang/FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset cpral/FLUX-Reason-6M-captions-pl: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
