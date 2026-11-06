# abbuibuibui/NadekoSengoku-Lora

## Resumen

NadekoSengoku-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint waiIllustriousSDXL v17 (variante Illustrious del ecosistema SDXL orientada a estetica anime). Lo desarrolla el usuario abbuibuibui y reproduce a Nadeko Sengoku (千石抚子), personaje de la serie Monogatari. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un adaptador de bajo rango que se carga junto al modelo base para condicionar la generacion de imagenes hacia la identidad visual del personaje.

El repositorio contiene siete checkpoints intermedios (E1-E7) en formato safetensors, cada uno de 456.491.852 bytes, con un total de 3,2 GB en el repositorio. El autor realizo una evaluacion comparativa interna y recomienda el epoch E6 a una fuerza de 0.8, con una matriz de pruebas sobre E5-E7, diez escenas y cuatro intensidades (0.4, 0.6, 0.8, 1.0).

Su relevancia es acotada pero clara dentro del nicho: los LoRA de personaje para Illustrious son la via estandar para fijar identidades concretas en pipelines de generacion de imagen, y este aporta checkpoints intermedios, hashes SHA-256, dataset publico y evaluacion documentada, algo que no siempre ocurre en este tipo de publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (rango LoRA 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos entregados en safetensors; el modelo base admite fp16/bf16 y cuantizaciones propias de SDXL) |
| Idiomas soportados | en, zh (prompts) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 inyectado en el UNet del modelo base waiIllustriousSDXL v17, un checkpoint SDXL afinado para estetica anime dentro de la familia Illustrious. El entrenamiento uso AdamW en bf16, buckets con tope de 1536 y 7 epochs. El dataset consta de 53 pares de imagenes organizados en dos conjuntos de vestuario (School_Uniform y Blue_Overalls), con 3 repeticiones por muestra. Las captions se generaron con `keep_tokens = 2`, lo que explica que el color de pelo y ojos se omita a menudo en el texto y deba anadirse manualmente en el prompt.

El entrenamiento y la evaluacion se realizaron en un NVIDIA DGX Spark con ComfyUI. Los tokens de activacion son tres: `nadeko_sengoku` para identidad, `nadeko_sengoku_school_uniform` y `nadeko_sengoku_blue_overalls` para los dos conjuntos de ropa. El autor documento una evaluacion en dos rondas: una primera criba de E1-E7 a fuerza 0.8 y una matriz posterior de E5, E6 y E7 cruzada con diez escenas y cuatro intensidades.

## Capacidades

- Generacion de imagenes de un personaje concreto (Nadeko Sengoku) sobre el modelo base waiIllustriousSDXL v17.
- Control de identidad mediante el token `nadeko_sengoku`, con rasgos tipicos: twintails, pelo negro, ojos marrones.
- Dos variantes de vestuario activables por token: uniforme escolar y mono azul (blue overalls).
- Composición de escenas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentado, fondo simple, escena nocturna compleja.
- Funciona sin token de vestuario, generando la identidad con ropa libre (documentado en el showcase `05_no_outfit.png`).
- Ajuste de intensidad del efecto mediante el peso del LoRA (evaluado de 0.4 a 1.0).
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art consistente: cargar el LoRA a fuerza 0.8 sobre waiIllustriousSDXL v17 con el prompt de ejemplo del autor permite obtener retratos del personaje con rasgos estables entre generaciones, algo critico cuando se produce una serie de imagenes del mismo personaje.
- Creacion de hojas de personaje: combinando los tokens de identidad y de vestuario se pueden generar vistas frontal, tres cuartos y perfil del mismo personaje para documentacion de proyecto o referencia de dibujo.
- Prototipado de escenas para narrativa visual: la evaluacion documentada cubre escenas nocturnas complejas y fondos simples, lo que permite montar secuencias de viñetas o storyboards con el personaje en contextos variados.
- Generacion de variantes de vestuario: al existir dos conjuntos de ropa con token propio, se pueden producir comparativas de looks sin reentrenar, util para catalogos de diseno de personaje.
- Integracion en pipelines ComfyUI: el flujo de referencia del autor (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, sin hires ni ADetailer) sirve como plantilla reproducible para automatizar lotes de imagenes.
- Experimentacion con fuerza del adaptador: la matriz E5/E6/E7 x 0.4/0.6/0.8/1.0 permite estudiar el equilibrio entre fidelidad al personaje y libertad compositiva del modelo base, util en investigacion sobre control de adaptadores LoRA.
- Fine-tuning posterior o merges: al ser un LoRA de rango 64 en safetensors, puede combinarse con otros adaptadores o servir de base para variantes estilisticas del mismo personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor aporta unicamente una evaluacion cualitativa comparativa:

| Candidato | Observacion documentada | Decision |
|---|---|---|
| E5 | Twintails negros usables | Alternativo |
| E6 | Retrato correcto: twintails negros con lazos rosas, ojos marrones, cuello marinero; en cuerpo completo el uniforme puede derivar a pinafore marron con blusa blanca y trenzas laterales | Recomendado a 0.8 |
| E7 | Muy cercano a E6 | Alternativo final |

El autor advierte que en cuerpo completo conviene escribir explicitamente "twintails" si se quiere fijar el look de lazos rosas, y que el color de pelo y ojos debe anadirse al prompt porque las captions los omiten con frecuencia.

## Requisitos de hardware

- VRAM estimada: el LoRA en si pesa unos 456 MB por checkpoint; el consumo real lo determina el modelo base SDXL, que en fp16 requiere del orden de 8-10 GB de VRAM para inferencia a 832x1216 con atencion estandar.
- GPU recomendadas: NVIDIA DGX Spark es la plataforma usada por el autor para entrenamiento y evaluacion; para inferencia, cualquier GPU con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100) es suficiente.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o superiores con SDXL en fp16; en 8 GB puede requerir offloading o cuantizacion del modelo base.
- Opciones de despliegue: ComfyUI (flujo validado por el autor), Automatic1111/Forge y otros frontends compatibles con LoRA SDXL; la libreria declarada es diffusers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NadekoSengoku-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | rango 64, alpha 32 | no aplica | creativeml-openrail-m | Hugging Face y ModelScope |
| LoRA de personaje SDXL genericos | LoRA de personaje | SDXL 1.0 o derivados | variable | no aplica | variable (muchos sin licencia clara) | Hugging Face, Civitai |
| Modelo base waiIllustriousSDXL v17 | Checkpoint completo SDXL | SDXL | ~2.6B (UNet + text encoders) | no aplica | variable segun publicacion | Hugging Face, Civitai |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con otros LoRA de personaje. La comparacion relevante es estructural: frente a LoRA genericos, este aporta checkpoints intermedios, hash SHA-256 del E6, dataset publico y evaluacion documentada, pero su utilidad queda restringida al modelo base concreto para el que fue entrenado.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares y el autor lo declara como fan-made.
- La licencia creativeml-openrail-m impone restricciones de uso; conviene revisar sus clausulas antes de cualquier uso comercial, especialmente por la naturaleza derivada del personaje.
- Dependencia estricta del modelo base waiIllustriousSDXL v17: sobre otros checkpoints SDXL el resultado puede degradarse.
- Las captions omiten color de pelo y ojos con frecuencia; es necesario anadirlos en el prompt para evitar derivas de identidad.
- En cuerpo completo el uniforme escolar puede derivar a pinafore marron con trenzas laterales en lugar de twintails con lazos rosas.
- Riesgo de sobreajuste al dataset: solo 53 pares de imagenes y dos conjuntos de vestuario, lo que limita la variedad de poses y contextos vistos en entrenamiento.
- No hay benchmarks cuantitativos publicados ni validacion por terceros; la recomendacion de E6 a 0.8 proviene de la evaluacion del propio autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/NadekoSengoku-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/NadekoSengoku-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/NadekoSengoku-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/NadekoSengoku-Dataset
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
