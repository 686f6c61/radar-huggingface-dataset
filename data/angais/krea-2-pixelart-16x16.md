# Angais/Krea-2-PixelArt-16x16

## Resumen

Krea 2 PixelArt 16x16 es una LoRA (adaptador de bajo rango) para el modelo de difusion de texto a imagen Krea 2, desarrollada por el usuario Angais. Su proposito es muy concreto: generar iconos de videojuego de 16x16 pixeles, con un unico objeto centrado por imagen, contorno oscuro, sombreado plano y fondo magenta plano (#FF00FF) que se elimina con un simple color key, incluidas las oquedades interiores de asas, anillos y bucles. Se entrena sobre krea/Krea-2-Raw y esta pensada para usarse en inferencia sobre krea/Krea-2-Turbo.

Tecnicamente es un adaptador de rango 32 y alpha 32, entrenado con ai-toolkit durante 1.000 pasos (unos 14 minutos en una H100) sobre un conjunto de 550 iconos sinteticos de 16x16 ampliados x32 sobre fondo magenta plano. El repo ocupa 0,2 GB y el peso se distribuye como un unico archivo safetensors que se carga con `load_lora_weights` de diffusers.

Es relevante para equipos de desarrollo de videojuegos y artistas de pixel art porque convierte un pipeline de difusion generalista en un generador reproducible de sprites con rejilla exacta: la salida a 512x512 es una cuadricula de bloques de 32x32, de modo que tomando el pixel central de cada bloque se obtiene el sprite de 16x16 con fondo ya recortable por color. La licencia es la Krea 2 Community License, con uso comercial restringido a empresas por debajo de 1 millon de dolares de ingresos anuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion de texto a imagen Krea 2; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible; el adaptador usa rango 32 y alpha 32, y el repositorio completo ocupa 0,2 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generacion de imagen; no se especifica la ventana del codificador de texto) |
| Tipos de cuantizacion | No se listan variantes cuantizadas; el adaptador se distribuye en safetensors y el modelo base se emplea en bf16 |
| Idiomas soportados | en |
| Licencia | krea-2-community-license (Krea 2 Community License Agreement) |
| Formato de pesos | safetensors (`krea-2-pixelart-16x16.safetensors`), cargable con diffusers |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 sobre Krea 2. El entrenamiento se hizo con ai-toolkit, partiendo de Krea 2 Raw en bf16, con resolucion de 512x512, batch de 2, optimizador AdamW de 8 bits, learning rate 1e-4, perdida de flow matching y 1.000 pasos, lo que supone aproximadamente 14 minutos en una unica H100. No se especifica en la informacion disponible ningun mecanismo adicional como decodificacion especulativa o atencion lineal, ni se detalla la arquitectura interna del modelo base.

El conjunto de datos es Angais/krea-2-pixelart-16x16-synthetic, con 550 iconos de 16x16 pixeles bajo licencia CC0. Cada icono se amplio x32 mediante vecino mas cercano sobre un fondo magenta plano y se etiqueto con el prompt que lo habia generado, lo que da lugar a un prompt de instancia del estilo "pixel art 16x16 game icon". La innovacion practica del adaptador no esta en la arquitectura, sino en el formato de salida: al fijar la rejilla sobre bloques de 32x32 y reservar el magenta como color de fondo, el recorte del sprite y la transparencia se resuelven con una operacion determinista de remuestreo y umbral de color, sin necesidad de segmentacion.

## Capacidades

- Generacion de iconos de videojuego en pixel art de 16x16 pixeles, un objeto por imagen y centrado.
- Estilo consistente: contorno oscuro y sombreado plano, con salida sobre fondo magenta plano (#FF00FF) pensado para color key.
- Recorte exacto de sprites: la salida a 512x512 es una rejilla de bloques de 32x32; tomando el pixel central se obtiene el sprite de 16x16.
- Generacion de transparencia real en oquedades interiores de asas, anillos y bucles (13 de 80 renders medidos).
- Generalizacion a objetos no vistos en el entrenamiento: en las pruebas del autor, objetos como muneco de nieve, ancla, caballo de ajedrez, sushi, helado, casco espacial o tetera funcionan de forma comparable a los objetos entrenados.
- Seguimiento de un prompt plantilla concreto: "pixel art 16x16 game icon, \<objeto y detalles\>, dark outline, plain magenta background".
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento. Es un modelo exclusivamente de texto a imagen.

## Casos de uso

- Generacion de iconos de inventario para videojuegos: se puede producir un conjunto coherente de sprites de objetos (llaves, pociones, monedas, armas) con el mismo estilo y fondo recortable, a partir de un prompt por objeto.
- Prototipado rapido de assets: en fases de preproduccion, un equipo puede generar decenas de iconos de 16x16 en minutos para evaluar la direccion artistica antes de encargar el arte final.
- Automatizacion de pipelines de contenido: el recorte por color key y el remuestreo a 16x16 son deterministas, por lo que se pueden integrar en un script de CI o en una herramienta interna que genere sprites por lotes sin intervencion manual.
- Ampliacion de atlas de sprites existentes: dado un conjunto de objetos ya definidos por el equipo, la LoRA permite generar variantes (versiones oxidadas, con cinta, de distintos materiales) manteniendo la rejilla y el estilo.
- Assets para juegos con licencia permisiva en el rango de ingresos permitido: estudios pequenos, por debajo del umbral de 1 millon de dolares de ingresos anuales, pueden usar el adaptador comercialmente segun la Krea 2 Community License.
- Herramientas de creacion asistida para game jams: al necesitar solo 8 pasos de inferencia (6 tambien funciona) y guidance 0 sobre Krea 2 Turbo, encaja en flujos de trabajo con recursos limitados y tiempos de generacion bajos.
- Preservacion de estilo en secuelas o packs de contenido descargable: el prompt plantilla fijo y el fondo magenta constante permiten reutilizar exactamente el mismo proceso de post-procesado en lotes futuros.

## Benchmarks y rendimiento

El autor publica metricas propias medidas sobre 80 renders no curados (64 prompts variados mas 16 objetos de prueba, 7 de ellos ausentes del conjunto de entrenamiento):

| Metrica | Resultado |
|---|---|
| Fondos eliminados limpiamente por color key | 79 / 80 |
| Distancia mediana del color de fondo respecto a #FF00FF | 5 / 255 |
| Renders con oquedades interiores visibles (asas, anillos) | 13 / 80 |
| Pureza de rejilla (proporcion de cada bloque de 32x32 de un solo color), mediana | 0,989 |

No se han publicado resultados de benchmarks estandar (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, algo esperable al tratarse de un modelo de generacion de imagen.

## Requisitos de hardware

- VRAM estimada: no disponible. La informacion proporcionada no indica el tamano del modelo base Krea 2 ni sus requisitos de memoria en inferencia.
- Entrenamiento documentado: Krea 2 Raw en bf16, 512x512, batch 2, 1.000 pasos, completado en unos 14 minutos sobre una H100.
- Cabe en GPU de consumo: no confirmado en la informacion disponible. El adaptador en si ocupa 0,2 GB, pero el coste real lo determina el modelo base, cuyos requisitos no se detallan.
- Opciones de despliegue: diffusers, mediante `Krea2Pipeline.from_pretrained("krea/Krea-2-Turbo", torch_dtype=torch.bfloat16)` seguido de `load_lora_weights`. El entrenamiento se realizo con ai-toolkit. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un pipeline de difusion de imagen en este formato.
- Parametros de inferencia recomendados por el autor: 512x512, 8 pasos (6 tambien funciona) y guidance 0.
- Latencia y throughput: no disponibles; solo se documenta el tiempo de entrenamiento, no el de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolucion de trabajo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Angais/Krea-2-PixelArt-16x16 | LoRA sobre Krea 2 (rango 32 / alpha 32) | 512x512 de salida, rejilla de 16x16 sprites | krea-2-community-license | HuggingFace, diffusers |
| krea/Krea-2-Raw | Modelo base de texto a imagen | No disponible | krea-2-community-license | HuggingFace |
| krea/Krea-2-Turbo | Modelo base de texto a imagen (variante turbo) | No disponible | krea-2-community-license | HuggingFace |

No se dispone en la informacion proporcionada de datos comparativos con otras LoRAs de pixel art, ni de resultados de rendimiento de alternativas con los que contrastar las metricas del autor. Las cifras de la tabla de benchmarks son mediciones propias del autor sobre su propio conjunto de 80 renders, no comparaciones externas.

## Limitaciones y advertencias

- Solo genera iconos de 16x16: un unico objeto, centrado, sin escenas ni personajes en poses.
- El magenta esta reservado para el fondo, por lo que no se deben pedir objetos de color magenta puro.
- Los colores a veces salen mas oscuros de lo solicitado; el propio autor pone el ejemplo de una "oveja verde esmeralda" que puede aparecer en verde oscuro.
- Las metricas publicadas proceden de 80 renders no curados y de un conjunto de entrenamiento de solo 550 imagenes sinteticas, lo que limita la variedad de estilos y objetos cubiertos.
- No se han publicado evaluaciones independientes ni comparaciones con otras LoRAs de pixel art.
- Las salidas son generadas por IA; donde la ley o la politica de la plataforma lo exija, debe declararse esa circunstancia al publicarlas.
- Licencia: es un derivado de Krea 2 y se distribuye bajo la Krea 2 Community License Agreement. El uso comercial solo esta permitido a empresas por debajo de 1 millon de dolares de ingresos anuales; conviene leer el acuerdo completo y la Krea Acceptable Use Policy antes de cualquier uso comercial.
- El proyecto no es un producto oficial de Krea ni cuenta con su respaldo.
- Sesgos conocidos: no documentados de forma especifica en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Angais/Krea-2-PixelArt-16x16
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante usada en inferencia: https://huggingface.co/krea/Krea-2-Turbo
- Dataset de entrenamiento (550 iconos sinteticos 16x16, CC0): https://huggingface.co/datasets/Angais/krea-2-pixelart-16x16-synthetic
- Texto de la licencia (Krea 2 Community License Agreement): https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
- Politica de uso aceptable de Krea: https://www.krea.ai/krea-2-use-policy
- Archivo NOTICE del repositorio: disponible en el propio repositorio de HuggingFace
- Los resultados de la busqueda web recibidos no guardan relacion con este modelo (corresponden a la clase Ranger de Divinity: Original Sin) y se han descartado.
