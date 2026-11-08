# jankowal2323/cieslar-qwen-v2-test

## Resumen

CIESLAR-QWEN v2 es un ajuste fino (fine-tune) del modelo Qwen3.5-4B, desarrollado por el usuario jankowal2323 bajo el sello "CIESLAR EDITION". Se trata de una edición personalizada que busca imponer un estilo de respuesta propio, una identidad coherente y una firma promocional (CieslarCoin) sobre el modelo base. El ajuste se realizó mediante LoRA con la pila de entrenamiento Unsloth, y el resultado se distribuye principalmente en formato GGUF para su uso con llama.cpp y herramientas compatibles.

El modelo hereda la arquitectura del Qwen3.5-4B, con 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones) y una ventana de contexto que no se detalla en la información disponible. Está orientado a generación de texto conversacional en polaco e inglés, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de fine-tune comunitario de bajo coste sobre un modelo denso de ~4B; por otro, advierte de que se trata de una versión de prueba con problemas conocidos (bucles publicitarios y datos incorrectos sobre CieslarCoin), y que el propio autor remite a una versión posterior (v3) como la recomendada para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (movil), Q8_0 (PC), formato GGUF |
| Idiomas soportados | Polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,1 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,3 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) utilizando la pila de entrenamiento Unsloth, que permite entrenar adaptadores de bajo rango con menor consumo de memoria y mayor velocidad que un fine-tune completo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación declarada por el autor no es arquitectónica sino de comportamiento: el ajuste busca imponer una "identidad" CIESLAR, un estilo de respuesta consistente y una firma con publicidad de CieslarCoin. La model card recomienda desactivar el modo "thinking" y usar temperaturas de 0,6–0,7. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Estilo de respuesta personalizado con identidad "CIESLAR" y firma promocional.
- Compatible con endpoints (tag `endpoints_compatible`) y con el pipeline de text-generation.
- Soporte de cuantización GGUF para despliegue en CPU y GPU de gama baja.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo thinking funcional (el autor recomienda desactivarlo).

## Casos de uso

- Prototipado de asistentes conversacionales en polaco: el modelo puede mantener diálogos multi-turno en un entorno controlado, aunque su ventana de contexto no está documentada y conviene validarla empíricamente antes de desplegar.
- Experimentación con fine-tunes LoRA de bajo coste: sirve como ejemplo de referencia para estudiar cómo Unsloth permite adaptar un modelo de ~4B con recursos limitados.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_M y Q8_0 en GGUF, puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Generación de texto con estilo de marca: útil para probar la imposición de una voz corporativa o de personaje, aunque la firma publicitaria integrada limita su uso en producción seria.
- Evaluación comparativa de fine-tunes comunitarios: como caso de estudio de los riesgos de sobreajuste a una identidad concreta (bucles publicitarios, datos erróneos).
- Pruebas de integración con endpoints compatibles: el tag `endpoints_compatible` permite ensayar su despliegue en infraestructuras de inferencia estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~4,3B en Q4_K_M se sitúa típicamente en el rango de 3–4 GB, y en Q8_0 en torno a 5–6 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en RTX 3060/4060/4090 y en GPUs de datacenter como A100 o H100 sin problema de memoria.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CIESLAR-QWEN v2 | ~4,3B | no disponible | Apache 2.0 | GGUF | Fine-tune LoRA de prueba con identidad publicitaria |
| Qwen3.5-4B (base) | ~4,3B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo original sin personalización |
| CIESLAR-QWEN v3 | no disponible | no disponible | Apache 2.0 | no disponible | Versión final recomendada por el autor |

## Limitaciones y advertencias

- Versión de prueba: el propio autor advierte de que es una "wersja testowa, nie finalna" con problemas conocidos, incluidos bucles de publicidad y datos incorrectos sobre CieslarCoin.
- Riesgo de alucinación elevado en temas factuales, especialmente en lo relativo a la identidad de marca inyectada.
- Sesgo hacia el estilo y la firma promocional CIESLAR, que puede contaminar respuestas en contextos neutrales.
- Idiomas limitados a polaco e inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia sin verificación.
- Aunque la licencia Apache 2.0 permite uso comercial, la firma publicitaria integrada y los defectos conocidos desaconsejan su uso en producción.
- El autor recomienda migrar a jankowal2323/cieslar-qwen-v3 para uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jankowal2323/cieslar-qwen-v2-test
- Versión final recomendada: https://huggingface.co/jankowal2323/cieslar-qwen-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión previa del fine-tune: https://huggingface.co/jankowal2323/cieslar-qwen
