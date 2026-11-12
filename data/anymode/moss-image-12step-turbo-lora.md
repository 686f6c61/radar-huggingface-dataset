# anyMODE/moss-image-12step-turbo-lora

## Resumen

MOSS-Image 12-Step Turbo Distillation LoRA (Rank 64) es un adaptador LoRA de destilación para el modelo de difusión texto-a-imagen MOSS-Image-SFT, desarrollado por el usuario anyMODE. Su función es acelerar la inferencia del modelo base de 5.200 millones de parámetros, permitiendo generar imágenes fotorrealistas en 12 pasos con CFG 1.0, frente a los 24 pasos con CFG 3.0 que requiere el modelo original. El adaptador está destilado directamente del modelo base mediante coincidencia de trayectorias online profesor-alumno.

El LoRA incorpora dos técnicas destacadas: la proyección ortogonal CFG-Zero*, que evita la sobreexposición de color y los recortes de contraste al operar sin guidance negativa, y Differential Guidance, que preserva microtexturas, poros de piel y definición de bordes. Está diseñado específicamente para ComfyUI y se distribuye con licencia Apache 2.0.

El repositorio ocupa 0,9 GB y contiene tres variantes de pesos: una versión con tensores duplicados para control total de la intensidad, una exportación estándar con metadatos alpha y un adaptador PEFT en bruto para reentrenamiento. Es relevante para desarrolladores que despliegan generación de imágenes en producción y necesitan reducir el coste computacional de la inferencia sin degradar la fidelidad al prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión DiT con flow matching (base: MOSS-Image-SFT) |
| Parametros totales | No disponible para el adaptador; modelo base de 5.200 millones de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base admite bf16 e int8 (moss_image_sft_bf16 / moss_image_sft_int8_convrot) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA rank 64, variantes con alpha=128 y PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MOSS-Image-SFT, un transformer de difusión (DiT) de 5.200 millones de parámetros que emplea flow matching. El LoRA tiene rango 64 y se entrena mediante destilación online profesor-alumno: el modelo base congelado actúa como profesor evaluando la curvatura de la ODE a 24 pasos con CFG 3.0 y supresión de prompt negativo, mientras el alumno predice el campo vectorial acelerado a CFG 1.0. El entrenamiento se alinea directamente con la programación discreta de timesteps del scheduler `simple` nativo de ComfyUI.

Las innovaciones técnicas principales son tres. Primero, la proyección CFG-Zero*, que proyecta ortogonalmente el vector de guía negativa contra el vector condicional positivo para evitar el recorte de contraste y las altas luces quemadas. Segundo, Differential Guidance, que escala el error residual objetivo con gamma=2.0 para amplificar los gradientes únicamente en la dirección correctiva del alumno sin inflar la tasa de aprendizaje de Adam. Tercero, la integración de los tensores de pesos duplicados (variante `_weightsx2`) para obtener autoridad de guiado completa en cualquier loader.

## Capacidades

- Generación de imágenes fotorrealistas texto-a-imagen en 12 pasos de muestreo.
- Operación a CFG 1.0, lo que elimina la necesidad de doble evaluación por paso y reduce el coste de inferencia.
- Fidelidad alta al prompt y anatomía comparable a la configuración de 24 pasos con CFG 3.0, según el autor.
- Preservación de microtexturas, poros de piel y definición de bordes gracias a Differential Guidance.
- Prevención de sobreexposición de color y recortes de contraste mediante CFG-Zero*.
- Compatibilidad nativa con ComfyUI (sampler `euler` o `flow`, scheduler `simple`).
- Distribución en tres formatos: pesos con duplicación, exportación estándar y adaptador PEFT para reentrenamiento.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en producción con latencia reducida: al requerir 12 pasos y CFG 1.0 en lugar de 24 pasos y CFG 3.0, el coste computacional por imagen se reduce aproximadamente a la cuarta parte, lo que permite servir más peticiones por GPU en entornos de alta demanda.
- Prototipado rápido en ComfyUI: investigadores y artistas pueden iterar sobre prompts con retroalimentación casi inmediata, manteniendo la calidad de una configuración de mayor coste.
- Creación de contenido para marketing y redes sociales: el adaptador mantiene la fidelidad al prompt y la calidad anatómica, adecuado para generar material visual coherente con briefs detallados.
- Generación de retratos y fotografía de producto: la preservación de poros, microtexturas y bordes lo hace apto para imágenes que requieren detalle realista en primeros planos.
- Fine-tuning posterior: la variante PEFT en bruto permite continuar el entrenamiento o adaptar el modelo a dominios específicos sin partir de cero.
- Despliegue en infraestructura con presupuesto limitado: la reducción de pasos y la eliminación del guidance negativo permiten ejecutar el pipeline en GPUs de gama media con menor VRAM y tiempo por imagen.
- Integración en pipelines automatizados de generación por lotes: la configuración determinista (12 pasos, CFG 1.0, scheduler simple) simplifica la reproducibilidad y el control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base tiene 5.200 millones de parámetros; en bf16 requiere aproximadamente 10-11 GB solo para pesos, y en int8 alrededor de 5-6 GB, a lo que hay que sumar memoria para activaciones y el pipeline de texto.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, son razonables GPUs con 16 GB o más de VRAM (RTX 4080/4090, A100, H100) para bf16; la variante int8 podría caber en GPUs de 8-12 GB.
- Cabe en GPU de consumo: previsiblemente sí, en modelos con 12-16 GB o más de VRAM usando la cuantización int8 del modelo base, aunque el autor no lo confirma.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado (sampler `euler` o `flow`, scheduler `simple`, 12 pasos, CFG 1.0, strength 1.0). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput estimados: no disponibles. Cualitativamente, la reducción de 24 pasos con CFG 3.0 a 12 pasos con CFG 1.0 disminuye el número de evaluaciones del modelo por imagen en un factor cercano a 4.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anyMODE/moss-image-12step-turbo-lora | LoRA de destilación sobre MOSS-Image-SFT | Base 5.2B; LoRA rank 64 | 12 pasos, CFG 1.0 | Apache 2.0 | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base DiT texto-a-imagen | 5.2B | 24 pasos, CFG 3.0 | No disponible en la información | Hugging Face |
| Otras LoRA turbo de destilación para modelos de difusión | Adaptadores de aceleración | Variable | Reducción de pasos y CFG | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está diseñado exclusivamente para el modelo base OpenMOSS-Team/MOSS-Image-SFT; no es portable a otras arquitecturas de difusión.
- La configuración recomendada (12 pasos, CFG 1.0, scheduler `simple`, sampler `euler` o `flow`) es específica de ComfyUI; desviarse de ella puede degradar la calidad.
- La variante estándar requiere strength 2.0 en loaders que ignoran los metadatos alpha; usar el valor incorrecto altera el resultado.
- No se documentan sesgos conocidos, pero al ser un modelo texto-a-imagen hereda los sesgos del dataset de entrenamiento del modelo base, no especificado.
- Riesgo de alucinación visual y de desviación del prompt inherente a los modelos de difusión; el autor no publica métricas de fidelidad objetivas.
- No se especifican los idiomas soportados para los prompts.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base antes de uso comercial, ya que no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Hugging Face: https://huggingface.co/anyMODE/moss-image-12step-turbo-lora
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
