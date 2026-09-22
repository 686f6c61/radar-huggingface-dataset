# angelic123/wan21_1p3b_phypo_grpo_lora

## Resumen

PhyPO sobre Wan2.1-T2V-1.3B es una colección de 1043 adaptadores LoRA independientes, uno por cada prompt del conjunto PAI-Bench, entrenados sobre el modelo de generación de vídeo texto-a-vídeo Wan-AI/Wan2.1-T2V-1.3B. No se trata de un modelo único ni de un adaptador general: la propuesta es "PhyPO", un esquema de GRPO (optimización por política proximal con recompensa, en su variante de grupo) aplicado en tiempo de test prompt a prompt, de forma que cada instrucción del benchmark obtiene su propio adaptador especializado. El repositorio lo publica el usuario angelic123 con licencia Apache 2.0 y formato PEFT.

El problema que aborda es el ajuste fino guiado por recompensa para mejorar la plausibilidad física de los vídeos generados, un frente activo en la investigación de modelos de mundo y generación de vídeo. Al ser adaptadores de rango bajo (r=4, alpha=8), cada uno ocupa solo 11,3 MiB, lo que permite almacenar el conjunto completo y alternar entre ellos sin reentrenar la base. La contrapartida es que el resultado no es directamente desplegable como un solo modelo: hay que seleccionar el adaptador cuyo identificador coincida con el prompt de interés.

La relevancia actual es doble. Por un lado, sirve como material de reproducibilidad para investigar RL sobre generación de vídeo con presupuesto reducido (la ejecución de origen usó 12 GPU H100). Por otro, demuestra un patrón poco habitual: muchos adaptadores pequeños y efímeros en lugar de un único ajuste agregado, algo útil para estudiar cómo varía la política óptima entre prompts de física, robótica, conducción autónoma o sentido común.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer de difusión (DiT) del modelo base Wan2.1-T2V-1.3B |
| Parametros totales | Modelo base: 1.3B (según nomenclatura del modelo base). Adaptadores: rango r=4, alpha=8, dropout 0,05; número exacto de parámetros entrenables no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM. Longitud máxima de prompt de texto soportada: no disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json), formato PEFT |
| Numero de adaptadores | 1043 (uno por prompt del conjunto PAI-Bench) |
| Tamano por adaptador | 11,3 MiB (aproximadamente 11,5 GiB en total) |
| Tamano del repositorio | 9,1 GB según HuggingFace; 11,5 GiB según la model card (los datos no coinciden) |
| Modulos objetivo de LoRA | q, k, v, o, k_img, v_img |
| Entrenamiento de origen | Ejecucion `wan13b_paibench_grpo_12h100` con 12 GPU H100 |
| Fecha de creacion / actualizacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es Wan2.1-T2V-1.3B, un generador de vídeo texto-a-vídeo de 1300 millones de parámetros. Sobre él se inyectan adaptadores LoRA de rango 4 y alpha 8, con dropout 0,05, aplicados a las proyecciones de atención q, k, v y o, además de las proyecciones específicas de la rama de imagen k_img y v_img, lo que indica que el modelo base usa acondicionamiento por imagen además del prompt textual. Cada adaptador se entrena de forma independiente para un único prompt, con el objetivo declarado de optimizar la plausibilidad física mediante GRPO, un algoritmo de aprendizaje por refuerzo que estima ventajas relativas dentro de un grupo de muestras generadas en lugar de necesitar un modelo de valor separado.

La innovación principal es metodológica, no arquitectónica: el "per-prompt GRPO" convierte el ajuste por refuerzo en un procedimiento de tiempo de test, generando una política especializada por instrucción. La model card no documenta el número de tokens de entrenamiento, la composición del dataset de vídeos más allá del conjunto de prompts PAI-Bench, ni si se aplicaron etapas adicionales de RLHF o DPO, aunque el nombre del método y las etiquetas indican que el entrenamiento se hizo exclusivamente con GRPO. Los prefijos de identificador de prompt (`human_`, `physics_`, `robot_`, `industry_`, `av_`, `common_sense_`, `misc_`) delimitan las siete categorías temáticas cubiertas.

## Capacidades

- Generación de vídeo texto-a-vídeo: hereda del modelo base la capacidad de sintetizar clips a partir de una descripción textual.
- Mejora de plausibilidad física específica por prompt: cada adaptador ha sido optimizado con recompensa para su prompt concreto del conjunto PAI-Bench, no para uso general.
- Cobertura temática del conjunto PAI-Bench: escenas humanas, fenómenos físicos, robótica, entornos industriales, conducción autónoma (`av_`), sentido común y una categoría miscelánea.
- Selección conmutable de política: al ser adaptadores independientes, es posible comparar el comportamiento de distintos adaptadores sobre el mismo modelo base sin recargar pesos completos.
- Acondicionamiento por imagen: los módulos objetivo incluyen `k_img` y `v_img`, lo que apunta a soporte de condicionamiento visual en el modelo base.
- Tool calling / function calling: no disponible; no aplica a un modelo de generación de vídeo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no aplica.
- Capacidades multilingües: no disponible; no se especifica el idioma de los prompts de PAI-Bench.
- Modo "thinking", visión o audio: no disponible; el modelo genera vídeo, no texto ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo para generación de vídeo: el repositorio permite reproducir el experimento de GRPO por prompt y analizar cómo evoluciona cada política frente a su recompensa, usando la ejecución de origen sobre 12 GPU H100 como referencia de coste.
- Evaluación sobre PAI-Bench: al existir un adaptador por prompt, se puede medir de forma aislada la ganancia de cada uno respecto al modelo base y construir una tabla comparativa por categoría temática (física, robótica, conducción, etc.).
- Análisis de ablación base frente a adaptado: cargar el mismo Wan2.1-T2V-1.3B con y sin el adaptador de un prompt dado permite aislar el efecto del ajuste con recompensa sin variar el resto del pipeline.
- Generación de datos sintéticos para entrenar evaluadores de física: los clips renderizados del repositorio de dataset asociado pueden utilizarse como material etiquetado para entrenar o validar modelos que puntúen plausibilidad física.
- Simulación visual para robótica e industria: los adaptadores con prefijos `robot_` e `industry_` producen vídeos de escenas concretas que pueden servir como material ilustrativo o de aumento de datos en prototipos de percepción.
- Escenarios de conducción autónoma en vídeo: los adaptadores `av_` generan clips de tráfico para pruebas de concepto de pipelines de percepción o de visualización, siempre con la advertencia de que no son datos reales.
- Estudio de viabilidad de despliegue multi-adaptador: 1043 adaptadores de 11,3 MiB permiten experimentar con carga dinámica de LoRA en memoria frente a un esquema de modelo único fusionado, y medir el coste de conmutación.
- Ilustración de conceptos de sentido común físico: los adaptadores `common_sense_` y `physics_` permiten generar ejemplos para divulgación o docencia sobre qué espera un modelo de mundo de una escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el conjunto de prompts de evaluación y entrenamiento es PAI-Bench y que los vídeos renderizados están en el repositorio de dataset `angelic123/wan13b_paibench_grpo_12h100`, pero no incluye puntuaciones numéricas ni comparaciones cuantitativas con el modelo base u otros sistemas.

## Requisitos de hardware

- Entrenamiento de origen: 12 GPU H100, según la model card (`wan13b_paibench_grpo_12h100`).
- VRAM de inferencia: no disponible en la información proporcionada. Como referencia aritmética, los pesos del modelo base de 1.3B en bf16 ocupan aproximadamente 2,6 GB, a lo que hay que sumar el codificador de texto, el VAE de vídeo y las activaciones, que en generación de vídeo suelen dominar el consumo.
- GPU recomendadas: no disponible. No se documentan GPU concretas para inferencia.
- Viabilidad en GPU de consumo: no disponible; no hay datos publicados en esta información. Es plausible en términos de tamaño de pesos, pero la memoria de activaciones para vídeo puede ser el factor limitante y no se puede confirmar con los datos aportados.
- Almacenamiento: 11,5 GiB si se descargan los 1043 adaptadores; 11,3 MiB por adaptador individual.
- Opciones de despliegue: PEFT, mediante `PeftModel.from_pretrained(pipe.model, "adapters/<prompt_id>")` sobre el pipeline del modelo base. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo de difusión de vídeo. El resto de opciones de servicio (por ejemplo, servidores de difusión) no se documentan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / prompt | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| angelic123/wan21_1p3b_phypo_grpo_lora | 1043 adaptadores LoRA sobre base de 1.3B | No aplica; un adaptador por prompt de PAI-Bench | Sin datos publicados | Apache 2.0 | HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B (modelo base) | 1.3B | No disponible en esta información | Sin datos en esta información | No disponible en esta información | HuggingFace |
| Otros generadores de vídeo texto-a-vídeo de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente en la búsqueda realizada para comparar con alternativas concretas de la misma categoría (por ejemplo, otros modelos de generación de vídeo de ~1B de parámetros o métodos de RL aplicados a vídeo). La búsqueda web devolvió únicamente páginas corporativas de Microsoft, sin relación con el modelo.

## Limitaciones y advertencias

- No existe un modelo único fusionado: el repositorio contiene 1043 adaptadores independientes y hay que seleccionar el que corresponde al prompt; no sirve como adaptador general para cualquier instrucción.
- Especialización extrema por prompt: al haberse entrenado cada adaptador para una única instrucción de PAI-Bench, el riesgo de sobreajuste a esa instrucción es alto y no se documenta su comportamiento fuera del conjunto.
- Riesgo de alucinación visual y de física incorrecta: el modelo base puede generar trayectorias, colisiones o deformaciones no realistas, y no se aportan métricas que cuantifiquen la mejora real obtenida con GRPO.
- Sin validación externa: 0 descargas y 0 likes en el momento de los datos, sin resultados de benchmarks publicados, por lo que no hay evidencia independiente de calidad.
- Idiomas no documentados: se desconoce en qué idioma están los prompts de PAI-Bench y si el modelo responde bien a prompts en castellano.
- Discrepancia en el tamaño del repositorio: 9,1 GB según HuggingFace frente a 11,5 GiB declarados en la model card; conviene verificar antes de planificar almacenamiento.
- Licencia: los adaptadores son Apache 2.0, pero el uso comercial del conjunto depende también de la licencia del modelo base Wan2.1-T2V-1.3B, que no se detalla en la información proporcionada y debe consultarse en su propio repositorio.
- Coste de conmutación: mantener los 1043 adaptadores cargados exige en torno a 11,5 GiB adicionales de memoria si se preCargan todos, y la carga dinámica introduce latencia no documentada.
- Sin datos de latencia, throughput ni VRAM: no es posible dimensionar un despliegue en producción con la información disponible.
- Fechas de creación y actualización en 2026 y ausencia de documentación sobre el dataset de entrenamiento más allá del conjunto de prompts, lo que dificulta auditar sesgos en los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/angelic123/wan21_1p3b_phypo_grpo_lora
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio de dataset con los vídeos renderizados: https://huggingface.co/datasets/angelic123/wan13b_paibench_grpo_12h100
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo, el método PhyPO ni el benchmark PAI-Bench; los resultados eran páginas corporativas de Microsoft sin relación con el contenido.
