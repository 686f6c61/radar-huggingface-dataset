# ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-GGUF

## Resumen

El modelo `ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-GGUF` es una cuantización GGUF de un fine-tune LoRA del modelo base `empero-ai/Qwen3.8-2B`, entrenado mediante supervisión (SFT) sobre un dataset privado denominado `Fable-5-Complete-2M-Clean`. El autor, ermiaazarkhalili, ha publicado tanto los pesos completos en safetensors como esta versión cuantizada para facilitar su ejecución con llama.cpp y otras herramientas compatibles con GGUF. Con aproximadamente 1,94 mil millones de parámetros, se trata de un modelo compacto orientado a generación de texto y seguimiento de instrucciones, con licencia Apache 2.0.

La relevancia de este modelo radica en su tamaño reducido y su formato GGUF, que permite desplegarlo en entornos con recursos limitados, como CPUs o GPUs de gama baja. Sin embargo, es importante señalar que no se ha realizado ninguna evaluación de benchmarks sobre este checkpoint; los únicos datos reportados son observaciones de la pérdida de entrenamiento. El fine-tune se realizó con QLoRA (LoRA en precisión 4-bit) utilizando las librerías Unsloth y TRL, sobre un dataset de fábulas, lo que sugiere una posible especialización en generación de narrativa breve, aunque esta hipótesis no está respaldada por métricas públicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q2_k, q3_k_m, q4_k_m, q5_k_m, q6_k, q8_0 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base `empero-ai/Qwen3.8-2B` no se especifica en la información proporcionada. Dado el nombre, es probable que siga la familia de modelos Qwen, que tradicionalmente emplean arquitecturas transformer densas, pero este dato no está confirmado. El fine-tune se realizó mediante LoRA con r=16 y alpha=16, sobre una base en precisión 4-bit (QLoRA), utilizando las librerías Unsloth y TRL. El entrenamiento se ejecutó durante 2 épocas con un learning rate de 0.0002, batch efectivo de 8 (1 paso con 8 de acumulación de gradiente) y una longitud máxima de secuencia de 4096 tokens. Los módulos objetivo del adaptador LoRA incluyen proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, entre otros). El dataset de entrenamiento, `Fable-5-Complete-2M-Clean`, es privado y no se han publicado detalles sobre su composición o tamaño exacto. La pérdida de entrenamiento observada descendió de 1.1972 a 0.9544 a lo largo de 94.254 pasos, según los logs SLURM.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en tareas de continuación y generación libre, aunque no se han evaluado formalmente sus límites.
- Seguimiento de instrucciones: al ser un fine-tune SFT sobre un dataset de instrucciones, se espera que responda a comandos y preguntas en formato conversacional.
- Conversación multi-turno: su naturaleza de modelo de lenguaje y el entrenamiento con secuencias de hasta 4096 tokens permiten mantener diálogos de longitud moderada.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades multimodales o modos de razonamiento especiales. Estas capacidades no han sido verificadas ni documentadas.

## Casos de uso

- Generación de cuentos y fábulas: dado que el fine-tune se realizó sobre un dataset de fábulas, el modelo podría emplearse para crear historias cortas con moraleja, aunque no hay evaluación que lo confirme.
- Asistente conversacional ligero: su tamaño reducido y formato GGUF permiten integrarlo en aplicaciones de chat en dispositivos con poca memoria, como Raspberry Pi o portátiles antiguos.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo pequeño y de licencia permisiva, es adecuado para pruebas de concepto y experimentación en entornos de desarrollo.
- Generación de texto creativo: puede utilizarse para redactar poemas, diálogos o narrativa breve, siempre asumiendo que su calidad no ha sido medida.
- Despliegue en entornos sin GPU: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU con llama.cpp, lo que lo hace útil para aplicaciones offline o con restricciones de hardware.
- Fine-tuning adicional: al estar basado en un modelo de código abierto, puede servir como punto de partida para nuevos fine-tunes en dominios específicos, aunque los adaptadores LoRA ya están fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento (training loss), que no constituye una medida de calidad del modelo en tareas downstream. No se dispone de comparaciones con otros modelos en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el archivo q4_k_m ocupa 1,31 GB, por lo que se necesitan aproximadamente 2 GB de VRAM para cargar el modelo y los overheads de inferencia. Las versiones q2_k (990 MB) y q3_k_m (1,13 GB) requieren aún menos memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060, o incluso iGPUs modernas con suficiente memoria compartida. Para las cuantizaciones más altas (q8_0, 2,08 GB) se recomienda al menos 3 GB de VRAM.
- Ejecución en CPU: viable con llama.cpp, especialmente con cuantizaciones de 4 bits o inferiores. El rendimiento dependerá del número de núcleos y de la velocidad de memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama (creando un Modelfile), y cualquier framework compatible con GGUF como llama-cpp-python, text-generation-webui, o LM Studio.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (por ejemplo, RTX 4060), se espera una velocidad de decodificación de decenas de tokens por segundo, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible realizar una comparativa cuantitativa con alternativas de tamaño similar. A modo de referencia, existen otros modelos de ~2B parámetros como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B, pero sin resultados de benchmarks de este checkpoint no se puede establecer una comparación objetiva. La única diferencia clara es la licencia Apache 2.0 y el formato GGUF, que facilitan su uso comercial y su despliegue en entornos heterogéneos.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks sobre este checkpoint; los únicos números reportados son observaciones de la pérdida de entrenamiento, que no deben interpretarse como indicadores de calidad.
- El modelo hereda los sesgos, el conocimiento limitado (fecha de corte) y los modos de fallo del modelo base `empero-ai/Qwen3.8-2B`, que no están documentados en la información proporcionada.
- El fine-tune se realizó sobre un único dataset de instrucciones (fábulas), por lo que el comportamiento fuera de esa distribución de datos no ha sido probado y podría ser impredecible.
- Los adaptadores LoRA se fusionaron con los pesos base, por lo que no es posible separar el fine-tune del modelo original.
- No se especifica la longitud de contexto del modelo base; el entrenamiento usó 4096 tokens, pero el contexto real podría ser mayor o menor.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para asegurar el cumplimiento.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-GGUF)
- [Repositorio HuggingFace del fine-tune en safetensors](https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5)
- [Modelo base empero-ai/Qwen3.8-2B](https://huggingface.co/empero-ai/Qwen3.8-2B)
- [Repositorio GitHub de la serie Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Página del modelo en FriendliAI](https://friendli.ai/models/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5)
