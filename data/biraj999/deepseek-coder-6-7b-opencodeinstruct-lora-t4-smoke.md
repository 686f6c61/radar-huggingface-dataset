# Biraj999/deepseek-coder-6.7b-opencodeinstruct-lora-t4-smoke

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre el modelo base DeepSeek-Coder-6.7B-Instruct, publicado por el usuario Biraj999. No se trata de un modelo completo, sino de pesos de adaptador (448 tensores LoRA) que deben cargarse sobre el modelo base original de DeepSeek. El adaptador se ha entrenado con el dataset NVIDIA OpenCodeInstruct mediante QLoRA de 4 bits (NF4) sobre una única GPU Tesla T4 con 14,6 GiB de VRAM.

El propósito declarado por el autor es un *smoke test*: una prueba de extremo a extremo del pipeline de entrenamiento, no una mejora validada. El entrenamiento consistió en 2 pasos de optimizador sobre 48 ejemplos de entrenamiento y 8 de validación, con una longitud de secuencia de 512 tokens. El autor advierte explícitamente de que no se ha ejecutado ningún benchmark independiente de generación de código ni comparación con el modelo base.

Por tanto, su relevancia práctica es limitada: sirve como referencia reproducible de configuración QLoRA sobre T4 y como ejemplo de integración con el ecosistema PEFT/TRL, pero no debe considerarse un modelo listo para producción ni una mejora demostrada sobre DeepSeek-Coder-6.7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: DeepSeek-Coder-6.7B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 6.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion para entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Otra (licencia DeepSeek; ver enlace en la model card) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, 0.2 GB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre DeepSeek-Coder-6.7B-Instruct, un transformer decoder-only especializado en código. La técnica empleada es QLoRA: el modelo base se cuantiza a 4 bits NF4 con doble cuantización y se entrenan únicamente los pesos LoRA, con rango 16, alpha 32 y dropout 0.05. La longitud de secuencia fue de 512 tokens, la tasa de aprendizaje de 0.0002 y el entrenamiento se ejecutó en una Tesla T4 de 14,6 GiB.

El dataset utilizado es NVIDIA OpenCodeInstruct, publicado bajo CC BY 4.0. El entrenamiento consistió en solo 2 pasos de optimizador sobre 48 ejemplos, con 8 ejemplos de validación. Se guardaron 448 tensores LoRA. No se aplicaron técnicas de alineación adicionales (RLHF/DPO) ni innovaciones arquitectónicas; es una configuración estándar de PEFT con TRL. Los scripts de entrenamiento están publicados en un repositorio de GitHub del autor.

## Capacidades

- Generación de código en inglés, heredada del modelo base DeepSeek-Coder-6.7B-Instruct.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Generación de texto condicionada por instrucciones (pipeline `text-generation`).
- Integración con el ecosistema Hugging Face Transformers y PEFT.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Las capacidades reales del adaptador no han sido evaluadas de forma independiente; cualquier capacidad declarada proviene del modelo base, no del adaptador.

## Casos de uso

- Reproducción de pipelines QLoRA en GPU de gama baja: sirve como plantilla funcional para entrenar adaptadores LoRA sobre modelos de 6-7B en una T4, útil para equipos que quieran validar su infraestructura antes de lanzar entrenamientos mayores.
- Docencia y formación: ejemplo didáctico de configuración PEFT (rango, alpha, dropout, cuantización NF4) y de carga de adaptadores con `PeftModel.from_pretrained`.
- Pruebas de integración CI: permite verificar que un pipeline de carga de adaptadores, tokenización con plantilla de chat y generación funciona de extremo a extremo antes de desplegar un adaptador real.
- Experimentación con OpenCodeInstruct: punto de partida para comparar configuraciones de entrenamiento sobre el mismo dataset, siempre que se ejecuten entrenamientos completos y evaluaciones posteriores.
- Prototipado de asistentes de código en entornos controlados: se puede usar para generar borradores de funciones Python (por ejemplo, búsqueda binaria con tests) en un sandbox, sin asumir corrección del código generado.
- Referencia de licenciamiento y atribución: ejemplo de cómo documentar la procedencia del dataset (CC BY 4.0) y del modelo base (licencia DeepSeek) en un adaptador derivado.

## Benchmarks y rendimiento

El autor reporta únicamente métricas de entrenamiento y validación sobre 8 ejemplos, que no constituyen una evaluación de calidad de código:

| Metrica | Valor |
|---|---|
| Training loss | 0.2775 |
| Validation loss | 0.3425 |
| Validation mean token accuracy | 90.03% |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor advierte de que la precisión de tokens no debe interpretarse como tasa de acierto en problemas de programación.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma específica; el adaptador ocupa 0.2 GB y requiere cargar el modelo base DeepSeek-Coder-6.7B-Instruct. Con cuantización 4-bit NF4 el conjunto puede caber en GPUs de 8-16 GB, aunque no se han publicado mediciones.
- GPU recomendadas: el autor documenta entrenamiento en Tesla T4 (14,6 GiB). Para inferencia se puede usar cualquier GPU con VRAM suficiente para el modelo base cuantizado; no hay datos publicados para A100, H100 o RTX 4090.
- GPU de consumo: probablemente viable en RTX 3090/4090 con cuantización 4-bit, aunque no está verificado en la información disponible.
- Despliegue: el ejemplo oficial usa Transformers + PEFT + BitsAndBytes. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Biraj999/deepseek-coder-6.7b-opencodeinstruct-lora-t4-smoke | Adaptador LoRA sobre 6.7B | No disponible | DeepSeek | Smoke test, sin evaluacion |
| deepseek-ai/deepseek-coder-6.7b-instruct | 6.7B | No disponible en la informacion | DeepSeek | Modelo base oficial, con benchmarks publicados por DeepSeek |
| Adaptadores LoRA sobre OpenCodeInstruct de otros autores | Variable | Variable | Variable | No disponible en la informacion proporcionada |

La comparación relevante es contra el modelo base: el adaptador no ha demostrado mejora sobre él y el autor lo desaconseja para uso productivo. No se dispone de datos para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint experimental de 2 pasos de entrenamiento; no representa una mejora validada sobre el modelo base.
- Las métricas reportadas se basan en 8 ejemplos de validación y no miden corrección, seguridad ni generalización del código generado.
- El código generado puede ser incorrecto, inseguro o incompleto; debe ejecutarse en un sandbox aislado con tests.
- Solo se declara soporte de inglés; no hay evidencia de rendimiento en castellano u otros idiomas.
- La licencia es la de DeepSeek (licencia "other" con nombre "deepseek"); el uso comercial queda sujeto a los términos del modelo base, no a los metadatos de este repositorio.
- El dataset OpenCodeInstruct es CC BY 4.0 y requiere atribución a NVIDIA.
- No se incluyen los pesos completos del modelo base; es necesario descargarlos por separado.
- No hay información sobre sesgos específicos del adaptador, latencia, throughput ni soporte en motores de inferencia de alto rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Biraj999/deepseek-coder-6.7b-opencodeinstruct-lora-t4-smoke
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-instruct
- Licencia del modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-instruct/blob/main/LICENSE
- Dataset NVIDIA OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Scripts de entrenamiento: https://github.com/Birajkakadiya/deepseek-finetuning
