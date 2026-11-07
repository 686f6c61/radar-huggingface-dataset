# cs3customs/wan2.2_i2v_14b_int8

## Resumen

`cs3customs/wan2.2_i2v_14b_int8` es una cuantizacion a 8 bits del modelo Wan2.2 Image-to-Video de 14 mil millones de parametros, publicada por el usuario cs3customs en Hugging Face. Se trata de un modelo de difusion para generacion de video a partir de una imagen (image-to-video, I2V), empaquetado en formato diffusers y pensado para usarse con `WanImageToVideoPipeline`. El repositorio ocupa 38,8 GB y contiene pesos en safetensors con cuantizacion de 8 bits.

El modelo base pertenece a la familia Wan2.2, desarrollada por Wan-AI (Alibaba). Segun la documentacion del modelo original, Wan2.2 introduce una arquitectura de mezcla de expertos (MoE) en modelos de difusion de video, separando el procesamiento de ruido de alto y bajo nivel entre expertos distintos. Esta version concreta es una adaptacion no oficial del checkpoint de 14B en I2V, reducida a 8 bits por un tercero.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras cuantizaciones comunitarias de Wan2.2 I2V; por otro, conviene advertir de que la model card es la plantilla autogenerada de diffusers, sin informacion tecnica del autor, sin licencia declarada y con cero descargas, por lo que su trazabilidad y soporte son limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video (image-to-video) basado en transformer, con arquitectura MoE en el modelo base Wan2.2 |
| Parametros totales | 14.291.338.368 (14,29 B) |
| Parametros activos | no disponible (el modelo base Wan2.2 usa MoE, pero no se especifica el reparto activo en esta cuantizacion) |
| Longitud de contexto | no disponible (modelo de difusion; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | 8 bits (int8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (8-bit), libreria diffusers |

## Arquitectura y entrenamiento

El modelo es una cuantizacion int8 de un checkpoint de difusion para generacion de video condicionada por imagen. El modelo base Wan2.2, segun la documentacion oficial de Wan-AI, incorpora una arquitectura MoE en el modelo de difusion: separa el proceso de eliminacion de ruido en expertos especializados segun el nivel de ruido (alto y bajo), lo que permite aumentar la capacidad del modelo sin escalar linealmente el coste computacional por paso.

No se dispone de informacion sobre el proceso de cuantizacion aplicado (calibracion, metodo de redondeo, capas afectadas), ni sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o ajuste fino). La model card del repositorio es la plantilla autogenerada por diffusers y no aporta ningun detalle tecnico. Tampoco se documenta si la cuantizacion preserva la separacion de expertos del modelo original o la colapsa.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) mediante `WanImageToVideoPipeline` de diffusers.
- Generacion de secuencias de video condicionadas por una imagen de referencia, manteniendo coherencia temporal dentro de la ventana generada.
- Integracion con el ecosistema diffusers, lo que permite cargar el pipeline con `DiffusionPipeline.from_pretrained`.
- No se documentan capacidades de texto, codigo, matematicas, tool calling, agentes, vision general ni audio, al tratarse de un modelo de difusion de video.
- No se documentan capacidades multilingues ni modos especiales (thinking, razonamiento, etc.).

## Casos de uso

- Prototipado de animacion de imagenes: dado un fotograma o ilustracion, generar un clip corto animado para validar ideas de storyboard antes de produccion.
- Generacion de contenido para redes sociales: convertir imagenes de producto o ilustraciones en clips breves para publicaciones, con la ventaja de que la cuantizacion int8 reduce el espacio en disco frente al checkpoint original.
- Previsualizacion en pipelines creativos: integrar el modelo en herramientas de edicion para generar borradores animados que luego se refinan con modelos de mayor precision.
- Investigacion en cuantizacion de modelos de difusion de video: comparar la calidad de esta version int8 frente al checkpoint de 14B en fp16/bf16 para estudiar la perdida de fidelidad.
- Demostraciones tecnicas y pruebas de concepto: al caber en 38,8 GB de repositorio, es viable desplegarlo en entornos con GPU de 24-48 GB para validar la viabilidad de I2V en un producto.
- Generacion de fondos animados o elementos visuales para videojuegos y entornos interactivos, a partir de arte conceptual existente.
- Evaluacion comparativa de pipelines diffusers: servir como caso de prueba para medir throughput y latencia de un pipeline I2V cuantizado en distintas GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de difusion de 14,29 B en int8 requiere al menos unos 14-15 GB solo para los pesos, mas memoria para activaciones y latentes de video, que en difusion de video suele ser considerable; se recomienda un margen amplio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, serian razonables GPU de 24 GB o mas (RTX 3090/4090, A6000, L40S, A100) para el checkpoint int8, pero no hay confirmacion del autor.
- ¿Cabe en GPU de consumo? Probablemente en RTX 3090/4090 (24 GB) segun el tamano de pesos, aunque la generacion de video puede agotar la memoria con resoluciones o duraciones altas. No confirmado.
- Opciones de despliegue: diffusers (libreria declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion de video en la mayoria de casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cs3customs/wan2.2_i2v_14b_int8 | 14,29 B | Difusion video I2V | int8 | no disponible | Hugging Face (0 descargas) |
| Wan-AI/Wan2.2-I2V-A14B | no disponible en la informacion | Difusion video I2V (MoE) | no disponible | no disponible en la informacion | Hugging Face (oficial) |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de diffusers: no hay informacion del autor, metodo de cuantizacion, datos de entrenamiento ni evaluacion.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que remitirse a la licencia del modelo base Wan2.2 de Wan-AI.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion comunitaria de esta cuantizacion concreta.
- Riesgo de degradacion de calidad por la cuantizacion int8 frente al checkpoint original en fp16/bf16, sin datos publicados que lo cuantifiquen.
- Riesgo de alucinacion visual y artefactos temporales inherente a los modelos de difusion de video; no documentado por el autor.
- Posibles sesgos heredados del dataset de entrenamiento del modelo base, no documentados.
- No se especifican limitaciones de resolucion, duracion de video ni numero de fotogramas soportados.
- Para produccion, se recomienda usar el checkpoint oficial de Wan-AI y validar esta cuantizacion solo como alternativa de ahorro de memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cs3customs/wan2.2_i2v_14b_int8
- Modelo base oficial: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- README del modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B/blob/main/README.md
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
