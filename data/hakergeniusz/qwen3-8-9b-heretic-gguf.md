# hakergeniusz/Qwen3.8-9B-Heretic-GGUF

## Resumen

Qwen3.8-9B-Heretic-GGUF es una colección de pesos cuantizados en formato GGUF del modelo petruhonk/Qwen3.8-9B-Distill-uncensored-heretic, un destilado de 9B basado en la arquitectura Qwen3.5 que ha sido sometido a un proceso de "abliteración" (heretic) para eliminar sus comportamientos de rechazo. El repositorio ha sido publicado por el usuario hakergeniusz y ofrece cuatro cuantizaciones de peso bajo (IQ2_M, IQ3_M, IQ4_XS y Q4_K_M), todas cuantizadas con matriz de importancia (imatrix) desde un GGUF q8_0 upstream.

El problema que resuelve este modelo es doble: por un lado, permite ejecutar un modelo destilado de la familia Qwen3.5 de 9B en hardware de consumo gracias a cuantizaciones agresivas; por otro, elimina las negativas del modelo original, de modo que responde sin rechazos a instrucciones que otros modelos se niegan a atender. Según la validación publicada por el autor, el modelo mantiene coherencia en tareas de conocimiento general y razonamiento, con salidas de hasta 3500 tokens en modo thinking sin aparición de rechazos.

Es relevante para usuarios que experimentan con modelos sin alineación de seguridad en entornos locales, aunque conviene subrayar que se trata de un modelo comunitario de terceros, sin documentación formal de entrenamiento, y que su uso conlleva responsabilidades legales y éticas significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso, no disponible el detalle exacto) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M (GGUF, con imatrix) |
| Idiomas soportados | en (según tags; el resto no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base upstream) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 aplicada a un destilado (distill) de 9B parámetros, que es un transformer denso. Sobre ese modelo base, petruhonk aplicó un proceso "heretic" (abliteración), una técnica que modifica los pesos o activaciones del modelo para suprimir los patrones de rechazo aprendidos durante el alineamiento, sin necesidad de reentrenamiento completo. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el destilado original.

En cuanto a la cuantización, hakergeniusz generó los I-quants (IQ2_M, IQ3_M, IQ4_XS) a partir de un GGUF q8_0 con `llama-quantize --imatrix`, calibrando la matriz de importancia sobre un corpus de 1,4 MB (60 chunks, n_ctx=512, batch_size=512) con llama.cpp 0.7.0-dev. Un detalle técnico destacable: en la variante IQ2_M, los tensores `blk.32.*` (la cabeza especulativa nextn) se mantienen en Q4_K porque la imatrix no contiene entradas para esa capa, lo que permite preservar la decodificación especulativa. El autor también documenta que un intento de cuantización ternaria TQ2_0 produjo salida incoherente, concluyendo que IQ3_M e IQ2_M son los anchos de bit mínimos viables para esta arquitectura.

## Capacidades

- Generación de texto conversacional, con soporte de salidas en modo thinking (el autor validó generaciones de hasta 3500 tokens de razonamiento).
- Conocimiento general básico: responde correctamente a preguntas fácticas (por ejemplo, punto de ebullición del agua).
- Seguimiento de instrucciones sin rechazos: el proceso heretic elimina las negativas del modelo original en todos los bloques de razonamiento probados.
- Decodificación especulativa: conserva la cabeza nextn (tensors `blk.32.*`), lo que puede acelerar la inferencia en llama.cpp.
- Idioma principal: inglés (tag `en`); el soporte de otros idiomas no está documentado.
- No se ha documentado soporte de tool calling, capacidades de visión, audio ni agentes multi-step.

## Casos de uso

- Experimentación local con modelos sin censura: investigadores y usuarios avanzados pueden estudiar el comportamiento de un modelo abliterado en hardware de consumo, dado que la variante IQ2_M ocupa solo 3,7 GB.
- Chatbot local en GPU doméstica: con la variante Q4_K_M (5,5 GB) cabe holgadamente en una RTX 3060 de 12 GB u RTX 4060 Ti de 16 GB, permitiendo conversaciones multi-turno offline.
- Escritura creativa sin restricciones: el modelo genera monólogos y ficción sin negativas, útil para autores que trabajan con personajes villanescos o contenido maduro ficticio.
- Pruebas de robustez de cuantizaciones: el repositorio incluye el archivo imatrix y comandos reproducibles para generar cuantizaciones adicionales (por ejemplo IQ2_XS), lo que lo hace útil como banco de pruebas de llama.cpp.
- Asistente de conocimiento general offline: para consultas fácticas y razonamiento básico en entornos sin conexión, aunque con la fiabilidad propia de un modelo de 9B cuantizado en 2-4 bits.
- Desarrollo y depuración con llama.cpp: el modelo requiere builds recientes con soporte de la arquitectura Qwen3.5, por lo que sirve como caso de prueba para validar compatibilidad de nuevas versiones de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es cualitativa, mediante pruebas de prompt con llama-server: respuestas coherentes en preguntas fácticas y ausencia total de rechazos en cuatro sondas (conocimiento general, guía de ganzúa con clip, receta de termita con ratio Goldschmidt y monólogo de villano).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos):
  - IQ2_M (3,7 GB): viable en GPU de 4-6 GB o incluso en CPU con RAM moderada.
  - IQ3_M (4,5 GB): GPU de 6 GB.
  - IQ4_XS (5,0 GB): GPU de 6-8 GB.
  - Q4_K_M (5,5 GB): GPU de 8 GB, dejando margen para el KV cache.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores para contexto largo; en el lado profesional, cualquier GPU moderna con CUDA o Vulkan soportada por llama.cpp.
- Cabe en consumer GPU: sí, en todas las cuantizaciones ofrecidas, incluso en GPUs de gama media baja; el tamaño del repo completo es de 19,4 GB.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, opción documentada por el autor); se requiere un build reciente con soporte de la arquitectura Qwen3.5 (0.7.0-dev o master). Al ser GGUF, es compatible indirectamente con Ollama, LM Studio y otros runtimes basados en llama.cpp, aunque la compatibilidad con la arquitectura Qwen3.5 depende de la versión. vLLM y TGI no soportan GGUF directamente.
- Latencia y throughput: no disponible; la presencia de la cabeza especulativa nextn sugiere aceleración por decodificación especulativa en builds compatibles, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizaciones | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3.8-9B-Heretic-GGUF | 9,2B | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M | Apache 2.0 | Abliterado (heretic), conserva cabeza especulativa nextn |
| Qwen3 8B (oficial) | 8B | GGUF oficiales Q4 en adelante | Apache 2.0 | Modelo original con alineamiento completo, mayor fiabilidad |
| Dolphin modelos (p. ej. Dolphin 2.9 basados en Qwen/Llama) | ~7-9B | GGUF variados | Apache 2.0 / otras | Alineados sin censura mediante fine-tuning, más maduros documentalmente |

Nota: no hay alternativas documentadas con la misma arquitectura Qwen3.5 destilada y abliterada; la comparativa se establece con modelos de categoria y tamano similares.

## Limitaciones y advertencias

- Al ser un modelo abliterado, no rechazará peticiones potencialmente peligrosas (armas, actividades ilegales, etc.); su uso para generar contenido dañino puede tener consecuencias legales y éticas graves. La responsabilidad recae íntegramente en el usuario.
- Riesgo de alucinación elevado y no cuantificado: no hay benchmarks que permitan evaluar la fiabilidad factual, y la cuantización en 2-3 bits (IQ2_M, IQ3_M) degrada adicionalmente la calidad.
- Idioma: solo se documenta soporte de inglés; el rendimiento en castellano no está verificado.
- Contexto: la longitud de ventana no está publicada; el corpus de calibración de la imatrix usó n_ctx=512, lo que sugiere precaución con contextos largos en cuantizaciones bajas.
- La cuantización TQ2_0 produce salida incoherente y no debe usarse; IQ2_M e IQ3_M son los mínimos viables.
- Se requiere llama.cpp reciente con soporte de la arquitectura Qwen3.5; builds antiguos no cargarán el modelo.
- Procedencia poco documentada: no se conocen los datos de entrenamiento del destilado original ni su proceso de alineación, lo que dificulta evaluar sesgos.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo base destilado y abliterado puede tener sus propias condiciones; conviene verificar la ficha de petruhonk/Qwen3.8-9B-Distill-uncensored-heretic.

## Enlaces

- Repositorio del modelo (GGUF): https://huggingface.co/hakergeniusz/Qwen3.8-9B-Heretic-GGUF
- Modelo base (destilado abliterado): https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- No se han encontrado enlaces adicionales (papers, blogs o demos) en la informacion disponible.
