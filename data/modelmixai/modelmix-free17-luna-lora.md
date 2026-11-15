# ModelMixAI/modelmix-free17-luna-lora

## Resumen

ModelMix Free17 Luna es un LoRA de personaje para SDXL (Stable Diffusion XL) que reproduce de forma consistente a "Luna", una chica anime de 24 anos con estetica de bruja: pelo largo ondulado violeta profundo, ojos dorados, piel clara y una sonrisa suave y misteriosa. Lo desarrolla ModelMixAI, un creador que comercializa piezas de personaje, rostro, cuerpo, acompanante y localizacion que se pueden combinar entre si para construir modelos virtuales e influencers de IA. Este LoRA es una de las 20 piezas de personaje gratuitas del catalogo del autor y esta pensado para integrarse con el resto de piezas (de pago) del ecosistema ModelMix.

El modelo resuelve el problema de consistencia de personaje en generacion de imagen: fija rostro, peinado y estilo de vestuario para que el mismo modelo virtual aparezca igual en distintas imagenes. Es un adaptador de bajo rango (LoRA) sobre `stabilityai/stable-diffusion-xl-base-1.0`, aunque segun la model card fue entrenado sobre SDXL Nuclear (NuclearDiffusionSDXL3). El repositorio ocupa 0,3 GB e incluye pesos en formato `.safetensors`, ademas de seis imagenes de previsualizacion.

El entrenamiento se realizo con solo 20 imagenes y utiliza un trigger token propio, `mmx_free17_luna_cy`, con un peso recomendado de 0,9 (rango util de 0,8 a 1,0). La licencia es "other" y restringe el uso a ambito personal, prohibiendo el uso comercial y la redistribucion del archivo. Se publico en Hugging Face el 15 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL, difusion latente text-to-image |
| Parametros totales | no disponible (adaptador LoRA; el repo pesa 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no LLM) |
| Tipos de cuantizacion | no disponible (pesos `.safetensors` sin cuantizacion declarada) |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | other (uso personal unicamente; sin uso comercial) |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

Se trata de un LoRA para SDXL, es decir, un adaptador de bajo rango que se inyecta sobre el UNet del modelo base `stabilityai/stable-diffusion-xl-base-1.0` sin modificar los pesos originales. Segun la model card, el entrenamiento se realizo sobre SDXL Nuclear (NuclearDiffusionSDXL3), una variante comunitaria de SDXL, y el dataset consta de solo 20 imagenes del personaje. No se especifican hiperparametros, numero de pasos, tasa de aprendizaje ni composicion detallada del dataset; estos datos figuran como no disponibles.

La innovacion principal no es arquitectonica sino de diseno del producto: el uso de un trigger token dedicado (`mmx_free17_luna_cy`) y de la sintaxis de etiqueta `<lora:mmx_free17_luna_cy:0.9>` para invocar el adaptador, junto con un peso recomendado de 0,9 (rango 0,8-1,0). El LoRA esta concebido como pieza modular: segun el autor, los personajes completos se combinan con LoRA de localizacion, y las piezas de rostro, cuerpo, acompanante y localizacion se combinan libremente. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Generacion text-to-image de un personaje anime consistente (rostro, peinado y vestuario estables entre imagenes).
- Control de identidad mediante trigger token `mmx_free17_luna_cy` y peso de LoRA ajustable (0,8-1,0; recomendado 0,9).
- Composicion modular con otras piezas ModelMix (personajes, rostros, cuerpos, acompanantes y localizaciones).
- Estetica orientada a modelo virtual e influencer de IA (personaje adulto ficticio).
- Compatible con el ecosistema SDXL (modelo base y variantes como SDXL Nuclear).
- No dispone de tool calling, function calling, agentes, razonamiento multi-step ni capacidades de vision, audio o thinking mode, al ser un modelo de difusion para imagen.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- Creacion de influencer virtual de IA: usar el LoRA con el trigger token para generar un feed coherente de imagenes de Luna en distintas poses y escenas, manteniendo la identidad visual entre publicaciones.
- Ilustracion de personaje para ficcion o juegos: generar arte conceptual y variaciones de vestuario del personaje con el peso de LoRA ajustado para conservar el diseno original.
- Composicion de escenas con LoRA de localizacion: combinar Luna con piezas de localizacion del catalogo ModelMix para situar al personaje en fondos y ambientes distintos sin perder consistencia.
- Prototipado rapido de personajes para proyectos creativos: al entrenarse con 20 imagenes, el adaptador es ligero (0,3 GB) y permite iterar rapidamente sobre prompts y pesos.
- Generacion de material para redes sociales y avatares: producir retratos y variaciones estilisticas de un unico personaje adulto ficticio para uso personal.
- Experimentacion con pipelines SDXL: probar tecnicas de LoRA stacking y control de peso (0,8-1,0) en entornos de difusion para investigar consistencia de personaje.
- Uso educativo o de demostracion: estudiar como un LoRA de bajo rango sobre SDXL fija identidad con un dataset pequeno, siempre dentro del uso personal permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al ser un LoRA sobre SDXL, requiere la VRAM del modelo base SDXL, que tipicamente se situa en torno a 8-12 GB en fp16 segun resolucion y optimizaciones (dato no confirmado en la informacion proporcionada).
- GPU recomendadas: no disponibles en la informacion; para SDXL se suelen emplear GPUs con 8 GB o mas de VRAM, aunque el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende de la VRAM necesaria para ejecutar SDXL.
- Opciones de despliegue: no documentadas en la model card; el formato `.safetensors` es compatible con runners de difusion que cargan LoRA sobre SDXL (no se enumeran herramientas concretas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ModelMix Free17 Luna | LoRA de personaje | SDXL (entrenado sobre SDXL Nuclear) | no disponible (repo 0,3 GB) | no aplica | other (uso personal) | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base text-to-image | SDXL | no disponible | no aplica | openrail++ (segun modelo base referenciado) | Hugging Face |
| Otros LoRA de personaje SDXL de la comunidad | LoRA de personaje | SDXL | no disponible | no aplica | variable | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparacion cuantitativa con alternativas; la comparativa se limita a tipo, base, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado con solo 20 imagenes: la consistencia puede degradarse en poses, angulos o vestuarios alejados de los vistos en entrenamiento.
- Riesgo de sobreajuste y de arrastrar sesgos estilisticos del dataset pequeno; no se documentan sesgos conocidos.
- Riesgo de alucinacion visual (artefactos, manos deformadas, incoherencias anatomicas) inherente a los modelos de difusion; no cuantificado.
- Dependencia del trigger token y del peso: fuera del rango 0,8-1,0 la identidad puede perderse o saturarse.
- Licencia "other" restrictiva: uso personal unicamente, sin uso comercial; prohibida la redistribucion, reventa, comparticion o re-subida del archivo `.safetensors`.
- Prohibido usar el LoRA para representar personas reales o menores; el autor declara que toda persona representada es un adulto ficticio generado por IA.
- Idiomas no documentados; los prompts de ejemplo estan en ingles, por lo que el rendimiento con otros idiomas no esta verificado.
- Sin descargas ni likes registrados en Hugging Face en el momento de la ficha: madurez y validacion comunitaria nulas.
- El modelo base real de entrenamiento (SDXL Nuclear) difiere del base_model declarado en los metadatos (`stabilityai/stable-diffusion-xl-base-1.0`), lo que puede afectar la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/ModelMixAI/modelmix-free17-luna-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Tienda Payhip: https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
