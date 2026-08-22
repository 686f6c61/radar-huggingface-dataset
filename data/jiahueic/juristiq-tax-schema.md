# jiahueic/juristiq-tax-schema

## Resumen

`juristiq-tax-schema` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, desarrollado por el autor `jiahueic` y publicado en HuggingFace. Se trata de un fine-tuning supervisado (SFT) realizado con la librería TRL de HuggingFace, con el objetivo declarado en el nombre de abordar esquemas fiscales, aunque la model card no aporta ninguna documentación técnica sobre el dataset, los datos de entrenamiento ni las tareas concretas para las que fue optimizado.

El modelo pertenece a la categoría de adaptadores de bajo coste sobre modelos pequeños: el base tiene 0,5 mil millones de parámetros y una ventana de contexto de 32K tokens, lo que permite ejecutarlo en hardware de consumo. El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador en formato safetensors. Su relevancia actual es limitada: se trata de un experimento de fine-tuning sin métricas publicadas ni validación externa, y su licencia no está especificada, lo que complica su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) + adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~0,5B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32K tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion GGUF, AWQ, etc., pero no se especifica) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta ingles, chino y otros; el adaptador no documenta idiomas) |
| Licencia | no disponible (la model card indica "license" sin especificar; el modelo base Qwen2.5-0.5B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer decoder-only de Qwen2.5-0.5B-Instruct, un modelo de 0,5B parámetros con atención de escala de 32K tokens. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la biblioteca TRL, con PEFT 0.20.0, Transformers 5.15.1, PyTorch 2.13.0 y Datasets 5.0.1. No se proporciona información sobre la composición del dataset, el número de tokens de entrenamiento, el número de pasos, la tasa de aprendizaje ni ninguna otra hiperparametro. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- No se documentan capacidades específicas del adaptador en la model card.
- El modelo base Qwen2.5-0.5B-Instruct es capaz de generación de texto, razonamiento básico, escritura de código y conversación multilingüe en inglés y chino.
- No se confirma soporte de tool calling ni function calling para el adaptador.
- No se confirma capacidad de razonamiento multi-step ni uso como agente autónomo.
- No se documentan capacidades de vision, audio u otras modalidades.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. El nombre del modelo sugiere una posible aplicación en análisis de esquemas fiscales, pero no existe ninguna evidencia de que el adaptador funcione correctamente en ese dominio ni se proporcionan ejemplos de uso. En ausencia de documentación, no es posible recomendar casos de uso reales sin riesgo de error. Cualquier implementación en producción debería validarse previamente con datos propios del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA añade una sobrecarga mínima sobre el modelo base de 0,5B.
- Inferencia en FP16: se estima un consumo de VRAM de 1-2 GB, por lo que cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- En cuantización de 4 bits, podría ejecutarse en hardware con menos de 1 GB de VRAM, aunque no se proporcionan datos concretos.
- Opciones de despliegue compatibles con el modelo base: Transformers, vLLM, llama.cpp, Ollama y TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos del adaptador. Comparando el modelo base Qwen2.5-0.5B-Instruct con alternativas de tamaño similar, se puede observar que es más pequeño que Llama-3.2-1B y que Phi-3-mini (3.8B), y que su rendimiento en tareas complejas será inferior. Sin embargo, no hay datos de benchmarks para el adaptador, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad del adaptador.
- El riesgo de alucinación es elevado, especialmente en dominios especializados como el fiscal, debido al tamaño reducido del modelo y a la falta de validación.
- La licencia no está especificada, lo que puede impedir el uso comercial del adaptador. Se recomienda contactar con el autor antes de cualquier despliegue.
- No hay documentación sobre el idioma de entrenamiento ni sobre la cobertura de vocabulario específico.
- El modelo no ha sido evaluado en tareas reales de esquema fiscal; su uso en producción sin pruebas previas es arriesgado.
- El autor no proporciona instrucciones de uso ni ejemplos funcionales; el código de ejemplo de la model card es genérico y no está adaptado al caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiahui/juristiq-tax-schema
- Resultados de búsqueda web relevantes (no relacionados directamente con el adaptador):
  - JuristIQ - Juristic: https://www.juristic.io/product/juristiq
  - JuristIQ para asesores fiscales: https://www.juristic.io/solutions/consultancies
  - Juristiq.ch (protección de datos e IA): https://juristiq.ch/
  - JuristAI (agente legal): https://juristai.org/
  - PDF de la Ley de Integridad Fiscal de IA de 2026: https://waysandmeans.house.gov/wp-content/uploads/2026/06/JCT-Description-of-HR-9501.pdf
