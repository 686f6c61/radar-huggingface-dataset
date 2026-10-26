# aoleg/MOSS-Sharpness-Slider

## Resumen

MOSS-Sharpness-Slider es un adaptador LoRA de tipo "concept slider" para el modelo de difusion texto-a-imagen MOSS-Image, publicado por el usuario aoleg en Hugging Face. No es un modelo generativo autonomo: es un ajuste de bajo rango que se carga sobre OpenMOSS-Team/MOSS-Image-Base (o su variante SFT) y que modifica un unico atributo perceptual de la imagen generada, la nitidez, en funcion de la fuerza del LoRA. Con fuerza positiva la imagen se percibe mas enfocada; con fuerza negativa se difumina. No requiere palabra de activacion ni cambios en el prompt.

Su relevancia practica esta en el control fino de un parametro que normalmente solo se puede tocar a posteriori con herramientas de postproceso o reescribiendo el prompt. Al ser un adaptador de ~0,1 GB, el coste de almacenamiento y de VRAM adicional es marginal frente al modelo base, y permite separar el control de nitidez del resto de la direccion semantica del prompt.

El autor lo entreno con el proceso `concept_slider` de Ostris AI Toolkit sobre MOSS-Image Base en int8 "convrot", usando un dataset de solo 72 fotografias emparejadas con su version desenfocada por gaussiano a 1024 px. La ficha no publica numero de parametros del adaptador, resultados de benchmarks ni especificaciones del modelo base, por lo que los apartados correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; direccion de concepto aprendida mediante el proceso `concept_slider` |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB, incluyendo los pesos del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusion condicionado por prompt de texto) |
| Tipos de cuantizacion | no disponible; el autor indica que el entrenamiento se hizo sobre MOSS-Image Base en int8 "convrot", pero el adaptador no se distribuye en variantes cuantizadas |
| Idiomas soportados | no disponibles; todos los prompts de ejemplo de la model card estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | no especificado en la model card; libreria `diffusers`, plantilla `diffusion-lora` |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base (compatible tambien con la variante SFT) |
| Tipo de pipeline | text-to-image |
| Palabra de activacion | ninguna (el autor lo indica explicitamente) |
| Rango de fuerza | 1.0 para maxima nitidez, -1.0 para maximo desenfoque, 0 = modelo sin modificar |
| Resolucion de entrenamiento | 1024 px |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

El adaptador se construye como un LoRA convencional inyectado en las capas del transformer de difusion de MOSS-Image. La innovacion no esta en la topologia del adaptador, sino en la metodologia de entrenamiento: se emplea el proceso `concept_slider` de Ostris AI Toolkit, en el que la direccion del concepto no se aprende de un dataset etiquetado de forma supervisada, sino de un par de prompts contrapuestos. El par utilizado fue "a sharp photo, perfectly in focus, crisp fine detail, clear edges" como prompt positivo y "a blurry photo, blurred, out of focus, ..." como negativo. El dataset solo aporta latentes en ambos extremos del rango: 72 fotografias y las mismas 72 fotografias con desenfoque gaussiano aplicado, a 1024 px y sin captions personalizados (se usaron las etiquetas por defecto "sharp, in focus" y "blurry, out of focus").

El entrenamiento se ejecuto sobre MOSS-Image Base en cuantizacion int8 "convrot". El resultado es un eje de control unidimensional: sumar el delta del LoRA con fuerza positiva empuja la generacion hacia el extremo nitido del espectro, y restarlo la empuja hacia el extremo desenfocado, sin necesidad de modificar el texto del prompt. La model card no documenta el numero de pasos, el learning rate, el rango del LoRA ni el numero de tokens o imagenes vistas, por lo que esos hiperparametros quedan como no disponibles.

## Capacidades

- Control continuo de nitidez percibida en imagenes generadas, ajustable mediante la fuerza de aplicacion del LoRA sin tocar el prompt.
- Efecto bidireccional: valores positivos anaden definicion de bordes y microdetalle; valores negativos introducen desenfoque progresivo.
- Compatibilidad con MOSS-Image Base y con MOSS-Image SFT, segun indica el autor.
- Ausencia de palabra de activacion, lo que permite apilarlo con otros LoRA o con prompts complejos sin contaminarlos con un token extra.
- Composicion con otros adaptadores del mismo ecosistema (por ejemplo, LoRA de estilo como MOSS-Image-Kodachrome del mismo autor) para combinar estetica y nitidez.
- No ofrece tool calling, razonamiento multi-paso, capacidades de agente ni procesamiento de audio o video: es exclusivamente un adaptador de generacion de imagen.
- Capacidades multilingues: no documentadas; el condicionamiento textual depende del codificador de texto del modelo base.

## Casos de uso

- Produccion publicitaria con control de nitidez por lote: en un pipeline que genere variantes de un producto, aplicar fuerza 0.6-1.0 a las tomas que deban leerse como fotografia comercial nitida y fuerza negativa a los fondos que deban quedar fuera de plano, todo con el mismo prompt.
- Simulacion de optica fotografica: reproducir el comportamiento de un objetivo a plena apertura (fondo desenfocado, sujeto nitido) combinando fuerza negativa global con regiones o variantes donde se aplique fuerza positiva, sin recurrir a mascaras de postproceso.
- Generacion de parejas nitido/desenfocado para datasets: el adaptador produce de forma controlada el mismo concepto en ambos extremos, lo que facilita construir corpus sinteticos para entrenar modelos de deblurring, deteccion de foco o evaluacion de calidad de imagen.
- Restauracion estetica de estilo retro: junto al LoRA MOSS-Image-Kodachrome del mismo autor, usar fuerza positiva para recuperar la nitidez caracteristica del gran formato y evitar que el look vintage derive en imagenes blandas.
- Direccion de arte en ilustracion: para estilos pictorialistas o de ensueno, fuerza negativa entre -0.5 y -1.0 permite suavizar un render excesivamente nitido y homogeneizar su integracion en una composicion.
- Ajuste de coherencia en series de imagenes: al fijar el prompt y variar solo la fuerza del slider, se generan series con identico contenido semantico y distinto grado de definicion, utiles para pruebas A/B de percepcion de calidad con usuarios.
- Integracion en flujos de ComfyUI o diffusers: al ser un LoRA estandar, se puede cargar como nodo o como `pipe.load_lora_weights` y exponer la fuerza como parametro de una API interna de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, SSIM, LPIPS) ni comparaciones cuantitativas con otros adaptadores. Las unicas evidencias son las imagenes de ejemplo del widget, generadas con el modelo base en int8 "convrot".

## Requisitos de hardware

- VRAM para inferencia: la del modelo base MOSS-Image-Base, que no se especifica en la informacion disponible; el adaptador anade un delta despreciable (repositorio de 0,1 GB).
- GPU recomendadas: no disponibles para el modelo base; al tratarse de un adaptador, la GPU debe ser suficiente para MOSS-Image-Base en la precision elegida.
- Ajuste en GPU de consumo: depende integramente del modelo base y de su cuantizacion; el LoRA en si no cambia el requisito.
- Opciones de despliegue: `diffusers` (carga estandar de LoRA), ComfyUI (nodos de LoRA con control de fuerza), y cualquier runner que soporte LoRA de difusion; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; el slider no introduce pasos de muestreo adicionales, solo modifica los pesos durante la inferencia, por lo que el coste por imagen deberia ser practicamente identico al del modelo base.
- Almacenamiento: 0,1 GB adicionales sobre el checkpoint base.

## Comparativa con modelos similares

| Modelo | Tipo | Funcion | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aoleg/MOSS-Sharpness-Slider | LoRA concept slider | Control de nitidez/desenfoque | OpenMOSS-Team/MOSS-Image-Base | apache-2.0 | Hugging Face |
| aoleg/MOSS-Image-Kodachrome | LoRA de estilo | Emula color, curva de contraste y nitidez del film Kodachrome 4x5 de los anos 40 | MOSS-Image | no disponible en la informacion proporcionada | Hugging Face |
| MOSS Bold Line (v1.0) | LoRA slider | Engrosa las lineas en el lineart generado con MOSS-Image | MOSS-Image | no disponible en la informacion proporcionada | Civitai |

La diferencia frente a Kodachrome es de proposito: aquel es un LoRA de estilo que arrastra color, contraste y nitidez de forma conjunta, mientras que Sharpness-Slider aisla una sola dimension perceptual. Frente a Bold Line, el eje de control es distinto (grosor de trazo frente a foco). No se dispone de datos cuantitativos para comparar la calidad de ninguno de los tres.

## Limitaciones y advertencias

- Entrenado con solo 72 imagenes; el eje de control puede generalizar de forma irregular fuera de los dominios fotograficos representados (retratos, escenas de epoca, interiores).
- Fuerzas altas en el extremo positivo pueden producir sobreenfoque, halos en los bordes, aumento de ruido y artefactos de tipo "sharpening" digital, en lugar de nitidez optica real.
- El extremo negativo tiende a un desenfoque gaussiano uniforme, que no replica el bokeh optico ni el desenfoque de movimiento.
- Al no usar palabra de activacion, el efecto se aplica globalmente y puede interferir con otros LoRA cargados simultaneamente; el autor no documenta el comportamiento en composicion.
- Entrenado a 1024 px; no hay datos sobre su comportamiento a otras resoluciones o relaciones de aspecto.
- La direccion del concepto esta definida por prompts en ingles; no se documenta el comportamiento con prompts en castellano u otros idiomas.
- Licencia del adaptador apache-2.0, pero el uso comercial esta condicionado por la licencia del modelo base OpenMOSS-Team/MOSS-Image-Base, no disponible en la informacion proporcionada; conviene verificarla antes de desplegar.
- Modelo con 0 descargas y 1 like: no hay evidencia de uso en produccion ni validacion independiente.
- Riesgo de alucinacion estructural propio del modelo base (anatomias incorrectas, texto ilegible en la imagen); el slider no corrige ni agrava ese problema de forma documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoleg/MOSS-Sharpness-Slider
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- LoRA de estilo del mismo autor (MOSS-Image-Kodachrome): https://huggingface.co/aoleg/MOSS-Image-Kodachrome
- Ostris AI Toolkit (herramienta de entrenamiento con el proceso `concept_slider`): https://github.com/ostris/ai-toolkit
- MOSS Bold Line v1.0 en Civitai (referencia de otro slider para MOSS-Image): https://civitai.com/models/3020444/mossboldline-v10
- Hilo de Reddit sobre sliders y edicion por tiles en MOSS-Image: https://www.reddit.com/r/comfyui/
