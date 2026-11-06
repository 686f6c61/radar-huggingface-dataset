# ijgvt/krea-2-dark-fantasy-illustration-style

## Resumen

Krea 2 Dark Fantasy Illustration Style es un LoRA de estilo para el modelo de generacion de imagenes Krea 2 Turbo, publicado por el usuario ijgvt en Hugging Face. No se trata de un modelo completo, sino de un adaptador de bajo rango que modifica el comportamiento estetico del modelo base para producir ilustraciones de fantasia oscura con rasgos muy definidos: bloques geometricos, composicion de vidriera, geometria art deco, paletas desaturadas y contrastes de luz y sombra marcados.

El adaptador se entrena sobre Krea 2 Turbo, un modelo de difusion text-to-image que emplea Qwen3-VL-4B como codificador de texto y el VAE de Qwen-Image, segun los requisitos de despliegue indicados en la model card. El LoRA se entreno con AI-Toolkit 1.18.9 durante 2000 pasos y 53 epocas sobre un conjunto de solo 25 imagenes etiquetadas en chino, lo que lo convierte en un ejemplo de ajuste estilistico de bajo coste y alta especificidad.

Su relevancia es practica para ilustradores y desarrolladores que necesiten un look concreto sin reentrenar el modelo base: basta con cargar el LoRA en ComfyUI mediante `LoraLoaderModelOnly` y anteponer un prefijo de estilo fijo al prompt. La licencia derivada de Krea 2 Community License impone obligaciones adicionales para uso comercial y despliegue publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 Turbo, modelo de difusion text-to-image |
| Parametros totales | no disponible (el repo ocupa 0.2 GB; el LoRA no publica recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen; el codificador de texto es Qwen3-VL-4B) |
| Tipos de cuantizacion | no disponible (se distribuye en SafeTensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | zh, en |
| Licencia | krea-2-community-license (derivada de Krea 2 Community License Agreement) |
| Formato de pesos | SafeTensors (LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA para Krea 2 Turbo, un modelo de difusion text-to-image. El pipeline de inferencia indicado en la model card requiere el UNET de Krea 2 Turbo, el codificador de texto Qwen3-VL-4B y el VAE de Qwen-Image. El LoRA se aplica exclusivamente al UNET mediante `LoraLoaderModelOnly` en ComfyUI, con una intensidad recomendada de 0.9 a 1.1.

El entrenamiento se realizo con AI-Toolkit 1.18.9 durante 2000 pasos y 53 epocas sobre 25 imagenes etiquetadas en chino, con resolucion de 1024 en buckets de area. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un ajuste supervisado puramente estilistico. La innovacion principal es la eficiencia: un conjunto de datos minimo y un entrenamiento corto bastan para imprimir un lenguaje visual coherente, aunque el autor advierte que el trigger aislado `prismarcana` no activa el estilo de forma fiable y recomienda un prefijo completo con descriptores en chino.

## Capacidades

- Generacion de imagenes text-to-image con estetica de fantasia oscura: bloques geometricos, vidrieras, art deco y bajo contraste de saturacion.
- Transferencia de estilo sobre sujetos diversos: personas, animales, arquitectura y vehiculos, segun los ejemplos de preview.
- Control de intensidad del estilo mediante la fuerza del LoRA (rango recomendado 0.9-1.1).
- Compatibilidad con prompts en chino e ingles; el entrenamiento se hizo con etiquetas en chino.
- Integracion en ComfyUI mediante `LoraLoaderModelOnly`.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es un adaptador de imagen.

## Casos de uso

- Ilustracion editorial de fantasia oscura: el LoRA aplica un lenguaje visual coherente (vidrieras, geometria, paleta desaturada) a portadas y articulos, reduciendo el trabajo de direccion de arte por imagen.
- Concept art para videojuegos: generar variaciones de personajes, criaturas y entornos con una estetica unificada antes de pasar a modelado, usando el prefijo de estilo fijo para mantener consistencia entre assets.
- Generacion de assets para tableros y juegos de rol: producir cartas, escenarios y retratos con un look comun a partir de descripciones breves, gracias a la transferencia de estilo sobre sujetos muy distintos.
- Prototipado rapido de direccion artistica: comparar el estilo `prismarcana` con otras variantes sobre el mismo prompt para elegir una linea visual antes de invertir en produccion.
- Ilustracion de contenido narrativo: acompanar relatos, novelas o modulos de campana con imagenes que compartan atmosfera, aprovechando la baja saturacion y el contraste dramatico.
- Exploracion creativa en ComfyUI: encadenar el LoRA con otros nodos de control (por ejemplo, para composicion) y ajustar la fuerza entre 0.9 y 1.1 para modular cuanto pesa el estilo frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del modelo base Krea 2 Turbo, del codificador Qwen3-VL-4B y del VAE de Qwen-Image. El LoRA en si ocupa 0.2 GB.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el cuello de botella es el modelo base completo, no el adaptador.
- Opciones de despliegue: ComfyUI es el flujo documentado (UNET de Krea 2 Turbo, `LoraLoaderModelOnly`, Qwen3-VL-4B y VAE de Qwen-Image). Otros runners no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de estilo comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El conjunto de entrenamiento es de solo 25 imagenes, mayoritariamente de fantasia oscura; escenas modernas complejas pueden requerir varias generaciones para obtener un resultado aceptable.
- El trigger aislado `prismarcana` no activa el estilo de forma fiable; hay que usar el prefijo completo con descriptores en chino.
- No garantiza composiciones identicas: la transferencia de estilo funciona sobre personas, animales, edificios y vehiculos, pero la estructura de la escena varia.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion; no hay datos de evaluacion que lo cuantifiquen.
- Licencia Krea 2 Community License: no es MIT ni Apache-2.0; el uso comercial y la distribucion estan sujetos a sus terminos.
- Si se despliega como servicio publico, la licencia exige implementar filtrado de contenido adecuado.
- Prohibido sugerir que el modelo es un producto oficial de Krea o que cuenta con su respaldo.
- El repositorio no incluye las imagenes de entrenamiento, solo pesos, previews y ficheros de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/ijgvt/krea-2-dark-fantasy-illustration-style
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Pagina en Civitai: https://civitai.com/models/3024778
- Licencia Krea 2: https://krea.ai/krea-2-licensing
