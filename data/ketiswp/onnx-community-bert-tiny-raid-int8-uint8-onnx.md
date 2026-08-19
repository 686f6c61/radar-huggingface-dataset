# ketiswp/onnx-community-BERT-tiny-RAID-int8-uint8-onnx

## Resumen

El modelo `ketiswp/onnx-community-BERT-tiny-RAID-int8-uint8-onnx` es una version cuantizada en INT8/UINT8 del modelo BERT-tiny-RAID, un clasificador de texto disenado para detectar texto generado por inteligencia artificial (RAID es un benchmark de deteccion de texto sintetico). El modelo original fue desarrollado por ShantanuT01 y esta version ONNX ha sido preparada por el usuario ketiswp dentro del ecosistema onnx-community.

La relevancia de este modelo reside en su formato ONNX con cuantizacion dinamica de 8 bits, lo que permite ejecutar inferencia de clasificacion de texto con un consumo de memoria y latencia muy reducidos, adecuado para despliegues en entornos con recursos limitados o en produccion donde se necesite un detector de texto IA rapido y ligero. La arquitectura base es BERT-tiny, un transformer de tamano minimo, aunque los parametros exactos no se detallan en la informacion disponible.

Al tratarse de un modelo con licencia MIT, es libre de usar comercialmente sin restricciones de atribucion significativas. No se dispone de datos sobre idiomas soportados, contexto ni benchmarks publicados, por lo que esta ficha se basa exclusivamente en la informacion de la model card y las convenciones tipicas de modelos BERT-tiny.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-tiny (transformer encoder) en formato ONNX |
| Parametros totales | no disponible (estimacion tipica de BERT-tiny: ~4.4 millones) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (estimacion tipica de BERT-tiny: 512 tokens) |
| Tipos de cuantizacion | INT8 (pesos) y UINT8 (activaciones dinamicas), mediante DynamicQuantizeLinear y MatMulInteger |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no aplicable; formato .onnx) |

## Arquitectura y entrenamiento

La arquitectura se basa en BERT-tiny, un transformer encoder de pequeno tamano desarrollado por Google Research, con 2 capas ocultas, 128 dimensiones de embedding y aproximadamente 4.4 millones de parametros. El modelo original fue entrenado para la tarea de clasificacion de texto binaria, especificamente para detectar si un texto ha sido generado por un modelo de lenguaje artificial, utilizando el dataset RAID.

La version ONNX aqui presentada no introduce cambios en la arquitectura, sino que aplica una cuantizacion dinamica de 8 bits sobre los pesos (INT8) y las activaciones (UINT8) mediante los operadores DynamicQuantizeLinear y MatMulInteger. Este proceso reduce el tamano del modelo en memoria y acelera la inferencia en CPU, aunque puede introducir una pequena perdida de precision respecto al modelo FP32 original. No se dispone de informacion sobre el proceso de entrenamiento del modelo original (numero de tokens, dataset, uso de RLHF o DPO).

## Capacidades

- Clasificacion de texto binaria: detecta si un texto es generado por una IA o escrito por un humano.
- Inferencia optimizada para CPU mediante cuantizacion INT8/UINT8 en ONNX Runtime.
- Compatible con el ecosistema ONNX y herramientas de despliegue como ONNX Runtime, llama.cpp (via convertidores) y servicios de inferencia que soporten el formato.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales (vision o audio).
- Capacidades multilingues no confirmadas; el modelo original esta entrenado principalmente con datos en ingles, aunque no se especifica en la informacion disponible.

## Casos de uso

- Moderacion de contenidos en plataformas: el modelo puede clasificar comentarios o publicaciones para identificar texto generado por IA, ayudando a moderadores a detectar contenido sintetico en foros o redes sociales.
- Filtrado de respuestas en chatbots: integrar el modelo en un pipeline para etiquetar si una respuesta generada por un sistema automatico es sintetica, util para auditorias o para evitar suplantacion de autores humanos.
- Analisis de reseñas de productos: clasificar reseñas de usuarios para detectar si han sido generadas automaticamente, ayudando a plataformas de comercio electronico a identificar fraude o contenido falsificado.
- Investigacion academica sobre deteccion de texto sintetico: sirve como baseline ligero para comparar con modelos mas grandes en estudios de deteccion de IA.
- Despliegue en dispositivos edge: gracias a su tamano reducido y cuantizacion, puede ejecutarse en dispositivos con poca memoria (Raspberry Pi, telefonos) para clasificar texto en tiempo real sin conexion a servidores.
- Integracion en pipelines de CI/CD para pruebas de contenido: en entornos de desarrollo, puede validar automaticamente que los textos generados por herramientas de IA no se filtran en documentacion o comunicaciones internas sin etiquetar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre precision en MMLU, HumanEval, GSM8K ni otros benchmarks. La model card no incluye metricas de rendimiento de la cuantizacion ni comparativas con el modelo FP32.

## Requisitos de hardware

- VRAM estimada: el modelo es extremadamente pequeno (~4.4 millones de parametros). Con cuantizacion INT8, el peso del modelo es de aproximadamente 4.4 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin GPU.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060, RTX 3060, etc.) es mas que suficiente; el modelo esta optimizado para CPU.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo y tambien se ejecuta eficientemente en CPU.
- Opciones de despliegue: ONNX Runtime (recomendado), llama.cpp con convertidor de ONNX a GGUF, o servicios de inferencia como Triton o TensorRT (si se convierte).
- Latencia y throughput: no disponibles en la informacion proporcionada, pero dado el tamano minimo, la inferencia en CPU es tipicamente inferior a 10 ms por muestra en hardware moderno.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos similares en la informacion proporcionada. Como referencia general, en la categoria de deteccion de texto de IA existen modelos como RoBERTa-large-OpenAI-detector o GPTZero, pero no se dispone de datos de rendimiento para comparar. No se puede establecer una comparativa fiable sin datos de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion sobre sesgos especificos, pero al estar entrenado en BERT-tiny, su capacidad de generalizacion es limitada y puede fallar en dominios o idiomas no representados en el dataset de entrenamiento.
- Riesgo de alucinacion: al ser un modelo de clasificacion, no genera texto, por lo que no sufre alucinaciones en el sentido generativo, pero puede cometer errores de clasificacion con falsos positivos o negativos.
- Limitaciones de contexto: la longitud de contexto no esta documentada, pero BERT-tiny tipicamente soporta 512 tokens; textos mas largos deberan truncarse, lo que puede afectar la precision en documentos extensos.
- Limitaciones de idioma: no se especifican idiomas soportados; el dataset RAID es principalmente en ingles, por lo que el rendimiento en otros idiomas es incierto.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero no se garantiza la precision ni la ausencia de sesgos en produccion.
- Caveat para produccion: la cuantizacion dinamica INT8/UINT8 puede degradar ligeramente la precision respecto al modelo FP32; es recomendable validar el rendimiento en el dataset de destino antes de desplegar.

## Enlaces

- [Modelo en HuggingFace (INT8/UINT8)](https://huggingface.co/ketiswp/onnx-community-BERT-tiny-RAID-int8-uint8-onnx)
- [Version FP32 del mismo modelo](https://huggingface.co/ketiswp/onnx-community-BERT-tiny-RAID-fp32-onnx)
- [Modelo original BERT-tiny-RAID](https://huggingface.co/ShantanuT01/BERT-tiny-RAID/tree/cbc7e63d4749e8a84f2f07d23576639ef979d6fa)
- [Modelo ONNX de la comunidad (referencia)](https://huggingface.co/onnx-community/BERT-tiny-RAID-ONNX)
