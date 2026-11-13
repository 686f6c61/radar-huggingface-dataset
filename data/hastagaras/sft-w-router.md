# Hastagaras/sft-w-router

## Resumen

Hastagaras/sft-w-router es un modelo publicado en Hugging Face por el usuario Hastagaras el 13 de noviembre de 2026. Se distribuye como un repositorio de 15,8 GB en formato safetensors y es compatible con la librería transformers. El nombre sugiere un ajuste fino supervisado (SFT) con un componente de enrutamiento (router), lo que apunta a una posible arquitectura de mezcla de expertos (MoE) o a un sistema de enrutamiento entre cabezas o adaptadores, aunque esta interpretación no está confirmada por el autor.

La model card es la plantilla automática de Hugging Face sin rellenar: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluación) figuran como "[More Information Needed]". No hay pipeline declarado, ni descargas, ni likes, ni documentación técnica asociada. El tag `arxiv:1910.09700` corresponde a la referencia genérica de la calculadora de impacto medioambiental de Lacoste et al. (2019), presente en la plantilla por defecto, y no a un paper del modelo.

Por tanto, esta ficha se limita a documentar lo verificable: identificación, tamaño del repositorio, formato y librería. Cualquier dato sobre arquitectura, parámetros, contexto, entrenamiento o rendimiento debe considerarse no disponible. El modelo no es apto para uso en producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere SFT con router; sin confirmar) |
| Parametros totales | no disponible (repo de 15,8 GB en safetensors, compatible con un modelo de ~7-8B en fp16, estimacion no confirmada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 15,8 GB |
| Pipeline declarado | no disponible |
| Fecha de publicacion | 2026-11-13 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura. El nombre del repositorio ("sft-w-router") sugiere un ajuste fino supervisado con algun mecanismo de enrutamiento, pero el autor no documenta si se trata de un transformer denso, un MoE, un modelo con adaptadores enrutados o un sistema multi-cabeza. Tampoco se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO.

El unico dato tecnico verificable es el tamano del repositorio (15,8 GB) y el formato safetensors, lo que es coherente con pesos en fp16 o bf16 de un modelo de escala media (del orden de 7-8 mil millones de parametros), aunque esta estimacion no puede confirmarse sin inspeccionar los tensores. No se dispone de informacion sobre innovaciones tecnicas, atencion lineal, decodificacion especulativa ni estrategias de entrenamiento.

## Capacidades

- Generacion de texto: no confirmada por el autor; previsible en un modelo transformers, pero sin documentar.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Enrutamiento (segun el nombre del repo): posible mecanismo interno, sin documentar ni verificar.

## Casos de uso

- Evaluacion interna de modelos: el repositorio puede descargarse y probarse en un entorno aislado para determinar sus capacidades reales antes de cualquier uso, dado que no hay documentacion.
- Investigacion sobre tecnicas de enrutamiento: si el nombre refleja un mecanismo de router, puede servir como material de estudio comparativo frente a arquitecturas MoE convencionales, siempre que el usuario inspeccione la configuracion del modelo.
- Pruebas de integracion con transformers: util para validar pipelines de carga, tokenizacion y generacion en un entorno controlado, dado que el modelo se distribuye en safetensors y es compatible con la libreria.
- Fine-tuning posterior: al ser presumiblemente un modelo SFT, podria servir como base para ajustes adicionales, aunque sin licencia declarada no se recomienda su uso comercial.
- Experimentacion academica: util como ejemplo de publicacion sin model card completa, para discutir buenas practicas de documentacion en el ecosistema open source.
- Benchmarking de infraestructura: su tamano (15,8 GB) permite probar pipelines de carga y despliegue en GPUs de gama media-alta, sin garantias sobre la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint safetensors de 15,8 GB sugiere pesos en fp16/bf16 de un modelo de escala media; la inferencia en fp16 requeriria del orden de 16 GB de VRAM mas overhead de activaciones y cache KV, aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponible. Por tamano del repo, GPUs con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4, A100) serian candidatas razonables para fp16, sin confirmacion.
- Cabe en consumer GPU: probablemente en RTX 3090/4090 en fp16 si la estimacion de tamano es correcta; no confirmado.
- Opciones de despliegue: transformers es la unica libreria declarada. vLLM, TGI, llama.cpp u Ollama no estan confirmados; no hay GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, y el autor no declara la familia, el tamano ni la tarea del modelo, por lo que cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Model card vacia: todos los campos relevantes (arquitectura, datos, evaluacion, licencia) figuran como "[More Information Needed]".
- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribucion; el uso en produccion queda desaconsejado sin aclaracion legal.
- Sin benchmarks ni evaluacion: no hay evidencia de calidad, sesgos o robustez.
- Sin idiomas declarados: se desconoce el soporte multilingue real.
- Riesgo de alucinacion: no evaluado; sin datos de entrenamiento ni de alineacion, no puede descartarse.
- Sesgos: no documentados; sin informacion sobre la composicion del dataset, no pueden evaluarse.
- Contexto y cuantizacion: no disponibles; no hay versiones GGUF ni cuantizadas en el repositorio.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar su comportamiento con otros usuarios.
- El tag `arxiv:1910.09700` es una referencia generica de la plantilla de Hugging Face, no un paper del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hastagaras/sft-w-router
- Referencia citada en el tag (calculadora de impacto medioambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact#compute
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
