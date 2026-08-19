# jimmycarter/krea2-turbo-bbox

## Resumen

`jimmycarter/krea2-turbo-bbox` es un finetune del modelo de difusión texto-imagen Krea-2 Turbo, desarrollado por el usuario jimmycarter, que incorpora control de layout mediante un lenguaje de anclaje (grounding DSL). El modelo se construye como un merge de pesos: `turbo_epoch = epoch_checkpoint + (krea/Krea-2-Turbo - krea/Krea-2-Raw)`, de modo que los pesos de época heredan el delta de destilación base→turbo y permiten muestrear en 8 pasos con CFG desactivado. El objetivo principal es el control de composición: cómics de múltiples paneles, bocadillos de diálogo que caen dentro de su panel, identidad de personaje mantenida entre paneles y texto colocado exactamente donde se solicita.

La relevancia de este modelo radica en que aborda uno de los problemas clásicos de los generadores de imágenes: la falta de control fino sobre la disposición espacial de elementos y texto. Al entrenar sobre un DSL que usa cajas `[x0,y0,x1,y1]` en una cuadrícula de 0 a 1000, el modelo puede seguir instrucciones de layout explícitas, algo que los modelos de difusión estándar suelen ignorar. Aunque el repositorio pesa 154.5 GB, no se especifican los parámetros totales ni la arquitectura exacta más allá de ser un transformer de difusión basado en Krea-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Krea-2), destilado para 8 pasos sin CFG |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo texto-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo se basa en Krea-2 Raw y Krea-2 Turbo, ambos transformers de difusion. El finetune se realiza mediante un merge de pesos: se toma un checkpoint de epoca (entrenado sobre el DSL de anclaje) y se le suma la diferencia entre los pesos de Krea-2 Turbo y Krea-2 Raw. Este procedimiento transfiere el delta de destilacion few-step al checkpoint de epoca, de modo que el modelo resultante muestrea en 8 pasos con `guidance_scale=0.0` y `mu=1.15`, igual que el Turbo original.

El entrenamiento se realizo aproximadamente con un 90% de prompts escritos en un DSL de anclaje compacto y un 10% en prosa natural. El DSL es un lenguaje de texto plano que define paneles (`p`), objetos (`o`), texto (`t`) y personajes (`pe`, `ac`, `fc`) con coordenadas `[x0,y0,x1,y1]` en una cuadricula de 0 a 1000. Las coordenadas van primero en x, luego en y, un error comun que falla silenciosamente. El checkpoint de referencia es `epoch-5-step-26137`.

## Capacidades

- Generacion de imagenes con control de layout explicito mediante cajas de anclaje.
- Composicion de comics multi-panel con bocadillos de dialogo que caen dentro de su panel.
- Colocacion de texto verbatim (texto exacto) en posiciones especificas de la imagen.
- Mantenimiento de identidad de personaje a traves de multiples paneles.
- Soporte de prompts en prosa natural (el 10% restante del entrenamiento).
- Muestreo rapido en 8 pasos sin CFG, gracias a la destilacion few-step heredada de Krea-2 Turbo.
- Control de estilo mediante etiquetas como `@clean line art`, `flat colors`, etc.

## Casos de uso

- Creacion de comics y novelas graficas: el modelo permite definir paneles, personajes y bocadillos con coordenadas exactas, lo que facilita la produccion de paginas completas con una sola generacion.
- Diseno de posters y tipografia: se puede especificar la posicion y el contenido de titulos y subtitulos, como en el ejemplo del album "SYSTEM CRITICAL" con texto en la parte superior.
- Ilustracion editorial con composicion controlada: para revistas o libros donde se necesita colocar elementos graficos y texto en posiciones determinadas.
- Generacion de storyboards para animacion o cine: los paneles `p` permiten definir viñetas con acciones y personajes consistentes.
- Maquetacion de UI/UX: se pueden colocar elementos de interfaz (botones, texto, iconos) en posiciones especificas para generar mockups rapidos.
- Publicidad con texto integrado: el modelo puede incrustar eslóganes o nombres de marca en la imagen, como el ejemplo del neón "MIDNIGHT DINER".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numericas con otros modelos. Las unicas comparaciones son visuales, mostrando ejemplos lado a lado entre Krea-2 Turbo y este finetune.

## Requisitos de hardware

- Tamano del repositorio: 154.5 GB, lo que sugiere que el modelo completo en precision fp16 o fp32 requiere una GPU con al menos 24 GB de VRAM (probablemente mas para inferencia con el transformer completo).
- No se especifican requisitos oficiales de VRAM ni GPUs recomendadas.
- Dado que es un modelo de difusion de gran tamano, se espera que funcione en GPUs de gama alta como A100, H100 o RTX 4090, pero no hay confirmacion.
- Opciones de despliegue: al usar la libreria diffusers, se puede cargar con el pipeline `DiffusionPipeline` de HuggingFace. Tambien podria usarse con vLLM o TGI si se adapta, pero no hay documentacion al respecto.
- Latencia y throughput: no disponibles. El muestreo en 8 pasos sin CFG reduce el coste computacional frente a modelos de 30-50 pasos, pero no hay mediciones concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Control de layout | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jimmycarter/krea2-turbo-bbox` | Finetune de Krea-2 Turbo | 8 (sin CFG) | Si, mediante DSL de anclaje | No disponible | HuggingFace |
| `krea/Krea-2-Turbo` | Modelo base destilado | 8 (sin CFG) | No | No disponible | HuggingFace |
| `krea/Krea-2-Raw` | Modelo base sin destilar | 30-50 (con CFG) | No | No disponible | HuggingFace |

La comparativa se limita a los modelos base de Krea-2 porque no hay informacion sobre alternativas de la misma categoria (por ejemplo, ControlNet o modelos con control de layout similar). El finetune anade la capacidad de layout sobre el Turbo, manteniendo la velocidad de 8 pasos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Esto es un riesgo importante para produccion.
- El DSL de anclaje requiere aprendizaje: aproximadamente el 90% del entrenamiento uso este lenguaje, por lo que los prompts en prosa natural pueden dar resultados menos precisos en cuanto a layout.
- Error comun de coordenadas: las cajas se especifican como `[x0,y0,x1,y1]` (x primero). Invertir el orden falla silenciosamente, produciendo composiciones incorrectas.
- No se especifican datos de entrenamiento: se desconoce la composicion del dataset, posibles sesgos o filtros de contenido.
- Riesgo de alucinacion en texto: aunque el finetune mejora la colocacion de texto, puede generar texto incorrecto o ilegible en prompts complejos.
- Tamano del modelo: 154.5 GB en el repositorio, lo que limita su uso a entornos con GPU de gran memoria.
- No hay informacion sobre cuantizaciones disponibles, lo que dificulta su despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jimmycarter/krea2-turbo-bbox
- Space de demostracion: https://huggingface.co/spaces/jimmycarter/krea2-turbo-bbox-canvas
- Documentacion del DSL (PROMPTING.md): referenciado en la model card, no se proporciona URL directa
- Noticia sobre el modelo: https://note.com/toshia_fuji/n/n4801152948c2?hl=en
- Documentacion de Krea-2 Turbo: https://www.krea.ai/docs/user-guide/features/krea-2-turbo
- Ficha de Krea-2 Turbo en Layer: https://www.layer.ai/models/krea-krea-2-turbo
