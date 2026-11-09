# lieberlee/annotune-qwen3.5-4b-gguf

## Resumen

annotune-qwen3.5-4b-gguf es un paquete de adaptadores LoRA publicados por el usuario lieberlee sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos base en formato GGUF (cuantizacion Q6_K) acompanada de dos adaptadores LoRA independientes, uno orientado a la tarea de "name" y otro a la tarea de "ml", cada uno con su version en GGUF (f16) y en formato PEFT (safetensors). El modelo base es un transformer denso de 4.326.350.848 parametros desarrollado por Alibaba Qwen.

La relevancia de esta publicacion es acotada y de caracter experimental: se marca explicitamente como "preview release", no acumula descargas ni likes, y no incluye model card descriptiva sobre datos de entrenamiento, capacidades o evaluacion. Su interes practico reside en que demuestra un flujo de trabajo reproducible para empaquetar un modelo base cuantizado junto con adaptadores LoRA en GGUF y cargarlos directamente con llama.cpp mediante el flag `--lora`, sin necesidad de fusionar pesos.

El contexto declarado del modelo base Qwen3.5-4B no aparece en la informacion proporcionada, por lo que se indica como no disponible en la tabla de especificaciones. Toda la informacion tecnica verificable procede de los metadatos del repositorio y del contenido del README, que se limita a listar ficheros, checksums SHA256 e instrucciones de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-4B; presumiblemente transformer denso, sin confirmar en la informacion) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (base GGUF) y f16 (adaptadores LoRA GGUF); adaptadores PEFT en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT), GGUF (base Q6_K y LoRA f16) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.5-4B en los materiales proporcionados: no se detalla si emplea atencion completa, atencion lineal, mezcla de expertos o alguna variante hibrida. El recuento de parametros (4.326 millones) corresponde a los pesos safetensors del repositorio base referenciado.

Respecto al entrenamiento, el repositorio no documenta el dataset, el numero de tokens, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Lo unico verificable es la existencia de dos adaptadores LoRA con nombres internos que sugieren checkpoints intermedios de un proceso de anotacion o ajuste: `annotune-v9h-name-checkpoint-412` y `annotune-v9e-ml-checkpoint-231`. Ambos adaptadores tienen un tamano identico de 84.952.864 bytes en GGUF f16 y 169.907.160 bytes en safetensors PEFT, lo que sugiere una configuracion de rango y modulos objetivo equivalente entre ambos. No se especifica el rango (r), alpha ni los modulos a los que se aplican.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el paquete esta pensado para uso de chat, aunque no se documentan capacidades especificas.
- Ajuste por tarea mediante LoRA: se distribuyen dos adaptadores separados ("name" y "ml") que pueden cargarse de forma selectiva o combinada con llama.cpp.
- Carga dinamica de adaptadores: el flujo documentado permite usar el modelo base con uno de los LoRA sin fusionar pesos, lo que facilita alternar entre adaptadores.
- Compatibilidad con llama.cpp: soporte nativo mediante `llama-cli` y `llama-server`, lo que habilita despliegue local y en servidor.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion.

## Casos de uso

- Evaluacion de adaptadores LoRA en local: un investigador puede cargar el base Q6_K con cada adaptador y comparar respuestas entre `name` y `ml` para decidir cual conservar, gracias a que ambos se distribuyen en el mismo repositorio y con checksums verificables.
- Despliegue de un asistente especializado en anotacion: el adaptador `name` parece orientado a tareas de etiquetado o normalizacion de nombres; puede servirse con `llama-server` para preanotar registros antes de la revision humana.
- Preprocesado de datos para ML: el adaptador `ml` puede emplearse para tareas auxiliares de clasificacion o extraccion dentro de un pipeline de preparacion de datasets, ejecutandose en CPU o GPU modesta gracias al formato GGUF.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: con 3,56 GB para el base Q6_K, el paquete cabe en equipos con 8 GB de RAM y permite iterar sobre prompts y adaptadores sin infraestructura de servidor.
- Integracion en herramientas de linea de comandos: el uso de `llama-cli` con `--lora` facilita incorporar el modelo en scripts de shell para tareas batch de generacion o reescritura de texto.
- Base para experimentos de mezcla de adaptadores: al disponer de dos LoRA en formato GGUF f16, es posible experimentar con la carga combinada o con la fusion de pesos para estudiar el efecto en tareas de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para el base Q6_K: aproximadamente 3,56 GB solo para los pesos; con overhead de contexto y cache KV, se recomienda un minimo de 5-6 GB de memoria disponible.
- Adaptadores LoRA: cada uno ocupa unos 85 MB en GGUF f16, por lo que la carga simultanea de ambos anade unos 170 MB.
- GPU recomendadas: no se especifican en la informacion; por tamano, el modelo es apto para GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y para GPU de datacenter (A100, H100) sin necesidad de ellas.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas de VRAM; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`). No se documenta compatibilidad con vLLM, TGI u Ollama, aunque el formato GGUF es compatible con Ollama en principio.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| annotune-qwen3.5-4b-gguf | 4.326 M | no disponible | apache-2.0 | GGUF + safetensors (LoRA) | Paquete base + 2 LoRA, preview, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | 4.326 M | no disponible | apache-2.0 | safetensors | Modelo original sin adaptadores ni cuantizar |
| Otros modelos de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

La unica comparacion sustentada por los datos es con el propio modelo base Qwen3.5-4B, del que este repositorio es una redistribucion cuantizada con adaptadores anadidos. No se dispone de informacion sobre alternativas de la misma categoria (por ejemplo, otros modelos de 4B ajustados con LoRA) que permita una comparativa de rendimiento.

## Limitaciones y advertencias

- Publicacion en estado "preview": el autor la marca como vista previa, sin garantia de estabilidad ni soporte.
- Ausencia total de documentacion: no hay model card con datos de entrenamiento, evaluacion, sesgos o limitaciones, lo que impide validar su calidad de forma objetiva.
- Sin benchmarks: no existen resultados publicados que permitan comparar su rendimiento con alternativas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y no cuantificado en la informacion.
- Sesgos: no documentados; al desconocerse el dataset de ajuste de los LoRA, no puede evaluarse el sesgo introducido por el adaptador.
- Idiomas: no se especifica que idiomas cubre el ajuste; el modelo base Qwen tiene cobertura multilingue conocida, pero el efecto de los LoRA sobre otros idiomas es desconocido.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero se remite a la licencia del modelo base Qwen3.5-4B, que conviene verificar por si impone condiciones adicionales.
- Reproducibilidad: se proporcionan checksums SHA256 de todos los ficheros, lo que permite verificar integridad, pero no se documenta el proceso de entrenamiento de los adaptadores.
- Contexto: al no conocerse la longitud de contexto del base, no puede garantizarse el comportamiento en conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lieberlee/annotune-qwen3.5-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- llama.cpp (herramienta de carga documentada): https://github.com/ggerganov/llama.cpp
