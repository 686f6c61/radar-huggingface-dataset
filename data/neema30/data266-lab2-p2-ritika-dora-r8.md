# neema30/data266-lab2-p2-ritika-dora-r8

## Resumen

`neema30/data266-lab2-p2-ritika-dora-r8` es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) de rango 8 entrenado sobre el UNet de Stable Diffusion 1.5. Lo publica Ritika Neema en el contexto de la asignatura DATA 266 (Lab 2, equipo 05) y no es un modelo generativo completo, sino un conjunto de pesos delta que se acoplan al UNet base mediante PEFT. El objetivo es especializar el modelo en el estilo visual del conjunto de datos `reach-vb/pokemon-blip-captions`, un dataset de ilustraciones tipo Pokémon con descripciones BLIP.

El adaptador afecta exclusivamente a las proyecciones de atención `to_q`, `to_k`, `to_v` y `to_out.0` del UNet, con 1.694.208 parámetros entrenables. El entrenamiento se realizó a resolución 512, durante 1200 pasos con batch efectivo 4, y consumió 2,62 GB de VRAM en una Tesla T4 en poco más de 31 minutos. Es, por tanto, un artefacto académico reproducible y de coste muy bajo, útil como ejemplo de fine-tuning eficiente en parámetros sobre difusión.

Su relevancia es limitada fuera del ámbito docente: el repositorio pesa 0,0 GB (sin pesos visibles en el momento de la consulta), tiene cero descargas y cero likes, y hereda la licencia CreativeML OpenRAIL-M del modelo base, mientras que el dataset de entrenamiento es CC BY-NC-SA 4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (LoRA con descomposición de magnitud y dirección) sobre UNet de Stable Diffusion 1.5; pipeline text-to-image con VAE y text encoder CLIP congelados |
| Parametros totales | 1.694.208 parámetros entrenables en el adaptador (el UNet base no se incluye en el repo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusión; el prompt de texto se trunca a la longitud máxima del tokenizador CLIP, 77 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, FP16 ni INT8) |
| Idiomas soportados | No disponible (los prompts del dataset están en inglés, pero no se declara soporte multilingüe) |
| Licencia | CreativeML OpenRAIL-M (modelo base); dataset de entrenamiento CC BY-NC-SA 4.0, uso no comercial |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |
| Modulos objetivo | `to_q`, `to_k`, `to_v`, `to_out.0` del UNet |
| Rango / alpha | 8 / 8 |
| Resolución de entrenamiento | 512 |
| Pasos / batch efectivo | 1200 / 4 (batch 2 × acumulación 2) |
| Optimizador / LR | AdamW / 0,0001 |
| Semillas (entrenamiento / split) | 266 / 266 |
| Pico de VRAM en entrenamiento | 2,62 GB (Tesla T4) |
| Tiempo de entrenamiento | 31,57 min (0,5262 GPU-horas) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion 1.5, un transformer convolucional con bloques de atención cruzada que condiciona la generación de latentes sobre el prompt de texto codificado por CLIP. DoRA descompone cada matriz de pesos en un componente de magnitud y otro de dirección, y aplica la actualización de bajo rango solo a la dirección; en la práctica se comporta como LoRA con un reescalado por norma de columna, lo que suele mejorar la estabilidad con rangos pequeños. Aquí se usa rango 8 y alpha 8 sobre las cuatro proyecciones de atención del UNet, dejando congelados el VAE, el text encoder y el resto de capas.

El entrenamiento emplea el dataset `reach-vb/pokemon-blip-captions`, con pares imagen-texto generados por BLIP, a resolución 512 durante 1200 pasos con AdamW y learning rate 1e-4. No se documenta el número total de tokens de imagen ni la composición exacta del split, más allá de las semillas 266 para entrenamiento y partición. Tampoco se indica uso de RLHF, DPO ni preferencias humanas, algo esperable en un fine-tuning de difusión de este tipo. La innovación técnica reseñable es el uso de DoRA en lugar de LoRA estándar con un presupuesto de parámetros muy reducido (1,69 M), y la inclusión de métricas de evaluación reproducibles: KID frente al split de test (0,05169 ± 0,00617), CLIP score medio (0,3156) y LPIPS entre semillas (0,7115).

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 píxeles, condicionada por prompts en inglés, mediante el pipeline `text-to-image` de Diffusers.
- Especialización estilística en ilustraciones tipo Pokémon: el adaptador desplaza la distribución del UNet base hacia el estilo del dataset de entrenamiento.
- Aplicación como adaptador PEFT sobre Stable Diffusion 1.5: se carga con `peft.LoraConfig(use_dora=True)` y `set_peft_model_state_dict`, sin necesidad de reentrenar el modelo completo.
- Compatibilidad con el ecosistema Diffusers y con el safety checker de Stable Diffusion, que el autor indica haber usado para filtrar las salidas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking: es un modelo de difusión, no un LLM.
- Capacidad multilingüe no declarada; el condicionamiento textual depende del tokenizador CLIP de SD 1.5, con prompts efectivos en inglés.

## Casos de uso

- Docencia y reproducción de experimentos de PEFT: sirve como ejemplo mínimo y verificable de fine-tuning DoRA sobre difusión, con hiperparámetros, semillas y métricas documentadas para replicar el resultado en una T4.
- Generación de ilustraciones con estética Pokémon para prototipos personales: el adaptador produce imágenes coherentes con ese estilo a partir de descripciones textuales, útil en maquetas o demos no comerciales.
- Estudio comparativo DoRA frente a LoRA: al fijar rango 8 y alpha 8, permite medir la diferencia de calidad (KID, CLIP score) frente a un adaptador LoRA equivalente sobre el mismo dataset.
- Investigación sobre sesgo de estilo en modelos de difusión: el adaptador ilustra cómo un dataset pequeño y homogéneo desplaza la distribución del modelo base y degrada el rendimiento fuera de dominio.
- Generación de assets para juegos o cómics amateur: con la licencia no comercial del dataset, encaja en proyectos personales o educativos que no requieran explotación comercial.
- Análisis de sensibilidad a la semilla: el LPIPS entre semillas (0,7115) permite estudiar la variabilidad de las salidas y calibrar el número de muestras necesarias para obtener diversidad aceptable.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| KID vs split de test | 0,05169 ± 0,00617 | Prompts in-domain |
| CLIP score | 0,3156 | 20 prompts × 2 semillas |
| LPIPS entre semillas | 0,7115 | Variabilidad de salida |
| Parametros entrenables | 1.694.208 | Adaptador DoRA r=8 |
| Pico de VRAM (entrenamiento) | 2,62 GB | Tesla T4 |
| Tiempo de entrenamiento | 31,57 min (0,5262 GPU-horas) | 1200 pasos, batch efectivo 4 |

No se han publicado resultados de benchmarks comparativos (FID, MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, más allá de las métricas de evaluación del adaptador recogidas en la model card.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa unos pocos megabytes (1,69 M parámetros en safetensors); el coste real lo determina el UNet de SD 1.5 en FP16, en torno a 4-6 GB con el pipeline completo cargado.
- VRAM para entrenamiento: 2,62 GB de pico en una Tesla T4, según el autor; reproducible en GPUs consumer con al menos 4 GB libres.
- GPU recomendadas: Tesla T4 (validada por el autor), RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 y H100 para lotes mayores o mayor resolución.
- Cabe en GPU consumer: sí, cualquier GPU con 6 GB o más de VRAM puede ejecutar el pipeline en FP16; con cuantización del UNet base se puede bajar aún más.
- Opciones de despliegue: Diffusers + PEFT (`LoraConfig` con `use_dora=True`), ComfyUI y Automatic1111/Forge mediante carga de adaptadores LoRA/DoRA, y ONNX o TensorRT si se exporta el pipeline completo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neema30/data266-lab2-p2-ritika-dora-r8` | 1,69 M (adaptador) | 512×512 | DoRA r=8 sobre SD 1.5 | CreativeML OpenRAIL-M + dataset CC BY-NC-SA 4.0 | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | ~860 M (UNet) | 512×512 | Difusión latente texto-a-imagen | CreativeML OpenRAIL-M | Ampliamente disponible |
| LoRA equivalente sobre SD 1.5 | ~1,7 M (adaptador) | 512×512 | LoRA r=8 sobre el mismo UNet | Depende del autor | No disponible en la información |
| Adaptadores de estilo Pokémon públicos | No disponible | No disponible | LoRA/DoRA sobre SD 1.5 | Variable | No disponible en la información |

No se dispone de datos de benchmarks comparativos frente a estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de estilo marcado: el adaptador está sesgado hacia la estética Pokémon y rinde mal con prompts fuera de dominio, según reconoce el autor.
- Licencia del dataset: `reach-vb/pokemon-blip-captions` es CC BY-NC-SA 4.0, lo que restringe el uso comercial de los pesos derivados aunque el modelo base sea OpenRAIL-M.
- Riesgo de alucinación visual: al ser un modelo de difusión, puede generar anatomías, textos y composiciones incoherentes, especialmente con prompts largos o ambiguos.
- Contexto textual limitado: el condicionamiento pasa por el tokenizador CLIP de SD 1.5, con un máximo de 77 tokens; prompts más largos se truncan.
- Idiomas: no se declara soporte multilingüe; los prompts en castellano pueden degradar la calidad frente al inglés.
- Repositorio vacío en la práctica: 0,0 GB de tamaño y cero descargas, por lo que los pesos pueden no estar disponibles o haber sido retirados; conviene verificar antes de integrarlo en cualquier pipeline.
- Sin garantías de producción: es un artefacto académico sin mantenimiento, sin versionado semántico y sin evaluación fuera del conjunto de test del laboratorio.
- Filtro de seguridad: el autor aplicó el safety checker de Stable Diffusion, pero no se documenta su comportamiento con prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neema30/data266-lab2-p2-ritika-dora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): no disponible en la información proporcionada
- Repositorio PEFT: https://github.com/huggingface/peft
- Diffusers: https://github.com/huggingface/diffusers
