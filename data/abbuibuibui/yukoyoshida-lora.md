# abbuibuibui/YukoYoshida-Lora

## Resumen

YukoYoshida-Lora es un LoRA de personaje no oficial para **Yuko Yoshida** (吉田优子), protagonista del anime y manga *The Demon Girl Next Door* (Machikado Mazoku). Lo desarrolla el usuario abbuibuibui y está pensado para su uso con modelos de difusión de imagen basados en SDXL, concretamente sobre el checkpoint waiIllustriousSDXL v17 (linaje WAI/Illustrious). El repositorio, sin embargo, alberga tres linajes independientes de pesos: el LoRA original para Illustrious (en la raíz), un LoRA para AutismMix Pony (en `autism_pony/`) y un LoRA para MOSS-Image (en `moss/`). Cada linaje requiere su propio modelo base y sus propios prompts, y no deben mezclarse.

El modelo resuelve el problema de generar de forma consistente y fiel un personaje concreto con múltiples atuendos y expresiones, algo que los checkpoints base no garantizan por sí solos. Para ello se entrenaron tokens de identidad y de vestuario específicos (`yuko_yoshida`, `yuko_yoshida_school_uniform`, `yuko_yoshida_crisis_management_form`, entre otros), lo que permite controlar la apariencia del personaje mediante prompts estructurados.

Es relevante ahora porque forma parte del ecosistema de LoRAs de personaje para SDXL/Illustrious, muy extendido en flujos de trabajo con ComfyUI y Automatic1111. El autor publica además una evaluación comparativa entre épocas (E1–E7) y recomienda explícitamente la época E6 a fuerza 0.8 para el linaje WAI/Illustrious, lo que aporta una guía de uso poco habitual en este tipo de publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre SDXL; modelo base waiIllustriousSDXL v17 (linaje principal), AutismMix Pony (linaje secundario) y MOSS-Image (tercer linaje) |
| Parametros totales | no disponible (LoRA de rango 64 / alpha 32 en el linaje WAI/Illustrious) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cada archivo del linaje principal pesa 456.498.604 bytes) |
| Idiomas soportados | en, zh (etiquetas de prompt y documentacion) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El linaje principal es un LoRA de rango 64 y alpha 32 entrenado sobre waiIllustriousSDXL v17, un checkpoint SDXL orientado a ilustracion anime. El entrenamiento empleó AdamW en precisión bf16, buckets con límite de 1536 y 7 épocas. El conjunto de datos consta de 118 pares imagen-texto que cubren 7 atuendos, con repeticiones 3. Las captions se generaron con `keep_tokens = 2`, y el autor advierte que los colores de pelo y ojos a menudo se omiten en las captions, por lo que conviene añadirlos explícitamente en el prompt. El sujeto se etiqueta con `1girl`.

El repositorio incluye tres linajes entrenados sobre bases distintas. El linaje AutismMix Pony se entrenó sobre AutismMix Pony y las muestras se renderizaron con AutismMix Confetti; su apariencia verificada es pelo largo rosa, flequillo, ahoge, ojos ámbar y cuernos grises. El tercer linaje, MOSS-Image, se distribuye en el subdirectorio `moss/`. El autor insiste en no mezclar pesos, prompts ni negativos entre linajes. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, al tratarse de un adaptador de difusión y no de un modelo de lenguaje.

## Capacidades

- Generación de imágenes de un personaje concreto (Yuko Yoshida) con identidad consistente mediante el token `yuko_yoshida`.
- Control de vestuario mediante tokens dedicados: `yuko_yoshida_school_uniform`, `yuko_yoshida_crisis_management_form`, `yuko_yoshida_blue_tank_top`, `yuko_yoshida_gym_uniform`, `yuko_yoshida_light_blue_casual`, `yuko_yoshida_pink_plaid_top`, `yuko_yoshida_pink_striped_hoodie`.
- Generación de retratos, planos de tres cuartos, perfiles, cuerpo completo, poses sentadas y escenas con fondos simples o complejos (incluida escena nocturna), según la evaluación publicada.
- Compatibilidad con flujos de trabajo de ComfyUI y con la librería diffusers.
- Soporte de prompts en inglés y en chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo: es exclusivamente un modelo de generación de imagen.

## Casos de uso

- Ilustración de fan art de personaje: el LoRA permite generar a Yuko Yoshida de forma reconocible sin necesidad de describir su diseño en cada prompt, usando `yuko_yoshida` junto con los tokens de vestuario.
- Creación de paneles de cómic o doujinshi: la evaluación del autor cubre expresiones y planos variados (retrato, tres cuartos, perfil, sentada), lo que facilita mantener la coherencia del personaje entre viñetas.
- Prototipado de personajes para proyectos derivados: al estar entrenado sobre 7 atuendos distintos, sirve para explorar variaciones de vestuario del personaje en un mismo estilo visual.
- Integración en pipelines de generación por lotes con diffusers: el formato safetensors y la librería diffusers permiten cargar el LoRA en scripts automatizados para producir conjuntos de imágenes.
- Flujos de trabajo en ComfyUI para artistas: el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolución 832×1216) que sirven como configuración de partida reproducible.
- Experimentación con distintos linajes base: el repositorio permite comparar el mismo personaje sobre waiIllustriousSDXL, AutismMix Pony y MOSS-Image, útil para estudiar cómo cambia el estilo según el checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor sí publica una evaluación cualitativa comparativa entre épocas:

| Candidato | Observación | Decisión |
|---|---|---|
| E5 | Pelo largo castaño y ojos castaños utilizables; uniforme escolar a menudo presente | Alternativa |
| E6 | Retrato con pelo largo castaño, ojos castaños y uniforme escolar; silueta de Yuko estable | Recomendado a 0.8 |
| E7 | Cercano a E6 | Alternativa final |

La evaluación se realizó en dos rondas: la primera cribó E1–E7 a fuerza 0.8, y la tercera aplicó una matriz sobre E5, E6 y E7 con 10 escenas y 4 fuerzas (0.4, 0.6, 0.8 y 1.0).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el LoRA; depende del checkpoint base SDXL sobre el que se aplique.
- GPU recomendadas: no disponible en la información proporcionada; al tratarse de un adaptador SDXL, los requisitos vienen determinados por el modelo base.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del checkpoint base y de la resolución (el autor usa 832×1216 en sus muestras).
- Opciones de despliegue: ComfyUI (documentado por el autor) y diffusers (librería declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución de muestra | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YukoYoshida-Lora (linaje WAI/Illustrious) | LoRA de personaje | waiIllustriousSDXL v17 | 832×1216 en muestras | creativeml-openrail-m | Hugging Face, ModelScope |
| YukoYoshida-Lora (linaje AutismMix Pony) | LoRA de personaje | AutismMix Pony | 832×1216 en muestras | creativeml-openrail-m | Hugging Face |
| YukoYoshida-Lora (linaje MOSS-Image) | LoRA de personaje | MOSS-Image | no disponible | creativeml-openrail-m | Hugging Face |

No se dispone de información sobre otros LoRAs de personaje comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje permanecen con sus propietarios originales.
- Los tres linajes del repositorio no son intercambiables: mezclar pesos, prompts o negativos entre waiIllustriousSDXL, AutismMix Pony y MOSS-Image produce resultados incorrectos.
- Las captions de entrenamiento omiten con frecuencia el color de pelo y ojos, por lo que es necesario añadirlos manualmente en el prompt para obtener la apariencia esperada.
- La licencia creativeml-openrail-m impone restricciones de uso comercial; conviene revisar sus términos antes de emplearlo en producción.
- Riesgo de sobreajuste o pérdida de calidad fuera de las fuerzas recomendadas: el autor solo valida E6 a 0.8 en el linaje principal y E6 a 1.0 en el linaje AutismMix Pony.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo de imagen, el riesgo relevante es la generación de anatomía o detalles inconsistentes, no evaluado cuantitativamente en la información disponible.
- El tamaño del repositorio (7.9 GB) incluye los tres linajes y material de evaluación, no solo un archivo de LoRA.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/YukoYoshida-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/YukoYoshida-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/YukoYoshida-Dataset
- Notas de evaluación (chino): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
