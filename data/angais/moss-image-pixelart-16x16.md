# Angais/MOSS-Image-PixelArt-16x16

## Resumen

MOSS-Image PixelArt 16x16 es un adaptador LoRA para el modelo de difusión de imágenes MOSS-Image-Base, desarrollado por el usuario Angais y publicado bajo licencia Apache 2.0. Su objetivo es muy concreto: generar iconos de videojuego en pixel art de exactamente 16x16 píxeles, con un único objeto centrado, contorno oscuro y sombreado plano, sobre un fondo magenta plano (#FF00FF) que se elimina con un simple color key. El adaptador no modifica el text encoder ni la arquitectura del modelo base, sino que se fusiona directamente en los pesos del transformer.

El modelo base, MOSS-Image-Base, lo mantiene OpenMOSS y es un DiT (Diffusion Transformer) de aproximadamente 5 000 millones de parámetros con control nativo de layout mediante prompts JSON, buena representación de texto y fine-tuning eficiente. El LoRA se entrenó con solo 550 iconos sintéticos (CC0) sobre el propio transformer congelado, en bf16, con rango 32 y 1 500 pasos, lo que se traduce en unos 15 minutos de entrenamiento en una única A100. El resultado es un adaptador de 0,1 GB, muy ligero y especializado.

Su relevancia práctica está en la producción de assets para videojuegos: convierte un prompt de texto en un sprite de 16x16 listo para usar, con fondo transparente y rejilla limpia (pureza de rejilla mediana de 0,988), sin necesidad de postprocesado manual más allá del color key. Al ser un LoRA sobre un modelo Apache 2.0, se puede integrar en pipelines comerciales sin restricciones de licencia adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT (Diffusion Transformer) de flujo; el modelo base usa transformer MOSS-Image, scheduler propio (MOSSImageScheduler), text encoder tipo AutoModel y VAE AutoencoderKLFlux2 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene aproximadamente 5 000 millones de parametros). Tamano del repo del adaptador: 0,1 GB |
| Longitud de contexto | no aplicable / no disponible (modelo texto-a-imagen; no se publica longitud de prompt soportada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base se usa en bf16 y el VAE en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (igual que el modelo base MOSS-Image-Base) |
| Formato de pesos | safetensors (archivo unico moss-image-pixelart-16x16.safetensors, LoRA de rango 32); no hay version GGUF publicada |
| Rango / alpha de LoRA | 32 / 32 (escala 1.0 al fusionar) |
| Capas adaptadas | q, k, v, o y lineales de feed-forward de los 42 bloques del transformer; text encoder congelado |
| Resolucion de entrenamiento | 512x512, batch 2 |
| Dataset de entrenamiento | Angais/krea-2-pixelart-16x16-synthetic (550 iconos 16x16 sinteticos, CC0, escalados x32 sobre magenta plano) |
| Prompt de instancia | pixel art 16x16 game icon |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MOSS-Image-Base, un modelo de difusión con arquitectura transformer (DiT) de unos 5 000 millones de parámetros que emplea flow matching como objetivo de entrenamiento. La pipeline no está integrada en diffusers para carga de LoRA, por lo que el propio repositorio base incluye el código de la pipeline y el adaptador debe fusionarse manualmente en los pesos del transformer multiplicando las matrices lora_B y lora_A y sumando el delta a cada capa. El VAE es un AutoencoderKLFlux2 que se carga en fp32, mientras que el transformer y el text encoder van en bf16.

El entrenamiento usó 550 iconos sintéticos de 16x16 píxeles bajo dominio CC0, cada uno escalado x32 sobre un fondo magenta plano y etiquetado con el prompt que lo había generado. Se congeló el text encoder y se aplicó LoRA de rango 32 y alpha 32 sobre las proyecciones q, k, v, o y las capas lineales de feed-forward de los 42 bloques. La configuración fue: resolución 512x512, batch de 2, optimizador AdamW con tasa de aprendizaje 1e-4, 100 pasos de warm-up y decaimiento lineal, pérdida de flow matching, 5 % de caption dropout y 1 500 pasos totales (unos 15 minutos en una A100). No se documenta ningún uso de RLHF, DPO ni fine-tuning por preferencias, algo esperable en un modelo de generación de imagen de este tipo.

## Capacidades

- Generación de imágenes texto-a-imagen especializada en pixel art: produce iconos de 16x16 píxeles con un único objeto centrado.
- Estilo consistente: contorno oscuro, sombreado plano y paleta limitada, con rejilla limpia (pureza media por bloque de 32x32 de 0,988).
- Fondo magenta plano (#FF00FF) que se elimina con color key; el 79 de 80 renders analizados se recortaron limpiamente, con una distancia mediana de 11/255 respecto al color objetivo.
- Transparencia interior correcta en algunos casos: 12 de 80 renders presentaron huecos transparentes en asas, anillos y bucles.
- Generalización a objetos no vistos: de 16 objetos de prueba, 7 no estaban en el conjunto de entrenamiento (muñeco de nieve, ancla, caballo de ajedrez, sushi, cucurucho de helado, casco espacial, tetera) y el autor indica que salen igual de bien que los entrenados.
- Salida reproducible mediante semilla y conversión determinista a 16x16 tomando un píxel de cada bloque de 32x32.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de generación de imagen).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; los prompts deben ir en inglés.
- Capacidades especiales: no hay modo thinking, visión ni audio. El control nativo de layout del modelo base (prompts JSON) no está documentado como utilizable con este adaptador.

## Casos de uso

- Producción de iconos para inventario en juegos 2D: dado un listado de objetos (llaves, pociones, monedas, armas), se genera un sprite de 16x16 por objeto con fondo transparente listo para importar en un atlas de texturas, con prompts plantilla y sin retoque manual más allá del color key.
- Generación de assets de prototipado rápido: en fases de preproducción, un diseñador puede obtener decenas de variantes de un mismo icono cambiando detalles del prompt para decidir dirección artística antes de encargar arte final.
- Herramientas internas de nivel y contenido: integrado en un editor o pipeline propio que llame a la pipeline de MOSS-Image, se pueden producir iconos bajo demanda para mods, prototipos o juegos jam sin depender de un artista de pixel art.
- Creación de packs de assets sintéticos: los sprites generados pueden servir como material de apoyo para entrenar o aumentar otros modelos de pixel art, dado que la licencia Apache 2.0 permite redistribuirlos (con la advertencia de divulgación de contenido generado por IA).
- Pruebas de concepto de investigación en adaptación de difusión: es un caso de estudio reproducible de LoRA de rango 32 con solo 550 imágenes y 1 500 pasos sobre un DiT de 5B, útil para medir cuánto estilo se puede inyectar con un presupuesto mínimo.
- Relleno de huecos en catálogos de assets: para juegos con cientos de objetos, el modelo permite cubrir items secundarios que no justifican encargo de arte dedicado, manteniendo coherencia visual con el estilo establecido por el prompt de instancia.
- Exportación a formato de motor: el flujo de conversión a RGBA de 16x16 (tomando un píxel por bloque de 32x32 y aplicando el color key) se puede automatizar en un script que genere PNG o atlas directamente consumibles por Godot, Unity o GameMaker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de generación de imagen. El autor sí publica métricas propias medidas sobre 80 renders no curados (64 prompts variados más 16 objetos de prueba, 7 de ellos ausentes del entrenamiento):

| Metrica | Resultado |
|---|---|
| Fondos eliminados limpiamente por color key | 79 / 80 |
| Distancia mediana del color de fondo respecto a #FF00FF | 11 / 255 |
| Renders con huecos transparentes (asas, anillos) | 12 / 80 |
| Pureza de rejilla (proporcion de cada bloque 32x32 de un solo color), mediana | 0,988 |
| Tiempo por imagen a 512x512 | 9,1 s en una A100 |

## Requisitos de hardware

- VRAM estimada: alrededor de 30 GB para tener toda la pipeline en GPU (transformer y text encoder en bf16, VAE en fp32), según el propio autor.
- GPUs recomendadas: A100 (referencia medida, 9,1 s por imagen a 512x512 y 50 pasos), H100 u otras GPUs de centro de datos con 40 GB o más para ejecución completa sin offload.
- GPUs de consumo: no hay cifras oficiales para tarjetas de 24 GB como la RTX 4090. El autor indica que en tarjetas más pequeñas conviene usar enable_model_cpu_offload() en lugar de .to("cuda") para mantener solo la parte activa en GPU, lo que hace plausible su uso en GPUs de consumo con suficiente RAM de sistema, pero no está confirmado con datos.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). La carga se hace con diffusers y transformers siguiendo el código de la pipeline incluido en el repositorio del modelo base; se ha probado con diffusers 0.41.0 y transformers 5.19.0, y diffusers todavía no tiene cargador de LoRA para MOSS-Image, por lo que el adaptador se fusiona a mano.
- Latencia y throughput: 9,1 segundos por imagen de 512x512 con 50 pasos y guidance 3 en una A100, en modo no destilado. El proceso completo incluye 50 pasos de muestreo, lo que lo hace más lento que modelos destilados de pocos pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Datos de entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| Angais/MOSS-Image-PixelArt-16x16 | LoRA de rango 32, 0,1 GB | MOSS-Image-Base (DiT ~5B) | 550 iconos 16x16 sinteticos CC0 | apache-2.0 | Objetivo: iconos 16x16 con fondo magenta eliminable; 9,1 s por imagen en A100 |
| Angais/Krea-2-PixelArt-16x16 | LoRA | Krea 2 | Mismos datos (550 iconos 16x16) | no disponible | Version del mismo autor entrenada sobre otra base; permite comparar el efecto de la arquitectura base |
| OpenMOSS-Team/MOSS-Image-Base | Modelo completo | - | no disponible en la informacion proporcionada | apache-2.0 | DiT de ~5B con control nativo de layout, generacion de texto en imagen y fine-tuning eficiente; no esta especializado en pixel art |
| Otros LoRA de pixel art para SDXL, Flux o similares | LoRA | Distintas bases | no disponible | no disponible | No se dispone de datos comparativos de rendimiento ni de licencia en la informacion proporcionada |

## Limitaciones y advertencias

- Alcance muy restringido: solo genera iconos de 16x16 con un único objeto centrado; no produce escenas, personajes en poses ni resoluciones superiores de forma fiable.
- Inferencia lenta en comparación con modelos destilados: requiere 50 pasos con guidance 3 para obtener resultados utilizables.
- No se deben pedir objetos de color magenta puro, ya que el magenta está reservado para el fondo y rompería el color key.
- Formas ocasionales incorrectas: el autor documenta casos como un "sombrero de pirata negro" que puede generar correas por debajo.
- El texto del prompt debe estar en inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación morfológica inherente a los modelos de difusión: los objetos pueden presentar detalles incoherentes, sobre todo en estructuras finas (asas, anillos, bucles), donde solo 12 de 80 renders lograron huecos transparentes correctos.
- La fusión manual del LoRA en los pesos del transformer no es reversible sin recargar el modelo base, y diffusers aún no ofrece un cargador de LoRA para esta arquitectura.
- Restricciones de licencia: Apache 2.0 permite uso comercial y redistribución, pero el autor no está afiliado ni respaldado por el equipo de OpenMOSS, y las salidas son generadas por IA, por lo que debe divulgarse cuando lo exija la ley o la política de la plataforma.
- Dependencia de versiones concretas de librerías (diffusers 0.41.0 y transformers 5.19.0 probadas); cambios de versión pueden romper el código de la pipeline.
- Fiabilidad de los datos: el repositorio no tiene descargas ni valoraciones registradas, y las métricas publicadas provienen únicamente del autor, sin verificación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Angais/MOSS-Image-PixelArt-16x16
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/krea-2-pixelart-16x16-synthetic
- Version sobre Krea 2: https://huggingface.co/Angais/Krea-2-PixelArt-16x16
- Pagina oficial de MOSS-Image: https://openmoss.ai/MOSS-Image/
- Repositorio oficial en GitHub: https://github.com/OpenMOSS/MOSS-Image
- Ficha de la version Krea 2 en free2aitools (referencia de registro): https://free2aitools.com/model/angais/krea-2-pixelart-16x16
