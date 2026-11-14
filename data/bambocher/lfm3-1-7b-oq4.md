# bambocher/LFM3-1.7B-oQ4

## Resumen

LFM3-1.7B-oQ4 es una cuantizacion del modelo LFM3 de 1.700 millones de parametros, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del LFM3 original de Liquid AI, convertido a precision mixta mediante la herramienta oQ (oMLX v0.7.3) para su uso en el ecosistema MLX de Apple Silicon. El resultado es un unico archivo de aproximadamente 1,1 GB con un promedio efectivo de 4,801 bits por peso.

El modelo resuelve el problema de ejecutar un transformer de 1.700 millones de parametros en hardware Apple con memoria unificada limitada, manteniendo una calidad cercana al original gracias a una asignacion no uniforme de bits: el 71 % de los pesos se almacena a 4 bits, el 28 % a 5 bits y una fraccion minima a 6 y 8 bits. Esta estrategia de precision mixta preserva con mas fidelidad las capas consideradas mas sensibles.

Es relevante ahora porque el ecosistema MLX permite desplegar modelos cuantizados de forma nativa en macOS, y este checkpoint es un ejemplo de cuantizacion agresiva pero selectiva. La informacion publicada es muy escasa: la model card solo documenta la distribucion de bits y el desglose de almacenamiento, sin datos sobre arquitectura base, contexto, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LFM3; pesos en formato MLX) |
| Parametros totales | 1.728.801.536 (1,729 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta affine: 4 bits (grupo 64), 5 bits (grupo 64), 6 bits (grupo 64), 8 bits (grupo 64) y BF16; promedio efectivo 4,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con `custom_code` (libreria mlx) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM3 en la documentacion proporcionada. Por el nombre y el ecosistema, se trata de un transformer de la familia LFM3 de Liquid AI, pero no se confirma en la model card ni el tipo de atencion, ni si incorpora componentes hibridos o MoE. El checkpoint aqui publicado no ha sido reentrenado: es una conversion de pesos.

El proceso de cuantizacion se realizo con oQ (oMLX v0.7.3), que aplica precision mixta por tensor. Segun la tabla del autor, 1,229 B de pesos (71,099 %) se almacenan a 4 bits con grupo de 64, 0,482 B (27,901 %) a 5 bits, 0,017 B (0,970 %) a 6 bits y una fraccion residual a 8 bits y BF16. El checkpoint completo ocupa 0,966 GiB (1,038 GB) y el modelo de lenguaje representa la totalidad del almacenamiento. No se documentan datos de entrenamiento, tokens vistos ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se detalla en la model card.
- Razonamiento y codigo: no disponible; no se documentan capacidades especificas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion nativa en MLX: el checkpoint esta empaquetado para la libreria mlx, lo que habilita inferencia en Apple Silicon.

## Casos de uso

- Prototipado local en macOS: el checkpoint se puede cargar con MLX en un Mac con memoria unificada para experimentar con generacion de texto sin depender de la nube, gracias a su tamano de 1,1 GB.
- Evaluacion de tecnicas de cuantizacion: util para comparar la calidad de la precision mixta de oQ frente a cuantizaciones uniformes de 4 bits sobre el mismo modelo base.
- Aplicaciones de escritorio con IA integrada: al caber en memoria de equipos consumer Apple, puede embeberse en herramientas nativas de macOS que requieran inferencia offline.
- Filtrado y clasificacion de texto en local: para tareas de procesamiento por lotes en las que la privacidad impide enviar datos a un servicio externo.
- Educacion e investigacion: como ejemplo reproducible de pipeline de cuantizacion MLX para estudiar el impacto de la asignacion de bits por capa.
- Pruebas de integracion en pipelines MLX: validar el soporte de `custom_code` y safetensors en entornos de desarrollo antes de adoptar modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,1 GB para los pesos en disco; en memoria unificada se requiere espacio adicional para el grafo de computacion y el contexto, por lo que conviene reservar entre 2 y 3 GB.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta pensado para Apple Silicon (series M1, M2, M3, M4).
- Cabe en GPU consumer: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada.
- Opciones de despliegue: libreria mlx (MLX / mlx-lm) en macOS; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ4 (este) | 1,729 B | no disponible | Mixta 4-8 bits (4,801 bits/peso) | no disponible | safetensors MLX |
| LFM3-1.7B original | 1,7 B (aprox.) | no disponible | BF16 | no disponible | no disponible |
| Cuantizaciones uniformes 4-bit de modelos de ~1,7 B | ~1,7 B | variable | 4 bits uniforme | segun modelo base | GGUF / MLX |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y esquema de cuantizacion.

## Limitaciones y advertencias

- La model card no documenta la licencia, lo que impide confirmar si se permite uso comercial; debe verificarse en el repositorio del modelo base LFM3 antes de cualquier despliegue en produccion.
- No se especifican idiomas soportados ni longitud de contexto, datos criticos para planificar aplicaciones reales.
- La cuantizacion a 4-5 bits puede degradar la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento o generacion de codigo; no hay evaluaciones publicadas que lo cuantifiquen.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no hay datos de alineacion ni de evaluaciones de seguridad.
- El checkpoint depende de `custom_code` y de la libreria mlx, lo que limita su portabilidad fuera del ecosistema Apple.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia; no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos conocidos ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ4
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
