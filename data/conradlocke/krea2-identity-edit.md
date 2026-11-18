# conradlocke/krea2-identity-edit

## Resumen

Krea 2 Identity Edit V2 es un conjunto de dos LoRAs de edición de imagen construidos sobre el modelo base Krea 2 Raw, un transformer MMDiT de flujo único con 12.900 millones de parámetros. Lo desarrolla el autor independiente conradlocke como fine-tune comunitario no oficial, y resuelve dos tareas diferenciadas: la reinserción de una persona concreta en escenas, poses y vestuarios nuevos preservando su identidad facial, y la edición de imagen guiada por instrucciones en lenguaje natural (eliminar objetos, recolorear, cambiar fondos, reescribir texto en carteles, reestilizar).

El modelo llega en dos variantes de pesos: `krea2_identity_edit_v2.safetensors` para identidad y `krea2_general_edit_v2.safetensors` para edición general, además de versiones reducidas en rango (`r128` de 0,91 GB y `r64` de 0,46 GB) pensadas para entornos con poca VRAM. El repositorio ocupa 14,8 GB y acumula más de 275.000 descargas y 965 likes, lo que lo sitúa como una de las propuestas de edición de imagen más utilizadas en el ecosistema ComfyUI.

Su relevancia actual radica en dos factores: por un lado, aprovecha el acondicionamiento dual del modelo base (tokens VAE en contexto más codificación de imagen fundamentada con Qwen3-VL), lo que permite al LoRA razonar sobre la imagen de referencia y no solo copiar píxeles; por otro, introduce el denominado *reference placement*, que permite decidir si una referencia se ancla al layout de salida o se coloca junto a él. La licencia es restrictiva: uso personal y no comercial gratuito, con licencia comercial negociada caso por caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 Raw (MMDiT de flujo único, 12.900 millones de parámetros) |
| Parametros totales | No disponible (el LoRA se distribuye como safetensors; el modelo base tiene 12.900 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Versiones de rango reducido: r128 (0,91 GB) y r64 (0,46 GB); cuantizaciones del modelo base no especificadas |
| Idiomas soportados | No disponibles |
| Licencia | krea-2-identity-edit-v2-license (uso personal/no comercial gratuito; comercial bajo licencia del autor) |
| Formato de pesos | safetensors (LoRA), librería diffusers |
| Modelo base | krea/Krea-2-Raw |
| Tamano del repositorio | 14,8 GB |
| Nodos requeridos | comfyui-krea2edit >= 2.0.0 |
| Descargas / likes | 275.355 / 965 |

## Arquitectura y entrenamiento

El LoRA se aplica sobre Krea 2 Raw, descrito en la model card como un transformer MMDiT de flujo único con 12.900 millones de parámetros. La innovación técnica clave no reside en el LoRA en sí, sino en el esquema de acondicionamiento dual con el que fue entrenado: tokens VAE en contexto más una codificación de imagen fundamentada mediante Qwen3-VL. Este doble canal permite que el modelo reciba la referencia visual como contexto estructurado y no como mera concatenación de píxeles, lo que explica la mejora de fidelidad de identidad y de coherencia en la edición respecto a versiones anteriores.

El entrenamiento se realizó con la extensión `krea2edit-trainer`, un fork de ai-toolkit con geometría de tokens alineada con los nodos de ComfyUI, y el autor publica requisitos de VRAM medidos para GPU de consumo. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible. La versión V2 incorpora el *reference placement*, que expone dos entradas de nodo (`ref_position` para la última referencia y `ref_position_a` para la primera) con las opciones `aligned (trained)`, que ancla la referencia al layout de salida, y `beside (right of target)`, que la coloca junto al objetivo generado.

## Capacidades

- Reinserción de identidad: introducir a una persona de una fotografía en escenas, poses, ángulos de cámara, épocas y estaciones nuevas, tanto de cuerpo entero como en primer plano y desde detrás.
- Control de iluminación: luz de neón, flash directo, hora dorada, focos de escenario, luz de velas o subacuática, con la luz incidiendo de forma coherente sobre el rostro.
- Cambio de vestuario: el modelo viste a la persona según la descripción textual, y responde mejor cuando se indica qué prendas deben desaparecer además de las nuevas.
- Composición: añadir una persona a una escena existente o insertar varias personas secuencialmente en una foto de grupo.
- Hojas de personaje: generar una hoja de giros (turnaround) a partir de una foto, o una foto a partir de una hoja.
- Edición por instrucción (General Edit V2): eliminar objetos y personas, recolorear, cambiar la iluminación, cambiar la estación, sustituir fondos, añadir objetos, reescribir texto de carteles, cambiar vestuario, reestilizar (por ejemplo a anime) y convertir un conjunto en un flat lay de producto.
- Conservación de lo no editado: la edición general mantiene intactas las regiones que la instrucción no menciona.
- Colocación de referencias: elección por referencia entre anclaje al layout (`aligned`) o colocación lateral (`beside`), lo que permite fijar una escena y colocar a la persona con libertad.
- Integración en ComfyUI mediante el paquete de nodos `comfyui-krea2edit`, con soporte de modelo Turbo (8 pasos, CFG 1.0) y Raw (20 pasos, CFG 3.0).

## Casos de uso

- Retrato corporativo y branding personal: a partir de una única foto del empleado, generar variantes con fondos de oficina, iluminación de estudio y vestuario formal, manteniendo el parecido facial. El modo `aligned` con `ref_boost` 1–2 y 768 px de grounding conserva el encuadre original.
- Preproducción audiovisual y storyboards: colocar a un actor concreto en localizaciones descritas (una cumbre, un vagón de tren, una calle nocturna) para evaluar encaje de casting y continuidad visual antes del rodaje.
- Catálogo de moda y e-commerce: describir la prenda y el modelo viste a la persona de la referencia; la variante General Edit V2 convierte el conjunto en un flat lay de producto para fichas de catálogo.
- Composición de fotografía de grupo: insertar varias personas una tras otra en una imagen de grupo existente utilizando la colocación `beside` para las personas y `aligned` para la escena de fondo.
- Edición de material gráfico con texto: reescribir carteles y rótulos en imágenes de stock o mockups mediante instrucciones en lenguaje natural, útil en marketing y localización de creatividades.
- Limpieza y retoque de imágenes: eliminación de objetos o personas no deseadas en fotografías de inmuebles, productos o archivo, usando el modelo Raw a 20 pasos y CFG 3.0 para eliminaciones grandes.
- Generación de hojas de personaje para videojuegos o animación: producir un turnaround coherente desde una foto de referencia, o derivar una foto desde una hoja existente, acelerando la definición de personajes.
- Reestilización artística: convertir una fotografía a estilo anime u otros estilos preservando la composición y la identidad del sujeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de fidelidad de identidad (por ejemplo, similitud facial), de calidad de edición ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numérica en la información proporcionada; el autor publica requisitos medidos para GPU de consumo en el repositorio `krea2edit-trainer`.
- GPU recomendadas: no especificadas en la model card.
- Versiones de bajo consumo: `..._v2_r128.safetensors` (0,91 GB) y `..._v2_r64.safetensors` (0,46 GB) para ambos LoRAs, con calidad casi idéntica según el autor, pensadas para entornos con VRAM limitada.
- Cabe en GPU de consumo: sí, según la orientación del autor hacia GPU de consumo y las versiones de rango reducido; los modelos concretos no se detallan.
- Opciones de despliegue: ComfyUI con el paquete de nodos `comfyui-krea2edit` versión 2.0.0 o superior, obligatorio por el acondicionamiento dual. La librería declarada es diffusers, pero los nodos estándar no proporcionan el acondicionamiento necesario.
- Latencia y throughput: no disponibles. Como referencia de configuración, el modo Turbo opera a 8 pasos con CFG 1.0 y el modo Raw a 20 pasos con CFG 3.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Identity Edit V2 | LoRA de edición e identidad sobre Krea 2 Raw | Base de 12.900 M | No disponible | Personal/no comercial; comercial bajo licencia | Hugging Face, ComfyUI |
| Krea 2 General Edit V2 | LoRA de edición por instrucción sobre Krea 2 Raw | Base de 12.900 M | No disponible | Personal/no comercial; comercial bajo licencia | Hugging Face, ComfyUI |
| Krea 2 Raw | Modelo base MMDiT de flujo único | 12.900 M | No disponible | No disponible en la información proporcionada | Hugging Face (krea/Krea-2-Raw) |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva: el uso personal y no comercial es gratuito, pero el uso comercial requiere una licencia del autor negociada caso por caso; conviene revisar `LICENSE_V2.md` antes de cualquier despliegue en producción.
- Dependencia obligatoria de nodos: los LoRAs no funcionan con nodos estándar de ComfyUI; requieren `comfyui-krea2edit` >= 2.0.0 por el acondicionamiento dual (tokens VAE en contexto más codificación Qwen3-VL).
- Incompatibilidad entre LoRAs: Identity Edit V2 y General Edit V2 comparten linaje y cargarlos ambos a plena potencia rompe la imagen; debe usarse un LoRA por tarea.
- Sensibilidad al prompt: el encuadre tiende a copiar el recorte de la foto de referencia si no se especifica qué parte del cuerpo es visible; el vestuario de la referencia condiciona el resultado salvo que se indique explícitamente qué eliminar.
- Iluminación: las descripciones genéricas producen resultados menos fiables que las que indican dónde incide la luz.
- Configuración de CFG: con CFG > 1 es necesario fundamentar también el negativo (prompt vacío más la misma imagen).
- Sesgos conocidos: no documentados en la información disponible; al ser un fine-tune comunitario sobre un modelo base, hereda los sesgos de este, que tampoco se detallan.
- Riesgo de alucinación visual: no cuantificado; en edición por instrucción pueden aparecer artefactos o modificaciones no solicitadas, especialmente en eliminaciones grandes si no se usa el modo Raw.
- Idiomas: no disponibles; la calidad de las instrucciones en castellano no está documentada.
- Estado del proyecto: fine-tune no oficial, no afiliado ni respaldado por Krea.ai, Inc., con posibles cambios de API entre versiones de nodos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/conradlocke/krea2-identity-edit
- Licencia V2: https://huggingface.co/conradlocke/krea2-identity-edit/blob/main/LICENSE_V2.md
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Nodos ComfyUI: https://github.com/lbouaraba/comfyui-krea2edit
- Código de entrenamiento (krea2edit-trainer): https://github.com/lbouaraba/krea2edit-trainer
- Apoyo al autor (Ko-fi): https://ko-fi.com/conradlocke
