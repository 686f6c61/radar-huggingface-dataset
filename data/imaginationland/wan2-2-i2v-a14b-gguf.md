# imaginationland/Wan2.2-I2V-A14B-GGUF

## Resumen

Wan2.2-I2V-A14B-GGUF es la conversion al formato GGUF del modelo Wan-AI/Wan2.2-I2V-A14B, un modelo de difusion para generacion de video a partir de una imagen de referencia (image-to-video) desarrollado por Wan-AI, el equipo de generacion de video de Alibaba. El repositorio lo publica el usuario imaginationland y su aportacion es exclusivamente la cuantizacion: los pesos originales se convierten a GGUF para reducir los requisitos de memoria y permitir la inferencia con el nodo personalizado ComfyUI-GGUF.

El modelo base pertenece a la serie Wan2.2, que introduce un diseno de mezcla de expertos (MoE) adaptado al proceso de eliminacion de ruido de los modelos de difusion: un experto de ruido alto que trabaja en las etapas iniciales (composicion y estructura global) y un experto de ruido bajo que refina el detalle en las etapas finales. Los metadatos del repositorio registran 14.288.901.184 parametros y la nomenclatura A14B del modelo original alude a los parametros activos por paso de denoising.

Es relevante porque la generacion de video con difusion ha estado historicamente limitada por la VRAM: una version cuantizada en GGUF acerca estos modelos a equipos de consumo y a flujos de trabajo locales en ComfyUI, sin necesidad de GPUs de datacenter. La licencia Apache-2.0 del modelo base facilita ademas su integracion en productos comerciales, siempre que se respeten los terminos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con mezcla de expertos (MoE) de dos expertos: uno de ruido alto y otro de ruido bajo |
| Parametros totales | 14.288.901.184 (~14,3 mil millones) segun los metadatos del repositorio |
| Parametros activos | No disponible con precision; la designacion A14B del modelo base indica que se activan aproximadamente 14 mil millones por paso de denoising |
| Longitud de contexto | No aplicable: modelo de difusion de video, no procesa secuencias de tokens con ventana de contexto. La entrada es una imagen de referencia mas un prompt de texto |
| Tipos de cuantizacion | No detallados en la model card. El repositorio ocupa 232,2 GB, lo que indica la presencia de varios niveles de cuantizacion GGUF |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion (DiT) que opera en el espacio latente de un VAE 3D causal, con un codificador de texto como condicionamiento. La innovacion principal de la serie Wan2.2 es el diseno MoE de dos expertos aplicado al proceso de denoising: en lugar de un unico transformer que cubre todo el rango de niveles de ruido, se emplea un experto especializado en las etapas de ruido alto, donde se decide la composicion y el movimiento global, y otro especializado en las etapas de ruido bajo, donde se refina la textura y el detalle fino. Este reparto permite dedicar capacidad de parametros alla donde aporta mas, manteniendo un coste de computo por paso comparable al de un modelo denso mas pequeno.

En cuanto a los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO), no se dispone de informacion en el material proporcionado; estos detalles corresponden a la documentacion del modelo original Wan-AI/Wan2.2-I2V-A14B. Esta ficha cubre unicamente la version cuantizada: los pesos se han convertido a GGUF sin reentrenamiento ni ajuste fino, por lo que el comportamiento del modelo es el del original, con la degradacion propia de la cuantizacion. La model card no especifica que niveles de cuantizacion se han generado ni con que herramienta exacta.

## Capacidades

- Generacion de video a partir de una imagen de entrada mas un prompt de texto (image-to-video).
- Condicionamiento textual bilingue: acepta prompts en ingles y en chino.
- Control de la composicion inicial a partir de la imagen de referencia, manteniendo la identidad visual del primer fotograma.
- Generacion de movimiento y evolucion temporal coherente entre fotogramas gracias al VAE 3D causal del modelo base.
- Estilizacion y aplicacion de estetica cinematografica segun lo descrito para la serie Wan2.2 en las fuentes consultadas.
- Integracion en ComfyUI mediante el nodo personalizado ComfyUI-GGUF, lo que permite encadenar el modelo con otros nodos de postproceso y upscaling.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje, sino un modelo generativo de video.
- No se documentan en la informacion disponible capacidades de audio, vision general (VQA) ni modos de "thinking".

## Casos de uso

- Animacion de fotografias y retratos: a partir de una imagen fija se puede generar un plano con movimiento sutil (parpadeo, giro de cabeza, movimiento de camara), util en estudios de fotografia que quieren ofrecer versiones animadas de sus trabajos.
- Previsualizacion de storyboards en produccion audiovisual: convertir ilustraciones o fotogramas clave en clips animados para validar ritmo, encuadre y continuidad antes de rodar o de pasar a un pipeline 3D completo.
- Contenido para redes sociales y marketing: generar clips cortos a partir de una imagen de producto o de un fotograma de campana, con la cuantizacion GGUF permitiendo iterar en una estacion de trabajo local en lugar de depender de servicios en la nube.
- Prototipado de videojuegos y cinemáticas: producir animaciones de referencia para personajes o escenarios a partir de concept art, reduciendo el tiempo entre el diseno conceptual y la validacion interna.
- Restauracion y dinamizacion de archivo fotografico: animar imagenes historicas o de archivo para documentales y piezas museisticas, con el prompt de texto controlando la intensidad y el tipo de movimiento.
- Investigacion en generacion de video: al ser un GGUF cuantizado, sirve como banco de pruebas para estudiar el impacto de la cuantizacion en la calidad temporal y en la fidelidad al fotograma de referencia.
- Formacion y divulgacion: montar talleres practicos de generacion de video en GPU de consumo, donde un modelo en precision completa no cabria en el hardware disponible de los asistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a indicar que se trata de una conversion directa del modelo Wan-AI/Wan2.2-I2V-A14B y no incluye metricas de calidad, FVD, CLIP-score ni comparaciones cuantitativas con otras cuantizaciones.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas a partir del numero de parametros registrado (14,3 mil millones) y no son datos publicados por el autor del repositorio. En generacion de video hay que sumar, ademas de los pesos, la memoria de activaciones y la del codificador de texto y el VAE.

- Peso de los pesos por nivel de cuantizacion (estimacion): F16 en torno a 28,6 GB; Q8_0 en torno a 15,2 GB; Q6_K en torno a 11,8 GB; Q5_K_M en torno a 10,4 GB; Q4_K_M en torno a 8,8 GB; Q2_K en torno a 5,4 GB.
- VRAM total necesaria: superior a la de los pesos. El codificador de texto, el VAE y las activaciones de la difusion sobre secuencias de video anaden varios GB, por lo que conviene dejar margen.
- GPU de datacenter: A100 80 GB y H100 80 GB permiten trabajar con precision alta y resoluciones y duraciones mayores sin recurrir a la cuantizacion agresiva.
- GPU de consumo: con cuantizaciones Q4_K_M o Q5_K_M el modelo puede encajar en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090) y, con cuantizaciones mas agresivas, en tarjetas de 12-16 GB, a costa de perdida de calidad y de limitaciones de resolucion o duracion.
- Opciones de despliegue: la model card documenta el uso con el nodo ComfyUI-GGUF, colocando los ficheros en `ComfyUI/models/unet`. Para los pesos originales en precision completa existe el pipeline de Diffusers del modelo base. vLLM, TGI y Ollama no son aplicables, ya que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del nivel de cuantizacion, la resolucion, la duracion del clip, el numero de pasos de muestreo y la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan-AI/Wan2.2-I2V-A14B | ~14,3 B (MoE de dos expertos) | Safetensors (precision completa) | Apache-2.0 | Hugging Face, repositorio oficial | Modelo de referencia; requiere mucha mas VRAM |
| imaginationland/Wan2.2-I2V-A14B-GGUF (este) | ~14,3 B | GGUF | Apache-2.0 | Hugging Face, 232,2 GB, 0 descargas | Conversion directa sin ajuste fino |
| QuantStack/Wan2.2-I2V-A14B-GGUF | ~14,3 B | GGUF | Apache-2.0 | Hugging Face | Cuantizacion alternativa del mismo modelo base |
| bullerwins/Wan2.2-I2V-A14B-GGUF | ~14,3 B | GGUF | Apache-2.0 | Hugging Face y ModelScope; ~79.000 descargas y 297 likes segun la fuente consultada | La cuantizacion mas popular del mismo modelo base |
| Wan2.2-TI2V-5B | 5 B | Safetensors y GGUF | Apache-2.0 | Hugging Face (Wan-AI) | Variante mucho mas ligera; la fuente consultada indica que ejecuta 720p a 24 fps en una sola RTX 4090 |

## Limitaciones y advertencias

- Artefactos de generacion: como todo modelo de difusion, puede producir deformaciones anatomicas, objetos que se disuelven o desaparecen, texturas inestables y saltos de coherencia temporal entre fotogramas.
- Deriva de identidad: el sujeto o el fondo pueden alejarse progresivamente de la imagen de referencia en clips largos.
- Alucinacion visual: el modelo puede inventar elementos que no estaban en la imagen de entrada ni en el prompt, especialmente en zonas con poca informacion.
- Degradacion por cuantizacion: no se documentan en la model card los niveles GGUF generados ni sus efectos medidos sobre la calidad; en cuantizaciones bajas (Q2, Q3) es esperable una perdida apreciable de detalle fino y de estabilidad temporal.
- Idioma: los prompts estan soportados en ingles y chino. El castellano no figura entre los idiomas declarados y su uso puede degradar el seguimiento de instrucciones.
- Licencia: Apache-2.0, sin restricciones de uso comercial anadidas por el conversor. La model card matiza que, al tratarse de una version cuantizada, siguen vigentes todos los terminos y restricciones del modelo original, por lo que conviene revisar la ficha de Wan-AI/Wan2.2-I2V-A14B antes de un despliegue en produccion.
- Repositorio sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, sin metricas publicadas que respalden la fidelidad de esta cuantizacion concreta.
- Sesgos: no se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo demografico o cultural del modelo base.
- Coste de inferencia: la generacion de video es intensiva en computo, con latencias muy superiores a las de un modelo de imagen; conviene dimensionar los tiempos de espera en cualquier producto interactivo.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/imaginationland/Wan2.2-I2V-A14B-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Cuantizacion alternativa (QuantStack): https://huggingface.co/QuantStack/Wan2.2-I2V-A14B-GGUF
- Cuantizacion alternativa (bullerwins) en Hugging Face: https://aiglossary.xyz/models/bullerwins/Wan2.2-I2V-A14B-GGUF
- Cuantizacion alternativa (bullerwins) en ModelScope: https://www.modelscope.cn/models/bullerwins/Wan2.2-I2V-A14B-GGUF
- Nodo personalizado para ComfyUI: https://github.com/city96/ComfyUI-GGUF
- Guia practica de Wan2.2 (FP16/FP8/GGUF): https://www.stablediffusiontutorials.com/2025/08/wan-2.2-video-generation.html
