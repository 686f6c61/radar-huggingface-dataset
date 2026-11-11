# ScAGI/affordable-frontier-architectures

## Resumen

`affordable-frontier-architectures` es un repositorio de investigación alojado en Hugging Face por el usuario ScAGI, mantenido por el mismo autor que la cuenta MarxistLeninist. No se trata de un modelo conversacional ni de un modelo listo para producción: es un espejo (mirror) de los artefactos de un repositorio de investigación que compara dos arquitecturas en un experimento controlado de pequeño escala. Concretamente, contiene la copia completa del release público del piloto `nat_transformer_mamba_20261111`, que enfrenta un Transformer NAT (non-autoregressive) de paso único contra una Mamba-1 bidireccional, con 800 actualizaciones de entrenamiento.

Los checkpoints incluidos son deliberadamente minúsculos: 94.416 parámetros para el Transformer y 94.320 para la referencia Mamba, en FP32 y almacenados como state dicts planos de PyTorch. El autor es explícito al señalar que no son modelos útiles para conversación, sino artefactos de investigación para reproducir métricas y auditorías. El repositorio no define licencia para el código ni para los checkpoints, y no declara idiomas soportados ni pipeline.

Su relevancia es metodológica más que de producto: ofrece un conjunto reproducible (con manifiesto SHA256 de todos los ficheros) para estudiar el comportamiento de arquitecturas no autoregresivas frente a modelos de espacio de estados en un régimen de cómputo muy limitado. El mirror existe porque la cuota de almacenamiento público de la cuenta principal está agotada, lo que impide subir ficheros grandes allí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer NAT (non-autoregressive) y Mamba-1 bidireccional (dos modelos separados en el piloto) |
| Parametros totales | 94.416 (Transformer) / 94.320 (Mamba de referencia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el mirror no asigna licencia) |
| Formato de pesos | PyTorch state dict plano (cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

El experimento compara dos familias de arquitectura. Por un lado, un Transformer NAT (non-autoregressive transformer) de paso único, es decir, que genera la secuencia completa en una sola pasada en lugar de token a token. Por otro, una Mamba-1 bidireccional como referencia, basada en modelos de espacio de estados (SSM). Ambos se entrenaron durante 800 actualizaciones en un régimen de cómputo muy reducido, con el objetivo declarado de medir y auditar diferencias de comportamiento, no de alcanzar calidad de producción.

El repositorio incluye código, protocolos, métricas, auditorías y los 16 checkpoints pequeños en FP32, todos byte a byte idénticos al commit `1acf25d54bdcbf532ade1ff827b60b9a5583e138` del repositorio en GitHub. El fichero `FILE_MANIFEST.json` lista el SHA256 de cada archivo, lo que permite verificar la integridad de la réplica. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni sobre si se aplicaron técnicas de RLHF o DPO; el autor remite a `REPORT.md` para conocer qué se midió y los límites del resultado.

## Capacidades

- No es un modelo de generación de texto utilizable: los checkpoints son artefactos de investigación de ~94.000 parámetros.
- El Transformer NAT implementa generación no autoregresiva de paso único en el marco del experimento.
- La Mamba-1 bidireccional sirve como referencia arquitectónica en la comparación.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas.
- No hay modo thinking, visión ni audio.
- El valor práctico es la reproducibilidad: carga de state dicts con la clase `NAT` de `nat_compare_20261111/models.py` y verificación de integridad mediante SHA256.

## Casos de uso

- Reproducción de experimentos: cargar los 16 checkpoints y el código del release para replicar las métricas del piloto NAT Transformer frente a Mamba-1, verificando previamente la integridad con `FILE_MANIFEST.json`.
- Estudio de arquitecturas no autoregresivas: usar el Transformer NAT de paso único como banco de pruebas didáctico para analizar el comportamiento de la decodificación no autoregresiva en un entorno de cómputo mínimo.
- Comparación SSM frente a attention: emplear la Mamba-1 bidireccional de referencia para contrastar curvas de entrenamiento y métricas con el Transformer bajo el mismo protocolo de 800 actualizaciones.
- Auditoría de resultados de investigación: revisar los informes y auditorías incluidos (`REPORT.md`, protocolos) para evaluar la solidez metodológica de las conclusiones del autor antes de citarlas.
- Docencia y formación: utilizar los checkpoints minúsculos como ejemplo práctico de carga de state dicts en PyTorch con `weights_only=True` y `map_location="cpu"`, sin necesidad de GPU.
- Infraestructura de espejos (mirroring): servir como caso de estudio de replicación de artefactos entre GitHub y Hugging Face cuando la cuota de almacenamiento de una cuenta está agotada, con verificación criptográfica de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio remite a `nat_compare_20261111/REPORT.md` para consultar qué se midió y los límites del resultado, pero los valores concretos no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para cada checkpoint (94.416 y 94.320 parámetros en FP32, aproximadamente 0,38 MB por modelo).
- GPU recomendadas: no se requiere GPU; los checkpoints se cargan en CPU con `map_location="cpu"`.
- Cabe en cualquier GPU consumer y en cualquier CPU convencional.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el único camino documentado es PyTorch con `torch.load` y la clase `NAT` de `models.py`.
- Latencia y throughput: no disponibles, y sin significado práctico para modelos de este tamaño en tareas conversacionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| affordable-frontier-architectures (NAT Transformer) | 94.416 | no disponible | Transformer NAT de investigación | no disponible | Hugging Face (mirror) y GitHub |
| affordable-frontier-architectures (Mamba-1 bidireccional) | 94.320 | no disponible | SSM de referencia | no disponible | Hugging Face (mirror) y GitHub |
| Modelos conversacionales de producción | miles de millones | decenas de miles de tokens | Transformer/MoE | variable | Hugging Face, APIs |

No se dispone de modelos comparables de la misma categoría (pilotos de investigación de ~94.000 parámetros con protocolo documentado) en la información proporcionada. La comparación con modelos conversacionales de producción no es significativa por diferencia de escala de tres a cinco órdenes de magnitud.

## Limitaciones y advertencias

- No es un modelo conversacional: el propio autor lo califica de artefacto de investigación, no de modelo útil para diálogo.
- Escala mínima: ~94.000 parámetros, insuficiente para cualquier tarea de lenguaje real.
- Sin licencia asignada: el mirror no define licencia para código ni checkpoints, lo que impide determinar condiciones de uso comercial o redistribución.
- Sin información de sesgos, alucinación o limitaciones idiomáticas porque no se declaran idiomas ni evaluación de calidad.
- Entrenamiento muy corto (800 actualizaciones), lo que limita la validez de cualquier generalización de los resultados.
- Dependencia de artefactos externos: el código y los informes viven en GitHub y en la cuenta MarxistLeninist; la réplica en ScAGI solo cubre los checkpoints y el release del experimento.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción ni revisión por terceros.
- Antes de citar resultados, conviene leer `REPORT.md` y las auditorías para conocer los límites declarados por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ScAGI/affordable-frontier-architectures
- Repositorio fuente en GitHub: https://github.com/Marxist-Leninist/affordable-frontier-architectures
- Commit de referencia del release: https://github.com/Marxist-Leninist/affordable-frontier-architectures/tree/1acf25d54bdcbf532ade1ff827b60b9a5583e138/experiments/nat_transformer_mamba_20261111
- Informes y resultados en Hugging Face: https://huggingface.co/MarxistLeninist/affordable-frontier-architectures
