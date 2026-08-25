# dora7/albedo-sn97-workspace

## Resumen

`dora7/albedo-sn97-workspace` es un repositorio de almacenamiento (workspace bundle) que contiene el estado completo de trabajo del modelo "Albedo Challenger v16", desarrollado por el autor `dora7` para el subnet 97 de Bittensor (Albedo / Distillation). No es un modelo directamente desplegable, sino un archivo de respaldo que incluye el checkpoint fusionado, adaptadores LoRA, código de entrenamiento, evaluaciones y registros de proceso. El modelo subyacente se denomina `albedo-qwen3.6-35b-v16`, lo que indica una variante de la familia Qwen 3.6 con 35 000 millones de parámetros, optimizada para tareas de codificación y razonamiento dentro del marco competitivo de destilación de Bittensor.

El repositorio forma parte de un ecosistema de destilación competitiva en el que los mineros entrenan modelos comprimidos de 35B bajo un marco de evaluación de 25 ejes, y el ganador recibe el 100 % de las emisiones del subnet. Aunque el repo no contiene el modelo "genesis king" (disponible en `dendriteholdings/albedo-qwen3.6-35b-king-genesis`), sí incluye el checkpoint fusionado v16 y los adaptadores necesarios para continuar el entrenamiento. Es relevante para desarrolladores e investigadores que participan en SN97 o que desean explorar técnicas de destilación y optimización de modelos de 35B en entornos descentralizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere derivado de Qwen 3.6, probablemente transformer, sin confirmar) |
| Parametros totales | 35B (según el nombre `albedo-qwen3.6-35b`) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (el repo es un bundle con pesos, adaptadores LoRA, código y registros) |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos de la arquitectura del modelo base. El nombre `albedo-qwen3.6-35b` sugiere que se trata de una variante de la familia Qwen 3.6 con 35B parámetros, probablemente un transformer denso, pero no hay confirmación oficial en la información proporcionada.

El entrenamiento se realiza dentro del subnet SN97 de Bittensor, un marco de destilación competitiva donde los mineros comprimen modelos de gran tamaño a 35B y compiten por la mejor puntuación en un marco de evaluación de 25 ejes. El bundle incluye adaptadores LoRA (v13, v15, v16-dpo) y un historial de entrenamiento documentado en `RECORD.md`, que cubre procesos de DPO (Direct Preference Optimization) hasta la versión v19. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros utilizados.

## Capacidades

- Agente de codificación: el modelo está diseñado para tareas de programación y razonamiento técnico, según la descripción del subnet SN97.
- Destilación de modelos: el marco de entrenamiento se centra en comprimir modelos grandes a 35B sin pérdida significativa de rendimiento.
- Evaluación multi-eje: el modelo se evalúa bajo 25 criterios distintos dentro del subnet, lo que sugiere capacidades de razonamiento, generación de código y respuesta a instrucciones complejas.
- Capacidades multilingües: no se dispone de datos concretos sobre idiomas soportados.
- Soporte de tool calling / function calling: no se ha documentado explícitamente, aunque el contexto de codificación y agentes sugiere posible soporte, sin confirmación.

## Casos de uso

- Participación en el subnet SN97 de Bittensor: el bundle se utiliza para subir el checkpoint v16 como candidato en la arena competitiva de destilación, donde los mineros compiten por emisiones.
- Restauración y continuidad del entrenamiento: los scripts `RESTORE.md` y `RECORD.md` permiten retomar el entrenamiento desde el punto guardado, útil para equipos que heredan el trabajo de `dora7`.
- Evaluación de modelos de 35B: el repositorio incluye `eval-runs/` con informes de evaluación de la cadena y políticas, útil para comparar el rendimiento del checkpoint v16 contra versiones anteriores.
- Investigación en destilación de modelos: los adaptadores LoRA y el historial DPO documentan un proceso de destilación competitiva que puede servir como caso de estudio para técnicas de compresión de modelos.
- Despliegue del modelo ganador: aunque este repo no es el modelo final, el modelo fusionado `albedo-qwen3.6-35b-v16` está disponible separadamente y puede usarse para inferencia en aplicaciones de codificación asistida.
- Análisis de la infraestructura de SN97: el código y los scripts (`code/`, `tests/`) permiten reproducir el pipeline de entrenamiento y evaluación, útil para nuevos mineros que quieran unirse al subnet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `eval-runs/` con informes de evaluación, pero no se han proporcionado datos numéricos específicos (p. ej., MMLU, HumanEval, GSM8K) en la documentación accesible.

## Requisitos de hardware

- El tamaño del repositorio es de 70,6 GB, coherente con pesos en fp16/bf16 para un modelo de 35B (35B × 2 bytes ≈ 70 GB).
- Para inferencia con pesos fp16: se requieren aproximadamente 70 GB de VRAM (GPU como A100 80GB o H100).
- Para inferencia con cuantización de 4 bits: ~20 GB de VRAM, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090.
- Para entrenamiento o ajuste fino: se recomienda hardware de nivel datacenter (A100/H100) con 80 GB de VRAM o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos al formato correspondiente (GGUF para llama.cpp).
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. El modelo es una variante de Qwen 3.6 de 35B, pero no se han publicado resultados de benchmarks ni comparaciones con otras variantes de Qwen o modelos de tamaño similar (p. ej., Llama 3 35B, Mistral Medium). La información disponible se centra en el contexto de Bittensor y no en el rendimiento del modelo fuera de ese marco.

## Limitaciones y advertencias

- Este repositorio es un bundle de almacenamiento, no un modelo listo para usar. Para desplegar el modelo en producción es necesario descargar los pesos fusionados desde `dora7/albedo-qwen3.6-35b-v16`.
- El repositorio no es un commit on-chain: el autor advierte explícitamente que no se debe enviar a SN97 desde este repo sin una verificación local de la cadena y una instrucción de envío explícita.
- El modelo "Genesis king" no está incluido en este repositorio; debe obtenerse de `dendriteholdings/albedo-qwen3.6-35b-king-genesis`, lo que puede generar confusión si se espera un modelo completo.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No hay información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas, ya que la documentación se centra en el proceso de entrenamiento y no en la evaluación del modelo final.
- El modelo está optimizado para el marco de evaluación de SN97; su rendimiento fuera de ese contexto (p. ej., en aplicaciones generales) no está garantizado ni documentado.
- Los adaptadores LoRA incluidos (v13, v15, v16-dpo) requieren el checkpoint base para funcionar; no son modelos independientes.

## Enlaces

- Repositorio principal: https://huggingface.co/dora7/albedo-sn97-workspace
- Modelo solo (mismos pesos, v16): https://huggingface.co/dora7/albedo-qwen3.6-35b-v16
- Bundle anterior v11: https://huggingface.co/0xbidkslj1/albedo-sn97-workspace
- Perfil del autor en HuggingFace: https://huggingface.co/dora7
- Página del subnet SN97 en Bittensor: https://bittensor.ai/subnets/97
- Artículo en tao.media: "The Subnet an AI Agent Built: Inside Distil (SN97)": https://www.tao.media/the-subnet-an-ai-agent-built-inside-distil-sn97/
- Artículo en tao.media: "Albedo (SN97): The Bittensor Subnet That Gets Stronger Every Time Someone Tries to Game It": https://www.tao.media/albedo-sn97-the-bittensor-subnet-that-gets-stronger-every-time-someone-tries-to-game-it/
- Tuit de DkingYooo sobre Albedo: https://x.com/DkingYooo18516/status/2076918847286968681
