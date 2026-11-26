# adjointedtonull/jalopeura-lora-7b

## Resumen

Jalopeura LoRA 7B es un adaptador LoRA (Low-Rank Adaptation) de PEFT para generación de texto en finlandés, desarrollado por el usuario adjointedtonull y publicado en Hugging Face en mayo de 2023. Se construye sobre el modelo base `decapoda-research/llama-7b-hf`, una conversión no oficial de los pesos originales de LLaMA 7B, y se ha afinado con el conjunto de datos alpaca-lora traducido íntegramente al finlandés mediante `gpt-3.5-turbo`.

El adaptador tiene un tamaño de 16,8 MB (`adapter_model.bin`) y emplea una configuración LoRA conservadora: rango 8, alpha 16, dropout 0,05 y módulos objetivo limitados a `q_proj` y `v_proj`. El entrenamiento se ejecutó durante 3 épocas (~2 h 41 min), con una pérdida media de entrenamiento de 1,2835 y un mínimo registrado de 1,0954 en la época 2,73.

Su relevancia es histórica y de nicho: representa uno de los primeros experimentos de adaptación al finlandés sobre LLaMA 7B en el ecosistema alpaca-lora, con cero descargas y cero likes en el momento de la consulta. No es un modelo apto para producción, sino una pieza de interés para investigación sobre adaptación lingüística de bajo rango en lenguas de recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA 7B) con adaptador PEFT/LoRA |
| Parametros totales | ~6,7 mil millones (modelo base); adaptador de 16,8 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de LLaMA 7B) |
| Tipos de cuantizacion | 8 bits (bitsandbytes) documentada en la model card; otras no especificadas |
| Idiomas soportados | Finés (`fi`) |
| Licencia | no disponible (la model card remite a las condiciones de uso de LLaMA) |
| Formato de pesos | `adapter_model.bin` (PyTorch, PEFT); el modelo base en safetensors/PyTorch según su repositorio |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de tipo LLaMA con 7 mil millones de parámetros, que emplea atención causal estándar, normalización RMSNorm y activación SwiGLU. La adaptación LoRA congela los pesos del modelo base e inserta matrices de bajo rango únicamente en las proyecciones de consulta (`q_proj`) y valor (`v_proj`) de cada capa de atención, con rango 8 y alpha 16, lo que supone una huella de parámetros muy reducida (16,8 MB).

El conjunto de entrenamiento es la totalidad del dataset alpaca-lora traducido al finlandés con `gpt-3.5-turbo`, orientado a seguir instrucciones y generación general de texto. Se realizaron 3 épocas con una tasa de aprendizaje máxima de 0,000294 y decaimiento lineal hasta 1,55e-5. No se documentan fases de RLHF, DPO ni preferencias humanas. Tampoco se especifican el número total de tokens de entrenamiento, la composición exacta del dataset traducido ni detalles sobre el hardware utilizado más allá del tiempo de ejecución (~9 670 s).

## Capacidades

- Generación de texto causal en finlandés con formato de instrucciones estilo Alpaca (`### Instruction:` / `### Response:`).
- Seguimiento básico de instrucciones en finlandés, limitado por el tamaño del adaptador y la calidad de la traducción automática del dataset.
- Respuesta a preguntas y generación de texto libre en finlandés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al finlandés; el modelo base conserva cierto conocimiento del inglés, pero el adaptador no lo refuerza.

## Casos de uso

- Experimentación académica sobre adaptación LoRA en lenguas de recursos limitados: sirve como referencia reproducible para comparar configuraciones de rango, alpha y módulos objetivo en finlandés.
- Generación de texto finlandés en entornos de prototipado: permite construir demos rápidas de asistentes conversacionales en finés con un coste de almacenamiento mínimo (16,8 MB de adaptador).
- Investigación sobre calidad de traducción automática de datasets: al estar entrenado sobre alpaca-lora traducido con `gpt-3.5-turbo`, es útil para estudiar cómo los artefactos de traducción afectan al ajuste fino.
- Reproducción de experimentos alpaca-lora: la configuración documentada (r=8, alpha=16, target q_proj/v_proj) facilita replicar el pipeline con otros idiomas o datasets.
- Fine-tuning incremental sobre el adaptador: al ser un LoRA pequeño, se puede combinar o continuar entrenando con nuevos datos finlandeses sin tocar el modelo base.
- Docencia sobre PEFT: ejemplo didáctico de cómo cargar un adaptador con `PeftModel.from_pretrained` y cuantización 8-bit para reducir VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7 GB en 8 bits (configuración documentada con `load_in_8bit=True`); ~14 GB en fp16 sin cuantizar; ~4-5 GB en cuantizaciones de 4 bits no documentadas por el autor.
- GPU recomendadas: A100 40 GB, H100, L40S para fp16 sin cuantizar; RTX 3090/4090 (24 GB) sobradas para 8 bits; RTX 3060 12 GB o RTX 4060 Ti 16 GB suficientes para 8 bits.
- Cabe en GPU de consumo: sí, en 8 bits cabe en tarjetas de 8-12 GB; en 4 bits podría caber en 6-8 GB.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (documentado); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, aunque al fusionar el adaptador con el base podría convertirse a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jalopeura LoRA 7B | ~6,7 B (base) + 16,8 MB LoRA | 2048 | Finés | no disponible | Hugging Face, 0 descargas |
| FinGPT / modelos finlandeses sobre LLaMA | no disponible | no disponible | Finés | no disponible | no disponible |
| Alpaca-LoRA (original, inglés) | ~6,7 B (base) + LoRA | 2048 | Inglés | no disponible (LLaMA) | Hugging Face, ampliamente usado |
| Viking / Poro (modelos nórdicos) | no disponible en la informacion | no disponible | Finlandés y lenguas nórdicas | no disponible | no disponible |

La comparación directa con alternativas finlandesas contemporáneas no está disponible en la información proporcionada; los modelos nórdicos posteriores (Poro, Viking) no se detallan aquí.

## Limitaciones y advertencias

- Adaptador con 0 descargas y 0 likes: no hay evidencia de uso ni validación por parte de la comunidad.
- El dataset de entrenamiento es una traducción automática con `gpt-3.5-turbo`, lo que puede introducir artefactos, calcos y errores de traducción que el modelo reproduzca.
- Riesgo elevado de alucinación, especialmente en dominios especializados, por el tamaño del adaptador y la naturaleza del dataset Alpaca.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia no definida en el repositorio; la model card remite a las condiciones de uso de LLaMA, lo que impide confirmar el uso comercial.
- El modelo base `decapoda-research/llama-7b-hf` es una conversión no oficial de los pesos de LLaMA y ha sido retirado o restringido en varias plataformas, lo que puede dificultar su descarga.
- Solo se documenta finlandés; el rendimiento en otros idiomas no está evaluado.
- No hay información sobre sesgos específicos, evaluación de seguridad ni filtros de contenido.
- No apto para producción sin una evaluación exhaustiva previa y sin una licencia clara.

## Enlaces

- Hugging Face: https://huggingface.co/adjointedtonull/jalopeura-lora-7b
- Modelo base: https://huggingface.co/decapoda-research/llama-7b-hf
- Repositorio alpaca-lora (referencia del dataset y pipeline): https://github.com/tloen/alpaca-lora
- Librería PEFT: https://github.com/huggingface/peft
- Paper LoRA: https://arxiv.org/abs/2106.09685
