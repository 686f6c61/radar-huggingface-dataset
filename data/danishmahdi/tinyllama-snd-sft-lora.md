# DanishMahdi/TinyLlama-snd-sft-lora

## Resumen

TinyLlama-snd-sft-lora es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base unsloth/tinyllama-bnb-4bit, una versión cuantizada a 4 bits de TinyLlama. Lo publica el usuario DanishMahdi en Hugging Face y está orientado a generación de texto conversacional en sindhi (código de idioma `sd`) e inglés, según las etiquetas del repositorio. El artefacto no es un modelo completo, sino un conjunto de pesos de adaptador en formato PEFT que debe combinarse con el modelo base para su uso.

El interés principal reside en su enfoque lingüístico: el sindhi es un idioma de bajos recursos dentro del ecosistema de modelos abiertos, y los adaptadores LoRA sobre modelos pequeños de la familia TinyLlama (aproximadamente 1.100 millones de parámetros) permiten experimentar con ajuste de instrucciones en hardware muy modesto. El repositorio emplea las librerías Unsloth y TRL, habituales en flujos de entrenamiento eficiente en memoria.

La información publicada es escasa: no se detallan hiperparámetros, composición del dataset, número de pasos ni resultados de evaluación. El acceso es restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyLlama) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base TinyLlama tiene aproximadamente 1,1 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base TinyLlama emplea 2048 tokens) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Sindhi (`sd`) e ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama, un transformer decoder-only de aproximadamente 1.100 millones de parámetros con atención causal estándar. El modelo base indicado, unsloth/tinyllama-bnb-4bit, es una variante cuantizada a 4 bits mediante bitsandbytes, pensada para reducir el consumo de memoria durante el ajuste fino. El adaptador en sí es un conjunto de matrices de bajo rango (LoRA) en formato PEFT, con etiquetas que confirman el uso de Unsloth y TRL para el entrenamiento.

El método declarado es SFT (supervised fine-tuning) sobre datos conversacionales, según las etiquetas `sft`, `conversational` y `sindhi`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo), la tasa de aprendizaje ni si se aplicaron etapas posteriores de alineamiento como DPO o RLHF. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para eficiencia de memoria.

## Capacidades

- Generación de texto conversacional en sindhi e inglés, según los idiomas declarados en el repositorio.
- Ajuste de instrucciones (instruction tuning) mediante SFT, orientado a respuestas de tipo asistente.
- Integración con el ecosistema PEFT: el adaptador puede cargarse sobre el modelo base con `PeftModel` y combinarse o descargarse dinámicamente.
- Compatibilidad con flujos de Unsloth y TRL para entrenamiento e inferencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a los dos idiomas declarados; no hay evidencia publicada de calidad por idioma.

## Casos de uso

- Experimentación académica con idiomas de bajos recursos: el adaptador sirve como punto de partida para estudiar cómo se comporta un modelo de 1,1 mil millones de parámetros ajustado en sindhi, con un coste de cómputo mínimo en una única GPU de consumo.
- Prototipado de asistentes conversacionales en sindhi: permite validar rápidamente un pipeline de diálogo multilingüe antes de invertir en modelos mayores o en datasets propios.
- Investigación sobre adaptadores LoRA: al ser un artefacto pequeño y de licencia permisiva, es útil para comparar metodologías de ajuste eficiente (rango, módulos objetivo, mezcla de idiomas) sobre una base común.
- Educación y demos: se puede desplegar en Hugging Face Spaces o en local con llama.cpp tras convertir el modelo fusionado, para mostrar generación de texto en sindhi con recursos limitados.
- Generación de datos sintéticos auxiliares: el modelo puede producir borradores de texto en sindhi que luego se filtren y revisen manualmente para ampliar corpus de entrenamiento.
- Pruebas de regresión de infraestructura: sirve para validar pipelines de carga de adaptadores PEFT, cuantización y servido (por ejemplo, con vLLM o TGI tras fusionar los pesos) sin consumir grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 0,7-1 GB de pesos; con el adaptador y el contexto de activación, un entorno de 4-6 GB de VRAM es suficiente en la práctica.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090; también A100 o H100 si se busca mayor throughput en lote.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más, especialmente usando el modelo base cuantizado a 4 bits.
- Opciones de despliegue: transformers con PEFT, Unsloth para entrenamiento e inferencia, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF; vLLM y TGI son viables una vez fusionados los pesos.
- Latencia y throughput: no disponibles en la información proporcionada; en un modelo de este tamaño se esperan decenas de tokens por segundo en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TinyLlama-snd-sft-lora (este) | Adaptador sobre ~1,1 B | No disponible | sd, en | Apache 2.0 | safetensors (PEFT) |
| TinyLlama-1.1B-Chat | ~1,1 B | 2048 tokens | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyPixel/tinyllama-lora | Adaptador sobre TinyLlama | No disponible | en | No disponible | safetensors (PEFT) |
| Rofeeah-Tijani/tinyllama-lora-ai-engineering | Adaptador sobre TinyLlama | No disponible | en | No disponible | safetensors (PEFT) |

La comparación se limita a la categoría de adaptadores LoRA sobre TinyLlama; no se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- El repositorio tiene acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- No se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide estimar la calidad real del ajuste en sindhi o inglés.
- Riesgo elevado de alucinación y de respuestas incoherentes, inherente a un modelo base de 1,1 mil millones de parámetros ajustado con datos no descritos.
- Ventana de contexto limitada por el modelo base (2048 tokens en TinyLlama), inadecuada para documentos largos o conversaciones extensas.
- Cobertura lingüística declarada únicamente en sindhi e inglés; no hay garantías de comportamiento correcto en otros idiomas.
- Posibles sesgos heredados del corpus de TinyLlama y del dataset de ajuste, no analizados por el autor.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de ajuste antes de un uso comercial.
- No apto para producción sin una evaluación propia: no hay benchmarks, ni informes de seguridad, ni versiones mantenidas.

## Enlaces

- Hugging Face: https://huggingface.co/DanishMahdi/TinyLlama-snd-sft-lora
- Modelo base: https://huggingface.co/unsloth/tinyllama-bnb-4bit
- Proyecto de referencia con LoRA sobre TinyLlama: https://github.com/Rofeeah-Tijani/tinyllama-lora-ai-engineering
- Adaptador comparable en Hugging Face: https://huggingface.co/TinyPixel/tinyllama-lora
