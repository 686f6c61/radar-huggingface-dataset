# aptech0081/H3-Character-Sheet-Creator

## Resumen

H3 Character Sheet Creator es un paquete de trabajo (workflow) para ComfyUI, publicado por el usuario aptech0081, que convierte entre 1 y 9 imágenes de referencia de un personaje en una hoja de personaje (character sheet) con varias vistas coherentes: ángulos de rostro, expresiones, cuerpo completo, detalles de vestuario o retratos frontal y de perfil. No es un modelo de pesos nuevos: el repositorio de 0,2 GB contiene el grafo JSON del workflow, imágenes de ejemplo, prompts y ajustes de reproducción, y se apoya en el modelo base `Comfy-Org/MiniMax-H3` para la generación image-to-image.

La propuesta es relevante para estudios pequeños y artistas técnicos porque estandariza una tarea que suele resolverse con prompts ad hoc: ofrece siete maquetas editables con índices 0 a 6, dos puntos de enlace de referencias (BIND 1 para la descripción textual del personaje y BIND 2 para asignar el rol de cada imagen de entrada) y un conjunto de diez ejemplos reproducibles con semillas fijas, resoluciones y prompts publicados.

El autor declara la etiqueta `base_model:finetune` sobre MiniMax-H3, pero el repositorio no distribuye pesos ni documenta la arquitectura del modelo subyacente. La licencia no está indicada, el idioma declarado es únicamente inglés y el repositorio registra 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio es un workflow de ComfyUI sobre el modelo base `Comfy-Org/MiniMax-H3`; no se documenta la arquitectura del modelo subyacente |
| Parametros totales | No disponible |
| Parametros activos | No aplica / no disponible (no se declara una arquitectura MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | Parcialmente documentado: los ejemplos usan el checkpoint `minimax_h3_ref2va_int8_convrot.safetensors` (INT8). No se enumeran otras variantes |
| Idiomas soportados | `en` (inglés), según la ficha y la model card |
| Licencia | No disponible |
| Formato de pesos | Pesos no incluidos en el repositorio (0,2 GB: JSON, PNG, TXT, CSV, JSON de metadatos). El checkpoint referenciado se distribuye como `.safetensors` |
| Pipeline | `image-to-image` |
| Libreria / runtime | `minimax-h3` sobre ComfyUI |
| Modelo base | `Comfy-Org/MiniMax-H3` |
| Referencias de entrada | De 1 a 9 imágenes |
| Maquetas disponibles | 7 (índices 0 a 6) |
| Nodos personalizados requeridos | 5 paquetes (enlazados en la guía del repositorio) |
| Fecha de creacion del repo | 2026-10-17 (según metadatos de HuggingFace) |
| Ultima actualizacion | 2026-10-17 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red ni sobre entrenamiento: el repositorio no contiene pesos y la model card no describe el funcionamiento interno de MiniMax-H3. Lo que sí está documentado es la topología del workflow: un grafo de ComfyUI que recibe las referencias, las enlaza mediante dos etapas de binding (BIND 1 para el prompt descriptivo del personaje y BIND 2 para asignar a cada imagen un rol, por ejemplo rostro y cabello), selecciona una de las siete maquetas por índice y compone el lienzo final con la forma de canvas elegida. La reproducibilidad depende de cinco paquetes de nodos personalizados, distribuidos en el repositorio de GitHub del autor.

Los ajustes de generación empleados en la batería de ejemplos están publicados y son concretos: 2,5 MP de resolución, 25 pasos, sampler ER-SDE, scheduler `simple`, CFG 1, DMAD 0,8 y sigma shift 16/2, con el checkpoint INT8 `minimax_h3_ref2va_int8_convrot.safetensors`. No se especifican tokens de entrenamiento, composición del dataset, ni si el modelo base usó RLHF, DPO u otro tipo de ajuste; la etiqueta `finetune` la declara el autor, pero no se aportan detalles del ajuste ni se publican los pesos resultantes.

## Capacidades

- Generación de hojas de personaje coherentes a partir de una o varias referencias faciales y corporales, en un rango de 1 a 9 imágenes de entrada.
- Siete maquetas predefinidas: cinco paneles (cuatro rostros y cuerpo completo), siete paneles (seis rostros y cuerpo completo), seis retratos de ángulos y expresiones, cinco paneles con detalle de vestuario, tres columnas (frontal, perfil y recorte de cuerpo) y dos retratos (frontal y perfil).
- Control de forma de lienzo: los ejemplos publicados usan 2464 × 1056 y 1984 × 1312 píxeles.
- Asignación explícita de roles por referencia (BIND 2), lo que permite separar la identidad facial del vestuario o del encuadre corporal.
- Reproducción determinista: cada ejemplo incluye semilla fija (27101 a 27110), prompt en texto plano y ajustes de muestreo.
- Integración en ComfyUI como grafo importable en formato JSON, encadenable con otros nodos del ecosistema.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni visión general; el alcance es generación de imágenes image-to-image.

## Casos de uso

- Preproducción de animación o serie: generar una hoja con cuatro ángulos de rostro y cuerpo completo a partir de un retrato aprobado, para que el equipo de layout tenga referencias consistentes antes de modelar o dibujar. La maqueta de cinco paneles y la resolución 2464 × 1056 encajan con este flujo.
- Diseño de personajes para videojuego indie: partir de un concepto y obtener vistas frontal, perfil y recorte de cuerpo con la maqueta de tres columnas, útiles como turnarounds para modelado 3D o para fichas de estilo.
- Ilustración editorial y cubiertas: fijar la identidad de un personaje recurrente en una serie de artículos o números, usando la misma referencia facial y variando vestuario y expresión entre maquetas.
- Cómic y novela gráfica: producir una hoja de expresiones (seis retratos) que sirva de guía de consistencia para un dibujante o para un pipeline de generación página a página.
- Documentación de vestuario y cosplay: emplear la maqueta de detalle de vestuario (cuatro rostros más un plano de cuello a pies) para registrar variantes de indumentaria de un mismo personaje.
- Pruebas de concepto y pitching: generar diez variantes de personaje con semillas distintas para presentar un reparto ante un cliente, reduciendo el tiempo frente a encargos manuales.
- Creación de assets para prototipos: integrar el JSON en un grafo mayor de ComfyUI que alimente directamente una carpeta de assets, con parámetros fijos de muestreo para mantener el estilo entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas automáticas (FID, CLIP-score, SSIM ni evaluaciones humanas cuantificadas) ni comparaciones numéricas con otros sistemas.

Los únicos datos cuantitativos publicados son los ajustes de reproducción de la batería de ejemplos:

| Ejemplo | Maqueta | Resolución | Semilla |
|---|---|---|---|
| Maya, fotógrafa de viajes | 5 paneles (4 rostros + cuerpo) | 2464 × 1056 | 27101 |
| Lin, piloto orbital | 7 paneles (6 rostros + cuerpo) | 2464 × 1056 | 27102 |
| Leila, arqueóloga | 6 retratos (ángulos y expresiones) | 1984 × 1312 | 27103 |
| Aoife, botánica victoriana | 5 paneles (4 rostros + vestuario) | 2464 × 1056 | 27104 |
| Ines, ceramista | 3 columnas (frontal, perfil, cuerpo) | 2464 × 1056 | 27105 |
| Julian, arquitecto | 5 paneles (4 rostros + cuerpo) | 2464 × 1056 | 27106 |
| Arjun, guardabosques | 7 paneles (6 rostros + cuerpo) | 2464 × 1056 | 27107 |
| Kenji, profesor jubilado | 6 retratos (ángulos y expresiones) | 1984 × 1312 | 27108 |
| Rowan, erudito fantástico | 2 retratos (frontal y perfil) | 1984 × 1312 | 27109 |
| Mateo, mecánico de naves | No disponible (la model card aparece truncada) | No disponible | 27110 |

Ajustes comunes declarados: 2,5 MP, 25 pasos, ER-SDE, scheduler `simple`, CFG 1, DMAD 0,8, sigma shift 16/2, checkpoint `minimax_h3_ref2va_int8_convrot.safetensors`. El autor indica que las hojas son salidas sin retocar y que los recortes de cuerpo en las maquetas 3 y 5 son intencionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La información proporcionada no incluye requisitos de memoria ni cifras de consumo.
- GPU recomendadas: no disponible. No se documenta ningún modelo de GPU concreto (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada. El único dato objetivo es que los ejemplos se generaron a 2,5 MP con 25 pasos sobre un checkpoint INT8, lo que reduce la huella frente a FP16, pero sin cifras publicadas no se puede garantizar que quepa en una GPU de consumo concreta.
- Opciones de despliegue: ComfyUI es el único entorno soportado, con cinco paquetes de nodos personalizados y el modelo base MiniMax-H3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión image-to-image.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni comparativas de velocidad.
- Almacenamiento: el repositorio ocupa 0,2 GB, pero los pesos de MiniMax-H3 se descargan aparte y su tamaño no se indica.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos en la información proporcionada. La comparación posible se limita al propio paquete frente al uso directo del modelo base:

| Elemento | Este repositorio | Comfy-Org/MiniMax-H3 (uso directo) |
|---|---|---|
| Tipo | Workflow de ComfyUI + ejemplos + prompts | Modelo base image-to-image |
| Parámetros | No disponible (no incluye pesos) | No disponible en la información proporcionada |
| Contexto / resolución | Canvas de 2464 × 1056 y 1984 × 1312 en los ejemplos; 2,5 MP | No disponible |
| Licencia | No disponible | No disponible en la información proporcionada |
| Idiomas | `en` | No disponible |
| Reproducibilidad | Semillas, prompts y ajustes publicados | Depende del usuario |
| Disponibilidad | 0 descargas, 1 like | Referenciado como base, no verificado |
| Alternativas equivalentes (otros workflows de hojas de personaje) | No disponible en la información proporcionada | No aplica |

## Limitaciones y advertencias

- No es un modelo: quien busque pesos para descargar y ejecutar sin más no los encontrará. El repositorio contiene un grafo JSON, imágenes y textos; el modelo base debe obtenerse por separado.
- Dependencia de cinco paquetes de nodos personalizados: sin ellos el workflow no se carga. Es un punto de fragilidad ante actualizaciones de ComfyUI o de los propios nodos.
- Licencia no declarada: no hay autorización explícita de uso comercial. Cualquier despliegue en producción o integración en un producto requiere contactar con el autor y verificar también la licencia de MiniMax-H3 y del checkpoint INT8 de terceros.
- Idioma: solo se declara inglés, tanto en la ficha como en los prompts de ejemplo. No hay evidencia de que los prompts en castellano funcionen igual de bien.
- Sin métricas de calidad: no hay evaluación cuantitativa de consistencia de identidad entre paneles ni de fidelidad a la referencia. La valoración se basa en diez ejemplos seleccionados por el autor.
- Riesgo de alucinación visual: como todo modelo generativo image-to-image, puede alterar rasgos faciales, edad, complexión o detalles de vestuario entre paneles; el propio autor señala recortes intencionados en dos maquetas, lo que indica que el encuadre no siempre es el esperado.
- Sesgos: no documentados. La batería de ejemplos cubre cinco mujeres y cinco hombres de estilos variados, pero no constituye un análisis de sesgo demográfico.
- Madurez del proyecto: 0 descargas y 1 like, creado y actualizado el mismo día. No hay señales de mantenimiento ni de comunidad.
- Model card incompleta: el texto disponible aparece truncado en el último ejemplo (Mateo), por lo que parte de la configuración de esa muestra no puede verificarse.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aptech0081/H3-Character-Sheet-Creator
- Descarga del workflow v1 (JSON): https://huggingface.co/aptech0081/H3-Character-Sheet-Creator/resolve/main/H3%20Character%20Sheet%20Creator%20v1.json?download=true
- Descarga de los 10 ejemplos: https://huggingface.co/aptech0081/H3-Character-Sheet-Creator/resolve/main/h3-character-sheet-samples-10.zip?download=true
- Repositorio GitHub y nodos personalizados: https://github.com/Jalen-Brunson/ComfyUI-H3-Character-Sheets
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Metadatos de los ejemplos (`metadata.json`): https://huggingface.co/aptech0081/H3-Character-Sheet-Creator/blob/main/metadata.json
- Índice de ejemplos (`examples.csv`): https://huggingface.co/aptech0081/H3-Character-Sheet-Creator/blob/main/examples.csv

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces anteriores proceden exclusivamente de la ficha de HuggingFace y de la model card.
