# abbuibuibui/AobaWakura-Lora

## Resumen

AobaWakura-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Aoba Wakura (和仓青羽), personaje de la serie *Mato Seihei no Slave*. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se aplica sobre un UNet SDXL ya existente para inyectar la identidad visual del personaje y un conjunto cerrado de atuendos.

El artefacto resuelve un problema muy concreto dentro del ecosistema de generacion de imagen anime: conseguir consistencia de personaje (rostro, color de pelo, ojos, ornamentos y uniforme) sin reentrenar el modelo base. Se distribuye en siete checkpoints correspondientes a las epocas E1-E7 del entrenamiento, con E6 marcado por el autor como opcion recomendada a fuerza 0.8. El repositorio ocupa 3.2 GB e incluye pesos en formato safetensors, imagenes de muestra y registros de evaluacion.

La relevancia es acotada pero clara para quien trabaja con pipelines de Stable Diffusion XL orientados a anime: el adaptador esta calibrado contra un base concreto (Illustrious v17), documenta los tokens de activacion y advierte de los modos de fallo tipicos (deriva de color de ojos, perdida de ornamentos). Su licencia CreativeML OpenRAIL-M permite uso comercial con las restricciones habituales de esa licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL; base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (rango 64, alpha 32; cada checkpoint pesa 456.496.828 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors de precision nativa |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 checkpoints: E1-E7) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre el UNet del checkpoint waiIllustriousSDXL v17, un modelo SDXL afinado para ilustracion anime. No modifica el VAE ni el text encoder de forma independiente; se carga como modulo adicional en el pipeline diffusers o en ComfyUI mediante la sintaxis `<lora:nombre:fuerza>`. El repositorio incluye siete ficheros, uno por epoca, con el septimo sin numeracion (`aoba_wakura.safetensors`).

El entrenamiento se realizo con 91 pares imagen-texto, con repeticiones 2, sobre hardware DGX Spark y ComfyUI. El autor documenta una evaluacion comparativa en dos rondas (Round 1 y Round 3) sobre las epocas E5-E7, de la que concluye que E6 ofrece el mejor equilibrio entre identidad facial, fidelidad del uniforme de combate y estabilidad en atuendos alternativos. No se detallan la composicion del dataset, el numero de pasos, la resolucion de entrenamiento ni si hubo aumento de datos o regularizacion; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de imagenes de un personaje concreto (Aoba Wakura) sobre SDXL, con identidad consistente entre generaciones.
- Control de atuendos mediante tokens dedicados: `aoba_wakura_combat_uniform`, `aoba_wakura_red_turtleneck`, `aoba_wakura_black_turtleneck`, `aoba_wakura_green_tank_top`, `aoba_wakura_white_tank_top`.
- Token de identidad `aoba_wakura` que activa rasgos faciales, pelo corto azul claro/lavanda, ojos azules y ornamentos alares en el pelo.
- Soporte de composicion con otros LoRA y con el ecosistema estandar de SDXL (prompts positivos y negativos, CFG, CLIP skip).
- Capacidad multilingue de prompt limitada a en y zh, segun los metadatos del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un adaptador de difusion de imagen.
- No dispone de modo thinking, vision, audio ni capacidades multimodales mas alla de la generacion texto-a-imagen.

## Casos de uso

- Ilustracion de fan art consistente: usar el token `aoba_wakura` junto con descripciones de escena para generar multiples ilustraciones del personaje manteniendo rasgos faciales y paleta. Adecuado porque el LoRA fija identidad sin necesidad de describir el rostro en cada prompt.
- Series de imagenes para narrativa visual o doujinshi: generar paneles con el uniforme de combate (`aoba_wakura_combat_uniform`) y variantes de vestuario usando los tokens de atuendo, manteniendo coherencia entre escenas.
- Prototipado rapido de personajes para proyectos derivados: validar disenos de vestuario alternativos combinando el LoRA con prompts descriptivos, dado que el adaptador conserva la identidad aunque cambie la ropa.
- Composicion con otros LoRA de estilo: al ser un adaptador de bajo rango, puede apilarse con LoRA de estilo o de iluminacion en ComfyUI, ajustando la fuerza de cada uno para equilibrar identidad y estetica.
- Generacion de material promocional no oficial para comunidades de la serie: banners, avatares y fichas de personaje con resoluciones verticales (el autor documenta 832x1216) adecuadas para redes.
- Evaluacion y comparacion de checkpoints: el repositorio incluye siete epocas y registros de evaluacion, lo que permite reproducir la comparativa E5-E7 y elegir el checkpoint segun el caso (E6 como opcion por defecto, E7 como alternativa final).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor aporta una evaluacion cualitativa en dos rondas con imagenes de muestra y una tabla de decision:

| Candidato | Observacion del autor | Decision |
|---|---|---|
| E5 | Identidad en uniforme de combate usable | Alternativa |
| E6 | Retrato con pelo corto azul, ojos azules y uniforme de cuello alto; cuerpo completo conserva charreteras, ribete rojo y ornamentos alares; atuendo casual mantiene bob y ornamentos | Recomendado a fuerza 0.8 |
| E7 | Muy proximo a E6 | Alternativa final |

Ajustes de generacion documentados para las muestras: ComfyUI, sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un LoRA sobre SDXL, los requisitos son los del modelo base (tipicamente 8-12 GB en fp16 con optimizaciones, mas si se apilan varios adaptadores).
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizo en DGX Spark; para inferencia se asume el rango habitual de SDXL (RTX 3060 12 GB en adelante, RTX 4090, A100/H100 para lotes grandes).
- Compatibilidad con GPU de consumo: previsiblemente si, en tarjetas con 8 GB o mas aplicando offloading o cuantizacion del base; no confirmado en la informacion disponible.
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI (entorno usado por el autor). No se documentan vLLM, llama.cpp ni Ollama, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada (parametros, contexto, rendimiento o licencia de alternativas). La comparacion cuantitativa figura como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AobaWakura-Lora (E6) | no disponible (rango 64) | no aplica | evaluacion cualitativa del autor | creativeml-openrail-m | Hugging Face, ModelScope |
| Alternativas de LoRA de personaje | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un derivado no oficial: no cuenta con el respaldo del titular de los derechos de *Mato Seihei no Slave*; el uso comercial del personaje puede infringir derechos de autor independientemente de la licencia del adaptador.
- Deriva de color de ojos: en atuendos casuales, si se omite `blue eyes` en el prompt, los ojos pueden virar hacia morado. El autor lo documenta explicitamente.
- Perdida de ornamentos: en tomas de combate conviene escribir los ornamentos alares si se necesitan fijados, porque las leyendas de entrenamiento a menudo omiten color de pelo y ojos.
- Dependencia del modelo base: esta calibrado contra waiIllustriousSDXL v17; su comportamiento con otros checkpoints SDXL o Illustrious no esta verificado y puede degradar la identidad.
- Fuerza recomendada 0.8: valores mas altos pueden saturar el estilo o rigidizar la composicion; valores mas bajos pueden perder rasgos. No hay barrido sistematico publicado mas alla de la evaluacion cualitativa.
- Riesgo de sobreajuste al dataset: con 91 pares y repeticiones 2, la variedad de poses y escenas puede ser limitada; escenas fuera de la distribucion de entrenamiento pueden producir artefactos.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos y de ciertas aplicaciones descritas en el anexo de la licencia) y exige mantener el aviso de licencia en redistribuciones.
- Idiomas de prompt limitados a en y zh; no hay evidencia de soporte para prompts en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/AobaWakura-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/AobaWakura-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/AobaWakura-Lora
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
