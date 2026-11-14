# PsychoLogic/pplx-decider-v1.2-27B-IQ3_M-GGUF

## Resumen

pplx-decider-v1.2-27B-IQ3_M-GGUF es una cuantización en formato GGUF del modelo perplexity-ai/pplx-decider-v1.2, publicada por el usuario PsychoLogic. Se trata de una versión IQ3_M (aproximadamente 3 bits por peso) generada con llama.cpp a partir de los pesos originales en F16, con el objetivo declarado de hacer viable la inferencia del modelo en tarjetas gráficas de 16 GB de VRAM. El autor mantiene la semántica de los pesos originales y remite a la model card del modelo base para la licencia y la atribución.

El modelo base pertenece a la familia de modelos "decider" de Perplexity, orientados a tareas de decisión estructurada (selección de opciones y lectura de slots en un único forward pass) más que a generación de texto libre. El repositorio incluye metadatos específicos (`qwen35.decision.type = pplx-decider`) que permiten a llama.cpp detectar el tipo de decisión de forma nativa, lo que sugiere una arquitectura derivada de la familia Qwen 3.5 con un protocolo de decisión añadido.

La relevancia de esta publicación es doble: por un lado, ofrece una vía práctica para ejecutar un modelo de 26.900 millones de parámetros en hardware de consumo; por otro, documenta una validación empírica sobre 7.854 llamadas reales de un entorno de trading durante 14 días, con cero errores, lo que aporta evidencia de estabilidad en un caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen 3.5 segun metadatos `qwen35.decision.type`) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (configuracion de servicio recomendada por el autor) |
| Tipos de cuantizacion | IQ3_M (unica incluida en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (12,6 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos del GGUF (`qwen35.decision.type = pplx-decider`) indican que llama.cpp lo reconoce como perteneciente a la familia Qwen 3.5 con un tipo de decisión específico, lo que apunta a un transformer con una cabeza o protocolo de decisión dedicado. El número de parámetros (26,9 B) y el tamaño del archivo cuantizado (12,6 GB en IQ3_M) son coherentes con un modelo denso de esa escala.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre volumen de tokens, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio cuantizado remite explícitamente a la del modelo base para el protocolo de decisión y el contexto de benchmarks, pero esos detalles no se incluyen en el material consultado.

La innovación técnica destacable de esta publicación concreta es el proceso de cuantización: se generó con `convert_hf_to_gguf.py` y `llama-quantize` sobre la rama master de llama.cpp (commit `0a731cc`), con parches del conversor incluidos en el directorio `patches/`. El autor señala que la master upstream detecta esta familia de checkpoints de forma nativa, sin necesidad de parches adicionales en el momento de la validación.

## Capacidades

- Modelo orientado a decisión estructurada: lectura de slots y selección de opciones en un único forward pass, según el protocolo descrito en la model card del modelo base.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar.
- Naturaleza conversacional: la etiqueta `conversational` indica soporte para interacción por turnos.
- Detección nativa por parte de llama.cpp mediante el campo `qwen35.decision.type = pplx-decider`.
- Soporte de caché KV en q8_0 para reducir el consumo de memoria durante el servicio.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, visión, audio ni capacidades multilingües específicas.

## Casos de uso

- Toma de decisiones automatizada en entornos financieros: el autor validó el modelo reproduciendo 7.854 llamadas reales de decisión de una ventana de trading de 14 días, con cero errores. El modelo es adecuado porque su protocolo de decisión produce una salida determinista y verificable por llamada.
- Señalización y clasificación en pipelines de trading algorítmico: con un contexto de 4.096 tokens y una sola pasada por decisión, encaja en flujos de baja latencia donde cada prompt representa un estado de mercado y la salida es una opción o un slot.
- Evaluación de modelos de decisión en hardware de consumo: al caber en 16 GB de VRAM, permite a equipos pequeños reproducir y auditar el comportamiento del modelo base sin acceso a GPUs de datacenter.
- Prototipado de sistemas de decisión con llama.cpp: la detección nativa del tipo de decisión simplifica la integración en servidores llama.cpp existentes sin lógica de parseo adicional.
- Despliegue en entornos con restricciones de memoria: la cuantización IQ3_M permite mantener un modelo de 26,9 B residente en una única GPU de 16 GB junto con la caché KV en q8_0.
- Reproducibilidad de experimentos: el repositorio incluye `SHA256SUMS`, lo que facilita verificar la integridad de los pesos en entornos de investigación y auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es una prueba de estabilidad funcional: 7.854 llamadas de decisión reproducidas desde una ventana real de trading de 14 días (muestra con paso 10 de 78.534 llamadas totales), con prompts byte a byte idénticos y lectura de slot/opción en un único forward, ejecutada en una RTX 5060 Ti de 15.846 MiB con llama.cpp en Docker (nvidia/cuda:12.8.1), `-c 4096 -b 4096 -ub 4096 --parallel 1` y caché KV q8_0, con cero errores.

| Metrica | Valor |
|---|---|
| Llamadas de decision reproducidas | 7.854 |
| Errores | 0 |
| Ventana temporal de origen | 14 dias de trading |
| Muestra total | 78.534 llamadas (muestreo con paso 10) |
| GPU de prueba | RTX 5060 Ti (15.846 MiB) |
| Contexto de servicio | 4.096 tokens |
| Cache KV | q8_0 |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 12,6 GB; con caché KV q8_0 y contexto de 4.096 tokens, el autor lo ejecuta en una GPU de 15.846 MiB con un único modelo residente.
- GPU recomendadas: RTX 5060 Ti de 16 GB (validada por el autor). Por tamaño, debería caber en cualquier GPU con 16 GB o más de VRAM, como RTX 4080, RTX 4090, RTX 5080, A100 o H100, aunque no se han validado en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB como la RTX 5060 Ti según la validación del autor.
- Opciones de despliegue: llama.cpp en versión master de noviembre de 2026 o posterior, con detección nativa del tipo de decisión. Configuración recomendada: `-c 4096 --parallel 1`, opcionalmente con caché KV q8_0. También se menciona despliegue en Docker con imagen `nvidia/cuda:12.8.1`.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencia por llamada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base (perplexity-ai/pplx-decider-v1.2) es la referencia directa, pero no se han facilitado sus especificaciones completas ni alternativas de la misma categoría de decisión.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pplx-decider-v1.2-27B-IQ3_M-GGUF | 26,9 B | 4.096 (servicio) | Apache 2.0 | GGUF IQ3_M | Esta ficha |
| perplexity-ai/pplx-decider-v1.2 | 26,9 B | no disponible | Apache 2.0 (segun base) | safetensors (original) | Modelo base, pesos sin cuantizar |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos |

## Limitaciones y advertencias

- La cuantización IQ3_M introduce pérdida de precisión respecto a los pesos F16 originales; el autor no publica una comparación de calidad entre la versión cuantizada y el modelo base.
- El contexto de servicio recomendado es de 4.096 tokens, muy inferior al de muchos modelos contemporáneos; prompts más largos requerirán ajustar `-c` con el consiguiente aumento de memoria.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento en idiomas distintos del inglés.
- El modelo está especializado en decisión estructurada; no se ha documentado su comportamiento en generación de texto libre, código o matemáticas.
- La validación empírica se limita a un dominio concreto (trading) y a una única GPU; no hay evidencia publicada de robustez en otros dominios o hardware.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la model card del modelo base para condiciones adicionales de atribución.
- El repositorio tiene un número muy bajo de descargas (41) y cero likes en el momento de la consulta, lo que limita la validación comunitaria.
- El campo de fecha de creación (2026-11-13) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/PsychoLogic/pplx-decider-v1.2-27B-IQ3_M-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: no disponible en la informacion proporcionada (se menciona el commit `0a731cc` de la rama master)
- Paper, blog o demo: no disponibles en la informacion proporcionada
