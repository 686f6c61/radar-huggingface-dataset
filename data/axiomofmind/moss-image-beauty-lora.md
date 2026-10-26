# axiomofmind/Moss-image-beauty-lora

## Resumen
Moss-image-beauty-lora es un adaptador LoRA de estilo para generación de imágenes text-to-image, desarrollado por axiomofmind sobre la familia MOSS-Image de OpenMOSS-Team. No es un modelo autónomo: se aplica sobre MOSS-Image-SFT —preferido para inferencia— o MOSS-Image-Base, y está orientado a retratos cercanos y fotografía de belleza editorial, con luz direccional suave, piel y cabello detallados y fondos contenidos.

El adaptador se activa con el token `moss_beauty_style` y se distribuye en formato safetensors para Diffusers/PEFT y ComfyUI nativo, con una conversión GGUF disponible en un repositorio aparte. El checkpoint principal se entrenó durante 2.000 pasos sobre 176 imágenes; existe un checkpoint alternativo de 1.750 pasos entrenado sobre 149 imágenes. Cada checkpoint contiene 504 tensores LoRA y ocupa 70,93 MiB en formato ComfyUI.

Su relevancia práctica está en que permite incorporar un acabado fotográfico de retrato y belleza a un modelo base MOSS-Image sin reentrenar el modelo completo, con licencia Apache-2.0 y flujos de despliegue tanto en Diffusers como en ComfyUI. La información disponible no incluye especificaciones detalladas de la arquitectura interna del modelo base, requisitos de VRAM ni benchmarks cuantitativos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de difusión text-to-image MOSS-Image-SFT; arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible para el adaptador; 504 tensores LoRA y 70,93 MiB por checkpoint en formato ComfyUI |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (generación text-to-image; no se especifica ventana de contexto textual) |
| Tipos de cuantizacion | Pesos LoRA en safetensors; conversión GGUF disponible en repositorio aparte; no se detallan otras cuantizaciones |
| Idiomas soportados | No disponibles; los ejemplos de prompt de la model card están en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Diffusers/PEFT y ComfyUI con claves rekeyed), GGUF |
| Trigger | `moss_beauty_style` |
| Resolución recomendada | 1024 x 1024 |
| Pasos de inferencia recomendados | 30 |
| Guidance scale recomendado | 3.0 |
| Escala LoRA recomendada | 1.0; también evaluadas 0.7, 0.8 y 0.9 |
| Checkpoints | Principal: 2.000 pasos, 176 imágenes; alternativo: 1.750 pasos, 149 imágenes |
| Modelo base preferido | `OpenMOSS-Team/MOSS-Image-SFT` |
| Modelo base compatible | `OpenMOSS-Team/MOSS-Image-Base` |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA, no un modelo de difusión completo. Se entrena contra MOSS-Image-Base, que queda registrado como padre en `adapter_config.json`, pero la model card indica que MOSS-Image-SFT es el modelo preferido para inferencia y que la combinación SFT + LoRA produjo los mejores resultados de evaluación local. Los tensores del adaptador son compatibles con ambos modelos base. No se especifican el rango LoRA, la precisión de entrenamiento, el optimizador ni la resolución de las imágenes de entrenamiento.

El checkpoint principal se entrenó durante 2.000 pasos con 176 imágenes. El checkpoint alternativo, dentro de `alternative-checkpoint-1750/`, se seleccionó de una ejecución más reciente (`moss-beauty-v3`) y se entrenó con un subconjunto más estrecho de 149 imágenes. Ambos usan el mismo trigger y están pensados principalmente para MOSS-Image-SFT. No se documenta el uso de RLHF, DPO ni otras fases de alineamiento. La innovación técnica destacable es la publicación de un archivo ComfyUI con las claves rekeyed de `transformer.layers...` a `diffusion_model.layers...`, necesario para evitar advertencias de `lora key not loaded` en ComfyUI nativo.

## Capacidades
- Generación text-to-image de retratos cercanos y fotografía de belleza con el trigger `moss_beauty_style`.
- Control de estilo editorial: luz direccional suave, piel y cabello detallados, expresiones neutras y fondos restringidos.
- Compatibilidad con MOSS-Image-SFT como modelo preferido y con MOSS-Image-Base como padre de entrenamiento.
- Integración en Diffusers mediante `pytorch_lora_weights.safetensors` y en ComfyUI nativo mediante el archivo rekeyed.
- Uso con conversión GGUF a través del repositorio `Moss-image-beauty-lora-GGUF` y `MOSS-Image-SFT-GGUF`.
- Ajuste de intensidad del estilo con escala LoRA entre 0.7 y 1.0; la model card recomienda 1.0 como punto de partida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni otras capacidades de modelos multimodales de lenguaje.

## Casos de uso
- Previsualización de sesiones de fotografía de belleza: generar referencias a 1024 x 1024 con 30 pasos y guidance 3.0 para construir moodboards de luz, encuadre y maquillaje antes de una sesión real.
- Creación de retratos editoriales para proyectos creativos: el adaptador produce un acabado de revista con luz suave y fondos neutros, adecuado para maquetas de portadas, campañas ficticias o presentaciones de estilo.
- Pruebas de concepto en aplicaciones de fotografía o maquillaje: generar caras sintéticas para interfaces de demostración y pruebas de UX, con revisión humana y sin presentarlas como personas reales.
- Aumento controlado de datasets de prueba: crear variaciones de retratos con distintas luces y encuadres para validar pipelines de detección facial o segmentación, asumiendo sesgos y necesidad de supervisión.
- Producción de contenido en ComfyUI: cargar el archivo nativo en `ComfyUI/models/loras/`, usar fuerza de modelo 1.0 y fuerza CLIP 0.0, y anteponer el trigger para lotes de retratos.
- Experimentación con adaptadores LoRA: comparar el checkpoint de 2.000 pasos con el alternativo de 1.750 y estudiar el efecto de escalas 0.7, 0.8, 0.9 y 1.0 sobre fidelidad al prompt y fuerza del estilo.
- Prototipado de personajes para narrativa visual: generar retratos de personajes con variaciones de luz y vestuario; no garantiza consistencia de identidad entre imágenes.
- Docencia y demostración técnica: ilustrar cómo un LoRA pequeño modifica el estilo de un modelo de difusión y cómo se rekeyean pesos para ComfyUI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La única evaluación documentada es cualitativa y local por parte del autor: se probaron escalas LoRA 0.7, 0.8, 0.9 y 1.0, y se eligió 1.0 como equilibrio preferido entre tratamiento de retrato y fidelidad al prompt. No se proporcionan métricas FID, CLIPScore, evaluaciones humanas cuantitativas ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. La información proporcionada no incluye especificaciones del modelo base MOSS-Image-SFT ni requisitos oficiales de memoria.
- VRAM añadida por el adaptador: aproximadamente 70,93 MiB por checkpoint LoRA en formato ComfyUI; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no disponibles. No se puede confirmar qué GPU consumer o profesional es suficiente para MOSS-Image-SFT.
- Compatibilidad con GPU consumer: no confirmada. Al no documentarse el tamaño del modelo base ni su precisión de inferencia, no es posible afirmar que quepa en una RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: Diffusers con `pytorch_lora_weights.safetensors`; ComfyUI nativo desde el commit `b1a247c` o superior con el archivo rekeyed; flujo GGUF con `MOSS-Image-SFT-GGUF` y la conversión del LoRA.
- vLLM, TGI y llama.cpp: no aplican a este tipo de adaptador de difusión; para GGUF debe usarse el flujo compatible con MOSS-Image-SFT-GGUF.
- Latencia y throughput: no disponibles. La configuración recomendada es 30 pasos a 1024 x 1024, guidance 3.0 y escala LoRA 1.0.

## Comparativa con modelos similares
| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `axiomofmind/Moss-image-beauty-lora` | Adaptador LoRA de estilo para MOSS-Image | 504 tensores; 70,93 MiB por checkpoint | No aplica | Sin benchmarks publicados; evaluación cualitativa local | Apache-2.0 | HuggingFace |
| `OpenMOSS-Team/MOSS-Image-SFT` | Modelo base text-to-image | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| `OpenMOSS-Team/MOSS-Image-Base` | Modelo base text-to-image, padre de entrenamiento | No disponible | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de información sobre otros adaptadores LoRA de retrato o belleza comparables en la búsqueda proporcionada. La comparación directa con MOSS-Image-SFT y MOSS-Image-Base se limita a su relación como modelo base y a la compatibilidad declarada; no hay datos de parámetros, contexto, licencia o rendimiento de los modelos base en la información disponible.

## Limitaciones y advertencias
- No es un modelo autónomo: requiere MOSS-Image-SFT o MOSS-Image-Base para generar imágenes.
- El trigger `moss_beauty_style` debe colocarse al principio del prompt; sin él, el estilo aprendido no se activa de forma fiable.
- El checkpoint principal usa 176 imágenes y el alternativo 149; la cobertura es limitada y puede favorecer un tipo concreto de retrato de belleza frente a otros rostros, edades, tonos de piel o contextos.
- No hay benchmarks públicos ni evaluación cuantitativa; los resultados dependen del prompt, la semilla, la escala LoRA y el modelo base elegido.
- Los ejemplos de la model card están en inglés y no se documentan idiomas soportados; no se debe asumir un rendimiento multilingüe equivalente.
- En ComfyUI, el archivo raíz de Diffusers puede producir advertencias de `lora key not loaded`; debe usarse `MOSS-Image-Beauty-LoRA-ComfyUI.safetensors`.
- La licencia Apache-2.0 cubre el adaptador, pero no se documentan la licencia del modelo base ni los derechos de las imágenes de entrenamiento; deben verificarse antes de un uso comercial.
- La generación de retratos sintéticos puede facilitar suplantación de identidad o deepfakes; es necesario aplicar consentimiento, salvaguardas y revisión humana.
- La resolución recomendada es 1024 x 1024 y el negative prompt recomendado es vacío; no se documenta el comportamiento con otras resoluciones o prompts negativos.
- No dispone de tool calling, agentes, visión de entrada, audio ni razonamiento multi-paso; su alcance es exclusivamente la generación de imágenes.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/axiomofmind/Moss-image-beauty-lora)
- [Conversión GGUF del LoRA](https://huggingface.co/axiomofmind/Moss-image-beauty-lora-GGUF)
- [MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [MOSS-Image-Base](https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base)
- [MOSS-Image-SFT-GGUF](https://huggingface.co/axiomofmind/MOSS-Image-SFT-GGUF)
