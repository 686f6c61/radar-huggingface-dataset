# abbuibuibui/ShushuSuruga-Lora

## Resumen

ShushuSuruga-Lora es un LoRA de personaje para modelos de difusión SDXL, entrenado por el usuario abbuibuibui para reproducir a Shushu Suruga, personaje de la serie *Mato Seihei no Slave*. No es un modelo de lenguaje ni un transformer generativo de texto: es un adaptador de bajo rango que se aplica sobre un modelo base de imagen (waiIllustriousSDXL v17 en la rama principal) para condicionar la generación hacia la identidad visual del personaje, incluyendo rostro, peinado y varios conjuntos de ropa.

El repositorio es en realidad una colección de tres linajes de LoRA: los pesos de la raíz corresponden a WAI/Illustrious, el subdirectorio `autism_pony/` contiene una variante entrenada sobre AutismMix Pony y `moss/` una variante para MOSS-Image. Cada linaje requiere su propio modelo base y sus propios prompts, y no deben mezclarse. El autor publica además un dataset asociado y una evaluación comparativa entre épocas (E1–E7) que recomienda la época E6 a fuerza 0.8 para el linaje WAI.

El modelo resulta relevante para quien necesite generar ilustraciones consistentes de este personaje concreto en pipelines de Stable Diffusion XL, con control fino mediante tokens de activación y pesos de ropa. Su utilidad es acotada: no aporta capacidades generales nuevas, sino un ajuste de identidad sobre un modelo base ya existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; rank 64, alpha 32 |
| Parametros totales | no disponible (cada fichero pesa 456.495.172 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; resolución de entrenamiento con buckets hasta 1536) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF declaradas) |
| Idiomas soportados | en, zh (etiquetas del repositorio; los prompts de ejemplo están en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena como LoRA de rango 64 y alpha 32 sobre waiIllustriousSDXL v17, un modelo base derivado de SDXL orientado a ilustración anime. El entrenamiento usó AdamW en precisión bf16, con buckets de resolución con tope de 1536 y 7 épocas. El dataset consta de 89 pares de imágenes organizadas en cuatro conjuntos de ropa (Combat_Uniform, Mint_Hoodie, White_Tank_Top y Yellow_T_Shirt), con un factor de repetición de 2. El pipeline de entrenamiento se ejecutó en una NVIDIA DGX Spark con ComfyUI.

Las leyendas de entrenamiento se generaron con `keep_tokens = 2`, y el autor advierte que el color de pelo y de ojos a menudo se omitió en las captions, por lo que conviene añadirlo explícitamente en la inferencia. El token de activación es `nei_ookawamura` (nombre interno heredado del proceso de entrenamiento, distinto del nombre del personaje) y los tokens de ropa mantienen el mismo prefijo: `nei_ookawamura_combat_uniform` y `nei_ookawamura_mint_hoodie`. Los nombres de fichero siguen el nombre del personaje aunque los triggers no coincidan.

El repositorio incluye además dos linajes secundarios: una variante entrenada sobre AutismMix Pony (cuyas muestras se renderizaron con AutismMix Confetti) y una variante para MOSS-Image. El autor insiste en no mezclar modelos base, prompts ni negativos entre linajes.

## Capacidades

- Generación de ilustraciones de personaje con identidad consistente: rostro, corte de pelo bob rubio corto, flequillo, ojos azules y cinta de lazo azul.
- Control de vestuario mediante tokens dedicados: uniforme de combate (túnica azul sin mangas con ribete rojo, mangas separadas, pantalón corto y botas altas) y sudadera mint con capucha.
- Composición en múltiples planos y encuadres: retrato frontal, tres cuartos, perfil, cuerpo completo, figura sentada y escenas nocturnas.
- Integración con el ecosistema diffusers y con ComfyUI mediante la sintaxis `<lora:nombre:fuerza>`.
- Ajuste de fuerza del adaptador entre 0.4 y 1.0, con comportamiento evaluado en la matriz E5–E7 × 10 escenas × 4 fuerzas.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustración de fan art consistente: aplicar el LoRA a fuerza 0.8 sobre waiIllustriousSDXL v17 con el prompt de ejemplo permite obtener retratos y cuerpos completos del personaje con rasgos estables entre generaciones, gracias a la evaluación sistemática de épocas que respalda la elección de E6.
- Creación de hojas de personaje para proyectos derivados: la matriz de evaluación incluye vistas frontal, tres cuartos y perfil, útiles para documentar el diseño del personaje en un documento de referencia.
- Variaciones de vestuario en una misma sesión: alternar entre `nei_ookawamura_combat_uniform` y `nei_ookawamura_mint_hoodie` permite generar el mismo personaje en contextos formales y casuales sin reentrenar.
- Escenas narrativas nocturnas: las muestras de calle nocturna y exterior de tarde demuestran que el adaptador mantiene la identidad bajo iluminación compleja, útil para ilustrar viñetas o fan comics.
- Pruebas comparativas de adaptadores: la estructura del repositorio (tres linajes con el mismo personaje) sirve para evaluar cómo se comporta una misma identidad sobre distintos modelos base (Illustrious, AutismMix Pony, MOSS-Image).
- Prototipado rápido en ComfyUI: con Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolución 832×1216 se obtienen resultados sin hires fix ni ADetailer, lo que agiliza la iteración en un flujo de trabajo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta únicamente una evaluación cualitativa por épocas y fuerzas:

| Candidato | Observación | Decisión |
|---|---|---|
| E5 | Identidad rubia utilizable | Alternativa |
| E6 | Retrato con bob rubio, flequillo, lazo azul y uniforme de cuello alto; cuerpo completo con túnica azul, ribete rojo, mangas separadas, pantalón corto y botas altas | Recomendada a 0.8 |
| E7 | Muy cercana a E6 | Alternativa final |

## Requisitos de hardware

- El adaptador pesa 456.495.172 bytes por fichero (unos 456 MB), por lo que el requisito real de VRAM lo determina el modelo base SDXL, no el LoRA.
- SDXL en precisión completa requiere del orden de 10–12 GB de VRAM para inferencia; con cuantización o técnicas de ahorro de memoria puede ejecutarse en GPUs de consumo como la RTX 3060 de 12 GB, RTX 4070 o RTX 4090.
- Para entrenamiento, el autor empleó una NVIDIA DGX Spark con ComfyUI.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI (usada por el autor en las muestras) y, en general, cualquier frontend compatible con LoRA de SDXL.
- Ajustes de referencia del autor: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolución 832×1216, sin hires fix ni ADetailer. Para el linaje AutismMix: Euler a, 24 pasos, CFG 6, CLIP skip 2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tokens de activación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShushuSuruga-Lora (WAI) | LoRA de personaje | waiIllustriousSDXL v17 | `nei_ookawamura` + tokens de ropa | creativeml-openrail-m | Hugging Face y ModelScope |
| ShushuSuruga-Lora (AutismMix Pony) | LoRA de personaje | AutismMix Pony | mismos tokens, pesos distintos | creativeml-openrail-m | Hugging Face (subdirectorio `autism_pony/`) |
| ShushuSuruga-Lora (MOSS-Image) | LoRA de personaje | MOSS-Image | mismos tokens, pesos distintos | creativeml-openrail-m | Hugging Face (subdirectorio `moss/`) |

No se dispone de información sobre otros LoRA de personaje comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje permanecen con sus titulares originales.
- Los tres linajes del repositorio no son intercambiables; mezclar modelos base, prompts o negativos entre WAI, AutismMix Pony y MOSS-Image degrada el resultado.
- El token de activación (`nei_ookawamura`) no coincide con el nombre del personaje ni con el nombre de los ficheros, lo que puede inducir a error.
- Las captions omitieron con frecuencia el color de pelo y ojos, por lo que es necesario especificarlos en el prompt para evitar derivas de identidad.
- La licencia creativeml-openrail-m impone restricciones de uso comercial que deben revisarse antes de emplear el modelo en producción; además, se acumulan las restricciones del modelo base correspondiente.
- No hay datos publicados sobre sesgos, tasa de alucinación visual ni robustez fuera de los conjuntos de ropa entrenados (Combat_Uniform, Mint_Hoodie, White_Tank_Top, Yellow_T_Shirt).
- Solo se declaran los idiomas en y zh; no hay evidencia de soporte para prompts en castellano.
- El repositorio tiene 833 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/ShushuSuruga-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/ShushuSuruga-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/ShushuSuruga-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/ShushuSuruga-Dataset
- Notas de evaluación (chino): `evaluation/横向测评记录.md` dentro del repositorio
