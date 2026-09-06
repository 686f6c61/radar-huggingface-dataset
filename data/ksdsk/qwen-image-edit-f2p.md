# ksdsk/Qwen-Image-Edit-F2P

## Resumen

Qwen-Image-Edit-F2P es un adaptador LoRA de bajo rango que se apoya sobre el modelo base Qwen-Image-Edit, desarrollado por Qwen. El objetivo es convertir una imagen de un rostro recortado en un retrato completo de la misma persona, manteniendo la identidad facial. Es decir, a partir de un crop facial, el modelo genera una fotografía de cuerpo entero o de medio cuerpo con la cara del sujeto original integrada en un contexto nuevo.

El modelo ha sido publicado por el usuario ksdsk (asociado a DiffSynth-Studio) bajo licencia Apache 2.0, y se distribuye como un archivo de pesos safetensors de 1.4 GB. Al ser un LoRA, no es un modelo independiente: requiere cargar Qwen-Image-Edit como modelo base y después inyectar el adaptador. La integración está pensada para el ecosistema DiffSynth-Studio, aunque también puede utilizarse con la librería diffusers de Hugging Face. Su relevancia actual radica en la creciente demanda de herramientas de generación y edición de retratos con control de identidad, especialmente en aplicaciones de contenido personalizado, avatares y fotografía generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Qwen-Image-Edit, modelo de difusion de imagenes |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusion para imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre Qwen-Image-Edit, un modelo de edicion de imagenes de la familia Qwen-Image. Qwen-Image-Edit esta compuesto por un transformer de difusion, un codificador de texto y un VAE, y se carga en precision bfloat16. El adaptador F2P esta entrenado para condicionar la generacion de un retrato completo a partir de una imagen de entrada que contiene exclusivamente la cara del sujeto. El codigo de inferencia proporcionado por el autor muestra que se carga el transformer del modelo Qwen-Image-Edit y los componentes de texto y VAE de Qwen-Image, y despues se inyecta el LoRA en el transformer. El entrenamiento de este adaptador no esta documentado en la informacion disponible: no se especifica el numero de tokens, la composicion del dataset ni si se utilizaron tecnicas de RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica mas alla del propio ajuste por LoRA para la tarea de face-to-portrait.

## Capacidades

- Generacion de retratos completos a partir de un recorte facial, preservando los rasgos de identidad de la persona.
- Generacion de multiples variantes del mismo rostro usando distintas semillas y prompts, lo que permite explorar diferentes contextos, ropa o fondos.
- Control por texto: el modelo acepta un prompt para describir la escena deseada (por ejemplo, "una joven con vestido amarillo en un campo de flores").
- Integracion con DiffSynth-Studio y con la libreria diffusers de Hugging Face.
- El codigo de ejemplo incluye una utilidad de auto-recorte de caras basada en InsightFace, que facilita el preprocesado de imagenes.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagenes.

## Casos de uso

- Creacion de retratos profesionales para redes sociales: a partir de una selfie recortada, el modelo genera una fotografia con vestuario y fondo nuevos, ideal para perfiles de LinkedIn o portafolios.
- Generacion de avatares para videojuegos: permite usar la cara del jugador como base para crear personajes en distintos entornos o estilos visuales, manteniendo la identidad facial.
- Ilustracion de novelas o comics: un ilustrador puede generar multiples representaciones de un personaje ficticio usando siempre la misma cara, lo que facilita la coherencia visual en una obra larga.
- Restauracion y modernizacion de fotografias antiguas: recortando la cara de una foto historica, el modelo puede producir una version contemporanea del retrato con iluminacion y resolucion actuales.
- Marketing personalizado: una agencia puede generar fotos de clientes en diferentes escenarios (playa, oficina, evento) para campañas publicitarias sin necesidad de una sesion fotografica completa.
- Prototipado rapido en estudios de diseno: los equipos creativos pueden generar conceptos visuales de un rostro en multiples poses y contextos para evaluar ideas antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Se requiere una GPU compatible con CUDA para ejecutar el codigo de ejemplo, que carga el modelo en bfloat16.
- El repositorio del adaptador tiene un tamano de 1.4 GB, pero el modelo base Qwen-Image-Edit requiere un espacio y VRAM adicionales; el dato exacto de VRAM no esta disponible.
- No se especifican GPUs recomendadas ni requisitos de memoria.
- Opciones de despliegue conocidas: DiffSynth-Studio, Hugging Face diffusers y ModelScope.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha facilitado informacion sobre otros LoRAs o modelos de face-to-portrait comparables en la documentacion consultada.

## Limitaciones y advertencias

- El modelo depende de la calidad de la imagen facial recortada: caras en baja resolucion, con angulos extremos u ocluidas pueden producir resultados deficientes.
- Existe riesgo de alucinacion visual: el generador puede anadir detalles faciales o del fondo que no estan presentes en la imagen original, especialmente si el prompt es ambiguo.
- No se han publicado datos sobre sesgos etnicos, de genero o de edad, por lo que el comportamiento en poblaciones diversas no esta verificado.
- La licencia Apache 2.0 aplica al adaptador, pero el modelo base Qwen-Image-Edit puede tener condiciones de uso adicionales que se deben revisar antes de un despliegue comercial.
- No es un modelo multimodal de lenguaje: no puede responder texto ni ejecutar funciones; su unica funcion es la generacion de imagenes.
- No se documenta el proceso de entrenamiento ni los datos utilizados, lo que limita la trazabilidad y la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/ksdsk/Qwen-Image-Edit-F2P
- Hugging Face (DiffSynth-Studio): https://huggingface.co/DiffSynth-Studio/Qwen-Image-Edit-F2P
- ModelScope: https://www.modelscope.ai/models/DiffSynth-Studio/Qwen-Image-Edit-F2P
- Repositorio DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio.git
- Modelo base Qwen-Image-Edit: https://www.modelscope.cn/models/Qwen/Qwen-Image-Edit
