# HoangTran223/RSPO_Qwen2.5-1.5B

## Resumen

RSPO_Qwen2.5-1.5B es un modelo de lenguaje fine-tuneado a partir de Qwen/Qwen2.5-1.5B mediante la técnica Regularized Self-Play Preference Optimization (RSPO) con divergencia reverse-KL. El autor, HoangTran223, aplica este método de optimización de preferencias auto-jugadas sobre un checkpoint previamente ajustado con SFT en UltraChat200k. El modelo se entrena con datos de preferencias generados por SPPO (Self-Play Preference Optimization) en una submuestra de UltraChat50k, y solo se publica la primera iteración del proceso completo (iter1), que consta de tres iteraciones planificadas.

La relevancia de este modelo radica en explorar variantes de optimización de preferencias basadas en auto-juego, una línea de investigación activa en alineación de LLMs. Al ser un fine-tune de un modelo pequeño (1.5B), permite experimentar con estas técnicas en entornos con recursos limitados. El repositorio incluye los datos sintéticos de preferencias utilizados, los resultados del entrenamiento y los pesos en formato safetensors, lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.5B (modelo base Qwen2.5-1.5B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (modelo base: 128K tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer denso decoder-only. El proceso de entrenamiento comienza con un SFT sobre UltraChat200k, cuyo checkpoint se usa como referencia congelada. Posteriormente se aplica RSPO con loss `sppo_reversekl` y coeficiente de regularización `reg_coef=0.5`. Los datos de preferencias provienen del parquet `synthetic_data_qwen2.5-1.5b-sppo-uc50k-iter1_score`, generado por SPPO iter1. El entrenamiento se realiza durante 2 épocas por iteración, con `max_length=1024`, `max_prompt_length=512`, batch por dispositivo de 1, acumulación de gradientes de 2, optimizador RMSProp y learning rate de 5e-7. Solo se ha publicado la iteración 1 (49782 pasos, ~14.2 horas); las iteraciones 2 y 3 no están disponibles.

## Capacidades

- No se han documentado capacidades específicas en la model card. Se espera que herede las capacidades del modelo base Qwen2.5-1.5B, como generación de texto, razonamiento y soporte multilingüe, pero no hay confirmación.

## Casos de uso

- No se han documentado casos de uso específicos en la información proporcionada. Se recomienda consultar el modelo base Qwen2.5-1.5B para posibles aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han proporcionado requisitos de hardware específicos. Dado el tamaño de 1.5B, es probable que pueda ejecutarse en GPUs con 8-12 GB de VRAM, pero no hay confirmación.
- Se puede cargar con `transformers` usando `AutoModelForCausalLM.from_pretrained("HoangTran223/RSPO_Qwen2.5-1.5B", subfolder="iter1")`.
- No se mencionan opciones de despliegue como vLLM, Ollama o llama.cpp.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada. El autor tiene otro modelo similar, S-SPPO_Qwen2.5-1.5B, pero no se proporcionan datos comparativos.

## Limitaciones y advertencias

- Solo está disponible la iteración 1; las iteraciones 2 y 3 no se han publicado, por lo que el modelo no representa el resultado final del proceso RSPO completo.
- El entrenamiento se realizó con un subconjunto de UltraChat50k y puede no generalizar bien a dominios fuera de ese conjunto.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño y entrenado con datos limitados, puede presentar alucinaciones o respuestas incoherentes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda evaluar el modelo en el dominio de uso previsto.

## Enlaces

- [HuggingFace - HoangTran223/RSPO_Qwen2.5-1.5B](https://huggingface.co/HoangTran223/RSPO_Qwen2.5-1.5B)
- [Modelo base - Qwen/Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Modelo relacionado - HoangTran223/S-SPPO_Qwen2.5-1.5B](https://huggingface.co/HoangTran223/S-SPPO_Qwen2.5-1.5B)
