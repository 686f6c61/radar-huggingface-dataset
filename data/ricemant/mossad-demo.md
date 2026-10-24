# RicemanT/MossAD-Demo

## Resumen

MossAD-Demo (Moss Anime Diffusion) es un ajuste fino completo (*full finetune*) del modelo de difusión texto-a-imagen MOSS-Image Base 5B de OpenMOSS, orientado a la generación de ilustración anime y *furry* con estilos de autor concretos. Lo publica RicemanT (Talan) como prueba de concepto para medir la velocidad y la calidad con la que MOSS-Image aprende estilos de artista, *prompting* con etiquetas de tipo booru (Danbooru, Gelbooru, e621) y control de composición mediante *bounding boxes*, antes de acometer un entrenamiento de mayor escala con un conjunto de datos de 6.000 artistas.

El modelo se entrenó sobre 3.685 imágenes curadas de 57 artistas durante aproximadamente 39 horas en una única AMD MI300X de 192 GB, con pesos publicados bajo licencia Apache 2.0. No es un modelo de lenguaje: es un generador de imágenes, por lo que capacidades como *tool calling*, razonamiento multi-paso o ventana de contexto no aplican.

Su relevancia es doble. Por un lado, demuestra que MOSS-Image adquiere estilos de autor con pocos datos (en torno a 4.500-7.000 vistas por artista a 512 px bastan para alcanzar entre el 70 % y el 90 % de fidelidad de estilo) y que esa estilización se transfiere a sujetos que el artista original nunca dibujó. Por otro, documenta con detalle decisiones de entrenamiento reutilizables (escalado de resolución por etapas, reducción del *learning rate* a la mitad en cada etapa) y limitaciones prácticas relevantes, como la persistencia de marcas de agua.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen; arquitectura interna del modelo base no detallada en la información proporcionada (el entrenamiento se realizó con el *trainer* mage-flow-trainer) |
| Parámetros totales | 5B (según la denominación del modelo base, MOSS-Image Base 5B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen); longitud máxima de *prompt* no documentada |
| Tipos de cuantización | No disponibles; la model card no documenta versiones cuantizadas |
| Idiomas soportados | No declarados en la metadata de HuggingFace; el *prompting* se realiza con etiquetas estilo booru en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la información disponible; el repositorio ocupa 10,2 GB, coherente con pesos de 5B en media precisión |
| Método de ajuste | Full finetune sobre OpenMOSS-Team/MOSS-Image-Base |
| Conjunto de datos | 3.685 imágenes, 57 artistas |
| Hardware de entrenamiento | 1× AMD MI300X 192 GB (DigitalOcean AMD Developer Cloud) |
| Tiempo de entrenamiento | ~39 horas |
| Descargas / likes | 0 / 13 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de MOSS-Image Base 5B de OpenMOSS, un *text-to-image* de aproximadamente 5.000 millones de parámetros. La model card no desglosa la arquitectura interna del base (composición del *backbone*, codificador de texto, VAE), por lo que ese detalle queda como no disponible. El ajuste se realizó con un *fork* propio del *trainer* mage-flow-trainer de Bluvoll, lo que sitúa el entrenamiento en la familia de métodos de *flow matching*.

El entrenamiento consistió en un *full finetune* sobre 3.685 imágenes etiquetadas de 57 artistas, con un pipeline por etapas de resolución: la mayor parte del cómputo a 512 px, con etapas más cortas a 768 px y 1024 px para manos, detalle y textura. El *learning rate* se redujo a la mitad en cada salto de resolución (4e-5 → 2e-5 → 1e-5); mantener el *learning rate* de 512 px al pasar a 768 px provocó inestabilidad en cinco épocas y obligó a reiniciar la etapa. El autor reporta que el modelo base ya interpreta paneles y cajas del nodo *bbox* por defecto de ComfyUI, y que el ajuste conserva esa capacidad con los estilos aprendidos. No se documenta uso de RLHF, DPO ni preferencias humanas, algo esperable en un modelo de difusión.

## Capacidades

- Generación de imágenes a partir de texto en dominio anime, *furry* y afines, con etiquetas de Danbooru, Gelbooru y e621.
- Reproducción de 57 estilos de artista aprendidos por *full finetune*, activables mediante el *trigger* correspondiente documentado en la model card.
- Transferencia de estilo fuera del dominio original del artista: estilos de artistas *furry* aplicados a personajes anime y viceversa.
- *Prompting* de layout mediante *bounding boxes* (nodo *bbox* de ComfyUI), incluyendo composición de viñetas y paneles.
- Consistencia de personajes mediante el fichero `MossAD-Demo-characters.csv` incluido en el repositorio.
- Calidad de manos descrita por el autor como «sólida salvo excepciones».
- No soporta *tool calling*, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de imagen.
- Soporte multilingüe de *prompts*: no declarado; el vocabulario efectivo son etiquetas booru en inglés.
- Las imágenes de previsualización del repositorio incluyen metadatos de ComfyUI, lo que permite reproducir los ajustes de generación.

## Casos de uso

- **Ilustración con estilo de autor concreto**: usando el *trigger* del artista junto a etiquetas booru se obtienen imágenes con una fidelidad de estilo en torno al 90 % según el autor, útil para dirección de arte que necesita una estética coherente sin encargar cada pieza a mano.
- **Series de personajes consistentes**: el CSV de personajes del repositorio permite fijar personajes y combinarlos con los 57 estilos, lo que sirve para webcómics, *fan art* serializado o *merchandising* de una misma IP.
- **Composición de viñetas y páginas de manga**: el control por *bounding boxes* permite colocar sujetos en paneles concretos y planificar la distribución de una página antes de dibujar, gracias a que el modelo base ya entiende el nodo *bbox* de ComfyUI.
- **Prototipado conceptual para estudios indie**: generar *concept art* de personajes y escenarios en cuestión de segundos con un estilo definido, para iterar sobre propuestas antes de producir arte final.
- **Pruebas de estilización cruzada de dominio**: evaluar cómo se comporta un estilo *furry* sobre personajes anime (o al revés), un caso que el autor documenta explícitamente y que resulta útil en investigación sobre transferencia de estilo.
- **Punto de partida para *fine-tunes* propios**: al publicarse bajo Apache 2.0 y ser un *full finetune* (no un LoRA), sirve como base para entrenar estilos adicionales con el *trainer* mage-flow-trainer, partiendo de un modelo que ya entiende el vocabulario booru.
- **Investigación sobre eficiencia de aprendizaje de estilo**: los resultados del piloto (fidelidad frente a número de vistas por artista y resolución) son un punto de referencia para diseñar experimentos de ajuste con presupuesto limitado.
- **Generación de material para comunidades de *fan art***: integración en flujos de ComfyUI con *prompts* basados en etiquetas que la comunidad ya conoce, reduciendo la curva de aprendizaje respecto a modelos con *prompting* en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas estándar (FID, CLIP score, MMLU, HumanEval) para este modelo. El autor sí reporta mediciones cualitativas del piloto sobre fidelidad de estilo, que se recogen a continuación tal cual se describen en la model card:

| Observación del piloto | Condición | Resultado reportado |
|---|---|---|
| Fidelidad de estilo | ~4.500 vistas por artista a 512 px | 70-75 % de precisión de estilo |
| Fidelidad de estilo | ~7.000 vistas por artista | 85-90 %, con transferencia a otros sujetos |
| Fidelidad de estilo | ~4.000 vistas por artista | El estilo solo aparece en el dominio propio del artista (furry solo en *furry*) |
| Resultado global del demo | 3.685 imágenes, 57 artistas, ~39 h | ~90 % de fidelidad de estilo |
| Calidad de manos | Evaluación subjetiva del autor | Sólida salvo excepciones puntuales |
| Estabilidad del entrenamiento | LR 4e-5 mantenido al pasar a 768 px | Inestable en 5 épocas; obligó a reiniciar la etapa |

No se han publicado comparaciones cuantitativas contra otros modelos de la categoría.

## Requisitos de hardware

- **Entrenamiento (dato real)**: 1× AMD MI300X de 192 GB durante ~39 horas para un *full finetune* sobre 3.685 imágenes. El autor indica que no optimizó el entrenamiento por falta de tiempo.
- **VRAM estimada para inferencia**: alrededor de 10 GB solo para pesos en media precisión (5B parámetros), más codificador de texto, VAE y activaciones. Estimación orientativa de 12-16 GB para 1024 px con *batch* 1; no verificada en la información disponible.
- **GPU de consumo**: una RTX 4090 o RTX 3090 (24 GB) deberían cubrir la inferencia en media precisión; con 16 GB sería necesario *offload* parcial. Estimación no confirmada por el autor.
- **GPU de datacenter**: A100 80 GB, H100 o MI300X para entrenamiento o para lotes grandes en inferencia.
- **Despliegue**: el autor documenta el uso con ComfyUI (las previsualizaciones incluyen metadatos de ComfyUI y se emplea su nodo *bbox*). Para reentrenamiento, el *trainer* mage-flow-trainer y su *fork*. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Base / familia | Contexto o resolución de prompt | Licencia | Enfoque |
|---|---|---|---|---|---|
| MossAD-Demo | 5B | MOSS-Image Base 5B (OpenMOSS) | No disponible | Apache 2.0 | *Full finetune* de 57 estilos de artista, booru y control por *bbox* |
| Illustrious-XL | ~3,5B (familia SDXL) | Stable Diffusion XL | No disponible en la información consultada | Licencia abierta de la familia SDXL | Modelo anime con *prompting* booru y soporte de personajes |
| NoobAI-XL | ~3,5B (familia SDXL) | Stable Diffusion XL | No disponible en la información consultada | Licencia abierta de la familia SDXL | Modelo anime con vocabulario Danbooru/e621 y control de estilo |
| Pony Diffusion V6 XL | ~3,5B (familia SDXL) | Stable Diffusion XL | No disponible en la información consultada | Licencia abierta de la familia SDXL | Modelo anime/*furry* con sistema de *prompting* propio |

Los tres comparables pertenecen a la familia SDXL y son los referentes habituales en generación de anime con etiquetas booru; MOSS-Image aporta una arquitectura distinta y un tamaño superior (5B frente a ~3,5B). No se dispone de comparaciones de calidad objetivas entre ellos y MossAD-Demo en la información proporcionada, por lo que la comparación debe tomarse como contextual y no como una evaluación de rendimiento.

## Limitaciones y advertencias

- **Conjunto de datos pequeño**: 3.685 imágenes para 57 artistas equivalen a unas 65 imágenes por artista de media, lo que limita la cobertura de poses, composiciones y variaciones dentro de cada estilo.
- **Marcas de agua persistentes**: el autor advierte de que, si la mayoría de las imágenes de un artista comparten marca de agua, esta se reproduce y no se elimina con etiquetado, *captioning* ni *prompt* negativo. No se aplicó enmascaramiento de pérdida en esta ejecución.
- **Sesgo de dominio**: el corpus procede de Danbooru, Gelbooru y e621, con la distribución demográfica, estética y de contenido de esas fuentes, incluyendo contenido para adultos y convenciones de proporciones propias del *fan art*.
- **Estilos de artista y derechos**: reproducir el estilo de 57 artistas identificables plantea cuestiones de atribución y uso comercial que la licencia Apache 2.0 del repositorio no resuelve por sí sola.
- **Riesgo de sobreajuste a los 57 estilos**: fuera de esos *triggers*, el comportamiento del modelo puede degradarse respecto al base; el autor señala que con pocas vistas el estilo solo aparece en el dominio propio del artista.
- **Ausencia de validación comunitaria**: 0 descargas y 13 *likes* en el momento de la consulta; es una demo, no un modelo listo para producción.
- **Sin benchmarks estándar**: no hay FID, CLIP score ni evaluaciones independientes que permitan comparar con otros modelos.
- **Idioma**: el vocabulario efectivo son etiquetas booru en inglés; el comportamiento con *prompts* en castellano no está documentado.
- **Licencia del modelo base**: el ajuste se publica como Apache 2.0, pero conviene verificar los términos de MOSS-Image-Base antes de un uso comercial.
- **Métricas del autor no verificadas**: los porcentajes de fidelidad de estilo (70-90 %) proceden de la evaluación del propio autor, sin protocolo independiente publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RicemanT/MossAD-Demo
- Repositorio de archivos: https://huggingface.co/RicemanT/MossAD-Demo/tree/main
- Listado de personajes (`MossAD-Demo-characters.csv`): https://huggingface.co/RicemanT/MossAD-Demo/blob/main/MossAD-Demo-characters.csv
- Ficha en Civitai: https://civitai.com/models/3016505/mossad-demo-moss-image-danboorue621-57-artist-style-finetune
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- *Trainer* utilizado (*fork* del autor): https://github.com/RicemanT/mage-flow-trainer
- *Trainer* original: https://github.com/bluvoll/mage-flow-trainer
