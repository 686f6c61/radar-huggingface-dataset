# MATLOWAI/H3-Dials

## Resumen

H3-Dials es una colección de archivos de direccionamiento (steering) de aproximadamente 14 KB cada uno, diseñados para el modelo de generación de vídeo MiniMax-H3. No se trata de un modelo en sí, sino de un conjunto de "dials" que permiten modificar el comportamiento de MiniMax-H3 en tiempo de inferencia sin necesidad de reentrenamiento. Cada dial representa una dirección en el espacio de prompts procesados del modelo base y actúa como un control deslizante: valores negativos empujan la generación hacia un extremo del par de prompts, mientras que los positivos la empujan hacia el otro.

El desarrollo corre a cargo de MATLOWAI y se integra en el ecosistema ComfyUI a través de los paquetes ComfyUI-MAINodes y ComfyUI-Dials. La propuesta resuelve un problema práctico: ajustar el estilo, el movimiento o el tono de un vídeo generado sin reentrenar el modelo ni modificar los pesos originales, simplemente cargando un archivo de pocos kilobytes y aplicándolo con una fuerza ajustable. Los dials se construyen a partir de pares de prompts contrastados y no requieren entrenamiento, lo que reduce drásticamente el coste de personalización.

El modelo base, MiniMax-H3, es un generador de vídeo de MiniMaxAI con capacidad de audio integrado, y H3-Dials actúa como una capa de control sobre él. La relevancia actual reside en que ofrece control fino y barato sobre la generación de vídeo, con soporte para curvas temporales que modulan la fuerza del dial a lo largo del clip.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Archivos de direccionamiento (steering) sobre MiniMax-H3; no es un modelo independiente |
| Parámetros totales | No disponible (los dials pesan ~14 KB cada uno; el modelo base no declara parámetros en la información disponible) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (dials y hooks); también archivos LoRA (`condition_proj` bias diff) |

## Arquitectura y entrenamiento

Los dials no son un transformer ni un modelo generativo autónomo. Son vectores de dirección calculados a partir de pares de prompts contrastados (por ejemplo, "quieto/posando/congelado" frente a "corriendo/saltando/moviéndose con energía") en el espacio de prompts procesados de MiniMax-H3. No hay entrenamiento: la dirección se extrae directamente de la diferencia entre las representaciones de ambos prompts. Cada dial se aplica como un hook posterior al refinador de texto de H3 o, en el caso de `h3_motion_lora.safetensors`, como un archivo LoRA que modifica el sesgo de `condition_proj`.

La innovación principal es el control temporal: en ComfyUI-MAINodes, cada dial puede seguir una curva de tiempo a lo largo del clip, de modo que su fuerza varíe fotograma a fotograma. El ejemplo documentado de `h3_impact_frame` a fuerza 4.5 muestra que mantener el valor constante durante todo el clip transforma la escena en un dibujo a tinta, mientras que aplicarlo como un pulso de 0.5 s en el momento del impacto produce unos seis fotogramas de siluetas negras en un estallido de tinta y luego devuelve la escena al dojo. Los pares de prompts están disponibles en `example_pairs/` y algunos dials declaran métricas de concordancia entre pares (por ejemplo, 0.78 para el dial de movimiento construido con 24 pares).

## Capacidades

- Control de movimiento: el dial `h3_motion` permite desde un movimiento casi congelado (valor −2, aproximadamente 0.05× del movimiento base) hasta un zoom generalizado (valor +2, aproximadamente 2.7× del movimiento base).
- Control de estilo y tono: el paquete "Villainy" ofrece ocho direcciones de maldad (siniestro, inquietante, frío, desquiciado, seductor, entre otras) con punto óptimo entre +1 y +2.
- Control de bordes en movimiento: `h3_blur_moving_edges_hook` permite pasar de bordes duros y nítidos (negativo) a bordes suaves y difuminados (positivo) en elementos en movimiento.
- Modulación temporal: cada dial puede seguir una curva de tiempo sobre el clip mediante el Dial Rack de MAINodes.
- Compatibilidad con LoRA: la variante `h3_motion_lora` se carga con el nodo estándar Load LoRA (model only) y produce aproximadamente 0.6× del efecto por unidad, requiriendo ~1.6× de fuerza para igualar al hook.
- Integración con ComfyUI: los dials se colocan en `ComfyUI/models/loras/dials/` y se aplican con Load Dial → Apply Dial o con una fila del Dial Rack.
- No requiere entrenamiento ni ajuste de pesos del modelo base.

## Casos de uso

- Ajuste de intensidad de movimiento en clips generados: aplicar `h3_motion` con valores negativos para obtener cinemagraphs o planos casi estáticos, o con valores positivos para escenas de acción con mayor dinamismo, sin regenerar el vídeo desde cero.
- Dirección de arte en postproducción: usar el dial de bordes (`h3_blur_moving_edges_hook`) para suavizar o endurecer los contornos de elementos en movimiento según el look deseado, con control fino mediante el valor del dial.
- Creación de atmósferas narrativas: aplicar los dials del paquete Villainy para inclinar una escena hacia tonos siniestros, inquietantes o fríos en proyectos de ficción, ajustando la fuerza entre +1 y +2 para evitar extremos.
- Efectos puntuales sincronizados: emplear curvas temporales con `h3_impact_frame` para insertar un estallido visual de pocos fotogramas en el momento de un impacto, manteniendo la escena original en el resto del clip.
- Iteración rápida en flujos ComfyUI: cargar varios dials en una misma fila del Dial Rack para combinar direcciones (por ejemplo, movimiento y tono) sobre un mismo render, reduciendo el número de generaciones necesarias para explorar variantes.
- Prototipado de estilos para clientes: generar una misma toma con distintos valores de un dial para presentar opciones de estilo o intensidad sin reentrenar ni duplicar el modelo base, gracias al reducido tamaño de los archivos (~14 KB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas cualitativas y de medición interna: el dial de movimiento declara una concordancia entre pares de 0.78 sobre 24 pares; el dial siniestro reporta un error de palabra de Whisper de 0.84 a fuerza +2 frente a 0.00 en base; y se documenta que un clip de Pika H3 Flex con de-rope tarda aproximadamente lo mismo que un render base de 25 pasos (unos 6 minutos a 1280×704 en una RTX PRO 6000 Max-Q).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los dials (son archivos de ~14 KB); depende del modelo base MiniMax-H3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: la model card menciona una RTX PRO 6000 Max-Q para renders de ejemplo a 1280×704; no se especifican otras GPU.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: ComfyUI con los paquetes ComfyUI-MAINodes o ComfyUI-Dials; los dials se colocan en `ComfyUI/models/loras/dials/`.
- Latencia y throughput: se documenta un render de Pika H3 Flex (6 pasos) con de-rope de aproximadamente 6 minutos a 1280×704 en una RTX PRO 6000 Max-Q, comparable a un render base de 25 pasos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (archivos de steering para generación de vídeo).

## Limitaciones y advertencias

- Los dials son experimentales y no están calibrados como controles precisos: el dial de bordes se describe explícitamente como "no un control calibrado de desenfoque de movimiento".
- Valores extremos pueden alterar la identidad del sujeto o desplazar el estilo hacia un render pictórico.
- El dial `h3_evil_sinister` tiende a romper el audio: la voz se degrada (error de palabra de Whisper de 0.84 a +2 frente a 0.00 en base).
- El dial `h3_evil_unhinged` inclina la escena hacia agresividad e intimidación incluso a +2; la model card advierte de su comportamiento.
- La pose, el tiempo y el estilo pueden cambiar con la aplicación de un dial, incluso en valores moderados.
- La licencia es la minimax-h3-community-license-agreement, cuyos términos para uso comercial no se detallan en la información disponible; es necesario consultar el enlace de licencia.
- No se declaran idiomas soportados ni sesgos conocidos en la información proporcionada.
- La fuerza recomendada es específica de cada dial y de cada configuración; los valores probados (como −6 en el dial de bordes) son sondas de prueba, no recomendaciones universales.

## Enlaces

- Hugging Face: https://huggingface.co/MATLOWAI/H3-Dials
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio ComfyUI-MAINodes: https://github.com/matlowai/ComfyUI-MAINodes
- Directorio de dials en MAINodes: https://github.com/matlowai/ComfyUI-MAINodes/tree/main/dials
- Guía de Dials: https://github.com/matlowai/ComfyUI-MAINodes/blob/main/dials/README.md
- Ejemplo simple: https://github.com/matlowai/ComfyUI-MAINodes/blob/main/examples/dials/dials_simple_pika_derope.json
- ComfyUI-Dials: https://github.com/matlowai/ComfyUI-Dials
- Páginas de Dials: https://matlowai.github.io/ComfyUI-Dials/
- Dials on a Curve: https://matlowai.github.io/ComfyUI-Dials/curves.html
- Lab: https://matlowai.github.io/ComfyUI-Dials/lab.html
- Word Dials: https://matlowai.github.io/ComfyUI-Dials/words.html
- First Frame: https://matlowai.github.io/ComfyUI-Dials/firstframe.html
- MOSS-Image: https://matlowai.github.io/ComfyUI-Dials/moss.html
- Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
