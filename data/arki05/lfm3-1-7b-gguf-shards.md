# Arki05/LFM3-1.7B-GGUF-shards

## Resumen

LFM3-1.7B-GGUF-shards es un repositorio de artefactos de cuantizacion derivado de LiquidAI/LFM3-1.7B, no un modelo entrenado de forma independiente. Lo publica el usuario Arki05 y su proposito es servir de almacen de tensores ya cuantizados: cada tensor del modelo original se ofrece aislado en cada uno de los 24 tipos de cuantizacion de llama.cpp, de modo que una herramienta externa (qalloc) pueda ensamblar un GGUF final con un tipo distinto por tensor.

El modelo base, LFM3-1.7B, lo desarrolla Liquid AI y pertenece a la familia LFM3 (Liquid Foundation Models), con 1.700 millones de parametros. La model card del repositorio no detalla la arquitectura interna del modelo original, por lo que los datos de contexto, composicion de entrenamiento y capacidades no estan disponibles en la informacion proporcionada.

La relevancia de este repositorio es practica: permite cuantizacion heterogenea por tensor (mezclar tipos dentro de un mismo GGUF) sin recompilar el modelo desde cero, algo util para ajustar tamano y calidad en despliegues con llama.cpp. El repositorio ocupa 7,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; la model card no especifica transformer, MoE ni hibrida) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 24 tipos de llama.cpp, un GGUF por tipo en `types/<T>.gguf`; el listado vigente esta en `manifest.json` |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), igual que el modelo original |
| Formato de pesos | GGUF (BF16 de origen en `source/`, tensores cuantizados por tipo, `skeleton.gguf` y metadatos en `manifest.json`, `store.json` y `records/`) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: redistribuye los pesos BF16 de LiquidAI/LFM3-1.7B-GGUF, sin modificar, en la carpeta `source/`, y genera a partir de ellos versiones cuantizadas de cada tensor. Segun la model card, los tensores cuantizados se reconstruyen desde los pesos BF16 mediante cuantizacion con informacion de Hessiana, manteniendo el mismo tipo, formato y tamano que los tipos nativos de llama.cpp, de forma que un GGUF ensamblado con ellos declara el tipo plano `T` y funciona en llama.cpp estandar.

La estructura del repositorio separa cuatro elementos: `types/<T>.gguf` con todos los tensores a un tipo dado, `skeleton.gguf` con la estructura del grafo, `manifest.json` (esquema `qcore-store/1`) con el desplazamiento y el sha256 de cada tensor, y `records/` y `store.json` como indices de lectura para qalloc. La model card indica que se siguen anadiendo tipos. No hay informacion sobre la arquitectura del modelo base, el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto: heredadas del modelo base LFM3-1.7B; la model card de este repositorio no las detalla.
- Razonamiento, codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidad especifica de este repositorio: suministrar tensores cuantizados por tipo para ensamblar GGUFs con cuantizacion heterogenea mediante qalloc.

## Casos de uso

- Cuantizacion heterogenea por tensor: usar qalloc y `manifest.json` para asignar tipos de mayor precision a las capas sensibles (por ejemplo, atencion o embeddings) y tipos mas agresivos al resto, obteniendo un GGUF con un equilibrio tamano/calidad a medida en lugar de un tipo uniforme.
- Evaluacion de degradacion por tipo: ensamblar variantes del mismo modelo con un tipo distinto por tensor y medir la perdida de calidad en tareas concretas, lo que permite justificar con datos la eleccion de cuantizacion en produccion.
- Despliegue en llama.cpp sin conversiones adicionales: los GGUF generados usan tipos planos nativos, por lo que se cargan en llama.cpp estandar y en sus frontends (Ollama, servidores compatibles) sin parches.
- Ajuste de huella de memoria en hardware limitado: al poder rebajar selectivamente la precision de los tensores mas grandes, se puede reducir el peso en disco y en RAM respecto a una cuantizacion uniforme del mismo modelo de 1,7B.
- Reproducibilidad y auditoria de artefactos: los sha256 por tensor de `records/` permiten verificar que el GGUF ensamblado corresponde exactamente a los pesos de origen y detectar corrupciones en la distribucion.
- Experimentacion en investigacion sobre cuantizacion: el repositorio sirve como banco de pruebas para comparar metodos de cuantizacion (Hessiana frente a otras tecnicas) sobre un modelo pequeno de 1,7B con licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; para un modelo de 1,7B en GGUF, los tipos de cuantizacion de llama.cpp situan el peso en un rango aproximado de 1 a 3,5 GB segun el tipo elegido, pero este dato no lo confirma la model card.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1,7B, pero no hay confirmacion en la documentacion del repositorio.
- Opciones de despliegue: llama.cpp (motor de referencia de los tipos GGUF incluidos) y cualquier frontend que consuma GGUF; qalloc para el ensamblado del GGUF final.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF-shards (este repo) | 1,7B | no disponible | LFM Open License v1.0 | GGUF por tensor | Almacen de tensores para cuantizacion heterogenea |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | LFM Open License v1.0 | safetensors (pesos originales) | Modelo base de referencia |
| LiquidAI/LFM3-1.7B-GGUF | 1,7B | no disponible | LFM Open License v1.0 | GGUF BF16 | GGUF oficial de origen usado en `source/` |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo listo para inferencia directa: requiere ensamblar un GGUF con qalloc a partir de `types/`, `skeleton.gguf` y `manifest.json`; cargar los fragmentos por separado no produce un modelo funcional.
- La model card advierte de que los tensores cuantizados son versiones modificadas de los pesos originales; la calidad final depende del tipo asignado a cada tensor.
- El conjunto de tipos esta incompleto y en ampliacion segun la model card; conviene consultar `manifest.json` antes de disenar un pipeline.
- Licencia LFM Open License v1.0: es una licencia "other" con condiciones propias; debe revisarse `LICENSE` antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Sin datos publicados de sesgos, riesgo de alucinacion, limitaciones de contexto o idioma del modelo base en esta informacion.
- Repositorio sin descargas ni interacciones registradas: no hay evidencia de uso en produccion ni validacion externa de los artefactos.
- El repositorio pesa 7,8 GB, muy por encima del peso de un unico GGUF del modelo, por lo que no es adecuado para distribucion ligera.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Arki05/LFM3-1.7B-GGUF-shards
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF BF16 de origen: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Herramienta qalloc: https://arki05.com/projects/qalloc/
- Licencia LFM Open License v1.0: fichero `LICENSE` del repositorio
