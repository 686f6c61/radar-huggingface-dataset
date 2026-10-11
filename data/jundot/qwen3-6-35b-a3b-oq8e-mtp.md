# Jundot/Qwen3.6-35B-A3B-oQ8e-mtp

## Resumen

Jundot/Qwen3.6-35B-A3B-oQ8e-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) multimodal de tipo image-text-to-text. El autor, Jundot, lo ha generado con la herramienta oQ de oMLX (version 0.7.1) aplicando cuantizacion de precision mixta denominada oQ8e, que asigna bits por sensibilidad medida de cada capa. El resultado es un checkpoint de 35.951.822.704 parametros que ocupa 35,953 GiB (38,605 GB) en disco, con una media efectiva de 8,590 bits por peso.

El modelo conserva los tres componentes del original: el backbone de lenguaje (34,661B de parametros), el codificador de vision (0,447B) y la cabeza de prediccion multi-token o MTP (0,845B). La arquitectura combina capas Gated DeltaNet con capas Gated Attention, un diseno hibrido poco habitual, y activa aproximadamente 3B de parametros por token, lo que reduce el coste de inferencia frente a un modelo denso de tamano equivalente. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es practica: permite ejecutar un modelo multimodal de 35B en hardware Apple Silicon con memoria unificada, donde el checkpoint original en BF16 no cabria con comodidad, manteniendo la cabeza MTP para decodificacion especulativa. No hay descargas ni likes registrados en el momento de redactar esta ficha y no se han publicado resultados de benchmarks asociados a esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text) con capas hibridas Gated DeltaNet y Gated Attention |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | ~3B (variante A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e de precision mixta: affine 8-bit grupo 64 (34,134B, 94,945%), affine 8-bit grupo 128 (1,340B, 3,727%) y BF16 (0,478B, 1,329%); media efectiva 8,590 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, libreria mlx) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 38,6 GB (35,953 GiB) |
| Componentes incluidos | Backbone de lenguaje (34,661B), codificador de vision (0,447B), cabeza MTP (0,845B) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos con dos rasgos estructurales destacados. El primero es la disposicion hibrida de capas: combina capas Gated DeltaNet, un mecanismo de atencion lineal recurrente, con capas de Gated Attention clasica. El segundo es que, pese a tener 35B parametros totales, solo activa unos 3B por token, de manera que el coste computacional por token se aproxima al de un modelo denso de 3B mientras la capacidad de representacion se reparte entre todos los expertos. El checkpoint incluye ademas un codificador de vision, lo que habilita la entrada de imagenes junto al texto, y una cabeza de prediccion multi-token (MTP) pensada para decodificacion especulativa.

Esta ficha describe exclusivamente el proceso de cuantizacion, no un reentrenamiento. El autor no aporta datos sobre el dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO: esa informacion corresponde al modelo base y no esta disponible aqui. La innovacion tecnica de este checkpoint es el metodo oQ8e: se mide la sensibilidad de cada capa y se asignan bits en consecuencia, cada grupo se redondea con una matriz de importancia (128 muestras x 512 tokens) y se reajustan escala y sesgo mediante minimos cuadrados ponderados. El reparto final concentra el 94,945% de los pesos en 8 bits con grupo 64, reserva 8 bits con grupo 128 para un 3,727% y mantiene un 1,329% en BF16.

## Capacidades

- Generacion de texto conversacional, con la etiqueta `conversational` en la model card.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), gracias al codificador de vision incluido en el checkpoint.
- Razonamiento multi-paso y uso como agente: el modelo base pertenece a la familia Qwen3.6, si bien la model card de esta cuantizacion no detalla soporte explicito de tool calling.
- Decodificacion especulativa mediante la cabeza de prediccion multi-token (MTP) incluida y cuantizada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de pensamiento (thinking) y otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados en local: al integrar codificador de vision, el modelo puede recibir una imagen de factura o contrato y devolver texto estructurado, sin enviar datos a servicios externos, algo relevante para entornos con requisitos de privacidad.
- Asistente conversacional de escritorio en Mac: con 3B parametros activos por token y un checkpoint de 35,953 GiB, es viable mantener una sesion interactiva en un equipo Apple Silicon de gama alta sin depender de API externas.
- Extraccion de informacion de capturas de pantalla: el modelo puede describir o transcribir el contenido de una captura y convertirla en datos utilizables dentro de un flujo de trabajo automatizado.
- Generacion y revision de codigo en local: la familia Qwen3.6 cubre tareas de programacion, y ejecutarlo en el propio equipo evita filtrar codigo propietario a terceros.
- Prototipado de agentes con decodificacion especulativa: la cabeza MTP permite experimentar con aceleracion de generacion en MLX y medir el impacto real sobre la latencia.
- Investigacion sobre cuantizacion: el reparto de bits documentado (grupo 64, grupo 128 y BF16) sirve como caso de estudio reproducible para evaluar tecnicas de precision mixta guiadas por sensibilidad.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir la perdida de calidad respecto al checkpoint BF16 en tareas de vision y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint: 35,953 GiB en disco (38,605 GB en el repositorio), mas overhead de ejecucion, cache KV y buffers de activaciones.
- Estimacion de memoria unificada: un minimo practico de 48 GB y un rango recomendado de 64 GB o superior para trabajar con contextos largos o imagenes de resolucion elevada. Es una estimacion a partir del tamano del checkpoint, no un dato publicado por el autor.
- Equipos Apple Silicon compatibles: chips Max y Ultra con 64 GB, 96 GB, 128 GB o 192 GB de memoria unificada (por ejemplo M2 Max, M3 Max, M4 Max, M2 Ultra).
- GPU dedicadas: no aplicable. El formato es MLX, por lo que no se ejecuta sobre CUDA ni sobre ROCm; no cabe plantear su uso en RTX 4090, A100 o H100 sin una conversion previa a otro formato, que no esta documentada por el autor.
- Opciones de despliegue: runtime MLX, con las librerias mlx y mlx-lm para lenguaje y mlx-vlm para el modo multimodal; el autor mantiene la herramienta oMLX en el repositorio jundot/omlx.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Tamano en disco | Licencia |
|---|---|---|---|---|---|---|
| Jundot/Qwen3.6-35B-A3B-oQ8e-mtp | 35,952B | ~3B | no disponible | oQ8e, 8,590 bits/peso efectivos | 38,605 GB (35,953 GiB) | Apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35,952B | ~3B | no disponible | BF16, 16 bits/peso | ~71,9 GB (estimado a partir del numero de parametros) | Apache-2.0 |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el checkpoint original: esta version reduce el almacenamiento aproximadamente a la mitad, de unos 71,9 GB en BF16 a 38,605 GB, manteniendo identificico el numero de parametros logicos. No se dispone de datos de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una cuantizacion de 8 bits, existe una perdida de fidelidad respecto al modelo BF16. El autor no publica ninguna evaluacion de la degradacion, por lo que no puede cuantificarse.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos. No hay datos especificos de este checkpoint, pero el modelo original tampoco incorpora mecanismos de verificacion factual.
- La model card no documenta sesgos conocidos, idiomas soportados ni comportamiento en dominios sensibles.
- Limitacion de plataforma: el formato MLX restringe su uso a hardware Apple Silicon con runtime MLX. No es desplegable en GPUs NVIDIA o AMD sin conversion, y no se documenta ninguna ruta de conversion a GGUF.
- La cuantizacion mixta reserva solo 1,329% de los pesos en BF16, lo que concentra la precision en un subconjunto reducido de capas; si el criterio de sensibilidad falla en alguna capa concreta, el efecto no se ha publicado.
- Sin datos de contexto maximo: conviene verificar la ventana real del modelo base antes de disenar aplicaciones con entradas largas.
- Licencia Apache-2.0, que permite uso comercial segun los terminos del modelo base. Debe conservarse el archivo LICENSE incluido en el repositorio.
- Estado del repositorio: cero descargas y cero likes en el momento de redactar esta ficha, y sin validacion externa conocida.
- No hay soporte de tool calling confirmado para este checkpoint concreto; verificarlo antes de integrarlo en un agente en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de la herramienta de cuantizacion oMLX: https://github.com/jundot/omlx
- Pull request de la cuantizacion oQe mejorada: https://github.com/jundot/omlx/pull/4385
