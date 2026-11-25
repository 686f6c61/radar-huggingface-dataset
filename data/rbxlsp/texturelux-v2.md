# RBXLSP/TextureLux-V2

## Resumen

TextureLux V2 es un adaptador de estilo de tipo DoRAN (DoRA + NaRA) desarrollado por RBXLSP para el modelo de difusion de imagenes MOSS-Image-Base de OpenMOSS-Team. No es un modelo autonomo, sino un conjunto de pesos de bajo rango que se aplican sobre el modelo base para potenciar la textura y el acabado visual en ilustraciones de estilo anime. Se distribuye como un unico repositorio de 0,3 GB con dos ficheros safetensors (pesos finales y pesos EMA) y esta pensado para ejecutarse en ComfyUI mediante un nodo personalizado.

El adaptador se entrena sobre 332 ilustraciones anime mas 25 imagenes de regularizacion, con 1.200 pasos y un rango de 32 con alpha 32, actuando sobre las proyecciones de atencion (`proj_q/k/v/o`) y las capas FFN (`proj_ffn_up_gate/down`). La innovacion principal es la combinacion de dos variantes de LoRA: NaRA, que hace variar el nucleo de bajo rango segun el nivel de ruido sigma del proceso de denoising, y DoRA, que descompone la actualizacion en magnitud y direccion. El resultado es un adaptador que mejora el detalle de tela, cabello, piel e iluminacion sin alterar en exceso la composicion del modelo base.

Es relevante para quienes trabajan con pipelines de generacion de imagen en ComfyUI y buscan un acabado mas rico en texturas para personajes anime, con un impacto controlado en escenas realistas. Su licencia Apache 2.0 y su naturaleza de adaptador lo hacen facil de integrar, aunque requiere un nodo especifico y no funciona con el cargador nativo de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRAN (DoRA + NaRA) sobre transformer de difusion MOSS-Image-Base |
| Parametros totales | no disponible (adaptador de bajo rango, rank 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | bf16 (pesos entrenados y exportados en bf16) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; la model card esta en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre MOSS-Image-Base, un modelo de difusion de imagen para text-to-image, y utiliza una arquitectura DoRAN que combina dos mecanismos. NaRA (Noise-aware Rank Adaptation) hace que el nucleo de bajo rango varie en funcion del nivel de ruido sigma en cada paso de denoising, modulando la contribucion del adaptador a lo largo del proceso de generacion. DoRA (Weight-Decomposed Low-Rank Adaptation) descompone la actualizacion en magnitud y direccion, normalizando la magnitud en fp32 tras cada calculo `BA·C(sigma)`. El adaptador se aplica sobre las proyecciones de atencion y las capas feed-forward del modelo base.

El entrenamiento se realizo durante 1.200 pasos con AdamW, learning rate 1e-4 (0,5x para la hiperred de NaRA), weight decay 1e-4, scheduler cosine, warmup de 60 pasos y gradient clipping de 1.0. El dataset consta de 332 ilustraciones anime y 25 imagenes de regularizacion, con descripciones en prosa de 553 a 1.278 caracteres (mediana 758), resolucion de 0,25 MP y longitudes de lado entre 907 y 10.704 px (mediana 1.216). Se uso inicializacion EVA con 90 batches, umbral de similitud 0,99 y precision fp32, ademas de una hiperred con codificacion Fourier de sigma (dim 64, escala 16), capas ocultas de 256/512 y `c_scale` 0,1. El dropout fue de 0,0 para modulos y 0,05 para texto, con EMA de 0,99 y precision bf16. El text encoder es Qwen3.5-9B en int8 convrot.

## Capacidades

- Aplicacion de estilo de textura sobre el modelo base MOSS-Image: mejora el detalle en ropa, cabello, piel e iluminacion de personajes anime.
- Generacion text-to-image condicionada por el modelo base, con prompts en lenguaje natural.
- Mejora de la estabilidad facial en personajes invertidos (cabezas abajo).
- Ligera mejora de la estabilidad de extremidades y de la iluminacion afectada por agua.
- Impacto reducido en escenas realistas (mantiene baja influencia fuera del dominio anime).
- No incluye tool calling, agentes ni capacidades multimodales propias; hereda las del modelo base.
- No dispone de trigger word: se controla mediante el parametro strength (0-1,5).

## Casos de uso

- Ilustracion de personajes anime en produccion: aplicar el adaptador con strength entre 0,6 y 1,0 sobre MOSS-Image-SFT para obtener acabados mas ricos en tela y cabello en encargos de ilustracion.
- Generacion de retratos con iluminacion compleja: usar el adaptador para reforzar el detalle de piel y reflejos en escenas con luz natural o artificial, especialmente en primeros planos.
- Escenas con agua o superficies reflectantes: aprovechar la mejora declarada en iluminacion afectada por agua para composiciones de playa, piscina o lluvia.
- Correccion de estabilidad en poses dificiles: emplear el adaptador en personajes invertidos o en angulos poco habituales para reducir deformaciones faciales.
- Prototipado rapido en ComfyUI: integrar el nodo `comfyui-moss-nara` en flujos existentes para comparar resultados con y sin adaptador mediante los pesos EMA y no EMA.
- Exploracion de estilo para estudios pequenos: al ser Apache 2.0 y de 0,3 GB, permite experimentar con bajo coste de almacenamiento y sin restricciones comerciales.
- Ajuste fino de la intensidad: usar strength bajo (0,2-0,5) en escenas realistas para mantener el estilo fotografico con una textura sutil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image-Base en bf16 y del adaptador (0,3 GB en disco).
- GPU recomendadas: no disponible; se requiere una GPU capaz de ejecutar MOSS-Image-Base en bf16.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del modelo base.
- Opciones de despliegue: ComfyUI con el nodo personalizado `RBkreb/comfyui-moss-nara` (no compatible con el cargador nativo de ComfyUI).
- Parametros de muestreo recomendados: sampler euler, CFG 2,5-4, uso de prompt negativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TextureLux V2 | Adaptador DoRAN sobre MOSS-Image-Base | rank 32 (adaptador) | no aplica | Apache 2.0 | Hugging Face, ComfyUI |
| LoRA estandar para difusion | Adaptador LoRA | variable | no aplica | variable | Amplia |
| Modelo base MOSS-Image-Base | Modelo de difusion text-to-image | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Ligera degradacion de texto e instrucciones: puede empeorar la representacion de texto y el seguimiento de prompts, especialmente con strength alto.
- Degradacion de UI y texto en pantalla: si el texto o la interfaz se deterioran demasiado, se recomienda reducir strength o no usar el adaptador.
- Dependencia del modelo base: solo funciona con MOSS-Image-Base y requiere un nodo de ComfyUI especifico; no es compatible con el cargador nativo.
- Dominio acotado: entrenado sobre ilustracion anime; su impacto en escenas realistas es bajo pero no nulo.
- Sin trigger word: el control se realiza unicamente mediante strength, lo que limita la precision del ajuste.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles inconsistentes en manos, texto y estructuras complejas.
- Sesgos: no se documentan sesgos especificos; al entrenarse con 332 ilustraciones anime, puede reproducir sesgos estilisticos y de representacion de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el nodo de ComfyUI pueden tener condiciones propias que deben verificarse.
- Idiomas: la model card esta en chino y no se documentan idiomas soportados para los prompts.

## Enlaces

- Hugging Face: https://huggingface.co/RBXLSP/TextureLux-V2
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Nodo ComfyUI: https://github.com/RBkreb/comfyui-moss-nara
- Entrenador: https://github.com/RBkreb/KohakuMossTrainer
